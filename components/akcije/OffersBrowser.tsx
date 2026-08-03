'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { formatPrice, mnozina, najnovijaTura, poSvjezini } from '@/lib/akcije/format';
import { kategorijaNaziv } from '@/lib/akcije/kategorije';
import { EMPTY_FILTERS, type Filters, type SortKey } from '@/lib/akcije/types';
import { useFacets, useOffers } from '@/lib/akcije/useOffers';
import FilterSheet from './FilterSheet';
import OfferCard from './OfferCard';
import { usePlz } from './PlzProvider';
import StoreLogo from './StoreLogo';
import { IconBack, IconFilter } from './icons';

/** Deep link / PWA: ako nema historije, "nazad" vodi na /akcije umjesto van sajta. */
function useNazad() {
  const router = useRouter();
  return useCallback(() => {
    if (typeof window !== 'undefined' && window.history.length > 1) router.back();
    else router.push('/akcije');
  }, [router]);
}

interface Props {
  title: string;
  /** kad je zadan, prikazuju se samo ponude te prodavnice */
  storeSlug?: string;
  storeName?: string;
  initial?: Partial<Omit<Filters, 'plz'>>;
  /** otvori filter-sheet odmah pri učitavanju (npr. dolazak s dugmeta „Filteri") */
  openFilters?: boolean;
  /**
   * Dolazak s trake „Top ponude danas": naslov ostaje „Top ponude danas"
   * SAMO dok stoji filter ≥30% — čim ga korisnik skine, ovo je opet
   * obična lista i naslov se vraća na „Sve akcije".
   */
  topMode?: boolean;
}

/**
 * Zajednicki prikaz liste ponuda: kategorijski chipovi + grid + bottom sheet
 * sa svim filterima. Koristi ga i /ponude i /prodavnica/[slug].
 */
export default function OffersBrowser({ title, storeSlug, storeName, initial, openFilters, topMode }: Props) {
  const { plz, ready } = usePlz();
  const router = useRouter();
  const nazad = useNazad();
  const [state, setState] = useState<Omit<Filters, 'plz'>>({
    ...EMPTY_FILTERS,
    ...initial,
    store: storeSlug ?? initial?.store ?? '',
  });
  const [sheetOpen, setSheetOpen] = useState(Boolean(openFilters));
  // "Prikaži još": umjesto tvrdog reza na 300 ("piše 412, vidi se 300"),
  // svaki klik podiže limit — bez ikakve promjene na API-ju.
  const [limit, setLimit] = useState(300);

  // KLIK „POGLEDAJ SVE" SA VEĆ POSJEĆENE LISTE — pravi uzrok „baci me na
  // sve ponude kao ranije": Next-ov ruter NE remountuje stranicu kad se
  // promijene samo parametri u URL-u, pa useState zadrži STARE filtere iz
  // prošle posjete (bez ≥30%). Zato: kad filteri iz URL-a stvarno postanu
  // drugačiji od stanja (dolazak izvana), preuzmi ih. Naš vlastiti upis
  // stanja u URL proizvodi identične vrijednosti, pa se ne vrti u krug.
  const initialKljuc = JSON.stringify(initial ?? {});
  useEffect(() => {
    setState({
      ...EMPTY_FILTERS,
      ...(initial ?? {}),
      store: storeSlug ?? initial?.store ?? '',
    });
    setLimit(300);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialKljuc, storeSlug]);

  // Prije nego što se sazna snimljeni PLZ, ne šalje se NIŠTA — ranije je
  // prvi render uvijek povukao podatke za 85737 pa ih bacio (bljesak +
  // uzaludan zahtjev za svakog korisnika van Ismaninga).
  const aktivniPlz = ready ? plz : '';
  const filters: Filters = useMemo(() => ({ ...state, plz: aktivniPlz }), [state, aktivniPlz]);
  const { items, total, loading, error } = useOffers(filters, limit);
  const { stores, categories } = useFacets(aktivniPlz, storeSlug);

  // Filteri žive i u URL-u: "nazad" sa artikla vraća ISTE filtere (ranije se
  // sve resetovalo), a stanje se može podijeliti linkom. `replace` umjesto
  // `push` da svaki dodir filtera ne puni historiju pregledača.
  // Mala zadrška (250ms) da kucanje u pretragu ne gađa ruter svakim slovom.
  useEffect(() => {
    const tajmer = setTimeout(() => {
      const qs = new URLSearchParams();
      if (!storeSlug && state.store) qs.set('store', state.store);
      if (state.category) qs.set('category', state.category);
      if (state.percent) qs.set('percent', String(state.percent));
      if (state.savings) qs.set('savings', String(state.savings));
      if (state.q) qs.set('q', state.q);
      if (state.sort !== 'percent') qs.set('sort', state.sort);
      if (topMode && state.percent >= 30) qs.set('top', '1');
      const next = qs.toString();
      const trenutni = window.location.search.replace(/^\?/, '');
      if (next !== trenutni) {
        router.replace(`${window.location.pathname}${next ? `?${next}` : ''}`, { scroll: false });
      }
    }, 250);
    return () => clearTimeout(tajmer);
  }, [state, storeSlug, topMode, router]);

  const patch = useCallback((next: Partial<Filters>) => {
    setState((previous) => ({ ...previous, ...next, ...(storeSlug ? { store: storeSlug } : {}) }));
  }, [storeSlug]);

  const activeCount =
    (state.store && !storeSlug ? 1 : 0) +
    (state.category ? 1 : 0) +
    (state.percent ? 1 : 0) +
    (state.savings ? 1 : 0) +
    (state.q ? 1 : 0);

  const bestSaving = items.reduce((max, item) => Math.max(max, item.savings ?? 0), 0);
  const angebotCount = items.filter((item) => item.discount_percent === null).length;

  // Najsvježija tura ponuda — nosi NOVO oznake.
  const tura = najnovijaTura(items.filter((i) => i.discount_percent !== null));
  // U topMode-u lista ide DAN PO DAN: današnja tura gore, pa jučerašnja, pa
  // prekjučerašnja — a unutar svakog dana po najvećem popustu. Ništa se ne
  // izbacuje, samo se stariji dani guraju niže.
  // (Ranije su bile samo DVIJE grupe: tura + sve ostalo pomiješano po
  //  procentu, pa je ponuda od prošle sedmice s većim popustom skakala
  //  iznad jučerašnje.)
  const prikaz = topMode ? poSvjezini(items) : items;

  return (
    <>
      <div className="pagetop">
        <button type="button" className="back" aria-label="Nazad" onClick={nazad}>
          <IconBack />
        </button>
        {storeSlug && storeName ? (
          <StoreLogo slug={storeSlug} name={storeName} size="md" />
        ) : null}
        <h1>{topMode ? (state.percent >= 30 ? 'Top ponude danas' : 'Sve akcije') : title}</h1>
        <button
          type="button"
          className={`icon-btn${activeCount > 0 ? ' on' : ''}`}
          aria-label={`Filteri${activeCount > 0 ? ` (${activeCount} aktivnih)` : ''}`}
          onClick={() => setSheetOpen(true)}
        >
          <IconFilter />
        </button>
      </div>

      <div className="srch">
        <input
          type="search"
          value={state.q}
          placeholder="Pretraži artikle — npr. kafa, deterdžent…"
          aria-label="Pretraga artikala"
          onChange={(event) => patch({ q: event.target.value })}
        />
      </div>

      <div className="chips">
        <button
          type="button"
          className="chip"
          aria-pressed={state.category === ''}
          onClick={() => patch({ category: '' })}
        >
          Sve
        </button>
        {categories.map((category) => (
          <button
            key={category.category}
            type="button"
            className="chip"
            aria-pressed={state.category === category.category}
            onClick={() => patch({ category: category.category })}
          >
            {kategorijaNaziv(category.category)}
          </button>
        ))}
      </div>

      <div className="summary">
        <b>{loading && items.length === 0 ? 'Učitavam…' : mnozina(total, 'artikal', 'artikla', 'artikala')}</b>
        <span className="dot" />
        <span>PLZ {plz}</span>
        {state.percent > 0 ? (
          <>
            <span className="dot" />
            <span>popust ≥ {state.percent}%</span>
          </>
        ) : null}
        {state.savings > 0 ? (
          <>
            <span className="dot" />
            <span>ušteda ≥ {state.savings} €</span>
          </>
        ) : null}
        {state.q ? (
          <>
            <span className="dot" />
            <span>„{state.q}“</span>
          </>
        ) : null}
        {bestSaving > 0 ? (
          <>
            <span className="dot" />
            <span>najveća ušteda {formatPrice(bestSaving)}</span>
          </>
        ) : null}
        {angebotCount > 0 ? (
          <>
            <span className="dot" />
            <span>{angebotCount}× Angebot</span>
          </>
        ) : null}
      </div>

      {error ? (
        <div className="state">
          <h2>Nema veze sa serverom</h2>
          <p>{error}</p>
        </div>
      ) : loading && items.length === 0 ? (
        <div className="grid">
          {Array.from({ length: 8 }, (_, index) => (
            <div className="skel" key={index} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="state">
          <h2>Nema rezultata</h2>
          <p>
            Sa ovim filterima nema artikala. Probaj smanjiti procent popusta ili očistiti filtere.
          </p>
          <button
            type="button"
            className="btn"
            onClick={() => patch({ ...EMPTY_FILTERS, sort: state.sort as SortKey })}
          >
            Očisti filtere
          </button>
        </div>
      ) : (
        <>
          <div className="grid" style={{ opacity: loading ? 0.55 : 1, transition: 'opacity .15s' }}>
            {prikaz.map((item) => (
              <OfferCard key={item.id} item={item} hideStore={Boolean(storeSlug)} turaOd={tura} />
            ))}
          </div>
          {items.length < total ? (
            <button
              type="button"
              className="btn btn-ghost"
              style={{ marginTop: 14 }}
              onClick={() => setLimit((prethodni) => prethodni + 300)}
            >
              Prikaži još ({total - items.length})
            </button>
          ) : null}
        </>
      )}

      {sheetOpen ? (
        <FilterSheet
          filters={filters}
          stores={stores}
          categories={categories}
          showStores={!storeSlug}
          onChange={patch}
          onClose={() => setSheetOpen(false)}
        />
      ) : null}
    </>
  );
}

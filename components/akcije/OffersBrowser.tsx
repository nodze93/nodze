'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { formatPrice } from '@/lib/akcije/format';
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
}

/**
 * Zajednicki prikaz liste ponuda: kategorijski chipovi + grid + bottom sheet
 * sa svim filterima. Koristi ga i /ponude i /prodavnica/[slug].
 */
export default function OffersBrowser({ title, storeSlug, storeName, initial, openFilters }: Props) {
  const { plz } = usePlz();
  const nazad = useNazad();
  const [state, setState] = useState<Omit<Filters, 'plz'>>({
    ...EMPTY_FILTERS,
    ...initial,
    store: storeSlug ?? initial?.store ?? '',
  });
  const [sheetOpen, setSheetOpen] = useState(Boolean(openFilters));

  const filters: Filters = useMemo(() => ({ ...state, plz }), [state, plz]);
  const { items, total, loading, error } = useOffers(filters);
  const { stores, categories } = useFacets(plz, storeSlug);

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

  return (
    <>
      <div className="pagetop">
        <button type="button" className="back" aria-label="Nazad" onClick={nazad}>
          <IconBack />
        </button>
        {storeSlug && storeName ? (
          <StoreLogo slug={storeSlug} name={storeName} size="md" />
        ) : null}
        <h1>{title}</h1>
        <button
          type="button"
          className={`icon-btn${activeCount > 0 ? ' on' : ''}`}
          aria-label={`Filteri${activeCount > 0 ? ` (${activeCount} aktivnih)` : ''}`}
          onClick={() => setSheetOpen(true)}
        >
          <IconFilter />
        </button>
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
        <b>{loading && items.length === 0 ? 'Učitavam…' : `${total} artikala`}</b>
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
        <div className="grid" style={{ opacity: loading ? 0.55 : 1, transition: 'opacity .15s' }}>
          {items.map((item) => (
            <OfferCard key={item.id} item={item} hideStore={Boolean(storeSlug)} />
          ))}
        </div>
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

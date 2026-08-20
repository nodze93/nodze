'use client';

import Link from 'next/link';
import { favoriteKey, useFavorites } from '@/lib/akcije/favorites';
import { danasIso, formatPercent, formatPrice, formatShortDate } from '@/lib/akcije/format';
import { kategorijaNaziv } from '@/lib/akcije/kategorije';
import type { Discount } from '@/lib/akcije/types';
import ProductImage from './ProductImage';
import StoreLogo from './StoreLogo';
import { IconHeart } from './icons';

interface Props {
  item: Discount;
  /** true na stranici prodavnice - tamo ime prodavnice ne treba ponavljati */
  hideStore?: boolean;
  /**
   * "rail" = uzana kartica u horizontalnoj traci na naslovnoj (3 stanu u ekran),
   *  cijene su jedna pod drugom jer nema sirine za jednu liniju.
   * "grid" = kartica u mrezi (2 kolone), cijene lijevo/desno.
   */
  variant?: 'rail' | 'grid';
  /**
   * Datum najsvježije „ture" ponuda u listi (najnovijaTura() iz format.ts).
   * Kartica čiji valid_from = tura nosi NOVO — i zadrži je u utorak/srijedu,
   * dok ne stigne svježija tura. Bez ovog propa: NOVO samo za strogo danas.
   */
  turaOd?: string | null;
  /**
   * Samo u traci „Najniže do sada": najniža cijena koju smo MI ranije
   * zabilježili za taj artikal kod tog lanca (`ak_price_observations`).
   *
   * NIJE stara cijena s police i NE smije se prikazati kao popust —
   * zato ide kao mala zelena linija ispod cijene, bez procenta i bez
   * precrtavanja. Ako cijena nije stvarno pala (danas = raniji minimum),
   * linija se ne prikazuje uopšte.
   */
  ranijeNajnize?: number | null;
}

export default function OfferCard({
  item,
  hideStore = false,
  variant = 'grid',
  turaOd,
  ranijeNajnize = null,
}: Props) {
  const { has, toggle } = useFavorites();
  const key = favoriteKey(item);
  const favorite = has(key);
  const validTo = formatShortDate(item.valid_to);
  const rail = variant === 'rail';

  // Naša ranija najniža — pokazujemo je SAMO ako je cijena stvarno pala.
  // Sedmični letak drži isti artikal po istoj cijeni cijelu sedmicu, pa bi
  // inače pisalo „ranije 2,99 €" pored „2,99 €" i izgledalo pokvareno.
  const rekordBroj = ranijeNajnize === null ? NaN : Number(ranijeNajnize);
  const rekord =
    Number.isFinite(rekordBroj) && rekordBroj > item.new_price ? rekordBroj : null;

  // Na stranici jedne prodavnice nema donjeg reda (kao na dizajnu) - kartica
  // je niza, pa u ekran stane 6 artikala.
  const showFooter = rail || !hideStore;

  // NOVO = pripada najsvježijoj turi ponuda (ako je lista dala turu),
  // inače strogo „počinje danas". Tura traje dok ne stigne svježija.
  const novo =
    turaOd !== undefined
      ? turaOd !== null && item.valid_from === turaOd
      : item.valid_from === danasIso();

  return (
    <article className={`card${rail ? ' card-rail' : ''}`}>
      {item.discount_percent !== null ? (
        <span className="badge-pct">{formatPercent(item.discount_percent)}</span>
      ) : (
        // Prodavnica ne objavljuje staru cijenu -> "Angebot".
        // Takav artikal ne ulazi u filtere po procentu i ustedi.
        <span className="badge-ang">Angebot</span>
      )}
      {novo ? <span className="badge-novo">NOVO</span> : null}

      <button
        type="button"
        className={`heart${favorite ? ' on' : ''}`}
        aria-label={favorite ? 'Izbaci iz favorita' : 'Dodaj u favorite'}
        aria-pressed={favorite}
        onClick={() => toggle(key)}
      >
        <IconHeart size={rail ? 15 : 17} filled={favorite} />
      </button>

      <Link href={`/akcije/ponuda/${item.id}`} className="thumb">
        <ProductImage
          imageUrl={item.image_url}
          category={item.category}
          productName={item.product_name}
          artSize={rail ? 76 : 96}
        />
      </Link>

      <div className="card-body">
        <Link href={`/akcije/ponuda/${item.id}`}>
          <h3 className="pname">{item.product_name}</h3>
        </Link>

        <div className="prow">
          {item.old_price !== null ? (
            <span className="p-old">
              {formatPrice(item.old_price)}
              {item.rabatt_quelle === 'berechnet' ? <sup className="calc-star">*</sup> : null}
            </span>
          ) : (
            <span className="p-old" style={{ textDecoration: 'none' }}>
              Akcija
            </span>
          )}
          <span className={`p-new${item.discount_percent === null ? ' plain' : ''}`}>
            {formatPrice(item.new_price)}
          </span>
        </div>

        {rekord !== null ? (
          <div className="p-rekord" title={`Najniže što smo za ovaj artikal vidjeli kod ${item.store}`}>
            ↓ ranije {formatPrice(rekord)}
          </div>
        ) : null}

        {showFooter ? (
          <div className="card-meta">
            {hideStore ? null : <StoreLogo slug={item.store_slug} name={item.store} size="sm" />}
            {/* u uzanoj kartici nema mjesta za ime prodavnice - logo ga vec kaze */}
            {/* U mreži ime prodavnice NE pišemo pored pločice — na telefonu
                (kartica ~165px) je "KAU Kaufla… Važi do 05.…" sjeklo i ime i
                DATUM. Pločica već kaže ko je; puni naziv je na detalju. */}
            {rail || !hideStore ? null : <span>{kategorijaNaziv(item.category) || '—'}</span>}
            {validTo ? (
              <span style={{ marginLeft: 'auto' }}>{rail ? `do ${validTo}` : `Važi do ${validTo}`}</span>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}

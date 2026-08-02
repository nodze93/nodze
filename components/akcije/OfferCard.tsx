'use client';

import Link from 'next/link';
import { favoriteKey, useFavorites } from '@/lib/akcije/favorites';
import { formatPercent, formatPrice, formatShortDate } from '@/lib/akcije/format';
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
  /** ponuda počinje DANAS — dobija zelenu oznaku „NOVO" */
  novo?: boolean;
}

export default function OfferCard({ item, hideStore = false, variant = 'grid', novo = false }: Props) {
  const { has, toggle } = useFavorites();
  const key = favoriteKey(item);
  const favorite = has(key);
  const validTo = formatShortDate(item.valid_to);
  const rail = variant === 'rail';

  // Na stranici jedne prodavnice nema donjeg reda (kao na dizajnu) - kartica
  // je niza, pa u ekran stane 6 artikala.
  const showFooter = rail || !hideStore;

  return (
    <article className={`card${rail ? ' card-rail' : ''}`}>
      {item.discount_percent !== null ? (
        <span className="badge-pct">{formatPercent(item.discount_percent)}</span>
      ) : (
        // Prodavnica ne objavljuje staru cijenu -> "Angebot".
        // Takav artikal ne ulazi u filtere po procentu i ustedi.
        <span className="badge-ang">Angebot</span>
      )}

      {/* Oznaka stoji uz srce (gore desno) da ne pokrije badge popusta lijevo. */}
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

        {showFooter ? (
          <div className="card-meta">
            {hideStore ? null : <StoreLogo slug={item.store_slug} name={item.store} size="sm" />}
            {/* u uzanoj kartici nema mjesta za ime prodavnice - logo ga vec kaze */}
            {rail ? null : <span>{hideStore ? (item.category ?? '—') : item.store}</span>}
            {validTo ? (
              <span style={{ marginLeft: 'auto' }}>{rail ? `do ${validTo}` : `Važi do ${validTo}`}</span>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}

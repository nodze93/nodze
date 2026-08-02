'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { usePlz } from '@/components/akcije/PlzProvider';
import ProductImage from '@/components/akcije/ProductImage';
import StoreLogo from '@/components/akcije/StoreLogo';
import {
  IconBack,
  IconCalendar,
  IconChevron,
  IconHeart,
  IconShare,
  IconStock,
  IconStore,
  IconTag,
} from '@/components/akcije/icons';
import { api } from '@/lib/akcije/api';
import { favoriteKey, useFavorites } from '@/lib/akcije/favorites';
import { daysLeftLabel, formatLongDate, formatPercent, formatPrice } from '@/lib/akcije/format';
import type { Discount } from '@/lib/akcije/types';

/** Deep link / PWA: ako nema historije, "nazad" vodi na /akcije umjesto van sajta. */
function useNazad() {
  const router = useRouter();
  return useCallback(() => {
    if (typeof window !== 'undefined' && window.history.length > 1) router.back();
    else router.push('/akcije');
  }, [router]);
}

export default function PonudaKlijent() {
  const params = useParams<{ id: string }>();
  const id = String(params.id ?? '');
  const nazad = useNazad();
  const { plz } = usePlz();
  const { has, toggle } = useFavorites();

  const [item, setItem] = useState<Discount | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shared, setShared] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    api
      .discount(id)
      .then((data) => {
        if (active) setItem(data);
      })
      .catch((err: Error) => {
        if (active) setError(err.message);
      });
    return () => {
      active = false;
    };
  }, [id]);

  const share = async () => {
    const url = window.location.href;
    const text = item ? `${item.product_name} — ${formatPrice(item.new_price)} u ${item.store}` : '';
    try {
      if (navigator.share) {
        await navigator.share({ title: item?.product_name, text, url });
        return;
      }
      await navigator.clipboard.writeText(`${text} ${url}`);
      setShared('Link kopiran.');
    } catch {
      setShared('Dijeljenje nije uspjelo.');
    }
  };

  if (error) {
    return (
      <>
        <div className="pagetop">
          <button type="button" className="back" aria-label="Nazad" onClick={nazad}>
            <IconBack />
          </button>
          <h1>Detalj ponude</h1>
        </div>
        <div className="state">
          <h2>Ponuda nije dostupna</h2>
          <p>
            {error}. Ponude se osvježavaju svaki dan, pa je moguće da je ova iz starijeg dana i da je
            zamijenjena novom.
          </p>
          <Link href="/akcije/ponude" className="btn">
            Sve aktuelne akcije
          </Link>
        </div>
      </>
    );
  }

  if (!item) {
    return (
      <>
        <div className="pagetop">
          <button type="button" className="back" aria-label="Nazad" onClick={nazad}>
            <IconBack />
          </button>
          <h1>Detalj ponude</h1>
        </div>
        <div className="skel" style={{ height: 232, marginTop: 14 }} />
      </>
    );
  }

  const key = favoriteKey(item);
  const favorite = has(key);
  const validity = daysLeftLabel(item.valid_to);

  return (
    <>
      <div className="pagetop">
        <button type="button" className="back" aria-label="Nazad" onClick={nazad}>
          <IconBack />
        </button>
        <h1>Detalj ponude</h1>
        <button
          type="button"
          className={`icon-btn${favorite ? ' on' : ''}`}
          aria-label={favorite ? 'Izbaci iz favorita' : 'Dodaj u favorite'}
          aria-pressed={favorite}
          onClick={() => toggle(key)}
        >
          <IconHeart filled={favorite} />
        </button>
      </div>

      <div className="detail-hero">
        <StoreLogo slug={item.store_slug} name={item.store} size="md" />
        {item.discount_percent !== null ? (
          <span className="badge-pct">{formatPercent(item.discount_percent)}</span>
        ) : (
          <span className="badge-ang">Angebot</span>
        )}
        <ProductImage
          imageUrl={item.image_url}
          category={item.category}
          productName={item.product_name}
          artSize={214}
        />
        {item.image_exact === false ? (
          // Napomena stoji U OKVIRU slike, kao na pravim njemackim letcima:
          // Nutella 250 g i 750 g nisu ista tegla, pa fotografija nije tacna.
          <span className="img-note">Abbildung ähnlich</span>
        ) : null}
        {item.image_attribution ? (
          <span className="img-credit">{item.image_attribution}</span>
        ) : null}
      </div>

      <h2 className="h-title">{item.product_name}</h2>
      <p className="h-sub">
        {item.store}
        {item.category ? ` · ${item.category}` : ''}
      </p>

      <div className="pricebox">
        {item.old_price !== null ? (
          <>
            <div>
              <p className="lab">Redovna cijena</p>
              <span className="v-old">{formatPrice(item.old_price)}</span>
            </div>
            <span className="sep" />
            <div style={{ textAlign: 'right' }}>
              <p className="lab">Akcijska cijena</p>
              <span className="v-new">{formatPrice(item.new_price)}</span>
            </div>
            <p className="saveline">
              Ušteda: {formatPrice(item.savings ?? 0)} ({Math.round(item.discount_percent ?? 0)}%)
            </p>
            {item.rabatt_quelle === 'berechnet' ? (
              <p className="calc-inline">
                Naš pregled: najniža cijena u {item.store} u 30 dana &mdash; nije zvanična akcija.
              </p>
            ) : null}
          </>
        ) : (
          <>
            <div style={{ gridColumn: '1 / -1' }}>
              <p className="lab">Akcijska cijena</p>
              <span className="v-new">{formatPrice(item.new_price)}</span>
            </div>
            <p className="saveline warn">
              Ova prodavnica ne objavljuje staru cijenu, pa se procent i ušteda ne mogu izračunati.
              Artikal je zato „Angebot“ i ne ulazi u filtere po procentu i ušteđi.
            </p>
          </>
        )}
      </div>

      <div className="meta-list">
        {item.valid_to ? (
          <div className="meta-row">
            <IconCalendar size={19} />
            Važi do
            <b>
              {formatLongDate(item.valid_to)}
              {validity ? ` (${validity})` : ''}
            </b>
          </div>
        ) : null}
        <Link href={`/akcije/prodavnica/${item.store_slug}`} className="meta-row">
          <IconStore size={19} />
          Trgovina
          <b>
            {item.store} <IconChevron size={13} style={{ verticalAlign: -2 }} />
          </b>
        </Link>
        {item.category ? (
          <Link href={`/akcije/ponude?category=${encodeURIComponent(item.category)}`} className="meta-row">
            <IconTag size={19} />
            Kategorija
            <b>
              {item.category} <IconChevron size={13} style={{ verticalAlign: -2 }} />
            </b>
          </Link>
        ) : null}
        <div className="meta-row">
          <IconStock size={19} />
          Dostupnost
          <b>Dok traju zalihe</b>
        </div>
      </div>

      <div className="detail-actions">
        <button type="button" className="btn" onClick={share}>
          <IconShare size={19} /> Podijeli
        </button>
        <Link href={`/akcije/prodavnica/${item.store_slug}`} className="btn btn-ghost">
          Sve akcije u {item.store}
        </Link>
      </div>

      {shared ? <p className="note">{shared}</p> : null}
    </>
  );
}

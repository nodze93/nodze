'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import OfferCard from '@/components/akcije/OfferCard';
import { usePlz } from '@/components/akcije/PlzProvider';
import PlzSheet from '@/components/akcije/PlzSheet';
import Recommendation from '@/components/akcije/Recommendation';
import StoreStrip from '@/components/akcije/StoreStrip';
import { IconCart, IconChevron, IconStar } from '@/components/akcije/icons';
import { formatPrice } from '@/lib/akcije/format';
import type { Filters } from '@/lib/akcije/types';
import { useFacets, useOffers } from '@/lib/akcije/useOffers';

export default function HomePage() {
  const { plz, ready } = usePlz();
  const [plzOpen, setPlzOpen] = useState(false);

  const filters: Filters = useMemo(
    () => ({ plz, store: '', category: '', percent: 0, savings: 0, q: '', sort: 'percent' }),
    [plz],
  );

  const { items, total, loading, error } = useOffers(filters);
  const { stores } = useFacets(plz);

  // "Top ponude danas" = najveći popusti. Prikaži one ≥30% (fallback: top 12
  // po popustu ako ih je malo taj dan) → traka je uvijek puna i stvarno "top".
  const jakiPopust = items.filter((i) => (i.discount_percent ?? 0) >= 30);
  const top = (jakiPopust.length >= 8 ? jakiPopust : items).slice(0, 12);
  // Ispod: NAREDNE ponude koje NISU u "Top" (da se lista ne ponavlja).
  const topIds = new Set(top.map((t) => t.id));
  const rest = items.filter((i) => !topIds.has(i.id)).slice(0, 12);
  const bestSaving = items.reduce((max, item) => Math.max(max, item.savings ?? 0), 0);

  return (
    <>
      <section className="hero">
        <span className="hero-ico">
          <IconCart size={24} />
        </span>
        <div>
          <h1>Akcije danas</h1>
          <p>
            Najbolje ponude iz njemačkih trgovina na jednom mjestu.{' '}
            <button
              type="button"
              onClick={() => setPlzOpen(true)}
              style={{
                background: 'none',
                border: 0,
                padding: 0,
                font: 'inherit',
                fontWeight: 700,
                color: 'var(--brand)',
                cursor: 'pointer',
              }}
            >
              PLZ {plz}
            </button>
          </p>
        </div>
      </section>

      <StoreStrip stores={stores} />

      <section className="sec">
        <div className="sec-hd">
          <h2>
            <IconStar size={17} style={{ color: '#f5a524' }} /> Top ponude danas
          </h2>
          {/* `top=1` samo da odredišna stranica zna da nosi naslov „Top ponude
              danas" (ne „Sve akcije") — korisnik je došao s te trake. */}
          <Link href="/akcije/ponude?percent=30&top=1">
            Pogledaj sve <IconChevron size={13} style={{ verticalAlign: -2 }} />
          </Link>
        </div>

        {error ? (
          <div className="state">
            <h2>Nema veze sa serverom</h2>
            <p>{error}</p>
          </div>
        ) : loading && items.length === 0 ? (
          <div className="rail">
            {Array.from({ length: 4 }, (_, index) => (
              <div className="skel" key={index} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="state">
            <h2>Za PLZ {plz} još nema podataka</h2>
            <p>
              Scraper za ovaj poštanski broj još nije pokrenut. Probaj drugu lokaciju — npr. 85737,
              80331 ili 10115.
            </p>
            <button type="button" className="btn" onClick={() => setPlzOpen(true)}>
              Promijeni lokaciju
            </button>
          </div>
        ) : (
          <div className="rail">
            {top.map((item) => (
              <OfferCard key={item.id} item={item} variant="rail" />
            ))}
          </div>
        )}
      </section>

      <Recommendation items={items} />

      {items.length > 0 ? (
        <>
          <section className="sec">
            <div className="sec-hd">
              <h2>Sve akcije u PLZ {plz}</h2>
              <Link href="/akcije/ponude?filteri=1">
                Filteri <IconChevron size={13} style={{ verticalAlign: -2 }} />
              </Link>
            </div>
            <div className="summary">
              <b>{total} artikala</b>
              <span className="dot" />
              <span>{stores.length} prodavnica</span>
              {bestSaving > 0 ? (
                <>
                  <span className="dot" />
                  <span>najveća ušteda {formatPrice(bestSaving)}</span>
                </>
              ) : null}
            </div>
            <div className="grid">
              {rest.map((item) => (
                <OfferCard key={`all-${item.id}`} item={item} />
              ))}
            </div>
            <Link href="/akcije/ponude" className="btn btn-ghost" style={{ marginTop: 14 }}>
              Prikaži sve ({total}) i filtriraj
            </Link>
          </section>
        </>
      ) : null}

      {!ready ? null : plzOpen ? <PlzSheet onClose={() => setPlzOpen(false)} /> : null}
    </>
  );
}

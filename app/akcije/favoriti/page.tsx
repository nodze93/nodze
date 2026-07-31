'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import OfferCard from '@/components/akcije/OfferCard';
import { usePlz } from '@/components/akcije/PlzProvider';
import { favoriteKey, useFavorites } from '@/lib/akcije/favorites';
import type { Filters } from '@/lib/akcije/types';
import { useOffers } from '@/lib/akcije/useOffers';

export default function FavoritesPage() {
  const { plz } = usePlz();
  const { keys } = useFavorites();

  const filters: Filters = useMemo(
    () => ({ plz, store: '', category: '', percent: 0, savings: 0, q: '', sort: 'percent' }),
    [plz],
  );
  const { items, loading } = useOffers(filters);

  // Favoriti se pamte po prodavnici + nazivu, pa prezive dnevni snapshot
  const favorites = items.filter((item) => keys.includes(favoriteKey(item)));

  return (
    <>
      <div className="pagetop">
        <h1>Favoriti</h1>
      </div>

      {keys.length === 0 ? (
        <div className="state">
          <h2>Još nema favorita</h2>
          <p>
            Klikni srce na bilo kojoj ponudi i tu je nađeš kasnije. Favoriti se pamte po artiklu i
            prodavnici, pa ostaju i kad se ponude sutra osvježe.
          </p>
          <Link href="/akcije/ponude" className="btn">
            Pogledaj akcije
          </Link>
        </div>
      ) : loading ? (
        <div className="grid">
          {Array.from({ length: 4 }, (_, index) => (
            <div className="skel" key={index} />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="state">
          <h2>Tvoji favoriti trenutno nisu na akciji</h2>
          <p>
            Sačuvao si {keys.length} artikala, ali ni jedan nije u aktuelnim ponudama za PLZ {plz}.
            Provjeri ponovo kad izađu novi letci.
          </p>
        </div>
      ) : (
        <>
          <div className="summary">
            <b>{favorites.length} od {keys.length} sačuvanih</b>
            <span className="dot" />
            <span>na akciji u PLZ {plz}</span>
          </div>
          <div className="grid">
            {favorites.map((item) => (
              <OfferCard key={item.id} item={item} />
            ))}
          </div>
        </>
      )}
    </>
  );
}

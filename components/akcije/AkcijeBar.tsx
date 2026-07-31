'use client';

// ============================================================
// Uska traka na vrhu /akcije/*.
//
// Original je imao svoj AppHeader sa PLZ-om, pretragom i favoritima.
// Kod nas gornji header vec postoji (components/Nav.tsx), pa ovdje
// ostaju samo dvije stvari koje kodnas header nema: odabir PLZ-a
// i prečica do favorita.
// ============================================================

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useFavorites } from '@/lib/akcije/favorites';
import PlzSheet from './PlzSheet';
import { usePlz } from './PlzProvider';
import { IconHeart, IconPin } from './icons';

export default function AkcijeBar() {
  const { plz, ready } = usePlz();
  const { count } = useFavorites();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const naFavoritima = pathname === '/akcije/favoriti';

  return (
    <>
      <div className="akbar">
        <button type="button" className="akbar-plz" onClick={() => setOpen(true)}>
          <IconPin size={15} />
          <span>PLZ {ready ? plz : '—'}</span>
        </button>

        <Link
          href={naFavoritima ? '/akcije' : '/akcije/favoriti'}
          className={`akbar-fav${naFavoritima ? ' on' : ''}`}
        >
          <IconHeart size={15} filled={count > 0} />
          <span>{naFavoritima ? 'Sve akcije' : 'Favoriti'}</span>
          {!naFavoritima && count > 0 ? <em>{count}</em> : null}
        </Link>
      </div>

      {open ? <PlzSheet onClose={() => setOpen(false)} /> : null}
    </>
  );
}

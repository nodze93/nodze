'use client';

import Link from 'next/link';
import type { StoreItem } from '@/lib/akcije/types';
import StoreLogo from './StoreLogo';

export default function StoreStrip({ stores }: { stores: StoreItem[] }) {
  if (stores.length === 0) return null;

  return (
    <div className="strip">
      {stores.map((store) => (
        <Link key={store.slug} href={`/akcije/prodavnica/${store.slug}`} className="store-tile">
          <StoreLogo slug={store.slug} name={store.name} logoUrl={store.logo_url} />
          <span className="tile-name">{store.name}</span>
          <em className="tile-count">{store.offers} akcija</em>
        </Link>
      ))}
    </div>
  );
}

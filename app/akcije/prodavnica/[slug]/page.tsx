'use client';

import { useParams } from 'next/navigation';
import OffersBrowser from '@/components/akcije/OffersBrowser';
import { usePlz } from '@/components/akcije/PlzProvider';
import { useFacets } from '@/lib/akcije/useOffers';

export default function StorePage() {
  const params = useParams<{ slug: string }>();
  const slug = String(params.slug ?? '');
  const { plz } = usePlz();
  const { stores } = useFacets(plz);

  const store = stores.find((entry) => entry.slug === slug);
  const name = store?.name ?? slug.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

  return <OffersBrowser title={name} storeSlug={slug} storeName={name} />;
}

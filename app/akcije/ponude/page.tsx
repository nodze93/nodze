'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import OffersBrowser from '@/components/akcije/OffersBrowser';
import type { SortKey } from '@/lib/akcije/types';

const SORTS: SortKey[] = ['percent', 'savings', 'price', 'name'];

function Inner() {
  const params = useSearchParams();
  const sortParam = params.get('sort');

  return (
    <OffersBrowser
      title="Sve akcije"
      openFilters={params.get('filteri') === '1'}
      initial={{
        q: params.get('q') ?? '',
        store: params.get('store') ?? '',
        category: params.get('category') ?? '',
        percent: Number(params.get('percent') ?? 0) || 0,
        savings: Number(params.get('savings') ?? 0) || 0,
        sort: SORTS.includes(sortParam as SortKey) ? (sortParam as SortKey) : 'percent',
      }}
    />
  );
}

export default function AllOffersPage() {
  return (
    <Suspense fallback={<div className="skel" style={{ marginTop: 20 }} />}>
      <Inner />
    </Suspense>
  );
}

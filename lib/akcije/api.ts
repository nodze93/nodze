// ============================================================
// Klijent za /api/akcije/* rute.
// Za razliku od originala (Fastify na :4000) ovdje je API u istoj
// aplikaciji, pa idu relativni URL-ovi - nema CORS-a ni ENV varijable.
// ============================================================

import type { CategoryItem, Discount, DiscountsResponse, Filters, Meta, StoreItem } from './types';

const BASE = '/api/akcije';

async function get<T>(
  path: string,
  params: Record<string, string | number | undefined> = {},
): Promise<T> {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    // 0 i '' znace "bez filtera" pa se ne salju
    if (value !== undefined && value !== '' && value !== 0) search.set(key, String(value));
  }
  const query = search.toString();
  const url = `${BASE}${path}${query ? `?${query}` : ''}`;

  const response = await fetch(url, { headers: { accept: 'application/json' } });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Greška u učitavanju (${response.status})`);
  }
  return response.json() as Promise<T>;
}

export const api = {
  discounts: (filters: Filters, limit = 300) =>
    get<DiscountsResponse>('/discounts', {
      plz: filters.plz,
      store: filters.store,
      category: filters.category,
      percent: filters.percent,
      savings: filters.savings,
      q: filters.q.trim().length >= 2 ? filters.q.trim() : undefined,
      sort: filters.sort,
      limit,
    }),

  discount: (id: string) => get<Discount>(`/discounts/${encodeURIComponent(id)}`),

  stores: (plz: string) => get<{ items: StoreItem[] }>('/stores', { plz }),

  categories: (plz: string, store?: string) =>
    get<{ items: CategoryItem[] }>('/categories', { plz, store }),

  meta: (plz: string) => get<Meta>('/meta', { plz }),
};

'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from './api';
import type { CategoryItem, Discount, Filters, StoreItem } from './types';

/** Ponude za date filtere. Debounce na pretragu, otkazivanje starih odgovora. */
export function useOffers(filters: Filters, limit = 300) {
  const [items, setItems] = useState<Discount[]>([]);
  const [total, setTotal] = useState(0);
  const [date, setDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const request = useRef(0);

  const key = JSON.stringify(filters) + limit;

  useEffect(() => {
    if (!/^\d{5}$/.test(filters.plz)) return;
    const id = ++request.current;
    setLoading(true);
    setError(null);

    const timer = setTimeout(
      () => {
        api
          .discounts(filters, limit)
          .then((response) => {
            if (id !== request.current) return;
            setItems(response.items);
            setTotal(response.total);
            setDate(response.date);
          })
          .catch((err: Error) => {
            if (id !== request.current) return;
            setError(err.message);
            setItems([]);
            setTotal(0);
          })
          .finally(() => {
            if (id === request.current) setLoading(false);
          });
      },
      filters.q.trim().length >= 2 ? 300 : 0,
    );

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { items, total, date, loading, error };
}

/**
 * Prodavnice i kategorije za PLZ - za chipove i filtere.
 * Ako je dat `store`, kategorije su samo iz te prodavnice.
 */
export function useFacets(plz: string, store?: string) {
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  useEffect(() => {
    if (!/^\d{5}$/.test(plz)) return;
    let active = true;
    Promise.all([api.stores(plz), api.categories(plz, store)])
      .then(([storeResponse, categoryResponse]) => {
        if (!active) return;
        setStores(storeResponse.items.filter((store) => store.offers > 0));
        setCategories(categoryResponse.items);
      })
      .catch(() => {
        if (!active) return;
        setStores([]);
        setCategories([]);
      });
    return () => {
      active = false;
    };
  }, [plz, store]);

  return { stores, categories };
}

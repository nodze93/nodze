'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Discount } from './types';

const KEY = 'akcije.favorites';
const EVENT = 'akcije:favorites';

/**
 * Favorite pamtimo po "prodavnica + naziv artikla", a NE po id-u.
 * Razlog: scraper svaki dan upisuje novi snapshot pa se id mijenja -
 * po id-u bi favoriti nestali svako jutro.
 */
export const favoriteKey = (item: Pick<Discount, 'store_slug' | 'product_name'>): string =>
  `${item.store_slug}|${item.product_name.toLowerCase()}`;

function read(): string[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function write(keys: string[]): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(keys));
  } catch {
    /* privatni mod - favoriti samo nece biti trajni */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function useFavorites() {
  const [keys, setKeys] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => setKeys(read());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const toggle = useCallback((key: string) => {
    const current = read();
    write(current.includes(key) ? current.filter((k) => k !== key) : [...current, key]);
  }, []);

  const has = useCallback((key: string) => keys.includes(key), [keys]);

  return { keys, toggle, has, count: keys.length };
}

'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import type { Discount } from '@/lib/akcije/types';
import { IconChevron, IconSpark } from './icons';

/**
 * Preporuka se RACUNA iz podataka (prosjecan popust po prodavnici i kategoriji),
 * nije generisana tekstom niti modelom. Znaci: uvijek je tacna i uvijek se
 * moze provjeriti u listi ispod.
 */
export default function Recommendation({ items }: { items: Discount[] }) {
  const text = useMemo(() => {
    const withPercent = items.filter((item) => item.discount_percent !== null);
    if (withPercent.length < 5) return null;

    const group = (pick: (item: Discount) => string | null) => {
      const map = new Map<string, { sum: number; count: number }>();
      for (const item of withPercent) {
        const key = pick(item);
        if (!key) continue;
        const entry = map.get(key) ?? { sum: 0, count: 0 };
        entry.sum += item.discount_percent!;
        entry.count += 1;
        map.set(key, entry);
      }
      return [...map.entries()]
        .filter(([, value]) => value.count >= 2)
        .map(([key, value]) => ({ key, avg: value.sum / value.count, count: value.count }))
        .sort((a, b) => b.avg - a.avg);
    };

    const stores = group((item) => item.store);
    const categories = group((item) => item.category);
    if (stores.length === 0 || categories.length === 0) return null;

    return {
      store: stores[0]!,
      category: categories[0]!,
      secondCategory: categories[1] ?? null,
    };
  }, [items]);

  if (!text) return null;

  return (
    <Link href="/akcije/ponude?sort=percent" className="tip">
      <span className="hero-ico" style={{ width: 38, height: 38, borderRadius: 10 }}>
        <IconSpark size={20} />
      </span>
      <span>
        <h3>Preporuka ove sedmice</h3>
        <p>
          Najveći popusti su u <b>{text.store.key}</b> (prosječno{' '}
          {Math.round(text.store.avg)}% na {text.store.count} artikala), a po kategorijama najbolje
          stoji <b>{text.category.key}</b>
          {text.secondCategory ? (
            <>
              {' '}
              i <b>{text.secondCategory.key}</b>
            </>
          ) : null}
          .
        </p>
      </span>
      <IconChevron className="tip-arrow" size={20} />
    </Link>
  );
}

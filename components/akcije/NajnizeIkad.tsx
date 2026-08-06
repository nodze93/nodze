'use client';

// ============================================================
//  Traka „Najniže do sada"
// ------------------------------------------------------------
//  Mjera koja vrijedi za SVE lance jednako — i za one koji ne objave
//  staru cijenu (REWE, PENNY, Netto…). Ne tvrdi da je popust: kaže samo
//  da je to najniža cijena koju smo za taj artikal vidjeli kod tog lanca,
//  i kroz koliko dana gledamo — da korisnik zna koliko je tvrdnja jaka.
// ============================================================

import { useEffect, useState } from 'react';
import Link from 'next/link';
import OfferCard from './OfferCard';
import { IconChevron, IconTag } from './icons';
import { formatPrice } from '@/lib/akcije/format';
import type { Discount } from '@/lib/akcije/types';

interface Red extends Discount {
  dana_pracenja: number;
  ranije_najnize: number | string | null;
}

export default function NajnizeIkad({ plz }: { plz: string }) {
  const [items, setItems] = useState<Red[]>([]);

  useEffect(() => {
    if (!plz) return;
    let otkazano = false;
    fetch(`/api/akcije/najnize?plz=${plz}`)
      .then((r) => r.json())
      .then((d: { items?: Red[] }) => !otkazano && setItems(d.items ?? []))
      .catch(() => {});
    return () => {
      otkazano = true;
    };
  }, [plz]);

  // Dok nema historije (nova baza, novi PLZ) traka se ne prikazuje —
  // bolje ništa nego prazan naslov koji nešto obećava.
  if (items.length === 0) return null;

  const dana = Math.max(...items.map((i) => i.dana_pracenja ?? 0));
  const prvi = items[0]!;
  const ranije = Number(prvi.ranije_najnize);

  return (
    <section className="sec">
      <div className="sec-hd">
        <h2>
          <IconTag size={17} style={{ color: '#1a8a4a' }} /> Najniže do sada
        </h2>
        <Link href="/akcije/ponude?sort=price">
          Pogledaj sve <IconChevron size={13} style={{ verticalAlign: -2 }} />
        </Link>
      </div>

      <p className="sec-sub">
        Najniža cijena koju smo za ove artikle vidjeli — svaki lanac se poredi sam sa sobom,
        kroz zadnjih {dana} {dana === 1 ? 'dan' : 'dana'}.
        {Number.isFinite(ranije) && ranije > prvi.new_price ? (
          <>
            {' '}Npr. {prvi.product_name.slice(0, 28)} je ranije bio najmanje {formatPrice(ranije)},
            danas {formatPrice(prvi.new_price)}.
          </>
        ) : null}
      </p>

      <div className="rail">
        {items.slice(0, 12).map((item) => (
          <OfferCard key={`naj-${item.id}`} item={item} variant="rail" />
        ))}
      </div>
    </section>
  );
}

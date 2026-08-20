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
import { formatLongDate, formatPrice } from '@/lib/akcije/format';
import type { Discount } from '@/lib/akcije/types';

interface Red extends Discount {
  dana_pracenja: number;
  ranije_najnize: number | string | null;
  /** Datum prvog zabilježenog posmatranja — otkad taj artikal pratimo. */
  prvi_put?: string | null;
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

  // „Pratimo od …" — najstariji zapis u traci. Pošteniji od broja dana:
  // historija se od v2 čuva trajno, pa ovaj datum ide sve dublje u prošlost
  // i sam po sebi kaže koliko je tvrdnja jaka.
  const pratimoOd = items
    .map((i) => i.prvi_put)
    .filter((d): d is string => !!d)
    .sort()[0];

  const prvi = items[0]!;
  const ranije = Number(prvi.ranije_najnize);
  const stvarnoPalo = items.filter((i) => Number(i.ranije_najnize) > i.new_price).length;

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
        Najniža cijena koju smo za ove artikle ikad vidjeli — svaki lanac se poredi sam sa sobom.
        {pratimoOd ? <> Pratimo od {formatLongDate(pratimoOd)}</> : null}
        {stvarnoPalo > 0 && Number.isFinite(ranije) && ranije > prvi.new_price ? (
          <>
            {' '}Npr. {prvi.product_name.slice(0, 28)} je ranije bio najmanje {formatPrice(ranije)},
            danas {formatPrice(prvi.new_price)}.
          </>
        ) : null}
      </p>

      <div className="rail">
        {items.slice(0, 12).map((item) => (
          <OfferCard
            key={`naj-${item.id}`}
            item={item}
            variant="rail"
            ranijeNajnize={item.ranije_najnize === null ? null : Number(item.ranije_najnize)}
          />
        ))}
      </div>
    </section>
  );
}

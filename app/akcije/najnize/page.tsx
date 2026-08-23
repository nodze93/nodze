'use client';

// ============================================================
//  STRANICA „NAJNIŽE DO SADA" (20.8.2026.)
// ------------------------------------------------------------
//  Ranije je „Pogledaj sve" iz trake na naslovnoj vodilo na
//  /akcije/ponude?sort=price — dakle na SVE akcije poredane po cijeni,
//  što nije isto što i „najniže do sada". Korisnik klikne na jednu
//  stvar, a otvori mu se druga.
//
//  Ova stranica prikazuje tačno ono što traka obećava: artikle koji su
//  danas na najnižoj cijeni koju smo im ikad zabilježili kod tog lanca.
//  Ista funkcija u bazi (`ak_najnize_ikad`), samo bez ograničenja na 12.
// ============================================================

import { useEffect, useState } from 'react';
import Link from 'next/link';
import OfferCard from '@/components/akcije/OfferCard';
import { usePlz } from '@/components/akcije/PlzProvider';
import { formatLongDate } from '@/lib/akcije/format';
import type { Discount } from '@/lib/akcije/types';

interface Red extends Discount {
  dana_pracenja: number;
  ranije_najnize: number | string | null;
  prvi_put?: string | null;
}

export default function NajnizePage() {
  const { plz } = usePlz();
  const [items, setItems] = useState<Red[]>([]);
  const [ucitavam, setUcitavam] = useState(true);
  const [greska, setGreska] = useState(false);

  useEffect(() => {
    if (!plz) return;
    let otkazano = false;
    setUcitavam(true);
    setGreska(false);

    fetch(`/api/akcije/najnize?plz=${plz}&limit=120`)
      .then((r) => r.json())
      .then((d: { items?: Red[] }) => {
        if (otkazano) return;
        setItems(d.items ?? []);
        setUcitavam(false);
      })
      .catch(() => {
        if (otkazano) return;
        setGreska(true);
        setUcitavam(false);
      });

    return () => {
      otkazano = true;
    };
  }, [plz]);

  const pratimoOd = items
    .map((i) => i.prvi_put)
    .filter((d): d is string => !!d)
    .sort()[0];

  const stvarnoPalo = items.filter((i) => Number(i.ranije_najnize) > i.new_price).length;

  return (
    <>
      <div className="sec-hd" style={{ marginTop: 4 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.4px' }}>
          Najniže do sada
        </h1>
        <Link href="/akcije">← Nazad na akcije</Link>
      </div>

      <p className="sec-sub">
        Artikli koji su danas na najnižoj cijeni koju smo im ikad zabilježili — svaki lanac
        se poredi sam sa sobom, nikad s drugim.
        {pratimoOd ? <> Pratimo od {formatLongDate(pratimoOd)}</> : null}
      </p>

      {!ucitavam && !greska && items.length > 0 ? (
        <div className="summary">
          <b>{items.length} artikala</b>
          <span className="dot" />
          <span>PLZ {plz}</span>
          <span className="dot" />
          <span>{stvarnoPalo} sa stvarnim padom cijene</span>
        </div>
      ) : null}

      {greska ? (
        <div className="state">
          <h2>Nema veze sa serverom</h2>
          <p>Pokušaj ponovo za koji trenutak.</p>
        </div>
      ) : ucitavam ? (
        <div className="grid">
          {Array.from({ length: 8 }, (_, i) => (
            <div className="skel" key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="state">
          <h2>Još nema dovoljno historije</h2>
          <p>
            Artikal ovdje ulazi tek kad ga vidimo bar tri različita dana, pa poredimo
            današnju cijenu s najnižom ranijom. Svaki dan skupljanja doda još artikala.
          </p>
          <Link href="/akcije" className="btn">
            Pogledaj sve akcije
          </Link>
        </div>
      ) : (
        <div className="grid">
          {items.map((item) => (
            <OfferCard
              key={`naj-${item.id}`}
              item={item}
              ranijeNajnize={item.ranije_najnize === null ? null : Number(item.ranije_najnize)}
            />
          ))}
        </div>
      )}
    </>
  );
}

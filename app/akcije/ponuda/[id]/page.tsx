// ============================================================
//  DETALJ PONUDE — server omotač zbog DIJELJENJA
// ------------------------------------------------------------
//  Sam prikaz je klijentski (`PonudaKlijent`), ali WhatsApp, Facebook,
//  Viber i Telegram NE izvršavaju JavaScript — oni pročitaju samo HTML
//  koji server pošalje. Zato je pregled linka ranije ispadao kao logo
//  sajta: klijentska komponenta ne može postaviti og:image.
//
//  Ovdje se ponuda dohvati NA SERVERU i og: oznake se popune pravim
//  podacima — fotografija proizvoda, naziv, cijena, prodavnica i rok.
// ============================================================

import type { Metadata } from 'next';
import { db } from '@/lib/akcije-server';
import PonudaKlijent from './PonudaKlijent';

export const revalidate = 120;

interface Ponuda {
  product_name?: string;
  // Postgres `numeric` zna stići kao TEKST, ne broj — zato oba tipa.
  new_price?: number | string;
  old_price?: number | string | null;
  discount_percent?: number | string | null;
  store?: string;
  image_url?: string | null;
  valid_to?: string | null;
}

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://kodnas.de';

function broj(v: unknown): number | null {
  // PAZI: Number(null) je 0, a Number('') je 0 — bez ove provjere bi artikal
  // bez stare cijene („Angebot") u pregledu ispao kao „umjesto 0,00 €".
  if (v === null || v === undefined || v === '') return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

async function dajPonudu(id: string): Promise<Ponuda | null> {
  if (!/^\d{1,18}$/.test(id)) return null;
  try {
    const { data, error } = await db().rpc('ak_discount_by_id', { p_id: Number(id) });
    if (error) return null;
    const item = Array.isArray(data) ? data[0] : data;
    return (item as Ponuda) ?? null;
  } catch {
    return null;
  }
}

function eur(v: unknown): string | null {
  const n = broj(v);
  return n === null ? null : `${n.toFixed(2).replace('.', ',')} €`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const p = await dajPonudu(id);

  // Ponuda ne postoji (istekla, pogrešan link) → vrijedi podrazumijevani
  // opis sajta umjesto praznog pregleda.
  if (!p?.product_name) return {};

  const nova = eur(p.new_price);
  const stara = eur(p.old_price);
  const pct = broj(p.discount_percent);
  const procenat = pct !== null ? `−${Math.round(pct)}% · ` : '';

  const naslov = `${p.product_name} — ${nova ?? ''}${p.store ? ` u ${p.store}` : ''}`.trim();
  const opis = [
    procenat + (stara ? `umjesto ${stara}` : 'akcijska cijena'),
    p.valid_to ? `vrijedi do ${p.valid_to.split('-').reverse().join('.')}.` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const url = `${SITE}/akcije/ponuda/${id}`;
  // Slika je na CDN-u lanca (hotlink, isto kao na sajtu). Bez nje pregled
  // pada nazad na logo — to je jedino što stvarno rješava problem.
  const slike = p.image_url ? [{ url: p.image_url, alt: p.product_name }] : undefined;

  return {
    title: naslov,
    description: opis,
    alternates: { canonical: url },
    openGraph: {
      title: naslov,
      description: opis,
      url,
      siteName: 'kodnas.de',
      locale: 'bs_BA',
      type: 'article',
      images: slike,
    },
    twitter: {
      card: slike ? 'summary_large_image' : 'summary',
      title: naslov,
      description: opis,
      images: p.image_url ? [p.image_url] : undefined,
    },
  };
}

export default function Stranica() {
  return <PonudaKlijent />;
}

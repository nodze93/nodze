// ============================================================
// ADMIN — ručni unos akcija.  Zaštićeno middleware-om (/api/admin/*).
//   POST   { ...jedna } ili { offers:[...] }  -> upiši ručnu akciju
//   GET                                        -> lista ručnih akcija
//   DELETE ?id=123                             -> obriši ručnu akciju
// Sve ide u ak_discounts sa source='manual' (scraper ih ne dira).
// ============================================================

import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const ALL_PLZ = "00000"; // "svi gradovi" (nacionalni letak)

function slugify(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
}

function num(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : Number(String(v).replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : null;
}

function cleanPlz(v: unknown): string {
  const s = String(v ?? "").trim();
  return /^\d{5}$/.test(s) ? s : ALL_PLZ; // prazno / neispravno = svi gradovi
}

interface OfferInput {
  productName?: string;
  product?: string;
  title?: string;
  store?: string;
  publisherName?: string;
  newPrice?: unknown;
  price?: unknown;
  mainPrice?: unknown;
  oldPrice?: unknown;
  old_price?: unknown;
  category?: string | null;
  imageUrl?: string | null;
  image?: string | null;
  plz?: string;
  validTo?: string | null;
  validUntil?: string | null;
  validFrom?: string | null;
  validSince?: string | null;
  // marktguru i sl.: offerId/offerUrl → external_id/source_url (za dedup i link)
  offerId?: unknown;
  externalId?: unknown;
  offerUrl?: string | null;
  sourceUrl?: string | null;
}

// Slike agregatora (marktguru/kaufda/bonial) NE spremamo — to je njihov
// sadržaj. Za slike se oslanjamo SAMO na Open Food Facts (popuni ih trajni
// sloj gdje je slika prazna). Vlastite/čiste URL-ove propuštamo normalno.
function cleanImageUrl(raw: unknown): string | null {
  const s = String(raw ?? "").trim();
  if (!s || !/^https?:\/\//i.test(s)) return null;
  if (/marktguru|kaufda|bonial|mgmedia/i.test(s)) return null;
  return s.slice(0, 500);
}

function externalIdOf(v: unknown): string | null {
  const s = String(v ?? "").trim();
  return s ? s.slice(0, 120) : null;
}

// source_url je samo LINK nazad na izvor (atribucija/dedup), ne slika — pa
// ga propuštamo (uključujući marktguru), samo provjerimo da je ispravan URL.
function cleanUrl(raw: unknown): string | null {
  const s = String(raw ?? "").trim();
  return /^https?:\/\//i.test(s) ? s.slice(0, 500) : null;
}

async function ensureStore(
  db: ReturnType<typeof createServerClient>,
  name: string,
  plz: string,
): Promise<number | null> {
  const slug = slugify(name);
  if (!slug) return null;
  const { data: found } = await db.from("ak_stores").select("id").eq("slug", slug).maybeSingle();
  let id = found?.id as number | undefined;
  if (!id) {
    const { data: made } = await db.from("ak_stores").insert({ name, slug }).select("id").single();
    id = made?.id as number | undefined;
  }
  if (id && plz !== ALL_PLZ) {
    await db.from("ak_stores_by_plz").upsert({ store_id: id, plz }, { onConflict: "store_id,plz" });
  }
  return id ?? null;
}

function normalizeDate(v: unknown): string | null {
  const s = String(v ?? "").trim();
  if (!s) return null;
  // prihvati "2026-06-29" ili ISO "2026-06-29T06:59:00Z"
  const m = s.match(/^\d{4}-\d{2}-\d{2}/);
  return m ? m[0] : null;
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Neispravan JSON" }, { status: 400 });
  }

  const list: OfferInput[] = Array.isArray((body as { offers?: unknown }).offers)
    ? ((body as { offers: OfferInput[] }).offers)
    : [body as OfferInput];

  if (list.length === 0) return NextResponse.json({ error: "Nema ponuda" }, { status: 400 });
  if (list.length > 500) return NextResponse.json({ error: "Najviše 500 odjednom" }, { status: 400 });

  const db = createServerClient();
  const today = new Date().toISOString().slice(0, 10);
  const storeCache = new Map<string, number | null>();

  let upisano = 0;
  const preskoceno: string[] = [];

  for (const o of list) {
    const productName = String(o.productName ?? o.product ?? o.title ?? "").trim();
    const storeName = String(o.store ?? o.publisherName ?? "").trim();
    const newPrice = num(o.newPrice ?? o.price ?? o.mainPrice);
    const oldPrice = num(o.oldPrice ?? o.old_price);
    const plz = cleanPlz(o.plz);

    if (!productName || !storeName || newPrice === null) {
      preskoceno.push(productName || "(bez naziva)");
      continue;
    }

    const cacheKey = `${slugify(storeName)}|${plz}`;
    let storeId = storeCache.get(cacheKey);
    if (storeId === undefined) {
      storeId = await ensureStore(db, storeName, plz);
      storeCache.set(cacheKey, storeId);
    }
    if (!storeId) {
      preskoceno.push(productName);
      continue;
    }

    const imageUrl = cleanImageUrl(o.imageUrl ?? o.image);
    const validTo = normalizeDate(o.validTo ?? o.validUntil);
    const validFrom = normalizeDate(o.validFrom ?? o.validSince);
    const externalId = externalIdOf(o.externalId ?? o.offerId);
    const sourceUrl = cleanUrl(o.sourceUrl ?? o.offerUrl);

    const { error } = await db.from("ak_discounts").insert({
      product_name: productName.slice(0, 200),
      new_price: newPrice,
      old_price: oldPrice !== null && oldPrice > newPrice ? oldPrice : null,
      store_id: storeId,
      category: o.category ? String(o.category).slice(0, 60) : null,
      plz,
      date: today,
      image_url: imageUrl,
      image_exact: true,
      image_source: imageUrl ? "manual" : null,
      rabatt_quelle: oldPrice !== null && oldPrice > newPrice ? "prospekt" : null,
      valid_from: validFrom,
      valid_to: validTo,
      source_url: sourceUrl,
      external_id: externalId,
      source: "manual",
    });

    if (error) preskoceno.push(`${productName} (${error.message})`);
    else upisano += 1;
  }

  return NextResponse.json({ upisano, preskoceno });
}

export async function GET() {
  const db = createServerClient();
  const { data, error } = await db
    .from("ak_discounts")
    .select("id, product_name, new_price, old_price, plz, valid_to, image_url, category, created_at, ak_stores(name)")
    .eq("source", "manual")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const items = (data ?? []).map((r) => ({
    id: String(r.id),
    product_name: r.product_name,
    new_price: r.new_price,
    old_price: r.old_price,
    plz: r.plz,
    valid_to: r.valid_to,
    image_url: r.image_url,
    category: r.category,
    store: (r.ak_stores as { name?: string } | null)?.name ?? "—",
  }));
  return NextResponse.json({ items });
}

export async function DELETE(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id || !/^\d+$/.test(id)) return NextResponse.json({ error: "Neispravan id" }, { status: 400 });

  const db = createServerClient();
  // brišemo SAMO ručne (da se scraper-red ne može slučajno obrisati odavde)
  const { error } = await db.from("ak_discounts").delete().eq("id", Number(id)).eq("source", "manual");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

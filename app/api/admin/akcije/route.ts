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
// Skupni uvoz radi u grupama i zna potrajati par sekundi; zadana granica
// od 10 s bi ga presjekla na pola posla.
export const maxDuration = 60;

// "Kanta" za NACIONALNE ponude — nije grad. Red upisan ovdje dobije
// scope='DE' i vidi ga SVAKI korisnik, koji god PLZ imao.
// (Ranije je ovo bila slijepa ulica: red se upiše, ali ga pretraga po
//  pravom PLZ-u nikad ne nađe. Od `akcije-regije.sql` stvarno radi.)
const ALL_PLZ = "00000";

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

/**
 * NAZIV ARTIKLA: marka + naziv.
 * marktguru drži marku odvojeno, pa naziv sam za sebe često ne znači ništa
 * ("Helles", "Frischkäse"). Spojeno je "Erdinger Brauhaus Helles" — to je
 * ono što čovjek traži i po čemu pretraga radi. Ako je marka već u nazivu,
 * ne ponavlja se.
 */
function naslov(naziv: string, marka: unknown): string {
  const m = String(marka ?? "").trim();
  if (!m) return naziv;
  if (naziv.toLowerCase().includes(m.toLowerCase())) return naziv;
  return `${m} ${naziv}`;
}

/**
 * GRADOVI JEDNE PONUDE.
 * Stari oblik ima `plz` (jedan grad). marktguru v4 ima `plzs` — niz svih
 * gradova u kojima ista ponuda vrijedi. Za svaki grad ide poseban red, jer
 * pretraga na sajtu traži po PLZ-u.
 *
 * IZUZETAK — nacionalna ponuda: ako se ponuda pojavila u gotovo svim
 * skeniranim gradovima (prag: 85%), to je akcija cijelog lanca u cijeloj
 * Njemačkoj. Takva ide u JEDAN red sa scope='DE' — inače bi se ista Lidlova
 * kafa upisala 18 puta i vidjeli bi je samo ti gradovi, a niko drugi.
 */
function gradoviPonude(o: OfferInput, skenirano: number): string[] {
  const sirovo = Array.isArray(o.plzs) ? o.plzs : null;
  if (!sirovo || sirovo.length === 0) return [cleanPlz(o.plz)];

  const gradovi = [...new Set(sirovo.map((v) => String(v ?? "").trim()).filter((s) => /^\d{5}$/.test(s)))];
  if (gradovi.length === 0) return [ALL_PLZ];

  const prag = skenirano >= 4 ? Math.ceil(skenirano * 0.85) : Infinity;
  return gradovi.length >= prag ? [ALL_PLZ] : gradovi;
}

interface OfferInput {
  productName?: string;
  product?: string;
  title?: string;
  brand?: string | null;
  store?: string;
  publisherName?: string;
  // marktguru v4: jedna ponuda vrijedi u VIŠE gradova odjednom
  plzs?: unknown;
  ean?: string | null;
  productKey?: string | null;
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

// HOTLINK, NE SPREMANJE (odluka korisnika, 4.8.2026).
// U bazu ide SAMO adresa slike — sam fajl ostaje na njihovom serveru i
// učitava ga posjetiočev browser (ProductImage šalje `referrerPolicy=
// "no-referrer"`, a ako link padne prebaci se na našu ilustraciju).
// Ništa se ne kopira, ne kešira niti drži kod nas.
//   • marktguru CDN (mg2de.b-cdn.net)  → PROPUŠTA SE
//   • kaufda / bonial                  → i dalje odbijeno
// Gašenje je jedna linija: obriši HOTLINK_DOZVOLJENO i vrati staru zabranu
// `if (/marktguru|kaufda|bonial|mgmedia/i.test(s)) return null;`.
const HOTLINK_DOZVOLJENO =
  /(^|\.)mg2de\.b-cdn\.net$|(^|\.)mgmedia\.de$|(^|\.)marktguru\.(de|net)$/i;

function cleanImageUrl(raw: unknown): string | null {
  const s = String(raw ?? "").trim();
  if (!s || !/^https?:\/\//i.test(s)) return null;
  let host: string;
  try {
    host = new URL(s).hostname;
  } catch {
    return null;
  }
  if (HOTLINK_DOZVOLJENO.test(host)) return s.slice(0, 500);
  if (/kaufda|bonial/i.test(s)) return null;
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

/**
 * Sve prodavnice odjednom (slug -> id). Ranije se za SVAKI red išlo u bazu
 * po id prodavnice; kod uvoza od 12.000 redova to je bilo 12.000 upita i
 * zahtjev bi istekao. Sad je jedan upit na cijeli uvoz.
 */
async function ucitajProdavnice(
  db: ReturnType<typeof createServerClient>,
): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  const { data } = await db.from("ak_stores").select("id, slug");
  for (const r of data ?? []) map.set(String(r.slug), Number(r.id));
  return map;
}

function dijeli<T>(niz: T[], koliko: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < niz.length; i += koliko) out.push(niz.slice(i, i + koliko));
  return out;
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

  // Prihvati SVA tri oblika. Prije je goli niz "[ {...}, {...} ]" završavao
  // kao JEDAN artikal (pa "upisano 0, preskočeno 1"), iako primjer u adminu
  // pokazuje baš takav niz.
  //   [ {...}, {...} ]          ← goli niz
  //   { "offers": [ ... ] }     ← omotan
  //   { ...jedna ponuda... }    ← jedan objekat
  function razmotaj(v: unknown): OfferInput[] {
    if (Array.isArray(v)) return v as OfferInput[];
    const w = v as { offers?: unknown; items?: unknown; data?: unknown } | null;
    const niz = [w?.offers, w?.items, w?.data].find(Array.isArray);
    return (niz as OfferInput[] | undefined) ?? [v as OfferInput];
  }

  let list = razmotaj(body);

  // DVOSTRUKI OMOT: stariji admin (keširana skripta) je fajl {"offers":[...]}
  // umotavao još jednom → {"offers":[{"offers":[...1807]}]}. Server bi to vidio
  // kao JEDAN artikal bez naziva ("upisano 0, preskočeno 1"). Odmotaj i to.
  while (list.length === 1 && list[0] && !Array.isArray(list[0])) {
    const unutra = razmotaj(list[0]);
    if (unutra.length === 1 && unutra[0] === list[0]) break; // nema više omota
    list = unutra;
  }

  if (list.length === 0) return NextResponse.json({ error: "Nema ponuda" }, { status: 400 });
  if (list.length > 3000) return NextResponse.json({ error: "Najviše 3000 ponuda odjednom" }, { status: 400 });

  // Omot fajla (marktguru v4): koje je gradove skidač obišao i traži li se
  // brisanje starog seta. `sweptPlz` je bitan — bez njega se ne zna šta je
  // "nacionalna ponuda" (vidi gradoviPonude) pa svaki grad dobije svoj red.
  const omot = (!Array.isArray(body) ? body : null) as
    | { sweptPlz?: unknown; reset?: unknown }
    | null;
  const skenirani = (Array.isArray(omot?.sweptPlz) ? omot.sweptPlz : [])
    .map((v) => String(v ?? "").trim())
    .filter((s) => /^\d{5}$/.test(s));
  const reset = omot?.reset === true;

  const db = createServerClient();
  const today = new Date().toISOString().slice(0, 10);

  // RESET (šalje se SAMO uz prvi komad velikog uvoza): jednim potezom izbaci
  // prošlosedmični skupni uvoz umjesto da se briše red po red. Dira isključivo
  // redove koji IMAJU external_id — a to su samo uvezeni; ručno ukucane ponude
  // iz admin forme nemaju ga i ostaju netaknute.
  if (reset) {
    const q = db.from("ak_discounts").delete().eq("source", "manual").not("external_id", "is", null);
    if (skenirani.length > 0) await q.in("plz", [...new Set([ALL_PLZ, ...skenirani])]);
    else await q;
  }

  // Prodavnice se učitaju JEDNOM; nove se dodaju usput u istu mapu.
  const prodavnice = await ucitajProdavnice(db);
  // (store_id, plz) parovi za ak_stores_by_plz — upišu se skupno na kraju.
  const parovi = new Map<string, { store_id: number; plz: string }>();

  let upisano = 0;
  const preskoceno: string[] = [];
  // Dedup unutar JEDNOG uvoza: isti JSON zalijepljen s duplim redovima (ili
  // ista ponuda dvaput u fajlu) ne smije napraviti dva reda u bazi.
  const uOvomUvozu = new Set<string>();
  // Redovi se PRIPREME, pa upišu skupno (vidi dolje) — ne red po red.
  const spremni: { naziv: string; extId: string | null; red: Record<string, unknown> }[] = [];

  for (const o of list) {
    const productName = String(o.productName ?? o.product ?? o.title ?? "").trim();
    const storeName = String(o.store ?? o.publisherName ?? "").trim();
    const newPrice = num(o.newPrice ?? o.price ?? o.mainPrice);
    const oldPrice = num(o.oldPrice ?? o.old_price);
    const validTo = normalizeDate(o.validTo ?? o.validUntil);

    // Reci ŠTA fali — inače korisnik dobije samo "preskočeno 1" i nagađa.
    // `valid_to` je OBAVEZAN: ručni red bez roka prođe upis, ali ga pretraga
    // NIKAD ne prikaže (pravilo u bazi) — pa korisnik unese 50 ponuda, dobije
    // "upisano 50", a na sajtu nula i ne zna zašto.
    if (!productName || !storeName || newPrice === null || !validTo) {
      const fali = [
        !productName ? "naziv (productName/product/title)" : null,
        !storeName ? "prodavnica (store/publisherName)" : null,
        newPrice === null ? "nova cijena (newPrice/price/mainPrice)" : null,
        !validTo ? "rok važenja (validTo/validUntil — bez njega se ponuda ne prikazuje)" : null,
      ].filter(Boolean).join(", ");
      preskoceno.push(`${productName || "(bez naziva)"} — fali: ${fali}`);
      continue;
    }

    // Rok dalji od 60 dana = skoro sigurno greška u JSON-u (tako su probni
    // uvozi iz aprila "važili" do jeseni i mjesecima kvarili Top ponude —
    // nijedna prava akcija ne traje toliko). Odbij uz jasno objašnjenje.
    const maxRok = new Date();
    maxRok.setDate(maxRok.getDate() + 60);
    if (validTo > maxRok.toISOString().slice(0, 10)) {
      preskoceno.push(`${productName} (validTo ${validTo} je dalji od 60 dana — provjeri datum u JSON-u)`);
      continue;
    }

    const slug = slugify(storeName);
    if (!slug) {
      preskoceno.push(`${productName} (neispravno ime prodavnice)`);
      continue;
    }
    let storeId = prodavnice.get(slug);
    if (storeId === undefined) {
      const { data: made } = await db
        .from("ak_stores")
        .insert({ name: storeName, slug })
        .select("id")
        .single();
      storeId = made?.id as number | undefined;
      if (!storeId) {
        // utrka: neko drugi ga je upravo napravio — pročitaj ga
        const { data: found } = await db.from("ak_stores").select("id").eq("slug", slug).maybeSingle();
        storeId = found?.id as number | undefined;
      }
      if (!storeId) {
        preskoceno.push(`${productName} (prodavnica se nije mogla upisati)`);
        continue;
      }
      prodavnice.set(slug, storeId);
    }

    const imageUrl = cleanImageUrl(o.imageUrl ?? o.image);
    const validFrom = normalizeDate(o.validFrom ?? o.validSince);
    const osnovniId = externalIdOf(o.externalId ?? o.offerId);
    const sourceUrl = cleanUrl(o.sourceUrl ?? o.offerUrl);
    const naziv = naslov(productName, o.brand).slice(0, 200);
    const ean = String(o.ean ?? "").trim().slice(0, 20) || null;
    // product_key veže ponudu za PROIZVOD, ne za dan — po njemu rade i
    // trajno sakrivanje iz moderacije i prelivanje slika (ak_apply_product_layer).
    const productKey = String(o.productKey ?? "").trim().slice(0, 200) || null;

    // JEDNA PONUDA → JEDAN RED PO GRADU (marktguru v4 ima niz `plzs`).
    for (const plz of gradoviPonude(o, skenirani.length)) {
      if (plz !== ALL_PLZ) parovi.set(`${storeId}|${plz}`, { store_id: storeId, plz });

      // external_id mora biti jedinstven PO GRADU, inače bi 18 redova iste
      // ponude dijelilo isti ključ i brisanje bi ih pobrisalo sve osim jednog.
      const externalId = osnovniId ? `${osnovniId}#${plz}`.slice(0, 120) : null;

      // isti red u istom uvozu → preskoči (ključ kao i na sajtu + rok i PLZ)
      const kljucReda =
        externalId ?? `${slug}|${naziv.toLowerCase()}|${newPrice}|${validTo}|${plz}`;
      if (uOvomUvozu.has(kljucReda)) continue;
      uOvomUvozu.add(kljucReda);

      spremni.push({
        naziv,
        extId: externalId,
        red: {
          product_name: naziv,
          new_price: newPrice,
          old_price: oldPrice !== null && oldPrice > newPrice ? oldPrice : null,
          store_id: storeId,
          category: o.category ? String(o.category).slice(0, 60) : null,
          plz,
          date: today,
          image_url: imageUrl,
          image_exact: true,
          image_source: imageUrl ? "manual" : null,
          ean,
          product_key: productKey,
          rabatt_quelle: oldPrice !== null && oldPrice > newPrice ? "prospekt" : null,
          valid_from: validFrom,
          valid_to: validTo,
          source_url: sourceUrl,
          external_id: externalId,
          source: "manual",
          // Bez PLZ-a = nacionalna ponuda (Lidl i sl. imaju iste cijene svugdje):
          // upiše se jednom i vidi je cijela Njemačka. S PLZ-om ostaje lokalna.
          scope: plz === ALL_PLZ ? "DE" : null,
        },
      });
    }
  }

  // ------------------------------------------------------------------
  // UPIS U GRUPAMA. Prije se za svaki red išlo u bazu 2–3 puta (brisanje
  // starog + upis), pa je uvoz od nekoliko hiljada redova istekao prije
  // kraja. Sad ide: jedno brisanje po 200 ID-eva + jedan upis po 500 redova.
  // ------------------------------------------------------------------

  // 1) "osvježi, ne dupliraj": stari ručni redovi s istim external_id ispadaju.
  //    Kod reset-uvoza je to već obavljeno jednim brisanjem gore, pa se
  //    preskače (inače bi bilo 50+ suvišnih upita po komadu).
  if (!reset) {
    const idovi = spremni.map((r) => r.extId).filter((x): x is string => !!x);
    for (const grupa of dijeli(idovi, 500)) {
      await db.from("ak_discounts").delete().eq("source", "manual").in("external_id", grupa);
    }
  }

  // 2) upis; ako grupa padne (jedan loš red obori cijelu), pređi na red-po-red
  //    da se zna KOJI red je kriv i da ostali ipak uđu
  for (const grupa of dijeli(spremni, 1000)) {
    const { error } = await db.from("ak_discounts").insert(grupa.map((r) => r.red));
    if (!error) {
      upisano += grupa.length;
      continue;
    }
    for (const r of grupa) {
      const { error: e1 } = await db.from("ak_discounts").insert(r.red);
      if (e1) preskoceno.push(`${r.naziv} (${e1.message})`);
      else upisano += 1;
    }
  }

  // 3) veza prodavnica ↔ PLZ (traka prodavnica), skupno
  const sviParovi = [...parovi.values()];
  for (const grupa of dijeli(sviParovi, 500)) {
    await db.from("ak_stores_by_plz").upsert(grupa, { onConflict: "store_id,plz" });
  }

  // `ponuda` = koliko je ponuda stiglo, `upisano` = koliko je REDOVA nastalo
  // (jedna ponuda koja vrijedi u 7 gradova daje 7 redova).
  return NextResponse.json({ ponuda: list.length, upisano, preskoceno });
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

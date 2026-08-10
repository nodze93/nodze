import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { getAllVodici } from "@/lib/data/vodici";

// Bazni URL sajta (bez završne kose crte).
const BASE = (process.env.NEXT_PUBLIC_SITE_URL || "https://kodnas.de").replace(/\/+$/, "");

// VIJESTI SU IZBAČENE IZ SITEMAPA (odluka 9.8.2026.).
// Zašto: sitemap je "molba Googleu da ovo puzi". Sa 240+ članaka Google
// je najveći dio budžeta puzanja trošio na vijesti koje ne donose posjete,
// umjesto na vodiče i kalkulator. Vijesti ostaju na sajtu i ostaju u
// Google indeksu — samo ih više aktivno ne guramo.
// Da se vrate: postavi VIJESTI_U_SITEMAP = true.
const VIJESTI_U_SITEMAP = false;

// Kategorije vijesti (/kategorija/<slug>) — ulaze samo ako su vijesti uključene.
const KATEGORIJE = [
  "viza", "posao", "stan", "zdravstvo", "porodica", "porez", "penzija",
  "povratak", "svijet", "sport", "finansije", "gastarbajter", "biznis",
];

// Statične javne stranice. (BiH rubrika uklonjena.)
const STATICNE_UVIJEK = ["", "/vodici", "/de", "/o-nama", "/kontakt"];
const STATICNE = VIJESTI_U_SITEMAP ? [...STATICNE_UVIJEK, "/vijesti"] : STATICNE_UVIJEK;

function klijent() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

// Sitemap se osvježava svakih sat (novi članci uđu automatski).
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sada = new Date();
  const stavke: MetadataRoute.Sitemap = [];

  // Statične stranice
  for (const p of STATICNE) {
    stavke.push({
      url: `${BASE}${p}` || `${BASE}/`,
      lastModified: sada,
      changeFrequency: p === "" || p === "/vijesti" ? "hourly" : "weekly",
      priority: p === "" ? 1 : 0.7,
    });
  }

  // Kategorije vijesti
  for (const k of VIJESTI_U_SITEMAP ? KATEGORIJE : []) {
    stavke.push({
      url: `${BASE}/kategorija/${k}`,
      lastModified: sada,
      changeFrequency: "daily",
      priority: 0.6,
    });
  }

  const db = klijent();
  if (db && VIJESTI_U_SITEMAP) {
    // Objavljeni članci
    try {
      const { data } = await db
        .from("clanci")
        .select("slug,datum_objave,updated_at,created_at")
        .eq("status", "published")
        .order("datum_objave", { ascending: false })
        .limit(5000);
      for (const c of data || []) {
        const lm = c.updated_at || c.datum_objave || c.created_at;
        stavke.push({
          url: `${BASE}/clanak/${c.slug}`,
          lastModified: lm ? new Date(lm) : sada,
          changeFrequency: "weekly",
          priority: 0.8,
        });
      }
    } catch {
      /* baza pala — sitemap ostaje sa statičnim stranicama */
    }

  }

  // Brutto-Netto kalkulator — do sada uopšte NIJE bio u sitemapu.
  // Bez lastModified: bolje ništa nego lažni "danas" na svaki zahtjev.
  stavke.push({
    url: `${BASE}/brutto-netto`,
    changeFrequency: "monthly",
    priority: 0.9,
  });

  // Vodiči — kod + baza SPOJENI po slug-u (baza pobjeđuje, kao na sajtu).
  // Do sada su ulazili samo hard-kodirani, pa su vodiči uneseni kroz admin
  // Googleu u sitemapu bili nevidljivi. lastModified je STVARAN datum
  // (provjereno/updated_at iz baze), ne "sada" — lažni svježi datum na
  // svaki zahtjev uči Google da sitemapu ne vjeruje.
  // Stari slugovi koji sad imaju 301 (next.config.ts) NE SMIJU u sitemap —
  // Google prijavljuje "preusmjereni URL u sitemapu" kao grešku i troši budžet
  // puzanja. Lista mora ostati usklađena sa redirects() u next.config.ts.
  const PREUSMJERENI = new Set([
    "westbalkan-regulacija", "chancenkarte", "eu-plava-karta",
    "zubar-zahnarzt", "povrat-poreza", "kindergeld-poreske-klase",
    "ausbildung-njega-medicina", "njemacki-jezik-ucenje",
    "pronalazak-stana", "mietvertrag-ugovor-o-najmu", "mietkaution-kaucija",
    "nebenkosten-obracun", "prava-stanara", "otkaz-najma-iseljenje",
    "wohngeld-socijalni-stan", "struja-internet-rundfunkbeitrag",
    "trudnoca-njemacka", "elterngeld-elternzeit", "dijete-rodjeno-u-njemackoj",
    "vrtic-kita-kindergarten", "skola-u-njemackoj", "vjencanje-njemacka-standesamt",
    "razvod-izdrzavanje-djece", "njega-starijih-pflege",
    "kod-ljekara-hausarzt-facharzt", "bolovanje-krankmeldung", "lijekovi-apoteka",
    "hitni-slucajevi-112-116117", "djeca-kod-ljekara",
    "dopunsko-osiguranje-mentalno-zdravlje", "povratak-bih",
  ]);

  const vodiciMapa = new Map<string, MetadataRoute.Sitemap[number]>();
  for (const v of getAllVodici()) {
    if (PREUSMJERENI.has(v.slug)) continue;
    vodiciMapa.set(v.slug, {
      url: `${BASE}/vodic/${v.slug}`,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }
  if (db) {
    try {
      // select("*") namjerno: kolona `provjereno` možda još ne postoji
      // (supabase/vodici-provjereno.sql), a "*" ne puca na tome.
      const { data } = await db.from("vodici").select("*").eq("aktivan", true).limit(500);
      for (const v of data || []) {
        if (PREUSMJERENI.has(v.slug)) continue;
        const lm = v.provjereno || v.updated_at || v.created_at;
        vodiciMapa.set(v.slug, {
          url: `${BASE}/vodic/${v.slug}`,
          ...(lm ? { lastModified: new Date(lm) } : {}),
          changeFrequency: "monthly",
          // Dugi provjereni vodiči su najvredniji sadržaj — neka to i sitemap kaže.
          priority: v.tekst ? 0.8 : 0.6,
        });
      }
    } catch {
      /* baza pala — ostaju vodiči iz koda */
    }
  }
  stavke.push(...vodiciMapa.values());

  return stavke;
}

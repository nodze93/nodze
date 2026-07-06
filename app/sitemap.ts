import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

// Bazni URL sajta (bez završne kose crte).
const BASE = (process.env.NEXT_PUBLIC_SITE_URL || "https://kodnas.de").replace(/\/+$/, "");

// Kategorije koje imaju svoju stranicu (/kategorija/<slug>).
const KATEGORIJE = [
  "viza", "posao", "stan", "zdravstvo", "porodica", "porez", "penzija",
  "povratak", "svijet", "bih", "sport", "finansije", "gastarbajter", "biznis",
];

// Statične javne stranice.
const STATICNE = ["", "/vijesti", "/vodici", "/de", "/bih", "/o-nama", "/kontakt"];

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

  // Kategorije
  for (const k of KATEGORIJE) {
    stavke.push({
      url: `${BASE}/kategorija/${k}`,
      lastModified: sada,
      changeFrequency: "daily",
      priority: 0.6,
    });
  }

  const db = klijent();
  if (db) {
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

    // Vodiči
    try {
      const { data } = await db.from("vodici").select("slug,created_at").limit(500);
      for (const v of data || []) {
        stavke.push({
          url: `${BASE}/vodic/${v.slug}`,
          lastModified: v.created_at ? new Date(v.created_at) : sada,
          changeFrequency: "monthly",
          priority: 0.6,
        });
      }
    } catch {
      /* ignoriši — vodiči nisu obavezni za sitemap */
    }
  }

  return stavke;
}

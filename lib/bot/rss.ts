// ============================================================
// RSS ČITAČ — čita sve feedove paralelno, otporan na kvarove
// ============================================================
import Parser from "rss-parser";
import { RSS_IZVORI } from "./izvori";
import type { FeedIzvor, Vijest } from "./tipovi";

const parser = new Parser({
  timeout: 12000,
  headers: { "User-Agent": "Mozilla/5.0 (compatible; DijasporaBot/2.0)" },
});

function cistiTekst(s: string | undefined, max = 300): string {
  if (!s) return "";
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

async function fetchJedanFeed(izvor: FeedIzvor): Promise<Vijest[]> {
  try {
    const feed = await parser.parseURL(izvor.url);
    return (feed.items || [])
      .slice(0, 10)
      .filter((it) => it.title && it.link)
      .map((it) => ({
        naslov: (it.title || "").trim(),
        link: (it.link || "").trim(),
        excerpt: cistiTekst(it.contentSnippet || it.content || it.summary),
        datum: it.isoDate || it.pubDate || new Date().toISOString(),
        izvor: izvor.ime,
        jezik: izvor.jezik,
        tip: izvor.tip,
        strana: izvor.strana,
      }));
  } catch (err) {
    console.warn(`⚠️  Feed "${izvor.ime}" preskočen: ${(err as Error).message}`);
    return [];
  }
}

export async function fetchSveVijesti(): Promise<Vijest[]> {
  console.log(`📡 Čitam ${RSS_IZVORI.length} RSS feedova...`);
  const rezultati = await Promise.allSettled(RSS_IZVORI.map(fetchJedanFeed));
  const vijesti = rezultati
    .filter((r): r is PromiseFulfilledResult<Vijest[]> => r.status === "fulfilled")
    .flatMap((r) => r.value);

  // Samo vijesti mlađe od 48h (svježina = klikabilnost)
  const prije48h = Date.now() - 48 * 3600 * 1000;
  const svjeze = vijesti.filter((v) => {
    const t = Date.parse(v.datum);
    return isNaN(t) || t > prije48h;
  });

  console.log(`📡 Prikupljeno ${vijesti.length} vijesti (${svjeze.length} svježih < 48h)`);
  return svjeze;
}

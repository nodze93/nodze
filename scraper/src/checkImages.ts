/**
 * =====================================================================
 *  Provjera da li slike STVARNO postoje  ->  npm run images:check
 * =====================================================================
 *  Problem koji rješava:
 *
 *  U bazi je `image_url` upisan, pa admin pokazuje "100% sa slikom" —
 *  ali dio tih URL-ova na tuđem serveru vodi u prazno (404). Lanac obriše
 *  fotografiju kad akcija prođe, a mi i dalje čuvamo mrtav link. Na sajtu
 *  se tada vidi crtana ilustracija, iako baza tvrdi da slika postoji.
 *  (Primjer: 6 od 58 Lidlovih slika je bilo mrtvo prvog dana.)
 *
 *  Šta radi: pokuca na svaki URL i onima koji ne odgovaraju slikom
 *  OBRIŠE `image_url`. Time postaju "bez slike" — pa ih sljedeći korak
 *  (`images:enrich`, Open Food Facts) normalno popuni.
 *
 *  Zato u workflow-u ide PRIJE dopune slika.
 *
 *    npm run images:check                 # provjeri i očisti mrtve
 *    npm run images:check -- --dry-run    # samo ispiši, ne diraj bazu
 *    npm run images:check -- --limit=300  # najviše toliko URL-ova
 * =====================================================================
 */
import { closePool, pool } from './db.js';

const ISTEK_MS = 10_000;
const ISTOVREMENO = 6; // pristojno prema tuđim serverima

function log(message: string): void {
  console.log(`[${new Date().toISOString().slice(11, 19)}] ${message}`);
}

/**
 * Vrati true ako URL zaista vraća sliku.
 * Prvo HEAD (jeftino); dio CDN-ova HEAD ne dozvoljava, pa se pada na GET.
 * Naše lokalne putanje (/products/...) se ne provjeravaju preko mreže.
 */
export async function slikaPostoji(url: string): Promise<boolean> {
  if (!/^https?:\/\//i.test(url)) return true; // lokalna putanja — ne diramo

  for (const method of ['HEAD', 'GET'] as const) {
    const kontrola = new AbortController();
    const tajmer = setTimeout(() => kontrola.abort(), ISTEK_MS);
    try {
      const res = await fetch(url, { method, signal: kontrola.signal, redirect: 'follow' });
      clearTimeout(tajmer);
      if (res.status === 405 || res.status === 501) continue; // HEAD nije dozvoljen → probaj GET
      if (!res.ok) return false;
      const tip = res.headers.get('content-type') ?? '';
      // Neki serveri na 404 vrate HTML stranicu sa statusom 200 — zato i tip.
      return tip === '' || tip.startsWith('image/');
    } catch {
      clearTimeout(tajmer);
      if (method === 'GET') return false; // ni GET nije prošao
    }
  }
  return false;
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes('--dry-run');
  const limit = Number(process.argv.find((a: string) => a.startsWith('--limit='))?.slice(8) ?? 800);

  // Samo URL-ovi koji su danas u igri — stari snapshoti se ionako brišu.
  const { rows } = await pool.query<{ image_url: string }>(
    `select distinct image_url
       from ak_discounts
      where image_url is not null
        and image_url like 'http%'
      limit $1`,
    [limit],
  );
  log(`Provjeravam ${rows.length} različitih URL-ova…`);

  const mrtvi: string[] = [];
  for (let i = 0; i < rows.length; i += ISTOVREMENO) {
    const grupa = rows.slice(i, i + ISTOVREMENO);
    const ishodi = await Promise.all(grupa.map((r: { image_url: string }) => slikaPostoji(r.image_url)));
    ishodi.forEach((ok: boolean, k: number) => {
      if (!ok) mrtvi.push(grupa[k]!.image_url);
    });
  }

  if (mrtvi.length === 0) {
    log(`Gotovo. Sve ${rows.length} slika je živo.`);
    await closePool();
    return;
  }

  log(`Mrtvih linkova: ${mrtvi.length} / ${rows.length}`);
  for (const u of mrtvi.slice(0, 10)) log(`   ✗ ${u.slice(0, 100)}`);
  if (mrtvi.length > 10) log(`   … i još ${mrtvi.length - 10}`);

  if (dryRun) {
    log('Dry-run — baza nije dirana.');
    await closePool();
    return;
  }

  // image_source se briše zajedno s URL-om: red postaje "bez slike", pa ga
  // images:enrich (Open Food Facts) pokupi u sljedećem koraku.
  const res = await pool.query(
    `update ak_discounts
        set image_url = null, image_source = null
      where image_url = any($1::text[])`,
    [mrtvi],
  );
  log(`Očišćeno ${res.rowCount ?? 0} redova — sada čekaju Open Food Facts.`);

  await closePool();
}

if (process.argv[1] && /checkImages\.ts|checkImages\.js/.test(process.argv[1])) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

/**
 * =====================================================================
 *  Skidanje slika na NAS server  ->  npm run images:download
 * =====================================================================
 *  Zasto ovo treba, iako `image_url` vec radi:
 *
 *  1. URL-ovi izvora ZIVE KRATKO. KaufDA slike vise ne postoje kad letak
 *     istekne - za dvije sedmice pola grida bude prazno.
 *  2. Hotlinkanje tudjeg CDN-a je i pravno i tehnicki lose (Referer
 *     blokade, promjene putanja, mi trosimo njihov promet).
 *  3. Vlastite slike mozemo posluziti brzo i kesirati koliko hocemo.
 *
 *  Sta radi: uzme sve `image_url` koji pokazuju na tudji server, skine ih
 *  u `apps/web/public/products/`, i prepise `image_url` na lokalnu putanju
 *  `/products/<hash>.<ext>`. Ime fajla je SHA1 URL-a, pa se ista slika
 *  nikad ne skida dvaput (i kod ponovnog pokretanja).
 *
 *  Pokretanje:
 *    npm run images:download                 # skini sve sto treba
 *    npm run images:download -- --limit=50   # samo prvih 50
 *    npm run images:download -- --dry-run    # samo pokazi sta bi skinuo
 * =====================================================================
 */
import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { config } from './config.js';
import { closePool, pool } from './db.js';
import { contentNameFor, fileNameFor, isRemote, processImage } from './imageFiles.js';

export { contentNameFor, fileNameFor, isRemote, processImage };

/** Gdje se slike snimaju i kako se onda vide sa weba. */
const OUT_DIR = resolve(process.cwd(), process.env.IMAGE_DIR ?? '../web/public/products');
const PUBLIC_PREFIX = process.env.IMAGE_PUBLIC_PREFIX ?? '/products';
const MAP_FILE = resolve(process.cwd(), './data/image-files.json');

const DELAY_MS = Number(process.env.IMAGE_DOWNLOAD_DELAY_MS ?? 400);
const MAX_BYTES = Number(process.env.IMAGE_MAX_BYTES ?? 3_000_000);

// Obrada slike: kartici treba ~110px, retini ~330px. 400px je sa rezervom.
const MAX_SIZE = Number(process.env.IMAGE_MAX_SIZE ?? 400);

/**
 * PRAVNA SIGURNOSNA KOCNICA (vidi docs/pravno.md).
 * Fotografija artikla je zasticena (§ 2, § 72 UrhG). Skidanje tudje slike na
 * svoj server i prikazivanje je umnozavanje + javno stavljanje na raspolaganje,
 * za sta treba licenca. Zato je po defaultu ISKLJUCENO.
 * Uljucuje se samo kad znas da imas prava - i po hostu, ne globalno.
 */
const ALLOW_THIRD_PARTY = (process.env.IMAGES_ALLOW_THIRD_PARTY ?? 'false') === 'true';
const ALLOWED_HOSTS = (process.env.IMAGES_ALLOWED_HOSTS ?? '')
  .split(',')
  .map((h) => h.trim().toLowerCase())
  .filter(Boolean);

/** Smijemo li skinuti sliku sa ovog URL-a? */
export function mayDownload(url: string): { ok: boolean; reason?: string } {
  let host: string;
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return { ok: false, reason: 'neispravan URL' };
  }
  if (ALLOWED_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) return { ok: true };
  if (ALLOW_THIRD_PARTY) return { ok: true };
  return {
    ok: false,
    reason:
      'tudje slike su iskljucene (IMAGES_ALLOW_THIRD_PARTY=false). ' +
      'Vidi docs/pravno.md - dodaj host u IMAGES_ALLOWED_HOSTS kad imas prava.',
  };
}
const FORMAT = (process.env.IMAGE_FORMAT ?? 'webp') as 'webp' | 'jpeg' | 'avif' | 'original';
const QUALITY = Number(process.env.IMAGE_QUALITY ?? 80);

const EXT_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/gif': 'gif',
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function log(message: string): void {
  console.log(`[${new Date().toISOString().slice(11, 19)}] ${message}`);
}

/** URL -> lokalna putanja, da se ista slika ne skida dvaput. */
type FileMap = Record<string, string>;

async function readMap(): Promise<FileMap> {
  if (!existsSync(MAP_FILE)) return {};
  try {
    return JSON.parse(await readFile(MAP_FILE, 'utf8')) as FileMap;
  } catch {
    return {};
  }
}

async function writeMap(map: FileMap): Promise<void> {
  await mkdir(dirname(MAP_FILE), { recursive: true });
  await writeFile(MAP_FILE, JSON.stringify(map, null, 2), 'utf8');
}

export interface DownloadResult {
  path: string;
  bytesIn: number;
  bytesOut: number;
  reusedFile: boolean;
}

/**
 * Skine jednu sliku, obradi je i sacuva. Vraca lokalnu putanju i velicine.
 * Odbija sve sto nije slika i sve sto je prevelko - da nam se u
 * `public/` ne nakupi smece ili HTML stranica greske.
 */
export async function downloadOne(url: string): Promise<DownloadResult> {
  const response = await fetch(url, {
    headers: { 'user-agent': config.userAgent, accept: 'image/*' },
    redirect: 'follow',
    signal: AbortSignal.timeout(25_000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const type = (response.headers.get('content-type') ?? '').split(';')[0]!.trim().toLowerCase();
  const ext = EXT_BY_TYPE[type];
  if (!ext) throw new Error(`nije slika (content-type: ${type || 'nepoznat'})`);

  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.byteLength === 0) throw new Error('prazan fajl');
  if (buffer.byteLength > MAX_BYTES) throw new Error(`prevelika (${buffer.byteLength} B)`);

  // 1) smanji i pretvori u WebP  2) imenuj po sadrzaju (dedup)
  const out = await processImage(buffer, { maxSize: MAX_SIZE, format: FORMAT, quality: QUALITY }, ext);
  const name = contentNameFor(out.data, out.ext);
  const target = resolve(OUT_DIR, name);

  await mkdir(OUT_DIR, { recursive: true });
  // Ista slika sa drugog URL-a? Fajl vec postoji - ne pisemo ga ponovo.
  const alreadyOnDisk = existsSync(target);
  if (!alreadyOnDisk) await writeFile(target, out.data);

  return {
    path: `${PUBLIC_PREFIX}/${name}`,
    bytesIn: buffer.byteLength,
    bytesOut: out.data.byteLength,
    reusedFile: alreadyOnDisk,
  };
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const dryRun = argv.includes('--dry-run');
  const limit = Number(argv.find((a) => a.startsWith('--limit='))?.slice(8) ?? 500);

  const map = await readMap();
  log(`Vec skinuto: ${Object.keys(map).length} slika`);

  const { rows } = await pool.query<{ image_url: string; broj: string }>(
    `select image_url, count(*)::text as broj
       from ak_discounts
      where image_url is not null
        and image_url ~* '^https?://'
      group by image_url
      order by count(*) desc
      limit $1`,
    [limit],
  );
  log(`Slika sa tudjeg servera: ${rows.length}`);
  if (rows.length === 0) {
    log('Nema sta skidati - sve slike su vec lokalne.');
    await closePool();
    return;
  }

  let downloaded = 0;
  let reused = 0;
  let failed = 0;
  let rewritten = 0;
  let bytesIn = 0;
  let bytesOut = 0;

  let blocked = 0;
  for (const row of rows) {
    const url = row.image_url;

    const permission = mayDownload(url);
    if (!permission.ok) {
      blocked += 1;
      if (blocked <= 3) log(`PRESKACEM ${url}: ${permission.reason}`);
      continue;
    }

    let local = map[url];

    if (local && existsSync(resolve(OUT_DIR, local.replace(`${PUBLIC_PREFIX}/`, '')))) {
      reused += 1;
    } else {
      if (dryRun) {
        log(`DRY RUN: skinuo bih ${url}`);
        continue;
      }
      try {
        const saved = await downloadOne(url);
        local = saved.path;
        map[url] = saved.path;
        await writeMap(map);
        downloaded += 1;
        bytesIn += saved.bytesIn;
        bytesOut += saved.bytesOut;
        log(
          `OK   ${(saved.bytesIn / 1024).toFixed(0)} KB -> ${(saved.bytesOut / 1024).toFixed(1)} KB  ${local}`,
        );
      } catch (error) {
        failed += 1;
        log(`PAO  ${url}: ${error instanceof Error ? error.message : String(error)}`);
        continue;
      }
      await sleep(DELAY_MS);
    }

    if (!local || dryRun) continue;
    const result = await pool.query('update ak_discounts set image_url = $1 where image_url = $2', [
      local,
      url,
    ]);
    rewritten += result.rowCount ?? 0;
  }

  if (blocked > 0) {
    log(
      `PRAVNA KOCNICA: preskoceno ${blocked} slika sa tudjih servera. ` +
        `Aplikacija za njih prikazuje vlastitu ilustraciju. Detalji: docs/pravno.md`,
    );
  }

  const files = existsSync(OUT_DIR) ? (await readdir(OUT_DIR)).length : 0;
  log(
    `Gotovo. skinuto: ${downloaded}, iz cachea: ${reused}, palo: ${failed}, ` +
      `redova prepisano: ${rewritten}${dryRun ? ' (dry-run)' : ''}`,
  );
  if (bytesIn > 0) {
    log(
      `Storage: skinuto ${(bytesIn / 1048576).toFixed(1)} MB -> sacuvano ` +
        `${(bytesOut / 1048576).toFixed(2)} MB (${(100 - (100 * bytesOut) / bytesIn).toFixed(0)}% manje)`,
    );
  }
  log(`Folder: ${OUT_DIR} (${files} fajlova, format ${FORMAT}, max ${MAX_SIZE}px)`);
  await closePool();
}

// Pokreni samo kad je ovo ulazna tocka (da testovi mogu importovati funkcije)
if (process.argv[1] && process.argv[1].includes('downloadImages')) {
  main().catch(async (error) => {
    console.error('images:download je pao:', error);
    await closePool().catch(() => {});
    process.exit(1);
  });
}

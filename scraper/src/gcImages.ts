/**
 * =====================================================================
 *  Ciscenje neiskoristenih slika  ->  npm run images:gc
 * =====================================================================
 *  Snapshoti se cuvaju 14 dana (`prune_old_snapshots`), pa slike artikala
 *  koji vise nisu ni u jednom snapshotu nikome ne trebaju. Bez ovoga bi
 *  folder rastao zauvijek.
 *
 *  Radi tako da uporedi fajlove na disku sa `image_url` vrijednostima u
 *  bazi i obrise samo one koje NIKO ne koristi.
 *
 *    npm run images:gc -- --dry-run   # samo prikaz
 *    npm run images:gc                # obrisi
 * =====================================================================
 */
import { existsSync } from 'node:fs';
import { readdir, stat, unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import { closePool, pool } from './db.js';

const OUT_DIR = resolve(process.cwd(), process.env.IMAGE_DIR ?? '../web/public/products');
const PUBLIC_PREFIX = process.env.IMAGE_PUBLIC_PREFIX ?? '/products';

function log(message: string): void {
  console.log(`[${new Date().toISOString().slice(11, 19)}] ${message}`);
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes('--dry-run');
  if (!existsSync(OUT_DIR)) {
    log(`Folder ne postoji: ${OUT_DIR} - nema sta cistiti.`);
    await closePool();
    return;
  }

  const files = await readdir(OUT_DIR);
  const { rows } = await pool.query<{ image_url: string }>(
    `select distinct image_url from ak_discounts where image_url like $1`,
    [`${PUBLIC_PREFIX}/%`],
  );
  const used = new Set(rows.map((r) => r.image_url.slice(PUBLIC_PREFIX.length + 1)));

  let removed = 0;
  let freed = 0;
  for (const file of files) {
    if (used.has(file)) continue;
    const path = resolve(OUT_DIR, file);
    freed += (await stat(path)).size;
    removed += 1;
    if (!dryRun) await unlink(path);
    log(`${dryRun ? 'BRISAO BIH' : 'obrisano'}  ${file}`);
  }

  log(
    `Gotovo. na disku: ${files.length}, u upotrebi: ${used.size}, ` +
      `${dryRun ? 'za brisanje' : 'obrisano'}: ${removed} (${(freed / 1048576).toFixed(2)} MB)`,
  );
  await closePool();
}

if (process.argv[1] && /gcImages/.test(process.argv[1])) {
  main().catch(async (error) => {
    console.error('images:gc je pao:', error);
    await closePool().catch(() => {});
    process.exit(1);
  });
}

/**
 * =====================================================================
 *  Trajni sloj -> današnji snapshot     ->  npm run layer:apply
 * =====================================================================
 *  Pokreće se ODMAH POSLIJE scrapea, svaki dan. Radi tri stvari:
 *
 *   1. prelije slike iz `product_images` na nove redove (po EAN-u, pa
 *      po product_key) — zato tvoje jučerašnje odluke ne nestaju;
 *   2. primijeni `moderation` — trajno sakriveni artikli ostaju sakriveni;
 *   3. provjeri zdravlje scrapea i javi ako je nešto palo.
 *
 *  Redoslijed u cronu (06:00):
 *      scraper  ->  layer:apply  ->  prices:apply
 * =====================================================================
 */
import { closePool, pool, scrapeHealth } from './db.js';

const log = (m: string) => console.log(`[${new Date().toISOString().slice(11, 19)}] ${m}`);

export interface LayerResult {
  byEan: number;
  byKey: number;
  hidden: number;
}

/** Prelije trajne odluke na najnoviji snapshot. */
export async function applyLayer(plz?: string): Promise<LayerResult> {
  const { rows } = await pool.query<{ by_ean: string; by_key: string; hidden_rows: string }>(
    'select * from ak_apply_product_layer($1)',
    [plz ?? null],
  );
  const r = rows[0];
  return {
    byEan: Number(r?.by_ean ?? 0),
    byKey: Number(r?.by_key ?? 0),
    hidden: Number(r?.hidden_rows ?? 0),
  };
}

/**
 * Tekst alarma, ili null kad je sve u redu.
 * Čista funkcija da se može testirati bez baze.
 */
export function alarmText(
  health: Array<{ store: string | null; plz: string; today: number; yesterday: number; changePct: number | null; broken: boolean }>,
): string | null {
  const bad = health.filter((h) => h.broken);
  if (bad.length === 0) return null;
  const lines = bad.map((h) => {
    const who = `${h.store ?? 'nepoznata prodavnica'} (${h.plz})`;
    if (h.today === 0) return `• ${who}: 0 artikala (juče ${h.yesterday})`;
    return `• ${who}: ${h.today} artikala, juče ${h.yesterday} (${h.changePct}%)`;
  });
  return `kodnas.de — scraper: ${bad.length} problem(a)\n${lines.join('\n')}`;
}

async function main(): Promise<void> {
  const plz = process.argv.slice(2).find((a) => a.startsWith('--plz='))?.slice(6);

  const r = await applyLayer(plz);
  log(`Slike prelivene: ${r.byEan} po EAN-u, ${r.byKey} po nazivu. Sakriveno: ${r.hidden}.`);

  const health = await scrapeHealth();
  const alarm = alarmText(health);
  if (alarm) {
    // Namjerno na stderr: cron ovo šalje na mejl bez ikakve dodatne
    // konfiguracije. Telegram/webhook se dodaje kasnije na isto mjesto.
    console.error(`\n${alarm}\n`);
    log('ALARM: scraper ima problema (vidi gore).');
  } else {
    log(`Zdravlje scrapera: sve u redu (${health.length} prodavnica).`);
  }

  await closePool();
  if (alarm) process.exitCode = 3; // cron/monitoring vidi da nije čisto
}

if (process.argv[1] && /applyLayer\.(ts|js)$/.test(process.argv[1])) {
  main().catch(async (error) => {
    console.error('layer:apply je pao:', error);
    await closePool().catch(() => {});
    process.exit(1);
  });
}

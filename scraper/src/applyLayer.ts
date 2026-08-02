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
export interface AlarmRed {
  store: string | null;
  plz: string;
  today: number;
  yesterday: number;
  changePct: number | null;
  broken: boolean;
}

export interface AlarmIshod {
  /** tekst za mejl/log, ili null kad nema ništa za javiti */
  tekst: string | null;
  /** true SAMO kad je neka prodavnica na NULI — tada posao pada (kod 3) */
  kvar: boolean;
}

/**
 * Razdvaja PRAVI kvar od normalnog sedmičnog ritma.
 *
 *  • 0 artikala   → KVAR. Lanac je promijenio stranicu ili nas blokirao.
 *  • veliki pad   → samo upozorenje. Nedjeljom je to očekivano: Aldijeve
 *    sedmične ponude ističu u subotu, pa ostanu samo „Dauerhaft" artikli
 *    (23 → 12, −48%). Kad bi to obaralo posao, alarm bi lagao svake
 *    nedjelje — a lažan alarm koji se ponavlja prestane se čitati.
 *    Uz to bi koraci sa slikama ostali nepokrenuti.
 */
export function alarmText(health: AlarmRed[]): AlarmIshod {
  const nula = health.filter((h) => h.broken && h.today === 0);
  const pad = health.filter((h) => h.broken && h.today > 0);
  if (nula.length === 0 && pad.length === 0) return { tekst: null, kvar: false };

  const dijelovi: string[] = [];
  if (nula.length > 0) {
    dijelovi.push(
      `kodnas.de — scraper: ${nula.length} PRODAVNICA NA NULI`,
      ...nula.map((h) => `• ${h.store ?? 'nepoznata prodavnica'} (${h.plz}): 0 artikala (juče ${h.yesterday})`),
    );
  }
  if (pad.length > 0) {
    dijelovi.push(
      `${nula.length ? '\n' : ''}Upozorenje — velik pad (nedjeljom je normalno):`,
      ...pad.map(
        (h) => `• ${h.store ?? 'nepoznata prodavnica'} (${h.plz}): ${h.today} artikala, juče ${h.yesterday} (${h.changePct}%)`,
      ),
    );
  }
  return { tekst: dijelovi.join('\n'), kvar: nula.length > 0 };
}

async function main(): Promise<void> {
  const plz = process.argv.slice(2).find((a) => a.startsWith('--plz='))?.slice(6);

  const r = await applyLayer(plz);
  log(`Slike prelivene: ${r.byEan} po EAN-u, ${r.byKey} po nazivu. Sakriveno: ${r.hidden}.`);

  const health = await scrapeHealth();
  const { tekst, kvar } = alarmText(health);
  if (tekst) {
    // Namjerno na stderr: cron ovo šalje na mejl bez ikakve dodatne
    // konfiguracije. Telegram/webhook se dodaje kasnije na isto mjesto.
    console.error(`\n${tekst}\n`);
    log(kvar ? 'ALARM: prodavnica na nuli (vidi gore).' : 'Upozorenje: velik pad, ali nije nula.');
  } else {
    log(`Zdravlje scrapera: sve u redu (${health.length} prodavnica).`);
  }

  await closePool();
  // Posao pada SAMO na pravi kvar (nula artikala). Velik pad je često
  // normalan sedmični ritam — ne smije obarati korake sa slikama.
  if (kvar) process.exitCode = 3;
}

if (process.argv[1] && /applyLayer\.(ts|js)$/.test(process.argv[1])) {
  main().catch(async (error) => {
    console.error('layer:apply je pao:', error);
    await closePool().catch(() => {});
    process.exit(1);
  });
}

// ============================================================
// BOT CONFIG — raspored bota (čita/piše u tabelu bot_config)
// ============================================================
import { createServerClient } from "@/lib/supabase";

export interface BotConfig {
  aktivan: boolean;
  vremena: string[]; // "HH:MM" po Berlinu
  kvota_de: number;
  kvota_bih: number;
  kvota_svijet: number;
  kvota_sport: number;
  zadnji_slot: string | null;
}

export const DEFAULT_CONFIG: BotConfig = {
  aktivan: true,
  vremena: ["06:00", "12:30", "20:00"],
  kvota_de: 1,
  kvota_bih: 1,
  kvota_svijet: 1,
  kvota_sport: 1,
  zadnji_slot: null,
};

function broj(v: unknown, def: number, max = 10): number {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) return def;
  return Math.min(Math.floor(n), max);
}

// Validiraj "HH:MM" i normalizuj (npr. "6:5" → "06:05")
export function validVrijeme(s: unknown): string | null {
  if (typeof s !== "string") return null;
  const m = /^(\d{1,2}):(\d{1,2})$/.exec(s.trim());
  if (!m) return null;
  const h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

export async function dajBotConfig(): Promise<BotConfig> {
  try {
    const db = createServerClient();
    const { data, error } = await db.from("bot_config").select("*").eq("id", 1).maybeSingle();
    if (error || !data) return { ...DEFAULT_CONFIG };
    const vremena = Array.isArray(data.vremena)
      ? (data.vremena.map(validVrijeme).filter(Boolean) as string[])
      : [];
    return {
      aktivan: data.aktivan ?? true,
      vremena: vremena.length ? vremena : DEFAULT_CONFIG.vremena,
      kvota_de: broj(data.kvota_de, 1),
      kvota_bih: broj(data.kvota_bih, 1),
      kvota_svijet: broj(data.kvota_svijet, 1),
      kvota_sport: broj(data.kvota_sport, 1),
      zadnji_slot: data.zadnji_slot ?? null,
    };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export async function snimiBotConfig(patch: Partial<BotConfig>): Promise<BotConfig> {
  const db = createServerClient();

  const izmjene: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (typeof patch.aktivan === "boolean") izmjene.aktivan = patch.aktivan;
  if (Array.isArray(patch.vremena)) {
    const cista = Array.from(
      new Set(patch.vremena.map(validVrijeme).filter(Boolean) as string[])
    ).sort();
    if (cista.length) izmjene.vremena = cista;
  }
  if (patch.kvota_de !== undefined) izmjene.kvota_de = broj(patch.kvota_de, 1);
  if (patch.kvota_bih !== undefined) izmjene.kvota_bih = broj(patch.kvota_bih, 1);
  if (patch.kvota_svijet !== undefined) izmjene.kvota_svijet = broj(patch.kvota_svijet, 1);
  if (patch.kvota_sport !== undefined) izmjene.kvota_sport = broj(patch.kvota_sport, 1);

  const { data, error } = await db
    .from("bot_config")
    .upsert({ id: 1, ...izmjene })
    .select()
    .single();
  if (error) throw new Error(error.message);

  return {
    aktivan: data.aktivan ?? true,
    vremena: Array.isArray(data.vremena) ? data.vremena : DEFAULT_CONFIG.vremena,
    kvota_de: data.kvota_de ?? 1,
    kvota_bih: data.kvota_bih ?? 1,
    kvota_svijet: data.kvota_svijet ?? 1,
    kvota_sport: data.kvota_sport ?? 1,
    zadnji_slot: data.zadnji_slot ?? null,
  };
}

// ============================================================
// VODIČI — Supabase CRUD helper
// ============================================================
import { createServerClient } from "./supabase";

export interface VodicKorak {
  broj: number;
  naslov: string;
  opis: string;
  savjet?: string;
}

export interface VodicRow {
  id: string;
  slug: string;
  naziv: string;
  opis: string;
  ikona: string;
  kategorija: string;
  min_citanja: number;
  tagovi: string[];
  tekst: string | null;       // Rich HTML sadržaj (za duge vodiče)
  koraci: VodicKorak[] | null; // Step-by-step (za kraće vodiče)
  aktivan: boolean;
  created_at: string;
  updated_at: string;
}

export type VodicInput = Omit<VodicRow, "id" | "created_at" | "updated_at" | "aktivan">;

// ── Javne funkcije (frontend) ──────────────────────────────

export async function getVodici(): Promise<VodicRow[]> {
  const db = createServerClient();
  const { data, error } = await db
    .from("vodici")
    .select("*")
    .eq("aktivan", true)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getVodicBySlug(slug: string): Promise<VodicRow | null> {
  const db = createServerClient();
  const { data, error } = await db
    .from("vodici")
    .select("*")
    .eq("slug", slug)
    .eq("aktivan", true)
    .maybeSingle();
  if (error || !data) return null;
  return data;
}

// ── Admin funkcije ─────────────────────────────────────────

export async function getAllVodiciAdmin(): Promise<VodicRow[]> {
  const db = createServerClient();
  const { data, error } = await db
    .from("vodici")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getVodicByIdAdmin(id: string): Promise<VodicRow | null> {
  const db = createServerClient();
  const { data, error } = await db
    .from("vodici")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return data;
}

export async function createVodic(vodic: VodicInput): Promise<VodicRow> {
  const db = createServerClient();
  const { data, error } = await db
    .from("vodici")
    .insert({ ...vodic, aktivan: true, updated_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateVodic(id: string, vodic: Partial<VodicInput>): Promise<VodicRow> {
  const db = createServerClient();
  const { data, error } = await db
    .from("vodici")
    .update({ ...vodic, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteVodic(id: string): Promise<void> {
  const db = createServerClient();
  const { error } = await db
    .from("vodici")
    .update({ aktivan: false, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

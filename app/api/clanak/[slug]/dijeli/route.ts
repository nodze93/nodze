// ============================================================
// API — prebroj dijeljenje članka (poziva ga "Podijeli" dugme)
// ============================================================
// Atomično poveća broj_dijeljenja za +1 preko RPC-a increment_dijeljenja
// (vidi supabase/dijeljenja.sql). Ako brojač zakaže, ne rušimo dijeljenje
// — vraćamo ok:false ali status 200, dugme svejedno radi.
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const db = createServerClient();
    const { error } = await db.rpc("increment_dijeljenja", { p_slug: slug });
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: (err as Error).message });
  }
}

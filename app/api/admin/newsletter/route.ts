// ============================================================
// ADMIN NEWSLETTER — pravi pretplatnici iz Supabase
// ============================================================
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = createServerClient();
    const { data, error } = await db
      .from("newsletter_subscribers")
      .select("id,email,aktivan,created_at")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);

    const pretplatnici = (data || []).map((p) => ({
      id: p.id,
      email: p.email,
      aktivan: p.aktivan,
      datum: new Date(p.created_at).toLocaleDateString("bs-BA"),
    }));
    return NextResponse.json({ pretplatnici, ukupno: pretplatnici.length });
  } catch (err) {
    return NextResponse.json({ pretplatnici: [], ukupno: 0, greska: (err as Error).message });
  }
}

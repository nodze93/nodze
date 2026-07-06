// ============================================================
// ADMIN PIPELINE — pravi logovi iz baze + ručno pokretanje bota
// ============================================================
// "Pokreni odmah" NE piše na Vercelu (60s limit ubija bota), nego
// pokreće GitHub Actions workflow (bez limita) preko GitHub API-ja.
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// GET — zadnjih 20 pravih logova
export async function GET() {
  try {
    const db = createServerClient();
    const { data, error } = await db
      .from("pipeline_logovi")
      .select("*")
      .order("datum", { ascending: false })
      .limit(20);
    if (error) throw new Error(error.message);

    const logs = (data || []).map((l, i) => ({
      id: l.id || i,
      datum: l.datum,
      status: l.status,
      clanci_napisano: l.clanci_napisano || 0,
      rss_vijesti: l.rss_vijesti || 0,
      trending_tema: l.trending_tema,
      greska: l.greska,
      trajanje_sekundi: l.trajanje_sekundi || 0,
    }));
    return NextResponse.json({ logs });
  } catch (err) {
    return NextResponse.json({ logs: [], greska: (err as Error).message });
  }
}

// POST — pokreni bota preko GitHub Actions (bez Vercel timeouta)
export async function POST() {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO || "nodze93/nodze";
  const workflow = process.env.GITHUB_WORKFLOW || "bot-cron.yml";
  const ref = process.env.GITHUB_REF || "main";

  if (!token) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "GITHUB_TOKEN nije postavljen u Vercel env varijablama. Dok ga ne dodaš, bota pokreni ručno: GitHub → Actions → Run workflow.",
      },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(
      `https://api.github.com/repos/${repo}/actions/workflows/${workflow}/dispatches`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ref }),
      }
    );

    // GitHub vraća 204 No Content na uspjeh
    if (res.status === 204) {
      return NextResponse.json({
        ok: true,
        poruka:
          "✅ Bot je pokrenut na GitHub Actions. Članci se pišu 2–3 minute — pa osvježi listu članaka.",
      });
    }

    const detalj = await res.text();
    return NextResponse.json(
      { ok: false, error: `GitHub API greška ${res.status}: ${detalj.slice(0, 200)}` },
      { status: 500 }
    );
  } catch (err) {
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}

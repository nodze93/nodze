// GET    /api/admin/vodici/[id]  — jedan vodič
// PUT    /api/admin/vodici/[id]  — ažuriraj
// DELETE /api/admin/vodici/[id]  — soft-delete (aktivan=false)
import { NextResponse } from "next/server";
import { getVodicByIdAdmin, updateVodic, deleteVodic } from "@/lib/vodici-db";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const vodic = await getVodicByIdAdmin(id);
  if (!vodic) return NextResponse.json({ error: "Nije pronađen" }, { status: 404 });
  return NextResponse.json({ vodic });
}

export async function PUT(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const vodic = await updateVodic(id, body);
    return NextResponse.json({ vodic });
  } catch (err) {
    console.error("PUT /api/admin/vodici/[id]:", err);
    return NextResponse.json({ error: "Greška pri snimanju" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    await deleteVodic(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/admin/vodici/[id]:", err);
    return NextResponse.json({ error: "Greška" }, { status: 500 });
  }
}

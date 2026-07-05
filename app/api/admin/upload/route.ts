import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Nema fajla" }, { status: 400 });
    }

    // Provjera tipa
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Samo slike su dozvoljene." }, { status: 400 });
    }

    // Provjera veličine (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Slika je prevelika. Max 5MB." }, { status: 400 });
    }

    // TODO: Supabase Storage upload
    // const bytes = await file.arrayBuffer()
    // const buffer = Buffer.from(bytes)
    // const fileName = `${Date.now()}-${file.name.replace(/[^a-z0-9.]/gi, '-')}`
    // const { data, error } = await supabaseAdmin.storage
    //   .from('clanci-slike')
    //   .upload(fileName, buffer, { contentType: file.type, upsert: false })
    // const { data: { publicUrl } } = supabaseAdmin.storage.from('clanci-slike').getPublicUrl(fileName)
    // return NextResponse.json({ url: publicUrl })

    // Mock response — vraća placeholder dok Supabase nije spojen
    const mockUrl = `https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80`;
    return NextResponse.json({
      ok: true,
      url: mockUrl,
      poruka: "Upload simuliran (poveži Supabase Storage za pravi upload)",
    });

  } catch {
    return NextResponse.json({ error: "Greška pri uploadu" }, { status: 500 });
  }
}

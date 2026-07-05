import Link from "next/link";

// ============================================================
// HORIZONTALNA KARTICA (v19 stil) — sličica lijevo, tag, naslov, meta
// Koristi se u gridu od 2 po redu (.card-grid-2)
// ============================================================

export interface KarticaHClanak {
  slug: string;
  naslov: string;
  kategorija: string;
  meta: string;
  slika?: string | null;
}

export default function KarticaH({ clanak }: { clanak: KarticaHClanak }) {
  return (
    <Link href={`/clanak/${clanak.slug}`} className="kartica-h">
      {clanak.slika ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={clanak.slika} alt="" className="kartica-h-thumb" />
      ) : (
        <div className="kartica-h-thumb" />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <span className={`tag-pill tag-${clanak.kategorija}`}>{clanak.kategorija}</span>
        <div className="kartica-h-naslov">{clanak.naslov}</div>
        <div className="kartica-h-meta">{clanak.meta}</div>
      </div>
    </Link>
  );
}

import Link from "next/link";
import { ClanakData } from "@/lib/data/clanci";

interface Props {
  clanak: ClanakData;
  varijanta?: "card" | "list" | "hero-mali";
}

export default function ClanakCard({ clanak, varijanta = "card" }: Props) {
  if (varijanta === "list") {
    return (
      <Link
        href={`/clanak/${clanak.slug}`}
        style={{
          display: "flex",
          gap: 16,
          padding: "16px 0",
          borderBottom: "1px solid var(--border)",
          textDecoration: "none",
          color: "inherit",
          transition: "opacity 0.15s",
        }}
        className="hover:opacity-80"
      >
        <div style={{ flex: 1 }}>
          <span className={`tag-pill tag-${clanak.kategorija}`} style={{ marginBottom: 6, display: "inline-block" }}>
            {clanak.kategorija}
          </span>
          <h3 style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.4, marginBottom: 6, color: "var(--tekst)" }}>
            {clanak.naslov}
          </h3>
          <p style={{ fontSize: 13, color: "var(--tekst-muted)", lineHeight: 1.5, marginBottom: 8 }}>
            {clanak.excerpt}
          </p>
          <div style={{ fontSize: 12, color: "var(--tekst-light)", display: "flex", gap: 12 }}>
            <span>{clanak.datum}</span>
            <span>·</span>
            <span>{clanak.minCitanja} min čitanja</span>
            <span>·</span>
            <span>{clanak.procitano.toLocaleString()} pročitano</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/clanak/${clanak.slug}`}
      style={{
        background: "var(--white)",
        padding: 16,
        cursor: "pointer",
        transition: "background 0.15s",
        display: "block",
        textDecoration: "none",
        color: "inherit",
      }}
      className="hover:bg-[#fafafa]"
    >
      <span className={`tag-pill tag-${clanak.kategorija}`}>{clanak.kategorija}</span>
      <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.4, marginBottom: 8, marginTop: 6 }}>
        {clanak.naslov}
      </div>
      <div style={{ fontSize: 11, color: "var(--tekst-light)" }}>
        {clanak.datum} · {clanak.minCitanja} min · {clanak.procitano.toLocaleString()} pročitano
      </div>
    </Link>
  );
}

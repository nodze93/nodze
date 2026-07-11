"use client";

import { useState } from "react";

const faqs = [
  {
    pitanje: "Koliko se čeka na vizni termin?",
    odgovor:
      "Trenutno 8–14 sedmica iz Sarajeva. Preporučujemo aplicirati čim imate ugovor o radu.",
  },
  {
    pitanje: "Da li trebam nostrifikaciju?",
    odgovor:
      "Ovisi o zanimanju. Za regulirana zanimanja (ljekar, inženjer) — obavezno. Za IT i mnoge druge nije uvijek potrebno.",
  },
  {
    pitanje: "Mogu li zadržati BiH državljanstvo?",
    odgovor:
      "Njemačka od 2024. dozvoljava dvojno državljanstvo — možeš uzeti njemačko i zadržati bosansko. Detalji su u našem vodiču o državljanstvu.",
  },
  {
    pitanje: "Kako prijaviti dijete za Kindergeld?",
    odgovor:
      "Prijaviš se odmah nakon poroda u Familienkasse. Ne čekaj — isplata ide od dana poroda, ali samo ako apliciraš u roku.",
  },
];

export default function FaqBox() {
  const [otvoren, setOtvoren] = useState<number | null>(null);

  return (
    <div
      style={{
        background: "var(--white)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid var(--border)",
          fontSize: 12,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          color: "var(--tekst-muted)",
        }}
      >
        Česta pitanja
      </div>

      {faqs.map((faq, i) => (
        <div
          key={i}
          style={{
            borderBottom: i < faqs.length - 1 ? "1px solid var(--border)" : "none",
          }}
        >
          <button
            onClick={() => setOtvoren(otvoren === i ? null : i)}
            style={{
              width: "100%",
              padding: "12px 16px",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              transition: "background 0.15s",
              background: "none",
              border: "none",
              textAlign: "left",
              color: "var(--tekst)",
            }}
            className="hover:bg-[#fafafa]"
          >
            {faq.pitanje}
            <span
              style={{
                color: "var(--zelena)",
                fontSize: 14,
                transition: "transform 0.2s",
                transform: otvoren === i ? "rotate(180deg)" : "none",
                display: "inline-block",
              }}
            >
              ▾
            </span>
          </button>

          {otvoren === i && (
            <div
              style={{
                padding: "0 16px 12px",
                fontSize: 12,
                color: "var(--tekst-muted)",
                lineHeight: 1.6,
              }}
            >
              {faq.odgovor}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

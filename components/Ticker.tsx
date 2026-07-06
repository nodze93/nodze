const tickerItems = [
  "Nova pravila za Aufenthaltstitel od 2026",
  "Minimalna plaća u Njemačkoj raste na 13.50€",
  "Kindergeld povećan na 255€",
  "Rok za Steuerklasse promjenu do 30.11.",
];

export default function Ticker() {
  // Spoji stavke sa separatorom; dupliramo za neprekidno (seamless) vrtenje
  const traka = tickerItems.join("　·　") + "　·　";

  return (
    <div
      style={{
        background: "var(--zelena)",
        color: "white",
        padding: "8px 0",
        fontSize: 12,
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      {/* "Uživo" badge — fiksan lijevo */}
      <span
        style={{
          fontWeight: 600,
          whiteSpace: "nowrap",
          background: "rgba(255,255,255,0.2)",
          padding: "2px 8px",
          borderRadius: 20,
          fontSize: 11,
          marginLeft: 24,
          marginRight: 16,
          flexShrink: 0,
          zIndex: 2,
        }}
      >
        Uživo
      </span>

      {/* Klizni sadržaj */}
      <div
        style={{
          flex: 1,
          overflow: "hidden",
          position: "relative",
          maskImage: "linear-gradient(to right, transparent, #000 24px, #000 92%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, #000 24px, #000 92%, transparent)",
        }}
      >
        <div className="ticker-track">
          <span className="ticker-seg">{traka}</span>
          <span className="ticker-seg" aria-hidden="true">{traka}</span>
        </div>
      </div>

      <style>{`
        .ticker-track {
          display: inline-flex;
          white-space: nowrap;
          will-change: transform;
          animation: ticker-scroll 28s linear infinite;
        }
        .ticker-track:hover {
          animation-play-state: paused;
        }
        .ticker-seg {
          opacity: 0.95;
          padding-right: 8px;
        }
        @keyframes ticker-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .ticker-track { animation: none; }
        }
      `}</style>
    </div>
  );
}

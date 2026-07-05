const tickerItems = [
  "Nova pravila za Aufenthaltstitel od 2026",
  "Minimalna plaća u Njemačkoj raste na 13.50€",
  "Kindergeld povećan na 255€",
  "Rok za Steuerklasse promjenu do 30.11.",
];

export default function Ticker() {
  return (
    <div
      style={{
        background: "var(--zelena)",
        color: "white",
        padding: "8px 24px",
        fontSize: 12,
        display: "flex",
        alignItems: "center",
        gap: 16,
        overflow: "hidden",
      }}
    >
      <span
        style={{
          fontWeight: 600,
          whiteSpace: "nowrap",
          background: "rgba(255,255,255,0.2)",
          padding: "2px 8px",
          borderRadius: 20,
          fontSize: 11,
        }}
      >
        Uživo
      </span>
      <span style={{ opacity: 0.95 }}>
        {tickerItems.join("  ·  ")}
      </span>
    </div>
  );
}

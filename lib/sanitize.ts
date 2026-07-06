// ============================================================
// SANITIZE — allowlist čišćenje HTML-a članaka (XSS zaštita)
// ============================================================
// Sadržaj članka dolazi od NAŠEG bota (Claude) i admina, ali se
// renderuje kroz dangerouslySetInnerHTML — pa ga čistimo kao
// defense-in-depth. Uklanja skripte, event handlere, opasne
// URL-ove i sve tagove van dozvoljene liste.
//
// (Ako ikad dozvoliš sadržaj od nepoznatih korisnika, pređi na
//  provjerenu biblioteku poput sanitize-html / DOMPurify.)

const DOZVOLJENI_TAGOVI = new Set([
  "p", "br", "hr", "h2", "h3", "h4",
  "ul", "ol", "li",
  "strong", "b", "em", "i", "u",
  "a", "blockquote",
  "table", "thead", "tbody", "tr", "th", "td",
  "figure", "figcaption", "img",
]);

export function ocistiHtml(html: string | null | undefined): string {
  if (!html) return "";
  let s = String(html);

  // 1) Ukloni opasne blokove ZAJEDNO sa sadržajem.
  s = s.replace(
    /<\s*(script|style|iframe|object|embed|noscript|template|svg|math)[\s\S]*?<\s*\/\s*\1\s*>/gi,
    ""
  );

  // 2) Ukloni preostale opasne otvarajuće/samo-zatvarajuće tagove.
  s = s.replace(
    /<\s*\/?\s*(script|style|iframe|object|embed|link|meta|base|form|input|button|svg|math)[^>]*>/gi,
    ""
  );

  // 3) Ukloni on* event handlere (onclick, onerror, onload, ...).
  s = s.replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");

  // 4) Neutrališi opasne URL šeme u href/src.
  s = s.replace(
    /\s(href|src)\s*=\s*("|')?\s*(javascript|vbscript|data)\s*:[^"'>\s]*("|')?/gi,
    ' $1="#"'
  );

  // 5) Ukloni SVE tagove koji nisu na dozvoljenoj listi (ostavi tekst).
  s = s.replace(/<\/?([a-zA-Z0-9]+)(?:\s[^>]*)?>/g, (match, tag: string) =>
    DOZVOLJENI_TAGOVI.has(tag.toLowerCase()) ? match : ""
  );

  return s;
}

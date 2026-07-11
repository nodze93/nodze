// ============================================================
// BOSANIZACIJA — deterministički popravak čestih kroatizama
// ============================================================
// Ovo NIJE model — obična zamjena riječi u kodu. Pouzdano 100% i BESPLATNO.
// Hvata mehaničke kroatizme koje Haiku često propusti. NE dira padeže/rod
// (to može samo jači model). Radi na stablu riječi pa hvata sve nastavke
// (financij→finansij → financijski→finansijski), uz očuvanje velikog slova.

const ZAMJENE: [RegExp, string][] = [
  [/\bfinancij/g, "finansij"],   // financije→finansije, financijski→finansijski
  [/\buopć/g, "uopšt"],          // uopće→uopšte, uopćen→uopšten
  [/\bprijevoz/g, "prevoz"],     // prijevoz→prevoz, prijevoznik→prevoznik
  [/\btisuć/g, "hiljad"],        // tisuća→hiljada, tisuće→hiljade
  [/\butjeca/g, "utica"],        // utjecaj→uticaj
  [/\butječ/g, "utič"],          // utječe→utiče
  [/\bovis/g, "zavis"],          // ovisi→zavisi, ovisnost→zavisnost, ovisan→zavisan
  [/\bdobiv/g, "dobij"],         // dobiva→dobija, dobiven→dobijen
  [/\bsudjelov/g, "učestvov"],   // sudjelovanje→učestvovanje
];

// Zamijeni stablo uz očuvanje velikog početnog slova.
function primijeni(text: string, re: RegExp, repl: string): string {
  return text.replace(new RegExp(re.source, "gi"), (m) => {
    const veliko = m[0] !== m[0].toLowerCase() && m[0] === m[0].toUpperCase();
    return veliko ? repl[0].toUpperCase() + repl.slice(1) : repl;
  });
}

export function bosaniziraj(text: string): string {
  if (!text) return text;
  let out = text;
  for (const [re, repl] of ZAMJENE) out = primijeni(out, re, repl);
  return out;
}

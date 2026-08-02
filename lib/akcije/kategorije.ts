/**
 * Prikazna imena kategorija — SAMO kozmetika, njemački ostaje njemački.
 *
 * U bazi i u URL-ovima kategorije žive kao ASCII ("Getraenke", "Gemuese"),
 * jer tako dolaze iz scrapera i tako se filtrira. Na ekranu se pišu
 * pravilno, s umlautima — "Getränke", "Gemüse" — jer "Getraenke" izgleda
 * kao greška u kucanju. NIŠTA se ne prevodi (odluka korisnika: publika
 * kupuje u njemačkim dućanima i navikla je na njemačke nazive).
 *
 * Vrijednosti koje nisu u mapi vraćaju se netaknute.
 */
const PRIKAZ: Record<string, string> = {
  Getraenke: 'Getränke',
  Gemuese: 'Gemüse',
  Tiefkuehl: 'Tiefkühl',
  Fruehstueck: 'Frühstück',
  Suesses: 'Süßes',
  Kaese: 'Käse',
};

export function kategorijaNaziv(kategorija: string | null | undefined): string {
  if (!kategorija) return '';
  return PRIKAZ[kategorija] ?? kategorija;
}

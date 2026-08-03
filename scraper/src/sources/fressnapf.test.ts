import assert from 'node:assert/strict';
import { test } from 'node:test';
import { idIzPutanje, kategorijaFressnapf, offerIzHtml, slikaIzHtml, staraIzProcenta } from './fressnapf.js';

test('Offer blok: cijena i rok', () => {
  const h = `<script type="application/ld+json">
    {"@type":"Product","offers":{"@type":"Offer","price":"153.29",
     "priceValidUntil":"2026-08-05T21:59:59+0000"}}</script>`;
  assert.deepEqual(offerIzHtml(h), { cijena: 153.29, rok: '2026-08-05T21:59:59+0000' });
});

test('sentinel 9999 = NIJE na akciji (prepoznaje se, ne baca se cijena)', () => {
  const h = `<script type="application/ld+json">
    {"@type":"Offer","price":"9.99","priceValidUntil":"9999-12-31T22:59:59+0000"}</script>`;
  const r = offerIzHtml(h);
  assert.equal(r.cijena, 9.99);
  assert.ok(r.rok?.startsWith('9999'), 'rok mora ostati 9999 da ga pozivalac prepozna');
});

test('bez Offer bloka → prazno', () => {
  assert.deepEqual(offerIzHtml('<html><body>ništa</body></html>'), { cijena: null, rok: null });
});

test('stara cijena se izvodi iz procenta (pravi podatak sa sajta)', () => {
  // 153,29 € uz −30% → 218,99 €, tačno kao na Fressnapfu
  assert.equal(staraIzProcenta(153.29, 30), 218.99);
  assert.equal(staraIzProcenta(10, 50), 20);
});

test('bez procenta ili besmislen procent → BEZ stare cijene (ne izmišljamo)', () => {
  assert.equal(staraIzProcenta(9.99, null), null);
  assert.equal(staraIzProcenta(9.99, 0), null);
  assert.equal(staraIzProcenta(9.99, 99), null); // >95% = sumnjivo
});

test('ID artikla iz putanje', () => {
  assert.equal(idIzPutanje('/p/4pets-rampe-easysteps-1110837/'), '1110837');
  assert.equal(idIzPutanje('/p/wolfsblut-adult-6x395-g-1357534/'), '1357534');
  assert.equal(idIzPutanje('/p/bez-broja/'), null);
});

test('slika: schema.org "image" ima prednost', () => {
  // Pravi slučaj: ime fajla NEMA ID artikla, pa bi traženje po ID-u palo.
  const h = `<script type="application/ld+json">
    {"@type":"Product","image":["https://media.os.fressnapf.com/products-v2/b/b/bb3e_3d00.jpg"]}
    </script>
    <img src="https://media.os.fressnapf.com/logos/royal_canin.jpg">`;
  assert.equal(
    slikaIzHtml(h, '1248088'),
    'https://media.os.fressnapf.com/products-v2/b/b/bb3e_3d00.jpg',
  );
});

test('slika: rezerva po ID-u kad schema.org nema image', () => {
  const h = `
    <img src="https://media.os.fressnapf.com/products-v2/a/b/tudja_9999999_0.jpg">
    <img src="https://media.os.fressnapf.com/products-v2/e/4/hash_1110837_11.jpg">`;
  assert.match(slikaIzHtml(h, '1110837')!, /1110837/);
  // ID ne pogodi ništa → radije NIŠTA nego tuđa slika
  assert.equal(slikaIzHtml(h, '5555555'), null);
  assert.equal(slikaIzHtml('<html></html>', '1110837'), null);
});

test('NIKAD og:image — kod Fressnapfa je to generički logo', () => {
  const h = `<meta property="og:image" content="https://www.fressnapf.de/img/og-fressnapf.jpg">`;
  assert.equal(slikaIzHtml(h, '1110837'), null, 'og:image se ne smije uzeti');
});

test('kategorija: LISTA ima prednost nad nazivom', () => {
  // "Royal Canin" sam po sebi ne kaže je li za psa ili mačku — zato lista.
  assert.equal(kategorijaFressnapf('Royal Canin Adult', 'Katze'), 'Katze');
  assert.equal(kategorijaFressnapf('Royal Canin Adult', 'Hund'), 'Hund');
});

test('kategorija: bez liste (summer-sale) pogađa se iz naziva', () => {
  assert.equal(kategorijaFressnapf('Trixie Hundeleine 2 m', null), 'Hund');
  assert.equal(kategorijaFressnapf('Kratzbaum Alpine XL', null), 'Katze');
  assert.equal(kategorijaFressnapf('Aquarium Filter 200 l', null), 'Fisch & Aquarium');
  assert.equal(kategorijaFressnapf('Wellensittich Futter 1 kg', null), 'Vogel');
  assert.equal(kategorijaFressnapf('Kaninchen Heu 5 kg', null), 'Kleintier');
  assert.equal(kategorijaFressnapf('Terrarium Lampe', null), 'Terraristik');
});

test('kategorija: ništa ne pogodi → Tierbedarf (kao OBI → Baumarkt)', () => {
  assert.equal(kategorijaFressnapf('Irgendwas XY-123', null), 'Tierbedarf');
});

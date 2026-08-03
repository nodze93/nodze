import assert from 'node:assert/strict';
import { test } from 'node:test';
import { bezDuplihRedova, idPrisutnihLanaca, type SnapshotRow } from './db.js';

const red = (over: Partial<SnapshotRow> = {}): SnapshotRow => ({
  productName: 'Gasgrill Evolve',
  oldPrice: 899,
  newPrice: 449.99,
  storeId: 170,
  category: 'Baumarkt',
  imageUrl: null,
  validFrom: '2026-08-01',
  validTo: '2026-08-31',
  sourceUrl: 'https://www.obi.de/p/111',
  externalId: 'obi-111',
  imageExact: true,
  imageSource: null,
  ean: null,
  scope: 'DE',
  ...over,
});

test('isti artikal iz dva listinga (različit URL) → jedan red', () => {
  // OBI slučaj: /promo/produkte/sale i /angebote znaju imati isti proizvod
  // pod različitim URL-om → dedup po URL-u ga ne uhvati → "131 akcija" u
  // traci, a 118 na stranici. Ključ: store + naziv + cijena + rok.
  const { ciste, duplih } = bezDuplihRedova([
    red({ sourceUrl: 'https://www.obi.de/p/111', externalId: 'obi-111' }),
    red({ sourceUrl: 'https://www.obi.de/p/222', externalId: 'obi-222' }),
  ]);
  assert.equal(ciste.length, 1);
  assert.equal(duplih, 1);
});

test('razmaci i velika/mala slova ne prave "različit" artikal', () => {
  const { ciste } = bezDuplihRedova([
    red({ productName: 'Gasgrill  Evolve' }),
    red({ productName: 'gasgrill evolve' }),
  ]);
  assert.equal(ciste.length, 1);
});

test('ista ponuda u DVIJE sedmice (REWE) ostaje dvaput — rok je dio ključa', () => {
  const { ciste, duplih } = bezDuplihRedova([
    red({ validTo: '2026-08-02' }),
    red({ validTo: '2026-08-09' }),
  ]);
  assert.equal(ciste.length, 2);
  assert.equal(duplih, 0);
});

test('različita cijena ili prodavnica = različit red', () => {
  const { ciste } = bezDuplihRedova([
    red({ newPrice: 449.99 }),
    red({ newPrice: 399.99 }),
    red({ storeId: 2 }),
  ]);
  assert.equal(ciste.length, 3);
});

test('prvi pobjeđuje (zadržava se prvi viđeni red)', () => {
  const { ciste } = bezDuplihRedova([
    red({ imageUrl: 'https://bilder.obi.de/prva.jpg' }),
    red({ imageUrl: 'https://bilder.obi.de/druga.jpg' }),
  ]);
  assert.equal(ciste[0]!.imageUrl, 'https://bilder.obi.de/prva.jpg');
});

// ---------------------------------------------------------------
// Zaštita "lanac sa 0 se ne briše" — koga smijemo prepisati od juče
// ---------------------------------------------------------------

test('prisutni lanci: samo oni koji su danas dali red, bez ponavljanja', () => {
  const ids = idPrisutnihLanaca([
    red({ storeId: 170 }),
    red({ storeId: 170, productName: 'Drugi artikal' }),
    red({ storeId: 42, productName: 'Treci artikal' }),
  ]);
  assert.deepEqual([...ids].sort((a, b) => a - b), [42, 170]);
});

test('lanac koji je danas PAO nije u listi → njega prepisujemo od juče', () => {
  // Aldi Nord (id 42) je 4× istekao na waitForSelector i nije dao nijedan red.
  const ids = idPrisutnihLanaca([red({ storeId: 170 }), red({ storeId: 8 })]);
  assert.ok(!ids.includes(42), 'pali lanac NE smije biti među prisutnima');
});

test('nijedan lanac nije prošao → prazna lista (prepisuje se sve od juče)', () => {
  // U SQL-u `store_id <> all('{}')` je TRUE za sve → prepiše se cijeli
  // jučerašnji snapshot umjesto da sajt ostane prazan.
  assert.deepEqual(idPrisutnihLanaca([]), []);
});

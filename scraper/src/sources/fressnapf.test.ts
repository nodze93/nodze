import assert from 'node:assert/strict';
import { test } from 'node:test';
import { idIzPutanje, offerIzHtml, slikaIzHtml, staraIzProcenta } from './fressnapf.js';

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

test('slika se bira po ID-u artikla, ne prva na stranici', () => {
  // Stranica ima 150+ slika (preporuke, baneri) — bez ID-a bismo uzeli tuđu.
  const h = `
    <img src="https://media.os.fressnapf.com/products-v2/a/b/tudja_9999999_0.jpg">
    <img src="https://media.os.fressnapf.com/products-v2/e/4/hash_1110837_11.jpg">`;
  assert.match(slikaIzHtml(h, '1110837')!, /1110837/);
  // kad ID ne pogodi ništa → radije NIŠTA nego tuđa slika
  assert.equal(slikaIzHtml(h, '5555555'), null);
  assert.equal(slikaIzHtml('<html></html>', '1110837'), null);
});

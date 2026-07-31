import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cleanProductName, normalizeCategory, parsePrice, sanitizeOffer, slugify } from './normalize.js';

test('parsePrice - njemacki format', () => {
  assert.equal(parsePrice('2,99 €'), 2.99);
  assert.equal(parsePrice('1.299,00 €'), 1299);
  assert.equal(parsePrice('0,49'), 0.49);
  assert.equal(parsePrice('statt 4,99'), 4.99);
  assert.equal(parsePrice('ab 1,99 €'), 1.99);
  assert.equal(parsePrice('nur 12,00 EUR'), 12);
  assert.equal(parsePrice('-,99 €'), 0.99);
  assert.equal(parsePrice('19'), 19);
  assert.equal(parsePrice('1.299'), 1299);
});

test('parsePrice - smece vraca null', () => {
  assert.equal(parsePrice(null), null);
  assert.equal(parsePrice(''), null);
  assert.equal(parsePrice('bez cijene'), null);
});

test('cleanProductName', () => {
  assert.equal(cleanProductName('  Rinderhack   500g \n'), 'Rinderhack 500g');
  assert.equal(cleanProductName('Angebot: Butter 250g'), 'Butter 250g');
  assert.equal(cleanProductName('x'), null);
});

test('slugify - njemacki umlauti', () => {
  assert.equal(slugify('Aldi Süd'), 'aldi-sued');
  assert.equal(slugify('Netto Marken-Discount'), 'netto-marken-discount');
});

test('normalizeCategory - iz naziva artikla', () => {
  assert.equal(normalizeCategory(null, 'Rinderhackfleisch 500g'), 'Fleisch');
  assert.equal(normalizeCategory('Molkereiprodukte', null), 'Molkerei');
  assert.equal(normalizeCategory(null, 'Kopfhoerer Bluetooth'), 'Elektronik');
});

test('sanitizeOffer - lazna stara cijena postaje null (Angebot)', () => {
  const fake = sanitizeOffer({ productName: 'Butter', oldPrice: 1.49, newPrice: 1.49 });
  assert.equal(fake?.oldPrice, null);

  const real = sanitizeOffer({ productName: 'Butter', oldPrice: 2.49, newPrice: 1.49 });
  assert.equal(real?.oldPrice, 2.49);

  assert.equal(sanitizeOffer({ productName: null, oldPrice: null, newPrice: 1 }), null);
  assert.equal(sanitizeOffer({ productName: 'Butter', oldPrice: null, newPrice: null }), null);
});

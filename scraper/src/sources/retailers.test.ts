import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parsePrice } from '../normalize.js';
import { normPriceText } from './retailers.js';

// Kaufland cijene dolaze kao "1.99" (tačka = decimalni zarez). Bez pretvaranja
// parsePrice bi tačku shvatio kao hiljade i "1.99" pročitao kao 1 (ili slično).
test('Kaufland: "1.99" (tačka) → 1,99 → 1.99 €', () => {
  assert.equal(parsePrice(normPriceText('1.99', true)), 1.99);
  assert.equal(parsePrice(normPriceText('17.79', true)), 17.79);
  assert.equal(parsePrice(normPriceText('0.99', true)), 0.99);
  assert.equal(parsePrice(normPriceText('1.00', true)), 1.0);
});

test('Aldi: "3,99 €" (zarez) ostaje netaknut i čita se tačno', () => {
  assert.equal(parsePrice(normPriceText('3,99 €', false)), 3.99);
  assert.equal(parsePrice(normPriceText('4,99 €', false)), 4.99);
  assert.equal(parsePrice(normPriceText('0,88 €', false)), 0.88);
});

test('normPriceText dira SAMO čist "broj.dvije-cifre" (ne kvari ostalo)', () => {
  // troznamenkasti "hiljadu" ostaje parsePrice-u da ga sam riješi
  assert.equal(normPriceText('1.299', true), '1.299');
  // već sa €/zarezom se ne dira
  assert.equal(normPriceText('9,99 €', true), '9,99 €');
});

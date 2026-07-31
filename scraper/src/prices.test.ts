import assert from 'node:assert/strict';
import { test } from 'node:test';
import { lowestInWindow, productKey } from './prices.js';

const obs = (date: string, price: number) => ({ date, price });

test('lowestInWindow - uzme najnizu u prozoru, ne prosjek ni zadnju', () => {
  const data = [obs('2026-07-01', 4.99), obs('2026-07-10', 3.99), obs('2026-07-20', 4.79)];
  // referenca za popust mora biti najniza => 3.99
  assert.equal(lowestInWindow(data, '2026-07-30', 30), 3.99);
});

test('lowestInWindow - ignorise cijene starije od prozora', () => {
  const data = [obs('2026-06-01', 1.99), obs('2026-07-25', 3.49)];
  // 1.99 je 59 dana staro -> van 30-dnevnog prozora -> ne racuna se
  assert.equal(lowestInWindow(data, '2026-07-30', 30), 3.49);
});

test('lowestInWindow - ignorise cijene iz buducnosti', () => {
  const data = [obs('2026-08-05', 1.0), obs('2026-07-28', 3.0)];
  assert.equal(lowestInWindow(data, '2026-07-30', 30), 3.0);
});

test('lowestInWindow - nema podataka u prozoru -> null', () => {
  assert.equal(lowestInWindow([], '2026-07-30', 30), null);
  assert.equal(lowestInWindow([obs('2026-01-01', 1)], '2026-07-30', 30), null);
});

test('productKey - naziv+velicina, ista logika kao za slike', () => {
  // razlicita pakovanja -> razlicit kljuc (ne mijesaju se u istoriji)
  assert.notEqual(productKey('Nutella 250g'), productKey('Nutella 750g'));
  assert.equal(productKey('Nutella 750 g'), 'nutella 750g');
});

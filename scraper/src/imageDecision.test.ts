import assert from 'node:assert/strict';
import { test } from 'node:test';
import { decideImage, nameScore, normalizeEan, productKeyOf } from './imageDecision.js';

const off = (over: Partial<Parameters<typeof decideImage>[2]> = {}) => ({
  imageUrl: 'https://images.example/x.jpg',
  source: 'off' as const,
  ...over,
});

test('EAN se poklapa -> ide automatski i tacno je', () => {
  const d = decideImage('Nutella 450 g', '4008400401621', off({ ean: '4008400401621', title: 'bilo sta' }));
  assert.equal(d.action, 'auto');
  assert.equal(d.exact, true);
  assert.equal(d.matchKind, 'ean');
});

test('EAN se poredi bez vodecih nula (GTIN-13 vs GTIN-14)', () => {
  const d = decideImage('Nutella 450 g', '04008400401621', off({ ean: '4008400401621', title: 'x' }));
  assert.equal(d.matchKind, 'ean');
  assert.equal(normalizeEan('0004008400401621'), '4008400401621');
});

test('naziv + ista velicina -> automatski, tacno (bez EAN-a)', () => {
  const d = decideImage('Nutella 750 g', null, off({ title: 'Nutella 750g' }));
  assert.equal(d.action, 'auto');
  assert.equal(d.exact, true);
  assert.equal(d.matchKind, 'name+size');
});

test('druga velicina pakovanja -> automatski, ali "Abbildung ähnlich"', () => {
  // ovo je bas Nutella 450 vs 750: prikazujemo, ali posteno oznacimo
  const d = decideImage('Nutella 450 g', null, off({ title: 'Nutella 750 g' }));
  assert.equal(d.action, 'auto');
  assert.equal(d.exact, false);
  assert.equal(d.matchKind, 'name');
});

test('slabo poklapanje naziva -> ide covjeku na pregled', () => {
  const d = decideImage('Ja! Toastbrot 500 g', null, off({ title: 'Haribo Goldbären 200 g' }));
  assert.equal(d.action, 'review');
  assert.ok(d.matchScore < 0.6);
});

test('obrada pala -> pregled, ne postavlja se', () => {
  const d = decideImage('Weizenbier 20x0,5 L', null, off({ title: 'Weizenbier 20x0,5 L', quality: 0.08 }));
  assert.equal(d.action, 'review');
  assert.match(d.reason, /obrada pala/);
});

test('nema slike -> pregled', () => {
  const d = decideImage('Bilo sta', null, off({ imageUrl: null }));
  assert.equal(d.action, 'review');
});

test('rucno okacena slika je uvijek mjerodavna', () => {
  const d = decideImage('Ja! Toastbrot 500 g', null, { imageUrl: '/x.webp', source: 'manual' });
  assert.equal(d.action, 'auto');
  assert.equal(d.exact, true);
  assert.equal(d.matchKind, 'manual');
});

test('nameScore: isti naziv = 1, potpuno razlicit = 0', () => {
  assert.equal(nameScore('nutella', 'nutella'), 1);
  assert.equal(nameScore('nutella', 'haribo'), 0);
});

test('productKeyOf ukljucuje velicinu pakovanja', () => {
  assert.notEqual(productKeyOf('Nutella 250g'), productKeyOf('Nutella 750g'));
});

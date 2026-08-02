import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ocijeniOdgovor } from './checkImages.js';

test('404/410 = stvarno mrtva slika → smije se obrisati', () => {
  assert.equal(ocijeniOdgovor(404, ''), 'mrtva');
  assert.equal(ocijeniOdgovor(410, 'text/html'), 'mrtva');
});

test('prolazne greške NE brišu sliku (provjeri se sutra)', () => {
  // Upravo ovi statusi su ranije TRAJNO brisali image_url iz baze:
  assert.equal(ocijeniOdgovor(429, ''), 'preskoci'); // rate limit
  assert.equal(ocijeniOdgovor(403, ''), 'preskoci'); // CDN brani HEAD/bota
  assert.equal(ocijeniOdgovor(500, ''), 'preskoci');
  assert.equal(ocijeniOdgovor(503, ''), 'preskoci');
});

test('200 sa slikom (ili bez tipa, ili octet-stream) = živa', () => {
  assert.equal(ocijeniOdgovor(200, 'image/jpeg'), 'ziva');
  assert.equal(ocijeniOdgovor(200, ''), 'ziva');
  // dio CDN-ova sliku servira kao generički binarni tip — i to je živa slika
  assert.equal(ocijeniOdgovor(200, 'application/octet-stream'), 'ziva');
});

test('200 sa HTML-om = "meki 404" → mrtva', () => {
  assert.equal(ocijeniOdgovor(200, 'text/html; charset=utf-8'), 'mrtva');
});

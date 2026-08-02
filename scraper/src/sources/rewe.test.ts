import assert from 'node:assert/strict';
import { test } from 'node:test';
import { periodIzTaba } from './rewe.js';

// Referentni dan: subota, 1.8.2026. (isti kao u datumi.test.ts)
const DANAS = new Date(Date.UTC(2026, 7, 1));

test('tab sa tačkama — "Diese Woche 27.7. bis 2.8."', () => {
  assert.deepEqual(periodIzTaba('Diese Woche 27.7. bis 2.8.', DANAS), {
    validFrom: '2026-07-27',
    validTo: '2026-08-02',
  });
});

test('tab BEZ završnih tačaka — "Diese Woche 27.7 bis 2.8"', () => {
  // Upravo ovaj oblik je ranije davao period null → svi REWE artikli
  // preskočeni (`if (!validTo) continue`) → REWE = 0 na cijelom sajtu.
  assert.deepEqual(periodIzTaba('Diese Woche 27.7 bis 2.8', DANAS), {
    validFrom: '2026-07-27',
    validTo: '2026-08-02',
  });
});

test('slijepljen tekst bez razmaka — "Diese Woche27.7. bis 2.8."', () => {
  assert.deepEqual(periodIzTaba('Diese Woche27.7. bis 2.8.', DANAS), {
    validFrom: '2026-07-27',
    validTo: '2026-08-02',
  });
});

test('sljedeća sedmica — "Nächste Woche 3.8. bis 9.8."', () => {
  assert.deepEqual(periodIzTaba('Nächste Woche 3.8. bis 9.8.', DANAS), {
    validFrom: '2026-08-03',
    validTo: '2026-08-09',
  });
});

test('prazan/neupotrebljiv tab → prazno (artikal se preskače)', () => {
  assert.deepEqual(periodIzTaba(null, DANAS), { validFrom: null, validTo: null });
  assert.deepEqual(periodIzTaba('', DANAS), { validFrom: null, validTo: null });
  assert.deepEqual(periodIzTaba('Diese Woche', DANAS), { validFrom: null, validTo: null });
});

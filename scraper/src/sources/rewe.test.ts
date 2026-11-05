import assert from 'node:assert/strict';
import { test } from 'node:test';
import { periodIzSedmice, periodIzTaba } from './rewe.js';

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

// ── ISO sedmica sa same ponude (data-offer-week), od novembra 2026. ──
// Provjereno na rewe.de: ponude su nosile 2026/45, a njihov vlastiti tab
// je pisao „Diese Woche 2.11. bis 8.11." — isti period.
test('periodIzSedmice: 2026/45 je 2.11. do 8.11.', () => {
  assert.deepEqual(periodIzSedmice('2026/45'), {
    validFrom: '2026-11-02',
    validTo: '2026-11-08',
  });
});

test('periodIzSedmice: sedmica 1 zna preci u prethodnu godinu', () => {
  assert.deepEqual(periodIzSedmice('2026/1'), {
    validFrom: '2025-12-29',
    validTo: '2026-01-04',
  });
});

test('periodIzSedmice: smece daje prazno, ne pada', () => {
  assert.deepEqual(periodIzSedmice(null), { validFrom: null, validTo: null });
  assert.deepEqual(periodIzSedmice(''), { validFrom: null, validTo: null });
  assert.deepEqual(periodIzSedmice('2026/99'), { validFrom: null, validTo: null });
  assert.deepEqual(periodIzSedmice('current'), { validFrom: null, validTo: null });
});

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { procitajPeriod, vaziNa } from './datumi.js';

// Referentni dan za sve testove: subota, 1.8.2026.
const DANAS = new Date(Date.UTC(2026, 7, 1));

test('Kaufland — pun raspon bez godine', () => {
  assert.deepEqual(procitajPeriod('Gültig vom 30.07. bis 05.08.', 6, DANAS), {
    validFrom: '2026-07-30',
    validTo: '2026-08-05',
  });
});

test('Kaufland — pun raspon s godinom', () => {
  assert.deepEqual(
    procitajPeriod('Aktuelle Kaufland Card XTRA Angebote Gültig vom 30.07.2026 bis 05.08.2026', 6, DANAS),
    { validFrom: '2026-07-30', validTo: '2026-08-05' },
  );
});

test('Aldi Süd — Wochenangebote s oba datuma', () => {
  assert.deepEqual(procitajPeriod('Wochenangebote Mo., 27.7. – Sa., 1.8.', 6, DANAS), {
    validFrom: '2026-07-27',
    validTo: '2026-08-01',
  });
});

test('Aldi Süd — samo početak → kraj je subota te sedmice', () => {
  // ponedjeljak 27.7.2026 → subota 1.8.2026
  assert.deepEqual(procitajPeriod('Angebote ab Montag 27.7.', 6, DANAS), {
    validFrom: '2026-07-27',
    validTo: '2026-08-01',
  });
  // četvrtak 30.7. → ista subota
  assert.deepEqual(procitajPeriod('Angebote ab Donnerstag 30.7.', 6, DANAS), {
    validFrom: '2026-07-30',
    validTo: '2026-08-01',
  });
  assert.deepEqual(procitajPeriod('Angebote zum Wochenende ab 31.7.', 6, DANAS), {
    validFrom: '2026-07-31',
    validTo: '2026-08-01',
  });
});

test('Aldi Nord — Aktion + Nur', () => {
  assert.deepEqual(procitajPeriod('Aktion Mo. 27.7.', 6, DANAS), {
    validFrom: '2026-07-27',
    validTo: '2026-08-01',
  });
  // "Nur" = samo taj dan
  assert.deepEqual(procitajPeriod('Nur Sa. 1.8.', 6, DANAS), {
    validFrom: '2026-08-01',
    validTo: '2026-08-01',
  });
});

test('subota kao početak ostaje ta subota (ne skače sedmicu naprijed)', () => {
  assert.deepEqual(procitajPeriod('Aktion Sa. 1.8.', 6, DANAS), {
    validFrom: '2026-08-01',
    validTo: '2026-08-01',
  });
});

test('prelaz godine — decembar/januar', () => {
  const silvestar = new Date(Date.UTC(2026, 11, 28)); // 28.12.2026
  // "2.1." u decembru mora biti SLJEDEĆA godina
  assert.deepEqual(procitajPeriod('Gültig vom 28.12. bis 02.01.', 6, silvestar), {
    validFrom: '2026-12-28',
    validTo: '2027-01-02',
  });
  const nova = new Date(Date.UTC(2027, 0, 3)); // 3.1.2027
  // "29.12." u januaru je PROŠLA godina
  assert.equal(procitajPeriod('Angebote ab Dienstag 29.12.', 6, nova).validFrom, '2026-12-29');
});

test('tekst bez datuma ili bez najave → prazno', () => {
  assert.deepEqual(procitajPeriod('Dauerhaft günstige Produkte.', 6, DANAS), {
    validFrom: null,
    validTo: null,
  });
  assert.deepEqual(procitajPeriod('Alle Wochenangebote.', 6, DANAS), { validFrom: null, validTo: null });
  // cijena NIJE datum — nema najave perioda u tekstu
  assert.deepEqual(procitajPeriod('1.99', 6, DANAS), { validFrom: null, validTo: null });
  assert.deepEqual(procitajPeriod(null, 6, DANAS), { validFrom: null, validTo: null });
});

test('nepostojeći datum se ignoriše', () => {
  assert.deepEqual(procitajPeriod('Angebote ab 31.02.', 6, DANAS), { validFrom: null, validTo: null });
});

test('vaziNa — granice su uključive, prazno znači uvijek', () => {
  const p = { validFrom: '2026-07-30', validTo: '2026-08-05' };
  assert.equal(vaziNa(p, '2026-07-29'), false);
  assert.equal(vaziNa(p, '2026-07-30'), true);
  assert.equal(vaziNa(p, '2026-08-05'), true);
  assert.equal(vaziNa(p, '2026-08-06'), false);
  assert.equal(vaziNa({ validFrom: null, validTo: null }, '2030-01-01'), true);
});

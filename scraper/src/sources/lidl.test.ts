import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cijeneIzBoxa, spojiMarku, uzorakFilijala } from './lidl.js';

// ZAMKA: smallPartNumeric je STARA CIJENA, ne centi. Pravi podatak s API-ja:
//   { largePartNumeric: 3.79, smallPartNumeric: 4.98, strikethrough: true }
// Ako se shvati kao centi → "3.79 + 0.498" i popust ispadne besmislen.
test('cijene: large = nova, small = stara (ne centi)', () => {
  assert.deepEqual(
    cijeneIzBoxa({ largePartNumeric: 3.79, smallPartNumeric: 4.98, strikethrough: true }),
    { nova: 3.79, stara: 4.98 },
  );
});

test('bez strikethrough stara cijena NE vrijedi', () => {
  // Tada je smallPart samo grafika (npr. "je 100 g"), a ne prethodna cijena.
  assert.deepEqual(
    cijeneIzBoxa({ largePartNumeric: 1.99, smallPartNumeric: 99, strikethrough: false }),
    { nova: 1.99, stara: null },
  );
});

test('kampanja bez cijene → nova je null (artikal se preskače)', () => {
  assert.deepEqual(cijeneIzBoxa({ largePartString: 'Alle Biere' } as never), {
    nova: null,
    stara: null,
  });
  assert.deepEqual(cijeneIzBoxa(undefined), { nova: null, stara: null });
});

test('marka se ne duplira u nazivu', () => {
  // naslov već počinje markom → ne lijepi je opet
  assert.equal(
    spojiMarku('WAGNER', 'Wagner Flammkuchen Elsässer Art'),
    'Wagner Flammkuchen Elsässer Art',
  );
  // naslov ne sadrži marku → dodaj je sprijeda
  assert.equal(spojiMarku('MILBONA', 'Bergbauern Käse'), 'MILBONA Bergbauern Käse');
  assert.equal(spojiMarku('', 'Bananen'), 'Bananen');
});

test('uzorak filijala: par po pokrajini, ne sve 3.269', () => {
  const filijale = [
    { storeKey: 'a', state: 'Bayern' },
    { storeKey: 'b', state: 'Bayern' },
    { storeKey: 'c', state: 'Bayern' },
    { storeKey: 'd', state: 'Hessen' },
    { storeKey: 'e', state: 'Hessen' },
  ];
  const uzeto = uzorakFilijala(filijale, 2, 40);
  assert.equal(uzeto.length, 4); // 2 po pokrajini, treći iz Bayerna otpada
  assert.equal(uzeto.filter((s) => s.state === 'Bayern').length, 2);

  // gornja granica se poštuje
  assert.equal(uzorakFilijala(filijale, 2, 3).length, 3);
});

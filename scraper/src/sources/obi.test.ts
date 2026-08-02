import assert from 'node:assert/strict';
import { test } from 'node:test';
import { kategorijaObi, njemackiDatumUIso, rokIzPayloada } from './obi.js';

test('OBI grupe: majstorski artikli idu u SVOJE grupe, ne u hranu', () => {
  // Ranije: "Gasgrill" → Fleisch (meso), "Kühlschrank" → Gemuese (povrće)!
  assert.equal(kategorijaObi('Char-Broil Evolve Gasgrill mit Dualzone'), 'Grill');
  assert.equal(kategorijaObi('Kühlschrank 120 l mit Gefrierfach'), 'Haushaltsgeräte');
  assert.equal(kategorijaObi('Dreieckiges, graues LED-Sonnensegel Belvedere'), 'Garten');
  assert.equal(kategorijaObi('Blaues Igluzelt für 2 Personen aus Polyester'), 'Camping');
  assert.equal(kategorijaObi('Blaue LED-Laterne für Camping & Garten'), 'Camping');
  assert.equal(kategorijaObi('Akku-Bohrschrauber 18 V'), 'Werkzeug & Maschinen');
  assert.equal(kategorijaObi('Jamestown Einzelschrank Modul für KNOX Outdoorküche'), 'Garten');
  assert.equal(kategorijaObi('DENVER Mini-LED-Beamer PR-2500K'), 'Elektro & Licht');
  assert.equal(kategorijaObi('Gartenstuhl Pacora in Anthrazit mit Armlehnen'), 'Garten');
  assert.equal(kategorijaObi('Wandfliese Weiß 30x60'), 'Farben & Bauen');
  // ništa ne pogodi → ostaje Baumarkt
  assert.equal(kategorijaObi('Sonstiges Zeug XY-123'), 'Baumarkt');
});

test('njemački datum → ISO', () => {
  assert.equal(njemackiDatumUIso('03.08.2026'), '2026-08-03');
  assert.equal(njemackiDatumUIso('3.8.2026'), '2026-08-03'); // bez vodećih nula
  assert.equal(njemackiDatumUIso('31.12.2026'), '2026-12-31');
  assert.equal(njemackiDatumUIso('nesto'), null);
});

test('ONLINE_DEALS ima prednost nad NONE (precizniji je)', () => {
  // Payload zna sadržavati oba — akcijski rok mora pobijediti mjesečni period.
  const html =
    '…{"type":"NONE","from":"01.08.2026","to":"31.08.2026"}…' +
    '…"ONLINE_DEALS","03.08.2026"…';
  assert.deepEqual(rokIzPayloada(html), { validFrom: null, validTo: '2026-08-03' });
});

test('samo NONE → mjesečni period cijene', () => {
  const html = '…"NONE","01.08.2026","31.08.2026"…';
  assert.deepEqual(rokIzPayloada(html), {
    validFrom: '2026-08-01',
    validTo: '2026-08-31',
  });
});

test('bez ijednog roka → prazno (artikal se preskače)', () => {
  assert.deepEqual(rokIzPayloada('<html>nista korisno</html>'), {
    validFrom: null,
    validTo: null,
  });
});

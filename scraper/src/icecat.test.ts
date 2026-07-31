import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseIcecat } from './icecat.js';

// Oblik odgovora koji Icecat JSON API vraca (pojednostavljen, izmisljeni podaci).
const sample = {
  data: {
    GeneralInfo: {
      Title: 'Testni proizvod 750 g',
      Brand: 'TestBrand',
      GTIN: ['0000000000750'],
    },
    Image: {
      HighPic: 'https://images.icecat.example/high/750.jpg',
      LowPic: 'https://images.icecat.example/low/750.jpg',
    },
    Gallery: [{ Pic: 'https://images.icecat.example/gal/750-1.jpg' }],
  },
};

test('parseIcecat - izvuce veliku sliku, naziv, brend, GTIN', () => {
  const out = parseIcecat(sample);
  assert.equal(out?.imageUrl, 'https://images.icecat.example/high/750.jpg');
  assert.equal(out?.title, 'Testni proizvod 750 g');
  assert.equal(out?.brand, 'TestBrand');
  assert.equal(out?.gtin, '0000000000750');
  assert.equal(out?.attribution, 'Bild: Icecat');
});

test('parseIcecat - padne na galeriju kad nema HighPic', () => {
  const out = parseIcecat({
    data: { GeneralInfo: { Title: 'X' }, Gallery: [{ Pic: 'https://x/gal.jpg' }] },
  });
  assert.equal(out?.imageUrl, 'https://x/gal.jpg');
});

test('parseIcecat - nema slike -> null (ne lijepi prazno)', () => {
  assert.equal(parseIcecat({ data: { GeneralInfo: { Title: 'X' } } }), null);
  assert.equal(parseIcecat({}), null);
  assert.equal(parseIcecat(null), null);
});

test('parseIcecat - GTIN moze biti string ili niz', () => {
  const asString = parseIcecat({
    data: { GeneralInfo: { GTIN: '0000000000400' }, Image: { HighPic: 'https://x/a.jpg' } },
  });
  assert.equal(asString?.gtin, '0000000000400');
});

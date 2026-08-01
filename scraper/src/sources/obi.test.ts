import assert from 'node:assert/strict';
import { test } from 'node:test';
import { njemackiDatumUIso, rokIzPayloada } from './obi.js';

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

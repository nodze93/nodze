import assert from 'node:assert/strict';
import { test } from 'node:test';
import { alarmText, type AlarmRed } from './applyLayer.js';

const red = (over: Partial<AlarmRed> = {}): AlarmRed => ({
  store: 'Lidl',
  plz: '85737',
  today: 80,
  yesterday: 79,
  changePct: 1.3,
  broken: false,
  ...over,
});

test('sve u redu → nema ni teksta ni kvara', () => {
  assert.deepEqual(alarmText([red(), red({ store: 'REWE' })]), { tekst: null, kvar: false });
});

test('prodavnica na NULI → pravi kvar, posao mora pasti', () => {
  const r = alarmText([red(), red({ store: 'Netto', today: 0, yesterday: 39, broken: true })]);
  assert.equal(r.kvar, true, 'nula artikala mora oboriti posao');
  assert.match(r.tekst!, /Netto/);
  assert.match(r.tekst!, /0 artikala/);
  assert.match(r.tekst!, /NA NULI/);
});

test('velik pad ALI ne nula → samo upozorenje, posao NE pada', () => {
  // Pravi slučaj: nedjelja 2.8. Aldijeve sedmične ponude su istekle u subotu,
  // ostalo je 12 „Dauerhaft" artikala. To je normalan ritam, ne kvar.
  const r = alarmText([
    red({ store: 'Aldi Süd', today: 12, yesterday: 23, changePct: -47.8, broken: true }),
  ]);
  assert.equal(r.kvar, false, 'pad bez nule NE smije oboriti posao');
  assert.match(r.tekst!, /Aldi Süd/);
  assert.match(r.tekst!, /-47\.8%/);
  assert.match(r.tekst!, /Upozorenje/);
});

test('i nula i pad odjednom → kvar, ali oboje se ispiše', () => {
  const r = alarmText([
    red({ store: 'Aldi Süd', today: 12, yesterday: 23, changePct: -47.8, broken: true }),
    red({ store: 'REWE', today: 0, yesterday: 105, broken: true }),
    red(),
  ]);
  assert.equal(r.kvar, true);
  assert.match(r.tekst!, /REWE/);
  assert.match(r.tekst!, /Aldi Süd/);
  assert.match(r.tekst!, /1 PRODAVNICA NA NULI/);
});

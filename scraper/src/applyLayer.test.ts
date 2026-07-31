import assert from 'node:assert/strict';
import { test } from 'node:test';
import { alarmText } from './applyLayer.js';

const row = (over: Partial<Parameters<typeof alarmText>[0][number]> = {}) => ({
  store: 'Lidl',
  plz: '85737',
  today: 80,
  yesterday: 79,
  changePct: 1.3,
  broken: false,
  ...over,
});

test('sve u redu -> nema alarma', () => {
  assert.equal(alarmText([row(), row({ store: 'REWE' })]), null);
});

test('prodavnica vratila nulu -> alarm je javi', () => {
  const t = alarmText([row(), row({ store: 'Netto', today: 0, yesterday: 39, broken: true })]);
  assert.ok(t);
  assert.match(t, /Netto/);
  assert.match(t, /0 artikala/);
});

test('veliki pad -> alarm sa procentom', () => {
  const t = alarmText([row({ store: 'REWE', today: 3, yesterday: 74, changePct: -95.9, broken: true })]);
  assert.ok(t);
  assert.match(t, /REWE/);
  assert.match(t, /-95\.9%/);
});

test('alarm broji koliko ih je palo', () => {
  const t = alarmText([
    row({ store: 'REWE', today: 3, yesterday: 74, changePct: -95.9, broken: true }),
    row({ store: 'Netto', today: 0, yesterday: 39, broken: true }),
    row(),
  ]);
  assert.match(t!, /2 problem/);
});

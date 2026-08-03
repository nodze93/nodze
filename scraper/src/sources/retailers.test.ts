import assert from 'node:assert/strict';
import { test } from 'node:test';
import { procitajPeriod } from '../datumi.js';
import { parsePrice } from '../normalize.js';
import { normPriceText, periodIzUrla, podstraniceIzLinkova } from './retailers.js';

// Kaufland cijene dolaze kao "1.99" (tačka = decimalni zarez). Bez pretvaranja
// parsePrice bi tačku shvatio kao hiljade i "1.99" pročitao kao 1 (ili slično).
test('Kaufland: "1.99" (tačka) → 1,99 → 1.99 €', () => {
  assert.equal(parsePrice(normPriceText('1.99', true)), 1.99);
  assert.equal(parsePrice(normPriceText('17.79', true)), 17.79);
  assert.equal(parsePrice(normPriceText('0.99', true)), 0.99);
  assert.equal(parsePrice(normPriceText('1.00', true)), 1.0);
});

test('Aldi: "3,99 €" (zarez) ostaje netaknut i čita se tačno', () => {
  assert.equal(parsePrice(normPriceText('3,99 €', false)), 3.99);
  assert.equal(parsePrice(normPriceText('4,99 €', false)), 4.99);
  assert.equal(parsePrice(normPriceText('0,88 €', false)), 0.88);
});

test('normPriceText dira SAMO čist "broj.dvije-cifre" (ne kvari ostalo)', () => {
  // troznamenkasti "hiljadu" ostaje parsePrice-u da ga sam riješi
  assert.equal(normPriceText('1.299', true), '1.299');
  // već sa €/zarezom se ne dira
  assert.equal(normPriceText('9,99 €', true), '9,99 €');
});

// ---------------------------------------------------------------
// ALDI SÜD — podstranice (/de/angebote.html je samo PREGLED)
// ---------------------------------------------------------------

const SUED =
  /^https:\/\/www\.aldi-sued\.de\/(angebote\/\d{4}-\d{2}-\d{2}|produkte\/wochenangebote\/k\/\d+)$/;

test('bira SAMO prave liste ponuda, ne cijeli meni', () => {
  const nadjeno = podstraniceIzLinkova(
    [
      'https://www.aldi-sued.de/angebote/2026-08-03',
      'https://www.aldi-sued.de/angebote/2026-08-06',
      'https://www.aldi-sued.de/produkte/wochenangebote/k/1588161426582123',
      // ovo NE smije ući:
      'https://www.aldi-sued.de/rezepte/backen',
      'https://www.aldi-sued.de/produkte/kaese/mozzarella/k/1588161425467089',
      'https://www.aldi-sued.de/angebote/2026-08-03?theme=Garten', // varijanta iste liste
      'https://www.aldi-nord.de/angebote/2026-08-03', // tuđi lanac
    ],
    SUED,
    8,
  );
  assert.deepEqual(nadjeno, [
    'https://www.aldi-sued.de/angebote/2026-08-03',
    'https://www.aldi-sued.de/angebote/2026-08-06',
    'https://www.aldi-sued.de/produkte/wochenangebote/k/1588161426582123',
  ]);
});

test('isti link dvaput (sidro / kosa crta) → jednom', () => {
  const nadjeno = podstraniceIzLinkova(
    [
      'https://www.aldi-sued.de/angebote/2026-08-03',
      'https://www.aldi-sued.de/angebote/2026-08-03/',
      'https://www.aldi-sued.de/angebote/2026-08-03#main',
    ],
    SUED,
    8,
  );
  assert.equal(nadjeno.length, 1);
});

test('granica broja podstranica se poštuje', () => {
  const puno = Array.from({ length: 20 }, (_, i) =>
    `https://www.aldi-sued.de/angebote/2026-08-${String(i + 1).padStart(2, '0')}`,
  );
  assert.equal(podstraniceIzLinkova(puno, SUED, 8).length, 8);
  assert.equal(podstraniceIzLinkova(puno, SUED, 0).length, 0);
});

test('datum iz URL-a → njemački period koji datumi.ts razumije', () => {
  assert.equal(
    periodIzUrla('https://www.aldi-sued.de/angebote/2026-08-03'),
    'Angebote ab 03.08.2026',
  );
  // stranica bez datuma (sedmične ponude) → prazno, ne izmišljamo
  assert.equal(periodIzUrla('https://www.aldi-sued.de/produkte/wochenangebote/k/1588161426582123'), '');
});

test('period iz URL-a se STVARNO pročita u validFrom/validTo', () => {
  // Aldi: krajSedmice = 6 (subota) → 03.08. (pon) … 08.08. (sub)
  const p = procitajPeriod(
    periodIzUrla('https://www.aldi-sued.de/angebote/2026-08-03'),
    6,
    new Date(Date.UTC(2026, 7, 3)),
  );
  assert.deepEqual(p, { validFrom: '2026-08-03', validTo: '2026-08-08' });
});

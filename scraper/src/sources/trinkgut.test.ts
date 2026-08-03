import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parsePrice } from '../normalize.js';
import { normPriceText } from './retailers.js';
import {
  bezTagova,
  kutije,
  linkIzKutije,
  nazivSaPakovanjem,
  procitajRok,
  slikaIzKutije,
} from './trinkgut.js';

// Pravi blok sa stranice (skraćen), sa svim zamkama koje smo našli.
const KUTIJA = `<div class="product-box box-boxed">
  <div class="product-image-wrapper">
    <a href="https://www.trinkgut.de/aktuelle-angebote/leikeim-cola-mix" title="Leikeim Cola-Mix" class="product-image-link">
      <img src="https://media.trinkgut.de/media/products_md/uploads/promotions/a.png"
           srcset="https://media.trinkgut.de/media/products_xs/uploads/promotions/a.png 114w, https://media.trinkgut.de/media/products_md/uploads/promotions/a.png 231w, https://media.trinkgut.de/media/products_xl/uploads/promotions/a.png 462w"
           alt="Leikeim Cola-Mix" class="product-image is-standard" loading="lazy">
    </a>
  </div>
  <div class="product-info">
    <div class="product-price-wrapper">
      <p class="product-price"> 11.<sup>99</sup> </p>
    </div>
    <p class="h4 product-name"> Leikeim Cola-Mix o. C-Orange </p>
    <p class="product-description"> teilweise koffeinhaltig, Kasten = 20 x 0,5 l Glas (1 l = € 1.20) zzgl. € 3.10 Pfand </p>
  </div>
</div>`;

test('ZAMKA 1: cijena razbijena <sup> tagom se čita cijela', () => {
  // "11.<sup>99</sup>" — bez skidanja tagova regex vidi samo "11."
  assert.equal(bezTagova(' 11.<sup>99</sup> '), '11.99');
});

test('ZAMKA 2: tačka je decimalni zarez (kao Kaufland), ne hiljade', () => {
  assert.equal(parsePrice(normPriceText(bezTagova('11.<sup>99</sup>'), true)), 11.99);
  assert.equal(parsePrice(normPriceText(bezTagova('0.<sup>99</sup>'), true)), 0.99);
  assert.equal(parsePrice(normPriceText(bezTagova('13.<sup>49</sup>'), true)), 13.49);
});

test('rok važenja: oba datuma u ISO', () => {
  assert.deepEqual(procitajRok('Gültig vom 03.08.2026 bis 08.08.2026 | Nur solange der Vorrat reicht.'), {
    validFrom: '2026-08-03',
    validTo: '2026-08-08',
  });
  // "ue" umjesto "ü" — bez ove varijante scraper bi tiho vratio 0 redova
  assert.deepEqual(procitajRok('Gueltig vom 3.8.2026 bis 8.8.2026'), {
    validFrom: '2026-08-03',
    validTo: '2026-08-08',
  });
});

test('bez roka → prazno, NE izmišljamo datum', () => {
  assert.deepEqual(procitajRok('Aktuelle Angebote'), { validFrom: null, validTo: null });
});

test('slika: iz srcset se uzima NAJVEĆA (products_xl), ne prva', () => {
  const u = slikaIzKutije(KUTIJA);
  assert.ok(u?.includes('products_xl'), `očekivan xl, dobio: ${u}`);
});

test('slika: kad nema srcset, pada na src', () => {
  const bezSrcset = '<img src="https://media.trinkgut.de/media/products_md/x.png" alt="a">';
  assert.equal(slikaIzKutije(bezSrcset), 'https://media.trinkgut.de/media/products_md/x.png');
  assert.equal(slikaIzKutije('<div>nista</div>'), null);
});

test('link artikla', () => {
  assert.equal(linkIzKutije(KUTIJA), 'https://www.trinkgut.de/aktuelle-angebote/leikeim-cola-mix');
});

test('naziv: pakovanje se zadržava, jedinična cijena i pfand se sijeku', () => {
  const opis = 'teilweise koffeinhaltig, Kasten = 20 x 0,5 l Glas (1 l = € 1.20) zzgl. € 3.10 Pfand';
  assert.equal(
    nazivSaPakovanjem('Leikeim Cola-Mix', opis),
    'Leikeim Cola-Mix — teilweise koffeinhaltig, Kasten = 20 x 0,5 l Glas',
  );
  // bez opisa naziv ostaje kakav jeste
  assert.equal(nazivSaPakovanjem('Vitamalz', null), 'Vitamalz');
  // opis koji je SAMO jedinična cijena se odbacuje (ostane prekratak)
  assert.equal(nazivSaPakovanjem('Vitamalz', '(1 l = € 1.35)'), 'Vitamalz');
});

test('razbijanje na kutije: broji artikle, ne dijelove stranice', () => {
  const stranica = `<header>Gültig vom 03.08.2026 bis 08.08.2026</header>${KUTIJA}${KUTIJA}<footer>x</footer>`;
  assert.equal(kutije(stranica).length, 2);
  assert.equal(kutije('<div>bez artikala</div>').length, 0);
});

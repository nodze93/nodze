import assert from 'node:assert/strict';
import { test } from 'node:test';
import { contentNameFor, fileNameFor, isRemote, processImage } from './imageFiles.js';
import { pickBestImage, type OffProduct } from './imageMatch.js';
import { imageKey, imageKeyLoose, sizeToken } from './imageCache.js';

test('imageKey - velicina pakovanja MORA biti u kljucu', () => {
  // Nutella 250g / 500g / 750g su tri razlicite tegle -> tri razlicita kljuca
  assert.equal(imageKey('Nutella 250g'), 'nutella 250g');
  assert.equal(imageKey('Nutella 500g'), 'nutella 500g');
  assert.equal(imageKey('Nutella 750 g'), 'nutella 750g');
  assert.notEqual(imageKey('Nutella 250g'), imageKey('Nutella 750 g'));

  assert.equal(imageKey('Milbona Sir Gouda 400 g'), 'milbona sir gouda 400g');
  assert.equal(imageKey('Coca-Cola 1,25L'), 'coca-cola 1.25l');
  assert.equal(imageKey('Coca-Cola 6x1,5L'), 'coca-cola 6x1.5l');
  assert.equal(imageKey('Toilettenpapier 10 Rollen'), 'toilettenpapier 10rollen');
});

test('imageKey - razlicita pakovanja NE dijele kljuc', () => {
  assert.notEqual(imageKey('Coca-Cola 1,25L'), imageKey('Coca-Cola 6x1,5L'));
  assert.notEqual(imageKey('Butter 250g'), imageKey('Butter 200 g'));
});

test('imageKeyLoose - bez velicine, za drugu sansu ("Abbildung ähnlich")', () => {
  assert.equal(imageKeyLoose('Nutella 750 g'), 'nutella');
  assert.equal(imageKeyLoose('Nutella 250g'), 'nutella');
  assert.equal(imageKeyLoose('Coca-Cola 6x1,5L'), 'coca-cola');
  // sve velicine dijele isti loose kljuc - to je i svrha
  assert.equal(imageKeyLoose('Butter 250g'), imageKeyLoose('Butter 200 g'));
});

test('sizeToken - prepoznaje pakovanje i multipack', () => {
  assert.equal(sizeToken('Nutella 750 g'), '750g');
  assert.equal(sizeToken('Coca-Cola 1,25L'), '1.25l');
  assert.equal(sizeToken('Coca-Cola 6x1,5L'), '6x1.5l');
  assert.equal(sizeToken('Katzenfutter 12x100g'), '12x100g');
  assert.equal(sizeToken('Windeln Gr.4 40St'), '40st');
  assert.equal(sizeToken('Bratwurst'), null);
});

const P = (name: string, brands: string, image?: string): OffProduct => ({
  product_name: name,
  brands,
  image_front_url: image,
});

test('pickBestImage - uzima najbolje poklapanje', () => {
  const products = [
    P('Buttermilch', 'Muller', 'https://x/buttermilch.jpg'),
    P('Deutsche Markenbutter', 'Frau Antje', 'https://x/butter.jpg'),
  ];
  assert.equal(pickBestImage(products, 'deutsche markenbutter'), 'https://x/butter.jpg');
});

test('pickBestImage - bez poklapanja vraca null (ne lijepi pogresnu sliku)', () => {
  const products = [P('Schokolade', 'Milka', 'https://x/schoko.jpg')];
  assert.equal(pickBestImage(products, 'parkside bohrmaschine'), null);
});

test('pickBestImage - preskace proizvode bez fotografije', () => {
  const products = [
    P('Nutella', 'Ferrero'), // nema slike
    P('Nutella Brotaufstrich', 'Ferrero', 'https://x/nutella.jpg'),
  ];
  assert.equal(pickBestImage(products, 'nutella'), 'https://x/nutella.jpg');
});

test('pickBestImage - prazna lista', () => {
  assert.equal(pickBestImage([], 'butter'), null);
});

test('isRemote - razlikuje tudji server od nase putanje', () => {
  assert.equal(isRemote('https://images.example.com/a.jpg'), true);
  assert.equal(isRemote('http://images.example.com/a.jpg'), true);
  assert.equal(isRemote('/products/abc.jpg'), false);
  assert.equal(isRemote('/demo/nutella.png'), false);
});

test('fileNameFor - isti URL uvijek isto ime, razlicit URL razlicito', () => {
  const a = fileNameFor('https://x/a.jpg', 'jpg');
  const b = fileNameFor('https://x/a.jpg', 'jpg');
  const c = fileNameFor('https://x/b.jpg', 'jpg');
  assert.equal(a, b);
  assert.notEqual(a, c);
  assert.match(a, /^[0-9a-f]{20}\.jpg$/);
});

// --------------------------------------------------------------------
// Storage: dedup po sadrzaju + smanjivanje slike
// --------------------------------------------------------------------
test('contentNameFor - ista slika sa dva URL-a = jedan fajl', () => {
  const a = Buffer.from('ista-slika-bajtovi');
  const b = Buffer.from('ista-slika-bajtovi');
  const c = Buffer.from('druga-slika');
  assert.equal(contentNameFor(a, 'webp'), contentNameFor(b, 'webp'));
  assert.notEqual(contentNameFor(a, 'webp'), contentNameFor(c, 'webp'));
  assert.match(contentNameFor(a, 'webp'), /^[0-9a-f]{20}\.webp$/);
});

test('processImage - smanji na 400px i pretvori u WebP', async () => {
  const { default: sharp } = await import('sharp');
  // velika "fotografija" 1000x1000
  const big = await sharp({
    create: { width: 1000, height: 1000, channels: 3, background: { r: 190, g: 60, b: 55 } },
  })
    .jpeg({ quality: 92 })
    .toBuffer();

  const out = await processImage(big, { maxSize: 400, format: 'webp', quality: 80 }, 'jpg');
  assert.equal(out.processed, true);
  assert.equal(out.ext, 'webp');
  assert.equal(out.width, 400);
  assert.equal(out.height, 400);
  assert.ok(out.data.byteLength < big.byteLength, 'obradjena slika mora biti manja od originala');
});

test('processImage - format "original" ne dira sliku', async () => {
  const input = Buffer.from('nije-slika-ali-ne-smije-puknuti');
  const out = await processImage(input, { maxSize: 400, format: 'original', quality: 80 }, 'png');
  assert.equal(out.processed, false);
  assert.equal(out.ext, 'png');
  assert.deepEqual(out.data, input);
});

test('processImage - neispravna slika vraca original, ne pada', async () => {
  const junk = Buffer.from('ovo-nije-slika');
  const out = await processImage(junk, { maxSize: 400, format: 'webp', quality: 80 }, 'jpg');
  assert.equal(out.processed, false);
  assert.deepEqual(out.data, junk);
});

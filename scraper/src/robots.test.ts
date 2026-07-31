import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isAllowed, parseRobots } from './robots.js';

// Pravi robots.txt sa kaufda.de (juli 2026). Bitno je da naš čitač ovo
// razumije isto kao pravi crawler — ranije je pravilo /*/*/ajax/ pogrešno
// blokiralo BAŠ SVE, pa je scraper stao već na spisku prodavnica.
const KAUFDA = `
User-agent: AdsBot-Google
Allow: /

User-agent: *
Crawl-delay: 2
Disallow: /Catalogue/
Disallow: /mv/
Disallow: /brochure-viewer/brochure
Disallow: /*/*/ajax/
Disallow: /dyn/
Disallow: /api/febe/
Disallow: /api/frontend/
Disallow: /sessionData
Disallow: /portal/
Disallow: /webapp/
Disallow: /shelf
Disallow: /contentViewer/
Disallow: /search
`;

const rules = parseRobots(KAUFDA, 'kodnas-bot/1.0');

test('spisak prodavnica /Umgebung/85737 je DOZVOLJEN (nije na listi zabrana)', () => {
  assert.equal(isAllowed(rules, '/Umgebung/85737'), true);
});

test('landing prodavnice /Prospekte/... je dozvoljen', () => {
  assert.equal(isAllowed(rules, '/Prospekte/lidl'), true);
});

test('/*/*/ajax/ NE blokira običnu dvosegmentnu putanju', () => {
  assert.equal(isAllowed(rules, '/Umgebung/85737'), true);
  // a baš /nesto/nesto/ajax/ jeste zabranjeno
  assert.equal(isAllowed(rules, '/store/123/ajax/list'), false);
});

test('eksplicitno zabranjene putanje ostaju zabranjene', () => {
  assert.equal(isAllowed(rules, '/Catalogue/12345'), false);
  assert.equal(isAllowed(rules, '/search?q=lidl'), false);
  assert.equal(isAllowed(rules, '/shelf'), false);
  assert.equal(isAllowed(rules, '/brochure-viewer/brochure/9'), false);
  assert.equal(isAllowed(rules, '/contentViewer/x'), false);
});

test('AdsBot-Google grupa se ne miješa sa * grupom (biramo *)', () => {
  // naš UA nije AdsBot, pa se primjenjuje * grupa sa zabranama
  assert.equal(isAllowed(rules, '/Catalogue/1'), false);
});

test('bez pravila = sve dozvoljeno', () => {
  assert.equal(isAllowed(null, '/bilo/sta'), true);
  assert.equal(isAllowed(parseRobots('', 'x'), '/bilo/sta'), true);
});

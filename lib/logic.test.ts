import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fieldMessage, graphemes, rulerBands, rulerTotal, summarize, SUMMARY_OK, tickPath } from './logic.ts';

/* ---------- counting */

test('graphemes counts Bangla conjuncts and emoji as one', () => {
  assert.deepEqual(graphemes('শিক্ষা'), ['শি', 'ক্ষা']);
  assert.equal(graphemes('👍🏽').length, 1);
  assert.equal(graphemes('Sarees').length, 6);
  assert.deepEqual(graphemes(''), []);
});

test('graphemes matches the sample ad', () => {
  assert.equal(graphemes('তাঁতের শাড়ি, ঈদের আগেই ঘরে পৌঁছে যাবে').length, 24);
  assert.equal(graphemes('সুতি ও হাফ সিল্ক শাড়ি। অনলাইনে অর্ডার করুন, ডেলিভারির সময় টাকা দিন।').length, 46);
});

/* ---------- messages */

test('fieldMessage is silent, then counts down, then says what the platform does', () => {
  assert.equal(fieldMessage(25, 30, 'hard'), '');
  assert.equal(fieldMessage(26, 30, 'hard'), '4 left');
  assert.equal(fieldMessage(30, 30, 'hard'), '0 left');
  assert.equal(fieldMessage(31, 30, 'hard'), '1 over. Google will not accept this');
  assert.equal(fieldMessage(130, 125, 'soft'), '5 over. Meta will likely cut this behind “See more”');
});

test('summarize names the fields and the platforms', () => {
  assert.equal(summarize([]), SUMMARY_OK);
  assert.equal(summarize([{ label: 'Headline 2', kind: 'hard' }]), '1 field is too long: Headline 2. Google will not accept these.');
  assert.equal(summarize([{ label: 'Primary text', kind: 'soft' }]), '1 field is too long: Primary text. Meta will likely cut these behind “See more”.');
  assert.equal(
    summarize([{ label: 'Headline 2', kind: 'hard' }, { label: 'Primary text', kind: 'soft' }]),
    '2 fields are too long: Headline 2, Primary text. Google will not accept the Google ones, and Meta will likely cut the Meta ones behind “See more”.',
  );
});

/* ---------- ruler */

test('rulerTotal leaves room past the limit', () => {
  assert.equal(rulerTotal(15), 20);
  assert.equal(rulerTotal(30), 36);
  assert.equal(rulerTotal(90), 107);
  assert.equal(rulerTotal(125), 148);
});

test('rulers with one density need one band', () => {
  assert.deepEqual(rulerBands(30, 36, true), [{ min: 0, max: Infinity, every: 1, major: 10 }]);
  assert.deepEqual(rulerBands(15, 20, true), [{ min: 0, max: Infinity, every: 1, major: 5 }]);
});

test('description ruler changes density with its width', () => {
  assert.deepEqual(rulerBands(90, 107, true), [
    { min: 0, max: 323, every: 5, major: 30 },
    { min: 323, max: 366, every: 1, major: 30 },
    { min: 366, max: Infinity, every: 1, major: 10 },
  ]);
});

test('every band edge has a container query in page.css', () => {
  const edges = new Set<number>();
  for (const [limit, total, numbers] of [[30, 36, true], [90, 107, true], [15, 20, true], [125, 148, true], [40, 48, true], [30, 125, false], [90, 125, false], [15, 125, false], [125, 125, false], [40, 125, false]] as const) {
    for (const b of rulerBands(limit, total, numbers)) { if (b.min) edges.add(b.min); }
  }
  assert.deepEqual([...edges].sort((a, b) => a - b), [323, 366, 377, 446]);
});

test('tickPath draws one subpath per tick, with long ticks on the major marks', () => {
  const band = { min: 0, max: Infinity, every: 1, major: 10 };
  assert.equal(tickPath(9, 11, band, 30, 4, 7), 'M9 0V4M10 0V22M11 0V4');
  assert.equal(tickPath(35, 36, band, 30, 4, 7), 'M35 0V7M36 0V4');
});

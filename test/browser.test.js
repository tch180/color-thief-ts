import test from 'node:test';
import assert from 'node:assert/strict';
import ColorThief from '../dist/browser.js';

test('getPaletteAsync resolves palette on success', async () => {
  const ct = new ColorThief();
  ct.getPalette = () => [[1, 2, 3]];
  ct.asyncFetchImage = () => Promise.resolve({});
  const palette = await ct.getPaletteAsync('url', 5, { colorType: 'array' });
  assert.deepStrictEqual(palette, [[1, 2, 3]]);
});

test('getPaletteAsync returns null on failure', async () => {
  const ct = new ColorThief();
  ct.asyncFetchImage = () => Promise.resolve(null);
  const palette = await ct.getPaletteAsync('url', 5, { colorType: 'array' });
  assert.strictEqual(palette, null);
});

test('getColorAsync resolves color on success', async () => {
  const ct = new ColorThief();
  ct.getPalette = () => [[1, 2, 3]];
  ct.asyncFetchImage = () => Promise.resolve({});
  const color = await ct.getColorAsync('url', { colorType: 'array' });
  assert.deepStrictEqual(color, [1, 2, 3]);
});

test('getColorAsync returns null on failure', async () => {
  const ct = new ColorThief();
  ct.getPalette = () => [];
  ct.asyncFetchImage = () => Promise.resolve({});
  const color = await ct.getColorAsync('url', { colorType: 'array' });
  assert.strictEqual(color, null);
});

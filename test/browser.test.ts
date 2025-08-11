import { describe, it, expect } from 'vitest';
import ColorThief from '../src/browser';

describe('Browser async methods', () => {
  it('getPaletteAsync resolves palette on success', async () => {
    const ct: any = new ColorThief();
    ct.getPalette = () => [[1, 2, 3]];
    ct.asyncFetchImage = () => Promise.resolve({});
    const palette = await ct.getPaletteAsync('url', 5, { colorType: 'array' });
    expect(palette).toEqual([[1, 2, 3]]);
  });

  it('getPaletteAsync returns null on failure', async () => {
    const ct: any = new ColorThief();
    ct.asyncFetchImage = () => Promise.resolve(null);
    const palette = await ct.getPaletteAsync('url', 5, { colorType: 'array' });
    expect(palette).toBeNull();
  });

  it('getColorAsync resolves color on success', async () => {
    const ct: any = new ColorThief();
    ct.getPalette = () => [[1, 2, 3]];
    ct.asyncFetchImage = () => Promise.resolve({});
    const color = await ct.getColorAsync('url', { colorType: 'array' });
    expect(color).toEqual([1, 2, 3]);
  });

  it('getColorAsync returns null on failure', async () => {
    const ct: any = new ColorThief();
    ct.getPalette = () => [];
    ct.asyncFetchImage = () => Promise.resolve({});
    const color = await ct.getColorAsync('url', { colorType: 'array' });
    expect(color).toBeNull();
  });
});

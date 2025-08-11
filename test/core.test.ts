import { describe, it, expect } from 'vitest';
import Core from '../src/core';

class TestCore extends Core {
  public palette(imageData: ImageData, pixelCount: number, colorCount: number, opts?: any) {
    return (this as any)._getPalette(imageData, pixelCount, colorCount, opts);
  }
  public color(imageData: ImageData, pixelCount: number, opts?: any) {
    return (this as any)._getColor(imageData, pixelCount, opts);
  }
}

const core = new TestCore();

const red = [255, 0, 0, 255];
const blue = [0, 0, 255, 255];

const paletteData: ImageData = {
  data: new Uint8ClampedArray([...red, ...blue]),
  width: 2,
  height: 1,
} as ImageData;

const colorData: ImageData = {
  data: new Uint8ClampedArray([...red, ...red, ...blue]),
  width: 3,
  height: 1,
} as ImageData;

describe('Core palette', () => {
  it('returns hex colors by default', () => {
    const result = core.palette(paletteData, 2, 2);
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(typeof result[0]).toBe('string');
  });

  it('returns array colors when colorType is array', () => {
    const result = core.palette(paletteData, 2, 2, { colorType: 'array' });
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(result[0])).toBe(true);
  });

  it('throws when colorCount is 1', () => {
    expect(() => core.palette(paletteData, 2, 1)).toThrow();
  });
});

describe('Core dominant color', () => {
  it('returns hex color by default', () => {
    const result = core.color(colorData, 3);
    expect(typeof result).toBe('string');
  });

  it('returns array when colorType is array', () => {
    const result = core.color(colorData, 3, { colorType: 'array' });
    expect(Array.isArray(result)).toBe(true);
    expect((result as number[]).length).toBe(3);
  });
});

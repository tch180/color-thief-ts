const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const ts = require('typescript');

require.extensions['.ts'] = function (module, filename) {
  const source = fs.readFileSync(filename, 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2019,
      esModuleInterop: true,
    },
  });
  module._compile(outputText, filename);
};

const Core = require('../src/core.ts').default;

class TestCore extends Core {
  palette(imageData, pixelCount, colorCount, opts) {
    return this._getPalette(imageData, pixelCount, colorCount, opts);
  }
  color(imageData, pixelCount, opts) {
    return this._getColor(imageData, pixelCount, opts);
  }
}

const core = new TestCore();

const red = [255, 0, 0, 255];
const blue = [0, 0, 255, 255];

const paletteData = {
  data: new Uint8ClampedArray([...red, ...blue]),
  width: 2,
  height: 1,
};

const colorData = {
  data: new Uint8ClampedArray([...red, ...red, ...blue]),
  width: 3,
  height: 1,
};

describe('Core palette', () => {
  it('returns hex colors by default', () => {
    const result = core.palette(paletteData, 2, 2);
    assert.ok(result.length >= 1);
    assert.ok(typeof result[0] === 'string');
  });

  it('returns array colors when colorType is array', () => {
    const result = core.palette(paletteData, 2, 2, { colorType: 'array' });
    assert.ok(result.length >= 1);
    assert.ok(Array.isArray(result[0]));
  });
});

describe('Core dominant color', () => {
  it('returns hex color by default', () => {
    const result = core.color(colorData, 3);
    assert.ok(typeof result === 'string');
  });

  it('returns array when colorType is array', () => {
    const result = core.color(colorData, 3, { colorType: 'array' });
    assert.ok(Array.isArray(result));
    assert.strictEqual(result.length, 3);
  });
});

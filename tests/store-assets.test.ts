import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const pngSignature = Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10]);

const expectedAssets = new Map([
  ['marquee-1400x560.png', { height: 560, width: 1400 }],
  ['screenshot-01-panel.png', { height: 800, width: 1280 }],
  ['screenshot-02-editor.png', { height: 800, width: 1280 }],
  ['screenshot-03-diagrams.png', { height: 800, width: 1280 }],
  ['small-promo-440x280.png', { height: 280, width: 440 }],
]);

function readPngDimensions(path: string): { height: number; width: number } {
  const bytes = readFileSync(path);

  expect(Array.from(bytes.subarray(0, pngSignature.length))).toEqual(Array.from(pngSignature));
  expect(bytes.toString('ascii', 12, 16)).toBe('IHDR');

  return {
    height: bytes.readUInt32BE(20),
    width: bytes.readUInt32BE(16),
  };
}

describe('materiais da Chrome Web Store', () => {
  it('mantém a quantidade, os nomes e as dimensões aprovadas', () => {
    const directory = `${process.cwd()}/store-assets`;
    const pngFiles = readdirSync(directory)
      .filter((file) => file.endsWith('.png'))
      .sort();

    expect(pngFiles).toEqual(Array.from(expectedAssets.keys()).sort());

    for (const [file, dimensions] of expectedAssets) {
      expect(readPngDimensions(`${directory}/${file}`)).toEqual(dimensions);
    }
  });

  it('mantém o ícone de publicação em 128 por 128 pixels', () => {
    expect(readPngDimensions(`${process.cwd()}/public/icon/128.png`)).toEqual({
      height: 128,
      width: 128,
    });
  });
});

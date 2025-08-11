// color quantization, based on Leptonica
import Jimp from 'jimp';
import Core from './core';
import type { ColorArray, PaletteOptions } from './type';

/**
 *
 * image is the path to the file.
 *  It can be
 *  - a relative path
 *  - an http url
 *  - a data url
 *  - a Buffer containing image data
 *
 */
type ImageType = string | Buffer;

class ColorThief extends Core {
  private async getImageData(img: ImageType): Promise<[ImageData, number]> {
    try {
      let image;

      if (Buffer.isBuffer(img)) {
        image = await Jimp.read(img as Buffer);
      } else {
        image = await Jimp.read(img as string);
      }

      const width = image.bitmap.width;
      const height = image.bitmap.height;
      const pixelCount = width * height;

      // Create ImageData-like structure compatible with existing code
      const data = new Uint8ClampedArray(pixelCount * 4);

      let dataIndex = 0;
      image.scan(0, 0, width, height, (x: number, y: number, idx: number) => {
        // Jimp uses RGBA format in bitmap.data
        const r = image.bitmap.data[idx + 0];
        const g = image.bitmap.data[idx + 1];
        const b = image.bitmap.data[idx + 2];
        const a = image.bitmap.data[idx + 3];

        data[dataIndex++] = r;
        data[dataIndex++] = g;
        data[dataIndex++] = b;
        data[dataIndex++] = a;
      });

      // Create ImageData-compatible object
      const imageData = {
        data,
        width,
        height,
        colorSpace: 'srgb' as PredefinedColorSpace,
      } as ImageData;

      return [imageData, pixelCount];
    } catch (error) {
      throw new Error(`Failed to process image: ${error}`);
    }
  }

  public async getPalette(
    img: ImageType,
    colorCount: number,
    opts?: PaletteOptions<'array'>
  ): Promise<ColorArray[]>;

  public async getPalette(
    img: ImageType,
    colorCount: number,
    opts?: PaletteOptions<'hex'>
  ): Promise<string[]>;

  public async getPalette(
    img: ImageType,
    colorCount = 10,
    opts?: PaletteOptions
  ) {
    try {
      const [imageData, pixelCount] = await this.getImageData(img);
      const palette = this._getPalette(imageData, pixelCount, colorCount, opts);
      return palette;
    } catch (error) {
      throw error;
    }
  }

  public async getColor(
    img: ImageType,
    opts?: PaletteOptions<'array'>
  ): Promise<ColorArray>;

  public async getColor(
    img: ImageType,
    opts?: PaletteOptions<'hex'>
  ): Promise<string>;

  public async getColor(img: ImageType, opts?: PaletteOptions) {
    try {
      const [imageData, pixelCount] = await this.getImageData(img);
      const color = this._getColor(imageData, pixelCount, opts);
      return color;
    } catch (error) {
      throw error;
    }
  }
}

export default ColorThief;

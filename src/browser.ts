// color quantization, based on Leptonica
import Core from "./core";
import type { ColorArray, PaletteOptions } from "./type";
import arrayToHex from "./utils/arrayToHex";

/**
 *
 * quality is an optional argument. It needs to be an integer. 1 is the highest quality settings.
 * 10 is the default. There is a trade-off between quality and speed. The bigger the number, the
 * faster the palette generation but the greater the likelihood that colors will be missed.
 *
 */
const DEFAULT_QUALITY = 10;

/*
 *
 * Thanks
 * ------
 * Nick Rabinowitz - For creating quantize.js.
 * John Schulz - For clean up and optimization. @JFSIII
 * Nathan Spady - For adding drag and drop support to the demo page.
 *
 */

/*
  CanvasImage Class
  Class that wraps the html image element and canvas.
  It also simplifies some of the canvas context manipulation
  with a set of helper functions.
*/
class CanvasImage {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  width: number;
  height: number;

  constructor(image: HTMLImageElement) {
    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    this.width = this.canvas.width = image.naturalWidth;
    this.height = this.canvas.height = image.naturalHeight;
    this.context.drawImage(image, 0, 0, this.width, this.height);
  }

  getImageData() {
    return this.context.getImageData(0, 0, this.width, this.height);
  }
}

class ColorThief extends Core {
  private crossOrigin: boolean;

  constructor(opts?: { crossOrigin: boolean }) {
    super();
    this.crossOrigin = opts?.crossOrigin ?? false;
  }

  private async asyncFetchImage(imageUrl: string) {
    const imageSource = await fetch(imageUrl, { mode: "cors" })
      .then((response) => {
        // Check if the request was successful
        if (response.ok) {
          // Convert the response to a blob (binary data)
          return response.blob();
        }

        return null;
      })
      .then((blob) => {
        // Create an image element from the blob data
        if (blob === null) {
          return null;
        }
        const img = document.createElement("img");
        if (this.crossOrigin) {
          img.crossOrigin = "anonymous";
        }
        img.src = URL.createObjectURL(blob);
        return img;
      })
      .catch(() => {
        // Handle any errors
        return null;
      });

    return new Promise<HTMLImageElement | null>((resolve, _reject) => {
      if (imageSource === null) {
        return resolve(imageSource);
      }

      imageSource.onload = function () {
        resolve(imageSource);
      };
    });
  }

  private getImageData(sourceImage: HTMLImageElement) {
    // Create custom CanvasImage object
    const image = new CanvasImage(sourceImage);
    const imageData = image.getImageData();
    const pixelCount = image.width * image.height;

    return [imageData, pixelCount] as const;
  }

  /*
   * getPalette(sourceImage[, colorCount, quality])
   * returns array[ {r: num, g: num, b: num}, {r: num, g: num, b: num}, ...]
   *
   * Use the median cut algorithm provided by quantize.js to cluster similar colors.
   *
   * colorCount determines the size of the palette; the number of colors returned. If not set, it
   * defaults to 10.
   *
   * quality is an optional argument. It needs to be an integer. 1 is the highest quality settings.
   * 10 is the default. There is a trade-off between quality and speed. The bigger the number, the
   * faster the palette generation but the greater the likelihood that colors will be missed.
   *
   *
   */
  public getPalette(
    sourceImage: HTMLImageElement,
    colorCount: number,
    opts?: PaletteOptions<"array">
  ): ColorArray[];

  public getPalette(
    sourceImage: HTMLImageElement,
    colorCount: number,
    opts?: PaletteOptions<"hex">
  ): string[];

  public getPalette(
    sourceImage: HTMLImageElement,
    colorCount: number,
    opts?: PaletteOptions
  ) {
    const colorType = opts?.colorType ?? "hex";

    const [imageData, pixelCount] = this.getImageData(sourceImage);

    const palette = this._getPalette(imageData, pixelCount, colorCount, opts);

    if (colorType === "hex") {
      return palette.map((item) => arrayToHex(item));
    }

    return palette;
  }

  /*
   * getColor(sourceImage[, quality])
   * returns {r: num, g: num, b: num}
   *
   * Use the median cut algorithm provided by quantize.js to cluster similar
   * colors and return the base color from the largest cluster.
   *
   * Quality is an optional argument. It needs to be an integer. 1 is the highest quality settings.
   * 10 is the default. There is a trade-off between quality and speed. The bigger the number, the
   * faster a color will be returned but the greater the likelihood that it will not be the visually
   * most dominant color.
   *
   * */
  public getColor(
    sourceImage: HTMLImageElement,
    opts?: PaletteOptions<"array">
  ): ColorArray;

  public getColor(
    sourceImage: HTMLImageElement,
    opts?: PaletteOptions<"hex">
  ): string;

  public getColor(sourceImage: HTMLImageElement, opts?: PaletteOptions) {
    const colorType = opts?.colorType ?? "hex";

    const palette = this.getPalette(sourceImage, 5, {
      quality: opts?.quality ?? DEFAULT_QUALITY,
      colorType: "array",
    });
    const dominantColor = palette?.[0] ?? null;

    if (dominantColor === null) {
      return dominantColor;
    }

    if (colorType === "hex") {
      return arrayToHex(dominantColor);
    }

    return dominantColor;
  }

  public getPaletteAsync(
    imageUrl: string,
    colorCount: number,
    opts?: PaletteOptions<"array">
  ): Promise<ColorArray[] | null>;

  public getPaletteAsync(
    imageUrl: string,
    colorCount: number,
    opts?: PaletteOptions<"hex">
  ): Promise<string[] | null>;

  public getPaletteAsync(
    imageUrl: string,
    colorCount: number,
    opts?: PaletteOptions
  ) {
    const quality = opts?.quality ?? DEFAULT_QUALITY;
    const colorType = opts?.colorType ?? "hex";

    return this.asyncFetchImage(imageUrl).then((sourceImage) => {
      if (sourceImage === null) {
        return null;
      }

      const palette = this.getPalette(sourceImage, colorCount, {
        quality,
        colorType: "array",
      });

      if (palette.length === 0) {
        return null;
      }

      if (colorType === "hex") {
        return palette.map((item) => arrayToHex(item));
      }

      return palette;
    });
  }

  public getColorAsync(
    imageUrl: string,
    opts?: PaletteOptions<"array">
  ): Promise<ColorArray | null>;

  public getColorAsync(
    imageUrl: string,
    opts?: PaletteOptions<"hex">
  ): Promise<string | null>;

  public getColorAsync(imageUrl: string, opts?: PaletteOptions) {
    const quality = opts?.quality ?? DEFAULT_QUALITY;
    const colorType = opts?.colorType ?? "hex";

    return this.asyncFetchImage(imageUrl).then((sourceImage) => {
      if (sourceImage === null) {
        return null;
      }

      const palette = this.getPalette(sourceImage, 5, {
        quality,
        colorType: "array",
      });

      if (palette.length === 0) {
        return null;
      }

      const dominantColor = palette[0];

      if (colorType === "hex") {
        return arrayToHex(dominantColor);
      }

      return dominantColor;
    });
  }
}

export default ColorThief;

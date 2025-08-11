# Color Thief

Grab the color palette from an image using just JavaScript. Works in the browser & Node.js.

## Getting Started

### Install
```
yarn add color-thief-ts
```
or
```
npm install color-thief-ts
```

### Example for browser

``` javascript
import ColorThief from "color-thief-ts";

const colorThief = new ColorThief();
const dominantColor = await colorThief.getColorAsync("your-domain/your-image-url.jpg");
const palette = await colorThief.getPaletteAsync("your-domain/your-image-url.jpg", 5);

if (dominantColor) {
  console.log(dominantColor);
}

if (palette) {
  console.log(palette);
}
```

### Example for Node.js

``` javascript
import ColorThief from "color-thief-ts/node";
import fetch from "node-fetch";
import Sharp from "sharp";

const colorThief = new ColorThief();

const image = await fetch("http://localhost:3000/images/example.png")
  .then((res) => res.arrayBuffer())
  .then((arrayBuffer) => Buffer.from(arrayBuffer));

const palette1 = await colorThief.getPalette(
  { type: "image/png", buffer: image },
  5
);

const palette2 = await colorThief.getPalette(
  "http://localhost:3000/images/example.png",
  5
);

const palette3 = await colorThief.getPalette(
  "./images/example.png",
  5
);

const color = await colorThief.getColor(
  { type: "image/png", buffer: image }
);

```


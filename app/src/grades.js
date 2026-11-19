// Colour grades for the cover: a canvas filter applied while each photo is
// drawn, then gradient washes laid over the whole cover, a vignette and a
// seeded grain. Every grade is the app's own palette — a Vice City sunset or
// a neon night — never a copied look from a game asset.
export const GRADES = {
  sunset: {
    label: 'Vice Sunset',
    filter: 'saturate(1.3) contrast(1.08)',
    washes: [
      { from: [255, 122, 26], to: [255, 45, 120], blend: 'soft-light', alpha: 0.85 },
      { from: [255, 190, 90], to: [120, 20, 90], blend: 'overlay', alpha: 0.35 },
    ],
    vignette: 0.4,
    grain: 0.5,
  },
  neon: {
    label: 'Neon Night',
    filter: 'saturate(1.35) contrast(1.12)',
    washes: [
      { from: [20, 220, 220], to: [255, 40, 160], blend: 'soft-light', alpha: 0.9 },
      { from: [10, 10, 60], to: [255, 0, 140], blend: 'overlay', alpha: 0.3 },
    ],
    vignette: 0.5,
    grain: 0.5,
  },
  golden: {
    label: 'Golden Hour',
    filter: 'saturate(1.2) contrast(1.05) brightness(1.04)',
    washes: [
      { from: [255, 200, 90], to: [255, 120, 40], blend: 'soft-light', alpha: 0.8 },
      { from: [255, 230, 160], to: [180, 80, 20], blend: 'overlay', alpha: 0.25 },
    ],
    vignette: 0.35,
    grain: 0.4,
  },
  teal: {
    label: 'Miami Teal',
    filter: 'saturate(1.15) contrast(1.06)',
    washes: [
      { from: [40, 220, 200], to: [10, 90, 140], blend: 'soft-light', alpha: 0.85 },
      { from: [190, 255, 240], to: [0, 60, 90], blend: 'overlay', alpha: 0.25 },
    ],
    vignette: 0.35,
    grain: 0.4,
  },
  noir: {
    label: 'Noir',
    filter: 'grayscale(1) contrast(1.18) brightness(1.06)',
    washes: [
      { from: [220, 220, 230], to: [20, 20, 30], blend: 'soft-light', alpha: 0.5 },
    ],
    vignette: 0.55,
    grain: 0.7,
  },
};

/** The grade ids in the order the editor offers them. */
export const GRADE_ORDER = ['sunset', 'neon', 'golden', 'teal', 'noir'];

/** A tiny seeded random generator, so the grain is identical on every export. */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A 128 x 128 tile of monochrome noise, the same on every run. */
export function grainTile() {
  const tile = document.createElement('canvas');
  tile.width = 128;
  tile.height = 128;
  const ctx = tile.getContext('2d');
  const img = ctx.createImageData(128, 128);
  const rand = mulberry32(20261119);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.floor(rand() * 256);
    img.data[i] = v;
    img.data[i + 1] = v;
    img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return tile;
}

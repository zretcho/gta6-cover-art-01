// Panel layouts for the cover: each layout is a list of panels, each panel a
// rectangle in fractions of the cover (x, y, width, height from the top left),
// plus an optional tilt in degrees for the snapshot-style layouts and where
// the title block sits ('band' overlaps the foot of the panels, 'below' sits
// under them on the cover's own background).
export const LAYOUTS = {
  hero3: {
    label: 'Hero + 3',
    title: 'band',
    panels: [
      { x: 0, y: 0, w: 0.62, h: 1 },
      { x: 0.62, y: 0, w: 0.38, h: 1 / 3 },
      { x: 0.62, y: 1 / 3, w: 0.38, h: 1 / 3 },
      { x: 0.62, y: 2 / 3, w: 0.38, h: 1 / 3 },
    ],
  },
  grid4: {
    label: 'Four grid',
    title: 'band',
    panels: [
      { x: 0, y: 0, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0, w: 0.5, h: 0.5 },
      { x: 0, y: 0.5, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
    ],
  },
  fullbleed: {
    label: 'Full bleed',
    title: 'band',
    panels: [{ x: 0, y: 0, w: 1, h: 1 }],
  },
  strip3: {
    label: 'Triple strip',
    title: 'band',
    panels: [
      { x: 0, y: 0, w: 1 / 3, h: 1 },
      { x: 1 / 3, y: 0, w: 1 / 3, h: 1 },
      { x: 2 / 3, y: 0, w: 1 / 3, h: 1 },
    ],
  },
  tilted: {
    label: 'Tilted duo',
    title: 'below',
    panels: [
      { x: 0.03, y: 0.03, w: 0.55, h: 0.55, tilt: -4 },
      { x: 0.43, y: 0.28, w: 0.55, h: 0.55, tilt: 4 },
    ],
  },
  comic: {
    label: 'Comic strip',
    title: 'band',
    panels: [
      { x: 0, y: 0, w: 1, h: 0.55 },
      { x: 0, y: 0.55, w: 0.5, h: 0.45 },
      { x: 0.5, y: 0.55, w: 0.5, h: 0.45 },
    ],
  },
};

/** The layout ids in the order the editor offers them. */
export const LAYOUT_ORDER = ['hero3', 'grid4', 'fullbleed', 'strip3', 'tilted', 'comic'];

/** How many panels a layout shows, so the editor knows how many slots to offer. */
export function panelCount(layoutId) {
  return LAYOUTS[layoutId].panels.length;
}

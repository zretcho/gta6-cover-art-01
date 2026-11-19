// The editor's state: the photos on the machine, one slot per panel (which
// photo it shows, how far it is zoomed and where it is panned), the chosen
// layout, grade, caption and export size. Photos are read on the machine and
// never uploaded; the two bundled samples are free to use and load at start
// so a first cover is one click away.
import { panelCount } from './layouts.js';

export const SIZES = [
  { id: '1080x1080', w: 1080, h: 1080, label: 'Square · 1080 × 1080' },
  { id: '1080x1350', w: 1080, h: 1350, label: 'Portrait · 1080 × 1350' },
  { id: '1920x1080', w: 1920, h: 1080, label: 'Landscape · 1920 × 1080' },
];

/** The sample photos bundled with the app, made with an image model for make.fun. */
export const SAMPLE_PHOTOS = [
  { src: 'samples/pier.jpg', name: 'Pier' },
  { src: 'samples/boulevard.jpg', name: 'Boulevard' },
];

/** One panel slot: which photo it shows (an index into state.photos, or -1
 *  for empty), its zoom (1 fills the panel) and its pan in fractions of the
 *  photo's overflow, -0.5 at one edge and 0.5 at the other. */
export function emptySlot(photo) {
  return { photo, zoom: 1, x: 0, y: 0 };
}

/** A fresh state: six slots (the most any layout shows), the hero layout,
 *  the sunset grade and a caption ready to edit. */
export function defaultState() {
  return {
    photos: [],
    slots: [
      emptySlot(0), emptySlot(1), emptySlot(0),
      emptySlot(1), emptySlot(0), emptySlot(1),
    ],
    layout: 'hero3',
    grade: 'sunset',
    title: 'SUNSET HEIST',
    subtitle: 'Neon Coast',
    size: '1080x1080',
    badge: true,
    selected: 0,
  };
}

/** The export size object for the state's chosen size id. */
export function sizeOf(state) {
  return SIZES.find((s) => s.id === state.size) ?? SIZES[0];
}

/** The slots the current layout actually shows, in panel order. */
export function visibleSlots(state) {
  return state.slots.slice(0, panelCount(state.layout));
}

/** Point a slot at a photo and reset its crop, so a new photo fills the panel. */
export function assignPhoto(state, slotIndex, photoIndex) {
  state.slots[slotIndex] = emptySlot(photoIndex);
}

/** Fill every visible slot from the loaded photos, round robin, resetting crops. */
export function fillSlots(state) {
  const n = state.photos.length;
  if (n === 0) return;
  for (let i = 0; i < panelCount(state.layout); i++) {
    state.slots[i] = emptySlot(i % n);
  }
}

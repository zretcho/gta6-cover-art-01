// Wires the editor: photos from the machine (or the bundled samples), the
// layout, grade, caption and size controls, drag-to-pan and scroll-to-zoom on
// the preview, and the PNG export. A `?shot=` query sets up a fixed scene
// for a screenshot instead (./shots.js).
import { drawCover, panelRects, photoDrawSize } from './cover.js';
import { GRADE_ORDER, GRADES } from './grades.js';
import { LAYOUT_ORDER, LAYOUTS, panelCount } from './layouts.js';
import { runShot } from './shots.js';
import {
  SAMPLE_PHOTOS, SIZES, assignPhoto, defaultState, fillSlots, sizeOf, visibleSlots,
} from './state.js';

const canvas = document.getElementById('cover');
const ctx = canvas.getContext('2d');
const status = document.getElementById('status');
const state = defaultState();

/** Loads an image from a URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function say(text) {
  status.textContent = text;
}

/** Redraws the preview at the chosen export size. */
export function redraw() {
  const size = sizeOf(state);
  if (canvas.width !== size.w || canvas.height !== size.h) {
    canvas.width = size.w;
    canvas.height = size.h;
  }
  drawCover(ctx, size.w, size.h, state, { editor: true });
}

/** Loads the bundled samples so the app opens with a cover already made. */
export async function loadSamples() {
  for (const sample of SAMPLE_PHOTOS) {
    try {
      const img = await loadImage(sample.src);
      img._label = sample.name;
      state.photos.push(img);
    } catch {
      // A missing sample just leaves that photo out.
    }
  }
  fillSlots(state);
  renderPhotoStrip();
  renderSlots();
  redraw();
}

function photoName(img, i) {
  return img._label ?? img.name ?? `Photo ${i + 1}`;
}

/** Rebuilds the photo strip: one thumbnail button per loaded photo. */
function renderPhotoStrip() {
  const strip = document.getElementById('photostrip');
  strip.innerHTML = '';
  state.photos.forEach((img, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'thumb';
    button.title = `${photoName(img, i)} — click to put it in the selected panel`;
    const thumb = document.createElement('img');
    thumb.src = img.src;
    thumb.alt = photoName(img, i);
    button.append(thumb);
    const label = document.createElement('span');
    label.textContent = photoName(img, i);
    button.append(label);
    button.addEventListener('click', () => {
      assignPhoto(state, state.selected, i);
      renderSlots();
      redraw();
      say(`${photoName(img, i)} is in panel ${state.selected + 1}.`);
    });
    strip.append(button);
  });
  document.getElementById('photocount').textContent =
    state.photos.length === 0 ? 'No photos yet' : `${state.photos.length} photo${state.photos.length > 1 ? 's' : ''} loaded`;
}

/** Rebuilds the per-panel crop controls for the current layout. */
function renderSlots() {
  const list = document.getElementById('panels');
  list.innerHTML = '';
  visibleSlots(state).forEach((slot, i) => {
    const row = document.createElement('div');
    row.className = 'panelrow' + (i === state.selected ? ' selected' : '');
    const head = document.createElement('button');
    head.type = 'button';
    head.className = 'panelhead';
    head.textContent = `Panel ${i + 1}`;
    head.addEventListener('click', () => {
      state.selected = i;
      renderSlots();
      redraw();
    });
    row.append(head);

    const select = document.createElement('select');
    select.setAttribute('aria-label', `Photo for panel ${i + 1}`);
    const empty = document.createElement('option');
    empty.value = '-1';
    empty.textContent = 'Empty';
    select.append(empty);
    state.photos.forEach((img, p) => {
      const option = document.createElement('option');
      option.value = String(p);
      option.textContent = photoName(img, p);
      select.append(option);
    });
    select.value = String(slot.photo);
    select.addEventListener('change', () => {
      assignPhoto(state, i, Number(select.value));
      redraw();
    });
    row.append(select);

    const zoom = document.createElement('input');
    zoom.type = 'range';
    zoom.min = '1';
    zoom.max = '4';
    zoom.step = '0.05';
    zoom.value = String(slot.zoom);
    zoom.setAttribute('aria-label', `Zoom for panel ${i + 1}`);
    zoom.addEventListener('input', () => {
      state.slots[i].zoom = Number(zoom.value);
      redraw();
    });
    row.append(zoom);

    const panX = document.createElement('input');
    panX.type = 'range';
    panX.min = '-0.5';
    panX.max = '0.5';
    panX.step = '0.01';
    panX.value = String(slot.x);
    panX.setAttribute('aria-label', `Pan left and right for panel ${i + 1}`);
    panX.addEventListener('input', () => {
      state.slots[i].x = Number(panX.value);
      redraw();
    });
    row.append(panX);

    const panY = document.createElement('input');
    panY.type = 'range';
    panY.min = '-0.5';
    panY.max = '0.5';
    panY.step = '0.01';
    panY.value = String(slot.y);
    panY.setAttribute('aria-label', `Pan up and down for panel ${i + 1}`);
    panY.addEventListener('input', () => {
      state.slots[i].y = Number(panY.value);
      redraw();
    });
    row.append(panY);

    const fill = document.createElement('button');
    fill.type = 'button';
    fill.className = 'mini';
    fill.textContent = 'Fill panel';
    fill.addEventListener('click', () => {
      state.slots[i] = { photo: slot.photo, zoom: 1, x: 0, y: 0 };
      renderSlots();
      redraw();
    });
    row.append(fill);
    list.append(row);
  });
}

/** Builds a row of toggle buttons from a list of {id, label} choices. */
function buildToggles(elementId, choices, current, onPick) {
  const holder = document.getElementById(elementId);
  holder.innerHTML = '';
  choices.forEach(({ id, label }) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'toggle' + (id === current ? ' active' : '');
    button.textContent = label;
    button.addEventListener('click', () => onPick(id));
    holder.append(button);
  });
}

function refreshToggles() {
  buildToggles('layouts', LAYOUT_ORDER.map((id) => ({ id, label: LAYOUTS[id].label })), state.layout, (id) => {
    state.layout = id;
    state.selected = 0;
    renderSlots();
    refreshToggles();
    redraw();
  });
  buildToggles('grades', GRADE_ORDER.map((id) => ({ id, label: GRADES[id].label })), state.grade, (id) => {
    state.grade = id;
    refreshToggles();
    redraw();
  });
  buildToggles('sizes', SIZES.map((s) => ({ id: s.id, label: s.label })), state.size, (id) => {
    state.size = id;
    refreshToggles();
    redraw();
  });
}

document.getElementById('addphotos').addEventListener('change', async (e) => {
  const files = [...e.target.files];
  if (files.length === 0) return;
  for (const file of files) {
    if (state.photos.length >= 4) {
      say('Four photos at most — the oldest one was kept, the rest skipped.');
      break;
    }
    try {
      const img = await loadImage(URL.createObjectURL(file));
      img.name = file.name.replace(/\.[^.]+$/, '');
      state.photos.push(img);
    } catch {
      say(`Could not read ${file.name}.`);
    }
  }
  fillSlots(state);
  renderPhotoStrip();
  renderSlots();
  redraw();
  say(`${state.photos.length} photo${state.photos.length > 1 ? 's' : ''} loaded — pick a layout and export.`);
  e.target.value = '';
});

document.getElementById('samples').addEventListener('click', async () => {
  if (state.photos.length > 0) return;
  await loadSamples();
  say('Sample photos loaded.');
});

document.getElementById('shuffle').addEventListener('click', () => {
  state.layout = LAYOUT_ORDER[Math.floor(Math.random() * LAYOUT_ORDER.length)];
  state.grade = GRADE_ORDER[Math.floor(Math.random() * GRADE_ORDER.length)];
  state.selected = 0;
  fillSlots(state);
  renderSlots();
  refreshToggles();
  redraw();
  say(`Surprise: ${LAYOUTS[state.layout].label} in ${GRADES[state.grade].label}.`);
});

const titleInput = document.getElementById('title');
const subtitleInput = document.getElementById('subtitle');
titleInput.addEventListener('input', () => {
  state.title = titleInput.value;
  redraw();
});
subtitleInput.addEventListener('input', () => {
  state.subtitle = subtitleInput.value;
  redraw();
});
document.getElementById('badge').addEventListener('change', (e) => {
  state.badge = e.target.checked;
  redraw();
});

document.getElementById('export').addEventListener('click', () => {
  const size = sizeOf(state);
  const off = document.createElement('canvas');
  off.width = size.w;
  off.height = size.h;
  drawCover(off.getContext('2d'), size.w, size.h, state);
  off.toBlob((blob) => {
    if (!blob) {
      say('Export failed — try again.');
      return;
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `neon-coast-${size.id}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 10000);
    say(`Saved neon-coast-${size.id}.png — ${size.w} × ${size.h}.`);
  }, 'image/png');
});

/** Canvas point (in export pixels) for a pointer event on the preview. */
function eventPoint(e) {
  const box = canvas.getBoundingClientRect();
  const size = sizeOf(state);
  return {
    x: ((e.clientX - box.left) / box.width) * size.w,
    y: ((e.clientY - box.top) / box.height) * size.h,
  };
}

/** The topmost panel under a point, or -1. */
function hitPanel(point) {
  const rects = panelRects(canvas.width, canvas.height, state.layout);
  for (let i = rects.length - 1; i >= 0; i--) {
    const r = rects[i];
    if (point.x >= r.x && point.x <= r.x + r.w && point.y >= r.y && point.y <= r.y + r.h) return i;
  }
  return -1;
}

let drag = null;
canvas.addEventListener('pointerdown', (e) => {
  const point = eventPoint(e);
  const hit = hitPanel(point);
  if (hit === -1) return;
  state.selected = hit;
  renderSlots();
  redraw();
  const slot = state.slots[hit];
  if (slot.photo < 0 || !state.photos[slot.photo]) return;
  const rect = panelRects(canvas.width, canvas.height, state.layout)[hit];
  const { dw, dh } = photoDrawSize(state.photos[slot.photo], rect, slot);
  drag = { slot: hit, last: point, dw, dh, rect };
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const point = eventPoint(e);
  const slot = state.slots[drag.slot];
  slot.x = Math.max(-0.5, Math.min(0.5, slot.x + (point.x - drag.last.x) / Math.max(1, drag.dw - drag.rect.w)));
  slot.y = Math.max(-0.5, Math.min(0.5, slot.y + (point.y - drag.last.y) / Math.max(1, drag.dh - drag.rect.h)));
  drag.last = point;
  renderSlots();
  redraw();
});
canvas.addEventListener('pointerup', () => { drag = null; });
canvas.addEventListener('pointercancel', () => { drag = null; });
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const slot = state.slots[state.selected];
  if (!slot || slot.photo < 0) return;
  slot.zoom = Math.max(1, Math.min(4, slot.zoom * Math.exp(-e.deltaY * 0.0012)));
  renderSlots();
  redraw();
}, { passive: false });

const shot = new URLSearchParams(location.search).get('shot');
async function start() {
  try {
    await document.fonts.load('100px Anton');
    await document.fonts.load('60px Pacifico');
  } catch {
    // The fallback fonts still draw if a bundled font fails to load.
  }
  if (shot) {
    await runShot(shot, new URLSearchParams(location.search), {
      state, canvas, redraw, loadImage, loadSamples,
      renderPhotoStrip, renderSlots, refreshToggles, say,
    });
    return;
  }
  refreshToggles();
  await loadSamples();
  say('Drag a photo on the cover to pan it, scroll to zoom, then export.');
}
start();

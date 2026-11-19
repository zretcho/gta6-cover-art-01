// Fixed scenes for screenshots: ?shot=cover draws the exported cover alone,
// ?shot=editor shows the editor with the sample photos loaded. Query knobs:
// layout, grade, size, title, subtitle, badge. window.__shotReady is set
// once the cover is painted.
import { drawCover } from './cover.js';
import { GRADE_ORDER } from './grades.js';
import { LAYOUT_ORDER } from './layouts.js';
import { sizeOf } from './state.js';

/** Applies the scene's query knobs to the state. */
function applyQuery(state, query) {
  const layout = query.get('layout');
  if (layout && LAYOUT_ORDER.includes(layout)) state.layout = layout;
  const grade = query.get('grade');
  if (grade && GRADE_ORDER.includes(grade)) state.grade = grade;
  const size = query.get('size');
  if (size && ['1080x1080', '1080x1350', '1920x1080'].includes(size)) state.size = size;
  const title = query.get('title');
  if (title !== null) state.title = title;
  const subtitle = query.get('subtitle');
  if (subtitle !== null) state.subtitle = subtitle;
  const badge = query.get('badge');
  if (badge !== null) state.badge = badge !== '0';
}

/** Sets __shotReady after two animation frames, once the paint has landed. */
function markReady() {
  requestAnimationFrame(() => requestAnimationFrame(() => {
    window.__shotReady = true;
  }));
}

export async function runShot(shot, query, api) {
  const { state, canvas, redraw, loadSamples, renderPhotoStrip, renderSlots, refreshToggles, say } = api;
  applyQuery(state, query);
  await loadSamples();
  refreshToggles();
  renderPhotoStrip();
  renderSlots();
  if (shot === 'cover') {
    document.body.classList.add('shot-cover');
    const size = sizeOf(state);
    canvas.width = size.w;
    canvas.height = size.h;
    drawCover(canvas.getContext('2d'), size.w, size.h, state);
  } else {
    redraw();
    say('Sample photos loaded — drag a photo on the cover to pan it, scroll to zoom, then export.');
  }
  markReady();
}

// Draws the cover: the photos in the layout's panels, each cropped and
// positioned by its slot, the grade's washes, vignette and grain, then the
// title block — big Anton capitals with a sunset gradient, a Pacifico script
// subtitle and a star badge. The same function draws the editor preview and
// the exported PNG, so what you see is what you share.
import { GRADES, grainTile } from './grades.js';
import { LAYOUTS } from './layouts.js';

let cachedGrain = null;

/** The panel rectangles of a layout in pixels, for drawing and hit-testing. */
export function panelRects(w, h, layoutId) {
  const gutter = Math.max(2, Math.round(Math.min(w, h) * 0.014));
  return LAYOUTS[layoutId].panels.map((p) => ({
    x: p.x * w + gutter / 2,
    y: p.y * h + gutter / 2,
    w: p.w * w - gutter,
    h: p.h * h - gutter,
    tilt: p.tilt ?? 0,
  }));
}

/** The size a photo is drawn at inside a panel, for panning math in the editor. */
export function photoDrawSize(img, rect, slot) {
  const base = Math.max(rect.w / img.naturalWidth, rect.h / img.naturalHeight);
  const scale = base * slot.zoom;
  return { dw: img.naturalWidth * scale, dh: img.naturalHeight * scale };
}

/** Draws one photo cover-filling a rectangle, zoomed and panned by its slot. */
function drawPhotoIn(ctx, img, rect, slot, filter) {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const { dw, dh } = photoDrawSize(img, rect, slot);
  const dx = rect.x + (rect.w - dw) / 2 + slot.x * Math.max(0, dw - rect.w);
  const dy = rect.y + (rect.h - dh) / 2 + slot.y * Math.max(0, dh - rect.h);
  ctx.save();
  ctx.filter = filter;
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();
}

/** Fills a panel that has no photo yet with a sunset gradient and a prompt. */
function drawEmptyPanel(ctx, rect) {
  const g = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
  g.addColorStop(0, '#3d1a5e');
  g.addColorStop(0.55, '#a8326e');
  g.addColorStop(1, '#ff7a3d');
  ctx.fillStyle = g;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.font = `bold ${Math.max(14, rect.w * 0.055)}px Anton, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('YOUR PHOTO', rect.x + rect.w / 2, rect.y + rect.h / 2);
  ctx.textBaseline = 'alphabetic';
}

/** A five-pointed star path centred at (cx, cy) with outer radius r. */
function starPath(ctx, cx, cy, r) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.42;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const px = cx + Math.cos(a) * rad;
    const py = cy + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

/** The title's fill gradient, warm for the sunset grades, cool for teal, plain for noir. */
function titleGradient(ctx, w, gradeId, top, bottom) {
  const g = ctx.createLinearGradient(0, top, 0, bottom);
  if (gradeId === 'teal') {
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.6, '#c8fff2');
    g.addColorStop(1, '#3ee6c8');
  } else if (gradeId === 'noir') {
    g.addColorStop(0, '#ffffff');
    g.addColorStop(1, '#d8d8d8');
  } else {
    g.addColorStop(0, '#fff6d8');
    g.addColorStop(0.55, '#ffb347');
    g.addColorStop(1, '#ff4d8d');
  }
  return g;
}

/**
 * Draws the whole cover onto ctx at w x h from state. opts.editor adds the
 * selected panel's outline and panel numbers for the editor preview only.
 */
export function drawCover(ctx, w, h, state, opts = {}) {
  const grade = GRADES[state.grade] ?? GRADES.sunset;
  const rects = panelRects(w, h, state.layout);
  const gutter = Math.max(2, Math.round(Math.min(w, h) * 0.014));

  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#1c0b33');
  bg.addColorStop(1, '#0a0514');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  rects.forEach((rect, i) => {
    const slot = state.slots[i];
    const photo = slot && slot.photo >= 0 ? state.photos[slot.photo] : null;
    ctx.save();
    if (rect.tilt) {
      ctx.translate(rect.x + rect.w / 2, rect.y + rect.h / 2);
      ctx.rotate((rect.tilt * Math.PI) / 180);
      ctx.translate(-rect.w / 2, -rect.h / 2);
      ctx.beginPath();
      ctx.rect(0, 0, rect.w, rect.h);
      ctx.clip();
      if (photo) drawPhotoIn(ctx, photo, { x: 0, y: 0, w: rect.w, h: rect.h }, slot, grade.filter);
      else drawEmptyPanel(ctx, { x: 0, y: 0, w: rect.w, h: rect.h });
      ctx.lineWidth = gutter;
      ctx.strokeStyle = '#ffffff';
      ctx.strokeRect(0, 0, rect.w, rect.h);
    } else {
      ctx.beginPath();
      ctx.rect(rect.x, rect.y, rect.w, rect.h);
      ctx.clip();
      if (photo) drawPhotoIn(ctx, photo, rect, slot, grade.filter);
      else drawEmptyPanel(ctx, rect);
      ctx.lineWidth = gutter * 0.9;
      ctx.strokeStyle = '#ffffff';
      ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    }
    ctx.restore();
  });

  for (const wash of grade.washes) {
    const g = ctx.createLinearGradient(0, 0, w * 0.35, h);
    g.addColorStop(0, `rgb(${wash.from.join(',')})`);
    g.addColorStop(1, `rgb(${wash.to.join(',')})`);
    ctx.save();
    ctx.globalCompositeOperation = wash.blend;
    ctx.globalAlpha = wash.alpha;
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  const vig = ctx.createRadialGradient(
    w / 2, h / 2, Math.min(w, h) * 0.35,
    w / 2, h / 2, Math.max(w, h) * 0.75,
  );
  vig.addColorStop(0, 'rgba(8, 0, 18, 0)');
  vig.addColorStop(1, `rgba(8, 0, 18, ${grade.vignette})`);
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);

  if (!cachedGrain) cachedGrain = grainTile();
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = 0.07 * grade.grain;
  ctx.fillStyle = ctx.createPattern(cachedGrain, 'repeat');
  ctx.fillRect(0, 0, w, h);
  ctx.restore();

  const below = LAYOUTS[state.layout].title === 'below';
  const scrimTop = (below ? 0.8 : 0.64) * h;
  const scrim = ctx.createLinearGradient(0, scrimTop, 0, h);
  scrim.addColorStop(0, 'rgba(10, 3, 22, 0)');
  scrim.addColorStop(0.45, 'rgba(10, 3, 22, 0.72)');
  scrim.addColorStop(1, 'rgba(10, 3, 22, 0.88)');
  ctx.fillStyle = scrim;
  ctx.fillRect(0, scrimTop, w, h - scrimTop);

  const title = state.title.trim().toUpperCase();
  if (title) {
    let size = h * 0.115;
    ctx.font = `${size}px Anton, sans-serif`;
    while (ctx.measureText(title).width > w * 0.92 && size > 10) {
      size -= 2;
      ctx.font = `${size}px Anton, sans-serif`;
    }
    const titleY = h * 0.885;
    ctx.textAlign = 'center';
    ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(2, size * 0.07);
    ctx.strokeStyle = 'rgba(10, 2, 20, 0.9)';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
    ctx.shadowBlur = size * 0.18;
    ctx.shadowOffsetY = size * 0.04;
    ctx.strokeText(title, w / 2, titleY);
    ctx.fillStyle = titleGradient(ctx, w, state.grade, titleY - size, titleY);
    ctx.fillText(title, w / 2, titleY);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
  }

  const subtitle = state.subtitle.trim();
  if (subtitle) {
    const subSize = h * 0.052;
    ctx.save();
    ctx.translate(w / 2, h * 0.955);
    ctx.rotate(-0.03);
    ctx.font = `${subSize}px Pacifico, cursive`;
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(255, 60, 160, 0.8)';
    ctx.shadowBlur = subSize * 0.5;
    ctx.fillStyle = '#ff7ad9';
    ctx.fillText(subtitle, 0, 0);
    ctx.restore();
  }

  if (state.badge) {
    const starR = Math.max(6, h * 0.016);
    const gap = starR * 2.6;
    const total = gap * 4;
    const startX = w - gutter * 2 - total - 2 * starR;
    const cy = gutter * 2 + starR;
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 4;
    ctx.fillStyle = '#ffd94d';
    for (let i = 0; i < 5; i++) {
      starPath(ctx, startX + i * gap + starR, cy, starR);
      ctx.fill();
    }
    ctx.restore();
    ctx.font = `${Math.max(12, h * 0.024)}px Anton, sans-serif`;
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 4;
    ctx.fillText('EST. 2026', w - gutter * 2, cy + starR * 3.1);
    ctx.shadowBlur = 0;
  }

  ctx.lineWidth = gutter;
  ctx.strokeStyle = '#ffffff';
  ctx.strokeRect(gutter / 2, gutter / 2, w - gutter, h - gutter);

  if (opts.editor) {
    rects.forEach((rect, i) => {
      const chip = Math.max(18, Math.round(h * 0.028));
      ctx.save();
      if (rect.tilt) {
        ctx.translate(rect.x + rect.w / 2, rect.y + rect.h / 2);
        ctx.rotate((rect.tilt * Math.PI) / 180);
        ctx.translate(-rect.w / 2, -rect.h / 2);
      }
      ctx.fillStyle = i === state.selected ? '#ff4d8d' : 'rgba(10, 3, 22, 0.8)';
      ctx.beginPath();
      ctx.roundRect(rect.x + 6, rect.y + 6, chip, chip, 6);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.round(chip * 0.62)}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(i + 1), rect.x + 6 + chip / 2, rect.y + 6 + chip / 2 + 1);
      ctx.textBaseline = 'alphabetic';
      if (i === state.selected) {
        ctx.setLineDash([10, 6]);
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#ff4d8d';
        ctx.strokeRect(rect.x - 2, rect.y - 2, rect.w + 4, rect.h + 4);
        ctx.setLineDash([]);
      }
      ctx.restore();
    });
  }
}

// Draws the raked-sand gardens behind `[data-garden]` sections: straight rake
// lines, broken around stones, with ripples slowly drifting outward from each
// stone. Each stone stands for a feed; the ripples are new posts arriving.

const RING = 9;
const WIDE = 960;
const FRAME_MS = 1000 / 30;
const RIPPLE_PERIOD_S = 8;

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const darkScheme = window.matchMedia("(prefers-color-scheme: dark)");

let palette = readPalette();

function readPalette() {
  const style = getComputedStyle(document.documentElement);
  const v = (name) => style.getPropertyValue(name).trim();
  return {
    line: v("--sand-line"),
    sunHighlight: v("--sun-highlight"),
    sun: v("--sun"),
    ember: v("--ember"),
    stoneLight: v("--stone-light"),
    stoneDark: v("--stone-dark")
  };
}

function placeStones(kind, w, h, copy) {
  if (kind === "page") {
    if (w < 560) {
      return [];
    }
    const stones = [
      { x: w - Math.max(90, w * 0.14), y: h * 0.56, r: 22, sun: true }
    ];
    if (w >= 900) {
      stones.push({ x: w * 0.68, y: h * 0.74, r: 12 });
    }
    return stones;
  }

  if (w >= WIDE) {
    const left = copy.right + 40;
    const cx = (left + w) / 2;
    const s = Math.min(w, 1400) / 1400;
    return [
      { x: cx + 20 * s, y: h * 0.4, r: 70 * s + 18, sun: true },
      { x: cx + 170 * s, y: h * 0.78, r: 32 * s + 10 },
      { x: cx - 150 * s, y: h * 0.8, r: 22 * s + 8 }
    ];
  }

  return [
    { x: w * 0.7, y: h - 120, r: 36, sun: true },
    { x: w * 0.24, y: h - 70, r: 18 }
  ];
}

function drawGarden(garden, t) {
  const canvas = garden.canvas;
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  if (w === 0 || h === 0) {
    return;
  }

  if (
    canvas.width !== Math.round(w * dpr) ||
    canvas.height !== Math.round(h * dpr)
  ) {
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    garden.stones = null;
  }

  if (!garden.stones) {
    const outer = garden.el.getBoundingClientRect();
    const copyRect = garden.copy.getBoundingClientRect();
    garden.stones = placeStones(garden.kind, w, h, {
      right: copyRect.right - outer.left
    });
    garden.rings = w < 560 ? 4 : 6;
  }

  const { stones, rings } = garden;
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  ctx.lineWidth = 1;
  ctx.strokeStyle = palette.line;

  // Rake lines, broken where they would cross a stone's ripples.
  const drift = t * 0.05;
  for (let y = 8; y < h; y += RING) {
    ctx.beginPath();
    let drawing = false;
    for (let x = 0; x <= w; x += 3) {
      const inside = stones.some(
        (st) => Math.hypot(x - st.x, y - st.y) < st.r + RING * rings + 4
      );
      if (inside) {
        drawing = false;
        continue;
      }
      const yy = y + Math.sin(x / 140 + y / 60 + drift) * 1.2;
      if (drawing) {
        ctx.lineTo(x, yy);
      } else {
        ctx.moveTo(x, yy);
        drawing = true;
      }
    }
    ctx.stroke();
  }

  // Ripples drift outward; the innermost fades in as the outermost fades out.
  const phase = (t / RIPPLE_PERIOD_S) % 1;
  for (const st of stones) {
    for (let k = 0; k < rings; k++) {
      let alpha = 1;
      if (k === 0) {
        alpha = phase;
      } else if (k === rings - 1) {
        alpha = 1 - phase;
      }
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(st.x, st.y, st.r + RING * (k + phase) + 4, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;

  for (const st of stones) {
    const g = ctx.createRadialGradient(
      st.x - st.r * 0.3,
      st.y - st.r * 0.4,
      st.r * 0.1,
      st.x,
      st.y,
      st.r
    );
    if (st.sun) {
      g.addColorStop(0, palette.sunHighlight);
      g.addColorStop(0.7, palette.sun);
      g.addColorStop(1, palette.ember);
    } else {
      g.addColorStop(0, palette.stoneLight);
      g.addColorStop(1, palette.stoneDark);
    }
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(st.x, st.y, st.r, st.r * 0.92, -0.3, 0, Math.PI * 2);
    ctx.fill();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const gardens = [...document.querySelectorAll("[data-garden]")].map((el) => ({
    el,
    kind: el.dataset.garden,
    canvas: el.querySelector("canvas"),
    copy: el.querySelector(".app--garden-copy"),
    visible: true,
    stones: null,
    rings: 6
  }));
  if (gardens.length === 0) {
    return;
  }

  const start = performance.now();
  const now = () =>
    reducedMotion.matches ? 0 : (performance.now() - start) / 1000;
  const drawAll = () => gardens.forEach((g) => drawGarden(g, now()));

  let last = 0;
  const tick = (ts) => {
    if (reducedMotion.matches) {
      return;
    }
    if (ts - last >= FRAME_MS) {
      last = ts;
      gardens.filter((g) => g.visible).forEach((g) => drawGarden(g, now()));
    }
    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const garden = gardens.find((g) => g.el === entry.target);
      garden.visible = entry.isIntersecting;
    }
  });
  gardens.forEach((g) => observer.observe(g.el));

  const resizeObserver = new ResizeObserver(() => {
    gardens.forEach((g) => (g.stones = null));
    drawAll();
  });
  gardens.forEach((g) => resizeObserver.observe(g.el));

  darkScheme.addEventListener("change", () => {
    palette = readPalette();
    drawAll();
  });
  reducedMotion.addEventListener("change", () => {
    drawAll();
    if (!reducedMotion.matches) {
      requestAnimationFrame(tick);
    }
  });

  document.fonts?.ready.then(() => {
    gardens.forEach((g) => (g.stones = null));
    drawAll();
  });

  drawAll();
  requestAnimationFrame(tick);
});

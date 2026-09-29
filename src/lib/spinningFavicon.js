/**
 * SpinningFavicon — animates the browser tab icon as a slowly rotating
 * 3D dotted sphere (the "thinking orb" from the farewell design).
 *
 * A tiny canvas renders frames and swaps the favicon link's data URL.
 * The static favicon files stay in place as the initial icon and as the
 * fallback where animation isn't possible.
 *
 * Performance notes: the canvas is 32px, frames are throttled to ~12fps,
 * and requestAnimationFrame automatically pauses while the tab is in the
 * background — the cost is negligible. Prefers-reduced-motion visitors
 * keep the static icon.
 */

const SIZE = 32;
const FRAME_MS = 80; // ~12 fps
const SPEED = 0.85; // radians per second (≈ 7.4s per rotation)
const TILT = 0.42; // axis tilt so the rotation reads as 3D
// depth tint: deep blue on the far side (visible on light tabs),
// bright blue on the near side (pops on dark tabs) — matches the
// static favicon files
const DOT_FAR = { r: 58, g: 128, b: 242 };
const DOT_NEAR = { r: 160, g: 200, b: 255 };

/** Dots distributed over the sphere (Fibonacci spacing + hand-tuned jitter). */
const DOTS = (() => {
  const n = 56;
  const out = [];
  for (let i = 0; i < n; i += 1) {
    const y = 1 - (2 * i) / (n - 1);
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const th = i * 2.399963229728653; // golden angle
    const jx = Math.sin(i * 12.9898) * 0.05;
    const jy = Math.sin(i * 78.233) * 0.05;
    const p = {
      x: Math.cos(th) * r + jx,
      y: y + jy,
      z: Math.sin(th) * r,
      // varied dot sizes feel hand-placed, like the reference orb
      size: 0.052 + 0.026 * (0.5 + 0.5 * Math.sin(i * 4.7)),
    };
    const len = Math.hypot(p.x, p.y, p.z) || 1;
    p.x /= len;
    p.y /= len;
    p.z /= len;
    out.push(p);
  }
  return out;
})();

export function startSpinningFavicon() {
  if (typeof document === "undefined") return;
  if (typeof window === "undefined") return;
  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  if (reduced) return;

  const link = document.createElement("link");
  link.rel = "icon";
  link.type = "image/png";
  link.id = "spinning-favicon";
  document.head.appendChild(link);

  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const cosT = Math.cos(TILT);
  const sinT = Math.sin(TILT);
  let angle = 0;
  let lastDraw = 0;
  let lastTick = performance.now();

  const draw = (now) => {
    const dt = Math.min(0.1, (now - lastTick) / 1000);
    lastTick = now;
    angle += SPEED * dt;

    ctx.clearRect(0, 0, SIZE, SIZE);
    const c = SIZE / 2;
    const R = SIZE * 0.44;
    const ca = Math.cos(angle);
    const sa = Math.sin(angle);

    for (const d of DOTS) {
      // spin around the Y axis, then tilt the axis toward the viewer
      const x1 = d.x * ca + d.z * sa;
      const z1 = -d.x * sa + d.z * ca;
      const y2 = d.y * cosT - z1 * sinT;
      const z2 = d.y * sinT + z1 * cosT;

      const depth = (z2 + 1) / 2; // 0 = far side, 1 = near side
      if (z2 < -0.2) continue; // skip dots facing away

      const px = c + x1 * R;
      const py = c + y2 * R;
      const rad = d.size * SIZE * (0.85 + 0.55 * depth);
      const alpha = 0.35 + 0.65 * depth;
      const cr = Math.round(DOT_FAR.r + (DOT_NEAR.r - DOT_FAR.r) * depth);
      const cg = Math.round(DOT_FAR.g + (DOT_NEAR.g - DOT_FAR.g) * depth);
      const cb = Math.round(DOT_FAR.b + (DOT_NEAR.b - DOT_FAR.b) * depth);

      ctx.beginPath();
      ctx.arc(px, py, rad, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${cr},${cg},${cb},${alpha.toFixed(3)})`;
      ctx.fill();
    }

    link.href = canvas.toDataURL("image/png");
  };

  const tick = (now) => {
    if (now - lastDraw >= FRAME_MS) {
      lastDraw = now;
      draw(now);
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

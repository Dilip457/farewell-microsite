import { useEffect, useRef } from "react";

/**
 * CinematicBackground — fixed multi-layer atmosphere behind the page.
 *
 * Layers (back to front):
 *   1. near-black base gradient
 *   2. slowly drifting atmospheric gradient orbs
 *   3. cinematic light leaks
 *   4. canvas particle / dust field (depth layers, pausable)
 *   5. cursor-reactive glow (desktop only)
 *   6. film grain
 *   7. vignette
 *
 * Performance notes:
 *   - no live `filter: blur()` on animated layers (gradients already fade);
 *     a blur filter forces a re-filter every animation frame
 *   - the particle canvas stops painting while `paused` (modal open), so
 *     nothing under the modal's backdrop-filter changes and the blur is
 *     not recomputed every frame
 */

const PARTICLE_TINTS = [
  "rgba(170, 200, 255, 1)",
  "rgba(205, 185, 255, 1)",
  "rgba(255, 255, 255, 1)",
];

function ParticleField({ paused = false }) {
  const canvasRef = useRef(null);
  const pausedRef = useRef(paused);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let particles = [];
    let raf = 0;
    let w = 0;
    let h = 0;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);

    const makeParticle = () => {
      const depth = Math.random(); // 0 = far, 1 = near
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.4 + depth * 1.6,
        baseAlpha: 0.08 + depth * 0.42,
        vy: -(0.05 + depth * 0.22), // near particles drift a little faster
        swayAmp: 6 + depth * 18,
        swaySpeed: 0.00015 + depth * 0.0003,
        phase: Math.random() * Math.PI * 2,
        color: PARTICLE_TINTS[(Math.random() * PARTICLE_TINTS.length) | 0],
      };
    };

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const mobile = w < 768;
      const count = mobile ? 30 : 70;
      particles = Array.from({ length: count }, makeParticle);
    };

    let t = 0;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        const twinkle = 0.6 + 0.4 * Math.sin(p.phase + t * p.swaySpeed * 4);
        ctx.globalAlpha = p.baseAlpha * twinkle;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x + Math.sin(t * p.swaySpeed + p.phase) * p.swayAmp, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const step = () => {
      // while paused (modal open) skip all work — no repaint means the
      // page above doesn't have to recompute its backdrop blur
      if (!pausedRef.current) {
        t += 16;
        for (const p of particles) {
          p.y += p.vy;
          if (p.y < -8) {
            p.y = h + 8;
            p.x = Math.random() * w;
          }
        }
        draw();
      }
      raf = requestAnimationFrame(step);
    };

    resize();
    window.addEventListener("resize", resize);

    if (reduced) {
      // draw one static frame, no animation
      draw();
    } else {
      raf = requestAnimationFrame(step);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
    />
  );
}

/** Soft glow that follows the cursor — the "light source" feel. */
function CursorGlow() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let tx = window.innerWidth / 2;
    let ty = window.innerHeight * 0.35;
    let x = tx;
    let y = ty;

    const onMove = (e) => {
      tx = e.clientX;
      ty = e.clientY;
    };

    const loop = () => {
      x += (tx - x) * 0.045; // very lazy follow — slow, expensive feel
      y += (ty - y) * 0.045;
      el.style.transform = `translate3d(${x - 350}px, ${y - 350}px, 0)`;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute h-[700px] w-[700px] rounded-full opacity-[0.06]"
      style={{
        background:
          "radial-gradient(circle, rgba(140,175,255,0.5), rgba(140,175,255,0) 60%)",
        willChange: "transform",
      }}
    />
  );
}

export default function CinematicBackground({ paused = false }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {/* Layer 1 — base */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 20% 30%, rgba(30,100,180,0.25), transparent 40%)," +
            "radial-gradient(circle at 80% 40%, rgba(150,70,180,0.20), transparent 45%)," +
            "linear-gradient(160deg, #050507 0%, #08090d 55%, #0b0d12 100%)",
        }}
      />

      {/* Layer 2 — atmospheric orbs (soft gradients, no live blur) */}
      <div
        className="orb orb-a h-[46vw] w-[46vw] opacity-[0.16]"
        style={{
          top: "-12%",
          left: "-10%",
          background:
            "radial-gradient(circle, rgba(60,110,220,0.85), rgba(60,110,220,0) 70%)",
        }}
      />
      <div
        className="orb orb-b h-[40vw] w-[40vw] opacity-[0.13]"
        style={{
          bottom: "-16%",
          right: "-8%",
          background:
            "radial-gradient(circle, rgba(150,80,210,0.8), rgba(150,80,210,0) 70%)",
        }}
      />
      <div
        className="orb orb-a h-[26vw] w-[26vw] opacity-[0.09]"
        style={{
          top: "42%",
          left: "38%",
          animationDelay: "-18s",
          background:
            "radial-gradient(circle, rgba(120,150,255,0.8), rgba(120,150,255,0) 70%)",
        }}
      />

      {/* Layer 3 — cinematic light leaks (soft gradients, no live blur) */}
      <div
        className="light-leak leak-a h-[34vw] w-[52vw] opacity-[0.14]"
        style={{
          top: "6%",
          right: "-12%",
          background:
            "radial-gradient(ellipse, rgba(200,220,255,0.9), rgba(200,220,255,0) 65%)",
          borderRadius: "50%",
        }}
      />
      <div
        className="light-leak leak-b h-[30vw] w-[44vw] opacity-[0.10]"
        style={{
          bottom: "4%",
          left: "-14%",
          background:
            "radial-gradient(ellipse, rgba(185,130,240,0.85), rgba(185,130,240,0) 65%)",
          borderRadius: "50%",
        }}
      />

      {/* Layer 4 — particles */}
      <ParticleField paused={paused} />

      {/* Layer 5 — cursor-reactive light */}
      <CursorGlow />

      {/* Layer 6 — film grain */}
      <div className="grain" />

      {/* Layer 7 — vignette */}
      <div className="vignette" />
    </div>
  );
}

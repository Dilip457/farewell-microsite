import { useRef } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

const GLOWS = {
  blue: "rgba(100, 150, 255, 0.14)",
  violet: "rgba(170, 120, 255, 0.13)",
  pink: "rgba(230, 130, 215, 0.11)",
};

/**
 * PersonCard — a floating glass tile.
 *  - 3D tilt (max ±4°) driven by cursor, spring-smoothed
 *  - soft light that follows the cursor inside the card
 *  - hover: subtle lift toward the viewer, "View note" reveal
 *  - keyboard focus mirrors the hover affordance
 */
export default function PersonCard({ person, onSelect }) {
  const reduced = useReducedMotion();

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springConfig = { stiffness: 140, damping: 18, mass: 0.6 };
  const sRotateX = useSpring(rotateX, springConfig);
  const sRotateY = useSpring(rotateY, springConfig);

  const cardRef = useRef(null);

  const canHover =
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover)").matches;

  const handleMouseMove = (e) => {
    const el = cardRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    // cursor-follow light
    el.style.setProperty("--mouse-x", `${px}px`);
    el.style.setProperty("--mouse-y", `${py}px`);

    // 3D tilt (disabled for reduced motion / touch)
    if (reduced || !canHover) return;
    const nx = px / rect.width - 0.5; // -0.5 .. 0.5
    const ny = py / rect.height - 0.5;
    rotateY.set(nx * 8); // ±4°
    rotateX.set(-ny * 8); // ±4°
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.button
      ref={cardRef}
      type="button"
      onClick={onSelect}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: sRotateX,
        rotateY: sRotateY,
        transformPerspective: 1200,
        "--card-glow": GLOWS[person.accent] || GLOWS.blue,
      }}
      whileHover={reduced ? undefined : { scale: 1.02, z: 18 }}
      whileTap={reduced ? undefined : { scale: 0.985 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      aria-haspopup="dialog"
      aria-label={`Open personal note for ${person.name}`}
      className={`glass-card tint-${person.accent} group flex h-[190px] w-full cursor-pointer flex-col justify-between p-6 text-left sm:h-[200px] lg:h-[210px]`}
    >
      {/* cursor-follow light */}
      <span className="card-light" aria-hidden="true" />

      {/* top row — sequence number + arrow */}
      <div className="relative flex items-start justify-between">
        <span
          aria-hidden="true"
          className="select-none text-[11px] font-medium tracking-[0.3em] text-[rgba(255,255,255,0.22)]"
        >
          {person.number}
        </span>
        <svg
          aria-hidden="true"
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          className="mt-[2px] text-[rgba(255,255,255,0.3)] transition-colors duration-500 group-hover:text-[rgba(125,184,255,0.85)]"
        >
          <path
            d="M2 12L12 2M12 2H4.5M12 2v7.5"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* bottom row — name + view note */}
      <div className="relative">
        <h3 className="card-name text-[#f5f5f5]">
          {person.name.split(" ").map((part, i) => (
            <span key={i} className="block">
              {part}
            </span>
          ))}
        </h3>
        <span className="view-note mt-3 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.28em] text-[rgba(160,195,255,0.9)]">
          View note
          <svg width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden="true">
            <path
              d="M1 5h9.5M7 1.5L10.5 5 7 8.5"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
    </motion.button>
  );
}

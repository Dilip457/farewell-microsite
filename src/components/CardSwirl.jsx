import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const CARD_W = 300;
const CARD_H = 300;
const STEP = 340; // horizontal distance between neighbouring cards
const ROT_PER_STEP = 32; // degrees of Y rotation per step away from the centre
const SCROLL_PER_CARD = 150; // vertical scroll needed to advance one card
const MAX_STEPS = 3; // how many steps either side stay legible

/**
 * SwirlCard — one card on the carousel.
 *
 * `pos` is this card's distance from the centre of the screen measured in
 * card-steps: 0 means it is the centred card. Everything else is derived
 * from it, exactly like the reference: the card sweeps horizontally, turns
 * from edge-on at the sides to square-on at the centre, grows as it comes
 * toward the viewer, and the centred card always sits in front of the rest.
 */
function SwirlCard({ i, n, progress, children }) {
  const pos = useTransform(progress, (v) => i - v * (n - 1));
  const x = useTransform(pos, (v) => v * STEP);
  const rotateY = useTransform(pos, (v) =>
    Math.max(-72, Math.min(72, v * ROT_PER_STEP))
  );
  const scale = useTransform(
    pos,
    (v) => 1.06 - Math.min(Math.abs(v), MAX_STEPS) * 0.13
  );
  const z = useTransform(pos, (v) => -Math.min(Math.abs(v), MAX_STEPS) * 100);
  const opacity = useTransform(pos, (v) =>
    Math.max(0.08, 1 - Math.min(Math.abs(v), MAX_STEPS) * 0.3)
  );
  // the nearer the centre, the higher it stacks
  const zIndex = useTransform(pos, (v) => Math.round(400 - Math.abs(v) * 30));

  return (
    <div
      className="absolute left-1/2 top-1/2"
      style={{
        width: CARD_W,
        height: CARD_H,
        marginLeft: -CARD_W / 2,
        marginTop: -CARD_H / 2,
        // let the perspective from the stage reach the card's own rotation
        transformStyle: "preserve-3d",
      }}
    >
      <motion.div
        className="relative h-full w-full"
        style={{ x, rotateY, scale, z, opacity, zIndex, transformStyle: "preserve-3d" }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/**
 * CardSwirl — the wall as a scroll-driven 3D carousel.
 *
 * Vertical scroll drives the whole strip horizontally: every card sweeps
 * through the centre of the screen in turn, turning from edge-on to flat and
 * growing as it arrives, then turning away as it leaves. One shared scroll
 * progress drives all of it (transform only, no layout, no filters), so it
 * stays smooth however long the strip is.
 *
 * Reduced-motion visitors get the plain grid instead.
 */
export default function CardSwirl({ people, renderCard, reduced, startIndex = 0, jumpTo = null }) {
  const wrapRef = useRef(null);
  const n = people.length;
  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end end"],
  });

  // scroll the page so a given card sits at the centre of the carousel
  const centreOn = (idx) => {
    const el = wrapRef.current;
    if (!el || n < 2 || idx < 0) return;
    const travel = el.offsetHeight - window.innerHeight;
    const top =
      el.getBoundingClientRect().top +
      window.scrollY +
      (idx / (n - 1)) * Math.max(travel, 1);
    window.scrollTo({ top, behavior: "smooth" });
  };

  // open on the visitor's own card (identity mode)
  useEffect(() => {
    if (reduced || !startIndex) return undefined;
    const t = setTimeout(() => centreOn(startIndex), 700);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startIndex, reduced]);

  // typing a unique name sweeps the carousel straight to that card
  useEffect(() => {
    if (reduced || jumpTo === null || jumpTo === undefined || jumpTo < 0) return undefined;
    const t = setTimeout(() => centreOn(jumpTo), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jumpTo, reduced]);

  if (reduced) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {people.map((p, i) => (
          <div key={p.id}>{renderCard(p, i)}</div>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={wrapRef}
      className="relative"
      style={{ height: `calc(74vh + ${(n - 1) * SCROLL_PER_CARD}px)` }}
    >
      <div
        className="carousel sticky top-[13vh] h-[74vh] overflow-hidden"
        style={{ perspective: 1500, transformStyle: "preserve-3d" }}
      >
        {people.map((p, i) => (
          <SwirlCard key={p.id} i={i} n={n} progress={scrollYProgress}>
            {renderCard(p, i)}
          </SwirlCard>
        ))}
      </div>
    </div>
  );
}

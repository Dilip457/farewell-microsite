import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

/** JourneyMarker — a quiet fixed "01 / 02" progress cue in the corner
 *  that flips as the visitor moves from the introduction to their note. */
export default function JourneyMarker() {
  const [stage, setStage] = useState(1);

  useEffect(() => {
    let raf = 0;
    let scheduled = false;

    const update = () => {
      scheduled = false;
      const people = document.getElementById("people");
      if (!people) {
        setStage(1);
        return;
      }
      // section 02 once its heading zone crosses above ~55% of the viewport
      const top = people.getBoundingClientRect().top;
      setStage(top < window.innerHeight * 0.55 ? 2 : 1);
    };

    const onScroll = () => {
      if (scheduled) return;
      scheduled = true;
      raf = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    update();

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const label = stage === 1 ? "Signing Off" : "A Note For You";

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed bottom-6 right-6 z-30 hidden select-none sm:block"
    >
      <AnimatePresence mode="wait">
        <motion.p
          key={stage}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.55, ease: EASE }}
          className="flex items-center gap-2.5 text-[10px] font-medium uppercase tracking-[0.32em] text-[rgba(255,255,255,0.38)]"
        >
          <span className="text-[rgba(138,196,255,0.75)]">0{stage}</span>
          <span className="h-px w-5 bg-[rgba(255,255,255,0.25)]" />
          <span>{label}</span>
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

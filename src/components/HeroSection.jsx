import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

/** One element of the cinematic entrance: blurred rise from below. */
const rise = (delay = 0) => ({
  initial: { opacity: 0, y: 40, filter: "blur(8px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { duration: 1.4, delay, ease: EASE },
});

export default function HeroSection() {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // hero drifts up, scales down and fades as you scroll into section 02
  const y = useTransform(scrollYProgress, [0, 1], ["0vh", "-16vh"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden"
      aria-label="Introduction"
    >
      <motion.div
        style={reduced ? undefined : { y, scale, opacity }}
        className="mx-auto w-full max-w-6xl px-6 sm:px-10 lg:px-14"
      >
        <motion.p {...rise(0.1)} className="section-label mb-8">
          01 / Signing Off
        </motion.p>

        <motion.h1 {...rise(0.28)} className="hero-title text-[#f5f5f5]">
          One Last
          <br />
          Ping :)
        </motion.h1>

        <motion.p
          {...rise(0.5)}
          className="mt-10 max-w-xl text-[15px] leading-relaxed tracking-wide text-[rgba(255,255,255,0.55)] sm:text-base"
        >
          Some journeys end, but the people and the moments that made them
          meaningful stay with us. Before I move forward, I wanted to leave a
          small note for the people who made this journey memorable.
        </motion.p>
      </motion.div>

      {/* scroll indicator */}
      <motion.a
        href="#people"
        aria-label="Scroll to explore"
        {...rise(1.1)}
        className="absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3"
      >
        <span className="text-[10px] font-medium uppercase tracking-[0.4em] text-[rgba(255,255,255,0.4)]">
          Scroll to explore
        </span>
        <svg
          width="10"
          height="18"
          viewBox="0 0 10 18"
          fill="none"
          aria-hidden="true"
        >
          <path
            className="scroll-dot"
            d="M5 1v14m0 0l-3.5-3.5M5 15l3.5-3.5"
            stroke="rgba(255,255,255,0.55)"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      </motion.a>
    </section>
  );
}

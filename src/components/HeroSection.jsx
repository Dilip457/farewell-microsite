import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import OrbitalRings from "./OrbitalRings";

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

  // the hero scene drifts up and dissolves as the wall scene takes over
  const y = useTransform(scrollYProgress, [0, 1], ["0vh", "-18vh"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const objectY = useTransform(scrollYProgress, [0, 1], ["0vh", "10vh"]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100svh] items-center overflow-hidden"
      aria-label="Introduction"
    >
      {/* cinematic frame — a hairline inset around the scene */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-4 hidden rounded-[30px] border border-[rgba(255,255,255,0.05)] sm:block"
      />

      <motion.div
        style={reduced ? undefined : { y, scale, opacity }}
        className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-6 pb-24 pt-28 sm:px-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-6 lg:px-20 lg:pb-0 lg:pt-0"
      >
        {/* left — the words */}
        <div>
          <motion.p {...rise(0.1)} className="section-label mb-8 max-w-[220px]">
            01 / Signing Off
          </motion.p>

          <motion.h1 {...rise(0.28)} className="hero-title text-[#f5f5f5]">
            One Last
            <br />
            <span className="hero-accent">Ping :)</span>
          </motion.h1>

          <motion.p
            {...rise(0.5)}
            className="mt-10 max-w-xl text-[15px] leading-relaxed tracking-wide text-[rgba(255,255,255,0.55)] sm:text-base"
          >
            Some journeys end, but the people and the moments that made them
            meaningful stay with us. Before I move forward, I wanted to leave a
            small note for the people who made this journey memorable.
          </motion.p>
        </div>

        {/* right — the signature object */}
        <motion.div
          style={reduced ? undefined : { y: objectY }}
          className="relative flex items-center justify-center lg:justify-end"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.86 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2.2, delay: 0.5, ease: EASE }}
          >
            <OrbitalRings className="scale-[0.72] sm:scale-90 lg:scale-100" />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* scroll cue */}
      <motion.a
        href="#people"
        aria-label="Scroll to explore"
        {...rise(1.15)}
        className="absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3"
      >
        <span className="hud-meta">SCROLL TO EXPLORE</span>
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

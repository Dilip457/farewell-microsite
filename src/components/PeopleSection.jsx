import { useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import PersonCard from "./PersonCard";
import { colleagues } from "../data/colleagues";

const EASE = [0.22, 1, 0.36, 1];

const heading = {
  initial: { opacity: 0, y: 40, filter: "blur(8px)" },
  whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { duration: 1.4, ease: EASE },
};

const sectionClass =
  "relative z-10 mx-auto w-full max-w-6xl px-6 pb-40 pt-32 sm:px-10 sm:pt-44 lg:px-14";

/**
 * SwirlTile — one card riding the swirl.
 *
 * Each card tracks its OWN journey through the viewport: rising from the
 * bottom it sits further away and tilts back, at the middle of the screen it
 * faces the viewer, comes forward and grows, and as it leaves the top it
 * tilts away again. Added to the per-column curve (outer columns angled
 * outward), the wall reads as a cylinder of glass panels sweeping past.
 *
 * Because every card animates as it crosses the screen, the effect is
 * visible on any window size — not just when the whole section travels.
 * Transform-only (no layout, no filters) so it stays smooth.
 */
function SwirlTile({ i, wide, reduced, children }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const colOffset = wide ? (i % 3) - 1 : 0; // -1 | 0 | 1
  const curve = colOffset * 24; // the resting cylinder curve

  // tilt as it travels: leaning back at the edges, square-on at the centre
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [-20, 0, 20]);
  // column curve, plus a little extra turn as it passes
  const rotateY = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [curve + colOffset * 10 + 9, curve, curve - colOffset * 10 - 9]
  );
  // depth: the card comes toward the viewer as it crosses the centre
  const z = useTransform(scrollYProgress, [0, 0.5, 1], [-160, 70, -160]);
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [26, 0, -26]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1.03, 0.9]);
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.12, 0.88, 1],
    [0.35, 1, 1, 0.35]
  );

  if (reduced) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={ref}
      style={{ rotateX, rotateY, z, y, scale, opacity, transformStyle: "preserve-3d" }}
      className="will-change-transform"
    >
      {children}
    </motion.div>
  );
}

/**
 * PeopleSection — three modes:
 *  - pick (no identity yet): the full card wall IS the gate — every tile is
 *    clickable with "This is me"; clicking your card reveals your note
 *  - identity: the personalized reveal — every tile is sealed except the
 *    visitor's own, which glows and opens their note
 *  - `preview` (author appends #preview to the URL): the full grid of
 *    every colleague card, all open — so the author can review all notes
 */
export default function PeopleSection({ identity, preview = false, onSelect, onPick }) {
  const reduced = useReducedMotion();
  const [query, setQuery] = useState("");

  // the curve needs three columns; from 768px up the wall swirls
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const on = () => setWide(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return colleagues;
    return colleagues.filter((c) => c.name.toLowerCase().includes(q));
  }, [query]);

  const tile = (person, i, card) => (
    <SwirlTile key={person.id} i={i} wide={wide} reduced={reduced}>
      {card}
    </SwirlTile>
  );

  if (preview) {
    return (
      <section id="people" aria-label="All notes — author preview" className={sectionClass}>
        <div aria-hidden="true" className="wall-glow" />
        <motion.p {...heading} className="section-label mb-8">
          02 / All notes — author preview
        </motion.p>

        <motion.h2
          {...heading}
          transition={{ ...heading.transition, delay: 0.15 }}
          className="section-title mb-4 text-[#f5f5f5]"
        >
          A few words,
          <br />
          for each of you.
        </motion.h2>

        <motion.p
          {...heading}
          transition={{ ...heading.transition, delay: 0.3 }}
          className="mb-20 max-w-md text-sm leading-relaxed text-[rgba(255,255,255,0.5)] sm:mb-28"
        >
          Open any card to review its note. This view is only for you — your
          colleagues will each see their own card alone.
        </motion.p>

        <div className="swirl-stage grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {colleagues.map((person, i) =>
            tile(
              person,
              i,
              <PersonCard person={person} onSelect={() => onSelect(person)} />
            )
          )}
        </div>
      </section>
    );
  }

  // ---- pick mode: the card wall is the gate ----
  if (!identity) {
    return (
      <section id="people" aria-label="Find your card" className={sectionClass}>
        <div aria-hidden="true" className="wall-glow" />
        <motion.p {...heading} className="section-label mb-8">
          02 / A note for you
        </motion.p>

        <motion.h2
          {...heading}
          transition={{ ...heading.transition, delay: 0.15 }}
          className="section-title mb-4 text-[#f5f5f5]"
        >
          Which one
          <br />
          are you?
        </motion.h2>

        <motion.p
          {...heading}
          transition={{ ...heading.transition, delay: 0.3 }}
          className="mb-10 max-w-md text-sm leading-relaxed text-[rgba(255,255,255,0.5)]"
        >
          Every interaction here has meant a lot to me. Find your card below —
          a small note from my side is waiting inside.
        </motion.p>

        <motion.div
          {...heading}
          transition={{ ...heading.transition, delay: 0.4 }}
          className="mb-8 max-w-md"
        >
          <label htmlFor="pick-search" className="sr-only">
            Search your name
          </label>
          <input
            id="pick-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type your name to find your card…"
            autoComplete="off"
            className="w-full rounded-2xl border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.03)] px-5 py-3.5 text-[15px] text-[#f5f5f5] outline-none transition-colors duration-300 placeholder:text-[rgba(255,255,255,0.3)] focus:border-[rgba(125,184,255,0.5)]"
          />
        </motion.div>

        <div className="swirl-stage grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((person, i) =>
            tile(
              person,
              i,
              <PersonCard
                person={person}
                actionLabel="This is me"
                onSelect={() => onPick(person)}
              />
            )
          )}
          {filtered.length === 0 && (
            <p className="col-span-full py-6 text-center text-sm text-[rgba(255,255,255,0.4)]">
              No name matches “{query}”.
            </p>
          )}
        </div>
      </section>
    );
  }

  // ---- identity mode: everyone sealed except your glowing card ----
  // how the visitor is addressed in the "A few words, for you, …" heading —
  // first word of the name by default, overridable per person (e.g. someone
  // whose first word isn't the name they go by)
  const mentionName = identity.mentionName || identity.name.split(" ")[0];

  return (
    <section id="people" aria-label="A note for you" className={sectionClass}>
      <div aria-hidden="true" className="wall-glow" />
      <motion.p {...heading} className="section-label mb-8">
        02 / A note for you
      </motion.p>

      <motion.h2
        {...heading}
        transition={{ ...heading.transition, delay: 0.15 }}
        className="section-title mb-4 text-[#f5f5f5]"
      >
        A few words,
        <br />
        for you, {mentionName}.
      </motion.h2>

      <motion.p
        {...heading}
        transition={{ ...heading.transition, delay: 0.3 }}
        className="mb-16 max-w-md text-sm leading-relaxed text-[rgba(255,255,255,0.5)] sm:mb-24"
      >
        Everyone is on this wall — but only your card will open. The rest
        stay sealed; their words are theirs alone. Open yours whenever
        you're ready.
      </motion.p>

      <div className="swirl-stage grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {colleagues.map((person, i) =>
          tile(
            person,
            i,
            <PersonCard
              person={person}
              featured={person.id === identity.id}
              sealed={person.id !== identity.id}
              onSelect={() => onSelect(identity)}
            />
          )
        )}
      </div>
    </section>
  );
}

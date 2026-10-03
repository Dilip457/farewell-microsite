import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import PersonCard from "./PersonCard";
import CardSwirl from "./CardSwirl";
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
 * PeopleSection — three modes:
 *  - pick (no identity yet): the carousel IS the gate — every card sweeps
 *    past with "This is me"; clicking yours reveals your note
 *  - identity: the personalized reveal — every card is sealed except the
 *    visitor's own, which glows and opens their note
 *  - `preview` (author appends #preview to the URL): every card, all open —
 *    so the author can review all notes
 *
 * The wall itself is CardSwirl: a scroll-driven 3D carousel.
 */
export default function PeopleSection({ identity, preview = false, onSelect, onPick }) {
  const reduced = useReducedMotion();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return colleagues;
    return colleagues.filter((c) => c.name.toLowerCase().includes(q));
  }, [query]);

  // a unique match sweeps the carousel to that card
  const jumpTo = useMemo(() => {
    if (filtered.length !== 1) return null;
    return colleagues.findIndex((c) => c.id === filtered[0].id);
  }, [filtered]);

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

        <CardSwirl
          people={colleagues}
          reduced={reduced}
          renderCard={(person) => (
            <PersonCard person={person} onSelect={() => onSelect(person)} />
          )}
        />
      </section>
    );
  }

  // ---- pick mode: the carousel is the gate ----
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
          className="mb-10 max-w-md"
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
          {filtered.length === 0 && (
            <p className="mt-4 text-sm text-[rgba(255,255,255,0.45)]">
              No name matches “{query}”. Try another spelling.
            </p>
          )}
        </motion.div>

        <CardSwirl
          people={colleagues}
          reduced={reduced}
          jumpTo={jumpTo}
          renderCard={(person) => (
            <PersonCard
              person={person}
              actionLabel="This is me"
              onSelect={() => onPick(person)}
            />
          )}
        />
      </section>
    );
  }

  // ---- identity mode: everyone sealed except your glowing card ----
  // how the visitor is addressed in the "A few words, for you, …" heading —
  // first word of the name by default, overridable per person (e.g. someone
  // whose first word isn't the name they go by)
  const mentionName = identity.mentionName || identity.name.split(" ")[0];
  const ownIndex = colleagues.findIndex((c) => c.id === identity.id);

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

      <CardSwirl
        people={colleagues}
        reduced={reduced}
        startIndex={ownIndex}
        renderCard={(person) => (
          <PersonCard
            person={person}
            featured={person.id === identity.id}
            sealed={person.id !== identity.id}
            onSelect={() => onSelect(identity)}
          />
        )}
      />
    </section>
  );
}

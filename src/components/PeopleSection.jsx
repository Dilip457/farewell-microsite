import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return colleagues;
    return colleagues.filter((c) => c.name.toLowerCase().includes(q));
  }, [query]);

  const matchIds = useMemo(
    () => new Set(filtered.map((c) => c.id)),
    [filtered]
  );

  const tile = (person, i, card) => (
    <motion.div
      key={person.id}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 70, filter: "blur(6px)", scale: 0.985 }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 1.1,
        // staggered rows, gentle column offset, capped so late rows feel quick
        delay: Math.min((i % 3) * 0.08 + Math.floor(i / 3) * 0.05, 0.45),
        ease: EASE,
      }}
      style={{
        // deterministic, position-based resting tilt — each card sits at its
        // own slightly different angle, like objects on a table (not random)
        rotate: !reduced ? (i % 3 - 1) * 0.35 : 0,
      }}
    >
      {card}
    </motion.div>
  );

  if (preview) {
    return (
      <section id="people" aria-label="All notes — author preview" className={sectionClass}>
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

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
          className="mb-10 max-w-md text-sm leading-relaxed text-[rgba(255,255,255,0.55)]"
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
          <div className="group relative rounded-2xl transition-all duration-500 focus-within:-translate-y-0.5 focus-within:border-[rgba(125,184,255,0.5)] focus-within:shadow-[0_0_44px_-8px_rgba(100,150,255,0.45)] border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.03)] focus-within:bg-[rgba(255,255,255,0.045)]">
            <svg
              aria-hidden="true"
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.35)] transition-colors duration-300 group-focus-within:text-[rgba(138,196,255,0.9)]"
            >
              <circle cx="6.5" cy="6.5" r="4.6" stroke="currentColor" strokeWidth="1.3" />
              <path d="M10 10l3.2 3.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            <input
              id="pick-search"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  const first = document.querySelector(".glass-card:not(.card-dimmed)");
                  if (first) {
                    e.preventDefault();
                    first.focus();
                  }
                } else if (e.key === "Enter" && filtered.length === 1) {
                  onPick(filtered[0]);
                }
              }}
              placeholder="Type your name to find your card…"
              autoComplete="off"
              aria-label="Search your name"
              className="w-full rounded-2xl bg-transparent px-12 py-3.5 text-[15px] text-[#f5f5f5] outline-none placeholder:text-[rgba(255,255,255,0.3)]"
            />
            <span
              aria-live="polite"
              className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.28em] text-[rgba(255,255,255,0.35)]"
            >
              {query.trim()
                ? `${filtered.length} of ${colleagues.length}`
                : `${colleagues.length} notes`}
            </span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {colleagues.map((person, i) =>
            tile(
              person,
              i,
              <PersonCard
                person={person}
                actionLabel="This is me"
                dimmed={!matchIds.has(person.id)}
                query={query}
                onSelect={() => onPick(person)}
              />
            )
          )}
          {filtered.length === 0 && (
            <p className="col-span-full py-6 text-center text-sm text-[rgba(255,255,255,0.4)]">
              No note found yet — try another name.
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

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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

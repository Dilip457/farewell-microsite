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
// identity view: no bottom padding — the reply box follows the card closely
const sectionClassTight = sectionClass.replace("pb-40", "pb-0");

/**
 * PeopleSection — two modes:
 *  - default: the personalized reveal — after the identity gate, each
 *    visitor sees only THEIR card
 *  - `preview` (author appends #preview to the URL): the full grid of
 *    every colleague card, so the author can review all notes
 */
export default function PeopleSection({ identity, preview = false, onSelect }) {
  const reduced = useReducedMotion();

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
          {colleagues.map((person, i) => (
            <motion.div
              key={person.id}
              initial={
                reduced ? { opacity: 0 } : { opacity: 0, y: 70, filter: "blur(6px)" }
              }
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 1.1,
                delay: (i % 3) * 0.12,
                ease: EASE,
              }}
            >
              <PersonCard person={person} onSelect={() => onSelect(person)} />
            </motion.div>
          ))}
        </div>
      </section>
    );
  }

  const firstName = identity.name.split(" ")[0];

  return (
    <section id="people" aria-label="A note for you" className={sectionClassTight}>
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
        for you, {firstName}.
      </motion.h2>

      <motion.p
        {...heading}
        transition={{ ...heading.transition, delay: 0.3 }}
        className="mb-16 max-w-md text-sm leading-relaxed text-[rgba(255,255,255,0.5)] sm:mb-24"
      >
        Of everything I'm leaving behind, this one is yours alone. Open it
        whenever you're ready.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 70, filter: "blur(6px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 1.2, delay: 0.25, ease: EASE }}
        className="mx-auto w-full max-w-md"
      >
        <PersonCard person={identity} onSelect={() => onSelect(identity)} featured />
      </motion.div>
    </section>
  );
}

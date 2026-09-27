import { motion, useReducedMotion } from "framer-motion";
import PersonCard from "./PersonCard";
import { colleagues } from "../data/colleagues";

const EASE = [0.22, 1, 0.36, 1];

const heading = {
  initial: { opacity: 0, y: 40, filter: "blur(8px)" },
  whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { duration: 1.4, ease: EASE },
};

export default function PeopleSection({ onSelect }) {
  const reduced = useReducedMotion();

  return (
    <section
      id="people"
      aria-label="People I will remember"
      className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-40 pt-32 sm:px-10 sm:pt-44 lg:px-14"
    >
      <motion.p {...heading} className="section-label mb-8">
        02 / People I will remember
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
        Every card below holds a personal note. Open yours.
      </motion.p>

      {/* Responsive grid — 1 column mobile, 2 tablet, 3 desktop */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {colleagues.map((person, i) => (
          <motion.div
            key={person.id}
            initial={
              reduced
                ? { opacity: 0 }
                : { opacity: 0, y: 70, filter: "blur(6px)" }
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

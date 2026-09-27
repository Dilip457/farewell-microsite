import { motion } from "framer-motion";
import PersonCard from "./PersonCard";

const EASE = [0.22, 1, 0.36, 1];

const heading = {
  initial: { opacity: 0, y: 40, filter: "blur(8px)" },
  whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { duration: 1.4, ease: EASE },
};

/**
 * PeopleSection — the personalized reveal.
 * After the identity gate, each visitor sees only THEIR card.
 */
export default function PeopleSection({ identity, onSelect }) {
  const firstName = identity.name.split(" ")[0];

  return (
    <section
      id="people"
      aria-label="A note for you"
      className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-40 pt-32 sm:px-10 sm:pt-44 lg:px-14"
    >
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

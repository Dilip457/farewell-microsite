import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import CinematicBackground from "./components/CinematicBackground";
import HeroSection from "./components/HeroSection";
import PeopleSection from "./components/PeopleSection";
import PersonalNoteModal from "./components/PersonalNoteModal";
import { author } from "./data/colleagues";

const EASE = [0.22, 1, 0.36, 1];

export default function App() {
  const [selected, setSelected] = useState(null);
  const reduced = useReducedMotion();

  // NOTE: the body scroll lock lives ONLY in PersonalNoteModal.
  // A duplicate lock here fought with it (wrong restore order) and
  // left the page frozen after closing a note.

  return (
    <div className="relative min-h-screen">
      {/* background pauses its particle field while a note modal is open */}
      <CinematicBackground paused={Boolean(selected)} />

      <main className="relative z-10">
        <HeroSection />
        <PeopleSection onSelect={setSelected} />
      </main>

      {/* closing */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={reduced ? { duration: 0.6 } : { duration: 1.6, ease: EASE }}
        className="relative z-10 px-6 pb-16 pt-4 text-center sm:pb-20"
      >
        <p className="mx-auto max-w-md text-sm font-light leading-relaxed tracking-wide text-[rgba(255,255,255,0.45)]">
          Thank you for being part of the journey.
        </p>
        <p className="mt-5 text-[10px] font-medium uppercase tracking-[0.42em] text-[rgba(255,255,255,0.28)]">
          With appreciation — {author.name}
        </p>
      </motion.footer>

      <PersonalNoteModal person={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

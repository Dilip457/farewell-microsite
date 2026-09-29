import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import CinematicBackground from "./components/CinematicBackground";
import IdentityGate from "./components/IdentityGate";
import HeroSection from "./components/HeroSection";
import PeopleSection from "./components/PeopleSection";
import PersonalNoteModal from "./components/PersonalNoteModal";
import MessageForAuthor from "./components/MessageForAuthor";
import { author, colleagues } from "./data/colleagues";
import { startSpinningFavicon } from "./lib/spinningFavicon";

const EASE = [0.22, 1, 0.36, 1];

const IDENTITY_KEY = "farewell-identity-id";
const PREVIEW_HASH = "#preview";

/** Restore a returning visitor's chosen identity (localStorage —
 *  survives new tabs and browser restarts, so re-opening the shared link
 *  cannot be used to simply pick a different person). */
function loadIdentity() {
  try {
    const raw = localStorage.getItem(IDENTITY_KEY);
    if (!raw) return null;
    return colleagues.find((c) => String(c.id) === raw) || null;
  } catch {
    return null;
  }
}

export default function App() {
  const [identity, setIdentity] = useState(loadIdentity);
  const [selected, setSelected] = useState(null);
  const [preview, setPreview] = useState(
    () => window.location.hash === PREVIEW_HASH
  );
  const reduced = useReducedMotion();

  // animate the tab icon (the "thinking orb") — see the perf notes there;
  // skips itself for reduced-motion visitors
  useEffect(() => {
    startSpinningFavicon();
  }, []);

  // NOTE: the body scroll lock lives ONLY in PersonalNoteModal.
  // A duplicate lock here fought with it (wrong restore order) and
  // left the page frozen after closing a note.

  // Author preview mode: appending #preview to the URL (known only to
  // the author) skips the identity gate and shows EVERY card.
  useEffect(() => {
    const onHash = () => setPreview(window.location.hash === PREVIEW_HASH);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const identify = (person) => {
    try {
      localStorage.setItem(IDENTITY_KEY, String(person.id));
    } catch {
      /* private mode — gate just re-appears next visit */
    }
    setIdentity(person);
  };

  const resetIdentity = () => {
    try {
      localStorage.removeItem(IDENTITY_KEY);
    } catch {
      /* ignore */
    }
    setSelected(null);
    setIdentity(null);
  };

  const exitPreview = () => {
    if (window.location.hash) window.location.hash = "";
    setPreview(false);
  };

  return (
    <div className="relative min-h-screen">
      {/* background pauses its particle field while a note modal is open */}
      <CinematicBackground paused={Boolean(selected)} />

      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <main className="relative z-10">
              <HeroSection />
              <PeopleSection preview onSelect={setSelected} />
            </main>

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
              <button
                type="button"
                onClick={exitPreview}
                className="mx-auto mt-10 block text-[10px] font-medium uppercase tracking-[0.3em] text-[rgba(255,255,255,0.22)] transition-colors duration-300 hover:text-[rgba(255,255,255,0.5)]"
              >
                Exit author preview
              </button>
            </motion.footer>
          </motion.div>
        ) : identity ? (
          <motion.div
            key="experience"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <main className="relative z-10">
              <HeroSection />
              <PeopleSection identity={identity} onSelect={setSelected} />
            </main>

            {/* quiet box below the cards — replies to the author.
                Hidden until the Google Form is configured (feedback.js). */}
            <MessageForAuthor person={identity} />

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
              {/* Hide-and-seek switch: nearly invisible at rest, gently
                  fades in on hover/focus — findable if you picked the wrong
                  card, invisible to someone just reading their note. */}
              <button
                type="button"
                onClick={resetIdentity}
                title="Switch person"
                aria-label="Switch person — if you picked the wrong card"
                className="mx-auto mt-10 block text-[9px] font-medium uppercase tracking-[0.3em] text-[rgba(255,255,255,0.42)] opacity-[0.07] transition-opacity duration-700 hover:opacity-70 focus-visible:opacity-70 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[rgba(125,184,255,0.4)]"
              >
                Not you? Switch person
              </button>
            </motion.footer>
          </motion.div>
        ) : (
          <motion.div
            key="gate"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <IdentityGate onIdentify={identify} />
          </motion.div>
        )}
      </AnimatePresence>

      <PersonalNoteModal person={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

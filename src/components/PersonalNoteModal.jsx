import { useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { author } from "../data/colleagues";
import MessageForAuthor from "./MessageForAuthor";

const EASE = [0.22, 1, 0.36, 1];

function CloseIcon({ className }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M1 1l10 10M11 1L1 11"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Renders a personal message: paragraph breaks preserved,
 * <bold>…</bold> segments emphasized.
 */
function RichText({ text }) {
  const parts = text.split(/(<bold>[\s\S]*?<\/bold>)/g).filter(Boolean);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("<bold>") ? (
          <strong
            key={i}
            className="font-medium text-[rgba(245,245,245,0.95)]"
          >
            {part.replace(/<\/?bold>/g, "")}
          </strong>
        ) : (
          part
        )
      )}
    </>
  );
}

/**
 * PersonalNoteModal — the emotional centerpiece.
 * Floating glass panel with a deep 3D entrance, cyan accent line,
 * four ways to close (X, Close, Escape, click-outside),
 * background scroll lock and focus management.
 */
export default function PersonalNoteModal({ person, onClose, enableReply = true }) {
  const reduced = useReducedMotion();
  const panelRef = useRef(null);
  const closeBtnRef = useRef(null);

  const open = Boolean(person);

  // scroll lock + Escape + focus management
  useEffect(() => {
    if (!open) return undefined;

    const previousFocus = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const t = setTimeout(() => closeBtnRef.current?.focus(), 120);

    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      clearTimeout(t);
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {person && (
        <motion.div
          key="modal-root"
          className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-person-name"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          onMouseDown={(e) => {
            if (!panelRef.current?.contains(e.target)) onClose();
          }}
        >
          {/* backdrop — darkened page + blur + atmospheric glow */}
          <motion.div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              // multi-stop falloff + a noise overlay on top dithers away
              // gradient banding that a two-stop gradient shows on dark bg
              background:
                "radial-gradient(circle at 50% 40%, rgba(48,68,122,0.32) 0%, " +
                "rgba(30,40,68,0.45) 32%, rgba(12,16,30,0.62) 58%, " +
                "rgba(4,5,10,0.76) 78%)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                opacity: 0.05,
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 220 220' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23n)'/%3E%3C/svg%3E\")",
              }}
            />
          </motion.div>

          {/* panel — floats toward the viewer out of depth */}
          <motion.div
            ref={panelRef}
            className="modal-panel relative mx-auto flex max-h-[92vh] w-[calc(100%-20px)] flex-col overflow-y-auto p-7 sm:w-[calc(100%-32px)] sm:max-w-[850px] sm:p-12 lg:p-16"
            initial={
              reduced
                ? { opacity: 0, scale: 0.96 }
                : { opacity: 0, scale: 0.92, z: -120 }
            }
            animate={reduced ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1, z: 0 }}
            exit={
              reduced
                ? { opacity: 0, scale: 0.97 }
                : { opacity: 0, scale: 0.95, z: -60 }
            }
            transition={{ duration: 0.8, ease: EASE }}
            style={{ transformPerspective: 1400 }}
          >
            {/* header */}
            <div className="mb-10 flex items-center justify-between sm:mb-14">
              <span className="text-[10px] font-medium uppercase tracking-[0.42em] text-[rgba(255,255,255,0.5)] sm:text-[11px]">
                Personal Note
              </span>
              <div className="flex items-center gap-6">
                <span className="hidden text-[10px] font-medium uppercase tracking-[0.3em] text-[rgba(255,255,255,0.35)] sm:inline">
                  {author.label}
                </span>
                <button
                  ref={closeBtnRef}
                  type="button"
                  onClick={onClose}
                  aria-label="Close note"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(255,255,255,0.16)] bg-[rgba(255,255,255,0.04)] text-[rgba(255,255,255,0.6)] transition-all duration-500 hover:border-[rgba(255,255,255,0.4)] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[rgba(125,184,255,0.7)]"
                >
                  <CloseIcon />
                </button>
              </div>
            </div>

            {/* name + accent line */}
            <motion.h2
              id="modal-person-name"
              initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.9, delay: 0.18, ease: EASE }}
              className="text-[clamp(30px,5vw,52px)] font-semibold leading-[1.02] tracking-[-0.045em] text-[#f5f5f5]"
            >
              {person.name}
            </motion.h2>

            <motion.div
              aria-hidden="true"
              className="accent-line mt-6 mb-8 sm:mb-10"
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 1, delay: 0.4, ease: EASE }}
              style={{ transformOrigin: "left" }}
            />

            {/* message */}
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.32, ease: EASE }}
              className="max-w-2xl whitespace-pre-line text-[15px] font-light leading-[1.85] tracking-wide text-[rgba(245,245,245,0.82)] sm:text-[17px]"
            >
              <RichText text={person.message} />
            </motion.p>

            {/* reply box — inside the note itself, so nobody has to scroll
                the page below to find it. Skipped in author preview. */}
            {enableReply && <MessageForAuthor person={person} />}

            {/* footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.55, ease: EASE }}
              className="mt-14 flex flex-col-reverse items-start justify-between gap-6 border-t border-[rgba(255,255,255,0.1)] pt-7 sm:mt-20 sm:flex-row sm:items-center sm:pt-8"
            >
              <span className="text-[10px] font-medium uppercase tracking-[0.42em] text-[rgba(255,255,255,0.4)]">
                With appreciation
              </span>
              <button
                type="button"
                onClick={onClose}
                className="pill-button"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

import { colleagues } from "../data/colleagues";

const EASE = [0.22, 1, 0.36, 1];

/**
 * IdentityGate — the entry experience.
 *
 * Everyone receives the same link. On open, each person picks their own
 * name (optionally confirming with a personal `pin` from the data file),
 * and the site then reveals only THEIR card and note. The choice is
 * remembered in this browser.
 *
 * No credentials are ever sent to anyone — the colleague identifies
 * themselves, and the optional pin is something they already know.
 */
export default function IdentityGate({ onIdentify }) {
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState(null); // person awaiting pin confirmation
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const searchRef = useRef(null);
  const pinRef = useRef(null);

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  useEffect(() => {
    if (pending) {
      setPin("");
      setError(false);
      const t = setTimeout(() => pinRef.current?.focus(), 350);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [pending]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return colleagues;
    return colleagues.filter((c) => c.name.toLowerCase().includes(q));
  }, [query]);

  const choose = (person) => {
    if (person.pin) setPending(person);
    else onIdentify(person);
  };

  const submitPin = (e) => {
    e.preventDefault();
    if (!pending) return;
    if (pin.trim() === String(pending.pin)) onIdentify(pending);
    else setError(true);
  };

  const chipClass =
    "rounded-xl border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.03)] px-3 py-3 text-[13px] font-medium tracking-wide text-[rgba(255,255,255,0.75)] transition-all duration-300 " +
    "hover:border-[rgba(125,184,255,0.45)] hover:bg-[rgba(125,184,255,0.06)] hover:text-white " +
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-[rgba(125,184,255,0.6)]";

  return (
    <div
      className="fixed inset-0 z-40 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Choose your name"
    >
      {/* subtle veil for readability over the atmosphere */}
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-[rgba(3,3,7,0.45)]"
      />

      <div className="relative flex min-h-full items-center justify-center p-4 sm:p-8">
        <motion.div
          initial={{ opacity: 0, y: 30, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1, ease: EASE }}
          className="modal-panel w-full max-w-lg p-7 sm:p-10"
        >
          {!pending ? (
            <>
              <p className="section-label mb-6">A personal farewell</p>

              <h1 className="text-[clamp(34px,6vw,52px)] font-semibold leading-[0.98] tracking-[-0.05em] text-[#f5f5f5]">
                Which one
                <br />
                are you?
              </h1>

              <p className="mb-7 mt-5 text-sm leading-relaxed text-[rgba(255,255,255,0.5)]">
               Every interaction here has meant a lot to me. Please type or select your name to 
                find a personal note of appreciation written for you.
              </p>

              <label htmlFor="gate-search" className="sr-only">
                Search your name
              </label>
              <input
                id="gate-search"
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type your name…"
                autoComplete="off"
                className="w-full rounded-2xl border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.03)] px-5 py-3.5 text-[15px] text-[#f5f5f5] outline-none transition-colors duration-300 placeholder:text-[rgba(255,255,255,0.3)] focus:border-[rgba(125,184,255,0.5)]"
              />

              <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {filtered.map((c) => (
                  <button key={c.id} type="button" className={chipClass} onClick={() => choose(c)}>
                    {c.name}
                  </button>
                ))}
                {filtered.length === 0 && (
                  <p className="col-span-full py-6 text-center text-sm text-[rgba(255,255,255,0.4)]">
                    No name matches “{query}”.
                  </p>
                )}
              </div>
            </>
          ) : (
            <form onSubmit={submitPin}>
              <p className="section-label mb-6">One quick check</p>

              <h1 className="text-[clamp(34px,6vw,52px)] font-semibold leading-[0.98] tracking-[-0.05em] text-[#f5f5f5]">
                Just to
                <br />
                be sure.
              </h1>

              <p className="mb-7 mt-5 text-sm leading-relaxed text-[rgba(255,255,255,0.5)]">
                {pending.pinHint || "Enter your personal code to continue."}
              </p>

              <label htmlFor="gate-pin" className="sr-only">
                Your personal code
              </label>
              <input
                id="gate-pin"
                ref={pinRef}
                type="text"
                inputMode="numeric"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError(false);
                }}
                placeholder="••••"
                autoComplete="off"
                className="w-full rounded-2xl border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.03)] px-5 py-3.5 text-[15px] tracking-[0.3em] text-[#f5f5f5] outline-none transition-colors duration-300 placeholder:text-[rgba(255,255,255,0.25)] focus:border-[rgba(125,184,255,0.5)]"
              />

              {error && (
                <p className="mt-3 text-[13px] text-[rgba(255,160,160,0.85)]">
                  That doesn't match — try again.
                </p>
              )}

              <div className="mt-8 flex flex-col-reverse items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => setPending(null)}
                  className="text-[11px] font-medium uppercase tracking-[0.28em] text-[rgba(255,255,255,0.4)] transition-colors duration-300 hover:text-[rgba(255,255,255,0.75)]"
                >
                  ← Choose another name
                </button>
                <button type="submit" className="pill-button">
                  Continue
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}

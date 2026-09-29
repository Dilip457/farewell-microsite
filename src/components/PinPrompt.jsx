import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

/**
 * PinPrompt — shown only when a pin-protected card is picked on the wall.
 * The pin is something the colleague already knows (set in colleagues.js);
 * nothing is ever sent anywhere — it just gates the reveal locally.
 * Renders nothing when no person is pending.
 */
export default function PinPrompt({ person, onSuccess, onCancel }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const pinRef = useRef(null);

  useEffect(() => {
    if (!person) return undefined;
    setPin("");
    setError(false);
    const t = setTimeout(() => pinRef.current?.focus(), 350);
    return () => clearTimeout(t);
  }, [person]);

  if (!person) return null;

  const submit = (e) => {
    e.preventDefault();
    if (pin.trim() === String(person.pin)) onSuccess();
    else setError(true);
  };

  return (
    <div
      className="fixed inset-0 z-40 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Confirm it's you"
    >
      {/* subtle veil for readability over the atmosphere */}
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-[rgba(3,3,7,0.6)]"
        onClick={onCancel}
      />

      <div className="relative flex min-h-full items-center justify-center p-4 sm:p-8">
        <motion.div
          initial={{ opacity: 0, y: 30, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1, ease: EASE }}
          className="modal-panel w-full max-w-md p-7 sm:p-10"
        >
          <form onSubmit={submit}>
            <p className="section-label mb-6">One quick check</p>

            <h1 className="text-[clamp(34px,6vw,52px)] font-semibold leading-[0.98] tracking-[-0.05em] text-[#f5f5f5]">
              Just to
              <br />
              be sure.
            </h1>

            <p className="mb-7 mt-5 text-sm leading-relaxed text-[rgba(255,255,255,0.5)]">
              {person.pinHint || "Enter your personal code to continue."}
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
                onClick={onCancel}
                className="text-[11px] font-medium uppercase tracking-[0.28em] text-[rgba(255,255,255,0.4)] transition-colors duration-300 hover:text-[rgba(255,255,255,0.75)]"
              >
                ← Back to the wall
              </button>
              <button type="submit" className="pill-button">
                Continue
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

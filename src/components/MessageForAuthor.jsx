import { useState } from "react";
import { motion } from "framer-motion";

import { author } from "../data/colleagues";
import { feedback } from "../data/feedback";

const EASE = [0.22, 1, 0.36, 1];

/**
 * MessageForAuthor — the reply box, embedded at the end of the personal
 * note modal so it is seen the moment the note is read (people rarely
 * scroll past their card on the wall below).
 *
 * Submits to the Google Form configured in src/data/feedback.js. The
 * reader's name (already known from the card they picked) is attached
 * automatically, so replies arrive pre-attributed in the author's
 * responses sheet. Renders nothing until the form is configured.
 */
export default function MessageForAuthor({ person }) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [failed, setFailed] = useState(false);

  const configured = Boolean(feedback && feedback.formAction && feedback.messageEntry);
  if (!configured || !person) return null;

  const send = async () => {
    if (!text.trim() || sending || sent) return;
    setSending(true);
    setFailed(false);
    try {
      const body = new URLSearchParams();
      if (feedback.nameEntry) body.set(feedback.nameEntry, person.name);
      if (feedback.nameEntryAlt) body.set(feedback.nameEntryAlt, person.name);
      body.set(feedback.messageEntry, text.trim());
      if (feedback.messageEntryAlt) body.set(feedback.messageEntryAlt, text.trim());
      // hidden fields a real browser submit includes — without them some
      // forms record the response but drop the answers
      body.set("fvv", "1");
      body.set("pageHistory", "0");
      body.set("submissionTimestamp", "-1");
      // no-cors: the response is opaque, but Google records the entry
      await fetch(feedback.formAction, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });
      setSent(true);
    } catch {
      setFailed(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.1, delay: 0.6, ease: EASE }}
      className="relative z-10 mt-12 w-full"
      aria-label="Leave a message for the author"
    >
      <div className="relative border-t border-[rgba(160,190,240,0.16)] pt-7">
        <span className="hud-meta mb-5 block">Plot twist</span>

        <h3 className="text-[clamp(22px,3.4vw,30px)] font-semibold leading-[1.05] tracking-[-0.04em] text-[#f5f5f5]">
          The floor
          <br />
          is yours.
        </h3>

        {sent ? (
          <div className="mt-6 rounded-2xl border border-[rgba(125,184,255,0.25)] bg-[rgba(125,184,255,0.06)] px-6 py-8 text-center">
            <p className="text-lg font-medium text-[#f5f5f5]">Sent. Thank you.</p>
            <p className="mt-2 text-sm leading-relaxed text-[rgba(255,255,255,0.5)]">
              Your words will reach {author.name}. Take care — and all the very best.
            </p>
          </div>
        ) : (
          <>
            <p className="mb-6 mt-5 text-sm leading-relaxed text-[rgba(255,255,255,0.5)]">
              If anything here meant something to you, {author.name} would love to hear a few words back.
            </p>

            <label htmlFor="reply-message" className="sr-only">
              Your message
            </label>
            <textarea
              id="reply-message"
              rows={3}
              value={text}
              maxLength={2000}
              onChange={(e) => setText(e.target.value)}
              placeholder="A memory, a wish, anything you'd like to say…"
              className="w-full resize-y border-0 border-b border-[rgba(160,190,240,0.24)] bg-transparent py-4 text-[15px] leading-relaxed text-[#f5f5f5] outline-none transition-colors duration-500 placeholder:text-[rgba(255,255,255,0.3)] focus:border-[rgba(138,196,255,0.7)]"
            />

            <div className="mt-5 flex flex-col-reverse items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
              <span className="metric">
                {text.length}/2000
              </span>
              <button
                type="button"
                className="pill-button disabled:cursor-not-allowed disabled:opacity-40"
                onClick={send}
                disabled={!text.trim() || sending}
              >
                {sending ? "Sending…" : "Send"}
              </button>
            </div>

            {failed && (
              <p className="mt-3 text-[13px] text-[rgba(255,160,160,0.85)]">
                Something didn't go through — please try again.
              </p>
            )}
          </>
        )}
      </div>
    </motion.section>
  );
}

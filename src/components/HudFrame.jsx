/**
 * HudFrame — the "technical interface" layer that sits over the whole site:
 * hairline corner brackets, tiny monospaced metadata in the corners and a
 * tick rail down the right edge. Purely decorative, never interactive, and
 * hidden on small screens where it would only be clutter.
 */
export default function HudFrame() {
  return (
    <div aria-hidden="true" className="hud pointer-events-none fixed inset-0 z-40 hidden sm:block">
      {/* corner brackets */}
      <span className="absolute left-5 top-5 h-4 w-4 border-l border-t border-[rgba(170,200,255,0.22)]" />
      <span className="absolute right-5 top-5 h-4 w-4 border-r border-t border-[rgba(170,200,255,0.22)]" />
      <span className="absolute bottom-5 left-5 h-4 w-4 border-b border-l border-[rgba(170,200,255,0.22)]" />
      <span className="absolute bottom-5 right-5 h-4 w-4 border-b border-r border-[rgba(170,200,255,0.22)]" />

      {/* corner metadata */}
      <span className="hud-meta absolute left-11 top-[26px]">
        QUALCOMM <span className="text-[rgba(190,210,240,0.24)]">/</span> SPARQ
      </span>
      <span className="hud-meta absolute right-11 top-[26px]">
        SIGN-OFF <span className="text-[rgba(190,210,240,0.24)]">·</span> 05.10.26
      </span>
      <span className="hud-meta absolute bottom-[26px] left-11 flex items-center">
        <i className="hud-dot" />
        DILIP SANJAY
      </span>
      <span className="hud-meta absolute bottom-[26px] right-11">
        ONE LAST PING
      </span>

      {/* tick rail down the right edge */}
      <div className="absolute right-[19px] top-1/2 flex -translate-y-1/2 flex-col items-end gap-[7px]">
        {Array.from({ length: 9 }).map((_, i) => (
          <span
            key={i}
            className="block h-px bg-[rgba(170,200,255,0.2)]"
            style={{ width: i === 4 ? 12 : i % 2 === 0 ? 8 : 5 }}
          />
        ))}
      </div>
    </div>
  );
}

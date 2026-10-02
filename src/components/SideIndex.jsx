import { useEffect, useState } from "react";

/**
 * SideIndex — a hairline vertical index down the left edge (desktop only),
 * the kind of navigational chrome the reference sites use instead of a
 * top nav bar. It tracks which scene the visitor is in and marks the
 * active one with a lit status dot and an arrow.
 */
export default function SideIndex() {
  const [stage, setStage] = useState(1);

  useEffect(() => {
    let raf = 0;
    let scheduled = false;

    const update = () => {
      scheduled = false;
      const people = document.getElementById("people");
      if (!people) return setStage(1);
      const top = people.getBoundingClientRect().top;
      setStage(top < window.innerHeight * 0.55 ? 2 : 1);
    };

    const onScroll = () => {
      if (scheduled) return;
      scheduled = true;
      raf = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const items = [
    { n: "01", label: "Signing Off", href: "#top" },
    { n: "02", label: "The Wall", href: "#people" },
  ];

  return (
    <nav aria-label="Sections" className="side-index">
      {items.map((it, i) => (
        <a
          key={it.n}
          href={it.href}
          className="side-index-item"
          data-active={stage === i + 1}
          aria-current={stage === i + 1 ? "true" : undefined}
        >
          <span className="side-index-dot" aria-hidden="true" />
          <span>{it.n}</span>
          <span className="side-index-arrow" aria-hidden="true">→</span>
          <span>{it.label}</span>
        </a>
      ))}
    </nav>
  );
}

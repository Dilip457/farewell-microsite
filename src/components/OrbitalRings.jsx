/**
 * OrbitalRings — the site's signature 3D object.
 *
 * Three thin rings, each tilted on its own axis and rotating at its own
 * speed, with a small lit node riding the rim of each one and a soft
 * glowing core at the centre. Pure CSS 3D transforms (no WebGL), so it
 * costs almost nothing and stays smooth on office laptops; it freezes
 * for reduced-motion visitors.
 */
export default function OrbitalRings({ className = "" }) {
  return (
    <div className={`ring-object ${className}`} aria-hidden="true">
      <div className="ring ring-a" />
      <div className="ring ring-b" />
      <div className="ring ring-c" />
      <div className="ring-core" />
    </div>
  );
}

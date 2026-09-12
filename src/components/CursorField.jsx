import { useEffect, useRef } from "react";

// Map of data-wash values to complementary glow colors
const THEME_COLORS = {
  "#e6dcc8": { glow: "rgba(255, 90, 54, 0.22)", orb: "rgba(200, 245, 66, 0.45)" },
  "#1a1814": { glow: "rgba(200, 245, 66, 0.18)", orb: "rgba(255, 90, 54, 0.35)" },
  "#0f0f0f": { glow: "rgba(124, 58, 237, 0.22)", orb: "rgba(232, 185, 35, 0.4)" },
  "#f5f0e6": { glow: "rgba(61, 90, 254, 0.2)", orb: "rgba(15, 155, 142, 0.4)" },
  "#fff8f0": { glow: "rgba(232, 185, 35, 0.2)", orb: "rgba(255, 90, 54, 0.35)" },
  "#f0ebe0": { glow: "rgba(124, 58, 237, 0.18)", orb: "rgba(6, 214, 160, 0.4)" },
  "#2a2520": { glow: "rgba(255, 183, 3, 0.2)", orb: "rgba(76, 201, 240, 0.35)" },
  "#1e1b18": { glow: "rgba(255, 77, 109, 0.2)", orb: "rgba(67, 97, 238, 0.35)" },
  "#1a1410": { glow: "rgba(232, 200, 138, 0.2)", orb: "rgba(200, 245, 66, 0.3)" },
};

// Default fallback colors
const DEFAULT_GLOW = "rgba(255, 90, 54, 0.22)";
const DEFAULT_ORB = "rgba(200, 245, 66, 0.45)";

function getColorsForWash(wash) {
  return THEME_COLORS[wash] || { glow: DEFAULT_GLOW, orb: DEFAULT_ORB };
}

export default function CursorField() {
  const glow = useRef(null);
  const orb = useRef(null);
  const grid = useRef(null);
  const glowColor = useRef(DEFAULT_GLOW);
  const orbColor = useRef(DEFAULT_ORB);

  useEffect(() => {
    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const glowPos = { x: pos.x, y: pos.y };
    const orbPos = { x: pos.x, y: pos.y };
    let raf;

    // Observe theme changes via data-wash attribute on sections
    const observer = new MutationObserver(() => {
      const paper = getComputedStyle(document.documentElement)
        .getPropertyValue("--paper")
        .trim();
      const colors = getColorsForWash(paper);
      glowColor.current = colors.glow;
      orbColor.current = colors.orb;
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style"],
    });

    const move = (event) => {
      pos.x = event.clientX;
      pos.y = event.clientY;
      document.documentElement.style.setProperty("--mx", `${event.clientX}px`);
      document.documentElement.style.setProperty("--my", `${event.clientY}px`);
    };

    const tick = () => {
      glowPos.x += (pos.x - glowPos.x) * 0.04;
      glowPos.y += (pos.y - glowPos.y) * 0.04;
      orbPos.x += (pos.x - orbPos.x) * 0.08;
      orbPos.y += (pos.y - orbPos.y) * 0.08;

      if (glow.current) {
        glow.current.style.transform = `translate3d(${glowPos.x}px, ${glowPos.y}px, 0)`;
        glow.current.style.background = `radial-gradient(circle, ${glowColor.current}, transparent 68%)`;
      }
      if (orb.current) {
        orb.current.style.transform = `translate3d(${orbPos.x}px, ${orbPos.y}px, 0)`;
        orb.current.style.background = `radial-gradient(circle, ${orbColor.current}, transparent 70%)`;
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", move);
    raf = requestAnimationFrame(tick);

    // Initial color set
    const paper = getComputedStyle(document.documentElement)
      .getPropertyValue("--paper")
      .trim();
    const colors = getColorsForWash(paper);
    glowColor.current = colors.glow;
    orbColor.current = colors.orb;

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="cursor-field" aria-hidden>
      <div ref={glow} className="cursor-glow" />
      <div ref={orb} className="cursor-orb" />
      <div ref={grid} className="cursor-grid" />
    </div>
  );
}
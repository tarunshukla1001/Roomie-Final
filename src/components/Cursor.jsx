import { useEffect, useRef } from "react";

export default function Cursor() {
  const dot = useRef(null);
  const ring = useRef(null);

  useEffect(() => {
    const pos = { x: 0, y: 0 };
    const ringPos = { x: 0, y: 0 };
    let raf;

    const move = (event) => {
      pos.x = event.clientX;
      pos.y = event.clientY;
    };

    const tick = () => {
      ringPos.x += (pos.x - ringPos.x) * 0.16;
      ringPos.y += (pos.y - ringPos.y) * 0.16;
      if (dot.current) dot.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      if (ring.current) ring.current.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;
      raf = requestAnimationFrame(tick);
    };

    const hoverOn = (event) => {
      if (event.target.closest("a, button, [data-cursor]")) {
        ring.current?.classList.add("is-hover");
      }
    };
    const hoverOff = () => ring.current?.classList.remove("is-hover");

    window.addEventListener("pointermove", move);
    document.addEventListener("pointerover", hoverOn);
    document.addEventListener("pointerout", hoverOff);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerover", hoverOn);
      document.removeEventListener("pointerout", hoverOff);
    };
  }, []);

  return (
    <>
      <div ref={dot} className="cursor-dot" />
      <div ref={ring} className="cursor-ring" />
    </>
  );
}

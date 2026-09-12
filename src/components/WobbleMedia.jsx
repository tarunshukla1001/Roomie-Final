import { useRef } from "react";

export default function WobbleMedia({ src, alt, className = "" }) {
  const ref = useRef(null);

  function onMove(event) {
    const el = ref.current;
    if (!el) return;
    const box = el.getBoundingClientRect();
    const px = (event.clientX - box.left) / box.width - 0.5;
    const py = (event.clientY - box.top) / box.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${py * -8}deg) rotateY(${px * 10}deg) scale(1.03)`;
  }

  function onLeave() {
    if (ref.current) ref.current.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)";
  }

  return (
    <div className={`wobble-frame ${className}`} onMouseMove={onMove} onMouseLeave={onLeave}>
      <img ref={ref} src={src} alt={alt} className="wobble-img" />
    </div>
  );
}

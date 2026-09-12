import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function StatCard({
  label,
  value,
  suffix = "",
  index = 0,
}) {
  const cardRef = useRef(null);
  const numberRef = useRef(null);

  useEffect(() => {
    const card = cardRef.current;
    const number = numberRef.current;

    if (!card || !number) return;

    gsap.fromTo(
      card,
      {
        opacity: 0,
        y: 40,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay: index * 0.1,
        ease: "power3.out",
      }
    );

    const target = Number(value) || 0;

    gsap.fromTo(
      number,
      {
        innerText: 0,
      },
      {
        innerText: target,
        duration: 1.5,
        delay: index * 0.1 + 0.2,
        ease: "power2.out",
        snap: {
          innerText: 1,
        },
        onUpdate: () => {
          number.innerText =
            Math.floor(Number(number.innerText)).toLocaleString();
        },
      }
    );
  }, [value, index]);

  return (
    <div
      ref={cardRef}
      className="admin-stat-card"
    >
      <div className="admin-stat-top">
        <span>{label}</span>

        <span className="admin-stat-dot">
          ●
        </span>
      </div>

      <div className="admin-stat-value">
        <span ref={numberRef}>0</span>
        {suffix}
      </div>

      <div className="admin-stat-line" />
    </div>
  );
}
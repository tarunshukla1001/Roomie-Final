import { useLayoutEffect, useRef } from "react";
import { gsap } from "../animations/gsap";

const SHOTS = [
  { src: "https://images.unsplash.com/photo-1615874959471-b9750d4c2d0e?auto=format&fit=crop&w=900&q=80", caption: "Twin stay" },
  { src: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=80", caption: "Private loft" },
  { src: "https://plus.unsplash.com/premium_photo-1680382578857-c331ead9ed51?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", caption: "Kitchen nook" },
  { src: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80", caption: "Shared commons" },
  { src: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=80", caption: "Study corner" },
  { src: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=900&q=80", caption: "Quiet desk" },
  { src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80", caption: "Daylight hall" },
  { src: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80", caption: "City studio" },
  { src: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=80", caption: "Courtyard light" },
  { src: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=900&q=80", caption: "Sunrise block" },
  { src: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=900&q=80", caption: "Modern room" },
  { src: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=900&q=80", caption: "Loft stay" },
  { src: "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&w=900&q=80", caption: "PG block" },
  { src: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=80", caption: "Study wall" },
];

export default function ImageRibbon() {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(".ribbon-track", {
        xPercent: -42,
        ease: "none",
        scrollTrigger: {
          trigger: ref.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.6,
        },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="overflow-hidden py-20 bg-[#f5f0e6]" data-wash="#f5f0e6">
      <p className="mb-8 px-6 text-[11px] uppercase tracking-[0.22em] text-[#5b5b5b]">Rooms in motion</p>
      <div className="ribbon-track flex w-[220%] gap-4 px-6">
        {SHOTS.map((shot) => (
          <figure key={shot.caption} className="w-[280px] shrink-0 md:w-[320px]">
            <div className="wobble-frame">
              <img src={shot.src} alt={shot.caption} className="wobble-img aspect-[4/5] object-cover" />
            </div>
            <figcaption className="mt-3 text-[11px] uppercase tracking-[0.16em] text-[#5b5b5b]">
              {shot.caption}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

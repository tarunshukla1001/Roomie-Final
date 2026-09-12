import { useLayoutEffect, useRef } from "react";
import { gsap } from "../animations/gsap"; 

const CARDS = [
  {
    kicker: "01 — Rent",
    title: "Unhidden monthly",
    front: "Shared from ₹4,999",
    spec: "The card price is checkout. No broker add-on, no festival surge.",
    points: ["₹4,999 shared", "₹6,999 private", "₹9,999 studio"],
    wash: "linear-gradient(150deg, #1a1814, #2d2a24)",
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=600&q=80",
  },
  {
    kicker: "02 — Stay",
    title: "A real room",
    front: "Bed, lock, light",
    spec: "Verified photos of the actual bed you hold — not a lobby brochure.",
    points: ["Attached options", "Study desk", "Power backup"],
    wash: "linear-gradient(150deg, #2d2a24, #3d3830)",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80",
  },
  {
    kicker: "03 — Living",
    title: "Meals & WiFi",
    front: "Included, not extra",
    spec: "Housekeeping, high-speed WiFi, and meals baked into the month.",
    points: ["2–3 meals / day", "Fast WiFi", "Laundry slots"],
    wash: "linear-gradient(150deg, #3d3830, #1a1814)",
    image: "https://images.unsplash.com/photo-1554995207-c55b41f1fa0b?auto=format&fit=crop&w=600&q=80",
  },
  {
    kicker: "04 — Trust",
    title: "Beds left, live",
    front: "Hold in minutes",
    spec: "See vacancy, gender policy, and area before you pay a token.",
    points: ["Live vacancy", "Women / co-live", "Metro-near filters"],
    wash: "linear-gradient(150deg, #2d2a24, #1a1814)",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80",
  },
];

export default function ProductDeck() {
  const ref = useRef(null);
  const pathWrapperRef = useRef(null);
  const pathRef = useRef(null);
  const bgOverlayRef = useRef(null); // Reference for the background image layer

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray(".deck-card");
      const n = cards.length;

      // 1. Setup the SVG Line
      const path = pathRef.current;
      const pathLength = path.getTotalLength();
      
      gsap.set(path, {
        strokeDasharray: pathLength,
        strokeDashoffset: pathLength,
      });

      gsap.set(pathWrapperRef.current, {
        xPercent: -50,
        yPercent: -50,
        z: -200, 
        rotateX: 0,
      });

      // 2. Initialize background image layer to 50% opacity
      gsap.set(bgOverlayRef.current, {
        opacity: 0.5,
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ref.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.7,
        },
      });

      // 3. Animate background opacity from 0.5 down to 0 over the first part of the scroll
      tl.to(bgOverlayRef.current, {
        opacity: 0,
        duration: 0.8, // Fades out as the cards open up
        ease: "none",
      }, 0);

      // SVG Line Animation
      tl.to(path, { strokeDashoffset: 0, duration: 1.5, ease: "none" }, 0);
      tl.to(pathWrapperRef.current, { z: 95, rotateX: 25, rotateY: -8, duration: 1, ease: "none" }, 0);

      // Cards Animation
      cards.forEach((card, i) => {
        const fromCenter = i - (n - 1) / 2;
        gsap.set(card, {
          x: fromCenter * 10,
          y: i * 8,
          z: -i * 28,
          rotateY: 0,
          rotateZ: fromCenter * 1.4,
          rotateX: 4,
        });
        tl.to(
          card,
          {
            x: fromCenter * 240,
            y: Math.abs(fromCenter) * 18,
            z: 80 + i * 12,
            rotateY: 180,
            rotateZ: fromCenter * 8,
            rotateX: 0,
            ease: "none",
            duration: 1,
          },
          i * 0.2
        );
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="relative h-[280vh] bg-[#0f0f0f]" data-wash="#0f0f0f">
      <div className="sticky top-0 h-svh overflow-hidden" style={{ perspective: 1200 }}>
        
        {/* DYNAMIC BACKGROUND IMAGE OVERLAY */}
        <div 
          ref={bgOverlayRef}
          className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
        >
          <img 
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80" 
            alt="" 
            className="w-full h-full object-cover"
          />
          {/* Dark gradient overlay to keep it subtle */}
          <div className="absolute inset-0 bg-black/60" />
        </div>

        <p className="kicker pointer-events-none absolute left-1/2 top-[11%] z-20 -translate-x-1/2 text-[#c8f542]">
          {/* Specs, dealt from the deck */}
        </p>
        
        <div className="deck-stage absolute left-1/2 top-1/2 h-0 w-0 z-10" style={{ transformStyle: "preserve-3d" }}>
          
          {/* The 3D SVG Line Wrapper */}
          <div 
            ref={pathWrapperRef}
            className="absolute top-0 left-0 pointer-events-none flex items-center justify-center"
            style={{ transformStyle: "preserve-3d" }}
          >
            <svg 
              className="overflow-visible"
              width="1400" 
              height="800" 
              viewBox="-700 -400 1400 800"
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                ref={pathRef}
                d="M-700,0 C-400,-500 -200,450 0,0 C200,-450 400,500 700,0"
                stroke="#0044FF" 
                strokeWidth="24"
                strokeLinecap="round"
                style={{ filter: "drop-shadow(0px 10px 20px rgba(0, 68, 255, 0.4))" }}
              />
            </svg>
          </div>

          {/* Cards */}
          {CARDS.map((card, index) => (
            <article key={card.title} className="deck-card">
              <div className="deck-face deck-front relative overflow-hidden" style={{ backgroundImage: `url(${card.image})`, backgroundSize: "cover", backgroundPosition: "center" }}>
                <div className="absolute inset-0 bg-black/40" />
                <div className="relative z-10">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/70">{card.kicker}</p>
                  <h3 className="font-display mt-auto text-3xl tracking-[-0.04em] text-white">{card.front}</h3>
                </div>
              </div>
              <div className="deck-face deck-back" style={{ background: `linear-gradient(150deg, ${index === 0 ? '#d6d6d6' : index === 1 ? '#c4c4c4' : index === 2 ? '#b0b0b0' : '#9a9a9a'}, ${index === 0 ? '#c4c4c4' : index === 1 ? '#b0b0b0' : index === 2 ? '#9a9a9a' : '#858585'})` }}>
                <p className="font-headline text-[13px] uppercase tracking-[0.16em] text-[#0f0f0f]">{card.title}</p>
                <p className="mt-4 font-body text-sm text-[#0f0f0f]">{card.spec}</p>
                <ul className="mt-6 space-y-2 text-sm">
                  {card.points.map((point) => (
                    <li key={point} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#0f0f0f]" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}
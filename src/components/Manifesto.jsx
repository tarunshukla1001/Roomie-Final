import { useLayoutEffect, useRef } from "react";
import { gsap } from "../animations/gsap";

export default function Manifesto() {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Initial text drop-in animation
      gsap.from(".manifesto-line", {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 75%" },
      });

      // 2. Fade background to black when scrolling PAST the section
      gsap.to(ref.current, {
        backgroundColor: "#0f0f0f",
        scrollTrigger: {
          trigger: ref.current,
          start: "bottom 75%", 
          end: "bottom top",
          scrub: true,
        },
      });

      // 3. Fade the dark text to white
      gsap.to(".fade-to-white", {
        color: "#ffffff",
        scrollTrigger: {
          trigger: ref.current,
          start: "bottom 75%",
          end: "bottom top",
          scrub: true,
        },
      });

      // 4. Fade the paragraph text to gray
      gsap.to(".fade-to-gray", {
        color: "#a1a1aa",
        scrollTrigger: {
          trigger: ref.current,
          start: "bottom 75%",
          end: "bottom top",
          scrub: true,
        },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={ref} 
      className="relative grid gap-10 px-6 py-24 md:grid-cols-[0.9fr_1.4fr] md:px-10 overflow-hidden bg-[#f5f0e6]" 
    >
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <img 
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80" 
          alt="" 
          className="w-full h-full object-cover" 
        />
      </div>
      
      {/* Left Column: Big, beautiful display heading */}
      <div className="relative">
        <h2 className="manifesto-line text-6xl md:text-7xl lg:text-[5.5rem] leading-[0.85] tracking-tighter font-display text-[#ff5a36]">
          Bold stays,<br />
          priced in<br />
          the open.
        </h2>
      </div>
      
      {/* Right Column: Original text formatting restored */}
      <div className="relative md:pt-4">
        <h3 className="manifesto-line fade-to-white max-w-4xl text-3xl leading-[1.15] tracking-[-0.04em] md:text-5xl font-display text-[#0f0f0f]">
          We combine design, motion, and straightforward rent so finding a PG feels
          visually considered — and still costs what a student can pay.
        </h3>
        
        <p className="manifesto-line fade-to-gray mt-8 max-w-xl text-[#5b5b5b] font-body text-lg">
          Shared from ₹4,999 a month. Private from ₹6,999. The number on the card is
          the number you pay.
        </p>
      </div>
    </section>
  );
}
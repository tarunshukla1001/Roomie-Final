import { useLayoutEffect, useRef } from "react";
import { gsap } from "../animations/gsap"; // Ensure this path matches your project setup
import WobbleMedia from "./WobbleMedia";

const steps = [
  {
    n: "01",
    title: "Pick a city",
    copy: "Filter by neighbourhood, sharing, and the number you can actually pay.",
    image: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=900&q=80",
  },
  {
    n: "02",
    title: "Tour the stay",
    copy: "Photos, amenities, leftover beds — no brochure fog.",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
  },
  {
    n: "03",
    title: "Hold the bed",
    copy: "Book in minutes. The monthly rent does not change at checkout.",
    image: "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?auto=format&fit=crop&w=900&q=80",
  },
];

export default function Process() {
  const sectionRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Fade the background from cream to black as the user leaves the section
      gsap.to(sectionRef.current, {
        backgroundColor: "#0f0f0f", 
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "bottom 75%", // Starts fading when the bottom of the section is 75% down the screen
          end: "bottom top",   // Fully black when the section leaves the top of the screen
          scrub: true,         // Reverses automatically when scrolling back up
        }
      });

      // 2. Fade the dark headings to white so they remain readable during the transition
      gsap.to(".fade-to-white", {
        color: "#ffffff",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "bottom 75%",
          end: "bottom top",
          scrub: true,
        }
      });

      // 3. Fade the body paragraphs to a lighter gray 
      gsap.to(".fade-to-gray", {
        color: "#a1a1aa",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "bottom 75%",
          end: "bottom top",
          scrub: true,
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef} 
      id="process" 
      // Removed data-wash and hardcoded the starting background color (bg-[#f5f0e6])
      className="relative px-6 py-24 md:px-10 overflow-hidden bg-[#f5f0e6]" 
    >
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80" alt="" className="w-full h-full object-cover" />
      </div>
      <div className="relative">
        <p className="text-sm uppercase tracking-[0.22em] text-[#7c3aed] font-mono">How it works</p>
        
        {/* Added "fade-to-white" target class */}
        <h2 className="fade-to-white mt-4 max-w-3xl text-4xl tracking-[-0.045em] md:text-6xl font-display text-[#0f0f0f]">
          Three steps. No broker theatre.
        </h2>
        
        <div className="mt-14 grid gap-10 md:grid-cols-3">
          {steps.map((step) => (
            <article key={step.n}>
              <WobbleMedia src={step.image} alt={step.title} />
              <p className="mt-5 font-mono text-[#7c3aed]">{step.n}</p>
              
              {/* Added "fade-to-white" target class */}
              <h3 className="fade-to-white mt-3 text-2xl tracking-[-0.04em] font-serif text-[#0f0f0f]">{step.title}</h3>
              
              {/* Added "fade-to-gray" target class */}
              <p className="fade-to-gray mt-3 max-w-xs text-[#5b5b5b] font-body">{step.copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
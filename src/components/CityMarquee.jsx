import { useRef } from "react";
import { cities } from "../data/listings";
import { Link } from "react-router-dom";

export default function CityMarquee() {
  const containerRef = useRef(null);
  const loop = [...cities, ...cities, ...cities];

  // Tracks the cursor and updates CSS variables for the glow effect
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    containerRef.current.style.setProperty("--mouse-x", `${x}px`);
    containerRef.current.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <section 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="group relative overflow-hidden border-y border-[#c8a97e]/20 bg-gradient-to-r from-[#1a1410] via-[#2a1f18] to-[#1a1410]" 
      data-wash="#1a1410"
    >
      {/* 
        CURSOR GLOW EFFECT
        Remains hidden until hovered, then follows the --mouse-x and --mouse-y coordinates.
      */}
      <div 
        className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: "radial-gradient(500px circle at var(--mouse-x, -100px) var(--mouse-y, -100px), rgba(240,224,192,0.15), transparent 40%)"
        }}
      />

      <div className="relative z-10 pt-16 pb-6 px-4 text-center">
        <h2 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-display uppercase tracking-[-0.05em] text-[#f0e0c0] drop-shadow-md">
          AVAILABLE HERE
        </h2>
        <p className="mt-3 text-xs sm:text-sm font-medium uppercase tracking-[0.25em] text-[#c8a97e]/80">
          Find your next home in major tech & lifestyle hubs
        </p>
      </div>

      <div className="relative z-10 pb-12 pt-4">
        
        {/* 
          BASE LAYER (MIDDLE SECTION): Black text.
          Because the top layer hides itself in the middle, this black text is revealed.
        */}
        <div className="marquee-track flex">
          {loop.map((city, index) => (
            <Link
              key={`base-${city}-${index}`}
              to={`/stays?city=${encodeURIComponent(city)}`}
              className="whitespace-nowrap font-headline text-5xl text-black md:text-7xl pr-8"
            >
              {city}
            </Link>
          ))}
        </div>

        {/* 
          OVERLAY LAYER (LEFT & RIGHT SECTIONS): Cream text.
          The mask hides the middle 33% to 66% of this layer, revealing the black text underneath.
        */}
        <div 
          className="absolute inset-0 py-10 pointer-events-none"
          style={{
            WebkitMaskImage: "linear-gradient(to right, black 0%, black 33%, transparent 33%, transparent 66%, black 66%, black 100%)",
            maskImage: "linear-gradient(to right, black 0%, black 33%, transparent 33%, transparent 66%, black 66%, black 100%)"
          }}
        >
          <div className="marquee-track flex">
            {loop.map((city, index) => (
              <span
                key={`overlay-${city}-${index}`}
                aria-hidden="true" 
                className="whitespace-nowrap font-headline text-5xl text-[#f0e0c0] md:text-7xl pr-8"
              >
                {city}
              </span>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
import { useEffect, useRef } from "react";
import { gsap } from "../animations/gsap";

export default function Loader({ onComplete }) {
  const containerRef = useRef(null);
  const counterRef = useRef(null);
  const lineContainerRef = useRef(null);
  const loadingLineRef = useRef(null);
  const logoWrapperRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          if (onComplete) onComplete();
        },
      });

      // 1. Prepare the SVG paths for drawing
      const paths = gsap.utils.toArray(".brand-path");
      paths.forEach((path) => {
        const length = path.getTotalLength();
        gsap.set(path, {
          strokeDasharray: length,
          strokeDashoffset: length, // Hides the path initially
        });
      });

      // 2. Loading Phase: Counter to 100 & Line grows
      const obj = { value: 0 };
      tl.to(obj, {
        value: 100,
        duration: 2.0,
        ease: "power2.inOut",
        onUpdate: () => {
          if (counterRef.current) {
            counterRef.current.innerText = String(Math.round(obj.value)).padStart(3, '0');
          }
        },
      })
      .to(loadingLineRef.current, {
        scaleX: 1,
        duration: 2.0,
        ease: "power2.inOut",
      }, 0);

      // 3. SIMULTANEOUS MORPH: Hide the line and draw the logo instantly
      tl.to(counterRef.current, { opacity: 0, y: 20, duration: 0.3 }, 2.0)
        
        // Make the entire loading line (track and filled line) disappear immediately
        .to(lineContainerRef.current, { opacity: 0, duration: 0.1 }, 2.0)
        
        // Draw the logo outlines simultaneously
        .to(paths, {
          strokeDashoffset: 0,
          duration: 1.0,
          ease: "power3.out",
          stagger: 0.1, 
        }, 2.0);

      // 4. ZOOM POP: The logo zooms massively towards the camera to transition
      tl.to(logoWrapperRef.current, {
        scale: 25, 
        opacity: 0,
        duration: 0.8,
        ease: "power3.inOut",
      }, 3.2) // Triggers right after the logo finishes drawing

      // 5. Fade out the background layer right as the zoom peaks
      .to(containerRef.current, {
        opacity: 0,
        duration: 0.4,
        ease: "power2.out",
      }, 3.5);

    }, containerRef);

    return () => ctx.revert();
  }, [onComplete]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f0f0f] text-white overflow-hidden"
    >
      <div className="relative flex flex-col items-center justify-center w-full h-full">

        {/* The Straight Loading Line */}
        <div ref={lineContainerRef} className="absolute w-64 h-[4px] bg-white/20">
          <div
            ref={loadingLineRef}
            className="absolute inset-0 bg-white origin-left scale-x-0"
          />
        </div>

        {/* The Morphing Logo Container */}
        <div ref={logoWrapperRef} className="absolute flex items-center justify-center z-10">
          <svg
            viewBox="0 0 100 100"
            className="w-32 h-32 overflow-visible"
            fill="transparent"
          >
            {/* 
              These paths approximate your "House R" logo. 
              The strokeWidth matches the bold strokes of your brand.
            */}
            
            {/* Outer House Outline */}
            <path
              className="brand-path"
              d="M 15 85 L 15 35 L 50 10 L 85 35 L 85 85"
              stroke="#ffffff"
              strokeWidth="12"
              strokeLinecap="square"
              strokeLinejoin="miter"
            />
            {/* The 'R' curve and chimney */}
            <path
              className="brand-path"
              d="M 35 25 C 35 65, 80 65, 75 10"
              stroke="#ffffff"
              strokeWidth="12"
              strokeLinecap="square"
              strokeLinejoin="miter"
            />
            {/* The right leg of the 'R' */}
            <path
              className="brand-path"
              d="M 52 48 L 82 85"
              stroke="#ffffff"
              strokeWidth="12"
              strokeLinecap="square"
              strokeLinejoin="miter"
            />
          </svg>
        </div>

      </div>

      {/* Bottom Left Counter */}
      <div className="absolute bottom-10 left-10 md:bottom-16 md:left-16">
        <span
          ref={counterRef}
          className="font-display text-6xl md:text-[7.5rem] font-medium tracking-tighter text-white"
        >
          000
        </span>
      </div>
    </div>
  );
}
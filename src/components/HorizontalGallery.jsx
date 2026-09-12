import { useLayoutEffect, useRef } from "react";
import { gsap } from "../animations/gsap";
import WobbleMedia from "./WobbleMedia";

const PANELS = [
  {
    src: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1100&q=80",
    title: "Courtyard light",
    note: "Whitefield",
  },
  {
    src: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1100&q=80",
    title: "Quiet loft",
    note: "Baner",
  },
  {
    src: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1100&q=80",
    title: "Study wall",
    note: "Adyar",
  },
  {
    src: "https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=1174&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    title: "Kitchen nook",
    note: "Gachibowli",
  },
  {
    src: "https://images.unsplash.com/photo-1593696140826-c58b021acf8b?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    title: "Twin stay",
    note: "Lajpat",
  },
  {
    src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1100&q=80",
    title: "Sunrise block",
    note: "Koramangala",
  },
  {
    src: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1100&q=80",
    title: "Modern room",
    note: "Hinjewadi",
  },
  {
    src: "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&w=1100&q=80",
    title: "PG block",
    note: "Pune",
  },
];

export default function HorizontalGallery() {
  const pin = useRef(null);
  const masterRef = useRef(null);
  const textRef = useRef(null);
  const imagesRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      
      // 1. Pop-Up Entrance Animation for the Heading
      gsap.from(textRef.current.children, {
        y: 40,
        opacity: 0,
        scale: 0.9,
        stagger: 0.15,
        duration: 1,
        ease: "back.out(1.5)",
        scrollTrigger: {
          trigger: pin.current,
          start: "top 75%", 
        }
      });

      // 2. Math calculations to ensure perfect scrolling lengths
      // Images move left until the final image hits the right side of the screen
      const getMoveImages = () => Math.max(0, imagesRef.current.scrollWidth - window.innerWidth);
      
      // The master wrapper then pushes everything exactly the width of the text block to exit
      const getMoveMaster = () => textRef.current.offsetWidth;

      // 3. The Scrubbed Scroll Timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pin.current,
          start: "top top",
          end: () => `+=${getMoveImages() + getMoveMaster()}`, // Total scroll distance
          pin: true,
          scrub: 0.55,
          invalidateOnRefresh: true, // Recalculates on browser resize
        },
      });

      // Phase A: The images slide behind the static text
      tl.to(imagesRef.current, {
        x: () => -getMoveImages(),
        ease: "none",
        // Using dynamic duration ensures constant scrolling velocity across both phases
        duration: () => getMoveImages(), 
      })
      // Phase B: The entire row (text + finished images) slides out to the left
      .to(masterRef.current, {
        x: () => -getMoveMaster(),
        ease: "none",
        duration: () => getMoveMaster(),
      });

    }, pin);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={pin}
      className="relative overflow-hidden bg-[#f5f0e6]"
      data-wash="#f5f0e6"
    >
      {/* Master container that holds both elements and moves at the very end */}
      <div ref={masterRef} className="flex h-svh items-center w-max">
        
        {/* 
          TEXT BLOCK: Stays static initially. 
          Given a solid background and higher z-index (z-10) so the images slide cleanly behind it.
        */}
        <div 
          ref={textRef} 
          className="flex w-[min(70vw,420px)] shrink-0 flex-col justify-center px-8 bg-[#f5f0e6] z-10 h-full relative"
        >
          <h2 className="mt-4 text-5xl tracking-[-0.05em] md:text-7xl font-display text-[#0f0f0f]">
            Stay with the scroll.
          </h2>
          <p className="mt-5 max-w-sm text-[#5b5b5b] font-body">
            Keep moving — the house tour hands off to a lateral gallery of
            real rooms.
          </p>
        </div>

        {/* 
          IMAGES TRACK: Animates left first. 
          z-0 ensures it slides safely behind the solid text block.
        */}
        <div ref={imagesRef} className="flex gap-6 pr-8 z-0 relative">
          {PANELS.map((panel) => (
            <figure key={panel.title} className="w-[min(58vw,380px)] shrink-0">
              <WobbleMedia src={panel.src} alt={panel.title} />
              <figcaption className="mt-4 flex items-baseline justify-between">
                <span className="text-xl tracking-[-0.04em] font-serif text-[#0f0f0f]">
                  {panel.title}
                </span>
                <span className="text-[11px] uppercase tracking-[0.16em] text-[#5b5b5b]">
                  {panel.note}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>

      </div>
    </section>
  );
}
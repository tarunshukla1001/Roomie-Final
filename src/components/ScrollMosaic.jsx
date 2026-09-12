import { useLayoutEffect, useRef } from "react";
import { gsap } from "../animations/gsap";

const SPACES = [
  {
    src: "https://images.unsplash.com/photo-1615874959474-d609969a20ed?q=80&w=880&auto=format&fit=crop",
    title: "Sunlit Minimalist Loft",
    tag: "Living Suite",
  },
  {
    src: "https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=627&auto=format&fit=crop",
    title: "Nordic Wood Studio",
    tag: "Studio",
  },
  {
    src: "https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=800&q=80",
    title: "Terrace Social Lounge",
    tag: "Commons",
  },
  {
    src: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
    title: "Modernist Atelier",
    tag: "Private Room",
  },
  {
    src: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
    title: "Japandi Courtyard",
    tag: "Interior",
  },
  {
    src: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=600&auto=format&fit=crop&q=60",
    title: "Urban Skyline Penthouse",
    tag: "Penthouse",
  },
  {
    src: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80",
    title: "Boutique Garden Suite",
    tag: "Balcony Suite",
  },
  {
    src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    title: "Glasshouse Creative Hub",
    tag: "Co-Living",
  },
  {
    src: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80",
    title: "Warm Amber Flat",
    tag: "Residency",
  },
  {
    src: "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&w=800&q=80",
    title: "Artisan Kitchen & Dining",
    tag: "Dining",
  },
  {
    src: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80",
    title: "Velvet Reading Nook",
    tag: "Library",
  },
];

export default function ScrollMosaic() {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Cards popping up transition with elastic spring
      gsap.utils.toArray(".mosaic-tile").forEach((tile, i) => {
        gsap.from(tile, {
          scale: 0.3,
          y: 55,
          opacity: 0,
          duration: 0.8,
          delay: (i % 3) * 0.06,
          ease: "back.out(1.8)",
          scrollTrigger: {
            trigger: tile,
            start: "top 90%",
          },
          clearProps: "scale,opacity,transform",
        });
      });

      // 2. Title Animation dropping in sequentially
      gsap.from(".title-word", {
        y: -40,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 75%" },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={ref}
      className="relative px-4 py-20 md:px-12 bg-[#e6dcc8] flex flex-col lg:flex-row items-start justify-between gap-8 lg:gap-12"
      data-wash="#e6dcc8"
    >
      {/* LEFT COLUMN: Heading 'Spaces that inspire' */}
      <div className="lg:sticky lg:top-28 w-full lg:w-[32%] flex flex-col pt-0 shrink-0">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#ff5a36] title-word mb-2">
          Curated Interiors
        </p>
        <h2 className="text-5xl sm:text-6xl md:text-7xl xl:text-8xl font-display uppercase leading-[0.88] tracking-tighter text-[#1a1814]">
          <span className="title-word block overflow-hidden">Spaces</span>
          <span className="title-word block overflow-hidden">That</span>
          <span className="title-word block overflow-hidden text-[#0044FF]">Inspire</span>
        </h2>
        <p className="mt-6 max-w-sm text-[#3d3830] font-body text-sm sm:text-base title-word leading-relaxed">
          Explore aesthetics designed for modern living, curated for comfort and absolute visual brilliance.
        </p>
      </div>

      {/* RIGHT COLUMN: The cards situated right next to the heading, first card aligned to top right */}
      <div className="w-full lg:w-[68%] grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 pt-0">
        {SPACES.map((space) => (
          <div
            key={space.src}
            className="mosaic-tile group cursor-pointer"
          >
            {/* Card with smooth hover lift & shadow */}
            <div className="h-full rounded-xl bg-white p-2.5 sm:p-3 shadow-sm border border-black/[0.08] transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-xl hover:border-black/15">
              <div className="overflow-hidden rounded-lg bg-neutral-100">
                <img
                  src={space.src}
                  alt={space.title}
                  className="w-full aspect-[16/11] object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
              </div>
              <div className="mt-2.5 flex items-center justify-between px-0.5">
                <div className="pr-2 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#ff5a36] truncate">
                    {space.tag}
                  </p>
                  <h4 className="text-sm font-semibold tracking-tight text-[#1a1814] mt-0.5 truncate">
                    {space.title}
                  </h4>
                </div>
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1e1b4b] text-[11px] text-[#f5f0e6] shadow-xs transition-all duration-200 group-hover:bg-[#ff5a36] group-hover:translate-x-0.5">
                  →
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
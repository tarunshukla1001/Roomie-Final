import { useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "../animations/gsap";
import { formatInr } from "../services/api";
import WobbleMedia from "./WobbleMedia";
import { fillImages } from "../data/listings";

function SplitWord({ text }) {
  return (
    <span className="inline-block overflow-hidden">
      {text.split("").map((char, index) => (
        <span key={`${char}-${index}`} className="char">
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  );
}

export default function FeaturedStays({ stays }) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".stay-title .char", {
        yPercent: 110,
        duration: 1.05,
        ease: "power4.out",
        stagger: 0.02,
        scrollTrigger: { trigger: ".stay-title", start: "top 80%" },
      });

      gsap.from(".stay-card", {
        y: 60,
        opacity: 0,
        scale: 0.92,
        duration: 1.1,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: { trigger: ".stay-grid", start: "top 78%" },
        clearProps: "transform",
      });
    }, ref);
    return () => ctx.revert();
  }, [stays]);

  return (
    <section ref={ref} className="relative px-4 pb-24 pt-16 md:px-6 bg-[#f5f0e6]" data-wash="#f5f0e6">
      {/* Centered Heading: ONLY 'STAYS' */}
      <div className="relative mb-12 flex items-start justify-center">
        <h2 className="stay-title text-[14vw] leading-[0.8] tracking-[-0.07em] md:text-[10vw] text-[#0f0f0f]">
          <SplitWord text="STAYS" />
        </h2>
      </div>

      {/* Property Cards Grid */}
      <div className="stay-grid mx-auto grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {stays.slice(0, 6).map((stay) => {
          const image = stay.image || fillImages[0];
          return (
            <div key={stay.id} className="stay-card">
              <Link
                to={`/stays/${stay.id}`}
                className="group block rounded-2xl bg-white p-4 sm:p-5 shadow-md border border-black/[0.06] transition-all duration-300 ease-out hover:[transform:translateY(-4px)] hover:shadow-2xl"
              >
                <div className="overflow-hidden rounded-xl">
                  <WobbleMedia src={image} alt={stay.title} />
                </div>
                <div className="pt-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[#5b5b5b]">
                    {(stay.tags || []).join(" • ") || `${stay.city} · ${stay.type}`}
                  </p>
                  <div className="mt-1 flex items-baseline justify-between gap-4">
                    <h3 className="text-2xl tracking-[-0.04em] text-[#0f0f0f] transition-colors duration-200 group-hover:text-indigo-950">
                      {stay.title}
                    </h3>
                    <p className="text-sm font-semibold text-[#ff5a36]">{formatInr(stay.price)}/mo</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-2 border-t border-black/5 pt-3">
                    <span className="text-xs text-[#6b6b73]">{stay.city || "Bangalore"}</span>
                    <span className="inline-flex items-center justify-center rounded-full bg-[#1e1b4b] px-4 py-2 text-xs font-semibold tracking-wide text-white shadow-sm transition-colors duration-200 group-hover:bg-[#2d266e]">
                      View Stay
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      {/* Explore All Stays Button with cream text */}
      <div className="mt-14 flex justify-center">
        <Link
          to="/stays"
          className="inline-flex items-center gap-2 rounded-full bg-[#1e1b4b] px-8 py-3.5 text-sm font-semibold tracking-wide text-[#f5f0e6] shadow-md transition-all duration-300 ease-out hover:[transform:translateY(-2px)] hover:bg-[#2d266e] hover:shadow-xl"
        >
          <span className="text-[#f5f0e6]">Explore All Stays</span>
          <span aria-hidden="true" className="text-[#f5f0e6]">→</span>
        </Link>
      </div>
    </section>
  );
}

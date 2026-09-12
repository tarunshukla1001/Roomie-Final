import { useLayoutEffect, useRef, useState } from "react";
import ScrollTour from "./ScrollTour";
import { gsap, ScrollTrigger } from "../animations/gsap";
import { motion, useScroll, useTransform } from "framer-motion";

const ROOMS = [
  { t: 0, label: "Arrival" },
  { t: 0.14, label: "Drive" },
  { t: 0.28, label: "Facade" },
  { t: 0.42, label: "Hall" },
  { t: 0.56, label: "Living" },
  { t: 0.7, label: "Kitchen" },
  { t: 0.84, label: "Suite" },
  { t: 1, label: "Bath" },
  { t: 1.14, label: "Terrace" },
];

export default function Hero() {
  const wrapRef = useRef(null);
  const fillRef = useRef(null);
  const progress = useRef(0);
  const roomRef = useRef(0);
  const [room, setRoom] = useState(0);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: wrapRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.65,
        onUpdate: (self) => {
          progress.current = self.progress;
          if (fillRef.current) {
            fillRef.current.style.transform = `scaleY(${self.progress})`;
          }
          const idx = Math.min(
            ROOMS.length - 1,
            Math.round(self.progress * (ROOMS.length - 1)),
          );
          if (idx !== roomRef.current) {
            roomRef.current = idx;
            setRoom(idx);
          }
        },
      });
    }, wrapRef);
    return () => ctx.revert();
  }, []);

  const progressTour = room / (ROOMS.length - 1);

  // Parallax setup for the hero 3D container
  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end start"],
  });
  
  // Parallax translates the canvas slightly down as user scrolls
  const parallaxY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  // Staggered text reveal configuration
  const titleWords = ROOMS[room].label.split(" ");

  return (
    <section
      ref={wrapRef}
      className="relative h-[500vh] bg-[#1a1814]"
      data-wash="#1a1814"
    >
      <div className="sticky top-0 h-svh overflow-hidden">
        <motion.div style={{ y: parallaxY }} className="absolute inset-0">
          <ScrollTour progress={progressTour} />
        </motion.div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

        <div className="absolute left-6 top-6 max-w-sm text-white md:left-10 md:top-10">
          {/* <p className="kicker text-[#0044FF] bg-white/90 px-3 py-1 inline-block rounded-sm font-bold tracking-widest text-[10px]">Real house tour</p> */}
          <h1 className="font-display mt-3 text-4xl text-white md:text-7xl flex flex-wrap gap-x-4">
            {titleWords.map((word, i) => (
              <span key={`${word}-${room}-${i}`} className="overflow-hidden inline-block pb-2">
                <motion.span
                  initial={{ y: "110%", rotateZ: 5, opacity: 0 }}
                  animate={{ y: "0%", rotateZ: 0, opacity: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 70,
                    damping: 20,
                    mass: 1.2,
                    delay: i * 0.08,
                  }}
                  className="inline-block origin-bottom-left"
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-3 font-body text-sm text-white/70"
          >
            Scroll to walk through the estate — driveway, facade, hall, living
            room, suite, and terrace.
          </motion.p>
        </div>

        <div className="absolute right-6 top-1/2 flex -translate-y-1/2 gap-5 md:right-10">
          <ol className="flex flex-col justify-between py-1 text-right font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">
            {ROOMS.map((item, index) => (
              <li
                key={item.label}
                className={index === room ? "text-[#0044FF] font-bold" : ""}
              >
                {item.label}
              </li>
            ))}
          </ol>
          <div className="relative h-56 w-px bg-white/20">
            <div
              ref={fillRef}
              className="absolute inset-x-0 top-0 h-full origin-top bg-gradient-to-b from-[#0044FF] to-[#0035cc]"
              style={{ transform: "scaleY(0)" }}
            />
          </div>
        </div>

        <p className="absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.24em] text-white/50">
          Scroll to tour
        </p>
      </div>
    </section>
  );
}

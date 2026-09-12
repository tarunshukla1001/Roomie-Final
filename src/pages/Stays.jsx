import { useEffect, useMemo, useState, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { cities, fillImages } from "../data/listings";
import { fetchStays, formatInr } from "../services/api";
import WobbleMedia from "../components/WobbleMedia";
import { motion } from "framer-motion";

export default function Stays() {
  const [params, setParams] = useSearchParams();
  const [stays, setStays] = useState([]);
  const city = params.get("city") || "";
  const q = params.get("q") || "";

  // Ref to track the heading container for the mouse movement
  const headingRef = useRef(null);

  useEffect(() => {
    fetchStays({ city, q }).then(setStays).catch(() => setStays([]));
  }, [city, q]);

  const heading = useMemo(
    () => (city ? city.toUpperCase() : "STAYS"),
    [city]
  );

  // Updates CSS variables for the mask position instantly without re-rendering the component
  const handleMouseMove = (e) => {
    if (!headingRef.current) return;
    const rect = headingRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    headingRef.current.style.setProperty("--cursor-x", `${x}px`);
    headingRef.current.style.setProperty("--cursor-y", `${y}px`);
  };

  const handleMouseLeave = () => {
    if (!headingRef.current) return;
    // Moves the spotlight off-screen when the mouse leaves the heading area
    headingRef.current.style.setProperty("--cursor-x", `-1000px`);
    headingRef.current.style.setProperty("--cursor-y", `-1000px`);
  };

  return (
    <main className="px-4 pb-24 pt-28 md:px-6">
      
      {/* Container tracking the mouse for the spotlight effect */}
      <div 
        ref={headingRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative mb-12 w-full text-center z-10 py-4 flex justify-center"
      >
        {/* LAYER 1: Base Dark Text (Locked to dark for white/light themes) */}
        <h1 className="text-[14vw] leading-[0.8] tracking-[-0.07em] md:text-[10vw] text-[#0f0f0f] flex justify-center overflow-hidden">
          {heading.split("").map((char, i) => (
            <motion.span
              key={i}
              initial={{ y: "110%", rotateZ: 8 }}
              animate={{ y: "0%", rotateZ: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: i * 0.04 }}
              className="inline-block origin-bottom-left"
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </h1>
        
        {/* LAYER 2: Colored Spotlight Text (Revealed only where the cursor hovers) */}
        <h1 
          className="absolute top-4 left-0 w-full h-full text-[14vw] leading-[0.8] tracking-[-0.07em] md:text-[10vw] text-[#0044FF] pointer-events-none flex justify-center overflow-hidden"
          style={{
            // Creates a 250px soft circle that masks the colored text based on CSS variables
            WebkitMaskImage: "radial-gradient(250px circle at var(--cursor-x, -1000px) var(--cursor-y, -1000px), black 0%, transparent 100%)",
            maskImage: "radial-gradient(250px circle at var(--cursor-x, -1000px) var(--cursor-y, -1000px), black 0%, transparent 100%)",
          }}
        >
          {heading.split("").map((char, i) => (
            <motion.span
              key={i}
              initial={{ y: "110%", rotateZ: 8 }}
              animate={{ y: "0%", rotateZ: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: i * 0.04 }}
              className="inline-block origin-bottom-left"
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </h1>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mb-16 flex flex-wrap justify-center gap-3 relative z-20"
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          const next = new URLSearchParams();
          if (form.get("city")) next.set("city", form.get("city"));
          if (form.get("q")) next.set("q", form.get("q"));
          setParams(next);
        }}
      >
        <select name="city" defaultValue={city} className="pill pill-light shadow-sm">
          <option value="">All cities</option>
          {cities.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <input
          name="q"
          defaultValue={q}
          placeholder="Search area or type"
          className="min-w-[200px] flex-1 rounded-full bg-white px-6 py-3 outline-none shadow-sm text-[#0f0f0f] border border-gray-100 focus:border-[#0044FF]/30 transition-colors"
        />
        <button className="pill pill-dark hover:scale-105 active:scale-95 transition-transform duration-300">Filter</button>
      </motion.form>

      <div className="stay-grid mx-auto grid max-w-6xl gap-10 sm:grid-cols-2 lg:grid-cols-3 relative z-10">
        {stays.map((stay, index) => (
          <motion.div
            key={stay.id}
            initial={{ opacity: 0, y: 80 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: (index % 3) * 0.1 }}
          >
<Link 
              to={`/stays/${stay.id}`} 
              className="stay-card group block overflow-hidden rounded-2xl bg-[#efe6d8] shadow-sm transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,68,255,0.08)]"
            >
              <div className="relative overflow-hidden aspect-[4/3]">
                <motion.div
                  initial={{ scale: 1.15 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: (index % 3) * 0.15 }}
                  className="h-full w-full"
                >
                  <WobbleMedia src={stay.image || fillImages[index % fillImages.length]} alt={stay.title} className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105" />
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0044FF]/20 to-transparent opacity-0 mix-blend-overlay transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />
              </div>
              <div className="p-6 bg-[#efe6d8] relative">
                <motion.div
                  className="absolute top-0 left-0 w-full h-[1px] bg-gray-100 origin-left"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                />
                <motion.p 
                  initial={{ opacity: 0, x: -15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: (index % 3) * 0.1 + 0.3 }}
                  className="mt-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] font-bold text-[#0044FF]/60 transition-colors duration-300 group-hover:text-[#0044FF]"
                >
                  <span className="h-px w-3 bg-[#0044FF]/30 transition-all duration-300 group-hover:w-6 group-hover:bg-[#0044FF]"></span>
                  {stay.area} · {stay.city}
                </motion.p>
                <div className="mt-4 flex items-baseline justify-between gap-4">
                  <h2 className="text-2xl font-display font-medium tracking-tight text-[#0f0f0f] transition-colors duration-300 group-hover:text-[#0044FF]">{stay.title}</h2>
                  <p className="text-sm font-semibold text-[#0f0f0f]">{formatInr(stay.price)}</p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </main>
  );
}
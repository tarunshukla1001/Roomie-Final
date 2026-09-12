import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchStay, formatInr } from "../services/api";
import { fillImages } from "../data/listings";
import WobbleMedia from "../components/WobbleMedia";
import { motion } from "framer-motion";

export default function StayDetail() {
  const { id } = useParams();
  const [stay, setStay] = useState(null);

  useEffect(() => {
    fetchStay(id).then(setStay).catch(() => setStay(null));
  }, [id]);

  if (!stay) {
    return (
      <main className="px-6 py-40">
        <p className="text-[#6b6b73]">Looking for that room…</p>
      </main>
    );
  }

  const saved = stay.originalPrice - stay.price;
  const gallery = [stay.image, ...(stay.gallery || []), ...fillImages]
    .filter(Boolean)
    .filter((src, index, all) => all.indexOf(src) === index)
    .slice(0, 6);

  return (
    <main className="px-6 pb-24 pt-32 md:px-10">
      <motion.p 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.8 }}
        className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#0044FF]/60"
      >
        {stay.city} · {stay.type}
      </motion.p>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
        <h1 className="max-w-4xl text-5xl font-display tracking-tight text-[#0f0f0f] md:text-8xl flex flex-wrap gap-x-4">
          {stay.title.split(" ").map((word, i) => (
            <span key={i} className="overflow-hidden inline-block pb-1">
              <motion.span
                initial={{ y: "110%", rotateZ: 2, opacity: 0 }}
                animate={{ y: "0%", rotateZ: 0, opacity: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 80,
                  damping: 20,
                  delay: i * 0.08 + 0.1,
                }}
                className="inline-block origin-bottom-left"
              >
                {word}
              </motion.span>
            </span>
          ))}
        </h1>
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-right"
        >
          <p className="text-4xl font-semibold text-[#0044FF]">{formatInr(stay.price)}<span className="text-2xl text-[#0044FF]/70">/mo</span></p>
          <p className="text-sm font-medium text-[#9a9aa3] line-through decoration-[#9a9aa3]/40">{formatInr(stay.originalPrice)}</p>
          <p className="text-sm font-medium text-[#0f0f0f]/60 mt-1">You save {formatInr(saved)}</p>
        </motion.div>
      </div>

      <div className="mx-auto mt-16 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {gallery.map((src, index) => (
          <motion.div
            key={src}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="overflow-hidden rounded-xl bg-white shadow-sm"
          >
            <motion.div
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-full w-full"
            >
              <WobbleMedia src={src} alt="" />
            </motion.div>
          </motion.div>
        ))}
      </div>

      <div className="mx-auto max-w-6xl mt-20 grid gap-12 md:grid-cols-[1.4fr_0.8fr]">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <p className="max-w-2xl text-xl font-body leading-relaxed text-[#0f0f0f]/80">{stay.description}</p>
          <ul className="mt-8 flex flex-wrap gap-3">
            {(stay.amenities || []).map((item, i) => (
              <motion.li 
                key={item} 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="rounded-full bg-white border border-gray-100 shadow-sm px-5 py-2.5 text-sm font-medium text-[#0f0f0f]"
              >
                {item}
              </motion.li>
            ))}
          </ul>
        </motion.div>
        <motion.aside 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          className="rounded-[28px] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50/50 p-8 self-start sticky top-32"
        >
          <p className="text-sm font-medium text-[#0f0f0f]/60 flex items-center justify-between">
            <span>{stay.bedsLeft} beds left</span>
            <span className="flex items-center gap-1 text-[#0044FF]"><span className="text-lg">★</span> {stay.rating} ({stay.reviews} reviews)</span>
          </p>
          <p className="mt-6 text-sm font-medium text-[#0f0f0f]/80">
            {stay.area}, {stay.city} · {stay.gender}
          </p>
          <Link
            to={`/book/${stay.id}`}
            className="group relative mt-8 flex w-full items-center justify-center overflow-hidden rounded-full bg-[#0044FF] px-8 py-4 font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#0044FF]/25"
          >
            <span className="relative z-10">Book this room</span>
            <div className="absolute inset-0 z-0 bg-gradient-to-r from-blue-600 to-[#0044FF] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </Link>
        </motion.aside>
      </div>
    </main>
  );
}

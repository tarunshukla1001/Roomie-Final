import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ROOMS = [
  {
    label: "Arrival",
    src: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2560&q=80",
  },
  {
    label: "Drive",
    src: "/wmremove-transformed.jpeg",
  },
  {
    label: "Facade",
    src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2560&q=80",
  },
  {
    label: "Hall",
    src: "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&w=2560&q=80",
  },
  {
    label: "Living",
    src: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=2560&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    label: "Kitchen",
    src: "https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=2560&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    label: "Suite",
    src: "https://images.unsplash.com/photo-1737517302831-e7b8a8eaa97c?q=80&w=2560&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    label: "Bath",
    src: "https://plus.unsplash.com/premium_photo-1661902468735-eabf780f8ff6?w=2560&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8YmF0aHxlbnwwfHwwfHx8MA%3D%3D",
  },
  {
    label: "Terrace",
    src: "https://images.unsplash.com/photo-1600210492090-a159ffa3aeaf?q=80&w=2560&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];

export default function ScrollTour({ progress = 0 }) {
  const wrapRef = useRef(null);
  const currentIndex = Math.min(
    ROOMS.length - 1,
    Math.round(progress * (ROOMS.length - 1)),
  );

  return (
    <div
      ref={wrapRef}
      className="absolute inset-0 overflow-hidden bg-black"
      style={{ perspective: 1200 }}
    >
      <AnimatePresence>
        <motion.div
          key={currentIndex}
          className="absolute inset-0"
          initial={{
            opacity: 0,
            scale: 1, // Kept at 1 to prevent rasterization stretching
            z: -400,  // Pushed back in 3D space instead of scaling down
          }}
          animate={{
            opacity: 1,
            scale: 1,
            z: 0,
          }}
          exit={{
            opacity: 0,
            scale: 1, 
            z: 800, // Pulls the image close to the 1200px perspective camera (simulates a huge zoom)
          }}
          transition={{
            duration: 1.2,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{
            backgroundImage: `url(${ROOMS[currentIndex].src})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            transformStyle: "preserve-3d",
            willChange: "transform, opacity", // Hints the browser to optimize this layer
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <div className="absolute bottom-10 left-10 text-white">
            <h2 className="text-4xl font-bold">{ROOMS[currentIndex].label}</h2>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
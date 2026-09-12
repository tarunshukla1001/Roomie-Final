// scroll.js
// Single source of truth for scroll. Lenis drives the smooth-scroll feel;
// GSAP ScrollTrigger drives all animation timing off Lenis's scroll events
// instead of the native scroll event, so they never fight each other.

import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

let lenisInstance = null;

export function initScroll() {
  if (lenisInstance) return lenisInstance;

  const lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  // keep GSAP's clock and Lenis's raf loop as the same loop, not two competing ones
  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  lenisInstance = lenis;
  return lenis;
}

export function destroyScroll() {
  if (lenisInstance) {
    lenisInstance.destroy();
    lenisInstance = null;
  }
}

// A plain mutable ref (0..1) that the R3F canvas reads every frame via useFrame.
// Deliberately NOT React state — updating state 60x/sec would thrash re-renders.
// Call bindScrollProgress once with your hero section element.
export function bindScrollProgress(sectionEl, progressRef) {
  return ScrollTrigger.create({
    trigger: sectionEl,
    start: "top top",
    end: "bottom top",
    scrub: true,
    onUpdate: (self) => {
      progressRef.current = self.progress;
    },
  });
}
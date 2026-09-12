import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "../animations/gsap";

export default function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.6,
      lerp: 0.08,
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.8,
      syncTouch: true,
      easing: (t) => 1 - Math.pow(1 - t, 5),
      infinite: false,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const update = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);

    return () => {
      window.removeEventListener("load", refresh);
      lenis.destroy();
      gsap.ticker.remove(update);
    };
  }, []);
}

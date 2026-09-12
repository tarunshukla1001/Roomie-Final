import { useLayoutEffect } from "react";
import { gsap, ScrollTrigger } from "../animations/gsap";

export default function useColorScroll(pathname) {
  useLayoutEffect(() => {
    const sections = gsap.utils.toArray("[data-wash]");

    const triggers = sections.map((section) =>
      ScrollTrigger.create({
        trigger: section,
        start: "top 58%",
        end: "bottom 42%",
        onEnter: () => document.documentElement.style.setProperty("--paper", section.dataset.wash),
        onEnterBack: () => document.documentElement.style.setProperty("--paper", section.dataset.wash),
      })
    );

    ScrollTrigger.refresh();

    const initial = sections.find((section) => {
      const rect = section.getBoundingClientRect();
      return rect.top <= window.innerHeight * 0.58 && rect.bottom >= window.innerHeight * 0.42;
    });

    if (initial) {
      document.documentElement.style.setProperty("--paper", initial.dataset.wash);
    }

    return () => triggers.forEach((trigger) => trigger.kill());
  }, [pathname]);
}

// KineticText.jsx
// Masked line-reveal typography, à la the "ALCHE" / "WORK" reveals.
// Pure DOM + GSAP — no reason to touch WebGL for text.
//
// Uses SplitType (MIT, free) instead of GSAP's SplitText (Club GreenSock
// paid plugin) so this runs without a license. If you do have Club
// GreenSock, swap SplitType for gsap/SplitText — API is very similar.

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";

gsap.registerPlugin(ScrollTrigger);

export default function KineticText({ children, as: Tag = "h2", className = "" }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    const split = new SplitType(el, { types: "lines,words" });

    // wrap each line in a mask so it slides up from behind an overflow:hidden edge
    split.lines.forEach((line) => {
      line.style.overflow = "hidden";
      line.style.display = "block";
    });

    const ctx = gsap.context(() => {
      gsap.fromTo(
        split.words,
        { yPercent: 120, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.9,
          ease: "power4.out",
          stagger: 0.03,
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
            once: true,
          },
        }
      );
    }, el);

    return () => {
      ctx.revert();
      split.revert();
    };
  }, []);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
import { useState } from "react";

// Cheap one-time heuristic, not scientific — just enough to avoid handing
// a full HDRI environment map + WebGL scene to a low-end phone for a
// background element the user barely looks at directly.
// Returns "low" | "mid" | "high".
function computeTier() {
  if (typeof window === "undefined") return "mid";
  const cores = navigator.hardwareConcurrency || 4;
  const mem = navigator.deviceMemory || 4; // Chrome-only, undefined elsewhere
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (prefersReducedMotion) {
    return "low";
  }

  let score = 0;
  score += cores >= 8 ? 2 : cores >= 4 ? 1 : 0;
  score += mem >= 8 ? 2 : mem >= 4 ? 1 : 0;
  score += isMobile ? -1 : 1;

  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl2");
  if (!gl) score -= 2;

  if (score <= 0) return "low";
  if (score <= 2) return "mid";
  return "high";
}

export default function useDeviceTier() {
  const [tier] = useState(computeTier);
  return tier;
}
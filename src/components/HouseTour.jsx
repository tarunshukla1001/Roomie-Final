import { useRef, useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  AnimatePresence,
  useInView,
} from "framer-motion";
import { Play, Volume2, VolumeX, ArrowDown, Gauge } from "lucide-react";

export default function HouseTour() {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [videoSpeed, setVideoSpeed] = useState(1.75); // Fast video speed as requested
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Autoplay and auto-pause based on viewport visibility
  const isInView = useInView(containerRef, { margin: "-20% 0px -20% 0px" });

  useEffect(() => {
    if (isInView) {
      if (videoRef.current) {
        videoRef.current.playbackRate = videoSpeed;
        videoRef.current.play().catch(() => {});
      }
      if (audioRef.current) {
        audioRef.current.playbackRate = 1.0;
        audioRef.current.muted = isMuted;
        audioRef.current.play().catch(() => {
          // If browser blocks audio autoplay (no prior interaction), fallback to muted
          setIsMuted(true);
          if (audioRef.current) audioRef.current.muted = true;
        });
      }
      setHasPlayed(true);
      setIsPlaying(true);
    } else {
      if (videoRef.current) videoRef.current.pause();
      if (audioRef.current) audioRef.current.pause();
      setIsPlaying(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInView]);

  // Set playback speed: FAST video, strictly NORMAL (1.0x) audio
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = videoSpeed;
    }
    if (audioRef.current) {
      audioRef.current.playbackRate = 1.0; // Audio is never sped up
    }
  }, [videoSpeed]);

  // Track scroll through the pinned section (280vh height)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Smooth scroll spring for organic feel
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 26,
    restDelta: 0.001,
  });

  // 1. Video Width: from initial ~40% (or 92% on mobile) to 96vw full cinematic banner
  const videoWidth = useTransform(
    smoothProgress,
    [0, 0.7],
    [isMobile ? "92%" : "40%", isMobile ? "96%" : "96%"],
  );

  // 2. Video Height: from compact pill/card (~46vh) to full banner (~84vh)
  const videoHeight = useTransform(
    smoothProgress,
    [0, 0.7],
    [isMobile ? "38vh" : "48vh", isMobile ? "74vh" : "84vh"],
  );

  // 3. Horizontal position: starts left-aligned, centers as it expands
  const videoTranslateX = useTransform(
    smoothProgress,
    [0, 0.65],
    [isMobile ? "0%" : "-26%", "0%"],
  );

  // 4. Border Radius: transitions smoothly from organic pill (32px) to refined corner (14px)
  const borderRadius = useTransform(smoothProgress, [0, 0.7], ["32px", "14px"]);

  // 5. Approach Text (Right side): fades out and slides away as video expands
  const sideTextOpacity = useTransform(smoothProgress, [0, 0.35], [1, 0]);
  const sideTextX = useTransform(smoothProgress, [0, 0.35], [0, 60]);

  // 6. Top Headline: fades out smoothly as video takes over the stage
  const headlineOpacity = useTransform(smoothProgress, [0, 0.32], [1, 0]);
  const headlineY = useTransform(smoothProgress, [0, 0.32], [0, -35]);

  // 7. Dynamic Blue Line animation surrounding the video
  const linePathLength = useTransform(smoothProgress, [0, 0.6], [0.15, 1]);
  const lineOpacity = useTransform(
    smoothProgress,
    [0, 0.55, 0.75],
    [1, 1, 0.15],
  );

  // 8. Grid '+' crosshairs: fade in along top and bottom borders as banner expands (Lusion signature)
  const crosshairsOpacity = useTransform(
    smoothProgress,
    [0.45, 0.72],
    [0, 0.65],
  );

  // 9. Central Typography overlay scale
  const textScale = useTransform(smoothProgress, [0, 0.75], [0.92, 1.06]);

  // Audio Toggle
  const toggleMute = (e) => {
    e.stopPropagation();
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setIsMuted(audioRef.current.muted);
    }
  };

  // Play reel handler (starts fast video + normal-speed audio, removes title and pause button)
  const startPlaying = () => {
    if (videoRef.current) {
      videoRef.current.playbackRate = videoSpeed;
      videoRef.current.play().catch(() => {});
    }
    if (audioRef.current) {
      audioRef.current.playbackRate = 1.0; // Strictly normal 1.0x audio speed!
      audioRef.current.muted = isMuted;
      audioRef.current.play().catch(() => {});
    }
    setHasPlayed(true);
    setIsPlaying(true);
  };

  // Play / Pause Toggle
  const togglePlay = () => {
    if (!hasPlayed) {
      startPlaying();
      return;
    }

    if (isPlaying) {
      if (videoRef.current) videoRef.current.pause();
      if (audioRef.current) audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (videoRef.current) {
        videoRef.current.playbackRate = videoSpeed;
        videoRef.current.play().catch(() => {});
      }
      if (audioRef.current) {
        audioRef.current.playbackRate = 1.0; // Strictly normal speed
        audioRef.current.play().catch(() => {});
      }
      setIsPlaying(true);
    }
  };

  // Cycle video speed: 1.5x -> 1.75x -> 2.0x (Audio stays at 1.0x!)
  const cycleSpeed = (e) => {
    e.stopPropagation();
    const nextSpeed =
      videoSpeed === 1.75 ? 2.0 : videoSpeed === 2.0 ? 1.5 : 1.75;
    setVideoSpeed(nextSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = nextSpeed;
    }
    if (audioRef.current) {
      audioRef.current.playbackRate = 1.0; // Audio always normal speed
    }
  };

  return (
    <section
      ref={containerRef}
      id="house-tour-section"
      className="relative h-[270vh] bg-[#fbf9f4] text-[#1a1814] overflow-clip select-none"
    >
      {/* Pinned Viewport Stage */}
      <div className="sticky top-0 flex h-screen w-full flex-col items-center justify-center overflow-hidden px-4 sm:px-8">
        {/* Subtle Background Architectural Ambient Wash */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-60">
          <div className="h-[45vw] w-[45vw] max-w-[700px] rounded-full bg-[#0044FF]/[0.04] blur-[140px]" />
        </div>

        {/* Dynamic Blue Line Animation Surrounding the Video (Lusion.co spline) */}
        <svg
          className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible"
          viewBox="0 0 1440 900"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <filter id="blue-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow
                dx="0"
                dy="8"
                stdDeviation="16"
                floodColor="#0044FF"
                floodOpacity="0.45"
              />
            </filter>
            <linearGradient
              id="blueLineGrad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#0044FF" />
              <stop offset="60%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#0035cc" />
            </linearGradient>
          </defs>

          {/* Underlay ambient glow stroke */}
          <motion.path
            d="M -60,180 C 140,80 240,120 280,240 C 310,340 130,360 130,480 C 130,640 280,720 460,700 C 680,680 780,480 960,460 C 1140,440 1320,540 1520,460"
            stroke="#0044FF"
            strokeWidth={isMobile ? 24 : 36}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.3}
            style={{
              pathLength: linePathLength,
              opacity: lineOpacity,
            }}
            filter="url(#blue-glow)"
          />

          {/* Primary High-Voltage Blue Ribbon */}
          <motion.path
            d="M -60,180 C 140,80 240,120 280,240 C 310,340 130,360 130,480 C 130,640 280,720 460,700 C 680,680 780,480 960,460 C 1140,440 1320,540 1520,460"
            stroke="url(#blueLineGrad)"
            strokeWidth={isMobile ? 14 : 22}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              pathLength: linePathLength,
              opacity: lineOpacity,
            }}
          />
        </svg>

        {/* Top Header Bar & Headline (Fades out as video expands) */}
        <motion.div
          style={{ opacity: headlineOpacity, y: headlineY }}
          className="pointer-events-none absolute top-8 sm:top-12 left-6 right-6 z-20 flex flex-col items-center text-center"
        >
          <div className="flex items-center justify-between w-full max-w-6xl px-2 mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-[#ff5a36]">
            <span className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-[#0044FF] animate-ping" />
            </span>
            <span className="hidden sm:flex items-center gap-1 text-[#1a1814]/50">
              Scroll to expand
              <ArrowDown className="h-3 w-3 animate-bounce" />
            </span>
          </div>

          <h2 className="text-4xl sm:text-6xl md:text-7xl font-display font-black uppercase tracking-tight text-[#1a1814] leading-[0.92]">
            Bold Spaces, <br className="hidden sm:inline" />
            <span className="text-[#0044FF]">Brought to Life</span>
          </h2>
        </motion.div>

        {/* Main Interactive Stage */}
        <div className="relative z-10 flex w-full max-w-7xl items-center justify-center">
          {/* RIGHT-SIDE CONTENT (Initial Layout): "OUR APPROACH" - slides out as video grows */}
          {!isMobile && (
            <motion.div
              style={{ opacity: sideTextOpacity, x: sideTextX }}
              className="pointer-events-none absolute right-4 xl:right-12 z-10 w-[38%] max-w-md flex flex-col items-start text-left"
            >
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#1a1814]/[0.06] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-[#1a1814]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#0044FF]" />
                Our Approach
              </div>
              <p className="font-body text-lg xl:text-xl font-medium leading-relaxed text-[#3d3830]">
                We combine architectural vision, spatial motion, and curated
                design to craft living spaces that visually captivate and
                seamlessly invite real living.
              </p>
            </motion.div>
          )}

          {/* EXPANDING VIDEO CONTAINER */}
          <motion.div
            style={{
              width: videoWidth,
              height: videoHeight,
              x: videoTranslateX,
              borderRadius,
            }}
            onClick={togglePlay}
            className="group relative flex items-center justify-center overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.2)] border border-black/10 bg-[#0f0f14] will-change-[width,height,transform,border-radius] cursor-pointer"
          >
            {/* Lusion Signature Grid Crosshairs (+) along Top and Bottom Borders */}
            <motion.div
              style={{ opacity: crosshairsOpacity }}
              className="pointer-events-none absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-6 sm:px-12 py-1 text-white/80 font-mono text-sm border-b border-white/10"
            >
              <span>+</span>
              <span>+</span>
              <span className="hidden sm:inline">+</span>
              <span>+</span>
              <span>+</span>
            </motion.div>

            <motion.div
              style={{ opacity: crosshairsOpacity }}
              className="pointer-events-none absolute bottom-0 left-0 right-0 z-30 flex items-center justify-between px-6 sm:px-12 py-1 text-white/80 font-mono text-sm border-t border-white/10"
            >
              <span>+</span>
              <span>+</span>
              <span className="hidden sm:inline">+</span>
              <span>+</span>
              <span>+</span>
            </motion.div>

            {/* Video Element: Plays fast (1.75x) with muted audio so audio is never sped up */}
            <video
              ref={videoRef}
              loop
              muted
              playsInline
              preload="auto"
              // poster="/videos/house-tour-poster.jpg"
              onLoadedMetadata={(e) => {
                e.currentTarget.playbackRate = videoSpeed;
              }}
              className="h-full w-full object-cover select-none brightness-95 group-hover:brightness-100 transition-[filter] duration-500"
            >
              <source src="/house-tour-video.mp4" type="video/mp4" />
            </video>

            {/* Dedicated Audio Element: Strictly plays at normal 1.0x speed */}
            <audio
              ref={audioRef}
              src="/house-tour-audio.mp3"
              loop
              preload="auto"
            />

            {/* Subtle Gradient Overlays for High-Contrast Readability */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/35" />

            {/* Centered Overlay:
                - Before played: Shows 'PLAY ( ▶ ) REEL' title.
                - Once played: The 'PLAY REEL' title and pause button are completely REMOVED.
                - If paused after playing, only a clean, minimal Play icon appears to resume. */}
            <AnimatePresence>
              {!hasPlayed && (
                <motion.div
                  key="initial-play-reel-overlay"
                  initial={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, filter: "blur(6px)" }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  style={{ scale: textScale }}
                  className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-4 select-none"
                >
                  <div className="flex items-center gap-3 sm:gap-6 md:gap-8">
                    {/* Word PLAY */}
                    <span className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-black uppercase tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)]">
                      PLAY
                    </span>

                    {/* Circular Play Button */}
                    <div
                      onClick={togglePlay}
                      className="pointer-events-auto flex h-14 w-14 sm:h-20 sm:w-20 md:h-24 md:w-24 shrink-0 items-center justify-center rounded-full bg-white text-[#1a1814] shadow-[0_10px_35px_rgba(0,0,0,0.6)] transition-all duration-300 hover:scale-110 hover:bg-[#f5f0e6] active:scale-95 cursor-pointer"
                    >
                      <Play className="h-6 w-6 sm:h-9 sm:w-9 md:h-11 md:w-11 fill-[#1a1814] text-[#1a1814] translate-x-0.5" />
                    </div>

                    {/* Word REEL */}
                    <span className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-black uppercase tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)]">
                      REEL
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Once played, if paused: show only a clean resume play button (NO 'PLAY REEL' title and NO pause button when playing) */}
              {hasPlayed && !isPlaying && (
                <motion.div
                  key="resume-play-overlay"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center select-none"
                >
                  <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-white/90 backdrop-blur-md text-[#1a1814] shadow-2xl transition-transform duration-200 group-hover:scale-105">
                    <Play className="h-7 w-7 sm:h-9 sm:w-9 fill-[#1a1814] text-[#1a1814] translate-x-0.5" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom-Right Controls: Speed Badge + Audio Toggle */}
            <div className="absolute bottom-6 right-6 z-30 flex items-center gap-2.5">
              {/* Increased Video Speed Badge & Quick Switcher */}
              <button
                type="button"
                id="house-tour-speed-toggle"
                onClick={cycleSpeed}
                title="Fast Video • Normal Audio (Click to cycle speed)"
                className="flex items-center gap-1.5 rounded-full bg-black/50 backdrop-blur-md px-3 py-1.5 text-xs font-semibold text-white border border-white/20 transition-all hover:bg-black/75 hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
              >
                <Gauge className="h-3.5 w-3.5 text-[#0044FF]" />
                <span>{videoSpeed}x Video • 1.0x Audio</span>
              </button>

              {/* Sound Toggle */}
              <button
                type="button"
                id="house-tour-audio-toggle"
                onClick={toggleMute}
                aria-label={isMuted ? "Unmute house tour" : "Mute house tour"}
                className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-black/50 backdrop-blur-md text-white border border-white/20 transition-all hover:bg-black/75 hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4 sm:h-5 sm:w-5 text-white/80" />
                ) : (
                  <Volume2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400" />
                )}
              </button>
            </div>
          </motion.div>
        </div>

        {/* Bottom subtle indicator */}
        <motion.div
          style={{ opacity: headlineOpacity }}
          className="pointer-events-none absolute bottom-6 left-8 z-20 hidden sm:flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-[#1a1814]/40"
        >
          <span>Roomie Signature Living</span>
          <span>•</span>
          <span>Kinetic Showcase</span>
        </motion.div>
      </div>
    </section>
  );
}

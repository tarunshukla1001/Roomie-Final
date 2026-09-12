import { useState, useLayoutEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { gsap } from "../animations/gsap";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const containerRef = useRef(null);
  const pathRef = useRef(null);
  const cursorRef = useRef(null);
  const scrollIndicatorRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const path = pathRef.current;
      const cursor = cursorRef.current;
      const indicator = scrollIndicatorRef.current;

      if (!path || !cursor || !indicator) return;

      const pathLength = path.getTotalLength();

      // Hide the SVG line initially
      gsap.set(path, {
        strokeDasharray: pathLength,
        strokeDashoffset: pathLength,
      });

      // Hide cursor initially
      gsap.set(cursor, {
        scale: 0,
        opacity: 0,
      });

      // SHOW scroll indicator initially
      gsap.set(indicator, {
        opacity: 1,
        y: 0,
      });

      // Scroll-controlled animation
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.7,

          onUpdate: (self) => {
            // Get current position on the SVG path
            const point = path.getPointAtLength(
              self.progress * pathLength
            );

            // Move glowing cursor along the line
            gsap.set(cursor, {
              x: point.x,
              y: point.y,
              opacity:
                self.progress > 0 && self.progress < 1 ? 1 : 0,
              scale:
                self.progress > 0 && self.progress < 1 ? 1 : 0,
            });

            // -----------------------------------------
            // SCROLL INDICATOR BEHAVIOR
            // -----------------------------------------
            // At the very top:
            //     Scroll Down = visible
            //
            // As soon as scrolling starts:
            //     Scroll Down = hidden
            // -----------------------------------------

            if (self.progress <= 0.001) {
              gsap.to(indicator, {
                opacity: 1,
                y: 0,
                duration: 0.2,
                overwrite: "auto",
              });
            } else {
              gsap.to(indicator, {
                opacity: 0,
                y: 10,
                duration: 0.2,
                overwrite: "auto",
              });
            }
          },
        },
      });

      // Draw the blue line as the user scrolls
      tl.to(
        path,
        {
          strokeDashoffset: 0,
          duration: 1,
          ease: "none",
        },
        0
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  async function onSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      await login(form);
      navigate("/stays");
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || "Login failed. Please try again.");
    }
  }

  return (
    <main
      ref={containerRef}
      className="relative h-[250vh] bg-[#f5f0e6]"
      data-wash="#f5f0e6"
    >
      <div
        className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden"
        style={{ perspective: 1200 }}
      >
        {/* Wide Blue Wrapping Line Layer & Glowing Cursor */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0 overflow-hidden">
          <svg
            className="overflow-visible"
            width="1400"
            height="800"
            viewBox="-700 -400 1400 800"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              ref={pathRef}
              d="M-700,0 C-400,-500 -200,450 0,0 C200,-450 400,500 700,0"
              stroke="#0044FF"
              strokeWidth="24"
              strokeLinecap="round"
              style={{
                filter:
                  "drop-shadow(0px 10px 20px rgba(0, 68, 255, 0.4))",
              }}
            />

            {/* Glowing Cursor */}
            <g
              ref={cursorRef}
              className="transition-opacity duration-200"
            >
              <circle
                r="28"
                fill="#0044FF"
                opacity="0.25"
                className="animate-ping"
              />

              <circle
                r="16"
                fill="#0044FF"
                opacity="0.4"
              />

              <circle
                r="8"
                fill="#ffffff"
                style={{
                  filter:
                    "drop-shadow(0px 0px 10px #0044FF)",
                }}
              />
            </g>
          </svg>
        </div>

        {/* Login Content */}
        <div className="relative z-10 w-full max-w-lg px-6">
          <h1 className="text-5xl md:text-7xl font-display text-[#0f0f0f]">
            Welcome back.
          </h1>

          <form
            onSubmit={onSubmit}
            className="mt-10 space-y-5"
          >
            <input
              required
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(event) =>
                setForm({
                  ...form,
                  email: event.target.value,
                })
              }
              className="w-full rounded-2xl bg-white px-4 py-3 outline-none text-black shadow-sm"
            />

            <div className="relative">
            <input
              required
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              onChange={(event) =>
                setForm({
                  ...form,
                  password: event.target.value,
                })
              }
              className="w-full rounded-2xl bg-white px-4 py-3 pr-12 outline-none text-black shadow-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b6b73] hover:text-[#0f0f0f] transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              )}
            </button>
          </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-[#0f0f0f] text-white py-3 font-medium transition-transform active:scale-[0.99]"
            >
              Login
            </button>

            {error && (
              <p className="text-sm text-red-600">
                {error}
              </p>
            )}
          </form>

          <p className="mt-6 text-[#6b6b73]">
            New here?{" "}
            <Link
              to="/register"
              className="underline text-black font-medium"
            >
              Create an account
            </Link>
          </p>
        </div>

        {/* Scroll Down Indicator */}
        <div
          ref={scrollIndicatorRef}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none"
        >
          <span className="text-xs uppercase tracking-[0.2em] text-[#6b6b73] mb-2 font-medium">
            Scroll Up
          </span>

          <div className="w-6 h-10 border-2 border-[#0f0f0f]/30 rounded-full flex justify-center p-1">
            <div className="w-1.5 h-3 bg-[#0f0f0f] rounded-full animate-bounce" />
          </div>
        </div>
      </div>
    </main>
  );
}
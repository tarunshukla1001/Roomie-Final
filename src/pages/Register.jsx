import { useState, useLayoutEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { sendOtp, verifyOtp } from "../services/api";
import { gsap } from "../animations/gsap";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [creatingAccount, setCreatingAccount] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER",
  });
  const [showPassword, setShowPassword] = useState(false);

  const containerRef = useRef(null);
  const pathRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const path = pathRef.current;
      if (!path) return;

      const pathLength = path.getTotalLength();

      gsap.set(path, {
        strokeDasharray: pathLength,
        strokeDashoffset: pathLength,
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.7,
        },
      });

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

  function handleEmailChange(event) {
    const email = event.target.value;

    setForm({
      ...form,
      email,
    });

    // If email changes, previous verification becomes invalid
    setEmailVerified(false);
    setOtpSent(false);
    setOtp("");
    setMessage("");
  }

  async function handleSendOtp() {
    setError("");
    setMessage("");

    if (!form.email) {
      setError("Please enter your email first.");
      return;
    }

    setSendingOtp(true);

    try {
      await sendOtp(form.email);

      setOtpSent(true);

      setMessage(
        "OTP sent to your email. Check your inbox."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data ||
        "Could not send OTP."
      );
    } finally {
      setSendingOtp(false);
    }
  }

  async function handleVerifyOtp() {
    setError("");
    setMessage("");

    if (!otp || otp.length !== 6) {
      setError("Enter the 6-digit OTP.");
      return;
    }

    setVerifyingOtp(true);

    try {
      await verifyOtp(form.email, otp);

      setEmailVerified(true);

      setMessage(
        "Email verified successfully."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data ||
        "Invalid OTP."
      );
    } finally {
      setVerifyingOtp(false);
    }
  }

  async function onSubmit(event) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!emailVerified) {
      setError(
        "Please verify your email with OTP before creating your account."
      );
      return;
    }

    setCreatingAccount(true);

    try {
      await register(form);

      navigate("/stays");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Could not create your account."
      );
    } finally {
      setCreatingAccount(false);
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

        {/* Flowing Wave Line */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0 overflow-hidden opacity-80">
          <svg
            className="w-[200vw] h-[60vh] overflow-visible"
            viewBox="0 0 1200 300"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <path
              ref={pathRef}
              d="M 0 150 Q 300 20, 600 150 T 1200 150"
              stroke="#ff3399"
              strokeWidth="16"
              strokeLinecap="round"
              style={{
                filter:
                  "drop-shadow(0px 10px 20px rgba(255, 51, 153, 0.3))",
              }}
            />
          </svg>
        </div>

        {/* Register Content */}
        <div className="relative z-10 w-full max-w-lg px-6">

          <h1 className="text-5xl md:text-7xl font-display text-[#0f0f0f]">
            Join Roomie.
          </h1>

          <form
            onSubmit={onSubmit}
            className="mt-10 space-y-5"
          >

            {/* Name */}
            <input
              required
              type="text"
              placeholder="Name"
              value={form.name}
              onChange={(event) =>
                setForm({
                  ...form,
                  name: event.target.value,
                })
              }
              className="w-full rounded-2xl bg-white px-4 py-3 outline-none text-black shadow-sm"
            />

            {/* Email + Send OTP */}
            <div className="flex gap-2">

              <input
                required
                type="email"
                placeholder="Email"
                value={form.email}
                disabled={emailVerified}
                onChange={handleEmailChange}
                className="flex-1 rounded-2xl bg-white px-4 py-3 outline-none text-black shadow-sm disabled:bg-gray-100"
              />

              <button
                type="button"
                onClick={handleSendOtp}
                disabled={
                  sendingOtp ||
                  emailVerified ||
                  !form.email
                }
                className="rounded-2xl bg-[#0f0f0f] text-white px-4 py-3 whitespace-nowrap disabled:opacity-50"
              >
                {sendingOtp
                  ? "Sending..."
                  : emailVerified
                  ? "Verified ✓"
                  : otpSent
                  ? "Resend OTP"
                  : "Send OTP"}
              </button>

            </div>

            {/* OTP */}
            {otpSent && !emailVerified && (
              <div className="flex gap-2">

                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(event) =>
                    setOtp(
                      event.target.value
                        .replace(/\D/g, "")
                        .slice(0, 6)
                    )
                  }
                  className="flex-1 rounded-2xl bg-white px-4 py-3 outline-none text-black shadow-sm"
                />

                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={
                    verifyingOtp ||
                    otp.length !== 6
                  }
                  className="rounded-2xl bg-[#ff3399] text-white px-5 py-3 disabled:opacity-50"
                >
                  {verifyingOtp
                    ? "Checking..."
                    : "Verify"}
                </button>

              </div>
            )}

            {/* Password */}
            <div className="relative">
              <input
                required
                minLength={6}
                type={showPassword ? "text" : "password"}
                placeholder="Password (min 6 chars)"
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

            {/* Role */}
            <select
              value={form.role}
              onChange={(event) =>
                setForm({
                  ...form,
                  role: event.target.value,
                })
              }
              className="w-full rounded-2xl bg-white px-4 py-3 outline-none text-black shadow-sm"
            >
              <option value="USER">
                I am looking for a room
              </option>

              <option value="OWNER">
                I list properties
              </option>
            </select>

            {/* Create Account */}
            <button
              type="submit"
              disabled={
                creatingAccount ||
                !emailVerified
              }
              className="w-full rounded-2xl bg-[#0f0f0f] text-white py-3 font-medium transition-transform active:scale-[0.99] disabled:opacity-50"
            >
              {creatingAccount
                ? "Creating account..."
                : emailVerified
                ? "Create account"
                : "Verify email first"}
            </button>

            {message && (
              <p className="text-sm text-green-600">
                {message}
              </p>
            )}

            {error && (
              <p className="text-sm text-red-600">
                {error}
              </p>
            )}

          </form>

          <p className="mt-6 text-[#6b6b73]">
            Already have a bed?{" "}
            <Link
              to="/login"
              className="underline text-black font-medium"
            >
              Login
            </Link>
          </p>

        </div>
      </div>
    </main>
  );
}
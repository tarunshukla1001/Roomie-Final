import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="fixed inset-x-0 top-0 z-40 bg-[#1a1423]/50 backdrop-blur-md border-b border-white/10">
      <nav className="grid grid-cols-[auto_1fr_auto] items-center gap-6 px-4 py-3 md:px-5">
        <p
          to="/"
          className="font-headline text-[15px] font-bold tracking-[-0.04em] text-[#f2e8d8]"
        >
          ROOMIE
        </p>

        <p className="hero-copy hidden justify-self-center text-center md:block text-white/70">
          Affordable PG and rooms — honest monthly prices, stays that still feel
          designed.
        </p>

        <div className="flex items-center gap-2 justify-self-end">
          {user ? (
            <>
              {String(user.role).toUpperCase() === "ADMIN" && (
                <Link to="/admin" className="pill pill-dark">
                  Admin
                </Link>
              )}
              <button type="button" onClick={logout} className="pill pill-light">
                Out
              </button>
            </>
          ) : (
            <Link to="/login" className="pill pill-light">
              Login
            </Link>
          )}
          <Link to="/register" className="pill pill-dark">
            Book a room{" "}
            <span className="h-1.5 w-1.5 rounded-full bg-[#49a79f]" />
          </Link>
          <Link to="/stays" className="pill pill-light">
            Menu
            <span className="flex gap-0.5">
              <span className="h-1 w-1 rounded-full bg-black" />
              <span className="h-1 w-1 rounded-full bg-black" />
            </span>
          </Link>
        </div>
      </nav>
    </header>
  );
}

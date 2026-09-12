import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="px-6 pb-10 pt-16 md:px-10 border-t border-black/10 bg-[#e6dcc8]">
      <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-headline text-5xl tracking-[-0.05em] md:text-7xl text-[#0f0f0f]">ROOMIE</p>
          <p className="mt-5 max-w-sm text-sm text-[#5b5b5b] font-body">
            Affordable PGs and rooms. Designed with the same care as a studio site,
            priced like a student budget.
          </p>
        </div>
        <div className="flex flex-col gap-2 text-sm font-body">
          <Link to="/stays" className="text-[#0f0f0f] hover:text-[#ff5a36] transition-colors">Browse stays</Link>
          <a href="/#prices" className="text-[#0f0f0f] hover:text-[#ff5a36] transition-colors">Price promise</a>
          <Link to="/login" className="text-[#0f0f0f] hover:text-[#ff5a36] transition-colors">Login</Link>
          <Link to="/register" className="text-[#0f0f0f] hover:text-[#ff5a36] transition-colors">Create account</Link>
        </div>
        <div className="text-sm text-[#5b5b5b] font-body">
          <p className="text-[#0f0f0f]">General</p>
          <p className="mt-2 text-[#0f0f0f]">hello@roomie.stay</p>
          <p className="mt-8">© {new Date().getFullYear()} Roomie</p>
        </div>
      </div>
    </footer>
  );
}

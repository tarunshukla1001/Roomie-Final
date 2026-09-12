import { Link } from "react-router-dom";

export default function CTA() {
  return (
    <section className="px-4 pb-8 md:px-6" data-wash="#0f0f0f">
      <div className="stage relative flex min-h-[52vh] flex-col items-start justify-end overflow-hidden p-8 text-white md:p-14">
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0e] via-[#0c0c0e]/70 to-transparent" />
        <p className="relative text-[11px] uppercase tracking-[0.22em] text-[#c8f542]">Ready?</p>
        <h2 className="relative mt-4 max-w-4xl text-4xl leading-[0.95] tracking-[-0.05em] md:text-7xl font-display">
          Is your next room ready to cost less?
        </h2>
        
        {/* Redirects to the login page when clicked */}
        <Link to="/login" className="pill pill-light relative mt-10 text-black magnetic-btn">
          Continue to stays <span className="h-1.5 w-1.5 rounded-full bg-[#2f5bff]" />
        </Link>
        
      </div>
    </section>
  );
}
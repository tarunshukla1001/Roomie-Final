import { priceTiers } from "../data/listings";
import { formatInr } from "../services/api";

export default function PricePromise() {
  return (
    <section id="prices" className="relative px-4 py-8 md:px-6 overflow-hidden" data-wash="#f5f0e6">
      <div className="absolute inset-0 opacity-5">
        <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80" alt="" className="w-full h-full object-cover" />
      </div>
      <div className="relative grid gap-3 md:grid-cols-3">
        {priceTiers.map((tier) => (
          <article
            key={tier.name}
            className="rounded-[28px] bg-white/90 p-8 backdrop-blur-sm transition-all duration-700 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#ff5a36]/10 border border-black/5"
          >
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#7c3aed] font-mono">{tier.name}</p>
            <p className="mt-10 font-headline text-5xl tracking-[-0.05em] text-[#ff5a36]">
              {formatInr(tier.from)}
            </p>
            <p className="mt-2 text-sm text-[#5b5b5b] font-body">per month, starting</p>
            <p className="mt-8 text-[#0f0f0f]/80 font-body">{tier.note}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

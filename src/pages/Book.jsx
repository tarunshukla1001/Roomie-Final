import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createBooking, fetchStay, formatInr } from "../services/api";
import { useAuth } from "../context/AuthContext";

function tomorrow() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

export default function Book() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stay, setStay] = useState(null);
  const [status, setStatus] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    moveIn: tomorrow(),
    moveOut: "",
  });

  useEffect(() => {
    fetchStay(id).then(setStay).catch(() => setStay(null));
  }, [id]);

  if (!stay) return <main className="px-6 py-40">Loading stay…</main>;

  const minMoveOut = form.moveIn
    ? new Date(new Date(`${form.moveIn}T00:00:00`).getTime() + 86400000)
        .toISOString().slice(0, 10)
    : "";

  async function onSubmit(event) {
    event.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }
    if (!form.moveIn || !form.moveOut) {
      setStatus("Please select both move-in and move-out dates.");
      return;
    }
    if (form.moveOut <= form.moveIn) {
      setStatus("Move-out must be after move-in.");
      return;
    }
    setStatus("Holding your bed…");
    try {
      const result = await createBooking({
        roomId: stay.roomId,
        startDate: form.moveIn,
        endDate: form.moveOut,
      });
      setStatus(`Booked. Status ${result.status || "PENDING"}.`);
      setTimeout(() => navigate(`/stays/${stay.id}`), 1600);
    } catch (error) {
      setStatus(error.response?.data?.message || "Could not book. Login and try again.");
    }
  }

  return (
    <main className="mx-auto grid max-w-6xl gap-12 px-6 pb-24 pt-32 md:grid-cols-2 md:px-10">
      <div>
        <p className="kicker text-[#ff5a36]">Booking</p>
        <h1 className="mt-4 text-5xl md:text-7xl">{stay.title}</h1>
        <p className="mt-6 text-[#5b5168]">
          {stay.area}, {stay.city}
        </p>
        <p className="mt-8 font-headline text-4xl text-[#7c3aed]">{formatInr(stay.price)} / month</p>
        <img src={stay.image} alt="" className="mt-10 h-56 w-full max-w-md rounded-[22px] object-cover" />
      </div>

      <form onSubmit={onSubmit} className="rounded-[28px] bg-white p-8">
        {["name", "email", "phone"].map((field) => (
          <label key={field} className="mb-5 block font-mono text-[11px] uppercase tracking-[0.18em] text-[#5b5168]">
            {field}
            <input
              required
              type={field === "email" ? "email" : "text"}
              value={form[field]}
              onChange={(event) => setForm({ ...form, [field]: event.target.value })}
              className="mt-2 w-full rounded-2xl bg-[color:var(--paper)] px-4 py-3 text-base tracking-normal outline-none"
            />
          </label>
        ))}
        <label className="mb-5 block font-mono text-[11px] uppercase tracking-[0.18em] text-[#5b5168]">
          Move-in date
          <input
            required
            type="date"
            min={tomorrow()}
            value={form.moveIn}
            onChange={(event) => setForm({ ...form, moveIn: event.target.value })}
            className="mt-2 w-full rounded-2xl bg-[color:var(--paper)] px-4 py-3 text-base outline-none"
          />
        </label>
        <label className="mb-8 block font-mono text-[11px] uppercase tracking-[0.18em] text-[#5b5168]">
          Move-out date
          <input
            required
            type="date"
            min={minMoveOut}
            value={form.moveOut}
            onChange={(event) => setForm({ ...form, moveOut: event.target.value })}
            className="mt-2 w-full rounded-2xl bg-[color:var(--paper)] px-4 py-3 text-base outline-none"
          />
        </label>
        <button className="pill pill-dark w-full justify-center">
          {user ? "Confirm hold" : "Login to book"}
        </button>
        {status && <p className="mt-4 text-sm text-[#5b5168]">{status}</p>
}
        <Link to={`/stays/${stay.id}`} className="mt-6 block text-center text-sm text-[#5b5168]">
          Back to stay
        </Link>
      </form>
    </main>
  );
}

import axios from "axios";
import { fillImages } from "../data/listings";

const BASE = import.meta.env.DEV
  ? "" // Keeps your local Vite proxy working for testing on your machine
  : "https://roomie-final-production.up.railway.app"; // Forces Netlify to use your live Railway backend

const client = axios.create({
  baseURL: BASE,
  timeout: 60000,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("roomie_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function persistAuth(data, fallbackEmail) {
  const token = data.token;
  const user = {
    id: data.userId ?? data.user?.id,
    name: data.name ?? data.user?.name,
    email: data.email ?? data.user?.email ?? fallbackEmail,
    role: data.role ?? data.user?.role,
  };
  if (token) localStorage.setItem("roomie_token", token);
  localStorage.setItem("roomie_user", JSON.stringify(user));
  return { token, user };
}

function imageFor(id) {
  const n = Number(id);
  const index = Number.isFinite(n) ? n : [...String(id)].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return fillImages[Math.abs(index) % fillImages.length] || fillImages[0];
}

export function normalizeStay(raw, rooms = []) {
  if (!raw || typeof raw !== "object") return raw;
  const id = String(raw.id ?? "");
  const price = Number(raw.monthlyRent ?? raw.price ?? raw.rent ?? 0);
  const firstRoom = rooms[0] ?? raw.rooms?.[0];
  return {
    id,
    title: raw.name ?? raw.title ?? "Stay",
    city: raw.city ?? "",
    area: raw.address ?? raw.area ?? "",
    type: firstRoom?.roomType ?? raw.roomType ?? "PG",
    gender: "Any",
    price,
    originalPrice: Math.round(price * 1.45),
    tags: [raw.city, firstRoom?.roomType].filter(Boolean),
    rating: 4.7,
    reviews: 24 + (Number(raw.id) || 0) * 3,
    bedsLeft: Math.max(1, rooms.length || 1),
    image: imageFor(id),
    gallery: fillImages.slice(0, 4),
    amenities: [
      firstRoom?.furnishing ? "Furnished" : null,
      firstRoom?.parking ? "Parking" : null,
      "WiFi",
      "Housekeeping",
    ].filter(Boolean),
    description: raw.description ?? "",
    roomId: firstRoom?.id ?? Number(id),
    rooms,
    deposit: firstRoom?.securityDeposit,
  };
}

export function formatInr(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export async function fetchStays(filters = {}) {
  const params = {};
  if (filters.city) params.city = filters.city;
  if (filters.q) params.q = filters.q;
  const { data } = await client.get("/api/properties", { params });
  return (Array.isArray(data) ? data : []).map((item) => normalizeStay(item));
}

export async function fetchStay(id) {
  const [{ data: property }, roomsRes] = await Promise.all([
    client.get(`/api/properties/${id}`),
    client.get(`/api/properties/${id}/rooms`).catch(() => ({ data: [] })),
  ]);
  const rooms = Array.isArray(roomsRes.data) ? roomsRes.data : [];
  return normalizeStay(property, rooms);
}

export async function login(payload) {
  const { data } = await client.post("/api/auth/login", {
    email: payload.email,
    password: payload.password,
  });
  return persistAuth(data, payload.email);
}

export async function register(payload) {
  const { data } = await client.post("/api/auth/register", {
    name: payload.name,
    email: payload.email,
    password: payload.password,
    role: payload.role === "OWNER" ? "OWNER" : "USER",
  });

  return persistAuth(data, payload.email);
}

export async function createBooking(payload) {
  const { data } = await client.post("/api/bookings", {
    startDate: payload.startDate,
    endDate: payload.endDate,
    roomId: payload.roomId,
  });
  return data;
}

export async function fetchRoomBookings(roomId) {
  const { data } = await client.get(`/api/bookings/room/${roomId}`);
  return data;
}

export async function askGemini(message) {
  const encoded = encodeURIComponent(message);
  try {
    const { data } = await client.get(`/api/Gemini/${encoded}`);
    return data;
  } catch (error) {
    if (error.response) {
      const data = error.response.data;
      const msg = typeof data === "string" ? data : data?.message || JSON.stringify(data);
      throw new Error(msg || `Server error: ${error.response.status}`);
    }
    throw new Error(error.message || "Network error - is the backend running?");
  }
}
export async function trackVisit(visitorId, page) {
  const { data } = await client.post("/api/visits", null, {
    params: {
      visitorId,
      page,
    },
  });

  return data;
}
export async function sendOtp(email) {
  const { data } = await client.post("/api/otp/send", null, {
    params: {
      email,
    },
  });

  return data;
}

export async function verifyOtp(email, otp) {
  const { data } = await client.post("/api/otp/verify", null, {
    params: {
      email,
      otp,
    },
  });

  return data;
}
export async function fetchAdminAnalytics() {
  const { data } = await client.get("/api/admin/analytics");
  return data;
}

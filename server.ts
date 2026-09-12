import express from "express";
import type { Request, Response, NextFunction } from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "VGhpc0lzQVN1ZmZpY2llbnRseUxvbmdTZWNyZXRLZXlGb3JQZ0Jvb2tpbmc=";

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface User {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  role: "USER" | "OWNER";
}

interface Property {
  id: number;
  name: string;
  description: string;
  address: string;
  city: string;
  monthlyRent: number;
  ownerId: number;
}

interface Room {
  id: number;
  propertyId: number;
  address: string;
  description: string;
  roomType: string;
  area: number;
  securityDeposit: number;
  furnishing: boolean;
  parking: number;
  floorNumber: number;
}

interface Booking {
  id: number;
  userId: number;
  roomId: number;
  startdate: string;
  enddate: string;
  status: string;
}

// In-Memory Storage
const users: User[] = [];
const properties: Property[] = [];
const rooms: Room[] = [];
const bookings: Booking[] = [];

let nextUserId = 1;
let nextPropertyId = 1;
let nextRoomId = 1;
let nextBookingId = 1;

// Seed initial catalog data
function seedData() {
  const ownerPasswordHash = bcrypt.hashSync("owner123", 10);
  const owner: User = {
    id: nextUserId++,
    name: "PgBooking Owner",
    email: "owner@pgbooking.local",
    passwordHash: ownerPasswordHash,
    role: "ADMIN",
  };
  users.push(owner);

  // Tarun's admin account
  const tarunPasswordHash = bcrypt.hashSync("01031810Tt@", 10);
  const tarunAdmin: User = {
    id: nextUserId++,
    name: "Tarun Shukla",
    email: "tarunshukla1001@gmail.com",
    passwordHash: tarunPasswordHash,
    role: "ADMIN",
  };
  users.push(tarunAdmin);

  function addStay(
    name: string,
    description: string,
    address: string,
    city: string,
    rent: number,
    roomType: string
  ) {
    const propId = nextPropertyId++;
    const property: Property = {
      id: propId,
      name,
      description,
      address,
      city,
      monthlyRent: rent,
      ownerId: owner.id,
    };
    properties.push(property);

    const room: Room = {
      id: nextRoomId++,
      propertyId: propId,
      address: `${address}, ${city}`,
      description,
      roomType,
      area: 180,
      securityDeposit: Math.round(rent),
      furnishing: true,
      parking: 1,
      floorNumber: 2,
    };
    rooms.push(room);
  }

  addStay(
    "Koramangala Commons",
    "Bright shared stay two streets from the metro.",
    "Koramangala 5th Block",
    "Bengaluru",
    4999,
    "Shared PG"
  );
  addStay(
    "Hinjewadi Loft",
    "Quiet private room near the IT parks.",
    "Hinjewadi Phase 1",
    "Pune",
    8499,
    "Private"
  );
  addStay(
    "Gachibowli Studio",
    "Compact studio with a kitchenette.",
    "Gachibowli",
    "Hyderabad",
    9999,
    "Studio"
  );
  addStay(
    "Lajpat Twin Stay",
    "Women-only twin stay with home food.",
    "Lajpat Nagar",
    "Delhi",
    5999,
    "Twin"
  );
  addStay(
    "Andheri Work Pod",
    "Shared pod ten minutes from the station.",
    "Andheri East",
    "Mumbai",
    7499,
    "Shared PG"
  );
  addStay(
    "Adyar Nook",
    "Leafy private room for students.",
    "Adyar",
    "Chennai",
    6999,
    "Private"
  );
  addStay(
    "Whitefield Garden PG",
    "Quieter Whitefield stay with a courtyard.",
    "Whitefield",
    "Bengaluru",
    5499,
    "Shared PG"
  );
  addStay(
    "Baner Ridge Rooms",
    "Private rooms close to offices.",
    "Baner",
    "Pune",
    7999,
    "Private"
  );
}

seedData();

const app = express();
app.use(cors());

app.use(express.json());

// Auth Helper
interface AuthPayload {
  email: string;
  userId: number;
}

function generateToken(user: User): string {
  return jwt.sign({ email: user.email, userId: user.id }, JWT_SECRET, {
    expiresIn: "24h",
  });
}

function authenticateToken(
  req: Request & { user?: AuthPayload },
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    req.user = decoded as AuthPayload;
    next();
  });
}

// -------------------------------------------------------------
// Auth Endpoints (/api/auth)
// -------------------------------------------------------------
app.post("/api/auth/register", (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const existing = users.find(
    (u) => u.email.toLowerCase() === String(email).toLowerCase()
  );
  if (existing) {
    return res.status(400).json({ error: "Email already registered" });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const newUser: User = {
    id: nextUserId++,
    name: name || "User",
    email: email.trim(),
    passwordHash,
    role: role === "ADMIN" ? "ADMIN" : role === "OWNER" ? "OWNER" : "USER",
  };
  users.push(newUser);

  const token = generateToken(newUser);
  return res.json({
    token,
    userId: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
  });
});

app.post("/api/auth/login", (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const user = users.find(
    (u) => u.email.toLowerCase() === String(email).trim().toLowerCase()
  );
  if (!user) {
    return res.status(400).json({ error: "Invalid email or password" });
  }

  const valid = bcrypt.compareSync(password, user.passwordHash);
  if (!valid) {
    return res.status(400).json({ error: "Invalid email or password" });
  }

  const token = generateToken(user);
  return res.json({
    token,
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
});

app.get(
  "/api/auth/me",
  authenticateToken,
  (req: Request & { user?: AuthPayload }, res: Response) => {
    const user = users.find((u) => u.id === req.user?.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const token = generateToken(user);
    return res.json({
      token,
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  }
);

// -------------------------------------------------------------
// Property Endpoints (/api/properties)
// -------------------------------------------------------------
app.get("/api/properties", (req: Request, res: Response) => {
  const city = typeof req.query.city === "string" ? req.query.city.trim() : "";
  const query = typeof req.query.q === "string" ? req.query.q.trim() : "";

  let result = properties;

  if (city) {
    result = result.filter(
      (p) => p.city.toLowerCase() === city.toLowerCase()
    );
  }

  if (query) {
    const needle = query.toLowerCase();
    result = result.filter((p) => {
      const blob = `${p.name} ${p.address} ${p.city} ${p.description}`.toLowerCase();
      return blob.includes(needle);
    });
  }

  return res.json(result);
});

app.get("/api/properties/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const property = properties.find((p) => p.id === id);
  if (!property) {
    return res.status(404).json({ error: "Property not found" });
  }
  return res.json(property);
});

app.get("/api/properties/:id/rooms", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const propertyRooms = rooms.filter((r) => r.propertyId === id);
  return res.json(propertyRooms);
});

app.post(
  "/api/properties",
  authenticateToken,
  (req: Request & { user?: AuthPayload }, res: Response) => {
    const { name, description, address, city, monthlyRent } = req.body;
    const property: Property = {
      id: nextPropertyId++,
      name: name || "New Property",
      description: description || "",
      address: address || "",
      city: city || "",
      monthlyRent: Number(monthlyRent) || 0,
      ownerId: req.user?.userId || 1,
    };
    properties.push(property);
    return res.status(201).json(property);
  }
);

app.put("/api/properties/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const property = properties.find((p) => p.id === id);
  if (!property) {
    return res.status(404).json({ error: "Property not found" });
  }
  const { name, description, address, city, monthlyRent } = req.body;
  if (name !== undefined) property.name = name;
  if (description !== undefined) property.description = description;
  if (address !== undefined) property.address = address;
  if (city !== undefined) property.city = city;
  if (monthlyRent !== undefined) property.monthlyRent = Number(monthlyRent);
  return res.json(property);
});

app.delete("/api/properties/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const idx = properties.findIndex((p) => p.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Property not found" });
  }
  properties.splice(idx, 1);
  return res.json({ message: "Property deleted successfully" });
});

// -------------------------------------------------------------
// Room Endpoints (/api/rooms)
// -------------------------------------------------------------
app.get("/api/rooms", (_req: Request, res: Response) => {
  return res.json(rooms);
});

app.get("/api/rooms/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const room = rooms.find((r) => r.id === id);
  if (!room) {
    return res.status(404).json({ error: "Room not found" });
  }
  return res.json(room);
});

app.post("/api/rooms", (req: Request, res: Response) => {
  const propertyId = Number(req.query.propertyId || req.body.propertyId);
  const room: Room = {
    id: nextRoomId++,
    propertyId,
    address: req.body.address || "",
    description: req.body.description || "",
    roomType: req.body.roomType || "Shared PG",
    area: Number(req.body.area) || 180,
    securityDeposit: Number(req.body.securityDeposit) || 0,
    furnishing: Boolean(req.body.furnishing),
    parking: Number(req.body.parking) || 0,
    floorNumber: Number(req.body.floorNumber) || 1,
  };
  rooms.push(room);
  return res.status(201).json(room);
});

app.put("/api/rooms/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const room = rooms.find((r) => r.id === id);
  if (!room) {
    return res.status(404).json({ error: "Room not found" });
  }
  Object.assign(room, req.body);
  return res.json(room);
});

app.delete("/api/rooms/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const idx = rooms.findIndex((r) => r.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Room not found" });
  }
  rooms.splice(idx, 1);
  return res.json({ message: "Room deleted successfully" });
});

// -------------------------------------------------------------
// Booking Endpoints (/api/bookings)
// -------------------------------------------------------------
app.post(
  "/api/bookings",
  authenticateToken,
  (req: Request & { user?: AuthPayload }, res: Response) => {
    const { startDate, endDate, roomId } = req.body;

    if (!startDate || !endDate || !roomId) {
      return res
        .status(400)
        .json({ error: "startDate, endDate, and roomId are required" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: "Invalid dates provided" });
    }

    if (end <= start) {
      return res
        .status(400)
        .json({ error: "End date must be after start date" });
    }

    const room = rooms.find((r) => r.id === Number(roomId));
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    // Check overlapping bookings
    const overlapping = bookings.some((b) => {
      if (b.roomId !== room.id || b.status === "CANCELLED") return false;
      const bStart = new Date(b.startdate);
      const bEnd = new Date(b.enddate);
      return bStart < end && bEnd > start;
    });

    if (overlapping) {
      return res
        .status(400)
        .json({ error: "Room is already booked for these dates" });
    }

    const booking: Booking = {
      id: nextBookingId++,
      userId: req.user?.userId || 1,
      roomId: room.id,
      startdate: startDate,
      enddate: endDate,
      status: "CONFIRMED",
    };
    bookings.push(booking);

    return res.status(201).json(booking);
  }
);

// -------------------------------------------------------------
// User Endpoints (/api/users)
// -------------------------------------------------------------
app.get("/api/users", (_req: Request, res: Response) => {
  const safeUsers = users.map(({ passwordHash: _, ...rest }) => rest);
  return res.json(safeUsers);
});

app.get("/api/users/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const user = users.find((u) => u.id === id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  const { passwordHash: _, ...rest } = user;
  return res.json(rest);
});

// -------------------------------------------------------------
// Gemini AI Endpoint (/api/Gemini)
// -------------------------------------------------------------
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

app.get("/api/Gemini/:message", async (req: Request, res: Response) => {
  try {
   const message = decodeURIComponent(String(req.params.message));
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ error: "Gemini API key not configured" });
    }

    const modelName = "gemini-3.6-flash";
    const model = genAI.getGenerativeModel({ model: modelName });
    
    // Build dynamic context from actual Roomie data
    const cityNames = [...new Set(properties.map(p => p.city))].sort();
    const roomTypes = [...new Set(rooms.map(r => r.roomType))].sort();
    const priceRange = properties.length > 0 
      ? `₹${Math.min(...properties.map(p => p.monthlyRent))} - ₹${Math.max(...properties.map(p => p.monthlyRent))}/month`
      : "₹4,999 - ₹9,999/month";
    
    const propertyList = properties.map(p => 
      `- ${p.name} (${p.city}, ${p.address}): ${p.description} — ₹${p.monthlyRent}/month [${rooms.find(r => r.propertyId === p.id)?.roomType}]`
    ).join('\n');

    const systemPrompt = `You are RoomieAI, the official AI assistant for Roomie (roomie.app) - India's trusted platform for finding verified PGs, hostels, and shared accommodations.

=== ROOMIE PLATFORM DATA (USE THIS EXACT INFO) ===

CITIES WE OPERATE IN: ${cityNames.join(', ')}

ROOM TYPES AVAILABLE: ${roomTypes.join(', ')}

PRICE RANGE: ${priceRange}

ALL CURRENT PROPERTIES:
${propertyList}

AMENITIES INCLUDED: Furnished rooms, Parking, WiFi, Housekeeping, Security deposit (typically 1 month rent)

BOOKING PROCESS:
1. Browse properties on /stays page
2. View details on property page
3. Click "Book a room" → redirects to /login if not authenticated
4. After login, confirm booking with dates
5. Pay security deposit + first month rent

KEY FEATURES:
- Honest monthly prices (no hidden fees)
- Verified properties with real photos
- Direct owner listings
- Student & professional friendly
- Women-only options available (e.g., Lajpat Twin Stay in Delhi)

RESPONSE GUIDELINES:
- ONLY use the data above - do not hallucinate other properties/cities
- Be concise, friendly, and helpful
- Use Indian context (INR, local terms like "PG", "flatmate", "metro")
- If asked about unavailable city/property, say "We currently operate in [cities]. Check back soon for [city]!"
- For pricing questions, reference the exact prices above
- For booking help, explain the 5-step process above`;

    const result = await model.generateContent([
      { text: systemPrompt },
      { text: message }
    ]);

    const response = await result.response;
    const text = response.text();
    
    res.json(text);
  } catch (error) {
    console.error("Gemini API error:", error);
    res.status(500).json({ error: "Failed to get response from AI" });
  }
});

// -------------------------------------------------------------
// OTP Endpoints (Real Email via Nodemailer)
// -------------------------------------------------------------
const otpStore = new Map<string, { otp: string; expires: number }>();

app.post("/api/otp/send", async (req: Request, res: Response) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(email as string, { otp, expires: Date.now() + 5 * 60 * 1000 });

  try {
    await transporter.sendMail({
      from: `"Roomie" <${process.env.SMTP_USER}>`,
      to: email as string,
      subject: "Your Roomie Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0044FF;">Roomie - Email Verification</h2>
          <p>Your OTP code is:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1a1814; margin: 20px 0;">${otp}</div>
          <p style="color: #666;">This code expires in 5 minutes.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999;">If you didn't request this, please ignore.</p>
        </div>
      `,
    });
    console.log(`[OTP] Sent to ${email}: ${otp}`);
    res.json({ success: true, message: "OTP sent to email" });
  } catch (err) {
    console.error("Email send error:", err);
    res.status(500).json({ error: "Failed to send OTP email" });
  }
});

app.post("/api/otp/verify", (req: Request, res: Response) => {
  const { email, otp } = req.query;
  if (!email || !otp) {
    return res.status(400).json({ error: "Email and OTP are required" });
  }
  const record = otpStore.get(email as string);
  if (!record) {
    return res.status(400).json({ error: "OTP not found or expired" });
  }
  if (record.expires < Date.now()) {
    otpStore.delete(email as string);
    return res.status(400).json({ error: "OTP expired" });
  }
  if (record.otp !== otp) {
    return res.status(400).json({ error: "Invalid OTP" });
  }
  otpStore.delete(email as string);
  res.json({ success: true, message: "OTP verified" });
});

// -------------------------------------------------------------
// Visit Tracking
// -------------------------------------------------------------
interface VisitRecord {
  visitorId: string;
  page: string;
  timestamp: number;
  userId?: number;
}

const visits: VisitRecord[] = [];

app.post("/api/visits", (req: Request, res: Response) => {
  const { visitorId, page } = req.query;
  if (!visitorId || !page) {
    return res.status(400).json({ error: "visitorId and page are required" });
  }

  const token = req.headers["authorization"]?.split(" ")[1];
  let userId: number | undefined;
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
      userId = decoded.userId;
    } catch {
      // Token invalid — treat as anonymous
    }
  }

  visits.push({
    visitorId: visitorId as string,
    page: page as string,
    timestamp: Date.now(),
    userId,
  });

  res.json({ success: true });
});

// -------------------------------------------------------------
// Admin Analytics (Protected)
// -------------------------------------------------------------
app.get(
  "/api/admin/analytics",
  authenticateToken,
  (req: Request & { user?: AuthPayload }, res: Response) => {
    const adminUser = users.find((u) => u.id === req.user?.userId);

    if (!adminUser || adminUser.role !== "ADMIN") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const totalVisits = visits.length;
    const uniqueVisitorIds = new Set(visits.map((v) => v.visitorId));
    const uniqueVisitors = uniqueVisitorIds.size;

    const visitsToday = visits.filter(
      (v) => v.timestamp >= todayStart.getTime()
    ).length;

    const loggedInVisits = visits.filter((v) => v.userId !== undefined).length;
    const anonymousVisits = visits.filter((v) => v.userId === undefined).length;

    // Daily visits for last 7 days
    const dailyVisits: { date: string; visits: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      day.setHours(0, 0, 0, 0);
      const dayEnd = new Date(day.getTime() + 86400000);

      const dayVisits = visits.filter(
        (v) => v.timestamp >= day.getTime() && v.timestamp < dayEnd.getTime()
      ).length;

      dailyVisits.push({
        date: day.toISOString().split("T")[0],
        visits: dayVisits,
      });
    }

    // Popular pages
    const pageCounts: Record<string, number> = {};
    for (const v of visits) {
      pageCounts[v.page] = (pageCounts[v.page] || 0) + 1;
    }
    const popularPages = Object.entries(pageCounts)
      .map(([page, count]) => ({ page, visits: count }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 10);

    res.json({
      totalVisits,
      uniqueVisitors,
      visitsToday,
      loggedInVisits,
      anonymousVisits,
      totalUsers: users.length,
      totalProperties: properties.length,
      totalRooms: rooms.length,
      totalBookings: bookings.length,
      dailyVisits,
      popularPages,
    });
  }
);

// -------------------------------------------------------------
// Dev / Production Frontend Serving
// -------------------------------------------------------------
async function startServer() {
  const isProduction = process.env.NODE_ENV === "production";

  if (!isProduction) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      root: process.cwd(),
      server: { middlewareMode: true, hmr: false },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*all", (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Roomie full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_cors = __toESM(require("cors"), 1);
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);
var import_bcryptjs = __toESM(require("bcryptjs"), 1);
var import_path = __toESM(require("path"), 1);
var import_url = require("url");
var import_generative_ai = require("@google/generative-ai");
var import_dotenv = __toESM(require("dotenv"), 1);
var import_nodemailer = __toESM(require("nodemailer"), 1);
var import_meta = {};
import_dotenv.default.config();
var __filename = (0, import_url.fileURLToPath)(import_meta.url);
var __dirname = import_path.default.dirname(__filename);
var JWT_SECRET = process.env.JWT_SECRET || "VGhpc0lzQVN1ZmZpY2llbnRseUxvbmdTZWNyZXRLZXlGb3JQZ0Jvb2tpbmc=";
var transporter = import_nodemailer.default.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});
var users = [];
var properties = [];
var rooms = [];
var bookings = [];
var nextUserId = 1;
var nextPropertyId = 1;
var nextRoomId = 1;
var nextBookingId = 1;
function seedData() {
  const ownerPasswordHash = import_bcryptjs.default.hashSync("owner123", 10);
  const owner = {
    id: nextUserId++,
    name: "PgBooking Owner",
    email: "owner@pgbooking.local",
    passwordHash: ownerPasswordHash,
    role: "ADMIN"
  };
  users.push(owner);
  const tarunPasswordHash = import_bcryptjs.default.hashSync("tarun123", 10);
  const tarunAdmin = {
    id: nextUserId++,
    name: "Tarun Shukla",
    email: "tarunshukla1001@gmail.com",
    passwordHash: tarunPasswordHash,
    role: "ADMIN"
  };
  users.push(tarunAdmin);
  function addStay(name, description, address, city, rent, roomType) {
    const propId = nextPropertyId++;
    const property = {
      id: propId,
      name,
      description,
      address,
      city,
      monthlyRent: rent,
      ownerId: owner.id
    };
    properties.push(property);
    const room = {
      id: nextRoomId++,
      propertyId: propId,
      address: `${address}, ${city}`,
      description,
      roomType,
      area: 180,
      securityDeposit: Math.round(rent),
      furnishing: true,
      parking: 1,
      floorNumber: 2
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
var app = (0, import_express.default)();
app.use((0, import_cors.default)());
app.use(import_express.default.json());
function generateToken(user) {
  return import_jsonwebtoken.default.sign({ email: user.email, userId: user.id }, JWT_SECRET, {
    expiresIn: "24h"
  });
}
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }
  import_jsonwebtoken.default.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    req.user = decoded;
    next();
  });
}
app.post("/api/auth/register", (req, res) => {
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
  const passwordHash = import_bcryptjs.default.hashSync(password, 10);
  const newUser = {
    id: nextUserId++,
    name: name || "User",
    email: email.trim(),
    passwordHash,
    role: role === "ADMIN" ? "ADMIN" : role === "OWNER" ? "OWNER" : "USER"
  };
  users.push(newUser);
  const token = generateToken(newUser);
  return res.json({
    token,
    userId: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role
  });
});
app.post("/api/auth/login", (req, res) => {
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
  const valid = import_bcryptjs.default.compareSync(password, user.passwordHash);
  if (!valid) {
    return res.status(400).json({ error: "Invalid email or password" });
  }
  const token = generateToken(user);
  return res.json({
    token,
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  });
});
app.get(
  "/api/auth/me",
  authenticateToken,
  (req, res) => {
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
      role: user.role
    });
  }
);
app.get("/api/properties", (req, res) => {
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
app.get("/api/properties/:id", (req, res) => {
  const id = Number(req.params.id);
  const property = properties.find((p) => p.id === id);
  if (!property) {
    return res.status(404).json({ error: "Property not found" });
  }
  return res.json(property);
});
app.get("/api/properties/:id/rooms", (req, res) => {
  const id = Number(req.params.id);
  const propertyRooms = rooms.filter((r) => r.propertyId === id);
  return res.json(propertyRooms);
});
app.post(
  "/api/properties",
  authenticateToken,
  (req, res) => {
    const { name, description, address, city, monthlyRent } = req.body;
    const property = {
      id: nextPropertyId++,
      name: name || "New Property",
      description: description || "",
      address: address || "",
      city: city || "",
      monthlyRent: Number(monthlyRent) || 0,
      ownerId: req.user?.userId || 1
    };
    properties.push(property);
    return res.status(201).json(property);
  }
);
app.put("/api/properties/:id", (req, res) => {
  const id = Number(req.params.id);
  const property = properties.find((p) => p.id === id);
  if (!property) {
    return res.status(404).json({ error: "Property not found" });
  }
  const { name, description, address, city, monthlyRent } = req.body;
  if (name !== void 0) property.name = name;
  if (description !== void 0) property.description = description;
  if (address !== void 0) property.address = address;
  if (city !== void 0) property.city = city;
  if (monthlyRent !== void 0) property.monthlyRent = Number(monthlyRent);
  return res.json(property);
});
app.delete("/api/properties/:id", (req, res) => {
  const id = Number(req.params.id);
  const idx = properties.findIndex((p) => p.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Property not found" });
  }
  properties.splice(idx, 1);
  return res.json({ message: "Property deleted successfully" });
});
app.get("/api/rooms", (_req, res) => {
  return res.json(rooms);
});
app.get("/api/rooms/:id", (req, res) => {
  const id = Number(req.params.id);
  const room = rooms.find((r) => r.id === id);
  if (!room) {
    return res.status(404).json({ error: "Room not found" });
  }
  return res.json(room);
});
app.post("/api/rooms", (req, res) => {
  const propertyId = Number(req.query.propertyId || req.body.propertyId);
  const room = {
    id: nextRoomId++,
    propertyId,
    address: req.body.address || "",
    description: req.body.description || "",
    roomType: req.body.roomType || "Shared PG",
    area: Number(req.body.area) || 180,
    securityDeposit: Number(req.body.securityDeposit) || 0,
    furnishing: Boolean(req.body.furnishing),
    parking: Number(req.body.parking) || 0,
    floorNumber: Number(req.body.floorNumber) || 1
  };
  rooms.push(room);
  return res.status(201).json(room);
});
app.put("/api/rooms/:id", (req, res) => {
  const id = Number(req.params.id);
  const room = rooms.find((r) => r.id === id);
  if (!room) {
    return res.status(404).json({ error: "Room not found" });
  }
  Object.assign(room, req.body);
  return res.json(room);
});
app.delete("/api/rooms/:id", (req, res) => {
  const id = Number(req.params.id);
  const idx = rooms.findIndex((r) => r.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Room not found" });
  }
  rooms.splice(idx, 1);
  return res.json({ message: "Room deleted successfully" });
});
app.post(
  "/api/bookings",
  authenticateToken,
  (req, res) => {
    const { startDate, endDate, roomId } = req.body;
    if (!startDate || !endDate || !roomId) {
      return res.status(400).json({ error: "startDate, endDate, and roomId are required" });
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: "Invalid dates provided" });
    }
    if (end <= start) {
      return res.status(400).json({ error: "End date must be after start date" });
    }
    const room = rooms.find((r) => r.id === Number(roomId));
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }
    const overlapping = bookings.some((b) => {
      if (b.roomId !== room.id || b.status === "CANCELLED") return false;
      const bStart = new Date(b.startdate);
      const bEnd = new Date(b.enddate);
      return bStart < end && bEnd > start;
    });
    if (overlapping) {
      return res.status(400).json({ error: "Room is already booked for these dates" });
    }
    const booking = {
      id: nextBookingId++,
      userId: req.user?.userId || 1,
      roomId: room.id,
      startdate: startDate,
      enddate: endDate,
      status: "CONFIRMED"
    };
    bookings.push(booking);
    return res.status(201).json(booking);
  }
);
app.get("/api/users", (_req, res) => {
  const safeUsers = users.map(({ passwordHash: _, ...rest }) => rest);
  return res.json(safeUsers);
});
app.get("/api/users/:id", (req, res) => {
  const id = Number(req.params.id);
  const user = users.find((u) => u.id === id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  const { passwordHash: _, ...rest } = user;
  return res.json(rest);
});
var genAI = new import_generative_ai.GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
app.get("/api/Gemini/:message", async (req, res) => {
  try {
    const message = decodeURIComponent(String(req.params.message));
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ error: "Gemini API key not configured" });
    }
    const modelName = "gemini-3.6-flash";
    const model = genAI.getGenerativeModel({ model: modelName });
    const cityNames = [...new Set(properties.map((p) => p.city))].sort();
    const roomTypes = [...new Set(rooms.map((r) => r.roomType))].sort();
    const priceRange = properties.length > 0 ? `\u20B9${Math.min(...properties.map((p) => p.monthlyRent))} - \u20B9${Math.max(...properties.map((p) => p.monthlyRent))}/month` : "\u20B94,999 - \u20B99,999/month";
    const propertyList = properties.map(
      (p) => `- ${p.name} (${p.city}, ${p.address}): ${p.description} \u2014 \u20B9${p.monthlyRent}/month [${rooms.find((r) => r.propertyId === p.id)?.roomType}]`
    ).join("\n");
    const systemPrompt = `You are RoomieAI, the official AI assistant for Roomie (roomie.app) - India's trusted platform for finding verified PGs, hostels, and shared accommodations.

=== ROOMIE PLATFORM DATA (USE THIS EXACT INFO) ===

CITIES WE OPERATE IN: ${cityNames.join(", ")}

ROOM TYPES AVAILABLE: ${roomTypes.join(", ")}

PRICE RANGE: ${priceRange}

ALL CURRENT PROPERTIES:
${propertyList}

AMENITIES INCLUDED: Furnished rooms, Parking, WiFi, Housekeeping, Security deposit (typically 1 month rent)

BOOKING PROCESS:
1. Browse properties on /stays page
2. View details on property page
3. Click "Book a room" \u2192 redirects to /login if not authenticated
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
var otpStore = /* @__PURE__ */ new Map();
app.post("/api/otp/send", async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }
  const otp = Math.floor(1e5 + Math.random() * 9e5).toString();
  otpStore.set(email, { otp, expires: Date.now() + 5 * 60 * 1e3 });
  try {
    await transporter.sendMail({
      from: `"Roomie" <${process.env.SMTP_USER}>`,
      to: email,
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
      `
    });
    console.log(`[OTP] Sent to ${email}: ${otp}`);
    res.json({ success: true, message: "OTP sent to email" });
  } catch (err) {
    console.error("Email send error:", err);
    res.status(500).json({ error: "Failed to send OTP email" });
  }
});
app.post("/api/otp/verify", (req, res) => {
  const { email, otp } = req.query;
  if (!email || !otp) {
    return res.status(400).json({ error: "Email and OTP are required" });
  }
  const record = otpStore.get(email);
  if (!record) {
    return res.status(400).json({ error: "OTP not found or expired" });
  }
  if (record.expires < Date.now()) {
    otpStore.delete(email);
    return res.status(400).json({ error: "OTP expired" });
  }
  if (record.otp !== otp) {
    return res.status(400).json({ error: "Invalid OTP" });
  }
  otpStore.delete(email);
  res.json({ success: true, message: "OTP verified" });
});
app.post("/api/visits", (req, res) => {
  const { visitorId, page } = req.query;
  console.log(`[Visit] ${visitorId} -> ${page}`);
  res.json({ success: true });
});
app.get("/api/admin/analytics", (req, res) => {
  res.json({
    totalUsers: users.length,
    totalProperties: properties.length,
    totalRooms: rooms.length,
    totalBookings: bookings.length
  });
});
async function startServer() {
  const isProduction = process.env.NODE_ENV === "production";
  if (!isProduction) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      root: process.cwd(),
      server: { middlewareMode: true, hmr: false },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    app.use(import_express.default.static(import_path.default.join(__dirname, "dist")));
    app.get("*all", (_req, res) => {
      res.sendFile(import_path.default.join(__dirname, "dist", "index.html"));
    });
  }
  const PORT = 3e3;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Roomie full-stack server running on http://0.0.0.0:${PORT}`);
  });
}
startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
//# sourceMappingURL=server.cjs.map

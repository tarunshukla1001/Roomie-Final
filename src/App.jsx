import { useEffect, useRef, useState } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { trackVisit } from "./services/api";
import Loader from "./components/Loader";
import Layout from "./components/Layout";
import AdminRoute from "./components/admin/AdminRoute";
import AdminDashboard from "./pages/AdminDashboard";
import Home from "./pages/Home";
import Stays from "./pages/Stays";
import StayDetail from "./pages/StayDetail";
import Book from "./pages/Book";
import Login from "./pages/Login";
import Register from "./pages/Register";

// --------------------------------------------------
// Generate / retrieve anonymous visitor ID
// --------------------------------------------------

function getVisitorId() {
  const existing = localStorage.getItem("roomie_visitor_id");

  if (existing) {
    return existing;
  }

  const visitorId =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).substring(2)}`;

  localStorage.setItem("roomie_visitor_id", visitorId);

  return visitorId;
}

// --------------------------------------------------
// Global page tracking
// --------------------------------------------------

function PageTracker() {
  const location = useLocation();

  const visitorIdRef = useRef(null);
  const lastTrackedPageRef = useRef(null);

  useEffect(() => {
    // Get visitor ID once
    if (!visitorIdRef.current) {
      visitorIdRef.current = getVisitorId();
    }

    const page = location.pathname + location.search;

    // Prevent duplicate tracking of the same route
    if (lastTrackedPageRef.current === page) {
      return;
    }

    lastTrackedPageRef.current = page;

    trackVisit(visitorIdRef.current, page).catch((error) => {
      // Tracking failure should NEVER break the website.
      console.error("Failed to track page visit:", error);
    });
  }, [location.pathname, location.search]);

  return null;
}

// --------------------------------------------------
// App
// --------------------------------------------------

export default function App() {
  const [ready, setReady] = useState(false);

  return (
    <AuthProvider>
      {!ready && <Loader onComplete={() => setReady(true)} />}

      <BrowserRouter>
        {/* Global page visit tracker */}
        <PageTracker />

        <Routes>
          <Route element={<Layout ready={ready} />}>
            <Route path="/" element={<Home />} />

            <Route path="/stays" element={<Stays />} />

            <Route path="/stays/:id" element={<StayDetail />} />

            <Route path="/book/:id" element={<Book />} />

            <Route path="/login" element={<Login />} />

            <Route path="/register" element={<Register />} />

            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/analytics" element={<AdminDashboard />} />

            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/analytics" element={<AdminDashboard />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

import AdminSidebar from "../components/admin/AdminSidebar";
import StatCard from "../components/admin/StatCard";
import VisitsChart from "../components/admin/VisitsChart";
import OverviewChart from "../components/admin/OverviewChart";

import { fetchAdminAnalytics } from "../services/api";

import "../components/admin/Styles/admin.css";

export default function AdminDashboard() {
  const pageRef = useRef(null);

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * ==============================
   * LOAD ADMIN ANALYTICS
   * ==============================
   */
  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        setError("");

        const data = await fetchAdminAnalytics();

        console.log("ADMIN ANALYTICS:", data);

        setAnalytics(data);
      } catch (err) {
        console.error("ADMIN ANALYTICS ERROR:", err);

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load admin analytics.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  /*
   * ==============================
   * GSAP DASHBOARD ANIMATIONS
   * ==============================
   */
  useEffect(() => {
    if (!analytics) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".admin-heading",
        {
          opacity: 0,
          y: 80,
        },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power4.out",
        },
      );

      gsap.fromTo(
        ".admin-subtitle",
        {
          opacity: 0,
          y: 20,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: 0.2,
          ease: "power3.out",
        },
      );

      gsap.fromTo(
        ".admin-date",
        {
          opacity: 0,
          x: 30,
        },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          delay: 0.25,
          ease: "power3.out",
        },
      );

      gsap.fromTo(
        ".stats-grid > *",
        {
          opacity: 0,
          y: 40,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.12,
          delay: 0.35,
          ease: "power3.out",
        },
      );

      gsap.fromTo(
        ".charts-grid > *",
        {
          opacity: 0,
          y: 50,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.15,
          delay: 0.65,
          ease: "power3.out",
        },
      );

      gsap.fromTo(
        ".admin-footer-section",
        {
          opacity: 0,
          y: 20,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: 0.9,
          ease: "power3.out",
        },
      );
    }, pageRef);

    return () => ctx.revert();
  }, [analytics]);

  /*
   * ==============================
   * LOADING STATE
   * ==============================
   */
  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-text">
          LOADING ROOMIE
          <span>...</span>
        </div>
      </div>
    );
  }

  /*
   * ==============================
   * ERROR STATE
   * ==============================
   */
  if (error) {
    return (
      <div className="admin-error">
        <div>
          <p>ACCESS ERROR</p>
          <h1>{error}</h1>
        </div>
      </div>
    );
  }

  /*
   * ==============================
   * BACKEND ANALYTICS RESPONSE
   * ==============================
   *
   * {
   *   totalVisits: 500,
   *   uniqueVisitors: 250,
   *   loggedInVisits: 180,
   *   anonymousVisits: 320,
   *   visitsToday: 25,
   *
   *   dailyVisits: [
   *     {
   *       date: "2026-09-01",
   *       visits: 20
   *     }
   *   ],
   *
   *   popularPages: [
   *     {
   *       page: "/properties",
   *       visits: 100
   *     }
   *   ]
   * }
   */

  const totalVisits = analytics?.totalVisits ?? 0;
  const uniqueVisitors = analytics?.uniqueVisitors ?? 0;
  const visitsToday = analytics?.visitsToday ?? 0;
  const loggedInVisits = analytics?.loggedInVisits ?? 0;
  const anonymousVisits = analytics?.anonymousVisits ?? 0;

  const dailyVisits = analytics?.dailyVisits ?? [];
  const popularPages = analytics?.popularPages ?? [];

  return (
    <div ref={pageRef} className="admin-page">
      <AdminSidebar />

      <main className="admin-main">
        {/* ================= HEADER ================= */}

        <header className="admin-header">
          <div>
            <div className="admin-breadcrumb">ROOMIE / ADMIN / DASHBOARD</div>

            <h1 className="admin-heading">
              CONTROL
              <br />
              CENTER<span>.</span>
            </h1>

            <p className="admin-subtitle">
              Monitor the Roomie ecosystem.
              <br />
              Everything important, in one place.
            </p>
          </div>

          <div className="admin-date">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
        </header>

        {/* ================= STAT CARDS ================= */}

        <section className="stats-grid">
          <StatCard label="TOTAL VISITS" value={totalVisits} index={0} />

          <StatCard label="UNIQUE VISITORS" value={uniqueVisitors} index={1} />

          <StatCard label="VISITS TODAY" value={visitsToday} index={2} />

          <StatCard label="LOGGED-IN VISITS" value={loggedInVisits} index={3} />
        </section>

        {/* ================= CHARTS ================= */}

        <section className="charts-grid">
          <VisitsChart data={dailyVisits} />

          <OverviewChart
            loggedInVisits={loggedInVisits}
            anonymousVisits={anonymousVisits}
            popularPages={popularPages}
          />
        </section>

        {/* ================= FOOTER STATUS ================= */}

        <section className="admin-footer-section">
          <div>
            <span>ROOMIE ADMIN</span>
          </div>

          <div>
            DATABASE
            <span className="online">● ONLINE</span>
          </div>

          <div>
            API
            <span className="online">● ONLINE</span>
          </div>
        </section>
      </main>
    </div>
  );
}

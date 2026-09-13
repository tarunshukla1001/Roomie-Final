import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";

import OwnerSidebar from "../components/owner/OwnerSidebar";
import {
  fetchMyProperties,
  deleteProperty,
} from "../services/api";

import "../components/owner/owner.css";

export default function OwnerDashboard() {
  const pageRef = useRef(null);
  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadProperties() {
    try {
      setLoading(true);
      setError("");

      const data = await fetchMyProperties();

      setProperties(data);
    } catch (err) {
      console.error("OWNER PROPERTIES ERROR:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load your properties."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProperties();
  }, []);

  useEffect(() => {
    if (loading || error) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".owner-heading",
        {
          opacity: 0,
          y: 80,
        },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power4.out",
        }
      );

      gsap.fromTo(
        ".owner-subtitle",
        {
          opacity: 0,
          y: 25,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: 0.2,
          ease: "power3.out",
        }
      );

      gsap.fromTo(
        ".owner-date",
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
        }
      );

      gsap.fromTo(
        ".owner-stat-card",
        {
          opacity: 0,
          y: 40,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          delay: 0.35,
          ease: "power3.out",
        }
      );

      gsap.fromTo(
        ".property-card",
        {
          opacity: 0,
          y: 50,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.12,
          delay: 0.55,
          ease: "power3.out",
        }
      );
    }, pageRef);

    return () => ctx.revert();
  }, [loading, error, properties]);

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this property?"
    );

    if (!confirmed) return;

    try {
      await deleteProperty(id);

      setProperties((current) =>
        current.filter((property) => property.id !== id)
      );
    } catch (err) {
      console.error("DELETE PROPERTY ERROR:", err);

      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to delete property."
      );
    }
  }

  if (loading) {
    return (
      <div className="owner-loading">
        <div>LOADING ROOMIE<span>...</span></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="owner-error">
        <div>
          <h1>Something went wrong.</h1>
          <p>{error}</p>

          <button onClick={loadProperties}>
            TRY AGAIN
          </button>
        </div>
      </div>
    );
  }

  const totalProperties = properties.length;

  /*
   * Your backend currently creates one default room
   * when a property is created.
   *
   * Until we add the full room-management API,
   * we use the number of properties as the initial
   * room estimate.
   */
  const totalRooms = properties.length;

  return (
    <div ref={pageRef} className="owner-page">
      <OwnerSidebar />

      <main className="owner-main">

       <header className="owner-header">
  <div>
    <div className="owner-breadcrumb">
      ROOMIE / OWNER / DASHBOARD
    </div>

    <h1 className="owner-heading">
      YOUR
      <br />
      SPACE<span>.</span>
    </h1>

    <p className="owner-subtitle">
      Manage your properties.
      <br />
      Keep everything under control.
    </p>
  </div>

  <div className="owner-header-actions">
    <button
      type="button"
      className="owner-list-property-btn"
      onClick={() => navigate("/owner/properties/add")}
    >
      <span>+</span>
      List Property
    </button>

    <div className="owner-date">
      {new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })}
    </div>
  </div>
</header>

        <section className="owner-stats">

          <div className="owner-stat-card">
            <div className="owner-stat-title">
              Properties
            </div>

            <div className="owner-stat-value">
              {totalProperties}
            </div>
          </div>

          <div className="owner-stat-card">
            <div className="owner-stat-title">
              Rooms
            </div>

            <div className="owner-stat-value">
              {totalRooms}
            </div>
          </div>

          <div className="owner-stat-card">
            <div className="owner-stat-title">
              Bookings
            </div>

            <div className="owner-stat-value">
              0
            </div>
          </div>

          <div className="owner-stat-card">
            <div className="owner-stat-title">
              Available
            </div>

            <div className="owner-stat-value">
              {totalRooms}
            </div>
          </div>

        </section>

        <section className="owner-properties">

          <div className="owner-section-header">

            <div>
              <h2>My Properties</h2>

              <p>
                Manage the places you have listed on Roomie.
              </p>
            </div>

            <button
              className="add-property-button"
              onClick={() =>
                navigate("/owner/properties/add")
              }
            >
              + Add Property
            </button>

          </div>

          {properties.length === 0 ? (
            <div className="empty-properties">

              <h3>
                You haven't added any properties yet.
              </h3>

              <p>
                Create your first listing and start
                accepting bookings.
              </p>

              <button
                onClick={() =>
                  navigate("/owner/properties/add")
                }
              >
                Add Your First Property
              </button>

            </div>
          ) : (
            <div className="property-list">

              {properties.map((property, index) => (
                <article
                  className="property-card"
                  key={property.id}
                >

                  <div className="property-number">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div className="property-main">

                    <h3>{property.name}</h3>

                    <p className="property-location">
                      {property.address}
                      {property.city
                        ? `, ${property.city}`
                        : ""}
                    </p>

                    <p className="property-description">
                      {property.description ||
                        "No description added yet."}
                    </p>

                  </div>

                  <div className="property-price">
                    <span>
                      Monthly rent
                    </span>

                    ₹
                    {Number(
                      property.monthlyRent || 0
                    ).toLocaleString("en-IN")}
                  </div>

                  <div className="property-actions">

                    <button
                      onClick={() =>
                        navigate(
                          `/owner/properties/edit/${property.id}`
                        )
                      }
                    >
                      Edit
                    </button>

                    <button
                      className="delete-button"
                      onClick={() =>
                        handleDelete(property.id)
                      }
                    >
                      Delete
                    </button>

                  </div>

                </article>
              ))}

            </div>
          )}

        </section>

        <footer className="owner-footer">

          <div>
            ROOMIE OWNER
          </div>

          <div>
            DATABASE
            <span>● ONLINE</span>
          </div>

          <div>
            API
            <span>● ONLINE</span>
          </div>

        </footer>

      </main>
    </div>
  );
}
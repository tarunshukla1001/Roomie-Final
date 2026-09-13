import { useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "../animations/gsap";

import OwnerSidebar from "../components/owner/OwnerSidebar";
import { createProperty } from "../services/api";
import "../components/owner/Styles/add-property.css";

export default function AddProperty() {
  const navigate = useNavigate();

  const pageRef = useRef(null);
  const formRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    monthlyRent: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".add-property-eyebrow",
        {
          opacity: 0,
          y: 20,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
        }
      );

      gsap.fromTo(
        ".add-property-title",
        {
          opacity: 0,
          y: 70,
        },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          delay: 0.1,
          ease: "power4.out",
        }
      );

      gsap.fromTo(
        ".add-property-subtitle",
        {
          opacity: 0,
          y: 25,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: 0.25,
          ease: "power3.out",
        }
      );

      gsap.fromTo(
        ".property-form-card",
        {
          opacity: 0,
          y: 60,
        },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          delay: 0.35,
          ease: "power4.out",
        }
      );

      gsap.fromTo(
        ".property-form-field",
        {
          opacity: 0,
          y: 25,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.08,
          delay: 0.5,
          ease: "power3.out",
        }
      );
    }, pageRef);

    return () => ctx.revert();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (!form.name.trim()) {
      setError("Please enter a property name.");
      return;
    }

    if (!form.address.trim()) {
      setError("Please enter the property address.");
      return;
    }

    if (!form.city.trim()) {
      setError("Please enter the city.");
      return;
    }

    if (!form.monthlyRent || Number(form.monthlyRent) <= 0) {
      setError("Please enter a valid monthly rent.");
      return;
    }

    setLoading(true);

    try {
      await createProperty(form);

      navigate("/owner");
    } catch (err) {
      console.error("CREATE PROPERTY ERROR:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data ||
          err?.message ||
          "Unable to create property."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div ref={pageRef} className="owner-page add-property-page">
      <OwnerSidebar />

      <main className="owner-main add-property-main">
        <div className="add-property-header">
          <div>
            <div className="add-property-eyebrow">
              ROOMIE / OWNER / ADD PROPERTY
            </div>

            <h1 className="add-property-title">
              LIST YOUR
              <br />
              SPACE<span>.</span>
            </h1>

            <p className="add-property-subtitle">
              Give your property a place on Roomie.
              <br />
              You can manage rooms and bookings afterwards.
            </p>
          </div>

          <button
            type="button"
            className="add-property-back"
            onClick={() => navigate("/owner")}
          >
            ← BACK
          </button>
        </div>

        <section ref={formRef} className="property-form-card">
          <div className="property-form-top">
            <div>
              <h2>Property details</h2>
              <p>
                Start with the essentials. Your first room will be created
                automatically.
              </p>
            </div>

            <div className="property-step">
              01 <span>/</span> 01
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="property-form-grid">
              <div className="property-form-field property-form-full">
                <label htmlFor="name">Property name</label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="e.g. The Nest PG"
                  value={form.name}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>

              <div className="property-form-field property-form-full">
                <label htmlFor="description">Description</label>

                <textarea
                  id="description"
                  name="description"
                  placeholder="Tell tenants what makes this property special..."
                  value={form.description}
                  onChange={handleChange}
                  disabled={loading}
                  rows={5}
                />
              </div>

              <div className="property-form-field property-form-full">
                <label htmlFor="address">Address</label>

                <input
                  id="address"
                  name="address"
                  type="text"
                  placeholder="Street, sector, locality..."
                  value={form.address}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>

              <div className="property-form-field">
                <label htmlFor="city">City</label>

                <input
                  id="city"
                  name="city"
                  type="text"
                  placeholder="e.g. Chandigarh"
                  value={form.city}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>

              <div className="property-form-field">
                <label htmlFor="monthlyRent">Monthly rent</label>

                <div className="rent-input">
                  <span>₹</span>

                  <input
                    id="monthlyRent"
                    name="monthlyRent"
                    type="number"
                    min="1"
                    placeholder="12000"
                    value={form.monthlyRent}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="property-form-error">
                {error}
              </div>
            )}

            <div className="property-form-bottom">
              <div className="property-form-note">
                <span>ROOM 01</span>
                <p>
                  A default shared PG room will be created automatically.
                </p>
              </div>

              <button
                type="submit"
                className="create-property-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    Creating
                    <span className="button-dots">...</span>
                  </>
                ) : (
                  <>
                    Create property
                    <span>↗</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

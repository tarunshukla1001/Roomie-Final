import { useNavigate, useLocation } from "react-router-dom";

export default function OwnerSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="owner-sidebar">
      <div className="owner-logo">
        ROOMIE<span>.</span>
      </div>

      <div className="owner-role">
        OWNER
      </div>

      <nav className="owner-nav">
        <button
          className={`owner-nav-item ${
            isActive("/owner") ? "active" : ""
          }`}
          onClick={() => navigate("/owner")}
        >
          <span>01</span>
          Overview
        </button>

        <button
          className={`owner-nav-item ${
            isActive("/owner/properties") ? "active" : ""
          }`}
          onClick={() => navigate("/owner/properties")}
        >
          <span>02</span>
          My Properties
        </button>

        <button
          className={`owner-nav-item ${
            isActive("/owner/properties/add") ? "active" : ""
          }`}
          onClick={() => navigate("/owner/properties/add")}
        >
          <span>03</span>
          Add Property
        </button>

        <button
          className={`owner-nav-item ${
            isActive("/owner/bookings") ? "active" : ""
          }`}
          onClick={() => navigate("/owner/bookings")}
        >
          <span>04</span>
          Bookings
        </button>
      </nav>

      <div className="owner-sidebar-bottom">
        <div className="owner-system-status">
          <span className="owner-status-dot" />
          SYSTEM ONLINE
        </div>

        <button
          className="owner-back"
          onClick={() => navigate("/")}
        >
          ← BACK TO ROOMIE
        </button>
      </div>
    </aside>
  );
}
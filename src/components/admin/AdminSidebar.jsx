import { useNavigate } from "react-router-dom";

export default function AdminSidebar() {
  const navigate = useNavigate();

  return (
    <aside className="admin-sidebar">

      <div className="admin-logo">
        ROOMIE<span>.</span>
      </div>

      <div className="admin-nav-label">
        ADMIN
      </div>

      <nav>

        <button className="admin-nav-item active">
          <span>01</span>
          Overview
        </button>

        <button
          className="admin-nav-item"
          onClick={() => navigate("/admin/analytics")}
        >
          <span>02</span>
          Analytics
        </button>

        <button className="admin-nav-item">
          <span>03</span>
          Users
        </button>

        <button className="admin-nav-item">
          <span>04</span>
          Properties
        </button>

        <button className="admin-nav-item">
          <span>05</span>
          Bookings
        </button>

      </nav>

      <div className="admin-sidebar-bottom">

        <div className="system-status">
          <span className="status-dot" />

          SYSTEM ONLINE
        </div>

        <button
          className="admin-back"
          onClick={() => navigate("/")}
        >
          ← BACK TO ROOMIE
        </button>

      </div>

    </aside>
  );
}
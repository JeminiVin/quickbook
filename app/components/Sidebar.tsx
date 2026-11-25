
import Link from "next/link";

type SidebarProps = {
  active?: "dashboard" | "bookings" | "customers" | "services" | "calendar";
};

export default function Sidebar({
  active = "dashboard",
}: SidebarProps) {
  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: "bi-grid-1x2-fill", key: "dashboard" },
    { label: "Bookings", href: "/bookings", icon: "bi-calendar-check", key: "bookings" },
    { label: "Customers", href: "/customers", icon: "bi-people", key: "customers" },
    { label: "Services", href: "/services", icon: "bi-briefcase", key: "services" },
    { label: "Calendar", href: "/calender", icon: "bi-calendar3", key: "calendar" },
  ] as const;

  return (
    <aside className="qb-sidebar">
      <Link href="/dashboard" className="qb-brand">
        <span className="brand-icon">
          <i className="bi bi-calendar2-heart-fill"></i>
        </span>
        <span>
          Quick<span className="brand-light">Book</span>
        </span>
      </Link>

      <div className="sidebar-label">WORKSPACE</div>

      <nav className="qb-nav">
        {navItems.map((item) => (
          <Link
            href={item.href}
            key={item.key}
            className={`nav-item ${active === item.key ? "active" : ""}`}
          >
            <i className={`bi ${item.icon}`}></i>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="sidebar-label settings-label">PREFERENCES</div>

      <nav className="qb-nav">
        <Link href="#" className="nav-item">
          <i className="bi bi-bar-chart-line"></i>
          Analytics
        </Link>
        <Link href="#" className="nav-item">
          <i className="bi bi-gear"></i>
          Settings
        </Link>
      </nav>

      <div className="sidebar-bottom">
        <div className="upgrade-card">
          <div className="upgrade-icon">
            <i className="bi bi-stars"></i>
          </div>
          <h6>Upgrade your plan</h6>
          <p>Unlock more features and grow your business.</p>
          <button className="upgrade-btn" type="button">
            Explore Plans
            <i className="bi bi-arrow-right"></i>
          </button>
        </div>

        <div className="sidebar-profile">
          <div className="profile-avatar">V</div>
          <div className="profile-info">
            <strong>Vinayak Jaimini</strong>
            <span>Administrator</span>
          </div>
          <i className="bi bi-three-dots"></i>
        </div>
      </div>
    </aside>
  );
}

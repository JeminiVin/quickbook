
import Link from "next/link";

type Props = {
  active:
    | "dashboard"
    | "bookings"
    | "customers"
    | "services"
    | "calendar"
    | "analytics"
    | "settings";
};

const navigation = [
  { label: "Dashboard", href: "/dashboard", icon: "bi-grid-1x2-fill", key: "dashboard" },
  { label: "Bookings", href: "/bookings", icon: "bi-calendar-check", key: "bookings" },
  { label: "Customers", href: "/customers", icon: "bi-people", key: "customers" },
  { label: "Services", href: "/services", icon: "bi-briefcase", key: "services" },
  { label: "Calendar", href: "/calender", icon: "bi-calendar3", key: "calendar" },
  { label: "Analytics", href: "/analytics", icon: "bi-bar-chart-line", key: "analytics" },
  { label: "Settings", href: "/settings", icon: "bi-gear", key: "settings" },
] as const;

export default function QuickBookSidebar({ active }: Props) {
  return (
    <aside className="qb-sidebar">
      <Link href="/dashboard" className="qb-sidebar-brand">
        <span className="qb-brand-icon">
          <i className="bi bi-calendar-check-fill"></i>
        </span>
        <span>Quick<span>Book</span></span>
      </Link>

      <div className="qb-sidebar-label">WORKSPACE</div>

      <nav className="qb-sidebar-nav">
        {navigation.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className={`qb-sidebar-link ${
              active === item.key ? "active" : ""
            }`}
          >
            <i className={`bi ${item.icon}`}></i>
            <span>{item.label}</span>
            {active === item.key && (
              <span className="qb-sidebar-active-dot"></span>
            )}
          </Link>
        ))}
      </nav>

      <div className="qb-sidebar-bottom">
        <div className="qb-sidebar-help-icon">
          <i className="bi bi-stars"></i>
        </div>
        <h4>Grow your business</h4>
        <p>
          Manage appointments and build better customer relationships
          with QuickBook.
        </p>
        <Link href="/dashboard" className="qb-sidebar-bottom-link">
          Go to Dashboard <i className="bi bi-arrow-right"></i>
        </Link>
      </div>

      <div className="qb-sidebar-footer">
        <div className="qb-sidebar-user-icon">Q</div>
        <div>
          <strong>QuickBook Admin</strong>
          <span>Workspace account</span>
        </div>
      </div>
    </aside>
  );
}

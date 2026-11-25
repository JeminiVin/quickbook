
type NavbarProps = {
  title?: string;
  section?: string;
};

export default function Navbar({
  title = "Dashboard Overview",
  section = "Dashboard",
}: NavbarProps) {
  return (
    <header className="qb-header">
      <div>
        <div className="breadcrumb-text">
          Workspace <i className="bi bi-chevron-right"></i> {section}
        </div>
        <h4>{title}</h4>
      </div>

      <div className="header-actions">
        <div className="search-box">
          <i className="bi bi-search"></i>
          <input type="text" placeholder="Search anything..." />
          <span>⌘ K</span>
        </div>

        <button className="header-icon" type="button" aria-label="Notifications">
          <i className="bi bi-bell"></i>
        </button>

        <button className="header-icon" type="button" aria-label="Help">
          <i className="bi bi-question-circle"></i>
        </button>

        <div className="header-avatar">V</div>
      </div>
    </header>
  );
}

import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const links = [
    { to: "/", icon: "📊", label: "Dashboard" },
    { to: "/sales", icon: "💰", label: "Sales Analysis" },
    { to: "/delivery", icon: "🚚", label: "Delivery Analysis" },
    { to: "/geographic", icon: "🌍", label: "Geographic" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>⛓️ Supply Chain</h2>
        <span>Analytics Dashboard</span>
      </div>
      <nav className="sidebar-nav">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === "/"}
            className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}
          >
            <span className="nav-icon">{l.icon}</span>
            {l.label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        Data: 172,765 Orders<br />
        Source: DataCo Supply Chain
      </div>
    </aside>
  );
}

import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

export default function Nav() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // Hide navbar on auth pages (optional)
  const hideNav = ["/login", "/register"].includes(location.pathname);
  if (hideNav) return null;

  const links = useMemo(
    () => [
      { to: "/", label: "Home" },
      { to: "/interview", label: "Interview" },
      { to: "/result", label: "Result" },
    ],
    []
  );

  const isActive = (path) => location.pathname === path;

  const close = () => setOpen(false);

  return (
    <header className="nav-header">
      <nav className="nav-bar">
        {/* Left: Brand */}
        <div className="nav-left">
          <Link to="/" className="logo" onClick={close}>
            AI Interview Coach
          </Link>
        </div>

        {/* Right: Hamburger (mobile) */}
        <button
          className="nav-toggle"
          onClick={() => setOpen((s) => !s)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Desktop links */}
        <ul className="nav-links desktop">
          {links.map((l) => (
            <li key={l.to}>
              <Link className={isActive(l.to) ? "active" : ""} to={l.to}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop action */}
        <div className="nav-actions desktop">
          <Link className="btn btn-primary" to="/" onClick={close}>
            New Interview
          </Link>
        </div>

        {/* Mobile menu panel */}
        <div className={`mobile-panel ${open ? "open" : ""}`}>
          <ul className="nav-links mobile">
            {links.map((l) => (
              <li key={l.to}>
                <Link
                  className={isActive(l.to) ? "active" : ""}
                  to={l.to}
                  onClick={close}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="nav-actions mobile">
            <Link className="btn btn-primary" to="/" onClick={close}>
              New Interview
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}

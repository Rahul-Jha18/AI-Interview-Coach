import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Play, RotateCcw } from "lucide-react";
import { loadSession, clearSession } from "../../utils/storage.js";

export default function Nav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // Optional: hide navbar on auth pages
  const hideNav = ["/login", "/register"].includes(location.pathname);
  if (hideNav) return null;

  const session = loadSession();
  const canResume = !!session?.questions?.length;

  const links = useMemo(
    () => [
      { to: "/", label: "Home" },
      { to: "/select", label: "Select Track" },
      { to: "/interview", label: "Interview" },
      { to: "/result", label: "Result" },
    ],
    []
  );

  const isActive = (path) => location.pathname === path;

  const close = () => setOpen(false);

  const startNew = () => {
    clearSession();
    close();
    navigate("/select");
  };

  const resume = () => {
    close();
    navigate("/interview");
  };

  return (
    <header className="nav-header">
      <nav className="nav-bar">
        {/* Brand */}
        <div className="nav-left">
          <Link to="/" className="logo" onClick={close}>
            AI Interview Coach
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="nav-toggle"
          onClick={() => setOpen((s) => !s)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Desktop Links */}
        <ul className="nav-links desktop">
          {links.map((l) => (
            <li key={l.to}>
              <Link className={isActive(l.to) ? "active" : ""} to={l.to} onClick={close}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop Actions */}
        <div className="nav-actions desktop">
          {canResume && (
            <button className="btn btn-ghost" onClick={resume} title="Resume interview">
              <Play size={18} style={{ marginRight: 8 }} />
              Resume
            </button>
          )}

          <button className="btn btn-primary" onClick={startNew} title="Start new interview">
            <RotateCcw size={18} style={{ marginRight: 8 }} />
            Start New
          </button>
        </div>

        {/* Mobile Panel */}
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
            {canResume && (
              <button className="btn btn-ghost" onClick={resume}>
                <Play size={18} style={{ marginRight: 8 }} />
                Resume
              </button>
            )}

            <button className="btn btn-primary" onClick={startNew}>
              <RotateCcw size={18} style={{ marginRight: 8 }} />
              Start New
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}

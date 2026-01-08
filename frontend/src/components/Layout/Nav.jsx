import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { loadSession, clearSession } from "../../utils/storage.js";
import '../../styles/Pages.css'

export default function Nav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

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

  const close = () => setOpen(false);

  const go = (path) => {
    close();
    navigate(path);
  };

  const startNew = () => {
    clearSession();
    close();
    navigate("/select");
  };

  const resume = () => {
    close();
    navigate("/interview");
  };

  // close on route change
  useEffect(() => {
    close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // close on ESC + outside click
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };
    const onClick = (e) => {
      // click outside drawer closes it
      const drawer = document.querySelector(".nav-drawer");
      const toggle = document.querySelector(".nav-toggle");
      if (!open) return;
      if (drawer && drawer.contains(e.target)) return;
      if (toggle && toggle.contains(e.target)) return;
      close();
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <header className="nav-header">
      <nav className="nav-bar">
        {/* LOGO */}
        <Link to="/" className="logo" onClick={close}>
          <span className="logo-mark" />
          <span className="logo-text">AI Interview Coach</span>
        </Link>

        {/* MENU BUTTON (ALWAYS VISIBLE) */}
        <button
          className="nav-toggle"
          onClick={() => setOpen((s) => !s)}
          aria-label="Menu"
          aria-expanded={open}
        >
          <span className="nav-toggle-fallback">{open ? "✕" : "☰"}</span>
        </button>

        {/* DRAWER */}
        <AnimatePresence>
          {open && (
            <motion.div
              className="nav-drawer"
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.18 }}
            >
              <ul className="nav-drawer-links">
                {links.map((l) => (
                  <li key={l.to}>
                    <button
                      className="nav-item"
                      onClick={() => go(l.to)}
                      aria-current={location.pathname === l.to ? "page" : undefined}
                    >
                      {l.label}
                    </button>
                  </li>
                ))}
              </ul>

              <div className="nav-divider" />

              <div className="nav-drawer-actions">
                {canResume && (
                  <button className="btn btn-ghost" onClick={resume}>
                    Resume Interview
                  </button>
                )}
                <button className="btn btn-primary" onClick={startNew}>
                  Start New
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}

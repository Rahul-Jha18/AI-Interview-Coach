import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getSettings, loadSession, clearSession } from "../utils/storage.js";

export default function Result() {
  const navigate = useNavigate();
  const settings = getSettings();
  const session = loadSession();

  const { avg, answered, total, best } = useMemo(() => {
    const scores = session?.scores || [];
    const valid = scores.filter(Boolean);
    const answered = valid.length;
    const total = (session?.questions || []).length || settings?.count || 0;

    const avg =
      answered === 0
        ? 0
        : Math.round(valid.reduce((a, b) => a + (b.score || 0), 0) / answered);

    const best = valid.reduce((m, x) => Math.max(m, x?.score || 0), 0);

    return { avg, answered, total, best };
  }, [session, settings]);

  const restart = () => {
    clearSession();
    navigate("/", { replace: true });
  };

  const resume = () => navigate("/interview");
  const goHome = () => navigate("/");

  if (!settings?.field) {
    return (
      <div className="page">
        <div className="container">
          <div className="card">
            <h2>No session found.</h2>
            <p className="muted">Start an interview to see results here.</p>
            <div className="row wrap">
              <button className="btn btn-primary" onClick={goHome}>Go Home</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const scoreLabel =
    avg >= 85 ? "Excellent" : avg >= 70 ? "Good" : avg >= 50 ? "Average" : "Needs Work";

  return (
    <div className="page">
      <div className="container">
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="row wrap between">
            <div>
              <h2 style={{ marginBottom: 6 }}>Results</h2>
              <p className="muted">{settings.fieldLabel} • {settings.level}</p>
            </div>

            <div className="row wrap gap-sm">
              <button className="btn" onClick={resume}>Resume</button>
              <button className="btn btn-primary" onClick={restart}>Start New</button>
            </div>
          </div>

          <div className="divider" />

          <div className="grid grid-3">
            <div className="card soft">
              <div className="stat-title">Overall</div>
              <div className="big-score">{avg}<span className="muted">/100</span></div>
              <div className="chip">{scoreLabel}</div>
            </div>

            <div className="card soft">
              <div className="stat-title">Answered</div>
              <div className="big-score">{answered}<span className="muted">/{total}</span></div>
              <p className="muted" style={{ marginTop: 6 }}>Questions evaluated</p>
            </div>

            <div className="card soft">
              <div className="stat-title">Best Score</div>
              <div className="big-score">{best}<span className="muted">/100</span></div>
              <p className="muted" style={{ marginTop: 6 }}>Top single answer</p>
            </div>
          </div>

          <div className="spacer" />

          <h3>Per-question recap</h3>
          <ol className="recap">
            {(session?.questions || []).map((q, i) => (
              <li key={i} className="recap-item">
                <div className="recap-q">{q}</div>
                <div className="recap-s">
                  Score: <b>{session?.scores?.[i]?.score ?? "—"}</b> / 100
                </div>
              </li>
            ))}
          </ol>
        </motion.div>
      </div>
    </div>
  );
}

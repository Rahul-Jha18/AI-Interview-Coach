import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import fields from "../data/fields.js";
import { getSettings, loadSession, clearSession, saveSettings } from "../utils/storage.js";
import "../styles/Pages.css";

import Typewriter from "../components/Typewriter.jsx";

const FAQ = [
  {
    q: "How does this interview coach work?",
    a: "Choose a track and level. The app generates questions, evaluates your answers, and gives feedback + an expected answer."
  },
  {
    q: "Is my data saved?",
    a: "Your session is saved locally in your browser (localStorage). Nothing is stored on the server."
  },
  {
    q: "How do I get better scores?",
    a: "Use structured answers and mention key points. For behavioral questions, use STAR: Situation, Task, Action, Result."
  },
  {
    q: "Can I resume later?",
    a: "Yes. You can resume the last session anytime using Resume."
  }
];

export default function Home() {
  const navigate = useNavigate();
  const settings = getSettings();
  const session = loadSession();

  const canResume = !!session?.questions?.length;
  const answered = (session?.scores || []).filter(Boolean).length;

  const fieldLabel = useMemo(() => {
    if (settings?.fieldLabel) return settings.fieldLabel;
    return "Choose Track";
  }, [settings]);

  const quickStart = () => {
    const defaultField = fields?.[0]?.key || "frontend";
    const defaultLabel = fields?.[0]?.label || "Frontend Developer";

    clearSession();
    saveSettings({
      field: settings?.field || defaultField,
      fieldLabel: settings?.fieldLabel || defaultLabel,
      level: settings?.level || "junior",
      count: settings?.count || 8,
      profileText: settings?.profileText || "",
    });

    navigate("/interview");
  };

  const goSelect = () => navigate("/select");
  const goInterview = () => navigate("/interview");
  const goResult = () => navigate("/result");

  const resetAll = () => {
    clearSession();
    navigate("/", { replace: true });
  };

  const resume = () => navigate("/interview");

  return (
    <div className="page">
      <div className="intro">
        <h1></h1>
      </div>
      <div className="container">
        <motion.div
          className="hero card hero2"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <div className="hero-left">
            <div className="hero-badge">
              <span className="dot" />
              AI Interview Coach
              <span className="badge-chip">Modern</span>
            </div>

            <h1 className="hero-title">
              Practice{" "}
              <Typewriter
                texts={[
                  "Job Interviews.",
                  "Internship Interviews.",
                  "Network & SysAdmin Interviews.",
                  "Bank and Company Interviews.",
                  "Data / Analytics Interviews.",
                ]}
                speed={34}
                pause={1050}
              />
            </h1>

            <p className="hero-sub">
              Generate questions, write answers, get instant feedback and a strong expected answer.
              Improve fast with a mock-session feel.
            </p>

            <div className="row wrap hero-actions">
              <button className="btn btn-primary" onClick={quickStart}>
                Start Interview
              </button>

              <button className="btn" onClick={goSelect}>
                Choose Track
              </button>

              {canResume ? (
                <button className="btn btn-glow" onClick={resume}>
                  Resume ({answered} answered)
                </button>
              ) : (
                <button className="btn" onClick={goInterview} disabled={!settings?.field}>
                  Go to Interview
                </button>
              )}

              <button className="btn btn-ghost" onClick={goResult} disabled={!canResume}>
                View Result
              </button>
            </div>

            <div className="hero-meta">
              <div className="pill">
                Track: <b>{fieldLabel}</b>
              </div>
              <div className="pill">
                Level: <b>{settings?.level || "junior"}</b>
              </div>
              <div className="pill">
                Session: <b>{canResume ? "Available" : "Not started"}</b>
              </div>
            </div>

            {canResume && (
              <div className="row wrap" style={{ marginTop: 12 }}>
                <button className="btn btn-danger" onClick={resetAll}>
                  Reset Session
                </button>
              </div>
            )}
          </div>

          <div className="hero-right">
            <div className="stat-grid stat-grid-2">
              <div className="stat card soft">
                <div className="stat-title">Instant Feedback</div>
                <div className="stat-desc">Score + suggestions + key points</div>
              </div>

              <div className="stat card soft">
                <div className="stat-title">Expected Answer</div>
                <div className="stat-desc">See what “strong” looks like</div>
              </div>

              <div className="stat card soft">
                <div className="stat-title">Resume Anytime</div>
                <div className="stat-desc">Saved locally in your browser</div>
              </div>

              <div className="stat card soft">
                <div className="stat-title">Multiple Tracks</div>
                <div className="stat-desc">Frontend, Backend, Network, QA, Data</div>
              </div>
            </div>

            <div className="mini card soft" style={{ marginTop: 12 }}>
              <div className="mini-title">Pro Tip</div>
              <div className="mini-desc">
                Use <b>STAR</b> (Situation, Task, Action, Result) for behavioral questions.
              </div>
            </div>
          </div>
        </motion.div>

        <div className="spacer-lg" />

        <div className="grid grid-2">
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.3 }}
          >
            <h2>Guidelines</h2>
            <ul className="nice-list">
              <li><b>Write structured answers</b> (STAR for behavioral).</li>
              <li><b>Be specific</b>: tools, methods, metrics, outcomes.</li>
              <li><b>Mention trade-offs</b>: performance vs cost vs security.</li>
              <li><b>Think aloud</b> for scenario questions.</li>
              <li><b>Compare</b> after evaluation with Expected Answer.</li>
            </ul>
          </motion.div>

          <motion.div
            className="card"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.3, delay: 0.05 }}
          >
            <h2>FAQ</h2>
            <div className="faq">
              {FAQ.map((f, i) => (
                <details key={i} className="faq-item">
                  <summary>{f.q}</summary>
                  <p className="muted">{f.a}</p>
                </details>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="spacer-lg" />

        <motion.div
          className="card cta cta2"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.32 }}
        >
          <div>
            <h2>Ready to start?</h2>
            <p className="muted">
              Choose a track and begin your mock interview. You can resume anytime.
            </p>
          </div>

          <div className="row wrap">
            <button className="btn btn-primary" onClick={quickStart}>
              Start Now
            </button>
            <button className="btn" onClick={goSelect}>
              Select Track
            </button>
            <button className="btn btn-ghost" onClick={goResult} disabled={!canResume}>
              View Result
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

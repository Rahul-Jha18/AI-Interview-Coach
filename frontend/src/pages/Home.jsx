import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import fields from "../data/fields.js";
import { getSettings, loadSession, clearSession, saveSettings } from "../utils/storage.js";
import '../styles/Pages.css';

const FAQ = [
  {
    q: "How does this interview coach work?",
    a: "You choose a track and level. The system generates questions, evaluates your answers, and provides feedback + an expected answer so you can improve."
  },
  {
    q: "Is my data saved?",
    a: "Your session is saved locally in your browser (localStorage). Nothing is stored on the server unless you add a database later."
  },
  {
    q: "How do I get better scores?",
    a: "Write structured answers, mention key points, and use STAR for behavioral questions: Situation, Task, Action, Result."
  },
  {
    q: "Can I resume later?",
    a: "Yes. If you close the browser, you can resume the last session from Home using the Resume button."
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
    // Default settings if none selected yet
    const defaultField = fields?.[0]?.key || "frontend";
    const defaultLabel = fields?.[0]?.label || "Frontend Developer";

    clearSession();
    saveSettings({
      field: settings?.field || defaultField,
      fieldLabel: settings?.fieldLabel || defaultLabel,
      level: settings?.level || "junior",
      count: settings?.count || 8,
    });

    navigate("/interview");
  };

  const goSelect = () => navigate("/select"); // optional route (if you want)
  const goInterview = () => navigate("/interview");
  const goResult = () => navigate("/result");

  const resetAll = () => {
    clearSession();
    navigate("/", { replace: true });
  };

  return (
    <div className="home-hero">
      <div className="container">
        {/* HERO */}
        <div className="hero card">
          <div className="hero-left">
            <div className="hero-badge">
              <span className="dot" />
              AI Interview Coach
            </div>

            <h1 className="hero-title">
              Practice interviews like a real mock session.
            </h1>

            <p className="hero-sub">
              Generate questions, write answers, get instant feedback and a strong expected answer.
              Improve fast with structured learning.
            </p>

            <div className="row wrap hero-actions">
              <button className="btn btn-primary" onClick={quickStart}>
                Start Interview
              </button>

              <button className="btn" onClick={() => navigate("/")}>
                Home
              </button>

              <button className="btn" onClick={goSelect}>
                Choose Track
              </button>
            </div>

            <div className="hero-meta">
              <div className="pill">
                Track: <b>{fieldLabel}</b>
              </div>
              <div className="pill">
                Session:{" "}
                <b>{canResume ? `Available (${answered} answered)` : "Not started"}</b>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="hero-right">
            <div className="stat-grid">
              <div className="stat card soft">
                <div className="stat-title">Instant Feedback</div>
                <div className="stat-desc">Score + suggestions + key points</div>
              </div>

              <div className="stat card soft">
                <div className="stat-title">Expected Answer</div>
                <div className="stat-desc">See what a strong answer looks like</div>
              </div>

              <div className="stat card soft">
                <div className="stat-title">Resume Anytime</div>
                <div className="stat-desc">Local session stored in your browser</div>
              </div>

              <div className="stat card soft">
                <div className="stat-title">Multiple Tracks</div>
                <div className="stat-desc">Frontend, Backend, Network, QA, Data</div>
              </div>
            </div>

            <div className="row wrap" style={{ marginTop: 12 }}>
              <button className="btn" onClick={goInterview} disabled={!settings}>
                Go to Interview
              </button>

              <button className="btn" onClick={goResult} disabled={!canResume}>
                View Result
              </button>

              <button className="btn btn-danger" onClick={resetAll} disabled={!canResume}>
                Reset Session
              </button>
            </div>
          </div>
        </div>

        <div className="spacer-lg" />

        {/* GUIDELINES */}
        <div className="grid grid-2">
          <div className="card">
            <h2>Guidelines</h2>
            <ul className="nice-list">
              <li><b>Write structured answers</b> (STAR for behavioral questions).</li>
              <li><b>Be specific</b>: tools, methods, metrics, outcomes.</li>
              <li><b>Say trade-offs</b>: performance vs cost vs security.</li>
              <li><b>Think aloud</b> for scenario questions.</li>
              <li><b>After evaluation</b>, compare with the Expected Answer.</li>
            </ul>
          </div>

          <div className="card">
            <h2>FAQ</h2>
            <div className="faq">
              {FAQ.map((f, i) => (
                <details key={i} className="faq-item">
                  <summary>{f.q}</summary>
                  <p className="muted">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>

        <div className="spacer-lg" />

        {/* CTA */}
        <div className="card cta">
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
            <button className="btn" onClick={goResult} disabled={!canResume}>
              View Result
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

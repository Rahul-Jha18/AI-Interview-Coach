import { useMemo, useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

import fields from "../data/fields.js";
import { getSettings, loadSession, clearSession, saveSettings } from "../utils/storage.js";
import "../styles/Pages.css";

import Typewriter from "../components/Typewriter.jsx";

// Import your existing pages (no new framework)
import SelectField from "./SelectField.jsx";
import Interview from "./Interview.jsx";
import Result from "./Result.jsx";

const FAQ = [
  {
    q: "How does this interview coach work?",
    a: "Choose a track and level. The app generates questions, evaluates your answers, and gives feedback + an expected answer.",
  },
  {
    q: "Is my data saved?",
    a: "Your session is saved locally in your browser (localStorage). Nothing is stored on the server.",
  },
  {
    q: "How do I get better scores?",
    a: "Use structured answers and mention key points. For behavioral questions, use STAR: Situation, Task, Action, Result.",
  },
  {
    q: "Can I resume later?",
    a: "Yes. You can resume the last session anytime using Resume.",
  },
];

const FEATURES = [
  { title: "Instant Feedback", desc: "Score + improvements + key points to mention" },
  { title: "Expected Answer", desc: "See what a strong answer looks like" },
  { title: "Resume Anytime", desc: "Session saved locally in your browser" },
  { title: "Multiple Tracks", desc: "Frontend, Backend, Network, QA, Data, More" },
];

const STEPS = [
  { n: "1", t: "Choose Track", d: "Pick your domain or describe your background." },
  { n: "2", t: "Practice", d: "Answer questions like a real mock interview." },
  { n: "3", t: "Improve", d: "Use feedback + expected answers to level up fast." },
];

export default function Home() {
  const navigate = useNavigate();
  const settings = getSettings();
  const session = loadSession();

  const canResume = !!session?.questions?.length;
  const answered = (session?.scores || []).filter(Boolean).length;

  // Single-page sections
  const [section, setSection] = useState("home"); // home | select | interview | result

  // if user refreshes while on interview/result route, still fine
  useEffect(() => {
    // keep route simple, but do not break your existing routes
    // If you prefer: navigate("/") always. I kept it safe.
  }, [navigate]);

  const fieldLabel = useMemo(() => {
    if (settings?.fieldLabel) return settings.fieldLabel;
    return "Choose Track";
  }, [settings]);

  const defaultField = fields?.[0]?.key || "frontend";
  const defaultLabel = fields?.[0]?.label || "Frontend Developer";

  const quickStart = () => {
    clearSession();
    saveSettings({
      field: settings?.field || defaultField,
      fieldLabel: settings?.fieldLabel || defaultLabel,
      level: settings?.level || "junior",
      count: settings?.count || 8,
      profileText: settings?.profileText || "",
    });
    setSection("interview");
    // optional: keep routes working
    navigate("/"); // stay on home
  };

  const resume = () => {
    setSection("interview");
    navigate("/");
  };

  const openSelect = () => {
    setSection("select");
    navigate("/");
  };

  const openInterview = () => {
    setSection("interview");
    navigate("/");
  };

  const openResult = () => {
    setSection("result");
    navigate("/");
  };

  const resetAll = () => {
    clearSession();
    setSection("home");
    navigate("/", { replace: true });
  };

  const tracksPreview = useMemo(() => {
    return (fields || []).slice(0, 6);
  }, []);

  return (
    <div className="page">
      <div className="container">
        <div className="home-tabs card soft">
          <button
            className={`tabbtn ${section === "home" ? "active" : ""}`}
            onClick={() => setSection("home")}
          >
            Overview
          </button>
          <button
            className={`tabbtn ${section === "select" ? "active" : ""}`}
            onClick={openSelect}
          >
            Select Track
          </button>
          <button
            className={`tabbtn ${section === "interview" ? "active" : ""}`}
            onClick={openInterview}
            disabled={!settings?.field}
            title={!settings?.field ? "Choose track first" : ""}
          >
            Interview
          </button>
          <button
            className={`tabbtn ${section === "result" ? "active" : ""}`}
            onClick={openResult}
            disabled={!canResume}
            title={!canResume ? "Start interview first" : ""}
          >
            Result
          </button>
        </div>
      

        <div className="spacer" />

        {/* HERO */}
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
                  "Helpdesk & IT Support Interviews.",
                  "Cybersecurity Interviews.",
                  "DevOps Interviews.",
                  "Behavioral HR Interviews.",
                  "Technical Screening Rounds.",
                ]}
                speed={30}
                pause={950}
              />
            </h1>

            <p className="hero-sub">
              Generate questions, write answers, get instant feedback and an expected answer.
              Improve fast with a mock-session feel — in one clean app.
            </p>

            <div className="row wrap hero-actions">
              <button className="btn btn-primary" onClick={quickStart}>
                Start Interview
              </button>

              <button className="btn" onClick={openSelect}>
                Choose Track
              </button>

              {canResume ? (
                <button className="btn btn-glow" onClick={resume}>
                  Resume ({answered} answered)
                </button>
              ) : (
                <button className="btn" onClick={openInterview} disabled={!settings?.field}>
                  Go to Interview
                </button>
              )}

              <button className="btn btn-ghost" onClick={openResult} disabled={!canResume}>
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
            {/* normal image (no SVG). Put file in: public/images/hero.png */}
            <div className="hero-image card soft">
              <img
                src="/images/hero.png"
                alt="Interview practice"
                className="hero-img"
                onError={(e) => {
                  // if user didn't add image, hide it gracefully
                  e.currentTarget.style.display = "none";
                }}
              />
              <div className="hero-image-overlay">
                <div className="mini-title">Pro Tip</div>
                <div className="mini-desc">
                  Use <b>STAR</b> (Situation, Task, Action, Result) for behavioral questions.
                </div>
              </div>
            </div>

            <div className="stat-grid stat-grid-2" style={{ marginTop: 12 }}>
              {FEATURES.map((f, i) => (
                <div key={i} className="stat card soft">
                  <div className="stat-title">{f.title}</div>
                  <div className="stat-desc">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
        {/* OVERVIEW SECTION */}
        <AnimatePresence mode="wait">
          {section === "home" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.22 }}
            >
              <div className="grid grid-2">
                <motion.div
                  className="card"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2>How it works</h2>
                  <div className="steps">
                    {STEPS.map((s) => (
                      <div key={s.n} className="step">
                        <div className="step-n">{s.n}</div>
                        <div>
                          <div className="step-t">{s.t}</div>
                          <div className="muted">{s.d}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  className="card"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.3, delay: 0.05 }}
                >
                  <h2>Popular Tracks</h2>
                  <div className="track-grid">
                    {tracksPreview.map((t) => (
                      <button
                        key={t.key}
                        className="track-card"
                        onClick={() => {
                          clearSession();
                          saveSettings({
                            field: t.key,
                            fieldLabel: t.label,
                            level: settings?.level || "junior",
                            count: settings?.count || 8,
                            profileText: settings?.profileText || "",
                          });
                          setSection("interview");
                          navigate("/");
                        }}
                      >
                        <div className="track-title">{t.label}</div>
                        <div className="muted">Tap to start</div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              </div>

              <div className="spacer-lg" />

              <div className="grid grid-3">
                <div className="card soft">
                  <div className="stat-title">Answer Smarter</div>
                  <p className="muted">
                    Use STAR + mention tools, outcomes, metrics, and tradeoffs.
                  </p>
                </div>
                <div className="card soft">
                  <div className="stat-title">Train Consistency</div>
                  <p className="muted">
                    Practice daily for 10 minutes and watch your score rise.
                  </p>
                </div>
                <div className="card soft">
                  <div className="stat-title">Be Interview-ready</div>
                  <p className="muted">
                    See expected answers and compare with your own.
                  </p>
                </div>
              </div>

              <div className="spacer-lg" />

              <div className="grid grid-2">
                <div className="card">
                  <h2>Guidelines</h2>
                  <ul className="nice-list">
                    <li><b>Write structured answers</b> (STAR for behavioral).</li>
                    <li><b>Be specific</b>: tools, methods, metrics, outcomes.</li>
                    <li><b>Mention trade-offs</b>: performance vs cost vs security.</li>
                    <li><b>Think aloud</b> for scenario questions.</li>
                    <li><b>Compare</b> after evaluation with Expected Answer.</li>
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
            </motion.div>
          )}

          {/* EMBED: SELECT */}
          {section === "select" && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.22 }}
            >
              <div className="embed-card">
                <SelectField />
              </div>
            </motion.div>
          )}

          {/* EMBED: INTERVIEW */}
          {section === "interview" && (
            <motion.div
              key="interview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.22 }}
            >
              <div className="embed-card">
                <Interview />
              </div>
            </motion.div>
          )}

          {/* EMBED: RESULT */}
          {section === "result" && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.22 }}
            >
              <div className="embed-card">
                <Result />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

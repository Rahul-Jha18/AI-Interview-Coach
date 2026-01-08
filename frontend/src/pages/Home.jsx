
import { useMemo, useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Tips from "../assets/tips.png";

import fields from "../data/fields.js";
import { getSettings, loadSession, clearSession, saveSettings } from "../utils/storage.js";
import "../styles/Pages.css";

import Typewriter from "../components/Typewriter.jsx";

import SelectField from "./SelectField.jsx";
import Interview from "./Interview.jsx";
import Result from "./Result.jsx";

const FAQ = [
  { q: "How does this interview coach work?", a: "Choose a track and level. The app generates questions, evaluates your answers, and gives feedback + an expected answer." },
  { q: "Is my data saved?", a: "Your session is saved locally in your browser (localStorage). Nothing is stored on the server." },
  { q: "How do I get better scores?", a: "Use structured answers and mention key points. For behavioral questions, use STAR: Situation, Task, Action, Result." },
  { q: "Can I resume later?", a: "Yes. You can resume the last session anytime using Resume." },
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

  const [section, setSection] = useState("home");

  // ✅ refs for smooth scroll targets
  const topRef = useRef(null);
  const selectRef = useRef(null);
  const interviewRef = useRef(null);
  const resultRef = useRef(null);

  const scrollTo = (ref) => {
    // small delay helps when AnimatePresence mounts content
    setTimeout(() => {
      ref?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  // ✅ Auto-scroll whenever section changes
  useEffect(() => {
    if (section === "home") scrollTo(topRef);
    if (section === "select") scrollTo(selectRef);
    if (section === "interview") scrollTo(interviewRef);
    if (section === "result") scrollTo(resultRef);
  }, [section]);

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
    navigate("/");
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

  const tracksPreview = useMemo(() => (fields || []).slice(0, 6), []);

  return (
    <div className="page">
      <div className="container">
        {/* Scroll top anchor */}
        <div ref={topRef} />

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
            <div className="hero-image card soft">
              <img
                src={Tips}
                alt="Pro Tip - STAR Method"
                className="hero-img"
                onError={(e) => {
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
          </div>
        </motion.div>

        <div className="spacer" />

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
                <motion.div className="card" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.3 }}>
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

                <motion.div className="card" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.3, delay: 0.05 }}>
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
            </motion.div>
          )}

          {section === "select" && (
            <motion.div key="select" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.22 }}>
              <div ref={selectRef} className="embed-card">
                <SelectField />
              </div>
            </motion.div>
          )}

          {section === "interview" && (
            <motion.div key="interview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.22 }}>
              <div ref={interviewRef} className="embed-card">
                <Interview />
              </div>
            </motion.div>
          )}

          {section === "result" && (
            <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.22 }}>
              <div ref={resultRef} className="embed-card">
                <Result />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import ProgressBar from "../components/ProgressBar.jsx";
import ScoreBadge from "../components/ScoreBadge.jsx";

import { generateQuestions, evaluateAnswer } from "../services/interviewApi.js";
import { getSettings, loadSession, saveSession } from "../utils/storage.js";

const withTimeout = (promise, ms = 15000) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), ms)
    ),
  ]);

export default function Interview() {
  const navigate = useNavigate();
  const settings = getSettings();

  const [initialized, setInitialized] = useState(false);
  const saveDraftTimer = useRef(null);

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);

  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [scores, setScores] = useState([]);

  const [autoAdvance, setAutoAdvance] = useState(false);
  const [showExpected, setShowExpected] = useState(true);
  const [error, setError] = useState(null);

  /* Redirect if no settings */
  useEffect(() => {
    if (!settings?.field) navigate("/", { replace: true });
  }, [settings, navigate]);

  /* Restore session */
  useEffect(() => {
    const session = loadSession();
    if (session?.questions?.length) {
      setQuestions(session.questions);
      setIndex(session.index || 0);
      setScores(session.scores || []);
      setAnswer(session.answerDraft || "");
      setFeedback(session.feedback || null);
    }
    setLoading(false);
  }, []);

  /* Generate questions (strict-mode safe) */
  useEffect(() => {
    if (!settings?.field || initialized) return;
    setInitialized(true);

    const session = loadSession();
    if (session?.questions?.length) return;

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await withTimeout(generateQuestions(settings));
        const qs = res?.questions || [];

        setQuestions(qs);
        setIndex(0);
        setScores([]);
        setAnswer("");
        setFeedback(null);

        saveSession({
          questions: qs,
          index: 0,
          scores: [],
          answerDraft: "",
          feedback: null,
        });
      } catch (e) {
        console.error(e);
        setError("Failed to generate questions. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [settings, initialized]);

  const current = questions[index];

  /* Progress (safe score handling) */
  const { progress, doneCount, total, avgScore, bestScore } = useMemo(() => {
    const validScores = (scores || []).filter((s) => s && typeof s.score === "number");
    const done = validScores.length;
    const total = questions.length || settings?.count || 0;
    const progress = total ? Math.round((done / total) * 100) : 0;

    const avgScore =
      done === 0 ? 0 : Math.round(validScores.reduce((a, b) => a + (b.score || 0), 0) / done);
    const bestScore = validScores.reduce((m, x) => Math.max(m, x?.score || 0), 0);

    return { progress, doneCount: done, total, avgScore, bestScore };
  }, [scores, questions.length, settings]);

  const isEvaluated = !!feedback;
  const canEvaluate = !!answer.trim() && !loading;
  const canNext = !!answer.trim() && !loading;

  const persist = (patch = {}) => {
    saveSession({
      questions,
      index,
      scores,
      answerDraft: answer,
      feedback,
      ...patch,
    });
  };

  const next = (scoresOverride) => {
    const nextIndex = index + 1;
    const finalScores = scoresOverride || scores;

    if (nextIndex >= questions.length) {
      saveSession({
        questions,
        index,
        scores: finalScores,
        answerDraft: "",
        feedback: null,
      });
      navigate("/result");
      return;
    }

    setIndex(nextIndex);
    setAnswer("");
    setFeedback(null);

    saveSession({
      questions,
      index: nextIndex,
      scores: finalScores,
      answerDraft: "",
      feedback: null,
    });
  };

  const onEvaluate = async () => {
    if (!answer.trim() || !current) return;

    setLoading(true);
    setError(null);

    try {
      const res = await withTimeout(
        evaluateAnswer({
          settings,
          question: current,
          answer,
        })
      );

      const updated = [...scores];
      updated[index] = res;

      setScores(updated);
      setFeedback(res);

      saveSession({
        questions,
        index,
        scores: updated,
        answerDraft: answer,
        feedback: res,
      });

      if (autoAdvance) setTimeout(() => next(updated), 650);
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to evaluate answer.");
    } finally {
      setLoading(false);
    }
  };

  const onNextSmart = async () => {
    if (!answer.trim()) return;
    if (!feedback) {
      await onEvaluate();
      return;
    }
    next();
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
  };

  const restartSession = async () => {
    // regenerate a fresh set of questions without leaving the page
    if (!settings?.field) return;
    setLoading(true);
    setError(null);
    try {
      const res = await withTimeout(generateQuestions(settings));
      const qs = res?.questions || [];
      setQuestions(qs);
      setIndex(0);
      setScores([]);
      setAnswer("");
      setFeedback(null);
      saveSession({
        questions: qs,
        index: 0,
        scores: [],
        answerDraft: "",
        feedback: null,
      });
    } catch (e) {
      console.error(e);
      setError("Failed to restart. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!settings?.field) return null;

  return (
    <div className="page">
      <div className="container">
        {/* Header */}
        <motion.div
          className="row wrap between"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div>
            <h2 className="title">{settings.fieldLabel} Interview</h2>
            <p className="muted">
              Level: {settings.level} • Question {Math.min(index + 1, total)}/{total}
            </p>
          </div>

          <div className="row wrap gap-sm">
            <label className="switch">
              <input
                type="checkbox"
                checked={autoAdvance}
                onChange={(e) => setAutoAdvance(e.target.checked)}
              />
              <span>Auto-advance</span>
            </label>

            <label className="switch">
              <input
                type="checkbox"
                checked={showExpected}
                onChange={(e) => setShowExpected(e.target.checked)}
              />
              <span>Show expected</span>
            </label>

            <button className="btn btn-ghost" onClick={() => navigate("/select")}>
              Change Track
            </button>
          </div>
        </motion.div>

        <div className="spacer" />

        <ProgressBar value={progress} meta={`${doneCount}/${total} evaluated • Avg ${avgScore}/100`} />

        {error && (
          <div className="card" style={{ borderColor: "rgba(255,92,122,.55)" }}>
            <div className="row between wrap">
              <p className="muted" style={{ margin: 0 }}>{error}</p>
              <button className="btn btn-ghost" onClick={restartSession} disabled={loading}>
                Try Again
              </button>
            </div>
          </div>
        )}

        <div className="spacer" />

        {/* Loading */}
        {loading && (
          <div className="card">
            <p className="muted">Loading…</p>
            <div className="skeleton" style={{ height: 18, width: "85%" }} />
            <div className="skeleton" style={{ height: 18, width: "65%", marginTop: 10 }} />
            <div className="skeleton" style={{ height: 160, width: "100%", marginTop: 16 }} />
          </div>
        )}

        {/* Main */}
        {!loading && current && (
          <div className="interview-shell">
            {/* LEFT: question + answer */}
            <motion.div
              key={index}
              className="card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22 }}
            >
              <div className="row between wrap">
                <div className="muted">
                  Question <b>{index + 1}</b> / {total}
                </div>
                <span className="chip">Mock Interview</span>
              </div>

              <div className="spacer-sm" />
              <h3 style={{ margin: 0, lineHeight: 1.35 }}>{current}</h3>

              <div className="divider" />

              <div className="row between wrap">
                <label style={{ margin: 0 }}>Your Answer</label>
                <span className="chip">Tip: STAR works best</span>
              </div>

              <div className="spacer-sm" />

              <textarea
                className="input"
                rows={9}
                value={answer}
                onChange={(e) => {
                  const v = e.target.value;
                  setAnswer(v);

                  if (saveDraftTimer.current) clearTimeout(saveDraftTimer.current);
                  saveDraftTimer.current = setTimeout(() => {
                    persist({ answerDraft: v });
                  }, 220);
                }}
                placeholder="Write your answer here..."
              />

              <p className="muted" style={{ marginTop: 10 }}>
                Structure suggestion: <b>Situation → Task → Action → Result</b>
              </p>

              <div className="row wrap gap-sm" style={{ marginTop: 10 }}>
                <button className="btn btn-ghost" onClick={() => copyText(current)} title="Copy question">
                  Copy Question
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={() => copyText(answer)}
                  disabled={!answer.trim()}
                  title="Copy your answer"
                >
                  Copy Answer
                </button>
              </div>
            </motion.div>

            {/* RIGHT: side panel */}
            <div className="interview-side">
              <div className="card soft interview-side-top">
                <div className="side-image">
                  {/* Put an image in: /public/interview-hero.jpg */}
                  <img
                    className="side-img"
                    src="/interview-hero.jpg"
                    alt="Interview practice"
                    onError={(e) => {
                      // if image missing, hide it gracefully
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <div className="side-overlay">
                    <div className="side-title">Stay Calm, Answer Smart</div>
                    <div className="side-sub">Small structure beats long text.</div>
                  </div>
                </div>

                <div className="side-stats">
                  <div className="side-stat">
                    <div className="muted">Progress</div>
                    <div className="side-big">{progress}%</div>
                  </div>
                  <div className="side-stat">
                    <div className="muted">Avg Score</div>
                    <div className="side-big">{avgScore}</div>
                  </div>
                  <div className="side-stat">
                    <div className="muted">Best</div>
                    <div className="side-big">{bestScore}</div>
                  </div>
                </div>

                <div className="divider" />

                <div className="side-section">
                  <div className="side-h">Quick Tips</div>
                  <ul className="nice-list" style={{ marginTop: 8 }}>
                    <li><b>Start with context</b> (1–2 lines).</li>
                    <li><b>Name tools</b> you used (e.g., Linux, AD, React).</li>
                    <li><b>Show impact</b> (time saved, uptime, speed).</li>
                    <li><b>Mention trade-offs</b> (security vs usability).</li>
                    <li><b>End with result</b> and what you learned.</li>
                  </ul>
                </div>

                <div className="divider" />

                <div className="side-actions">
                  <button className="btn" onClick={restartSession} disabled={loading}>
                    Regenerate Questions
                  </button>
                  <button className="btn btn-ghost" onClick={() => navigate("/result")}>
                    Go to Result
                  </button>
                </div>
              </div>

              {/* Feedback card on right (desktop) */}
              <AnimatePresence>
                {feedback && (
                  <motion.div
                    className="card"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="row wrap between">
                      <div className="row wrap gap-sm">
                        <h3 style={{ margin: 0 }}>AI Feedback</h3>
                        {feedback?.score != null && <span className="chip">Score: {feedback.score}</span>}
                      </div>

                      <button className="btn btn-ghost" onClick={() => setShowExpected((s) => !s)}>
                        {showExpected ? "Hide Expected" : "Show Expected"}
                      </button>
                    </div>

                    <div className="spacer-sm" />
                    <p style={{ whiteSpace: "pre-line" }}>{feedback.feedback}</p>

                    {Array.isArray(feedback.keyPoints) && feedback.keyPoints.length > 0 && (
                      <>
                        <div className="spacer-sm" />
                        <h4>Key points to mention</h4>
                        <ul className="nice-list">
                          {feedback.keyPoints.map((k, i) => (
                            <li key={i}>{k}</li>
                          ))}
                        </ul>
                      </>
                    )}

                    {showExpected && feedback.expectedAnswer && (
                      <>
                        <div className="divider" />
                        <h4>Expected Answer</h4>
                        <div className="expected">
                          <pre className="expectedText">{feedback.expectedAnswer}</pre>
                        </div>

                        <div className="row wrap gap-sm" style={{ marginTop: 10 }}>
                          <button
                            className="btn btn-ghost"
                            onClick={() => copyText(feedback.expectedAnswer)}
                          >
                            Copy Expected
                          </button>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sticky action bar (bottom) */}
            <div className="actionbar">
              <div className="row wrap gap-sm">
                <button className="btn" onClick={onEvaluate} disabled={!canEvaluate}>
                  {loading ? "Evaluating..." : isEvaluated ? "Re-Evaluate" : "Evaluate"}
                </button>

                {feedback?.score != null && <ScoreBadge score={feedback.score} />}

                <button className="btn btn-primary" onClick={onNextSmart} disabled={!canNext}>
                  {isEvaluated ? "Next" : "Next (Auto Evaluate)"}
                </button>
              </div>

              <div className="row wrap gap-sm">
                <button className="btn btn-ghost" onClick={() => navigate("/")} title="Home">
                  Home
                </button>
                <button className="btn btn-ghost" onClick={() => navigate("/result")} title="Result">
                  Result
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

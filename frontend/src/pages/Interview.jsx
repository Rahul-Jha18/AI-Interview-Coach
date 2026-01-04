import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import ProgressBar from "../components/ProgressBar.jsx";
import ScoreBadge from "../components/ScoreBadge.jsx";

import { generateQuestions, evaluateAnswer } from "../services/interviewApi.js";
import { getSettings, loadSession, saveSession } from "../utils/storage.js";

export default function Interview() {
  const navigate = useNavigate();
  const settings = getSettings();

  const startedRef = useRef(false);
  const saveDraftTimer = useRef(null);

  useEffect(() => {
    if (!settings?.field) navigate("/", { replace: true });
  }, [settings, navigate]);

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);

  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [scores, setScores] = useState([]);

  const [autoAdvance, setAutoAdvance] = useState(false);
  const [showExpected, setShowExpected] = useState(true);

  // Restore session
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

  // Load questions if no session
  useEffect(() => {
    const run = async () => {
      if (!settings?.field) return;
      if (startedRef.current) return;
      startedRef.current = true;

      const session = loadSession();
      if (session?.questions?.length) return;

      setLoading(true);
      try {
        const res = await generateQuestions(settings);
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
        alert("Failed to generate questions. Check API config.");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [settings]);

  const current = questions[index];

  const { progress, doneCount, total } = useMemo(() => {
    const done = (scores || []).filter(Boolean).length;
    const total = questions.length || settings?.count || 0;
    const p = total ? Math.round((done / total) * 100) : 0;
    return { progress: p, doneCount: done, total };
  }, [scores, questions.length, settings]);

  const isEvaluated = !!feedback;
  const canEvaluate = !!answer.trim() && !loading;
  const canNext = !!answer.trim() && !loading;

  const persist = (patch) => {
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
    if (!answer.trim()) return alert("Write your answer first.");
    if (!current) return;

    setLoading(true);
    try {
      const res = await evaluateAnswer({
        settings,
        question: current,
        answer,
      });

      const newScores = [...scores];
      newScores[index] = res;

      setScores(newScores);
      setFeedback(res);

      saveSession({
        questions,
        index,
        scores: newScores,
        answerDraft: answer,
        feedback: res,
      });

      if (autoAdvance) setTimeout(() => next(newScores), 650);
    } catch (e) {
      console.error(e);
      alert("Failed to evaluate answer.");
    } finally {
      setLoading(false);
    }
  };

  const onNextSmart = async () => {
    if (!answer.trim()) return alert("Write your answer first.");
    if (!current) return;

    if (!feedback) {
      await onEvaluate();
      return;
    }
    next();
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore
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
          </div>
        </motion.div>

        <div className="spacer" />

        <ProgressBar value={progress} meta={`${doneCount}/${total} evaluated`} />

        <div className="spacer" />

        {loading && (
          <div className="card">
            <p className="muted">Loading…</p>
            <div className="skeleton" style={{ height: 18, width: "85%" }} />
            <div className="skeleton" style={{ height: 18, width: "65%", marginTop: 10 }} />
            <div className="skeleton" style={{ height: 120, width: "100%", marginTop: 16 }} />
          </div>
        )}

        {!loading && current && (
          <div className="grid modern-grid">
            {/* SINGLE MAIN CARD */}
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
                rows={8}
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
            </motion.div>

            {/* Sticky action bar */}
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
                <button
                  className="btn btn-ghost"
                  onClick={() => copyText(current)}
                  disabled={!current}
                  title="Copy question"
                >
                  Copy Q
                </button>

                <button
                  className="btn btn-ghost"
                  onClick={() => copyText(answer)}
                  disabled={!answer.trim()}
                  title="Copy your answer"
                >
                  Copy A
                </button>
              </div>
            </div>

            {/* Feedback */}
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
                      <h4>Expected Answer (AI)</h4>
                      <p className="muted" style={{ marginTop: 0 }}>
                        Compare with your answer and improve.
                      </p>

                      <div className="expected">
                        <pre className="expectedText">{feedback.expectedAnswer}</pre>
                      </div>

                      <div className="row wrap gap-sm" style={{ marginTop: 10 }}>
                        <button className="btn btn-ghost" onClick={() => copyText(feedback.expectedAnswer)}>
                          Copy Expected
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

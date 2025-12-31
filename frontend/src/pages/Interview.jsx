import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import QuestionCard from "../components/QuestionCard.jsx";
import AnswerBox from "../components/AnswerBox.jsx";
import ProgressBar from "../components/ProgressBar.jsx";
import ScoreBadge from "../components/ScoreBadge.jsx";
import { generateQuestions, evaluateAnswer } from "../services/interviewApi.js";
import { getSettings, loadSession, saveSession } from "../utils/storage.js";

export default function Interview() {
  const navigate = useNavigate();
  const settings = getSettings();

  // Prevent React StrictMode double-run from calling generate twice (dev only)
  const startedRef = useRef(false);

  useEffect(() => {
    if (!settings) navigate("/", { replace: true });
  }, [settings, navigate]);

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);

  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null); // {score, feedback, keyPoints}
  const [scores, setScores] = useState([]); // per question

  // UX options
  const [autoAdvance, setAutoAdvance] = useState(false);

  // restore session if exists
  useEffect(() => {
    const session = loadSession();
    if (session?.questions?.length) {
      setQuestions(session.questions);
      setIndex(session.index || 0);
      setScores(session.scores || []);
      setAnswer(session.answerDraft || "");
      setFeedback(session.feedback || null);
      setLoading(false);
    }
  }, []);

  // initial load questions (only if no session exists)
  useEffect(() => {
    const run = async () => {
      if (!settings) return;

      // dev guard (StrictMode runs effects twice)
      if (startedRef.current) return;
      startedRef.current = true;

      const session = loadSession();
      if (session?.questions?.length) return;

      setLoading(true);
      try {
        const res = await generateQuestions(settings);
        const qs = res.questions || [];
        setQuestions(qs);

        // reset session for new run
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

  // better progress: show completed questions
  const progress = useMemo(() => {
    if (!questions.length) return 0;
    return Math.round((index / questions.length) * 100);
  }, [index, questions.length]);

  const isEvaluated = !!feedback;
  const canEvaluate = !!answer.trim() && !loading;
  const canNext = !!answer.trim() && !loading; // next will auto-evaluate if needed

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

      if (autoAdvance) {
        setTimeout(() => next(newScores), 600);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to evaluate answer.");
    } finally {
      setLoading(false);
    }
  };

  // Next that only moves forward (expects evaluated already)
  const next = (scoresOverride) => {
    const nextIndex = index + 1;

    if (nextIndex >= questions.length) {
      saveSession({
        questions,
        index,
        scores: scoresOverride || scores,
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
      scores: scoresOverride || scores,
      answerDraft: "",
      feedback: null,
    });
  };

  // Smart Next: auto-evaluate if not evaluated yet
  const onNextSmart = async () => {
    if (!answer.trim()) return alert("Write your answer first.");
    if (!current) return;

    // If not evaluated yet, evaluate first
    if (!feedback) {
      await onEvaluate();
      return;
    }

    // Already evaluated -> go next
    next();
  };

  if (!settings) return null;

  return (
    <div className="container">
      <div className="row wrap" style={{ justifyContent: "space-between" }}>
        <div>
          <h2>{settings.fieldLabel} Interview</h2>
          <p className="muted">
            Level: {settings.level} • Question {index + 1}/{questions.length || settings.count}
          </p>
        </div>

        <label className="switch">
          <input
            type="checkbox"
            checked={autoAdvance}
            onChange={(e) => setAutoAdvance(e.target.checked)}
          />
          <span>Auto-advance</span>
        </label>
      </div>

      <div className="spacer" />
      <ProgressBar value={progress} />

      <div className="spacer" />
      {loading && <p className="muted">Loading...</p>}

      {!loading && current && (
        <div className="grid">
          <QuestionCard index={index + 1} total={questions.length} question={current} />

          <AnswerBox value={answer} onChange={(v) => { setAnswer(v); persist({ answerDraft: v }); }} />

          <div className="row wrap">
            <button className="btn" onClick={onEvaluate} disabled={!canEvaluate}>
              {loading ? "Evaluating..." : isEvaluated ? "Re-Evaluate" : "Evaluate"}
            </button>

            {feedback?.score != null && <ScoreBadge score={feedback.score} />}

            <button className="btn btn-primary" onClick={onNextSmart} disabled={!canNext}>
              {isEvaluated ? "Next" : "Next (Auto Evaluate)"}
            </button>
          </div>

          {feedback && (
            <div className="card">
              <h3>Feedback</h3>
              <p>{feedback.feedback}</p>

              {Array.isArray(feedback.keyPoints) && feedback.keyPoints.length > 0 && (
                <>
                  <h4>Key points to mention</h4>
                  <ul>
                    {feedback.keyPoints.map((k, i) => (
                      <li key={i}>{k}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getSettings, loadSession, clearSession } from "../utils/storage.js";

export default function Result() {
  const navigate = useNavigate();
  const settings = getSettings();
  const session = loadSession();

  const { avg, answered } = useMemo(() => {
    const scores = session?.scores || [];
    const valid = scores.filter(Boolean);
    const answered = valid.length;
    const avg =
      answered === 0
        ? 0
        : Math.round(valid.reduce((a, b) => a + (b.score || 0), 0) / answered);
    return { avg, answered };
  }, [session]);

  const restart = () => {
    clearSession();
    navigate("/", { replace: true });
  };

  if (!settings) {
    return (
      <div className="container">
        <p>No session found.</p>
        <button className="btn" onClick={() => navigate("/")}>Go Home</button>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>Result</h2>
      <p className="muted">{settings.fieldLabel} • {settings.level}</p>

      <div className="card">
        <h3>Overall Score: {avg}/100</h3>
        <p className="muted">Answered: {answered} questions</p>

        <div className="spacer" />
        <h4>Per-question recap</h4>
        <ol>
          {(session?.questions || []).map((q, i) => (
            <li key={i}>
              <div className="muted">{q}</div>
              <div>
                Score: {session?.scores?.[i]?.score ?? "—"} / 100
              </div>
            </li>
          ))}
        </ol>

        <div className="spacer" />
        <button className="btn" onClick={restart}>Start New Interview</button>
      </div>
    </div>
  );
}

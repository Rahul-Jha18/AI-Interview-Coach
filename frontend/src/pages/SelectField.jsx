import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { analyzeProfile } from "../services/interviewApi.js";
import { saveSettings, clearSession } from "../utils/storage.js";

export default function SelectField() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState("");
  const [loading, setLoading] = useState(false);
  const [ai, setAi] = useState(null);

  const analyze = async () => {
    if (profile.trim().length < 5) {
      alert("Please describe your background.");
      return;
    }

    setLoading(true);
    try {
      const res = await analyzeProfile(profile);
      setAi(res);
    } catch (e) {
      console.error(e);
      alert("AI analysis failed: " + (e?.message || e));
    } finally {

      setLoading(false);
    }
  };

  const start = () => {
    clearSession();
    saveSettings({
      field: ai.domain,
      fieldLabel: ai.role,
      level: ai.level,
      count: 8,
      profileText: profile,
    });
    navigate("/interview");
  };

  return (
    <div className="container">
      <h1>Describe Your Background</h1>
      <p className="muted">
        Any field. Any role. AI will prepare your interview.
      </p>

      <div className="card">
        <label>Your profile / interest</label>
        <textarea
          className="input"
          rows={5}
          value={profile}
          onChange={(e) => setProfile(e.target.value)}
          placeholder="Example: MBA finance graduate with interest in banking"
        />

        <div className="spacer" />
        <button className="btn btn-primary" onClick={analyze} disabled={loading}>
          {loading ? "Analyzing..." : "Analyze Profile"}
        </button>
      </div>

      {ai && (
        <div className="card" style={{ marginTop: 14 }}>
          <h3>AI Understanding</h3>

          <p><b>Domain:</b> {ai.domain}</p>
          <p><b>Role:</b> {ai.role}</p>
          <p><b>Level:</b> {ai.level}</p>

          <div className="row wrap" style={{ marginTop: 10 }}>
            <button className="btn btn-primary" onClick={start}>
              Start Interview
            </button>
            <button className="btn" onClick={() => setAi(null)}>
              Edit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

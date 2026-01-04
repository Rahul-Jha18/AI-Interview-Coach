import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
    if (!ai?.domain) return;
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
              <h1 style={{ marginBottom: 6 }}>Describe Your Background</h1>
              <p className="muted">
                Any field. Any role. AI will prepare your interview questions.
              </p>
            </div>

            <button className="btn btn-ghost" onClick={() => navigate("/")}>
              Back Home
            </button>
          </div>

          <div className="divider" />

          <label>Your profile / interest</label>
          <textarea
            className="input"
            rows={6}
            value={profile}
            onChange={(e) => setProfile(e.target.value)}
            placeholder="Example: MBA finance graduate with interest in banking"
          />

          <div className="spacer" />

          <div className="row wrap">
            <button className="btn btn-primary" onClick={analyze} disabled={loading}>
              {loading ? "Analyzing..." : "Analyze Profile"}
            </button>

            <button
              className="btn"
              onClick={() => {
                setProfile("");
                setAi(null);
              }}
              disabled={loading && !ai}
            >
              Clear
            </button>
          </div>
        </motion.div>

        <AnimatePresence>
          {ai && (
            <motion.div
              className="card"
              style={{ marginTop: 14 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.22 }}
            >
              <div className="row wrap between">
                <h3 style={{ margin: 0 }}>AI Understanding</h3>
                <span className="chip">Ready</span>
              </div>

              <div className="spacer-sm" />

              <div className="grid grid-3">
                <div className="card soft">
                  <div className="stat-title">Domain</div>
                  <div className="big-mini">{ai.domain}</div>
                </div>
                <div className="card soft">
                  <div className="stat-title">Role</div>
                  <div className="big-mini">{ai.role}</div>
                </div>
                <div className="card soft">
                  <div className="stat-title">Level</div>
                  <div className="big-mini">{ai.level}</div>
                </div>
              </div>

              <div className="row wrap" style={{ marginTop: 12 }}>
                <button className="btn btn-primary" onClick={start}>
                  Start Interview
                </button>
                <button className="btn btn-ghost" onClick={() => setAi(null)}>
                  Edit
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

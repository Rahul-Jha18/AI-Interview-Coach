import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import fields from "../data/fields.js";
import { saveSettings, clearSession } from "../utils/storage.js";

export default function SelectField() {
  const navigate = useNavigate();

  const fieldOptions = useMemo(() => fields.map(f => f.key), []);
  const [field, setField] = useState(fieldOptions[0] || "frontend");
  const [level, setLevel] = useState("junior");
  const [count, setCount] = useState(8);

  const fieldLabel = fields.find(f => f.key === field)?.label || field;

  const start = () => {
    clearSession();
    saveSettings({ field, fieldLabel, level, count });
    navigate("/interview");
  };

  return (
    <div className="container">
      <h1>AI Interview Coach</h1>
      <p className="muted">Pick a track and start your mock interview.</p>

      <div className="card grid">
        <div className="grid grid-2">
          <div>
            <label>Field</label>
            <select value={field} onChange={(e) => setField(e.target.value)}>
              {fields.map((f) => (
                <option key={f.key} value={f.key}>{f.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label>Level</label>
            <select value={level} onChange={(e) => setLevel(e.target.value)}>
              <option value="intern">Intern</option>
              <option value="junior">Junior</option>
              <option value="mid">Mid</option>
              <option value="senior">Senior</option>
            </select>
          </div>
        </div>

        <div>
          <label>Number of questions</label>
          <input
            className="input"
            type="number"
            min="3"
            max="20"
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
          />
        </div>

        <div className="row">
          <button className="btn" onClick={start}>Start Interview</button>
        </div>
      </div>
    </div>
  );
}

export default function AnswerBox({ value, onChange }) {
  return (
    <div className="card">
      <div className="row between wrap">
        <label style={{ margin: 0 }}>Your Answer</label>
        <span className="chip">Tip: STAR works best</span>
      </div>

      <div className="spacer-sm" />

      <textarea
        className="input"
        rows={8}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write your answer here..."
      />

      <p className="muted" style={{ marginTop: 10 }}>
        Structure suggestion: <b>S</b>ituation → <b>T</b>ask → <b>A</b>ction → <b>R</b>esult
      </p>
    </div>
  );
}

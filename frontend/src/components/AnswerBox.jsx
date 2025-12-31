export default function AnswerBox({ value, onChange }) {
  return (
    <div className="card">
      <label>Your Answer</label>
      <textarea
        className="input"
        rows={8}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write your answer here..."
      />
      <p className="muted">
        Tip: Use STAR (Situation, Task, Action, Result) for behavioral questions.
      </p>
    </div>
  );
}

export default function QuestionCard({ index, total, question }) {
  return (
    <div className="card">
      <div className="muted">Question {index} / {total}</div>
      <h3>{question}</h3>
    </div>
  );
}

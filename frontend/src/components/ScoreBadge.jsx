export default function ScoreBadge({ score }) {
  const label =
    score >= 85 ? "Excellent" :
    score >= 70 ? "Good" :
    score >= 50 ? "Average" : "Needs Work";

  return (
    <span className="pill">
      <b>{score}/100</b> • {label}
    </span>
  );
}

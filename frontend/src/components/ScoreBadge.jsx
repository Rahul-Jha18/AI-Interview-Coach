export default function ScoreBadge({ score }) {
  const s = Number(score ?? 0);
  const label =
    s >= 85 ? "Excellent" :
    s >= 70 ? "Good" :
    s >= 50 ? "Average" : "Needs Work";

  return (
    <span className="pill">
      <b>{s}/100</b> • {label}
    </span>
  );
}

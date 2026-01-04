export default function ProgressBar({ value, meta }) {
  const safe = Math.max(0, Math.min(100, Number(value || 0)));

  return (
    <div className="card">
      <div className="row between">
        <div className="muted">Progress: {safe}%</div>
        {meta ? <div className="muted">{meta}</div> : null}
      </div>

      <div className="progress-outer">
        <div className="progress-inner" style={{ width: `${safe}%` }} />
      </div>
    </div>
  );
}

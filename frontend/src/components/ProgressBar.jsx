export default function ProgressBar({ value, meta }) {
  return (
    <div className="card">
      <div className="row between">
        <div className="muted">Progress: {value}%</div>
        {meta ? <div className="muted">{meta}</div> : null}
      </div>

      <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 999, height: 12 }}>
        <div
          style={{
            width: `${value}%`,
            height: 12,
            borderRadius: 999,
            background: "linear-gradient(90deg, #7c3aed, #22c55e, #60a5fa)",
            transition: "width 220ms ease",
          }}
        />
      </div>
    </div>
  );
}

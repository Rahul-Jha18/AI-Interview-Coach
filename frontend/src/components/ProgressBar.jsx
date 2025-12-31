export default function ProgressBar({ value }) {
  return (
    <div className="card">
      <div className="muted">Progress: {value}%</div>
      <div style={{ background: "#0e1530", borderRadius: 10, height: 12 }}>
        <div
          style={{
            width: `${value}%`,
            height: 12,
            borderRadius: 10,
            background: "#4f7cff",
            transition: "width 200ms ease"
          }}
        />
      </div>
    </div>
  );
}

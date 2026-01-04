    import { useEffect, useMemo, useState } from "react";

export default function Typewriter({
  texts = [],
  speed = 40,
  pause = 1200,
  loop = true,
  className = "",
}) {
  const list = useMemo(
    () => (Array.isArray(texts) ? texts : [String(texts)]),
    [texts]
  );

  const [i, setI] = useState(0);
  const [out, setOut] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!list.length) return;

    const full = list[i % list.length];
    const doneTyping = out === full;
    const doneDeleting = out === "";

    const tick = () => {
      if (!deleting) {
        const next = full.slice(0, out.length + 1);
        setOut(next);
        if (next === full) {
          setTimeout(() => setDeleting(true), pause);
        }
      } else {
        const next = full.slice(0, Math.max(0, out.length - 1));
        setOut(next);
        if (next === "") {
          setDeleting(false);
          setI((x) =>
            loop ? (x + 1) % list.length : Math.min(x + 1, list.length - 1)
          );
        }
      }
    };

    const delay = deleting ? Math.max(18, speed * 0.6) : speed;
    const t = setTimeout(tick, doneTyping && !deleting ? pause : delay);
    return () => clearTimeout(t);
  }, [out, deleting, i, list, speed, pause, loop]);

  return (
    <span className={className}>
      {out}
      <span className="tw-caret" />
    </span>
  );
}

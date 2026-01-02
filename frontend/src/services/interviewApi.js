async function postJSON(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res.json();
}

/* ---------- NEW: Analyze free-text profile ---------- */
export const analyzeProfile = (profile) =>
  postJSON("/api/interview?action=analyze", { profile });

/* ---------- Generate interview questions ---------- */
export const generateQuestions = (settings) =>
  postJSON("/api/interview?action=generate", {
    fieldLabel: settings.fieldLabel,
    level: settings.level,
    count: settings.count,
  });

/* ---------- Evaluate answer ---------- */
export const evaluateAnswer = ({ settings, question, answer }) =>
  postJSON("/api/interview?action=evaluate", {
    fieldLabel: settings.fieldLabel,
    level: settings.level,
    question,
    answer,
  });

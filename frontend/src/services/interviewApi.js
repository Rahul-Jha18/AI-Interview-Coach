const BASE = "http://localhost:3001";

async function postJSON(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Request failed");
  }
  return res.json();
}

export const generateQuestions = (settings) =>
  postJSON(`${BASE}/api/interview/generate`, {
    fieldLabel: settings.fieldLabel,
    level: settings.level,
    count: settings.count,
  });

export const evaluateAnswer = ({ settings, question, answer }) =>
  postJSON(`${BASE}/api/interview/evaluate`, {
    fieldLabel: settings.fieldLabel,
    level: settings.level,
    question,
    answer,
  });

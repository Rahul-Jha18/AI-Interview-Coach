async function postJSON(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const generateQuestions = (settings) =>
  postJSON(`/api/interview?action=generate`, {
    fieldLabel: settings.fieldLabel,
    level: settings.level,
    count: settings.count,
  });

export const evaluateAnswer = ({ settings, question, answer }) =>
  postJSON(`/api/interview?action=evaluate`, {
    fieldLabel: settings.fieldLabel,
    level: settings.level,
    question,
    answer,
  });

import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export default async function handler(req, res) {
  // Allow requests from your deployed site + local dev
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });

  const { action } = req.query;
  const body = req.body || {};

  try {
    if (action === "generate") {
      const { fieldLabel, level, count } = body;
      if (!fieldLabel || !level || !count) {
        return res.status(400).json({ error: "Missing fieldLabel/level/count" });
      }

      const prompt = `
You are an interview coach.
Create ${count} interview questions for the role "${fieldLabel}" at "${level}" level.
Rules:
- Mix technical + scenario + behavioral questions.
- Keep questions short and clear.
Return ONLY JSON:
{ "questions": ["...","..."] }
      `.trim();

      const text = await callLLM(prompt);
      const data = safeJson(text);

      if (!data?.questions?.length) {
        return res.status(500).json({ error: "Bad AI response", raw: text });
      }

      return res.status(200).json({ questions: data.questions });
    }

    if (action === "evaluate") {
      const { fieldLabel, level, question, answer } = body;
      if (!fieldLabel || !level || !question || !answer) {
        return res.status(400).json({ error: "Missing fieldLabel/level/question/answer" });
      }

      const prompt = `
You are an interview evaluator.
Role: ${fieldLabel}
Level: ${level}

Question: ${question}
Candidate answer: ${answer}

Give:
- score: number 0-100
- feedback: 3-6 lines
- keyPoints: 3-6 bullets

Return ONLY JSON:
{ "score": 0, "feedback": "...", "keyPoints": ["..."] }
      `.trim();

      const text = await callLLM(prompt);
      const data = safeJson(text);

      if (typeof data?.score !== "number") {
        return res.status(500).json({ error: "Bad AI response", raw: text });
      }

      return res.status(200).json({
        score: data.score,
        feedback: data.feedback || "",
        keyPoints: Array.isArray(data.keyPoints) ? data.keyPoints : [],
      });
    }

    return res.status(400).json({ error: "Invalid action. Use ?action=generate or ?action=evaluate" });
  } catch (err) {
    return res.status(500).json({ error: "Server error", detail: String(err?.message || err) });
  }
}

async function callLLM(prompt) {
  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

  const resp = await groq.chat.completions.create({
    model,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
  });

  return resp.choices?.[0]?.message?.content || "";
}

function safeJson(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

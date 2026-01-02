// server.js
import express from "express";
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const app = express();
app.use(express.json({ limit: "1mb" }));

// CORS (ok for dev; tighten for prod)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  next();
});

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
    hasKey: !!process.env.GROQ_API_KEY,
  });
});

app.post("/api/interview", async (req, res) => {
  const { action } = req.query;
  const body = req.body || {};

  try {
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ error: "Missing GROQ_API_KEY in .env" });
    }

    if (action === "generate") {
      const { fieldLabel, level, count } = body;
      if (!fieldLabel || !level || !count) {
        return res.status(400).json({ error: "Missing fieldLabel/level/count" });
      }

      const n = clampInt(count, 3, 20);

      const prompt = `
You are an interview coach.
Create ${n} interview questions for the role "${fieldLabel}" at "${level}" level.

Rules:
- Mix technical + scenario + behavioral questions.
- Keep questions short, clear, and practical.
- Avoid duplicates.
- Do not add numbering like "1." inside the question text.

Return ONLY JSON:
{ "questions": ["...","..."] }
`.trim();

      const text = await callLLM(prompt);
      const data = safeJson(text);

      if (!data?.questions?.length) {
        return res.status(500).json({ error: "Bad AI response", raw: text });
      }

      // sanitize questions
      const questions = data.questions
        .filter((q) => typeof q === "string" && q.trim().length > 3)
        .map((q) => q.replace(/^\d+[\).\s-]+/, "").trim())
        .slice(0, n);

      if (!questions.length) {
        return res.status(500).json({ error: "Bad AI response (empty)", raw: text });
      }

      return res.status(200).json({ questions });
    }

    if (action === "evaluate") {
      const { fieldLabel, level, question, answer } = body;
      if (!fieldLabel || !level || !question || !answer) {
        return res.status(400).json({ error: "Missing fieldLabel/level/question/answer" });
      }

      const prompt = `
You are an interview evaluator and coach.

Role: ${fieldLabel}
Level: ${level}

Question: ${question}
Candidate answer: ${answer}

Give:
- score: number 0-100
- feedback: 3-6 lines (clear, actionable, kind tone)
- keyPoints: 3-6 bullet items
- expectedAnswer: a strong model answer (6-12 lines) in simple, interview-ready language

Return ONLY JSON:
{ "score": 0, "feedback": "...", "keyPoints": ["..."], "expectedAnswer": "..." }
`.trim();

      const text = await callLLM(prompt);
      const data = safeJson(text);

      if (typeof data?.score !== "number") {
        return res.status(500).json({ error: "Bad AI response", raw: text });
      }

      return res.status(200).json({
        score: clampInt(data.score, 0, 100),
        feedback: typeof data.feedback === "string" ? data.feedback.trim() : "",
        keyPoints: Array.isArray(data.keyPoints)
          ? data.keyPoints
              .filter((k) => typeof k === "string" && k.trim())
              .slice(0, 10)
          : [],
        expectedAnswer:
          typeof data.expectedAnswer === "string" ? data.expectedAnswer.trim() : "",
      });
    }

    return res
      .status(400)
      .json({ error: "Invalid action. Use ?action=generate or ?action=evaluate" });
  } catch (err) {
    // helpful Groq error formatting
    const msg = String(err?.message || err);
    return res.status(500).json({ error: "Server error", detail: msg });
  }
});

async function callLLM(prompt) {
  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

  const resp = await groq.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content:
          "You are a careful assistant. Always return valid JSON only, with no markdown or extra text.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.3,
  });

  return resp.choices?.[0]?.message?.content || "";
}

function safeJson(text) {
  if (!text) return null;

  // Try direct parse first
  try {
    return JSON.parse(text);
  } catch {
    // Fallback: extract first {...} block
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1) return null;

    try {
      return JSON.parse(text.slice(start, end + 1));
    } catch {
      return null;
    }
  }
}

function clampInt(val, min, max) {
  const n = Number(val);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.round(n)));
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));

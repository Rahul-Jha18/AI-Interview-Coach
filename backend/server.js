import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Frontend runs on Vite default port 5173
app.use(cors({ origin: ["http://localhost:5173"], credentials: true }));
app.use(express.json({ limit: "1mb" }));

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

app.get("/health", (req, res) => {
  res.json({ ok: true, message: "Backend running" });
});

app.post("/api/interview/generate", async (req, res) => {
  try {
    const { fieldLabel, level, count } = req.body || {};
    if (!fieldLabel || !level || !count) {
      return res.status(400).json({ error: "Missing fieldLabel/level/count" });
    }

    const prompt = `
You are an interview coach.
Create ${count} interview questions for the role "${fieldLabel}" at "${level}" level.
Rules:
- Mix technical + scenario + behavioral questions.
- Keep questions short and clear.
Return ONLY JSON (no extra text):
{ "questions": ["...","..."] }
`.trim();

    const text = (await callLLM(prompt)).trim();
    const data = safeJson(text);

    if (!data?.questions?.length) {
      return res.status(500).json({
        error: "Bad AI response (expected JSON with questions[])",
        raw: text,
      });
    }

    return res.json({ questions: data.questions });
  } catch (err) {
    console.error("Generate error:", err?.message || err);
    return res.status(500).json({ error: "Server error", detail: String(err?.message || err) });
  }
});

app.post("/api/interview/evaluate", async (req, res) => {
  try {
    const { fieldLabel, level, question, answer } = req.body || {};
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
- score: number 0-100 (strict)
- feedback: 3-6 lines
- keyPoints: 3-6 bullets

Return ONLY JSON (no extra text):
{
  "score": 0,
  "feedback": "....",
  "keyPoints": ["...","..."]
}
`.trim();

    const text = (await callLLM(prompt)).trim();
    const data = safeJson(text);

    if (typeof data?.score !== "number") {
      return res.status(500).json({
        error: "Bad AI response (expected JSON with score)",
        raw: text,
      });
    }

    return res.json({
      score: data.score,
      feedback: data.feedback || "",
      keyPoints: Array.isArray(data.keyPoints) ? data.keyPoints : [],
    });
  } catch (err) {
    console.error("Evaluate error:", err?.message || err);
    return res.status(500).json({ error: "Server error", detail: String(err?.message || err) });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
  console.log("GROQ_API_KEY loaded?", !!process.env.GROQ_API_KEY);
  console.log("GROQ_MODEL:", process.env.GROQ_MODEL || "llama-3.1-70b-versatile");
});

async function callLLM(prompt) {
  // Fallback demo mode if no key (so UI runs)
  if (!process.env.GROQ_API_KEY) {
    return JSON.stringify({
      questions: [
        "Tell me about yourself and your recent projects.",
        "Explain a challenge you faced and how you solved it.",
        "How do you debug an issue when you don't know the cause?"
      ],
    });
  }

  const model = process.env.GROQ_MODEL || "llama-3.1-70b-versatile";

  const resp = await groq.chat.completions.create({
    model,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
  });

  return resp.choices?.[0]?.message?.content || "";
}

function safeJson(text) {
  // tries to extract JSON even if model adds extra text
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) return null;

  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}
    
import express from "express";
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const app = express();
app.use(express.json({ limit: "1mb" }));

/* ------------------ CORS ------------------ */
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  next();
});

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/* ------------------ HEALTH ------------------ */
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    model: process.env.GROQ_MODEL,
    hasKey: !!process.env.GROQ_API_KEY,
  });
});

/* ------------------ MAIN API ------------------ */
app.post("/api/interview", async (req, res) => {
  const { action } = req.query;
  const body = req.body || {};

  try {
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ error: "Missing GROQ_API_KEY" });
    }

    /* ========== ANALYZE PROFILE (NEW) ========== */
    if (action === "analyze") {
      const { profile } = body;

      if (!profile || profile.trim().length < 5) {
        return res.status(400).json({ error: "Profile text too short" });
      }

      const prompt = `
You are an expert career advisor.

User profile:
"${profile}"

Infer:
- domain (broad field)
- role (interview role)
- level (intern | junior | mid | senior)

Rules:
- If experience unclear, assume Junior
- Be interview focused
- Do not explain

Return ONLY JSON:
{
  "domain": "...",
  "role": "...",
  "level": "intern|junior|mid|senior"
}
`.trim();

      const text = await callLLM(prompt);
      const data = safeJson(text);

      if (!data?.role || !data?.level) {
        return res.status(500).json({ error: "Bad AI analysis", raw: text });
      }

      return res.json({
        domain: data.domain || "General",
        role: data.role,
        level: data.level,
      });
    }

    /* ========== GENERATE QUESTIONS ========== */
    if (action === "generate") {
      const { fieldLabel, level, count } = body;
      if (!fieldLabel || !level || !count) {
        return res.status(400).json({ error: "Missing parameters" });
      }

      const n = clampInt(count, 10, 30);


      const prompt = `
You are an interview coach.

Create ${n} interview questions for:
Role: "${fieldLabel}"
Level: "${level}"

Rules:
- Mix technical, scenario, behavioral
- Short, clear, practical
- No numbering

Return ONLY JSON:
{ "questions": ["...","..."] }
`.trim();

      const text = await callLLM(prompt);
      const data = safeJson(text);

      if (!Array.isArray(data?.questions)) {
        return res.status(500).json({ error: "Bad AI response", raw: text });
      }

      return res.json({
        questions: data.questions.slice(0, n),
      });
    }

    /* ========== EVALUATE ANSWER ========== */
    if (action === "evaluate") {
      const { fieldLabel, level, question, answer } = body;

      if (!fieldLabel || !level || !question || !answer) {
        return res.status(400).json({ error: "Missing parameters" });
      }

      const prompt = `
You are an interview evaluator.

Role: ${fieldLabel}
Level: ${level}

Question:
${question}

Candidate Answer:
${answer}

Give:
- score (0-100)
- feedback (3-6 lines)
- keyPoints (3-6 bullets)
- expectedAnswer (strong model answer)

Return ONLY JSON:
{
  "score": 0,
  "feedback": "...",
  "keyPoints": ["..."],
  "expectedAnswer": "..."
}
`.trim();

      const text = await callLLM(prompt);
      const data = safeJson(text);

      if (typeof data?.score !== "number") {
        return res.status(500).json({ error: "Bad AI response", raw: text });
      }

      return res.json({
        score: clampInt(data.score, 0, 100),
        feedback: data.feedback || "",
        keyPoints: Array.isArray(data.keyPoints) ? data.keyPoints : [],
        expectedAnswer: data.expectedAnswer || "",
      });
    }

    return res.status(400).json({ error: "Invalid action" });
  } catch (err) {
    return res.status(500).json({
      error: "Server error",
      detail: String(err?.message || err),
    });
  }
});

/* ------------------ HELPERS ------------------ */
async function callLLM(prompt) {
  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

  const resp = await groq.chat.completions.create({
    model,
    messages: [
      { role: "system", content: "Return only valid JSON." },
      { role: "user", content: prompt },
    ],
    temperature: 0.3,
  });

  return resp.choices?.[0]?.message?.content || "";
}

function safeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    const s = text.indexOf("{");
    const e = text.lastIndexOf("}");
    if (s === -1 || e === -1) return null;
    try {
      return JSON.parse(text.slice(s, e + 1));
    } catch {
      return null;
    }
  }
}

function clampInt(n, min, max) {
  n = Number(n);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.round(n)));
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});

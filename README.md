<img width="1240" height="647" alt="image" src="https://github.com/user-attachments/assets/e617d0a1-aaff-47ba-a6c9-8c738c47de98" />
<img width="1271" height="635" alt="image" src="https://github.com/user-attachments/assets/7fb5ea82-a503-4fad-9de0-c376c7c6a193" />
<img width="1197" height="647" alt="image" src="https://github.com/user-attachments/assets/c8f31ba5-fcc1-4e40-8485-13b545b70c5e" />
<img width="957" height="468" alt="image" src="https://github.com/user-attachments/assets/87731652-f7da-4064-a796-e49d92f6d13d" />
.

🎯 AI Interview Coach

AI Interview Coach is a full-stack web application that simulates real interview experiences using AI. It allows users to practice interview questions one-by-one, receive instant AI-generated feedback, and track performance across an entire interview session.

Designed with a clean, responsive UI and a smooth interview flow, this project focuses on real-world interview preparation, not just question generation.

🚀 Features

🔹 AI-Generated Interview Questions
Dynamic questions based on selected role, experience level, and number of questions.

🔹 Step-by-Step Interview Flow
Questions are answered one at a time — users must evaluate before moving forward.

🔹 Instant AI Evaluation
Each answer is scored with:

Numerical score (0–100)

Detailed feedback

Key points to improve

🔹 Auto-Evaluate & Auto-Advance
“Next” button automatically evaluates unanswered responses and moves to the next question.

🔹 Session Persistence
Progress is saved in local storage — refresh the page and continue where you left off.

🔹 Final Interview Summary
Overall score and per-question recap at the end of the interview.

🔹 Modern, Mobile-First UI
Fully responsive design with a hamburger menu and touch-friendly controls.

🧠 Tech Stack
Frontend

React (Vite)

React Router

Modern CSS (mobile-first, responsive)

LocalStorage for session persistence

Backend

Node.js

Express

Groq AI API (LLaMA models)

RESTful API architecture

🏗️ Project Architecture
ai-interview-coach/
│
├── frontend/        # React SPA
│   ├── pages/
│   ├── components/
│   ├── services/
│   └── utils/
│
├── backend/         # Express + AI API
│   ├── server.js
│   └── .env
│
└── README.md

⚙️ How It Works

User selects interview field, level, and question count

AI generates role-specific interview questions

User answers questions one by one

Each answer is evaluated instantly by AI

Progress is tracked and saved automatically

Final result page shows overall performance

🎓 Why This Project Matters

This project demonstrates:

Real-world AI integration

Clean UX flow design

Full-stack development skills

Thoughtful state management

Production-style architecture

Perfect for showcasing AI-powered applications, frontend UX, and backend API design in a single project.

📌 Future Enhancements


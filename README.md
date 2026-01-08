<img width="1348" height="650" alt="image" src="https://github.com/user-attachments/assets/2a1c3f1e-170c-479a-8373-eea8b3e8731b" />
<img width="1300" height="653" alt="image" src="https://github.com/user-attachments/assets/c462e043-7ae2-49a5-a5cf-c875eaaa9a29" />
<img width="1233" height="648" alt="image" src="https://github.com/user-attachments/assets/3d22a8a9-7c49-445b-a09c-aa885f03d695" />
<img width="1285" height="652" alt="image" src="https://github.com/user-attachments/assets/c2f56c5d-576f-44c4-8eed-0f172fbdba50" />

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



# AI-Powered Interview Preparation Platform

A full-stack MERN application with RAG pipeline for personalized technical interview practice.

## Tech Stack

- **Frontend**: React 18 + Vite, Tailwind CSS, Framer Motion, React Router v6
- **Backend**: Node.js, Express.js, MongoDB/Mongoose
- **AI/RAG**: LangChain, OpenAI (GPT-3.5-turbo + text-embedding-ada-002)
- **Auth**: JWT + bcryptjs

## Features

- Resume PDF upload and parsing
- RAG pipeline: resume chunked, embedded, stored in MemoryVectorStore
- AI-generated personalized interview questions (10 per session)
- Real-time answer evaluation with score, feedback, strengths, model answer
- Session summary with overall score + recommendations
- Beautiful dark glassmorphism UI

## Project Structure

```
Ai-Interview/
├── backend/
│   ├── src/
│   │   ├── config/         # DB, env config
│   │   ├── controllers/    # Route handlers
│   │   ├── services/       # Business logic (auth, rag, llm, resume, interview, session)
│   │   ├── models/         # Mongoose models (User, Resume, Interview, Session)
│   │   ├── routes/         # Express routers
│   │   ├── middleware/     # Auth, error handler, upload, validation
│   │   └── utils/          # PDF parser, vector store, LangChain prompts
│   └── server.js
└── frontend/
    └── src/
        ├── pages/          # Landing, Auth, Dashboard, Interview, Results, Profile
        ├── components/     # Navbar, StatCard, ResumeCard, QuestionCard, EvaluationPanel...
        ├── context/        # AuthContext, InterviewContext
        ├── hooks/          # useResume
        └── services/       # api.js (axios instance)
```

## Setup & Run

### 1. Prerequisites
- Node.js >= 18
- MongoDB running locally (or Atlas URI)
- OpenAI API Key

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env: set MONGODB_URI and OPENAI_API_KEY
npm install
npm run dev
```

Backend runs at http://localhost:5000

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at http://localhost:3000 (proxied to backend)

## API Endpoints

### Auth — `/api/auth`
| Method | Path | Description |
|--------|------|-------------|
| POST | /register | Register new user |
| POST | /login | Login |
| GET | /profile | Get profile (protected) |
| PUT | /profile | Update profile (protected) |

### Resume — `/api/resume`
| Method | Path | Description |
|--------|------|-------------|
| POST | /upload | Upload PDF resume (protected) |
| GET | / | List resumes (protected) |
| GET | /:id | Get resume (protected) |
| DELETE | /:id | Delete resume (protected) |

### Interview — `/api/interview`
| Method | Path | Description |
|--------|------|-------------|
| POST | /create | Generate AI questions (protected) |
| GET | / | List interviews (protected) |
| GET | /:id | Get interview (protected) |

### Session — `/api/session`
| Method | Path | Description |
|--------|------|-------------|
| POST | /create | Start session (protected) |
| POST | /:id/answer | Submit & evaluate answer (protected) |
| PUT | /:id/complete | Complete session (protected) |
| GET | /:id | Get session (protected) |
| GET | / | List sessions (protected) |

## Environment Variables

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai-interview
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-3.5-turbo
NODE_ENV=development
```

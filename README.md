# AutoHire.AI

An autonomous, GPT-powered job application agent that reads emails, optimizes resumes, and submits applications automatically.

## Quick Start

### Backend
```bash
cd backend
npm install
cp ../.env.example ../.env   # Fill in your API keys
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Project Structure
- `backend/` — Node.js/Express API server
- `frontend/` — React.js dashboard
- `ml/` — Python notebooks for ATS model training
- `scripts/` — Utility and test scripts
- `docs/` — Documentation

## Environment Variables
Copy `.env.example` to `.env` and fill in:
- `OPENAI_API_KEY` — from platform.openai.com
- `GMAIL_CLIENT_ID` / `GMAIL_CLIENT_SECRET` — from Google Cloud Console
- `MONGO_URI` — your MongoDB connection string
- `JWT_SECRET` — any random long string
- `HUGGINGFACE_API_KEY` — from huggingface.co

## Core Modules
1. Email Scanner — Gmail API reads unread emails
2. Job Extractor — NLP pulls job details from emails
3. Resume Optimizer — GPT-4 rewrites resume for each job
4. ATS Scorer — Keyword matching scores resume fit
5. Auto Apply — Selenium submits applications
6. Dashboard — React frontend tracks everything

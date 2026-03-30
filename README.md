# Alatus Pulse

A unified AI-powered analytics command center built as a proof-of-concept for [Alatus Solutions](https://www.alatussolutions.com) — a dental industry MarTech firm running two products: **DentalPost** (dental job board) and **IllumiTrac** (membership subscription SaaS).

## The Problem

Alatus operates two products that share the same customer — dental practices.
As the product portfolio grows, so does the opportunity for a unified view of
practice health that combines signals from both platforms. A practice struggling
to hire on DentalPost while losing membership members on IllumiTrac tells a
different story together than either product shows independently.

Alatus Pulse explores what that unified layer could look like.

## What It Does

- **Unified Practice Health Score** — a composite 0–100 score per practice combining DentalPost hiring velocity and IllumiTrac membership retention signals
- **Live Activity Feed** — real-time WebSocket stream of events across both products as they happen
- **Natural Language Queries** — ask questions about your portfolio in plain English, powered by Claude AI with structured tool use against live data
- **Practice Drilldown** — click any practice to see their full cross-product story: open jobs, fill rate, MRR, churn rate, and recent event history
- **Filterable Practice Table** — filter by health tier, product signal, or search by name with sort toggle

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  React Frontend                 │
│         (Vite + TypeScript + Tailwind)          │
│                                                 │
│  Dashboard → Practices Table → Drilldown Modal  │
│  Live Feed (WebSocket) → Ask Pulse (AI Query)   │
└──────────────┬──────────────────────────────────┘
               │ HTTP + WebSocket
┌──────────────▼──────────────────────────────────┐
│               FastAPI Backend                   │
│                                                 │
│  /api/practices      — practice list + scores   │
│  /api/practices/:id  — drilldown + events       │
│  /api/query          — Claude tool use engine   │
│  /ws/live-feed       — WebSocket event stream   │
└──────────────┬──────────────────────────────────┘
               │ SQLAlchemy ORM
┌──────────────▼──────────────────────────────────┐
│                  SQLite / MySQL                 │
│                                                 │
│  practices        — health scores + signals     │
│  practice_events  — cross-product event log     │
└─────────────────────────────────────────────────┘
               │ Tool Use API
┌──────────────▼──────────────────────────────────┐
│              Anthropic Claude API               │
│                                                 │
│  Structured tool use — Claude decides which     │
│  DB queries to run based on natural language,   │
│  executes them, and synthesizes the answer      │
└─────────────────────────────────────────────────┘
```

## Tech Stack

| Layer     | Technology                            |
| --------- | ------------------------------------- |
| Frontend  | React, TypeScript, Vite, Tailwind CSS |
| Backend   | Python, FastAPI, SQLAlchemy           |
| Database  | SQLite (dev) / MySQL (prod)           |
| Real-time | WebSockets                            |
| AI        | Anthropic Claude API (tool use)       |
| Charts    | Recharts                              |

## Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- Anthropic API key

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` folder:

```
DATABASE_URL=sqlite:///./alatus_pulse.db
ANTHROPIC_API_KEY=your_key_here
```

Seed the database and start the server:

```bash
python3 seed.py
uvicorn main:app --reload
```

API runs at `http://localhost:8000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`

## Key Technical Decisions

**Claude Tool Use over prompt injection** — instead of dumping raw data into a prompt, Claude is given typed tools (`get_struggling_practices`, `get_churn_analysis`, etc.) and decides which ones to call based on the question. This keeps answers grounded in real data and makes the system extensible.

**WebSockets over polling** — the live feed maintains a persistent connection and broadcasts events server-side, avoiding the latency and overhead of repeated HTTP requests.

**Composite health score** — rather than showing raw metrics, each practice gets a single 0–100 score that weights hiring velocity and membership retention together. This surfaces cross-product risk that neither product would catch independently.

**SQLite for development** — zero setup, file-based, swappable to MySQL with a single env var change to match Alatus's production stack.

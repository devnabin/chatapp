# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

BinChat: a real-time chat app with a React (Vite) frontend and a FastAPI backend. The two live in sibling directories (`frontend/`, `backend/`) with no shared tooling (no monorepo workspace, no Docker Compose) — install and run each independently.

## Commands

### Frontend (`frontend/`)
- `npm install` — install deps
- `npm run dev` — start Vite dev server
- `npm run build` — production build
- `npm run lint` — ESLint (flat config, `eslint.config.js`)
- `npm run preview` — preview the production build

There is no test runner configured (no Jest/Vitest, no test files).

### Backend (`backend/`)
- `pip install -r requirements.txt` — install deps (FastAPI, Uvicorn, Pydantic, python-dotenv)
- `uvicorn main:app --reload` — run the API (defaults to port 8000, matching the frontend's hardcoded backend URL)

No test suite, linter, or CI config exists for the backend either.

## Architecture

### Frontend routing and auth
Routes are declared in `src/App.jsx` (React Router v7): `/`, `/register`, `/login`, `/home/:username`. `ProtectedRoute` (`src/components/ProtecterdRoute.jsx` — filename typo, not `Protected`) exists but is currently commented out in `App.jsx`, so `/home/:username` is unprotected.

There's no real token-based auth: on login, `localStorage["accessToken"]` is set to the plain username string (`Login.jsx`), and `ProtectedRoute` just checks that this key is non-empty. The same value is sent as a `Bearer` header on the `/ai/chat` request, but the backend doesn't validate it.

The backend base URL is hardcoded as `http://127.0.0.1:8000` independently in `Login.jsx`, `Register.jsx`, and `Dashboard.jsx` (`API_URL`/`WS_URL`) — there's no shared config or env var for it on the frontend.

### Chat (`src/components/Dashboard.jsx`)
This is the core of the app:
- Opens a WebSocket to `ws://127.0.0.1:8000/ws/{username}` on mount and reconnects on unmount/username change.
- Polls `GET /active` every 15s for the active-user list (used as the contact list).
- Two chat modes per contact: real users (messages sent over the WebSocket as `{type: "private_message", recipient, message}`) and a client-only "BinChat AI" pseudo-contact (messages sent via `POST /ai/chat`).
- `POST /ai/chat` is **not implemented on the backend** — AI chat currently always falls through to the catch-block error message in the UI.
- Language/status preferences are stored client-side only, in `localStorage` (`binchat-language`, `binchat-status`).

### Styling
Tailwind CSS v4 via `@tailwindcss/vite`. Theme tokens (colors, dark mode) are defined as CSS custom properties in `src/index.css`, toggled with a `.dark` class on `<html>`. Most components use Tailwind utility classes directly; `Dashboard.jsx` is the exception and pulls its styles from `Dashboard.css`.

### Backend (`backend/`)
- `main.py` — FastAPI app: `/register`, `/login`, `GET /active`, `/ws/{username}` WebSocket. CORS is wide open (`allow_origins=["*"]`).
- `webconnection.py` — `ConnectionManager`: an in-memory list of `{websocket, username}` dicts (no persistence across restarts). `broadcast`/`send_personal_message` helpers exist but aren't currently wired to any route.
- `loadFileData.py` — `UsersLoggedIn`/`smallDB`: a flat-file JSON "database". Path comes from the `DATABASE` env var (`backend/.env`, loaded via `config.py`/pydantic-settings) and points at `backend/database.txt` (gitignored).
- There is no real database and no password hashing — user records including plaintext passwords are read/written directly to `database.txt`, and login does a plaintext string comparison (`loadFileData.py`). Flag this if asked to touch auth/registration — it's a known gap, not a design to replicate elsewhere.

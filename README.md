# AI Interview Coach

Monorepo for the interview coach. The Next.js app is in `frontend` and the FastAPI API is in `backend`.

## Local API

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

SQLite is created at `backend/data/interviewer.db`. Health check: `GET /health`.

Session routes live under `/api/v1`:

- `POST /sessions`
- `GET /sessions/{id}/questions`
- `POST /sessions/{id}/submit`
- `GET /sessions/{id}/evaluation`

```bash
cd backend
pytest
```

## Local frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

The page is a placeholder until interview screens are designed. `NEXT_PUBLIC_API_URL` is reserved for those screens.

## Deploy

### Vercel

Import the GitHub repo and set the root directory to `frontend`. Vercel detects Next.js. Set `NEXT_PUBLIC_API_URL` to the Render service URL when the UI starts calling the API.

### Render

Use the blueprint in `render.yaml`, or create a Python web service with:

- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Health check path: `/health`

Set `CORS_ORIGINS` to the Vercel URL (comma-separated if you have more than one). The blueprint mounts a disk at `/var/data` and sets `DATABASE_PATH=/var/data/interviewer.db` so SQLite survives restarts. Persistent disks need a paid Render instance.

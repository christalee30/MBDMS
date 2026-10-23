# MBDMS – Blood Drive Manager

Student prototype for managing mobile blood donation drives. **Fictional data only** – not an official Philippine Red Cross system. Never enter real donor or medical information.

**Stack:** Node.js + Express · Supabase (Postgres) · plain HTML/CSS/JS · Render

```
├── src/
│   ├── server.js          App entry, middleware, error handler
│   ├── config.js          Environment variables
│   ├── db.js              Supabase client + small query helpers
│   ├── utils.js           Validation helpers, HttpError
│   └── routes/            admin, activities, donors, screenings, donations
├── public/                Frontend (index.html, styles.css, app.js)
├── supabase/schema.sql    Tables, security, demo data
├── render.yaml            Render deploy config
└── .env.example
```

## 1. Supabase
1. Create a project at https://supabase.com.
2. SQL Editor → New query → paste `supabase/schema.sql` → Run.
3. Project Settings → API: copy the **Project URL** and the **service_role** key.

> The `service_role` key bypasses all security. Keep it in `.env` / Render env vars only.

## 2. Run locally
```bash
npm install
cp .env.example .env     # fill in the two Supabase values
npm start                # http://localhost:3000
```

## 3. Push to a NEW GitHub repository
This folder has no git history, so it can go to any new repo:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<your-username>/<new-repo-name>.git
git push -u origin main
```
If GitHub rejects the push, make sure the new repo is empty (no README/licence added at creation) and that `git remote -v` shows the new URL.

## 4. Deploy on Render
New + → Web Service (or Blueprint using `render.yaml`) → connect the repo → add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` → Deploy.
Free Render services sleep when idle; free Supabase projects pause after ~1 week of inactivity.

## API
| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/health` | Health check |
| GET | `/api/summary` | Counts |
| GET / POST | `/api/activities` | List / add activity |
| GET / POST | `/api/donors` | List / register donor |
| GET / POST | `/api/screenings` | List / record screening |
| GET / POST | `/api/donations` | List / record donation (needs a "Cleared" screening for the same donor + activity) |
| POST | `/api/reset` | Restore demo data |

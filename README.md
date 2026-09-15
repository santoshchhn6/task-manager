# Task Manager — React + Node.js + MySQL

A full-stack task manager with **light/dark theme**, built with:

- **Frontend:** React 18 (Vite)
- **Backend:** Node.js + Express REST API
- **Database:** MySQL 8 (runs in Docker via `docker-compose.yml`)

## Features

- ✅ Create, edit, delete tasks
- 📋 Status workflow: To Do → In Progress → Done (checkbox or dropdown)
- 🔥 Priority levels (low / medium / high) with color badges
- 📅 Due dates with overdue highlighting
- 🔍 Search + status filter tabs
- 📊 Stats dashboard (total / to do / in progress / done)
- 🌗 **Light & dark theme** — toggle button, persisted in `localStorage`, follows OS preference by default

## Project structure

```
task-manager/
├── docker-compose.yml        # MySQL 8 container (+ auto-applies schema.sql)
├── server/                   # Express API (port 4000)
│   ├── schema.sql            # tasks table definition
│   ├── .env.example
│   └── src/
│       ├── index.js          # app entry, health check
│       ├── db.js             # mysql2 connection pool
│       └── routes/tasks.js   # CRUD endpoints
└── client/                   # React app (Vite dev server on port 5173)
    └── src/
        ├── App.jsx
        ├── api.js            # fetch wrapper for the API
        ├── hooks/useTheme.js # light/dark theme hook
        └── components/       # Header, TaskForm, TaskList, TaskItem
```

## Prerequisites

- Node.js ≥ 18
- Docker (for MySQL) — or any local MySQL/MariaDB server

## Setup & run

### 1. Start MySQL

```bash
docker compose up -d
```

This starts MySQL 8 on port `3306` and automatically creates the
`task_manager` database, an `appuser`, and applies `server/schema.sql`.

> **Using a local MySQL instead of Docker?** Create the database and user manually:
> ```sql
> CREATE DATABASE task_manager;
> CREATE USER 'appuser'@'localhost' IDENTIFIED BY 'apppass';
> GRANT ALL PRIVILEGES ON task_manager.* TO 'appuser'@'localhost';
> FLUSH PRIVILEGES;
> -- then run: mysql -u root -p task_manager < server/schema.sql
> ```

### 2. Run the API server

```bash
cd server
cp .env.example .env      # adjust if your DB credentials differ
npm install
npm run dev               # → http://localhost:4000
```

Verify: `curl http://localhost:4000/api/health` → `{"status":"ok","db":true}`

### 3. Run the React client

```bash
cd client
npm install
npm run dev               # → http://localhost:5173
```

Open **http://localhost:5173** — the Vite dev server proxies `/api/*` to the backend, so no CORS setup is needed in development.

## API reference

| Method | Endpoint             | Description                                  |
| ------ | -------------------- | -------------------------------------------- |
| GET    | `/api/health`        | Server + DB health check                     |
| GET    | `/api/tasks`         | List tasks (`?status=todo&search=foo`)       |
| POST   | `/api/tasks`         | Create task `{title, description?, priority?, dueDate?}` |
| PUT    | `/api/tasks/:id`     | Update any subset of fields                  |
| DELETE | `/api/tasks/:id`     | Delete a task                                |

Example:

```bash
curl -X POST http://localhost:4000/api/tasks \
  -H 'Content-Type: application/json' \
  -d '{"title":"Write report","priority":"high","dueDate":"2025-12-31"}'
```

## Theme behavior

- Click **☀️ Light / 🌙 Dark** in the header to switch.
- Your choice is saved in `localStorage` (`tm-theme`) and restored on reload (an inline script applies it before first paint — no flash).
- If you've never chosen manually, the app follows your OS `prefers-color-scheme`.

## Production build

```bash
cd client && npm run build   # outputs static files to client/dist/
```

Serve `client/dist` from any static host and point it at the API (or set a proxy in your web server). The API is stateless, so you can scale it horizontally.

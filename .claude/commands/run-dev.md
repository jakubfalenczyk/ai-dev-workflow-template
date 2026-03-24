# Run Dev Servers

Start both the backend (Express) and frontend (Vite) development servers for this project.

## Prerequisites Check

Before starting, verify:
1. Node.js v18+ is installed: `node --version`
2. Dependencies are installed in both `client/` and `server/` directories
3. Server database is initialized

## Step 1: Install Dependencies (if needed)

```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd client && npm install
```

## Step 2: Initialize Database (first-time setup only)

If `server/prisma/dev.db` does not exist, run:

```bash
cd server
npx prisma generate
npx prisma db push
npm run seed
```

## Step 3: Start Both Servers

Run each in a separate terminal:

**Terminal 1 — Backend (Express on port 3000):**
```bash
cd server
npm run dev
```

**Terminal 2 — Frontend (Vite on port 5173):**
```bash
cd client
npm run dev
```

## URLs

| Service | URL |
|---------|-----|
| Frontend (React/Vite) | http://localhost:5173 |
| Backend (Express API) | http://localhost:3000 |
| Health check | http://localhost:3000/health |
| Prisma Studio (optional) | Run `cd server && npx prisma studio` |

## Environment Variables

Ensure `server/.env` exists with:
```
DATABASE_URL="file:./dev.db"
PORT=3000
```

The client's API base URL is pre-configured in `client/src/lib/apiClient.ts` to point at `http://localhost:3000`.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Port 3000 already in use | Kill the process: `npx kill-port 3000` or change `PORT` in `server/.env` |
| Port 5173 already in use | Vite will auto-increment to 5174 — check terminal output |
| Prisma client not found | Run `cd server && npx prisma generate` |
| Database missing/corrupt | Run `cd server && npx prisma db push --force-reset && npm run seed` |
| CORS errors in browser | Ensure backend is running on port 3000 |
| Module not found errors | Run `npm install` in the affected directory |

# MARKETPLACE_APP

Production-oriented monorepo for a classifieds marketplace: public web, admin panel, iOS/Android app and REST API.

## Requirements and start

Node.js 22+, npm 10+ and Docker Compose v2 are required.

```powershell
Copy-Item .env.example .env
npm install
docker compose up -d
npm run db:generate
npm run dev
```

Web: `http://localhost:3000`; admin: `http://localhost:3001`; API: `http://localhost:4000/api/v1`; Swagger: `http://localhost:4000/docs`; MinIO: `http://localhost:9001`.

Run `npm run lint`, `npm run typecheck`, `npm run build` and `npm run format:check` before committing. See [architecture](docs/ARCHITECTURE.md) and [roadmap](docs/ROADMAP.md).

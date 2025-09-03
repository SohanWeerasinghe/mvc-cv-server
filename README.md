# MCP Resume Chat + Email Server (with optional Next.js playground)

This project delivers:
1) An **MCP-style tools server** that can:
   - Chat about your CV by parsing a resume file into structured JSON and answering questions.
   - Send email notifications via SMTP (or dry-run to a local `outbox/` folder).
2) A **minimal Next.js playground** to chat with the server and trigger emails.

> ⚠️ Note on MCP: This repo exposes an HTTP+WebSocket JSON-RPC server with `tools/list` and `tools/call` endpoints that mirror MCP's tool-call behavior so you can integrate with a typical MCP client. For strict MCP integrations, point your MCP client at the WebSocket endpoint `wss://<host>/ws`.

## Quick Start (Local)

### 1) Server
```bash
cd server
cp .env.example .env          # fill in SMTP values or leave for dry-run
npm i
npm run dev                   # runs on http://localhost:8787
```
- Replace the sample resume at `server/data/resume.md` with yours (Markdown or plain text). The server parses to JSON on boot.

### 2) Playground (optional)
```bash
cd ../web
npm i
npm run dev                   # runs on http://localhost:3000
```
- The playground proxies to the server at `http://localhost:8787` by default.

## Deployment

- **Server**: Designed to run on any Node host (Railway, Fly.io, Render, Cloud Run). See `server/Dockerfile` and `server/fly.toml` (sample) for guidance.
- **Web**: Next.js can deploy to Vercel/Netlify/Render easily; set env `NEXT_PUBLIC_SERVER_URL` to your server URL.

## API & MCP-like Endpoints

### REST (for the playground)
- `POST /api/ask` — body `{ "question": "..." }` → `{ "answer": "..." }`
- `POST /api/email` — body `{ "to": "...", "subject": "...", "body": "..." }` → `{ "status": "sent"|"queued"|"dry-run" }`

### JSON-RPC over WebSocket (MCP-like)
- `WS /ws` — JSON-RPC 2.0
  - `tools/list` → returns available tools
  - `tools/call` with `{ "name": "ask_resume", "args": {"question": "..."} }`
  - `tools/call` with `{ "name": "send_email", "args": {"to": "...", "subject": "...", "body": "..."} }`

> The server returns structured results and truncated context snippets to keep payloads compact. For real MCP SDK usage, you can swap `src/rpc.ts` with the official SDK easily—this scaffold isolates transport from business logic.

## Replace the Resume

- Put your resume text/Markdown at `server/data/resume.md`.
- On boot (and on `POST /api/reload`), the server parses it into structured JSON (`/data/resume.parsed.json`).

## Security & Notes
- Email uses SMTP via `nodemailer`. If `.env` has no SMTP values, the server writes emails to `server/outbox/` as `.eml` files (dry-run).
- CORS is restricted to the playground origin; adjust `ALLOWED_ORIGIN` as needed.
- No external LLM calls are made; the Q&A is done via simple ranking and templated answers suitable for deterministic demos.

## Repo Structure

```
mcp-cv-server/
  server/
    src/
      index.ts          # boot + HTTP + WS
      resume.ts         # parsing & Q&A over resume JSON
      email.ts          # SMTP + dry-run outbox
      rpc.ts            # minimal JSON-RPC 2.0 handler (MCP-like)
      types.ts
    data/
      resume.md         # sample; replace with your CV
    outbox/             # created if dry-run mode
    package.json
    tsconfig.json
    Dockerfile
    fly.toml            # example deploy
    .env.example
  web/
    app/
      page.tsx
      api.d.ts
    next.config.mjs
    package.json
    tsconfig.json
    .env.local.example
```

---

Made with ❤️ for a quick, realistic take-home.

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import http from 'http';
import { parseResume, answerQuestion } from './resume.js';
import { sendEmail } from './email.js';
import { RpcServer } from './rpc.js';

const PORT = parseInt(process.env.PORT || '8787', 10);
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';

let resume = parseResume();

const app = express();
app.use(bodyParser.json());
app.use(cors({ origin: ALLOWED_ORIGIN === '*' ? true : ALLOWED_ORIGIN }));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.post('/api/reload', (_req, res) => {
  try {
    resume = parseResume();
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message });
  }
});

app.post('/api/ask', (req, res) => {
  const q = (req.body?.question || '').toString();
  if (!q) return res.status(400).json({ error: 'question required' });
  const out = answerQuestion(resume, q);
  res.json(out);
});

app.post('/api/email', async (req, res) => {
  const { to, subject, body } = req.body || {};
  if (!to || !subject || !body) return res.status(400).json({ error: 'to, subject, body required' });
  try {
    const result = await sendEmail({ to, subject, body });
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'email failed' });
  }
});

const server = http.createServer(app);

// WebSocket JSON-RPC (MCP-like)
const rpc = new RpcServer(server, '/ws');

rpc.registerTool({
  name: 'ask_resume',
  description: 'Answer a question about the parsed resume. Args: { question: string }',
  schema: {
    type: 'object',
    properties: { question: { type: 'string' } },
    required: ['question']
  },
  handler: async ({ question }) => {
    return answerQuestion(resume, String(question));
  }
});

rpc.registerTool({
  name: 'send_email',
  description: 'Send an email via SMTP or dry-run to outbox. Args: { to, subject, body }',
  schema: {
    type: 'object',
    properties: {
      to: { type: 'string' },
      subject: { type: 'string' },
      body: { type: 'string' }
    },
    required: ['to','subject','body']
  },
  handler: async ({ to, subject, body }) => {
    return await sendEmail({ to: String(to), subject: String(subject), body: String(body) });
  }
});

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  console.log(`WebSocket (MCP-like) at ws://localhost:${PORT}/ws`);
});

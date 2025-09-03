'use client';

import { useState } from 'react';

const SERVER = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8787';

export default function Home() {
  const [q, setQ] = useState('What are the skills?');
  const [ans, setAns] = useState<string>('');
  const [to, setTo] = useState('you@example.com');
  const [subject, setSubject] = useState('Hello from MCP demo');
  const [body, setBody] = useState('This is a test message.');
  const [emailStatus, setEmailStatus] = useState<string>('');

  const ask = async () => {
    setAns('Thinking...');
    try {
      const r = await fetch(`${SERVER}/api/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q })
      });
      const j = await r.json();
      setAns(j.answer || JSON.stringify(j));
    } catch (e) {
      setAns('Error connecting to server.');
    }
  };

  const sendEmail = async () => {
    setEmailStatus('Sending...');
    try {
      const r = await fetch(`${SERVER}/api/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, body })
      });
      const j = await r.json();
      setEmailStatus(j.status ? `${j.status} (${j.id})` : j.error || 'unknown');
    } catch (e) {
      setEmailStatus('Error sending email.');
    }
  };

  return (
    <main style={{ maxWidth: 800, margin: '40px auto', padding: 24, fontFamily: 'system-ui' }}>
      <h1>MCP Resume Chat + Email Demo</h1>

      {/* Chat Section */}
      <section style={{ marginTop: 24 }}>
        <h2>Chat about Resume</h2>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input
            style={{ flex: 1, padding: 8, border: '1px solid #ccc', borderRadius: 4 }}
            value={q}
            onChange={e => setQ(e.target.value)}
          />
          <button
            style={{ padding: '8px 16px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: 4 }}
            onClick={ask}
          >
            Ask
          </button>
        </div>
        <div
          style={{
            background: '#f5f5f5',
            padding: 12,
            minHeight: 100,
            borderRadius: 6,
            whiteSpace: 'pre-wrap', // preserves line breaks
            wordWrap: 'break-word'
          }}
        >
          {ans || 'Example: What are the skills?'}
        </div>
      </section>

      {/* Email Section */}
      <section style={{ marginTop: 32 }}>
        <h2>Send Email</h2>
        <div style={{ display: 'grid', gap: 8 }}>
          <input
            placeholder="Recipient"
            value={to}
            onChange={e => setTo(e.target.value)}
            style={{ padding: 8, border: '1px solid #ccc', borderRadius: 4 }}
          />
          <input
            placeholder="Subject"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            style={{ padding: 8, border: '1px solid #ccc', borderRadius: 4 }}
          />
          <textarea
            placeholder="Body"
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={6}
            style={{ padding: 8, border: '1px solid #ccc', borderRadius: 4 }}
          />
          <button
            style={{ padding: '8px 16px', background: '#28a745', color: '#fff', border: 'none', borderRadius: 4 }}
            onClick={sendEmail}
          >
            Send Email
          </button>
          <div>Status: {emailStatus || 'No status yet.'}</div>
        </div>
      </section>

      {/* Config Section */}
      <section style={{ marginTop: 32 }}>
        <h3>Configuration</h3>
        <code>NEXT_PUBLIC_SERVER_URL = {SERVER}</code>
      </section>
    </main>
  );
}

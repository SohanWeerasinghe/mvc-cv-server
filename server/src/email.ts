import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';

export type SendEmailArgs = {
  to: string;
  subject: string;
  body: string;
};

export async function sendEmail(args: SendEmailArgs): Promise<{ status: string; id: string; }> {
  const host = process.env.SMTP_HOST || '';
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';
  const from = process.env.SMTP_FROM || 'no-reply@example.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = (process.env.SMTP_SECURE || 'false') === 'true';

  if (!host || !user || !pass) {
    // dry-run: write .eml-like file
    const outDir = path.resolve(process.cwd(), 'outbox');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const file = path.join(outDir, `${id}.eml`);
    const raw = [
      `From: ${from}`,
      `To: ${args.to}`,
      `Subject: ${args.subject}`,
      '',
      args.body
    ].join('\n');
    fs.writeFileSync(file, raw);
    return { status: 'dry-run', id };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass }
  });

  const info = await transporter.sendMail({
    from, to: args.to, subject: args.subject, text: args.body
  });

  return { status: 'sent', id: info.messageId || 'sent' };
}

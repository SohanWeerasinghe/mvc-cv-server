import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import { ResumeData, ResumeJob } from './types.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');

export function parseResume(): ResumeData {
  const mdPath = path.join(DATA_DIR, 'resume.md');
  const text = fs.readFileSync(mdPath, 'utf8');
  const { data, content } = matter(text);

  // naive parse: look for headings and bullet points
  const lines = content.split('\n').map(l => l.trim());
  const exp: ResumeJob[] = [];
  let current: ResumeJob | null = null;

  for (const line of lines) {
    if (line.startsWith('## ')) {
      // Experience entry format: "## Role — Company (years)"
      const raw = line.substring(3);
      let role = raw;
      let company: string | undefined;
      let start: string | undefined;
      let end: string | undefined;

      // Split by em dash if present
      const parts = raw.split(' — ');
      if (parts.length >= 2) {
        role = parts[0].trim();
        const rest = parts[1];
        // try "Company (YYYY–YYYY)"
        const m = rest.match(/^(.*) \(([^)]+)\)$/);
        if (m) {
          company = m[1].trim();
          const years = m[2].split('–').map(s => s.trim());
          start = years[0];
          end = years[1] || undefined;
        } else {
          company = rest.trim();
        }
      }

      if (current) exp.push(current);
      current = { role, company, start, end, bullets: [] };
    } else if (line.startsWith('- ') && current) {
      current.bullets!.push(line.substring(2).trim());
    }
  }
  if (current) exp.push(current);

  const resume: ResumeData = {
    name: (data as any).name,
    title: (data as any).title,
    email: (data as any).email,
    location: (data as any).location,
    summary: extractSection(lines, '# Summary'),
    experience: exp,
    education: extractList(lines, '# Education'),
    skills: extractCsv(lines, '# Skills')
  };

  // write parsed JSON for inspection
  fs.writeFileSync(path.join(DATA_DIR, 'resume.parsed.json'), JSON.stringify(resume, null, 2));
  return resume;
}

function extractSection(lines: string[], header: string): string | undefined {
  const idx = lines.findIndex(l => l === header);
  if (idx === -1) return undefined;
  const out: string[] = [];
  for (let i = idx + 1; i < lines.length; i++) {
    const l = lines[i];
    if (l.startsWith('#')) break;
    out.push(l);
  }
  return out.join(' ').trim();
}

function extractList(lines: string[], header: string): string[] | undefined {
  const idx = lines.findIndex(l => l === header);
  if (idx === -1) return undefined;
  const out: string[] = [];
  for (let i = idx + 1; i < lines.length; i++) {
    const l = lines[i];
    if (l.startsWith('#')) break;
    if (l.startsWith('- ')) out.push(l.substring(2).trim());
    else if (l) out.push(l.trim());
  }
  return out.length ? out : undefined;
}

function extractCsv(lines: string[], header: string): string[] | undefined {
  const idx = lines.findIndex(l => l === header);
  if (idx === -1) return undefined;
  let buf: string[] = [];
  for (let i = idx + 1; i < lines.length; i++) {
    const l = lines[i];
    if (l.startsWith('#')) break;
    if (l) buf.push(l);
  }
  const csv = buf.join(' ').split(',').map(s => s.trim()).filter(Boolean);
  return csv.length ? csv : undefined;
}

export type QAResult = { answer: string; evidence?: any };

export function answerQuestion(resume: ResumeData, question: string): QAResult {
  const q = question.toLowerCase();

  // simple intents
  if (/last\s+(role|position|job)/.test(q)) {
    const last = resume.experience?.[0];
    if (last) {
      return {
        answer: `Your last position was "${last.role}"${last.company ? ` at ${last.company}` : ''}${last.start ? ` (${last.start}${last.end ? '–' + last.end : ''})` : ''}.`,
        evidence: last
      };
    }
  }

  if (/skills|tech|stack/.test(q)) {
    const s = (resume.skills || []).join(', ');
    return { answer: s ? `Skills: ${s}.` : 'No skills found in resume.', evidence: resume.skills };
  }

  if (/education|degree|bsc|msc|phd/.test(q)) {
    const e = (resume.education || []).join('; ');
    return { answer: e ? `Education: ${e}.` : 'No education info found.', evidence: resume.education };
  }

  // fallback: try to find a matching experience by keyword
  const hit = (resume.experience || []).find(job =>
    [job.role, job.company, ...(job.bullets || [])].join(' ').toLowerCase().includes(q)
  );
  if (hit) {
    return { answer: `Found related experience: ${hit.role}${hit.company ? ' at ' + hit.company : ''}.`, evidence: hit };
  }

  // generic summary
  if (/summary|about you|about me/.test(q)) {
    return { answer: resume.summary || 'No summary found.', evidence: resume.summary };
  }

  return { answer: "I couldn't find that in the resume. Try asking about last role, skills, or education.", evidence: null };
}

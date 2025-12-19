#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import readline from 'readline';

const ROOT = process.cwd();
const CLASP_PATH = path.join(ROOT, '.clasp.json');

const ask = (rl, question, fallback = '') =>
  new Promise((resolve) => {
    const prompt = fallback ? `${question} (${fallback}): ` : `${question}: `;
    rl.question(prompt, (answer) => {
      const value = String(answer || '').trim();
      resolve(value || fallback);
    });
  });

const normalizeScriptId = (input) => {
  const raw = String(input || '').trim();
  if (!raw) return '';
  const fromUrl = raw.match(/\/s\/([a-zA-Z0-9_-]+)/);
  if (fromUrl) return fromUrl[1];
  const plain = raw.match(/[A-Za-z0-9_-]{20,}/);
  if (plain) return plain[0];
  return raw.replace(/[^\w-]/g, '');
};

const readExisting = () => {
  if (!fs.existsSync(CLASP_PATH)) return null;
  try {
    const data = JSON.parse(fs.readFileSync(CLASP_PATH, 'utf8'));
    return data && typeof data === 'object' ? data : null;
  } catch (_) {
    return null;
  }
};

async function main() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    const existing = readExisting() || {};
    if (Object.keys(existing).length) {
      console.log('[bootstrap] existing .clasp.json detected. Re-writing with new values.');
    }
    const defaultScriptId = normalizeScriptId(existing.scriptId || '');
    const defaultRoot = existing.rootDir || 'dist';
    const rawScriptId = await ask(
      rl,
      'Apps Script scriptId (paste the ID or the full URL)',
      defaultScriptId
    );
    const scriptId = normalizeScriptId(rawScriptId);
    if (!scriptId) {
      console.error('[bootstrap] No scriptId provided. Aborting.');
      return;
    }
    if (rawScriptId && rawScriptId !== scriptId) {
      console.log(`[bootstrap] normalized scriptId to ${scriptId}`);
    }
    const rootDir = await ask(rl, 'Apps Script rootDir [Enter for default]', defaultRoot);
    const payload = { rootDir: rootDir || 'dist', scriptId };
    fs.writeFileSync(CLASP_PATH, `${JSON.stringify(payload, null, 2)}\n`);
    console.log(`[bootstrap] wrote ${path.relative(ROOT, CLASP_PATH)}`);
  } finally {
    rl.close();
  }
}

main().catch((err) => {
  console.error('[bootstrap] failed:', err);
  process.exitCode = 1;
});

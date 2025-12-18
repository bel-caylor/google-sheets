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

async function main() {
  if (fs.existsSync(CLASP_PATH)) {
    console.log('[bootstrap] .clasp.json already exists.');
    return;
  }

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    const scriptId = await ask(rl, 'Apps Script scriptId');
    const rootDir = await ask(rl, 'Apps Script rootDir', 'dist');
    const payload = { rootDir: rootDir || 'dist' };
    if (scriptId) payload.scriptId = scriptId;
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

import { SHEET_SCHEMAS } from './constants';
import { ensureSheet, setHeaders } from './util/sheets';

export function runInitialSetup() {
  SHEET_SCHEMAS.forEach(({ name, headers }) => {
    const sheet = ensureSheet(name);
    setHeaders(sheet, headers as string[]);
  });
  return { ok: true, sheets: SHEET_SCHEMAS.map((s) => s.name) };
}

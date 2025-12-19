import { EDITOR_ACCESS_HEADERS, SHEET_NAMES } from './constants';
import { ensureSheet, readRows, setHeaders } from './util/sheets';

export type EditorAuth = {
  email?: string;
  secret?: string;
};

const getSharedSecret = () =>
  (PropertiesService.getScriptProperties().getProperty('EDITOR_SHARED_SECRET') || '').trim();

const normalizeEmail = (value?: string | number) =>
  String(value || '')
    .trim()
    .toLowerCase();

const ensureEditorSheet = () => {
  const sheet = ensureSheet(SHEET_NAMES.EDITORS);
  const firstRow = sheet.getRange(1, 1, 1, EDITOR_ACCESS_HEADERS.length).getValues()[0] || [];
  const needsHeaders = EDITOR_ACCESS_HEADERS.some((header, idx) => firstRow[idx] !== header);
  if (needsHeaders) {
    setHeaders(sheet, Array.from(EDITOR_ACCESS_HEADERS));
  }
  return sheet;
};

const getAllowedEmails = (): string[] => {
  const sheet = ensureEditorSheet();
  const rows = readRows(sheet);
  const emails = rows
    .map((row) => normalizeEmail(row[0]))
    .filter(Boolean);
  return Array.from(new Set(emails));
};

export function requireEditor(auth?: EditorAuth) {
  const email = String(auth?.email || '').trim().toLowerCase();
  if (!email) throw new Error('Editor email required.');
  const allowedEmails = getAllowedEmails();
  if (allowedEmails.length && !allowedEmails.includes(email)) {
    throw new Error('Email is not authorized.');
  }
  const expectedSecret = getSharedSecret();
  if (expectedSecret) {
    const provided = String(auth?.secret || '').trim();
    if (!provided) throw new Error('Editor code required.');
    if (provided !== expectedSecret) throw new Error('Invalid editor code.');
  }
  return email;
}

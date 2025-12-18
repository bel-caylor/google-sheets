import { SHEET_NAMES, SAMPLE_HEADERS, SampleRow } from '../constants';
import { requireEditor, EditorAuth } from '../auth';
import { ensureSheet, readRows, setHeaders, appendRow } from '../util/sheets';

type SampleInput = {
  date?: string;
  title?: string;
  notes?: string;
  auth?: EditorAuth;
};

const headerIndex = SAMPLE_HEADERS.reduce<Record<string, number>>((acc, header, idx) => {
  acc[header] = idx;
  return acc;
}, {});

const ensureSampleSheet = () => {
  const sheet = ensureSheet(SHEET_NAMES.SAMPLE);
  const firstRow = sheet.getRange(1, 1, 1, SAMPLE_HEADERS.length).getValues()[0] || [];
  const needsHeaders = SAMPLE_HEADERS.some((header, idx) => firstRow[idx] !== header);
  if (needsHeaders) {
    setHeaders(sheet, Array.from(SAMPLE_HEADERS));
  }
  return sheet;
};

const normalizeRow = (row: (string | number)[]): SampleRow => {
  const get = (header: string) => {
    const index = headerIndex[header];
    const value = index >= 0 ? row[index] : '';
    return typeof value === 'string' ? value : value?.toString?.() || '';
  };
  return {
    date: get('Date'),
    title: get('Title'),
    notes: get('Notes')
  };
};

export function listSampleEntries(): SampleRow[] {
  const sheet = ensureSampleSheet();
  const rows = readRows(sheet);
  return rows.map((row) => normalizeRow(row));
}

export function saveSampleEntry(input: SampleInput): SampleRow[] {
  requireEditor(input?.auth);
  const sheet = ensureSampleSheet();
  const payload: (string | number)[] = [
    input.date || new Date().toISOString().slice(0, 10),
    (input.title || '').trim(),
    (input.notes || '').trim()
  ];
  if (!payload[1]) {
    throw new Error('Title is required.');
  }
  appendRow(sheet, payload);
  return listSampleEntries();
}

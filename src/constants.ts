export const SPREADSHEET_ID = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID') || '';

export const SHEET_NAMES = {
  SAMPLE: 'Sample Data',
  EDITORS: 'Editor Access'
} as const;

export const SAMPLE_HEADERS = ['Date', 'Title', 'Notes'] as const;
export const EDITOR_ACCESS_HEADERS = ['Email'] as const;

export const SHEET_SCHEMAS = [
  { name: SHEET_NAMES.SAMPLE, headers: SAMPLE_HEADERS },
  { name: SHEET_NAMES.EDITORS, headers: EDITOR_ACCESS_HEADERS }
];

export type SampleRow = {
  date: string;
  title: string;
  notes: string;
};

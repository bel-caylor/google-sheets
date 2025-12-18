export const SPREADSHEET_ID = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID') || '';

export const SHEET_NAMES = {
  SAMPLE: 'Sample Data'
} as const;

export const SAMPLE_HEADERS = ['Date', 'Title', 'Notes'] as const;

export const SHEET_SCHEMAS = [
  { name: SHEET_NAMES.SAMPLE, headers: SAMPLE_HEADERS }
];

export const ALLOWED_EDITOR_EMAILS: string[] = [];

export type SampleRow = {
  date: string;
  title: string;
  notes: string;
};

import { SPREADSHEET_ID } from '../constants';

export const getSpreadsheet = (): GoogleAppsScript.Spreadsheet.Spreadsheet => {
  if (SPREADSHEET_ID) return SpreadsheetApp.openById(SPREADSHEET_ID);
  return SpreadsheetApp.getActive();
};

export const getSheet = (name: string): GoogleAppsScript.Spreadsheet.Sheet | null =>
  getSpreadsheet().getSheetByName(name) || null;

export const ensureSheet = (name: string): GoogleAppsScript.Spreadsheet.Sheet => {
  const ss = getSpreadsheet();
  const existing = ss.getSheetByName(name);
  return existing || ss.insertSheet(name);
};

export const setHeaders = (sheet: GoogleAppsScript.Spreadsheet.Sheet, headers: string[]) => {
  if (!headers.length) return;
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.setFrozenRows(1);
};

export const readRows = (sheet: GoogleAppsScript.Spreadsheet.Sheet): string[][] => {
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow <= 1 || lastCol === 0) return [];
  const range = sheet.getRange(2, 1, lastRow - 1, lastCol);
  return range.getValues();
};

export const appendRow = (sheet: GoogleAppsScript.Spreadsheet.Sheet, row: (string | number)[]) => {
  sheet.appendRow(row);
};

export const logAllSheetHeaders = (): Record<string, string[]> => {
  const ss = getSpreadsheet();
  const out: Record<string, string[]> = {};
  ss.getSheets().forEach((s) => {
    const lastCol = s.getLastColumn();
    if (!lastCol || lastCol < 1) {
      out[s.getName()] = [];
      return;
    }
    const firstRow = s.getRange(1, 1, 1, lastCol).getValues()[0] || [];
    out[s.getName()] = firstRow.map((h) => (h || '').toString());
  });
  try {
    Logger.log(JSON.stringify(out));
  } catch (e) {
    // Logger may not be defined outside Apps Script runtime; ignore safely.
  }
  return out;
};
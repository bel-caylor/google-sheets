import { runInitialSetup } from './setup';

const TEMPLATE_MENU = 'Template';

export function onOpen() {
  try {
    SpreadsheetApp.getUi()
      .createMenu(TEMPLATE_MENU)
      .addItem('Open Web App URL', 'showWebAppUrl')
      .addItem('Initialize Sheets', 'initializeSheetsFromMenu')
      .addToUi();
  } catch (err) {
    Logger.log(err);
  }
}

export function showWebAppUrl() {
  const url = ScriptApp.getService()?.getUrl?.() || 'Deploy the web app to generate a URL.';
  SpreadsheetApp.getUi().alert(url);
}

export function initializeSheetsFromMenu() {
  const result = runInitialSetup();
  SpreadsheetApp.getUi().alert(`Created/updated sheets: ${result.sheets.join(', ')}`);
}

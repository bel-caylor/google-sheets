import { doGet, doPost, doOptions } from './http';
import { rpc } from './rpc';
import { onOpen as menuOnOpen, showWebAppUrl, initializeSheetsFromMenu } from './menu';
import { runInitialSetup } from './setup';
import { listSheetNames } from './util/sheets';

export function onOpen() {
  try {
    menuOnOpen();
  } catch (err) {
    Logger.log(err);
  }
}

export function showWebApp() {
  showWebAppUrl();
}

export function initializeSheets() {
  initializeSheetsFromMenu();
}

export function bootstrapSheets() {
  runInitialSetup();
}

// Expose for Apps Script runtime
declare const global: any;
global.doGet = doGet;
global.doPost = doPost;
global.doOptions = doOptions;
global.rpc = rpc;
global.onOpen = onOpen;
global.showWebAppUrl = showWebAppUrl;
global.initializeSheetsFromMenu = initializeSheetsFromMenu;
global.runInitialSetup = runInitialSetup;

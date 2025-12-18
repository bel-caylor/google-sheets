import { listSampleEntries } from './features/sample';
import { rpc } from './rpc';

const toJson = (payload: unknown) =>
  ContentService.createTextOutput(JSON.stringify(payload ?? null))
    .setMimeType(ContentService.MimeType.JSON);

type MaybeHttpEvent = GoogleAppsScript.Events.DoGet | GoogleAppsScript.Events.DoPost | undefined;

const resolveOrigin = (event: MaybeHttpEvent): string => {
  const headerOrigin = (() => {
    const headers = (event as { headers?: { origin?: string } } | undefined)?.headers;
    return typeof headers?.origin === 'string' ? headers.origin : '';
  })();
  const paramOrigin = typeof event?.parameter?.origin === 'string' ? event.parameter.origin : '';
  return headerOrigin || paramOrigin || '';
};

const applyCors = (
  output: GoogleAppsScript.Content.TextOutput,
  origin?: string
) => {
  const setter = (output as GoogleAppsScript.Content.TextOutput & { setHeader?: (key: string, value: string) => GoogleAppsScript.Content.TextOutput }).setHeader;
  if (typeof setter === 'function') {
    const allowOrigin = origin && origin !== 'null' ? origin : '*';
    setter.call(output, 'Access-Control-Allow-Origin', allowOrigin);
    setter.call(output, 'Access-Control-Allow-Methods', 'POST,OPTIONS');
    setter.call(output, 'Access-Control-Allow-Headers', 'Content-Type');
    setter.call(output, 'Vary', 'Origin');
  }
  return output;
};

const makeJsonResponse = (payload: unknown, origin?: string) => applyCors(toJson(payload), origin);

export function doGet() {
  const tpl = HtmlService.createTemplateFromFile('index');
  tpl.sampleData = listSampleEntries();
  try {
    const scriptUrl = ScriptApp.getService()?.getUrl?.() || '';
    tpl.baseUrl = scriptUrl;
    tpl.adminBase = scriptUrl;
  } catch (_) {
    tpl.baseUrl = '';
    tpl.adminBase = '';
  }
  return tpl.evaluate().setTitle('Sheets Starter');
}

export function doPost(e?: GoogleAppsScript.Events.DoPost) {
  const raw = e?.postData?.contents || '';
  let parsed: { method?: string; payload?: unknown } = {};
  try {
    parsed = raw ? JSON.parse(raw) : {};
  } catch (err) {
    return makeJsonResponse({ ok: false, error: 'Invalid JSON payload' }, resolveOrigin(e));
  }
  try {
    const data = rpc({ method: parsed.method || '', payload: parsed.payload });
    return makeJsonResponse({ ok: true, data }, resolveOrigin(e));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return makeJsonResponse({ ok: false, error: message }, resolveOrigin(e));
  }
}

export function doOptions(e?: GoogleAppsScript.Events.DoPost) {
  return makeJsonResponse('', resolveOrigin(e));
}

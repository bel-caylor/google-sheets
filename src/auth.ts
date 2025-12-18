import { ALLOWED_EDITOR_EMAILS } from './constants';

export type EditorAuth = {
  email?: string;
  secret?: string;
};

const getSharedSecret = () =>
  (PropertiesService.getScriptProperties().getProperty('EDITOR_SHARED_SECRET') || '').trim();

export function requireEditor(auth?: EditorAuth) {
  const email = String(auth?.email || '').trim().toLowerCase();
  if (!email) throw new Error('Editor email required.');
  if (ALLOWED_EDITOR_EMAILS.length && !ALLOWED_EDITOR_EMAILS.includes(email)) {
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

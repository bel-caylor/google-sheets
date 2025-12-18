import { listSampleEntries, saveSampleEntry } from './features/sample';

export function rpc(input: { method: string; payload: unknown }) {
  const method = String(input?.method || '');
  switch (method) {
    case 'listSampleEntries':
      return listSampleEntries();
    case 'saveSampleEntry':
      return saveSampleEntry((input?.payload || {}) as Record<string, unknown>);
    default:
      throw new Error(`Unknown RPC method: ${method}`);
  }
}

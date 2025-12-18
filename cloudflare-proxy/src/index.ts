interface Env {
  APP_SCRIPT_BASE?: string;
  ALLOWED_ORIGINS?: string;
}

const JSON_TYPE = 'application/json; charset=utf-8';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin') || '';
    const allowlist = parseAllowlist(env.ALLOWED_ORIGINS);
    const originAllowed = !allowlist.length || (origin && allowlist.includes(origin.toLowerCase()));
    const corsHeaders = buildCorsHeaders(originAllowed ? origin : '', allowlist, originAllowed);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (!originAllowed && origin) {
      return json({ ok: false, error: 'Origin not allowed' }, 403, buildCorsHeaders('', allowlist, false));
    }

    if (request.method !== 'POST') {
      return json({ ok: false, error: 'Method not allowed' }, 405, corsHeaders);
    }

    const base = String(env.APP_SCRIPT_BASE || '').replace(/\/+$/, '');
    if (!base) {
      return json({ ok: false, error: 'APP_SCRIPT_BASE not configured' }, 500, corsHeaders);
    }

    const body = await request.text();
    let upstream: Response;
    try {
      upstream = await fetch(`${base}/exec`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body
      });
    } catch (err) {
      return json({ ok: false, error: `Upstream request failed: ${(err as Error).message}` }, 502, corsHeaders);
    }

    const headers = new Headers(corsHeaders);
    headers.set('Content-Type', upstream.headers.get('Content-Type') || JSON_TYPE);
    return new Response(await upstream.text(), { status: upstream.status, headers });
  }
};

function parseAllowlist(raw?: string): string[] {
  return String(raw || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => value.toLowerCase());
}

function buildCorsHeaders(origin: string, allowlist: string[], originAllowed: boolean): HeadersInit {
  let allowOrigin = origin || '*';
  if (allowlist.length) {
    allowOrigin = originAllowed && origin ? origin : 'null';
  }

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Vary': 'Origin'
  };
}

function json(body: unknown, status: number, headers: HeadersInit) {
  const merged = new Headers(headers);
  merged.set('Content-Type', JSON_TYPE);
  return new Response(JSON.stringify(body), { status, headers: merged });
}

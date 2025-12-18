# Cloudflare Proxy Template

This Worker is an optional companion to the `google-sheets` starter. It forwards
requests from a standalone/static front end to your bound Apps Script web app so
you can host the UI anywhere (Cloudflare Pages, GitHub Pages, etc.) without
exposing the Apps Script deployment URL directly.

## Setup

```powershell
cd cloudflare-proxy
npm install          # once
wrangler login       # once per machine

# store the Apps Script deployment base (no trailing /exec)
wrangler secret put APP_SCRIPT_BASE
```

You can optionally restrict which origins receive CORS access by editing
`ALLOWED_ORIGINS` inside `wrangler.toml` (comma-separated hostnames). Leave it
blank to reflect the request origin back to the browser.

## Deploy

```powershell
npm run deploy
```

During development you can run `npm run dev` to tunnel requests through your
local machine before deploying.

Point `APPS_SCRIPT_BASE` (or `window.APP_RPC_BASE`) in the front end to the
Worker URL—typically `https://<your-worker>.<account>.workers.dev` or a custom
hostname routed to the Worker.

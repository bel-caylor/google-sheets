# Google Sheets Apps Script Template

Starter repo for building Google Sheets backed web apps with Apps Script + Alpine.js. The tooling is esbuild bundling, Tailwind CSS, RPC switch and ships with a single sample view/app so you can plug in your own modules.

## What's inside
- **Apps Script backend** in `src/*.ts` bundled into `dist/Code.gs` via esbuild.
- **Alpine.js front end** in `src/html/` with a context pack, util helpers, and a sample module (`sampleApp`).
- **RPC pattern** (client `callRpc()` + server `src/rpc.ts`) for Sheets CRUD.
- **Cloudflare proxy template** in `cloudflare-proxy/` so standalone hosts can call Apps Script without exposing the raw deployment URL.
- **Bootstrap helpers**:
  - `scripts/bootstrap.mjs` writes `.clasp.json` interactively.
  - `runInitialSetup()` (Apps Script) creates sheets/headers defined in `src/constants.ts` so you can start from a blank spreadsheet.
- **Standalone build** path (`npm run build:standalone`) for hosting outside the Apps Script iframe if needed.

## End-to-end setup workflow
1. **Clone & install locally**
   1. On GitHub, click **Use this template**, fill in the new repository name/owner, and create it.
   2. Open a terminal, `cd` into the parent folder where you keep projects (e.g., `~/code` or `C:\dev`), then clone and enter the repo:  
      `git clone https://github.com/<your-user>/<your-repo>.git my-project`  
      `cd my-project`  
   3. `npm install` to pull dependencies.
2. **Prepare your sheet schema**
   1. If you already have a spreadsheet with tabs/headers:
      - After you push the code in step 3, open that sheet's Apps Script project (Extensions -> Apps Script) and run `logAllSheetHeaders()` from `src/util/sheets.ts`.
      - Copy the tab/header arrays into `src/constants.ts` under `SHEET_SCHEMAS`, and update any other constants (column names, IDs) to match.
      - Include a tab named 'Editor Access' with an `Email` column so the editor allowlist can live in the sheet.
      - You will skip `runInitialSetup()` later because the sheet already matches your schema.
   2. If you're starting from a blank sheet, make sure `SHEET_SCHEMAS` in `src/constants.ts` reflects the tabs/headers you want `runInitialSetup()` to create.
3. **Bind & deploy to Apps Script**
   1. Run `npm run bootstrap` to create `.clasp.json` with your Apps Script `scriptId`.
   2. Run `npm run deploy` to upload the backend + HTML bundle  
   (**rerun this whenever you need to push updates**).
   3. In Google Apps Script, (**Google Sheets -> Extensions -> Apps Script**) confirm the pushed code is present.
   4. **Skip this if you started with a spreadsheet with tabs/headers in step 2**,  
   run `runInitialSetup` once in the Apps Script editor to create the starter tabs defined in `src/constants.ts`.  
   ![runInitalSetup](google-sheets\docs\runInitialSetup.png)
   5. Deploy a Web App (Execute as you, Anyone with link) and copy the deployment URL; you'll need it for standalone builds or the Cloudflare proxy.
   6. Add any required Script Properties (API tokens, spreadsheet IDs) via **Project Settings -> Script properties**.
   7. Open the 'Editor Access' tab in your sheet and add one email per row (column `Email`) for each person allowed to save data from the UI.

## Stack overview
1. **Google Sheet** holds the source data that powers the UI.
2. **Apps Script backend** (in this repo) exposes RPC-style endpoints that read/write that sheet.
3. **Cloudflare Worker proxy** (optional, `cloudflare-proxy/`) forwards public traffic to Apps Script so you can host the UI anywhere without CORS issues or leaking the Apps Script URL.
4. **Static host** (GitHub Pages, Cloudflare Pages, etc.) serves the bundled `dist-standalone/index.html` that talks to the Worker.

Use the proxy when you need to embed the UI on a domain other than `script.google.com`. See `cloudflare-proxy/README.md` for deployment steps and environment variables (`APP_SCRIPT_BASE`, `ALLOWED_ORIGINS`).

## GitHub Pages workflow
The template ships with `.github/workflows/pages.yml`, which builds the Apps Script bundle, runs `npm run build:standalone`, and publishes `dist-standalone` to GitHub Pages.

Set the `APPS_SCRIPT_BASE` repository secret to your Cloudflare Worker (or direct Apps Script URL) before enabling the workflow. Trigger it via pushes to `main` or the manual **Run workflow** button.

## Authorizations
- `appsscript.json` (built into `dist/appsscript.json`) enables the V8 runtime and scopes for Sheets + optional external HTTP requests. Trim the scopes if your project does not call `UrlFetchApp`.
- Add API tokens (ESV, OpenAI, etc.) to Script Properties rather than the source tree; the template reads them with `PropertiesService`.

## Context pack (client config)
- `src/html/context.html` defines `window.APP_CTX` for sharing defaults (form presets, dropdown choices, helper strings) across views.
- Alpine apps read from `APP_CTX` during `init()` while the partials stay script-free, so designers can edit markup without touching JS.

## RPC pattern
- The browser always calls `callRpc(method, payload)` (defined in `src/html/js/util.html`).
- Server-side, `src/rpc.ts` routes those methods with a `switch`. Add new features by wiring a case that calls into `src/features/*.ts`.
- Keeping a single entrypoint also makes it easy to add auth or rate limits later.

## Standalone hosting
1. Deploy your Apps Script web app (Execute as you, Anyone). Copy the base URL (`https://script.google.com/macros/s/<DEPLOYMENT>`).
2. Build static assets with that base (or your Cloudflare Worker): ``APPS_SCRIPT_BASE=<url> npm run build:standalone``. This emits `dist-standalone/index.html` with CSS + partials inlined.
3. Host `dist-standalone/` on GitHub Pages, Cloudflare Pages, Netlify, etc. When the UI is outside Apps Script it falls back to `fetch(<base>/exec)` using the env var you provided.
4. For local preview, run `npm run dev:standalone` or serve `dist-standalone` with any static server.

## Security tips
- Never commit secrets; rely on Script Properties or Worker secrets.
- Keep the 'Editor Access' sheet updated (one email per row) and set the `EDITOR_SHARED_SECRET` Script Property to turn on the shared-secret editor gate.
- If the standalone UI is public, add a lightweight bearer token (or origin check) in `src/http.ts`/`src/rpc.ts` before executing mutating calls.
- The Cloudflare proxy can also enforce an origin allowlist via `ALLOWED_ORIGINS`.

The sample view exposes a minimal "Editor access" panel so non-Sheets users can supply their email + shared code before saving data. Emails are stored in `localStorage` for convenience while the shared code is cleared after each save. Extend `requireEditor()` in `src/auth.ts` if you need per-user secrets or tighter policies.

## Customizing the template
- Update `src/constants.ts` with sheet names/columns for your project. Add entries to `SHEET_SCHEMAS` so `runInitialSetup()` knows what to create.
- `src/features/sample.ts` shows how to read/write Sheets data. Copy it to create additional features and wire new RPC methods inside `src/rpc.ts`.
- Client-side, duplicate `src/html/js/apps-sample.html` + `src/html/sample-view.html` to spin up additional Alpine apps. Update `src/html/index.html` with your layout (tabs, sections, etc.) whenever you need more than the provided sample page.
- Add client defaults/constants in `src/html/context.html` so multiple views can share them.

## Available scripts
- `npm run build`: bundle server, copy HTML, build CSS.
- `npm run watch`: dev loop (build/copy/push on change).
- `npm run build:standalone`: produce `dist-standalone/index.html` with all partials inlined.
- `npm run bootstrap`: interactively generate `.clasp.json`.

## Sheet bootstrapper
`runInitialSetup()` reads `SHEET_SCHEMAS` and ensures each sheet exists with the defined header row + frozen header. Extend the schema to include all tables you rely on. This lets you bind the project to a brand-new spreadsheet without manual table creation.

## Notes
- Secrets (API keys, spreadsheet IDs) should live in Script Properties. `SPREADSHEET_ID` defaults to the bound spreadsheet when empty.
- Feel free to remove modules you don't need (watch tasks, standalone build) if you're aiming for a lighter scaffold.
- The template intentionally keeps TypeScript for server code--it gives you typing for Sheets, RPC payloads, and IDE hints.

// esbuild.config.mjs
import esbuild from 'esbuild';

const isWatch = process.argv.includes('--watch');

const common = {
  entryPoints: ['src/main.ts'],
  outfile: 'dist/Code.gs',
  bundle: true,
  platform: 'browser',
  format: 'iife',
  target: ['es2019'],
  banner: { js: 'var global=this;' },
  footer: { js: `
// Expose common Apps Script entrypoints for google.script.run
function rpc(input){ return global.rpc.apply(global, arguments); }
function onOpen(){ return global.onOpen.apply(global, arguments); }
function showWebAppUrl(){ return global.showWebAppUrl.apply(global, arguments); }
function initializeSheetsFromMenu(){ return global.initializeSheetsFromMenu.apply(global, arguments); }
function runInitialSetup(){ return global.runInitialSetup.apply(global, arguments); }
` },
  sourcemap: false,
  minify: false,
  logLevel: 'info'
};

async function run() {
  if (isWatch) {
    const ctx = await esbuild.context(common);
    await ctx.watch();
  } else {
    await esbuild.build(common);
  }
}

run().catch((e) => { console.error(e); process.exit(1); });

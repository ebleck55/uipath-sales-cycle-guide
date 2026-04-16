#!/usr/bin/env node
// Zero-dep smoke test for the UiPath Sales Cycle Guide static site.
// Verifies index.html structure, local asset refs, and JS syntax.

import { readFile, access } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const exec = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

let failures = 0;
function fail(msg) {
  failures++;
  console.error(`FAIL: ${msg}`);
}
function pass(msg) {
  console.log(`pass: ${msg}`);
}

// ---------------------------------------------------------------------------
// HTML structural checks
// ---------------------------------------------------------------------------
const html = await readFile(path.join(root, 'index.html'), 'utf-8');

const structuralChecks = [
  [/<title>UiPath Sales Cycle Guide<\/title>/, 'title tag'],
  [/id="discovery"/, 'discovery section'],
  [/id="business-qualification"/, 'business-qualification section'],
  [/id="technical-qualification"/, 'technical-qualification section'],
  [/id="proposal"/, 'proposal section'],
  [/id="implement"/, 'implement section'],
  [/id="key-buyer-personas"/, 'key-buyer-personas section'],
  [/id="lob-use-cases"/, 'lob-use-cases section'],
  [/role="main"/, 'main landmark'],
  [/role="navigation"/, 'navigation landmark'],
  [/id="banking"/, 'banking industry button'],
  [/id="insurance"/, 'insurance industry button'],
];
for (const [re, label] of structuralChecks) {
  if (re.test(html)) pass(label);
  else fail(label);
}

// ---------------------------------------------------------------------------
// Local asset references must exist on disk
// ---------------------------------------------------------------------------
const attrRe = /(?:href|src)\s*=\s*"([^"]+)"/g;
const localAssets = new Set();
for (const m of html.matchAll(attrRe)) {
  const url = m[1];
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('//') ||
    url.startsWith('#') ||
    url.startsWith('data:') ||
    url.startsWith('mailto:')
  ) {
    continue;
  }
  localAssets.add(url);
}
for (const asset of localAssets) {
  try {
    await access(path.join(root, asset));
    pass(`asset exists: ${asset}`);
  } catch {
    fail(`missing asset: ${asset}`);
  }
}

// ---------------------------------------------------------------------------
// JS syntax checks via `node --check`
// ---------------------------------------------------------------------------
const jsFiles = [
  'js/data.js',
  'js/performance.js',
  'js/ai-integration.js',
  'js/app.js',
  'sw.js',
];
for (const js of jsFiles) {
  try {
    await exec(process.execPath, ['--check', path.join(root, js)]);
    pass(`syntax ok: ${js}`);
  } catch (e) {
    fail(`syntax error in ${js}: ${(e.stderr || e.message).trim()}`);
  }
}

console.log(`\n${failures === 0 ? 'OK' : 'FAILED'} — ${failures} failure${failures === 1 ? '' : 's'}`);
process.exit(failures === 0 ? 0 : 1);

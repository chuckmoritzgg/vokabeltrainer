#!/usr/bin/env node
/** Rebuild the immutable release manifest and verified service worker after every code/data change. */
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const file = (path) => resolve(root, path);
const read = (path) => readFile(file(path));
const hash = (buf) => createHash('sha256').update(buf).digest('hex');
const appVersion = JSON.parse(await read('app-version.json'));
const books = JSON.parse(await read('data/books.json'));
if (!Array.isArray(books) || !books.length) throw new Error('Book manifest empty or invalid');
const paths = ['index.html', 'pwa.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'data/books.json'];
for (const book of books) {
  const path = String(book.file || '').replace(/^\.\//, '');
  if (!/^data\/[\w-]+\.json$/.test(path)) throw new Error(`Unsafe book path: ${path}`);
  if (!paths.includes(path)) paths.push(path);
}
let html = (await read('index.html')).toString('utf8');
if (!/<meta name="app-version" content="[\w._-]+">/.test(html)) throw new Error('index.html missing app-version meta');
html = html.replace(/(<meta name="app-version" content=")[\w._-]+(">)/, '$1__VERSION__$2');
if (!/<meta name="app-build" content="[0-9a-zA-Z_]+">/.test(html)) {
  throw new Error('index.html must contain <meta name="app-build" content="__BUILD__">');
}
html = html.replace(/(<meta name="app-build" content=")[0-9a-zA-Z_]+("\>)/, '$1__BUILD__$2');
const other = await Promise.all(paths.filter((p) => p !== 'index.html').map(async (p) => [p, hash(await read(p))]));
const template = (await read('scripts/sw.template.js')).toString('utf8');
const build = hash(JSON.stringify({ version: appVersion.version, html, other, template })).slice(0, 16);
html = html.replace('content="__BUILD__"', `content="${build}"`).replace('content="__VERSION__"', `content="${appVersion.version}"`);
await writeFile(file('index.html'), html);
const assets = [['index.html', hash(Buffer.from(html))], ...other];
const worker = template.replace('__BUILD__', JSON.stringify(build))
  .replace('__VERSION__', JSON.stringify(appVersion.version))
  .replace('__ASSETS__', JSON.stringify(assets));
await writeFile(file('sw.js'), worker);
await writeFile(file('version.json'), JSON.stringify({ version: appVersion.version, build }, null, 2) + '\n');
console.log(`PWA build ${build} (${appVersion.version}), ${assets.length} verified offline assets`);

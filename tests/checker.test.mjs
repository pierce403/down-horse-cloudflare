import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {Miniflare, convertV4MiniflareOptions} from 'miniflare';
import {checkTarget} from '../src/worker.mjs';
test('HTTP responses preserve UP semantics, failures return DOWN, credentials/private URLs never fetch', async () => {
  let calls = 0;
  const upstream = async (url, options) => {calls++; assert.equal(options.redirect, 'follow'); return new Response('body', {status:404});};
  assert.equal(await checkTarget('example.test', 'checker', upstream), 'http://example.test is UP 200 OK');
  assert.equal(await checkTarget('https://example.test', null, async()=>{throw new Error('unreachable')}), 'https://example.test is DOWN');
  for (const target of ['file:///etc/passwd', 'http://localhost', 'http://127.0.0.1', 'http://[::1]', 'https://user:password@example.test']) assert.match(await checkTarget(target, null, upstream), / is DOWN$/);
  assert.equal(calls, 1);
});
test('real Worker preserves form, exact release marker, unknown-route 404 and method contract', async () => {
  execFileSync(process.execPath,['node_modules/wrangler/bin/wrangler.js','deploy','--dry-run','--outdir','build/worker'],{stdio:'pipe'});
  const options = convertV4MiniflareOptions({name:'down-horse-test',modules:true,scriptPath:'build/worker/worker.js',compatibilityDate:'2026-10-12',assets:{directory:'build/assets',binding:'ASSETS',run_worker_first:true}});
  options.workers[0].config.assets.hasUserWorker = true;
  const mf = new Miniflare(options);
  try {
    const root = await mf.dispatchFetch('https://down-horse.example/'); assert.equal(root.status,200); assert.match(await root.text(),/DOWN OR UP/);
    assert.equal((await mf.dispatchFetch('https://down-horse.example/missing')).status,404);
    assert.equal((await mf.dispatchFetch('https://down-horse.example/',{method:'POST'})).status,405);
    const marker = await mf.dispatchFetch('https://down-horse.example/deployment.json'); assert.equal(marker.headers.get('cache-control'),'no-store'); assert.deepEqual(await marker.json(),JSON.parse(readFileSync('build/assets/deployment.json','utf8')));
  } finally {await mf.dispose();}
});

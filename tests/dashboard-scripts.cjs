// Ensure every local dashboard script is actually served by the HTTP server.
// Run: node --test tests/dashboard-scripts.cjs
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { EventEmitter } = require('node:events');
const { createServer } = require('../src/server');

test('all dashboard script tags are HTTP 200 JavaScript', async (t) => {
  const html = fs.readFileSync(path.join(__dirname, '../public/index.html'), 'utf8');
  const scripts = [...html.matchAll(/<script\s+src="(\/[^"]+)"/g)].map(m => m[1]);
  assert.ok(scripts.includes('/dismissals.js'), 'regression guard must check dismissal script');
  const watcher = new EventEmitter();
  watcher.sessions = () => [];
  const server = createServer(watcher, { hours: 24, privacy: false });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  t.after(() => new Promise(resolve => server.close(resolve)));
  const root = 'http://127.0.0.1:' + server.address().port;
  for (const script of scripts) {
    const response = await fetch(root + script);
    assert.equal(response.status, 200, script + ' not served');
    assert.match(response.headers.get('content-type') || '', /text\/javascript/, script);
    assert.ok((await response.text()).length > 10, script + ' empty');
  }
});

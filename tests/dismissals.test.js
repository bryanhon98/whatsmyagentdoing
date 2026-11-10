// Run with: node --test tests/dismissals.test.js
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const d = require('../public/dismissals.js');

test('dismissal survives serialization but never modifies a session', () => {
  const session = Object.freeze({ key: 'codex:one', status: 'done', lastEventAt: 100 });
  const map = new Map();
  d.dismiss(map, session);
  assert.equal(map.get(session.key), 100);
  assert.equal(d.read(d.serialize(map)).get(session.key), 100);
  assert.equal(session.status, 'done');
});

test('a dismissed finished or idle session stays hidden', () => {
  const map = new Map([['a', 100]]);
  assert.equal(d.reconcile(map, [{ key: 'a', status: 'done', lastEventAt: 200 }]), false);
  assert.equal(d.reconcile(map, [{ key: 'a', status: 'idle', lastEventAt: 300 }]), false);
  assert.equal(map.has('a'), true);
});

test('repeated active snapshots do not undo a dismissal', () => {
  const map = new Map([['a', 100]]);
  assert.equal(d.reconcile(map, [{ key: 'a', status: 'thinking', lastEventAt: 100 }]), false);
  assert.equal(map.has('a'), true);
});

test('a new active event brings back a resumed agent', () => {
  const map = new Map([['a', 100]]);
  assert.equal(d.reconcile(map, [{ key: 'a', status: 'tool', lastEventAt: 101 }]), true);
  assert.equal(map.has('a'), false);
});

test('storage ignores malformed input; restoration clears the map', () => {
  assert.equal(d.read({}).size, 0);
  assert.equal(d.read([['ok', 42], ['bad', -2], ['invalid', '42']]).size, 1);
  const map = new Map([['a', 12]]);
  map.clear();
  assert.deepEqual(d.serialize(map), []);
});

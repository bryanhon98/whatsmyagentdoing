// Presentation-only session dismissal state. No session files or processes are modified.
(() => {
  'use strict';
  const ACTIVE = new Set(['thinking', 'tool', 'typing', 'waiting', 'error']);
  const LIMIT = 1000;

  function read(raw) {
    const map = new Map();
    if (!Array.isArray(raw)) return map;
    for (const entry of raw.slice(-LIMIT)) {
      if (!Array.isArray(entry) || typeof entry[0] !== 'string' || !entry[0] ||
          typeof entry[1] !== 'number' || !Number.isFinite(entry[1]) || entry[1] < 0) continue;
      map.set(entry[0], entry[1]);
    }
    return map;
  }

  function serialize(map) {
    return [...map.entries()].slice(-LIMIT);
  }

  function dismiss(map, session) {
    if (!session || typeof session.key !== 'string' || !session.key) return;
    map.delete(session.key);
    map.set(session.key, Number(session.lastEventAt) || 0);
    while (map.size > LIMIT) map.delete(map.keys().next().value);
  }

  function reconcile(map, sessions) {
    let changed = false;
    for (const s of sessions) {
      if (map.has(s.key) && ACTIVE.has(s.status) &&
          Number(s.lastEventAt) > map.get(s.key)) {
        map.delete(s.key);
        changed = true;
      }
    }
    return changed;
  }

  const api = { read, serialize, dismiss, reconcile };
  if (typeof window !== 'undefined') window.WMADismissals = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();

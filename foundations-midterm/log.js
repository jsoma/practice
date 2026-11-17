// Anonymous answer logging to a Google Sheet (see apps-script/Code.gs).
import {LOG_URL} from './config.js';

const ID_KEY = 'foundations-browser-id';
const read = key => { try { return localStorage.getItem(key); } catch { return null; } };
const write = (key, value) => { try { localStorage.setItem(key, value); } catch {} };

// randomUUID needs https or localhost; fall back so the page never breaks over logging.
const uuid = () => { try { return crypto.randomUUID(); } catch { return Math.random().toString(16).slice(2) + Date.now().toString(16); } };
export const browserId = read(ID_KEY) ?? (() => { const id = uuid(); write(ID_KEY, id); return id; })();
const sessionId = uuid();

export function buildEvent(event, fields = {}) {
  return {event, browserId, sessionId, clientTime: new Date().toISOString(), ...fields};
}

export function logEvent(event, fields, url = LOG_URL) {
  if (!url) return;
  // text/plain keeps this a "simple" request, which Apps Script accepts cross-origin.
  fetch(url, {method: 'POST', mode: 'no-cors', keepalive: true, body: JSON.stringify(buildEvent(event, fields))})
    .catch(() => {});
}

// Time actually spent with the page visible, sent whenever the tab is hidden.
let visibleSince = typeof document !== 'undefined' && document.visibilityState === 'visible' ? Date.now() : null;
if (typeof document !== 'undefined') document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden' && visibleSince) {
    logEvent('active', {seconds: Math.round((Date.now() - visibleSince) / 1000)});
    visibleSince = null;
  } else if (document.visibilityState === 'visible') {
    visibleSince = Date.now();
  }
});

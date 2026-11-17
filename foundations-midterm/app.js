import {BANK_VERSION} from './bank.js';
import {bank} from './questions.js';
import {LOG_URL} from './config.js';
import {logEvent} from './log.js';
import {normalize, shuffle} from './core.js';
import {checkAnswer} from './quiz.js';
import {emptyProgress, familiesOf, recordResult, pickNext, summary} from './practice.js';

const main = document.querySelector('main');
const version = `${BANK_VERSION}-practice-v1`;
const STORAGE_KEY = 'foundations-practice-v1';
const finePointer = matchMedia('(pointer: fine)').matches;
const byId = new Map(bank.map(q => [q.id, q]));
const familyNames = [...familiesOf(bank).keys()];

let storage;
try { storage = localStorage; } catch { storage = {getItem: () => null, setItem() { throw Error('unavailable'); }}; }
let storageOk = true;
let progress = load();

function load() {
  try {
    const p = JSON.parse(storage.getItem(STORAGE_KEY));
    if (p && Number.isInteger(p.count) && p.families && Array.isArray(p.history)) {
      if (p.current && !byId.has(p.current.questionId)) p.current = null;
      return p;
    }
  } catch {}
  return emptyProgress();
}
function save() {
  try { storage.setItem(STORAGE_KEY, JSON.stringify(progress)); storageOk = true; } catch { storageOk = false; }
}

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const rich = s => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>');
// Choices that are code get the monospace font. Prose has runs of plain words.
function looksLikeCode(t) {
  if (t.includes('\n')) return true;
  let run = 0, longest = 0;
  for (const word of t.split(/\s+/)) { run = /^[A-Za-z’'-]+[,.;:]?$/.test(word) ? run + 1 : 0; longest = Math.max(longest, run); }
  if (longest >= 3) return false;
  return /^([\[(~.\/]|https?:|(cd|ls|pwd|python|pip|uv|wget|curl)\s|\w+(\.\w+)*\s*(=|\[|\())/.test(t);
}
const ROUTES = ['home', 'practice', 'wrong'];
const route = () => ROUTES.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'home';
function go(r) { if (location.hash === `#${r}`) render(); else location.hash = r; }

// Seconds on the current question, counting only while it is on screen and the tab is visible.
let shown = {key: null, ms: 0, at: null};
const pauseTimer = () => { if (shown.at !== null) { shown.ms += Date.now() - shown.at; shown.at = null; } };
const timerSeconds = () => Math.round((shown.ms + (shown.at !== null ? Date.now() - shown.at : 0)) / 1000);

const isRight = result => result.earned === result.possible;
function outcome(entry) {
  if (entry.skipped) return 'skipped';
  if (isRight(entry.result)) return 'right';
  return entry.result.earned > 0 ? 'partial' : 'wrong';
}

// Put a question's choices back in the order the student saw them.
function withChoiceOrder(q, order) {
  if (!order || !q.choices) return q;
  return {...q, choices: order.map(id => q.choices.find(x => x.id === id)).filter(Boolean)};
}
const currentQuestion = () => withChoiceOrder(byId.get(progress.current.questionId), progress.current.choiceOrder);
function ensureCurrent() {
  if (progress.current) return;
  const q = pickNext(progress, bank);
  progress.current = {questionId: q.id, draft: '', hint: false, entry: null, choiceOrder: q.choices ? shuffle(q.choices).map(c => c.id) : null};
  save();
}

// Wrap each matched keyword in the student's own text with <mark>.
function highlight(text, terms) {
  const ranges = [];
  for (const term of terms) {
    const words = normalize(term).split(' ').filter(Boolean).map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    if (!words.length) continue;
    const re = new RegExp(`(^|[^\\p{L}\\p{N}])(${words.join('[^\\p{L}\\p{N}]+')})(?![\\p{L}\\p{N}])`, 'giu');
    for (const m of text.matchAll(re)) { const start = m.index + m[1].length; ranges.push([start, start + m[2].length]); }
  }
  ranges.sort((a, b) => a[0] - b[0] || b[1] - a[1]);
  let out = '', pos = 0;
  for (const [start, end] of ranges) {
    if (start < pos) continue;
    out += esc(text.slice(pos, start)) + `<mark>${esc(text.slice(start, end))}</mark>`;
    pos = end;
  }
  return out + esc(text.slice(pos));
}

// One segment per topic, colored by the last answer in that topic.
function strip(currentFamily = null) {
  return `<div class="strip" aria-hidden="true">${familyNames.map(name => {
    const f = progress.families[name];
    return `<span class="${f ? f.last : 'todo'}${name === currentFamily ? ' current' : ''}"></span>`;
  }).join('')}</div>`;
}

function statusLine() {
  const s = summary(progress, bank);
  if (!s.seen) return `Questions on ${s.total} topics.`;
  return `${s.seen} of ${s.total} topics seen, ${s.right} right.`;
}

function context(q) {
  let html = '';
  if (q.table) html += `<div class="table-wrap"><table><caption><code>df</code></caption><thead><tr>${q.table.headers.map(h => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${q.table.rows.map(r => `<tr>${r.map(v => `<td>${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  if (q.bullets) html += `<ul class="facts">${q.bullets.map(b => `<li>${rich(b)}</li>`).join('')}</ul>`;
  if (q.code) html += `<pre class="code"><code>${esc(q.code)}</code></pre>`;
  return html;
}

function answerText(q, e) {
  if (e.skipped) return '<p class="muted">Skipped</p>';
  if (q.type === 'mc') {
    const text = q.choices.find(c => c.id === e.answer)?.text ?? '';
    return looksLikeCode(text) ? `<pre class="code"><code>${esc(text)}</code></pre>` : `<p>${esc(text)}</p>`;
  }
  if (q.type === 'code') return `<pre class="code"><code>${esc(e.answer)}</code></pre>`;
  return `<p class="typed">${highlight(e.answer, e.result.matches.filter(m => m.term).map(m => m.term))}</p>`;
}

function reference(q) {
  if (q.type === 'short') return `<p>${rich(q.explanation)}</p>`;
  const answer = q.type === 'mc' ? q.choices.find(c => c.id === q.answer).text : q.accepted[0];
  const block = q.type === 'mc' && !looksLikeCode(answer) ? `<p><strong>${esc(answer)}</strong></p>` : `<pre class="code"><code>${esc(answer)}</code></pre>`;
  return `${block}<p>${rich(q.explanation)}</p>`;
}

function verdict(q, e) {
  if (e.skipped) return 'Skipped';
  const {earned, possible} = e.result;
  if (q.type === 'short') return `Keywords found: ${earned} of ${possible}`;
  if (q.type === 'code') return earned ? 'Matches a listed answer' : 'Doesn’t match a listed answer';
  return earned ? 'Correct' : 'Incorrect';
}

function home() {
  const started = progress.count > 0;
  return `<section class="home">
    <h1>Foundations midterm practice</h1>
    <p class="lede">${statusLine()}</p>
    ${started ? strip() : ''}
    <div class="actions">
      <button class="primary" data-action="practice">${started ? 'Keep practicing' : 'Start practicing'}</button>
      ${started ? '<button class="quiet" data-action="ask-reset">Reset progress</button>' : ''}
    </div>
    <div class="confirm" id="confirm" hidden>
      <p>Reset progress? This clears everything you’ve answered.</p>
      <div class="actions"><button data-action="reset">Reset</button><button class="quiet" data-action="cancel">Cancel</button></div>
    </div>
    ${LOG_URL ? '<p class="small muted">Answers are recorded anonymously.</p>' : ''}
  </section>`;
}

function choices(q, e, draft) {
  return `<fieldset class="choices"><legend class="sr">Choices</legend>${q.choices.map((c, i) => {
    const picked = String(e?.answer ?? draft) === c.id;
    let cls = 'choice';
    if (e && c.id === q.answer) cls += ' is-right';
    else if (e && picked) cls += ' is-wrong';
    return `<label class="${cls}"><input type="radio" name="answer" value="${esc(c.id)}" ${picked ? 'checked' : ''} ${e ? 'disabled' : ''}>
      <span class="key" aria-hidden="true">${'ABCD'[i]}</span>
      <span class="${looksLikeCode(c.text) ? 'choice-code' : 'choice-text'}">${esc(c.text)}</span>${cls.includes('is-right') ? '<span class="tag-result">Right answer</span>' : cls.includes('is-wrong') ? '<span class="tag-result">Your answer</span>' : ''}</label>`;
  }).join('')}</fieldset>`;
}

function feedback(q, e) {
  const groups = q.type === 'short' && !e.skipped
    ? `<ul class="groups">${e.result.matches.map(m => `<li class="${m.term ? 'found' : 'missing'}">${esc(m.label)}${m.term ? `: <mark>${esc(m.term)}</mark>` : ''}</li>`).join('')}</ul>
       <p class="small muted">Keyword match only.</p>`
    : '';
  const codeNote = q.type === 'code' && !e.skipped && !e.result.earned ? '<p class="small muted">Other code may also work.</p>' : '';
  return `<section class="feedback ${outcome(e)}">
    <h2 class="verdict" tabindex="-1">${verdict(q, e)}</h2>
    ${groups}${codeNote}
    ${q.type === 'mc' ? `<p class="explain">${rich(q.explanation)}</p>` : `<div class="compare">
      <div><h3>Your answer</h3>${answerText(q, e)}</div>
      <div><h3>Answer</h3>${reference(q)}</div>
    </div>`}
    <div class="actions">
      <button class="primary" data-action="next" id="next">Next question</button>
    </div>
  </section>`;
}

function practicePage() {
  ensureCurrent();
  const c = progress.current, q = currentQuestion(), e = c.entry;
  const input = q.type === 'mc' ? choices(q, e, c.draft)
    : e ? '' : `<label class="sr" for="answer">Your answer</label><textarea id="answer" name="answer" class="${q.type === 'short' ? 'prose' : 'code'}" maxlength="4000" spellcheck="${q.type === 'short'}" autocapitalize="off" aria-keyshortcuts="Control+Enter Meta+Enter">${esc(c.draft)}</textarea>`;
  return `<div class="quiz-top">
      <span>${progress.count} answered</span>
      <a href="#home">Done for now</a>
    </div>
    ${strip(q.family)}
    <article class="card">
      ${context(q)}
      <h1 class="stem" id="stem" tabindex="-1">${rich(q.stem)}</h1>
      <form id="answer-form">
        ${input}
        ${e ? '' : `<div class="actions">
          <button class="primary" type="submit" id="check" ${c.draft.trim() ? '' : 'disabled'}>Check answer</button>
          <button type="button" class="quiet" data-action="hint" ${c.hint ? 'disabled' : ''}>Hint</button>
          <button type="button" class="quiet" data-action="skip">Skip</button>
        </div>
        <p id="notice" class="small" role="status"></p>`}
      </form>
      ${c.hint ? `<p class="hint" id="hint" tabindex="-1">${rich(q.hint)}</p>` : ''}
      ${e ? feedback(q, e) : ''}
    </article>`;
}

// The latest attempt in each topic whose last answer was wrong, newest first.
function currentMisses() {
  const latest = new Map();
  for (const h of progress.history) latest.set(h.family, h);
  return [...latest.values()]
    .filter(h => progress.families[h.family]?.last === 'wrong' && byId.has(h.questionId))
    .reverse();
}

function wrongPage() {
  const misses = currentMisses();
  return `<h1>Wrong answers</h1>
    <div class="actions"><a href="#practice">Back to practice</a></div>
    ${misses.length ? misses.map(h => {
      const q = withChoiceOrder(byId.get(h.questionId), h.choiceOrder);
      return `<article class="review ${outcome(h)}">
        ${context(q)}
        <h2 class="stem">${rich(q.stem)}</h2>
        <div class="compare">
          <div><h3>Your answer</h3>${answerText(q, h)}</div>
          <div><h3>Answer</h3>${reference(q)}</div>
        </div>
      </article>`;
    }).join('') : '<p class="muted">Nothing wrong right now.</p>'}`;
}

function record(skipped = false) {
  const c = progress.current, q = currentQuestion();
  if (c.entry) return;
  const result = skipped
    ? {kind: q.type === 'mc' ? 'choice' : q.type === 'code' ? 'code' : 'keywords', earned: 0, possible: q.type === 'short' ? q.groups.length : 1, matches: []}
    : checkAnswer(q, c.draft);
  if (!result) { document.querySelector('#notice').textContent = 'Enter an answer first.'; return; }
  const entry = {questionId: q.id, family: q.family, answer: skipped ? '' : c.draft, result, skipped, hinted: c.hint, choiceOrder: c.choiceOrder, at: new Date().toISOString()};
  c.entry = entry;
  const repeat = !!progress.families[q.family];
  recordResult(progress, q, !skipped && isRight(result));
  progress.history.push(entry);
  if (progress.history.length > 500) progress.history.splice(0, progress.history.length - 500);
  save();
  logEvent('answer', {
    quizId: 'practice', questionId: q.id, family: q.family, type: q.type, difficulty: q.difficulty,
    answer: skipped ? '' : q.type === 'mc' ? q.choices.find(x => x.id === c.draft)?.text : c.draft,
    earned: result.earned, possible: result.possible, skipped, hinted: c.hint, seconds: timerSeconds(),
    questionCount: progress.count, retry: repeat, bankVersion: version,
  });
  render();
  announce(verdict(q, entry));
  document.querySelector('#next')?.focus({preventScroll: true});
  document.querySelector('.feedback')?.scrollIntoView({block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
}

const announce = text => { const el = document.querySelector('#status'); el.textContent = ''; setTimeout(() => { el.textContent = text; }, 50); };

function next() {
  progress.current = null;
  ensureCurrent();
  render();
  window.scrollTo({top: 0});
  // Touch devices get the question focused, not the input, so the keyboard doesn't pop up.
  document.querySelector(finePointer ? '#answer, .choice input' : '#stem')?.focus({preventScroll: true});
}

function render() {
  const r = route();
  const page = r === 'practice' ? practicePage() : r === 'wrong' ? wrongPage() : home();
  if (r === 'practice' && !progress.current.entry) {
    const key = `${progress.current.questionId}:${progress.count}`;
    const visible = document.visibilityState === 'visible';
    if (shown.key !== key) shown = {key, ms: 0, at: visible ? Date.now() : null};
    else if (shown.at === null && visible) shown.at = Date.now();
  } else pauseTimer();
  main.innerHTML = (storageOk ? '' : '<p class="warning">This browser isn’t saving progress. A refresh will lose your answers.</p>') + page;
  const n = currentMisses().length;
  document.querySelector('#wrong-count').textContent = n ? ` (${n})` : '';
}

main.addEventListener('submit', ev => { ev.preventDefault(); if (ev.target.id === 'answer-form') record(); });
main.addEventListener('input', ev => {
  if (!ev.target.closest('#answer-form') || !progress.current || progress.current.entry) return;
  progress.current.draft = ev.target.value;
  save();
  document.querySelector('#check').disabled = !ev.target.value.trim();
});
main.addEventListener('click', ev => {
  const b = ev.target.closest('button');
  if (!b) return;
  switch (b.dataset.action) {
    case 'practice': go('practice'); break;
    case 'ask-reset': document.querySelector('#confirm').hidden = false; document.querySelector('#confirm button').focus(); break;
    case 'cancel': document.querySelector('#confirm').hidden = true; break;
    case 'reset': progress = emptyProgress(); save(); render(); document.querySelector('[data-action=practice]').focus(); break;
    case 'hint': progress.current.hint = true; save(); render(); document.querySelector('#hint').focus(); break;
    case 'skip': record(true); break;
    case 'next': next(); break;
  }
});

// Keyboard: A–D picks a choice, Ctrl/⌘+Enter checks a typed answer.
document.addEventListener('keydown', ev => {
  if (route() !== 'practice' || !progress.current || progress.current.entry) return;
  if (ev.key === 'Enter' && (ev.metaKey || ev.ctrlKey) && ev.target.id === 'answer') { ev.preventDefault(); record(); return; }
  const inChoices = ev.target === document.body || ev.target === main || ev.target.closest?.('.choices, .card');
  if (currentQuestion().type !== 'mc' || !inChoices || ev.target.tagName === 'TEXTAREA' || ev.metaKey || ev.ctrlKey || ev.altKey) return;
  const radio = document.querySelectorAll('.choice input')['abcd'.indexOf(ev.key.toLowerCase())];
  if (radio) { radio.checked = true; radio.focus(); radio.dispatchEvent(new Event('input', {bubbles: true})); }
});
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') pauseTimer();
  else if (route() === 'practice' && progress.current && !progress.current.entry && shown.at === null) shown.at = Date.now();
});
window.addEventListener('hashchange', () => {
  if (!ROUTES.includes(location.hash.slice(1)) && location.hash) return;
  render(); window.scrollTo({top: 0}); main.focus({preventScroll: true});
});
document.querySelector('.skip').addEventListener('click', ev => { ev.preventDefault(); (document.querySelector('#stem') ?? main).focus(); });
render();
logEvent('visit', {bankVersion: version});

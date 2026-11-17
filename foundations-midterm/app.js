import {BANK_VERSION} from './bank.js';
import {bank} from './questions.js';
import {LOG_URL} from './config.js';
import {logEvent} from './log.js';
import {normalize} from './core.js';
import {checkAnswer, buildQuiz, shuffleQuiz, wrongAnswers, loadQuizState, saveQuizState} from './quiz.js';

const main = document.querySelector('main');
const version = `${BANK_VERSION}-plain-quiz-v5`;
const finePointer = matchMedia('(pointer: fine)').matches;

let storage;
try { storage = localStorage; } catch { storage = {getItem: () => null, setItem() { throw Error('unavailable'); }}; }
let state = loadQuizState(storage);
let storageOk = true;
if (state.quiz?.bankVersion !== version) state.quiz = null;

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const rich = s => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>');
const looksLikeCode = t => /[\[\]{}()=]|\n|:\/\/|^(cd|ls|pwd|python|pip|uv|df)\b|^\w+\.\w+/.test(t) && !/\b(the|is|are|and|to|of|it)\b/i.test(t);

function save() { storageOk = saveQuizState(storage, state); }
function go(route) { if (location.hash === `#${route}`) render(); else location.hash = route; }
const quizDone = () => state.quiz && state.quiz.index >= state.quiz.questions.length;
const entries = () => state.quiz ? state.quiz.answers.filter(Boolean) : [];

// Seconds on the current question, counting only while it is on screen and the tab is visible.
let shown = {key: null, ms: 0, at: null};
const pauseTimer = () => { if (shown.at !== null) { shown.ms += Date.now() - shown.at; shown.at = null; } };
const timerSeconds = () => Math.round((shown.ms + (shown.at !== null ? Date.now() - shown.at : 0)) / 1000);

function outcome(a) {
  if (!a) return 'todo';
  if (a.skipped) return 'skipped';
  if (a.result.earned === a.result.possible) return 'right';
  return a.result.earned > 0 ? 'partial' : 'wrong';
}

// Wrap each matched keyword in the student's own text with <mark>.
function highlight(text, terms) {
  const ranges = [];
  for (const term of terms) {
    const words = normalize(term).split(' ').filter(Boolean).map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    if (!words.length) continue;
    const re = new RegExp(`(?<![\\p{L}\\p{N}])${words.join('[^\\p{L}\\p{N}]+')}(?![\\p{L}\\p{N}])`, 'giu');
    for (const m of text.matchAll(re)) ranges.push([m.index, m.index + m[0].length]);
  }
  ranges.sort((a, b) => a[0] - b[0]);
  let out = '', pos = 0;
  for (const [start, end] of ranges) {
    if (start < pos) continue;
    out += esc(text.slice(pos, start)) + `<mark>${esc(text.slice(start, end))}</mark>`;
    pos = end;
  }
  return out + esc(text.slice(pos));
}

function progressStrip(quiz) {
  return `<div class="strip" aria-hidden="true">${quiz.questions.map((_, i) =>
    `<span class="${outcome(quiz.answers[i])}${i === quiz.index ? ' current' : ''}"></span>`).join('')}</div>`;
}

function context(q) {
  let html = '';
  if (q.table) html += `<div class="table-wrap"><table><caption><code>df</code></caption><thead><tr>${q.table.headers.map(h => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${q.table.rows.map(r => `<tr>${r.map(v => `<td>${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  if (q.bullets) html += `<ul class="facts">${q.bullets.map(b => `<li>${rich(b)}</li>`).join('')}</ul>`;
  if (q.code) html += `<pre class="code"><code>${esc(q.code)}</code></pre>`;
  return html;
}

function answerText(q, a) {
  if (a.skipped) return '<p class="muted">Skipped</p>';
  if (q.type === 'mc') {
    const text = q.choices.find(c => c.id === a.answer)?.text ?? '';
    return looksLikeCode(text) ? `<pre class="code"><code>${esc(text)}</code></pre>` : `<p>${esc(text)}</p>`;
  }
  if (q.type === 'code') return `<pre class="code"><code>${esc(a.answer)}</code></pre>`;
  return `<p class="typed">${highlight(a.answer, a.result.matches.filter(m => m.term).map(m => m.term))}</p>`;
}

function reference(q) {
  if (q.type === 'short') return `<p>${rich(q.explanation)}</p>`;
  const answer = q.type === 'mc' ? q.choices.find(c => c.id === q.answer).text : q.accepted[0];
  const block = q.type === 'mc' && !looksLikeCode(answer) ? `<p><strong>${esc(answer)}</strong></p>` : `<pre class="code"><code>${esc(answer)}</code></pre>`;
  return `${block}<p>${rich(q.explanation)}</p>`;
}

function verdict(q, a) {
  if (a.skipped) return 'Skipped';
  const {earned, possible} = a.result;
  if (q.type === 'short') return `Keywords found: ${earned} of ${possible}`;
  if (q.type === 'code') return earned ? 'Matches a listed answer' : 'Doesn’t match a listed answer';
  return earned ? 'Correct' : 'Incorrect';
}

function home() {
  const active = state.quiz && !quizDone();
  const finished = state.quiz && quizDone();
  const total = buildQuiz(bank, 1).length;
  let status = `${total} questions, one at a time.`;
  if (active) status = `You’re on question ${state.quiz.index + 1} of ${state.quiz.questions.length}.`;
  if (finished) {
    const right = entries().filter(a => outcome(a) === 'right').length;
    status = `Last quiz: ${right} of ${state.quiz.questions.length} right.`;
  }
  return `<section class="home">
    <h1>Foundations midterm practice</h1>
    <p class="lede">${status}</p>
    ${state.quiz ? progressStrip(state.quiz) : ''}
    <div class="actions">
      <button class="primary" data-action="start">${active ? 'Continue' : 'Start a quiz'}</button>
      ${active ? '<button class="quiet" data-action="ask-new">Start over</button>' : ''}
      ${finished ? '<a href="#results">See results</a>' : ''}
    </div>
    <div class="confirm" id="confirm" hidden>
      <p>Start over? Your current quiz will be replaced.</p>
      <div class="actions"><button data-action="new">Start over</button><button class="quiet" data-action="cancel">Cancel</button></div>
    </div>
    ${LOG_URL ? '<p class="small muted">Answers are recorded anonymously.</p>' : ''}
  </section>`;
}

function choices(q, a, draft) {
  return `<fieldset class="choices"><legend class="sr">Choices</legend>${q.choices.map((c, i) => {
    const picked = String(a?.answer ?? draft) === c.id;
    let cls = 'choice';
    if (a && c.id === q.answer) cls += ' is-right';
    else if (a && picked) cls += ' is-wrong';
    return `<label class="${cls}"><input type="radio" name="answer" value="${esc(c.id)}" ${picked ? 'checked' : ''} ${a ? 'disabled' : ''}>
      <span class="key" aria-hidden="true">${'ABCD'[i]}</span>
      <span class="${looksLikeCode(c.text) ? 'choice-code' : 'choice-text'}">${esc(c.text)}</span></label>`;
  }).join('')}</fieldset>`;
}

function feedback(q, a) {
  const kind = outcome(a);
  const groups = q.type === 'short' && !a.skipped
    ? `<ul class="groups">${a.result.matches.map(m => `<li class="${m.term ? 'found' : 'missing'}">${esc(m.label)}${m.term ? `: <mark>${esc(m.term)}</mark>` : ''}</li>`).join('')}</ul>
       <p class="small muted">Keyword match only. Compare your answer with the one below.</p>`
    : '';
  const codeNote = q.type === 'code' && !a.skipped && !a.result.earned ? '<p class="small muted">Code is compared to a list of answers, not run, so other code may also work.</p>' : '';
  const last = state.quiz.index === state.quiz.questions.length - 1;
  return `<section class="feedback ${kind}" aria-live="polite">
    <h2 class="verdict">${verdict(q, a)}</h2>
    ${groups}${codeNote}
    ${q.type === 'mc' ? `<p class="explain">${rich(q.explanation)}</p>` : `<div class="compare">
      <div><h3>Your answer</h3>${answerText(q, a)}</div>
      <div><h3>Answer</h3>${reference(q)}</div>
    </div>`}
    <div class="actions">
      <button class="primary" data-action="next" id="next">${last ? 'Finish' : 'Next question'}</button>
      <a href="#wrong">See wrong answers</a>
    </div>
  </section>`;
}

function quizPage() {
  const s = state.quiz;
  if (!s) return home();
  if (quizDone()) return results();
  const q = s.questions[s.index], a = s.answers[s.index];
  const input = q.type === 'mc' ? choices(q, a, s.draft)
    : a ? '' : `<label class="sr" for="answer">Your answer</label><textarea id="answer" name="answer" class="${q.type === 'short' ? 'prose' : 'code'}" maxlength="4000" spellcheck="${q.type === 'short'}" autocapitalize="off" aria-keyshortcuts="Control+Enter Meta+Enter">${esc(s.draft)}</textarea>`;
  return `<div class="quiz-top">
      <span>Question ${s.index + 1} of ${s.questions.length}</span>
      <a href="#home">Pause</a>
    </div>
    ${progressStrip(s)}
    <article class="card">
      ${context(q)}
      <h1 class="stem">${rich(q.stem)}</h1>
      <form id="answer-form">
        ${input}
        ${a ? '' : `<div class="actions">
          <button class="primary" type="submit" id="check" ${s.draft.trim() ? '' : 'disabled'}>Check answer</button>
          <button type="button" class="quiet" data-action="hint" ${s.hint ? 'disabled' : ''}>Hint</button>
          <button type="button" class="quiet" data-action="skip">Skip</button>
        </div>
        <p id="notice" class="small" role="status"></p>`}
      </form>
      ${s.hint ? `<p class="hint">${rich(q.hint)}</p>` : ''}
      ${a ? feedback(q, a) : ''}
    </article>`;
}

function reviewList(list) {
  return list.map(a => {
    const q = a.question, n = state.quiz.answers.indexOf(a) + 1;
    return `<article class="review ${outcome(a)}">
      <p class="small muted">Question ${n}</p>
      ${context(q)}
      <h2 class="stem">${rich(q.stem)}</h2>
      <div class="compare">
        <div><h3>Your answer</h3>${answerText(q, a)}</div>
        <div><h3>Answer</h3>${reference(q)}</div>
      </div>
    </article>`;
  }).join('');
}

function results() {
  const all = entries(), misses = wrongAnswers(all);
  const right = all.filter(a => outcome(a) === 'right').length;
  const partial = all.filter(a => outcome(a) === 'partial').length;
  const skipped = all.filter(a => outcome(a) === 'skipped').length;
  return `<h1>Results</h1>
    <p class="score">${right} of ${state.quiz.questions.length} right</p>
    <p class="muted">${[partial && `${partial} partly right`, skipped && `${skipped} skipped`].filter(Boolean).join(', ')}</p>
    ${progressStrip(state.quiz)}
    <div class="actions">
      ${misses.length ? `<button class="primary" data-action="retry">Retry ${misses.length} wrong answer${misses.length === 1 ? '' : 's'}</button>` : ''}
      <button data-action="new">Start a new quiz</button>
    </div>
    ${misses.length ? `<h2 class="section">Wrong answers</h2>${reviewList(misses)}` : '<p>No wrong answers.</p>'}`;
}

function wrongPage() {
  const misses = wrongAnswers(entries());
  const back = state.quiz ? `<a href="#quiz">${quizDone() ? 'Back to results' : 'Back to the quiz'}</a>` : '<a href="#home">Home</a>';
  return `<h1>Wrong answers so far</h1>
    <div class="actions">${back}${misses.length ? '<button data-action="ask-retry">Retry these</button>' : ''}</div>
    <div class="confirm" id="confirm" hidden>
      <p>Retry these ${misses.length}? Your current quiz will be replaced.</p>
      <div class="actions"><button data-action="retry">Retry</button><button class="quiet" data-action="cancel">Cancel</button></div>
    </div>
    ${misses.length ? reviewList(misses) : '<p class="muted">Nothing wrong yet.</p>'}`;
}

function start(questions = null) {
  const retry = !!questions;
  state.quiz = {id: crypto.randomUUID(), bankVersion: version, questions: questions ? shuffleQuiz(questions) : buildQuiz(bank), answers: [], index: 0, draft: '', hint: false};
  save();
  logEvent('start', {quizId: state.quiz.id, retry, questionCount: state.quiz.questions.length, bankVersion: version});
  go('quiz');
}

function record(skipped = false) {
  const s = state.quiz, q = s.questions[s.index];
  if (s.answers[s.index]) return;
  const result = skipped
    ? {kind: q.type === 'mc' ? 'choice' : q.type === 'code' ? 'code' : 'keywords', earned: 0, possible: q.type === 'short' ? q.groups.length : 1, matches: []}
    : checkAnswer(q, s.draft);
  if (!result) { document.querySelector('#notice').textContent = 'Enter an answer first.'; return; }
  const a = {id: `${s.id}:${s.index}`, question: q, answer: skipped ? '' : s.draft, result, skipped, hinted: s.hint, at: new Date().toISOString()};
  s.answers[s.index] = a;
  state.attempts.push(a);
  save();
  logEvent('answer', {
    quizId: s.id, questionId: q.id, family: q.family, type: q.type, difficulty: q.difficulty,
    answer: skipped ? '' : q.type === 'mc' ? q.choices.find(c => c.id === s.draft)?.text : s.draft,
    earned: result.earned, possible: result.possible, skipped, hinted: s.hint, seconds: timerSeconds(), bankVersion: version,
  });
  render();
  document.querySelector('#next')?.focus({preventScroll: true});
  document.querySelector('.feedback')?.scrollIntoView({block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
}

function next() {
  const s = state.quiz;
  s.index++; s.draft = ''; s.hint = false;
  save();
  if (quizDone()) {
    const all = entries();
    logEvent('finish', {quizId: s.id, questionCount: s.questions.length, earned: all.reduce((n, a) => n + a.result.earned, 0), possible: all.reduce((n, a) => n + a.result.possible, 0), bankVersion: version});
    go('results');
  } else {
    render();
    window.scrollTo({top: 0});
    if (finePointer) document.querySelector('#answer, .choice input')?.focus({preventScroll: true});
  }
}

function render() {
  const route = location.hash.slice(1) || 'home';
  if (route === 'quiz' && state.quiz && !quizDone() && !state.quiz.answers[state.quiz.index]) {
    const key = `${state.quiz.id}:${state.quiz.index}`;
    if (shown.key !== key) shown = {key, ms: 0, at: Date.now()};
    else if (shown.at === null && document.visibilityState === 'visible') shown.at = Date.now();
  } else pauseTimer();
  const page = route === 'quiz' ? quizPage() : route === 'wrong' ? wrongPage() : route === 'results' && state.quiz && quizDone() ? results() : home();
  main.innerHTML = (storageOk ? '' : '<p class="warning">This browser isn’t saving progress. A refresh will lose your answers.</p>') + page;
  const n = wrongAnswers(entries()).length;
  document.querySelector('#wrong-count').textContent = n ? ` (${n})` : '';
}

main.addEventListener('submit', ev => { ev.preventDefault(); if (ev.target.id === 'answer-form') record(); });
main.addEventListener('input', ev => {
  if (!ev.target.closest('#answer-form') || !state.quiz || state.quiz.answers[state.quiz.index]) return;
  state.quiz.draft = ev.target.value;
  save();
  document.querySelector('#check').disabled = !ev.target.value.trim();
});
main.addEventListener('click', ev => {
  const b = ev.target.closest('button');
  if (!b) return;
  switch (b.dataset.action) {
    case 'start': if (state.quiz && !quizDone()) go('quiz'); else start(); break;
    case 'ask-new': case 'ask-retry': document.querySelector('#confirm').hidden = false; break;
    case 'cancel': document.querySelector('#confirm').hidden = true; break;
    case 'new': start(); break;
    case 'hint': state.quiz.hint = true; save(); render(); break;
    case 'skip': record(true); break;
    case 'next': next(); break;
    case 'retry': { const qs = wrongAnswers(entries()).map(a => a.question); if (qs.length) start(qs); break; }
  }
});

// Keyboard: A–D picks a choice, Ctrl/⌘+Enter checks a typed answer.
document.addEventListener('keydown', ev => {
  if ((location.hash.slice(1) || 'home') !== 'quiz' || !state.quiz || quizDone()) return;
  const s = state.quiz, q = s.questions[s.index];
  if (s.answers[s.index]) return;
  if (ev.key === 'Enter' && (ev.metaKey || ev.ctrlKey) && ev.target.id === 'answer') { ev.preventDefault(); record(); return; }
  if (q.type !== 'mc' || ev.target.tagName === 'TEXTAREA' || ev.metaKey || ev.ctrlKey || ev.altKey) return;
  const i = 'abcd'.indexOf(ev.key.toLowerCase());
  const radio = document.querySelectorAll('.choice input')[i];
  if (radio) { radio.checked = true; radio.focus(); radio.dispatchEvent(new Event('input', {bubbles: true})); }
});
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') pauseTimer(); else render(); });
window.addEventListener('hashchange', () => { render(); window.scrollTo({top: 0}); main.focus({preventScroll: true}); });
render();
logEvent('visit', {bankVersion: version});

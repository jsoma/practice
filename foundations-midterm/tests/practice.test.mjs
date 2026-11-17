import test from 'node:test';
import assert from 'node:assert/strict';
import {bank} from "../questions.js";
import {emptyProgress, familiesOf, recordResult, pickNext, summary, RELEARN_AFTER} from '../practice.js';

const DAY = 864e5;
const answer = (p, right, now) => {
  const q = pickNext(p, bank, now);
  recordResult(p, q, right, now);
  p.history.push({family: q.family, questionId: q.id});
  return q;
};

test('new practice works through unseen topics without repeating one', () => {
  const p = emptyProgress(), now = Date.now(), seen = new Set();
  for (let i = 0; i < familiesOf(bank).size; i++) seen.add(answer(p, true, now).family);
  assert.equal(seen.size, familiesOf(bank).size);
  assert.equal(summary(p, bank).right, seen.size);
});

test('a miss comes back a few questions later', () => {
  const p = emptyProgress(), now = Date.now();
  const missed = answer(p, false, now).family;
  const next = [];
  for (let i = 0; i < RELEARN_AFTER + 1; i++) next.push(answer(p, true, now).family);
  assert.equal(next.slice(0, RELEARN_AFTER).includes(missed), false);
  assert.equal(next[RELEARN_AFTER], missed);
});

test('the topic comes back as a different version when one exists', () => {
  const p = emptyProgress(), now = Date.now();
  const first = answer(p, false, now);
  for (let i = 0; i < RELEARN_AFTER; i++) answer(p, true, now);
  const again = pickNext(p, bank, now);
  assert.equal(again.family, first.family);
  if (familiesOf(bank).get(first.family).length > 1) assert.notEqual(again.id, first.id);
});

test('right answers are spaced out by days', () => {
  const p = emptyProgress(), now = Date.now();
  const q = bank[0];
  recordResult(p, q, true, now);
  assert.equal(p.families[q.family].dueAt, now + DAY);
  recordResult(p, q, true, now);
  assert.equal(p.families[q.family].dueAt, now + 2 * DAY);
  recordResult(p, q, false, now);
  assert.equal(p.families[q.family].box, 0);
});

test('practice never runs out', () => {
  const p = emptyProgress(), now = Date.now();
  for (let i = 0; i < familiesOf(bank).size * 3; i++) assert.ok(answer(p, i % 4 !== 0, now));
});

test('the same topic is never shown twice in a row', () => {
  const p = emptyProgress(), now = Date.now();
  let last = null;
  for (let i = 0; i < 200; i++) { const q = answer(p, i % 3 === 0, now); assert.notEqual(q.family, last); last = q.family; }
});

test('new topics keep coming even when everything is wrong', () => {
  const p = emptyProgress(), now = Date.now();
  const firsts = [];
  for (let i = 0; i < 60; i++) {
    const q = pickNext(p, bank, now);
    if (!p.families[q.family]) firsts.push(i);
    recordResult(p, q, false, now);
    p.history.push({family: q.family, questionId: q.id});
  }
  for (let i = 1; i < firsts.length; i++) assert.ok(firsts[i] - firsts[i - 1] <= 3, `gap before question ${firsts[i]}`);
  assert.ok(firsts.length >= 20);
});

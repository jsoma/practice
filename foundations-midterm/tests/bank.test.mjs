import test from 'node:test';
import assert from 'node:assert/strict';
import {bank} from '../questions.js';
import {checkAnswer} from '../quiz.js';

test('ids are unique', () => {
  assert.equal(new Set(bank.map(q => q.id)).size, bank.length);
});

test('every question is complete and its own answer is accepted', () => {
  for (const q of bank) {
    assert.ok(q.family && q.stem && q.explanation && q.hint, q.id);
    assert.ok(['easy', 'standard', 'stretch'].includes(q.difficulty), q.id);
    if (q.type === 'mc') {
      assert.equal(q.choices.length, 4, q.id);
      assert.equal(new Set(q.choices.map(c => c.text)).size, 4, q.id);
      assert.equal(checkAnswer(q, q.answer).earned, 1, q.id);
    } else if (q.type === 'code') {
      assert.ok(q.accepted.length, q.id);
      for (const a of q.accepted) assert.equal(checkAnswer(q, a).earned, 1, `${q.id}: ${a}`);
    } else {
      assert.equal(q.type, 'short', q.id);
      assert.ok(q.groups.length && q.groups.every(g => g.label && g.any.length), q.id);
      const r = checkAnswer(q, q.explanation);
      assert.equal(r.earned, r.possible, `${q.id}: the explanation should match its own keywords`);
    }
  }
});

test('tables have a value for every column', () => {
  for (const q of bank.filter(q => q.table)) for (const row of q.table.rows) assert.equal(row.length, q.table.headers.length, q.id);
});

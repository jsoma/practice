import test from 'node:test';
import assert from 'node:assert/strict';
import {checkAnswer, normalizeCode} from '../quiz.js';
import {scoreAnswer, normalize} from '../core.js';

const code = accepted => ({type: 'code', accepted});
const output = accepted => ({type: 'code', output: true, accepted});
const short = groups => ({type: 'short', groups: groups.map(([label, ...any]) => ({label, any}))});

test('code answers keep index signs and allow print, spacing and quote style', () => {
  const q = code(['cats[-1]', 'cats[2]']);
  for (const a of ['cats[-1]', 'print(cats[-1])', 'cats [ -1 ]', '```python\ncats[-1]\n```', 'cats[2]']) assert.equal(checkAnswer(q, a).earned, 1, a);
  for (const a of ['cats[1]', 'CATS[-1]', 'cats(-1)', 'boxcar']) assert.equal(checkAnswer(q, a).earned, 0, a);
  assert.equal(checkAnswer(q, ' '), null);
  const key = code(["cat['name']"]);
  assert.equal(checkAnswer(key, 'cat["name"]').earned, 1);
  assert.equal(checkAnswer(key, "cat['na me']").earned, 0);
  assert.notEqual(normalizeCode('x[-2:]'), normalizeCode('x[2:]'));
});

test('assignments are not accepted inside print', () => {
  assert.equal(checkAnswer(code(['age = int(age)']), 'print(age = int(age))').earned, 0);
});

test('typed output ignores surrounding quotes only', () => {
  const q = output(['34']);
  for (const a of ['34', "'34'", '"34"']) assert.equal(checkAnswer(q, a).earned, 1, a);
  for (const a of ['7', "'3'+'4'"]) assert.equal(checkAnswer(q, a).earned, 0, a);
});

test('keyword groups: full, partial, none, empty', () => {
  const q = short([['directories', 'directory', 'directories', 'folder', 'folders'], ['searching', 'search', 'searches', 'look for', 'looks for']]);
  assert.equal(scoreAnswer(q, 'PATH SEARCHES the DIRECTORIES.').earned, 2);
  assert.equal(scoreAnswer(q, 'It looks for programs in folders.').earned, 2);
  assert.equal(scoreAnswer(q, 'Directories.').earned, 1);
  assert.equal(scoreAnswer(q, 'A breakfast sandwich.').earned, 0);
  assert.equal(scoreAnswer(q, 'research directoryish').earned, 0);
  assert.equal(scoreAnswer(q, '  '), null);
  assert.equal(normalize('Looks—for  FOLDERS!'), 'looks for folders');
});

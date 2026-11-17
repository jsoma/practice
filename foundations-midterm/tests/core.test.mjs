import test from 'node:test';
import assert from 'node:assert/strict';
import {families,objectives,topicNames} from '../bank.js';
import {normalize,scoreAnswer,shuffle,seededRandom} from '../core.js';
const path=families.find(q=>q.id==='path-0');
test('coverage is 20 core + 8 extensions, balanced across 28 skills, all included',()=>{
 assert.equal(objectives.length,28);assert.equal(objectives.filter(o=>o.coverage==='core').length,20);
 assert.equal(objectives.filter(o=>o.coverage==='extension').length,8);
 assert.equal(objectives.filter(o=>o.emphasis==='conceptual').length,14);
 assert.equal(objectives.filter(o=>o.emphasis==='technical').length,14);
 assert.ok(objectives.some(o=>o.id==='missing-zero'));assert.ok(objectives.every(o=>!('upcoming' in o)));
});
test('every prompt has a known objective, unique ID, usable rubric, hint, and reference',()=>{
 assert.equal(new Set(families.map(q=>q.id)).size,families.length);
 for(const q of families){
  assert.ok(objectives.some(o=>o.id===q.objective),q.id);assert.ok(q.stem&&q.explanation&&q.hint,q.id);
  if(q.type==='mc'){assert.equal(q.choices.length,4);assert.equal(q.choices.filter(c=>c.id===q.answer).length,1);assert.equal(new Set(q.choices.map(c=>c.text)).size,4,q.id);}
  else {assert.ok(q.groups.length);assert.ok(q.groups.every(g=>g.label&&g.any.length&&g.any.every(x=>typeof x==='string'&&x.length)));}
 }
 for(const o of objectives)assert.ok(families.some(q=>q.objective===o.id),o.id);
});
test('full, partial, zero, empty and alternate-phrase keyword results',()=>{
 assert.equal(scoreAnswer(path,'PATH SEARCHES the DIRECTORIES.').earned,2);
 assert.equal(scoreAnswer(path,'It looks for programs in folders.').earned,2);
 assert.equal(scoreAnswer(path,'Directories.').earned,1);
 assert.equal(scoreAnswer(path,'A breakfast sandwich.').earned,0);
 assert.equal(scoreAnswer(path,'  '),null);
 assert.equal(scoreAnswer(path,'research directoryish').earned,0);
 assert.equal(normalize('Looks—for  FOLDERS!'),'looks for folders');
});
test('reference explanations match their own authored rubric',()=>{
 for(const q of families.filter(q=>q.type==='short')){const s=scoreAnswer(q,q.explanation);assert.equal(s.earned,s.possible,q.id);}
});
test('naive matcher intentionally cannot evaluate negation',()=>{
 const s=scoreAnswer(path,'PATH never searches directories.');assert.equal(s.earned,2);
});
test('shuffling choices preserves stable answer IDs',()=>{
 for(const q of families.filter(q=>q.type==='mc')){
  const shuffled={...q,choices:shuffle(q.choices,seededRandom(42))};
  assert.equal(scoreAnswer(shuffled,q.answer).earned,1);
  assert.equal(scoreAnswer(shuffled,q.choices.find(c=>c.id!==q.answer).id).earned,0);
 }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {families} from '../bank.js';
import {codeQuestions} from '../code-questions.js';
import {variants} from '../variants.js';
import {checkAnswer,buildQuiz} from '../quiz.js';
import {bank} from '../questions.js';

test('ids are unique across the whole bank',()=>{
 assert.equal(new Set(bank.map(q=>q.id)).size,bank.length);
});
test('every variant is well formed and its own reference answer scores fully',()=>{
 for(const q of variants){
  assert.ok(q.family&&q.stem&&q.explanation&&q.hint,q.id);
  if(q.type==='mc'){assert.equal(q.choices.length,4,q.id);assert.equal(new Set(q.choices.map(c=>c.text)).size,4,q.id);assert.equal(checkAnswer(q,q.answer).earned,1,q.id);}
  else if(q.type==='code'){assert.ok(q.accepted.length,q.id);for(const a of q.accepted)assert.equal(checkAnswer(q,a).earned,1,`${q.id}: ${a}`);}
  else {const r=checkAnswer(q,q.explanation);assert.equal(r.earned,r.possible,`${q.id}: ${JSON.stringify(r.matches)}`);}
 }
});
test('the opening question stays first and families stay one-per-quiz',()=>{
 for(let seed=1;seed<=20;seed++){const qs=buildQuiz(bank,seed);assert.equal(qs[0].id,'code-list-last');assert.equal(new Set(qs.map(q=>q.family)).size,qs.length);}
});
test('typed output ignores surrounding quotes but not wrong values',()=>{
 const q=variants.find(q=>q.output&&q.accepted[0]==='34');
 for(const a of ['34',"'34'",'"34"'])assert.equal(checkAnswer(q,a).earned,1,a);
 for(const a of ['7','3 + 4',"'3'+'4'"])assert.equal(checkAnswer(q,a).earned,0,a);
});
test('signed slices are not confused',()=>{
 const q=variants.find(q=>q.family==='code-slices'&&q.accepted.includes('stops[-2:]'));
 assert.equal(checkAnswer(q,'stops[-2:]').earned,1);assert.equal(checkAnswer(q,'stops[2:]').earned,0);assert.equal(checkAnswer(q,'stops[:-2]').earned,0);
});
test('log events carry an anonymous id and send nothing without a URL',async()=>{
 const {buildEvent,browserId,logEvent}=await import('../log.js');
 const e=buildEvent('answer',{questionId:'x'});
 assert.equal(e.event,'answer');assert.equal(e.questionId,'x');assert.equal(e.browserId,browserId);assert.match(browserId,/^[0-9a-f-]{36}$/);
 const real=globalThis.fetch;let called=false;globalThis.fetch=()=>{called=true;return Promise.resolve();};
 try{logEvent('visit',{},'');}finally{globalThis.fetch=real;}
 assert.equal(called,false);
});

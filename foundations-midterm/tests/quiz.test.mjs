import test from 'node:test';
import assert from 'node:assert/strict';
import {families} from '../bank.js';
import {codeQuestions} from '../code-questions.js';
import {normalizeCode,checkAnswer,buildQuiz,wrongAnswers,loadQuizState,saveQuizState} from '../quiz.js';
import {readFileSync} from 'node:fs';
const last=codeQuestions.find(q=>q.id==='code-list-last');
import {bank} from '../questions.js';
test('last-list-item answers preserve index signs and accept listed equivalent forms',()=>{
 for(const answer of ['cats[-1]','cats[2]','cats[len(cats) - 1]','print(cats[-1])','cats [ -1 ]','```python\ncats[-1]\n```'])assert.equal(checkAnswer(last,answer).earned,1,answer);
 for(const answer of ['cats[1]','cats[0]','boxcar','CATS[-1]','cats(-1)','cats[3]'])assert.equal(checkAnswer(last,answer).earned,0,answer);
 assert.equal(checkAnswer(last,' '),null);
});
test('quoted dictionary keys and whitespace are handled without merging different keys',()=>{
 const q=codeQuestions.find(q=>q.id==='code-dict-name');
 assert.equal(checkAnswer(q,'cat["name"]').earned,1);
 assert.equal(checkAnswer(q,"print(cat['name'])").earned,1);
 assert.equal(checkAnswer(q,"cat['na me']").earned,0);
 assert.notEqual(normalizeCode('cats[-1]'),normalizeCode('cats[1]'));
});
test('every code question has correct listed forms; assignment inside print is not accepted',()=>{
 for(const q of codeQuestions){assert.ok(q.accepted.length);for(const a of q.accepted)assert.equal(checkAnswer(q,a).earned,1,q.id);}
 const assignment=codeQuestions.find(q=>q.id==='code-convert');
 assert.equal(checkAnswer(assignment,'print(age=int(age))').earned,0);
});
test('Start covers every family once',()=>{
 const expected=new Set(bank.map(q=>q.family??q.id));
 for(let seed=1;seed<=20;seed++){
  const qs=buildQuiz(bank,seed);assert.equal(qs.length,expected.size);
  assert.equal(new Set(qs.map(q=>q.family??q.id)).size,qs.length);
  assert.deepEqual(new Set(qs.map(q=>q.family??q.id)),expected);
 }
});
test('wrong review includes wrong, partial, and skipped answers but not fully matched ones',()=>{
 const records=[{answer:'cats[1]',question:last,result:{earned:0,possible:1}},{answer:'cats[-1]',question:last,result:{earned:1,possible:1}},{answer:'folders',question:families.find(q=>q.id==='path-0'),result:{earned:1,possible:2}},{skipped:true,answer:'',question:last,result:{earned:0,possible:1}}];
 assert.equal(wrongAnswers(records).length,3);assert.equal(wrongAnswers(records)[0].answer,'cats[1]');
 assert.equal(wrongAnswers(records)[0].question.accepted[0],'cats[-1]');
});
test('quiz and submitted answers survive saving and loading',()=>{
 let data;const storage={getItem(){return data;},setItem(k,v){data=v;}};
 const entry={answer:'cats[1]',question:last,result:{kind:'code',earned:0,possible:1,matches:[]}};
 const s={version:3,quiz:{questions:[last],answers:[entry],index:0,draft:'cats[1]'},attempts:[entry]};
 assert.equal(saveQuizState(storage,s),true);assert.deepEqual(loadQuizState(storage),s);
 data='broken';assert.equal(loadQuizState(storage).quiz,null);
 assert.equal(saveQuizState({setItem(){throw Error('no storage');}},s),false);
});
test('the page keeps the wrong-answers link',()=>{
 const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 assert.doesNotMatch(app+html,/<select|<details/);
 assert.match(html,/See wrong answers/);
});

import {scoreAnswer,shuffle,seededRandom} from './core.js';
export function normalizeCode(answer){
 let text=String(answer??'').trim().replace(/^```(?:python|py)?\s*\n?([\s\S]*?)\n?```$/i,'$1').trim().replace(/;\s*$/,'');
 let out='',quote=null,content='';
 for(let i=0;i<text.length;i++){
  const c=text[i];
  if(quote){
   if(c==='\\'&&i+1<text.length){content+=c+text[++i];}
   else if(c===quote){out+=JSON.stringify(content);quote=null;content='';}
   else content+=c;
  }else if(c==='"'||c==="'"){quote=c;content='';}
  else if(!/\s/.test(c))out+=c;
 }
 return quote?text:out;
}
export function checkAnswer(question,answer){
 if(question.type!=='code')return scoreAnswer(question,answer);
 if(!String(answer??'').trim())return null;
 const text=question.output?String(answer).trim().replace(/^(['"])([\s\S]*)\1$/,'$2'):answer;
 const normalized=normalizeCode(text);
 const matched=question.accepted.find(a=>normalizeCode(a)===normalized||(!/^[A-Za-z_]\w*\s*=/.test(a)&&normalizeCode(`print(${a})`)===normalized));
 return {kind:'code',earned:matched?1:0,possible:1,matches:[],matched:matched??null};
}
export function buildQuiz(bank,seed=Date.now()){
 const rng=seededRandom(seed),groups=new Map();
 for(const q of bank){const key=q.family??q.id;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(q);}
 const selected=[...groups.values()].map(group=>group[Math.floor(rng()*group.length)]);
 const first=selected.find(q=>q.id==='code-list-last');
 const rest=shuffle(selected.filter(q=>q!==first),rng).map(q=>({...q,choices:q.choices?shuffle(q.choices,rng):undefined}));
 return first?[first,...rest]:rest;
}
export function wrongAnswers(entries){return entries.filter(a=>a.skipped||a.result.earned<a.result.possible);}
export function loadQuizState(storage){
 const empty={version:3,quiz:null,attempts:[]};
 try{
  const v=JSON.parse(storage.getItem('foundations-quiz-v3'));
  if(v?.version!==3||!Array.isArray(v.attempts))return empty;
  v.attempts=v.attempts.filter(a=>a&&a.question&&a.result&&Number.isFinite(a.result.earned)&&Number.isFinite(a.result.possible));
  if(v.quiz&&(!Array.isArray(v.quiz.questions)||!Array.isArray(v.quiz.answers)||!Number.isInteger(v.quiz.index)||v.quiz.index<0||v.quiz.index>v.quiz.questions.length))v.quiz=null;
  return {version:3,quiz:v.quiz,attempts:v.attempts};
 }catch{return empty;}
}
export function saveQuizState(storage,state){try{storage.setItem('foundations-quiz-v3',JSON.stringify(state));return true;}catch{return false;}}

export function normalize(text){
 return String(text??'').normalize('NFKC').toLowerCase().replace(/[’‘]/g,"'").replace(/[^\p{L}\p{N}]+/gu,' ').trim().replace(/\s+/g,' ');
}
export function scoreAnswer(question, answer){
 if(!String(answer??'').trim())return null;
 if(question.type==='mc'){
  if(!question.choices.some(c=>c.id===answer))return null;
  return {kind:'choice',earned:answer===question.answer?1:0,possible:1,matches:[]};
 }
 const text=` ${normalize(answer)} `;
 const matches=question.groups.map(group=>{
  const term=group.any.find(value=>text.includes(` ${normalize(value)} `));
  return {label:group.label,term:term??null};
 });
 return {kind:'keywords',earned:matches.filter(m=>m.term).length,possible:matches.length,matches};
}
export function seededRandom(seed){
 let x=Number(seed)>>>0||1;
 return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296;};
}
export function shuffle(items,rng=Math.random){
 const result=[...items];for(let i=result.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[result[i],result[j]]=[result[j],result[i]];}return result;
}

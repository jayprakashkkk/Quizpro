
export const shuffle = (arr) => { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; };
export function makeQuiz(bank, subject, count=20, userId='guest'){
 const key='bca-quiz-used-'+userId+'-'+subject; let used=[]; try{used=JSON.parse(localStorage.getItem(key)||'[]')}catch{}
 const eligible=bank.filter(q=>subject==='All Subjects (Mixed)'||q.subject===subject);
 if(eligible.length<count) throw new Error('This subject needs at least 20 questions.');
 let unseen=eligible.filter(q=>!used.includes(q.id)); if(unseen.length<count){used=[];unseen=eligible;}
 const picked=shuffle(unseen).slice(0,count);
 localStorage.setItem(key,JSON.stringify([...used,...picked.map(q=>q.id)].slice(-eligible.length)));
 return picked.map(q=>{const opts=shuffle(q.options.map((text,originalIndex)=>({text,originalIndex})));return {...q,options:opts.map(x=>x.text),correctIndex:opts.findIndex(x=>x.originalIndex===q.correctIndex)};});
}
export function computeStats(attempts){
 const n=attempts.length, DAY=86400000;
 const best=n?Math.max(...attempts.map(a=>a.score)):null;
 const avg=n?Math.round(attempts.reduce((s,a)=>s+a.percentage,0)/n):null;
 const day=d=>{const x=new Date(d);return new Date(x.getFullYear(),x.getMonth(),x.getDate()).getTime();};
 const days=[...new Set(attempts.map(a=>day(a.date)))].sort((a,b)=>b-a);
 let streak=0;
 if(days.length&&Math.round((day(Date.now())-days[0])/DAY)<=1){streak=1;for(let i=1;i<days.length;i++){if(Math.round((days[i-1]-days[i])/DAY)===1)streak++;else break;}}
 const agg={};
 attempts.forEach(a=>Object.entries(a.bySubject||{}).forEach(([s,v])=>{agg[s]??={c:0,t:0};agg[s].c+=v.correct;agg[s].t+=v.total;}));
 const subs=Object.entries(agg).filter(([,v])=>v.t>=5).map(([s,v])=>({subject:s,pct:Math.round(v.c/v.t*100)})).sort((a,b)=>a.pct-b.pct);
 return {n,best,avg,streak,weakest:subs[0]||null,strongest:subs.length>1?subs[subs.length-1]:null};
}

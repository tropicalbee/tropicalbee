import {optimiseRoute} from './optimize-route.mjs';
const DAY=86400000;
const key=(c,r)=>`${c},${r}`;
export function buildPlan(calendar,duration=24){
 const days=[...calendar.days].sort((a,b)=>a.date.localeCompare(b.date));
 const first=Date.parse(days[0].date+'T00:00:00Z');
 const start=first-new Date(first).getUTCDay()*DAY;
 const seen=new Set();
 const cells=days.map(day=>{
  const t=Date.parse(day.date+'T00:00:00Z');
  if(!Number.isFinite(t)||new Date(t).toISOString().slice(0,10)!==day.date||seen.has(day.date)||!Number.isInteger(day.count)||day.count<0||!Number.isInteger(day.level)||day.level<0||day.level>4||(day.count===0)!==(day.level===0))throw Error('Invalid calendar data');
  seen.add(day.date);return {...day,c:Math.floor((t-start)/DAY/7),r:new Date(t).getUTCDay()};
 });
 if(cells.length<350||cells.length>371||(Date.parse(days.at(-1).date+'T00:00:00Z')-first)/DAY+1!==cells.length)throw Error('Expected contiguous daily calendar');
 const active=cells.filter(c=>c.level>0);
 const route=optimiseRoute(cells,active);
 let current=route.initial;
 const initial=current,raw=[],mines=[];let clock=0;
 const mine=cell=>{raw.push({kind:'mine',start:clock,end:clock+.24,from:cell,to:cell});clock+=.24;mines.push({date:cell.date,key:key(cell.c,cell.r),at:clock});};
 if(active.length)mine(current);
 for(const step of route.walk){
  const cell=step.cell;raw.push({kind:'move',start:clock,end:clock+.065,from:current,to:cell});clock+=.065;current=cell;
  if(step.mine)mine(current);
 }
 const intro=.7,reset=duration-1.3,end=reset-1,scale=clock?(end-intro)/clock:1;
 const segments=raw.map(s=>({...s,start:intro+s.start*scale,end:intro+s.end*scale}));
 const events=mines.map(m=>({...m,at:intro+m.at*scale}));
 const minedAt=new Map(events.map(m=>[m.date,m.at]));
 return {cells,active,initial,last:current,segments,events,minedAt,start,reset,end,duration,weeks:Math.max(...cells.map(c=>c.c))+1,optimisation:route.metrics};
}
export function stateAt(plan,t){
 const segment=plan.segments.find(s=>t>=s.start&&t<s.end);
 let c=plan.initial.c,r=plan.initial.r,hit=0;
 if(segment){
  const progress=(t-segment.start)/(segment.end-segment.start);
  c=segment.from.c+(segment.to.c-segment.from.c)*progress;r=segment.from.r+(segment.to.r-segment.from.r)*progress;
  if(segment.kind==='mine')hit=Math.sin(Math.PI*progress);
 }else if(t>=plan.end){c=plan.last.c;r=plan.last.r;}
 const resetProgress=Math.max(0,Math.min(1,(t-plan.reset)/(plan.duration-plan.reset)));
 const opacity=Math.min(1,t/.5)*(1-resetProgress);
 const mined=plan.events.filter(e=>e.at<=t).length;
 return {c,r,hit,opacity,mined,resetProgress,segment};
}

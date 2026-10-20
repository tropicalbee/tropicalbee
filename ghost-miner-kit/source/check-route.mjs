import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {buildPlan,stateAt} from './route.mjs';
const data=JSON.parse(await fs.readFile(fileURLToPath(new URL('../data/calendar.json',import.meta.url)),'utf8'));
const plan=buildPlan(data);
assert.equal(plan.events.length,data.days.filter(d=>d.count>0).length);
assert.equal(new Set(plan.events.map(e=>e.date)).size,plan.events.length);
assert.deepEqual(new Set(plan.events.map(e=>e.date)),new Set(data.days.filter(d=>d.count>0).map(d=>d.date)));
const valid=new Set(plan.cells.map(c=>`${c.c},${c.r}`));
let previous=plan.initial;
for(const step of plan.segments){
 assert(valid.has(`${step.to.c},${step.to.r}`));
 assert.equal(previous.date,step.from.date);
 if(step.kind==='move')assert.equal(Math.abs(step.to.c-step.from.c)+Math.abs(step.to.r-step.from.r),1);
 assert(step.end>step.start);
 previous=step.to;
}
assert.equal(stateAt(plan,0).mined,0);
assert.equal(stateAt(plan,plan.end+.1).mined,plan.active.length);
assert.equal(stateAt(plan,plan.duration-.001).resetProgress>.99,true);
assert.equal(plan.cells[0].r,new Date(data.start_date+'T00:00:00Z').getUTCDay());
assert.equal(plan.cells.at(-1).r,new Date(data.end_date+'T00:00:00Z').getUTCDay());
assert.equal(plan.initial.date,(data.days.filter(d=>d.count>0).at(-1)??data.days.at(-1)).date,'Start at the latest active day');
const baseline=JSON.parse(await fs.readFile(fileURLToPath(new URL('../data/route-baseline.json',import.meta.url)),'utf8'));
const moves=plan.segments.filter(s=>s.kind==='move');
assert(moves.length<=plan.optimisation.baselineSteps,'The route must never increase nearest-first travel');
const repeatedEdges=segments=>{
 const seen=new Set();let repeated=0;
 for(const s of segments){const edge=[s.from.date,s.to.date].sort().join('/');if(seen.has(edge))repeated++;seen.add(edge);}
 return repeated;
};
const signature=createHash('sha256').update(JSON.stringify(data.days.map(({date,count,level})=>({date,count,level})))).digest('hex');
if(signature===baseline.calendarDaysSha256){
 assert.equal(plan.optimisation.baselineSteps,baseline.moveSteps);
 assert(moves.length<baseline.moveSteps,'The bundled sample must improve on nearest-first travel');
 assert(repeatedEdges(moves)<baseline.repeatedEdges,'The bundled sample should backtrack less');
}
assert.deepEqual(buildPlan(data).segments,plan.segments,'The route must be deterministic');
const empty=structuredClone(data);for(const day of empty.days){day.count=0;day.level=0;}
const idle=buildPlan(empty);assert.equal(idle.events.length,0);assert.equal(stateAt(idle,12).mined,0);
const single=structuredClone(empty);single.days[120].count=1;single.days[120].level=1;
const one=buildPlan(single);assert.equal(one.events.length,1);assert.equal(one.segments.filter(s=>s.kind==='move').length,0);
// Exercise partial calendar boundaries, widely separated ore and a full field.
const patterns=[i=>i%23===0,i=>i===0||i===data.days.length-1,i=>i%7===0||i%11===0,()=>true];
for(const pattern of patterns){
 const fixture=structuredClone(empty);
 fixture.days.forEach((day,i)=>{if(pattern(i)){day.count=1;day.level=1;}});
 const candidate=buildPlan(fixture),validDays=new Set(fixture.days.map(d=>d.date));
 assert.equal(candidate.events.length,fixture.days.filter(d=>d.count>0).length);
 assert.equal(new Set(candidate.events.map(e=>e.date)).size,candidate.events.length);
 assert(candidate.optimisation.optimisedSteps<=candidate.optimisation.baselineSteps,'Optimisation must never increase travel');
 let previous=candidate.initial;
 for(const step of candidate.segments){
  assert.equal(step.from.date,previous.date);assert(validDays.has(step.to.date));
  if(step.kind==='move')assert.equal(Math.abs(step.to.c-step.from.c)+Math.abs(step.to.r-step.from.r),1);
  previous=step.to;
 }
}
const invalid=structuredClone(data);invalid.days[1].date=invalid.days[0].date;
assert.throws(()=>buildPlan(invalid),/Invalid calendar/);
console.log(JSON.stringify({dailyCells:plan.cells.length,activeDays:plan.active.length,allActiveDaysMinedExactlyOnce:true,fourNeighbourRoute:true,baselineSteps:plan.optimisation.baselineSteps,optimisedSteps:moves.length,optimisedRepeatedEdges:repeatedEdges(moves),deterministic:true,edgeCasePatterns:patterns.length,emptyAccount:'passed',invalidCalendar:'rejected',status:'passed'}));

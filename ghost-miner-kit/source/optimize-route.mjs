const key=cell=>`${cell.c},${cell.r}`;
const directions=[[-1,0],[0,-1],[0,1],[1,0]];

// Optimise a fixed-start, free-end tour over the actual day-cell graph.
// This is a deterministic heuristic, not a proof of a globally shortest tour.
export function optimiseRoute(cells,active){
 const byKey=new Map(cells.map((cell,i)=>[key(cell),i]));
 const neighbours=cells.map(cell=>directions.flatMap(([dc,dr],direction)=>{
  const index=byKey.get(`${cell.c+dc},${cell.r+dr}`);
  return index===undefined?[]:[{index,direction}];
 }));
 const targets=active.map(cell=>byKey.get(key(cell))),n=targets.length;
 const origin=n?n-1:byKey.get(key(cells.at(-1)));
 if(!n)return {initial:cells[origin],walk:[],metrics:{method:'multi-seed 2-opt and relocation',baselineSteps:0,optimisedSteps:0,baselineTurns:0,optimisedTurns:0,candidates:1}};
 const searches=targets.map(source=>{
  const distance=new Int16Array(cells.length).fill(-1),rank=new Int16Array(cells.length).fill(-1),queue=[source];
  distance[source]=0;rank[source]=0;
  for(let i=0;i<queue.length;i++)for(const next of neighbours[queue[i]])if(distance[next.index]===-1){
   distance[next.index]=distance[queue[i]]+1;rank[next.index]=queue.length;queue.push(next.index);
  }
  return {distance,rank};
 });
 const distance=searches.map(search=>targets.map(target=>search.distance[target]));
 if(distance.some(row=>row.some(d=>d<0)))throw Error('Unreachable active contribution day');
 const cost=order=>order.slice(1).reduce((sum,b,i)=>sum+distance[order[i]][b],0);
 function nearest(second){
  const order=[origin],remaining=new Set(targets.map((_,i)=>i));remaining.delete(origin);
  if(second!==undefined){order.push(second);remaining.delete(second);}
  while(remaining.size){
   const current=order.at(-1);let next;
   for(const candidate of remaining)if(next===undefined||distance[current][candidate]<distance[current][next]||
    (distance[current][candidate]===distance[current][next]&&searches[current].rank[targets[candidate]]<searches[current].rank[targets[next]]))next=candidate;
   order.push(next);remaining.delete(next);
  }
  return order;
 }
 function improve(seed){
  const order=[...seed],edge=(a,b)=>a===undefined||b===undefined?0:distance[a][b];
  // Each accepted change saves at least one grid step. The bounded search is
  // practical even for a full 53-week calendar and never accepts a regression.
  for(let pass=0;pass<n*2;pass++){
   let gain=0,best;
   for(let i=1;i<n-1;i++)for(let j=i+1;j<n;j++){
    const saved=edge(order[i-1],order[i])+edge(order[j],order[j+1])-edge(order[i-1],order[j])-edge(order[i],order[j+1]);
    if(saved>gain){gain=saved;best={kind:'reverse',i,j};}
   }
   for(let length=1;length<=3;length++)for(let i=1;i+length<=n;i++){
    const a=order[i],b=order[i+length-1],before=order[i-1],after=order[i+length];
    const removed=edge(before,a)+edge(b,after)-edge(before,after);
    for(let j=0;j<n;j++){
     if(j>=i-1&&j<i+length)continue;
     const saved=removed-edge(order[j],a)-edge(b,order[j+1])+edge(order[j],order[j+1]);
     if(saved>gain){gain=saved;best={kind:'relocate',i,j,length};}
    }
   }
   if(!best)break;
   if(best.kind==='reverse')order.splice(best.i,best.j-best.i+1,...order.slice(best.i,best.j+1).reverse());
   else {const block=order.splice(best.i,best.length),at=best.j>best.i?best.j-best.length:best.j;order.splice(at+1,0,...block);}
  }
  return order;
 }
 const baseline=nearest();
 const baselineSteps=cost(baseline);
 // Expand a tour into shortest legal walks. Among equally short walks, use
 // dynamic programming to minimise direction changes, including the arrival.
 function expand(order,smooth=true){
  const remaining=new Set(targets),walk=[];let current=targets[origin],previousDirection=-1,turns=0;
  remaining.delete(current);
  for(const target of order.slice(1)){
   const destination=targets[target];if(!remaining.has(destination))continue;
   const distances=searches[target].distance,memo=new Map();
   function bends(index,previous){
    if(index===destination)return 0;
    const code=index*5+previous+1;if(memo.has(code))return memo.get(code);
    let best=Infinity;
    for(const next of neighbours[index])if(distances[next.index]===distances[index]-1)
     best=Math.min(best,(previous<0||previous===next.direction?0:1)+bends(next.index,next.direction));
    memo.set(code,best);return best;
   }
   while(current!==destination){
    const choices=neighbours[current].filter(next=>distances[next.index]===distances[current]-1);
    let next=choices[0];
    if(smooth)for(const candidate of choices){
     const score=choice=>(previousDirection<0||previousDirection===choice.direction?0:1)+bends(choice.index,choice.direction);
     if(score(candidate)<score(next))next=candidate;
    }
    if(!next)throw Error('Unreachable active contribution day');
    if(previousDirection>=0&&previousDirection!==next.direction)turns++;
    current=next.index;previousDirection=next.direction;
    const mine=remaining.delete(current);walk.push({cell:cells[current],mine});
   }
  }
  if(remaining.size)throw Error('Route left active days unmined');
  return {walk,steps:walk.length,turns};
 }
 const old=expand(baseline,false),seeds=[baseline];
 // When every move already visits new ore, the step-count lower bound is met.
 if(baselineSteps>n-1){
  const second=targets.map((_,i)=>i).filter(i=>i!==origin).sort((a,b)=>distance[origin][a]-distance[origin][b]||a-b);
  const choices=new Set([...second.slice(0,4),...Array.from({length:8},(_,i)=>second[Math.floor(i*(second.length-1)/7)])]);
  for(const next of choices)if(next!==undefined)seeds.push(nearest(next));
  const rest=targets.map((_,i)=>i).filter(i=>i!==origin);
  seeds.push([origin,...rest.toReversed()]);
  for(const parity of [0,1])seeds.push([origin,...[...rest].sort((a,b)=>{
   const ca=active[a],cb=active[b];return cb.c-ca.c||((ca.c+parity)%2?cb.r-ca.r:ca.r-cb.r);
  })]);
  // Farthest-end insertion plans the span before filling shorter detours.
  const far=second.at(-1),insertion=far===undefined?[origin]:[origin,far],remaining=new Set(rest);remaining.delete(far);
  while(remaining.size){
   let best;
   for(const target of remaining)for(let at=1;at<=insertion.length;at++){
    const a=insertion[at-1],b=insertion[at],extra=distance[a][target]+(b===undefined?0:distance[target][b]-distance[a][b]);
    if(!best||extra<best.extra)best={target,at,extra};
   }
   insertion.splice(best.at,0,best.target);remaining.delete(best.target);
  }
  seeds.push(insertion);
 }
 const unique=new Map();
 for(const seed of seeds){const order=improve(seed);unique.set(order.join(','),order);}
 let best=expand(baseline);
 for(const order of unique.values()){
  const candidate=expand(order);
  if(candidate.steps<best.steps||(candidate.steps===best.steps&&candidate.turns<best.turns))best=candidate;
 }
 // Manhattan grids admit many equal-length tours. Explore those ties using
 // the rendered walk's real turn count, rather than accepting needless zigzags.
 const activeIndex=new Map(targets.map((cell,i)=>[cell,i]));
 let polished=[origin,...best.walk.filter(step=>step.mine).map(step=>activeIndex.get(byKey.get(key(step.cell))))];
 let checks=0;const budget=n<=100?8000:1200;
 for(let pass=0;pass<n*2&&checks<budget;pass++){
  let changed=false;
  for(let i=1;i<n-1&&!changed&&checks<budget;i++)for(let j=i+1;j<n&&checks<budget;j++){
   const after=polished[j+1];
   const saved=distance[polished[i-1]][polished[i]]+(after===undefined?0:distance[polished[j]][after])-
    distance[polished[i-1]][polished[j]]-(after===undefined?0:distance[polished[i]][after]);
   if(saved<0)continue;
   const candidateOrder=[...polished];candidateOrder.splice(i,j-i+1,...candidateOrder.slice(i,j+1).reverse());
   const candidate=expand(candidateOrder);checks++;
   if(candidate.steps<best.steps||(candidate.steps===best.steps&&candidate.turns<best.turns)){
    best=candidate;
    polished=[origin,...best.walk.filter(step=>step.mine).map(step=>activeIndex.get(byKey.get(key(step.cell))))];
    changed=true;break;
   }
  }
  const edge=(a,b)=>a===undefined||b===undefined?0:distance[a][b];
  for(let length=1;length<=3&&!changed&&checks<budget;length++)for(let i=1;i+length<=n&&!changed&&checks<budget;i++){
   const a=polished[i],b=polished[i+length-1],before=polished[i-1],after=polished[i+length];
   const removed=edge(before,a)+edge(b,after)-edge(before,after);
   for(let j=0;j<n&&checks<budget;j++){
    if(j>=i-1&&j<i+length)continue;
    const saved=removed-edge(polished[j],a)-edge(b,polished[j+1])+edge(polished[j],polished[j+1]);
    if(saved<0)continue;
    const candidateOrder=[...polished],block=candidateOrder.splice(i,length),at=j>i?j-length:j;
    candidateOrder.splice(at+1,0,...block);
    const candidate=expand(candidateOrder);checks++;
    if(candidate.steps<best.steps||(candidate.steps===best.steps&&candidate.turns<best.turns)){
     best=candidate;
     polished=[origin,...best.walk.filter(step=>step.mine).map(step=>activeIndex.get(byKey.get(key(step.cell))))];
     changed=true;break;
    }
   }
  }
  if(!changed)break;
 }
 return {initial:active[origin],walk:best.walk,metrics:{method:'multi-seed 2-opt and relocation',baselineSteps:old.steps,optimisedSteps:best.steps,baselineTurns:old.turns,optimisedTurns:best.turns,candidates:unique.size,smoothingChecks:checks}};
}

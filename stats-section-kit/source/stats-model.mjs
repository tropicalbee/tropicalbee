export const metrics=[
  ['issues','ISSUES RAISED','Public - all time'],
  ['pullRequests','PULL REQUESTS','Public - all time'],
  ['mergedPullRequests','PRS MERGED','Public - all time'],
  ['stars','STARS EARNED','Owned public repos'],
  ['repositories','REPOSITORIES','Public - non-fork'],
  ['contributions','CONTRIBUTIONS','Past 12 months'],
  ['longestStreak','LONGEST STREAK','Past 12 months'],
];
const integer=n=>Number.isSafeInteger(n)&&n>=0;
export function validateSnapshot(s){
  if(s.schemaVersion!==1||s.username!=='tropicalbee'||!s.metrics)throw Error('Invalid stats snapshot identity');
  if(s.fetchedAt===null){
    if(s.period!==null||s.languages!==null||metrics.some(([key])=>s.metrics[key]!==null))throw Error('Partial pending stats');
    return s;
  }
  if(typeof s.fetchedAt!=='string'||!Number.isFinite(Date.parse(s.fetchedAt)))throw Error('Invalid fetch time');
  if(metrics.some(([key])=>!integer(s.metrics[key])))throw Error('Invalid stats value');
  const start=Date.parse(s.period?.start),end=Date.parse(s.period?.end);
  const days=(end-start)/86400000+1;
  if(![365,366].includes(days))throw Error('Expected twelve months of contributions');
  if(s.metrics.longestStreak>days||s.metrics.longestStreak>s.metrics.contributions||s.metrics.mergedPullRequests>s.metrics.pullRequests)throw Error('Inconsistent stats');
  if(!Array.isArray(s.languages)||new Set(s.languages.map(l=>l.name)).size!==s.languages.length||
    s.languages.some(l=>typeof l.name!=='string'||!l.name.trim()||!integer(l.bytes)||l.bytes===0)||
    !integer(s.languages.reduce((sum,l)=>sum+l.bytes,0)))throw Error('Invalid language data');
  return s;
}
const colors=['#aa7547','#dab565','#5c6570','#708453','#b6baa7','#79654d'];
export function languageSlices(languages){
  if(languages===null)return null;
  const sorted=[...languages].sort((a,b)=>b.bytes-a.bytes||a.name.localeCompare(b.name));
  const groups=sorted.slice(0,5);
  if(sorted.length>5)groups.push({name:'Other',bytes:sorted.slice(5).reduce((sum,l)=>sum+l.bytes,0)});
  const total=groups.reduce((sum,l)=>sum+l.bytes,0);
  if(!total)return [];
  // Largest remainder rounding makes displayed percentages sum to 100.0.
  const units=groups.map(l=>l.bytes/total*1000);
  const rounded=units.map(Math.floor);
  const order=units.map((n,i)=>({i,remainder:n-rounded[i]})).sort((a,b)=>b.remainder-a.remainder||a.i-b.i);
  for(let i=0,n=1000-rounded.reduce((a,b)=>a+b,0);i<n;i++)rounded[order[i].i]++;
  return groups.map((l,i)=>({...l,fraction:l.bytes/total,percent:(rounded[i]/10).toFixed(1),color:colors[i]}));
}
export const formatNumber=n=>n===null?'--':n.toLocaleString('en-US');
export const xml=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');

import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {metrics,validateSnapshot,languageSlices} from '../stats-section-kit/source/stats-model.mjs';
import {crispText} from '../stats-section-kit/source/archive-scene.mjs';

for(const size of [2,3,4]){
 const lettering=crispText('LONGEST STREAK 12M',100.5,20.3,size);
 for(const match of lettering.matchAll(/(?:x|y|width|height)="([\d.-]+)"/g))assert(Number.isInteger(Number(match[1])),'Glyph edges must land on whole pixels');
 assert.match(lettering, /translate\(-?\d+ \d+\)/);
 assert(!lettering.includes('filter='),'Do not blur the lettering');
}
assert.throws(()=>crispText('LABEL',0,0,1.5));

const real=JSON.parse(await fs.readFile(new URL('../stats-section-kit/data/stats.json',import.meta.url),'utf8'));
validateSnapshot(real);
const pending={schemaVersion:1,username:'tropicalbee',fetchedAt:null,period:null,metrics:Object.fromEntries(metrics.map(([key])=>[key,null])),languages:null};
validateSnapshot(pending);
assert.throws(()=>validateSnapshot({...pending,metrics:{...pending.metrics,stars:0}}));
assert.equal(languageSlices(null),null);
assert.deepEqual(languageSlices([]),[]);
const single=languageSlices([{name:'Python',bytes:15}]);
assert.equal(single[0].fraction,1);
assert.equal(single[0].percent,'100.0');
for(const values of [[1,1,1],[100,7,1,1,1,1,1,1],[9999999,1]]){
 const slices=languageSlices(values.map((bytes,i)=>({name:`Language ${i}`,bytes})));
 assert.equal(slices.reduce((n,l)=>n+Math.round(Number(l.percent)*10),0),1000);
 assert.equal(slices.reduce((n,l)=>n+l.bytes,0),values.reduce((a,b)=>a+b,0));
 assert(slices.length<=6);
 if(values.length>5)assert.equal(slices.at(-1).name,'Other');
}
if(real.fetchedAt){
 assert.throws(()=>validateSnapshot({...real,metrics:{...real.metrics,longestStreak:400}}));
 assert.throws(()=>validateSnapshot({...real,languages:[{name:'Python',bytes:-1}]}));
 assert.throws(()=>validateSnapshot({...real,metrics:{...real.metrics,mergedPullRequests:real.metrics.pullRequests+1}}));
}
console.log('PASS: saved/pending stats, zero data, one-slice pie, grouping, exact rounded percentages and invalid snapshots.');
if(process.argv.includes('--assets')){
 const svg=await fs.readFile(new URL('../stats-section-kit/assets/haunted-archive.svg',import.meta.url),'utf8');
 const summary=await fs.readFile(new URL('../stats-section-kit/assets/stats-summary.md',import.meta.url),'utf8');
 for(const [key,label]of metrics){
  const value=real.metrics[key]===null?'--':real.metrics[key].toLocaleString('en-US');
  assert(svg.includes(`${label}: ${value}`),`SVG snapshot mismatch for ${label}`);
  assert(summary.includes(`**${label}:** ${value}`),`Text summary mismatch for ${label}`);
 }
 for(const slice of languageSlices(real.languages)??[])assert(summary.includes(`${slice.name}: ${slice.percent}%`));
 console.log('PASS: rendered SVG and accessible text summary match the saved snapshot.');
}

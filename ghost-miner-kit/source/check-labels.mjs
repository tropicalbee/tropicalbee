import assert from 'node:assert/strict';
import {layoutMonthLabels} from './month-labels.mjs';
const starts=['2025-10-19','2025-01-26','2025-11-30','2025-02-23','2024-12-29','2026-08-30'];
const names=new Set(['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']);
for(const start of starts){
 const labels=layoutMonthLabels(Date.parse(start+'T00:00:00Z'),53,205,16);
 for(const label of labels){
  assert(names.has(label.text),`Only a month abbreviation is visible: ${label.text}`);
  assert.equal(label.left,205+label.startWeek*16,'Caption must start at its month column');
 }
 for(let i=1;i<labels.length;i++)assert(labels[i].left-labels[i-1].right>=13.99,`Caption collision: ${start}`);
 assert(labels[0].left>=205);
 assert(labels.at(-1).right<=205+53*16);
}
const current=layoutMonthLabels(Date.parse('2025-10-19T00:00:00Z'),53,205,16);
// The initial October fragment spans just two columns. Omit it rather than
// cramming October and November into what reads as one caption.
assert.equal(current[0].text,'Nov');assert.equal(current[0].startWeek,2);assert.equal(current.at(-1).text,'Oct');
assert.equal(new Date(Date.parse('2025-10-19T00:00:00Z')+current[0].startWeek*7*86400000).toISOString().slice(0,10),'2025-11-02');
assert(current[1].left-current[0].right>=14);
const shortBoundary=layoutMonthLabels(Date.parse('2025-11-30T00:00:00Z'),53,205,16);
assert.equal(shortBoundary[0].text,'Dec');assert.equal(shortBoundary[0].startWeek,1);
console.log(JSON.stringify({calendarLayouts:starts.length,minimumCaptionGap:14,first:current[0].text,next:current[1].text,last:current.at(-1).text,status:'passed'}));

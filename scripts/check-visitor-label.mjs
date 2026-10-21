import assert from 'node:assert/strict';
import {visitorLabel} from '../trespass-section-kit/source/visitor-label.mjs';
import {textWidth} from '../garage-section-kit/source/pixel-font.mjs';

const snapshot={username:'tropicalbee',count:1234,fetchedAt:'2026-10-21T00:00:00+00:00'};
assert.equal(visitorLabel(snapshot),'RECORDED 001234');
assert.equal(visitorLabel({...snapshot,count:0}),'RECORDED 000000');
assert.equal(visitorLabel({...snapshot,count:null,fetchedAt:null}),'AWAITING FIRST COUNT');
for(const count of [-1,1.1,'1234',null,Number.MAX_SAFE_INTEGER+1]) {
  assert.throws(()=>visitorLabel({...snapshot,count}));
}
assert.throws(()=>visitorLabel({...snapshot,username:'someone-else'}));
assert.throws(()=>visitorLabel({...snapshot,fetchedAt:'invalid'}));
for(const count of [0,1234567,Number.MAX_SAFE_INTEGER]) {
  const label=visitorLabel({...snapshot,count});
  const size=Math.min(2.5,320/textWidth(label,1));
  assert(textWidth(label,size)<=320.001,'Count must fit within the wooden sign');
}
console.log('PASS: initial, zero, saved and large counts fit; invalid snapshots rejected.');

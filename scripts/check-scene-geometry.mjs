import assert from 'node:assert/strict';
import {spiderAt,crawlingSpider} from '../tech-stack-kit/source/spider-sprite.mjs';
import {spoonState,spoon} from '../garage-section-kit/source/cauldron.mjs';

const positions=[];
for(let frame=0;frame<=800;frame++){
 const time=frame/100,p=spiderAt(time),s=spoonState(time);
 positions.push(p);
 if(p.thread)assert.equal(p.x,178,'Silk must hang from the fixed shelf anchor');
 else {
  assert.equal(p.y,535,'Crawling spider must stay on the wooden shelf');
  assert(p.x>=178&&p.x<=224,'Spider wandered off its supported surface');
 }
 assert(p.y>=535&&p.y<=635,'Spider crossed a shelf/sign boundary');
 assert(s.x>=324&&s.x<=352&&s.y>=205&&s.y<=207,'Spoon pivot left the potion surface');
 const tipY=s.y+17*Math.cos(s.angle*Math.PI/180);
 assert(tipY>210,'Spoon bowl must remain below the front lip');
 assert(spoon(time).includes('clip-path="url(#spoon-immersion)"'),'Missing front-rim occlusion');
}
assert.deepEqual(spiderAt(0),spiderAt(8),'Spider loop must close');
assert(Math.max(...positions.map(p=>p.x))-Math.min(...positions.map(p=>p.x))>=40,'No visible crawl');
assert(Math.max(...positions.map(p=>p.y))-Math.min(...positions.map(p=>p.y))>=90,'No visible drop');
assert.notEqual(crawlingSpider(0),crawlingSpider(.125),'Legs must articulate');
console.log('PASS: 801 motion samples keep the spider on its shelf/silk and the spoon immersed behind the cauldron rim; crawl, drop, legs and loop verified.');

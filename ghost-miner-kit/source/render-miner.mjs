import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pixelText,textWidth} from './pixel-font.mjs';
import {ghostShape,ghostEyes} from './ghost-sprite.mjs';
import {buildPlan,stateAt} from './route.mjs';
import {layoutMonthLabels} from './month-labels.mjs';

import {loadSharp,encodeGifFrames} from '../../scripts/profile-render-utils.mjs';
const sharp=loadSharp(import.meta.url);
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),out=path.join(root,'assets');
await fs.mkdir(out,{recursive:true});
const config=JSON.parse(await fs.readFile(path.join(root,'miner-config.json'),'utf8'));
const calendar=JSON.parse(await fs.readFile(path.join(root,'data/calendar.json'),'utf8'));
if(config.username!==calendar.username)throw Error('Fetch the calendar after changing username.');
const W=1280,H=480,FPS=Number(config.framesPerSecond),T=Number(config.durationSeconds);
if(![10,12.5,20].includes(FPS)||T<12||T>60||!Number.isInteger(T*FPS))throw Error('Use 10, 12.5 or 20 FPS and a 12–60 second duration with a whole number of frames.');
const N=T*FPS,plan=buildPlan(calendar,T);
await fs.writeFile(path.join(root,'data/mining-route.json'),JSON.stringify({duration:T,optimisation:plan.optimisation,events:plan.events,segments:plan.segments},null,2)+'\n');
const r=(x,y,w,h,c)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
const poly=(points,c)=>`<polygon points="${points}" fill="${c}"/>`;
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const leftText=(s,x,y,size,c='#cdd0c6',shadow=false)=>pixelText(s,x+textWidth(s,size)/2,y,size,c,shadow);
const X=205,Y=218,P=16,R=18,S=3;
const point=(c,row)=>({x:X+c*P+row*S,y:Y+row*R});
const colors=[
 {top:'#5c6570',left:'#343c46',right:'#444d58',ore:'#56606b'},
 {top:'#aa7547',left:'#704a30',right:'#8e6038',ore:'#dfaa67'},
 {top:'#c08c45',left:'#8b612d',right:'#a97a36',ore:'#e7b66d'},
 {top:'#dab565',left:'#9a773c',right:'#bb974d',ore:'#f0d08b'},
 {top:'#e7d09b',left:'#aa8b51',right:'#ccb278',ore:'#fff0c2'}
];
function block(level,seed,foundation=false){
 const h=foundation?2:(level?7+Math.min(level,3):7),c=colors[level];
 let s=`<g transform="translate(0 ${-h})">`+
 poly('0,0 7,4 7,'+(4+h)+' 0,'+h,c.left)+
 poly('7,4 14,0 14,'+h+' 7,'+(4+h),c.right)+
 poly('0,0 7,-4 14,0 7,4',c.top);
 s+=`<path d="M0 0L7 -4L14 0M7 4V${4+h}" fill="none" stroke="${level?'#ead3a4':'#85909a'}" stroke-width="1" opacity=".8"/>`;
 if(level){
  s+=r(3,-1,3,2,c.ore)+r(9,-1,2,2,c.ore)+r(9,4,3,2,c.ore);
  if(level>1)s+=r(2,3,3,2,c.ore);
  if(level>2)s+=r(10,2,2,2,'#fff0c2');
 }else if(seed%3===0)s+=r(9,2,2,1,'#303843');
 return s+'</g>';
}
const order=[...plan.cells].sort((a,b)=>a.r-b.r||a.c-b.c);
const bg=await sharp(path.join(root,'source/vanilla-original.png')).resize(W,H,{kernel:'nearest'}).png().toBuffer();
await fs.writeFile(path.join(root,'source/vanilla-background.png'),bg);
const bgURI='data:image/png;base64,'+bg.toString('base64');
const monthLabels=layoutMonthLabels(plan.start,plan.weeks,X,P);
const labels='<g font-family="Arial, Helvetica, sans-serif" font-size="16" fill="#c8ccc7">'+monthLabels.map(m=>`<text x="${m.left}" y="183" textLength="${m.width}" lengthAdjust="spacingAndGlyphs">${m.text}</text>`).join('')+
 [[1,'Mon'],[3,'Wed'],[5,'Fri']].map(([row,name])=>`<text x="${X+row*S-12}" y="${Y+row*R+3}" text-anchor="end">${name}</text>`).join('')+'</g>';
await fs.writeFile(path.join(root,'data/month-labels.json'),JSON.stringify(monthLabels,null,2)+'\n');
let baseCells='';
for(const cell of order){const p=point(cell.c,cell.r);baseCells+=`<g class="day" data-date="${cell.date}" data-level="${cell.level}" data-count="${cell.count}" transform="translate(${p.x} ${p.y})"><title>${cell.count} contributions on ${cell.date}</title>${block(0,cell.c+cell.r,cell.level>0)}</g>`;}
let legend=leftText('Less',913,365,1.2,'#aeb6b2');
for(let i=0;i<5;i++)legend+=`<g transform="translate(${946+i*18} 373)">${block(i,i)}</g>`;
legend+=leftText('More',1040,365,1.2,'#aeb6b2');
const fixed=`<image width="${W}" height="${H}" href="${bgURI}"/>`+
 pixelText(config.heading,640,63,3.8,'#cdd0c6',true)+pixelText('CONTRIBUTIONS',640,109,1.8,'#aeb6b2',true)+
 labels+`<g shape-rendering="crispEdges">${baseCells}</g>`+legend;
const raw=await sharp(bg).removeAlpha().raw().toBuffer();
const lights=[{id:'lantern',box:[156,365,38,32],phase:.2},{id:'torch',box:[1237,315,21,30],phase:1.8}];
for(const l of lights){
 let mask='',count=0;const[x,y,w,h]=l.box;
 for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++){
  const k=(yy*W+xx)*3;
  if(raw[k]>225&&raw[k+1]>165&&raw[k+2]<170){mask+=r(xx,yy,1,1,'#fff');count++;}
 }
 if(count<10)throw Error('Check '+l.id+' flame coordinates.');
 l.mask=mask;console.log(l.id+': '+count+' light core pixels');
}
const lightValue=(t,phase)=>.24+.13*Math.sin(Math.PI*t+phase)+.045*Math.sin(Math.PI*4*t+phase);
function motion(t){
 const state=stateAt(plan,t);let s='<defs>'+lights.map((l,i)=>`<clipPath id="light${i}">${l.mask}</clipPath>`).join('')+'</defs>';
 for(const cell of order){
  if(!cell.level)continue;
  const mined=plan.minedAt.get(cell.date)<=t,opacity=mined?state.resetProgress:1;
  if(opacity<=0)continue;
  const p=point(cell.c,cell.r);
  s+=`<g transform="translate(${p.x} ${p.y})" opacity="${opacity.toFixed(3)}" shape-rendering="crispEdges">${block(cell.level,cell.c+cell.r)}</g>`;
 }
 const p=point(state.c,state.r),gx=p.x-6,gy=p.y-18-1.5*Math.sin(Math.PI*t*2);
 const angle=-38+108*state.hit;
 s+=`<g transform="translate(${gx.toFixed(2)} ${gy.toFixed(2)})" opacity="${state.opacity.toFixed(3)}" shape-rendering="crispEdges"><g transform="scale(.74)">${ghostShape}${ghostEyes(t%8,false)}<g transform="translate(10 6) rotate(${angle.toFixed(2)})"><path d="M0 0L10 11" stroke="#8b6339" stroke-width="3"/><path d="M5 -2H15V1H9V4H6Z" fill="#a9b6b0"/><path d="M6 -3H15V-1H6Z" fill="#d3d9c6"/></g></g></g>`;
 if(state.hit>.65&&state.segment){
  const target=point(state.segment.to.c,state.segment.to.r),spread=4+(state.hit-.65)*15;
  s+=r(target.x+7-spread,target.y-8,2,2,'#d3a35b')+r(target.x+11+spread,target.y-12,2,2,'#b87d38')+r(target.x+4,target.y-16,2,2,'#e0bd7c');
 }
 const shown=state.resetProgress>.5?0:state.mined;
 s+=pixelText('MINED '+shown+' OF '+plan.active.length+' ACTIVE DAYS',640,408,1.4,'#cdd0c6',true);
 lights.forEach((l,i)=>{const [x,y,w,h]=l.box;s+=`<g clip-path="url(#light${i})"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#3a2817" opacity="${lightValue(t,l.phase).toFixed(3)}"/></g>`;});
 return s;
}
function svg(t,layer='full'){
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="title desc"><title id="title">Ghost miner - ${escape(calendar.username)} daily contributions</title><desc id="desc">${calendar.days.length} real daily cells from ${calendar.start_date} through ${calendar.end_date}. ${plan.active.length} active days become ore blocks. A computed four-neighbour route visits and mines every active day once per animation loop. This SVG is a still frame; the GIF is animated.</desc>${layer!=='motion'?fixed:''}${layer!=='static'?motion(t):''}</svg>`;
}
await fs.writeFile(path.join(out,'ghost-miner-preview.svg'),svg(1.2));
await sharp(Buffer.from(svg(1.2))).png().toFile(path.join(out,'ghost-miner-preview.png'));
console.log(JSON.stringify({days:plan.cells.length,active:plan.active.length,routeSteps:plan.segments.filter(s=>s.kind==='move').length,seconds:T}));
if(process.argv.includes('--preview'))process.exit(0);
const base=await sharp(Buffer.from(svg(0,'static'))).png().toBuffer();
const build=path.join(root,'build',String(Date.now()));await fs.mkdir(build,{recursive:true});
for(let i=0;i<N;i++){
 await sharp(base).composite([{input:Buffer.from(svg(i/FPS,'motion'))}]).png().toFile(path.join(build,`frame-${String(i).padStart(4,'0')}.png`));
 if(i%40===0)console.log(`Rendered ${i+1}/${N} miner frames`);
}
await encodeGifFrames(sharp,{directory:build,output:path.join(out,'ghost-miner.gif'),width:W,height:H,frames:N,fps:FPS});
const m=await sharp(path.join(out,'ghost-miner.gif'),{animated:true}).metadata();
if(m.pages!==N||m.loop!==0||m.delay.reduce((a,b)=>a+b,0)!==T*1000)throw Error('Invalid GIF timing');
console.log(JSON.stringify({width:W,height:H,frames:m.pages,seconds:T,bytes:(await fs.stat(path.join(out,'ghost-miner.gif'))).size}));

import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pixelText,textWidth} from './pixel-font.mjs';
import {loadSharp,encodeGifFrames} from '../../scripts/profile-render-utils.mjs';
import {ghostShape,ghostEyes,eyeOpen} from '../../resident-section-kit/source/ghost-sprite.mjs';
import {atmosphere,atmosphereCSS} from '../../scripts/profile-motion.mjs';
import {spoon,spoonCSS} from './cauldron.mjs';
const sharp=loadSharp(import.meta.url);
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),out=path.join(root,'assets');
await fs.mkdir(out,{recursive:true});
const cfg=JSON.parse(await fs.readFile(path.join(root,'garage-config.json'),'utf8'));
if(!Array.isArray(cfg.lines)||cfg.lines.length!==2||cfg.lines.some(s=>typeof s!=='string'||!s.trim()))throw Error('Supply two non-empty text lines.');
if(!/^#[0-9a-f]{6}$/i.test(cfg.textColor))throw Error('Use a six-digit text color.');
const W=1024,H=384,T=8,FPS=Number(cfg.framesPerSecond??12.5),N=T*FPS,TAU=Math.PI*2;
if(![10,12.5,20].includes(FPS))throw Error('Use 10, 12.5 or 20 FPS.');
const bg=await sharp(path.join(root,'source/vanilla-actor-original.png')).resize(W,H,{kernel:'nearest'}).png().toBuffer();
await fs.writeFile(path.join(root,'source/vanilla-background.png'),bg);
const rgb=await sharp(bg).removeAlpha().raw().toBuffer();
const bgURI='data:image/png;base64,'+bg.toString('base64');
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const r=(x,y,w,h,c)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
const titleSize=Math.min(4,322/textWidth(cfg.lines[0],1));
const statusSize=Math.min(2.4,322/textWidth(cfg.lines[1],1));
if(titleSize<2.5||statusSize<1.5)throw Error('Shorten the heading or status to keep the sign readable.');
const lettering=pixelText(cfg.lines[0],638,115,titleSize,cfg.textColor,true)+pixelText(cfg.lines[1],638,162,statusSize,cfg.textColor,true);
const fixed=`<image width="${W}" height="${H}" href="${bgURI}"/>`+lettering;
function pixelClip(box,select){
 const[x,y,w,h]=box;let runs='',count=0;
 for(let yy=y;yy<y+h;yy++){let start=-1;for(let xx=x;xx<=x+w;xx++){
  const k=(yy*W+xx)*3,yes=xx<x+w&&select(rgb[k],rgb[k+1],rgb[k+2]);
  if(yes&&start<0)start=xx;
  if(!yes&&start>=0){runs+=`<rect x="${start}" y="${yy}" width="${xx-start}" height="1"/>`;count+=xx-start;start=-1;}
 }}
 return {runs,count};
}
const lights=[
 {id:'fire',box:[280,287,102,25],phase:.3,strength:.67,enabled:cfg.animateFire},
 {id:'pumpkin',box:[796,267,58,55],phase:1.9,strength:.7,enabled:cfg.animatePumpkin}
];
for(const light of lights){
 const core=pixelClip(light.box,(r,g,b)=>r>225&&g>185&&b<175);
 if(core.count<10)throw Error('Check light coordinates: '+light.id+' ('+core.count+' core pixels).');
 light.clip=core.runs;console.log(light.id+': '+core.count+' light-core pixels');
}
const liquid=pixelClip([279,201,121,14],(r,g,b)=>g>55&&g>r*1.14&&g>b*1.35);
if(liquid.count<20)throw Error('Check potion surface coordinates.');
console.log('potion surface: '+liquid.count+' pixels');
const particles=[{x:294,unit:3,phase:.04},{x:310,unit:2,phase:.20},{x:326,unit:4,phase:.36},{x:346,unit:3,phase:.52},{x:365,unit:2,phase:.68},{x:382,unit:3,phase:.84}];
function bubbleState(t,b){
 const phase=(t/4+b.phase)%1;
 const opacity=phase<.68?1:Math.max(0,1-(phase-.68)/.14);
 return {x:b.x+Math.round(3*Math.sin(TAU*phase)),y:208-Math.round(phase*84),scale:phase>.66?1+(phase-.66)*3:1,opacity};
}
function bubbleSprite(unit){
 let s='';
 for(let y=0;y<5;y++)for(let x=0;x<5;x++)if((y===0||y===4)?x>0&&x<4:(x===0||x===4))s+=r((x-2.5)*unit,(y-2.5)*unit,unit,unit,'#6f8d4d');
 s+=r(-unit*.5,-unit*2.5,unit*2,unit,'#b0bf76');
 s+=`<rect x="${-unit*1.5}" y="${-unit*1.5}" width="${unit*3}" height="${unit*3}" fill="#45632f" opacity=".28"/>`;
 return s;
}
const flicker=(t,p)=>Math.max(.1,Math.min(.98,.6+.29*Math.sin(TAU*t/2+p)+.08*Math.sin(TAU*t/.5+p)));
function keyframes(name,fn,duration=T,n=128){return '@keyframes '+name+'{'+Array.from({length:n+1},(_,i)=>`${(i*100/n).toFixed(3)}%{${fn(i*duration/n)}}`).join('')+'}';}
let css='';
particles.forEach((b,i)=>{css+=keyframes('bubble'+i,t=>{const s=bubbleState(t,b);return `transform:translate(${s.x}px,${s.y}px) scale(${s.scale.toFixed(3)});opacity:${s.opacity.toFixed(3)}`;})+`.bubble${i}{animation:bubble${i} 8s linear infinite}`;});
lights.forEach((l,i)=>{css+=keyframes('light'+i,t=>`opacity:${(l.strength*(1-flicker(t,l.phase))).toFixed(3)}`,2,32)+`.light${i}{animation:light${i} 2s linear infinite}`;});
css+=keyframes('brewerFloat',t=>`transform:translate(${(200+5*Math.sin(TAU*t/8)).toFixed(2)}px,${(275+8*Math.sin(TAU*t/4)).toFixed(2)}px) scale(2.4)`)+'.brewerGhost{animation:brewerFloat 8s linear infinite}';
css+=keyframes('ghostBlink',t=>`transform:scaleY(${eyeOpen(t).toFixed(3)})`)+'.ghost-eyes{animation:ghostBlink 8s linear infinite}';
css+=atmosphereCSS('garage');
css+=spoonCSS;
css+='@keyframes ripple{to{transform:translateX(92px)}}.ripple{animation:ripple 2s linear infinite}@media(prefers-reduced-motion:reduce){g,rect,path{animation:none!important}}';
function motion(t,animated=false){
 let s='<defs>'+lights.map((l,i)=>`<clipPath id="core${i}">${l.clip}</clipPath>`).join('')+`<clipPath id="liquid">${liquid.runs}</clipPath></defs>`;
 s+=lights.filter(l=>l.enabled).map(l=>{const i=lights.indexOf(l),[x,y,w,h]=l.box;return `<g clip-path="url(#core${i})"><rect class="${animated?'light'+i:''}" x="${x}" y="${y}" width="${w}" height="${h}" fill="#392713" opacity="${(l.strength*(1-flicker(t,l.phase))).toFixed(3)}"/></g>`;}).join('');
 const bt=cfg.animateBubbles?t:0;
 s+=`<g clip-path="url(#liquid)"><g class="${animated&&cfg.animateBubbles?'ripple':''}" transform="translate(${(bt%2)/2*92} 0)"><rect x="284" y="208" width="13" height="2" fill="#9ca965" opacity=".58"/></g></g>`;
 particles.forEach((b,i)=>{const p=bubbleState(bt,b);s+=`<g class="${animated&&cfg.animateBubbles?'bubble'+i:''}" transform="translate(${p.x} ${p.y}) scale(${p.scale.toFixed(3)})" opacity="${p.opacity.toFixed(3)}" shape-rendering="crispEdges">${bubbleSprite(b.unit)}</g>`;});
 const gt=cfg.animateGhost===false?0:t;
 s+=`<g class="${animated&&cfg.animateGhost!==false?'brewerGhost':''}" transform="translate(${(200+5*Math.sin(TAU*gt/8)).toFixed(2)} ${(275+8*Math.sin(TAU*gt/4)).toFixed(2)}) scale(2.4)" shape-rendering="crispEdges">${ghostShape}${ghostEyes(gt,animated&&cfg.animateGhost!==false)}</g>`;
 return s+spoon(cfg.animateAtmosphere===false?0:t,animated&&cfg.animateAtmosphere!==false)+atmosphere('garage',cfg.animateAtmosphere===false?0:t,animated&&cfg.animateAtmosphere!==false);
}
const fullText=cfg.lines.join(' ');
function svg(t,animated=false,layer='full'){
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="title desc"><title id="title">${escape(fullText)}</title><desc id="desc">The pale pixel ghost from the Resident stands beside a square iron cauldron that brews green potion over a small fire in a haunted Minecraft garage. Pixel bubbles rise and pop. Three potion bottles, a brewing stand, cobweb, pumpkin and dark doorway surround the still sign. The brewer floats and blinks, a spoon stirs, steam curls upward, bubbles rise and pop, and embers lift from the fire. The sign and architecture stay still.</desc>${animated?`<style>${css}</style>`:''}${layer!=='motion'?fixed:''}${layer!=='static'?motion(t,animated):''}</svg>`;
}
await fs.writeFile(path.join(out,'garage-brewing.svg'),svg(0,true));
await fs.writeFile(path.join(out,'garage-brewing-static.svg'),svg(0));
await sharp(Buffer.from(svg(0))).png().toFile(path.join(out,'garage-brewing-preview.png'));
if(process.argv.includes('--preview'))process.exit(0);
const base=await sharp(Buffer.from(svg(0,false,'static'))).png().toBuffer();
const build=path.join(root,'build',String(Date.now()));await fs.mkdir(build,{recursive:true});
for(let i=0;i<N;i++){
 await sharp(base).composite([{input:Buffer.from(svg(i/FPS,false,'motion'))}]).png().toFile(path.join(build,`frame-${String(i).padStart(4,'0')}.png`));
 if(i%25===0)console.log(`Rendered ${i+1}/${N} brewing frames`);
}
await encodeGifFrames(sharp,{directory:build,output:path.join(out,'garage-brewing.gif'),width:W,height:H,frames:N,fps:FPS});
const m=await sharp(path.join(out,'garage-brewing.gif'),{animated:true}).metadata();
if(m.pages!==N||m.loop!==0||m.delay.reduce((a,b)=>a+b,0)!==8000)throw Error('Invalid brewing animation timing.');
console.log(JSON.stringify({width:W,height:H,frames:m.pages,seconds:T,bytes:(await fs.stat(path.join(out,'garage-brewing.gif'))).size}));

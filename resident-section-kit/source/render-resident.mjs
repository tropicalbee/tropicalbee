import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {pixelText,textWidth} from './pixel-font.mjs';
import {ghostShape,ghostEyes,eyeOpen} from './ghost-sprite.mjs';
import {spiderShape} from './spider-sprite.mjs';
const require=createRequire(import.meta.url);
const sharp=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/sharp':'sharp');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'assets');
await fs.mkdir(out,{recursive:true});
const cfg=JSON.parse(await fs.readFile(path.join(root,'resident-config.json'),'utf8'));
if(!Array.isArray(cfg.bioLines)||cfg.bioLines.length!==2||cfg.bioLines.some(s=>typeof s!=='string'||s.length>54))throw Error('Supply exactly two bio lines of 54 characters or fewer.');
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const bg=await fs.readFile(path.join(root,cfg.roomAsset));
const W=1024,H=236,PW=352,N=128,T=8,TAU=Math.PI*2;
const meta=await sharp(bg).metadata();
if(meta.width!==W||meta.height!==H)throw Error('Update eye and light coordinates for a different room background.');
const rawBG=await sharp(bg).removeAlpha().raw().toBuffer();
// Native bitmap lettering; auto-fit longer user bios inside the text area.
const bioSize=Math.min(1.5,420/Math.max(...cfg.bioLines.map(line=>textWidth(line,1))));
const staticLayer=pixelText(cfg.title||'THE RESIDENT',575,49,3,'#c9c3ac')+
 cfg.bioLines.map((line,i)=>pixelText(line,373+textWidth(line,bioSize)/2,115+i*29,bioSize,'#d5d0bc')).join('');
const decorations=`<g transform="translate(80 99) scale(.6)" shape-rendering="crispEdges"><path d="M0 -74V-12" stroke="#96938d" stroke-width="1.5"/>${spiderShape}</g>`;
const lightSources=[
 {id:'left-flame',box:[299,134,13,20],phase:.3,strength:.42},
 {id:'right-flame',box:[952,140,13,18],phase:1.7,strength:.42},
 {id:'left-pumpkin',box:[253,165,32,34],phase:.8,strength:.75},
 {id:'right-pumpkin',box:[884,155,54,51],phase:2.1,strength:.75}
];
// Flame rectangles end above the wax. Only pale yellow light-core pixels
// within the bounds enter the animated clip; wood, wax and skins stay fixed.
for(const light of lightSources){
 const[x,y,w,h]=light.box;let runs='',count=0;
 const lit=(xx,yy)=>{const i=(yy*W+xx)*3;return rawBG[i]>220&&rawBG[i+1]>185&&rawBG[i+2]<180;};
 for(let yy=y;yy<y+h;yy++){let start=-1;for(let xx=x;xx<=x+w;xx++){const yes=xx<x+w&&lit(xx,yy);if(yes&&start<0)start=xx;if(!yes&&start>=0){runs+=`<rect x="${start}" y="${yy}" width="${xx-start}" height="1"/>`;count+=xx-start;start=-1;}}}
 if(!count)throw Error('No bright flame/face pixels found in '+light.id);light.clip=runs;console.log(light.id+': '+count+' light-core pixels');
}
const flicker=(t,p)=>Math.max(.1,Math.min(1,.56+.34*Math.sin(TAU*t/2+p)+.07*Math.sin(TAU*t/.5+p*2)));
function keyframes(name,fn,duration=8,n=128){return '@keyframes '+name+'{'+Array.from({length:n+1},(_,i)=>`${(i*100/n).toFixed(3)}%{${fn(duration*i/n)}}`).join('')+'}';}
let css=keyframes('ghostBlink',t=>`transform:scaleY(${eyeOpen(t).toFixed(3)})`)+'.ghost-eyes{animation:ghostBlink 8s linear infinite}';
lightSources.forEach((l,i)=>{css+=keyframes('shade'+i,t=>`opacity:${(l.strength*(1-flicker(t,l.phase))).toFixed(3)}`,2,32)+`.shade${i}{animation:shade${i} 2s linear infinite}`;});
css+='@media(prefers-reduced-motion:reduce){g,rect,path{animation:none!important}}';
function motion(t,animated){
 const defs='<defs>'+lightSources.map((l,i)=>`<clipPath id="core${i}">${l.clip}</clipPath>`).join('')+'<clipPath id="laptop-front"><path d="M185 145H252L244 195H247V204H153V194H173Z"/></clipPath></defs>';
 const lights=cfg.animateLights?lightSources.map((l,i)=>{const[x,y,w,h]=l.box;return `<g clip-path="url(#core${i})"><rect class="${animated?'shade'+i:''}" x="${x}" y="${y}" width="${w}" height="${h}" fill="#332615" opacity="${(l.strength*(1-flicker(t,l.phase))).toFixed(3)}"/></g>`;}).join(''):'';
 const actor=`<g transform="translate(185 151) scale(2)">${ghostShape}${ghostEyes(cfg.animateEyes?t:0,animated&&cfg.animateEyes)}</g>`;
 // Restore the actual laptop pixels over the actor, keeping its lid in front.
 const foreground='<g clip-path="url(#laptop-front)"><use href="#room"/></g>';
 return defs+`<g shape-rendering="crispEdges">${lights}${actor}${foreground}</g>`;
}
function svg(t,animated=false,portrait=false,layer='full'){
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${portrait?PW:W}" height="${H}" viewBox="0 0 ${portrait?PW:W} ${H}" role="img" aria-labelledby="title desc"><title id="title">${escape(cfg.title||'The Resident')}</title><desc id="desc">The exact stepped ghost from the entrance banner uses a laptop in a dark haunted garage with a black cat, cracked stone, cobwebs, spider and pumpkins. The outer back of the laptop lid faces the viewer. The ghost blinks; candle flames and carved pumpkin light flicker while the wax and orange skins stay still. ${escape(cfg.bioLines.join(' '))}</desc>${animated?`<style>${css}</style>`:''}<defs><image id="room" width="${W}" height="${H}" href="data:image/png;base64,${bg.toString('base64')}"/></defs>${layer==='full'?'<use href="#room"/>':''}${layer!=='motion'?decorations+(portrait?'':staticLayer):''}${layer!=='static'?motion(t,animated):''}</svg>`;
}
await fs.writeFile(path.join(out,'resident-section.svg'),svg(0,true));
await fs.writeFile(path.join(out,'resident-portrait.svg'),svg(0,true,true));
await sharp(Buffer.from(svg(0))).png().toFile(path.join(out,'resident-preview.png'));
const textOverlay=await sharp(Buffer.from(svg(0,false,false,'static'))).png().toBuffer();
const base=await sharp(rawBG,{raw:{width:W,height:H,channels:3}}).composite([{input:textOverlay}]).removeAlpha().raw().toBuffer();
const portraitStatic=await sharp(Buffer.from(svg(0,false,true,'static'))).png().toBuffer();
const portraitBase=await sharp(bg).extract({left:0,top:0,width:PW,height:H}).composite([{input:portraitStatic}]).removeAlpha().raw().toBuffer();
const frames=[],portraitFrames=[];
for(let i=0;i<N;i++){
 const t=i*T/N;
 const layer=await sharp(Buffer.from(svg(t,false,false,'motion'))).png().toBuffer();
 frames.push(await sharp(base,{raw:{width:W,height:H,channels:3}}).composite([{input:layer}]).removeAlpha().raw().toBuffer());
 const portraitLayer=await sharp(Buffer.from(svg(t,false,true,'motion'))).png().toBuffer();
 portraitFrames.push(await sharp(portraitBase,{raw:{width:PW,height:H,channels:3}}).composite([{input:portraitLayer}]).removeAlpha().raw().toBuffer());
 if(i%32===0)console.log(`Rendered ${i+1}/${N} Resident frames`);
}
const delays=Array.from({length:N},(_,i)=>i%4===3?70:60);
for(const[name,raw,width] of [['resident-preview.gif',frames,W],['resident-portrait.gif',portraitFrames,PW]]){
 await sharp(Buffer.concat(raw),{raw:{width,height:H*N,channels:3,pageHeight:H},limitInputPixels:false}).gif({loop:0,delay:delays,colours:256,dither:0,effort:4,interFrameMaxError:0,interPaletteMaxError:256,keepDuplicateFrames:true}).toFile(path.join(out,name));
 const gif=await sharp(path.join(out,name),{animated:true}).metadata();
 if(gif.pages!==N||gif.loop!==0||gif.delay.reduce((a,b)=>a+b,0)!==8000)throw Error('Invalid Resident loop');
 console.log(JSON.stringify({file:name,width,height:H,frames:gif.pages,bytes:(await fs.stat(path.join(out,name))).size}));
}

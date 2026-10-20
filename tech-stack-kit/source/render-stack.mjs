import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {pixelText,textWidth} from './pixel-font.mjs';
import {ghostShape,ghostEyes,eyeOpen} from './ghost-sprite.mjs';
import {spiderShape} from './spider-sprite.mjs';
const require=createRequire(import.meta.url);
const sharp=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/sharp':'sharp');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),out=path.join(root,'assets');
await fs.mkdir(out,{recursive:true});
const cfg=JSON.parse(await fs.readFile(path.join(root,'stack-config.json'),'utf8'));
const W=1280,H=1920,T=8,FPS=Number(cfg.framesPerSecond??12.5),N=T*FPS,TAU=Math.PI*2;
if(![10,12.5,20].includes(FPS))throw Error('Use 10, 12.5 or 20 FPS for exact GIF timing.');
if(cfg.rows?.length!==5)throw Error('Use five category signs.');
const bg=await sharp(path.join(root,'source/outdoor-original.png')).resize(W,H,{kernel:'nearest'}).png().toBuffer();
await fs.writeFile(path.join(root,'source/outdoor-background.png'),bg);
const rgb=await sharp(bg).removeAlpha().raw().toBuffer();
const bgURI='data:image/png;base64,'+bg.toString('base64');
const r=(x,y,w,h,c)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const layouts=[
 {ys:[386],signY:451,size:96,icon:76,capacity:4},
 {ys:[560,691],signY:690,size:104,icon:80,capacity:6},
 {ys:[894],signY:966,size:112,icon:88,capacity:3},
 {ys:[1114,1260],signY:1246,size:112,icon:88,capacity:6},
 {ys:[1465],signY:1542,size:120,icon:96,capacity:2}
];
function categorySign(label,cy){
 const x=245,y=cy-45,w=235,h=90;
 let s=r(x+4,y+6,w,h,'#26180d')+r(x,y,w,h,'#8d6536');
 s+=r(x+6,y+6,w-12,h-12,'#b58d52');
 s+=`<path d="M${x} ${y+h}V${y}H${x+w}V${y+6}H${x+6}V${y+h}Z" fill="#c6a365"/><path d="M${x+w} ${y}V${y+h}H${x}V${y+h-6}H${x+w-6}V${y}Z" fill="#6a4828"/>`;
 for(let xx=x+14;xx<x+w-12;xx+=32)s+=r(xx,y+13,16,3,'#a78049')+r(xx,y+h-16,16,3,'#c09b5d');
 const size=Math.min(3.8,213/textWidth(label,1));
 return s+`<g stroke="#151108" stroke-width="1.4" stroke-linejoin="miter" shape-rendering="crispEdges">${pixelText(label,x+w/2,cy-7*size/2,size,'#151108')}</g>`;
}
function frame(cx,y,size){
 const x=cx-size/2,b=10;
 let s=r(x+5,y+7,size,size,'#21130b')+r(x,y,size,size,'#846036');
 s+=`<path d="M${x} ${y+size}V${y}H${x+size}V${y+b}H${x+b}V${y+size}Z" fill="#b6965f"/><path d="M${x+size} ${y}V${y+size}H${x}V${y+size-b}H${x+size-b}V${y}Z" fill="#604125"/>`;
 for(let xx=x+14;xx<x+size-8;xx+=20)s+=r(xx,y+3,9,3,'#c2a46c')+r(xx,y+size-7,9,3,'#8c663a');
 s+=r(x+b,y+b,size-b*2,size-b*2,'#482718')+r(x+b,y+b,size-b*2,4,'#322015');
 return s;
}
const labelList=[];
let display='';
for(let i=0;i<5;i++){
 const row=cfg.rows[i],p=layouts[i];
 if(!row.title||!row.items?.length||row.items.length>p.capacity)throw Error('Too many items for category '+(i+1)+'. Adjust its layout or backdrop.');
 display+=categorySign(row.title,p.signY);
 const groups=p.ys.length===2?[row.items.slice(0,3),row.items.slice(3)]:[row.items];
 for(let g=0;g<groups.length;g++){
  const items=groups[g];
  const centers=items.length===1?[735]:items.length===2?[650,870]:items.length===3?[545,735,925]:[535,665,795,925];
  for(let j=0;j<items.length;j++){
   const item=items[j],cx=centers[j],y=p.ys[g];
   const file=path.resolve(root,item.iconPath||'');
   if(!file.startsWith(root+path.sep)||!['.png','.svg'].includes(path.extname(file).toLowerCase()))throw Error('Use a local PNG or SVG icon inside the kit.');
   if(textWidth(item.label,2.5)>180)throw Error('Shorten the technology label: '+item.label);
   const icon=await sharp(file).resize(p.icon,p.icon,{fit:'contain',kernel:'nearest',background:{r:0,g:0,b:0,alpha:0}}).png().toBuffer();
   display+=`<g aria-label="${escape(item.label)}" shape-rendering="crispEdges">${frame(cx,y,p.size)}<image x="${cx-p.icon/2}" y="${y+(p.size-p.icon)/2}" width="${p.icon}" height="${p.icon}" image-rendering="pixelated" href="data:image/png;base64,${icon.toString('base64')}"/>${pixelText(item.label,cx,y+p.size+6,2.5,'#e0d6be',true)}</g>`;
   labelList.push(item.label);
  }
 }
}
const moonPath='M-12 -32H12V-28H24V-20H28V-12H32V12H28V20H24V28H12V32H-12V28H-24V20H-28V12H-32V-12H-28V-20H-24V-28H-12Z';
const moon=`<defs><clipPath id="moon"><path d="${moonPath}"/></clipPath></defs><g transform="translate(100 88) scale(1.25)" shape-rendering="crispEdges"><path d="${moonPath}" fill="#b9bec2"/><g clip-path="url(#moon)">${r(-24,-20,20,12,'#d4d8d7')}${r(-4,-28,12,16,'#c5cacc')}${r(8,0,16,12,'#9da5ac')}${r(-20,8,12,12,'#a1a9b1')}${r(-8,16,20,8,'#cbd0d1')}${r(-12,-8,8,8,'#afb7bd')}</g></g>`;
const fixedScene=`<image width="${W}" height="${H}" href="${bgURI}"/>`+moon+display;
const lightSources=[
 {id:'left-top',box:[172,182,91,86],phase:.2},
 {id:'right-top',box:[1028,182,100,86],phase:1.2},
 {id:'middle-left',box:[140,960,107,100],phase:2.1},
 {id:'bottom-right',box:[1045,1540,121,107],phase:2.9}
];
for(const l of lightSources){
 const[x,y,w,h]=l.box;let runs='',count=0;
 const lit=(xx,yy)=>{const k=(yy*W+xx)*3;return rgb[k]>225&&rgb[k+1]>200&&rgb[k+2]<180;};
 for(let yy=y;yy<y+h;yy++){let start=-1;for(let xx=x;xx<=x+w;xx++){
  const yes=xx<x+w&&lit(xx,yy);
  if(yes&&start<0)start=xx;
  if(!yes&&start>=0){runs+=`<rect x="${start}" y="${yy}" width="${xx-start}" height="1"/>`;count+=xx-start;start=-1;}
 }}
 if(count<15)throw Error('Check pumpkin coordinates: '+l.id+' ('+count+' pixels)');
 l.clip=runs;console.log(l.id+': '+count+' light-core pixels');
}
const flicker=(t,p)=>Math.max(.12,Math.min(.95,.58+.29*Math.sin(TAU*t/2+p)+.07*Math.sin(TAU*t/.5+p)));
const ghostAt=t=>[1192+2*Math.sin(TAU*t/T),946+4*Math.sin(TAU*t/T)];
const spiderAt=t=>[148,521+5-5*Math.cos(TAU*t/T)];
const webPlaces=[{x:106,y:382,size:100,phase:0},{x:1123,y:1320,size:104,phase:1.4}];
const webAt=(t,i)=>[webPlaces[i].x+Math.round(1.5*Math.sin(TAU*t/T+webPlaces[i].phase)),webPlaces[i].y];
const webURI='data:image/png;base64,'+(await fs.readFile(path.join(root,'source/cobweb.png'))).toString('base64');
function keyframes(name,fn,duration=T,n=128){return '@keyframes '+name+'{'+Array.from({length:n+1},(_,i)=>`${(i*100/n).toFixed(3)}%{${fn(i*duration/n)}}`).join('')+'}';}
let css=keyframes('ghostFloat',t=>{const[x,y]=ghostAt(t);return `transform:translate(${x.toFixed(2)}px,${y.toFixed(2)}px)`;})+'.ghost{animation:ghostFloat 8s linear infinite}';
css+=keyframes('spiderDrop',t=>{const[x,y]=spiderAt(t);return `transform:translate(${x}px,${y.toFixed(2)}px)`;})+'.spider{animation:spiderDrop 8s linear infinite}';
css+=keyframes('threadStretch',t=>`transform:scaleY(${((spiderAt(t)[1]-12-380)/(521-12-380)).toFixed(4)})`)+'.thread{animation:threadStretch 8s linear infinite;transform-origin:148px 380px}';
css+=keyframes('ghostBlink',t=>`transform:scaleY(${eyeOpen(t).toFixed(3)})`)+'.ghost-eyes{animation:ghostBlink 8s linear infinite}';
lightSources.forEach((l,i)=>{css+=keyframes('light'+i,t=>`opacity:${(.76*(1-flicker(t,l.phase))).toFixed(3)}`,2,32)+`.light${i}{animation:light${i} 2s linear infinite}`;});
webPlaces.forEach((_,i)=>{css+=keyframes('web'+i,t=>{const[x,y]=webAt(t,i);return `transform:translate(${x}px,${y}px)`;})+`.web${i}{animation:web${i} 8s steps(1,end) infinite}`;});
css+='@media(prefers-reduced-motion:reduce){g,rect,path{animation:none!important}}';
function motion(t,animated=false){
 let s='<defs>'+lightSources.map((l,i)=>`<clipPath id="core${i}">${l.clip}</clipPath>`).join('')+'</defs>';
 if(cfg.animateLights)s+=lightSources.map((l,i)=>{const[x,y,w,h]=l.box;return `<g clip-path="url(#core${i})"><rect class="${animated?'light'+i:''}" x="${x}" y="${y}" width="${w}" height="${h}" fill="#322411" opacity="${(.76*(1-flicker(t,l.phase))).toFixed(3)}"/></g>`;}).join('');
 for(let i=0;i<webPlaces.length;i++){
  const w=webPlaces[i],[x,y]=webAt(cfg.animateCobwebs?t:0,i);
  s+=`<g class="${animated&&cfg.animateCobwebs?'web'+i:''}" transform="translate(${x} ${y})"><image width="${w.size}" height="${w.size}" image-rendering="pixelated" href="${webURI}"/></g>`;
 }
 const gt=cfg.animateGhost?t:0,[gx,gy]=ghostAt(gt);
 s+=`<g class="${animated&&cfg.animateGhost?'ghost':''}" transform="translate(${gx.toFixed(2)} ${gy.toFixed(2)})"><g transform="scale(2)" shape-rendering="crispEdges">${ghostShape}${ghostEyes(gt,animated&&cfg.animateGhost)}</g></g>`;
 const st=cfg.animateSpider?t:0,[sx,sy]=spiderAt(st);
 s+=`<path class="${animated&&cfg.animateSpider?'thread':''}" d="M148 380L148 ${(sy-12).toFixed(2)}" stroke="#868c87" stroke-width="2"/>`;
 s+=`<g class="${animated&&cfg.animateSpider?'spider':''}" transform="translate(${sx} ${sy.toFixed(2)})" shape-rendering="crispEdges">${spiderShape}</g>`;
 return s;
}
const desc=cfg.rows.map(row=>row.title+': '+row.items.map(x=>x.label).join(', ')).join('. ');
function svg(t,animated=false,layer='full'){
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="title desc"><title id="title">Minecraft Halloween tech stack</title><desc id="desc">Five bold category signs and twenty fixed pixel-art technology items. ${escape(desc)}. Only Halloween decorations move.</desc>${animated?`<style>${css}</style>`:''}${layer!=='motion'?fixedScene:''}${layer!=='static'?motion(t,animated):''}</svg>`;
}
await fs.writeFile(path.join(out,'tech-stack.svg'),svg(0,true));
await fs.writeFile(path.join(out,'tech-stack-static.svg'),svg(0));
await sharp(Buffer.from(svg(0))).png().toFile(path.join(out,'tech-stack-preview.png'));
if(process.argv.includes('--preview'))process.exit(0);
const fixed=await sharp(Buffer.from(svg(0,false,'static'))).png().toBuffer();
const build=path.join(root,'build',String(Date.now()));await fs.mkdir(build,{recursive:true});
for(let i=0;i<N;i++){
 await sharp(fixed).composite([{input:Buffer.from(svg(i/FPS,false,'motion'))}]).png().toFile(path.join(build,`frame-${String(i).padStart(4,'0')}.png`));
 if(i%20===0)console.log(`Rendered ${i+1}/${N} large-block frames`);
}
async function ffmpeg(args){await new Promise((resolve,reject)=>{
 const p=spawn('ffmpeg',['-hide_banner','-loglevel','error',...args],{stdio:['ignore','ignore','pipe']});let error='';
 p.stderr.on('data',d=>{error+=d;});p.on('error',reject);p.on('exit',code=>code===0?resolve():reject(Error(error||'FFmpeg failed')));
});}
const input=path.join(build,'frame-%04d.png'),palette=path.join(build,'palette.png');
await ffmpeg(['-framerate',String(FPS),'-i',input,'-vf','palettegen=stats_mode=full:reserve_transparent=1','-frames:v','1',palette]);
await ffmpeg(['-framerate',String(FPS),'-i',input,'-i',palette,'-lavfi','paletteuse=dither=none:diff_mode=rectangle','-loop','0','-y',path.join(out,'tech-stack.gif')]);
const m=await sharp(path.join(out,'tech-stack.gif'),{animated:true}).metadata();
if(m.pages!==N||m.loop!==0||m.delay.reduce((a,b)=>a+b,0)!==8000)throw Error('Invalid animation timing.');
console.log(JSON.stringify({width:W,height:H,frames:m.pages,seconds:T,tools:labelList.length,bytes:(await fs.stat(path.join(out,'tech-stack.gif'))).size}));

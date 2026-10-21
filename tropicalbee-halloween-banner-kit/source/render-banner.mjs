import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {loadSharp} from '../../scripts/profile-render-utils.mjs';
import {atmosphere,atmosphereCSS,flatMoon} from '../../scripts/profile-motion.mjs';
const sharp=loadSharp(import.meta.url);
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'assets');
await fs.mkdir(out,{recursive:true});
const cfg=JSON.parse(await fs.readFile(path.join(root,'banner-config.json'),'utf8'));
const bg=await fs.readFile(path.join(root,'source/vanilla-background.png'));
const W=1024,H=342,T=8,N=128,TAU=Math.PI*2;
const meta=await sharp(bg).metadata();
if(meta.width!==W||meta.height!==H)throw Error('Update scene coordinates for a different background size.');
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const alphabet={
 A:'01110/10001/10001/11111/10001/10001/10001',B:'11110/10001/10001/11110/10001/10001/11110',C:'01110/10001/10000/10000/10000/10001/01110',D:'11110/10001/10001/10001/10001/10001/11110',E:'11111/10000/10000/11110/10000/10000/11111',F:'11111/10000/10000/11110/10000/10000/10000',G:'01110/10001/10000/10111/10001/10001/01110',H:'10001/10001/10001/11111/10001/10001/10001',I:'01110/00100/00100/00100/00100/00100/01110',J:'00111/00010/00010/00010/10010/10010/01100',K:'10001/10010/10100/11000/10100/10010/10001',L:'10000/10000/10000/10000/10000/10000/11111',M:'10001/11011/10101/10101/10001/10001/10001',N:'10001/11001/10101/10011/10001/10001/10001',O:'01110/10001/10001/10001/10001/10001/01110',P:'11110/10001/10001/11110/10000/10000/10000',Q:'01110/10001/10001/10001/10101/10010/01101',R:'11110/10001/10001/11110/10100/10010/10001',S:'01111/10000/10000/01110/00001/00001/11110',T:'11111/00100/00100/00100/00100/00100/00100',U:'10001/10001/10001/10001/10001/10001/01110',V:'10001/10001/10001/10001/10001/01010/00100',W:'10001/10001/10001/10101/10101/10101/01010',X:'10001/10001/01010/00100/01010/10001/10001',Y:'10001/10001/01010/00100/00100/00100/00100',Z:'11111/00001/00010/00100/01000/10000/11111',
 a:'00000/00000/01110/00001/01111/10001/01111',b:'10000/10000/10110/11001/10001/10001/11110',c:'00000/00000/01110/10000/10000/10001/01110',d:'00001/00001/01101/10011/10001/10001/01111',e:'00000/00000/01110/10001/11111/10000/01110',f:'00110/01001/01000/11100/01000/01000/01000',g:'00000/01111/10001/10001/01111/00001/01110',h:'10000/10000/10110/11001/10001/10001/10001',i:'00100/00000/01100/00100/00100/00100/01110',j:'00010/00000/00110/00010/00010/10010/01100',k:'10000/10000/10010/10100/11000/10100/10010',l:'01100/00100/00100/00100/00100/00100/01110',m:'00000/00000/11010/10101/10101/10101/10101',n:'00000/00000/10110/11001/10001/10001/10001',o:'00000/00000/01110/10001/10001/10001/01110',p:'00000/11110/10001/10001/11110/10000/10000',q:'00000/01111/10001/10001/01111/00001/00001',r:'00000/00000/10110/11001/10000/10000/10000',s:'00000/00000/01111/10000/01110/00001/11110',t:'00100/00100/11111/00100/00100/00101/00010',u:'00000/00000/10001/10001/10001/10011/01101',v:'00000/00000/10001/10001/10001/01010/00100',w:'00000/00000/10001/10001/10101/10101/01010',x:'00000/00000/10001/01010/00100/01010/10001',y:'00000/10001/10001/10001/01111/00001/01110',z:'00000/00000/11111/00010/00100/01000/11111',
 '0':'01110/10001/10011/10101/11001/10001/01110','1':'00100/01100/00100/00100/00100/00100/01110','2':'01110/10001/00001/00010/00100/01000/11111','3':'11110/00001/00001/01110/00001/00001/11110','4':'00010/00110/01010/10010/11111/00010/00010','5':'11111/10000/10000/11110/00001/00001/11110','6':'01110/10000/10000/11110/10001/10001/01110','7':'11111/00001/00010/00100/01000/01000/01000','8':'01110/10001/10001/01110/10001/10001/01110','9':'01110/10001/10001/01111/00001/00001/01110',
 ' ':'000/000/000/000/000/000/000','.':'000/000/000/000/000/010/010','-':'00000/00000/00000/11111/00000/00000/00000','!':'010/010/010/010/010/000/010',',':'000/000/000/000/010/010/100',"'":'010/010/100/000/000/000/000','?':'01110/10001/00001/00010/00100/00000/00100'
};
function glyphs(text){return [...text].map(c=>{if(!alphabet[c])throw Error('Unsupported pixel-font character: '+c);return alphabet[c].split('/');});}
function textWidth(text,size){return glyphs(text).reduce((n,g)=>n+(g[0].length+1)*size,0)-size;}
function pixelText(text,cx,y,size,fill,shadow=false){
 let x=cx-textWidth(text,size)/2,rects='';
 for(const glyph of glyphs(text)){for(let row=0;row<7;row++)for(let col=0;col<glyph[row].length;col++)if(glyph[row][col]==='1')rects+=`<rect x="${x+col*size}" y="${y+row*size}" width="${size}" height="${size}"/>`;x+=(glyph[0].length+1)*size;}
 return `<g aria-label="${escape(text)}" shape-rendering="crispEdges">${shadow?`<g fill="#11191c" transform="translate(2 3)">${rects}</g>`:''}<g fill="${fill}">${rects}</g></g>`;
}
if(!/^#[0-9a-f]{6}$/i.test(cfg.titleColor))throw Error('Use a six-digit title color.');
const nameSize=Math.min(7,Math.floor(480/textWidth(cfg.username,1)));
if(nameSize<2)throw Error('The username is too long for the title area.');
if(textWidth(cfg.tagline,2)>490)throw Error('Keep the tagline short enough to fit below the name.');
const staticLayer=flatMoon(734,45)+pixelText(cfg.username,355,81,nameSize,cfg.titleColor,true)+pixelText(cfg.tagline,355,152,2,'#d1cbb7',true)+pixelText('ENTER',648,228,1.5,'#211a11')+pixelText('THE HOUSE',648,244,1.5,'#211a11')+'<path d="M612 230H615V232H618V234H620V236H618V238H615V240H612Z" fill="#211a11" shape-rendering="crispEdges"/>';
const rawBG=await sharp(bg).removeAlpha().raw().toBuffer();
const lightSources=[
 {id:'lantern',box:[831,201,15,15],phase:.3,strength:.33},
 {id:'left-pumpkin',box:[26,244,48,40],phase:1.3,strength:.88},
 {id:'porch-pumpkin',box:[699,250,29,28],phase:2.2,strength:.88},
 {id:'right-pumpkin',box:[940,263,29,33],phase:.8,strength:.88},
 {id:'upper-window',box:[789,122,25,32],phase:1.8,strength:.10},
 {id:'side-window',box:[903,208,22,32],phase:2.8,strength:.10}
];
// Select only the pale yellow light cores. Orange skins, frames and masonry
// remain outside the clip; the whole object never flashes.
for(const light of lightSources){
 const [x,y,w,h]=light.box;let runs='',pixels=0;
 const luminous=(xx,yy)=>{const at=(yy*W+xx)*3;return rawBG[at]>225&&rawBG[at+1]>200&&rawBG[at+2]<165;};
 for(let yy=y;yy<y+h;yy++){let start=-1;for(let xx=x;xx<=x+w;xx++){const lit=xx<x+w&&luminous(xx,yy);if(lit&&start<0)start=xx;if(!lit&&start>=0){runs+=`<rect x="${start}" y="${yy}" width="${xx-start}" height="1"/>`;pixels+=xx-start;start=-1;}}}
 if(pixels===0)throw Error('No light pixels selected for '+light.id);
 light.clip=runs;console.log(light.id+': '+pixels+' animated light-core pixels');
}
const flicker=(t,p)=>Math.max(.08,Math.min(1,.54+.38*Math.sin(TAU*t/2+p)+.06*Math.sin(TAU*t/.5+p*2)));
const spiderAt=t=>[70+4*Math.sin(TAU*t/8),91+18-18*Math.cos(TAU*t/8)];
const ghostAt=t=>[753+10*Math.sin(TAU*t/8),223+9*Math.sin(TAU*t/8)];
const batAt=(t,i)=>i===0?[690+60*Math.sin(TAU*t/8),74+12*Math.cos(TAU*t/8)]:[670+50*Math.cos(TAU*t/8),115+14*Math.sin(TAU*t/4)];
const flapAt=(t,i)=>.35+.65*(.5+.5*Math.cos(TAU*t/1+i));
const spiderShape=`<g fill="none" stroke="#404043" stroke-width="4" stroke-linejoin="miter"><path d="M-8 -4H-16V-10H-22V-15M-9 1H-19V-4H-25M-8 5H-18V10H-24V16M-6 9H-12V18H-16M8 -4H16V-10H22V-15M9 1H19V-4H25M8 5H18V10H24V16M6 9H12V18H16"/></g><rect x="-11" y="-11" width="22" height="18" fill="#252527"/><path d="M-9 -11H9V-7H-9ZM-11 -7H-7V3H-11Z" fill="#505052"/><rect x="-9" y="5" width="18" height="11" fill="#121214"/><rect x="-7" y="8" width="4" height="4" fill="#ff2020"/><rect x="3" y="8" width="4" height="4" fill="#ff2020"/>`;
const ghostShape='<path d="M-7 -21H7V-18H12V-13H15V20H9V16H3V21H-3V16H-9V20H-15V-13H-12V-18H-7Z" fill="#d0cdbb"/><path d="M-7 -21H7V-17H-7ZM-12 -17H-7V-11H-12ZM-15 -11H-10V13H-15Z" fill="#e1decb"/><path d="M11 -11H15V19H10V14H7V4H11Z" fill="#b6baa7"/><rect x="-1" y="1" width="3" height="3" fill="#697565"/>';
const eyeOpen=t=>{let b=0;for(const c of [2.75,6.75]){const d=Math.abs(t-c);if(d<.22)b=Math.max(b,1-d/.22);}return Math.max(.12,1-b);};
function ghostEyes(t,animated){return `<g transform="translate(0 -7)" fill="#27312b"><g class="${animated?'ghost-eyes':''}" transform="scale(1 ${eyeOpen(t).toFixed(3)})"><rect x="-7" y="-3" width="4" height="6"/><rect x="4" y="-3" width="4" height="6"/></g></g>`;}

function keyframes(name,fn,duration=8,n=128){return '@keyframes '+name+'{'+Array.from({length:n+1},(_,i)=>`${(i*100/n).toFixed(3)}%{${fn(duration*i/n)}}`).join('')+'}';}
let css='';
for(const [id,fn] of [['spider',spiderAt],['ghost',ghostAt],['bat0',t=>batAt(t,0)],['bat1',t=>batAt(t,1)]]){css+=keyframes(id,t=>{const [x,y]=fn(t);return `transform:translate(${x.toFixed(2)}px,${y.toFixed(2)}px)`});css+=`.${id}{animation:${id} 8s linear infinite}`;}
for(let i=0;i<2;i++){css+=keyframes('wing'+i,t=>`transform:scaleY(${flapAt(t,i).toFixed(3)})`,1,16)+`.wing${i}{animation:wing${i} 1s linear infinite}`;}
lightSources.forEach((l,i)=>{css+=keyframes('shade'+i,t=>`opacity:${(l.strength*(1-flicker(t,l.phase))).toFixed(3)}`,2,32)+`.shade${i}{animation:shade${i} 2s linear infinite}`;});
css+=keyframes('ghostBlink',t=>`transform:scaleY(${eyeOpen(t).toFixed(3)})`)+'.ghost-eyes{animation:ghostBlink 8s linear infinite}';
css+=atmosphereCSS('banner');
css+='@media(prefers-reduced-motion:reduce){g,rect,path{animation:none!important}}';
function motion(t,animated){
 const definitions='<defs>'+lightSources.map((l,i)=>`<clipPath id="light${i}">${l.clip}</clipPath>`).join('')+'</defs>';
 const lights=cfg.animateLights?lightSources.map((l,i)=>{const[x,y,w,h]=l.box;return `<g clip-path="url(#light${i})"><rect class="${animated?'shade'+i:''}" x="${x}" y="${y}" width="${w}" height="${h}" fill="#352915" opacity="${(l.strength*(1-flicker(t,l.phase))).toFixed(3)}"/></g>`;}).join(''):'';
 let sprites='';
 if(cfg.animateSpider){const[x,y]=spiderAt(t);sprites+=`<g class="${animated?'spider':''}" transform="translate(${x.toFixed(2)} ${y.toFixed(2)})"><path d="M0 -250V-12" stroke="#96938d" stroke-width="1"/>${spiderShape}</g>`;}
 if(cfg.animateGhost){const[x,y]=ghostAt(t);sprites+=`<g class="${animated?'ghost':''}" transform="translate(${x.toFixed(2)} ${y.toFixed(2)})">${ghostShape}${ghostEyes(t,animated)}</g>`;}
 if(cfg.animateBats)for(let i=0;i<2;i++){const[x,y]=batAt(t,i);sprites+=`<g class="${animated?'bat'+i:''}" transform="translate(${x.toFixed(2)} ${y.toFixed(2)})"><g transform="scale(${i===0?1:.8})" fill="#111d1c"><g class="${animated?'wing'+i:''}" transform="scale(1 ${flapAt(t,i).toFixed(3)})"><path d="M-2 0H-6V-4H-10V-8H-15V-4H-12V1H-9V4H-6V2H-2ZM2 0H6V-4H10V-8H15V-4H12V1H9V4H6V2H2Z"/></g><path d="M-3 -5H-1V-7H1V-5H3V4H1V6H-1V4H-3Z"/></g></g>`;}
 return definitions+`<g shape-rendering="crispEdges">${atmosphere('banner',cfg.animateAtmosphere===false?0:t,animated&&cfg.animateAtmosphere!==false)}${lights}${sprites}</g>`;
}
function svg(t,animated=false,layer='full'){
 const title=escape(cfg.username+' — Come in. Mind the spiders.');
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="title desc"><title id="title">${title}</title><desc id="desc">A block-built Halloween cottage in oak, cobblestone and forest green beneath a midnight-blue sky. The in-image Enter the House sign marks the game entrance. Two bats fly across the sky, flat clouds drift, leaves fall, a spider descends and a ghost bobs and blinks. A flat pixel moon, signs and text stay fixed; pumpkin faces flicker. Link this entire image to the included Markdown adventure.</desc>${animated?`<style>${css}</style>`:''}${layer==='full'?`<image width="${W}" height="${H}" href="data:image/png;base64,${bg.toString('base64')}"/>`:''}${layer!=='motion'?staticLayer:''}${layer!=='static'?motion(t,animated):''}</svg>`;
}
await fs.writeFile(path.join(out,'tropicalbee-halloween-animated.svg'),svg(0,true));
await sharp(Buffer.from(svg(0))).png().toFile(path.join(out,'tropicalbee-halloween-preview.png'));
const overlay=await sharp(Buffer.from(svg(0,false,'static'))).png().toBuffer();
const base=await sharp(rawBG,{raw:{width:W,height:H,channels:3}}).composite([{input:overlay}]).removeAlpha().raw().toBuffer();
const frames=[];
for(let i=0;i<N;i++){
 const layer=await sharp(Buffer.from(svg(i*T/N,false,'motion'))).png().toBuffer();
 frames.push(await sharp(base,{raw:{width:W,height:H,channels:3}}).composite([{input:layer}]).removeAlpha().raw().toBuffer());
 if(i%32===0)console.log(`Rendered ${i+1}/${N} banner frames`);
}
const delays=Array.from({length:N},(_,i)=>i%4===3?70:60);
// Reuse the first palette aggressively; local palettes otherwise make a few
// unchanged orange skin pixels shift between neighboring quantized colors.
await sharp(Buffer.concat(frames),{raw:{width:W,height:H*N,channels:3,pageHeight:H},limitInputPixels:false}).gif({loop:0,delay:delays,colours:256,dither:0,effort:4,interFrameMaxError:0,interPaletteMaxError:256}).toFile(path.join(out,'tropicalbee-halloween-animated.gif'));
const gif=await sharp(path.join(out,'tropicalbee-halloween-animated.gif'),{animated:true}).metadata();
if(gif.pages!==N||gif.loop!==0||gif.delay.reduce((a,b)=>a+b,0)!==8000)throw Error('Invalid banner loop');
console.log(JSON.stringify({width:W,height:H,frames:gif.pages,milliseconds:gif.delay.reduce((a,b)=>a+b,0),bytes:(await fs.stat(path.join(out,'tropicalbee-halloween-animated.gif'))).size}));

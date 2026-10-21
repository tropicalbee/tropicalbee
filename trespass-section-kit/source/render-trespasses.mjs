import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {loadSharp,encodeGifFrames} from '../../scripts/profile-render-utils.mjs';
import {pixelText,textWidth} from '../../garage-section-kit/source/pixel-font.mjs';
import {visitorLabel} from './visitor-label.mjs';

const sharp=loadSharp(import.meta.url);
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'assets');
await fs.mkdir(out,{recursive:true});
const W=1024,H=410,FPS=12.5,N=100;
const snapshot=JSON.parse(await fs.readFile(path.join(root,'data/visitors.json'),'utf8'));
const label=visitorLabel(snapshot);
const background=await sharp(path.join(root,'source/gate-original.png')).resize(W,H,{fit:'fill',kernel:'nearest'}).png().toBuffer();
const raw=await sharp(background).removeAlpha().raw().toBuffer();
const fixed=`<image width="${W}" height="${H}" href="data:image/png;base64,${background.toString('base64')}"/>`+
 pixelText('THE TRESPASS REGISTER',675,128,2.4,'#c9c9b8',true)+
 pixelText(label,675,158,Math.min(2.5,320/textWidth(label,1)),'#c2a77c',true)+
 pixelText('Something followed you in.',675,192,1.3,'#b4b7a6',true);

const steps=[[260,390],[277,365],[258,341],[275,317],[266,293],[278,269]];
const clamp=v=>Math.max(0,Math.min(1,v));
export const stepOpacity=(t,i)=>clamp((t-1-i*.65)/.18)*clamp((7.15-t)/1.25)*.62;
const eyes=t=>clamp((t-5.9)/.3)*clamp((7.1-t)/.35);
const flame=t=>.15+.15*(.5+.5*Math.sin(Math.PI*t+1))+.06*Math.sin(Math.PI*4*t);
// Shade only warm light-core pixels, never the hanging lantern's housing.
const box=[866,177,30,29];
let mask='',lit=0;
for(let y=box[1];y<box[1]+box[3];y++)for(let x=box[0];x<box[0]+box[2];x++){
 const k=(y*W+x)*3;
 if(raw[k]>190&&raw[k+1]>130&&raw[k+2]<170){mask+=`<rect x="${x}" y="${y}" width="1" height="1"/>`;lit++;}
}
if(lit<5)throw Error(`Check lantern position: only ${lit} bright core pixels`);
const keyframes=(name,fn)=>`@keyframes ${name}{`+Array.from({length:N+1},(_,i)=>`${i}%{opacity:${fn(i*8/N).toFixed(3)}}`).join('')+`}.${name}{animation:${name} 8s linear infinite}`;
const css=steps.map((_,i)=>keyframes('foot-'+i,t=>stepOpacity(t,i))).join('')+keyframes('watcher',eyes)+keyframes('lantern',flame)+
 '@media(prefers-reduced-motion:reduce){g,rect,path{animation:none!important}}';
function motion(t,animated=false){
 const footprints=steps.map(([x,y],i)=>`<g class="${animated?'foot-'+i:''}" opacity="${stepOpacity(t,i).toFixed(3)}"><g transform="translate(${x} ${y}) rotate(-22) scale(${(1-i*.08).toFixed(2)})"><path d="M-3 -6H3V1H-3ZM-2 3H3V6H-2Z" fill="#131c1b"/></g></g>`).join('');
 return `<g shape-rendering="crispEdges">${footprints}<g class="${animated?'watcher':''}" opacity="${eyes(t).toFixed(3)}"><rect x="270" y="210" width="3" height="2" fill="#985c43"/><rect x="281" y="210" width="3" height="2" fill="#985c43"/></g><defs><clipPath id="lantern-core">${mask}</clipPath></defs><g clip-path="url(#lantern-core)"><rect class="${animated?'lantern':''}" x="${box[0]}" y="${box[1]}" width="${box[2]}" height="${box[3]}" fill="#38291c" opacity="${flame(t).toFixed(3)}"/></g></g>`;
}
function svg(t,animated=false,layer='full'){
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" role="img" aria-labelledby="title desc"><title id="title">The Trespass Register</title><desc id="desc">An abandoned cemetery checkpoint. Footprints appear one by one on the stone path although nobody is visible. A hanging lantern flickers, then two eyes briefly watch from the dark entrance. The sign shows ${label}. The profile-view snapshot refreshes every twelve hours; it does not count unique people.</desc>${animated?`<style>${css}</style>`:''}${layer!=='motion'?fixed:''}${layer!=='static'?motion(t,animated):''}</svg>`;
}
await fs.writeFile(path.join(out,'trespass-register.svg'),svg(0,true));
await sharp(Buffer.from(svg(0))).png().toFile(path.join(out,'trespass-register-preview.png'));
if(process.argv.includes('--preview'))process.exit(0);
const base=await sharp(Buffer.from(svg(0,false,'static'))).png().toBuffer();
const build=path.join(root,'build',String(Date.now()));
await fs.mkdir(build,{recursive:true});
for(let i=0;i<N;i++){
 await sharp(base).composite([{input:Buffer.from(svg(i/FPS,false,'motion'))}]).png().toFile(path.join(build,`frame-${String(i).padStart(4,'0')}.png`));
 if(i%25===0)console.log(`Rendered ${i+1}/${N} register frames`);
}
await encodeGifFrames(sharp,{directory:build,output:path.join(out,'trespass-register.gif'),width:W,height:H,frames:N,fps:FPS});
console.log(JSON.stringify({width:W,height:H,frames:N,seconds:8,bytes:(await fs.stat(path.join(out,'trespass-register.gif'))).size}));

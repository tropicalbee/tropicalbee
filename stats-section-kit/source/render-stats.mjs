import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {loadSharp,encodeGifFrames} from '../../scripts/profile-render-utils.mjs';
import {WIDTH,HEIGHT,sceneLayers} from './archive-scene.mjs';
import {metrics,validateSnapshot,languageSlices,formatNumber,xml} from './stats-model.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sharp=loadSharp(import.meta.url),W=WIDTH,H=HEIGHT,N=100,FPS=12.5;
const snapshot=validateSnapshot(JSON.parse(await fs.readFile(path.join(root,'data/stats.json'),'utf8')));
const slices=languageSlices(snapshot.languages);
const out=path.join(root,'assets');
await fs.mkdir(out,{recursive:true});
const background=await sharp(path.join(root,'source/archive-coarse-v2.png')).resize(W,H,{fit:'fill',kernel:'nearest'}).png().toBuffer();
const raw=await sharp(background).removeAlpha().raw().toBuffer();
const {fixed,motion}=sceneLayers(background,raw,snapshot,slices);
const description='Seven public GitHub statistics and a code-language pie chart. '+metrics.map(([key,label])=>`${label}: ${formatNumber(snapshot.metrics[key])}`).join('. ')+'. Longest streak and contributions cover the past twelve months. The resident ghost floats by the doorway. A black cat sits beside the pumpkin, blinks and moves its tail. A spider crawls on the beam, the lantern flickers, and red eyes watch from the doorway.';
const svg=(t,layer='full')=>`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" role="img" aria-labelledby="title desc"><title id="title">The Haunted Archive</title><desc id="desc">${xml(description)}</desc>${layer!=='motion'?fixed:''}${layer!=='static'?motion(t):''}</svg>`;
await fs.writeFile(path.join(out,'haunted-archive.svg'),svg(0));
await sharp(Buffer.from(svg(0))).png().toFile(path.join(out,'haunted-archive-preview.png'));
const summary=['# The Haunted Archive','',snapshot.fetchedAt?`Updated ${snapshot.fetchedAt}.`:'Awaiting the first GitHub snapshot.','',...metrics.map(([key,label,scope])=>`- **${label}:** ${formatNumber(snapshot.metrics[key])}${key==='longestStreak'?' days':''} (${scope})`),'','## Languages used','',...(slices?.length?slices.map(l=>`- ${l.name.replace(/[\r\n]/g,' ')}: ${l.percent}%`):[slices===null?'Awaiting GitHub data.':'No language bytes detected.']),'','Language percentages measure code bytes in owned public non-fork repositories, excluding the profile repository. They do not measure proficiency or individual authorship. Jupyter Notebook bytes are counted as Python.',snapshot.period?`Contribution window: ${snapshot.period.start} through ${snapshot.period.end}, using GitHub calendar dates.`:'',''];
await fs.writeFile(path.join(out,'stats-summary.md'),summary.join('\n'));
if(process.argv.includes('--preview'))process.exit(0);
const base=await sharp(Buffer.from(svg(0,'static'))).png().toBuffer();
const build=path.join(root,'build',String(Date.now()));
await fs.mkdir(build,{recursive:true});
for(let i=0;i<N;i++){
 await sharp(base).composite([{input:Buffer.from(svg(i/FPS,'motion'))}]).png().toFile(path.join(build,`frame-${String(i).padStart(4,'0')}.png`));
 if(i%25===0)console.log(`Rendered ${i+1}/${N} archive frames`);
}
await encodeGifFrames(sharp,{directory:build,output:path.join(out,'haunted-archive.gif'),width:W,height:H,frames:N,fps:FPS});
const size=(await fs.stat(path.join(out,'haunted-archive.gif'))).size;
if(size>800*1024)throw Error(`Archive exceeds its 800 KiB animation budget: ${size}`);
console.log(`Archive: ${N} frames, 8 seconds, ${size} bytes`);

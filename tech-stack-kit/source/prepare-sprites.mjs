import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const sharp=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/sharp':'sharp');
const here=path.dirname(fileURLToPath(import.meta.url));
const names=['python','cplusplus','html','css','pytorch','fastapi','streamlit','sklearn','langchain','langgraph','git','github','docker','vscode','jupyter','firebase','chromadb','supabase','codex','antigravity'];
await fs.mkdir(path.join(here,'pixel-icons'),{recursive:true});
// Split the generated atlas and normalize its matte to hard pixel alpha.
// Every sprite retains its original artwork; no brand shapes are redrawn.
async function cropAlpha(input,destination){
 const {data,info}=await sharp(input).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 let left=info.width,top=info.height,right=-1,bottom=-1;
 for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){
  const k=(y*info.width+x)*4;
  data[k+3]=data[k+3]>=128?255:0;
  if(data[k+3]){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);}
 }
 if(right<left)throw Error('Empty sprite: '+destination);
 await sharp(data,{raw:{width:info.width,height:info.height,channels:4}}).extract({left,top,width:right-left+1,height:bottom-top+1}).png().toFile(destination);
}
const atlas=path.join(here,'pixel-atlas-original.png'),m=await sharp(atlas).metadata();
for(let i=0;i<names.length;i++){
 const col=i%5,row=Math.floor(i/5);
 const left=Math.round(col*m.width/5),top=Math.round(row*m.height/4);
 const right=Math.round((col+1)*m.width/5),bottom=Math.round((row+1)*m.height/4);
 const cell=await sharp(atlas).extract({left,top,width:right-left,height:bottom-top}).png().toBuffer();
 await cropAlpha(cell,path.join(here,'pixel-icons',names[i]+'.png'));
}
await cropAlpha(path.join(here,'web-original.png'),path.join(here,'cobweb.png'));
console.log('Prepared 20 large pixel-art sprites and a transparent full cobweb.');

import {pixelText,textWidth} from '../../garage-section-kit/source/pixel-font.mjs';
import {ghostShape,ghostEyes} from '../../resident-section-kit/source/ghost-sprite.mjs';
import {metrics,formatNumber} from './stats-model.mjs';
import {archiveCat} from './archive-cat.mjs';

export const WIDTH=1024,HEIGHT=640;
const rect=(x,y,w,h,fill,extra='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`;
// Integral glyph size AND origin: no fractional bitmap lettering or soft shadows.
export function crispText(s,x,y,size,color='#cdd0c6',anchor='middle'){
 if(!Number.isInteger(size)||size<2)throw Error('Archive text must use whole pixels at size 2 or greater');
 const left=Math.round(anchor==='start'?x:anchor==='end'?x-textWidth(s,size):x-textWidth(s,size)/2);
 return `<g transform="translate(${left} ${Math.round(y)})">${pixelText(s,textWidth(s,size)/2,0,size,color,false)}</g>`;
}
const displayLanguage=name=>({'Jupyter Notebook':'Notebooks','TypeScript':'TypeScript','C#':'C#','F#':'F#'}[name]??name)
 .replace(/[^A-Za-z0-9 +&#.,'!?%:-]/g,'?');

export function sceneLayers(background,raw,snapshot,slices){
 let fixed=`<image width="${WIDTH}" height="${HEIGHT}" href="data:image/png;base64,${background.toString('base64')}"/>`;
 fixed+=crispText('THE HAUNTED ARCHIVE',540,81,4)+crispText('The resident keeps a record of everything.',540,130,2,'#c8ccc7');
 for(const [i,[key,title]]of metrics.entries()){
  const y=220+i*34;
  const label=(key==='contributions'||key==='longestStreak')?title+' 12M':title;
  const value=formatNumber(snapshot.metrics[key])+(key==='longestStreak'?' DAYS':'');
  const size=textWidth(value,3)<=152?3:2;
  if(textWidth(value,size)>152)throw Error('Stat value exceeds its readable record column');
  fixed+=crispText(label,158,y,2,'#e0dfcf','start');
  fixed+=crispText(value,550,y-3,size,'#e4d1a9','end');
 }
 fixed+=crispText('LANGUAGES',746,213,2);
 const cx=746,cy=285,radius=48,cell=2;
 for(let y=-radius;y<radius;y+=cell)for(let x=-radius;x<radius;x+=cell){
  const dx=x+cell/2,dy=y+cell/2;
  if(dx*dx+dy*dy>radius*radius)continue;
  let fill='#505b65';
  if(slices?.length){
   const angle=((Math.atan2(dy,dx)+Math.PI/2+Math.PI*2)%(Math.PI*2))/(Math.PI*2);
   let end=0,index=0;
   for(;index<slices.length-1;index++){end+=slices[index].fraction;if(angle<end)break;}
   fill=slices[index].color;
  }
  fixed+=rect(cx+x,cy+y,cell,cell,fill);
 }
 if(slices?.length){
  for(const [i,slice]of slices.entries()){
   const name=displayLanguage(slice.name),y=345+i*21;
   // Keep tiny language categories readable without shrinking their lettering.
   const short=textWidth(name,2)>122?name.slice(0,8)+'.':name;
   fixed+=rect(642,y+4,6,6,slice.color)+crispText(short,654,y,2,'#cdd0c6','start')+
    crispText(slice.percent+'%',851,y,2,'#cdd0c6','end');
  }
 }else{
  fixed+=crispText(slices===null?'AWAITING SYNC':'NO CODE DATA',746,360,2);
 }
 fixed+=crispText('12M = PAST 12 MONTHS',366,498,2)+crispText('CODE BYTES',746,498,2);
 fixed+=crispText('Public records. Updated every 12 hours.',540,580,2,'#c8ccc7');
 let mask='';
 for(let y=211;y<263;y++)for(let x=36;x<83;x++){
  const k=(y*WIDTH+x)*3;
  if(raw[k]>200&&raw[k+1]>150&&raw[k+2]<180)mask+=rect(x,y,1,1,'#fff');
 }
 if(!mask)throw Error('Archive lamp core is outside its expected bounds');
 const motion=t=>{
  const phase=t*Math.PI/4,gx=973+Math.round(2*Math.sin(phase)),gy=414+Math.round(6*Math.sin(phase*2));
  const actor=`<g transform="translate(${gx} ${gy}) scale(2)">${ghostShape}${ghostEyes(t,false)}</g>`;
  const sx=807+Math.round(77*Math.cos(phase)),sy=49;
  let legs='';
  for(let side of [-1,1])for(let i=0;i<4;i++){
   const gait=Math.round(2*Math.sin(t*Math.PI*2+i*Math.PI/2));
   legs+=`<path d="M${side*3} ${i*2-3}l${side*6} ${i-4+gait}l${side*3} ${i<2?-4:5}"/>`;
  }
  const spider=`<g transform="translate(${sx} ${sy})" stroke="#3d3021" stroke-width="2">${legs}${rect(-5,-4,10,8,'#29251b')}${rect(-3,3,6,5,'#211d16')}</g>`;
  const flicker=.12+.15*(.5+.5*Math.sin(t*Math.PI))+.05*Math.sin(t*4*Math.PI);
  const light=`<defs><clipPath id="archive-lamp">${mask}</clipPath></defs><g clip-path="url(#archive-lamp)">${rect(36,211,47,52,'#392713',`opacity="${flicker.toFixed(3)}"`)}</g>`;
  const eyesOpacity=Math.max(0,Math.min(1,(t-4)/.4,(7-t)/.4));
  const eyes=`<g opacity="${eyesOpacity.toFixed(2)}">${rect(968,325,4,5,'#9f241c')}${rect(982,325,4,5,'#9f241c')}</g>`;
  return `<g shape-rendering="crispEdges">${actor}${archiveCat(t)}${spider}${light}${eyes}</g>`;
 };
 return {fixed,motion};
}

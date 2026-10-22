// Small native sprite: fixed paws, anchored tail, blinking eyes and a quiet gaze.
// Shares the resident scene's charcoal fur and yellow eyes; no raster asset.
export function archiveCat(t){
 const phase=t*Math.PI/4;
 const tailY=-17+Math.round(5*Math.sin(phase));
 const tailX=21+Math.round(3*Math.cos(phase));
 const look=Math.sin(phase)>.25?1:0;
 const blink=[2.1,5.9].some(center=>Math.abs(t-center)<.12);
 const r=(x,y,w,h,c)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
 const tail=`<path d="M8 -4H17V${tailY}H${tailX}" fill="none" stroke="#0b1017" stroke-width="3"/>`;
 const body=r(-9,-21,18,20,'#090d14')+r(-9,-19,4,17,'#151d29')+r(5,-18,4,17,'#05080e')+
  r(-11,-3,8,3,'#131b27')+r(3,-3,8,3,'#090d14')+r(-1,-15,2,12,'#03060b');
 const head=r(-11,-31,22,14,'#0c111a')+r(-11,-35,6,6,'#151c28')+r(5,-35,6,6,'#080d15')+
  r(-9,-33,2,3,'#252b35')+r(7,-33,2,3,'#1c222d')+r(-11,-29,3,9,'#1a2330')+r(8,-29,3,11,'#05090f');
 const eyes=blink?r(-7,-25,4,1,'#dcc338')+r(3,-25,4,1,'#dcc338'):
  r(-7,-26,4,4,'#f0d83a')+r(3,-26,4,4,'#f0d83a')+r(-6+look,-26,1,4,'#03060b')+r(4+look,-26,1,4,'#03060b');
 const muzzle=r(-4,-21,8,4,'#141b25')+r(-1,-21,2,1,'#55545b')+r(-1,-19,2,1,'#03060b');
 return `<g transform="translate(153 552) scale(2)" shape-rendering="crispEdges">${tail}${body}${head}${eyes}${muzzle}</g>`;
}

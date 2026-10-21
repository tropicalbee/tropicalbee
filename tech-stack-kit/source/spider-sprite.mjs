const spiderShape=`<g fill="none" stroke="#404043" stroke-width="4" stroke-linejoin="miter"><path d="M-8 -4H-16V-10H-22V-15M-9 1H-19V-4H-25M-8 5H-18V10H-24V16M-6 9H-12V18H-16M8 -4H16V-10H22V-15M9 1H19V-4H25M8 5H18V10H24V16M6 9H12V18H16"/></g><rect x="-11" y="-11" width="22" height="18" fill="#252527"/><path d="M-9 -11H9V-7H-9ZM-11 -7H-7V3H-11Z" fill="#505052"/><rect x="-9" y="5" width="18" height="11" fill="#121214"/><rect x="-7" y="8" width="4" height="4" fill="#ff2020"/><rect x="3" y="8" width="4" height="4" fill="#ff2020"/>`;
export {spiderShape};

// Repeatable wandering: pause, crawl along the beam, then lower on silk and return.
export function spiderAt(t){
 const time=((t%8)+8)%8;
 const points=[[0,195,535,-90],[.6,195,535,-90],[1.5,224,535,-90],[2,224,535,90],[3,178,535,0],[3.5,178,535,0],[4.7,178,635,0],[5.1,178,635,0],[6.4,178,535,-90],[7.5,195,535,-90],[8,195,535,-90]];
 const i=points.findIndex((p,index)=>index<points.length-1&&time>=p[0]&&time<points[index+1][0]);
 const a=points[i],b=points[i+1],u=(time-a[0])/(b[0]-a[0]);
 return {x:a[1]+(b[1]-a[1])*u,y:a[2]+(b[2]-a[2])*u,angle:a[3],thread:time>=3&&time<=6.4};
}
export function crawlingSpider(t,animated=false){
 let legs='';
 for(let side of [-1,1])for(let leg=0;leg<4;leg++){
  const angle=8*Math.sin(Math.PI*4*t+leg*Math.PI+side);
  legs+=`<g class="${animated?'leg-'+side+'-'+leg:''}" transform="rotate(${angle.toFixed(2)})"><path d="M${side*8} ${-6+leg*5}H${side*17}L${side*(25-leg%2*3)} ${-18+leg*12}"/></g>`;
 }
 const body=spiderShape.slice(spiderShape.indexOf('<rect'));
 return `<g fill="none" stroke="#55565a" stroke-width="4" stroke-linejoin="miter">${legs}</g>${body}`;
}
export const spiderLegCSS=[-1,1].flatMap(side=>[0,1,2,3].map(leg=>{
 const name='leg-'+side+'-'+leg;
 const frames=Array.from({length:17},(_,i)=>`${i*100/16}%{transform:rotate(${(8*Math.sin(Math.PI*4*i/32+leg*Math.PI+side)).toFixed(2)}deg)}`).join('');
 return `@keyframes ${name}{${frames}}.${name}{animation:${name} .5s linear infinite}`;
})).join('');

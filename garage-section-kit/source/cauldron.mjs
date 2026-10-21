// Pivot stays in the potion surface; the bowl disappears below the front lip.
export const spoonState=t=>({x:338+14*Math.sin(Math.PI*t),y:206+Math.cos(Math.PI*t),angle:8*Math.sin(Math.PI*t)});
const transform=(p,css=false)=>css?`translate(${p.x.toFixed(2)}px,${p.y.toFixed(2)}px) rotate(${p.angle.toFixed(2)}deg)`:`translate(${p.x.toFixed(2)} ${p.y.toFixed(2)}) rotate(${p.angle.toFixed(2)})`;
export const spoonCSS='@keyframes stir{'+Array.from({length:33},(_,i)=>`${i*100/32}%{transform:${transform(spoonState(i/16),true)}}`).join('')+'}.stir{animation:stir 2s linear infinite}'+
 '@keyframes stirSurface{'+Array.from({length:33},(_,i)=>{const p=spoonState(i/16);return `${i*100/32}%{transform:translate(${p.x.toFixed(2)}px,${p.y.toFixed(2)}px)}`;}).join('')+'}.stirSurface{animation:stirSurface 2s linear infinite}';
export function spoon(t,animated=false){
 const p=spoonState(t);
 return `<defs><clipPath id="spoon-immersion"><path d="M270 0H406V201L384 210H273V206Z"/></clipPath></defs><g clip-path="url(#spoon-immersion)"><g class="${animated?'stir':''}" transform="${transform(p)}"><path d="M-2 -43H2V9H-2Z" fill="#9a8362"/><path d="M-5 6H5V17H-5Z" fill="#b1a185"/></g></g><g clip-path="url(#liquid)"><g class="${animated?'stirSurface':''}" transform="translate(${p.x.toFixed(2)} ${p.y.toFixed(2)})"><ellipse rx="10" ry="2" fill="none" stroke="#97aa6e" stroke-width="1" opacity=".6"/></g></g>`;
}

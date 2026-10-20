const ghostShape='<path d="M-7 -21H7V-18H12V-13H15V20H9V16H3V21H-3V16H-9V20H-15V-13H-12V-18H-7Z" fill="#d0cdbb"/><path d="M-7 -21H7V-17H-7ZM-12 -17H-7V-11H-12ZM-15 -11H-10V13H-15Z" fill="#e1decb"/><path d="M11 -11H15V19H10V14H7V4H11Z" fill="#b6baa7"/><rect x="-1" y="1" width="3" height="3" fill="#697565"/>';
const eyeOpen=t=>{let b=0;for(const c of [2.75,6.75]){const d=Math.abs(t-c);if(d<.22)b=Math.max(b,1-d/.22);}return Math.max(.12,1-b);};
function ghostEyes(t,animated){return `<g transform="translate(0 -7)" fill="#27312b"><g class="${animated?'ghost-eyes':''}" transform="scale(1 ${eyeOpen(t).toFixed(3)})"><rect x="-7" y="-3" width="4" height="6"/><rect x="4" y="-3" width="4" height="6"/></g></g>`;}

export {ghostShape,ghostEyes,eyeOpen};

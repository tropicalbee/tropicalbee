// Plain month captions begin at their week column, as on GitHub's calendar.
// Omit a too-short boundary caption instead of shifting it into another month.
export function layoutMonthLabels(start,weeks,x,pitch){
 const names=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
 const groups=[];
 for(let c=0;c<weeks;c++){
  const d=new Date(start+c*7*86400000),month=d.getUTCMonth(),year=d.getUTCFullYear();
  const previous=groups.at(-1);
  if(previous&&previous.month===month&&previous.year===year)previous.endWeek=c+1;
  else groups.push({month,year,startWeek:c,endWeek:c+1});
 }
 const size=16,gap=14,maxX=x+weeks*pitch;
 const result=groups.map(g=>{
  // Plain calendar type, with predictable width independent of host font metrics.
  const text=names[g.month],width=30,left=x+g.startWeek*pitch;
  return {...g,text,size,width,left,right:left+width,center:left+width/2};
 });
 return result.filter((m,i)=>m.right<=(i+1<result.length?result[i+1].left-gap:maxX)+.001);
}

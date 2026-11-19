import {oneCenterline} from './centerline';
import {parseCenterline,pathData,transformPaths} from '../../vector/bezier';
import {bezierBounds} from '../../vector/bounds';
import type {BezierPath} from '../../vector/bezier';

// Masters in writing coordinates. Open bowls and folded stems retain a free exit.
const masters:Record<string,string>={
 l:'C2 -2 4 -11 5 -10 C6 -9 2 -3 2.6 -1 C3 1 4 0 5 -1',
 e:'C2 -2 4 -3 3.7 -4 C3 -6 .7 -4 1 -2 C1 0 3 1 5 -1',
 o:'C1 -2 2 -5 4 -5 C6 -5 5 -1 3 0 C1 1 1 -2 2.8 -3.6 C4 -4.6 5 -2 6 -2',
 a:'C1 -2 3 -5 4.7 -5 C5 -4 2 -4 1.6 -2 C.8 1 4 0 5 -4 C5.7 -6 5.3 -4 5.2 -2 C5 0 6 0 7 -1',
 i:'C1 -1 2 -4 2.6 -4 C3.4 -4 1.2 -.6 2.5 0 C3 .2 4 -.6 4.5 -1',
 u:'C1 -1 2 -5 2.8 -5 C3.6 -5 .4 -.5 2.2 0 C4 1 5 -4 6 -4.8 C7 -5 4.8 -1 6 0 C6.5 .3 7 -.5 7.5 -1',
 p:'C1 -1 2 -5 2.7 -5 C3.6 -5 .6 5 1 6 C2 7 3.7 -4.6 5.6 -5 C8 -6 7 -1 4.5 -.6 C4 -.4 5.5 .6 7 -1',
 y:'C1 -1 2 -5 2.6 -5 C3.5 -5 .8 -.4 2.7 0 C4 0 5.3 -4.7 6 -5 C7 -5 4.4 5 2.8 6 C.7 7 2.4 3 4 2 C5 1.6 6.8 -.2 7.6 -1',
 t:'C1 -2 3 -9 4 -9 C5 -9 3.7 -6 4.4 -6 C5 -6 7 -7 7 -6.3 C7 -5.5 4 -5.3 3.8 -4.7 C3 -3 2 -1 3 0 C4 .8 5 -.4 5.5 -1',
 V:'C1 -2 2 -9 2.6 -9 C4 -9 1 -.5 3 0 C5 1 8 -8 9 -8 C10 -8 7 -2 9 -1',
 P:'C1 -2 2 -9 5 -9 C9 -10 9 -4 5 -4 C3 -4 4 -6 5 -6 C5.5 -6 2 -1 3 0 C4 1 5 -.2 6 -1'
};
// Alternative with open returns. The descent and its return occupy
// different sides of the loop; physical clearance still needs checking.
const openReturns:Record<string,string>={
 S:'C2 0 6 -1 5 -3 C4 -4 .6 -4 1 -6 C1.5 -9 7 -10 7 -8 C7 -7 5.7 -6.4 5 -6 C6 -6.1 8 -7 8 -5 C8 -3 6 -1 7 0 C8 .8 9 -.5 9.5 -1',
 y:'C1 -1 2 -5 2.7 -5 C3.7 -5 .9 -.4 2.7 -.1 C4.4 .3 5.6 -4.5 6.4 -5 C7.4 -5.4 4.7 1.5 4 4 C3.2 7 5.2 7.2 6.2 4.7 C7 2.6 7.6 .1 9 -1',
 f:'C1 -1 3 -8 5 -9 C7 -9.8 6 -6.7 4.8 -5.2 C4 -4.2 3.3 -3.6 3 -3 C2.5 -1.4 1.8 4.2 3.4 4.6 C5.5 5.1 4.7 .6 4.3 -1 C4 -2.4 4 -3.3 5.4 -3 C6.6 -2.6 7.7 -3.4 8 -4',
 l:'C1.5 -1 3 -8.5 5.1 -9.8 C6.8 -10.8 6.2 -7.8 5.3 -6 C4.5 -4.4 3.3 -3.5 3.2 -2 C3 -.1 4.5 .7 6 -1',
 p:'C1 -1 2.3 -5 3 -5 C4 -5 1.4 3.5 1.5 5.1 C1.6 6.8 3.2 5.1 3.6 3.2 C4 1 4.8 -3.8 6.5 -4.5 C9 -5.5 8.8 -2 7.1 -1.3 C6.1 -.8 5.5 -.8 5.8 -.3 C6.3 .7 8 -.2 9 -1'
};
function word(text:string,variant:number,returnWidth:number){
 const nodes:BezierPath['nodes']=[];
 let pen=0;
 const letters=Array.from(text);
 for(const [i,c] of letters.entries()){
  const master=(variant>0&&openReturns[c])||masters[c];
  const raw=master?'M0 0 '+master:oneCenterline(c,8,.5);
  const source=parseCenterline(raw);
  const following=letters[i+1];
  const stretch=(/[leoypft]/.test(c)?returnWidth:1)+.055*variant+(following&&'ilt'.includes(following)?-.05:0);
  const glyph=transformPaths(source,p=>({x:pen+p.x*stretch-p.y*.14,y:p.y*(1+.045*variant)}))[0];
  const last=nodes.at(-1),first=glyph.nodes[0];
  if(last){
   // Use the tangent on either side of the inter-letter cubic; handle lengths
   // follow the space actually available between these two letters.
   const handle=Math.hypot(first.p.x-last.p.x,first.p.y-last.p.y)/3;
   for(const [node,from,to] of [[last,'in','out'],[first,'out','in']] as const){
    const dx=node.p.x-node[from].x,dy=node.p.y-node[from].y,k=handle/(Math.hypot(dx,dy)||1);
    node[to]={x:node.p.x+dx*k,y:node.p.y+dy*k};
   }
  }
  nodes.push(...glyph.nodes);
  pen=bezierBounds([glyph]).maxX+1.15+(following===c ? .55 : 0);
 }
 return {id:'word',nodes};
}
export function composeWords(text:string,width:number,perWord=true,variant=0,align:'left'|'center'|'right'='center',space=4,channel?:{bore:number;wallGap:number;radius:number}){
 if(!text.trim())throw Error('Inserisci almeno una parola.');
 if(!Number.isFinite(width)||width<=0)throw Error('La larghezza deve essere positiva.');
 const lines=text.normalize('NFC').split(/\r?\n/);
 if(!perWord&&lines.filter(line=>line.trim()).length>1)throw Error('Per collegare tutta la frase disponila su una riga.');
 const paths:BezierPath[]=[];
 let widest=0;
 // Estimate millimetres per writing unit across the longest line. Reserve
 // extra transverse room for returns before the final exact-width transform.
 const longest=Math.max(1,...lines.map(l=>Array.from(l.trim()).length));
 const unit=width/(7*longest);
 const returnWidth=channel?1+Math.min(.45,Math.max(0,(channel.bore+channel.wallGap+channel.radius*.2)/unit-1)*.12):1;
 const groups=lines.map((line,row)=>{
  let x=0;
  const pieces:BezierPath[]=[];
  for(const item of line.trim().split(/\s+/).filter(Boolean)){
   const path=transformPaths([word(item,variant,returnWidth)],p=>({x:x+p.x,y:row*22+p.y}))[0];
   path.id='word-'+row+'-'+pieces.length;
   x=bezierBounds([path]).maxX+space;
   pieces.push(path);
  }
  const span=pieces.length?bezierBounds(pieces).width:0;
  widest=Math.max(widest,span);
  return {pieces,span};
 });
 for(const {pieces,span} of groups){
  const shift=(widest-span)*(align==='center'?.5:align==='right'?1:0);
  const line=transformPaths(pieces,p=>({x:p.x+shift,y:p.y}));
  if(!perWord&&line.length){const joined=line[0];for(const next of line.slice(1)){const a=joined.nodes.at(-1)!,b=next.nodes[0],dx=(b.p.x-a.p.x)/3;a.out={x:a.p.x+dx,y:a.p.y};b.in={x:b.p.x-dx,y:b.p.y};joined.nodes.push(...next.nodes);}paths.push(joined);}
  else paths.push(...line);
 }
 const box=bezierBounds(paths),scale=width/box.width;
 return transformPaths(paths,p=>({x:(p.x-box.minX)*scale,y:(p.y-box.minY)*scale})).map(p=>pathData(p)).join(' ');
}
import { bounds,type Point,type Project } from '../core/types';
import { joinPaths,lerp,node,parseCenterline,sampleBezier,transformPaths,type BezierPath } from '../vector/bezier';
type Pair=[number,number];
// Original pen skeletons: a glyph has entry/exit ports on the baseline.
// Auxiliary bars/dots remain separate LED elements. No font outline is used.
const skeletons:Record<string,Pair[]>={
 S:[[0,0],[4,3],[14,4],[17,9],[9,12],[3,16],[4,22],[14,24],[20,20],[24,2],[28,0]],
 a:[[0,0],[3,4],[4,9],[10,12],[16,10],[18,5],[15,1],[10,1],[6,-6],[14,-10],[26,-6],[30,0]],
 b:[[0,0],[4,4],[8,20],[12,22],[16,18],[13,8],[10,3],[16,2],[22,7],[20,11],[15,11],[25,0]],
 c:[[0,0],[3,4],[8,10],[14,10],[12,7],[7,6],[6,2],[11,0],[20,0]],
 d:[[0,0],[2,6],[6,10],[11,8],[13,4],[11,1],[7,1],[6,4],[10,7],[16,20],[20,22],[22,17],[19,4],[24,0]],
 e:[[0,0],[5,4],[12,8],[13,11],[8,12],[4,8],[5,3],[12,0],[20,0]],
 f:[[0,0],[4,5],[8,20],[13,23],[17,20],[15,11],[10,0],[8,-13],[12,-16],[18,-12],[23,0]],
 g:[[0,0],[2,6],[6,10],[11,8],[13,4],[10,1],[6,2],[8,7],[16,10],[19,2],[16,-12],[11,-16],[9,-12],[24,0]],
 h:[[0,0],[3,5],[7,20],[11,22],[15,18],[12,7],[9,2],[13,8],[18,11],[23,8],[24,3],[28,0]],
 i:[[0,0],[4,4],[7,9],[10,7],[10,3],[14,0],[18,0]],
 j:[[0,0],[4,5],[8,9],[11,5],[10,-10],[6,-15],[3,-12],[17,0]],
 k:[[0,0],[4,5],[8,20],[12,22],[16,18],[12,5],[15,9],[20,12],[24,9],[19,5],[25,0],[29,0]],
 l:[[0,0],[4,4],[8,18],[12,22],[16,18],[14,6],[16,1],[22,0]],
 m:[[0,0],[3,7],[8,11],[13,7],[14,2],[17,0],[20,7],[25,11],[30,7],[31,2],[36,0]],
 n:[[0,0],[3,7],[8,11],[13,8],[15,3],[20,0]],
 o:[[0,0],[3,6],[7,10],[13,9],[16,5],[14,1],[9,1],[7,4],[11,6],[20,0]],
 p:[[0,0],[3,5],[8,11],[14,11],[18,7],[15,3],[9,3],[6,-10],[10,-16],[16,-12],[21,-3],[25,0]],
 q:[[0,0],[3,6],[7,10],[13,9],[16,5],[14,1],[9,1],[8,4],[14,7],[20,4],[20,-13],[24,-15],[28,0]],
 r:[[0,0],[4,5],[7,11],[11,13],[16,10],[14,6],[17,2],[23,0]],
 s:[[0,0],[5,4],[11,11],[14,10],[11,6],[6,5],[7,1],[14,0],[20,0]],
 t:[[0,0],[4,4],[8,17],[12,20],[15,16],[13,6],[15,1],[21,0]],
 u:[[0,0],[4,3],[6,10],[9,12],[11,8],[10,3],[14,0],[19,3],[22,10],[25,12],[27,8],[26,3],[31,0]],
 v:[[0,0],[4,4],[7,11],[10,10],[10,3],[14,0],[19,5],[23,12],[27,0]],
 w:[[0,0],[4,4],[6,11],[9,10],[9,3],[13,0],[17,4],[19,10],[22,10],[22,3],[26,0],[32,12],[36,0]],
 x:[[0,0],[5,3],[8,10],[11,11],[14,5],[19,1],[24,0]],
 y:[[0,0],[4,4],[6,11],[10,12],[12,8],[11,3],[16,1],[20,7],[23,11],[26,8],[25,-8],[28,-17],[34,-16],[38,-4],[43,0]],
 z:[[0,0],[4,7],[10,11],[17,10],[15,7],[7,1],[12,0],[21,0]],
};
const auxiliary:Record<string,Pair[][]>={t:[[[19,11],[26,11]]],f:[[[21,12],[28,12]]],i:[[[8,18],[12,18]]],j:[[[9,18],[13,18]]],x:[[[2,10],[5,7]],[[17,10],[21,14]]]};
export type ContextRecord={character:string;previous:string|null;next:string|null;form:'initial'|'medial'|'final'|'isolated';variant:string};
function spline(points:Point[],id:string):BezierPath{
  // Uniform quadratic rounding trades exact interpolation for broad, C1 turns.
  // Horizontal lead-in/out segments preserve baseline ports between glyphs.
  const source=[points[0],{x:2,y:0},...points.slice(1,-1),{x:points.at(-1)!.x-2,y:0},points.at(-1)!];
  const nodes=[node(source[0])];
  const line=(p:Point)=>{const a=nodes.at(-1)!,b=node(p);a.out=lerp(a.p,p,1/3);b.in=lerp(a.p,p,2/3);nodes.push(b);};
  line(lerp(source[0],source[1],.5));
  for(let i=1;i<source.length-1;i++){const a=nodes.at(-1)!,b=node(lerp(source[i],source[i+1],.5));a.out=lerp(a.p,source[i],2/3);b.in=lerp(b.p,source[i],2/3);nodes.push(b);}
  line(source.at(-1)!);
  // Match full derivative vectors, not only their directions, at lead-in/out.
  nodes[1].in=lerp(nodes[1].p,source[1],-2/3);
  nodes.at(-2)!.out=lerp(nodes.at(-2)!.p,source.at(-2)!,-2/3);
  return {id,nodes,role:'main'};

}
export function contextualLettering(p:Project):{curves:BezierPath[];notes:string[];context:ContextRecord[]}{
  const variant=p.variant||'fluida',spec=variant==='aperta'?{height:.9,tension:.22,spread:1.13,gap:7}:variant==='slanciata'?{height:1.35,tension:.31,spread:.95,gap:5}:{height:1.1,tension:.28,spread:1,gap:5};
  let cursor=0,word:BezierPath|undefined;const main:BezierPath[]=[],extras:BezierPath[]=[],notes:string[]=[],context:ContextRecord[]=[];
  const chars=[...p.text];
  chars.forEach((char,i)=>{
    if(/\s/.test(char)){cursor+=18*p.spacing;word=undefined;return;}
    const key=char==='S'?'S':char.toLowerCase(),template=skeletons[key],previous=i&& !/\s/.test(chars[i-1])?chars[i-1]:null,next=i<chars.length-1&&!/\s/.test(chars[i+1])?chars[i+1]:null,form=previous?next?'medial':'final':next?'initial':'isolated';
    context.push({character:char,previous:previous||null,next,form,variant});
    if(!template){const ds=char==='-'?['M0 6 L10 6']:char==='.'?['M0 0 L4 0']:char==='!'?['M0 20 L0 6','M0 0 L4 0']:null;if(ds){extras.push(...ds.flatMap((d,j)=>transformPaths(parseCenterline(d,`symbol-${i}-${j}`),q=>({x:q.x+cursor,y:q.y}))));cursor+=15;word=undefined;}else{notes.push(`Carattere «${char}» non disponibile.`);word=undefined;}return;}
    const maxX=Math.max(...template.map(q=>q[0])),advance=maxX*spec.spread+spec.gap*p.spacing;
    const stretch=(previous&&/[lmh]/i.test(previous)?1.03:1)*(next&&/[aeou]/i.test(next)?.98:1);
    let points=template.map(([x,y])=>({x:x*spec.spread,y:y*spec.height*stretch}));
    // Optional open-counter contextual forms alter internal anchors, preserving ports.
    if(variant==='aperta'&&'aodg'.includes(key))points=points.map((q,j)=>({...q,y:q.y*(j>3&&j<points.length-2?.8:1)}));
    points.push({x:advance,y:0});
    const letter=transformPaths([spline(points,`word-${i}`)],q=>({x:q.x+cursor,y:q.y}))[0];
    if(word){const combined=joinPaths(word,letter);Object.assign(word,combined);}else{word=letter;main.push(word);if(p.swashes){const start=word.nodes[0],old=start.p;start.in={x:old.x-1/3,y:old.y};word.nodes.unshift({p:{x:old.x-7,y:-3},in:{x:old.x-7,y:-3},out:{x:old.x-3,y:-3}});}}
    for(const [j,bar] of (auxiliary[key]||[]).entries()){const ds=`M${bar[0][0]*spec.spread+cursor} ${bar[0][1]*spec.height} L${bar[1][0]*spec.spread+cursor} ${bar[1][1]*spec.height}`;extras.push({...parseCenterline(ds,`aux-${i}-${j}`)[0],role:'auxiliary'});}
    if(!next&&p.swashes){const last=word.nodes.at(-1)!,x=last.p.x;last.out={x:x+1/3,y:0};word.nodes.push({p:{x:x+10,y:4},in:{x:x+6,y:4},out:{x:x+10,y:4}});}
    cursor+=advance;
  });
  let curves=[...main,...extras];const shear=Math.tan(p.slant*Math.PI/180),proportion=p.proportion||1;
  curves=transformPaths(curves,q=>({x:q.x+q.y*shear,y:q.y*proportion}));
  const b=bounds(sampleBezier(curves,.02,4)),scale=b.width?p.width/b.width:1;
  return {curves:transformPaths(curves,q=>({x:(q.x-b.minX)*scale,y:(q.y-b.minY)*scale})),notes:[...new Set(notes)],context};
}

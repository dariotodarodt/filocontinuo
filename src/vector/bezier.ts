import { distance, type Point, type Stroke } from '../core/types';
export type BezierNode={p:Point;in:Point;out:Point};
export type BezierPath={id:string;nodes:BezierNode[];closed?:boolean;role?:'main'|'auxiliary'};
export const lerp=(a:Point,b:Point,t:number):Point=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});
export const node=(p:Point):BezierNode=>({p:{...p},in:{...p},out:{...p}});
export function cubic(a:Point,b:Point,c:Point,d:Point,t:number):Point{const u=1-t;return {x:u*u*u*a.x+3*u*u*t*b.x+3*u*t*t*c.x+t*t*t*d.x,y:u*u*u*a.y+3*u*u*t*b.y+3*u*t*t*c.y+t*t*t*d.y};}
export function splitCubic(a:Point,b:Point,c:Point,d:Point,t=.5){const ab=lerp(a,b,t),bc=lerp(b,c,t),cd=lerp(c,d,t),abc=lerp(ab,bc,t),bcd=lerp(bc,cd,t),mid=lerp(abc,bcd,t);return [[a,ab,abc,mid],[mid,bcd,cd,d]] as [Point[],Point[]];}
function pointSegment(p:Point,a:Point,b:Point){const dx=b.x-a.x,dy=b.y-a.y,l=dx*dx+dy*dy,t=l?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/l)):0;return distance(p,{x:a.x+t*dx,y:a.y+t*dy});}
// Convex hull bound: every curve point lies within tolerance of its chord.
// A leaf also has a maximum chord length for subsequent collision analysis.
export function sampleBezier(paths:BezierPath[],tolerance=.03,maxStep=2):Stroke[]{
  if(!(tolerance>0)||!(maxStep>0))throw Error('Tolleranza di campionamento non valida.');let count=0;
  return paths.filter(p=>p.nodes.length>1).map(path=>{
    const points:Point[]=[{...path.nodes[0].p}];
    const recur=(a:Point,b:Point,c:Point,d:Point,depth:number)=>{
      if(++count>250000)throw Error('Percorso troppo complesso: oltre 250.000 suddivisioni.');
      if(Math.max(pointSegment(b,a,d),pointSegment(c,a,d))<=tolerance&&distance(a,d)<=maxStep){if(distance(points.at(-1)!,d)>1e-8)points.push({...d});return;}
      if(depth>=24)throw Error('Impossibile raggiungere la tolleranza di campionamento.');
      const [l,r]=splitCubic(a,b,c,d);recur(l[0],l[1],l[2],l[3],depth+1);recur(r[0],r[1],r[2],r[3],depth+1);
    };
    for(let i=0;i<path.nodes.length-(path.closed?0:1);i++){const a=path.nodes[i],b=path.nodes[(i+1)%path.nodes.length];recur(a.p,a.out,b.in,b.p,0);}
    return {points,closed:path.closed};
  });
}
export function parseCenterline(d:string,id='path'):BezierPath[]{
  const ts=d.match(/[MLCQZ]|[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/gi)||[];let i=0,current:BezierPath|undefined;const result:BezierPath[]=[];
  const point=()=>{const p={x:Number(ts[i++]),y:Number(ts[i++])};if(!Number.isFinite(p.x)||!Number.isFinite(p.y))throw Error('Coordinate non valide.');return p;};
  while(i<ts.length){const cmd=ts[i++];if(cmd==='M'){current={id:`${id}-${result.length}`,nodes:[node(point())]};result.push(current);continue;}if(!current)throw Error('Percorso senza punto iniziale.');const a=current.nodes.at(-1)!;
    if(cmd==='L'){const b=node(point());a.out=lerp(a.p,b.p,1/3);b.in=lerp(a.p,b.p,2/3);current.nodes.push(b);}
    else if(cmd==='C'){a.out=point();const incoming=point(),b=node(point());b.in=incoming;current.nodes.push(b);}
    else if(cmd==='Q'){const q=point(),b=node(point());a.out=lerp(a.p,q,2/3);b.in=lerp(b.p,q,2/3);current.nodes.push(b);}
    else if(cmd==='Z'){current.closed=true;}else throw Error(`Comando non supportato: ${cmd}`);
  }return result.filter(p=>p.nodes.length>1);
}
export function fromStrokes(strokes:Stroke[]):BezierPath[]{return strokes.map((s,i)=>{const pts=s.closed&&distance(s.points[0],s.points.at(-1)!)<1e-6?s.points.slice(0,-1):s.points;return {id:`import-${i}`,closed:s.closed,nodes:pts.map((p,j)=>({p:{...p},in:lerp(p,pts[j-1]||p,1/3),out:lerp(p,pts[j+1]||p,1/3)}))};});}
export function transformPaths(paths:BezierPath[],fn:(p:Point)=>Point):BezierPath[]{return paths.map(p=>({...p,nodes:p.nodes.map(n=>({p:fn(n.p),in:fn(n.in),out:fn(n.out)}))}));}
export function pathData(path:BezierPath,flipY=false){const f=(p:Point)=>`${p.x} ${flipY?-p.y:p.y}`;let d=`M${f(path.nodes[0].p)}`;for(let i=0;i<path.nodes.length-(path.closed?0:1);i++){const a=path.nodes[i],b=path.nodes[(i+1)%path.nodes.length];d+=` C${f(a.out)} ${f(b.in)} ${f(b.p)}`;}return d+(path.closed?' Z':'');}
export function insertNode(path:BezierPath,segment:number,t=.5):BezierPath{
  const p=structuredClone(path),a=p.nodes[segment],b=p.nodes[(segment+1)%p.nodes.length];if(!a||!b||(!p.closed&&segment===p.nodes.length-1))return p;
  const [l,r]=splitCubic(a.p,a.out,b.in,b.p,t);a.out=l[1];b.in=r[2];p.nodes.splice(segment+1,0,{p:l[3],in:l[2],out:r[1]});return p;
}
export function moveControl(path:BezierPath,index:number,kind:'p'|'in'|'out',target:Point):BezierPath{
  const p=structuredClone(path),n=p.nodes[index];if(!n)return p;if(kind==='p'){const dx=target.x-n.p.x,dy=target.y-n.p.y;n.in={x:n.in.x+dx,y:n.in.y+dy};n.out={x:n.out.x+dx,y:n.out.y+dy};}n[kind]={...target};return p;
}
export function deleteNode(path:BezierPath,index:number){if(path.nodes.length<=2)throw Error('Servono almeno due nodi per percorso.');const p=structuredClone(path);p.nodes.splice(index,1);return p;}
export function splitPath(path:BezierPath,index:number):BezierPath[]{if(path.closed||index<=0||index>=path.nodes.length-1)throw Error('Separare un percorso aperto in un nodo interno.');return [{...structuredClone(path),nodes:structuredClone(path.nodes.slice(0,index+1))},{...structuredClone(path),id:path.id+'-split',nodes:structuredClone(path.nodes.slice(index))}];}
export function joinPaths(a:BezierPath,b:BezierPath):BezierPath{if(a.closed||b.closed)throw Error('Unire solo percorsi aperti.');const p=structuredClone(a),q=structuredClone(b);const end=p.nodes.at(-1)!,start=q.nodes[0];if(distance(end.p,start.p)<1e-6){end.out=start.out;p.nodes.push(...q.nodes.slice(1));}else{end.out=lerp(end.p,start.p,1/3);start.in=lerp(end.p,start.p,2/3);p.nodes.push(...q.nodes);}return p;}
export function rotateScale(path:BezierPath,degrees:number,scale:number):BezierPath{if(!Number.isFinite(scale)||scale<=0||scale>10)throw Error('Scala tra 0 e 10.');const c=path.nodes.reduce((s,n)=>({x:s.x+n.p.x/path.nodes.length,y:s.y+n.p.y/path.nodes.length}),{x:0,y:0}),a=degrees*Math.PI/180;return transformPaths([path],p=>({x:c.x+scale*((p.x-c.x)*Math.cos(a)-(p.y-c.y)*Math.sin(a)),y:c.y+scale*((p.x-c.x)*Math.sin(a)+(p.y-c.y)*Math.cos(a))}))[0];}
export function reversePath(path:BezierPath):BezierPath{return {...structuredClone(path),nodes:[...path.nodes].reverse().map(n=>({p:{...n.p},in:{...n.out},out:{...n.in}}))};}
export function openPath(path:BezierPath,index:number):BezierPath{if(!path.closed||index<0||index>=path.nodes.length)throw Error('Selezionare un nodo di un percorso chiuso.');const nodes=structuredClone([...path.nodes.slice(index),...path.nodes.slice(0,index)]);nodes.push(structuredClone(nodes[0]));return {...structuredClone(path),closed:false,nodes};}

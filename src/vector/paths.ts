import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { distance, type Stroke } from '../core/types';
import { CubicBezierCurve,QuadraticBezierCurve,LineCurve } from 'three';
import { insertNode,lerp,node,type BezierPath } from './bezier';

export function samplePath(d:string): Stroke[] {
  // SVGLoader depends on DOMParser in browsers; pure sampling below also runs in Node tests.
  const tokens=d.match(/[MLCQZ]|-?\d*\.?\d+/gi) || [];
  let i=0,x=0,y=0,points: Stroke['points']=[]; const strokes:Stroke[]=[];
  const n=()=>Number(tokens[i++]);
  while(i<tokens.length){
    const cmd=tokens[i++].toUpperCase();
    if(cmd==='M'){if(points.length>1)strokes.push({points});x=n();y=n();points=[{x,y}];}
    else if(cmd==='L'){x=n();y=n();points.push({x,y});}
    else if(cmd==='C'||cmd==='Q'){
      const a={x:n(),y:n()},b={x:n(),y:n()},c=cmd==='C'?{x:n(),y:n()}:b, start={x,y};
      const length=distance(start,a)+distance(a,b)+(cmd==='C'?distance(b,c):0); const steps=Math.max(8,Math.ceil(length/0.5));
      for(let j=1;j<=steps;j++){const t=j/steps,u=1-t;points.push(cmd==='C'?{x:u*u*u*x+3*u*u*t*a.x+3*u*t*t*b.x+t*t*t*c.x,y:u*u*u*y+3*u*u*t*a.y+3*u*t*t*b.y+t*t*t*c.y}:{x:u*u*x+2*u*t*a.x+t*t*b.x,y:u*u*y+2*u*t*a.y+t*t*b.y});} x=c.x;y=c.y;
    }else throw Error(`Comando vettoriale non supportato: ${cmd}`);
  }
  if(points.length>1)strokes.push({points});return strokes;
}
export function importSVG(text:string):Stroke[]{
  if(text.length>2_000_000)throw Error('SVG troppo grande (massimo 2 MB).');
  const doc=new DOMParser().parseFromString(text,'image/svg+xml');
  if(doc.querySelector('parsererror')||doc.documentElement.localName!=='svg')throw Error('SVG non valido.');
  if(doc.querySelector('text,use,image,script,foreignObject'))throw Error('Convertire testi e istanze in percorsi; immagini e script non sono supportati.');
  const parsed=new SVGLoader().parse(text); const strokes:Stroke[]=[];
  for(const path of parsed.paths)for(const sub of path.subPaths){
    const points=sub.getPoints(20).map(q=>({x:q.x,y:-q.y})).filter((q,i,a)=>i===0||distance(q,a[i-1])>0.001);
    const closed=sub.autoClose||distance(points[0],points.at(-1)!)<0.001;
    if(closed&&distance(points[0],points.at(-1)!)>0.001)points.push({...points[0]});
    if(points.length>1)strokes.push({points,closed});
  }
  if(!strokes.length||strokes.length>200||strokes.reduce((n,s)=>n+s.points.length,0)>15000)throw Error('SVG vuoto o troppo complesso (massimo 200 percorsi / 15.000 punti).');
  return strokes;
}
export function importSVGCurves(text:string):BezierPath[]{
  // Reuse the V0.1 XML/security validation, but retain original polynomial controls.
  importSVG(text);
  const result:BezierPath[]=[];
  for(const path of new SVGLoader().parse(text).paths)for(const sub of path.subPaths){
    const nodes:BezierPath['nodes']=[],flip=(q:{x:number;y:number})=>({x:q.x,y:-q.y});
    for(const curve of sub.curves){
      if(!(curve instanceof CubicBezierCurve||curve instanceof QuadraticBezierCurve||curve instanceof LineCurve))throw Error('SVG con archi/ellissi: convertire in curve Bézier cubiche prima dell’importazione V0.2.');
      const start=flip(curve.getPoint(0)),end=flip(curve.getPoint(1));if(!nodes.length)nodes.push(node(start));const a=nodes.at(-1)!,b=node(end);
      if(curve instanceof CubicBezierCurve){a.out=flip(curve.v1);b.in=flip(curve.v2);}
      else if(curve instanceof QuadraticBezierCurve){const q=flip(curve.v1);a.out=lerp(a.p,q,2/3);b.in=lerp(b.p,q,2/3);}
      else{a.out=lerp(a.p,b.p,1/3);b.in=lerp(a.p,b.p,2/3);}nodes.push(b);
    }
    if(nodes.length<2)continue;const explicitClosing=distance(nodes[0].p,nodes.at(-1)!.p)<1e-6,closed=sub.autoClose||explicitClosing;
    if(explicitClosing){nodes[0].in=nodes.at(-1)!.in;nodes.pop();}
    if(closed&&!explicitClosing){nodes.at(-1)!.out=lerp(nodes.at(-1)!.p,nodes[0].p,1/3);nodes[0].in=lerp(nodes.at(-1)!.p,nodes[0].p,2/3);}
    let curve:BezierPath={id:`svg-${result.length}`,nodes,closed};if(closed&&nodes.length===1)curve=insertNode(curve,0);result.push(curve);
  }
  if(result.reduce((n,p)=>n+p.nodes.length,0)>5000)throw Error('Massimo 5.000 nodi Bézier importati.');
  return result;
}

import ClipperLib from 'clipper-lib';
import earcut from 'earcut';
import { BufferGeometry, Float32BufferAttribute } from 'three';
import { distance, validateParameters, type Stroke, type Parameters, type Point } from '../core/types';
type Path=ClipperLib.IntPoint[];
const SCALE=1000;
export type Channel = { positions:number[]; geometry:BufferGeometry; outer:Path[]; inner:Path[]; validation:ReturnType<typeof validateMesh>; width:number; height:number; depth:number };
function clean(paths:Path[]):Path[]{
  return ClipperLib.Clipper.CleanPolygons(paths,1).filter(p=>p.length>=3&&Math.abs(ClipperLib.Clipper.Area(p))>1);
}
export function offset(strokes:Stroke[],r:number):Path[]{
  const o=new ClipperLib.ClipperOffset(2,15);
  for(const s of strokes){
    let p=s.points.map(q=>({X:Math.round(q.x*SCALE),Y:Math.round(q.y*SCALE)})).filter((q,i,a)=>!i||q.X!==a[i-1].X||q.Y!==a[i-1].Y);
    if(p.length<2)continue;
    const closed=s.closed||distance(s.points[0],s.points.at(-1)!)<0.001;
    if(closed && p[0].X===p.at(-1)!.X&&p[0].Y===p.at(-1)!.Y)p=p.slice(0,-1);
    o.AddPath(p,ClipperLib.JoinType.jtRound,closed?ClipperLib.EndType.etClosedLine:ClipperLib.EndType.etOpenRound);
  }
  const result:Path[]=[];o.Execute(result,r*SCALE);return clean(result);
}
export function boolean(a:Path[],b:Path[],type:ClipperLib.ClipType):Path[]{
  const c=new ClipperLib.Clipper();c.AddPaths(a,ClipperLib.PolyType.ptSubject,true);
  c.AddPaths(b,ClipperLib.PolyType.ptClip,true); const result:Path[]=[];
  c.Execute(type,result,ClipperLib.PolyFillType.pftNonZero,ClipperLib.PolyFillType.pftNonZero);return clean(result);
}
function groups(paths:Path[]){
  const outers=paths.filter(p=>ClipperLib.Clipper.Area(p)>0).map(p=>({outer:p,holes:[] as Path[]}));
  for(const h of paths.filter(p=>ClipperLib.Clipper.Area(p)<0)){
    const owner=outers.filter(o=>ClipperLib.Clipper.PointInPolygon(h[0],o.outer)!==0).sort((a,b)=>Math.abs(ClipperLib.Clipper.Area(a.outer))-Math.abs(ClipperLib.Clipper.Area(b.outer)))[0];
    if(!owner)throw Error('Contorno interno senza contorno esterno.');owner.holes.push(h);
  }return outers;
}
export function buildChannel(strokes:Stroke[],p:Parameters):Channel {
  validateParameters(p);if(!strokes.length)throw Error('Inserisci un testo o importa un percorso SVG.');
  const inner=offset(strokes,(p.ledWidth+p.tolerance)/2),outer=offset(strokes,(p.ledWidth+p.tolerance)/2+p.wall);
  return buildFromContours(outer,inner,p.floor,p.wallHeight);
}
export function buildFromContours(outer:Path[],inner:Path[],floor:number,wallHeight:number):Channel {
  const rim=boolean(outer,inner,ClipperLib.ClipType.ctDifference),positions:number[]=[];
  const triangle=(a:number[],b:number[],c:number[])=>positions.push(...a,...b,...c);
  const cap=(paths:Path[],z:number,up:boolean)=>{
    for(const g of groups(paths)){
      const flat:number[]=[],holes:number[]=[];
      for(const [i,path] of [g.outer,...g.holes].entries()){if(i)holes.push(flat.length/2);for(const v of path)flat.push(v.X/SCALE,v.Y/SCALE);}
      const ix=earcut(flat,holes,2);
      for(let i=0;i<ix.length;i+=3){let [a,b,c]=ix.slice(i,i+3).map(j=>[flat[j*2],flat[j*2+1],z]);const cross=(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);if((cross>0)!==up)[b,c]=[c,b];triangle(a,b,c);}
    }
  };
  const sides=(paths:Path[],z0:number,z1:number,inward:boolean)=>{
    for(const path of paths)for(let i=0;i<path.length;i++){
      const a=path[i],b=path[(i+1)%path.length],a0=[a.X/SCALE,a.Y/SCALE,z0],b0=[b.X/SCALE,b.Y/SCALE,z0],a1=[a0[0],a0[1],z1],b1=[b0[0],b0[1],z1];
      if(inward){triangle(a0,b1,b0);triangle(a0,a1,b1);}else{triangle(a0,b0,b1);triangle(a0,b1,a1);}
    }
  };
  const H=floor+wallHeight;
  cap(outer,0,false);cap(rim,H,true);cap(inner,floor,true);sides(outer,0,H,false);sides(inner,floor,H,true);
  const geometry=new BufferGeometry();geometry.setAttribute('position',new Float32BufferAttribute(positions,3));geometry.computeVertexNormals();geometry.computeBoundingBox();
  // Validate the exact float32 positions used by both viewer and exports.
  const actual=Array.from(geometry.attributes.position.array),validation=validateMesh(actual),box=geometry.boundingBox!;
  return {positions:actual,geometry,outer,inner,validation,width:box.max.x-box.min.x,height:box.max.y-box.min.y,depth:H};
}
export function validateMesh(p:number[]){
  const edges=new Map<string,{count:number;balance:number}>();
  const links=new Map<string, [string,string][]>(); let degenerate=0,volume=0;
  const id=(v:number[])=>v.map(n=>Math.round(n*10000)).join(',');
  for(let i=0;i<p.length;i+=9){
    const a=p.slice(i,i+3),b=p.slice(i+3,i+6),c=p.slice(i+6,i+9);
    const u=b.map((n,j)=>n-a[j]),v=c.map((n,j)=>n-a[j]),cross=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
    if(Math.hypot(...cross)<1e-8||![...a,...b,...c].every(Number.isFinite))degenerate++;
    volume+=(a[0]*(b[1]*c[2]-b[2]*c[1])+a[1]*(b[2]*c[0]-b[0]*c[2])+a[2]*(b[0]*c[1]-b[1]*c[0]))/6;
    const ids=[id(a),id(b),id(c)];for(let j=0;j<3;j++){const a=ids[j],b=ids[(j+1)%3],key=[a,b].sort().join('|'),e=edges.get(key)||{count:0,balance:0};e.count++;e.balance+=a<b?1:-1;edges.set(key,e);const fan=links.get(a)||[];fan.push([b,ids[(j+2)%3]]);links.set(a,fan);}
  }
  const boundary=[...edges.values()].filter(e=>e.count===1).length,nonManifold=[...edges.values()].filter(e=>e.count!==2).length,inconsistent=[...edges.values()].filter(e=>e.balance!==0).length;
  let nonManifoldVertices=0;
  for(const fan of links.values()){
    const graph=new Map<string,string[]>();for(const [a,b] of fan){graph.set(a,[...(graph.get(a)||[]),b]);graph.set(b,[...(graph.get(b)||[]),a]);}
    const seen=new Set<string>(),stack=[graph.keys().next().value!];while(stack.length){const v=stack.pop()!;if(seen.has(v))continue;seen.add(v);stack.push(...(graph.get(v)||[]).filter(n=>!seen.has(n)));}
    if(seen.size!==graph.size||[...graph.values()].some(v=>v.length!==2))nonManifoldVertices++;
  }
  return {valid:p.length>0&&!degenerate&&!nonManifold&&!nonManifoldVertices&&!inconsistent&&volume>0,triangles:p.length/9,boundary,nonManifold,nonManifoldVertices,inconsistent,degenerate,volume};
}


import type {Point} from '../../core/types';
/** Distanza osservata tra rami della polilinea. Il filtro usa lo sviluppo
 * lungo la curva, indipendentemente da glifi e numero di nodi Bézier. */
export function measuredGap(points:Point[],radius:number){
 const along=[0];
 for(let i=1;i<points.length;i++)along.push(along[i-1]+Math.hypot(points[i].x-points[i-1].x,points[i].y-points[i-1].y));
 let minimum=Infinity;
 for(let i=1;i<points.length;i++)for(let j=i+2;j<points.length;j++){
  if(along[j]-along[i-1]<Math.PI*radius/2)continue;
  const a=points[i-1],b=points[i],c=points[j-1],d=points[j];
  if(Math.max(a.x,b.x)+minimum<Math.min(c.x,d.x))continue;
  const cross=(p:Point,q:Point,r:Point)=>(q.x-p.x)*(r.y-p.y)-(q.y-p.y)*(r.x-p.x);
  if(cross(a,b,c)*cross(a,b,d)<0&&cross(c,d,a)*cross(c,d,b)<0)return 0;
  minimum=Math.min(minimum,pointSegment(a,c,d),pointSegment(b,c,d),pointSegment(c,a,b),pointSegment(d,a,b));
 }
 return Number.isFinite(minimum)?minimum:null;
}
 function pointSegment(p:Point,a:Point,b:Point){
  const dx=b.x-a.x,dy=b.y-a.y;
  const t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1)));
  return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);
 }

export function compositionGap(strokes:{points:Point[];closed?:boolean}[],radius:number){
 if(!strokes.length||strokes.some(s=>s.closed||s.points.length<2)||strokes.reduce((n,s)=>n+s.points.length,0)>4000)return null;
 let minimum=Infinity;
 for(const [i,stroke] of strokes.entries()){
  const local=measuredGap(stroke.points,radius);
  if(local!==null)minimum=Math.min(minimum,local);
  for(const other of strokes.slice(0,i))for(let j=1;j<stroke.points.length;j++)for(let k=1;k<other.points.length;k++){
   const a=stroke.points[j-1],b=stroke.points[j],c=other.points[k-1],d=other.points[k];
   const side=(p:Point,q:Point,r:Point)=>(q.x-p.x)*(r.y-p.y)-(q.y-p.y)*(r.x-p.x);
   if(side(a,b,c)*side(a,b,d)<0&&side(c,d,a)*side(c,d,b)<0)return 0;
   minimum=Math.min(minimum,pointSegment(a,c,d),pointSegment(b,c,d),pointSegment(c,a,b),pointSegment(d,a,b));
  }
 }
 return Number.isFinite(minimum)?minimum:null;
}
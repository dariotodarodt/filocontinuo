import { type Point } from '../core/types';
import { cubic,splitCubic } from '../vector/bezier';
export type CurvatureCheck={lowerBound:number;observed:number;t:number;unresolved:boolean;singular:boolean;leaves:number};
const cross=(a:Point,b:Point)=>a.x*b.y-a.y*b.x;
const norm=(a:Point)=>Math.hypot(a.x,a.y);
export function radiusAt(a:Point,b:Point,c:Point,d:Point,t:number){const u=1-t,v={x:3*(u*u*(b.x-a.x)+2*u*t*(c.x-b.x)+t*t*(d.x-c.x)),y:3*(u*u*(b.y-a.y)+2*u*t*(c.y-b.y)+t*t*(d.y-c.y))},acc={x:6*(u*(c.x-2*b.x+a.x)+t*(d.x-2*c.x+b.x)),y:6*(u*(c.y-2*b.y+a.y)+t*(d.y-2*c.y+b.y))};const speed=norm(v);return speed<1e-12?0:Math.abs(cross(v,acc))<1e-20?Infinity:speed**3/Math.abs(cross(v,acc));}
// Bernstein derivative controls enclose every velocity and acceleration.
// The box distance to the origin bounds speed below; pairwise cross products
// bound |v x a| above. Subdivision tightens both enclosures, endpoints included.
export function inspectCubic(points:Point[],minimum:number,maxDepth=12):CurvatureCheck{
  let lowerBound=Infinity,observed=Infinity,witness=0,unresolved=false,singular=false,leaves=0,visits=0;
  const walk=(p:Point[],t0:number,t1:number,depth:number)=>{
    const [a,b,c,d]=p,v=[{x:3*(b.x-a.x),y:3*(b.y-a.y)},{x:3*(c.x-b.x),y:3*(c.y-b.y)},{x:3*(d.x-c.x),y:3*(d.y-c.y)}],scale=Math.max(...v.map(norm));
    if(++visits>8192){unresolved=true;lowerBound=0;return;}
    if(scale<1e-10){singular=true;unresolved=true;lowerBound=0;observed=0;witness=t0;return;}
    const axis=v.find(q=>norm(q)>scale*1e-8)!,collinear=v.every(q=>Math.abs(cross(axis,q))<=norm(axis)*scale*1e-11),monotone=v.every(q=>q.x*axis.x+q.y*axis.y>=-scale*scale*1e-12);
    if(collinear&&monotone){leaves++;return;}
    let local=Infinity;
    for(const t of [0,.25,.5,.75,1]){const r=radiusAt(a,b,c,d,t);if(r<local)local=r;if(r<observed){observed=r;witness=t0+(t1-t0)*t;}if(r===0)singular=true;}
    const acc=[{x:2*(v[1].x-v[0].x),y:2*(v[1].y-v[0].y)},{x:2*(v[2].x-v[1].x),y:2*(v[2].y-v[1].y)}];
    const gap=(values:number[])=>{const lo=Math.min(...values),hi=Math.max(...values);return lo>0?lo:hi<0?-hi:0;};
    const speed=Math.hypot(gap(v.map(q=>q.x)),gap(v.map(q=>q.y))),maxCross=Math.max(...v.flatMap(q=>acc.map(r=>Math.abs(cross(q,r)))));
    const bound=maxCross>0?speed**3/maxCross:0;
    if(bound>=minimum*1.15||local<minimum||((bound>=minimum)&&bound>=local*.99)){lowerBound=Math.min(lowerBound,bound);leaves++;return;}
    if(depth>=maxDepth){lowerBound=Math.min(lowerBound,bound);if(bound<minimum)unresolved=true;leaves++;return;}
    const [left,right]=splitCubic(a,b,c,d);const mid=(t0+t1)/2;walk(left,t0,mid,depth+1);walk(right,mid,t1,depth+1);
  };
  walk(points,0,1,0);
  return {lowerBound,observed,t:witness,unresolved,singular,leaves};
}

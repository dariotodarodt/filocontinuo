import type {Point} from '../core/types';
import {cubic,type BezierPath} from './bezier';
function extrema(a:number,b:number,c:number,d:number){
 const A=-a+3*b-3*c+d,B=2*(a-2*b+c),C=b-a,epsilon=1e-12*Math.max(1,Math.abs(A),Math.abs(B),Math.abs(C));
 if(Math.abs(A)<epsilon)return Math.abs(B)<epsilon?[]:[-C/B];
 const disc=B*B-4*A*C;if(disc<0)return [];const root=Math.sqrt(disc),q=-.5*(B+(B<0?-root:root));return Math.abs(q)<epsilon?[-B/(2*A)]:[q/A,C/q];
}
// Bounds include analytic extrema of every cubic; source sampling error must not
// be multiplied by the final letter scale when enforcing a maximum dimension.
export function bezierBounds(paths:BezierPath[]){
 let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
 const add=(p:Point)=>{minX=Math.min(minX,p.x);maxX=Math.max(maxX,p.x);minY=Math.min(minY,p.y);maxY=Math.max(maxY,p.y);};
 for(const path of paths)for(let i=0;i<path.nodes.length-(path.closed?0:1);i++){
  const a=path.nodes[i],b=path.nodes[(i+1)%path.nodes.length];add(a.p);add(b.p);
  for(const t of [...extrema(a.p.x,a.out.x,b.in.x,b.p.x),...extrema(a.p.y,a.out.y,b.in.y,b.p.y)])if(t>0&&t<1)add(cubic(a.p,a.out,b.in,b.p,t));
 }
 if(minX===Infinity)return {minX:0,minY:0,maxX:0,maxY:0,width:0,height:0};return {minX,minY,maxX,maxY,width:maxX-minX,height:maxY-minY};
}

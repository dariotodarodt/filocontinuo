import { distance,type Parameters,type Point,type Stroke } from '../core/types';
import { cubic,type BezierPath } from '../vector/bezier';
export type Anomaly={id:string;kind:'raggio'|'cuspide'|'incrocio'|'sovrapposizione'|'distanza'|'tratto';severity:'warning'|'error';position:Point;pathIds:number[];segment:number;t:number;message:string;measured?:number;limit?:number;samples:number};
export function curvatureRadius(a:Point,b:Point,c:Point,d:Point,t:number){const u=1-t,dx=3*u*u*(b.x-a.x)+6*u*t*(c.x-b.x)+3*t*t*(d.x-c.x),dy=3*u*u*(b.y-a.y)+6*u*t*(c.y-b.y)+3*t*t*(d.y-c.y),ddx=6*u*(c.x-2*b.x+a.x)+6*t*(d.x-2*c.x+b.x),ddy=6*u*(c.y-2*b.y+a.y)+6*t*(d.y-2*c.y+b.y),speed=Math.hypot(dx,dy),cross=Math.abs(dx*ddy-dy*ddx);return speed<1e-8?0:cross<1e-10?Infinity:speed**3/cross;}
function closest(p:Point,a:Point,b:Point){const l=(b.x-a.x)**2+(b.y-a.y)**2,t=l?Math.max(0,Math.min(1,((p.x-a.x)*(b.x-a.x)+(p.y-a.y)*(b.y-a.y))/l)):0;const q={x:a.x+t*(b.x-a.x),y:a.y+t*(b.y-a.y)};return {distance:distance(p,q),point:q,t};}
export function diagnose(strokes:Stroke[],params:Parameters,curves?:BezierPath[],divider?:number){
  const anomalies:Anomaly[]=[],last=new Map<string,{anomaly:Anomaly;position:Point}>();let minRadius=Infinity;
  const width=params.ledWidth+params.tolerance+(divider??2*params.wall),margin=.5;
  const add=(a:Omit<Anomaly,'id'|'samples'>)=>{
    const key=a.kind+':'+a.pathIds.join(',')+':'+a.severity,old=last.get(key);
    if(old&&distance(old.position,a.position)<Math.max(width,2)){
      old.anomaly.samples++;old.position=a.position;
      if(a.measured!==undefined&&(old.anomaly.measured===undefined||a.measured<old.anomaly.measured)){Object.assign(old.anomaly,{...a,id:old.anomaly.id,samples:old.anomaly.samples});}return;
    }
    const anomaly={...a,id:`issue-${anomalies.length}`,samples:1};anomalies.push(anomaly);last.set(key,{anomaly,position:a.position});
  };
  if(curves)curves.forEach((path,pathIndex)=>{
    for(let i=0;i<path.nodes.length-(path.closed?0:1);i++){
      const a=path.nodes[i],b=path.nodes[(i+1)%path.nodes.length];
      // Radius is sampled analytically on the cubic, independently of flattening.
      for(let j=1;j<64;j++){const t=j/64,r=curvatureRadius(a.p,a.out,b.in,b.p,t);minRadius=Math.min(minRadius,r);if(r<params.minRadius*1.15)add({kind:'raggio',severity:r<params.minRadius?'error':'warning',position:cubic(a.p,a.out,b.in,b.p,t),pathIds:[pathIndex],segment:i,t,message:`Raggio ${r.toFixed(2)} mm / minimo ${params.minRadius} mm`,measured:r,limit:params.minRadius});}
    }
    path.nodes.forEach((n,i)=>{
      if(!path.closed&&(i===0||i===path.nodes.length-1))return;
      const prev=path.nodes[(i-1+path.nodes.length)%path.nodes.length],next=path.nodes[(i+1)%path.nodes.length];
      let u={x:n.p.x-n.in.x,y:n.p.y-n.in.y},v={x:n.out.x-n.p.x,y:n.out.y-n.p.y};
      if(Math.hypot(u.x,u.y)<1e-7)u={x:n.p.x-prev.p.x,y:n.p.y-prev.p.y};if(Math.hypot(v.x,v.y)<1e-7)v={x:next.p.x-n.p.x,y:next.p.y-n.p.y};
      const angle=Math.acos(Math.max(-1,Math.min(1,(u.x*v.x+u.y*v.y)/(Math.hypot(u.x,u.y)*Math.hypot(v.x,v.y)||1))))*180/Math.PI;
      if(angle>8)add({kind:'cuspide',severity:angle>20?'error':'warning',position:n.p,pathIds:[pathIndex],segment:i,t:0,message:`Cambio di tangente ${angle.toFixed(1)}° al nodo ${i+1}`,measured:angle,limit:20});
    });
  });
  let length=0;
  const segs:{a:Point;b:Point;path:number;index:number;along:number;total:number;closed:boolean}[]=[];
  strokes.forEach((s,path)=>{
    const points=s.closed&&distance(s.points[0],s.points.at(-1)!)>1e-6?[...s.points,s.points[0]]:s.points;
    const total=points.reduce((sum,p,i)=>sum+(i?distance(p,points[i-1]):0),0);let along=0;length+=total;
    if(total<params.ledWidth)add({kind:'tratto',severity:'error',position:points[0],pathIds:[path],segment:0,t:0,message:'Tratto più corto della larghezza del LED.',measured:total,limit:params.ledWidth});
    for(let i=1;i<points.length;i++){segs.push({a:points[i-1],b:points[i],path,index:i-1,along,total,closed:!!s.closed});along+=distance(points[i-1],points[i]);}
    if(!curves)for(let i=1;i<points.length-1;i++){const a=points[i-1],b=points[i],c=points[i+1],cross=Math.abs((b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x)),r=cross>1e-9?distance(a,b)*distance(b,c)*distance(c,a)/(2*cross):Infinity;minRadius=Math.min(minRadius,r);if(r<params.minRadius*1.15)add({kind:'raggio',severity:r<params.minRadius?'error':'warning',position:b,pathIds:[path],segment:i,t:0,message:`Raggio campionato ${r.toFixed(2)} mm`,measured:r,limit:params.minRadius});}
  });
  // Spatial hash keeps distant segments out of the collision pair loop.
  const cells=new Map<string,number[]>(),pairs=new Set<string>(),cellSize=Math.max(10,width+margin);
  for(let i=0;i<segs.length;i++){
    const a=segs[i],candidates=new Set<number>();
    const x0=Math.floor((Math.min(a.a.x,a.b.x)-width-margin)/cellSize),x1=Math.floor((Math.max(a.a.x,a.b.x)+width+margin)/cellSize),y0=Math.floor((Math.min(a.a.y,a.b.y)-width-margin)/cellSize),y1=Math.floor((Math.max(a.a.y,a.b.y)+width+margin)/cellSize);
    if((x1-x0+1)*(y1-y0+1)>100000)throw Error('Segmento troppo esteso per l’analisi.');
    for(let x=x0;x<=x1;x++)for(let y=y0;y<=y1;y++){const key=`${x},${y}`,list=cells.get(key)||[];for(const j of list)candidates.add(j);list.push(i);cells.set(key,list);}
    for(const j of candidates){const key=`${j}:${i}`;if(pairs.has(key))continue;pairs.add(key);const b=segs[j];
      const delta=Math.abs(a.along-b.along),arc=a.closed&&b.closed?Math.min(delta,a.total-delta):delta;
      if(a.path===b.path&&Math.abs(a.index-b.index)<=1)continue;
      const ax=a.b.x-a.a.x,ay=a.b.y-a.a.y,bx=b.b.x-b.a.x,by=b.b.y-b.a.y,den=ax*by-ay*bx,qx=b.a.x-a.a.x,qy=b.a.y-a.a.y;
      const ids=[...new Set([a.path,b.path])].sort((a,b)=>a-b),make=(kind:Anomaly['kind'],position:Point,message:string,measured?:number,severity:Anomaly['severity']='error')=>add({kind,severity,position,pathIds:ids,segment:a.index,t:0,message,measured,limit:kind==='distanza'?width:undefined});
      if(Math.abs(den)>1e-9){const t=(qx*by-qy*bx)/den,u=(qx*ay-qy*ax)/den;if(t>=0&&t<=1&&u>=0&&u<=1){if(a.path===b.path&&arc<width*1.5)continue;make('incrocio',{x:a.a.x+t*ax,y:a.a.y+t*ay},a.path===b.path?'Auto-intersezione del percorso.':'Incrocio tra percorsi.');continue;}}
      else if(Math.abs(qx*ay-qy*ax)<1e-7){const l=ax*ax+ay*ay,t0=(qx*ax+qy*ay)/(l||1),t1=t0+(bx*ax+by*ay)/(l||1),lo=Math.max(0,Math.min(t0,t1)),hi=Math.min(1,Math.max(t0,t1));if(hi-lo>1e-6){make('sovrapposizione',{x:a.a.x+(lo+hi)/2*ax,y:a.a.y+(lo+hi)/2*ay},'Tratti sovrapposti o ripassati.');continue;}}
      if(a.path===b.path&&arc<width*2)continue;
      const near=[{p:a.a,...closest(a.a,b.a,b.b)},{p:a.b,...closest(a.b,b.a,b.b)},{p:b.a,...closest(b.a,a.a,a.b)},{p:b.b,...closest(b.b,a.a,a.b)}].sort((a,b)=>a.distance-b.distance)[0];
      if(near.distance<width+margin)make('distanza',{x:(near.p.x+near.point.x)/2,y:(near.p.y+near.point.y)/2},`Distanza tra assi ${near.distance.toFixed(2)} mm / esterno ${width.toFixed(2)} mm`,near.distance,near.distance<width?'error':'warning');
    }
  }
  const errors=anomalies.filter(a=>a.severity==='error').length,warnings=anomalies.length-errors;
  return {anomalies,length,minRadius,errors,warnings,compatible:strokes.length>0&&errors===0,pathStatus:strokes.map((_,i)=>anomalies.some(a=>a.pathIds.includes(i)&&a.severity==='error')?'error':anomalies.some(a=>a.pathIds.includes(i))?'warning':'ok') as ('error'|'warning'|'ok')[]};
}

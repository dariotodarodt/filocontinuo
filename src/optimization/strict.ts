import { type Parameters,type Stroke,distance } from '../core/types';
import { cubic,type BezierPath } from '../vector/bezier';
import { diagnose,type Anomaly } from './diagnostics';
import { inspectCubic } from './curvature';
export type LedState='compatible'|'near'|'incompatible'|'unknown';
export function inspectPaths(strokes:Stroke[],params:Parameters,curves?:BezierPath[]){
  const legacy=diagnose(strokes,params,curves),anomalies:Anomaly[]=legacy.anomalies.filter(a=>!curves||!['raggio','cuspide'].includes(a.kind));
  const requiredRadius=Math.max(params.minRadius,(params.ledWidth+params.tolerance+2*params.wall)/2);
  const uncertainPaths=new Set<number>();let radiusLower=Infinity,observedRadius=Infinity,cuspCount=0,violatingSpans=0,unknownSpans=0;
  const add=(issue:Omit<Anomaly,'id'|'samples'>)=>anomalies.push({...issue,id:`strict-${anomalies.length}`,samples:1});
  curves?.forEach((path,pi)=>{
    for(let i=0;i<path.nodes.length-(path.closed?0:1);i++){
      const a=path.nodes[i],b=path.nodes[(i+1)%path.nodes.length],check=inspectCubic([a.p,a.out,b.in,b.p],requiredRadius);
      radiusLower=Math.min(radiusLower,check.lowerBound);observedRadius=Math.min(observedRadius,check.observed);
      const position=cubic(a.p,a.out,b.in,b.p,check.t),violation=check.observed<requiredRadius;
      if(violation){violatingSpans++;add({kind:'raggio',severity:'error',position,pathIds:[pi],segment:i,t:check.t,message:`Raggio osservato ${check.observed.toFixed(3)} mm < ${requiredRadius} mm${requiredRadius>params.minRadius?' · limite della sezione canaletta':''}${check.singular?' · derivata nulla/singolarità':''}`,measured:check.observed,limit:requiredRadius});}
      else if(check.unresolved){uncertainPaths.add(pi);unknownSpans++;add({kind:'raggio',severity:'warning',position,pathIds:[pi],segment:i,t:check.t,message:'Da verificare: limite conservativo del raggio non conclusivo.',measured:check.lowerBound,limit:requiredRadius});}
      else if(check.lowerBound<requiredRadius*1.15)add({kind:'raggio',severity:'warning',position,pathIds:[pi],segment:i,t:check.t,message:`Vicino al limite: raggio garantito ≥ ${check.lowerBound.toFixed(2)} mm, osservato ${check.observed.toFixed(2)} mm`,measured:check.lowerBound,limit:requiredRadius});
    }
    path.nodes.forEach((n,i)=>{
      if(!path.closed&&(i===0||i===path.nodes.length-1))return;
      const u={x:n.p.x-n.in.x,y:n.p.y-n.in.y},v={x:n.out.x-n.p.x,y:n.out.y-n.p.y},lu=Math.hypot(u.x,u.y),lv=Math.hypot(v.x,v.y);
      if(lu<1e-9||lv<1e-9){uncertainPaths.add(pi);unknownSpans++;add({kind:'cuspide',severity:'warning',position:n.p,pathIds:[pi],segment:i,t:0,message:'Da verificare: maniglia nulla nella giunzione.'});return;}
      const angle=Math.acos(Math.max(-1,Math.min(1,(u.x*v.x+u.y*v.y)/(lu*lv))))*180/Math.PI;
      if(angle>.001){cuspCount++;const error=angle>.05;if(!error){uncertainPaths.add(pi);unknownSpans++;}add({kind:'cuspide',severity:error?'error':'warning',position:n.p,pathIds:[pi],segment:i,t:0,message:`Discontinuità tangente ${angle.toFixed(4)}° · ${error?'incompatibile':'da verificare'}`,measured:angle,limit:.05});}
    });
  });
  if(!curves){for(let i=0;i<strokes.length;i++)uncertainPaths.add(i);unknownSpans++;observedRadius=legacy.minRadius;radiusLower=0;}
  // Every issue owns its path and segment. IDs are independent of the discarded legacy groups.
  anomalies.forEach((a,i)=>a.id=`defect-${i}`);
  const errors=anomalies.filter(a=>a.severity==='error').length,warnings=anomalies.length-errors;
  const status:LedState=errors?'incompatible':unknownSpans||!strokes.length?'unknown':warnings?'near':'compatible';
  const raw={intersections:legacy.anomalies.filter(a=>a.kind==='incrocio').reduce((n,a)=>n+a.samples,0),overlaps:legacy.anomalies.filter(a=>a.kind==='sovrapposizione').reduce((n,a)=>n+a.samples,0),clearanceDeficit:legacy.anomalies.filter(a=>a.kind==='distanza'&&a.severity==='error').reduce((n,a)=>n+Math.max(0,(a.limit||0)-(a.measured||0))*a.samples,0),cuspCount,violatingSpans,unknownSpans};
  return {...legacy,anomalies,errors,warnings,status,compatible:status==='compatible'||status==='near',minRadius:observedRadius,radiusLower,raw,pathStatus:strokes.map((_,i)=>anomalies.some(a=>a.pathIds.includes(i)&&a.severity==='error')?'error':uncertainPaths.has(i)?'unknown':anomalies.some(a=>a.pathIds.includes(i))?'warning':'ok') as ('error'|'unknown'|'warning'|'ok')[]};
}
export type Inspection=ReturnType<typeof inspectPaths>;
export function checkBend(d:Inspection,bend?:'laterale'|'verticale'):Inspection{
  if(bend!=='verticale')return d;
  return {...d,status:d.errors?'incompatible':'unknown',compatible:false,pathStatus:d.pathStatus.map(s=>s==='error'?'error':'unknown')};
}

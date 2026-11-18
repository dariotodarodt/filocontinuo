import { bounds,distance,type Parameters,type Point } from '../core/types';
import { joinPaths,reversePath,sampleBezier,type BezierPath } from '../vector/bezier';
import { inspectPaths,type Inspection } from './strict';
function pointSegment(p:Point,a:Point,b:Point){const dx=b.x-a.x,dy=b.y-a.y,l=dx*dx+dy*dy,t=l?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/l)):0;return distance(p,{x:a.x+dx*t,y:a.y+dy*t});}
// Symmetric upper estimate for Hausdorff distance: vertex distance + half chord
// + two flattening tolerances. Nearest segments are found through a spatial grid.
export function deviationBound(a:BezierPath[],b:BezierPath[],limit:number){
  if(JSON.stringify(a)===JSON.stringify(b))return 0;
  if(limit<=0)return Infinity;
  const tolerance=.01,step=Math.min(.5,limit/4),sa=sampleBezier(a,tolerance,step),sb=sampleBezier(b,tolerance,step);
  const directed=(source:typeof sa,target:typeof sa)=>{
    const cell=Math.max(2,limit),grid=new Map<string,[Point,Point][]>();let maximum=0,maxChord=0;
    for(const s of target)for(let i=1;i<s.points.length;i++){const a=s.points[i-1],b=s.points[i];for(let x=Math.floor(Math.min(a.x,b.x)/cell);x<=Math.floor(Math.max(a.x,b.x)/cell);x++)for(let y=Math.floor(Math.min(a.y,b.y)/cell);y<=Math.floor(Math.max(a.y,b.y)/cell);y++){const key=`${x},${y}`,list=grid.get(key)||[];list.push([a,b]);grid.set(key,list);}}
    for(const s of source)for(let i=0;i<s.points.length;i++){const p=s.points[i];if(i)maxChord=Math.max(maxChord,distance(p,s.points[i-1]));let nearest=Infinity;const gx=Math.floor(p.x/cell),gy=Math.floor(p.y/cell);for(let x=gx-1;x<=gx+1;x++)for(let y=gy-1;y<=gy+1;y++)for(const [a,b] of grid.get(`${x},${y}`)||[])nearest=Math.min(nearest,pointSegment(p,a,b));maximum=Math.max(maximum,nearest);if(maximum>limit)return maximum;}
    return maximum+maxChord/2+2*tolerance;
  };
  return Math.max(directed(sa,sb),directed(sb,sa));
}
export function connectWithTangents(a:BezierPath,b:BezierPath,handleRatio=.4):BezierPath{
  if(a.closed||b.closed||a.role==='auxiliary'||b.role==='auxiliary')throw Error('Raccordo solo tra percorsi principali aperti.');
  const pa=structuredClone(a),pb=structuredClone(b),end=pa.nodes.at(-1)!,start=pb.nodes[0],gap=distance(end.p,start.p);
  if(gap<1e-6)return joinPaths(pa,pb);
  const va={x:end.p.x-end.in.x,y:end.p.y-end.in.y},vb={x:start.out.x-start.p.x,y:start.out.y-start.p.y},la=Math.hypot(va.x,va.y),lb=Math.hypot(vb.x,vb.y);
  if(la<1e-8||lb<1e-8)throw Error('Tangenti terminali non definite.');
  end.out={x:end.p.x+va.x/la*gap*handleRatio,y:end.p.y+va.y/la*gap*handleRatio};start.in={x:start.p.x-vb.x/lb*gap*handleRatio,y:start.p.y-vb.y/lb*gap*handleRatio};
  pa.nodes.push(...pb.nodes);return pa;
}
function geometricallyBetter(a:Inspection,b:Inspection,oldCount:number,newCount:number){
  if(b.raw.intersections>a.raw.intersections||b.raw.overlaps>a.raw.overlaps||b.raw.cuspCount>a.raw.cuspCount||b.raw.violatingSpans>a.raw.violatingSpans||b.raw.unknownSpans>a.raw.unknownSpans||b.raw.clearanceDeficit>a.raw.clearanceDeficit+1e-6)return false;
  return newCount<oldCount||b.raw.cuspCount<a.raw.cuspCount||b.raw.violatingSpans<a.raw.violatingSpans||b.raw.clearanceDeficit<a.raw.clearanceDeficit-1e-4||b.raw.unknownSpans<a.raw.unknownSpans;
}
export function optimizeContinuous(paths:BezierPath[],params:Parameters,options:{maxDeviation?:number;maxWidth?:number;maxAttempts?:number}={}){
  const maxDeviation=options.maxDeviation??3,maxWidth=options.maxWidth??2000,maxAttempts=options.maxAttempts??24;
  let best=structuredClone(paths),after=inspectPaths(sampleBezier(best),params,best),attempts=0,maxDisplacement=0;
  const before=after,actions:string[]=[],rejections:string[]=[];
  const accept=(trial:BezierPath[],action:string)=>{
    const width=bounds(sampleBezier(trial)).width;if(width>maxWidth+.03){rejections.push('Larghezza massima superata.');return false;}
    const deviation=deviationBound(paths,trial,maxDeviation);if(deviation>maxDeviation){rejections.push('Scostamento massimo superato.');return false;}
    const result=inspectPaths(sampleBezier(trial),params,trial);
    // Compare geometric evidence, never the number of grouped warnings alone.
    if(!geometricallyBetter(after,result,best.length,trial.length)){rejections.push('Nessun miglioramento geometrico senza regressioni.');return false;}
    // New defect locations must be explained by existing defects, not merely balanced by their disappearance.
    const critical=(d:Inspection)=>d.anomalies.filter(a=>a.severity==='error');
    if(critical(result).some(a=>!critical(after).some(b=>a.kind===b.kind&&distance(a.position,b.position)<.15))&&trial.length<best.length){rejections.push('Nuovo difetto localizzato dopo raccordo.');return false;}
    best=trial;after=result;maxDisplacement=deviation;actions.push(action);return true;
  };
  // First remove actual tangent discontinuities with bounded control movement.
  for(const issue of before.anomalies.filter(a=>a.kind==='cuspide').slice(0,8)){
    if(attempts++>=maxAttempts)break;
    const pi=issue.pathIds[0],ni=issue.segment,trial=structuredClone(best),n=trial[pi]?.nodes[ni];if(!n||ni===0||ni===trial[pi].nodes.length-1)continue;
    const a=trial[pi].nodes[ni-1].p,b=trial[pi].nodes[ni+1].p,dx=b.x-a.x,dy=b.y-a.y,l=Math.hypot(dx,dy)||1,h=Math.min(distance(n.p,a),distance(n.p,b))/3;
    n.in={x:n.p.x-dx/l*h,y:n.p.y-dy/l*h};n.out={x:n.p.x+dx/l*h,y:n.p.y+dy/l*h};accept(trial,`Allineata tangente nel percorso ${pi+1}, nodo ${ni+1}.`);
  }
  search:for(let i=0;i<best.length;i++)for(let j=i+1;j<best.length;j++){
    if(best[i].closed||best[j].closed||best[i].role==='auxiliary'||best[j].role==='auxiliary')continue;
    const orientations=[[false,false],[false,true],[true,false],[true,true]];
    for(const [ra,rb] of orientations){
      if(attempts>=maxAttempts)break search;
      const a=ra?reversePath(best[i]):best[i],b=rb?reversePath(best[j]):best[j],gap=distance(a.nodes.at(-1)!.p,b.nodes[0].p);
      if(gap>maxDeviation*2||gap>Math.max(5,params.minRadius*3))continue;attempts++;
      try{
        const combined=connectWithTangents(a,b),bridge=gap<1e-6?null:{id:'bridge',nodes:[structuredClone(combined.nodes[a.nodes.length-1]),structuredClone(combined.nodes[a.nodes.length])]},bridgeCheck=bridge?inspectPaths(sampleBezier([bridge]),params,[bridge]):null;
        if(bridgeCheck&&!bridgeCheck.compatible){rejections.push('Raccordo non verificato per raggio o singolarità.');continue;}
        const trial=structuredClone(best);trial[i]=combined;trial.splice(j,1);
        if(accept(trial,`Raccordati percorsi ${i+1} e ${j+1}${ra||rb?' con inversione':''}.`)){j--;break;}
      }catch(e){rejections.push((e as Error).message);}
    }
  }
  return {curves:best,before,after,actions,rejections:[...new Set(rejections)],maxDisplacement,changed:actions.length>0,attempts,limited:attempts>=maxAttempts,maxDeviation,maxWidth};
}

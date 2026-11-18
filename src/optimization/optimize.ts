import { distance,type Parameters } from '../core/types';
import { diagnose } from './diagnostics';
import { joinPaths,sampleBezier,type BezierPath } from '../vector/bezier';
function score(d:ReturnType<typeof diagnose>){return d.errors*100+d.warnings;}
export function optimizePaths(paths:BezierPath[],params:Parameters){
  let best=structuredClone(paths),analysis=diagnose(sampleBezier(best),params,best);const before=analysis,actions:string[]=[];
  const accept=(trial:BezierPath[],action:string)=>{try{const result=diagnose(sampleBezier(trial),params,trial),count=(d:typeof result,kind:string)=>d.anomalies.filter(a=>a.kind===kind&&a.severity==='error').length;if(score(result)<score(analysis)&&(!Number.isFinite(analysis.minRadius)||result.minRadius>=analysis.minRadius*.98)&&['incrocio','sovrapposizione'].every(kind=>count(result,kind)<=count(analysis,kind))){best=trial;analysis=result;actions.push(action);return true;}}catch{/* retain original on sampling failures */}return false;};
  // Local tangent alignment. Changes stay within a bounded neighborhood of each anchor.
  for(let pi=0;pi<best.length;pi++)for(let ni=1;ni<best[pi].nodes.length-1;ni++){
    const trial=structuredClone(best),path=trial[pi],n=path.nodes[ni],a=path.nodes[ni-1].p,b=path.nodes[ni+1].p,dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1,handle=Math.min(distance(a,n.p),distance(b,n.p))/3;
    n.in={x:n.p.x-dx/len*handle,y:n.p.y-dy/len*handle};n.out={x:n.p.x+dx/len*handle,y:n.p.y+dy/len*handle};accept(trial,`Raccordo tangente: percorso ${pi+1}, nodo ${ni+1}.`);
  }
  // Only join almost coincident endpoints. New connector is reanalysed before acceptance.
  for(let i=0;i<best.length;i++)for(let j=i+1;j<best.length;j++)if(!best[i].closed&&!best[j].closed&&distance(best[i].nodes.at(-1)!.p,best[j].nodes[0].p)<.15){const trial=structuredClone(best);trial[i]=joinPaths(trial[i],trial[j]);trial.splice(j,1);if(accept(trial,`Unione percorsi ${i+1} e ${j+1}.`))j--;}
  // Move a whole interfering component by a small amount, never more than one channel width.
  const width=params.ledWidth+params.tolerance+2*params.wall;
  for(const issue of [...analysis.anomalies].filter(a=>a.kind==='distanza'&&a.pathIds.length===2).slice(0,8)){
    const pi=issue.pathIds[1];if(!best[pi])continue;
    for(const dy of [width*.3,-width*.3]){const trial=structuredClone(best);trial[pi].nodes=trial[pi].nodes.map(n=>({p:{...n.p,y:n.p.y+dy},in:{...n.in,y:n.in.y+dy},out:{...n.out,y:n.out.y+dy}}));if(accept(trial,`Spostamento limitato del percorso ${pi+1} per distanziamento.`))break;}
  }
  // Report actual displacement so that aesthetic change can be assessed in preview.
  let maxDisplacement=0;paths.forEach((p,i)=>p.nodes.forEach((n,j)=>{const q=best[i]?.nodes[j];if(q)maxDisplacement=Math.max(maxDisplacement,distance(n.p,q.p),distance(n.in,q.in),distance(n.out,q.out));}));
  return {curves:best,before,after:analysis,actions,maxDisplacement,changed:actions.length>0};
}

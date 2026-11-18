import { useId } from 'react';
import { bounds } from '../core/types';
import { pathData,sampleBezier,type BezierPath } from '../vector/bezier';
export function LetterPreview({curves,neon=false,ledWidth=1.2}:{curves:BezierPath[];neon?:boolean;ledWidth?:number}){
  const id=useId().replaceAll(':',''),b=bounds(sampleBezier(curves)),pad=Math.max(15,b.width*.05);
  return <svg className={'letter-preview '+(neon?'neon':'')} role="img" aria-label={neon?'Anteprima estetica neon, non simulazione fisica':'Anteprima calligrafica'} viewBox={`${b.minX-pad} ${-b.maxY-pad} ${Math.max(50,b.width+2*pad)} ${Math.max(40,b.height+2*pad)}`}>
    {neon&&<defs><filter id={'glow'+id} x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation={ledWidth*.7}/></filter></defs>}
    {neon&&curves.map(p=><path key={'glow'+p.id} d={pathData(p,true)} fill="none" stroke="#e7bb69" strokeWidth={ledWidth*1.8} opacity=".65" filter={`url(#glow${id})`}/>)}
    {curves.map(p=><path key={p.id} d={pathData(p,true)} fill="none" stroke={neon?'#fff1c9':'#273e35'} strokeWidth={neon?ledWidth:1.2} strokeLinecap="round" strokeLinejoin="round"/>)}
  </svg>;
}

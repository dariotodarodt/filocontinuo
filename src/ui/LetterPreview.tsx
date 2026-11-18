import { useId } from 'react';
import { bounds } from '../core/types';
import { pathData,sampleBezier,type BezierPath } from '../vector/bezier';
import {neonDefaults,type NeonSettings} from '../calligraphy/studio/schema';
export function LetterPreview({curves,neon=false,ledWidth=1.2,neonSettings,channelWidth}:{curves:BezierPath[];neon?:boolean;ledWidth?:number;neonSettings?:NeonSettings;channelWidth?:number}){
  const id=useId().replaceAll(':',''),b=bounds(sampleBezier(curves)),pad=Math.max(15,b.width*.05);
  const n=neonSettings||neonDefaults;
  return <svg className={'letter-preview '+(neon?'neon':'')} style={neon?{background:n.background==='dark'?'#11181d':'#f2f0e9'}:undefined} role="img" aria-label={neon?'Anteprima estetica neon, non simulazione fotometrica':'Anteprima calligrafica'} viewBox={`${b.minX-pad} ${-b.maxY-pad} ${Math.max(50,b.width+2*pad)} ${Math.max(40,b.height+2*pad)}`}>
    {neon&&<defs><filter id={'glow'+id} x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation={ledWidth*.7*n.halo}/></filter></defs>}
    {neon&&curves.map(p=><path key={'channel'+p.id} d={pathData(p,true)} fill="none" stroke={n.channelColor} strokeWidth={channelWidth??ledWidth+2.4} strokeLinecap="round"/>)}
    {neon&&n.on&&n.halo>0&&curves.map(p=><path key={'glow'+p.id} d={pathData(p,true)} fill="none" stroke={n.color} strokeWidth={ledWidth*1.8} opacity={n.intensity*.8} filter={`url(#glow${id})`}/>)}
    {curves.map(p=><path key={p.id} d={pathData(p,true)} fill="none" stroke={neon?n.on?n.color:'#5b6266':'#273e35'} opacity={(neon&&n.on)?(.3+n.intensity*.7):1} strokeWidth={neon?ledWidth:1.2} strokeLinecap="round" strokeLinejoin="round"/>)}
  </svg>;
}

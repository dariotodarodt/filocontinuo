import { lettering } from '../calligraphy/engine';
import { vectorLettering } from '../calligraphy/vectorEngine';
import { bounds,type Project } from '../core/types';
import { fromStrokes } from '../vector/bezier';
import { buildChannel } from '../geometry/channel';
import { checkBend,inspectPaths } from '../optimization/strict';
export function evaluateProject(p:Project){
  const {strokes,notes}=lettering(p),curves=p.version===2||p.curves?vectorLettering(p).curves:fromStrokes(strokes),diagnostics=checkBend(inspectPaths(strokes,p.params,curves),p.bend),channel=strokes.length?buildChannel(strokes,p.params):null;
  if(p.bend==='verticale')notes.push('Flessione verticale: geometria XY non supportata per questo profilo.');
  const withinWidth=bounds(strokes).width<=(p.maxWidth??2000)+.03;if(!withinWidth)notes.push('Percorso oltre la larghezza massima consentita.');
  const mesh=channel?{positions:new Float32Array(channel.positions),outer:channel.outer,inner:channel.inner,validation:channel.validation,width:channel.width,height:channel.height,depth:channel.depth}:null;
  channel?.geometry.dispose();return {strokes,curves,diagnostics,notes,mesh,withinWidth};
}
export type Evaluation=ReturnType<typeof evaluateProject>;
export function emptyEvaluation(p:Project):Evaluation{return {strokes:[],curves:[],diagnostics:inspectPaths([],p.params),notes:[],mesh:null,withinWidth:false};}

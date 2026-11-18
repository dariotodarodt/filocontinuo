import { bounds,type Project } from '../core/types';
import { sampleBezier } from '../vector/bezier';
import { checkBend,inspectPaths } from '../optimization/strict';
import { contextualLettering } from './contextual';
export function generateVariants(source:Project){
  if(source.width>(source.maxWidth??2000))throw Error('Larghezza obiettivo oltre il massimo consentito.');
  return (['fluida','aperta','slanciata'] as const).map(variant=>{
    const p:Project={...structuredClone(source),version:2,generator:'contextual',variant,curves:undefined,imported:null},result=contextualLettering(p),strokes=sampleBezier(result.curves),analysis=checkBend(inspectPaths(strokes,p.params,result.curves),p.bend),box=bounds(strokes);
    return {text:p.text,variant,curves:result.curves,notes:result.notes,context:result.context,analysis,width:box.width,height:box.height,paths:strokes.length,length:analysis.length,withinWidth:box.width<= (source.maxWidth??2000)+.05};
  });
}

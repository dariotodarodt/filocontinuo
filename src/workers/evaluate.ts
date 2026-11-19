import { lettering } from '../calligraphy/engine';
import { vectorLettering } from '../calligraphy/vectorEngine';
import { bounds,type Project } from '../core/types';
import { fromStrokes } from '../vector/bezier';
import { buildChannel } from '../geometry/channel';
import { checkBend,inspectPaths } from '../optimization/strict';
import {measuredGap} from '../calligraphy/one/measuredGap';
export function evaluateProject(p:Project){
  const {strokes,notes}=lettering(p),curves=p.version===2||p.curves?vectorLettering(p).curves:fromStrokes(strokes),diagnostics=checkBend(inspectPaths(strokes,p.params,curves,p.one?.engine==="0.4.3"&&p.one.construction==="fusion"?p.one.divider:undefined),p.bend),channel=strokes.length?buildChannel(strokes,p.params):null;
  let constructionVerified=true;
  if(p.one?.engine==='0.4.3'){
    const required=p.one.construction==='fusion'?p.one.divider!:2*p.params.wall;
    const points=strokes.length===1&&!curves[0]?.closed?strokes[0].points:[];
    const gap=points.length>=2&&points.length<=4000?measuredGap(points,p.params.minRadius):null;
    const wall=gap===null?null:gap-p.params.ledWidth-p.params.tolerance;
    // Budget for two sampled offsets and integer clipping. Insufficient margin
    // keeps the mesh export gate closed even when the surface itself is valid.
    constructionVerified=wall!==null&&wall>=required+.08&&diagnostics.compatible;
    notes.push('ONE '+p.one.construction+' · divisoria stimata '+(wall===null?'da verificare':wall.toFixed(2)+' mm')+' · minima '+required.toFixed(2)+' mm. '+(constructionVerified?'Controllo campionato superato.':'Esportazione mesh bloccata.')+' Verifica fisica aperta.');
  }
  if(p.bend==='verticale')notes.push('Flessione verticale: geometria XY non supportata per questo profilo.');
  const withinWidth=bounds(strokes).width<=(p.maxWidth??2000)+.03;if(!withinWidth)notes.push('Percorso oltre la larghezza massima consentita.');
  const mesh=channel?{positions:new Float32Array(channel.positions),outer:channel.outer,inner:channel.inner,validation:channel.validation,width:channel.width,height:channel.height,depth:channel.depth}:null;
  channel?.geometry.dispose();return {strokes,curves,diagnostics,notes,mesh,withinWidth,constructionVerified};
}
export type Evaluation=ReturnType<typeof evaluateProject>;
export function emptyEvaluation(p:Project):Evaluation{return {strokes:[],curves:[],diagnostics:inspectPaths([],p.params),notes:[],mesh:null,withinWidth:false,constructionVerified:false};}

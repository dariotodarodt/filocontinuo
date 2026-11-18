import { type Project } from '../core/types';
import { vectorLettering } from './vectorEngine';
import { sampleBezier } from '../vector/bezier';
import { diagnose } from '../optimization/diagnostics';
export function createStudy(source:Project):Project{
  if(source.bend==='verticale')throw Error('Il caso di studio richiede un profilo con flessione laterale nel piano XY.');
  for(const width of [600,900,1200,1600,2000]){
    const p:Project={...structuredClone(source),version:2,text:'Stay playful',generator:'open',style:'Minimal',width,slant:8,spacing:1.3,proportion:1,imported:null,curves:undefined};
    const curves=vectorLettering(p).curves,analysis=diagnose(sampleBezier(curves),p.params,curves);
    if(analysis.compatible)return {...p,curves};
  }
  throw Error('Nessun caso Stay playful compatibile trovato entro 2000 mm con questo profilo. Correggere manualmente o usare un profilo fisicamente verificato con limiti appropriati.');
}

import { bounds, type Project } from '../core/types';
import { glyphs } from './glyphs';
import { openGlyphs } from './openGlyphs';
import { contextualLettering } from './contextual';
import { fromStrokes,parseCenterline,sampleBezier,transformPaths,type BezierPath } from '../vector/bezier';
export function vectorLettering(p:Project):{curves:BezierPath[];notes:string[]}{
  if(p.curves!==undefined)return {curves:structuredClone(p.curves),notes:[]};
  if(p.generator==='contextual'&&!p.imported)return contextualLettering(p);
  const notes:string[]=[];let curves:BezierPath[]=[],cursor=0;
  if(p.imported)curves=fromStrokes(p.imported);
  else for(const [i,char] of [...p.text].entries()){
    if(char===' '){cursor+=12*p.spacing;continue;}
    const library=p.generator==='open'?openGlyphs:glyphs,ds=library[char]||library[char.toLowerCase()];
    if(!ds){notes.push(`Carattere «${char}» non disponibile.`);continue;}
    const local=ds.flatMap((d,j)=>parseCenterline(d,`glyph-${i}-${j}`)),b=bounds(sampleBezier(local,.01,2));
    const shifted=transformPaths(local,q=>({x:q.x+cursor-b.minX,y:q.y}));
    // V0.2 never introduces untested connectors in the calligraphy generator.
    curves.push(...shifted);cursor+=(b.width+(p.style==='Minimal'?9:5))*p.spacing;
  }
  const shear=Math.tan(p.slant*Math.PI/180),proportion=p.proportion??1;
  curves=transformPaths(curves,q=>({x:q.x+q.y*shear,y:q.y*proportion}));
  const b=bounds(sampleBezier(curves,.02,4)),scale=b.width?p.width/b.width:1;
  return {curves:transformPaths(curves,q=>({x:(q.x-b.minX)*scale,y:(q.y-b.minY)*scale})),notes:[...new Set(notes)]};
}

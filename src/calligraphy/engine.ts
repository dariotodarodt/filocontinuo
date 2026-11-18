import { glyphs } from './glyphs';
import { bounds, distance, type Project, type Stroke } from '../core/types';
import { samplePath } from '../vector/paths';
import { sampleBezier } from '../vector/bezier';
import { vectorLettering } from './vectorEngine';

export function lettering(p:Project): { strokes:Stroke[]; notes:string[] } {
  if(p.version===2||p.curves!==undefined){const result=vectorLettering(p);return {strokes:sampleBezier(result.curves),notes:result.notes};}
  let strokes:Stroke[]=[]; const notes:string[]=[];
  if(p.imported) strokes=structuredClone(p.imported);
  else {
    let cursor=0,previous:Stroke|undefined;
    for(const char of p.text){
      if(char===' '){cursor+=10*p.spacing;previous=undefined;continue;}
      const ds=glyphs[char]||glyphs[char.toLowerCase()];
      if(!ds){notes.push(`Carattere «${char}» non disponibile nella libreria V0.1.`);previous=undefined;continue;}
      const local=ds.flatMap(samplePath), b=bounds(local), advance=Math.max(6,b.maxX)*p.spacing;
      const moved=local.map(s=>({points:s.points.map(q=>({x:q.x+cursor,y:q.y}))}));
      // Only join nearby entry/exit anchors. Capitals, secondary strokes and spaces remain explicit breaks.
      if(previous && p.style==='Signature' && p.spacing===1 && char===char.toLowerCase()){
        const a=previous.points.at(-1)!,b=moved[0].points[0];
        if(distance(a,b)<0.05){previous.points.push(...moved[0].points.slice(1));strokes.push(...moved.slice(1));}
        else {strokes.push(...moved);previous=moved[0];}
      }else {strokes.push(...moved);previous=moved[0];}
      if(char!==char.toLowerCase())previous=undefined;
      cursor+=advance;
    }
  }
  const shear=Math.tan(p.slant*Math.PI/180);
  strokes=strokes.map(s=>({...s,points:s.points.map(q=>({x:q.x+q.y*shear,y:q.y}))}));
  const b=bounds(strokes),scale=b.width>0?p.width/b.width:1;
  strokes=strokes.map(s=>({...s,points:s.points.map(q=>({x:(q.x-b.minX)*scale,y:(q.y-b.minY)*scale}))}));
  return {strokes,notes:[...new Set(notes)]};
}

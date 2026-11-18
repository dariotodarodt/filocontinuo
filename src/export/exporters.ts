import { Mesh, MeshStandardMaterial } from 'three';
import { STLExporter } from 'three/addons/exporters/STLExporter.js';
import { OBJExporter } from 'three/addons/exporters/OBJExporter.js';
import { strToU8, zipSync } from 'fflate';
import type { Channel } from '../geometry/channel';
import { bounds, type Stroke } from '../core/types';
import { pathData,sampleBezier,type BezierPath } from '../vector/bezier';
export function stl(channel:Channel):Uint8Array {
  if(!channel.validation.valid)throw Error('Esportazione bloccata: mesh non valida.');
  const material=new MeshStandardMaterial();const result=new STLExporter().parse(new Mesh(channel.geometry,material),{binary:true});material.dispose();return new Uint8Array(result.buffer,result.byteOffset,result.byteLength);
}
export function obj(channel:Channel):string {
  if(!channel.validation.valid)throw Error('Esportazione bloccata: mesh non valida.');
  const material=new MeshStandardMaterial();const text=new OBJExporter().parse(new Mesh(channel.geometry,material));material.dispose();return '# FILOCONTINUO — coordinate in millimetri\n'+text;
}
export function threeMF(channel:Channel):Uint8Array {
  if(!channel.validation.valid)throw Error('Esportazione bloccata: mesh non valida.');
  const p=channel.positions,vertices:string[]=[],triangles:string[]=[],ids=new Map<string,number>(),index:number[]=[];
  for(let i=0;i<p.length;i+=3){const key=p.slice(i,i+3).join(',');let id=ids.get(key);if(id===undefined){id=vertices.length;ids.set(key,id);vertices.push(`<vertex x="${p[i]}" y="${p[i+1]}" z="${p[i+2]}"/>`);}index.push(id);}
  for(let i=0;i<index.length;i+=3)triangles.push(`<triangle v1="${index[i]}" v2="${index[i+1]}" v3="${index[i+2]}"/>`);
  const xml=`<?xml version="1.0" encoding="UTF-8"?><model unit="millimeter" xml:lang="it-IT" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02"><metadata name="Title">FILOCONTINUO</metadata><resources><object id="1" type="model"><mesh><vertices>${vertices.join('')}</vertices><triangles>${triangles.join('')}</triangles></mesh></object></resources><build><item objectid="1"/></build></model>`;
  return zipSync({'[Content_Types].xml':strToU8('<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/></Types>'),'_rels/.rels':strToU8('<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/></Relationships>'),'3D/3dmodel.model':strToU8(xml)});
}
export function svg(strokes:Stroke[]):string {
  const b=bounds(strokes),pad=5;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${b.width+pad*2}mm" height="${b.height+pad*2}mm" viewBox="${b.minX-pad} ${-b.maxY-pad} ${b.width+pad*2} ${b.height+pad*2}"><g fill="none" stroke="#111" stroke-width="0.3" stroke-linecap="round" stroke-linejoin="round">${strokes.map(s=>`<path d="${s.points.map((q,i)=>`${i?'L':'M'}${q.x.toFixed(4)} ${(-q.y).toFixed(4)}`).join(' ')}${s.closed?' Z':''}"/>`).join('')}</g></svg>`;
}
export function bezierSVG(paths:BezierPath[]):string{const b=bounds(sampleBezier(paths)),pad=5;return `<svg xmlns="http://www.w3.org/2000/svg" width="${b.width+pad*2}mm" height="${b.height+pad*2}mm" viewBox="${b.minX-pad} ${-b.maxY-pad} ${b.width+pad*2} ${b.height+pad*2}"><g fill="none" stroke="#111" stroke-width="0.3">${paths.map(p=>`<path d="${pathData(p,true)}"/>`).join('')}</g></svg>`;}
export function download(data:string|Uint8Array,name:string,type:string){const blob=new Blob([typeof data==='string'?data:new Uint8Array(data)],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}

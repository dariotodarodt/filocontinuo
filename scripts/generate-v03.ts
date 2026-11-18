import { mkdirSync,writeFileSync } from 'node:fs';
import { defaults, type Project } from '../src/core/types';
import { newProject,newProjectV3 } from '../src/core/profiles';
import { createStudy } from '../src/calligraphy/study';
import { generateVariants } from '../src/calligraphy/variants';
import { vectorLettering } from '../src/calligraphy/vectorEngine';
import { sampleBezier,pathData } from '../src/vector/bezier';
import { diagnose } from '../src/optimization/diagnostics';
import { inspectPaths } from '../src/optimization/strict';
import { buildChannel } from '../src/geometry/channel';
import { bezierSVG,stl,threeMF,obj } from '../src/export/exporters';
const out='examples/v03';mkdirSync(out,{recursive:true});
const json=(value:unknown)=>JSON.stringify(value,(_,v)=>typeof v==='number'&&!Number.isFinite(v)?String(v):v,2);
const labels={compatible:'Compatibile con i controlli',near:'Vicino ai limiti',unknown:'Da verificare',incompatible:'Incompatibile'};
const summaries:object[]=[],cards:string[]=[],texts=['Stay playful','Amore','Olivia','Tradizione','Buon compleanno','Filocontinuo'];
for(const text of texts)for(const width of [400,600]){
  const source:Project={...newProjectV3(),text,width,maxWidth:600,slant:8,spacing:1.3,proportion:1};
  for(const v of generateVariants(source)){
    const slug=text.replaceAll(' ','-')+`-${width}-${v.variant}`,p:Project={...source,variant:v.variant,curves:v.curves},summary={text,width,variant:v.variant,height:v.height,paths:v.paths,length:v.length,radiusObserved:v.analysis.minRadius,radiusLower:v.analysis.radiusLower,status:v.analysis.status,errors:v.analysis.errors,warnings:v.analysis.warnings,raw:v.analysis.raw,physical:source.params,bend:source.bend,context:v.context};
    writeFileSync(`${out}/${slug}.svg`,bezierSVG(v.curves));writeFileSync(`${out}/${slug}.filo.json`,JSON.stringify(p,null,2));summaries.push(summary);
    cards.push(`<article><h2>${text} · ${width} mm · ${v.variant}</h2><img src="${slug}.svg" alt="${text}"/><p>${v.paths} tratti · LED ${v.length.toFixed(1)} mm · raggio osservato ${v.analysis.minRadius.toFixed(3)} mm · <b>${labels[v.analysis.status]}</b></p></article>`);
    if(text==='Stay playful'){
      writeFileSync(`${out}/${slug}-diagnostica.json`,json({...summary,anomalies:v.analysis.anomalies}));
      const svg=bezierSVG(v.curves),head=svg.slice(0,svg.indexOf('<g '));
      writeFileSync(`${out}/${slug}-neon.svg`,head+`<defs><filter id="g" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="3"/></filter></defs><rect x="-10000" y="-10000" width="20000" height="20000" fill="#10191e"/><g fill="none" stroke="#ffd58b" stroke-width="6" filter="url(#g)">${v.curves.map(p=>`<path d="${pathData(p,true)}"/>`).join('')}</g><g fill="none" stroke="#fff0c9" stroke-width="2">${v.curves.map(p=>`<path d="${pathData(p,true)}"/>`).join('')}</g></svg>`);
      const channel=buildChannel(sampleBezier(v.curves),source.params);
      writeFileSync(`${out}/${slug}-mesh.json`,json(channel.validation));
      if(width===600&&v.variant==='fluida'&&channel.validation.valid){writeFileSync(`${out}/${slug}.stl`,stl(channel));writeFileSync(`${out}/${slug}.3mf`,threeMF(channel));writeFileSync(`${out}/${slug}.obj`,obj(channel));}
      channel.geometry.dispose();
    }
  }
}
const baseline:object[]=[];
for(const width of [400,600,1600]){
  const p:Project={...newProject(),text:'Stay playful',style:'Minimal',spacing:1.3,slant:8,width},curves=vectorLettering(p).curves,strokes=sampleBezier(curves),old=diagnose(strokes,p.params,curves),strict=inspectPaths(strokes,p.params,curves);
  baseline.push({version:'V0.2',width,paths:curves.length,length:strict.length,radiusObserved:strict.minRadius,legacy:{errors:old.errors,warnings:old.warnings,compatible:old.compatible},strict:{status:strict.status,errors:strict.errors,warnings:strict.warnings,raw:strict.raw},params:p.params,bend:p.bend});
}
writeFileSync(`${out}/confronto.json`,json({date:'2026-11-18',notes:'Profili dimostrativi. Nessuna fotografia, verifica visiva, slicing o stampa fisica. Le candidate incompatibili non sono soluzioni produttive.',baseline,variants:summaries}));
writeFileSync(`${out}/galleria.html`,`<!doctype html><html lang="it"><meta charset="utf-8"><title>FILOCONTINUO V0.3 — confronto</title><style>body{font:14px Segoe UI,sans-serif;background:#edf2e8;color:#304331;margin:30px}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(380px,1fr));gap:18px}article{background:#fff;padding:20px;border:1px solid #cad7c0;border-radius:8px}h2{font-size:15px}img{width:100%;height:180px}p{line-height:1.6}b{color:#aa4c3e}</style><h1>FILOCONTINUO V0.3 — anteprime generate</h1><p>Confronto a parametri LED fissi: 6 × 8 mm, raggio 12 mm, tolleranza 0,3 mm, pareti 1,2 mm, fondo 1,5 mm. Anteprime candidate, senza verifica visiva o fisica. Nero pulito non significa compatibile; leggere lo stato.</p><main>${cards.join('')}</main></html>`);
console.log(`Generati ${summaries.length} SVG puliti, 6 SVG Neon estetici e confronto V0.2/V0.3 in ${out}.`);

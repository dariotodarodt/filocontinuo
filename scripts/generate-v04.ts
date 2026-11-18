import fs from 'node:fs';import path from 'node:path';
import {builtInFamilies} from '../src/calligraphy/studio/families';import {studioDefaults} from '../src/calligraphy/studio/schema';import {composeStudio,studioProject} from '../src/calligraphy/studio/compose';
import {newProjectV3} from '../src/core/profiles';import {validateProject} from '../src/core/types';import {bezierSVG,stl,threeMF,obj} from '../src/export/exporters';import {sampleBezier} from '../src/vector/bezier';import {buildChannel} from '../src/geometry/channel';import {contextualLettering} from '../src/calligraphy/contextual';import {vectorLettering} from '../src/calligraphy/vectorEngine';import {checkBend,inspectPaths} from '../src/optimization/strict';
const dir='examples/v04';fs.mkdirSync(path.join(dir,'families'),{recursive:true});
const texts=['Stay playful','Amore','Olivia','Tradizione','Buon compleanno','Filocontinuo',"L'amore è luce",'MoruMì'];
const escape=(s:string)=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const slug=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9]+/g,'-').replace(/^-|-$/g,'');
const write=(name:string,value:unknown)=>fs.writeFileSync(path.join(dir,name),typeof value==='string'?value:JSON.stringify(value,null,2),'utf8');
const results:Record<string,unknown>[]=[],legacy:Record<string,unknown>[]=[],cards:string[]=[];
for(const family of builtInFamilies){write(`families/${family.id}-1.0.0.json`,family);
 for(const text of texts)for(const width of text==='Stay playful'?[400,600,800]:[400]){
  const p={...newProjectV3(),text,width,maxWidth:width,slant:8,spacing:1.3},c=composeStudio(p,family,studioDefaults),project=validateProject(studioProject(p,c)),name=`${slug(text)}-${width}-${family.id}`;
  write(name+'.filo.json',project);const svg=bezierSVG(c.curves);write(name+'.svg',svg);
  let validation:unknown=null;
  if(text==='Stay playful'){
   const channel=buildChannel(sampleBezier(c.curves),p.params);validation=channel.validation;write(name+'-mesh.json',channel.validation);
   if(width===400&&channel.validation.valid){fs.writeFileSync(path.join(dir,name+'.stl'),stl(channel));fs.writeFileSync(path.join(dir,name+'.3mf'),threeMF(channel));write(name+'.obj',obj(channel));}
   channel.geometry.dispose();
   const neon=svg.replace('<g fill="none" stroke="#111" stroke-width="0.3">','<defs><filter id="glow"><feGaussianBlur stdDeviation="2"/></filter></defs><rect x="-10000" y="-10000" width="20000" height="20000" fill="#11181d"/><g fill="none" stroke="#ffb86b" stroke-width="6" style="filter:drop-shadow(0px 0px 3px #ffb86b)">');write(name+'-neon.svg',neon);
  }
  const metrics={text,family:family.name,familyId:family.id,familyVersion:family.version,targetWidth:width,width:c.width,height:c.height,paths:c.paths,lengthMM:c.length,radiusObservedMM:Number.isFinite(c.analysis.minRadius)?c.analysis.minRadius:null,radiusLowerMM:Number.isFinite(c.analysis.radiusLower)?c.analysis.radiusLower:null,ledState:c.analysis.status,errors:c.analysis.errors,warnings:c.analysis.warnings,anomalies:c.analysis.anomalies,links:c.state.links.length,elapsedMs:c.elapsedMs,parameters:p.params,bend:p.bend,mesh:validation};results.push(metrics);
  cards.push(`<article><h2>${family.name} · ${escape(text)}</h2><img src="${name}.svg" alt="${escape(text)} — ${family.name}"/><p>${c.width.toFixed(1)} × ${c.height.toFixed(1)} mm · ${c.paths} percorsi · LED ${c.length.toFixed(1)} mm</p><p class="${c.analysis.status}">${c.analysis.status} · R ${c.analysis.minRadius.toFixed(2)} mm · ${c.analysis.errors} errori</p><a href="${name}.filo.json">Progetto JSON V2</a></article>`);
 }
}
for(const width of [400,600,800])for(const generator of ['open','contextual'] as const){const p={...newProjectV3(),text:'Stay playful',width,maxWidth:width,slant:8,spacing:1.3,generator,variant:'aperta' as const},curves=generator==='contextual'?contextualLettering(p).curves:vectorLettering(p).curves,d=checkBend(inspectPaths(sampleBezier(curves),p.params,curves),p.bend);legacy.push({generator,width,paths:curves.length,lengthMM:d.length,radiusObservedMM:d.minRadius,state:d.status,errors:d.errors,warnings:d.warnings});}
write('confronto.json',{version:'0.4.0',generatedAt:new Date().toISOString(),description:'Percorsi centrali e profilo dimostrativo identico. Tempi wall-clock del solo compose+analisi, senza mesh, su questa macchina; non benchmark universale. Raggio osservato non certificazione fisica.',results,legacy});
write('galleria.html',`<!doctype html><html lang="it"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>FILOCONTINUO · Style Studio V0.4</title><style>body{font:14px system-ui;background:#e9eee4;color:#253f33;padding:30px}h1{font-size:32px}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:20px}article{background:#fffef7;border:1px solid #ced9c7;border-radius:12px;padding:20px}h2{font:22px Georgia}img{width:100%;height:150px}.incompatible{color:#ad4534}.compatible{color:#24734f}.near{color:#8d7317}a{color:#37654b}</style><h1>FILOCONTINUO · Calligraphy & Style Studio</h1><p>Tre alfabeti originali, 92 caratteri ciascuno. Geometrie reali; il rosso indica incompatibilità LED. Nessuna prova fisica. SVG generati automaticamente, revisione estetica separata. Stay playful: 400/600/800 mm, LED 6 × 8, R minimo 12 mm.</p><main>${cards.join('\n')}</main></html>`);
console.log(`Generati ${results.length} progetti e SVG, 9 Neon, 3 famiglie e confronto con 6 riferimenti legacy.`);

import {writeFileSync} from 'node:fs';
import {oneCenterline} from '../src/calligraphy/one/centerline';
import {parseCenterline,sampleBezier} from '../src/vector/bezier';
import {newProjectV3} from '../src/core/profiles';
import {inspectPaths,checkBend} from '../src/optimization/strict';
import {bezierSVG} from '../src/export/exporters';

import {buildChannel} from '../src/geometry/channel';
import {bezierBounds} from '../src/vector/bounds';
const cases=['Love','Ciao','Amore','Olivia','Dario','Olga','Stay playful','Tradizione','Filocontinuo','Buon compleanno','MoruMì','lloo','bbjjkkqqxx'];
const results=[];
const cards:string[]=[];
for(const text of cases){
  for(const width of text==='Stay playful'?[400,600,800,1000]:[400]){
    const project={...newProjectV3(),text,width,maxWidth:width};
    const curves=parseCenterline(oneCenterline(text,width));
    const report=checkBend(inspectPaths(sampleBezier(curves),project.params,curves),project.bend);
    const file='examples/v041/'+text.replaceAll(' ','-')+'-'+width;
    writeFileSync(file+'.svg',bezierSVG(curves));
    writeFileSync(file+'.filo.json',JSON.stringify({...project,curves}));
    const svg=bezierSVG(curves);
    const neon=svg.replace('<g fill="none" stroke="#111" stroke-width="0.3">','<rect x="-5000" y="-5000" width="10000" height="10000" fill="#152029"/><g fill="none" stroke="#ffd780" stroke-width="4" style="filter:drop-shadow(0 0 2px orange)">');
    writeFileSync(file+'-neon.svg',neon);
    const markers=report.anomalies.map(a=>'<circle cx="'+a.position.x+'" cy="'+a.position.y+'" r="1.3" fill="#c93725"/>').join('');
    writeFileSync(file+'-tecnica.svg',svg.replace('</svg>',markers+'</svg>'));
    const mesh=buildChannel(sampleBezier(curves),project.params);
    const validation=mesh.validation;
    mesh.geometry.dispose();
    const name=file.split('/').pop();
    cards.push('<article><h2>'+text+' · '+width+' mm</h2><img src="'+name+'.svg"><p>R osservato '+report.minRadius.toFixed(2)+' mm · '+report.status+'</p><a href="'+name+'-tecnica.svg">Difetti</a> · <a href="'+name+'-neon.svg">Neon</a> · <a href="'+name+'.filo.json">Progetto 3D</a></article>');
    const gaps=report.anomalies.filter(a=>a.kind==='distanza' && a.measured!==undefined).map(a=>a.measured!);
    results.push({text,width,mesh:validation,bounds:bezierBounds(curves),wallMode:'independent',thresholdMM:project.params.ledWidth+project.params.tolerance+2*project.params.wall,minimumReportedGapMM:gaps.length?Math.min(...gaps):null,endpoints:2,paths:curves.length,length:report.length,radius:report.minRadius,status:report.status,diagnostics:report.raw});
  }
}
writeFileSync('examples/v041/confronto.json',JSON.stringify(results,null,2));

writeFileSync('examples/v041/galleria.html','<!doctype html><html lang="it"><meta charset="utf-8"><title>Esempi ONE</title><style>body{font:16px system-ui;margin:3vw}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:2rem}img{width:100%;height:130px}</style><h1>FILOCONTINUO ONE</h1><main>'+cards.join('')+'</main></html>');
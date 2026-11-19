import {constrainedOne} from '../src/calligraphy/one/constrained';
import {writeFileSync} from 'node:fs';
import {composeWords} from '../src/calligraphy/one/words';
import {oneCenterline} from '../src/calligraphy/one/centerline';
import {compositionGap} from '../src/calligraphy/one/measuredGap';
import {builtInFamilies} from '../src/calligraphy/studio/families';
import {studioDefaults} from '../src/calligraphy/studio/schema';
import {composeStudio} from '../src/calligraphy/studio/compose';
import {newProjectV3} from '../src/core/profiles';
import {parseCenterline,sampleBezier} from '../src/vector/bezier';
import {bezierSVG} from '../src/export/exporters';
import {bezierBounds} from '../src/vector/bounds';
import {buildChannel} from '../src/geometry/channel';
import {inspectPaths} from '../src/optimization/strict';
const dir='examples/v043/', cards=[],rows=[];
const samples=['La tradizione\nSiciliana\nprende il tuo\nvolto','Love','Amore','Olivia','Dario','Tradizione','Siciliana','Prende','Volto','MoruMì','Filocontinuo','Stay playful','Buon compleanno'];
const outline=(rings:{X:number;Y:number}[][])=>rings.map(r=>'M'+r.map(p=>p.X/1000+' '+p.Y/1000).join('L')+'Z').join(' ');
for(const text of samples){
 const width=600, p={...newProjectV3(),text,width}, name=text.replace(/\s+/g,'-');
 const signature=composeStudio(p,builtInFamilies[0],studioDefaults);
 writeFileSync(dir+name+'-signature.svg',bezierSVG(signature.curves));
 const pictures=['<figure><img src="'+name+'-signature.svg"><figcaption>Signature</figcaption></figure>'];
 for(const variant of [0,2]){
  const d=composeWords(text,width,true,variant,'center',4,{bore:p.params.ledWidth+p.params.tolerance,wallGap:1.2,radius:p.params.minRadius}),curves=parseCenterline(d),strokes=sampleBezier(curves),b=bezierBounds(curves);
  const vb=[b.minX-10,b.minY-10,b.width+20,b.height+20].join(' ');
  const svg=(body:string)=>'<svg xmlns="http://www.w3.org/2000/svg" viewBox="'+vb+'">'+body+'</svg>';
  const axis=(color:string,thickness:number)=>'<path fill="none" stroke="'+color+'" stroke-width="'+thickness+'" stroke-linecap="round" d="'+d+'"/>';
  const mesh=buildChannel(strokes,p.params),stats=inspectPaths(strokes,p.params,curves,1.2),gap=compositionGap(strokes,p.params.minRadius);
  const id=name+'-'+variant;
  for(const [view,body] of Object.entries({Calligrafia:axis('#45372d',2),Neon:'<rect x="-10" y="-10" width="110%" height="120%" fill="#231e24"/>'+axis('#ed8b93',8)+axis('#fff1d9',5),Tecnica:'<path fill="#596e75" fill-rule="evenodd" d="'+outline(mesh.outer)+'"/><path fill="#efd2a6" fill-rule="evenodd" d="'+outline(mesh.inner)+'"/>'+axis('#923526',.7)})){
   writeFileSync(dir+id+'-'+view+'.svg',svg(body));pictures.push('<figure><img src="'+id+'-'+view+'.svg"><figcaption>'+view+' · '+(variant===0?'compatta':'ritorni aperti')+'</figcaption></figure>');
  }
  const state=stats.errors||gap!==null&&gap<7.5?'incompatibile':stats.compatible&&gap!==null&&gap>=7.58?'entro i controlli campionati':'da verificare';
  const row={text,variant,paths:curves.length,ends:2*curves.length,length:stats.length,radius:stats.minRadius,gap,width:b.width,height:b.height,mesh:mesh.validation.valid,state,raw:stats.raw};rows.push(row);
  pictures.push('<p>'+row.paths+' percorsi · '+row.ends+' estremità · R '+row.radius.toFixed(2)+' mm · distanza '+(gap?.toFixed(2)??'indeterminata')+' mm · mesh '+(row.mesh?'valida':'invalida')+' · LED '+state+'</p>');mesh.geometry.dispose();
 }
 try{const d=oneCenterline(text.replace(/\n/g,' '),width,.5,true),b=bezierBounds(parseCenterline(d));pictures.push('<figure><svg viewBox="'+[b.minX-3,b.minY-3,b.width+6,b.height+6].join(' ')+'"><path fill="none" stroke="#473f38" stroke-width="2" d="'+d+'"/></svg><figcaption>ONE precedente · riga singola</figcaption></figure>');}catch{pictures.push('<p>Testo fuori repertorio ONE precedente.</p>');}
 // Compare with the radius-constrained reference only within its alphabet.
 if(/^[LoveAmrM]+$/.test(text)){
  const d=constrainedOne(text,width,p.params.minRadius),curves=parseCenterline(d),box=bezierBounds(curves),strokes=sampleBezier(curves);
  const diag=inspectPaths(strokes,p.params,curves),mesh=buildChannel(strokes,p.params);
  pictures.push('<figure><svg viewBox="'+[box.minX-6,box.minY-6,box.width+12,box.height+12].join(' ')+'"><path d="'+d+'" stroke="#535d60" stroke-width="2" fill="none"/></svg><figcaption>ONE vincolato precedente · R '+diag.minRadius.toFixed(2)+' mm · '+diag.errors+' errori · mesh '+(mesh.validation.valid?'valida':'invalida')+'</figcaption></figure>');
  mesh.geometry.dispose();
 }
 cards.push('<section><h2>'+text.replace(/\n/g,' / ')+'</h2><div>'+pictures.join('')+'</div></section>');
}
writeFileSync(dir+'parole.json',JSON.stringify(rows,null,2));
writeFileSync(dir+'galleria.html','<!doctype html><html lang="it"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>ONE Fusion · parole</title><style>body{font:16px system-ui;margin:4vw;background:#faf7ef;color:#312c28}section{border-top:1px solid #beb4a3}section div{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1rem}figure{margin:0;background:white;padding:1rem}img,svg{width:100%;height:160px}p{max-width:65ch}</style><h1>ONE Fusion · revisione delle parole</h1><p>600 mm · LED dimostrativo 6 × 8 mm, tolleranza 0,30 mm, pareti 1,20 mm, R12. Vista tecnica con struttura grigia, cavità sabbia e asse rosso. Verifica fisica aperta.</p><p>Riferimenti osservati: nella frase rosa le parole sono distribuite su quattro righe; in Stay playful gli ascendenti e i discendenti occupano gran parte dell’altezza. Le foto restano private. Confrontare prima la lettura delle parole, poi le misure.</p><a href="studio-anteprima.jpg">Schermata dello Studio</a> · <a href="studio-editor.jpg">Editor dopo l’applicazione</a> · <a href="glifi.html">Studi dei glifi</a> · <a href="parole.json">Misure complete</a>'+cards.join('')+'</html>');
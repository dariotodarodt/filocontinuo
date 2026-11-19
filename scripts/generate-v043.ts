import {mkdirSync,writeFileSync} from 'node:fs';
import {builtInFamilies} from '../src/calligraphy/studio/families';
import {fusionGlyph,fusionLetters,type Construction} from '../src/calligraphy/one/fusion';
import {newProjectV3} from '../src/core/profiles';
import {parseCenterline,sampleBezier,pathData} from '../src/vector/bezier';
import {bezierBounds} from '../src/vector/bounds';
import {buildChannel} from '../src/geometry/channel';
import {inspectPaths} from '../src/optimization/strict';
import {measuredGap} from '../src/calligraphy/one/measuredGap';
const dir='examples/v043';mkdirSync(dir,{recursive:true});
const params=newProjectV3().params,rows=[],sections=[];
const contour=(paths:{X:number;Y:number}[][])=>paths.map(p=>'M'+p.map(q=>q.X/1000+' '+q.Y/1000).join('L')+'Z').join(' ');
for(const letter of fusionLetters){
 const signature=builtInFamilies[0].glyphs[letter].paths;
 const sigBounds=bezierBounds(signature);
 const sig='<svg viewBox="'+[sigBounds.minX-2,-sigBounds.maxY-2,sigBounds.width+4,sigBounds.height+4].join(' ')+'"><path d="'+signature.map(p=>pathData(p,true)).join(' ')+'" fill="none" stroke="#27221c" stroke-width=".7"/></svg>';
 const cards=['<article><h3>Signature originale</h3>'+sig+'</article>'];
 for(const mode of ['separate','fusion'] as Construction[])for(const index of mode==='separate'?[1]:[0,1,2]){
  const divider=1.2,d=fusionGlyph(letter,200,params,mode,divider,index);
  const curves=parseCenterline(d),strokes=sampleBezier(curves),box=bezierBounds(curves);
  const mesh=buildChannel(strokes,params),analysis=inspectPaths(strokes,params,curves,mode==='fusion'?divider:undefined);
  const gap=measuredGap(strokes[0].points,params.minRadius),wall=gap===null?null:gap-params.ledWidth-params.tolerance;
  const state=analysis.errors||wall!==null&&wall<(mode==='fusion'?divider:2*params.wall)?'incompatibile':analysis.status==='unknown'||wall===null?'da verificare':'entro i controlli campionati';
  const vb=[box.minX-8,box.minY-8,box.width+16,box.height+16].join(' ');
  const diagram='<svg xmlns="http://www.w3.org/2000/svg" viewBox="'+vb+'"><path fill="#657379" fill-rule="evenodd" d="'+contour(mesh.outer)+'"/><path fill="#f7d69e" fill-rule="evenodd" d="'+contour(mesh.inner)+'"/><path d="'+d+'" fill="none" stroke="#923d27" stroke-width=".65"/></svg>';
  const neon='<svg xmlns="http://www.w3.org/2000/svg" viewBox="'+vb+'" style="background:#182026"><path d="'+d+'" stroke="#ffc783" stroke-width="6" fill="none" style="filter:drop-shadow(0 0 2px orange)"/></svg>';
  const name=letter+'-'+mode+'-'+(index+1);
  writeFileSync(dir+'/'+name+'.svg',diagram);writeFileSync(dir+'/'+name+'-neon.svg',neon);
  rows.push({letter,mode,variant:index+1,radius:analysis.minRadius,gap,wall,divider,mesh:mesh.validation,state,diagnostics:analysis.raw});
  cards.push('<article><h3>ONE '+mode+' '+(mode==='fusion'?index+1:'')+'</h3><img src="'+name+'.svg"><img src="'+name+'-neon.svg"><p>R '+analysis.minRadius.toFixed(2)+' mm · assi '+gap?.toFixed(2)+' mm · parete stimata '+wall?.toFixed(2)+' mm</p><p>'+state+' · mesh '+(mesh.validation.valid?'valida':'invalida')+'</p></article>');
  mesh.geometry.dispose();
 }
 sections.push('<section><h2>'+letter+'</h2><div>'+cards.join('')+'</div></section>');
}
writeFileSync(dir+'/misure.json',JSON.stringify(rows,null,2));
writeFileSync(dir+'/glifi.html','<!doctype html><html lang="it"><meta charset="utf-8"><title>ONE Fusion · revisione estetica</title><style>body{margin:3vw;background:#faf7f0;color:#252e30;font:16px system-ui}section div{display:grid;grid-template-columns:repeat(auto-fit,minmax(175px,1fr));gap:12px}article{background:white;padding:12px;border-radius:8px}svg,img{width:100%;height:155px}h2{font:italic 40px Georgia}p{font-size:14px}</style><h1>ONE Fusion · revisione delle lettere</h1><p>Profilo 6 × 8 mm · R12 · divisoria minima 1,20 mm. Grigio: struttura esterna. Sabbia: cavità. Rosso: asse LED. Le misure sono campionate.</p>'+sections.join('')+'</html>');
await import('./generate-v043-words');

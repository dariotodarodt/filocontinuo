import {writeFileSync,mkdirSync} from 'node:fs';
import {parseCenterline,sampleBezier} from '../src/vector/bezier';
import {newProjectV3} from '../src/core/profiles';
import {buildChannel} from '../src/geometry/channel';
import {stl,threeMF,bezierSVG} from '../src/export/exporters';
import {inspectPaths} from '../src/optimization/strict';

const directory='examples/v042/provini';
mkdirSync(directory,{recursive:true});
const results=[];
for(const radius of [8,12,16,20]){
 for(const gap of [9,12,2*radius]){
  // Axes approach symmetrically over 50 mm; both joins have vertical tangents.
  const half=gap/2,handle=4*radius*Math.tan(Math.PI/8)/3;
  const d=[
    'M',-half,85,'L',-half,65,'C',-half,46,-radius,34,-radius,15,
    'C',-radius,15-handle,-handle,15-radius,0,15-radius,
    'C',handle,15-radius,radius,15-handle,radius,15,
    'C',radius,34,half,46,half,65,'L',half,85
  ].join(' ');
  const curves=parseCenterline(d),strokes=sampleBezier(curves);
  const p=newProjectV3(),mesh=buildChannel(strokes,p.params);
  if(!mesh.validation.valid || Math.max(mesh.width,mesh.height)>256)throw Error('Provino non valido');
  const name='R'+radius+'-assi'+gap;
  writeFileSync(directory+'/'+name+'.stl',stl(mesh));
  writeFileSync(directory+'/'+name+'.3mf',threeMF(mesh));
  writeFileSync(directory+'/'+name+'.svg',bezierSVG(curves));
  const analysis=inspectPaths(strokes,p.params,curves);
  results.push({name,radius,gap,width:mesh.width,height:mesh.height,mesh:mesh.validation.valid,led:analysis.status,observed:analysis.minRadius});
  mesh.geometry.dispose();
 }
}
writeFileSync(directory+'/indice.json',JSON.stringify(results,null,2));

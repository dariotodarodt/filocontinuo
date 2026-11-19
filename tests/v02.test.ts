import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync,writeFileSync } from 'node:fs';
import { strFromU8,unzipSync } from 'fflate';
import { defaults,distance,validateProject } from '../src/core/types';
import { applyProfile,demoProfiles,newProject } from '../src/core/profiles';
import { cubic,deleteNode,fromStrokes,insertNode,joinPaths,moveControl,parseCenterline,rotateScale,sampleBezier,splitPath } from '../src/vector/bezier';
import { diagnose } from '../src/optimization/diagnostics';
import { optimizePaths } from '../src/optimization/optimize';
import { bedCompatibility } from '../src/optimization/bed';
import { buildChannel,validateMesh } from '../src/geometry/channel';
import { buildCalibration } from '../src/geometry/calibration';
import { bezierSVG,obj,stl,threeMF } from '../src/export/exporters';
import { createStudy } from '../src/calligraphy/study';
import { vectorLettering } from '../src/calligraphy/vectorEngine';
import { lettering } from '../src/calligraphy/engine';

const nearSegment=(p:{x:number;y:number},a:typeof p,b:typeof p)=>{const den=(b.x-a.x)**2+(b.y-a.y)**2,t=den?Math.max(0,Math.min(1,((p.x-a.x)*(b.x-a.x)+(p.y-a.y)*(b.y-a.y))/den)):0;return distance(p,{x:a.x+t*(b.x-a.x),y:a.y+t*(b.y-a.y)});};
test('adaptive flattening stays within 0.03 mm of dense cubic reference, including a loop',()=>{
  for(const d of ['M0 0 C0 100 100 -100 100 0','M0 0 C100 100 -100 100 0 0','M0 0 C1 0 1 0 100 0']){
    const path=parseCenterline(d)[0],a=path.nodes[0],b=path.nodes[1],points=sampleBezier([path],.03)[0].points;
    for(let i=0;i<=3000;i++){const p=cubic(a.p,a.out,b.in,b.p,i/3000);assert.ok(Math.min(...points.slice(1).map((q,j)=>nearSegment(p,points[j],q)))<=.03001);}
  }
});
test('de Casteljau node insertion preserves the original curve exactly',()=>{
  const p=parseCenterline('M0 0 C0 50 100 50 100 0')[0],q=insertNode(p,0,.4);
  for(let i=0;i<=100;i++){const t=i/100,a=p.nodes[0],b=p.nodes[1],segment=t<=.4?0:1,u=t<=.4?t/.4:(t-.4)/.6,c=q.nodes[segment],d=q.nodes[segment+1];assert.ok(distance(cubic(a.p,a.out,b.in,b.p,t),cubic(c.p,c.out,d.in,d.p,u))<1e-8);}
  assert.equal(p.nodes.length,2);assert.equal(q.nodes.length,3);
});
test('node, handle, delete, split, join, rotate and scale are immutable and survive JSON',()=>{
  const p=parseCenterline('M0 0 C0 50 100 50 100 0 L150 0')[0],q=moveControl(p,1,'p',{x:110,y:10});assert.equal(p.nodes[1].p.x,100);assert.equal(q.nodes[1].in.x,110);
  assert.equal(moveControl(p,1,'in',{x:80,y:30}).nodes[1].in.x,80);assert.equal(deleteNode(p,1).nodes.length,2);assert.throws(()=>deleteNode(parseCenterline('M0 0 L1 0')[0],0));
  const [a,b]=splitPath(p,1),joined=joinPaths(a,b);assert.equal(joined.nodes.length,p.nodes.length);assert.deepEqual(joined.nodes,p.nodes);
  const transformed=rotateScale(p,90,2);assert.ok(Math.abs(distance(transformed.nodes[0].p,transformed.nodes[1].p)-2*distance(p.nodes[0].p,p.nodes[1].p))<1e-8);
  const project=validateProject(JSON.parse(JSON.stringify({...newProject(),curves:[q]})));assert.deepEqual(project.curves,[q]);
});
test('V0.1 remains readable and keeps its original geometry and generator',()=>{
  const p=validateProject(JSON.parse(JSON.stringify(defaults)));assert.equal(p.version,1);assert.deepEqual(lettering(p),lettering(defaults));
  assert.throws(()=>validateProject({...newProject(),curves:[{id:'bad',nodes:[{p:{x:NaN,y:0}}]}]}));
});
test('diagnostics localize and group crossings, overlaps, proximity, cusps and tight radii',()=>{
  const curves=parseCenterline('M0 0 L100 100 M0 100 L100 0'),d=diagnose(sampleBezier(curves),defaults.params,curves),cross=d.anomalies.find(a=>a.kind==='incrocio');assert.ok(cross);assert.ok(distance(cross.position,{x:50,y:50})<1e-6);assert.equal(d.compatible,false);
  const overlap=fromStrokes([{points:[{x:0,y:0},{x:100,y:0}]},{points:[{x:20,y:0},{x:80,y:0}]}]);assert.ok(diagnose(sampleBezier(overlap),defaults.params,overlap).anomalies.some(a=>a.kind==='sovrapposizione'));
  const near=parseCenterline('M0 0 L100 0 M0 5 L100 5');const nd=diagnose(sampleBezier(near),defaults.params,near);assert.ok(nd.anomalies.some(a=>a.kind==='distanza'));assert.ok(nd.anomalies.length<20,'Repeated segment reports should be grouped');
  const cusp=parseCenterline('M0 0 L20 0 L20 20');assert.ok(diagnose(sampleBezier(cusp),defaults.params,cusp).anomalies.some(a=>a.kind==='cuspide'));
  const arc=parseCenterline('M0 5 C2.7614 5 5 2.7614 5 0');assert.ok(diagnose(sampleBezier(arc),defaults.params,arc).anomalies.some(a=>a.kind==='raggio'));
  const straight=parseCenterline('M0 0 L100 0');assert.equal(diagnose(sampleBezier(straight),defaults.params,straight).compatible,true);
});
test('optimizer preview leaves source untouched and does not raise error count',()=>{
  const paths=parseCenterline('M0 0 L80 0 L80 80'),original=structuredClone(paths),result=optimizePaths(paths,defaults.params);assert.deepEqual(paths,original);assert.ok(result.after.errors<=result.before.errors);assert.ok(result.changed);assert.ok(result.actions.length>0);
});
test('profiles preserve section, bend and cut interval and reject malformed JSON',()=>{
  const p=applyProfile(newProject(),demoProfiles[1]);assert.equal(p.params.ledWidth,8);assert.equal(p.cutInterval,50);assert.equal(p.bend,'laterale');assert.equal(validateProject(JSON.parse(JSON.stringify(p))).profiles?.[0].demonstrative,true);
  assert.throws(()=>validateProject({...p,profiles:[{...demoProfiles[0],cutInterval:0}]}));
});
test('calibration fits P1S with closed engraved mesh and valid STL/3MF exports',()=>{
  const cal=buildCalibration(defaults.params),c=cal.channel;assert.equal(cal.bedFits,true);assert.equal(c.validation.valid,true,JSON.stringify(c.validation));assert.ok(c.width<=256);assert.ok(c.height<=256);assert.ok(c.validation.volume<100000,'Avoid a heavy full-height plate');assert.equal(cal.legends.length,3);assert.equal(new Set(cal.tolerances).size,3);
  const bytes=stl(c),view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),positions:number[]=[];for(let i=0;i<view.getUint32(80,true);i++)for(let j=0;j<9;j++)positions.push(view.getFloat32(84+i*50+12+j*4,true));assert.equal(validateMesh(positions).valid,true);
  const zip=threeMF(c);assert.ok(strFromU8(unzipSync(zip)['3D/3dmodel.model']).includes('unit="millimeter"'));
  mkdirSync('.tools/legacy-examples/v02',{recursive:true});writeFileSync('.tools/legacy-examples/v02/calibrazione-P1S.stl',bytes);writeFileSync('.tools/legacy-examples/v02/calibrazione-P1S.3mf',zip);writeFileSync('.tools/legacy-examples/v02/calibrazione.json',JSON.stringify({mesh:c.validation,dimensions:{width:c.width,height:c.height,depth:c.depth},legends:cal.legends},null,2));c.geometry.dispose();
  assert.throws(()=>buildCalibration({...defaults.params,ledWidth:30}));
});
test('Stay playful study meets configured LED checks; mesh and plate validity remain separate',()=>{
  const p=createStudy(newProject()),curves=p.curves!,strokes=sampleBezier(curves),analysis=diagnose(strokes,p.params,curves),c=buildChannel(strokes,p.params);
  assert.equal(analysis.compatible,true);assert.ok(analysis.minRadius>=p.params.minRadius);assert.equal(analysis.errors,0);assert.equal(c.validation.valid,true,JSON.stringify(c.validation));assert.equal(bedCompatibility(c.width,c.height,c.depth).fits,false);
  const v=vectorLettering({...p,curves:undefined,text:'hello'});assert.ok(v.curves.length);assert.equal(v.notes.length,0);
  const svg=bezierSVG(curves);assert.ok(svg.includes(' C'));assert.ok(obj(c).includes('\nf '));
  writeFileSync('.tools/legacy-examples/v02/Stay-playful.filo.json',JSON.stringify(p,null,2));writeFileSync('.tools/legacy-examples/v02/Stay-playful.svg',svg);writeFileSync('.tools/legacy-examples/v02/Stay-playful.stl',stl(c));writeFileSync('.tools/legacy-examples/v02/Stay-playful.3mf',threeMF(c));writeFileSync('.tools/legacy-examples/v02/Stay-playful.obj',obj(c));writeFileSync('.tools/legacy-examples/v02/validation.json',JSON.stringify({mesh:c.validation,led:analysis,dimensions:{width:c.width,height:c.height,depth:c.depth},bed:bedCompatibility(c.width,c.height,c.depth)},null,2));c.geometry.dispose();
});

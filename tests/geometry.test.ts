import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync,writeFileSync } from 'node:fs';
import { unzipSync,strFromU8 } from 'fflate';
import { defaults,validateProject } from '../src/core/types';
import { lettering } from '../src/calligraphy/engine';
import { buildChannel,validateMesh } from '../src/geometry/channel';
import { productionReport } from '../src/optimization/analyze';
import { stl,threeMF,svg,obj } from '../src/export/exporters';
const params=defaults.params;
test('straight channel: exact dimensions, closed topology and analytic volume',()=>{
  const c=buildChannel([{points:[{x:0,y:0},{x:100,y:0}]}],params);
  assert.equal(c.validation.valid,true,JSON.stringify(c.validation));
  // Rounded caps are polygonal, with a configured arc tolerance of 0.015 mm.
  assert.ok(Math.abs(c.width-108.7)<0.04);assert.ok(Math.abs(c.height-8.7)<0.04);assert.equal(c.depth,8.5);
  const ro=4.35,ri=3.15,outer=100*ro*2+Math.PI*ro*ro,inner=100*ri*2+Math.PI*ri*ri,expected=outer*8.5-inner*7;
  assert.ok(Math.abs(c.validation.volume-expected)/expected<0.003);c.geometry.dispose();
});
test('boolean unions handle crossing, overlapping, closed and disjoint paths',()=>{
  const cases=[
    [{points:[{x:0,y:0},{x:100,y:100}]},{points:[{x:0,y:100},{x:100,y:0}]}],
    [{points:[{x:0,y:0},{x:100,y:0}]},{points:[{x:50,y:0},{x:120,y:0}]}],
    [{points:[{x:0,y:0},{x:100,y:0},{x:100,y:100},{x:0,y:100}],closed:true}],
    [{points:[{x:0,y:0},{x:100,y:0}]},{points:[{x:0,y:20},{x:100,y:20}]}],
  ];
  for(const strokes of cases){const c=buildChannel(strokes,params);assert.equal(c.validation.valid,true,JSON.stringify(c.validation));c.geometry.dispose();}
});
test('Stay playful mesh and exports: STL roundtrip, 3MF package and reusable fixture',()=>{
  const {strokes}=lettering(defaults),c=buildChannel(strokes,params);assert.equal(c.validation.valid,true,JSON.stringify(c.validation));
  const bytes=stl(c),view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),triangles=view.getUint32(80,true),roundtrip:number[]=[];
  assert.equal(triangles,c.validation.triangles);assert.equal(bytes.length,84+50*triangles);
  for(let i=0;i<triangles;i++)for(let j=0;j<9;j++)roundtrip.push(view.getFloat32(84+i*50+12+j*4,true));
  assert.equal(validateMesh(roundtrip).valid,true);
  const mf=threeMF(c),files=unzipSync(mf),xml=strFromU8(files['3D/3dmodel.model']);assert.ok(xml.includes('unit="millimeter"'));assert.equal((xml.match(/<triangle /g)||[]).length,triangles);assert.ok(files['_rels/.rels']);
  assert.ok(svg(strokes).includes('mm'));assert.ok(obj(c).includes('\nv '));
  const report=productionReport(strokes,params);assert.ok(report.length>400);assert.ok(report.warnings.length>0);
  mkdirSync('.tools/legacy-examples',{recursive:true});writeFileSync('.tools/legacy-examples/Stay-playful.stl',bytes);writeFileSync('.tools/legacy-examples/Stay-playful.3mf',mf);writeFileSync('.tools/legacy-examples/Stay-playful.svg',svg(strokes));writeFileSync('.tools/legacy-examples/Stay-playful.filo.json',JSON.stringify(defaults,null,2));writeFileSync('.tools/legacy-examples/validation.json',JSON.stringify({mesh:c.validation,dimensions:{width:c.width,height:c.height,depth:c.depth},production:report},null,2));c.geometry.dispose();
});
test('different sizes, styles and alphabet yield closed meshes',()=>{
  for(const text of ['a','Neon','hello','abcdefghijklmnopqrstuvwxyz','Stay playful'])for(const width of [200,600]){
    const p={...defaults,text,width},c=buildChannel(lettering(p).strokes,params);assert.equal(c.validation.valid,true,`${text} ${width}: ${JSON.stringify(c.validation)}`);c.geometry.dispose();
  }
});
test('invalid input and degenerate meshes are rejected',()=>{
  assert.throws(()=>buildChannel([],params));assert.throws(()=>buildChannel([{points:[{x:0,y:0},{x:1,y:0}]}],{...params,wall:-1}));
  assert.equal(validateMesh([0,0,0,0,0,0,0,0,0]).valid,false);
  assert.throws(()=>validateProject({...defaults,width:NaN}));assert.throws(()=>validateProject({...defaults,params:{...params,ledWidth:'6'}}));
  assert.throws(()=>validateProject({...defaults,imported:[{points:[{x:Infinity,y:0}]}]}));
  assert.ok(lettering({...defaults,text:'♥'}).notes.length>0);
});
test('LED length and bend warnings are independent from mesh validity',()=>{
  const r=productionReport([{points:[{x:0,y:0},{x:10,y:0},{x:10,y:10}]}],params);assert.equal(r.length,20);assert.ok(r.minRadius<params.minRadius);assert.ok(r.warnings.length>0);
});


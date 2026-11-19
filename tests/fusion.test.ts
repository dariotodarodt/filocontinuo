import test from 'node:test';
import assert from 'node:assert/strict';
import {buildChannel} from '../src/geometry/channel';
import {constrainedOne} from '../src/calligraphy/one/constrained';
import {parseCenterline,sampleBezier} from '../src/vector/bezier';
import {fusionGlyph} from '../src/calligraphy/one/fusion';
import {newProjectV3} from '../src/core/profiles';
const params=newProjectV3().params;
test('Love 600 mantiene il contorno e supera la validazione float32',()=>{
 const mesh=buildChannel(sampleBezier(parseCenterline(constrainedOne('Love',600,12))),params);
 assert.equal(mesh.validation.valid,true);assert.equal(mesh.validation.degenerate,0);assert.ok(Math.abs(mesh.validation.volume-35087.21)<.1);mesh.geometry.dispose();
});
test('i ritorni cambiano distanze fisiche al cambiare della divisoria',()=>{
 for(const mode of ['fusion','separate'] as const){
  const nodes=parseCenterline(fusionGlyph('l',200,params,mode,1.2,1))[0].nodes;
  const a=nodes[2].p,b=nodes.at(-3)!.p;
  assert.ok(Math.abs(Math.hypot(a.x-b.x,a.y-b.y)-(6.3+(mode==='fusion'?1.2:2.4)+.12))<1e-5);
 }
});
import ClipperLib from 'clipper-lib';
test('nel solido Fusion i due rami conservano la cavità e una divisoria materiale',()=>{
 const curves=parseCenterline(fusionGlyph('l',200,params,'fusion',1.2,1));
 const mesh=buildChannel(sampleBezier(curves),params);
 const nodes=curves[0].nodes;
 const mid=(a:{x:number;y:number},b:{x:number;y:number})=>({x:(a.x+b.x)/2,y:(a.y+b.y)/2});
 const a=mid(nodes[1].p,nodes[2].p),b=mid(nodes.at(-3)!.p,nodes.at(-2)!.p);
 const inside=(p:typeof a,paths:typeof mesh.inner)=>paths.reduce((sum,path)=>sum+(ClipperLib.Clipper.PointInPolygon({X:Math.round(p.x*1000),Y:Math.round(p.y*1000)},path)?Math.sign(ClipperLib.Clipper.Area(path)):0),0)>0;
 assert.ok(inside(a,mesh.inner)&&inside(b,mesh.inner));
 for(const t of [.43,.5,.57]){
  const point={x:a.x+t*(b.x-a.x),y:a.y+t*(b.y-a.y)};
  assert.ok(inside(point,mesh.outer)&&!inside(point,mesh.inner));
 }
 assert.equal(mesh.validation.valid,true);mesh.geometry.dispose();
});

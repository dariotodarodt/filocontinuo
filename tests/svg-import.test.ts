import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DOMParser} from 'linkedom';
import {importSVGCurves} from '../src/vector/paths';
import {bezierSVG} from '../src/export/exporters';
import {parseCenterline,sampleBezier} from '../src/vector/bezier';
// Lightweight XML DOM for parser unit tests; this is not a browser/visual test.
class TestDOMParser extends DOMParser {parseFromString(text:string,type:any){const doc=super.parseFromString(text,type);for(const el of doc.querySelectorAll('*')){const style=el.style;Object.defineProperty(el,'style',{value:new Proxy(style,{get(target,key){const value=Reflect.get(target,key);return value===undefined?'':value;}})});}return doc;}}
Object.assign(globalThis,{DOMParser:TestDOMParser});
test('SVG import preserves cubic controls and SVG transforms',()=>{
  const paths=importSVGCurves('<svg xmlns="http://www.w3.org/2000/svg"><g transform="translate(10 20)"><path d="M0 0 C10 30 40 30 50 0"/></g></svg>');
  assert.equal(paths.length,1);assert.equal(paths[0].nodes.length,2);assert.deepEqual(paths[0].nodes[0].p,{x:10,y:-20});assert.deepEqual(paths[0].nodes[0].out,{x:20,y:-50});assert.deepEqual(paths[0].nodes[1].in,{x:50,y:-50});
});
test('SVG export/import roundtrip retains Bézier geometry and mm dimensions',()=>{
  const original=parseCenterline('M0 0 C10 30 40 30 50 0 L80 0'),xml=bezierSVG(original),parsed=importSVGCurves(xml);assert.ok(xml.includes('mm'));const a=sampleBezier(parsed)[0],b=sampleBezier(original)[0];assert.equal(a.points.length,b.points.length);assert.equal(!!a.closed,!!b.closed);a.points.forEach((p,i)=>assert.ok(Math.hypot(p.x-b.points[i].x,p.y-b.points[i].y)<1e-8));
});
test('SVG rejects unsupported external content, text and arcs explicitly',()=>{
  for(const content of ['<text>ciao</text>','<use href="#a"/>','<image href="https://example.com/a.png"/>','<script>1</script>'])assert.throws(()=>importSVGCurves(`<svg xmlns="http://www.w3.org/2000/svg">${content}</svg>`),/Convertire/);
  assert.throws(()=>importSVGCurves('<svg xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="10"/></svg>'),/archi\/ellissi/);
});
test('closed single cubic loop is retained, not dropped or replaced by a line',()=>{
  const paths=importSVGCurves('<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0 C100 100 -100 100 0 0 Z"/></svg>');assert.equal(paths.length,1);assert.equal(paths[0].closed,true);assert.equal(paths[0].nodes.length,2);const points=sampleBezier(paths)[0].points;assert.ok(Math.max(...points.map(p=>p.y))>70||Math.min(...points.map(p=>p.y))< -70);assert.ok(points.length>50);
});

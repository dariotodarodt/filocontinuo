import test from 'node:test';
import assert from 'node:assert/strict';
import {constrainedOne} from '../src/calligraphy/one/constrained';
import {parseCenterline,sampleBezier} from '../src/vector/bezier';
import {inspectPaths} from '../src/optimization/strict';
import {newProjectV3} from '../src/core/profiles';
import {bezierBounds} from '../src/vector/bounds';
import {validateProject} from '../src/core/types';
test('ONE vincolato rispetta R12 sulle cubiche effettive di Love, Amore e Memo a 600 mm',()=>{
 for(const text of ['Love','Amore','Memo']){
  const curves=parseCenterline(constrainedOne(text,600,12));
  const p=newProjectV3(),report=inspectPaths(sampleBezier(curves),p.params,curves);
  assert.equal(curves.length,1);
  assert.equal(report.status,'compatible');
  assert.ok(report.minRadius>=12);
  assert.ok(Math.abs(bezierBounds(curves).width-600)<1e-5);
  const one={engine:'0.4.2',rounding:0.5,perWord:false};
  assert.deepEqual(validateProject({...p,curves,one}).one,one);
 }
});
test('ONE rifiuta una larghezza insufficiente e i caratteri non progettati',()=>{
 assert.throws(()=>constrainedOne('Love Love',400,12),/insufficiente/);
 assert.throws(()=>constrainedOne('Stay playful',600,12),/Glifo/);
});

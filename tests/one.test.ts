import test from 'node:test';
import assert from 'node:assert/strict';
import {oneCenterline} from '../src/calligraphy/one/centerline';
import {parseCenterline} from '../src/vector/bezier';
test('ONE conserva un solo percorso anche tra parole e rifiuta i caratteri assenti',()=>{
 for(const text of ['Love','Amore Olivia','Ciao','lloo']) assert.equal(parseCenterline(oneCenterline(text,400)).length,1);
 assert.throws(()=>oneCenterline('Ω',400),/non supportato/);
});
test('ONE per parola interrompe il filo solo negli spazi',()=>{
 const paths=parseCenterline(oneCenterline('Love  Olivia',600,0.35,true));
 assert.equal(paths.length,2);
 assert.ok(paths.every(path=>!path.closed));
 assert.notEqual(oneCenterline('Love',400,0.2),oneCenterline('Love',400,0.5));
});
import {sampleBezier} from '../src/vector/bezier';
import {newProjectV3} from '../src/core/profiles';
import {inspectPaths} from '../src/optimization/strict';
import {validateProject} from '../src/core/types';
test('ONE conserva i ritorni senza incroci rilevati e segnala i raggi insufficienti',()=>{
 const project=newProjectV3();
 for(const text of ['Love','Amore','Stay playful','bbjjkkqqxx']){
  const curves=parseCenterline(oneCenterline(text,400));
  const loaded=validateProject(JSON.parse(JSON.stringify({...project,text,width:400,curves})));
  assert.deepEqual(loaded.curves,curves);
  const report=inspectPaths(sampleBezier(curves),project.params,curves);
  assert.equal(report.raw.intersections,0);
  assert.equal(report.raw.overlaps,0);
  assert.equal(report.status,'incompatible');
 }
});

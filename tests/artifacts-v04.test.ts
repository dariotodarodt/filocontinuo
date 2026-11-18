import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {DOMParser} from 'linkedom';
import {validateProject} from '../src/core/types';import {validateStyleFamily} from '../src/calligraphy/studio/schema';
test('V0.4 gallery stores 30 portable frozen projects and true central-curve SVGs for all study texts',()=>{
 const dir='examples/v04',files=fs.readdirSync(dir).filter(f=>f.endsWith('.filo.json'));assert.equal(files.length,30);
 for(const f of files){const p=validateProject(JSON.parse(fs.readFileSync(dir+'/'+f,'utf8')));assert.equal(p.generator,'studio');assert.ok(p.studio?.family.version);assert.deepEqual(p.curves,p.studio?.snapshot);const doc=new DOMParser().parseFromString(fs.readFileSync(dir+'/'+f.replace('.filo.json','.svg'),'utf8'),'image/svg+xml');assert.ok(doc.querySelectorAll('path').length);assert.equal(doc.querySelectorAll('text').length,0);}
 for(const family of ['signature','minimal','vintage'])assert.equal(validateStyleFamily(JSON.parse(fs.readFileSync(`${dir}/families/${family}-1.0.0.json`,'utf8'))).id,family);
 const report=JSON.parse(fs.readFileSync(dir+'/confronto.json','utf8')),stay=report.results.filter((r:any)=>r.text==='Stay playful');assert.equal(stay.length,9);assert.equal(report.legacy.length,6);for(const r of stay){assert.equal(r.parameters.minRadius,12);assert.equal(r.mesh.valid,true);assert.equal(r.ledState,'incompatible');assert.ok(r.radiusObservedMM<12);}
});

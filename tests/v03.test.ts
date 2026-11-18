import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {defaults,distance,validateProject} from '../src/core/types';
import {newProject,newProjectV3} from '../src/core/profiles';
import {cubic,openPath,parseCenterline,reversePath,sampleBezier} from '../src/vector/bezier';
import {inspectCubic,radiusAt} from '../src/optimization/curvature';
import {inspectPaths} from '../src/optimization/strict';
import {connectWithTangents,deviationBound,optimizeContinuous} from '../src/optimization/continuous';
import {generateVariants} from '../src/calligraphy/variants';
import {contextualLettering} from '../src/calligraphy/contextual';
import {makeHistory,pushHistory,undoHistory,redoHistory} from '../src/core/history';
import {JobGate} from '../src/workers/gate';
import {evaluateProject} from '../src/workers/evaluate';

test('conservative curvature includes endpoints and bounds a dense quarter circle',()=>{
  const p=parseCenterline('M20 0 C20 11.045695 11.045695 20 0 20')[0],a=p.nodes[0],b=p.nodes[1],r=inspectCubic([a.p,a.out,b.in,b.p],12);assert.ok(r.lowerBound>=12);assert.ok(r.observed>19);assert.equal(r.unresolved,false);
  for(let i=0;i<=2000;i++)assert.ok(r.lowerBound<=radiusAt(a.p,a.out,b.in,b.p,i/2000)+1e-6);
  const small=parseCenterline('M1 0 C1 .552285 .552285 1 0 1')[0],q=inspectCubic([small.nodes[0].p,small.nodes[0].out,small.nodes[1].in,small.nodes[1].p],12);assert.ok(q.observed<12);
});
test('null derivatives, reversals, corners and inconclusive cases never become green',()=>{
  for(const d of ['M0 0 C0 0 10 10 20 0','M0 0 C100 0 -100 0 0 0','M0 0 L20 0 L20 20']){const p=parseCenterline(d),r=inspectPaths(sampleBezier(p),defaults.params,p);assert.notEqual(r.status,'compatible');assert.equal(r.compatible,false);}
  const flat=parseCenterline('M0 0 L100 0'),r=inspectPaths(sampleBezier(flat),defaults.params,flat);assert.equal(r.status,'compatible');assert.equal(r.radiusLower,Infinity);
  assert.equal(inspectPaths(sampleBezier(flat),defaults.params).status,'unknown');
  const quarter=parseCenterline('M12.1 0 C12.1 6.682645 6.682645 12.1 0 12.1')[0],a=quarter.nodes[0],b=quarter.nodes[1];assert.equal(inspectCubic([a.p,a.out,b.in,b.p],12,0).unresolved,true);
  const small=parseCenterline('M8 0 C8 4.41828 4.41828 8 0 8');assert.equal(inspectPaths(sampleBezier(small),{...defaults.params,ledWidth:20,minRadius:1},small).compatible,false);
});
test('reverse and opening closed paths preserve the entire geometry',()=>{
  const p=parseCenterline('M0 0 C0 30 40 30 40 0')[0],q=reversePath(p);for(let i=0;i<=100;i++)assert.ok(distance(cubic(p.nodes[0].p,p.nodes[0].out,p.nodes[1].in,p.nodes[1].p,i/100),cubic(q.nodes[0].p,q.nodes[0].out,q.nodes[1].in,q.nodes[1].p,1-i/100))<1e-8);
  const closed=parseCenterline('M0 0 L50 0 L50 50 L0 50')[0];closed.closed=true;const open=openPath(closed,2);assert.equal(open.closed,false);assert.deepEqual(open.nodes[0].p,open.nodes.at(-1)!.p);assert.equal(open.nodes.length,closed.nodes.length+1);assert.equal(closed.closed,true);
});
test('connector can bridge separated endpoints with reversal, and rejects excessive deviation',()=>{
  const paths=parseCenterline('M0 0 L50 0 M100 0 L60 0'),result=optimizeContinuous(paths,defaults.params,{maxDeviation:8,maxWidth:150});assert.equal(result.changed,true);assert.equal(result.curves.length,1);assert.ok(result.maxDisplacement<=8);assert.equal(result.after.status,'compatible');assert.equal(paths.length,2);
  const rejected=optimizeContinuous(paths,defaults.params,{maxDeviation:2,maxWidth:150});assert.equal(rejected.changed,false);assert.equal(rejected.curves.length,2);
  const aux=structuredClone(paths);aux[1].role='auxiliary';assert.equal(optimizeContinuous(aux,defaults.params,{maxDeviation:8,maxWidth:150}).changed,false);
  const tight=connectWithTangents(parseCenterline('M0 0 L20 0')[0],parseCenterline('M21 1 L21 30')[0]);assert.equal(inspectPaths(sampleBezier([tight]),defaults.params,[tight]).compatible,false);
});
test('geometric displacement bound detects a large translation and is zero on identity',()=>{
  const a=parseCenterline('M0 0 L100 0'),b=parseCenterline('M0 10 L100 10');assert.equal(deviationBound(a,a,3),0);assert.ok(deviationBound(a,b,3)>3);assert.ok(deviationBound(a,b,15)>=10);
});
test('V1/V2 files and V3 metadata keep curves without silent regeneration',()=>{
  for(const p of [defaults,newProject(),JSON.parse(readFileSync('examples/v02/Stay-playful.filo.json','utf8'))])assert.deepEqual(validateProject(JSON.parse(JSON.stringify(p))),p);
  const p={...newProjectV3(),curves:parseCenterline('M0 0 C0 20 40 20 40 0'),calibrationNotes:'Nessuna prova ancora eseguita.'};assert.deepEqual(validateProject(JSON.parse(JSON.stringify(p))).curves,p.curves);
  assert.throws(()=>validateProject({...p,width:601,maxWidth:600}));
});
test('the same history reducer used by UI restores handles and invalidates redo after a new edit',()=>{
  const a=parseCenterline('M0 0 C0 20 40 20 40 0'),b=structuredClone(a);b[0].nodes[0].out.y=30;
  const h=pushHistory(makeHistory(a),b),undo=undoHistory(h);assert.deepEqual(undo.present,a);assert.deepEqual(redoHistory(undo).present,b);assert.equal(pushHistory(undo,a).future.length,0);assert.equal(h.present[0].nodes[0].out.y,30);
});
test('superseded and cancelled worker results are refused by the UI job gate',()=>{
  const gate=new JobGate(),old=gate.next(),current=gate.next();assert.equal(gate.accepts(old),false);assert.equal(gate.accepts(current),true);gate.cancel();assert.equal(gate.accepts(current),false);
});
test('three contextual alternatives differ and support every required study text',()=>{
  for(const text of ['Stay playful','Amore','Olivia','Tradizione','Buon compleanno','Filocontinuo']){
    const p={...newProjectV3(),text,width:600},variants=generateVariants(p);assert.equal(new Set(variants.map(v=>JSON.stringify(v.curves))).size,3);assert.ok(variants.every(v=>v.notes.length===0&&v.width<=600.05&&v.context.length===text.replaceAll(' ','').length));
    for(const v of variants)for(const path of v.curves)for(const n of path.nodes.slice(1,-1))assert.ok(Math.hypot(n.p.x-n.in.x-(n.out.x-n.p.x),n.p.y-n.in.y-(n.out.y-n.p.y))<1e-7,'C1 derivative continuity, not only tangent alignment');
    assert.ok(contextualLettering(p).context.some(c=>c.form==='initial'));if(text==='Stay playful'){assert.ok(variants.every(v=>v.paths>=2&&v.paths<=4));assert.ok(variants.every(v=>!v.analysis.compatible));assert.ok(variants.every(v=>v.analysis.raw.intersections===0));}
  }
});
test('worker evaluation yields transferable mesh data, preserving exports and current-project geometry',()=>{
  const p={...newProjectV3(),curves:parseCenterline('M0 0 L100 0')},e=evaluateProject(p);assert.equal(e.mesh?.validation.valid,true);assert.ok(e.mesh?.positions instanceof Float32Array);assert.equal(e.diagnostics.status,'compatible');assert.equal(e.curves[0].nodes.length,2);
});

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {once} from 'node:events';
import {newProjectV3} from '../src/core/profiles';
import {parseCenterline} from '../src/vector/bezier';
test('actual computation worker returns matching jobs, mesh data and structured errors',async()=>{
  const worker=new Worker(new URL('./worker-harness.mjs',import.meta.url),{execArgv:['--import','tsx']});
  try{
    const p={...newProjectV3(),curves:parseCenterline('M0 0 L100 0')},pending=once(worker,'message');worker.postMessage({id:42,task:'evaluate',project:p});const [answer]=await pending;assert.equal(answer.id,42);assert.equal(answer.result.mesh.validation.valid,true);assert.ok(answer.result.mesh.positions instanceof Float32Array);
    const next=once(worker,'message');worker.postMessage({id:43,task:'evaluate',project:{...p,params:{...p.params,wall:-1}}});const [bad]=await next;assert.equal(bad.id,43);assert.match(bad.error,/Parametri/);
  }finally{await worker.terminate();}
});

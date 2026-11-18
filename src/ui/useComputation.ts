import { useCallback,useEffect,useRef,useState } from 'react';
import { type Project } from '../core/types';
import { type BezierPath } from '../vector/bezier';
import { type Evaluation,emptyEvaluation } from '../workers/evaluate';
import { type generateVariants } from '../calligraphy/variants';
import { type optimizeContinuous } from '../optimization/continuous';
import { JobGate } from '../workers/gate';
type Result=Evaluation|ReturnType<typeof generateVariants>|ReturnType<typeof optimizeContinuous>;
export function useComputation(p:Project){
  const key=JSON.stringify({...p,neon:undefined});
  const [evaluation,setEvaluation]=useState(()=>emptyEvaluation(p)),[source,setSource]=useState<string|null>(null),[busy,setBusy]=useState(''),[error,setError]=useState(''),[pending,setPending]=useState(true),[extra,setExtra]=useState<{task:string;result:Result}|null>(null);
  const worker=useRef<Worker|null>(null),gate=useRef(new JobGate());
  const cancel=useCallback(()=>{gate.current.cancel();worker.current?.terminate();worker.current=null;setBusy('');setPending(true);setError('Calcolo annullato. Dati precedenti conservati; ricalcolare prima di esportare.');},[]);
  const run=useCallback((task:'evaluate'|'variants'|'optimize',project:Project,curves?:BezierPath[])=>{
    worker.current?.terminate();const id=gate.current.next();setBusy(task==='evaluate'?'Analisi e mesh':task==='variants'?'Generazione varianti':'Ottimizzazione');setError('');if(task==='evaluate')setPending(true);
    if(typeof Worker==='undefined'){setBusy('');setError('Web Worker non disponibile: il progetto resta salvabile.');return;}
    try{const w=new Worker(new URL('../workers/computation.worker.ts',import.meta.url),{type:'module'});worker.current=w;
      w.onmessage=e=>{if(!gate.current.accepts(e.data.id))return;setBusy('');if(e.data.error){setError(e.data.error);w.terminate();return;}if(task==='evaluate'){setEvaluation(e.data.result);setSource(JSON.stringify({...project,neon:undefined}));setPending(false);}else setExtra({task,result:e.data.result});w.terminate();if(worker.current===w)worker.current=null;};
      w.onerror=e=>{if(!gate.current.accepts(id))return;setBusy('');setError(e.message||'Errore nel worker.');w.terminate();};w.postMessage({id,task,project,curves});
    }catch(e){setBusy('');setError((e as Error).message);}
  },[]);
  useEffect(()=>{setExtra(null);run('evaluate',p);return()=>{gate.current.cancel();worker.current?.terminate();};},[key,run]);
  return {evaluation,busy,error,pending:pending||source!==key,extra,run,cancel,retry:()=>run('evaluate',p)};
}

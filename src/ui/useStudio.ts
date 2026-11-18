import {useEffect,useRef,useState} from 'react';
import type {Project} from '../core/types';
import type {StudioCandidate,StudioRequest} from '../calligraphy/studio/compose';
import {JobGate} from '../workers/gate';
export function useStudio(project:Project,request:StudioRequest){
 const [result,setResult]=useState<StudioCandidate[]>([]),[resultProject,setResultProject]=useState(project),[resultKey,setResultKey]=useState(''),[pending,setPending]=useState(true),[error,setError]=useState('');
 const worker=useRef<Worker|null>(null),gate=useRef(new JobGate()),[revision,retry]=useState(0);const key=JSON.stringify([{...project,neon:undefined},request]);
 const cancel=()=>{gate.current.cancel();worker.current?.terminate();setPending(true);setError('Confronto annullato. Ultime anteprime conservate: ricalcolare prima di applicare.');};
 useEffect(()=>{const id=gate.current.next();worker.current?.terminate();setPending(true);setError('');const timer=setTimeout(()=>{
  if(typeof Worker==='undefined'){setError('Web Worker non disponibile: confronto non eseguito.');return;}
  try{const w=new Worker(new URL('../workers/computation.worker.ts',import.meta.url),{type:'module'});worker.current=w;
   w.onmessage=e=>{if(!gate.current.accepts(e.data.id))return;w.terminate();if(e.data.error){setError(e.data.error);return;}setResult(e.data.result);setResultProject(project);setResultKey(key);setPending(false);};
   w.onerror=e=>{if(gate.current.accepts(id))setError(e.message||'Errore nel confronto.');w.terminate();};w.postMessage({id,task:'studio',project,studio:request});
  }catch(e){setError((e as Error).message);}
 },250);return()=>{clearTimeout(timer);gate.current.cancel();worker.current?.terminate();};},[key,revision]);
 return {result,resultProject,pending:pending||resultKey!==key,error,cancel,retry:()=>retry(n=>n+1)};
}

import {useEffect} from 'react';
import {desktop} from '../desktop/api';
import {APP_VERSION} from '../appVersion';
import {newProjectV3} from '../core/profiles';
import {builtInFamilies} from '../calligraphy/studio/families';
import {studioDefaults} from '../calligraphy/studio/schema';
import {studioProject,type StudioCandidate} from '../calligraphy/studio/compose';
// Self-test runs only when the preload exposes the test-only readiness API.
export function useStudioSmoke(){useEffect(()=>{const api=desktop();if(!api?.reportReady)return;
 const p={...newProjectV3(),text:'Amore'},w=new Worker(new URL('../workers/computation.worker.ts',import.meta.url),{type:'module'});let familyIds:string[]=[];
 w.onmessage=e=>{if(e.data.error){console.error('Smoke Studio: '+e.data.error);w.terminate();return;}
  if(e.data.task==='studio'){const candidates=e.data.result as StudioCandidate[];familyIds=candidates.map(c=>c.familyId);const candidate=candidates.find(c=>c.familyId==='minimal');if(!candidate||familyIds.length!==3)throw Error('Famiglie desktop mancanti.');w.postMessage({id:2,task:'evaluate',project:studioProject(p,candidate)});}
  else if(e.data.task==='evaluate'){if(e.data.result.mesh?.validation.valid)void api.reportReady!({version:APP_VERSION,workerReady:true,meshValid:true,studioFamilies:familyIds});else console.error('Smoke Studio: mesh non valida.');w.terminate();}
 };w.postMessage({id:1,task:'studio',project:p,studio:{families:builtInFamilies,options:studioDefaults}});return()=>w.terminate();},[]);}

import { evaluateProject } from './evaluate';
import { generateVariants } from '../calligraphy/variants';
import { optimizeContinuous } from '../optimization/continuous';
import { type Project } from '../core/types';
import { type BezierPath } from '../vector/bezier';
import {studioCandidates,type StudioRequest} from '../calligraphy/studio/compose';
self.onmessage=(event:MessageEvent<{id:number;task:'evaluate'|'variants'|'optimize'|'studio';project:Project;curves?:BezierPath[];studio?:StudioRequest}>)=>{
  const {id,task,project,curves}=event.data;
  try{const result=task==='studio'?studioCandidates(project,event.data.studio!):task==='evaluate'?evaluateProject(project):task==='variants'?generateVariants(project):optimizeContinuous(curves||[],project.params,{maxDeviation:project.maxDeviation??3,maxWidth:project.maxWidth??2000});
    self.postMessage({id,task,result});
  }catch(e){self.postMessage({id,task,error:(e as Error).message});}
};

export type UpdateState={status:string;currentVersion:string;available:{version:string;date:string|null;notes:string;size:number}|null;progress:number;message:string;canDownload:boolean;canInstall:boolean;experimental:boolean};
export type DesktopAPI={
  info:()=>Promise<{version:string;packaged:boolean;platform:string;userData:string;experimental:boolean;repository:string}>;
  settings:()=>Promise<{schema:1;autoCheckUpdates:boolean}>;setAutoCheck:(value:boolean)=>Promise<{schema:1;autoCheckUpdates:boolean}>;
  openProject:()=>Promise<{project:unknown;name:string}|null>;saveFile:(v:{kind:'project'|'profiles'|'styles'|'svg'|'stl'|'3mf'|'obj';name:string;data:string|Uint8Array})=>Promise<{saved:boolean;name?:string}>;setDirty:(value:boolean)=>Promise<boolean>;
  updateState:()=>Promise<UpdateState>;checkUpdates:()=>Promise<UpdateState>;downloadUpdate:()=>Promise<UpdateState>;installUpdate:()=>Promise<UpdateState>;deferUpdate:()=>Promise<UpdateState>;
  onUpdate:(cb:(state:UpdateState)=>void)=>()=>void;onSaveRequest:(cb:()=>void)=>()=>void;onOpenSettings:(cb:()=>void)=>()=>void;
  backup:(snapshot:Record<string,string>)=>Promise<{saved:boolean}>;restore:(snapshot:Record<string,string>)=>Promise<Record<string,string>|null>;finishRestore:()=>Promise<boolean>;
  reportReady?:(value:{version:string;workerReady:boolean;meshValid:boolean;studioFamilies:string[]})=>Promise<boolean>;
};
declare global{interface Window{filocontinuo?:DesktopAPI;}}
export const desktop=():DesktopAPI|undefined=>typeof window==='undefined'?undefined:window.filocontinuo;
export function localSnapshot(){const data:Record<string,string>={};for(const key of ['filocontinuo-autosave','filocontinuo-last-valid','filocontinuo-profiles','filocontinuo-saved-signature','filocontinuo-ui','filocontinuo-styles','filocontinuo-style-preferences']){const v=localStorage.getItem(key);if(v!==null)data[key]=v;}return data;}

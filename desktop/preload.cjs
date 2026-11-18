const {contextBridge,ipcRenderer}=require('electron');
const invoke=(channel,...args)=>ipcRenderer.invoke(channel,...args);
contextBridge.exposeInMainWorld('filocontinuo',Object.freeze({
  info:()=>invoke('app:info'),settings:()=>invoke('settings:get'),setAutoCheck:value=>invoke('settings:auto-check',value),
  openProject:()=>invoke('project:open'),saveFile:value=>invoke('file:save',value),setDirty:value=>invoke('project:dirty',value),
  updateState:()=>invoke('updates:state'),checkUpdates:()=>invoke('updates:check'),downloadUpdate:()=>invoke('updates:download'),installUpdate:()=>invoke('updates:install'),deferUpdate:()=>invoke('updates:defer'),
  backup:snapshot=>invoke('backup:create',snapshot),restore:snapshot=>invoke('backup:restore',snapshot),finishRestore:()=>invoke('backup:reload'),
  onUpdate:callback=>{const listener=(_event,state)=>callback(state);ipcRenderer.on('updates:state',listener);return()=>ipcRenderer.removeListener('updates:state',listener);},
  onSaveRequest:callback=>{const listener=()=>callback();ipcRenderer.on('project:request-save',listener);return()=>ipcRenderer.removeListener('project:request-save',listener);},
  onOpenSettings:callback=>{const listener=()=>callback();ipcRenderer.on('app:open-settings',listener);return()=>ipcRenderer.removeListener('app:open-settings',listener);},
  ...(process.argv.includes('--filocontinuo-smoke')?{reportReady:report=>invoke('smoke:ready',report)}:{}),
}));

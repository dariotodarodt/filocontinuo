const {app,BrowserWindow,protocol,ipcMain,dialog,session,Menu}=require('electron');
const fs=require('node:fs');const path=require('node:path');
const {CSP,isTrustedUrl,resolveAsset,trustedIpc,validateSave,validateSnapshot}=require('./security.cjs');
const {SettingsStore,atomicWrite,validateSettings}=require('./store.cjs');
const {validateProject,validateProfile,validateStyleFamily,validateStyleLibrary,validateStylePreferences}=require('./generated/project-schema.cjs');
const {UpdateController}=require('./update-controller.cjs');
const {verifyAuthenticode}=require('./signature.cjs');
const {CancellationToken}=require('builder-util-runtime');
const {validateBackupSnapshot}=require('./backup.cjs');
const smoke=process.argv.includes('--smoke-test');
const reviewDir=process.argv.find(a=>a.startsWith('--review-dir='))?.slice(13);
app.setName('FILOCONTINUO');
if(smoke||reviewDir){const dir=smoke?process.argv.find(a=>a.startsWith('--smoke-dir='))?.slice(12):reviewDir;if(!dir||!path.isAbsolute(dir))throw Error('Directory smoke test assoluta richiesta.');fs.mkdirSync(path.join(dir,'UserData'),{recursive:true});fs.mkdirSync(path.join(dir,'Logs'),{recursive:true});app.setPath('userData',path.join(dir,'UserData'));app.setPath('logs',path.join(dir,'Logs'));}
protocol.registerSchemesAsPrivileged([{scheme:'filocontinuo',privileges:{standard:true,secure:true,supportFetchAPI:true,stream:true}}]);
let win,store,updates,dirty=true,closeAfterSave=false,restorePending=false,smokeTimer;
const resourceRoot=app.isPackaged?process.resourcesPath:path.join(__dirname,'..');
function readPolicy(){try{const p=JSON.parse(fs.readFileSync(path.join(resourceRoot,'release-policy.json'),'utf8'));if(p.schema!==1||p.repository!=='dariotodarodt/filocontinuo')throw Error();return {...p,enabled:!!(p.enabled&&p.publisherName&&p.publisherSubject&&app.isPackaged)};}catch{return {...require('./release-policy.json'),enabled:false};}}
function settings(){try{return store.read();}catch{return {schema:1,autoCheckUpdates:false};}}
const projectRoot=()=>reviewDir?path.join(reviewDir,'Progetti'):path.join(app.getPath('documents'),'FILOCONTINUO','Progetti');
function handle(channel,fn){ipcMain.handle(channel,async(event,...args)=>{if(!trustedIpc(event,win))throw Error('IPC rifiutato: origine o frame non valido.');return fn(...args);});}
function backupData(snapshot){return {format:'filocontinuo-user-backup',version:1,appVersion:app.getVersion(),createdAt:new Date().toISOString(),settings:settings(),snapshot:validateSnapshot(snapshot)};}
async function saveFile(value){
  const v=validateSave(value);if(v.kind==='project'){if(v.data.length>8*1024*1024)throw Error('Progetto oltre 8 MB.');validateProject(JSON.parse(v.data.toString('utf8')));}
  if(v.kind==='profiles'){const values=JSON.parse(v.data.toString('utf8'));if(!Array.isArray(values)||values.length>50)throw Error('Libreria profili non valida.');values.forEach(validateProfile);}
  if(v.kind==='styles'){if(v.data.length>2_000_000)throw Error('Famiglia oltre 2 MB.');validateStyleFamily(JSON.parse(v.data.toString('utf8')));}
  const extension={project:'json',profiles:'json',styles:'json',stl:'stl','3mf':'3mf',obj:'obj',svg:'svg'}[v.kind];fs.mkdirSync(projectRoot(),{recursive:true});
  const result=await dialog.showSaveDialog(win,{title:'Salva file FILOCONTINUO',defaultPath:path.join(projectRoot(),v.name),filters:[{name:v.kind==='project'?'Progetto FILOCONTINUO':v.kind.toUpperCase(),extensions:[extension]}]});
  if(result.canceled||!result.filePath){closeAfterSave=false;return {saved:false};}
  const target=result.filePath.toLowerCase().endsWith('.'+extension)?result.filePath:result.filePath+'.'+extension;
  try{fs.writeFileSync(target,v.data);}catch(e){closeAfterSave=false;throw e;}if(v.kind==='project'){dirty=false;if(closeAfterSave){closeAfterSave=false;setImmediate(()=>win.close());}}return {saved:true,name:path.basename(target)};
}
function installIpc(policy){
  handle('app:info',()=>({version:app.getVersion(),packaged:app.isPackaged,platform:process.platform,userData:app.getPath('userData'),experimental:!policy.enabled,repository:policy.repository}));
  handle('settings:get',()=>store.read());handle('settings:auto-check',value=>{if(typeof value!=='boolean')throw Error('Preferenza non valida.');return store.write({...store.read(),autoCheckUpdates:value});});
  handle('project:dirty',value=>{if(typeof value!=='boolean')throw Error('Stato progetto non valido.');dirty=value;return true;});
  handle('project:open',async()=>{const result=await dialog.showOpenDialog(win,{title:'Apri progetto FILOCONTINUO',defaultPath:projectRoot(),properties:['openFile'],filters:[{name:'Progetti FILOCONTINUO',extensions:['json']}]});if(result.canceled)return null;const file=result.filePaths[0];if(fs.statSync(file).size>8*1024*1024)throw Error('Progetto oltre 8 MB.');const project=validateProject(JSON.parse(fs.readFileSync(file,'utf8')));return {project,name:path.basename(file)};});
  handle('file:save',saveFile);
  handle('updates:state',()=>updates.snapshot());handle('updates:check',()=>app.isPackaged?updates.check():updates.set({status:'unsupported',message:'Controllo aggiornamenti disponibile nelle build installate.'}));handle('updates:download',()=>updates.download());handle('updates:install',()=>updates.install());handle('updates:defer',()=>updates.defer());
  handle('backup:create',async snapshot=>{const data=backupData(snapshot),result=await dialog.showSaveDialog(win,{title:'Backup dati FILOCONTINUO',defaultPath:path.join(app.getPath('documents'),'FILOCONTINUO-backup.json'),filters:[{name:'Backup',extensions:['json']}]});if(result.canceled)return {saved:false};atomicWrite(result.filePath,JSON.stringify(data,null,2));return {saved:true};});
  handle('backup:restore',async current=>{validateSnapshot(current);const selected=await dialog.showOpenDialog(win,{title:'Ripristina backup FILOCONTINUO',properties:['openFile'],filters:[{name:'Backup',extensions:['json']}]});if(selected.canceled)return null;const file=selected.filePaths[0];if(fs.statSync(file).size>20*1024*1024)throw Error('Backup troppo grande.');const data=JSON.parse(fs.readFileSync(file,'utf8'));if(data.format!=='filocontinuo-user-backup'||data.version!==1)throw Error('Formato backup non supportato.');validateSettings(data.settings);validateBackupSnapshot(data.snapshot,{validateProject,validateProfile,validateStyleLibrary,validateStylePreferences});
    const answer=await dialog.showMessageBox(win,{type:'warning',buttons:['Annulla','Ripristina dati'],defaultId:0,cancelId:0,message:'Sostituire impostazioni e dati dell’app con il backup?',detail:'I file di progetto esterni restano invariati. Verrà conservata una copia dei dati correnti.'});if(answer.response!==1)return null;store.backup(backupData(current),'pre-ripristino');store.write(data.settings);restorePending=true;return data.snapshot;
  });
  handle('backup:reload',()=>{if(!restorePending)throw Error('Nessun ripristino da completare.');restorePending=false;win.webContents.reload();return true;});
  if(smoke)handle('smoke:ready',report=>{if(!report||report.version!==app.getVersion()||report.workerReady!==true||report.meshValid!==true||!Array.isArray(report.studioFamilies)||['signature','minimal','vintage'].some(id=>!report.studioFamilies.includes(id)))throw Error('Smoke report non valido.');const dir=process.argv.find(a=>a.startsWith('--smoke-dir=')).slice(12);atomicWrite(path.join(dir,'result.json'),JSON.stringify({version:app.getVersion(),packaged:app.isPackaged,url:win.webContents.getURL(),workerReady:true,meshValid:true,webPreferences:{contextIsolation:win.webContents.getLastWebPreferences().contextIsolation,nodeIntegration:win.webContents.getLastWebPreferences().nodeIntegration,sandbox:win.webContents.getLastWebPreferences().sandbox},offlineRenderer:true,studioFamilies:report.studioFamilies},null,2));clearTimeout(smokeTimer);setTimeout(()=>app.exit(0),200);return true;});
}
async function start(){
  if(!app.requestSingleInstanceLock()){app.quit();return;}
  store=new SettingsStore(app.getPath('userData'));const policy=readPolicy();
  const uiSession=session.fromPartition('persist:filocontinuo-ui');
  uiSession.setPermissionRequestHandler((_wc,_permission,callback)=>callback(false));uiSession.setPermissionCheckHandler(()=>false);
  uiSession.webRequest.onBeforeRequest((details,callback)=>callback({cancel:!isTrustedUrl(details.url)&&!details.url.startsWith('blob:filocontinuo://app/')&&!details.url.startsWith('data:')}));
  const dist=path.join(app.getAppPath(),'dist');
  uiSession.protocol.handle('filocontinuo',async request=>{try{if(!['GET','HEAD'].includes(request.method))return new Response('',{status:405});const file=resolveAsset(dist,request.url);const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2','.ico':'image/x-icon'}[path.extname(file)]||'application/octet-stream';return new Response(request.method==='HEAD'?null:await fs.promises.readFile(file),{headers:{'Content-Type':mime,'Content-Security-Policy':CSP,'X-Content-Type-Options':'nosniff'}});}catch{return new Response('',{status:404});}});
  win=new BrowserWindow({title:'FILOCONTINUO',width:1440,height:1000,minWidth:900,minHeight:650,show:!smoke,backgroundColor:'#161d1c',icon:path.join(app.getAppPath(),'build','icon.ico'),webPreferences:{preload:path.join(__dirname,'preload.cjs'),partition:'persist:filocontinuo-ui',contextIsolation:true,nodeIntegration:false,nodeIntegrationInWorker:false,sandbox:true,webSecurity:true,webviewTag:false,additionalArguments:smoke?['--filocontinuo-smoke']:[]}});
  win.webContents.setWindowOpenHandler(()=>({action:'deny'}));win.webContents.on('will-navigate',event=>event.preventDefault());win.webContents.on('will-attach-webview',event=>event.preventDefault());
  const {NsisUpdater}=require('electron-updater');const transport=new NsisUpdater({provider:'github',owner:'dariotodarodt',repo:'filocontinuo',private:false});transport.logger=null;
  updates=new UpdateController({transport,currentVersion:app.getVersion(),policy,newCancellation:()=>new CancellationToken(),verifyFile:file=>verifyAuthenticode(file||app.getPath('exe'),policy.publisherSubject),isDirty:()=>dirty,confirm:async kind=>(await dialog.showMessageBox(win,{type:'question',buttons:['Annulla',kind==='download'?'Scarica aggiornamento':'Installa e riavvia'],defaultId:0,cancelId:0,message:kind==='download'?'Scaricare l’aggiornamento stabile?':'Installare il pacchetto verificato e riavviare FILOCONTINUO?'})).response===1});
  updates.on('state',state=>{if(win&&!win.isDestroyed())win.webContents.send('updates:state',state);});installIpc(policy);
  Menu.setApplicationMenu(Menu.buildFromTemplate([{label:'File',submenu:[{label:'Impostazioni e aggiornamenti',click:()=>win.webContents.send('app:open-settings')},{type:'separator'},{label:'Esci',click:()=>win.close()}]},{label:'Modifica',submenu:[{role:'undo',label:'Annulla'},{role:'redo',label:'Ripeti'},{type:'separator'},{role:'cut',label:'Taglia'},{role:'copy',label:'Copia'},{role:'paste',label:'Incolla'}]},{label:'Visualizza',submenu:[{role:'resetZoom',label:'Zoom 100%'},{role:'zoomIn',label:'Ingrandisci'},{role:'zoomOut',label:'Riduci'}]}]));
  win.on('close',event=>{if(!dirty||smoke)return;event.preventDefault();void dialog.showMessageBox(win,{type:'warning',buttons:['Annulla','Salva prima di uscire','Esci senza salvare'],defaultId:0,cancelId:0,message:'Il progetto contiene modifiche non salvate.'}).then(result=>{if(result.response===1){closeAfterSave=true;win.webContents.send('project:request-save');}if(result.response===2){dirty=false;win.close();}});});
  win.webContents.on('render-process-gone',()=>{if(smoke)app.exit(2);});
  await win.loadURL('filocontinuo://app/index.html');
  if(smoke)smokeTimer=setTimeout(()=>app.exit(3),45000);else if(settings().autoCheckUpdates)void updates.check();
}
app.on('second-instance',()=>{if(win){if(win.isMinimized())win.restore();win.focus();}});app.on('window-all-closed',()=>app.quit());
app.whenReady().then(start).catch(error=>{if(smoke){console.error(error.message);app.exit(1);}else dialog.showErrorBox('FILOCONTINUO',error.message);});

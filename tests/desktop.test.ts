import {test} from 'node:test';import assert from 'node:assert/strict';import {createRequire} from 'node:module';import {EventEmitter} from 'node:events';import {mkdtempSync,readFileSync,writeFileSync,existsSync} from 'node:fs';import path from 'node:path';
const require=createRequire(import.meta.url),security=require('../desktop/security.cjs'),{SettingsStore}=require('../desktop/store.cjs'),{UpdateController,newer,validateInfo}=require('../desktop/update-controller.cjs');
const info=()=>({version:'0.4.1',releaseDate:'2026-11-18T12:00:00Z',releaseNotes:'Correzioni compatibili.',files:[{url:'FILOCONTINUO-Setup-0.4.1-x64.exe',sha512:Buffer.alloc(64,1).toString('base64'),size:1000000}]});
class FakeUpdater extends EventEmitter{autoDownload=true;autoInstallOnAppQuit=true;allowPrerelease=true;allowDowngrade=true;disableWebInstaller=false;downloads=0;installs=0;checkResult:any={isUpdateAvailable:true,updateInfo:info()};downloadError:Error|null=null;async checkForUpdates(){return this.checkResult;}async downloadUpdate(){this.downloads++;if(this.downloadError)throw this.downloadError;return ['verified-test-installer.exe'];}quitAndInstall(){this.installs++;}}
function controller({enabled=true,consent=true,dirty=false,signature=true}={}){const transport=new FakeUpdater(),c=new UpdateController({transport,currentVersion:'0.4.0',policy:{enabled},verifyFile:async()=>signature,confirm:async()=>consent,isDirty:()=>dirty,newCancellation:()=>({cancel(){}})});return {c,transport};}
test('desktop protocol and IPC reject external origins, subframes and path traversal',()=>{
  const root=path.resolve('dist');assert.equal(security.resolveAsset(root,'filocontinuo://app/index.html'),path.join(root,'index.html'));for(const url of ['https://evil.example/index.html','filocontinuo://other/index.html','filocontinuo://app/a%5C..%5Cb.txt','filocontinuo://app/a/%2e%2e%2fsecret'])assert.throws(()=>security.resolveAsset(root,url));
  const frame={url:'filocontinuo://app/index.html'},wc={mainFrame:frame},win={isDestroyed:()=>false,webContents:wc};assert.equal(security.trustedIpc({sender:wc,senderFrame:frame},win),true);assert.equal(security.trustedIpc({sender:wc,senderFrame:{url:frame.url}},win),false);assert.equal(security.trustedIpc({sender:{},senderFrame:frame},win),false);
});
test('save and backup IPC schemas have bounded types and no arbitrary paths',()=>{
  assert.equal(security.validateSave({kind:'stl',name:'modello.stl',data:new Uint8Array([1,2])}).data.length,2);for(const name of ['../secret.exe','C:\\test.json','a/b.stl'])assert.throws(()=>security.validateSave({kind:'stl',name,data:'x'}));assert.throws(()=>security.validateSave({kind:'command',name:'x',data:'calc.exe'}));assert.throws(()=>security.validateSnapshot({token:'secret'}));assert.deepEqual(security.validateSnapshot({'filocontinuo-ui':'{}'}),{'filocontinuo-ui':'{}'});
});
test('settings are versioned, atomic and preserved on unsupported schemas',()=>{
  const root=mkdtempSync(path.resolve('.tools/tmp/settings-test-')),store=new SettingsStore(root);assert.equal(store.read().autoCheckUpdates,false);store.write({schema:1,autoCheckUpdates:true});store.write({schema:1,autoCheckUpdates:false});assert.ok(existsSync(path.join(root,'settings.json.previous')));assert.equal(store.read().autoCheckUpdates,false);
  const future='{"schema":99,"futureData":"keep"}';writeFileSync(store.file,future);assert.throws(()=>store.write({schema:1,autoCheckUpdates:true}));assert.equal(readFileSync(store.file,'utf8'),future);
});
test('checking never downloads, never installs and disables unsafe updater defaults',async()=>{
  const {c,transport}=controller();await c.check();assert.equal(c.snapshot().status,'available');assert.equal(transport.downloads,0);assert.equal(transport.installs,0);assert.equal(transport.autoDownload,false);assert.equal(transport.autoInstallOnAppQuit,false);assert.equal(transport.allowPrerelease,false);assert.equal(transport.allowDowngrade,false);assert.equal(transport.disableWebInstaller,true);c.defer();assert.equal(transport.installs,0);
});
test('unsigned experimental builds and declined consent cannot download or install',async()=>{
  const unsigned=controller({enabled:false});await unsigned.c.check();await assert.rejects(()=>unsigned.c.download());assert.equal(unsigned.transport.downloads,0);
  const declined=controller({consent:false});await declined.c.check();await declined.c.download();assert.equal(declined.transport.downloads,0);assert.equal(declined.transport.installs,0);
});
test('signature failures, corrupt downloads and unsaved work block installation',async()=>{
  const invalid=controller({signature:false});await invalid.c.check();await assert.rejects(()=>invalid.c.download());assert.equal(invalid.transport.downloads,0);
  const corrupt=controller();await corrupt.c.check();corrupt.transport.downloadError=Error('Checksum non valido');await corrupt.c.download();assert.equal(corrupt.c.snapshot().status,'error');assert.equal(corrupt.transport.installs,0);
  const dirty=controller({dirty:true});await dirty.c.check();await dirty.c.download();await assert.rejects(()=>dirty.c.install(),/Salva/);assert.equal(dirty.transport.installs,0);
});
test('manual install is the only installer trigger and requires verified package and consent',async()=>{
  const {c,transport}=controller();await c.check();await c.download();assert.equal(c.snapshot().canInstall,true);assert.equal(transport.installs,0);c.defer();assert.equal(transport.installs,0);await c.install();assert.equal(transport.installs,1);
});
test('stable metadata rejects downgrade, beta, unexpected URLs and malformed hashes',async()=>{
  assert.equal(newer('0.4.1','0.4.0'),true);for(const version of ['0.3.9','0.4.0','0.5.0-beta.1','01.0.0'])assert.equal(newer(version,'0.4.0'),false);
  for(const file of [{url:'https://evil.example/a.exe',sha512:Buffer.alloc(64).toString('base64'),size:1},{url:'FILOCONTINUO-Setup-0.4.1-x64.exe',sha512:'broken',size:1}])assert.throws(()=>validateInfo({...info(),files:[file]},'0.4.0'));
  const {c,transport}=controller();transport.checkResult={isUpdateAvailable:false,updateInfo:info()};await c.check();assert.equal(c.snapshot().canDownload,false);
});
test('backup restoration validates projects, profile libraries and preferences before applying them',()=>{
  const {validateBackupSnapshot}=require('../desktop/backup.cjs');const validators={validateProject:(p:any)=>{if(p?.format!=='filocontinuo')throw Error('Progetto non valido');},validateProfile:(p:any)=>{if(typeof p?.name!=='string')throw Error('Profilo non valido');}};
  const good={'filocontinuo-autosave':'{"format":"filocontinuo"}','filocontinuo-profiles':'[{"name":"LED demo"}]','filocontinuo-ui':'{"presentation":"neon","mode":"2d"}'};assert.deepEqual(validateBackupSnapshot(good,validators),good);assert.throws(()=>validateBackupSnapshot({...good,'filocontinuo-profiles':'{"token":"x"}'},validators));assert.throws(()=>validateBackupSnapshot({...good,'filocontinuo-ui':'{"mode":"remote"}'},validators));
});
test('offline checks fail visibly and never trigger background downloads',async()=>{
  const {c,transport}=controller();transport.checkForUpdates=async()=>{throw Error('ENOTFOUND: nessuna connessione');};await c.check();assert.equal(c.snapshot().status,'error');assert.equal(c.snapshot().canDownload,false);assert.equal(transport.downloads,0);assert.equal(transport.installs,0);
});
test('interrupted download can be retried without enabling automatic installation',async()=>{
  const transport=new FakeUpdater();let rejectDownload:(e:Error)=>void=()=>{};transport.downloadUpdate=()=>new Promise((_resolve,reject)=>{rejectDownload=reject;});
  const c=new UpdateController({transport,currentVersion:'0.4.0',policy:{enabled:true},verifyFile:async()=>true,confirm:async()=>true,isDirty:()=>false,newCancellation:()=>({cancel:()=>rejectDownload(Error('Interrotto'))})});await c.check();const downloading=c.download();await new Promise(resolve=>setImmediate(resolve));c.defer();await downloading;assert.equal(c.snapshot().status,'available');transport.downloadUpdate=async()=>['verified.exe'];await c.download();assert.equal(c.snapshot().status,'downloaded');assert.equal(transport.installs,0);assert.equal(transport.autoInstallOnAppQuit,false);
});

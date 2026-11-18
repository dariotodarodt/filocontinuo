const {EventEmitter}=require('node:events');
function stableVersion(v){if(typeof v!=='string'||!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(v))return null;const n=v.split('.').map(Number);return n.every(x=>Number.isSafeInteger(x)&&x<1000000)?n:null;}
function newer(a,b){const x=stableVersion(a),y=stableVersion(b);if(!x||!y)return false;for(let i=0;i<3;i++){if(x[i]!==y[i])return x[i]>y[i];}return false;}
function validateInfo(info,current){
  if(!info||!newer(info.version,current))throw Error('Metadati non validi, versione beta o downgrade rifiutato.');
  const expected=`FILOCONTINUO-Setup-${info.version}-x64.exe`;
  const file=info.files?.find(f=>f.url===expected);
  if(!file||typeof file.sha512!=='string'||!/^[A-Za-z0-9+/]{86}==$/.test(file.sha512)||Buffer.from(file.sha512,'base64').length!==64||!Number.isSafeInteger(file.size)||file.size<=0||file.size>2_000_000_000)throw Error('Metadati del pacchetto non validi.');
  const notes=typeof info.releaseNotes==='string'?info.releaseNotes:Array.isArray(info.releaseNotes)?info.releaseNotes.map(n=>String(n.note||'')).join('\n'):'';
  return {version:info.version,date:typeof info.releaseDate==='string'&&!Number.isNaN(Date.parse(info.releaseDate))?info.releaseDate:null,notes:notes.slice(0,20000),size:file.size};
}
class UpdateController extends EventEmitter{
  constructor({transport,currentVersion,policy,verifyFile,confirm,isDirty,newCancellation}){
    super();Object.assign(this,{transport,currentVersion,policy,verifyFile,confirm,isDirty,newCancellation});
    if(!('autoInstallOnAppQuit' in transport))throw Error('API updater non supportata: revisione richiesta.');
    transport.autoDownload=false;transport.autoInstallOnAppQuit=false;transport.allowPrerelease=false;transport.allowDowngrade=false;transport.disableWebInstaller=true;
    this.state={status:'idle',currentVersion,available:null,progress:0,message:'Nessun controllo eseguito.',canDownload:false,canInstall:false,experimental:!policy.enabled};
    transport.on('download-progress',p=>this.set({progress:Number.isFinite(p.percent)?Math.max(0,Math.min(100,p.percent)):0}));
    transport.on('error',e=>this.set({status:'error',message:String(e.message||e).slice(0,500),canDownload:false,canInstall:false}));
  }
  set(value){Object.assign(this.state,value);this.emit('state',this.snapshot());return this.snapshot();}
  snapshot(){return {...this.state};}
  async check(){
    if(['checking','downloading','installing'].includes(this.state.status))throw Error('Operazione già in corso.');
    if(this.state.status==='downloaded')return this.snapshot();
    this.set({status:'checking',available:null,message:'Controllo delle release stabili…',canDownload:false,canInstall:false});
    try{const result=await this.transport.checkForUpdates();if(!result?.updateInfo||result.isUpdateAvailable===false||!newer(result.updateInfo.version,this.currentVersion))return this.set({status:'current',message:'Nessun aggiornamento stabile compatibile disponibile.'});
      const available=validateInfo(result.updateInfo,this.currentVersion);this.cancellation=result.cancellationToken;
      return this.set({status:'available',available,canDownload:!!this.policy.enabled,message:this.policy.enabled?'Aggiornamento disponibile. Download solo su richiesta.':'Distribuzione sperimentale: firma non configurata, download aggiornamenti bloccato.'});
    }catch(e){return this.set({status:'error',message:String(e.message||e).slice(0,500),canDownload:false,canInstall:false});}
  }
  async download(){
    if(this.state.status!=='available'||!this.state.canDownload||!this.policy.enabled)throw Error('Download non autorizzato o firma non configurata.');
    if(!await this.confirm('download',this.state.available))return this.snapshot();
    if(!await this.verifyFile(null))throw Error('La firma dell’applicazione installata non è valida: aggiornamento bloccato.');
    this.cancelled=false;if(this.newCancellation)this.cancellation=this.newCancellation();
    this.set({status:'downloading',progress:0,message:'Download richiesto dall’utente…',canDownload:false});
    try{const files=await this.transport.downloadUpdate(this.cancellation);if(this.cancelled){this.cancelled=false;return this.set({status:'available',canDownload:true,message:'Download interrotto.'});}
      if(!files?.[0]||!await this.verifyFile(files[0]))throw Error('Firma del pacchetto non valida o non verificabile.');this.downloadedFile=files[0];return this.set({status:'downloaded',progress:100,canInstall:true,message:'Pacchetto verificato. Installazione solo su richiesta.'});
    }catch(e){const cancelled=!!this.cancelled;this.cancelled=false;return this.set({status:cancelled?'available':'error',message:cancelled?'Download interrotto.':String(e.message||e).slice(0,500),canDownload:cancelled,canInstall:false});}
  }
  async install(){
    if(this.state.status!=='downloaded'||!this.state.canInstall||!this.policy.enabled)throw Error('Nessun aggiornamento verificato da installare.');
    if(this.isDirty())throw Error('Salva le modifiche del progetto prima di installare.');
    if(!await this.confirm('install',this.state.available))return this.snapshot();
    if(this.isDirty()||!await this.verifyFile(this.downloadedFile))throw Error('Modifiche non salvate o firma non verificabile: installazione bloccata.');
    this.set({status:'installing',canInstall:false,message:'Installazione e riavvio richiesti dall’utente.'});this.transport.quitAndInstall(false,true);return this.snapshot();
  }
  defer(){if(this.state.status==='downloading'){this.cancelled=true;this.cancellation?.cancel();}return this.set({message:'Aggiornamento rimandato. Nessuna installazione automatica.'});}
}
module.exports={UpdateController,stableVersion,newer,validateInfo};

const path=require('node:path');
const ORIGIN='filocontinuo://app';
function isTrustedUrl(value){try{const u=new URL(value);return u.protocol==='filocontinuo:'&&u.hostname==='app'&&!u.port&&!u.username&&!u.password;}catch{return false;}}
function resolveAsset(root,url){
  if(!isTrustedUrl(url))throw Error('Origine non consentita.');
  const u=new URL(url),decoded=decodeURIComponent(u.pathname);
  if(decoded.includes('\0')||decoded.includes('\\')||decoded.split('/').includes('..'))throw Error('Percorso non consentito.');
  const target=path.resolve(root,'.'+(decoded==='/'?'/index.html':decoded)),relative=path.relative(root,target);
  if(relative.startsWith('..')||path.isAbsolute(relative))throw Error('Percorso esterno al pacchetto.');return target;
}
function trustedIpc(event,window){return !!window&&!window.isDestroyed()&&event.sender===window.webContents&&event.senderFrame===window.webContents.mainFrame&&isTrustedUrl(event.senderFrame?.url);}
const CSP="default-src 'self'; script-src 'self'; worker-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-src 'none'; frame-ancestors 'none'; form-action 'none'";
function validateSave(value){
  if(!value||typeof value!=='object'||!['project','profiles','stl','3mf','obj','svg'].includes(value.kind)||typeof value.name!=='string'||!/^[\w .-]{1,100}$/.test(value.name)||value.name.includes('..'))throw Error('Richiesta di salvataggio non valida.');
  const data=typeof value.data==='string'?Buffer.from(value.data,'utf8'):value.data instanceof Uint8Array?Buffer.from(value.data):null;
  if(!data||data.length>64*1024*1024)throw Error('File assente o oltre 64 MB.');
  return {name:value.name,kind:value.kind,data};
}
function validateSnapshot(snapshot){
  const keys=['filocontinuo-autosave','filocontinuo-last-valid','filocontinuo-profiles','filocontinuo-saved-signature','filocontinuo-ui'];
  if(!snapshot||typeof snapshot!=='object'||Array.isArray(snapshot))throw Error('Backup non valido.');
  for(const [key,value] of Object.entries(snapshot))if(!keys.includes(key)||typeof value!=='string'||Buffer.byteLength(value)>8*1024*1024)throw Error('Dato backup non consentito.');
  if(Buffer.byteLength(JSON.stringify(snapshot))>16*1024*1024)throw Error('Backup troppo grande.');return snapshot;
}
module.exports={ORIGIN,CSP,isTrustedUrl,resolveAsset,trustedIpc,validateSave,validateSnapshot};

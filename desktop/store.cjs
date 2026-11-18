const fs=require('node:fs');const path=require('node:path');
const defaultSettings={schema:1,autoCheckUpdates:false};
function validateSettings(s){if(!s||s.schema!==1||typeof s.autoCheckUpdates!=='boolean')throw Error('Impostazioni non supportate: conservare i dati e ripristinare un backup.');return {schema:1,autoCheckUpdates:s.autoCheckUpdates};}
function atomicWrite(file,data){fs.mkdirSync(path.dirname(file),{recursive:true});const temporary=file+'.tmp';fs.writeFileSync(temporary,data,{encoding:'utf8',mode:0o600});fs.renameSync(temporary,file);}
class SettingsStore{
  constructor(root){this.root=root;this.file=path.join(root,'settings.json');}
  read(){if(!fs.existsSync(this.file))return {...defaultSettings};return validateSettings(JSON.parse(fs.readFileSync(this.file,'utf8')));}
  write(value){const s=validateSettings(value);if(fs.existsSync(this.file)){this.read();fs.copyFileSync(this.file,this.file+'.previous');}atomicWrite(this.file,JSON.stringify(s,null,2));return s;}
  backup(data,label='manual'){const stamp=new Date().toISOString().replace(/[:.]/g,'-'),file=path.join(this.root,'Backups',`${label}-${stamp}.json`);atomicWrite(file,JSON.stringify(data,null,2));return file;}
}
module.exports={SettingsStore,atomicWrite,validateSettings};

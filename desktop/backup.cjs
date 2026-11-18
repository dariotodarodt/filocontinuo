const {validateSnapshot}=require('./security.cjs');
function validateBackupSnapshot(snapshot,validators){
  validateSnapshot(snapshot);
  for(const key of ['filocontinuo-autosave','filocontinuo-last-valid','filocontinuo-saved-signature'])if(snapshot[key])validators.validateProject(JSON.parse(snapshot[key]));
  if(snapshot['filocontinuo-profiles']){const profiles=JSON.parse(snapshot['filocontinuo-profiles']);if(!Array.isArray(profiles)||profiles.length>50)throw Error('Profili del backup non validi.');profiles.forEach(validators.validateProfile);}
  if(snapshot['filocontinuo-ui']){const p=JSON.parse(snapshot['filocontinuo-ui']);if(!p||typeof p!=='object'||p.presentation!==undefined&&!['calligrafica','tecnica','neon'].includes(p.presentation)||p.mode!==undefined&&!['2d','3d'].includes(p.mode))throw Error('Preferenze del backup non valide.');}
  if(snapshot['filocontinuo-styles'])validators.validateStyleLibrary(JSON.parse(snapshot['filocontinuo-styles']));
  if(snapshot['filocontinuo-style-preferences'])validators.validateStylePreferences(JSON.parse(snapshot['filocontinuo-style-preferences']));
  return snapshot;
}
module.exports={validateBackupSnapshot};

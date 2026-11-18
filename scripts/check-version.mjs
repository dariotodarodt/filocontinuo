import {readFileSync} from 'node:fs';
const p=JSON.parse(readFileSync('package.json','utf8')),lock=JSON.parse(readFileSync('package-lock.json','utf8')),requested=process.env.RELEASE_VERSION;
if(!/^\d+\.\d+\.\d+$/.test(p.version)||lock.version!==p.version||lock.packages[''].version!==p.version)throw Error('Versioni package/lock incoerenti o non stabili.');
if(requested&&requested!==p.version)throw Error('Tag e package.json devono coincidere.');console.log('Versione coerente: '+p.version);

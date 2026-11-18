import {build} from 'esbuild';import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';import {spawnSync} from 'node:child_process';import path from 'node:path';
const root=process.cwd();for(const name of ['tmp','electron-cache','electron-builder-cache'])mkdirSync(path.join(root,'.tools',name),{recursive:true});
Object.assign(process.env,{TEMP:path.join(root,'.tools/tmp'),TMP:path.join(root,'.tools/tmp'),ELECTRON_CACHE:path.join(root,'.tools/electron-cache'),ELECTRON_BUILDER_CACHE:path.join(root,'.tools/electron-builder-cache')});
await build({entryPoints:['desktop/schema-entry.ts'],outfile:'desktop/generated/project-schema.cjs',bundle:true,platform:'node',format:'cjs',target:'node22'});
const signed=process.env.FILOCONTINUO_SIGNED_RELEASE==='1',policy=JSON.parse(readFileSync('desktop/release-policy.json','utf8'));
if(signed){if(!process.env.CSC_LINK||!process.env.CSC_KEY_PASSWORD||!process.env.FILOCONTINUO_PUBLISHER_NAME||!process.env.FILOCONTINUO_PUBLISHER_SUBJECT)throw Error('Credenziali e identità del certificato mancanti.');Object.assign(policy,{enabled:true,publisherName:process.env.FILOCONTINUO_PUBLISHER_NAME,publisherSubject:process.env.FILOCONTINUO_PUBLISHER_SUBJECT,reason:null});}
writeFileSync('.tools/release-policy.json',JSON.stringify(policy,null,2));
const args=process.argv.slice(2);if(args.includes('--prepare-only'))process.exit(0);
const result=spawnSync(process.execPath,['node_modules/electron-builder/out/cli/cli.js','--config','electron-builder.config.cjs','--win','--x64','--publish','never',...(args.includes('--dir')?['--dir']:[]),...(args.includes('--prepackaged')?['--prepackaged',path.resolve('release/win-unpacked')]:[])],{stdio:'inherit',env:process.env});process.exit(result.status??1);

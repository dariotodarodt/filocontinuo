import test from 'node:test';import assert from 'node:assert/strict';import {Worker} from 'node:worker_threads';
import {builtInFamilies,cloneFamily} from '../src/calligraphy/studio/families';
import {studioDefaults,validateStyleFamily,validateStudioState,validateStyleLibrary,validateStylePreferences,neonDefaults} from '../src/calligraphy/studio/schema';
import {composeStudio,studioProject,replaceStudioLetter,studioCandidates} from '../src/calligraphy/studio/compose';
import {newProjectV3} from '../src/core/profiles';import {bounds,defaults,validateProject} from '../src/core/types';
import {vectorLettering} from '../src/calligraphy/vectorEngine';import {sampleBezier,moveControl} from '../src/vector/bezier';import {makeHistory,pushHistory,undoHistory,redoHistory} from '../src/core/history';
import {buildChannel} from '../src/geometry/channel';import {stl,threeMF,obj,bezierSVG} from '../src/export/exporters';import {unzipSync,strFromU8} from 'fflate';
import {renderToStaticMarkup} from 'react-dom/server';import React from 'react';import {LetterPreview} from '../src/ui/LetterPreview';
import {bezierBounds} from '../src/vector/bounds';import {parseCenterline} from '../src/vector/bezier';
import {createRequire} from 'node:module';
const project=(text='Amore',width=400)=>({...newProjectV3(),text,width,maxWidth:1000});
test('cubic dimensions use analytic extrema and enforce an exact target at large scale',()=>{
 const b=bezierBounds(parseCenterline('M0 0 C100 100 -100 100 0 0'));assert.ok(Math.abs(b.height-75)<1e-9);assert.ok(Math.abs(b.width-100/Math.sqrt(3))<1e-9);
 for(const family of builtInFamilies){const c=composeStudio({...project('Stay playful',800),maxWidth:800},family,studioDefaults);assert.ok(Math.abs(c.width-800)<1e-8);assert.equal(c.withinWidth,true);}
});
test('three original families have different glyph topology, metadata and complete declared repertoire',()=>{
 assert.deepEqual(builtInFamilies.map(f=>f.name),['Signature','Minimal','Vintage']);
 const topologies=builtInFamilies.map(f=>f.glyphs.a.paths.map(p=>p.nodes.length).join(','));assert.equal(new Set(topologies).size,3);
 const chars="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZàèéìòùÀÈÉÌÒÙ0123456789'’.,!?-+&";
 for(const family of builtInFamilies){assert.equal(validateStyleFamily(family).version,'1.0.0');for(const c of chars)assert.ok(family.glyphs[c],family.name+' '+c);assert.equal(family.license,'UNLICENSED');}
});
test('Italian study texts and uppercase accents are composed without fallback, unknown characters block application',()=>{
 for(const text of ['Stay playful','Amore','Olivia','Tradizione','Buon compleanno','Filocontinuo',"L'amore è luce",'MoruMì'])for(const family of builtInFamilies){const p=project(text),c=composeStudio(p,family,studioDefaults);assert.deepEqual(c.missing,[]);assert.ok(c.curves.length);assert.ok(Math.abs(c.width-400)<.04);}
 const p=project('A🙂'),c=composeStudio(p,builtInFamilies[1],studioDefaults);assert.deepEqual(c.missing,['🙂']);assert.equal(c.analysis.status,'unknown');assert.throws(()=>studioProject(p,c),/non applicabile/);
 const accent=composeStudio(project('ì'),builtInFamilies[1],studioDefaults);assert.equal(accent.state.placements[0].paths.length,2,'stem and accent; old i dot removed');
});
test('family input validation rejects missing license, bad schemas, unbounded controls and invented variants',()=>{
 for(const mutate of [(f:any)=>f.schema=2,(f:any)=>f.license='',(f:any)=>f.glyphs.a.paths[0].nodes[0].p.x=Infinity,(f:any)=>f.glyphs.a.variants={imaginary:f.glyphs.a},(f:any)=>f.supportedCharacters.push('🙂')]){const f=cloneFamily('minimal');mutate(f);assert.throws(()=>validateStyleFamily(f));}
 assert.throws(()=>validateStyleLibrary([cloneFamily('minimal'),cloneFamily('minimal')]),/duplicate/);assert.throws(()=>validateStylePreferences({schema:1,favorites:['https://invalid']}));
});
test('context and repeat forms change real controls, variants are deduplicated for unsupported alternatives',()=>{
 const p=project('llae'),base=composeStudio(p,builtInFamilies[0],studioDefaults),swash=composeStudio(p,builtInFamilies[0],{...studioDefaults,swashes:true});
 assert.equal(base.state.placements[1].variant,'repeated');assert.equal(swash.state.placements[0].variant,'initial');assert.equal(swash.state.placements.at(-1)?.variant,'final');assert.notDeepEqual(base.curves,swash.curves);
 const choices=studioCandidates(p,{families:[builtInFamilies[0]],options:studioDefaults,alternatives:true});assert.equal(choices.length,3);assert.equal(new Set(choices.map(c=>JSON.stringify(c.curves))).size,3);
 assert.equal(studioCandidates(project('XYZ'),{families:[builtInFamilies[1]],options:studioDefaults,alternatives:true}).length,1);
});
test('single-letter replacement freezes every other letter and refuses silently overwriting manual edits',()=>{
 const p=project('Amore'),c=composeStudio(p,builtInFamilies[0],{...studioDefaults,connections:false}),saved=studioProject(p,c),changed=replaceStudioLetter(saved,3,'wide');
 for(const g of c.state.placements)if(g.index!==3)assert.deepEqual(changed.state.placements.find(p=>p.index===g.index),g);
 assert.notDeepEqual(changed.state.placements[3].paths,c.state.placements[3].paths);
 const edited=structuredClone(saved);edited.curves![0]=moveControl(edited.curves![0],0,'p',{x:5,y:5});assert.throws(()=>replaceStudioLetter(edited,3,'wide'),/fuori dallo Studio/);assert.throws(()=>replaceStudioLetter(saved,3,'imaginary' as any),/non disponibile/);
 const extended=studioProject(p,composeStudio(p,builtInFamilies[0],{...studioDefaults,initialExtension:10,finalExtension:10,connections:false}));assert.deepEqual(replaceStudioLetter(extended,0,'base').state.placements[0].paths,extended.studio!.placements[0].paths);
});
test('multiline alignment and independent offsets preserve line isolation, maximum width is enforced',()=>{
 const p=project('Amore\nOlivia'),family=builtInFamilies[1],a=composeStudio(p,family,{...studioDefaults,alignment:'left'}),b=composeStudio(p,family,{...studioDefaults,alignment:'right'});
 assert.ok(a.state.placements.some(g=>g.line===1));assert.ok(a.state.links.every(([x,y])=>a.state.placements.find(p=>p.paths.some(q=>q.id===x))!.line===a.state.placements.find(p=>p.paths.some(q=>q.id===y))!.line));
 const line=(c:typeof a,index:number)=>bezierBounds(c.state.placements.filter(g=>g.line===index).flatMap(g=>g.paths));
 assert.ok(Math.abs(line(a,0).minX-line(a,1).minX)<.01);assert.ok(Math.abs(line(b,0).maxX-line(b,1).maxX)<.01);
 const moved=composeStudio(p,family,{...studioDefaults,lineOffsets:{1:{x:75,y:-20}}});assert.ok(line(moved,1).minX>line(a,1).minX+50);
 const limited={...p,maxWidth:400},wide=composeStudio(limited,family,{...studioDefaults,lineOffsets:{1:{x:500,y:0}}});assert.equal(wide.withinWidth,false);assert.throws(()=>studioProject(limited,wide));
 assert.throws(()=>composeStudio(project('a\na\na\na\na\na'),family,studioDefaults),/cinque righe/);
});
test('global proportions, capitals, spacing and terminal extensions modify the centerline, not a display effect',()=>{
 const p=project('Amore luce'),f=builtInFamilies[0],c=composeStudio(p,f,studioDefaults);for(const options of [{wordSpacing:2},{horizontal:1.5},{vertical:1.5},{capScale:1.3},{initialExtension:10},{finalExtension:10}]){const next=composeStudio(p,f,{...studioDefaults,...options});assert.notDeepEqual(next.curves,c.curves);assert.ok(Math.abs(next.width-400)<.04);}
});
test('automatic links require a conclusive safe full composition and never cross a word or line',()=>{
 const f=cloneFamily('signature'),line=cloneFamily('minimal').glyphs.l;f.glyphs={a:{advance:20,paths:[{id:'a',nodes:[{p:{x:0,y:0},in:{x:0,y:0},out:{x:5,y:0}},{p:{x:15,y:0},in:{x:10,y:0},out:{x:15,y:0}}]}]}};f.supportedCharacters=['a'];
 const p=project('aa'),linked=composeStudio(p,f,studioDefaults);assert.equal(linked.state.links.length,1);assert.equal(linked.paths,1);assert.equal(linked.analysis.status,'compatible');
 assert.equal(composeStudio(project('a a'),f,studioDefaults).state.links.length,0);assert.equal(composeStudio(project('a\na'),f,studioDefaults).state.links.length,0);
 const bad=composeStudio(project('Stay playful'),builtInFamilies[0],studioDefaults);assert.equal(bad.analysis.status,'incompatible');assert.equal(bad.state.links.length,0);assert.equal(project().params.minRadius,12);
});
test('saved Studio projects embed the exact style version and vectors, V1/V2 readers and history remain valid',()=>{
 const old=validateProject(defaults);assert.equal(old.version,1);const p=project(),candidate=composeStudio(p,builtInFamilies[1],studioDefaults),saved=validateProject(JSON.parse(JSON.stringify(studioProject(p,candidate))));
 assert.deepEqual(vectorLettering(saved).curves,candidate.curves);const family=cloneFamily('minimal');family.version='9.9.9';family.glyphs.a.paths[0].nodes[0].p.x+=100;assert.deepEqual(vectorLettering(saved).curves,candidate.curves);
 assert.equal(validateStudioState(saved.studio!).family.version,'1.0.0');assert.throws(()=>validateProject({...saved,curves:undefined}));
 let h=makeHistory(old);h=pushHistory(h,saved);h=undoHistory(h);assert.deepEqual(h.present,old);h=redoHistory(h);assert.deepEqual(h.present,saved);
});
test('new glyph geometry exports valid mesh and real SVG curves in all existing formats',()=>{
 for(const family of builtInFamilies){const c=composeStudio(project('Amore'),family,studioDefaults),channel=buildChannel(sampleBezier(c.curves),project().params);assert.equal(channel.validation.valid,true);assert.equal(channel.validation.boundary,0);assert.equal(channel.validation.nonManifold,0);assert.equal(channel.validation.degenerate,0);assert.ok(channel.validation.volume>0);
  const binary=stl(channel),count=new DataView(binary.buffer,binary.byteOffset,binary.byteLength).getUint32(80,true);assert.equal(count,channel.validation.triangles);const zip=unzipSync(threeMF(channel));assert.match(strFromU8(zip['3D/3dmodel.model']),/unit="millimeter"/);assert.match(obj(channel),/^v /m);assert.match(bezierSVG(c.curves),/ C/);channel.geometry.dispose();}
});
test('Neon on/off and colors use vector paths, color never changes saved geometry',()=>{
 const c=composeStudio(project(),builtInFamilies[1],studioDefaults),on=renderToStaticMarkup(React.createElement(LetterPreview,{curves:c.curves,neon:true,neonSettings:{...neonDefaults,color:'#12abcd'}})),off=renderToStaticMarkup(React.createElement(LetterPreview,{curves:c.curves,neon:true,neonSettings:{...neonDefaults,on:false}}));assert.match(on,/#12abcd/);assert.match(on,/non simulazione fotometrica/);assert.doesNotMatch(on,/<text/);assert.notEqual(on,off);assert.match(on,/filter="url/);assert.doesNotMatch(off,/filter="url/);
 assert.deepEqual(vectorLettering({...studioProject(project(),c),neon:{...neonDefaults,on:false}}).curves,c.curves);
});
test('personal style backups preserve families and favorites with the same strict validators as desktop IPC',()=>{
 const require=createRequire(import.meta.url),{validateBackupSnapshot}=require('../desktop/backup.cjs'),{validateSave}=require('../desktop/security.cjs');
 const personal=cloneFamily('minimal');personal.id='custom-minimal';const library=[personal],preferences={schema:1,favorites:['minimal@1.0.0']},snapshot={'filocontinuo-styles':JSON.stringify(library),'filocontinuo-style-preferences':JSON.stringify(preferences)};
 assert.deepEqual(validateBackupSnapshot(snapshot,{validateStyleLibrary,validateStylePreferences}),snapshot);assert.equal(validateSave({kind:'styles',name:'famiglia-minimal-1.0.0.json',data:JSON.stringify(library[0])}).kind,'styles');
 assert.throws(()=>validateBackupSnapshot({...snapshot,'filocontinuo-styles':'[{"schema":999}]'},{validateStyleLibrary,validateStylePreferences}));
 assert.throws(()=>composeStudio(project('%'.repeat(100)),builtInFamilies[1],studioDefaults),/200 percorsi/);
});
test('actual worker generates family proposals and a frozen Studio mesh using offline bundled data',async()=>{
 const worker=new Worker(new URL('./worker-harness.mjs',import.meta.url));try{const response=await new Promise<any>((resolve,reject)=>{worker.once('message',resolve);worker.once('error',reject);worker.postMessage({id:71,task:'studio',project:project('MoruMì'),studio:{families:builtInFamilies,options:studioDefaults}});});assert.equal(response.id,71);assert.equal(response.error,undefined);assert.deepEqual(response.result.map((c:any)=>c.familyId),['signature','minimal','vintage']);assert.ok(response.result.every((c:any)=>!c.missing.length));}finally{await worker.terminate();}
});

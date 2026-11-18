import {bounds,type Project,type Point} from '../../core/types';
import {joinPaths,node,sampleBezier,transformPaths,type BezierPath} from '../../vector/bezier';
import {checkBend,inspectPaths} from '../../optimization/strict';
import {bezierBounds} from '../../vector/bounds';
import {validateStyleFamily,validateStudioOptions,type StyleFamily,type StudioOptions,type GlyphVariant,type GlyphShape,type Placement,type StudioState} from './schema';
export type StudioRequest={families:StyleFamily[];options:StudioOptions;overrides?:Record<string,GlyphVariant>;alternatives?:boolean;letter?:{index:number;variant:GlyphVariant}};
const alpha=(s:string|undefined)=>!!s&&/^[\p{L}\p{N}]$/u.test(s);
export function glyphShape(f:StyleFamily,c:string,variant:GlyphVariant):GlyphShape{const g=f.glyphs[c];if(!g)throw Error('Carattere non supportato: '+c);if(variant==='base')return structuredClone({advance:g.advance,paths:g.paths,entry:g.entry,exit:g.exit});const v=g.variants?.[variant];if(!v)throw Error(`Variante ${variant} non disponibile per «${c}».`);return structuredClone(v);}
function extend(shape:GlyphShape,initial:number,final:number){const s=structuredClone(shape),p=s.paths[0];if(!p||p.closed)return s;
 if(initial){const a=p.nodes[0],b=node({x:a.p.x-initial,y:a.p.y-initial*.25});b.out={x:b.p.x+initial*.5,y:b.p.y};a.in={x:a.p.x-initial*.4,y:a.p.y};p.nodes.unshift(b);delete s.entry;}
 if(final){const a=p.nodes.at(-1)!,b=node({x:a.p.x+final,y:a.p.y+final*.25});a.out={x:a.p.x+final*.4,y:a.p.y};b.in={x:b.p.x-final*.5,y:b.p.y};p.nodes.push(b);delete s.exit;}return s;
}
function place(paths:BezierPath[],matrix:Placement['matrix'],index:number){const [a,b,c,d,e,f]=matrix;return transformPaths(paths,p=>({x:a*p.x+c*p.y+e,y:b*p.x+d*p.y+f})).map((p,j)=>({...p,id:`studio-${index}-${j}`}));}
export function mergeStudioPaths(placements:Placement[],links:StudioState['links']){
 const source=placements.flatMap(p=>p.paths),map=new Map(source.map(p=>[p.id,structuredClone(p)]));
 for(const [a,b]of links){const x=map.get(a),y=map.get(b);if(!x||!y||x===y)continue;const joined=joinPaths(x,y);for(const [key,v]of map)if(v===x||v===y)map.set(key,joined);}
 return [...new Set(source.map(p=>map.get(p.id)!))];
}
function potentialLinks(placements:Placement[]){const links:StudioState['links']=[];
 for(let i=1;i<placements.length;i++){const a=placements[i-1],b=placements[i];if(a.line!==b.line||a.index+1!==b.index||!alpha(a.character)||!alpha(b.character))continue;
  const x=a.paths[0],y=b.paths[0];if(!x||!y||x.closed||y.closed)continue;const end=x.nodes.at(-1)!,start=y.nodes[0],u={x:end.p.x-end.in.x,y:end.p.y-end.in.y},v={x:start.out.x-start.p.x,y:start.out.y-start.p.y};
  // This release joins only forward, horizontal baseline ports. No route guessing.
  if(start.p.x-end.p.x>1e-6&&Math.abs(end.p.y-start.p.y)<1e-6&&u.x>1e-8&&v.x>1e-8&&Math.abs(u.y)<1e-7&&Math.abs(v.y)<1e-7)links.push([x.id,y.id]);
 }return links;
}
function analyzed(p:Project,family:StyleFamily,options:StudioOptions,placements:Placement[],links:StudioState['links'],notes:string[],missing:string[],label:string,start:number){
 let curves=mergeStudioPaths(placements,links),strokes=sampleBezier(curves),analysis=checkBend(inspectPaths(strokes,p.params,curves),p.bend);
 if(links.length&&(!analysis.compatible||analysis.status==='unknown')){links=[];curves=mergeStudioPaths(placements,links);strokes=sampleBezier(curves);analysis=checkBend(inspectPaths(strokes,p.params,curves),p.bend);notes.push('Collegamenti non applicati: la composizione proposta ha anomalie o verifiche non conclusive.');}
 const box=bezierBounds(curves),withinWidth=box.width<=(p.maxWidth??2000)+.03;
 if(!withinWidth)notes.push('Composizione oltre la larghezza massima consentita: proposta non applicabile.');
 if(missing.length){analysis={...analysis,status:'unknown',compatible:false};notes.push('Caratteri mancanti: '+missing.join(' ')+'. Nessuna sostituzione eseguita.');}
 const state:StudioState={schema:1,family:structuredClone(family),options:structuredClone(options),placements,links,snapshot:structuredClone(curves),notes:[...new Set(notes)]};
 return {familyId:family.id,familyName:family.name,familyVersion:family.version,label,curves,state,notes:state.notes,missing,width:box.width,height:box.height,length:analysis.length,paths:curves.length,analysis,withinWidth,elapsedMs:performance.now()-start};
}
export type StudioCandidate=ReturnType<typeof analyzed>;
export function composeStudio(p:Project,family:StyleFamily,options:StudioOptions,overrides:Record<string,GlyphVariant>={},label='Contestuale'):StudioCandidate{
 const start=performance.now();family=validateStyleFamily(family);options=validateStudioOptions(options);
 const text=p.text.replace(/\r\n/g,'\n').normalize('NFC');if(text.length>100||text.split('\n').length>5)throw Error('Studio: massimo 100 caratteri e cinque righe.');
 const chars=[...text],notes:string[]=[],missing:string[]=[],raw:{index:number;character:string;line:number;variant:GlyphVariant;shape:GlyphShape;matrix:Placement['matrix']}[]=[];
 let cursor=0,line=0;
 chars.forEach((char,index)=>{
  if(char==='\n'){line++;cursor=0;return;}if(char===' '||char==='\t'){cursor+=family.metrics.space*options.wordSpacing*options.horizontal;return;}
  const g=family.glyphs[char];if(!g){missing.push(char);cursor+=family.metrics.em*.5*options.horizontal;return;}
  const prev=alpha(chars[index-1]),next=alpha(chars[index+1]);let variant:GlyphVariant='base';
  if(options.swashes){const form=prev?next?'medial':'final':next?'initial':'isolated';if(g.variants?.[form])variant=form;}
  if(chars[index-1]===char&&g.variants?.repeated)variant='repeated';if(overrides[String(index)])variant=overrides[String(index)];
  let shape=glyphShape(family,char,variant);shape=extend(shape,!prev?options.initialExtension*family.metrics.em/100:0,!next?options.finalExtension*family.metrics.em/100:0);
  const cap=/^\p{Lu}$/u.test(char)?options.capScale:1,sy=options.vertical*(p.proportion??1)*cap;
  raw.push({index,character:char,line,variant,shape,matrix:[options.horizontal,0,Math.tan(p.slant*Math.PI/180)*sy,sy,cursor,0]});
  cursor+=(g.advance+family.metrics.gap*p.spacing)*options.horizontal;
 });
 const rawPaths=raw.flatMap(g=>g.shape.paths);if(rawPaths.length>200||rawPaths.reduce((n,p)=>n+p.nodes.length,0)>5000)throw Error('Composizione oltre 200 percorsi o 5.000 nodi: ridurre il testo.');
 const lineBounds=Array.from({length:line+1},(_,i)=>bezierBounds(raw.filter(g=>g.line===i).flatMap(g=>place(g.shape.paths,g.matrix,g.index))));
 const width=Math.max(0,...lineBounds.map(b=>b.width)),scale=width?p.width/width:1;
 const linePitch=Math.max(...lineBounds.map(b=>b.height),family.metrics.capHeight*options.vertical)*scale+options.lineGap;
 let placements:Placement[]=raw.map(g=>{const b=lineBounds[g.line],offset=options.lineOffsets[String(g.line)]||{x:0,y:0},align=options.alignment==='center'?(width-b.width)/2:options.alignment==='right'?width-b.width:0;
  const m=g.matrix.map((x,i)=>i<4?x*scale:x) as Placement['matrix'];m[4]=(g.matrix[4]-b.minX+align)*scale+offset.x;m[5]=-g.line*linePitch+offset.y;
  return {index:g.index,character:g.character,line:g.line,variant:g.variant,matrix:m,paths:place(g.shape.paths,m,g.index)};
 });
 const box=bezierBounds(placements.flatMap(p=>p.paths));placements=placements.map(g=>{const m=[...g.matrix] as Placement['matrix'];m[4]-=box.minX;m[5]-=box.minY;return {...g,matrix:m,paths:transformPaths(g.paths,q=>({x:q.x-box.minX,y:q.y-box.minY}))};});
 const links=options.connections&&family.connections==='baseline-checked'?potentialLinks(placements):[];
 return analyzed(p,family,options,placements,links,notes,[...new Set(missing)],label,start);
}
export function replaceStudioLetter(p:Project,index:number,variant:GlyphVariant):StudioCandidate{
 const start=performance.now(),s=p.studio;if(!s||JSON.stringify(p.curves)!==JSON.stringify(s.snapshot))throw Error('I percorsi sono stati modificati fuori dallo Studio: conservare le modifiche e ricomporre esplicitamente prima della sostituzione di lettere.');
 const selected=s.placements.find(g=>g.index===index);if(!selected)throw Error('Lettera non selezionata.');
 const chars=[...p.text.normalize('NFC')],newShape=extend(glyphShape(s.family,selected.character,variant),!alpha(chars[index-1])?s.options.initialExtension*s.family.metrics.em/100:0,!alpha(chars[index+1])?s.options.finalExtension*s.family.metrics.em/100:0),placements=structuredClone(s.placements);const g=placements.find(g=>g.index===index)!;g.variant=variant;g.paths=place(newShape.paths,g.matrix,g.index);
 return analyzed(p,s.family,s.options,placements,s.links,[],[],`Lettera «${g.character}»: ${variant}`,start);
}
export function studioProject(source:Project,candidate:StudioCandidate):Project{
 if(candidate.missing.length||!candidate.withinWidth)throw Error('Proposta non applicabile: caratteri mancanti o larghezza massima superata.');
 return {...structuredClone(source),version:2,generator:'studio',imported:null,text:source.text.replace(/\r\n/g,'\n').normalize('NFC'),curves:structuredClone(candidate.curves),studio:structuredClone(candidate.state)};
}
export function studioCandidates(p:Project,request:StudioRequest):StudioCandidate[]{
 if(request.letter)return [replaceStudioLetter(p,request.letter.index,request.letter.variant)];
 if(!Array.isArray(request.families)||request.families.length>12)throw Error('Numero di famiglie non valido.');
 const result:StudioCandidate[]=[];for(const family of request.families){result.push(composeStudio(p,family,request.options,request.overrides));
  if(request.alternatives)for(const variant of ['open','wide'] as const){const overrides={...request.overrides};[...p.text.replace(/\r\n/g,'\n').normalize('NFC')].forEach((c,i)=>{if(family.glyphs[c]?.variants?.[variant])overrides[String(i)]=variant;});const next=composeStudio(p,family,request.options,overrides,variant==='open'?'Forme aperte':'Raccordi ampi');if(!result.some(r=>r.familyId===next.familyId&&JSON.stringify(r.curves)===JSON.stringify(next.curves)))result.push(next);}
 }return result;
}

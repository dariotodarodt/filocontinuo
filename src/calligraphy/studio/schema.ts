import type {BezierPath} from '../../vector/bezier';
export const glyphVariants=['base','initial','medial','final','isolated','open','repeated','wide'] as const;
export type GlyphVariant=typeof glyphVariants[number];
export type Anchor={x:number;y:number;dx:number;dy:number};
export type GlyphShape={advance:number;paths:BezierPath[];entry?:Anchor;exit?:Anchor};
export type StudioGlyph=GlyphShape&{variants?:Partial<Record<GlyphVariant,GlyphShape>>};
export type StyleFamily={format:'filocontinuo-style';schema:1;id:string;name:string;version:string;author:string;license:string;description:string;metrics:{em:number;capHeight:number;xHeight:number;gap:number;space:number};glyphs:Record<string,StudioGlyph>;supportedCharacters:string[];connections:'baseline-checked'|'separate'};
export type StudioOptions={wordSpacing:number;horizontal:number;vertical:number;capScale:number;initialExtension:number;finalExtension:number;swashes:boolean;connections:boolean;alignment:'left'|'center'|'right';lineGap:number;lineOffsets:Record<string,{x:number;y:number}>};
export const studioDefaults:StudioOptions={wordSpacing:1,horizontal:1,vertical:1,capScale:1,initialExtension:0,finalExtension:0,swashes:false,connections:true,alignment:'center',lineGap:25,lineOffsets:{}};
export type Placement={index:number;character:string;line:number;variant:GlyphVariant;matrix:[number,number,number,number,number,number];paths:BezierPath[]};
export type StudioState={schema:1;family:StyleFamily;options:StudioOptions;placements:Placement[];links:[string,string][];snapshot:BezierPath[];notes:string[]};
export type NeonSettings={color:string;intensity:number;halo:number;background:'dark'|'light';channelColor:string;on:boolean};
export const neonDefaults:NeonSettings={color:'#ffb86b',intensity:.85,halo:1,background:'dark',channelColor:'#e6dfcc',on:true};
const finite=(x:unknown)=>typeof x==='number'&&Number.isFinite(x)&&Math.abs(x)<1e6;
export function validateStudioPaths(paths:BezierPath[],maxNodes=20000){
 if(!Array.isArray(paths)||paths.length>200)throw Error('Percorsi dello stile non validi.');let count=0;const ids=new Set();
 for(const p of paths){if(!p||typeof p.id!=='string'||p.id.length>160||ids.has(p.id)||!Array.isArray(p.nodes)||p.nodes.length<2||p.closed!==undefined&&typeof p.closed!=='boolean')throw Error('Percorso dello stile non valido.');ids.add(p.id);count+=p.nodes.length;for(const n of p.nodes)for(const q of [n.p,n.in,n.out])if(!q||!finite(q.x)||!finite(q.y))throw Error('Controllo Bézier dello stile non valido.');}
 if(count>maxNodes)throw Error('Stile oltre il limite di nodi.');
}
export function validateStyleFamily(value:unknown):StyleFamily{
 const f=value as StyleFamily;
 if(!f||f.format!=='filocontinuo-style'||f.schema!==1||typeof f.id!=='string'||!/^[a-z0-9-]{1,60}$/.test(f.id)||typeof f.name!=='string'||!f.name.trim()||f.name.length>60||typeof f.version!=='string'||!/^\d+\.\d+\.\d+$/.test(f.version)||typeof f.author!=='string'||!f.author.trim()||f.author.length>160||typeof f.license!=='string'||!f.license.trim()||f.license.length>300||typeof f.description!=='string'||f.description.length>1000||!['baseline-checked','separate'].includes(f.connections))throw Error('Metadati della famiglia non validi: identificativo, versione, autore e licenza obbligatori.');
 if(!f.metrics||!['em','capHeight','xHeight','gap','space'].every(k=>finite(f.metrics[k as keyof typeof f.metrics])&&f.metrics[k as keyof typeof f.metrics]>0))throw Error('Metriche della famiglia non valide.');
 if(!f.glyphs||typeof f.glyphs!=='object'||Array.isArray(f.glyphs)||Object.keys(f.glyphs).length<1||Object.keys(f.glyphs).length>180||!Array.isArray(f.supportedCharacters)||f.supportedCharacters.length>180||new Set(f.supportedCharacters).size!==f.supportedCharacters.length)throw Error('Inventario dei caratteri non valido.');
 let nodes=0;const shape=(s:GlyphShape)=>{if(!s||!finite(s.advance)||s.advance<=0||s.advance>500)throw Error('Avanzamento del glifo non valido.');validateStudioPaths(s.paths,2000);nodes+=s.paths.reduce((n,p)=>n+p.nodes.length,0);for(const a of [s.entry,s.exit])if(a&&![a.x,a.y,a.dx,a.dy].every(finite))throw Error('Ancora non valida.');};
 for(const [c,g]of Object.entries(f.glyphs)){if([...c].length!==1||/\s/.test(c)||!f.supportedCharacters.includes(c))throw Error('Carattere dello stile non valido.');shape(g);if(g.variants){if(typeof g.variants!=='object'||Array.isArray(g.variants))throw Error('Varianti non valide.');for(const [k,v]of Object.entries(g.variants)){if(!glyphVariants.includes(k as GlyphVariant))throw Error('Variante sconosciuta.');shape(v);}}}
 if(f.supportedCharacters.some(c=>!Object.hasOwn(f.glyphs,c))||nodes>30000)throw Error('Inventario o complessità della famiglia non validi.');return structuredClone(f);
}
export function validateStudioOptions(o:StudioOptions){
 if(!o||!['left','center','right'].includes(o.alignment)||typeof o.swashes!=='boolean'||typeof o.connections!=='boolean')throw Error('Opzioni Studio non valide.');
 for(const [k,min,max]of [['wordSpacing',.5,3],['horizontal',.5,2],['vertical',.5,2],['capScale',.6,1.6],['initialExtension',0,25],['finalExtension',0,25],['lineGap',0,200]] as const)if(!finite(o[k])||o[k]<min||o[k]>max)throw Error('Parametro Studio fuori intervallo: '+k);
 if(!o.lineOffsets||typeof o.lineOffsets!=='object'||Array.isArray(o.lineOffsets)||Object.keys(o.lineOffsets).length>5)throw Error('Spostamenti righe non validi.');for(const [k,v]of Object.entries(o.lineOffsets))if(!/^[0-4]$/.test(k)||!v||![v.x,v.y].every(finite)||Math.abs(v.x)>500||Math.abs(v.y)>500)throw Error('Spostamento riga fuori intervallo.');return structuredClone(o);
}
export function validateNeon(n:NeonSettings){if(!n||!/^#[0-9a-f]{6}$/i.test(n.color)||!/^#[0-9a-f]{6}$/i.test(n.channelColor)||!finite(n.intensity)||n.intensity<0||n.intensity>1||!finite(n.halo)||n.halo<0||n.halo>3||!['dark','light'].includes(n.background)||typeof n.on!=='boolean')throw Error('Impostazioni Neon non valide.');return structuredClone(n);}
export function validateStudioState(s:StudioState){
 if(!s||s.schema!==1)throw Error('Schema Studio non supportato.');validateStyleFamily(s.family);validateStudioOptions(s.options);validateStudioPaths(s.snapshot,5000);
 if(!Array.isArray(s.placements)||s.placements.length>100||!Array.isArray(s.links)||s.links.length>100||!Array.isArray(s.notes)||s.notes.length>200||s.notes.some(n=>typeof n!=='string'||n.length>2000))throw Error('Composizione Studio non valida.');
 const indices=new Set<number>();for(const p of s.placements){if(!p||!Number.isInteger(p.index)||p.index<0||p.index>100||indices.has(p.index)||typeof p.character!=='string'||[...p.character].length!==1||!Object.hasOwn(s.family.glyphs,p.character)||!Number.isInteger(p.line)||p.line<0||p.line>4||!glyphVariants.includes(p.variant)||!Array.isArray(p.matrix)||p.matrix.length!==6||!p.matrix.every(finite))throw Error('Posizione glifo non valida.');indices.add(p.index);validateStudioPaths(p.paths,2000);}
 const ids=new Set(s.placements.flatMap(p=>p.paths.map(q=>q.id)));for(const link of s.links)if(!Array.isArray(link)||link.length!==2||!link.every(x=>typeof x==='string'&&ids.has(x)))throw Error('Collegamento Studio non valido.');return structuredClone(s);
}
export function validateStyleLibrary(value:unknown){if(!Array.isArray(value)||value.length>9)throw Error('Libreria stili non valida.');const styles=value.map(validateStyleFamily),keys=styles.map(s=>s.id+'@'+s.version);if(new Set(keys).size!==keys.length)throw Error('Famiglie duplicate.');if(styles.some(s=>['signature','minimal','vintage'].includes(s.id)))throw Error('Identificativo riservato alle famiglie integrate.');return styles;}
export function validateStylePreferences(value:unknown){const p=value as {schema:number;favorites:string[]};if(!p||p.schema!==1||!Array.isArray(p.favorites)||p.favorites.length>30||p.favorites.some(x=>typeof x!=='string'||!/^[a-z0-9-]{1,60}@\d+\.\d+\.\d+$/.test(x)))throw Error('Preferenze stili non valide.');return structuredClone(p);}

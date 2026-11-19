export type Point = { x: number; y: number };
export type Stroke = { points: Point[]; closed?: boolean };
export type Parameters = { ledWidth: number; ledHeight: number; wall: number; floor: number; tolerance: number; wallHeight: number; minRadius: number };
import type { BezierPath } from '../vector/bezier';
import {validateStudioState,validateNeon,type StudioState,type NeonSettings} from '../calligraphy/studio/schema';
export type LedProfile={id:string;name:string;params:Parameters;bend:'laterale'|'verticale';cutInterval:number;demonstrative:boolean};
export type OneSettings = { engine:"0.4.1"|"0.4.2"|"0.4.3"; construction?:"fusion"|"separate"; divider?:number; rounding:number; perWord:boolean };
export type Project = { one?:OneSettings; format: 'filocontinuo'; version: 1|2; text: string; style: 'Signature' | 'Minimal'; width: number; slant: number; spacing: number; params: Parameters; imported: Stroke[] | null; curves?:BezierPath[]; generator?:'legacy'|'open'|'contextual'|'studio'; proportion?:number; profiles?:LedProfile[]; activeProfile?:string; bend?:LedProfile['bend']; cutInterval?:number; maxWidth?:number; maxDeviation?:number; variant?:'fluida'|'aperta'|'slanciata'; swashes?:boolean; calibrationNotes?:string;studio?:StudioState;neon?:NeonSettings };
export const defaults: Project = { format: 'filocontinuo', version: 1, text: 'Stay playful', style: 'Signature', width: 400, slant: 12, spacing: 1, params: { ledWidth: 6, ledHeight: 8, wall: 1.2, floor: 1.5, tolerance: 0.3, wallHeight: 7, minRadius: 12 }, imported: null };
export const distance = (a: Point,b: Point) => Math.hypot(a.x-b.x,a.y-b.y);
export function bounds(strokes: Stroke[]) {
  const p=strokes.flatMap(s=>s.points);
  if (!p.length) return { minX:0,minY:0,maxX:0,maxY:0,width:0,height:0 };
  let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;for(const q of p){minX=Math.min(minX,q.x);maxX=Math.max(maxX,q.x);minY=Math.min(minY,q.y);maxY=Math.max(maxY,q.y);}
  return { minX,minY,maxX,maxY,width:maxX-minX,height:maxY-minY };
}
export function validateProject(value: unknown): Project {
  const p=value as Project;
  if (!p || p.format!=='filocontinuo' || ![1,2].includes(p.version) || typeof p.text!=='string' || p.text.length>100 || !['Signature','Minimal'].includes(p.style)) throw Error('Formato progetto non supportato.');
  if (![p.width,p.slant,p.spacing].every(Number.isFinite) || p.width<50 || p.width>2000 || Math.abs(p.slant)>35 || p.spacing<0.7 || p.spacing>2) throw Error('Dimensioni o spaziatura fuori intervallo.');
  validateParameters(p.params);
  if(p.one!==undefined && (!p.one || !["0.4.1","0.4.2","0.4.3"].includes(p.one.engine) || ![0.2,0.35,0.5].includes(p.one.rounding) || typeof p.one.perWord!=="boolean"))throw Error("Parametri ONE non validi.");
  if (p.imported!==null && (!Array.isArray(p.imported) || p.imported.length>200 || p.imported.some(s=>!Array.isArray(s.points)||s.points.length<2||s.points.length>10000||s.points.some(q=>!Number.isFinite(q.x)||!Number.isFinite(q.y)||Math.abs(q.x)>1e6||Math.abs(q.y)>1e6)))) throw Error('Percorsi del progetto non validi.');
  if(p.curves!==undefined){if(!Array.isArray(p.curves)||p.curves.length>200)throw Error('Numero di curve non valido.');let total=0;const ids=new Set<string>();for(const path of p.curves){if(!path||typeof path.id!=='string'||ids.has(path.id)||!Array.isArray(path.nodes)||path.nodes.length<2)throw Error('Percorso Bézier non valido.');ids.add(path.id);total+=path.nodes.length;for(const n of path.nodes)for(const q of [n.p,n.in,n.out])if(!q||!Number.isFinite(q.x)||!Number.isFinite(q.y)||Math.abs(q.x)>1e6||Math.abs(q.y)>1e6)throw Error('Controllo Bézier non valido.');}if(total>5000)throw Error('Massimo 5.000 nodi.');}
  if(p.generator!==undefined&&!['legacy','open','contextual','studio'].includes(p.generator))throw Error('Generatore sconosciuto.');
  if(p.studio!==undefined)validateStudioState(p.studio);
  if(p.generator==='studio'&&(!p.studio||p.curves===undefined))throw Error('Il progetto Studio richiede famiglia versionata e geometria salvata.');
  if(p.neon!==undefined)validateNeon(p.neon);
  if(p.maxWidth!==undefined&&(!Number.isFinite(p.maxWidth)||p.maxWidth<50||p.maxWidth>2000||p.width>p.maxWidth))throw Error('La larghezza obiettivo supera il massimo consentito.');
  if(p.maxDeviation!==undefined&&(!Number.isFinite(p.maxDeviation)||p.maxDeviation<0||p.maxDeviation>100))throw Error('Scostamento massimo tra 0 e 100 mm.');
  if(p.variant!==undefined&&!['fluida','aperta','slanciata'].includes(p.variant))throw Error('Variante sconosciuta.');
  if(p.swashes!==undefined&&typeof p.swashes!=='boolean')throw Error('Svolazzi non validi.');
  if(p.calibrationNotes!==undefined&&(typeof p.calibrationNotes!=='string'||p.calibrationNotes.length>5000))throw Error('Note di calibrazione non valide.');
  if(p.proportion!==undefined&&(!Number.isFinite(p.proportion)||p.proportion<.3||p.proportion>3))throw Error('Proporzioni fuori intervallo.');
  if(p.bend!==undefined&&!['laterale','verticale'].includes(p.bend))throw Error('Direzione flessione non valida.');
  if(p.cutInterval!==undefined&&(!Number.isFinite(p.cutInterval)||p.cutInterval<=0||p.cutInterval>1000))throw Error('Intervallo taglio non valido.');
  if(p.profiles!==undefined){if(!Array.isArray(p.profiles)||p.profiles.length>50)throw Error('Libreria profili non valida.');for(const profile of p.profiles)validateProfile(profile);}
  return structuredClone(p);
}
export function validateProfile(p:LedProfile){if(!p||typeof p.id!=='string'||typeof p.name!=='string'||!p.name.trim()||p.name.length>80||!['laterale','verticale'].includes(p.bend)||!Number.isFinite(p.cutInterval)||p.cutInterval<=0||p.cutInterval>1000||typeof p.demonstrative!=='boolean')throw Error('Profilo LED non valido.');validateParameters(p.params);return structuredClone(p);}
export function validateParameters(p: Parameters) {
  if (!p || !Object.values(p).every(Number.isFinite) || !['ledWidth','ledHeight','wall','floor','wallHeight','minRadius'].every(k=>p[k as keyof Parameters]>0) || p.tolerance<0 || p.ledWidth>50 || p.ledHeight>50 || p.wall>10 || p.floor>10 || p.wallHeight>50 || p.tolerance>5 || p.minRadius>200 || p.wall<0.4 || p.floor<0.4) throw Error('Parametri non validi: spessori ≥ 0,4 mm e dimensioni positive.');
}

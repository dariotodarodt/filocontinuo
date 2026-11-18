import {bounds} from '../../core/types';
import {parseCenterline,sampleBezier,lerp,node,type BezierPath} from '../../vector/bezier';
import {signature,minimal,vintage,symbols} from './sources';
import {validateStyleFamily,type StyleFamily,type GlyphShape,type StudioGlyph} from './schema';
function roundPolyline(p:BezierPath):BezierPath{
 if(p.closed||p.nodes.length<3)return p;
 const close=(a:{x:number;y:number},b:{x:number;y:number})=>Math.hypot(a.x-b.x,a.y-b.y)<1e-7;
 if(p.nodes.slice(0,-1).some((a,i)=>!close(a.out,lerp(a.p,p.nodes[i+1].p,1/3))||!close(p.nodes[i+1].in,lerp(a.p,p.nodes[i+1].p,2/3))))return p;
 const nodes=[node(p.nodes[0].p)],line=(q:{x:number;y:number})=>{const a=nodes.at(-1)!,b=node(q);a.out=lerp(a.p,q,1/3);b.in=lerp(a.p,q,2/3);nodes.push(b);};
 for(let i=1;i<p.nodes.length-1;i++){const prev=p.nodes[i-1].p,c=p.nodes[i].p,next=p.nodes[i+1].p,l1=Math.hypot(c.x-prev.x,c.y-prev.y),l2=Math.hypot(c.x-next.x,c.y-next.y);if(l1<1e-8||l2<1e-8)continue;const trim=Math.min(l1,l2)*.3,before=lerp(c,prev,trim/l1),after=lerp(c,next,trim/l2);line(before);const a=nodes.at(-1)!,b=node(after);a.out=lerp(before,c,2/3);b.in=lerp(after,c,2/3);nodes.push(b);}
 line(p.nodes.at(-1)!.p);return {...p,nodes};
}
function shape(ds:string[],id:string,advance?:number):GlyphShape{
 const paths=ds.flatMap((d,i)=>parseCenterline(d,`${id}-${i}`));paths.forEach((p,i)=>{p.role=i?'auxiliary':'main';if(p.closed&&p.nodes.length>2&&Math.hypot(p.nodes[0].p.x-p.nodes.at(-1)!.p.x,p.nodes[0].p.y-p.nodes.at(-1)!.p.y)<1e-8){p.nodes[0].in={...p.nodes.at(-1)!.in};p.nodes.pop();}});
 const b=bounds(sampleBezier(paths,.02,4)),first=paths[0]?.nodes[0],last=paths[0]?.nodes.at(-1);
 const result:GlyphShape={advance:advance??Math.max(8,b.maxX+4),paths};
 if(first&&last&&!paths[0].closed&&Math.abs(first.p.y)<1e-6&&Math.abs(last.p.y)<1e-6){result.entry={...first.p,dx:first.out.x-first.p.x,dy:first.out.y-first.p.y};result.exit={...last.p,dx:last.p.x-last.in.x,dy:last.p.y-last.in.y};}return result;
}
function terminals(g:GlyphShape,start:boolean,end:boolean):GlyphShape{
 const s:GlyphShape=structuredClone({advance:g.advance,paths:g.paths,entry:g.entry,exit:g.exit}),p=s.paths[0];if(p.closed)return s;
 if(start){const a=p.nodes[0],n=node({x:a.p.x-8,y:a.p.y-3});n.out={x:a.p.x-4,y:a.p.y-3};a.in={x:a.p.x-3,y:a.p.y};p.nodes.unshift(n);delete s.entry;}
 if(end){const a=p.nodes.at(-1)!,n=node({x:a.p.x+8,y:a.p.y+3});a.out={x:a.p.x+3,y:a.p.y};n.in={x:a.p.x+4,y:a.p.y+3};p.nodes.push(n);delete s.exit;}return s;
}
const openSignature:Record<string,string[]>={
a:['M0 0 C4 0 3 12 11 12 C19 12 18 2 11 2 C6 2 5 7 7 10','M18 12 C16 7 16 0 24 0'],
d:['M0 0 C3 0 4 12 11 12 C18 12 17 1 11 1 C6 1 5 7 8 10','M22 24 C20 13 17 0 29 0'],
g:['M0 0 C4 0 4 12 12 12 C19 12 17 1 11 1 C6 1 5 7 8 10','M20 12 C18 0 15 -16 9 -14 C3 -12 16 -3 28 0'],
o:['M0 0 C5 0 4 13 14 13 C23 13 21 1 13 1 C8 1 8 6 10 9','M22 7 C22 2 25 0 29 0'],
f:['M0 0 C6 0 6 24 15 25 C22 25 18 15 13 11 C7 5 5 -12 12 -14','M7 12 C15 14 21 13 25 13'],
y:['M0 0 C5 0 7 12 11 12 C16 12 8 1 16 1 C24 1 24 12 28 12 C32 12 25 -16 31 -15','M34 -9 C36 -4 39 0 43 0']};
const openMinimal:Record<string,string[]>={a:['M14 0 L14 12 L7 12 Q1 12 1 6 Q1 0 7 0 L10 0'],o:['M5 0 Q1 1 1 6 Q1 12 7 12 Q14 12 14 6 Q14 2 11 1'],e:['M3 6 L14 6 Q14 12 7 12 Q1 12 1 6 Q1 0 7 0 L14 1']};
const openVintage:Record<string,string[]>={a:['M2 11 Q2 17 10 17 Q18 17 18 9 L18 0','M13 8 L7 8 Q0 8 0 4 Q0 0 7 0 L12 0'],o:['M6 1 Q0 3 0 9 Q0 17 10 17 Q20 17 20 9 Q20 3 15 1'],e:['M4 9 L19 9 Q19 17 10 17 Q0 17 0 9 Q0 0 10 0 Q15 0 19 3']};
function build(id:string,name:string,source:Record<string,string[]>,opens:Record<string,string[]>,description:string):StyleFamily{
 const glyphs:Record<string,StudioGlyph>=Object.create(null);
 for(const [char,ds]of Object.entries({...source,...symbols})){glyphs[char]=shape(ds,id+'-'+char.codePointAt(0));if(id==='minimal')glyphs[char].paths=glyphs[char].paths.map(roundPolyline);}
 for(const [char,ds]of Object.entries(opens))glyphs[char].variants={open:shape(ds,id+'-open-'+char,glyphs[char].advance)};
 if(id==='signature'){
  for(const char of 'abcdefghijklmnopqrstuvwxyz'){const g=glyphs[char];g.variants={...g.variants,initial:terminals(g,true,false),final:terminals(g,false,true),isolated:terminals(g,true,true)};}
  const repeated:Record<string,string[]>={l:['M0 0 C6 0 3 25 12 26 C25 28 18 10 12 5 C9 2 16 0 23 0'],o:['M0 0 C6 0 8 15 17 13 C25 11 19 -2 10 2 C5 5 12 12 18 10 C24 7 23 0 29 0'],n:['M0 0 C6 0 4 13 10 14 C17 15 10 0 14 1 C18 2 19 13 26 11 C32 9 24 0 35 0']};
  const wide:Record<string,string[]>={a:['M0 0 C4 0 3 15 12 15 C23 15 23 1 12 1 C3 1 3 12 14 12 C22 12 13 0 24 0'],e:['M0 0 C6 0 5 15 15 13 C26 10 3 0 13 0 L23 0'],r:['M0 0 C7 0 5 15 14 15 C23 15 12 7 19 6 C25 5 23 0 30 0']};
  for(const [c,ds]of Object.entries(repeated))glyphs[c].variants!.repeated=shape(ds,id+'-repeated-'+c,glyphs[c].advance);
  for(const [c,ds]of Object.entries(wide))glyphs[c].variants!.wide=shape(ds,id+'-wide-'+c,glyphs[c].advance);
 }
 const accents:Record<string,[string,string]>={'à':['a','grave'],'è':['e','grave'],'é':['e','acute'],'ì':['i','grave'],'ò':['o','grave'],'ù':['u','grave'],'À':['A','grave'],'È':['E','grave'],'É':['E','acute'],'Ì':['I','grave'],'Ò':['O','grave'],'Ù':['U','grave']};
 for(const [char,[base,accent]]of Object.entries(accents)){
  const original=base==='i'?{...glyphs[base],paths:glyphs[base].paths.slice(0,1),variants:undefined}:glyphs[base],g=structuredClone(original),top=bounds(sampleBezier(g.paths)).maxY+5,cx=g.advance/2;
  const mark=shape([accent==='grave'?`M${cx-3} ${top+4} L${cx+2} ${top}`:`M${cx-2} ${top} L${cx+3} ${top+4}`],id+'-accent-'+char.codePointAt(0)).paths;
  mark.forEach(p=>p.role='auxiliary');g.paths.push(...mark);
  if(g.variants)for(const v of Object.values(g.variants))v.paths.push(...structuredClone(mark));glyphs[char]=g;
 }
 return validateStyleFamily({format:'filocontinuo-style',schema:1,id,name,version:'1.0.0',author:'FILOCONTINUO — disegni originali del progetto',license:'UNLICENSED',description,metrics:{em:40,capHeight:id==='vintage'?28:id==='signature'?25:22,xHeight:id==='vintage'?17:12,gap:id==='signature'?1:5,space:id==='signature'?14:12},glyphs,supportedCharacters:Object.keys(glyphs),connections:id==='signature'?'baseline-checked':'separate'});
}
export const builtInFamilies:StyleFamily[]=[
 build('signature','Signature',signature,openSignature,'Corsivo a gesto continuo, ascendenti ad anello e terminali contestuali. I collegamenti sono accettati solo con controlli conclusivi.'),
 build('minimal','Minimal',minimal,openMinimal,'Scheletri essenziali e proporzioni compatte, lettere distinte. Le svolte e le dimensioni richiedono comunque controllo LED.'),
 build('vintage','Vintage',vintage,openVintage,'Insegna tubolare: lettere ampie, archi arrotondati, capitali e terminali aperti distinti dal corsivo.')
];
export const allSupportedCharacters=builtInFamilies[0].supportedCharacters.join('');
export function cloneFamily(id:string){const f=builtInFamilies.find(f=>f.id===id);if(!f)throw Error('Famiglia non disponibile.');return structuredClone(f);}

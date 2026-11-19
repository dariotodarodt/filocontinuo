import type {Parameters} from '../../core/types';
import {parseCenterline,pathData,transformPaths} from '../../vector/bezier';

export const fusionLetters='leoaftgyp';
export type Construction='fusion'|'separate';
// Axis, bulb aspect, slant and terminal gesture of the nine experimental masters.
const masters:Record<string,[number,number,number,string]>={
 l:[-74,.82,.09,'q'],e:[-24,.95,.18,'q'],o:[-10,1.3,.04,'round'],
 a:[-31,1.18,.18,'stem'],f:[-75,.64,.14,'drop'],t:[-80,.44,.06,'cross'],
 g:[-24,1.22,.18,'drop'],y:[60,.70,.12,'fork'],p:[-82,.90,.09,'bowl']
};
export function fusionGlyph(letter:string,width:number,p:Parameters,mode:Construction,divider:number,variant:number){
 const master=masters[letter];
 if(!master||!Number.isFinite(width)||width<50||!Number.isFinite(divider)||divider<=0||divider>20||![0,1,2].includes(variant))throw Error('Parametri del laboratorio ONE non validi.');
 const [degrees,aspect,,terminal]=master;
 const bore=p.ledWidth+p.tolerance;
 const gap=bore+(mode==='fusion'?divider:2*p.wall)+0.12;
 // Width is a ceiling. Work in physical millimetres so changing divider
 // thickness cannot be undone by a final scale applied to the master.
 const length=width*.36,stem=length*(.26+.045*variant);
 const bulb=Math.max(p.minRadius*1.04,length*.28*aspect)*(1+.10*variant);
 const rise=2*bulb,control=.55228474983*bulb;

 // A lead-in below the eye supplies the ascender, descender or cross stroke.
 const lead=length*.46;
 const entrances:Record<string,string>={
   l:'M '+(-lead)+' '+(-lead*.35)+' Q '+(-lead*.45)+' 0 0 0',
   e:'M '+(-lead*.55)+' '+(-lead*.28)+' Q '+(-lead*.25)+' 0 0 0',
   o:'M '+(-lead*.2)+' 0 L 0 0',
   a:'M '+(-lead)+' '+(-lead*.65)+' C '+(-lead*.65)+' '+(-lead*.65)+' '+(-lead*.5)+' 0 0 0',
   f:'M '+(-lead*1.3)+' '+(-lead*.25)+' C '+(-lead)+' '+(-lead*.55)+' '+(-lead*.6)+' 0 0 0',
   t:'M '+(-lead*.5)+' '+(-lead)+' Q '+(-lead*.4)+' 0 0 0',
   g:'M '+(-lead*.55)+' '+(-lead*.24)+' Q '+(-lead*.28)+' 0 0 0',
   y:'M '+(-lead*.9)+' '+(-lead)+' C '+(-lead*1.3)+' '+(-lead*.25)+' '+(-lead*.5)+' 0 0 0',
   p:'M '+(-lead*1.8)+' 0 L 0 0'
 };
 const commands=[entrances[letter],'L '+stem+' 0',
  'C '+(stem+(length-stem)*.38)+' 0 '+(length-(length-stem)*.38)+' '+(-bulb+gap/2)+' '+length+' '+(-bulb+gap/2),
  'C '+(length+control)+' '+(-bulb+gap/2)+' '+(length+bulb)+' '+(-bulb+gap/2+bulb-control)+' '+(length+bulb)+' '+gap/2,
  'C '+(length+bulb)+' '+(gap/2+control)+' '+(length+control)+' '+(gap/2+bulb)+' '+length+' '+(gap/2+bulb),
  'C '+(length-(length-stem)*.38)+' '+(gap/2+bulb)+' '+(stem+(length-stem)*.38)+' '+gap+' '+stem+' '+gap,'L 0 '+gap];
 const tip=length*.30;
 const ends:Record<string,string>={
 q:'Q '+(-tip)+' '+gap+' '+(-tip*1.25)+' '+(gap+tip),
 round:'Q '+(-tip*.8)+' '+gap+' '+(-tip)+' '+(gap+bulb*.35),
 stem:'C '+(-tip)+' '+gap+' '+(-tip)+' '+(gap+rise)+' '+(-tip*2)+' '+(gap+rise),
 drop:'C '+(-tip)+' '+gap+' '+(-tip*.5)+' '+(gap+rise*1.4)+' '+(-tip*2.4)+' '+(gap+rise),
 cross:'Q '+(-tip)+' '+gap+' '+(-tip)+' '+(gap+bulb),
 fork:'Q '+(-tip)+' '+gap+' '+(-tip*1.8)+' '+(gap+rise),
 bowl:'C '+(-tip)+' '+gap+' '+(-tip*1.8)+' '+(gap+rise)+' '+(-tip*.6)+' '+(gap+rise)
 };
 commands.push(ends[terminal]);
 const angle=degrees*Math.PI/180,c=Math.cos(angle),s=Math.sin(angle);
 // Rigid rotation preserves the designed divider. Variant changes the eye and stem.
 const paths=transformPaths(parseCenterline(commands.join(' ')),point=>({
  x:point.x*c-point.y*s,y:point.x*s+point.y*c
 }));
 return pathData(paths[0]);
}

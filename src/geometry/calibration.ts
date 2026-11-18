import ClipperLib from 'clipper-lib';
import { validateParameters,type Parameters,type Stroke } from '../core/types';
import { boolean,buildFromContours,offset } from './channel';
const digits:Record<string,string[]>={
 '0':['0,0 0,4 2,4 2,0 0,0'],'1':['1,0 1,4'],'2':['0,4 2,4 2,2 0,2 0,0 2,0'],'3':['0,4 2,4 2,0 0,0','0,2 2,2'],'4':['0,4 0,2 2,2','2,4 2,0'],'5':['2,4 0,4 0,2 2,2 2,0 0,0'],'6':['2,4 0,4 0,0 2,0 2,2 0,2'],'7':['0,4 2,4 1,0'],'8':['0,0 0,4 2,4 2,0 0,0','0,2 2,2'],'9':['2,2 0,2 0,4 2,4 2,0'],'.':['1,0 1.1,0'],'T':['0,4 2,4','1,4 1,0'],'R':['0,0 0,4 2,4 2,2 0,2','0,2 2,0'],
};
function label(text:string,x:number,y:number):Stroke[]{let cursor=x;const paths:Stroke[]=[];for(const c of text){for(const d of digits[c]||[])paths.push({points:d.split(' ').map(s=>{const [a,b]=s.split(',').map(Number);return {x:cursor+a*1.8,y:y+b*1.8};})});cursor+=6;}return paths;}
export function buildCalibration(p:Parameters){
  validateParameters(p);if(p.ledWidth+p.tolerance+2*p.wall>14)throw Error('Campione supportato per larghezze esterne fino a 14 mm.');if(p.floor+p.wallHeight>30)throw Error('Campione: altezza massima 30 mm.');
  const radii=[8,12,20],tolerances=p.tolerance>=.3?[p.tolerance-.3,p.tolerance,p.tolerance+.3]:[p.tolerance,p.tolerance+.3,p.tolerance+.6],pockets:ClipperLib.IntPoint[][]=[],footprints:ClipperLib.IntPoint[][]=[];
  const rectangle=(x0:number,y0:number,x1:number,y1:number)=>[{X:x0*1000,Y:y0*1000},{X:x1*1000,Y:y0*1000},{X:x1*1000,Y:y1*1000},{X:x0*1000,Y:y1*1000}];
  const legends:string[]=[];
  for(let i=0;i<3;i++){
    const y=185-i*65,r=radii[i],tol=Number(tolerances[i].toFixed(2));
    const straight:Stroke={points:[{x:18,y},{x:100,y}]},arc:Stroke={points:Array.from({length:65},(_,j)=>{const t=j/64*Math.PI/2;return {x:167+r*Math.cos(t),y:y-15+r*Math.sin(t)};})};
    pockets.push(...offset([straight],(p.ledWidth+tol)/2),...offset([arc],(p.ledWidth+p.tolerance)/2));
    footprints.push(...offset([straight],(p.ledWidth+tol)/2+p.wall),...offset([arc],(p.ledWidth+p.tolerance)/2+p.wall),rectangle(15,y+2,50,y+27),rectangle(164,y-18+r,170,y+39),rectangle(158,y+25,193,y+39));
    pockets.push(...offset(label(`T${tol.toFixed(2)}`,20,y+15),.45),...offset(label(`R${r}`,160,y+28),.45));
    legends.push(`Riga ${i+1}: retta 82 mm, tolleranza totale ${tol.toFixed(2)} mm; arco 90° R${r} mm, tolleranza ${p.tolerance} mm.`);
  }
  const outer=boolean(footprints,[],ClipperLib.ClipType.ctUnion),inner=boolean(pockets,[],ClipperLib.ClipType.ctUnion);
  const channel=buildFromContours(outer,inner,p.floor,p.wallHeight);
  return {channel,legends,radii,tolerances,bedFits:channel.width<=256&&channel.height<=256&&channel.depth<=256};
}

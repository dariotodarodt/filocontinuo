/** Guide originali ONE. Ogni coppia indica un vertice della linea centrale.
 * Ingresso e uscita orizzontali sulla linea di base di ciascun glifo. */
const guides: Record<string,string> = {
  D:'1,0 1,-8 2,-9 5,-8 7,-5 7,-3 6,-2 3,-2 3,-1 4,0 8,0',
  S:'1,0 2,-1 5,-2 5,-4 2,-5 1,-7 3,-9 6,-9 7,-8 7,-2 8,0',
  T:'1,0 2,-7 1,-8 1,-9 7,-9 8,-8 5,-7 5,-2 6,0',
  F:'1,0 2,-8 3,-9 7,-9 7,-8 4,-7 4,-5 6,-5 6,-4 4,-3 5,0',
  B:'1,0 1,-8 2,-9 5,-9 6,-7 3,-5 6,-4 7,-3 6,-2 3,-2 4,0 8,0',
  M:'1,0 1,-8 2,-9 4,-4 6,-9 7,-9 8,-1 9,0',
  u:'1,0 2,-5 3,-5 2,-2 3,-1 5,-2 6,-5 7,-5 7,-1 8,0',
  n:'1,0 2,-5 3,-5 3,-2 5,-5 6,-5 7,-4 7,-1 8,0',
  t:'1,0 2,-3 2,-5 3,-8 4,-8 4,-5 6,-5 6,-4 4,-3 4,-1 5,0',
  y:'1,0 2,-5 3,-5 3,-2 4,-1 6,-5 7,-5 6,1 4,3 3,4 4,5 7,3 8,0',
  p:'1,0 2,-4 3,-5 3,3 4,4 5,2 5,-4 7,-5 8,-3 7,-2 6,-2 8,0',
  f:'1,0 2,-6 4,-9 5,-8 4,-6 3,-4 5,-4 6,-3 5,-2 5,0',
  g:'1,0 1,-3 3,-5 5,-5 4,-3 3,-2 4,-1 6,-4 7,-4 6,1 4,3 3,4 4,5 7,3 8,0',
  d:'1,0 1,-3 3,-5 5,-5 4,-3 3,-2 4,-1 6,-4 7,-9 8,-9 8,-6 7,-2 8,0',
  z:'1,0 1,-4 2,-5 6,-5 6,-4 3,-1 4,0 7,0',
  ì:'1,0 2,-3 3,-4 2,-7 2,-8 4,-6 5,-4 4,-2 5,0',
  b:'1,0 2,-7 3,-9 4,-8 3,-5 3,-2 5,-5 7,-5 8,-3 7,-2 5,-2 5,-1 7,0',
  j:'1,0 2,-4 3,-5 4,-4 3,1 2,3 1,4 2,5 5,3 6,0',
  k:'1,0 2,-7 3,-9 4,-8 3,-2 5,-4 7,-5 6,-3 5,-2 7,0',
  q:'1,0 1,-3 3,-5 5,-5 4,-3 3,-2 4,-1 6,-4 7,-4 7,3 8,4 9,3 9,0',
  x:'1,0 2,-2 1,-4 2,-5 4,-3 6,-5 7,-4 5,-2 7,0',
  L:'1,0 1,-8 2,-9 3,-8 2,-2 3,0',
  C:'1,0 1,-5 3,-8 6,-8 7,-7 4,-6 3,-4 3,-2 5,0',
  A:'1,0 3,-8 4,-9 7,-1 6,-2 4,-3 4,-1 6,0',
  O:'1,0 1,-4 2,-8 5,-9 7,-7 7,-4 6,-2 4,-2 3,-3 3,-1 5,0 8,0',
  o:'1,0 1,-3 2,-5 4,-5 5,-4 5,-2 3,-2 2,-3 2,-1 4,0 6,0',
  v:'1,0 1,-4 2,-5 3,-1 4,-1 6,-5 7,-4 6,-1 7,0',
  e:'1,0 2,-2 4,-3 4,-5 2,-5 1,-4 1,-6 4,-7 6,-5 6,-2 7,0',
  a:'1,0 1,-2 3,-5 5,-5 4,-4 3,-2 4,-1 6,-4 6,-1 7,0',
  m:'1,0 2,-5 3,-5 3,-2 5,-5 6,-5 6,-2 8,-5 9,-4 9,0',
  r:'1,0 2,-3 2,-5 3,-5 4,-3 6,-4 6,-3 5,-2 6,0',
  l:'1,0 2,-5 4,-9 5,-8 4,-5 3,-2 4,0',
  i:'1,0 2,-3 3,-5 4,-5 4,-4 3,-3 3,-1 4,0',
  c:'1,0 1,-2 3,-5 5,-5 5,-4 3,-3 3,-1 5,0'
};
type Point = [number,number];
const midpoint=(a:Point,b:Point):Point=>[(a[0]+b[0])/2,(a[1]+b[1])/2];
const pair=(p:Point)=>p.join(' ');

/** Un solo sottopercorso aperto. Gli spazi prolungano il raccordo di base. */
export function oneCenterline(text:string,width:number,rounding=0.5,perWord=false):string {
  if (!text.trim() || !Number.isFinite(width) || width<=0) throw Error('Testo o larghezza non validi');
  if (!(rounding>0 && rounding<=0.5)) throw Error('Raccordo non valido');
  const points:Point[]=[[0,0]];
  const starts=[0];
  let x=0;
  for (const char of text.normalize('NFC')) {
    if(char===' ') {x+=4;if(perWord)starts.push(points.length);points.push([x,0]);continue;}
    if(!Object.prototype.hasOwnProperty.call(guides,char)) throw Error('Carattere ONE non supportato: '+char);
    const local=guides[char].split(' ').map(s=>s.split(',').map(Number) as Point);
    points.push(...local.map(([u,v]):Point=>[x+u,v]));
    x+=Math.max(...local.map(p=>p[0]))+1;
    points.push([x,0]);
  }
  const scaled=points.map(([u,v]):Point=>[u*width/x,v*width/x]);
  return starts.map((start,index)=>roundedPath(scaled.slice(start,starts[index+1]),rounding)).filter(Boolean).join(' ');
}
function roundedPath(scaled:Point[],rounding:number):string {
  if(scaled.length<2)return '';
  const parts=['M '+pair(scaled[0])];
  for(let k=1;k<scaled.length-1;k++) {
    const pivot=scaled[k];
    const towards=(other:Point):Point=>[pivot[0]+rounding*(other[0]-pivot[0]),pivot[1]+rounding*(other[1]-pivot[1])];
    if (rounding<0.5) parts.push('L '+pair(towards(scaled[k-1])));
    parts.push('Q '+pair(pivot)+' '+pair(rounding===0.5?midpoint(pivot,scaled[k+1]):towards(scaled[k+1])));
  }
  parts.push('L '+pair(scaled[scaled.length-1]));
  return parts.join(' ');
}


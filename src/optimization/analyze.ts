import { distance, type Point, type Stroke, type Parameters } from '../core/types';
export function productionReport(strokes:Stroke[],p:Parameters){
  let length=0,minRadius=Infinity,intersections=0,proximity=0;
  const segments:{a:Point;b:Point;stroke:number;index:number;along:number}[]=[];
  strokes.forEach((s,stroke)=>{
    let along=0;
    for(let i=1;i<s.points.length;i++){const a=s.points[i-1],b=s.points[i],d=distance(a,b);length+=d;segments.push({a,b,stroke,index:i,along});along+=d;}
    const pts=s.points.filter((q,i,a)=>!i||distance(q,a[Math.max(0,i-2)])>0.1);
    for(let i=1;i<pts.length-1;i++){const a=pts[i-1],b=pts[i],c=pts[i+1],cross=Math.abs((b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x));if(cross>1e-7)minRadius=Math.min(minRadius,distance(a,b)*distance(b,c)*distance(c,a)/(2*cross));}
  });
  const orient=(a:Point,b:Point,c:Point)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
  const pointSegment=(p:Point,a:Point,b:Point)=>{const d=(b.x-a.x)**2+(b.y-a.y)**2,t=d?Math.max(0,Math.min(1,((p.x-a.x)*(b.x-a.x)+(p.y-a.y)*(b.y-a.y))/d)):0;return distance(p,{x:a.x+t*(b.x-a.x),y:a.y+t*(b.y-a.y)});};
  const width=p.ledWidth+p.tolerance+2*p.wall;
  for(let i=0;i<segments.length;i++)for(let j=i+1;j<segments.length;j++){
    const a=segments[i],b=segments[j];
    if(a.stroke===b.stroke&&Math.abs(a.along-b.along)<width*2)continue;
    if(Math.max(a.a.x,a.b.x)+width<Math.min(b.a.x,b.b.x)||Math.max(b.a.x,b.b.x)+width<Math.min(a.a.x,a.b.x)||Math.max(a.a.y,a.b.y)+width<Math.min(b.a.y,b.b.y)||Math.max(b.a.y,b.b.y)+width<Math.min(a.a.y,a.b.y))continue;
    if(orient(a.a,a.b,b.a)*orient(a.a,a.b,b.b)<0&&orient(b.a,b.b,a.a)*orient(b.a,b.b,a.b)<0)intersections++;
    else if(Math.min(pointSegment(a.a,b.a,b.b),pointSegment(a.b,b.a,b.b),pointSegment(b.a,a.a,a.b),pointSegment(b.b,a.a,a.b))<width)proximity++;
  }
  const warnings:string[]=[];
  if(minRadius<p.minRadius)warnings.push(`Raggio rilevato ${minRadius.toFixed(1)} mm, inferiore ai ${p.minRadius} mm richiesti.`);
  if(intersections)warnings.push('Incroci tra percorsi: il LED non può occupare lo stesso spazio. Correggere il disegno prima della produzione.');
  if(proximity)warnings.push('Tratti vicini o sovrapposti: possibili fusioni delle pareti. Verificare nella vista 2D.');
  if(strokes.some(s=>s.points.reduce((sum,q,i,a)=>sum+(i?distance(q,a[i-1]):0),0)<p.ledWidth))warnings.push('Presenti tratti molto brevi (punti o accenti): richiedono una soluzione LED dedicata.');
  return {length,minRadius,intersections,proximity,warnings,paths:strokes.length};
}


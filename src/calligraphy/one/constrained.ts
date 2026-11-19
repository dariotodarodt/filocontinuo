/** Ogni curva è composta da cubiche che sottendono al massimo 45 gradi. */
type Command = ['turn'|'line', number, number?];
const turn=(degrees:number,radius=1):Command=>['turn',degrees,radius];
const line=(length:number):Command=>['line',length];
const hump=(angle:number,rise:number):Command[]=>[
  turn(-angle),line(rise),turn(2*angle),line(rise),turn(-angle)
];
const alphabet:Record<string,Command[]>={
  L:[...hump(100,2.8),line(1.4)],
  o:[turn(-115),turn(230,1.55),turn(-115)],
  v:[turn(62),line(.6),turn(-124),line(.6),turn(62)],
  e:[turn(-68),turn(148,1.35),turn(-80)],
  A:[...hump(70,2.6),line(.45)],
  m:[...hump(78,.3),...hump(78,.55)],
  r:[turn(-65),line(.75),turn(103),line(.7),turn(-38)],
  M:[...hump(74,1.7),...hump(74,1.7)]
};

export function constrainedOne(text:string,width:number,minRadius:number,variant=1):string{
  if(!text.trim()||text.length>100||![width,minRadius,variant].every(n=>Number.isFinite(n)&&n>0)) throw Error('Parametri ONE non validi');
  const commands:Command[]=[];
  for(const char of text){
    if(char===' '){commands.push(line(2));continue;}
    const glyph=alphabet[char];
    if(!glyph)throw Error('Glifo vincolato non disponibile: '+char);
    commands.push(line(.22),...glyph,line(.22));
  }
  let x=0,y=0,heading=0;
  const parts:{op:string;coords:number[]}[]=[{op:'M',coords:[0,0]}];
  for(const [op,value,r=1] of commands){
    if(op==='line'){
      x+=value*variant*Math.cos(heading);y+=value*variant*Math.sin(heading);
      parts.push({op:'L',coords:[x,y]});continue;
    }
    const count=Math.ceil(Math.abs(value)/45),angle=value*Math.PI/(180*count);
    const signed=r*Math.sign(angle),handle=4*signed*Math.tan(angle/4)/3;
    for(let i=0;i<count;i++){
      const next=heading+angle;
      const endX=x+signed*(Math.sin(next)-Math.sin(heading));
      const endY=y+signed*(Math.cos(heading)-Math.cos(next));
      parts.push({op:'C',coords:[x+handle*Math.cos(heading),y+handle*Math.sin(heading),endX-handle*Math.cos(next),endY-handle*Math.sin(next),endX,endY]});
      x=endX;y=endY;heading=next;
    }
  }
  const scale=width/x;
  if(scale<minRadius*1.015)throw Error('Larghezza insufficiente per i raccordi del profilo LED');
  return parts.map(p=>p.op+' '+p.coords.map(n=>n*scale).join(' ')).join(' ');
}

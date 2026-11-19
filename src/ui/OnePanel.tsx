import {useEffect,useMemo,useRef,useState} from 'react';
import {oneCenterline} from '../calligraphy/one/centerline';

import {bezierBounds} from '../vector/bounds';
import {parseCenterline} from '../vector/bezier';

import {constrainedOne} from '../calligraphy/one/constrained';
import type {OneSettings} from '../core/types';
export function OnePanel({width,minRadius,saved,initialText,onApply}:{width:number;minRadius:number;saved?:OneSettings;initialText:string;onApply:(text:string,d:string,one:OneSettings)=>void}){
  const [text,setText]=useState('Love');
  const [rounding,setRounding]=useState(0.5);
  const [perWord,setPerWord]=useState(false);
  const [constrained,setConstrained]=useState(true);
  const [speed,setSpeed]=useState(1);
  const [progress,setProgress]=useState(0);
  const [playing,setPlaying]=useState(false);
  useEffect(()=>{if(saved){setText(initialText);setRounding(saved.rounding);setPerWord(saved.perWord);setConstrained(saved.engine==='0.4.2');}},[saved,initialText]);
  const frame=useRef(0);
  useEffect(()=>{setPlaying(false);setProgress(0);},[text,width,rounding,perWord,constrained,minRadius]);
  useEffect(()=>{
    if(!playing)return;
    let last=performance.now();
    function tick(now:number){
      const delta=(now-last)*speed/6000;
      last=now;
      setProgress(p=>Math.min(1,p+delta));
      frame.current=requestAnimationFrame(tick);
    }
    frame.current=requestAnimationFrame(tick);
    return ()=>cancelAnimationFrame(frame.current);
  },[playing,speed]);
  useEffect(()=>{if(progress===1)setPlaying(false);},[progress]);
  let d='',error='';
  try { d=constrained?constrainedOne(text,width,minRadius,rounding*2):oneCenterline(text,width,rounding,perWord); } catch (cause) { error=String(cause); }
  const box=useMemo(()=>bezierBounds(d?parseCenterline(d):[]),[d]);
  return <details><summary>FILOCONTINUO ONE — Filo Unico</summary>
    <label><input type="checkbox" checked={constrained} onChange={e=>{setConstrained(e.target.checked);setPerWord(false);}}/>Geometria vincolata 0.4.2</label>
    <label>Testo ONE<input maxLength={100} value={text} onChange={event=>setText(event.target.value)}/></label>
    {error?<p role="alert">{error}</p>:<svg viewBox={`${box.minX-4} ${box.minY-4} ${box.width+8} ${box.height+8}`} width="100%" height="120"><path d={d} stroke="currentColor" strokeWidth={width/180} fill="none"/><path d={d} pathLength="1" strokeDasharray="1 1" strokeDashoffset={1-progress} stroke="#e76c2e" strokeWidth={width/130} fill="none"/><circle cx="0" cy="0" r={width/110} fill="green"/><circle cx={width} cy="0" r={width/110} fill="red"/></svg>}
    <label><input type="checkbox" disabled={constrained} checked={perWord} onChange={e=>setPerWord(e.target.checked)}/>Un percorso per parola</label>
    <label>Variante raccordi<select value={rounding} onChange={e=>setRounding(Number(e.target.value))}><option value={0.5}>Ampi</option><option value={0.35}>Medi</option><option value={0.2}>Stretti</option></select></label>
    <button disabled={!d||perWord} onClick={()=>{if(progress===1)setProgress(0);setPlaying(!playing);}}>{playing?'Pausa':'Mostra filo continuo'}</button>
    <button onClick={()=>{setProgress(0);setPlaying(false);}}>Riavvia</button>
    <label>Velocità<input type="range" min=".5" max="3" step=".5" value={speed} onChange={e=>setSpeed(Number(e.target.value))}/></label>
    <progress max={1} value={progress}/>
    <p>{perWord ? "Animazione disponibile per il percorso unico. " : ""}Proposta a {width} mm. Applica per analizzare la canaletta con il profilo corrente.</p>
    <button disabled={!d} onClick={()=>onApply(text,d,{engine:constrained?"0.4.2":"0.4.1",rounding,perWord})}>Applica percorso ONE</button>
  </details>;
}

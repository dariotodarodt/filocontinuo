import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { Channel } from '../geometry/channel';
import { bounds, type Stroke } from '../core/types';
import type { Inspection } from '../optimization/strict';

export function Viewport({channel,strokes,mode,wire,fitKey,diagnostics,onIssue,channelColor='#f9efda'}:{channel:Channel|null;strokes:Stroke[];mode:'2d'|'3d';wire:boolean;fitKey:number;diagnostics?:Pick<Inspection,'pathStatus'|'anomalies'>;onIssue?:(id:string)=>void;channelColor?:string}){
  const host=useRef<HTMLDivElement>(null),svgHost=useRef<SVGSVGElement>(null),channelMaterial=useRef<THREE.MeshStandardMaterial|null>(null);
  useEffect(()=>{channelMaterial.current?.color.set(channelColor);},[channelColor]);
  const b=bounds(strokes),pad=Math.max(15,b.width*0.1),v={x:b.minX-pad,y:-b.maxY-pad,w:Math.max(50,b.width+pad*2),h:Math.max(40,b.height+pad*2)};
  const view=useRef(v),drag=useRef<{x:number;y:number;vx:number;vy:number}|null>(null);
  useEffect(()=>{view.current=v;svgHost.current?.setAttribute('viewBox',`${v.x} ${v.y} ${v.w} ${v.h}`);},[strokes,fitKey]);
  useEffect(()=>{
    if(mode!=='3d'||!host.current||!channel)return;
    const el=host.current,scene=new THREE.Scene();scene.background=new THREE.Color('#e9ede8');
    let renderer:THREE.WebGLRenderer;
    try{renderer=new THREE.WebGLRenderer({antialias:true});}catch{el.textContent='WebGL non disponibile: utilizza la vista 2D.';return;}
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;el.appendChild(renderer.domElement);
    const camera=new THREE.PerspectiveCamera(36,1,0.1,20000);camera.up.set(0,0,1);
    const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;
    const mesh=new THREE.Mesh(channel.geometry,new THREE.MeshStandardMaterial({color:channelColor,roughness:0.64,metalness:0.02,wireframe:wire}));channelMaterial.current=mesh.material;mesh.castShadow=true;mesh.receiveShadow=true;scene.add(mesh);
    const box=channel.geometry.boundingBox!,center=box.getCenter(new THREE.Vector3()),span=Math.max(channel.width,channel.height,80);
    controls.target.copy(center);camera.position.set(center.x+span*0.05,center.y-span*0.8,span*1.3);controls.update();
    scene.add(new THREE.HemisphereLight(0xffffff,0x617166,3));const light=new THREE.DirectionalLight(0xffffff,4);light.position.set(center.x-100,center.y+50,400);light.castShadow=true;light.shadow.mapSize.set(2048,2048);Object.assign(light.shadow.camera,{left:-span,right:span,top:span,bottom:-span,far:2000});scene.add(light);scene.add(light.target);light.target.position.copy(center);
    const grid=new THREE.GridHelper(Math.ceil(span*3/10)*10,Math.ceil(span*3/10),0xaebcaf,0xd3dcd2);grid.rotation.x=Math.PI/2;grid.position.set(center.x,center.y,-0.12);scene.add(grid);
    const plane=new THREE.Mesh(new THREE.PlaneGeometry(span*4,span*4),new THREE.ShadowMaterial({opacity:0.12}));plane.position.set(center.x,center.y,-0.05);plane.receiveShadow=true;scene.add(plane);
    const resize=()=>{renderer.setSize(el.clientWidth,el.clientHeight);camera.aspect=el.clientWidth/el.clientHeight;camera.updateProjectionMatrix();};const observer=new ResizeObserver(resize);observer.observe(el);resize();
    let frame=0;const animate=()=>{frame=requestAnimationFrame(animate);controls.update();renderer.render(scene,camera);};animate();
    return()=>{cancelAnimationFrame(frame);observer.disconnect();controls.dispose();renderer.dispose();if(channelMaterial.current===mesh.material)channelMaterial.current=null;mesh.material.dispose();grid.geometry.dispose();(grid.material as THREE.Material).dispose();plane.geometry.dispose();plane.material.dispose();el.replaceChildren();};
  },[channel,mode,wire,fitKey]);
  if(mode==='3d')return <div className="three-host" ref={host} data-testid="three-view"/>;
  const contour=(paths:Channel['outer'])=>paths.map(p=>p.map((q,i)=>`${i?'L':'M'}${q.X/1000} ${-q.Y/1000}`).join(' ')+' Z').join(' ');
  return <svg ref={svgHost} className="vector-host" viewBox={`${v.x} ${v.y} ${v.w} ${v.h}`} onWheel={e=>{const old=view.current,f=e.deltaY>0?1.12:0.89;view.current={x:old.x+old.w*(1-f)/2,y:old.y+old.h*(1-f)/2,w:old.w*f,h:old.h*f};const n=view.current;e.currentTarget.setAttribute('viewBox',`${n.x} ${n.y} ${n.w} ${n.h}`);}} onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);drag.current={x:e.clientX,y:e.clientY,vx:view.current.x,vy:view.current.y};}} onPointerMove={e=>{if(!drag.current)return;const d=drag.current,rect=e.currentTarget.getBoundingClientRect(),scale=Math.max(view.current.w/rect.width,view.current.h/rect.height);view.current.x=d.vx-(e.clientX-d.x)*scale;view.current.y=d.vy-(e.clientY-d.y)*scale;const n=view.current;e.currentTarget.setAttribute('viewBox',`${n.x} ${n.y} ${n.w} ${n.h}`);}} onPointerUp={()=>drag.current=null}>
    <defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M10 0 H0 V10" fill="none" stroke="#cdd7cc" strokeWidth="0.25"/></pattern></defs>
    <rect x="-10000" y="-10000" width="20000" height="20000" fill="#e9ede8"/><rect x="-10000" y="-10000" width="20000" height="20000" fill="url(#grid)"/>
    {channel&&<><path d={contour(channel.outer)} fill="#c4b793" fillRule="evenodd"/><path d={contour(channel.inner)} fill="#fbf7e8" fillRule="evenodd"/></>}
    {strokes.map((s,i)=><path key={i} d={s.points.map((q,j)=>`${j?'L':'M'}${q.x} ${-q.y}`).join(' ')} fill="none" stroke={diagnostics?.pathStatus[i]==='error'?'#bf5143':diagnostics?.pathStatus[i]==='warning'?'#b58e2c':diagnostics?.pathStatus[i]==='unknown'?'#7d8795':'#27836d'} strokeWidth="0.6"/>)}
    {diagnostics?.anomalies.map(a=><circle key={a.id} cx={a.position.x} cy={-a.position.y} r={Math.max(1,v.w/300)} fill={a.severity==='error'?'#dc6858':'#dcb840'} stroke="white" strokeWidth=".3" onPointerDown={e=>{e.stopPropagation();onIssue?.(a.id);}}><title>{a.message}</title></circle>)}
  </svg>;
}

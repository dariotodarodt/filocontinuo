import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {DOMParser} from 'linkedom';
import {unzipSync,strFromU8} from 'fflate';
import {validateMesh} from '../src/geometry/channel';
test('generated V0.3 SVG previews cover six texts, three variants and two fixed widths',()=>{
  const names=readdirSync('.tools/legacy-examples/v03'),clean=names.filter(n=>n.endsWith('.svg')&&!n.endsWith('-neon.svg'));assert.equal(clean.length,36);
  for(const name of clean){const text=readFileSync('.tools/legacy-examples/v03/'+name,'utf8');assert.ok(!/NaN|Infinity/.test(text));const doc=new DOMParser().parseFromString(text,'image/svg+xml');assert.ok(doc.querySelector('path'));assert.ok(doc.documentElement.getAttribute('width')?.endsWith('mm'));}
});
test('V0.3 STL roundtrip, 3MF vertex references and OBJ indices are structurally valid',()=>{
  const root='.tools/legacy-examples/v03/Stay-playful-600-fluida',bytes=readFileSync(root+'.stl'),dv=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),n=dv.getUint32(80,true),points:number[]=[];
  assert.equal(bytes.length,84+n*50);for(let i=0;i<n;i++)for(let j=0;j<9;j++)points.push(dv.getFloat32(84+i*50+12+j*4,true));assert.equal(validateMesh(points).valid,true);
  const files=unzipSync(readFileSync(root+'.3mf')),xml=strFromU8(files['3D/3dmodel.model']),doc=new DOMParser().parseFromString(xml,'text/xml'),vertices=doc.querySelectorAll('vertex'),triangles=doc.querySelectorAll('triangle');assert.equal(triangles.length,n);assert.equal(doc.documentElement.getAttribute('unit'),'millimeter');
  for(const t of triangles)for(const key of ['v1','v2','v3']){const v=Number(t.getAttribute(key));assert.ok(v>=0&&v<vertices.length&&Number.isInteger(v));}
  const obj=readFileSync(root+'.obj','utf8'),lines=obj.split('\n'),count=lines.filter(l=>l.startsWith('v ')).length,faces=lines.filter(l=>l.startsWith('f '));assert.equal(faces.length,n);for(const f of faces)for(const value of f.slice(2).split(' ')){const v=Number(value.split('/')[0]);assert.ok(v>=1&&v<=count);}
});

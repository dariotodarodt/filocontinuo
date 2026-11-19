import test from 'node:test';
import assert from 'node:assert/strict';
import {composeWords} from '../src/calligraphy/one/words';
import {bezierBounds} from '../src/vector/bounds';
import {parseCenterline} from '../src/vector/bezier';
import {compositionGap} from '../src/calligraphy/one/measuredGap';
test('Frase in quattro righe, sette parole aperte e larghezza autorizzata',()=>{
 const paths=parseCenterline(composeWords('La tradizione\nSiciliana\nprende il tuo\nvolto',600));
 assert.equal(paths.length,7);assert.ok(paths.every(p=>!p.closed));assert.ok(Math.abs(bezierBounds(paths).width-600)<1e-6);
});
test('Testo arbitrario, collegamento esplicito e caratteri mancanti',()=>{
 assert.equal(parseCenterline(composeWords('Olga Olivia',400,false)).length,1);
 assert.throws(()=>composeWords('Olga\nOlivia',400,false));assert.throws(()=>composeWords('Olga🐈',400));
 assert.notEqual(composeWords('Olga',400,true,0),composeWords('Olga',400,true,2));
});
test('Distanze tra parole includono contatti e incroci interni ai segmenti',()=>{
 const a={points:[{x:0,y:0},{x:100,y:0}]};
 assert.equal(compositionGap([a,{points:[{x:40,y:-20},{x:40,y:20}]}],12),0);
 assert.equal(compositionGap([a,{points:[{x:30,y:7},{x:90,y:7}]}],12),7);
});
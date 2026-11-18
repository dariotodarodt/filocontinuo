import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'vite';
import {createElement} from 'react';
import {renderToString} from 'react-dom/server';
test('V0.3 initial UI shows real variant, mode and limit controls and blocks stale exports (SSR only)',async()=>{
  const server=await createServer({server:{middlewareMode:true,hmr:{port:24679}},appType:'custom',cacheDir:'.tools/vite-v03-test-cache'});
  try{const module=await server.ssrLoadModule('/src/App.tsx'),html=renderToString(createElement(module.default));for(const text of ['V0.3','Genera varianti','calligrafica','tecnica','neon','Larghezza massima percorso','Scostamento massimo proposta','Da verificare','export sospeso'])assert.ok(html.includes(text),text);assert.ok(html.includes('disabled'));}finally{await server.close();}
});

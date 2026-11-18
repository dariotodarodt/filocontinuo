import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'vite';
import {createElement} from 'react';
import {renderToString} from 'react-dom/server';
test('initial application renders V0.2 controls without a browser (no visual QA)',async()=>{
  const server=await createServer({server:{middlewareMode:true},appType:'custom',cacheDir:'.tools/vite-test-cache'});
  try{const module=await server.ssrLoadModule('/src/App.tsx');const html=renderToString(createElement(module.default));for(const text of ['V0.2','Editor nodi Bézier','Ottimizza percorso','Campione calibrazione','Libreria LED','Esporta modello','LED:','P1S:'])assert.ok(html.includes(text),`Missing ${text}`);}finally{await server.close();}
});

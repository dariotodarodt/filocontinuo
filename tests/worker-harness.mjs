import { parentPort } from 'node:worker_threads';
import { tsImport } from 'tsx/esm/api';
// Node adapter for testing the actual worker message handler. No browser is controlled.
// A real Web Worker has self === globalThis, including typed-array constructors.
// A detached object breaks loaders which resolve their global through self.
globalThis.self=globalThis;
globalThis.postMessage=data=>parentPort.postMessage(data);
await tsImport('../src/workers/computation.worker.ts',import.meta.url);
parentPort.on('message',data=>globalThis.self.onmessage({data}));

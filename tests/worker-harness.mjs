import { parentPort } from 'node:worker_threads';
import { tsImport } from 'tsx/esm/api';
// Node adapter for testing the actual worker message handler. No browser is controlled.
globalThis.self={postMessage:data=>parentPort.postMessage(data)};
await tsImport('../src/workers/computation.worker.ts',import.meta.url);
parentPort.on('message',data=>globalThis.self.onmessage({data}));

export type History<T>={past:T[];present:T;future:T[]};
export function makeHistory<T>(value:T):History<T>{return {past:[],present:structuredClone(value),future:[]};}
export function pushHistory<T>(h:History<T>,value:T):History<T>{return {past:[...h.past,structuredClone(h.present)].slice(-60),present:structuredClone(value),future:[]};}
export function undoHistory<T>(h:History<T>):History<T>{return h.past.length?{past:h.past.slice(0,-1),present:structuredClone(h.past.at(-1)!),future:[structuredClone(h.present),...h.future]}:h;}
export function redoHistory<T>(h:History<T>):History<T>{return h.future.length?{past:[...h.past,structuredClone(h.present)],present:structuredClone(h.future[0]),future:h.future.slice(1)}:h;}

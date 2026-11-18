// Shared by UI job handling and tests: a cancelled or superseded result is never accepted.
export class JobGate{private serial=0;next(){return ++this.serial;}cancel(){this.serial++;}accepts(id:number){return id===this.serial;}}

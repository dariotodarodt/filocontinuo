import {writeFileSync,mkdirSync} from 'node:fs';import {deflateSync} from 'node:zlib';
mkdirSync('build',{recursive:true});
const table=Array.from({length:256},(_,n)=>{for(let k=0;k<8;k++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
const crc=b=>{let c=0xffffffff;for(const v of b)c=table[(c^v)&255]^(c>>>8);return (c^0xffffffff)>>>0;};
const chunk=(type,data)=>{const t=Buffer.from(type),result=Buffer.alloc(12+data.length);result.writeUInt32BE(data.length);t.copy(result,4);data.copy(result,8);result.writeUInt32BE(crc(Buffer.concat([t,data])),8+data.length);return result;};
const curve=(a,b,c,d)=>Array.from({length:65},(_,i)=>{const t=i/64,u=1-t;return [u*u*u*a[0]+3*u*u*t*b[0]+3*u*t*t*c[0]+t*t*t*d[0],u*u*u*a[1]+3*u*u*t*b[1]+3*u*t*t*c[1]+t*t*t*d[1]];});
const paths=[[[76,205],[76,75],...curve([76,75],[76,43],[112,38],[191,47])],curve([76,122],[103,109],[136,109],[168,114])],segments=paths.flatMap(p=>p.slice(1).map((b,i)=>[p[i],b]));
const dist=(x,y,a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],l=dx*dx+dy*dy,t=l?Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/l)):0;return Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy);};
const raw=Buffer.alloc(256*(1+256*4));for(let y=0;y<256;y++){const row=y*(1+256*4);for(let x=0;x<256;x++){const near=Math.min(...segments.map(([a,b])=>dist(x+.5,y+.5,a,b))),mix=Math.max(0,Math.min(1,8-near)),corner=Math.hypot(Math.max(48-(x+.5),0,(x+.5)-208),Math.max(48-(y+.5),0,(y+.5)-208)),alpha=Math.max(0,Math.min(1,48.5-corner)),i=row+1+x*4;raw[i]=Math.round(23+(209-23)*mix);raw[i+1]=Math.round(40+(230-40)*mix);raw[i+2]=Math.round(31+(184-31)*mix);raw[i+3]=Math.round(alpha*255);}}
const header=Buffer.alloc(13);header.writeUInt32BE(256,0);header.writeUInt32BE(256,4);header[8]=8;header[9]=6;
const png=Buffer.concat([Buffer.from('89504e470d0a1a0a','hex'),chunk('IHDR',header),chunk('IDAT',deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]);writeFileSync('build/icon.png',png);
const ico=Buffer.alloc(22);ico.writeUInt16LE(1,2);ico.writeUInt16LE(1,4);ico.writeUInt16LE(1,10);ico.writeUInt16LE(32,12);ico.writeUInt32LE(png.length,14);ico.writeUInt32LE(22,18);writeFileSync('build/icon.ico',Buffer.concat([ico,png]));

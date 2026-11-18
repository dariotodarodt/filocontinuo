const {execFile}=require('node:child_process');const {promisify}=require('node:util');
const run=promisify(execFile);
async function verifyAuthenticode(file,expectedSubject){
  if(process.platform!=='win32'||typeof expectedSubject!=='string'||!expectedSubject)return false;
  const script="$ErrorActionPreference='Stop'; $s=Get-AuthenticodeSignature -LiteralPath $env:FILOCONTINUO_SIGNATURE_TARGET; @{status=$s.Status.ToString();subject=$s.SignerCertificate.Subject}|ConvertTo-Json -Compress";
  try{const {stdout}=await run('powershell.exe',['-NoLogo','-NoProfile','-NonInteractive','-Command',script],{windowsHide:true,timeout:30000,env:{...process.env,FILOCONTINUO_SIGNATURE_TARGET:file}});const result=JSON.parse(stdout.replace(/^\uFEFF/,''));return result.status==='Valid'&&result.subject===expectedSubject;}catch{return false;}
}
module.exports={verifyAuthenticode};

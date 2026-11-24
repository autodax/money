// Opens every page and lists script errors. Run from the repo root: node tests/errors.js
// (The font-download error in a sandbox with no internet is harmless.)
const {chromium}=require('playwright'),fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push('PAGEERR '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CONSOLE '+m.text())});
for(const f of fs.readdirSync('.').filter(f=>/^(wizard|roth|tax|spend)20\d\d\.html$/.test(f))){await p.goto('file://'+process.cwd()+'/'+f);await p.waitForTimeout(1500);console.log(f,errs.splice(0).join('\n')||'no errors')}
await b.close()})();

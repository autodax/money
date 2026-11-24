// Checks the leave-payout box shows only in the last work year, and its hints. Run from the repo root: node tests/leave-payout.js
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:402,height:874}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const at=async(f,h)=>{await p.goto('file://'+process.cwd()+'/'+f+h);await p.reload();await p.waitForTimeout(600)};
for(const [f,h] of [['wizard2027.html','#yr=2027&by=1966&lw=2028'],['wizard2027.html','#yr=2027&by=1966&lw=2029'],['wizard2028.html','#yr=2028&by=1966&lw=2028']]){
 await at(f,h);console.log(f,h,'payout box hidden:',await p.evaluate(()=>document.getElementById('skbox').hidden),'| date text:',await p.evaluate(()=>document.getElementById('skdate').textContent))}
await at('wizard2027.html','#yr=2027&by=1966&lw=2028&skg=40000');
console.log('hints:',await p.evaluate(()=>document.getElementById('skHint').textContent+' | '+document.getElementById('skdHint').textContent));
console.log(errs);await b.close()})();

// Prints the Wizard's plan text for a fictional last-year-of-work case, to read by eye.
// Run from the repo root: node tests/plan-text.js [qtr|wh|both] [wizard file] [extra #-link settings]
// e.g. node tests/plan-text.js qtr wizard2027.html "&skg=40000"
const {chromium}=require('playwright');
const mode=process.argv[2]||'qtr',file=process.argv[3]||'wizard2027.html',extra=process.argv[4]||'';
const acct=[{g:'pre',n:'Pre-tax A',t:'403',b:400000},{g:'pre',n:'Pre-tax B',t:'403',b:50000},{g:'pre',n:'Pre-tax C (cash-like)',t:'403',b:60000,e:1},{g:'pre',n:'Pre-tax D',t:'403',b:250000},{g:'pre',n:'Pre-tax E',t:'403',b:300000},{g:'pre',n:'Pre-tax 457',t:'457',b:250000},{g:'roth',n:'Roth 457',t:'457',b:70000},{g:'roth',n:'Roth 403',t:'403',b:40000},{g:'roth',n:'Roth IRA',t:'ira',b:130000},{g:'brk',n:'Brokerage',b:250000},{g:'brk',n:'T-bills',b:30000,e:1},{g:'cash',n:'Cash',b:25000}];
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:900,height:1000}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const yr=file.slice(6,10);
await p.goto(`file://${process.cwd()}/${file}#yr=${yr}&by=1966&lw=2028&w2027a=130000&w2027b=70000&w2028a=70000&w2028b=26000&ss70=4500&ssa=70&bas=170000&div=4000&lsp=90000&model=autog&bmode=set&setsp=85000&pay=qtr&npay=10.1&tpm=${mode}${extra}&acct=${encodeURIComponent(JSON.stringify(acct))}`);
await p.waitForTimeout(400);await p.evaluate(()=>show(5));await p.waitForFunction(()=>document.querySelector('#out').dataset.done==='1',null,{timeout:200000});
console.log(await p.evaluate(()=>document.querySelector('#out').innerText));if(errs.length)console.log('PAGE ERRORS',errs);await b.close()})();

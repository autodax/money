// FICTIONAL numbers only (no real balances or pay). Run from the repo root: node tests/compare.js <wizard file>
// Test every conversion strategy: rules hold each year, cash flow balances, plan renders, planner matches.
const {chromium}=require('playwright');const FILE=process.argv[2]||'wizard2026.html',YR=FILE.slice(6,10);
const acct=[{g:'pre',n:'Pre-tax A',t:'403',b:400000},{g:'pre',n:'Pre-tax B',t:'403',b:50000},{g:'pre',n:'Pre-tax C (cash-like)',t:'403',b:60000,e:1},{g:'pre',n:'Pre-tax D',t:'403',b:250000},{g:'pre',n:'Pre-tax E',t:'403',b:300000},{g:'pre',n:'Pre-tax 457',t:'457',b:250000},{g:'roth',n:'Roth 457',t:'457',b:70000},{g:'roth',n:'Roth 403',t:'403',b:40000},{g:'roth',n:'Roth IRA',t:'ira',b:130000},{g:'brk',n:'Brokerage',b:250000},{g:'brk',n:'T-bills',b:30000,e:1},{g:'cash',n:'Cash',b:25000}];
const base=`yr=${YR}&by=1966&lw=2028&w2026a=200000&w2026b=70000&w2027a=130000&w2027b=70000&w2028a=110000&w2028b=50000&ss70=4500&ss67=3500&ssa=70&bas=172000&div=4000&lsp=90000&end=95&tgt=85&lowP=75&upP=95&cush=300000&cmax=74&inf=3&acct=${encodeURIComponent(JSON.stringify(acct))}`;
const S=[['target','ttype=eff&teff=17'],['target','ttype=eff&teff=12'],['target','ttype=brk&tbrk=22'],['target','ttype=brk&tbrk=24'],['target','ttype=amt&tamt=40000'],
 ['fixed','camt=30000&camtN=40000'],['level','rtgt=40000&tbrk=24'],['level','rtgt=80000&tbrk=22'],['auto',''],['autog',''],['none',''],
 ['autog','meth=his'],['autog','meth=cus&mean=6&vol=14'],['target','ttype=eff&teff=17&cmax=70']];
const BM=['bmode=g','bmode=set&setsp=85000'],PAY=['pay=roll','pay=wh','pay=qtr'];
(async()=>{const b=await chromium.launch();let fails=0,n=0;
for(const [m,x] of S)for(const bm of BM)for(const pay of (m==='target'&&x==='ttype=eff&teff=17'?PAY:['pay=roll'])){
 const name=`${m} ${x} ${bm} ${pay}`;const p=await (await b.newContext()).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto(`file://${process.cwd()}/${FILE}#${base}&model=${m}&${x}&${bm}&${pay}`);await p.waitForTimeout(300);
 const r=await p.evaluate(()=>{const R=compute(),I=R.I,P=R.P,pol=P.pol,bad=[];if(R.err)return{bad:['err '+R.err]};
  const top=(y,c)=>{const o=rulesAt(y,I.yr,I.inf).ord.find(b=>Math.round(b[0]*100)==c);return o?o[2]:Infinity};
  // this year's conversion follows the rule
  if(I.model==='target'&&R.C>0){const s=scenario(I,R.C),s2=scenario(I,R.C+300),lim=I.ttype==='eff'?I.teff/100:I.ttype==='brk'?topOf(I.tbrk):I.tamt,v=I.ttype==='eff'?t=>t.eff:I.ttype==='brk'?t=>t.ordT:t=>t.tax;
    if(v(s.t)>lim+1e-6)bad.push(`this year over limit ${v(s.t)} > ${lim}`);if(v(s2.t)<=lim&&R.C+300<I.pre-I.rmdP)bad.push('this year could convert more')}
  if(I.model==='none'&&R.C>0)bad.push('none converts this year');
  if(I.model==='fixed'&&Math.abs(R.C-Math.min(I.camt,I.pre-I.rmdP))>1)bad.push('fixed this year '+R.C);
  // each projected year
  for(const w of P.main.rows){const C=w.C||0;
    if(!isFinite(w.T)||!isFinite(w.pre)||!isFinite(w.roth))bad.push(w.y+' not finite');
    if(Math.abs(w.imb||0)>1)bad.push(w.y+' cash flow off by '+Math.round(w.imb));
    if(C<-.5)bad.push(w.y+' negative conversion');
    if(w.age>I.cmax&&C>1)bad.push(w.y+` converts ${Math.round(C)} at ${w.age} past last conversion age`);
    if(C>1){if(pol.k==='eff'&&w.T/w.agi>pol.v+1e-4)bad.push(w.y+` eff ${(w.T/w.agi*100).toFixed(2)}% > ${pol.v*100}%`);
      if(pol.k==='brk'&&w.ordT>top(w.y,pol.v)+1)bad.push(w.y+` above ${pol.v}% bracket`);
      if(pol.k==='amt'&&w.T>pol.v+1)bad.push(w.y+` tax ${Math.round(w.T)} > ${pol.v}`);
      if(pol.k==='level'&&(C>pol.v+1||w.ordT>top(w.y,pol.cap)+1))bad.push(w.y+' level rule broken '+Math.round(C));
      if(pol.k==='none')bad.push(w.y+' none converts')}
    if(pol.k==='fixed'&&w.age<=I.cmax&&w.pre>pol.v+w.rmd+1&&Math.abs(C-pol.v)>1)bad.push(w.y+` fixed ${Math.round(C)} vs ${Math.round(pol.v)}`)}
  if(pol.k==='level'&&pol.v>0&&pol.v<5e6&&P.main.rmd75>I.rtgt*1.03)bad.push(`RMD at 75 ${Math.round(P.main.rmd75)} > ceiling ${I.rtgt}`);
  if(pol.k==='level'&&pol.v===0&&P.main.rmd75>I.rtgt*1.03)bad.push(`no conversions but RMD at 75 ${Math.round(P.main.rmd75)} > ceiling`);
  if(I.model==='auto'&&P.cands){const best=Math.max(...P.cands.map(c=>c.S));if(I.bmode!=='set'&&P.living<best-Math.max(50,best*.002)-1)bad.push('auto pick not near best')}
  if(I.bmode==='set'&&Math.abs(P.living-I.setsp)>1)bad.push('set spending not used');
  const sched=P.main.rows.filter(w=>w.C>1).map(w=>w.y+':'+Math.round(w.C/1000)+'k');
  return{bad,sum:`C${I.yr}=${Math.round(R.C)} pol=${pol.k}${pol.v!=null?':'+(pol.v<1?pol.v:Math.round(pol.v)):''} spend=${Math.round(P.living)} rmd75=${Math.round(P.main.rmd75||0)} conv=${sched.slice(0,4).join(' ')}${sched.length>4?' …('+sched.length+' yrs)':''}`}});
 // plan page renders cleanly
 await p.evaluate(()=>show(5));await p.waitForFunction(()=>document.querySelector('#out').dataset.done==='1',null,{timeout:300000});
 const txt=await p.evaluate(()=>document.querySelector('#out').innerText);
 if(/NaN|undefined|Infinity|couldn't be calculated/.test(txt))r.bad.push('plan text: '+(txt.match(/.{0,50}(NaN|undefined|Infinity|couldn't be calculated).{0,30}/)||[''])[0]);
 // planner link reproduces the strategy
 if(pay==='pay=roll'){const L=await p.evaluate(()=>([...document.querySelectorAll('a')].find(a=>/roth20\d\d\.html#/.test(a.href))||{}).href);
  if(!L)r.bad.push('no planner link');else{const q=await (await b.newContext()).newPage();q.on('pageerror',e=>errs.push('planner '+e.message));
   await q.goto(L.replace('https://autodax.github.io/money',`file://${process.cwd()}`));await q.waitForFunction(()=>window.CHECK,null,{timeout:300000});
   const pc=await q.evaluate(()=>({k:CHECK.pol.k,v:CHECK.pol.v}));const wc=await p.evaluate(()=>{const pl=compute().P.pol;return{k:pl.k,v:pl.v}});
   if(pc.k!==wc.k||Math.abs((pc.v||0)-(wc.v||0))>1e-6)r.bad.push(`planner ${pc.k}:${pc.v} vs wizard ${wc.k}:${wc.v}`)}}
 errs.forEach(e=>r.bad.push('error '+e));n++;if(r.bad.length)fails++;
 console.log((r.bad.length?'FAIL ':'ok   ')+name.padEnd(48)+' '+r.sum+(r.bad.length?'\n       '+r.bad.slice(0,6).join('\n       '):''));await p.context().close()}
console.log(`${n} cases, ${fails} failing`);await b.close()})();

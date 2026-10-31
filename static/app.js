/* Paperlens front end */
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const LS={get(k,f){try{const v=localStorage.getItem(k);return v==null?f:JSON.parse(v)}catch(e){return f}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};

/* ---------- icons ---------- */
const P={
home:'<path d="M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
book:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
chat:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
cols:'<path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7m0-18H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7m0-18v18"/>',
doc:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8"/>',
plus:'<path d="M12 5v14M5 12h14"/>',
globe:'<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/>',
moon:'<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
star:'<path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
search:'<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
kanban:'<rect x="3" y="3" width="5" height="14" rx="1.5"/><rect x="10" y="3" width="5" height="9" rx="1.5"/><rect x="17" y="3" width="4" height="17" rx="1.5"/>',
network:'<circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="8" r="2.5"/><circle cx="12" cy="18" r="2.5"/><path d="M8 7l8 1M7.5 8l3.5 8M16.5 10l-3.5 6"/>',
quote:'<path d="M7 7h4v5a4 4 0 0 1-4 4M15 7h4v5a4 4 0 0 1-4 4"/>',
pen:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
upload:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
download:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
cpu:'<rect x="5" y="5" width="14" height="14" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/>',
sliders:'<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
keyboard:'<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M6 9h.01M10 9h.01M14 9h.01M18 9h.01M7 15h10"/>',
menu:'<path d="M3 6h18M3 12h18M3 18h18"/>',
spark:'<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>',
grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
list:'<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
trash:'<path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>',
x:'<path d="M18 6L6 18M6 6l12 12"/>',
back:'<path d="M19 12H5M12 19l-7-7 7-7"/>',
check:'<path d="M20 6L9 17l-5-5"/>',
copy:'<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
words:'<path d="M4 7V4h16v3M9 20h6M12 4v16"/>',
layers:'<path d="M12 2l10 5-10 5L2 7zM2 17l10 5 10-5M2 12l10 5 10-5"/>',
link:'<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
brain:'<path d="M9 3a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 3 5h1V3zM15 3a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-3 5h-1V3z"/>',
flask:'<path d="M9 3h6M10 3v6L4 20h16l-6-11V3"/>'
};
const ico=n=>`<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n]||''}</svg>`;
const paintIcons=(r=document)=>$$('[data-ico]',r).forEach(e=>{if(!e.dataset.done){e.dataset.done=1;e.insertAdjacentHTML('afterbegin',ico(e.dataset.ico))}});
paintIcons();

/* ---------- state & helpers ---------- */
let papers=[],sel=new Set(),found=[],sys={},blk=0,mode='answer',view='home',statusF='',tagF='',layout=LS.get('pl-layout','grid'),chatLog=[],mapMode='papers',key='';
const STOP=new Set('what which does with that this from have about their there into were been paper study the and for are how why who when'.split(' '));
const VIEWS={home:'Dashboard',library:'Library',board:'Reading board',map:'Knowledge map',ask:'Ask your papers',compare:'Compare',review:'Literature review',cite:'Citations',notes:'Notes',upload:'Add papers',discover:'Find papers',pipeline:'How it works',paper:'Paper'};
async function api(url,o){const r=await fetch(url,o);const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||'Something went wrong. Try again.');return d}
const post=(u,b,m='POST')=>api(u,{method:m,headers:{'Content-Type':'application/json'},body:JSON.stringify(b)});
function toast(m,err){const t=$('#toast');t.textContent=m;t.className='show'+(err?' err':'');clearTimeout(t.t);t.t=setTimeout(()=>t.className='',3500)}
const load=m=>`<div class="empty"><span class="spin"></span>${m}<div class="skel" style="max-width:420px;margin:14px auto 0"></div></div>`;
const authorOf=p=>(p.authors||'').split(/,| and |;/)[0].trim().split(' ').pop();
const label=p=>{const a=authorOf(p);return a?`${a}${p.authors.split(/,| and |;/).length>1?' et al.':''} ${p.year||''}`.trim():p.title.split(' ').slice(0,4).join(' ')+'...'};
const copy=async(t,m='Copied')=>{try{await navigator.clipboard.writeText(t);toast(m)}catch(e){toast('Copy failed. Select the text and copy it manually.',1)}};
const dlBlob=(text,name,type='text/markdown')=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000)};
const STATUS={'to read':'var(--ac)','reading':'var(--gold2)','done':'var(--ok)'};
const getP=id=>papers.find(p=>p.id===id);

/* ---------- theme & settings ---------- */
const root=document.documentElement;
const rawGet=(k,f)=>{try{return localStorage.getItem(k)||f}catch(e){return f}},rawSet=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
function setMode(m){rawSet('pl-mode',m);const t=m==='auto'?(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'):m;root.dataset.theme=t;
  $('#modeBtn').innerHTML=ico(t==='dark'?'sun':'moon');$$('#modeSeg3 button').forEach(b=>b.classList.toggle('on',b.dataset.v===m))}
$('#modeBtn').onclick=()=>setMode(root.dataset.theme==='dark'?'light':'dark');
$$('#modeSeg3 button').forEach(b=>b.onclick=()=>setMode(b.dataset.v));
const ACC={indigo:'#4F46E5',teal:'#0E8A9B',rose:'#D6336C',emerald:'#139A6B',violet:'#7C3AED',amber:'#C2710C'};
$('#accents').innerHTML=Object.entries(ACC).map(([k,c])=>`<button data-a="${k}" style="background:${c}" aria-label="${k} accent" title="${k}"></button>`).join('');
function setAccent(a){root.dataset.accent=a;rawSet('pl-accent',a);$$('#accents button').forEach(b=>b.classList.toggle('on',b.dataset.a===a))}
$$('#accents button').forEach(b=>b.onclick=()=>setAccent(b.dataset.a));
function setFs(v){root.style.setProperty('--fs',v+'px');rawSet('pl-fs',v);$('#fs').value=v;$('#fsVal').textContent=v+'px'}
$('#fs').oninput=e=>setFs(e.target.value);
function setDens(d){root.dataset.density=d;rawSet('pl-density',d);$$('#densSeg button').forEach(b=>b.classList.toggle('on',b.dataset.v===d))}
$$('#densSeg button').forEach(b=>b.onclick=()=>setDens(b.dataset.v));
$('#resetPrefs').onclick=()=>{setMode('auto');setAccent('indigo');setFs(15);setDens('comfy');toast('Appearance reset')};
$('#reindexBtn').onclick=async()=>{toast('Indexing your library...');try{await post('/api/reindex',{});await loadStatus();toast('Library indexed')}catch(e){toast(e.message,1)}};
setMode(rawGet('pl-mode','auto'));setAccent(rawGet('pl-accent','indigo'));setFs(+rawGet('pl-fs','15'));setDens(rawGet('pl-density','comfy'));
const openOverlay=(el)=>{el.hidden=false;$('#scrim').hidden=el.id==='settings'?false:true};
$('#setBtn').onclick=()=>{$('#settings').hidden=false;$('#scrim').hidden=false;$('#setClose').focus()};
const closeSettings=()=>{$('#settings').hidden=true;$('#scrim').hidden=true};
$('#setClose').onclick=closeSettings;$('#scrim').onclick=()=>{closeSettings();$('#side').classList.remove('open')};
$('#keysBtn').onclick=()=>$('#keys').hidden=false;$('#keysClose').onclick=()=>$('#keys').hidden=true;
$('#keys').onclick=e=>{if(e.target.id==='keys')$('#keys').hidden=true};
$('#menuBtn').onclick=()=>{$('#side').classList.add('open');$('#scrim').hidden=false};

/* ---------- navigation ---------- */
function show(v){
  view=v;$$('.view').forEach(e=>e.classList.toggle('on',e.id==='view-'+v));
  $$('nav button').forEach(b=>b.classList.toggle('on',b.dataset.view===v));
  $('#crumbs').innerHTML=v==='paper'?'Library / <b>Paper</b>':`<b>${VIEWS[v]||''}</b>`;
  ({home:renderHome,library:renderLibrary,board:renderBoard,map:renderMap,ask:renderAsk,compare:renderCompare,review:renderReview,cite:renderCite,notes:renderNotes,pipeline:renderPipeline,discover:renderRecentSearch})[v]?.();
  renderSelbar();$('#side').classList.remove('open');$('#scrim').hidden=$('#settings').hidden;window.scrollTo(0,0)}
$$('nav button').forEach(b=>b.onclick=()=>show(b.dataset.view));
document.addEventListener('click',e=>{const g=e.target.closest('[data-go]');if(g)show(g.dataset.go)});
$('#back').onclick=()=>show('library');
async function refresh(keep){papers=await api('/api/papers');$('#count').textContent=papers.length;$('#dlAll').style.display=papers.length?'':'none';
  sel=new Set([...sel].filter(i=>getP(i)));if(!keep)show(view==='paper'?'library':view)}
async function loadStatus(){try{sys=await api('/api/status')}catch(e){sys={}}
  const dot=o=>`<span class="dot ${o?'ok':''}"></span>`;
  $('#sys').innerHTML=`<div>${dot(sys.llm)}AI model: ${sys.llm?esc(sys.model)+' ready':'offline'}</div>
  <div>${dot(sys.embed)}Search: ${sys.embed?'semantic + keyword':'keyword only'}</div>
  <details><summary>${sys.llm&&sys.embed?'Setup details':'Turn on AI features'}</summary>
  <p style="margin:6px 0">Install Ollama, then run:</p><code>ollama pull ${esc(sys.model||'mistral')}</code><code>ollama pull ${esc(sys.embed_model||'nomic-embed-text')}</code>
  <button class="btn ghost sm" id="recheck" style="color:#fff;border-color:rgba(255,255,255,.2)">Check again</button></details>`;
  $('#recheck').onclick=async()=>{toast('Checking and indexing...');await post('/api/reindex',{});await loadStatus();toast('Done')};
  if(view==='pipeline')renderPipeline()}

/* ---------- markdown-lite with citation chips ---------- */
function md(t,b){
  const inl=s=>s.replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/\[(\d{1,2})\]/g,(m,n)=>`<button class="cite" data-blk="${b}" data-n="${n}" title="Show source ${n}">${n}</button>`);
  let h='',ul=false;
  for(const l of esc(t||'').split('\n')){let m;
    if(m=l.match(/^#{1,3}\s+(.*)/)){if(ul){h+='</ul>';ul=false}h+=`<h4>${inl(m[1])}</h4>`}
    else if(m=l.match(/^\s*(?:[-*]|\d+\.)\s+(.*)/)){if(!ul){h+='<ul>';ul=true}h+=`<li>${inl(m[1])}</li>`}
    else if(!l.trim()){if(ul){h+='</ul>';ul=false}}
    else{if(ul){h+='</ul>';ul=false}h+=`<p>${inl(l)}</p>`}}
  return h+(ul?'</ul>':'')}
document.addEventListener('click',e=>{const c=e.target.closest('.cite[data-n]');if(!c)return;
  const el=document.getElementById(`src-${c.dataset.blk}-${c.dataset.n}`);if(!el)return;
  el.open=true;el.classList.remove('flash');void el.offsetWidth;el.classList.add('flash');el.scrollIntoView({behavior:'smooth',block:'center'})});
const hl=(t,q)=>{let s=esc(t);const w=[...new Set((q||'').toLowerCase().match(/[a-z][a-z0-9-]{3,}/g)||[])].filter(x=>!STOP.has(x));
  if(w.length)s=s.replace(new RegExp('\\b('+w.join('|')+')\\w*','gi'),'<mark>$&</mark>');return s};
function srcs(list,b,q){
  if(!list||!list.length)return'';
  return `<div class="srcs"><b>Sources (${list.length})</b>${list.map(s=>`<details class="srcbox" id="src-${b}-${s.n}">
  <summary><span class="cite static">${s.n}</span><b>${esc(s.label)}</b><span class="meta">page ${s.page}, ${esc(s.section)}</span>
  <span class="rel" title="Relevance ${Math.round(s.score*100)}%"><i style="width:${s.score*100}%"></i></span>
  <a href="/api/papers/${s.paper_id}/pdf#page=${s.page}" target="_blank" rel="noopener">Open page ${s.page}</a></summary>
  <p>${hl(s.text,q)}</p></details>`).join('')}</div>`}

/* ---------- command palette ---------- */
function cmdItems(q){
  const go=(v,l,i)=>({g:'Go to',l,i,f:()=>show(v)});
  const base=[go('home','Dashboard','home'),go('library','Library','book'),go('board','Reading board','kanban'),go('map','Knowledge map','network'),go('ask','Ask your papers','chat'),go('compare','Compare papers','cols'),go('review','Literature review','doc'),go('cite','Citations','quote'),go('notes','Notes','pen'),go('upload','Add papers','upload'),go('discover','Find papers','globe'),go('pipeline','How it works','cpu'),
   {g:'Actions',l:'Toggle light or dark theme',i:'moon',f:()=>setMode(root.dataset.theme==='dark'?'light':'dark')},
   {g:'Actions',l:'Open appearance settings',i:'sliders',f:()=>$('#setBtn').click()},
   {g:'Actions',l:'Select all papers',i:'check',f:()=>{papers.forEach(p=>sel.add(p.id));show('library')}},
   {g:'Actions',l:'Download all papers (ZIP)',i:'download',f:()=>{location.href='/api/download-all'}},
   {g:'Actions',l:'Export library as CSV',i:'download',f:()=>{location.href='/api/library.csv'}}];
  const ql=q.toLowerCase();
  const pp=papers.filter(p=>!ql||(p.title+' '+p.authors+' '+p.tags.join(' ')).toLowerCase().includes(ql)).slice(0,ql?8:4).map(p=>({g:'Papers',l:p.title,i:'doc',s:label(p),f:()=>openPaper(p.id)}));
  const cmds=base.filter(c=>!ql||c.l.toLowerCase().includes(ql));
  const askRow=q.trim()?[{g:'Ask AI',l:`Ask: ${q}`,i:'spark',f:()=>{show('ask');runAsk($('#thread'),q,scopeIds(),'answer')}}]:[];
  return [...askRow,...cmds,...pp]}
let cmdIdx=0,cmdRows=[];
function renderCmd(){const q=$('#cmdkInput').value;cmdRows=cmdItems(q);cmdIdx=Math.min(cmdIdx,Math.max(cmdRows.length-1,0));let g='',h='';
  cmdRows.forEach((r,i)=>{if(r.g!==g){g=r.g;h+=`<div class="grp">${g}</div>`}h+=`<button role="option" data-i="${i}" class="${i===cmdIdx?'on':''}">${ico(r.i)}<span>${esc(r.l.length>70?r.l.slice(0,70)+'...':r.l)}</span>${r.s?`<small>${esc(r.s)}</small>`:''}</button>`});
  $('#cmdkList').innerHTML=h||'<div class="empty" style="border:0">Nothing found.</div>';
  $$('#cmdkList button').forEach(b=>b.onclick=()=>runCmd(+b.dataset.i))}
function runCmd(i){const r=cmdRows[i];if(!r)return;closeCmd();r.f()}
function openCmd(){$('#cmdk').hidden=false;$('#cmdkInput').value='';cmdIdx=0;renderCmd();$('#cmdkInput').focus()}
function closeCmd(){$('#cmdk').hidden=true}
$('#cmdkOpen').onclick=openCmd;$('#cmdk').onclick=e=>{if(e.target.id==='cmdk')closeCmd()};
$('#cmdkInput').oninput=()=>{cmdIdx=0;renderCmd()};
$('#cmdkInput').onkeydown=e=>{if(e.key==='ArrowDown'){e.preventDefault();cmdIdx=Math.min(cmdIdx+1,cmdRows.length-1);renderCmd();$('#cmdkList .on')?.scrollIntoView({block:'nearest'})}
  else if(e.key==='ArrowUp'){e.preventDefault();cmdIdx=Math.max(cmdIdx-1,0);renderCmd();$('#cmdkList .on')?.scrollIntoView({block:'nearest'})}
  else if(e.key==='Enter'){e.preventDefault();runCmd(cmdIdx)}};
document.addEventListener('keydown',e=>{
  const typing=/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();$('#cmdk').hidden?openCmd():closeCmd();return}
  if(e.key==='Escape'){closeCmd();closeSettings();$('#keys').hidden=true;$('#side').classList.remove('open');return}
  if(typing||e.ctrlKey||e.metaKey||e.altKey)return;
  if(e.key==='?'){$('#keys').hidden=false;return}
  if(e.key==='t'){setMode(root.dataset.theme==='dark'?'light':'dark');return}
  if(e.key==='/'){e.preventDefault();openCmd();return}
  if(key==='g'){const m={h:'home',l:'library',a:'ask',u:'upload',b:'board',m:'map',c:'compare'}[e.key];key='';if(m)show(m);return}
  if(e.key==='g'){key='g';setTimeout(()=>key='',900)}});

/* ---------- ask ---------- */
function resultHTML(res,q,b){
  const badge=res.mode==='llm'?'<span class="badge ai">AI answer, grounded in your papers</span>':res.mode==='extractive'?'<span class="badge warn">Passages only</span>':'';
  return `<div class="ans">${badge}${md(res.answer,b)}${res.note?`<p class="note">${esc(res.note)}</p>`:''}
  <div class="ans-tools"><button class="btn ghost sm" data-copy="${b}">${ico('copy')}Copy answer</button><button class="btn ghost sm" data-note="${b}">${ico('pen')}Save to notes</button></div></div>${srcs(res.sources,b,q)}`}
const answers={};
document.addEventListener('click',e=>{const c=e.target.closest('[data-copy]'),n=e.target.closest('[data-note]');
  if(c)copy(answers[c.dataset.copy]?.answer||'','Answer copied');
  if(n){const a=answers[n.dataset.note];const ids=a?.ids||[];if(ids.length!==1)return toast('Open a single paper to save an answer to its notes.',1);saveToNotes(ids[0],`Q: ${a.q}\n${a.answer}`)}});
async function saveToNotes(id,text){try{const p=await api('/api/papers/'+id);await post('/api/papers/'+id,{notes:(p.notes?p.notes+'\n\n':'')+text},'PATCH');toast('Saved to notes')}catch(e){toast(e.message,1)}}
async function runAsk(box,q,ids,m){
  const b=++blk,item=document.createElement('div');item.innerHTML=`<div class="q"><span>${esc(q)}</span></div><div class="out">${load(m==='passages'?'Searching passages':'Reading the best passages and writing an answer. A local model can take a minute.')}</div>`;
  $('#askEmpty').hidden=true;box.append(item);item.scrollIntoView({behavior:'smooth',block:'nearest'});
  try{if(m==='passages'){const d=await post('/api/passages',{question:q,ids});
      item.querySelector('.out').innerHTML=`<p class="meta">${d.hits.length} passages, ranked by ${d.semantic?'meaning and keywords':'keywords'}</p>`+(srcs(d.hits,b,q)||'<div class="empty">No matching passages.</div>');
      $$('details',item).forEach((e,i)=>e.open=i<2);chatLog.push({q,a:d.hits.map(h=>`- (${h.label}, p.${h.page}) ${h.text}`).join('\n')})}
    else{const r=await post('/api/ask',{question:q,ids});answers[b]={answer:r.answer,q,ids};chatLog.push({q,a:r.answer});item.querySelector('.out').innerHTML=resultHTML(r,q,b)}}
  catch(e){item.querySelector('.out').innerHTML=`<div class="empty">${esc(e.message)}</div>`}}
const scopeIds=()=>[...sel];
function renderAsk(){
  const n=sel.size;$('#scopeLine').innerHTML=n?`${ico('layers')} Searching <b>${n}</b> selected paper${n>1?'s':''}`:`${ico('layers')} Searching your whole library (<b>${papers.length}</b> paper${papers.length===1?'':'s'})`;
  const th=$('#thread');
  if(!th.dataset.loaded){th.dataset.loaded=1;api('/api/chats').then(cs=>{cs.forEach(c=>{const b=++blk,d=document.createElement('div');answers[b]={answer:c.res.answer,q:c.question,ids:[]};chatLog.push({q:c.question,a:c.res.answer});
    d.innerHTML=`<div class="q"><span>${esc(c.question)}</span></div><div class="out">${resultHTML(c.res,c.question,b)}</div>`;th.append(d)});$('#askEmpty').hidden=th.children.length>0})}
  const sg=[['Methods','What methods do these papers use?'],['Findings','What are the main results reported?'],['Data','Which datasets were used?'],['Limits','What limitations do the authors mention?'],['Gaps','What future work do the authors suggest?'],['Simple','Explain these papers in simple words']];
  $('#askEmpty').innerHTML=sg.map(([t,q])=>`<button><b>${t}</b><small>${q}</small></button>`).join('');
  $$('#askEmpty button').forEach((b,i)=>b.onclick=()=>{if(!papers.length)return toast('Add a paper first.',1);runAsk($('#thread'),sg[i][1],scopeIds(),mode)});
  $('#askEmpty').hidden=$('#thread').children.length>0;
  if(!$('#askPicker').hidden)picker('#askPicker',renderAsk)}
$('#scopeBtn').onclick=()=>{const p=$('#askPicker');p.hidden=!p.hidden;if(!p.hidden)picker('#askPicker',renderAsk)};
$$('#modeSeg button').forEach(b=>b.onclick=()=>{mode=b.dataset.m;$$('#modeSeg button').forEach(x=>x.classList.toggle('on',x===b))});
$('#askForm').onsubmit=e=>{e.preventDefault();const q=$('#askQ').value.trim();if(!q)return;if(!papers.length)return toast('Add a paper first.',1);$('#askQ').value='';runAsk($('#thread'),q,scopeIds(),mode)};
$('#clearChats').onclick=async()=>{await api('/api/chats',{method:'DELETE'});$('#thread').innerHTML='';chatLog=[];$('#askEmpty').hidden=false;toast('History cleared')};
$('#exportChat').onclick=()=>{if(!chatLog.length)return toast('Nothing to export yet.',1);dlBlob('# Paperlens conversation\n\n'+chatLog.map(c=>`## ${c.q}\n\n${c.a}\n`).join('\n'),'paperlens_chat.md')};
$('#heroForm').onsubmit=e=>{e.preventDefault();const q=$('#heroQ').value.trim();if(!q)return;if(!papers.length)return toast('Add a paper first.',1);
  $('#heroQ').value='';show('ask');runAsk($('#thread'),q,scopeIds(),'answer')};

/* ---------- picker (ask, compare, review, cite) ---------- */
function picker(sel_,onchange){
  const el=$(sel_);if(!papers.length){el.innerHTML='<div class="empty">Your library is empty.</div>';return}
  el.innerHTML=`<div class="row"><button class="btn ghost sm" data-a="all">Select all</button><button class="btn ghost sm" data-a="none">Clear</button><span class="meta">${sel.size} selected</span></div>
  <div class="pick">${papers.map(p=>`<label><input type="checkbox" value="${p.id}" ${sel.has(p.id)?'checked':''}><span><b>${esc(label(p))}</b><br>${esc(p.title)}</span></label>`).join('')}</div>`;
  $$('input',el).forEach(i=>i.onchange=()=>{i.checked?sel.add(i.value):sel.delete(i.value);picker(sel_,onchange);onchange&&onchange();renderSelbar()});
  $$('[data-a]',el).forEach(b=>b.onclick=()=>{b.dataset.a==='all'?papers.forEach(p=>sel.add(p.id)):sel.clear();picker(sel_,onchange);onchange&&onchange();renderSelbar()})}

/* ---------- bulk selection bar ---------- */
function renderSelbar(){const b=$('#selbar');if(!sel.size||view!=='library'){b.hidden=true;return}b.hidden=false;
  b.innerHTML=`<b>${sel.size} selected</b><button class="btn gold" data-go="ask">Ask</button>${sel.size>1?'<button class="btn gold" data-go="compare">Compare</button><button class="btn gold" data-go="review">Review</button>':''}
  <button class="btn ghost" data-go="cite">Cite</button>
  <select id="bulkSt" aria-label="Set status"><option value="">Set status...</option><option>to read</option><option>reading</option><option>done</option></select>
  <button class="btn ghost" id="bStar">Star</button><button class="btn ghost" id="bTag">Tag</button><button class="btn ghost danger" id="bDel" style="color:#FF9AA5">Delete</button><button class="btn ghost" id="selClear">Clear</button>`;
  const bulk=async(action,value,msg)=>{try{await post('/api/papers/bulk',{ids:[...sel],action,value});await refresh(true);toast(msg);if(action==='delete')sel.clear();show(view)}catch(e){toast(e.message,1)}};
  $('#bulkSt').onchange=e=>e.target.value&&bulk('status',e.target.value,'Status updated');
  $('#bStar').onclick=()=>bulk('star',null,'Starred');
  $('#bTag').onclick=()=>{const t=prompt('Tag to add to the selected papers:');if(t&&t.trim())bulk('tag',t.trim(),'Tag added')};
  $('#bDel').onclick=()=>{if(confirm(`Delete ${sel.size} paper(s) and their PDFs? This cannot be undone.`))bulk('delete',null,'Deleted')};
  $('#selClear').onclick=()=>{sel.clear();renderLibrary()}}

/* ---------- home ---------- */
const stat=(i,a,l)=>`<div class="stat"><div class="si">${ico(i)}</div><div><b>${a}</b><span>${l}</span></div></div>`;
function donut(parts){const tot=parts.reduce((a,p)=>a+p.v,0)||1;let off=0;const R=48,C=2*Math.PI*R;
  const arcs=parts.map(p=>{const len=p.v/tot*C,s=`<circle r="${R}" cx="60" cy="60" fill="none" stroke="${p.c}" stroke-width="16" stroke-dasharray="${len} ${C-len}" stroke-dashoffset="${-off}" transform="rotate(-90 60 60)"/>`;off+=len;return s}).join('');
  return `<div class="donut"><svg viewBox="0 0 120 120" role="img" aria-label="Reading status chart"><circle r="${R}" cx="60" cy="60" fill="none" stroke="var(--soft2)" stroke-width="16"/>${arcs}<text x="60" y="58" text-anchor="middle" style="font:700 22px var(--serif);fill:var(--ink)">${Math.round((parts.find(p=>p.k==='done')?.v||0)/tot*100)}%</text><text x="60" y="74" text-anchor="middle" style="font:600 9px var(--sans);fill:var(--muted)">finished</text></svg>
  <div class="legend">${parts.map(p=>`<div><i style="background:${p.c}"></i>${p.k[0].toUpperCase()+p.k.slice(1)}<b>${p.v}</b></div>`).join('')}</div></div>`}
function renderHome(){
  const h=new Date().getHours();$('#hello').textContent=(h<5?'Working late':h<12?'Good morning':h<18?'Good afternoon':'Good evening')+(papers.length?`. You have ${papers.filter(p=>p.status!=='done').length} paper${papers.filter(p=>p.status!=='done').length===1?'':'s'} left to read.`:'. Let us build your library.');
  const n=papers.length,words=papers.reduce((a,p)=>a+p.analysis.words,0),min=papers.reduce((a,p)=>a+p.analysis.reading_minutes,0),refs=papers.reduce((a,p)=>a+p.analysis.reference_count,0);
  $('#homeStats').innerHTML=stat('book',n,'Papers')+stat('layers',(sys.chunks||0).toLocaleString(),'Searchable passages')+stat('words',words.toLocaleString(),'Words read')+stat('clock',min>=60?(min/60).toFixed(1)+' h':min+' min','Reading time')+stat('link',refs,'References tracked');
  $('#examples').innerHTML=['What methods do these papers use?','What are the main limitations?','Which datasets were used?','Summarize the key findings'].map(t=>`<span class="chip" role="button" tabindex="0">${t}</span>`).join('');
  $$('#examples .chip').forEach(c=>{c.onclick=()=>{$('#heroQ').value=c.textContent;$('#heroForm').requestSubmit()};c.onkeydown=e=>e.key==='Enter'&&c.click()});
  const cnt=s=>papers.filter(p=>p.status===s).length;
  $('#donut').innerHTML=n?donut([{k:'to read',v:cnt('to read'),c:'var(--ac)'},{k:'reading',v:cnt('reading'),c:'var(--gold)'},{k:'done',v:cnt('done'),c:'var(--ok)'}]):'<p class="meta">Add papers to track progress.</p>';
  const kw={};papers.forEach(p=>p.analysis.keywords.forEach(k=>kw[k.term]=(kw[k.term]||0)+1));
  const top=Object.entries(kw).sort((a,b)=>b[1]-a[1]).slice(0,30),mx=top[0]?.[1]||1;
  $('#cloud').innerHTML=top.length?top.map(([t,c])=>`<button style="font-size:${.95+c/mx*1.1}em" data-t="${esc(t)}">${esc(t)}</button>`).join(''):'<p class="meta">Add papers to see the topics they share.</p>';
  $$('#cloud button').forEach(b=>b.onclick=()=>{$('#filter').value=b.dataset.t;show('library')});
  const yc={};papers.forEach(p=>{if(p.year)yc[p.year]=(yc[p.year]||0)+1});const ys=Object.entries(yc).sort();const my=Math.max(...ys.map(y=>y[1]),1);
  $('#years').innerHTML=ys.length?`<div class="years">${ys.map(([y,c])=>`<div style="height:${c/my*100}%"><span>${c}</span></div>`).join('')}</div><div class="yl">${ys.map(([y])=>`<span>${String(y).slice(-2)}</span>`).join('')}</div>`:'<p class="meta">No publication years detected yet.</p>';
  const tc={};papers.forEach(p=>tc[p.analysis.study_type]=(tc[p.analysis.study_type]||0)+1);const tt=Object.entries(tc).sort((a,b)=>b[1]-a[1]).slice(0,6),tm=tt[0]?.[1]||1;
  $('#types').innerHTML=tt.length?`<div class="hbar">${tt.map(([t,c])=>`<div><span>${esc(t)}</span><span class="t"><i style="width:${c/tm*100}%"></i></span><b>${c}</b></div>`).join('')}</div>`:'<p class="meta">Nothing to show yet.</p>';
  const row=p=>`<button onclick="openPaper('${p.id}')"><span class="ttl">${esc(p.title)}</span><small>${esc(label(p))}</small></button>`;
  const empty='<div class="empty"><span class="big">Your library is empty</span>Start by adding a PDF or finding papers online.<div class="row" style="justify-content:center;margin-top:14px"><button class="btn" data-go="upload">Add a PDF</button><button class="btn ghost" data-go="discover">Find papers</button></div></div>';
  $('#recent').innerHTML=papers.length?papers.slice(0,5).map(row).join(''):empty;
  const vw=LS.get('pl-viewed',[]).map(getP).filter(Boolean).slice(0,5);
  $('#viewed').innerHTML=vw.length?vw.map(row).join(''):'<p class="meta" style="padding:4px 12px">Papers you open will appear here.</p>'}

/* ---------- library ---------- */
function visiblePapers(){
  const q=$('#filter').value.toLowerCase(),star=$('#starOnly').checked,so=$('#sort').value,ty=$('#typeF').value;
  let rows=papers.filter(p=>(p.title+' '+p.authors+' '+p.tags.join(' ')+' '+p.analysis.keywords.map(k=>k.term).join(' ')).toLowerCase().includes(q)&&(!statusF||p.status===statusF)&&(!star||p.starred)&&(!tagF||p.tags.includes(tagF))&&(!ty||p.analysis.study_type===ty));
  const cmp={new:()=>0,year:(a,b)=>(b.year||0)-(a.year||0),yearAsc:(a,b)=>(a.year||9999)-(b.year||9999),title:(a,b)=>a.title.localeCompare(b.title),star:(a,b)=>b.starred-a.starred,long:(a,b)=>b.analysis.words-a.analysis.words}[so];
  return [...rows].sort(cmp)}
function renderLibrary(){
  const types=[...new Set(papers.map(p=>p.analysis.study_type))].sort(),cur=$('#typeF').value;
  $('#typeF').innerHTML='<option value="">All study types</option>'+types.map(t=>`<option ${t===cur?'selected':''}>${esc(t)}</option>`).join('');
  const tags=[...new Set(papers.flatMap(p=>p.tags))].sort();
  $('#tagBar').innerHTML=tags.length?`<span class="meta" style="align-self:center">Tags:</span>`+tags.map(t=>`<span class="chip ${t===tagF?'on':''}" role="button" tabindex="0" data-tag="${esc(t)}">${esc(t)}</span>`).join(''):'';
  $$('#tagBar [data-tag]').forEach(c=>{c.onclick=()=>{tagF=tagF===c.dataset.tag?'':c.dataset.tag;renderLibrary()};c.onkeydown=e=>e.key==='Enter'&&c.click()});
  const rows=visiblePapers();
  $('#libInfo').textContent=`${rows.length} of ${papers.length} paper${papers.length===1?'':'s'} shown`;
  const L=$('#list');L.className='list '+layout;$$('#layoutSeg button').forEach(b=>b.classList.toggle('on',b.dataset.l===layout));
  L.innerHTML=rows.length?rows.map(p=>`<article class="card ${sel.has(p.id)?'picked':''}" data-st="${esc(p.status)}"><div class="card-top"><input type="checkbox" ${sel.has(p.id)?'checked':''} aria-label="Select paper" onchange="togSel('${p.id}',this.checked)">
   <h3 onclick="openPaper('${p.id}')">${esc(p.title)}</h3><button class="star ${p.starred?'on':''}" aria-label="Star" onclick="toggleStar('${p.id}')">${ico('star')}</button></div>
   <div class="meta">${esc(p.authors||'Unknown authors')}${p.year?', '+esc(p.year):''}<span class="src">${esc(p.source)}</span><span class="src">${esc(p.analysis.study_type)}</span><span class="src">${p.analysis.pages} pp</span></div>
   <div class="chips">${p.tags.map(t=>`<span class="chip tag">${esc(t)}</span>`).join('')}${p.analysis.keywords.slice(0,layout==='grid'?4:6).map(k=>`<span class="chip">${esc(k.term)}</span>`).join('')}</div>
   <div class="row"><button class="btn sm" onclick="openPaper('${p.id}')">Analyze</button><button class="btn sm ghost" onclick="sel=new Set(['${p.id}']);show('ask')">Ask</button>
   <a class="btn sm ghost" href="/api/papers/${p.id}/download" aria-label="Download PDF">${ico('download')}</a>
   <select class="st" aria-label="Reading status" style="color:${STATUS[p.status]}" onchange="setStatus('${p.id}',this.value)">${['to read','reading','done'].map(s=>`<option ${p.status===s?'selected':''}>${s}</option>`).join('')}</select>
   <button class="btn sm ghost danger" onclick="del('${p.id}')" aria-label="Delete paper">${ico('trash')}</button></div></article>`).join(''):
   `<div class="empty" style="grid-column:1/-1"><span class="big">${papers.length?'No papers match your filters':'Your library is empty'}</span>${papers.length?'Try clearing a filter.':'Add a PDF or find papers to get started.'}${papers.length?'':'<div class="row" style="justify-content:center;margin-top:14px"><button class="btn" data-go="upload">Add a PDF</button><button class="btn ghost" data-go="discover">Find papers</button></div>'}</div>`;
  renderSelbar()}
['#filter','#starOnly','#sort','#typeF'].forEach(s=>$(s).addEventListener(s==='#filter'?'input':'change',renderLibrary));
$$('#statusSeg button').forEach(b=>b.onclick=()=>{statusF=b.dataset.s;$$('#statusSeg button').forEach(x=>x.classList.toggle('on',x===b));renderLibrary()});
$$('#layoutSeg button').forEach(b=>b.onclick=()=>{layout=b.dataset.l;LS.set('pl-layout',layout);renderLibrary()});
$('#selAllVis').onclick=()=>{visiblePapers().forEach(p=>sel.add(p.id));renderLibrary()};
function togSel(id,on){on?sel.add(id):sel.delete(id);renderLibrary()}
async function toggleStar(id){const p=getP(id);await post('/api/papers/'+id,{starred:!p.starred},'PATCH');p.starred=!p.starred;renderLibrary()}
async function setStatus(id,s){await post('/api/papers/'+id,{status:s},'PATCH');getP(id).status=s;toast('Marked as '+s);if(view==='library')renderLibrary();if(view==='board')renderBoard()}
async function del(id){if(!confirm('Delete this paper and its PDF?'))return;await api('/api/papers/'+id,{method:'DELETE'});toast('Paper deleted');refresh()}
$('#dlAll').onclick=e=>{if(!papers.length){e.preventDefault();toast('Add a paper first.',1)}};

/* ---------- reading board ---------- */
function renderBoard(){
  const cols=[['to read','To read'],['reading','Reading'],['done','Done']];
  $('#boardCols').innerHTML=cols.map(([k,t])=>{const rows=papers.filter(p=>p.status===k);
    return `<div class="col" data-col="${k}"><h2><i style="background:${STATUS[k]}"></i>${t}<span class="pill">${rows.length}</span></h2>${rows.map(p=>`<div class="kcard" draggable="true" data-id="${p.id}"><h3>${esc(p.title)}</h3><div class="meta">${esc(label(p))} &middot; ${p.analysis.reading_minutes} min read</div>
    <div class="row"><button class="btn sm ghost" onclick="openPaper('${p.id}')">Open</button><button class="star ${p.starred?'on':''}" onclick="toggleStar('${p.id}').then(renderBoard)" aria-label="Star">${ico('star')}</button></div></div>`).join('')||'<p class="meta" style="padding:8px">Drop papers here</p>'}</div>`}).join('');
  $$('.kcard').forEach(c=>{c.ondragstart=e=>{e.dataTransfer.setData('text/plain',c.dataset.id);c.classList.add('drag')};c.ondragend=()=>c.classList.remove('drag')});
  $$('.col').forEach(c=>{c.ondragover=e=>{e.preventDefault();c.classList.add('over')};c.ondragleave=()=>c.classList.remove('over');
    c.ondrop=async e=>{e.preventDefault();c.classList.remove('over');const id=e.dataTransfer.getData('text/plain');if(id&&getP(id)&&getP(id).status!==c.dataset.col)await setStatus(id,c.dataset.col)}})}

/* ---------- knowledge map ---------- */
function layoutGraph(nodes,edges,W,H){
  nodes.forEach((n,i)=>{const a=i/nodes.length*Math.PI*2;n.x=W/2+Math.cos(a)*W*.3;n.y=H/2+Math.sin(a)*H*.3;n.vx=0;n.vy=0});
  for(let it=0;it<260;it++){const k=1-it/260;
    for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){const a=nodes[i],b=nodes[j];let dx=a.x-b.x,dy=a.y-b.y,d=Math.hypot(dx,dy)||1,f=22000/(d*d)*k;dx/=d;dy/=d;a.vx+=dx*f;a.vy+=dy*f;b.vx-=dx*f;b.vy-=dy*f}
    edges.forEach(e=>{const a=nodes[e.s],b=nodes[e.t];let dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1,f=(d-90-60/(e.w+1))*.02*Math.min(e.w,4);dx/=d;dy/=d;a.vx+=dx*f;a.vy+=dy*f;b.vx-=dx*f;b.vy-=dy*f});
    nodes.forEach(n=>{n.vx+=(W/2-n.x)*.0025;n.vy+=(H/2-n.y)*.0025;n.x+=Math.max(-12,Math.min(12,n.vx));n.y+=Math.max(-12,Math.min(12,n.vy));n.vx*=.6;n.vy*=.6;n.x=Math.max(20,Math.min(W-20,n.x));n.y=Math.max(20,Math.min(H-20,n.y))})}
  const xs=nodes.map(n=>n.x),ys=nodes.map(n=>n.y),x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
  nodes.forEach(n=>{n.x=70+(x1>x0?(n.x-x0)/(x1-x0):.5)*(W-140);n.y=45+(y1>y0?(n.y-y0)/(y1-y0):.5)*(H-110)})}
function renderMap(){
  const svg=$('#mapSvg'),W=900,H=540;
  if(papers.length<2&&mapMode==='papers'){svg.outerHTML=svg.outerHTML;$('#mapSvg').innerHTML='<text x="450" y="270" text-anchor="middle">Add at least two papers to see how they connect.</text>';}
  const kw=p=>new Set(p.analysis.keywords.map(k=>k.term));
  const freq={};papers.forEach(p=>kw(p).forEach(t=>freq[t]=(freq[t]||0)+1));
  const shared=Object.entries(freq).filter(([t,c])=>c>1).sort((a,b)=>b[1]-a[1]);
  $('#mapTopics').innerHTML=shared.slice(0,24).map(([t,c])=>`<span class="chip tag" role="button" tabindex="0" data-t="${esc(t)}">${esc(t)} (${c})</span>`).join('')||'<span class="meta">No topics are shared by more than one paper yet.</span>';
  $$('#mapTopics [data-t]').forEach(c=>{c.onclick=()=>{$('#filter').value=c.dataset.t;show('library')};c.onkeydown=e=>e.key==='Enter'&&c.click()});
  let nodes=[],edges=[];
  if(mapMode==='papers'){nodes=papers.slice(0,40).map(p=>({id:p.id,t:label(p),full:p.title,r:9+Math.min(p.analysis.pages/6,10),c:STATUS[p.status]}));
    for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){const a=kw(papers[i]),b=kw(papers[j]);let w=0;a.forEach(t=>b.has(t)&&w++);if(w>=2)edges.push({s:i,t:j,w})}}
  else{const tp=Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,36);nodes=tp.map(([t,c])=>({id:t,t,full:`${t}: in ${c} paper${c>1?'s':''}`,r:7+c*3,c:'var(--ac)'}));
    for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){let w=0;papers.forEach(p=>{const k=kw(p);k.has(nodes[i].id)&&k.has(nodes[j].id)&&w++});if(w>=1)edges.push({s:i,t:j,w})}}
  if(!nodes.length){svg.innerHTML='<text x="450" y="270" text-anchor="middle">Add papers to build the map.</text>';return}
  layoutGraph(nodes,edges,W,H);
  svg.innerHTML=edges.map(e=>`<line class="edge" x1="${nodes[e.s].x}" y1="${nodes[e.s].y}" x2="${nodes[e.t].x}" y2="${nodes[e.t].y}" stroke-width="${Math.min(1+e.w*.8,6)}"/>`).join('')+
   nodes.map((n,i)=>`<g><circle class="node" data-i="${i}" cx="${n.x}" cy="${n.y}" r="${n.r}" fill="${n.c}" fill-opacity=".85" stroke="var(--surface)" stroke-width="2" tabindex="0"/><text x="${n.x}" y="${n.y+n.r+12}" text-anchor="middle">${esc(n.t.length>22?n.t.slice(0,21)+'...':n.t)}</text></g>`).join('');
  const tip=$('#mapTip'),box=$('.mapwrap');
  $$('#mapSvg .node').forEach(c=>{const n=nodes[+c.dataset.i];
    c.onmouseenter=()=>{tip.hidden=false;tip.textContent=n.full};c.onmouseleave=()=>tip.hidden=true;
    c.onmousemove=e=>{const r=box.getBoundingClientRect();tip.style.left=Math.min(e.clientX-r.left+14,r.width-290)+'px';tip.style.top=e.clientY-r.top+14+'px'};
    c.onclick=()=>mapMode==='papers'?openPaper(n.id):($('#filter').value=n.id,show('library'));c.onkeydown=e=>e.key==='Enter'&&c.onclick()})}
$$('#mapSeg button').forEach(b=>b.onclick=()=>{mapMode=b.dataset.m;$$('#mapSeg button').forEach(x=>x.classList.toggle('on',x===b));renderMap()});

/* ---------- upload ---------- */
const drop=$('#drop'),fileIn=$('#file');
drop.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();fileIn.click()}};
['dragover','dragenter'].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.add('over')}));
['dragleave','drop'].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.remove('over')}));
drop.addEventListener('drop',e=>upload(e.dataTransfer.files));fileIn.onchange=()=>upload(fileIn.files);
async function upload(files){
  const pdfs=[...files].filter(f=>f.name.toLowerCase().endsWith('.pdf'));if(!pdfs.length)return toast('Only PDF files are supported.',1);
  const log=$('#uploadLog');log.innerHTML='';
  for(const f of pdfs){const row=document.createElement('div');row.innerHTML=`<span class="spin"></span>Reading and indexing ${esc(f.name)}`;log.append(row);
    const fd=new FormData();fd.append('files',f);
    try{const d=await api('/api/upload',{method:'POST',body:fd});
      if(d.failed.length){row.className='err';row.textContent=`${f.name}: ${d.failed[0].error}`}
      else{row.className='ok';row.innerHTML=`${esc(d.added[0].title)} <a href="#" onclick="openPaper('${d.added[0].id}');return false">Open analysis</a>`}}
    catch(e){row.className='err';row.textContent=`${f.name}: ${e.message}`}}
  fileIn.value='';await refresh(true);loadStatus()}

/* ---------- discover ---------- */
function renderRecentSearch(){const r=LS.get('pl-searches',[]);$('#recentSearch').innerHTML=r.length?`<span class="meta" style="align-self:center">Recent:</span>`+r.map(q=>`<span class="chip" role="button" tabindex="0">${esc(q)}</span>`).join(''):'';
  $$('#recentSearch .chip[role]').forEach(c=>{c.onclick=()=>{$('#q').value=c.textContent;$('#searchForm').requestSubmit()};c.onkeydown=e=>e.key==='Enter'&&c.click()})}
$('#searchForm').onsubmit=async e=>{e.preventDefault();$('#results').innerHTML=load('Searching');$('#resultBar').hidden=true;
  const q=$('#q').value.trim();LS.set('pl-searches',[q,...LS.get('pl-searches',[]).filter(x=>x!==q)].slice(0,6));renderRecentSearch();
  try{found=await api(`/api/search?q=${encodeURIComponent(q)}&source=${$('#src').value}`);renderResults()}catch(err){$('#results').innerHTML=`<div class="empty">${esc(err.message)}</div>`}};
function renderResults(){
  const n=found.filter(r=>r.pdf_url).length;$('#resultBar').hidden=!found.length;$('#resultInfo').textContent=`${found.length} results, ${n} with a free PDF`;
  const have=new Set(papers.map(p=>p.title.toLowerCase()));
  $('#results').innerHTML=found.length?found.map((r,i)=>`<article class="card"><h3>${esc(r.title)}</h3>
   <div class="meta">${esc(r.authors)}${r.year?', '+esc(r.year):''}<span class="src">${esc(r.source)}</span>${r.cited_by!=null?`<span class="src">${r.cited_by} citations</span>`:''}</div>
   <p class="abs">${esc(r.abstract)}</p><div class="row"><button class="btn sm" id="imp${i}" ${r.pdf_url&&!have.has(r.title.toLowerCase())?'':'disabled'} onclick="importOne(${i})">${have.has(r.title.toLowerCase())?'In your library':r.pdf_url?'Add to library':'No free PDF'}</button>
   ${r.url?`<a class="btn sm ghost" target="_blank" rel="noopener" href="${esc(r.url)}">View source</a>`:''}</div></article>`).join(''):'<div class="empty">No results. Try different words.</div>'}
async function importOne(i){const b=$('#imp'+i);b.disabled=true;b.innerHTML='<span class="spin"></span>Adding';
  try{await post('/api/import',found[i]);b.textContent='Added';toast('Added to your library');return true}catch(e){b.disabled=false;b.textContent='Try again';toast(e.message,1);return false}}
$('#importAll').onclick=async()=>{const btn=$('#importAll');btn.disabled=true;let ok=0;
  for(let i=0;i<found.length;i++){const b=$('#imp'+i);if(found[i].pdf_url&&b&&!b.disabled){btn.textContent=`Adding ${ok+1}...`;if(await importOne(i))ok++}}
  btn.disabled=false;btn.textContent='Add all with PDF';toast(`${ok} papers added`);await refresh(true);loadStatus()};

/* ---------- compare ---------- */
function renderCompare(){picker('#cmpPicker')}
$('#cmpGo').onclick=async()=>{if(sel.size<2)return toast('Select at least two papers.',1);if(sel.size>5)return toast('Select at most five papers.',1);
  const o=$('#cmpOut'),b=++blk;o.innerHTML=load('Comparing methods, data and results. A local model can take a minute.');
  try{const d=await post('/api/compare',{ids:[...sel]});const ps=d.papers,A=x=>x.analysis;
    const head=`<tr><th></th>${ps.map(p=>`<th>${esc(p.label)}<br><span class="meta">${esc(p.title)}</span></th>`).join('')}</tr>`;
    const st=(l,f)=>`<tr><td class="h">${l}</td>${ps.map(p=>`<td>${f(p)}</td>`).join('')}</tr>`;
    const heat=v=>`style="background:color-mix(in srgb,var(--ac) ${Math.round(Math.max(v,0)*100)}%,transparent);${v>.5?'color:#fff;font-weight:700':''}"`;
    o.innerHTML=`<div class="panel"><h2>How alike are they?</h2><table class="tbl"><tr><th></th>${ps.map(p=>`<th>${esc(p.label)}</th>`).join('')}</tr>
     ${d.similarity.map((r,i)=>`<tr><td class="h">${esc(ps[i].label)}</td>${r.map(v=>`<td ${heat(v)}>${Math.round(v*100)}%</td>`).join('')}</tr>`).join('')}</table>
     <p class="note">Similarity from ${d.sim_mode==='semantic'?'transformer embeddings':'weighted keywords (TF-IDF)'}.</p></div>
     <div class="panel"><div class="ph-row"><h2>Side by side</h2><button class="btn ghost sm" id="cmpCopy">${ico('copy')}Copy as Markdown</button></div><table class="tbl">${head}${st('Type',p=>esc(A(p).study_type))}${st('Pages',p=>A(p).pages)}${st('Words',p=>A(p).words.toLocaleString())}${st('References',p=>A(p).reference_count)}
     ${Object.entries(d.grid).map(([a,c])=>`<tr><td class="h">${a}</td>${ps.map(p=>{const x=c[p.id];return`<td>${x?`<p>${esc(x.text)} <button class="cite" data-blk="${b}" data-n="${x.n}">${x.n}</button></p>`:'<span class="meta">Not found</span>'}</td>`}).join('')}</tr>`).join('')}</table></div>
     <div class="panel"><h2>Shared and unique topics</h2><div class="chips">${d.shared.map(t=>`<span class="chip tag">${esc(t)}</span>`).join('')||'<span class="meta">No topics shared by every paper.</span>'}</div>
     ${ps.map(p=>`<p><b>${esc(p.label)}</b> <span class="meta">only:</span> ${(d.unique[p.id]||[]).map(t=>`<span class="chip">${esc(t)}</span>`).join(' ')||'<span class="meta">none</span>'}</p>`).join('')}</div>
     ${d.ai?`<div class="panel"><h2>AI comparison</h2><div class="ans">${md(d.ai,b)}</div></div>`:`<p class="note">${esc(d.note)}</p>`}${srcs(d.sources,b,'')}`;
    $('#cmpCopy').onclick=()=>{const rows=[['',...ps.map(p=>p.label)],['Type',...ps.map(p=>A(p).study_type)],['Pages',...ps.map(p=>A(p).pages)],...Object.entries(d.grid).map(([a,c])=>[a,...ps.map(p=>(c[p.id]?.text||'Not found').replace(/\|/g,'/').replace(/\n/g,' '))])];
      copy(rows.map((r,i)=>'| '+r.join(' | ')+' |'+(i===0?'\n|'+r.map(()=>' --- |').join(''):'')).join('\n'),'Table copied')}}
  catch(e){o.innerHTML=`<div class="empty">${esc(e.message)}</div>`}};

/* ---------- review ---------- */
let revMd='';function renderReview(){picker('#revPicker')}
$('#revGo').onclick=async()=>{if(sel.size<2)return toast('Select at least two papers.',1);
  const o=$('#revOut');o.innerHTML=load('Writing the review. A local model can take a few minutes.');
  try{const d=await post('/api/review',{ids:[...sel],topic:$('#revTopic').value});revMd=d.markdown;
    o.innerHTML=`<div class="panel"><div class="row"><button class="btn sm" id="rc">${ico('copy')}Copy text</button><button class="btn sm ghost" id="rw">Download for Word</button><button class="btn sm ghost" id="rm">Download .md</button>
    <a class="btn sm ghost" href="/api/cite-all?fmt=bibtex">References (BibTeX)</a><a class="btn sm ghost" href="/api/cite-all?fmt=apa">References (APA)</a></div>
    <div style="margin-top:12px">${d.mode==='llm'?'<span class="badge ai">AI draft, check every claim against the papers</span>':`<span class="badge warn">Outline draft</span><p class="note">${esc(d.note)}</p>`}</div>
    <div class="ans">${md(d.markdown,0)}</div></div>`;
    $('#rc').onclick=()=>copy(revMd);
    const dl=async f=>{const r=await fetch('/api/export-doc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({markdown:revMd,fmt:f,title:$('#revTopic').value||'literature_review'})});
      const a=document.createElement('a');a.href=URL.createObjectURL(await r.blob());a.download='literature_review.'+(f==='doc'?'doc':'md');a.click()};
    $('#rw').onclick=()=>dl('doc');$('#rm').onclick=()=>dl('md')}
  catch(e){o.innerHTML=`<div class="empty">${esc(e.message)}</div>`}};

/* ---------- citations ---------- */
let citeF='apa';
function renderCite(){picker('#citePicker')}
$$('#citeFmt button').forEach(b=>b.onclick=()=>{citeF=b.dataset.f;$$('#citeFmt button').forEach(x=>x.classList.toggle('on',x===b))});
$('#citeGo').onclick=async()=>{if(!sel.size)return toast('Select at least one paper.',1);try{const d=await post('/api/cite-selected',{ids:[...sel],fmt:citeF});$('#citeOut').value=d.text;toast(`${d.count} reference${d.count===1?'':'s'} generated`)}catch(e){toast(e.message,1)}};
$('#citeCopy').onclick=()=>{const t=$('#citeOut').value;t?copy(t,'References copied'):toast('Generate references first.',1)};

/* ---------- notes ---------- */
let notesData=[];
async function renderNotes(){try{notesData=await api('/api/notes')}catch(e){notesData=[]}drawNotes()}
function drawNotes(){const q=$('#noteFilter').value.toLowerCase();const rows=notesData.filter(n=>(n.title+n.notes).toLowerCase().includes(q));
  $('#notesList').innerHTML=rows.length?rows.map(n=>`<article class="card note-card"><h3 onclick="openPaper('${n.id}',7)">${esc(n.title)}</h3><div class="meta">${esc(n.authors||'')}${n.year?', '+esc(n.year):''}</div><pre>${esc(n.notes)}</pre></article>`).join(''):
   `<div class="empty"><span class="big">${notesData.length?'No notes match':'No notes yet'}</span>Open a paper and write in its Notes tab, or save an AI answer to notes.</div>`}
$('#noteFilter').oninput=drawNotes;
$('#notesExport').onclick=()=>{if(!notesData.length)return toast('No notes to export.',1);dlBlob('# Paperlens notes\n\n'+notesData.map(n=>`## ${n.title}\n${n.authors||''} ${n.year||''}\n\n${n.notes}\n`).join('\n'),'paperlens_notes.md')};

/* ---------- how it works ---------- */
function renderPipeline(){
  const C=[['NLP','brain','Text extraction, section detection, sentence splitting, keywords, TF-IDF, BM25 and readability.','Every uploaded PDF, the Overview tab and keyword search.',true],
   ['Transformers','cpu','Embedding model turns passages and questions into vectors that capture meaning.','Semantic search, related papers and similarity heatmaps.',!!sys.embed],
   ['Semantic search','search','Hybrid ranking: BM25 keywords merged with embedding similarity by reciprocal rank fusion.','Find passages mode and retrieval for every answer.',true],
   ['LLMs','spark','A local model through Ollama writes summaries, comparisons and reviews.','Methods and findings, AI comparison and literature review.',!!sys.llm],
   ['Text summarization','doc','Extractive summaries offline, plus AI methods and findings with citations.','Quick summary, Key points and Insights tabs.',true],
   ['RAG','chat','Retrieve the best passages, hand them to the LLM, answer with [n] citations to paper and page.','Ask your papers and the per-paper chat.',!!sys.llm]];
  $('#flow').innerHTML=C.map(([t,i,d,u,on])=>`<div class="fcard"><div class="fi">${ico(i)}</div><h3>${t}<span class="live ${on?'':'off'}">${on?'Active':'Fallback mode'}</span></h3><p>${d}</p><p class="use"><b>Used in:</b> ${u}</p></div>`).join('');
  $('#pipe').innerHTML=['PDF upload','Text extraction','Sections and passages','Embeddings','Hybrid index','Retrieve top passages','LLM answer','Cited result'].map((s,i,a)=>`<span class="step">${s}</span>${i<a.length-1?'<span class="arr">'+ico('back').replace('<svg','<svg style="transform:rotate(180deg)"')+'</span>':''}`).join('')}

/* ---------- paper detail ---------- */
async function openPaper(id,tab){
  view='paper';$$('.view').forEach(e=>e.classList.toggle('on',e.id==='view-paper'));$$('nav button').forEach(b=>b.classList.remove('on'));$('#crumbs').innerHTML='Library / <b>Paper</b>';renderSelbar();window.scrollTo(0,0);
  LS.set('pl-viewed',[id,...LS.get('pl-viewed',[]).filter(x=>x!==id)].slice(0,8));
  const box=$('#paper');box.innerHTML=load('Loading');
  let p;try{p=await api('/api/papers/'+id)}catch(e){box.innerHTML=`<div class="empty">${esc(e.message)}</div>`;return}
  const a=p.analysis;
  const list=(x,add)=>x.length?`<div class="hl-list">${x.map(s=>`<div class="hl"><span>${esc(s)}</span>${add?`<button class="btn sm ghost" data-addnote="${esc(s).replace(/"/g,'&quot;')}" title="Add to notes">${ico('pen')}</button>`:''}</div>`).join('')}</div>`:'<p class="meta">Nothing detected in this paper.</p>';
  const ul=x=>x.length?`<ul>${x.map(s=>`<li>${esc(s)}</li>`).join('')}</ul>`:'<p class="meta">Nothing detected in this paper.</p>';
  const bars=(rows,max,c)=>`<div class="bars">${rows.map(r=>`<div class="bar-row"><span>${esc(r[0])}</span><div class="track"><div class="fill ${c}" style="width:${r[1]/max*100}%"></div></div><span>${r[1]}</span></div>`).join('')}</div>`;
  const maxK=Math.max(...a.keywords.map(k=>k.count),1),maxS=Math.max(...a.sections.map(s=>s.words),1),maxY=Math.max(...a.reference_years.map(y=>y.count),1);
  const read=a.readability>=60?'Easy to read':a.readability>=40?'Moderately difficult':'Difficult, academic';
  const T=['Overview','Methods and findings','Ask this paper','Key points','Structure','References','Related','Notes'];
  box.innerHTML=`<div class="ph"><h1>${esc(p.title)}</h1><div class="meta">${esc(p.authors||'Unknown authors')}${p.year?', '+esc(p.year):''}<span class="src">${esc(p.source)}</span><span class="src">${esc(a.study_type)}</span></div>
   <div class="row" style="margin-top:14px"><a class="btn sm" href="/api/papers/${p.id}/pdf" target="_blank" rel="noopener">Read PDF</a><a class="btn sm ghost" href="/api/papers/${p.id}/download">Download PDF</a>
   <button class="btn sm ghost" data-c="apa">Copy APA</button><button class="btn sm ghost" data-c="bibtex">Copy BibTeX</button>
   <a class="btn sm ghost" href="/api/papers/${p.id}/export?fmt=md">Export report</a><a class="btn sm ghost" href="/api/papers/${p.id}/export?fmt=json">Export data</a>
   ${p.url?`<a class="btn sm ghost" target="_blank" rel="noopener" href="${esc(p.url)}">Original source</a>`:''}
   <select class="st" id="topSt" aria-label="Reading status" style="margin-left:auto">${['to read','reading','done'].map(s=>`<option ${p.status===s?'selected':''}>${s}</option>`).join('')}</select></div></div>
  <div class="tabs" role="tablist">${T.map((t,i)=>`<button role="tab" class="${i?'':'on'}" data-t="${i}">${t}</button>`).join('')}</div>
  <div class="tab on" data-t="0"><div class="grid" style="margin-bottom:16px">${[['book',a.pages,'Pages'],['words',a.words.toLocaleString(),'Words'],['clock',a.reading_minutes+' min','Reading time'],['layers',a.figures,'Figures'],['layers',a.tables,'Tables'],['link',a.reference_count,'References']].map(([i,n,l])=>stat(i,n,l)).join('')}</div>
   <div class="panel"><h2>Readability</h2><div class="gauge"><span class="meta">Hard</span><div class="g"><i style="left:${Math.max(2,Math.min(98,a.readability))}%"></i></div><span class="meta">Easy</span></div><p class="note" style="margin-top:8px">Score ${a.readability}: ${read}</p></div>
   ${a.abstract?`<div class="panel"><h2>Abstract</h2><p>${esc(a.abstract)}</p></div>`:''}<div class="panel"><div class="ph-row"><h2>Quick summary</h2><button class="btn ghost sm" id="copySum">${ico('copy')}Copy</button></div>${ul(a.summary)}</div>
   <div class="panel"><h2>Top keywords</h2>${bars(a.keywords.map(k=>[k.term,k.count]),maxK,'')}${a.phrases.length?`<h4>Common phrases</h4><div class="chips">${a.phrases.map(k=>`<span class="chip">${esc(k.term)} (${k.count})</span>`).join('')}</div>`:''}</div></div>
  <div class="tab" data-t="1"><div class="panel" id="insights"></div></div>
  <div class="tab" data-t="2"><div class="panel"><h2>Ask about this paper</h2><div class="chips ex2" id="quick" style="margin-bottom:14px"></div><div id="pthread" class="thread"></div>
   <form id="pform" class="askbar"><input id="pq" placeholder="Ask a question, for example: What dataset did they use?" aria-label="Question"><button class="btn gold" type="submit">Ask</button></form></div></div>
  <div class="tab" data-t="3"><div class="panel"><h2>Main claims and contributions</h2>${list(a.claims,1)}</div><div class="panel"><h2>Limitations and future work</h2>${list(a.limitations,1)}</div></div>
  <div class="tab" data-t="4"><div class="panel"><h2>Where the words go</h2>${a.sections.length?bars(a.sections.map(s=>[s.name,s.words]),maxS,'a'):'<p class="meta">No standard section headings were detected.</p>'}</div></div>
  <div class="tab" data-t="5"><div class="panel"><h2>Reference years</h2>${a.reference_years.length?`<div class="years">${a.reference_years.map(y=>`<div style="height:${y.count/maxY*100}%" title="${y.year}: ${y.count}"></div>`).join('')}</div><div class="yl">${a.reference_years.map(y=>`<span>${String(y.year).slice(2)}</span>`).join('')}</div>`:'<p class="meta">No reference list detected.</p>'}</div>
   <div class="panel"><h2>DOIs found</h2>${a.dois.length?a.dois.map(d=>`<a class="doi" target="_blank" rel="noopener" href="https://doi.org/${esc(d)}">${esc(d)}</a>`).join(''):'<p class="meta">No DOIs found in the text.</p>'}</div></div>
  <div class="tab" data-t="6"><div class="panel" id="related"></div></div>
  <div class="tab" data-t="7"><div class="panel"><h2>Your notes</h2><textarea id="notes" placeholder="Write your own notes, quotes and ideas here">${esc(p.notes)}</textarea>
   <div class="row" style="margin:12px 0"><input id="tags" placeholder="Tags, separated by commas" value="${esc(p.tags.join(', '))}" style="flex:1;min-width:200px"><select id="pst" aria-label="Status">${['to read','reading','done'].map(s=>`<option ${p.status===s?'selected':''}>${s}</option>`).join('')}</select><button class="btn" id="saveN">Save notes</button></div><p class="note" id="noteInfo"></p></div></div>`;
  paintIcons(box);
  const done={};
  const goTab=i=>{$$('.tabs button').forEach(x=>x.classList.toggle('on',x.dataset.t==i));$$('.tab').forEach(t=>t.classList.toggle('on',t.dataset.t==i));
    if(i==1&&!done.i){done.i=1;loadInsights(id)}if(i==6&&!done.r){done.r=1;loadRelated(id,p,a)}};
  $$('.tabs button').forEach(b=>b.onclick=()=>goTab(b.dataset.t));if(tab)goTab(tab);
  $$('[data-c]',box).forEach(b=>b.onclick=async()=>{const d=await api(`/api/papers/${id}/cite?fmt=${b.dataset.c}`);copy(d.text,'Citation copied')});
  $('#topSt').onchange=async e=>{await setStatus(id,e.target.value);$('#pst').value=e.target.value};
  $('#copySum').onclick=()=>copy(a.summary.join('\n'),'Summary copied');
  $$('[data-addnote]',box).forEach(b=>b.onclick=()=>{const t=b.dataset.addnote;const n=$('#notes');n.value=(n.value?n.value+'\n\n':'')+'> '+t;saveNotes(id);toast('Added to notes')});
  const qs=['What problem does this paper solve?','What method do the authors use?','What data was used?','What are the main results?','What are the limitations?','Explain this paper in simple words'];
  $('#quick').innerHTML=qs.map(q=>`<span class="chip" role="button" tabindex="0">${q}</span>`).join('');
  $$('#quick .chip').forEach(c=>{c.onclick=()=>runAsk($('#pthread'),c.textContent,[id],'answer');c.onkeydown=e=>e.key==='Enter'&&c.click()});
  $('#pform').onsubmit=e=>{e.preventDefault();const q=$('#pq').value.trim();if(q){$('#pq').value='';runAsk($('#pthread'),q,[id],'answer')}};
  $('#saveN').onclick=()=>saveNotes(id);
  let nt;$('#notes').oninput=()=>{$('#noteInfo').textContent='Unsaved changes';clearTimeout(nt);nt=setTimeout(()=>saveNotes(id,true),2500)}}
async function saveNotes(id,auto){try{await post('/api/papers/'+id,{notes:$('#notes').value,tags:$('#tags').value.split(','),status:$('#pst').value},'PATCH');$('#noteInfo').textContent='Saved '+new Date().toLocaleTimeString();if(!auto)toast('Notes saved');papers=await api('/api/papers')}catch(e){toast(e.message,1)}}
async function loadInsights(id,regen){const o=$('#insights'),b=++blk;o.innerHTML=load('Reading the paper to summarize its methods and findings. A local model can take a minute.');
  try{const d=regen?await api(`/api/papers/${id}/insights`,{method:'POST'}):await api(`/api/papers/${id}/insights`);answers[b]={answer:d.markdown,q:'Insights',ids:[id]};
    o.innerHTML=`<div class="ph-row"><h2>Methods and findings</h2><div class="row"><button class="btn ghost sm" data-copy="${b}">${ico('copy')}Copy</button><button class="btn ghost sm" id="regen">Regenerate</button></div></div>
     ${d.mode==='llm'?'<span class="badge ai">AI summary, cited to the paper</span>':`<span class="badge warn">Extracted passages</span><p class="note">${esc(d.note||'')}</p>`}<div class="ans" style="margin-top:10px">${md(d.markdown,b)}</div>${srcs(d.sources,b,'')}`;
    $('#regen').onclick=()=>loadInsights(id,true)}catch(e){o.innerHTML=`<div class="empty">${esc(e.message)}</div>`}}
async function loadRelated(id,p,a){const o=$('#related');o.innerHTML=load('Finding similar papers');
  try{const d=await api(`/api/papers/${id}/related`);const q=a.keywords.slice(0,3).map(k=>k.term).join(' ');
    o.innerHTML=`<h2>Similar papers in your library</h2>${d.items.length?`<div class="mini">${d.items.map(r=>`<button onclick="openPaper('${r.id}')"><span><b>${esc(r.title)}</b><br><small>${r.shared.map(esc).join(', ')}</small></span><small>${Math.round(r.score*100)}% similar</small></button>`).join('')}</div><p class="note">Measured with ${d.mode==='semantic'?'transformer embeddings':'weighted keywords (TF-IDF)'}.</p>`:'<p class="meta">Add more papers to see related work.</p>'}
     <div class="row"><button class="btn" id="simWeb">Find similar papers online</button></div>`;
    $('#simWeb').onclick=()=>{show('discover');$('#q').value=q;$('#searchForm').requestSubmit()}}catch(e){o.innerHTML=`<div class="empty">${esc(e.message)}</div>`}}

/* ---------- start ---------- */
(async()=>{await Promise.all([refresh(true),loadStatus()]);show('home')})();

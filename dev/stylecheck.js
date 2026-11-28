// Style check for the fdtd shelf: dashes and semicolons in prose, including teach, qa, mistakes and video notes.
const {JSDOM}=require('jsdom');const fs=require('fs');const path=require('path');
const root=process.argv[2], pref=process.argv[3]||'fdtd-';
let html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const dom=new JSDOM(html.replace(/<script src="[^"]+"><\/script>/g,''),{runScripts:'outside-only',url:'https://x.test/'});
const w=dom.window; w.matchMedia=()=>({matches:true});
const files=[...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m=>m[1]).filter(f=>fs.existsSync(path.join(root,f)));
w.eval(files.map(f=>fs.readFileSync(path.join(root,f),"utf8")).join("\n;\n")+"\nwindow.__L=LIBRARY;");
let n=0;
const strip=t=>String(t||'').replace(/<[^>]*>/g,' ').replace(/\\\(.*?\\\)|\\\[[\s\S]*?\\\]/g,' ').replace(/&[a-z]+;/g,' ');
for(const g of w.__L.flatMap(s=>s.groups)) for(const l of g.lessons){ if(!l.id.startsWith(pref)) continue;
  const parts=[['big',l.big],['bridge',l.bridge],['summary',l.summary],...(l.teach||[]).map(t=>['teach',t]),...(l.qa||[]).flatMap(q=>[['q',q[0]],['a',q[1]]]),...(l.mistakes||[]).map(t=>['mist',t]),...(l.videos||[]).map(v=>['vid',v[0]+' '+v[2]]),...(l.sheet||[]).map(r=>['sheet',r[1]]),
   ...l.cards.flatMap((c,i)=>[['t'+i,c.t],['intu'+i,c.intu],['say'+i,c.say],['num'+i,c.num],['note'+i,c.note],...c.how.map(h=>['how'+i,h]),...c.sym.map(s=>['sym'+i,s[1]])])];
  for(const [k,t] of parts){ const s=strip(t); const m=s.match(/.{0,30}[—–;].{0,20}/g); if(m){ n+=m.length; console.log(l.id,k,JSON.stringify(m)); } }
}
console.log('style problems',n);

// like run2 but skips missing script files and can filter by group
const {JSDOM,VirtualConsole}=require('jsdom');const fs=require('fs');const path=require('path');
const root=process.argv[2], only=process.argv[3];
let html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const vc=new VirtualConsole();vc.on('jsdomError',e=>{ if(!/Not implemented/.test(e.message)) console.log('JSDOMERR',e.message)});
const dom=new JSDOM(html.replace(/<script src="[^"]+"><\/script>/g,''),{runScripts:'outside-only',pretendToBeVisual:true,url:'https://x.test/',virtualConsole:vc});
const w=dom.window; w.matchMedia=()=>({matches:true}); w.scrollTo=()=>{}; w.Element.prototype.scrollIntoView=()=>{};
w.HTMLCanvasElement.prototype.getContext=function(){return {createImageData:(a,b)=>({data:new Uint8ClampedArray(a*b*4),width:a,height:b}),putImageData(){},fillRect(){},strokeRect(){},beginPath(){},moveTo(){},lineTo(){},stroke(){},arc(){},fill(){},set fillStyle(v){},set strokeStyle(v){},set lineWidth(v){}};};
const files=[...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m=>m[1]).filter(f=>fs.existsSync(path.join(root,f)));
w.eval(files.map(f=>fs.readFileSync(path.join(root,f),"utf8")).join("\n;\n")+"\nwindow.__L=LIBRARY;window.route=route;");
w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
let errs=0; const t00=Date.now();
for(const g of w.__L[0].groups){ if(only && g.id!==only) continue; for(const l of g.lessons){ w.location.hash='#'+l.id; w.eval('route()');
  for(let i=0;i<l.cards.length;i++){ const t0=Date.now(); try{ w.document.querySelectorAll('#tabs button')[i].click();
      const fig=w.document.getElementById('fig').innerHTML; if(fig.length<40) throw new Error('empty fig');
      w.document.querySelectorAll('#ctl input[type=range]').forEach(r=>{for(const v of [r.min,r.max,r.value]){r.value=v;r.dispatchEvent(new w.Event('input'));}});
      w.document.querySelectorAll('#ctl button').forEach(b=>{ if(!b.disabled) b.click(); });
      w.document.querySelectorAll('#ctl button').forEach(b=>{ if(!b.disabled) b.click(); });
      const all=w.document.getElementById('fig').innerHTML+w.document.getElementById('ctl').innerHTML;
      if(/NaN|undefined|Infinity/.test(all.replace(/Infinity nm/g,''))) throw new Error('NaN/undefined in output: '+(all.match(/.{60}(NaN|undefined|Infinity).{20}/)||[''])[0]);
      const dt=Date.now()-t0; if(dt>1500) console.log('SLOW',l.id,'card',i+1,dt,'ms');
    }catch(e){errs++;console.log('ERR',l.id,'card',i+1,e.message.slice(0,300));} }
  // check text fields for dashes and semicolons in prose
  const prose=[l.big,l.bridge,l.summary,...l.cards.flatMap(c=>[c.intu,c.say,c.num,...c.how])].join(' ');
  const bad=(prose.match(/[—–]|;(?![^<]*>)/g)||[]); if(bad.length) console.log('STYLE',l.id,'dash/semicolon count',bad.length, (prose.match(/.{30}[—–;].{10}/g)||[]).slice(0,3));
  console.log('ok',l.id,l.cards.length);
}}
console.log('errors',errs,'time',Date.now()-t00);

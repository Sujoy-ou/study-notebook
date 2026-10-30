// Usage: node mathcheck.js <repoRoot> [comma-separated lesson ids, e.g. thesis-ch3-l1,thesis-ch3-l2]
// Checks every equation field (eq, sheet[i][0], sym[i][0]) of every lesson:
//  - all math must parse in MathJax TeX (undefined macros are errors)
//  - no leftover HTML math (<sub>, <sup>, &nbsp;) in eq or sheet
//  - eq must contain display math; text outside math only inside <div class="eqnote"> or <div class="eqref">
const {JSDOM}=require('jsdom');const fs=require('fs');const path=require('path');
const {mathjax}=require('mathjax-full/js/mathjax.js');const {TeX}=require('mathjax-full/js/input/tex.js');
const {liteAdaptor}=require('mathjax-full/js/adaptors/liteAdaptor.js');const {RegisterHTMLHandler}=require('mathjax-full/js/handlers/html.js');
const {AllPackages}=require('mathjax-full/js/input/tex/AllPackages.js');const {SVG}=require('mathjax-full/js/output/svg.js');
const adaptor=liteAdaptor();RegisterHTMLHandler(adaptor);
const tex=new TeX({packages:AllPackages.filter(p=>p!=='noundefined'),formatError:(j,e)=>{throw e;}});
const doc=mathjax.document('',{InputJax:tex,OutputJax:new SVG()});
const root=process.argv[2], only=(process.argv[3]||'').startsWith('--')?'':(process.argv[3]||'');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const dom=new JSDOM(html.replace(/<script[\s\S]*?<\/script>/g,''),{runScripts:'outside-only',url:'https://x.test/'});
const w=dom.window;w.matchMedia=()=>({matches:true});w.scrollTo=()=>{};
const files=[...html.matchAll(/<script src="(lessons\/[^"]+|app\.js)"><\/script>/g)].map(m=>m[1]);
w.eval(files.map(f=>fs.readFileSync(path.join(root,f),'utf8')).join('\n;\n')+'\nwindow.__L=LIBRARY;');
let bad=0,count=0;
const segs=s=>{const out=[];const re=/\\\[([\s\S]*?)\\\]|\\\(([\s\S]*?)\\\)/g;let m;while((m=re.exec(s)))out.push(m[1]!==undefined?m[1]:m[2]);return out;};
const check=(id,where,s,needMath)=>{
  if(typeof s!=='string'){console.log('NOTSTRING',id,where);bad++;return;}
  const ms=segs(s);
  if(needMath&&!ms.length){console.log('NOMATH',id,where,'|',s.slice(0,90));bad++;return;}
  if(/<su[bp]>|&nbsp;/.test(s)){console.log('HTMLMATH',id,where,'|',s.slice(0,90));bad++;}
  if(/[<>]/.test(ms.join(''))){console.log('ANGLE',id,where,'| use \\lt \\gt');bad++;}
  for(const t of ms){count++;try{doc.convert(t,{display:true});}catch(e){bad++;console.log('TEXERR',id,where,'|',e.message,'|',t.slice(0,120));}}
  if(where.endsWith(' eq')){const rest=s.replace(/\\\[[\s\S]*?\\\]/g,'').replace(/<div class="eq(note|ref)">[\s\S]*?<\/div>/g,'').trim();if(rest){console.log('LOOSETEXT',id,where,'|',rest.slice(0,90));bad++;}}
};
for(const g of w.__L[0].groups)for(const l of g.lessons){if(only&&!only.split(',').includes(l.id))continue;
  l.cards.forEach((c,i)=>{const onlyNote=/^\s*<div class="eqnote">[^<]*<\/div>\s*$/.test(c.eq||'');check(l.id,`card${i+1} eq`,c.eq,!onlyNote);c.sym.forEach((sy,j)=>{ if(/\\\(/.test(sy[0])||/[_^\\]|[α-ωΑ-Ω∂Δ∇]/.test(sy[0])) check(l.id,`card${i+1} sym${j+1}`,sy[0],true);});});
  l.sheet.forEach((r,i)=>check(l.id,`sheet${i+1}`,r[0],true));
  if(process.argv.includes('--prose')){
    const fields=[['big',l.big],['bridge',l.bridge],['summary',l.summary],...l.sheet.map((r,i)=>[`sheet${i+1} caption`,r[1]])];
    l.cards.forEach((c,i)=>{fields.push([`card${i+1} intu`,c.intu],[`card${i+1} say`,c.say],[`card${i+1} num`,c.num]);c.how.forEach((h,j)=>fields.push([`card${i+1} how${j+1}`,h]));c.sym.forEach((sy,j)=>fields.push([`card${i+1} symdesc${j+1}`,sy[1]]));});
    for(const [k,v] of fields){ if(typeof v!=='string')continue;
      for(const t of segs(v)){count++;try{doc.convert(t,{display:false});}catch(e){bad++;console.log('TEXERR',l.id,k,'|',e.message,'|',t.slice(0,120));}}
      if(/[<>]/.test(segs(v).join(''))){bad++;console.log('ANGLE',l.id,k);}
      const rest=v.replace(/<code>[\s\S]*?<\/code>/g,'').replace(/\\\([\s\S]*?\\\)/g,'');
      const m=rest.match(/.{0,25}([A-Za-zα-ωΑ-Ω\)\]][\^_][\{\w(α-ω+−\-]|<su[bp]>).{0,25}/g);
      if(m){bad+=m.length;m.forEach(x=>console.log('PROSEMATH',l.id,k,'|',x));}
    }
  }
}
console.log('math segments',count,'problems',bad);

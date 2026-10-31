/* Study Notebook engine.
   Subjects and groups are declared in LIBRARY below.
   Each lesson lives in its own file under lessons/ and calls addLesson(). */

const LIBRARY = [
  {
    id: "thesis", title: "M.Sc. Thesis",
    desc: "Inverse design of nanophotonic devices for quantum photonic integration. Defense 18 November 2026.",
    groups: [
      { id: "ch1", title: "Chapter 1: Introduction",
        desc: "Quantum dot physics behind Sec. 1.1 to 1.3 and Fig. 1.1, from bands to spin pumping.",
        lessons: [], planned: [] },
      { id: "ch2", title: "Chapter 2: Background",
        desc: "Waveguide optics, symmetry, grating couplers, DBR, MMI, and four lessons on how FDTD works. Theory only, computed live in the page.",
        lessons: [], planned: [] },
      { id: "ch3", title: "Chapter 3: Inverse design methods",
        desc: "The adjoint method, parameterizations, filters and projection, erosion and dilation, the erosion-dilation and curvature penalties, design rule checks and repair, Adam, and a full inverse design run computed live in the page. Theory only.",
        lessons: [], planned: [] }
    ]
  },
  {
    id: "pic", title: "Photonic Integrated Circuits",
    desc: "Integrated photonics for optical interconnects, from a single waveguide to a co-packaged link. Multilayer fabrication and heterogeneous integration, the published papers of Prof. Ning Li, and Tidy3D commands for PIC simulation. Theory and public papers only, computed live in the page.",
    groups: [
      { id: "basics", title: "Part 1: PIC basics, an optical link part by part",
        desc: "What a photonic chip is and why AI computers need it. Platforms, couplers, directional couplers, rings, modulators, photodetectors and lasers on silicon, with link budgets you can play with.",
        lessons: [], planned: [] },
      { id: "fab", title: "Part 2: Multilayer fabrication and heterogeneous integration",
        desc: "How a silicon photonics wafer is made step by step, how a second and third waveguide layer go on top, how light moves between layers, and how III-V material is brought onto silicon.",
        lessons: [], planned: [] },
      { id: "li", title: "Part 3: Prof. Ning Li's published work",
        desc: "The III-V on silicon plasmonic nanolaser, sub-photon-voltage LEDs, epitaxial lift-off and controlled spalling, and phase change memory, from the papers only.",
        lessons: [], planned: [] },
      { id: "tidy3d", title: "Part 4: Tidy3D for PICs, the commands",
        desc: "Building a PIC simulation in Tidy3D 2.12: Simulation, media and geometry, modes, monitors and results, S-parameters and sweeps, and a worked interlayer coupler and ring.",
        lessons: [], planned: [] }
    ]
  }
];

function addLesson(subjectId, groupId, lesson) {
  const s = LIBRARY.find(x => x.id === subjectId);
  const g = s && s.groups.find(x => x.id === groupId);
  if (g) g.lessons.push(lesson);
}

/* ---------- shared physics constants and helpers ---------- */
const a0 = 0.0381;          // hbar^2 / 2 m0 in eV nm^2
const Eg = 1.519;           // GaAs gap at 4 K, eV
const MUB = 57.88;          // Bohr magneton, ueV / T
const HBAR_UEV_NS = 0.6582; // hbar in ueV ns

function fw(V0, a, L) {
  let hi = Math.min(V0, a * Math.pow(Math.PI / L, 2)) - 1e-9, lo = 1e-9;
  const f = E => Math.sqrt(E / a) * Math.tan(Math.sqrt(E / a) * L / 2) - Math.sqrt((V0 - E) / a);
  for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; if (f(m) > 0) hi = m; else lo = m; }
  return (lo + hi) / 2;
}

const $ = id => document.getElementById(id);
const DEF = '<defs><marker id="ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></marker></defs>';
const svg = (h, b) => `<svg width="680" viewBox="0 0 680 ${h}" role="img">${DEF}${b}</svg>`;
const sl = (id, lab, mn, mx, st, v) => `<div class="row"><label for="${id}">${lab}</label><input type="range" id="${id}" min="${mn}" max="${mx}" step="${st}" value="${v}"><span class="v" id="${id}v"></span></div>`;
const btns = (items, attr) => `<div class="row">${items.map(([v, t]) => `<button data-${attr}="${v}">${t}</button>`).join("")}</div>`;
function pick(ctl, attr, cur) { ctl.querySelectorAll(`button[data-${attr}]`).forEach(b => b.classList.toggle("on", b.dataset[attr] === String(cur))); }
const EL = (x, y) => `<circle cx="${x}" cy="${y}" r="7" fill="#378ADD" stroke="#0C447C"/>`;
const HO = (x, y) => `<circle cx="${x}" cy="${y}" r="7" fill="none" stroke="#D85A30" stroke-width="2"/>`;
const axes = (x, y) => `<line x1="${x}" y1="${y}" x2="${x}" y2="${y-40}" stroke="var(--t)" stroke-width="1" marker-end="url(#ar)"/><line x1="${x}" y1="${y}" x2="${x+40}" y2="${y}" stroke="var(--t)" stroke-width="1" marker-end="url(#ar)"/><line x1="${x}" y1="${y}" x2="${x+24}" y2="${y-18}" stroke="var(--t)" stroke-width="1" marker-end="url(#ar)"/><text class="ts" x="${x-4}" y="${y-46}" text-anchor="middle">z</text><text class="ts" x="${x+46}" y="${y+4}">x</text><text class="ts" x="${x+28}" y="${y-22}">y</text>`;
const lobe = (cx, cy, dx, dy, rx, ry, rot, col) => `<ellipse cx="${cx+dx}" cy="${cy+dy}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${cx+dx} ${cy+dy})" fill="${col}" fill-opacity="0.35" stroke="${col}" stroke-width="1.2"/><ellipse cx="${cx-dx}" cy="${cy-dy}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${cx-dx} ${cy-dy})" fill="${col}" fill-opacity="0.35" stroke="${col}" stroke-width="1.2"/>`;
const ring = (cx, cy, rx, ry, dir, col) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="${col}" stroke-width="4"/><path d="M${cx-rx*0.5} ${cy-ry*0.87-2} Q${cx} ${cy-ry-6} ${cx+rx*0.5} ${cy-ry*0.87-2}" fill="none" stroke="${col}" stroke-width="1.5" ${dir>0?'marker-end':'marker-start'}="url(#ar)"/>`;
const lvl = (x1, x2, y, lab, side) => `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="var(--p)" stroke-width="2"/><text class="t" x="${side==="r"?x2+8:(x1+x2)/2}" y="${side==="r"?y+5:y-10}" text-anchor="${side==="r"?"start":"middle"}">${lab}</text>`;
const arrow = (x1, y1, x2, y2, col, w, dash, both) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="${w||2}" ${dash?`stroke-dasharray="${dash}"`:""} marker-end="url(#ar)" ${both?'marker-start="url(#ar)"':""}/>`;
function plot(x0, y0, w, h, xs, ys, xmin, xmax, ymin, ymax, col, width, dash) {
  let d = "";
  for (let i = 0; i < xs.length; i++) {
    const y = ys[i]; if (!isFinite(y)) continue;
    const X = x0 + (xs[i] - xmin) / (xmax - xmin) * w;
    const Y = y0 + h - (Math.min(Math.max(y, ymin), ymax) - ymin) / (ymax - ymin) * h;
    d += (d ? "L" : "M") + X.toFixed(1) + " " + Y.toFixed(1);
  }
  return `<path d="${d}" fill="none" stroke="${col}" stroke-width="${width||2}" ${dash?`stroke-dasharray="${dash}"`:""}/>`;
}
const range = (a, b, n) => Array.from({ length: n }, (_, i) => a + (b - a) * i / (n - 1));

/* Typeset LaTeX in the given elements with MathJax, once it has loaded. */
function typesetMath(...els) {
  const M = window.MathJax;
  if (!M || !M.typesetPromise) return;
  els = els.filter(Boolean);
  // MathJax calls must not overlap, so chain them on one promise.
  MJQ = MJQ.then(() => { if (M.typesetClear) M.typesetClear(els); return M.typesetPromise(els); }).then(() => fitMath(els)).catch(e => console.warn("MathJax", e));
}
let MJQ = Promise.resolve();
/* Equation-in-words visual: the equation large, colour-coded with labelled braces, then an optional SVG figure. */
function eqWords(fig, tex, figure, note) {
  fig.innerHTML = `<div class="eqbig">\\[${tex}\\]</div>${figure || ""}${note ? `<p class="note">${note}</p>` : ""}`;
  typesetMath(fig);
}
/* Shrink display equations that are wider than their box (down to 70 %), so nothing is cut off. */
function fitMath(els) {
  els.forEach(el => el.querySelectorAll('mjx-container[display="true"]').forEach(c => {
    c.style.fontSize = "";
    const box = c.clientWidth - 2, w = c.firstElementChild ? c.firstElementChild.getBoundingClientRect().width : 0;
    if (box > 0 && w > box) c.style.fontSize = Math.max(62, Math.floor(100 * box / w)) + "%";
  }));
}
window.addEventListener("resize", () => { const v = document.getElementById("view"); if (v && window.MathJax && MathJax.typesetPromise) fitMath([v]); });

let ANIM = null;
function stopAnim() { if (ANIM) cancelAnimationFrame(ANIM); ANIM = null; }
function anim(fn) { stopAnim(); const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches; const t0 = performance.now(); fn(0); if (reduce) return; const loop = t => { fn((t - t0) / 1000); ANIM = requestAnimationFrame(loop); }; ANIM = requestAnimationFrame(loop); }

/* ---------- progress (stored only in this browser) ---------- */
const PKEY = "study-notebook-read";
function getRead() { try { return JSON.parse(localStorage.getItem(PKEY) || "{}"); } catch (e) { return {}; } }
function setRead(id, v) { try { const r = getRead(); if (v) r[id] = 1; else delete r[id]; localStorage.setItem(PKEY, JSON.stringify(r)); } catch (e) {} }

/* ---------- views ---------- */
function findLesson(id) { for (const s of LIBRARY) for (const g of s.groups) for (const l of g.lessons) if (l.id === id) return { s, g, l }; return null; }

function tree(cur) {
  const rd = getRead();
  let h = `<li><a href="#" class="${cur ? "" : "cur"}">Library home</a></li>`;
  for (const s of LIBRARY) {
    h += `<li><p class="lab">${s.title}</p><ul>`;
    for (const g of s.groups) {
      h += `<li><span class="grp">${g.title}</span><ul>`;
      for (const l of g.lessons) h += `<li><a href="#${l.id}" class="${cur === l.id ? "cur" : ""}"><span>${l.short}</span>${rd[l.id] ? '<span class="chk">read</span>' : ""}</a></li>`;
      for (const p of g.planned || []) h += `<li><span class="soon">${p}</span></li>`;
      h += `</ul></li>`;
    }
    h += `</ul></li>`;
  }
  $("tree").innerHTML = h;
}

function home() {
  document.body.classList.remove("wide");
  const rd = getRead();
  let h = `<p class="crumb">Library</p><h1>Study Notebook</h1><p class="lead">Each subject has its own shelf. Open a lesson to read the big picture, work through the cards with the picture beside the explanation, and finish with the 30-second summary and the equation sheet.</p>`;
  for (const s of LIBRARY) {
    h += `<h2>${s.title}</h2><p class="lead">${s.desc}</p>`;
    for (const g of s.groups) {
      const tot = g.lessons.length + (g.planned || []).length, done = g.lessons.filter(l => rd[l.id]).length;
      h += `<h3 class="gt">${g.title}</h3><p class="src">${g.desc}</p><div class="libgrid">`;
      for (const l of g.lessons) h += `<a class="libcard" href="#${l.id}"><span class="k">${l.level || ""}</span><p class="n">${l.title}</p><p class="d">${rd[l.id] ? "Read" : "Not marked read"} · ${l.cards.length} cards</p></a>`;
      h += `</div><p class="src">${done} of ${tot} lessons marked read.</p><div class="bar"><i style="width:${tot ? done / tot * 100 : 0}%"></i></div>`;
    }
  }
  h += `<h2>Adding a new subject</h2><p class="addnote">Ask Claude to add a lesson or a new subject to the Study Notebook. It goes onto its own shelf here, under its own name, and this address keeps working.</p>`;
  $("view").innerHTML = h;
}

let cardIdx = 0;
function lesson(id) {
  const f = findLesson(id); if (!f) { home(); return; }
  document.body.classList.add("wide");
  const { s, g, l } = f, rd = getRead();
  const all = g.lessons, ix = all.indexOf(l), prev = all[ix - 1], next = all[ix + 1], base = all[0] && all[0].zero ? 0 : 1;
  $("view").innerHTML = `<p class="crumb"><a href="#">Library</a> / ${s.title} / ${g.title}</p>
  <h1>Lesson ${ix + base}: ${l.title}</h1>
  <p class="sec">Big picture</p><p class="big">${l.big}</p>
  ${l.bridge ? `<p class="src" style="max-width:80ch">${l.bridge}</p>` : ""}
  <div class="meta"><label><input type="checkbox" id="rd" ${rd[l.id] ? "checked" : ""}> I've read this lesson</label><span>${l.cards.length} cards, then summary and equation sheet</span></div>
  <h2>Cards</h2><div class="tabs" id="tabs"></div>
  <div class="card">
    <div class="vis"><h3 id="ct"></h3><div class="fig" id="fig"></div><div id="ctl"></div>
      <div class="nav2"><button id="cp">Previous card</button><button id="cn">Next card</button></div></div>
    <div class="exp">
      <p class="sec">${(l.labels && l.labels.intu) || "What the picture shows"}</p><p class="txt" id="intu"></p>
      <p class="sec">Equation</p><div class="eq" id="eq"></div><div class="sym" id="sym"></div>
      <p class="sec">${(l.labels && l.labels.how) || "Where it comes from"}</p><ol class="st" id="how"></ol>
      <p class="sec">Say it correctly</p><p class="say" id="say"></p>
      <p class="sec">Numbers</p><div class="num" id="num"></div>
      <div id="notewrap"></div>
    </div>
  </div>
  <h2>30-second summary</h2><p class="big">${l.summary}</p>
  <h2>Equation sheet</h2><div class="sheet">${l.sheet.map((r, i) => `<div class="r"><span>${i + 1}</span><div><div class="e">${r[0]}</div><div class="c">${r[1]}</div></div></div>`).join("")}</div>
  ${l.consts ? `<p class="src" style="margin-top:10px"><b>Constants:</b> ${l.consts}</p>` : ""}
  <h2>Sources</h2><ul class="src">${l.sources.map(x => `<li>${x}</li>`).join("")}</ul>
  <div class="nav2" style="margin-top:28px">${prev ? `<a href="#${prev.id}">← ${prev.short}</a>` : "<span></span>"}${next ? `<a href="#${next.id}">${next.short} →</a>` : `<span class="src">End of this chapter</span>`}</div>`;
  $("rd").onchange = e => { setRead(l.id, e.target.checked); tree(l.id); };
  cardIdx = 0;
  const draw = () => {
    stopAnim();
    const c = l.cards[cardIdx];
    $("tabs").innerHTML = l.cards.map((x, i) => `<button class="tab${i === cardIdx ? " on" : ""}" data-i="${i}">${x.s}</button>`).join("");
    $("tabs").querySelectorAll("button").forEach(b => b.onclick = () => { cardIdx = +b.dataset.i; draw(); });
    $("ct").innerHTML = c.t; $("intu").innerHTML = c.intu; $("eq").innerHTML = c.eq;
    $("sym").innerHTML = c.sym.map(([a, b]) => `<b>${a}</b><span>${b}</span>`).join("");
    $("how").innerHTML = c.how.map(h => `<li>${h}</li>`).join("");
    $("say").innerHTML = c.say; $("num").innerHTML = c.num;
    $("notewrap").innerHTML = c.note ? `<p class="sec">Note for the defense</p><div class="dnote">${c.note}</div>` : "";
    $("fig").innerHTML = ""; $("ctl").innerHTML = "";
    typesetMath($("ct"), $("eq"), $("sym"), $("intu"), $("how"), $("say"), $("num"), $("notewrap"));
    c.r($("fig"), $("ctl"));
    $("cp").disabled = cardIdx === 0; $("cn").disabled = cardIdx === l.cards.length - 1;
  };
  typesetMath(...document.querySelectorAll("#view .big, #view .sheet, #view .src"));
  const jump = d => { cardIdx += d; draw(); const t = $("tabs"); if (t.getBoundingClientRect().top < 0) t.scrollIntoView({ block: "start" }); };
  $("cp").onclick = () => jump(-1); $("cn").onclick = () => jump(1);
  draw();
}

function route() {
  stopAnim();
  const h = location.hash.replace("#", "");
  tree(h);
  if (h) lesson(h); else home();
  window.scrollTo(0, 0);
}
window.addEventListener("hashchange", route);
window.addEventListener("DOMContentLoaded", route);

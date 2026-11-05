/* Shared helpers for the Machine Learning shelf (lessons/ml-*). Loaded after app.js.
   ML.code     highlighted Python code box, optional current line
   ML.term     terminal box for shell commands
   ML.memory   line-by-line run of a short program with a names-to-objects memory diagram
   ML.axes     plot frame with ticks, returns the SVG string and the data-to-pixel maps
   ML.stepper  Back / Next control
   ML.agent    the "Do it with the agent" card visual: command, what the agent does, how you check
   ML.quiz     multiple-choice test with feedback, score and review of missed questions */
(function () {
const ML = window.ML = {};
ML.C = { coral: "#D85A30", blue: "#378ADD", teal: "#1D9E75", purple: "#7F77DD", amber: "#BA7517", gray: "#888780" };
ML.esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
ML.uid = p => (p || "m") + Math.floor(Math.random() * 1e9).toString(36);

/* ---------- Python syntax highlighting ---------- */
const KW = new Set("False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield".split(" "));
const BI = new Set("print len range type int float str bool list dict tuple set isinstance enumerate zip sum min max abs round sorted open super input repr id map filter any all".split(" "));
const TOK = /#.*|[rbfRBF]{0,2}("|')(?:\\.|(?!\1).)*\1|\b\d+(?:\.\d*)?(?:e[+-]?\d+)?\b|[A-Za-z_]\w*|\s+|./g;
ML.hl = function (line) {
  return line.replace(TOK, t => {
    const e = ML.esc(t);
    if (t[0] === "#") return `<span style="color:var(--muted);font-style:italic">${e}</span>`;
    if (/^[rbfRBF]{0,2}["']/.test(t) && t.length > 1) return `<span style="color:var(--teal)">${e}</span>`;
    if (/^\d/.test(t)) return `<span style="color:var(--coral)">${e}</span>`;
    if (KW.has(t)) return `<span style="color:var(--purple);font-weight:500">${e}</span>`;
    if (BI.has(t)) return `<span style="color:var(--blue)">${e}</span>`;
    return e;
  });
};
/* src: string or array of lines. cur: index of the line to mark, or -1. lang "py" or "text". */
ML.code = function (src, cur, lang) {
  const lines = Array.isArray(src) ? src : String(src).replace(/\n$/, "").split("\n");
  const body = lines.map((l, i) => {
    const on = i === cur;
    const txt = lang === "text" ? ML.esc(l) : ML.hl(l);
    return `<span style="display:block;${on ? "background:var(--accent-bg);box-shadow:inset 3px 0 var(--accent);" : ""}padding-left:6px">${txt || " "}</span>`;
  }).join("");
  return `<pre class="codebox" style="padding-left:6px"><code>${body}</code></pre>`;
};
/* Terminal box. Lines starting with "$ " are commands, the rest is output. */
ML.term = function (lines) {
  const body = lines.map(l => l.startsWith("$ ")
    ? `<span style="display:block"><span style="color:#55c4a2">$</span> <span style="color:#e4e8ef">${ML.esc(l.slice(2))}</span></span>`
    : `<span style="display:block;color:#9aa6b8">${ML.esc(l) || " "}</span>`).join("");
  return `<pre class="codebox" style="background:#151a22;border-color:#2f3946"><code>${body}</code></pre>`;
};

/* ---------- plot frame ---------- */
/* o: {xmin,xmax,ymin,ymax,nx,ny,xl,yl,fx,fy,grid}. Returns {s, X, Y}. */
ML.axes = function (x0, y0, w, h, o) {
  const X = v => x0 + (v - o.xmin) / (o.xmax - o.xmin) * w;
  const Y = v => y0 + h - (v - o.ymin) / (o.ymax - o.ymin) * h;
  const nx = o.nx || 5, ny = o.ny || 4, fx = o.fx || (v => +v.toFixed(2)), fy = o.fy || (v => +v.toFixed(2));
  let s = "";
  for (let i = 0; i <= nx; i++) {
    const v = o.xmin + (o.xmax - o.xmin) * i / nx, x = X(v);
    if (o.grid !== false) s += `<line x1="${x}" y1="${y0}" x2="${x}" y2="${y0 + h}" stroke="var(--line)" stroke-width="0.6"/>`;
    s += `<text class="ts" x="${x}" y="${y0 + h + 16}" text-anchor="middle">${fx(v)}</text>`;
  }
  for (let i = 0; i <= ny; i++) {
    const v = o.ymin + (o.ymax - o.ymin) * i / ny, y = Y(v);
    if (o.grid !== false) s += `<line x1="${x0}" y1="${y}" x2="${x0 + w}" y2="${y}" stroke="var(--line)" stroke-width="0.6"/>`;
    s += `<text class="ts" x="${x0 - 7}" y="${y + 4}" text-anchor="end">${fy(v)}</text>`;
  }
  s += `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="none" stroke="var(--p)" stroke-width="1"/>`;
  if (o.xl) s += `<text class="ts" x="${x0 + w / 2}" y="${y0 + h + 34}" text-anchor="middle">${o.xl}</text>`;
  if (o.yl) s += `<text class="ts" x="${x0 - 44}" y="${y0 + h / 2}" text-anchor="middle" transform="rotate(-90 ${x0 - 44} ${y0 + h / 2})">${o.yl}</text>`;
  return { s, X, Y };
};
ML.path = (pts, col, w, dash) => `<path d="${pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join("")}" fill="none" stroke="${col}" stroke-width="${w || 2}" ${dash ? `stroke-dasharray="${dash}"` : ""}/>`;
ML.readout = items => `<div class="readout">${items.map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`).join("")}</div>`;
ML.box = (x, y, w, h, cls, lines, big) => `<g class="${cls}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="7" stroke-width="0.8"/></g>` +
  lines.map((t, i) => `<text class="${i === 0 && big !== false ? "th" : "ts"}" x="${x + w / 2}" y="${y + h / 2 + (i - (lines.length - 1) / 2) * 17 + 5}" text-anchor="middle">${t}</text>`).join("");


/* ---------- array grid ----------
   Draw a 1D or 2D array as cells. a: array of numbers (1D) or array of rows (2D).
   o: {x, y, cell, hl: Set of "i,j" keys to highlight, hl2: second highlight set, fmt, rowLab, colLab, title, dim}. Returns SVG string and height. */
ML.grid = function (a, o) {
  o = o || {}; const cell = o.cell || 44, x0 = o.x || 60, y0 = o.y || 30, fmt = o.fmt || (v => Number.isInteger(v) ? v : (+v).toFixed(o.dec == null ? 2 : o.dec));
  const rows = Array.isArray(a[0]) ? a : [a], R = rows.length, Cc = rows[0].length, hl = o.hl || new Set(), hl2 = o.hl2 || new Set(), dim = o.dim || new Set();
  let s = o.title ? `<text class="th" x="${x0}" y="${y0 - 10}">${o.title}</text>` : "";
  for (let i = 0; i < R; i++) for (let j = 0; j < Cc; j++) {
    const k = i + "," + j, on = hl.has(k), on2 = hl2.has(k), dm = dim.has(k);
    s += `<rect x="${x0 + j * cell}" y="${y0 + i * cell}" width="${cell - 3}" height="${cell - 3}" rx="5" fill="${on ? "var(--teal-bg)" : on2 ? "var(--coral-bg)" : "var(--sunk)"}" stroke="${on ? ML.C.teal : on2 ? ML.C.coral : "var(--line)"}" stroke-width="${on || on2 ? 2 : 1}" opacity="${dm ? 0.35 : 1}"/>`;
    s += `<text class="t" x="${x0 + j * cell + (cell - 3) / 2}" y="${y0 + i * cell + cell / 2 + 3}" text-anchor="middle" style="font-family:var(--mono);font-size:${cell > 40 ? 13 : 11}px" opacity="${dm ? 0.4 : 1}">${fmt(rows[i][j])}</text>`;
  }
  if (o.rowLab !== false && R > 1) for (let i = 0; i < R; i++) s += `<text class="ts" x="${x0 - 8}" y="${y0 + i * cell + cell / 2 + 3}" text-anchor="end">${o.rowLab ? o.rowLab[i] : i}</text>`;
  if (o.colLab !== false) for (let j = 0; j < Cc; j++) s += `<text class="ts" x="${x0 + j * cell + (cell - 3) / 2}" y="${y0 + R * cell + 10}" text-anchor="middle">${o.colLab ? o.colLab[j] : j}</text>`;
  if (o.axes && R > 1) { s += `<text class="ts" x="${x0 - 30}" y="${y0 + R * cell / 2}" text-anchor="middle" transform="rotate(-90 ${x0 - 30} ${y0 + R * cell / 2})">axis 0</text><text class="ts" x="${x0 + Cc * cell / 2}" y="${y0 + R * cell + 26}" text-anchor="middle">axis 1</text>`; }
  return { s, h: y0 + R * cell + 32, w: x0 + Cc * cell };
};

/* ---------- Back / Next stepper ---------- */
ML.stepper = function (ctl, n, draw, names) {
  const id = ML.uid("st");
  ctl.insertAdjacentHTML("beforeend", `<div class="row"><button id="${id}b">Back</button><button id="${id}n" class="on">Next step</button><button id="${id}r">Restart</button><span class="v" id="${id}v" style="min-width:0"></span></div>`);
  let k = 0;
  const u = () => {
    if (!document.getElementById(id + "v")) return;
    document.getElementById(id + "v").textContent = `Step ${k + 1} of ${n}${names && names[k] ? ": " + names[k] : ""}`;
    document.getElementById(id + "b").disabled = k === 0;
    document.getElementById(id + "n").disabled = k === n - 1;
    draw(k);
  };
  document.getElementById(id + "b").onclick = () => { if (k > 0) { k--; u(); } };
  document.getElementById(id + "n").onclick = () => { if (k < n - 1) { k++; u(); } };
  document.getElementById(id + "r").onclick = () => { k = 0; u(); };
  u();
};

/* ---------- memory diagram ----------
   prog = { code: [lines], steps: [ { ln, vars: [[name, objId]], objs: [[objId, typeLabel, valueText]], out: [lines], note } ] }
   Each step shows the state AFTER line ln has run. Names on the left, objects on the right, arrows from name to object. */
ML.memory = function (fig, ctl, prog) {
  const draw = k => {
    const st = prog.steps[k];
    const objs = st.objs || [], vars = st.vars || [];
    const rowH = 46, top = 44, H = Math.max(140, top + Math.max(objs.length, vars.length, 1) * rowH + 16);
    const oy = {};
    objs.forEach((o, i) => { oy[o[0]] = top + i * rowH; });
    let s = `<text class="th" x="90" y="24" text-anchor="middle">Names</text><text class="th" x="480" y="24" text-anchor="middle">Objects in memory</text>`;
    s += `<line x1="200" y1="34" x2="200" y2="${H - 8}" stroke="var(--line)" stroke-dasharray="3 4"/>`;
    objs.forEach(([id, ty, val]) => {
      const y = oy[id], txt = String(val), w = Math.min(330, Math.max(110, 9 * txt.length + 28));
      s += `<g class="c-blue"><rect x="330" y="${y}" width="${w}" height="34" rx="6" stroke-width="0.8"/></g>`;
      s += `<text class="ts" x="336" y="${y - 3}">${ML.esc(ty)}</text>`;
      s += `<text class="t" x="${330 + w / 2}" y="${y + 22}" text-anchor="middle" style="font-family:var(--mono);font-size:13px">${ML.esc(txt)}</text>`;
    });
    vars.forEach(([name, id], i) => {
      const y = top + i * rowH;
      s += `<g class="c-gray"><rect x="30" y="${y}" width="120" height="34" rx="6" stroke-width="0.8"/></g>`;
      s += `<text class="t" x="90" y="${y + 22}" text-anchor="middle" style="font-family:var(--mono);font-size:13px">${ML.esc(name)}</text>`;
      if (oy[id] != null) {
        const y2 = oy[id] + 17, y1 = y + 17;
        s += `<path d="M150 ${y1} C 240 ${y1}, 240 ${y2}, 326 ${y2}" fill="none" stroke="${ML.C.coral}" stroke-width="1.8" marker-end="url(#ar)"/>`;
      }
    });
    if (!vars.length && !objs.length) s += `<text class="ts" x="340" y="80" text-anchor="middle">nothing stored yet</text>`;
    const out = (st.out || []).join("\n");
    fig.innerHTML = ML.code(prog.code, st.ln) + svg(H, s) +
      `<div class="sec" style="margin-top:6px">Output</div>` + ML.term(out ? out.split("\n") : ["(no output yet)"]) +
      (st.note ? `<p class="note">${st.note}</p>` : "");
  };
  ML.stepper(ctl, prog.steps.length, draw, prog.steps.map(s => s.ln >= 0 ? `after line ${s.ln + 1}` : "before running"));
};

/* ---------- the "Do it with the agent" visual ----------
   a = { prompt, actions: [lines shown in a terminal or as files], files: [[path, what]], checks: [text], code?: string } */
ML.agent = function (fig, ctl, a) {
  let v = 0, done = new Set();
  const views = ["1. The command", "2. What the agent does", "3. How you check"];
  ctl.innerHTML = `<div class="row">${views.map((t, i) => `<button data-av="${i}">${t}</button>`).join("")}</div><div id="agx"></div>`;
  const u = () => {
    pick(ctl, "av", v);
    let h = "";
    if (v === 0) {
      h = `<div style="background:var(--accent-bg);border:1px solid var(--accent);border-radius:10px;padding:12px 14px;margin:4px 0 8px"><div class="sm" style="font-weight:600;margin-bottom:4px">You type in the Claude panel in VS Code</div><div style="white-space:pre-wrap;font-size:14px;line-height:1.55">${ML.esc(a.prompt)}</div></div>` +
        `<p class="note">Goal, context, constraints and a check you can run. Copy it, then change the names to your own project.</p>`;
    } else if (v === 1) {
      h = (a.actions ? ML.term(a.actions) : "") +
        (a.files ? `<div class="sym" style="margin-top:8px">${a.files.map(([p, w]) => `<b>${ML.esc(p)}</b><span>${w}</span>`).join("")}</div>` : "") +
        (a.code ? ML.code(a.code, -1) : "");
    } else {
      h = `<div class="quiz"><div class="opts">${a.checks.map((c, i) => `<button data-ck="${i}" class="${done.has(i) ? "on" : ""}">${done.has(i) ? "✓ " : "☐ "}${c}</button>`).join("")}</div><p class="note">${done.size} of ${a.checks.length} checked. Do not accept the work until every box is ticked.</p></div>`;
    }
    $("agx").innerHTML = h;
    ctl.querySelectorAll("button[data-ck]").forEach(b => b.onclick = () => { const i = +b.dataset.ck; done.has(i) ? done.delete(i) : done.add(i); u(); });
    let s = "";
    const st = [["You", "decide and command"], ["Agent", "reads, writes, runs"], ["You", "check and commit"]];
    st.forEach(([t, d], i) => {
      const x = 30 + i * 220, on = i === v;
      s += `<g class="${on ? "c-teal" : "c-gray"}"><rect x="${x}" y="14" width="180" height="56" rx="10" stroke-width="${on ? 1.6 : 0.6}"/></g><text class="th" x="${x + 90}" y="38" text-anchor="middle">${t}</text><text class="ts" x="${x + 90}" y="58" text-anchor="middle">${d}</text>`;
      if (i < 2) s += arrow(x + 184, 42, x + 216, 42, "var(--p)", 1.5);
    });
    s += `<path d="M560 72 C 560 100, 120 100, 120 74" fill="none" stroke="var(--p)" stroke-width="1.2" stroke-dasharray="4 4" marker-end="url(#ar)"/><text class="ts" x="340" y="104" text-anchor="middle">if a check fails, the next command says what to fix</text>`;
    fig.innerHTML = svg(114, s);
  };
  ctl.querySelectorAll("button[data-av]").forEach(b => b.onclick = () => { v = +b.dataset.av; u(); });
  u();
};

/* ---------- quiz engine ----------
   Q = [ { q, o: [options], a: correctIndex, why, code?: string } ]  q and why may contain \( \) math or <code>. */
ML.quiz = function (fig, ctl, Q, label) {
  let i = 0, score = 0, answered = false, missed = [];
  const head = () => {
    const w = 640 * i / Q.length;
    return svg(64, `<text class="ts" x="20" y="24">${label || "Test"}: question ${Math.min(i + 1, Q.length)} of ${Q.length}</text><rect x="20" y="36" width="640" height="8" rx="4" fill="var(--b)"/><rect x="20" y="36" width="${w}" height="8" rx="4" fill="#1D9E75"/><text class="ts" x="660" y="24" text-anchor="end">score ${score}</text>`);
  };
  const u = () => {
    if (i >= Q.length) {
      const pct = Math.round(100 * score / Q.length);
      fig.innerHTML = svg(150, `<text class="th" x="340" y="64" text-anchor="middle" style="font-size:30px">${score} / ${Q.length}</text><text class="ts" x="340" y="96" text-anchor="middle">${pct}%. ${pct === 100 ? "Full marks. Now explain each answer out loud." : pct >= 75 ? "Good. Review the ones below, then try again." : "Reopen the cards for the ones below, then try again."}</text>`);
      ctl.innerHTML = (missed.length ? `<p class="sec">Review what you missed</p><div class="dnote">${missed.map(k => `<p><b>${Q[k].q}</b><br>Answer: ${Q[k].o[Q[k].a]}. ${Q[k].why}</p>`).join("")}</div>` : "") +
        `<div class="row"><button id="qr" class="on">Start again</button></div>`;
      $("qr").onclick = () => { i = 0; score = 0; missed = []; u(); };
      typesetMath(ctl);
      return;
    }
    const it = Q[i]; answered = false;
    fig.innerHTML = head() + `<p style="font-weight:600;margin:6px 0 4px">${it.q}</p>` + (it.code ? ML.code(it.code, -1) : "");
    ctl.innerHTML = `<div class="quiz"><div class="opts">${it.o.map((t, j) => `<button data-a="${j}">${t}</button>`).join("")}</div><div class="fb" id="qfb"></div><div class="row"><button id="qn" disabled>${i === Q.length - 1 ? "See score" : "Next question"}</button></div></div>`;
    ctl.querySelectorAll("button[data-a]").forEach(b => b.onclick = () => {
      if (answered) return; answered = true;
      const ok = +b.dataset.a === it.a; if (ok) score++; else missed.push(i);
      b.classList.add("on");
      ctl.querySelectorAll("button[data-a]").forEach(x => { if (+x.dataset.a === it.a) x.style.borderColor = "var(--ok)"; });
      $("qfb").innerHTML = `<span class="${ok ? "good" : "badc"}">${ok ? "Correct." : "Not quite."}</span> ${it.why}`;
      $("qn").disabled = false; typesetMath($("qfb"));
      fig.querySelector("svg").outerHTML = head();
    });
    $("qn").onclick = () => { i++; u(); };
    typesetMath(fig, ctl);
  };
  u();
};
})();

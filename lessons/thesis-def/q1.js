/* Committee questions Q1: the membrane, mirror symmetry and the guided modes (thesis Sec. 2.1 and 2.2).
   Helpers below use the prefix DFQ1_ (all lesson files share one global scope). */
const DFQ1_C = { ink: "#1f2933", mute: "#6b7684", blue: "#2563c9", orange: "#d0582a", green: "#14866a", purple: "#6a5fd0", amber: "#b7791f", red: "#c53030", gaas: "#cdd6e3", gaasE: "#7d8ca3", sub: "#ece2cc", win: "#dff3ea", grid: "#e6eaf0" };
const DFQ1_s = s => `<tspan baseline-shift="sub" font-size="9">${s}</tspan>`;
const DFQ1_ne = `n${DFQ1_s("eff")}`;
const DFQ1_T = (x, y, s, o) => { o = o || {}; return `<text x="${x}" y="${y}" font-size="${(o.fs || 13) + 2}" fill="${o.c || DFQ1_C.ink}" text-anchor="${o.a || "start"}"${o.b ? ' font-weight="600"' : ""}${o.i ? ' font-style="italic"' : ""}>${s}</text>`; };
const DFQ1_L = (x1, y1, x2, y2, c, w, d) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c || DFQ1_C.ink}" stroke-width="${w || 1.5}" stroke-linecap="round"${d ? ` stroke-dasharray="${d}"` : ""}/>`;
const DFQ1_A = (x1, y1, x2, y2, c, w, d) => arrow(x1, y1, x2, y2, c || DFQ1_C.ink, w || 1.8, d);
const DFQ1_P = (pts, c, w, d, f) => `<path d="${pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join("")}" fill="${f || "none"}" stroke="${c}" stroke-width="${w || 2}" stroke-linejoin="round"${d ? ` stroke-dasharray="${d}"` : ""}/>`;
const DFQ1_R = (x, y, w, h, f, s, o) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}"${s ? ` stroke="${s}"` : ""}${o != null ? ` fill-opacity="${o}"` : ""}/>`;

/* Whiteboard engine: Back / Next / Play / Show all, one caption per how[] step, optional sliders and readout.
   o = { h, sl: [[id, label, min, max, step, value, fmt]], draw(k, v, t) -> svg body, ro(v, k) -> html, live, dt } */
const DFQ1_board = function (card, fig, ctl, o) {
  const n = card.how.length, sls = o.sl || [];
  let k = 1, timer = null;
  ctl.innerHTML = `<p data-q="cap" style="font-size:14px;line-height:1.5;color:var(--fg);min-height:48px;margin:8px 2px 4px"></p>` + sls.map(a => sl(a[0], a[1], a[2], a[3], a[4], a[5])).join("") +
    `<div class="row"><button data-q="b">Back</button><button data-q="n">Next</button><button data-q="p">Play</button><button data-q="a">Show all</button><span data-q="s" style="font-size:13px;color:var(--muted)"></span></div>` +
    (o.ro ? '<div class="readout" data-q="ro"></div>' : "");
  fig.innerHTML = `<div data-q="sv"></div>`;
  const q = s => fig.querySelector(`[data-q="${s}"]`) || ctl.querySelector(`[data-q="${s}"]`);
  const sv = q("sv"), cap = q("cap");
  const vals = () => { const v = {}; sls.forEach(a => { const e = $(a[0]); v[a[0]] = +e.value; $(a[0] + "v").textContent = a[6] ? a[6](+e.value) : e.value; }); return v; };
  const render = t => {
    const v = vals();
    sv.innerHTML = svg(o.h, `<rect x="1" y="1" width="678" height="${o.h - 2}" rx="10" fill="#ffffff" stroke="#cfd6e0"/><g style="font-family:var(--body)">${o.draw(k, v, t || 0)}</g>`);
    if (o.ro) q("ro").innerHTML = o.ro(v, k);
  };
  const go = j => { k = Math.max(1, Math.min(n, j)); q("s").textContent = `step ${k} of ${n}`; q("b").disabled = k === 1; q("n").disabled = k === n; cap.innerHTML = `<b>Step ${k}.</b> ${card.how[k - 1]}`; typesetMath(cap); render(); };
  const stop = () => { if (timer) clearInterval(timer); timer = null; q("p").textContent = "Play"; };
  q("b").onclick = () => { stop(); go(k - 1); };
  q("n").onclick = () => { stop(); go(k + 1); };
  q("a").onclick = () => { stop(); go(n); };
  q("p").onclick = () => {
    if (timer) { stop(); return; }
    if (k === n) go(1);
    q("p").textContent = "Pause";
    timer = setInterval(() => { if (!sv.isConnected) { clearInterval(timer); timer = null; return; } if (k < n) go(k + 1); else stop(); }, o.dt || 2800);
  };
  sls.forEach(a => { $(a[0]).oninput = () => render(); });
  go(1);
  if (o.live) anim(t => { if (!sv.isConnected) { stopAnim(); return; } render(t); });
};

/* Three-layer slab: core index n, thickness t, top cladding nt, bottom cladding nb. Mode m, pol "TE" or "TM".
   kappa t = phi_b + phi_t + m pi with phi = atan(zeta gamma / kappa), zeta = 1 (TE) or (n / n_side)^2 (TM). */
const DFQ1_slab = (n, nt, nb, t, lam, m, pol) => {
  const k0 = 2 * Math.PI / lam, lo0 = Math.max(nt, nb);
  const zt = pol === "TM" ? n * n / (nt * nt) : 1, zb = pol === "TM" ? n * n / (nb * nb) : 1;
  const parts = N => { const ka = k0 * Math.sqrt(Math.max(n * n - N * N, 1e-12)), gt = k0 * Math.sqrt(Math.max(N * N - nt * nt, 0)), gb = k0 * Math.sqrt(Math.max(N * N - nb * nb, 0)); return { ka, gt, gb, pb: Math.atan(zb * gb / ka), pt: Math.atan(zt * gt / ka) }; };
  const f = N => { const p = parts(N); return p.ka * t - p.pb - p.pt - m * Math.PI; };
  let lo = lo0 + 1e-9, hi = n - 1e-9;
  if (!(lo < hi) || f(lo) <= 0) return null;
  for (let i = 0; i < 80; i++) { const mid = (lo + hi) / 2; if (f(mid) > 0) lo = mid; else hi = mid; }
  const N = (lo + hi) / 2;
  return Object.assign({ N, n, nt, nb, t }, parts(N));
};
/* Field of a slab mode at positions zs (z = 0 at the membrane center). main: Ey (TE) or Hy (TM). ez: Hy / eps (TM). */
const DFQ1_field = (s, zs) => {
  const h = s.t / 2;
  const main = zs.map(z => { const u = z + h; if (u < 0) return Math.cos(s.pb) * Math.exp(s.gb * u); if (u > s.t) return Math.cos(s.ka * s.t - s.pb) * Math.exp(-s.gt * (u - s.t)); return Math.cos(s.ka * u - s.pb); });
  const eps = z => z > h ? s.nt * s.nt : z < -h ? s.nb * s.nb : s.n * s.n;
  const ez = main.map((v, i) => v / eps(zs[i]));
  const nm = a => { const mx = Math.max(...a.map(Math.abs)) || 1; return a.map(x => x / mx); };
  return { main: nm(main), ez: nm(ez), eps: zs.map(eps) };
};

/* 1D finite-difference mode solver for the TE slab: E'' + k0^2 n^2 E = beta^2 E, interfaces halfway between points.
   Largest eigenvalues by Sturm bisection, eigenvectors by inverse iteration. */
const DFQ1_fd = (nm, nmodes) => {
  const t = 160, lam = 800, k0 = 2 * Math.PI / lam, h = t / nm, Lh = 1500, M = Math.round(Lh / h);
  const z = [], d = [];
  for (let j = -M; j < M; j++) { const zz = (j + 0.5) * h; z.push(zz); const n = Math.abs(zz) < t / 2 ? 3.5 : 1; d.push(-2 / (h * h) + k0 * k0 * n * n); }
  const N = z.length, e = 1 / (h * h);
  const below = x => { let c = 0, qv = d[0] - x; if (qv < 0) c++; for (let i = 1; i < N; i++) { qv = d[i] - x - e * e / (Math.abs(qv) < 1e-300 ? 1e-300 : qv); if (qv < 0) c++; } return c; };
  let lo0 = Math.min(...d) - 2 * e, hi0 = Math.max(...d) + 2 * e;
  const out = [];
  for (let m = 0; m < nmodes; m++) {
    let lo = lo0, hi = hi0;
    for (let it = 0; it < 90; it++) { const mid = (lo + hi) / 2; if (N - below(mid) > m) lo = mid; else hi = mid; }
    const lamb = (lo + hi) / 2, neff = Math.sqrt(Math.max(lamb, 0)) / k0;
    let v = Float64Array.from({ length: N }, (_, i) => 1 + 0.6 * Math.sin(0.37 * i + 0.3)); const sh = lamb + 1e-7 * Math.abs(lamb);
    for (let r = 0; r < 3; r++) {
      const c = new Float64Array(N), y = new Float64Array(N); let b = d[0] - sh;
      c[0] = e / b; y[0] = v[0] / b;
      for (let i = 1; i < N; i++) { b = d[i] - sh - e * c[i - 1]; c[i] = e / b; y[i] = (v[i] - e * y[i - 1]) / b; }
      for (let i = N - 2; i >= 0; i--) y[i] -= c[i] * y[i + 1];
      let mx = 0; for (let i = 0; i < N; i++) mx = Math.max(mx, Math.abs(y[i]));
      v = y.map(x => x / mx);
    }
    let sgn = 0; for (let i = 0; i < N; i++) if (Math.abs(v[i]) > Math.abs(sgn)) sgn = v[i];
    out.push({ neff, z, v: Array.from(v, x => x * Math.sign(sgn || 1)) });
  }
  return { h, modes: out };
};
let DFQ1_conv = null;
const DFQ1_eimCache = {};
const DFQ1_eim = (fam, p) => { const key = fam + p; if (!DFQ1_eimCache[key]) { const ws = range(100, 500, 81); DFQ1_eimCache[key] = { ws, ns: ws.map(w => C2.eim(3.5, 1, 160, w, 800, fam, p)) }; } return DFQ1_eimCache[key]; };

addLesson("thesis", "def", {
level: "Defense", id: "thesis-def-q1", title: "Membrane, symmetry and modes", short: "Q1. Membrane, symmetry and modes",
labels: { intu: "Short answer", how: "On the board, step by step", note: "Follow-up they might ask" },
big: String.raw`These are the questions a committee is likely to ask about Sections 2.1 and 2.2: why the devices sit on a suspended GaAs membrane, how such a membrane is made, what the effective index means, why the modes are called TE-like and TM-like, why the TM-like field peaks outside the GaAs (Eq. 2.1), how the mode solver finds the modes, why the routing strip is 200 nm wide, and what happens when a substrate or a mirror breaks the mirror symmetry. Each card gives a short answer you can say in thirty seconds, the board drawing step by step (press Next or Play, the picture builds in the order you would draw it), one sentence to say aloud and the follow-up question that is likely to come next.`,
bridge: String.raw`Worked numbers use round textbook values (GaAs \(n = 3.5\), air 1, membrane 160 nm, strip 200 nm, \(\lambda_0 = 800\) nm) and are computed in the page from the slab equations or the effective index method. They are not thesis results. The thesis values come from the Tidy3D mode solver and are in the thesis itself.`,
cards: [

/* ---------------- Q1.1 ---------------- */
{s: "Q1.1", t: "Why a suspended membrane and not GaAs on a substrate?",
intu: String.raw`With air above and below, the GaAs (\(n \approx 3.5\)) has the largest possible index contrast to its surroundings, so a 160 nm film confines light strongly and a 200 nm wide strip still guides both fundamental modes well. The structure is also mirror symmetric about its mid-plane, so every guided mode is either even or odd, which is what makes the TE-like and TM-like modes well defined (Sec. 2.2). On a GaAs substrate nothing would be guided, because a guided mode needs an effective index above that of every cladding and the substrate has the same index as the core. Even AlGaAs below (about 3.0) would leave only a narrow window and a field that reaches far into the substrate. The price of the membrane is that a grating radiates about as much down as up, which is why a mirror can be placed below it (Sec. 2.3 and 2.4).`,
eq: String.raw`\[ \max(n_{\mathrm{top}},\, n_{\mathrm{bottom}}) \lt n_{\mathrm{eff}} \lt n_{\mathrm{GaAs}} \]\[ \text{membrane: } 1 \lt n_{\mathrm{eff}} \lt 3.5, \qquad \text{GaAs on GaAs: } 3.5 \lt n_{\mathrm{eff}} \lt 3.5 \ \ (\text{no mode}) \]<div class="eqnote">The guiding window. A mode below the top of the window has an oscillating, not a decaying, field in that cladding and leaks into it.</div><div class="eqref">Sec. 2.1 and 2.2</div>`,
sym: [[String.raw`\(n_{\mathrm{eff}}\)`, String.raw`effective index of the mode, \(\beta/k_0\)`], [String.raw`\(n_{\mathrm{top}}, n_{\mathrm{bottom}}\)`, "indices of the claddings above and below the GaAs"], [String.raw`\(n_{\mathrm{s}}\)`, "index of a substrate placed below the membrane (slider)"]],
how: [String.raw`Draw the membrane as a horizontal bar, 160 nm thick, with air above and below. Mark the mid-plane \(z = 0\) as a dashed line.`,
String.raw`Beside it draw the index profile \(n(z)\): 1 in the air, a step up to 3.5 inside the GaAs, and back to 1.`,
String.raw`Sketch the fundamental TE-like field across the bar: a cosine inside that decays exponentially into the air, the same above and below.`,
String.raw`Shade the window where a guided mode can live: above the highest cladding index and below the core index, here 1 to 3.5. Mark \(n_{\mathrm{eff}}\) inside it.`,
String.raw`Now replace the air below by a substrate of index \(n_{\mathrm{s}}\) (slider). The window shrinks from below and the field leans into the substrate.`,
String.raw`At \(n_{\mathrm{s}} = 3.5\), GaAs on GaAs, the window is closed and nothing is guided. Air on both sides gives the widest window, the tightest field and the mirror symmetry.`],
say: String.raw`Air on both sides gives the largest index contrast, so the light is tightly confined and the structure is mirror symmetric, which separates the modes into TE-like and TM-like. On a GaAs substrate the light would simply leak into the substrate.`,
num: String.raw`GaAs \(n \approx 3.5\) (\(\varepsilon \approx 12.25\)), AlGaAs about 3.0, air 1 (round values).<br>Analytic slab, \(t = 160\) nm, \(\lambda_0 = 800\) nm, air on both sides: TE0 \(n_{\mathrm{eff}} \approx 3.08\), decay length into air about <b>44 nm</b>.`,
note: String.raw`<p><b>"Why not GaAs on oxide, like silicon on insulator?"</b></p><p>Epitaxial GaAs is grown on lattice-matched AlGaAs, not on oxide. Removing a sacrificial AlGaAs layer gives air below without bonding to another wafer, and air gives a higher contrast than oxide would (1 against about 1.45). The membrane process is the one of Midolo et al. 2015.</p>`,
r(fig, ctl) {
  const C = DFQ1_C, n = 3.5, t = 160, lam = 800;
  DFQ1_board(this, fig, ctl, {
    h: 370, sl: [["q11s", "Index below the membrane n<sub>s</sub>", 1, 3.5, 0.01, 1, x => x.toFixed(2)]],
    draw(k, v) {
      const ns = v.q11s, Z = z => 200 - z * 0.22, NX = x => 392 + (x - 0.8) / 3.0 * 262;
      const te = DFQ1_slab(n, 1, ns, t, lam, 0, "TE");
      let s = DFQ1_T(24, 28, "cross-section", { c: C.mute, fs: 12 });
      if (ns > 1.005) s += DFQ1_R(24, Z(-80), 320, 336 - Z(-80), C.sub) + DFQ1_T(60, 322, `substrate, n${DFQ1_s("s")} = ${ns.toFixed(2)}`, { c: C.amber });
      else s += DFQ1_T(60, 322, "air, n = 1", { c: C.mute });
      s += DFQ1_T(60, 82, "air, n = 1", { c: C.mute });
      s += DFQ1_R(24, Z(80), 320, Z(-80) - Z(80), C.gaas, C.gaasE) + DFQ1_T(338, Z(80) - 6, "GaAs 160 nm", { a: "end", fs: 12 });
      s += DFQ1_L(24, Z(0), 344, Z(0), C.mute, 1, "6 4") + DFQ1_T(30, Z(0) - 4, "z = 0", { fs: 11, c: C.mute });
      if (k >= 2) {
        s += DFQ1_L(392, 340, 392, 60, C.ink, 1.2) + DFQ1_L(392, 340, 660, 340, C.ink, 1.2) + DFQ1_T(384, 66, "z", { a: "end", i: 1 }) + DFQ1_T(660, 358, "n", { a: "end", i: 1 });
        [1, 2, 3, 3.5].forEach(x => { s += DFQ1_L(NX(x), 336, NX(x), 344, C.ink, 1) + DFQ1_T(NX(x), 356, String(x), { a: "middle", fs: 11 }); });
        s += DFQ1_P([[NX(1), 60], [NX(1), Z(80)], [NX(n), Z(80)], [NX(n), Z(-80)], [NX(ns), Z(-80)], [NX(ns), 336]], C.ink, 2.2);
        s += DFQ1_T(NX(n) + 6, Z(0) + 4, "n(z)", { fs: 12 });
      }
      if (k >= 4) {
        const lo = Math.max(1, ns);
        if (lo < n) s += DFQ1_R(NX(lo), 62, NX(n) - NX(lo), 272, C.win, null, 0.8);
        s += DFQ1_T((NX(lo) + NX(n)) / 2, 80, lo < n - 0.02 ? "window for a guided mode" : "window closed", { a: "middle", fs: 12, c: C.green, b: 1 });
        if (te) s += DFQ1_L(NX(te.N), 90, NX(te.N), 330, C.blue, 2, "6 4") + DFQ1_T(NX(te.N) - 4, 108, `${DFQ1_ne} = ${te.N.toFixed(2)}`, { a: "end", c: C.blue, fs: 12 });
      }
      if (k >= 3) {
        if (te) { const zs = range(-560, 560, 281), f = DFQ1_field(te, zs).main; s += DFQ1_P(zs.map((z, i) => [44 + 180 * f[i], Z(z)]), C.blue, 2.4) + DFQ1_L(44, 60, 44, 336, C.mute, 1) + DFQ1_T(110, Z(260), `TE-like E${DFQ1_s("y")}(z)`, { c: C.blue, fs: 12 }); }
        else s += DFQ1_T(180, 120, "no guided TE-like mode", { a: "middle", c: C.red, b: 1 });
      }
      if (k >= 6) s += DFQ1_T(664, 30, ns < 1.005 ? "air both sides: widest window" : ns > 3.45 ? "GaAs on GaAs: nothing guided" : "substrate: narrower window", { a: "end", b: 1, fs: 12, c: ns > 3.45 ? C.red : C.green });
      return s;
    },
    ro(v) {
      const ns = v.q11s, te = DFQ1_slab(n, 1, ns, t, lam, 0, "TE"), tm = DFQ1_slab(n, 1, ns, t, lam, 0, "TM");
      return `<div><span>TE-like n<sub>eff</sub></span><b>${te ? te.N.toFixed(3) : "not guided"}</b></div><div><span>TM-like n<sub>eff</sub></span><b>${tm ? tm.N.toFixed(3) : "not guided"}</b></div><div><span>TE decay length below</span><b>${te ? (1 / te.gb).toFixed(0) + " nm" : "none"}</b></div>`;
    }
  });
}},

/* ---------------- Q1.2 ---------------- */
{s: "Q1.2", t: "How is the membrane made?",
intu: String.raw`The GaAs layer is grown on top of a sacrificial AlGaAs layer. The pattern is written into a resist by electron-beam lithography and transferred through the GaAs by dry etching. Hydrofluoric acid then reaches the AlGaAs through the etched openings and dissolves it under the pattern, which leaves the GaAs suspended with air above and below (Midolo et al. 2015). The membrane stays held where the AlGaAs is not removed.`,
eq: String.raw`\[ \text{GaAs (160 nm)} \;/\; \text{AlGaAs (sacrificial)} \;/\; \text{substrate} \;\xrightarrow{\ \text{EBL, dry etch, HF}\ }\; \text{air} \;/\; \text{GaAs} \;/\; \text{air} \]<div class="eqref">Sec. 2.1, after Midolo et al. 2015</div>`,
sym: [["EBL", "electron-beam lithography, writes the pattern into a resist"], ["dry etch", "plasma etch that transfers the pattern through the GaAs"], ["HF", "hydrofluoric acid, removes the sacrificial AlGaAs"]],
how: [String.raw`Draw the wafer as grown, from the bottom up: the substrate, a sacrificial AlGaAs layer, and the 160 nm GaAs layer on top.`,
String.raw`Add a resist layer and draw the electron beam writing the pattern into it.`,
String.raw`Dry etch: the openings go through the GaAs down to the AlGaAs. Remove the resist.`,
String.raw`Put the chip in HF: the acid enters through the openings and eats the AlGaAs sideways under the pattern (Play to watch the etch front move).`,
String.raw`The GaAs is now suspended, with air above and below, held at the ends where AlGaAs is left.`],
say: String.raw`The GaAs is grown on a sacrificial AlGaAs layer, patterned by electron-beam lithography and dry etching, and released by removing the AlGaAs with HF, so it ends up with air above and below.`,
num: String.raw`Membrane thickness 160 nm. The air gap left under the membrane is set by how thick the removed layer was.`,
note: String.raw`<p><b>"Why does HF remove the AlGaAs and not the GaAs?"</b></p><p>HF etches AlGaAs with a high aluminium content much faster than GaAs, so the etch is selective and stops at the GaAs. It works sideways from the etched openings, which is why the release needs openings next to every part that must be freed.</p>`,
r(fig, ctl) {
  const C = DFQ1_C;
  DFQ1_board(this, fig, ctl, {
    h: 330, live: true,
    draw(k, v, t) {
      const X0 = 60, X1 = 620, yS = 250, yA = 200, yG = 180, yR = 164, op = [[210, 238], [442, 470]];
      let s = DFQ1_T(24, 28, "cross-section of the wafer (not to scale)", { c: C.mute, fs: 12 });
      s += DFQ1_R(X0, yS, X1 - X0, 60, "#d9dee6", C.gaasE) + DFQ1_T(X1 - 8, yS + 34, "substrate", { a: "end", fs: 12 });
      // sacrificial layer, with the etched part removed
      let rem = 0; if (k === 4) rem = Math.min(1, (t % 5) / 4); if (k >= 5) rem = 1;
      s += DFQ1_R(X0, yA, X1 - X0, yS - yA, "#efd9a8", "#b89752") + (k < 4 ? DFQ1_T(X0 + 8, yA + 32, "AlGaAs (sacrificial)", { fs: 12, c: C.amber }) : DFQ1_T(X0 + 4, yA + 22, "AlGaAs", { fs: 10, c: C.amber }) + DFQ1_T(X1 - 4, yA + 22, "AlGaAs", { fs: 10, c: C.amber, a: "end" }));
      if (k >= 4) { const a = op[0][0] - rem * 92, b = op[1][1] + rem * 92; s += `<rect x="${a}" y="${yA}" width="${b - a}" height="${(yS - yA) * (0.35 + 0.65 * Math.min(1, rem * 3))}" rx="10" fill="#ffffff"/>`; if (k === 4) s += DFQ1_T(340, yA + 34, "HF", { a: "middle", b: 1, c: C.purple }); }
      // GaAs layer
      if (k <= 2) s += DFQ1_R(X0, yG, X1 - X0, yA - yG, C.gaas, C.gaasE);
      else s += DFQ1_R(X0, yG, op[0][0] - X0, yA - yG, C.gaas, C.gaasE) + DFQ1_R(op[0][1], yG, op[1][0] - op[0][1], yA - yG, C.gaas, C.gaasE) + DFQ1_R(op[1][1], yG, X1 - op[1][1], yA - yG, C.gaas, C.gaasE);
      s += DFQ1_T(X0 + 8, yG + 14, "GaAs 160 nm", { fs: 12 });
      if (k === 2) { s += DFQ1_R(X0, yR, X1 - X0, yG - yR, "#f4c9c9", "#c98a8a") + DFQ1_T(X0 + 8, yR - 6, "resist", { fs: 12, c: C.red });
        op.forEach(([a, b]) => { s += DFQ1_R(a, yR, b - a, yG - yR, "#ffffff", "#c98a8a"); for (let j = 0; j < 3; j++) s += DFQ1_A(a + 4 + j * 10, 70, a + 4 + j * 10, yR - 4, C.purple, 1.6); });
        s += DFQ1_T(340, 62, "electron beam writes the pattern", { a: "middle", c: C.purple, fs: 12 }); }
      if (k === 3) { op.forEach(([a, b]) => { s += DFQ1_A((a + b) / 2, 110, (a + b) / 2, yG - 6, C.blue, 2); }); s += DFQ1_T(340, 100, "dry etch through the GaAs", { a: "middle", c: C.blue, fs: 12 }); }
      if (k >= 5) { s += DFQ1_T(340, 120, "air above", { a: "middle", c: C.mute }) + DFQ1_T(340, yA + 34, "air gap below", { a: "middle", c: C.mute }) + DFQ1_T(340, 60, "suspended membrane", { a: "middle", b: 1, c: C.green });
        s += DFQ1_T(X0 + 4, yA + 40, "held", { fs: 10, c: C.amber }) + DFQ1_T(X1 - 4, yA + 40, "held", { fs: 10, c: C.amber, a: "end" }); }
      return s;
    }
  });
}},

/* ---------------- Q1.3 ---------------- */
{s: "Q1.3", t: String.raw`What does \(n_{\mathrm{eff}}\) mean physically, and why must it lie between the cladding and the core index?`,
intu: String.raw`The effective index is \(n_{\mathrm{eff}} = \beta/k_0\): the phase of the mode advances along the guide as if the light traveled in a uniform medium of that index, so its phase velocity is \(c/n_{\mathrm{eff}}\). In a ray picture the light zigzags at an angle \(\theta\) from the normal of the surfaces and \(\beta\) is the part of its wavevector \(k_0 n\) along the guide, so \(n_{\mathrm{eff}} = n\sin\theta\), which can never exceed the core index. The light stays in the core only by total internal reflection, which needs \(\sin\theta \gt n_{\mathrm{c}}/n\), that is \(n_{\mathrm{eff}} \gt n_{\mathrm{c}}\). Then the field outside decays as \(e^{-\gamma |z|}\) with real \(\gamma\). Below \(n_{\mathrm{c}}\) the field outside oscillates and the light radiates away, so it is not a guided mode.`,
eq: String.raw`\[ n_{\mathrm{eff}} = \frac{\beta}{k_0} = n \sin\theta, \qquad k_0 = \frac{2\pi}{\lambda_0} \]\[ \gamma = k_0\sqrt{n_{\mathrm{eff}}^2 - n_{\mathrm{c}}^2} \ \ \text{real} \iff n_{\mathrm{c}} \lt n_{\mathrm{eff}} \lt n \]<div class="eqref">Sec. 2.2 (\(n_{\mathrm{eff}} = \beta/k_0\)). Ray picture added for the board.</div>`,
sym: [[String.raw`\(\beta\)`, "propagation constant along the guide"], [String.raw`\(\theta\)`, "ray angle from the normal of the core surfaces"], [String.raw`\(\kappa = k_0 n\cos\theta\)`, "transverse wavenumber inside the core"], [String.raw`\(\gamma\)`, "decay constant of the field in the cladding"], [String.raw`\(n_{\mathrm{c}}\)`, "cladding index (air: 1)"]],
how: [String.raw`Draw the core as a horizontal band of index \(n\) between two claddings of index \(n_{\mathrm{c}}\).`,
String.raw`Draw a ray bouncing through the core in a zigzag at the angle \(\theta\) from the normal of the surfaces.`,
String.raw`On one segment draw the wavevector \(k_0 n\) and split it: \(\beta = k_0 n\sin\theta\) along the guide and \(\kappa = k_0 n\cos\theta\) across it.`,
String.raw`Write \(n_{\mathrm{eff}} = \beta/k_0 = n\sin\theta\) and draw an index line with \(n_{\mathrm{c}}\) and \(n\). Since \(\sin\theta \le 1\), \(n_{\mathrm{eff}}\) cannot exceed \(n\).`,
String.raw`Total internal reflection needs \(\sin\theta \gt n_{\mathrm{c}}/n\), so \(n_{\mathrm{eff}} \gt n_{\mathrm{c}}\). Drag \(n_{\mathrm{eff}}\) below 1: the ray escapes.`,
String.raw`Draw the field across the guide: the tail in the cladding decays with \(\gamma = k_0\sqrt{n_{\mathrm{eff}}^2 - n_{\mathrm{c}}^2}\). Close to \(n_{\mathrm{c}}\) the tail becomes long and the mode is only weakly guided.`],
say: String.raw`The effective index is \(\beta/k_0\), the index the mode appears to travel in along the guide. It lies above the cladding index because the field must decay outside, and below the core index because it is only the along-guide part of \(k_0 n\).`,
num: String.raw`\(\lambda_0 = 800\) nm, \(n_{\mathrm{c}} = 1\): decay length \(1/\gamma\) is about <b>44 nm</b> at \(n_{\mathrm{eff}} = 3.08\), <b>114 nm</b> at 1.5 and <b>400 nm</b> at 1.05.`,
note: String.raw`<p><b>"Is \(n_{\mathrm{eff}}\) the same as the group index?"</b></p><p>No. \(n_{\mathrm{eff}}\) sets the phase velocity \(c/n_{\mathrm{eff}}\). The group index \(n_g = n_{\mathrm{eff}} - \lambda_0\, dn_{\mathrm{eff}}/d\lambda_0\) sets the speed of a pulse and includes the dispersion of the waveguide. The grating period depends on \(n_{\mathrm{eff}}\), the bandwidth of interference devices on how the indices change with wavelength.</p>`,
r(fig, ctl) {
  const C = DFQ1_C, n = 3.5;
  DFQ1_board(this, fig, ctl, {
    h: 400, sl: [["q13n", "Effective index n<sub>eff</sub>", 0.7, 3.45, 0.01, 2.8, x => x.toFixed(2)]],
    draw(k, v) {
      const ne = v.q13n, y1 = 140, y2 = 200, x0 = 30, x1 = 420;
      let s = DFQ1_R(x0, 50, x1 - x0, y1 - 50, "#f7f9fc") + DFQ1_R(x0, y2, x1 - x0, 290 - y2, "#f7f9fc") + DFQ1_R(x0, y1, x1 - x0, y2 - y1, C.gaas, C.gaasE);
      s += DFQ1_T(x0 + 8, 70, "cladding n" + DFQ1_s("c") + " = 1", { c: C.mute, fs: 12 }) + DFQ1_T(x1 - 8, 282, "cladding n" + DFQ1_s("c") + " = 1", { c: C.mute, fs: 12, a: "end" }) + DFQ1_T(x1 - 8, y1 + 18, "core n = 3.5", { a: "end", fs: 12 });
      const sn = Math.min(ne / n, 0.999), th = Math.asin(sn), dx = (y2 - y1) * Math.tan(th);
      if (k >= 2) {
        const guided = ne > 1; let x = x0 + 10, y = y2, up = true, pts = [[x, y]];
        if (guided) { while (x < x1 - 4) { const nx = Math.min(x + dx, x1 - 4), ny = up ? y2 - (nx - x) / dx * (y2 - y1) : y1 + (nx - x) / dx * (y2 - y1); pts.push([nx, ny]); x = nx; y = ny; up = !up; } s += DFQ1_P(pts, C.orange, 2.2); }
        else { pts.push([x0 + 10 + dx, y1]); s += DFQ1_P(pts, C.orange, 2.2); const so = Math.min(ne / 1, 0.999), tho = Math.asin(so); s += DFQ1_A(x0 + 10 + dx, y1, x0 + 10 + dx + 80 * Math.sin(tho), y1 - 80 * Math.cos(tho), C.red, 2.2) + DFQ1_T(x0 + 24 + dx + 80 * Math.sin(tho), y1 - 70 * Math.cos(tho), "escapes", { c: C.red, b: 1 }); }
        // angle mark
        s += DFQ1_L(x0 + 10, y2, x0 + 10, y2 - 46, C.mute, 1, "3 3") + DFQ1_T(x0 + 16, y2 - 30, "θ", { c: C.orange, fs: 13 });
      }
      if (k >= 3) {
        const ax = 130, ay = 250, L = 90;
        s += DFQ1_A(ax, ay, ax + L * Math.sin(th), ay - L * Math.cos(th), C.ink, 2.4) + DFQ1_T(ax + L * Math.sin(th) / 2 - 8, ay - L * Math.cos(th) / 2, "k" + DFQ1_s("0") + "n", { a: "end", fs: 12 });
        s += DFQ1_A(ax, ay + 8, ax + L * Math.sin(th), ay + 8, C.blue, 2.4) + DFQ1_T(ax + L * Math.sin(th) / 2, ay + 24, "β = k" + DFQ1_s("0") + "n sin θ", { a: "middle", c: C.blue, fs: 12 });
        s += DFQ1_A(ax + L * Math.sin(th) + 6, ay, ax + L * Math.sin(th) + 6, ay - L * Math.cos(th), C.green, 2) + DFQ1_T(ax + L * Math.sin(th) + 12, ay - L * Math.cos(th) / 2, "κ", { c: C.green });
      }
      if (k >= 4) {
        const NX = x => 470 + (x - 0.5) / 3.3 * 190, y = 362;
        s += DFQ1_L(NX(0.5), y, NX(3.8), y, C.ink, 1.2);
        if (k >= 5) s += DFQ1_R(NX(1), y - 12, NX(3.5) - NX(1), 24, C.win, null, 0.9) + DFQ1_T(NX(1) + 4, y + 5, "guided", { c: C.green, fs: 11, b: 1 });
        [[1, "n" + DFQ1_s("c")], [3.5, "n"]].forEach(([x, l]) => { s += DFQ1_L(NX(x), y - 8, NX(x), y + 8, C.ink, 1.5) + DFQ1_T(NX(x), y + 26, l, { a: "middle", fs: 12 }); });
        s += `<circle cx="${NX(ne)}" cy="${y}" r="6" fill="${ne > 1 ? C.blue : C.red}"/>` + DFQ1_T(NX(ne), y - 16, DFQ1_ne, { a: "middle", fs: 12, c: ne > 1 ? C.blue : C.red });
        s += DFQ1_T(470, 318, `${DFQ1_ne} = n sin θ = ${ne.toFixed(2)}`, { fs: 13, c: C.blue });
      }
      if (k >= 6) {
        const k0 = 2 * Math.PI / 800, g = ne > 1 ? k0 * Math.sqrt(ne * ne - 1) : 0, ka = k0 * Math.sqrt(Math.max(n * n - ne * ne, 0)), Zp = z => 170 - z * 0.375, X = a => 480 + 150 * a;
        const zs = range(-340, 340, 171), edge = Math.cos(ka * 80) || 0.2;
        const f = zs.map(z => Math.abs(z) <= 80 ? Math.cos(ka * z) : (ne > 1 ? edge * Math.exp(-g * (Math.abs(z) - 80)) : edge * Math.cos(k0 * Math.sqrt(1 - ne * ne) * (Math.abs(z) - 80))));
        s += DFQ1_R(470, Zp(80), 190, Zp(-80) - Zp(80), C.gaas, null, 0.6) + DFQ1_L(480, 46, 480, 296, C.mute, 1) + DFQ1_P(zs.map((z, i) => [X(f[i]), Zp(z)]).filter(p => p[1] > 44 && p[1] < 296), C.blue, 2.2);
        s += DFQ1_T(560, 44, ne > 1 ? `tail 1/γ = ${(1 / g).toFixed(0)} nm` : "outside: oscillates, radiates", { a: "middle", fs: 12, c: ne > 1 ? C.blue : C.red });
      }
      return s;
    },
    ro(v) {
      const ne = v.q13n, k0 = 2 * Math.PI / 800;
      return `<div><span>angle θ from the normal</span><b>${(Math.asin(Math.min(ne / 3.5, 1)) * 180 / Math.PI).toFixed(1)}°</b></div><div><span>tail 1/γ in air</span><b>${ne > 1 ? (1 / (k0 * Math.sqrt(ne * ne - 1))).toFixed(0) + " nm" : "leaks"}</b></div><div><span>phase velocity</span><b>c / ${ne.toFixed(2)}</b></div>`;
    }
  });
}},

/* ---------------- Q1.4 ---------------- */
{s: "Q1.4", t: "Why do you call the modes TE-like and TM-like and not TE and TM?",
intu: String.raw`The membrane has air on both sides, so it is symmetric under the reflection \(z \to -z\), and every guided mode is either even or odd under it (Johnson et al. 1999). On the mid-plane \(z = 0\) an even mode has no \(E_z\), so it is purely TE there, and an odd mode has no in-plane \(\mathbf{E}\), so it is purely TM there. Away from the mid-plane a strip of finite width mixes the field components, so all six are nonzero, most visibly near the corners. Pure TE and TM modes exist only in an infinite slab. The fundamental even and odd modes are therefore called TE-like and TM-like.`,
eq: String.raw`\[ \text{even: } \ E_{x,y}(-z) = E_{x,y}(z), \quad E_z(-z) = -E_z(z) \ \Rightarrow\ E_z(z = 0) = 0 \]\[ \text{odd: } \ E_{x,y}(-z) = -E_{x,y}(z), \quad E_z(-z) = E_z(z) \ \Rightarrow\ E_{x,y}(z = 0) = 0 \]<div class="eqref">Sec. 2.2, after Johnson et al. 1999</div>`,
sym: [[String.raw`\(z \to -z\)`, "reflection through the mid-plane of the membrane"], [String.raw`\(E_x, E_y\)`, "components in the mirror plane"], [String.raw`\(E_z\)`, "component normal to the mirror plane"]],
how: [String.raw`Draw the strip cross-section, 200 nm wide and 160 nm thick, with air all around. Label \(y\) across and \(z\) up.`,
String.raw`Draw the mid-plane \(z = 0\) as a dashed line: the structure is the same after \(z \to -z\).`,
String.raw`Even mode: draw \(E_y\) arrows that are the same above and below the line, and small \(E_z\) arrows near the corners that flip sign across it.`,
String.raw`On the line \(z = 0\) the odd part \(E_z\) must vanish, so there the field lies in the plane: purely TE.`,
String.raw`Circle the corners: off the mid-plane \(E_z\) is not zero, because the side walls mix the components. So the mode is TE-like, not TE.`,
String.raw`Odd mode, beside it: now \(E_z\) is even and \(E_y\) odd, so on \(z = 0\) only \(E_z\) survives: TM-like. Note the long \(E_z\) arrows just outside the top and bottom.`],
say: String.raw`Because the membrane is mirror symmetric in \(z\), each mode is even or odd. Even modes are purely TE on the mid-plane and odd modes purely TM, but in a strip of finite width they are hybrid elsewhere, so we call them TE-like and TM-like.`,
num: String.raw`Pure TE or TM needs translation symmetry in \(y\) as well (an infinite slab). A 200 nm strip breaks it, so the TE fraction of the TE-like mode is close to 1 but not 1.`,
note: String.raw`<p><b>"How does Tidy3D use this symmetry?"</b></p><p>A mirror plane can halve the simulation domain. In Tidy3D a plane set to \(+1\) keeps even fields and acts as a perfect magnetic conductor, \(-1\) keeps odd fields and acts as a perfect electric conductor (Sec. 3.6). The plane \(z = 0\) is used only where there is air above and below.</p>`,
r(fig, ctl) {
  const C = DFQ1_C;
  DFQ1_board(this, fig, ctl, {
    h: 370,
    draw(k) {
      const panel = (cx, cy, odd) => {
        const w = 150, h = 110, L = cx - w / 2, R = cx + w / 2, T = cy - h / 2, B = cy + h / 2;
        let s = DFQ1_R(L, T, w, h, C.gaas, C.gaasE) + DFQ1_T(cx, B + 50, odd ? "odd: TM-like" : "even: TE-like", { a: "middle", b: 1, c: odd ? C.orange : C.blue });
        if (k >= 2) s += DFQ1_L(L - 40, cy, R + 40, cy, C.mute, 1.2, "6 4");
        if (k >= 3) {
          const main = odd ? C.orange : C.blue, side = odd ? C.blue : C.orange;
          [-1, 0, 1].forEach(i => [-1, 0, 1].forEach(j => {
            const x = cx + i * 42, y = cy - j * 34, a = Math.cos(i * 0.6) * Math.cos(j * 0.55);
            if (!odd) s += DFQ1_A(x - 14 * a, y, x + 14 * a, y, main, 2);
            else s += DFQ1_A(x, y + 13 * a, x, y - 13 * a, main, 2);
          }));
          if (!odd) [L - 22, R + 8].forEach(x => { s += DFQ1_A(x, cy, x + 18, cy, main, 2.6); });
          else [T - 26, B + 4].forEach(y => { s += DFQ1_A(cx, y + 22, cx, y, main, 2.6); });
          // corner components: odd in z and odd in y
          [[1, 1], [-1, 1], [1, -1], [-1, -1]].forEach(([sy, sz]) => {
            const x = cx + sy * (w / 2 - 12), y = cy - sz * (h / 2 - 12), sg = sy * sz;
            if (!odd) s += DFQ1_A(x, y + 9 * sg, x, y - 9 * sg, side, 1.6);
            else s += DFQ1_A(x - 9 * sg, y, x + 9 * sg, y, side, 1.6);
          });
        }
        if (k >= 4 && !odd) s += DFQ1_L(L, cy, R, cy, C.green, 4) + DFQ1_T(R + 4, cy + 22, "E" + DFQ1_s("z") + " = 0", { c: C.green, fs: 12, b: 1 });
        if (k >= 4 && odd) s += DFQ1_L(L, cy, R, cy, C.green, 4) + DFQ1_T(R + 4, cy + 22, "E" + DFQ1_s("y") + " = 0", { c: C.green, fs: 12, b: 1 });
        if (k >= 5) [[1, 1], [-1, 1], [1, -1], [-1, -1]].forEach(([sy, sz]) => { s += `<circle cx="${cx + sy * (w / 2 - 12)}" cy="${cy - sz * (h / 2 - 12)}" r="15" fill="none" stroke="${C.purple}" stroke-width="1.6"/>`; });
        return s;
      };
      let s = panel(180, 170, false);
      s += DFQ1_T(180, 52, "200 nm", { a: "middle", fs: 12, c: C.mute }) + DFQ1_L(105, 60, 255, 60, C.mute, 1) + DFQ1_T(26, 128, "160 nm", { fs: 12, c: C.mute });
      s += DFQ1_A(30, 300, 60, 300, C.ink, 1.2) + DFQ1_A(30, 300, 30, 270, C.ink, 1.2) + DFQ1_T(66, 304, "y", { i: 1 }) + DFQ1_T(26, 270, "z", { i: 1, a: "end" });
      if (k >= 2) s += DFQ1_T(180, 30, "mirror plane z = 0:  z → −z", { a: "middle", c: C.mute, fs: 12 });
      if (k >= 5) s += DFQ1_T(180, 352, "corners: E" + DFQ1_s("z") + " ≠ 0, so only TE-like", { a: "middle", c: C.purple, fs: 12 });
      if (k >= 6) s += panel(500, 170, true) + DFQ1_T(500, 352, "on z = 0 only E" + DFQ1_s("z") + ": TM-like", { a: "middle", c: C.orange, fs: 12 });
      return s;
    }
  });
}},

/* ---------------- Q1.5 ---------------- */
{s: "Q1.5", t: String.raw`Why does the TM-like field peak outside the GaAs, and why is its \(n_{\mathrm{eff}}\) lower (Eq. 2.1)?`,
intu: String.raw`At the top and bottom surfaces the normal component of \(\mathbf{D} = \varepsilon\mathbf{E}\) is continuous, so \(E_z\) jumps up by \(\varepsilon_{\mathrm{GaAs}}/\varepsilon_{\mathrm{air}}\), about 12, as it leaves the GaAs (Eq. 2.1). The main field of the TM-like mode is \(E_z\), so its field is strongest just outside the two surfaces. The TE-like main field \(E_y\) is tangential to these surfaces and simply continuous. With so much of its field in the air, the TM-like mode sees on average more air than the TE-like mode, and the thesis states that the same boundary condition gives TM-like modes the lower effective index.`,
eq: String.raw`\[ E_z^{\mathrm{air}} = \frac{\varepsilon_{\mathrm{GaAs}}}{\varepsilon_{\mathrm{air}}}\, E_z^{\mathrm{GaAs}} \]\[ \varepsilon_{\mathrm{GaAs}} = n^2 \approx 3.5^2 \approx 12, \qquad n_{\mathrm{c}} \lt n_{\mathrm{eff}}^{\mathrm{TM}} \lt n_{\mathrm{eff}}^{\mathrm{TE}} \lt n \]<div class="eqref">Eq. (2.1), Sec. 2.2</div>`,
sym: [[String.raw`\(E_z\)`, "field component normal to the top and bottom surfaces"], [String.raw`\(\varepsilon\)`, String.raw`relative permittivity, \(n^2\)`], [String.raw`\(|E|^2\)`, "intensity of the main field component, shaded where it lies in air"]],
how: [String.raw`Draw the membrane as a vertical band with air on both sides and a \(z\) axis across it.`,
String.raw`At the surface write the boundary condition: normal \(D\) is continuous, \(\varepsilon_{\mathrm{GaAs}}E_z^{\mathrm{GaAs}} = \varepsilon_{\mathrm{air}}E_z^{\mathrm{air}}\).`,
String.raw`Plot the TE-like main field \(E_y\): it is tangential, so it is continuous, a cosine inside and exponential tails.`,
String.raw`Plot the TM-like main field \(E_z\): small inside, a jump by about 12 at each surface, then a decay. Its peak sits just outside the GaAs.`,
String.raw`Shade the part of the field intensity \(|E|^2\) that lies in the air: a much larger share for the TM-like mode.`,
String.raw`Put the two effective indices on an index line: \(1 \lt n_{\mathrm{eff}}^{\mathrm{TM}} \lt n_{\mathrm{eff}}^{\mathrm{TE}} \lt 3.5\). The mode that sees more air has the lower index. Drag the core index to see the jump follow \(n^2\).`],
say: String.raw`Normal \(D\) is continuous, so \(E_z\) jumps up by \(\varepsilon_{\mathrm{GaAs}}/\varepsilon_{\mathrm{air}}\) at the surfaces. The TM-like mode is mostly \(E_z\), so its field peaks just outside, it sees more air and its effective index is lower.`,
num: String.raw`Jump factor \(n^2\): <b>12.25</b> for \(n = 3.5\).<br>Analytic slab, \(t = 160\) nm, \(\lambda_0 = 800\) nm: TE0 about <b>3.08</b>, TM0 about <b>2.58</b>.`,
note: String.raw`<p><b>"Is \(E_y\) of the TE-like mode continuous everywhere?"</b></p><p>Across the top and bottom surfaces yes, because there it is tangential. At the side walls of a strip \(E_y\) is normal to the wall and jumps by the same factor, which is why the side walls matter for the TE-like mode and why \(\sigma\) is swapped in the effective width of Sec. 2.5.</p>`,
r(fig, ctl) {
  const C = DFQ1_C, t = 160, lam = 800;
  DFQ1_board(this, fig, ctl, {
    h: 390, sl: [["q15n", "Core index n", 1.5, 3.5, 0.01, 3.5, x => x.toFixed(2) + "  (ε = " + (x * x).toFixed(2) + ")"]],
    draw(k, v) {
      const n = v.q15n, X = z => 340 + z * 0.62, zs = range(-440, 440, 441);
      const te = DFQ1_slab(n, 1, 1, t, lam, 0, "TE"), tm = DFQ1_slab(n, 1, 1, t, lam, 0, "TM");
      let s = DFQ1_R(X(-80), 40, X(80) - X(-80), 280, C.gaas, null, 0.7) + DFQ1_T(X(0), 36, "GaAs", { a: "middle", fs: 12 }) + DFQ1_T(X(-300), 36, "air", { a: "middle", fs: 12, c: C.mute }) + DFQ1_T(X(300), 36, "air", { a: "middle", fs: 12, c: C.mute });
      s += DFQ1_L(X(-440), 320, X(440), 320, C.ink, 1.2) + DFQ1_T(X(440), 336, "z", { i: 1, a: "end" });
      if (k >= 2) s += DFQ1_T(X(80) + 8, 58, `ε${DFQ1_s("GaAs")}E${DFQ1_s("z")}(in) = ε${DFQ1_s("air")}E${DFQ1_s("z")}(out)`, { fs: 12, c: C.purple });
      const band = (y0, H, f, eps, col, lab, shade) => {
        let r = DFQ1_L(X(-440), y0 + H, X(440), y0 + H, C.grid, 1);
        if (shade) { const left = [], right = []; zs.forEach((z, i) => { if (z < -80) left.push([X(z), y0 + H - H * f[i]]); if (z > 80) right.push([X(z), y0 + H - H * f[i]]); });
          r += DFQ1_P([[X(-440), y0 + H], ...left, [X(-80), y0 + H]], "none", 0, null, col + "33") + DFQ1_P([[X(80), y0 + H], ...right, [X(440), y0 + H]], "none", 0, null, col + "33"); }
        r += DFQ1_P(zs.map((z, i) => [X(z), y0 + H - H * f[i]]), col, 2.4) + DFQ1_T(X(-430), y0 + 14, lab, { fs: 12, c: col, b: 1 });
        return r;
      };
      const frac = (f, s) => { let a = 0, b = 0; zs.forEach((z, i) => { const w = f[i] * f[i]; b += w; if (Math.abs(z) > 80) a += w; }); return a / b; };
      if (k >= 3 && te) s += band(70, 100, DFQ1_field(te, zs).main, null, C.blue, "TE-like main field E" + DFQ1_s("y") + " (continuous)", k >= 5);
      if (k >= 4 && tm) { const ez = DFQ1_field(tm, zs).ez; s += band(190, 120, ez, null, C.orange, "TM-like main field E" + DFQ1_s("z") + " (jumps)", k >= 5);
        const zi = zs.findIndex(z => z > 80), yin = 310 - 120 * ez[zi - 1], yout = 310 - 120 * ez[zi];
        s += DFQ1_A(X(80) + 14, yin, X(80) + 14, yout + 4, C.purple, 1.6) + DFQ1_T(X(80) + 20, (yin + yout) / 2, "× " + (n * n).toFixed(1), { fs: 12, c: C.purple, b: 1 }); }
      if (k >= 5 && te && tm) { s += DFQ1_T(X(440) - 4, 86, `in air ${(100 * frac(DFQ1_field(te, zs).main)).toFixed(0)} %`, { a: "end", fs: 12, c: C.blue }) + DFQ1_T(X(440) - 4, 206, `in air ${(100 * frac(DFQ1_field(tm, zs).ez)).toFixed(0)} %`, { a: "end", fs: 12, c: C.orange }); }
      if (k >= 6) {
        const NX = x => 70 + (x - 1) / 2.6 * 540, y = 360;
        s += DFQ1_L(NX(0.95), y, NX(3.6), y, C.ink, 1.2);
        [[1, "1"], [n, "n = " + n.toFixed(2)]].forEach(([x, l]) => { s += DFQ1_L(NX(x), y - 7, NX(x), y + 7, C.ink, 1.5) + DFQ1_T(NX(x), y + 22, l, { a: "middle", fs: 11 }); });
        if (te) s += `<circle cx="${NX(te.N)}" cy="${y}" r="6" fill="${C.blue}"/>` + DFQ1_T(NX(te.N), y - 12, "TE " + te.N.toFixed(2), { a: "middle", fs: 12, c: C.blue });
        if (tm) s += `<circle cx="${NX(tm.N)}" cy="${y}" r="6" fill="${C.orange}"/>` + DFQ1_T(NX(tm.N), y + 22, "TM " + tm.N.toFixed(2), { a: "middle", fs: 12, c: C.orange });
      }
      return s;
    },
    ro(v) {
      const n = v.q15n, te = DFQ1_slab(n, 1, 1, t, lam, 0, "TE"), tm = DFQ1_slab(n, 1, 1, t, lam, 0, "TM");
      return `<div><span>jump ε<sub>GaAs</sub>/ε<sub>air</sub></span><b>${(n * n).toFixed(2)}</b></div><div><span>TE-like slab n<sub>eff</sub></span><b>${te ? te.N.toFixed(3) : "cut off"}</b></div><div><span>TM-like slab n<sub>eff</sub></span><b>${tm ? tm.N.toFixed(3) : "cut off"}</b></div>`;
    }
  });
}},

/* ---------------- Q1.6 ---------------- */
{s: "Q1.6", t: "How does the mode solver find the modes?",
intu: String.raw`The cross-section does not change along the waveguide, so every field can be written as \(\mathbf{E}(y, z)\,e^{i\beta x}\). Putting this into Maxwell's equations turns every \(\partial/\partial x\) into \(i\beta\) and leaves an equation on the cross-section alone, with \(\beta^2\) as an eigenvalue. Tidy3D discretizes the cross-section with finite differences and solves this eigenvalue problem for the transverse electric field (Tidy3D). Each eigenvalue gives one mode, with \(n_{\mathrm{eff}} = \beta/k_0\), and each eigenvector is its field profile. The guided modes are those with \(n_{\mathrm{c}} \lt n_{\mathrm{eff}} \lt n\), and the grid is refined until the indices stop changing.`,
eq: String.raw`\[ \mathbf{E}(x, y, z) = \mathbf{E}(y, z)\, e^{i\beta x}, \qquad n_{\mathrm{eff}} = \frac{\beta}{k_0} \]\[ \frac{d^2 E_y}{dz^2} + k_0^2 n^2(z)\, E_y = \beta^2 E_y \ \ \longrightarrow\ \ \mathbf{A}\,\mathbf{e} = \beta^2\,\mathbf{e} \]<div class="eqnote">Second line: the one-dimensional slab form that the board example solves live. Tidy3D solves the full vector problem on the two-dimensional cross-section.</div><div class="eqref">Sec. 2.2</div>`,
sym: [[String.raw`\(\beta\)`, "propagation constant, the square root of an eigenvalue"], [String.raw`\(\mathbf{A}\)`, "matrix from the finite-difference derivatives and the index at each grid point"], [String.raw`\(\mathbf{e}\)`, "vector of field values at the grid points, the mode profile"], [String.raw`\(h\)`, "grid step"]],
how: [String.raw`Draw the cross-section and lay a grid of points over it. The index is known at every point.`,
String.raw`Write the field as \(\mathbf{E}(y, z)\,e^{i\beta x}\): along the guide only the phase changes.`,
String.raw`Put it into Maxwell's equations: every \(\partial/\partial x\) becomes \(i\beta\), and what is left lives on the cross-section only.`,
String.raw`Replace the derivatives across the section by differences between neighbouring points, \((E_{j+1} - 2E_j + E_{j-1})/h^2\). The equation becomes a matrix times a vector, an eigenvalue problem for \(\beta^2\).`,
String.raw`Solve it: each eigenvalue gives a mode with \(n_{\mathrm{eff}} = \beta/k_0\), each eigenvector its profile. Keep the ones with \(1 \lt n_{\mathrm{eff}} \lt 3.5\).`,
String.raw`Refine the grid (slider) and check that \(n_{\mathrm{eff}}\) converges. Here the answer is compared with the exact slab equation.`],
say: String.raw`With fields varying as \(e^{i\beta x}\), Maxwell's equations become an eigenvalue problem on the cross-section. The solver discretizes it with finite differences, and each eigenvalue gives a mode with \(n_{\mathrm{eff}} = \beta/k_0\).`,
num: String.raw`Board example: TE slab, \(n = 3.5\), \(t = 160\) nm, \(\lambda_0 = 800\) nm. Exact TE0 about <b>3.076</b>, TE1 about <b>1.60</b>. The error of the finite-difference index falls roughly as \(h^2\).`,
note: String.raw`<p><b>"How do you know which eigenvector is TE-like and which TM-like?"</b></p><p>From the symmetry of the field and from which component dominates. Tidy3D reports the fraction of the field in the TE component, close to 1 for TE-like and close to 0 for TM-like, and the modes can also be sorted by their parity in \(y\) and \(z\) (Sec. 2.2).</p>`,
r(fig, ctl) {
  const C = DFQ1_C;
  if (!DFQ1_conv) { DFQ1_conv = []; const ex = C2.slabN(3.5, 1, 160, 800, 0, "TE"); for (let m = 2; m <= 24; m += 2) DFQ1_conv.push([m, Math.abs(DFQ1_fd(m, 1).modes[0].neff - ex)]); }
  const cache = {};
  const solve = m => cache[m] || (cache[m] = DFQ1_fd(m, 2));
  DFQ1_board(this, fig, ctl, {
    h: 450, sl: [["q16m", "Grid points across the membrane", 2, 24, 1, 4]],
    draw(k, v) {
      const m = v.q16m, r = solve(m), Z = z => 200 - z * 0.42;
      let s = DFQ1_R(40, Z(80), 160, Z(-80) - Z(80), C.gaas, C.gaasE) + DFQ1_T(46, Z(80) - 6, "GaAs", { fs: 12 }) + DFQ1_T(46, 66, "air", { fs: 12, c: C.mute });
      s += DFQ1_L(220, 50, 220, 350, C.ink, 1) + DFQ1_T(226, 56, "z", { i: 1 });
      if (k >= 1) { const zz = r.modes[0].z.filter(z => Math.abs(z) < 340); const step = Math.max(1, Math.ceil(zz.length / 70)); zz.forEach((z, i) => { if (i % step === 0) s += `<circle cx="120" cy="${Z(z).toFixed(1)}" r="2" fill="${C.ink}"/>`; }); s += DFQ1_T(120, 366, `grid step h = ${r.h.toFixed(1)} nm`, { a: "middle", fs: 12 }); }
      if (k >= 2) s += DFQ1_T(250, 80, "E(y, z) e<tspan baseline-shift=\"super\" font-size=\"9\">iβx</tspan>", { fs: 15, c: C.blue });
      if (k >= 3) s += DFQ1_T(250, 108, "∂/∂x → iβ", { fs: 14, c: C.purple }) + DFQ1_T(250, 128, "cross-section only", { fs: 12, c: C.mute });
      if (k >= 4) { const x0 = 252, y0 = 150, c = 13; for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { const on = Math.abs(i - j) <= 1; s += DFQ1_R(x0 + j * c, y0 + i * c, c - 1, c - 1, on ? (i === j ? C.blue : "#9fb9e6") : "#f1f3f6"); }
        s += DFQ1_T(x0, y0 + 8 * c + 18, "A e = β² e", { fs: 14, b: 1 }) + DFQ1_T(x0, y0 + 8 * c + 34, "tridiagonal in 1D", { fs: 11, c: C.mute }); }
      if (k >= 5) {
        const X = a => 520 + 110 * a, cols = [C.blue, C.orange];
        s += DFQ1_L(520, 50, 520, 350, C.mute, 1);
        r.modes.forEach((md, i) => { const pts = []; md.z.forEach((z, j) => { if (Math.abs(z) < 340) pts.push([X(md.v[j]), Z(z)]); }); if (md.neff > 1) s += DFQ1_P(pts, cols[i], 2.2) + DFQ1_T(560, 60 + i * 18, `TE${i}: ${DFQ1_ne} = ${md.neff.toFixed(3)}`, { fs: 12, c: cols[i] }); });
        s += DFQ1_L(410, Z(80), 650, Z(80), C.gaasE, 1, "3 3") + DFQ1_L(410, Z(-80), 650, Z(-80), C.gaasE, 1, "3 3");
      }
      if (k >= 6) {
        const lg = DFQ1_conv.map(c => Math.log10(c[1])), lmin = Math.min(...lg), lmax = Math.max(...lg), px = x => 300 + (x - 2) / 22 * 340, py = e => 430 - (Math.log10(e) - lmin) / (lmax - lmin) * 60;
        s += DFQ1_L(300, 432, 640, 432, C.ink, 1) + DFQ1_L(300, 432, 300, 366, C.ink, 1) + DFQ1_T(470, 445, "points across the membrane", { a: "middle", fs: 11, c: C.mute }) + DFQ1_T(294, 376, "error (log)", { a: "end", fs: 11, c: C.mute });
        s += DFQ1_P(DFQ1_conv.map(([mm, e]) => [px(mm), py(e)]), C.green, 2);
        const ex = C2.slabN(3.5, 1, 160, 800, 0, "TE"), e = Math.abs(r.modes[0].neff - ex);
        s += `<circle cx="${px(m)}" cy="${Math.max(360, Math.min(436, py(Math.max(e, 1e-9))))}" r="5" fill="${C.green}"/>`;
      }
      return s;
    },
    ro(v) { const r = solve(v.q16m), ex = C2.slabN(3.5, 1, 160, 800, 0, "TE"); return `<div><span>finite-difference TE0</span><b>${r.modes[0].neff.toFixed(4)}</b></div><div><span>exact slab TE0</span><b>${ex.toFixed(4)}</b></div><div><span>error</span><b>${Math.abs(r.modes[0].neff - ex).toExponential(1)}</b></div>`; }
  });
}},

/* ---------------- Q1.7 ---------------- */
{s: "Q1.7", t: "Why a 200 nm wide strip for routing?",
intu: String.raw`At 200 nm both fundamental modes, TE-like and TM-like, are well guided, with most of their power inside the GaAs, while the higher-order modes TE1 and TM1 have effective indices close to that of the air cladding and are only weakly guided (Sec. 2.2). So the strip routes both polarizations cleanly, while the higher-order modes it can support keep most of their power in the air and are only weakly bound to the strip. A wider strip would guide the higher-order modes strongly, so light could be converted into them at bends and junctions. A narrower strip pushes the fundamental modes themselves toward the air line, so their fields spread out and they become weakly guided too.`,
eq: String.raw`\[ n_{\mathrm{c}} = 1 \ \lt\ n_{\mathrm{eff}}^{\mathrm{TE1}},\, n_{\mathrm{eff}}^{\mathrm{TM1}} \ \text{(just above 1)} \ \ll\ n_{\mathrm{eff}}^{\mathrm{TM0}} \lt n_{\mathrm{eff}}^{\mathrm{TE0}} \]<div class="eqnote">At the routing width the higher-order modes sit just above the air line, the fundamental modes well above it.</div><div class="eqref">Sec. 2.2, Fig. 2.2</div>`,
sym: [[String.raw`\(w\)`, "strip width (along \(y\))"], [String.raw`\(\mathrm{TE0}, \mathrm{TM0}\)`, "fundamental TE-like and TM-like modes"], [String.raw`\(\mathrm{TE1}, \mathrm{TM1}\)`, "next modes, with one more node across the strip"]],
how: [String.raw`Draw axes: \(n_{\mathrm{eff}}\) up, strip width \(w\) across, 100 to 500 nm.`,
String.raw`Draw the two limits: the air line \(n_{\mathrm{eff}} = 1\), below which nothing is guided, and the slab indices that the curves approach for a very wide strip.`,
String.raw`Draw TE0 and TM0: they start low for narrow strips and rise toward their slab values. TE0 lies above TM0.`,
String.raw`Draw TE1 and TM1: they leave the air line only at larger widths and rise more slowly.`,
String.raw`Put a vertical line at 200 nm: TE0 and TM0 are well above the air line, TE1 and TM1 only just above it.`,
String.raw`Drag the width: wider makes the higher-order modes strongly guided, narrower pushes the fundamental modes down toward air. 200 nm sits between the two.`],
say: String.raw`At 200 nm both fundamental modes are well guided, while the higher-order modes have effective indices close to the air line and are only weakly guided. That is why it is used for routing.`,
num: String.raw`Curves here: effective index method with round values (\(n = 3.5\), 160 nm, 800 nm), an estimate. The thesis values come from the full Tidy3D mode solver (Fig. 2.2).`,
note: String.raw`<p><b>"Why not make it single mode, narrower still?"</b></p><p>Then the fundamental modes, the TM-like one first, approach the air line themselves, their fields spread far into the air and they become weakly guided too. 200 nm keeps both fundamental modes well guided while the higher-order modes are only weakly guided.</p>`,
r(fig, ctl) {
  const C = DFQ1_C;
  const PX = w => 80 + (w - 100) / 400 * 540, PY = x => 312 - (x - 0.85) / 2.35 * 270;
  const curve = (fam, p) => { const d = DFQ1_eim(fam, p), pts = []; d.ws.forEach((w, i) => { if (d.ns[i]) pts.push([PX(w), PY(d.ns[i])]); }); return pts; };
  DFQ1_board(this, fig, ctl, {
    h: 370, sl: [["q17w", "Strip width w", 100, 500, 5, 200, x => x + " nm"]],
    draw(k, v) {
      const w = v.q17w;
      let s = DFQ1_L(80, 320, 620, 320, C.ink, 1.2) + DFQ1_L(80, 320, 80, 40, C.ink, 1.2) + DFQ1_T(350, 358, "strip width w (nm)", { a: "middle", fs: 12 }) + DFQ1_T(72, 34, DFQ1_ne, { a: "end", fs: 13 });
      [100, 200, 300, 400, 500].forEach(x => { s += DFQ1_L(PX(x), 316, PX(x), 324, C.ink, 1) + DFQ1_T(PX(x), 338, String(x), { a: "middle", fs: 11 }); });
      [1, 1.5, 2, 2.5, 3].forEach(x => { s += DFQ1_L(76, PY(x), 84, PY(x), C.ink, 1) + DFQ1_T(70, PY(x) + 4, String(x), { a: "end", fs: 11 }); });
      if (k >= 2) { const nte = C2.slabN(3.5, 1, 160, 800, 0, "TE"), ntm = C2.slabN(3.5, 1, 160, 800, 0, "TM");
        s += DFQ1_L(80, PY(1), 620, PY(1), C.ink, 1.6, "6 4") + DFQ1_T(616, PY(1) + 16, "air line, nothing guided below", { a: "end", fs: 11, c: C.mute });
        s += DFQ1_L(80, PY(nte), 620, PY(nte), C.blue, 1, "3 4") + DFQ1_T(86, PY(nte) - 5, "TE slab", { fs: 11, c: C.blue }) + DFQ1_L(80, PY(ntm), 620, PY(ntm), C.orange, 1, "3 4") + DFQ1_T(86, PY(ntm) - 5, "TM slab", { fs: 11, c: C.orange }); }
      if (k >= 3) s += DFQ1_P(curve("TE", 0), C.blue, 2.6) + DFQ1_P(curve("TM", 0), C.orange, 2.6) + DFQ1_T(624, PY(C2.eim(3.5, 1, 160, 500, 800, "TE", 0)) + 4, "TE0", { c: C.blue, b: 1, fs: 11 }) + DFQ1_T(624, PY(C2.eim(3.5, 1, 160, 500, 800, "TM", 0)) + 4, "TM0", { c: C.orange, b: 1, fs: 11 });
      if (k >= 4) s += DFQ1_P(curve("TE", 1), C.blue, 2, "7 4") + DFQ1_P(curve("TM", 1), C.orange, 2, "7 4") + DFQ1_T(624, PY(C2.eim(3.5, 1, 160, 500, 800, "TE", 1)) + 4, "TE1", { c: C.blue, fs: 11 }) + DFQ1_T(624, PY(C2.eim(3.5, 1, 160, 500, 800, "TM", 1)) + 4, "TM1", { c: C.orange, fs: 11 });
      if (k >= 5) { s += DFQ1_L(PX(w), 40, PX(w), 320, C.green, 2) + DFQ1_T(PX(w) + 5, 54, w + " nm", { c: C.green, b: 1, fs: 12 });
        [["TE", 0, C.blue], ["TM", 0, C.orange], ["TE", 1, C.blue], ["TM", 1, C.orange]].forEach(([f, p, c]) => { const x = C2.eim(3.5, 1, 160, w, 800, f, p); if (x) s += `<circle cx="${PX(w)}" cy="${PY(x)}" r="5" fill="${p ? "#fff" : c}" stroke="${c}" stroke-width="2"/>`; }); }
      if (k >= 6) s += DFQ1_A(PX(380), PY(1.4), PX(480), PY(1.4), C.purple, 1.6) + DFQ1_T(PX(430), PY(1.4) - 8, "wider: higher modes guided", { a: "middle", fs: 11, c: C.purple }) + DFQ1_A(PX(235), 24, PX(180), 24, C.purple, 1.6) + DFQ1_T(PX(240), 28, "narrower: fundamental modes sink toward air", { fs: 11, c: C.purple });
      return s;
    },
    ro(v) { const w = v.q17w, f = (a, p) => { const x = C2.eim(3.5, 1, 160, w, 800, a, p); return x ? x.toFixed(2) : "cut off"; }; return `<div><span>TE0</span><b>${f("TE", 0)}</b></div><div><span>TM0</span><b>${f("TM", 0)}</b></div><div><span>TE1</span><b>${f("TE", 1)}</b></div><div><span>TM1</span><b>${f("TM", 1)}</b></div>`; }
  });
}},

/* ---------------- Q1.8 ---------------- */
{s: "Q1.8", t: "What happens to the TE-like and TM-like modes if the symmetry is broken, by a substrate or the DBR below?",
intu: String.raw`The classification into even and odd modes holds only if the structure is the same after \(z \to -z\). With a substrate or a mirror below, that symmetry is gone, so the modes are no longer strictly even or odd. They are still mostly TE or mostly TM as long as the asymmetry is weak, but they lose the protection of symmetry: where the structure changes, TE-like and TM-like light can now couple. In the simulations the mirror plane \(z = 0\) is used only where there is air above and below, since the DBR under the gratings breaks this symmetry (Sec. 3.6).`,
eq: String.raw`\[ \Psi(z) = \underbrace{\tfrac{1}{2}\left[\Psi(z) + \Psi(-z)\right]}_{\text{even part}} + \underbrace{\tfrac{1}{2}\left[\Psi(z) - \Psi(-z)\right]}_{\text{odd part}} \]\[ \varepsilon(-z) = \varepsilon(z) \ \Rightarrow\ \text{each mode is purely even or purely odd} \]<div class="eqref">Sec. 2.2 (Johnson et al. 1999) and Sec. 3.6 (symmetry planes)</div>`,
sym: [[String.raw`\(\Psi(z)\)`, "mode profile across the membrane"], [String.raw`\(\varepsilon(z)\)`, "permittivity profile, symmetric only with the same medium above and below"], [String.raw`\(n_{\mathrm{s}}\)`, "index of the material below (slider)"]],
how: [String.raw`Draw the membrane with air above and below, the mirror plane \(z = 0\) dashed, and the symmetric TE-like profile.`,
String.raw`Fold the profile about \(z = 0\) (dashed copy): it lies on itself, so the mode is purely even and its odd part is zero.`,
String.raw`Put a material of index \(n_{\mathrm{s}}\) below the membrane, a substrate or, under a grating, the DBR (slider).`,
String.raw`Fold again: the profile no longer matches its mirror image. Split it into an even and an odd part, and the bar shows the odd part is no longer zero.`,
String.raw`Write the consequences: the modes are only approximately TE-like and TM-like, they can couple where the structure changes, and the \(z = 0\) symmetry plane cannot be used in the simulation.`],
say: String.raw`The TE-like and TM-like labels rely on the \(z \to -z\) symmetry. A substrate or a DBR below breaks it, so the modes are no longer purely even or odd and can couple, and the symmetry plane can no longer be used in the simulation.`,
num: String.raw`Slab, \(n = 3.5\), 160 nm, 800 nm, material of index \(n_{\mathrm{s}}\) directly below. The odd share of the TE0 profile grows from 0 with \(n_{\mathrm{s}}\) (readout).`,
note: String.raw`<p><b>"Does the DBR change the guided mode in your waveguides?"</b></p><p>Hardly, as long as the air gap is many decay lengths thick. The tail of the TE-like mode decays over a few tens of nanometres, so the mirror is felt mainly by the light that the grating radiates downward (Sec. 2.4). If the material below had a higher index than \(n_{\mathrm{eff}}\) and the gap were thin, light could also leak through the gap into it.</p>`,
r(fig, ctl) {
  const C = DFQ1_C, n = 3.5, t = 160, lam = 800, zs = range(-500, 500, 501);
  const odd = (s, pol) => { if (!s) return null; const f = DFQ1_field(s, zs)[pol === "TE" ? "main" : "ez"]; let a = 0, b = 0; for (let i = 0; i < zs.length; i++) { const o = (f[i] - f[zs.length - 1 - i]) / 2; a += o * o; b += f[i] * f[i]; } return a / b; };
  DFQ1_board(this, fig, ctl, {
    h: 360, sl: [["q18s", "Index below the membrane n<sub>s</sub>", 1, 3.2, 0.01, 1, x => x.toFixed(2)]],
    draw(k, v) {
      const ns = k >= 3 ? v.q18s : 1, Z = z => 190 - z * 0.26, X = a => 50 + 235 * a;
      const te = DFQ1_slab(n, 1, ns, t, lam, 0, "TE"), tm = DFQ1_slab(n, 1, ns, t, lam, 0, "TM");
      let s = "";
      if (ns > 1.005) s += DFQ1_R(24, Z(-80), 340, 330 - Z(-80), C.sub) + DFQ1_T(40, 322, `n${DFQ1_s("s")} = ${ns.toFixed(2)} below`, { c: C.amber, fs: 12 });
      s += DFQ1_R(24, Z(80), 340, Z(-80) - Z(80), C.gaas, C.gaasE) + DFQ1_T(358, Z(0) - 4, "GaAs", { a: "end", fs: 12 }) + DFQ1_T(200, 70, "air", { c: C.mute, fs: 12 });
      s += DFQ1_L(24, Z(0), 380, Z(0), C.ink, 1.2, "6 4") + DFQ1_T(384, Z(0) + 4, "z = 0", { fs: 12, c: C.mute });
      if (te) { const f = DFQ1_field(te, zs).main; s += DFQ1_P(zs.map((z, i) => [X(f[i]), Z(z)]), C.blue, 2.6) + DFQ1_T(X(1) + 6, Z(160), "TE-like profile", { c: C.blue, fs: 12 });
        if (k >= 2) s += DFQ1_P(zs.map((z, i) => [X(f[zs.length - 1 - i]), Z(z)]), C.purple, 1.8, "5 4") + DFQ1_T(X(1) + 6, Z(-170), "mirror image", { c: C.purple, fs: 12 }); }
      if (k >= 4) {
        const bars = [["TE-like", odd(te, "TE"), C.blue], ["TM-like", odd(tm, "TM"), C.orange]];
        s += DFQ1_T(430, 60, "odd share of the profile", { fs: 12, b: 1 });
        bars.forEach(([l, f], i) => { const y = 84 + i * 50; s += DFQ1_T(430, y + 14, l, { fs: 12, c: bars[i][2] }) + DFQ1_R(500, y, 150, 20, "#f1f3f6", "#cfd6e0"); if (f != null) s += DFQ1_R(500, y, Math.max(1, 150 * Math.min(1, f / 0.25)), 20, bars[i][2]) + DFQ1_T(650, y + 36, (100 * f).toFixed(1) + " %", { a: "end", fs: 12 }); else s += DFQ1_T(575, y + 36, "not guided", { a: "middle", fs: 12, c: C.red }); });
        s += DFQ1_T(500, 196, "bar full scale: 25 %", { fs: 10, c: C.mute });
      }
      if (k >= 5) { ["not purely even or odd", "TE-like and TM-like can couple", "no z = 0 symmetry plane"].forEach((l, i) => { s += DFQ1_T(430, 240 + i * 22, "• " + l, { fs: 12, c: ns > 1.005 ? C.red : C.mute }); }); }
      return s;
    },
    ro(v, k) { const ns = k >= 3 ? v.q18s : 1, te = DFQ1_slab(n, 1, ns, t, lam, 0, "TE"), tm = DFQ1_slab(n, 1, ns, t, lam, 0, "TM"), a = odd(te, "TE"), b = odd(tm, "TM");
      return `<div><span>odd share, TE-like</span><b>${a == null ? "not guided" : (100 * a).toFixed(2) + " %"}</b></div><div><span>odd share, TM-like</span><b>${b == null ? "not guided" : (100 * b).toFixed(2) + " %"}</b></div><div><span>TE-like n<sub>eff</sub></span><b>${te ? te.N.toFixed(3) : "not guided"}</b></div>`; }
  });
}}

],
summary: String.raw`The devices sit on a 160 nm GaAs membrane with air above and below, made by releasing the GaAs from a sacrificial AlGaAs layer with HF. Air on both sides gives the widest guiding window, \(1 \lt n_{\mathrm{eff}} \lt 3.5\), and a mirror symmetry in \(z\), so every mode is even or odd: purely TE or purely TM on the mid-plane and TE-like or TM-like elsewhere. \(n_{\mathrm{eff}} = \beta/k_0\) is the index the mode appears to travel in along the guide. Because normal \(D\) is continuous, \(E_z\) jumps by \(\varepsilon_{\mathrm{GaAs}}/\varepsilon_{\mathrm{air}}\), so the TM-like field peaks just outside the GaAs and its index is lower. The mode solver turns \(e^{i\beta x}\) fields into an eigenvalue problem on the cross-section. A 200 nm strip guides both fundamental modes well while the higher-order modes are only weakly guided. A substrate or DBR below breaks the symmetry, so the modes are no longer purely even or odd.`,
sheet: [
[String.raw`\[ n_{\mathrm{eff}} = \frac{\beta}{k_0}, \qquad k_0 = \frac{2\pi}{\lambda_0}, \qquad n_{\mathrm{c}} \lt n_{\mathrm{eff}} \lt n \]`, "Effective index and the guiding window (Sec. 2.2)"],
[String.raw`\[ \gamma = k_0\sqrt{n_{\mathrm{eff}}^2 - n_{\mathrm{c}}^2} \]`, "Decay constant of the field in the cladding"],
[String.raw`\[ E_z(-z) = -E_z(z) \ \text{(even)}, \qquad E_{x,y}(-z) = -E_{x,y}(z) \ \text{(odd)} \]`, "Mirror symmetry: TE-like (even) and TM-like (odd), Johnson et al. 1999"],
[String.raw`\[ E_z^{\mathrm{air}} = \frac{\varepsilon_{\mathrm{GaAs}}}{\varepsilon_{\mathrm{air}}}\, E_z^{\mathrm{GaAs}} \]`, "Eq. (2.1): the field jump that puts the TM-like field outside the GaAs"],
[String.raw`\[ \mathbf{E}(x, y, z) = \mathbf{E}(y, z)\, e^{i\beta x} \ \Rightarrow\ \mathbf{A}\,\mathbf{e} = \beta^2\,\mathbf{e} \]`, "Mode solver: an eigenvalue problem on the cross-section"]],
sources: ["Johnson et al., Phys. Rev. B 60, 5751 (1999), p. 5753 (even and odd modes of a slab, purely TE and TM on the mid-plane)",
"Tidy3D (Flexcompute), mode solver documentation and source, version 2.11.2 (finite-difference eigenmodes of a cross-section, symmetry planes)",
"Midolo, Pregnolato, Kiršanskė and Stobbe, Nanotechnology 26, 484002 (2015) (GaAs membranes: sacrificial AlGaAs, electron-beam lithography, dry etching, HF release)"]
});

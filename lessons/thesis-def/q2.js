/* Committee questions Q2: grating couplers, the DBR and the air gap (thesis Sec. 2.3 and 2.4).
   Helpers below use the prefix DFQ2_ (all lesson files share one global scope). */
const DFQ2_C = { ink: "#1f2933", mute: "#6b7684", blue: "#2563c9", orange: "#d0582a", green: "#14866a", purple: "#6a5fd0", amber: "#b7791f", red: "#c53030", gaas: "#cdd6e3", gaasE: "#7d8ca3", sub: "#ece2cc", win: "#dff3ea", grid: "#e6eaf0" };
const DFQ2_s = s => `<tspan baseline-shift="sub" font-size="9">${s}</tspan>`;
const DFQ2_ne = `n${DFQ2_s("eff")}`;
const DFQ2_T = (x, y, s, o) => { o = o || {}; return `<text x="${x}" y="${y}" font-size="${(o.fs || 13) + 2}" fill="${o.c || DFQ2_C.ink}" text-anchor="${o.a || "start"}"${o.b ? ' font-weight="600"' : ""}${o.i ? ' font-style="italic"' : ""}>${s}</text>`; };
const DFQ2_L = (x1, y1, x2, y2, c, w, d) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c || DFQ2_C.ink}" stroke-width="${w || 1.5}" stroke-linecap="round"${d ? ` stroke-dasharray="${d}"` : ""}/>`;
const DFQ2_A = (x1, y1, x2, y2, c, w, d) => arrow(x1, y1, x2, y2, c || DFQ2_C.ink, w || 1.8, d);
const DFQ2_P = (pts, c, w, d, f) => `<path d="${pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join("")}" fill="${f || "none"}" stroke="${c}" stroke-width="${w || 2}" stroke-linejoin="round"${d ? ` stroke-dasharray="${d}"` : ""}/>`;
const DFQ2_R = (x, y, w, h, f, s, o) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}"${s ? ` stroke="${s}"` : ""}${o != null ? ` fill-opacity="${o}"` : ""}/>`;

/* Whiteboard engine: Back / Next / Play / Show all, one caption per how[] step, optional sliders and readout.
   o = { h, sl: [[id, label, min, max, step, value, fmt]], draw(k, v, t) -> svg body, ro(v, k) -> html, live, dt } */
const DFQ2_board = function (card, fig, ctl, o) {
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

const DFQ2_K = (v, X, y, c, lab, up) => `<circle cx="${X(v)}" cy="${y}" r="5" fill="${c}"/>` + (lab ? DFQ2_T(X(v), up ? y - 12 : y + 22, lab, { a: "middle", fs: 12, c }) : "");
const DFQ2_arc = (X, a, b, y, c, dir, lab, dash) => { const h = 26 + Math.min(40, Math.abs(X(b) - X(a)) * 0.15); const yy = y + dir * h; return `<path d="M${X(a)} ${y + dir * 7} Q${(X(a) + X(b)) / 2} ${yy} ${X(b)} ${y + dir * 7}" fill="none" stroke="${c}" stroke-width="2" ${dash ? `stroke-dasharray="${dash}"` : ""} marker-end="url(#ar)"/>` + (lab ? DFQ2_T((X(a) + X(b)) / 2, yy + (dir < 0 ? 2 : 12), lab, { a: "middle", fs: 12, c }) : ""); };
const DFQ2_axis = (X, y, lo, hi) => { let s = DFQ2_R(X(-1), y - 12, X(1) - X(-1), 24, DFQ2_C.win, null, 0.9) + DFQ2_L(X(lo), y, X(hi), y, DFQ2_C.ink, 1.3); for (let v = Math.ceil(lo); v <= Math.floor(hi); v++) s += DFQ2_L(X(v), y - 4, X(v), y + 4, DFQ2_C.ink, 1) + DFQ2_T(X(v), y + 38, String(v), { a: "middle", fs: 10, c: DFQ2_C.mute }); return s + DFQ2_T(X(lo), y - 10, "k" + DFQ2_s("x") + " / k" + DFQ2_s("0"), { fs: 11, c: DFQ2_C.mute }); };
const DFQ2_grating = (x0, x1, y, h, per, gapf, col) => { let s = DFQ2_R(x0, y, x1 - x0, h, col || DFQ2_C.gaas, DFQ2_C.gaasE); for (let x = x0 + per * 0.6; x + per * gapf(x) < x1; x += per) s += DFQ2_R(x, y - 0.5, per * gapf(x), h + 1, "#ffffff"); return s; };
const DFQ2_NS = C2.slabN(3.5, 1, 160, 800, 0, "TE");
/* Emission of a grating with field decay alpha(x) (1/um): returns emitted field on xs and best overlap with a Gaussian of waist w0. */
const DFQ2_emit = (a, w0) => {
  const xs = range(0, 7, 351), dx = xs[1] - xs[0], x0g = 2.4;
  const G2 = xs.map(x => Math.exp(-2 * Math.pow((x - x0g) / w0, 2))), tot = G2.reduce((p, q) => p + q, 0) * dx;
  let cum = 0; const al = xs.map((x, i) => { const ag = G2[i] / (2 * Math.max(0.03, tot / 0.97 - cum)); cum += G2[i] * dx; return (1 - a) * 0.68 / w0 + a * ag; });
  let P = 1; const E = xs.map((x, i) => { const e = Math.sqrt(Math.max(0, 2 * al[i] * P)); P *= Math.exp(-2 * al[i] * dx); return e; });
  let best = 0; for (let c = -0.5; c < 6; c += 0.05) { let s = 0, e2 = 0, g2 = 0; for (let j = -60; j < xs.length; j++) { const x = j * dx, ee = j >= 0 ? E[j] : 0, g = Math.exp(-Math.pow((x - c) / w0, 2)); s += ee * g; e2 += ee * ee; g2 += g * g; } best = Math.max(best, s * s / (e2 * g2)); }
  return { xs, E, al, ov: best, out: 1 - P };
};

addLesson("thesis", "def", {
level: "Defense", id: "thesis-def-q2", title: "Grating couplers, DBR and the air gap", short: "Q2. Grating couplers, DBR and air gap",
labels: { intu: "Short answer", how: "On the board, step by step", note: "Follow-up they might ask" },
big: String.raw`These are the questions a committee is likely to ask about Sections 2.3 and 2.4: how phase matching sets the grating period (Eqs. 2.2 and 2.3), why the fiber is tilted, why a TM coupler needs a longer period, what the fill factor does, which two factors limit the coupling efficiency, why the DBR layers are a quarter wave thick and where the \(\pi\) comes from (Eqs. 2.4 and 2.5), how many pairs are needed and over what band (Eqs. 2.6 and 2.7), and why the air gap matters so much. Each card builds the board drawing step by step, with sliders for the "what if" questions.`,
bridge: String.raw`Worked numbers use round textbook values: \(n_{\mathrm{eff}} = 2.8\) for a TE-like grating and 2.1 for a TM-like one, \(\lambda_0 = 800\) nm, air cladding, the 5° fiber tilt of Sec. 3.6, and a DBR of \(n_H = 3.5\) and \(n_L = 3.0\). They are not thesis results. The grating theory follows Taillaert et al. 2006 and Zhou et al. 2018, the DBR theory Gačević and Vukmirović 2018, as in the thesis.`,
cards: [

/* ---------------- Q2.1 ---------------- */
{s: "Q2.1", t: "Derive the grating period from phase matching (Eqs. 2.2 and 2.3).",
intu: String.raw`A guided mode with \(\beta = k_0 n_{\mathrm{eff}}\) passes a grating of period \(\Lambda\), and every tooth scatters a little of it. Light scattered by neighbouring teeth adds up in the direction \(\theta_m\) only if the phase delay of the guided wave from one tooth to the next, \(\beta\Lambda\), and the extra path in the cladding, \(k_0 n_{\mathrm{c}}\Lambda\sin\theta_m\), differ by a whole number of \(2\pi\). Dividing by \(\Lambda\) gives Eq. (2.2). An order radiates only if \(|\beta + m\,2\pi/\Lambda| \lt k_0 n_{\mathrm{c}}\). The period is chosen so that the first order, \(m = -1\), leaves toward the fiber at the angle \(\theta\), which gives Eq. (2.3) (Zhou et al. 2018).`,
eq: String.raw`\[ k_0 n_{\mathrm{c}} \sin\theta_m = \beta + m\,\frac{2\pi}{\Lambda}, \qquad m = 0, \pm 1, \pm 2, \ldots \]\[ m = -1: \qquad \Lambda = \frac{\lambda_0}{n_{\mathrm{eff}} - n_{\mathrm{c}} \sin\theta} \]<div class="eqref">Eqs. (2.2) and (2.3), Sec. 2.3</div>`,
sym: [[String.raw`\(\beta = k_0 n_{\mathrm{eff}}\)`, "propagation constant of the guided mode in the grating"], [String.raw`\(\Lambda\)`, "grating period"], [String.raw`\(m\)`, "diffraction order"], [String.raw`\(\theta_m\)`, "angle of order m from the surface normal"], [String.raw`\(n_{\mathrm{c}}\)`, "cladding index, 1 for air"]],
how: [String.raw`Draw the membrane as a long bar and cut grooves into it with period \(\Lambda\). Draw the guided wave coming in from the left with \(\beta = k_0 n_{\mathrm{eff}}\).`,
String.raw`Pick two neighbouring teeth, \(\Lambda\) apart. The guided wave reaches the second one later, with the extra phase \(\beta\Lambda\).`,
String.raw`Draw a ray leaving each tooth at the angle \(\theta\) and a wavefront across them. The ray from the first tooth travels the extra path \(\Lambda\sin\theta\), worth the phase \(k_0 n_{\mathrm{c}}\Lambda\sin\theta\).`,
String.raw`The two waves add in phase when the two phases differ by \(2\pi\) times a whole number. Divide by \(\Lambda\): \(k_0 n_{\mathrm{c}}\sin\theta_m = \beta + m\,2\pi/\Lambda\), Eq. (2.2).`,
String.raw`Take \(m = -1\) and divide by \(k_0 = 2\pi/\lambda_0\): \(n_{\mathrm{c}}\sin\theta = n_{\mathrm{eff}} - \lambda_0/\Lambda\), so \(\Lambda = \lambda_0/(n_{\mathrm{eff}} - n_{\mathrm{c}}\sin\theta)\), Eq. (2.3).`,
String.raw`Check the other orders on a \(k_x\) line: only \(m = -1\) lands inside the band \(|k_x| \lt k_0 n_{\mathrm{c}}\), so one beam leaves upward (and one downward). Drag the period and the index.`],
say: String.raw`Light scattered by successive teeth adds in phase in the direction where \(k_0 n_{\mathrm{c}}\sin\theta_m = \beta + m\,2\pi/\Lambda\). Choosing \(m = -1\) toward the fiber gives \(\Lambda = \lambda_0/(n_{\mathrm{eff}} - n_{\mathrm{c}}\sin\theta)\).`,
num: String.raw`\(n_{\mathrm{eff}} = 2.8\), \(\lambda_0 = 800\) nm, air, \(\theta = 5^\circ\) (the fiber tilt of Sec. 3.6): \(\Lambda = 800/(2.8 - 0.087) \approx\) <b>295 nm</b>.<br>Vertical emission would need \(\lambda_0/n_{\mathrm{eff}} \approx\) 286 nm.`,
note: String.raw`<p><b>"Which way does the beam leave, forward or backward?"</b></p><p>From Eq. (2.2), \(\sin\theta_{-1} = (n_{\mathrm{eff}} - \lambda_0/\Lambda)/n_{\mathrm{c}}\). A period a little longer than \(\lambda_0/n_{\mathrm{eff}}\) gives a positive angle, tilted along the propagation direction, a shorter one a negative angle. The same order also leaves downward at the mirror angle, into the air below the membrane.</p>`,
r(fig, ctl) {
  const C = DFQ2_C, lam = 800;
  DFQ2_board(this, fig, ctl, {
    h: 420, sl: [["q21L", "Period Λ", 220, 420, 1, 310, x => x + " nm"], ["q21n", "Effective index n<sub>eff</sub>", 2.0, 3.2, 0.01, 2.8, x => x.toFixed(2)]],
    draw(k, v) {
      const L = v.q21L, ne = v.q21n, s1 = ne - lam / L, rad = Math.abs(s1) < 1, th = rad ? Math.asin(s1) : 0;
      const yb = 190, P = 92, xa = 250, xb = xa + P;
      let s = DFQ2_grating(30, 650, yb, 20, P, () => 0.4) + DFQ2_T(36, yb + 40, "GaAs membrane with grooves of period Λ", { fs: 12, c: C.mute });
      s += DFQ2_A(40, yb + 10, 110, yb + 10, C.orange, 2.6) + DFQ2_T(44, yb - 8, `β = k${DFQ2_s("0")}${DFQ2_ne}`, { fs: 12, c: C.orange });
      if (k >= 2) { s += `<circle cx="${xa}" cy="${yb}" r="5" fill="${C.ink}"/><circle cx="${xb}" cy="${yb}" r="5" fill="${C.ink}"/>` + DFQ2_A(xa, yb + 52, xb, yb + 52, C.ink, 1.4, null) + DFQ2_A(xb, yb + 52, xa, yb + 52, C.ink, 1.4) + DFQ2_T((xa + xb) / 2, yb + 68, "Λ", { a: "middle", b: 1 }) + DFQ2_T(xb + 12, yb + 64, "extra phase βΛ", { fs: 12, c: C.orange }); }
      if (k >= 3) {
        if (rad) {
          const d = [Math.sin(th), -Math.cos(th)], Lr = 140;
          s += DFQ2_A(xa, yb, xa + d[0] * Lr, yb + d[1] * Lr, C.green, 2.2) + DFQ2_A(xb, yb, xb + d[0] * Lr, yb + d[1] * Lr, C.green, 2.2);
          const p = P * Math.sin(th), q = [xa + d[0] * p, yb + d[1] * p];
          const ux = xb - q[0], uy = yb - q[1], un = Math.hypot(ux, uy) || 1; s += DFQ2_L(q[0] - 24 * ux / un, q[1] - 24 * uy / un, xb + 24 * ux / un, yb + 24 * uy / un, C.purple, 1.4, "5 4") + DFQ2_T(xb + 24 * ux / un + 4, yb + 24 * uy / un, "wavefront", { fs: 11, c: C.purple });
          s += DFQ2_L(xa, yb, q[0], q[1], C.red, 4) + DFQ2_T(xa - 8, yb - 50, "path Λ sin θ", { a: "end", fs: 12, c: C.red });
          s += DFQ2_L(xb, yb, xb, yb - 70, C.mute, 1, "3 3") + DFQ2_T(xb + 4 + 40 * Math.sin(th / 2), yb - 74, "θ", { fs: 13, c: C.green });
        } else s += DFQ2_T(340, yb - 60, `|β − 2π/Λ| > k${DFQ2_s("0")}n${DFQ2_s("c")}: no beam at this period`, { a: "middle", c: C.red, b: 1 });
      }
      if (k >= 4) s += DFQ2_R(400, 28, 268, 52, "#f7f9fc", "#cfd6e0") + DFQ2_T(534, 50, `k${DFQ2_s("0")}n${DFQ2_s("c")} sin θ${DFQ2_s("m")} = β + m 2π/Λ`, { a: "middle", fs: 14, b: 1 }) + DFQ2_T(534, 70, "Eq. (2.2)", { a: "middle", fs: 11, c: C.mute });
      if (k >= 5) s += DFQ2_R(400, 86, 268, 46, "#eef7f2", "#b9dccb") + DFQ2_T(534, 106, `m = −1:  Λ = λ${DFQ2_s("0")} / (${DFQ2_ne} − n${DFQ2_s("c")} sin θ)`, { a: "middle", fs: 13, b: 1, c: C.green }) + DFQ2_T(534, 124, "Eq. (2.3)", { a: "middle", fs: 11, c: C.mute });
      if (k >= 6) {
        const X = x => 340 + x * 88, y = 330, K = lam / L;
        s += DFQ2_axis(X, y, -3.5, 3.5) + DFQ2_K(ne, X, y, C.orange, "β", true);
        for (let m = -1; m >= -3; m--) { const kv = ne + m * K; if (kv < -3.6) break; const ok = Math.abs(kv) < 1; s += `<circle cx="${X(kv)}" cy="${y}" r="5" fill="${ok ? C.green : "#fff"}" stroke="${ok ? C.green : C.mute}" stroke-width="2"/>` + DFQ2_T(X(kv), y + 22, "m = " + m, { a: "middle", fs: 11, c: ok ? C.green : C.mute }); }
        s += DFQ2_T(X(0), y - 18, "light band", { a: "middle", fs: 11, c: C.green });
      }
      return s;
    },
    ro(v) { const s1 = v.q21n - 800 / v.q21L, k = 800 / v.q21L; const n = [-1, -2, -3].filter(m => Math.abs(v.q21n + m * k) < 1).length;
      return `<div><span>θ of m = −1</span><b>${Math.abs(s1) < 1 ? (Math.asin(s1) * 180 / Math.PI).toFixed(1) + "°" : "none"}</b></div><div><span>Λ for 5° (Eq. 2.3)</span><b>${(800 / (v.q21n - Math.sin(5 * Math.PI / 180))).toFixed(0)} nm</b></div><div><span>radiating orders</span><b>${n}</b></div>`; }
  });
}},

/* ---------------- Q2.2 ---------------- */
{s: "Q2.2", t: "Why tilt the fiber instead of emitting vertically?",
intu: String.raw`At \(\theta = 0\), Eq. (2.3) gives \(2\pi/\Lambda = \beta\), so the second order has \(\beta - 4\pi/\Lambda = -\beta\). That is exactly the propagation constant of the same mode traveling backward, so the grating couples the forward mode into the backward one and sends light back into the waveguide (Taillaert et al. 2006). The period is therefore detuned so that the beam leaves at a small angle, and the fiber is tilted by the same angle. The second order then misses \(-\beta\) by \(2k_0 n_{\mathrm{c}}\sin\theta\), and the back reflection is suppressed.`,
eq: String.raw`\[ \theta = 0: \quad \frac{2\pi}{\Lambda} = \beta \ \Rightarrow\ \beta - 2\,\frac{2\pi}{\Lambda} = -\beta \]\[ \theta \ne 0: \quad \beta - 2\,\frac{2\pi}{\Lambda} = -\beta + 2k_0 n_{\mathrm{c}} \sin\theta \]<div class="eqref">Sec. 2.3, after Taillaert et al. 2006</div>`,
sym: [[String.raw`\(2\pi/\Lambda\)`, "one grating kick along the surface"], [String.raw`\(-\beta\)`, "the same mode traveling backward"], [String.raw`\(2k_0 n_{\mathrm{c}}\sin\theta\)`, "how far the second order misses the backward mode"]],
how: [String.raw`Draw a \(k_x\) line in units of \(k_0\) and shade the band \(|k_x| \lt k_0 n_{\mathrm{c}}\), where light can leave into the air.`,
String.raw`Mark \(+\beta\) and \(-\beta\), the forward and the backward guided mode.`,
String.raw`Design for vertical emission: \(\Lambda = \lambda_0/n_{\mathrm{eff}}\), so one kick \(2\pi/\Lambda\) takes \(\beta\) exactly to 0, the middle of the band.`,
String.raw`A second kick takes 0 to \(-\beta\). The second order couples the forward mode straight into the backward mode: a Bragg reflection back into the waveguide.`,
String.raw`Now tilt (slider): the first order lands at \(k_0 n_{\mathrm{c}}\sin\theta\) and the second order misses \(-\beta\) by \(2k_0 n_{\mathrm{c}}\sin\theta\). The fiber is tilted by the same angle.`],
say: String.raw`For vertical emission the second order of the grating maps \(\beta\) onto \(-\beta\) and reflects light back into the waveguide. A small tilt detunes it, so the fiber is tilted by the same angle.`,
num: String.raw`Tilt \(5^\circ\) (Sec. 3.6): the second order misses \(-\beta\) by \(2\sin 5^\circ \approx\) <b>0.17</b> \(k_0\).<br>\(n_{\mathrm{eff}} = 2.8\), 800 nm: \(\Lambda\) = 286 nm vertical, 295 nm at \(5^\circ\).`,
note: String.raw`<p><b>"Does a vertical fiber also couple into the backward mode?"</b></p><p>Yes. Coming from a vertical fiber, the light has \(k_x = 0\), so one kick forward reaches \(+\beta\) and one kick backward reaches \(-\beta\) equally well, and the light splits into both directions. With a tilt, \(k_x + 2\pi/\Lambda = \beta\) while \(k_x - 2\pi/\Lambda\) misses \(-\beta\) by \(2k_x\), so the light goes one way.</p>`,
r(fig, ctl) {
  const C = DFQ2_C, ne = 2.8;
  DFQ2_board(this, fig, ctl, {
    h: 360, sl: [["q22t", "Fiber tilt θ", 0, 15, 0.5, 0, x => x.toFixed(1) + "°"]],
    draw(k, v) {
      const th = v.q22t * Math.PI / 180, sn = Math.sin(th), K = ne - sn, X = x => 340 + x * 92, y = 230;
      let s = DFQ2_grating(60, 620, 66, 14, 26, () => 0.45) + DFQ2_A(70, 98, 170, 98, C.orange, 2.4) + DFQ2_T(176, 102, "forward mode", { fs: 12, c: C.orange });
      s += DFQ2_axis(X, y, -3.3, 3.3);
      if (k >= 2) s += DFQ2_K(ne, X, y, C.orange, "+β", true) + DFQ2_K(-ne, X, y, C.orange, "−β", true);
      if (k >= 3) { s += DFQ2_arc(X, ne, ne - K, y, C.amber, -1, "−2π/Λ") + `<circle cx="${X(sn)}" cy="${y}" r="7" fill="none" stroke="${C.green}" stroke-width="2.5"/>`;
        const fx = 340 + 0, fy = 20; s += `<g transform="rotate(${v.q22t} 340 64)">` + DFQ2_R(fx - 14, fy, 28, 38, "#efe6d2", "#b89752") + DFQ2_A(340, 26, 340, 62, C.green, 2) + `</g>` + DFQ2_T(372, 34, th > 0.001 ? `fiber tilted ${v.q22t.toFixed(1)}°` : "fiber vertical", { fs: 12, c: C.green }); }
      if (k >= 4) { const k2 = ne - 2 * K, hit = Math.abs(k2 + ne) < 0.02;
        s += DFQ2_arc(X, ne - K, k2, y, C.amber, 1, "−2π/Λ", "6 4") + `<circle cx="${X(k2)}" cy="${y}" r="9" fill="none" stroke="${hit ? C.red : C.green}" stroke-width="2.5"/>`;
        s += DFQ2_T(340, 346, hit ? "second order hits −β: reflected back into the guide" : `second order misses −β by ${(2 * sn).toFixed(2)} k₀`, { a: "middle", fs: 13, b: 1, c: hit ? C.red : C.green });
        if (hit) s += DFQ2_A(560, 120, 420, 120, C.red, 2.4) + DFQ2_T(570, 124, "back reflection", { fs: 12, c: C.red, b: 1 }); }
      if (k >= 5) s += DFQ2_T(30, 172, `first order at k${DFQ2_s("x")} = sin θ = ${sn.toFixed(3)} k${DFQ2_s("0")}`, { fs: 12, c: C.green });
      return s;
    },
    ro(v) { const sn = Math.sin(v.q22t * Math.PI / 180); return `<div><span>period Λ (n<sub>eff</sub> = 2.8, 800 nm)</span><b>${(800 / (2.8 - sn)).toFixed(0)} nm</b></div><div><span>second order miss</span><b>${(2 * sn).toFixed(3)} k<sub>0</sub></b></div>`; }
  });
}},

/* ---------------- Q2.3 ---------------- */
{s: "Q2.3", t: "Why does a TM coupler need a longer period?",
intu: String.raw`In Eq. (2.3) the effective index sits in the denominator, \(\Lambda = \lambda_0/(n_{\mathrm{eff}} - n_{\mathrm{c}}\sin\theta)\). TM-like light has a lower \(n_{\mathrm{eff}}\) than TE-like light (Sec. 2.2), so the denominator is smaller and the period longer. Seen the other way round, a grating designed for TE-like light phase-matches TM-like light at a very different angle, or not at all, so the TM beam misses the fiber. This is why a grating designed for one polarization does not couple the other well.`,
eq: String.raw`\[ \Lambda_{\mathrm{TM}} = \frac{\lambda_0}{n_{\mathrm{eff}}^{\mathrm{TM}} - n_{\mathrm{c}}\sin\theta} \ \gt\ \Lambda_{\mathrm{TE}} = \frac{\lambda_0}{n_{\mathrm{eff}}^{\mathrm{TE}} - n_{\mathrm{c}}\sin\theta} \]\[ \text{TM light in the TE grating:} \quad n_{\mathrm{c}}\sin\theta' = n_{\mathrm{eff}}^{\mathrm{TM}} - \frac{\lambda_0}{\Lambda_{\mathrm{TE}}} \]<div class="eqref">Eq. (2.3), Sec. 2.3</div>`,
sym: [[String.raw`\(n_{\mathrm{eff}}^{\mathrm{TE}}, n_{\mathrm{eff}}^{\mathrm{TM}}\)`, "effective indices of the TE-like and TM-like modes in the grating"], [String.raw`\(\theta'\)`, "angle at which TM-like light leaves a grating designed for TE-like light"]],
how: [String.raw`Write Eq. (2.3) and circle \(n_{\mathrm{eff}}\) in the denominator.`,
String.raw`Draw the TE-like grating with its period \(\Lambda_{\mathrm{TE}}\).`,
String.raw`TM-like light has the lower \(n_{\mathrm{eff}}\): the denominator is smaller, so draw the TM-like grating below it with the longer period \(\Lambda_{\mathrm{TM}}\).`,
String.raw`Send TM-like light into the TE grating. On the \(k_x\) line, \(\beta_{\mathrm{TM}} - 2\pi/\Lambda_{\mathrm{TE}}\) lands far from the fiber direction: the TM beam leaves at a very different angle and misses the fiber.`,
String.raw`Conclude: one period serves one polarization. Drag the two indices to see how far apart the periods are.`],
say: String.raw`The TM-like mode has a lower effective index, and the period is \(\lambda_0\) over \(n_{\mathrm{eff}} - n_{\mathrm{c}}\sin\theta\), so its period is longer. A grating made for one polarization sends the other one off at the wrong angle.`,
num: String.raw`Round example: \(n_{\mathrm{eff}}\) 2.8 (TE-like) and 2.1 (TM-like), 800 nm, \(5^\circ\): \(\Lambda_{\mathrm{TE}} \approx\) <b>295 nm</b>, \(\Lambda_{\mathrm{TM}} \approx\) <b>397 nm</b>. TM light in the TE grating leaves at about \(-38^\circ\).`,
note: String.raw`<p><b>"Could one grating couple both polarizations?"</b></p><p>Not with one period at one angle, since the two phase-matching conditions need different periods. A grating for both polarizations needs extra freedom, for example a two-dimensional grating that sends the two polarizations into two different waveguides.</p>`,
r(fig, ctl) {
  const C = DFQ2_C, lam = 800, sn = Math.sin(5 * Math.PI / 180);
  DFQ2_board(this, fig, ctl, {
    h: 380, sl: [["q23a", "TE-like n<sub>eff</sub>", 2.4, 3.2, 0.01, 2.8, x => x.toFixed(2)], ["q23b", "TM-like n<sub>eff</sub>", 1.6, 2.6, 0.01, 2.1, x => x.toFixed(2)]],
    draw(k, v) {
      const nte = v.q23a, ntm = v.q23b, Lte = lam / (nte - sn), Ltm = lam / (ntm - sn), sc = 0.2;
      let s = DFQ2_R(30, 20, 250, 74, "#f7f9fc", "#cfd6e0") + DFQ2_T(80, 62, "Λ =", { a: "end", fs: 15, b: 1 }) + DFQ2_T(170, 44, "λ" + DFQ2_s("0"), { a: "middle", fs: 15, b: 1 }) + DFQ2_L(88, 54, 262, 54, DFQ2_C.ink, 1.4);
      s += DFQ2_T(126, 80, DFQ2_ne, { a: "end", fs: 15, b: 1 }) + DFQ2_T(142, 80, "− n" + DFQ2_s("c") + " sin θ", { fs: 15, b: 1 }) + `<ellipse cx="112" cy="75" rx="19" ry="13" fill="none" stroke="${C.red}" stroke-width="1.8"/>`;
      if (k >= 2) s += DFQ2_grating(310, 660, 34, 16, Lte * sc, () => 0.4, "#cfdcf2") + DFQ2_T(310, 28, `TE-like: Λ = ${Lte.toFixed(0)} nm`, { fs: 12, c: C.blue, b: 1 });
      if (k >= 3) s += DFQ2_grating(310, 660, 96, 16, Ltm * sc, () => 0.4, "#f5d7c8") + DFQ2_T(310, 90, `TM-like: Λ = ${Ltm.toFixed(0)} nm (longer)`, { fs: 12, c: C.orange, b: 1 });
      if (k >= 4) {
        const X = x => 340 + x * 92, y = 230, K = lam / Lte, kt = ntm - K;
        s += DFQ2_axis(X, y, -3.3, 3.3) + DFQ2_K(nte, X, y, C.blue, "β" + DFQ2_s("TE"), true) + DFQ2_K(ntm, X, y, C.orange, "β" + DFQ2_s("TM"), false);
        s += DFQ2_arc(X, nte, nte - K, y, C.blue, -1, "") + DFQ2_arc(X, ntm, kt, y, C.orange, 1, "", "6 4");
        s += `<circle cx="${X(sn)}" cy="${y}" r="7" fill="none" stroke="${C.green}" stroke-width="2.5"/>` + DFQ2_T(X(sn) + 10, y - 50, "fiber, 5°", { fs: 12, c: C.green });
        const ok = Math.abs(kt) < 1;
        s += DFQ2_T(340, 330, ok ? `TM leaves at θ' = ${(Math.asin(kt) * 180 / Math.PI).toFixed(0)}°, not 5°: misses the fiber` : "TM order outside the band: no TM beam at all", { a: "middle", fs: 13, b: 1, c: C.red });
      }
      if (k >= 5) s += DFQ2_T(340, 360, "one period serves one polarization", { a: "middle", fs: 13, b: 1, c: C.green });
      return s;
    },
    ro(v) { const Lte = 800 / (v.q23a - sn), Ltm = 800 / (v.q23b - sn), kt = v.q23b - 800 / Lte;
      return `<div><span>Λ TE-like</span><b>${Lte.toFixed(0)} nm</b></div><div><span>Λ TM-like</span><b>${Ltm.toFixed(0)} nm</b></div><div><span>TM in TE grating</span><b>${Math.abs(kt) < 1 ? (Math.asin(kt) * 180 / Math.PI).toFixed(1) + "°" : "no beam"}</b></div>`; }
  });
}},

/* ---------------- Q2.4 ---------------- */
{s: "Q2.4", t: "What is the fill factor, and what does a varying local fill factor do?",
intu: String.raw`The fill factor \(f\) is the fraction of each period that is left unetched, so each tooth is \(f\Lambda\) wide and each gap \((1 - f)\Lambda\). The \(n_{\mathrm{eff}}\) in Eq. (2.3) is an average over the etched and unetched parts of a period, set by the fill factor and the etch depth, so the fill factor and the period are chosen together (Zhou et al. 2018). The fill factor also sets how strongly each period scatters. In this thesis the gratings are etched through the membrane and the width of every tooth and gap is a design variable, so the local fill factor varies along the grating. That changes the scattering strength and the local phase matching from tooth to tooth, so the radiated beam can be shaped toward the Gaussian fiber mode instead of decaying exponentially.`,
eq: String.raw`\[ f = \frac{\text{tooth width}}{\Lambda}, \qquad \text{tooth } f\Lambda, \quad \text{gap } (1 - f)\Lambda \]\[ \Lambda = \frac{\lambda_0}{n_{\mathrm{eff}}(f, \text{etch depth}) - n_{\mathrm{c}}\sin\theta} \]<div class="eqref">Sec. 2.3 and Eq. (2.3)</div>`,
sym: [[String.raw`\(f\)`, "fill factor, unetched fraction of a period"], [String.raw`\(\bar n \approx \sqrt{f n_{\mathrm{s}}^2 + (1 - f)}\)`, "rough average index used on the board, slab index in the teeth and air in the gaps"], [String.raw`\(\alpha(x)\)`, "local scattering strength, the decay rate of the guided field"]],
how: [String.raw`Draw one period \(\Lambda\): a tooth \(f\Lambda\) wide that is left unetched and a gap \((1 - f)\Lambda\) wide that is etched.`,
String.raw`Write \(f\) = tooth width over period. For an etch through the membrane the gap is air.`,
String.raw`The guided light sees an average of tooth and gap, so \(n_{\mathrm{eff}}\) depends on \(f\) and on the etch depth. More GaAs means a higher \(n_{\mathrm{eff}}\) and a shorter period (slider \(f\)).`,
String.raw`Draw a uniform grating and the beam it emits: every period scatters the same fraction, so the guided power and the emitted field decay exponentially along the grating.`,
String.raw`Let the fill factor vary from tooth to tooth (slider): weak scattering at the start, stronger further on. The emitted field becomes bell shaped and overlaps the Gaussian fiber mode better.`],
say: String.raw`The fill factor is the unetched fraction of a period. It sets the average index, and so the period, and the scattering strength. Letting it vary along the grating shapes the emitted beam toward the Gaussian fiber mode.`,
num: String.raw`Board estimate with slab index 3.08 and air gaps: \(f = 0.8\) gives \(\bar n \approx 2.79\), \(f = 0.5\) gives 2.29.<br>Uniform grating: best overlap of the exponential beam with a Gaussian about <b>80 %</b> (computed here, fiber mode field diameter 1.53 µm as in Sec. 3.6).`,
note: String.raw`<p><b>"What is apodization?"</b></p><p>Varying the scattering strength along the grating so that the radiated field follows a chosen profile. Weak scattering at the start and stronger scattering further on turn the exponential tail into a bell shape that matches the fiber mode better. Zhou et al. 2018 use an apodized grating on GaAs membranes.</p>`,
r(fig, ctl) {
  const C = DFQ2_C, w0 = 0.765;
  const cache = {};
  const em = a => cache[a] || (cache[a] = DFQ2_emit(a, w0));
  DFQ2_board(this, fig, ctl, {
    h: 420, sl: [["q24f", "Fill factor f (one period)", 0.3, 0.9, 0.01, 0.7, x => x.toFixed(2)], ["q24a", "Vary f along the grating", 0, 1, 0.05, 0, x => x < 0.01 ? "uniform" : (100 * x).toFixed(0) + " %"]],
    draw(k, v) {
      const f = v.q24f, a = v.q24a, nb = Math.sqrt(f * DFQ2_NS * DFQ2_NS + (1 - f)), Lp = 800 / (nb - Math.sin(5 * Math.PI / 180));
      const x0 = 40, W = 260, y = 70;
      let s = DFQ2_R(x0, y, W * f, 26, C.gaas, C.gaasE) + DFQ2_R(x0 + W * f, y, W * (1 - f), 26, "#fff", "#cfd6e0", 1) + DFQ2_T(x0 + W * f / 2, y + 17, "tooth", { a: "middle", fs: 12 }) + DFQ2_T(x0 + W * f + W * (1 - f) / 2, y + 17, "gap", { a: "middle", fs: 12, c: C.mute });
      s += DFQ2_A(x0, y - 12, x0 + W, y - 12, C.ink, 1.2) + DFQ2_A(x0 + W, y - 12, x0, y - 12, C.ink, 1.2) + DFQ2_T(x0 + W / 2, y - 18, "Λ", { a: "middle", b: 1 });
      s += DFQ2_T(x0 + W * f / 2, y + 44, "fΛ", { a: "middle", fs: 12, c: C.blue }) + DFQ2_T(x0 + W * f + W * (1 - f) / 2, y + 44, "(1 − f)Λ", { a: "middle", fs: 12, c: C.mute });
      if (k >= 2) s += DFQ2_T(330, 74, `f = tooth / Λ = ${f.toFixed(2)}`, { fs: 14, b: 1 }) + DFQ2_T(330, 94, "etched through: the gap is air", { fs: 12, c: C.mute });
      if (k >= 3) s += DFQ2_T(330, 124, `average index n̄ ≈ ${nb.toFixed(2)}  →  Λ ≈ ${Lp.toFixed(0)} nm at 5°`, { fs: 13, c: C.blue });
      if (k >= 4) {
        const r = em(k >= 5 ? a : 0), amax = Math.max(...r.al), X = x => 60 + x / 7 * 580;
        s += DFQ2_grating(60, 640, 170, 16, 580 / 22, x => 0.12 + 0.55 * r.al[Math.min(350, Math.round((x - 60) / 580 * 350))] / amax);
        s += DFQ2_T(60, 162, k >= 5 && a > 0.3 ? "small gaps first (weak scattering), wider further on" : "uniform grating", { fs: 12, c: C.mute });
        const PY = e => 370 - e * 150, emax = Math.max(...r.E);
        s += DFQ2_L(60, 370, 640, 370, C.ink, 1) + DFQ2_T(640, 390, "x along the grating", { a: "end", fs: 11, c: C.mute });
        // Gaussian target placed at its best position for this profile
        let bc = 0, bo = -1; for (let c = 0; c < 6; c += 0.05) { let s1 = 0, g2 = 0; r.xs.forEach((x, i) => { const g = Math.exp(-Math.pow((x - c) / w0, 2)); s1 += r.E[i] * g; g2 += g * g; }); const o = s1 * s1 / g2; if (o > bo) { bo = o; bc = c; } }
        s += DFQ2_P(r.xs.map(x => [X(x), PY(Math.exp(-Math.pow((x - bc) / w0, 2)))]), C.green, 2, "6 4") + DFQ2_P(r.xs.map((x, i) => [X(x), PY(r.E[i] / emax)]), C.blue, 2.6);
        s += DFQ2_T(640, 214, "emitted field", { a: "end", fs: 12, c: C.blue }) + DFQ2_T(640, 232, "Gaussian fiber mode (dashed)", { a: "end", fs: 12, c: C.green }) + DFQ2_T(640, 254, `overlap ${(100 * r.ov).toFixed(0)} %`, { a: "end", fs: 14, b: 1, c: C.ink });
      }
      return s;
    },
    ro(v, k) { const f = v.q24f, nb = Math.sqrt(f * DFQ2_NS * DFQ2_NS + (1 - f)), r = em(k >= 5 ? v.q24a : 0); return `<div><span>average index (rough)</span><b>${nb.toFixed(2)}</b></div><div><span>period for 5°</span><b>${(800 / (nb - Math.sin(5 * Math.PI / 180))).toFixed(0)} nm</b></div><div><span>overlap with Gaussian</span><b>${(100 * r.ov).toFixed(0)} %</b></div>`; }
  });
}},

/* ---------------- Q2.5 ---------------- */
{s: "Q2.5", t: "What limits the coupling efficiency of a simple grating?",
intu: String.raw`The coupling efficiency (CE) is the fraction of the guided power that ends up in the fiber mode, and Taillaert et al. identify two factors that limit it (Taillaert et al. 2006). First, the grating radiates downward as well as upward. A grating etched through a membrane with air above and below radiates about equally in both directions, so without a mirror about half of the radiated power is lost. Second, the field radiated by a uniform grating decays roughly exponentially along the grating and does not match the Gaussian fiber mode. A mirror below the grating addresses the first factor, a varying fill factor the second. Light reflected back into the waveguide or transmitted past the grating is lost as well.`,
eq: String.raw`\[ \mathrm{CE} \approx \eta_{\mathrm{rad}}\;\eta_{\mathrm{up}}\;\eta_{\mathrm{ov}} \]\[ \eta_{\mathrm{ov}} = \frac{\left|\int E_{\mathrm{up}}\, E_{\mathrm{fib}}^{*}\, dx\right|^2}{\int |E_{\mathrm{up}}|^2\, dx \int |E_{\mathrm{fib}}|^2\, dx} \]<div class="eqnote">A board bookkeeping of the two factors of Taillaert et al. 2006, not a thesis equation.</div><div class="eqref">Sec. 2.3</div>`,
sym: [[String.raw`\(\eta_{\mathrm{rad}}\)`, "fraction of the guided power that the grating radiates (not reflected or transmitted)"], [String.raw`\(\eta_{\mathrm{up}}\)`, "fraction of the radiated power that goes up, the directionality"], [String.raw`\(\eta_{\mathrm{ov}}\)`, "overlap of the upward beam with the fiber mode"], [String.raw`\(E_{\mathrm{fib}}\)`, "Gaussian field of the fiber mode at the chip"]],
how: [String.raw`Draw the guided power arriving at the grating as one bar of height 1.`,
String.raw`Split it: most is radiated, a little goes on past the grating or is reflected back (\(\eta_{\mathrm{rad}}\)).`,
String.raw`Split the radiated part into up and down. With air on both sides about half goes down and is lost: the first factor, \(\eta_{\mathrm{up}}\).`,
String.raw`Of the upward light, only the part that overlaps the Gaussian fiber mode is collected. A uniform grating's exponential beam overlaps it by about 80 % at best: the second factor, \(\eta_{\mathrm{ov}}\).`,
String.raw`Multiply the three. A mirror raises \(\eta_{\mathrm{up}}\), a varying fill factor raises \(\eta_{\mathrm{ov}}\). Play with the sliders.`],
say: String.raw`Two things limit a simple grating: it radiates down as much as up, so half is lost without a mirror, and its exponentially decaying beam does not match the Gaussian fiber mode.`,
num: String.raw`No mirror, symmetric membrane: \(\eta_{\mathrm{up}} \approx 0.5\). Uniform grating: \(\eta_{\mathrm{ov}} \lesssim 0.8\). Example \(0.9 \times 0.5 \times 0.8 \approx\) <b>0.36</b>.`,
note: String.raw`<p><b>"Why does a symmetric membrane radiate equally up and down?"</b></p><p>The membrane with an etched-through grating is mirror symmetric in \(z\), so nothing distinguishes up from down for the scattered light. A mirror below, a partial etch from one side or an overlay breaks the symmetry and makes the grating directional.</p>`,
r(fig, ctl) {
  const C = DFQ2_C;
  DFQ2_board(this, fig, ctl, {
    h: 360, sl: [["q25r", "Radiated fraction η<sub>rad</sub>", 0.5, 1, 0.01, 0.9, x => x.toFixed(2)], ["q25u", "Up fraction η<sub>up</sub>", 0.3, 1, 0.01, 0.5, x => x.toFixed(2)], ["q25o", "Overlap η<sub>ov</sub>", 0.4, 1, 0.01, 0.8, x => x.toFixed(2)]],
    draw(k, v) {
      const H = 220, y0 = 70, W = 70, cols = [40, 210, 380, 550];
      const r = v.q25r, u = v.q25u, o = v.q25o;
      const bar = (x, y, h, c, lab, sub) => DFQ2_R(x, y, W, Math.max(h, 1), c) + (h > 16 ? DFQ2_T(x + W / 2, y + h / 2 + 5, lab, { a: "middle", fs: 12, b: 1, c: "#fff" }) : "") + (sub ? DFQ2_T(x + W / 2, y + h + 16, sub, { a: "middle", fs: 11, c: C.mute }) : "");
      const band = (x1, y1, h1, x2, y2, h2, c) => `<path d="M${x1} ${y1} C${(x1 + x2) / 2} ${y1} ${(x1 + x2) / 2} ${y2} ${x2} ${y2} L${x2} ${y2 + h2} C${(x1 + x2) / 2} ${y2 + h2} ${(x1 + x2) / 2} ${y1 + h1} ${x1} ${y1 + h1} Z" fill="${c}" fill-opacity="0.18"/>`;
      let s = bar(cols[0], y0, H, C.orange, "1") + DFQ2_T(cols[0] + W / 2, y0 - 10, "guided", { a: "middle", fs: 12, b: 1 });
      if (k >= 2) { s += band(cols[0] + W, y0, H * r, cols[1], y0, H * r, C.blue) + bar(cols[1], y0, H * r, C.blue, r.toFixed(2)) + DFQ2_T(cols[1] + W / 2, y0 - 10, "radiated", { a: "middle", fs: 12, b: 1 });
        s += bar(cols[1], y0 + H * r + 8, H * (1 - r), C.mute, "") + DFQ2_T(cols[1] + W + 6, y0 + H * r + 8 + H * (1 - r) / 2 + 4, "reflected, transmitted", { fs: 11, c: C.mute }); }
      if (k >= 3) { s += band(cols[1] + W, y0, H * r * u, cols[2], y0, H * r * u, C.green) + bar(cols[2], y0, H * r * u, C.green, (r * u).toFixed(2)) + DFQ2_T(cols[2] + W / 2, y0 - 10, "up", { a: "middle", fs: 12, b: 1 });
        s += bar(cols[2], y0 + H * r * u + 8, H * r * (1 - u), C.red, (r * (1 - u)).toFixed(2)) + DFQ2_T(cols[2] + W + 6, y0 + H * r * u + 8 + H * r * (1 - u) / 2 + 4, "down: lost", { fs: 11, c: C.red, b: 1 }); }
      if (k >= 4) { s += band(cols[2] + W, y0, H * r * u * o, cols[3], y0, H * r * u * o, C.purple) + bar(cols[3], y0, H * r * u * o, C.purple, (r * u * o).toFixed(2)) + DFQ2_T(cols[3] + W / 2, y0 - 10, "into fiber", { a: "middle", fs: 12, b: 1 });
        s += bar(cols[3], y0 + H * r * u * o + 8, H * r * u * (1 - o), C.amber, "") + DFQ2_T(cols[3] + W / 2, y0 + H * r * u * o + 8 + H * r * u * (1 - o) + 16, "mismatch", { a: "middle", fs: 11, c: C.amber }); }
      if (k >= 5) s += DFQ2_T(340, 338, `CE ≈ ${r.toFixed(2)} × ${u.toFixed(2)} × ${o.toFixed(2)} = ${(r * u * o).toFixed(2)}`, { a: "middle", fs: 15, b: 1, c: C.purple });
      if (k >= 3) s += DFQ2_T(cols[2] + W / 2, 40, "factor 1", { a: "middle", fs: 11, c: C.red });
      if (k >= 4) s += DFQ2_T(cols[3] + W / 2, 40, "factor 2", { a: "middle", fs: 11, c: C.amber });
      return s;
    },
    ro(v) { return `<div><span>coupling efficiency</span><b>${(v.q25r * v.q25u * v.q25o).toFixed(2)}</b></div><div><span>lost downward</span><b>${(v.q25r * (1 - v.q25u)).toFixed(2)}</b></div>`; }
  });
}},

/* ---------------- Q2.6 ---------------- */
{s: "Q2.6", t: String.raw`Why quarter-wave layers, and where does the \(\pi\) come from (Eqs. 2.4 and 2.5)?`,
intu: String.raw`At normal incidence the field reflection from index \(n_1\) into \(n_2\) is \(r = (n_1 - n_2)/(n_1 + n_2)\), Eq. (2.4). It is negative, a phase shift of \(\pi\), when the light enters the higher index and positive when it enters the lower index, so its sign alternates from one interface to the next. Each layer is a quarter wavelength thick in its own material, Eq. (2.5), so one pass adds the phase \(\pi/2\) and a round trip adds \(\pi\). Adding the interface phase and the round trips, every reflected wave returns with the phase \(\pi\) modulo \(2\pi\), and all reflections add in phase at \(\lambda_0\) (Gačević and Vukmirović 2018).`,
eq: String.raw`\[ r = \frac{n_1 - n_2}{n_1 + n_2}, \qquad d_H = \frac{\lambda_0}{4 n_H}, \quad d_L = \frac{\lambda_0}{4 n_L} \]\[ \phi_j = \underbrace{\pi \text{ or } 0}_{\text{interface } j} + \underbrace{(j - 1)\,\pi}_{\text{round trips}} \equiv \pi \pmod{2\pi} \]<div class="eqref">Eqs. (2.4) and (2.5), Fig. 2.5 after Gačević and Vukmirović 2018</div>`,
sym: [[String.raw`\(r\)`, "field reflection coefficient at normal incidence"], [String.raw`\(n_H, n_L\)`, "high and low index (GaAs and AlGaAs)"], [String.raw`\(d_H, d_L\)`, "quarter-wave thicknesses"], [String.raw`\(\phi_j\)`, "phase of the wave reflected at interface j, seen from the front"]],
how: [String.raw`Draw the stack as vertical stripes: air, then H, L, H, L, ... with the light coming in from the left.`,
String.raw`At each interface write the sign of \(r\) from Eq. (2.4): into a higher index \(r \lt 0\) (phase \(\pi\)), into a lower index \(r \gt 0\) (phase 0). The signs alternate.`,
String.raw`Make each layer a quarter wave thick, \(d = \lambda_0/(4n)\): one pass is \(\pi/2\), a round trip \(\pi\). Write \(\pi\) under every layer.`,
String.raw`Add up for each reflection: its interface phase plus \(\pi\) for every layer it has crossed twice. Every one comes back with \(\pi\) (modulo \(2\pi\)).`,
String.raw`Draw the reflections as arrows head to tail: at \(\lambda_0\) they line up and add. Move the wavelength away from \(\lambda_0\) and they fan out, so the sum shrinks.`],
say: String.raw`The reflection coefficient changes sign at every interface, and a quarter-wave layer adds \(\pi\) per round trip, so the two effects cancel and every reflection comes back with the same phase. That is why the stack reflects strongly at \(\lambda_0\).`,
num: String.raw`\(n_H = 3.5\), \(n_L = 3.0\), \(\lambda_0 = 800\) nm: \(d_H \approx\) <b>57 nm</b>, \(d_L \approx\) <b>67 nm</b>.<br>\(r\): air to H \(\approx -0.56\), H to L \(\approx +0.077\), L to H \(\approx -0.077\).`,
note: String.raw`<p><b>"What happens away from \(\lambda_0\)?"</b></p><p>The round-trip phase becomes \(\pi\lambda_0/\lambda\) instead of \(\pi\), so the reflections drift out of phase and the sum falls. Within the stopband of Eq. (2.7) the stack still reflects strongly, outside it the reflectance drops and oscillates.</p>`,
r(fig, ctl) {
  const C = DFQ2_C, nH = 3.5, nL = 3.0, l0 = 800;
  DFQ2_board(this, fig, ctl, {
    h: 420, sl: [["q26l", "Wavelength λ", 600, 1000, 2, 800, x => x + " nm"]],
    draw(k, v) {
      const lam = v.q26l, sc = 1.25, y0 = 60, Hh = 110;
      const layers = [["air", 1], ["H", nH], ["L", nL], ["H", nH], ["L", nL], ["H", nH], ["L", nL]];
      let x = 30, xs = [], s = "";
      layers.forEach(([nm, n], i) => { const w = i === 0 ? 70 : sc * l0 / (4 * n); s += DFQ2_R(x, y0, w, Hh, nm === "air" ? "#ffffff" : nm === "H" ? C.gaas : "#efd9a8", C.gaasE); s += DFQ2_T(x + w / 2, y0 + Hh / 2 + 5, nm, { a: "middle", fs: 13, b: 1 }); if (i > 0) xs.push(x); x += w; });
      s += DFQ2_T(x + 10, y0 + Hh / 2 + 5, "...", { fs: 18, b: 1 }) + DFQ2_A(36, y0 + 20, 90, y0 + 20, C.blue, 2.2) + DFQ2_T(36, y0 - 8, "incident", { fs: 12, c: C.blue });
      const ns = [1, nH, nL, nH, nL, nH, nL], rs = xs.map((_, j) => (ns[j] - ns[j + 1]) / (ns[j] + ns[j + 1]));
      if (k >= 2) rs.forEach((r, j) => { s += DFQ2_T(xs[j], y0 - 10, r < 0 ? "π" : "0", { a: "middle", fs: 14, b: 1, c: r < 0 ? C.red : C.green }); });
      if (k >= 2) s += DFQ2_T(xs[xs.length - 1] + 70, y0 - 10, "interface phase", { fs: 11, c: C.mute });
      if (k >= 3) for (let j = 0; j < xs.length - 1; j++) s += DFQ2_T((xs[j] + xs[j + 1]) / 2, y0 + Hh + 18, "+π", { a: "middle", fs: 13, c: C.purple });
      if (k >= 3) s += DFQ2_T(xs[xs.length - 1] + 70, y0 + Hh + 18, "round trip", { fs: 11, c: C.purple });
      const rt = Math.PI * l0 / lam, ph = rs.map((r, j) => (r < 0 ? Math.PI : 0) + j * rt);
      if (k >= 4) ph.forEach((p, j) => { const m = ((p % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI); s += DFQ2_T(xs[j], y0 + Hh + 44, (m / Math.PI).toFixed(2) + "π", { a: "middle", fs: 12, b: 1, c: Math.abs(m - Math.PI) < 0.05 ? C.green : C.amber }); });
      if (k >= 4) s += DFQ2_T(xs[xs.length - 1] + 70, y0 + Hh + 44, "total, mod 2π", { fs: 11, c: C.mute });
      if (k >= 5) {
        let cx = 560, cy = 330, sx = 0, sy = 0; const S = 250;
        s += DFQ2_T(30, 262, "reflections head to tail (single bounces, a sketch)", { fs: 12, c: C.mute }) + DFQ2_L(120, cy, 600, cy, C.grid, 1);
        rs.forEach((r, j) => { const a = ph[j], L = Math.abs(r) * S, dx = L * Math.cos(a), dy = -L * Math.sin(a); s += DFQ2_A(cx + sx, cy + sy, cx + sx + dx, cy + sy + dy, j === 0 ? C.blue : C.purple, 2) + `<circle cx="${(cx + sx).toFixed(1)}" cy="${(cy + sy).toFixed(1)}" r="2.5" fill="${C.ink}"/>`; sx += dx; sy += dy; });
        s += DFQ2_A(cx, cy, cx + sx, cy + sy, C.green, 3, "5 3") + DFQ2_T(cx + 8, cy + 34, "sum", { fs: 12, c: C.green, b: 1 }) + DFQ2_T(cx - 150, cy + 34, "entry reflection (blue), inner ones (purple)", { a: "end", fs: 11, c: C.mute });
      }
      return s;
    },
    ro(v) { const lam = v.q26l, rt = 180 * 800 / lam; return `<div><span>round trip per layer</span><b>${rt.toFixed(0)}°</b></div><div><span>d<sub>H</sub>, d<sub>L</sub></span><b>${(800 / 14).toFixed(1)}, ${(800 / 12).toFixed(1)} nm</b></div>`; }
  });
}},

/* ---------------- Q2.7 ---------------- */
{s: "Q2.7", t: "How many DBR pairs do you need, and over what band does the mirror work (Eqs. 2.6 and 2.7)?",
intu: String.raw`For \(N\) pairs with air on both sides the peak reflectance is Eq. (2.6), and only the ratio \(n_H/n_L\) enters, raised to the power \(2N\). GaAs and AlGaAs have a small contrast, \(n_H/n_L\) about 1.17, so each internal interface reflects less than a tenth of the field and many pairs are needed: about 20 for 99 % (Gačević and Vukmirović 2018). The high reflectance holds only over the stopband, whose full width Eq. (2.7) grows with the contrast. With a small contrast the stopband is narrow, so the mirror must be centered on the design wavelength.`,
eq: String.raw`\[ R = \left[\frac{1 - (n_H/n_L)^{2N}}{1 + (n_H/n_L)^{2N}}\right]^2 \]\[ \Delta\lambda_0 \approx \frac{4\lambda_0}{\pi} \arcsin\!\left(\frac{n_H - n_L}{n_H + n_L}\right) \]<div class="eqref">Eqs. (2.6) and (2.7), after Gačević and Vukmirović 2018, Eqs. (2) and (3)</div>`,
sym: [[String.raw`\(N\)`, "number of H/L pairs"], [String.raw`\(R\)`, "peak reflectance at the design wavelength"], [String.raw`\(\Delta\lambda_0\)`, "full width of the stopband"]],
how: [String.raw`Write Eq. (2.6) and underline \((n_H/n_L)^{2N}\): only the index ratio and the number of pairs enter.`,
String.raw`Plot \(R\) against \(N\) for GaAs/AlGaAs, and for comparison a high-contrast pair (dashed).`,
String.raw`Draw the 99 % line and read off \(N\): the small contrast needs about 20 pairs, the high contrast only a few.`,
String.raw`Next to it draw the spectrum for the chosen \(N\): a flat top of high reflectance and oscillations outside (computed with a transfer matrix).`,
String.raw`Mark the stopband width from Eq. (2.7). It is narrow for a small contrast, so the mirror must be centered on the wavelength. Drag \(N\) and \(n_L\).`],
say: String.raw`The peak reflectance depends on \((n_H/n_L)^{2N}\). GaAs and AlGaAs differ by only about 15 % in index, so we need around 20 pairs for 99 %, and the stopband is only tens of nanometres wide.`,
num: String.raw`3.5/3.0, air on both sides: \(R \approx\) <b>0.83, 0.95, 0.99</b> for \(N\) = 10, 14, 20. Stopband about <b>78 nm</b> at 800 nm.<br>A 3.5/1.5 pair passes 99 % with 4 pairs.`,
note: String.raw`<p><b>"Does the 5° beam angle change the mirror?"</b></p><p>Barely. At oblique incidence the round-trip phase in each layer scales with \(\cos\theta\) inside the layer, which shifts the stopband to shorter wavelengths. For a beam a few degrees from the normal the angle inside the high-index layers is about one degree, so the shift is tiny.</p>`,
r(fig, ctl) {
  const C = DFQ2_C, nH = 3.5, l0 = 800;
  const Rf = (nL, N) => { const x = Math.pow(nH / nL, 2 * N); return Math.pow((1 - x) / (1 + x), 2); };
  DFQ2_board(this, fig, ctl, {
    h: 400, sl: [["q27N", "Pairs N", 1, 30, 1, 14], ["q27l", "Low index n<sub>L</sub>", 1.5, 3.4, 0.01, 3.0, x => x.toFixed(2)]],
    draw(k, v) {
      const N = v.q27N, nL = v.q27l;
      let s = DFQ2_R(30, 22, 300, 40, "#f7f9fc", "#cfd6e0") + DFQ2_T(180, 48, `R = [(1 − r²ᴺ)/(1 + r²ᴺ)]²,  r = n${DFQ2_s("H")}/n${DFQ2_s("L")}`, { a: "middle", fs: 13, b: 1 });
      if (k >= 1) s += DFQ2_L(124, 54, 162, 54, C.red, 2);
      const PX = n => 60 + (n - 1) / 29 * 250, PY = R => 360 - R * 230;
      if (k >= 2) { s += DFQ2_L(60, 360, 310, 360, C.ink, 1) + DFQ2_L(60, 360, 60, 96, C.ink, 1) + DFQ2_T(185, 394, "pairs N", { a: "middle", fs: 11 }) + DFQ2_T(54, 104, "R", { a: "end", fs: 12 });
        [1, 10, 20, 30].forEach(n => { s += DFQ2_T(PX(n), 374, String(n), { a: "middle", fs: 10, c: C.mute }); });
        const ns = range(1, 30, 59);
        s += DFQ2_P(ns.map(n => [PX(n), PY(Rf(1.5, n))]), C.mute, 2, "6 4") + DFQ2_P(ns.map(n => [PX(n), PY(Rf(nL, n))]), C.blue, 2.6) + `<circle cx="${PX(N)}" cy="${PY(Rf(nL, N))}" r="5" fill="${C.blue}"/>`;
        s += DFQ2_T(PX(2) + 4, PY(0.6), "3.5/1.5", { fs: 11, c: C.mute }) + DFQ2_T(PX(16), PY(Rf(nL, 16)) + 22, `3.5/${nL.toFixed(2)}`, { fs: 11, c: C.blue }); }
      if (k >= 3) { let n99 = 0; for (let n = 1; n <= 200; n++) if (Rf(nL, n) > 0.99) { n99 = n; break; }
        s += DFQ2_L(60, PY(0.99), 310, PY(0.99), C.green, 1.4, "4 3") + DFQ2_T(310, PY(0.99) - 8, `99 %: N = ${n99}`, { a: "end", fs: 12, c: C.green, b: 1 }); }
      if (k >= 4) {
        const QX = l => 370 + (l - 600) / 400 * 280, lams = range(600, 1000, 241), Rs = lams.map(l => C2.tmmR(1, C2.dbrLayers(nH, nL, N, l0), 1, l));
        s += DFQ2_L(370, 360, 650, 360, C.ink, 1) + DFQ2_L(370, 360, 370, 96, C.ink, 1) + DFQ2_T(510, 394, "λ (nm)", { a: "middle", fs: 11 });
        [600, 800, 1000].forEach(l => { s += DFQ2_T(QX(l), 374, String(l), { a: "middle", fs: 10, c: C.mute }); });
        s += DFQ2_P(lams.map((l, i) => [QX(l), PY(Rs[i])]), C.blue, 2) + DFQ2_T(376, 90, `N = ${N}, transfer matrix`, { fs: 11, c: C.blue });
      }
      if (k >= 5) { const dl = 4 * l0 / Math.PI * Math.asin((nH - nL) / (nH + nL)), QX = l => 370 + (l - 600) / 400 * 280;
        s += DFQ2_L(QX(l0 - dl / 2), 110, QX(l0 - dl / 2), 360, C.purple, 1.4, "4 3") + DFQ2_L(QX(l0 + dl / 2), 110, QX(l0 + dl / 2), 360, C.purple, 1.4, "4 3");
        s += DFQ2_A(QX(l0 - dl / 2), 116, QX(l0 + dl / 2), 116, C.purple, 1.2) + DFQ2_A(QX(l0 + dl / 2), 116, QX(l0 - dl / 2), 116, C.purple, 1.2) + DFQ2_T(QX(l0), 108, `Δλ ≈ ${dl.toFixed(0)} nm`, { a: "middle", fs: 12, b: 1, c: C.purple }); }
      return s;
    },
    ro(v) { const R = Rf(v.q27l, v.q27N), dl = 4 * 800 / Math.PI * Math.asin((nH - v.q27l) / (nH + v.q27l)); return `<div><span>peak R (Eq. 2.6)</span><b>${(100 * R).toFixed(1)} %</b></div><div><span>n<sub>H</sub>/n<sub>L</sub></span><b>${(nH / v.q27l).toFixed(3)}</b></div><div><span>stopband (Eq. 2.7)</span><b>${dl.toFixed(0)} nm</b></div>`; }
  });
}},

/* ---------------- Q2.8 ---------------- */
{s: "Q2.8", t: "Why does the air-gap thickness matter so much, and why does the efficiency repeat every half wavelength of gap?",
intu: String.raw`Light that the grating sends downward crosses the air gap, is reflected by the DBR and returns to the grating, where it interferes with the light radiated directly upward. The distance between the grating and the DBR sets the phase of the returning light relative to the upward light, and this phase decides whether the two add or cancel (Taillaert et al. 2006). The light crosses the gap twice, so adding \(\lambda_0/2\) to the gap adds a full wavelength to the path and brings the phase back: the efficiency repeats every half wavelength of gap. The distance also changes how strongly the grating scatters, so it must be chosen together with the grating.`,
eq: String.raw`\[ \Delta\phi = 2 k_0\, t_{\mathrm{box}} + \phi_{\mathrm{DBR}}, \qquad \Delta\phi \to \Delta\phi + 2\pi \ \text{ when } \ t_{\mathrm{box}} \to t_{\mathrm{box}} + \frac{\lambda_0}{2} \]\[ \frac{P_{\mathrm{up}}}{P_{\mathrm{up}}^{\mathrm{no\ mirror}}} \approx \left|1 + \sqrt{R}\, e^{i\Delta\phi}\right|^2 \]<div class="eqnote">Two-beam model for the board, with \(\phi_{\mathrm{DBR}} = \pi\) from Fig. 2.5. Not a thesis equation: the thesis states this physics in words (Sec. 2.4).</div>`,
sym: [[String.raw`\(t_{\mathrm{box}}\)`, "thickness of the air gap between membrane and DBR"], [String.raw`\(\phi_{\mathrm{DBR}}\)`, "phase of the DBR reflection, \(\pi\) at the design wavelength"], [String.raw`\(R\)`, "DBR reflectance"], [String.raw`\(\Delta\phi\)`, "phase of the returning light relative to the light that went straight up"]],
how: [String.raw`Draw the grating, the air gap of thickness \(t_{\mathrm{box}}\) below it and the DBR under the gap.`,
String.raw`Draw the beam the grating radiates upward and the beam it radiates downward.`,
String.raw`Follow the downward beam: it crosses the gap, reflects from the DBR with phase \(\pi\), and crosses the gap again. It returns with the extra phase \(\Delta\phi = 2k_0 t_{\mathrm{box}} + \pi\).`,
String.raw`At the grating it joins the light going straight up. Draw the two as arrows head to tail: in phase they add, out of phase they cancel.`,
String.raw`Plot the upward light against \(t_{\mathrm{box}}\): it repeats every \(\lambda_0/2\), because the light crosses the gap twice. Drag the gap.`,
String.raw`Write the caveat: the gap also changes how strongly the grating scatters, so it is optimized together with the grating, not on its own.`],
say: String.raw`The downward light comes back from the DBR with a phase set by twice the gap, and it interferes with the light going up. Because the path is a double pass, the efficiency repeats every half wavelength of gap, and the gap is chosen together with the grating.`,
num: String.raw`\(\lambda_0 = 800\) nm: repeats every <b>400 nm</b> of gap. Two-beam model with \(\phi_{\mathrm{DBR}} = \pi\): upward light strongest near \(t_{\mathrm{box}}\) = 200, 600, 1000 nm, weakest near 0, 400, 800 nm.`,
note: String.raw`<p><b>"Why not simply set the gap from this formula?"</b></p><p>The two-beam model leaves out the phase picked up inside the membrane, the angle of the beam, repeated bounces between grating and mirror, and the change in scattering strength. These shift the best gap, so the gap is optimized together with the grating in the simulation (Taillaert et al. 2006).</p>`,
r(fig, ctl) {
  const C = DFQ2_C, l0 = 800;
  const up = (t, R) => { const ph = 4 * Math.PI * t / l0 + Math.PI, a = Math.sqrt(R); return (1 + a * a + 2 * a * Math.cos(ph)); };
  DFQ2_board(this, fig, ctl, {
    h: 420, live: true, sl: [["q28t", "Air gap t<sub>box</sub>", 0, 1600, 10, 300, x => x + " nm"], ["q28r", "DBR reflectance R", 0, 1, 0.01, 0.95, x => x.toFixed(2)]],
    draw(k, v, tt) {
      const t = v.q28t, R = v.q28r, yg = 110, gp = 26 + t * 0.12, yd = yg + 14 + gp;
      let s = DFQ2_grating(30, 330, yg, 14, 22, () => 0.45) + DFQ2_T(226, yg - 8, "grating", { fs: 12 });
      for (let i = 0; i < 8; i++) s += DFQ2_R(30, yd + i * 8, 300, 8, i % 2 ? "#efd9a8" : C.gaas);
      s += DFQ2_T(36, yd + 80, "DBR", { fs: 12, b: 1 }) + DFQ2_A(320, yg + 14, 320, yd, C.ink, 1.2) + DFQ2_A(320, yd, 320, yg + 14, C.ink, 1.2) + DFQ2_T(314, (yg + yd) / 2 + 12, "t" + DFQ2_s("box"), { a: "end", fs: 13 });
      const flow = (x1, y1, x2, y2, c, w) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" stroke-dasharray="10 6" stroke-dashoffset="${(-tt * 30).toFixed(1)}"/>` + DFQ2_A(x1, y1, x2, y2, c, 0.01);
      if (k >= 2) { s += flow(110, yg, 110, 40, C.green, 3) + DFQ2_A(110, 50, 110, 36, C.green, 2.4) + DFQ2_T(118, 50, "up", { fs: 12, c: C.green, b: 1 });
        s += flow(170, yg + 14, 170, yd - 2, C.orange, 3) + DFQ2_A(170, yd - 16, 170, yd - 2, C.orange, 2.4) + DFQ2_T(178, yg + 32, "down", { fs: 12, c: C.orange, b: 1 }); }
      if (k >= 3) { s += flow(200, yd - 2, 200, 40, C.purple, 3) + DFQ2_A(200, 50, 200, 36, C.purple, 2.4) + DFQ2_T(208, yd - 10, "reflected (π)", { fs: 12, c: C.purple });
        s += DFQ2_T(210, 66, `Δφ = 2k${DFQ2_s("0")}t${DFQ2_s("box")} + π`, { fs: 12, c: C.purple, b: 1 }); }
      const ph = 4 * Math.PI * t / l0 + Math.PI;
      if (k >= 4) { const cx = 560, cy = 372, S = 42; s += DFQ2_A(cx, cy, cx + S, cy, C.green, 2.4) + DFQ2_A(cx + S, cy, cx + S + S * Math.sqrt(R) * Math.cos(ph), cy - S * Math.sqrt(R) * Math.sin(ph), C.purple, 2.4) + DFQ2_A(cx, cy, cx + S + S * Math.sqrt(R) * Math.cos(ph), cy - S * Math.sqrt(R) * Math.sin(ph), C.ink, 1.6, "4 3");
        s += DFQ2_T(cx - 14, cy + 4, "sum", { a: "end", fs: 12 }); }
      if (k >= 5) {
        const PX = x => 380 + x / 1600 * 270, PY = y => 300 - y / 4 * 180, ts = range(0, 1600, 321);
        s += DFQ2_L(380, 300, 650, 300, C.ink, 1) + DFQ2_L(380, 300, 380, 116, C.ink, 1) + DFQ2_T(430, 334, `t${DFQ2_s("box")} (nm)`, { a: "middle", fs: 11 }) + DFQ2_T(386, 112, "upward light, relative", { fs: 11 });
        [0, 400, 800, 1200, 1600].forEach(x => { s += DFQ2_L(PX(x), 296, PX(x), 304, C.ink, 1) + DFQ2_T(PX(x), 316, String(x), { a: "middle", fs: 10, c: C.mute }); });
        s += DFQ2_L(380, PY(1), 650, PY(1), C.mute, 1, "3 3") + DFQ2_T(646, PY(1) - 4, "no mirror", { a: "end", fs: 10, c: C.mute });
        s += DFQ2_P(ts.map(x => [PX(x), PY(up(x, R))]), C.green, 2.4) + `<circle cx="${PX(t)}" cy="${PY(up(t, R))}" r="6" fill="${C.purple}"/>`;
        s += DFQ2_A(PX(200), 80, PX(600), 80, C.amber, 1.4) + DFQ2_A(PX(600), 80, PX(200), 80, C.amber, 1.4) + DFQ2_T(PX(400), 74, "λ₀/2 = 400 nm", { a: "middle", fs: 12, c: C.amber, b: 1 });
      }
      if (k >= 6) s += DFQ2_T(36, 404, "the gap also changes how strongly the grating scatters: optimize it with the grating", { fs: 12, c: C.red, b: 1 });
      return s;
    },
    ro(v) { const ph = (4 * Math.PI * v.q28t / 800 + Math.PI) % (2 * Math.PI); return `<div><span>Δφ mod 2π</span><b>${(ph / Math.PI).toFixed(2)} π</b></div><div><span>upward light (two-beam)</span><b>${up(v.q28t, v.q28r).toFixed(2)} ×</b></div>`; }
  });
}}

],
summary: String.raw`A grating radiates where the light from successive teeth adds in phase, \(k_0 n_{\mathrm{c}}\sin\theta_m = \beta + m\,2\pi/\Lambda\), and the first order toward the fiber sets \(\Lambda = \lambda_0/(n_{\mathrm{eff}} - n_{\mathrm{c}}\sin\theta)\). Vertical emission is avoided because the second order would reflect the forward mode into the backward one, so the fiber is tilted. TM-like light has the lower \(n_{\mathrm{eff}}\) and needs a longer period. The fill factor sets the average index and the scattering strength, and letting it vary shapes the beam toward the Gaussian fiber mode. Efficiency is limited by downward radiation and by the mismatch of an exponential beam with a Gaussian. A DBR works because the sign of \(r\) alternates and each quarter-wave layer adds \(\pi\) per round trip, so all reflections return in phase. With the small GaAs/AlGaAs contrast it needs about 20 pairs and has a narrow stopband. The air gap sets the phase of the light returning from the mirror, which repeats every \(\lambda_0/2\) of gap, so the gap is designed together with the grating.`,
sheet: [
[String.raw`\[ k_0 n_{\mathrm{c}} \sin\theta_m = \beta + m\,\frac{2\pi}{\Lambda} \]`, "Eq. (2.2): phase matching of the diffraction orders"],
[String.raw`\[ \Lambda = \frac{\lambda_0}{n_{\mathrm{eff}} - n_{\mathrm{c}} \sin\theta} \]`, "Eq. (2.3): period for the first order toward the fiber (Zhou et al. 2018)"],
[String.raw`\[ \theta = 0: \ \beta - 2\,\frac{2\pi}{\Lambda} = -\beta \]`, "Why vertical emission is avoided (Taillaert et al. 2006)"],
[String.raw`\[ r = \frac{n_1 - n_2}{n_1 + n_2}, \qquad d_H = \frac{\lambda_0}{4 n_H}, \quad d_L = \frac{\lambda_0}{4 n_L} \]`, "Eqs. (2.4) and (2.5): Fresnel reflection and quarter-wave layers"],
[String.raw`\[ R = \left[\frac{1 - (n_H/n_L)^{2N}}{1 + (n_H/n_L)^{2N}}\right]^2 \]`, "Eq. (2.6): peak reflectance of N pairs, air on both sides"],
[String.raw`\[ \Delta\lambda_0 \approx \frac{4\lambda_0}{\pi} \arcsin\!\left(\frac{n_H - n_L}{n_H + n_L}\right) \]`, "Eq. (2.7): stopband width"],
[String.raw`\[ \Delta\phi = 2 k_0\, t_{\mathrm{box}} + \pi \]`, "Air gap: phase of the light returning from the DBR, repeats every half wavelength of gap"]],
sources: ["Taillaert et al., Jpn. J. Appl. Phys. 45, 6071 (2006), Secs. 2.1 and 2.2 (vertical period, second-order reflection, the two efficiency limits, mirror and buried layer chosen with the grating)",
"Zhou et al., Appl. Phys. Lett. 113, 251103 (2018) (tilted period, fill factor and etch depth, apodized grating on GaAs membranes)",
"Gačević and Vukmirović, Phys. Rev. Applied 9, 064041 (2018), Sec. II A and B, Fig. 1, Eqs. (2) and (3) (DBR reflection phases, peak reflectance, stopband)"]
});

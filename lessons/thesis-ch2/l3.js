/* Lesson 3 of Chapter 2: thesis Sec. 2.2, second half (the mode solver, n_eff against width, the four lowest modes, why 200 nm). */

/* ---------- a small symmetric tridiagonal eigen solver for the live finite-difference card ----------
   Matrix: diagonal d[0..N-1], every off-diagonal equal to e.
   Eigenvalues by bisection with Sturm sequence counts, eigenvectors by inverse iteration
   with a pivoted tridiagonal solve (the LAPACK dgtsv elimination). */
const C2L3_countLess = (d, e2, x) => { let q = d[0] - x, c = q < 0 ? 1 : 0; for (let i = 1; i < d.length; i++) { if (q === 0) q = -1e-300; q = d[i] - x - e2 / q; if (q < 0) c++; } return c; };
const C2L3_kth = (d, e, k, lo, hi) => { const N = d.length, e2 = e * e; for (let it = 0; it < 100; it++) { const m = 0.5 * (lo + hi); if (m === lo || m === hi) break; if (N - C2L3_countLess(d, e2, m) >= k) lo = m; else hi = m; } return 0.5 * (lo + hi); };
const C2L3_tsolve = (d, e, s, r) => {
  const N = d.length, D = Float64Array.from(d, v => v - s), DL = new Float64Array(N).fill(e), DU = new Float64Array(N).fill(e), B = Float64Array.from(r), tiny = 1e-300;
  for (let i = 0; i < N - 1; i++) {
    if (Math.abs(D[i]) >= Math.abs(DL[i])) { if (D[i] === 0) D[i] = tiny; const f = DL[i] / D[i]; D[i + 1] -= f * DU[i]; B[i + 1] -= f * B[i]; DL[i] = 0; }
    else { const f = D[i] / DL[i]; D[i] = DL[i]; let t = D[i + 1]; D[i + 1] = DU[i] - f * t; if (i < N - 2) { DL[i] = DU[i + 1]; DU[i + 1] = -f * DL[i]; } else DL[i] = 0; DU[i] = t; t = B[i]; B[i] = B[i + 1]; B[i + 1] = t - f * B[i + 1]; }
  }
  if (D[N - 1] === 0) D[N - 1] = tiny;
  B[N - 1] /= D[N - 1]; if (N > 1) B[N - 2] = (B[N - 2] - DU[N - 2] * B[N - 1]) / D[N - 2];
  for (let i = N - 3; i >= 0; i--) B[i] = (B[i] - DU[i] * B[i + 1] - DL[i] * B[i + 2]) / D[i];
  return B;
};
const C2L3_vec = (d, e, lam) => {
  let x = Float64Array.from(d, (_, i) => 1 + 0.3 * Math.sin(0.7 * i)); const s = lam * (1 + 1e-11) + 1e-14;
  for (let it = 0; it < 4; it++) { x = C2L3_tsolve(d, e, s, x); let m = 0; for (const v of x) m = Math.max(m, Math.abs(v)); for (let i = 0; i < x.length; i++) x[i] /= m || 1; }
  let sg = 0; const c = (x.length - 1) / 2; for (let i = 0; i < x.length; i++) sg += x[i] * (Math.abs(x[c]) > 0.2 ? 1 : (i > c ? 1 : -1));
  if (sg < 0) for (let i = 0; i < x.length; i++) x[i] = -x[i];
  return x;
};
/* TE slab of index 3.5 and thickness t in air, 800 nm, window -1200..1200 nm with E = 0 at the walls,
   grid step h. Each grid point takes the average permittivity of its cell. Returns the K largest eigenvalues beta^2. */
const C2L3_slab = (t, h, K) => {
  const n = 3.5, k0 = 2 * Math.PI / 800, M = Math.max(2, Math.round(1200 / h)), N = 2 * M - 1, z = new Float64Array(N), eps = new Float64Array(N), d = new Float64Array(N), e = 1 / (h * h);
  for (let i = 0; i < N; i++) { z[i] = (i + 1 - M) * h; const fr = Math.max(0, Math.min(z[i] + h / 2, t / 2) - Math.max(z[i] - h / 2, -t / 2)) / h; eps[i] = 1 + fr * (n * n - 1); d[i] = -2 * e + k0 * k0 * eps[i]; }
  const hi = k0 * k0 * n * n * 1.0001, npos = N - C2L3_countLess(d, e * e, 0), vals = [];
  for (let k = 1; k <= Math.min(K, npos); k++) vals.push(C2L3_kth(d, e, k, 0, hi));
  return { z, eps, d, e, N, M, k0, vals, neff: vals.map(v => Math.sqrt(v) / k0) };
};
/* Step-through controller of this file (same behaviour as in Lessons 1 and 2). */
const C2L3_stepper = (fig, n, draw, o) => {
  o = o || {};
  const RM = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  const st = { k: o.start || 0, p: RM || o.full ? 1 : 0, playing: !!o.play && !RM, hold: 0, t: 0 };
  const D = () => { draw(st); $(o.p).textContent = st.playing ? "Pause" : "Play"; $(o.b).disabled = st.k === 0; $(o.n).disabled = st.k === n - 1; };
  const go = k => { st.k = Math.max(0, Math.min(n - 1, k)); st.p = RM ? 1 : 0; st.hold = 0; D(); };
  $(o.b).onclick = () => { st.playing = false; go(st.k - 1); };
  $(o.n).onclick = () => { st.playing = false; go(st.k + 1); };
  $(o.p).onclick = () => {
    if (st.playing) { st.playing = false; D(); return; }
    if (RM) { go(st.k < n - 1 ? st.k + 1 : 0); return; }
    st.playing = true; if (st.k >= n - 1) go(0); else D();
  };
  let last = performance.now();
  anim(t => {
    if (!fig.isConnected) { stopAnim(); return; }
    const now = performance.now(), dt = Math.min(0.1, (now - last) / 1000); last = now; st.t = t;
    const live = typeof o.live === "function" ? o.live(st) : !!o.live;
    if (st.p < 1) { st.p = Math.min(1, st.p + dt / (typeof o.dur === "function" ? o.dur(st) : (o.dur || 0.9))); D(); }
    else if (st.playing) { st.hold += dt; if (st.hold > (o.hold || 2.6)) { if (st.k < n - 1) go(st.k + 1); else { st.playing = false; D(); } } else if (live) D(); }
    else if (live) D();
  });
  D();
  return { st, redraw: D, go };
};
const C2L3_sub = s => `<tspan baseline-shift="sub" font-size="9">${s}</tspan>`;
const C2L3_COL = ["#378ADD", "#7F77DD", "#1D9E75", "#BA7517"];

addLesson("thesis", "ch2", {
level: "Intermediate",
id: "thesis-ch2-l3", title: "The mode solver: effective index and mode shapes", short: "3. The mode solver",
big: String.raw`The thesis computes every mode with the Tidy3D mode solver. The idea is short: in a waveguide whose cross-section does not change along \(x\), every field can vary along the guide as \(e^{i\beta x}\), and Maxwell's equations then become an eigenvalue problem on the cross-section. Each eigenvalue gives the effective index \(n_{\mathrm{eff}} = \beta/k_0\) of one mode, and its eigenvector gives the mode shape. Tidy3D solves this problem by finite differences for the transverse electric field. Here the same steps are carried out live for a slab, and the strip results of Sec. 2.2 are explored: \(n_{\mathrm{eff}}\) against width, names by mirror symmetry, field maps, power in the core, and why 200 nm is used for routing. At that width both fundamental modes are well guided, while the higher-order modes are only weakly guided, with effective indices close to the air cladding.`,
bridge: "Cards 1 and 2 are exact for a slab, solved in the page with round values (n = 3.5, air, 800 nm). The strip curves of cards 3 to 8 come from the effective index method (two slab problems, Beyond the thesis B1), an approximate method computed in the browser for illustration. The thesis figures 2.2 and 2.3 use the full Tidy3D mode solver, so its numbers differ, and none of them are shown here.",
cards: [
/* new: the eigenvalue problem, as a step-through derivation */
{s: "1. An eigenvalue problem", t: "From Maxwell's equations to an eigenvalue problem",
intu: String.raw`A mode is a field pattern that travels along the waveguide without changing shape. If the cross-section does not change along \(x\), every field can be written as a pattern on the cross-section times \(e^{i\beta x}\). Put that into Maxwell's equations and every derivative along \(x\) turns into a factor \(i\beta\). What is left is an equation on the cross-section alone, of the form "an operator acting on the pattern gives the same pattern back, times \(\beta^2\)". That is an eigenvalue problem: only special patterns, the modes, satisfy it, and each comes with its own eigenvalue \(\beta^2\), so its own \(n_{\mathrm{eff}} = \beta/k_0\). For a slab with a TE field the operator is just a second derivative plus \(k_0^2 n(z)^2\). On a grid it becomes a matrix, and the eigenvalues of the matrix are the \(\beta^2\) of the modes. Tidy3D does exactly this on the 2D cross-section, for the transverse electric field, by finite differences. Press Play and narrate the six steps.`,
eq: String.raw`\[ \nabla\times\nabla\times\mathbf{E} = k_0^{2}\,\varepsilon_r(y,z)\,\mathbf{E}, \qquad \mathbf{E}(x,y,z) = \mathbf{e}(y,z)\,e^{i\beta x} \]\[ \mathcal{L}\,\mathbf{e} = \beta^{2}\,\mathbf{e}, \qquad n_{\mathrm{eff}} = \frac{\beta}{k_0}, \qquad k_0 = \frac{2\pi}{\lambda_0} \]<div class="eqnote">Scalar slab, TE field \(E_y(z)\)</div>\[ \frac{d^{2}E}{dz^{2}} + k_0^{2}\,n(z)^{2}\,E = \beta^{2}E \]`,
sym: [[String.raw`\(\mathbf{e}(y,z)\)`, "mode pattern on the cross-section"], [String.raw`\(\beta\)`, "propagation constant, the eigenvalue is its square"], [String.raw`\(\mathcal{L}\)`, String.raw`operator on the cross-section left after \(\partial/\partial x \to i\beta\)`], [String.raw`\(\varepsilon_r(y,z)\)`, "relative permittivity of the cross-section, the same at every x"], [String.raw`\(n(z)\)`, "index profile of the slab, 3.5 inside and 1 outside"]],
how: [String.raw`Start from the curl equations (Eq. 2.16) at one frequency, with time dependence \(e^{-i\omega t}\): \(\nabla\times\mathbf{E} = i\omega\mu_0\mathbf{H}\) and \(\nabla\times\mathbf{H} = -i\omega\varepsilon_0\varepsilon_r\mathbf{E}\).`, String.raw`Take the curl of the first and insert the second: \(\nabla\times\nabla\times\mathbf{E} = \omega^2\mu_0\varepsilon_0\varepsilon_r\mathbf{E} = k_0^2\varepsilon_r\mathbf{E}\). One equation for \(\mathbf{E}\) alone.`, String.raw`The cross-section does not change along \(x\), so try \(\mathbf{E} = \mathbf{e}(y,z)e^{i\beta x}\). Every \(\partial/\partial x\) becomes \(i\beta\), and the equation involves only \(y\) and \(z\).`, String.raw`Collect the \(\beta^2\) terms on one side: \(\mathcal{L}\mathbf{e} = \beta^2\mathbf{e}\). Only special patterns satisfy it, each with its own \(\beta\). These are the modes, and \(n_{\mathrm{eff}} = \beta/k_0\).`, String.raw`Slab, TE: \(\mathbf{E} = \hat{\mathbf{y}}E(z)e^{i\beta x}\) has \(\nabla\cdot\mathbf{E} = 0\), so \(\nabla\times\nabla\times\mathbf{E} = -\nabla^2\mathbf{E}\), and \(-(-\beta^2E + E'') = k_0^2n^2E\) gives \(E'' + k_0^2n(z)^2E = \beta^2E\).`, String.raw`On a grid of step \(h\) the second derivative becomes a matrix, so the problem becomes \(A\mathbf{E} = \beta^2\mathbf{E}\). Tidy3D does the same on the 2D cross-section for the transverse electric field \((E_y, E_z)\), by finite differences. Card 2 does the 1D version live.`],
say: String.raw`For a cross-section that does not change along the guide, I write every field as a pattern times \(e^{i\beta x}\). Maxwell's equations then become an eigenvalue problem on the cross-section, \(\mathcal{L}\mathbf{e} = \beta^2\mathbf{e}\). Each eigenvalue gives the effective index \(n_{\mathrm{eff}} = \beta/k_0\) of one mode and each eigenvector its shape. Tidy3D solves it by finite differences for the transverse electric field.`,
num: String.raw`\(\lambda_0 = 800\) nm: \(k_0 = 2\pi/800 \approx\) <b>0.00785 nm⁻¹</b>.<br>An eigenvalue \(\beta^2 = 5.8\times10^{-4}\) nm⁻² gives \(\beta \approx 0.0241\) nm⁻¹ and \(n_{\mathrm{eff}} = \beta/k_0 \approx\) <b>3.07</b>.<br>Guided modes need \(k_0^2 n_{\mathrm{c}}^2 \lt \beta^2 \lt k_0^2 n^2\), here between <b>6.2×10⁻⁵</b> and <b>7.6×10⁻⁴</b> nm⁻².`,
note: String.raw`If asked why the eigenvalue is \(\beta^2\) and not \(\beta\): the equation contains only second derivatives along \(x\), so \(\beta\) and \(-\beta\) give the same equation. They are the same mode travelling forward and backward. The solver returns \(\beta^2\) and the positive root is taken.`,
r(fig, ctl) {
  const PIECES = [String.raw`\(\nabla\times\mathbf{E} = i\omega\mu_0\mathbf{H},\ \ \nabla\times\mathbf{H} = -i\omega\varepsilon_0\varepsilon_r\mathbf{E}\)`,
    String.raw`\(\Rightarrow\ \nabla\times\nabla\times\mathbf{E} = k_0^{2}\varepsilon_r\mathbf{E}\)`,
    String.raw`\(\mathbf{E} = \mathbf{e}(y,z)\,e^{i\beta x},\ \ \partial_x \to i\beta\)`,
    String.raw`\(\mathcal{L}\,\mathbf{e} = \beta^{2}\,\mathbf{e}\)`,
    String.raw`\(\dfrac{d^{2}E}{dz^{2}} + k_0^{2}n(z)^{2}E = \beta^{2}E\)`,
    String.raw`\(A\,\mathbf{E} = \beta^{2}\mathbf{E},\ \ n_{\mathrm{eff}} = \beta/k_0\)`];
  const CAP = ["Step 1. Maxwell's curl equations at one frequency (Eq. 2.16 with e<sup>−iωt</sup>). The waveguide is the same at every x.",
    "Step 2. Eliminate H: take the curl of the first equation and insert the second. One equation for E alone.",
    "Step 3. Try a pattern on the cross-section times e<sup>iβx</sup>. The phase advances along x, the pattern stays the same. Every ∂/∂x becomes iβ.",
    "Step 4. What is left acts only on y and z: an operator on the cross-section gives the same pattern back times β². Only the modes do that, each with its own β.",
    "Step 5. The simplest case, a slab with a TE field E<sub>y</sub>(z): a second derivative plus k₀²n(z)². Its solutions are cosines inside and decaying tails outside.",
    "Step 6. On a grid the second derivative becomes a tridiagonal matrix. Its largest eigenvalues are the β² of the guided modes, so n<sub>eff</sub> = β/k₀. Tidy3D does this in 2D for (E<sub>y</sub>, E<sub>z</sub>)."];
  ctl.innerHTML = `<div class="row"><button id="eb">Back</button><button id="ep">Play</button><button id="en">Next</button></div><p class="note" id="ec" style="min-height:44px;font-size:14px;color:var(--fg)"></p>`;
  fig.innerHTML = `<style>.c3q{display:flex;flex-direction:column;gap:2px;font-size:15px;padding:6px 10px;background:var(--sunk);border-radius:8px;min-height:150px}.c3q span{opacity:0;transition:opacity .5s}.c3q span.in{opacity:.45}.c3q span.cur{opacity:1}</style><div class="c3q">${PIECES.map((p, i) => `<span data-k="${i}">${p}</span>`).join("")}</div><div id="esv"></div>`;
  typesetMath(fig);
  const S6 = C2L3_slab(160, 20, 6), zp = range(-400, 400, 161), P0 = C2.slabProfile(3.5, 1, 160, 800, 0, "TE", C2.slabN(3.5, 1, 160, 800, 0, "TE"), zp).main, P1 = C2.slabProfile(3.5, 1, 160, 800, 1, "TE", C2.slabN(3.5, 1, 160, 800, 1, "TE"), zp).main;
  const box = (fill) => `<polygon points="70,150 520,96 570,96 120,150" fill="${fill}" stroke="var(--p)" stroke-width="0.8"/><polygon points="70,150 120,150 120,190 70,190" fill="#7FA6D9" stroke="var(--p)"/><polygon points="120,150 570,96 570,136 120,190" fill="#7FA6D9" opacity="0.55" stroke="var(--p)" stroke-width="0.8"/>`;
  const draw = st => {
    fig.querySelectorAll(".c3q span").forEach(sp => { const i = +sp.dataset.k; sp.classList.toggle("in", i < st.k); sp.classList.toggle("cur", i === st.k); });
    const k = st.k, p = st.p; let s = "";
    if (k <= 2) {
      s += box("var(--blue-bg)") + `<text class="ts" x="330" y="70" text-anchor="middle">waveguide, the same cross-section at every x</text>${arrow(60, 214, 160, 202, "var(--t)", 1.5)}<text class="ts" x="166" y="206">x</text>`;
      if (k === 1) s += `<text class="th" x="330" y="222" text-anchor="middle" opacity="${p.toFixed(2)}">eliminate H: one equation for E</text>`;
      if (k === 2) {
        for (let j = 0; j < 9; j++) { const u = ((j * 50 + st.t * 45) % 450) / 450, x = 120 + u * 450, y = 150 - u * 54; s += `<line x1="${x}" y1="${y}" x2="${x}" y2="${y + 40}" stroke="${j % 2 ? "#378ADD" : "#D85A30"}" stroke-width="3" opacity="${(0.85 * p).toFixed(2)}"/>`; }
        s += `<ellipse cx="95" cy="170" rx="18" ry="13" fill="#D85A30" opacity="${(0.6 * p).toFixed(2)}"/><text class="ts" x="330" y="222" text-anchor="middle">phase fronts of e<tspan baseline-shift="super" font-size="9">iβx</tspan> move along x, the pattern e(y, z) stays</text>`;
      }
    } else if (k === 3) {
      s += `<rect x="250" y="70" width="180" height="144" fill="#7FA6D9" stroke="var(--p)"/>`;
      for (let i = 0; i <= 12; i++) s += `<line x1="${200 + i * 23.3}" x2="${200 + i * 23.3}" y1="40" y2="240" stroke="var(--line)" stroke-width="0.8"/><line x1="200" x2="480" y1="${40 + i * 16.7}" y2="${40 + i * 16.7}" stroke="var(--line)" stroke-width="0.8"/>`;
      s += `<ellipse cx="340" cy="142" rx="70" ry="52" fill="#D85A30" opacity="${(0.45 * p).toFixed(2)}"/><text class="ts" x="340" y="30" text-anchor="middle">cross-section (y across, z up): unknowns on a grid</text><text class="ts" x="500" y="120">mode 1: β₁</text><text class="ts" x="500" y="140">mode 2: β₂</text><text class="ts" x="500" y="160">mode 3: β₃ ...</text>`;
    } else if (k === 4) {
      const X = z => 60 + (z + 400) / 800 * 560;
      s += `<rect x="${X(-80)}" y="40" width="${X(80) - X(-80)}" height="180" fill="var(--blue-bg)"/><line x1="60" x2="620" y1="130" y2="130" stroke="var(--p)" stroke-width="0.6"/>${plot(60, 40, 560, 180, zp, P0, -400, 400, -1.1, 1.1, C2L3_COL[0], 2.5)}<g opacity="${p.toFixed(2)}">${plot(60, 40, 560, 180, zp, P1, -400, 400, -1.1, 1.1, C2L3_COL[1], 2, "6 4")}</g><text class="ts" x="66" y="34">E(z) of the two guided TE modes of a 160 nm slab, z from −400 to 400 nm</text><text class="ts" x="${X(0)}" y="236" text-anchor="middle">n = 3.5</text><text class="ts" x="${X(-250)}" y="236" text-anchor="middle">n = 1</text><text class="ts" x="${X(250)}" y="236" text-anchor="middle">n = 1</text>`;
    } else {
      const X = z => 40 + (z + 300) / 600 * 300;
      s += `<rect x="${X(-80)}" y="40" width="${X(80) - X(-80)}" height="40" fill="var(--blue-bg)"/><line x1="40" x2="340" y1="60" y2="60" stroke="var(--p)"/>`;
      for (let i = 0; i < S6.N; i++) { const z = S6.z[i]; if (Math.abs(z) <= 300) s += `<circle cx="${X(z)}" cy="60" r="2.6" fill="${S6.eps[i] > 1.01 ? "#378ADD" : "var(--p)"}"/>`; }
      s += `<text class="ts" x="40" y="30">grid, h = 20 nm (part of it)</text>`;
      s += `<rect x="60" y="100" width="120" height="120" fill="none" stroke="var(--p)"/><line x1="60" y1="100" x2="180" y2="220" stroke="var(--t)" stroke-width="3"/><line x1="66" y1="100" x2="180" y2="214" stroke="var(--muted)" stroke-width="1.5"/><line x1="60" y1="106" x2="174" y2="220" stroke="var(--muted)" stroke-width="1.5"/><line x1="116" y1="156" x2="124" y2="164" stroke="#378ADD" stroke-width="4"/><text class="ts" x="190" y="150">tridiagonal A</text><text class="ts" x="190" y="166">N = ${S6.N}</text>`;
      const Y = v => 230 - v / 3.6 * 200;
      s += `<g opacity="${p.toFixed(2)}"><line x1="420" x2="420" y1="30" y2="230" stroke="var(--p)"/><line x1="420" x2="600" y1="${Y(1)}" y2="${Y(1)}" stroke="var(--p)" stroke-dasharray="4 4"/><text class="ts" x="604" y="${Y(1) + 4}">air</text><line x1="420" x2="600" y1="${Y(3.5)}" y2="${Y(3.5)}" stroke="var(--p)" stroke-dasharray="4 4"/><text class="ts" x="604" y="${Y(3.5) + 4}">GaAs</text>`;
      S6.neff.forEach((v, i) => { const gd = v > 1; s += `<line x1="440" x2="540" y1="${Y(v)}" y2="${Y(v)}" stroke="${gd ? C2L3_COL[i] : "var(--muted)"}" stroke-width="${gd ? 3 : 1.5}"/>${gd ? `<text class="ts" x="546" y="${Y(v) + 4}">${v.toFixed(3)}</text>` : ""}`; });
      s += `<text class="ts" x="420" y="22">eigenvalues as n<tspan baseline-shift="sub" font-size="9">eff</tspan> = β/k₀</text><text class="ts" x="440" y="${Y(0.45)}">gray: below air, not guided</text></g>`;
    }
    $("esv").innerHTML = svg(250, s);
    $("ec").innerHTML = CAP[k];
  };
  C2L3_stepper(fig, PIECES.length, draw, { b: "eb", p: "ep", n: "en", play: true, dur: 0.8, hold: 3.2, live: st => st.k === 2 });
}},

/* new: a live finite-difference mode solver */
{s: "2. Solve it live", t: "A finite-difference mode solver, running in the page",
intu: String.raw`This is a real mode solver for a slab, small enough to watch. The window from −1200 to 1200 nm is cut into grid points a distance \(h\) apart (the dots). The second derivative becomes a difference of neighbours, so each row of the matrix links a point only to its two neighbours: the matrix is tridiagonal (left sketch, the blue stretch of the diagonal is the GaAs). Its largest eigenvalues are found by bisection and turned into \(n_{\mathrm{eff}} = \beta/k_0\) (the ladder), and the eigenvectors are the mode profiles (top). Eigenvalues below the air line are box modes, waves trapped by the artificial walls of the window, and are thrown away. Coarsen the grid and the answer drifts away from the analytic slab value, refine it and it converges, with the error falling about four times each time \(h\) halves (right plot). The small scatter about that trend comes from where the two surfaces fall between grid points. Press 'Refine the grid' to watch it converge. This is the 1D scalar version. Tidy3D solves the full vector problem on the 2D cross-section the same way.`,
eq: String.raw`\[ \frac{E_{i+1} - 2E_i + E_{i-1}}{h^{2}} + k_0^{2}\,\varepsilon_i\,E_i = \beta^{2}E_i, \qquad i = 1, \dots, N \]\[ A = \frac{1}{h^{2}}\begin{pmatrix} -2 & 1 & & \\ 1 & -2 & \ddots & \\ & \ddots & \ddots & 1 \\ & & 1 & -2 \end{pmatrix} + k_0^{2}\,\mathrm{diag}(\varepsilon_1, \dots, \varepsilon_N), \qquad A\mathbf{E} = \beta^{2}\mathbf{E} \]<div class="eqref">\(E = 0\) at the window edges. \(\varepsilon_i\) is the average permittivity of cell \(i\). Guided if \(1 \lt \beta/k_0 \lt 3.5\).</div>`,
sym: [[String.raw`\(h\)`, "grid step"], [String.raw`\(E_i\)`, String.raw`field at grid point \(z_i\), the unknowns`], [String.raw`\(\varepsilon_i\)`, "permittivity of cell i, averaged over the cell where it is cut by a surface"], [String.raw`\(A\)`, "N × N symmetric tridiagonal matrix"], ["box mode", "solution that only exists because of the artificial walls, with an effective index below the air index"]],
how: [String.raw`Cut the window into points \(z_i\) a distance \(h\) apart and keep the field values \(E_i\) as unknowns.`, String.raw`Replace \(d^2E/dz^2\) by the central difference \((E_{i+1} - 2E_i + E_{i-1})/h^2\). Its error is of order \(h^2\).`, "Each row links a point only to its two neighbours, so A is tridiagonal and symmetric.", String.raw`Set \(E = 0\) at the window edges. The window must be wide enough that the guided tails have died out there.`, String.raw`The largest eigenvalues of A are the guided \(\beta^2\). Their eigenvectors are the mode profiles. Eigenvalues with \(\beta/k_0 \lt 1\) are box modes and are discarded.`, "Here the eigenvalues come from bisection with Sturm sequence counts and the eigenvectors from inverse iteration. Halving h cuts the error by about four, the sign of a second-order method."],
say: "On a grid the mode equation becomes a matrix eigenvalue problem. The largest eigenvalues are the β² of the guided modes, the eigenvectors are their field profiles, and the result converges to the exact value as the grid is refined. The same convergence check applies to any mode solver result.",
num: String.raw`Slab 160 nm, \(n = 3.5\), 800 nm, computed by this card. Error in \(n_{\mathrm{eff}}\) of TE0: \(h = 20\) nm ≈ <b>7×10⁻³</b>, \(h = 10\) nm ≈ <b>2×10⁻³</b>, \(h = 5\) nm ≈ <b>4×10⁻⁴</b>, \(h = 1\) nm ≈ <b>2×10⁻⁵</b>.<br>The 160 nm slab has two guided TE modes. TE1 appears at \(t_1 = \lambda_0/(2\sqrt{n^2 - 1}) \approx\) <b>119 nm</b>.`,
note: String.raw`Tidy3D does the 2D vector version: the unknowns are \(E_y\) and \(E_z\) on every cell of the cross-section, so the matrix is sparse but no longer tridiagonal, and a sparse eigensolver finds the few modes nearest a target index. The two checks are the same as here: a window large enough for the tails, and a grid fine enough that \(n_{\mathrm{eff}}\) stops changing.`,
r(fig, ctl) {
  const HS = [50, 40, 30, 20, 15, 10, 7, 5, 3, 2, 1];
  ctl.innerHTML = sl("t", "Slab thickness t", 60, 400, 5, 160) + sl("h", "Grid step h", 1, 50, 1, 20) + `<div class="row"><button id="rf">Refine the grid</button></div><div class="readout" id="ro"></div>`;
  let conv = null, convT = -1, play = false, idx = 0, acc = 0, last = performance.now();
  const u = () => {
    const t = +$("t").value, h = +$("h").value; $("tv").textContent = t + " nm"; $("hv").textContent = h + " nm"; $("rf").textContent = play ? "Stop" : "Refine the grid";
    const ex = [0, 1, 2, 3].map(m => C2.slabN(3.5, 1, t, 800, m, "TE"));
    if (convT !== t) { conv = HS.map(hh => { const S = C2L3_slab(t, hh, 1); return Math.abs(S.neff[0] - ex[0]); }); convT = t; }
    const S = C2L3_slab(t, h, 6), ng = S.neff.filter(v => v > 1).length;
    const vecs = S.vals.slice(0, Math.min(ng, 4)).map(v => C2L3_vec(S.d, S.e, v));
    let s = "";
    // panel A: profiles and grid
    const XA = z => 40 + (z + 600) / 1200 * 620, YA = v => 105 - v * 62;
    s += `<rect x="${XA(-t / 2)}" y="34" width="${XA(t / 2) - XA(-t / 2)}" height="142" fill="var(--blue-bg)"/><line x1="40" x2="660" y1="105" y2="105" stroke="var(--p)" stroke-width="0.6"/>`;
    const zA = range(-600, 600, 301), an = C2.slabProfile(3.5, 1, t, 800, 0, "TE", ex[0], zA).main;
    s += plot(40, 43, 620, 124, zA, an, -600, 600, -1, 1, "var(--t)", 1, "3 3");
    vecs.forEach((v, j) => { let d = ""; for (let i = 0; i < S.N; i++) { const z = S.z[i]; if (Math.abs(z) > 600) continue; d += (d ? "L" : "M") + XA(z).toFixed(1) + " " + YA(v[i]).toFixed(1); } s += `<path d="${d}" fill="none" stroke="${C2L3_COL[j]}" stroke-width="2.2"/>`; });
    if (h >= 5) { for (let i = 0; i < S.N; i++) { const z = S.z[i]; if (Math.abs(z) <= 600) s += `<circle cx="${XA(z).toFixed(1)}" cy="105" r="${h >= 15 ? 2.6 : 1.6}" fill="${S.eps[i] > 1.01 ? "#378ADD" : "var(--p)"}"/>`; if (h >= 8 && vecs[0] && Math.abs(z) <= 600) s += `<circle cx="${XA(z).toFixed(1)}" cy="${YA(vecs[0][i]).toFixed(1)}" r="2.2" fill="${C2L3_COL[0]}"/>`; } }
    s += `<text class="ts" x="40" y="24">mode profiles from the eigenvectors (dashed: analytic TE0), z from −600 to 600 nm${h < 5 ? ", grid too fine to draw the dots" : ""}</text>`;
    // panel B: matrix sketch
    const bx = 40, by = 214, bs = 130, a0 = (S.M - 1 - t / 2 / h) / S.N, a1 = (S.M - 1 + t / 2 / h) / S.N;
    s += `<rect x="${bx}" y="${by}" width="${bs}" height="${bs}" fill="none" stroke="var(--p)"/><line x1="${bx + 5}" y1="${by}" x2="${bx + bs}" y2="${by + bs - 5}" stroke="var(--muted)" stroke-width="1.4"/><line x1="${bx}" y1="${by + 5}" x2="${bx + bs - 5}" y2="${by + bs}" stroke="var(--muted)" stroke-width="1.4"/><line x1="${bx}" y1="${by}" x2="${bx + bs}" y2="${by + bs}" stroke="var(--t)" stroke-width="2.5"/><line x1="${bx + a0 * bs}" y1="${by + a0 * bs}" x2="${bx + a1 * bs}" y2="${by + a1 * bs}" stroke="#378ADD" stroke-width="6"/><text class="ts" x="${bx}" y="${by - 8}">matrix A, N × N</text><text class="ts" x="${bx}" y="${by + bs + 16}">N = ${S.N}, tridiagonal</text>`;
    // panel C: eigenvalue ladder
    const cx = 230, Yc = v => 344 - v / 3.6 * 124;
    s += `<text class="ts" x="${cx}" y="${by - 8}">eigenvalues as n<tspan baseline-shift="sub" font-size="9">eff</tspan></text><line x1="${cx}" x2="${cx}" y1="${Yc(3.6)}" y2="${Yc(0)}" stroke="var(--p)"/><line x1="${cx}" x2="${cx + 150}" y1="${Yc(1)}" y2="${Yc(1)}" stroke="var(--p)" stroke-dasharray="4 4"/><text class="ts" x="${cx + 154}" y="${Yc(1) + 4}">air</text><line x1="${cx}" x2="${cx + 150}" y1="${Yc(3.5)}" y2="${Yc(3.5)}" stroke="var(--p)" stroke-dasharray="4 4"/><text class="ts" x="${cx + 154}" y="${Yc(3.5) + 4}">3.5</text>`;
    S.neff.forEach((v, i) => { const gd = v > 1; s += `<line x1="${cx + 10}" x2="${cx + 80}" y1="${Yc(v)}" y2="${Yc(v)}" stroke="${gd ? C2L3_COL[i] : "var(--muted)"}" stroke-width="${gd ? 3 : 1.4}"/>${gd ? `<text class="ts" x="${cx + 86}" y="${Yc(v) + 4}">${v.toFixed(3)}</text>` : ""}`; });
    ex.forEach(v => { if (v) s += `<path d="M${cx + 8} ${Yc(v)} l-7 -4 v8 z" fill="var(--t)"/>`; });
    s += `<text class="ts" x="${cx}" y="${Yc(0) + 16}">black marks: analytic slab values</text>`;
    // panel D: convergence
    const dx0 = 460, dw = 190, dy0 = 214, dh = 130, lx = v => dx0 + (Math.log10(v) - 0) / Math.log10(50) * dw, ly = v => dy0 + dh - (Math.log10(Math.max(v, 1e-7)) + 7) / 7 * dh;
    s += `<rect x="${dx0}" y="${dy0}" width="${dw}" height="${dh}" fill="none" stroke="var(--line)"/><text class="ts" x="${dx0}" y="${dy0 - 8}">error of TE0 n<tspan baseline-shift="sub" font-size="9">eff</tspan> versus h (log-log)</text>`;
    [1e-6, 1e-4, 1e-2].forEach(v => s += `<text class="ts" x="${dx0 - 4}" y="${ly(v) + 4}" text-anchor="end">${v === 1e-6 ? "10⁻⁶" : v === 1e-4 ? "10⁻⁴" : "10⁻²"}</text><line x1="${dx0}" x2="${dx0 + dw}" y1="${ly(v)}" y2="${ly(v)}" stroke="var(--line)" stroke-width="0.6"/>`);
    s += `<line x1="${lx(1)}" y1="${ly(conv[HS.length - 1])}" x2="${lx(50)}" y2="${ly(conv[HS.length - 1] * 2500)}" stroke="var(--muted)" stroke-dasharray="4 3"/><text class="ts" x="${lx(12)}" y="${dy0 + dh - 6}">dashed: slope 2</text>`;
    HS.forEach((hh, i) => s += `<circle cx="${lx(hh)}" cy="${ly(conv[i])}" r="${hh === h ? 6 : 3}" fill="${hh === h ? "#EF9F27" : C2L3_COL[0]}"/>`);
    if (!HS.includes(h)) s += `<circle cx="${lx(h)}" cy="${ly(Math.abs(S.neff[0] - ex[0]))}" r="6" fill="#EF9F27"/>`;
    s += `<text class="ts" x="${dx0}" y="${dy0 + dh + 16}">h = 1 nm</text><text class="ts" x="${dx0 + dw}" y="${dy0 + dh + 16}" text-anchor="end">50 nm</text>`;
    fig.innerHTML = svg(370, s);
    const e0 = Math.abs(S.neff[0] - ex[0]);
    $("ro").innerHTML = `<div><span>grid points N</span><b>${S.N}</b></div><div><span>TE0: solver / analytic</span><b>${S.neff[0].toFixed(4)} / ${ex[0].toFixed(4)}</b></div><div><span>TE0 error</span><b>${e0.toExponential(1)}</b></div><div><span>TE1: solver / analytic</span><b>${ex[1] && S.neff[1] > 1 ? S.neff[1].toFixed(4) + " / " + ex[1].toFixed(4) : "cut off"}</b></div><div><span>guided modes found</span><b>${ng}</b></div>`;
  };
  $("t").oninput = u; $("h").oninput = () => { play = false; u(); };
  $("rf").onclick = () => { play = !play; if (play) { idx = 0; acc = 0; $("h").value = HS[0]; } u(); };
  anim(() => {
    if (!fig.isConnected) { stopAnim(); return; }
    const now = performance.now(), dt = Math.min(0.1, (now - last) / 1000); last = now;
    if (play) { acc += dt; if (acc > 1.1) { acc = 0; idx++; if (idx >= HS.length) { play = false; } else $("h").value = HS[idx]; u(); } }
  });
  u();
}},

/* from old ch2 L3 card 2 */
{s: "3. n<sub>eff</sub> vs width", t: "Effective index against width, and the TE-like and TM-like crossing",
intu: String.raw`This is the idea of Fig. 2.2 of the thesis, computed here with the approximate effective index method. As the strip gets wider, both modes approach their slab values. As it gets narrower, more of the light sits in the air beside the strip and \(n_{\mathrm{eff}}\) drops. The two families drop at different rates. The TE-like mode has its field across the width, normal to the side walls, so narrowing the strip hurts it the way thinning a slab hurts a TM mode: strongly (Lesson 2, card 4). The TM-like mode has its field along \(z\), parallel to the side walls, so it is hurt less. When the width falls to the thickness, the curves cross and below it the TM-like mode has the higher index. Drag the marker to the crossing.`,
eq: String.raw`\[ w \gg t: \quad n_{\mathrm{eff}}^{\text{TE-like}} \to n_{\mathrm{slab}}^{\mathrm{TE}}, \quad n_{\mathrm{eff}}^{\text{TM-like}} \to n_{\mathrm{slab}}^{\mathrm{TM}} \]\[ w = t: \quad n_{\mathrm{eff}}^{\text{TE-like}} = n_{\mathrm{eff}}^{\text{TM-like}} \ \ \text{(exact, by symmetry)} \]`,
sym: [[String.raw`\(n_{\mathrm{slab}}^{\mathrm{TE}}, n_{\mathrm{slab}}^{\mathrm{TM}}\)`, "slab limits for very wide strips (Lesson 2, card 6)"], ["crossing", String.raw`width where the two families have the same \(n_{\mathrm{eff}}\)`], [String.raw`\(w, t\)`, "strip width and membrane thickness, 160 nm"]],
how: [String.raw`Wide strip: the side walls barely matter, so \(n_{\mathrm{eff}}\) approaches the slab index.`, String.raw`TE-like: across the width the main field is normal to the walls, so the lateral problem has the same jump penalty as a thin TM slab.`, "TM-like: across the width the main field is parallel to the walls, a weaker penalty.", String.raw`So the TE-like curve falls faster as \(w\) shrinks. At \(w = t\) a square strip in air looks the same after a 90° turn about \(x\), which turns the TE-like mode into the TM-like one, so the two must have exactly the same \(n_{\mathrm{eff}}\).`],
say: "In a narrow strip both fundamental modes lose effective index. For a square strip in air the two are degenerate by symmetry, and when the strip becomes narrower than it is thick, the TM-like mode overtakes the TE-like mode.",
num: String.raw`Exact crossing: \(w = t = 160\) nm, from the 90° symmetry.<br>The effective index method puts it a little off, near \(w \approx\) <b>170 nm</b>, because it treats \(y\) and \(z\) differently. That small miss is a good measure of its error for narrow strips. Below the crossing the names TE-like and TM-like still follow the field direction, not which mode is higher.`,
r(fig, ctl) {
  ctl.innerHTML = sl("w", "Marker at width", 80, 800, 5, 200) + '<div class="readout" id="ro"></div>';
  const ws = range(80, 800, 100), te = ws.map(w => C2.eim(3.5, 1, 160, w, 800, "TE")), tm = ws.map(w => C2.eim(3.5, 1, 160, w, 800, "TM"));
  let cross = null; for (let i = 1; i < ws.length; i++) if (te[i - 1] && tm[i - 1] && te[i] && tm[i] && (te[i - 1] - tm[i - 1]) * (te[i] - tm[i]) < 0) cross = ws[i - 1] + (ws[i] - ws[i - 1]) * (tm[i - 1] - te[i - 1]) / ((te[i] - tm[i]) - (te[i - 1] - tm[i - 1]));
  const u = () => {
    const w = +$("w").value; $("wv").textContent = w + " nm";
    const X = v => 60 + (v - 80) / 720 * 560, Y = v => 230 - (v - 1) / 2.2 * 200;
    const pth = a => { let d = ""; a.forEach((v, i) => { if (!v) return; d += (d ? "L" : "M") + X(ws[i]).toFixed(1) + " " + Y(v).toFixed(1); }); return d; };
    const a = C2.eim(3.5, 1, 160, w, 800, "TE"), b = C2.eim(3.5, 1, 160, w, 800, "TM");
    fig.innerHTML = svg(260, `<path d="${pth(te)}" fill="none" stroke="#378ADD" stroke-width="2.5"/><path d="${pth(tm)}" fill="none" stroke="#D85A30" stroke-width="2.5"/>${cross ? `<circle cx="${X(cross)}" cy="${Y(C2.eim(3.5, 1, 160, cross, 800, "TE"))}" r="5" fill="none" stroke="var(--t)" stroke-width="1.5"/>` : ""}<line x1="${X(w)}" x2="${X(w)}" y1="30" y2="230" stroke="#EF9F27" stroke-width="2"/><line x1="60" x2="620" y1="230" y2="230" stroke="var(--p)"/><text class="ts" x="340" y="250" text-anchor="middle">strip width, 80 to 800 nm (t = 160 nm)</text><text class="ts" x="66" y="40">blue TE-like, coral TM-like (effective index method)</text>`);
    $("ro").innerHTML = `<div><span>TE-like</span><b>${a ? a.toFixed(3) : "cut off"}</b></div><div><span>TM-like</span><b>${b ? b.toFixed(3) : "cut off"}</b></div><div><span>crossing near</span><b>${cross ? cross.toFixed(0) + " nm" : "none"}</b></div>`;
  };
  $("w").oninput = u; u();
}},

/* from old ch2 L3 card 5 */
{s: "4. Naming", t: "Why 'TE-like', and how modes are named by symmetry",
intu: String.raw`In a slab, TE and TM are exact. In a strip they are not: every mode has all six field components, so it is only mostly TE or mostly TM. Johnson et al. 1999 explain this for photonic crystal slabs: modes cannot be purely TE or TM, but they can still be classified exactly by mirror symmetry, and on the mirror plane they are purely TE or TM (Lesson 2, card 3). A strip in air has two mirrors, \(y \to -y\) and \(z \to -z\), so the thesis identifies the modes in Fig. 2.2 by their mirror symmetry in \(y\) and \(z\). A practical label is the sign pattern of \(E_y\) under the two mirrors. Click a mode to see its sign pattern in the four quadrants.`,
eq: String.raw`\[ E_{y}(-y, z) = \sigma_{y} E_{y}(y, z), \qquad E_{y}(y, -z) = \sigma_{z} E_{y}(y, z), \qquad \sigma = \pm 1 \]\[ \text{TE}_0 \ (+,+) \qquad \text{TM}_0 \ (-,-) \qquad \text{TE}_1 \ (-,+) \qquad \text{TM}_1 \ (+,-) \]`,
sym: [[String.raw`\(\sigma_{y}, \sigma_{z}\)`, String.raw`sign change of \(E_y\) under the \(y\) and \(z\) mirrors`], ["TE fraction", "share of the field in the in-plane components, used to call a mode TE-like"], [String.raw`\((+, +)\)`, String.raw`\(E_y\) even in both \(y\) and \(z\)`]],
how: [String.raw`A strip in air is symmetric under both \(y \to -y\) and \(z \to -z\).`, "Every mode must be even or odd under each mirror, giving four classes.", String.raw`Label the class by the behaviour of one chosen component, here \(E_y\).`, String.raw`\(\sigma_z\) of \(E_y\) is the mirror parity of Lesson 2: \(+\) for the TE-like family, \(-\) for the TM-like family. \(\sigma_y\) separates the fundamental from the first lateral order.`, "For higher-order modes the words TE and TM lose meaning, so the symmetry labels are the safe names."],
say: String.raw`Strip modes are hybrid, so they are called TE-like or TM-like. They are named unambiguously by their mirror symmetries, for example the sign change of \(E_y\) under \(y\) and \(z\) reflection.`,
num: String.raw`TE0: \(E_y\) has the same sign everywhere. TM0: \(E_y\) is small and changes sign in both directions (its main field is \(E_z\), which is even in both).<br>On the mirror plane \(z = 0\) the modes are exactly TE or TM (Johnson et al. 1999).`,
r(fig, ctl) {
  let md = "TE0";
  const P = { TE0: [1, 1], TM0: [-1, -1], TE1: [-1, 1], TM1: [1, -1] };
  ctl.innerHTML = btns([["TE0", "TE0"], ["TM0", "TM0"], ["TE1", "TE1"], ["TM1", "TM1"]], "m") + '<div class="readout" id="ro"></div>';
  const u = () => {
    pick(ctl, "m", md); const [sy, sz] = P[md];
    const q = (x, y, s) => `<rect x="${x}" y="${y}" width="160" height="70" fill="${s > 0 ? "#D85A30" : "#378ADD"}" opacity="0.35"/><text class="th" x="${x + 80}" y="${y + 42}" text-anchor="middle">${s > 0 ? "+" : "−"}</text>`;
    fig.innerHTML = svg(260, `${q(180, 50, 1)}${q(340, 50, sy)}${q(180, 120, sz)}${q(340, 120, sy * sz)}<rect x="180" y="50" width="320" height="140" fill="none" stroke="var(--p)" stroke-width="1.5"/><line x1="340" x2="340" y1="30" y2="210" stroke="var(--t)" stroke-dasharray="5 4"/><line x1="160" x2="520" y1="120" y2="120" stroke="var(--t)" stroke-dasharray="5 4"/><text class="ts" x="344" y="26">mirror y = 0</text><text class="ts" x="524" y="124">mirror z = 0</text><text class="ts" x="340" y="236" text-anchor="middle">sign of E<tspan baseline-shift="sub" font-size="9">y</tspan> in each quadrant of the cross-section</text>`);
    $("ro").innerHTML = `<div><span>σ<sub>y</sub></span><b>${sy > 0 ? "+1 even" : "−1 odd"}</b></div><div><span>σ<sub>z</sub></span><b>${sz > 0 ? "+1 even" : "−1 odd"}</b></div>`;
  };
  ctl.querySelectorAll("button").forEach(b => b.onclick = () => { md = b.dataset.m; u(); }); u();
}},

/* from old ch2 L3 card 4 */
{s: "5. Field maps", t: "What the strip modes look like in cross-section",
intu: String.raw`This is the idea of Fig. 2.3 of the thesis, where the four lowest modes of the 200 nm strip are computed with Tidy3D. Here the maps show \(|E|^2\) built from the two slab solutions of the effective index method, a rough sketch. Look at the edges. The TE-like mode drops just inside the side walls and jumps up again just outside them, because its main field is normal to the side walls (the jump of Eq. 2.1, Lesson 2). The TM-like mode does the same at the top and bottom surfaces, where its main field is normal, so its field is strongest just outside them. The first-order lateral modes have a dark line down the middle. Change the width and see the field spread into the air as the strip narrows.`,
eq: String.raw`\[ |E(y, z)|^{2} \approx |F(z)|^{2}\, |G(y)|^{2} \]<div class="eqref">separable approximation of the effective index method</div>`,
sym: [[String.raw`\(F(z)\)`, "vertical slab profile (Lesson 2)"], [String.raw`\(G(y)\)`, String.raw`lateral slab profile with core index \(n_{\mathrm{slab}}\)`], ["bright edges", "field jumps where the main field is normal to a surface"]],
how: [String.raw`Compute \(F(z)\) from the vertical slab of the right family.`, String.raw`Compute \(G(y)\) from the lateral slab of the swapped family, including its jump at the walls.`, "Multiply and square to get an intensity map.", "Corners are not exact in this approximation. A 2D mode solver like Tidy3D gets them right."],
say: "The TE-like mode's field jumps up just outside the side walls and the TM-like mode's field just outside the top and bottom surfaces, each because the main field is normal to that surface. Higher-order modes spread far into the air.",
num: String.raw`Intensity jump at a GaAs to air surface for the normal field: about <b>\(n^4 \approx 150\)</b> in \(|E|^2\), since \(|E|\) jumps by \(n^2 \approx 12\). The colour scale here is clipped so the core stays visible.`,
r(fig, ctl) {
  let md = "TE0";
  ctl.innerHTML = btns([["TE0", "TE-like p = 0"], ["TM0", "TM-like p = 0"], ["TE1", "TE-like p = 1"], ["TM1", "TM-like p = 1"]], "m") + sl("w", "Strip width w", 150, 700, 5, 200) + '<div class="readout" id="ro"></div>';
  const u = () => {
    pick(ctl, "m", md); const w = +$("w").value; $("wv").textContent = w + " nm";
    const fam = md.slice(0, 2), p = +md[2], t = 160, lam = 800;
    const Ns = C2.slabN(3.5, 1, t, lam, 0, fam), Ne = C2.eim(3.5, 1, t, w, lam, fam, p);
    const W = 220, H = 120, Ly = 1000, Lz = 540, ys = range(-Ly / 2, Ly / 2, W), zs = range(-Lz / 2, Lz / 2, H);
    if (!Ne) { fig.innerHTML = svg(200, `<text class="th" x="340" y="100" text-anchor="middle">this mode is cut off at w = ${w} nm</text>`); $("ro").innerHTML = ""; return; }
    const vz = C2.slabProfile(3.5, 1, t, lam, 0, fam, Ns, zs), vy = C2.slabProfile(Ns, 1, w, lam, p, fam === "TE" ? "TM" : "TE", Ne, ys);
    const F = fam === "TE" ? vz.main : vz.ez, G = fam === "TE" ? vy.ez : vy.main;
    const { ctx, img } = C2.canvas(fig, W, H, 3, `|E|² cross-section, ${Ly} nm wide and ${Lz} nm tall. White outline: the strip.`);
    let mx = 0; const I = []; for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) { const v = (F[j] * G[i]) ** 2; I.push(v); }
    const sorted = I.slice().sort((a, b) => a - b); mx = sorted[Math.floor(sorted.length * 0.995)] || 1;
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) { const [r, g, b] = C2.heat(Math.sqrt(I[j * W + i] / mx)); const o = ((H - 1 - j) * W + i) * 4; img.data[o] = r; img.data[o + 1] = g; img.data[o + 2] = b; img.data[o + 3] = 255; }
    ctx.putImageData(img, 0, 0); ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 1; ctx.strokeRect((Ly / 2 - w / 2) / Ly * W, (Lz / 2 - t / 2) / Lz * H, w / Ly * W, t / Lz * H);
    $("ro").innerHTML = `<div><span>n<sub>eff</sub> (EIM)</span><b>${Ne.toFixed(3)}</b></div><div><span>main field</span><b>${fam === "TE" ? "E<sub>y</sub>, across the width" : "E<sub>z</sub>, through the thickness"}</b></div>`;
  };
  ctl.querySelectorAll("button").forEach(b => b.onclick = () => { md = b.dataset.m; u(); });
  $("w").oninput = u; u();
}},

/* from old ch2 L2 card 5 */
{s: "6. Power in the core", t: "How much of the light is inside the GaAs",
intu: String.raw`The fraction of power that travels inside the core decides how strongly the mode feels the GaAs: how much it is slowed down, how strongly a grating etched into it scatters, how strongly a dot in the core couples. The thesis quotes this fraction for the four modes of Fig. 2.3. Here it is shown for a slab, where it can be computed exactly. A thick slab holds almost all of the fundamental mode. A thin one lets much of it into the air. A mode near its cutoff, like TE1 just above \(t \approx 119\) nm, has most of its power outside. Move the thickness and compare TE0 with TE1.`,
eq: String.raw`\[ \Gamma_{\mathrm{core}} = \frac{\int_{\mathrm{core}} |E_{y}|^{2}\, \mathrm{d}z}{\int |E_{y}|^{2}\, \mathrm{d}z} \]<div class="eqref">TE slab, equal to the fraction of power inside the core</div>`,
sym: [[String.raw`\(\Gamma_{\mathrm{core}}\)`, "fraction of the mode power inside the core"], [String.raw`\(E_{y}\)`, "TE field profile from Lesson 2"]],
how: [String.raw`For a TE slab mode, the power flow along the guide is proportional to \(|E_y|^2\) at every \(z\).`, String.raw`Integrate \(|E_y|^2\) over the core and over all \(z\).`, "Their ratio is the fraction of power inside the core.", String.raw`The tail length \(1/\gamma\) controls how much is outside. As \(n_{\mathrm{eff}} \to 1\), \(1/\gamma\) grows without bound and the fraction inside falls to zero.`],
say: "The confinement factor of the fundamental mode grows with thickness. Near cutoff a mode is mostly in the cladding and weakly guided.",
num: String.raw`\(n = 3.5\), \(\lambda = 800\) nm, TE0 computed by this card: \(t = 80\) nm ≈ <b>70 %</b>, \(t = 200\) nm ≈ <b>95 %</b>, \(t = 300\) nm ≈ <b>98 %</b>.`,
r(fig, ctl) {
  ctl.innerHTML = sl("t", "Thickness t", 20, 400, 5, 100) + '<div class="readout" id="ro"></div>';
  const ts = range(20, 400, 60);
  const g0 = ts.map(t => { const N = C2.slabN(3.5, 1, t, 800, 0, "TE"); return N ? C2.slabConfinement(3.5, 1, t, 800, 0, N) : NaN; });
  const g1 = ts.map(t => { const N = C2.slabN(3.5, 1, t, 800, 1, "TE"); return N ? C2.slabConfinement(3.5, 1, t, 800, 1, N) : NaN; });
  const u = () => {
    const t = +$("t").value; $("tv").textContent = t + " nm";
    const N0 = C2.slabN(3.5, 1, t, 800, 0, "TE"), N1 = C2.slabN(3.5, 1, t, 800, 1, "TE");
    const c0 = N0 ? C2.slabConfinement(3.5, 1, t, 800, 0, N0) : 0, c1 = N1 ? C2.slabConfinement(3.5, 1, t, 800, 1, N1) : 0;
    fig.innerHTML = svg(260, `${plot(60, 30, 560, 190, ts, g0, 20, 400, 0, 1, "#378ADD", 2.5)}${plot(60, 30, 560, 190, ts, g1, 20, 400, 0, 1, "#7F77DD", 2, "5 4")}<line x1="${60 + (t - 20) / 380 * 560}" x2="${60 + (t - 20) / 380 * 560}" y1="30" y2="220" stroke="#EF9F27" stroke-width="2"/><line x1="60" x2="620" y1="220" y2="220" stroke="var(--p)"/><line x1="60" x2="60" y1="30" y2="220" stroke="var(--p)"/><text class="ts" x="54" y="34" text-anchor="end">100 %</text><text class="ts" x="54" y="224" text-anchor="end">0</text><text class="ts" x="340" y="244" text-anchor="middle">thickness, 20 to 400 nm. Solid TE0, dashed TE1</text>`);
    $("ro").innerHTML = `<div><span>TE0 in core</span><b>${(c0 * 100).toFixed(1)} %</b></div><div><span>TE1 in core</span><b>${N1 ? (c1 * 100).toFixed(1) + " %" : "cut off"}</b></div>`;
  };
  $("t").oninput = u; u();
}},

/* from old ch2 L3 card 3, now the 200 nm argument with round numbers */
{s: "7. Why 200 nm", t: "Why a 200 nm strip is used for routing",
intu: String.raw`The thesis uses 200 nm for routing because there both fundamental modes are well guided, while the higher-order modes are only weakly guided, with effective indices close to that of the air cladding. The reasoning needs one formula, the tail length in air \(1/\gamma = 1/(k_0\sqrt{n_{\mathrm{eff}}^2 - 1})\). With round numbers at 800 nm: a mode with \(n_{\mathrm{eff}} \approx 2.5\) has a tail of about 56 nm, short compared with the strip, so most of its power is in the GaAs. A mode with \(n_{\mathrm{eff}} \approx 1.1\) has a tail of about 280 nm, longer than the strip is wide, so most of its power travels in the air. Such a mode barely feels the strip and is easily lost at bends and roughness, so light cannot be carried in it by accident. Drag the width and watch the four lowest modes. The curves come from the approximate effective index method computed in the page, the thesis values from the Tidy3D mode solver.`,
eq: String.raw`\[ \frac{1}{\gamma} = \frac{1}{k_0\sqrt{n_{\mathrm{eff}}^{2} - n_{\mathrm{c}}^{2}}}, \qquad n_{\mathrm{eff}} \to n_{\mathrm{c}} \ \Rightarrow \ \frac{1}{\gamma} \to \infty \]\[ \text{lateral cutoff (EIM): } \quad w_p = \frac{p\lambda_{0}}{2\sqrt{n_{\mathrm{slab}}^{2} - n_{\mathrm{c}}^{2}}} \]`,
sym: [[String.raw`\(1/\gamma\)`, "distance over which the field in the air falls by e"], [String.raw`\(p\)`, "lateral mode order, number of zeros across the width"], [String.raw`\(w_p\)`, "width at which lateral mode p appears"], [String.raw`\(n_{\mathrm{slab}}\)`, "slab index used as the core in the lateral problem"]],
how: [String.raw`Fundamental modes: \(n_{\mathrm{eff}}\) well above 1, short tails, the field is held in the GaAs.`, String.raw`A first lateral mode appears at its cutoff width with \(n_{\mathrm{eff}} = 1\) and an infinitely long tail.`, String.raw`Just above cutoff it has \(n_{\mathrm{eff}}\) only a little above 1. Round numbers: \(n_{\mathrm{eff}} = 1.1\) gives \(1/\gamma \approx 280\) nm.`, "Choose the width where the fundamental modes are well guided and the higher modes still sit close to the air line. Light scattered into them spreads into the air and is not carried along.", "Too narrow, and the fundamental modes themselves start to hug the air line. Too wide, and the higher modes become well guided, so the strip turns multimode."],
say: "At 200 nm both fundamental modes are well guided, with effective indices far above the air index, while the higher-order modes are only weakly guided, with effective indices close to the air cladding, so their fields spread far into the air.",
num: String.raw`Round numbers at 800 nm, \(k_0 = 2\pi/800\) nm⁻¹:<br>\(n_{\mathrm{eff}} = 2.5\): \(1/\gamma \approx\) <b>56 nm</b>. \(n_{\mathrm{eff}} = 1.5\): <b>114 nm</b>. \(n_{\mathrm{eff}} = 1.1\): <b>278 nm</b>. \(n_{\mathrm{eff}} = 1.02\): <b>633 nm</b>.<br>The effective index method is crude for strips this narrow, so the exact widths at which the higher modes appear must come from a full mode solver.`,
r(fig, ctl) {
  ctl.innerHTML = sl("w", "Strip width w", 100, 900, 5, 200) + '<div class="readout" id="ro"></div>';
  const cut = fam => { const Ns = C2.slabN(3.5, 1, 160, 800, 0, fam); return 800 / (2 * Math.sqrt(Ns * Ns - 1)); };
  const cTE = cut("TE"), cTM = cut("TM"), k0 = 2 * Math.PI / 800;
  const ws = range(100, 900, 90), L = [["TE", 0, "#378ADD", "", "TE0"], ["TM", 0, "#D85A30", "", "TM0"], ["TE", 1, "#378ADD", "5 4", "TE1"], ["TM", 1, "#D85A30", "5 4", "TM1"]];
  const cv = L.map(([f, p]) => ws.map(w => C2.eim(3.5, 1, 160, w, 800, f, p)));
  const u = () => {
    const w = +$("w").value; $("wv").textContent = w + " nm";
    const X = v => 60 + (v - 100) / 800 * 560, Y = v => 230 - (v - 1) / 2.2 * 200;
    let s = `<rect x="60" y="${Y(1.2)}" width="560" height="${Y(1) - Y(1.2)}" fill="#D85A30" opacity="0.08"/><text class="ts" x="616" y="${Y(1.1) + 4}" text-anchor="end">weakly guided, n<tspan baseline-shift="sub" font-size="9">eff</tspan> close to air</text>`;
    cv.forEach((a, i) => { let d = ""; a.forEach((v, j) => { if (!v) return; d += (d ? "L" : "M") + X(ws[j]).toFixed(1) + " " + Y(v).toFixed(1); }); s += `<path d="${d}" fill="none" stroke="${L[i][2]}" stroke-width="2" ${L[i][3] ? `stroke-dasharray="${L[i][3]}"` : ""}/>`; });
    s += `<line x1="${X(200)}" x2="${X(200)}" y1="30" y2="230" stroke="var(--p)" stroke-dasharray="2 3"/><text class="ts" x="${X(200) + 4}" y="40">200 nm</text>`;
    const vals = L.map(([f, p]) => C2.eim(3.5, 1, 160, w, 800, f, p));
    s += `<line x1="${X(w)}" x2="${X(w)}" y1="30" y2="230" stroke="#EF9F27" stroke-width="2"/><line x1="${X(cTE)}" x2="${X(cTE)}" y1="222" y2="238" stroke="#378ADD" stroke-width="2"/><line x1="${X(cTM)}" x2="${X(cTM)}" y1="222" y2="238" stroke="#D85A30" stroke-width="2"/><line x1="60" x2="620" y1="230" y2="230" stroke="var(--p)"/><line x1="60" x2="60" y1="30" y2="230" stroke="var(--p)"/><text class="ts" x="54" y="${Y(1) + 4}" text-anchor="end">1</text><text class="ts" x="54" y="${Y(3) + 4}" text-anchor="end">3</text><text class="ts" x="54" y="${Y(2) + 4}" text-anchor="end">2</text><text class="ts" x="340" y="254" text-anchor="middle">width, 100 to 900 nm. Solid fundamental, dashed first lateral order. Ticks: their cutoffs</text><text class="ts" x="66" y="22">n<tspan baseline-shift="sub" font-size="9">eff</tspan> of the four lowest modes, effective index method (approximate)</text>`;
    fig.innerHTML = svg(262, s);
    $("ro").innerHTML = L.map(([f, p, c, d, nm], i) => `<div><span>${nm}: n<sub>eff</sub>, tail 1/γ</span><b>${vals[i] ? vals[i].toFixed(2) + ", " + (1 / (k0 * Math.sqrt(vals[i] * vals[i] - 1))).toFixed(0) + " nm" : "cut off"}</b></div>`).join("");
  };
  $("w").oninput = u; u();
}},

/* from old ch2 L3 card 6 */
{s: "8. Wide sections", t: "Wide sections behave like the slab",
intu: String.raw`Couplers and multimode sections are often micrometres wide. There the side walls are far away from most of the light, and the fundamental mode has almost the slab index. Drag the width up to a few micrometres on a log scale and watch \(n_{\mathrm{eff}}\) approach the slab value. This is why a grating that is a few micrometres wide can be designed first as a 2D slab problem and then checked in 3D: the 3D index differs only slightly from the slab index. It is also why a multimode section can be treated with the lateral-mode model of Lesson 6.`,
eq: String.raw`\[ n_{\mathrm{eff}}(w) \to n_{\mathrm{slab}} \;\text{ as }\; w \to \infty \]\[ n_{\mathrm{slab}} - n_{\mathrm{eff}} \approx \frac{\lambda_{0}^{2}}{8 n_{\mathrm{slab}} w^{2}} \;\text{ for wide strips} \]`,
sym: [[String.raw`\(n_{\mathrm{slab}}\)`, "slab index (Lesson 2)"], [String.raw`\(w\)`, "section width"]],
how: [String.raw`For a wide lateral slab, the lowest lateral wavenumber is \(k_y \approx \pi/w\), Eq. 2.8 with \(\nu = 0\) and \(W_e \approx w\).`, String.raw`\(\beta^2 = k_0^2 n_{\mathrm{slab}}^2 - k_y^2\), so \(n_{\mathrm{eff}} \approx n_{\mathrm{slab}} - k_y^2/(2k_0^2 n_{\mathrm{slab}})\).`, String.raw`Substitute \(k_y = \pi/w\) and \(k_0 = 2\pi/\lambda_0\) to get the \(\lambda_0^2/(8n_{\mathrm{slab}} w^2)\) correction.`, String.raw`The same quadratic expansion gives the \(\beta_\nu\) of every lateral mode of a multimode section, Eq. 2.10 (Lesson 6).`],
say: String.raw`Sections several micrometres wide have an effective index close to the slab index, with a correction that falls as \(1/w^2\). That justifies designing wide gratings first in 2D.`,
num: String.raw`\(n = 3.5\), 160 nm, 800 nm, TE: \(n_{\mathrm{slab}} \approx 3.076\).<br>\(w = 2\) µm: correction \(\approx 800^2/(8 \times 3.076 \times 2000^2) \approx\) <b>0.0065</b><br>\(w = 10\) µm: ≈ <b>0.0003</b>`,
r(fig, ctl) {
  ctl.innerHTML = sl("lw", "Width (log scale)", Math.log10(150), Math.log10(10000), 0.01, Math.log10(2000)) + '<div class="readout" id="ro"></div>';
  const lws = range(Math.log10(150), 4, 90), Ns = C2.slabN(3.5, 1, 160, 800, 0, "TE"), te = lws.map(l => C2.eim(3.5, 1, 160, Math.pow(10, l), 800, "TE"));
  const u = () => {
    const l = +$("lw").value, w = Math.pow(10, l); $("lwv").textContent = w < 1000 ? w.toFixed(0) + " nm" : (w / 1000).toFixed(2) + " µm";
    const X = v => 60 + (v - Math.log10(150)) / (4 - Math.log10(150)) * 560, Y = v => 230 - (v - 1.8) / 1.4 * 200;
    let d = ""; te.forEach((v, i) => { if (!v) return; d += (d ? "L" : "M") + X(lws[i]).toFixed(1) + " " + Y(v).toFixed(1); });
    const N = C2.eim(3.5, 1, 160, w, 800, "TE");
    fig.innerHTML = svg(260, `<line x1="60" x2="620" y1="${Y(Ns)}" y2="${Y(Ns)}" stroke="var(--p)" stroke-dasharray="5 4"/><text class="ts" x="66" y="${Y(Ns) - 6}">slab value n<tspan baseline-shift='sub' font-size='75%'>slab</tspan> = ${Ns.toFixed(3)}</text><path d="${d}" fill="none" stroke="#378ADD" stroke-width="2.5"/><line x1="${X(l)}" x2="${X(l)}" y1="30" y2="230" stroke="#EF9F27" stroke-width="2"/><line x1="60" x2="620" y1="230" y2="230" stroke="var(--p)"/><text class="ts" x="60" y="250">150 nm</text><text class="ts" x="620" y="250" text-anchor="end">10 µm</text><text class="ts" x="340" y="250" text-anchor="middle">width (log)</text>`);
    $("ro").innerHTML = `<div><span>n<sub>eff</sub> (TE-like)</span><b>${N ? N.toFixed(4) : "cut off"}</b></div><div><span>n<sub>slab</sub> − n<sub>eff</sub></span><b>${N ? (Ns - N).toFixed(4) : "cut off"}</b></div><div><span>1/w² estimate</span><b>${(800 * 800 / (8 * Ns * w * w)).toFixed(4)}</b></div>`;
  };
  $("lw").oninput = u; u();
}}

],
summary: String.raw`For a waveguide whose cross-section does not change along \(x\), every field can be written as \(\mathbf{e}(y,z)e^{i\beta x}\), and Maxwell's equations become an eigenvalue problem on the cross-section, \(\mathcal{L}\mathbf{e} = \beta^2\mathbf{e}\). Each eigenvalue gives \(n_{\mathrm{eff}} = \beta/k_0\) of one mode, each eigenvector its shape. For a TE slab the problem is \(E'' + k_0^2n(z)^2E = \beta^2E\), and on a grid it becomes a tridiagonal matrix whose largest eigenvalues converge to the exact values as \(h^2\). Tidy3D solves the vector version for the transverse electric field by finite differences. Narrow strips lose effective index, the TE-like and TM-like curves cross at \(w = t\), modes are named by their mirror symmetries in \(y\) and \(z\), and at 200 nm both fundamental modes are well guided while the higher-order modes stay close to the air line, so their fields spread far into the air.`,
sheet: [
[String.raw`\[ \nabla\times\nabla\times\mathbf{E} = k_0^{2}\varepsilon_r\mathbf{E}, \qquad \mathbf{E} = \mathbf{e}(y,z)\,e^{i\beta x} \]`, "Wave equation and the mode ansatz"],
[String.raw`\[ \mathcal{L}\,\mathbf{e} = \beta^{2}\mathbf{e}, \qquad n_{\mathrm{eff}} = \frac{\beta}{k_0} \]`, "Eigenvalue problem on the cross-section"],
[String.raw`\[ \frac{d^{2}E}{dz^{2}} + k_0^{2}n(z)^{2}E = \beta^{2}E \]`, "Scalar slab (TE)"],
[String.raw`\[ \frac{E_{i+1} - 2E_i + E_{i-1}}{h^{2}} + k_0^{2}\varepsilon_iE_i = \beta^{2}E_i \]`, "Finite differences: a tridiagonal matrix, error of order h²"],
[String.raw`\[ \mathrm{slab}(n, t) \to n_{\mathrm{slab}}, \qquad \mathrm{slab}(n_{\mathrm{slab}}, w) \to n_{\mathrm{eff}} \]`, "Effective index method (approximate, used for the strip curves here)"],
[String.raw`\[ \frac{1}{\gamma} = \frac{1}{k_0\sqrt{n_{\mathrm{eff}}^{2} - n_{\mathrm{c}}^{2}}} \]`, "Tail length: an effective index close to 1 means weakly guided"],
[String.raw`\[ E_{y}(-y, z) = \sigma_{y} E_{y}, \qquad E_{y}(y, -z) = \sigma_{z} E_{y} \]`, "Symmetry naming"],
[String.raw`\[ n_{\mathrm{slab}} - n_{\mathrm{eff}} \approx \frac{\lambda_{0}^{2}}{8 n_{\mathrm{slab}} w^{2}} \]`, "Wide-section correction"]],
consts: String.raw`Examples: \(n = 3.5\), \(t = 160\) nm, \(\lambda_0 = 800\) nm, air cladding. Slab results are exact. Strip results use the effective index method and are illustrative only.`,
sources: ["Flexcompute Tidy3D, mode solver (finite-difference eigenmode solver for the transverse electric field), as cited in thesis Sec. 2.2", "Johnson, Fan, Villeneuve, Joannopoulos and Kolodziejski, Phys. Rev. B 60, 5751 (1999) (TE-like and TM-like, symmetry classification)", "Soldano and Pennings, J. Lightwave Technol. 13, 615 (1995) (effective index method and lateral modes of wide sections)", "Thesis Ch. 2, Sec. 2.2, Figs. 2.2 and 2.3 (effective index against width, the four lowest modes of the 200 nm strip)"]
});

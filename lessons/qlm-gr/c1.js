(function () {
/* Quantum Light and Matter, Part A: Griffiths, Introduction to Quantum Mechanics (1995).
   Chapter 1: The wave function. Seven cards following Sections 1.1 to 1.6.
   Every wave function is solved live with the Crank-Nicolson solver in qlm-common.js,
   for an electron with x in nm and t in fs (hbar = m = 1 internally). */
const { tx, rc, ln, ci, fmt, C } = QM;
const G = QM.G, DT = 0.02;
const ro = pairs => pairs.map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`).join("");
const XT = [-30, -20, -10, 0, 10, 20, 30];

/* Potentials in simulation units (1 unit = 76.20 meV). lo is the bottom of the drawn energy range. */
const POTS = {
  free:    { name: "Free",           V: x => 0,                                                        x0: -12, k0: 2,  lo: 0 },
  spring:  { name: "Spring",         V: x => 0.5 * 0.0144 * x * x,                                     x0: -12, k0: 0,  lo: 0 },
  force:   { name: "Constant force", V: x => -0.06 * x,                                                x0: -6,  k0: -1.2, lo: -1.8 },
  barrier: { name: "Thin barrier",   V: x => 2 / (1 + Math.exp((Math.abs(x - 4) - 0.6) / 0.06)),       x0: -12, k0: 1.9, lo: 0 },
  quartic: { name: "Quartic well",   V: x => 1.5e-5 * x * x * x * x,                                   x0: -14, k0: 0,  lo: 0 }
};

/* A simulation: the quantum wave and a classical particle with the same start. */
function Sim(key, x0, s0, k0, cap) {
  const P = POTS[key], V = new Float64Array(G.N);
  for (let j = 0; j < G.N; j++) V[j] = P.V(G.x[j]);
  const W = cap ? Array.from(G.x, x => Math.abs(x) > 24 ? 0.6 * ((Math.abs(x) - 24) / 6) ** 2 : 0) : null;
  const step = QM.solver(G, V, DT, W), w = QM.packet(G, x0, s0, k0);
  const S = { key, P, V, re: w.re, im: w.im, t: 0, xc: x0, vc: k0, hist: [], cap, outR: 0, outL: 0, gone: false };
  const iR = QM.idx(G, 24), iL = QM.idx(G, -24);
  const dV = x => (P.V(x + 1e-4) - P.V(x - 1e-4)) / 2e-4;
  let pk = 0; for (let j = 0; j < G.N; j++) pk = Math.max(pk, S.re[j] * S.re[j] + S.im[j] * S.im[j]);
  S.pk = pk; S.E0 = QM.expect(G, S.re, S.im, S.V).E;
  S.adv = n => {
    for (let i = 0; i < n; i++) {
      step(S.re, S.im);
      if (cap) { S.outR += QM.J(G, S.re, S.im, iR) * DT; S.outL -= QM.J(G, S.re, S.im, iL) * DT; }
      const h = DT / 8;
      for (let k = 0; k < 8 && !S.gone; k++) {
        S.vc -= dV(S.xc) * h / 2; S.xc += S.vc * h;
        if (cap && Math.abs(S.xc) > 30) { S.gone = true; break; }
        if (S.xc > 30) { S.xc = 60 - S.xc; S.vc = -S.vc; } if (S.xc < -30) { S.xc = -60 - S.xc; S.vc = -S.vc; }
        S.vc -= dV(S.xc) * h / 2;
      }
      S.t += DT;
    }
  };
  /* probability within 3 nm of the walls, used to pause before reflections from the walls spoil the picture */
  S.edge = () => QM.prob(G, S.re, S.im, -30, -27) + QM.prob(G, S.re, S.im, 27, 30);
  return S;
}

/* Draw the potential (grey, right axis in meV) and the wave in one frame. */
function simPlot(S, mode, y0, h, o) {
  o = o || {};
  const pk = S.pk, ym = mode === "reim" ? Math.sqrt(pk) * 1.3 : pk * 1.3;
  const yt = mode === "reim" ? [-ym * 0.75, 0, ym * 0.75].map(v => +v.toFixed(2)) : [0, +(ym * 0.4).toFixed(2), +(ym * 0.8).toFixed(2)];
  const F = QM.frame(60, y0, 550, h, { xmin: -30, xmax: 30, ymin: mode === "reim" ? -ym : 0, ymax: ym, xt: XT, yt, xl: o.noxl ? "" : "x (nm)", yl: mode === "reim" ? "ψ (nm⁻½)" : "|ψ|² (1/nm)" });
  let s = "";
  const lo = S.P.lo, VY = v => F.y0 + F.h * (1 - QM.clamp((v - lo) / 3, 0, 1));
  if (S.key !== "free") {
    let d = `M${F.X(-30)} ${F.y0 + F.h}`;
    for (let j = 0; j < G.N; j += 4) d += `L${F.X(G.x[j]).toFixed(1)} ${VY(S.V[j]).toFixed(1)}`;
    d += `L${F.X(30)} ${F.y0 + F.h}Z`;
    s += `<path d="${d}" fill="var(--gray-bg)" stroke="var(--p)" stroke-width="1"/>`;
    [0, 1, 2, 3].forEach(k => { const yy = F.y0 + F.h * (1 - k / 3); s += ln(F.x0 + F.w, yy, F.x0 + F.w + 4, yy, "var(--p)") + tx(F.x0 + F.w + 7, yy + 4, Math.round((lo + k) * QM.E0), "start"); });
    s += `<text class="ts" transform="translate(${F.x0 + F.w + 46} ${F.y0 + F.h / 2}) rotate(90)" text-anchor="middle">V (meV)</text>`;
  }
  if (S.cap) s += rc(F.X(-30), F.y0, F.X(-24) - F.X(-30), F.h, "var(--sunk)", "none") + rc(F.X(24), F.y0, F.X(30) - F.X(24), F.h, "var(--sunk)", "none") + tx(F.X(-27), F.y0 + F.h - 6, "exit", "middle") + tx(F.X(27), F.y0 + F.h - 6, "exit", "middle");
  s += F.s + QM.waveSVG(F, G, S.re, S.im, mode, 4);
  if (o.paused) s += tx(F.x0 + F.w / 2, F.y0 + F.h / 2, "Paused: the wave reached the edge of the window. Press Reset.", "middle", "th");
  const e = QM.expect(G, S.re, S.im, S.V);
  if (S.key !== "free" && o.energy !== false) { const yE = VY(e.E); if (yE > F.y0 && yE < F.y0 + F.h) s += ln(F.x0, yE, F.x0 + F.w, yE, C.teal, 1.2, "6 4") + tx(F.x0 + 150, yE - 5, "⟨E⟩ of the wave", "start", "ts", `fill="${C.teal}"`); }
  const xm = F.X(e.x);
  s += `<path d="M${xm - 6} ${F.y0 - 10}L${xm + 6} ${F.y0 - 10}L${xm} ${F.y0 - 1}Z" fill="${C.purple}"/>` + tx(xm, F.y0 - 13, "⟨x⟩", "middle", "ts", `fill="${C.purple}"`);
  if (mode === "phase") s += QM.wheel(F.x0 + F.w - 34, F.y0 + 30, 14);
  if (mode === "reim") s += tx(F.x0 + 8, F.y0 + 16, "Re ψ", "start", "ts", `fill="${C.blue}"`) + tx(F.x0 + 48, F.y0 + 16, "Im ψ", "start", "ts", `fill="${C.coral}"`) + tx(F.x0 + 90, F.y0 + 16, "± |ψ|", "start");
  return { s, F, e };
}
/* The classical particle on its own track under the plot. */
function newtonTrack(F, S, y) {
  return ln(F.x0, y, F.x0 + F.w, y, "var(--b)", 2) + (S.gone ? "" : ci(F.X(QM.clamp(S.xc, -30, 30)), y, 8, C.coral, "#fff")) + tx(F.x0, y + 24, S.gone ? "Newton's particle has left the window" : "Newton's particle: same start, same force, obeys m d²x/dt² = −dV/dx", "start");
}

addLesson("qlm", "gr", {
level: "Griffiths Ch. 1",
num: "Chapter 1",
id: "qlm-gr-c1", title: "The wave function", short: "Ch 1. The wave function",
labels: { intu: "What the picture shows", how: "Key steps", note: "Where this shows up later" },
big: String.raw`Classical mechanics follows a point, \(x(t)\). Quantum mechanics follows a wave, \(\Psi(x,t)\), that spreads, splits at a barrier and interferes, and the Schrödinger equation moves it forward in time (card 1). The wave is not the particle. Its square \(|\Psi|^2\) is a probability density: a measurement returns one random position, weighted by \(|\Psi|^2\), and the wave collapses (card 2). That makes probability the language of the whole theory, so cards 3 and 4 build averages, spreads and densities from scratch with Griffiths' own examples. The total probability must stay 1, and the Schrödinger equation keeps it at 1 because probability flows like a fluid (card 5). The averages \(\langle x\rangle\) and \(\langle p\rangle\) obey Newton's law (card 6). Finally a wave cannot have a sharp position and a sharp wavelength at the same time, and because wavelength is momentum, that is the uncertainty principle (card 7).`,
bridge: String.raw`<b>How to study this chapter:</b> play with each card first, then read Griffiths Chapter 1 (pages 1 to 19). Each card title carries its section number. Afterwards try Problems 1.1, 1.3, 1.4, 1.6 and 1.12 on paper, then check your answers against cards 3, 4, 4, 7 and 6. All waves here are solved live in the page for an electron, with x in nm and t in fs.`,
cards: [

/* ---------------- 1.1 ---------------- */
{ s: "1. Schrödinger equation", t: "1.1 The Schrödinger equation: Newton's law for waves",
intu: String.raw`The coloured shape is the wave function of one electron, computed live from the Schrödinger equation. Newton's particle (the ball below the plot) starts at the same place with the same momentum and feels the same force. Press <b>Play</b> and compare. With <b>Free</b> the wave moves at the classical speed, but it also spreads. With <b>Thin barrier</b> the classical ball bounces back whenever its energy is below the barrier top, while the wave splits: part of it tunnels through. With <b>Spring</b> the wave sloshes back and forth exactly like the ball. Switch the view to <b>Re and Im</b>: the real and imaginary parts chase each other, and that chase is what makes the wave move. The <b>phase colour</b> view shows the same thing in one picture: the height is \(|\Psi|^2\) and the colour is the phase. Fast colour cycling in space means large momentum. The grey strips at both ends are exits that absorb the wave, so it can leave the window instead of bouncing off a wall, and the readouts count how much probability left each way. With the barrier, the right exit count is the <b>transmission probability</b>.`,
eq: String.raw`\[ i\hbar\,\frac{\partial \Psi}{\partial t} = -\frac{\hbar^2}{2m}\,\frac{\partial^2 \Psi}{\partial x^2} + V(x)\,\Psi \]<div class="eqref">Griffiths Eq. [1.1]</div>\[ m\,\frac{d^2 x}{dt^2} = -\frac{\partial V}{\partial x} \qquad \text{(Newton, for comparison)} \]`,
sym: [[String.raw`\(\Psi(x,t)\)`, "wave function, a complex number at every x and t, units nm⁻½ in 1D"], [String.raw`\(\hbar\)`, "h/2π = 1.0546 × 10⁻³⁴ J s = 0.6582 eV fs"], [String.raw`\(m\)`, "particle mass, here the free electron mass"], [String.raw`\(V(x)\)`, "potential energy, the grey shape (right axis)"], [String.raw`\(i\)`, "√−1. Its presence forces Ψ to be complex"]],
how: [String.raw`Newton: give \(x(0)\) and \(v(0)\), and \(F = ma\) gives \(x(t)\) forever. Quantum mechanics: give \(\Psi(x,0)\), and the Schrödinger equation gives \(\Psi(x,t)\) forever.`, String.raw`The equation is first order in time, so the initial wave alone is enough. No separate initial velocity is needed, because the motion is coded in the phase of \(\Psi\).`, String.raw`Try a plane wave \(e^{i(kx-\omega t)}\) with \(V = 0\). It solves the equation if \(\hbar\omega = \hbar^2k^2/2m\). With \(E = \hbar\omega\) (Planck) and \(p = \hbar k\) (de Broglie) that is just \(E = p^2/2m\).`, String.raw`A localized packet is a sum of such plane waves. Each one moves with its own speed, which is why the packet spreads.`, String.raw`Here the equation is solved on a 1201 point grid with the Crank-Nicolson method, which keeps the total probability exactly 1.`],
say: String.raw`The Schrödinger equation is the quantum equation of motion: given the wave function at one time, it determines the wave function at all later times, just as Newton's law determines x(t).`,
note: String.raw`In Gerry and Knight Chapter 2 a single mode of light turns out to obey the same mathematics as a particle in the <b>Spring</b> potential. The "position" becomes a field quadrature. Everything you see here carries over to photons.`,
num: String.raw`Electron with \(k_0 = 2\) nm⁻¹: wavelength \(\lambda = 2\pi/k_0 = 3.14\) nm, speed \(\hbar k_0/m = 231.6\) km/s, energy \(\hbar^2k_0^2/2m = 152.4\) meV. It crosses 10 nm in 43 fs. The thin barrier is 152 meV high and 1.2 nm wide. The default \(k_0 = 1.9\) nm⁻¹ gives Newton's ball 137.5 meV, so it always reflects, yet a visible part of the wave gets through.`,
r(fig, ctl) {
  let key = "barrier", mode = "phase", S;
  ctl.innerHTML = btns(Object.keys(POTS).map(k => [k, POTS[k].name]), "pot") + btns([["phase", "Phase colour"], ["reim", "Re and Im"], ["prob", "|ψ|² only"]], "vw") + sl("k0", "Momentum k₀ (1/nm)", -3, 3, 0.1, 1.9) + sl("s0", "Packet width σ (nm)", 0.5, 3, 0.1, 1) + `<div class="readout" id="ro"></div>`;
  const reset = (fromPot) => {
    if (fromPot) { $("k0").value = POTS[key].k0; }
    S = Sim(key, POTS[key].x0, +$("s0").value, +$("k0").value, true);
    $("k0v").textContent = $("k0").value + " /nm"; $("s0v").textContent = $("s0").value + " nm";
    draw();
  };
  const draw = () => {
    pick(ctl, "pot", key); pick(ctl, "vw", mode);
    const P = simPlot(S, mode, 28, 200);
    fig.innerHTML = svg(320, P.s + newtonTrack(P.F, S, 282));
    $("ro").innerHTML = ro([["time", fmt(S.t * QM.T0, 0) + " fs"], ["⟨x⟩ of the wave", P.e.n > 0.05 ? fmt(P.e.x, 2) + " nm" : "has left"], ["Newton's x", S.gone ? "has left" : fmt(S.xc, 2) + " nm"], ["⟨E⟩ at the start", fmt(S.E0 * QM.E0, 1) + " meV"], ["still in view (between the exits)", fmt(QM.prob(G, S.re, S.im, -24, 24), 3)], ["left through the right exit", fmt(S.outR, 3)], ["left through the left exit", fmt(S.outL, 3)]]);
  };
  ctl.querySelectorAll("button[data-pot]").forEach(b => b.onclick = () => { key = b.dataset.pot; reset(true); });
  ctl.querySelectorAll("button[data-vw]").forEach(b => b.onclick = () => { mode = b.dataset.vw; draw(); });
  $("k0").oninput = () => reset(); $("s0").oninput = () => reset();
  QM.player(ctl, () => { if (S.t < 400) S.adv(6); draw(); }, () => reset());
  reset();
}},

/* ---------------- 1.2 ---------------- */
{ s: "2. Measurement", t: "1.2 The statistical interpretation: measurement and collapse",
intu: String.raw`This is Griffiths' Figure 1.2 brought to life. Before a measurement the electron has no position, only the wave. Press <b>Measure position</b>: the answer is random, more likely near A, unlikely near B, and the wave instantly <b>collapses</b> to a spike at the result (Figure 1.3). Press Measure again right away and you get the same answer, which is why the collapse must happen. Now press <b>Play</b> and let the spike evolve: within a few femtoseconds it spreads out again, so a later measurement gives a new random answer. <b>Measure 1000 copies</b> measures 1000 electrons prepared in the same state (Griffiths' row of bottles): the histogram rebuilds \(|\Psi|^2\). The slider shades a 1 nm window and shows the probability of finding the electron there.`,
eq: String.raw`\[ |\Psi(x,t)|^2\,dx = \left\{\begin{array}{c}\text{probability of finding the particle}\\ \text{between } x \text{ and } x+dx \text{ at time } t\end{array}\right\} \]<div class="eqref">Griffiths Eq. [1.3], Born's statistical interpretation</div>\[ P(a \le x \le b,\ t) = \int_a^b |\Psi(x,t)|^2\,dx \]`,
sym: [[String.raw`\(|\Psi|^2 = \Psi^*\Psi\)`, "probability density, real and never negative even though Ψ is complex"], [String.raw`\(dx\)`, "a small interval around x"], [String.raw`\(\Psi^*\)`, "complex conjugate of Ψ"], [String.raw`\(P\)`, "probability that a position measurement lands between a and b"]],
how: [String.raw`\(\Psi\) is complex, but \(\Psi^*\Psi\) is real and never negative, so it can serve as a probability density.`, String.raw`Born's rule is a postulate. It is not derived. It is tested every day by experiments like the 1000 copy histogram.`, String.raw`One measurement gives one definite number. Quantum mechanics predicts only the odds, even when \(\Psi\) is known perfectly.`, String.raw`An immediate repeat must give the same number, so the measurement must have changed \(\Psi\) into a spike at that point. That is the collapse.`, String.raw`After the collapse the Schrödinger equation takes over again and the spike spreads, so the repeat must come quickly.`],
say: String.raw`|Ψ(x,t)|² is a probability density: |Ψ|² dx is the probability that a position measurement at time t finds the particle between x and x + dx, and a measurement collapses Ψ to a spike at the result.`,
note: String.raw`<b>Where did the particle sit before you measured?</b> The <b>realist</b> (Einstein) says at C, so quantum mechanics is incomplete. The <b>orthodox</b> view (Bohr, Copenhagen) says nowhere, the measurement made it take a stand. The <b>agnostic</b> (Pauli) refuses to answer. Bell's theorem (1964) and the experiments after it rule against the realist with local hidden variables. Gerry and Knight test this with photons in Section 9.6, and Appendix B gives the measurement theory.`,
num: String.raw`A free Gaussian spike of width \(\sigma_0\) spreads as \(\sigma(t) = \sigma_0\sqrt{1 + (\hbar t/2m\sigma_0^2)^2}\). Its width doubles at \(t = 2\sqrt{3}\,m\sigma_0^2/\hbar\). For an electron found within \(\sigma_0 = 0.2\) nm (the spike here): <b>1.2 fs</b>. For \(\sigma_0 = 1\) nm: 29.9 fs. For a proton within 0.2 nm: 2.2 ps. Heavy things stay put, light things spread fast.`,
r(fig, ctl) {
  ctl.innerHTML = `<div class="row"><button id="ms">Measure position</button><button id="en">Measure 1000 copies</button><button id="so">Start over</button></div>` + sl("wc", "Window centre (nm)", -25, 25, 0.5, -8) + `<div class="readout" id="ro"></div>`;
  const V = new Float64Array(G.N), step = QM.solver(G, V, 0.0025);
  let re, im, t, last, nmeas, hist, collapsed;
  const init = () => {
    re = new Float64Array(G.N); im = new Float64Array(G.N);
    QM.packet(G, -8, 1.4, 0.8, re, im, 1); QM.packet(G, -19, 2.6, -0.5, re, im, 0.32); QM.packet(G, 7, 2, 1.2, re, im, 0.55);
    QM.normalize(G, re, im); t = 0; last = null; nmeas = 0; hist = null; collapsed = false;
  };
  const draw = () => {
    const w = +$("wc").value; $("wcv").textContent = w + " nm";
    let pk = 0; for (let j = 0; j < G.N; j++) pk = Math.max(pk, re[j] * re[j] + im[j] * im[j]);
    const ym = Math.max(0.3, pk * 1.15), dy = ym > 1.5 ? 0.5 : ym > 0.6 ? 0.2 : 0.1, yt = [];
    for (let v = 0; v <= ym; v += dy) yt.push(+v.toFixed(1));
    const F = QM.frame(60, 24, 560, 230, { xmin: -30, xmax: 30, ymin: 0, ymax: ym, xt: XT, yt, xl: "x (nm)", yl: "|ψ|² (1/nm)" });
    let s = F.s;
    if (hist) { const tot = hist.reduce((a, b) => a + b, 0); hist.forEach((c, i) => { const d = c / tot; if (d > 0) s += rc(F.X(-30 + i), F.Y(Math.min(d, ym)), F.X(-29 + i) - F.X(-30 + i) - 1, F.Y(0) - F.Y(Math.min(d, ym)), C.teal, "none", 'fill-opacity="0.35"'); }); }
    // shaded window
    const xs = [], ys = []; for (let j = QM.idx(G, w - 0.5); j <= QM.idx(G, w + 0.5); j++) { xs.push(G.x[j]); ys.push(re[j] * re[j] + im[j] * im[j]); }
    s += QM.area(F, xs, ys, C.amber, 0.55);
    s += QM.waveSVG(F, G, re, im, "prob");
    if (!collapsed) {
      [["A", -8], ["B", -1.6], ["C", 7]].forEach(([l, x]) => { const j = QM.idx(G, x), yv = F.Y(re[j] * re[j] + im[j] * im[j]); s += ln(F.X(x), F.Y(0), F.X(x), F.Y(0) + 6, "var(--t)", 1.5) + tx(F.X(x), yv - 8, l, "middle", "th"); });
    }
    if (last != null) s += `<path d="M${F.X(last) - 7} ${F.y0 + F.h + 46}L${F.X(last) + 7} ${F.y0 + F.h + 46}L${F.X(last)} ${F.y0 + F.h + 36}Z" fill="${C.coral}"/>` + tx(F.X(last), F.y0 + F.h + 62, `found at ${fmt(last, 2)} nm`, "middle", "th", `fill="${C.coral}"`);
    if (hist) s += tx(F.x0 + F.w - 6, F.y0 + 16, "teal bars: 1000 measured copies", "end", "ts", `fill="${C.teal}"`);
    fig.innerHTML = svg(330, s);
    const e = QM.expect(G, re, im);
    $("ro").innerHTML = ro([["time since last measurement", collapsed ? fmt(t * QM.T0, 2) + " fs" : "not measured yet"], ["measurements made", nmeas], ["spread σ of the wave", fmt(e.sx, 2) + " nm"], ["P(in the 1 nm window)", fmt(QM.prob(G, re, im, w - 0.5, w + 0.5), 3)]]);
  };
  $("ms").onclick = () => { const x = QM.sample(G, re, im); last = x; nmeas++; hist = null; collapsed = true; t = 0; re.fill(0); im.fill(0); QM.packet(G, x, 0.2, 0, re, im); draw(); };
  $("en").onclick = () => { const c = QM.cdf(G, re, im); hist = new Array(60).fill(0); for (let i = 0; i < 1000; i++) { const x = QM.draw(G, c); hist[QM.clamp(Math.floor(x + 30), 0, 59)]++; } draw(); };
  $("so").onclick = () => { init(); draw(); };
  $("wc").oninput = draw;
  init();
  /* the clock speeds up as the spike spreads: about 1.3 fs per second at first, up to 50 fs per second later */
  QM.player(ctl, () => { if (t < 60) { const n = QM.clamp(Math.round(1 + 24 * t), 1, 40); for (let i = 0; i < n; i++) step(re, im); t += n * 0.0025; } hist = null; draw(); });
  draw();
}},

/* ---------------- 1.3 discrete ---------------- */
{ s: "3. Probability: discrete", t: "1.3 Probability with a discrete variable: Griffiths' room of 14 people",
intu: String.raw`Before using \(|\Psi|^2\) we need the language of probability. Start with Griffiths' room (Figure 1.4). The <b>most probable</b> age is the tallest stack (coral), the <b>median</b> splits the people in half (teal), and the <b>average</b> \(\langle j\rangle\) is the balance point (purple). Notice nobody is actually 21, the average age. In quantum mechanics the average is called the <b>expectation value</b>, and the same warning holds: it need not be a value you can ever measure. The shaded band is \(\langle j\rangle \pm \sigma\). Load <b>Fig. 1.5 sharp</b> and <b>Fig. 1.5 flat</b>: same average, same median, same most probable value, very different \(\sigma\). Add and remove people to see how each number reacts. <b>Pick 200 at random</b> draws people with replacement: the running average wanders, then settles on \(\langle j\rangle\).`,
eq: String.raw`\[ P(j) = \frac{N(j)}{N}, \qquad \sum_j P(j) = 1 \]\[ \langle j\rangle = \sum_j j\,P(j), \qquad \langle f(j)\rangle = \sum_j f(j)\,P(j) \]\[ \sigma^2 \equiv \langle(\Delta j)^2\rangle = \langle j^2\rangle - \langle j\rangle^2 \]<div class="eqref">Griffiths Eqs. [1.5] to [1.12]</div>`,
sym: [[String.raw`\(N(j)\)`, "number of people with age j"], [String.raw`\(N\)`, "total number of people"], [String.raw`\(P(j)\)`, "probability that a person picked at random has age j"], [String.raw`\(\langle j\rangle\)`, "average (expectation value) of j"], [String.raw`\(\Delta j\)`, "j − ⟨j⟩, deviation from the average"], [String.raw`\(\sigma\)`, "standard deviation, the size of the spread"]],
how: [String.raw`The average deviation is useless: \(\langle \Delta j\rangle = \langle j\rangle - \langle j\rangle = 0\), positives and negatives cancel.`, String.raw`So square first: \(\sigma^2 = \sum (j - \langle j\rangle)^2 P(j)\).`, String.raw`Expand: \(\sum (j^2 - 2j\langle j\rangle + \langle j\rangle^2)P(j) = \langle j^2\rangle - 2\langle j\rangle\langle j\rangle + \langle j\rangle^2\).`, String.raw`So \(\sigma^2 = \langle j^2\rangle - \langle j\rangle^2\), and since \(\sigma^2 \ge 0\), \(\langle j^2\rangle \ge \langle j\rangle^2\), equal only when there is no spread.`],
say: String.raw`The expectation value ⟨j⟩ is the probability-weighted average, the standard deviation σ measures the spread around it, and σ² = ⟨j²⟩ − ⟨j⟩².`,
note: String.raw`In Gerry and Knight Chapter 2 and 3 the variable becomes the photon number n. A laser (coherent state) has a Poisson P(n) with \(\sigma^2 = \langle n\rangle\), and a thermal lamp has \(\sigma^2 = \langle n\rangle + \langle n\rangle^2\). Telling light sources apart by their \(\sigma\) is exactly this card.`,
num: String.raw`Griffiths' room: \(N = 14\), \(\langle j\rangle = 294/14 = 21\), \(\langle j^2\rangle = 6434/14 = 459.6\), \(\langle j\rangle^2 = 441\), so \(\sigma = \sqrt{18.6} = 4.31\) years. Median 23, most probable 25. Two babies aged 1 and 3: \(\langle j^2\rangle = 5\) but \(\langle j\rangle^2 = 4\) (Griffiths' warning). With 200 random picks the running average typically lands within \(\sigma/\sqrt{200} = 0.3\) years of 21.`,
r(fig, ctl) {
  const PRE = { room: { 14: 1, 15: 1, 16: 3, 22: 2, 24: 2, 25: 5 }, sharp: { 3: 1, 4: 1, 5: 6, 6: 1, 7: 1 }, flat: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 2, 6: 1, 7: 1, 8: 1, 9: 1 }, babies: { 1: 1, 3: 1 } };
  let Nj = new Array(31).fill(0), run = null, pre = "room";
  const load = k => { pre = k; Nj = new Array(31).fill(0); Object.entries(PRE[k]).forEach(([j, n]) => Nj[+j] = n); run = null; };
  ctl.innerHTML = btns([["room", "Griffiths' room"], ["sharp", "Fig. 1.5 sharp"], ["flat", "Fig. 1.5 flat"], ["babies", "Two babies"]], "pre") + sl("ag", "Age j", 0, 30, 1, 20) + `<div class="row"><button id="add">Add a person</button><button id="rem">Remove a person</button><button id="pk">Pick 200 at random</button></div><div class="readout" id="ro"></div>`;
  const draw = () => {
    pick(ctl, "pre", pre); const ag = +$("ag").value; $("agv").textContent = ag;
    const N = Nj.reduce((a, b) => a + b, 0), nmax = Math.max(4, ...Nj) + 1;
    const F = QM.frame(60, 24, 560, 180, { xmin: -0.5, xmax: 30.5, ymin: 0, ymax: nmax, xt: [0, 5, 10, 15, 20, 25, 30], yt: Array.from({ length: nmax + 1 }, (_, i) => i).filter(i => i % (nmax > 8 ? 2 : 1) === 0), xl: "age j", yl: "N(j)" });
    let s = "";
    let mean = 0, m2 = 0, mode = 0, med = 0;
    if (N > 0) {
      Nj.forEach((n, j) => { mean += j * n / N; m2 += j * j * n / N; if (n > Nj[mode]) mode = j; });
      const list = []; Nj.forEach((n, j) => { for (let k = 0; k < n; k++) list.push(j); });
      med = N % 2 ? list[(N - 1) / 2] : (list[N / 2 - 1] + list[N / 2]) / 2;
      const sg = Math.sqrt(Math.max(0, m2 - mean * mean));
      s += rc(F.X(mean - sg), F.y0, F.X(mean + sg) - F.X(mean - sg), F.h, "var(--purple-bg)", "none", 'fill-opacity="0.8"');
    }
    s += F.s;
    s += rc(F.X(ag - 0.5), F.y0, F.X(ag + 0.5) - F.X(ag - 0.5), F.h, "none", "var(--accent)", 'stroke-dasharray="3 3"');
    Nj.forEach((n, j) => { for (let k = 0; k < n; k++) s += rc(F.X(j - 0.45), F.Y(k + 1), F.X(j + 0.45) - F.X(j - 0.45), F.Y(k) - F.Y(k + 1) - 1, j === mode && N ? C.coral : C.blue, "var(--panel)", 'fill-opacity="0.75"'); });
    if (N > 0) {
      const sg = Math.sqrt(Math.max(0, m2 - mean * mean));
      s += ln(F.X(mean), F.y0, F.X(mean), F.y0 + F.h, C.purple, 2.5) + tx(F.X(mean), F.y0 - 6, `⟨j⟩ = ${fmt(mean, 2)}`, "middle", "th", `fill="${C.purple}"`);
      s += ln(F.X(med), F.y0 + 14, F.X(med), F.y0 + F.h, C.teal, 2, "5 4") + tx(F.X(med) + (med >= mean ? 4 : -4), F.y0 + 26, "median", med >= mean ? "start" : "end", "ts", `fill="${C.teal}"`);
      s += `<line x1="${F.X(mean - sg)}" y1="${F.y0 + F.h - 12}" x2="${F.X(mean + sg)}" y2="${F.y0 + F.h - 12}" stroke="${C.purple}" stroke-width="1.5" marker-start="url(#ar)" marker-end="url(#ar)"/>` + tx(F.X(mean + sg) + 4, F.y0 + F.h - 8, "±σ", "start", "ts", `fill="${C.purple}"`);
    }
    // running average of random picks
    const R = QM.frame(60, 252, 560, 90, { xmin: 0, xmax: 200, ymin: 0, ymax: 30, xt: [0, 50, 100, 150, 200], yt: [0, 10, 20, 30], xl: "number of people picked at random", yl: "running avg" });
    s += R.s;
    if (run && N > 0) { s += ln(R.X(0), R.Y(mean), R.X(200), R.Y(mean), C.purple, 1, "4 3"); s += QM.path(R, run.map((_, i) => i + 1), run, C.coral, 2); s += tx(R.X(200) - 4, R.Y(mean) - 6, "⟨j⟩", "end", "ts", `fill="${C.purple}"`); }
    else s += tx(R.X(100), R.Y(15) + 4, "press Pick 200 at random", "middle");
    fig.innerHTML = svg(380, s);
    const sg = N ? Math.sqrt(Math.max(0, m2 - mean * mean)) : 0;
    $("ro").innerHTML = N ? ro([["N people", N], ["most probable", mode], ["median", fmt(med, 1)], ["⟨j⟩", fmt(mean, 3)], ["⟨j²⟩", fmt(m2, 2)], ["⟨j⟩²", fmt(mean * mean, 2)], ["σ", fmt(sg, 3)]]) : ro([["N people", "0, the room is empty"]]);
  };
  ctl.querySelectorAll("button[data-pre]").forEach(b => b.onclick = () => { load(b.dataset.pre); draw(); });
  $("ag").oninput = draw;
  $("add").onclick = () => { if (Nj[+$("ag").value] < 12) Nj[+$("ag").value]++; run = null; pre = ""; draw(); };
  $("rem").onclick = () => { if (Nj[+$("ag").value] > 0) Nj[+$("ag").value]--; run = null; pre = ""; draw(); };
  $("pk").onclick = () => { const N = Nj.reduce((a, b) => a + b, 0); if (!N) return; const list = []; Nj.forEach((n, j) => { for (let k = 0; k < n; k++) list.push(j); }); run = []; let s = 0; for (let i = 0; i < 200; i++) { s += list[Math.floor(Math.random() * N)]; run.push(s / (i + 1)); } draw(); };
  load("room"); draw();
}},

/* ---------------- 1.3 continuous ---------------- */
{ s: "4. Probability: continuous", t: "1.3 Continuous variables: probability density, with the broken speedometer",
intu: String.raw`For a continuous variable the chance of any exact value is zero, so we use a <b>density</b> \(\rho\): \(\rho(x)\,dx\) is the probability of landing between \(x\) and \(x+dx\). Here is Griffiths' broken speedometer (Problems 1.3 and 1.4). Flick the needle and it stops at a random angle, every angle between 0 and π equally likely, so \(\rho(\theta)\) is flat. Now switch to its <b>shadow</b> \(x = r\cos\theta\) on the floor. The shadow piles up near the ends, because near the pins the needle is almost horizontal and a big change of angle barely moves the shadow. Same random event, very different density. Flick a few thousand times and the histogram fills in the curve. The amber window shows a probability as an area under \(\rho\). This is exactly how you will read \(|\Psi|^2\).`,
eq: String.raw`\[ P_{ab} = \int_a^b \rho(x)\,dx, \qquad \int_{-\infty}^{\infty} \rho(x)\,dx = 1 \]\[ \langle x\rangle = \int x\,\rho(x)\,dx, \qquad \sigma^2 = \langle x^2\rangle - \langle x\rangle^2 \]<div class="eqref">Griffiths Eqs. [1.14] to [1.19]</div>\[ \rho(\theta) = \frac{1}{\pi}, \qquad \rho(x) = \frac{1}{\pi\sqrt{r^2 - x^2}} \quad (|x| \lt r) \]`,
sym: [[String.raw`\(\rho(x)\)`, "probability density, probability per unit length"], [String.raw`\(P_{ab}\)`, "probability of a result between a and b, the area under ρ"], [String.raw`\(\theta\)`, "needle angle, 0 to π"], [String.raw`\(r\)`, "needle length"], [String.raw`\(x = r\cos\theta\)`, "position of the needle tip's shadow"]],
how: [String.raw`All angles are equally likely and the total must be 1, so \(\rho(\theta) = 1/\pi\) on \([0, \pi]\).`, String.raw`The same event, written in either variable, has the same probability: \(\rho(x)\,|dx| = \rho(\theta)\,|d\theta|\).`, String.raw`With \(x = r\cos\theta\), \(|dx/d\theta| = r\sin\theta = \sqrt{r^2 - x^2}\).`, String.raw`So \(\rho(x) = \dfrac{1/\pi}{\sqrt{r^2 - x^2}}\), which blows up at \(x = \pm r\) yet still has area 1.`],
say: String.raw`A probability density ρ(x) gives probability per unit length, so ρ(x) dx is the probability of a result between x and x + dx, and probabilities are areas under ρ.`,
note: String.raw`In Gerry and Knight Chapter 5 you build histograms of photon arrival times and click delays exactly like this, and the shape of the density (bunched, flat or with a dip) tells you what kind of light you have.`,
num: String.raw`Angle: \(\langle\theta\rangle = \pi/2 = 1.571\), \(\sigma_\theta = \pi/\sqrt{12} = 0.907\). Shadow: \(\langle x\rangle = 0\), \(\langle x^2\rangle = r^2/2\), \(\sigma_x = r/\sqrt{2} = 0.707\,r\). The outer 10 % of the floor range (\(|x| \gt 0.9r\)) catches \(\tfrac{2}{\pi}\arccos 0.9 = 28.7\,\%\) of all flicks. With 2000 flicks the sample \(\sigma\) is usually within 2 % of the exact value.`,
r(fig, ctl) {
  let v = "x", sm = [];
  ctl.innerHTML = btns([["th", "Angle θ"], ["x", "Shadow x"]], "v") + `<div class="row"><button id="f1">Flick once</button><button id="f100">Flick 100 times</button><button id="f2k">Flick 2000 times</button><button id="clr">Clear</button></div>` + sl("wc", "Amber window centre", 0, 1, 0.01, 0.9) + `<div class="readout" id="ro"></div>`;
  const flick = n => { for (let i = 0; i < n; i++) sm.push(Math.random() * Math.PI); if (sm.length > 20000) sm = sm.slice(-20000); draw(); };
  const draw = () => {
    pick(ctl, "v", v);
    const wf = +$("wc").value; let s = "";
    // gauge
    const gx = 150, gy = 190, R = 110;
    s += `<path d="M${gx - R - 12} ${gy}A${R + 12} ${R + 12} 0 0 1 ${gx + R + 12} ${gy}Z" fill="var(--sunk)" stroke="var(--b)"/>`;
    for (let k = 0; k <= 12; k++) { const a = k / 12 * Math.PI; s += ln(gx + (R + 2) * Math.cos(a), gy - (R + 2) * Math.sin(a), gx + (R + 10) * Math.cos(a), gy - (R + 10) * Math.sin(a), "var(--p)", 1); }
    s += ci(gx - R - 6, gy - 4, 4, "var(--t)") + ci(gx + R + 6, gy - 4, 4, "var(--t)") + tx(gx + R + 4, gy + 16, "θ = 0", "middle") + tx(gx - R - 4, gy + 16, "θ = π", "middle");
    sm.slice(-40).forEach(a => s += ln(gx, gy, gx + R * Math.cos(a), gy - R * Math.sin(a), C.blue, 1, "", 'stroke-opacity="0.25"'));
    const fy = gy + 44;
    s += ln(gx - R - 10, fy, gx + R + 10, fy, "var(--p)", 1.5) + tx(gx, fy + 18, "floor: shadow x from −r to +r", "middle");
    sm.slice(-40).forEach(a => s += ci(gx + R * Math.cos(a), fy, 2.5, C.purple, "none", 'fill-opacity="0.35"'));
    if (sm.length) {
      const a = sm[sm.length - 1], X = gx + R * Math.cos(a), Y = gy - R * Math.sin(a);
      s += ln(X, Y, X, fy, C.purple, 1, "3 3") + `<line x1="${gx}" y1="${gy}" x2="${X.toFixed(1)}" y2="${Y.toFixed(1)}" stroke="${C.coral}" stroke-width="4" stroke-linecap="round"/>` + ci(X, fy, 5, C.purple);
      s += tx(gx, gy - R - 22, `last flick: θ = ${fmt(a, 2)} rad, x = ${fmt(Math.cos(a), 2)} r`, "middle", "th");
    } else s += tx(gx, gy - R - 22, "press Flick", "middle", "th");
    s += ci(gx, gy, 6, "var(--t)");
    // histogram
    const isX = v === "x", lo = isX ? -1 : 0, hi = isX ? 1 : Math.PI, nb = 40, bw = (hi - lo) / nb;
    const dens = isX ? (q => 1 / (Math.PI * Math.sqrt(Math.max(1e-9, 1 - q * q)))) : (() => 1 / Math.PI);
    const ymax = isX ? 2.2 : 0.6;
    const F = QM.frame(345, 30, 300, 200, { xmin: lo, xmax: hi, ymin: 0, ymax, xt: isX ? [-1, -0.5, 0, 0.5, 1] : [0, Math.PI / 2, Math.PI], xf: isX ? (t => t) : (t => ["0", "π/2", "π"][Math.round(t / (Math.PI / 2))]), yt: isX ? [0, 0.5, 1, 1.5, 2] : [0, 0.2, 0.4, 0.6], xl: isX ? "shadow x (units of r)" : "angle θ (rad)", yl: isX ? "ρ(x)" : "ρ(θ)" });
    const vals = sm.map(a => isX ? Math.cos(a) : a), hist = new Array(nb).fill(0);
    vals.forEach(q => hist[QM.clamp(Math.floor((q - lo) / bw), 0, nb - 1)]++);
    const half = 0.1 * (hi - lo) / 2, wcx = lo + wf * (hi - lo), wa = Math.max(lo, wcx - half), wb = Math.min(hi, wcx + half);
    s += rc(F.X(wa), F.y0, F.X(wb) - F.X(wa), F.h, C.amber, "none", 'fill-opacity="0.18"');
    if (vals.length) hist.forEach((c, i) => { const d = c / (vals.length * bw); s += rc(F.X(lo + i * bw) + 0.5, F.Y(Math.min(d, ymax)), F.X(lo + bw) - F.X(lo) - 1, F.Y(0) - F.Y(Math.min(d, ymax)), C.blue, "none", 'fill-opacity="0.45"'); });
    s += F.s;
    const qs = []; for (let i = 0; i <= 300; i++) qs.push(lo + (hi - lo) * i / 300);
    s += QM.path(F, qs, qs.map(dens), C.coral, 2.5) + tx(F.x0 + F.w / 2, F.y0 + 16, isX ? "exact ρ(x) = 1 / (π√(r² − x²))" : "exact ρ(θ) = 1/π", "middle", "ts", `fill="${C.coral}"`);
    fig.innerHTML = svg(300, s);
    // numbers
    const Pex = isX ? (Math.acos(wa) - Math.acos(wb)) / Math.PI : (wb - wa) / Math.PI;
    const Psm = vals.length ? vals.filter(q => q >= wa && q <= wb).length / vals.length : NaN;
    let m = 0, m2 = 0; vals.forEach(q => { m += q; m2 += q * q; }); if (vals.length) { m /= vals.length; m2 /= vals.length; }
    $("ro").innerHTML = ro([["flicks", sm.length], ["sample mean", vals.length ? fmt(m, 3) : "none yet"], ["sample σ", vals.length ? fmt(Math.sqrt(Math.max(0, m2 - m * m)), 3) : "none yet"], ["exact σ", isX ? "0.707 r" : "0.907 rad"], ["window P exact", fmt(Pex, 3)], ["window, fraction of flicks", vals.length ? fmt(Psm, 3) : "none yet"]]);
  };
  ctl.querySelectorAll("button[data-v]").forEach(b => b.onclick = () => { v = b.dataset.v; draw(); });
  $("f1").onclick = () => flick(1); $("f100").onclick = () => flick(100); $("f2k").onclick = () => flick(2000); $("clr").onclick = () => { sm = []; draw(); };
  $("wc").oninput = draw;
  draw();
}},

/* ---------------- 1.4 ---------------- */
{ s: "5. Normalization", t: "1.4 Normalization: why the total probability stays 1",
intu: String.raw`The electron must be somewhere, so the area under \(|\Psi|^2\) must be 1. The slider <b>Multiply ψ by A</b> shows that any multiple of a solution is still a solution, so we pick the one constant that makes the area 1. That is <b>normalizing</b>. The real question is Griffiths' "but wait a minute": will it <i>stay</i> 1? Press <b>Play</b>. The wave hits the barrier and splits, yet the total in the readout never moves. The reason is local: probability flows like a fluid with current \(J\) (the arrows at the edges of the amber region). The probability inside the region changes only by what flows in at \(a\) minus what flows out at \(b\), and the readout checks that balance live. Then try <b>Plane wave</b>: \(|\Psi|^2\) is the same everywhere, the area grows with the region you choose, and over the whole line it is infinite. A plane wave can never be normalized.`,
eq: String.raw`\[ \int_{-\infty}^{\infty} |\Psi(x,t)|^2\,dx = 1 \]<div class="eqref">Griffiths Eq. [1.20]</div>\[ \frac{\partial |\Psi|^2}{\partial t} = -\frac{\partial J}{\partial x}, \qquad J = \frac{\hbar}{m}\,\mathrm{Im}\!\left(\Psi^*\frac{\partial\Psi}{\partial x}\right) \]\[ \frac{d}{dt}\int_a^b |\Psi|^2 dx = J(a) - J(b) \quad\Rightarrow\quad \frac{d}{dt}\int_{-\infty}^{\infty} |\Psi|^2 dx = 0 \]<div class="eqref">Griffiths Eqs. [1.25] to [1.27]</div>`,
sym: [[String.raw`\(A\)`, "normalization constant, fixed by the area condition"], [String.raw`\(J(x,t)\)`, "probability current, probability per unit time flowing past x to the right"], [String.raw`\(\mathrm{Im}\)`, "imaginary part"], [String.raw`\(a, b\)`, "edges of the amber region"]],
how: [String.raw`If \(\Psi\) solves the Schrödinger equation, so does \(A\Psi\). Choose \(|A|\) so the area is 1. The phase of \(A\) is free and has no physical meaning.`, String.raw`Differentiate the area in time: \(\frac{d}{dt}\int|\Psi|^2 = \int \left(\Psi^*\frac{\partial\Psi}{\partial t} + \frac{\partial\Psi^*}{\partial t}\Psi\right)dx\).`, String.raw`Replace \(\partial\Psi/\partial t\) with the Schrödinger equation and its conjugate. The \(V\) terms cancel because \(V\) is real.`, String.raw`What remains is a perfect derivative: \(\frac{\partial|\Psi|^2}{\partial t} = -\frac{\partial J}{\partial x}\). Integrate over all \(x\): the result is \(J(+\infty) - J(-\infty) = 0\), because a normalizable \(\Psi\) vanishes at infinity.`],
say: String.raw`A physical wave function is square integrable and normalized to 1, and the Schrödinger equation preserves that normalization because probability obeys a continuity equation with current J.`,
note: String.raw`The current \(J\) is the matter version of the Poynting vector, and the continuity equation is the same one that conserves energy in Maxwell's equations. In Gerry and Knight the plane wave problem returns: field modes are normalized in a box of volume V, which is where the vacuum field per photon \(\sqrt{\hbar\omega/2\varepsilon_0 V}\) comes from.`,
num: String.raw`A Gaussian of width \(\sigma\) is normalized by \(A = (2\pi\sigma^2)^{-1/4}\), so for \(\sigma = 1\) nm, \(A = 0.632\) nm⁻½ and the peak of \(|\Psi|^2\) is 0.399 nm⁻¹. Moving at 231.6 km/s, the current at the peak is \(J \approx |\Psi|^2 v = 0.092\) per fs: about 9 % of the electron's probability passes that point each femtosecond.`,
r(fig, ctl) {
  let mode = "pk", S, Aamp = 1, histT = [], histP = [], histN = [], lastRate = null;
  ctl.innerHTML = btns([["pk", "Wave packet"], ["pw", "Plane wave"]], "m") + sl("A", "Multiply ψ by A", 0.3, 1.6, 0.01, 1) + `<div class="row"><button id="nz">Normalize (A = 1)</button></div>` + sl("ra", "Region from a (nm)", -28, 26, 0.5, -2) + sl("rb", "Region to b (nm)", -26, 28, 0.5, 10) + `<div class="readout" id="ro"></div>`;
  const reset = () => { S = Sim("barrier", -12, 1, 2); if (mode === "pw") { for (let j = 0; j < G.N; j++) { S.re[j] = 0.25 * Math.cos(1.5 * G.x[j]); S.im[j] = 0.25 * Math.sin(1.5 * G.x[j]); } } histT = []; histP = []; histN = []; lastRate = null; draw(null); };
  const draw = rate => {
    if (rate != null) lastRate = rate; else rate = lastRate;
    pick(ctl, "m", mode);
    Aamp = +$("A").value; $("Av").textContent = fmt(Aamp, 2);
    let a = +$("ra").value, b = +$("rb").value; if (b < a + 1) { b = a + 1; } $("rav").textContent = a + " nm"; $("rbv").textContent = b + " nm";
    const A2 = Aamp * Aamp, ym = 0.7;
    const F = QM.frame(60, 26, 550, 170, { xmin: -30, xmax: 30, ymin: 0, ymax: ym, xt: XT, yt: [0, 0.2, 0.4, 0.6], xl: "x (nm)", yl: "|Aψ|² (1/nm)" });
    let s = "";
    if (mode === "pk") { let d = `M${F.X(-30)} ${F.y0 + F.h}`; for (let j = 0; j < G.N; j += 4) d += `L${F.X(G.x[j]).toFixed(1)} ${(F.y0 + F.h * (1 - Math.min(S.V[j] / 3, 1))).toFixed(1)}`; s += d ? `<path d="${d}L${F.X(30)} ${F.y0 + F.h}Z" fill="var(--gray-bg)" stroke="var(--p)"/>` : ""; }
    s += rc(F.X(a), F.y0, F.X(b) - F.X(a), F.h, C.amber, "none", 'fill-opacity="0.15"') + F.s;
    const sr = S.re.map(v => v * Aamp), si = S.im.map(v => v * Aamp);
    s += QM.waveSVG(F, G, sr, si, "phase", 4);
    const Ja = QM.J(G, S.re, S.im, QM.idx(G, a)), Jb = QM.J(G, S.re, S.im, QM.idx(G, b));
    const arr = (x, Jv, lab) => { const L = QM.clamp(Jv * 500, -60, 60), y = F.y0 + 20; return (Math.abs(L) > 2 ? `<line x1="${F.X(x)}" y1="${y}" x2="${(F.X(x) + L).toFixed(1)}" y2="${y}" stroke="${C.red}" stroke-width="3" marker-end="url(#ar)"/>` : "") + ln(F.X(x), F.y0, F.X(x), F.y0 + F.h, C.amber, 1.5) + tx(F.X(x), F.y0 + F.h + 46, lab, "middle", "th", `fill="${C.amber}"`); };
    s += arr(a, Ja, "a") + arr(b, Jb, "b");
    // time traces
    const total = A2 * QM.norm(G, S.re, S.im), Pab = A2 * QM.prob(G, S.re, S.im, a, b);
    const T = QM.frame(60, 268, 550, 80, { xmin: 0, xmax: Math.max(50, S.t * QM.T0 * 1.05), ymin: 0, ymax: Math.max(1.2, total * 1.1), xt: [], yt: [0, 0.5, 1], xl: "time (fs)", yl: "probability" });
    s += T.s;
    if (histT.length > 1) { s += QM.path(T, histT, histN, "var(--t)", 2) + QM.path(T, histT, histP, C.amber, 2.5); s += tx(T.x0 + T.w - 4, T.Y(histN[histN.length - 1]) - 5, `total = ${fmt(histN[histN.length - 1], 4)}`, "end") + tx(T.x0 + T.w - 4, T.Y(histP[histP.length - 1]) + 14, "inside a to b", "end", "ts", `fill="${C.amber}"`); }
    else s += tx(T.x0 + T.w / 2, T.y0 + 44, "press Play to record the probabilities in time", "middle");
    s += tx(T.x0 + T.w, T.y0 + T.h + 16, fmt(Math.max(50, S.t * QM.T0 * 1.05), 0), "end") + tx(T.x0, T.y0 + T.h + 16, "0", "middle");
    if (S.paused) s += tx(F.x0 + 8, F.y0 + 16, "Paused at the edge of the window. Press Reset.", "start", "th");
    if (mode === "pw") s += tx(F.x0 + 8, F.y0 + 40, `plane wave: area over a to b = |A|² × 0.0625 nm⁻¹ × (b − a) = ${fmt(Pab, 3)}, over all x: infinite`, "start", "ts");
    fig.innerHTML = svg(370, s);
    $("ro").innerHTML = mode === "pk" ? ro([["total ∫|Aψ|²dx", fmt(total, 5)], ["inside a to b", fmt(Pab, 4)], ["d/dt (inside), per fs", rate == null ? "press Play" : fmt(A2 * rate / QM.T0, 5)], ["J(a) − J(b), per fs", fmt(A2 * (Ja - Jb) / QM.T0, 5)]]) : ro([["∫ over a to b", fmt(Pab, 3)], ["∫ over all x", "grows without limit, cannot normalize"]]);
    return { a, b };
  };
  ctl.querySelectorAll("button[data-m]").forEach(b => b.onclick = () => { mode = b.dataset.m; reset(); });
  $("A").oninput = () => draw(null); $("nz").onclick = () => { $("A").value = 1; draw(null); };
  $("ra").oninput = () => { histT = []; histP = []; histN = []; draw(null); }; $("rb").oninput = $("ra").oninput;
  QM.player(ctl, () => {
    if (S.t > 300 || (mode === "pk" && S.edge() > 2e-3)) { S.paused = mode === "pk"; draw(null); return; }
    const a = +$("ra").value, b = Math.max(+$("rb").value, a + 1);
    const p0 = QM.prob(G, S.re, S.im, a, b); const t0 = S.t;
    if (mode === "pw") { const w = 1.5 * 1.5 / 2; S.t += 6 * DT; for (let j = 0; j < G.N; j++) { const ph = 1.5 * G.x[j] - w * S.t; S.re[j] = 0.25 * Math.cos(ph); S.im[j] = 0.25 * Math.sin(ph); } }
    else S.adv(6);
    const rate = (QM.prob(G, S.re, S.im, a, b) - p0) / (S.t - t0);
    histT.push(S.t * QM.T0); histP.push(Aamp * Aamp * QM.prob(G, S.re, S.im, a, b)); histN.push(Aamp * Aamp * QM.norm(G, S.re, S.im));
    draw(rate);
  }, () => reset());
  reset();
}},

/* ---------------- 1.5 ---------------- */
{ s: "6. Momentum", t: "1.5 Momentum, expectation values and Ehrenfest's theorem",
intu: String.raw`\(\langle x\rangle\) is the average of many position measurements on identically prepared electrons, not the average of repeated measurements on one. As the wave moves, \(\langle x\rangle\) moves, and its rate of change times \(m\) is \(\langle p\rangle\). In the lower plot the blue line is \(\langle p\rangle\) computed from the momentum operator \(\frac{\hbar}{i}\frac{\partial}{\partial x}\) sandwiched between \(\Psi^*\) and \(\Psi\), and the dots are \(m\,d\langle x\rangle/dt\) read off the purple curve above it. They agree, which is Eq. 1.33. Now compare the purple \(\langle x\rangle(t)\) with Newton's particle (coral dashes). For <b>Free</b>, <b>Spring</b> and <b>Constant force</b> they sit on top of each other. That is <b>Ehrenfest's theorem</b>: expectation values obey Newton's law. Choose the <b>Quartic well</b> and watch them drift apart. Ehrenfest is exact, but it uses the force <i>averaged over the packet</i>, \(\langle -V'\rangle\), and for a quartic well that is not the force at the average position.`,
eq: String.raw`\[ \langle x\rangle = \int \Psi^*\,x\,\Psi\,dx, \qquad \langle p\rangle = m\frac{d\langle x\rangle}{dt} = \int \Psi^*\left(\frac{\hbar}{i}\frac{\partial}{\partial x}\right)\Psi\,dx \]<div class="eqref">Griffiths Eqs. [1.33] to [1.35]</div>\[ \langle Q(x,p)\rangle = \int \Psi^*\,Q\!\left(x, \tfrac{\hbar}{i}\tfrac{\partial}{\partial x}\right)\Psi\,dx, \qquad \frac{d\langle p\rangle}{dt} = \left\langle -\frac{\partial V}{\partial x}\right\rangle \]<div class="eqref">Griffiths Eq. [1.36] and Problem 1.12 (Ehrenfest)</div>`,
sym: [[String.raw`\(\langle x\rangle\)`, "expectation value of position, the ensemble average"], [String.raw`\(\langle p\rangle\)`, "expectation value of momentum"], [String.raw`\(\frac{\hbar}{i}\frac{\partial}{\partial x}\)`, "the momentum operator: an instruction to differentiate and multiply by −iħ"], [String.raw`\(Q(x,p)\)`, "any dynamical quantity, for example kinetic energy p²/2m"], [String.raw`\(\langle -V'\rangle\)`, "force averaged over the probability density"]],
how: [String.raw`Differentiate \(\langle x\rangle = \int x|\Psi|^2dx\) in time and use the continuity equation of card 5: \(\frac{d\langle x\rangle}{dt} = -\int x\,\frac{\partial J}{\partial x}\,dx\).`, String.raw`Integrate by parts (the boundary term vanishes): \(\frac{d\langle x\rangle}{dt} = \int J\,dx\). So \(m\frac{d\langle x\rangle}{dt}\) is \(m\) times the total current.`, String.raw`Write \(J\) out and integrate by parts once more: \(m\frac{d\langle x\rangle}{dt} = \int\Psi^*\frac{\hbar}{i}\frac{\partial\Psi}{\partial x}dx\). That is why \(\frac{\hbar}{i}\frac{\partial}{\partial x}\) represents momentum.`, String.raw`The same steps for \(d\langle p\rangle/dt\) give \(\langle -\partial V/\partial x\rangle\) (Problem 1.12). For a potential at most quadratic in \(x\), \(\langle V'(x)\rangle = V'(\langle x\rangle)\) and the average moves exactly like Newton's particle.`],
say: String.raw`The expectation value ⟨Q⟩ is the average over an ensemble of identically prepared systems, computed by sandwiching the operator for Q between Ψ* and Ψ, and Ehrenfest's theorem says d⟨p⟩/dt = ⟨−∂V/∂x⟩.`,
note: String.raw`The operator idea is the heart of Chapter 3, and in Gerry and Knight every observable of light (photon number, field quadratures, phase) is an operator sandwiched the same way. Ehrenfest also explains why a laser beam behaves like a classical wave: a coherent state's averages follow the classical equations.`,
num: String.raw`Spring here: \(\hbar\omega = 9.14\) meV, period 452 fs. Free electron with \(k_0 = 2\) nm⁻¹: \(\langle p\rangle = 2\hbar/\text{nm} = 2.11\times10^{-25}\) kg m/s, so \(\langle v\rangle = 231.6\) km/s. Constant force here: 0.06 units, which is 4.57 meV/nm, an electric field of 4.57 MV/m.`,
r(fig, ctl) {
  let key = "spring", S, H;
  ctl.innerHTML = btns([["free", "Free"], ["spring", "Spring"], ["force", "Constant force"], ["quartic", "Quartic well"]], "pot") + sl("k0", "Momentum k₀ (1/nm)", -3, 3, 0.1, 0) + sl("s0", "Packet width σ (nm)", 0.5, 3, 0.1, 1.5) + `<div class="readout" id="ro"></div>`;
  const reset = fromPot => { if (fromPot) $("k0").value = POTS[key].k0; S = Sim(key, POTS[key].x0, +$("s0").value, +$("k0").value); H = { t: [], x: [], xc: [], p: [], v: [] }; record(); draw(); };
  const record = () => { const e = QM.expect(G, S.re, S.im, S.V); H.t.push(S.t); H.x.push(e.x); H.xc.push(S.xc); H.p.push(e.p); const n = H.t.length; H.v.push(n > 2 ? (H.x[n - 1] - H.x[n - 3]) / (H.t[n - 1] - H.t[n - 3]) : NaN); };
  const draw = () => {
    pick(ctl, "pot", key); $("k0v").textContent = $("k0").value + " /nm"; $("s0v").textContent = $("s0").value + " nm";
    const P = simPlot(S, "phase", 26, 140, { noxl: true, paused: S.paused });
    let s = P.s + ci(P.F.X(QM.clamp(S.xc, -30, 30)), P.F.y0 + P.F.h + 12, 6, C.coral, "#fff") + tx(P.F.X(QM.clamp(S.xc, -30, 30)), P.F.y0 + P.F.h + 30, "Newton", "middle", "ts", `fill="${C.coral}"`);
    const tmax = Math.max(60, S.t * 1.05), ft = t => fmt(t * QM.T0, 0);
    const X = QM.frame(60, 210, 550, 90, { xmin: 0, xmax: tmax, ymin: -30, ymax: 30, xt: [0, tmax / 2, tmax], xf: ft, yt: [-20, 0, 20], yl: "x (nm)" });
    s += X.s + QM.path(X, H.t, H.x, C.purple, 3) + QM.path(X, H.t, H.xc, C.coral, 2, "6 4");
    s += tx(X.x0 + 8, X.y0 + 14, "⟨x⟩(t)", "start", "ts", `fill="${C.purple}"`) + tx(X.x0 + 60, X.y0 + 14, "Newton x(t)", "start", "ts", `fill="${C.coral}"`);
    const pm = Math.max(1, ...H.p.map(Math.abs)) * 1.6;
    const Pp = QM.frame(60, 330, 550, 80, { xmin: 0, xmax: tmax, ymin: -pm, ymax: pm, xt: [0, tmax / 2, tmax], xf: ft, yt: [-+(pm * 0.6).toFixed(1), 0, +(pm * 0.6).toFixed(1)], xl: "time (fs)", yl: "p (ħ/nm)" });
    s += Pp.s + QM.path(Pp, H.t, H.p, C.blue, 2.5);
    for (let i = 3; i < H.t.length; i += 8) if (Number.isFinite(H.v[i])) s += ci(Pp.X(H.t[i - 1]), Pp.Y(QM.clamp(H.v[i], -pm, pm)), 3, "none", "var(--t)", 'stroke-width="1.2"');
    s += tx(Pp.x0 + 8, Pp.y0 + 14, "⟨p⟩ from the operator (line)   m d⟨x⟩/dt (dots)", "start", "ts", `fill="${C.blue}"`);
    fig.innerHTML = svg(450, s);
    const e = P.e, dVa = -(POTS[key].V(e.x + 1e-4) - POTS[key].V(e.x - 1e-4)) / 2e-4, n = H.t.length;
    $("ro").innerHTML = ro([["⟨p⟩ (operator)", fmt(e.p, 3) + " ħ/nm"], ["m d⟨x⟩/dt", n > 2 && Number.isFinite(H.v[n - 1]) ? fmt(H.v[n - 1], 3) + " ħ/nm" : "press Play"], ["⟨−dV/dx⟩, force on the wave", fmt(e.F * QM.E0, 3) + " meV/nm"], ["−V′(⟨x⟩), force at the average", fmt(dVa * QM.E0, 3) + " meV/nm"], ["⟨x⟩ − Newton x", fmt(e.x - S.xc, 2) + " nm"]]);
  };
  ctl.querySelectorAll("button[data-pot]").forEach(b => b.onclick = () => { key = b.dataset.pot; reset(true); });
  $("k0").oninput = () => reset(); $("s0").oninput = () => reset();
  QM.player(ctl, () => { if (S.t < 140 && S.edge() < 2e-3) { S.adv(5); record(); } else S.paused = S.edge() >= 2e-3; draw(); }, () => reset());
  reset();
}},

/* ---------------- 1.6 ---------------- */
{ s: "7. Uncertainty", t: "1.6 The uncertainty principle: position or wavelength, never both",
intu: String.raw`Griffiths' rope: shake it rhythmically and you get a clear wavelength but no clear position (Figure 1.6). Jerk it once and you get a clear position but no wavelength (Figure 1.7). The top plot is the wave, the lower left is how much of each momentum it contains, \(|\phi(p)|^2\), computed live by Fourier transform. Make the packet <b>narrower</b>: the momentum distribution gets <b>wider</b>. Make it wider: the momentum sharpens. Because \(p = h/\lambda\) (de Broglie), a spread of wavelengths is a spread of momenta. The lower right plot is the \((\sigma_x, \sigma_p)\) plane. The grey region below the curve \(\sigma_x\sigma_p = \hbar/2\) is forbidden. The <b>Gaussian</b> rides exactly on the curve, it is the minimum uncertainty shape. The <b>flat-top train</b> always sits above it. Changing \(k_0\) shifts the momentum peak but never changes the spreads.`,
eq: String.raw`\[ p = \frac{h}{\lambda} = \frac{2\pi\hbar}{\lambda} \]<div class="eqref">Griffiths Eq. [1.39], de Broglie</div>\[ \sigma_x\,\sigma_p \ \ge\ \frac{\hbar}{2} \]<div class="eqref">Griffiths Eq. [1.40], Heisenberg</div>\[ \phi(p) = \frac{1}{\sqrt{2\pi\hbar}}\int \Psi(x)\,e^{-ipx/\hbar}\,dx \]`,
sym: [[String.raw`\(\lambda\)`, "wavelength of the wave"], [String.raw`\(\sigma_x\)`, "standard deviation of position measurements"], [String.raw`\(\sigma_p\)`, "standard deviation of momentum measurements"], [String.raw`\(\phi(p)\)`, "momentum space wave function, the Fourier transform of Ψ (Chapter 3)"], [String.raw`\(k_0\)`, "central wave number, p₀ = ħk₀"]],
how: [String.raw`A single wavelength means a plane wave, which fills all space. To localize a wave you must add many wavelengths that cancel everywhere except in one region.`, String.raw`Fourier analysis makes this exact: a packet of width \(\Delta x\) needs a spread of wave numbers \(\Delta k \gtrsim 1/\Delta x\).`, String.raw`de Broglie turns wave numbers into momenta, \(p = \hbar k\), so \(\Delta p \gtrsim \hbar/\Delta x\).`, String.raw`With standard deviations the sharp bound is \(\sigma_x\sigma_p \ge \hbar/2\), reached only by a Gaussian. Griffiths proves the general form in Chapter 3.`],
say: String.raw`The more precisely a particle's position is defined, the less precisely its momentum is, and the standard deviations obey σx σp ≥ ħ/2, with equality only for a Gaussian.`,
note: String.raw`This card is the doorway to quantum optics. In Gerry and Knight the two field quadratures \(X_1, X_2\) obey \(\Delta X_1\,\Delta X_2 \ge 1/4\). Laser light (a coherent state, Chapter 3) is the Gaussian on the curve. <b>Squeezed light</b> (Chapter 7) makes one spread smaller than the vacuum by making the other larger, while staying on the curve.`,
num: String.raw`Electron with \(\sigma_x = 1\) nm: \(\sigma_p \ge 0.5\,\hbar/\text{nm}\), a velocity spread of 57.9 km/s, and a confinement kinetic energy of at least \(\sigma_p^2/2m = 9.5\) meV. In GaAs (\(m^* = 0.067\,m_e\)) that becomes 142 meV, which is why a dot only a few nm across has its levels far apart. A 0.145 kg baseball located to 1 µm has \(\sigma_v \ge 3.6\times10^{-28}\) m/s, nothing you could ever notice.`,
r(fig, ctl) {
  let shape = "g";
  ctl.innerHTML = btns([["g", "Gaussian"], ["t", "Flat-top train"]], "sh") + sl("w", "Width σ or train length", 0.4, 8, 0.1, 2) + sl("k0", "Centre k₀ (1/nm)", 0.5, 4, 0.1, 2) + `<div class="readout" id="ro"></div>`;
  const draw = () => {
    pick(ctl, "sh", shape);
    const w = +$("w").value, k0 = +$("k0").value, L = 4 * w;
    $("wv").textContent = shape === "g" ? `σ = ${fmt(w, 1)} nm` : `L = ${fmt(L, 1)} nm`; $("k0v").textContent = fmt(k0, 1) + " /nm";
    const re = new Float64Array(G.N), im = new Float64Array(G.N);
    for (let j = 1; j < G.N - 1; j++) {
      const x = G.x[j]; let env;
      if (shape === "g") env = Math.exp(-x * x / (4 * w * w));
      else { const hw = L / 2, tp = 0.8, ax = Math.abs(x); env = ax < hw - tp ? 1 : ax < hw ? Math.cos(Math.PI / 2 * (ax - hw + tp) / tp) ** 2 : 0; }
      re[j] = env * Math.cos(k0 * x); im[j] = env * Math.sin(k0 * x);
    }
    QM.normalize(G, re, im);
    const e = QM.expect(G, re, im);
    let s = "";
    const F = QM.frame(60, 22, 560, 120, { xmin: -20, xmax: 20, ymin: -1.1, ymax: 1.1, xt: [-20, -10, 0, 10, 20], yt: [-1, 0, 1], xl: "x (nm)", yl: "Re ψ (scaled)" });
    let mx = 0; for (let j = 0; j < G.N; j++) mx = Math.max(mx, Math.hypot(re[j], im[j]));
    const xs = Array.from(G.x), rs = xs.map((_, j) => re[j] / mx), ms = xs.map((_, j) => Math.hypot(re[j], im[j]) / mx);
    s += F.s + QM.path(F, xs, ms, "var(--p)", 1, "3 3") + QM.path(F, xs, ms.map(v => -v), "var(--p)", 1, "3 3") + QM.path(F, xs, rs, C.blue, 1.8);
    s += `<line x1="${F.X(e.x - e.sx)}" y1="${F.y0 + 12}" x2="${F.X(e.x + e.sx)}" y2="${F.y0 + 12}" stroke="${C.purple}" stroke-width="2" marker-start="url(#ar)" marker-end="url(#ar)"/>` + tx(F.X(e.x + e.sx) + 6, F.y0 + 16, "2σₓ", "start", "ts", `fill="${C.purple}"`);
    const lam = 2 * Math.PI / k0; s += `<line x1="${F.X(0)}" y1="${F.y0 + F.h - 10}" x2="${F.X(lam)}" y2="${F.y0 + F.h - 10}" stroke="${C.coral}" stroke-width="2" marker-start="url(#ar)" marker-end="url(#ar)"/>` + tx(F.X(lam) + 6, F.y0 + F.h - 6, "λ", "start", "ts", `fill="${C.coral}"`);
    // momentum distribution
    const ks = [], ph = []; let pmx = 0;
    for (let i = 0; i <= 240; i++) {
      const k = k0 - 5 + 10 * i / 240; let a = 0, b = 0;
      for (let j = 0; j < G.N; j += 2) { const c = Math.cos(k * G.x[j]), sn = Math.sin(k * G.x[j]); a += re[j] * c + im[j] * sn; b += im[j] * c - re[j] * sn; }
      const v = (a * a + b * b) * (2 * G.dx) * (2 * G.dx) / (2 * Math.PI); ks.push(k); ph.push(v); pmx = Math.max(pmx, v);
    }
    const Pk = QM.frame(60, 196, 310, 130, { xmin: k0 - 5, xmax: k0 + 5, ymin: 0, ymax: pmx * 1.15, xt: [k0 - 4, k0 - 2, k0, k0 + 2, k0 + 4].map(v => +v.toFixed(1)), yt: [], xl: "p (ħ/nm)", yl: "|φ(p)|²" });
    s += Pk.s + QM.area(Pk, ks, ph, C.coral, 0.25) + QM.path(Pk, ks, ph, C.coral, 2.2);
    s += `<line x1="${Pk.X(e.p - e.sp)}" y1="${Pk.y0 + 12}" x2="${Pk.X(e.p + e.sp)}" y2="${Pk.y0 + 12}" stroke="${C.purple}" stroke-width="2" marker-start="url(#ar)" marker-end="url(#ar)"/>` + tx(Pk.X(e.p + e.sp) + 6, Pk.y0 + 16, "2σₚ", "start", "ts", `fill="${C.purple}"`);
    // sigma plane
    const U = QM.frame(450, 196, 170, 130, { xmin: 0, xmax: 6, ymin: 0, ymax: 2, xt: [0, 2, 4, 6], yt: [0, 1, 2], xl: "σₓ (nm)", yl: "σₚ (ħ/nm)" });
    const xx = [], yy = []; for (let i = 1; i <= 120; i++) { const q = 0.25 + i / 120 * 5.75; xx.push(q); yy.push(0.5 / q); }
    let d = `M${U.X(0.25)} ${U.Y(0)}`; xx.forEach((q, i) => d += `L${U.X(q).toFixed(1)} ${Math.max(U.y0, U.Y(yy[i])).toFixed(1)}`); d += `L${U.X(6)} ${U.Y(0)}Z`;
    s += `<path d="${d}" fill="var(--gray-bg)"/>` + U.s + QM.path(U, xx, yy, "var(--t)", 1.5) + tx(U.X(4.6), U.Y(0.1) - 2, "forbidden", "middle");
    s += ci(U.X(Math.min(e.sx, 6)), U.Y(Math.min(e.sp, 2)), 6, C.purple, "#fff") + tx(U.X(3.2), U.Y(1.7), "σₓσₚ = ħ/2", "start");
    fig.innerHTML = svg(370, s);
    $("ro").innerHTML = ro([["σₓ", fmt(e.sx, 3) + " nm"], ["σₚ", fmt(e.sp, 3) + " ħ/nm"], ["σₓ σₚ", fmt(e.sx * e.sp, 3) + " ħ (min 0.5)"], ["λ = 2π/k₀", fmt(lam, 2) + " nm"], ["wavelengths across 4σₓ", fmt(4 * e.sx / lam, 1)], ["⟨p⟩", fmt(e.p, 2) + " ħ/nm"]]);
  };
  ctl.querySelectorAll("button[data-sh]").forEach(b => b.onclick = () => { shape = b.dataset.sh; draw(); });
  $("w").oninput = draw; $("k0").oninput = draw;
  draw();
}}
],
summary: String.raw`A quantum particle is described by a complex wave function Ψ(x,t), and the Schrödinger equation moves it forward in time the way Newton's law moves x(t). |Ψ|² is a probability density. A measurement gives one random result weighted by |Ψ|² and collapses the wave, which then spreads again. Expectation values ⟨Q⟩ = ∫Ψ*QΨ dx are ensemble averages, the spread is σ² = ⟨Q²⟩ − ⟨Q⟩², and momentum is the operator (ħ/i)∂/∂x. Normalization ∫|Ψ|² = 1 is preserved because probability obeys a continuity equation. Averages obey Newton's law with the force averaged over the packet (Ehrenfest). Since p = h/λ and a localized wave needs many wavelengths, σx σp ≥ ħ/2.`,
sheet: [
[String.raw`\[ i\hbar\,\partial_t\Psi = -\frac{\hbar^2}{2m}\partial_x^2\Psi + V\Psi \]`, "Schrödinger equation [1.1]"],
[String.raw`\[ |\Psi(x,t)|^2dx = \text{probability between } x \text{ and } x+dx \]`, "Born's statistical interpretation [1.3]"],
[String.raw`\[ \langle j\rangle = \sum_j jP(j), \quad \sigma^2 = \langle j^2\rangle - \langle j\rangle^2 \]`, "Average and spread, discrete [1.7], [1.12]"],
[String.raw`\[ P_{ab} = \int_a^b\rho\,dx, \quad \langle x\rangle = \int x\rho\,dx \]`, "Probability density, continuous [1.15], [1.17]"],
[String.raw`\[ \int|\Psi|^2dx = 1, \quad \partial_t|\Psi|^2 = -\partial_x J, \quad J = \frac{\hbar}{m}\mathrm{Im}(\Psi^*\partial_x\Psi) \]`, "Normalization and its conservation [1.20], [1.25]"],
[String.raw`\[ \langle p\rangle = m\frac{d\langle x\rangle}{dt} = \int\Psi^*\frac{\hbar}{i}\partial_x\Psi\,dx \]`, "Momentum operator [1.33], [1.35]"],
[String.raw`\[ \langle Q\rangle = \int\Psi^*Q\!\left(x,\tfrac{\hbar}{i}\partial_x\right)\Psi\,dx, \quad \frac{d\langle p\rangle}{dt} = \langle -\partial_xV\rangle \]`, "Expectation values [1.36] and Ehrenfest (Problem 1.12)"],
[String.raw`\[ p = \frac{h}{\lambda}, \quad \sigma_x\sigma_p \ge \frac{\hbar}{2} \]`, "de Broglie [1.39] and Heisenberg [1.40]"],
[String.raw`\[ \Psi_{\text{Gauss}} = (2\pi\sigma^2)^{-1/4}e^{-(x-x_0)^2/4\sigma^2 + ik_0x}, \quad \sigma(t) = \sigma\sqrt{1 + (\hbar t/2m\sigma^2)^2} \]`, "The Gaussian packet used in these cards and its free spreading"]],
consts: String.raw`\(\hbar = 1.0546\times10^{-34}\) J s \(= 0.6582\) eV fs, \(m_e = 9.109\times10^{-31}\) kg, \(\hbar^2/(m_e\,\text{nm}^2) = 76.20\) meV, \(\hbar/(m_e\,\text{nm}) = 115.8\) km/s`,
sources: ["D. J. Griffiths, Introduction to Quantum Mechanics (Prentice Hall, 1995), Chapter 1, Sections 1.1 to 1.6, Figures 1.1 to 1.7 and Problems 1.1 to 1.12", "E. Schrödinger, Ann. Phys. 79, 361 (1926), the wave equation", "M. Born, Z. Phys. 37, 863 (1926), the statistical interpretation", "W. Heisenberg, Z. Phys. 43, 172 (1927), the uncertainty relation", "P. Ehrenfest, Z. Phys. 45, 455 (1927), expectation values obey classical mechanics", "N. D. Mermin, Physics Today 38 (4), 38 (1985), \"Is the moon there when nobody looks?\" (cited by Griffiths for the interpretations)", "J. Crank and P. Nicolson, Proc. Camb. Phil. Soc. 43, 50 (1947), the time-stepping scheme used to solve every wave in this lesson"]
});
})();

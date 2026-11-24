(function () {
/* Quantum Light and Matter, Part A: Griffiths, Introduction to Quantum Mechanics (1995).
   Chapter 2: The time-independent Schrodinger equation. Eight cards following Sections 2.1 to 2.7.
   Electron units as in Chapter 1: x in nm, t in fs, energies in meV (hbar = m = 1 internally,
   1 time unit = 8.638 fs, 1 energy unit = 76.20 meV). */
const { tx, rc, ln, ci, fmt, C } = QM;
const ro = pairs => pairs.map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`).join("");
const NC = [C.blue, C.coral, C.teal, C.purple, C.amber, C.green, C.red];
const ar = (x1, y1, x2, y2, col, w) => `<line x1="${(+x1).toFixed(1)}" y1="${(+y1).toFixed(1)}" x2="${(+x2).toFixed(1)}" y2="${(+y2).toFixed(1)}" stroke="${col}" stroke-width="${w || 2}" marker-end="url(#ar)"/>`;

/* ---------- infinite square well of width A = 10 nm ---------- */
const A = 10, GW = QM.grid(0, A, 401);
const En = n => n * n * Math.PI * Math.PI / (2 * A * A);          // units
const psiW = (n, x) => (x <= 0 || x >= A) ? 0 : Math.sqrt(2 / A) * Math.sin(n * Math.PI * x / A);
const TREV = 4 * A * A / Math.PI;                                    // revival time, units
function wellFrame(y0, h, ymin, ymax, yl, o) {
  o = o || {};
  const F = QM.frame(60, y0, o.w || 540, h, { xmin: -0.8, xmax: A + 0.8, ymin, ymax, xt: [0, 2, 4, 6, 8, 10], yt: o.yt || [], xl: o.noxl ? "" : "x (nm)", yl });
  const s = rc(F.X(-0.8), F.y0, F.X(0) - F.X(-0.8), F.h, "var(--gray-bg)", "none") + rc(F.X(A), F.y0, F.X(A + 0.8) - F.X(A), F.h, "var(--gray-bg)", "none");
  return { F, s: s + F.s + ln(F.X(0), F.y0, F.X(0), F.y0 + F.h, "var(--t)", 2) + ln(F.X(A), F.y0, F.X(A), F.y0 + F.h, "var(--t)", 2) };
}
/* superposition sum c_n psi_n e^{-i E_n t} on the well grid */
function wellSum(c, t) {
  const re = new Float64Array(GW.N), im = new Float64Array(GW.N);
  for (let n = 1; n < c.length; n++) {
    const cr = c[n][0], cim = c[n][1]; if (!cr && !cim) continue;
    const ph = -En(n) * t, cs = Math.cos(ph), sn = Math.sin(ph), ar_ = cr * cs - cim * sn, ai = cr * sn + cim * cs;
    for (let j = 0; j < GW.N; j++) { const p = psiW(n, GW.x[j]); re[j] += ar_ * p; im[j] += ai * p; }
  }
  return { re, im };
}

/* ---------- harmonic oscillator, hbar omega = 0.12 units = 9.14 meV ---------- */
const W0 = 0.12, L0 = 1 / Math.sqrt(W0);   // oscillator length sqrt(hbar/m omega) = 2.887 nm
/* normalized psi_0..psi_N at dimensionless xi, by the stable recurrence */
function hoAll(N, xi) {
  const out = new Float64Array(N + 1);
  out[0] = Math.pow(Math.PI, -0.25) * Math.exp(-xi * xi / 2);
  if (N >= 1) out[1] = Math.SQRT2 * xi * out[0];
  for (let n = 1; n < N; n++) out[n + 1] = Math.sqrt(2 / (n + 1)) * xi * out[n] - Math.sqrt(n / (n + 1)) * out[n - 1];
  return out;
}

/* ---------- small Crank-Nicolson simulation with absorbing exits (cards 7) ---------- */
const G = QM.G, DT = 0.02;
function ScatSim(Vfun, x0, s0, k0) {
  const V = new Float64Array(G.N); for (let j = 0; j < G.N; j++) V[j] = Vfun(G.x[j]);
  const W = Array.from(G.x, x => Math.abs(x) > 24 ? 0.6 * ((Math.abs(x) - 24) / 6) ** 2 : 0);
  const step = QM.solver(G, V, DT, W), w = QM.packet(G, x0, s0, k0);
  const S = { V, re: w.re, im: w.im, t: 0, outR: 0, outL: 0 };
  const iR = QM.idx(G, 24), iL = QM.idx(G, -24);
  S.adv = n => { for (let i = 0; i < n; i++) { step(S.re, S.im); S.outR += QM.J(G, S.re, S.im, iR) * DT; S.outL -= QM.J(G, S.re, S.im, iL) * DT; S.t += DT; } };
  return S;
}

/* ---------- finite square well: bound states by bisection on Eq. 2.138 and its odd partner ---------- */
function finiteStates(a, V0) {
  const z0 = a * Math.sqrt(2 * V0), out = [];
  const fe = z => z * Math.tan(z) - Math.sqrt(Math.max(0, z0 * z0 - z * z));
  const fo = z => -z / Math.tan(z) - Math.sqrt(Math.max(0, z0 * z0 - z * z));
  const bis = (f, lo, hi) => { let flo = f(lo); for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2, fm = f(m); if ((fm > 0) === (flo > 0)) { lo = m; flo = fm; } else hi = m; } return (lo + hi) / 2; };
  for (let k = 0; ; k++) {
    const lo = k * Math.PI / 2 + 1e-9, hi = Math.min((k + 1) * Math.PI / 2 - 1e-9, z0);
    if (lo >= z0) break;
    const f = k % 2 === 0 ? fe : fo;
    if (f(lo) < 0 && f(hi) >= 0) { const z = bis(f, lo, hi); out.push({ z, parity: k % 2 === 0 ? "even" : "odd", E: z * z / (2 * a * a) - V0 }); }
  }
  return { z0, states: out };
}
const finitePsi = (st, a, x) => {
  const l = st.z / a, kap = Math.sqrt(Math.max(0, -2 * st.E));
  if (st.parity === "even") return Math.abs(x) < a ? Math.cos(l * x) : Math.cos(l * a) * Math.exp(-kap * (Math.abs(x) - a));
  return Math.abs(x) < a ? Math.sin(l * x) : Math.sign(x) * Math.sin(l * a) * Math.exp(-kap * (Math.abs(x) - a));
};

addLesson("qlm", "gr", {
level: "Griffiths Ch. 2",
num: "Chapter 2",
id: "qlm-gr-c2", title: "The time-independent Schrödinger equation", short: "Ch 2. Stationary states, wells, oscillator",
labels: { intu: "What the picture shows", how: "Key steps", note: "Where this shows up later" },
big: String.raw`Chapter 1 gave the equation of motion. Chapter 2 finds its special solutions. If the potential does not depend on time, some waves keep their shape forever and only their phase spins. These are the <b>stationary states</b>, each with a definite energy (card 1). Every other motion is a sum of them, each spinning at its own rate (cards 2 and 3). The chapter then solves the potentials every physicist must know by heart: the <b>infinite well</b> (cards 2 and 3), the <b>harmonic oscillator</b> with its ladder operators (cards 4 and 5), the <b>free particle</b> (card 6), the <b>delta function</b> (card 7) and the <b>finite well</b> (card 8). Two ideas run through all of them. Confinement makes energy discrete, and a wave can sit where a classical particle never could (inside a barrier or beyond a turning point).`,
bridge: String.raw`<b>How to study this chapter:</b> it is long (pages 20 to 74), so take it a section or two at a time: card 1 then Section 2.1, cards 2 and 3 then Section 2.2, and so on. Section 2.3 is the most important section in the whole plan, because Gerry and Knight build quantized light on it. Afterwards try Problems 2.5, 2.8 and 2.9 (cards 2 and 3), 2.15 (card 5) and 2.28 (card 8) on paper, then check them here.<div style="margin-top:12px;padding:10px 14px;border:1px solid var(--b);border-radius:8px"><b>Watch alongside (MIT 8.04 clips are by Barton Zwiebach, links open the video page):</b><ul style="margin:6px 0 0 18px;padding:0"><li><b>Card 1:</b> <a href="https://ocw.mit.edu/courses/8-04-quantum-physics-i-spring-2016/resources/stationary-states-key-equations/" target="_blank" rel="noopener">L10.2 Stationary states: key equations</a> (19 min), <a href="https://ocw.mit.edu/courses/8-04-quantum-physics-i-spring-2016/resources/expectation-values-on-stationary-states/" target="_blank" rel="noopener">L10.3 Expectation values on stationary states</a> (9 min)</li><li><b>Cards 2 and 3:</b> <a href="https://ocw.mit.edu/courses/8-04-quantum-physics-i-spring-2016/resources/infinite-square-well-energy-eigenstates/" target="_blank" rel="noopener">L11.2 Infinite square well eigenstates</a> (13 min), <a href="https://ocw.mit.edu/courses/8-04-quantum-physics-i-spring-2016/resources/nodes-and-symmetries-of-the-infinite-square-well-eigenstates/" target="_blank" rel="noopener">L11.3 Nodes and symmetries</a> (10 min)</li><li><b>Card 4 (most important):</b> <a href="https://ocw.mit.edu/courses/8-04-quantum-physics-i-spring-2016/resources/algebraic-solution-of-the-harmonic-oscillator/" target="_blank" rel="noopener">L14.3 Algebraic solution of the oscillator</a> (17 min), <a href="https://ocw.mit.edu/courses/8-04-quantum-physics-i-spring-2016/resources/ground-state-wavefunction/" target="_blank" rel="noopener">L14.4 Ground state wavefunction</a> (16 min), <a href="https://ocw.mit.edu/courses/8-04-quantum-physics-i-spring-2016/resources/number-operator-and-commutators/" target="_blank" rel="noopener">L15.1 Number operator and commutators</a> (16 min), <a href="https://ocw.mit.edu/courses/8-04-quantum-physics-i-spring-2016/resources/creation-and-annihilation-operators-acting-on-energy-eigenstates/" target="_blank" rel="noopener">L15.3 Creation and annihilation operators</a> (21 min)</li><li><b>Card 5:</b> <a href="https://ocw.mit.edu/courses/8-04-quantum-physics-i-spring-2016/resources/quantization-of-the-energy/" target="_blank" rel="noopener">L14.2 Quantization of the energy (power series)</a> (23 min), <a href="https://ocw.mit.edu/courses/8-04-quantum-physics-i-spring-2016/resources/correspondence-principle-amplitude-as-a-function-of-position/" target="_blank" rel="noopener">L12.4 Correspondence principle</a> (6 min)</li><li><b>Card 6:</b> <a href="https://ocw.mit.edu/courses/8-04-quantum-physics-i-spring-2016/resources/the-wave-for-a-free-particle/" target="_blank" rel="noopener">L4.6 The wave for a free particle</a> (15 min)</li><li><b>Card 7:</b> <a href="https://ocw.mit.edu/courses/8-04-quantum-physics-i-spring-2016/resources/delta-function-potential-i-preliminaries/" target="_blank" rel="noopener">L13.1 Delta potential: preliminaries</a> (16 min), <a href="https://ocw.mit.edu/courses/8-04-quantum-physics-i-spring-2016/resources/delta-function-potential-i-solving-for-the-bound-state/" target="_blank" rel="noopener">L13.2 Delta potential: the bound state</a> (15 min)</li><li><b>Card 8:</b> <a href="https://ocw.mit.edu/courses/8-04-quantum-physics-i-spring-2016/resources/finite-square-well/" target="_blank" rel="noopener">L11.4 Finite square well: setting up</a> (23 min), <a href="https://ocw.mit.edu/courses/8-04-quantum-physics-i-spring-2016/resources/finite-square-well-energy-eigenstates/" target="_blank" rel="noopener">L11.5 Finite square well eigenstates</a> (11 min), <a href="https://ocw.mit.edu/courses/8-04-quantum-physics-i-spring-2016/resources/resonant-transmission/" target="_blank" rel="noopener">L17.2 Resonant transmission</a> (18 min)</li></ul></div>`,
cards: [

/* ---------------- 2.1 ---------------- */
{ s: "1. Stationary states", t: "2.1 Stationary states: one energy means nothing moves",
intu: String.raw`An electron in a 10 nm box. Each stationary state \(\psi_n\) is drawn here as a <b>clock hand</b> (lower left) that spins at its own rate \(E_n/\hbar\). Set only \(c_1\): the hand spins, the colours in the top plot cycle, but \(|\Psi|^2\) does not move at all. A stationary state really is stationary, every expectation value is constant. Now add \(c_2\). The two hands spin at different rates, so their <b>relative</b> phase changes, the two waves interfere differently from moment to moment, and the probability sloshes from side to side (the \(\langle x\rangle\) trace, lower right). The energy readout never changes, and the chance of measuring \(E_1\) or \(E_2\) stays \(|c_1|^2\) and \(|c_2|^2\). Motion in quantum mechanics is always a beat between energies.`,
eq: String.raw`\[ \Psi(x,t) = \psi(x)\,e^{-iEt/\hbar}, \qquad -\frac{\hbar^2}{2m}\frac{d^2\psi}{dx^2} + V\psi = E\psi \]\[ \Psi(x,t) = \sum_n c_n\,\psi_n(x)\,e^{-iE_nt/\hbar} \]<div class="eqref">Griffiths Section 2.1</div>\[ \text{beat: } |\Psi|^2 \ni 2\,\mathrm{Re}\!\left[c_1^*c_2\,\psi_1\psi_2\,e^{-i(E_2-E_1)t/\hbar}\right] \]`,
sym: [[String.raw`\(\psi_n(x)\)`, "a stationary state, solution of the time-independent equation"], [String.raw`\(E_n\)`, "its energy, a definite number"], [String.raw`\(e^{-iE_nt/\hbar}\)`, "the spinning clock hand. It has size 1, so it drops out of |Ψ|²"], [String.raw`\(c_n\)`, "how much of state n is in the mixture, |cₙ|² is the probability of measuring Eₙ"]],
how: [String.raw`Guess \(\Psi = \psi(x)\,\varphi(t)\) and put it into the Schrödinger equation. Divide by \(\psi\varphi\): the left side depends only on \(t\), the right only on \(x\), so both equal a constant, call it \(E\).`, String.raw`The time part gives \(\varphi = e^{-iEt/\hbar}\). The space part is the time-independent equation \(\hat H\psi = E\psi\).`, String.raw`\(|\Psi|^2 = |\psi|^2\) because \(|e^{-iEt/\hbar}| = 1\). Every expectation value is constant in time, \(\langle x\rangle\) does not move and \(\langle p\rangle = 0\).`, String.raw`The energy is sharp: \(\sigma_H = 0\), every measurement of energy returns \(E\).`, String.raw`The equation is linear, so sums of stationary states are also solutions. With two energies the cross term carries \(e^{-i(E_2-E_1)t/\hbar}\), which oscillates at the <b>difference</b> frequency.`],
say: String.raw`A stationary state is a solution of definite energy whose probability density does not change in time, and any other solution is a superposition of stationary states, each evolving with its own phase factor exp(−iEₙt/ħ).`,
note: String.raw`An atom or quantum dot in a superposition of two levels has a dipole that oscillates at \((E_2 - E_1)/\hbar\). That oscillating dipole is what radiates light at the transition frequency (Griffiths Chapter 9, Gerry and Knight Chapter 4). For your 795 nm dot the beat frequency is 377 THz.`,
num: String.raw`Electron in a 10 nm box: \(E_1 = 3.76\) meV, \(E_2 = 15.0\) meV, \(E_3 = 33.8\) meV. The 1 and 2 mixture sloshes with period \(h/(E_2 - E_1) = 367\) fs, the 1 and 3 mixture with period 138 fs. A 795 nm photon carries \(E = 1.560\) eV, and \(\nu = E/h = 377\) THz.`,
r(fig, ctl) {
  ctl.innerHTML = sl("a1", "|c₁| (state 1)", 0, 1, 0.01, 1) + sl("a2", "|c₂| (state 2)", 0, 1, 0.01, 0) + sl("a3", "|c₃| (state 3)", 0, 1, 0.01, 0) + sl("ph", "Phase of c₂ (degrees)", 0, 360, 5, 0) + `<div class="readout" id="ro"></div>`;
  let t = 0, H = { t: [], x: [] };
  const coeffs = () => {
    let m = [0, +$("a1").value, +$("a2").value, +$("a3").value]; const nn = Math.sqrt(m[1] ** 2 + m[2] ** 2 + m[3] ** 2) || 1; m = m.map(v => v / nn);
    const p = +$("ph").value * Math.PI / 180;
    return [[0, 0], [m[1], 0], [m[2] * Math.cos(p), m[2] * Math.sin(p)], [m[3], 0]];
  };
  const xmean = (c, tt) => { const w = wellSum(c, tt); let s = 0, n = 0; for (let j = 0; j < GW.N; j++) { const P = w.re[j] ** 2 + w.im[j] ** 2; s += GW.x[j] * P; n += P; } return n ? s / n : NaN; };
  const draw = () => {
    ["a1", "a2", "a3"].forEach(k => $(k + "v").textContent = fmt(+$(k).value, 2)); $("phv").textContent = $("ph").value + "°";
    const c = coeffs(), w = wellSum(c, t);
    const B = wellFrame(26, 170, 0, 0.42, "|Ψ|² (1/nm)", { yt: [0, 0.2, 0.4] });
    let s = B.s + QM.waveSVG(B.F, GW, w.re, w.im, "phase", 2) + QM.wheel(B.F.x0 + B.F.w - 30, B.F.y0 + 28, 13);
    // clock hands
    const cx = 150, cy = 330, R = 62;
    s += ci(cx, cy, R, "none", "var(--b)") + ln(cx - R - 8, cy, cx + R + 8, cy, "var(--b)") + ln(cx, cy - R - 8, cx, cy + R + 8, "var(--b)") + tx(cx + R + 10, cy + 4, "Re", "start") + tx(cx, cy - R - 12, "Im", "middle");
    for (let n = 1; n <= 3; n++) {
      const mag = Math.hypot(c[n][0], c[n][1]); if (mag < 1e-3) continue;
      const ph = Math.atan2(c[n][1], c[n][0]) - En(n) * t;
      s += ar(cx, cy, cx + R * mag * Math.cos(ph), cy - R * mag * Math.sin(ph), NC[n - 1], 3) + tx(cx + (R * mag + 12) * Math.cos(ph), cy - (R * mag + 12) * Math.sin(ph) + 4, `c${n}`, "middle", "ts", `fill="${NC[n - 1]}"`);
    }
    s += tx(cx, cy + R + 34, "each cₙ exp(−iEₙt/ħ) spins at its own rate", "middle");
    // <x>(t) trace
    const tm = Math.max(60, t * 1.02);
    const X = QM.frame(300, 262, 320, 130, { xmin: 0, xmax: tm, ymin: 0, ymax: 10, xt: [0, tm], xf: v => fmt(v * QM.T0, 0), yt: [0, 5, 10], xl: "time (fs)", yl: "⟨x⟩ (nm)" });
    s += X.s + QM.path(X, H.t, H.x, C.purple, 2.5);
    fig.innerHTML = svg(450, s);
    const Eavg = [1, 2, 3].reduce((a, n) => a + (c[n][0] ** 2 + c[n][1] ** 2) * En(n), 0), nz = [1, 2, 3].filter(n => Math.hypot(c[n][0], c[n][1]) > 1e-3).length;
    $("ro").innerHTML = ro([["time", fmt(t * QM.T0, 0) + " fs"], ["P(E₁ = 3.76 meV)", fmt(c[1][0] ** 2 + c[1][1] ** 2, 3)], ["P(E₂ = 15.0 meV)", fmt(c[2][0] ** 2 + c[2][1] ** 2, 3)], ["P(E₃ = 33.8 meV)", fmt(c[3][0] ** 2 + c[3][1] ** 2, 3)], ["⟨H⟩, constant", fmt(Eavg * QM.E0, 2) + " meV"], ["⟨x⟩ now", fmt(xmean(c, t), 2) + " nm"], ["|Ψ|² moving?", nz > 1 ? "yes, energies beat" : "no, stationary"]]);
  };
  const restart = () => { t = 0; H = { t: [0], x: [xmean(coeffs(), 0)] }; draw(); };
  ["a1", "a2", "a3", "ph"].forEach(k => $(k).oninput = restart);
  QM.player(ctl, () => { if (t < 400) { t += 0.18; H.t.push(t); H.x.push(xmean(coeffs(), t)); } draw(); }, restart);
  restart();
}},

/* ---------------- 2.2 states ---------------- */
{ s: "2. Infinite well", t: "2.2 The infinite square well: standing waves, n² energies, orthogonality",
intu: String.raw`Inside the box the electron is free, at the walls \(\psi\) must be zero. Only waves that fit a whole number of half wavelengths survive: \(a = n\lambda/2\). That single condition gives everything. Slide \(n\): one more node each step, shorter wavelength, more momentum, and the energy grows as \(n^2\) (ladder on the right, notice the rungs spread apart). The lowest energy is not zero. Squeezing a wave into a box costs kinetic energy, the same uncertainty principle as Chapter 1. The lower plot multiplies two states \(\psi_m\psi_n\). For \(m \ne n\) the teal (positive) and coral (negative) areas cancel exactly, the integral is 0. That is <b>orthogonality</b>, and it is what lets card 3 take any wave apart into these states.`,
eq: String.raw`\[ E_n = \frac{n^2\pi^2\hbar^2}{2ma^2}, \qquad \psi_n(x) = \sqrt{\frac{2}{a}}\,\sin\!\left(\frac{n\pi}{a}x\right) \]<div class="eqref">Griffiths Eqs. [2.23] and [2.24]</div>\[ \int_0^a \psi_m^*(x)\,\psi_n(x)\,dx = \delta_{mn} \]`,
sym: [[String.raw`\(a\)`, "width of the well, here 10 nm"], [String.raw`\(n\)`, "quantum number 1, 2, 3, ... (n = 0 gives nothing, negative n repeats)"], [String.raw`\(\delta_{mn}\)`, "Kronecker delta, 1 if m = n and 0 otherwise"], [String.raw`\(\lambda_n = 2a/n\)`, "wavelength of state n"]],
how: [String.raw`Inside, \(V = 0\): \(\psi'' = -k^2\psi\) with \(k = \sqrt{2mE}/\hbar\), so \(\psi = A\sin kx + B\cos kx\).`, String.raw`\(\psi(0) = 0\) kills the cosine. \(\psi(a) = 0\) forces \(\sin ka = 0\), so \(k_n = n\pi/a\).`, String.raw`Energy follows from \(E = \hbar^2k^2/2m\). The amplitude comes from normalization: \(|A|^2 a/2 = 1\).`, String.raw`Orthogonality: \(\int_0^a \sin(m\pi x/a)\sin(n\pi x/a)\,dx = 0\) for \(m \ne n\), by the product to sum identity.`],
say: String.raw`Confinement quantizes energy: in an infinite well of width a only standing waves with a = nλ/2 fit, giving Eₙ = n²π²ħ²/2ma², and the stationary states are orthonormal.`,
note: String.raw`This is the first model of a quantum dot. A GaAs dot is a few nm tall, the electron's effective mass is \(0.067\,m_e\), and the confinement energy pushes the dot's emission above the GaAs bandgap. Your M.Sc. lesson on dot bandgaps used exactly this \(n^2/a^2\) scaling.`,
num: String.raw`Free electron, \(a = 10\) nm: \(E_1 = 3.76\) meV, \(E_n = 3.76\,n^2\) meV. With the GaAs mass the same box gives \(E_1 = 56.1\) meV, and a 5 nm box gives 224 meV. For state n: \(\sigma_x\sigma_p = \frac{\hbar}{2}\sqrt{\frac{n^2\pi^2}{3} - 2}\), which is \(0.568\,\hbar\) for \(n = 1\), just above the limit (Problem 2.5).`,
r(fig, ctl) {
  ctl.innerHTML = sl("n", "State n", 1, 10, 1, 1) + sl("m", "Overlap with state m", 1, 10, 1, 2) + `<div class="readout" id="ro"></div>`;
  const draw = () => {
    const n = +$("n").value, m = +$("m").value; $("nv").textContent = n; $("mv").textContent = m;
    const B = wellFrame(26, 160, -0.5, 0.62, "ψ (nm⁻½)", { w: 420, yt: [-0.4, 0, 0.4] });
    const xs = Array.from(GW.x), pn = xs.map(x => psiW(n, x)), pp = pn.map(v => v * v);
    let s = B.s + ln(B.F.X(0), B.F.Y(0), B.F.X(A), B.F.Y(0), "var(--b)") + QM.area(B.F, xs, pp, C.purple, 0.2) + QM.path(B.F, xs, pp, C.purple, 1.5) + QM.path(B.F, xs, pn, C.blue, 2.5);
    for (let k = 1; k < n; k++) s += ci(B.F.X(k * A / n), B.F.Y(0), 4, "var(--panel)", C.coral, 'stroke-width="2"');
    s += tx(B.F.x0 + 6, B.F.y0 + 14, "ψₙ (blue), |ψₙ|² (purple), nodes (circles)", "start");
    // energy ladder
    const L = QM.frame(540, 26, 80, 160, { xmin: 0, xmax: 1, ymin: 0, ymax: 110, xt: [], yt: [0, 50, 100], yl: "" });
    s += L.s + tx(580, 20, "E/E₁", "middle");
    for (let k = 1; k <= 10; k++) { const y = L.Y(k * k); s += ln(L.x0 + 6, y, L.x0 + L.w - 6, y, k === n ? C.coral : k === m ? C.teal : "var(--b)", k === n || k === m ? 3 : 1); }
    // overlap
    const prod = xs.map(x => psiW(n, x) * psiW(m, x));
    const O = wellFrame(236, 120, -0.22, 0.22, "ψₘψₙ", { yt: [-0.2, 0, 0.2] });
    s += O.s;
    let dP = `M${O.F.X(0)} ${O.F.Y(0)}`, dN = dP;
    xs.forEach((x, j) => { dP += `L${O.F.X(x).toFixed(1)} ${O.F.Y(Math.max(0, prod[j])).toFixed(1)}`; dN += `L${O.F.X(x).toFixed(1)} ${O.F.Y(Math.min(0, prod[j])).toFixed(1)}`; });
    s += `<path d="${dP}L${O.F.X(A)} ${O.F.Y(0)}Z" fill="${C.teal}" fill-opacity="0.45"/><path d="${dN}L${O.F.X(A)} ${O.F.Y(0)}Z" fill="${C.coral}" fill-opacity="0.45"/>` + QM.path(O.F, xs, prod, "var(--t)", 1.2);
    let I = 0; prod.forEach(v => I += v * GW.dx);
    s += tx(O.F.x0 + 6, O.F.y0 + 14, `∫ψ${m}ψ${n} dx = ${fmt(Math.abs(I) < 5e-4 ? 0 : I, 3)}`, "start", "th");
    fig.innerHTML = svg(400, s);
    const sx = A * Math.sqrt(1 / 12 - 1 / (2 * n * n * Math.PI * Math.PI)), sp = n * Math.PI / A;
    $("ro").innerHTML = ro([["Eₙ", fmt(En(n) * QM.E0, 2) + " meV"], ["Eₙ (GaAs mass)", fmt(En(n) * QM.E0 / 0.067, 1) + " meV"], ["wavelength 2a/n", fmt(2 * A / n, 2) + " nm"], ["nodes inside", n - 1], ["σₓ", fmt(sx, 3) + " nm"], ["σₚ", fmt(sp, 3) + " ħ/nm"], ["σₓσₚ", fmt(sx * sp, 3) + " ħ"]]);
  };
  $("n").oninput = draw; $("m").oninput = draw;
  draw();
}},

/* ---------------- 2.2 Fourier ---------------- */
{ s: "3. Any wave from stationary states", t: "2.2 Building any wave from stationary states, and watching it move",
intu: String.raw`Orthogonality turns into a recipe: to find how much of \(\psi_n\) a wave contains, overlap it with \(\psi_n\) (Fourier's trick). The bars are \(|c_n|^2\), the probabilities of each energy. Slide <b>N</b> to add terms one at a time and watch the sum (blue) approach the target (dashed). Griffiths' \(Ax(a-x)\) is almost pure \(\psi_1\): its \(c_1^2 = 0.9986\). The sharp-edged <b>half box</b> needs many terms and keeps a ringing overshoot at the edge. Then run time. Each term spins at \(E_n/\hbar \propto n^2\), so the shape changes, smears out, and then at exactly \(T_{\text{rev}} = 4ma^2/\pi\hbar\) every term is back in step and the original wave <b>reappears</b>. At \(T_{\text{rev}}/2\) you get its mirror image. Try the <b>moving packet</b>: it bounces like a ball, falls apart, and comes back.`,
eq: String.raw`\[ \Psi(x,0) = \sum_n c_n\psi_n(x), \qquad c_n = \sqrt{\frac{2}{a}}\int_0^a \sin\!\left(\frac{n\pi}{a}x\right)\Psi(x,0)\,dx \]<div class="eqref">Griffiths Eq. [2.33], Fourier's trick</div>\[ \sum_n |c_n|^2 = 1, \qquad \langle H\rangle = \sum_n E_n|c_n|^2 \]<div class="eqref">Griffiths Eqs. [2.34] and [2.35]</div>\[ T_{\text{rev}} = \frac{2\pi\hbar}{E_1} = \frac{4ma^2}{\pi\hbar} \]`,
sym: [[String.raw`\(c_n\)`, "expansion coefficient, found by Fourier's trick"], [String.raw`\(|c_n|^2\)`, "probability that an energy measurement gives Eₙ"], [String.raw`\(N\)`, "number of terms kept in the sum"], [String.raw`\(T_{\text{rev}}\)`, "revival time, when every phase factor returns to 1"]],
how: [String.raw`Multiply \(\Psi(x,0) = \sum c_n\psi_n\) by \(\psi_m^*\) and integrate. Orthogonality kills every term except \(n = m\), leaving \(c_m = \int \psi_m^*\Psi(x,0)\,dx\).`, String.raw`Completeness (Dirichlet's theorem) guarantees that the sum really converges to any reasonable \(\Psi(x,0)\).`, String.raw`Attach the time factors: \(\Psi(x,t) = \sum c_n\psi_n e^{-iE_nt/\hbar}\). That is the full solution, no differential equation left to solve.`, String.raw`Since \(E_n = n^2E_1\), at \(t = 2\pi\hbar/E_1\) every factor is \(e^{-2\pi i n^2} = 1\). The wave revives exactly.`],
say: String.raw`Any initial wave function can be expanded in stationary states with cₙ = ∫ψₙ*Ψ(x,0)dx, the |cₙ|² are the probabilities of the energies, and the time evolution is the same sum with each term multiplied by exp(−iEₙt/ħ).`,
note: String.raw`In Gerry and Knight Chapter 4 the atom plus a light mode is solved exactly this way: expand in the stationary states (the dressed states), attach phase factors, and the populations oscillate. The <b>collapse and revival</b> of Rabi oscillations there is the same phase bookkeeping you see here.`,
num: String.raw`For \(Ax(a-x)\): \(c_n = 8\sqrt{15}/(n\pi)^3\) for odd n and 0 for even n, so \(|c_1|^2 = 0.99856\), \(|c_3|^2 = 0.00137\), \(|c_5|^2 = 0.00006\) (Problem 2.9). Its energy is \(\langle H\rangle = 5\hbar^2/ma^2 = 3.81\) meV, only 1.3 % above \(E_1\). Revival time for a 10 nm box: \(T_{\text{rev}} = 1.10\) ps.`,
r(fig, ctl) {
  const SH = {
    para: { n: "Griffiths Ax(a − x)", f: x => x * (A - x) },
    half: { n: "Half box", f: x => x < A / 2 ? 1 : 0 },
    pack: { n: "Moving packet", f: x => [Math.exp(-((x - 3) ** 2) / (4 * 0.6 * 0.6)) * Math.cos(3 * x), Math.exp(-((x - 3) ** 2) / (4 * 0.6 * 0.6)) * Math.sin(3 * x)] },
    two: { n: "ψ₁ + ψ₂ (Problem 2.6)", f: x => psiW(1, x) + psiW(2, x) }
  };
  let sh = "para", t = 0, cs = [], tf = 0;
  ctl.innerHTML = btns(Object.keys(SH).map(k => [k, SH[k].n]), "sh") + sl("N", "Terms kept, N", 1, 60, 1, 3) + sl("tf", "Time, as a fraction of T_rev", 0, 1, 0.005, 0) + `<div class="readout" id="ro"></div>`;
  const fine = QM.grid(0, A, 2001);
  const target = x => { const v = SH[sh].f(x); return Array.isArray(v) ? v : [v, 0]; };
  const compute = () => {
    let nr = 0; for (let j = 0; j < fine.N; j++) { const v = target(fine.x[j]); nr += (v[0] * v[0] + v[1] * v[1]) * fine.dx; } nr = Math.sqrt(nr);
    cs = [[0, 0]];
    for (let n = 1; n <= 60; n++) { let a = 0, b = 0; for (let j = 0; j < fine.N; j++) { const v = target(fine.x[j]), p = psiW(n, fine.x[j]) * fine.dx; a += p * v[0]; b += p * v[1]; } cs.push([a / nr, b / nr]); }
    cs.nr = nr;
  };
  const draw = () => {
    pick(ctl, "sh", sh); const N = +$("N").value; $("Nv").textContent = N;
    t = tf * TREV; $("tfv").textContent = fmt(tf, 3) + " (" + fmt(t * QM.T0, 0) + " fs)";
    const c = cs.slice(0, N + 1), w = wellSum(c, t);
    let pk = 0; for (let j = 0; j < GW.N; j++) pk = Math.max(pk, w.re[j] ** 2 + w.im[j] ** 2);
    const tg = Array.from(GW.x, x => { const v = target(x); return (v[0] * v[0] + v[1] * v[1]) / (cs.nr * cs.nr); });
    const ym = Math.max(0.3, Math.max(...tg) * 1.25, pk * 1.1);
    const B = wellFrame(26, 180, 0, ym, "|Ψ|² (1/nm)", { yt: [0, +(ym / 2).toFixed(2), +(ym * 0.9).toFixed(2)] });
    let s = B.s + QM.waveSVG(B.F, GW, w.re, w.im, "phase", 2) + QM.path(B.F, Array.from(GW.x), tg, "var(--t)", 1.5, "5 4");
    s += tx(B.F.x0 + 6, B.F.y0 + 14, `sum of ${N} terms (colour), target at t = 0 (dashed)`, "start");
    // coefficient bars
    const nb = 30, P = QM.frame(60, 252, 540, 110, { xmin: 0.5, xmax: nb + 0.5, ymin: 0, ymax: 1, xt: [1, 5, 10, 15, 20, 25, 30], yt: [0, 0.5, 1], xl: "n", yl: "|cₙ|²" });
    s += P.s;
    for (let n = 1; n <= nb; n++) { const p = cs[n][0] ** 2 + cs[n][1] ** 2, hgt = P.Y(0) - P.Y(Math.max(p, p > 1e-4 ? 0.012 : 0)); s += rc(P.X(n - 0.38), P.Y(0) - hgt, P.X(n + 0.38) - P.X(n - 0.38), hgt, n <= N ? C.blue : "var(--b)"); }
    fig.innerHTML = svg(400, s);
    let kept = 0, Eh = 0; for (let n = 1; n <= N; n++) { const p = cs[n][0] ** 2 + cs[n][1] ** 2; kept += p; Eh += p * En(n); }
    let tot = 0, Et = 0; for (let n = 1; n <= 60; n++) { const p = cs[n][0] ** 2 + cs[n][1] ** 2; tot += p; Et += p * En(n); }
    $("ro").innerHTML = ro([["|c₁|²", fmt(cs[1][0] ** 2 + cs[1][1] ** 2, 5)], ["Σ|cₙ|² over kept terms", fmt(kept, 5)], ["⟨H⟩ = ΣEₙ|cₙ|² (60 terms)", fmt(Et / tot * QM.E0, 2) + " meV"], ["T_rev", fmt(TREV * QM.T0, 0) + " fs"]]);
  };
  ctl.querySelectorAll("button[data-sh]").forEach(b => b.onclick = () => { sh = b.dataset.sh; if (sh === "pack" && +$("N").value < 30) $("N").value = 40; compute(); draw(); });
  $("N").oninput = draw; $("tf").oninput = () => { tf = +$("tf").value; draw(); };
  QM.player(ctl, () => { tf += 0.0008; if (tf > 1) tf = 0; $("tf").value = tf; draw(); }, () => { tf = 0; $("tf").value = 0; draw(); });
  compute(); draw();
}},

/* ---------------- 2.3 ladder ---------------- */
{ s: "4. Oscillator: ladder", t: "2.3.1 The harmonic oscillator: climbing the ladder",
intu: String.raw`Almost every potential looks like a parabola near its minimum (Griffiths Figure 2.3), so this problem is everywhere. Griffiths' trick is to factor the Hamiltonian into two <b>ladder operators</b>. Press <b>a₊</b>: the state climbs one rung, gains one node and exactly \(\hbar\omega\) of energy. Press <b>a₋</b> to climb down. The rungs are <b>equally spaced</b>, unlike the box. Keep pressing a₋ and you hit the bottom: \(a_-\psi_0 = 0\). The lower plot shows why. \(a_\pm\) is built from two pieces, "multiply by \(x\)" (amber) and "take the slope" (teal). Acting on \(\psi_0\), the two pieces cancel point by point, so nothing is left. The ground state still has energy \(\tfrac12\hbar\omega\), the <b>zero-point energy</b>.`,
eq: String.raw`\[ a_\pm \equiv \frac{1}{\sqrt{2m}}\left(\frac{\hbar}{i}\frac{d}{dx} \pm im\omega x\right) \]<div class="eqref">Griffiths Eq. [2.41]</div>\[ [a_-, a_+] = \hbar\omega, \qquad H = a_+a_- + \tfrac12\hbar\omega, \qquad a_-\psi_0 = 0 \]<div class="eqref">Griffiths Eqs. [2.45] to [2.47]</div>\[ E_n = \left(n + \tfrac12\right)\hbar\omega, \qquad \psi_0 = \left(\frac{m\omega}{\pi\hbar}\right)^{1/4} e^{-m\omega x^2/2\hbar} \]`,
sym: [[String.raw`\(a_+, a_-\)`, "raising and lowering operators (Griffiths' first edition normalization)"], [String.raw`\(\omega\)`, "classical angular frequency √(k/m)"], [String.raw`\([a_-, a_+]\)`, "commutator a₋a₊ − a₊a₋"], [String.raw`\(\hat a^\dagger, \hat a\)`, "the dimensionless versions used in Gerry and Knight: a₊ = i√(ħω) â†, a₋ = −i√(ħω) â"]],
how: [String.raw`Write \(H = \frac{1}{2m}\left[p^2 + (m\omega x)^2\right]\) and try to factor it like \(u^2 + v^2 = (u - iv)(u + iv)\). Because \(x\) and \(p\) do not commute, an extra \(\tfrac12\hbar\omega\) is left over.`, String.raw`That leftover is the commutator \([a_-, a_+] = \hbar\omega\), and it gives \(H = a_+a_- + \tfrac12\hbar\omega\).`, String.raw`If \(H\psi = E\psi\), then \(H(a_+\psi) = (E + \hbar\omega)(a_+\psi)\) and \(H(a_-\psi) = (E - \hbar\omega)(a_-\psi)\). A ladder with spacing \(\hbar\omega\).`, String.raw`The energy cannot go below the potential minimum, so there is a lowest rung with \(a_-\psi_0 = 0\). That is a first order equation, solved by a Gaussian, with \(E_0 = \tfrac12\hbar\omega\).`, String.raw`Every other state is \(\psi_n \propto (a_+)^n\psi_0\). In dimensionless form \(\hat a^\dagger\psi_n = \sqrt{n+1}\,\psi_{n+1}\) and \(\hat a\,\psi_n = \sqrt n\,\psi_{n-1}\).`],
say: String.raw`The harmonic oscillator has equally spaced levels Eₙ = (n + ½)ħω, the raising and lowering operators step between them, and the ground state, defined by a₋ψ₀ = 0, is a Gaussian with zero-point energy ½ħω.`,
note: String.raw`<b>This is the single most important card for quantum optics.</b> In Gerry and Knight Chapter 2 each mode of light is exactly this oscillator. The rung number n becomes the <b>number of photons</b>, \(\hat a^\dagger\) <b>creates</b> a photon and \(\hat a\) <b>destroys</b> one, and the zero-point energy becomes the vacuum field that makes spontaneous emission happen.`,
num: String.raw`Here \(\hbar\omega = 9.14\) meV (the spring of Chapter 1), oscillator length \(\sqrt{\hbar/m\omega} = 2.89\) nm. For a 795 nm light mode \(\hbar\omega = 1.560\) eV, so each photon is one rung of 1.56 eV, and the vacuum holds \(\tfrac12\hbar\omega = 0.78\) eV per mode.`,
r(fig, ctl) {
  let n = 0, last = "down", msg = "";
  ctl.innerHTML = `<div class="row"><button id="up">a₊ (raise)</button><button id="dn">a₋ (lower)</button><button id="z">Back to ψ₀</button></div><div class="readout" id="ro"></div>`;
  const NX = 401, xs = Array.from({ length: NX }, (_, i) => -15 + 30 * i / (NX - 1));
  const draw = () => {
    const tab = xs.map(x => hoAll(9, x / L0));
    const F = QM.frame(60, 26, 540, 220, { xmin: -15, xmax: 15, ymin: 0, ymax: 10, xt: [-15, -10, -5, 0, 5, 10, 15], yt: [0.5, 2.5, 4.5, 6.5, 8.5], yf: v => fmt(v, 1), xl: "x (nm)", yl: "E / ħω" });
    let s = F.s + QM.path(F, xs, xs.map(x => { const v = 0.5 * W0 * x * x; return v <= 10 ? v : NaN; }), "var(--p)", 1.5);
    for (let k = 0; k <= 9; k++) {
      const Ek = k + 0.5, xt = L0 * Math.sqrt(2 * k + 1);
      s += ln(F.X(-xt), F.Y(Ek), F.X(xt), F.Y(Ek), k === n ? C.coral : "var(--b)", k === n ? 2 : 1, k === n ? "" : "3 3");
      const sc = k === n ? 0.85 : 0.5, ys = tab.map(r => Ek + sc * r[k]);
      s += QM.path(F, xs, ys, k === n ? C.blue : "var(--b)", k === n ? 2.5 : 1);
      s += tx(F.x0 + F.w + 6, F.Y(Ek) + 4, "n=" + k, "start", "ts", k === n ? `fill="${C.coral}"` : "");
    }
    s += tx(F.x0 + 8, F.y0 + 14, msg || "each rung: one ψₙ drawn at its energy", "start", "th");
    // operator pieces: dimensionless (xi psi -/+ dpsi/dxi)/sqrt2 acting on the state before the step
    const src = last === "up" ? Math.max(0, n - 1) : (msg.startsWith("a₋ψ₀") ? 0 : n + 1);
    const xi = xs.map(x => x / L0), pv = tab.map(r => r[src]);
    const dp = pv.map((v, i) => i > 0 && i < NX - 1 ? (pv[i + 1] - pv[i - 1]) / (xi[i + 1] - xi[i - 1]) : 0);
    const sg = last === "up" ? -1 : 1, t1 = xi.map((q, i) => q * pv[i] / Math.SQRT2), t2 = dp.map(v => sg * v / Math.SQRT2), sum = t1.map((v, i) => v + t2[i]);
    const O = QM.frame(60, 290, 540, 120, { xmin: -15, xmax: 15, ymin: -1.6, ymax: 1.6, xt: [-15, -10, -5, 0, 5, 10, 15], yt: [-1, 0, 1], xl: "x (nm)", yl: "" });
    s += O.s + QM.path(O, xs, t1, C.amber, 2) + QM.path(O, xs, t2, C.teal, 2) + QM.path(O, xs, sum, C.blue, 3);
    s += tx(O.x0 + 8, O.y0 + 14, `${last === "up" ? "â†" : "â"} acting on ψ${src}:  ξψ/√2 (amber)  ${last === "up" ? "−" : "+"} (dψ/dξ)/√2 (teal)  =  result (blue)`, "start");
    fig.innerHTML = svg(440, s);
    $("ro").innerHTML = ro([["state", "ψ" + n], ["Eₙ = (n + ½)ħω", fmt((n + 0.5) * W0 * QM.E0, 2) + " meV"], ["nodes", n], ["spacing to next rung", fmt(W0 * QM.E0, 2) + " meV"], ["zero-point energy", fmt(0.5 * W0 * QM.E0, 2) + " meV"], ["size of result", last === "up" ? `√${n} = ${fmt(Math.sqrt(n), 3)}` : msg ? "0" : `√${n + 1} = ${fmt(Math.sqrt(n + 1), 3)}`]]);
  };
  $("up").onclick = () => { if (n < 9) { n++; last = "up"; msg = ""; } else msg = "top of this picture, the real ladder goes on forever"; draw(); };
  $("dn").onclick = () => { if (n > 0) { n--; last = "down"; msg = ""; } else { last = "down"; msg = "a₋ψ₀ = 0: the two pieces cancel, this is the bottom rung"; } draw(); };
  $("z").onclick = () => { n = 0; last = "down"; msg = ""; draw(); };
  draw();
}},

/* ---------------- 2.3 analytic ---------------- */
{ s: "5. Oscillator vs classical", t: "2.3.2 Oscillator states, Hermite polynomials and the classical limit",
intu: String.raw`The power series method gives the same states as Hermite polynomials times a Gaussian (Table 2.1). Here is Figure 2.5 live. The dashed curve is where a <b>classical</b> mass on a spring with the same energy spends its time: piled up at the turning points where it slows down, just like the speedometer shadow in Chapter 1. Slide \(n\) up. At \(n = 0\) the two look nothing alike, the quantum particle is most likely in the middle. By \(n = 100\) the quantum density wiggles rapidly around the classical curve, and averaged over the wiggles it <b>is</b> the classical curve. That is the correspondence principle. The grey regions lie beyond the classical turning points. A classical particle can never be there, the quantum one is there with the probability in the readout, 16 % in the ground state.`,
eq: String.raw`\[ \psi_n(x) = \left(\frac{m\omega}{\pi\hbar}\right)^{1/4}\frac{1}{\sqrt{2^n n!}}\,H_n(\xi)\,e^{-\xi^2/2}, \qquad \xi = \sqrt{\frac{m\omega}{\hbar}}\,x \]<div class="eqref">Griffiths Eq. [2.69] and Table 2.1</div>\[ \rho_{\text{cl}}(x) = \frac{1}{\pi\sqrt{A^2 - x^2}}, \qquad A = \sqrt{\frac{(2n+1)\hbar}{m\omega}} \]`,
sym: [[String.raw`\(H_n(\xi)\)`, "Hermite polynomial of degree n: H₀ = 1, H₁ = 2ξ, H₂ = 4ξ² − 2, ..."], [String.raw`\(\xi\)`, "position in units of the oscillator length √(ħ/mω)"], [String.raw`\(A\)`, "classical amplitude for energy (n + ½)ħω, the turning point"], [String.raw`\(\rho_{\text{cl}}\)`, "classical probability density, time spent per unit length"]],
how: [String.raw`In \(\xi\) units the equation is \(\psi'' = (\xi^2 - K)\psi\) with \(K = 2E/\hbar\omega\). At large \(\xi\) the solution behaves like \(e^{-\xi^2/2}\), so write \(\psi = h(\xi)e^{-\xi^2/2}\).`, String.raw`Then \(h'' - 2\xi h' + (K - 1)h = 0\). Try a power series \(h = \sum a_j\xi^j\): \(a_{j+2} = \frac{2j + 1 - K}{(j+1)(j+2)}a_j\).`, String.raw`If the series never stops it grows like \(e^{\xi^2}\) and \(\psi\) is not normalizable. So it must stop: \(K = 2n + 1\), which is \(E_n = (n + \tfrac12)\hbar\omega\) again.`, String.raw`The terminated series are the Hermite polynomials. Their parity alternates, and \(\psi_n\) has n nodes.`],
say: String.raw`The oscillator eigenfunctions are Hermite polynomials times a Gaussian, the particle has a nonzero probability beyond the classical turning points, and at large n the quantum density averages to the classical one.`,
note: String.raw`In Gerry and Knight the "x" of a light mode is a field quadrature. A <b>photon number state</b> \(|n\rangle\) has exactly these wave functions in quadrature space, and the vacuum \(|0\rangle\) is the Gaussian at the bottom. Homodyne measurements of light (Chapter 7) map these shapes directly.`,
num: String.raw`Ground state probability beyond the turning points: \(\operatorname{erfc}(1) = 0.157\) (Problem 2.15). For \(n = 1\): 0.112, for \(n = 10\): 0.060, for \(n = 100\): 0.029. Classical amplitude for \(n = 0\) here: 2.89 nm, for \(n = 100\): 41 nm.`,
r(fig, ctl) {
  ctl.innerHTML = sl("n", "State n", 0, 100, 1, 0) + `<div class="readout" id="ro"></div>`;
  const draw = () => {
    const n = +$("n").value; $("nv").textContent = n;
    const Am = Math.sqrt(2 * n + 1), xm = Math.max(4, Am * 1.25), NX = 1601;
    const xi = Array.from({ length: NX }, (_, i) => -xm + 2 * xm * i / (NX - 1));
    const P = xi.map(q => { const v = hoAll(n, q)[n]; return v * v; });
    const cl = xi.map(q => Math.abs(q) < Am * 0.999 ? 1 / (Math.PI * Math.sqrt(Am * Am - q * q)) : NaN);
    const ym = Math.max(...P) * 1.15;
    const F = QM.frame(60, 26, 560, 250, { xmin: -xm * L0, xmax: xm * L0, ymin: 0, ymax: ym, xt: [-1, -0.5, 0, 0.5, 1].map(f => +(f * xm * L0).toFixed(0)), yt: [0, +(ym / 2).toFixed(3)], xl: "x (nm)", yl: "|ψₙ|²" });
    let s = rc(F.x0, F.y0, F.X(-Am * L0) - F.x0, F.h, "var(--gray-bg)") + rc(F.X(Am * L0), F.y0, F.x0 + F.w - F.X(Am * L0), F.h, "var(--gray-bg)") + F.s;
    const xx = xi.map(q => q * L0);
    s += QM.area(F, xx, P, C.purple, 0.25) + QM.path(F, xx, P, C.purple, 1.5) + QM.path(F, xx, cl.map(v => v <= ym ? v : NaN), C.coral, 2.5, "6 4");
    s += tx(F.X(-Am * L0) - 6, F.y0 + 30, "classically forbidden", "end", "ts") + tx(F.x0 + F.w - 6, F.y0 + 14, "quantum |ψₙ|² (purple), classical (coral dashes)", "end");
    fig.innerHTML = svg(320, s);
    let out = 0; const d = xi[1] - xi[0]; xi.forEach((q, i) => { if (Math.abs(q) > Am) out += P[i] * d; });
    $("ro").innerHTML = ro([["Eₙ", fmt((n + 0.5) * W0 * QM.E0, 2) + " meV"], ["classical turning point", "±" + fmt(Am * L0, 2) + " nm"], ["P(beyond the turning points)", fmt(out, 4)], ["nodes", n]]);
  };
  $("n").oninput = draw; draw();
}},

/* ---------------- 2.4 free particle ---------------- */
{ s: "6. Free particle", t: "2.4 The free particle: wave packets, phase velocity and group velocity",
intu: String.raw`Griffiths finds a paradox: a plane wave \(e^{i(kx - \hbar k^2t/2m)}\) travels at <b>half</b> the classical speed (Eq. 2.81). Watch it happen. The coral dot rides one crest of the wave, the purple triangle marks the centre of the envelope. The crest moves at the phase velocity \(\hbar k/2m\), the envelope at the group velocity \(\hbar k/m\), so the crest slides backwards through the packet and fades out at the rear while new crests are born at the front. The particle is where the envelope is, and the envelope moves at the classical speed, so there is no paradox. Each \(k\) in the packet travels at its own speed, which is why the packet also spreads. Make \(\sigma\) small and it spreads fast (wide spread of \(k\)), make it wide and it barely spreads.`,
eq: String.raw`\[ \Psi_k(x,t) = Ae^{i\left(kx - \frac{\hbar k^2}{2m}t\right)}, \qquad v_{\text{phase}} = \frac{\omega}{k} = \frac{\hbar k}{2m} \]<div class="eqref">Griffiths Eqs. [2.78] and [2.80]</div>\[ \Psi(x,t) = \frac{1}{\sqrt{2\pi}}\int \phi(k)\,e^{i\left(kx - \frac{\hbar k^2}{2m}t\right)}dk, \qquad \phi(k) = \frac{1}{\sqrt{2\pi}}\int\Psi(x,0)e^{-ikx}dx \]<div class="eqref">Griffiths Eqs. [2.83] and [2.86]</div>\[ v_{\text{group}} = \frac{d\omega}{dk} = \frac{\hbar k}{m} = 2v_{\text{phase}} = v_{\text{classical}} \]`,
sym: [[String.raw`\(\omega(k) = \hbar k^2/2m\)`, "dispersion relation of a free matter wave"], [String.raw`\(\phi(k)\)`, "amount of each wave number in the packet, the Fourier transform"], [String.raw`\(v_{\text{phase}}\)`, "speed of a single crest"], [String.raw`\(v_{\text{group}}\)`, "speed of the envelope, which carries the particle"]],
how: [String.raw`With \(V = 0\), the stationary states are plane waves. They are not normalizable (Eq. 2.82), so a free particle cannot have a definite energy.`, String.raw`A real particle is a packet: an integral of plane waves weighted by \(\phi(k)\), where the sum over n of card 3 becomes an integral over k.`, String.raw`If \(\phi(k)\) peaks at \(k_0\), expand \(\omega(k) \approx \omega_0 + \omega'(k_0)(k - k_0)\). The envelope then moves rigidly at \(\omega'(k_0) = \hbar k_0/m\).`, String.raw`The next term, \(\tfrac12\omega''(k - k_0)^2\), makes the packet spread. For a Gaussian \(\sigma(t) = \sigma\sqrt{1 + (\hbar t/2m\sigma^2)^2}\).`],
say: String.raw`A free particle is a wave packet, a superposition of plane waves, whose envelope moves at the group velocity dω/dk = ħk/m, equal to the classical velocity, while individual crests move at the phase velocity ħk/2m.`,
note: String.raw`You already use group velocity every day in photonics: pulses in your waveguides travel at \(v_g = c/n_g\), and the slow light of a photonic crystal waveguide near the band edge is a small \(d\omega/dk\). Gerry and Knight build single photon wave packets the same way, as integrals over modes.`,
num: String.raw`Electron with \(k_0 = 2\) nm⁻¹: crests at 115.8 km/s, envelope at 231.6 km/s, matching the classical \(\sqrt{2E/m}\) for 152 meV. A 0.5 nm wide packet doubles its width in 7.5 fs, a 3 nm packet in 269 fs.`,
r(fig, ctl) {
  ctl.innerHTML = sl("k0", "k₀ (1/nm)", 0.6, 3, 0.1, 1.6) + sl("s0", "Initial width σ (nm)", 0.6, 4, 0.1, 2) + `<div class="readout" id="ro"></div>`;
  let t = 0, crestM = null, picked = 0;
  const x0 = -20, NX = 1201, xs = Array.from({ length: NX }, (_, i) => -30 + 60 * i / (NX - 1));
  const psi = (x, tt, k0, s0) => {   // exact free Gaussian packet
    const tau = tt / (2 * s0 * s0), d = 1 + tau * tau, xc = x0 + k0 * tt, u = x - xc;
    const ampl = Math.pow(2 * Math.PI * s0 * s0, -0.25) * Math.pow(d, -0.25);
    const mag = ampl * Math.exp(-u * u / (4 * s0 * s0 * d));
    const ph = k0 * (x - x0) - k0 * k0 * tt / 2 - 0.5 * Math.atan(tau) + u * u * tau / (4 * s0 * s0 * d);
    return [mag * Math.cos(ph), mag * Math.sin(ph), ph];
  };
  const crestX = (m, tt, k0, s0) => { const tau = tt / (2 * s0 * s0), d = 1 + tau * tau; let x = x0 + (2 * Math.PI * m + k0 * k0 * tt / 2 + 0.5 * Math.atan(tau)) / k0; for (let i = 0; i < 6; i++) { const u = x - x0 - k0 * tt, f = k0 * (x - x0) - k0 * k0 * tt / 2 - 0.5 * Math.atan(tau) + u * u * tau / (4 * s0 * s0 * d) - 2 * Math.PI * m, fp = k0 + 2 * u * tau / (4 * s0 * s0 * d); x -= f / fp; } return x; };
  const draw = () => {
    const k0 = +$("k0").value, s0 = +$("s0").value; $("k0v").textContent = fmt(k0, 1) + " /nm"; $("s0v").textContent = fmt(s0, 1) + " nm";
    const xc = x0 + k0 * t, sig = s0 * Math.sqrt(1 + (t / (2 * s0 * s0)) ** 2);
    if (crestM == null || Math.abs(crestX(crestM, t, k0, s0) - xc) > 1.6 * sig) { crestM = Math.round(k0 * (xc - x0) / (2 * Math.PI) - k0 * k0 * t / (4 * Math.PI)); picked++; }
    const v = xs.map(x => psi(x, t, k0, s0)), mx = Math.pow(2 * Math.PI * s0 * s0, -0.25) * 1.1;
    const F = QM.frame(60, 30, 560, 200, { xmin: -30, xmax: 30, ymin: -mx, ymax: mx, xt: [-30, -20, -10, 0, 10, 20, 30], yt: [0], xl: "x (nm)", yl: "Re Ψ" });
    const env = v.map(q => Math.hypot(q[0], q[1]));
    let s = F.s + QM.path(F, xs, env, C.purple, 1.2, "4 3") + QM.path(F, xs, env.map(e => -e), C.purple, 1.2, "4 3") + QM.path(F, xs, v.map(q => q[0]), C.blue, 1.8);
    const xcr = crestX(crestM, t, k0, s0), ecr = Math.hypot(...psi(xcr, t, k0, s0).slice(0, 2));
    if (xcr > -30 && xcr < 30) s += ci(F.X(xcr), F.Y(ecr), 6, C.coral, "#fff");
    s += `<path d="M${F.X(xc) - 7} ${F.y0 - 12}L${F.X(xc) + 7} ${F.y0 - 12}L${F.X(xc)} ${F.y0 - 2}Z" fill="${C.purple}"/>`;
    s += tx(F.x0 + 8, F.y0 + 16, "coral dot: one crest (phase velocity)", "start", "ts", `fill="${C.coral}"`) + tx(F.x0 + F.w - 8, F.y0 + 16, "purple: envelope centre (group velocity)", "end", "ts", `fill="${C.purple}"`);
    // race track
    const y = 290;
    s += ln(F.x0, y, F.x0 + F.w, y, "var(--b)", 2) + ci(F.X(QM.clamp(x0 + k0 * t / 2, -30, 30)), y, 7, C.coral) + ci(F.X(QM.clamp(xc, -30, 30)), y, 7, C.purple) + tx(F.x0, y + 24, "the same race without the wave: a crest that never resets (coral) against the envelope (purple)", "start");
    fig.innerHTML = svg(320, s);
    $("ro").innerHTML = ro([["time", fmt(t * QM.T0, 0) + " fs"], ["phase velocity ħk₀/2m", fmt(k0 / 2 * QM.VU, 1) + " km/s"], ["group velocity ħk₀/m", fmt(k0 * QM.VU, 1) + " km/s"], ["packet width σ(t)", fmt(sig, 2) + " nm"], ["crests that slid off the back", Math.max(0, picked - 1)]]);
  };
  const reset = () => { t = 0; crestM = null; picked = 0; draw(); };
  $("k0").oninput = reset; $("s0").oninput = reset;
  QM.player(ctl, () => { const k0 = +$("k0").value; if (x0 + k0 * t < 28) t += 0.05; draw(); }, reset);
  reset();
}},

/* ---------------- 2.5 delta ---------------- */
{ s: "7. Delta potential", t: "2.5 The delta-function potential: one bound state, and reflection without a wall",
intu: String.raw`An infinitely narrow, infinitely deep spike of strength \(\alpha\). For \(E \lt 0\) it holds exactly <b>one</b> bound state, a cusp shaped \(e^{-\kappa|x|}\) (lower right). For \(E \gt 0\) a particle can pass or bounce. Press <b>Play</b> to fire a packet at it. The spike has zero width, yet part of the wave reflects, and the exit counters measure \(R\) and \(T\). Compare them with Griffiths' formula, the curve lower left (the dot is the packet's energy). The measured value lands a few percent off the curve because a packet carries a small spread of energies, and the formula is for one energy. Low energy bounces, high energy passes. Then switch to <b>Barrier</b> (a spike pointing up). The bound state disappears, but \(R\) and \(T\) do not change at all: a particle is as likely to cross the well as the barrier. Classically it could never cross an infinitely high barrier.`,
eq: String.raw`\[ V(x) = -\alpha\,\delta(x), \qquad \psi(x) = \frac{\sqrt{m\alpha}}{\hbar}\,e^{-m\alpha|x|/\hbar^2}, \qquad E = -\frac{m\alpha^2}{2\hbar^2} \]<div class="eqref">Griffiths Section 2.5, the single bound state</div>\[ R = \frac{1}{1 + (2\hbar^2E/m\alpha^2)}, \qquad T = \frac{1}{1 + (m\alpha^2/2\hbar^2E)}, \qquad R + T = 1 \]<div class="eqref">Griffiths Eqs. [2.122] and [2.123]</div>`,
sym: [[String.raw`\(\alpha\)`, "strength of the spike, energy × length (here in meV nm)"], [String.raw`\(\kappa = m\alpha/\hbar^2\)`, "decay rate of the bound state"], [String.raw`\(R, T\)`, "reflection and transmission probabilities"], [String.raw`\(\beta = m\alpha/\hbar^2k\)`, "Griffiths' shorthand, R = β²/(1+β²)"]],
how: [String.raw`Away from \(x = 0\) the particle is free. Bound (\(E \lt 0\)): \(\psi = Be^{-\kappa|x|}\). Scattering (\(E \gt 0\)): plane waves on each side.`, String.raw`\(\psi\) is continuous at 0. Its slope is not: integrate the Schrödinger equation across the spike to get \(\Delta\psi' = -\frac{2m\alpha}{\hbar^2}\psi(0)\).`, String.raw`For the bound state the jump in slope is \(-2\kappa B\), so \(\kappa = m\alpha/\hbar^2\). One value, one bound state.`, String.raw`For scattering, the two conditions fix \(B\) (reflected) and \(F\) (transmitted) in terms of \(A\) (incident). \(R = |B|^2/|A|^2\) and \(T = |F|^2/|A|^2\) depend only on \(\alpha^2\), so the sign of the spike does not matter.`],
say: String.raw`The attractive delta well has exactly one bound state, ψ ∝ exp(−mα|x|/ħ²) with E = −mα²/2ħ², and for scattering states it reflects with R = 1/(1 + 2ħ²E/mα²), the same for a well or a barrier.`,
note: String.raw`A thin layer in a heterostructure or a single defect acts like a delta well, and the "always one bound state in 1D" result is why even a weak, thin AlGaAs/GaAs layer traps a level. Reflection without a wall is the matter wave version of reflection at a thin film, the physics behind your Bragg mirrors and grating couplers.`,
num: String.raw`With \(\alpha = 76.2\) meV nm: \(\kappa = 1\) nm⁻¹, bound state width about 1 nm, binding energy 38.1 meV. At \(E = 38.1\) meV the particle has \(R = T = 0.5\). At 152 meV, \(T = 0.80\). At 9.5 meV, \(T = 0.20\).`,
r(fig, ctl) {
  let sign = -1, S;
  ctl.innerHTML = btns([["w", "Well (spike down)"], ["b", "Barrier (spike up)"]], "sg") + sl("al", "Strength α (meV nm)", 20, 150, 1, 76) + sl("E", "Packet energy E (meV)", 10, 300, 1, 60) + `<div class="readout" id="ro"></div>`;
  const reset = () => {
    const al = +$("al").value / QM.E0, E = +$("E").value / QM.E0, w = 0.08;
    $("alv").textContent = $("al").value + " meV nm"; $("Ev").textContent = $("E").value + " meV";
    S = ScatSim(x => sign * al / (w * Math.sqrt(2 * Math.PI)) * Math.exp(-x * x / (2 * w * w)), -12, 2.5, Math.sqrt(2 * E));
    S.al = al; S.E = E; draw();
  };
  const draw = () => {
    pick(ctl, "sg", sign < 0 ? "w" : "b");
    let pk = 0; for (let j = 0; j < G.N; j++) pk = Math.max(pk, S.re[j] ** 2 + S.im[j] ** 2);
    const ym = 0.22;
    const F = QM.frame(60, 26, 560, 150, { xmin: -30, xmax: 30, ymin: 0, ymax: ym, xt: [-30, -20, -10, 0, 10, 20, 30], yt: [0, 0.1, 0.2], xl: "x (nm)", yl: "|ψ|² (1/nm)" });
    let s = rc(F.X(-30), F.y0, F.X(-24) - F.X(-30), F.h, "var(--sunk)") + rc(F.X(24), F.y0, F.X(30) - F.X(24), F.h, "var(--sunk)") + F.s + QM.waveSVG(F, G, S.re, S.im, "phase", 4);
    s += sign < 0 ? ar(F.X(0), F.y0 + 8, F.X(0), F.y0 + F.h - 4, "var(--t)", 3) : ar(F.X(0), F.y0 + F.h - 2, F.X(0), F.y0 + 10, "var(--t)", 3);
    s += tx(F.X(-27), F.y0 + F.h - 6, "exit", "middle") + tx(F.X(27), F.y0 + F.h - 6, "exit", "middle");
    // R, T curves
    const al = S.al, Es = [], Ts = [], Rs = [];
    for (let i = 1; i <= 200; i++) { const e = i * 320 / 200 / QM.E0; Es.push(e * QM.E0); const T = 1 / (1 + al * al / (2 * e)); Ts.push(T); Rs.push(1 - T); }
    const P = QM.frame(60, 236, 300, 130, { xmin: 0, xmax: 320, ymin: 0, ymax: 1, xt: [0, 100, 200, 300], yt: [0, 0.5, 1], xl: "E (meV)", yl: "probability" });
    s += P.s + QM.path(P, Es, Ts, C.teal, 2.5) + QM.path(P, Es, Rs, C.coral, 2.5) + tx(P.X(300), P.Y(0.92), "T", "end", "th", `fill="${C.teal}"`) + tx(P.X(300), P.Y(0.14), "R", "end", "th", `fill="${C.coral}"`);
    const Tth = 1 / (1 + al * al / (2 * S.E));
    s += ln(P.X(S.E * QM.E0), P.y0, P.X(S.E * QM.E0), P.y0 + P.h, "var(--p)", 1, "3 3") + ci(P.X(S.E * QM.E0), P.Y(Tth), 5, C.teal, "#fff");
    if (S.outR + S.outL > 0.9) s += ci(P.X(S.E * QM.E0), P.Y(S.outR), 5, "none", "var(--t)", 'stroke-width="2"') + tx(P.X(S.E * QM.E0) + 8, P.Y(S.outR) + 14, "measured", "start");
    // bound state
    const B = QM.frame(430, 236, 190, 130, { xmin: -5, xmax: 5, ymin: 0, ymax: 1.3, xt: [-5, 0, 5], yt: [], xl: "x (nm)", yl: "" });
    s += B.s;
    if (sign < 0) { const kap = al, xx = Array.from({ length: 201 }, (_, i) => -5 + i / 20), yy = xx.map(x => Math.exp(-kap * Math.abs(x))); s += QM.area(B, xx, yy, C.purple, 0.25) + QM.path(B, xx, yy, C.purple, 2.5) + tx(B.x0 + B.w / 2, B.y0 - 6, `bound state, E = −${fmt(al * al / 2 * QM.E0, 1)} meV`, "middle", "ts"); }
    else s += tx(B.x0 + B.w / 2, B.y0 + B.h / 2, "no bound state", "middle", "th");
    fig.innerHTML = svg(410, s);
    $("ro").innerHTML = ro([["T from Eq. 2.123", fmt(Tth, 3)], ["R from Eq. 2.123", fmt(1 - Tth, 3)], ["through the right exit", fmt(S.outR, 3)], ["back through the left exit", fmt(S.outL, 3)], ["bound state energy", sign < 0 ? "−" + fmt(al * al / 2 * QM.E0, 1) + " meV" : "none"]]);
  };
  ctl.querySelectorAll("button[data-sg]").forEach(b => b.onclick = () => { sign = b.dataset.sg === "w" ? -1 : 1; reset(); });
  $("al").oninput = reset; $("E").oninput = reset;
  QM.player(ctl, () => { if (S.t < 200 && S.outR + S.outL < 0.995) S.adv(8); draw(); }, reset);
  reset();
}},

/* ---------------- 2.6 / 2.7 finite well ---------------- */
{ s: "8. Finite well", t: "2.6 and 2.7 The finite square well: bound states and transmission resonances",
intu: String.raw`A well of depth \(V_0\) and width \(2a\), the realistic version of the box and the textbook model of a quantum well or dot. Left: Griffiths' graphical solution (Figure 2.13). Each crossing of \(\tan z\) (even states) or \(-\cot z\) (odd states) with \(\sqrt{(z_0/z)^2 - 1}\) is a bound state. Deepen or widen the well and \(z_0\) grows, so more branches get crossed and more states appear, one per \(\pi/2\). Make it shallow and narrow: states drop out until <b>one always remains</b>. Right: the bound states at their energies. Unlike the infinite box, the waves <b>leak into the walls</b> (grey), so they fit more loosely and sit lower than the box values. Bottom: above the well the particle is free but still partly reflects. \(T = 1\) exactly where a whole number of half wavelengths fits across the well (Figure 2.14): the well becomes transparent.`,
eq: String.raw`\[ \tan z = \sqrt{(z_0/z)^2 - 1}, \qquad z = la, \qquad z_0 = \frac{a}{\hbar}\sqrt{2mV_0} \]<div class="eqref">Griffiths Eqs. [2.137] and [2.138] (even states)</div>\[ T^{-1} = 1 + \frac{V_0^2}{4E(E + V_0)}\sin^2\!\left(\frac{2a}{\hbar}\sqrt{2m(E + V_0)}\right) \]<div class="eqref">Griffiths Eq. [2.151]</div>\[ T = 1 \ \text{ when } \ E_n + V_0 = \frac{n^2\pi^2\hbar^2}{2m(2a)^2} \]<div class="eqref">Griffiths Eq. [2.153]</div>`,
sym: [[String.raw`\(V_0\)`, "depth of the well"], [String.raw`\(2a\)`, "width of the well"], [String.raw`\(l = \sqrt{2m(E+V_0)}/\hbar\)`, "wave number inside the well"], [String.raw`\(\kappa = \sqrt{-2mE}/\hbar\)`, "decay rate outside, for bound states"], [String.raw`\(z_0\)`, "the well's 'size', sets how many bound states fit"]],
how: [String.raw`Bound states (\(-V_0 \lt E \lt 0\)): oscillating inside, \(\cos lx\) or \(\sin lx\), decaying outside, \(e^{-\kappa|x|}\). The potential is even, so the states are even or odd.`, String.raw`Match \(\psi\) and \(\psi'\) at \(x = a\). Dividing the two conditions gives \(\kappa = l\tan(la)\) for even states (Eq. 2.136).`, String.raw`Because \(\kappa^2 + l^2 = 2mV_0/\hbar^2\), this becomes \(\tan z = \sqrt{(z_0/z)^2 - 1}\), which is solved graphically or numerically.`, String.raw`Deep, wide well: the crossings sit near \(z = n\pi/2\), the infinite well energies. Shallow, narrow: only the first even state survives.`, String.raw`Scattering (\(E \gt 0\)): four matching conditions give \(T(E)\). When \(2la = n\pi\) the reflections from the two edges cancel and \(T = 1\).`],
say: String.raw`A finite square well has a finite number of bound states, at least one, set by z₀ = (a/ħ)√(2mV₀), its wave functions penetrate into the classically forbidden region, and above the well transmission is perfect at the resonances 2la = nπ.`,
note: String.raw`This card is your quantum dot in one dimension. A GaAs dot in AlGaAs has \(V_0\) of a few hundred meV (the band offset) and \(2a\) of a few nm. Use the <b>GaAs mass</b> button: the light effective mass means far fewer bound states and a big confinement shift, which is why the dot height sets your 795 nm emission. The resonances \(T = 1\) are the same Fabry-Pérot physics as in a photonic cavity.`,
num: String.raw`Defaults: \(2a = 5\) nm, \(V_0 = 200\) meV, free electron mass gives \(z_0 = 5.73\) and 4 bound states. The same well with the GaAs mass \(0.067\,m_e\) has \(z_0 = 1.48\) and holds a single state, sitting well above the bottom. Every well, however shallow, keeps at least one even state, since \(\tan z\) always crosses the falling curve once before \(\pi/2\).`,
r(fig, ctl) {
  let mass = 1;
  ctl.innerHTML = btns([["1", "Free electron mass"], ["0.067", "GaAs mass 0.067 mₑ"]], "ms") + sl("w2", "Well width 2a (nm)", 1, 12, 0.1, 5) + sl("V0", "Depth V₀ (meV)", 10, 500, 5, 200) + `<div class="readout" id="ro"></div>`;
  const draw = () => {
    pick(ctl, "ms", String(mass));
    const a = +$("w2").value / 2, V0 = +$("V0").value / QM.E0 * mass;   // m* scales hbar^2/m, so use V0*m in hbar = m_e = 1 units
    $("w2v").textContent = fmt(2 * a, 1) + " nm"; $("V0v").textContent = $("V0").value + " meV";
    const R = finiteStates(a, V0), z0 = R.z0;
    // graphical solution
    const zmax = Math.max(z0 * 1.08, 2);
    const Gf = QM.frame(60, 26, 250, 190, { xmin: 0, xmax: zmax, ymin: 0, ymax: 8, xt: [Math.PI / 2, Math.PI, 3 * Math.PI / 2, 2 * Math.PI, 5 * Math.PI / 2, 3 * Math.PI].filter(v => v < zmax), xf: v => ["π/2", "π", "3π/2", "2π", "5π/2", "3π"][Math.round(v / (Math.PI / 2)) - 1], yt: [0, 4, 8], xl: "z" , yl: "" });
    let s = Gf.s;
    const zs = Array.from({ length: 600 }, (_, i) => 0.001 + i * zmax / 600);
    const brk = f => { let d = "", prev = null; zs.forEach(z => { const v = f(z); if (!Number.isFinite(v) || v < -0.5 || v > 9) { prev = null; return; } d += (prev == null ? "M" : "L") + Gf.X(z).toFixed(1) + " " + Gf.Y(Math.min(8, Math.max(0, v))).toFixed(1); prev = v; }); return d; };
    s += `<path d="${brk(z => Math.tan(z))}" fill="none" stroke="${C.blue}" stroke-width="2"/><path d="${brk(z => -1 / Math.tan(z))}" fill="none" stroke="${C.teal}" stroke-width="2"/>`;
    s += QM.path(Gf, zs.filter(z => z < z0), zs.filter(z => z < z0).map(z => Math.min(8.5, Math.sqrt((z0 / z) ** 2 - 1))), C.coral, 2.5);
    R.states.forEach(st => s += ci(Gf.X(st.z), Gf.Y(Math.min(8, Math.sqrt(Math.max(0, (z0 / st.z) ** 2 - 1)))), 5, st.parity === "even" ? C.blue : C.teal, "#fff"));
    s += tx(Gf.x0 + Gf.w - 6, Gf.y0 + 14, "√((z₀/z)² − 1)", "end", "ts", `fill="${C.coral}"`) + tx(Gf.x0 + Gf.w - 6, Gf.y0 + 28, "tan z (even)", "end", "ts", `fill="${C.blue}"`) + tx(Gf.x0 + Gf.w - 6, Gf.y0 + 42, "−cot z (odd)", "end", "ts", `fill="${C.teal}"`);
    // well with states
    const xmx = Math.max(2 * a + 2, 6), Wf = QM.frame(380, 26, 240, 190, { xmin: -xmx, xmax: xmx, ymin: -V0 * QM.E0 / mass * 1.08, ymax: V0 * QM.E0 / mass * 0.25, xt: [-Math.round(xmx), 0, Math.round(xmx)], yt: [0, -Math.round(V0 * QM.E0 / mass)], xl: "x (nm)", yl: "E (meV)" });
    s += rc(Wf.x0, Wf.y0, Wf.X(-a) - Wf.x0, Wf.h, "var(--gray-bg)") + rc(Wf.X(a), Wf.y0, Wf.x0 + Wf.w - Wf.X(a), Wf.h, "var(--gray-bg)") + Wf.s;
    s += `<path d="M${Wf.x0} ${Wf.Y(0)}L${Wf.X(-a)} ${Wf.Y(0)}L${Wf.X(-a)} ${Wf.Y(-V0 * QM.E0 / mass)}L${Wf.X(a)} ${Wf.Y(-V0 * QM.E0 / mass)}L${Wf.X(a)} ${Wf.Y(0)}L${Wf.x0 + Wf.w} ${Wf.Y(0)}" fill="none" stroke="var(--t)" stroke-width="2"/>`;
    const xx = Array.from({ length: 301 }, (_, i) => -xmx + 2 * xmx * i / 300), amp = V0 * QM.E0 / mass * 0.12;
    R.states.forEach((st, k) => {
      const Em = st.E * QM.E0 / mass, ys = xx.map(x => finitePsi(st, a, x));
      const mx = Math.max(...ys.map(Math.abs)) || 1;
      s += ln(Wf.x0, Wf.Y(Em), Wf.x0 + Wf.w, Wf.Y(Em), "var(--b)", 1, "3 3") + QM.path(Wf, xx, ys.map(v => Em + amp * v / mx), NC[k % NC.length], 2);
    });
    // transmission
    const Es = [], Ts = [], Emax = 3 * V0;
    for (let i = 1; i <= 400; i++) { const E = i * Emax / 400; Es.push(E * QM.E0 / mass); const sn = Math.sin(2 * a * Math.sqrt(2 * (E + V0))); Ts.push(1 / (1 + V0 * V0 / (4 * E * (E + V0)) * sn * sn)); }
    const Tf = QM.frame(60, 266, 560, 110, { xmin: 0, xmax: Emax * QM.E0 / mass, ymin: 0, ymax: 1.05, xt: [0, 0.5, 1, 1.5, 2, 2.5, 3].map(f => Math.round(f * V0 * QM.E0 / mass)), yt: [0, 0.5, 1], xl: "energy above the well top E (meV)", yl: "T" });
    s += Tf.s + QM.path(Tf, Es, Ts, C.teal, 2.5);
    for (let n = 1; n < 40; n++) { const E = n * n * Math.PI * Math.PI / (2 * 4 * a * a) - V0; if (E > 0 && E < Emax) s += ln(Tf.X(E * QM.E0 / mass), Tf.y0, Tf.X(E * QM.E0 / mass), Tf.y0 + Tf.h, C.coral, 1, "3 3"); }
    s += tx(Tf.x0 + Tf.w - 6, Tf.y0 + Tf.h - 8, "coral lines: Eq. 2.153, where T = 1", "end", "ts", `fill="${C.coral}"`);
    fig.innerHTML = svg(420, s);
    $("ro").innerHTML = ro([["z₀", fmt(z0, 2)], ["bound states", R.states.length], ["ground state", R.states.length ? fmt((R.states[0].E + V0) * QM.E0 / mass, 1) + " meV above the bottom" : "none"], ["infinite well of the same width", fmt(Math.PI * Math.PI / (2 * 4 * a * a) * QM.E0 / mass, 1) + " meV above the bottom"], ["all levels (meV from the top)", R.states.map(st => fmt(st.E * QM.E0 / mass, 0)).join(", ")]]);
  };
  ctl.querySelectorAll("button[data-ms]").forEach(b => b.onclick = () => { mass = +b.dataset.ms; draw(); });
  $("w2").oninput = draw; $("V0").oninput = draw;
  draw();
}}
],
summary: String.raw`If V does not depend on time, separation of variables gives stationary states ψₙ(x)exp(−iEₙt/ħ) with definite energy and a frozen |Ψ|², and every solution is a sum Σcₙψₙexp(−iEₙt/ħ) with cₙ found by Fourier's trick and |cₙ|² the probability of Eₙ. Motion is a beat between energies. The infinite well gives Eₙ ∝ n²/a² and sine standing waves. The harmonic oscillator gives equally spaced levels (n + ½)ħω, reached with ladder operators, a Gaussian ground state with zero-point energy, and Hermite polynomial states that leak past the turning points and approach the classical density at large n. A free particle is a wave packet moving at the group velocity ħk/m and spreading. The delta well has one bound state and reflects without a wall. The finite well has finitely many bound states, at least one, that penetrate the walls, and it transmits perfectly at the resonances.`,
sheet: [
[String.raw`\[ \Psi = \psi(x)e^{-iEt/\hbar}, \quad \hat H\psi = E\psi, \quad \Psi(x,t) = \sum c_n\psi_n e^{-iE_nt/\hbar} \]`, "Stationary states and the general solution (Section 2.1)"],
[String.raw`\[ c_n = \int\psi_n^*\Psi(x,0)\,dx, \quad \sum|c_n|^2 = 1, \quad \langle H\rangle = \sum E_n|c_n|^2 \]`, "Fourier's trick [2.33] to [2.35]"],
[String.raw`\[ E_n = \frac{n^2\pi^2\hbar^2}{2ma^2}, \quad \psi_n = \sqrt{\tfrac{2}{a}}\sin\frac{n\pi x}{a} \]`, "Infinite square well [2.23], [2.24]"],
[String.raw`\[ a_\pm = \frac{1}{\sqrt{2m}}\left(\frac{\hbar}{i}\frac{d}{dx} \pm im\omega x\right), \quad [a_-,a_+] = \hbar\omega, \quad a_-\psi_0 = 0 \]`, "Ladder operators [2.41], [2.45], [2.47]"],
[String.raw`\[ E_n = (n + \tfrac12)\hbar\omega, \quad \psi_n = \left(\tfrac{m\omega}{\pi\hbar}\right)^{1/4}\tfrac{1}{\sqrt{2^nn!}}H_n(\xi)e^{-\xi^2/2} \]`, "Harmonic oscillator levels and states [2.69]"],
[String.raw`\[ \hat a^\dagger\psi_n = \sqrt{n+1}\,\psi_{n+1}, \quad \hat a\,\psi_n = \sqrt{n}\,\psi_{n-1} \]`, "Dimensionless ladder, as used in Gerry and Knight"],
[String.raw`\[ \Psi = \frac{1}{\sqrt{2\pi}}\int\phi(k)e^{i(kx - \hbar k^2t/2m)}dk, \quad v_g = \frac{\hbar k}{m} = 2v_p \]`, "Free particle wave packet [2.83], [2.80]"],
[String.raw`\[ E = -\frac{m\alpha^2}{2\hbar^2}, \quad T = \frac{1}{1 + m\alpha^2/2\hbar^2E} \]`, "Delta function well [2.123]"],
[String.raw`\[ \tan z = \sqrt{(z_0/z)^2 - 1}, \quad z_0 = \tfrac{a}{\hbar}\sqrt{2mV_0} \]`, "Finite well bound states [2.138]"],
[String.raw`\[ T^{-1} = 1 + \frac{V_0^2}{4E(E+V_0)}\sin^2\!\left(\tfrac{2a}{\hbar}\sqrt{2m(E+V_0)}\right) \]`, "Finite well transmission [2.151]"]],
consts: String.raw`\(\hbar = 1.0546\times10^{-34}\) J s \(= 0.6582\) eV fs, \(m_e = 9.109\times10^{-31}\) kg, GaAs electron effective mass \(0.067\,m_e\), \(\hbar^2/(m_e\,\text{nm}^2) = 76.20\) meV`,
sources: ["D. J. Griffiths, Introduction to Quantum Mechanics (Prentice Hall, 1995), Chapter 2, Sections 2.1 to 2.7, Figures 2.3 to 2.14, Table 2.1 and Problems 2.5 to 2.15 and 2.28", "C. C. Gerry and P. L. Knight, Introductory Quantum Optics (Cambridge, 2005), Chapter 2, for the link between ladder operators and photons", "R. W. Robinett, Phys. Rep. 392, 1 (2004), quantum wave packet revivals (card 3)", "A. Goldberg, H. M. Schey and J. L. Schwartz, Am. J. Phys. 35, 177 (1967), computer animated wave packet scattering, cited by Griffiths (cards 7 and 8)"]
});
})();

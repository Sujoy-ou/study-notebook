(function () {
/* Journal Club, Weber et al. 2010. Lesson 3: how NV⁻ works (Fig. 1 of the paper).
   A seven level rate model: G0, G+, G−, E0, E+, E−, S (singlet shelf). Rates in 1/µs (= MHz), of the size
   reported in the NV literature (e.g. Tetienne et al. 2012), rounded. The model has no imperfections. */
const { tx, rc, ln, ci, fmt, sci, C } = JC;
const K = { kr: 65, kE0S: 11, kE1S: 80, kS0: 2.6, kS1: 0.7 };
function M(beta, Wp, Wm) {
  const A = Array.from({ length: 7 }, () => Array(7).fill(0)), add = (i, j, k) => { A[j][i] += k; A[i][i] -= k; };
  const kp = beta * K.kr;
  [0, 1, 2].forEach(g => { add(g, g + 3, kp); add(g + 3, g, K.kr); });
  add(3, 6, K.kE0S); add(4, 6, K.kE1S); add(5, 6, K.kE1S); add(6, 0, K.kS0); add(6, 1, K.kS1); add(6, 2, K.kS1);
  add(0, 1, Wp); add(1, 0, Wp); add(0, 2, Wm); add(2, 0, Wm);
  return A;
}
function step(p, A, dt) {
  const f = q => A.map(r => r.reduce((s, a, j) => s + a * q[j], 0));
  const k1 = f(p), k2 = f(p.map((x, i) => x + dt / 2 * k1[i])), k3 = f(p.map((x, i) => x + dt / 2 * k2[i])), k4 = f(p.map((x, i) => x + dt * k3[i]));
  return p.map((x, i) => x + dt / 6 * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
}
function steady(A) {
  const n = 7, B = A.map(r => r.slice()), b = Array(n).fill(0); B[n - 1] = Array(n).fill(1); b[n - 1] = 1;
  for (let c = 0; c < n; c++) {
    let m = c; for (let r = c + 1; r < n; r++) if (Math.abs(B[r][c]) > Math.abs(B[m][c])) m = r;
    [B[c], B[m]] = [B[m], B[c]]; [b[c], b[m]] = [b[m], b[c]];
    for (let r = 0; r < n; r++) if (r !== c) { const f = B[r][c] / B[c][c]; for (let k = c; k < n; k++) B[r][k] -= f * B[c][k]; b[r] -= f * b[c]; }
  }
  return b.map((x, i) => x / B[i][i]);
}
/* time trace: returns arrays of t (µs), populations, fluorescence (photons/µs up to collection) */
function trace(P0, beta, T, n) {
  const A = M(beta, 0, 0), dt = 0.002, out = { t: [], p: [], F: [] }; let p = P0.slice(), every = Math.max(1, Math.round(T / dt / n));
  for (let i = 0, t = 0; t <= T + 1e-9; i++, t += dt) {
    if (i % every === 0) { out.t.push(t); out.p.push(p.slice()); out.F.push(K.kr * (p[3] + p[4] + p[5])); }
    p = step(p, A, dt);
  }
  return out;
}
const counts = (P0, beta, T) => { const A = M(beta, 0, 0), dt = 0.002; let p = P0.slice(), c = 0; for (let t = 0; t < T; t += dt) { p = step(p, A, dt); c += K.kr * (p[3] + p[4] + p[5]) * dt; } return c; };

/* level positions for the Fig. 1 drawing */
const L = { x0: 140, x1: 240, w: 80, g0: 330, g1: 300, e0: 118, e1: 92, sx: 470, sA: 170, sE: 240 };
function fig1(stage, dot) {
  let s = "";
  const lvl = (x, y, w, lab, side) => ln(x, y, x + w, y, "var(--p)", 3) + (lab ? tx(side === "l" ? x - 8 : x + w + 8, y + 4, lab, side === "l" ? "end" : "start") : "");
  s += tx(230, 362, "³A₂ ground triplet (m_s = ±1 sit 2.87 GHz above 0)", "middle", "th") + tx(230, 70, "³E excited triplet", "middle", "th");
  s += lvl(L.x0, L.g0, L.w, "m_s = 0", "l") + lvl(L.x1, L.g1, L.w, "±1", "r");
  s += lvl(L.x0, L.e0, L.w, "m_s = 0", "l") + lvl(L.x1, L.e1, L.w, "±1", "r");
  s += lvl(L.sx, L.sA, 100, "¹A₁", "r") + lvl(L.sx, L.sE, 100, "¹E", "r") + tx(L.sx + 60, L.sA - 30, "singlets (dark shelf)", "middle", "th");
  const on = k => stage === k || stage === 5, op = k => on(k) ? 1 : 0.3, wd = (k, a, b) => on(k) ? a : b;
  // excitation (green, up)
  [[L.x0 + 20, L.g0, L.e0], [L.x1 + 20, L.g1, L.e1]].forEach(([x, y1, y2]) => s += `<line x1="${x}" y1="${y1 - 4}" x2="${x}" y2="${y2 + 6}" stroke="${C.green}" stroke-width="${wd(1, 4, 1.5)}" opacity="${op(1)}" marker-end="url(#ar)"/>`);
  if (on(1)) s += tx(130, 215, "green laser", "end", "th", `fill="${C.green}"`) + tx(130, 231, "532 nm", "end");
  // emission (red, down)
  [[L.x0 + 58, L.e0, L.g0], [L.x1 + 58, L.e1, L.g1]].forEach(([x, y1, y2]) => s += `<line x1="${x}" y1="${y1 + 4}" x2="${x}" y2="${y2 - 6}" stroke="${C.red}" stroke-width="${wd(2, 4, 1.5)}" opacity="${op(2)}" stroke-dasharray="7 4" marker-end="url(#ar)"/>`);
  if (on(2)) s += tx(330, 200, "red light, ZPL 637 nm", "start", "th", `fill="${C.red}"`) + tx(330, 216, "spin kept: 0→0, ±1→±1", "start");
  // intersystem crossing (purple)
  s += `<path d="M${L.x1 + L.w + 2} ${L.e1} Q 400 100 ${L.sx - 4} ${L.sA - 2}" fill="none" stroke="${C.purple}" stroke-width="${wd(3, 5, 2)}" opacity="${op(3)}" marker-end="url(#ar)"/>`;
  s += `<path d="M${L.x0 + 40} ${L.e0 - 4} Q 330 20 ${L.sx + 6} ${L.sA - 4}" fill="none" stroke="${C.purple}" stroke-width="1.2" opacity="${op(3)}" stroke-dasharray="3 3" marker-end="url(#ar)"/>`;
  if (on(3)) s += tx(350, 150, "strong from ±1", "middle", "th", `fill="${C.purple}"`) + tx(330, 46, "weak from 0", "middle", "ts", `fill="${C.purple}"`);
  s += `<line x1="${L.sx + 50}" y1="${L.sA + 4}" x2="${L.sx + 50}" y2="${L.sE - 6}" stroke="var(--p)" stroke-width="1.5" stroke-dasharray="3 2" marker-end="url(#ar)"/>`;
  // return (teal)
  s += `<path d="M${L.sx + 10} ${L.sE + 4} Q 380 345 ${L.x0 + L.w + 4} ${L.g0}" fill="none" stroke="${C.teal}" stroke-width="${wd(4, 5, 2)}" opacity="${op(4)}" marker-end="url(#ar)"/>`;
  s += `<path d="M${L.sx + 4} ${L.sE + 2} Q 400 290 ${L.x1 + L.w + 4} ${L.g1}" fill="none" stroke="${C.teal}" stroke-width="1.2" stroke-dasharray="3 3" opacity="${op(4)}" marker-end="url(#ar)"/>`;
  if (on(4)) s += tx(470, 315, "mostly back to m_s = 0", "start", "th", `fill="${C.teal}"`);
  s += tx(600, 70, "³E is 1.945 eV above ³A₂", "middle");
  if (dot) s += ci(dot[0], dot[1], 7, C.blue, "#fff");
  return s;
}

addLesson("jc", "weber", {
level: "Core",
id: "jc-weber-l3", title: "How the NV⁻ center works (Fig. 1)", short: "3. How NV⁻ works",
labels: { note: "Journal club note" },
big: String.raw`Fig. 1 of the paper is the whole reason anyone cares about NV. The ground state is a spin triplet \(^3A_2\) whose \(m_s = 0\) and \(m_s = -1\) sublevels form the qubit. A green laser lifts it to the excited triplet \(^3E\), 1.945 eV higher, and it falls back emitting red light <b>without changing its spin</b>. But from \(m_s = \pm 1\) of \(^3E\) there is a side door: a non-radiative crossing to a singlet shelf, which then decays mostly into \(m_s = 0\). Two things follow. Repeated laser cycles <b>pump</b> the spin into \(m_s = 0\) (initialization), and a spin in \(\pm 1\) is <b>darker</b> because it spends time on the dark shelf (readout). Microwaves at 2.87 GHz rotate the spin in between (manipulation). This lesson animates the cycle, then runs a seven-level rate model live to show pumping, readout contrast, ODMR and a full pulsed experiment.`,
cards: [
{ s: "1. Fig. 1 redrawn", t: "The optical cycle of NV⁻, step by step",
intu: String.raw`Press the steps in order. <b>1. Excite:</b> a green photon lifts the electron from \(^3A_2\) to \(^3E\). Optical transitions do not touch the spin, so \(m_s = 0\) goes to \(m_s = 0\) and \(\pm1\) to \(\pm1\). <b>2. Emit:</b> most of the time it falls straight back and emits a red photon, again keeping its spin. This is the bright cycle. <b>3. Intersystem crossing:</b> sometimes it instead slips sideways, without light, into the singlet states. This happens about seven times more often from \(m_s = \pm1\) than from \(m_s = 0\). <b>4. Return:</b> the singlet decays back to the ground triplet, preferentially into \(m_s = 0\). Step 5 shows everything together, and Play runs one electron around the loop starting in \(m_s = \pm1\).`,
eq: String.raw`\[ ^3A_2 \xrightarrow{\ h\nu_{\text{green}}\ } {^3E} \xrightarrow{\ k_r\ } {^3A_2} + h\nu_{\text{red}} \qquad (\Delta m_s = 0) \]\[ ^3E(m_s = \pm 1) \xrightarrow{\ k_{\pm1}^{\text{ISC}} \gg k_0^{\text{ISC}}\ } {^1A_1} \to {^1E} \to {^3A_2}(m_s = 0) \]`,
sym: [[String.raw`\(^3A_2, ^3E\)`, "ground and excited spin triplets (superscript 3 = 2S + 1)"], [String.raw`\(^1A_1, ^1E\)`, "spin singlets between them, the dark shelf"], [String.raw`\(k_r\)`, "radiative decay rate, about 65 per µs (lifetime about 12 ns)"], [String.raw`\(k^{\text{ISC}}\)`, "intersystem crossing rate into the singlets, spin dependent"], [String.raw`\(\Delta m_s = 0\)`, "the optical transition keeps the spin projection"]],
how: [String.raw`The electric field of light acts on the orbital motion, not on spin. So the optical transitions conserve \(m_s\). This is the "spin-conserving" transition of criterion D3.`, String.raw`Going from a triplet to a singlet requires flipping a spin. Only the weak spin-orbit coupling allows it, which is why it is non-radiative and slow.`, String.raw`Spin-orbit coupling in \(C_{3v}\) symmetry connects the singlet mainly with the \(m_s = \pm1\) components of \(^3E\). That makes the crossing spin selective (criterion D2).`, String.raw`Out of the singlet, the decay also favors \(m_s = 0\). The loop as a whole moves population from \(\pm1\) into 0.`],
say: String.raw`Spin-conserving optical cycling between ³A₂ and ³E, combined with a spin-selective intersystem crossing from the \(m_s = \pm1\) levels of ³E through the singlets back to \(m_s = 0\), lets light both initialize and read the NV spin.`,
num: String.raw`Model rates (per µs): \(k_r = 65\), \(k_0^{\text{ISC}} = 11\), \(k_{\pm1}^{\text{ISC}} = 80\), singlet to \(m_s = 0\): 2.6, to each \(\pm1\): 0.7. From \(^3E(\pm1)\), the chance of taking the side door is 80/145 = <b>55 %</b>. From \(^3E(0)\) it is 11/76 = <b>14 %</b>. ZPL 1.945 eV = 637 nm.`,
r(fig, ctl) {
  let st = 5; const S = ["1. excite", "2. emit", "3. crossing", "4. return", "5. all"];
  ctl.innerHTML = `<div class="row">${S.map((t, i) => `<button data-k="${i + 1}">${t}</button>`).join("")}</div>`;
  const path = [[L.x1 + 20, L.g1], [L.x1 + 20, L.e1], [L.x1 + L.w, L.e1], [400, 112], [L.sx, L.sA], [L.sx + 50, L.sE], [380, 318], [L.x0 + L.w, L.g0], [L.x0 + 20, L.g0], [L.x0 + 20, L.e0], [L.x0 + 58, L.e0], [L.x0 + 58, L.g0]];
  const at = t => { const seg = path.length - 1, u = (t * 0.35) % 1 * seg, i = Math.floor(u), f = u - i, a = path[i], b = path[i + 1]; return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]; };
  let dot = null;
  const u = () => { pick(ctl, "k", st); fig.innerHTML = svg(365, fig1(st, dot)); };
  ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { st = +b.dataset.k; u(); });
  JC.player(ctl, t => { dot = t > 0 ? at(t) : null; u(); }, "Play one electron");
}},

{ s: "2. Where the states come from", t: "From two orbitals to four many-electron states",
intu: String.raw`Where do \(^3A_2\), \(^3E\) and the singlets come from? From the dangling bond levels of lesson 5. In NV⁻ the two lowest orbitals are full, and the last two electrons go into the doubly degenerate \(e\) level, which has room for four. Two electrons in four slots can be arranged in \(\binom{4}{2} = 6\) ways. Coulomb repulsion sorts those 6 arrangements into a spin triplet \(^3A_2\) (3 states, lowest by Hund's rule) and two singlets \(^1E\) (2 states) and \(^1A_1\) (1 state). Promoting one electron from \(a_1\) into \(e\) gives the configuration \(a_1^1 e^3\), whose 8 arrangements make the excited triplet \(^3E\) (6 states) and another singlet. Pick a configuration and watch the arrangements get sorted. The paper's density functional calculation works with the single-electron levels on the left, while Fig. 1 shows the many-electron states on the right.`,
eq: String.raw`\[ a_1^2 e^2 \;\longrightarrow\; {^3A_2} \oplus {^1E} \oplus {^1A_1}, \qquad 6 = 3 + 2 + 1 \]\[ a_1^1 e^3 \;\longrightarrow\; {^3E} \oplus {^1E}, \qquad 8 = 6 + 2 \]`,
sym: [[String.raw`\(a_1, e\)`, "single-electron dangling bond orbitals of the defect, e is twofold degenerate"], [String.raw`\(a_1^2 e^2\)`, "configuration: 2 electrons in a₁ and 2 in e (the lower a₁(1) is full and not shown)"], [String.raw`\(^{2S+1}\Gamma\)`, "many-electron state with spin S and orbital symmetry Γ"], [String.raw`\(\binom{4}{2}\)`, "number of ways to put 2 electrons in 4 spin orbitals"]],
how: [String.raw`Each spatial orbital holds two spin orbitals. \(e\) has two spatial orbitals, so four spin orbitals.`, String.raw`For \(e^2\): 6 microstates. The fully symmetric spin part with \(S = 1\) needs an antisymmetric orbital part, which is \(A_2\): the \(^3A_2\) triplet.`, String.raw`The remaining 3 microstates have \(S = 0\) and symmetric orbital parts, \(E\) and \(A_1\).`, String.raw`Hund's rule (exchange) puts the triplet lowest, which is why NV⁻ has a paramagnetic ground state, criterion D1.`, String.raw`For \(a_1^1 e^3\), think of one hole in \(e\) and one in \(a_1\): \(2 \times 4 = 8\) microstates, a triplet \(E\) (6) and a singlet \(E\) (2).`],
say: String.raw`The NV⁻ ground configuration a₁²e² gives the ³A₂ triplet plus the ¹E and ¹A₁ singlets, and the excited configuration a₁e³ gives the ³E triplet.`,
num: String.raw`Ground: 6 microstates = 3 (³A₂) + 2 (¹E) + 1 (¹A₁). Excited: 8 = 6 (³E: 2 orbital × 3 spin) + 2 (¹E′). Measured energies above ³A₂: ³E at 1.945 eV, ¹E about 0.4 eV, ¹A₁ about 1.5 eV (these singlet positions came after the paper).`,
r(fig, ctl) {
  let k = 0;
  ctl.innerHTML = `<div class="row"><button data-k="0">ground a₁² e²</button><button data-k="1">excited a₁¹ e³</button></div>`;
  const u = () => {
    pick(ctl, "k", k);
    let s = tx(110, 30, "single-electron levels", "middle", "th");
    s += ln(40, 230, 180, 230, "var(--p)", 3) + tx(188, 234, "a₁(2)", "start") + ln(40, 120, 100, 120, "var(--p)", 3) + ln(120, 120, 180, 120, "var(--p)", 3) + tx(188, 124, "e", "start");
    const a1 = k ? 1 : 2, ne = k ? 3 : 2;
    s += JC.up(100, 229, C.blue); if (a1 > 1) s += JC.dn(120, 229, C.blue);
    if (ne === 2) { s += JC.up(62, 119, C.blue) + JC.up(142, 119, C.blue); s += tx(110, 270, "one arrangement of the triplet", "middle"); }
    else { s += JC.up(62, 119, C.blue) + JC.dn(78, 119, C.blue) + JC.up(142, 119, C.blue); s += tx(110, 270, "one hole in a₁, one in e", "middle"); }
    if (k) s += `<line x1="110" y1="222" x2="132" y2="128" stroke="${C.green}" stroke-width="2" stroke-dasharray="4 3" marker-end="url(#ar)"/>`;
    // microstates grid
    const ms = k ? [["³E", 6, C.coral], ["¹E′", 2, C.gray]] : [["³A₂", 3, C.blue], ["¹E", 2, C.purple], ["¹A₁", 1, C.amber]];
    const tot = ms.reduce((a, b) => a + b[1], 0);
    s += tx(450, 30, `${tot} ways to place the electrons`, "middle", "th");
    let i = 0;
    ms.forEach(([lab, n, col], gi) => { for (let j = 0; j < n; j++, i++) { const x = 300 + (i % 4) * 75, y = 50 + Math.floor(i / 4) * 52; s += rc(x, y, 64, 40, col, "none", 'rx="6" fill-opacity="0.25"') + rc(x, y, 64, 40, "none", col, 'rx="6"') + tx(x + 32, y + 25, lab, "middle", "th"); } });
    // energy ordering
    const E = k ? [["³E", 1.945, C.coral], ["¹E′", 2.4, C.gray]] : [["³A₂", 0, C.blue], ["¹E", 0.4, C.purple], ["¹A₁", 1.5, C.amber]];
    s += tx(450, 190, "sorted by energy (Hund: triplet lowest)", "middle", "th");
    const yE = e => 300 - (k ? (e - 1.8) * 100 : e * 55);
    E.forEach(([lab, e, col], j) => { s += ln(320 + j * 10, yE(e), 470 + j * 10, yE(e), col, 4) + tx(480 + j * 10, yE(e) + 4, `${lab}${k ? "" : "  " + e + " eV"}`, "start", "th"); });
    if (k) s += tx(450, 330, "³E sits 1.945 eV above ³A₂", "middle");
    fig.innerHTML = svg(345, s);
  };
  ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { k = +b.dataset.k; u(); }); u();
},
note: String.raw`<p>The paper's Fig. 1 shows only one intermediate singlet, ¹A₁. Later experiments established two singlets, ¹A₁ above ¹E, with an infrared line at 1042 nm between them. The physics of the side door is the same. A good question for the room: which parts of Fig. 1 can a single-particle DFT calculation actually produce, and which need many-body theory?</p>`},

{ s: "3. Dark or bright", t: String.raw`Readout: an \(m_s = \pm 1\) spin glows less`,
intu: String.raw`Switch on the laser and count red photons. If the spin started in \(m_s = 0\) (blue curve), it cycles brightly. If it started in \(m_s = \pm1\) (orange curve), about half of its cycles divert into the dark singlet, where it sits for a few hundred nanoseconds, so the first few hundred nanoseconds are clearly dimmer. After about a microsecond both curves become the same, because the laser has pumped both into \(m_s = 0\). The <b>readout</b> is therefore: count photons in a short window right after the laser turns on. The shaded window and the contrast readout show how much information that window carries. Slide the laser power and the window length.`,
eq: String.raw`\[ \mathcal{C} = 1 - \frac{N_{\pm1}}{N_0}, \qquad N_{m} = \int_0^{\tau_w} k_r\, p_{^3E}(t \mid m)\, dt \]`,
sym: [[String.raw`\(N_m\)`, "photons emitted in the window when the spin starts in m"], [String.raw`\(p_{^3E}\)`, "population of the excited triplet"], [String.raw`\(\tau_w\)`, "readout window length"], [String.raw`\(\mathcal{C}\)`, "readout contrast"]],
how: [String.raw`Photons only come from the excited triplet, at the rate \(k_r\) times its population.`, String.raw`Starting in \(\pm1\), the excited state empties into the singlet faster (rate 145 instead of 76 per µs), and the singlet holds the electron for about 250 ns without light.`, String.raw`So the photon rate drops while the electron is shelved. Integrating the rate over the window gives the photon number.`, String.raw`If the window is too long, the pumping into 0 washes out the difference, so the contrast falls again. There is a best window, a few hundred ns.`],
say: String.raw`NV spin readout counts fluorescence right after the laser turns on, because the \(m_s = \pm1\) state is shelved into the dark singlets and emits fewer photons than \(m_s = 0\) before both are pumped to \(m_s = 0\).`,
num: String.raw`The ideal model gives a contrast of about 50 % for a 300 ns window. Real single NV centers show about 20 to 30 %, because of collection, background and imperfect selectivity. With typical collection, only about 0.03 photons are detected per shot, so each readout is repeated thousands of times.`,
r(fig, ctl) {
  ctl.innerHTML = sl("b", "Laser power (×saturation)", 0.1, 3, 0.05, 1) + sl("w", "Window τ_w (ns)", 50, 1500, 10, 300) + `<div class="readout" id="ro"></div>`;
  const u = () => {
    const b = +$("b").value, w = +$("w").value / 1000; $("bv").textContent = fmt(b, 2); $("wv").textContent = $("w").value + " ns";
    const T = 2, a = trace([1, 0, 0, 0, 0, 0, 0], b, T, 300), c = trace([0, 1, 0, 0, 0, 0, 0], b, T, 300);
    const Fm = Math.max(...a.F) * 1.1;
    const F = JC.frame(70, 30, 560, 230, { xmin: 0, xmax: 2, ymin: 0, ymax: Fm, xt: [0, 0.5, 1, 1.5, 2], xf: v => v * 1000, yt: [0, Fm / 2, Fm].map(v => +v.toFixed(0)), xl: "time after laser on (ns)", yl: "photon rate (per µs)", grid: true });
    let s = F.s + rc(F.X(0), 30, F.X(w) - F.X(0), 230, C.gold, "none", 'fill-opacity="0.18"');
    s += JC.path(F, a.t, a.F, C.blue, 2.5) + JC.path(F, c.t, c.F, C.coral, 2.5);
    s += tx(F.X(1.2), F.Y(a.F[180]) - 10, "start in m_s = 0", "start", "th", `fill="${C.blue}"`) + tx(F.X(0.35), F.Y(Fm * 0.25), "start in m_s = ±1", "start", "th", `fill="${C.coral}"`);
    const n0 = counts([1, 0, 0, 0, 0, 0, 0], b, w), n1 = counts([0, 1, 0, 0, 0, 0, 0], b, w);
    fig.innerHTML = svg(300, s);
    $("ro").innerHTML = `<div><span>photons in window, m_s = 0</span><b>${fmt(n0, 2)}</b></div><div><span>photons, m_s = ±1</span><b>${fmt(n1, 2)}</b></div><div><span>contrast</span><b>${fmt(100 * (1 - n1 / n0), 1)} %</b></div>`;
  };
  $("b").oninput = u; $("w").oninput = u; u();
}},

{ s: "4. Optical pumping", t: String.raw`Initialization: the laser pumps the spin into \(m_s = 0\)`,
intu: String.raw`Start with a spin at room temperature: thermal equilibrium puts one third of the population in each of \(m_s = 0, +1, -1\) (lesson 1, card 5). Turn on the laser and press Play. Every pass through the excited state gives \(\pm1\) a 55 % chance of being diverted to the singlet, and the singlet mostly returns to 0. After a few microseconds the bars settle with most of the population in \(m_s = 0\). That is the <b>initialization</b> step, and it works at any temperature because it is a driven cycle, not thermal equilibrium. Notice that more laser power makes it faster but not better: the final polarization is set by the ratios of the rates, not by the laser.`,
eq: String.raw`\[ \frac{d\mathbf{p}}{dt} = \mathbf{M}\,\mathbf{p}, \qquad \mathbf{p} = (p_{G0}, p_{G+}, p_{G-}, p_{E0}, p_{E+}, p_{E-}, p_{S}) \]\[ \eta_{\pm1\to0} = \frac{k_{\pm1}^{\text{ISC}}}{k_r + k_{\pm1}^{\text{ISC}}}\,b_0, \qquad \eta_{0\to\pm1} = \frac{k_{0}^{\text{ISC}}}{k_r + k_{0}^{\text{ISC}}}\,(1 - b_0), \qquad P_0^{\infty} \approx \frac{\eta_{\pm1\to0}}{\eta_{\pm1\to0} + \eta_{0\to\pm1}} \]`,
sym: [[String.raw`\(\mathbf{M}\)`, "rate matrix built from the arrows of card 1"], [String.raw`\(p_{G0} \dots p_S\)`, "populations of the seven levels"], [String.raw`\(b_0, b_1\)`, "fraction of singlet decays that land in \\(m_s = 0\\) (2.6 / 4.0 = 0.65 here)"], [String.raw`\(\eta\)`, "chance per optical cycle of moving between 0 and ±1"], [String.raw`\(P_0^{\infty}\)`, "steady state fraction of the ground state in \\(m_s = 0\\)"]],
how: [String.raw`Each arrow of card 1 is a rate. Population flows out of a level at the sum of its outgoing rates and into the target level.`, String.raw`Collect all of them in a matrix \(\mathbf{M}\). The populations then obey a linear set of equations, solved here step by step (Runge-Kutta).`, String.raw`At steady state \(\mathbf{M}\mathbf{p} = 0\). Per optical cycle, \(\pm1\) is converted to 0 with probability \(\tfrac{80}{145}\times 0.65 \approx 0.36\), and 0 is converted to \(\pm1\) with \(\tfrac{11}{76}\times 0.35 \approx 0.05\).`, String.raw`The balance of those two flows sets the polarization: 0.36 / (0.36 + 0.05) ≈ 0.88, the same as the full model.`],
say: String.raw`Under continuous green excitation the spin-selective intersystem crossing pumps NV into \(m_s = 0\) within about a microsecond, with a steady-state polarization set by the ratio of the crossing rates.`,
num: String.raw`Model: steady-state polarization <b>88 %</b> in \(m_s = 0\) at any laser power. Measured values at room temperature are typically quoted as 80 to 90 %. Time to pump at saturation: about 1 µs.`,
r(fig, ctl) {
  ctl.innerHTML = sl("b", "Laser power (×saturation)", 0.1, 3, 0.05, 1) + `<div class="readout" id="ro"></div>`;
  let tr = null, tnow = 0;
  const calc = () => { tr = trace([1 / 3, 1 / 3, 1 / 3, 0, 0, 0, 0], +$("b").value, 4, 400); };
  const u = () => {
    $("bv").textContent = fmt(+$("b").value, 2);
    const F = JC.frame(70, 30, 330, 250, { xmin: 0, xmax: 4, ymin: 0, ymax: 1, xt: [0, 1, 2, 3, 4], yt: [0, 0.25, 0.5, 0.75, 1], xl: "time (µs)", yl: "fraction of ground state", grid: true });
    let s = F.s; const g = tr.p.map(p => p[0] + p[1] + p[2] || 1);
    s += JC.path(F, tr.t, tr.p.map((p, i) => p[0] / g[i]), C.blue, 2.5) + JC.path(F, tr.t, tr.p.map((p, i) => (p[1] + p[2]) / g[i]), C.coral, 2.5);
    s += tx(F.X(3.9), F.Y(0.86) - 8, "m_s = 0", "end", "th", `fill="${C.blue}"`) + tx(F.X(3.9), F.Y(0.12) - 8, "m_s = ±1 (sum)", "end", "th", `fill="${C.coral}"`);
    const i = Math.min(tr.t.length - 1, Math.round(tnow / 4 * (tr.t.length - 1))), p = tr.p[i];
    s += ln(F.X(tr.t[i]), 30, F.X(tr.t[i]), 280, "var(--p)", 1, "4 3");
    const labs = [["G0", 0, C.blue], ["G+", 1, C.coral], ["G−", 2, C.coral], ["E", 3, C.red], ["S", 6, C.purple]];
    s += tx(545, 30, `populations at ${fmt(tr.t[i] * 1000, 0)} ns`, "middle", "th");
    labs.forEach(([l, k, col], j) => { const v = k === 3 ? p[3] + p[4] + p[5] : p[k], x = 450 + j * 40, h = v * 220; s += rc(x, 260 - h, 28, h, col, "none", 'fill-opacity="0.8"') + tx(x + 14, 276, l, "middle") + tx(x + 14, 254 - h, fmt(v, 2), "middle"); });
    s += ln(445, 260, 655, 260, "var(--p)");
    fig.innerHTML = svg(320, s);
    const pe = tr.p[tr.p.length - 1], ge = pe[0] + pe[1] + pe[2];
    $("ro").innerHTML = `<div><span>start (thermal)</span><b>33 % in 0</b></div><div><span>after 4 µs</span><b>${fmt(100 * pe[0] / ge, 1)} % in 0</b></div>`;
  };
  $("b").oninput = () => { calc(); u(); }; calc();
  JC.player(ctl, t => { tnow = Math.min(4, t * 0.8); u(); }, "Play pumping");
}},

{ s: "5. ODMR", t: "ODMR: find the spin resonance by watching the light dim",
intu: String.raw`Combine light and microwaves. Keep the laser on (so the spin is pumped into 0 and the center glows brightly) and sweep a microwave frequency. Nothing happens until the microwave hits a spin resonance. Then it moves population from 0 into \(+1\) or \(-1\), those leak into the dark shelf, and the glow dims. Plotting brightness against microwave frequency gives dips: <b>optically detected magnetic resonance</b>. At zero field there is one dip at \(D\) = 2.87 GHz. A field along the NV axis splits it into two dips at \(D \pm \gamma B\). This is criterion D3 in action: the luminescence intensity differs by spin sublevel. It is also how NV became a nanoscale magnetometer. The curve is computed from the rate model with a microwave mixing term added.`,
eq: String.raw`\[ f_{\pm} = D \pm \gamma B_\parallel, \qquad W_\pm(f) = \frac{W_0}{1 + \left[(f - f_\pm)/\delta f\right]^2} \]\[ I(f) \propto k_r \left(p_{E0} + p_{E+} + p_{E-}\right)_{\text{steady state}} \]`,
sym: [[String.raw`\(f_\pm\)`, "the two ground state resonances"], [String.raw`\(B_\parallel\)`, "field component along the NV axis"], [String.raw`\(W_\pm\)`, "microwave induced mixing rate between 0 and ±1"], [String.raw`\(\delta f\)`, "linewidth of the resonance"], [String.raw`\(I(f)\)`, "fluorescence intensity as a function of microwave frequency"]],
how: [String.raw`A resonant microwave drives transitions \(0 \leftrightarrow \pm1\). With the laser on, these act as an extra rate \(W\) that mixes the two populations.`, String.raw`Add \(W\) to the rate matrix and solve for the steady state.`, String.raw`On resonance, population is pushed out of the bright \(m_s = 0\) and into the \(\pm1\) states that are shelved more often, so the steady-state fluorescence drops.`, String.raw`Off resonance \(W = 0\), and the brightness is the pumped value.`],
say: String.raw`ODMR detects the NV ground state spin resonances at D ± γB as dips in fluorescence, because microwave-driven population in \(m_s = \pm1\) is shelved into the dark singlets.`,
num: String.raw`At B = 5 mT the dips are at 2.87 ± 0.140 GHz = 2.730 and 3.010 GHz. With a mixing rate of 5 per µs on resonance the model gives a dip of about 17 %. A 1 µT change moves a dip by 28 kHz, the basis of NV magnetometry.`,
r(fig, ctl) {
  ctl.innerHTML = sl("B", "Field along axis (mT)", 0, 10, 0.1, 3) + sl("W", "Microwave power (mixing rate /µs)", 0.2, 20, 0.2, 5) + `<div class="readout" id="ro"></div>`;
  const u = () => {
    const B = +$("B").value, W0 = +$("W").value; $("Bv").textContent = fmt(B, 1) + " mT"; $("Wv").textContent = fmt(W0, 1);
    const fp = JC.D_NV + JC.gamma * B / 1000, fm = JC.D_NV - JC.gamma * B / 1000, df = 0.006;
    const s0 = steady(M(1, 0, 0)), I0 = s0[3] + s0[4] + s0[5];
    const fs = range(2.55, 3.19, 321), I = fs.map(f => { const L = x => W0 / (1 + ((f - x) / df) ** 2), st = steady(M(1, L(fp), L(fm))); return (st[3] + st[4] + st[5]) / I0; });
    const F = JC.frame(70, 30, 560, 230, { xmin: 2.55, xmax: 3.19, ymin: 0.75, ymax: 1.02, xt: [2.6, 2.7, 2.8, 2.9, 3.0, 3.1], yt: [0.8, 0.9, 1.0], xl: "microwave frequency (GHz)", yl: "normalized fluorescence", grid: true });
    let s = F.s + JC.path(F, fs, I, C.red, 2.5);
    [fm, fp].forEach(f => s += ln(F.X(f), 30, F.X(f), 260, C.purple, 1, "4 3") + tx(F.X(f), 24, fmt(f, 3), "middle"));
    if (B < 0.3) s += tx(F.X(2.87), F.Y(0.77), "D = 2.87 GHz", "middle", "th");
    fig.innerHTML = svg(300, s);
    $("ro").innerHTML = `<div><span>f₋ / f₊</span><b>${fmt(fm, 3)} / ${fmt(fp, 3)} GHz</b></div><div><span>dip depth</span><b>${fmt(100 * (1 - Math.min(...I)), 1)} %</b></div><div><span>splitting</span><b>${fmt(2 * JC.gamma * B, 0)} MHz</b></div>`;
  };
  $("B").oninput = u; $("W").oninput = u; u();
}},

{ s: "6. A full experiment", t: "Initialize, rotate, read: a pulsed Rabi experiment",
intu: String.raw`Now put the three steps together in time, exactly as the paper describes the NV qubit. <b>Laser</b> for a few microseconds to pump into \(m_s = 0\). <b>Microwave</b> pulse of length \(\tau\) at the \(0 \leftrightarrow -1\) resonance to rotate the spin (lesson 1, card 3). <b>Laser</b> again, counting photons only in the first 300 ns to read the spin. Repeat for many \(\tau\). The photon count oscillates with \(\tau\): bright when the pulse returned the spin to 0, dark at the π pulse when the spin is in \(-1\). This is a <b>Rabi oscillation seen in the fluorescence</b>, the signature of a working optically addressable qubit at room temperature. The contrast here comes from the readout card, and the 88 % starting polarization slightly reduces it.`,
eq: String.raw`\[ p_0(\tau) = P_0^{\infty}\cos^2\!\frac{\Omega\tau}{2} + \frac{1 - P_0^{\infty}}{2}\sin^2\!\frac{\Omega\tau}{2} \]\[ N(\tau) = p_0(\tau)\,N_0 + \left[1 - p_0(\tau)\right] N_{\pm1} \]`,
sym: [[String.raw`\(N(\tau)\)`, "photons counted in the readout window after a microwave pulse of length τ"], [String.raw`\(N_0, N_{\pm1}\)`, "photons for a pure 0 and a pure ±1 start (card 3)"], [String.raw`\(P_0^\infty\)`, "polarization after the initialization pulse (card 4)"], [String.raw`\(\Omega\)`, "Rabi angular frequency of the microwave drive"]],
how: [String.raw`After initialization the spin is in 0 with probability \(P_0^\infty\). The rest sits in \(+1\) and \(-1\).`, String.raw`The microwave only couples 0 and \(-1\). It rotates the 0 part into \(-1\) with probability \(\sin^2(\Omega\tau/2)\), and the \(-1\) part back.`, String.raw`The \(+1\) part is a spectator and only adds a constant dark background.`, String.raw`The readout turns the population into photons through \(N_0\) and \(N_{\pm1}\). The result is a cosine in \(\tau\) whose depth is the contrast times the polarization.`],
say: String.raw`A pulsed NV experiment initializes with a laser pulse, rotates the spin with a timed microwave pulse and reads it out from the fluorescence in the first few hundred nanoseconds of the next laser pulse.`,
num: String.raw`With \(f_R\) = 10 MHz the π pulse is 50 ns, so the fluorescence minimum sits at τ = 50 ns, the next maximum at 100 ns. Readout from card 3 (model): \(N_0 \approx 5.4\), \(N_{\pm1} \approx 2.4\) photons emitted per 300 ns, times the collection efficiency in an experiment.`,
r(fig, ctl) {
  ctl.innerHTML = sl("fr", "Rabi frequency (MHz)", 2, 40, 1, 10) + `<div class="readout" id="ro"></div>`;
  const n0 = counts([1, 0, 0, 0, 0, 0, 0], 1, 0.3), n1 = counts([0, 1, 0, 0, 0, 0, 0], 1, 0.3), st = steady(M(1, 0, 0)), P0 = st[0] / (st[0] + st[1] + st[2]);
  const u = () => {
    const fr = +$("fr").value; $("frv").textContent = fr + " MHz";
    // pulse sequence
    let s = tx(20, 26, "laser", "start", "th", `fill="${C.green}"`) + tx(20, 66, "microwave", "start", "th", `fill="${C.purple}"`) + tx(20, 106, "counting", "start", "th");
    s += rc(110, 12, 160, 22, C.green, "none", 'fill-opacity="0.7"') + tx(190, 27, "initialize 3 µs", "middle", "ts", 'fill="#fff"');
    s += rc(290, 52, 70, 22, C.purple, "none", 'fill-opacity="0.75"') + tx(325, 67, "τ", "middle", "th", 'fill="#fff"');
    s += rc(380, 12, 260, 22, C.green, "none", 'fill-opacity="0.7"') + tx(510, 27, "readout and re-initialize", "middle", "ts", 'fill="#fff"');
    s += rc(380, 92, 40, 22, C.gold, "none", 'fill-opacity="0.8"') + tx(426, 107, "300 ns window", "start");
    [34, 74, 114].forEach(y => s += ln(100, y, 650, y, "var(--b)"));
    const F = JC.frame(70, 150, 560, 160, { xmin: 0, xmax: 300, ymin: n1 * 0.9, ymax: n0 * 1.05, xt: [0, 50, 100, 150, 200, 250, 300], yt: [Math.round(n1 * 10) / 10, Math.round(n0 * 10) / 10], xl: "microwave pulse length τ (ns)", yl: "photons per shot", grid: true });
    const ts = range(0, 300, 301), N = ts.map(t => { const P = Math.sin(Math.PI * fr * t / 1000) ** 2; const pm1 = P0 * P + (1 - P0) / 2 * (1 - P); const p0 = P0 * (1 - P) + (1 - P0) / 2 * P; return p0 * n0 + (1 - p0) * n1; });
    s += F.s + JC.path(F, ts, N, C.red, 2.5);
    ts.filter((t, i) => i % 10 === 0).forEach(t => { const y = N[t] + (Math.sin(t * 12.9898) * 43758.5453 % 1) * 0.06; s += ci(F.X(t), F.Y(y), 3, C.red); });
    const tp = 1000 / (2 * fr); s += ln(F.X(tp), 150, F.X(tp), 310, C.purple, 1.5, "4 3") + tx(F.X(tp) + 4, 166, "π pulse", "start");
    fig.innerHTML = svg(350, s);
    $("ro").innerHTML = `<div><span>π pulse</span><b>${fmt(tp, 1)} ns</b></div><div><span>initial polarization</span><b>${fmt(100 * P0, 0)} %</b></div><div><span>fringe contrast</span><b>${fmt(100 * (Math.max(...N) - Math.min(...N)) / Math.max(...N), 0)} %</b></div>`;
  };
  $("fr").oninput = u; u();
}}
],
summary: String.raw`NV⁻ has six electrons. Its ground configuration a₁²e² gives a spin triplet ³A₂ (lowest by Hund's rule) and two singlets, and the excited configuration a₁e³ gives the ³E triplet 1.945 eV higher. Light drives spin-conserving transitions between the triplets, and a spin-selective intersystem crossing from ³E(±1) to the singlets, which decay mostly to \(m_s = 0\), does the rest. Under green light the spin is pumped into \(m_s = 0\) (about 88 % in the model), and in the first few hundred ns of a laser pulse an \(m_s = \pm1\) spin emits fewer photons, giving optical readout. ODMR shows the ground state resonances at D ± γB, and a pulsed sequence of laser, microwave and laser reveals Rabi oscillations in the fluorescence, all at room temperature.`,
sheet: [
[String.raw`\[ ^3A_2 \leftrightarrow {^3E}:\ 1.945\ \text{eV}\ (637\ \text{nm}),\ \Delta m_s = 0 \]`, "Spin-conserving optical transition"],
[String.raw`\[ k^{\text{ISC}}_{\pm1} \approx 7\,k^{\text{ISC}}_0 \]`, "Spin-selective intersystem crossing"],
[String.raw`\[ a_1^2e^2 \to {^3A_2}\oplus{^1E}\oplus{^1A_1}, \quad a_1e^3 \to {^3E}\oplus{^1E} \]`, "Configurations to multiplets"],
[String.raw`\[ d\mathbf{p}/dt = \mathbf{M}\mathbf{p}, \quad \mathbf{M}\mathbf{p}_\infty = 0 \]`, "Rate model and steady state"],
[String.raw`\[ \mathcal{C} = 1 - N_{\pm1}/N_0 \]`, "Readout contrast"],
[String.raw`\[ f_\pm = D \pm \gamma B_\parallel \]`, "ODMR resonances"]],
consts: String.raw`Model rates (per µs): \(k_r = 65\), \(k_0^{\text{ISC}} = 11\), \(k_{\pm1}^{\text{ISC}} = 80\), singlet to 0: 2.6, to each ±1: 0.7. \(D = 2.87\) GHz, \(\gamma = 28.0\) GHz/T.`,
sources: ["Weber et al., PNAS 107, 8513 (2010), Fig. 1 and criteria D1 to D3", "Manson, Harrison and Sellars, Phys. Rev. B 74, 104303 (2006), NV electronic structure and dynamics (paper ref. 8)", "Tetienne et al., New J. Phys. 14, 103033 (2012), NV rate parameters (model rates rounded from this kind of fit)", "Doherty et al., Phys. Rep. 528, 1 (2013), review of the NV center, singlet ordering"]
});
})();

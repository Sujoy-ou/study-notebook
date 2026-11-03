(function () {
/* Journal Club, Weber et al. 2010. Lesson 7: beyond diamond. SiC polytypes and sites, a scorecard of the SiC
   candidates, the Fig. 5 design rules, electron counting for complexes in any host, what came after 2010,
   and questions for the discussion. */
const { tx, rc, ln, ci, fmt, sci, C } = JC;
const wrap = (x, y, text, n, cls, anchor, dy) => { const w = text.split(" "); let line = "", out = "", yy = y; w.forEach(t => { if ((line + " " + t).trim().length > n) { out += tx(x, yy, line.trim(), anchor || "start", cls || "t"); yy += dy || 18; line = t; } else line += " " + t; }); return out + tx(x, yy, line.trim(), anchor || "start", cls || "t"); };

addLesson("jc", "weber", {
level: "Pro",
id: "jc-weber-l7", title: "Beyond diamond: SiC, design rules and the discussion", short: "7. Beyond diamond",
labels: { note: "Journal club note" },
big: String.raw`The second half of the paper applies everything to new hosts. It starts with 4H-SiC, which has large single crystals, a 3.27 eV gap and an industry behind it, and scores four candidates against the criteria. It then turns the vacancy picture into general <b>design rules</b> (Fig. 5): what happens for cation and anion vacancies, how the host's dangling bond energies and splittings decide whether the levels fit in the gap, and which impurity to put next to the vacancy. This lesson ends with what happened next (the same group demonstrated room temperature spin qubits in SiC a year later, and the predicted \(\mathrm{N_C V_{Si}}\) center was later observed) and with a set of questions to drive the journal club discussion.`,
cards: [
{ s: "1. SiC polytypes", t: "4H-SiC: stacking, polytypes and inequivalent sites",
intu: String.raw`SiC is made of Si-C bilayers stacked on top of each other. Each bilayer can sit in one of three positions, A, B or C, and the stacking order defines the <b>polytype</b>. 3C (ABC) is cubic like diamond. 4H repeats every four layers (ABCB), 6H every six (ABCACB). A layer whose two neighbors sit in the same position looks locally hexagonal (<b>h</b> site), otherwise locally cubic (<b>k</b> site). So in 4H every defect can sit on two inequivalent sites, which is why NV-like centers in SiC show up as several closely spaced lines. The paper picks 4H because large crystals are available and its gap (3.27 eV) is the largest of the three, reports results for the hexagonal site, and notes that the two sites differ by less than 0.1 eV.`,
eq: String.raw`\[ \text{3C: } (ABC)_\infty, \quad \text{4H: } (ABCB)_\infty, \quad \text{6H: } (ABCACB)_\infty \]\[ \text{site}_i = \begin{cases} h & \text{layers } i-1 \text{ and } i+1 \text{ in the same position} \\ k & \text{otherwise} \end{cases} \]`,
sym: [[String.raw`\(A, B, C\)`, "the three lateral positions a close-packed bilayer can take"], [String.raw`\(h, k\)`, "hexagonal and cubic (quasi-cubic) lattice sites"], ["nH, 3C", "number of layers in the repeat unit, H hexagonal and C cubic"]],
how: [String.raw`Every Si is bonded to four C and every C to four Si, in all polytypes. Only the stacking of the bilayers differs.`, String.raw`Local environment out to second neighbors is identical. The difference appears at the third neighbor, which is either mirrored (h) or rotated (k).`, String.raw`Different stacking changes the band gap: 2.39 (3C), 3.02 (6H), 3.27 eV (4H).`, String.raw`A vacancy pair or an \(\mathrm{N_C V_{Si}}\) complex can also point along the c axis (axial) or along a basal bond. The paper chose the N site on one of the three shorter Si-C bonds.`],
say: String.raw`4H-SiC has an ABCB stacking with one hexagonal and one cubic site per sublattice, giving inequivalent defect configurations whose energies differ by less than 0.1 eV in the paper's calculations.`,
num: String.raw`Gaps quoted in the paper: 3C 2.39, 6H 3.02, 4H 3.27 eV (HSE06 gives 3.17 eV for 4H). Hexagonality: 3C 0 %, 6H 33 %, 4H 50 %, 2H 100 %. Inequivalent sites per sublattice: 3C one, 4H two, 6H three.`,
r(fig, ctl) {
  const P = { "3C": ["ABC", 2.39], "4H": ["ABCB", 3.27], "6H": ["ABCACB", 3.02] };
  let p = "4H";
  ctl.innerHTML = `<div class="row">${Object.keys(P).map(k => `<button data-p="${k}">${k}-SiC</button>`).join("")}</div><div class="readout" id="ro"></div>`;
  const u = () => {
    pick(ctl, "p", p);
    const seq = P[p][0], n = 12, pos = { A: 0, B: 1, C: 2 }, dx = 46, dy = 24, x0 = 120, y0 = 315;
    let s = tx(200, 22, `stacking along c: ${seq} repeated`, "middle", "th");
    const L = Array.from({ length: n }, (_, i) => seq[i % seq.length]);
    let prev = null, nh = 0;
    L.forEach((c, i) => {
      const x = x0 + pos[c] * dx, ySi = y0 - i * dy, yC = ySi - 8;
      const lo = L[(i - 1 + n) % n], hi = L[(i + 1) % n], site = i > 0 && i < n - 1 ? (lo === hi ? "h" : "k") : (seq[(i - 1 + seq.length * 4) % seq.length] === seq[(i + 1) % seq.length] ? "h" : "k");
      if (i < seq.length && site === "h") nh++;
      if (prev) s += ln(prev[0], prev[1], x, ySi, "var(--b)", 3);
      s += ln(x, ySi, x, yC, "var(--b)", 3) + ci(x, ySi, 9, C.amber, "var(--p)") + ci(x, yC, 5.5, "var(--gray-bg)", "var(--p)");
      s += tx(x0 - 30, ySi + 4, c, "middle", "th") + tx(x0 + 3 * dx + 10, ySi + 4, site, "start", "th", `fill="${site === "h" ? C.coral : C.blue}"`);
      if (i % seq.length === 0 && i) s += ln(x0 - 50, ySi + dy / 2, x0 + 3 * dx + 30, ySi + dy / 2, "var(--b)", 1, "3 3");
      prev = [x, yC];
    });
    s += tx(x0 - 30, y0 + 24, "layer", "middle") + tx(x0 + 3 * dx + 14, y0 + 24, "site", "middle");
    s += ci(470, 60, 9, C.amber, "var(--p)") + tx(486, 64, "Si", "start") + ci(470, 86, 5.5, "var(--gray-bg)", "var(--p)") + tx(486, 90, "C", "start");
    // gap bars
    s += tx(560, 130, "band gap (eV)", "middle", "th");
    Object.keys(P).forEach((k, i) => { const g = P[k][1], y = 150 + i * 44; s += rc(470, y, g * 40, 26, k === p ? C.teal : C.gray, "none", 'fill-opacity="0.75"') + tx(476 + g * 40, y + 18, `${k} ${g}`, "start", k === p ? "th" : "t"); });
    s += tx(560, 300, `${p}: ${nh} h and ${seq.length - nh} k layers per period`, "middle", "th");
    fig.innerHTML = svg(345, s);
    $("ro").innerHTML = `<div><span>hexagonality</span><b>${fmt(100 * nh / seq.length, 0)} %</b></div><div><span>inequivalent sites</span><b>${p === "3C" ? 1 : p === "4H" ? 2 : 3}</b></div><div><span>gap</span><b>${P[p][1]} eV</b></div>`;
  };
  ctl.querySelectorAll("button[data-p]").forEach(b => b.onclick = () => { p = b.dataset.p; u(); }); u();
}},

{ s: "2. SiC scorecard", t: "Four SiC candidates scored against the criteria",
intu: String.raw`Here are the paper's SiC results side by side with NV, scored with the numbers from Fig. 2, Fig. 4 and Table 1. Click a row for details. \(\mathrm{N_C V_{Si}^-}\) is the direct analog: six electrons, spin 1, the same minority \(a_1(2) \to e\) excitation (absorption 1.15 eV), and a stability window in the middle of the gap. \(\mathrm{V_{Si}^{2-}}\) and \(\mathrm{V_{Si}^0}\) are also triplets, because the hexagonal crystal already splits \(t_2\) without any impurity. The paper flags \(\mathrm{V_{Si}^0}\) for its occupied \(a_1(2)\) only 0.14 eV above the valence band (a D4 concern). \(\mathrm{V_{Si}^-}\) is a spin 3/2 quartet, so it cannot have NV-style spin-conserving triplet excitations. The D4 column also applies the threshold rule of lesson 4 to each stability window, which the paper does not do explicitly.`,
eq: String.raw`\[ E_{\text{ion}}^{\text{CB}} = E_g - \varepsilon_{\text{lower}}, \qquad E_{\text{cap}}^{\text{VB}} = \varepsilon_{\text{upper}}, \qquad \text{D4 margin} = \min(E_{\text{ion}}, E_{\text{cap}}) - E_{\text{abs}} \]`,
sym: [[String.raw`\(\varepsilon_{\text{lower}}, \varepsilon_{\text{upper}}\)`, "edges of the stability window of the charge state (Fig. 2)"], [String.raw`\(E_g\)`, "calculated gap, 5.36 eV (diamond) and 3.17 eV (4H-SiC)"], [String.raw`\(E_{\text{abs}}\)`, "absorption energy from constrained DFT, where available"]],
how: [String.raw`D1: count spins from Table 1. Six electrons with four up and two down give a triplet.`, String.raw`D2 and D3 (partly): look for an empty level of the same spin inside the gap to excite into.`, String.raw`D4: from the stability window, compute how much energy ionizes the defect and compare with the excitation.`, String.raw`The non-radiative spin-selective path cannot be scored. That remains for experiment.`],
say: String.raw`Among the 4H-SiC defects studied, \(\mathrm{N_C V_{Si}^-}\) reproduces the NV electronic structure with smaller transition energies, \(\mathrm{V_{Si}^{2-}}\) and \(\mathrm{V_{Si}^0}\) are triplets because the crystal field splits t₂, and \(\mathrm{V_{Si}^-}\) is a quartet.`,
num: String.raw`\(\mathrm{N_C V_{Si}^-}\): window 1.60 to 2.83 eV, thresholds 1.57 and 2.83 eV, absorption 1.15 eV, margin 0.42 eV. \(\mathrm{V_{Si}^{2-}}\): stable only within about 0.3 eV of the CBM, so an electron can be lost to the conduction band with about 0.3 eV, far below any internal excitation (single-particle gap 1.0 eV).`,
r(fig, ctl) {
  const R = [
    ["NV⁻ (diamond)", 2, 2, 2, 2, "S = 1. Window 2.78 to 5.14 eV in a 5.36 eV gap. Absorption 2.27 eV, ionization threshold 2.58 eV. The reference."],
    ["N_C V_Si⁻", 2, 2, 2, 2, "S = 1, same level ordering as NV. Window 1.60 to 2.83 eV. Absorption 1.15 eV vs threshold 1.57 eV. Energies about half of NV, relaxation 75 % smaller."],
    ["V_Si²⁻", 2, 1, 2, 0, "S = 1, t₂ split by the hexagonal crystal field. Stable only for ε_F within about 0.3 eV of the CBM, so by the D4 rule an absorbed photon can easily free the extra electron. Our check, not stated in the paper."],
    ["V_Si⁰", 2, 2, 2, 1, "S = 1 with four electrons, majority e(x) to e(y) excitation. The occupied majority a₁(2) is only 0.14 eV above the VBM: the paper's D4 concern."],
    ["V_Si⁻", 0, 2, 0, 1, "S = 3/2, a quartet (Table 1: four majority, one minority). No spin-conserving triplet excitation, so not NV-like in the paper's sense."]];
  const H = ["D1 triplet", "window", "excitation", "D4 margin"];
  let k = 1;
  const u = () => {
    const col = [C.red, C.amber, C.green], sym = ["✕", "~", "✓"];
    let s = tx(20, 26, "defect", "start", "th");
    H.forEach((h, j) => s += tx(250 + j * 110, 26, h, "middle", "th"));
    R.forEach((r, i) => { const y = 38 + i * 36, on = i === k;
      s += `<g data-r="${i}" style="cursor:pointer">` + rc(12, y, 656, 30, on ? "var(--accent-bg)" : "var(--panel)", on ? "var(--accent)" : "var(--b)", 'rx="5"') + tx(22, y + 20, r[0], "start", on ? "th" : "t");
      for (let j = 0; j < 4; j++) s += ci(250 + j * 110, y + 15, 10, col[r[j + 1]]) + tx(250 + j * 110, y + 20, sym[r[j + 1]], "middle", "th", 'fill="#fff"');
      s += `</g>`; });
    s += rc(12, 228, 656, 92, "var(--sunk)", "none", 'rx="8"') + wrap(26, 252, R[k][5], 92, "t");
    fig.innerHTML = svg(330, s);
    fig.querySelectorAll("g[data-r]").forEach(g => g.onclick = () => { k = +g.dataset.r; u(); });
  };
  u();
}},

{ s: "3. Design rules (Fig. 5)", t: "Fig. 5 as a tool: will the levels fit in the gap?",
intu: String.raw`Fig. 5 generalizes the vacancy picture to any tetrahedral compound. In a <b>cation vacancy</b> the dangling bonds belong to anions, whose orbitals lie near the valence band, so the levels land in the lower half of the gap. In an <b>anion vacancy</b> they belong to cations, near the conduction band, and the \(t_2\) levels risk being pushed into the conduction band. Two splittings then decide everything: \(\Delta\) between \(a_1\) and \(t_2\) (set by the host) and \(\delta\), the further split of \(t_2\) into \(a_1(2)\) and \(e\) (set by an impurity, Jahn-Teller distortion or crystal field). \(\delta\) must be big enough for D5 but not so big that \(a_1(2)\) falls into the valence band (D4). Try the paper's three examples, then tune your own. The level positions are illustrative, chosen to show the paper's reasoning.`,
eq: String.raw`\[ E_{a_1} = E_{\text{DB}} - \tfrac34\Delta, \quad E_{t_2} = E_{\text{DB}} + \tfrac14\Delta, \quad E_{a_1(2)} = E_{t_2} - \tfrac23\delta, \quad E_{e} = E_{t_2} + \tfrac13\delta \]`,
sym: [[String.raw`\(E_{\text{DB}}\)`, "average dangling bond energy, near the VBM for anion DBs and near the CBM for cation DBs"], [String.raw`\(\Delta\)`, "a₁ to t₂ splitting of the ideal vacancy (\\(\\Delta_{\\text{CV}}\\) or \\(\\Delta_{\\text{AV}}\\))"], [String.raw`\(\delta\)`, "splitting of t₂ in the complex (\\(\\delta_{\\text{CV}}\\) or \\(\\delta_{\\text{AV}}\\))"]],
how: [String.raw`From lesson 5, four DBs give \(a_1\) and \(t_2\) with the center of gravity at \(E_{\text{DB}}\): one level down by \(\tfrac34\Delta\), three up by \(\tfrac14\Delta\).`, String.raw`A lower symmetry splits \(t_2\) into one \(a_1(2)\) and a pair \(e\), again keeping the center of gravity.`, String.raw`D4 wants the occupied \(a_1(2)\) well above the VBM and the empty \(e\) well below the CBM.`, String.raw`D5 wants \(\delta\) large compared with \(k_BT\). An impurity whose orbital lies well below the host DB gives a large \(\delta\) (lesson 5, card 3).`],
say: String.raw`Weber et al. use the positions of the host's dangling bond orbitals and the vacancy splittings Δ and δ to judge whether a vacancy complex in a given host can keep its a₁(2) and e levels inside the gap with sufficient separation.`,
num: String.raw`Paper examples: ZnO \(\mathrm{V_O}\) puts only \(a_1(1)\) in the gap (fails). AlN \(\mathrm{V_N}\) has its \(t_2\) levels within the 6.0 eV gap (works). ZnSe \(\mathrm{V_{Zn}}\) plus a donor, the self-activation center, gives a six-electron triplet in its + charge state (open question for D1 to D5).`,
r(fig, ctl) {
  const PR = [["ZnO V_O (anion vac.)", 3.4, 3.3, 1.6, 0.4], ["AlN V_N (anion vac.)", 6.0, 4.6, 2.2, 0.8], ["ZnSe V_Zn + donor (cation vac.)", 2.7, 0.45, 0.6, 0.6], ["diamond NV", 5.36, 1.6, 4.1, 1.0]];
  let p = 1;
  ctl.innerHTML = `<div class="row">${PR.map((x, i) => `<button data-p="${i}">${x[0]}</button>`).join("")}</div>` + sl("g", "Band gap (eV)", 1.5, 7, 0.01, 6) + sl("e", "DB energy E_DB (eV)", -1, 7, 0.01, 4.6) + sl("D", "Splitting Δ (eV)", 0, 5, 0.01, 2.2) + sl("d", "Splitting δ (eV)", 0, 2.5, 0.01, 0.8) + `<div class="readout" id="ro"></div>`;
  const u = () => {
    pick(ctl, "p", p);
    const g = +$("g").value, E = +$("e").value, D = +$("D").value, d = +$("d").value;
    ["g", "e", "D", "d"].forEach(id => $(id + "v").textContent = fmt(+$(id).value, 2) + " eV");
    const a1 = E - 0.75 * D, t2 = E + 0.25 * D, a2 = t2 - 2 / 3 * d, ee = t2 + d / 3;
    const B = JC.bands(70, 20, 380, 300, g, -1.5, 7.5);
    let s = B.s;
    const L = (x, y, col, lab, w) => ln(x, B.Y(y), x + (w || 70), B.Y(y), col, 3) + tx(x + (w || 70) + 6, B.Y(y) + 4, lab, "start");
    s += tx(105, 16, "DBs", "middle", "th") + tx(235, 16, "vacancy", "middle", "th") + tx(365, 16, "complex", "middle", "th");
    s += L(80, E, "var(--p)", "") + L(210, a1, C.blue, "a₁") + L(210, t2, C.coral, "t₂") + L(340, a1, C.blue, "a₁(1)", 50) + L(340, a2, C.purple, "a₁(2)", 50) + L(340, ee, C.coral, "e", 50);
    s += ln(150, B.Y(E), 210, B.Y(a1), "var(--b)", 1, "3 3") + ln(150, B.Y(E), 210, B.Y(t2), "var(--b)", 1, "3 3") + ln(280, B.Y(t2), 340, B.Y(a2), "var(--b)", 1, "3 3") + ln(280, B.Y(t2), 340, B.Y(ee), "var(--b)", 1, "3 3");
    const m = 0.3, c1 = a2 > m && a2 < g - m, c2 = ee < g - m && ee > 0, c3 = d > 0.3, c4 = ee - a2 > 0;
    const checks = [["a₁(2) inside the gap", c1], ["e inside the gap", c2], ["δ ≫ k_BT (D5)", c3]];
    s += tx(560, 40, "checks", "middle", "th");
    checks.forEach(([l, ok], i) => s += ci(490, 70 + i * 34, 10, ok ? C.green : C.red) + tx(490, 75 + i * 34, ok ? "✓" : "✕", "middle", "th", 'fill="#fff"') + tx(508, 75 + i * 34, l, "start"));
    const all = c1 && c2 && c3;
    s += tx(560, 190, all ? "levels fit: worth a full calculation" : "fails the level test", "middle", "th", `fill="${all ? C.green : C.red}"`);
    s += wrap(475, 230, p === 0 ? "ZnO: cation DBs sit high and Δ pushes t₂ above the CBM. Only a₁ stays in the gap." : p === 1 ? "AlN: wide gap, cation DBs well below the CBM, small Δ: t₂ stays inside." : p === 2 ? "ZnSe: anion DBs near the VBM. A donor next to the Zn vacancy splits t₂, in the lower half of the gap." : p === 3 ? "Diamond: the NV numbers from lesson 5 for comparison." : "your own host", 30, "ts");
    fig.innerHTML = svg(330, s);
    $("ro").innerHTML = `<div><span>a₁(2)</span><b>${fmt(a2, 2)} eV</b></div><div><span>e</span><b>${fmt(ee, 2)} eV</b></div><div><span>gap</span><b>${fmt(g, 2)} eV</b></div>`;
  };
  const set = i => { p = i; ["g", "e", "D", "d"].forEach((id, j) => $(id).value = PR[i][j + 1]); u(); };
  ctl.querySelectorAll("button[data-p]").forEach(b => b.onclick = () => set(+b.dataset.p));
  ["g", "e", "D", "d"].forEach(id => $(id).oninput = () => { p = 4; u(); }); set(1);
}},

{ s: "4. Pick the impurity", t: "Electron counting: which impurity, which charge state?",
intu: String.raw`The last design question is which atom to put next to the vacancy, and in which charge state the complex must be to hold six electrons like NV⁻. Two arguments from the paper. First, the impurity must be <b>attracted</b> to the vacancy. Cation vacancies tend to be negative, so a positive <b>donor</b> sits happily next to them (an element to the right of the host anion in the periodic table). Second, <b>electron counting</b> must reach six. Each neighbor of the vacancy keeps its share of the broken bond, and a donor adds one extra electron. Pick a host, a neighbor impurity and a charge state, and watch the count. ZnSe with a chlorine donor reaches six in the + charge state, as the paper says. In AlN the nitrogen vacancy needs a donor and a negative charge, which is why the paper's naive guess of an acceptor fails.`,
eq: String.raw`\[ n_e = \sum_{i=1}^{4}\left[\left(2 - \frac{v_{\text{vac}}}{4}\right) + \left(v_i - v_i^{\text{host}}\right)\right] - q \]`,
sym: [[String.raw`\(v_{\text{vac}}\)`, "valence of the missing atom (its share of each bond is v/4)"], [String.raw`\(v_i\)`, "valence of the atom actually sitting on neighbor site i"], [String.raw`\(v_i^{\text{host}}\)`, "valence of the host atom normally on that site"], [String.raw`\(q\)`, "charge state of the complex"], [String.raw`\(n_e\)`, "electrons in the dangling bond orbitals, NV-like if 6"]],
how: [String.raw`Each bond holds 2 electrons. The missing atom contributed \(v_{\text{vac}}/4\) of them, so each neighbor's dangling bond keeps \(2 - v_{\text{vac}}/4\).`, String.raw`Diamond: \(2 - 1 = 1\) per carbon. ZnSe Zn vacancy: \(2 - 0.5 = 1.5\) per Se. AlN N vacancy: \(2 - 1.25 = 0.75\) per Al.`, String.raw`An impurity with one more valence electron than the host atom it replaces (a donor) adds 1.`, String.raw`Finally subtract \(q\): each negative charge adds an electron.`],
say: String.raw`Electron counting, where each vacancy neighbor keeps its share of the broken bond and a neighboring donor adds one electron, shows which impurity and charge state give the six electrons of an NV-like center.`,
num: String.raw`NV⁻: \(3 \times 1 + 2 + 1 = 6\). \(\mathrm{N_C V_{Si}^-}\): same. ZnSe \(\mathrm{(V_{Zn} Cl_{Se})^+}\): \(3 \times 1.5 + 2.5 - 1 = 6\). AlN \(\mathrm{V_N}\) with \(\mathrm{Si_{Al}}\): \(3 \times 0.75 + 1.75 = 4\), so it needs \(q = -2\) to reach 6.`,
r(fig, ctl) {
  const HOST = {
    diamond: { vac: "C", vv: 4, nb: "C", nv: 4, imps: [["none", 4], ["N (donor)", 5], ["B (acceptor)", 3]] },
    "4H-SiC": { vac: "Si", vv: 4, nb: "C", nv: 4, imps: [["none", 4], ["N (donor)", 5], ["B (acceptor)", 3]] },
    ZnSe: { vac: "Zn", vv: 2, nb: "Se", nv: 6, imps: [["none", 6], ["Cl (donor)", 7], ["N (acceptor)", 5]] },
    AlN: { vac: "N", vv: 5, nb: "Al", nv: 3, imps: [["none", 3], ["Si (donor)", 4], ["Mg (acceptor)", 2]] }
  };
  let h = "ZnSe", im = 1;
  ctl.innerHTML = `<div class="row">${Object.keys(HOST).map(k => `<button data-h="${k}">${k}</button>`).join("")}</div><div class="row" id="imr"></div>` + sl("q", "Charge state q", -3, 2, 1, 1) + `<div class="readout" id="ro"></div>`;
  const u = () => {
    pick(ctl, "h", h);
    const H = HOST[h], q = +$("q").value; $("qv").textContent = q > 0 ? "+" + q : q;
    $("imr").innerHTML = H.imps.map((x, i) => `<button data-i="${i}" class="${i === im ? "on" : ""}">${x[0]}</button>`).join("");
    $("imr").querySelectorAll("button").forEach(b => b.onclick = () => { im = +b.dataset.i; u(); });
    const share = 2 - H.vv / 4, imp = H.imps[im], extra = imp[1] - H.nv, ne = 4 * share + extra - q;
    const cx = 200, cy = 170, R = 105;
    let s = `<circle cx="${cx}" cy="${cy}" r="22" fill="none" stroke="var(--p)" stroke-dasharray="4 3"/>` + tx(cx, cy - 2, "V", "middle", "th") + tx(cx, cy + 13, H.vac, "middle");
    [[0, -1], [1, 0], [0, 1], [-1, 0]].forEach(([dx, dy], i) => {
      const x = cx + dx * R, y = cy + dy * R, isI = i === 1 && im > 0, e = share + (isI ? extra : 0);
      s += ln(x, y, cx + dx * 34, cy + dy * 34, C.coral, 10, null, 'stroke-opacity="0.35" stroke-linecap="round"');
      s += ci(x, y, 22, isI ? (extra > 0 ? C.blue : C.purple) : "var(--gray-bg)", "var(--p)") + tx(x, y + 5, isI ? imp[0].split(" ")[0] : H.nb, "middle", "th", isI ? 'fill="#fff"' : "");
      s += tx(x + (dx ? dx * 52 : 44), y + (dy ? dy * 34 : 4) + (dx ? -28 : 0), fmt(e, 2) + " e", "middle", "th", `fill="${C.blue}"`);
    });
    s += tx(cx, 330, `charge ${q > 0 ? "+" + q : q}: ${q > 0 ? "remove " + q : q < 0 ? "add " + (-q) : "no change"}`, "middle");
    // count bar
    s += tx(540, 40, "electrons in the defect", "middle", "th");
    for (let i = 0; i < 9; i++) { const x = 440 + i * 24, filled = i < Math.round(ne); s += rc(x, 60, 20, 30, filled ? C.blue : "var(--sunk)", i === 5 ? C.coral : "none", 'rx="3"' + (i === 5 ? ' stroke-width="2"' : "")); }
    s += tx(440 + 5 * 24 + 10, 106, "6", "middle", "th", `fill="${C.coral}"`);
    const ok = Math.abs(ne - 6) < 1e-6;
    s += tx(540, 140, `n_e = ${fmt(ne, 2)}`, "middle", "th", 'font-size="20"') + tx(540, 168, ok ? "six electrons: NV-like filling" : "not six", "middle", "th", `fill="${ok ? C.green : C.red}"`);
    const need = 4 * share + extra - 6;
    s += tx(540, 200, Number.isInteger(+need.toFixed(6)) ? `six needs q = ${need > 0 ? "+" : ""}${fmt(need, 0)}` : "fractional count: no integer q gives six", "middle");
    s += wrap(440, 236, extra > 0 ? "A donor next to the vacancy: attracted if the vacancy is negative, and it adds an electron." : extra < 0 ? "An acceptor removes an electron, so the complex needs a more negative charge." : "No impurity: a plain vacancy keeps high symmetry (lesson 5).", 36, "ts");
    fig.innerHTML = svg(345, s);
    $("ro").innerHTML = `<div><span>per neighbor (host)</span><b>${fmt(share, 2)} e</b></div><div><span>n_e</span><b>${fmt(ne, 2)}</b></div><div><span>q for six</span><b>${Number.isInteger(+need.toFixed(6)) ? (need > 0 ? "+" : "") + fmt(need, 0) : "none"}</b></div>`;
  };
  ctl.querySelectorAll("button[data-h]").forEach(b => b.onclick = () => { h = b.dataset.h; u(); });
  $("q").oninput = u; u();
}},

{ s: "5. What came next", t: "What happened after 2010",
intu: String.raw`A journal club should ask whether a paper's predictions held up. Click through the timeline. A year later the same group (Koehl, Buckley, Heremans, Calusine and Awschalom) showed room temperature coherent control of defect spins in 4H-SiC, addressed optically near telecom wavelengths. Interestingly these were mostly <b>divacancies</b> (\(\mathrm{V_{Si}V_C}\)), a vacancy complex of exactly the family the paper recommends, though not one of its four candidates. Spin coherence was then shown in all three polytypes, single silicon vacancies were controlled at room temperature, divacancies reached millisecond coherence, and NV centers in SiC, the \(\mathrm{N_C V_{Si}}\) predicted here, were identified in 3C, 4H and 6H. In 2022 the criteria H1 to H4 became the starting point of a screen of over 12,000 host materials, which pointed at oxides such as CeO₂.`,
eq: String.raw`\[ \text{criteria (2010)} \;\to\; \text{SiC divacancy qubits (2011)} \;\to\; \mathrm{N_C V_{Si}}\ \text{observed (2016)} \;\to\; 12{,}000\ \text{hosts screened (2022)} \]`,
sym: [[String.raw`\(\mathrm{V_{Si}V_C}\)`, "divacancy: neighboring Si and C vacancies, spin 1 in the neutral state"], [String.raw`\(\mathrm{V_{Si}}\)`, "silicon vacancy, the spin 3/2 center of Table 1"], [String.raw`\(\mathrm{N_C V_{Si}}\)`, "the NV analog in SiC predicted in this paper"]],
how: [String.raw`The paper argued that vacancy complexes in SiC should behave like NV. The divacancy is such a complex.`, String.raw`ODMR, Rabi oscillations and spin echo, the same toolbox as for NV (lesson 3), worked up to room temperature in SiC.`, String.raw`The predicted \(\mathrm{N_C V_{Si}}\) center was later found by magnetic resonance.`, String.raw`The host criteria turned into a quantitative coherence scaling law across thousands of materials.`],
say: String.raw`The paper's prediction that NV-like vacancy complexes exist in SiC was confirmed within a year by room temperature coherent control of divacancy spins in 4H-SiC, and its host criteria later seeded large-scale searches for new qubit hosts.`,
num: String.raw`Koehl et al., Nature 479, 84 (2011). Falk et al., Nat. Commun. 4, 1819 (2013). Widmann et al., Nat. Mater. 14, 164 (2015). Christle et al., Nat. Mater. 14, 160 (2015). von Bardeleben et al., Phys. Rev. B 94, 121202 (2016). Kanai et al., PNAS 119, e2121808119 (2022), predicted \(T_2\) up to 47 ms in CeO₂.`,
r(fig, ctl) {
  const E = [[2010, "This paper", "Criteria D1 to D5 and H1 to H4, DFT screening, NV analogs predicted in 4H-SiC (N_C V_Si⁻, V_Si)."],
    [2011, "SiC qubits at room temperature", "Koehl et al., Nature: coherent control of divacancy-type spins in 4H-SiC up to room temperature, optically addressed near the telecom range."],
    [2013, "All polytypes", "Falk et al., Nat. Commun.: 4H, 6H and 3C SiC all host coherent, optically addressable spins, some with room temperature coherence."],
    [2015, "Single spins, long T₂", "Widmann et al. (single V_Si at room temperature) and Christle et al. (divacancy spins with millisecond coherence), both Nat. Mater."],
    [2016, "N_C V_Si found", "von Bardeleben et al., Phys. Rev. B: NV centers identified in 3C, 4H and 6H SiC, the analog predicted here."],
    [2022, "12,000 hosts", "Kanai et al., PNAS: a coherence scaling law built on the H criteria, screening over 12,000 hosts. CeO₂ predicted up to 47 ms."]];
  let k = 1;
  const u = () => {
    const X = y => 60 + (y - 2009) / 14 * 560;
    let s = ln(40, 120, 640, 120, "var(--p)", 2);
    E.forEach(([y, t], i) => { const on = i === k; s += `<g data-e="${i}" style="cursor:pointer">` + ci(X(y), 120, on ? 13 : 9, on ? C.coral : C.blue, "var(--panel)") + tx(X(y), i % 2 ? 100 : 150, y, "middle", on ? "th" : "t") + tx(X(y), i % 2 ? 80 : 170, t, "middle", "ts") + `</g>`; });
    s += rc(30, 190, 620, 115, "var(--sunk)", "none", 'rx="8"') + tx(46, 214, `${E[k][0]}: ${E[k][1]}`, "start", "th") + wrap(46, 240, E[k][2], 84, "t");
    s += tx(340, 40, "click a year", "middle");
    fig.innerHTML = svg(315, s);
    fig.querySelectorAll("g[data-e]").forEach(g => g.onclick = () => { k = +g.dataset.e; u(); });
  };
  u();
}},

{ s: "6. Discussion", t: "Questions for the journal club",
intu: String.raw`These questions are meant to start the discussion. Each has a short answer that you can reveal after the room has had a go. They move from understanding (what DFT can and cannot do) to critique (single-particle levels, the 1.09 eV label, a D4 check the paper did not make) to outlook (what the paper missed and where it points). The last question connects the paper to integrated photonics, where a defect emitter has to be coupled into a waveguide just like a quantum dot.`,
eq: String.raw`\[ \mathrm{V_{Si}^{2-}}:\quad E_{\text{ion}}^{\text{CB}} = E_{\text{CBM}} - \varepsilon(-/2-) \approx 0.3\ \text{eV} \ll E_{\text{opt}} \]`,
sym: [[String.raw`\(\varepsilon(-/2-)\)`, "the transition level that bounds the \\(\\mathrm{V_{Si}^{2-}}\\) window, about 0.3 eV below the CBM"], [String.raw`\(E_{\text{opt}}\)`, "any useful optical excitation of the center, of order 1 eV"]],
how: [String.raw`Read the question aloud and give the room a minute.`, String.raw`Reveal the answer and check it against the lesson where the idea was built.`, String.raw`Push for disagreement. Several answers here are judgment calls, not facts.`],
say: String.raw`The paper's lasting contribution is a set of physical criteria plus a computational screening strategy, and its main limitation is that the spin-selective non-radiative path, the heart of NV's optical spin control, could not be predicted.`,
num: String.raw`Seven questions. Suggested timing for a 45 minute session: 25 minutes through lessons 3 to 6, 20 minutes on these questions.`,
r(fig, ctl) {
  const Q = [
    ["Which criteria can DFT not check, and how do the authors work around it?", "The spin-selective non-radiative path (D2, D3) and the sublevel splitting. They restrict the search to vacancy complexes structurally like NV, assuming similar structure gives similar hidden physics (lesson 4, card 7)."],
    ["Fig. 3 shows Kohn-Sham levels, Fig. 1 shows many-body states. Why does this matter?", "Single-particle levels give spin and level positions, but the singlets ¹E and ¹A₁ that make the intersystem crossing work are many-body states that a single determinant cannot describe (lesson 3, card 2)."],
    ["Is 2.02 eV vs 1.945 eV good enough to identify a defect from its PL line?", "0.08 eV is excellent for DFT, but several defects can emit within 0.1 eV of each other. Identification needs extra fingerprints: spin, symmetry from ODMR, hyperfine structure."],
    ["Fig. 4B labels both emission and ZPL as 1.09 eV. What should emission be?", "Lower than the ZPL, since the blue arrow ends above the ground minimum. With a 0.06 eV relaxation it would be near 1.03 eV. Probably a labeling slip (lesson 6, card 4)."],
    ["Apply the D4 rule to V_Si²⁻ using Fig. 2. What do you find?", "It is stable only within about 0.3 eV of the CBM, so about 0.3 eV frees its extra electron. Any optical excitation would ionize it. The paper does not draw this conclusion."],
    ["The 2011 room temperature qubits in SiC were divacancies, not one of the four candidates here. What does that say about the method?", "The criteria and the vacancy-complex strategy were right, but the candidate list was incomplete. Screening by analogy needs a broad enough family of structures."],
    ["How would you couple a defect like N_C V_Si⁻ (about 1.1 µm emission) to a photonic waveguide?", "Same problem as a quantum dot: a waveguide mode at the emission wavelength, the dipole aligned with the mode field, Purcell enhancement to fight the small Debye-Waller factor, and a grating or edge coupler to get the light off chip."]];
  let k = 0, show = false;
  ctl.innerHTML = `<div class="row" id="qr"></div><div class="row"><button id="sh">Reveal answer</button></div>`;
  const u = () => {
    $("qr").innerHTML = Q.map((x, i) => `<button data-q="${i}" class="${i === k ? "on" : ""}">Q${i + 1}</button>`).join("");
    $("qr").querySelectorAll("button").forEach(b => b.onclick = () => { k = +b.dataset.q; show = false; u(); });
    $("sh").textContent = show ? "Hide answer" : "Reveal answer";
    let s = rc(20, 20, 640, 120, "var(--blue-bg)", "none", 'rx="10"') + tx(40, 48, `Question ${k + 1} of ${Q.length}`, "start", "th") + wrap(40, 76, Q[k][0], 70, "th", "start", 22);
    s += rc(20, 160, 640, 150, show ? "var(--teal-bg)" : "var(--sunk)", "none", 'rx="10"');
    s += show ? tx(40, 188, "A possible answer", "start", "th") + wrap(40, 214, Q[k][1], 80, "t", "start", 20) : tx(340, 240, "discuss first, then reveal", "middle", "th");
    fig.innerHTML = svg(320, s);
  };
  $("sh").onclick = () => { show = !show; u(); }; u();
}}
],
summary: String.raw`4H-SiC was chosen for its crystals and its 3.27 eV gap, the largest of the common polytypes. Of its candidates, \(\mathrm{N_C V_{Si}^-}\) reproduces the NV level structure with roughly half the energies, \(\mathrm{V_{Si}^{2-}}\) and \(\mathrm{V_{Si}^0}\) are triplets thanks to the crystal field (with D4 concerns), and \(\mathrm{V_{Si}^-}\) is a quartet. Fig. 5 turns this into rules for any tetrahedral host: cation vacancies give levels in the lower half of the gap and want a neighboring donor, anion vacancies push levels toward the conduction band and need a wide gap and small splittings (AlN works, ZnO does not). Electron counting fixes the charge state that gives six electrons. The prediction held: SiC vacancy complexes became room temperature spin qubits within a year, the \(\mathrm{N_C V_{Si}}\) center was later observed, and the host criteria now drive searches across thousands of materials.`,
sheet: [
[String.raw`\[ \text{4H} = (ABCB)_\infty,\ \text{sites } h, k \]`, "4H-SiC stacking"],
[String.raw`\[ \text{D4 margin} = \min(E_g - \varepsilon_{\text{lower}},\ \varepsilon_{\text{upper}}) - E_{\text{abs}} \]`, "Scorecard D4 check"],
[String.raw`\[ E_{a_1(2)} = E_{\text{DB}} + \tfrac14\Delta - \tfrac23\delta, \quad E_e = E_{\text{DB}} + \tfrac14\Delta + \tfrac13\delta \]`, "Fig. 5 level positions"],
[String.raw`\[ n_e = \sum_i \left[\left(2 - \tfrac{v_{\text{vac}}}{4}\right) + (v_i - v_i^{\text{host}})\right] - q \]`, "Electron counting for complexes"]],
consts: String.raw`Gaps: 3C-SiC 2.39, 6H-SiC 3.02, 4H-SiC 3.27, ZnSe 2.7, ZnO 3.4, AlN 6.0 eV.`,
sources: ["Weber et al., PNAS 107, 8513 (2010), SiC results, Fig. 5, Methods and SI electron counting", "Koehl et al., Nature 479, 84 (2011), room temperature coherent control of defect spin qubits in SiC", "Falk et al., Nat. Commun. 4, 1819 (2013), polytype control of spin qubits in SiC", "Widmann et al., Nat. Mater. 14, 164 (2015) and Christle et al., Nat. Mater. 14, 160 (2015)", "von Bardeleben et al., Phys. Rev. B 94, 121202 (2016), NV centers in 3C, 4H and 6H SiC", "Kanai et al., PNAS 119, e2121808119 (2022), coherence scaling across 12,000 hosts"]
});
})();

(function () {
/* Journal Club, Weber et al. 2010. Lesson 4: the nine criteria D1 to D5 and H1 to H4.
   Visual checks: a criteria map on the NV picture, a photoionization tester (D4), thermal isolation (D5),
   band gaps (H1), spin-orbit splittings (H2), nuclear spin baths (H3, H4) and what DFT can compute. */
const { tx, rc, ln, ci, fmt, sci, C } = JC;
const rnd = seed => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

const CRIT = [
  ["D1", "A paramagnetic, long-lived bound state with spin sublevels split in the RF range", "def"],
  ["D2", "An optical pumping cycle with a spin-selective non-radiative path", "def"],
  ["D3", "Luminescence that differs by spin sublevel, from a strong spin-conserving transition", "def"],
  ["D4", "All optical transitions below the energy to push an electron into or out of the bands", "def"],
  ["D5", "Bound states far enough apart that heat cannot mix them", "def"],
  ["H1", "A wide band gap, so that D4 can be met", "host"],
  ["H2", "Small spin-orbit coupling, to avoid unwanted spin flips", "host"],
  ["H3", "High quality bulk or thin film single crystals", "host"],
  ["H4", "Elements with abundant zero nuclear spin isotopes, so the spin bath can be removed", "host"]
];

addLesson("jc", "weber", {
level: "Core",
id: "jc-weber-l4", title: "The nine criteria for an NV-like qubit", short: "4. The nine criteria",
labels: { note: "Journal club note" },
big: String.raw`The paper's main conceptual contribution is a checklist. To copy NV's two strengths (isolation from noise, and optical initialization and readout at room temperature), a defect must meet five criteria, <b>D1 to D5</b>, and its host crystal four more, <b>H1 to H4</b>. This lesson makes each one visual. Card 1 maps all nine onto the NV picture. Cards 2 and 3 test D4 (no leaking into the bands) and D5 (no thermal mixing) with sliders and real numbers from the paper. Cards 4 to 6 compare host materials: band gaps, spin-orbit coupling and nuclear spins, including why GaAs can never be purified and why oxides like CeO₂ came up years later. Card 7 is the scorecard the paper ends on: which criteria a density functional calculation can actually check.`,
cards: [
{ s: "1. The checklist", t: "Nine criteria, mapped onto the NV picture",
intu: String.raw`Click a criterion to see which part of the NV physics it describes. The <b>D</b> criteria are about the defect's own levels: a spin to store information (D1), a pumping cycle (D2), a spin-dependent glow (D3), transitions that stay inside the gap (D4) and levels far apart in energy (D5). The <b>H</b> criteria are about the crystal that hosts it: room in the gap (H1), weak spin-orbit coupling (H2), good crystals (H3) and a nuclear spin free lattice (H4). The paper keeps one simplifying assumption throughout: spin is a good quantum number, as it is for NV. The last paragraph of the paper notes that dropping this assumption would open up other classes of centers.`,
eq: String.raw`\[ \text{NV-like qubit} \iff \underbrace{D_1 \wedge D_2 \wedge D_3 \wedge D_4 \wedge D_5}_{\text{defect}} \;\wedge\; \underbrace{H_1 \wedge H_2 \wedge H_3 \wedge H_4}_{\text{host}} \]`,
sym: [[String.raw`\(D_1 \dots D_5\)`, "criteria for the defect (bound states, optics, spin dependence, isolation)"], [String.raw`\(H_1 \dots H_4\)`, "criteria for the host crystal"], [String.raw`\(\wedge\)`, "logical AND: all of them are needed"]],
how: [String.raw`Start from what NV does: initialize, manipulate and measure one spin at room temperature.`, String.raw`Manipulation needs a spin with an RF splitting (D1). Initialization needs a spin-selective pumping cycle (D2). Measurement needs spin-dependent light (D3).`, String.raw`At room temperature, the cycle must not leak electrons to the bands (D4) and heat must not shuffle the levels (D5).`, String.raw`The host must make all this possible (H1) and quiet (H2 to H4).`],
say: String.raw`Weber et al. list five defect criteria (D1 to D5) and four host criteria (H1 to H4) that a deep center must meet to reproduce the room temperature optical spin control of the NV center.`,
num: String.raw`For NV: D1 spin 1 with \(D\) = 2.87 GHz. D2 and D3 from Fig. 1. D4: ZPL 1.945 eV, below the 2.6 eV needed to ionize NV⁻. D5: ³E sits 1.945 eV above the ground state. H1: 5.5 eV gap. H2: spin-orbit splitting of diamond about 6 meV. H4: 98.9 % \(^{12}\)C.`,
r(fig, ctl) {
  let k = 0;
  ctl.innerHTML = `<div class="row">${CRIT.map((c, i) => `<button data-k="${i}">${c[0]}</button>`).join("")}</div>`;
  const u = () => {
    pick(ctl, "k", k);
    const c = CRIT[k], hi = (ks, x) => ks.includes(k) ? x : "";
    const B = JC.bands(60, 40, 330, 270, 5.47, -0.5, 6.0);
    let s = B.s;
    if (k === 5) s += `<line x1="400" y1="${B.Y(0)}" x2="400" y2="${B.Y(5.47)}" stroke="${C.coral}" stroke-width="3" marker-end="url(#ar)" marker-start="url(#ar)"/>` + tx(406, B.Y(2.7), "5.5 eV", "start", "th", `fill="${C.coral}"`);
    // levels
    const g = B.Y(1.0), e = B.Y(2.95);
    s += ln(110, g, 200, g, "var(--p)", 3) + tx(105, g + 4, "³A₂", "end", "th") + ln(110, e, 200, e, "var(--p)", 3) + tx(105, e + 4, "³E", "end", "th");
    s += ln(260, B.Y(2.1), 340, B.Y(2.1), "var(--p)", 3) + tx(345, B.Y(2.1) + 4, "singlets", "start");
    s += `<line x1="140" y1="${g - 3}" x2="140" y2="${e + 5}" stroke="${C.green}" stroke-width="${k === 1 || k === 2 ? 4 : 2}" marker-end="url(#ar)"/><line x1="170" y1="${e + 3}" x2="170" y2="${g - 5}" stroke="${C.red}" stroke-width="${k === 2 ? 4 : 2}" stroke-dasharray="6 3" marker-end="url(#ar)"/>`;
    s += `<path d="M200 ${e} Q 260 ${e} 290 ${B.Y(2.1) - 4}" fill="none" stroke="${C.purple}" stroke-width="${k === 1 ? 4 : 1.5}" marker-end="url(#ar)"/><path d="M300 ${B.Y(2.1) + 4} Q 260 ${g} 202 ${g}" fill="none" stroke="${C.teal}" stroke-width="${k === 1 ? 4 : 1.5}" marker-end="url(#ar)"/>`;
    if (k === 0) s += rc(100, g - 22, 110, 40, "none", C.coral, 'stroke-width="2.5" rx="6"') + tx(155, g + 34, "spin 1, split 2.87 GHz", "middle", "th", `fill="${C.coral}"`);
    if (k === 3) s += `<line x1="230" y1="${g}" x2="230" y2="${B.Y(5.47) + 4}" stroke="${C.coral}" stroke-width="2.5" stroke-dasharray="4 3" marker-end="url(#ar)"/>` + tx(236, B.Y(4.4), "ionizing needs more", "start", "th", `fill="${C.coral}"`) + tx(236, B.Y(4.4) + 16, "than the laser gives", "start", "ts");
    if (k === 4) s += `<line x1="215" y1="${g}" x2="215" y2="${e}" stroke="${C.coral}" stroke-width="2.5" marker-end="url(#ar)" marker-start="url(#ar)"/>` + tx(222, (g + e) / 2, "≫ k_BT", "start", "th", `fill="${C.coral}"`);
    if (k === 6) s += tx(225, B.Y(-0.25), "light atoms: C (Z = 6)", "middle", "th", `fill="${C.coral}"`);
    if (k === 7) s += rc(62, 42, 326, 266, "none", C.coral, 'stroke-width="3" stroke-dasharray="8 4"') + tx(225, 32, "perfect crystal, no stray spins", "middle", "th", `fill="${C.coral}"`);
    if (k === 8) { const R = rnd(3); for (let i = 0; i < 26; i++) s += ci(70 + R() * 310, 50 + R() * 250, i < 2 ? 4 : 2.5, i < 2 ? C.amber : "var(--b)"); s += tx(225, 32, "only 1.1 % ¹³C nuclear spins (orange)", "middle", "th", `fill="${C.coral}"`); }
    // card text
    s += rc(430, 40, 230, 270, c[2] === "def" ? "var(--blue-bg)" : "var(--teal-bg)", "none", 'rx="8"');
    s += tx(545, 72, c[0], "middle", "th", 'font-size="26"') + tx(545, 96, c[2] === "def" ? "defect criterion" : "host criterion", "middle");
    const words = c[1].split(" "); let line = "", y = 130, out = "";
    words.forEach(w => { if ((line + " " + w).length > 30) { out += tx(545, y, line.trim(), "middle", "t"); y += 20; line = w; } else line += " " + w; });
    out += tx(545, y, line.trim(), "middle", "t");
    s += out;
    fig.innerHTML = svg(320, s);
  };
  ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { k = +b.dataset.k; u(); }); u();
}},

{ s: "2. D4: stay in the gap", t: "D4: the light must not knock electrons into the bands",
intu: String.raw`The pumping cycle uses a laser. If a laser photon has enough energy to lift the defect's electron all the way into the conduction band, or to pull an electron up from the valence band into the defect, the defect changes its <b>charge state</b> and the qubit is gone. So every optical energy used (the laser and the internal transition) must be smaller than both of these <b>ionization thresholds</b>. The thresholds come straight from the charge transition levels of Fig. 2: losing an electron costs \(E_g - \varepsilon(0/-)\), gaining one costs \(\varepsilon(-/2-)\). Pick a preset or move the sliders and watch the check turn red. For NV⁻ the 532 nm laser (2.33 eV) sits just under the 2.58 eV threshold, which is indeed why strong green light occasionally converts NV⁻ to NV⁰ in experiments (through two photons).`,
eq: String.raw`\[ E_{\text{ion}}^{\text{CB}} = E_{\text{CBM}} - \varepsilon(0/-), \qquad E_{\text{cap}}^{\text{VB}} = \varepsilon(-/2-) - E_{\text{VBM}} \]\[ \text{D4 holds if}\quad h\nu_{\text{laser}},\ E_{\text{abs}} \lt \min\!\left(E_{\text{ion}}^{\text{CB}},\, E_{\text{cap}}^{\text{VB}}\right) \]`,
sym: [[String.raw`\(\varepsilon(0/-)\)`, "lower edge of the stability window of the −1 state"], [String.raw`\(\varepsilon(-/2-)\)`, "upper edge, where the −2 state takes over"], [String.raw`\(E_{\text{ion}}^{\text{CB}}\)`, "photon energy that moves the extra electron into the conduction band"], [String.raw`\(E_{\text{cap}}^{\text{VB}}\)`, "photon energy that pulls an electron from the valence band onto the defect"], [String.raw`\(E_{\text{abs}}\)`, "internal absorption energy of the defect"]],
how: [String.raw`A charge transition level is the Fermi level at which two charge states cost the same energy (lesson 6).`, String.raw`Moving an electron from NV⁻ to the CBM makes NV⁰ plus a free electron. The minimum energy is the distance from \(\varepsilon(0/-)\) up to the CBM.`, String.raw`Moving an electron from the VBM onto NV⁻ makes NV²⁻ plus a hole. The minimum energy is the distance from the VBM up to \(\varepsilon(-/2-)\).`, String.raw`The paper uses defect-to-band energies only to check that these processes are suppressed, which is why their limited accuracy is acceptable (Methods).`],
say: String.raw`Criterion D4 requires the laser and the defect's internal transitions to lie below the photoionization thresholds set by the charge transition levels relative to the band edges.`,
num: String.raw`NV⁻ (paper, HSE06): window 2.78 to 5.14 eV in a 5.36 eV gap. Thresholds 5.36 − 2.78 = <b>2.58 eV</b> and <b>5.14 eV</b>. Absorption 2.27 eV and laser 2.33 eV both pass. \(\mathrm{N_C V_{Si}^-}\) in 4H-SiC: window 1.60 to 2.83 eV in 3.17 eV: thresholds <b>1.57</b> and <b>2.83 eV</b>, absorption 1.15 eV passes.`,
r(fig, ctl) {
  const PR = [["NV⁻ diamond", 5.36, 2.78, 5.14, 2.27, 2.33], ["N_C V_Si⁻ 4H-SiC", 3.17, 1.60, 2.83, 1.15, 1.30], ["your defect", 3.2, 2.2, 2.9, 1.6, 2.0]];
  let p = 0;
  ctl.innerHTML = `<div class="row">${PR.map((x, i) => `<button data-p="${i}">${x[0]}</button>`).join("")}</div>` + sl("eg", "Band gap (eV)", 1, 6, 0.01, 5.36) + sl("lo", "ε(0/−) (eV)", 0, 6, 0.01, 2.78) + sl("hi", "ε(−/2−) (eV)", 0, 6, 0.01, 5.14) + sl("ab", "Absorption (eV)", 0.3, 4, 0.01, 2.27) + sl("la", "Laser photon (eV)", 0.3, 4, 0.01, 2.33) + `<div class="readout" id="ro"></div>`;
  const u = () => {
    pick(ctl, "p", p);
    let eg = +$("eg").value, lo = Math.min(+$("lo").value, eg), hi = JC.clamp(+$("hi").value, lo, eg), ab = +$("ab").value, la = +$("la").value;
    ["eg", "lo", "hi", "ab", "la"].forEach(id => $(id + "v").textContent = fmt(+$(id).value, 2) + " eV");
    const B = JC.bands(70, 30, 260, 290, eg, -0.5, eg + 0.5);
    let s = B.s + rc(70, B.Y(hi), 260, B.Y(lo) - B.Y(hi), C.coral, "none", 'fill-opacity="0.15"');
    s += ln(70, B.Y(lo), 330, B.Y(lo), C.coral, 2, "6 3") + tx(76, B.Y(lo) + 15, `ε(0/−) = ${fmt(lo, 2)}`, "start") + ln(70, B.Y(hi), 330, B.Y(hi), C.coral, 2, "6 3") + tx(76, B.Y(hi) - 6, `ε(−/2−) = ${fmt(hi, 2)}`, "start");
    s += tx(200, (B.Y(lo) + B.Y(hi)) / 2 + 4, "−1 state stable here", "middle", "th");
    const Ecb = eg - lo, Evb = hi;
    s += `<line x1="290" y1="${B.Y(lo)}" x2="290" y2="${B.Y(eg)}" stroke="${C.blue}" stroke-width="2.5" marker-end="url(#ar)"/>` + tx(296, (B.Y(lo) + B.Y(eg)) / 2, fmt(Ecb, 2), "start", "th", `fill="${C.blue}"`);
    s += `<line x1="250" y1="${B.Y(0)}" x2="250" y2="${B.Y(hi)}" stroke="${C.teal}" stroke-width="2.5" marker-end="url(#ar)"/>` + tx(244, B.Y(hi / 2), fmt(Evb, 2), "end", "th", `fill="${C.teal}"`);
    // energy bar comparison
    const thr = Math.min(Ecb, Evb), mx = Math.max(Ecb, Evb, ab, la) * 1.15, X = v => 400 + v / mx * 250;
    const bars = [["to CBM", Ecb, C.blue], ["from VBM", Evb, C.teal], ["absorption", ab, ab < thr ? C.green : C.red], ["laser", la, la < thr ? C.green : C.red]];
    s += tx(525, 40, "photon energies compared (eV)", "middle", "th");
    bars.forEach(([l, v, col], i) => { const y = 60 + i * 52; s += rc(400, y, X(v) - 400, 26, col, "none", 'fill-opacity="0.75"') + tx(404, y + 42, `${l}: ${fmt(v, 2)}`, "start"); });
    s += ln(X(thr), 50, X(thr), 270, "var(--t)", 2, "5 3") + tx(X(thr), 285, "threshold", "middle", "th");
    const ok = ab < thr && la < thr;
    s += tx(525, 312, ok ? "D4 satisfied" : "D4 violated: the light can ionize the defect", "middle", "th", `fill="${ok ? C.green : C.red}"`);
    fig.innerHTML = svg(325, s);
    $("ro").innerHTML = `<div><span>lowest ionization threshold</span><b>${fmt(thr, 2)} eV</b></div><div><span>margin for the laser</span><b>${fmt(thr - la, 2)} eV</b></div>`;
  };
  const set = i => { p = i; const x = PR[i]; ["eg", "lo", "hi", "ab", "la"].forEach((id, j) => $(id).value = x[j + 1]); u(); };
  ctl.querySelectorAll("button[data-p]").forEach(b => b.onclick = () => set(+b.dataset.p));
  ["eg", "lo", "hi", "ab", "la"].forEach(id => $(id).oninput = () => { p = 2; u(); }); set(0);
},
note: String.raw`<p>The laser value for \(\mathrm{N_C V_{Si}^-}\) (1.30 eV) is an illustrative choice of a laser just above its 1.15 eV absorption, not a number from the paper.</p>`},

{ s: "3. D5: no thermal mixing", t: String.raw`D5: levels must be far apart compared with \(k_BT\)`,
intu: String.raw`At room temperature every degree of freedom carries about \(k_BT\) = 25.9 meV of thermal energy. If two bound states (or a bound state and a band edge) are closer than a few \(k_BT\), phonons will kick the electron back and forth and scramble the spin information. The Boltzmann factor tells you how often: an energy gap of 0.1 eV is crossed about 2 % of the time, 0.5 eV essentially never. Slide the gap and the temperature and watch the population of the upper state. The presets use real numbers from this paper and later work: the ³E state of NV, the lower singlet ¹E, and the a₁(2) level of \(\mathrm{V_{Si}^0}\) that sits only 0.14 eV above the valence band in Table 1, which the paper flags as a concern.`,
eq: String.raw`\[ \frac{p_{\text{upper}}}{p_{\text{lower}}} = \frac{g_u}{g_l}\, e^{-\Delta E / k_B T}, \qquad k_B T(300\ \text{K}) = 25.9\ \text{meV} \]`,
sym: [[String.raw`\(\Delta E\)`, "energy separation between the two bound states (or level and band edge)"], [String.raw`\(g_u, g_l\)`, "degeneracies of the upper and lower states (set to 1 here)"], [String.raw`\(k_B T\)`, "thermal energy"]],
how: [String.raw`In thermal equilibrium the population ratio of two states is the Boltzmann factor.`, String.raw`Even out of equilibrium, phonon-driven up-rates scale with the same exponential, so it measures how often heat can cross the gap.`, String.raw`A gap of \(n\,k_BT\) is crossed with relative probability \(e^{-n}\). Ten \(k_BT\) (0.26 eV) gives \(4.5 \times 10^{-5}\).`, String.raw`Spin sublevels are only µeV apart, so heat does mix them. That is fine because optical pumping, not equilibrium, sets them (D2).`],
say: String.raw`Criterion D5 requires the bound states, and the bound states and band edges, to be separated by many \(k_BT\) so that thermal excitation cannot couple them and destroy the spin information.`,
num: String.raw`At 300 K: ³E at 1.945 eV gives \(e^{-75} \approx 2 \times 10^{-33}\). ¹E at about 0.4 eV gives \(2 \times 10^{-7}\). A 0.14 eV level gives \(4.5 \times 10^{-3}\). Spin sublevels at 11.9 µeV give 0.9995, fully mixed thermally.`,
r(fig, ctl) {
  const PR = [["NV ³E (1.945 eV)", 1.945], ["NV ¹E (≈ 0.4 eV)", 0.4], ["V_Si⁰ a₁(2) to VBM (0.14 eV)", 0.14], ["spin sublevels (12 µeV)", 1.19e-5]];
  ctl.innerHTML = `<div class="row">${PR.map((x, i) => `<button data-p="${i}">${x[0]}</button>`).join("")}</div>` + sl("dE", "Gap ΔE (log, eV)", -5, 0.5, 0.01, Math.log10(0.14)) + sl("T", "Temperature (K)", 4, 700, 1, 300) + `<div class="readout" id="ro"></div>`;
  const u = () => {
    const dE = Math.pow(10, +$("dE").value), T = +$("T").value, kT = JC.kB * T, r = Math.exp(-dE / kT);
    $("dEv").textContent = dE < 0.01 ? fmt(dE * 1e6, 1) + " µeV" : fmt(dE, 3) + " eV"; $("Tv").textContent = T + " K";
    const F = JC.frame(70, 30, 330, 250, { xmin: 4, xmax: 700, ymin: 1e-12, ymax: 1, ylog: true, xt: [100, 300, 500, 700], yt: [1e-12, 1e-9, 1e-6, 1e-3, 1], yf: v => "10" + ({ "-12": "⁻¹²", "-9": "⁻⁹", "-6": "⁻⁶", "-3": "⁻³", "0": "⁰" })[Math.round(Math.log10(v))], xl: "temperature (K)", yl: "upper / lower population", grid: true });
    const Ts = range(4, 700, 300);
    let s = F.s + JC.path(F, Ts, Ts.map(t => Math.max(1e-12, Math.exp(-dE / (JC.kB * t)))), C.coral, 2.5) + ci(F.X(T), F.Y(Math.max(1e-12, r)), 6, C.coral, "#fff");
    s += ln(F.X(300), 30, F.X(300), 280, "var(--p)", 1, "4 3") + tx(F.X(300) + 4, 44, "room temperature", "start");
    // level picture with thermal arrows
    const yl = 260, yu = JC.clamp(260 - Math.log10(dE / 1e-5) / 5.5 * 200, 60, 255);
    s += ln(470, yl, 620, yl, "var(--p)", 3) + ln(470, yu, 620, yu, "var(--p)", 3) + tx(625, yl + 4, "lower", "start") + tx(625, yu + 4, "upper", "start");
    s += `<line x1="460" y1="${yl}" x2="460" y2="${yu}" stroke="var(--p)" marker-end="url(#ar)" marker-start="url(#ar)"/>`;
    const nup = Math.round(Math.min(1, r / (1 + r)) * 20);
    for (let i = 0; i < 20; i++) { const up = i < nup; s += ci(482 + (i % 10) * 13, (up ? yu : yl) - 8 - Math.floor(i / 10) * 0, 4.5, up ? C.coral : C.blue); }
    const kTpx = Math.min(200, 0.0259 * T / 300 / 1e-5); // only for words
    s += tx(545, 300, `ΔE = ${fmt(dE / kT, dE / kT < 10 ? 2 : 0)} k_BT`, "middle", "th");
    fig.innerHTML = svg(320, s);
    $("ro").innerHTML = `<div><span>k_BT</span><b>${fmt(kT * 1000, 1)} meV</b></div><div><span>Boltzmann factor</span><b>${sci(r, 1)}</b></div><div><span>D5</span><b>${dE / kT > 10 ? "satisfied" : dE / kT > 4 ? "marginal" : "violated"}</b></div>`;
  };
  ctl.querySelectorAll("button[data-p]").forEach(b => b.onclick = () => { $("dE").value = Math.log10(PR[+b.dataset.p][1]); u(); });
  $("dE").oninput = u; $("T").oninput = u; u();
}},

{ s: "4. H1: wide gap", t: "H1: the band gap must leave room for the defect",
intu: String.raw`A deep center needs room. Its occupied level must sit well above the valence band and its empty level well below the conduction band, with an optical transition between them that is still smaller than both distances to the bands (D4). That is only possible if the gap is comfortably larger than the transition energy. Silicon and GaAs (gaps near 1 to 1.4 eV) leave almost no room for a visible or near-infrared transition. Diamond, SiC, GaN, ZnO and AlN do. Slide the transition energy of your defect and the margin you want on each side, and see which hosts pass. This is a rough visual rule, not a law, but it is the logic behind H1. Notice also that among the SiC polytypes the paper picks 4H, which has the largest gap.`,
eq: String.raw`\[ E_g \gtrsim E_{\text{opt}} + 2\delta \]`,
sym: [[String.raw`\(E_g\)`, "band gap of the host (experimental values)"], [String.raw`\(E_{\text{opt}}\)`, "optical transition energy of the defect"], [String.raw`\(\delta\)`, "margin between the defect levels and each band edge"]],
how: [String.raw`Place the occupied level a distance \(\delta\) above the VBM and the empty level \(\delta\) below the CBM.`, String.raw`The internal transition then spans at most \(E_g - 2\delta\).`, String.raw`Asking for a given \(E_{\text{opt}}\) gives the inequality. A bigger margin protects against both photoionization (D4) and thermal escape (D5).`, String.raw`Wide gap hosts are usually made of light, strongly bonded atoms, which also helps H2.`],
say: String.raw`Criterion H1 asks for a wide band gap so that the defect's levels and optical transitions fit inside the gap with a safe margin from both band edges.`,
num: String.raw`Gaps (eV, room temperature): Si 1.12, GaAs 1.42, 3C-SiC 2.39, ZnSe 2.7, 6H-SiC 3.02, 4H-SiC 3.27, ZnO 3.37, GaN 3.4, diamond 5.47, AlN 6.0, MgO 7.8. NV (1.945 eV) with a 0.5 eV margin needs \(E_g \gt 2.9\) eV.`,
r(fig, ctl) {
  const H = [["Si", 1.12], ["GaAs", 1.42], ["3C-SiC", 2.39], ["ZnSe", 2.7], ["6H-SiC", 3.02], ["4H-SiC", 3.27], ["ZnO", 3.37], ["GaN", 3.4], ["diamond", 5.47], ["AlN", 6.0], ["MgO", 7.8]];
  ctl.innerHTML = sl("E", "Defect transition (eV)", 0.5, 4, 0.01, 1.945) + sl("d", "Margin each side (eV)", 0, 1.5, 0.05, 0.5) + `<div class="readout" id="ro"></div>`;
  const u = () => {
    const E = +$("E").value, d = +$("d").value, need = E + 2 * d; $("Ev").textContent = fmt(E, 2) + " eV"; $("dv").textContent = fmt(d, 2) + " eV";
    const F = JC.frame(70, 30, 580, 250, { xmin: 0, xmax: H.length, ymin: 0, ymax: 8, yt: [0, 2, 4, 6, 8], yl: "band gap (eV)", grid: true });
    let s = F.s, pass = 0;
    H.forEach(([n, g], i) => { const ok = g >= need; if (ok) pass++; const x = F.X(i + 0.15), w = F.X(i + 0.85) - x;
      s += rc(x, F.Y(g), w, F.Y(0) - F.Y(g), ok ? C.teal : C.gray, "none", 'fill-opacity="0.7"') + tx(x + w / 2, F.Y(g) - 5, g, "middle") + tx(x + w / 2, 296, n, "middle", "ts");
      if (ok) { const y0 = F.Y(d + (g - need) / 2), y1 = F.Y(d + E + (g - need) / 2); s += `<line x1="${x + w / 2}" y1="${y0}" x2="${x + w / 2}" y2="${y1}" stroke="${C.green}" stroke-width="2.5" marker-end="url(#ar)"/>`; } });
    s += ln(70, F.Y(need), 650, F.Y(need), C.coral, 2, "6 4") + tx(76, F.Y(need) - 6, `needed: ${fmt(need, 2)} eV`, "start", "th", `fill="${C.coral}"`);
    fig.innerHTML = svg(310, s);
    $("ro").innerHTML = `<div><span>minimum gap</span><b>${fmt(need, 2)} eV</b></div><div><span>hosts that pass</span><b>${pass} of ${H.length}</b></div>`;
  };
  $("E").oninput = u; $("d").oninput = u; u();
}},

{ s: "5. H2: spin-orbit", t: "H2: light atoms keep spin-orbit coupling small",
intu: String.raw`Spin-orbit coupling ties the electron's spin to its orbital motion. Any orbital disturbance, such as a lattice vibration, then becomes a way to flip the spin, which shortens the spin lifetime. Its strength grows very fast with the atomic number of the atoms the electron lives on, roughly as \(Z^2\) for the valence p electrons of a crystal. The plot shows the measured spin-orbit splitting of the valence band, \(\Delta_{\text{SO}}\), against the atomic number of the anion, where the valence electrons sit. Diamond is at the bottom left with 6 meV, CdTe at the top right with almost 1 eV. Click a material to read its value. There is a subtlety worth raising: D2 <i>needs</i> some spin-orbit coupling, because the spin-selective intersystem crossing is itself a spin-orbit effect. H2 asks for small, not zero.`,
eq: String.raw`\[ H_{\text{SO}} = \lambda\,\mathbf{L}\cdot\mathbf{S}, \qquad \Delta_{\text{SO}} = \tfrac{3}{2}\lambda, \qquad \lambda \propto \left\langle \frac{1}{r}\frac{dV}{dr} \right\rangle \sim Z^2 \]`,
sym: [[String.raw`\(\lambda\)`, "spin-orbit coupling constant of the p orbitals"], [String.raw`\(\Delta_{\text{SO}}\)`, "spin-orbit splitting at the top of the valence band"], [String.raw`\(Z\)`, "atomic number of the atom carrying the valence electrons"], [String.raw`\(V(r)\)`, "potential of the ion core seen by the electron"]],
how: [String.raw`An electron moving through the electric field of a nucleus sees, in its own frame, a magnetic field. That field acts on its spin.`, String.raw`The field is strongest near a heavy nucleus, where \(dV/dr\) is huge. For valence electrons the net scaling is roughly \(Z^2\).`, String.raw`For a p shell, \(\mathbf{L}\cdot\mathbf{S}\) splits the six states into four (\(j = 3/2\)) and two (\(j = 1/2\)), separated by \(\tfrac32\lambda\).`, String.raw`Big \(\lambda\) mixes spin up and down in every orbital, so phonons can flip spins: short \(T_1\) and \(T_2\).`],
say: String.raw`Criterion H2 favors hosts made of light elements, because spin-orbit coupling grows steeply with atomic number and would mix spin states and cause unwanted spin flips.`,
num: String.raw`\(\Delta_{\text{SO}}\) (eV): diamond 0.006, GaN 0.017, AlN 0.019, Si 0.044, InP 0.108, GaAs 0.341, InAs 0.39, ZnSe 0.40, InSb 0.81, CdTe 0.95. Ratio GaAs to diamond: about 57. The \(Z^2\) rule alone gives \((33/6)^2 = 30\), the right order of magnitude.`,
r(fig, ctl) {
  const D = [["diamond", 6, 0.006], ["GaN", 7, 0.017], ["AlN", 7, 0.019], ["Si", 14, 0.044], ["InP", 15, 0.108], ["GaAs", 33, 0.341], ["InAs", 33, 0.39], ["ZnSe", 34, 0.40], ["InSb", 51, 0.81], ["CdTe", 52, 0.95]];
  let k = 0;
  ctl.innerHTML = `<div class="row">${D.map((x, i) => `<button data-k="${i}">${x[0]}</button>`).join("")}</div><div class="readout" id="ro"></div>`;
  const u = () => {
    pick(ctl, "k", k);
    const F = JC.frame(80, 30, 540, 260, { xmin: 0, xmax: 56, ymin: 0.003, ymax: 2, ylog: true, xt: [0, 10, 20, 30, 40, 50], yt: [0.01, 0.1, 1], yf: v => v + " eV", xl: "atomic number Z of the anion", yl: "valence spin-orbit splitting", grid: true });
    let s = F.s; const zs = range(4, 56, 100);
    s += JC.path(F, zs, zs.map(z => 3.2e-4 * z * z), C.gray, 1.5, "6 4") + tx(F.X(45), F.Y(3.2e-4 * 45 * 45) - 12, "∝ Z²", "middle", "th");
    D.forEach(([n, z, v], i) => { const on = i === k; s += ci(F.X(z), F.Y(v), on ? 8 : 5, z < 15 ? C.teal : C.coral, on ? "var(--t)" : "none"); s += tx(F.X(z) + (i % 2 ? 10 : -10), F.Y(v) + (i % 2 ? 14 : -8), n, i % 2 ? "start" : "end", on ? "th" : "ts"); });
    s += rc(F.X(4), 30, F.X(15) - F.X(4), 260, C.teal, "none", 'fill-opacity="0.08"') + tx(F.X(9.5), 48, "light hosts", "middle", "th", `fill="${C.teal}"`);
    fig.innerHTML = svg(330, s);
    const d = D[k];
    $("ro").innerHTML = `<div><span>${d[0]}: Δ_SO</span><b>${d[2] < 0.1 ? fmt(d[2] * 1000, 0) + " meV" : fmt(d[2], 3) + " eV"}</b></div><div><span>relative to diamond</span><b>× ${fmt(d[2] / 0.006, 0)}</b></div>`;
  };
  ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { k = +b.dataset.k; u(); }); u();
},
note: String.raw`<p>Discussion point: D2 relies on spin-orbit coupling for the spin-selective intersystem crossing, while H2 asks for weak spin-orbit coupling. NV gets both because the crossing only needs a small coupling between nearly degenerate states, while spin relaxation in the ground state needs the coupling to compete with phonon energies.</p>`},

{ s: "6. H3 and H4: quiet crystal", t: "H3 and H4: clean crystals and no nuclear spins",
intu: String.raw`Even a perfect defect is only as quiet as its surroundings. H3 asks for high quality single crystals, so there are no other paramagnetic defects or impurities flipping nearby. H4 asks for elements that have <b>naturally occurring isotopes with zero nuclear spin</b>, because then the remaining nuclear spins can be removed by isotope purification, as was done for the 1.8 ms NV result. Pick a host and look at its lattice: orange dots are atoms with a nuclear spin. Diamond and silicon are mostly spin free. In GaAs and AlN every atom carries a nuclear spin, and no purification can fix that, because Ga, As and Al have no spin-free isotopes. CeO₂ is remarkable: cerium has no nuclear spin at all and oxygen almost none. A 2022 study by the same group ranked it among the most promising hosts, with predicted \(T_2\) up to 47 ms.`,
eq: String.raw`\[ c = \frac{\sum_{\text{atoms}} n_i\, a_i}{\sum_{\text{atoms}} n_i}, \qquad T_2 \propto c^{-1} \ \ \text{(dilute bath)} \]`,
sym: [[String.raw`\(c\)`, "fraction of atoms carrying a nuclear spin"], [String.raw`\(n_i\)`, "number of atoms of element i per formula unit"], [String.raw`\(a_i\)`, "natural abundance of the spinful isotopes of element i"], [String.raw`\(T_2\)`, "electron spin coherence time limited by the nuclear bath"]],
how: [String.raw`Each nucleus with spin \(I \neq 0\) is a small magnet whose orientation slowly fluctuates.`, String.raw`Their combined field at the defect jitters, which dephases the electron spin (lesson 1, card 4).`, String.raw`If an element has stable isotopes with \(I = 0\) (\(^{12}\)C, \(^{28}\)Si, \(^{30}\)Si), the spinful ones can be removed by enrichment.`, String.raw`For dilute baths, \(T_2\) scales roughly as \(1/c\), as shown by cluster expansion studies across thousands of hosts (Kanai et al. 2022).`],
say: String.raw`Criteria H3 and H4 ask for high quality crystals made of elements with abundant zero nuclear spin isotopes, so that paramagnetic impurities and the nuclear spin bath can be removed.`,
num: String.raw`Spinful fraction \(c\): diamond 1.1 % (\(^{13}\)C), Si 4.7 % (\(^{29}\)Si), 4H-SiC 2.9 %, ZnSe 5.9 %, MgO 5.0 %, CeO₂ 0.025 % (only \(^{17}\)O, 0.038 %), GaAs and AlN 100 %. Kanai et al. (2022) predict \(T_2\) up to 47 ms for CeO₂ at natural abundance.`,
r(fig, ctl) {
  const H = [["diamond", 0.011, true], ["Si", 0.047, true], ["4H-SiC", 0.029, true], ["ZnSe", 0.059, true], ["MgO", 0.050, true], ["CeO₂", 0.00025, true], ["GaAs", 1, false], ["AlN", 1, false]];
  let k = 0, pure = false;
  ctl.innerHTML = `<div class="row">${H.map((x, i) => `<button data-k="${i}">${x[0]}</button>`).join("")}</div><div class="row"><button id="pu">Isotope purify (×100 fewer)</button></div><div class="readout" id="ro"></div>`;
  const u = () => {
    pick(ctl, "k", k); $("pu").classList.toggle("on", pure);
    const h = H[k], c = pure && h[2] ? h[1] / 100 : h[1], R = rnd(11 + k);
    let s = "", n = 0;
    for (let i = 0; i < 30; i++) for (let j = 0; j < 16; j++) { const x = 30 + i * 13.5, y = 40 + j * 16, sp = R() < c; if (sp) n++; s += ci(x, y, sp ? 4.5 : 2.5, sp ? C.amber : "var(--b)"); }
    s += ci(30 + 15 * 13.5, 40 + 8 * 16, 7, C.purple, "#fff") + tx(30 + 15 * 13.5, 40 + 8 * 16 - 12, "defect", "middle", "th");
    s += tx(240, 325, `${h[0]}${pure && h[2] ? ", purified" : ""}: ${n} of 480 sites carry a nuclear spin`, "middle", "th");
    if (pure && !h[2]) s += tx(240, 22, "cannot purify: every isotope of these elements has a nuclear spin", "middle", "th", `fill="${C.red}"`);
    // horizontal log bars with names
    s += tx(570, 30, "spinful fraction (log)", "middle", "th");
    const Xb = v => 520 + (Math.log10(Math.max(v, 1e-4)) + 4) / 4 * 140;
    [1e-4, 1e-2, 1].forEach(v => s += ln(Xb(v), 40, Xb(v), 300, "var(--b)", 1, "2 3") + tx(Xb(v), 316, v === 1 ? "100 %" : v === 1e-2 ? "1 %" : "0.01 %", "middle"));
    H.forEach((x, i) => { const y = 46 + i * 31; s += tx(514, y + 13, x[0], "end", i === k ? "th" : "ts") + rc(520, y, Xb(x[1]) - 520, 18, i === k ? C.purple : C.amber, "none", 'fill-opacity="0.8"'); });
    fig.innerHTML = svg(335, s);
    $("ro").innerHTML = `<div><span>spinful fraction c</span><b>${fmt(c * 100, c < 0.001 ? 4 : 2)} %</b></div><div><span>T₂ relative to natural diamond</span><b>× ${fmt(0.011 / c, c > 0.01 ? 2 : 0)}</b></div>`;
  };
  ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { k = +b.dataset.k; u(); });
  $("pu").onclick = () => { pure = !pure; u(); }; u();
},
note: String.raw`<p>Connection to the CeO₂ platform: the 2022 high-throughput study (Kanai, Heremans, Seo, ..., Galli, Awschalom, Ohno, PNAS 119, e2121808119) explicitly builds on the H criteria of this paper and singles out CeO₂ for its almost spin-free lattice. The Awschalom group has since grown Er-doped CeO₂ films on silicon as a telecom spin-photon platform.</p>`},

{ s: "7. What DFT can check", t: "Which criteria a DFT calculation can actually check",
intu: String.raw`The paper's strategy hinges on an honest assessment: first-principles calculations can predict some criteria well, some only partly, and some not at all. Click each row. The spin of a state (D1) and the positions of the gap levels relative to the bands (D4, D5) come out directly. Optical energies (D2) need a trick, constrained DFT, but are reliable. The spin sublevel splitting in D1, and above all the <b>non-radiative spin-selective crossing</b> at the heart of D2 and D3, were beyond 2010 methods. That gap is why the authors do not screen defects blindly: they restrict the search to vacancy complexes that look structurally like NV, betting that similar structure means similar hidden physics, and then let DFT test the parts it can.`,
eq: String.raw`\[ E_{\text{abs}} = E\!\left[a_1^1 e^3;\ Q_g\right] - E\!\left[a_1^2 e^2;\ Q_g\right], \qquad E_{\text{ZPL}} = E\!\left[a_1^1 e^3;\ Q_e\right] - E\!\left[a_1^2 e^2;\ Q_g\right] \]`,
sym: [[String.raw`\(E[\text{config}; Q]\)`, "total DFT energy with a chosen orbital occupation and atomic geometry Q"], [String.raw`\(Q_g, Q_e\)`, "relaxed geometries of the ground and excited configurations"], [String.raw`\(a_1^1 e^3\)`, "constrained occupation: one electron moved from a₁(2) to e in the minority channel"]],
how: [String.raw`Spin: a spin-polarized calculation directly gives \(N_\uparrow - N_\downarrow\).`, String.raw`Gap levels: the Kohn-Sham eigenvalues of Table 1, aligned to the bulk VBM. Hybrid functionals (HSE06) fix most of the band gap problem.`, String.raw`Optical energies: force the excited occupation (constrained DFT) and take total energy differences. Excitonic effects can be added with the Bethe-Salpeter equation.`, String.raw`Non-radiative intersystem crossing needs spin-orbit matrix elements between many-body states plus phonons: out of reach in 2010.`],
say: String.raw`DFT can predict defect spin, level positions and optical energies through constrained occupations, but in 2010 it could not compute the spin-selective non-radiative decay paths, so the authors use structural similarity to NV to choose candidates.`,
num: String.raw`Accuracy check from the paper: NV ZPL 2.02 eV calculated vs 1.945 eV measured (0.08 eV), Franck-Condon shift 0.26 eV vs about 0.25 eV observed. Gaps 5.36 vs 5.47 eV (diamond) and 3.17 vs 3.27 eV (4H-SiC).`,
r(fig, ctl) {
  const R = [["D1 spin of the bound state", 2, "spin-polarized DFT"], ["D1 sublevel splitting (µeV)", 0, "too small for DFT accuracy"], ["D2 optical transition energies", 2, "constrained DFT, Bethe-Salpeter"], ["D2 non-radiative spin-selective path", 0, "beyond first principles (2010)"], ["D3 spin dependent intensity", 0, "needs the non-radiative rates"], ["D3 excited state lifetime", 1, "dipole matrix elements"], ["D3 sublevel ordering", 1, "DFT plus perturbation theory"], ["D4 levels relative to band edges", 2, "gap levels, transition levels"], ["D5 spacing between levels", 2, "gap levels"]];
  let k = 3;
  ctl.innerHTML = `<div class="readout" id="ro"></div>`;
  const u = () => {
    const col = [C.red, C.amber, C.green], word = ["out of reach", "partly", "directly"];
    let s = tx(20, 24, "criterion", "start", "th") + tx(370, 24, "DFT can compute it", "middle", "th") + tx(540, 24, "how", "middle", "th");
    R.forEach(([n, v, how], i) => { const y = 36 + i * 31, on = i === k;
      s += `<g data-r="${i}" style="cursor:pointer">` + rc(14, y, 652, 27, on ? "var(--accent-bg)" : "var(--panel)", on ? "var(--accent)" : "var(--b)", 'rx="5"') + tx(22, y + 18, n, "start", on ? "th" : "t") + rc(320, y + 5, 100, 17, col[v], "none", 'rx="8" fill-opacity="0.8"') + tx(370, y + 18, word[v], "middle", "ts", 'fill="#fff"') + tx(540, y + 18, how, "middle") + `</g>`; });
    fig.innerHTML = svg(320, s);
    fig.querySelectorAll("g[data-r]").forEach(g => g.onclick = () => { k = +g.dataset.r; u(); });
    $("ro").innerHTML = `<div><span>selected</span><b>${R[k][0]}</b></div><div><span>status in 2010</span><b>${word[R[k][1]]}</b></div>`;
  };
  u();
},
note: String.raw`<p>Since 2010, first-principles theory has caught up on part of this list: intersystem crossing rates and Debye-Waller factors of NV and SiC defects have been computed with many-body and electron-phonon methods. Asking the room "which red boxes are still red?" makes a good closing question.</p>`}
],
summary: String.raw`The paper turns NV's success into nine criteria. The defect needs a paramagnetic bound state with an RF splitting (D1), a spin-selective optical pumping cycle (D2), spin-dependent luminescence from a strong spin-conserving transition (D3), optical energies below the ionization thresholds set by the charge transition levels (D4) and levels separated by many \(k_BT\) (D5). The host needs a wide gap (H1), light elements with small spin-orbit coupling (H2), good crystals (H3) and spin-free isotopes so the nuclear bath can be removed (H4). DFT checks D1 spin, D4, D5 and optical energies well, but not the non-radiative spin-selective path, so candidates are chosen by structural analogy to NV.`,
sheet: [
[String.raw`\[ E_{\text{ion}} = E_{\text{CBM}} - \varepsilon(0/-), \quad E_{\text{cap}} = \varepsilon(-/2-) \]`, "D4 thresholds from transition levels"],
[String.raw`\[ h\nu,\ E_{\text{abs}} \lt \min(E_{\text{ion}}, E_{\text{cap}}) \]`, "D4 condition"],
[String.raw`\[ p_u/p_l = e^{-\Delta E/k_BT} \]`, "D5 thermal mixing"],
[String.raw`\[ E_g \gtrsim E_{\text{opt}} + 2\delta \]`, "H1 rule of thumb"],
[String.raw`\[ \Delta_{\text{SO}} = \tfrac32\lambda \sim Z^2 \]`, "H2 spin-orbit scaling"],
[String.raw`\[ T_2 \propto 1/c \]`, "H4 nuclear bath scaling"],
[String.raw`\[ E_{\text{abs}} = E[a_1^1e^3; Q_g] - E[a_1^2e^2; Q_g] \]`, "Constrained DFT"]],
consts: String.raw`\(k_BT\) = 25.9 meV at 300 K. NV⁻ window 2.78 to 5.14 eV, \(\mathrm{N_C V_{Si}^-}\) window 1.60 to 2.83 eV (paper).`,
sources: ["Weber et al., PNAS 107, 8513 (2010), criteria D1 to D5, H1 to H4, Fig. 2 and Methods", "Madelung, Semiconductors: Data Handbook, 3rd ed. (2004), gaps and spin-orbit splittings (paper ref. 29)", "Vurgaftman, Meyer and Ram-Mohan, J. Appl. Phys. 89, 5815 (2001), III-V band parameters", "Kanai et al., PNAS 119, e2121808119 (2022), spin coherence scaling in over 12,000 hosts"]
});
})();

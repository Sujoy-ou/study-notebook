(function () {
/* Journal Club, Weber et al. 2010. Lesson 6: formation energies (Fig. 2, Methods) and optical transitions (Fig. 4).
   The formation energy lines are read by eye from Fig. 2 and rebuilt piecewise: each segment is
   E_f = E0 + q eps_F, with kinks at the charge transition levels. Fig. 4 is rebuilt from its energies. */
const { tx, rc, ln, ci, fmt, sci, C } = JC;
/* defect: list of [q, eStart, eEnd, Ef at eStart] segments */
const seg = (q0, pts) => pts; // documentation helper
const FIG2 = {
  diamond: { Eg: 5.36, defs: [
    { n: "NV", col: C.green, s: [[1, 0, 0.72, 5.45], [0, 0.72, 2.78, 6.17], [-1, 2.78, 5.14, 6.17], [-2, 5.14, 5.36, 3.81]] },
    { n: "V_C", col: C.blue, s: [[1, 0, 1.0, 6.35], [0, 1.0, 1.9, 7.35], [-1, 1.9, 4.7, 7.35], [-2, 4.7, 5.36, 4.55]] },
    { n: "N_C", col: C.red, s: [[1, 0, 3.5, 0.5], [0, 3.5, 4.45, 4.0], [-1, 4.45, 5.36, 4.0]] }],
    shade: [[2.78, 5.14, C.green, "NV⁻"]] },
  sic: { Eg: 3.17, defs: [
    { n: "V_Si", col: "#6b6bf0", s: [[0, 0, 1.38, 7.45], [-1, 1.38, 2.85, 7.45], [-2, 2.85, 3.17, 5.98]] },
    { n: "N_Si", col: C.amber, s: [[1, 0, 2.0, 3.85], [-1, 2.0, 3.17, 5.85]] },
    { n: "N_C V_Si", col: C.green, s: [[0, 0, 1.60, 4.47], [-1, 1.60, 2.83, 4.47], [-2, 2.83, 3.17, 3.24]] },
    { n: "V_C", col: C.blue, s: [[2, 0, 1.35, 2.0], [1, 1.35, 1.6, 4.7], [0, 1.6, 2.85, 4.95], [-1, 2.85, 3.17, 4.95]] },
    { n: "N_C", col: C.red, s: [[1, 0, 3.17, -2.95]] }],
    shade: [[0, 1.38, C.blue, "V_Si⁰"], [1.60, 2.83, C.green, "N_C V_Si⁻"], [2.85, 3.17, C.purple, "V_Si²⁻"]] }
};
const EfAt = (d, e) => { const g = d.s.find(x => e >= x[1] - 1e-9 && e <= x[2] + 1e-9) || d.s[d.s.length - 1]; return { E: g[3] + g[0] * (e - g[1]), q: g[0] }; };
const qs = q => q > 0 ? "+" + q : q < 0 ? "−" + (-q) : "0";

addLesson("jc", "weber", {
level: "Pro",
id: "jc-weber-l6", title: "Formation energies and optical transitions (Fig. 2, Fig. 4)", short: "6. Fig. 2 and Fig. 4",
labels: { note: "Journal club note" },
big: String.raw`This lesson covers the two calculations behind the paper's figures. <b>Formation energy</b> (Fig. 2, Methods) answers "which defect forms, and in which charge state?". It is the energy to build the defect out of a perfect crystal, plus the cost of the atoms and electrons taken from reservoirs. Plotted against the Fermi level it gives straight lines whose slopes are the charge, and the kinks are the charge transition levels used for D1 and D4. The <b>configuration coordinate diagram</b> (Fig. 4) answers "what light does it absorb and emit?". The atoms relax after the electron jumps, so absorption, the zero-phonon line and emission are three different energies, and the relaxation also sets how much light ends up in the phonon sideband. You will rebuild both figures, compute how strongly nitrogen prefers the carbon site in SiC, and see why the SiC center's energies are about half those of NV.`,
cards: [
{ s: "1. The Methods equation", t: "The formation energy, term by term",
intu: String.raw`Think of making the defect as a set of transactions with reservoirs. Start from a perfect supercell of 64 carbon atoms. <b>Remove</b> one carbon and put it into a carbon reservoir: you get back its chemical potential \(\mu_C\). <b>Take</b> a nitrogen atom from a nitrogen reservoir and put it in: you pay \(\mu_N\). <b>Add or remove electrons</b> to reach charge \(q\): each electron comes from, or goes to, the Fermi level \(\varepsilon_F\). The formation energy is what the defective supercell costs compared with the perfect one after all these transactions. Click each term to see which transaction it is. The last term carries all the Fermi level dependence, which is why Fig. 2 is a set of straight lines with slope \(q\).`,
eq: String.raw`\[ E^f[\text{NV}^q] = \underbrace{E_{\text{tot}}[\text{NV}^q] - E_{\text{tot}}[\text{bulk}]}_{\text{supercells}} \underbrace{- \mu_N + \mu_C}_{\text{atoms}} + \underbrace{q\left(\varepsilon_F + \varepsilon_{\text{VBM}}^{\text{bulk}} + \Delta V\right)}_{\text{electrons}} \]`,
sym: [[String.raw`\(E_{\text{tot}}\)`, "DFT total energy of the supercell with and without the defect"], [String.raw`\(\mu_N, \mu_C\)`, "chemical potentials: energy per atom in the N and C reservoirs"], [String.raw`\(q\)`, "charge of the defect, positive if electrons were removed"], [String.raw`\(\varepsilon_F\)`, "Fermi level measured from the VBM"], [String.raw`\(\varepsilon_{\text{VBM}}^{\text{bulk}}\)`, "absolute energy of the bulk VBM in the calculation"], [String.raw`\(\Delta V\)`, "potential alignment between the defect supercell and the bulk"]],
how: [String.raw`Energy is conserved in the bookkeeping: what leaves the crystal goes to a reservoir at its chemical potential.`, String.raw`For diamond, \(\mu_C\) is simply the energy per atom of bulk diamond. In SiC, \(\mu_C\) and \(\mu_{Si}\) can vary between C-rich and Si-rich growth, which is why Fig. 2B says "C-rich".`, String.raw`A defect with charge \(q\) has given \(q\) electrons to the electron reservoir at \(\varepsilon_F\), worth \(q\varepsilon_F\) relative to the VBM.`, String.raw`Charged supercells need finite-size corrections (Freysoldt, Neugebauer and Van de Walle 2009), and \(\Delta V\) lines up the potentials.`],
say: String.raw`The formation energy of a defect in charge state q is the total energy difference between defective and perfect supercells, corrected by the chemical potentials of the atoms exchanged and by q times the Fermi level for the electrons exchanged.`,
num: String.raw`Supercells in the paper: 64 atoms (diamond) and 96 atoms (4H-SiC), HSE06 hybrid functional, 400 eV cutoff, 2 × 2 × 2 k-points, VASP with PAW potentials.`,
r(fig, ctl) {
  let k = 0; const T = ["supercells", "remove C", "add N", "electrons"];
  ctl.innerHTML = `<div class="row">${T.map((t, i) => `<button data-k="${i}">${t}</button>`).join("")}</div>`;
  const u = () => {
    pick(ctl, "k", k);
    const box = (x, y, lab, mode) => { let s = rc(x, y, 150, 150, "var(--panel)", "var(--p)", 'rx="6"'); for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) { const cx = x + 18 + i * 23, cy = y + 18 + j * 23; const isV = mode && i === 2 && j === 2, isN = mode === 2 && i === 3 && j === 2; s += isV ? `<circle cx="${cx}" cy="${cy}" r="7" fill="none" stroke="var(--p)" stroke-dasharray="3 2"/>` : ci(cx, cy, 6, isN ? C.blue : "var(--gray-bg)", "var(--p)"); } return s + tx(x + 75, y + 172, lab, "middle", "th"); };
    let s = box(20, 30, "perfect, 64 C", 0) + box(250, 30, k >= 2 ? "NV" + (k >= 3 ? "⁻" : "⁰") : k >= 1 ? "vacancy" : "with defect", k >= 2 ? 2 : k >= 1 ? 1 : 2);
    s += `<line x1="180" y1="105" x2="242" y2="105" stroke="var(--p)" stroke-width="2" marker-end="url(#ar)"/>`;
    // reservoirs
    const res = (x, y, lab, col, on) => rc(x, y, 110, 46, col, on ? "var(--t)" : "none", `rx="8" fill-opacity="${on ? 0.45 : 0.15}"${on ? ' stroke-width="2"' : ""}`) + tx(x + 55, y + 28, lab, "middle", "th");
    s += res(450, 20, "C reservoir μ_C", C.gray, k === 1) + res(450, 80, "N reservoir μ_N", C.blue, k === 2) + res(450, 140, "electrons at ε_F", C.coral, k === 3);
    if (k === 1) s += `<path d="M330 100 Q 400 50 446 44" fill="none" stroke="var(--p)" stroke-width="2" marker-end="url(#ar)"/>` + tx(395, 60, "+ μ_C", "middle", "th");
    if (k === 2) s += `<path d="M446 104 Q 400 110 355 104" fill="none" stroke="${C.blue}" stroke-width="2" marker-end="url(#ar)"/>` + tx(400, 125, "− μ_N", "middle", "th");
    if (k === 3) s += `<path d="M446 164 Q 400 160 360 130" fill="none" stroke="${C.coral}" stroke-width="2" marker-end="url(#ar)"/>` + tx(400, 185, "q(ε_F + ...), q = −1", "middle", "th");
    if (k === 0) s += tx(330, 230, "E_tot[defect] − E_tot[bulk]: the raw DFT energy difference", "middle", "th");
    const txt = ["Two DFT calculations, same supercell size, one with the defect.", "The carbon atom that left goes to a reservoir at μ_C (bulk diamond per atom).", "The nitrogen came from a reservoir at μ_N, so we pay μ_N.", "One extra electron for NV⁻ came from the Fermi level: q = −1 adds −ε_F."][k];
    s += tx(340, 260, txt, "middle");
    // term highlight bar
    const terms = ["E_tot[NV^q] − E_tot[bulk]", "+ μ_C", "− μ_N", "+ q(ε_F + ε_VBM + ΔV)"];
    let x = 40; terms.forEach((t, i) => { const w = t.length * 7.4 + 16; s += rc(x, 285, w, 30, i === k ? "var(--accent-bg)" : "var(--sunk)", i === k ? "var(--accent)" : "none", 'rx="5"') + tx(x + w / 2, 305, t, "middle", i === k ? "th" : "t"); x += w + 8; });
    fig.innerHTML = svg(330, s);
  };
  ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { k = +b.dataset.k; u(); }); u();
}},

{ s: "2. Fig. 2 rebuilt", t: "Formation energy against Fermi level: slopes are charges",
intu: String.raw`Here is Fig. 2, rebuilt from the paper's lines. Each defect has one line per charge state, \(E^f = E_0 + q\,\varepsilon_F\), and only the lowest one at each Fermi level is drawn, so the curve is a lower envelope with kinks. The <b>slope</b> of a segment is the charge \(q\). The <b>kinks</b> are the charge transition levels, where the defect gains an electron. Slide the Fermi level and read off each defect's charge state and formation energy. Switch to SiC to see the three shaded windows of the paper: \(\mathrm{V_{Si}^0}\) (blue), \(\mathrm{N_C V_{Si}^-}\) (green) and \(\mathrm{V_{Si}^{2-}}\) (purple). Notice how far below everything else \(\mathrm{N_C}\) lies in SiC, while \(\mathrm{N_{Si}}\) sits more than 4 eV higher: nitrogen will essentially never sit on a silicon site.`,
eq: String.raw`\[ E^f_q(\varepsilon_F) = E^f_q(0) + q\,\varepsilon_F, \qquad \varepsilon(q/q') = \frac{E^f_{q'}(0) - E^f_q(0)}{q - q'} \]`,
sym: [[String.raw`\(E^f_q(0)\)`, "formation energy of charge state q with the Fermi level at the VBM"], [String.raw`\(\varepsilon(q/q')\)`, "charge transition level: Fermi level where lines q and q' cross"], [String.raw`\(q\)`, "charge state, equal to the slope \\(dE^f/d\\varepsilon_F\\)"]],
how: [String.raw`The Fermi level enters only through \(q\varepsilon_F\), so each charge state is a straight line of slope \(q\).`, String.raw`At any \(\varepsilon_F\) the stable state is the one with the lowest \(E^f\): take the lower envelope.`, String.raw`Set \(E^f_q = E^f_{q'}\) and solve for \(\varepsilon_F\) to get the transition level.`, String.raw`For NV the paper finds stability windows for +1, 0, −1 and −2, with NV⁻ from 2.78 to 5.14 eV.`],
say: String.raw`In a formation energy diagram each charge state is a line of slope q, the lowest line gives the stable charge state, and the kinks of the envelope are the charge transition levels.`,
num: String.raw`Diamond: NV⁻ window 2.78 to 5.14 eV (paper). SiC (C-rich): \(\mathrm{N_C V_{Si}^-}\) 1.60 to 2.83 eV, \(\mathrm{V_{Si}^{2-}}\) within about 0.3 eV of the CBM, \(\mathrm{V_{Si}^0}\) up to about 1.4 eV. Other kink positions here are read from the figure, to about ±0.1 eV.`,
r(fig, ctl) {
  let h = "diamond";
  ctl.innerHTML = `<div class="row"><button data-h="diamond">A. Diamond</button><button data-h="sic">B. 4H-SiC, C-rich</button></div>` + sl("ef", "Fermi level ε_F (eV)", 0, 5.36, 0.01, 3.5) + `<div class="readout" id="ro"></div>`;
  const u = () => {
    pick(ctl, "h", h);
    const D = FIG2[h], ef = Math.min(+$("ef").value, D.Eg); $("efv").textContent = fmt(ef, 2) + " eV";
    const F = JC.frame(70, 20, 420, 290, { xmin: 0, xmax: D.Eg, ymin: -3, ymax: 9, xt: h === "diamond" ? [0, 1, 2, 3, 4, 5] : [0, 1, 2, 3], yt: [-2, 0, 2, 4, 6, 8], xl: "Fermi level (eV)", yl: "formation energy (eV)", grid: true });
    let s = "";
    D.shade.forEach(([a, b, col, l]) => s += rc(F.X(a), 20, F.X(b) - F.X(a), 290, col, "none", 'fill-opacity="0.15"'));
    s += F.s;
    D.defs.forEach(d => {
      d.s.forEach(g => { s += ln(F.X(g[1]), F.Y(g[3]), F.X(g[2]), F.Y(g[3] + g[0] * (g[2] - g[1])), d.col, 3); });
      d.s.slice(1).forEach(g => s += ci(F.X(g[1]), F.Y(g[3]), 3.5, d.col));
      const lab = d.s[0]; s += tx(F.X(lab[1]) + 6, F.Y(lab[3]) - 8, d.n.replace("_C", "_C").replace("V_", "V_"), "start", "th", `fill="${d.col}"`);
    });
    s += ln(F.X(ef), 20, F.X(ef), 310, "var(--t)", 1.5, "5 3");
    // readout list on the right
    s += tx(580, 30, `at ε_F = ${fmt(ef, 2)} eV`, "middle", "th");
    D.defs.forEach((d, i) => { const r = EfAt(d, ef); s += ci(510, 58 + i * 34, 6, d.col) + tx(522, 62 + i * 34, `${d.n}: q = ${qs(r.q)}`, "start", "th") + tx(522, 78 + i * 34, `E_f = ${fmt(r.E, 2)} eV`, "start"); });
    fig.innerHTML = svg(345, s);
    const nv = D.defs.find(d => d.n === "NV" || d.n === "N_C V_Si"), r = EfAt(nv, ef);
    $("ro").innerHTML = `<div><span>${nv.n} charge</span><b>${qs(r.q)}</b></div><div><span>${nv.n} formation energy</span><b>${fmt(r.E, 2)} eV</b></div>`;
  };
  ctl.querySelectorAll("button[data-h]").forEach(b => b.onclick = () => { h = b.dataset.h; $("ef").max = FIG2[h].Eg; if (+$("ef").value > FIG2[h].Eg) $("ef").value = FIG2[h].Eg / 2; u(); });
  $("ef").oninput = u; u();
},
note: String.raw`<p>The lines here are digitized by eye from Fig. 2, except the window edges quoted in the text (2.78, 5.14, 1.60, 2.83 eV). Treat other kinks as ±0.1 eV.</p>`},

{ s: "3. How many form", t: "How many defects form, and where nitrogen sits in SiC",
intu: String.raw`The formation energy sets the equilibrium concentration through a Boltzmann factor: every extra eV of formation energy makes the defect rarer by a huge factor. The paper uses this to settle where nitrogen goes in SiC. On a carbon site its formation energy is more than 4 eV lower than on a silicon site, so at any realistic growth temperature the ratio of \(\mathrm{N_{Si}}\) to \(\mathrm{N_C}\) is something like one in \(10^{10}\). Therefore the only nitrogen-vacancy center that can form is \(\mathrm{N_C}\) next to a silicon vacancy, \(\mathrm{N_C V_{Si}}\). Slide the energy difference and the temperature. The paper adds an honest caveat: the Boltzmann law strictly holds only in equilibrium, but even for implantation the size of \(E^f\) is a good guide to what forms.`,
eq: String.raw`\[ C = N_S\, e^{-E^f / k_B T}, \qquad \frac{C[\mathrm{N_{Si}}]}{C[\mathrm{N_C}]} = e^{-\left(E^f[\mathrm{N_{Si}}] - E^f[\mathrm{N_C}]\right)/k_B T} \]`,
sym: [[String.raw`\(C\)`, "defect concentration (per cm³)"], [String.raw`\(N_S\)`, "number of possible sites per cm³ (here the two sublattices of SiC have the same \\(N_S\\))"], [String.raw`\(E^f\)`, "formation energy at the relevant Fermi level"], [String.raw`\(T\)`, "temperature at which defects equilibrate (growth or anneal)"]],
how: [String.raw`Each site can be empty or occupied by the defect. Minimizing the free energy with the configurational entropy gives a Boltzmann factor.`, String.raw`For two ways to place the same nitrogen atom, the ratio of concentrations depends only on the difference of formation energies.`, String.raw`Both formation energies use the same \(\mu_N\), so it cancels in the difference.`, String.raw`At 2000 K, \(k_BT\) = 0.172 eV, so 4 eV gives \(e^{-23}\).`],
say: String.raw`Since the formation energy of nitrogen on a silicon site exceeds that on a carbon site by more than 4 eV, nitrogen sits on carbon sites in SiC and the only NV analog that forms is \(\mathrm{N_C V_{Si}}\).`,
num: String.raw`4H-SiC has \(4.8 \times 10^{22}\) Si sites per cm³. With \(\Delta E^f\) = 4.5 eV at 2000 K the ratio is \(e^{-26} \approx 5 \times 10^{-12}\). Even at 3000 K it is \(3 \times 10^{-8}\).`,
r(fig, ctl) {
  ctl.innerHTML = sl("dE", "E_f(N_Si) − E_f(N_C) (eV)", 0, 7, 0.05, 4.5) + sl("T", "Temperature (K)", 300, 3000, 10, 2000) + `<div class="readout" id="ro"></div>`;
  const u = () => {
    const dE = +$("dE").value, T = +$("T").value, r = Math.exp(-dE / (JC.kB * T)); $("dEv").textContent = fmt(dE, 2) + " eV"; $("Tv").textContent = T + " K";
    const F = JC.frame(80, 30, 330, 240, { xmin: 0, xmax: 7, ymin: 1e-20, ymax: 1, ylog: true, xt: [0, 1, 2, 3, 4, 5, 6, 7], yt: [1e-20, 1e-15, 1e-10, 1e-5, 1], yf: v => v === 1 ? "1" : "10" + ({ "-20": "⁻²⁰", "-15": "⁻¹⁵", "-10": "⁻¹⁰", "-5": "⁻⁵" })[Math.round(Math.log10(v))], xl: "formation energy difference (eV)", yl: "N_Si / N_C", grid: true });
    const xs = range(0, 7, 200); let s = F.s;
    [[1000, C.teal], [2000, C.coral], [3000, C.purple]].forEach(([t, col]) => s += JC.path(F, xs, xs.map(x => Math.max(1e-20, Math.exp(-x / (JC.kB * t)))), col, 1.5, "4 3") + tx(F.X(6.9), F.Y(Math.max(1e-20, Math.exp(-6.9 / (JC.kB * t)))) - 6, t + " K", "end", "ts", `fill="${col}"`));
    s += JC.path(F, xs, xs.map(x => Math.max(1e-20, Math.exp(-x / (JC.kB * T)))), "var(--t)", 2.5) + ci(F.X(dE), F.Y(Math.max(1e-20, r)), 6, C.red, "#fff");
    // site picture
    const sx = 470, sy = 60; let k = 0;
    s += tx(565, 40, "100 nitrogen atoms in SiC", "middle", "th");
    const nSi = Math.min(100, Math.round(100 * r / (1 + r)));
    for (let i = 0; i < 100; i++) { const x = sx + (i % 10) * 19, y = sy + Math.floor(i / 10) * 19; const onSi = i < nSi; s += ci(x, y, 7, onSi ? C.amber : C.blue); }
    s += tx(565, 270, `${100 - nSi} on C sites, ${nSi} on Si sites`, "middle", "th") + tx(565, 288, nSi === 0 ? `(expected on Si: ${(100 * r).toExponential(1)})` : "", "middle");
    fig.innerHTML = svg(320, s);
    $("ro").innerHTML = `<div><span>k_BT</span><b>${fmt(JC.kB * T * 1000, 0)} meV</b></div><div><span>N_Si / N_C</span><b>${sci(r, 1)}</b></div>`;
  };
  $("dE").oninput = u; $("T").oninput = u; u();
}},

{ s: "4. Fig. 4 rebuilt", t: "Absorption, zero-phonon line and emission on one diagram",
intu: String.raw`When the electron jumps, the atoms around the defect feel different forces and want to move. Fig. 4 draws the total energy against a single <b>generalized coordinate</b> \(Q\) that measures this motion. Light is fast and atoms are slow, so absorption is a vertical arrow (red): the electron jumps at the ground state geometry and lands high on the excited parabola. The atoms then relax to the excited minimum, losing the <b>Franck-Condon shift</b> \(d_e\) as heat. Emission is vertical again (blue), landing high on the ground parabola, which then relaxes by \(d_g\). The <b>zero-phonon line</b> (ZPL, green) connects the two minima. In the paper the energies come from constrained DFT: move one electron from \(a_1(2)\) to \(e\), keep or relax the atoms. Pick NV or the SiC center and move the sliders.`,
eq: String.raw`\[ E_g(Q) = \tfrac12 k_g Q^2, \qquad E_e(Q) = E_{\text{ZPL}} + \tfrac12 k_e (Q - \Delta Q)^2 \]\[ E_{\text{abs}} = E_{\text{ZPL}} + d_e, \qquad E_{\text{em}} = E_{\text{ZPL}} - d_g, \qquad d_{e,g} = \tfrac12 k_{e,g}\,\Delta Q^2 \]`,
sym: [[String.raw`\(Q\)`, "generalized coordinate: how far the atoms have moved along the relaxation path"], [String.raw`\(\Delta Q\)`, "shift of the equilibrium geometry between ground and excited state"], [String.raw`\(k_g, k_e\)`, "curvatures (stiffness) of the two parabolas"], [String.raw`\(d_e, d_g\)`, "Franck-Condon relaxation energies in the excited and ground state"], [String.raw`\(E_{\text{ZPL}}\)`, "energy difference between the two minima"]],
how: [String.raw`Born-Oppenheimer: electrons adjust instantly, so for each \(Q\) there is one energy per electronic state.`, String.raw`Near each minimum the energy is a parabola (harmonic approximation).`, String.raw`Franck-Condon principle: optical transitions are vertical, at fixed \(Q\).`, String.raw`Read the arrows: absorption from the ground minimum (\(Q = 0\)) ends \(d_e\) above the excited minimum, and emission from the excited minimum (\(Q = \Delta Q\)) ends \(d_g\) above the ground minimum.`],
say: String.raw`In a configuration coordinate diagram, vertical absorption and emission bracket the zero-phonon line, offset by the Franck-Condon relaxation energies of the excited and ground states.`,
num: String.raw`NV⁻ (paper): absorption 2.27, ZPL 2.02, emission 1.80 eV, so \(d_e = 0.25\) and \(d_g = 0.22\) eV (paper: Franck-Condon shift 0.26 eV). Experiment: ZPL 1.945 eV. \(\mathrm{N_C V_{Si}^-}\): absorption 1.15, ZPL 1.09 eV, so \(d_e = 0.06\) eV, more than 75 % smaller.`,
r(fig, ctl) {
  const PR = [["NV⁻ diamond", 2.02, 0.25, 0.22], ["N_C V_Si⁻ 4H-SiC", 1.09, 0.06, 0.06]];
  let p = 0;
  ctl.innerHTML = `<div class="row">${PR.map((x, i) => `<button data-p="${i}">${x[0]}</button>`).join("")}</div>` + sl("z", "ZPL (eV)", 0.5, 3, 0.01, 2.02) + sl("de", "Excited relaxation d_e (eV)", 0, 0.6, 0.01, 0.25) + sl("dg", "Ground relaxation d_g (eV)", 0, 0.6, 0.01, 0.22) + `<div class="readout" id="ro"></div>`;
  const u = () => {
    pick(ctl, "p", p);
    const z = +$("z").value, de = +$("de").value, dg = +$("dg").value; $("zv").textContent = fmt(z, 2) + " eV"; $("dev").textContent = fmt(de, 2) + " eV"; $("dgv").textContent = fmt(dg, 2) + " eV";
    const top = z + de + 0.5;
    const F = JC.frame(70, 20, 420, 300, { xmin: -1.3, xmax: 2.3, ymin: -0.15, ymax: top, yt: [0, Math.round(z * 10) / 10], xl: "generalized coordinate Q", yl: "energy (eV)" });
    let s = F.s; const qs2 = range(-1.3, 2.3, 200);
    const hw = Math.sqrt((top - z) / Math.max(de, 1e-3)), qe = range(Math.max(-1.3, 1 - hw), Math.min(2.3, 1 + hw), 200), hg = Math.min(1.3, Math.sqrt(top / Math.max(dg, 1e-3))), qg = range(-hg, Math.min(2.3, hg), 200);
    s += JC.path(F, qg, qg.map(q => dg * q * q), "var(--t)", 2.5) + JC.path(F, qe, qe.map(q => z + de * (q - 1) ** 2), "var(--t)", 2.5);
    s += ln(F.X(-1.2), F.Y(0), F.X(1.3), F.Y(0), "var(--p)", 1, "4 3") + ln(F.X(-0.2), F.Y(z), F.X(2.2), F.Y(z), "var(--p)", 1, "4 3");
    s += `<line x1="${F.X(0)}" y1="${F.Y(0)}" x2="${F.X(0)}" y2="${F.Y(z + de)}" stroke="${C.red}" stroke-width="3" marker-end="url(#ar)"/>` + tx(F.X(0) - 8, F.Y((z + de) / 2), `absorption ${fmt(z + de, 2)}`, "end", "th", `fill="${C.red}"`);
    s += `<line x1="${F.X(1)}" y1="${F.Y(z)}" x2="${F.X(1)}" y2="${F.Y(dg)}" stroke="${C.blue}" stroke-width="3" marker-end="url(#ar)"/>` + tx(F.X(1) + 8, F.Y((z + dg) / 2) + 20, `emission ${fmt(z - dg, 2)}`, "start", "th", `fill="${C.blue}"`);
    s += `<line x1="${F.X(1) - 6}" y1="${F.Y(z)}" x2="${F.X(0) + 6}" y2="${F.Y(0)}" stroke="${C.green}" stroke-width="2.5" stroke-dasharray="6 4" marker-end="url(#ar)"/>` + tx(F.X(0.5) + 8, F.Y(z / 2), `ZPL ${fmt(z, 2)}`, "start", "th", `fill="${C.green}"`);
    s += tx(F.X(1.7), F.Y(z + de * 0.49) - 6, "excited ³E", "middle") + tx(F.X(-0.9), F.Y(dg * 0.81) - 8, "ground ³A₂", "middle");
    // energy ladder on the right
    s += tx(590, 40, "three energies", "middle", "th");
    [[z + de, "absorption", C.red], [z, "ZPL", C.green], [z - dg, "emission", C.blue]].forEach(([v, l, col], i) => s += rc(515, 60 + i * 70, 140 * v / 2.6, 26, col, "none", 'fill-opacity="0.75"') + tx(515, 100 + i * 70, `${l}: ${fmt(v, 2)} eV`, "start", "th") + tx(515, 115 + i * 70, `${fmt(JC.hc / v, 0)} nm`, "start"));
    s += tx(590, 290, `Stokes shift ${fmt(de + dg, 2)} eV`, "middle", "th");
    fig.innerHTML = svg(345, s);
    $("ro").innerHTML = `<div><span>absorption</span><b>${fmt(z + de, 2)} eV</b></div><div><span>ZPL</span><b>${fmt(z, 2)} eV, ${fmt(JC.hc / z, 0)} nm</b></div><div><span>emission</span><b>${fmt(z - dg, 2)} eV</b></div>`;
  };
  const set = i => { p = i; $("z").value = PR[i][1]; $("de").value = PR[i][2]; $("dg").value = PR[i][3]; u(); };
  ctl.querySelectorAll("button[data-p]").forEach(b => b.onclick = () => set(+b.dataset.p));
  ["z", "de", "dg"].forEach(id => $(id).oninput = u); set(0);
},
note: String.raw`<p>In Fig. 4B both the emission and the ZPL of \(\mathrm{N_C V_{Si}^-}\) are labeled 1.09 eV, yet the drawn emission arrow ends above the ground state minimum, so the emission must be lower than the ZPL. It looks like a labeling slip. The preset here assumes a ground relaxation equal to the excited one (0.06 eV), giving emission near 1.03 eV. Worth asking the room how they would check it.</p>`},

{ s: "5. Phonon sideband", t: "How much light is in the zero-phonon line? Huang-Rhys and Debye-Waller",
intu: String.raw`The relaxation energy of Fig. 4 decides the shape of the emission spectrum. In emission the defect lands on the ground parabola with some vibrational energy, released as phonons of energy \(\hbar\omega\). The average number of phonons emitted is the <b>Huang-Rhys factor</b> \(S = d_g/\hbar\omega\), and the probability of emitting exactly \(n\) phonons follows a Poisson distribution. Only the \(n = 0\) part comes out in the sharp zero-phonon line. That fraction, the <b>Debye-Waller factor</b> \(e^{-S}\), is what matters for quantum optics, where photons from two defects must be identical. For NV, \(S \approx 3.4\) leaves only about 3 % of the light in the ZPL, with the rest in a broad red sideband. The SiC center of Fig. 4B relaxes four times less, which (if its phonon energy is similar) means a much stronger ZPL. Slide \(d_g\) and \(\hbar\omega\).`,
eq: String.raw`\[ S = \frac{d_g}{\hbar\omega}, \qquad P_n = e^{-S}\frac{S^n}{n!}, \qquad \text{DW} = P_0 = e^{-S} \]\[ I(E) \propto \sum_n P_n\, g\!\left(E - E_{\text{ZPL}} + n\hbar\omega\right) \]`,
sym: [[String.raw`\(S\)`, "Huang-Rhys factor, mean number of phonons emitted per photon"], [String.raw`\(\hbar\omega\)`, "effective phonon energy of the relaxation mode"], [String.raw`\(P_n\)`, "probability of emitting n phonons with the photon"], [String.raw`\(\text{DW}\)`, "Debye-Waller factor, fraction of light in the ZPL"], [String.raw`\(g\)`, "line shape of each replica (broadened here for display)"]],
how: [String.raw`Model the relaxation as one harmonic mode of energy \(\hbar\omega\) whose equilibrium position shifts by \(\Delta Q\).`, String.raw`The overlap of the shifted and unshifted vibrational wavefunctions gives Poisson weights with mean \(S\).`, String.raw`The mean phonon energy released is \(S\hbar\omega\), and that must equal the relaxation energy \(d_g\).`, String.raw`The zero-phonon fraction is the \(n = 0\) Poisson weight, \(e^{-S}\).`],
say: String.raw`The Huang-Rhys factor S, the relaxation energy divided by the phonon energy, sets the Poisson distribution of phonon replicas, and only the fraction \(e^{-S}\) of the emission falls in the zero-phonon line.`,
num: String.raw`NV: \(d_g = 0.22\) eV, \(\hbar\omega \approx 65\) meV, \(S \approx 3.4\), DW \(\approx e^{-3.4} = 3.3\) % (measured about 3 to 4 %). If \(d_g = 0.06\) eV and \(\hbar\omega = 40\) meV for the SiC center, \(S = 1.5\) and DW \(\approx\) 22 %. That phonon energy is an assumption.`,
r(fig, ctl) {
  ctl.innerHTML = `<div class="row"><button data-p="0">NV⁻</button><button data-p="1">N_C V_Si⁻ (assumed ħω)</button></div>` + sl("dg", "Relaxation d_g (eV)", 0.01, 0.5, 0.005, 0.22) + sl("w", "Phonon ħω (meV)", 20, 120, 1, 65) + sl("z", "ZPL (eV)", 0.8, 2.5, 0.005, 1.945) + `<div class="readout" id="ro"></div>`;
  const u = () => {
    const dg = +$("dg").value, w = +$("w").value / 1000, z = +$("z").value, S = dg / w; $("dgv").textContent = fmt(dg, 3) + " eV"; $("wv").textContent = $("w").value + " meV"; $("zv").textContent = fmt(z, 3) + " eV";
    const P = n => { let f = 1; for (let k = 2; k <= n; k++) f *= k; return Math.exp(-S) * Math.pow(S, n) / f; };
    const lo = z - 0.75, Es = range(lo, z + 0.08, 500), sig = 0.022, I = Es.map(E => { let v = 0; for (let n = 1; n < 25; n++) v += P(n) * Math.exp(-((E - z + n * w) ** 2) / (2 * (sig * Math.sqrt(n)) ** 2)) / (sig * Math.sqrt(n)); return v; });
    const zp = P(0) / 0.004, mx = Math.max(...I, zp * 0.25) * 1.1;
    const F = JC.frame(70, 30, 560, 200, { xmin: lo, xmax: z + 0.08, ymin: 0, ymax: mx, xt: [Math.round(lo * 10) / 10, Math.round((lo + 0.4) * 10) / 10, Math.round(z * 100) / 100], xf: v => fmt(v, 2), xl: "photon energy (eV)", yl: "emission intensity" });
    let s = F.s + `<path d="M${F.X(lo)} ${F.Y(0)} ` + Es.map((E, i) => `L${F.X(E).toFixed(1)} ${F.Y(I[i]).toFixed(1)}`).join(" ") + ` L${F.X(z + 0.08)} ${F.Y(0)} Z" fill="${C.red}" fill-opacity="0.25" stroke="${C.red}" stroke-width="1.5"/>`;
    s += ln(F.X(z), F.Y(0), F.X(z), Math.max(30, F.Y(Math.min(zp, mx))), C.green, 4) + tx(F.X(z), 24, "ZPL", "middle", "th", `fill="${C.green}"`);
    s += ln(70, 320, 630, 320, "var(--p)"); let pm = 0; for (let n = 0; n < 12; n++) pm = Math.max(pm, P(n));
    for (let n = 0; n < 12; n++) { const x = F.X(z - n * w); if (x > 70) s += rc(x - 6, 320 - P(n) / pm * 40, 12, P(n) / pm * 40, n ? C.purple : C.green, "none", 'fill-opacity="0.8"') + (n < 7 ? tx(x, 334, n, "middle") : ""); }
    s += tx(630, 290, "Poisson weight of n phonons", "end");
    fig.innerHTML = svg(345, s);
    $("ro").innerHTML = `<div><span>Huang-Rhys S</span><b>${fmt(S, 2)}</b></div><div><span>Debye-Waller e⁻ˢ</span><b>${fmt(100 * Math.exp(-S), 1)} %</b></div><div><span>ZPL wavelength</span><b>${fmt(JC.hc / z, 0)} nm</b></div>`;
  };
  ctl.querySelectorAll("button[data-p]").forEach(b => b.onclick = () => { const q = +b.dataset.p; $("dg").value = q ? 0.06 : 0.22; $("w").value = q ? 40 : 65; $("z").value = q ? 1.09 : 1.945; u(); });
  ["dg", "w", "z"].forEach(id => $(id).oninput = u); u();
}},

{ s: "6. Why SiC is smaller", t: "Why the SiC center's energies are about half: a bigger lattice",
intu: String.raw`The paper explains the halving of the SiC energies with one geometric fact. In both materials the vacancy is surrounded by carbon atoms, but SiC has a larger lattice: the carbon neighbors of a silicon vacancy are 0.31 nm apart instead of 0.25 nm. Dangling bond overlap falls off quickly with distance, so the hopping \(\beta\) is smaller, and every splitting built from it (lesson 5) shrinks: the gap between \(a_1(2)\) and \(e\), the optical transition, and also how much the atoms are pushed around when the electron jumps, so the relaxation energies shrink even more. Slide the distance between the dangling bonds and watch the overlap and the splitting. The decay length is fitted so that the two real cases reproduce the majority \(a_1(2)\) to \(e\) splittings of Table 1.`,
eq: String.raw`\[ |\beta(d)| = |\beta_0|\, e^{-(d - d_0)/\lambda}, \qquad \Delta_{a_1(2)\text{-}e} \propto |\beta| \]`,
sym: [[String.raw`\(d\)`, "distance between neighboring dangling bond sites around the vacancy"], [String.raw`\(d_0\)`, "the diamond value, 0.252 nm"], [String.raw`\(\lambda\)`, "decay length of the overlap (fitted here)"], [String.raw`\(\Delta_{a_1(2)\text{-}e}\)`, "splitting between a₁(2) and e"]],
how: [String.raw`The overlap of two orbital tails decays roughly exponentially with their separation.`, String.raw`In lesson 5 every splitting is a multiple of \(\beta\) (\(4|\beta|\) for \(a_1\) to \(t_2\), and the \(C_{3v}\) splittings).`, String.raw`Table 1, majority channel: NV⁻ \(e - a_1(2) = 2.33 - 1.31 = 1.02\) eV, \(\mathrm{N_C V_{Si}^-}\) \(0.31 - 0.06 = 0.25\) eV (average of \(e_x\) and \(e_y\)), a factor 4.`, String.raw`Fit: \(e^{-(0.307 - 0.252)/\lambda} = 0.25\) gives \(\lambda \approx 0.04\) nm. The optical energies only halve, because they also include exchange and correlation terms that do not scale with \(\beta\).`],
say: String.raw`The larger lattice constant of SiC spreads the carbon dangling bonds around the silicon vacancy further apart, reducing their overlap and therefore the level splittings, transition energies and relaxation energies compared with NV in diamond.`,
num: String.raw`Paper: vertical transitions about half (2.27 → 1.15 eV absorption), relaxation more than 75 % smaller (0.25 → 0.06 eV). C to C distance across the vacancy: \(a/\sqrt2\) = 0.252 nm in diamond, \(a\) = 0.307 nm in 4H-SiC. ZPL 1.09 eV is 1.14 µm, in the near infrared.`,
r(fig, ctl) {
  ctl.innerHTML = `<div class="row"><button data-d="0.252">diamond 0.252 nm</button><button data-d="0.307">4H-SiC 0.307 nm</button></div>` + sl("d", "DB separation d (nm)", 0.22, 0.36, 0.001, 0.252) + `<div class="readout" id="ro"></div>`;
  const lam = 0.055 / Math.log(1.02 / 0.25);
  const u = () => {
    const d = +$("d").value; $("dv").textContent = fmt(d, 3) + " nm";
    ctl.querySelectorAll("button[data-d]").forEach(b => b.classList.toggle("on", Math.abs(+b.dataset.d - d) < 0.0015));
    const r = Math.exp(-(d - 0.252) / lam), split = 1.02 * r;
    // two lobes
    const sc = 900, cx = 200, y = 110, xa = cx - d * sc / 2, xb = cx + d * sc / 2;
    let s = tx(200, 30, "two dangling bonds facing each other", "middle", "th");
    s += `<defs><radialGradient id="lg6"><stop offset="0" stop-color="${C.coral}" stop-opacity="0.8"/><stop offset="1" stop-color="${C.coral}" stop-opacity="0"/></radialGradient></defs>`;
    s += `<ellipse cx="${xa + 55}" cy="${y}" rx="90" ry="38" fill="url(#lg6)"/><ellipse cx="${xb - 55}" cy="${y}" rx="90" ry="38" fill="url(#lg6)"/>`;
    s += ci(xa, y, 13, "var(--gray-bg)", "var(--p)") + tx(xa, y + 5, "C", "middle", "th") + ci(xb, y, 13, "var(--gray-bg)", "var(--p)") + tx(xb, y + 5, "C", "middle", "th");
    s += `<line x1="${xa}" y1="${y + 50}" x2="${xb}" y2="${y + 50}" stroke="var(--p)" marker-end="url(#ar)" marker-start="url(#ar)"/>` + tx(cx, y + 68, `d = ${fmt(d, 3)} nm`, "middle", "th");
    s += rc(80, 210, 240, 16, "var(--sunk)") + rc(80, 210, 240 * Math.min(1, r / 1.5), 16, C.coral) + tx(200, 246, `relative overlap |β|/|β₀| = ${fmt(r, 2)}`, "middle");
    // level splitting
    const B = JC.bands(420, 30, 240, 280, 3.4, -0.4, 3.6, false);
    const yA = B.Y(1.0), yE = B.Y(1.0 + split);
    s += ln(450, yA, 540, yA, C.purple, 3) + tx(548, yA + 4, "a₁(2)", "start") + ln(450, yE, 540, yE, C.coral, 3) + tx(548, yE + 4, "e", "start");
    s += `<line x1="600" y1="${yA}" x2="600" y2="${yE}" stroke="var(--p)" marker-end="url(#ar)" marker-start="url(#ar)"/>` + tx(606, (yA + yE) / 2 + 4, fmt(split, 2) + " eV", "start", "th");
    s += tx(540, 22, "a₁(2) to e splitting (majority)", "middle", "th");
    fig.innerHTML = svg(320, s);
    $("ro").innerHTML = `<div><span>splitting (model)</span><b>${fmt(split, 2)} eV</b></div><div><span>Table 1</span><b>NV⁻ 1.02, N_C V_Si⁻ 0.25</b></div><div><span>fitted λ</span><b>${fmt(lam, 3)} nm</b></div>`;
  };
  ctl.querySelectorAll("button[data-d]").forEach(b => b.onclick = () => { $("d").value = b.dataset.d; u(); });
  $("d").oninput = u; u();
}}
],
summary: String.raw`The formation energy \(E^f = E_{\text{tot}}[\text{defect}] - E_{\text{tot}}[\text{bulk}] - \sum_i n_i\mu_i + q(\varepsilon_F + \varepsilon_{\text{VBM}} + \Delta V)\) gives straight lines in the Fermi level with slope \(q\). The lower envelope gives the stable charge state and its kinks are the transition levels: NV⁻ is stable from 2.78 to 5.14 eV in diamond, \(\mathrm{N_C V_{Si}^-}\) from 1.60 to 2.83 eV in 4H-SiC. Through \(C = N_S e^{-E^f/k_BT}\), the more than 4 eV preference for nitrogen on carbon sites means only \(\mathrm{N_C V_{Si}}\) forms in SiC. Constrained DFT and the configuration coordinate diagram give absorption 2.27, ZPL 2.02 and emission 1.80 eV for NV, in good agreement with experiment, and the relaxation energy sets the Huang-Rhys factor and the small Debye-Waller factor of NV. In SiC the larger lattice reduces dangling bond overlap, halving the transition energies (1.15 and 1.09 eV) and cutting the relaxation by more than 75 %.`,
sheet: [
[String.raw`\[ E^f[X^q] = E_{\text{tot}}[X^q] - E_{\text{tot}}[\text{bulk}] - \sum_i n_i\mu_i + q(\varepsilon_F + \varepsilon_{\text{VBM}} + \Delta V) \]`, "Formation energy (Methods)"],
[String.raw`\[ \varepsilon(q/q') = \frac{E^f_{q'}(0) - E^f_q(0)}{q - q'} \]`, "Charge transition level"],
[String.raw`\[ C = N_S e^{-E^f/k_BT} \]`, "Equilibrium concentration"],
[String.raw`\[ E_{\text{abs}} = E_{\text{ZPL}} + d_e, \quad E_{\text{em}} = E_{\text{ZPL}} - d_g \]`, "Configuration coordinate diagram"],
[String.raw`\[ S = d_g/\hbar\omega, \quad \text{DW} = e^{-S} \]`, "Huang-Rhys and Debye-Waller"],
[String.raw`\[ |\beta(d)| = |\beta_0| e^{-(d - d_0)/\lambda} \]`, "Overlap decay with distance (fitted)"]],
consts: String.raw`HSE06 gaps: 5.36 eV (diamond), 3.17 eV (4H-SiC). \(\hbar\omega \approx 65\) meV for NV. \(k_BT\) = 0.172 eV at 2000 K.`,
sources: ["Weber et al., PNAS 107, 8513 (2010), Fig. 2, Fig. 4 and Methods", "Van de Walle and Neugebauer, J. Appl. Phys. 95, 3851 (2004), formation energies (paper ref. 20)", "Freysoldt, Neugebauer and Van de Walle, Phys. Rev. Lett. 102, 016402 (2009), charged supercell corrections (paper ref. 35)", "Davies and Hamer, Proc. R. Soc. A 348, 285 (1976), the 1.945 eV vibronic band (paper ref. 23)", "Gali et al., Phys. Rev. Lett. 103, 186404 (2009), NV excitation from first principles (paper ref. 24)"]
});
})();

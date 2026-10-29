addLesson("thesis", "ch2", {
level: "Intermediate",
id: "thesis-ch2-l6", title: "The DBR mirror and the air gap", short: "6. DBR and air gap",
big: "Half of what a grating radiates goes down. A distributed Bragg reflector under the membrane sends it back. A DBR is a stack of alternating high and low index layers, each a quarter wavelength thick, so that every small reflection returns in phase and they add up. With a small index contrast you need many pairs, and the high reflectance covers only a narrow band. The air gap between membrane and mirror then decides whether the returning light adds to or cancels the light going up, and this repeats every half wavelength of gap.",
bridge: "The formulas are the textbook quarter-wave results stated in Gačević and Vukmirović 2018, Sec. II A. Their paper studies how rough or intermixed interfaces degrade a real DBR. Curves here are computed live with a transfer matrix, using round example indices.",
cards: [
{s: "1. One interface", t: "One interface reflects only a little",
intu: String.raw`Every interface between two materials reflects a bit of light. The amplitude reflection coefficient depends only on the two indices. Going from low to high index, the reflected wave is flipped (a phase of \(\pi\)), going from high to low it is not. For GaAs against AlGaAs the indices are close, so each interface reflects only a few tenths of a percent of the power. A useful mirror has to stack many of these small reflections so they all add in phase. Drag the indices.`,
eq: String.raw`\[ r = \frac{n_{1} - n_{2}}{n_{1} + n_{2}}, \qquad R = r^{2} \quad \text{(normal incidence, from } n_{1} \text{ into } n_{2}\text{)} \]\[ r \lt 0 \ \text{when}\ n_{2} \gt n_{1}: \quad \text{a phase shift of } \pi \]`,
sym: [[String.raw`\(r\)`, "amplitude reflection coefficient"], [String.raw`\(R\)`, "power reflectance"], [String.raw`\(n_{1}, n_{2}\)`, "index on the incoming side and on the far side"]],
how: [String.raw`At normal incidence, match the tangential \(E\) and \(H\) on both sides of the interface.`, String.raw`\(H\) is proportional to \(nE\), so the two conditions give \(1 + r = t\) and \(n_1(1 - r) = n_2 t\).`, String.raw`Solve for \(r\).`, String.raw`The sign of \(r\) gives the phase: negative means the reflected field is inverted.`],
say: String.raw`A single interface reflects \(r = (n_1 - n_2)/(n_1 + n_2)\) of the field amplitude, with a \(\pi\) phase shift when reflecting off a higher index. Small index contrast gives weak reflection per interface.`,
num: String.raw`GaAs-like 3.5 against AlGaAs-like 3.0: \(r = 0.077\), \(R\) = <b>0.59 %</b><br>Gačević and Vukmirović's GaN/AlN example: \(|r|\) about 0.1<br>GaAs against air: \(r = 0.56\), \(R\) = <b>31 %</b>`,
r(fig, ctl) {
  ctl.innerHTML = sl("a", "n₁ (incoming side)", 1, 4, 0.01, 3.0) + sl("b", "n₂ (far side)", 1, 4, 0.01, 3.5) + '<div class="readout" id="ro"></div>';
  const u = () => {
    const a = +$("a").value, b = +$("b").value; $("av").textContent = a.toFixed(2); $("bv").textContent = b.toFixed(2);
    const r = (a - b) / (a + b), R = r * r;
    fig.innerHTML = svg(250, `<rect x="40" y="40" width="300" height="160" fill="var(--blue-bg)" opacity="${a / 4}"/><rect x="340" y="40" width="300" height="160" fill="var(--blue-bg)" opacity="${b / 4 + 0.1}"/><line x1="340" x2="340" y1="30" y2="210" stroke="var(--p)" stroke-width="2"/><text class="ts" x="190" y="228" text-anchor="middle">n₁ = ${a.toFixed(2)}</text><text class="ts" x="490" y="228" text-anchor="middle">n₂ = ${b.toFixed(2)}</text><line x1="80" y1="90" x2="330" y2="90" stroke="#EF9F27" stroke-width="5" marker-end="url(#ar)"/><text class="ts" x="80" y="80">incident, power 1</text><line x1="330" y1="150" x2="80" y2="150" stroke="#D85A30" stroke-width="${Math.max(1, 5 * Math.sqrt(R) * 2)}" marker-end="url(#ar)"/><text class="ts" x="80" y="174">reflected ${(R * 100).toFixed(2)} %${r < 0 ? ", phase π" : ""}</text><line x1="350" y1="90" x2="600" y2="90" stroke="#378ADD" stroke-width="${5 * Math.sqrt(1 - R)}" marker-end="url(#ar)"/><text class="ts" x="360" y="80">transmitted ${((1 - R) * 100).toFixed(2)} %</text>`);
    $("ro").innerHTML = `<div><span>r</span><b>${r.toFixed(4)}</b></div><div><span>R</span><b>${(R * 100).toFixed(3)} %</b></div>`;
  };
  $("a").oninput = u; $("b").oninput = u; u();
}},

{s: "2. Quarter waves", t: "Quarter-wave layers make every reflection add up",
intu: String.raw`Make each layer a quarter wavelength thick in its own material. A reflection from the back of a layer then travels an extra half wavelength (in and out), which is a phase of \(\pi\). Every second interface also has the \(\pi\) flip from card 1. Gačević and Vukmirović explain the result: all reflected waves come back with the same phase and add up. Each arrow here is one interface's reflection, drawn as a phasor (length = amplitude, angle = phase). At the design wavelength they line up in a straight line. Detune the wavelength and they curl up and partly cancel.`,
eq: String.raw`\[ d_i = \frac{\lambda_{0}}{4 n_i} \;\Longrightarrow\; \text{round trip phase in each layer} = \pi \]\[ \sum_k r_k\, e^{i\varphi_k} \quad \text{with all } \varphi_k \text{ equal at } \lambda_{0} \]<div class="eqref">single-reflection picture</div>`,
sym: [[String.raw`\(d_i\)`, String.raw`thickness of layer \(i\)`], [String.raw`\(\varphi_k\)`, String.raw`total phase of the reflection from interface \(k\) when it returns to the top`], ["phasor", "arrow representing a complex amplitude"]],
how: [String.raw`A wave reflected at interface \(k\) travels down and back through all layers above it, picking up \(2\cdot(2\pi/\lambda)\cdot n_i\cdot d_i\) each.`, String.raw`With quarter-wave layers each layer contributes \(\pi\).`, String.raw`Interfaces alternate between low-to-high (extra \(\pi\)) and high-to-low (no extra phase), which cancels the alternation of signs.`, String.raw`So at \(\lambda_0\) all contributions have the same phase. Away from \(\lambda_0\) the phases spread out. With weak interfaces, multiple reflections can be neglected, as Gačević and Vukmirović do.`],
say: String.raw`In a quarter-wave stack each layer adds a round-trip phase of \(\pi\), which together with the alternating reflection signs makes all partial reflections add in phase at the design wavelength.`,
num: String.raw`\(\lambda_0 = 800\) nm: a 3.5-index layer is <b>57.1 nm</b>, a 3.0-index layer <b>66.7 nm</b>.<br>Each pair adds about \(2|r| \approx 0.15\) to the amplitude in this simple picture, until the true multiple-reflection result saturates near 1.`,
r(fig, ctl) {
  ctl.innerHTML = sl("lam", "Wavelength", 650, 950, 1, 800) + sl("N", "Pairs", 1, 12, 1, 6) + '<div class="readout" id="ro"></div>';
  const u = () => {
    const lam = +$("lam").value, N = +$("N").value, nH = 3.5, nL = 3.0, l0 = 800; $("lamv").textContent = lam + " nm"; $("Nv").textContent = N;
    const r0 = (1 - nH) / (1 + nH), rHL = (nH - nL) / (nH + nL);
    let ph = 0, x = 120, y = 150, re = 0, im = 0, s = "";
    const layers = []; for (let i = 0; i < N; i++) { layers.push(nH, nL); }
    const ifs = [[r0, 0]]; let acc = 0;
    layers.forEach((n, i) => { acc += 2 * 2 * Math.PI / lam * n * (l0 / (4 * n)); const nxt = layers[i + 1] || 1; const r = (n - nxt) / (n + nxt); ifs.push([r, acc]); });
    const sc = 140;
    ifs.forEach(([r, p]) => { const ar = r * Math.cos(p), ai = r * Math.sin(p); const nx = x + ar * sc * (r0 < 0 ? -1 : 1), ny = y - ai * sc * (r0 < 0 ? -1 : 1); s += `<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${nx.toFixed(1)}" y2="${ny.toFixed(1)}" stroke="#D85A30" stroke-width="2" marker-end="url(#ar)"/>`; x = nx; y = ny; re += ar; im += ai; });
    fig.innerHTML = svg(280, `<line x1="120" x2="660" y1="150" y2="150" stroke="var(--p)" stroke-width="0.5"/><circle cx="120" cy="150" r="4" fill="var(--t)"/>${s}<line x1="120" y1="150" x2="${x}" y2="${y}" stroke="#378ADD" stroke-width="2" stroke-dasharray="5 4"/><text class="ts" x="20" y="30">each coral arrow: one interface's reflection. Blue dashed: their sum</text><text class="ts" x="20" y="270">${Math.abs(lam - 800) < 3 ? "at λ₀ the arrows line up" : "detuned: the arrows curl and partly cancel"}</text>`);
    $("ro").innerHTML = `<div><span>|sum| (single-reflection)</span><b>${Math.hypot(re, im).toFixed(3)}</b></div><div><span>exact R (transfer matrix)</span><b>${(C2.tmmR(1, C2.dbrLayers(nH, nL, N, l0), 1, lam) * 100).toFixed(1)} %</b></div>`;
  };
  $("lam").oninput = u; $("N").oninput = u; u();
}},

{s: "3. Pairs needed", t: "How many pairs: the peak reflectance formula",
intu: String.raw`Stacking pairs raises the reflectance toward 1, and the closed formula shows how fast: everything depends on the index ratio raised to the power \(2N\). A small ratio means many pairs. Gačević and Vukmirović give the general form with different media in front and behind the stack. When the same medium is on both sides, as when a simulated stack ends in air, it reduces to the simple \(q\) form. The dots here are the exact transfer-matrix result, the line is the formula. They agree exactly at the design wavelength.`,
eq: String.raw`\[ R = \left(\frac{q - 1}{q + 1}\right)^{2}, \qquad q = \left(\frac{n_{\mathrm{H}}}{n_{\mathrm{L}}}\right)^{2N} \]<div class="eqref">same medium on both sides, Ch. 2 Eq. (2.5), Gačević Eq. (2)</div>`,
sym: [[String.raw`\(N\)`, "number of high/low pairs"], [String.raw`\(n_{\mathrm{H}}, n_{\mathrm{L}}\)`, "high and low indices"], [String.raw`\(q\)`, String.raw`\((n_{\mathrm{H}}/n_{\mathrm{L}})^{2N}\), grows exponentially with \(N\)`]],
how: [String.raw`Use the transfer matrix of a quarter-wave layer: at \(\lambda_0\) it is a simple off-diagonal matrix.`, String.raw`Multiplying \(N\) pairs gives a diagonal matrix with entries \((n_{\mathrm{H}}/n_{\mathrm{L}})^{\pm N}\).`, String.raw`The reflection coefficient of the stack then depends only on \(q = (n_{\mathrm{H}}/n_{\mathrm{L}})^{2N}\).`, String.raw`With equal media outside, \(r = (q - 1)/(q + 1)\).`],
say: String.raw`The peak reflectance of a quarter-wave DBR is \(R = ((q - 1)/(q + 1))^2\) with \(q = (n_{\mathrm{H}}/n_{\mathrm{L}})^{2N}\). A small index ratio requires many pairs.`,
num: String.raw`Ratio \(3.5/3.0 = 1.167\): \(N = 10\) gives \(R \approx\) <b>83 %</b>, \(N = 20\) ≈ <b>99 %</b> (see the plot)<br>Ratio 1.5 (much higher contrast): 4 pairs already give over 95 %.`,
r(fig, ctl) {
  ctl.innerHTML = sl("rt", "Index ratio n_H/n_L", 1.05, 1.6, 0.005, 3.5 / 3.0) + sl("N", "Marker at pairs N", 1, 30, 1, 10) + '<div class="readout" id="ro"></div>';
  const u = () => {
    const rt = +$("rt").value, N = +$("N").value; $("rtv").textContent = rt.toFixed(3); $("Nv").textContent = N;
    const Rf = n => { const q = Math.pow(rt, 2 * n); return Math.pow((q - 1) / (q + 1), 2); };
    const Ns = range(0, 30, 121), ys = Ns.map(Rf);
    let dots = ""; for (let n = 1; n <= 30; n++) { const R = C2.tmmR(1, C2.dbrLayers(3.0 * rt, 3.0, n, 800), 1, 800); dots += `<circle cx="${60 + n / 30 * 560}" cy="${230 - R * 190}" r="3" fill="#D85A30"/>`; }
    fig.innerHTML = svg(260, `${plot(60, 40, 560, 190, Ns, ys, 0, 30, 0, 1, "#378ADD", 2.5)}${dots}<line x1="${60 + N / 30 * 560}" x2="${60 + N / 30 * 560}" y1="40" y2="230" stroke="#EF9F27" stroke-width="2"/><line x1="60" x2="620" y1="230" y2="230" stroke="var(--p)"/><line x1="60" x2="60" y1="40" y2="230" stroke="var(--p)"/><text class="ts" x="54" y="44" text-anchor="end">1</text><text class="ts" x="340" y="252" text-anchor="middle">number of pairs N, 0 to 30. Line: formula. Dots: transfer matrix</text>`);
    $("ro").innerHTML = `<div><span>R at N = ${N}</span><b>${(Rf(N) * 100).toFixed(2)} %</b></div><div><span>pairs for 99 %</span><b>${(() => { for (let n = 1; n < 200; n++) if (Rf(n) >= 0.99) return n; return "> 200"; })()}</b></div>`;
  };
  $("rt").oninput = u; $("N").oninput = u; u();
}},

{s: "4. Stopband", t: "The stopband: high reflectance only near λ₀",
intu: "Away from the design wavelength the layers are no longer quarter waves and the reflections stop adding in phase. The reflectance stays high only inside a band, the stopband, whose width depends only on the index contrast, not on the number of pairs. A low contrast stack has a narrow band. This spectrum is computed live with a transfer matrix. The orange lines mark the stopband width from the formula. Add pairs: the band gets flatter and squarer, but not much wider.",
eq: String.raw`\[ \Delta\lambda_{0} \approx \frac{4\lambda_{0}}{\pi} \arcsin\!\left(\frac{n_{\mathrm{H}} - n_{\mathrm{L}}}{n_{\mathrm{H}} + n_{\mathrm{L}}}\right) \]<div class="eqref">Ch. 2 Eq. (2.6), Gačević Eq. (3)</div>`,
sym: [[String.raw`\(\Delta\lambda_{0}\)`, "full width of the stopband"], [String.raw`\(\lambda_{0}\)`, "design wavelength"], [String.raw`\((n_{\mathrm{H}} - n_{\mathrm{L}})/(n_{\mathrm{H}} + n_{\mathrm{L}})\)`, "the single-interface reflection coefficient from card 1"]],
how: [String.raw`For an infinite periodic stack, waves are forbidden in a frequency band around \(\lambda_0\) (a 1D photonic band gap).`, "Its relative width follows from the band edges of the periodic medium.", "The result depends only on the contrast through the interface coefficient.", "For a finite stack the formula is a good estimate. Gačević and Vukmirović note it is strictly exact only for infinitely many periods."],
say: String.raw`A quarter-wave DBR reflects strongly only within a stopband of width about \((4\lambda_0/\pi) \arcsin((n_{\mathrm{H}} - n_{\mathrm{L}})/(n_{\mathrm{H}} + n_{\mathrm{L}}))\), which depends only on the index contrast.`,
num: String.raw`\(n_{\mathrm{H}} = 3.5\), \(n_{\mathrm{L}} = 3.0\), \(\lambda_0 = 800\) nm: \(\Delta\lambda_0 \approx (3200/\pi) \times \arcsin(0.0769) \approx\) <b>78 nm</b>`,
r(fig, ctl) {
  ctl.innerHTML = sl("N", "Pairs N", 2, 30, 1, 14) + sl("nL", "Low index n_L", 2.6, 3.45, 0.01, 3.0) + '<div class="readout" id="ro"></div>';
  const u = () => {
    const N = +$("N").value, nL = +$("nL").value, nH = 3.5; $("Nv").textContent = N; $("nLv").textContent = nL.toFixed(2);
    const ls = range(650, 950, 300), Rs = ls.map(l => C2.tmmR(1, C2.dbrLayers(nH, nL, N, 800), 1, l));
    const dl = 4 * 800 / Math.PI * Math.asin((nH - nL) / (nH + nL)), X = l => 60 + (l - 650) / 300 * 560;
    fig.innerHTML = svg(260, `<rect x="${X(800 - dl / 2)}" y="40" width="${X(800 + dl / 2) - X(800 - dl / 2)}" height="190" fill="#EF9F27" opacity="0.12"/><line x1="${X(800 - dl / 2)}" x2="${X(800 - dl / 2)}" y1="40" y2="230" stroke="#EF9F27"/><line x1="${X(800 + dl / 2)}" x2="${X(800 + dl / 2)}" y1="40" y2="230" stroke="#EF9F27"/>${plot(60, 40, 560, 190, ls, Rs, 650, 950, 0, 1, "#378ADD", 2.2)}<line x1="60" x2="620" y1="230" y2="230" stroke="var(--p)"/><line x1="60" x2="60" y1="40" y2="230" stroke="var(--p)"/><text class="ts" x="60" y="250">650 nm</text><text class="ts" x="620" y="250" text-anchor="end">950 nm</text><text class="ts" x="340" y="250" text-anchor="middle">wavelength</text><text class="ts" x="54" y="44" text-anchor="end">R = 1</text>`);
    $("ro").innerHTML = `<div><span>R at 800 nm</span><b>${(C2.tmmR(1, C2.dbrLayers(nH, nL, N, 800), 1, 800) * 100).toFixed(1)} %</b></div><div><span>stopband (formula)</span><b>${dl.toFixed(0)} nm</b></div>`;
  };
  $("N").oninput = u; $("nL").oninput = u; u();
}},

{s: "5. The air gap", t: "The gap decides whether the mirror helps",
intu: "A grating in a symmetric membrane sends half its light up and half down. The downward half crosses the air gap, reflects off the DBR, and comes back up through the membrane, where it interferes with the light that went up directly. If the round trip through the gap adds a whole number of wavelengths (counting the mirror's phase), they add and nearly all light goes up. If it is off by half a wavelength, they cancel. Because the light crosses the gap twice, the pattern repeats every half wavelength of gap thickness. Taillaert et al. found the same with the buried oxide in silicon-on-insulator: the best oxide thicknesses come in a series. This simple two-beam model ignores how the returning light also changes the grating's own strength, which they point out too.",
eq: String.raw`\[ U \propto \left|1 + \sqrt{R}\, e^{i\delta}\right|^{2}, \qquad \delta = 2 k_{0} t_{\mathrm{gap}} + \varphi_{\mathrm{DBR}} \]\[ \text{period in } t_{\mathrm{gap}}: \ \frac{\lambda_{0}}{2} \ \text{(air gap)} \]<div class="eqref">simple two-beam model</div>`,
sym: [[String.raw`\(U\)`, "upward power (relative)"], [String.raw`\(R\)`, "DBR reflectance"], [String.raw`\(\delta\)`, "round-trip phase of the downward light relative to the upward light"], [String.raw`\(t_{\mathrm{gap}}\)`, "air gap thickness"], [String.raw`\(\varphi_{\mathrm{DBR}}\)`, String.raw`reflection phase of the mirror (\(\pi\) for a stack starting with high index)`]],
how: ["Equal amplitudes leave up and down.", String.raw`The down wave gains \(2k_0 t_{\mathrm{gap}}\) through the gap and \(\varphi_{\mathrm{DBR}}\) at the mirror, and is scaled by \(\sqrt{R}\).`, String.raw`Up power \(\propto |1 + \sqrt{R}\,e^{i\delta}|^2\). The unreflected part \((1 - R)\) is lost below.`, String.raw`\(\delta\) changes by \(2\pi\) when \(t_{\mathrm{gap}}\) changes by \(\lambda_0/2\), so the pattern repeats.`],
say: "The gap between the membrane and the DBR sets the phase of the light reflected back up. Constructive interference sends most light upward, and the condition repeats every half wavelength of gap. The gap also changes the grating strength, so the grating and gap are designed together.",
num: String.raw`\(\lambda_0 = 800\) nm in air: the pattern repeats every <b>400 nm</b> of gap.<br>Taillaert et al. (SOI at 1550 nm): optimal oxide thicknesses about <b>550 nm</b> apart, close to half a wavelength in oxide (534 nm).`,
r(fig, ctl) {
  ctl.innerHTML = sl("g", "Air gap t_gap", 0, 1200, 5, 400) + sl("R", "DBR reflectance R", 0, 1, 0.01, 0.95) + '<div class="readout" id="ro"></div>';
  const u = () => {
    const g = +$("g").value, R = +$("R").value; $("gv").textContent = g + " nm"; $("Rv").textContent = (R * 100).toFixed(0) + " %";
    const k0 = 2 * Math.PI / 800, f = t => { const d = 2 * k0 * t + Math.PI; const U = 1 + R + 2 * Math.sqrt(R) * Math.cos(d); return U / (U + (1 - R)); };
    const ts = range(0, 1200, 241), ys = ts.map(f);
    fig.innerHTML = svg(260, `${plot(60, 40, 560, 170, ts, ys, 0, 1200, 0, 1, "#378ADD", 2.5)}<line x1="${60 + g / 1200 * 560}" x2="${60 + g / 1200 * 560}" y1="40" y2="210" stroke="#EF9F27" stroke-width="2"/><line x1="60" x2="620" y1="210" y2="210" stroke="var(--p)"/><line x1="60" x2="60" y1="40" y2="210" stroke="var(--p)"/><text class="ts" x="54" y="44" text-anchor="end">1</text><text class="ts" x="340" y="232" text-anchor="middle">air gap, 0 to 1200 nm. Fraction of radiated light that goes up (simple model)</text>`);
    $("ro").innerHTML = `<div><span>fraction up</span><b>${(f(g) * 100).toFixed(1)} %</b></div><div><span>without mirror</span><b>50 %</b></div>`;
  };
  $("g").oninput = u; $("R").oninput = u; u();
}},

{s: "6. Real stacks", t: "Real mirrors: substrate and disorder",
intu: "Two things make a real DBR differ from the ideal formula. First, what lies behind the stack: Gačević and Vukmirović's general formula has different media in front and behind. A simulation that ends the stack in air is not the same as a wafer with a GaAs substrate underneath, which gives a higher value. Second, real interfaces are rough or intermixed. Their research question was exactly this, and their answer, the effective refractive-index approximation, is that a disordered DBR behaves like a perfect one with a smaller index ratio. Toggle the substrate and reduce the effective ratio to see both effects.",
eq: String.raw`\[ \text{general: } R = \left(\frac{n_{0} n_{\mathrm{L}}^{2N} - n_{\mathrm{s}} n_{\mathrm{H}}^{2N}}{n_{0} n_{\mathrm{L}}^{2N} + n_{\mathrm{s}} n_{\mathrm{H}}^{2N}}\right)^{2} \]\[ \text{disorder: } \frac{n_{\mathrm{H}}}{n_{\mathrm{L}}} \to \left(\frac{n_{\mathrm{H}}}{n_{\mathrm{L}}}\right)_{\mathrm{eff}} \lt \frac{n_{\mathrm{H}}}{n_{\mathrm{L}}} \]<div class="eqref">Gačević Eq. (2)</div>`,
sym: [[String.raw`\(n_{0}\)`, "medium in front of the stack (air here)"], [String.raw`\(n_{\mathrm{s}}\)`, "medium behind the stack (air in a simulation, GaAs for a real wafer)"], [String.raw`\((n_{\mathrm{H}}/n_{\mathrm{L}})_{\mathrm{eff}}\)`, "reduced effective ratio that mimics interface disorder (their ERIA)"]],
how: [String.raw`Repeat the transfer matrix with \(n_{\mathrm{s}}\) instead of \(n_0\) on the exit side.`, String.raw`A high-index substrate adds one more reflection in phase, raising \(R\).`, "Interface disorder smears the index step, which lowers the reflection per interface.", String.raw`Gačević and Vukmirović show this is equivalent to a perfect stack with a smaller index ratio, so both \(R\) and the stopband shrink.`],
say: "The peak reflectance depends on what is behind the stack, and real interface disorder lowers both the reflectance and the stopband width, which can be modelled as a reduced effective index ratio.",
num: String.raw`\(n_{\mathrm{H}}/n_{\mathrm{L}} = 3.5/3.0\), 10 pairs: air behind ≈ <b>83 %</b>, GaAs-like substrate (3.5) behind ≈ <b>95 %</b> (see the readout).<br>Their simulations, like most, neglect absorption.`,
r(fig, ctl) {
  let sub = "air";
  ctl.innerHTML = btns([["air", "air behind the stack"], ["gaas", "GaAs substrate behind"]], "s") + sl("N", "Pairs N", 2, 30, 1, 10) + sl("ef", "Effective ratio (disorder)", 1.08, 3.5 / 3.0, 0.002, 3.5 / 3.0) + '<div class="readout" id="ro"></div>';
  const u = () => {
    pick(ctl, "s", sub); const N = +$("N").value, ef = +$("ef").value; $("Nv").textContent = N; $("efv").textContent = ef.toFixed(3);
    const ns = sub === "air" ? 1 : 3.5, nL = 3.0, nH0 = 3.5, nH = nL * ef;
    const ls = range(650, 950, 240), id = ls.map(l => C2.tmmR(1, C2.dbrLayers(nH0, nL, N, 800), ns, l)), ds = ls.map(l => C2.tmmR(1, C2.dbrLayers(nH, nL, N, 800), ns, l));
    fig.innerHTML = svg(260, `${plot(60, 40, 560, 190, ls, id, 650, 950, 0, 1, "#888780", 1.5, "5 4")}${plot(60, 40, 560, 190, ls, ds, 650, 950, 0, 1, "#378ADD", 2.5)}<line x1="60" x2="620" y1="230" y2="230" stroke="var(--p)"/><line x1="60" x2="60" y1="40" y2="230" stroke="var(--p)"/><text class="ts" x="340" y="250" text-anchor="middle">wavelength 650 to 950 nm. Grey dashed: ideal. Blue: with reduced effective ratio</text>`);
    $("ro").innerHTML = `<div><span>R at 800 nm (ideal)</span><b>${(C2.tmmR(1, C2.dbrLayers(nH0, nL, N, 800), ns, 800) * 100).toFixed(1)} %</b></div><div><span>R at 800 nm (disordered)</span><b>${(C2.tmmR(1, C2.dbrLayers(nH, nL, N, 800), ns, 800) * 100).toFixed(1)} %</b></div>`;
  };
  ctl.querySelectorAll("button").forEach(b => b.onclick = () => { sub = b.dataset.s; u(); });
  $("N").oninput = u; $("ef").oninput = u; u();
}}
],
summary: String.raw`Each interface reflects \(r = (n_1 - n_2)/(n_1 + n_2)\), small for GaAs and AlGaAs. Quarter-wave layers make all partial reflections return in phase, so a stack of \(N\) pairs reaches \(R = ((q - 1)/(q + 1))^2\) with \(q = (n_{\mathrm{H}}/n_{\mathrm{L}})^{2N}\), within a stopband of width about \((4\lambda_0/\pi) \arcsin((n_{\mathrm{H}} - n_{\mathrm{L}})/(n_{\mathrm{H}} + n_{\mathrm{L}}))\). Low contrast needs many pairs and gives a narrow band. Under a grating, the air gap sets the phase of the light reflected back up, and the condition for upward emission repeats every half wavelength of gap. The medium behind the stack and interface disorder both change the real reflectance, as Gačević and Vukmirović analyse.`,
sheet: [
[String.raw`\[ r = \frac{n_{1} - n_{2}}{n_{1} + n_{2}} \]`, "Single interface"],
[String.raw`\[ d = \frac{\lambda_{0}}{4n} \]`, "Quarter-wave layer"],
[String.raw`\[ R = \left(\frac{q - 1}{q + 1}\right)^{2}, \qquad q = \left(\frac{n_{\mathrm{H}}}{n_{\mathrm{L}}}\right)^{2N} \]`, "Peak reflectance (Ch. 2 Eq. 2.5)"],
[String.raw`\[ \Delta\lambda_{0} \approx \frac{4\lambda_{0}}{\pi} \arcsin\!\left(\frac{n_{\mathrm{H}} - n_{\mathrm{L}}}{n_{\mathrm{H}} + n_{\mathrm{L}}}\right) \]`, "Stopband (Ch. 2 Eq. 2.6)"],
[String.raw`\[ U \propto \left|1 + \sqrt{R}\, e^{i\delta}\right|^{2}, \qquad \text{period } \frac{\lambda_{0}}{2} \text{ in gap} \]`, "Air gap interference (simple model)"]],
consts: String.raw`Examples: \(n_{\mathrm{H}} = 3.5\), \(n_{\mathrm{L}} = 3.0\), \(\lambda_0 = 800\) nm, normal incidence, lossless. Not thesis values.`,
sources: ["Gačević and Vukmirović, Phys. Rev. Applied 9, 064041 (2018), Sec. II A, Eqs. (2) and (3) (study of how interface disorder degrades DBRs)", "Taillaert et al., Jpn. J. Appl. Phys. 45, 6071 (2006) (buried oxide thickness, bottom mirror, grating and layers designed together)"]
});

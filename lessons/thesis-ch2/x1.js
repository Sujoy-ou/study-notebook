/* Beyond the thesis B1: the analytic slab equation and the effective index method (not in the final Chapter 2). */
addLesson("thesis", "ch2x", {
level: "Beyond",
id: "thesis-ch2-x1", title: "Analytic slab theory", short: "B1. Analytic slab theory",
big: String.raw`This material is not in the final thesis but may come up in questions. The thesis takes every effective index from the Tidy3D mode solver (Lesson 3). Before solvers, the symmetric slab was solved by hand, and the hand solution still explains the numbers. A bounce angle survives only if its round-trip phase is a whole number of \(2\pi\), which gives one transcendental equation for both polarizations, \(\tan(\kappa t/2 - m\pi/2) = \zeta\gamma/\kappa\). The TM factor \(\zeta = (n/n_{\mathrm{c}})^2\), about 12, is the field jump of Eq. 2.1 in disguise, and it pushes the TM effective index below the TE one. The same equation gives the cutoff of every higher-order mode, and two slab problems in a row, the effective index method, estimate a strip.`,
bridge: String.raw`A self-contained extra to Lesson 1 (the effective index), Lesson 2 (the field jump and TE-like and TM-like modes) and Lesson 3 (the mode solver). Step 1 of the effective index method in card 4 is what Lesson 6 uses for MMI sections, where the core index \(n_r\) is the effective index of the unpatterned membrane. The equations follow Andreani and Gerace 2006, Appendix C, and all curves are computed live with \(n = 3.5\), \(n_{\mathrm{c}} = 1\) and \(\lambda_0 = 800\) nm.`,
cards: [
/* from old ch2 L1 card 4 */
{s: "1. Only some angles", t: "Only some angles survive: transverse resonance",
intu: String.raw`Not every bounce angle works. Follow a ray up and back down: it crosses the core twice and reflects twice. If the phase it collects in that round trip is not a whole number of \(2\pi\), the ray interferes with itself destructively and dies out. Only a discrete set of angles, the modes, survive. The reflection at each surface adds its own phase, which depends on the angle and on the polarization. Make the core thicker and more angles fit, so more modes appear. The plot shows the round-trip phase against \(n_{\mathrm{eff}}\): wherever it crosses a multiple of \(2\pi\) there is a mode.`,
eq: String.raw`\[ 2\kappa t - 2\varphi_{\mathrm{r}}(n_{\mathrm{eff}}) = 2\pi m, \qquad \kappa = k_{0}\sqrt{n^{2} - n_{\mathrm{eff}}^{2}}, \qquad \varphi_{\mathrm{r}} = 2\arctan\!\left(\frac{\zeta\gamma}{\kappa}\right) \]\[ \Longleftrightarrow\quad \tan\!\left(\frac{\kappa t}{2} - \frac{m\pi}{2}\right) = \frac{\zeta\gamma}{\kappa} \]<div class="eqref">the slab equation of card 2</div>`,
sym: [[String.raw`\(\kappa\)`, String.raw`transverse wavenumber inside the core (Andreani's \(q\))`], [String.raw`\(t\)`, "core thickness"], [String.raw`\(\varphi_{\mathrm{r}}\)`, "phase lost at one total internal reflection"], [String.raw`\(m\)`, "mode order, 0, 1, 2 …"], [String.raw`\(\zeta\)`, String.raw`1 for TE, \((n/n_{\mathrm{c}})^2\) for TM`]],
how: [String.raw`Round trip across the core: transverse phase \(2\kappa t\).`, String.raw`Each total internal reflection adds a phase shift \(-\varphi_{\mathrm{r}}\), set by the Fresnel coefficient.`, String.raw`Self-consistency: total round-trip phase = \(2\pi m\).`, "Rearranging gives the slab equation of card 2, which Andreani and Gerace write as their Eqs. (C1) to (C4)."],
say: String.raw`Guided modes are the bounce angles whose round-trip phase is a multiple of \(2\pi\), the transverse resonance condition. It is equivalent to the slab dispersion relation.`,
num: String.raw`Slab \(n = 3.5\) in air, \(\lambda = 800\) nm, TE:<br>\(t = 100\) nm: only <b>TE0</b> is guided<br>\(t = 160\) nm: <b>TE0 and TE1</b> (TE1 near cutoff)<br>\(t = 400\) nm: <b>4 TE modes</b> (a new one every 119 nm)`,
r(fig, ctl) {
  ctl.innerHTML = sl("t", "Core thickness t", 40, 500, 5, 160) + '<div class="readout" id="ro"></div>';
  const u = () => {
    const t = +$("t").value, n = 3.5, lam = 800, k0 = 2 * Math.PI / lam; $("tv").textContent = t + " nm";
    const Ns = range(1.0005, 3.4995, 300);
    const ph = Ns.map(N => { const ka = k0 * Math.sqrt(n * n - N * N), ga = k0 * Math.sqrt(N * N - 1); return (2 * ka * t - 4 * Math.atan(ga / ka)) / (2 * Math.PI); });
    const pmax = Math.max(3, Math.ceil(Math.max(...ph)));
    const modes = []; for (let m = 0; m < 6; m++) { const N = C2.slabN(n, 1, t, lam, m, "TE"); if (N) modes.push(N); }
    const X = N => 60 + (N - 1) / 2.5 * 560, Y = v => 230 - (v + 1) / (pmax + 1) * 190;
    let grid = ""; for (let m = 0; m <= pmax; m++) grid += `<line x1="60" x2="620" y1="${Y(m)}" y2="${Y(m)}" stroke="var(--b)" stroke-dasharray="3 3"/><text class="ts" x="54" y="${Y(m) + 4}" text-anchor="end">${m}</text>`;
    let pts = ""; modes.forEach((N, m) => pts += `<circle cx="${X(N)}" cy="${Y(m)}" r="6" fill="#D85A30"/><text class="ts" x="${X(N)}" y="${Y(m) - 10}" text-anchor="middle">TE${m}</text>`);
    let d = ""; Ns.forEach((N, i) => { const v = ph[i]; if (v < -1) return; d += (d ? "L" : "M") + X(N).toFixed(1) + " " + Y(v).toFixed(1); });
    fig.innerHTML = svg(270, `${grid}<path d="${d}" fill="none" stroke="#378ADD" stroke-width="2.5"/>${pts}<line x1="60" x2="620" y1="230" y2="230" stroke="var(--p)"/><text class="ts" x="60" y="250">n<tspan baseline-shift='sub' font-size='75%'>eff</tspan> = 1 (air)</text><text class="ts" x="620" y="250" text-anchor="end">n<tspan baseline-shift='sub' font-size='75%'>eff</tspan> = 3.5 (GaAs)</text><text class="ts" x="20" y="130" transform="rotate(-90 20 130)" text-anchor="middle">round-trip phase / 2π</text>`);
    $("ro").innerHTML = `<div><span>guided TE modes</span><b>${modes.length}</b></div><div><span>n<sub>eff</sub> values</span><b>${modes.map(v => v.toFixed(3)).join(", ")}</b></div>`;
  };
  $("t").oninput = u; u();
}},

/* from old ch2 L2 card 2 */
{s: "2. Solving it", t: "Solving the slab equation graphically",
intu: String.raw`The slab equation has the mode's \(n_{\mathrm{eff}}\) on both sides, so it cannot be solved with algebra. Plot both sides against \(n_{\mathrm{eff}}\) and look for crossings. The left side, \(\tan(\kappa t/2 - m\pi/2)\), climbs through branches. The right side, \(\zeta\gamma/\kappa\), rises smoothly from zero. Each crossing is one mode. For TM the right side is multiplied by \(\zeta = (n/n_{\mathrm{c}})^2\), about 12, so it rises much faster and the crossing moves to a lower \(n_{\mathrm{eff}}\). That is the whole reason TM modes have lower effective index. Andreani and Gerace 2006 studied photonic crystal slabs with a guided-mode expansion method that builds patterned-slab fields out of these plain slab modes, and their Appendix C states these equations for a slab in the same medium on both sides.`,
eq: String.raw`\[ \tan\!\left(\frac{\kappa t}{2} - \frac{m\pi}{2}\right) = \zeta\,\frac{\gamma}{\kappa} \]\[ \kappa = k_{0}\sqrt{n^{2} - n_{\mathrm{eff}}^{2}}, \qquad \gamma = k_{0}\sqrt{n_{\mathrm{eff}}^{2} - n_{\mathrm{c}}^{2}} \]\[ \zeta = 1 \ \text{(TE)}, \qquad \zeta = \left(\frac{n}{n_{\mathrm{c}}}\right)^{2} \ \text{(TM)} \]<div class="eqref">Andreani and Gerace, Eqs. (C1) to (C4)</div>`,
sym: [[String.raw`\(\kappa\)`, String.raw`transverse wavenumber in the core (their \(q\))`], [String.raw`\(\gamma\)`, String.raw`decay constant in the cladding (their \(\chi_1\))`], [String.raw`\(m\)`, String.raw`mode order. Even \(m\): (C1) and (C4). Odd \(m\): (C2) and (C3)`], [String.raw`\(\zeta\)`, String.raw`boundary factor, 1 for TE and about 12 for TM, the factor of the field jump in Eq. 2.1`], [String.raw`\(k_{0}\)`, String.raw`\(2\pi/\lambda_0\)`]],
how: [String.raw`Inside the core the field is \(\cos(\kappa z)\) (even \(m\)) or \(\sin(\kappa z)\) (odd \(m\)). Outside it decays as \(e^{-\gamma|z|}\).`, String.raw`Match the main field and its derivative at \(z = t/2\), with the right boundary condition.`, String.raw`For TE, \(E_y\) and \(dE_y/dz\) are continuous. For TM, \(H_y\) and \((1/\varepsilon)\,dH_y/dz\) are continuous, which brings in \(\zeta\).`, String.raw`The ratio of the two matching conditions gives \(\tan(\kappa t/2 - m\pi/2) = \zeta\gamma/\kappa\). Andreani writes the four cases separately.`],
say: String.raw`The slab modes satisfy \(\tan(\kappa t/2 - m\pi/2) = \zeta\gamma/\kappa\), with \(\zeta = 1\) for TE and \((n/n_{\mathrm{c}})^2\) for TM. This is the symmetric-slab result of Andreani and Gerace, Appendix C, written as one line.`,
num: String.raw`\(n = 3.5\), \(t = 160\) nm, \(\lambda = 800\) nm, air:<br>TE0 \(n_{\mathrm{eff}} \approx\) <b>3.08</b>, TM0 \(n_{\mathrm{eff}} \approx\) <b>2.58</b> (computed by this page)<br>Watch out: Andreani call the fundamental mode 'first-order'. Here \(m = 0\) is the fundamental.`,
r(fig, ctl) {
  let pol = "TE";
  ctl.innerHTML = btns([["TE", "TE (ζ = 1)"], ["TM", "TM (ζ = n²)"]], "p") + sl("t", "Thickness t", 60, 400, 5, 160) + '<div class="readout" id="ro"></div>';
  const u = () => {
    pick(ctl, "p", pol); const t = +$("t").value, n = 3.5, lam = 800, k0 = 2 * Math.PI / lam, z = pol === "TM" ? n * n : 1; $("tv").textContent = t + " nm";
    const Ns = range(1.001, 3.499, 500), X = N => 60 + (N - 1) / 2.5 * 560, Y = v => 130 - Math.max(-5, Math.min(5, v)) * 19;
    let rhs = "", lhs = ["", "", ""];
    Ns.forEach((N, i) => { const ka = k0 * Math.sqrt(n * n - N * N), ga = k0 * Math.sqrt(N * N - 1); const r = z * ga / ka; rhs += (i ? "L" : "M") + X(N).toFixed(1) + " " + Y(r).toFixed(1); });
    for (let m = 0; m < 3; m++) { let d = "", prev = null; Ns.forEach(N => { const ka = k0 * Math.sqrt(n * n - N * N); const v = Math.tan(ka * t / 2 - m * Math.PI / 2); if (Math.abs(v) > 5) { prev = null; return; } const cmd = (prev === null || Math.abs(v - prev) > 8) ? "M" : "L"; d += cmd + X(N).toFixed(1) + " " + Y(v).toFixed(1) + " "; prev = v; }); lhs[m] = d; }
    const sols = []; for (let m = 0; m < 3; m++) { const N = C2.slabN(n, 1, t, lam, m, pol); if (N) sols.push([m, N]); }
    const cols = ["#378ADD", "#7F77DD", "#1D9E75"];
    fig.innerHTML = svg(270, `<line x1="60" x2="620" y1="130" y2="130" stroke="var(--p)" stroke-width="0.5"/>${lhs.map((d, m) => `<path d="${d}" fill="none" stroke="${cols[m]}" stroke-width="1.5" opacity="0.8"/>`).join("")}<path d="${rhs}" fill="none" stroke="#D85A30" stroke-width="2.5"/>${sols.map(([m, N]) => `<circle cx="${X(N)}" cy="${Y(z * k0 * Math.sqrt(N * N - 1) / (k0 * Math.sqrt(n * n - N * N)))}" r="6" fill="#EF9F27" stroke="#854F0B"/><text class="ts" x="${X(N)}" y="250" text-anchor="middle">${pol}${m}</text><line x1="${X(N)}" x2="${X(N)}" y1="236" y2="226" stroke="#854F0B"/>`).join("")}<line x1="60" x2="620" y1="236" y2="236" stroke="var(--p)"/><text class="ts" x="60" y="264">n<tspan baseline-shift='sub' font-size='75%'>eff</tspan> = 1</text><text class="ts" x="620" y="264" text-anchor="end">n<tspan baseline-shift='sub' font-size='75%'>eff</tspan> = 3.5</text><text class="ts" x="66" y="28">coral: right side ζγ/κ. Blue, purple, teal: left side for m = 0, 1, 2</text>`);
    $("ro").innerHTML = sols.map(([m, N]) => `<div><span>${pol}${m}</span><b>n<sub>eff</sub> = ${N.toFixed(3)}</b></div>`).join("") || `<div><span>modes</span><b>none</b></div>`;
  };
  ctl.querySelectorAll("button").forEach(b => b.onclick = () => { pol = b.dataset.p; u(); });
  $("t").oninput = u; u();
}},

/* from old ch2 L2 card 4 */
{s: "3. Versus thickness", t: "How n<sub>eff</sub> changes with thickness, and cutoffs",
intu: String.raw`Plot the effective index of each mode against slab thickness. Every curve starts at the cladding index (\(n_{\mathrm{eff}} = 1\)) at its cutoff thickness and climbs toward the core index as the slab gets thicker, because more and more of the light sits inside the GaAs. Higher-order modes switch on one by one. TE curves always lie above the TM curve of the same order. Johnson et al. 1999 gave the design rule for photonic crystal slabs: too thin and modes hug the light line (weak guiding), too thick and higher-order modes appear. The best thickness is about half a wavelength in the material.`,
eq: String.raw`\[ \text{cutoff (symmetric slab): } \quad t_m = \frac{m\lambda_{0}}{2\sqrt{n^{2} - n_{\mathrm{c}}^{2}}} \quad \text{(TE and TM)} \]<div class="eqnote">fundamental modes have no cutoff</div>`,
sym: [[String.raw`\(t_m\)`, String.raw`thickness at which mode \(m\) appears`], [String.raw`\(n_{\mathrm{eff}}(t)\)`, "effective index versus thickness"], [String.raw`\(\lambda_{0}/(2n)\)`, "half a wavelength in the core, Johnson's rule of thumb"]],
how: [String.raw`At cutoff \(n_{\mathrm{eff}} = n_{\mathrm{c}}\), so \(\gamma = 0\) and the right side of the slab equation is zero.`, String.raw`Then \(\kappa t/2 - m\pi/2 = 0\) with \(\kappa = k_0\sqrt{n^2 - n_{\mathrm{c}}^2}\).`, String.raw`Solving gives \(t_m\). The fundamental (\(m = 0\)) has \(t_0 = 0\): a symmetric slab always guides it.`, String.raw`Above cutoff \(n_{\mathrm{eff}}\) rises toward \(n\) as the field concentrates in the core.`],
say: String.raw`In a symmetric slab the fundamental TE and TM modes have no cutoff. Mode \(m\) appears at \(t_m = m\lambda_0/(2\sqrt{n^2 - n_{\mathrm{c}}^2})\). Thickness is chosen to give strong guiding without too many higher-order modes.`,
num: String.raw`\(n = 3.5\) in air at 800 nm: \(t_1 = 800/(2\sqrt{11.25}) \approx\) <b>119 nm</b>, \(t_2 \approx\) <b>239 nm</b><br>Half a wavelength in the core: \(800/(2 \times 3.5) \approx\) <b>114 nm</b><br>A 160 nm membrane is just above \(t_1\), so TE1 and TM1 exist but are weakly guided.`,
r(fig, ctl) {
  ctl.innerHTML = sl("t", "Marker at thickness", 20, 500, 5, 160) + '<div class="readout" id="ro"></div>';
  const ts = range(10, 500, 120), modes = [["TE", 0, "#378ADD", ""], ["TM", 0, "#D85A30", ""], ["TE", 1, "#378ADD", "5 4"], ["TM", 1, "#D85A30", "5 4"], ["TE", 2, "#378ADD", "2 3"], ["TM", 2, "#D85A30", "2 3"]];
  const curves = modes.map(([p, m]) => ts.map(t => C2.slabN(3.5, 1, t, 800, m, p)));
  const u = () => {
    const tt = +$("t").value; $("tv").textContent = tt + " nm";
    const X = t => 60 + (t - 10) / 490 * 560, Y = N => 230 - (N - 1) / 2.5 * 200;
    let s = ""; curves.forEach((c, i) => { let d = ""; c.forEach((N, j) => { if (!N) return; d += (d ? "L" : "M") + X(ts[j]).toFixed(1) + " " + Y(N).toFixed(1); }); s += `<path d="${d}" fill="none" stroke="${modes[i][2]}" stroke-width="2" ${modes[i][3] ? `stroke-dasharray="${modes[i][3]}"` : ""}/>`; });
    const now = modes.map(([p, m]) => [p + m, C2.slabN(3.5, 1, tt, 800, m, p)]).filter(x => x[1]);
    fig.innerHTML = svg(270, `${s}<line x1="${X(tt)}" x2="${X(tt)}" y1="30" y2="230" stroke="#EF9F27" stroke-width="2"/><line x1="60" x2="620" y1="230" y2="230" stroke="var(--p)"/><line x1="60" x2="60" y1="30" y2="230" stroke="var(--p)"/><text class="ts" x="54" y="234" text-anchor="end">1</text><text class="ts" x="54" y="34" text-anchor="end">3.5</text><text class="ts" x="340" y="252" text-anchor="middle">slab thickness, 10 to 500 nm</text><text class="ts" x="66" y="44">blue TE, coral TM. Solid m = 0, dashed m = 1, dotted m = 2</text>`);
    $("ro").innerHTML = now.map(([nm, N]) => `<div><span>${nm}</span><b>${N.toFixed(3)}</b></div>`).join("");
  };
  $("t").oninput = u; u();
}},

/* from old ch2 L3 card 1 */
{s: "4. EIM steps", t: "From slab to strip: the effective index method",
intu: String.raw`A strip is a 2D problem, but it can be split into two 1D slab problems. Step 1: ignore the side walls and solve the vertical slab (thickness \(t\)). That gives a slab index \(n_{\mathrm{slab}}\). Step 2: replace the core by a material of index \(n_{\mathrm{slab}}\) and solve a slab of width \(w\) along \(y\), with air on both sides. The answer is the effective index of the strip. The trick for polarization: in step 2 the role of TE and TM swaps. A TE-like mode has \(\mathbf{E}\) along \(y\), which is normal to the side walls, so step 2 is a TM-type problem with the \(\times\varepsilon\) jump at the walls. Step through it.`,
eq: String.raw`\[ \text{1: } \mathrm{slab}(n, t) \to n_{\mathrm{slab}} \qquad \text{2: } \mathrm{slab}(n_{\mathrm{slab}}, w) \to n_{\mathrm{eff}} \]<div class="eqnote">TE-like: step 1 TE, step 2 TM-type</div><div class="eqnote">TM-like: step 1 TM, step 2 TE-type</div>`,
sym: [[String.raw`\(n_{\mathrm{slab}}\)`, "effective index of the vertical slab, used as the core in step 2"], [String.raw`\(w\)`, String.raw`strip width (along \(y\))`], [String.raw`\(t\)`, String.raw`membrane thickness (along \(z\))`], [String.raw`\(n_{\mathrm{eff}}\)`, "estimated effective index of the strip mode"]],
how: [String.raw`Assume the field separates: \(E(y, z) \approx F(z)\,G(y)\).`, String.raw`Solve the vertical slab for \(F(z)\) and \(n_{\mathrm{slab}}\).`, String.raw`Use \(n_{\mathrm{slab}}\) as the core index of the lateral slab and solve for \(G(y)\) and \(n_{\mathrm{eff}}\).`, String.raw`Pick the lateral boundary type by which way the main \(\mathbf{E}\) field points relative to the side walls.`],
say: String.raw`The effective index method reduces the strip to two slab problems, vertical then lateral. It is a good estimate for wide strips but overestimates \(n_{\mathrm{eff}}\) for narrow, high-contrast strips, where a full mode solver is needed.`,
num: String.raw`Soldano and Pennings 1995 reduce their MMI sections to 2D with this same method (their Sec. II). Lesson 6 does step 1 the same way: the core index \(n_r\) of the MMI section is the slab index of the unpatterned 160 nm membrane.`,
r(fig, ctl) {
  let k = 0;
  ctl.innerHTML = `<div class="row"><button id="eb">Back</button><button id="en">Next step</button><span class="note" id="et"></span></div>` + sl("w", "Strip width w", 100, 800, 5, 300) + btns([["TE", "TE-like"], ["TM", "TM-like"]], "f") + '<div class="readout" id="ro"></div>';
  let fam = "TE";
  const u = () => {
    pick(ctl, "f", fam); const w = +$("w").value; $("wv").textContent = w + " nm";
    const Ns = C2.slabN(3.5, 1, 160, 800, 0, fam), Ne = C2.eim(3.5, 1, 160, w, 800, fam);
    const S = ["Step 0: the strip cross-section", "Step 1: vertical slab, infinitely wide", "Step 2: lateral slab with core index n<sub>slab</sub>"];
    const sx = 340, ww = Math.min(400, w * 0.5);
    let body = "";
    if (k === 0) body = `<rect x="${sx - ww / 2}" y="110" width="${ww}" height="50" fill="#7FA6D9" stroke="var(--p)"/><text class="ts" x="${sx}" y="186" text-anchor="middle">w = ${w} nm, t = 160 nm, n = 3.5, air around</text>`;
    if (k === 1) body = `<rect x="60" y="110" width="560" height="50" fill="#7FA6D9" stroke="var(--p)"/><line x1="${sx}" x2="${sx}" y1="80" y2="190" stroke="#EF9F27" stroke-width="2" marker-start="url(#ar)" marker-end="url(#ar)"/><text class="ts" x="${sx + 8}" y="76">solve along z (${fam})</text><text class="th" x="${sx}" y="214" text-anchor="middle">n<tspan baseline-shift='sub' font-size='75%'>slab</tspan> = ${Ns.toFixed(3)}</text>`;
    if (k === 2) body = `<rect x="${sx - ww / 2}" y="60" width="${ww}" height="150" fill="#B9CCE8" stroke="var(--p)"/><text class="ts" x="${sx}" y="140" text-anchor="middle">core index n<tspan baseline-shift='sub' font-size='75%'>slab</tspan> = ${Ns.toFixed(3)}</text><line x1="${sx - ww / 2 - 40}" x2="${sx + ww / 2 + 40}" y1="230" y2="230" stroke="#EF9F27" stroke-width="2" marker-start="url(#ar)" marker-end="url(#ar)"/><text class="ts" x="${sx}" y="250" text-anchor="middle">solve along y (${fam === "TE" ? "TM-type: E normal to walls" : "TE-type: E parallel to walls"})</text><text class="th" x="${sx}" y="40" text-anchor="middle">n<tspan baseline-shift='sub' font-size='75%'>eff</tspan> ≈ ${Ne ? Ne.toFixed(3) : "cut off"}</text>`;
    fig.innerHTML = svg(270, body);
    $("et").innerHTML = S[k]; $("eb").disabled = k === 0; $("en").disabled = k === 2;
    $("ro").innerHTML = `<div><span>n<sub>slab</sub> (${fam} slab)</span><b>${Ns.toFixed(3)}</b></div><div><span>n<sub>eff</sub> (EIM)</span><b>${Ne ? Ne.toFixed(3) : "cut off"}</b></div>`;
  };
  $("eb").onclick = () => { k--; u(); }; $("en").onclick = () => { k++; u(); };
  ctl.querySelectorAll("button[data-f]").forEach(b => b.onclick = () => { fam = b.dataset.f; u(); });
  $("w").oninput = u; u();
}}

],
summary: String.raw`A guided slab mode is a bounce angle whose round-trip phase is a multiple of \(2\pi\). This transverse resonance gives \(\tan(\kappa t/2 - m\pi/2) = \zeta\gamma/\kappa\), with \(\zeta = 1\) for TE and \((n/n_{\mathrm{c}})^2\) for TM (Andreani and Gerace, Appendix C). The TM factor, about 12 for GaAs in air, makes the right side rise faster, so the TM crossing and the TM effective index are lower. In a symmetric slab the fundamental TE and TM modes have no cutoff, and mode \(m\) appears at \(t_m = m\lambda_0/(2\sqrt{n^2 - n_{\mathrm{c}}^2})\), about 119 nm per mode for \(n = 3.5\) at 800 nm. The effective index method estimates a strip by solving a vertical slab and then a lateral slab with the slab index as its core, with the TE and TM roles swapped in the second step.`,
sheet: [
[String.raw`\[ 2\kappa t - 2\varphi_{\mathrm{r}} = 2\pi m \]`, "Transverse resonance: round-trip phase"],
[String.raw`\[ \tan\!\left(\frac{\kappa t}{2} - \frac{m\pi}{2}\right) = \frac{\zeta\gamma}{\kappa} \]`, "Slab equation (Andreani and Gerace App. C, not in the thesis)"],
[String.raw`\[ \kappa = k_{0}\sqrt{n^{2} - n_{\mathrm{eff}}^{2}}, \qquad \gamma = k_{0}\sqrt{n_{\mathrm{eff}}^{2} - n_{\mathrm{c}}^{2}} \]`, "Transverse wavenumber and decay constant"],
[String.raw`\[ \zeta = 1 \ \text{(TE)}, \qquad \left(\frac{n}{n_{\mathrm{c}}}\right)^{2} \ \text{(TM)} \]`, "Polarization factor, the field jump of Eq. 2.1"],
[String.raw`\[ t_m = \frac{m\lambda_{0}}{2\sqrt{n^{2} - n_{\mathrm{c}}^{2}}} \]`, "Cutoff thickness of mode m"],
[String.raw`\[ \mathrm{slab}(n, t) \to n_{\mathrm{slab}}, \qquad \mathrm{slab}(n_{\mathrm{slab}}, w) \to n_{\mathrm{eff}} \]`, "Effective index method, two steps"]],
consts: String.raw`Examples: \(n = 3.5\), \(n_{\mathrm{c}} = 1\), \(\lambda_0 = 800\) nm. Computed live, not thesis values.`,
sources: ["Andreani and Gerace, Phys. Rev. B 73, 235114 (2006), Appendix C, Eqs. (C1) to (C4) (guided-mode expansion study of photonic crystal slabs)", "Johnson et al., Phys. Rev. B 60, 5751 (1999) (slab thickness rule, energy in the slab)", "Soldano and Pennings, J. Lightwave Technol. 13, 615 (1995), Sec. II (effective index reduction of MMI sections to 2D)"]
});

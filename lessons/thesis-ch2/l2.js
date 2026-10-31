addLesson("thesis", "ch2", {
level: "Basic",
id: "thesis-ch2-l2", title: "Slab modes: TE and TM", short: "2. Slab modes, TE and TM",
big: String.raw`A membrane with the same medium above and below supports two families of modes. TE modes have their electric field in the plane of the slab and parallel to the surfaces, so it is continuous across them. TM modes have their main electric field normal to the surfaces, and the boundary condition makes it jump up by \(\varepsilon_{\mathrm{core}}/\varepsilon_{\mathrm{air}}\), about 12, just outside. That jump pushes TM light out of the core and lowers its effective index. One equation, written by Andreani and Gerace in their Appendix C, gives both families.`,
bridge: "Lesson 1 showed why only certain angles survive. Here the same condition is solved properly, for both polarizations, with the field profiles. All curves are computed live.",
cards: [
{s: "1. The jump", t: "Boundary conditions: why the TM field jumps",
intu: String.raw`At a surface between two materials, Maxwell's equations fix two things. The field component parallel to the surface is the same on both sides. The normal component of the displacement field \(\mathbf{D} = \varepsilon\mathbf{E}\) is the same on both sides, so the normal component of \(\mathbf{E}\) itself must jump by the ratio of permittivities. For GaAs to air that ratio is \(n^2 \approx 12\). A TE mode has its \(\mathbf{E}\) field parallel to the surfaces, so nothing jumps. A TM mode has its \(\mathbf{E}\) field mostly normal to the surfaces, so just outside the membrane its field is about 12 times stronger than just inside. Drag the index and watch the jump grow.`,
eq: String.raw`\[ E_{\parallel}^{\mathrm{air}} = E_{\parallel}^{\mathrm{core}} \qquad \varepsilon_{\mathrm{air}} E_{z}^{\mathrm{air}} = \varepsilon_{\mathrm{core}} E_{z}^{\mathrm{core}} \]\[ \Longrightarrow\quad E_{z}^{\mathrm{air}} = \frac{\varepsilon_{\mathrm{core}}}{\varepsilon_{\mathrm{air}}}\, E_{z}^{\mathrm{core}} \]`,
sym: [[String.raw`\(E_{\parallel}\)`, "tangential electric field, parallel to the surface"], [String.raw`\(E_{z}\)`, "electric field normal to the membrane surfaces"], [String.raw`\(\varepsilon\)`, String.raw`permittivity, \(\varepsilon = n^2\) (relative)`], [String.raw`\(\mathbf{D}\)`, String.raw`displacement field \(\varepsilon\mathbf{E}\), whose normal part is continuous with no surface charge`]],
how: [String.raw`Faraday's law integrated around a thin loop across the surface gives continuity of tangential \(\mathbf{E}\).`, String.raw`Gauss's law over a thin pillbox gives continuity of normal \(\mathbf{D} = \varepsilon\mathbf{E}\) (no free surface charge).`, String.raw`So \(\varepsilon_1 E_{z1} = \varepsilon_2 E_{z2}\), and \(E_z\) jumps by \(\varepsilon_1/\varepsilon_2\).`, String.raw`This is Eq. 2.1 of your Chapter 2, and the same factor appears as \(\zeta\) in the TM slab equation.`],
say: String.raw`The tangential electric field is continuous at the surface and the normal displacement field is continuous. For TM-like light, whose field is normal to the surfaces, the field just outside is larger by \(\varepsilon_{\mathrm{core}}/\varepsilon_{\mathrm{air}}\), about 12 for GaAs.`,
num: String.raw`\(n = 3.5\): jump factor \(n^2\) = <b>12.25</b><br>\(n = 3.0\) (AlGaAs-like): <b>9</b><br>\(n = 1.45\) (oxide): <b>2.1</b>`,
r(fig, ctl) {
  ctl.innerHTML = sl("n", "Core index n", 1.2, 3.8, 0.01, 3.5) + btns([["TE", "TE (field parallel)"], ["TM", "TM (field normal)"]], "p") + '<div class="readout" id="ro"></div>';
  let pol = "TM";
  const u = () => {
    const n = +$("n").value; $("nv").textContent = n.toFixed(2); pick(ctl, "p", pol);
    const N = C2.slabN(n, 1, 160, 800, 0, pol), zs = range(-300, 300, 300);
    const pr = C2.slabProfile(n, 1, 160, 800, 0, pol, N, zs), ys = pol === "TE" ? pr.main : pr.ez;
    fig.innerHTML = svg(270, `<rect x="${340 - 80 * 0.9}" y="30" width="${160 * 0.9}" height="200" fill="var(--blue-bg)"/><text class="ts" x="340" y="248" text-anchor="middle">core, 160 nm</text>${plot(70, 30, 540, 200, zs, ys, -300, 300, 0, 1.05, pol === "TE" ? "#378ADD" : "#D85A30", 2.5)}<line x1="70" x2="610" y1="230" y2="230" stroke="var(--p)"/><text class="ts" x="76" y="44">${pol === "TE" ? "E_y (parallel to surfaces): continuous" : "E_z (normal to surfaces): jumps at both surfaces"}</text>`);
    $("ro").innerHTML = `<div><span>jump factor n²</span><b>${(n * n).toFixed(2)}</b></div><div><span>n<sub>eff</sub> of the ${pol}0 mode</span><b>${N ? N.toFixed(3) : "—"}</b></div>`;
  };
  ctl.querySelectorAll("button").forEach(b => b.onclick = () => { pol = b.dataset.p; u(); });
  $("n").oninput = u; u();
}},

{s: "2. Solving it", t: "Solving the slab equation graphically",
intu: String.raw`The slab equation has the mode's \(n_{\mathrm{eff}}\) on both sides, so it cannot be solved with algebra. Plot both sides against \(n_{\mathrm{eff}}\) and look for crossings. The left side, \(\tan(\kappa t/2 - m\pi/2)\), climbs through branches. The right side, \(\zeta\gamma/\kappa\), rises smoothly from zero. Each crossing is one mode. For TM the right side is multiplied by \(\zeta = (n/n_{\mathrm{c}})^2\), about 12, so it rises much faster and the crossing moves to a lower \(n_{\mathrm{eff}}\). That is the whole reason TM modes have lower effective index. Andreani and Gerace 2006 studied photonic crystal slabs with a guided-mode expansion method that builds patterned-slab fields out of these plain slab modes, and their Appendix C states these equations for a slab in the same medium on both sides.`,
eq: String.raw`\[ \tan\!\left(\frac{\kappa t}{2} - \frac{m\pi}{2}\right) = \zeta\,\frac{\gamma}{\kappa} \]\[ \kappa = k_{0}\sqrt{n^{2} - n_{\mathrm{eff}}^{2}}, \qquad \gamma = k_{0}\sqrt{n_{\mathrm{eff}}^{2} - n_{\mathrm{c}}^{2}} \]\[ \zeta = 1 \ \text{(TE)}, \qquad \zeta = \left(\frac{n}{n_{\mathrm{c}}}\right)^{2} \ \text{(TM)} \]<div class="eqref">Andreani and Gerace, Eqs. (C1) to (C4)</div>`,
sym: [[String.raw`\(\kappa\)`, String.raw`transverse wavenumber in the core (their \(q\))`], [String.raw`\(\gamma\)`, String.raw`decay constant in the cladding (their \(\chi_1\))`], [String.raw`\(m\)`, String.raw`mode order. Even \(m\): (C1) and (C4). Odd \(m\): (C2) and (C3)`], [String.raw`\(\zeta\)`, "boundary factor from card 1"], [String.raw`\(k_{0}\)`, String.raw`\(2\pi/\lambda_0\)`]],
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
    $("ro").innerHTML = sols.map(([m, N]) => `<div><span>${pol}${m}</span><b>N = ${N.toFixed(3)}</b></div>`).join("") || `<div><span>modes</span><b>none</b></div>`;
  };
  ctl.querySelectorAll("button").forEach(b => b.onclick = () => { pol = b.dataset.p; u(); });
  $("t").oninput = u; u();
}},

{s: "3. Profiles", t: "What the modes look like across the slab",
intu: String.raw`Each mode has a field shape across the thickness. Even modes (TE0, TM0) have no zero inside the core. Odd modes (TE1, TM1) have one zero at the mid-plane, so their field is positive on one side and negative on the other. Outside, every mode decays exponentially. Pick a mode and change the thickness. For TM, the curve shown is \(E_z\), so you can see the jump at the two surfaces. Notice that near cutoff (thin slab, or a higher-order mode) the tails get long: most of the light is then in the air.`,
eq: String.raw`\[ \text{inside: } f(z) = \begin{cases} \cos(\kappa z) & m \text{ even} \\ \sin(\kappa z) & m \text{ odd} \end{cases} \qquad \text{outside: } f(t/2)\, e^{-\gamma(|z| - t/2)} \]\[ \text{TE: } f = E_{y} \qquad \text{TM: } f = H_{y}, \quad E_{z} = \frac{\beta H_{y}}{\omega\varepsilon} \propto \frac{H_{y}}{n^{2}(z)} \]`,
sym: [[String.raw`\(f(z)\)`, "transverse profile of the main field"], [String.raw`\(E_{y}\)`, "TE main field, parallel to the surfaces"], [String.raw`\(H_{y}\)`, "TM magnetic field, continuous"], [String.raw`\(E_{z}\)`, String.raw`TM main electric field, \(\propto H_y/\varepsilon\), so it jumps`]],
how: [String.raw`Solve card 2 for \(n_{\mathrm{eff}}\), which gives \(\kappa\) and \(\gamma\).`, String.raw`Write \(\cos\) or \(\sin\) inside and an exponential tail outside, matched at the surfaces.`, String.raw`For TM, compute \(E_z\) from \(H_y\) using Maxwell's equations: \(E_z \propto H_y/\varepsilon\).`, "Normalize so the largest value is 1."],
say: "Fundamental modes have no node across the slab. First-order modes have one node at the mid-plane and are odd. TM electric fields peak just outside the surfaces because of the permittivity jump.",
num: "Mid-plane value: TE0 and TM0 are maximal there, TE1 and TM1 are exactly zero there. This sets which modes a dot at the mid-plane can couple to (Chapter 1, Lesson 6).",
r(fig, ctl) {
  let md = "TE0";
  ctl.innerHTML = btns([["TE0", "TE0"], ["TM0", "TM0"], ["TE1", "TE1"], ["TM1", "TM1"]], "m") + sl("t", "Thickness t", 60, 400, 5, 220) + '<div class="readout" id="ro"></div>';
  const u = () => {
    pick(ctl, "m", md); const t = +$("t").value; $("tv").textContent = t + " nm";
    const pol = md.slice(0, 2), m = +md[2], N = C2.slabN(3.5, 1, t, 800, m, pol), zs = range(-350, 350, 350);
    if (!N) { fig.innerHTML = svg(270, `<text class="th" x="340" y="130" text-anchor="middle">${md} is cut off at this thickness</text>`); $("ro").innerHTML = `<div><span>${md}</span><b>not guided</b></div>`; return; }
    const pr = C2.slabProfile(3.5, 1, t, 800, m, pol, N, zs), ys = pol === "TE" ? pr.main : pr.ez;
    const w = t / 700 * 540;
    fig.innerHTML = svg(270, `<rect x="${340 - w / 2}" y="20" width="${w}" height="230" fill="var(--blue-bg)"/><line x1="70" x2="610" y1="135" y2="135" stroke="var(--p)" stroke-width="0.6"/><line x1="340" x2="340" y1="20" y2="250" stroke="var(--p)" stroke-dasharray="3 3" opacity="0.6"/>${plot(70, 20, 540, 230, zs, ys, -350, 350, -1.05, 1.05, pol === "TE" ? "#378ADD" : "#D85A30", 2.5)}<text class="ts" x="76" y="36">${pol === "TE" ? "E_y" : "E_z"} of ${md} across z, −350 to 350 nm</text><text class="ts" x="344" y="262">mid-plane</text>`);
    $("ro").innerHTML = `<div><span>n<sub>eff</sub></span><b>${N.toFixed(3)}</b></div><div><span>decay length 1/γ</span><b>${(1 / pr.gamma).toFixed(0)} nm</b></div>`;
  };
  ctl.querySelectorAll("button").forEach(b => b.onclick = () => { md = b.dataset.m; u(); });
  $("t").oninput = u; u();
}},

{s: "4. Versus thickness", t: "How n<sub>eff</sub> changes with thickness, and cutoffs",
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

{s: "5. Confinement", t: "How much light is inside the GaAs",
intu: "The fraction of power that travels inside the core is the confinement factor. It decides how strongly the mode feels the GaAs: how much it is slowed down, how strongly a grating etched into it scatters, how strongly a dot in the core couples. A thin slab lets most of the mode leak into the air. A thick one holds almost all of it. Johnson et al. found that in their slab more than 90 % of the energy of the lowest modes sat inside the slab height. Move the thickness and compare TE0 with TE1.",
eq: String.raw`\[ \Gamma_{\mathrm{core}} = \frac{\int_{\mathrm{core}} |E_{y}|^{2}\, \mathrm{d}z}{\int |E_{y}|^{2}\, \mathrm{d}z} \]<div class="eqref">TE, a good estimate of the power fraction</div>`,
sym: [[String.raw`\(\Gamma_{\mathrm{core}}\)`, "confinement factor, fraction of the mode inside the core"], [String.raw`\(E_{y}\)`, "TE field profile from card 3"]],
how: [String.raw`For a TE slab mode, the power flow along the guide is proportional to \(|E_y|^2\) at every \(z\).`, String.raw`Integrate \(|E_y|^2\) over the core and over all \(z\).`, "Their ratio is the fraction of power inside the core.", String.raw`The evanescent tail length \(1/\gamma\) controls how much is outside.`],
say: "The confinement factor of the fundamental mode grows with thickness. Near cutoff a mode is mostly in the cladding and weakly guided.",
num: String.raw`\(n = 3.5\), \(\lambda = 800\) nm, TE0: \(t = 80\) nm ≈ <b>70 %</b>, \(t = 160\) nm ≈ <b>91 %</b>, \(t = 300\) nm ≈ <b>98 %</b> (computed by this page)`,
r(fig, ctl) {
  ctl.innerHTML = sl("t", "Thickness t", 20, 400, 5, 160) + '<div class="readout" id="ro"></div>';
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

{s: "6. TE above TM", t: "Why TE is always above TM, and why it matters",
intu: String.raw`Card 2 showed the reason in the equation: \(\zeta = (n/n_{\mathrm{c}})^2\) makes the TM right-hand side climb faster, which lowers its solution. Physically, TM light is pushed out into the air by the field jump of card 1, and light that travels more in air has a lower effective index. The gap between TE and TM grows with index contrast. Drag the core index from a weak waveguide to GaAs and watch the gap open. This gap is useful and harmful at once: it makes grating couplers strongly polarization selective (Lesson 5), and it gives the two polarizations different beat lengths in an MMI (Lesson 7), which is how an MMI can split them.`,
eq: String.raw`\[ n_{\mathrm{eff},m}^{\mathrm{TM}} \lt n_{\mathrm{eff},m}^{\mathrm{TE}} \qquad \text{gap grows with contrast } n/n_{\mathrm{c}} \ \text{(through } \zeta\text{)} \]`,
sym: [[String.raw`\(n_{\mathrm{eff}}^{\mathrm{TE}}, n_{\mathrm{eff}}^{\mathrm{TM}}\)`, "effective indices of TE and TM modes of the same order"], [String.raw`\(n/n_{\mathrm{c}}\)`, "index contrast between core and cladding"]],
how: [String.raw`For a weak guide, \(\zeta \approx 1\) and TE and TM are nearly degenerate.`, String.raw`For strong contrast, \(\zeta \approx 12\) and the TM solution moves to a much lower \(n_{\mathrm{eff}}\).`, "So high-contrast membranes are strongly birefringent.", "Taillaert et al. 2006 report the same effect in silicon-on-insulator: TE 2.83 versus TM 1.89."],
say: "TM-like modes of a high-contrast membrane have a much lower effective index than TE-like modes, because the permittivity jump pushes their field into the cladding.",
num: String.raw`Taillaert et al. 2006, 220 nm silicon on oxide at 1550 nm: TE <b>2.83</b>, TM <b>1.89</b><br>This page, \(n = 3.5\) membrane in air at 800 nm, \(t = 160\) nm: gap ≈ <b>0.50</b>`,
r(fig, ctl) {
  ctl.innerHTML = sl("n", "Core index n", 1.1, 3.8, 0.01, 3.5) + sl("t", "Thickness t", 60, 400, 5, 160) + '<div class="readout" id="ro"></div>';
  const u = () => {
    const n = +$("n").value, t = +$("t").value; $("nv").textContent = n.toFixed(2); $("tv").textContent = t + " nm";
    const ns = range(1.05, 3.8, 80), te = ns.map(x => C2.slabN(x, 1, t, 800, 0, "TE")), tm = ns.map(x => C2.slabN(x, 1, t, 800, 0, "TM"));
    const a = C2.slabN(n, 1, t, 800, 0, "TE"), b = C2.slabN(n, 1, t, 800, 0, "TM");
    const X = v => 60 + (v - 1.05) / 2.75 * 560, Y = v => 230 - (v - 1) / 2.8 * 200;
    const pth = arr => { let d = ""; arr.forEach((v, i) => { if (!v) return; d += (d ? "L" : "M") + X(ns[i]).toFixed(1) + " " + Y(v).toFixed(1); }); return d; };
    fig.innerHTML = svg(260, `<path d="${pth(te)}" fill="none" stroke="#378ADD" stroke-width="2.5"/><path d="${pth(tm)}" fill="none" stroke="#D85A30" stroke-width="2.5"/><line x1="${X(n)}" x2="${X(n)}" y1="30" y2="230" stroke="#EF9F27" stroke-width="2"/><line x1="60" x2="620" y1="230" y2="230" stroke="var(--p)"/><text class="ts" x="340" y="250" text-anchor="middle">core index, 1.05 to 3.8 (cladding = air)</text><text class="ts" x="66" y="44">blue TE0, coral TM0: n<tspan baseline-shift='sub' font-size='75%'>eff</tspan> versus core index</text>`);
    $("ro").innerHTML = `<div><span>TE0</span><b>${a.toFixed(3)}</b></div><div><span>TM0</span><b>${b.toFixed(3)}</b></div><div><span>gap</span><b>${(a - b).toFixed(3)}</b></div>`;
  };
  $("n").oninput = u; $("t").oninput = u; u();
}}
],
summary: String.raw`At a surface the tangential \(\mathbf{E}\) field and the normal \(\mathbf{D}\) field are continuous, so a field normal to the membrane jumps by \(\varepsilon_{\mathrm{core}}/\varepsilon_{\mathrm{air}} \approx 12\). TE modes have their field parallel to the surfaces, TM modes normal to them. Both obey \(\tan(\kappa t/2 - m\pi/2) = \zeta\gamma/\kappa\), with \(\zeta = 1\) for TE and \((n/n_{\mathrm{c}})^2\) for TM, as in Andreani and Gerace's Appendix C. The TM factor lowers the TM effective index. Fundamental modes have no cutoff, mode \(m\) appears at \(t_m = m\lambda_0/(2\sqrt{n^2 - n_{\mathrm{c}}^2})\), and the confinement factor grows with thickness.`,
sheet: [
[String.raw`\[ E_{z}^{\mathrm{air}} = \frac{\varepsilon_{\mathrm{core}}}{\varepsilon_{\mathrm{air}}}\, E_{z}^{\mathrm{core}} \]`, "Field jump (Ch. 2 Eq. 2.1)"],
[String.raw`\[ \tan\!\left(\frac{\kappa t}{2} - \frac{m\pi}{2}\right) = \frac{\zeta\gamma}{\kappa} \]`, "Slab equation (Ch. 2 Eq. 2.2, Andreani App. C)"],
[String.raw`\[ \kappa = k_{0}\sqrt{n^{2} - n_{\mathrm{eff}}^{2}}, \qquad \gamma = k_{0}\sqrt{n_{\mathrm{eff}}^{2} - n_{\mathrm{c}}^{2}} \]`, "Transverse wavenumber and decay"],
[String.raw`\[ \zeta = 1 \ \text{(TE)}, \qquad \left(\frac{n}{n_{\mathrm{c}}}\right)^{2} \ \text{(TM)} \]`, "Polarization factor"],
[String.raw`\[ t_m = \frac{m\lambda_{0}}{2\sqrt{n^{2} - n_{\mathrm{c}}^{2}}} \]`, "Cutoff thickness"],
[String.raw`\[ \Gamma = \frac{\int_{\mathrm{core}} |E|^{2}}{\int |E|^{2}} \]`, "Confinement factor"]],
consts: String.raw`Examples: \(n = 3.5\), \(n_{\mathrm{c}} = 1\), \(\lambda_0 = 800\) nm. Computed live, not thesis values.`,
sources: ["Andreani and Gerace, Phys. Rev. B 73, 235114 (2006), Appendix C, Eqs. (C1) to (C4) (guided-mode expansion study of photonic crystal slabs)", "Johnson et al., Phys. Rev. B 60, 5751 (1999) (slab thickness rule, energy in the slab)", "Taillaert et al., Jpn. J. Appl. Phys. 45, 6071 (2006) (TE and TM indices in SOI)"]
});

/* Lesson 1.1: Maxwell's curl equations as a time-stepping problem. */
addLesson("fdtd", "a1", {
level: "Basic", num: "Lesson 1.1",
id: "fdtd-1-1", title: "Maxwell's curl equations as a time-stepping problem", short: "1.1 Maxwell in time",
big: String.raw`FDTD starts from only two of Maxwell's four equations, Faraday's law and Ampère's law, written as "how fast E and H change right now". If you know E and H everywhere at one instant, these two equations give them a moment later, and repeating that is the whole method. The other two equations, the divergence laws, never have to be solved: the curl equations keep them true by themselves. For the materials of a photonic chip (linear, isotropic, not magnetic) the device appears in the equations only through the relative permittivity \(\varepsilon_r(\mathbf{r})\), so designing a device means choosing \(\varepsilon_r\) in space.`,
bridge: String.raw`Taflove and Hagness Ch. 3, Schneider Ch. 2 and 3. The next lesson replaces the derivatives by differences.`,
cards: [
{s: "1. Four become two", t: "From Maxwell's four equations to the two that FDTD steps",
intu: String.raw`Step through. Start from the four equations. Then say what the materials are like: linear (fields add), isotropic (same response in every direction), not magnetic, possibly with a small conductivity \(\sigma\). Solve the two curl equations for their time derivatives. What is left is a recipe: the rate of change of \(\mathbf{E}\) at a point depends on the curl of \(\mathbf{H}\) around it, and the rate of change of \(\mathbf{H}\) on the curl of \(\mathbf{E}\). The orange \(\varepsilon_r(\mathbf{r})\) is the only place the device geometry enters.`,
eq: String.raw`\[ \frac{\partial \mathbf{E}}{\partial t} = \frac{1}{\varepsilon_0\varepsilon_r(\mathbf{r})}\Big(\nabla\times\mathbf{H} - \sigma\mathbf{E} - \mathbf{J}\Big), \qquad \frac{\partial \mathbf{H}}{\partial t} = -\frac{1}{\mu_0}\nabla\times\mathbf{E} \]`,
sym: [[String.raw`\(\mathbf{E}, \mathbf{H}\)`, "electric field (V/m) and magnetic field (A/m)"], [String.raw`\(\varepsilon_0, \mu_0\)`, "vacuum permittivity and permeability"], [String.raw`\(\varepsilon_r(\mathbf{r})\)`, "relative permittivity at each point: the device"], [String.raw`\(\sigma\)`, "electric conductivity (S/m), zero for a lossless dielectric"], [String.raw`\(\mathbf{J}\)`, "source current density, nonzero only on the source plane"]],
how: [String.raw`Faraday: \(\nabla\times\mathbf{E} = -\partial\mathbf{B}/\partial t\). Ampère with Maxwell's correction: \(\nabla\times\mathbf{H} = \partial\mathbf{D}/\partial t + \mathbf{J}_\mathrm{total}\).`, String.raw`Constitutive relations: \(\mathbf{D} = \varepsilon_0\varepsilon_r\mathbf{E}\), \(\mathbf{B} = \mu_0\mathbf{H}\), and the current splits into a conduction part \(\sigma\mathbf{E}\) and the source \(\mathbf{J}\).`, "Solve each equation for its time derivative. These two lines are exactly what the solver advances."],
say: String.raw`FDTD advances Faraday's and Ampère's laws in time. The structure enters only through the material terms, \(\varepsilon_r(\mathbf{r})\) and \(\sigma(\mathbf{r})\).`,
num: String.raw`\(\varepsilon_0 = 8.854\times10^{-12}\) F/m, \(\mu_0 = 4\pi\times10^{-7}\) H/m, \(c = 1/\sqrt{\varepsilon_0\mu_0} = 2.998\times10^8\) m/s. A material with \(n = 3.5\) has \(\varepsilon_r = 12.25\).`,
r(fig, ctl) {
  const T = [
    [String.raw`\nabla\times\mathbf{E} = -\frac{\partial \mathbf{B}}{\partial t}, \qquad \nabla\times\mathbf{H} = \frac{\partial \mathbf{D}}{\partial t} + \mathbf{J}_\mathrm{total}`, String.raw`\nabla\cdot\mathbf{D} = \rho, \qquad \nabla\cdot\mathbf{B} = 0`],
    [String.raw`\mathbf{D} = \varepsilon_0\,\varepsilon_r(\mathbf{r})\,\mathbf{E}, \qquad \mathbf{B} = \mu_0\,\mathbf{H}, \qquad \mathbf{J}_\mathrm{total} = \sigma\mathbf{E} + \mathbf{J}`],
    [String.raw`\frac{\partial \mathbf{E}}{\partial t} = \frac{1}{\varepsilon_0\,{\color{#c9562e}\varepsilon_r(\mathbf{r})}}\Big(\nabla\times\mathbf{H} - {\color{#c9562e}\sigma}\mathbf{E} - \mathbf{J}\Big)`, String.raw`\frac{\partial \mathbf{H}}{\partial t} = -\frac{1}{\mu_0}\nabla\times\mathbf{E}`],
    [String.raw`\frac{\partial E_z}{\partial t} = \frac{1}{\varepsilon_0\varepsilon_r}\Big(\frac{\partial H_y}{\partial x} - \frac{\partial H_x}{\partial y}\Big), \quad \frac{\partial H_x}{\partial t} = -\frac{1}{\mu_0}\frac{\partial E_z}{\partial y}, \quad \frac{\partial H_y}{\partial t} = \frac{1}{\mu_0}\frac{\partial E_z}{\partial x}`]
  ];
  const cap = ["The four Maxwell equations, in the form with D, B and the total current.", "What the materials are like: linear, isotropic, not magnetic, conductivity σ. The source current J is the only thing we add by hand.", "Solve the two curl equations for the time derivatives. These two are what FDTD steps. The device is only in the orange terms.", String.raw`Written out for one set of components in 2D (\(E_z, H_x, H_y\)). Each line is a rate of change equal to a spatial derivative of the other field. Lesson 1.3 turns these into update equations.`];
  LC.steps(ctl, 4, k => { LC.mathFig(fig, T[k]); return cap[k]; });
}},
{s: "2. The divergence laws", t: "Why the divergence equations never need solving",
intu: String.raw`Take the divergence of Faraday's law: the divergence of a curl is always zero, so \(\nabla\cdot\mathbf{B}\) cannot change in time. The same holds for \(\nabla\cdot\mathbf{D}\) away from sources. On the Yee grid this survives exactly, not just approximately. The plot shows a real 2D FDTD run: the largest discrete \(\nabla\cdot\mathbf{H}\) anywhere in the grid, on a log scale, while a pulse spreads. It stays at the round-off level of the arithmetic. Press "Plant a magnetic charge" to start with a field whose divergence is not zero. The divergence then stays at its starting value forever, because the update can neither create nor remove it.`,
eq: String.raw`\[ \frac{\partial}{\partial t}\left(\nabla\cdot\mathbf{B}\right) = -\nabla\cdot\left(\nabla\times\mathbf{E}\right) = 0 \]`,
sym: [[String.raw`\(\nabla\cdot(\nabla\times\mathbf{A}) = 0\)`, "a vector identity, true for any smooth field"], [String.raw`discrete \(\nabla\cdot\mathbf{H}\)`, "the sum of H differences around one Yee cell"]],
how: ["Take the divergence of both sides of Faraday's law.", "The divergence of a curl vanishes, so the divergence of B is constant in time.", "Start the simulation with zero fields (zero divergence) and it stays zero.", "On the Yee grid the discrete divergence of the discrete curl also cancels term by term, which is one of the reasons the staggered grid is used."],
say: "The divergence laws are initial conditions. If the fields start divergence-free, the curl equations keep them divergence-free, and on the Yee grid this holds exactly.",
num: "The plot is computed in 32-bit floats, so round-off is near 1e-7 of the field size.",
r(fig, ctl) {
  ctl.innerHTML = `<div class="row"><button id="d0">Start from zero fields</button><button id="d1">Plant a magnetic charge</button></div><div class="readout" id="ro"></div>`;
  const nx = 120, ny = 80;
  let sim, hist, plant;
  const divH = () => { let m = 0; for (let j = 20; j < ny - 21; j++) for (let i = 20; i < nx - 21; i++) { const k = j * nx + i, d = (sim.hx[k + 1] - sim.hx[k]) + (sim.hy[k + nx] - sim.hy[k]); m = Math.max(m, Math.abs(d)); } return m; };
  const reset = p => {
    plant = p; sim = new C2.FDTD2D(nx, ny, 0.5, null, 12); hist = [];
    if (p) for (let j = 35; j < 45; j++) for (let i = 55; i < 65; i++) { sim.hx[j * nx + i] = 0.02 * (i - 60); sim.hy[j * nx + i] = 0.02 * (j - 40); }
  };
  $("d0").onclick = () => reset(false); $("d1").onclick = () => reset(true); reset(false);
  anim(() => {
    if (!fig.isConnected) { stopAnim(); return; }
    for (let s = 0; s < 3 && sim.t < 600; s++) { sim.step([40, 40, FD.pulse(sim.t, 40, 12, 2 * Math.PI * 0.5 / 16)]); hist.push(Math.log10(divH() + 1e-12)); }
    const ts = hist.map((_, i) => i);
    let s = C3.frame(70, 20, 560, 170, 0, 600, -12, 0, [0, 200, 400, 600], [-12, -8, -4, 0], "time step", "log₁₀ max |div H|") + plot(70, 20, 560, 170, ts, hist, 0, 600, -12, 0, "var(--coral)", 2);
    fig.innerHTML = svg(232, s);
    $("ro").innerHTML = FD.ro([["time step", sim.t], ["largest |div H| now", hist.length ? FD.sci(Math.pow(10, hist[hist.length - 1]), 1) : "0"], ["start", plant ? "divergence planted" : "zero fields"]]);
  });
}},
{s: "3. E and H chase", t: "Light is E and H creating each other",
intu: String.raw`This is a real 1D FDTD run with one electric component \(E_z\) (blue) and one magnetic component \(H_y\) (coral). A soft source in the middle kicks \(E_z\). The changing \(E_z\) creates \(H_y\) beside it, which creates \(E_z\) further along, so two pulses run away from the source. Look at the signs: in the pulse going to the right, \(E_z\) and \(H_y\) have opposite signs, in the pulse going left the same sign. That is the Poynting vector \(\mathbf{E}\times\mathbf{H}\) pointing away from the source on both sides. The grey ends absorb the pulses.`,
eq: String.raw`\[ \mathbf{S} = \mathbf{E}\times\mathbf{H}, \qquad S_x = -E_z H_y \]`,
sym: [[String.raw`\(\mathbf{S}\)`, "Poynting vector: power flow per area (W/m²)"], [String.raw`\(S_x\)`, "its x component for the pair (Ez, Hy)"]],
how: [String.raw`For \(E_z\) and \(H_y\): \(\hat{z}\times\hat{y} = -\hat{x}\), so \(S_x = -E_zH_y\).`, String.raw`Power flows to \(+x\) when \(E_z\) and \(H_y\) have opposite signs.`, String.raw`In vacuum the ratio \(|E|/|H|\) is the impedance \(\eta_0 = \sqrt{\mu_0/\varepsilon_0} \approx 377\ \Omega\) (here both are scaled to the same size).`],
say: "A changing electric field creates a magnetic field and the changing magnetic field recreates the electric field one step further along. Their cross product points in the direction the energy travels.",
num: "400 cells, Courant number 0.5, absorbing layers of 30 cells at each end.",
r(fig, ctl) {
  let sim;
  const go = () => { sim = new FD.Yee1(400, 0.5, null, { bc: "pml", pml: 30 }); };
  go(); const P = FD.player(ctl, go);
  ctl.insertAdjacentHTML("beforeend", `<div class="readout" id="ro"></div>`);
  anim(() => {
    if (!fig.isConnected) { stopAnim(); return; }
    if (P.run && sim.t < 1000) for (let i = 0; i < 3; i++) sim.step({ i: 200, v: FD.pulse(sim.t, 60, 16) });
    let iR = 200, mR = 0, iL = 200, mL = 0; for (let i = 0; i < 400; i++) { const v = Math.abs(sim.ez[i]); if (i > 200 && v > mR) { mR = v; iR = i; } if (i < 200 && v > mL) { mL = v; iL = i; } }
    const sR = -sim.ez[iR] * sim.hy[iR], sL = -sim.ez[iL] * sim.hy[iL];
    fig.innerHTML = svg(215, FD.draw1(sim, { hy: true, src: 200, amp: 0.8 }) + C3.legend(60, 205, [["Ez", "var(--blue)"], ["Hy", "var(--coral)"]]) + FD.txt(640, 205, `time step ${sim.t}`, "ts", "end"));
    $("ro").innerHTML = FD.ro([["left pulse: Ez and Hy", mL > 0.02 ? (Math.sign(sim.ez[iL]) === Math.sign(sim.hy[iL]) ? "same sign" : "opposite sign") : "not yet"], ["S_x on the left", mL > 0.02 ? (sL < 0 ? "negative, to the left" : "positive") : "not yet"], ["right pulse: Ez and Hy", mR > 0.02 ? (Math.sign(sim.ez[iR]) === Math.sign(sim.hy[iR]) ? "same sign" : "opposite sign") : "not yet"], ["S_x on the right", mR > 0.02 ? (sR > 0 ? "positive, to the right" : "negative") : "not yet"]]);
  });
}},
{s: "4. Inside a material", t: "Slower and shorter in a dielectric, weaker in a lossy one",
intu: String.raw`A steady wave comes from the left and enters a material (shaded). Move the index slider. Inside, the wave travels at \(c/n\), so at the same frequency its wavelength shrinks to \(\lambda_0/n\). Now add conductivity. The wave also decays as it travels, because \(\sigma\mathbf{E}\) turns field energy into heat. With loss the permittivity is complex, so the simple rule \(\varepsilon_r = n^2\) with real \(n\) no longer holds. This matters later: a semiconductor at a photon energy above its bandgap absorbs, and pretending it is lossless overstates the transmission.`,
eq: String.raw`\[ v = \frac{c}{n}, \qquad \lambda = \frac{\lambda_0}{n}, \qquad \tilde\varepsilon_r = \varepsilon_r + \frac{i\sigma}{\omega\varepsilon_0} = (n + i\kappa)^2 \]`,
sym: [[String.raw`\(n, \kappa\)`, "real and imaginary parts of the complex refractive index"], [String.raw`\(\tilde\varepsilon_r\)`, String.raw`complex permittivity (time convention \(e^{-i\omega t}\), the one Tidy3D uses)`], [String.raw`\(\alpha = 4\pi\kappa/\lambda_0\)`, "intensity absorption coefficient"]],
how: ["Combine the two curl equations into a wave equation. Its speed is 1/√(εμ) = c/n.", "Same frequency, lower speed, so a shorter wavelength.", String.raw`With conductivity, the time-harmonic Ampère law gains \(\sigma\mathbf{E}\), which is the same as an imaginary part of the permittivity, and the wave decays as \(e^{-\alpha x/2}\) in amplitude.`],
say: String.raw`\(\varepsilon_r = n^2\) holds only for a lossless, non-dispersive material. With loss the permittivity is complex and the index has an imaginary part \(\kappa\).`,
num: String.raw`At \(\lambda_0 = 800\) nm and \(n = 3.5\): \(\lambda = 229\) nm inside. In the demo \(\lambda_0 = 40\) cells.`,
r(fig, ctl) {
  ctl.innerHTML = sl("nn", "Index n", 1, 3.5, 0.1, 2) + sl("sg", "Conductivity (demo units)", 0, 0.1, 0.005, 0) + `<div class="readout" id="ro"></div>`;
  let sim;
  const reset = () => {
    const n = +$("nn").value, sg = +$("sg").value; $("nnv").textContent = n.toFixed(1); $("sgv").textContent = sg.toFixed(3);
    const eps = new Float64Array(400).fill(1); for (let i = 200; i < 400; i++) eps[i] = n * n;
    sim = new FD.Yee1(400, 0.5, eps, { bc: "pml", pml: 30 });
    for (let i = 200; i < 370; i++) { const l = sg / eps[i] / 2 * 0.5 / 0.5; sim.ce[i] = (1 - l) / (1 + l); sim.de[i] = 0.5 / eps[i] / (1 + l); }
    $("ro").innerHTML = FD.ro([["wavelength outside", "40 cells"], ["wavelength inside", FD.f(40 / n, 1) + " cells"], ["speed inside", FD.f(1 / n, 2) + " c"], ["loss", sg > 0 ? "the wave decays inside" : "none"]]);
  };
  $("nn").oninput = reset; $("sg").oninput = reset; reset();
  anim(() => {
    if (!fig.isConnected) { stopAnim(); return; }
    for (let i = 0; i < 4; i++) sim.step({ i: 60, v: 0.5 * Math.sin(2 * Math.PI * 0.5 * sim.t / 40) * (1 - Math.exp(-sim.t / 80)) });
    fig.innerHTML = svg(205, FD.draw1(sim, { src: 60, amp: 1.6 }) + FD.txt(50 + 200 / 399 * 590 + 8, 196, "material") + FD.txt(90, 196, "air"));
  });
}},
FD.ckpt({ step: 4, t: "The PBS run steps exactly these two equations",
  intu: String.raw`In the PBS run, every material is a number \(\varepsilon_r\) in every cell: about 12.2 in the membrane, 1 in air. The design region is the same thing with a value that the optimizer sets pixel by pixel. Nothing else in the two equations knows about the device. Switch to the code view: the materials are defined once as media, attached to geometries as structures, and the Simulation object collects them. The two update equations of this lesson run when the job is started.`,
  code: ["import tidy3d as td", "", "n_mem = 3.492", "membrane = td.Medium(permittivity=n_mem**2)      # eps_r = n^2: lossless, no dispersion", "", "wg_in = td.Structure(geometry=td.Box(center=(-2.5, 0, 0), size=(3.0, 0.2, 0.16)),", "                     medium=membrane)", "design = td.Structure(geometry=td.Box(size=(2.5, 2.5, 0.16)),", "                      medium=td.CustomMedium(permittivity=eps_pixels))  # set by the optimizer", "", "sim = td.Simulation(size=(Lx, Ly, Lz), structures=[wg_in, wg_te, wg_tm, design],", "                    sources=[mode_source], monitors=[...], run_time=1e-12, ...)"],
  hi: [3, 8],
  on: ["design", "ports", "src"], cap: "every cell holds one permittivity value. The design region holds the ones the optimizer chooses.",
  eq: String.raw`\[ \varepsilon_r(\mathbf{r}) = \begin{cases} n^2 & \text{membrane} \\ 1 & \text{air} \\ 1 + \rho(\mathbf{r})(n^2 - 1) & \text{design region} \end{cases} \]`,
  sym: [[String.raw`\(\rho(\mathbf{r})\)`, "design density between 0 (air) and 1 (membrane), Part B"]],
  how: ["Define the media.", "Attach them to geometries (structures).", "The Simulation object maps every structure onto the grid as permittivity values. The updates then use only those numbers."],
  say: "To the solver the PBS is only a map of permittivity. The optimizer changes that map inside the design region and nothing else.",
  num: String.raw`\(3.492^2 = 12.19\). The code shown is a simplified sketch of the setup, not the thesis script.`,
  note: "Which equations does Tidy3D actually solve? The two curl equations of card 1, discretized on the Yee grid, with dispersive materials handled by extra auxiliary equations (Lesson 5.1)."
})
],
summary: String.raw`FDTD advances two equations in time: \(\partial\mathbf{E}/\partial t = (\nabla\times\mathbf{H} - \sigma\mathbf{E} - \mathbf{J})/(\varepsilon_0\varepsilon_r)\) and \(\partial\mathbf{H}/\partial t = -\nabla\times\mathbf{E}/\mu_0\). The divergence laws are initial conditions that the curl equations preserve, exactly so on the Yee grid. E and H regenerate each other and the energy flows along \(\mathbf{E}\times\mathbf{H}\). In a material the wave is slower by \(n\) and, with loss, decays. The device is only the map \(\varepsilon_r(\mathbf{r})\).`,
sheet: [
[String.raw`\[ \frac{\partial \mathbf{E}}{\partial t} = \frac{1}{\varepsilon_0\varepsilon_r}\Big(\nabla\times\mathbf{H} - \sigma\mathbf{E} - \mathbf{J}\Big) \]`, "Ampère's law, solved for the time derivative"],
[String.raw`\[ \frac{\partial \mathbf{H}}{\partial t} = -\frac{1}{\mu_0}\nabla\times\mathbf{E} \]`, "Faraday's law, solved for the time derivative"],
[String.raw`\[ \nabla\cdot(\nabla\times\mathbf{A}) = 0 \]`, "Why the divergence laws stay true"],
[String.raw`\[ \mathbf{S} = \mathbf{E}\times\mathbf{H} \]`, "Poynting vector"],
[String.raw`\[ \tilde\varepsilon_r = (n + i\kappa)^2, \quad \alpha = \frac{4\pi\kappa}{\lambda_0} \]`, "Complex permittivity and absorption"]],
consts: String.raw`\(\varepsilon_0 = 8.854\times10^{-12}\) F/m, \(\mu_0 = 4\pi\times10^{-7}\) H/m, \(c = 2.998\times10^8\) m/s, \(\eta_0 \approx 377\ \Omega\). Demos in normalized units: cell 1, Courant number 0.5.`,
teach: [
  "Write Faraday and Ampère. Box the time derivatives.",
  String.raw`Write the material relations \(\mathbf{D} = \varepsilon_0\varepsilon_r\mathbf{E}\), \(\mathbf{B} = \mu_0\mathbf{H}\) and solve for \(\partial\mathbf{E}/\partial t\) and \(\partial\mathbf{H}/\partial t\).`,
  "Say: if I know E and H now, these give them a moment later. Repeat, and that is FDTD.",
  String.raw`Ask: what about the divergence laws? Take the divergence of Faraday, divergence of a curl is zero, so they are only initial conditions.`,
  String.raw`Underline \(\varepsilon_r(\mathbf{r})\): this is the only place the device lives. Designing a device means choosing this map.`
],
qa: [
  ["Why don't you solve the divergence equations?", String.raw`Because the curl equations conserve them. The divergence of a curl is zero, so \(\nabla\cdot\mathbf{B}\) and, away from sources, \(\nabla\cdot\mathbf{D}\) do not change in time. FDTD starts from zero fields, which satisfy them, and the Yee discretization preserves the discrete divergence exactly.`],
  ["Where does the source enter?", String.raw`As the current density \(\mathbf{J}\) in Ampère's law, on the source plane only. A mode source in Tidy3D uses an electric and a magnetic current sheet together so that it launches the mode in one direction (Lesson 4.2).`],
  [String.raw`Is \(\varepsilon_r = n^2\) always right?`, String.raw`Only for a lossless, non-dispersive material. With absorption the permittivity is complex, \((n + i\kappa)^2\), and if it varies with frequency it must be modelled with a dispersive model (Lesson 5.1). A constant real \(\varepsilon_r\) is a modelling choice that has to be justified at the wavelength used.`],
  ["Why is the magnetic permeability just μ0?", "Semiconductors and oxides at optical frequencies have no magnetic response, so μr = 1. FDTD can include μr if needed, the same way it includes εr."]
],
mistakes: [
  String.raw`Writing \(\varepsilon_r = n^2\) for an absorbing material. It is \((n + i\kappa)^2\).`,
  "Forgetting that the source current must appear somewhere. The textbook source-free equations describe the space away from the source.",
  "Mixing the signs of the Poynting vector for a single pair of components. For (Ez, Hy), power flows to +x when they have opposite signs.",
  "Thinking the divergence equations are violated by FDTD. They are kept exactly on the Yee grid if the start is divergence-free."
],
videos: [FD.vid("r4", "The whole lecture: Maxwell's equations prepared for FDTD."), FD.vid("r1", "Overview of the method and why time domain."), FD.vid("f101page", "Lecture 1 is the introduction to FDTD.")],
sources: [FD.R.taflove + ", Ch. 3 (Maxwell's equations and the Yee algorithm)", FD.R.schneider + ", Ch. 2 (review of electromagnetics) and Ch. 3", FD.R.sullivan + ", Ch. 1", FD.R.td]
});

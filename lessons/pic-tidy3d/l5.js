(function () {
/* Part 4 Lesson 5: S-parameters and sweeps. Figures computed live with PIC (pic-common.js) and the helpers in app.js. */
const PC = "#D85A30", PB = "#378ADD", PT = "#1D9E75", PP = "#7F77DD", PA = "#BA7517";
const tx = (x, y, t, a, cls) => `<text class="${cls || "ts"}" x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""}>${t}</text>`;
const show = (fig, code, h, body) => { fig.innerHTML = PIC.code(code) + svg(h, body); };
/* draw a 2 by 2 directional coupler with 4 ports */
function coupler(x0, y0, w, lit) {
  let s = `<path d="M${x0} ${y0} C${x0 + w * 0.3} ${y0} ${x0 + w * 0.3} ${y0 + 30} ${x0 + w * 0.45} ${y0 + 30} L${x0 + w * 0.55} ${y0 + 30} C${x0 + w * 0.7} ${y0 + 30} ${x0 + w * 0.7} ${y0} ${x0 + w} ${y0}" fill="none" stroke="${PB}" stroke-width="6" opacity="0.7"/>`;
  s += `<path d="M${x0} ${y0 + 72} C${x0 + w * 0.3} ${y0 + 72} ${x0 + w * 0.3} ${y0 + 42} ${x0 + w * 0.45} ${y0 + 42} L${x0 + w * 0.55} ${y0 + 42} C${x0 + w * 0.7} ${y0 + 42} ${x0 + w * 0.7} ${y0 + 72} ${x0 + w} ${y0 + 72}" fill="none" stroke="${PB}" stroke-width="6" opacity="0.7"/>`;
  const ports = [[x0, y0, "1"], [x0, y0 + 72, "2"], [x0 + w, y0, "3"], [x0 + w, y0 + 72, "4"]];
  ports.forEach(([x, y, n]) => { s += `<line x1="${x}" y1="${y - 16}" x2="${x}" y2="${y + 16}" stroke="${lit === n ? PC : PT}" stroke-width="3"/>` + tx(x + (x === x0 ? -8 : 8), y + 4, "P" + n, x === x0 ? "end" : "start", "t"); });
  return s;
}

addLesson("pic", "tidy3d", {
level: "Advanced",
id: "pic-tidy3d-l5", title: "S-parameters and sweeps: ModalComponentModeler, Batch, cost", short: "5. S-parameters and sweeps",
big: String.raw`A finished device is described by its scattering matrix: for light entering each port in each mode, how much leaves every port in every mode, with phase. Tidy3D's smatrix plugin builds that matrix by running one simulation per input port and reading mode monitors at all ports. In version 2.10 the tool was renamed <code>ModalComponentModeler</code>, and the modeler is run through <code>web.run</code>. Parameter sweeps run many simulations side by side with <code>web.Batch</code> or <code>run_async</code>. The last card is about cost, because every simulation spends FlexCredits and a sweep multiplies them.`,
bridge: String.raw`The S-matrix is the language of circuit-level photonics: a 2 by 2 directional coupler is a unitary matrix, a ring is a feedback loop of two such matrices, and a circuit simulator multiplies them. Reciprocity and energy conservation put constraints on the matrix that the cards use as checks on a simulation.`,
cards: [

{s: "1. Ports", t: "Port and ModalComponentModeler: naming the inputs and outputs",
intu: String.raw`A <code>Port</code> is a plane in a waveguide with a mode spec and a direction pointing into the device. Give the modeler a simulation without sources, a list of ports and the frequencies. It will create one simulation per port, each with a ModeSource at that port and ModeMonitors at all ports. Click a port to see which simulation excites it. Four ports and one mode each means four cloud runs.`,
eq: String.raw`\[ \mathbf b = S\,\mathbf a, \qquad b_i = \sum_j S_{ij}\, a_j \]<div class="eqnote">a: amplitudes going into the device at each port, b: amplitudes coming out</div>`,
sym: [[String.raw`\(a_j\)`, "incoming mode amplitude at port j, normalized so that its square is power"], [String.raw`\(b_i\)`, "outgoing amplitude at port i"], [String.raw`\(S_{ij}\)`, "complex transfer from port j into port i, one entry per mode pair"]],
how: ["Each Port carries center, size, <code>mode_spec</code>, direction and a name. The direction points into the device, since the port's source launches inward.", "ModalComponentModeler(simulation, ports, freqs) holds the base simulation and makes the per-port runs.", "The number of runs is the number of ports times modes per port, unless symmetry lets some be skipped.", "Port names must not contain the character used to separate port and mode in the result labels."],
say: String.raw`A Port is a plane with a mode spec and an inward direction, and the modeler runs one simulation per port and mode to fill the scattering matrix.`,
num: "A 2 by 2 coupler with one mode per port: 4 runs. With TE and TM at each port: 8 runs. Each run is a full FDTD of the device.",
r(fig, ctl) {
  ctl.innerHTML = btns([["1", "excite P1"], ["2", "excite P2"], ["3", "excite P3"], ["4", "excite P4"]], "p");
  let p = "1";
  const u = () => {
    pick(ctl, "p", p);
    const code = `from tidy3d.plugins.smatrix import ModalComponentModeler, Port\nmode_spec = td.ModeSpec(num_modes=1, target_neff=2.4)\nports = [\n    Port(center=(-4, 0.6, 0), size=(0, 2, 1.5), mode_spec=mode_spec,\n         direction="+", name="P1"),\n    Port(center=(-4, -0.6, 0), size=(0, 2, 1.5), mode_spec=mode_spec,\n         direction="+", name="P2"),\n    Port(center=(4, 0.6, 0), size=(0, 2, 1.5), mode_spec=mode_spec,\n         direction="-", name="P3"),\n    Port(center=(4, -0.6, 0), size=(0, 2, 1.5), mode_spec=mode_spec,\n         direction="-", name="P4")]\nmodeler = ModalComponentModeler(simulation=sim_no_src, ports=ports,\n                                freqs=freqs)\n# run ${p} of 4: ModeSource at P${p}, ModeMonitors at P1..P4`;
    let s = coupler(80, 40, 520, p) + tx(340, 150, `simulation ${p} of 4: light enters at P${p} (red), all four ports record`, "middle");
    show(fig, code, 165, s);
  };
  ctl.querySelectorAll("button[data-p]").forEach(b => b.onclick = () => { p = b.dataset.p; u(); }); u();
}},

{s: "2. Run and smatrix()", t: "web.run(modeler) and smatrix(): the matrix comes back",
intu: String.raw`Since 2.10 the modeler is run like a simulation: <code>web.run(modeler)</code> uploads all the per-port runs, waits, and returns a data object whose <code>smatrix()</code> method gives the full matrix as an xarray with port and mode coordinates. Drag the coupling of a 2 by 2 coupler and watch the magnitude of every entry. The matrix is drawn as a heat map, the way you would check it for sanity.`,
eq: String.raw`\[ S = \begin{pmatrix} S_{11} & S_{12} & S_{13} & S_{14} \\ S_{21} & S_{22} & S_{23} & S_{24} \\ S_{31} & S_{32} & S_{33} & S_{34} \\ S_{41} & S_{42} & S_{43} & S_{44} \end{pmatrix}, \qquad |S_{ij}|^2 = \text{power from port } j \text{ to port } i \]`,
sym: [[String.raw`\(S_{ii}\)`, "reflection at port i, small for a good device"], [String.raw`\(S_{31}, S_{41}\)`, "the through and cross transmissions of a coupler fed at port 1"], ["smatrix()", "the method on the returned data that assembles the array"]],
how: ["web.run(modeler, <code>task_name</code>) submits every per-port simulation and returns a modeler data object.", "smatrix() reads the mode monitor amplitudes of each run and places them into the matrix.", "Each entry is complex and depends on frequency, so the array has frequency, input port, input mode, output port and output mode coordinates.", "Plot abs squared as a heat map at one frequency to see at a glance where the power goes."],
say: String.raw`web.run on the modeler runs every port excitation, and smatrix() assembles the complex scattering matrix with port and mode coordinates.`,
num: "A 3 dB coupler at its design wavelength: through and cross entries both 0.5 in power, reflections below 1e-3, and the row sums near 1.",
r(fig, ctl) {
  ctl.innerHTML = sl("kL", "coupling κL (radians)", 0, 1.571, 0.01, 0.785) + sl("rf", "reflection |S11|² (log10)", -4, -1, 0.1, -3);
  const u = () => {
    const kL = +$("kL").value, R = Math.pow(10, +$("rf").value); $("kLv").textContent = kL.toFixed(2); $("rfv").textContent = R.toExponential(1);
    const t = Math.pow(Math.cos(kL), 2) * (1 - 2 * R), c = Math.pow(Math.sin(kL), 2) * (1 - 2 * R);
    const M = [[R, R, t, c], [R, R, c, t], [t, c, R, R], [c, t, R, R]];
    const code = `modeler_data = web.run(modeler, task_name="coupler_smatrix")\nS = modeler_data.smatrix()\nprint(S.coords)\n# f, port_in, mode_index_in, port_out, mode_index_out\n# |S31|^2 = ${t.toFixed(3)}, |S41|^2 = ${c.toFixed(3)}, |S11|^2 = ${R.toExponential(1)}`;
    const x0 = 120, y0 = 36, c0 = 60; let s = tx(x0 + 2 * c0, 22, "|S|² at f₀, rows: output port, columns: input port", "middle", "th");
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { const v = M[i][j]; s += `<rect x="${x0 + j * c0}" y="${y0 + i * c0}" width="${c0 - 2}" height="${c0 - 2}" fill="${PIC.heat(Math.pow(v, 0.5))}"/>` + `<text x="${x0 + j * c0 + c0 / 2}" y="${y0 + i * c0 + c0 / 2 + 4}" text-anchor="middle" style="font-size:13px;fill:${v < 0.2 ? "#fff" : "#1b2230"}">${v < 0.01 ? v.toExponential(0) : v.toFixed(2)}</text>`; }
    for (let k = 0; k < 4; k++) s += tx(x0 - 10, y0 + k * c0 + c0 / 2 + 4, "P" + (k + 1), "end") + tx(x0 + k * c0 + c0 / 2, y0 + 4 * c0 + 14, "P" + (k + 1), "middle");
    s += coupler(410, 100, 220, "1") + tx(520, 200, `fed at P1: through ${t.toFixed(2)}, cross ${c.toFixed(2)}`, "middle");
    show(fig, code, y0 + 4 * c0 + 40, s);
  };
  $("kL").oninput = u; $("rf").oninput = u; u();
}},

{s: "3. Selecting S21", t: "Picking one entry: S21 versus frequency",
intu: String.raw`One line of <code>sel</code> picks a single transfer, say from port P1 into port P3 for the fundamental mode, as a function of frequency. Its absolute value squared is the transmission spectrum, its phase the dispersion. Drag the design wavelength and bandwidth of an imagined coupler and read the spectrum. The exact coordinate names of the array should be checked against the SMatrix notebook for your version.`,
eq: String.raw`\[ T_{31}(f) = \left|S_{31}(f)\right|^2, \qquad \tau_g(f) = -\frac{1}{2\pi}\frac{d\,\arg S_{31}}{df} \]`,
sym: [[String.raw`\(T_{31}\)`, "power transmission from port 1 to port 3"], [String.raw`\(\tau_g\)`, "group delay through the device, from the phase slope"], ["sel", "xarray selection by coordinate value"]],
how: ["S.sel(<code>port_in</code>='P1', <code>port_out</code>='P3', <code>mode_index_in</code>=0, <code>mode_index_out</code>=0) leaves an array over frequency.", "abs squared gives the transmission spectrum. np.angle gives the phase.", "Unwrap the phase before differentiating, or the 2π jumps spoil the delay.", "The coordinate names follow the plugin version. Print S.coords once and copy the names from there."],
say: String.raw`Select input and output port and mode from the S-matrix to get one complex spectrum, whose magnitude squared is transmission and whose phase slope is group delay.`,
num: "A coupler 20 µm long in silicon with <code>n_g</code> = 4.2 has a group delay of 0.28 ps, a phase slope of 1.8 rad per THz.",
r(fig, ctl) {
  ctl.innerHTML = sl("l0", "design wavelength (nm)", 1500, 1600, 1, 1550) + sl("bw", "coupler bandwidth (nm)", 20, 120, 2, 60);
  const u = () => {
    const l0 = +$("l0").value, bw = +$("bw").value; $("l0v").textContent = l0 + " nm"; $("bwv").textContent = bw + " nm";
    const code = `S31 = S.sel(port_in="P1", port_out="P3", mode_index_in=0, mode_index_out=0)\nT31 = abs(S31) ** 2\nphase = np.unwrap(np.angle(S31))\ntau_g = -np.gradient(phase, 2 * np.pi * S31.f)   # group delay, s\n# check coordinate names with print(S.coords) for your version`;
    const T = lam => Math.pow(Math.cos(Math.PI / 4 * (1 + (lam - l0) / bw * 2)), 2) * 0.97;
    const x0 = 60, w = 560, y0 = 36, h = 150, lams = range(1500, 1600, 200);
    let s = PIC.yaxis(x0, y0, h, 0, 1, 2, "|S31|²", v => v.toFixed(1)) + PIC.xaxis(x0, y0 + h, w, 1500, 1600, 5, "wavelength (nm)", v => v.toFixed(0));
    s += plot(x0, y0, w, h, lams, lams.map(T), 1500, 1600, 0, 1, PB, 2) + plot(x0, y0, w, h, lams, lams.map(l => 0.97 - T(l)), 1500, 1600, 0, 1, PC, 2);
    const X = x0 + (l0 - 1500) / 100 * w; s += `<line x1="${X}" y1="${y0}" x2="${X}" y2="${y0 + h}" stroke="var(--p)" stroke-dasharray="3 3"/>` + tx(x0 + w, y0 + 12, "blue: through |S31|², red: cross |S41|² (illustrative)", "end");
    show(fig, code, y0 + h + 44, s);
  };
  $("l0").oninput = u; $("bw").oninput = u; u();
}},

{s: "4. Reciprocity, unitarity", t: "Reciprocity and unitarity: two checks on any S-matrix",
intu: String.raw`Two physical laws constrain the matrix. Reciprocity says the transfer from port i to j equals the transfer from j to i, so the matrix is symmetric. Energy conservation says a lossless device cannot create or lose power, so the matrix is unitary: every column of power sums to 1. Drag the coupling and the loss. The lossless coupler is a rotation with an i on the cross terms, and the column sums show at once when power is missing.`,
eq: String.raw`\[ S = S^{T} \ \text{(reciprocity)}, \qquad S^{\dagger}S = I \ \text{(lossless)} \]\[ \text{2 by 2 coupler: } S = \begin{pmatrix} \cos\kappa L & i\sin\kappa L \\ i\sin\kappa L & \cos\kappa L \end{pmatrix} \]`,
sym: [[String.raw`\(S^{T}, S^{\dagger}\)`, "transpose, and conjugate transpose"], [String.raw`\(\kappa L\)`, "coupling strength times length, the coupled-mode phase"], [String.raw`\(\sum_i |S_{ij}|^2\)`, "the power leaving when port j is fed, 1 if lossless"]],
how: ["Reciprocity follows from Maxwell's equations in materials with symmetric permittivity tensors, which is every ordinary dielectric.", "Unitarity follows from power conservation when every port and mode is counted.", "In a simulation, a column sum below 1 means radiation, absorption, or a mode you did not include as a port.", "The factor i on the cross term is the quarter-wave phase lag of coupled-mode theory. It is what makes a Mach-Zehnder interferometer work."],
say: String.raw`A passive dielectric device has a symmetric S-matrix, and a lossless one has a unitary S-matrix, so column power sums below one reveal where power escaped.`,
num: "A measured coupler with column sums of 0.93 has 0.3 dB of excess loss, typical for a good silicon coupler including bend radiation.",
r(fig, ctl) {
  ctl.innerHTML = sl("kL", "κL (radians)", 0, 1.571, 0.01, 0.6) + sl("loss", "excess loss (dB)", 0, 3, 0.1, 0);
  const u = () => {
    const kL = +$("kL").value, loss = +$("loss").value; $("kLv").textContent = kL.toFixed(2); $("lossv").textContent = loss.toFixed(1) + " dB";
    const a = Math.sqrt(PIC.fromdB(-loss)); const c = a * Math.cos(kL), q = a * Math.sin(kL);
    const code = `S0 = S.sel(f=freq0).values\nrecip = np.allclose(S0, S0.T, atol=1e-3)         # True\ncol_power = (abs(S0) ** 2).sum(axis=0)          # ${(c * c + q * q).toFixed(3)} each\nunitary = np.allclose(S0.conj().T @ S0, np.eye(2), atol=1e-2)\n# unitary: ${loss < 0.05 ? "True" : "False, power is lost"}`;
    const x0 = 100, y0 = 40, c0 = 90; let s = tx(x0 + c0, 24, "S at f₀, 2 by 2 (through and cross ports)", "middle", "th");
    const M = [[`${c.toFixed(2)}`, `${q.toFixed(2)} i`], [`${q.toFixed(2)} i`, `${c.toFixed(2)}`]], P = [[c * c, q * q], [q * q, c * c]];
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) s += `<rect x="${x0 + j * c0}" y="${y0 + i * c0}" width="${c0 - 2}" height="${c0 - 2}" fill="${PIC.heat(Math.sqrt(P[i][j]))}"/>` + tx(x0 + j * c0 + c0 / 2, y0 + i * c0 + c0 / 2 - 6, M[i][j], "middle", "t") + tx(x0 + j * c0 + c0 / 2, y0 + i * c0 + c0 / 2 + 14, `power ${P[i][j].toFixed(2)}`, "middle");
    s += tx(x0 + c0, y0 + 2 * c0 + 18, `column sum ${(c * c + q * q).toFixed(3)} ${loss > 0.05 ? "below 1: power lost" : "= 1: lossless"}`, "middle", "t");
    // bar of column sum
    s += `<rect x="340" y="${y0 + 20}" width="40" height="150" fill="var(--sunk)"/><rect x="340" y="${y0 + 20 + 150 * (1 - (c * c + q * q))}" width="40" height="${150 * (c * c + q * q)}" fill="${loss > 0.05 ? PC : PT}" opacity="0.7"/>` + tx(360, y0 + 12, "Σ|S|²", "middle") + tx(390, y0 + 24, "1") + tx(390, y0 + 174, "0");
    s += tx(520, y0 + 60, "S symmetric: S12 = S21", "middle", "t") + tx(520, y0 + 84, "cross term carries a factor i", "middle") + tx(520, y0 + 108, "through² + cross² = transmission", "middle");
    show(fig, code, y0 + 2 * c0 + 36, s);
  };
  $("kL").oninput = u; $("loss").oninput = u; u();
}},

{s: "5. Batch and run_async", t: "web.Batch and run_async: sweeping a parameter",
intu: String.raw`Design means sweeping. Build a simulation for each value of a parameter, put them in a dictionary, and <code>web.Batch</code> uploads and runs them side by side, then loads the results by key. <code>run_async</code> does the same in one call. Below, the gap of a directional coupler is swept and the coupling length follows the exponential law from coupled-mode theory. Press Play to watch the sweep run, and set how many values it covers.`,
eq: String.raw`\[ \kappa(g) = \kappa_0\, e^{-\gamma g}, \qquad L_c(g) = \frac{\pi}{2\kappa(g)}, \qquad \gamma \approx k_0\sqrt{n_{\mathrm{eff}}^2 - n_{\mathrm{clad}}^2} \]`,
sym: [[String.raw`\(g\)`, "the gap between the two waveguides, the swept parameter"], [String.raw`\(\kappa_0\)`, "coupling at zero gap, from the mode overlap"], [String.raw`\(L_c\)`, "length for full power transfer"], [String.raw`\(\gamma\)`, "evanescent decay rate of the mode in the cladding"]],
how: ["Write a function <code>make_sim(gap)</code> that returns a Simulation.", "<code>sims = {f'gap_{g}': make_sim(g) for g in gaps}</code> builds the set.", "web.Batch(simulations=sims).run(<code>path_dir</code>='data') runs them concurrently and returns a BatchData you index by key.", "Loop over the keys, pull the mode amplitude from each, and plot against the parameter. The jobs run in parallel, so a sweep of 20 takes about as long as one."],
say: String.raw`A sweep is a dictionary of simulations run together by web.Batch or <code>run_async</code> and read back by key, and for a coupler the coupling length grows exponentially with the gap.`,
num: "Silicon strips at 1.55 µm: κ falls by about e for every 0.1 µm of extra gap. A 3 dB coupler needs about 10 µm at a 200 nm gap and about 25 µm at 300 nm (teaching values).",
r(fig, ctl) {
  ctl.innerHTML = sl("n", "number of gap values", 3, 15, 1, 8);
  const draw = (tsec) => {
    const n = +$("n").value; $("nv").textContent = n;
    const done = Math.min(n, Math.floor(tsec * 2) % (n + 3) + 1);
    const gaps = range(0.1, 0.4, n); const k0 = 2 * Math.PI / 1.55, gam = k0 * Math.sqrt(2.4 * 2.4 - 1.44 * 1.44) * 0.5, kap0 = 1.2;
    const Lc = g => Math.PI / (2 * kap0 * Math.exp(-gam * g));
    const code = `gaps = np.linspace(0.1, 0.4, ${n})\nsims = {f"gap_{g:.3f}": make_sim(gap=g) for g in gaps}\nbatch = web.Batch(simulations=sims, verbose=True)\nbatch_data = batch.run(path_dir="data")        # ${done} of ${n} finished\n# or: batch_data = web.run_async(sims, path_dir="data")\nfor key, sim_data in batch_data.items():\n    T = abs(sim_data["cross"].amps.sel(direction="+", mode_index=0)) ** 2`;
    const x0 = 60, w = 560, y0 = 36, h = 150; let s = PIC.yaxis(x0, y0, h, 0, 60, 3, "L_c (µm)", v => v.toFixed(0)) + PIC.xaxis(x0, y0 + h, w, 0.1, 0.4, 3, "gap (µm)", v => v.toFixed(1));
    s += plot(x0, y0, w, h, range(0.1, 0.4, 100), range(0.1, 0.4, 100).map(Lc), 0.1, 0.4, 0, 60, "var(--p)", 1, "4 3");
    gaps.forEach((g, i) => { const X = x0 + (g - 0.1) / 0.3 * w, Y = y0 + h - Math.min(60, Lc(g)) / 60 * h; s += i < done ? `<circle cx="${X}" cy="${Y}" r="6" fill="${PT}"/>` : `<circle cx="${X}" cy="${Y}" r="6" fill="none" stroke="var(--b)" stroke-dasharray="2 2"/>`; });
    s += tx(x0 + w, y0 + 12, `${done} of ${n} jobs done, running in parallel`, "end");
    show(fig, code, y0 + h + 44, s);
  };
  $("n").oninput = () => draw(0);
  PIC.player(ctl, draw);
}},

{s: "6. Cost", t: "FlexCredits: what a simulation costs and how to keep it small",
intu: String.raw`Cloud runs are billed in FlexCredits, and the cost scales with the work: the number of cells times the number of time steps, with extra for dispersive materials and large monitors. The grid resolution enters to the fourth power, since finer cells also mean a smaller time step. Drag the box size and steps per wavelength and watch the estimate. Always call the cost estimate before running a sweep, and test on a coarse grid first.`,
eq: String.raw`\[ \text{work} \propto N_{\mathrm{cells}} \times N_{\mathrm{steps}} \propto \frac{V}{\Delta l^3}\times\frac{T_{\mathrm{run}}}{\Delta t} \propto V\, T_{\mathrm{run}}\, N^{4} \]`,
sym: [[String.raw`\(V\)`, "simulation volume"], [String.raw`\(\Delta l, \Delta t\)`, "cell size and time step"], [String.raw`\(N\)`, "steps per wavelength, <code>min_steps_per_wvl</code>"], ["FlexCredit", "Tidy3D's unit of cloud cost"]],
how: ["Cells scale as one over the cell size cubed, and time steps as one over the cell size, so the total scales as the fourth power of resolution.", "<code>web.estimate_cost(task_id)</code> after upload, or sim.plot and the validation warnings, tell you before the run starts.", "Shrink the box, use symmetry, and keep field monitors to one plane and a few frequencies.", "Converge on resolution with one simulation, then sweep at the lowest resolution that converged."],
say: String.raw`Cost scales with cells times time steps, which is the fourth power of resolution, so converge first and sweep at the coarsest grid that still agrees.`,
num: "The numbers below are a toy estimate for teaching, not Flexcompute's pricing. The real cost comes from <code>web.estimate_cost</code>.",
r(fig, ctl) {
  ctl.innerHTML = sl("V", "box volume (µm³)", 5, 200, 5, 45) + sl("N", "min_steps_per_wvl", 8, 30, 1, 15) + sl("sp", "symmetry planes", 0, 2, 1, 0);
  const u = () => {
    const V = +$("V").value, N = +$("N").value, sy = +$("sp").value; $("Vv").textContent = V + " µm³"; $("Nv").textContent = N; $("spv").textContent = sy;
    const dl = 1.55 / (N * 2.2), cells = V / Math.pow(dl, 3) / Math.pow(2, sy), steps = 2000 * N / 15, work = cells * steps, cost = work / 2e9;
    const code = `job = web.Job(simulation=sim, task_name="dc_test")\njob.upload()\nprint(job.estimate_cost())     # FlexCredits, before running\n# toy estimate: ${(cells / 1e6).toFixed(2)} M cells x ${steps.toFixed(0)} steps, about ${cost.toFixed(2)} FC`;
    const x0 = 60, w = 560, y0 = 36, h = 150; let s = PIC.yaxis(x0, y0, h, 0, 10, 5, "toy FlexCredits", v => v.toFixed(0)) + PIC.xaxis(x0, y0 + h, w, 8, 30, 11, "steps per wavelength", v => v.toFixed(0));
    const Ns = range(8, 30, 100), cs = Ns.map(n => { const d = 1.55 / (n * 2.2); return V / Math.pow(d, 3) / Math.pow(2, sy) * 2000 * n / 15 / 2e9; });
    s += plot(x0, y0, w, h, Ns, cs, 8, 30, 0, 10, PB, 2);
    const X = x0 + (N - 8) / 22 * w, Y = y0 + h - Math.min(10, cost) / 10 * h; s += `<circle cx="${X}" cy="${Y}" r="6" fill="${PC}"/>` + tx(X + 10, Y - 6, `${cost.toFixed(2)} FC`);
    s += tx(x0 + w, y0 + 12, "fourth-power curve, cut by each symmetry plane", "end");
    show(fig, code, y0 + h + 44, s);
  };
  ["V", "N", "sp"].forEach(i => $(i).oninput = u); u();
}}
],
summary: String.raw`A device is summarized by its S-matrix. Ports are planes with a mode spec and an inward direction, ModalComponentModeler runs one simulation per port and mode, web.run executes them, and smatrix() returns the complex matrix with port and mode coordinates, from which sel picks one spectrum. Reciprocity makes the matrix symmetric and losslessness makes it unitary, so column power sums reveal lost power. Sweeps are dictionaries of simulations run together by Batch or <code>run_async</code>, and the cost scales as the fourth power of resolution, so converge first and sweep coarse.`,
sheet: [
[String.raw`\[ \mathbf b = S\mathbf a \]`, "Scattering matrix definition"],
[String.raw`\[ T_{ij}(f) = |S_{ij}(f)|^2, \quad \tau_g = -\frac{1}{2\pi}\frac{d\arg S_{ij}}{df} \]`, "Transmission and group delay from one entry"],
[String.raw`\[ S = S^T, \qquad S^{\dagger}S = I \]`, "Reciprocity and unitarity"],
[String.raw`\[ S_{\mathrm{DC}} = \begin{pmatrix}\cos\kappa L & i\sin\kappa L\\ i\sin\kappa L & \cos\kappa L\end{pmatrix} \]`, "Lossless 2 by 2 coupler"],
[String.raw`\[ \kappa(g) = \kappa_0 e^{-\gamma g}, \quad L_c = \pi/(2\kappa) \]`, "Gap sweep of a coupler"],
[String.raw`\[ \text{work} \propto V\, T_{\mathrm{run}}\, N^4 \]`, "Cost scaling with resolution"]],
consts: String.raw`ComponentModeler was renamed ModalComponentModeler in Tidy3D 2.10. RF ports live in tidy3d.rf. Cost figures on card 6 are a toy model, not Flexcompute pricing.`,
sources: ["Tidy3D changelog 2.10.0 (smatrix restructured, ModalComponentModeler) and the smatrix plugin API page", "Tidy3D notebooks SMatrix, ParameterScanWebRun, and the web.Batch documentation", "D. Pozar, Microwave Engineering, 4th ed., Wiley (2012), Ch. 4 (reciprocity and unitarity of S-matrices)", "A. Yariv, IEEE J. Quantum Electron. 9, 919 (1973), coupled-mode theory"]
});
})();

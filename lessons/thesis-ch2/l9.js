/* Thesis Sec. 2.6, second half: pulse to spectrum, PML, sources and monitors, mode overlap (Ch. 3 Eq. 3.12), grid resolution (Ch. 3 Sec. 3.6), and a quiz on all of Chapter 2. */
const C2L9_sub = (a, b) => `${a}<tspan baseline-shift="sub" font-size="9">${b}</tspan>`;
addLesson("thesis", "ch2", {
level: "Pro",
id: "thesis-ch2-l9", title: "FDTD 2: sources, absorbing boundaries and spectra", short: "9. FDTD 2, sources to spectra",
big: String.raw`Lesson 8 built the Yee grid. Thesis Sec. 2.6 then adds what turns it into a device simulation. A short pulse contains many frequencies, so one simulation gives the response over the whole band, obtained by Fourier transforming the recorded fields. Perfectly matched layers (PML) surround the domain and absorb outgoing light with almost no reflection, so the finite domain behaves like open space. Light is launched as a guided mode computed by the mode solver, or as a Gaussian beam that represents the fiber, and transmission is measured by projecting the field at an output plane onto the target mode, Eq. 3.12. Finally, the grid has to be fine enough to describe both the wave and the geometry, so its resolution is given in steps per wavelength in the highest-index material, GaAs.`,
bridge: String.raw`Thesis Sec. 2.6, second half, together with the mode overlap of Ch. 3 Sec. 3.4 (Eq. 3.12) and the grid, boundaries and sources of Ch. 3 Sec. 3.6. PML follow Taflove and Hagness Sec. 13, the pulse, mode normalization and grid follow the Tidy3D documentation. All simulations here are live 1D FDTD in normalized units, and the grid card uses \(n = 3.5\) and \(\lambda_0 = 800\) nm. The lesson ends with a quiz on the whole of Chapter 2.`,
cards: [
/* from old ch2 L11 card 1 */
{s: "1. The pulse", t: "A Gaussian pulse: short in time, wide in frequency",
intu: "A source switched on as a short Gaussian pulse contains a band of frequencies around its centre. The shorter the pulse, the wider its spectrum: duration and bandwidth trade off exactly. Tidy3D's GaussianPulse is specified by its centre frequency and fwidth, the standard deviation of its frequency content. Drag the relative bandwidth. In the thesis the pulse is carried by a mode source or by the Gaussian beam that represents the fiber (Ch. 3 Sec. 3.6). A wide band lets one run cover a whole spectrum, but the run must last long enough for the pulse to pass and for the device to ring down. A narrow band gives a long pulse and a long run.",
eq: String.raw`\[ s(t) \propto \exp\!\left[-\frac{(t - t_0)^2}{2\tau^2}\right] \sin(2\pi f_0 t) \qquad |S(f)| \propto \exp\!\left[-\frac{(f - f_0)^2}{2\sigma_f^2}\right] \]\[ \tau\,\sigma_f = \frac{1}{2\pi} \]`,
sym: [[String.raw`\(f_0\)`, String.raw`centre frequency (\(c/\lambda_0\))`], [String.raw`\(\sigma_f\)`, "standard deviation of the spectrum (Tidy3D's fwidth)"], [String.raw`\(\tau\)`, "standard deviation of the pulse envelope in time"], [String.raw`\(t_0\)`, "delay so the pulse starts smoothly from zero"]],
how: ["The Fourier transform of a Gaussian is a Gaussian.", String.raw`Their widths are inversely related: \(\tau\sigma_f = 1/(2\pi)\) for these definitions.`, String.raw`Multiplying by the carrier \(\sin(2\pi f_0 t)\) shifts the spectrum to \(f_0\).`, "So the spectral band and the pulse length are set together by one parameter."],
say: "A Gaussian pulse source covers a band of frequencies set by its spectral width. A wider band means a shorter pulse, and one FDTD run then yields the response across that band.",
num: String.raw`\(\lambda_0 = 800\) nm, \(f_0 = 375\) THz. fwidth = \(f_0/10\) = 37.5 THz ⟹ \(\tau = 1/(2\pi \times 37.5\ \mathrm{THz})\) ≈ <b>4.2 fs</b>.<br>\(\pm 2\sigma_f\) (300 to 450 THz) covers about <b>667 to 1000 nm</b>.`,
r(fig, ctl) {
  ctl.innerHTML = sl("w", "fwidth / f₀", 0.02, 0.4, 0.005, 0.1) + '<div class="readout" id="ro"></div>';
  const u = () => {
    const w = +$("w").value; $("wv").textContent = w.toFixed(3);
    const f0 = 375, sf = w * f0, tau = 1 / (2 * Math.PI * sf * 1e12) * 1e15;
    const ts = range(0, 80, 600), s = ts.map(t => Math.exp(-Math.pow(t - 40, 2) / (2 * tau * tau)) * Math.sin(2 * Math.PI * f0 * 1e-3 * t));
    const fs = range(150, 600, 300), S = fs.map(f => Math.exp(-Math.pow(f - f0, 2) / (2 * sf * sf)));
    const l1 = 3e5 / (f0 + 2 * sf), l2 = f0 - 2 * sf > 0 ? 3e5 / (f0 - 2 * sf) : Infinity;
    fig.innerHTML = svg(250, `<text class="th" x="190" y="24" text-anchor="middle">in time (0 to 80 fs)</text>${plot(40, 40, 300, 160, ts, s, 0, 80, -1.05, 1.05, "#378ADD", 1.2)}<line x1="40" x2="340" y1="120" y2="120" stroke="var(--p)" stroke-width="0.5"/><text class="th" x="510" y="24" text-anchor="middle">in frequency (150 to 600 THz)</text>${plot(370, 40, 280, 160, fs, S, 150, 600, 0, 1.05, "#D85A30", 2.5)}<line x1="370" x2="650" y1="200" y2="200" stroke="var(--p)"/><text class="ts" x="${370 + (f0 - 150) / 450 * 280}" y="218" text-anchor="middle">f₀</text>`);
    $("ro").innerHTML = `<div><span>τ</span><b>${tau.toFixed(2)} fs</b></div><div><span>band ±2σ</span><b>${l1.toFixed(0)} to ${isFinite(l2) ? l2.toFixed(0) : "∞"} nm</b></div>`;
  };
  $("w").oninput = u; u();
}},

/* from old ch2 L8 card 6 */
{s: "2. All colours at once", t: "One pulse gives the whole spectrum",
intu: "A short pulse contains many frequencies. Record the field after the slab during the whole run, then Fourier transform it, and you have the response at every frequency from one simulation. Divide by the spectrum of a run without the slab and you get the transmission. This card does exactly that, two 1D FDTD runs (about 4000 steps each) when you press the button. The dots are the FDTD result, the line is the exact transfer-matrix answer for the same slab. They agree closely. The small mismatch at short wavelengths comes from the grid, which has fewer cells per wavelength there (card 6, and Beyond the thesis B2). This is the sentence of Sec. 2.6: a short pulse contains many frequencies, so one simulation gives the response over the whole band, obtained by Fourier transforming the recorded fields.",
eq: String.raw`\[ \tilde{E}(f) = \sum_n E_z^{\,n}\, e^{i2\pi f n\Delta t}\, \Delta t \qquad T(f) = \frac{|\tilde{E}_{\mathrm{slab}}(f)|^2}{|\tilde{E}_{\mathrm{ref}}(f)|^2} \]<div class="eqref">the Fourier step of Ch. 2 Sec. 2.6</div>`,
sym: [[String.raw`\(\tilde{E}(f)\)`, "discrete Fourier transform of the recorded field"], ["ref", "same simulation without the slab"], [String.raw`\(T(f)\)`, "power transmission spectrum"]],
how: [String.raw`Run with a broadband pulse and record \(E\) at a probe behind the slab every step.`, "Fourier transform the record at many frequencies (a running sum, card 4).", "Repeat with no slab to get the incident spectrum at the same probe.", "The ratio of the two power spectra is the transmission at every frequency of the band, from one pair of runs."],
say: "Because FDTD is a time-domain method, one simulation with a short pulse gives the response over a whole band, obtained by Fourier transforming the recorded fields.",
num: String.raw`Slab \(\varepsilon_r = 4\), 40 cells thick. Fabry-Perot peaks where \(2nd = m\lambda\): \(\lambda = 160/m\) cells, so peaks near \(\lambda = 80, 53, 40\) cells.`,
r(fig, ctl) {
  ctl.innerHTML = sl("e", "Slab permittivity ε<sub>r</sub>", 1.5, 12, 0.25, 4) + sl("d", "Slab thickness (cells)", 10, 80, 1, 40) + `<div class="row"><button id="go">Run FDTD (two runs)</button></div><div class="readout" id="ro"></div>`;
  const runOnce = (e, d) => {
    const N = 1000, a = 500, eps = new Float64Array(N).fill(1); for (let i = a; i < a + d; i++) eps[i] = e;
    const sim = new C2.FDTD1D(N, 0.5, eps, { pml: 40, smax: 0.6, wall: "pec" }); const rec = [];
    for (let t = 0; t < 4500; t++) { sim.step([150, Math.exp(-Math.pow((t - 60) / 10, 2))]); rec.push(sim.ez[800]); }
    return rec;
  };
  const lams = range(25, 150, 90);
  const dft = (rec, lam) => { let re = 0, im = 0; const f = 1 / lam; rec.forEach((v, n) => { const p = 2 * Math.PI * f * n * 0.5; re += v * Math.cos(p); im += v * Math.sin(p); }); return re * re + im * im; };
  const draw = (fd) => {
    const e = +$("e").value, d = +$("d").value; $("ev").textContent = e.toFixed(2); $("dv").textContent = d;
    const an = lams.map(l => 1 - C2.tmmR(1, [[Math.sqrt(e), d]], 1, l));
    let dots = ""; if (fd) fd.forEach((v, i) => dots += `<circle cx="${60 + (lams[i] - 25) / 125 * 560}" cy="${230 - Math.min(1.05, v) * 190}" r="2.6" fill="#D85A30"/>`);
    fig.innerHTML = svg(260, `${plot(60, 40, 560, 190, lams, an, 25, 150, 0, 1, "#378ADD", 2)}${dots}<line x1="60" x2="620" y1="230" y2="230" stroke="var(--p)"/><line x1="60" x2="60" y1="40" y2="230" stroke="var(--p)"/><text class="ts" x="54" y="44" text-anchor="end">T = 1</text><text class="ts" x="340" y="252" text-anchor="middle">wavelength 25 to 150 cells. Line: exact. Dots: FDTD ${fd ? "" : "(press Run)"}</text>`);
  };
  $("e").oninput = () => draw(null); $("d").oninput = () => draw(null);
  $("go").onclick = () => { const e = +$("e").value, d = +$("d").value; const r0 = runOnce(1, d), r1 = runOnce(e, d); const fd = lams.map(l => dft(r1, l) / dft(r0, l)); draw(fd); const an = lams.map(l => 1 - C2.tmmR(1, [[Math.sqrt(e), d]], 1, l)); const err = Math.max(...fd.map((v, i) => Math.abs(v - an[i]))); $("ro").innerHTML = `<div><span>largest |T<sub>FDTD</sub> − T<sub>exact</sub>|</span><b>${err.toFixed(3)}</b></div>`; };
  draw(null);
}},

/* from old ch2 L11 card 2 */
{s: "3. PML", t: "Absorbing boundaries: why a PML works",
intu: "The simulation box is finite, but the device sits in open space. Whatever reaches the edge must vanish without coming back. A hard wall reflects everything. A layer that simply absorbs, switched on abruptly, also reflects, because the sudden change in material is itself an interface. A perfectly matched layer absorbs gradually, with electric and magnetic losses matched so that its impedance equals that of the medium, and the loss rises smoothly from zero. This is the role of the PML in Sec. 2.6: it absorbs outgoing light with almost no reflection, so the finite domain behaves like open space (Taflove and Hagness Sec. 13). In the thesis the input and output waveguides run through the PML, so guided light leaves the domain without coming back (Ch. 3 Sec. 3.6). Pick a boundary and watch the pulse come back, or not.",
eq: String.raw`<div class="eqnote">matched layer</div>\[ \frac{\sigma_e}{\varepsilon} = \frac{\sigma_m}{\mu} \;\Longrightarrow\; \text{impedance unchanged, no reflection at its face} \]<div class="eqnote">graded loss (textbook form, not written in the thesis)</div>\[ \sigma(d) = \sigma_{\mathrm{max}}\left(\frac{d}{L}\right)^m, \qquad m \approx 3 \]`,
sym: [[String.raw`\(\sigma_e, \sigma_m\)`, "electric and magnetic conductivities in the layer"], [String.raw`\(d\)`, "depth into the layer"], [String.raw`\(L\)`, "layer thickness"], [String.raw`\(m\)`, "grading order"], ["reflection (dB)", String.raw`\(10\log_{10}\) of reflected over incident power`]],
how: ["An interface reflects when the wave impedance changes.", "With matched electric and magnetic losses, the impedance stays the same as the medium's, so a normally incident wave enters without reflection.", "On a grid, a sudden jump in loss still reflects a little, so the loss is graded smoothly.", "The wave decays in the layer, reflects from the outer wall, and decays again on the way back."],
say: "A perfectly matched layer absorbs outgoing waves with almost no reflection, because its electric and magnetic losses are matched and graded smoothly. It lets a small simulation box represent open space.",
num: "Readout below: reflected power from each boundary, measured by this 1D simulation.<br>Hard wall: <b>0 dB</b> (everything returns). A graded PML is typically tens of dB better than an abrupt absorber.",
r(fig, ctl) {
  let b = "graded", sim;
  ctl.innerHTML = btns([["wall", "hard wall"], ["abrupt", "abrupt absorber"], ["graded", "graded PML"]], "b") + `<div class="row"><button id="rs">Restart</button></div><div class="readout" id="ro"></div>`;
  const N = 500;
  const mk = () => b === "wall" ? new C2.FDTD1D(N, 0.5, null, { wall: "pec" }) : new C2.FDTD1D(N, 0.5, null, { pml: 40, smax: b === "abrupt" ? 0.5 : 0.6, mode: b, wall: "pec" });
  const measure = () => { const s = mk(); let inc = 0, ref = 0; for (let t = 0; t < 2400; t++) { s.step([250, Math.exp(-Math.pow((t - 60) / 15, 2))]); if (t < 500) inc = Math.max(inc, Math.abs(s.ez[300])); if (t > 1100) ref = Math.max(ref, Math.abs(s.ez[300])); } return 20 * Math.log10(Math.max(ref, 1e-9) / inc); };
  const reset = () => { pick(ctl, "b", b); sim = mk(); const db = measure(); $("ro").innerHTML = `<div><span>reflected power</span><b>${db > -0.5 ? "0 dB (total)" : db.toFixed(1) + " dB"}</b></div>`; };
  ctl.querySelectorAll("button[data-b]").forEach(x => x.onclick = () => { b = x.dataset.b; reset(); });
  $("rs").onclick = reset; reset();
  anim(() => {
    if (!fig.isConnected) { stopAnim(); return; }
    for (let s = 0; s < 4; s++) { const t = sim.t; if (t < 3000) sim.step([250, Math.exp(-Math.pow((t - 60) / 15, 2))]); }
    const xs = range(0, N - 1, N);
    fig.innerHTML = svg(230, `${b !== "wall" ? `<rect x="40" y="20" width="${40 / N * 600}" height="180" fill="#888780" opacity="0.18"/><rect x="${40 + (N - 40) / N * 600}" y="20" width="${40 / N * 600}" height="180" fill="#888780" opacity="0.18"/>` : `<rect x="40" y="20" width="4" height="180" fill="var(--t)"/><rect x="636" y="20" width="4" height="180" fill="var(--t)"/>`}<line x1="40" x2="640" y1="110" y2="110" stroke="var(--p)" stroke-width="0.5"/>${plot(40, 20, 600, 180, xs, Array.from(sim.ez), 0, N - 1, -0.6, 0.6, "#378ADD", 1.8)}<text class="ts" x="44" y="222">${b === "wall" ? "hard walls" : b === "abrupt" ? "abrupt absorbing layers" : "graded PML"} (grey)</text><text class="ts" x="636" y="222" text-anchor="end">step ${sim.t}</text>`);
  });
}},

/* from old ch2 L11 card 3 */
{s: "4. Monitors", t: "How a frequency monitor builds a spectrum",
intu: String.raw`A frequency-domain monitor does not store the whole time history. At every step it multiplies the current field by \(e^{i2\pi f n\Delta t}\) for each requested frequency and adds it to a running sum. When the run ends, the sums are the Fourier transform. Drag the time slider to stop the sum early. While the pulse is still passing, the spectrum is wrong. If the device rings (here, a resonant slab) and the run stops before the ringing dies, the spectrum shows ripples. That is why a run must last until the fields have decayed, and why solvers stop on a decay criterion.`,
eq: String.raw`\[ \tilde{E}(f) = \sum_{n=0}^{M} E^{\,n}\, e^{i2\pi f n\Delta t}\, \Delta t \quad \text{(running sum, updated every step)} \]<div class="eqnote">valid only once \(E^{\,n}\) has decayed to \(\approx 0\) for \(n \gt M\)</div>`,
sym: [[String.raw`\(\tilde{E}(f)\)`, String.raw`running Fourier transform at frequency \(f\)`], [String.raw`\(M\)`, "number of steps so far"], ["ring-down", "slow decay of fields trapped in resonances"]],
how: ["The continuous Fourier transform is an integral over all time.", "On the grid it becomes a sum over time steps, which can be accumulated as the simulation runs.", "Stopping early truncates the integral, like multiplying the signal by a window, which smears and ripples the spectrum.", String.raw`High-\(Q\) resonators ring for a long time, so they need long runs.`],
say: "Frequency monitors accumulate a running discrete Fourier transform of the fields. The result is correct only when the run continues until the fields have decayed, so the run time must cover the device's ring-down.",
num: String.raw`In this demo the slab is \(\varepsilon_r = 9\) and 40 cells thick, so it rings for several round trips. Stopping at about a third of the run leaves visible ripples in the spectrum.`,
r(fig, ctl) {
  ctl.innerHTML = sl("M", "Stop the sum at step", 300, 6000, 50, 6000) + '<div class="readout" id="ro"></div>';
  const N = 1000, eps = new Float64Array(N).fill(1); for (let i = 500; i < 540; i++) eps[i] = 9;
  const sim = new C2.FDTD1D(N, 0.5, eps, { pml: 40, smax: 0.6, wall: "pec" }), rec = [];
  for (let t = 0; t < 6000; t++) { sim.step([150, Math.exp(-Math.pow((t - 60) / 10, 2))]); rec.push(sim.ez[800]); }
  const ls = range(30, 150, 100);
  const spec = M => ls.map(l => { let re = 0, im = 0; for (let n = 0; n < M; n++) { const p = 2 * Math.PI / l * n * 0.5; re += rec[n] * Math.cos(p); im += rec[n] * Math.sin(p); } return re * re + im * im; });
  const fin = spec(6000), mx = Math.max(...fin);
  const u = () => {
    const M = +$("M").value; $("Mv").textContent = M;
    const sp = spec(M), ts = range(0, 5999, 600), rs = ts.map(t => rec[Math.round(t)]);
    fig.innerHTML = svg(270, `<text class="ts" x="40" y="20">probe record E(t)</text>${plot(40, 28, 600, 80, ts, rs, 0, 5999, -0.5, 0.5, "#378ADD", 1.2)}<rect x="${40 + M / 6000 * 600}" y="28" width="${600 - M / 6000 * 600}" height="80" fill="var(--sunk)" opacity="0.8"/><text class="ts" x="40" y="134">spectrum: grey dashed final, coral up to the chosen step</text>${plot(40, 140, 600, 110, ls, fin.map(v => v / mx), 30, 150, 0, 1.3, "#888780", 1.5, "5 4")}${plot(40, 140, 600, 110, ls, sp.map(v => v / mx), 30, 150, 0, 1.3, "#D85A30", 2)}<line x1="40" x2="640" y1="250" y2="250" stroke="var(--p)"/><text class="ts" x="340" y="266" text-anchor="middle">wavelength 30 to 150 cells</text>`);
    const err = Math.max(...sp.map((v, i) => Math.abs(v - fin[i]) / mx));
    $("ro").innerHTML = `<div><span>largest spectrum error</span><b>${(err * 100).toFixed(1)} %</b></div>`;
  };
  $("M").oninput = u; u();
}},

/* from old ch2 L11 card 4 */
{s: "5. Mode overlap", t: "From fields to a number: projecting onto a mode",
intu: String.raw`At the output of a device the field is some mixture: the wanted mode, other modes, radiation. Thesis Sec. 2.6 measures transmission by projecting the field at an output plane onto the target mode, and Ch. 3 Sec. 3.4 writes the projection as Eq. 3.12. Tidy3D normalizes each mode to 1 W and the sources inject 1 W, so \(|a_m|^2\) is directly the fraction of the injected power carried by mode \(m\). The picture uses the scalar version of the same idea: a real slab \(\mathrm{TE}_0\) profile (computed live) as the mode and a Gaussian as the arriving field. Shift it off-center or change its width and the overlap drops, even though all the power arrives. A device can deliver plenty of power and still have a low efficiency into the mode, which is why mode overlap, not total flux, is the right measure.`,
eq: String.raw`\[ a_m = \frac{1}{4}\int_S \left(\mathbf{E}_m^{*}\times\mathbf{H} + \mathbf{E}\times\mathbf{H}_m^{*}\right)\cdot\hat{\mathbf{n}}\,dS \]<div class="eqnote">each mode normalized to 1 W, sources inject 1 W</div>\[ T_m = |a_m|^2 \]<div class="eqref">Ch. 3 Eq. 3.12, Sec. 3.4</div><div class="eqnote">scalar estimate drawn in the picture</div>\[ \eta = \frac{\left|\int E\,\psi_m\, dz\right|^2}{\int |E|^2 dz \int |\psi_m|^2 dz} \]`,
sym: [[String.raw`\(a_m\)`, String.raw`complex amplitude of mode \(m\) in the simulated field`], [String.raw`\(\mathbf{E}, \mathbf{H}\)`, String.raw`simulated fields on the monitor plane \(S\)`], [String.raw`\(\mathbf{E}_m, \mathbf{H}_m\)`, "fields of mode m from the mode solver at that plane, normalized to 1 W"], [String.raw`\(\hat{\mathbf{n}}\)`, String.raw`normal of the plane \(S\)`], [String.raw`\(T_m\)`, String.raw`fraction of the injected power carried by mode \(m\)`], [String.raw`\(\eta\)`, "simplified overlap for one field component"]],
how: ["Guided modes of a waveguide are orthogonal under this cross-product integral, so the output field can be expanded in modes.", String.raw`Each coefficient is found by projecting onto that mode: Eq. 3.12, with the mode computed by the mode solver at the monitor plane (Lesson 3).`, String.raw`With modes normalized to 1 W and 1 W injected, \(T_m = |a_m|^2\) is the fraction of the injected power in mode \(m\). Power in other modes or radiation counts as loss.`, String.raw`For a grating coupler the source is the Gaussian beam that represents the fiber, and the coupling efficiency is \(|a_m|^2\) for the fundamental mode of the access waveguide, travelling from the grating toward the waveguide.`],
say: "Transmission is computed by projecting the field at the output plane onto the target mode with the overlap integral of Eq. 3.12. Modes and sources are normalized to 1 W, so the squared amplitude is the fraction of the injected power in that mode, and power in other modes or radiation does not count.",
num: "A Gaussian of the right width centered on the slab: overlap close to <b>100 %</b>. Offset by half the slab thickness: noticeably less (see the readout).",
r(fig, ctl) {
  ctl.innerHTML = sl("off", "Offset of the arriving field (nm)", -200, 200, 1, 0) + sl("w", "Field half-width (nm)", 30, 300, 1, 110) + '<div class="readout" id="ro"></div>';
  const zs = range(-500, 500, 801), N = C2.slabN(3.5, 1, 160, 800, 0, "TE"), psi = C2.slabProfile(3.5, 1, 160, 800, 0, "TE", N, zs).main;
  const u = () => {
    const off = +$("off").value, w = +$("w").value; $("offv").textContent = off + " nm"; $("wv").textContent = w + " nm";
    const E = zs.map(z => Math.exp(-Math.pow((z - off) / w, 2)));
    let a = 0, b = 0, c = 0; zs.forEach((z, i) => { a += E[i] * psi[i]; b += E[i] * E[i]; c += psi[i] * psi[i]; });
    const eta = a * a / (b * c);
    fig.innerHTML = svg(250, `<rect x="${60 + (420) / 1000 * 560}" y="30" width="${160 / 1000 * 560}" height="180" fill="var(--blue-bg)"/>${plot(60, 30, 560, 180, zs, psi, -500, 500, 0, 1.05, "#378ADD", 2.5)}${plot(60, 30, 560, 180, zs, E, -500, 500, 0, 1.05, "#D85A30", 2.5, "5 4")}<line x1="60" x2="620" y1="210" y2="210" stroke="var(--p)"/><text class="ts" x="340" y="232" text-anchor="middle">across the slab, −500 to 500 nm. Blue: TE<tspan baseline-shift='sub' font-size='9'>0</tspan> mode. Coral dashed: arriving field</text>`);
    $("ro").innerHTML = `<div><span>overlap η</span><b>${(eta * 100).toFixed(1)} %</b></div><div><span>power elsewhere</span><b>${((1 - eta) * 100).toFixed(1)} %</b></div>`;
  };
  $("off").oninput = u; $("w").oninput = u; u();
}},

/* NEW: grid resolution, Sec. 2.6 last sentences and Ch. 3 Sec. 3.6 */
{s: "6. Grid resolution", t: "How fine the grid must be: steps per wavelength in GaAs",
intu: String.raw`The grid has to be fine enough to describe both the wave and the geometry. Pick 10, 20 or 30 steps per wavelength and see the same 160 nm GaAs membrane, with an 80 nm groove etched through it, drawn on the grid. A cell is GaAs (blue) when its center lies in GaAs. The thin outline is the true shape. At 10 steps the groove snaps to whole cells and comes out too narrow, at 30 it is close. The strip below is a wave with the shortest wavelength the GaAs allows, \(\lambda_0/n\), moving along \(x\) and known only at the grid points: at 10 points per wavelength the polygon through the points visibly cuts the crests, at 30 it lies on the true wave. The wavelength is shortest in the highest-index material, so that material sets the resolution. Tidy3D builds a non-uniform grid from the steps per wavelength in each material, so with the per-material button the cells above and below the membrane, in air, are 3.5 times taller. The \(x\) spacing stays fine everywhere because the GaAs spans the whole \(x\) range.`,
eq: String.raw`\[ \Delta x = \frac{\lambda_0}{N_\lambda\, n} \]<div class="eqnote">\(n\): index of the highest-index material, GaAs. Example from Ch. 3 Sec. 3.6:</div>\[ \frac{\lambda_0}{20\, n_{\mathrm{GaAs}}} = \frac{795\ \mathrm{nm}}{20 \times 3.492} = 11.38\ \mathrm{nm} \]<div class="eqref">Ch. 2 Sec. 2.6, Ch. 3 Sec. 3.6</div>`,
sym: [[String.raw`\(N_\lambda\)`, "steps per wavelength, counted in the material"], [String.raw`\(\Delta x\)`, "nominal cell size in that material"], [String.raw`\(\lambda_0/n\)`, "wavelength in the material, shortest in the highest index"], ["non-uniform grid", "cells sized per material, finest in GaAs, larger in air"]],
how: [String.raw`The shortest wavelength in the domain is in the highest-index material, \(\lambda_0/n\). In GaAs at 800 nm that is 229 nm, 3.5 times shorter than in air.`, String.raw`To describe that wave, a fixed number \(N_\lambda\) of steps per material wavelength gives \(\Delta x = \lambda_0/(N_\lambda n)\).`, "To describe the geometry, the membrane thickness and the narrowest teeth and gaps need several cells each, otherwise their edges snap by up to a cell.", "Tidy3D sets the steps per wavelength in each material, so the resolution is quoted for GaAs, where the cells are finest."],
say: String.raw`The grid has to describe both the wave and the geometry, so its resolution is given in steps per wavelength in the highest-index material. The nominal GaAs cell is \(\lambda_0/(N_\lambda n)\), which at 20 steps per wavelength and 795 nm is about 11.4 nm.`,
num: String.raw`\(\lambda_0 = 800\) nm, \(n = 3.5\): 10, 20, 30 steps give \(\Delta x\) = <b>22.9</b>, <b>11.4</b>, <b>7.6 nm</b>, so the 160 nm membrane is <b>7</b>, <b>14</b>, <b>21</b> cells thick.<br>Method settings (Ch. 3 Sec. 3.6): <b>30</b> steps per wavelength for the 2D grating designs, <b>20</b> for the 3D tapers and PBS. At 20, \(\lambda_0 = 795\) nm and \(n = 3.492\) give a nominal GaAs cell of <b>11.38 nm</b>, about 11.4 nm, the size chosen for the PBS pixels.`,
note: String.raw`If asked why not always 30: a finer grid costs much more in 3D, roughly the fourth power of the resolution, because the cell count grows in three directions and the time step shrinks with the cell (Beyond the thesis B2). That is why the 3D runs use 20 and the 2D gratings 30.`,
r(fig, ctl) {
  let N = 20, mode = "mat", run = true;
  const reduce = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  ctl.innerHTML = `<div class="row"><label>Steps per wavelength</label><button data-n="10">10</button><button data-n="20">20</button><button data-n="30">30</button></div><div class="row"><label>Grid in the air</label><button data-g="mat">per material</button><button data-g="uni">uniform, GaAs size</button></div><div class="row"><button id="gp">${reduce ? "Play" : "Pause"}</button><span class="note">moves the wave along x</span></div><div class="readout" id="ro"></div>`;
  if (reduce) run = false;
  const lam0 = 800, n = 3.5, T = 160, g0 = 410, g1 = 490, XW = 896, PX = 560 / XW;
  const X = x => 60 + x * PX, Z = z => 130 - z * PX, s = C2L9_sub;
  let xs = [], dx = 0, ph = 0;
  const build = () => {
    pick(ctl, "n", N); pick(ctl, "g", mode);
    dx = lam0 / (N * n); const da = mode === "mat" ? lam0 / N : dx;
    xs = []; for (let x = 0; x <= XW + 1e-6; x += dx) xs.push(x);
    const zs = []; for (let z = -T / 2; z <= T / 2 + 1e-6; z += dx) zs.push(z);
    for (let z = T / 2 + da; z <= 160 + 1e-6; z += da) { zs.push(z); zs.push(-z); }
    let g = "";
    // filled GaAs cells, merged into runs of columns
    let runStart = null; const cols = [];
    for (let i = 0; i < xs.length - 1; i++) { const xc = xs[i] + dx / 2, ga = !(xc >= g0 && xc <= g1); cols.push(ga); }
    for (let i = 0; i <= cols.length; i++) { if (i < cols.length && cols[i]) { if (runStart === null) runStart = i; } else if (runStart !== null) { g += `<rect x="${X(xs[runStart]).toFixed(1)}" y="${Z(T / 2).toFixed(1)}" width="${((i - runStart) * dx * PX).toFixed(1)}" height="${(T * PX).toFixed(1)}" fill="#378ADD" fill-opacity="0.45"/>`; runStart = null; } }
    xs.forEach(x => g += `<line x1="${X(x).toFixed(1)}" x2="${X(x).toFixed(1)}" y1="${Z(160)}" y2="${Z(-160)}" stroke="var(--p)" stroke-width="0.4" opacity="0.55"/>`);
    zs.forEach(z => g += `<line x1="${X(0)}" x2="${X(xs[xs.length - 1]).toFixed(1)}" y1="${Z(z).toFixed(1)}" y2="${Z(z).toFixed(1)}" stroke="var(--p)" stroke-width="0.4" opacity="0.55"/>`);
    // true outline
    g += `<rect x="${X(0)}" y="${Z(T / 2)}" width="${(g0 * PX).toFixed(1)}" height="${T * PX}" fill="none" stroke="#D85A30" stroke-width="1.6"/><rect x="${X(g1).toFixed(1)}" y="${Z(T / 2)}" width="${((XW - g1) * PX).toFixed(1)}" height="${T * PX}" fill="none" stroke="#D85A30" stroke-width="1.6"/>`;
    g += `<text class="ts" x="54" y="${Z(120) + 4}" text-anchor="end">air</text><text class="ts" x="54" y="${Z(0) + 4}" text-anchor="end">GaAs</text><text class="ts" x="54" y="${Z(-120) + 4}" text-anchor="end">air</text><text class="ts" x="${X((g0 + g1) / 2)}" y="${Z(160) - 8}" text-anchor="middle">80 nm groove, etched through</text><text class="ts" x="${X(0)}" y="${Z(160) - 8}">160 nm membrane</text>`;
    g += `<line x1="${X(XW) + 8}" x2="${X(XW) + 8}" y1="${Z(T / 2)}" y2="${Z(-T / 2)}" stroke="var(--t)" marker-start="url(#ar)" marker-end="url(#ar)"/><text class="ts" x="${X(XW) + 14}" y="${Z(0) + 4}">160</text><text class="ts" x="${X(XW) + 14}" y="${Z(0) + 18}">nm</text>`;
    g += `<text class="ts" x="60" y="${Z(-160) + 30}">a wave with the GaAs wavelength λ${"<tspan baseline-shift='sub' font-size='9'>0</tspan>"}/n = ${(lam0 / n).toFixed(0)} nm, known only at the grid points (blue). Grey: the true wave</text>`;
    fig.innerHTML = svg(370, `${g}<g id="C2L9w"></g>`) + `<p class="note">Blue cells: GaAs on the grid. Orange outline: the true membrane. Cell boundaries in thin grey.</p>`;
    let k = 0; cols.forEach((ga, i) => { if (!ga) k++; });
    const rows = Math.round(T / dx);
    $("ro").innerHTML = `<div><span>GaAs cell λ<sub>0</sub>/(N<sub>λ</sub>n)</span><b>${dx.toFixed(1)} nm</b></div><div><span>membrane thickness</span><b>${rows} cells</b></div><div><span>80 nm groove drawn as</span><b>${k} cells = ${(k * dx).toFixed(1)} nm</b></div><div><span>cell height in air</span><b>${da.toFixed(1)} nm</b></div>`;
    wave();
  };
  const wave = () => {
    const w = $("C2L9w"); if (!w) return;
    const lm = lam0 / n, y0 = 318, A = 26, f = x => Math.sin(2 * Math.PI * x / lm - ph);
    let tr = ""; for (let x = 0; x <= XW; x += 3) tr += (tr ? "L" : "M") + X(x).toFixed(1) + " " + (y0 - A * f(x)).toFixed(1);
    let sp = "", dots = ""; for (let i = 0; i < xs.length - 1; i++) { const xc = xs[i] + dx / 2, Y = y0 - A * f(xc); sp += (sp ? "L" : "M") + X(xc).toFixed(1) + " " + Y.toFixed(1); dots += `<circle cx="${X(xc).toFixed(1)}" cy="${Y.toFixed(1)}" r="2.2" fill="#378ADD"/>`; }
    w.innerHTML = `<line x1="60" x2="620" y1="${y0}" y2="${y0}" stroke="var(--p)" stroke-width="0.5"/><path d="${tr}" fill="none" stroke="#888780" stroke-width="1.2" stroke-dasharray="4 3"/><path d="${sp}" fill="none" stroke="#378ADD" stroke-width="1.8"/>${dots}`;
  };
  ctl.querySelectorAll("button[data-n]").forEach(b => b.onclick = () => { N = +b.dataset.n; build(); });
  ctl.querySelectorAll("button[data-g]").forEach(b => b.onclick = () => { mode = b.dataset.g; build(); });
  $("gp").onclick = () => { run = !run; $("gp").textContent = run ? "Pause" : "Play"; if (reduce && run) { ph += 0.6; wave(); } };
  build();
  let last = null;
  anim(t => {
    if (!fig.isConnected) { stopAnim(); return; }
    if (last !== null && run) ph += (t - last) * 2.2;
    last = t; wave();
  });
}},

/* from old ch2 L11 card 6, rewritten for the new lesson order */
{s: "7. The workflow", t: "One FDTD transmission simulation, start to finish",
intu: "Step through a device simulation in the order it is set up, with the lesson that explains each step. This is how the tapers, the PBS and the grating couplers of the thesis are simulated, and it is a good outline for explaining Sec. 2.6 and Ch. 3 Sec. 3.6 on the board.",
eq: String.raw`\[ \text{geometry} \to \text{grid} \to \text{source} \to \text{symmetry} \to \text{PML} \]\[ \to \text{run} \to \text{monitors} \to \text{mode overlap} \to \text{check} \]`,
sym: [["geometry", String.raw`\(\varepsilon_r(\mathbf{r})\) of the structure on the grid`], ["grid", "steps per wavelength in GaAs"], ["source", "mode source or Gaussian beam, with a pulse covering the band"], ["symmetry", "mirror planes that halve the domain, only where structure and source allow"]],
how: [String.raw`Put the structure on the grid with space around it, and choose the resolution in GaAs (card 6).`, "Launch a guided mode from the mode solver, or the Gaussian beam that represents the fiber, with a pulse covering the band (cards 1 and 2).", "Use a mirror plane only if the structure and the source are symmetric about it (Lesson 2), and surround the domain with PML (card 3).", "Run the leapfrog until the fields have decayed (Lesson 8), record Fourier-transformed fields at the output (card 4), and project them onto the target mode with Eq. 3.12 (card 5)."],
say: "An FDTD transmission is obtained by launching a broadband mode or beam into the gridded structure surrounded by PML, recording Fourier-transformed fields at the output plane, and projecting them onto the target mode.",
num: "Things that most often go wrong: wrong symmetry value (a near-zero result), monitor too close to the structure (evanescent fields), run too short (ripples in the spectrum), grid too coarse for a small feature or a long interference section.",
r(fig, ctl) {
  let k = 0, playing = false, tk = 0, last = null;
  const S = [["Geometry", "Put the permittivity of the structure on the grid. Leave space between it and the PML so evanescent tails are not cut.", "L1, L3"], ["Grid", "Choose the steps per wavelength in GaAs: 30 for the 2D gratings, 20 in 3D (Ch. 3 Sec. 3.6).", "L9 card 6"], ["Source", "Mode source for a waveguide input, Gaussian beam for the fiber. The pulse band covers the spectrum you need.", "L9 cards 1, 2"], ["Symmetry", "Mirror planes only where structure and source are symmetric. Pick the value that keeps the launched mode.", "L2"], ["PML", "Perfectly matched layers on all sides. The waveguides run through them.", "L9 card 3"], ["Run", "Leapfrog updates of E and H until the fields have decayed.", "L8"], ["Monitors", "Running Fourier transform of the fields at the output plane.", "L9 card 4"], ["Mode overlap", "Project onto the target mode with Eq. 3.12. T = |a|² is the fraction of the injected 1 W.", "L9 card 5"], ["Check", "Check that a mirror plane reproduces the full-domain result, and that the grid is fine enough.", "Ch. 3 Sec. 3.6, B2"]];
  ctl.innerHTML = `<div class="row"><button id="wb">Back</button><button id="wp">Play</button><button id="wn">Next</button><span class="note" id="ws" style="margin-left:6px"></span></div>`;
  const u = () => {
    let s = ""; S.forEach(([t], i) => { const x = 20 + (i % 5) * 130, y = i < 5 ? 30 : 120; s += `<g class="${i === k ? "c-coral" : i < k ? "c-teal" : "c-gray"}"><rect x="${x}" y="${y}" width="118" height="52" rx="8" stroke-width="${i === k ? 1.6 : 0.6}"/></g><text class="th" x="${x + 59}" y="${y + 31}" text-anchor="middle" style="font-size:12px">${i + 1}. ${t}</text>`; if (i % 5 !== 4 && i < S.length - 1) s += `<line x1="${x + 119}" x2="${x + 129}" y1="${y + 26}" y2="${y + 26}" class="arr" marker-end="url(#ar)"/>`; });
    s += `<path d="M${20 + 4 * 130 + 59} 83 L${20 + 4 * 130 + 59} 101 L79 101 L79 118" fill="none" class="arr" marker-end="url(#ar)"/>`;
    const t = S[k][1], cut = t.length > 88 ? t.lastIndexOf(" ", 88) : -1;
    fig.innerHTML = svg(260, `${s}<text class="th" x="340" y="204" text-anchor="middle">${S[k][0]} (${S[k][2]})</text><text class="ts" x="340" y="226" text-anchor="middle">${cut > 0 ? t.slice(0, cut) : t}</text><text class="ts" x="340" y="244" text-anchor="middle">${cut > 0 ? t.slice(cut + 1) : ""}</text>`);
    $("wb").disabled = k === 0; $("wn").disabled = k === S.length - 1; $("ws").textContent = `step ${k + 1} of ${S.length}`;
  };
  const stop = () => { playing = false; $("wp").textContent = "Play"; };
  $("wb").onclick = () => { stop(); k--; u(); }; $("wn").onclick = () => { stop(); k++; u(); };
  $("wp").onclick = () => { playing = !playing; if (playing && k === S.length - 1) k = 0; tk = 0; $("wp").textContent = playing ? "Pause" : "Play"; u(); };
  u();
  anim(t => {
    if (!fig.isConnected) { stopAnim(); return; }
    const dt = last === null ? 0 : t - last; last = t;
    if (playing) { tk += dt; if (tk > 3) { tk = 0; if (k < S.length - 1) { k++; u(); } else stop(); } }
  });
}},

/* quiz rewritten: thesis Chapter 2 content only */
{s: "8. Quiz", t: "Chapter 2 quiz: twelve questions",
intu: "Twelve questions, one or two from each section of thesis Chapter 2: the membrane and its symmetry, the field jump, the mode solver, gratings, the DBR and the air gap, MMI self-imaging, two-mode interference and the PBS, and FDTD. Answer, read why, and say the reason out loud as you would at the board.",
eq: "<div class=\"eqnote\">Thesis Chapter 2, Sections 2.1 to 2.6, Lessons 1 to 9</div>",
sym: [["L1, L2", "membrane, mirror symmetry, TE-like and TM-like, field jump"], ["L3", "mode solver"], ["L4, L5", "gratings, DBR and air gap"], ["L6, L7", "MMI self-imaging, two-mode interference and PBS"], ["L8, L9", "FDTD, Yee cell, PML, pulse, grid"]],
how: ["Answer without looking.", "Explain the reason in one sentence.", "Reopen the lesson named in the feedback for any miss.", "Repeat before the defense."],
say: "When a question goes beyond Chapter 2, say so and answer from the physics you know.",
num: "Aim for 12 out of 12 with reasons.",
r(fig, ctl) {
  const Q = [
    ["The membrane has air above and below. What does that mean for its guided modes?", ["Every mode is even or odd under z → −z, and on the mid-plane the even ones are purely TE", "Every mode is purely TE or purely TM everywhere", "Only TE modes are guided"], 0, "The structure is symmetric under the mirror z → −z, so each mode is even or odd. On the mid-plane even modes are purely TE and odd modes purely TM, hence TE-like and TM-like (Lesson 2, Johnson 1999)."],
    ["Why is the field of a TM-like mode strongest just outside the top and bottom surfaces?", ["The normal D = εE<sub>z</sub> is continuous, so E<sub>z</sub> jumps up by ε<sub>GaAs</sub>/ε<sub>air</sub>, about 12, in the air", "TM light is not guided", "The tangential E is zero at the surface"], 0, "Eq. 2.1. The main field of a TM-like mode is E<sub>z</sub>, so it peaks in the air just outside, which also lowers its effective index (Lesson 2)."],
    ["What does one eigenvalue of the mode solver give?", ["The effective index n<sub>eff</sub> = β/k<sub>0</sub> of one mode of a cross-section that does not change along the waveguide", "The transmission of the device", "The resonance frequency of the cell"], 0, "With fields varying as exp(iβx), Maxwell's equations become an eigenvalue problem on the cross-section (Lesson 3)."],
    ["Which period sends the first diffraction order to a fiber at angle θ?", ["Λ = λ<sub>0</sub>/(n<sub>eff</sub> − n<sub>c</sub> sin θ)", "Λ = λ<sub>0</sub>/(2n<sub>eff</sub>)", "Λ = λ<sub>0</sub> n<sub>eff</sub>"], 0, "Phase matching, Eq. 2.2, with m = −1 gives Eq. 2.3. A TM-like mode has a lower n<sub>eff</sub>, so it needs a longer period (Lesson 4)."],
    ["Why is exactly vertical emission avoided?", ["At θ = 0 the second order gives β − 4π/Λ = −β, so the grating reflects the forward mode into the backward one", "A vertical fiber cannot be aligned", "The first order cannot radiate at θ = 0"], 0, "So the period is detuned to emit at a small angle and the fiber is tilted by the same angle (Lesson 4, Taillaert 2006)."],
    ["Why does a GaAs/AlGaAs DBR need many pairs?", ["The index ratio n<sub>H</sub>/n<sub>L</sub> is small, about 1.18, and R depends on (n<sub>H</sub>/n<sub>L</sub>)<sup>2N</sup>", "The layers absorb", "Quarter-wave layers reflect out of phase"], 0, "Eq. 2.6. With a small contrast each interface reflects little, so many in-phase reflections are needed (Lesson 5)."],
    ["What does the thickness of the air gap between the grating and the DBR decide?", ["The phase of the light returning from the DBR relative to the light radiated upward, so whether they add or cancel", "Only the stopband width of the DBR", "Nothing, the DBR reflects everything"], 0, "The returning light interferes with the upward light, which changes how much goes up and how strongly the grating scatters, so the gap is chosen together with the grating (Lesson 5)."],
    ["In a general MMI section, where do single images of the input form?", ["At L = p(3L<sub>π</sub>), direct for even p and mirrored for odd p", "At every L<sub>π</sub>, always direct", "Only at the end of the section"], 0, "Eq. 2.13. At 3L<sub>π</sub> the even modes are back in phase and the odd modes have changed sign (Lesson 6)."],
    ["A two-mode section has L = p L<sub>π</sub><sup>TE</sup> = q L<sub>π</sub><sup>TM</sup>. When does it split the two polarizations?", ["When p and q have opposite parity", "When p = q", "When both are even"], 0, "The light crosses after every beat length, L<sub>π</sub> = λ<sub>0</sub>/[2(n<sub>0</sub> − n<sub>1</sub>)]. An odd number of crossings sends one polarization to the cross port and an even number keeps the other in the bar port (Lesson 7)."],
    ["In the Yee cell, where does each electric field component sit?", ["At the center of a loop of four magnetic components, on an edge center", "At a cell corner, next to all six components", "At the cell center"], 0, "Each magnetic component likewise sits at the center of a loop of four electric components, which is what the curls need. E and H are updated in alternating half time steps (Lesson 8)."],
    ["What do the perfectly matched layers do, and why can one FDTD run give a whole spectrum?", ["They absorb outgoing light with almost no reflection, and a short pulse contains many frequencies that a Fourier transform separates", "They reflect light back so it is measured twice, and the run is repeated per frequency", "They set the time step, and the source is a single frequency"], 0, "PML make the finite domain behave like open space. The recorded fields are Fourier transformed to give the response over the band (Lesson 9, cards 2 and 3)."],
    ["How is the grid resolution of the thesis stated?", ["In steps per wavelength in the highest-index material, GaAs", "In steps per wavelength in air", "As a fixed 10 nm cell everywhere"], 0, "The grid must describe both the wave and the geometry, and the wavelength is shortest in GaAs. The nominal cell is λ<sub>0</sub>/(N<sub>λ</sub>n) (Lesson 9, card 6)."]
  ];
  let i = 0, score = 0, done = false;
  const u = () => {
    if (i >= Q.length) { fig.innerHTML = svg(140, `<text class="th" x="340" y="64" text-anchor="middle" style="font-size:28px">${score} / ${Q.length}</text><text class="ts" x="340" y="96" text-anchor="middle">${score === Q.length ? "Full marks. Now explain each one out loud." : "Reopen the lessons for the ones you missed."}</text>`); ctl.innerHTML = `<div class="row"><button id="qr">Start again</button></div>`; $("qr").onclick = () => { i = 0; score = 0; u(); }; return; }
    const [q, o, c, why] = Q[i]; done = false;
    fig.innerHTML = svg(70, `<text class="ts" x="20" y="28">question ${i + 1} of ${Q.length}</text><rect x="20" y="40" width="640" height="8" rx="4" fill="var(--b)"/><rect x="20" y="40" width="${640 * i / Q.length}" height="8" rx="4" fill="#1D9E75"/><text class="ts" x="660" y="28" text-anchor="end">score ${score}</text>`);
    ctl.innerHTML = `<div class="quiz"><p style="font-weight:600">${q}</p><div class="opts">${o.map((_, j) => (j + i) % o.length).map(j => `<button data-a="${j}">${o[j]}</button>`).join("")}</div><div class="fb" id="qfb"></div><div class="row"><button id="qn" disabled>Next question</button></div></div>`;
    ctl.querySelectorAll("button[data-a]").forEach(b => b.onclick = () => { if (done) return; done = true; const ok = +b.dataset.a === c; if (ok) score++; b.classList.add("on"); $("qfb").innerHTML = `<span class="${ok ? "good" : "badc"}">${ok ? "Correct." : "Not quite."}</span> ${why}`; $("qn").disabled = false; });
    $("qn").onclick = () => { i++; u(); };
  };
  u();
}}

],
summary: String.raw`A Gaussian pulse covers a band set by its spectral width, with \(\tau\sigma_f = 1/(2\pi)\), so one FDTD run gives the response over the whole band after a Fourier transform of the recorded fields. Perfectly matched layers absorb outgoing light with almost no reflection, so the finite domain behaves like open space. Frequency monitors build the spectrum as a running Fourier sum, valid once the fields have decayed. Light is launched as a guided mode from the mode solver or as a Gaussian beam for the fiber, and the transmission into a mode is \(T_m = |a_m|^2\) from the overlap of Eq. 3.12, with modes and sources normalized to 1 W. The grid must describe both the wave and the geometry, so its resolution is given in steps per wavelength in GaAs, with a nominal cell \(\lambda_0/(N_\lambda n)\): 30 steps in the 2D grating designs and 20 in 3D, about 11.4 nm.`,
sheet: [
[String.raw`\[ \tau\sigma_f = \frac{1}{2\pi} \]`, "Pulse length and bandwidth (Gaussian pulse)"],
[String.raw`\[ \tilde{E}(f) = \sum_n E^{\,n}\, e^{i2\pi f n\Delta t}\, \Delta t \]`, "Running Fourier transform in a monitor"],
[String.raw`\[ T(f) = \frac{|\tilde{E}_{\mathrm{slab}}(f)|^2}{|\tilde{E}_{\mathrm{ref}}(f)|^2} \]`, "Transmission over the band from one pulse"],
[String.raw`\[ \frac{\sigma_e}{\varepsilon} = \frac{\sigma_m}{\mu}, \qquad \sigma(d) = \sigma_{\mathrm{max}}\left(\frac{d}{L}\right)^m \]`, "Matched, graded PML (textbook form)"],
[String.raw`\[ a_m = \frac{1}{4}\int_S \left(\mathbf{E}_m^{*}\times\mathbf{H} + \mathbf{E}\times\mathbf{H}_m^{*}\right)\cdot\hat{\mathbf{n}}\,dS, \qquad T_m = |a_m|^2 \]`, "Mode overlap (Ch. 3 Eq. 3.12), modes and sources normalized to 1 W"],
[String.raw`\[ \Delta x = \frac{\lambda_0}{N_\lambda\, n}, \qquad \frac{795\ \mathrm{nm}}{20 \times 3.492} = 11.38\ \mathrm{nm} \]`, "Nominal cell in the highest-index material (Ch. 3 Sec. 3.6)"]],
consts: String.raw`1D simulations in normalized units (\(\Delta x = 1\), \(c = 1\)). Pulse and grid examples: \(\lambda_0 = 800\) nm, \(n = 3.5\).`,
sources: ["Taflove and Hagness, \"Finite-difference time-domain solution of Maxwell's equations\", in Wiley Encyclopedia of Electrical and Electronics Engineering, ed. J. G. Webster, Wiley (2016), Sec. 13 (perfectly matched layers)", "Tidy3D documentation and source, Flexcompute, version 2.11.2 (GaussianPulse fwidth, mode sources and Gaussian beams, mode monitors normalized to 1 W, non-uniform grid from steps per wavelength, symmetry)", "Thesis Ch. 3 Sec. 3.4 (mode overlap, Eq. 3.12) and Sec. 3.6 (grid, boundaries and sources) for the method settings quoted here"]
});

addLesson("thesis", "ch2", {
level: "Pro",
id: "thesis-ch2-l11", title: "FDTD 4: sources, PML, monitors, mode overlap", short: "11. FDTD 4: from run to result",
big: "A device simulation needs four more ingredients around the Yee grid. A source launches a short pulse whose spectrum covers the band of interest. Perfectly matched layers absorb everything that reaches the edge, so the small box behaves like open space. Monitors Fourier transform the fields as they pass, building up spectra step by step. And a mode decomposition projects the field at the output onto the mode you care about, which turns fields into a transmission number. A convergence check against grid resolution then tells you how far to trust it.",
bridge: "Oskooi et al. 2010 describe all of these pieces for MEEP: sources, PML (their Sec. 4.2), flux and Fourier-transformed field output. Tidy3D provides the same ingredients under its own names. All simulations on this page are live 1D FDTD.",
cards: [
{s: "1. The pulse", t: "A Gaussian pulse: short in time, wide in frequency",
intu: "A source switched on as a short Gaussian pulse contains a band of frequencies around its centre. The shorter the pulse, the wider its spectrum: duration and bandwidth trade off exactly. Tidy3D's GaussianPulse is specified by its centre frequency and fwidth, the standard deviation of its frequency content. Drag the relative bandwidth. A wide band lets one run cover a whole spectrum, but the run must last long enough for the pulse to pass and for the device to ring down. A narrow band gives a long pulse and a long run.",
eq: String.raw`\[ s(t) \propto \exp\!\left[-\frac{(t - t_0)^2}{2\tau^2}\right] \sin(2\pi f_0 t) \qquad |S(f)| \propto \exp\!\left[-\frac{(f - f_0)^2}{2\sigma_f^2}\right] \]\[ \tau\,\sigma_f = \frac{1}{2\pi} \]`,
sym: [[String.raw`\(f_0\)`, "centre frequency (c/λ₀)"], [String.raw`\(\sigma_f\)`, "standard deviation of the spectrum (Tidy3D's fwidth)"], [String.raw`\(\tau\)`, "standard deviation of the pulse envelope in time"], [String.raw`\(t_0\)`, "delay so the pulse starts smoothly from zero"]],
how: ["The Fourier transform of a Gaussian is a Gaussian.", "Their widths are inversely related: τσ_f = 1/(2π) for these definitions.", "Multiplying by the carrier sin(2πf₀t) shifts the spectrum to f₀.", "So the spectral band and the pulse length are set together by one parameter."],
say: "A Gaussian pulse source covers a band of frequencies set by its spectral width. A wider band means a shorter pulse, and one FDTD run then yields the response across that band.",
num: "λ₀ = 800 nm, f₀ = 375 THz. fwidth = f₀/10 = 37.5 THz ⟹ τ = 1/(2π × 37.5 THz) ≈ <b>4.2 fs</b>.<br>±2σ<sub>f</sub> (300 to 450 THz) covers about <b>667 to 1000 nm</b>.",
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

{s: "2. PML", t: "Absorbing boundaries: why a PML works",
intu: "The simulation box is finite, but the device sits in open space. Whatever reaches the edge must vanish without coming back. A hard wall reflects everything. A layer that simply absorbs, switched on abruptly, also reflects, because the sudden change in material is itself an interface. A perfectly matched layer absorbs gradually, with electric and magnetic losses matched so that its impedance equals that of the medium, and the loss rises smoothly from zero. Oskooi et al. describe PML in their Sec. 4.2 as making the finite domain behave like open space with almost no reflection. Pick a boundary and watch the pulse come back, or not.",
eq: String.raw`<div class="eqnote">matched layer</div>\[ \frac{\sigma_e}{\varepsilon} = \frac{\sigma_m}{\mu} \;\Longrightarrow\; \text{impedance unchanged, no reflection at its face} \]<div class="eqnote">graded loss</div>\[ \sigma(d) = \sigma_{\mathrm{max}}\left(\frac{d}{L}\right)^m, \qquad m \approx 3 \]`,
sym: [[String.raw`\(\sigma_e, \sigma_m\)`, "electric and magnetic conductivities in the layer"], [String.raw`\(d\)`, "depth into the layer"], [String.raw`\(L\)`, "layer thickness"], [String.raw`\(m\)`, "grading order"], ["reflection (dB)", "10 log₁₀ of reflected over incident power"]],
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
    for (let s = 0; s < 4; s++) { const t = sim.t; if (t < 3000) sim.step([250, Math.exp(-Math.pow((t - 60) / 15, 2))]); }
    const xs = range(0, N - 1, N);
    fig.innerHTML = svg(230, `${b !== "wall" ? `<rect x="40" y="20" width="${40 / N * 600}" height="180" fill="#888780" opacity="0.18"/><rect x="${40 + (N - 40) / N * 600}" y="20" width="${40 / N * 600}" height="180" fill="#888780" opacity="0.18"/>` : `<rect x="40" y="20" width="4" height="180" fill="var(--t)"/><rect x="636" y="20" width="4" height="180" fill="var(--t)"/>`}<line x1="40" x2="640" y1="110" y2="110" stroke="var(--p)" stroke-width="0.5"/>${plot(40, 20, 600, 180, xs, Array.from(sim.ez), 0, N - 1, -0.6, 0.6, "#378ADD", 1.8)}<text class="ts" x="44" y="222">${b === "wall" ? "hard walls" : b === "abrupt" ? "abrupt absorbing layers" : "graded PML"} (grey)</text><text class="ts" x="636" y="222" text-anchor="end">step ${sim.t}</text>`);
  });
}},

{s: "3. Monitors", t: "How a frequency monitor builds a spectrum",
intu: "A frequency-domain monitor does not store the whole time history. At every step it multiplies the current field by e<sup>i2πfnΔt</sup> for each requested frequency and adds it to a running sum. When the run ends, the sums are the Fourier transform. Drag the time slider to stop the sum early. While the pulse is still passing, the spectrum is wrong. If the device rings (here, a resonant slab) and the run stops before the ringing dies, the spectrum shows ripples. That is why a run must last until the fields have decayed, and why solvers stop on a decay criterion.",
eq: String.raw`\[ \tilde{E}(f) = \sum_{n=0}^{M} E^{\,n}\, e^{i2\pi f n\Delta t}\, \Delta t \quad \text{(running sum, updated every step)} \]<div class="eqnote">valid only once \(E^{\,n}\) has decayed to \(\approx 0\) for \(n \gt M\)</div>`,
sym: [[String.raw`\(\tilde{E}(f)\)`, "running Fourier transform at frequency f"], [String.raw`\(M\)`, "number of steps so far"], ["ring-down", "slow decay of fields trapped in resonances"]],
how: ["The continuous Fourier transform is an integral over all time.", "On the grid it becomes a sum over time steps, which can be accumulated as the simulation runs.", "Stopping early truncates the integral, like multiplying the signal by a window, which smears and ripples the spectrum.", "High-Q resonators ring for a long time, so they need long runs."],
say: "Frequency monitors accumulate a running discrete Fourier transform of the fields. The result is correct only when the run continues until the fields have decayed, so the run time must cover the device's ring-down.",
num: "In this demo the slab is ε = 9 and 40 cells thick, so it rings for several round trips. Stopping at about a third of the run leaves visible ripples in the spectrum.",
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

{s: "4. Mode overlap", t: "From fields to a number: projecting onto a mode",
intu: "At the output of a device the field is some mixture: the wanted mode, other modes, radiation. The transmission into the wanted mode is the overlap of the output field with that mode's profile, normalized by power. This card uses a real slab TE0 profile (computed live) as the mode and a Gaussian as the incoming field. Shift it off-centre or change its width and the overlap drops, even though all the power arrives. This is exactly why a device can 'transmit' lots of power but still have low efficiency into the mode, and why mode decomposition, not total flux, is the right measure.",
eq: String.raw`\[ a_m = \frac{1}{4}\int \left(\mathbf{E} \times \mathbf{H}_m^{*} + \mathbf{E}_m^{*} \times \mathbf{H}\right) \cdot \hat{\mathbf{x}}\, dA \]<div class="eqnote">with</div>\[ \frac{1}{2}\,\mathrm{Re}\int \mathbf{E}_m \times \mathbf{H}_m^{*} \cdot \hat{\mathbf{x}}\, dA = 1 \]\[ T_m = |a_m|^2 \]<div class="eqnote">scalar estimate</div>\[ \eta = \frac{\left|\int E\,\psi_m\right|^2}{\int |E|^2 \int |\psi_m|^2} \]`,
sym: [[String.raw`\(a_m\)`, "complex amplitude of mode m in the output field"], [String.raw`\(\mathbf{E}_m, \mathbf{H}_m\)`, "mode fields normalized to unit power"], [String.raw`\(T_m\)`, "power transmitted into mode m"], [String.raw`\(\eta\)`, "simplified overlap for one field component"]],
how: ["Guided modes of a waveguide are orthogonal under this cross-product integral.", "So the output field can be expanded in modes, and each coefficient is found by projecting onto that mode.", "With unit-power modes, |a_m|² is the power carried by mode m.", "Your Chapter 3 defines transmission this way, as power in the fundamental mode only (any other light counts as loss)."],
say: "Transmission is computed by projecting the output field onto the target mode with the mode orthogonality integral. Power in other modes or radiation does not count, so mode overlap and total flux can differ.",
num: "A Gaussian of the right width centred on the slab: overlap close to <b>100 %</b>. Offset by half the slab thickness: noticeably less (see the readout).",
r(fig, ctl) {
  ctl.innerHTML = sl("off", "Offset of the incoming beam (nm)", -200, 200, 1, 0) + sl("w", "Beam half-width (nm)", 30, 300, 1, 110) + '<div class="readout" id="ro"></div>';
  const zs = range(-500, 500, 801), N = C2.slabN(3.5, 1, 160, 800, 0, "TE"), psi = C2.slabProfile(3.5, 1, 160, 800, 0, "TE", N, zs).main;
  const u = () => {
    const off = +$("off").value, w = +$("w").value; $("offv").textContent = off + " nm"; $("wv").textContent = w + " nm";
    const E = zs.map(z => Math.exp(-Math.pow((z - off) / w, 2)));
    let a = 0, b = 0, c = 0; zs.forEach((z, i) => { a += E[i] * psi[i]; b += E[i] * E[i]; c += psi[i] * psi[i]; });
    const eta = a * a / (b * c);
    fig.innerHTML = svg(250, `<rect x="${60 + (420) / 1000 * 560}" y="30" width="${160 / 1000 * 560}" height="180" fill="var(--blue-bg)"/>${plot(60, 30, 560, 180, zs, psi, -500, 500, 0, 1.05, "#378ADD", 2.5)}${plot(60, 30, 560, 180, zs, E, -500, 500, 0, 1.05, "#D85A30", 2.5, "5 4")}<line x1="60" x2="620" y1="210" y2="210" stroke="var(--p)"/><text class="ts" x="340" y="232" text-anchor="middle">across the slab, −500 to 500 nm. Blue: TE0 mode. Coral dashed: incoming field</text>`);
    $("ro").innerHTML = `<div><span>overlap η</span><b>${(eta * 100).toFixed(1)} %</b></div><div><span>power elsewhere</span><b>${((1 - eta) * 100).toFixed(1)} %</b></div>`;
  };
  $("off").oninput = u; $("w").oninput = u; u();
}},

{s: "5. Convergence", t: "How do you know the grid is fine enough?",
intu: "No single run proves that a result is right. The standard check is to repeat the simulation at several resolutions and watch the result settle. For a second-order method like Yee, the error falls roughly as 1/N² once the grid is fine enough, so the curve flattens. Two resolutions in that regime even let you estimate the converged value by Richardson extrapolation. The curve here is an illustrative example of that behaviour, not a thesis result. Pick the two resolutions used for the estimate. This is the logic behind the rule in your Chapter 2: report every result with the resolution it was computed at.",
eq: String.raw`\[ Q(N) \approx Q_\infty + \frac{C}{N^2} \quad \text{(second order)} \]<div class="eqnote">Richardson</div>\[ Q_\infty \approx \frac{N_2^2\, Q(N_2) - N_1^2\, Q(N_1)}{N_2^2 - N_1^2} \]`,
sym: [[String.raw`\(Q(N)\)`, "result (for example a transmission) at N steps per wavelength"], [String.raw`\(Q_\infty\)`, "the result an infinitely fine grid would give"], [String.raw`\(C\)`, "unknown error constant"], [String.raw`\(N_1, N_2\)`, "two resolutions used for the estimate"]],
how: ["The phase error is ∝ (kΔx)², so smooth quantities have errors ∝ 1/N² (Lesson 10).", "Write Q(N) = Q_∞ + C/N² at two resolutions.", "Two equations, two unknowns: eliminate C to get Q_∞.", "If the extrapolation changes a lot when you swap in a third resolution, the grid is not yet in the 1/N² regime."],
say: "Convergence is shown by refining the grid until the result stops changing. For a second-order scheme the error falls as 1/N², and two fine resolutions give a Richardson estimate of the converged value.",
num: "Illustrative curve: Q(N) = 0.70 − 9/N². At N = 20: <b>0.6775</b>, at 30: <b>0.6900</b>. Richardson from 20 and 30: <b>0.7000</b>.",
r(fig, ctl) {
  ctl.innerHTML = sl("a", "Coarser resolution N₁", 8, 40, 1, 20) + sl("b", "Finer resolution N₂", 10, 60, 1, 30) + '<div class="readout" id="ro"></div>';
  const Q = N => 0.70 - 9 / (N * N);
  const u = () => {
    const a = +$("a").value, b = Math.max(+$("b").value, a + 1); $("av").textContent = a; $("bv").textContent = b;
    const Ns = range(8, 60, 100), est = (b * b * Q(b) - a * a * Q(a)) / (b * b - a * a);
    let pts = ""; [10, 15, 20, 30, 40, 50].forEach(n => pts += `<circle cx="${60 + (n - 8) / 52 * 560}" cy="${210 - (Q(n) - 0.55) / 0.17 * 170}" r="4" fill="#378ADD"/>`);
    fig.innerHTML = svg(250, `${plot(60, 40, 560, 170, Ns, Ns.map(Q), 8, 60, 0.55, 0.72, "#378ADD", 1.5, "4 4")}${pts}<line x1="60" x2="620" y1="${210 - (0.70 - 0.55) / 0.17 * 170}" y2="${210 - (0.70 - 0.55) / 0.17 * 170}" stroke="#1D9E75" stroke-dasharray="6 4"/><text class="ts" x="66" y="${204 - (0.70 - 0.55) / 0.17 * 170}">true converged value (illustrative)</text><circle cx="${60 + (a - 8) / 52 * 560}" cy="${210 - (Q(a) - 0.55) / 0.17 * 170}" r="7" fill="none" stroke="#EF9F27" stroke-width="2"/><circle cx="${60 + (b - 8) / 52 * 560}" cy="${210 - (Q(b) - 0.55) / 0.17 * 170}" r="7" fill="none" stroke="#EF9F27" stroke-width="2"/><line x1="60" x2="620" y1="210" y2="210" stroke="var(--p)"/><text class="ts" x="340" y="232" text-anchor="middle">steps per wavelength, 8 to 60. Illustrative result Q(N)</text>`);
    $("ro").innerHTML = `<div><span>Q(N₁)</span><b>${Q(a).toFixed(4)}</b></div><div><span>Q(N₂)</span><b>${Q(b).toFixed(4)}</b></div><div><span>Richardson Q∞</span><b>${est.toFixed(4)}</b></div>`;
  };
  $("a").oninput = u; $("b").oninput = u; u();
}},

{s: "6. The workflow", t: "One FDTD transmission simulation, start to finish",
intu: "Click through the steps of a typical device simulation. Each step uses something from Lessons 1 to 11. This is the order in which a simulation of a grating, taper or splitter is set up, and the questions to ask at each stage. It is also a good outline for explaining your methods chapter in a defense.",
eq: String.raw`\[ \text{geometry} \to \text{grid} \to \text{source} \to \text{symmetry} \to \text{boundaries} \]\[ \to \text{run} \to \text{monitors} \to \text{mode decomposition} \to \text{result + resolution} \]`,
sym: [["geometry", "ε(r) of the structure"], ["grid", "steps per wavelength in the highest index"], ["source", "mode source or Gaussian beam, with a pulse band"], ["symmetry", "PEC or PMC planes that match the launched mode"]],
how: ["Draw the structure and choose the domain with space around it.", "Pick a resolution (Lesson 10) and let the time step follow from Courant.", "Launch a mode or beam with a pulse covering the band, and add symmetry only if structure and source allow it.", "Absorb with PML, run until fields decay, record with frequency monitors, project onto the target mode, and repeat at a finer grid to check."],
say: "An FDTD transmission is obtained by launching a broadband source into a discretized structure surrounded by PML, recording Fourier-transformed fields at the output, and projecting them onto the target mode. Each result is reported with its grid resolution and checked by refinement.",
num: "Things that most often go wrong: wrong symmetry value (near-zero result), monitor too close to the structure (evanescent fields), run too short (ripples), grid too coarse for a long interference device (phase error).",
r(fig, ctl) {
  let k = 0;
  const S = [["Geometry", "Put ε(r) on the grid. Leave space between the structure and the PML so evanescent tails are not cut.", "L1 to L3"], ["Grid", "Choose steps per wavelength in the highest index. Cost grows as N⁴, phase error falls as 1/N².", "L9, L10"], ["Time step", "Set from the Courant limit, a fraction of Δx/(c√3) in 3D.", "L10"], ["Source", "Mode source for a waveguide input, Gaussian beam for a fiber. Pulse band covers the spectrum you need.", "L11 card 1"], ["Symmetry", "Use PEC or PMC planes only if structure and source are symmetric, and pick the value that keeps the launched mode.", "L4"], ["Boundaries", "PML on open sides, thick enough and graded.", "L11 card 2"], ["Run", "Leapfrog updates until the fields decay by the chosen factor.", "L8"], ["Monitors", "Running DFT of the fields at the output plane.", "L11 card 3"], ["Mode decomposition", "Project onto the target mode to get the transmission into it.", "L11 card 4"], ["Check", "Repeat at a finer grid, and once without symmetry, before trusting the number.", "L11 card 5"]];
  ctl.innerHTML = `<div class="row"><button id="wb">Back</button><button id="wn">Next</button></div>`;
  const u = () => {
    let s = ""; S.forEach(([t], i) => { const x = 20 + (i % 5) * 130, y = i < 5 ? 30 : 120; s += `<g class="${i === k ? "c-coral" : i < k ? "c-teal" : "c-gray"}"><rect x="${x}" y="${y}" width="118" height="52" rx="8" stroke-width="${i === k ? 1.6 : 0.6}"/></g><text class="th" x="${x + 59}" y="${y + 31}" text-anchor="middle" style="font-size:12px">${i + 1}. ${t}</text>`; if (i % 5 !== 4) s += `<line x1="${x + 119}" x2="${x + 129}" y1="${y + 26}" y2="${y + 26}" class="arr" marker-end="url(#ar)"/>`; });
    const t = S[k][1], cut = t.length > 90 ? t.lastIndexOf(" ", 90) : -1;
    fig.innerHTML = svg(260, `${s}<text class="th" x="340" y="200" text-anchor="middle">${S[k][0]} (${S[k][2]})</text><text class="ts" x="340" y="222" text-anchor="middle">${cut > 0 ? t.slice(0, cut) : t}</text><text class="ts" x="340" y="240" text-anchor="middle">${cut > 0 ? t.slice(cut + 1) : ""}</text>`);
    $("wb").disabled = k === 0; $("wn").disabled = k === S.length - 1;
  };
  $("wb").onclick = () => { k--; u(); }; $("wn").onclick = () => { k++; u(); }; u();
}},

{s: "7. Quiz", t: "Chapter 2 quiz: ten questions",
intu: "Ten questions covering all eleven lessons. Answer, read why, and say the reason out loud. Questions that go beyond these lessons belong to your own chapters, so check those separately.",
eq: "<div class=\"eqnote\">Lessons 1 to 11</div>",
sym: [["L1 to L3", "guiding, slab and strip modes"], ["L4", "symmetry"], ["L5 to L7", "grating, DBR, MMI"], ["L8 to L11", "FDTD"]],
how: ["Answer without looking.", "Explain the reason in one sentence.", "Reopen the lesson for any miss.", "Repeat before the defense."],
say: "When a question goes beyond your work, say so and answer from the physics you know.",
num: "Aim for 10 out of 10 with reasons.",
r(fig, ctl) {
  const Q = [
    ["Why does a TM-like mode have a lower effective index than a TE-like mode in a membrane?", ["Its field jumps by ε_core/ε_air outside, so more of it is in air", "It travels faster in GaAs", "It is not guided"], 0, "Normal D is continuous, so E_z jumps by about 12 and the field sits outside (Lesson 2)."],
    ["Which Tidy3D symmetry value at z = 0 keeps the TE-like modes?", ["+1 (PMC)", "−1 (PEC)", "0"], 0, "TE-like modes are even, with tangential E nonzero at the mid-plane (Lesson 4)."],
    ["At y = 0, TE0 needs which value?", ["+1", "−1"], 1, "Its tangential components there, E_x and E_z, vanish on the axis (Lesson 4)."],
    ["The first-order grating period for vertical emission is…", ["λ₀/N", "λ₀/(2N)", "λ₀ N"], 0, "From phase matching with θ = 0 (Lesson 5)."],
    ["Why avoid exactly vertical grating emission?", ["The second order reflects into the backward mode", "It needs a longer grating", "TM cannot couple"], 0, "β − 2K = −β at θ = 0 (Lesson 5)."],
    ["Why does a GaAs/AlGaAs DBR need many pairs?", ["The index ratio is small", "The layers absorb", "The stopband is too wide"], 0, "R depends on (n_H/n_L)^(2N) (Lesson 6)."],
    ["In two-mode interference, how often does the light cross the section?", ["Once every beat length L_π", "Once every 3L_π", "Never"], 0, "The odd mode flips sign every L_π (Lesson 7)."],
    ["Where are E components in the Yee cell?", ["Edge centres", "Face centres", "Cell corners"], 0, "H is on face centres (Lesson 9)."],
    ["What happens above the Courant limit?", ["The shortest grid waves grow exponentially", "Results get slightly less accurate", "The run is faster"], 0, "Growth factor above 1 (Lesson 10)."],
    ["At 20 steps per wavelength, the phase error bound along an axis is about…", ["0.4 %", "4 %", "0.04 %"], 0, "(2π/20)²/24 ≈ 0.0041 (Lesson 10)."]
  ];
  let i = 0, score = 0, done = false;
  const u = () => {
    if (i >= Q.length) { fig.innerHTML = svg(140, `<text class="th" x="340" y="64" text-anchor="middle" style="font-size:28px">${score} / ${Q.length}</text><text class="ts" x="340" y="96" text-anchor="middle">${score === Q.length ? "Full marks. Now explain each one out loud." : "Reopen the lessons for the ones you missed."}</text>`); ctl.innerHTML = `<div class="row"><button id="qr">Start again</button></div>`; $("qr").onclick = () => { i = 0; score = 0; u(); }; return; }
    const [q, o, c, why] = Q[i]; done = false;
    fig.innerHTML = svg(70, `<text class="ts" x="20" y="28">question ${i + 1} of ${Q.length}</text><rect x="20" y="40" width="640" height="8" rx="4" fill="var(--b)"/><rect x="20" y="40" width="${640 * i / Q.length}" height="8" rx="4" fill="#1D9E75"/><text class="ts" x="660" y="28" text-anchor="end">score ${score}</text>`);
    ctl.innerHTML = `<div class="quiz"><p style="font-weight:600">${q}</p><div class="opts">${o.map((t, j) => `<button data-a="${j}">${t}</button>`).join("")}</div><div class="fb" id="qfb"></div><div class="row"><button id="qn" disabled>Next question</button></div></div>`;
    ctl.querySelectorAll("button[data-a]").forEach(b => b.onclick = () => { if (done) return; done = true; const ok = +b.dataset.a === c; if (ok) score++; b.classList.add("on"); $("qfb").innerHTML = `<span class="${ok ? "good" : "badc"}">${ok ? "Correct." : "Not quite."}</span> ${why}`; $("qn").disabled = false; });
    $("qn").onclick = () => { i++; u(); };
  };
  u();
}}
],
summary: "A Gaussian pulse source covers a band set by its spectral width, with τσ_f = 1/(2π). A perfectly matched layer absorbs outgoing waves with almost no reflection because its losses are matched and graded. Frequency monitors build spectra from a running Fourier sum, valid only once the fields have decayed. Transmission into a mode comes from projecting the output field onto that mode with the orthogonality integral, so power in other modes counts as loss. A result is trusted only after refining the grid, where for the Yee scheme the error falls as 1/N², and it is reported together with its resolution.",
sheet: [
[String.raw`\[ \tau\sigma_f = \frac{1}{2\pi} \]`, "Pulse length and bandwidth"],
[String.raw`\[ \frac{\sigma_e}{\varepsilon} = \frac{\sigma_m}{\mu}, \qquad \sigma(d) = \sigma_{\mathrm{max}}\left(\frac{d}{L}\right)^m \]`, "Matched, graded PML"],
[String.raw`\[ \tilde{E}(f) = \sum_n E^{\,n}\, e^{i2\pi f n\Delta t}\, \Delta t \]`, "Running DFT monitor"],
[String.raw`\[ a_m = \frac{1}{4}\int\left(\mathbf{E} \times \mathbf{H}_m^{*} + \mathbf{E}_m^{*} \times \mathbf{H}\right)\cdot\hat{\mathbf{x}}\, dA, \qquad T_m = |a_m|^2 \]`, "Mode decomposition"],
[String.raw`\[ Q_\infty \approx \frac{N_2^2 Q_2 - N_1^2 Q_1}{N_2^2 - N_1^2} \]`, "Richardson extrapolation"]],
consts: "1D simulations in normalized units. The convergence curve is illustrative.",
sources: ["Oskooi et al., Comput. Phys. Commun. 181, 687 (2010), Sec. 4.2 (PML) and sources, flux and Fourier-transformed output in MEEP", "Tidy3D documentation (GaussianPulse fwidth, mode monitors and symmetry)", "Snyder and Love, Optical Waveguide Theory, Chapman and Hall (1983) (mode orthogonality)"]
});

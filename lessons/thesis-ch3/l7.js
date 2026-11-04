/* Step-through controls: Back, Play or Pause, Next, a step counter and a caption per step.
   draw(k, t) draws step k at time t (seconds). o.cont redraws every frame, o.loop restarts. */
const C3L7_steps = (fig, ctl, caps, draw, o) => {
  o = o || {}; const n = caps.length; let k = o.start || 0, play = !!o.play, tk = 0, tNow = 0, last = -1;
  ctl.insertAdjacentHTML("beforeend", `<div class="row"><button data-sb="b">Back</button><button data-sb="p">Play</button><button data-sb="n">Next step</button><span data-sb="s" style="font-size:13px;color:var(--muted);margin-left:6px"></span></div><p data-sb="c" style="font-size:14.5px;line-height:1.5;color:var(--fg);min-height:46px;margin:2px 0 8px"></p>`);
  const q = a => ctl.querySelector(`[data-sb="${a}"]`);
  const show = () => { q("s").textContent = `step ${k + 1} of ${n}`; q("c").textContent = caps[k]; q("b").disabled = k === 0; q("n").disabled = k === n - 1; q("p").textContent = play ? "Pause" : "Play"; };
  const redraw = () => { draw(k, tNow); last = k; show(); };
  q("b").onclick = () => { k = Math.max(0, k - 1); tk = tNow; play = false; redraw(); };
  q("n").onclick = () => { k = Math.min(n - 1, k + 1); tk = tNow; play = false; redraw(); };
  q("p").onclick = () => { play = !play; if (play && k === n - 1) k = 0; tk = tNow; redraw(); };
  anim(t => {
    if (!fig.isConnected) { stopAnim(); return; }
    tNow = t;
    let ch = false;
    if (play && t - tk > (o.dwell || 2.8)) { tk = t; ch = true; if (k < n - 1) k++; else if (o.loop) k = 0; else play = false; }
    if (o.cont || ch || k !== last) redraw();
  });
  return { redraw, get k() { return k; } };
};
addLesson("thesis", "ch3", {
level: "Core",
id: "thesis-ch3-l7", title: "Objective functions: mode overlap, band weights and the splitter FOM", short: "7. Objective functions",
big: String.raw`Every figure of merit in the thesis is built from one quantity: the power carried by one guided mode through a monitor plane. The simulated field on the plane is projected onto the mode computed by the mode solver, which gives a complex amplitude \(a_m\). Tidy3D normalizes each mode to unit power, and the mode sources and Gaussian beams are normalized to inject 1 W at each frequency, so \(T_m = |a_m|^2\) is the fraction of the injected power carried by that mode. Power in other modes or radiated does not count. For a grating coupler the coupling efficiency CE is \(|a_m|^2\) for the fundamental mode of the access waveguide, traveling from the grating toward the waveguide. Optimizing at a single wavelength tends to produce narrow resonances, so the objectives of the gratings and the PBS are averaged over a band with normalized Gaussian weights centered at 795 nm, while the tapers are optimized at 795 nm only. The PBS adds two such averages, TE into the TE port and TM into the TM port, so its maximum is 2.`,
bridge: String.raw`This is Ch. 3 Sec. 3.4, Eqs. (3.12) to (3.14). The overlap formula is the one in Tidy3D's mode data (components/data/utils.py, <code>_dot_numpy</code>). The mode profiles below come from the slab solver of Chapter 2, Lesson 3. The extinction ratio and insertion loss of Sec. 3.7, Eq. (3.18), are in Lesson 14, and the curvature penalty of the taper objective in Lesson 10.`,
cards: [
/* from old ch3 L4 card 1 */
{s: "1. Mode overlap", t: "How much of the field is in the target mode",
intu: String.raw`The field arriving at the output plane is generally not a clean mode. It may be shifted, too wide or too narrow. The overlap integral measures how much of it looks like the mode. Tidy3D normalizes each mode to unit power, and the mode sources and Gaussian beams are normalized to inject 1 W at each frequency, so \(T_m = |a_m|^2\) is the fraction of the injected power carried by mode \(m\). In the scalar picture, for fields traveling the same way in the same waveguide, Eq. (3.12) reduces to the normalized overlap of the two profiles. Here the target mode is the TE0 mode of a 2D guide (blue), and a Gaussian field (orange) arrives. Move and resize the field and watch the coupled fraction.`,
eq: String.raw`\[ a_m = \frac14 \int_S \big(\mathbf{E}_m^{*}\times\mathbf{H} + \mathbf{E}\times\mathbf{H}_m^{*}\big)\cdot\hat{\mathbf{n}}\,dS \]<div class="eqnote">modes normalized to unit power, sources to 1 W at each frequency:</div>\[ T_m = |a_m|^2 \]<div class="eqnote">scalar picture:</div>\[ T = \frac{\left| \int E\, m\, dy \right|^2}{\int |E|^2\, dy \int |m|^2\, dy} \]<div class="eqref">Ch. 3 Eq. (3.12)</div>`,
sym: [[String.raw`\(\mathbf{E}, \mathbf{H}\)`, String.raw`simulated fields on the monitor plane \(S\)`], [String.raw`\(\mathbf{E}_m, \mathbf{H}_m\)`, String.raw`fields of mode \(m\) from the mode solver at that plane, normalized to unit power`], [String.raw`\(\hat{\mathbf{n}}\)`, "normal of the plane"], [String.raw`\(T_m\)`, String.raw`fraction of the injected power in mode \(m\), since the source injects 1 W at each frequency`]],
how: ["Guided modes of a waveguide are orthogonal under this integral.", String.raw`So the field on the plane can be expanded in modes, and \(a_m\) picks out one coefficient.`, String.raw`With unit-power normalization, \(|a_m|^2\) is directly a power fraction.`, String.raw`In the scalar picture, \(\mathbf{H}\) follows from \(\mathbf{E}\) through the same impedance for both, and the integral becomes the profile overlap.`],
say: "The transmission into a mode is the squared magnitude of the overlap of the simulated field with that mode, normalized so that it is a fraction of the input power.",
num: String.raw`A centered Gaussian of 180 nm \(1/e\) width reaches 0.996 here. The mode's own \(1/e\) half-width is about 190 nm, and a shift of half that, about 95 nm, already costs about a quarter of the power.`,
r(fig, ctl) {
  ctl.innerHTML = sl("d", "Field offset (nm)", -400, 400, 5, 120) + sl("w", "Field 1/e width (nm)", 60, 600, 5, 180) + '<div class="readout" id="ro"></div>';
  const ys = range(-900, 900, 721), N = C2.slabN(3.0, 1.0, 400, 800, 0, "TE"), m = C2.slabProfile(3.0, 1.0, 400, 800, 0, "TE", N, ys).main;
  const u = () => {
    const d = +$("d").value, w = +$("w").value; $("dv").textContent = d; $("wv").textContent = w;
    const E = ys.map(y => Math.exp(-Math.pow((y - d) / w, 2)));
    let a = 0, b = 0, c = 0; ys.forEach((_, i) => { a += E[i] * m[i]; b += E[i] * E[i]; c += m[i] * m[i]; });
    const T = a * a / (b * c), X = C3.X(70, 560, -900, 900);
    let s = `<rect x="${X(-200)}" y="30" width="${X(200) - X(-200)}" height="170" fill="var(--blue-bg)" opacity="0.6"/><text class="ts" x="${X(0)}" y="46" text-anchor="middle">core, 400 nm</text>`;
    s += C3.frame(70, 30, 560, 170, -900, 900, 0, 1.05, [-800, -400, 0, 400, 800], [0, 0.5, 1], "position across the guide (nm)", "field") + plot(70, 30, 560, 170, ys, m, -900, 900, 0, 1.05, "#378ADD", 2.5) + plot(70, 30, 560, 170, ys, E, -900, 900, 0, 1.05, "#D85A30", 2.5);
    s += C3.legend(90, 250, [["target mode TE0", "#378ADD"], ["arriving field", "#D85A30"]]);
    fig.innerHTML = svg(260, s);
    $("ro").innerHTML = `<div><span>T into the mode</span><b>${T.toFixed(3)}</b></div><div><span>lost to other modes and radiation</span><b>${(1 - T).toFixed(3)}</b></div><div><span>effective index n<sub>eff</sub></span><b>${N.toFixed(3)}</b></div>`;
  };
  $("d").oninput = u; $("w").oninput = u; u();
}},

/* from old ch3 L4 card 2 */
{s: "2. Only the target mode", t: "Power in the wrong mode counts as loss",
intu: String.raw`A wider guide carries two modes, TE0 (even) and TE1 (odd). Suppose the arriving field is a mix of the two with all of the power guided. The total transmitted power is 1, yet the figure of merit only counts the TE0 part, \(\cos^2\theta\). This is intended: in a circuit, light in the wrong mode is lost at the next single-mode section. Change the mixing angle.`,
eq: String.raw`\[ E = \cos\theta \cdot \mathrm{TE0} + \sin\theta \cdot \mathrm{TE1} \]\[ \Longrightarrow\quad T_{\mathrm{TE0}} = \cos^2\theta, \qquad T_{\mathrm{TE1}} = \sin^2\theta, \qquad T_{\mathrm{TE0}} + T_{\mathrm{TE1}} = 1 \]`,
sym: [[String.raw`\(\theta\)`, "mixing angle between the two modes"], ["TE0, TE1", "even and odd modes, orthogonal so their powers add"], [String.raw`\(T_{\mathrm{TE0}}\)`, "what the figure of merit sees"]],
how: ["The modes are orthogonal, so the overlap of TE1 with TE0 is zero.", String.raw`Projecting \(\mathbf{E}\) onto TE0 keeps only the \(\cos\theta\) part.`, String.raw`Its power is \(\cos^2\theta\).`, "A flux monitor would report 1 here, which is why the thesis uses mode monitors for the figure of merit."],
say: "Projecting onto the target mode means that power carried by any other mode counts as loss, even though it is still guided.",
num: String.raw`At \(\theta = 45^\circ\) the guided power is 100 % but only half is in TE0, a 3 dB loss for the figure of merit.`,
r(fig, ctl) {
  ctl.innerHTML = sl("t", "Mixing angle θ (°)", 0, 90, 1, 30) + '<div class="readout" id="ro"></div>';
  const ys = range(-900, 900, 721), n0 = C2.slabN(3.0, 1.0, 700, 800, 0, "TE"), n1 = C2.slabN(3.0, 1.0, 700, 800, 1, "TE");
  const m0 = C2.slabProfile(3.0, 1.0, 700, 800, 0, "TE", n0, ys).main, m1 = C2.slabProfile(3.0, 1.0, 700, 800, 1, "TE", n1, ys).main;
  const nrm = a => { const s = Math.sqrt(a.reduce((x, v) => x + v * v, 0)); return a.map(v => v / s); }, M0 = nrm(m0), M1 = nrm(m1);
  const u = () => {
    const th = +$("t").value * Math.PI / 180; $("tv").textContent = $("t").value;
    const E = M0.map((v, i) => Math.cos(th) * v + Math.sin(th) * M1[i]), mx = Math.max(...M0, ...M1.map(Math.abs), ...E.map(Math.abs));
    const X = C3.X(70, 560, -900, 900); let s = `<rect x="${X(-350)}" y="20" width="${X(350) - X(-350)}" height="170" fill="var(--blue-bg)" opacity="0.6"/>`;
    s += C3.frame(70, 20, 560, 170, -900, 900, -mx, mx, [-800, -400, 0, 400, 800], [], "position across the guide (nm)", "field") + `<line x1="70" x2="630" y1="105" y2="105" stroke="var(--b)"/>`;
    s += plot(70, 20, 560, 170, ys, M0, -900, 900, -mx, mx, "#378ADD", 1.5, "5 4") + plot(70, 20, 560, 170, ys, M1, -900, 900, -mx, mx, "#7F77DD", 1.5, "5 4") + plot(70, 20, 560, 170, ys, E, -900, 900, -mx, mx, "#D85A30", 2.5);
    s += C3.legend(80, 245, [["TE0", "#378ADD", "5 4"], ["TE1", "#7F77DD", "5 4"], ["arriving field", "#D85A30"]]);
    const T0 = Math.cos(th) ** 2;
    s += `<rect x="470" y="230" width="${150 * T0}" height="12" fill="#378ADD"/><rect x="${470 + 150 * T0}" y="230" width="${150 * (1 - T0)}" height="12" fill="#7F77DD"/>`;
    fig.innerHTML = svg(255, s);
    $("ro").innerHTML = `<div><span>T into TE0 (counted)</span><b>${T0.toFixed(3)}</b></div><div><span>T into TE1 (lost)</span><b>${(1 - T0).toFixed(3)}</b></div><div><span>total guided power</span><b>1.000</b></div>`;
  };
  $("t").oninput = u; u();
}},

/* from old ch3 L4 card 3, now with the three thesis bands */
{s: "3. Band weights", t: "Gaussian weights over a band of wavelengths",
intu: String.raw`Optimizing at a single wavelength tends to produce narrow resonances, so the objectives of the gratings and the PBS are averaged over a band. The weights are a Gaussian centered at \(\lambda_0 = 795\) nm, normalized so they sum to one, so the result is still a number between 0 and 1. The width \(\sigma\), in nm, sets how much the edges of the band matter. Pick a device to load its band from Sec. 3.4, then change \(\sigma\) or the number of wavelengths. Note that the PBS band, 735 to 835 nm, is not centered on 795 nm, but with \(\sigma = 8\) nm the weights at both edges are negligible anyway.`,
eq: String.raw`\[ \bar T = \sum_i w_i\, T(\lambda_i), \qquad w_i = \frac{\exp\!\big[-(\lambda_i-\lambda_0)^2/(2\sigma^2)\big]}{\sum_j \exp\!\big[-(\lambda_j-\lambda_0)^2/(2\sigma^2)\big]} \]<div class="eqref">Ch. 3 Eq. (3.13)</div>`,
sym: [[String.raw`\(\lambda_i\)`, "sampled wavelengths"], [String.raw`\(\lambda_0\)`, "center wavelength, 795 nm for the quantum dots of the thesis"], [String.raw`\(\sigma\)`, "standard deviation of the Gaussian, in nm"], [String.raw`\(w_i\)`, String.raw`normalized weights, \(\sum w_i = 1\)`], [String.raw`\(\bar T\)`, "band-averaged transmission, between 0 and 1"]],
how: ["Choose the band and sample it.", String.raw`Give each sample a Gaussian weight around \(\lambda_0\).`, String.raw`Normalize so the weights sum to one: \(\bar{T}\) is a weighted mean, so it cannot exceed 1.`, String.raw`The full width at half maximum of the weights is \(2\sqrt{2\ln 2}\,\sigma = 2.355\sigma\).`],
say: "The broadband objective is a weighted mean of the transmission, with Gaussian weights centered at 795 nm that sum to one.",
num: String.raw`PBS: 101 wavelengths from 735 to 835 nm, \(\sigma = 8\) nm, full width at half maximum 18.8 nm. Gratings: 101 wavelengths from 745 to 845 nm, \(\sigma = 8.5\) nm, 20.0 nm. Tapers: 795 nm only.`,
note: String.raw`Some codes write the Gaussian as \(\exp[-((\lambda - \lambda_0)/\sigma_c)^2]\). Matching the exponents gives \(\sigma = \sigma_c/\sqrt{2}\), so do not mix the two widths when comparing papers. The thesis quotes \(\sigma\) in the form of Eq. (3.13).`,
r(fig, ctl) {
  let dev = "pbs"; const B = { pbs: [735, 835, 8], gc: [745, 845, 8.5], tp: [795, 795, 8] };
  ctl.innerHTML = btns([["pbs", "PBS"], ["gc", "Gratings"], ["tp", "Tapers"]], "d") + sl("s", "σ (nm)", 3, 40, 0.5, 8) + sl("n", "Number of wavelengths", 5, 101, 2, 101) + '<div class="readout" id="ro"></div>';
  const u = () => {
    pick(ctl, "d", dev);
    const sg = +$("s").value, n = dev === "tp" ? 1 : +$("n").value, [lo, hi] = B[dev]; $("sv").textContent = sg; $("nv").textContent = n;
    const ls = n === 1 ? [795] : range(lo, hi, n), w0 = ls.map(l => Math.exp(-Math.pow(l - 795, 2) / (2 * sg * sg))), S = w0.reduce((a, b) => a + b, 0), w = w0.map(v => v / S), mx = Math.max(...w);
    const X = C3.X(70, 560, 725, 855), Y = C3.Y(30, 180, 0, mx * 1.1), bw = n === 1 ? 6 : Math.max(1.5, (X(hi) - X(lo)) / n * 0.7);
    let s = C3.frame(70, 30, 560, 180, 725, 855, 0, mx * 1.1, [735, 745, 795, 835, 845], [0, mx], "wavelength (nm)", "weight wᵢ", v => v, v => v.toFixed(3));
    s += `<rect x="${X(lo)}" y="30" width="${Math.max(2, X(hi) - X(lo))}" height="180" fill="var(--blue-bg)" opacity="0.45"/>`;
    ls.forEach((l, i) => s += `<rect x="${X(l) - bw / 2}" y="${Y(w[i])}" width="${bw}" height="${210 - Y(w[i])}" fill="#378ADD" opacity="0.85"/>`);
    if (n > 1) s += `<line x1="${X(795 - 1.1774 * sg)}" x2="${X(795 + 1.1774 * sg)}" y1="${Y(mx / 2)}" y2="${Y(mx / 2)}" stroke="#D85A30" stroke-width="2" marker-start="url(#ar)" marker-end="url(#ar)"/><text class="ts" x="${X(795 + 1.2 * sg) + 8}" y="${Y(mx / 2) + 4}">FWHM ${(2.355 * sg).toFixed(1)} nm</text>`;
    s += `<line x1="${X(795)}" x2="${X(795)}" y1="30" y2="210" stroke="#EF9F27" stroke-dasharray="4 3"/><text class="ts" x="${X(795) + 4}" y="44">λ₀ = 795 nm</text><text class="ts" x="350" y="262" text-anchor="middle">shaded: the sampled band, ${dev === "tp" ? "a single wavelength" : `${n} wavelengths from ${lo} to ${hi} nm`}</text>`;
    fig.innerHTML = svg(270, s);
    $("ro").innerHTML = `<div><span>Σ wᵢ</span><b>${w.reduce((a, b) => a + b, 0).toFixed(3)}</b></div><div><span>weight at 795 nm</span><b>${mx.toFixed(4)}</b></div><div><span>weight at the band edges</span><b>${n === 1 ? "none" : (w[0] / mx).toExponential(1) + " and " + (w[n - 1] / mx).toExponential(1) + " of peak"}</b></div>`;
  };
  ctl.querySelectorAll("button[data-d]").forEach(b => b.onclick = () => { dev = b.dataset.d; $("s").value = B[dev][2]; $("n").value = 101; u(); });
  $("s").oninput = u; $("n").oninput = u; u();
}},

/* from old ch3 L4 card 4 */
{s: "4. Why a band", t: "A narrow resonance wins at one wavelength and loses over a band",
intu: String.raw`Two imagined designs. Design A has a sharp resonance that reaches 1.0 exactly at \(\lambda_0\). Design B is flat and broad but only reaches 0.85. A single-wavelength objective prefers A. The band-weighted objective prefers B once \(\sigma\) is a few nanometers, because the resonance is gone a few nanometers away. Quantum dot emission wavelengths differ from dot to dot and fabrication shifts the response, so B is the useful device. Change \(\sigma\).`,
eq: String.raw`\[ \bar{T}_A = \sum w_i\, T_A(\lambda_i) \quad \text{versus} \quad \bar{T}_B = \sum w_i\, T_B(\lambda_i) \]`,
sym: [[String.raw`\(T_A\)`, "narrow Lorentzian resonance, peak 1.0, 4 nm wide (illustration)"], [String.raw`\(T_B\)`, "broad response, peak 0.85, 80 nm wide (illustration)"], [String.raw`\(\sigma\)`, "width of the weights"]],
how: [String.raw`At \(\sigma \to 0\) the average equals the value at \(\lambda_0\): A wins.`, String.raw`As \(\sigma\) grows, A's average falls quickly because most weight sits outside its peak.`, "B's average hardly changes.", "So band weighting steers the optimizer away from fragile resonances."],
say: "Averaging over a band with Gaussian weights steers the optimizer away from narrow resonances toward broadband designs.",
num: "Ch. 3 states the motivation directly: optimizing at a single wavelength tends to produce narrow resonances.",
r(fig, ctl) {
  ctl.innerHTML = sl("s", "σ (nm)", 0.5, 40, 0.5, 8) + '<div class="readout" id="ro"></div>';
  const ls = range(735, 855, 241), TA = l => 1 / (1 + Math.pow((l - 795) / 2, 2)), TB = l => 0.85 * Math.exp(-Math.pow((l - 795) / 48, 2));
  const u = () => {
    const sg = +$("s").value; $("sv").textContent = sg;
    const w0 = ls.map(l => Math.exp(-Math.pow(l - 795, 2) / (2 * sg * sg))), S = w0.reduce((a, b) => a + b, 0), w = w0.map(v => v / S);
    let A = 0, B = 0; ls.forEach((l, i) => { A += w[i] * TA(l); B += w[i] * TB(l); });
    const mw = Math.max(...w0);
    let s = C3.frame(70, 30, 560, 180, 735, 855, 0, 1.05, [735, 765, 795, 825, 855], [0, 0.5, 1], "wavelength (nm)", "T") + plot(70, 30, 560, 180, ls, w0.map(v => v / mw), 735, 855, 0, 1.05, "#EF9F27", 1.5, "4 3");
    s += plot(70, 30, 560, 180, ls, ls.map(TA), 735, 855, 0, 1.05, "#D85A30", 2.5) + plot(70, 30, 560, 180, ls, ls.map(TB), 735, 855, 0, 1.05, "#378ADD", 2.5);
    s += C3.legend(80, 250, [["design A, resonance", "#D85A30"], ["design B, broad", "#378ADD"], ["weights (scaled)", "#EF9F27", "4 3"]]);
    fig.innerHTML = svg(260, s);
    $("ro").innerHTML = `<div><span>T̄ of A</span><b>${A.toFixed(3)}</b></div><div><span>T̄ of B</span><b>${B.toFixed(3)}</b></div><div><span>preferred</span><b>${A > B ? "A" : "B"}</b></div>`;
  };
  $("s").oninput = u; u();
}},

/* NEW: the three device objectives of Sec. 3.4, step by step */
{s: "5. Device objectives", t: "Grating, taper and PBS objectives, step by step",
intu: String.raw`Every objective of the thesis is built from the mode overlap of card 1, with sources normalized to 1 W. For a grating coupler the source is a Gaussian beam that represents the fiber, and the coupling efficiency CE is \(|a_m|^2\) for the fundamental mode of the access waveguide, traveling from the grating toward the waveguide. The grating objective is CE averaged with the band weights. For a taper the objective is the transmission into the fundamental mode at its wide end, at 795 nm only, minus a curvature penalty that keeps the outline smooth enough to fabricate. For the PBS, \(\mathrm{TE}_0\) must leave through the TE port and \(\mathrm{TM}_0\) through the TM port, so the figure of merit adds two weighted transmissions, and each evaluation needs forward and adjoint simulations for both input polarizations. Step through the three devices.`,
eq: String.raw`\[ \text{grating:}\quad J = \sum_i w_i\, \mathrm{CE}(\lambda_i), \qquad \mathrm{CE} = |a_m|^2 \]\[ \text{taper:}\quad J = T(795\ \mathrm{nm}) - w_\kappa P_\kappa \]\[ \text{PBS:}\quad \mathrm{FOM} = \sum_i w_i\, T_{\mathrm{TE}\to\mathrm{TE\,port}}(\lambda_i) + \sum_i w_i\, T_{\mathrm{TM}\to\mathrm{TM\,port}}(\lambda_i) \]<div class="eqref">Ch. 3 Sec. 3.4, Eqs. (3.12) to (3.14), curvature penalty Eq. (3.16)</div>`,
sym: [[String.raw`\(\mathrm{CE}\)`, "coupling efficiency: power in the fundamental mode of the access waveguide, going toward the waveguide, per watt of the fiber beam"], [String.raw`\(a_m\)`, "mode amplitude from the overlap of card 1"], [String.raw`\(w_i\)`, "band weights of card 3"], [String.raw`\(w_\kappa P_\kappa\)`, "weighted curvature penalty of the taper outline (Lesson 10)"], [String.raw`\(T_{\mathrm{TE}\to\mathrm{TE\,port}}\)`, String.raw`\(\mathrm{TE}_0\) input reaching the TE port in its fundamental mode`]],
how: ["Grating: a 1 W Gaussian beam stands for the fiber, the mode monitor sits in the access waveguide, and only the mode traveling away from the grating counts.", "Grating objective: CE averaged over 101 wavelengths from 745 to 845 nm with σ = 8.5 nm.", "Taper: a 1 W mode source in the narrow waveguide, a mode monitor at the wide end, one wavelength.", "Taper objective: the transmission minus the curvature penalty, so the optimum stays smooth enough to fabricate.", "PBS: two inputs, so two forward and two adjoint simulations per evaluation, and the sum of the two weighted transmissions, at most 2."],
say: "Each objective is a band-weighted mode transmission: the coupling efficiency for the gratings, the transmission minus a curvature penalty for the tapers, and the sum of the TE and TM transmissions for the PBS.",
num: "Simulations per evaluation: grating 2 (one forward, one adjoint), taper 2, PBS 4. The drawings are schematics, not to scale.",
r(fig, ctl) {
  const caps = ["Grating. The source is a Gaussian beam that represents the fiber, normalized to inject 1 W at each frequency.",
    "The mode monitor in the access waveguide projects the field onto the fundamental mode traveling from the grating toward the waveguide. CE = |a_m|². Light going the other way does not count.",
    "Grating objective: CE averaged with Gaussian weights over 101 wavelengths from 745 to 845 nm, σ = 8.5 nm, centered at 795 nm.",
    "Taper. A mode source launches the fundamental mode in the 200 nm waveguide. The monitor at the 1.9 µm end gives T = |a_m|², at 795 nm only.",
    "Taper objective: T minus the weighted curvature penalty, so the outline cannot win by growing sharp corners.",
    "PBS. TE₀ input must leave through the TE port, TM₀ input through the TM port. Each sum is at most 1, so the FOM is at most 2.",
    "Each PBS evaluation needs a forward and an adjoint simulation for each input polarization: four simulations per step."];
  C3L7_steps(fig, ctl, caps, (k, t) => {
    const dash = (-t * 40).toFixed(1); let s = "";
    if (k <= 2) {
      const gy = 120;
      s += `<text class="ts" x="20" y="18">grating coupler, side view</text><rect x="40" y="${gy}" width="190" height="20" fill="var(--blue-bg)" stroke="var(--blue)"/>`;
      for (let i = 0; i < 9; i++) s += `<rect x="${250 + i * 40}" y="${gy}" width="24" height="20" fill="var(--blue-bg)" stroke="var(--blue)"/>`;
      s += `<g transform="rotate(5 420 40)"><rect x="380" y="20" width="80" height="40" fill="#EEE6D3" stroke="var(--t)" stroke-width="0.6"/></g><text class="ts" x="470" y="40">fiber</text>`;
      s += `<path d="M395 64 L380 ${gy - 4} M445 64 L430 ${gy - 4}" stroke="#378ADD" stroke-width="1.5" stroke-dasharray="6 4" stroke-dashoffset="${dash}"/><text class="ts" x="${k === 0 ? 470 : 470}" y="88" fill="#378ADD">Gaussian beam, 1 W</text>`;
      s += `<line x1="100" x2="100" y1="${gy - 26}" y2="${gy + 46}" stroke="#EF9F27" stroke-width="3"/><text class="ts" x="100" y="${gy - 32}" text-anchor="middle">mode monitor</text>`;
      if (k >= 1) s += `<line x1="240" x2="110" y1="${gy + 10}" y2="${gy + 10}" stroke="#1D9E75" stroke-width="3" stroke-dasharray="8 5" stroke-dashoffset="${(t * 40).toFixed(1)}"/>` + arrow(160, gy + 60, 60, gy + 60, "#1D9E75", 2.5) + `<text class="ts" x="110" y="${gy + 78}" text-anchor="middle" fill="#1D9E75">counted: toward the waveguide</text>` + arrow(560, gy + 60, 650, gy + 60, "var(--b)", 1.5) + `<text class="ts" x="605" y="${gy + 78}" text-anchor="middle">not counted</text>`;
      if (k === 2) {
        const X = C3.X(250, 380, 745, 845), Y = C3.Y(222, 50, 0, 1), ls = range(745, 845, 101), w = ls.map(l => Math.exp(-((l - 795) ** 2) / (2 * 8.5 * 8.5)));
        s += `<line x1="250" x2="630" y1="272" y2="272" stroke="var(--b)"/>` + plot(250, 222, 380, 50, ls, w, 745, 845, 0, 1, "#EF9F27", 2) + `<text class="ts" x="250" y="288">745</text><text class="ts" x="${X(795)}" y="288" text-anchor="middle">795 nm</text><text class="ts" x="630" y="288" text-anchor="end">845</text><text class="ts" x="240" y="250" text-anchor="end">J = Σ wᵢ CE(λᵢ)</text>`;
      }
    } else if (k <= 4) {
      const cy = 120, x0 = 170, L = 340;
      s += `<text class="ts" x="20" y="18">taper, top view</text><rect x="30" y="${cy - 5}" width="${x0 - 30}" height="10" fill="var(--blue-bg)" stroke="var(--blue)"/><rect x="${x0 + L}" y="${cy - 48}" width="${650 - x0 - L}" height="96" fill="var(--blue-bg)" stroke="var(--blue)"/>`;
      const wob = k === 4 ? (x => 3 * Math.sin(x / 9)) : (() => 0);
      let top = "", bot = ""; for (let i = 0; i <= 80; i++) { const x = x0 + L * i / 80, h = 5 + 43 * i / 80 + wob(x); top += `${i ? "L" : "M"}${x.toFixed(1)} ${(cy - h).toFixed(1)}`; bot = `L${x.toFixed(1)} ${(cy + h).toFixed(1)}` + bot; }
      s += `<path d="${top}${bot.replace(/^L/, "L")}Z" fill="var(--blue-bg)" stroke="var(--blue)" stroke-width="1.5"/>`;
      s += `<line x1="70" x2="70" y1="${cy - 30}" y2="${cy + 30}" stroke="#378ADD" stroke-width="3"/><text class="ts" x="70" y="${cy - 36}" text-anchor="middle">mode source, 1 W</text><line x1="600" x2="600" y1="${cy - 62}" y2="${cy + 62}" stroke="#EF9F27" stroke-width="3"/><text class="ts" x="600" y="${cy - 68}" text-anchor="middle">mode monitor</text>`;
      s += `<line x1="80" x2="590" y1="${cy}" y2="${cy}" stroke="#378ADD" stroke-width="2" stroke-dasharray="8 5" stroke-dashoffset="${dash}"/>`;
      s += `<text class="ts" x="100" y="${cy + 40}" text-anchor="middle">200 nm</text><text class="ts" x="600" y="${cy + 80}" text-anchor="middle">1.9 µm</text><text class="ts" x="340" y="${cy + 80}" text-anchor="middle">T = |a_m|² at 795 nm only</text>`;
      if (k === 4) s += `<text class="th" x="340" y="${cy + 112}" text-anchor="middle">J = T − w_κ P_κ</text><text class="ts" x="340" y="${cy + 130}" text-anchor="middle">sharp corners or wiggles raise P_κ (Lesson 10)</text>`;
    } else {
      const cy = 130;
      s += `<text class="ts" x="20" y="18">polarization beam splitter, top view</text><rect x="250" y="60" width="150" height="140" fill="var(--sunk)" stroke="var(--p)"/><text class="th" x="325" y="135" text-anchor="middle">PBS</text>`;
      s += `<rect x="40" y="${cy - 6}" width="210" height="12" fill="var(--blue-bg)" stroke="var(--blue)"/><rect x="400" y="84" width="250" height="12" fill="var(--blue-bg)" stroke="var(--blue)"/><rect x="400" y="164" width="250" height="12" fill="var(--blue-bg)" stroke="var(--blue)"/>`;
      s += `<text class="ts" x="650" y="76" text-anchor="end">TE port</text><text class="ts" x="650" y="196" text-anchor="end">TM port</text><text class="ts" x="60" y="${cy - 14}">TE₀ and TM₀ inputs</text>`;
      s += `<line x1="410" x2="640" y1="90" y2="90" stroke="#378ADD" stroke-width="3" stroke-dasharray="8 5" stroke-dashoffset="${dash}"/><line x1="410" x2="640" y1="170" y2="170" stroke="#D85A30" stroke-width="3" stroke-dasharray="8 5" stroke-dashoffset="${dash}"/>`;
      if (k === 5) s += `<text class="th" x="340" y="236" text-anchor="middle">FOM = Σ wᵢ T(TE → TE port) + Σ wᵢ T(TM → TM port) ≤ 2</text>`;
      if (k === 6) { const box = (x, y, t, c) => `<rect x="${x}" y="${y}" width="140" height="26" rx="6" fill="var(--sunk)" stroke="${c}"/><text class="ts" x="${x + 70}" y="${y + 17}" text-anchor="middle">${t}</text>`; s += box(40, 220, "TE forward", "#378ADD") + box(190, 220, "TE adjoint", "#7F77DD") + box(340, 220, "TM forward", "#D85A30") + box(490, 220, "TM adjoint", "#7F77DD") + `<text class="ts" x="340" y="268" text-anchor="middle">four simulations per evaluation</text>`; }
    }
    fig.innerHTML = svg(296, s);
  }, { cont: true, dwell: 3.4 });
}},

/* from old ch3 L4 card 5 */
{s: "6. PBS figure of merit", t: "The polarization splitter: two transmissions added",
intu: String.raw`A polarization beam splitter must send \(\mathrm{TE}_0\) to the TE port and \(\mathrm{TM}_0\) to the TM port. The figure of merit adds the two band-weighted transmissions. Each sum is a weighted mean of numbers between 0 and 1, so it is at most 1, and the figure of merit has a maximum of 2. Leakage into the wrong port is not penalized directly, since power in the wrong port cannot be in the right one. Set the four transmissions and watch the figure of merit. The extinction ratio and insertion loss that the thesis reports for the final device (Eq. 3.18) are shown too, and are explained in Lesson 14.`,
eq: String.raw`\[ \mathrm{FOM} = \sum_i w_i\, T_{\mathrm{TE}\to\mathrm{TE\,port}}(\lambda_i) + \sum_i w_i\, T_{\mathrm{TM}\to\mathrm{TM\,port}}(\lambda_i) \]<div class="eqref">Ch. 3 Eq. (3.14), maximum 2</div>`,
sym: [[String.raw`\(T_{\mathrm{TE}\to\mathrm{TE\,port}}\)`, String.raw`\(\mathrm{TE}_0\) input reaching the TE port in its fundamental mode`], [String.raw`\(T_{\mathrm{TM}\to\mathrm{TM\,port}}\)`, String.raw`\(\mathrm{TM}_0\) input reaching the TM port in its fundamental mode`], [String.raw`\(w_i\)`, "band weights: 101 wavelengths from 735 to 835 nm, σ = 8 nm"], [String.raw`\(T_{\mathrm{leak}}\)`, "power in the other port, shown as a dashed line"]],
how: ["Each polarization is a separate input, so each needs its own forward and adjoint simulations.", "Each term is a band-weighted mode transmission (cards 1 and 3).", "Adding them treats both polarizations as equally important.", String.raw`Energy conservation \(T_{\mathrm{target}} + T_{\mathrm{leak}} + \text{losses} = 1\) means maximizing \(T_{\mathrm{target}}\) already pushes \(T_{\mathrm{leak}}\) down.`],
say: "The PBS figure of merit is the sum of the band-weighted transmissions of TE into the TE port and TM into the TM port, with a maximum of 2.",
num: String.raw`Example: \(T_{\mathrm{TE}\to\mathrm{TE\,port}} = 0.9\) and \(T_{\mathrm{TM}\to\mathrm{TM\,port}} = 0.85\) at every wavelength give FOM = 1.75. A splitter that sends half of each polarization to each port scores 1.0.`,
r(fig, ctl) {
  ctl.innerHTML = sl("a", "TE → TE port (target)", 0, 1, 0.01, 0.9) + sl("b", "TE → TM port (leak)", 0, 1, 0.005, 0.02) + sl("c", "TM → TM port (target)", 0, 1, 0.01, 0.85) + sl("d", "TM → TE port (leak)", 0, 1, 0.005, 0.04) + '<div class="readout" id="ro"></div>';
  const u = () => {
    let a = +$("a").value, b = +$("b").value, c = +$("c").value, d = +$("d").value;
    if (a + b > 1) { b = Math.max(0, 1 - a); $("b").value = b; } if (c + d > 1) { d = Math.max(0, 1 - c); $("d").value = d; }
    $("av").textContent = a.toFixed(2); $("bv").textContent = b.toFixed(3); $("cv").textContent = c.toFixed(2); $("dv").textContent = d.toFixed(3);
    const W = v => 1 + 14 * v;
    let s = `<rect x="250" y="70" width="180" height="110" rx="6" fill="var(--sunk)" stroke="var(--p)"/><text class="th" x="340" y="130" text-anchor="middle">PBS</text>`;
    s += `<path d="M40 125 L250 125" stroke="var(--p)" stroke-width="16" stroke-opacity="0.15"/><text class="ts" x="40" y="110">input: TE₀ or TM₀</text>`;
    s += `<path d="M430 90 L640 60" stroke="var(--p)" stroke-width="34" stroke-opacity="0.12"/><path d="M430 160 L640 190" stroke="var(--p)" stroke-width="34" stroke-opacity="0.15"/><text class="ts" x="640" y="34" text-anchor="end">TE port</text><text class="ts" x="640" y="228" text-anchor="end">TM port</text>`;
    s += `<path d="M430 84 L640 54" stroke="#378ADD" stroke-width="${W(a)}" opacity="0.85"/><path d="M430 96 L640 66" stroke="#D85A30" stroke-width="${W(d)}" opacity="0.85" stroke-dasharray="6 4"/>`;
    s += `<path d="M430 166 L640 196" stroke="#D85A30" stroke-width="${W(c)}" opacity="0.85"/><path d="M430 154 L640 184" stroke="#378ADD" stroke-width="${W(b)}" opacity="0.85" stroke-dasharray="6 4"/>`;
    s += C3.legend(40, 250, [["TE₀", "#378ADD"], ["TM₀", "#D85A30"], ["leak", "var(--p)", "6 4"]]);
    fig.innerHTML = svg(255, s);
    const er = (t, l) => l > 0 ? (10 * Math.log10(t / l)).toFixed(1) + " dB" : "∞", il = t => t > 0 ? (-10 * Math.log10(t)).toFixed(2) + " dB" : "∞";
    $("ro").innerHTML = `<div><span>FOM (max 2)</span><b>${(a + c).toFixed(3)}</b></div><div><span>TE: ER / IL (Lesson 14)</span><b>${er(a, b)} / ${il(a)}</b></div><div><span>TM: ER / IL (Lesson 14)</span><b>${er(c, d)} / ${il(c)}</b></div>`;
  };
  ["a", "b", "c", "d"].forEach(k => $(k).oninput = u); u();
}},

/* from old ch3 L4 card 6 */
{s: "7. Objective sets the adjoint source", t: "Which wavelengths drive the adjoint run",
intu: String.raw`The adjoint source amplitude at each frequency is \(\partial J/\partial a_m\). For a band-weighted objective \(J = \sum w_i |a_i|^2\) this is proportional to \(w_i a_i^{*}\). So a wavelength drives the adjoint run strongly when it has a large weight and the device already sends some light into the mode there. Below, a current transmission spectrum (blue) and the weights (orange) give the adjoint amplitudes (bars). Shift the spectrum and change \(\sigma\).`,
eq: String.raw`\[ J = \sum_i w_i\, |a_m(\lambda_i)|^2 \quad\Longrightarrow\quad \frac{\partial J}{\partial a_m(\lambda_i)} \propto w_i\, a_m^{*}(\lambda_i) \]\[ |\text{amplitude}| \propto w_i \sqrt{T_i} \]<div class="eqref">Ch. 3 Sec. 3.2, Lalau-Keraly Eqs. (8) and (9), adjoint run of Lesson 3</div>`,
sym: [[String.raw`\(a_m(\lambda_i)\)`, String.raw`mode amplitude at wavelength \(i\)`], [String.raw`\(w_i\)`, "band weight"], [String.raw`\(a^{*}\)`, "complex conjugate, the time reversal of Lesson 2 card 6"]],
how: [String.raw`\(J\) depends on each \(a_i\) through \(w_i a_i a_i^{*}\).`, String.raw`Its derivative with respect to \(a_i\), holding \(a_i^{*}\) fixed, is \(w_i a_i^{*}\).`, "Tidy3D uses this as the adjoint source amplitude, with its own constant factors.", String.raw`This is the 1D result \(\operatorname{conj}(E_{\mathrm{out}})\) of Lesson 2, now per frequency and per mode.`],
say: "The adjoint source of each frequency is proportional to its band weight times the conjugate mode amplitude, so the objective decides which wavelengths drive the gradient.",
num: "A wavelength with zero weight contributes nothing to the gradient, however the device behaves there.",
r(fig, ctl) {
  ctl.innerHTML = sl("c", "Spectrum peak (nm)", 760, 830, 1, 805) + sl("s", "σ of the weights (nm)", 3, 30, 0.5, 8.5) + `<div class="row"><button id="pl">Play: sweep the peak</button></div>`;
  let playing = false;
  const u = (pv) => {
    const pc = pv === undefined ? +$("c").value : pv, sg = +$("s").value; $("cv").textContent = Math.round(pc); $("sv").textContent = sg;
    const ls = range(755, 835, 33), T = ls.map(l => 0.8 * Math.exp(-Math.pow((l - pc) / 25, 2))), w0 = ls.map(l => Math.exp(-Math.pow(l - 795, 2) / (2 * sg * sg))), S = w0.reduce((a, b) => a + b, 0), w = w0.map(v => v / S);
    const amp = ls.map((_, i) => w[i] * Math.sqrt(T[i])), ma = Math.max(...amp), mw = Math.max(...w);
    const X = C3.X(70, 560, 755, 835), Y = C3.Y(30, 180, 0, 1.05);
    let s = C3.frame(70, 30, 560, 180, 755, 835, 0, 1.05, [755, 775, 795, 815, 835], [0, 0.5, 1], "wavelength (nm)", "scaled");
    ls.forEach((l, i) => s += `<rect x="${X(l) - 5}" y="${Y(amp[i] / ma)}" width="10" height="${210 - Y(amp[i] / ma)}" fill="#7F77DD" opacity="0.75"/>`);
    s += plot(70, 30, 560, 180, ls, T, 755, 835, 0, 1.05, "#378ADD", 2.5) + plot(70, 30, 560, 180, ls, w.map(v => v / mw), 755, 835, 0, 1.05, "#EF9F27", 2, "4 3");
    s += C3.legend(80, 266, [["T(λ) now", "#378ADD"], ["weights (scaled)", "#EF9F27", "4 3"]]) + `<rect x="380" y="256" width="12" height="12" fill="#7F77DD"/><text class="ts" x="398" y="266">adjoint amplitude (scaled)</text>`;
    fig.innerHTML = svg(276, s);
  };
  const stop = () => { playing = false; stopAnim(); $("pl").textContent = "Play: sweep the peak"; };
  $("c").oninput = () => { stop(); u(); }; $("s").oninput = () => { if (!playing) u(); };
  $("pl").onclick = () => { if (playing) { stop(); return; } playing = true; $("pl").textContent = "Pause"; anim(t => { if (!fig.isConnected) { stopAnim(); return; } const pc = 795 + 33 * Math.sin(0.6 * t); $("c").value = Math.round(pc); u(pc); }); };
  u();
}}

],
summary: String.raw`Every figure of merit is a mode transmission \(T_m = |a_m|^2\), with \(a_m\) the overlap of the simulated field with the mode at the monitor (Eq. 3.12). Modes are normalized to unit power and sources to 1 W, so \(T_m\) is a power fraction, and power in other modes or radiated counts as loss. For a grating the coupling efficiency is \(|a_m|^2\) for the fundamental mode of the access waveguide going toward the waveguide. Objectives are averaged over a band with normalized Gaussian weights centered at 795 nm (Eq. 3.13): 101 wavelengths from 735 to 835 nm with \(\sigma = 8\) nm for the PBS, 101 from 745 to 845 nm with \(\sigma = 8.5\) nm for the gratings, and 795 nm only for the tapers. The grating objective is the weighted CE, the taper objective the transmission minus a curvature penalty, and the PBS figure of merit adds TE into the TE port and TM into the TM port, maximum 2 (Eq. 3.14), with forward and adjoint simulations for both polarizations. The objective also fixes the adjoint source: at each frequency its amplitude is proportional to \(w_i a_m^{*}\).`,
sheet: [
[String.raw`\[ a_m = \frac14 \int_S \big(\mathbf{E}_m^{*}\times\mathbf{H} + \mathbf{E}\times\mathbf{H}_m^{*}\big)\cdot\hat{\mathbf{n}}\,dS, \qquad T_m = |a_m|^2 \]`, "Mode overlap, unit-power modes and 1 W sources (Ch. 3 Eq. 3.12)"],
[String.raw`\[ \mathrm{CE} = |a_m|^2 \]`, "Coupling efficiency: fundamental mode of the access waveguide, toward the waveguide"],
[String.raw`\[ \bar T = \sum_i w_i\, T(\lambda_i), \qquad w_i = \frac{\exp\!\big[-(\lambda_i-\lambda_0)^2/(2\sigma^2)\big]}{\sum_j \exp\!\big[-(\lambda_j-\lambda_0)^2/(2\sigma^2)\big]} \]`, "Band weights, λ₀ = 795 nm (Ch. 3 Eq. 3.13): PBS 735 to 835 nm, σ = 8 nm, gratings 745 to 845 nm, σ = 8.5 nm, 101 wavelengths each, tapers 795 nm only"],
[String.raw`\[ J_{\mathrm{grating}} = \sum_i w_i\, \mathrm{CE}(\lambda_i), \qquad J_{\mathrm{taper}} = T(795\ \mathrm{nm}) - w_\kappa P_\kappa \]`, "Grating and taper objectives (Sec. 3.4)"],
[String.raw`\[ \mathrm{FOM} = \sum_i w_i\, T_{\mathrm{TE}\to\mathrm{TE\,port}}(\lambda_i) + \sum_i w_i\, T_{\mathrm{TM}\to\mathrm{TM\,port}}(\lambda_i) \le 2 \]`, "PBS figure of merit (Ch. 3 Eq. 3.14), forward and adjoint runs for both polarizations"],
[String.raw`\[ \text{adjoint amplitude} \propto w_i\, a_m^{*}(\lambda_i) \]`, "Objective to adjoint source"]],
consts: "Mode profiles in cards 1 and 2: 2D slab guides with core index 3.0 in air at 800 nm. The spectra in cards 4 and 7 are illustrations.",
sources: ["Flexcompute, Tidy3D 2.11.2 documentation and source: components/data/utils.py _dot_numpy (mode overlap), unit-power mode normalization, 1 W source normalization, ModeData._adjoint_source_amp", "Lalau-Keraly, Bhargava, Miller and Yablonovitch, Opt. Express 21, 21693 (2013), Eqs. (8) and (9) (adjoint source from the derivative of the objective)", "Michaels and Yablonovitch, Opt. Express 26, 31717 (2018) (figure of merit from mode overlap, adjoint source from ∂F/∂x)"]
});

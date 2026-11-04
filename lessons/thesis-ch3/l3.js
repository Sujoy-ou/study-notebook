/* Step-through controls: Back, Play or Pause, Next, a step counter and a caption per step.
   draw(k, t) draws step k at time t (seconds). o.cont redraws every frame, o.loop restarts. */
const C3L3_steps = (fig, ctl, caps, draw, o) => {
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
id: "thesis-ch3-l3", title: "Adjoint fields in Tidy3D: pixels, boundaries and autograd", short: "3. Adjoint in Tidy3D",
big: String.raw`Tidy3D carries out the forward and adjoint solves as two time-domain simulations of the same structure. The forward run stores the electric field \(\mathbf{E}_{\mathrm{fwd}}\) in the design region at the frequencies used in the figure of merit. When the figure of merit is built from mode amplitudes, the adjoint run sends the same mode backward from the monitor plane, with a complex amplitude at each frequency set by the derivative of \(J\) with respect to that mode amplitude, and stores \(\mathbf{E}_{\mathrm{adj}}\). For a pixel map, the derivative of \(J\) with respect to the permittivity at a point is the real part of \(\mathbf{E}_{\mathrm{fwd}} \cdot \mathbf{E}_{\mathrm{adj}}\) summed over the frequencies. For a structure defined by its boundary, such as grating teeth, DBR layers and outlines, the same overlap is evaluated on the boundary, using only the field components that are continuous across it, the tangential \(\mathbf{E}\) and the normal \(\mathbf{D}\). Automatic differentiation then carries the result back through the parameterization by the chain rule, and the penalties add their gradients without any simulation.`,
bridge: String.raw`This is Ch. 3 Sec. 3.2 from Eq. (3.5) to the end of the section. The adjoint source amplitude follows Lalau-Keraly et al. 2013, Eqs. (8) and (9), the pixel overlap their Eq. (5), and the boundary treatment their Sec. 2. The formulas were checked against the Tidy3D 2.11.2 source (<code>derivative_map_E</code> and the medium derivatives for pixels, <code>_evaluate_dielectric_gradient_at_points</code> and polyslab for boundaries, <code>ModeData._adjoint_source_amp</code> for the adjoint source). The 1D demonstrations below use the solver of Lesson 2.`,
cards: [
/* from old ch3 L3 card 1, now a step-through of the two runs */
{s: "1. Two runs", t: "Forward run and adjoint run, step by step",
intu: String.raw`Tidy3D carries out the two solves of the adjoint method as two time-domain simulations of the same structure. The forward run launches the input mode and stores the electric field \(\mathbf{E}_{\mathrm{fwd}}\) in the design region at the frequencies used in the figure of merit, and the output monitor gives the mode amplitudes \(a_m(f)\). The adjoint run sends the same mode backward from the monitor plane. Its complex amplitude at each frequency is set by the derivative of \(J\) with respect to that mode amplitude, as in Lalau-Keraly Eqs. (8) and (9), and it stores \(\mathbf{E}_{\mathrm{adj}}\). The overlap of the two stored fields is the sensitivity map. You never build the matrix \(A\), Tidy3D sets up the adjoint source for you. Step through the two runs, or press Play and narrate.`,
eq: String.raw`<div class="eqnote">adjoint source: the same mode \(m\), launched backward from the monitor plane</div>\[ \text{amplitude at } f = \frac{\partial J}{\partial a_m(f)} \quad \text{(up to constant factors)} \]\[ \text{for } J = \sum_i w_i\, |a_m(f_i)|^2: \qquad \frac{\partial J}{\partial a_m(f_i)} = w_i\, a_m^{*}(f_i) \]\[ \frac{\partial J}{\partial \varepsilon(\mathbf{r})} = \operatorname{Re} \sum_f \mathbf{E}_{\mathrm{fwd}}(\mathbf{r}, f) \cdot \mathbf{E}_{\mathrm{adj}}(\mathbf{r}, f) \]<div class="eqref">Ch. 3 Sec. 3.2 and Eq. (3.5), Lalau-Keraly Eqs. (5), (8) and (9)</div>`,
sym: [[String.raw`\(a_m(f)\)`, "complex amplitude of the target mode at the output monitor, at frequency f (Lesson 7)"], [String.raw`\(w_i\)`, String.raw`band weight of frequency \(f_i\) (Lesson 7)`], [String.raw`\(a^{*}\)`, "complex conjugate"], [String.raw`\(\mathbf{E}_{\mathrm{fwd}}, \mathbf{E}_{\mathrm{adj}}\)`, "electric fields stored in the design region by the two runs"]],
how: [String.raw`The forward run is the normal simulation: it gives \(a_m(f)\) and therefore \(J\).`, String.raw`\(J\) depends on the fields only through \(a_m\) at the monitor, so \(\partial J/\partial\mathbf{x}\) is nonzero only on the monitor plane, with the shape of the mode. That is a mode source at the monitor, pointing back into the device.`, String.raw`Its amplitude at each frequency is \(\partial J/\partial a_m(f)\). For a weighted sum of \(|a_m|^2\) that is \(w_i a_m^{*}\), the 1D result of Lesson 2 card 6 with the mode profile in place of a single point.`, String.raw`A broadband pulse covers all frequencies of the figure of merit in one run, so each of the two runs is one time-domain simulation.`, String.raw`The overlap of the stored fields, summed over the frequencies, is Eq. (3.5).`],
say: String.raw`Tidy3D runs a forward and an adjoint time-domain simulation of the same structure. The adjoint source is the same mode sent backward from the monitor plane, with an amplitude at each frequency given by the derivative of \(J\) with respect to the mode amplitude.`,
num: "A device with two input polarizations, like the PBS, needs a forward and an adjoint run for each input, four runs per step. The fields in the picture are a cartoon, not a simulation.",
r(fig, ctl) {
  const caps = ["Forward run. A mode source in the input waveguide launches the mode as a short pulse, which covers all frequencies of the figure of merit at once.",
    "The forward run stores the electric field E_fwd in the design region, at each frequency used in the figure of merit (three here).",
    "At the output monitor the field is projected onto the mode. That gives the complex amplitudes a_m(f), and from them J.",
    "Adjoint run. The same mode is sent backward from the monitor plane. Its amplitude at each frequency is ∂J/∂a_m(f), here w_i times the conjugate of a_m(f_i).",
    "The adjoint run stores E_adj in the design region, at the same frequencies.",
    "Overlap. Re Σ_f E_fwd · E_adj at every point is the sensitivity map: coral says add GaAs here, blue says remove it."];
  const NX = 13, NY = 9, P = 20, x0 = 200, y0 = 50, cy = 140, rg = C3.rng(9), dens = [];
  for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) dens.push(C3.clamp(0.5 + 0.8 * Math.sin(i * 0.9 + j * 0.4) * Math.cos(j * 0.8 - i * 0.3) + 0.2 * (rg() - 0.5), 0, 1));
  const FC = ["#378ADD", "#1D9E75", "#BA7517"], a = [[0.55, 0.6], [0.8, -0.4], [0.6, 2.1]], w = [0.25, 0.5, 0.25];
  const Ef = (i, j, f) => Math.cos((0.8 + 0.12 * f) * i + 0.35 * j * (f - 1) + 0.6 * f) * Math.exp(-(((j - 4) / 3.4) ** 2));
  const Ea = (i, j, f) => Math.cos((0.7 + 0.1 * f) * (NX - i) - 0.3 * j + a[f][1]) * Math.exp(-(((j - 4) / 3.0) ** 2)) * w[f] * a[f][0];
  const sens = []; for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) { let v = 0; for (let f = 0; f < 3; f++) v += Ef(i, j, f) * Ea(i, j, f); sens.push(v); }
  const sm = Math.max(...sens.map(Math.abs));
  const packet = (xc, col, dir) => { let d = ""; for (let x = Math.max(20, xc - 70); x <= Math.min(660, xc + 70); x += 3) { const e = Math.exp(-(((x - xc) / 35) ** 2)); d += (d ? "L" : "M") + x + " " + (cy + 16 * e * Math.sin((x - xc) * 0.25 * dir)).toFixed(1); } return `<path d="${d}" fill="none" stroke="${col}" stroke-width="2.5"/>`; };
  const thumb = (x, y, fn, col, lab) => { let s = ""; for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) { const v = fn(i, j); s += `<rect x="${x + i * 4.6}" y="${y + j * 4.6}" width="4.6" height="4.6" fill="${col}" fill-opacity="${Math.min(1, Math.abs(v) * 0.9).toFixed(2)}"/>`; } return s + `<rect x="${x}" y="${y}" width="${NX * 4.6}" height="${NY * 4.6}" fill="none" stroke="var(--b)"/><text class="ts" x="${x + NX * 2.3}" y="${y + NY * 4.6 + 13}" text-anchor="middle">${lab}</text>`; };
  C3L3_steps(fig, ctl, caps, (k, t) => {
    let s = `<rect x="20" y="${cy - 12}" width="180" height="24" fill="var(--blue-bg)" stroke="var(--blue)"/><rect x="460" y="${cy - 12}" width="200" height="24" fill="var(--blue-bg)" stroke="var(--blue)"/>`;
    for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
      const id = j * NX + i; let fill = "var(--blue)", op = 0.08 + 0.5 * dens[id];
      if (k === 1 || k === 2) { const v = Ef(i, j, 1); fill = "#378ADD"; op = 0.1 + 0.85 * Math.abs(v); }
      if (k === 4) { const v = Ea(i, j, 1) / (w[1] * a[1][0]); fill = "#7F77DD"; op = 0.1 + 0.85 * Math.abs(v); }
      if (k === 5) { const v = sens[id] / sm; fill = v >= 0 ? "#D85A30" : "#378ADD"; op = 0.08 + 0.9 * Math.abs(v); }
      s += `<rect x="${x0 + i * P}" y="${y0 + j * P}" width="${P}" height="${P}" fill="${fill}" fill-opacity="${op.toFixed(2)}"/>`;
    }
    s += `<rect x="${x0}" y="${y0}" width="${NX * P}" height="${NY * P}" fill="none" stroke="var(--p)" stroke-dasharray="5 4"/>`;
    const lab = ["design region (the same structure in both runs)", "stored: E_fwd(r, f) in the design region", "design region", "design region", "stored: E_adj(r, f) in the design region", "∂J/∂ε(r) = Re Σ_f E_fwd · E_adj"][k];
    s += `<text class="ts" x="${x0 + NX * P / 2}" y="${y0 - 8}" text-anchor="middle">${lab}</text>`;
    s += `<line x1="580" x2="580" y1="96" y2="184" stroke="#EF9F27" stroke-width="3"/><text class="ts" x="580" y="90" text-anchor="middle">monitor plane</text>`;
    s += `<line x1="60" x2="60" y1="96" y2="184" stroke="#378ADD" stroke-width="${k === 0 ? 4 : 2}"/><text class="ts" x="60" y="90" text-anchor="middle">mode source</text>`;
    if (k === 0) s += packet(60 + ((t * 160) % 600), "#378ADD", 1) + arrow(80, 200, 180, 200, "#378ADD", 2) + `<text class="ts" x="130" y="218" text-anchor="middle">forward</text>`;
    if (k === 1 || k === 4) for (let f = 0; f < 3; f++) s += thumb(205 + f * 85, 238, (i, j) => (k === 1 ? Ef(i, j, f) : Ea(i, j, f) / (w[f] * a[f][0])), k === 1 ? "#378ADD" : "#7F77DD", `f${["₁", "₂", "₃"][f]}`);
    if (k >= 2 && k <= 4) {
      const adj = k >= 3;
      for (let f = 0; f < 3; f++) { const h = (adj ? w[f] * a[f][0] / 0.4 : a[f][0]) * 55, x = 600 + f * 18; s += `<rect x="${x}" y="${245 - h}" width="12" height="${h}" fill="${FC[f]}" opacity="0.85"/>`; }
      s += `<text class="ts" x="670" y="262" text-anchor="end">${adj ? "∂J/∂a_m(f) = w a*" : "|a_m(f)| at f₁ f₂ f₃"}</text>`;
      if (!adj) s += `<text class="ts" x="670" y="280" text-anchor="end">J = Σ w_i |a_m(f_i)|²</text>`;
    }
    if (k === 3) { s += `<line x1="580" x2="580" y1="96" y2="184" stroke="#7F77DD" stroke-width="5"/>` + packet(580 - ((t * 160) % 560), "#7F77DD", -1) + arrow(560, 200, 470, 200, "#7F77DD", 2) + `<text class="ts" x="515" y="218" text-anchor="middle">adjoint, backward</text>`;
      for (let f = 0; f < 3; f++) { const ph = -a[f][1], cx = 215 + f * 125, r = 14; s += `<circle cx="${cx}" cy="262" r="${r}" fill="none" stroke="var(--b)"/>` + arrow(cx, 262, cx + r * Math.cos(ph), 262 - r * Math.sin(ph), FC[f], 2) + `<text class="ts" x="${cx + 20}" y="266">phase at f${["₁", "₂", "₃"][f]}</text>`; } }
    if (k === 5) s += `<rect x="210" y="250" width="12" height="12" fill="#D85A30"/><text class="ts" x="228" y="261">add GaAs</text><rect x="310" y="250" width="12" height="12" fill="#378ADD"/><text class="ts" x="328" y="261">remove GaAs</text><text class="ts" x="420" y="261">two runs give all pixels</text>`;
    fig.innerHTML = svg(290, s);
  }, { cont: true, dwell: 3.4 });
}},

/* from old ch3 L3 card 2 */
{s: "2. Many frequencies", t: "The sensitivity map summed over a band",
intu: "A broadband pulse gives all frequencies in one run, and the frequency monitors store the fields at the chosen frequencies (Chapter 2, Lesson 9). The sensitivity map is then a sum over frequencies of the field products. Below, the figure of merit is the weighted transmission of the 1D device over a band. Thin lines are the contribution of each wavelength, the bold line is their sum. The contributions often disagree in sign, which is exactly the trade-off between wavelengths that the optimizer has to resolve. Change the number of wavelengths and the band width.",
eq: String.raw`\[ \frac{\partial J}{\partial \varepsilon(\mathbf{r})} = \operatorname{Re} \sum_f \mathbf{E}_{\mathrm{fwd}}(\mathbf{r}, f) \cdot \mathbf{E}_{\mathrm{adj}}(\mathbf{r}, f) \]<div class="eqref">Ch. 3 Eq. (3.5), Lalau-Keraly Eq. (5), Tidy3D</div>`,
sym: [[String.raw`\(\varepsilon(\mathbf{r})\)`, String.raw`relative permittivity at point \(\mathbf{r}\)`], [String.raw`\(\sum_f\)`, "sum over the recorded frequencies of the figure of merit"], [String.raw`\(\cdot\)`, "dot product of the vector fields (here 1D, a single component)"], ["constants", String.raw`the factors like \(-2k_0^2\) of Lesson 2 are folded into the adjoint source amplitude`]],
how: [String.raw`Each frequency is an independent linear problem with its own \(A(f)\).`, "So the gradient of a sum over frequencies is the sum of the gradients.", "Tidy3D puts all constant factors into the adjoint source, leaving the bare overlap.", String.raw`Papers with another time convention write the same result with a different sign, or as an imaginary part with a factor \(\omega\). Each form gives the same gradient with its own adjoint source, so do not mix the forms.`],
say: "The derivative with respect to the permittivity at a point is the real part of the forward and adjoint field product, summed over the frequencies of the figure of merit.",
num: "Example band here: wavelengths around 800 nm with Gaussian weights (Lesson 7). Five wavelengths need the same two simulations in the time domain, because one pulse covers them all.",
r(fig, ctl) {
  let nf = 5; ctl.innerHTML = btns([["1", "1 wavelength"], ["3", "3"], ["5", "5"], ["9", "9"]], "n") + sl("s", "Band σ (nm)", 5, 60, 1, 25) + '<div class="readout" id="ro"></div>';
  const dev = new C3.Dev1D({ Nd: 60, pad: 30 }), r = C3.rng(31), rho = C3.filter1D(Float64Array.from({ length: 60 }, () => r()), 2);
  const u = () => {
    pick(ctl, "n", nf); const sg = +$("s").value; $("sv").textContent = sg;
    const ls = nf === 1 ? [800] : range(800 - 1.5 * sg, 800 + 1.5 * sg, nf), ws0 = ls.map(l => Math.exp(-Math.pow(l - 800, 2) / (2 * sg * sg))), S = ws0.reduce((a, b) => a + b, 0), ws = ws0.map(w => w / S);
    const parts = ls.map((l, k) => { const q = dev.T(rho, l, true); return { T: q.T, g: Array.from(q.grad, v => v * ws[k]) }; });
    const sum = new Array(60).fill(0); parts.forEach(p => p.g.forEach((v, i) => sum[i] += v));
    const mg = Math.max(...sum.map(Math.abs), ...parts.flatMap(p => p.g.map(Math.abs))) || 1, xs = [...Array(60).keys()];
    let s = C3.stripe(70, 10, 560, 16, rho) + C3.frame(70, 40, 560, 170, 0, 59, -1.1, 1.1, [0, 15, 30, 45, 59], [-1, 0, 1], "pixel index", "∂J/∂ε (scaled)");
    s += `<line x1="70" x2="630" y1="125" y2="125" stroke="var(--b)"/>`;
    const cols = ["#378ADD", "#1D9E75", "#7F77DD", "#EF9F27", "#D85A30", "#5DCAA5", "#AFA9EC", "#F0997B", "#85B7EB"];
    parts.forEach((p, k) => s += plot(70, 40, 560, 170, xs, p.g.map(v => v / mg), 0, 59, -1.1, 1.1, cols[k % cols.length], 1.2));
    s += plot(70, 40, 560, 170, xs, sum.map(v => v / mg), 0, 59, -1.1, 1.1, "var(--t)", 3);
    fig.innerHTML = svg(262, s + `<text class="ts" x="340" y="258" text-anchor="middle">thin: w_i × contribution of each wavelength, bold: sum</text>`);
    const J = parts.reduce((a, p, k) => a + ws[k] * p.T, 0);
    $("ro").innerHTML = `<div><span>wavelengths</span><b>${ls.map(l => l.toFixed(0)).join(", ")}</b></div><div><span>J = Σ w T</span><b>${J.toFixed(3)}</b></div>`;
  };
  ctl.querySelectorAll("button").forEach(b => b.onclick = () => { nf = +b.dataset.n; u(); }); $("s").oninput = u; u();
}},

/* from old ch3 L3 card 3 */
{s: "3. Follow the gradient", t: "A step along the gradient improves the figure of merit",
intu: String.raw`The sensitivity map says where to add and where to remove material. Take a small step of the pixel densities along it and the figure of merit goes up. Press the step button a few times and watch the design (stripe), the transmission spectrum and \(F\) at 800 nm. This is gradient ascent in its plainest form, without the filter, projection or Adam of later lessons, so the design stays grey.`,
eq: String.raw`\[ \rho_i \leftarrow \rho_i + \alpha\, (\varepsilon_{\mathrm{GaAs}} - \varepsilon_{\mathrm{air}})\, \frac{\partial F}{\partial \varepsilon_i}, \qquad \text{clipped to } [0, 1] \]`,
sym: [[String.raw`\(\rho_i\)`, String.raw`density of pixel \(i\), \(\varepsilon_i = \varepsilon_{\mathrm{air}} + \rho_i(\varepsilon_{\mathrm{GaAs}} - \varepsilon_{\mathrm{air}})\)`], [String.raw`\(\alpha\)`, "step size"], [String.raw`\(F\)`, "transmission at 800 nm, to be maximized here"]],
how: [String.raw`Compute \(F\) and its gradient with two solves.`, String.raw`Chain rule: \(\partial F/\partial \rho_i = (\varepsilon_{\mathrm{GaAs}} - \varepsilon_{\mathrm{air}})\, \partial F/\partial \varepsilon_i\).`, "Move every pixel a little along its derivative.", String.raw`Repeat. For a small enough step, \(F\) increases every time.`],
say: "Moving the design along the adjoint gradient increases the figure of merit, which is all an optimizer does, repeated many times.",
num: String.raw`Watch how the spectrum reshapes around 800 nm while other wavelengths are free to do anything, because only 800 nm is in \(F\).`,
r(fig, ctl) {
  ctl.innerHTML = `<div class="row"><button id="st">Take 5 steps</button><button id="rs">Reset</button></div>` + sl("a", "Step size α", 0.5, 8, 0.5, 3) + '<div class="readout" id="ro"></div>';
  const dev = new C3.Dev1D({ Nd: 60, pad: 30 }); let rho, hist;
  const reset = () => { const r = C3.rng(44); rho = Float64Array.from({ length: 60 }, () => 0.35 + 0.3 * r()); hist = [dev.T(rho, 800).T]; };
  const u = () => {
    $("av").textContent = (+$("a").value).toFixed(1);
    const ls = range(650, 950, 121), Ts = ls.map(l => dev.T(rho, l).T);
    let s = C3.stripe(70, 8, 560, 16, rho) + C3.frame(70, 40, 360, 150, 650, 950, 0, 1, [650, 800, 950], [0, 0.5, 1], "wavelength (nm)", "T");
    s += `<line x1="${C3.X(70, 360, 650, 950)(800)}" x2="${C3.X(70, 360, 650, 950)(800)}" y1="40" y2="190" stroke="#EF9F27" stroke-dasharray="4 3"/>` + plot(70, 40, 360, 150, ls, Ts, 650, 950, 0, 1, "#378ADD", 2);
    const n = hist.length, X = C3.X(480, 150, 0, Math.max(10, n - 1));
    s += C3.frame(480, 40, 150, 150, 0, Math.max(10, n - 1), 0, 1, [0, Math.max(10, n - 1)], [0, 0.5, 1], "step", "F");
    s += plot(480, 40, 150, 150, hist.map((_, i) => i), hist, 0, Math.max(10, n - 1), 0, 1, "#1D9E75", 2);
    fig.innerHTML = svg(240, s);
    $("ro").innerHTML = `<div><span>F = T(800 nm)</span><b>${hist[n - 1].toFixed(3)}</b></div><div><span>steps</span><b>${n - 1}</b></div>`;
  };
  $("st").onclick = () => { const a = +$("a").value; for (let k = 0; k < 5; k++) { const q = dev.T(rho, 800, true); for (let i = 0; i < 60; i++) rho[i] = C3.clamp(rho[i] + a * (dev.eMax - dev.eMin) * q.grad[i], 0, 1); hist.push(dev.T(rho, 800).T); } u(); };
  $("rs").onclick = () => { reset(); u(); }; $("a").oninput = u; reset(); u();
}},

/* from old ch3 L3 card 4 */
{s: "4. At a boundary", t: "Which field components are continuous at a boundary",
intu: String.raw`For a structure defined by its boundary, such as the grating teeth, the DBR layers and the taper and PBS outlines, a parameter moves an edge, and a thin sliver changes from air to GaAs. To evaluate the field product on that boundary you need field values that are well defined there. The tangential electric field \(\mathbf{E}_{\parallel}\) is continuous across the boundary. The normal electric field is not: it jumps by the ratio of permittivities, about 12 for GaAs and air. The normal displacement \(D_{\perp} = \varepsilon E_{\perp}\) is continuous instead. So Tidy3D evaluates the overlap on the boundary itself, using only \(\mathbf{E}_{\parallel}\) and \(D_{\perp}\), as Lalau-Keraly et al. describe in their Sec. 2. The thesis states this in words, the formula below is the form it takes. Rotate the field and see which arrows match across the boundary.`,
eq: String.raw`\[ \mathbf{E}_{\parallel}^{\mathrm{in}} = \mathbf{E}_{\parallel}^{\mathrm{out}}, \qquad D_{\perp}^{\mathrm{in}} = D_{\perp}^{\mathrm{out}} \quad\Longrightarrow\quad E_{\perp}^{\mathrm{out}} = \frac{\varepsilon_{\mathrm{in}}}{\varepsilon_{\mathrm{out}}}\, E_{\perp}^{\mathrm{in}} \]\[ \frac{\partial J}{\partial p_i} = \operatorname{Re} \sum_f \int_S \left[ \Delta\varepsilon\, \mathbf{E}_{\parallel,\mathrm{fwd}} \cdot \mathbf{E}_{\parallel,\mathrm{adj}} - \Delta(\varepsilon^{-1})\, D_{\perp,\mathrm{fwd}}\, D_{\perp,\mathrm{adj}} \right] v_{n,i}\, dS \]<div class="eqref">Ch. 3 Sec. 3.2 in words (not numbered), form after Lalau-Keraly Sec. 2 and Tidy3D</div>`,
sym: [[String.raw`\(S\)`, "the boundary surface"], [String.raw`\(\Delta\varepsilon\)`, String.raw`change of \(\varepsilon\) across \(S\), from outside to inside`], [String.raw`\(\Delta(\varepsilon^{-1})\)`, String.raw`change of \(1/\varepsilon\) across \(S\)`], [String.raw`\(v_{n,i}\)`, String.raw`normal velocity of the boundary when \(p_i\) changes`], [String.raw`\(\mathbf{E}_{\parallel}, D_{\perp}\)`, "the continuous components"]],
how: [String.raw`Moving the boundary by \(\delta n\) over an area \(dS\) changes \(\varepsilon\) in a volume \(\delta n\, dS\).`, String.raw`For the tangential part, the pixel formula applies directly with the change \(\Delta\varepsilon\).`, String.raw`For the normal part, the natural variable is \(D_{\perp}\), and the change of \(1/\varepsilon\) plays the role of \(\Delta\varepsilon\), with a minus sign.`, String.raw`Both are evaluated with continuous quantities, so it does not matter on which side of \(S\) the fields are sampled.`],
say: String.raw`On a boundary Tidy3D evaluates the field overlap with the continuous components, \(\Delta\varepsilon\, \mathbf{E}_{\parallel} \cdot \mathbf{E}_{\parallel}\) minus \(\Delta(1/\varepsilon)\, D_{\perp} D_{\perp}\), weighted by how fast the boundary moves.`,
num: String.raw`GaAs/air: \(\varepsilon_{\mathrm{in}}/\varepsilon_{\mathrm{out}} = 12.19\), so the normal \(E\) field outside is 12 times larger than inside. Sampling \(E_{\perp}\) on the wrong side would give a gradient wrong by an order of magnitude.`,
r(fig, ctl) {
  ctl.innerHTML = sl("a", "Field angle to the boundary (°)", 0, 90, 1, 40) + '<div class="readout" id="ro"></div>';
  const u = () => {
    const a = +$("a").value * Math.PI / 180; $("av").textContent = $("a").value;
    const Ein = 50, Et = Ein * Math.cos(a), Enin = Ein * Math.sin(a), er = 12.19, Enout = Enin * er, sc = 1 / Math.max(1, Enout / 120);
    let s = `<rect x="40" y="20" width="300" height="220" fill="var(--blue-bg)"/><text class="th" x="190" y="40" text-anchor="middle">GaAs, ε = 12.19</text><text class="th" x="490" y="40" text-anchor="middle">air, ε = 1</text><line x1="340" x2="340" y1="20" y2="240" stroke="var(--blue)" stroke-width="2"/>`;
    const cx1 = 230, cx2 = 450, cy = 150;
    s += arrow(cx1, cy, cx1 + Enin * 2 * sc, cy - Et * 2 * sc, "var(--t)", 2.5) + arrow(cx1, cy, cx1, cy - Et * 2 * sc, "#1D9E75", 2) + arrow(cx1, cy, cx1 + Enin * 2 * sc, cy, "#D85A30", 2);
    s += arrow(cx2, cy, cx2 + Enout * 2 * sc, cy - Et * 2 * sc, "var(--t)", 2.5) + arrow(cx2, cy, cx2, cy - Et * 2 * sc, "#1D9E75", 2) + arrow(cx2, cy, cx2 + Enout * 2 * sc, cy, "#D85A30", 2);
    s += `<text class="ts" x="${cx1 - 8}" y="${cy - Et * sc}" text-anchor="end" fill="#1D9E75">E∥</text><text class="ts" x="${cx1 + 10}" y="${cy + 18}" fill="#D85A30">E⊥</text><text class="ts" x="${cx2 - 8}" y="${cy - Et * sc}" text-anchor="end" fill="#1D9E75">E∥</text><text class="ts" x="${cx2 + 10}" y="${cy + 18}" fill="#D85A30">E⊥ (×12.19)</text>`;
    s += `<text class="ts" x="340" y="258" text-anchor="middle">green matches across the boundary, orange jumps${sc < 1 ? " (arrows scaled down)" : ""}</text>`;
    fig.innerHTML = svg(266, s);
    $("ro").innerHTML = `<div><span>E∥ in / out</span><b>${(Et / Ein).toFixed(2)} / ${(Et / Ein).toFixed(2)}</b></div><div><span>E⊥ in / out</span><b>${(Enin / Ein).toFixed(2)} / ${(Enout / Ein).toFixed(2)}</b></div><div><span>D⊥ in / out (÷ε₀)</span><b>${(er * Enin / Ein).toFixed(2)} / ${(Enout / Ein).toFixed(2)}</b></div>`;
  };
  $("a").oninput = u; u();
}},

/* from old ch3 L3 card 5 */
{s: "5. A boundary gradient, checked", t: "Moving a slab boundary: formula versus finite difference",
intu: String.raw`In 1D at normal incidence the field is tangential to every interface, so only the \(\Delta\varepsilon\, \mathbf{E}_{\parallel} \cdot \mathbf{E}_{\parallel}\) term of the boundary formula of card 4 is present. A GaAs slab of thickness \(L\) sits in air. Its right boundary can move continuously because the boundary pixel is partly filled, which is the material averaging idea of Michaels and Yablonovitch. The slope \(dT/dL\) from the boundary formula (two solves) is drawn as the orange tangent on the \(T(L)\) curve. It matches the finite-difference slope. Move the thickness.`,
eq: String.raw`\[ \begin{aligned} \frac{dT}{dL} &= \Delta\varepsilon \times \left(\frac{\partial T}{\partial \varepsilon} \text{ per unit length}\right) \text{ at the boundary} \\ &= \Delta\varepsilon \cdot \left[ -2k_0^2 \operatorname{Re}\{ E_{\mathrm{adj}} E_{\mathrm{fwd}} \} \right]_{\mathrm{boundary}} / \Delta \end{aligned} \]`,
sym: [[String.raw`\(L\)`, "slab thickness, moved at its right boundary"], [String.raw`\(\Delta\varepsilon\)`, String.raw`\(\varepsilon_{\mathrm{GaAs}} - \varepsilon_{\mathrm{air}} = 11.19\)`], [String.raw`\(\Delta\)`, "grid step, 10 nm"], [String.raw`\(v_n\)`, String.raw`here 1: the boundary moves by exactly \(dL\)`]],
how: [String.raw`The boundary pixel holds a fraction \(f\) of GaAs: \(\varepsilon = \varepsilon_{\mathrm{air}} + f\Delta\varepsilon\).`, String.raw`So \(L = (n + f)\Delta\) changes continuously with \(f\).`, String.raw`Moving the boundary by \(dL\) changes the fill of that pixel by \(dL/\Delta\).`, String.raw`The gradient is the pixel formula times \(\Delta\varepsilon/\Delta\), evaluated at the boundary: the 1D version of the boundary formula.`],
say: "The boundary gradient is the same forward-adjoint overlap, evaluated on the boundary and multiplied by how fast the boundary moves.",
num: String.raw`The \(T(L)\) curve shows the Fabry-Perot oscillation of the slab: its period is \(\lambda/(2n) \approx 115\) nm at 800 nm.`,
r(fig, ctl) {
  ctl.innerHTML = sl("L", "Slab thickness L (nm)", 20.5, 399.5, 1, 140.5) + '<div class="readout" id="ro"></div>';
  const dev = new C3.Dev1D({ Nd: 50, pad: 30 }), lam = 800;
  const rhoOf = L => { const r = new Float64Array(50), n = Math.floor(L / 10), f = L / 10 - n; for (let i = 0; i < n; i++) r[5 + i] = 1; if (n < 45) r[5 + n] = f; return r; };
  const Ls = range(20, 400, 191), Ts = Ls.map(L => dev.T(rhoOf(L), lam).T);
  const u = () => {
    const L = +$("L").value; $("Lv").textContent = L; const n = Math.floor(L / 10), q = dev.T(rhoOf(L), lam, true), de = dev.eMax - dev.eMin;
    const slope = q.grad[5 + n] * de / 10, fd = (dev.T(rhoOf(L + 0.05), lam).T - dev.T(rhoOf(L - 0.05), lam).T) / 0.1;
    const X = C3.X(70, 560, 20, 400), Y = C3.Y(30, 180, 0, 1.05);
    let s = C3.frame(70, 30, 560, 180, 20, 400, 0, 1.05, [20, 100, 200, 300, 400], [0, 0.5, 1], "slab thickness L (nm)", "T at 800 nm") + plot(70, 30, 560, 180, Ls, Ts, 20, 400, 0, 1.05, "#378ADD", 2.5);
    const d = 40; s += `<line x1="${X(L - d)}" y1="${Y(q.T - slope * d)}" x2="${X(L + d)}" y2="${Y(q.T + slope * d)}" stroke="#EF9F27" stroke-width="3"/><circle cx="${X(L)}" cy="${Y(q.T)}" r="5" fill="#D85A30"/>`;
    fig.innerHTML = svg(255, s);
    $("ro").innerHTML = `<div><span>T</span><b>${q.T.toFixed(4)}</b></div><div><span>dT/dL, boundary formula</span><b>${(slope * 1000).toFixed(3)} /µm</b></div><div><span>dT/dL, finite difference</span><b>${(fd * 1000).toFixed(3)} /µm</b></div>`;
  };
  $("L").oninput = u; u();
}},

/* from old ch3 L3 card 6 */
{s: "6. Autograd", t: "From the Python function to the gradient of every parameter",
intu: "In practice the geometry, the simulation and the figure of merit are written as one Python function. Tidy3D's automatic differentiation records every operation. Asking for the gradient runs the forward simulation, builds the adjoint source, runs the adjoint simulation, evaluates the pixel or boundary formula, and carries the result back through the parameterization by the chain rule. Penalties depend only on the geometry, so their gradient comes from the chain rule alone, with no simulation. Step through the forward pass and the backward pass.",
eq: String.raw`\[ \frac{\partial J}{\partial p_j} = \sum_{\mathbf{r}} \frac{\partial J}{\partial \varepsilon(\mathbf{r})} \cdot \frac{\partial \varepsilon(\mathbf{r})}{\partial p_j} - \sum_k w_k \frac{\partial P_k}{\partial p_j} \]`,
sym: [[String.raw`\(\partial \varepsilon(\mathbf{r})/\partial p_j\)`, String.raw`how the permittivity map depends on parameter \(j\): through tanh bounds, filter and projection, or boundary moves (Lessons 4 to 6)`], [String.raw`\(\partial J/\partial \varepsilon(\mathbf{r})\)`, "from the two simulations (Eq. 3.5, or its boundary form)"], [String.raw`\(\partial P_k/\partial p_j\)`, "penalty gradient, pure geometry"]],
how: [String.raw`Forward pass: \(\mathbf{p}\) → bounded geometry → \(\varepsilon(\mathbf{r})\) → forward FDTD → \(a_m(f)\) → \(J\).`, String.raw`Backward pass: \(\partial J/\partial a_m\) → adjoint source → adjoint FDTD → \(\partial J/\partial \varepsilon(\mathbf{r})\).`, String.raw`Chain rule back through the parameterization, from \(\varepsilon(\mathbf{r})\) to \(\partial J/\partial\mathbf{p}\).`, "Add the penalty gradients, which need no simulation."],
say: "The autograd interface records the operations, runs the forward and adjoint simulations, evaluates the overlap and applies the chain rule back to the parameters.",
num: "Cost per step: two simulations per input, whatever the number of parameters. Chain rule steps through filters and projections cost almost nothing next to a 3D FDTD run.",
r(fig, ctl) {
  const F = [["p", 40], ["tanh, filter, projection", 150], ["ε(r)", 270], ["forward FDTD", 375], ["a_m(f)", 480], ["J", 600]];
  const B = [["∂J/∂p", 40], ["chain rule", 150], ["∂J/∂ε(r)", 270], ["adjoint FDTD", 375], ["∂J/∂a_m", 480], ["start", 600]];
  let k = 0; const nS = 12;
  ctl.innerHTML = `<div class="row"><button id="b">Back</button><button id="n">Next</button></div>`;
  const u = () => {
    let s = `<text class="ts" x="20" y="30">forward pass</text><text class="ts" x="20" y="150">backward pass</text>`;
    F.forEach(([t, x], i) => { const on = k >= i && k < 6; s += `<g class="${on ? (k === i ? "c-coral" : "c-blue") : "c-gray"}"><rect x="${x - 48}" y="45" width="96" height="40" rx="8"/></g><text class="th" x="${x}" y="70" text-anchor="middle" style="font-size:12px">${t}</text>`; if (i < 5) s += `<line x1="${x + 49}" x2="${F[i + 1][1] - 50}" y1="65" y2="65" class="arr" marker-end="url(#ar)"/>`; });
    B.forEach(([t, x], i) => { const j = 11 - i, on = k >= 6 && k >= j; s += `<g class="${on ? (k === j ? "c-coral" : "c-purple") : "c-gray"}"><rect x="${x - 48}" y="165" width="96" height="40" rx="8"/></g><text class="th" x="${x}" y="190" text-anchor="middle" style="font-size:12px">${t}</text>`; if (i < 5) s += `<line x1="${B[i + 1][1] - 50}" x2="${x + 49}" y1="185" y2="185" class="arr" marker-end="url(#ar)"/>`; });
    s += `<path d="M600 87 L600 163" class="arr" marker-end="url(#ar)"/><path d="M40 87 Q 10 125 40 163" class="arr" stroke-dasharray="4 3"/><text class="ts" x="50" y="128">penalties: chain rule only</text>`;
    const notes = ["start from the parameters", "bound and smooth them (Lessons 4 to 6)", "build the permittivity map", "first simulation", "project onto the target mode (Lesson 7)", "objective with penalties", "seed the backward pass with ∂J/∂J = 1", "derivative with respect to each mode amplitude", "second simulation, adjoint source at the monitor", "field overlap, Eq. 3.5 or its boundary form", "back through filter, projection and tanh", "the gradient the optimizer uses"];
    s += `<text class="ts" x="340" y="235" text-anchor="middle">${notes[k]}</text>`;
    fig.innerHTML = svg(250, s); $("b").disabled = k === 0; $("n").disabled = k === nS - 1;
  };
  $("b").onclick = () => { k--; u(); }; $("n").onclick = () => { k++; u(); }; u();
}}

],
summary: String.raw`Tidy3D evaluates the adjoint gradient with two time-domain runs of the same structure per input. The forward run stores \(\mathbf{E}_{\mathrm{fwd}}\) in the design region at the frequencies of the figure of merit and gives the mode amplitudes at the monitor. The adjoint run sends the same mode backward from the monitor plane, with amplitude \(\partial J/\partial a_m\) at each frequency (Lalau-Keraly Eqs. 8 and 9), and stores \(\mathbf{E}_{\mathrm{adj}}\). For a pixel map, \(\partial J/\partial \varepsilon(\mathbf{r}) = \operatorname{Re} \sum_f \mathbf{E}_{\mathrm{fwd}} \cdot \mathbf{E}_{\mathrm{adj}}\) (Eq. 3.5), with the constants folded into the adjoint source. For a structure defined by its boundary the overlap is taken on the boundary with the continuous components only, the tangential \(\mathbf{E}\) and the normal \(\mathbf{D}\). Autograd then applies the chain rule back through the parameterization, and penalties add their gradients without any simulation.`,
sheet: [
[String.raw`\[ \text{adjoint source: same mode, backward from the monitor, amplitude } \frac{\partial J}{\partial a_m(f)} \]`, "Lalau-Keraly Eqs. (8) and (9), Ch. 3 Sec. 3.2"],
[String.raw`\[ J = \sum_i w_i\, |a_m(f_i)|^2 \;\Longrightarrow\; \frac{\partial J}{\partial a_m(f_i)} = w_i\, a_m^{*}(f_i) \]`, "Adjoint amplitude for a band-weighted objective"],
[String.raw`\[ \frac{\partial J}{\partial \varepsilon(\mathbf{r})} = \operatorname{Re} \sum_f \mathbf{E}_{\mathrm{fwd}}(\mathbf{r}, f) \cdot \mathbf{E}_{\mathrm{adj}}(\mathbf{r}, f) \]`, "Pixel sensitivity (Ch. 3 Eq. 3.5, Lalau-Keraly Eq. 5, Tidy3D)"],
[String.raw`\[ \mathbf{E}_{\parallel} \text{ and } D_{\perp} = \varepsilon E_{\perp} \text{ continuous across a boundary} \]`, "Why only these components are used on a boundary (Lalau-Keraly Sec. 2)"],
[String.raw`\[ \frac{\partial J}{\partial p_i} = \operatorname{Re} \sum_f \int_S \left[ \Delta\varepsilon\, \mathbf{E}_{\parallel} \cdot \mathbf{E}_{\parallel} - \Delta(\varepsilon^{-1})\, D_{\perp} D_{\perp} \right] v_{n,i}\, dS \]`, "Boundary form, said in words in Sec. 3.2 (not numbered)"],
[String.raw`\[ \frac{\partial J}{\partial \mathbf{p}} = \sum_{\mathbf{r}} \frac{\partial J}{\partial \varepsilon(\mathbf{r})} \frac{\partial \varepsilon(\mathbf{r})}{\partial \mathbf{p}} - \sum_k w_k \frac{\partial P_k}{\partial \mathbf{p}} \]`, "Chain rule done by autograd"]],
consts: String.raw`1D demos: grid step 10 nm, \(\varepsilon\) between 1 and 12.19. Tidy3D version 2.11.2.`,
sources: ["Lalau-Keraly, Bhargava, Miller and Yablonovitch, Opt. Express 21, 21693 (2013), Eqs. (5), (8), (9) and Sec. 2 (pixel overlap, adjoint source amplitude, boundary components)", "Flexcompute, Tidy3D 2.11.2 source: derivative_map_E, medium derivatives, _evaluate_dielectric_gradient_at_points, polyslab, ModeData._adjoint_source_amp", "Michaels and Yablonovitch, Opt. Express 26, 31717 (2018) (adjoint fields as the output run backwards, Eq. 13 convention, material averaging on a grid)"]
});

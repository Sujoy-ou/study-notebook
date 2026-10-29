addLesson("thesis", "ch3", {
level: "Core",
id: "thesis-ch3-l3", title: "Adjoint fields in Tidy3D: pixels, boundaries and autograd", short: "3. Adjoint in Tidy3D",
big: "Tidy3D applies the adjoint principle with two time-domain simulations. The forward run records the electric field in the design region at the frequencies of the figure of merit. The adjoint run is excited by a mode source at the output monitor, in the same mode, with an amplitude set by the derivative of J with respect to that mode amplitude. For a pixel map, the derivative of J with respect to the permittivity at a point is the real part of E<sub>fwd</sub>·E<sub>adj</sub> summed over the frequencies. For a structure defined by its boundary, the same overlap is evaluated on the boundary, using the field components that are continuous across it. The automatic differentiation interface then carries the result back through the parameterization by the chain rule.",
bridge: "This is Ch. 3 Sec. 3.2, Eqs. (3.5) and (3.6). Both formulas were read from the Tidy3D 2.11.2 source (derivative_map_E and the medium derivatives for pixels, _evaluate_dielectric_gradient_at_points and polyslab for boundaries, ModeData._adjoint_source_amp for the adjoint source). The 1D demonstrations below use the solver of Lesson 2. Michaels and Yablonovitch 2018 motivate the boundary treatment: on a rectangular grid a moving boundary has to be handled with care.",
cards: [
{s: "1. Two runs", t: "Forward run and adjoint run in a waveguide device",
intu: "In a waveguide device the forward run launches the input mode and records two things: the field E<sub>fwd</sub> everywhere in the design region, at every frequency of interest, and the mode amplitude a at the output monitor. The adjoint run puts a mode source at the output monitor plane, in the same mode, pointing back into the device. Its complex amplitude at each frequency is set by ∂J/∂a. It records E<sub>adj</sub> in the design region. You never build the matrix A, Tidy3D sets up the adjoint source for you. Switch between the runs.",
eq: String.raw`<div class="eqnote">adjoint source: mode \(m\) at the monitor plane</div>\[ \text{amplitude} \propto \frac{\partial J}{\partial a_m(f)} \quad \text{at each frequency } f \]\[ \text{for } J = \sum_i w_i\, |a_m(f_i)|^2: \qquad \text{amplitude} \propto w_i\, a_m^{*}(f_i) \]`,
sym: [[String.raw`\(a_m(f)\)`, "complex amplitude of the target mode at the output monitor (Lesson 4)"], [String.raw`\(w_i\)`, "band weight of frequency f_i"], [String.raw`\(\mathbf{E}_{\mathrm{fwd}}, \mathbf{E}_{\mathrm{adj}}\)`, "electric fields recorded in the design region by the two runs"]],
how: ["The forward run is the normal simulation: it gives F.", "J depends on the fields only through a_m at the monitor.", "So ∂J/∂x is nonzero only on the monitor plane, with the shape of the mode: a mode source there.", "The conjugate amplitude is the 1D result of Lesson 2 card 4, now with the mode profile in place of a single point."],
say: "Tidy3D's adjoint run is a mode source at the output monitor, in the same mode, whose amplitude at each frequency is the derivative of J with respect to the mode amplitude.",
num: "A device with two input polarizations, like a polarization splitter, needs a forward and an adjoint run for each input, four runs per step.",
r(fig, ctl) {
  let m = "fwd"; ctl.innerHTML = btns([["fwd", "Forward run"], ["adj", "Adjoint run"]], "m");
  const u = () => {
    pick(ctl, "m", m);
    let s = `<rect x="20" y="118" width="190" height="34" fill="var(--blue-bg)" stroke="var(--blue)"/><rect x="470" y="118" width="190" height="34" fill="var(--blue-bg)" stroke="var(--blue)"/>`;
    const r = C3.rng(9); for (let j = 0; j < 9; j++) for (let i = 0; i < 13; i++) { const v = C3.clamp(0.5 + 0.8 * Math.sin(i * 0.9 + j * 0.4) * Math.cos(j * 0.8 - i * 0.3) + 0.2 * (r() - 0.5), 0, 1); s += `<rect x="${210 + i * 20}" y="${45 + j * 20}" width="20" height="20" fill="var(--blue)" fill-opacity="${(0.08 + 0.85 * v).toFixed(2)}"/>`; }
    s += `<rect x="210" y="45" width="260" height="180" fill="none" stroke="var(--p)" stroke-dasharray="5 4"/><text class="ts" x="340" y="38" text-anchor="middle">design region: ${m === "fwd" ? "record E_fwd(r, f)" : "record E_adj(r, f)"}</text>`;
    s += `<line x1="560" x2="560" y1="95" y2="175" stroke="#EF9F27" stroke-width="3"/><text class="ts" x="560" y="88" text-anchor="middle">output monitor</text>`;
    if (m === "fwd") s += `<line x1="70" x2="70" y1="95" y2="175" stroke="#378ADD" stroke-width="3"/><text class="ts" x="70" y="88" text-anchor="middle">mode source</text>` + arrow(80, 135, 150, 135, "#378ADD", 2.5) + arrow(480, 135, 548, 135, "#378ADD", 2.5) + `<text class="ts" x="560" y="195" text-anchor="middle">gives a_m(f) and F</text>`;
    else s += `<line x1="560" x2="560" y1="95" y2="175" stroke="#7F77DD" stroke-width="5"/>` + arrow(552, 135, 480, 135, "#7F77DD", 2.5) + `<text class="ts" x="560" y="195" text-anchor="middle">adjoint mode source, same mode</text><text class="ts" x="560" y="212" text-anchor="middle">amplitude ∝ ∂J/∂a_m(f)</text>`;
    fig.innerHTML = svg(240, s);
  };
  ctl.querySelectorAll("button").forEach(b => b.onclick = () => { m = b.dataset.m; u(); }); u();
}},

{s: "2. Many frequencies", t: "The sensitivity map summed over a band",
intu: "A broadband pulse gives all frequencies in one run, and the frequency monitors store the fields at the chosen frequencies (Chapter 2, Lesson 11). The sensitivity map is then a sum over frequencies of the field products. Below, the figure of merit is the weighted transmission of the 1D device over a band. Thin lines are the contribution of each wavelength, the bold line is their sum. The contributions often disagree in sign, which is exactly the trade-off between wavelengths that the optimizer has to resolve. Change the number of wavelengths and the band width.",
eq: String.raw`\[ \frac{\partial J}{\partial \varepsilon(\mathbf{r})} = \operatorname{Re} \sum_f \mathbf{E}_{\mathrm{fwd}}(\mathbf{r}, f) \cdot \mathbf{E}_{\mathrm{adj}}(\mathbf{r}, f) \]<div class="eqref">Ch. 3 Eq. (3.5), Tidy3D</div>`,
sym: [[String.raw`\(\varepsilon(\mathbf{r})\)`, "relative permittivity at point r"], [String.raw`\(\sum_f\)`, "sum over the recorded frequencies of the figure of merit"], [String.raw`\(\cdot\)`, "dot product of the vector fields (here 1D, a single component)"], ["constants", "the factors like −2k₀² of Lesson 2 are folded into the adjoint source amplitude"]],
how: ["Each frequency is an independent linear problem with its own A(f).", "So the gradient of a sum over frequencies is the sum of the gradients.", "Tidy3D puts all constant factors into the adjoint source, leaving the bare overlap.", "Michaels and Yablonovitch write the same result as 2ω Im{…} in their Eq. (13) with a different sign and time convention. Both give the same gradient, so do not mix the two forms."],
say: "The derivative with respect to the permittivity at a point is the real part of the forward and adjoint field product, summed over the frequencies of the figure of merit.",
num: "Example band here: wavelengths around 800 nm with Gaussian weights (Lesson 4). Five wavelengths need the same two simulations in the time domain, because one pulse covers them all.",
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

{s: "3. Follow the gradient", t: "A step along the gradient improves the figure of merit",
intu: "The sensitivity map says where to add and where to remove material. Take a small step of the pixel densities along it and the figure of merit goes up. Press the step button a few times and watch the design (stripe), the transmission spectrum and F at 800 nm. This is gradient ascent in its plainest form, without the filter, projection or Adam of later lessons, so the design stays grey.",
eq: String.raw`\[ \rho_i \leftarrow \rho_i + \alpha\, (\varepsilon_{\mathrm{GaAs}} - \varepsilon_{\mathrm{air}})\, \frac{\partial F}{\partial \varepsilon_i}, \qquad \text{clipped to } [0, 1] \]`,
sym: [[String.raw`\(\rho_i\)`, "density of pixel i, ε_i = ε_air + ρ_i(ε_GaAs − ε_air)"], [String.raw`\(\alpha\)`, "step size"], [String.raw`\(F\)`, "transmission at 800 nm, to be maximized here"]],
how: ["Compute F and its gradient with two solves.", "Chain rule: ∂F/∂ρ_i = (ε_GaAs − ε_air)∂F/∂ε_i.", "Move every pixel a little along its derivative.", "Repeat. For a small enough step, F increases every time."],
say: "Moving the design along the adjoint gradient increases the figure of merit, which is all an optimizer does, repeated many times.",
num: "Watch how the spectrum reshapes around 800 nm while other wavelengths are free to do anything, because only 800 nm is in F.",
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

{s: "4. At a boundary", t: "Which field components are continuous at a boundary",
intu: "When an outline moves, a thin sliver changes from air to GaAs. To evaluate the field product on that boundary you need field values that are well defined there. The tangential electric field E<sub>∥</sub> is continuous across the boundary. The normal electric field is not: it jumps by the ratio of permittivities, about 12 for GaAs and air. The normal displacement D<sub>⊥</sub> = εE<sub>⊥</sub> is continuous instead. So the boundary formula uses E<sub>∥</sub> and D<sub>⊥</sub>. Rotate the field and see which arrows match across the boundary.",
eq: String.raw`\[ \mathbf{E}_{\parallel}^{\mathrm{in}} = \mathbf{E}_{\parallel}^{\mathrm{out}}, \qquad D_{\perp}^{\mathrm{in}} = D_{\perp}^{\mathrm{out}} \quad\Longrightarrow\quad E_{\perp}^{\mathrm{out}} = \frac{\varepsilon_{\mathrm{in}}}{\varepsilon_{\mathrm{out}}}\, E_{\perp}^{\mathrm{in}} \]\[ \frac{\partial J}{\partial p_i} = \operatorname{Re} \sum_f \int_S \left[ \Delta\varepsilon\, \mathbf{E}_{\parallel,\mathrm{fwd}} \cdot \mathbf{E}_{\parallel,\mathrm{adj}} - \Delta(\varepsilon^{-1})\, D_{\perp,\mathrm{fwd}}\, D_{\perp,\mathrm{adj}} \right] v_{n,i}\, dS \]<div class="eqref">Ch. 3 Eq. (3.6)</div>`,
sym: [[String.raw`\(S\)`, "the boundary surface"], [String.raw`\(\Delta\varepsilon\)`, "change of ε across S, from outside to inside"], [String.raw`\(\Delta(\varepsilon^{-1})\)`, "change of 1/ε across S"], [String.raw`\(v_{n,i}\)`, "normal velocity of the boundary when p_i changes"], [String.raw`\(\mathbf{E}_{\parallel}, D_{\perp}\)`, "the continuous components"]],
how: ["Moving the boundary by δn over an area dS changes ε in a volume δn dS.", "For the tangential part, the pixel formula applies directly with the change Δε.", "For the normal part, the natural variable is D⊥, and the change of 1/ε plays the role of Δε, with a minus sign.", "Both are evaluated with continuous quantities, so it does not matter on which side of S the fields are sampled."],
say: "On a boundary Tidy3D evaluates the field overlap with the continuous components, Δε E∥·E∥ minus Δ(1/ε) D⊥D⊥, weighted by how fast the boundary moves.",
num: "GaAs/air: ε<sub>in</sub>/ε<sub>out</sub> = 12.19, so the normal E field outside is 12 times larger than inside. Sampling E⊥ on the wrong side would give a gradient wrong by an order of magnitude.",
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

{s: "5. A boundary gradient, checked", t: "Moving a slab boundary: formula versus finite difference",
intu: "In 1D at normal incidence the field is tangential to every interface, so only the Δε E<sub>∥</sub>·E<sub>∥</sub> term of Eq. (3.6) is present. A GaAs slab of thickness L sits in air. Its right boundary can move continuously because the boundary pixel is partly filled, which is the material averaging idea of Michaels and Yablonovitch. The slope dT/dL from the boundary formula (two solves) is drawn as the orange tangent on the T(L) curve. It matches the finite-difference slope. Move the thickness.",
eq: String.raw`\[ \begin{aligned} \frac{dT}{dL} &= \Delta\varepsilon \times \left(\frac{\partial T}{\partial \varepsilon} \text{ per unit length}\right) \text{ at the boundary} \\ &= \Delta\varepsilon \cdot \left[ -2k_0^2 \operatorname{Re}\{ E_{\mathrm{adj}} E_{\mathrm{fwd}} \} \right]_{\mathrm{boundary}} / \Delta \end{aligned} \]`,
sym: [[String.raw`\(L\)`, "slab thickness, moved at its right boundary"], [String.raw`\(\Delta\varepsilon\)`, "ε_GaAs − ε_air = 11.19"], [String.raw`\(\Delta\)`, "grid step, 10 nm"], [String.raw`\(v_n\)`, "here 1: the boundary moves by exactly dL"]],
how: ["The boundary pixel holds a fraction f of GaAs: ε = ε_air + fΔε.", "So L = (n + f)Δ changes continuously with f.", "Moving the boundary by dL changes the fill of that pixel by dL/Δ.", "The gradient is the pixel formula times Δε/Δ, evaluated at the boundary: the 1D version of Eq. (3.6)."],
say: "The boundary gradient is the same forward-adjoint overlap, evaluated on the boundary and multiplied by how fast the boundary moves.",
num: "The T(L) curve shows the Fabry-Perot oscillation of the slab: its period is λ/(2n) ≈ 115 nm at 800 nm.",
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

{s: "6. Autograd", t: "From the Python function to the gradient of every parameter",
intu: "In practice the geometry, the simulation and the figure of merit are written as one Python function. Tidy3D's automatic differentiation records every operation. Asking for the gradient runs the forward simulation, builds the adjoint source, runs the adjoint simulation, evaluates the pixel or boundary formula, and carries the result back through the parameterization by the chain rule. Penalties depend only on the geometry, so their gradient comes from the chain rule alone, with no simulation. Step through the forward pass and the backward pass.",
eq: String.raw`\[ \frac{\partial J}{\partial p_j} = \sum_{\mathbf{r}} \frac{\partial J}{\partial \varepsilon(\mathbf{r})} \cdot \frac{\partial \varepsilon(\mathbf{r})}{\partial p_j} - \sum_k w_k \frac{\partial P_k}{\partial p_j} \]`,
sym: [[String.raw`\(\partial \varepsilon(\mathbf{r})/\partial p_j\)`, "how the permittivity map depends on parameter j: through tanh bounds, filter and projection, or boundary moves (Lessons 5 to 7)"], [String.raw`\(\partial J/\partial \varepsilon(\mathbf{r})\)`, "from the two simulations (Eq. 3.5 or 3.6)"], [String.raw`\(\partial P_k/\partial p_j\)`, "penalty gradient, pure geometry"]],
how: ["Forward pass: p → bounded geometry → ε(r) → forward FDTD → a_m(f) → J.", "Backward pass: ∂J/∂a_m → adjoint source → adjoint FDTD → ∂J/∂ε(r).", "Chain rule back through ε(r; p) to ∂J/∂p.", "Add the penalty gradients, which need no simulation."],
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
    const notes = ["start from the parameters", "bound and smooth them (Lessons 5 to 7)", "build the permittivity map", "first simulation", "project onto the target mode (Lesson 4)", "objective with penalties", "seed the backward pass with ∂J/∂J = 1", "derivative with respect to each mode amplitude", "second simulation, adjoint source at the monitor", "field overlap, Eq. 3.5 or 3.6", "back through filter, projection and tanh", "the gradient the optimizer uses"];
    s += `<text class="ts" x="340" y="235" text-anchor="middle">${notes[k]}</text>`;
    fig.innerHTML = svg(250, s); $("b").disabled = k === 0; $("n").disabled = k === nS - 1;
  };
  $("b").onclick = () => { k--; u(); }; $("n").onclick = () => { k++; u(); }; u();
}}
],
summary: "Tidy3D evaluates the adjoint gradient with two time-domain runs per input. The forward run records E_fwd in the design region and the output mode amplitudes. The adjoint run is a mode source at the output monitor in the same mode, with amplitude ∂J/∂a_m at each frequency, and records E_adj. For a pixel map, ∂J/∂ε(r) = Re Σ_f E_fwd·E_adj, with all constants folded into the adjoint source. For boundaries, the overlap is taken on the boundary with the continuous components, Δε E∥·E∥ − Δ(1/ε) D⊥D⊥, times the normal velocity of the boundary. Autograd then applies the chain rule back through the parameterization, and penalties add their gradients without any simulation.",
sheet: [
[String.raw`\[ \frac{\partial J}{\partial \varepsilon(\mathbf{r})} = \operatorname{Re} \sum_f \mathbf{E}_{\mathrm{fwd}}(\mathbf{r}, f) \cdot \mathbf{E}_{\mathrm{adj}}(\mathbf{r}, f) \]`, "Pixel sensitivity (Ch. 3 Eq. 3.5, Tidy3D)"],
[String.raw`\[ \frac{\partial J}{\partial p_i} = \operatorname{Re} \sum_f \int_S \left[ \Delta\varepsilon\, \mathbf{E}_{\parallel} \cdot \mathbf{E}_{\parallel} - \Delta(\varepsilon^{-1})\, D_{\perp} D_{\perp} \right] v_{n,i}\, dS \]`, "Boundary sensitivity (Ch. 3 Eq. 3.6, Tidy3D)"],
[String.raw`\[ \text{adjoint source amplitude} \propto \frac{\partial J}{\partial a_m(f)} \]`, "Mode source at the output monitor, same mode"],
[String.raw`\[ \mathbf{E}_{\parallel} \text{ and } D_{\perp} = \varepsilon E_{\perp} \text{ continuous across a boundary} \]`, "Why the boundary formula uses them"],
[String.raw`\[ \frac{\partial J}{\partial \mathbf{p}} = \sum_{\mathbf{r}} \frac{\partial J}{\partial \varepsilon(\mathbf{r})} \frac{\partial \varepsilon(\mathbf{r})}{\partial \mathbf{p}} - \sum_k w_k \frac{\partial P_k}{\partial \mathbf{p}} \]`, "Chain rule done by autograd"]],
consts: "1D demos: grid step 10 nm, ε between 1 and 12.19. Tidy3D version 2.11.2.",
sources: ["Flexcompute, Tidy3D 2.11.2 source: derivative_map_E, medium derivatives, _evaluate_dielectric_gradient_at_points, polyslab, ModeData._adjoint_source_amp", "Michaels and Yablonovitch, Opt. Express 26, 31717 (2018) (adjoint fields as the output run backwards, Eq. 13 convention, material averaging on a grid)"]
});

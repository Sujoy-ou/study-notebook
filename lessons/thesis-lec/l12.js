addLesson("fdtd", "lec", {
level: "Gradient", num: "Lesson 12",
id: "thesis-lec-l12", title: "The adjoint run and the gradient", short: "12. Adjoint run and gradient",
big: String.raw`The adjoint run is an ordinary FDTD run of the same device, with the adjoint source at the port instead of the mode source at the input. It stores the adjoint field in the design region. At every pixel, the product of the forward field and the adjoint field, summed over the 101 frequencies, is the slope of the figure of merit with respect to that pixel's permittivity. The chain rule then carries it back through the projection and the filter to each density. Both input polarizations contribute. The result is one gradient map of 220 by 220 values.`,
bridge: "Thesis Ch. 3 Sec. 3.2, Eq. (3.5): the sensitivity is \\(\\mathrm{Re}\\sum_f \\mathbf{E}_\\mathrm{fwd}\\cdot\\mathbf{E}_\\mathrm{adj}\\), with the constant factors in the adjoint source amplitude (Tidy3D convention). The chain rule through Eqs. (3.8) to (3.10) is done by Tidy3D's automatic differentiation.",
cards: [
{s: "1. See it live", t: "Forward field times adjoint field = gradient",
intu: String.raw`A live calculation on the 2D toy splitter (one polarization, target: the upper port). Left: \(|E|\) of the forward run, light from the input. Right: \(|E|\) of the adjoint run, the port mode sent back from the upper port. Bottom: the gradient on every pixel of the design box, from those two runs only. Red: adding material raises the transmission into the upper port. Blue: removing it does. Press the check button: a few pixels are nudged up and down with separate runs, and the slopes agree within a few percent.`,
eq: String.raw`\[ \frac{\partial J}{\partial \varepsilon(\mathbf{r})} = \mathrm{Re}\sum_{f} \mathbf{E}_\mathrm{fwd}(\mathbf{r},f)\cdot\mathbf{E}_\mathrm{adj}(\mathbf{r},f) \]<div class="eqref">Ch. 3 Eq. (3.5)</div>`,
sym: [[String.raw`\(\mathbf{E}_\mathrm{fwd}\)`, "forward field in the design region"], [String.raw`\(\mathbf{E}_\mathrm{adj}\)`, "adjoint field in the design region"], [String.raw`\(\sum_f\)`, "sum over the stored frequencies (one here, 101 for the PBS)"]],
how: ["Forward run: store the field on the design region.", "Measure the port amplitude a.", String.raw`Adjoint run: port mode sent back with amplitude \(a^{*}\) (times the constant factor).`, "Multiply the two fields at every pixel: the gradient map."],
say: "The gradient at each pixel is the product of the forward and adjoint fields there, summed over the frequencies, so two runs give the sensitivity of every pixel at once.",
num: "Toy: 50 × 50 = 2500 design pixels, 2 runs for the whole map. Finite differences: 5000 runs.",
r(fig, ctl) {
  ctl.innerHTML = `<div class="row"><button id="fd">Check 4 pixels by finite differences</button></div><div class="readout" id="ro"></div><div id="fdo" class="note"></div>`;
  fig.innerHTML = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><div><p class="note" style="margin:0">forward |E|</p><div id="mf"></div></div><div><p class="note" style="margin:0">adjoint |E|</p><div id="ma"></div></div></div><div style="display:grid;grid-template-columns:auto 1fr;gap:12px;align-items:start;margin-top:8px"><div><p class="note" style="margin:0">gradient on the design pixels</p><div id="mg"></div></div><div id="mtxt" class="note"></div></div>`;
  const T = LC.toy(); let rho = LC.toyStart(T); LC.toyApply(T, rho);
  const r = LC.toyGrad(T);
  LC.map($("mf"), T.nx, T.ny, LC.toyAbs(T, r.f), "abs", 1.65);
  LC.map($("ma"), T.nx, T.ny, LC.toyAbs(T, r.y), "abs", 1.65);
  LC.map($("mg"), T.W, T.H, r.g, "sign", 4);
  $("mtxt").innerHTML = "Red: add material. Blue: remove material. White: little effect.<br>The square is the design region of the toy (50 × 50 pixels), upper port at the top.";
  $("ro").innerHTML = `<div><span>transmission to the upper port</span><b>${r.F.toFixed(3)}</b></div><div><span>runs used</span><b>2</b></div><div><span>slopes obtained</span><b>2500</b></div>`;
  $("fd").onclick = () => {
    $("fdo").textContent = "Running 8 extra simulations, about 5 seconds...";
    setTimeout(() => {
      if (!fig.isConnected) return;
      const pts = [[10, 20], [25, 10], [40, 15], [30, 40]], d = 0.05, rows = [];
      for (const [i, j] of pts) {
        const q = (T.yc - 25 + j) * T.nx + T.d0 + i, e0 = T.eps[q];
        T.eps[q] = e0 + d; const ap = LC.toyOverlap(T, LC.toyRun(T, T.src, T.yc, [1, 0], 3000), T.yc - T.dy);
        T.eps[q] = e0 - d; const am = LC.toyOverlap(T, LC.toyRun(T, T.src, T.yc, [1, 0], 3000), T.yc - T.dy); T.eps[q] = e0;
        const fd = ((ap[0] ** 2 + ap[1] ** 2) - (am[0] ** 2 + am[1] ** 2)) / (2 * d) / T.ref;
        const ad = r.g[j * T.W + i]; rows.push(`pixel (${i}, ${j}): finite difference ${fd.toExponential(2)}, adjoint ${ad.toExponential(2)}, difference ${(100 * Math.abs(ad - fd) / Math.abs(fd)).toFixed(0)} %`);
      }
      $("fdo").innerHTML = rows.join("<br>");
    }, 30);
  };
}},
{s: "2. Back to the pixel", t: "The chain rule from permittivity to density",
intu: String.raw`Card 1 gives the slope with respect to the permittivity of each cell. The optimizer changes densities, not permittivities. Step through the chain: permittivity from the projected density (a constant factor), projected from filtered density (the slope of the tanh step), filtered from raw density (the filter weights, spreading each slope over the neighbours). Tidy3D's automatic differentiation does this for you. It also adds the gradient of the fabrication penalty, which needs no simulation.`,
eq: String.raw`\[ \frac{\partial J}{\partial \rho_i} = \sum_k \frac{\partial J}{\partial \varepsilon_k}\,\frac{\partial \varepsilon_k}{\partial \hat\rho_k}\,\frac{\partial \hat\rho_k}{\partial \tilde\rho_k}\,\frac{\partial \tilde\rho_k}{\partial \rho_i} \]`,
sym: [[String.raw`\(\partial\varepsilon/\partial\hat\rho\)`, String.raw`\(\varepsilon_\mathrm{GaAs} - \varepsilon_\mathrm{air} \approx 11.19\)`], [String.raw`\(\partial\hat\rho/\partial\tilde\rho\)`, "slope of the projection, large near 0.5 when β is large"], [String.raw`\(\partial\tilde\rho_k/\partial\rho_i\)`, "filter weight between pixels i and k"]],
how: ["Slope with respect to permittivity: Eq. (3.5), from the two runs.", "Times 11.19: from Eq. (3.10).", "Times the projection slope: from Eq. (3.9).", "Spread back through the filter: from Eq. (3.8)."],
say: "The field overlap gives the slope with respect to permittivity, and the chain rule through the linear map, the projection and the filter turns it into the slope with respect to each density.",
num: String.raw`\(\varepsilon_\mathrm{GaAs} - \varepsilon_\mathrm{air} = 12.19 - 1 = 11.19\). Filter radius 11 pixels.`,
r(fig, ctl) {
  const T = [
    [String.raw`\frac{\partial J}{\partial \varepsilon_k} = \mathrm{Re}\sum_f \mathbf{E}_\mathrm{fwd}\cdot\mathbf{E}_\mathrm{adj}\Big|_k`],
    [String.raw`\varepsilon_k = \varepsilon_\mathrm{air} + \hat\rho_k(\varepsilon_\mathrm{GaAs} - \varepsilon_\mathrm{air}) \;\Rightarrow\; \frac{\partial \varepsilon_k}{\partial \hat\rho_k} = \varepsilon_\mathrm{GaAs} - \varepsilon_\mathrm{air}`],
    [String.raw`\frac{\partial \hat\rho_k}{\partial \tilde\rho_k} = \frac{\beta\,\big[1 - \tanh^2\big(\beta(\tilde\rho_k - \eta)\big)\big]}{\tanh(\beta\eta) + \tanh\big(\beta(1-\eta)\big)}`],
    [String.raw`\frac{\partial \tilde\rho_k}{\partial \rho_i} = \frac{K(d_{ki})}{\sum_j K(d_{kj})} \;\Rightarrow\; \frac{\partial J}{\partial \rho_i} = \sum_k (\ldots)\,\frac{K(d_{ki})}{\sum_j K(d_{kj})}`]
  ];
  const cap = ["From the forward and adjoint runs: slope with respect to each cell's permittivity.", "Permittivity is linear in the projected density.", "The projection slope: steep near the threshold, flat near 0 and 1.", "The filter spreads each slope back over the raw densities within the radius."];
  LC.steps(ctl, 4, k => { LC.mathFig(fig, T[k]); return cap[k]; });
}},
{s: "3. Sum it all", t: "101 wavelengths and two polarizations, one map",
intu: String.raw`Step through. Each wavelength gives its own field product, a sensitivity map. The adjoint amplitudes \(w_j a_j^{*}\) already contain the weights, so the maps simply add up over the 101 wavelengths. Tidy3D does this sum inside one broadband adjoint run. The TE pair of runs gives one map and the TM pair another. Their sum is the gradient of the full figure of merit: one number per pixel, a 220 by 220 image.`,
eq: String.raw`\[ \frac{\partial J}{\partial \rho_i} = \underbrace{\sum_{j=1}^{101} g_i^\mathrm{TE}(\lambda_j)}_{\text{TE runs}} + \underbrace{\sum_{j=1}^{101} g_i^\mathrm{TM}(\lambda_j)}_{\text{TM runs}} \]`,
sym: [[String.raw`\(g_i(\lambda_j)\)`, "contribution of wavelength j to the slope of pixel i, weights included"]],
how: ["Each wavelength: forward field times adjoint field at every pixel.", "Add the 101 maps (weights are in the adjoint amplitudes).", "Add the TE and TM results.", "Chain rule back to the densities (card 2)."],
say: "The gradient used by the optimizer is the sum of the field-product maps over the 101 wavelengths and over the TE and TM runs, one value per pixel.",
num: "4 runs per step: TE forward, TE adjoint, TM forward, TM adjoint. Output: 48,400 slopes.",
r(fig, ctl) {
  const cap = ["One wavelength, TE: a sensitivity map over the design region.", "All 101 wavelengths of the TE runs, added.", "The same for the TM runs.", "TE plus TM: the gradient of the full figure of merit, one value per pixel."];
  LC.steps(ctl, 4, k => {
    let s = "";
    const tile = (x, y, lab, on, col) => `<g opacity="${on ? 1 : 0.25}"><rect x="${x}" y="${y}" width="70" height="70" fill="var(--${col}-bg)" stroke="var(--${col})"/><text class="ts" x="${x + 35}" y="${y + 86}" text-anchor="middle">${lab}</text></g>`;
    ["λ1", "λ2", "…", "λ101"].forEach((l, i) => s += tile(20 + i * 80, 20, "TE " + l, k >= (i === 0 ? 0 : 1), "blue"));
    ["λ1", "λ2", "…", "λ101"].forEach((l, i) => s += tile(20 + i * 80, 140, "TM " + l, k >= 2, "purple"));
    s += `<g opacity="${k >= 3 ? 1 : 0.25}">${arrow(345, 55, 440, 110, "var(--p)", 1.6)}${arrow(345, 175, 440, 130, "var(--p)", 1.6)}<rect x="450" y="70" width="100" height="100" fill="var(--coral-bg)" stroke="var(--coral)" stroke-width="2"/><text class="th" x="500" y="124" text-anchor="middle">∂J/∂ρ</text><text class="ts" x="500" y="188" text-anchor="middle">220 × 220 values</text></g>`;
    fig.innerHTML = svg(240, s);
    return cap[k];
  });
}}
],
summary: String.raw`The adjoint run is the same FDTD with the port mode sent backwards. At each pixel, \(\mathrm{Re}\sum_f \mathbf{E}_\mathrm{fwd}\cdot\mathbf{E}_\mathrm{adj}\) (Eq. 3.5) is the slope of the figure of merit with respect to that cell's permittivity, and the chain rule through Eqs. (3.10), (3.9) and (3.8) turns it into the slope for each density. Summing over the 101 wavelengths and the TE and TM runs gives one gradient map of 48,400 values from four runs. A finite-difference check on a few pixels confirms it.`,
sheet: [
[String.raw`\[ \frac{\partial J}{\partial \varepsilon(\mathbf{r})} = \mathrm{Re}\sum_f \mathbf{E}_\mathrm{fwd}\cdot\mathbf{E}_\mathrm{adj} \]`, "Sensitivity (Ch. 3 Eq. 3.5)"],
[String.raw`\[ \frac{\partial J}{\partial \rho_i} = \sum_k \frac{\partial J}{\partial \varepsilon_k}\frac{\partial \varepsilon_k}{\partial \hat\rho_k}\frac{\partial \hat\rho_k}{\partial \tilde\rho_k}\frac{\partial \tilde\rho_k}{\partial \rho_i} \]`, "Chain rule to the densities"]],
consts: "Toy: 2D, 160 × 100 cells, strips of index 2, λ = 30 cells. The constant factor of the adjoint source was calibrated once against finite differences, as Tidy3D folds such constants into its adjoint source.",
sources: ["Lalau-Keraly, Bhargava, Miller and Yablonovitch, Opt. Express 21, 21693 (2013), Eq. (5)", "Tidy3D documentation: automatic differentiation (adjoint), Flexcompute", "Ch. 3 Sec. 3.2 and 3.3 of the thesis"]
});

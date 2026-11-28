addLesson("fdtd", "qs", {
level: "Questions", num: "Your questions",
id: "thesis-lec-q1", title: "Questions asked along the way", short: "Your questions",
labels: { intu: "The answer, in plain words", how: "Step by step", note: "Short answer for the committee" },
big: String.raw`These are the questions that came up while learning the series, in the order they were asked, each with a plain answer, a visual and a short version to say at the defense. They connect the lessons: how the adjoint source is defined, how a time-domain solver relates to the frequency-domain system \(A\mathbf{x} = \mathbf{b}\), why that system needs a source, what \(A\), \(\mathbf{x}\), \(\mathbf{b}\) and \(\mathbf{p}\) are, and how one FDTD run moves step by step. New questions are added here as they come.`,
bridge: "The lessons behind these answers: Lessons 1 to 9 for the setup and the forward run, Lessons 10 to 12 for the adjoint method, plus Chapter 3 Lessons 2 and 3 of this shelf.",
cards: [
{s: "Q1. Adjoint source", t: "How is the adjoint source defined?",
intu: String.raw`It is not chosen. It falls out of the algebra. The gradient contains the product \((\partial F/\partial\mathbf{x})\,A^{-1}\,(\partial A/\partial p_i)\,\mathbf{x}\). The first two factors do not depend on which parameter \(i\) we ask about. Compute them once and call the result \(\mathbf{y}^T\). That gives a second Maxwell problem whose source is \((\partial F/\partial\mathbf{x})^T\), the sensitivity of the figure of merit to the fields. Where \(F\) does not look at the field, this source is zero, so the adjoint source sits on the output monitor plane. For a mode-power objective it is the output mode, sent backwards into the device, with the conjugate of the forward amplitude. Step through the derivation, and the last step shows both fields in a 1D device.`,
eq: String.raw`\[ A^{T}\mathbf{y} = \left(\frac{\partial F}{\partial \mathbf{x}}\right)^{T} \]<div class="eqnote">for \(F = |a|^2\) with mode amplitude \(a = \mathbf{c}^T\mathbf{x}\):</div>\[ \mathbf{b}_\mathrm{adj} = a^{*}\,\mathbf{c} \]<div class="eqref">Ch. 3 Eq. (3.3), Michaels Eq. 11</div>`,
sym: [[String.raw`\(\mathbf{y}\)`, "adjoint field"], [String.raw`\(\partial F/\partial\mathbf{x}\)`, "how the figure of merit changes with each field value: the adjoint source"], [String.raw`\(\mathbf{c}\)`, "overlap weights built from the output mode profile on the monitor plane"], [String.raw`\(a^{*}\)`, "complex conjugate of the forward mode amplitude"]],
how: [String.raw`Gradient by the chain rule: \(dF/dp_i = -2\,\mathrm{Re}\{(\partial F/\partial\mathbf{x})A^{-1}(\partial A/\partial p_i)\mathbf{x}\}\).`, String.raw`Group the first two factors: \(\mathbf{y}^T = (\partial F/\partial\mathbf{x})A^{-1}\), the same for every \(i\).`, String.raw`Multiply by \(A\) and transpose: \(A^T\mathbf{y} = (\partial F/\partial\mathbf{x})^T\). Its right side is the adjoint source.`, String.raw`For a mode overlap \(a = \mathbf{c}^T\mathbf{x}\) and \(F = |a|^2\): \(\partial F/\partial\mathbf{x} = a^{*}\mathbf{c}^T\). A current sheet shaped like the mode launches that mode, so the adjoint run sends the output mode back into the device with amplitude \(a^{*}\).`, String.raw`Reciprocal materials give \(A^T = A\), so the adjoint run is an ordinary simulation of the same device with this new source.`],
say: String.raw`The adjoint source is the derivative of the figure of merit with respect to the fields. For a mode-power objective it is the output mode launched backwards from the monitor plane, with the conjugate of the forward amplitude.`,
num: String.raw`Penalty terms depend only on the parameters, not on the fields, so they add nothing to the adjoint source. Their gradient is computed directly.`,
note: String.raw`<p>"The adjoint source is \((\partial F/\partial\mathbf{x})^T\). It appears when the gradient is regrouped so that the part that does not depend on the parameter is computed once. My figure of merit is the power in the output mode, so the adjoint source is that mode launched backwards from the output monitor, with amplitude equal to the conjugate of the forward mode amplitude. Tidy3D sets this up automatically."</p>`,
r(fig, ctl) {
  const T = [
    [String.raw`\frac{dF}{dp_i} = -2\,\mathrm{Re}\Big\{ \frac{\partial F}{\partial \mathbf{x}}\, A^{-1}\, \frac{\partial A}{\partial p_i}\, \mathbf{x} \Big\}`],
    [String.raw`\frac{dF}{dp_i} = -2\,\mathrm{Re}\Big\{ \underbrace{\frac{\partial F}{\partial \mathbf{x}}\, A^{-1}}_{\mathbf{y}^T,\ \text{no } i}\; \frac{\partial A}{\partial p_i}\, \mathbf{x} \Big\}`],
    [String.raw`\mathbf{y}^T A = \frac{\partial F}{\partial \mathbf{x}} \quad\Rightarrow\quad A^T\mathbf{y} = \underbrace{\left(\frac{\partial F}{\partial \mathbf{x}}\right)^T}_{\text{adjoint source}}`],
    [String.raw`F = |a|^2 = a\,a^{*}, \qquad a = \mathbf{c}^T\mathbf{x}`, String.raw`\frac{\partial F}{\partial \mathbf{x}} = a^{*}\,\mathbf{c}^T \quad\Rightarrow\quad \mathbf{b}_\mathrm{adj} = a^{*}\,\mathbf{c}`]
  ];
  const cap = ["Start from the gradient (Lesson 11 derives it).", "The first two factors do not depend on the parameter. Compute them once.", "That defines a second linear system. Its right side is the adjoint source.", "For a mode overlap, the source is the mode weights times the conjugated forward amplitude: the output mode sent back.", "A 1D device. Forward source on the left, adjoint source at the output probe. The bars are the gradient for every pixel, from these two solves only."];
  const dev = new C3.Dev1D({ Nd: 60, pad: 30 }), r = C3.rng(11), rho = C3.filter1D(Float64Array.from({ length: 60 }, () => r()), 2).map(v => v > 0.5 ? 1 : 0);
  LC.steps(ctl, 5, k => {
    if (k < 4) { LC.mathFig(fig, T[k]); return cap[k]; }
    const res = dev.T(rho, 800, true), N = dev.N, xs = [...Array(N).keys()], ab = f => xs.map(i => Math.hypot(f.re[i], f.im[i]));
    const fA = ab(res.fwd), aA = ab(res.adj), mf = Math.max(...fA), ma = Math.max(...aA), mg = Math.max(...res.grad.map(Math.abs)) || 1;
    const X0 = 60, W = 580, X = i => X0 + i / (N - 1) * W, dxp = W / (N - 1);
    let s = C3.stripe(X(dev.pad) - dxp / 2, 8, dev.Nd * dxp, 16, rho);
    s += `<text class="ts" x="20" y="60">forward</text>` + plot(X0, 32, W, 58, xs, fA, 0, N - 1, 0, mf, "var(--blue)", 2);
    s += `<text class="ts" x="20" y="130">adjoint</text>` + plot(X0, 100, W, 58, xs, aA, 0, N - 1, 0, ma, "var(--purple)", 2);
    s += `<line x1="${X(dev.src)}" x2="${X(dev.src)}" y1="28" y2="160" stroke="var(--blue)" stroke-dasharray="3 3"/><text class="ts" x="${X(dev.src)}" y="176" text-anchor="middle">forward source</text>`;
    s += `<line x1="${X(dev.out)}" x2="${X(dev.out)}" y1="28" y2="160" stroke="var(--purple)" stroke-dasharray="3 3"/><text class="ts" x="${X(dev.out)}" y="176" text-anchor="end">adjoint source = a* at the probe</text>`;
    s += `<line x1="${X0}" x2="${X0 + W}" y1="225" y2="225" stroke="var(--b)"/><text class="ts" x="20" y="215">∂F/∂εᵢ</text>`;
    for (let i = 0; i < dev.Nd; i++) { const v = res.grad[i] / mg, x = X(dev.pad + i) - dxp * 0.4; s += `<rect x="${x}" y="${v > 0 ? 225 - v * 36 : 225}" width="${dxp * 0.8}" height="${Math.abs(v) * 36}" fill="${v > 0 ? "var(--coral)" : "var(--blue)"}"/>`; }
    fig.innerHTML = svg(268, s);
    return cap[4];
  });
}},

{s: "Q2. Time or frequency?", t: "FDTD solves the time-domain equations. So where does A x = b come from?",
intu: String.raw`FDTD really does solve the time-domain equations, step by step. It never builds the matrix \(A\). But the two descriptions give the same answer. Follow the two paths. Upper path: step the curl equations in time and let the monitors take a running Fourier transform. Lower path: Fourier transform the equations first (\(\partial/\partial t \to -i\omega\)), put them on the grid, and you have \(A(\omega)\mathbf{x} = \mathbf{b}\). Both end at the same field at each frequency. So \(A\mathbf{x} = \mathbf{b}\) is what we use on paper to derive the adjoint method, and FDTD is the tool that gets \(\mathbf{x}\) without ever writing \(A\) down.`,
eq: String.raw`\[ \text{time domain} \xrightarrow{\ \partial/\partial t\ \to\ -i\omega\ } \text{frequency domain} \xrightarrow{\ \text{grid}\ } A(\omega)\,\mathbf{x} = \mathbf{b} \]`,
sym: [["FDTD", "what the computer runs"], [String.raw`\(A\mathbf{x} = \mathbf{b}\)`, "what the theory uses"], ["DFT monitor", "running Fourier sum that turns the time signal into x at each frequency"]],
how: ["Linear materials that do not change in time treat each frequency separately (Lesson 8).", "So the Fourier transform of the FDTD fields at one frequency solves the frequency-domain equation at that frequency.", "On the grid that equation is the matrix system.", "Exactly speaking, the time step adds a small numerical dispersion: the discrete system matches at a slightly shifted frequency, negligible at the time steps used."],
say: String.raw`FDTD steps the time-domain equations, and the Fourier-transformed result at each frequency is the solution of \(A\mathbf{x} = \mathbf{b}\), so the adjoint method derived for \(A\mathbf{x} = \mathbf{b}\) applies to FDTD fields at each frequency.`,
num: String.raw`One FDTD run gives \(\mathbf{x}\) at all 101 wavelengths of the band, the same as 101 frequency-domain solves.`,
note: String.raw`<p>"Tidy3D solves the time-domain Maxwell equations. Because the equations are linear and the permittivity does not change in time, each frequency is independent. Fourier transforming gives the frequency-domain equations, which on the grid are \(A\mathbf{x} = \mathbf{b}\). The adjoint derivation is done in that picture, and FDTD with DFT monitors provides \(\mathbf{x}\) and \(\mathbf{y}\) at every design frequency."</p>`,
r(fig, ctl) {
  const cap = ["Start from the time-domain curl equations of Lesson 1.", "Upper path: FDTD steps them forward in time. No matrix is built.", "The monitors keep a running Fourier sum, which gives the field at each chosen frequency.", String.raw`Lower path: replace \(\partial/\partial t\) by \(-i\omega\) to get the frequency-domain equation.`, String.raw`Put it on the same grid: the linear system \(A(\omega)\mathbf{x} = \mathbf{b}\).`, "Both paths end at the same field x at each frequency. Theory on the lower path, computation on the upper path."];
  LC.steps(ctl, 6, k => {
    let s = LC.box(10, 95, 140, 60, ["time-domain", "curl equations"], "gray", false);
    s += LC.box(200, 20, 150, 56, ["FDTD", "step in time"], "teal", k < 1) + LC.box(400, 20, 150, 56, ["DFT monitor", "running Fourier sum"], "teal", k < 2);
    s += LC.box(200, 174, 150, 56, ["frequency domain", "∂/∂t → −iω"], "blue", k < 3) + LC.box(400, 174, 150, 56, ["on the grid", "A(ω) x = b"], "blue", k < 4);
    s += LC.box(590, 95, 80, 60, ["x(ω)", "same field"], "coral", k < 5);
    if (k >= 1) s += arrow(150, 112, 198, 56, "var(--teal)", 1.8); if (k >= 2) s += arrow(350, 48, 398, 48, "var(--teal)", 1.8); if (k >= 5) s += arrow(550, 48, 625, 93, "var(--teal)", 1.8);
    if (k >= 3) s += arrow(150, 140, 198, 196, "var(--blue)", 1.8); if (k >= 4) s += arrow(350, 202, 398, 202, "var(--blue)", 1.8); if (k >= 5) s += arrow(550, 202, 625, 157, "var(--blue)", 1.8);
    s += `<text class="ts" x="375" y="100" text-anchor="middle" opacity="${k >= 1 ? 1 : 0.3}">what the computer runs</text><text class="ts" x="375" y="162" text-anchor="middle" opacity="${k >= 3 ? 1 : 0.3}">what the theory uses</text>`;
    fig.innerHTML = svg(240, s);
    return cap[k];
  });
}},

{s: "Q3. Why a source?", t: "Why does the frequency-domain equation need a source? Isn't it source-free?",
intu: String.raw`Both forms need a source. The textbook form of the curl equations is written without one, because it describes the region away from the source. Something still has to create the light. Slide the source strength. The field is exactly proportional to it, because the equation is linear. At zero source the field is zero everywhere: with absorbing boundaries the matrix is invertible, so \(A\mathbf{x} = \mathbf{0}\) has only \(\mathbf{x} = \mathbf{0}\). The source-free equation does have nonzero solutions in one special case: a straight waveguide at special \(\beta\), the modes. That eigenproblem is what the mode solver solves (Lesson 3, card 1).`,
eq: String.raw`\[ A\mathbf{x} = \mathbf{0} \;\Rightarrow\; \mathbf{x} = A^{-1}\mathbf{0} = \mathbf{0} \]\[ A\mathbf{x} = \mathbf{b} \;\Rightarrow\; \mathbf{x} \propto \mathbf{b} \]`,
sym: [[String.raw`\(\mathbf{b}\)`, "source vector, nonzero only on the source plane"], ["invertible", "absorbing boundaries remove every source-free steady state"]],
how: ["Time domain: fields that start at zero with no source stay zero (Lesson 1).", "Frequency domain: there are no initial conditions, so the source must appear in the equation itself.", "Linear: double the source, double the field.", "Source-free with a special β in a straight waveguide: the modes, found by the mode solver before the run."],
say: "Without a source, Maxwell's equations allow only zero field or the special mode solutions of an eigenproblem. To drive the device a source current is added on the source plane, which is the b in A x = b.",
num: "This 1D solve: 10 nm cells, a 600 nm slab with n = 3.5, source on the left. The forward run uses the input mode as its b, the adjoint run uses the output mode sent back.",
note: String.raw`<p>"The equation in the thesis is written source-free because it describes the region away from the source. In the simulation the source current on the input plane is the right-hand side \(\mathbf{b}\). Without it the only solution is zero field, apart from the modes of a straight waveguide, which the mode solver finds."</p>`,
r(fig, ctl) {
  ctl.innerHTML = sl("qa", "Source strength", 0, 1, 0.05, 0.6) + `<div class="readout" id="ro"></div>`;
  const N = 300, src = 30, eps = new Float64Array(N).fill(1); for (let i = 120; i < 180; i++) eps[i] = 12.25;
  const b1 = new Float64Array(N); b1[src] = 1 / 10; const f1 = C3.helm(eps, 800, 10, b1), m1 = Math.max(...[...Array(N).keys()].map(i => Math.hypot(f1.re[i], f1.im[i])));
  const u = () => {
    const A = +$("qa").value; $("qav").textContent = A.toFixed(2);
    const xs = [...Array(N).keys()], ab = xs.map(i => A * Math.hypot(f1.re[i], f1.im[i]));
    let s = `<rect x="${50 + 120 / (N - 1) * 400}" y="30" width="${60 / (N - 1) * 400}" height="150" fill="var(--blue-bg)"/>` + plot(50, 30, 400, 150, xs, ab, 0, N - 1, 0, m1 * 1.05, "var(--coral)", 2);
    const X = 50 + src / (N - 1) * 400; s += `<line x1="${X}" x2="${X}" y1="30" y2="180" stroke="var(--purple)" stroke-dasharray="4 3"/><text class="ts" x="${X}" y="24" text-anchor="middle">source</text><text class="ts" x="250" y="200" text-anchor="middle">|E| along the line</text>`;
    s += C3.frame(500, 30, 150, 150, 0, 1, 0, m1 * 1.05, [0, 1], [], "source", "largest |E|") + plot(500, 30, 150, 150, [0, 1], [0, m1], 0, 1, 0, m1 * 1.05, "var(--p)", 1.5, "4 3");
    s += `<circle cx="${500 + A * 150}" cy="${30 + 150 - A * m1 / (m1 * 1.05) * 150}" r="5" fill="var(--coral)"/>`;
    fig.innerHTML = svg(232, s);
    $("ro").innerHTML = `<div><span>source</span><b>${A.toFixed(2)}</b></div><div><span>largest |E| (relative)</span><b>${A.toFixed(2)}</b></div><div><span>field when source = 0</span><b>0 everywhere</b></div>`;
  };
  $("qa").oninput = u; u();
}},

{s: "Q4. A, x, b and p", t: "What are A, x and b, and is A the parameter space?",
intu: String.raw`Click each symbol to see where it lives. \(\mathbf{x}\) is the field at every grid point (all components, so millions of numbers in 3D). \(\mathbf{b}\) is the source at every grid point, zero except on the source plane. \(A\) is the system matrix: Maxwell's curl operator on the grid at one frequency, with the permittivity of every cell built in. \(\mathbf{p}\) is the parameter space: the design pixels, vertices or widths. \(A\) is not the parameter space, but it depends on \(\mathbf{p}\), only through the permittivity of the cells in the design region. Move the slider to change the design and watch which entries of \(A\) change and how the transmission responds.`,
eq: String.raw`\[ A(\mathbf{p})\,\mathbf{x} = \mathbf{b} \]\[ \mathbf{p} \rightarrow \varepsilon_r(\mathbf{r};\mathbf{p}) \rightarrow A(\mathbf{p}) \rightarrow \mathbf{x} \rightarrow F \]<div class="eqref">Ch. 3 Eq. (3.2), Michaels Eq. 3</div>`,
sym: [[String.raw`\(\mathbf{x}\)`, "field on the whole grid (E and H in the thesis form, E only in the wave-equation form)"], [String.raw`\(\mathbf{b}\)`, "source on the whole grid, nonzero only on the source plane"], [String.raw`\(A\)`, "system matrix: discretized curls plus the permittivity of every cell, square and mostly zeros"], [String.raw`\(\mathbf{p}\)`, "design parameters, design region only, e.g. 48,400 pixels for a pixel design"]],
how: ["Parameters set the permittivity in the design region.", "Each design cell's permittivity sits on one diagonal entry of A.", "So changing a parameter changes only a few entries of A.", "That changes the field x everywhere, and with it the figure of merit."],
say: String.raw`\(\mathbf{x}\) is the field on the grid, \(\mathbf{b}\) the source, and \(A\) the discretized Maxwell operator with the permittivity of every cell. \(A\) depends on the design parameters \(\mathbf{p}\) only through the permittivity in the design region.`,
num: String.raw`For the 1D device in the picture: 120 grid points, 60 design pixels, one source point. A 3D device has millions of grid points but the same structure.`,
note: String.raw`<p>"A is the discretized Maxwell operator, x the fields on the grid and b the source. The design parameters are a separate, much smaller vector. They enter A only through the permittivity of the cells in the design region, which is why \(\partial A/\partial p_i\) is so sparse and the adjoint gradient becomes a local product of forward and adjoint fields."</p>`,
r(fig, ctl) {
  let w = "A"; ctl.innerHTML = btns([["x", "x: fields"], ["b", "b: source"], ["A", "A: system matrix"], ["p", "p: parameters"]], "w") + sl("pv", "Design value p (all pixels)", 0, 1, 0.01, 0.5) + `<div class="readout" id="ro"></div>`;
  const dev = new C3.Dev1D({ Nd: 60, pad: 30 });
  const u = () => {
    pick(ctl, "w", w); const pv = +$("pv").value; $("pvv").textContent = pv.toFixed(2);
    const n = 14, d0 = 4, d1 = 10, sp = 1, c = 17, ax = 380, ay = 22, gx = 40, gy = 40;
    let s = `<text class="th" x="${gx + n * 22 / 2}" y="22" text-anchor="middle">grid (1D, 14 points)</text>`;
    for (let i = 0; i < n; i++) {
      const des = i >= d0 && i < d1, on = (w === "x") || (w === "b" && i === sp) || (w === "p" && des) || (w === "A" && des);
      const fill = des ? `fill="var(--blue)" fill-opacity="${0.12 + 0.75 * pv}"` : `fill="var(--sunk)"`;
      s += `<rect x="${gx + i * 22}" y="${gy}" width="20" height="40" rx="3" ${fill} stroke="${on ? "var(--coral)" : "var(--b)"}" stroke-width="${on ? 2.5 : 1}"/>`;
    }
    s += `<text class="ts" x="${gx + (d0 + d1) / 2 * 22}" y="${gy + 58}" text-anchor="middle">design region</text><text class="ts" x="${gx + sp * 22 + 10}" y="${gy + 58}" text-anchor="middle">src</text>`;
    s += `<text class="th" x="${ax + n * c / 2}" y="16" text-anchor="middle">A (each row is one grid point's equation)</text>`;
    for (let r = 0; r < n; r++) for (let k = 0; k < n; k++) {
      const on = Math.abs(r - k) <= 1, diag = r === k, des = diag && r >= d0 && r < d1;
      const hi = w === "A" ? des : false;
      s += `<rect x="${ax + k * c}" y="${ay + 8 + r * c}" width="${c - 2}" height="${c - 2}" rx="2" fill="${on ? (des ? "var(--coral)" : diag ? "var(--coral-bg)" : "var(--blue-bg)") : "var(--sunk)"}" fill-opacity="${des ? 0.3 + 0.7 * pv : 1}" stroke="${hi ? "var(--fg)" : "none"}"/>`;
    }
    const lab = { x: "x: one value per grid point, everywhere", b: "b: zero everywhere except the source point", A: "A: only the diagonal entries of design cells depend on p", p: "p: only the design region, a much smaller vector" }[w];
    s += `<text class="t" x="${gx}" y="150">${lab}</text>`;
    const T = dev.T(new Float64Array(60).fill(pv), 800).T;
    fig.innerHTML = svg(275, s);
    $("ro").innerHTML = `<div><span>design permittivity</span><b>${(1 + pv * 11.19).toFixed(2)}</b></div><div><span>entries of A that changed</span><b>6 diagonal</b></div><div><span>transmission F</span><b>${T.toFixed(3)}</b></div>`;
  };
  ctl.querySelectorAll("button").forEach(b => b.onclick = () => { w = b.dataset.w; u(); });
  $("pv").oninput = u; u();
}},

{s: "Q5. One FDTD run", t: "How does a time-domain simulation move, step by step?",
intu: String.raw`This is a live 2D FDTD run: a pulse is launched into a high-index strip waveguide. Watch the list on the right. Every time step repeats the same five actions in the same order. Update H from the curl of E. Update E from the curl of H, with the source current added on the source plane. Damp the fields inside the absorbing frame (PML). Add the monitor field to the running Fourier sums. Check whether the energy left in the box has dropped low enough to stop. The run ends by itself when the pulse has left.`,
eq: String.raw`\[ \mathbf{H}^{n+\frac12} = \mathbf{H}^{n-\frac12} - \frac{\Delta t}{\mu_0}\nabla\times\mathbf{E}^{n} \]\[ \mathbf{E}^{n+1} = \mathbf{E}^{n} + \frac{\Delta t}{\varepsilon_0\varepsilon_r}\left(\nabla\times\mathbf{H}^{n+\frac12} - \mathbf{J}^{n+\frac12}\right) \]`,
sym: [[String.raw`\(n\)`, "time step index: E at whole steps, H at half steps (the leapfrog)"], ["PML", "absorbing layer around the box (Lesson 6)"], ["shutoff", "stop when the energy in the box falls below a small fraction of its peak (Lesson 7)"]],
how: ["Update H everywhere from the curl of E.", "Update E everywhere from the curl of H. Add the source current on the source plane.", "Inside the PML the same updates include a damping term.", "Monitors add the field times a rotating phase, one sum per wavelength.", "Every so often, compare the energy in the box with its peak and stop when it is small."],
say: "Each FDTD step updates H from the curl of E, then E from the curl of H with the source added, damps the fields in the PML, adds to the monitor Fourier sums, and stops once the field energy has decayed.",
num: String.raw`This run: 200 × 100 cells, strip of index 3.5, Courant number 0.5, shutoff at \(10^{-3}\) of the peak energy so the demo ends quickly. Tidy3D uses a much smaller shutoff by default.`,
note: String.raw`<p>"FDTD leapfrogs H and E on the staggered Yee grid, half a time step apart. The source current is added on the source plane, PML absorbs outgoing light, the monitors take a running Fourier transform, and the run stops when the field energy in the domain has decayed below the shutoff."</p>`,
r(fig, ctl) {
  const nx = 200, ny = 100; let sim, run = true, peak = 0, done = false, ph = 0;
  ctl.innerHTML = `<div class="row"><button id="qrs">Restart</button><button id="qpp">Pause</button></div><div class="readout" id="ro"></div>`;
  const reset = () => { const eps = new Float32Array(nx * ny).fill(1); for (let j = 45; j <= 54; j++) for (let i = 0; i < nx; i++) eps[j * nx + i] = 12.25; sim = new C2.FDTD2D(nx, ny, 0.5, eps, 15); peak = 0; done = false; run = true; $("qpp").textContent = "Pause"; };
  $("qrs").onclick = reset; $("qpp").onclick = () => { run = !run; $("qpp").textContent = run ? "Pause" : "Play"; };
  reset();
  fig.innerHTML = `<div style="display:grid;grid-template-columns:minmax(0,1.6fr) minmax(0,1fr);gap:10px;align-items:start"><div id="qcv"></div><div id="qls"></div></div>`;
  const { ctx, img } = C2.canvas($("qcv"), nx, ny, 2, "E<sub>z</sub>: red positive, blue negative. Grey frame: PML. Strip: n = 3.5.");
  const steps = ["1. update H from curl E", "2. update E from curl H, add J", "3. damp inside the PML", "4. add to monitor Fourier sums", "5. check energy, stop if small"];
  anim(() => {
    if (!fig.isConnected) { stopAnim(); return; }
    if (run && !done) for (let s = 0; s < 3; s++) { const t = sim.t; sim.step([30, 50, Math.exp(-Math.pow((t - 90) / 30, 2) / 2) * Math.sin(2 * Math.PI * t * 0.5 / 40)]); }
    let U = 0; for (let k = 0; k < nx * ny; k++) U += sim.eps[k] * sim.ez[k] * sim.ez[k] + sim.hx[k] * sim.hx[k] + sim.hy[k] * sim.hy[k];
    peak = Math.max(peak, U); if (sim.t > 200 && U < 1e-3 * peak) done = true;
    for (let k = 0; k < nx * ny; k++) { const [r, g, b] = C2.color(sim.ez[k] * 4); const o = k * 4, e = sim.eps[k], i = k % nx, j = (k - i) / nx, pm = i < 15 || j < 15 || i >= nx - 15 || j >= ny - 15, f = e > 1 ? 0.82 : pm ? 0.9 : 1; img.data[o] = r * f; img.data[o + 1] = g * f; img.data[o + 2] = b * f; img.data[o + 3] = 255; }
    ctx.putImageData(img, 0, 0);
    if (run && !done) ph = (ph + 1) % 25;
    $("qls").innerHTML = `<p class="sec" style="margin-top:0">each time step</p>` + steps.map((t, i) => `<div style="padding:4px 8px;margin:3px 0;border-radius:5px;font-size:13px;background:${!done && run && Math.floor(ph / 5) === i ? "var(--accent-bg)" : "var(--sunk)"}">${t}</div>`).join("") + `<p class="note">${done ? "Energy below the shutoff: run stopped." : "Repeating..."}</p>`;
    $("ro").innerHTML = `<div><span>time step</span><b>${sim.t}</b></div><div><span>energy / peak</span><b>${peak ? (U / peak).toExponential(1) : "0"}</b></div><div><span>status</span><b>${done ? "stopped" : run ? "running" : "paused"}</b></div>`;
  });
}}
],
summary: String.raw`The adjoint source is \((\partial F/\partial\mathbf{x})^T\): for a mode-power objective, the output mode sent backwards from the monitor with amplitude \(a^{*}\). FDTD solves the time-domain equations, and its Fourier-transformed fields at each frequency solve \(A\mathbf{x} = \mathbf{b}\), which is why the adjoint theory applies. Without a source that system has only the zero solution, apart from the waveguide modes. \(\mathbf{x}\) is the field on the grid, \(\mathbf{b}\) the source, \(A\) the Maxwell operator with the permittivity built in, and \(\mathbf{p}\) the design parameters that change \(A\) only through the design-region permittivity. One FDTD step updates H, then E with the source, damps the PML, feeds the monitors and checks for shutoff.`,
sheet: [
[String.raw`\[ A^{T}\mathbf{y} = \left(\frac{\partial F}{\partial \mathbf{x}}\right)^{T}, \qquad \mathbf{b}_\mathrm{adj} = a^{*}\mathbf{c} \]`, "Adjoint system and source for a mode-power objective"],
[String.raw`\[ \partial/\partial t \to -i\omega \;\Rightarrow\; A(\omega)\mathbf{x} = \mathbf{b} \]`, "From the time-domain equations to the linear system"],
[String.raw`\[ A\mathbf{x} = \mathbf{0} \Rightarrow \mathbf{x} = \mathbf{0} \]`, "No source, no field (absorbing boundaries)"],
[String.raw`\[ \mathbf{p} \rightarrow \varepsilon_r \rightarrow A(\mathbf{p}) \rightarrow \mathbf{x} \rightarrow F \]`, "How the parameters reach the figure of merit"],
[String.raw`\[ \mathbf{H}^{n+\frac12} = \mathbf{H}^{n-\frac12} - \frac{\Delta t}{\mu_0}\nabla\times\mathbf{E}^{n}, \quad \mathbf{E}^{n+1} = \mathbf{E}^{n} + \frac{\Delta t}{\varepsilon_0\varepsilon_r}\left(\nabla\times\mathbf{H}^{n+\frac12} - \mathbf{J}\right) \]`, "One leapfrog step"]],
consts: String.raw`1D solves: 10 nm cells, slab or design with \(\varepsilon\) up to about 12. 2D run: normalized units, Courant number 0.5.`,
sources: ["Michaels and Yablonovitch, Opt. Express 26, 31717 (2018), Eqs. (3), (8), (9), (11), (12)", "Lalau-Keraly, Bhargava, Miller and Yablonovitch, Opt. Express 21, 21693 (2013) (adjoint source as the output sent backwards)", "Taflove and Hagness, Computational Electrodynamics: The Finite-Difference Time-Domain Method, 3rd ed., Artech House (2005)", "Ch. 3 Sec. 3.2 of the thesis"]
});

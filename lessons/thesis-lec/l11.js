addLesson("fdtd", "lec", {
level: "Gradient", num: "Lesson 11",
id: "thesis-lec-l11", title: "The adjoint source", short: "11. The adjoint source",
big: String.raw`On paper, Maxwell's equations at one frequency on the grid are a linear system \(A(\mathbf{p})\mathbf{x} = \mathbf{b}\): \(\mathbf{x}\) is the field everywhere, \(\mathbf{b}\) the source, and \(A\) holds the curls and the permittivity of every cell. FDTD never builds \(A\), but its Fourier-transformed fields solve it (Lesson 4.4 of Part A). Writing the gradient with \(A\) and regrouping one product gives a second system, the adjoint problem, whose source is \((\partial J/\partial\mathbf{x})^T\), the sensitivity of the figure of merit to the fields. For the PBS that source is the port mode, sent backwards from the port monitor, with amplitude \(w_j a_j^{*}\) at each wavelength.`,
bridge: "Thesis Ch. 3 Sec. 3.2: Eqs. (3.2) to (3.4) after Michaels and Yablonovitch (Eqs. 3, 8, 9, 11, 12), and the mode-amplitude adjoint source after Lalau-Keraly et al. (Eqs. 8 and 9).",
cards: [
{s: "1. A, x, b and p", t: "The linear system on paper",
intu: String.raw`Click each symbol to see where it lives on a small 1D grid. \(\mathbf{x}\): one value per grid point, everywhere. \(\mathbf{b}\): zero except at the source. \(A\): one row per grid point, mostly zeros, with the permittivity on the diagonal. \(\mathbf{p}\): only the design pixels. \(A\) is not the parameter space. It depends on \(\mathbf{p}\) only through the diagonal entries of the design cells. Move the slider and watch those entries change.`,
eq: String.raw`\[ A(\mathbf{p})\,\mathbf{x} = \mathbf{b} \]\[ \mathbf{p} \rightarrow \varepsilon_r(\mathbf{r};\mathbf{p}) \rightarrow A(\mathbf{p}) \rightarrow \mathbf{x} \rightarrow J \]<div class="eqref">Ch. 3 Eq. (3.2)</div>`,
sym: [[String.raw`\(\mathbf{x}\)`, "fields on the whole grid"], [String.raw`\(\mathbf{b}\)`, "source, nonzero on the source plane only"], [String.raw`\(A\)`, "discretized curls plus the permittivity of every cell"], [String.raw`\(\mathbf{p}\)`, "design parameters: the 48,400 pixel densities"]],
how: ["Fourier transform the curl equations: one frequency.", "Write them on the grid: one equation per field value, stacked into a matrix.", "The permittivity of each cell sits on the diagonal."],
say: String.raw`\(\mathbf{x}\) is the field on the grid, \(\mathbf{b}\) the source and \(A\) the Maxwell operator with the permittivity built in. The design parameters change \(A\) only through the permittivity of the design cells.`,
num: "PBS: millions of grid values in x, 48,400 entries in p.",
r(fig, ctl) {
  let w = "A"; ctl.innerHTML = btns([["x", "x"], ["b", "b"], ["A", "A"], ["p", "p"]], "w") + sl("pv", "Design density p", 0, 1, 0.01, 0.5);
  const u = () => {
    pick(ctl, "w", w); const pv = +$("pv").value; $("pvv").textContent = pv.toFixed(2);
    const n = 14, d0 = 4, d1 = 10, sp = 1, c = 17, ax = 380, ay = 22, gx = 40, gy = 40;
    let s = `<text class="th" x="${gx + n * 11}" y="22" text-anchor="middle">grid (1D, 14 points)</text>`;
    for (let i = 0; i < n; i++) { const des = i >= d0 && i < d1, on = w === "x" || (w === "b" && i === sp) || ((w === "p" || w === "A") && des); s += `<rect x="${gx + i * 22}" y="${gy}" width="20" height="40" rx="3" ${des ? `fill="var(--blue)" fill-opacity="${0.12 + 0.75 * pv}"` : `fill="var(--sunk)"`} stroke="${on ? "var(--coral)" : "var(--b)"}" stroke-width="${on ? 2.5 : 1}"/>`; }
    s += `<text class="ts" x="${gx + 7 * 22}" y="${gy + 58}" text-anchor="middle">design pixels</text><text class="ts" x="${gx + sp * 22 + 10}" y="${gy + 58}" text-anchor="middle">source</text>`;
    s += `<text class="th" x="${ax + n * c / 2}" y="16" text-anchor="middle">A: one row per grid point</text>`;
    for (let r = 0; r < n; r++) for (let k = 0; k < n; k++) { const on = Math.abs(r - k) <= 1, des = r === k && r >= d0 && r < d1; s += `<rect x="${ax + k * c}" y="${ay + 8 + r * c}" width="${c - 2}" height="${c - 2}" rx="2" fill="${on ? (des ? "var(--coral)" : r === k ? "var(--coral-bg)" : "var(--blue-bg)") : "var(--sunk)"}" fill-opacity="${des ? 0.3 + 0.7 * pv : 1}" stroke="${w === "A" && des ? "var(--fg)" : "none"}"/>`; }
    s += `<text class="t" x="${gx}" y="150">${{ x: "x: a value at every grid point", b: "b: zero except at the source", A: "A: only the design cells' diagonal depends on p", p: "p: the design pixels only" }[w]}</text>`;
    fig.innerHTML = svg(275, s);
  };
  ctl.querySelectorAll("button").forEach(b => b.onclick = () => { w = b.dataset.w; u(); }); $("pv").oninput = u; u();
}},
{s: "2. The regrouping", t: "Where the adjoint source comes from",
intu: String.raw`Step through. The chain rule gives the gradient as a product of four factors. Changing one pixel changes \(A\), which changes \(\mathbf{x}\), which changes \(J\). Read the direct way, every pixel needs its own solve with \(A\). But the first two factors do not depend on which pixel we ask about. Compute them once: that is one extra solve, of a system with \(A^T\), whose right-hand side is \((\partial J/\partial\mathbf{x})^T\). That right-hand side is the adjoint source. Nobody picks it: it falls out of the algebra.`,
eq: String.raw`\[ \frac{dJ}{dp_i} = -2\,\mathrm{Re}\Big\{ \underbrace{\frac{\partial J}{\partial \mathbf{x}} A^{-1}}_{\mathbf{y}^T} \frac{\partial A}{\partial p_i}\mathbf{x} \Big\} \;\Rightarrow\; A^T\mathbf{y} = \left(\frac{\partial J}{\partial \mathbf{x}}\right)^T \]<div class="eqref">Ch. 3 Eqs. (3.3) and (3.4)</div>`,
sym: [[String.raw`\(\mathbf{y}\)`, "adjoint field"], [String.raw`\((\partial J/\partial\mathbf{x})^T\)`, "adjoint source: how J changes with each field value"], [String.raw`\(A^T = A\)`, "for GaAs and air (reciprocal), so the adjoint is an ordinary simulation of the same device"]],
how: [String.raw`Differentiate \(A\mathbf{x} = \mathbf{b}\): \(\partial\mathbf{x}/\partial p_i = -A^{-1}(\partial A/\partial p_i)\mathbf{x}\), one solve per pixel.`, String.raw`Chain rule: \(dJ/dp_i = 2\,\mathrm{Re}\{(\partial J/\partial\mathbf{x})\,\partial\mathbf{x}/\partial p_i\}\). The 2Re appears because J is real and x complex.`, String.raw`Group \((\partial J/\partial\mathbf{x})A^{-1}\): it has no \(i\), so one solve gives it.`, String.raw`Transpose: \(A^T\mathbf{y} = (\partial J/\partial\mathbf{x})^T\).`],
say: String.raw`The adjoint source is \((\partial J/\partial\mathbf{x})^T\). It appears when the gradient is regrouped so that the part that does not depend on the parameter is solved once.`,
num: "One adjoint solve replaces 48,400 direct solves.",
r(fig, ctl) {
  const T = [
    [String.raw`A\mathbf{x} = \mathbf{b} \;\Rightarrow\; \frac{\partial \mathbf{x}}{\partial p_i} = -A^{-1}\frac{\partial A}{\partial p_i}\mathbf{x} \quad (\text{one solve per } i)`],
    [String.raw`\frac{dJ}{dp_i} = -2\,\mathrm{Re}\Big\{ \frac{\partial J}{\partial \mathbf{x}}\, A^{-1}\, \frac{\partial A}{\partial p_i}\, \mathbf{x} \Big\}`],
    [String.raw`\frac{dJ}{dp_i} = -2\,\mathrm{Re}\Big\{ \underbrace{\frac{\partial J}{\partial \mathbf{x}}\, A^{-1}}_{\mathbf{y}^T,\ \text{no } i}\; \frac{\partial A}{\partial p_i}\, \mathbf{x} \Big\}`],
    [String.raw`A^T\mathbf{y} = \underbrace{\left(\frac{\partial J}{\partial \mathbf{x}}\right)^T}_{\text{adjoint source}}`, String.raw`\frac{dJ}{dp_i} = -2\,\mathrm{Re}\Big\{ \mathbf{y}^T\,\frac{\partial A}{\partial p_i}\,\mathbf{x}\Big\} \quad \text{for every } i`]
  ];
  const cap = ["The direct way: every pixel needs its own solve.", "The gradient by the chain rule: four factors.", "The first two factors do not depend on the pixel. Compute them once.", "That is one extra system. Its right-hand side is the adjoint source. Then every pixel's slope is cheap."];
  LC.steps(ctl, 4, k => { LC.mathFig(fig, T[k]); return cap[k]; });
}},
{s: "3. For the PBS", t: "The port mode, sent backwards, with amplitude w a*",
intu: String.raw`For the TE run the figure of merit uses the TE port amplitude only: \(J_\mathrm{TE} = \sum_j w_j |a_j|^2\). Each \(a_j\) is an overlap with the port mode, which is linear in the field. Differentiating gives \(w_j a_j^{*}\) times the mode pattern on the monitor plane. A current sheet shaped like a mode launches that mode, so the adjoint source is the TE\(_0\) mode at the TE port monitor, travelling backwards into the device, with amplitude \(w_j a_j^{*}\) at wavelength \(j\). The conjugate is the time reversal of what arrived. Tidy3D puts all 101 amplitudes into one broadband adjoint run. The TM run gets its own adjoint source at the TM port.`,
eq: String.raw`\[ J_\mathrm{TE} = \sum_j w_j |a_j|^2, \quad a_j = \mathbf{c}^T\mathbf{x}_j \;\Rightarrow\; \left(\frac{\partial J}{\partial \mathbf{x}_j}\right)^T = w_j\, a_j^{*}\, \mathbf{c} \]`,
sym: [[String.raw`\(\mathbf{c}\)`, "overlap weights: the port mode pattern on the monitor plane"], [String.raw`\(a_j^{*}\)`, "complex conjugate of the forward amplitude at wavelength j"], [String.raw`\(w_j\)`, "wavelength weight from Lesson 9"]],
how: [String.raw`\(|a|^2 = a\,a^{*}\), so its derivative with respect to the field is \(a^{*}\) times the overlap pattern.`, "The overlap pattern is the mode shape: as a source, it launches the mode.", "Direction: backwards, from the port into the design region.", "Amplitude at each wavelength: weight times conjugate forward amplitude. Constant factors are folded in by Tidy3D."],
say: String.raw`For the PBS the adjoint source is the target port mode, launched backwards from the port monitor, with amplitude \(w_j a_j^{*}\) at each wavelength, one adjoint run for TE and one for TM.`,
num: "Penalty terms depend only on the pixels, not on the fields, so they add nothing to the adjoint source.",
r(fig, ctl) {
  const cap = ["Forward TE run: TE0 in, a_j measured at the TE port monitor.", String.raw`Adjoint TE run: the TE0 mode is launched backwards from the TE port monitor, amplitude \(w_j a_j^{*}\).`, "Forward TM run: TM0 in, measured at the TM port monitor.", "Adjoint TM run: the TM0 mode sent backwards from the TM port. Four runs in total per step."];
  LC.steps(ctl, 4, k => { fig.innerHTML = LC.pbs([["design", "src", "mon", "fwd"], ["design", "mon", "adj"], ["design", "src", "mon", "fwdTM"], ["design", "mon", "adjTM"]][k], { note: ["forward, TE", "adjoint, TE: source at the TE port, going back", "forward, TM", "adjoint, TM: source at the TM port, going back"][k] }); return cap[k]; });
}}
],
summary: String.raw`At one frequency on the grid Maxwell's equations are \(A(\mathbf{p})\mathbf{x} = \mathbf{b}\), and FDTD's Fourier-transformed fields solve it. Regrouping the chain-rule gradient so that \((\partial J/\partial\mathbf{x})A^{-1}\) is computed once gives the adjoint system \(A^T\mathbf{y} = (\partial J/\partial\mathbf{x})^T\), Eq. (3.3). Its right-hand side is the adjoint source. For the PBS this is the target port mode, launched backwards from the port monitor with amplitude \(w_j a_j^{*}\) at each wavelength, one adjoint run per input polarization.`,
sheet: [
[String.raw`\[ A(\mathbf{p})\mathbf{x} = \mathbf{b} \]`, "Maxwell on the grid at one frequency (Ch. 3 Eq. 3.2)"],
[String.raw`\[ A^T\mathbf{y} = \left(\frac{\partial J}{\partial\mathbf{x}}\right)^T \]`, "Adjoint system (Ch. 3 Eq. 3.3)"],
[String.raw`\[ \frac{dJ}{dp_i} = -2\,\mathrm{Re}\left\{\mathbf{y}^T\frac{\partial A}{\partial p_i}\mathbf{x}\right\} \]`, "Gradient (Ch. 3 Eq. 3.4)"],
[String.raw`\[ \mathbf{b}_\mathrm{adj}(\lambda_j) = w_j\,a_j^{*}\,\mathbf{c} \]`, "PBS adjoint source: port mode sent back"]],
sources: ["Michaels and Yablonovitch, Opt. Express 26, 31717 (2018), Eqs. (3), (8), (9), (11), (12)", "Lalau-Keraly, Bhargava, Miller and Yablonovitch, Opt. Express 21, 21693 (2013), Eqs. (5), (8), (9)", "Ch. 3 Sec. 3.2 of the thesis"]
});

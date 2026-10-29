addLesson("thesis", "ch3", {
level: "Core",
id: "thesis-ch3-l2", title: "The adjoint method: where two simulations come from", short: "2. The adjoint method",
big: "After discretization, Maxwell's equations at one frequency are a big linear system A x = b, where the matrix A contains the permittivity and so depends on the design. Differentiating it gives the change of the fields for each parameter, but each one needs its own solve. The adjoint trick regroups the same product: solve once for an adjoint field y with A<sup>T</sup> y equal to the derivative of F with respect to the fields, and every partial derivative becomes a cheap overlap −2Re{y<sup>T</sup>(∂A/∂p<sub>i</sub>)x}. For a pixel of permittivity this overlap is just the product of the forward and adjoint fields at that pixel. Everything in this lesson is computed live on a 1D wave problem, including a check against finite differences.",
bridge: "The derivation follows Michaels and Yablonovitch 2018, Sec. 2, Eqs. (3), (8), (9), (11) and (12), which Ch. 3 Sec. 3.2 quotes as Eqs. (3.2) to (3.4). Their paper rederives the adjoint method in matrix form before its own contribution, a way to smooth material boundaries on a grid. The 1D solver here is a finite-difference Helmholtz equation with exact one-way boundaries, a frequency-domain cousin of the FDTD of Chapter 2.",
cards: [
{s: "1. A x = b", t: "Maxwell's equations as one matrix equation",
intu: "On a grid, the 1D wave equation at one frequency links each field value to its two neighbors. Writing that for every grid point gives a matrix equation. The matrix is almost empty: each row has three entries, and the permittivity of point i sits only on the diagonal. Pick a grid point. The highlighted row is its equation, and the right panel shows ∂A/∂ε<sub>i</sub>, the change of the matrix when that one permittivity changes: a single nonzero entry.",
eq: String.raw`\[ A(\mathbf{p})\, \mathbf{x} = \mathbf{b} \]<div class="eqnote">1D:</div>\[ \frac{E_{i-1} - 2E_i + E_{i+1}}{\Delta^2} + k_0^2\, \varepsilon_i E_i = b_i \]\[ \Longrightarrow\quad \frac{\partial A}{\partial \varepsilon_i} = k_0^2\, \mathbf{e}_i \mathbf{e}_i^{T} \]<div class="eqref">Ch. 3 Eq. (3.2), Michaels Eq. 3</div>`,
sym: [[String.raw`\(A\)`, "system matrix: discretized curl curl operator plus permittivity, depends on the design"], [String.raw`\(\mathbf{x}\)`, "all field values on the grid"], [String.raw`\(\mathbf{b}\)`, "the source"], [String.raw`\(\Delta\)`, "grid step"], [String.raw`\(k_0 = 2\pi/\lambda\)`, "free-space wavenumber"], [String.raw`\(\mathbf{e}_i\)`, "unit vector that picks grid point i"]],
how: ["Start from the wave equation d²E/dx² + k₀²ε(x)E = source.", "Replace the second derivative by the three-point difference on the grid.", "One equation per grid point, stacked, is A x = b.", "In 3D the matrix is much larger but the structure is the same, and ε still appears only on the diagonal block."],
say: "After discretization Maxwell's equations become A x = b, and the permittivity of a pixel appears only in that pixel's diagonal entry.",
num: "A 3D region of 2.5 × 2.5 × 1 µm³ at 10 nm cells has about 6 million cells and about 19 million electric field unknowns. The matrix is huge but each row still has only a few nonzero entries.",
r(fig, ctl) {
  const N = 9; ctl.innerHTML = sl("i", "Grid point i", 1, N, 1, 5);
  const u = () => {
    const I = +$("i").value; $("iv").textContent = I; const c = 25, x0 = 40, y0 = 40, x1 = 400;
    let s = `<text class="th" x="${x0 + N * c / 2}" y="28" text-anchor="middle">A</text><text class="th" x="${x1 + N * c / 2}" y="28" text-anchor="middle">∂A/∂ε<tspan baseline-shift="sub" font-size="10">${I}</tspan></text>`;
    for (let r = 0; r < N; r++) for (let k = 0; k < N; k++) {
      const on = Math.abs(r - k) <= 1, diag = r === k, hi = r === I - 1;
      s += `<rect x="${x0 + k * c}" y="${y0 + r * c}" width="${c - 2}" height="${c - 2}" rx="3" fill="${on ? (diag ? "var(--coral-bg)" : "var(--blue-bg)") : "var(--sunk)"}" stroke="${hi ? "#D85A30" : "none"}" stroke-width="1.6"/>`;
      if (on) s += `<text x="${x0 + k * c + c / 2 - 1}" y="${y0 + r * c + c / 2 + 3}" text-anchor="middle" style="font-size:9px;fill:var(--t)">${diag ? "ε" + (r + 1) : "1"}</text>`;
      const d = r === I - 1 && k === I - 1;
      s += `<rect x="${x1 + k * c}" y="${y0 + r * c}" width="${c - 2}" height="${c - 2}" rx="3" fill="${d ? "#D85A30" : "var(--sunk)"}"/>`;
    }
    s += `<text class="ts" x="${x0 + N * c / 2}" y="${y0 + N * c + 22}" text-anchor="middle">three entries per row</text><text class="ts" x="${x1 + N * c / 2}" y="${y0 + N * c + 22}" text-anchor="middle">one entry: k₀² at (${I}, ${I})</text>`;
    s += `<text class="ts" x="340" y="${y0 + N * c + 48}" text-anchor="middle">row ${I}: (E${I - 1 || "₀"} − 2E${I} + E${I + 1})/Δ² + k₀²ε${I}E${I} = b${I}</text>`;
    fig.innerHTML = svg(y0 + N * c + 60, s);
  };
  $("i").oninput = u; u();
}},

{s: "2. The direct route", t: "Differentiating A x = b: one solve per parameter",
intu: "Change one parameter p<sub>i</sub> and both A and x change. Differentiating A x = b gives ∂x/∂p<sub>i</sub> = −A<sup>−1</sup>(∂A/∂p<sub>i</sub>)x. Each parameter has its own right-hand side (∂A/∂p<sub>i</sub>)x, so each needs its own solve of the big system. Play the animation: the boxes are solves, one per parameter.",
eq: String.raw`\[ \frac{\partial A}{\partial p_i}\mathbf{x} + A\frac{\partial \mathbf{x}}{\partial p_i} = 0 \quad\Longrightarrow\quad \frac{\partial \mathbf{x}}{\partial p_i} = -A^{-1} \frac{\partial A}{\partial p_i}\mathbf{x} \]\[ \frac{dF}{dp_i} = 2\operatorname{Re}\left\{ \frac{\partial F}{\partial \mathbf{x}} \frac{\partial \mathbf{x}}{\partial p_i} \right\} = -2\operatorname{Re}\left\{ \frac{\partial F}{\partial \mathbf{x}} A^{-1} \frac{\partial A}{\partial p_i}\mathbf{x} \right\} \]<div class="eqref">Michaels Eq. 8 and Eq. 9</div>`,
sym: [[String.raw`\(\partial F/\partial \mathbf{x}\)`, "row vector: how F changes with each field value"], [String.raw`\(A^{-1}\)`, "solving the system, the expensive operation"], [String.raw`\(2\operatorname{Re}\{\dots\}\)`, "F is real but the fields are complex, so both x and its conjugate contribute (Michaels p. 4)"]],
how: ["The source b does not depend on the design, so its derivative is zero.", "Product rule on A x gives the first line.", "Multiply by A⁻¹: the field change for parameter i.", "Chain rule: F depends on p only through x. The real part appears because F is real while x is complex."],
say: "The direct derivative ∂x/∂p_i = −A⁻¹(∂A/∂p_i)x needs one solution of the system per parameter.",
num: "Michaels and Yablonovitch: this route costs M + 1 simulations per gradient, which for tens of thousands of pixels is impossible.",
r(fig, ctl) {
  ctl.innerHTML = sl("m", "Parameters M", 1, 60, 1, 24) + `<div class="row"><button id="go">Play the solves</button></div>`;
  let done = 0;
  const draw = () => {
    const M = +$("m").value; $("mv").textContent = M;
    let s = `<text class="th" x="20" y="26">direct route: one solve of A per parameter</text>`;
    for (let i = 0; i < M; i++) { const x = 20 + (i % 20) * 31, y = 40 + Math.floor(i / 20) * 34; s += `<rect x="${x}" y="${y}" width="26" height="26" rx="4" fill="${i < done ? "#D85A30" : "var(--sunk)"}" opacity="${i < done ? 0.85 : 1}"/><text x="${x + 13}" y="${y + 17}" text-anchor="middle" style="font-size:9px;fill:var(--t)">p${i + 1}</text>`; }
    s += `<text class="th" x="20" y="170">adjoint route: one extra solve in total (next card)</text><rect x="20" y="182" width="26" height="26" rx="4" fill="#1D9E75"/><text x="33" y="199" text-anchor="middle" style="font-size:9px;fill:#fff">y</text><text class="ts" x="60" y="200">plus the forward solve both routes share</text>`;
    s += `<text class="ts" x="660" y="26" text-anchor="end">${Math.min(done, M)} of ${M} solves</text>`;
    fig.innerHTML = svg(225, s);
  };
  $("m").oninput = () => { done = 0; stopAnim(); draw(); };
  $("go").onclick = () => { done = 0; let t = 0; anim(() => { t++; if (t % 3 === 0) done++; if (done > +$("m").value) { stopAnim(); done = +$("m").value; } draw(); }); };
  draw();
}},

{s: "3. Regroup the brackets", t: "The adjoint trick is just a different order of multiplication",
intu: "Look at the product (∂F/∂x) A<sup>−1</sup> (∂A/∂p<sub>i</sub>) x. The direct route groups the right part: A<sup>−1</sup>(∂A/∂p<sub>i</sub>)x, which changes with i. The adjoint route groups the left part: (∂F/∂x)A<sup>−1</sup>, which does not contain i at all. Compute it once, call it y<sup>T</sup>, and every derivative is a cheap product y<sup>T</sup>(∂A/∂p<sub>i</sub>)x. Transposing the definition of y gives an ordinary system for y: the adjoint simulation. Switch the grouping.",
eq: String.raw`\[ \mathbf{y}^{T} = \frac{\partial F}{\partial \mathbf{x}} A^{-1} \quad\Longleftrightarrow\quad A^{T}\mathbf{y} = \left(\frac{\partial F}{\partial \mathbf{x}}\right)^{T} \]\[ \frac{dF}{dp_i} = -2\operatorname{Re}\left\{ \mathbf{y}^{T} \frac{\partial A}{\partial p_i}\mathbf{x} \right\} \]<div class="eqref">Ch. 3 Eq. (3.3) and Eq. (3.4), Michaels Eq. 11 and Eq. 12</div>`,
sym: [[String.raw`\(\mathbf{y}\)`, "adjoint field"], [String.raw`\(A^{T}\)`, "transpose of A. For reciprocal materials A^T = A, so the adjoint is the same structure"], [String.raw`\((\partial F/\partial \mathbf{x})^{T}\)`, "adjoint source: where and how strongly F looks at the fields"]],
how: ["Write the gradient as a product of four factors (previous card).", "Group the first two: the result does not depend on i.", "Multiply y^T = (∂F/∂x)A⁻¹ by A from the right and transpose: A^T y = (∂F/∂x)^T.", "One forward solve for x and one adjoint solve for y give every derivative."],
say: "The adjoint field solves A^T y = (∂F/∂x)^T, and then each derivative is −2Re{y^T (∂A/∂p_i) x}, so two solves give the whole gradient.",
num: "Michaels and Yablonovitch: the gradient needs only two simulations, independent of the number of parameters.",
r(fig, ctl) {
  let g = "adj"; ctl.innerHTML = btns([["dir", "Direct grouping"], ["adj", "Adjoint grouping"]], "g");
  const u = () => {
    pick(ctl, "g", g);
    const T = [[90, "(∂F/∂x)", "row, no i"], [215, "A⁻¹", "solve"], [330, "(∂A/∂pᵢ)", "depends on i"], [450, "x", "forward field"]];
    let s = `<text class="th" x="40" y="95" style="font-size:22px">−2Re{</text><text class="th" x="560" y="95" style="font-size:22px">}</text>`;
    T.forEach(([x, t, c]) => s += `<text class="th" x="${x + 40}" y="95" text-anchor="middle" style="font-size:22px">${t}</text><text class="ts" x="${x + 40}" y="122" text-anchor="middle">${c}</text>`);
    if (g === "dir") s += `<rect x="225" y="62" width="300" height="46" rx="10" fill="none" stroke="#D85A30" stroke-width="2.5"/><text class="ts" x="375" y="52" text-anchor="middle" fill="#D85A30">= −∂x/∂pᵢ, a new solve for every i</text><text class="ts" x="340" y="180" text-anchor="middle">M parameters: M solves</text>`;
    else s += `<rect x="100" y="62" width="200" height="46" rx="10" fill="none" stroke="#1D9E75" stroke-width="2.5"/><text class="ts" x="200" y="52" text-anchor="middle" fill="#1D9E75">= yᵀ, computed once</text><text class="ts" x="340" y="168" text-anchor="middle">Aᵀy = (∂F/∂x)ᵀ: one adjoint solve</text><text class="ts" x="340" y="190" text-anchor="middle">then dF/dpᵢ = −2Re{yᵀ(∂A/∂pᵢ)x} for every i, almost free</text>`;
    fig.innerHTML = svg(210, s);
  };
  ctl.querySelectorAll("button").forEach(b => b.onclick = () => { g = b.dataset.g; u(); }); u();
}},

{s: "4. Field times field", t: "For a pixel, the gradient is the product of the two fields",
intu: "For the permittivity of one pixel, ∂A/∂ε<sub>i</sub> has a single entry k<sub>0</sub>² (card 1). So the gradient formula collapses to the product of the forward and adjoint fields at that pixel. Below, a random 1D design (stripe, dark is GaAs) is lit from the left. The figure of merit is the transmitted power at the right probe. Top: |E<sub>fwd</sub>|. Middle: |E<sub>adj</sub>|, launched from the probe. Bottom: the gradient for every pixel, obtained from these two solves. Red bars say add permittivity there, blue bars say remove it. Change the wavelength.",
eq: String.raw`\[ \frac{\partial F}{\partial \varepsilon_i} = -2\operatorname{Re}\{ y_i\, k_0^2\, x_i \} = -2k_0^2 \operatorname{Re}\{ E_{\mathrm{adj},i}\, E_{\mathrm{fwd},i} \} \]\[ F = \frac{|E_{\mathrm{out}}|^2}{|E_{\mathrm{out,vac}}|^2} \]<div class="eqnote">adjoint source:</div>\[ \left(\frac{\partial F}{\partial \mathbf{x}}\right)^{T} = \frac{E_{\mathrm{out}}^{*}\, \mathbf{e}_{\mathrm{out}}}{|E_{\mathrm{out,vac}}|^2} \]`,
sym: [[String.raw`\(\mathbf{E}_{\mathrm{fwd}} = \mathbf{x}\)`, "forward field, source on the left"], [String.raw`\(\mathbf{E}_{\mathrm{adj}} = \mathbf{y}\)`, "adjoint field, source at the output probe"], [String.raw`\(\mathbf{e}_{\mathrm{out}}\)`, "picks the probe point"], [String.raw`\(E_{\mathrm{out}}^{*}\)`, "complex conjugate of the forward field at the probe"]],
how: ["F = |g^T x|²/n₀ with g = e_out, so ∂F/∂x = (g^T x)* g^T/n₀.", "The adjoint source therefore sits at the probe, with the conjugated forward amplitude.", "Insert ∂A/∂ε_i = k₀²e_ie_i^T into the gradient formula.", "Only the fields at pixel i survive: a local product of forward and adjoint fields."],
say: "For a permittivity pixel the adjoint gradient is a local product of the forward and adjoint fields, so one adjoint solve gives the sensitivity map of the whole design.",
num: "This 1D device: 60 pixels of 10 nm between air (ε = 1) and GaAs (ε = 12.19). Two solves give all 60 derivatives. In Tidy3D the same product becomes Re Σ<sub>f</sub> E<sub>fwd</sub>·E<sub>adj</sub> (Lesson 3).",
r(fig, ctl) {
  ctl.innerHTML = sl("l", "Wavelength (nm)", 650, 950, 5, 800) + `<div class="row"><button id="nd">New random design</button></div><div class="readout" id="ro"></div>`;
  const dev = new C3.Dev1D({ Nd: 60, pad: 30 }); let seed = 11, rho;
  const mk = () => { const r = C3.rng(seed); rho = C3.filter1D(Float64Array.from({ length: 60 }, () => r()), 2).map(v => v > 0.5 ? 1 : 0); };
  const u = () => {
    const lam = +$("l").value; $("lv").textContent = lam; const res = dev.T(rho, lam, true), N = dev.N;
    const ab = (f, i) => Math.hypot(f.re[i], f.im[i]), xs = [...Array(N).keys()];
    const fA = xs.map(i => ab(res.fwd, i)), aA = xs.map(i => ab(res.adj, i));
    const mf = Math.max(...fA), ma = Math.max(...aA), mg = Math.max(...res.grad.map(Math.abs)) || 1;
    const X0 = 60, W = 580, X = i => X0 + i / (N - 1) * W, dxp = W / (N - 1);
    let s = C3.stripe(X(dev.pad) - dxp / 2, 8, dev.Nd * dxp, 16, rho);
    s += `<text class="ts" x="${X(dev.src)}" y="20" text-anchor="middle">src</text><text class="ts" x="${X(dev.out)}" y="20" text-anchor="middle">probe</text>`;
    s += `<text class="ts" x="20" y="60">|E_fwd|</text>` + plot(X0, 32, W, 58, xs, fA, 0, N - 1, 0, mf, "#378ADD", 2);
    s += `<text class="ts" x="20" y="130">|E_adj|</text>` + plot(X0, 100, W, 58, xs, aA, 0, N - 1, 0, ma, "#7F77DD", 2);
    s += `<line x1="${X0}" x2="${X0 + W}" y1="215" y2="215" stroke="var(--b)"/><text class="ts" x="20" y="205">∂F/∂εᵢ</text>`;
    for (let i = 0; i < dev.Nd; i++) { const v = res.grad[i] / mg, x = X(dev.pad + i) - dxp * 0.4; s += `<rect x="${x}" y="${v > 0 ? 215 - v * 42 : 215}" width="${dxp * 0.8}" height="${Math.abs(v) * 42}" fill="${v > 0 ? "#D85A30" : "#378ADD"}"/>`; }
    s += `<line x1="${X(dev.out)}" x2="${X(dev.out)}" y1="28" y2="160" stroke="#EF9F27" stroke-dasharray="3 3"/><line x1="${X(dev.src)}" x2="${X(dev.src)}" y1="28" y2="160" stroke="var(--p)" stroke-dasharray="3 3"/>`;
    fig.innerHTML = svg(265, s);
    $("ro").innerHTML = `<div><span>F = T at the probe</span><b>${res.T.toFixed(3)}</b></div><div><span>solves used</span><b>2</b></div><div><span>derivatives obtained</span><b>${dev.Nd}</b></div>`;
  };
  $("l").oninput = u; $("nd").onclick = () => { seed++; mk(); u(); }; mk(); u();
}},

{s: "5. Check it", t: "Adjoint gradient versus finite differences, live",
intu: "Trust but verify. For every pixel, the gradient is computed twice: by the adjoint method from two solves (line), and by central finite differences, nudging each pixel up and down, from 120 solves (dots). They lie on top of each other. Make a new random design or change the wavelength and check again.",
eq: String.raw`\[ \frac{\partial F}{\partial \varepsilon_i} \approx \frac{F(\varepsilon_i + h) - F(\varepsilon_i - h)}{2h}, \qquad h = 10^{-6} \]<div class="eqnote">versus</div>\[ -2k_0^2 \operatorname{Re}\{ y_i x_i \} \]`,
sym: [[String.raw`\(h\)`, "nudge of one pixel permittivity"], ["central difference", "error of order h², two solves per pixel"], ["relative difference", "largest |adjoint − FD| divided by the largest |gradient|"]],
how: ["Pick a design and wavelength.", "Adjoint: one forward and one adjoint solve, then the field product.", "Finite differences: two solves per pixel.", "Compare. Agreement to many digits shows the derivation and the code are consistent."],
say: "A finite-difference check on a few parameters is the standard way to confirm that an adjoint gradient is correct.",
num: "The Tidy3D study note for Ch. 3 records that a finite-difference check was not part of the thesis work. The optimizations converged and every final design was re-simulated without gradients. This toy shows what such a check looks like.",
r(fig, ctl) {
  ctl.innerHTML = sl("l", "Wavelength (nm)", 650, 950, 5, 760) + `<div class="row"><button id="nd">New random design</button></div><div class="readout" id="ro"></div>`;
  const dev = new C3.Dev1D({ Nd: 60, pad: 30 }); let seed = 5, rho;
  const mk = () => { const r = C3.rng(seed); rho = Float64Array.from({ length: 60 }, () => r()); };
  const u = () => {
    const lam = +$("l").value; $("lv").textContent = lam; const res = dev.T(rho, lam, true), de = dev.eMax - dev.eMin, h = 1e-6;
    const fd = res.grad.map((_, i) => { const a = Float64Array.from(rho), b = Float64Array.from(rho); a[i] += h / de; b[i] -= h / de; return (dev.T(a, lam).T - dev.T(b, lam).T) / (2 * h); });
    const mg = Math.max(...res.grad.map(Math.abs)) || 1; let md = 0; fd.forEach((v, i) => md = Math.max(md, Math.abs(v - res.grad[i])));
    const xs = [...Array(60).keys()], X = C3.X(70, 560, 0, 59), Y = C3.Y(20, 180, -1.15, 1.15);
    let s = C3.frame(70, 20, 560, 180, 0, 59, -1.15, 1.15, [0, 15, 30, 45, 59], [-1, 0, 1], "pixel index i", "∂F/∂εᵢ (scaled)") + `<line x1="70" x2="630" y1="${Y(0)}" y2="${Y(0)}" stroke="var(--b)"/>`;
    s += plot(70, 20, 560, 180, xs, res.grad.map(v => v / mg), 0, 59, -1.15, 1.15, "#378ADD", 2);
    fd.forEach((v, i) => s += `<circle cx="${X(i)}" cy="${Y(v / mg)}" r="3" fill="#D85A30"/>`);
    s += C3.legend(90, 250, [["adjoint, 2 solves", "#378ADD"]]) + `<circle cx="300" cy="246" r="4" fill="#D85A30"/><text class="ts" x="310" y="250">finite differences, 120 solves</text>`;
    fig.innerHTML = svg(262, s);
    $("ro").innerHTML = `<div><span>T</span><b>${res.T.toFixed(4)}</b></div><div><span>largest relative difference</span><b>${(md / mg).toExponential(1)}</b></div><div><span>solves: adjoint / FD</span><b>2 / 120</b></div>`;
  };
  $("l").oninput = u; $("nd").onclick = () => { seed++; mk(); u(); }; mk(); u();
}},

{s: "6. Running backwards", t: "The adjoint field: the wanted output sent back in",
intu: "Because the medium is reciprocal, A<sup>T</sup> = A, so the adjoint problem is the same structure with a new source. That source sits where F looks at the field, at the output probe, and it carries the conjugate of the forward field there. Conjugation is time reversal for a single frequency. So the adjoint field is the wanted output sent backwards through the device. Watch the two waves: the forward wave runs from the source to the right, the adjoint wave from the probe to the left. Where they overlap in phase, adding material helps.",
eq: String.raw`\[ A^{T} = A \quad (\text{reciprocal medium}) \quad\Longrightarrow\quad A\mathbf{y} = \left(\frac{\partial F}{\partial \mathbf{x}}\right)^{T} \]<div class="eqnote">same solver, source at the output</div>\[ \operatorname{Re}\{ E(x)\, e^{-i\omega t} \} \quad \text{animated for both fields} \]`,
sym: [["reciprocity", "the response from a to b equals that from b to a, so the matrix is symmetric"], ["conjugate", "e^{−iωt} to e^{+iωt}, time reversal at one frequency"], ["probe", "monitor plane where F is measured"]],
how: ["The discretized operator (Laplacian plus k₀²ε) is symmetric.", "So A^T = A and the adjoint uses the same solver.", "Only the source differs: placed at the probe, proportional to conj(E_out).", "Michaels and Yablonovitch describe the adjoint fields as injecting the desired output and running the system backwards. They also warn that in general A is not symmetric, so forward and adjoint problems need not be identical."],
say: "The adjoint simulation is the same structure excited at the output with the conjugated forward field, the desired output sent backwards.",
num: "In Tidy3D the adjoint source is a mode source at the output monitor plane, in the same mode, with its amplitude at each frequency set by the derivative of J with respect to that mode amplitude (Lesson 3).",
r(fig, ctl) {
  ctl.innerHTML = sl("l", "Wavelength (nm)", 650, 950, 5, 800);
  const dev = new C3.Dev1D({ Nd: 60, pad: 30 }), r = C3.rng(21), rho = C3.filter1D(Float64Array.from({ length: 60 }, () => r()), 2).map(v => v > 0.5 ? 1 : 0);
  let res = null;
  const solve = () => { const lam = +$("l").value; $("lv").textContent = lam; res = dev.T(rho, lam, true); };
  const N = dev.N, xs = [...Array(N).keys()], X0 = 60, W = 580, X = i => X0 + i / (N - 1) * W, dxp = W / (N - 1);
  const draw = t => {
    const ph = -2 * Math.PI * t * 0.6, c = Math.cos(ph), s_ = Math.sin(ph);
    const fr = xs.map(i => res.fwd.re[i] * c - res.fwd.im[i] * s_), ar = xs.map(i => res.adj.re[i] * c - res.adj.im[i] * s_);
    const mf = Math.max(...xs.map(i => Math.hypot(res.fwd.re[i], res.fwd.im[i]))), ma = Math.max(...xs.map(i => Math.hypot(res.adj.re[i], res.adj.im[i])));
    let s = C3.stripe(X(dev.pad) - dxp / 2, 8, dev.Nd * dxp, 14, rho);
    s += `<text class="ts" x="20" y="72">forward</text>` + `<line x1="${X0}" x2="${X0 + W}" y1="70" y2="70" stroke="var(--b)"/>` + plot(X0, 32, W, 76, xs, fr, 0, N - 1, -mf, mf, "#378ADD", 2);
    s += `<text class="ts" x="20" y="172">adjoint</text>` + `<line x1="${X0}" x2="${X0 + W}" y1="170" y2="170" stroke="var(--b)"/>` + plot(X0, 132, W, 76, xs, ar, 0, N - 1, -ma, ma, "#7F77DD", 2);
    s += arrow(X(dev.src), 118, X(dev.src) + 60, 118, "#378ADD", 2) + arrow(X(dev.out), 222, X(dev.out) - 60, 222, "#7F77DD", 2);
    s += `<text class="ts" x="${X(dev.src)}" y="250" text-anchor="middle">source</text><text class="ts" x="${X(dev.out)}" y="250" text-anchor="middle">probe = adjoint source</text>`;
    fig.innerHTML = svg(258, s);
  };
  $("l").oninput = () => { solve(); anim(draw); }; solve(); anim(draw);
}}
],
summary: "Discretized at one frequency, Maxwell's equations are A x = b, with the permittivity on the diagonal of A. Differentiating gives ∂x/∂p_i = −A⁻¹(∂A/∂p_i)x, one solve per parameter. Grouping the product the other way defines the adjoint field by A^T y = (∂F/∂x)^T, so every derivative is −2Re{y^T(∂A/∂p_i)x} and two solves give the whole gradient. For a permittivity pixel this is the local product of forward and adjoint fields. Since A^T = A for reciprocal media, the adjoint problem is the same structure excited at the output with the conjugated forward field, the wanted output sent backwards. A finite-difference check confirms the gradient.",
sheet: [
[String.raw`\[ A(\mathbf{p})\, \mathbf{x} = \mathbf{b} \]`, "Discretized Maxwell (Ch. 3 Eq. 3.2, Michaels Eq. 3)"],
[String.raw`\[ \frac{\partial \mathbf{x}}{\partial p_i} = -A^{-1} \frac{\partial A}{\partial p_i}\mathbf{x} \]`, "Direct route (Michaels Eq. 8)"],
[String.raw`\[ \frac{dF}{dp_i} = 2\operatorname{Re}\left\{ \frac{\partial F}{\partial \mathbf{x}} \frac{\partial \mathbf{x}}{\partial p_i} \right\} \]`, "Chain rule (Michaels Eq. 9)"],
[String.raw`\[ A^{T}\mathbf{y} = \left(\frac{\partial F}{\partial \mathbf{x}}\right)^{T} \]`, "Adjoint system (Ch. 3 Eq. 3.3, Michaels Eq. 11)"],
[String.raw`\[ \frac{dF}{dp_i} = -2\operatorname{Re}\left\{ \mathbf{y}^{T} \frac{\partial A}{\partial p_i}\mathbf{x} \right\} \]`, "Adjoint gradient (Ch. 3 Eq. 3.4, Michaels Eq. 12)"],
[String.raw`\[ \frac{\partial A}{\partial \varepsilon_i} = k_0^2\, \mathbf{e}_i \mathbf{e}_i^{T} \quad\Longrightarrow\quad \frac{\partial F}{\partial \varepsilon_i} = -2k_0^2 \operatorname{Re}\{ y_i x_i \} \]`, "Pixel gradient as a field product"]],
consts: "1D grid step 10 nm, ε between 1 and 12.19, wavelengths in nm. Boundaries are exact one-way conditions for the discrete equation.",
sources: ["Michaels and Yablonovitch, Opt. Express 26, 31717 (2018), Sec. 2 and Eqs. (3), (8), (9), (11), (12) (adjoint method in matrix form)", "Christiansen and Sigmund, J. Opt. Soc. Am. B 38, 496 (2021) (adjoint sensitivity analysis in topology optimization)"]
});

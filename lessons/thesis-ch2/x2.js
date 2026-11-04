/* TODO for this lesson: Beyond the thesis. */
addLesson("thesis", "ch2x", {
level: "Beyond",
id: "thesis-ch2-x2", title: "FDTD stability, dispersion and accuracy", short: "B2. FDTD stability and accuracy",
big: String.raw`Two numbers decide whether an FDTD result can be trusted. The time step must obey the Courant limit or the simulation blows up. And the grid must be fine enough, because on a grid light travels at a slightly wrong speed that depends on the wavelength and direction: numerical dispersion. Along a grid axis the relative phase error is at most \((k\Delta x)^2/24\), about 0.4 % at 20 steps per wavelength. Small, but it accumulates over long devices, which is why interference devices need fine grids and why every result should be reported with its resolution.`,
bridge: "This lesson follows Section 3 of Dohlus and Zagorodnov 2009. Their paper builds a new FDTD scheme for particle accelerators, where the ordinary Yee scheme's phase error piles up over long structures. On the way they write the Yee dispersion and stability in a short, clean form, which is what your Chapter 2 Eq. 2.17 uses.",
cards: [
/* from old ch2 L8 card 5 */
{s: "5. Too big a step", t: "What happens if the time step is too large",
intu: String.raw`The time step cannot be chosen freely. In one time step, information on the grid can only move one cell, because each update only looks at its nearest neighbours. If light would travel more than one cell in one step (\(S = c\Delta t/\Delta x \gt 1\) in 1D), the grid cannot keep up, and the scheme becomes unstable: a tiny ripple at the finest grid scale grows exponentially until it swamps everything. Push \(S\) just above 1 and restart. Below 1 the pulse travels cleanly. Lesson 10 derives the limit properly for 2D and 3D.`,
eq: String.raw`\[ \text{1D stability: } S = \frac{c\,\Delta t}{\Delta x} \le 1 \qquad \text{3D cubic grid: } c\,\Delta t \le \frac{\Delta x}{\sqrt{3}} \]<div class="eqref">Dohlus Eq. 8</div>`,
sym: [[String.raw`\(S\)`, "Courant number"], ["unstable", "errors grow by a factor larger than 1 every step"]],
how: [String.raw`Insert a wave \(e^{i(kx - \omega t)}\) into the update equations.`, String.raw`This gives a relation between \(\omega\) and \(k\) on the grid (the numerical dispersion relation of Lesson 10).`, String.raw`For \(S \gt 1\) some \(k\) give complex \(\omega\) with a growing part.`, "Those wavelengths, the shortest the grid can hold, explode."],
say: "The FDTD time step is limited by the Courant condition. Above it the scheme is unstable and the solution grows without bound.",
num: String.raw`In 1D, \(S = 1\) is the 'magic time step', where the scheme happens to be exact for waves along the grid. In 2D and 3D the limit is \(1/\sqrt{2}\) and \(1/\sqrt{3}\) of a cell per step, so that case cannot be reached.`,
r(fig, ctl) {
  ctl.innerHTML = sl("S", "Courant number S", 0.3, 1.1, 0.01, 0.9) + `<div class="row"><button id="rs">Restart</button></div><div class="readout" id="ro"></div>`;
  let sim; const N = 400;
  const reset = () => { const S = +$("S").value; sim = new C2.FDTD1D(N, S, null, { wall: "pec" }); sim.ez[200] = 1e-6 * (Math.random() - 0.5); };
  $("S").oninput = () => { $("Sv").textContent = (+$("S").value).toFixed(2); reset(); };
  $("Sv").textContent = "0.90"; reset(); $("rs").onclick = reset;
  anim(() => {
    for (let s = 0; s < 2; s++) { const t = sim.t; if (sim.t < 400) sim.step([100, Math.exp(-Math.pow((t - 40) / 12, 2))]); }
    let mx = 0; for (let i = 0; i < N; i++) mx = Math.max(mx, Math.abs(sim.ez[i]));
    const xs = range(0, N - 1, N), ys = Array.from(sim.ez).map(v => Math.max(-1.1, Math.min(1.1, v)));
    fig.innerHTML = svg(230, `<line x1="40" x2="640" y1="115" y2="115" stroke="var(--p)" stroke-width="0.5"/>${plot(40, 20, 600, 190, xs, ys, 0, N - 1, -1.1, 1.1, mx > 2 ? "#D85A30" : "#378ADD", 1.5)}<text class="ts" x="636" y="224" text-anchor="end">step ${sim.t}</text><text class="th" x="340" y="36" text-anchor="middle">${mx > 2 ? "unstable: the field is blowing up" : "stable"}</text>`);
    if ($("ro")) $("ro").innerHTML = `<div><span>largest |E|</span><b>${mx > 1e6 ? mx.toExponential(1) : mx.toFixed(3)}</b></div>`;
  });
}},

/* from old ch2 L10 card 1 */
{s: "1. Courant limit", t: "The Courant limit in 1D, 2D and 3D",
intu: String.raw`In one time step, an update can only use information from neighbouring cells. Light must not travel farther than the grid can pass information in one step. In 1D that is one cell per step. In 2D and 3D, light moving along a diagonal crosses cells fastest, so the limit is stricter: the step must be smaller by \(\sqrt{2}\) or \(\sqrt{3}\) on a square or cubic grid. Dohlus and Zagorodnov write the general rule for a rectangular grid as their Eq. (8). Change the cell sizes and dimension to get the largest stable time step.`,
eq: String.raw`\[ c\,\Delta t \le \left(\frac{1}{\Delta x^2} + \frac{1}{\Delta y^2} + \frac{1}{\Delta z^2}\right)^{-1/2} \]<div class="eqnote">cubic grid</div>\[ c\,\Delta t \le \frac{\Delta x}{\sqrt{3}}\ \text{(3D)}, \qquad \frac{\Delta x}{\sqrt{2}}\ \text{(2D)}, \qquad \Delta x\ \text{(1D)} \]<div class="eqref">Dohlus Eq. 8, with \(\tau = ct\)</div>`,
sym: [[String.raw`\(\Delta t\)`, "time step"], [String.raw`\(\Delta x, \Delta y, \Delta z\)`, "cell sizes"], [String.raw`\(\tau = ct\)`, String.raw`Dohlus and Zagorodnov's scaled time, so \(c\Delta t\) is a length`], ["Courant factor", "the fraction of the limit actually used"]],
how: ["Insert a plane wave into the update equations (von Neumann analysis).", String.raw`This gives \(\sin^2(\omega\Delta t/2)/(c\Delta t)^2 = \sum \sin^2(k_i\Delta x_i/2)/\Delta x_i^2\).`, "The right side is largest for the shortest grid wave on each axis, where each sine is 1.", String.raw`For real \(\omega\) the left side must reach that value, which requires the condition above.`],
say: String.raw`The FDTD time step must satisfy the Courant condition \(c\Delta t \le (\Delta x^{-2} + \Delta y^{-2} + \Delta z^{-2})^{-1/2}\), which on a cubic grid is \(\Delta x/\sqrt{3}\).`,
num: String.raw`Cubic cell 11.4 nm in 3D: \(c\Delta t \le 6.6\) nm, so \(\Delta t \le\) <b>0.022 fs</b>. A 1 ps run needs about <b>45,000</b> steps.`,
r(fig, ctl) {
  ctl.innerHTML = sl("dx", "Δx (nm)", 2, 30, 0.1, 11.4) + sl("dy", "Δy (nm)", 2, 30, 0.1, 11.4) + sl("dz", "Δz (nm)", 2, 30, 0.1, 11.4) + btns([["1", "1D"], ["2", "2D"], ["3", "3D"]], "d") + '<div class="readout" id="ro"></div>';
  let dim = 3;
  const u = () => {
    pick(ctl, "d", dim); const v = ["dx", "dy", "dz"].map(k => +$(k).value);["dx", "dy", "dz"].forEach(k => $(k + "v").textContent = (+$(k).value).toFixed(1));
    const s = v.slice(0, dim).reduce((a, b) => a + 1 / (b * b), 0), cdt = 1 / Math.sqrt(s), dt = cdt * 1e-9 / 3e8 * 1e15;
    fig.innerHTML = svg(220, `<rect x="120" y="40" width="${v[0] * 8}" height="${v[1] * 8}" fill="var(--blue-bg)" stroke="var(--p)"/><line x1="120" y1="${40 + v[1] * 8}" x2="${120 + v[0] * 8}" y2="40" stroke="#D85A30" stroke-width="2" stroke-dasharray="5 4"/><text class="ts" x="${120 + v[0] * 4}" y="${50 + v[1] * 8 + 14}" text-anchor="middle">diagonal sets the limit</text><text class="th" x="520" y="90" text-anchor="middle">largest stable step</text><text class="th" x="520" y="122" text-anchor="middle" style="font-size:22px">cΔt = ${cdt.toFixed(2)} nm</text><text class="ts" x="520" y="148" text-anchor="middle">Δt = ${dt.toFixed(4)} fs</text>`);
    $("ro").innerHTML = `<div><span>cΔt / Δx</span><b>${(cdt / v[0]).toFixed(3)}</b></div><div><span>steps for 1 ps</span><b>${Math.round(1000 / dt).toLocaleString()}</b></div>`;
  };
  ctl.querySelectorAll("button").forEach(b => b.onclick = () => { dim = +b.dataset.d; u(); });
  ["dx", "dy", "dz"].forEach(k => $(k).oninput = u); u();
}},

/* from old ch2 L10 card 2 */
{s: "2. Why it explodes", t: "Why the scheme explodes: the growth factor",
intu: String.raw`Put a single wave of wavenumber \(k\) on the 1D grid and ask how its amplitude changes in one step. That multiplier is the growth factor \(g\). Below the Courant limit, \(|g| = 1\) for every \(k\): waves neither grow nor shrink, they only rotate in phase. Above the limit, the shortest waves on the grid (\(k\Delta x\) near \(\pi\)) get \(|g| \gt 1\), and because they multiply every step, a rounding error of \(10^{-16}\) grows to order 1 within a few hundred steps. The plot shows \(|g|\) against \(k\Delta x\) for your chosen \(S\).`,
eq: String.raw`<div class="eqnote">1D</div>\[ g^2 - 2(1 - 2a^2)\,g + 1 = 0, \qquad a = S \sin\frac{k\Delta x}{2} \]\[ |a| \le 1 \;\Longrightarrow\; |g| = 1 \qquad |a| \gt 1 \;\Longrightarrow\; |g| = 2a^2 - 1 + 2a\sqrt{a^2 - 1} \gt 1 \]`,
sym: [[String.raw`\(g\)`, "amplification of one Fourier component per time step"], [String.raw`\(S\)`, String.raw`\(c\Delta t/\Delta x\)`], [String.raw`\(k\Delta x\)`, String.raw`phase per cell, \(\pi\) is the shortest wave the grid can hold`]],
how: [String.raw`Assume \(E, H \propto g^n e^{ikj\Delta x}\) and substitute into the two update equations.`, String.raw`Eliminating \(H\) gives a quadratic for \(g\).`, String.raw`If its discriminant is negative the two roots are complex with \(|g| = 1\).`, String.raw`If \(S \sin(k\Delta x/2) \gt 1\) the roots are real and one has \(|g| \gt 1\): exponential growth.`],
say: "Above the Courant limit, the shortest grid waves have an amplification factor larger than one per step, so round-off errors grow exponentially.",
num: String.raw`\(S = 1.05\): worst \(|g| = 2(1.1025) - 1 + 2(1.05)\sqrt{0.1025}\) ≈ <b>1.88</b> per step. After 50 steps: \(1.88^{50}\) ≈ <b>\(5 \times 10^{13}\)</b>.`,
r(fig, ctl) {
  ctl.innerHTML = sl("S", "Courant number S (1D)", 0.5, 1.2, 0.01, 1.05) + '<div class="readout" id="ro"></div>';
  const u = () => {
    const S = +$("S").value; $("Sv").textContent = S.toFixed(2);
    const ks = range(0, Math.PI, 200), gs = ks.map(k => { const a = S * Math.sin(k / 2); return a <= 1 ? 1 : 2 * a * a - 1 + 2 * a * Math.sqrt(a * a - 1); });
    const mx = Math.max(...gs);
    fig.innerHTML = svg(240, `${plot(60, 30, 560, 170, ks, gs, 0, Math.PI, 0.8, Math.max(2, mx * 1.05), mx > 1 ? "#D85A30" : "#378ADD", 2.5)}<line x1="60" x2="620" y1="${30 + 170 - (1 - 0.8) / (Math.max(2, mx * 1.05) - 0.8) * 170}" y2="${30 + 170 - (1 - 0.8) / (Math.max(2, mx * 1.05) - 0.8) * 170}" stroke="var(--p)" stroke-dasharray="4 4"/><text class="ts" x="66" y="${24 + 170 - (1 - 0.8) / (Math.max(2, mx * 1.05) - 0.8) * 170}">|g| = 1</text><line x1="60" x2="620" y1="200" y2="200" stroke="var(--p)"/><text class="ts" x="60" y="220">kΔx = 0</text><text class="ts" x="620" y="220" text-anchor="end">π (shortest grid wave)</text>`);
    $("ro").innerHTML = `<div><span>worst |g|</span><b>${mx.toFixed(3)}</b></div><div><span>after 100 steps</span><b>${mx > 1 ? Math.pow(mx, 100).toExponential(1) : "1 (stable)"}</b></div>`;
  };
  $("S").oninput = u; u();
}},

/* from old ch2 L10 card 3 */
{s: "3. Wrong speed", t: "On a grid, light travels at the wrong speed",
intu: String.raw`Even below the Courant limit, a wave on the grid does not travel exactly at \(c\). The finite differences slightly underestimate the derivative, so the grid needs a larger \(k\) to reach the same frequency: the wave is too slow. Dohlus and Zagorodnov write the exact relation for a wave along a grid axis as their Eq. (10). The plot shows the numerical phase velocity against points per wavelength for several Courant numbers. Coarse grids are badly slow. Above about 20 points per wavelength the error is well below 1 %. In 1D at \(S = 1\) the error vanishes, the magic step.`,
eq: String.raw`\[ \frac{\sin(k\Delta x/2)}{\Delta x/2} = \frac{\sin(\omega\Delta t/2)}{c\,\Delta t/2} \]\[ \frac{v_{\mathrm{num}}}{c} = \frac{k_{\mathrm{exact}}}{k_{\mathrm{num}}} \]<div class="eqref">Dohlus Eq. 10, written with \(\Delta\tau = c\,\Delta t\)</div>`,
sym: [[String.raw`\(k\)`, "numerical wavenumber on the grid"], [String.raw`\(\omega\)`, "frequency of the source"], [String.raw`\(v_{\mathrm{num}}\)`, "phase velocity on the grid"], [String.raw`\(N_\lambda\)`, String.raw`points per wavelength, \(2\pi/(k\Delta x)\)`]],
how: ["Put a plane wave along the grid axis into the update equations.", "The centered differences turn derivatives into sines of half the phase per step.", String.raw`The result relates \(\omega\) and \(k\) on the grid, Eq. (10).`, String.raw`Solving for \(k\) at the source frequency and comparing with \(\omega/c\) gives the speed error.`],
say: "On a Yee grid, waves travel slower than in reality by an amount that depends on resolution, Courant number and direction. This numerical dispersion falls as the square of the grid step.",
num: String.raw`\(S = 0.5\), 20 points per wavelength: \(v_{\mathrm{num}}/c\) ≈ <b>0.9969</b> (0.31 % slow).<br>10 points: ≈ <b>0.987</b> (1.3 % slow).`,
r(fig, ctl) {
  ctl.innerHTML = sl("N", "Marker at points per wavelength", 5, 50, 1, 20) + '<div class="readout" id="ro"></div>';
  const Ns = range(5, 50, 100), Ss = [[0.3, "#7F77DD"], [0.5, "#378ADD"], [0.7, "#1D9E75"], [1.0, "#D85A30"]];
  const u = () => {
    const N = +$("N").value; $("Nv").textContent = N;
    let s = ""; Ss.forEach(([S, col]) => s += plot(60, 30, 560, 180, Ns, Ns.map(n => 1 / C2.dispRatio1D(n, S)), 5, 50, 0.9, 1.002, col, 2));
    fig.innerHTML = svg(250, `${s}<line x1="${60 + (N - 5) / 45 * 560}" x2="${60 + (N - 5) / 45 * 560}" y1="30" y2="210" stroke="#EF9F27" stroke-width="2"/><line x1="60" x2="620" y1="210" y2="210" stroke="var(--p)"/><text class="ts" x="54" y="34" text-anchor="end">1.00</text><text class="ts" x="54" y="214" text-anchor="end">0.90</text><text class="ts" x="340" y="232" text-anchor="middle">points per wavelength, 5 to 50. v_num/c for S = 0.3 (purple), 0.5 (blue), 0.7 (teal), 1.0 (coral, 1D magic)</text>`);
    $("ro").innerHTML = Ss.map(([S]) => `<div><span>S = ${S}</span><b>${(1 / C2.dispRatio1D(N, S)).toFixed(5)}</b></div>`).join("");
  };
  $("N").oninput = u; u();
}},

/* from old ch2 L10 card 4 */
{s: "4. The 0.4 % rule", t: "The error bound in your Chapter 2: (kΔx)²/24",
intu: String.raw`Expand Dohlus and Zagorodnov's relation for small \(k\Delta x\) and you get their Eq. (11): the wavenumber error grows as \((\Delta x/2)^2\) minus \((\Delta\tau/2)^2\). The time-step term has the opposite sign and only reduces the error, so dropping it gives an upper bound: \(\delta n/n \le (k\Delta x)^2/24\). Here \(k\) is the wavenumber in the material, which is why resolution is counted as steps per wavelength in the highest-index material. Drag the resolution and the index and read the bound and the cell size.`,
eq: String.raw`\[ \delta k \approx \frac{1}{6}\left(\frac{\omega}{c}\right)^3\left[\left(\frac{\Delta z}{2}\right)^2 - \left(\frac{\Delta\tau}{2}\right)^2\right] \]\[ \frac{\delta n}{n} = \frac{\delta k}{k} \approx \frac{(k\Delta x)^2}{24}\left[1 - \left(\frac{c\,\Delta t}{\Delta x}\right)^2\right] \le \frac{(k\Delta x)^2}{24} \]<div class="eqref">Dohlus Eq. 11, Ch. 2 Eq. 2.17</div>`,
sym: [[String.raw`\(\delta n/n\)`, "relative error in the phase (and so effective index) on the grid"], [String.raw`\(k\)`, String.raw`\(2\pi n/\lambda_0\), the wavenumber in the material`], [String.raw`\(\Delta x\)`, String.raw`cell size, \(\lambda_0/(N_\lambda n)\)`], [String.raw`\(N_\lambda\)`, "steps per wavelength in the material"]],
how: ["Expand both sines in Eq. (10) to third order.", String.raw`The leading correction to \(k\) is \((1/6)(\omega/c)^3[(\Delta z/2)^2 - (\Delta\tau/2)^2]\), Eq. (11).`, String.raw`Divide by \(k = \omega/c\) and drop the negative time-step term for a bound.`, String.raw`With \(k\Delta x = 2\pi/N_\lambda\) the bound is \((2\pi/N_\lambda)^2/24\).`],
say: String.raw`Along a grid axis the relative phase error of the Yee scheme is at most \((k\Delta x)^2/24\), with \(k\) the wavenumber in the material. At 20 steps per wavelength that is about 0.4 %, at 30 about 0.2 %.`,
num: String.raw`20 steps: \((2\pi/20)^2/24\) = <b>0.41 %</b>. 30 steps: <b>0.18 %</b>.<br>\(\lambda_0 = 800\) nm, \(n = 3.5\): 20 steps means \(\Delta x = 800/(20 \times 3.5)\) = <b>11.4 nm</b>.<br>Dohlus and Zagorodnov note the error is direction dependent and can vanish along diagonals (card 6).`,
r(fig, ctl) {
  ctl.innerHTML = sl("N", "Steps per wavelength in the material", 6, 50, 1, 20) + sl("n", "Highest index n", 1, 4, 0.01, 3.5) + sl("S", "Courant number S", 0.1, 0.99, 0.01, 0.57) + '<div class="readout" id="ro"></div>';
  const u = () => {
    const N = +$("N").value, n = +$("n").value, S = +$("S").value; $("Nv").textContent = N; $("nv").textContent = n.toFixed(2); $("Sv").textContent = S.toFixed(2);
    const b = Math.pow(2 * Math.PI / N, 2) / 24, ex = 1 - 1 / C2.dispRatio1D(N, S), dx = 800 / (N * n);
    const Ns = range(6, 50, 90);
    fig.innerHTML = svg(240, `${plot(60, 30, 560, 170, Ns, Ns.map(v => Math.pow(2 * Math.PI / v, 2) / 24 * 100), 6, 50, 0, 3, "#D85A30", 2.5)}${plot(60, 30, 560, 170, Ns, Ns.map(v => (1 - 1 / C2.dispRatio1D(v, S)) * 100), 6, 50, 0, 3, "#378ADD", 2, "5 4")}<line x1="${60 + (N - 6) / 44 * 560}" x2="${60 + (N - 6) / 44 * 560}" y1="30" y2="200" stroke="#EF9F27" stroke-width="2"/><line x1="60" x2="620" y1="200" y2="200" stroke="var(--p)"/><text class="ts" x="54" y="34" text-anchor="end">3 %</text><text class="ts" x="340" y="222" text-anchor="middle">steps per wavelength. Coral: bound (kΔx)²/24. Blue dashed: exact 1D error at this S</text>`);
    $("ro").innerHTML = `<div><span>bound</span><b>${(b * 100).toFixed(3)} %</b></div><div><span>exact (1D, this S)</span><b>${(ex * 100).toFixed(3)} %</b></div><div><span>cell size at 800 nm</span><b>${dx.toFixed(1)} nm</b></div>`;
  };
  ["N", "n", "S"].forEach(k => $(k).oninput = u); u();
}},

/* from old ch2 L10 card 5 */
{s: "5. It adds up", t: "Small errors add up over long devices",
intu: String.raw`A 0.4 % speed error sounds harmless, but phase accumulates with distance. After travelling a length \(L\), the wave's phase is off by about \(2\pi (L/\lambda_m)(\delta n/n)\) radians, where \(\lambda_m\) is the wavelength in the material. Dohlus and Zagorodnov make this point for accelerators in their Eq. (12): the phase error grows in proportion to the structure length. For an interference device like an MMI, whose function depends on the phase difference after many beat lengths, a few degrees of error can shift the operating wavelength. Drag the length and resolution.`,
eq: String.raw`\[ \Delta\varphi \approx 2\pi\, \frac{L}{\lambda_m}\, \frac{\delta n}{n}, \qquad \lambda_m = \frac{\lambda_0}{n} \]<div class="eqref">accumulated phase error, cf. Dohlus Eq. 12</div>`,
sym: [[String.raw`\(\Delta\varphi\)`, String.raw`accumulated phase error after a length \(L\)`], [String.raw`\(L\)`, "propagation length"], [String.raw`\(\lambda_m\)`, "wavelength in the material"], [String.raw`\(\delta n/n\)`, "relative phase velocity error (card 4)"]],
how: [String.raw`Phase after length \(L\): \(\varphi = kL = 2\pi L/\lambda_m\).`, String.raw`A relative error \(\delta n/n\) in \(k\) gives \(\Delta\varphi = \varphi\cdot\delta n/n\).`, String.raw`So the error grows linearly with \(L\).`, "Devices whose output depends on a phase difference are the most sensitive, for example MMIs and interferometers."],
say: "Numerical dispersion produces a phase error that grows linearly with propagation length, so long interference devices need finer grids than short ones, and results should be checked by refining the grid.",
num: String.raw`\(L = 20\) µm, \(\lambda_0 = 800\) nm, \(n = 3.5\) (\(\lambda_m = 229\) nm), 20 steps (0.41 %): \(\Delta\varphi \approx 2\pi \times 87.5 \times 0.0041\) ≈ <b>2.3 rad</b> (bound, along an axis).<br>At 30 steps: ≈ <b>1.0 rad</b>.`,
r(fig, ctl) {
  ctl.innerHTML = sl("L", "Length L (µm)", 1, 100, 1, 20) + sl("N", "Steps per wavelength", 8, 50, 1, 20) + '<div class="readout" id="ro"></div>';
  const u = () => {
    const L = +$("L").value, N = +$("N").value; $("Lv").textContent = L + " µm"; $("Nv").textContent = N;
    const lm = 0.8 / 3.5, b = Math.pow(2 * Math.PI / N, 2) / 24, dphi = 2 * Math.PI * L / lm * b;
    const xs = range(0, 6, 300), ref = xs.map(x => Math.sin(2 * Math.PI * x)), sh = xs.map(x => Math.sin(2 * Math.PI * x - dphi));
    fig.innerHTML = svg(230, `${plot(60, 40, 560, 140, xs, ref, 0, 6, -1.1, 1.1, "#378ADD", 2)}${plot(60, 40, 560, 140, xs, sh, 0, 6, -1.1, 1.1, "#D85A30", 2, "5 4")}<text class="ts" x="60" y="30">field at the end of the device: exact (blue) and simulated (coral dashed)</text><text class="ts" x="340" y="210" text-anchor="middle">phase error ${(dphi * 180 / Math.PI).toFixed(0)}°</text>`);
    $("ro").innerHTML = `<div><span>Δφ (bound)</span><b>${dphi.toFixed(2)} rad</b></div><div><span>in degrees</span><b>${(dphi * 180 / Math.PI).toFixed(1)}°</b></div><div><span>wavelengths travelled</span><b>${(L / lm).toFixed(0)}</b></div>`;
  };
  $("L").oninput = u; $("N").oninput = u; u();
}},

/* from old ch2 L10 card 6 */
{s: "6. Direction matters", t: "The error depends on direction",
intu: "The grid is not round. A wave travelling along a grid axis sees the cells edge-on, one travelling along a diagonal sees them corner-on, and the numerical speed differs. This polar plot shows the speed error against propagation direction for a 2D square grid, computed from the 2D dispersion relation. Along the axes the error is largest. Along the diagonals it is smaller, and at the stability limit it vanishes there, which Dohlus and Zagorodnov note on their page 4 for the 3D cubic grid. This is why Chapter 2 quotes the axis value: it is the worst case for a structure aligned with the grid.",
eq: String.raw`<div class="eqnote">2D</div>\[ \frac{\sin^2(\omega\Delta t/2)}{(c\,\Delta t)^2} = \frac{\sin^2(k_x\Delta x/2)}{\Delta x^2} + \frac{\sin^2(k_y\Delta y/2)}{\Delta y^2} \]\[ k_x = k\cos\varphi, \qquad k_y = k\sin\varphi \]`,
sym: [[String.raw`\(\varphi\)`, String.raw`propagation direction relative to the \(x\) axis`], ["anisotropy", "dependence of the numerical speed on direction"]],
how: ["Use the full multi-dimensional dispersion relation (Dohlus Eq. 9 in 3D, the 2D form above).", String.raw`For each direction \(\varphi\), solve for \(k\) at the source frequency.`, String.raw`Compare with the exact \(k\) to get the speed error.`, String.raw`At \(S = 1/\sqrt{2}\) in 2D the diagonal error is exactly zero.`],
say: "Numerical dispersion is anisotropic: waves along grid axes have the largest phase error, waves along diagonals the smallest, and at the stability limit the diagonal error vanishes.",
num: String.raw`2D, 20 points per wavelength, \(S = 0.5\): axis error ≈ <b>0.31 %</b>, diagonal ≈ <b>0.10 %</b>.<br>At \(S = 0.707\) the diagonal error is <b>0</b>.`,
r(fig, ctl) {
  ctl.innerHTML = sl("N", "Points per wavelength", 5, 40, 1, 10) + sl("S", "Courant number S (2D limit 0.707)", 0.1, 0.707, 0.001, 0.5) + '<div class="readout" id="ro"></div>';
  const u = () => {
    const N = +$("N").value, S = +$("S").value; $("Nv").textContent = N; $("Sv").textContent = S.toFixed(3);
    const phis = range(0, 2 * Math.PI, 181), errs = phis.map(p => C2.dispRatio2D(N, S, p) - 1), mx = Math.max(...errs.filter(isFinite), 1e-9);
    const cx = 220, cy = 130, R = 100; let d = "";
    phis.forEach((p, i) => { const r = R * (0.25 + 0.75 * errs[i] / mx); d += (i ? "L" : "M") + (cx + r * Math.cos(p)).toFixed(1) + " " + (cy - r * Math.sin(p)).toFixed(1); });
    fig.innerHTML = svg(260, `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="var(--b)"/><circle cx="${cx}" cy="${cy}" r="${R * 0.25}" fill="none" stroke="var(--b)" stroke-dasharray="3 3"/><line x1="${cx - R - 10}" x2="${cx + R + 10}" y1="${cy}" y2="${cy}" stroke="var(--p)" stroke-width="0.5"/><line x1="${cx}" x2="${cx}" y1="${cy - R - 10}" y2="${cy + R + 10}" stroke="var(--p)" stroke-width="0.5"/><path d="${d}Z" fill="#D85A30" fill-opacity="0.18" stroke="#D85A30" stroke-width="2"/><text class="ts" x="${cx + R + 14}" y="${cy + 4}">x axis</text><text class="ts" x="${cx + 74}" y="${cy - 74}">diagonal</text><text class="ts" x="430" y="80">radius ∝ speed error</text><text class="ts" x="430" y="98">(inner dashed circle = zero)</text>`);
    $("ro").innerHTML = `<div><span>error along axis</span><b>${(errs[0] * 100).toFixed(3)} %</b></div><div><span>error along diagonal</span><b>${(C2.dispRatio2D(N, S, Math.PI / 4) - 1 < 1e-9 ? 0 : (C2.dispRatio2D(N, S, Math.PI / 4) - 1) * 100).toFixed(3)} %</b></div>`;
  };
  $("N").oninput = u; $("S").oninput = u; u();
}},

/* from old ch2 L9 card 5 */
{s: "5. Geometry on a grid", t: "Curved shapes on a square grid: staircasing",
intu: String.raw`The grid only knows \(\varepsilon\) per cell. A smooth shape, like a circle or a slanted wall, has to be drawn with square pixels, which gives a staircase. That makes the shape slightly wrong in size and position, and the error falls only slowly as the grid is refined. The fix used by MEEP, which Oskooi et al. describe, and by Tidy3D, is subpixel averaging: a cell cut by an interface gets an effective \(\varepsilon\) from the fraction of each material inside it (and, done properly, from the field direction). Then the effective boundary sits in the right place even between grid points. Change the resolution and compare the staircased and the averaged circle.`,
eq: String.raw`\[ \text{staircase: } \varepsilon_{\mathrm{cell}} = \varepsilon(\text{centre of the cell}) \]\[ \text{averaged: } \varepsilon_{\mathrm{cell}} = f\,\varepsilon_1 + (1 - f)\,\varepsilon_2 \quad \text{(simplest form)} \]\[ f = \text{fraction of the cell inside material 1} \]`,
sym: [[String.raw`\(f\)`, "filling fraction of the cell"], ["staircasing", "representing a smooth boundary by whole cells"], ["subpixel averaging", String.raw`assigning an effective \(\varepsilon\) to cells cut by a boundary`]],
how: ["Sample the shape at the centre of each cell: each cell is all one material or all the other.", "The area represented jumps by whole cells as the shape moves, so small changes in shape are invisible until a cell flips.", String.raw`Averaging gives each boundary cell an intermediate \(\varepsilon\), so the represented shape changes smoothly.`, "A careful average that treats field components parallel and normal to the interface differently restores second-order accuracy."],
say: "On a Cartesian grid, curved or slanted boundaries are staircased. Subpixel averaging of the permittivity at boundary cells reduces this error, which is important for small, shape-sensitive features.",
num: "This is one reason inverse-designed shapes are sensitive to grid resolution: a small boundary change only shows up once it moves a whole cell, unless averaging is used.",
r(fig, ctl) {
  ctl.innerHTML = sl("n", "Cells across the circle", 4, 40, 1, 10) + sl("off", "Shift the circle (fraction of a cell)", 0, 1, 0.05, 0.3) + '<div class="readout" id="ro"></div>';
  const u = () => {
    const n = +$("n").value, off = +$("off").value; $("nv").textContent = n; $("offv").textContent = off.toFixed(2);
    const R = n / 2, cx = n / 2 + 1 + off, cy = n / 2 + 1, M = n + 3, cs = 240 / M;
    let s1 = "", s2 = "", A1 = 0, A2 = 0;
    for (let i = 0; i < M; i++) for (let j = 0; j < M; j++) {
      const inC = Math.hypot(i + 0.5 - cx, j + 0.5 - cy) < R ? 1 : 0; let f = 0; const q = 6; for (let a = 0; a < q; a++) for (let b = 0; b < q; b++) if (Math.hypot(i + (a + 0.5) / q - cx, j + (b + 0.5) / q - cy) < R) f++; f /= q * q;
      A1 += inC; A2 += f;
      if (inC) s1 += `<rect x="${40 + i * cs}" y="${20 + j * cs}" width="${cs}" height="${cs}" fill="#378ADD"/>`;
      if (f > 0) s2 += `<rect x="${380 + i * cs}" y="${20 + j * cs}" width="${cs}" height="${cs}" fill="#378ADD" opacity="${f}"/>`;
    }
    const grid = x0 => { let g = ""; for (let k = 0; k <= M; k++) g += `<line x1="${x0 + k * cs}" x2="${x0 + k * cs}" y1="20" y2="${20 + M * cs}" stroke="var(--b)" stroke-width="0.5"/><line x1="${x0}" x2="${x0 + M * cs}" y1="${20 + k * cs}" y2="${20 + k * cs}" stroke="var(--b)" stroke-width="0.5"/>`; return g; };
    const circ = x0 => `<circle cx="${x0 + cx * cs}" cy="${20 + cy * cs}" r="${R * cs}" fill="none" stroke="#D85A30" stroke-width="2"/>`;
    const At = Math.PI * R * R;
    fig.innerHTML = svg(290, `${s1}${grid(40)}${circ(40)}${s2}${grid(380)}${circ(380)}<text class="ts" x="160" y="282" text-anchor="middle">staircase</text><text class="ts" x="500" y="282" text-anchor="middle">subpixel average</text>`);
    $("ro").innerHTML = `<div><span>area error, staircase</span><b>${((A1 / At - 1) * 100).toFixed(1)} %</b></div><div><span>area error, averaged</span><b>${((A2 / At - 1) * 100).toFixed(2)} %</b></div>`;
  };
  $("n").oninput = u; $("off").oninput = u; u();
}},

/* from old ch2 L9 card 6 */
{s: "6. What it costs", t: "How big a 3D simulation gets",
intu: String.raw`A 3D FDTD simulation stores six numbers per cell and updates all of them every step. The cell size is set by the shortest wavelength in the structure: \(\lambda_0\) divided by the steps per wavelength and by the highest index. The time step is tied to the cell size by the Courant limit, so a finer grid also needs more steps for the same physical time. Together the cost grows as the fourth power of the resolution. Change the numbers: going from 20 to 30 steps per wavelength makes the run about five times more expensive. Symmetry planes (Lesson 4) cut the cells by 2 each.`,
eq: String.raw`\[ \Delta x = \frac{\lambda_0}{N_\lambda\, n_{\mathrm{max}}} \qquad \text{cells} = \frac{L_x L_y L_z}{\Delta x^3} \qquad \Delta t \approx \frac{0.99\,\Delta x}{c\sqrt{3}} \]\[ \text{cost} \propto \text{cells} \times \text{steps} \propto N_\lambda^4 \]`,
sym: [[String.raw`\(N_\lambda\)`, "steps per wavelength in the highest-index material"], [String.raw`\(n_{\mathrm{max}}\)`, "largest refractive index in the domain"], [String.raw`\(L_x, L_y, L_z\)`, "domain size"], ["steps", String.raw`number of time steps for the run time \(T\), \(T/\Delta t\)`]],
how: [String.raw`Cell size from resolution: \(\Delta x = \lambda_0/(N_\lambda n_{\mathrm{max}})\).`, String.raw`Number of cells scales as \(N_\lambda^3\).`, String.raw`Courant: \(\Delta t \propto \Delta x\), so the number of time steps for a fixed physical time scales as \(N_\lambda\).`, String.raw`Total work \(\propto N_\lambda^4\). Memory \(\propto N_\lambda^3\).`],
say: "The cost of a 3D FDTD simulation grows as the fourth power of the grid resolution, three powers from the number of cells and one from the time step. Resolution, domain size and symmetry are therefore chosen together.",
num: String.raw`\(\lambda_0 = 800\) nm, \(n = 3.5\), 20 steps per wavelength: \(\Delta x\) = <b>11.4 nm</b>. At 30 steps: <b>7.6 nm</b>.<br>\((30/20)^4\) ≈ <b>5.1×</b> the work.`,
r(fig, ctl) {
  ctl.innerHTML = sl("N", "Steps per wavelength", 8, 40, 1, 20) + sl("Lx", "Domain L_x (µm)", 1, 20, 0.5, 6) + sl("Ly", "Domain L_y (µm)", 1, 10, 0.5, 4) + sl("Lz", "Domain L_z (µm)", 0.5, 6, 0.25, 2) + sl("T", "Run time (ps)", 0.2, 5, 0.1, 1) + `<div class="row"><label>Symmetry planes</label>${[0, 1, 2].map(v => `<button data-s="${v}">${v}</button>`).join("")}</div><div class="readout" id="ro"></div>`;
  let sy = 0;
  const u = () => {
    pick(ctl, "s", sy);
    const N = +$("N").value, Lx = +$("Lx").value, Ly = +$("Ly").value, Lz = +$("Lz").value, T = +$("T").value;["N", "Lx", "Ly", "Lz", "T"].forEach(k => $(k + "v").textContent = (+$(k).value));
    const dx = 0.8 / (N * 3.5), cells = Lx * Ly * Lz / Math.pow(dx, 3) / Math.pow(2, sy), dt = 0.99 * dx * 1e-6 / (3e8 * Math.sqrt(3)), steps = T * 1e-12 / dt, mem = cells * 6 * 4 / 1e9, work = cells * steps;
    const ref = (() => { const d = 0.8 / (20 * 3.5); const c = Lx * Ly * Lz / Math.pow(d, 3) / Math.pow(2, sy); const st = T * 1e-12 / (0.99 * d * 1e-6 / (3e8 * Math.sqrt(3))); return c * st; })();
    const ns = range(8, 40, 33), ws = ns.map(n => Math.pow(n / 20, 4));
    fig.innerHTML = svg(230, `${plot(60, 30, 560, 160, ns, ws, 8, 40, 0, 16, "#378ADD", 2.5)}<line x1="${60 + (N - 8) / 32 * 560}" x2="${60 + (N - 8) / 32 * 560}" y1="30" y2="190" stroke="#EF9F27" stroke-width="2"/><line x1="60" x2="620" y1="190" y2="190" stroke="var(--p)"/><line x1="60" x2="60" y1="30" y2="190" stroke="var(--p)"/><text class="ts" x="340" y="212" text-anchor="middle">relative work versus steps per wavelength (1 at 20), up to 16×</text>`);
    $("ro").innerHTML = `<div><span>cell size</span><b>${(dx * 1000).toFixed(1)} nm</b></div><div><span>cells</span><b>${(cells / 1e6).toFixed(1)} million</b></div><div><span>time steps</span><b>${Math.round(steps).toLocaleString()}</b></div><div><span>field memory</span><b>${mem.toFixed(2)} GB</b></div><div><span>work vs 20 steps</span><b>${(work / ref).toFixed(2)}×</b></div>`;
  };
  ctl.querySelectorAll("button[data-s]").forEach(b => b.onclick = () => { sy = +b.dataset.s; u(); });
  ["N", "Lx", "Ly", "Lz", "T"].forEach(k => $(k).oninput = u); u();
}},

/* from old ch2 L11 card 5 */
{s: "5. Convergence", t: "How do you know the grid is fine enough?",
intu: String.raw`No single run proves that a result is right. The standard check is to repeat the simulation at several resolutions and watch the result settle. For a second-order method like Yee, the error falls roughly as \(1/N^2\) once the grid is fine enough, so the curve flattens. Two resolutions in that regime even let you estimate the converged value by Richardson extrapolation. The curve here is an illustrative example of that behaviour, not a thesis result. Pick the two resolutions used for the estimate. This is the logic behind the rule in your Chapter 2: report every result with the resolution it was computed at.`,
eq: String.raw`\[ Q(N) \approx Q_\infty + \frac{C}{N^2} \quad \text{(second order)} \]<div class="eqnote">Richardson</div>\[ Q_\infty \approx \frac{N_2^2\, Q(N_2) - N_1^2\, Q(N_1)}{N_2^2 - N_1^2} \]`,
sym: [[String.raw`\(Q(N)\)`, String.raw`result (for example a transmission) at \(N\) steps per wavelength`], [String.raw`\(Q_\infty\)`, "the result an infinitely fine grid would give"], [String.raw`\(C\)`, "unknown error constant"], [String.raw`\(N_1, N_2\)`, "two resolutions used for the estimate"]],
how: [String.raw`The phase error is \(\propto (k\Delta x)^2\), so smooth quantities have errors \(\propto 1/N^2\) (Lesson 10).`, String.raw`Write \(Q(N) = Q_\infty + C/N^2\) at two resolutions.`, String.raw`Two equations, two unknowns: eliminate \(C\) to get \(Q_\infty\).`, String.raw`If the extrapolation changes a lot when you swap in a third resolution, the grid is not yet in the \(1/N^2\) regime.`],
say: String.raw`Convergence is shown by refining the grid until the result stops changing. For a second-order scheme the error falls as \(1/N^2\), and two fine resolutions give a Richardson estimate of the converged value.`,
num: String.raw`Illustrative curve: \(Q(N) = 0.70 - 9/N^2\). At \(N = 20\): <b>0.6775</b>, at 30: <b>0.6900</b>. Richardson from 20 and 30: <b>0.7000</b>.`,
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
}}

],
summary: String.raw`The Courant condition \(c\Delta t \le (\Delta x^{-2} + \Delta y^{-2} + \Delta z^{-2})^{-1/2}\) keeps every Fourier component's growth factor at one. Above it the shortest grid waves grow exponentially. Below it waves still travel slightly too slowly: Dohlus and Zagorodnov's Eq. (10) gives the exact relation along an axis, and its expansion, Eq. (11), gives a relative phase error at most \((k\Delta x)^2/24\), about 0.4 % at 20 steps per wavelength in the material. The error accumulates linearly with length and depends on direction, largest along the axes. Long interference devices therefore need fine grids and a convergence check.`,
sheet: [
[String.raw`\[ c\,\Delta t \le \left(\Delta x^{-2} + \Delta y^{-2} + \Delta z^{-2}\right)^{-1/2} \]`, "Courant limit (Dohlus Eq. 8)"],
[String.raw`\[ |g| = 2a^2 - 1 + 2a\sqrt{a^2 - 1}, \qquad a = S\sin(k\Delta x/2) \gt 1 \]`, "Growth factor above the limit"],
[String.raw`\[ \frac{\sin(k\Delta x/2)}{\Delta x/2} = \frac{\sin(\omega\Delta t/2)}{c\,\Delta t/2} \]`, "1D numerical dispersion (Dohlus Eq. 10)"],
[String.raw`\[ \frac{\delta n}{n} \le \frac{(k\Delta x)^2}{24} \]`, "Phase error bound (Ch. 2 Eq. 2.17, Dohlus Eq. 11)"],
[String.raw`\[ \Delta\varphi \approx 2\pi\, \frac{L}{\lambda_m}\, \frac{\delta n}{n} \]`, "Accumulated phase error"]],
consts: String.raw`Examples: \(\lambda_0 = 800\) nm, \(n = 3.5\).`,
sources: ["Dohlus and Zagorodnov, J. Comput. Phys. 228, 2822 (2009), Sec. 3, Eqs. (8) to (12) (FDTD scheme for accelerator simulations, Yee dispersion and stability)", "Oskooi et al., Comput. Phys. Commun. 181, 687 (2010) (FDTD discretization)"]
});

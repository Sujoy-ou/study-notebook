addLesson("thesis", "ch2", {
level: "Pro",
id: "thesis-ch2-l10", title: "FDTD 3: stability and numerical dispersion", short: "10. FDTD 3: stability and dispersion",
big: "Two numbers decide whether an FDTD result can be trusted. The time step must obey the Courant limit or the simulation blows up. And the grid must be fine enough, because on a grid light travels at a slightly wrong speed that depends on the wavelength and direction: numerical dispersion. Along a grid axis the relative phase error is at most (kΔx)²/24, about 0.4 % at 20 steps per wavelength. Small, but it accumulates over long devices, which is why interference devices need fine grids and why every result should be reported with its resolution.",
bridge: "This lesson follows Section 3 of Dohlus and Zagorodnov 2009. Their paper builds a new FDTD scheme for particle accelerators, where the ordinary Yee scheme's phase error piles up over long structures. On the way they write the Yee dispersion and stability in a short, clean form, which is what your Chapter 2 Eq. 2.17 uses.",
cards: [
{s: "1. Courant limit", t: "The Courant limit in 1D, 2D and 3D",
intu: "In one time step, an update can only use information from neighbouring cells. Light must not travel farther than the grid can pass information in one step. In 1D that is one cell per step. In 2D and 3D, light moving along a diagonal crosses cells fastest, so the limit is stricter: the step must be smaller by √2 or √3 on a square or cubic grid. Dohlus and Zagorodnov write the general rule for a rectangular grid as their Eq. (8). Change the cell sizes and dimension to get the largest stable time step.",
eq: String.raw`\[ c\,\Delta t \le \left(\frac{1}{\Delta x^2} + \frac{1}{\Delta y^2} + \frac{1}{\Delta z^2}\right)^{-1/2} \]<div class="eqnote">cubic grid</div>\[ c\,\Delta t \le \frac{\Delta x}{\sqrt{3}}\ \text{(3D)}, \qquad \frac{\Delta x}{\sqrt{2}}\ \text{(2D)}, \qquad \Delta x\ \text{(1D)} \]<div class="eqref">Dohlus Eq. 8, with \(\tau = ct\)</div>`,
sym: [[String.raw`\(\Delta t\)`, "time step"], [String.raw`\(\Delta x, \Delta y, \Delta z\)`, "cell sizes"], [String.raw`\(\tau = ct\)`, "Dohlus and Zagorodnov's scaled time, so cΔt is a length"], ["Courant factor", "the fraction of the limit actually used"]],
how: ["Insert a plane wave into the update equations (von Neumann analysis).", "This gives sin²(ωΔt/2)/(cΔt)² = Σ sin²(k_iΔx_i/2)/Δx_i².", "The right side is largest for the shortest grid wave on each axis, where each sine is 1.", "For real ω the left side must reach that value, which requires the condition above."],
say: "The FDTD time step must satisfy the Courant condition cΔt ≤ (Δx⁻² + Δy⁻² + Δz⁻²)^(−1/2), which on a cubic grid is Δx/√3.",
num: "Cubic cell 11.4 nm in 3D: cΔt ≤ 6.6 nm, so Δt ≤ <b>0.022 fs</b>. A 1 ps run needs about <b>45,000</b> steps.",
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

{s: "2. Why it explodes", t: "Why the scheme explodes: the growth factor",
intu: "Put a single wave of wavenumber k on the 1D grid and ask how its amplitude changes in one step. That multiplier is the growth factor g. Below the Courant limit, |g| = 1 for every k: waves neither grow nor shrink, they only rotate in phase. Above the limit, the shortest waves on the grid (kΔx near π) get |g| > 1, and because they multiply every step, a rounding error of 10⁻¹⁶ grows to order 1 within a few hundred steps. The plot shows |g| against kΔx for your chosen S.",
eq: String.raw`<div class="eqnote">1D</div>\[ g^2 - 2(1 - 2a^2)\,g + 1 = 0, \qquad a = S \sin\frac{k\Delta x}{2} \]\[ |a| \le 1 \;\Longrightarrow\; |g| = 1 \qquad |a| \gt 1 \;\Longrightarrow\; |g| = 2a^2 - 1 + 2a\sqrt{a^2 - 1} \gt 1 \]`,
sym: [[String.raw`\(g\)`, "amplification of one Fourier component per time step"], [String.raw`\(S\)`, "cΔt/Δx"], [String.raw`\(k\Delta x\)`, "phase per cell, π is the shortest wave the grid can hold"]],
how: ["Assume E, H ∝ gⁿ e^(ikjΔx) and substitute into the two update equations.", "Eliminating H gives a quadratic for g.", "If its discriminant is negative the two roots are complex with |g| = 1.", "If S sin(kΔx/2) > 1 the roots are real and one has |g| > 1: exponential growth."],
say: "Above the Courant limit, the shortest grid waves have an amplification factor larger than one per step, so round-off errors grow exponentially.",
num: "S = 1.05: worst |g| = 2(1.1025) − 1 + 2(1.05)√(0.1025) ≈ <b>1.88</b> per step. After 50 steps: 1.88⁵⁰ ≈ <b>5 × 10¹³</b>.",
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

{s: "3. Wrong speed", t: "On a grid, light travels at the wrong speed",
intu: "Even below the Courant limit, a wave on the grid does not travel exactly at c. The finite differences slightly underestimate the derivative, so the grid needs a larger k to reach the same frequency: the wave is too slow. Dohlus and Zagorodnov write the exact relation for a wave along a grid axis as their Eq. (10). The plot shows the numerical phase velocity against points per wavelength for several Courant numbers. Coarse grids are badly slow. Above about 20 points per wavelength the error is well below 1 %. In 1D at S = 1 the error vanishes, the magic step.",
eq: String.raw`\[ \frac{\sin(k\Delta x/2)}{\Delta x/2} = \frac{\sin(\omega\Delta t/2)}{c\,\Delta t/2} \]\[ \frac{v_{\mathrm{num}}}{c} = \frac{k_{\mathrm{exact}}}{k_{\mathrm{num}}} \]<div class="eqref">Dohlus Eq. 10, written with \(\Delta\tau = c\,\Delta t\)</div>`,
sym: [[String.raw`\(k\)`, "numerical wavenumber on the grid"], [String.raw`\(\omega\)`, "frequency of the source"], [String.raw`\(v_{\mathrm{num}}\)`, "phase velocity on the grid"], [String.raw`\(N_\lambda\)`, "points per wavelength, 2π/(kΔx)"]],
how: ["Put a plane wave along the grid axis into the update equations.", "The centered differences turn derivatives into sines of half the phase per step.", "The result relates ω and k on the grid, Eq. (10).", "Solving for k at the source frequency and comparing with ω/c gives the speed error."],
say: "On a Yee grid, waves travel slower than in reality by an amount that depends on resolution, Courant number and direction. This numerical dispersion falls as the square of the grid step.",
num: "S = 0.5, 20 points per wavelength: v<sub>num</sub>/c ≈ <b>0.9969</b> (0.31 % slow).<br>10 points: ≈ <b>0.987</b> (1.3 % slow).",
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

{s: "4. The 0.4 % rule", t: "The error bound in your Chapter 2: (kΔx)²/24",
intu: "Expand Dohlus and Zagorodnov's relation for small kΔx and you get their Eq. (11): the wavenumber error grows as (Δx/2)² minus (Δτ/2)². The time-step term has the opposite sign and only reduces the error, so dropping it gives an upper bound: δn/n ≤ (kΔx)²/24. Here k is the wavenumber in the material, which is why resolution is counted as steps per wavelength in the highest-index material. Drag the resolution and the index and read the bound and the cell size.",
eq: String.raw`\[ \delta k \approx \frac{1}{6}\left(\frac{\omega}{c}\right)^3\left[\left(\frac{\Delta z}{2}\right)^2 - \left(\frac{\Delta\tau}{2}\right)^2\right] \]\[ \frac{\delta n}{n} = \frac{\delta k}{k} \approx \frac{(k\Delta x)^2}{24}\left[1 - \left(\frac{c\,\Delta t}{\Delta x}\right)^2\right] \le \frac{(k\Delta x)^2}{24} \]<div class="eqref">Dohlus Eq. 11, Ch. 2 Eq. 2.17</div>`,
sym: [[String.raw`\(\delta n/n\)`, "relative error in the phase (and so effective index) on the grid"], [String.raw`\(k\)`, "2πn/λ₀, the wavenumber in the material"], [String.raw`\(\Delta x\)`, "cell size, λ₀/(N_λn)"], [String.raw`\(N_\lambda\)`, "steps per wavelength in the material"]],
how: ["Expand both sines in Eq. (10) to third order.", "The leading correction to k is (1/6)(ω/c)³[(Δz/2)² − (Δτ/2)²], Eq. (11).", "Divide by k = ω/c and drop the negative time-step term for a bound.", "With kΔx = 2π/N_λ the bound is (2π/N_λ)²/24."],
say: "Along a grid axis the relative phase error of the Yee scheme is at most (kΔx)²/24, with k the wavenumber in the material. At 20 steps per wavelength that is about 0.4 %, at 30 about 0.2 %.",
num: "20 steps: (2π/20)²/24 = <b>0.41 %</b>. 30 steps: <b>0.18 %</b>.<br>λ₀ = 800 nm, n = 3.5: 20 steps means Δx = 800/(20 × 3.5) = <b>11.4 nm</b>.<br>Dohlus and Zagorodnov note the error is direction dependent and can vanish along diagonals (card 6).",
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

{s: "5. It adds up", t: "Small errors add up over long devices",
intu: "A 0.4 % speed error sounds harmless, but phase accumulates with distance. After travelling a length L, the wave's phase is off by about 2π (L/λ<sub>m</sub>)(δn/n) radians, where λ<sub>m</sub> is the wavelength in the material. Dohlus and Zagorodnov make this point for accelerators in their Eq. (12): the phase error grows in proportion to the structure length. For an interference device like an MMI, whose function depends on the phase difference after many beat lengths, a few degrees of error can shift the operating wavelength. Drag the length and resolution.",
eq: String.raw`\[ \Delta\varphi \approx 2\pi\, \frac{L}{\lambda_m}\, \frac{\delta n}{n}, \qquad \lambda_m = \frac{\lambda_0}{n} \]<div class="eqref">accumulated phase error, cf. Dohlus Eq. 12</div>`,
sym: [[String.raw`\(\Delta\varphi\)`, "accumulated phase error after a length L"], [String.raw`\(L\)`, "propagation length"], [String.raw`\(\lambda_m\)`, "wavelength in the material"], [String.raw`\(\delta n/n\)`, "relative phase velocity error (card 4)"]],
how: ["Phase after length L: φ = kL = 2πL/λ_m.", "A relative error δn/n in k gives Δφ = φ·δn/n.", "So the error grows linearly with L.", "Devices whose output depends on a phase difference are the most sensitive, for example MMIs and interferometers."],
say: "Numerical dispersion produces a phase error that grows linearly with propagation length, so long interference devices need finer grids than short ones, and results should be checked by refining the grid.",
num: "L = 20 µm, λ₀ = 800 nm, n = 3.5 (λ<sub>m</sub> = 229 nm), 20 steps (0.41 %): Δφ ≈ 2π × 87.5 × 0.0041 ≈ <b>2.3 rad</b> (bound, along an axis).<br>At 30 steps: ≈ <b>1.0 rad</b>.",
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

{s: "6. Direction matters", t: "The error depends on direction",
intu: "The grid is not round. A wave travelling along a grid axis sees the cells edge-on, one travelling along a diagonal sees them corner-on, and the numerical speed differs. This polar plot shows the speed error against propagation direction for a 2D square grid, computed from the 2D dispersion relation. Along the axes the error is largest. Along the diagonals it is smaller, and at the stability limit it vanishes there, which Dohlus and Zagorodnov note on their page 4 for the 3D cubic grid. This is why Chapter 2 quotes the axis value: it is the worst case for a structure aligned with the grid.",
eq: String.raw`<div class="eqnote">2D</div>\[ \frac{\sin^2(\omega\Delta t/2)}{(c\,\Delta t)^2} = \frac{\sin^2(k_x\Delta x/2)}{\Delta x^2} + \frac{\sin^2(k_y\Delta y/2)}{\Delta y^2} \]\[ k_x = k\cos\varphi, \qquad k_y = k\sin\varphi \]`,
sym: [[String.raw`\(\varphi\)`, "propagation direction relative to the x axis"], ["anisotropy", "dependence of the numerical speed on direction"]],
how: ["Use the full multi-dimensional dispersion relation (Dohlus Eq. 9 in 3D, the 2D form above).", "For each direction φ, solve for k at the source frequency.", "Compare with the exact k to get the speed error.", "At S = 1/√2 in 2D the diagonal error is exactly zero."],
say: "Numerical dispersion is anisotropic: waves along grid axes have the largest phase error, waves along diagonals the smallest, and at the stability limit the diagonal error vanishes.",
num: "2D, 20 points per wavelength, S = 0.5: axis error ≈ <b>0.31 %</b>, diagonal ≈ <b>0.10 %</b>.<br>At S = 0.707 the diagonal error is <b>0</b>.",
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
}}
],
summary: "The Courant condition cΔt ≤ (Δx⁻² + Δy⁻² + Δz⁻²)^(−1/2) keeps every Fourier component's growth factor at one. Above it the shortest grid waves grow exponentially. Below it waves still travel slightly too slowly: Dohlus and Zagorodnov's Eq. (10) gives the exact relation along an axis, and its expansion, Eq. (11), gives a relative phase error at most (kΔx)²/24, about 0.4 % at 20 steps per wavelength in the material. The error accumulates linearly with length and depends on direction, largest along the axes. Long interference devices therefore need fine grids and a convergence check.",
sheet: [
[String.raw`\[ c\,\Delta t \le \left(\Delta x^{-2} + \Delta y^{-2} + \Delta z^{-2}\right)^{-1/2} \]`, "Courant limit (Dohlus Eq. 8)"],
[String.raw`\[ |g| = 2a^2 - 1 + 2a\sqrt{a^2 - 1}, \qquad a = S\sin(k\Delta x/2) \gt 1 \]`, "Growth factor above the limit"],
[String.raw`\[ \frac{\sin(k\Delta x/2)}{\Delta x/2} = \frac{\sin(\omega\Delta t/2)}{c\,\Delta t/2} \]`, "1D numerical dispersion (Dohlus Eq. 10)"],
[String.raw`\[ \frac{\delta n}{n} \le \frac{(k\Delta x)^2}{24} \]`, "Phase error bound (Ch. 2 Eq. 2.17, Dohlus Eq. 11)"],
[String.raw`\[ \Delta\varphi \approx 2\pi\, \frac{L}{\lambda_m}\, \frac{\delta n}{n} \]`, "Accumulated phase error"]],
consts: "Examples: λ₀ = 800 nm, n = 3.5.",
sources: ["Dohlus and Zagorodnov, J. Comput. Phys. 228, 2822 (2009), Sec. 3, Eqs. (8) to (12) (FDTD scheme for accelerator simulations, Yee dispersion and stability)", "Oskooi et al., Comput. Phys. Commun. 181, 687 (2010) (FDTD discretization)"]
});

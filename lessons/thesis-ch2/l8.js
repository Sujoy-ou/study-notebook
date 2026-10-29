addLesson("thesis", "ch2", {
level: "Advanced",
id: "thesis-ch2-l8", title: "FDTD 1: from Maxwell to update equations", short: "8. FDTD 1: the update equations",
big: String.raw`FDTD takes Maxwell's two curl equations and marches them forward in time on a grid. Derivatives become differences between neighbouring grid values. The trick that makes it accurate and simple is staggering: \(\mathbf{E}\) and \(\mathbf{H}\) live half a cell apart in space and half a step apart in time, so every difference is a centered one. Then each field is updated from the other, back and forth, a leapfrog. One run with a short pulse gives the whole spectrum at once.`,
bridge: "Your Chapter 2 writes Maxwell's equations in the form of Oskooi et al. 2010, Eqs. (1) and (2), the MEEP paper. MEEP is a free FDTD package from MIT, and the paper explains its design: the Yee grid, the leapfrog, PML, sources and subpixel averaging. Tidy3D uses the same standard Yee scheme. The 1D simulations on this page run live in your browser.",
cards: [
{s: "1. Maxwell", t: "The two equations FDTD solves",
intu: String.raw`Only the two curl equations are needed. The first says a magnetic field that circulates around a line makes the electric field along that line grow. The second says a circulating electric field makes the magnetic field change, with a minus sign. A light wave is these two feeding each other: \(\mathbf{E}\) changes in space, which pushes \(\mathbf{H}\), which changes in space, which pushes \(\mathbf{E}\), and the pattern moves forward. Watch the plane wave: \(\mathbf{E}\) (blue) and \(\mathbf{H}\) (coral) are perpendicular, in phase, and move together. Changing the index slows the wave and changes the \(\mathbf{E}\) to \(\mathbf{H}\) ratio.`,
eq: String.raw`\[ \frac{\partial \mathbf{E}}{\partial t} = \frac{1}{\varepsilon_0 \varepsilon_r} \nabla \times \mathbf{H} \qquad \frac{\partial \mathbf{H}}{\partial t} = -\frac{1}{\mu_0} \nabla \times \mathbf{E} \]<div class="eqnote">1D (wave along \(x\), \(\mathbf{E} = E_z\hat{\mathbf{z}}\), \(\mathbf{H} = H_y\hat{\mathbf{y}}\))</div>\[ \frac{\partial E_z}{\partial t} = \frac{1}{\varepsilon} \frac{\partial H_y}{\partial x}, \qquad \frac{\partial H_y}{\partial t} = \frac{1}{\mu_0} \frac{\partial E_z}{\partial x} \]<div class="eqref">Ch. 2 Eq. 2.16, Oskooi Eqs. 1 and 2</div>`,
sym: [[String.raw`\(\varepsilon_0, \mu_0\)`, "vacuum permittivity and permeability"], [String.raw`\(\varepsilon_r\)`, String.raw`relative permittivity of the material, \(n^2\)`], [String.raw`\(\nabla \times\)`, "curl: how much a field circulates around a point"], [String.raw`\(E_z, H_y\)`, String.raw`the two field components of a wave travelling along \(x\)`]],
how: [String.raw`Start from Ampère's law with no free current, \(\nabla \times \mathbf{H} = \partial\mathbf{D}/\partial t\), with \(\mathbf{D} = \varepsilon_0\varepsilon_r\mathbf{E}\).`, String.raw`Faraday's law: \(\nabla \times \mathbf{E} = -\partial\mathbf{B}/\partial t\), with \(\mathbf{B} = \mu_0\mathbf{H}\).`, String.raw`Oskooi et al. write these with \(\mathbf{D}\) and \(\mathbf{B}\). Substituting the material relations gives the form above.`, String.raw`For fields that depend only on \(x\), the curls reduce to single \(x\) derivatives.`],
say: "FDTD solves the two Maxwell curl equations directly in the time domain. The divergence equations are satisfied automatically by the Yee scheme if they hold initially.",
num: String.raw`Speed in a material: \(c/n\). For \(n = 3.5\) the wave travels at <b>\(0.29c\)</b>.<br>Ratio \(|\mathbf{E}|/|\mathbf{H}| = \eta_0/n\) with \(\eta_0\) = <b>377 Ω</b>.`,
r(fig, ctl) {
  ctl.innerHTML = sl("n", "Refractive index n", 1, 3.5, 0.01, 1);
  anim(t => {
    const n = $("n") ? +$("n").value : 1; if ($("nv")) $("nv").textContent = n.toFixed(2);
    const xs = range(0, 6, 200), k = 2 * Math.PI * n / 2, w = 2 * Math.PI * 0.4;
    const E = xs.map(x => Math.sin(k * x - w * t)), H = xs.map(x => Math.sin(k * x - w * t) / n);
    let ea = "", ha = ""; for (let i = 0; i < 200; i += 8) { const X = 60 + xs[i] / 6 * 560; ea += `<line x1="${X}" y1="120" x2="${X}" y2="${120 - E[i] * 70}" stroke="#378ADD" stroke-width="1.2"/>`; ha += `<line x1="${X}" y1="120" x2="${X + H[i] * 40 * 0.6}" y2="${120 + H[i] * 40 * 0.6}" stroke="#D85A30" stroke-width="1.2"/>`; }
    fig.innerHTML = svg(250, `<line x1="50" x2="630" y1="120" y2="120" stroke="var(--p)" marker-end="url(#ar)"/><text class="ts" x="634" y="124">x</text>${ea}${ha}${plot(60, 50, 560, 140, xs, E, 0, 6, -1, 1, "#378ADD", 2.5)}<text class="ts" x="60" y="30">blue: E_z (up), coral: H_y (into the page, drawn slanted). Wave moves right.</text><text class="ts" x="340" y="236" text-anchor="middle">n = ${n.toFixed(2)}: wavelength and speed both shrink by n</text>`);
  });
  $("n").oninput = () => {};
}},

{s: "2. Differences", t: "Derivatives on a grid: why centered differences",
intu: String.raw`A computer stores the field only at grid points \(\Delta x\) apart. A derivative becomes a difference. The forward difference (value ahead minus value here) is the obvious choice, but it is lopsided and its error shrinks only in proportion to \(\Delta x\). The centered difference (value half a step ahead minus half a step behind) is symmetric, and its error shrinks as \(\Delta x^2\), much faster. The plot is computed for a sine wave: error against points per wavelength on log scales. The centered line falls twice as steeply. FDTD is built so that every derivative is centered.`,
eq: String.raw`<div class="eqnote">forward</div>\[ f'(x) \approx \frac{f(x + \Delta x) - f(x)}{\Delta x}, \qquad \text{error} \propto \Delta x \]<div class="eqnote">centered</div>\[ f'(x) \approx \frac{f(x + \Delta x/2) - f(x - \Delta x/2)}{\Delta x}, \qquad \text{error} \approx \frac{f'''\,\Delta x^2}{24} \]`,
sym: [[String.raw`\(\Delta x\)`, "grid spacing"], [String.raw`\(f', f'''\)`, "first and third derivatives"], ["points per wavelength", String.raw`\(\lambda/\Delta x\), the usual way to state resolution`]],
how: [String.raw`Taylor expand \(f(x \pm \Delta x/2) = f \pm (\Delta x/2)f' + (\Delta x^2/8)f'' \pm (\Delta x^3/48)f''' + \dots\)`, String.raw`Subtract: even terms cancel, leaving \(\Delta x\, f' + (\Delta x^3/24)f'''\).`, String.raw`Divide by \(\Delta x\): the error is \((\Delta x^2/24)f'''\), second order.`, String.raw`The forward difference keeps the \(f''\) term, so its error is \((\Delta x/2)f''\), first order.`],
say: "FDTD uses centered differences, which are second-order accurate: halving the grid step cuts the derivative error by four.",
num: String.raw`For \(\sin(kx)\), centered relative error = \((k\Delta x)^2/24\) at the worst point.<br>20 points per wavelength: \((2\pi/20)^2/24\) ≈ <b>0.41 %</b>. The same number reappears as the phase error bound in Lesson 10.`,
r(fig, ctl) {
  ctl.innerHTML = sl("N", "Points per wavelength", 4, 60, 1, 20) + '<div class="readout" id="ro"></div>';
  const errs = N => { const k = 2 * Math.PI, dx = 1 / N; let ef = 0, ec = 0; for (let x = 0; x < 1; x += 0.01) { const tr = k * Math.cos(k * x); ef = Math.max(ef, Math.abs((Math.sin(k * (x + dx)) - Math.sin(k * x)) / dx - tr) / k); ec = Math.max(ec, Math.abs((Math.sin(k * (x + dx / 2)) - Math.sin(k * (x - dx / 2))) / dx - tr) / k); } return [ef, ec]; };
  const Ns = range(4, 60, 57), E = Ns.map(errs);
  const u = () => {
    const N = +$("N").value; $("Nv").textContent = N; const [ef, ec] = errs(N);
    const X = v => 60 + (Math.log10(v) - Math.log10(4)) / (Math.log10(60) - Math.log10(4)) * 560, Y = v => 30 + (-Math.log10(v)) / 4 * 190;
    const pth = idx => { let d = ""; Ns.forEach((n, i) => { d += (i ? "L" : "M") + X(n).toFixed(1) + " " + Y(Math.max(E[i][idx], 1e-4)).toFixed(1); }); return d; };
    let grid = ""; [1, 0.1, 0.01, 0.001, 0.0001].forEach(v => grid += `<line x1="60" x2="620" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--b)" stroke-width="0.5"/><text class="ts" x="54" y="${Y(v) + 4}" text-anchor="end">${v * 100} %</text>`);
    fig.innerHTML = svg(260, `${grid}<path d="${pth(0)}" fill="none" stroke="#D85A30" stroke-width="2.5"/><path d="${pth(1)}" fill="none" stroke="#378ADD" stroke-width="2.5"/><line x1="${X(N)}" x2="${X(N)}" y1="30" y2="220" stroke="#EF9F27" stroke-width="2"/><text class="ts" x="340" y="244" text-anchor="middle">points per wavelength, 4 to 60 (log). Coral: forward, blue: centered</text>`);
    $("ro").innerHTML = `<div><span>forward error</span><b>${(ef * 100).toFixed(2)} %</b></div><div><span>centered error</span><b>${(ec * 100).toFixed(3)} %</b></div><div><span>(kΔx)²/24</span><b>${(Math.pow(2 * Math.PI / N, 2) / 24 * 100).toFixed(3)} %</b></div>`;
  };
  $("N").oninput = u; u();
}},

{s: "3. Leapfrog", t: "The staggered grid and the leapfrog",
intu: String.raw`To make every difference centered, \(E\) and \(H\) are not stored at the same places. \(E\) sits on whole grid points, \(H\) halfway between them. In time, \(E\) is known at whole steps and \(H\) at half steps. Now look at the update: the new \(H\) at a half-point uses the two \(E\) values on either side, a centered difference in space, and its own old value half a step back, a centered difference in time. Then the new \(E\) uses the two freshly updated \(H\) values beside it. Step through the space-time diagram: each step, one row of values is computed from the row below.`,
eq: String.raw`\[ \begin{aligned} H_y\big|_{i+1/2}^{n+1/2} &= H_y\big|_{i+1/2}^{n-1/2} + \frac{\Delta t}{\mu_0 \Delta x}\left(E_z\big|_{i+1}^{n} - E_z\big|_{i}^{n}\right) \\ E_z\big|_{i}^{n+1} &= E_z\big|_{i}^{n} + \frac{\Delta t}{\varepsilon \Delta x}\left(H_y\big|_{i+1/2}^{n+1/2} - H_y\big|_{i-1/2}^{n+1/2}\right) \end{aligned} \]`,
sym: [[String.raw`\(i,\ i + 1/2\)`, String.raw`\(E\) positions and \(H\) positions along \(x\)`], [String.raw`\(n,\ n + 1/2\)`, String.raw`\(E\) times and \(H\) times`], [String.raw`\(\Delta t\)`, "time step"], ["leapfrog", String.raw`\(H\) jumps over \(E\), then \(E\) jumps over \(H\)`]],
how: [String.raw`Write \(\partial H_y/\partial t = (1/\mu_0)\partial E_z/\partial x\) at the point \((i + 1/2, n)\).`, "Replace both derivatives by centered differences around that point.", String.raw`Solve for the newest value \(H_y\) at \(n + 1/2\). Do the same for \(E_z\) at \((i, n + 1/2)\).`, String.raw`Oskooi et al. describe exactly this alternating half-step update of \(E\) and \(H\) (their Secs. 2 and 3), and Dohlus and Zagorodnov write it as their Eq. (7).`],
say: String.raw`In FDTD, \(\mathbf{E}\) and \(\mathbf{H}\) are staggered by half a cell in space and half a step in time, and updated alternately in a leapfrog. All derivatives are then centered and second-order accurate.`,
num: "Each update uses only the nearest neighbours, so one time step costs a fixed few operations per cell. That is why FDTD scales well to big 3D problems.",
r(fig, ctl) {
  let k = 0;
  ctl.innerHTML = `<div class="row"><button id="lb">Back</button><button id="ln">Next half step</button><span class="note" id="lt"></span></div>`;
  const u = () => {
    const X = i => 100 + i * 80, Y = s => 230 - s * 40;
    let s = "";
    for (let row = 0; row <= 4; row++) { const isE = row % 2 === 0; for (let i = 0; i < 6; i++) { const x = isE ? X(i) : X(i) + 40; if (!isE && i === 5) continue; const done = row <= k; s += isE ? `<circle cx="${x}" cy="${Y(row)}" r="7" fill="${done ? "#378ADD" : "none"}" stroke="#378ADD" stroke-width="1.5"/>` : `<rect x="${x - 7}" y="${Y(row) - 7}" width="14" height="14" fill="${done ? "#D85A30" : "none"}" stroke="#D85A30" stroke-width="1.5"/>`; } s += `<text class="ts" x="60" y="${Y(row) + 4}" text-anchor="end">${isE ? "E, n = " + row / 2 : "H, n = " + ((row - 1) / 2 + 0.5)}</text>`; }
    if (k >= 1 && k <= 4) { const isE = k % 2 === 0, i = 2, x = isE ? X(i) : X(i) + 40; const y = Y(k); const nb = isE ? [[X(i) - 40, Y(k - 1)], [X(i) + 40, Y(k - 1)]] : [[X(i), Y(k - 1)], [X(i + 1), Y(k - 1)]]; nb.forEach(([a, b]) => s += `<line x1="${a}" y1="${b - 8}" x2="${x}" y2="${y + 9}" stroke="#EF9F27" stroke-width="2" marker-end="url(#ar)"/>`); s += `<line x1="${x}" y1="${Y(k - 2) - 8}" x2="${x}" y2="${y + 9}" stroke="#7F77DD" stroke-width="1.5" stroke-dasharray="4 3" marker-end="url(#ar)"/>`; }
    fig.innerHTML = svg(270, `${s}<line x1="80" x2="620" y1="255" y2="255" stroke="var(--p)" marker-end="url(#ar)"/><text class="ts" x="624" y="259">x</text><text class="ts" x="340" y="20" text-anchor="middle">time runs upward. Filled: already computed. Orange: neighbours used. Purple dashed: own old value</text>`);
    $("lt").textContent = k === 0 ? "start: E known at n = 0" : k % 2 ? "update H from the E row below" : "update E from the H row below"; $("lb").disabled = k === 0; $("ln").disabled = k === 4;
  };
  $("lb").onclick = () => { k--; u(); }; $("ln").onclick = () => { k++; u(); }; u();
}},

{s: "4. Run it", t: "A live 1D FDTD simulation",
intu: String.raw`This is a real FDTD simulation running in your browser with exactly the update equations of card 3, in units where \(\Delta x = 1\) and \(c = 1\). A short pulse starts at the left, travels right, and meets a dielectric slab (shaded). Watch three things. Part of the pulse reflects at the slab's front face, as Lesson 6 predicts. Inside the slab the pulse is squeezed and slows to \(c/n\). Several echoes leak out as the pulse bounces inside the slab: that is a Fabry-Perot resonator in the time domain. Change the slab permittivity and press restart.`,
eq: String.raw`<div class="eqnote">normalized units</div>\[ \Delta x = 1, \quad c = 1, \quad S = \frac{c\,\Delta t}{\Delta x} = 0.5 \]\[ H_i \leftarrow H_i + S\,(E_{i+1} - E_i), \qquad E_i \leftarrow E_i + \frac{S}{\varepsilon_i}\,(H_i - H_{i-1}) \]`,
sym: [[String.raw`\(S\)`, String.raw`Courant number, \(c\Delta t/\Delta x\) (Lesson 10)`], [String.raw`\(\varepsilon_i\)`, String.raw`relative permittivity at cell \(i\)`], ["soft source", String.raw`a value added to \(E\) at one cell each step, which lets waves pass through it`]],
how: [String.raw`Scale fields so \(\varepsilon_0 = \mu_0 = 1\), then the update coefficients become \(S\) and \(S/\varepsilon\).`, String.raw`Every step: update all \(H\), then all \(E\), then add the source.`, "The edges have absorbing layers so waves leave without reflecting (Lesson 11).", "Nothing else is needed: reflection, slowing and resonances all come out of the two update lines."],
say: String.raw`Reflection, refraction and resonances are not programmed into FDTD. They emerge from repeatedly applying the two update equations with the material's \(\varepsilon\) on the grid.`,
num: String.raw`Slab \(\varepsilon = 4\) (\(n = 2\)): front-face reflection \(((2 - 1)/(2 + 1))^2\) = <b>11 %</b> of the power, speed inside <b>\(c/2\)</b>.<br>\(\varepsilon = 12.25\) (\(n = 3.5\)): reflection <b>31 %</b>.`,
r(fig, ctl) {
  ctl.innerHTML = sl("e", "Slab permittivity ε", 1, 13, 0.25, 4) + `<div class="row"><button id="rs">Restart</button><button id="pp">Pause</button></div>`;
  let sim, run = true;
  const N = 600, a = 330, b = 400;
  const reset = () => { const eps = new Float64Array(N).fill(1); const e = +$("e").value; for (let i = a; i < b; i++) eps[i] = e; sim = new C2.FDTD1D(N, 0.5, eps, { pml: 40, smax: 0.6, wall: "pec" }); };
  $("e").oninput = () => { $("ev").textContent = (+$("e").value).toFixed(2); };
  $("ev").textContent = "4.00";
  reset(); $("rs").onclick = reset; $("pp").onclick = () => { run = !run; $("pp").textContent = run ? "Pause" : "Play"; };
  anim(() => {
    if (run) for (let s = 0; s < 4; s++) { const t = sim.t; sim.step([80, Math.exp(-Math.pow((t - 60) / 18, 2))]); }
    const xs = range(0, N - 1, N), ys = Array.from(sim.ez);
    fig.innerHTML = svg(240, `<rect x="${40 + a / N * 600}" y="20" width="${(b - a) / N * 600}" height="190" fill="var(--blue-bg)"/><rect x="40" y="20" width="${40 / N * 600}" height="190" fill="#888780" opacity="0.15"/><rect x="${40 + (N - 40) / N * 600}" y="20" width="${40 / N * 600}" height="190" fill="#888780" opacity="0.15"/><line x1="40" x2="640" y1="115" y2="115" stroke="var(--p)" stroke-width="0.5"/>${plot(40, 20, 600, 190, xs, ys, 0, N - 1, -1.1, 1.1, "#378ADD", 1.8)}<text class="ts" x="44" y="232">absorbing layer</text><text class="ts" x="${40 + (a + b) / 2 / N * 600}" y="232" text-anchor="middle">slab</text><text class="ts" x="636" y="232" text-anchor="end">step ${sim.t}</text>`);
  });
}},

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

{s: "6. All colours at once", t: "One pulse gives the whole spectrum",
intu: "A short pulse contains many frequencies. Record the field after the slab during the whole run, then Fourier transform it, and you have the response at every frequency from one simulation. Divide by the spectrum of a run without the slab and you get the transmission. This card does exactly that, two 1D FDTD runs (about 4000 steps each) when you press the button. The dots are the FDTD result, the line is the exact transfer-matrix answer for the same slab. They agree closely, and the small mismatch at short wavelengths is the numerical dispersion of Lesson 10.",
eq: String.raw`\[ \tilde{E}(f) = \sum_n E_z^{\,n}\, e^{i2\pi f n\Delta t}\, \Delta t \qquad T(f) = \frac{|\tilde{E}_{\mathrm{slab}}(f)|^2}{|\tilde{E}_{\mathrm{ref}}(f)|^2} \]`,
sym: [[String.raw`\(\tilde{E}(f)\)`, "discrete Fourier transform of the recorded field"], ["ref", "same simulation without the slab"], [String.raw`\(T(f)\)`, "power transmission spectrum"]],
how: [String.raw`Run with a broadband pulse and record \(E\) at a probe behind the slab every step.`, "Fourier transform the record at many frequencies (a running sum, Lesson 11).", "Repeat with no slab to get the incident spectrum at the same probe.", "The ratio of the two power spectra is the transmission. Oskooi et al. note this is the usual way FDTD gets broadband results from one run."],
say: "Because FDTD is a time-domain method, one simulation with a short pulse gives the response over a whole band, obtained by Fourier transforming the recorded fields.",
num: String.raw`Slab \(\varepsilon = 4\), 40 cells thick. Fabry-Perot peaks where \(2nd = m\lambda\): \(\lambda = 160/m\) cells, so peaks near \(\lambda = 80, 53, 40\) cells.`,
r(fig, ctl) {
  ctl.innerHTML = sl("e", "Slab permittivity ε", 1.5, 12, 0.25, 4) + sl("d", "Slab thickness (cells)", 10, 80, 1, 40) + `<div class="row"><button id="go">Run FDTD (two runs)</button></div><div class="readout" id="ro"></div>`;
  const runOnce = (e, d) => {
    const N = 1000, a = 500, eps = new Float64Array(N).fill(1); for (let i = a; i < a + d; i++) eps[i] = e;
    const sim = new C2.FDTD1D(N, 0.5, eps, { pml: 40, smax: 0.6, wall: "pec" }); const rec = [];
    for (let t = 0; t < 4500; t++) { sim.step([150, Math.exp(-Math.pow((t - 60) / 10, 2))]); rec.push(sim.ez[800]); }
    return rec;
  };
  const lams = range(25, 150, 90);
  const dft = (rec, lam) => { let re = 0, im = 0; const f = 1 / lam; rec.forEach((v, n) => { const p = 2 * Math.PI * f * n * 0.5; re += v * Math.cos(p); im += v * Math.sin(p); }); return re * re + im * im; };
  const draw = (fd) => {
    const e = +$("e").value, d = +$("d").value; $("ev").textContent = e.toFixed(2); $("dv").textContent = d;
    const an = lams.map(l => 1 - C2.tmmR(1, [[Math.sqrt(e), d]], 1, l));
    let dots = ""; if (fd) fd.forEach((v, i) => dots += `<circle cx="${60 + (lams[i] - 25) / 125 * 560}" cy="${230 - Math.min(1.05, v) * 190}" r="2.6" fill="#D85A30"/>`);
    fig.innerHTML = svg(260, `${plot(60, 40, 560, 190, lams, an, 25, 150, 0, 1, "#378ADD", 2)}${dots}<line x1="60" x2="620" y1="230" y2="230" stroke="var(--p)"/><line x1="60" x2="60" y1="40" y2="230" stroke="var(--p)"/><text class="ts" x="54" y="44" text-anchor="end">T = 1</text><text class="ts" x="340" y="252" text-anchor="middle">wavelength 25 to 150 cells. Line: exact. Dots: FDTD ${fd ? "" : "(press Run)"}</text>`);
  };
  $("e").oninput = () => draw(null); $("d").oninput = () => draw(null);
  $("go").onclick = () => { const e = +$("e").value, d = +$("d").value; const r0 = runOnce(1, d), r1 = runOnce(e, d); const fd = lams.map(l => dft(r1, l) / dft(r0, l)); draw(fd); const an = lams.map(l => 1 - C2.tmmR(1, [[Math.sqrt(e), d]], 1, l)); const err = Math.max(...fd.map((v, i) => Math.abs(v - an[i]))); $("ro").innerHTML = `<div><span>largest |T_FDTD − T_exact|</span><b>${err.toFixed(3)}</b></div>`; };
  draw(null);
}}
],
summary: String.raw`FDTD solves the two curl equations, \(\partial\mathbf{E}/\partial t = (1/\varepsilon)\nabla \times \mathbf{H}\) and \(\partial\mathbf{H}/\partial t = -(1/\mu_0)\nabla \times \mathbf{E}\), in the form of Oskooi et al. Derivatives become centered differences, which are second-order accurate. \(\mathbf{E}\) and \(\mathbf{H}\) are staggered by half a cell and half a step and updated alternately in a leapfrog. Reflection, slowing and resonances all emerge from these local updates. The time step is limited by the Courant condition, \(S \le 1\) in 1D, and one run with a short pulse gives the whole spectrum through a Fourier transform.`,
sheet: [
[String.raw`\[ \frac{\partial \mathbf{E}}{\partial t} = \frac{1}{\varepsilon_0\varepsilon_r}\nabla \times \mathbf{H}, \qquad \frac{\partial \mathbf{H}}{\partial t} = -\frac{1}{\mu_0}\nabla \times \mathbf{E} \]`, "Maxwell curl equations (Ch. 2 Eq. 2.16)"],
[String.raw`\[ f' \approx \frac{f(x + \Delta x/2) - f(x - \Delta x/2)}{\Delta x}, \qquad \text{error } \frac{\Delta x^2}{24}\, f''' \]`, "Centered difference"],
[String.raw`\[ H\big|_{i+1/2}^{n+1/2} = H\big|_{i+1/2}^{n-1/2} + \frac{\Delta t}{\mu_0 \Delta x}\left(E\big|_{i+1}^{n} - E\big|_{i}^{n}\right) \]`, String.raw`\(H\) update`],
[String.raw`\[ E\big|_{i}^{n+1} = E\big|_{i}^{n} + \frac{\Delta t}{\varepsilon \Delta x}\left(H\big|_{i+1/2}^{n+1/2} - H\big|_{i-1/2}^{n+1/2}\right) \]`, String.raw`\(E\) update`],
[String.raw`\[ S = \frac{c\,\Delta t}{\Delta x} \le 1 \quad \text{(1D)} \]`, "Courant condition"],
[String.raw`\[ T(f) = \frac{|\tilde{E}_{\mathrm{slab}}|^2}{|\tilde{E}_{\mathrm{ref}}|^2} \]`, "Transmission from one pulse"]],
consts: String.raw`Simulations here use normalized units \(\Delta x = 1\), \(c = 1\).`,
sources: ["Oskooi et al., Comput. Phys. Commun. 181, 687 (2010), Eqs. (1) and (2), Secs. 2 and 3 (the MEEP FDTD package: Yee grid, leapfrog, broadband output)", "Dohlus and Zagorodnov, J. Comput. Phys. 228, 2822 (2009), Eqs. (7) and (8) (Yee leapfrog and stability limit)"]
});

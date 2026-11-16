addLesson("thesis", "lec", {
level: "Part B", num: "Lesson 3",
id: "thesis-lec-l3", title: "Why time domain and not frequency domain", short: "3. Why time domain",
big: String.raw`There are two ways to solve Maxwell's equations on a grid. The frequency-domain method (FDFD) picks one wavelength and solves one giant linear system \(A\mathbf{x} = \mathbf{b}\) for the whole device, then does it again for the next wavelength. The time-domain method (FDTD) sends in a short flash of light and steps the fields forward in time, each point only looking at its neighbours, with no matrix to invert. For devices that are 3D and broadband, FDTD wins: its memory grows only linearly with the number of cells, it runs well on GPUs, and one pulse gives every wavelength at once, so one forward and one adjoint run give the gradient over the whole band. FDFD still wins for a single wavelength in a small 2D problem, for strongly dispersive materials, and for very sharp resonances.`,
bridge: "Thesis Ch. 2 Sec. 2.6 states that one pulse gives the whole band. Michaels and Yablonovitch derive the adjoint method in the frequency domain and use their own FDFD solver. This work uses Tidy3D, an FDTD solver with the adjoint gradient built in.",
cards: [
{s: "1. Two ways", t: "One giant solve per wavelength, or one run in time",
intu: String.raw`Switch between the two methods. Frequency domain: for each wavelength, build the matrix \(A(\omega)\) and solve it. Ten wavelengths, ten solves. Time domain: launch a short pulse and step the fields forward. New value equals old value plus a difference of neighbours. Nothing is inverted, and a Fourier transform of what the monitors recorded gives every wavelength at the end.`,
eq: String.raw`\[ \text{FDFD:}\quad A(\omega)\,\mathbf{x} = \mathbf{b} \quad\text{for each } \omega \]\[ \text{FDTD:}\quad \mathbf{E}^{n+1} = \mathbf{E}^{n} + \frac{\Delta t}{\varepsilon_0\varepsilon_r}\,\nabla\times\mathbf{H}^{n+\frac12} \]`,
sym: [[String.raw`\(A(\omega)\)`, "system matrix at one frequency (Lesson 15)"], [String.raw`\(\mathbf{E}^{n}\)`, "electric field at time step n"], [String.raw`\(\Delta t\)`, "time step (Lesson 5)"]],
how: ["FDFD: discretize the driven equation of Lesson 2 at one frequency and solve the linear system.", "FDTD: discretize the time-domain curl equations of Lesson 1 and march forward.", "FDTD never forms A. It only needs the fields and the permittivity of each cell.", "A running Fourier transform at the monitors turns the time signal into frequencies (Lesson 11)."],
say: "Frequency-domain methods solve one large linear system per wavelength, while FDTD steps the fields in time with local updates and gets all wavelengths from one pulse.",
num: "In a band of 101 wavelengths, FDFD needs 101 solves for one simulation. FDTD needs one run.",
r(fig, ctl) {
  let m = "td"; ctl.innerHTML = btns([["fd", "Frequency domain"], ["td", "Time domain"]], "m");
  const u = () => {
    pick(ctl, "m", m); stopAnim();
    if (m === "fd") {
      let s = `<text class="th" x="340" y="24" text-anchor="middle">one solve of A(ω) x = b for every wavelength</text>`;
      for (let k = 0; k < 6; k++) {
        const x = 30 + k * 105; s += `<rect x="${x}" y="50" width="80" height="80" rx="4" fill="var(--sunk)" stroke="var(--p)"/>`;
        for (let i = 0; i < 8; i++) for (let j = Math.max(0, i - 1); j <= Math.min(7, i + 1); j++) s += `<rect x="${x + 4 + j * 9.4}" y="${54 + i * 9.4}" width="8" height="8" fill="${i === j ? "var(--coral)" : "var(--blue)"}" opacity="0.8"/>`;
        s += `<text class="ts" x="${x + 40}" y="150" text-anchor="middle">λ${k + 1}: solve</text>`;
      }
      s += `<text class="ts" x="340" y="185" text-anchor="middle">each solve handles millions of unknowns at once in 3D</text>`;
      fig.innerHTML = svg(200, s);
    } else {
      const sim = new C2.FDTD1D(400, 0.5, null, { pml: 40, smax: 0.6, wall: "pec" });
      anim(() => {
        for (let i = 0; i < 3; i++) { const t = sim.t; sim.step([80, Math.exp(-Math.pow((t - 50) / 12, 2) / 2) * Math.sin(2 * Math.PI * 0.5 * t / 20)]); }
        if (sim.t > 1100) { sim.ez.fill(0); sim.hy.fill(0); sim.t = 0; }
        fig.innerHTML = svg(200, `<text class="th" x="340" y="16" text-anchor="middle">one pulse, stepped forward in time</text>` + LC.draw1D(sim, { src: 80, pml: 40, amp: 0.8, y0: 26, h: 140 }) + `<text class="ts" x="340" y="190" text-anchor="middle">time step ${sim.t}: each point updated from its two neighbours</text>`);
      });
    }
  };
  ctl.querySelectorAll("button").forEach(b => b.onclick = () => { m = b.dataset.m; u(); }); u();
}},

{s: "2. Memory in 3D", t: "FDTD stores only the fields",
intu: String.raw`Set the size of a 3D region and the cell size. The number of cells grows with the volume divided by the cell volume. FDTD only has to store six field components per cell (and the material), so its memory grows in proportion to the number of cells. A direct frequency-domain solve has to factorize the matrix, and in 3D that factorization fills in and grows faster than the number of cells, about as \(N^{4/3}\) even with the best ordering. The chart shows how the two scalings separate as the problem grows.`,
eq: String.raw`\[ N_\mathrm{cells} = \frac{L_x}{\Delta x}\cdot\frac{L_y}{\Delta y}\cdot\frac{L_z}{\Delta z} \]\[ \text{FDTD memory} \propto N_\mathrm{cells}, \qquad \text{direct 3D solve} \propto N_\mathrm{cells}^{4/3} \]`,
sym: [[String.raw`\(L_x, L_y, L_z\)`, "size of the simulated region"], [String.raw`\(\Delta x\)`, "cell size"], [String.raw`\(N_\mathrm{cells}\)`, "number of cells"]],
how: ["Count the cells.", "FDTD: six field values per cell plus the material, about 24 bytes per cell in single precision for the fields.", "FDFD with a direct solver: the factorized matrix has many more nonzero entries than A itself (fill-in), growing about as N to the power 4/3 for a 3D grid.", "Iterative FDFD solvers avoid the fill-in but converge slowly for Maxwell at optical frequencies, because the matrix is indefinite."],
say: "In 3D, FDTD memory grows linearly with the number of cells, while a direct frequency-domain solve needs a factorization that grows faster, so large 3D devices favour FDTD.",
num: String.raw`Example: 5 × 5 × 1 µm at an 11.38 nm cell (the Ch. 3 optimization grid in GaAs) is about 439 × 439 × 88 ≈ 17 million cells, about 0.4 GB of field values in single precision. A real grid is non-uniform and coarser in air.`,
r(fig, ctl) {
  ctl.innerHTML = sl("lx", "Region x, y (µm)", 1, 10, 0.5, 5) + sl("lz", "Region z (µm)", 0.2, 3, 0.1, 1) + sl("dx", "Cell size (nm)", 5, 40, 0.5, 11.5) + `<div class="readout" id="ro"></div>`;
  const u = () => {
    const L = +$("lx").value, Lz = +$("lz").value, d = +$("dx").value; $("lxv").textContent = L; $("lzv").textContent = Lz.toFixed(1); $("dxv").textContent = d.toFixed(1);
    const n = Math.round(L * 1000 / d), nz = Math.round(Lz * 1000 / d), N = n * n * nz;
    const Ns = range(4, 8, 60), X = C3.X(80, 540, 4, 8), Y = C3.Y(30, 160, 0, 6);
    let s = C3.frame(80, 30, 540, 160, 4, 8, 0, 6, [4, 5, 6, 7, 8], [0, 2, 4, 6], "number of cells", "relative growth (log)", v => "10" + "⁴⁵⁶⁷⁸"[v - 4], v => v === 0 ? "1" : "10" + "⁰¹²³⁴⁵⁶"[v]);
    s += plot(80, 30, 540, 160, Ns, Ns.map(v => v - 4), 4, 8, 0, 6, "var(--teal)", 2.2) + plot(80, 30, 540, 160, Ns, Ns.map(v => 4 / 3 * v - 16 / 3), 4, 8, 0, 6, "var(--coral)", 2.2);
    const lg = Math.log10(Math.max(N, 1));
    if (lg >= 4 && lg <= 8) s += `<line x1="${X(lg)}" x2="${X(lg)}" y1="30" y2="190" stroke="var(--purple)" stroke-dasharray="4 3"/><text class="ts" x="${X(lg) + 4}" y="44">this region</text>`;
    s += C3.legend(100, 240, [["FDTD, grows as N", "var(--teal)"], ["direct 3D solve, grows as N^(4/3)", "var(--coral)"]]);
    fig.innerHTML = svg(252, s);
    $("ro").innerHTML = `<div><span>cells</span><b>${(N / 1e6).toFixed(1)} million</b></div><div><span>FDTD fields, single precision</span><b>${(N * 24 / 1e9).toFixed(2)} GB</b></div>`;
  };
  ["lx", "lz", "dx"].forEach(i => $(i).oninput = u); u();
}},

{s: "3. One pulse, every wavelength", t: "A real FDTD run: one pulse gives the whole spectrum",
intu: String.raw`This is a real 1D FDTD calculation. A short pulse hits a slab (index 2). A monitor behind it records the field at every step and keeps a running Fourier sum for 27 wavelengths at once. Dividing by an empty reference run gives the transmission at every wavelength (dots). The line is the exact textbook answer for a slab, which a frequency-domain method would need one solve per wavelength to get. One run, all the dots. Change the slab and run again.`,
eq: String.raw`\[ \mathbf{E}(\omega) = \sum_n \mathbf{E}^{n}\, e^{i\omega n\Delta t}\,\Delta t, \qquad T(\omega) = \frac{|E_\mathrm{slab}(\omega)|^2}{|E_\mathrm{empty}(\omega)|^2} \]`,
sym: [[String.raw`\(\mathbf{E}^n\)`, "field at the monitor at step n"], [String.raw`\(T(\omega)\)`, "transmission at each wavelength"], ["reference run", "same simulation without the slab, to normalize the source spectrum"]],
how: ["Launch one Gaussian pulse that covers the band.", "At every step, add the monitor field times a rotating phase, one sum per wavelength.", "After the pulse has passed, each sum is the field at that frequency.", "Normalize by the same sums from an empty run. Tidy3D does this normalization for you."],
say: "One FDTD run with a short pulse gives the response at every wavelength in the band, through a running Fourier transform at the monitors.",
num: "Here: 520 cells, 4200 steps, slab of 24 cells, wavelengths 30 to 56 cells (20 cells per wavelength inside at the centre). The small differences from the exact line come from the grid and shrink with finer cells (Lesson 6).",
r(fig, ctl) {
  ctl.innerHTML = sl("sn", "Slab index", 1.5, 3, 0.1, 2) + sl("sd", "Slab thickness (cells)", 10, 40, 1, 24) + `<div class="row"><button id="run">Run FDTD</button></div><div class="readout" id="ro"></div>`;
  const lams = range(30, 56, 27);
  const go = () => {
    const n = +$("sn").value, d = +$("sd").value; $("snv").textContent = n.toFixed(1); $("sdv").textContent = d;
    const r = LC.pulseT({ lams, n, d }), fine = range(30, 56, 200);
    let s = C3.frame(70, 20, 560, 180, 30, 56, 0, 1.05, [30, 35, 40, 45, 50, 55], [0, 0.5, 1], "wavelength (cells)", "transmission T");
    s += plot(70, 20, 560, 180, fine, fine.map(l => LC.slabT(n, d, l)), 30, 56, 0, 1.05, "var(--blue)", 2);
    const X = C3.X(70, 560, 30, 56), Y = C3.Y(20, 180, 0, 1.05);
    r.T.forEach((v, k) => s += `<circle cx="${X(lams[k])}" cy="${Y(Math.min(v, 1.05))}" r="4" fill="var(--coral)"/>`);
    s += C3.legend(90, 250, [["exact slab formula", "var(--blue)"]]) + `<circle cx="300" cy="246" r="4" fill="var(--coral)"/><text class="ts" x="310" y="250">FDTD, all 27 points from one pulse</text>`;
    fig.innerHTML = svg(262, s);
    let md = 0; r.T.forEach((v, k) => md = Math.max(md, Math.abs(v - LC.slabT(n, d, lams[k]))));
    $("ro").innerHTML = `<div><span>FDTD runs used</span><b>1 (+1 empty reference)</b></div><div><span>wavelengths obtained</span><b>27</b></div><div><span>largest difference</span><b>${md.toFixed(3)}</b></div>`;
  };
  $("sn").oninput = () => { $("snv").textContent = (+$("sn").value).toFixed(1); }; $("sd").oninput = () => { $("sdv").textContent = $("sd").value; };
  $("run").onclick = go; go();
}},

{s: "4. Count the runs", t: "For the adjoint gradient over a band: 2 runs instead of 2 per wavelength",
intu: String.raw`The figure of merit in a broadband design is an average over many wavelengths. Move the slider for the number of wavelengths. In the frequency domain, every wavelength needs its own forward solve and its own adjoint solve. In the time domain, one forward pulse and one adjoint pulse cover all of them, because each run already contains every wavelength. That is the main practical reason the method fits broadband inverse design.`,
eq: String.raw`\[ J = \frac{1}{N_\omega}\sum_{\omega} T(\omega) \]\[ \text{FDFD: } 2N_\omega \text{ solves} \qquad \text{FDTD: } 2 \text{ runs} \]`,
sym: [[String.raw`\(N_\omega\)`, "number of wavelengths in the band"], [String.raw`\(J\)`, "band-averaged figure of merit"]],
how: ["The gradient of a sum is the sum of the gradients.", "Each wavelength needs a forward field and an adjoint field.", "FDTD: one broadband forward run gives all forward fields, one broadband adjoint run gives all adjoint fields.", "FDFD: two solves per wavelength."],
say: String.raw`For a figure of merit averaged over \(N_\omega\) wavelengths, FDTD needs one forward and one adjoint run per step, while a frequency-domain method needs \(2N_\omega\) solves.`,
num: String.raw`With 101 wavelengths (the band sampling of Ch. 3): 202 frequency-domain solves against 2 FDTD runs per optimization step and per input.`,
r(fig, ctl) {
  ctl.innerHTML = sl("nw", "Wavelengths in the band", 1, 101, 1, 101);
  const u = () => {
    const n = +$("nw").value; $("nwv").textContent = n;
    const W = 520, mx = 202, fw = 2 * n / mx * W, tw = Math.max(2 / mx * W, 3);
    let s = `<text class="th" x="20" y="40">frequency domain</text><rect x="150" y="24" width="${fw}" height="28" rx="4" fill="var(--coral)"/><text class="t" x="${158 + fw}" y="44">${2 * n} solves</text>`;
    s += `<text class="th" x="20" y="100">time domain</text><rect x="150" y="84" width="${tw}" height="28" rx="4" fill="var(--teal)"/><text class="t" x="${158 + tw}" y="104">2 runs</text>`;
    s += `<text class="ts" x="20" y="150">per optimization step and per input, whatever the number of design parameters</text>`;
    fig.innerHTML = svg(165, s);
  };
  $("nw").oninput = u; u();
}},

{s: "5. When frequency domain wins", t: "Three honest cases where FDFD is the better tool",
intu: String.raw`Pick a case. Sharp resonance: light trapped in a high-Q resonance rings for a long time, so FDTD must keep running until it dies down (slide Q and watch the run time). FDFD does not care about Q. Dispersive material: FDFD simply uses \(\varepsilon(\omega)\) at each wavelength, while FDTD needs \(\varepsilon(\omega)\) written as a model it can step in time, such as a Lorentz pole. Single wavelength, small 2D problem: one FDFD solve can be faster than a whole time-domain run.`,
eq: String.raw`\[ U(t) = U_0\, e^{-\omega t/Q} \]\[ \varepsilon(\omega) = \varepsilon_\infty + \frac{\Delta\varepsilon\,\omega_p^2}{\omega_p^2 - \omega^2 - i\gamma\omega} \]`,
sym: [[String.raw`\(Q\)`, "quality factor of a resonance"], [String.raw`\(U(t)\)`, "stored energy, decays with time"], [String.raw`\(\omega_p, \gamma, \Delta\varepsilon\)`, "resonance frequency, damping and strength of a Lorentz pole"]],
how: [String.raw`A resonance loses a fraction \(1/Q\) of its energy per radian of oscillation.`, String.raw`To decay to \(10^{-5}\) of the peak energy takes \(t = (Q/\omega)\ln 10^5 \approx 11.5\,Q/\omega\), about 1.8 Q optical periods.`, "A Lorentz model is a damped oscillator for the material polarization, which can be stepped in time with one extra field.", "For a single wavelength and a small 2D grid, a direct sparse solve is fast and exact at that wavelength."],
say: "Frequency-domain methods are better for a single wavelength in small problems, for strongly dispersive materials, and for high-Q resonances, while FDTD is better for large 3D broadband problems.",
num: String.raw`At 800 nm one optical period is 2.67 fs. A resonance with \(Q = 10^4\) needs about 18,000 periods, roughly 49 ps of simulated time, to decay to \(10^{-5}\).`,
r(fig, ctl) {
  let c = "q"; ctl.innerHTML = btns([["q", "Sharp resonance"], ["d", "Dispersive material"], ["s", "Single wavelength, 2D"]], "c") + `<div id="cx"></div><div class="readout" id="ro"></div>`;
  const u = () => {
    pick(ctl, "c", c);
    if (c === "q") {
      if (!$("qq")) $("cx").innerHTML = sl("qq", "log₁₀ Q", 1, 4, 0.1, 2);
      const lq = +$("qq").value, Q = Math.pow(10, lq); $("qqv").textContent = "Q = " + Math.round(Q);
      const per = Math.log(1e5) * Q / (2 * Math.PI), tm = Math.max(per * 1.15, 20), ts = range(0, tm, 1400);
      const fld = ts.map(t => Math.exp(-Math.PI * t / Q) * Math.cos(2 * Math.PI * t));
      let s = C3.frame(70, 20, 560, 170, 0, tm, -1.05, 1.05, [0, tm / 2, tm], [-1, 0, 1], "time (optical periods)", "field", v => Math.round(v), v => v);
      s += plot(70, 20, 560, 170, ts, ts.map(t => Math.exp(-Math.PI * t / Q)), 0, tm, -1.05, 1.05, "var(--coral)", 2) + plot(70, 20, 560, 170, ts, ts.map(t => -Math.exp(-Math.PI * t / Q)), 0, tm, -1.05, 1.05, "var(--coral)", 2);
      if (Q < 60) s += plot(70, 20, 560, 170, ts, fld, 0, tm, -1.05, 1.05, "var(--blue)", 1);
      const X = C3.X(70, 560, 0, tm); s += `<line x1="${X(per)}" x2="${X(per)}" y1="20" y2="190" stroke="var(--purple)" stroke-dasharray="4 3"/><text class="ts" x="${X(per) - 4}" y="36" text-anchor="end">energy at 10⁻⁵: stop</text>`;
      fig.innerHTML = svg(232, s);
      $("ro").innerHTML = `<div><span>periods to shut off</span><b>${Math.round(per).toLocaleString()}</b></div><div><span>at 800 nm</span><b>${(per * 2.67e-3).toFixed(per * 2.67e-3 < 1 ? 3 : 1)} ps</b></div><div><span>FDFD cost</span><b>unchanged by Q</b></div>`;
      $("qq").oninput = u;
    } else if (c === "d") {
      $("cx").innerHTML = "";
      const ls = range(500, 1000, 200), eps = l => { const w = 1 / l, wp = 1 / 380, g = 0.0004; const re = 1 + 9 * wp * wp * (wp * wp - w * w) / (Math.pow(wp * wp - w * w, 2) + g * g * w * w); return re; };
      const nn = ls.map(l => Math.sqrt(eps(l)));
      let s = C3.frame(70, 20, 560, 170, 500, 1000, 2.5, 5, [500, 600, 700, 800, 900, 1000], [3, 4, 5], "wavelength (nm)", "index n");
      s += plot(70, 20, 560, 170, ls, nn, 500, 1000, 2.5, 5, "var(--blue)", 2);
      const X = C3.X(70, 560, 500, 1000), Y = C3.Y(20, 170, 2.5, 5);
      range(520, 980, 12).forEach(l => s += `<circle cx="${X(l)}" cy="${Y(Math.sqrt(eps(l)))}" r="4" fill="var(--coral)"/>`);
      s += C3.legend(90, 238, [["FDTD: one pole model fitted over the band", "var(--blue)"]]) + `<circle cx="420" cy="234" r="4" fill="var(--coral)"/><text class="ts" x="430" y="238">FDFD: the value at each λ</text>`;
      fig.innerHTML = svg(250, s);
      $("ro").innerHTML = `<div><span>example material</span><b>generic Lorentz model</b></div><div><span>FDTD needs</span><b>a fit that holds over the band</b></div>`;
    } else {
      $("cx").innerHTML = "";
      let s = LC.box(40, 30, 270, 120, ["one wavelength, small 2D", "FDFD: one sparse solve", "exact at that wavelength", "often fastest"], "teal") + LC.box(370, 30, 270, 120, ["many wavelengths, large 3D", "FDTD: one run, all wavelengths", "memory grows as N", "runs on GPUs"], "blue");
      fig.innerHTML = svg(170, s);
      $("ro").innerHTML = `<div><span>Michaels and Yablonovitch</span><b>own FDFD solver</b></div><div><span>this work</span><b>Tidy3D FDTD</b></div>`;
    }
  };
  ctl.querySelectorAll("button").forEach(b => b.onclick = () => { c = b.dataset.c; $("cx").innerHTML = ""; u(); }); u();
}}
],
summary: String.raw`FDFD solves \(A(\omega)\mathbf{x} = \mathbf{b}\) once per wavelength. FDTD steps the curl equations in time with local updates and no matrix inversion, so its memory grows linearly with the number of cells and it runs well on GPUs. One short pulse contains the whole band, and a running Fourier transform at the monitors gives every wavelength from one run. For a band-averaged figure of merit, one forward and one adjoint run give the full gradient, instead of \(2N_\omega\) frequency-domain solves. FDFD is still better for one wavelength in small 2D problems, for strongly dispersive materials and for high-Q resonances.`,
sheet: [
[String.raw`\[ A(\omega)\mathbf{x} = \mathbf{b} \]`, "FDFD: one solve per wavelength"],
[String.raw`\[ \mathbf{E}^{n+1} = \mathbf{E}^{n} + \frac{\Delta t}{\varepsilon_0\varepsilon_r}\nabla\times\mathbf{H}^{n+\frac12} \]`, "FDTD: local update, no matrix"],
[String.raw`\[ \mathbf{E}(\omega) = \sum_n \mathbf{E}^{n} e^{i\omega n\Delta t}\Delta t \]`, "Running Fourier transform at a monitor"],
[String.raw`\[ 2N_\omega \text{ solves} \quad\text{versus}\quad 2 \text{ runs} \]`, "Cost of a band-averaged adjoint gradient"],
[String.raw`\[ t_\mathrm{off} \approx 11.5\,\frac{Q}{\omega} \]`, String.raw`Time for a resonance to decay to \(10^{-5}\) of its energy`]],
consts: String.raw`1D runs: Courant number 0.5, absorbing layers of 40 cells, Gaussian pulse centred at 40 cells. Optical period at 800 nm: 2.67 fs. Memory: 4 bytes per value, six field values per cell.`,
sources: ["Taflove and Hagness, Computational Electrodynamics: The Finite-Difference Time-Domain Method, 3rd ed., Artech House (2005), Ch. 1 and 3 (FDTD versus frequency-domain methods)", "Michaels and Yablonovitch, Opt. Express 26, 31717 (2018) (adjoint method derived for a frequency-domain solver)", "Davis, Direct Methods for Sparse Linear Systems, SIAM (2006) (fill-in and nested dissection for direct sparse solvers)", "Ch. 2 Sec. 2.6 of the thesis (one pulse gives the whole band)"]
});

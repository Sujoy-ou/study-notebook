/* Lesson 2.2: Numerical dispersion. */
addLesson("fdtd", "a2", {
level: "Core", num: "Lesson 2.2",
id: "fdtd-2-2", title: "Numerical dispersion", short: "2.2 Numerical dispersion",
big: String.raw`On the grid a wave does not travel at exactly \(c/n\). Its speed depends on how many cells cover one wavelength, on the time step, and in 2D and 3D on the direction it travels. Waves on the grid are always a little slow, so phases lag, pulses arrive late and develop ripples, and resonances in a computed spectrum shift to longer wavelengths. The error shrinks as the square of the cell size, which is why the cells per wavelength inside the highest-index material is the most important accuracy setting of an FDTD simulation.`,
bridge: String.raw`Taflove and Hagness Ch. 4, Rumpf "Enhancing 1D FDTD" notes. Lesson 1.2 found the spatial half of this error, here the time step is added. Lesson 2.3 turns it into a choice of grid.`,
cards: [
{s: "1. The dispersion relation", t: "The speed of a wave on the 1D grid",
intu: String.raw`Insert a plane wave into the Yee updates, as in the stability analysis, and you get a relation between \(\omega\) and \(k\) on the grid. Solved for the phase velocity, it says how fast a wave of a given wavelength actually travels in the simulation. The curves show that speed against the cells per wavelength, for the Courant number you choose. Every curve rises to 1 as the grid gets finer. At \(S = 1\) the curve is flat at 1, the magic time step: in 1D, and only in 1D, the scheme is then exact.`,
eq: String.raw`\[ \frac{1}{c\Delta t}\sin\frac{\omega\Delta t}{2} = \frac{1}{\Delta x}\sin\frac{\tilde k\Delta x}{2}, \qquad \frac{v_p}{c} = \frac{\omega}{c\,\tilde k} \]`,
sym: [[String.raw`\(\tilde k\)`, "wavenumber of the wave on the grid"], [String.raw`\(v_p\)`, "phase velocity on the grid"], [String.raw`\(N = \lambda/\Delta x\)`, "cells per wavelength"]],
how: [String.raw`Insert \(E = E_0 e^{i(\tilde k i\Delta x - \omega n\Delta t)}\) and the same form for H.`, String.raw`Each difference turns into \(2i\sin(\cdot/2)\) divided by its step.`, String.raw`Equate the two: the grid dispersion relation. Continuum limit: \(\omega = c k\).`, String.raw`For \(S = 1\) both sides have the same argument, so \(\tilde k = \omega/c\) exactly.`],
say: "On the grid the phase velocity is slightly below c and depends on the resolution. In 1D it is exact only at the magic time step S = 1.",
num: "At N = 10 and S = 0.5 a wave is 1.2 % slow. At N = 20 it is 0.3 % slow.",
r(fig, ctl) {
  ctl.innerHTML = sl("S", "Courant number S", 0.1, 1, 0.01, 0.5) + `<div class="readout" id="ro"></div>`;
  const u = () => {
    const S = +$("S").value; $("Sv").textContent = S.toFixed(2);
    const Ns = range(4, 40, 200), vp = Ns.map(N => 1 / C2.dispRatio1D(N, S));
    let s = C3.frame(70, 20, 560, 180, 4, 40, 0.9, 1.01, [5, 10, 20, 30, 40], [0.9, 0.95, 1], "cells per wavelength N", "v_p / c") + plot(70, 20, 560, 180, Ns, vp, 4, 40, 0.9, 1.01, "var(--coral)", 2.5);
    for (const Sx of [0.25, 0.5, 0.75]) if (Math.abs(Sx - S) > 0.02) s += plot(70, 20, 560, 180, Ns, Ns.map(N => 1 / C2.dispRatio1D(N, Sx)), 4, 40, 0.9, 1.01, "var(--b)", 1.2, "4 3");
    s += `<line x1="70" x2="630" y1="${C3.Y(20, 180, 0.9, 1.01)(1)}" y2="${C3.Y(20, 180, 0.9, 1.01)(1)}" stroke="var(--teal)" stroke-dasharray="6 4"/>`;
    s += C3.legend(90, 266, [["your S", "var(--coral)"], ["S = 0.25, 0.5, 0.75", "var(--b)"], ["exact", "var(--teal)"]]);
    fig.innerHTML = svg(276, s);
    $("ro").innerHTML = FD.ro([[`error at N = 10`, FD.f((1 - 1 / C2.dispRatio1D(10, S)) * 100, 3) + " % slow"], [`error at N = 20`, FD.f((1 - 1 / C2.dispRatio1D(20, S)) * 100, 3) + " % slow"], ["at N = 30", FD.f((1 - 1 / C2.dispRatio1D(30, S)) * 100, 3) + " % slow"]]);
  };
  $("S").oninput = u; u();
}},
{s: "2. Direction matters", t: "In 2D the grid is not isotropic",
intu: String.raw`On a square grid a wave travelling along an axis and one travelling along the diagonal see different stencils, so they travel at different speeds. The polar plot shows \(v_p/c\) against the direction of travel (exaggerated by the scale you choose). The error is largest along the grid axes and smallest along the diagonals. At the 2D Courant limit the diagonal becomes exact, but the axes never do. A ring resonator or a curved waveguide on a coarse grid therefore sees a slightly different index in different parts of the ring.`,
eq: String.raw`\[ \frac{1}{(c\Delta t)^2}\sin^2\frac{\omega\Delta t}{2} = \frac{1}{\Delta^2}\Big(\sin^2\frac{\tilde k\cos\phi\,\Delta}{2} + \sin^2\frac{\tilde k\sin\phi\,\Delta}{2}\Big) \]`,
sym: [[String.raw`\(\phi\)`, "direction of travel, measured from the x axis"], [String.raw`\(\Delta\)`, "cell size (square cells)"]],
how: ["Use a plane wave travelling at angle φ.", "Each axis contributes its own sine term.", "Solve for the grid wavenumber at each angle and compare with ω/c."],
say: "Numerical dispersion is anisotropic: on a square or cubic grid waves along the axes are slower than waves along the diagonals.",
num: "At N = 10 and S = 0.5 a wave along an axis is 1.27 % slow and one along the diagonal 0.42 % slow.",
r(fig, ctl) {
  ctl.innerHTML = sl("N", "Cells per wavelength N", 4, 30, 1, 8) + sl("S", "Courant number S (≤ 0.707)", 0.1, 0.707, 0.001, 0.5) + `<div class="readout" id="ro"></div>`;
  const u = () => {
    const N = +$("N").value, S = +$("S").value; $("Nv").textContent = N; $("Sv").textContent = S.toFixed(3);
    const ph = range(0, 2 * Math.PI, 241), v = ph.map(p => 1 / C2.dispRatio2D(N, S, p)), vmin = Math.min(...v);
    const R = 110, cx = 340, cy = 140, amp = 1 / Math.max(1 - vmin, 1e-6) * 0.5;
    let d = "", s = `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="var(--teal)" stroke-dasharray="5 4"/>`;
    ph.forEach((p, i) => { const rr = R * (1 - (1 - v[i]) * amp); d += (i ? "L" : "M") + (cx + rr * Math.cos(p)).toFixed(1) + " " + (cy - rr * Math.sin(p)).toFixed(1); });
    s += `<path d="${d}Z" fill="var(--coral)" fill-opacity="0.15" stroke="var(--coral)" stroke-width="2"/>`;
    s += `<line x1="${cx - R - 20}" x2="${cx + R + 20}" y1="${cy}" y2="${cy}" stroke="var(--b)"/><line x1="${cx}" x2="${cx}" y1="${cy - R - 20}" y2="${cy + R + 20}" stroke="var(--b)"/>` + FD.txt(cx + R + 24, cy + 4, "x axis") + FD.txt(cx + 6, cy - R - 22, "y axis");
    s += FD.txt(20, 270, "dashed circle: exact speed c. Coral: grid speed, deviation magnified so the shape is visible.");
    fig.innerHTML = svg(280, s);
    const ax = 1 / C2.dispRatio2D(N, S, 0), dg = 1 / C2.dispRatio2D(N, S, Math.PI / 4);
    $("ro").innerHTML = FD.ro([["along an axis", FD.f((1 - ax) * 100, 3) + " % slow"], ["along the diagonal", FD.f((1 - dg) * 100, 3) + " % slow"], ["magnification in the plot", FD.f(amp, 0) + " ×"]]);
  };
  $("N").oninput = u; $("S").oninput = u; u();
}},
{s: "3. Late and ringing", t: "A pulse after a long trip on a coarse grid",
intu: String.raw`A short pulse with a carrier of \(N\) cells per wavelength travels 1000 cells to a probe. The dashed curve is where the exact pulse would be, the solid curve is what the grid delivers. On a coarse grid the pulse arrives late, because every wave is slow, and it is followed by ripples, because the shorter-wavelength parts of the pulse are slower still and fall behind. Make the grid finer and the two curves merge. In a device this lag is a phase error, which moves interference fringes and shifts which port the light chooses.`,
eq: String.raw`\[ \text{lag} \approx L\Big(\frac{1}{v_g} - \frac{1}{c}\Big), \qquad v_g = \frac{d\omega}{d\tilde k} \lt v_p \lt c \]`,
sym: [[String.raw`\(v_g\)`, "group velocity on the grid, the speed of the envelope"], ["L", "distance travelled"]],
how: ["Every frequency travels at its own grid speed.", "The envelope travels at the group velocity, which is even lower than the phase velocity on the grid.", "Different frequencies spread apart, so ripples trail behind."],
say: "Numerical dispersion delays pulses and spreads them, because high-frequency components travel more slowly on the grid.",
num: "S = 0.5. The probe sits 1000 cells from the source.",
r(fig, ctl) {
  ctl.innerHTML = sl("N", "Cells per wavelength of the carrier", 5, 30, 1, 8) + `<div class="row"><button id="go">Run</button></div><div class="readout" id="ro"></div>`;
  const run = () => {
    const N = +$("N").value; $("Nv").textContent = N;
    const S = 0.5, L = 1000, src = 40, M = src + L + 80, w0 = 2 * Math.PI * S / N, tau = 3 * N / S, t0 = 5 * tau;
    const sim = new FD.Yee1(M, S, null, { bc: "pml", pml: 30 }), sig = [], ref = [], T = Math.round((L + 300) / S + 2 * t0);
    for (let t = 0; t < T; t++) { sim.step({ i: src, v: FD.pulse(t, t0, tau, w0) }); sig.push(sim.ez[src + L]); ref.push(FD.pulse(t - L / S, t0, tau, w0)); }
    const m1 = Math.max(...sig.map(Math.abs)), m2 = Math.max(...ref.map(Math.abs)), ts = sig.map((_, i) => i);
    const env = a => { const e = a.map(Math.abs); let bi = 0; e.forEach((v, i) => { if (v > e[bi]) bi = i; }); return bi; };
    const lag = env(sig) - env(ref), lo = t0 + L / S - 4 * tau, hi = t0 + L / S + 10 * tau;
    let s = C3.frame(70, 20, 560, 180, lo, hi, -1.1, 1.1, [], [-1, 0, 1], "time step (window around the expected arrival)", "") + plot(70, 20, 560, 180, ts, ref.map(v => v / m2), lo, hi, -1.1, 1.1, "var(--t)", 1.6, "5 4") + plot(70, 20, 560, 180, ts, sig.map(v => v / m1), lo, hi, -1.1, 1.1, "var(--coral)", 2);
    s += C3.legend(90, 266, [["exact pulse", "var(--t)"], ["FDTD at the probe", "var(--coral)"]]);
    fig.innerHTML = svg(276, s);
    $("ro").innerHTML = FD.ro([["arrival lag", lag + " steps"], ["lag as a fraction of a period", FD.f(lag * S / N, 2) + " periods"]]);
  };
  $("go").onclick = run; $("N").oninput = () => { $("Nv").textContent = $("N").value; }; run();
}},
{s: "4. Spectra shift red", t: "Computed resonances move to longer wavelengths",
intu: String.raw`A slab of index 2.5 and thickness 0.6 wavelengths gives a transmission spectrum with Fabry-Pérot fringes, and the exact answer is known. Here the same slab is simulated with a real 1D FDTD at the resolution you choose, counted in cells per vacuum wavelength (the cells per wavelength inside the slab are 2.5 times fewer). At low resolution the light inside the slab is too slow, the optical path looks longer, and every fringe moves to a longer wavelength. The error falls quickly with resolution.`,
eq: String.raw`\[ \frac{\delta\lambda_\text{peak}}{\lambda} \approx \frac{\delta n_\text{eff,grid}}{n} \approx \frac{\pi^2}{6}\,\frac{1 - S^2}{N_\text{in}^2} \ \text{(1D, small error)} \]`,
sym: [[String.raw`\(N_\text{in}\)`, "cells per wavelength inside the slab"], [String.raw`\(\delta\lambda_\text{peak}\)`, "shift of a transmission peak"]],
how: ["A fringe appears where the round-trip phase in the slab is a multiple of 2π.", "On the grid the phase per cell is slightly larger, as if the index were higher.", "So the same phase is reached at a longer wavelength: a red shift."],
say: "Numerical dispersion makes the grid behave as if the index were slightly higher, so computed resonances shift to longer wavelengths.",
num: "Two FDTD runs per resolution (with and without the slab), Courant number 0.5.",
r(fig, ctl) {
  ctl.innerHTML = sl("r", "Cells per vacuum wavelength", 10, 60, 1, 16) + `<div class="readout" id="ro"></div>`;
  const lams = range(0.8, 1.6, 41), fine = range(0.8, 1.6, 300);
  const u = () => {
    const r = +$("r").value; $("rv").textContent = r + " (" + FD.f(r / 2.5, 1) + " inside)";
    const T = FD.slab1D({ r, n: 2.5, d: 0.6, lams, sub: true }), ex = fine.map(l => FD.slabT(2.5, 0.6, l));
    const X = C3.X(70, 560, 0.8, 1.6), Y = C3.Y(20, 180, 0.4, 1.05);
    let s = C3.frame(70, 20, 560, 180, 0.8, 1.6, 0.4, 1.05, [0.8, 1, 1.2, 1.4, 1.6], [0.5, 0.75, 1], "wavelength / λ0", "transmission") + plot(70, 20, 560, 180, fine, ex, 0.8, 1.6, 0.4, 1.05, "var(--t)", 2) + plot(70, 20, 560, 180, lams, T, 0.8, 1.6, 0.4, 1.05, "var(--coral)", 1.4);
    T.forEach((v, k) => s += `<circle cx="${X(lams[k])}" cy="${Y(Math.min(1.05, Math.max(0.4, v)))}" r="3" fill="var(--coral)"/>`);
    s += C3.legend(90, 266, [["exact slab formula", "var(--t)"], ["FDTD", "var(--coral)"]]);
    fig.innerHTML = svg(276, s);
    const pk = (xs, ys) => { let b = 0; ys.forEach((v, i) => { if (xs[i] > 1.05 && xs[i] < 1.35 && (xs[b] <= 1.05 || xs[b] >= 1.35 || v > ys[b])) b = i; }); return xs[b]; };
    $("ro").innerHTML = FD.ro([["peak near 1.2, exact", FD.f(pk(fine, ex), 3)], ["peak, FDTD (coarse samples)", FD.f(pk(lams, T), 3)], ["largest |ΔT|", FD.f(Math.max(...T.map((v, k) => Math.abs(v - FD.slabT(2.5, 0.6, lams[k])))), 3)]]);
  };
  $("r").oninput = u; u();
}},
FD.ckpt({ step: 3, t: "How slow is light on the PBS grid?",
  intu: String.raw`For the PBS settings, 20 cells per membrane wavelength and the 3D Courant factor 0.99, the 3D dispersion relation says a wave along a grid axis is about 0.28 % slow, and a wave along the cube diagonal is almost exact. At 10 cells the axis error is 1.2 %, at 30 cells 0.12 %. Light in the PBS travels mostly along \(x\), the worst direction. This is why the optimization at 20 cells per wavelength was followed by validation runs at 30: a small change between the two shows the grid error is under control (Lesson 2.4).`,
  code: ["grid_opt = td.GridSpec.auto(min_steps_per_wvl=20, wavelength=0.795)   # about 0.28 % phase speed error along x", "grid_val = td.GridSpec.auto(min_steps_per_wvl=30, wavelength=0.795)   # about 0.12 %", "", "# re-run the final design on grid_val and compare the port powers"],
  hi: [0, 1],
  on: ["design", "ports", "fwd"], cap: "the light mostly travels along x, the worst direction for numerical dispersion",
  eq: String.raw`\[ \frac{1}{c\Delta t}\sin\frac{\omega\Delta t}{2} = \frac{1}{\Delta}\sin\frac{\tilde k\Delta}{2}, \quad \frac{c\Delta t}{\Delta} = \frac{0.99}{\sqrt3} \ \Rightarrow\ \frac{\tilde k}{k} - 1 = 0.28\ \% \ (N = 20) \]`,
  sym: [["N", "cells per wavelength inside the membrane"]],
  how: ["Use the 3D dispersion relation for a wave along x.", "Insert the 3D Courant number 0.99/√3 = 0.572.", "Solve for the grid wavenumber at N = 20."],
  say: "At 20 cells per wavelength the PBS grid makes light along x about 0.3 % too slow, so the final design was checked again at 30 cells, where the error is about 0.1 %.",
  num: "N = 10: 1.16 %. N = 15: 0.50 %. N = 20: 0.28 %. N = 30: 0.12 %. Along the diagonal all of these are below 0.02 %."
})
],
summary: String.raw`Inserting a plane wave into the Yee updates gives the grid dispersion relation \(\sin(\omega\Delta t/2)/(c\Delta t) = \sin(\tilde k\Delta/2)/\Delta\) (1D). Waves on the grid are slow, by about \(\pi^2(1 - S^2)/(6N^2)\) in 1D, exactly right only at \(S = 1\) in 1D, and in 2D and 3D slowest along the grid axes. The effects are a phase lag, pulse spreading and red-shifted resonances, all shrinking as \(1/N^2\).`,
sheet: [
[String.raw`\[ \frac{1}{c\Delta t}\sin\frac{\omega\Delta t}{2} = \frac{1}{\Delta x}\sin\frac{\tilde k\Delta x}{2} \]`, "1D grid dispersion relation"],
[String.raw`\[ 1 - \frac{v_p}{c} \approx \frac{\pi^2}{6}\,\frac{1 - S^2}{N^2} \]`, "Phase velocity error in 1D for large N"],
[String.raw`\[ \frac{\sin^2(\omega\Delta t/2)}{(c\Delta t)^2} = \sum_{u=x,y,z}\frac{\sin^2(\tilde k_u\Delta u/2)}{\Delta u^2} \]`, "3D grid dispersion relation"]],
teach: [
  "Write the continuous relation ω = ck. Say: on the grid it is replaced by sines.",
  "Write sin(ωΔt/2)/(cΔt) = sin(kΔx/2)/Δx and point out the two half-angles.",
  "Sketch v_p/c against cells per wavelength: below 1, approaching 1.",
  "Draw the polar plot: a slightly squashed circle, slowest along the axes.",
  "List the effects: phase lag, pulses arrive late with ripples, resonances shift red. Fix: more cells per wavelength."
],
qa: [
  ["Why do FDTD resonances usually shift to longer wavelengths?", "Because the grid makes light slightly slower, which looks like a slightly higher index. A resonance condition on the optical path is then met at a longer wavelength."],
  ["Is there a magic time step in 3D?", "No. In 1D with S = 1 the scheme is exact, but in 2D and 3D no single time step removes the error in every direction. At the 3D Courant limit the error vanishes only along the cube diagonal."],
  ["How do you estimate the numerical dispersion error of your own simulation?", "Run the same simulation at two or three resolutions and look at how the result changes. A second-order method changes by about a quarter each time the cell is halved, which also lets you extrapolate (Lesson 2.4)."],
  ["Does subpixel averaging remove numerical dispersion?", "No. It removes the error from the staircased geometry at interfaces. Numerical dispersion is the bulk error of the difference scheme and only more cells per wavelength reduce it."]
],
mistakes: [
  "Counting cells per wavelength in vacuum. The wavelength inside the highest-index material is the one that matters.",
  "Comparing two simulations at different resolutions and calling the difference physics.",
  "Assuming 2D errors carry over to 3D unchanged. The Courant number and the anisotropy differ.",
  "Expecting a reduced Courant number to improve accuracy. In 1D it makes the dispersion slightly worse."
],
videos: [FD.vid("f8", "The whole lecture: dispersion relation, anisotropy and practical rules."), FD.vid("r10", "Numerical dispersion in 1D and how to reduce it."), ["R. C. Rumpf, Enhancing 1D FDTD lecture notes (PDF)", "https://empossible.net/wp-content/uploads/2020/01/Lecture-Enhancing-1D-FDTD.pdf", "The conclusions slide states that grid waves are slow and spectra shift to longer wavelengths."]],
sources: [FD.R.taflove + ", Ch. 4", FD.R.rumpfNotes, FD.R.schneider + ", Ch. 7 (dispersion, impedance, reflection and transmission)"]
});

/* Lesson 2.4: Convergence studies you can defend. */
const FD24_RS = [10, 14, 20, 28, 40, 57, 80];
const FD24_CACHE = {};
function FD24_series(sub, d) {
  const key = sub + "_" + d;
  if (!FD24_CACHE[key]) FD24_CACHE[key] = FD24_RS.map(r => FD.slab1D({ r, n: 2.5, d, lams: [1.0], sub })[0]);
  return FD24_CACHE[key];
}
const FD24_CHECKS = [
  ["Grid", "min_steps_per_wvl: 20, 30, 40", "the reported quantity changes by about a quarter each time the cell halves", "a design that only works on its own grid"],
  ["PML distance", "space between structures and PML: λ/2, λ, 2λ", "no change once evanescent tails no longer touch the PML", "the PML absorbs part of a guided mode's tail, or reflects"],
  ["PML layers", "num_layers: 12, 24, 40", "no change in transmission or reflection", "reflection back from the PML at grazing angles"],
  ["Run time", "run_time and shutoff: halve and double", "spectra stop changing, the final field energy is below the shutoff", "ringing resonances cut off, wiggles in the spectrum"],
  ["Mode plane", "mode source and monitor size: 2, 3, 4 times the waveguide width", "n_eff and the mode power stop changing", "the mode tails are clipped and the overlap is wrong"],
  ["Frequency points", "num_freqs of the mode source, number of monitor wavelengths", "smooth spectra, no change in band averages", "a narrow feature falls between samples"]
];

addLesson("fdtd", "a2", {
level: "Core", num: "Lesson 2.4",
id: "fdtd-2-4", title: "Convergence studies you can defend", short: "2.4 Convergence",
big: String.raw`A simulation result is only believable if it does not change when the numerical settings are made more accurate. For the grid this has a precise form: a second-order method should approach the true answer as \(\Delta^2\), so the result plotted against \(\Delta^2\) is a straight line, whose intercept is an extrapolated, more accurate value and whose slope tells you the error at your grid. Staircased geometry spoils this clean behaviour and subpixel averaging restores it. The grid is not the only setting to converge: PML distance and thickness, run time, the mode plane size and the frequency sampling all need the same check.`,
bridge: String.raw`Oskooi et al. (MEEP, 2010) on accuracy and subpixel averaging, Farjadpour et al. (2006). The subpixel method itself is Lesson 5.3.`,
cards: [
{s: "1. Converge the grid", t: "Second order means a straight line against Δ²",
intu: String.raw`A real 1D FDTD computes the transmission of a slab (index 2.5, thickness 0.37 wavelengths) at one wavelength, for seven resolutions from 10 to 80 cells per vacuum wavelength, each \(\sqrt2\) finer than the last. Plotted against \(\Delta^2\) the finer points fall on a straight line, as a second-order method should. The two coarsest bend away: they are not yet in the asymptotic range, which is why a convergence study needs more than two grids. The line through the two finest points, extended to \(\Delta = 0\), is the Richardson extrapolation: here it lands much closer to the exact answer than any single run. Compare the change between neighbouring resolutions with the true error: the change is a usable estimate of the error.`,
eq: String.raw`\[ T(\Delta) \approx T_\infty + C\,\Delta^2 \quad\Rightarrow\quad T_\infty \approx \frac{4\,T(\Delta/2) - T(\Delta)}{3} \]`,
sym: [[String.raw`\(T_\infty\)`, "the answer the grid converges to"], ["C", "a constant set by the problem"], ["Richardson", "combine two resolutions to cancel the leading error term"]],
how: ["Run at three or more resolutions, each finer by a fixed factor.", "Plot the result against Δ² and check it is a straight line.", "Extrapolate to Δ = 0 and quote the difference from your production grid as its error."],
say: "A grid-converged result changes like Δ² as the grid is refined, which lets me estimate the remaining error and extrapolate.",
num: "Exact transmission of this slab: 0.8148.",
r(fig, ctl) {
  ctl.innerHTML = `<div class="readout" id="ro"></div>`;
  const T = FD24_series(true, 0.37), ex = FD.slabT(2.5, 0.37, 1.0), d2 = FD24_RS.map(r => 1 / (r * r));
  const X = C3.X(80, 540, 0, 0.0105), Y = C3.Y(20, 190, 0.7, 1.0);
  let s = C3.frame(80, 20, 540, 190, 0, 0.0105, 0.7, 1.0, [0, 0.0025, 0.005, 0.0075, 0.01], [0.7, 0.8, 0.9, 1], "Δ² (in units of λ0²)", "transmission", v => v ? v.toFixed(4) : "0");
  s += `<line x1="80" x2="620" y1="${Y(ex)}" y2="${Y(ex)}" stroke="var(--teal)" stroke-dasharray="6 4"/>` + FD.txt(616, Y(ex) - 6, "exact", "ts", "end");
  const n = FD24_RS.length, k = (T[n - 2] - T[n - 1]) / (d2[n - 2] - d2[n - 1]), Tinf = T[n - 1] - k * d2[n - 1];
  s += plot(80, 20, 540, 190, range(0, 0.0105, 60), range(0, 0.0105, 60).map(x => Tinf + k * x), 0, 0.0105, 0.7, 1.0, "var(--purple)", 1.4, "4 3");
  T.forEach((v, i) => s += `<circle cx="${X(d2[i])}" cy="${Y(v)}" r="5" fill="var(--coral)"/>` + (FD24_RS[i] <= 40 ? FD.txt(X(d2[i]) + 7, Y(v) - 7, FD24_RS[i]) : ""));
  s += `<circle cx="${X(0)}" cy="${Y(Tinf)}" r="6" fill="none" stroke="var(--purple)" stroke-width="2"/>` + C3.legend(100, 262, [["FDTD (label: cells per λ0)", "var(--coral)"], ["Richardson line", "var(--purple)"], ["exact", "var(--teal)"]]);
  fig.innerHTML = svg(272, s);
  $("ro").innerHTML = FD.ro([["at 40 cells", FD.f(T[4], 4)], ["change from 28 to 40", FD.f(Math.abs(T[4] - T[3]), 4)], ["true error at 40", FD.f(Math.abs(T[4] - ex), 4)], ["Richardson from 57 and 80", FD.f(Tinf, 4) + " (error " + FD.f(Math.abs(Tinf - ex), 4) + ")"]]);
}},
{s: "2. Staircasing spoils it", t: "Without subpixel averaging the convergence is erratic",
intu: String.raw`Now the slab faces are snapped to the nearest grid line, which is what plain staircasing does. Whenever the thickness falls between grid lines the slab is effectively a bit thicker or thinner, by up to half a cell, and that error jumps around as the resolution changes: the points scatter instead of following a line. Switch subpixel averaging on: the cells cut by a face get the average permittivity, the slab keeps its true optical thickness, and the clean \(\Delta^2\) behaviour comes back. This is why a convergence plot can look worse than the physics deserves when averaging is off.`,
eq: String.raw`\[ \text{staircase: error} \sim O(\Delta)\ \text{and erratic} \qquad \text{averaged: error} \sim O(\Delta^2) \]`,
sym: [["staircase", "each cell gets the material at its centre"], ["subpixel averaging", "each cell gets a volume-weighted (here arithmetic) mean permittivity"]],
how: ["Snapping moves an interface by up to half a cell.", "That change does not shrink smoothly with the cell, it depends on where the face falls.", "Averaging the permittivity of the cut cell restores a smooth dependence."],
say: "Staircased interfaces give erratic, first-order convergence. Subpixel averaging restores second-order convergence for dielectric interfaces.",
num: "Same slab and resolutions as card 1. Tidy3D 2.11 has subpixel averaging on by default, with polarized averaging for dielectrics.",
r(fig, ctl) {
  let sub = false; ctl.innerHTML = btns([["0", "Staircase"], ["1", "Subpixel averaging"]], "s") + `<div class="readout" id="ro"></div>`;
  const u = () => {
    pick(ctl, "s", sub ? "1" : "0");
    const T = FD24_series(sub, 0.37), ex = FD.slabT(2.5, 0.37, 1.0), X = C3.X(80, 540, 8, 84), Y = C3.Y(20, 190, -0.5, 0.15);
    let s = C3.frame(80, 20, 540, 190, 8, 84, -0.5, 0.15, FD24_RS, [-0.4, -0.2, 0], "cells per vacuum wavelength", "T − exact");
    s += `<line x1="80" x2="620" y1="${Y(0)}" y2="${Y(0)}" stroke="var(--teal)" stroke-dasharray="6 4"/>`;
    s += plot(80, 20, 540, 190, FD24_RS, T.map(v => v - ex), 8, 84, -0.5, 0.15, sub ? "var(--purple)" : "var(--coral)", 1.6);
    T.forEach((v, i) => s += `<circle cx="${X(FD24_RS[i])}" cy="${Y(Math.max(-0.5, v - ex))}" r="5" fill="${sub ? "var(--purple)" : "var(--coral)"}"/>`);
    fig.innerHTML = svg(250, s);
    $("ro").innerHTML = FD.ro(FD24_RS.slice(3).map((r, i) => [r + " cells", FD.f(T[i + 3] - ex, 4)]));
  };
  ctl.querySelectorAll("button").forEach(b => b.onclick = () => { sub = b.dataset.s === "1"; u(); }); u();
}},
{s: "3. Everything else", t: "The other settings that must converge",
intu: String.raw`The grid is the famous one, but each of these settings can change a result just as much. Click each item: it says what to vary, what you should see once it is converged, and what goes wrong otherwise. The rule is the same for all: change one setting at a time, by a factor of about two, and show that the quantity you report moves by much less than the precision you claim. Keep the convergence plots, a committee will ask for them.`,
eq: String.raw`\[ \frac{|Q(p_2) - Q(p_1)|}{|Q(p_2)|} \ll \text{precision you quote} \]`,
sym: [["Q", "the reported quantity, for example transmission at 795 nm"], [String.raw`\(p_1, p_2\)`, "two values of one numerical setting"]],
how: ["Pick the quantity you will report.", "Vary one numerical setting at a time by a factor of about two.", "Report the change, and keep the setting where the change is negligible."],
say: "I converged the grid, the PML distance and thickness, the run time and the mode plane size, one at a time, and the reported values change by less than the precision I quote.",
num: "Tidy3D 2.11 defaults: PML 12 layers, shutoff 1e-5, Courant factor 0.99, <code>min_steps_per_wvl</code> 10.",
r(fig, ctl) {
  let k = 0; ctl.innerHTML = `<div class="row">${FD24_CHECKS.map((c, i) => `<button data-k="${i}">${c[0]}</button>`).join("")}</div>`;
  const u = () => {
    pick(ctl, "k", k); const c = FD24_CHECKS[k];
    let s = LC.box(20, 20, 640, 54, ["Vary", c[1]], "blue") + LC.box(20, 90, 640, 54, ["Converged when", c[2]], "teal") + LC.box(20, 160, 640, 54, ["If not converged", c[3]], "coral");
    fig.innerHTML = svg(232, s);
  };
  ctl.querySelectorAll("button").forEach(b => b.onclick = () => { k = +b.dataset.k; u(); }); u();
}},
FD.ckpt({ step: 6, t: "Optimize at 20, validate at 30, report both",
  intu: String.raw`For the PBS the figure of merit was computed at 20 steps per wavelength during optimization, and the final design was simulated again at 30. That pair is a two-point convergence check: if the second-order behaviour holds, the 20 to 30 change is about 1.25 times the remaining error at 30, because \(1/20^2 - 1/30^2\) is 1.25 times \(1/30^2\). Quote the validated number, and quote the 20 to 30 change as the grid uncertainty. A large change means the optimizer was exploiting the coarse grid.`,
  code: ["def fom(sim_data):  ...                        # the same FOM as in the optimization", "", "sim20 = make_sim(design, min_steps_per_wvl=20)", "sim30 = make_sim(design, min_steps_per_wvl=30)", "J20, J30 = fom(web.run(sim20, task_name='val20')), fom(web.run(sim30, task_name='val30'))", "print('grid change', abs(J30 - J20) / J30)       # report this next to J30"],
  hi: [4, 5],
  on: ["design", "ports", "mon"], cap: "the port powers are the quantity to converge, not the field picture",
  eq: String.raw`\[ \frac{\tfrac{1}{20^2} - \tfrac{1}{30^2}}{\tfrac{1}{30^2}} = 1.25 \quad\Rightarrow\quad |Q_{30} - Q_\infty| \approx \frac{|Q_{30} - Q_{20}|}{1.25} \]`,
  sym: [[String.raw`\(Q_{20}, Q_{30}\)`, "the reported value at 20 and 30 steps per wavelength"]],
  how: ["Keep the design fixed.", "Re-run at 30 steps per wavelength.", "Use the change to estimate the error, assuming second order."],
  say: "I optimized at 20 steps per wavelength and validated at 30. The change between them estimates the grid error of the validated value.",
  num: "The estimate assumes the second-order regime has been reached, which card 1 shows needs subpixel averaging and enough cells."
})
],
summary: String.raw`A second-order method approaches the answer as \(\Delta^2\): plot against \(\Delta^2\), check for a straight line, extrapolate with Richardson, \(T_\infty \approx (4T(\Delta/2) - T(\Delta))/3\), and quote the change between grids as the error. Staircasing makes convergence erratic and first order, subpixel averaging restores second order. Converge PML distance and thickness, run time, mode plane size and frequency sampling the same way, one setting at a time.`,
sheet: [
[String.raw`\[ T(\Delta) \approx T_\infty + C\Delta^2 \]`, "Second-order convergence"],
[String.raw`\[ T_\infty \approx \frac{4T(\Delta/2) - T(\Delta)}{3} \]`, "Richardson extrapolation with a factor two refinement"],
[String.raw`\[ |Q_{30} - Q_\infty| \approx |Q_{30} - Q_{20}|/1.25 \]`, "Error estimate from a 20 and 30 pair"]],
teach: [
  "Draw a result against the cell size squared: points on a line approaching an intercept.",
  "Write T(Δ) = T∞ + CΔ² and solve two equations for T∞: Richardson.",
  "Draw the staircase version: points jumping around. Say: snapped interfaces, fix with subpixel averaging.",
  "List the other settings: PML, run time, mode plane, frequency points.",
  "Finish with the sentence for the thesis: optimized at 20, validated at 30, the change estimates the grid error."
],
qa: [
  ["How do you know your results are converged?", "I re-ran the final design at a finer grid and checked that the port powers changed by less than the precision I quote. I also checked PML distance, run time and the mode plane size, one at a time."],
  ["Why plot against Δ squared?", "Because the Yee scheme is second order, the leading error is proportional to Δ². Against Δ² the points lie on a straight line, which is easy to judge and to extrapolate."],
  ["What if the convergence is not monotonic?", "That usually means staircasing of interfaces or a resonance that the grid shifts across a sample wavelength. Turn on subpixel averaging, compare at fixed physical wavelengths, and check that the run time is long enough."],
  ["Is Richardson extrapolation safe to report as the answer?", "Only if the points really follow the expected order. I would report the finest-grid value and give the extrapolation as a check on its error."]
],
mistakes: [
  "Changing two settings at once and calling the result converged.",
  "Converging a field picture instead of the number you report.",
  "Refining by a tiny factor, such as 20 to 22, where the change is hidden in noise.",
  "Forgetting that the optimizer may have tuned the design to the coarse grid."
],
videos: [FD.vid("f10", "Why staircasing breaks second-order convergence and how averaging restores it."), FD.vid("f8", "Practical rules for choosing the resolution.")],
sources: [FD.R.meep + ", sections on accuracy, convergence and subpixel averaging", FD.R.farj, FD.R.taflove + ", Ch. 4", FD.R.td + ": SubpixelSpec (default polarized averaging for dielectrics)"]
});

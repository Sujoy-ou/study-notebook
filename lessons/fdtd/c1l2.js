/* Lesson 1.2: Finite differences and their error. */
addLesson("fdtd", "a1", {
level: "Basic", num: "Lesson 1.2",
id: "fdtd-1-2", title: "Finite differences and their error", short: "1.2 Finite differences",
big: String.raw`A computer cannot take a derivative, but it can subtract two numbers. A finite difference replaces \(df/dx\) by the change of \(f\) between two nearby points divided by their distance. Which two points you pick decides the error. Taking one point on each side of where you want the derivative, the central difference, cancels the first error term and leaves an error that shrinks with the square of the spacing. That one fact, second-order accuracy from a centred difference, is the reason the Yee grid puts E and H half a cell apart.`,
bridge: "Taflove and Hagness Ch. 2, Rumpf EMP 5337 Lecture 4a. Lesson 1.3 uses the central difference in space and in time.",
cards: [
{s: "1. Three differences", t: "Forward, backward and central",
intu: String.raw`The curve is \(f(x) = \sin(kx)\) and the dashed line is its true tangent at the marked point. The three coloured lines are the secants a computer can use. The forward difference uses the point and its right neighbour, the backward difference its left neighbour, the central difference the two neighbours on either side. Shrink the spacing. All three approach the tangent, but the central one is far closer at every spacing, because its errors from the two sides cancel.`,
eq: String.raw`\[ D_+ f = \frac{f(x+\Delta) - f(x)}{\Delta}, \qquad D_- f = \frac{f(x) - f(x-\Delta)}{\Delta}, \qquad D_0 f = \frac{f(x+\tfrac{\Delta}{2}) - f(x-\tfrac{\Delta}{2})}{\Delta} \]`,
sym: [[String.raw`\(\Delta\)`, "spacing between the two sample points"], [String.raw`\(D_+, D_-, D_0\)`, "forward, backward and central difference"]],
how: ["Pick two sample points near x.", "Subtract their values and divide by their distance.", "Centre them on x to get the central difference."],
say: "A central difference takes samples symmetrically on both sides of the point where the derivative is wanted.",
num: "Here k = 2π, so one wavelength is 1 on the x axis.",
r(fig, ctl) {
  ctl.innerHTML = sl("dl", "Spacing Δ (wavelengths)", 0.02, 0.4, 0.01, 0.25) + sl("x0", "Point x", 0.05, 0.95, 0.01, 0.15) + `<div class="readout" id="ro"></div>`;
  const k = 2 * Math.PI, f = x => Math.sin(k * x), df = x => k * Math.cos(k * x);
  const u = () => {
    const d = +$("dl").value, x0 = +$("x0").value; $("dlv").textContent = d.toFixed(2); $("x0v").textContent = x0.toFixed(2);
    const X = C3.X(60, 560, -0.25, 1.25), Y = C3.Y(20, 190, -1.4, 1.4), xs = range(-0.25, 1.25, 300);
    let s = C3.frame(60, 20, 560, 190, -0.25, 1.25, -1.4, 1.4, [0, 0.5, 1], [-1, 0, 1], "x (wavelengths)", "f") + plot(60, 20, 560, 190, xs, xs.map(f), -0.25, 1.25, -1.4, 1.4, "var(--t)", 2);
    const line = (sl0, col, dash) => { const a = x0 - 0.3, b = x0 + 0.3; return `<line x1="${X(a)}" y1="${Y(f(x0) + sl0 * (a - x0))}" x2="${X(b)}" y2="${Y(f(x0) + sl0 * (b - x0))}" stroke="${col}" stroke-width="2" ${dash ? `stroke-dasharray="${dash}"` : ""}/>`; };
    const Dp = (f(x0 + d) - f(x0)) / d, Dm = (f(x0) - f(x0 - d)) / d, D0 = (f(x0 + d / 2) - f(x0 - d / 2)) / d;
    s += line(df(x0), "var(--t)", "5 4") + line(Dp, "var(--coral)") + line(Dm, "var(--purple)") + line(D0, "var(--teal)");
    for (const [x, c] of [[x0, "var(--t)"], [x0 + d, "var(--coral)"], [x0 - d, "var(--purple)"], [x0 + d / 2, "var(--teal)"], [x0 - d / 2, "var(--teal)"]]) s += `<circle cx="${X(x)}" cy="${Y(f(x))}" r="4.5" fill="${c}"/>`;
    s += C3.legend(70, 268, [["true tangent", "var(--t)"], ["forward", "var(--coral)"], ["backward", "var(--purple)"], ["central", "var(--teal)"]]);
    fig.innerHTML = svg(278, s);
    const e = v => FD.f(Math.abs(v - df(x0)) / k * 100, 1) + " %";
    $("ro").innerHTML = FD.ro([["true slope / k", FD.f(df(x0) / k, 3)], ["forward error", e(Dp)], ["backward error", e(Dm)], ["central error", e(D0)]]);
  };
  $("dl").oninput = u; $("x0").oninput = u; u();
}},
{s: "2. The error law", t: "First order against second order",
intu: String.raw`Expand \(f\) in a Taylor series around the point. In the forward difference the term with \(f''\) survives, so the error is proportional to \(\Delta\). In the central difference the \(f''\) terms from the two sides cancel and the first surviving error is proportional to \(\Delta^2\). The plot shows the measured error against the spacing on log-log axes, computed live. The forward curve has slope 1 and the central curve slope 2: halve the spacing and the central error drops by four.`,
eq: String.raw`\[ D_+ f = f' + \frac{\Delta}{2} f'' + O(\Delta^2), \qquad D_0 f = f' + \frac{\Delta^2}{24} f''' + O(\Delta^4) \]`,
sym: [[String.raw`\(O(\Delta^p)\)`, String.raw`terms that shrink like \(\Delta^p\)`], ["order p", "the slope of log(error) against log(Δ)"]],
how: [String.raw`Taylor: \(f(x \pm h) = f \pm h f' + \tfrac{h^2}{2}f'' \pm \tfrac{h^3}{6}f''' + \dots\)`, String.raw`Forward with \(h = \Delta\): divide by \(\Delta\), the \(\tfrac{\Delta}{2}f''\) term is left.`, String.raw`Central with \(h = \Delta/2\): subtract the two expansions, the even terms cancel, divide by \(\Delta\), the \(\tfrac{\Delta^2}{24}f'''\) term is left.`],
say: "The central difference is second-order accurate: its error shrinks with the square of the spacing, while a one-sided difference is only first order.",
num: "At 20 points per wavelength the central difference of a sine is off by about 0.4 %.",
r(fig, ctl) {
  ctl.innerHTML = sl("x0", "Point x", 0.05, 0.95, 0.01, 0.15) + `<div class="readout" id="ro"></div>`;
  const k = 2 * Math.PI, f = x => Math.sin(k * x), df = x => k * Math.cos(k * x);
  const u = () => {
    const x0 = +$("x0").value; $("x0v").textContent = x0.toFixed(2);
    const ds = range(-3, -0.4, 40).map(v => Math.pow(10, v));
    const ef = ds.map(d => Math.log10(Math.abs((f(x0 + d) - f(x0)) / d - df(x0)) / k + 1e-16)), ec = ds.map(d => Math.log10(Math.abs((f(x0 + d / 2) - f(x0 - d / 2)) / d - df(x0)) / k + 1e-16)), lx = ds.map(Math.log10);
    let s = C3.frame(70, 20, 560, 190, -3, -0.4, -8, 0, [-3, -2, -1], [-8, -6, -4, -2, 0], "log₁₀ Δ (wavelengths)", "log₁₀ relative error") + plot(70, 20, 560, 190, lx, ef, -3, -0.4, -8, 0, "var(--coral)", 2.2) + plot(70, 20, 560, 190, lx, ec, -3, -0.4, -8, 0, "var(--teal)", 2.2);
    s += plot(70, 20, 560, 190, [-3, -0.4], [-3.2, -0.6], -3, -0.4, -8, 0, "var(--coral)", 1, "3 4") + plot(70, 20, 560, 190, [-3, -0.4], [-6.6, -1.4], -3, -0.4, -8, 0, "var(--teal)", 1, "3 4");
    s += C3.legend(90, 268, [["forward (slope 1)", "var(--coral)"], ["central (slope 2)", "var(--teal)"], ["dotted: guide lines", "var(--p)"]]);
    fig.innerHTML = svg(278, s);
    const slope = (a, i, j) => (a[j] - a[i]) / (lx[j] - lx[i]);
    $("ro").innerHTML = FD.ro([["measured slope, forward", FD.f(slope(ef, 5, 25), 2)], ["measured slope, central", FD.f(slope(ec, 5, 25), 2)]]);
  };
  $("x0").oninput = u; u();
}},
{s: "3. Why staggering", t: "A centred difference wants its samples half a step away",
intu: String.raw`The central difference needs \(f\) at \(x \pm \Delta/2\), half a cell from the point. If every quantity sat on the same nodes, you would have to use \(x \pm \Delta\) instead, which doubles the effective spacing and skips the node itself. Then a field that flips sign from node to node, the zigzag, has a computed derivative of exactly zero: the scheme cannot see it, and such spurious patterns can sit in the grid unnoticed. Toggle the field and the grid. On the staggered grid the derivative is stored halfway between nodes, uses the nearest neighbours, and sees the zigzag. This is the geometric idea behind the Yee grid.`,
eq: String.raw`\[ \text{same nodes: } \frac{f_{i+1} - f_{i-1}}{2\Delta} \qquad \text{staggered: } \frac{f_{i+1} - f_{i}}{\Delta}\ \text{ stored at } i + \tfrac12 \]`,
sym: [[String.raw`\(f_i\)`, String.raw`sample at node \(x_i = i\Delta\)`], [String.raw`\(i + \tfrac12\)`, "the point halfway between two nodes"]],
how: ["Keep the derivative centred and nearest-neighbour.", "Store it at the half nodes, between the samples it uses.", "In Maxwell's equations the derivative of E feeds H, so H lives at the half nodes. That is the Yee grid."],
say: "Staggering lets every derivative be a nearest-neighbour central difference, so it stays second order and cannot miss a zigzag pattern.",
num: "The zigzag is the shortest pattern a grid can hold, a wavelength of two cells.",
r(fig, ctl) {
  let fld = "smooth", grid = "same";
  ctl.innerHTML = btns([["smooth", "Smooth field"], ["zig", "Zigzag field"]], "f") + btns([["same", "Same nodes"], ["stag", "Staggered"]], "g") + `<div class="readout" id="ro"></div>`;
  const u = () => {
    pick(ctl, "f", fld); pick(ctl, "g", grid);
    const N = 17, fv = i => fld === "smooth" ? Math.sin(2 * Math.PI * i / 12) : (i % 2 ? -1 : 1) * 0.8;
    const X = i => 70 + i * 34, Yf = v => 80 - v * 45, Yd = v => 200 - v * 22;
    let s = `<line x1="60" x2="630" y1="80" y2="80" stroke="var(--b)"/><line x1="60" x2="630" y1="200" y2="200" stroke="var(--b)"/>` + FD.txt(20, 84, "f") + FD.txt(20, 204, "df/dx");
    for (let i = 0; i < N; i++) s += `<line x1="${X(i)}" x2="${X(i)}" y1="80" y2="${Yf(fv(i))}" stroke="var(--blue)"/><circle cx="${X(i)}" cy="${Yf(fv(i))}" r="5" fill="var(--blue)"/>`;
    let mx = 0;
    if (grid === "same") for (let i = 1; i < N - 1; i++) { const d = (fv(i + 1) - fv(i - 1)) / 2; mx = Math.max(mx, Math.abs(d)); s += `<line x1="${X(i)}" x2="${X(i)}" y1="200" y2="${Yd(d)}" stroke="var(--coral)"/><rect x="${X(i) - 4}" y="${Yd(d) - 4}" width="8" height="8" fill="var(--coral)"/>`; }
    else for (let i = 0; i < N - 1; i++) { const d = fv(i + 1) - fv(i); mx = Math.max(mx, Math.abs(d)); s += `<line x1="${X(i + 0.5)}" x2="${X(i + 0.5)}" y1="200" y2="${Yd(d)}" stroke="var(--coral)"/><rect x="${X(i + 0.5) - 4}" y="${Yd(d) - 4}" width="8" height="8" fill="var(--coral)"/>`; }
    s += FD.txt(340, 252, grid === "same" ? "derivative on the same nodes, from the neighbours two cells apart" : "derivative halfway between nodes, from the two nearest samples", "ts", "middle");
    fig.innerHTML = svg(262, s);
    $("ro").innerHTML = FD.ro([["largest computed |df/dx| × Δ", FD.f(mx, 3)], ["the scheme sees the pattern?", mx < 1e-9 ? "no, it is invisible" : "yes"]]);
  };
  ctl.querySelectorAll("button[data-f]").forEach(b => b.onclick = () => { fld = b.dataset.f; u(); });
  ctl.querySelectorAll("button[data-g]").forEach(b => b.onclick = () => { grid = b.dataset.g; u(); }); u();
}},
{s: "4. Error you can count", t: "How a small derivative error becomes a phase error",
intu: String.raw`Apply the central difference to a wave \(e^{ikx}\). It returns \(ik\) times a factor slightly below one, so on the grid the wave behaves as if its wavenumber were a bit smaller. That small relative error adds up along the path: after many wavelengths the computed wave is out of step with the real one. Move the sliders. Fewer points per wavelength or a longer path both grow the phase error. This is the spatial half of numerical dispersion, which Lesson 2.2 completes with the time step.`,
eq: String.raw`\[ D_0\, e^{ikx} = ik\,\frac{\sin(k\Delta/2)}{k\Delta/2}\,e^{ikx}, \qquad \frac{\delta k}{k} \approx \frac{(k\Delta)^2}{24} = \frac{\pi^2}{6N^2} \]`,
sym: [[String.raw`\(N = \lambda/\Delta\)`, "points per wavelength"], [String.raw`\(\delta k / k\)`, "relative wavenumber error from the spatial difference"], [String.raw`\(\delta\phi = 2\pi L\,\delta k/k\)`, "phase error after L wavelengths"]],
how: [String.raw`Insert \(f = e^{ikx}\) into the central difference: \((e^{ik\Delta/2} - e^{-ik\Delta/2})/\Delta = 2i\sin(k\Delta/2)/\Delta\).`, String.raw`Expand the sine: \(\sin u/u \approx 1 - u^2/6\) with \(u = k\Delta/2\).`, String.raw`So \(\delta k/k \approx (k\Delta)^2/24\), and with \(k\Delta = 2\pi/N\) it is \(\pi^2/(6N^2)\).`],
say: "The spatial central difference makes waves on the grid slightly too slow, with a relative error of about π² over 6N² at N points per wavelength.",
num: "N = 10: 1.6 %. N = 20: 0.41 %. N = 30: 0.18 %. These are the spatial part only.",
r(fig, ctl) {
  ctl.innerHTML = sl("np", "Points per wavelength N", 6, 40, 1, 20) + sl("lw", "Path length (wavelengths)", 1, 30, 1, 10) + `<div class="readout" id="ro"></div>`;
  const u = () => {
    const N = +$("np").value, L = +$("lw").value; $("npv").textContent = N; $("lwv").textContent = L;
    const r = Math.sin(Math.PI / N) / (Math.PI / N), xs = range(Math.max(0, L - 2), L, 300);
    let s = C3.frame(60, 20, 560, 160, xs[0], L, -1.2, 1.2, [xs[0], L], [], "x (wavelengths), last two wavelengths of the path", "") + plot(60, 20, 560, 160, xs, xs.map(x => Math.cos(2 * Math.PI * x)), xs[0], L, -1.2, 1.2, "var(--t)", 2, "5 4") + plot(60, 20, 560, 160, xs, xs.map(x => Math.cos(2 * Math.PI * r * x)), xs[0], L, -1.2, 1.2, "var(--coral)", 2.2);
    s += C3.legend(80, 232, [["exact wave", "var(--t)"], ["wave with the grid's wavenumber", "var(--coral)"]]);
    fig.innerHTML = svg(244, s);
    const dph = 2 * Math.PI * L * (1 - r);
    $("ro").innerHTML = FD.ro([["δk / k", FD.f((1 - r) * 100, 3) + " %"], ["estimate π²/6N²", FD.f(Math.PI * Math.PI / 6 / N / N * 100, 3) + " %"], ["phase error", FD.f(dph, 3) + " rad = " + FD.f(dph * 180 / Math.PI, 1) + "°"]]);
  };
  $("np").oninput = u; $("lw").oninput = u; u();
}},
FD.ckpt({ step: 3, t: "Twenty points per wavelength in the membrane",
  intu: String.raw`The PBS optimization used a grid of 20 cells per wavelength inside the high-index membrane, and 30 for the final validation runs. With this lesson you can say what that buys. At 20 points the central difference alone puts the wavenumber off by about 0.4 %. The light crosses roughly ten wavelengths of membrane between the input and a port, so the phase drift is a few tenths of a radian, enough to shift an interference pattern slightly. That is why final numbers are re-checked on a finer grid (Lesson 2.4).`,
  code: ["# Tidy3D chooses the cell size from steps per wavelength inside each material", "grid_spec = td.GridSpec.auto(min_steps_per_wvl=20, wavelength=0.795)   # optimization", "grid_val  = td.GridSpec.auto(min_steps_per_wvl=30, wavelength=0.795)   # validation", "", "# cell in the membrane = 0.795 / (20 * 3.492) = 0.01138 um"],
  hi: [1, 2],
  on: ["design", "ports"], cap: "the light crosses about ten membrane wavelengths from the input to a port",
  eq: String.raw`\[ \Delta = \frac{\lambda_0}{N\,n} = \frac{795\ \text{nm}}{20 \times 3.492} = 11.38\ \text{nm}, \qquad \frac{\delta k}{k} \approx \frac{\pi^2}{6 \cdot 20^2} = 0.41\ \% \]`,
  sym: [["N", "steps per wavelength inside the material"], ["n", "index of the material, 3.492 for the membrane"]],
  how: ["The shortest wavelength in the problem is inside the membrane.", "Divide it by the steps per wavelength to get the cell.", "Estimate the phase error with π²/6N² times the path length in wavelengths."],
  say: "At 20 cells per wavelength the spatial derivative error is about 0.4 %, which accumulates to a few tenths of a radian over the PBS, so results were re-checked at 30.",
  num: String.raw`11.38 nm also equals the pixel size of the design region, so every pixel is one grid cell. Path of 10 wavelengths: \(\delta\phi \approx 2\pi \cdot 10 \cdot 0.0041 \approx 0.26\) rad.`
})
],
summary: String.raw`Derivatives become differences of neighbouring samples. A one-sided difference has an error proportional to \(\Delta\), a centred one an error proportional to \(\Delta^2\) because the even Taylor terms cancel. Centred nearest-neighbour differences need the derivative stored halfway between samples, which is why E and H are staggered. On a wave the spatial error is a slightly wrong wavenumber, \(\delta k/k \approx \pi^2/(6N^2)\), which builds up into a phase error along the path.`,
sheet: [
[String.raw`\[ D_0 f = \frac{f(x+\tfrac{\Delta}{2}) - f(x-\tfrac{\Delta}{2})}{\Delta} = f' + \frac{\Delta^2}{24}f''' + \dots \]`, "Central difference, second order"],
[String.raw`\[ D_+ f = f' + \frac{\Delta}{2}f'' + \dots \]`, "Forward difference, first order"],
[String.raw`\[ \frac{\delta k}{k} \approx \frac{\pi^2}{6N^2} \]`, "Spatial wavenumber error at N points per wavelength"]],
teach: [
  "Draw a curve, mark a point, draw the tangent.",
  "Draw the forward secant and the central secant. Ask which is closer.",
  String.raw`Write the two Taylor expansions for \(f(x \pm h)\) one under the other and subtract: the even terms cancel.`,
  String.raw`Conclude: central error \(\propto \Delta^2\), forward \(\propto \Delta\). Sketch the log-log plot with slopes 1 and 2.`,
  "Draw nodes with dots and the derivative halfway between them. Say: this is why H sits half a cell from E."
],
qa: [
  ["Why not use a higher-order difference with more neighbours?", "It is possible and some FDTD variants do. It costs more operations and memory traffic per cell, makes boundaries and material interfaces harder, and the accuracy at interfaces is limited by the staircasing of the geometry anyway. Standard Yee FDTD stays second order and fixes interface error with subpixel averaging (Lesson 5.3)."],
  ["What does second order mean in practice?", "Halving the cell size cuts this error by four. A convergence study (Lesson 2.4) checks exactly that: the result should change by a quarter as much each time the grid is refined by two."],
  ["Is the Yee scheme second order in time as well?", "Yes. The leapfrog takes the time derivative as a central difference too, with E and H half a time step apart (Lesson 1.3)."]
],
mistakes: [
  "Using the collocated difference (f(i+1) minus f(i-1)) over 2Δ and calling it the Yee scheme. Yee uses nearest neighbours across a half cell.",
  "Confusing the error of one derivative with the error of the final result. The phase error grows with the length of the path.",
  "Counting points per wavelength with the vacuum wavelength. It is the wavelength inside the highest-index material that matters."
],
videos: [FD.vid("r1", "The finite-difference idea and where FDTD comes from."), FD.vid("r5337", "Lecture 4a, the finite-difference method, gives the Taylor derivation in slides.")],
sources: [FD.R.taflove + ", Ch. 2 (the one-dimensional scalar wave equation and finite differences)", FD.R.schneider + ", Ch. 3", "R. C. Rumpf, EMP 5337 Lecture 4a, Finite Difference Method (empossible.net)"]
});

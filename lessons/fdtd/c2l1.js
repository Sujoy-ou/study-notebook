/* Lesson 2.1: The Courant condition. */
addLesson("fdtd", "a2", {
level: "Core", num: "Lesson 2.1",
id: "fdtd-2-1", title: "The Courant condition", short: "2.1 The Courant condition",
big: String.raw`An explicit update moves information by at most one cell per time step, because each new value reads only its nearest neighbours. Light must not be faster than that on the grid, or the scheme cannot represent it and the errors grow without bound. This gives the Courant, Friedrichs and Lewy (CFL) limit on the time step: \(c\Delta t \le \Delta x\) in 1D, \(\Delta/\sqrt2\) in 2D and \(\Delta/\sqrt3\) in 3D for square and cubic cells. Because one time step is used everywhere, the smallest cell anywhere in the grid sets it for the whole simulation.`,
bridge: String.raw`Taflove and Hagness Ch. 4, Schneider Ch. 3 and 7. Lesson 2.2 uses the same derivation to find the wave speed on the grid.`,
cards: [
{s: "1. Domain of dependence", t: "Information moves one cell per step",
intu: String.raw`Look at one grid value at the top of the chart. Going back one step, it depends on its neighbours, going back two steps on their neighbours, and so on: the grey triangle is all the grid points that can affect it. The true solution depends on the region a light signal can reach, the blue cone with slope \(c\). Increase the time step. When the light cone becomes wider than the grey triangle, the real answer depends on points the scheme never reads. No difference scheme can get that right, and in FDTD it blows up.`,
eq: String.raw`\[ \underbrace{c\,\Delta t}_{\text{light moves}} \;\le\; \underbrace{\Delta x}_{\text{grid moves}} \qquad\Longleftrightarrow\qquad S = \frac{c\,\Delta t}{\Delta x} \le 1 \]`,
sym: [["S", "Courant number"], ["grey triangle", "numerical domain of dependence"], ["blue cone", "physical domain of dependence"]],
how: ["Each update reads one neighbour on each side.", "After m steps, information has moved at most m cells.", "Light moves c Δt per step, so it must not cover more than one cell."],
say: "The CFL condition says the numerical domain of dependence must contain the physical one. In 1D that means c Δt ≤ Δx.",
num: "In 1D the Yee scheme is stable up to S = 1 exactly.",
r(fig, ctl) {
  ctl.innerHTML = sl("S", "Courant number S", 0.3, 1.6, 0.01, 0.7) + `<div class="readout" id="ro"></div>`;
  const u = () => {
    const S = +$("S").value; $("Sv").textContent = S.toFixed(2);
    const dx = 46, dt = 46 * 0.8, x0 = 340, y0 = 40, M = 5; let s = "";
    for (let m = 0; m <= M; m++) for (let i = -M; i <= M; i++) s += `<circle cx="${x0 + i * dx}" cy="${y0 + m * dt}" r="3.5" fill="var(--b)"/>`;
    s += `<path d="M${x0} ${y0} L${x0 - M * dx} ${y0 + M * dt} L${x0 + M * dx} ${y0 + M * dt} Z" fill="var(--gray-bg)" stroke="var(--p)" opacity="0.7"/>`;
    const w = Math.min(M * dx * S, 330);
    s += `<path d="M${x0} ${y0} L${x0 - w} ${y0 + M * dt} L${x0 + w} ${y0 + M * dt} Z" fill="var(--blue)" fill-opacity="0.18" stroke="var(--blue)" stroke-width="2"/>`;
    for (let m = 0; m <= M; m++) for (let i = -m; i <= m; i++) s += `<circle cx="${x0 + i * dx}" cy="${y0 + m * dt}" r="4" fill="var(--p)"/>`;
    s += `<circle cx="${x0}" cy="${y0}" r="7" fill="var(--coral)"/>` + FD.txt(x0 + 12, y0 - 6, "the value we compute") + FD.txt(20, y0 + M * dt + 26, "← 5 time steps earlier") + FD.txt(20, y0 + 4, "now");
    fig.innerHTML = svg(250, s);
    $("ro").innerHTML = FD.ro([["light cone inside the grid's triangle?", S <= 1 ? "yes" : "no"], ["verdict", S <= 1 ? "can be stable" : "unstable, blows up"]]);
  };
  $("S").oninput = u; u();
}},
{s: "2. Von Neumann", t: "Why exceeding the limit makes the field grow",
intu: String.raw`Try a single Fourier mode, a wave with wavenumber \(k\) on the grid, and ask how its amplitude changes in one step. For the Yee scheme the factor \(g\) satisfies a quadratic equation. When \(S\sin(k\Delta x/2) \le 1\) its two roots have \(|g| = 1\): the wave neither grows nor decays. When that product exceeds 1 for some \(k\), one root has \(|g| \gt 1\) and that wave is multiplied by \(|g|\) every step. Move the slider past 1. The shortest waves on the grid (\(k\Delta x = \pi\), a zigzag) are the first to grow, which is why a blown-up FDTD run looks like a sawtooth.`,
eq: String.raw`\[ g^2 - 2\big(1 - 2S^2\sin^2\tfrac{k\Delta x}{2}\big)\,g + 1 = 0, \qquad |g| = 1 \iff S\,\big|\sin\tfrac{k\Delta x}{2}\big| \le 1 \]`,
sym: [["g", "amplification factor of one Fourier mode per time step"], [String.raw`\(k\Delta x\)`, String.raw`wavenumber times cell, from 0 to \(\pi\) on the grid`]],
how: [String.raw`Insert \(E^n_i = E_0\,g^n e^{ik i\Delta x}\) and the same for H into the two update equations.`, String.raw`Eliminate H: \((g - 2 + g^{-1}) = -4S^2\sin^2(k\Delta x/2)\).`, String.raw`Multiply by g: a quadratic with product of roots 1. Both roots are on the unit circle only if the middle coefficient is between −2 and 2.`, String.raw`That is \(S^2\sin^2(k\Delta x/2) \le 1\) for every k, so \(S \le 1\).`],
say: "Above the Courant limit some grid waves have an amplification factor larger than one per step, the zigzag first, so the field grows exponentially.",
num: "At S = 1.05 the zigzag grows by a factor of about 1.9 per step, a billion times in about 33 steps.",
r(fig, ctl) {
  ctl.innerHTML = sl("S", "Courant number S", 0.5, 1.2, 0.01, 1.05) + `<div class="readout" id="ro"></div>`;
  const u = () => {
    const S = +$("S").value; $("Sv").textContent = S.toFixed(2);
    const th = range(0.001, Math.PI, 300), G = th.map(t => { const a = 1 - 2 * S * S * Math.sin(t / 2) ** 2; return Math.abs(a) <= 1 ? 1 : Math.abs(a) + Math.sqrt(a * a - 1); });
    let s = C3.frame(70, 20, 560, 180, 0, Math.PI, 0.9, 2.2, [0, Math.PI / 2, Math.PI], [1, 1.5, 2], "k Δx (0 = very long wave, π = zigzag)", "|g| per step", v => v === 0 ? "0" : v < 2 ? "π/2" : "π") + plot(70, 20, 560, 180, th, G, 0, Math.PI, 0.9, 2.2, "var(--coral)", 2.5);
    s += `<line x1="70" x2="630" y1="${C3.Y(20, 180, 0.9, 2.2)(1)}" y2="${C3.Y(20, 180, 0.9, 2.2)(1)}" stroke="var(--teal)" stroke-dasharray="5 4"/>`;
    fig.innerHTML = svg(242, s);
    const gm = Math.max(...G);
    $("ro").innerHTML = FD.ro([["largest |g|", FD.f(gm, 3)], ["growth in 100 steps", gm > 1.0000001 ? FD.sci(Math.pow(gm, 100), 1) + " ×" : "none"]]);
  };
  $("S").oninput = u; u();
}},
{s: "3. 2D and 3D", t: "The limit is lower in more dimensions",
intu: String.raw`In 2D and 3D the zigzag can point along a diagonal, where it varies in two or three directions at once and is even harder for the scheme to follow. The limit becomes \(c\Delta t \le 1/\sqrt{1/\Delta x^2 + 1/\Delta y^2 + 1/\Delta z^2}\): \(\Delta/\sqrt2\) in 2D and \(\Delta/\sqrt3\) in 3D for equal cells. This is a live 2D FDTD (square cells). Set \(S\) just below 0.707 and it runs forever. Set it just above and a checkerboard grows out of round-off and fills the grid.`,
eq: String.raw`\[ c\,\Delta t \le \frac{1}{\sqrt{\dfrac{1}{\Delta x^2} + \dfrac{1}{\Delta y^2} + \dfrac{1}{\Delta z^2}}} \;=\; \begin{cases} \Delta & \text{1D} \\ \Delta/\sqrt2 & \text{2D} \\ \Delta/\sqrt3 & \text{3D} \end{cases} \]`,
sym: [[String.raw`\(S_\text{2D} = c\Delta t/\Delta\)`, String.raw`Courant number in 2D, limit \(1/\sqrt2 = 0.707\)`]],
how: [String.raw`Repeat the von Neumann analysis with a plane wave \(e^{i(k_x x + k_y y)}\).`, String.raw`The condition becomes \(S^2(\sin^2\tfrac{k_x\Delta}{2} + \sin^2\tfrac{k_y\Delta}{2}) \le 1\).`, String.raw`The worst case is the diagonal zigzag, both sines equal to 1, so \(S \le 1/\sqrt2\).`],
say: "In 3D with cubic cells the time step must satisfy c Δt ≤ Δ/√3. In general the smallest cell in each direction sets the limit.",
num: String.raw`For an 11.38 nm cubic cell: \(\Delta t \le 21.9\) as. Tidy3D uses 0.99 of the limit.`,
r(fig, ctl) {
  ctl.innerHTML = sl("S", "Courant number S (2D)", 0.5, 0.75, 0.005, 0.7) + `<div class="readout" id="ro"></div>`;
  const nx = 120, ny = 80; let sim, t0;
  const reset = () => { const S = +$("S").value; $("Sv").textContent = S.toFixed(3); sim = new C2.FDTD2D(nx, ny, S, null, 12); t0 = 0; };
  $("S").oninput = reset; reset();
  const { ctx, img } = C2.canvas(fig, nx, ny, 4.5, "Ez in a 2D box, absorbing frame of 12 cells. A pulse starts in the middle.");
  anim(() => {
    if (!fig.isConnected) { stopAnim(); return; }
    let mx = 0;
    for (let k = 0; k < 4; k++) { if (sim.t < 4000) sim.step([60, 40, FD.pulse(sim.t, 30, 8)]); }
    for (let q = 0; q < nx * ny; q++) { let v = sim.ez[q]; if (!isFinite(v)) v = 1e30; mx = Math.max(mx, Math.abs(v)); }
    for (let q = 0; q < nx * ny; q++) { const v = sim.ez[q], c = C2.color(isFinite(v) ? Math.max(-1, Math.min(1, v * 8)) : 1), o = q * 4; img.data[o] = c[0]; img.data[o + 1] = c[1]; img.data[o + 2] = c[2]; img.data[o + 3] = 255; }
    ctx.putImageData(img, 0, 0);
    if (mx > 1e6) for (let q = 0; q < nx * ny; q++) { sim.ez[q] = Math.sign(sim.ez[q]) * 1e6 || 0; sim.hx[q] = 0; sim.hy[q] = 0; }
    $("ro").innerHTML = FD.ro([["time step", sim.t], ["largest |Ez|", mx > 1e5 ? "exploded" : FD.f(mx, 4)], ["limit 1/√2", "0.707"]]);
  });
}},
{s: "4. The smallest cell rules", t: "One time step for the whole grid",
intu: String.raw`FDTD uses one time step everywhere, so the single smallest cell in each direction sets it. A non-uniform grid with large cells in air and small cells in the membrane is efficient in memory, but one tiny cell, for example a mesh override inside a narrow gap, slows down the whole run. Set the smallest cell and see how the time step and the number of steps for 1 ps change. Tidy3D also lowers the Courant factor below its default of 0.99 when dispersive materials need it.`,
eq: String.raw`\[ \Delta t = \frac{C}{c\,\sqrt{\dfrac{1}{\min\Delta x^2} + \dfrac{1}{\min\Delta y^2} + \dfrac{1}{\min\Delta z^2}}} \]`,
sym: [["C", "Courant factor, 0.99 by default in Tidy3D 2.11"], [String.raw`\(\min\Delta x\)`, "the smallest cell along x anywhere in the grid"]],
how: ["Find the smallest cell along each axis.", "Insert them into the 3D limit.", "Multiply by the Courant factor."],
say: "Because the time step is global, the smallest cell anywhere sets it, so a local mesh refinement can cost the whole simulation.",
num: "The run time in femtoseconds stays the same, so halving the smallest cell doubles the number of steps.",
r(fig, ctl) {
  ctl.innerHTML = sl("dm", "Smallest cell (nm), all three axes", 1, 30, 0.5, 11.38) + sl("C", "Courant factor", 0.3, 0.99, 0.01, 0.99) + `<div class="readout" id="ro"></div>`;
  const u = () => {
    const d = +$("dm").value, C = +$("C").value; $("dmv").textContent = d.toFixed(1); $("Cv").textContent = C.toFixed(2);
    const dt = C * d * 1e-9 / (FD.c * Math.sqrt(3)), n = 1e-12 / dt, ref = 1e-12 / (0.99 * 11.38e-9 / (FD.c * Math.sqrt(3)));
    let s = FD.txt(20, 40, "time step") + `<rect x="160" y="26" width="${Math.min(460, dt * 1e18 * 8)}" height="20" fill="var(--teal)"/>` + FD.txt(166 + Math.min(460, dt * 1e18 * 8), 41, FD.f(dt * 1e18, 2) + " as");
    s += FD.txt(20, 84, "steps for 1 ps") + `<rect x="160" y="70" width="${Math.min(460, n / ref * 120)}" height="20" fill="var(--coral)"/>` + FD.txt(166 + Math.min(460, n / ref * 120), 85, FD.int(n));
    fig.innerHTML = svg(110, s);
    $("ro").innerHTML = FD.ro([["Δt", FD.f(dt * 1e15, 4) + " fs"], ["cost vs 11.38 nm at 0.99", FD.f(n / ref, 2) + " × the steps"]]);
  };
  $("dm").oninput = u; $("C").oninput = u; u();
}},
FD.ckpt({ step: 4, t: "The PBS time step and step count",
  intu: String.raw`For the PBS-like example box of Lesson 1.4, Tidy3D gives a time step of 0.0210 fs at 20 cells per wavelength. The cells are 11.38 nm along \(x\) and \(y\) but a bit smaller along \(z\), because the grid snaps to the 160 nm membrane faces, so the step is set by the \(z\) cells. One picosecond of light is then about 47,500 steps. The default Courant factor 0.99 was kept. Run time and the shutoff fraction (Lesson 4.1) decide how many of those steps are actually taken.`,
  code: ["sim = td.Simulation(..., run_time=1e-12)   # courant=0.99 is the default", "print(sim.courant)          # 0.99", "print(sim.dt)               # 2.104e-17 s", "print(sim.num_time_steps)   # 47,529 for 1 ps", "# a 2 nm MeshOverrideStructure anywhere would make every step about 5 times shorter"],
  hi: [2, 3],
  on: ["design", "ports"], cap: "one time step for every cell, set by the smallest cell",
  eq: String.raw`\[ \Delta t = \frac{0.99}{c\sqrt{\frac{1}{\Delta x^2} + \frac{1}{\Delta y^2} + \frac{1}{\Delta z^2}}} \approx 0.021\ \text{fs} \]`,
  sym: [[String.raw`\(\Delta x = \Delta y = 11.38\) nm`, "in the membrane at 20 cells per wavelength"], [String.raw`\(\Delta z \approx 10.7\) nm`, "snapped so whole cells fit the 160 nm thickness"]],
  how: ["Tidy3D builds the grid.", "It finds the smallest cell along each axis.", "It applies the 3D limit times 0.99."],
  say: "At 20 cells per membrane wavelength the PBS time step is about 0.021 fs, so a picosecond of light takes about 47,500 leapfrog steps.",
  num: "Values computed with tidy3d 2.11.2 for the example box, before any run."
})
],
summary: String.raw`Each explicit update reads only its neighbours, so information moves one cell per step. The CFL condition requires light to move no faster: \(S = c\Delta t/\Delta x \le 1\) in 1D, \(1/\sqrt2\) in 2D and \(1/\sqrt3\) in 3D for equal cells. Above the limit the amplification factor of the shortest grid waves exceeds one and the field grows exponentially. The single smallest cell sets the global time step, and Tidy3D uses 0.99 of the limit by default.`,
sheet: [
[String.raw`\[ c\Delta t \le \Big(\tfrac{1}{\Delta x^2} + \tfrac{1}{\Delta y^2} + \tfrac{1}{\Delta z^2}\Big)^{-1/2} \]`, "CFL limit in 3D"],
[String.raw`\[ g^2 - 2\big(1 - 2S^2\sin^2\tfrac{k\Delta x}{2}\big)g + 1 = 0 \]`, "Amplification factor of the 1D Yee scheme"],
[String.raw`\[ \Delta t_\text{Tidy3D} = 0.99 \times \text{limit} \]`, "Default Courant factor"]],
teach: [
  "Draw a column of dots going back in time from one point and shade the triangle of neighbours.",
  "Draw the light cone. Say: the triangle must contain the cone, otherwise the scheme cannot know the answer.",
  "Write S = c Δt/Δx ≤ 1, then the 2D and 3D versions with √2 and √3.",
  "Say what happens above the limit: the zigzag grows by a factor bigger than one every step.",
  "End with the practical rule: the smallest cell in the whole grid sets the time step for everybody."
],
qa: [
  ["What happens physically when the Courant limit is broken?", "Nothing physical. The numerical scheme has modes whose amplification factor exceeds one, starting with the shortest wavelength the grid can hold. Round-off seeds them and they grow exponentially until the numbers overflow."],
  ["Why not use an implicit scheme with no time-step limit?", "Implicit schemes need a large linear solve every step, which destroys the main advantage of FDTD. Also, accuracy already needs a time step of roughly the same size, so the gain would be small for optical problems."],
  ["Can a simulation diverge below the Courant limit?", "Yes. Dispersive material fits with poles that are not stable, PML touching a structure, or gain media can all make a run diverge. Tidy3D lowers the Courant factor for some dispersive materials and has a guide on troubleshooting diverged runs (Part B)."],
  ["Does the Courant number affect accuracy as well?", "Yes, through numerical dispersion (Lesson 2.2). In 1D the error vanishes exactly at S = 1, the magic time step. In 3D there is no such value for every direction at once."]
],
mistakes: [
  "Using the 1D limit in 3D. With cubic cells it is Δ/√3, not Δ.",
  "Refining the mesh locally without noticing that the whole run now needs more steps.",
  "Thinking a smaller Courant factor is always more accurate. It costs more steps and can slightly increase numerical dispersion error.",
  "Blaming the physics when a run explodes as a checkerboard. That pattern is the signature of a numerical instability."
],
videos: [FD.vid("f7", "The whole lecture: the CFL condition derived and shown."), FD.vid("r5304", "Lecture on stability and the Courant condition in 1D FDTD."), ["Interactive EM wave simulator (browser, exposes the 1/√2 limit)", "https://www.mysimulator.uk/electromagnetism/em-waves/", ""]],
sources: [FD.R.taflove + ", Ch. 4 (numerical dispersion and stability)", FD.R.schneider + ", Ch. 3 and Ch. 7", FD.R.td + ": Simulation.courant (default 0.99), Simulation.dt"]
});

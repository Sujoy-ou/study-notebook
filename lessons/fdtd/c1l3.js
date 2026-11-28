/* Lesson 1.3: The 1D Yee leapfrog, derived line by line. */
addLesson("fdtd", "a1", {
level: "Core", num: "Lesson 1.3",
id: "fdtd-1-3", title: "The 1D Yee leapfrog, derived line by line", short: "1.3 The 1D leapfrog",
big: String.raw`Put \(E_z\) on whole grid nodes and \(H_y\) halfway between them, and also half a time step apart. Then each curl equation of Lesson 1.1 becomes a centred difference in space and in time, and it can be solved for the newest value: the new \(H\) from its old value and the two \(E\) beside it, then the new \(E\) from its old value and the two \(H\) beside it. That is the leapfrog. It is explicit (no matrix to invert), second order in space and time, and costs a handful of operations per cell per step. Everything in FDTD, in 2D and 3D, is this idea repeated for more components.`,
bridge: String.raw`Yee (1966), Taflove and Hagness Ch. 3, Schneider Ch. 3. Lesson 1.4 extends it to 2D and 3D, Lesson 2.1 explains the time-step limit.`,
cards: [
{s: "1. Space and time", t: "Where E and H live, in space and in time",
intu: String.raw`This is a space-time chart: position across, time upward. Blue dots are \(E_z\) at whole nodes \(i\) and whole time steps \(n\). Coral squares are \(H_y\) at half nodes \(i + \tfrac12\) and half steps \(n + \tfrac12\). Step through one update. A new \(H\) uses the old \(H\) below it and the two \(E\) to its left and right half a step earlier. A new \(E\) uses the old \(E\) below it and the two \(H\) beside it. Every difference is centred on the value being computed, in both space and time.`,
eq: String.raw`\[ E_z\big|_i^n = E_z(i\Delta x,\ n\Delta t), \qquad H_y\big|_{i+\frac12}^{n+\frac12} = H_y\big((i+\tfrac12)\Delta x,\ (n+\tfrac12)\Delta t\big) \]`,
sym: [[String.raw`\(i, n\)`, "space index and time index"], [String.raw`\(\Delta x, \Delta t\)`, "cell size and time step"]],
how: ["E on whole nodes and whole steps.", "H on half nodes and half steps.", "Each update reaches only its nearest neighbours in space and time."],
say: "On the Yee grid E and H are staggered by half a cell in space and half a step in time, so every update is a centred difference.",
num: "Each update reads three numbers and writes one.",
r(fig, ctl) {
  const cap = ["Known at the start: E at step n (bottom row) and H at step n − ½.", "Update H at n + ½: old H below it plus the difference of the two E beside it.", "All H values are updated the same way, everywhere.", "Update E at n + 1: old E below it plus the difference of the two H beside it.", "Now E is at n + 1 and H at n + ½. The next step repeats the pattern."];
  LC.steps(ctl, 5, k => {
    const X = i => 90 + i * 100, Yt = t => 173 - t * 123; let s = "";
    for (const [t, lab] of [[-0.5, "n − ½"], [0, "n"], [0.5, "n + ½"], [1, "n + 1"]]) s += `<line x1="60" x2="640" y1="${Yt(t)}" y2="${Yt(t)}" stroke="var(--b)" stroke-dasharray="3 4"/>` + FD.txt(14, Yt(t) + 4, lab);
    for (let i = 0; i <= 5; i++) s += FD.txt(X(i), 256, i === 2 ? "i" : i < 2 ? "i − " + (2 - i) : "i + " + (i - 2), "ts", "middle");
    for (let i = 0; i <= 5; i++) {
      s += `<circle cx="${X(i)}" cy="${Yt(0)}" r="9" fill="var(--blue-bg)" stroke="var(--blue)"/>`;
      if (k >= 4 || (k === 3 && i === 2)) s += `<circle cx="${X(i)}" cy="${Yt(1)}" r="9" fill="${k === 3 ? "var(--blue)" : "var(--blue-bg)"}" stroke="var(--blue)"/>`;
    }
    for (let i = 0; i < 5; i++) {
      s += `<rect x="${X(i + 0.5) - 9}" y="${Yt(-0.5) - 9}" width="18" height="18" fill="var(--coral-bg)" stroke="var(--coral)"/>`;
      if (k >= 2 || (k === 1 && i === 2)) s += `<rect x="${X(i + 0.5) - 9}" y="${Yt(0.5) - 9}" width="18" height="18" fill="${k === 1 ? "var(--coral)" : "var(--coral-bg)"}" stroke="var(--coral)"/>`;
    }
    if (k === 1) s += arrow(X(2) + 4, Yt(0) - 10, X(2.5) - 10, Yt(0.5) + 10, "var(--coral)", 1.8) + arrow(X(3) - 4, Yt(0) - 10, X(2.5) + 10, Yt(0.5) + 10, "var(--coral)", 1.8) + arrow(X(2.5), Yt(-0.5) - 11, X(2.5), Yt(0.5) + 12, "var(--coral)", 1.4, "4 3");
    if (k === 3) s += arrow(X(1.5) + 4, Yt(0.5) - 10, X(2) - 10, Yt(1) + 10, "var(--blue)", 1.8) + arrow(X(2.5) - 4, Yt(0.5) - 10, X(2) + 10, Yt(1) + 10, "var(--blue)", 1.8) + arrow(X(2), Yt(0) - 11, X(2), Yt(1) + 12, "var(--blue)", 1.4, "4 3");
    fig.innerHTML = svg(262, s);
    return cap[k];
  });
}},
{s: "2. Derive the updates", t: "From the curl equations to two lines of code",
intu: String.raw`Step through the derivation. In 1D with only \(E_z\) and \(H_y\), Lesson 1.1 leaves two equations. Replace each derivative by a centred difference at the point where the unknown sits, then solve for the newest value. The last step rescales \(H\) by the vacuum impedance so that both fields have the same size. Then a single number, the Courant number \(S = c\Delta t/\Delta x\), and the local \(\varepsilon_r\) are all the update needs.`,
eq: String.raw`\[ \tilde H_y\big|_{i+\frac12}^{n+\frac12} = \tilde H_y\big|_{i+\frac12}^{n-\frac12} + S\Big(E_z\big|_{i+1}^{n} - E_z\big|_{i}^{n}\Big) \]\[ E_z\big|_{i}^{n+1} = E_z\big|_{i}^{n} + \frac{S}{\varepsilon_{r,i}}\Big(\tilde H_y\big|_{i+\frac12}^{n+\frac12} - \tilde H_y\big|_{i-\frac12}^{n+\frac12}\Big) \]`,
sym: [[String.raw`\(\tilde H_y = \eta_0 H_y\)`, String.raw`H scaled by \(\eta_0 = \sqrt{\mu_0/\varepsilon_0}\), same units as E`], [String.raw`\(S = c\Delta t/\Delta x\)`, "Courant number, at most 1 in 1D (Lesson 2.1)"], [String.raw`\(\varepsilon_{r,i}\)`, "relative permittivity at node i"]],
how: [String.raw`Start: \(\mu_0\,\partial H_y/\partial t = \partial E_z/\partial x\) and \(\varepsilon_0\varepsilon_r\,\partial E_z/\partial t = \partial H_y/\partial x\).`, String.raw`Centre the first at \((i+\tfrac12, n)\) and the second at \((i, n+\tfrac12)\).`, "Write each derivative as a difference over one half-step on each side.", "Solve for the value at the newest time.", String.raw`Multiply the H equation by \(\eta_0\): \(\Delta t/(\mu_0\Delta x)\cdot\eta_0 = c\Delta t/\Delta x = S\).`],
say: String.raw`The 1D Yee update adds to H the Courant number times the difference of the two neighbouring E values, then adds to E the Courant number over the permittivity times the difference of the two neighbouring H values.`,
num: "These two lines are the whole 1D solver used in every demo on this shelf.",
r(fig, ctl) {
  const T = [
    [String.raw`\mu_0\frac{\partial H_y}{\partial t} = \frac{\partial E_z}{\partial x}, \qquad \varepsilon_0\varepsilon_r\frac{\partial E_z}{\partial t} = \frac{\partial H_y}{\partial x}`],
    [String.raw`\mu_0\,\frac{H_y\big|_{i+\frac12}^{n+\frac12} - H_y\big|_{i+\frac12}^{n-\frac12}}{\Delta t} = \frac{E_z\big|_{i+1}^{n} - E_z\big|_{i}^{n}}{\Delta x}`],
    [String.raw`\varepsilon_0\varepsilon_r\,\frac{E_z\big|_{i}^{n+1} - E_z\big|_{i}^{n}}{\Delta t} = \frac{H_y\big|_{i+\frac12}^{n+\frac12} - H_y\big|_{i-\frac12}^{n+\frac12}}{\Delta x}`],
    [String.raw`H_y\big|_{i+\frac12}^{n+\frac12} = H_y\big|_{i+\frac12}^{n-\frac12} + \frac{\Delta t}{\mu_0\Delta x}\Big(E_z\big|_{i+1}^{n} - E_z\big|_{i}^{n}\Big)`, String.raw`E_z\big|_{i}^{n+1} = E_z\big|_{i}^{n} + \frac{\Delta t}{\varepsilon_0\varepsilon_r\Delta x}\Big(H_y\big|_{i+\frac12}^{n+\frac12} - H_y\big|_{i-\frac12}^{n+\frac12}\Big)`],
    [String.raw`\tilde H_y = \eta_0 H_y: \quad \frac{\Delta t\,\eta_0}{\mu_0\Delta x} = \frac{c\,\Delta t}{\Delta x} = S, \qquad \frac{\Delta t}{\varepsilon_0\Delta x\,\eta_0} = S`]
  ];
  const cap = ["The two 1D curl equations for the pair (Ez, Hy).", "Faraday, centred at (i + ½, n): time difference of H across n, space difference of E across i + ½.", "Ampère, centred at (i, n + ½): time difference of E across n + ½, space difference of H across i.", "Solve each for the newest value. These are the update equations.", "Scale H by η0 and both coefficients become the Courant number S (divided by εr for E)."];
  LC.steps(ctl, 5, k => { LC.mathFig(fig, T[k]); return cap[k]; });
}},
{s: "3. Real numbers", t: "Coefficients for a high-index membrane at 795 nm",
intu: String.raw`Choose the material, the points per wavelength and the Courant number, and read the real cell size, time step and update coefficient. In a material of index \(n = 3.49\) at 795 nm the wavelength is about 228 nm, so 20 cells per wavelength gives a cell of about 11.4 nm. In 1D the time step is \(S\Delta x/c\), a few hundredths of a femtosecond. An optical period then takes more than a hundred time steps, which is why even a short simulation needs tens of thousands of steps.`,
eq: String.raw`\[ \Delta x = \frac{\lambda_0}{N n}, \qquad \Delta t = \frac{S\,\Delta x}{c}, \qquad \text{steps per period} = \frac{T_0}{\Delta t} = \frac{N n}{S} \]`,
sym: [["N", "cells per wavelength in the material"], [String.raw`\(T_0 = \lambda_0/c\)`, "optical period"], ["S", "Courant number"]],
how: ["Wavelength in the material: λ0/n.", "Cell: that divided by N.", "Time step: S times the cell over c.", "Steps per period: the period over the time step, which simplifies to Nn/S."],
say: String.raw`At 795 nm in a medium of index 3.49 with 20 cells per wavelength the cell is 11.4 nm, and a 1D time step at S = 1 is 0.038 fs, about 70 steps per optical period.`,
num: String.raw`\(T_0 = 795\ \text{nm}/c = 2.65\) fs. In 3D the time step is smaller by \(\sqrt3\) (Lesson 2.1).`,
r(fig, ctl) {
  ctl.innerHTML = sl("n", "Index n", 1, 4, 0.01, 3.49) + sl("N", "Cells per wavelength N", 6, 40, 1, 20) + sl("S", "Courant number S", 0.1, 1, 0.01, 0.99) + `<div class="readout" id="ro"></div>`;
  const u = () => {
    const n = +$("n").value, N = +$("N").value, S = +$("S").value; $("nv").textContent = n.toFixed(2); $("Nv").textContent = N; $("Sv").textContent = S.toFixed(2);
    const dx = 795 / (N * n), dt = S * dx * 1e-9 / FD.c * 1e15, per = 2.652 / dt;
    let s = "", W = 520, sc = W / 45;
    s += FD.txt(20, 40, "cell Δx") + `<rect x="140" y="26" width="${dx * sc}" height="20" fill="var(--blue)"/>` + FD.txt(146 + dx * sc, 41, FD.f(dx, 2) + " nm");
    s += FD.txt(20, 80, "wavelength") + `<rect x="140" y="66" width="${Math.min(795 / n * sc / 6, 500)}" height="20" fill="var(--blue-bg)" stroke="var(--blue)"/>` + FD.txt(146 + Math.min(795 / n * sc / 6, 500), 81, FD.f(795 / n, 0) + " nm (drawn 1/6 scale)");
    s += FD.txt(20, 120, "coefficient") + FD.txt(140, 120, `H: S = ${S.toFixed(2)}     E: S / εr = ${FD.f(S / (n * n), 4)}`);
    fig.innerHTML = svg(140, s);
    $("ro").innerHTML = FD.ro([["Δx", FD.f(dx, 2) + " nm"], ["Δt (1D)", FD.f(dt, 4) + " fs"], ["steps per optical period", FD.f(per, 1)], ["steps for 1 ps", FD.int(1000 / dt)]]);
  };
  ["n", "N", "S"].forEach(i => $(i).oninput = u); u();
}},
{s: "4. Run it", t: "A live 1D FDTD with every knob",
intu: String.raw`This is the leapfrog of card 2, running. A Gaussian pulse starts at the source and meets a dielectric slab. Drag the slab and change its index: part of the pulse reflects at each face. Switch on "show nodes" to see E on the whole nodes and H on the half nodes. Now compare the sources. A soft source adds the pulse to whatever field is there, so the reflected pulse passes straight through it. A hard source forces the field value at that node, so it acts like a wall and the reflection bounces back. Push the Courant number above 1 and the run blows up within a few hundred steps.`,
eq: String.raw`\[ \text{soft: } E_z\big|_{s}^{n} \mathrel{+}= g(n) \qquad \text{hard: } E_z\big|_{s}^{n} = g(n) \]`,
sym: [[String.raw`\(g(n)\)`, "source waveform at time step n"], ["s", "source node"]],
how: ["Initialize all fields to zero.", "Each time step: update all H, update all E, add the source.", "Repeat. Absorbing layers at the ends (grey) remove the outgoing pulses."],
say: "A soft source adds the waveform to the field, so waves pass through it. A hard source overwrites the field and reflects anything that comes back.",
num: "500 cells, absorbing layers of 30 cells, pulse width 14 steps.",
r(fig, ctl) {
  ctl.innerHTML = sl("cs", "Courant number S", 0.3, 1.05, 0.01, 0.5) + sl("sp", "Slab position (cell)", 230, 420, 1, 300) + sl("sn", "Slab index", 1, 3.5, 0.1, 2) + `<div class="row"><button data-src="soft">Soft source</button><button data-src="hard">Hard source</button><button id="nd">Show nodes</button></div><div class="readout" id="ro"></div>`;
  let sim, src = "soft", nodes = false;
  const reset = () => {
    const S = +$("cs").value, p = +$("sp").value, n = +$("sn").value; $("csv").textContent = S.toFixed(2); $("spv").textContent = p; $("snv").textContent = n.toFixed(1);
    const eps = new Float64Array(500).fill(1); for (let i = p; i < p + 40; i++) eps[i] = n * n;
    sim = new FD.Yee1(500, S, eps, { bc: "pml", pml: 30 }); pick(ctl, "src", src);
  };
  ["cs", "sp", "sn"].forEach(i => $(i).oninput = reset);
  ctl.querySelectorAll("button[data-src]").forEach(b => b.onclick = () => { src = b.dataset.src; reset(); });
  $("nd").onclick = () => { nodes = !nodes; $("nd").classList.toggle("on", nodes); };
  reset(); const P = FD.player(ctl, reset);
  anim(() => {
    if (!fig.isConnected) { stopAnim(); return; }
    if (P.run && sim.t < 1400) for (let i = 0; i < 2; i++) { const g = FD.pulse(sim.t * sim.S / 0.5, 50, 14); sim.step(src === "hard" ? { i: 120, v: g, hard: true } : { i: 120, v: g }); }
    let mx = 0; for (let i = 0; i < 500; i++) mx = Math.max(mx, Math.abs(sim.ez[i]));
    const blown = !isFinite(mx) || mx > 50;
    if (blown) for (let i = 0; i < 500; i++) { sim.ez[i] = Math.max(-50, Math.min(50, sim.ez[i] || 0)); sim.hy[i] = Math.max(-50, Math.min(50, sim.hy[i] || 0)); }
    fig.innerHTML = svg(215, FD.draw1(sim, { hy: nodes, nodes: nodes, src: 120, srcLab: src + " source", amp: 1.1 }) + C3.legend(60, 205, nodes ? [["Ez", "var(--blue)"], ["Hy", "var(--coral)"]] : [["Ez", "var(--blue)"]]) + FD.txt(640, 205, `time step ${sim.t}`, "ts", "end"));
    $("ro").innerHTML = FD.ro([["largest |Ez|", blown ? "growing without bound" : FD.f(mx, 3)], ["stable?", sim.S > 1 ? "no, S > 1" : "yes"]]);
  });
}},
FD.ckpt({ step: 4, t: "The forward run of the PBS is this leapfrog in 3D",
  intu: String.raw`The PBS forward run is the same loop with all six field components on a 3D grid. Below is the 2D toy cousin of the PBS running with these updates: a pulse enters the input strip, is split in the design box and leaves through the two arms into the absorbing frame. In Tidy3D nothing of this loop is written by hand. You build the Simulation, the job runs the leapfrog on the server, and a FieldTimeMonitor can record snapshots like these if you ask for them.`,
  fig: () => "", extraCtl: "",
  after(fig, v) {
    if (v !== "pbs") { stopAnim(); return; }
    let P = FD.toyPulse(); const box = document.createElement("div"); fig.appendChild(box);
    const { ctx, img } = C2.canvas(box, P.T.nx, P.T.ny, 3.5, "Ez of the 2D toy splitter (index 2 strips, 160 × 100 cells). Restarts by itself.");
    anim(() => { if (!box.isConnected) { stopAnim(); return; } if (P.sim.t > 1000) P = FD.toyPulse(); for (let i = 0; i < 4; i++) P.step(); FD.toyDraw(P, img, ctx); });
  },
  code: ["# nothing to write: the leapfrog runs on the server when the job starts", "snap = td.FieldTimeMonitor(center=(0, 0, 0), size=(td.inf, td.inf, 0), fields=['Ey'],", "                           start=0, interval=200, name='snapshots')   # optional, costs memory", "sim = sim.updated_copy(monitors=list(sim.monitors) + [snap])", "data = web.run(sim, task_name='pbs_forward')        # forward run: H, E, H, E, ...", "data['snapshots'].Ey.isel(t=10).plot()"],
  hi: [4],
  eq: String.raw`\[ \mathbf{H}^{n+\frac12} = \mathbf{H}^{n-\frac12} - \frac{\Delta t}{\mu_0}\nabla_h\times\mathbf{E}^{n}, \qquad \mathbf{E}^{n+1} = \mathbf{E}^{n} + \frac{\Delta t}{\varepsilon_0\varepsilon_r}\Big(\nabla_h\times\mathbf{H}^{n+\frac12} - \mathbf{J}^{n+\frac12}\Big) \]`,
  sym: [[String.raw`\(\nabla_h\times\)`, "the curl written with centred differences on the Yee grid"]],
  how: ["The source adds the pulse on the input plane.", "Every cell is updated each step from its neighbours.", "The design region is only cells with other permittivity values."],
  say: "The forward run of the PBS is the Yee leapfrog in 3D: H from the discrete curl of E, then E from the discrete curl of H plus the source, until the fields have decayed.",
  num: "The toy runs about 1000 steps. A 3D PBS run takes tens of thousands of steps on millions of cells."
})
],
summary: String.raw`E sits on whole nodes and whole time steps, H on half nodes and half steps. Centring each curl equation where its unknown lives and solving for the newest value gives two explicit updates: \(\tilde H \mathrel{+}= S\,\Delta E\) and \(E \mathrel{+}= (S/\varepsilon_r)\,\Delta\tilde H\), with the Courant number \(S = c\Delta t/\Delta x\). A soft source adds the waveform, a hard source overwrites the field and reflects. At 795 nm in a medium of index 3.49 with 20 cells per wavelength the cell is 11.4 nm and an optical period takes more than 70 steps.`,
sheet: [
[String.raw`\[ \tilde H_y\big|_{i+\frac12}^{n+\frac12} = \tilde H_y\big|_{i+\frac12}^{n-\frac12} + S\big(E_z\big|_{i+1}^{n} - E_z\big|_{i}^{n}\big) \]`, "H update"],
[String.raw`\[ E_z\big|_{i}^{n+1} = E_z\big|_{i}^{n} + \frac{S}{\varepsilon_{r,i}}\big(\tilde H_y\big|_{i+\frac12}^{n+\frac12} - \tilde H_y\big|_{i-\frac12}^{n+\frac12}\big) \]`, "E update"],
[String.raw`\[ S = \frac{c\,\Delta t}{\Delta x}, \qquad \tilde H = \eta_0 H \]`, "Courant number and scaled H"],
[String.raw`\[ \Delta x = \frac{\lambda_0}{Nn}, \qquad \frac{T_0}{\Delta t} = \frac{Nn}{S} \]`, "Cell size and steps per period"]],
consts: String.raw`\(c = 2.998\times10^8\) m/s, \(\eta_0 = 376.7\ \Omega\), \(T_0(795\ \text{nm}) = 2.652\) fs.`,
teach: [
  "Draw a line of dots (E) and squares between them (H). Draw a second row above, half a time step later, and a third above that.",
  String.raw`Write \(\mu_0\,\partial_t H = \partial_x E\) and point at where it is centred: between two dots, between two time rows.`,
  "Replace both derivatives by differences and solve for the top value. Do the same for E.",
  String.raw`Scale H by \(\eta_0\) and show that the coefficient is \(S = c\Delta t/\Delta x\).`,
  "Say what a time step is: all H, then all E, then add the source. That loop is the whole solver."
],
qa: [
  ["Why is it called leapfrog?", "Because E and H take turns, each jumping over the other by half a time step. E is never known at the same time as H."],
  ["Why is the method explicit, and why does that matter?", "Each new value depends only on values already known, so no linear system is solved. That makes one step cheap and lets the work be split over thousands of GPU threads, at the price of a time-step limit (Lesson 2.1)."],
  ["What does the source actually do in Tidy3D?", "It is a current density J added in Ampère's law on the source plane, which is a soft source. A mode source uses matched electric and magnetic currents so the mode goes in one direction only (Lesson 4.2)."],
  ["How do you get E and H at the same time for the Poynting vector?", "By interpolating H between two half steps, or, for frequency-domain monitors, by a phase correction of half a time step in the Fourier transform. Tidy3D handles this inside its monitors."]
],
mistakes: [
  "Using a hard source and wondering where the reflected light went. It bounced off the source node.",
  "Forgetting to divide by the local permittivity in the E update.",
  "Updating E with the old H instead of the H just computed. The order matters: H first, then E with the new H.",
  "Taking the vacuum wavelength to set the cell size inside a high-index material."
],
videos: [FD.vid("m1h", "From 0:00 to about 16:10: a 1D solver written live, with the dispersion discussion."), FD.vid("r5304", "Lectures 2a to 2d: 1D FDTD formulation and implementation, step by step.")],
sources: [FD.R.yee, FD.R.taflove + ", Ch. 3", FD.R.schneider + ", Ch. 3 (Introduction to the FDTD method)", "R. C. Rumpf, EMP 5304 Lectures 2a to 2d, 1D FDTD (empossible.net)"]
});

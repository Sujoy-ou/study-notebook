(function () {
/* Part 4 Lesson 1: anatomy of a td.Simulation. Every figure is computed live with PIC (pic-common.js) and the helpers in app.js. */
const PC = "#D85A30", PB = "#378ADD", PT = "#1D9E75", PP = "#7F77DD", PA = "#BA7517";
const tx = (x, y, t, a, cls) => `<text class="${cls || "ts"}" x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""}>${t}</text>`;
const show = (fig, code, h, body) => { fig.innerHTML = PIC.code(code) + svg(h, body); };
const C0 = 2.99792458e14; // um/s, the value of td.C_0

addLesson("pic", "tidy3d", {
level: "Foundations",
id: "pic-tidy3d-l1", title: "Anatomy of a td.Simulation", short: "1. Anatomy of a Simulation",
big: String.raw`A Tidy3D simulation is one Python object, <code>td.Simulation</code>, that holds everything the FDTD solver needs: the size of the box, the grid, how long to run, what happens at the edges, the structures made of materials, the sources that inject light, and the monitors that record it. This lesson takes the object apart one argument at a time. Each card shows the command and a live picture of what it does to the simulation. The physics behind each argument is the Chapter 2 FDTD material, so the cards link the command to the equation. The commands follow Tidy3D 2.12.`,
bridge: String.raw`Tidy3D uses micrometres for length, seconds for time and hertz for frequency, so the speed of light <code>td.C_0</code> is given in micrometres per second. Chapter 2 Lessons 8 to 11 of the thesis shelf derive the update equations, the Yee grid, the stability limit and PML. Here they appear as arguments of one object.`,
cards: [

{s: "1. Units and C_0", t: "Units: micrometres, seconds, hertz, and td.C_0",
intu: String.raw`Tidy3D never asks for a wavelength directly. Sources and monitors are set by frequency in hertz, and lengths are in micrometres. The bridge between them is the speed of light in micrometres per second, <code>td.C_0</code>, about \(3\times10^{14}\). Drag the wavelength slider and read the frequency the code will use. Telecom wavelengths land near 200 THz, and the bandwidth of a pulse is set as a fraction of that.`,
eq: String.raw`\[ f_0 = \frac{c}{\lambda_0}, \qquad c = \texttt{td.C}\_\texttt{0} = 2.998\times10^{14}\ \mathrm{\mu m/s} \]\[ \Delta f = \frac{c}{\lambda^2}\,\Delta\lambda \]`,
sym: [[String.raw`\(\lambda_0\)`, "free-space wavelength, µm"], [String.raw`\(f_0\)`, "centre frequency, Hz"], [String.raw`\(\Delta f, \Delta\lambda\)`, "a frequency width and the wavelength width it corresponds to"]],
how: [String.raw`Frequency times wavelength is the speed of light, so \(f_0 = c/\lambda_0\).`, "With c in µm/s and λ in µm the result is directly in Hz.", String.raw`Differentiate \(f = c/\lambda\) to turn a wavelength span into a frequency span. The minus sign only says that longer wavelength is lower frequency.`],
say: String.raw`Tidy3D works in micrometres, seconds and hertz, and the centre frequency is <code>td.C_0</code> divided by the wavelength in micrometres.`,
num: "1.55 µm is 193.4 THz. 1.31 µm is 228.8 THz. 0.795 µm is 377.1 THz. A 10 nm span at 1.55 µm is 1.25 THz. A 100 GHz WDM channel is 0.8 nm.",
r(fig, ctl) {
  ctl.innerHTML = sl("lam", "Wavelength λ₀ (µm)", 0.4, 2.0, 0.01, 1.55) + sl("dl", "Wavelength span Δλ (nm)", 1, 200, 1, 40);
  const u = () => {
    const lam = +$("lam").value, dl = +$("dl").value; $("lamv").textContent = lam.toFixed(2) + " µm"; $("dlv").textContent = dl + " nm";
    const f0 = C0 / lam, df = C0 / (lam * lam) * dl * 1e-3;
    const code = `import tidy3d as td\n\nlam0 = ${lam.toFixed(2)}            # um\nfreq0 = td.C_0 / lam0    # = ${(f0 / 1e12).toFixed(1)}e12 Hz\nfwidth = td.C_0 / lam0**2 * ${(dl * 1e-3).toFixed(3)}   # ${(df / 1e12).toFixed(2)}e12 Hz`;
    const x0 = 40, w = 600, y = 70;
    let s = tx(340, 22, `f₀ = ${(f0 / 1e12).toFixed(1)} THz, Δf = ${(df / 1e12).toFixed(2)} THz`, "middle", "th");
    // draw a wave with the wavelength scaled: 2 um spans the width
    let d = ""; const per = w * lam / 2; for (let i = 0; i <= 300; i++) { const x = x0 + w * i / 300; const yy = y + 30 * Math.sin(2 * Math.PI * (x - x0) / per); d += (i ? "L" : "M") + x.toFixed(1) + " " + yy.toFixed(1); }
    s += `<path d="${d}" fill="none" stroke="${PB}" stroke-width="2"/>`;
    s += `<line x1="${x0}" y1="${y + 50}" x2="${x0 + per}" y2="${y + 50}" stroke="${PC}" stroke-width="2" marker-start="url(#ar)" marker-end="url(#ar)"/>` + tx(x0 + per / 2, y + 66, `λ₀ = ${lam.toFixed(2)} µm`, "middle") + tx(x0 + w, y + 66, "2 µm shown", "end");
    s += tx(x0, y + 96, `period in time: 1/f₀ = ${(1e15 / f0).toFixed(2)} fs.  Spectrum width ${(df / f0 * 100).toFixed(1)} percent of f₀.`);
    show(fig, code, y + 110, s);
  };
  $("lam").oninput = u; $("dl").oninput = u; u();
}},

{s: "2. Box and symmetry", t: "The simulation box, its centre, and symmetry planes",
intu: String.raw`The box is set by <code>size</code> and <code>center</code> in micrometres. Anything outside it does not exist. A structure that crosses the edge is clipped, which is what you want for a waveguide that should look infinite. If the device and the mode are mirror symmetric about a plane through the centre, <code>symmetry</code> lets the solver compute only half the box. The sign tells it how the fields reflect: +1 for a PMC-like plane and −1 for a PEC-like plane. Pick a symmetry for y and watch the solved region shrink. Get the sign wrong and the wanted mode is thrown away, so check the mode parity first.`,
eq: String.raw`\[ \text{box} = \left[c_x \pm \tfrac{L_x}{2}\right]\times\left[c_y \pm \tfrac{L_y}{2}\right]\times\left[c_z \pm \tfrac{L_z}{2}\right] \]\[ \text{symmetry}\ +1:\ E_{\parallel}(-y) = E_{\parallel}(y), \qquad -1:\ E_{\parallel}(-y) = -E_{\parallel}(y) \]`,
sym: [[String.raw`\(c_x, c_y, c_z\)`, "the centre, default (0, 0, 0)"], [String.raw`\(L_x, L_y, L_z\)`, "the size tuple, µm"], [String.raw`\(E_{\parallel}\)`, "electric field component parallel to the symmetry plane"], ["+1, −1, 0", "PMC-like, PEC-like, or no symmetry along that axis"]],
how: ["Each axis gets one symmetry value, so symmetry is a tuple of three.", "The solver keeps the half box on the positive side and mirrors the fields with the chosen sign.", "For a TE0 mode of a waveguide along x the main component Ey is even about the y = 0 plane. Tidy3D documents the sign as the behaviour of the fields under the mirror, and the mode solver plot shows the parity, so check it there before relying on it.", "Each symmetry plane halves the cells and the time, so two planes give a factor of four."],
say: String.raw`The size and centre define the box, and a symmetry value of plus or minus one on an axis solves only half the box with the fields mirrored in that sign.`,
num: "A 6 × 3 × 2.5 µm box at 20 steps per wavelength in silicon has about 3 million cells. Symmetry in y and z cuts that to about 0.75 million.",
r(fig, ctl) {
  ctl.innerHTML = sl("Lx", "size x (µm)", 2, 12, 0.5, 6) + sl("Ly", "size y (µm)", 1, 6, 0.5, 3) + btns([["0", "symmetry y = 0"], ["1", "y = +1"], ["-1", "y = −1"]], "sy");
  let sy = 0;
  const u = () => {
    const Lx = +$("Lx").value, Ly = +$("Ly").value; $("Lxv").textContent = Lx + " µm"; $("Lyv").textContent = Ly + " µm"; pick(ctl, "sy", sy);
    const code = `sim = td.Simulation(\n    size=(${Lx}, ${Ly}, 2.5),      # um\n    center=(0, 0, 0),\n    symmetry=(0, ${sy}, 0),    # 0 none, +1 or -1 mirror in y\n    ...\n)`;
    const sc = 46, cx = 340, cy = 120, W = Lx * sc, H = Ly * sc;
    let s = `<rect x="${cx - W / 2}" y="${cy - H / 2}" width="${W}" height="${H}" fill="var(--sunk)" stroke="var(--b)" stroke-dasharray="4 3"/>`;
    s += `<rect x="${cx - W / 2}" y="${cy - 0.25 * sc}" width="${W}" height="${0.5 * sc}" fill="${PB}" opacity="0.6"/>` + tx(cx, cy + 4, "waveguide along x, 0.5 µm wide", "middle");
    if (sy !== 0) { s += `<rect x="${cx - W / 2}" y="${cy}" width="${W}" height="${H / 2}" fill="var(--panel)" opacity="0.75"/><line x1="${cx - W / 2 - 10}" y1="${cy}" x2="${cx + W / 2 + 10}" y2="${cy}" stroke="${PC}" stroke-width="2"/>` + tx(cx + W / 2 + 14, cy + 4, `y = 0 plane, ${sy > 0 ? "+1" : "−1"}`) + tx(cx, cy + H / 4 + 4, "not computed, mirrored", "middle"); }
    s += tx(cx, cy - H / 2 - 8, `size x = ${Lx} µm`, "middle") + tx(cx - W / 2 - 8, cy + 4, `${Ly}`, "end");
    s += tx(340, cy + H / 2 + 24, `cells computed: ${sy ? "half" : "all"} of the box. Clipping: the waveguide runs through the edge and is cut there.`, "middle");
    show(fig, code, cy + H / 2 + 40, s);
  };
  ctl.querySelectorAll("button[data-sy]").forEach(b => b.onclick = () => { sy = +b.dataset.sy; u(); });
  $("Lx").oninput = u; $("Ly").oninput = u; u();
}},

{s: "3. GridSpec", t: "GridSpec.auto: how fine the Yee grid is",
intu: String.raw`The solver puts a Yee grid over the box. <code>td.GridSpec.auto</code> chooses the cell size from the wavelength inside each material: a fixed number of steps per wavelength, so cells are small in silicon and larger in air. The default is 10 steps per wavelength, which the docs call a starting value. Use 15 to 20 for a result you will trust. Drag the slider and watch the grid over the waveguide cross-section, and read the cell count, which sets the memory and the time step.`,
eq: String.raw`\[ \Delta l = \frac{\lambda_0}{N\, n_{\mathrm{max}}} \qquad \text{in each material, with } N = \texttt{min}\_\texttt{steps}\_\texttt{per}\_\texttt{wvl} \]\[ \Delta t \le \frac{1}{c\sqrt{1/\Delta x^2 + 1/\Delta y^2 + 1/\Delta z^2}} \]<div class="eqref">Courant limit, Ch. 2 Lesson 10</div>`,
sym: [[String.raw`\(\Delta l\)`, "cell size, µm"], [String.raw`\(N\)`, "steps per wavelength, the argument of GridSpec.auto"], [String.raw`\(n_{\mathrm{max}}\)`, "refractive index of the material in that region"], [String.raw`\(\Delta t\)`, "time step, fixed by the smallest cell"]],
how: ["The wavelength inside a material is λ₀ divided by n, so silicon at n = 3.48 needs cells 3.5 times smaller than air.", "The auto grid is nonuniform: it refines where the index is high and near structure edges.", "The time step follows the smallest cell through the Courant condition, so a fine grid also means more time steps.", "GridSpec.uniform(dl=0.02) forces one cell size everywhere, useful for tests."],
say: String.raw`GridSpec.auto sets the cell size to the wavelength in each material divided by the chosen steps per wavelength, and the smallest cell fixes the time step.`,
num: "λ₀ = 1.55 µm, N = 20: cells of 22 nm in silicon and 54 nm in oxide. A 6 × 3 × 2.5 µm box then holds about 3 million cells. Doubling N multiplies cells by 8 and time steps by 2, so 16 times the work.",
r(fig, ctl) {
  ctl.innerHTML = sl("N", "min_steps_per_wvl", 6, 30, 1, 10);
  const u = () => {
    const N = +$("N").value; $("Nv").textContent = N + (N === 10 ? " (default)" : N >= 15 ? " (production)" : " (coarse)");
    const lam = 1.55, dlSi = lam / (N * 3.48), dlOx = lam / (N * 1.44);
    const cells = (6 / dlOx) * (3 / dlOx) * (2.5 / dlOx) * 0.8 + (6 / dlSi) * (0.5 / dlSi) * (0.22 / dlSi);
    const code = `sim = td.Simulation(\n    ...,\n    grid_spec=td.GridSpec.auto(min_steps_per_wvl=${N}, wavelength=1.55),\n)\n# cells in Si: ${(dlSi * 1000).toFixed(0)} nm, in SiO2: ${(dlOx * 1000).toFixed(0)} nm`;
    // cross-section: 2 um wide, 1.2 um tall, scale 250 px per um
    const sc = 230, x0 = 110, y0 = 30, W = 2 * sc, H = 1.2 * sc;
    let s = `<rect x="${x0}" y="${y0}" width="${W}" height="${H}" fill="var(--sunk)" stroke="var(--b)"/>`;
    const wx = x0 + W / 2 - 0.25 * sc, wy = y0 + H / 2 - 0.11 * sc;
    s += `<rect x="${wx}" y="${wy}" width="${0.5 * sc}" height="${0.22 * sc}" fill="${PB}" opacity="0.5"/>`;
    const step = (dl, xa, xb, ya, yb) => { let g = ""; for (let x = xa; x <= xb + 0.01; x += dl * sc) g += `<line x1="${x.toFixed(1)}" y1="${ya}" x2="${x.toFixed(1)}" y2="${yb}" stroke="var(--p)" stroke-width="0.5"/>`; for (let y = ya; y <= yb + 0.01; y += dl * sc) g += `<line x1="${xa}" y1="${y.toFixed(1)}" x2="${xb}" y2="${y.toFixed(1)}" stroke="var(--p)" stroke-width="0.5"/>`; return g; };
    s += step(Math.max(dlOx, 0.03), x0, x0 + W, y0, y0 + H) + step(Math.max(dlSi, 0.012), wx, wx + 0.5 * sc, wy, wy + 0.22 * sc);
    s += tx(x0 + W / 2, y0 + H + 18, `silicon cells ${(dlSi * 1000).toFixed(0)} nm, oxide cells ${(dlOx * 1000).toFixed(0)} nm, about ${(cells / 1e6).toFixed(2)} million cells in a 6 × 3 × 2.5 µm box`, "middle");
    show(fig, code, y0 + H + 34, s);
  };
  $("N").oninput = u; u();
}},

{s: "4. run_time and pulse", t: "run_time and the GaussianPulse: how long and how wide",
intu: String.raw`Every source carries a <code>td.GaussianPulse</code> with a centre frequency and a width. A short pulse in time is a wide band in frequency, so one run gives the response at many wavelengths. The simulation must run long enough for the pulse to enter, cross the device and leave, so <code>run_time</code> is required. A common start is 20 over the pulse width plus the travel time. Drag the width and watch the pulse and its spectrum trade places. Press Play to see the pulse pass.`,
eq: String.raw`\[ s(t) = e^{-(t-t_0)^2/(2\tau^2)}\cos(2\pi f_0 t), \qquad \tau = \frac{1}{2\pi\, \texttt{fwidth}} \]\[ |S(f)| \propto e^{-(f-f_0)^2/(2\,\texttt{fwidth}^2)}, \qquad \texttt{run}\_\texttt{time} \gtrsim \frac{20}{\texttt{fwidth}} + \frac{L\, n_g}{c} \]`,
sym: [[String.raw`\(f_0\)`, "freq0, the centre frequency"], [String.raw`\(\texttt{fwidth}\)`, "the standard deviation of the spectrum, Hz"], [String.raw`\(\tau\)`, "the pulse duration in time"], [String.raw`\(L, n_g\)`, "device length and group index, for the travel time"]],
how: ["A Gaussian in time has a Gaussian spectrum, and the two widths multiply to a constant.", "Tidy3D also stops early when the field energy drops below shutoff, default 1e-5 of its peak, so a long <code>run_time</code> costs little on a lossy device.", "A high-Q resonator holds energy for a long time, so shutoff is never reached and <code>run_time</code> must be set by the decay time, Q over f₀ times a few.", "Monitors only trust frequencies inside about two fwidths of the centre."],
say: String.raw`The Gaussian pulse sets the centre and bandwidth of the run, and <code>run_time</code> must cover the pulse, the travel across the device and any ringing.`,
num: "freq0 = 193 THz, fwidth = freq0/10 = 19 THz: the pulse lasts about 8 fs and covers 1.40 to 1.72 µm. <code>run_time</code> = 20/fwidth is 1 ps. A silicon device 100 µm long adds 100 × 4.2 / c = 1.4 ps.",
r(fig, ctl) {
  ctl.innerHTML = sl("fw", "fwidth / freq0", 0.02, 0.3, 0.01, 0.1) + sl("L", "device length (µm)", 0, 200, 5, 50);
  const draw = (tsec) => {
    const fw = +$("fw").value, L = +$("L").value; $("fwv").textContent = fw.toFixed(2); $("Lv").textContent = L + " µm";
    const f0 = 193.4e12, fwidth = fw * f0, tau = 1 / (2 * Math.PI * fwidth), rt = 20 / fwidth + L * 4.2 / C0;
    const code = `src_time = td.GaussianPulse(freq0=freq0, fwidth=${fw.toFixed(2)} * freq0)\nsim = td.Simulation(..., run_time=${(rt * 1e12).toFixed(2)}e-12)   # s, required\n# shutoff=1e-5 stops early once the fields have decayed`;
    const x0 = 50, w = 270, y0 = 40, h = 120, x1 = 400;
    let s = tx(x0 + w / 2, 22, "pulse in time", "middle", "th") + tx(x1 + w / 2, 22, "its spectrum", "middle", "th");
    s += `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="var(--sunk)"/><rect x="${x1}" y="${y0}" width="${w}" height="${h}" fill="var(--sunk)"/>`;
    const T = Math.max(60e-15, 9 * tau); const t0 = 4 * tau; let d = "", e = "";
    const shift = (tsec * 0.6 % 1.4 - 0.2) * T; // moving window
    for (let i = 0; i <= 200; i++) { const t = T * i / 200; const env = Math.exp(-Math.pow(t - t0 - shift, 2) / (2 * tau * tau)); const v = env * Math.cos(2 * Math.PI * f0 * t); const x = x0 + w * i / 200; d += (i ? "L" : "M") + x.toFixed(1) + " " + (y0 + h / 2 - v * h / 2 * 0.9).toFixed(1); e += (i ? "L" : "M") + x.toFixed(1) + " " + (y0 + h / 2 - env * h / 2 * 0.9).toFixed(1); }
    s += `<path d="${e}" fill="none" stroke="${PC}" stroke-dasharray="3 3"/><path d="${d}" fill="none" stroke="${PB}" stroke-width="1.5"/>` + tx(x0 + w / 2, y0 + h + 16, `τ = ${(tau * 1e15).toFixed(1)} fs, window ${(T * 1e15).toFixed(0)} fs`, "middle");
    let p = ""; for (let i = 0; i <= 200; i++) { const f = f0 * (0.5 + i / 200); const v = Math.exp(-Math.pow(f - f0, 2) / (2 * fwidth * fwidth)); p += (i ? "L" : "M") + (x1 + w * i / 200).toFixed(1) + " " + (y0 + h - v * h * 0.9).toFixed(1); }
    s += `<path d="${p}" fill="${PB}" fill-opacity="0.25" stroke="${PB}" stroke-width="1.5"/>` + tx(x1 + w / 2, y0 + h + 16, `0.5 f₀ to 1.5 f₀, width ${(fwidth / 1e12).toFixed(1)} THz, λ ${(1e6 * C0 / (f0 + fwidth) * 1e-6).toFixed(2)} to ${(C0 / (f0 - fwidth)).toFixed(2)} µm`, "middle");
    s += tx(340, y0 + h + 40, `run_time = 20/fwidth + L n_g/c = ${(20 / fwidth * 1e12).toFixed(2)} + ${(L * 4.2 / C0 * 1e12).toFixed(2)} = ${(rt * 1e12).toFixed(2)} ps`, "middle", "t");
    show(fig, code, y0 + h + 56, s);
  };
  $("fw").oninput = () => draw(0); $("L").oninput = () => draw(0);
  PIC.player(ctl, draw);
}},

{s: "5. Boundaries and PML", t: "BoundarySpec and PML: making the box edge disappear",
intu: String.raw`A wave that reaches the edge of the box must not bounce back. <code>td.PML()</code> lines the edge with absorbing layers whose loss grows smoothly inward, so the wave enters without reflection and dies inside. <code>td.BoundarySpec.all_sides(boundary=td.PML())</code> puts it on all six faces. Periodic and Bloch boundaries repeat the box instead, for gratings and photonic crystals. Drag the number of layers and press Play to watch a wave run into the PML and fade. Too few layers lets a little leak back.`,
eq: String.raw`\[ \sigma(x) = \sigma_{\mathrm{max}}\left(\frac{x}{d}\right)^{m}, \qquad R \approx \exp\!\left(-\frac{2\sigma_{\mathrm{max}} d}{(m+1)\,\varepsilon_0 c}\right) \]<div class="eqref">graded conductivity profile, Ch. 2 Lesson 11</div>`,
sym: [[String.raw`\(\sigma(x)\)`, "the artificial conductivity, rising into the layer"], [String.raw`\(d\)`, "PML thickness, <code>num_layers</code> times the cell size"], [String.raw`\(m\)`, "grading order, usually 3 to 4"], [String.raw`\(R\)`, "the reflection coefficient at normal incidence"]],
how: ["A sudden loss would reflect, so the loss is graded from zero at the inner face.", "The impedance is matched layer by layer, which makes the entry reflectionless for any angle in the continuous limit.", "On a grid the match is approximate, so more layers and a smooth grading help. The default is 12 layers.", "A structure must run all the way through the PML, or the PML sees a termination and reflects. Waveguides should extend to the box edge."],
say: String.raw`PML is a graded absorbing layer at each face that lets waves enter without reflection and decay before they return, and every structure should extend through it.`,
num: "Default <code>num_layers</code> 12. With 20 nm cells in oxide that is a 0.24 µm thick absorber on each side. Add it to the size budget: a 6 µm box loses about 0.5 µm to PML in x.",
r(fig, ctl) {
  ctl.innerHTML = sl("nl", "PML num_layers", 2, 24, 1, 12) + btns([["pml", "PML"], ["per", "Periodic"]], "bc");
  let bc = "pml";
  const draw = (tsec) => {
    const nl = +$("nl").value; $("nlv").textContent = nl; pick(ctl, "bc", bc);
    const code = bc === "pml" ? `sim = td.Simulation(\n    ...,\n    boundary_spec=td.BoundarySpec.all_sides(\n        boundary=td.PML(num_layers=${nl})),\n)` : `sim = td.Simulation(\n    ...,\n    boundary_spec=td.BoundarySpec(\n        x=td.Boundary.periodic(), y=td.Boundary.pml(), z=td.Boundary.pml()),\n)`;
    const x0 = 40, w = 600, y0 = 40, h = 120; const pw = bc === "pml" ? nl * 6 : 0;
    let s = `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="var(--sunk)" stroke="var(--b)"/>`;
    if (pw) s += `<rect x="${x0 + w - pw}" y="${y0}" width="${pw}" height="${h}" fill="${PC}" opacity="0.25"/>` + tx(x0 + w - pw / 2, y0 - 6, `PML, ${nl} layers`, "middle");
    const xe = x0 + w - pw, leak = bc === "pml" ? Math.exp(-nl / 4) : 1;
    let d = ""; for (let i = 0; i <= 300; i++) { const x = x0 + w * i / 300; const ph = 2 * Math.PI * ((x - x0) / 40 - tsec * 2); let a = 1; if (x > xe) a = Math.exp(-Math.pow((x - xe) / Math.max(pw, 1), 2) * 6); const back = bc === "pml" ? leak * Math.cos(2 * Math.PI * ((x - x0) / 40 + tsec * 2)) : 0; const v = a * Math.cos(ph) + back; d += (i ? "L" : "M") + x.toFixed(1) + " " + (y0 + h / 2 - 40 * v).toFixed(1); }
    s += `<path d="${d}" fill="none" stroke="${PB}" stroke-width="2"/>`;
    s += tx(x0, y0 + h + 18, bc === "pml" ? `reflection back into the box: about ${(leak * 100).toFixed(1)} percent of the amplitude (illustrative scaling)` : "periodic: what leaves on the right re-enters on the left, for gratings and crystals");
    show(fig, code, y0 + h + 34, s);
  };
  ctl.querySelectorAll("button[data-bc]").forEach(b => b.onclick = () => { bc = b.dataset.bc; draw(0); });
  $("nl").oninput = () => draw(0);
  PIC.player(ctl, draw);
}},

{s: "6. Assemble", t: "Structures, sources, monitors: assembling the object",
intu: String.raw`The three lists are the content of the simulation. <code>structures</code> is a list of <code>td.Structure</code>, each a geometry plus a medium, painted in order so a later structure overwrites an earlier one. <code>sources</code> inject light. <code>monitors</code> record it. The background is <code>medium</code>. Press Next step to add each part and watch the picture fill up, with the code growing beside it.`,
eq: String.raw`\[ \varepsilon(\mathbf r) = \varepsilon_{\mathrm{bg}} \ \text{overwritten in list order by each structure} \]\[ \text{Simulation} = \{\text{box},\ \text{grid},\ \text{boundaries},\ \varepsilon(\mathbf r),\ \text{sources},\ \text{monitors},\ T_{\mathrm{run}}\} \]`,
sym: [[String.raw`\(\varepsilon_{\mathrm{bg}}\)`, "the background medium, often SiO2 for a buried waveguide"], ["Structure", "geometry plus medium"], ["list order", "later structures win where they overlap"]],
how: ["Choose the background medium first. Everything not covered by a structure is that medium.", "Add structures from substrate up. A silicon strip over an oxide box, then a cladding if it differs from the background.", "Place the source a little inside the box, outside the PML, and monitors downstream of the device.", "Build the Simulation object. Tidy3D validates it at once and warns about structures that stop inside the PML or sources that touch an edge."],
say: String.raw`A Simulation is assembled from a background medium, a list of structures painted in order, sources, monitors, and the box, grid, boundary and run time settings.`,
num: "A typical straight-waveguide test has 1 structure, 1 ModeSource, 1 ModeMonitor and 1 FieldMonitor, and runs in under a minute on the cloud.",
r(fig, ctl) {
  const steps = ["background medium", "silicon strip", "mode source", "mode monitor", "field monitor", "Simulation"];
  const lines = [`sio2 = td.material_library["SiO2"]["Palik_LowLoss"]\nsi = td.material_library["cSi"]["Palik_LowLoss"]`, `wg = td.Structure(geometry=td.Box(center=(0, 0, 0), size=(td.inf, 0.5, 0.22)), medium=si)`, `src = td.ModeSource(center=(-2, 0, 0), size=(0, 2, 1.5),\n    source_time=td.GaussianPulse(freq0=freq0, fwidth=freq0/10),\n    direction="+", mode_index=0,\n    mode_spec=td.ModeSpec(num_modes=1))`, `mmon = td.ModeMonitor(center=(2, 0, 0), size=(0, 2, 1.5),\n    freqs=freqs, mode_spec=td.ModeSpec(num_modes=1), name="out")`, `fmon = td.FieldMonitor(center=(0, 0, 0), size=(td.inf, td.inf, 0),\n    freqs=[freq0], name="field")`, `sim = td.Simulation(size=(6, 3, 2.5), medium=sio2, structures=[wg],\n    sources=[src], monitors=[mmon, fmon], run_time=20/fwidth,\n    grid_spec=td.GridSpec.auto(min_steps_per_wvl=20,\n                               wavelength=1.55),\n    boundary_spec=td.BoundarySpec.all_sides(boundary=td.PML()))`];
  PIC.stepper(ctl, steps.length, k => {
    const code = lines.slice(0, k + 1).join("\n");
    const sc = 80, cx = 340, cy = 110, W = 6 * sc, H = 3 * sc * 0.55;
    let s = `<rect x="${cx - W / 2}" y="${cy - H / 2}" width="${W}" height="${H}" fill="${k >= 0 ? "var(--sunk)" : "none"}" stroke="var(--b)" stroke-dasharray="4 3"/>` + tx(cx - W / 2 + 4, cy - H / 2 - 6, k >= 0 ? "background: SiO2" : "");
    if (k >= 1) s += `<rect x="${cx - W / 2}" y="${cy - 0.25 * sc}" width="${W}" height="${0.5 * sc}" fill="${PB}" opacity="0.6"/>` + tx(cx, cy + 4, "Si strip 0.5 × 0.22 µm, runs through the PML", "middle");
    if (k >= 2) s += `<line x1="${cx - 2 * sc}" y1="${cy - sc}" x2="${cx - 2 * sc}" y2="${cy + sc}" stroke="${PC}" stroke-width="3"/>` + tx(cx - 2 * sc, cy - sc - 6, "ModeSource +", "middle") + arrow(cx - 2 * sc + 6, cy - 0.6 * sc, cx - 1.4 * sc, cy - 0.6 * sc, PC, 2);
    if (k >= 3) s += `<line x1="${cx + 2 * sc}" y1="${cy - sc}" x2="${cx + 2 * sc}" y2="${cy + sc}" stroke="${PT}" stroke-width="3"/>` + tx(cx + 2 * sc, cy - sc - 6, "ModeMonitor out", "middle");
    if (k >= 4) s += `<rect x="${cx - W / 2}" y="${cy - H / 2}" width="${W}" height="${H}" fill="${PP}" opacity="0.12"/>` + tx(cx, cy + H / 2 - 8, "FieldMonitor: the whole z = 0 plane", "middle");
    if (k >= 5) s += `<rect x="${cx - W / 2 - 6}" y="${cy - H / 2 - 6}" width="${W + 12}" height="${H + 12}" fill="none" stroke="${PA}" stroke-width="2.5"/>` + tx(cx + W / 2, cy + H / 2 + 20, "validated Simulation, ready for web.run", "end", "th");
    show(fig, code, cy + H / 2 + 34, s);
  }, steps);
}},

{s: "7. Run and results", t: "sim.plot, web.run and what comes back",
intu: String.raw`Before spending credits, <code>sim.plot(z=0)</code> draws the structures, sources and monitors so you can see mistakes. <code>web.run</code> uploads the simulation, runs it on the cloud and downloads a <code>SimulationData</code> object. Monitor results are read by name, and <code>plot_field</code> draws a stored field. Pick what to look at below. The Poynting flux through a monitor plane is the quantity behind every transmission number.`,
eq: String.raw`\[ P = \iint_{A} \langle \mathbf S\rangle\cdot\hat{\mathbf n}\, dA, \qquad \langle \mathbf S\rangle = \tfrac{1}{2}\operatorname{Re}\{\mathbf E\times\mathbf H^{*}\} \]\[ T(f) = \frac{P_{\mathrm{monitor}}(f)}{P_{\mathrm{source}}(f)} \]`,
sym: [[String.raw`\(\langle\mathbf S\rangle\)`, "time-averaged Poynting vector at one frequency"], [String.raw`\(A, \hat{\mathbf n}\)`, "monitor plane and its normal"], [String.raw`\(T(f)\)`, "transmission, normalized to the source power at that frequency"]],
how: ["<code>sim.plot</code> and <code>sim.plot_eps</code> use matplotlib and cost nothing.", "<code>web.run(sim, task_name, path)</code> returns SimulationData and saves an hdf5 file at path. web.Job gives the same with explicit upload, run and load steps.", "<code>sim_data[name]</code> returns the data of the monitor with that name. Flux monitors give flux, field monitors give the field components, mode monitors give amplitudes.", "Results are normalized to the source spectrum by default, so a lossless straight waveguide reads a transmission of 1."],
say: String.raw`Plot the simulation first, run it with web.run, and read each monitor by name from the SimulationData that comes back, already normalized to the source.`,
num: "A straight waveguide test with 3 million cells and 5000 time steps costs a fraction of a FlexCredit and runs in about a minute. Plotting the field of the whole plane is free once the data is downloaded.",
r(fig, ctl) {
  ctl.innerHTML = btns([["plot", "sim.plot"], ["field", "plot_field"], ["flux", "flux vs f"]], "vw");
  let vw = "plot";
  const draw = (tsec) => {
    pick(ctl, "vw", vw);
    const codes = { plot: `sim.plot(z=0)        # structures, sources (red), monitors (green)\nsim.plot_eps(z=0)        # the permittivity the solver will use`, field: `sim_data = web.run(sim, task_name="wg", path="data/wg.hdf5")\nsim_data.plot_field("field", "Ey", f=freq0)`, flux: `amps = sim_data["out"].amps.sel(direction="+", mode_index=0)\nT = abs(amps) ** 2\nT_dB = 10 * np.log10(T)` };
    const x0 = 60, w = 560, y0 = 36, h = 150; let s = "";
    if (vw === "plot") { s += `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="var(--sunk)" stroke="var(--b)"/><rect x="${x0}" y="${y0 + h / 2 - 12}" width="${w}" height="24" fill="${PB}" opacity="0.6"/><line x1="${x0 + 90}" y1="${y0 + 20}" x2="${x0 + 90}" y2="${y0 + h - 20}" stroke="${PC}" stroke-width="3"/><line x1="${x0 + w - 90}" y1="${y0 + 20}" x2="${x0 + w - 90}" y2="${y0 + h - 20}" stroke="${PT}" stroke-width="3"/>` + tx(x0 + 90, y0 + 14, "source", "middle") + tx(x0 + w - 90, y0 + 14, "monitor", "middle") + tx(x0 + w / 2, y0 + h + 18, "sim.plot(z=0): top view, free", "middle"); }
    else if (vw === "field") { const nx = 56, ny = 14; const cw = w / nx, ch = h / ny; for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const y = (j + 0.5) / ny - 0.5; const prof = Math.exp(-Math.pow(y / 0.14, 2)); const v = prof * Math.cos(2 * Math.PI * (i / 7 - tsec * 1.5)); s += `<rect x="${(x0 + i * cw).toFixed(1)}" y="${(y0 + j * ch).toFixed(1)}" width="${(cw + 0.5).toFixed(1)}" height="${(ch + 0.5).toFixed(1)}" fill="${PIC.bwr(v)}"/>`; } s += `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="none" stroke="var(--b)"/>` + tx(x0 + w / 2, y0 + h + 18, "plot_field: Ey at freq0 on the z = 0 plane, red positive, blue negative", "middle"); }
    else { s += PIC.yaxis(x0, y0, h, -1, 0, 2, "T (dB)", v => v.toFixed(1)) + PIC.xaxis(x0, y0 + h, w, 1.5, 1.6, 5, "wavelength (µm)", v => v.toFixed(2)); let d = ""; for (let i = 0; i <= 100; i++) { const lam = 1.5 + 0.1 * i / 100; const T = -0.05 - 0.3 * Math.pow((lam - 1.55) / 0.05, 2); d += (i ? "L" : "M") + (x0 + w * i / 100).toFixed(1) + " " + (y0 + h - (T + 1) * h).toFixed(1); } s += `<path d="${d}" fill="none" stroke="${PB}" stroke-width="2"/>` + tx(x0 + w / 2, y0 - 10, "mode transmission in dB from the ModeMonitor amplitudes (illustrative curve)", "middle"); }
    show(fig, codes[vw], y0 + h + 44, s);
  };
  ctl.querySelectorAll("button[data-vw]").forEach(b => b.onclick = () => { vw = b.dataset.vw; draw(0); });
  PIC.player(ctl, draw);
}}
],
summary: String.raw`A td.Simulation is one object with a box in micrometres, a grid set by steps per wavelength in each material, a required run time, PML on the faces, a background medium with structures painted in list order, sources with a Gaussian pulse in frequency, and monitors read back by name. Frequencies come from <code>td.C_0</code> divided by the wavelength. Twenty steps per wavelength, a run time of twenty over the pulse width plus the travel time, and structures that run through the PML are the habits that make a run trustworthy.`,
sheet: [
[String.raw`\[ f_0 = c/\lambda_0, \quad c = \texttt{td.C}\_\texttt{0} = 2.998\times10^{14}\ \mathrm{\mu m/s} \]`, "Units: µm, s, Hz"],
[String.raw`\[ \Delta l = \lambda_0/(N n_{\mathrm{max}}) \]`, "GridSpec.auto, N steps per wavelength"],
[String.raw`\[ \Delta t \le 1\big/\left(c\sqrt{1/\Delta x^2 + 1/\Delta y^2 + 1/\Delta z^2}\right) \]`, "Courant limit from the smallest cell"],
[String.raw`\[ |S(f)| \propto e^{-(f-f_0)^2/(2\,\texttt{fwidth}^2)}, \quad T_{\mathrm{run}} \gtrsim 20/\texttt{fwidth} + L n_g/c \]`, "GaussianPulse and <code>run_time</code>"],
[String.raw`\[ \sigma(x) = \sigma_{\mathrm{max}}(x/d)^m \]`, "Graded PML conductivity"],
[String.raw`\[ T(f) = P_{\mathrm{monitor}}(f)/P_{\mathrm{source}}(f) \]`, "Normalized transmission from a monitor"]],
consts: String.raw`Tidy3D 2.12.1. Defaults: min_steps_per_wvl 10, PML num_layers 12, shutoff 1e-5. Indices at 1.55 µm: Si 3.48, SiO2 1.44.`,
sources: ["Tidy3D documentation, td.Simulation and td.AutoGrid API pages, docs.flexcompute.com/projects/tidy3d (2.12)", "Tidy3D changelog, 2.10 to 2.12 (renamed classes, default material variants)", "Tidy3D example notebook ModalSourcesMonitors and AutoGrid", "Taflove and Hagness, Computational Electrodynamics, 3rd ed. (Courant limit, PML)"]
});
})();

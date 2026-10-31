(function () {
/* Part 4 Lesson 4: monitors and results. Figures computed live with PIC (pic-common.js) and the helpers in app.js. */
const PC = "#D85A30", PB = "#378ADD", PT = "#1D9E75", PP = "#7F77DD", PA = "#BA7517";
const tx = (x, y, t, a, cls) => `<text class="${cls || "ts"}" x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""}>${t}</text>`;
const show = (fig, code, h, body) => { fig.innerHTML = PIC.code(code) + svg(h, body); };

addLesson("pic", "tidy3d", {
level: "Core",
id: "pic-tidy3d-l4", title: "Monitors and results: flux, fields, time traces and Q", short: "4. Monitors and results",
big: String.raw`Monitors are the only way anything comes out of an FDTD run. A flux monitor integrates the Poynting vector through a plane. A field monitor stores the field at chosen frequencies on a plane or volume. A mode monitor projects onto modes. A time monitor records the raw field at one point as time passes, which is what the resonance finder needs to measure a Q factor. A permittivity monitor shows what the solver actually used. This lesson pairs each monitor with the quantity it measures, computed live, and ends with how transmission is normalized so that a straight waveguide reads 1.`,
bridge: String.raw`The Poynting theorem and the Fourier transform from time to frequency are the physics underneath every monitor. The resonance finder uses harmonic inversion, a fit of a sum of decaying sinusoids, which is the same idea as reading a Q from a ring-down. All frequency-domain results are normalized to the source spectrum unless you turn that off.`,
cards: [

{s: "1. FluxMonitor", t: "td.FluxMonitor: power through a plane",
intu: String.raw`The simplest result is the power crossing a plane. Tidy3D stores the fields at each monitor frequency on the plane and integrates the Poynting vector over it. Positive means power along the plane's positive normal. Slide the monitor along the waveguide past a lossy section and watch the flux drop. A flux monitor does not know about modes, so it counts radiation too.`,
eq: String.raw`\[ P(f) = \iint_A \tfrac{1}{2}\operatorname{Re}\left\{\mathbf E(f)\times\mathbf H^{*}(f)\right\}\cdot\hat{\mathbf n}\, dA \]<div class="eqref">time-averaged Poynting flux at frequency f</div>`,
sym: [[String.raw`\(\mathbf E(f), \mathbf H(f)\)`, "the complex field amplitudes on the plane, from the running Fourier transform"], [String.raw`\(\hat{\mathbf n}\)`, "the plane normal, along the zero-size axis"], [String.raw`\(A\)`, "the monitor plane, which must cover the whole mode"]],
how: ["During the run the solver accumulates the discrete Fourier transform of E and H on the plane at each requested frequency.", "After the run it forms the Poynting vector from the transformed fields and integrates.", "The result is divided by the source power spectrum, so it reads as a fraction of what was injected.", "A monitor with nonzero size in all three axes gives the net flux out of the box, which is how you measure radiated or absorbed power."],
say: String.raw`A FluxMonitor integrates the time-averaged Poynting vector through its plane at each frequency and reports it as a fraction of the source power.`,
num: "A lossless straight waveguide: flux 1.000 at every frequency, within numerical error of about 1e-3 on a 20 steps per wavelength grid. A 2 dB/cm waveguide over 1 mm: 0.955.",
r(fig, ctl) {
  ctl.innerHTML = sl("xm", "monitor position x (µm)", 0, 10, 0.1, 7) + sl("al", "loss of the middle section (dB)", 0, 6, 0.1, 2);
  const u = () => {
    const xm = +$("xm").value, al = +$("al").value; $("xmv").textContent = xm.toFixed(1) + " µm"; $("alv").textContent = al.toFixed(1) + " dB";
    const frac = Math.min(1, Math.max(0, (xm - 3) / 4)); const P = PIC.fromdB(-al * frac);
    const code = `fmon = td.FluxMonitor(center=(${xm.toFixed(1)}, 0, 0), size=(0, 2, 1.5),\n    freqs=freqs, name="flux")\nflux = sim_data["flux"].flux       # xarray over f\nprint(float(flux.sel(f=freq0)))   # ${P.toFixed(3)}`;
    const x0 = 40, w = 600, y0 = 40, h = 70; let s = `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="${PB}" opacity="0.2"/><rect x="${x0 + 0.3 * w}" y="${y0}" width="${0.4 * w}" height="${h}" fill="${PA}" opacity="0.25"/>` + tx(x0 + w / 2, y0 + h / 2 + 4, `lossy section, ${al.toFixed(1)} dB total`, "middle");
    const X = x0 + xm / 10 * w; s += `<line x1="${X}" y1="${y0 - 14}" x2="${X}" y2="${y0 + h + 14}" stroke="${PT}" stroke-width="3"/>` + tx(X, y0 - 20, "FluxMonitor", "middle") + arrow(x0 + 10, y0 + h / 2, x0 + 60, y0 + h / 2, PC, 3);
    const y1 = y0 + h + 40, hh = 90; s += PIC.yaxis(x0 + 20, y1, hh, 0, 1, 2, "flux", v => v.toFixed(1)) + PIC.xaxis(x0 + 20, y1 + hh, w - 20, 0, 10, 5, "x (µm)", v => v.toFixed(0));
    const xs = range(0, 10, 100), ys = xs.map(x => PIC.fromdB(-al * Math.min(1, Math.max(0, (x - 3) / 4)))); s += plot(x0 + 20, y1, w - 20, hh, xs, ys, 0, 10, 0, 1.05, PB, 2);
    s += `<circle cx="${x0 + 20 + xm / 10 * (w - 20)}" cy="${y1 + hh - P / 1.05 * hh}" r="5" fill="${PT}"/>` + tx(x0 + w, y1 + 12, `flux at the monitor: ${P.toFixed(3)}`, "end");
    show(fig, code, y1 + hh + 44, s);
  };
  $("xm").oninput = u; $("al").oninput = u; u();
}},

{s: "2. FieldMonitor", t: "td.FieldMonitor and plot_field: seeing the wave",
intu: String.raw`A field monitor stores E and H at the chosen frequencies over a plane or a volume. It is the picture you look at first after a run. By default it stores all six components, and <code>fields</code> trims that to save memory. <code>plot_field</code> draws one component, with a phase you can set, which is why Play below cycles the phase: a stored frequency-domain field is a complex amplitude, and sweeping its phase shows the travelling wave. Choose the component and the plane.`,
eq: String.raw`\[ \mathbf E(\mathbf r, t) = \operatorname{Re}\left\{\mathbf E(\mathbf r, f)\, e^{-2\pi i f t}\right\} = |\mathbf E|\cos\!\left(\phi(\mathbf r) - 2\pi f t\right) \]`,
sym: [[String.raw`\(\mathbf E(\mathbf r, f)\)`, "the stored complex field at one frequency"], [String.raw`\(\phi(\mathbf r)\)`, "its phase, which advances along the propagation direction"], ["fields", "list such as ['Ey'] to store fewer components"]],
how: ["The monitor accumulates the Fourier transform of each requested component on its grid points during the run.", "A plane has zero size in one axis. A volume monitor stores a 3D block and can get large quickly.", "<code>plot_field(monitor_name, field_name, f=..., val='real' or 'abs')</code> draws the result, and a phase argument rotates the complex field.", "Storing only the frequencies you need is the main memory saver. One frequency on one plane is small."],
say: String.raw`A FieldMonitor stores complex field amplitudes at chosen frequencies on a plane or volume, and <code>plot_field</code> draws a component at a chosen phase.`,
num: "One plane of 300 × 150 grid points, six components, 11 frequencies: about 3 million complex numbers, 48 MB. Keep field monitors to one or two frequencies.",
r(fig, ctl) {
  ctl.innerHTML = btns([["Ey", "Ey"], ["Hz", "Hz"], ["abs", "|E|"]], "cmp") + btns([["z", "plane z = 0 (top)"], ["y", "plane y = 0 (side)"]], "pl");
  let cmp = "Ey", pl = "z";
  const draw = (tsec) => {
    pick(ctl, "cmp", cmp); pick(ctl, "pl", pl);
    const code = `fmon = td.FieldMonitor(center=(0, 0, 0), size=(${pl === "z" ? "td.inf, td.inf, 0" : "td.inf, 0, td.inf"}),\n    freqs=[freq0], fields=["Ey", "Hz"], name="field")\nsim_data.plot_field("field", "${cmp === "abs" ? "E" : cmp}", f=freq0, val="${cmp === "abs" ? "abs" : "real"}",\n    phase=${(2 * Math.PI * ((tsec * 0.4) % 1)).toFixed(2)})`;
    const x0 = 40, w = 600, y0 = 30, h = 160, nx = 60, ny = 16; let s = "";
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const y = (j + 0.5) / ny - 0.5; const prof = Math.exp(-Math.pow(y / (pl === "z" ? 0.16 : 0.1), 2)); const ph = 2 * Math.PI * (i / 7 - tsec * 0.4); let v = cmp === "abs" ? prof : prof * Math.cos(ph + (cmp === "Hz" ? Math.PI / 2 : 0)); s += `<rect x="${(x0 + i * w / nx).toFixed(1)}" y="${(y0 + j * h / ny).toFixed(1)}" width="${(w / nx + 0.5).toFixed(1)}" height="${(h / ny + 0.5).toFixed(1)}" fill="${cmp === "abs" ? PIC.heat(v) : PIC.bwr(v)}"/>`; }
    s += `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="none" stroke="var(--b)"/><rect x="${x0}" y="${y0 + h / 2 - (pl === "z" ? 16 : 11)}" width="${w}" height="${pl === "z" ? 32 : 22}" fill="none" stroke="var(--t)" stroke-dasharray="4 3"/>`;
    s += tx(x0 + w / 2, y0 + h + 16, cmp === "abs" ? "|E| on the plane: the mode profile, no phase" : `${cmp} at the current phase, red positive, blue negative, dashed outline is the core`, "middle");
    show(fig, code, y0 + h + 30, s);
  };
  ctl.querySelectorAll("button[data-cmp]").forEach(b => b.onclick = () => { cmp = b.dataset.cmp; draw(0); });
  ctl.querySelectorAll("button[data-pl]").forEach(b => b.onclick = () => { pl = b.dataset.pl; draw(0); });
  PIC.player(ctl, draw);
}},

{s: "3. amps to dB", t: "ModeMonitor amplitudes to power and decibels",
intu: String.raw`The mode monitor result is an array of complex amplitudes with coordinates for frequency, direction and mode index. Three lines turn it into a transmission spectrum: select one direction and mode, take the absolute value squared, and convert to dB. Drag the peak transmission and the bandwidth of an imagined device and watch the three stages, with the dB axis making the small losses readable.`,
eq: String.raw`\[ T(f) = \left|a_{+}(f)\right|^2, \qquad T_{\mathrm{dB}}(f) = 10\log_{10} T(f) \]\[ \text{1 dB bandwidth: the span where } T_{\mathrm{dB}} \ge T_{\mathrm{dB,max}} - 1 \]`,
sym: [[String.raw`\(a_{+}(f)\)`, "forward amplitude into the chosen mode, the amps array after sel"], [String.raw`\(T\)`, "power transmission, dimensionless"], [String.raw`\(T_{\mathrm{dB}}\)`, "the same in decibels, negative for loss"]],
how: ["amps is an xarray DataArray. sel picks coordinates by value, so direction='+' and <code>mode_index</code>=0.", "abs() ** 2 gives power. The amplitude is already normalized to the source, so the result is a fraction.", "np.log10 on the array gives the spectrum in dB in one line.", "The phase of amps is useful too: its slope with frequency is the group delay through the device."],
say: String.raw`Select the direction and mode from amps, square the absolute value for power, and take ten times the log for decibels.`,
num: "A transmission of 0.95 is −0.22 dB. 0.5 is −3 dB. 0.01 is −20 dB, the usual crosstalk target between channels.",
r(fig, ctl) {
  ctl.innerHTML = sl("T0", "peak transmission", 0.3, 1, 0.01, 0.9) + sl("bw", "1 dB bandwidth (nm)", 5, 80, 1, 30);
  const u = () => {
    const T0 = +$("T0").value, bw = +$("bw").value; $("T0v").textContent = T0.toFixed(2); $("bwv").textContent = bw + " nm";
    const code = `amps = sim_data["out"].amps                      # dims: f, direction, mode_index\na = amps.sel(direction="+", mode_index=0)       # complex, per frequency\nT = abs(a) ** 2                                  # peak ${T0.toFixed(2)}\nT_dB = 10 * np.log10(T)                          # peak ${PIC.dB(T0).toFixed(2)} dB\nlam = td.C_0 / T.f                               # wavelength axis in um`;
    const T = lam => T0 * Math.exp(-Math.pow((lam - 1550) / bw, 2) * Math.log(Math.pow(10, 0.1)) * 4);
    const x0 = 60, w = 250, y0 = 36, h = 140, x1 = 390; const lams = range(1500, 1600, 200);
    let s = PIC.yaxis(x0, y0, h, 0, 1, 2, "T", v => v.toFixed(1)) + PIC.xaxis(x0, y0 + h, w, 1500, 1600, 2, "λ (nm)", v => v.toFixed(0)) + plot(x0, y0, w, h, lams, lams.map(T), 1500, 1600, 0, 1, PB, 2);
    s += PIC.yaxis(x1, y0, h, -30, 0, 3, "T (dB)", v => v.toFixed(0)) + PIC.xaxis(x1, y0 + h, w, 1500, 1600, 2, "λ (nm)", v => v.toFixed(0)) + plot(x1, y0, w, h, lams, lams.map(l => PIC.dB(T(l))), 1500, 1600, -30, 0, PC, 2);
    const yl = y0 + h - (PIC.dB(T0) - 1 + 30) / 30 * h; s += `<line x1="${x1}" y1="${yl}" x2="${x1 + w}" y2="${yl}" stroke="var(--p)" stroke-dasharray="3 3"/>` + tx(x1 + w, yl - 4, "peak − 1 dB", "end");
    s += tx(x0 + w / 2, 20, "abs(a) ** 2", "middle", "th") + tx(x1 + w / 2, 20, "10 log10", "middle", "th");
    show(fig, code, y0 + h + 44, s);
  };
  $("T0").oninput = u; $("bw").oninput = u; u();
}},

{s: "4. FieldTimeMonitor", t: "td.FieldTimeMonitor: the raw field as time passes",
intu: String.raw`A time monitor records a field component at every time step, usually at one point. Its job is to show how energy rings in a cavity after the source has gone quiet. Start it after the pulse has passed with <code>start</code>, or the source itself dominates the record and any fit of the decay is wrong. Press Play to watch the trace being written, and move the start time.`,
eq: String.raw`\[ E(t) = \underbrace{s(t)}_{\text{source pulse}} + \underbrace{\sum_k A_k e^{-\gamma_k t}\cos(\omega_k t + \phi_k)}_{\text{ringing modes}}, \qquad t_{\mathrm{start}} \gt t_{\mathrm{pulse}} \]`,
sym: [[String.raw`\(s(t)\)`, "the injected pulse, which ends after a few pulse widths"], [String.raw`\(\gamma_k\)`, "amplitude decay rate of mode k"], [String.raw`\(t_{\mathrm{start}}\)`, "the monitor start time, in seconds"], ["interval", "store every n-th time step to save memory"]],
how: ["A point monitor has size (0, 0, 0). A line or plane time monitor is possible but large.", "start and stop bound the recording window. interval thins it.", "Place the point where the mode of interest has a large field, not at a node.", "For a Q fit the record must be long compared with the decay time, so <code>run_time</code> must be set to several decay times and shutoff may need lowering."],
say: String.raw`A FieldTimeMonitor stores a field component at every time step, and for a ring-down it must start after the source pulse has ended.`,
num: "A pulse with fwidth 10 THz ends after about 30 fs. A cavity with Q = 10,000 at 193 THz decays in Q/(π f) = 16 ps, so record a few tens of picoseconds and set <code>run_time</code> to about 50 ps.",
r(fig, ctl) {
  ctl.innerHTML = sl("ts", "start (fs)", 0, 200, 5, 60) + sl("Q", "cavity Q", 50, 2000, 50, 300);
  const draw = (tsec) => {
    const ts = +$("ts").value, Q = +$("Q").value; $("tsv").textContent = ts + " fs"; $("Qv").textContent = Q;
    const code = `tmon = td.FieldTimeMonitor(center=(0.3, 0, 0), size=(0, 0, 0),\n    fields=["Ey"], start=${ts}e-15, interval=1, name="t")\nsig = sim_data["t"].Ey.squeeze()   # real field vs time`;
    const f0 = 0.1934, gam = Math.PI * f0 / Q; // per fs
    const T = 600, x0 = 50, w = 580, y0 = 36, h = 140; const tmax = Math.min(T, tsec * 120);
    let s = `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="var(--sunk)"/>` + PIC.xaxis(x0, y0 + h, w, 0, T, 6, "time (fs)", v => v.toFixed(0));
    let d = "", dd = ""; for (let i = 0; i <= 600; i++) { const t = T * i / 600; if (t > tmax) break; const src = Math.exp(-Math.pow((t - 25) / 10, 2)) * Math.cos(2 * Math.PI * f0 * 0.3 * t); const ring = (t > 25 ? 0.5 * Math.exp(-gam * (t - 25)) : 0) * Math.cos(2 * Math.PI * f0 * 0.3 * t); const v = src + ring; const X = x0 + w * i / 600, Y = y0 + h / 2 - v * h / 2 * 0.9; const seg = X.toFixed(1) + " " + Y.toFixed(1); if (t >= ts) d += (d ? "L" : "M") + seg; else dd += (dd ? "L" : "M") + seg; }
    s += `<path d="${dd}" fill="none" stroke="var(--p)" stroke-width="1"/><path d="${d}" fill="none" stroke="${PB}" stroke-width="1.5"/>`;
    const X = x0 + ts / T * w; s += `<line x1="${X}" y1="${y0}" x2="${X}" y2="${y0 + h}" stroke="${PC}" stroke-width="2"/>` + tx(X + 4, y0 + 12, "start");
    s += tx(x0 + w, y0 + 12, ts < 50 ? "start too early: the source pulse is in the record" : "record holds only the ring-down", "end") + tx(x0 + 4, y0 + h - 6, "oscillation drawn slower than real for visibility");
    show(fig, code, y0 + h + 40, s);
  };
  $("ts").oninput = () => draw(99); $("Q").oninput = () => draw(99);
  PIC.player(ctl, draw);
}},

{s: "5. ResonanceFinder", t: "ResonanceFinder: Q and decay from a time trace",
intu: String.raw`The resonance finder fits the recorded trace as a sum of decaying sinusoids and returns each one's frequency, decay rate and Q. It needs far fewer periods than a Fourier transform would, which matters when a cavity rings for thousands of cycles. Below, a synthetic trace with a known Q is built and the fitted envelope is drawn over it. Drag Q and the resonance frequency and read the quantities the finder returns.`,
eq: String.raw`\[ E(t) \approx \sum_k A_k\, e^{-\gamma_k t}\cos(\omega_k t + \phi_k), \qquad Q_k = \frac{\omega_k}{2\gamma_k} \]\[ \text{energy decays as } e^{-2\gamma t} = e^{-\omega t/Q} \]`,
sym: [[String.raw`\(\omega_k\)`, "angular frequency of resonance k, the freq column"], [String.raw`\(\gamma_k\)`, "amplitude decay rate, the decay column"], [String.raw`\(Q_k\)`, "quality factor, the Q column"], [String.raw`\(\texttt{freq}\_\texttt{window}\)`, "the frequency range in Hz to search"]],
how: ["Energy is field squared, so it decays at twice the amplitude rate.", "Q is stored energy over energy lost per radian, which gives ω over the energy decay rate.", "ResonanceFinder(<code>freq_window</code>=(f1, f2)).run(signal) fits the sum by harmonic inversion and returns a dataset with freq, decay, Q, amplitude, phase and error.", "Feed it the FieldTimeMonitor data, or a raw array with <code>run_raw_signal</code> and the time step. Check the error column: a bad fit has a large error."],
say: String.raw`The resonance finder fits decaying sinusoids to a time trace and returns frequency, decay rate and Q equal to ω over twice the amplitude decay rate.`,
num: "Q = 10,000 at 193 THz: γ = 6.1e10 per second, amplitude falls by e in 16 ps, energy in 8 ps. Q = 1e6: energy lifetime 0.8 ns, which needs a long <code>run_time</code>.",
r(fig, ctl) {
  ctl.innerHTML = sl("Q", "true Q", 100, 3000, 50, 600) + sl("f", "resonance (THz)", 180, 210, 1, 193);
  const u = () => {
    const Q = +$("Q").value, f = +$("f").value; $("Qv").textContent = Q; $("fv").textContent = f + " THz";
    const gam = Math.PI * f * 1e12 / Q; // 1/s
    const code = `from tidy3d.plugins.resonance import ResonanceFinder\nrf = ResonanceFinder(freq_window=(180e12, 210e12), init_num_freqs=50)\nres = rf.run(sim_data["t"])   # or rf.run_raw_signal(signal, time_step)\nprint(res.to_dataframe())\n# freq ${f}e12 Hz, decay ${gam.toExponential(2)} 1/s, Q ${Q}, error small`;
    const T = Math.min(20, 5 * Q / (Math.PI * f) * 1e3); // ps window scaled to the decay
    const x0 = 50, w = 580, y0 = 36, h = 140; let s = `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="var(--sunk)"/>` + PIC.xaxis(x0, y0 + h, w, 0, T, 5, "time (ps)", v => v.toFixed(1));
    let d = "", e = "", e2 = ""; for (let i = 0; i <= 700; i++) { const t = T * i / 700; const env = Math.exp(-gam * t * 1e-12); const v = env * Math.cos(2 * Math.PI * f * t * 0.06); const X = x0 + w * i / 700; d += (i ? "L" : "M") + X.toFixed(1) + " " + (y0 + h / 2 - v * h / 2 * 0.9).toFixed(1); e += (i ? "L" : "M") + X.toFixed(1) + " " + (y0 + h / 2 - env * h / 2 * 0.9).toFixed(1); e2 += (i ? "L" : "M") + X.toFixed(1) + " " + (y0 + h / 2 + env * h / 2 * 0.9).toFixed(1); }
    s += `<path d="${d}" fill="none" stroke="${PB}" stroke-width="1"/><path d="${e}" fill="none" stroke="${PC}" stroke-width="2" stroke-dasharray="5 3"/><path d="${e2}" fill="none" stroke="${PC}" stroke-width="2" stroke-dasharray="5 3"/>`;
    s += tx(x0 + w, y0 + 12, `fit: γ = ${gam.toExponential(2)} /s, Q = ω/2γ = ${Q}`, "end") + tx(x0 + 4, y0 + h - 6, "oscillation drawn slower than real for visibility");
    show(fig, code, y0 + h + 40, s);
  };
  $("Q").oninput = u; $("f").oninput = u; u();
}},

{s: "6. PermittivityMonitor", t: "td.PermittivityMonitor and plot_eps: what the solver really used",
intu: String.raw`The structure you drew and the one the grid can represent are not the same. Cells on a boundary get an averaged permittivity, and a polygon edge becomes a staircase or a blend. <code>sim.plot_eps</code> previews this before the run, and a permittivity monitor stores the exact values used, dispersive materials included, at a frequency. Drag the grid size and watch a tilted edge and a thin layer turn into the cells the solver saw.`,
eq: String.raw`\[ \varepsilon_{\mathrm{cell}} = \frac{1}{V_{\mathrm{cell}}}\int_{\mathrm{cell}} \varepsilon(\mathbf r)\, dV \quad\text{(subpixel averaging, in its simplest form)} \]`,
sym: [[String.raw`\(\varepsilon_{\mathrm{cell}}\)`, "the value a boundary cell receives"], [String.raw`\(V_{\mathrm{cell}}\)`, "the cell volume"], ["subpixel", "Tidy3D's boundary averaging, on by default, which uses a tensor average for accuracy"]],
how: ["Each Yee cell gets one permittivity per field component.", "Cells cut by a boundary take a weighted average so that the effective boundary position is right to first order.", "Tidy3D applies this subpixel averaging by default, which is why coarse grids still give good effective indices.", "<code>plot_eps</code> draws the averaged values on a plane. A PermittivityMonitor stores them for a frequency and includes dispersion."],
say: String.raw`A PermittivityMonitor or <code>plot_eps</code> shows the averaged permittivity the solver used, and boundary cells carry an average rather than a staircase.`,
num: "A 220 nm layer on a 22 nm grid is exactly 10 cells. On a 25 nm grid it is 8.8 cells, and the top boundary cell gets 80 percent silicon and 20 percent oxide.",
r(fig, ctl) {
  ctl.innerHTML = sl("dl", "cell size (nm)", 10, 60, 2, 25);
  const u = () => {
    const dl = +$("dl").value; $("dlv").textContent = dl + " nm";
    const code = `sim.plot_eps(z=0, freq=freq0)        # preview, free\npmon = td.PermittivityMonitor(center=(0, 0, 0), size=(2, 1, 0),\n    freqs=[freq0], name="eps")\neps_xx = sim_data["eps"].eps_xx     # complex, on the monitor grid`;
    const x0 = 60, y0 = 30, W = 560, H = 160, sc = 400; // 1 um = 400 px in y? use 1.4 um x 0.4 um window
    const nx = Math.round(1400 / dl), ny = Math.round(400 / dl), cw = W / nx, ch = H / ny;
    let s = "";
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      // material: slab from y=0.09 to 0.31 um with a tilted left edge at x = 0.3 + (y-0.09)*0.4
      let fill = 0; const sub = 4; for (let a = 0; a < sub; a++) for (let b = 0; b < sub; b++) { const x = (i + (a + 0.5) / sub) * dl / 1000, y = 0.4 - (j + (b + 0.5) / sub) * dl / 1000; const inside = y > 0.09 && y < 0.31 && x > 0.3 + (y - 0.09) * 0.8 && x < 1.15; if (inside) fill++; }
      const f = fill / (sub * sub); const eps = 1.44 * 1.44 * (1 - f) + 12.1 * f;
      s += `<rect x="${(x0 + i * cw).toFixed(1)}" y="${(y0 + j * ch).toFixed(1)}" width="${cw.toFixed(2)}" height="${ch.toFixed(2)}" fill="${PIC.heat((eps - 2) / 10.5)}" stroke="var(--panel)" stroke-width="${dl > 20 ? 0.5 : 0}"/>`;
    }
    s += `<rect x="${x0}" y="${y0}" width="${W}" height="${H}" fill="none" stroke="var(--b)"/>` + tx(x0 + W / 2, y0 + H + 16, `ε per cell, ${dl} nm cells: a 220 nm slab with a tilted end. Boundary cells take an averaged ε.`, "middle");
    show(fig, code, y0 + H + 30, s);
  };
  $("dl").oninput = u; u();
}},

{s: "7. Normalization", t: "Normalization: why a straight waveguide reads 1",
intu: String.raw`Every frequency-domain monitor result is divided by the source spectrum, so a lossless straight guide gives a flux of exactly 1 at each frequency, and a device gives its transmission directly. This is <code>normalize_index</code>, the index of the source used for normalization, default 0. Set it to None for raw values in physical units. Drag the pulse width and see the raw spectrum fall off at the band edges while the normalized one stays flat. Values far outside the pulse band are noise divided by a small number, so do not trust them.`,
eq: String.raw`\[ T(f) = \frac{P_{\mathrm{monitor}}(f)}{P_{\mathrm{source}}(f)}, \qquad P_{\mathrm{source}}(f) \propto \left|S(f)\right|^2 \]`,
sym: [[String.raw`\(P_{\mathrm{source}}(f)\)`, "the power spectrum the source would inject into a straight guide"], [String.raw`\(S(f)\)`, "the Fourier transform of the GaussianPulse"], [String.raw`\(\texttt{normalize}\_\texttt{index}\)`, "which source to normalize by, default 0, None for raw"]],
how: ["The source injects a Gaussian spectrum, so raw monitor values follow that Gaussian.", "Dividing by it removes the pulse shape and leaves the device response.", "Far from the pulse centre both numbers are tiny and the ratio is noisy. Keep monitor freqs within about two fwidths.", "For a simulation with several sources, choose which one sets the normalization, or disable it and normalize yourself."],
say: String.raw`Monitor spectra are divided by the source spectrum, so results are transmission fractions, and only frequencies inside the pulse band are trustworthy.`,
num: "With fwidth = freq0/10, the source power at ±2 fwidth is 1.8 percent of its peak. Results there have 50 times more relative noise than at the centre.",
r(fig, ctl) {
  ctl.innerHTML = sl("fw", "fwidth / freq0", 0.03, 0.3, 0.01, 0.1) + btns([["0", "normalize_index=0"], ["none", "normalize_index=None"]], "nm");
  let nm = "0";
  const u = () => {
    const fw = +$("fw").value; $("fwv").textContent = fw.toFixed(2); pick(ctl, "nm", nm);
    const code = `sim = td.Simulation(..., normalize_index=${nm === "0" ? "0" : "None"})\nflux = sim_data["flux"].flux   # ${nm === "0" ? "fraction of source power" : "raw, source spectrum included"}`;
    const x0 = 60, w = 560, y0 = 36, h = 150; const fs = range(0.7, 1.3, 200);
    const dev = f => 1 - 0.3 * Math.pow((f - 1) / 0.15, 2) * (Math.abs(f - 1) < 0.15 ? 1 : 0) - 0.3 * (Math.abs(f - 1) >= 0.15 ? 1 : 0);
    const src = f => Math.exp(-Math.pow((f - 1) / fw, 2) / 2);
    const ys = fs.map(f => nm === "0" ? dev(f) : dev(f) * src(f));
    let s = PIC.yaxis(x0, y0, h, 0, 1.1, 2, nm === "0" ? "T" : "raw flux", v => v.toFixed(1)) + PIC.xaxis(x0, y0 + h, w, 0.7, 1.3, 6, "f / f₀", v => v.toFixed(1));
    s += plot(x0, y0, w, h, fs, fs.map(src), 0.7, 1.3, 0, 1.1, "var(--p)", 1, "4 3") + plot(x0, y0, w, h, fs, ys, 0.7, 1.3, 0, 1.1, nm === "0" ? PB : PC, 2);
    const xa = x0 + (1 - 2 * fw - 0.7) / 0.6 * w, xb = x0 + (1 + 2 * fw - 0.7) / 0.6 * w; s += `<rect x="${Math.max(x0, xa)}" y="${y0}" width="${Math.min(x0 + w, xb) - Math.max(x0, xa)}" height="${h}" fill="${PT}" opacity="0.08"/>` + tx((xa + xb) / 2, y0 + 12, "trusted band, ±2 fwidth", "middle");
    s += tx(x0 + w, y0 + h - 6, "dashed: source spectrum", "end");
    show(fig, code, y0 + h + 44, s);
  };
  ctl.querySelectorAll("button[data-nm]").forEach(b => b.onclick = () => { nm = b.dataset.nm; u(); });
  $("fw").oninput = u; u();
}}
],
summary: String.raw`A FluxMonitor integrates the Poynting vector through a plane, a FieldMonitor stores complex fields at chosen frequencies for <code>plot_field</code>, and a ModeMonitor gives amplitudes that become transmission with abs squared and dB with ten log ten. A FieldTimeMonitor records the raw field in time and must start after the pulse, and the ResonanceFinder fits its ring-down to give frequency, decay and Q equal to ω over twice the amplitude decay rate. A PermittivityMonitor shows the averaged permittivity the grid used. Every spectrum is normalized to the source, so a straight guide reads one and only the pulse band can be trusted.`,
sheet: [
[String.raw`\[ P(f) = \iint_A \tfrac{1}{2}\operatorname{Re}\{\mathbf E\times\mathbf H^*\}\cdot\hat{\mathbf n}\, dA \]`, "FluxMonitor"],
[String.raw`\[ \mathbf E(\mathbf r,t) = \operatorname{Re}\{\mathbf E(\mathbf r,f)e^{-2\pi i f t}\} \]`, "FieldMonitor data and <code>plot_field</code> phase"],
[String.raw`\[ T = |a_+|^2, \quad T_{\mathrm{dB}} = 10\log_{10}T \]`, "ModeMonitor amps to dB"],
[String.raw`\[ E(t) \approx \sum_k A_k e^{-\gamma_k t}\cos(\omega_k t + \phi_k), \quad Q_k = \omega_k/(2\gamma_k) \]`, "FieldTimeMonitor and ResonanceFinder"],
[String.raw`\[ \varepsilon_{\mathrm{cell}} = \frac{1}{V}\int_{\mathrm{cell}}\varepsilon\, dV \]`, "Subpixel averaging seen by PermittivityMonitor"],
[String.raw`\[ T(f) = P_{\mathrm{monitor}}(f)/P_{\mathrm{source}}(f) \]`, "Normalization, <code>normalize_index</code>"]],
consts: String.raw`Time traces drawn with slowed oscillations for visibility. Memory estimate assumes 16 bytes per complex value.`,
sources: ["Tidy3D documentation, FluxMonitor, FieldMonitor, ModeMonitor, FieldTimeMonitor and PermittivityMonitor API pages (2.12)", "Tidy3D FAQ, How do I set the ResonanceFinder, and the ResonanceFinder and CavityFOM notebooks", "V. Mandelshtam and H. Taylor, J. Chem. Phys. 107, 6756 (1997), harmonic inversion (filter diagonalization)", "A. Farjadpour et al., Opt. Lett. 31, 2972 (2006), subpixel smoothing in FDTD"]
});
})();

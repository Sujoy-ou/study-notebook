(function () {
/* Part 4 Lesson 6: a worked example, an interlayer coupler and a ring, from script to result. Figures computed live with PIC and the app.js helpers. */
const PC = "#D85A30", PB = "#378ADD", PT = "#1D9E75", PP = "#7F77DD", PA = "#BA7517";
const tx = (x, y, t, a, cls) => `<text class="${cls || "ts"}" x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""}>${t}</text>`;
const show = (fig, code, h, body) => { fig.innerHTML = PIC.code(code) + svg(h, body); };
/* side view of the interlayer taper: Si guide below tapering down, SiN guide above tapering up */
function sideView(x0, y0, w, g, step) {
  const sc = 60; let s = `<rect x="${x0}" y="${y0}" width="${w}" height="${110 + g * sc}" fill="var(--sunk)"/>` + tx(x0 + 4, y0 + 12, "side view, light travels left to right");
  const ySi = y0 + 80 + g * sc, ySiN = y0 + 50;
  if (step >= 0) s += `<polygon points="${x0},${ySi} ${x0 + w * 0.3},${ySi} ${x0 + w * 0.75},${ySi + 4} ${x0 + w * 0.75},${ySi + 9} ${x0 + w * 0.3},${ySi + 13} ${x0},${ySi + 13}" fill="${PB}" opacity="0.8"/>` + tx(x0 + w * 0.3, ySi + 30, "Si 220 nm, tapers to a tip");
  if (step >= 1) s += `<polygon points="${x0 + w * 0.25},${ySiN + 5} ${x0 + w * 0.7},${ySiN} ${x0 + w},${ySiN} ${x0 + w},${ySiN + 12} ${x0 + w * 0.7},${ySiN + 12} ${x0 + w * 0.25},${ySiN + 7}" fill="${PP}" opacity="0.8"/>` + tx(x0 + w - 4, ySiN - 8, "SiN 200 nm, starts as a tip", "end");
  if (step >= 1) s += `<line x1="${x0 + w * 0.5}" y1="${ySiN + 12}" x2="${x0 + w * 0.5}" y2="${ySi}" stroke="${PT}" marker-start="url(#ar)" marker-end="url(#ar)"/>` + tx(x0 + w * 0.5 + 6, (ySiN + ySi) / 2 + 10, `gap ${g.toFixed(2)} µm`);
  if (step < 0) s += tx(x0 + w / 2, y0 + 60, "background SiO2 fills the box: the gap and the cladding", "middle", "t");
  return s;
}

addLesson("pic", "tidy3d", {
level: "Advanced",
id: "pic-tidy3d-l6", title: "Worked example: an interlayer coupler and a ring, from script to result", short: "6. Worked example",
big: String.raw`This lesson puts the commands together on two devices of the Part 2 platform. First an interlayer coupler: a silicon waveguide that tapers to a tip while a silicon nitride waveguide above it tapers up, so the light climbs from one layer to the other. The script is assembled card by card, and the expected result is the power transfer of coupled-mode theory. Second a ring resonator: a mode monitor at the through port gives the spectrum, a time monitor with the resonance finder gives Q, and a batch sweeps the radius. The last card shows how the Chapter 3 inverse design would then optimize the taper with autograd.`,
bridge: String.raw`Part 2 Lesson 4 derives the interlayer transition and Part 1 Lesson 5 the ring equations. Here they are the expected answers that the simulation should reproduce. All code follows Tidy3D 2.12. The results are drawn from the analytic models, not from a run, so they show what to expect and where to look.`,
cards: [

{s: "1. Structures", t: "The interlayer taper: structures from the bottom up",
intu: String.raw`Two tapers face each other on different layers. The silicon guide narrows from 450 nm to a 150 nm tip over the taper length, which pushes its mode up and out. The nitride guide above starts as a tip and widens to 1 µm, so its mode becomes the better home for the light. Press Next step to lay the background, the silicon taper and the nitride taper, and drag the gap between the layers.`,
eq: String.raw`\[ w_{\mathrm{Si}}(z) = w_1 - (w_1 - w_{\mathrm{tip}})\frac{z}{L}, \qquad w_{\mathrm{SiN}}(z) = w_{\mathrm{tip}} + (w_2 - w_{\mathrm{tip}})\frac{z}{L} \]`,
sym: [[String.raw`\(w_1, w_2\)`, "full widths of the silicon and nitride guides"], [String.raw`\(w_{\mathrm{tip}}\)`, "the tip width the lithography can resolve"], [String.raw`\(L\)`, "taper length, the design knob"], [String.raw`\(g\)`, "oxide gap between the layers"]],
how: ["Write each taper as a PolySlab with four vertices in the xy plane.", "Give the silicon slab bounds 0 to 0.22 and the nitride slab bounds 0.22 + g to 0.42 + g.", "The background is SiO2, which fills the gap and the cladding.", "Linear tapers are the baseline. An adiabatic shape that tapers fast where coupling is weak and slow where it is strong is shorter for the same loss."],
say: String.raw`The interlayer coupler is two facing tapers on different layers with an oxide gap between them, built as PolySlabs over an SiO2 background.`,
num: "Shang 2015: SiN core 200 nm, gap 700 nm, interlayer loss 0.01 dB. A tip of 150 nm is a common 193 nm lithography limit. Taper lengths are 20 to 100 µm for low loss.",
r(fig, ctl) {
  ctl.innerHTML = sl("g", "gap g (µm)", 0.1, 0.8, 0.05, 0.3) + sl("L", "taper length L (µm)", 10, 100, 5, 40);
  const lines = [`lam0 = 1.55\nfreq0 = td.C_0 / lam0\nsi = td.material_library["cSi"]["Palik_LowLoss"]\nsio2 = td.material_library["SiO2"]["Palik_LowLoss"]\nsin = td.material_library["Si3N4"]["Luke2015PMLStable"]`, `L, g, tip = L_VAL, G_VAL, 0.15\nsi_taper = td.Structure(medium=si, geometry=td.PolySlab(axis=2,\n    slab_bounds=(0, 0.22),\n    vertices=[(-10, -0.225), (0, -0.225), (L, -tip/2), (L + 2, -tip/2),\n              (L + 2, tip/2), (L, tip/2), (0, 0.225), (-10, 0.225)]))`, `sin_taper = td.Structure(medium=sin, geometry=td.PolySlab(axis=2,\n    slab_bounds=(0.22 + g, 0.42 + g),\n    vertices=[(-2, -tip/2), (0, -tip/2), (L, -0.5), (L + 10, -0.5),\n              (L + 10, 0.5), (L, 0.5), (0, tip/2), (-2, tip/2)]))`];
  let step = 0;
  const u = () => {
    const g = +$("g").value, L = +$("L").value; $("gv").textContent = g.toFixed(2) + " µm"; $("Lv").textContent = L + " µm";
    const code = lines.slice(0, step + 1).join("\n").replace("L_VAL", L.toFixed(0)).replace("G_VAL", g.toFixed(2));
    let s = sideView(40, 30, 600, g, step - 1);
    // top view
    const y1 = 30 + 110 + g * 60 + 30; s += `<rect x="40" y="${y1}" width="600" height="70" fill="var(--sunk)"/>` + tx(44, y1 + 12, "top view");
    if (step === 0) s += tx(340, y1 + 40, "SiO2 background", "middle", "t");
    if (step >= 1) s += `<polygon points="40,${y1 + 30} 160,${y1 + 30} 440,${y1 + 38} 440,${y1 + 42} 160,${y1 + 50} 40,${y1 + 50}" fill="${PB}" opacity="0.8"/>`;
    if (step >= 2) s += `<polygon points="150,${y1 + 38} 160,${y1 + 38} 440,${y1 + 20} 640,${y1 + 20} 640,${y1 + 60} 440,${y1 + 60} 160,${y1 + 42} 150,${y1 + 42}" fill="${PP}" opacity="0.6"/>` + tx(300, y1 + 66, `taper length L = ${L} µm`, "middle");
    show(fig, code, y1 + 80, s);
  };
  PIC.stepper(ctl, 3, k => { step = k; u(); }, ["background and media", "silicon taper", "nitride taper"]);
  $("g").oninput = u; $("L").oninput = u;
}},

{s: "2. Source and monitors", t: "A ModeSource in the lower guide, a ModeMonitor in the upper one",
intu: String.raw`The source sits in the silicon guide before the taper and launches its fundamental TE mode. The monitor sits in the nitride guide after the taper and projects onto the nitride mode. A second monitor in the silicon after the taper catches whatever did not climb. A field monitor on a vertical plane along the device shows the light moving up. Press Next step to place each one and see where they go.`,
eq: String.raw`\[ \eta = |a_{+,\mathrm{SiN}}|^2, \qquad \text{residual} = |a_{+,\mathrm{Si}}|^2, \qquad \text{loss} = 1 - \eta - \text{residual} \]`,
sym: [[String.raw`\(\eta\)`, "the transfer efficiency into the nitride mode"], [String.raw`\(a_{+,\mathrm{SiN}}\)`, "forward amplitude at the nitride monitor"], ["residual", "light that stayed in the silicon tip region"]],
how: ["The source plane must be large enough for the silicon mode and sit a little inside the PML.", "The nitride monitor plane needs its own <code>mode_spec</code>, with a target near the nitride effective index of about 1.6.", "The field monitor is a y = 0 plane, which is the side view where the climb is visible.", "The run time must cover the length of the device at the group velocity plus the pulse."],
say: String.raw`Launch the silicon mode before the taper, measure the nitride mode after it, and keep a silicon monitor and a side-view field monitor to see where the rest went.`,
num: "For L = 40 µm and \\(n_g\\) about 4, the travel time is 0.5 ps. With fwidth = freq0/10 the run time is about 1.6 ps.",
r(fig, ctl) {
  const lines = [`src = td.ModeSource(center=(-8, 0, 0.11), size=(0, 2, 1.5),\n    source_time=td.GaussianPulse(freq0=freq0, fwidth=freq0/10),\n    direction="+", mode_index=0,\n    mode_spec=td.ModeSpec(num_modes=1, target_neff=2.4))`, `mon_sin = td.ModeMonitor(center=(L + 8, 0, 0.32 + g), size=(0, 3, 2),\n    freqs=[freq0], name="sin_out",\n    mode_spec=td.ModeSpec(num_modes=1, target_neff=1.6))\nmon_si = td.ModeMonitor(center=(L + 1, 0, 0.11), size=(0, 2, 1.5),\n    freqs=[freq0], name="si_out", mode_spec=td.ModeSpec(num_modes=1))`, `side = td.FieldMonitor(center=(L/2, 0, 0.3), size=(td.inf, 0, 3),\n    freqs=[freq0], fields=["Ey"], name="side")\nsim = td.Simulation(size=(L + 20, 4, 4), medium=sio2,\n    structures=[si_taper, sin_taper], sources=[src],\n    monitors=[mon_sin, mon_si, side], run_time=1.6e-12,\n    grid_spec=td.GridSpec.auto(min_steps_per_wvl=20, wavelength=lam0),\n    boundary_spec=td.BoundarySpec.all_sides(boundary=td.PML()),\n    symmetry=(0, -1, 0))`];
  PIC.stepper(ctl, 3, k => {
    const g = 0.3; let s = sideView(40, 30, 600, g, 1);
    const ySi = 30 + 80 + g * 60, ySiN = 30 + 50;
    if (k >= 0) s += `<line x1="90" y1="${ySi - 30}" x2="90" y2="${ySi + 40}" stroke="${PC}" stroke-width="3"/>` + tx(90, ySi + 54, "ModeSource (Si)", "middle");
    if (k >= 1) s += `<line x1="580" y1="${ySiN - 25}" x2="580" y2="${ySiN + 40}" stroke="${PT}" stroke-width="3"/>` + tx(580, ySiN - 30, "ModeMonitor sin_out", "middle") + `<line x1="500" y1="${ySi - 20}" x2="500" y2="${ySi + 35}" stroke="${PT}" stroke-width="3"/>` + tx(500, ySi + 50, "si_out", "middle");
    if (k >= 2) s += `<rect x="40" y="30" width="600" height="${110 + g * 60}" fill="${PP}" opacity="0.1" stroke="${PP}" stroke-dasharray="4 3"/>` + tx(340, 30 + 125 + g * 60 + 12, "FieldMonitor side: the whole y = 0 plane. symmetry=(0, −1, 0) halves the run for the TE mode.", "middle");
    show(fig, lines.slice(0, k + 1).join("\n"), 30 + 160 + g * 60, s);
  }, ["mode source", "mode monitors", "field monitor and Simulation"]);
}},

{s: "3. Expected transfer", t: "What the result should look like: power climbing along z",
intu: String.raw`Along the taper the two guides are briefly phase matched, and coupled-mode theory says power transfers over a coupling length set by the gap. A taper that is long compared with that length transfers almost everything. Drag the gap and the taper length. Press Play to watch the power climb from silicon to nitride along the device, and read the expected efficiency and the loss in dB that the ModeMonitor would report.`,
eq: String.raw`\[ P_{\mathrm{SiN}}(z) \approx \sin^2\!\left(\kappa(g)\, z\right), \qquad \kappa(g) = \kappa_0 e^{-\gamma g} \]\[ \text{adiabatic when } L \gg L_c = \frac{\pi}{2\kappa}, \quad \eta \to 1 - \left(\frac{L_c}{L}\right)^{2}\ \text{(rough)} \]`,
sym: [[String.raw`\(\kappa(g)\)`, "the peak coupling at the phase-matching point, falling with the gap"], [String.raw`\(L_c\)`, "coupling length at that point"], [String.raw`\(\eta\)`, "transfer efficiency, what <code>sin_out</code> reports"]],
how: ["Near the phase-matching point the system is two coupled guides, so the coupled-mode solution of Part 1 Lesson 4 applies locally.", "A slow taper keeps the light in the local supermode that starts in silicon and ends in nitride, which is adiabatic transfer.", "Too short a taper leaves part of the light in the other supermode, which ends in the silicon tip and radiates.", "Longer tapers and smaller gaps raise the efficiency. The tolerance to misalignment also improves with a longer taper."],
say: String.raw`Along the taper the light transfers over a coupling length set by the gap, and a taper much longer than that length moves nearly all of it into the nitride guide.`,
num: "Shang 2015 measured 0.01 dB for a 700 nm gap with 200 nm SiN. A 2026 SiN interposer reports 0.36 dB per interlayer taper. Designs with a 300 nm gap and a 40 µm taper reach below 0.1 dB in simulation (teaching value).",
r(fig, ctl) {
  ctl.innerHTML = sl("g", "gap g (µm)", 0.1, 0.8, 0.05, 0.3) + sl("L", "taper length L (µm)", 10, 100, 5, 40);
  const draw = (tsec) => {
    const g = +$("g").value, L = +$("L").value; $("gv").textContent = g.toFixed(2) + " µm"; $("Lv").textContent = L + " µm";
    const kap = 0.5 * Math.exp(-3.5 * g), Lc = Math.PI / (2 * kap), eta = Math.max(0.05, 1 - Math.pow(Math.min(1, Lc / L), 2) * 0.9), lossdB = -PIC.dB(eta);
    const code = `sim_data = web.run(sim, task_name="interlayer")\npick = dict(direction="+", mode_index=0)\neta = abs(sim_data["sin_out"].amps.sel(**pick)) ** 2\nres = abs(sim_data["si_out"].amps.sel(**pick)) ** 2\nprint(10 * np.log10(eta))   # expect about ${(-lossdB).toFixed(2)} dB\nsim_data.plot_field("side", "Ey", f=freq0)`;
    const x0 = 60, w = 560, y0 = 44, h = 150; const zs = range(0, L, 120);
    const PSiN = z => eta * Math.pow(Math.sin(Math.PI / 2 * Math.min(1, z / L)), 2);
    let s = PIC.yaxis(x0, y0, h, 0, 1, 2, "power", v => v.toFixed(1)) + PIC.xaxis(x0, y0 + h, w, 0, L, 4, "z along the taper (µm)", v => v.toFixed(0));
    s += plot(x0, y0, w, h, zs, zs.map(PSiN), 0, L, 0, 1, PP, 2.5) + plot(x0, y0, w, h, zs, zs.map(z => 1 - PSiN(z)), 0, L, 0, 1, PB, 2.5);
    const zp = (tsec * 0.25 % 1) * L, X = x0 + zp / L * w; s += `<circle cx="${X}" cy="${y0 + h - PSiN(zp) * h}" r="6" fill="${PP}"/><circle cx="${X}" cy="${y0 + h - (1 - PSiN(zp)) * h}" r="6" fill="${PB}"/>`;
    s += tx(x0 + w, 20, `blue: silicon, purple: nitride. L_c = ${Lc.toFixed(1)} µm, η = ${eta.toFixed(3)} (${lossdB.toFixed(2)} dB)`, "end");
    show(fig, code, y0 + h + 44, s);
  };
  $("g").oninput = () => draw(0); $("L").oninput = () => draw(0);
  PIC.player(ctl, draw);
}},

{s: "4. Ring script", t: "A ring resonator: through port monitor and a time monitor",
intu: String.raw`A ring is a circle of waveguide next to a straight bus. The bus carries the source and a mode monitor at the through port. A time monitor inside the ring records the ring-down for the resonance finder. Drag the radius and the gap and watch the layout. The run time must be several photon lifetimes, which for a high Q ring is far longer than the usual twenty over the pulse width.`,
eq: String.raw`\[ \tau_{\mathrm{ph}} = \frac{Q}{2\pi f_0}, \qquad T_{\mathrm{run}} \gtrsim 5\,\tau_{\mathrm{ph}} \]`,
sym: [[String.raw`\(\tau_{\mathrm{ph}}\)`, "energy lifetime of the resonance"], [String.raw`\(Q\)`, "the loaded quality factor you expect"], [String.raw`\(f_0\)`, "the resonance frequency"]],
how: ["The ring is a ClipOperation of two cylinders, or a PolySlab ring, in the silicon layer.", "A ModeMonitor at the through port with many freqs gives the spectrum in one run.", "A FieldTimeMonitor at a point inside the ring, started after the pulse, feeds the ResonanceFinder.", "Set shutoff low or <code>run_time</code> long enough, since a high Q ring keeps ringing far below the default shutoff."],
say: String.raw`A ring needs a through-port mode monitor for the spectrum, a time monitor inside the ring for Q, and a run time of several photon lifetimes.`,
num: "Q = 20,000 at 193 THz: lifetime 16 ps, run time about 80 ps, which is 40 times a plain waveguide run. Budget the cost accordingly.",
r(fig, ctl) {
  ctl.innerHTML = sl("R", "ring radius (µm)", 3, 15, 0.5, 5) + sl("gap", "bus to ring gap (nm)", 100, 400, 10, 200) + sl("Q", "expected Q", 2000, 50000, 1000, 20000);
  const u = () => {
    const R = +$("R").value, gap = +$("gap").value, Q = +$("Q").value; $("Rv").textContent = R + " µm"; $("gapv").textContent = gap + " nm"; $("Qv").textContent = Q;
    const tau = Q / (2 * Math.PI * 193.4e12), rt = 5 * tau;
    const code = `R, gap, w = ${R}, ${(gap / 1000).toFixed(2)}, 0.45\nyb = -(R + w + gap)                  # bus centre\ncyl = lambda r: td.Cylinder(center=(0, 0, 0.11), radius=r,\n                            length=0.22, axis=2)\nring = td.Structure(medium=si, geometry=td.ClipOperation(\n    operation="difference",\n    geometry_a=cyl(R + w/2), geometry_b=cyl(R - w/2)))\nbus = td.Structure(medium=si, geometry=td.Box(\n    center=(0, yb, 0.11), size=(td.inf, w, 0.22)))\nthru = td.ModeMonitor(center=(R + 3, yb, 0.11), size=(0, 2, 1.5),\n    freqs=freqs, mode_spec=td.ModeSpec(num_modes=1), name="thru")\ntmon = td.FieldTimeMonitor(center=(0, R, 0.11), size=(0, 0, 0),\n    fields=["Ey"], start=0.1e-12, name="ring_t")\nsim = td.Simulation(..., run_time=${(rt * 1e12).toFixed(0)}e-12,\n                    shutoff=1e-7)`;
    const cx = 340, cy = 130, sc = 12; let s = `<circle cx="${cx}" cy="${cy}" r="${R * sc}" fill="none" stroke="${PB}" stroke-width="${0.45 * sc}" opacity="0.7"/>`;
    const yb = cy + (R + 0.45 + gap / 1000) * sc; s += `<rect x="40" y="${yb - 0.225 * sc}" width="600" height="${0.45 * sc}" fill="${PB}" opacity="0.7"/>`;
    s += `<line x1="80" y1="${yb - 20}" x2="80" y2="${yb + 20}" stroke="${PC}" stroke-width="3"/>` + tx(80, yb + 34, "source", "middle") + `<line x1="${cx + (R + 3) * sc}" y1="${yb - 20}" x2="${cx + (R + 3) * sc}" y2="${yb + 20}" stroke="${PT}" stroke-width="3"/>` + tx(cx + (R + 3) * sc, yb + 34, "thru monitor", "middle");
    s += `<circle cx="${cx}" cy="${cy - R * sc}" r="4" fill="${PA}"/>` + tx(cx, cy - R * sc - 10, "time monitor", "middle") + tx(cx, yb + 20, `R = ${R} µm, gap ${gap} nm`, "middle");
    s += tx(340, yb + 56, `expected Q ${Q}: lifetime ${(tau * 1e12).toFixed(1)} ps, run_time ${(rt * 1e12).toFixed(0)} ps`, "middle", "t");
    show(fig, code, yb + 70, s);
  };
  ["R", "gap", "Q"].forEach(i => $(i).oninput = u); u();
}},

{s: "5. Expected spectrum", t: "What the through port shows: the all-pass spectrum and Q",
intu: String.raw`The through-port monitor returns dips at every resonance. Their spacing is the free spectral range, set by the radius and the group index. Their depth is set by how the coupling compares with the round-trip loss: equal is critical coupling and the dip goes to zero. Their width gives the loaded Q. Drag the coupling and the loss and read what the monitor and the resonance finder would report.`,
eq: String.raw`\[ T_{\mathrm{thru}} = \frac{a^2 - 2ra\cos\phi + r^2}{1 - 2ra\cos\phi + (ra)^2}, \qquad \phi = \frac{2\pi n_{\mathrm{eff}}L}{\lambda} \]\[ \mathrm{FSR} = \frac{\lambda^2}{n_g L}, \qquad Q_L = \frac{\pi n_g L\sqrt{ra}}{\lambda(1 - ra)} \]<div class="eqref">Bogaerts et al. 2012, all-pass ring</div>`,
sym: [[String.raw`\(r\)`, "self-coupling of the bus, the fraction of amplitude that passes the coupler"], [String.raw`\(a\)`, "round-trip amplitude transmission, 1 for no loss"], [String.raw`\(\phi\)`, "round-trip phase"], [String.raw`\(L = 2\pi R\)`, "ring circumference"]],
how: ["The field in the ring builds up from the coupled bus field and its own round trips, a geometric series.", "Summing the series gives the all-pass transfer function.", "At resonance the phase is a multiple of 2π and the through transmission is a minimum.", "The width of the dip gives Q, and the resonance finder on the time monitor gives the same Q independently, a good cross-check."],
say: String.raw`The through port shows dips spaced by the FSR, with depth set by coupling against loss and width set by the loaded Q.`,
num: "R = 5 µm, \\(n_g = 4.2\\): FSR = 18 nm at 1.55 µm. r = 0.95, a = 0.95: critical coupling, Q about 2,700. a = 0.995 and r = 0.995: Q about 27,000.",
r(fig, ctl) {
  ctl.innerHTML = sl("r", "self-coupling r", 0.8, 0.999, 0.001, 0.95) + sl("a", "round-trip a", 0.8, 0.999, 0.001, 0.95) + sl("R", "ring radius (µm)", 3, 15, 0.5, 5);
  const u = () => {
    const r = +$("r").value, a = +$("a").value, R = +$("R").value; $("rv").textContent = r.toFixed(3); $("av").textContent = a.toFixed(3); $("Rv").textContent = R + " µm";
    const ng = 4.2, neff = 2.4, L = 2 * Math.PI * R, fsr = 1.55 * 1.55 / (ng * L) * 1000, Q = Math.PI * ng * L * Math.sqrt(r * a) / (1.55 * (1 - r * a));
    const code = `amp = sim_data["thru"].amps.sel(direction="+", mode_index=0)\nT = abs(amp) ** 2\nlam = td.C_0 / T.f\n# dips every FSR = ${fsr.toFixed(1)} nm, loaded Q about ${Q.toFixed(0)}\nrf = ResonanceFinder(freq_window=(190e12, 197e12))\nres = rf.run(sim_data["ring_t"])\nprint(res.to_dataframe()[["freq", "Q"]])   # Q from the ring-down`;
    const x0 = 60, w = 560, y0 = 44, h = 150, lams = range(1530, 1570, 1600);
    const T = lam => { const l = lam / 1000, ne = neff - (ng - neff) * (l - 1.55) / 1.55; return PIC.ringAllPass(r, a, 2 * Math.PI * ne * L / l); };
    let s = PIC.yaxis(x0, y0, h, 0, 1, 2, "T thru", v => v.toFixed(1)) + PIC.xaxis(x0, y0 + w / w * h, w, 1530, 1570, 4, "wavelength (nm)", v => v.toFixed(0));
    s += plot(x0, y0, w, h, lams, lams.map(T), 1530, 1570, 0, 1, PB, 1.8);
    s += tx(x0 + w, 20, `FSR ${fsr.toFixed(1)} nm, Q ${Q.toFixed(0)}, ${Math.abs(r - a) < 0.005 ? "critical coupling" : r < a ? "over-coupled" : "under-coupled"}`, "end");
    show(fig, code, y0 + h + 44, s);
  };
  ["r", "a", "R"].forEach(i => $(i).oninput = u); u();
}},

{s: "6. Radius sweep", t: "A Batch over the ring radius: FSR and bend loss together",
intu: String.raw`One batch answers two questions: how the free spectral range shrinks as the ring grows, and how the bend loss falls. Build a simulation per radius, run them together, and pull the spectrum from each. Press Play to watch the sweep complete and the resonances fan out. Small rings give a wide FSR, which WDM filters want, but below a few micrometres in silicon the bend loss lowers the Q.`,
eq: String.raw`\[ \mathrm{FSR}(R) = \frac{\lambda^2}{2\pi R\, n_g}, \qquad a(R) \approx e^{-\alpha_{\mathrm{bend}}(R)\,\pi R}, \quad \alpha_{\mathrm{bend}} \propto e^{-CR} \]`,
sym: [[String.raw`\(R\)`, "ring radius, the swept parameter"], [String.raw`\(a(R)\)`, "round-trip amplitude, falling as bend loss rises at small R"], [String.raw`\(C\)`, "the index-contrast constant of the bend loss law"]],
how: ["<code>make_ring(R)</code> returns the simulation of card 4 for one radius.", "<code>web.Batch(simulations={f'R_{R}': make_ring(R) for R in radii}).run()</code> runs them together.", "For each result take the through spectrum and find the dips, or run the resonance finder on the time monitor.", "Plot FSR and Q against R. The FSR follows 1/R exactly. The Q saturates at the coupling-limited value once bend loss is negligible."],
say: String.raw`A radius sweep shows the FSR falling as one over R and the Q rising as bend loss dies away, and a batch runs all radii at once.`,
num: "Silicon rings: R = 3 µm, FSR 30 nm. R = 10 µm, FSR 9 nm. Bend loss is negligible above about 5 µm radius in a 220 nm strip.",
r(fig, ctl) {
  ctl.innerHTML = sl("n", "number of radii", 3, 9, 1, 5);
  const draw = (tsec) => {
    const n = +$("n").value; $("nv").textContent = n; const done = Math.min(n, Math.floor(tsec * 1.5) % (n + 3) + 1);
    const radii = range(3, 12, n);
    const code = `radii = np.linspace(3, 12, ${n})\nsims = {f"R_{R:.1f}": make_ring(R) for R in radii}\nbatch = web.Batch(simulations=sims)\nbatch_data = batch.run(path_dir="data")        # ${done} of ${n} done\nrf = ResonanceFinder(freq_window=(190e12, 197e12))\nfor key, sd in batch_data.items():\n    amp = sd["thru"].amps.sel(direction="+", mode_index=0)\n    T = abs(amp) ** 2\n    Q = rf.run(sd["ring_t"]).to_dataframe()["Q"]`;
    const x0 = 60, w = 560, y0 = 44, h = 150, ng = 4.2; let s = PIC.yaxis(x0, y0, h, 0, 1, 2, "T thru", v => v.toFixed(1)) + PIC.xaxis(x0, y0 + h, w, 1540, 1560, 4, "wavelength (nm)", v => v.toFixed(0));
    radii.forEach((R, i) => { if (i >= done) return; const L = 2 * Math.PI * R; const a = Math.exp(-0.02 * Math.exp(-(R - 3) * 1.2) * Math.PI * R) * 0.995, r = 0.97; const lams = range(1540, 1560, 1200); const T = lam => { const l = lam / 1000, ne = 2.4 - (ng - 2.4) * (l - 1.55) / 1.55; return PIC.ringAllPass(r, a, 2 * Math.PI * ne * L / l); }; s += plot(x0, y0, w, h, lams, lams.map(T), 1540, 1560, 0, 1, PIC.heat(i / n), 1.5); });
    s += tx(x0 + w, 20, `${done} of ${n} radii done. Small R: wide FSR, shallower dips from bend loss.`, "end");
    show(fig, code, y0 + h + 44, s);
  };
  $("n").oninput = () => draw(0);
  PIC.player(ctl, draw);
}},

{s: "7. Optimize it", t: "Where Chapter 3 takes over: autograd on the taper",
intu: String.raw`Once the forward script works, inverse design is a small change. Make a density over the taper region the parameters, build the simulation inside a function, and let autograd differentiate the transfer efficiency through <code>web.run</code>. The filter and projection from Chapter 3 keep the outline smooth and binary. Drag the projection sharpness and the filter radius and watch a raw density along the taper become smooth and then binary. One forward and one adjoint run per step give the gradient for every parameter.`,
eq: String.raw`\[ \max_{\mathbf w}\ F(\mathbf w) = \left|a_{+,\mathrm{SiN}}(\mathbf w)\right|^2, \qquad \frac{\partial F}{\partial \mathbf w} \ \text{from one forward and one adjoint run} \]\[ \tilde w = \text{filter}_R(w), \qquad \bar w = \frac{\tanh(\beta\eta) + \tanh(\beta(\tilde w - \eta))}{\tanh(\beta\eta) + \tanh(\beta(1 - \eta))} \]<div class="eqref">Ch. 3 Lessons 6 and 7</div>`,
sym: [[String.raw`\(\mathbf w\)`, "the width samples along the taper, or a density grid"], [String.raw`\(F\)`, "the objective, transfer into the nitride mode"], [String.raw`\(R, \beta, \eta\)`, "filter radius, projection sharpness and threshold"]],
how: ["Write <code>make_sim(w)</code> with autograd.numpy so that the geometry depends on traced parameters.", "The objective calls web.run inside and returns a scalar from a frequency-domain monitor. A traced simulation with no such monitor raises an error.", "<code>value_and_grad</code> gives the objective and its gradient. Tidy3D runs the adjoint simulation for you.", "Update the parameters with Adam, raise β on a schedule, and finish with the design rule check. The autograd plugin provides the filter and projection functions. Check their argument names in the 2.12 autograd docs before copying."],
say: String.raw`Inverse design wraps the working script in a function of traced parameters, differentiates the monitor result through web.run, and uses filter and projection to keep the outline buildable.`,
num: "A taper of 40 width samples needs 2 runs per step, not 41. Thirty Adam steps is 60 runs, which a batch can partly parallelize across the forward and adjoint of several candidates.",
r(fig, ctl) {
  ctl.innerHTML = sl("beta", "projection β", 1, 64, 1, 8) + sl("rad", "filter radius (samples)", 0, 6, 1, 2);
  const rng = C3.rng(5); const raw = range(0, 1, 40).map((z, i) => 0.5 + 0.5 * (1 - z) + 0.25 * (rng() - 0.5));
  const u = () => {
    const beta = +$("beta").value, rad = +$("rad").value; $("betav").textContent = beta; $("radv").textContent = rad;
    const filt = raw.map((_, i) => { let s = 0, ws = 0; for (let k = -rad; k <= rad; k++) { const j = i + k; if (j < 0 || j >= raw.length) continue; const wgt = 1 - Math.abs(k) / (rad + 1); s += wgt * raw[j]; ws += wgt; } return s / ws; });
    const proj = filt.map(v => C3.proj(Math.min(1, Math.max(0, v - 0.25)), beta, 0.5));
    const code = `import autograd.numpy as anp\nfrom autograd import value_and_grad\nfrom tidy3d.plugins.autograd import make_filter_and_project\nfilt_proj = make_filter_and_project(radius=${rad * 0.1 + 0.05}, dl=0.05, beta=${beta})\n\ndef objective(w):\n    rho = filt_proj(w)            # smooth, then binary\n    sim = make_sim(rho)           # density region in the taper\n    data = web.run(sim, task_name="opt", verbose=False)\n    amp = data["sin_out"].amps.sel(direction="+", mode_index=0)\n    return anp.sum(anp.abs(amp.values) ** 2)\n\nval, grad = value_and_grad(objective)(w0)   # forward + adjoint`;
    const x0 = 60, w = 560, y0 = 44, h = 140; let s = PIC.yaxis(x0, y0, h, 0, 1, 2, "density ρ", v => v.toFixed(1)) + PIC.xaxis(x0, y0 + h, w, 0, 40, 4, "sample along the taper", v => v.toFixed(0));
    const xs = range(0, 39, 40); s += plot(x0, y0, w, h, xs, raw, 0, 39, 0, 1.05, "var(--p)", 1, "3 3") + plot(x0, y0, w, h, xs, filt, 0, 39, 0, 1.05, PB, 1.5) + plot(x0, y0, w, h, xs, proj, 0, 39, 0, 1.05, PC, 2.5);
    s += tx(x0 + w, 20, "dashed: raw w, blue: filtered, red: projected (β sharpens it)", "end");
    show(fig, code, y0 + h + 44, s);
  };
  $("beta").oninput = u; $("rad").oninput = u; u();
}}
],
summary: String.raw`The interlayer coupler is two facing tapers on different layers over an oxide gap, fed by a silicon mode source and read by a nitride mode monitor, and coupled-mode theory says a taper much longer than the coupling length moves nearly all the light up. The ring is a clipped cylinder beside a bus, read by a through-port mode monitor for the spectrum and a time monitor with the resonance finder for Q, with a run time of several photon lifetimes. A batch sweeps the radius for FSR and bend loss. Wrapping the script in a function of traced parameters turns it into a Chapter 3 inverse design, with the gradient from one forward and one adjoint run.`,
sheet: [
[String.raw`\[ P_{\mathrm{SiN}}(z) \approx \sin^2(\kappa z), \quad \kappa = \kappa_0 e^{-\gamma g} \]`, "Interlayer transfer along the taper"],
[String.raw`\[ \eta = |a_{+,\mathrm{SiN}}|^2 \]`, "What the nitride ModeMonitor reports"],
[String.raw`\[ \tau_{\mathrm{ph}} = Q/(2\pi f_0), \quad T_{\mathrm{run}} \gtrsim 5\tau_{\mathrm{ph}} \]`, "Run time for a ring"],
[String.raw`\[ T_{\mathrm{thru}} = \frac{a^2 - 2ra\cos\phi + r^2}{1 - 2ra\cos\phi + (ra)^2} \]`, "All-pass ring spectrum"],
[String.raw`\[ \mathrm{FSR} = \frac{\lambda^2}{2\pi R n_g}, \quad Q_L = \frac{\pi n_g L\sqrt{ra}}{\lambda(1 - ra)} \]`, "FSR and loaded Q"],
[String.raw`\[ \max_{\mathbf w} |a_{+,\mathrm{SiN}}(\mathbf w)|^2 \]`, "The inverse design objective with autograd"]],
consts: String.raw`Platform: Si 220 nm, SiN 200 nm, gap 0.1 to 0.8 µm, tip 150 nm, λ 1.55 µm, \(n_g\) = 4.2 for the silicon ring. Curves are analytic models of the expected result, not simulation output.`,
sources: ["W. Shang et al., Opt. Express 23, 21334 (2015), multilayer SiN platform, 0.01 dB interlayer coupler", "W. Bogaerts et al., Laser Photon. Rev. 6, 47 (2012), silicon microring resonators", "Tidy3D notebooks Autograd16BilayerCoupler, SMatrix, ResonanceFinder and ParameterScanWebRun", "Tidy3D autograd plugin documentation (2.12), make_filter_and_project and differentiable web.run"]
});
})();

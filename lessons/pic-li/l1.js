(function () {
/* Part 3 Lesson 1: the III-V on silicon plasmonic nanolaser of Li, Liu, Sorger and Sadana, Sci. Rep. 5, 14067 (2015).
   Figures computed live with PIC (pic-common.js) and the helpers in app.js. Rate equation parameters are illustrative. */
const PC = "#D85A30", PB = "#378ADD", PT = "#1D9E75", PP = "#7F77DD", PA = "#BA7517", PG = "#C9A227";
const tx = (x, y, t, a, cls) => `<text class="${cls || "ts"}" x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""}>${t}</text>`;
const rc = (x, y, w, h, fill, stroke) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke || "none"}" stroke-width="1"/>`;
const q = 1.602e-19, hv = 1.46 * q, f0 = 3.53e14;   // 850 nm
/* illustrative rate equation parameters, tuned so the model thresholds land near the paper's 2.0, 2.4 and 3.1 mA */
const BASE = { eta_i: 0.8, V: 1.2e-13, tau_nr: 2e-9, tau_sp: 1e-9, FP: 10, vs: 0, SoverV: 4 / 250e-7, g0: 3e-6, Ntr: 1.5e18, Gamma: 0.3 };
const CFG = [["bonded", 0.55, 400, PT], ["selective", 0.48, 320, PB], ["blanket", 0.32, 238, PC]];
const params = (k, vs) => Object.assign({}, BASE, { beta: CFG[k][1], tau_p: CFG[k][2] / (2 * Math.PI * f0), vs: vs || 0 });
/* steady state by bisection on N: dS/dt = 0 gives S(N), dN/dt = 0 is then one equation in N */
function steady(p, I) {
  const Nmax = p.Ntr + 1 / (p.Gamma * p.g0 * p.tau_p);
  const S = N => { const G = p.g0 * (N - p.Ntr); return p.Gamma * p.beta * p.FP * N / p.tau_sp / (1 / p.tau_p - p.Gamma * G); };
  const f = N => p.eta_i * I / (q * p.V) - N / p.tau_nr - p.FP * N / p.tau_sp - p.vs * p.SoverV * N - p.g0 * (N - p.Ntr) * S(N);
  let lo = 0, hi = Nmax * (1 - 1e-9); for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (f(m) > 0) lo = m; else hi = m; }
  const N = (lo + hi) / 2; return { N, S: S(N) };
}
const Ith = p => q * p.V * (p.Ntr + 1 / (p.Gamma * p.g0 * p.tau_p)) * (1 / p.tau_nr + p.FP / p.tau_sp + p.vs * p.SoverV) / p.eta_i;
const Pout = (p, I) => 0.4 * steady(p, I).S * p.V / p.tau_p * hv;   // W, with an illustrative 40 percent extraction into the waveguide

addLesson("pic", "li", {
level: "Core",
id: "pic-li-l1", title: "The III-V on silicon plasmonic nanolaser (Sci. Rep. 2015)", short: "1. The plasmonic nanolaser",
big: String.raw`Silicon cannot lase, so a laser on a silicon chip must be made of a III-V semiconductor such as GaAs. Growing GaAs directly on silicon creates threading dislocations, about one per square micrometre, that kill a normal laser. The idea in Li, Liu, Sorger and Sadana (2015) is to make the laser so small, a 250 nm square, that it almost always fits inside a defect-free patch. A metal island on top of a GaAs quantum well stack forms a plasmonic cavity whose light is squeezed below the diffraction limit. The paper simulates three ways to put the device on silicon, then uses rate equations to predict threshold, output power and a modulation bandwidth near 100 GHz. This lesson rebuilds each of those steps, with the rate equations solved live in the page.`,
bridge: String.raw`Everything here comes from the open access paper, N. Li, K. Liu, V. J. Sorger and D. K. Sadana, Scientific Reports 5, 14067 (2015), DOI 10.1038/srep14067, whose full text was checked. The rate equation parameters in the live cards are illustrative and were tuned so that the model thresholds land near the paper's values. The exact symbols of the paper's rate equations are in its Methods section and should be checked there before quoting.`,
cards: [

{s: "1. Three ways onto Si", t: "The problem it solves and three ways to put the laser on silicon",
intu: String.raw`Step through the three configurations the paper compares. In the two monolithic ones the III-V is grown straight on silicon, either as a blanket buffer or inside a hole in an oxide mask, which is the aspect-ratio trapping idea. In the hybrid one the stack is grown on a GaAs wafer and oxide bonded to silicon. Each cross-section shows where the dislocations live and why a 250 nm cavity can sit between them.`,
eq: String.raw`\[ P_{\mathrm{defect\ free}} = e^{-\rho_{\mathrm{TD}} A} \]<div class="eqnote">a Poisson estimate: the chance that a device of area A contains no threading dislocation</div>`,
sym: [[String.raw`\(\rho_{\mathrm{TD}}\)`, String.raw`threading dislocation density, about \(10^{8}\ \mathrm{cm^{-2}}\) for GaAs on Si, \(10^{6}\) with a graded buffer`], [String.raw`\(A\)`, String.raw`device area, \(250 \times 250\ \mathrm{nm^2} = 6.25 \times 10^{-10}\ \mathrm{cm^2}\)`]],
how: ["Dislocations land at random, so the count in an area A is Poisson with mean rho times A.", "The chance of zero counts is the exponential of minus the mean.", String.raw`At \(10^{8}\ \mathrm{cm^{-2}}\) the mean is 0.0625 and the yield is 93.9 percent, which the paper rounds to 94 percent. At \(10^{6}\) it is 99.94 percent.`],
say: String.raw`A 250 nm cavity is one sixteenth of the average defect-free area at a dislocation density of ten to the eight per square centimetre, so about 94 percent of devices are defect free.`,
num: "Paper (full text): blanket growth uses an Al0.6Ga0.4As buffer and an Al0.3Ga0.7As waveguide core. Selective growth sits in a SiO2 mask hole with a SiN waveguide. The hybrid device is oxide bonded on SiO2. Active region: GaAs 10 nm and Al0.3Ga0.7As 10 nm multiple quantum wells with a 20 nm p+ GaAs contact layer.",
r(fig, ctl) {
  const names = ["Monolithic, blanket buffer", "Monolithic, selective growth in a mask hole", "Hybrid, oxide bonded"];
  const draw = k => {
    let s = tx(340, 20, names[k], "middle", "th");
    const x0 = 60, w = 560, yb = 230;
    s += rc(x0, yb, w, 40, "var(--gray-bg)", "var(--p)") + tx(x0 + w / 2, yb + 25, "silicon wafer", "middle", "t");
    if (k === 0) { s += rc(x0, yb - 60, w, 60, "var(--purple-bg)", PP) + tx(x0 + 120, yb - 28, "AlGaAs buffer, dislocations threading up", "start"); for (let i = 0; i < 18; i++) { const x = x0 + 30 + i * 30; s += `<line x1="${x}" y1="${yb}" x2="${x + 8}" y2="${yb - 60}" stroke="${PC}" stroke-width="1.5"/>`; } s += rc(x0, yb - 90, w, 30, "var(--teal-bg)", PT) + tx(x0 + 10, yb - 70, "Al0.3Ga0.7As waveguide core"); }
    if (k === 1) { s += rc(x0, yb - 60, w, 60, "var(--sunk)", "var(--b)") + tx(x0 + 10, yb - 40, "SiO2 mask"); s += rc(x0 + 240, yb - 60, 100, 60, "var(--purple-bg)", PP); for (let i = 0; i < 3; i++) { const x = x0 + 255 + i * 35; s += `<line x1="${x}" y1="${yb}" x2="${x - 20}" y2="${yb - 35}" stroke="${PC}" stroke-width="1.5"/>`; } s += tx(x0 + 290, yb - 66, "dislocations trapped on the walls", "middle"); s += rc(x0 + 350, yb - 90, 210, 30, "var(--teal-bg)", PT) + tx(x0 + 360, yb - 70, "SiN waveguide"); }
    if (k === 2) { s += rc(x0, yb - 30, w, 30, "var(--sunk)", "var(--b)") + tx(x0 + 10, yb - 10, "SiO2 bonding layer"); s += rc(x0 + 240, yb - 90, 100, 60, "var(--purple-bg)", PP) + tx(x0 + 290, yb - 96, "III-V grown on GaAs, bonded", "middle"); s += rc(x0 + 350, yb - 60, 210, 30, "var(--teal-bg)", PT) + tx(x0 + 360, yb - 40, "waveguide"); }
    // the cavity
    const cx = k === 0 ? x0 + 250 : x0 + 265, cy = k === 0 ? yb - 120 : yb - 120;
    s += rc(cx, cy, 50, 30, "var(--blue-bg)", PB) + rc(cx, cy - 8, 50, 8, PG, PA) + tx(cx + 25, cy - 14, "250 nm cavity, Au on MQW", "middle");
    fig.innerHTML = svg(290, s);
  };
  PIC.stepper(ctl, 3, draw, ["blanket", "selective", "bonded"]);
}},

{s: "2. The cavity", t: "A metal island makes a dielectric-loaded plasmonic cavity",
intu: String.raw`A square of gold sits on the p+ GaAs contact above the quantum wells. Light near a metal surface can travel as a surface plasmon polariton, a wave bound to the interface. The dielectric stack under the metal loads that wave and confines it under the square, so the cavity is only 250 nm wide, smaller than half a wavelength in GaAs. Press Play to see the field oscillate. It peaks at the metal-dielectric interface and decays into both sides, which is why sidewall shape matters so little later on.`,
eq: String.raw`\[ V_{\mathrm{mode}} \approx 0.9 \left(\frac{\lambda}{2n}\right)^{3}, \qquad W = 250\ \mathrm{nm}, \quad \lambda \approx 850\ \mathrm{nm} \]`,
sym: [[String.raw`\(V_{\mathrm{mode}}\)`, "mode volume, the effective size of the light field"], [String.raw`\((\lambda/2n)^3\)`, "the diffraction limited volume in a material of index n"], [String.raw`\(W\)`, "side of the square metal island"]],
how: ["A surface plasmon polariton exists at a metal-dielectric interface because the metal has negative permittivity.", "Loading the interface with a high index dielectric slows the wave and pulls the field into the dielectric, the DLSPP mode.", "The edges of the metal square reflect the wave, so it forms a standing wave under the island.", "The paper finds a mode volume about 0.9 times the diffraction limit and a Purcell factor near 10."],
say: String.raw`The gold island on top of the quantum wells defines a dielectric-loaded surface plasmon cavity whose mode volume is about 0.9 times the diffraction limit.`,
num: "Paper (full text): Au island, with Ag, Al or Cu suggested as CMOS friendlier choices. Cavity width W = 250 nm. The optimum cavity height H is about 260 nm for waveguide coupling. The field is concentrated at the top metal-dielectric interface.",
r(fig, ctl) {
  ctl.innerHTML = sl("H", "Cavity height H (nm)", 150, 400, 10, 260);
  const draw = (t) => {
    const H = +$("H").value; $("Hv").textContent = H + " nm";
    const x0 = 140, yTop = 60, scale = 0.6, hpx = H * scale, w = 250 * scale * 1.6;
    let s = tx(340, 20, "cross-section, field drawn as colour (model picture)", "middle", "th");
    s += rc(x0 - 100, yTop + hpx, w + 200, 30, "var(--gray-bg)", "var(--p)") + tx(x0 + w / 2, yTop + hpx + 20, "waveguide and substrate", "middle");
    // field: standing wave in x, exponential decay in z from the metal interface
    const nx = 32, nz = 16;
    for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
      const xr = (i + 0.5) / nx, zr = (j + 0.5) / nz; const amp = Math.sin(Math.PI * xr) * Math.exp(-zr * 4) * Math.cos(2 * Math.PI * 0.8 * t);
      s += rc(x0 + xr * w - w / nx / 2, yTop + zr * hpx - hpx / nz / 2, w / nx + 0.5, hpx / nz + 0.5, PIC.bwr(amp));
    }
    s += rc(x0, yTop - 10, w, 10, PG, PA) + tx(x0 + w / 2, yTop - 16, "Au island (250 nm)", "middle");
    for (let k = 0; k < 4; k++) s += `<line x1="${x0}" y1="${yTop + 8 + k * 10}" x2="${x0 + w}" y2="${yTop + 8 + k * 10}" stroke="${PP}" stroke-width="1" stroke-dasharray="3 3"/>`;
    s += tx(x0 + w + 10, yTop + 30, "MQW, GaAs/AlGaAs 10 nm each") + tx(x0 + w + 10, yTop + 12, "p+ GaAs 20 nm") + tx(x0 - 10, yTop + hpx / 2, "H", "end", "t");
    s += tx(340, yTop + hpx + 54, "field strongest at the metal interface, red and blue swap sign as it oscillates", "middle");
    fig.innerHTML = svg(yTop + hpx + 70, s);
  };
  $("H").oninput = () => draw(0);
  PIC.player(ctl, draw);
}},

{s: "3. Q, V, Purcell", t: "Quality factor, mode volume and the Purcell factor",
intu: String.raw`Two numbers describe a cavity. \(Q\) says how many oscillations the light survives before it leaks out, and \(V\) says how tightly it is packed. Their ratio sets the Purcell factor, how much faster an emitter inside radiates compared with free space. A plasmonic cavity has a low \(Q\), a few hundred, because metal absorbs, but its tiny \(V\) still gives a Purcell factor near 10. Slide \(Q\) and \(V\) and watch the emission rate and the photon lifetime.`,
eq: String.raw`\[ F_{P} = \frac{3}{4\pi^{2}}\left(\frac{\lambda}{n}\right)^{3}\frac{Q}{V}, \qquad \tau_{p} = \frac{Q}{\omega} = \frac{Q\lambda}{2\pi c} \]`,
sym: [[String.raw`\(F_P\)`, "Purcell factor, enhancement of the spontaneous emission rate"], [String.raw`\(Q\)`, "quality factor, stored energy over energy lost per radian"], [String.raw`\(V\)`, "mode volume"], [String.raw`\(\tau_p\)`, "photon lifetime in the cavity"], [String.raw`\(n\)`, "refractive index of the cavity material, about 3.5 for GaAs"]],
how: [String.raw`Fermi's golden rule makes the emission rate proportional to the density of optical states at the emitter.`, String.raw`A cavity of linewidth \(\omega/Q\) and volume \(V\) concentrates those states, giving the ratio \(Q/V\) times \((\lambda/n)^3\) with the prefactor \(3/4\pi^2\).`, String.raw`With \(V = 0.9(\lambda/2n)^3\) the factor becomes \(F_P = 3Q/(4\pi^2 \cdot 0.9/8) \approx 0.84\,Q\), so \(F_P \approx 10\) corresponds to a \(Q\) near 12 by this formula. The paper's Q values are only shown in its Fig. 2c, so read them there.`],
say: String.raw`The Purcell factor is three over four pi squared times lambda over n cubed times Q over V, and a tiny plasmonic mode volume gives about ten even at a low Q.`,
num: "Paper (full text): mode volume about 0.9 times the diffraction limit, Purcell factor about 10, nearly the same for all three configurations and insensitive to the cavity height H. Photon lifetime at Q = 300 and 850 nm: 0.14 ps.",
r(fig, ctl) {
  ctl.innerHTML = sl("Q", "Quality factor Q", 5, 2000, 5, 300) + sl("Vr", "Mode volume V in units of (λ/2n)³", 0.1, 5, 0.1, 0.9);
  const u = () => {
    const Q = +$("Q").value, Vr = +$("Vr").value; $("Qv").textContent = Q; $("Vrv").textContent = Vr.toFixed(1);
    const FP = 3 / (4 * Math.PI * Math.PI) * 8 / Vr * Q; const taup = Q * 0.85e-6 / (2 * Math.PI * 3e8);
    const x0 = 60, w = 560, y0 = 40, h = 150;
    let s = PIC.yaxis(x0, y0, h, 0, 3, 3, "log10 F_P", v => v.toFixed(0)) + PIC.xaxis(x0, y0 + h, w, 0, 2000, 4, "Q", v => v.toFixed(0));
    for (const [vr, col, lab] of [[0.9, PB, "plasmonic, V = 0.9"], [3, PT, "dielectric, V = 3"]]) { const xs = range(5, 2000, 80), ys = xs.map(qq => Math.log10(3 / (4 * Math.PI * Math.PI) * 8 / vr * qq)); s += plot(x0, y0, w, h, xs, ys, 0, 2000, 0, 3, col, 2); s += tx(x0 + w - 4, y0 + h - (ys[79] / 3) * h - 6, lab, "end"); }
    const px = x0 + Q / 2000 * w, py = y0 + h - Math.min(3, Math.log10(FP)) / 3 * h; s += `<circle cx="${px}" cy="${py}" r="6" fill="${PC}"/>`;
    s += tx(340, 20, `F_P = ${FP.toFixed(1)}, photon lifetime ${(taup * 1e15).toFixed(0)} fs`, "middle", "th");
    fig.innerHTML = svg(y0 + h + 40, s);
  };
  $("Q").oninput = u; $("Vr").oninput = u; u();
}},

{s: "4. Coupling vs H", t: "Coupling into the waveguide depends on the cavity height",
intu: String.raw`A laser is useless unless its light gets into a waveguide. The paper sweeps the height H of the stack between the metal and the waveguide and finds a best value near 260 nm, where the evanescent tail of the plasmonic mode overlaps the waveguide mode without the waveguide pulling the mode apart. The bonded device, sitting on low index oxide, reaches about 60 percent. The monolithic ones reach about 35 percent. The curves here are a schematic model shaped to those numbers, not the paper's data.`,
eq: String.raw`\[ \eta_{c}(H) \approx \eta_{\max}\, \exp\!\left[-\frac{(H - H_{0})^{2}}{2 w_{H}^{2}}\right], \qquad H_{0} \approx 260\ \mathrm{nm} \]<div class="eqnote">schematic shape only</div>`,
sym: [[String.raw`\(\eta_c\)`, "fraction of cavity photons that end up in the waveguide mode"], [String.raw`\(H_0\)`, "best height, about 260 nm in the paper"], [String.raw`\(\eta_{\max}\)`, "about 0.60 bonded, about 0.35 monolithic"]],
how: ["Too thin a stack lets the waveguide perturb the cavity and spoil Q.", "Too thick a stack leaves no overlap between the two modes.", "In between the overlap peaks. The paper reports the peak near 260 nm and says Q and the Purcell factor barely change with H."],
say: String.raw`Waveguide coupling peaks at a cavity height near 260 nm, about 60 percent for the bonded device and about 35 percent for the monolithic ones.`,
num: "Paper (full text): coupling maximum at H about 260 nm. About 60 percent for the bonded device on SiO2 and about 35 percent for the two monolithic devices. The width of the peak here is a guess, so do not quote it.",
r(fig, ctl) {
  ctl.innerHTML = sl("Hc", "Cavity height H (nm)", 150, 400, 5, 260);
  const u = () => {
    const H = +$("Hc").value; $("Hcv").textContent = H + " nm";
    const x0 = 60, w = 560, y0 = 40, h = 160; const eta = (H, m) => m * Math.exp(-Math.pow(H - 260, 2) / (2 * 55 * 55));
    let s = PIC.yaxis(x0, y0, h, 0, 70, 7, "coupling (%)", v => v.toFixed(0)) + PIC.xaxis(x0, y0 + h, w, 150, 400, 5, "H (nm)", v => v.toFixed(0));
    const xs = range(150, 400, 100);
    s += plot(x0, y0, w, h, xs, xs.map(x => eta(x, 60)), 150, 400, 0, 70, PT, 2.5) + plot(x0, y0, w, h, xs, xs.map(x => eta(x, 35)), 150, 400, 0, 70, PC, 2.5);
    s += tx(x0 + w - 4, y0 + 12, "bonded (60 %)", "end") + tx(x0 + w - 4, y0 + h * 0.45, "monolithic (35 %)", "end");
    const X = x0 + (H - 150) / 250 * w; s += `<line x1="${X}" y1="${y0}" x2="${X}" y2="${y0 + h}" stroke="var(--p)" stroke-dasharray="4 3"/>`;
    s += tx(340, 20, `at H = ${H} nm: bonded ${eta(H, 60).toFixed(0)} %, monolithic ${eta(H, 35).toFixed(0)} % (schematic)`, "middle", "th");
    fig.innerHTML = svg(y0 + h + 40, s);
  };
  $("Hc").oninput = u; u();
}},

{s: "5. Rate equations", t: "Rate equations: carriers in, photons out, solved live",
intu: String.raw`Two coupled equations run every laser. The carrier density \(N\) rises with the injected current and falls by non-radiative loss, by spontaneous emission sped up by the Purcell factor, by surface recombination and by stimulated emission. The photon density \(S\) rises by stimulated emission and by the fraction \(\beta\) of spontaneous emission that lands in the lasing mode, and falls with the photon lifetime. Pick a configuration. The page solves the steady state at each current and draws the L-I curve. The kink at threshold is only a factor \(1/\beta\) in slope, so with \(\beta\) near one half it is barely visible. Drag the \(\beta\) slider down to 0.01 and the familiar sharp threshold appears.`,
eq: String.raw`\[ \frac{dN}{dt} = \frac{\eta_{i} I}{qV_{a}} - \frac{N}{\tau_{nr}} - F_{P}\frac{N}{\tau_{sp}} - v_{s}\frac{S_{a}}{V_{a}}N - G(N)\,S \]\[ \frac{dS}{dt} = \Gamma G(N)\,S - \frac{S}{\tau_{p}} + \Gamma\beta F_{P}\frac{N}{\tau_{sp}} \]<div class="eqref">general form. Check the paper's Methods for its exact symbols.</div>`,
sym: [[String.raw`\(N, S\)`, "carrier and photon densities in the active region"], [String.raw`\(\eta_i\)`, "injection efficiency"], [String.raw`\(V_a, S_a\)`, "active volume and its surface area"], [String.raw`\(\tau_{nr}, \tau_{sp}\)`, "non-radiative and spontaneous lifetimes"], [String.raw`\(v_s\)`, "surface recombination velocity"], [String.raw`\(G(N) = g_0 (N - N_{tr})\)`, "linear gain above transparency"], [String.raw`\(\Gamma, \beta, \tau_p\)`, "confinement factor, spontaneous emission factor, photon lifetime"]],
how: ["Set both time derivatives to zero for the steady state.", String.raw`The photon equation gives \(S\) in terms of \(N\). Put that into the carrier equation and solve the single equation for \(N\) by bisection. That is what the page does at each current.`, String.raw`Threshold is where the gain reaches the loss, \(\Gamma G(N_{th}) = 1/\tau_p\). Above it \(N\) clamps and every extra carrier becomes a photon.`, String.raw`The output power is \(S V_a h\nu / \tau_p\) times the fraction coupled out.`, String.raw`Below threshold the slope is \(\beta\) times the slope above it, so the jump at threshold is a factor \(1/\beta\). That is why high \(\beta\) nanolasers are called nearly thresholdless.`],
say: String.raw`The carrier equation balances injection against non-radiative, Purcell enhanced spontaneous, surface and stimulated losses, and the photon equation balances stimulated plus beta times spontaneous emission against the photon lifetime.`,
num: "Paper (full text): threshold currents about 2.0, 2.4 and 3.1 mA with beta 0.55, 0.48 and 0.32 for the bonded, selective and blanket devices. Selective device output about 400 µW at twice threshold and above 3 mW at ten times threshold. The model here uses an illustrative active volume of 1.2e-13 cm³, Purcell factor 10, Q of 400, 320 and 238 and a 40 percent extraction, which reproduce those values roughly.",
r(fig, ctl) {
  ctl.innerHTML = btns(CFG.map((c, i) => [i, c[0] + ", β = " + c[1]]), "cfg") + btns([["log", "log-log"], ["lin", "linear"]], "sc") + sl("Imax", "Current axis up to (mA)", 2, 30, 1, 8) + sl("lb", "log10 β of the highlighted curve", -3, 0, 0.01, Math.log10(0.55));
  let k = 0, sc = "log";
  const u = () => {
    pick(ctl, "cfg", k); pick(ctl, "sc", sc); const Imax = +$("Imax").value; $("Imaxv").textContent = Imax + " mA"; const beta = Math.pow(10, +$("lb").value); $("lbv").textContent = "β = " + beta.toFixed(3);
    const x0 = 70, w = 550, y0 = 40, h = 170; let s = "";
    const lg = sc === "log"; const Imin = lg ? 0.02 : 0.02;
    const xs = lg ? range(Math.log10(Imin), Math.log10(Imax), 25).map(v => Math.pow(10, v)) : range(Imin, Imax, 25);
    const curves = CFG.map((c, i) => { const p = params(i); if (i === k) p.beta = beta; const ys = xs.map(I => Pout(p, I * 1e-3) * 1e3); return { ys, p, i }; });
    const ymaxL = Math.max(0.1, ...curves.map(c => c.ys[24])) * 1.05, yminLog = -4, ymaxLog = Math.ceil(Math.log10(ymaxL));
    const X = I => lg ? Math.log10(I) : I, xmin = lg ? Math.log10(Imin) : 0, xmax = lg ? Math.log10(Imax) : Imax;
    const Yv = P => lg ? Math.log10(Math.max(P, 1e-5)) : P, ymin = lg ? yminLog : 0, ymax = lg ? ymaxLog : ymaxL;
    s += PIC.yaxis(x0, y0, h, ymin, ymax, 4, lg ? "log10 power (mW)" : "power out (mW, model)", v => v.toFixed(lg ? 0 : 2)) + PIC.xaxis(x0, y0 + h, w, xmin, xmax, 4, lg ? "log10 current (mA)" : "current (mA)", v => v.toFixed(1));
    curves.forEach(c => { s += plot(x0, y0, w, h, xs.map(X), c.ys.map(Yv), xmin, xmax, ymin, ymax, CFG[c.i][3], c.i === k ? 3 : 1.2, c.i === k ? "" : "4 3"); const it = Ith(c.p) * 1e3; const xx = x0 + (X(it) - xmin) / (xmax - xmin) * w; if (it < Imax && it > Imin) s += `<line x1="${xx}" y1="${y0 + h}" x2="${xx}" y2="${y0 + h - 12}" stroke="${CFG[c.i][3]}" stroke-width="2"/>`; });
    const p = params(k); p.beta = beta; const it = Ith(p) * 1e3;
    s += tx(340, 20, `${CFG[k][0]}: model threshold ${it.toFixed(2)} mA (ticks), ${(Pout(p, 2 * it * 1e-3) * 1e6).toFixed(0)} µW at 2 I_th, ${(Pout(p, 10 * it * 1e-3) * 1e3).toFixed(1)} mW at 10 I_th`, "middle", "th");
    fig.innerHTML = svg(y0 + h + 40, s);
  };
  ctl.querySelectorAll("button[data-cfg]").forEach(b => b.onclick = () => { k = +b.dataset.cfg; $("lb").value = Math.log10(CFG[k][1]); u(); });
  ctl.querySelectorAll("button[data-sc]").forEach(b => b.onclick = () => { sc = b.dataset.sc; u(); });
  $("Imax").oninput = u; $("lb").oninput = u; u();
}},

{s: "6. Surface recombination", t: "Surface recombination: the enemy of a small laser",
intu: String.raw`A 250 nm cavity is nearly all surface. Carriers that reach an unpassivated GaAs surface recombine without emitting, at a rate set by the surface recombination velocity \(v_s\) times the surface to volume ratio. Slide \(v_s\) from a regrown, nearly perfect surface up to a bare etched one and watch the threshold climb. The paper finds the effect negligible below 100 cm/s, small with dielectric passivation near 4500 cm/s, and severe near ten to the five.`,
eq: String.raw`\[ \frac{1}{\tau_{s}} = v_{s}\frac{S_{a}}{V_{a}}, \qquad I_{th} \propto \frac{1}{\tau_{nr}} + \frac{F_P}{\tau_{sp}} + v_{s}\frac{S_{a}}{V_{a}} \]`,
sym: [[String.raw`\(v_s\)`, "surface recombination velocity, cm/s"], [String.raw`\(S_a / V_a\)`, "surface to volume ratio, about 4 over 250 nm for the four side faces"], [String.raw`\(\tau_s\)`, "effective surface lifetime"]],
how: ["Surface recombination adds a loss term linear in N, like a shorter lifetime.", "For a cube of side L the four side faces give a surface to volume ratio of 4 over L.", String.raw`At \(v_s = 4500\ \mathrm{cm/s}\) and L = 250 nm the extra rate is \(7 \times 10^{8}\ \mathrm{s^{-1}}\), small next to the Purcell enhanced spontaneous rate of about \(10^{10}\ \mathrm{s^{-1}}\). At \(10^{5}\ \mathrm{cm/s}\) it is \(1.6 \times 10^{10}\), which doubles the threshold.`],
say: String.raw`Surface recombination acts like an extra lifetime of the cavity side over the recombination velocity, so a small cavity needs a passivated or regrown surface.`,
num: "Paper (full text): below 100 cm/s (achievable by regrowth) the effect is negligible. Dielectric passivation gives about 4500 cm/s and shifts the thresholds to 2.14, 2.57 and 3.34 mA. Near 1e5 cm/s the output degrades substantially.",
r(fig, ctl) {
  ctl.innerHTML = sl("lv", "log10 of v_s (cm/s)", 1, 5.3, 0.05, 3.65);
  const u = () => {
    const vs = Math.pow(10, +$("lv").value); $("lvv").textContent = vs < 1000 ? vs.toFixed(0) + " cm/s" : vs.toExponential(1) + " cm/s";
    const x0 = 60, w = 560, y0 = 40, h = 150; let s = "";
    const lvs = range(1, 5.3, 60), rows = CFG.map((c, i) => lvs.map(l => Ith(params(i, Math.pow(10, l))) * 1e3));
    s += PIC.yaxis(x0, y0, h, 0, 8, 4, "threshold (mA, model)", v => v.toFixed(0)) + PIC.xaxis(x0, y0 + h, w, 1, 5.3, 4, "log10 v_s (cm/s)", v => v.toFixed(1));
    rows.forEach((r, i) => s += plot(x0, y0, w, h, lvs, r, 1, 5.3, 0, 8, CFG[i][3], 2));
    const X = x0 + (+$("lv").value - 1) / 4.3 * w; s += `<line x1="${X}" y1="${y0}" x2="${X}" y2="${y0 + h}" stroke="var(--p)" stroke-dasharray="4 3"/>`;
    s += tx(340, 20, CFG.map((c, i) => `${c[0]} ${(Ith(params(i, vs)) * 1e3).toFixed(2)} mA`).join(",  "), "middle", "th");
    s += tx(x0 + (2 - 1) / 4.3 * w, y0 + h + 36, "regrowth", "middle") + tx(x0 + (3.65 - 1) / 4.3 * w, y0 + h + 36, "dielectric passivation", "middle") + tx(x0 + (5 - 1) / 4.3 * w, y0 + h + 36, "bare etched", "middle");
    fig.innerHTML = svg(y0 + h + 50, s);
  };
  $("lv").oninput = u; u();
}},

{s: "7. Bandwidth", t: "Modulation bandwidth: why a nanolaser can be fast",
intu: String.raw`When the current is wiggled, the photon number responds with a resonance called the relaxation oscillation, and the laser cannot follow signals much faster than that. Its frequency grows with the photon density and with one over the photon lifetime, both large in a tiny plasmonic cavity. Slide the bias current. The model follows the paper's trend: tens of gigahertz already at threshold and near 100 GHz at twice threshold. Below threshold the device works as a nano LED whose speed is set by the Purcell shortened lifetime.`,
eq: String.raw`\[ f_{r} = \frac{1}{2\pi}\sqrt{\frac{g_{0}\,S}{\tau_{p}}}, \qquad f_{3\mathrm{dB}} \approx 1.55\, f_{r} \]\[ \text{LED regime: } f_{3\mathrm{dB}} \approx \frac{1}{2\pi\tau_{\mathrm{eff}}}, \quad \frac{1}{\tau_{\mathrm{eff}}} = \frac{1}{\tau_{nr}} + \frac{F_P}{\tau_{sp}} \]`,
sym: [[String.raw`\(f_r\)`, "relaxation oscillation frequency"], [String.raw`\(g_0\)`, "differential gain, cm³/s in these units"], [String.raw`\(S\)`, "steady state photon density from card 5"], [String.raw`\(\tau_{\mathrm{eff}}\)`, "effective carrier lifetime below threshold"]],
how: ["Linearize the rate equations around the steady state for a small current wiggle.", String.raw`The two first order equations combine into a damped oscillator with resonance \(f_r\) set by the product of differential gain and photon density over the photon lifetime.`, String.raw`The 3 dB bandwidth is about 1.55 times \(f_r\) when damping is modest.`, "The Purcell factor shortens the carrier lifetime, which is what makes the nano LED fast as well."],
say: String.raw`The relaxation oscillation frequency is one over two pi times the square root of differential gain times photon density over photon lifetime, so a small cavity with a short photon lifetime modulates fast.`,
num: "Paper (full text): 3 dB bandwidth above 50 GHz at threshold and approaching 100 GHz at twice threshold. As a nano LED below threshold: 3 to 6 GHz at a tenth of threshold and 28 to 44 GHz at half of threshold. The model curve here uses the illustrative parameters of card 5.",
r(fig, ctl) {
  ctl.innerHTML = btns(CFG.map((c, i) => [i, c[0]]), "cfg") + sl("Ir", "Bias current I / I_th", 0.05, 3, 0.05, 1);
  let k = 0;
  const u = () => {
    pick(ctl, "cfg", k); const Ir = +$("Ir").value; $("Irv").textContent = Ir.toFixed(2);
    const p = params(k), it = Ith(p); const fr = I => 1.55 * Math.sqrt(p.g0 * steady(p, I).S / p.tau_p) / (2 * Math.PI) / 1e9;
    const x0 = 60, w = 560, y0 = 40, h = 150; const xs = range(0.05, 3, 40), ys = xs.map(r => fr(r * it));
    let s = PIC.yaxis(x0, y0, h, 0, 120, 4, "f_3dB (GHz, model)", v => v.toFixed(0)) + PIC.xaxis(x0, y0 + h, w, 0, 3, 6, "I / I_th", v => v.toFixed(1));
    s += plot(x0, y0, w, h, xs, ys, 0, 3, 0, 120, CFG[k][3], 2.5);
    const X = x0 + Ir / 3 * w, f = fr(Ir * it); s += `<circle cx="${X}" cy="${y0 + h - Math.min(120, f) / 120 * h}" r="6" fill="${PC}"/>`;
    s += tx(340, 20, `${CFG[k][0]}: at ${Ir.toFixed(2)} I_th the model gives ${f.toFixed(0)} GHz`, "middle", "th");
    fig.innerHTML = svg(y0 + h + 40, s);
  };
  ctl.querySelectorAll("button[data-cfg]").forEach(b => b.onclick = () => { k = +b.dataset.cfg; u(); });
  $("Ir").oninput = u; u();
}},

{s: "8. Tolerance and yield", t: "Fabrication tolerance, defect yield and the thermal budget",
intu: String.raw`Three practical checks close the paper. Because the field sits at the top metal interface, the sidewalls hardly matter: \(Q\) changes under 10 percent for sidewall angles up to 30 degrees and for roughness up to 2 nm RMS, so even wet etching would do. Dislocations land at random, so a 250 nm device is defect free about 94 percent of the time at ten to the eight per square centimetre. Slide the dislocation density and watch the dots and the yield. The thermal budget works because the CMOS front end is finished first and the III-V comes afterwards.`,
eq: String.raw`\[ Y = e^{-\rho_{\mathrm{TD}} A} \]\[ \frac{\Delta Q}{Q} \lt 10\,\% \ \text{for sidewall angle} \le 30^{\circ} \text{ and roughness} \le 2\ \mathrm{nm\ RMS} \]`,
sym: [[String.raw`\(Y\)`, "fraction of devices with no threading dislocation"], [String.raw`\(\rho_{\mathrm{TD}}\)`, "threading dislocation density"], [String.raw`\(A\)`, "device area"]],
how: ["Place dislocations at random with the chosen density over a few square micrometres and count how many 250 nm squares are hit.", "The expected clean fraction is the Poisson zero term.", "Thermal order: silicon CMOS front end up to about 1000 °C first, then III-V growth near 650 °C, then back end steps below about 400 °C."],
say: String.raw`The nanolaser tolerates 30 degree sidewalls and 2 nm roughness with under 10 percent change in Q, and about 94 percent of 250 nm devices are defect free at a dislocation density of ten to the eight.`,
num: "Paper (full text): 94 percent defect-free yield at 1e8 cm⁻² (the device is 1/16 of the mean defect-free area), above 99.9 percent at 1e6 cm⁻² (1/1600). Q changes under 10 percent for sidewall angles to 30 degrees and about 10 percent from 0 to 2 nm RMS roughness. CMOS front end first at up to about 1000 °C, III-V at about 650 °C, back end below about 400 °C.",
r(fig, ctl) {
  ctl.innerHTML = sl("lr", "log10 dislocation density (cm⁻²)", 6, 9, 0.1, 8) + sl("seed", "Random arrangement", 1, 20, 1, 3);
  const u = () => {
    const rho = Math.pow(10, +$("lr").value), seed = +$("seed").value; $("lrv").textContent = rho.toExponential(1); $("seedv").textContent = seed;
    const rng = C3.rng(seed * 7919); const L = 4; // um square shown
    const n = Math.round(rho * L * L * 1e-8); const pts = Array.from({ length: Math.min(n, 4000) }, () => [rng() * L, rng() * L]);
    const x0 = 40, y0 = 40, px = 280 / L; let s = rc(x0, y0, 280, 280, "var(--sunk)", "var(--b)");
    pts.forEach(p => s += `<circle cx="${(x0 + p[0] * px).toFixed(1)}" cy="${(y0 + p[1] * px).toFixed(1)}" r="1.6" fill="${PC}"/>`);
    let hit = 0, tot = 0; const d = 0.25; for (let i = 0; i < 16; i++) for (let j = 0; j < 16; j++) { const cx = i * d, cy = j * d; const h = pts.some(p => p[0] >= cx && p[0] < cx + d && p[1] >= cy && p[1] < cy + d); tot++; if (h) hit++; if ((i + j) % 3 === 0) s += rc(x0 + cx * px, y0 + cy * px, d * px, d * px, h ? "rgba(216,90,48,0.35)" : "rgba(29,158,117,0.35)"); }
    s += tx(x0 + 140, y0 + 300, "4 µm square, red dots are dislocations, tiles are 250 nm devices", "middle");
    const Y = Math.exp(-rho * 6.25e-10);
    s += tx(500, y0 + 20, "Poisson yield", "middle", "th") + tx(500, y0 + 50, `exp(-ρA) = ${(100 * Y).toFixed(2)} %`, "middle", "t") + tx(500, y0 + 80, `sampled: ${tot - hit} of ${tot} clean`, "middle") + tx(500, y0 + 100, `= ${(100 * (tot - hit) / tot).toFixed(1)} %`, "middle");
    s += tx(500, y0 + 150, "thermal budget", "middle", "th") + tx(500, y0 + 174, "CMOS front end ≈ 1000 °C", "middle") + tx(500, y0 + 194, "III-V growth ≈ 650 °C", "middle") + tx(500, y0 + 214, "back end < 400 °C", "middle");
    fig.innerHTML = svg(y0 + 320, s);
  };
  $("lr").oninput = u; $("seed").oninput = u; u();
}}
],
summary: String.raw`The 2015 nanolaser puts a 250 nm plasmonic cavity, a gold island over GaAs quantum wells, on silicon in three ways: blanket growth, selective growth in a mask hole, or oxide bonding. Being one sixteenth of the mean defect-free area, 94 percent of devices escape threading dislocations. FDTD gives a mode volume near 0.9 times the diffraction limit, a Purcell factor near 10 and waveguide coupling that peaks near 260 nm cavity height at 60 percent bonded and 35 percent monolithic. Rate equations predict thresholds of 2.0, 2.4 and 3.1 mA with beta 0.55, 0.48 and 0.32, milliwatt output at ten times threshold, and modulation bandwidths from 50 GHz at threshold to near 100 GHz. Surface passivation near 4500 cm/s costs little, sidewalls to 30 degrees cost under 10 percent of Q, and the III-V goes on after the CMOS front end.`,
sheet: [
[String.raw`\[ Y = e^{-\rho_{\mathrm{TD}} A} \]`, "Defect-free yield, 94 percent at 1e8 cm⁻² for a 250 nm device"],
[String.raw`\[ F_P = \frac{3}{4\pi^2}\left(\frac{\lambda}{n}\right)^3\frac{Q}{V} \]`, "Purcell factor, about 10 in the paper"],
[String.raw`\[ \tau_p = Q/\omega \]`, "Photon lifetime"],
[String.raw`\[ \frac{dN}{dt} = \frac{\eta_i I}{qV_a} - \frac{N}{\tau_{nr}} - F_P\frac{N}{\tau_{sp}} - v_s\frac{S_a}{V_a}N - G S \]`, "Carrier rate equation, general form"],
[String.raw`\[ \frac{dS}{dt} = \Gamma G S - \frac{S}{\tau_p} + \Gamma\beta F_P\frac{N}{\tau_{sp}} \]`, "Photon rate equation, general form"],
[String.raw`\[ \Gamma G(N_{th}) = 1/\tau_p \]`, "Threshold condition"],
[String.raw`\[ f_r = \frac{1}{2\pi}\sqrt{g_0 S/\tau_p} \]`, "Relaxation oscillation frequency"]],
consts: String.raw`Model parameters (illustrative): active volume \(1.2\times10^{-13}\ \mathrm{cm^3}\), \(\eta_i = 0.8\), \(\tau_{nr} = 2\) ns, \(\tau_{sp} = 1\) ns, \(F_P = 10\), \(g_0 = 3\times10^{-6}\ \mathrm{cm^3/s}\), \(N_{tr} = 1.5\times10^{18}\ \mathrm{cm^{-3}}\), \(\Gamma = 0.3\), Q = 400, 320, 238, extraction 40 percent, \(\lambda = 850\) nm.`,
sources: ["N. Li, K. Liu, V. J. Sorger and D. K. Sadana, Monolithic III-V on silicon plasmonic nanolaser structure for optical interconnects, Scientific Reports 5, 14067 (2015), DOI 10.1038/srep14067 (open access, full text checked)", "L. A. Coldren, S. W. Corzine and M. L. Mašanović, Diode Lasers and Photonic Integrated Circuits, 2nd ed., Wiley (2012), Ch. 2 and 5 (rate equations, relaxation oscillations)", "E. M. Purcell, Phys. Rev. 69, 681 (1946) (Purcell factor)"]
});
})();

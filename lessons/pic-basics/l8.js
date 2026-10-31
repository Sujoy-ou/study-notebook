(function () {
/* Part 1 Lesson 8: lasers on silicon. Rate equations solved live with PIC.rateStep and PIC.rateSteady. */
const PC = "#D85A30", PB = "#378ADD", PT = "#1D9E75", PP = "#7F77DD", PA = "#BA7517";
const tx = (x, y, t, a, cls) => `<text class="${cls || "ts"}" x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""}>${t}</text>`;
/* nanolaser parameters in the spirit of Li et al. 2015: 250 nm square cavity, 160 nm active height, lambda 850 nm */
const LAM = 0.85, NIDX = 3.5;
const PAR = () => ({ eta_i: 0.8, V: 1e-14, tau_nr: 1e-9, tau_sp: 1e-9, FP: 10, vs: 0, SoverV: 1.6e5, g0: 2e-6, Ntr: 1.5e18, Gamma: 0.5, tau_p: 4.5e-13, beta: 0.5 });
const hnu = PIC.h * PIC.c / (LAM * 1e-6);   // J

addLesson("pic", "basics", {
level: "Advanced",
id: "pic-basics-l8", title: "Lasers on silicon: why silicon cannot lase and what is bonded on top", short: "8. Lasers on silicon",
big: String.raw`Everything in the link so far could be made in silicon, except the light itself. Silicon has an indirect bandgap, so an electron at the bottom of its conduction band cannot drop to the top of the valence band without help from a lattice vibration, and that makes light emission hopelessly slow. The laser therefore comes from a III-V material, gallium arsenide or indium phosphide, which has a direct gap. It is bonded, printed or grown onto the silicon, or kept in a separate package and brought in by fiber. This lesson explains the bandgap picture, walks through the four integration routes, then solves the laser rate equations live. You will see how the spontaneous emission factor beta and the Purcell factor shape the threshold, which is exactly the physics of the nanolaser in Prof. Li's 2015 paper, treated in Part 3.`,
bridge: String.raw`The rate equations are written in the form of Li, Liu, Sorger and Sadana, Sci. Rep. 5, 14067 (2015), with a Purcell enhanced spontaneous emission term, a surface recombination term and the fraction beta into the lasing mode. The numerical parameters here are illustrative for a 250 nm cavity. The paper's own values, beta 0.32 to 0.55 and thresholds 2 to 3 mA, are quoted in the numbers. The threshold condition and slope efficiency are the standard forms (Coldren, Corzine and Mashanovitch, Diode Lasers and Photonic Integrated Circuits).`,
cards: [

{s: "1. Direct or indirect", t: "Why silicon cannot lase: the band picture",
intu: String.raw`Press the material buttons. In gallium arsenide and indium phosphide the lowest point of the conduction band sits directly above the highest point of the valence band in momentum. An electron can drop straight down and emit a photon. In silicon the conduction band minimum is far away in momentum. A photon carries almost no momentum, so the electron needs a phonon as well, a three body event that is thousands of times less likely. Play shows the transition attempt in each case.`,
eq: String.raw`\[ E_g^{\mathrm{Si}} = 1.12\ \mathrm{eV\ (indirect)}, \quad E_g^{\mathrm{GaAs}} = 1.42\ \mathrm{eV\ (direct)}, \quad E_g^{\mathrm{InP}} = 1.34\ \mathrm{eV\ (direct)} \]\[ \lambda_g = \frac{1.24}{E_g[\mathrm{eV}]}\ \mathrm{µm} \]`,
sym: [[String.raw`\(E_g\)`, "bandgap energy"], ["direct gap", "conduction band minimum and valence band maximum at the same crystal momentum"], ["indirect gap", "at different momenta, so emission needs a phonon"], [String.raw`\(\lambda_g\)`, "wavelength of the band edge emission"]],
how: ["A photon's momentum is tiny compared with the width of the Brillouin zone, so a radiative transition is vertical on the E versus k diagram.", "In silicon the vertical transition from the conduction band minimum lands in the gap. A phonon must supply the momentum.", "The radiative lifetime in silicon is milliseconds. In GaAs it is nanoseconds. Nonradiative processes win in silicon by a huge margin.", "Germanium is nearly direct and can be pushed direct with strain and tin, but III-V materials remain the practical laser source."],
say: String.raw`Silicon's indirect gap means light emission needs a phonon and is far too slow, so the laser must come from a direct gap III-V material.`,
num: "Radiative lifetime: Si about 1 ms, GaAs about 1 ns. Band edge wavelengths: Si 1.1 µm, GaAs 0.87 µm, InP 0.92 µm. InGaAsP and InGaAs alloys on InP reach 1.31 and 1.55 µm.",
r(fig, ctl) {
  ctl.innerHTML = btns([["si", "Silicon"], ["gaas", "GaAs"], ["inp", "InP"]], "m");
  let cur = "gaas"; ctl.querySelectorAll("button[data-m]").forEach(b => b.onclick = () => { cur = b.dataset.m; pick(ctl, "m", cur); }); pick(ctl, "m", cur);
  PIC.player(ctl, (tsec) => {
    const direct = cur !== "si"; const Eg = cur === "si" ? 1.12 : cur === "gaas" ? 1.42 : 1.34;
    const x0 = 80, w = 400, y0 = 30, h = 200; const cx = x0 + w / 2; const kmin = direct ? cx : x0 + w * 0.85;
    let s = tx(340, 20, `${cur === "si" ? "silicon, indirect" : cur === "gaas" ? "gallium arsenide, direct" : "indium phosphide, direct"} gap, ${Eg} eV`, "middle", "th");
    s += `<line x1="${x0}" x2="${x0 + w}" y1="${y0 + h}" y2="${y0 + h}" stroke="var(--p)" marker-end="url(#ar)"/>` + tx(x0 + w + 6, y0 + h + 4, "k") + `<line x1="${x0}" x2="${x0}" y1="${y0 + h}" y2="${y0}" stroke="var(--p)" marker-end="url(#ar)"/>` + tx(x0 - 6, y0 + 10, "E", "end");
    const ks = range(x0, x0 + w, 121); const yv = k => y0 + h - 40 - 40 * Math.exp(-Math.pow((k - cx) / 90, 2)); const yc = k => y0 + 40 + 60 * (1 - Math.exp(-Math.pow((k - kmin) / 80, 2))) + (direct ? 0 : 30 * Math.exp(-Math.pow((k - cx) / 60, 2)));
    let d1 = "", d2 = ""; ks.forEach((k, i) => { d1 += (i ? "L" : "M") + k.toFixed(1) + " " + yv(k).toFixed(1); d2 += (i ? "L" : "M") + k.toFixed(1) + " " + yc(k).toFixed(1); });
    s += `<path d="${d1}" fill="none" stroke="${PC}" stroke-width="2.5"/><path d="${d2}" fill="none" stroke="${PB}" stroke-width="2.5"/>` + tx(x0 + 10, yv(x0) + 16, "valence band") + tx(x0 + 10, yc(x0) - 8, "conduction band");
    // the electron: sits at the CB minimum, tries to drop
    const ph = (tsec * 0.7) % 1; const ex = kmin, eyTop = yc(kmin), eyBot = yv(kmin);
    if (direct) { const y = eyTop + (eyBot - eyTop) * Math.min(1, ph * 1.4); s += `<circle cx="${ex}" cy="${y.toFixed(1)}" r="7" fill="${PB}" stroke="#0C447C"/>`; if (ph > 0.7) s += `<path d="M${ex + 10} ${(eyTop + eyBot) / 2} q10 -8 20 0 t20 0 t20 0" fill="none" stroke="${PA}" stroke-width="2"/>` + tx(ex + 80, (eyTop + eyBot) / 2 + 4, "photon"); s += tx(cx, y0 + h + 30, "vertical drop: the electron emits a photon directly", "middle"); }
    else { const y = eyTop + (eyBot - eyTop) * Math.min(1, ph * 1.4); s += `<circle cx="${ex}" cy="${y.toFixed(1)}" r="7" fill="${PB}" stroke="#0C447C"/>`; s += `<line x1="${ex}" y1="${eyTop}" x2="${ex}" y2="${yv(ex)}" stroke="var(--b)" stroke-dasharray="3 3"/>` + `<line x1="${ex}" y1="${yv(ex) + 2}" x2="${cx}" y2="${yv(cx) + 2}" stroke="${PP}" stroke-width="2" stroke-dasharray="5 3" marker-end="url(#ar)"/>` + tx((ex + cx) / 2, yv(cx) + 20, "needs a phonon for the momentum", "middle"); s += tx(cx, y0 + h + 30, "the vertical drop lands inside the gap: no direct emission", "middle"); }
    fig.innerHTML = svg(y0 + h + 44, s);
  });
}},

{s: "2. Four routes", t: "Four ways to put a III-V laser on a silicon chip",
intu: String.raw`Step through the four routes. Wafer or die bonding glues a III-V film onto the processed silicon and the light is coupled down into the silicon waveguide. Micro transfer printing picks finished laser coupons with a rubber stamp and places them. Direct epitaxy grows the III-V on silicon despite the lattice mismatch, which quantum dot lasers tolerate. The external laser keeps the III-V in its own package and sends the light in through a fiber, which is what today's co-packaged optics does. Each route trades yield, cost and thermal budget differently. Part 2 covers the processes in detail.`,
eq: String.raw`\[ \text{mismatch: } \frac{a_{\mathrm{GaAs}} - a_{\mathrm{Si}}}{a_{\mathrm{Si}}} = 4.1\ \%, \quad \frac{a_{\mathrm{InP}} - a_{\mathrm{Si}}}{a_{\mathrm{Si}}} = 8.1\ \%, \qquad P_{\mathrm{defect\ free}} = e^{-\rho_{TD} A} \]`,
sym: [[String.raw`\(a\)`, "lattice constant"], [String.raw`\(\rho_{TD}\)`, "threading dislocation density, 1e6 to 1e8 per square centimetre for III-V grown on silicon"], [String.raw`\(A\)`, "device area"], [String.raw`\(P_{\mathrm{defect\ free}}\)`, "probability that a device contains no dislocation"]],
how: ["Bonding keeps the III-V on its own lattice matched substrate during growth, so the material is perfect. Alignment and the bonding interface are the challenge.", "Transfer printing does the same with finished devices, placing them only where needed, which saves expensive III-V area.", "Direct growth is cheapest in principle but the 4 to 8 percent mismatch creates dislocations. A tiny device, like the 250 nm nanolaser of Part 3, can fit between them.", "An external laser avoids all of this at the cost of coupling loss and a fiber, and lets a failed laser be replaced in the field."],
say: String.raw`A III-V laser reaches silicon by bonding, by transfer printing, by direct epitaxy, or by staying outside the chip and coupling in through a fiber.`,
num: "Dislocation density 1e8 per cm² and a 250 by 250 nm device: 94 percent defect free. 1e6 per cm²: 99.9 percent (Li et al. 2015). Broadcom's 2025 co-packaged switch uses external, field replaceable laser modules. Nvidia claims 4 times fewer lasers with its design.",
r(fig, ctl) {
  const routes = [["Wafer or die bonding", "III-V film bonded onto the oxide above the silicon waveguide. Light couples down through a taper.", PB],
    ["Micro transfer printing", "A stamp lifts finished laser coupons from their source wafer and prints them where needed.", PT],
    ["Direct epitaxy", "III-V grown on silicon. Dislocations from the mismatch, tolerated by quantum dot active regions or by tiny devices.", PP],
    ["External laser", "The laser stays in its own package. Light comes in by fiber. Used in 2025 co-packaged optics.", PA]];
  let step = 0;
  const draw = () => {
    const [name, desc, col] = routes[step];
    let s = tx(340, 20, name, "middle", "th");
    const x0 = 60, y0 = 50, w = 560;
    s += `<rect x="${x0}" y="${y0 + 90}" width="${w}" height="40" fill="var(--sunk)" stroke="var(--b)"/>` + tx(x0 + 8, y0 + 115, "silicon substrate and oxide") + `<rect x="${x0}" y="${y0 + 74}" width="${w}" height="16" fill="${PB}" opacity="0.6"/>` + tx(x0 + 8, y0 + 70, "silicon waveguide layer");
    if (step === 0) { s += `<rect x="${x0 + 150}" y="${y0 + 40}" width="260" height="30" fill="${col}" opacity="0.6" stroke="${col}"/>` + tx(x0 + 280, y0 + 60, "bonded III-V film", "middle", "t") + `<line x1="${x0 + 150}" x2="${x0 + 410}" y1="${y0 + 72}" y2="${y0 + 72}" stroke="${PC}" stroke-width="2" stroke-dasharray="3 2"/>` + tx(x0 + 420, y0 + 76, "bond interface, oxide or BCB"); for (let i = 0; i < 5; i++) s += `<line x1="${x0 + 200 + i * 40}" y1="${y0 + 56}" x2="${x0 + 220 + i * 40}" y2="${y0 + 82}" stroke="${PC}" stroke-width="2" marker-end="url(#ar)"/>`; }
    if (step === 1) { s += `<rect x="${x0 + 100}" y="${y0 - 10}" width="140" height="40" fill="#bbb" opacity="0.6"/>` + tx(x0 + 170, y0 + 15, "stamp", "middle", "t") + `<rect x="${x0 + 120}" y="${y0 + 30}" width="100" height="24" fill="${col}" opacity="0.7"/>` + tx(x0 + 170, y0 + 46, "coupon", "middle") + `<line x1="${x0 + 170}" y1="${y0 + 56}" x2="${x0 + 170}" y2="${y0 + 70}" stroke="${PC}" stroke-width="2" marker-end="url(#ar)"/>` + `<rect x="${x0 + 360}" y="${y0 + 50}" width="100" height="24" fill="${col}" opacity="0.7"/>` + tx(x0 + 410, y0 + 44, "printed laser", "middle"); }
    if (step === 2) { s += `<rect x="${x0 + 150}" y="${y0 + 30}" width="260" height="44" fill="${col}" opacity="0.5" stroke="${col}"/>` + tx(x0 + 280, y0 + 56, "III-V grown on silicon", "middle", "t"); for (let i = 0; i < 7; i++) s += `<line x1="${x0 + 170 + i * 38}" y1="${y0 + 74}" x2="${x0 + 180 + i * 38}" y2="${y0 + 34}" stroke="${PC}" stroke-width="1.5"/>`; s += tx(x0 + 420, y0 + 28, "threading dislocations") + `<rect x="${x0 + 240}" y="${y0 + 44}" width="12" height="12" fill="${PT}"/>` + tx(x0 + 258, y0 + 40, "a 250 nm device fits between them"); }
    if (step === 3) { s += `<rect x="${x0 + 420}" y="${y0 + 10}" width="130" height="50" fill="${col}" opacity="0.5" stroke="${col}"/>` + tx(x0 + 485, y0 + 40, "laser module", "middle", "t") + `<path d="M${x0 + 420} ${y0 + 35} C ${x0 + 300} ${y0 + 35}, ${x0 + 300} ${y0 + 82}, ${x0 + 200} ${y0 + 82}" fill="none" stroke="${PA}" stroke-width="4"/>` + tx(x0 + 300, y0 + 30, "fiber", "middle") + tx(x0 + 190, y0 + 100, "edge coupler on the chip", "end"); }
    s += `<rect x="${x0}" y="${y0 + 142}" width="${w}" height="50" rx="6" fill="var(--panel)" stroke="var(--line)"/>`;
    const words = desc.split(" "); let line = "", ly = y0 + 162, out = ""; for (const wd of words) { if ((line + " " + wd).length > 90) { out += tx(x0 + 10, ly, line); ly += 17; line = wd; } else line = line ? line + " " + wd : wd; } out += tx(x0 + 10, ly, line);
    fig.innerHTML = svg(y0 + 205, s + out);
  };
  PIC.stepper(ctl, routes.length, k => { step = k; draw(); }, routes.map(r => r[0]));
}},

{s: "3. Rate equations", t: "The laser rate equations, switched on in real time",
intu: String.raw`Two coupled equations run a laser. One counts carriers: injected by the current, lost to nonradiative recombination, to spontaneous emission sped up by the Purcell factor, to surface recombination, and to stimulated emission. The other counts photons in the lasing mode: gained by stimulated emission, lost through the cavity, and fed a fraction beta of the spontaneous emission. Press Play to switch the current on and watch both densities settle. Above threshold the carriers clamp and the photons take off. Drag the current to cross the threshold.`,
eq: String.raw`\[ \frac{dN}{dt} = \frac{\eta_i I}{qV_a} - \frac{N}{\tau_{nr}} - F_P\frac{N}{\tau_{sp}} - \frac{v_s S_a}{V_a}N - G(N)S \]\[ \frac{dS}{dt} = \Gamma G(N)S - \frac{S}{\tau_p} + \Gamma\beta F_P\frac{N}{\tau_{sp}}, \qquad G(N) = g_0 (N - N_{tr}) \]<div class="eqref">form of Li et al. 2015, Sci. Rep. 5, 14067</div>`,
sym: [[String.raw`\(N, S\)`, "carrier and photon densities in the active region"], [String.raw`\(\eta_i, I, V_a\)`, "injection efficiency, current, active volume"], [String.raw`\(\tau_{nr}, \tau_{sp}\)`, "nonradiative and spontaneous lifetimes"], [String.raw`\(F_P\)`, "Purcell factor, speeds up spontaneous emission"], [String.raw`\(v_s S_a/V_a\)`, "surface recombination velocity times surface to volume ratio"], [String.raw`\(G, g_0, N_{tr}\)`, "gain rate, differential gain, transparency density"], [String.raw`\(\Gamma, \tau_p, \beta\)`, "confinement factor, photon lifetime, fraction of spontaneous emission into the mode"]],
how: ["Count every way a carrier can enter or leave the active region, per unit volume per second.", "Count every way a photon can enter or leave the lasing mode. Stimulated emission appears in both with opposite signs.", String.raw`The photon lifetime is \(\tau_p = Q/\omega\), the cavity Q over the angular frequency.`, "The page integrates the pair with a fourth order Runge-Kutta step, exactly as a laser simulation program would."],
say: String.raw`The rate equations balance carriers and photons, and the Purcell factor, the surface recombination and beta are the three terms that make a nanolaser different from a big one.`,
num: "Illustrative cavity: active volume 1e-14 cm³ (250 by 250 by 160 nm), photon lifetime 0.45 ps (cavity Q about 1000 at 850 nm), Purcell factor 10 (limited by the emitter linewidth, see card 6), beta 0.5. These are teaching values. Li et al. 2015 report thresholds of 2 to 3 mA for their full structures, which include surface recombination and a lower Q plasmonic cavity.",
r(fig, ctl) {
  ctl.innerHTML = sl("I", "Current (µA)", 5, 300, 5, 120) + sl("beta", "β", 0.05, 1, 0.05, 0.5);
  PIC.player(ctl, (tsec) => {
    const I = +$("I").value * 1e-6, beta = +$("beta").value; $("Iv").textContent = (I * 1e6).toFixed(0) + " µA"; $("betav").textContent = beta.toFixed(2);
    const p = Object.assign(PAR(), { I, beta }); const dt = 2e-13; const T = 2e-9; const n = 400; const per = Math.round(T / n / dt);
    let N = 0, S = 0; const Ns = [], Ss = []; const tOn = (tsec * 0.5) % 1.2; const upto = Math.min(n, Math.floor(tOn / 1.0 * n));
    for (let i = 0; i < n; i++) { for (let j = 0; j < per; j++) [N, S] = PIC.rateStep(N, S, p, dt); Ns.push(N); Ss.push(S); }
    const ts = range(0, T * 1e9, n); const x0 = 60, w = 260, y0 = 36, h = 160;
    let s = C3.frame(x0, y0, w, h, 0, 2, 0, 6, [0, 0.5, 1, 1.5, 2], [0, 2, 4, 6], "time (ns)", "N (1e18 cm⁻³)", v => v, v => v);
    s += plot(x0, y0, w, h, ts.slice(0, upto), Ns.slice(0, upto).map(v => v / 1e18), 0, 2, 0, 6, PB, 2.5);
    const x1 = 400; const Smax = Math.max(1e14, ...Ss); const ex = Math.floor(Math.log10(Smax)); const Sm = Math.pow(10, ex + 1);
    s += C3.frame(x1, y0, w - 20, h, 0, 2, 0, Sm / Math.pow(10, ex), [0, 0.5, 1, 1.5, 2], [0, 5, 10], "time (ns)", `S (1e${ex} cm⁻³)`, v => v, v => v);
    s += plot(x1, y0, w - 20, h, ts.slice(0, upto), Ss.slice(0, upto).map(v => v / Math.pow(10, ex)), 0, 2, 0, 10, PC, 2.5);
    s += tx(340, 20, `current switched on at t = 0. Final N = ${(N / 1e18).toFixed(2)}e18, S = ${S.toExponential(2)} cm⁻³`, "middle", "th");
    fig.innerHTML = svg(y0 + h + 40, s);
  });
}},

{s: "4. L-I curve and β", t: "The light versus current curve: how β softens the threshold",
intu: String.raw`Sweep the current and record the steady state photon number. Below threshold only spontaneous emission feeds the mode, a fraction beta of it. Above threshold stimulated emission takes over and the output climbs steeply. The kink between the two is the threshold. Drag beta. For a big laser beta is a hundred thousandth and the kink is sharp. For a nanolaser beta is a half, the spontaneous emission alone already lights the mode strongly, and the kink nearly disappears. Li et al. 2015 computed exactly these curves for their three cavity designs.`,
eq: String.raw`\[ S_{\mathrm{below}} \approx \frac{\Gamma\beta F_P\tau_p}{\tau_{sp}}N, \qquad S_{\mathrm{above}} \approx \frac{\eta_i \tau_p}{qV_a}\,(I - I_{th}), \qquad \text{kink height} \propto \frac{1}{\beta} \]`,
sym: [[String.raw`\(S_{\mathrm{below}}\)`, "photon density from spontaneous emission into the mode, below threshold"], [String.raw`\(I_{th}\)`, "threshold current"], ["kink", "the jump in slope at threshold, which shrinks as beta grows"]],
how: [String.raw`Set the time derivatives to zero. Below threshold \(G S\) is negligible and \(S\) follows \(N\) linearly through \(\beta\).`, "Above threshold the gain clamps at the loss, N stops rising, and every extra injected carrier becomes a photon in the mode.", "On a logarithmic plot the two branches differ by about 1 over beta, which is the classic way to read beta from a measured curve.", "As beta approaches 1 the laser is called thresholdless, though a gain clamping transition still exists."],
say: String.raw`The light current curve has a kink at threshold whose height scales as one over beta, so a nanolaser with beta near one half has almost no visible threshold.`,
num: "Li et al. 2015: β = 0.55 (bonded), 0.48 (selective growth), 0.32 (blanket growth), with thresholds 2.0, 2.4 and 3.1 mA. Output about 400 µW at twice threshold for the selective device.",
r(fig, ctl) {
  ctl.innerHTML = sl("beta2", "β", 0.001, 1, 0.001, 0.5) + sl("FP", "Purcell factor", 1, 30, 1, 10);
  const lIs = range(0, 3.5, 36), Is = lIs.map(v => Math.pow(10, v));   // 1 uA to 3 mA
  const u = () => {
    const beta = +$("beta2").value, FP = +$("FP").value; $("beta2v").textContent = beta.toFixed(3); $("FPv").textContent = FP;
    const p = Object.assign(PAR(), { beta, FP });
    const Ss = Is.map(I => PIC.rateSteady(p, I * 1e-6, 6000).S);
    const Nth = p.Ntr + 1 / (p.Gamma * p.g0 * p.tau_p), Ith = PIC.q * p.V / p.eta_i * Nth * (1 / p.tau_nr + p.FP / p.tau_sp) * 1e6;   // uA
    const x0 = 60, w = 260, y0 = 36, h = 160;
    const Ilin = Is.filter(I => I <= 3 * Ith), Slin = Ss.slice(0, Ilin.length); const Sm = Math.max(...Slin);
    let s = C3.frame(x0, y0, w, h, 0, 3 * Ith, 0, 1, [0, Ith, 2 * Ith, 3 * Ith], [0, 0.5, 1], "current (µA)", "S (normalized)", v => v.toFixed(0), v => v.toFixed(1));
    s += plot(x0, y0, w, h, Ilin, Slin.map(v => v / Sm), 0, 3 * Ith, 0, 1, PB, 2.5) + `<line x1="${C3.X(x0, w, 0, 3 * Ith)(Ith)}" x2="${C3.X(x0, w, 0, 3 * Ith)(Ith)}" y1="${y0}" y2="${y0 + h}" stroke="${PC}" stroke-dasharray="4 3"/>` + tx(C3.X(x0, w, 0, 3 * Ith)(Ith) + 4, y0 + 14, "I_th");
    const x1 = 400; s += C3.frame(x1, y0, w - 20, h, 0, 3.5, 10, 18, [0, 1, 2, 3], [10, 12, 14, 16, 18], "log10 current (µA)", "log10 S (cm⁻³)", v => v, v => v);
    s += plot(x1, y0, w - 20, h, lIs, Ss.map(v => Math.log10(Math.max(v, 1e10))), 0, 3.5, 10, 18, PC, 2.5) + `<line x1="${C3.X(x1, w - 20, 0, 3.5)(Math.log10(Ith))}" x2="${C3.X(x1, w - 20, 0, 3.5)(Math.log10(Ith))}" y1="${y0}" y2="${y0 + h}" stroke="${PC}" stroke-dasharray="4 3"/>`;
    const n = Is.length - 1, kink = (Ss[n] / Is[n]) / (Ss[2] / Is[2]);
    s += tx(340, 20, `gain clamps at I_th ≈ ${Ith.toFixed(0)} µA. Jump in S/I from bottom to top: ${kink.toFixed(0)}, compare 1/β = ${(1 / beta).toFixed(0)}`, "middle", "th");
    fig.innerHTML = svg(y0 + h + 40, s);
  };
  $("beta2").oninput = u; $("FP").oninput = u; u();
}},

{s: "5. Threshold condition", t: "Threshold: gain must pay for internal and mirror loss",
intu: String.raw`A laser turns on when one round trip of the cavity gives back as much light as it took. The material gain, weighted by how much of the mode sits in the gain region, must equal the internal loss plus the mirror loss. Short cavities with weak mirrors need more gain. Drag the length and the mirror reflectivity. For a nanolaser the mirror loss is huge, which is why it needs a high Q cavity and high gain material.`,
eq: String.raw`\[ \Gamma g_{th} = \alpha_i + \alpha_m, \qquad \alpha_m = \frac{1}{2L}\ln\!\frac{1}{R_1 R_2} \]`,
sym: [[String.raw`\(g_{th}\)`, "threshold material gain per centimetre"], [String.raw`\(\Gamma\)`, "confinement factor of the mode in the gain region"], [String.raw`\(\alpha_i\)`, "internal loss per centimetre, absorption and scattering"], [String.raw`\(\alpha_m\)`, "mirror loss spread over the length"], [String.raw`\(R_1, R_2\)`, "power reflectivities of the two mirrors"]],
how: ["After one round trip the field is multiplied by the gain exponential, the loss exponential and the two mirror reflectivities.", "Set that product to one and take the logarithm.", "Divide by twice the length to express the mirror term as a loss per unit length.", String.raw`Equivalently \(\Gamma g_{th} = 1/(v_g \tau_p)\): the gain must refill the cavity once per photon lifetime.`],
say: String.raw`At threshold the confined gain equals the internal loss plus the mirror loss, one over two L times log of one over R1 R2.`,
num: "L = 300 µm, R = 0.32 cleaved facets, αi = 10 per cm: αm = 38 per cm, threshold gain with Γ = 0.3 is 160 per cm. A 250 nm nanolaser with Q = 1000: effective loss near 2000 per cm, needing a quantum well gain of thousands per cm.",
r(fig, ctl) {
  ctl.innerHTML = sl("L", "Cavity length (µm)", 1, 1000, 1, 300) + sl("R", "Mirror reflectivity R₁ = R₂", 0.05, 0.99, 0.01, 0.32) + sl("ai", "Internal loss (cm⁻¹)", 0, 50, 1, 10) + sl("G", "Confinement Γ", 0.05, 1, 0.05, 0.3);
  const u = () => {
    const L = +$("L").value, R = +$("R").value, ai = +$("ai").value, G = +$("G").value; $("Lv").textContent = L + " µm"; $("Rv").textContent = R.toFixed(2); $("aiv").textContent = ai + " cm⁻¹"; $("Gv").textContent = G.toFixed(2);
    const am = l => 1 / (2 * l * 1e-4) * Math.log(1 / (R * R)); const gth = (ai + am(L)) / G;
    const x0 = 60, w = 560, y0 = 36, h = 150; const Ls = range(0, 3, 121);   // log10 um
    let s = C3.frame(x0, y0, w, h, 0, 3, 0, 4, [0, 1, 2, 3], [0, 1, 2, 3, 4], "log10 cavity length (µm)", "log10 threshold gain (cm⁻¹)", v => v, v => v);
    s += plot(x0, y0, w, h, Ls, Ls.map(l => Math.log10((ai + am(Math.pow(10, l))) / G)), 0, 3, 0, 4, PB, 2.5) + `<circle cx="${C3.X(x0, w, 0, 3)(Math.log10(L))}" cy="${C3.Y(y0, h, 0, 4)(Math.min(4, Math.log10(gth)))}" r="6" fill="${PC}"/>`;
    s += tx(340, 20, `α_m = ${am(L).toFixed(1)} cm⁻¹, threshold gain ${gth.toFixed(0)} cm⁻¹`, "middle", "th");
    fig.innerHTML = svg(y0 + h + 40, s);
  };
  ["L", "R", "ai", "G"].forEach(i => $(i).oninput = u); u();
}},

{s: "6. Purcell factor", t: "The Purcell factor: a small cavity speeds up emission",
intu: String.raw`Put an emitter in a cavity whose mode volume is near the diffraction limit and the density of optical states at the resonance rises. The emitter radiates faster, by the Purcell factor, which grows with Q and shrinks with volume. There is a catch at room temperature: a quantum well emits over a band about 30 nm wide, far broader than a good cavity line, so the overlap of the two lines is limited by the broader one. The effective Q is set by whichever line is broader, and for a semiconductor gain medium that is usually the emitter. Drag the cavity Q, the emitter linewidth and the volume. A huge cavity Q buys nothing once the emitter is the limit, which is why plasmonic nanolasers with low Q still reach a Purcell factor near 10.`,
eq: String.raw`\[ F_P = \frac{3}{4\pi^2}\left(\frac{\lambda}{n}\right)^{3}\frac{Q_{\mathrm{eff}}}{V}, \qquad \frac{1}{Q_{\mathrm{eff}}} = \frac{1}{Q_c} + \frac{1}{Q_{\mathrm{em}}}, \qquad Q_{\mathrm{em}} = \frac{\lambda}{\Delta\lambda_{\mathrm{em}}} \]\[ \beta \approx \frac{F_P}{F_P + F_{\mathrm{other}}} \]`,
sym: [[String.raw`\(Q_c\)`, "quality factor of the cavity mode"], [String.raw`\(Q_{\mathrm{em}}\)`, "emitter quality factor, wavelength over the emission linewidth, about 30 for a room temperature quantum well"], [String.raw`\(Q_{\mathrm{eff}}\)`, "effective Q, dominated by the broader of the two lines"], [String.raw`\(V\)`, "mode volume, quoted in units of the cubic half wavelength in the material"], [String.raw`\(F_{\mathrm{other}}\)`, "emission rate into all other modes relative to free space"]],
how: ["Fermi's golden rule makes the emission rate proportional to the density of states at the emitter.", "A cavity concentrates one state into a narrow linewidth, omega over Q, and a small volume. The ratio to the free space density gives the Purcell formula.", "If the emitter line is broader than the cavity line, the overlap of the two Lorentzians replaces Q by the effective Q.", "Beta is the mode's share of the total emission, so Purcell enhancement of the lasing mode pushes beta toward one."],
say: String.raw`The Purcell factor is three over four pi squared times the cubed wavelength in the material times the effective Q over V, and at room temperature the emitter linewidth usually sets that effective Q.`,
num: String.raw`At \(V = 0.9\,(\lambda/2n)^3\), the formula gives \(F_P = 0.68\,Q_{\mathrm{eff}}\). A 30 nm quantum well line at 850 nm gives \(Q_{\mathrm{em}} \approx 28\), so with a cavity Q of 30 the effective Q is about 15 and \(F_P \approx 10\), close to the value Li et al. 2015 report for their plasmonic cavity.`,
r(fig, ctl) {
  ctl.innerHTML = sl("Qc", "Cavity Q", 5, 3000, 5, 30) + sl("dl", "Emitter linewidth (nm)", 0.1, 60, 0.1, 30) + sl("Vn", "Mode volume (units of (λ/2n)³)", 0.3, 50, 0.1, 0.9) + sl("Fo", "Emission into other modes", 0.1, 5, 0.1, 1);
  const FPof = (Qe, Vn) => 3 / (4 * Math.PI * Math.PI) * Math.pow(LAM / NIDX, 3) * Qe / (Vn * Math.pow(LAM / (2 * NIDX), 3));
  const u = () => {
    const Qc = +$("Qc").value, dl = +$("dl").value, Vn = +$("Vn").value, Fo = +$("Fo").value; $("Qcv").textContent = Qc; $("dlv").textContent = dl.toFixed(1) + " nm"; $("Vnv").textContent = Vn.toFixed(1); $("Fov").textContent = Fo.toFixed(1);
    const Qem = LAM * 1000 / dl, Qe = 1 / (1 / Qc + 1 / Qem), FP = FPof(Qe, Vn), beta = FP / (FP + Fo);
    const x0 = 60, w = 560, y0 = 36, h = 150; const Qs = range(0.7, 3.5, 120);
    let s = C3.frame(x0, y0, w, h, 0.7, 3.5, -1, 3, [1, 2, 3], [-1, 0, 1, 2, 3], "log10 cavity Q", "log10 Purcell factor", v => v, v => v);
    s += plot(x0, y0, w, h, Qs, Qs.map(q => Math.log10(FPof(Math.pow(10, q), Vn))), 0.7, 3.5, -1, 3, "var(--b)", 1.5, "4 3") + plot(x0, y0, w, h, Qs, Qs.map(q => Math.log10(FPof(1 / (1 / Math.pow(10, q) + 1 / Qem), Vn))), 0.7, 3.5, -1, 3, PB, 2.5);
    s += C3.legend(x0 + 10, y0 + 16, [["narrow emitter", "var(--b)", "4 3"], ["with this emitter linewidth", PB]]) + `<circle cx="${C3.X(x0, w, 0.7, 3.5)(Math.log10(Qc))}" cy="${C3.Y(y0, h, -1, 3)(Math.max(-1, Math.min(3, Math.log10(FP))))}" r="6" fill="${PC}"/>`;
    s += tx(340, 20, `Q_em = ${Qem.toFixed(0)}, Q_eff = ${Qe.toFixed(1)}, F_P = ${FP.toFixed(1)}, β ≈ ${beta.toFixed(2)}`, "middle", "th");
    fig.innerHTML = svg(y0 + h + 40, s);
  };
  ["Qc", "dl", "Vn", "Fo"].forEach(i => $(i).oninput = u); u();
}},

{s: "7. Slope efficiency", t: "Above threshold: watts per ampere",
intu: String.raw`Once the laser is on, each extra electron that reaches the active region gives one photon in the mode, and the fraction that escapes through the mirrors becomes output power. The slope of the output versus current is the photon energy over the electron charge times the differential efficiency. Drag the efficiency and the wavelength. At 1550 nm the photon energy is 0.8 eV, so a perfect laser gives 0.8 W per A. Real lasers on silicon give 0.1 to 0.3 W per A, and the wall plug efficiency, output over electrical input, is typically 10 to 30 percent.`,
eq: String.raw`\[ P_{\mathrm{out}} = \eta_d\,\frac{h\nu}{q}\,(I - I_{th}), \qquad \eta_d = \eta_i\,\frac{\alpha_m}{\alpha_i + \alpha_m} \]`,
sym: [[String.raw`\(\eta_d\)`, "differential quantum efficiency, photons out per electron above threshold"], [String.raw`\(h\nu/q\)`, "photon energy in volts, 1.24 over the wavelength in micrometres"], [String.raw`\(\eta_i\)`, "injection efficiency"], [String.raw`\(\alpha_m/(\alpha_i + \alpha_m)\)`, "fraction of the photons that leave through the mirrors rather than being absorbed"]],
how: ["Above threshold the carrier density is clamped, so every extra injected carrier is converted to a stimulated photon.", "Of those photons, the mirror loss fraction escapes and the internal loss fraction is absorbed.", "Multiply by the photon energy to get power. The slope is independent of the current."],
say: String.raw`The slope efficiency is the differential quantum efficiency times the photon energy over the electron charge, and the differential efficiency is the mirror loss share of the total loss.`,
num: "λ = 1550 nm: hν/q = 0.80 V. ηd = 0.3: 0.24 W/A, so 10 mA above threshold gives 2.4 mW. λ = 850 nm: 1.46 V per photon.",
r(fig, ctl) {
  ctl.innerHTML = sl("ed", "Differential efficiency ηd", 0.05, 1, 0.05, 0.3) + sl("lam", "Wavelength (nm)", 800, 1600, 10, 1550) + sl("Ith", "Threshold (mA)", 1, 30, 1, 10);
  const u = () => {
    const ed = +$("ed").value, lam = +$("lam").value / 1000, Ith = +$("Ith").value; $("edv").textContent = ed.toFixed(2); $("lamv").textContent = (lam * 1000).toFixed(0) + " nm"; $("Ithv").textContent = Ith + " mA";
    const slope = ed * 1.23984 / lam;   // W/A
    const x0 = 60, w = 560, y0 = 36, h = 150; const Is = range(0, 60, 121);
    let s = C3.frame(x0, y0, w, h, 0, 60, 0, 40, [0, 20, 40, 60], [0, 10, 20, 30, 40], "current (mA)", "output (mW)", v => v, v => v);
    s += plot(x0, y0, w, h, Is, Is.map(I => Math.max(0, slope * (I - Ith))), 0, 60, 0, 40, PB, 2.5);
    s += tx(340, 20, `slope ${slope.toFixed(2)} W/A, ${(slope * 10).toFixed(1)} mW at ${Ith + 10} mA, wall plug about ${(100 * slope * 10 / ((Ith + 10) * 1.5)).toFixed(0)} % at 1.5 V`, "middle", "th");
    fig.innerHTML = svg(y0 + h + 40, s);
  };
  ["ed", "lam", "Ith"].forEach(i => $(i).oninput = u); u();
}}
],
summary: String.raw`Silicon cannot lase because its indirect gap makes radiative recombination need a phonon, so the laser is a direct gap III-V material brought onto silicon by bonding, transfer printing or direct epitaxy, or kept outside and coupled in by fiber. The laser rate equations balance carriers and photons. In a nanolaser the Purcell factor speeds up spontaneous emission, surface recombination drains carriers, and the fraction beta into the lasing mode can reach one half, which erases the visible threshold kink. Threshold needs the confined gain to equal internal plus mirror loss. Above threshold the output rises at the differential efficiency times the photon energy over the electron charge.`,
sheet: [
[String.raw`\[ \lambda_g = 1.24/E_g[\mathrm{eV}]\ \mathrm{µm} \]`, "Band edge wavelength"],
[String.raw`\[ \frac{dN}{dt} = \frac{\eta_i I}{qV_a} - \frac{N}{\tau_{nr}} - F_P\frac{N}{\tau_{sp}} - \frac{v_sS_a}{V_a}N - G(N)S \]`, "Carrier rate equation (Li et al. 2015 form)"],
[String.raw`\[ \frac{dS}{dt} = \Gamma G(N)S - \frac{S}{\tau_p} + \Gamma\beta F_P\frac{N}{\tau_{sp}}, \quad \tau_p = \frac{Q}{\omega} \]`, "Photon rate equation"],
[String.raw`\[ \Gamma g_{th} = \alpha_i + \alpha_m, \quad \alpha_m = \frac{1}{2L}\ln\frac{1}{R_1R_2} \]`, "Threshold condition"],
[String.raw`\[ F_P = \frac{3}{4\pi^2}\left(\frac{\lambda}{n}\right)^3\frac{Q}{V} \]`, "Purcell factor"],
[String.raw`\[ P_{\mathrm{out}} = \eta_d \frac{h\nu}{q}(I - I_{th}) \]`, "Slope efficiency"],
[String.raw`\[ P_{\mathrm{defect\ free}} = e^{-\rho_{TD}A} \]`, "Yield of a small device on dislocated material"]],
consts: String.raw`Illustrative nanolaser: \(\lambda = 850\) nm, \(n = 3.5\), \(V_a = 10^{-14}\) cm³, \(\tau_{nr} = \tau_{sp} = 1\) ns, \(\tau_p = 0.45\) ps, \(g_0 = 2\times10^{-6}\) cm³/s, \(N_{tr} = 1.5\times10^{18}\) cm⁻³, \(\Gamma = 0.5\), \(\eta_i = 0.8\). Li et al. 2015 numbers are quoted separately.`,
sources: ["N. Li, K. Liu, V. J. Sorger and D. K. Sadana, Monolithic III-V on silicon plasmonic nanolaser structure for optical interconnects, Sci. Rep. 5, 14067 (2015)", "L. A. Coldren, S. W. Corzine and M. L. Mashanovitch, Diode Lasers and Photonic Integrated Circuits, 2nd ed., Wiley (2012), Ch. 2 and 5", "E. M. Purcell, Spontaneous emission probabilities at radio frequencies, Phys. Rev. 69, 681 (1946)", "Z. Wang et al., Novel light source integration approaches for silicon photonics, Laser Photon. Rev. 11, 1700063 (2017)", "Broadcom Tomahawk 6 Davisson release (October 2025), field replaceable external lasers; Nvidia GTC 2025, 4 times fewer lasers"]
});
})();

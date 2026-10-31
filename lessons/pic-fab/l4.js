(function () {
/* Part 2 Lesson 4: interlayer transitions, computed live with coupled-mode theory (Yariv 1973) and a numerical integration of the coupled amplitude equations along an adiabatic taper. */
const PC = "#D85A30", PB = "#378ADD", PT = "#1D9E75", PP = "#7F77DD", PA = "#BA7517";
const tx = (x, y, t, a, cls) => `<text class="${cls || "ts"}" x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""}>${t}</text>`;
const R = (x, y, w, h, fill, stroke, extra) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke || "none"}" ${extra || ""}/>`;
const M = { si: "#8fa6c2", ox: "#efe6cc", sin: "#9fd1c7", sinL: "#3f8f80" };
const LAM = 1.55, K0 = 2 * Math.PI / LAM;
/* coupling constant of two SiN guides separated by a vertical gap g (um): kappa0 exp(-gamma g), gamma from the SiN slab mode tail */
const NEFF = PIC.slabNeff(2.0, 1.44, 0.2, LAM), GAM = K0 * Math.sqrt(NEFF * NEFF - 1.44 * 1.44); // per um
const KAPPA = g => 0.3 * Math.exp(-GAM * g); // per um, 0.3 per um at zero gap is a scaling value for two 200 nm nitride guides
/* integrate da1/dz = -i delta a1 - i kappa a2, da2/dz = +i delta a2 - i kappa a1 along z with delta(z) given, RK4 on complex pairs */
function cmtRun(L, kap, deltaFn, n) {
  let a1 = [1, 0], a2 = [0, 0]; const dz = L / n; const P1 = [1], P2 = [0];
  const f = (z, a, b) => { const d = deltaFn(z); return [[d * a[1] + kap * b[1], -d * a[0] - kap * b[0]], [-d * b[1] + kap * a[1], d * b[0] - kap * a[0]]]; };
  for (let i = 0; i < n; i++) {
    const z = i * dz; const k1 = f(z, a1, a2), k2 = f(z + dz / 2, [a1[0] + dz / 2 * k1[0][0], a1[1] + dz / 2 * k1[0][1]], [a2[0] + dz / 2 * k1[1][0], a2[1] + dz / 2 * k1[1][1]]);
    const k3 = f(z + dz / 2, [a1[0] + dz / 2 * k2[0][0], a1[1] + dz / 2 * k2[0][1]], [a2[0] + dz / 2 * k2[1][0], a2[1] + dz / 2 * k2[1][1]]), k4 = f(z + dz, [a1[0] + dz * k3[0][0], a1[1] + dz * k3[0][1]], [a2[0] + dz * k3[1][0], a2[1] + dz * k3[1][1]]);
    a1 = [a1[0] + dz / 6 * (k1[0][0] + 2 * k2[0][0] + 2 * k3[0][0] + k4[0][0]), a1[1] + dz / 6 * (k1[0][1] + 2 * k2[0][1] + 2 * k3[0][1] + k4[0][1])];
    a2 = [a2[0] + dz / 6 * (k1[1][0] + 2 * k2[1][0] + 2 * k3[1][0] + k4[1][0]), a2[1] + dz / 6 * (k1[1][1] + 2 * k2[1][1] + 2 * k3[1][1] + k4[1][1])];
    P1.push(a1[0] * a1[0] + a1[1] * a1[1]); P2.push(a2[0] * a2[0] + a2[1] * a2[1]);
  }
  return { P1, P2 };
}

addLesson("pic", "fab", {
level: "Advanced",
id: "pic-fab-l4", title: "Interlayer transitions: moving light between layers", short: "4. Interlayer transitions",
big: String.raw`Two waveguides stacked one above the other with a thin oxide gap between them share their evanescent tails, so power leaks from one to the other. If both guides are the same width the power sloshes back and forth with a period set by the coupling strength, and a coupler cut at half a period moves everything up. If instead the lower guide narrows while the upper one widens, the light follows the guide that holds it best and climbs from one layer to the other without ever sloshing. That adiabatic taper is how multilayer platforms connect their layers, and it is tolerant to the overlay error between the two lithography steps. This lesson computes the coupling from the gap, the power exchange along the device, the adiabatic taper, the misalignment tolerance, the interlayer grating alternative, and the crosstalk at crossings.`,
bridge: String.raw`Coupled-mode theory follows Yariv, IEEE J. Quantum Electron. 9, 919 (1973), in the form used in Part 1 Lesson 4 for directional couplers. The taper cards integrate the coupled amplitude equations numerically with a z dependent detuning. The platform numbers are from Shang et al., Opt. Express 23, 21334 (2015), the 200 nm nitride, 700 nm gap platform with 0.01 dB interlayer loss, 0.167 dB crossings and -52 dB crosstalk, and from a 2026 interposer preprint, arXiv 2604.12566, labelled as such.`,
cards: [

{s: "1. Two guides, one gap", t: "Why stacked guides talk: the evanescent tail and the gap",
intu: String.raw`The mode of a nitride guide does not stop at the nitride. It decays into the oxide with a tail whose length is set by how far the effective index sits above the oxide index. A second guide placed inside that tail feels the field, and the coupling strength falls exponentially with the gap. Slide the gap and watch the tail overlap shrink and the coupling constant fall. At 700 nm the two 200 nm nitride guides of the Shang platform are nearly independent, which is what you want everywhere except at the transition.`,
eq: String.raw`\[ \kappa(g) \approx \kappa_0\, e^{-\gamma g}, \qquad \gamma = k_0\sqrt{n_{\mathrm{eff}}^2 - n_{\mathrm{SiO_2}}^2} \]<div class="eqnote">computed live: n_eff from a 200 nm nitride slab at 1550 nm, kappa_0 a typical touching-guide value</div>`,
sym: [[String.raw`\(\kappa\)`, "coupling constant between the two guides, per µm"], [String.raw`\(g\)`, "vertical oxide gap"], [String.raw`\(\gamma\)`, "decay constant of the evanescent tail in the oxide, per µm"], [String.raw`\(n_{\mathrm{eff}}\)`, "effective index of the guide"]],
how: ["Solve the slab for the effective index of one guide. The field outside decays as exp of minus gamma times distance.", "The coupling constant is an overlap integral of one guide's field with the other guide's index step, which lives at distance g, so it carries the factor exp of minus gamma g.", "Everything else is in the prefactor, which depends on the guide shapes.", "Low index contrast guides have small gamma and long tails, so nitride layers couple over larger gaps than silicon layers."],
say: String.raw`The interlayer coupling falls exponentially with the gap at the rate set by the evanescent tail of the mode.`,
num: `200 nm SiN slab at 1550 nm: effective index about ${NEFF.toFixed(2)}, gamma about ${GAM.toFixed(1)} per µm, so the tail is ${(1000 / GAM).toFixed(0)} nm long. Kappa falls by e every ${(1000 / GAM).toFixed(0)} nm of gap. Silicon 220 nm: gamma about 7.8 per µm, a 130 nm tail.`,
r(fig, ctl) {
  ctl.innerHTML = sl("g", "Oxide gap (nm)", 50, 1200, 10, 700);
  const u = () => {
    const g = +$("g").value; $("gv").textContent = g + " nm"; const kap = KAPPA(g / 1000), Lc = Math.PI / (2 * kap);
    let s = tx(340, 22, `κ = ${kap.toFixed(4)} per µm, full transfer length π/2κ = ${Lc > 1e4 ? (Lc / 1000).toFixed(0) + " mm" : Lc.toFixed(0) + " µm"}`, "middle", "th");
    const x0 = 40, yc = 150, sc = 0.12; // px per nm
    const gpx = g * sc; const yU = yc - gpx / 2 - 24, yL = yc + gpx / 2;
    s += R(x0, 50, 320, 220, M.ox, "#d9ccaa") + R(x0 + 60, yU, 200, 24, M.sin, M.sinL) + R(x0 + 60, yL, 200, 24, M.sin, M.sinL) + tx(x0 + 160, yU - 6, "upper SiN, 200 nm", "middle") + tx(x0 + 160, yL + 40, "lower SiN, 200 nm", "middle");
    // field tails
    const tailU = []; for (let i = 0; i <= 60; i++) { const ynm = i / 60 * 1200; const v = Math.exp(-GAM * ynm / 1000); tailU.push([x0 + 270 + v * 40, yU + 24 + ynm * sc]); }
    let d = ""; tailU.forEach((p, i) => { if (p[1] < 270) d += (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1); }); s += `<path d="${d}" fill="none" stroke="${PC}" stroke-width="2"/>`;
    let d2 = ""; tailU.forEach((p, i) => { const y = yL - (p[1] - yU - 24); if (y > 50) d2 += (d2 ? "L" : "M") + p[0].toFixed(1) + " " + y.toFixed(1); }); s += `<path d="${d2}" fill="none" stroke="${PB}" stroke-width="2"/>`;
    s += tx(x0 + 300, 44, "mode tails", "middle");
    const px = 420, pw = 220, py = 60, ph = 180; s += PIC.yaxis(px, py, ph, 0, 0.3, 3, "κ (per µm)", v => v.toFixed(1)) + PIC.xaxis(px, py + ph, pw, 0, 1200, 4, "gap (nm)", v => v.toFixed(0));
    let d3 = ""; for (let i = 0; i <= 60; i++) { const gg = i / 60 * 1200; d3 += (i ? "L" : "M") + (px + i / 60 * pw).toFixed(1) + " " + (py + ph - KAPPA(gg / 1000) / 0.3 * ph).toFixed(1); } s += `<path d="${d3}" fill="none" stroke="${PT}" stroke-width="2"/><circle cx="${px + g / 1200 * pw}" cy="${py + ph - kap / 0.3 * ph}" r="5" fill="${PC}"/>`;
    fig.innerHTML = svg(290, s);
  };
  $("g").oninput = u; u();
}},

{s: "2. Power exchange", t: "Synchronous coupling: the power sloshes between the layers",
intu: String.raw`If the two guides are identical, light launched in the lower one transfers completely to the upper one after a length of pi over two kappa, then comes back. Press Play to watch the power move along the device, and slide the gap and the device length. Cut the coupler at exactly the transfer length and all the light climbs a layer. The trouble is that the exact length depends on the gap, the widths and the wavelength, so this synchronous coupler is fast but fragile.`,
eq: String.raw`\[ P_2(z) = \sin^2(\kappa z), \qquad L_c = \frac{\pi}{2\kappa} \]<div class="eqref">identical guides, no detuning</div>`,
sym: [[String.raw`\(P_2\)`, "fraction of the power in the upper guide"], [String.raw`\(z\)`, "distance along the coupler"], [String.raw`\(L_c\)`, "length for full transfer"]],
how: ["Write the field as a sum of the two single guide modes with amplitudes a1 and a2.", "Each amplitude is driven by the other through kappa, which gives two coupled first order equations.", "For identical guides the solution is a cosine in the first guide and a sine in the second.", "The power in the second guide is sine squared of kappa z and reaches one at pi over two kappa."],
say: String.raw`Identical stacked guides exchange all their power over a length of pi over two kappa and keep sloshing after that.`,
num: "In this model: 300 nm gap, kappa about 0.13 per µm, transfer length about 12 µm. 700 nm gap, kappa about 0.045 per µm, transfer length about 35 µm. A 10 percent error in kappa at full transfer costs about 2.5 percent of the power.",
r(fig, ctl) {
  ctl.innerHTML = sl("g", "Oxide gap (nm)", 100, 900, 10, 400) + sl("L", "Device length (µm)", 5, 200, 1, 40);
  const draw = t => {
    const g = +$("g").value, L = +$("L").value; $("gv").textContent = g + " nm"; $("Lv").textContent = L + " µm";
    const kap = KAPPA(g / 1000), Lc = Math.PI / (2 * kap); const P2 = z => Math.pow(Math.sin(kap * z), 2);
    const zt = ((t * 0.25) % 1) * L; const p = P2(zt);
    let s = tx(340, 22, `L_c = ${Lc.toFixed(1)} µm. At the end: ${(P2(L) * 100).toFixed(1)} percent in the upper guide`, "middle", "th");
    const x0 = 40, w = 600; const yU = 70, yL = 130;
    s += R(x0, yU, w, 20, M.sin, M.sinL) + R(x0, yL, w, 20, M.sin, M.sinL) + tx(x0 - 2, yU + 14, "up", "end") + tx(x0 - 2, yL + 14, "low", "end");
    const X = x0 + zt / L * w; s += `<circle cx="${X.toFixed(1)}" cy="${yU + 10}" r="${(4 + 8 * p).toFixed(1)}" fill="${PC}" opacity="0.8"/><circle cx="${X.toFixed(1)}" cy="${yL + 10}" r="${(4 + 8 * (1 - p)).toFixed(1)}" fill="${PB}" opacity="0.8"/>`;
    const py = 180, ph = 100; s += PIC.yaxis(x0 + 20, py, ph, 0, 1, 2, "P₂", v => v.toFixed(1)) + PIC.xaxis(x0 + 20, py + ph, w - 20, 0, L, 4, "z (µm)", v => v.toFixed(0));
    let d = ""; for (let i = 0; i <= 200; i++) { const z = i / 200 * L; d += (i ? "L" : "M") + (x0 + 20 + i / 200 * (w - 20)).toFixed(1) + " " + (py + ph - P2(z) * ph).toFixed(1); } s += `<path d="${d}" fill="none" stroke="${PC}" stroke-width="2"/><line x1="${(x0 + 20 + zt / L * (w - 20)).toFixed(1)}" y1="${py}" x2="${(x0 + 20 + zt / L * (w - 20)).toFixed(1)}" y2="${py + ph}" stroke="var(--p)" stroke-dasharray="3 3"/>`;
    fig.innerHTML = svg(py + ph + 40, s);
  };
  PIC.player(ctl, draw);
}},

{s: "3. Adiabatic taper", t: "The adiabatic taper: let the light follow the better guide",
intu: String.raw`Now taper the lower guide down and the upper guide up along z. At the start the lower guide has the higher effective index and holds the light. At the end the upper guide does. If the change is slow enough the light stays in the local mode that started in the lower guide and ends up in the upper one, with no sloshing and no sensitive length. Press Play to watch the power climb, and slide the taper length. Too short and the light cannot follow, and you see it oscillate and lose power. The computation integrates the coupled amplitude equations with a detuning that sweeps from positive to negative.`,
eq: String.raw`\[ \frac{da_1}{dz} = -i\delta(z)a_1 - i\kappa a_2, \qquad \frac{da_2}{dz} = +i\delta(z)a_2 - i\kappa a_1, \qquad \delta(z) = \frac{\beta_1(z) - \beta_2(z)}{2} \]<div class="eqnote">adiabatic when the sweep of delta is slow compared with kappa squared</div>`,
sym: [[String.raw`\(a_1, a_2\)`, "amplitudes in the lower and upper guide"], [String.raw`\(\delta(z)\)`, "half the propagation constant mismatch, changing sign along the taper"], [String.raw`\(\kappa\)`, "coupling constant, set by the gap"], [String.raw`\(\beta_1, \beta_2\)`, "propagation constants of the two guides, each changing with its width"]],
how: ["The local eigenmodes of the pair are splits of the two guide modes. Their propagation constants never cross because kappa keeps them apart by 2 kappa at the closest point.", "If delta changes slowly, the light stays on one eigenmode branch. Following that branch from delta positive to delta negative moves it from guide 1 to guide 2.", "The adiabatic condition is that the rate of change of delta be small against kappa squared, roughly L much longer than delta range over kappa squared.", "Shorter kappa, so larger gap, demands longer tapers. That is the trade between loss, length and crosstalk."],
say: String.raw`An adiabatic interlayer taper sweeps the detuning through zero slowly enough that the light rides one local eigenmode from the lower layer to the upper layer.`,
num: "Shang 2015: 0.01 dB interlayer coupling loss with a 700 nm gap, taper length in the hundreds of µm. Poon group silicon to nitride tapers: tens of µm because the gap is thinner. The 2026 interposer reports 0.36 dB per interlayer taper (arXiv 2604.12566).",
r(fig, ctl) {
  ctl.innerHTML = sl("g", "Oxide gap (nm)", 100, 800, 10, 350) + sl("L", "Taper length (µm)", 5, 600, 5, 250);
  const draw = t => {
    const g = +$("g").value, L = +$("L").value; $("gv").textContent = g + " nm"; $("Lv").textContent = L + " µm";
    const kap = KAPPA(g / 1000); const dmax = 0.6; // per um: half mismatch at the taper ends, a scaling value
    const res = cmtRun(L, kap, z => dmax * (1 - 2 * z / L), 400); const eff = res.P2[400];
    const zt = ((t * 0.2) % 1); const idx = Math.floor(zt * 400); const p2 = res.P2[idx], p1 = res.P1[idx];
    const adiab = L * kap * kap / (2 * dmax);
    let s = tx(340, 22, `transfer ${(eff * 100).toFixed(1)} percent (${(-PIC.dB(Math.max(eff, 1e-6))).toFixed(2)} dB). Adiabaticity L κ²/2δ = ${adiab.toFixed(1)} ${adiab > 2 ? "(slow enough)" : "(too fast)"}`, "middle", "th");
    const x0 = 40, w = 600, yU = 60, yL = 125;
    s += `<polygon points="${x0},${yU + 10} ${x0 + w},${yU - 2} ${x0 + w},${yU + 22} ${x0},${yU + 10}" fill="${M.sin}" stroke="${M.sinL}"/><polygon points="${x0},${yL - 2} ${x0 + w},${yL + 10} ${x0},${yL + 22}" fill="${M.sin}" stroke="${M.sinL}"/>`;
    s += tx(x0 + w / 2, yU - 8, "upper guide widens", "middle") + tx(x0 + w / 2, yL + 38, "lower guide narrows", "middle");
    const X = x0 + zt * w; s += `<circle cx="${X.toFixed(1)}" cy="${yU + 10}" r="${(3 + 9 * p2).toFixed(1)}" fill="${PC}" opacity="0.8"/><circle cx="${X.toFixed(1)}" cy="${yL + 10}" r="${(3 + 9 * p1).toFixed(1)}" fill="${PB}" opacity="0.8"/>`;
    const py = 180, ph = 100; s += PIC.yaxis(x0 + 20, py, ph, 0, 1, 2, "power", v => v.toFixed(1)) + PIC.xaxis(x0 + 20, py + ph, w - 20, 0, L, 4, "z (µm)", v => v.toFixed(0));
    let d1 = "", d2 = ""; for (let i = 0; i <= 400; i += 2) { const X2 = (x0 + 20 + i / 400 * (w - 20)).toFixed(1); d1 += (i ? "L" : "M") + X2 + " " + (py + ph - res.P1[i] * ph).toFixed(1); d2 += (i ? "L" : "M") + X2 + " " + (py + ph - res.P2[i] * ph).toFixed(1); }
    s += `<path d="${d1}" fill="none" stroke="${PB}" stroke-width="2"/><path d="${d2}" fill="none" stroke="${PC}" stroke-width="2"/>` + tx(x0 + w, py + 12, "red: upper, blue: lower", "end");
    fig.innerHTML = svg(py + ph + 40, s);
  };
  PIC.player(ctl, draw);
}},

{s: "4. Gap and length", t: "The gap sets the taper length and the crosstalk at the same time",
intu: String.raw`A thin gap gives strong coupling, so the taper can be short, but every crossing between the layers then leaks power. A thick gap makes crossings clean but the taper must be long. The plot shows both against the gap, computed from the same exponential. The Shang platform sits at 700 nm, with long tapers and nearly invisible crossings. Platforms that need many short transitions choose 100 to 300 nm. Slide the gap and read both numbers.`,
eq: String.raw`\[ L_{\mathrm{taper}} \gtrsim \frac{c\,\delta_{\max}}{\kappa(g)^2} \propto e^{2\gamma g}, \qquad \text{crosstalk} \propto \kappa(g)^2 \propto e^{-2\gamma g} \]`,
sym: [[String.raw`\(L_{\mathrm{taper}}\)`, "minimum adiabatic taper length"], [String.raw`\(c\)`, "a constant of order a few, set by the loss you accept"], [String.raw`\(\delta_{\max}\)`, "half mismatch at the taper ends"], ["crosstalk", "fraction of power leaking at a crossing, from a short overlap of the two guides"]],
how: ["The adiabatic condition from card 3 gives length proportional to one over kappa squared.", "A crossing is a short synchronous coupler, so its leak is about kappa squared times the overlap length squared.", "Both scale with the same exponential of the gap, in opposite directions.", "So the gap is the one knob that trades taper length against crossing isolation, and the platform chooses it once."],
say: String.raw`A thicker gap lengthens the taper as exp of two gamma g and suppresses crossing crosstalk by the same factor.`,
num: "Shang 2015, 700 nm gap: interlayer coupler 0.01 dB, multilayer crossing 0.167 dB, crosstalk -52 dB, bend radius 50 µm. Doubling the gap from 350 to 700 nm multiplies the taper length by about exp(2 gamma 0.35) in this model.",
r(fig, ctl) {
  ctl.innerHTML = sl("g", "Oxide gap (nm)", 100, 1000, 10, 700);
  const u = () => {
    const g = +$("g").value; $("gv").textContent = g + " nm"; const kap = KAPPA(g / 1000); const Lt = 3 * 0.6 / (kap * kap); const xt = PIC.dB(Math.min(1, Math.pow(kap * 2, 2)));
    let s = tx(340, 22, `taper about ${Lt > 1000 ? (Lt / 1000).toFixed(1) + " mm" : Lt.toFixed(0) + " µm"}, crossing crosstalk about ${xt.toFixed(0)} dB (model)`, "middle", "th");
    const x0 = 60, w = 240, y0 = 50, h = 170;
    s += PIC.yaxis(x0, y0, h, 0, 1000, 4, "taper length (µm)", v => v.toFixed(0)) + PIC.xaxis(x0, y0 + h, w, 100, 1000, 3, "gap (nm)", v => v.toFixed(0));
    let d = ""; for (let i = 0; i <= 60; i++) { const gg = 100 + i / 60 * 900; const L = Math.min(1000, 3 * 0.6 / Math.pow(KAPPA(gg / 1000), 2)); d += (i ? "L" : "M") + (x0 + i / 60 * w).toFixed(1) + " " + (y0 + h - L / 1000 * h).toFixed(1); } s += `<path d="${d}" fill="none" stroke="${PB}" stroke-width="2"/><circle cx="${x0 + (g - 100) / 900 * w}" cy="${y0 + h - Math.min(1000, Lt) / 1000 * h}" r="5" fill="${PC}"/>`;
    const px = 400, pw = 240; s += PIC.yaxis(px, y0, h, -80, 0, 4, "crosstalk (dB)", v => v.toFixed(0)) + PIC.xaxis(px, y0 + h, pw, 100, 1000, 3, "gap (nm)", v => v.toFixed(0));
    let d2 = ""; for (let i = 0; i <= 60; i++) { const gg = 100 + i / 60 * 900; const x = Math.max(-80, PIC.dB(Math.min(1, Math.pow(KAPPA(gg / 1000) * 2, 2)))); d2 += (i ? "L" : "M") + (px + i / 60 * pw).toFixed(1) + " " + (y0 + h - (x + 80) / 80 * h).toFixed(1); } s += `<path d="${d2}" fill="none" stroke="${PT}" stroke-width="2"/><circle cx="${px + (g - 100) / 900 * pw}" cy="${y0 + h - (Math.max(-80, xt) + 80) / 80 * h}" r="5" fill="${PC}"/>`;
    s += `<line x1="${px}" y1="${y0 + h - 28 / 80 * h}" x2="${px + pw}" y2="${y0 + h - 28 / 80 * h}" stroke="${PC}" stroke-dasharray="4 3"/>` + tx(px + pw, y0 + h - 28 / 80 * h - 5, "Shang 2015: −52 dB", "end");
    fig.innerHTML = svg(y0 + h + 40, s);
  };
  $("g").oninput = u; u();
}},

{s: "5. Misalignment", t: "Overlay tolerance: why the adiabatic taper forgives the lithography",
intu: String.raw`The two layers are patterned in separate lithography steps, so the upper taper may sit off to the side of the lower one, or further along it. A lateral offset reduces the overlap of the two modes and so reduces kappa. Along the taper, a shift just moves where the detuning crosses zero. Because the adiabatic design does not depend on the exact kappa, it tolerates both. Slide the offsets. Shang et al. measured tolerance up to 400 nm laterally and 15 µm along the taper.`,
eq: String.raw`\[ \kappa(\Delta x) \approx \kappa_0\, e^{-\Delta x^2 / w_m^2}, \qquad \eta_{\mathrm{LZ}} = 1 - \exp\!\left(-\frac{\pi\,\kappa(\Delta x)^2\, L}{\delta_{\max}}\right) \]<div class="eqnote">mode overlap with a lateral offset, and the Landau-Zener estimate of the transfer for a linear sweep of delta. The plot integrates the coupled equations numerically and shows the estimate dashed</div>`,
sym: [[String.raw`\(\Delta x\)`, "lateral overlay offset between the two layers"], [String.raw`\(w_m\)`, "mode half width, about 0.7 µm for a 1 µm nitride guide"], [String.raw`\(\Delta z\)`, "offset along the taper, which only shifts the crossing point"], [String.raw`\(\eta\)`, "transfer efficiency"]],
how: ["A lateral offset multiplies the overlap integral by a Gaussian of the offset over the mode width.", "A linear sweep of delta through zero with constant kappa is the Landau-Zener problem, and the fraction that fails to follow the eigenmode is exp of minus pi kappa squared over the sweep rate 2 delta max over L.", "Smaller kappa makes the taper less adiabatic, so the efficiency starts to fall only when kappa has dropped enough to break the adiabatic condition.", "A shift along z moves the zero of delta but leaves the sweep rate the same, so the efficiency hardly changes as long as the crossing stays inside the taper.", "Design the taper longer than the minimum and the tolerance window widens."],
say: String.raw`An adiabatic transition tolerates lateral overlay because it only needs kappa to stay above a threshold, and tolerates offsets along the taper because they just move the crossing point.`,
num: "Shang 2015: lateral tolerance 400 nm, tangential tolerance 15 µm, for a 200 nm nitride platform with a 700 nm gap. Scanner overlay is 2 to 30 nm, far inside this window.",
r(fig, ctl) {
  ctl.innerHTML = sl("dx", "Lateral offset (nm)", 0, 800, 10, 100) + sl("dz", "Offset along the taper (µm)", 0, 40, 1, 0) + sl("L", "Taper length (µm)", 50, 800, 10, 400);
  const u = () => {
    const dx = +$("dx").value, dz = +$("dz").value, L = +$("L").value; $("dxv").textContent = dx + " nm"; $("dzv").textContent = dz + " µm"; $("Lv").textContent = L + " µm";
    const kap0 = KAPPA(0.35); const kap = kap0 * Math.exp(-Math.pow(dx / 700, 2)); const dmax = 0.6;
    const nst = Math.max(400, Math.round(L * 4)); const res = cmtRun(L, kap, z => dmax * (1 - 2 * (z - dz) / L), nst); const eff = Math.min(1, res.P2[nst]); const lz = 1 - Math.exp(-Math.PI * kap * kap * L / dmax);
    let s = tx(340, 22, `κ falls to ${(kap / kap0 * 100).toFixed(0)} percent, transfer ${(eff * 100).toFixed(1)} percent (${(-PIC.dB(Math.max(eff, 1e-6))).toFixed(2)} dB), Landau-Zener estimate ${(lz * 100).toFixed(1)} percent`, "middle", "th");
    // top view
    const x0 = 40, w = 360, yc = 110; s += tx(x0, 46, "top view: lower taper (blue) and upper taper (orange) with the offsets");
    s += `<polygon points="${x0},${yc - 14} ${x0 + w},${yc - 3} ${x0 + w},${yc + 3} ${x0},${yc + 14}" fill="${PB}" opacity="0.5"/>`;
    const ox = dz / L * w, oy = dx * 0.06; s += `<polygon points="${x0 + ox},${yc - 3 + oy} ${x0 + w + ox},${yc - 14 + oy} ${x0 + w + ox},${yc + 14 + oy} ${x0 + ox},${yc + 3 + oy}" fill="${PC}" opacity="0.5"/>`;
    // efficiency vs lateral offset
    const px = 440, pw = 200, py = 60, ph = 130; s += PIC.yaxis(px, py, ph, 0, 1, 2, "transfer", v => v.toFixed(1)) + PIC.xaxis(px, py + ph, pw, 0, 800, 4, "lateral offset (nm)", v => v.toFixed(0));
    let d = "", d2 = ""; for (let i = 0; i <= 16; i++) { const xx = i / 16 * 800; const k = kap0 * Math.exp(-Math.pow(xx / 700, 2)); const n2 = Math.max(200, Math.round(L * 2)); const e = Math.min(1, cmtRun(L, k, z => dmax * (1 - 2 * (z - dz) / L), n2).P2[n2]); const e2 = 1 - Math.exp(-Math.PI * k * k * L / dmax); d += (i ? "L" : "M") + (px + i / 16 * pw).toFixed(1) + " " + (py + ph - e * ph).toFixed(1); d2 += (i ? "L" : "M") + (px + i / 16 * pw).toFixed(1) + " " + (py + ph - e2 * ph).toFixed(1); }
    s += `<path d="${d}" fill="none" stroke="${PT}" stroke-width="2"/><path d="${d2}" fill="none" stroke="${PT}" stroke-width="1.5" stroke-dasharray="5 4"/><circle cx="${px + dx / 800 * pw}" cy="${py + ph - eff * ph}" r="5" fill="${PC}"/>`;
    fig.innerHTML = svg(py + ph + 40, s);
  };
  ["dx", "dz", "L"].forEach(i => $(i).oninput = u); u();
}},

{s: "6. Interlayer grating", t: "The other way up: a pair of gratings",
intu: String.raw`Instead of a long taper you can scatter the light upward with a grating in the lower guide and catch it with a matching grating in the upper guide. The two gratings face each other across the gap, and the Bragg condition sets the angle at which the light leaves. This transition is short and does not care about the gap, but it is narrowband, since the angle changes with wavelength, and it has more loss. Slide the period and the wavelength and watch the beam angle move. Press Play to see the light hop.`,
eq: String.raw`\[ \sin\theta = \frac{n_{\mathrm{eff}} - \lambda/\Lambda}{n_{\mathrm{SiO_2}}}, \qquad \frac{d\theta}{d\lambda} = -\frac{1}{\Lambda\, n_{\mathrm{SiO_2}}\cos\theta} \]<div class="eqref">first order Bragg scattering into the oxide between the layers</div>`,
sym: [[String.raw`\(\Lambda\)`, "grating period"], [String.raw`\(\theta\)`, "angle of the scattered beam from the vertical"], [String.raw`\(n_{\mathrm{eff}}\)`, "effective index of the grating region"], [String.raw`\(d\theta/d\lambda\)`, "angular dispersion, which limits the bandwidth"]],
how: ["The grating adds momentum two pi over Lambda to the guided wave.", "Matching the in-plane momentum in the oxide gives the sine of the angle.", "Differentiate with wavelength to get the dispersion. A 1 percent wavelength change tilts the beam by about a degree.", "The upper grating is the same device run backwards, so both must be tuned to the same angle."],
say: String.raw`An interlayer grating pair sends light up at a Bragg angle, which is short and gap tolerant but narrowband.`,
num: "Interlayer grating couplers in a Si/SiO2/SiN platform reach about 1 dB with 1 dB bandwidths of tens of nm. A taper reaches 0.01 dB over the whole band. Gratings win when the gap is large or the layers are far apart.",
r(fig, ctl) {
  ctl.innerHTML = sl("per", "Period Λ (nm)", 600, 1100, 10, 900) + sl("lam", "Wavelength (nm)", 1450, 1650, 5, 1550);
  const draw = t => {
    const per = +$("per").value, lam = +$("lam").value; $("perv").textContent = per + " nm"; $("lamv").textContent = lam + " nm";
    const ne = 1.62; const sth = (ne - lam / per) / 1.44; const ok = Math.abs(sth) < 1; const th = ok ? Math.asin(sth) : NaN;
    let s = tx(340, 22, ok ? `beam angle ${(th * 180 / Math.PI).toFixed(1)}° from vertical` : "no propagating order: period too small", "middle", "th");
    const x0 = 40, w = 600, yU = 70, yL = 200; s += R(x0, yU, w, 20, M.sin, M.sinL) + R(x0, yL, w, 20, M.sin, M.sinL);
    for (let i = 0; i < 10; i++) { s += R(120 + i * per / 40, yL - 6, per / 80, 6, M.sinL) + R(380 + i * per / 40 - 130 * Math.tan(ok ? th : 0), yU + 20, per / 80, 6, M.sinL); }
    if (ok) { const ph = (t * 0.5) % 1; const xa = 230, ya = yL, xb = xa + 110 * Math.tan(th), yb = yU + 20; for (let k = 0; k < 5; k++) { const f = (ph + k / 5) % 1; s += `<circle cx="${(xa + f * (xb - xa)).toFixed(1)}" cy="${(ya - f * (ya - yb)).toFixed(1)}" r="4" fill="${PC}"/>`; } s += `<line x1="${xa}" y1="${ya}" x2="${xb}" y2="${yb}" stroke="${PC}" stroke-dasharray="3 3"/>`; }
    s += tx(x0, yL + 38, "lower grating scatters up, upper grating catches the beam. Dots: light in Play");
    fig.innerHTML = svg(yL + 50, s);
  };
  PIC.player(ctl, draw);
}},

{s: "7. Crossings", t: "Crossings between layers and the published numbers",
intu: String.raw`The reason to have two layers at all is that waveguides on different layers can cross without touching. In a single layer a crossing costs about 0.1 to 0.2 dB and leaks crosstalk, and a big switch fabric has thousands of them. Between layers the two guides only overlap for the width of the crossing, so the leak is tiny and the loss is set by the slight scattering of each mode at the other guide. The table collects the measured numbers from the two platforms. Slide the crossing count to see why routing in 3D matters.`,
eq: String.raw`\[ \text{loss}_{\mathrm{total}} = N_{\mathrm{cross}}\,\text{loss}_{\mathrm{cross}} + L\,\alpha, \qquad \text{XT}_{\mathrm{cross}} \approx (\kappa\, w)^2 \]`,
sym: [[String.raw`\(N_{\mathrm{cross}}\)`, "number of crossings on a path"], [String.raw`\(\text{loss}_{\mathrm{cross}}\)`, "loss per crossing, 0.167 dB in-plane multilayer (Shang), 0.001 dB interlayer (2026 interposer)"], [String.raw`\(w\)`, "overlap length at the crossing, about the guide width"], [String.raw`\(\mathrm{XT}\)`, "power crosstalk at one crossing"]],
how: ["A path through a switch fabric crosses many other paths. Each crossing costs a fixed loss and injects a little crosstalk.", "Losses add in dB and crosstalk powers add linearly, so both grow with the crossing count.", "An interlayer crossing is a very short coupler, so its crosstalk is kappa times the overlap length, squared, which is why the 700 nm gap gives -52 dB.", "Routing on three layers cuts the crossing count by two thirds, which the 2026 interposer reports as 69.7 percent fewer crossings."],
say: String.raw`Interlayer crossings are nearly free because the guides overlap only for a width, so multilayer routing cuts both loss and crosstalk in a big fabric.`,
num: "Shang 2015: 0.167 dB per multilayer crossing at 90°, -52 dB crosstalk, 0.01 dB interlayer coupler. 2026 interposer (arXiv 2604.12566, preprint): 0.123 and 0.169 dB intralayer crossings, 0.001 dB interlayer crossing, 0.038 dB/cm waveguide, 0.36 dB per taper, 69.7 percent fewer crossings and 45.8 percent lower loss than planar routing.",
r(fig, ctl) {
  ctl.innerHTML = sl("N", "Crossings on the path", 0, 200, 5, 60) + btns([[0, "single layer"], [1, "interlayer"]], "m");
  let m = 0;
  const u = () => {
    pick(ctl, "m", m); const N = +$("N").value; $("Nv").textContent = N;
    const lc = m ? 0.001 : 0.167, xt = m ? -52 : -35; const tot = N * lc, xtot = N > 0 ? PIC.dB(N * PIC.fromdB(xt)) : -99;
    let s = tx(340, 22, `${N} crossings: ${tot.toFixed(2)} dB loss, summed crosstalk ${N > 0 ? xtot.toFixed(0) + " dB" : "none"}`, "middle", "th");
    // drawing: a grid of guides with the path
    const x0 = 40, y0 = 50, w = 300, h = 160; s += R(x0, y0, w, h, "var(--sunk)", "var(--b)");
    for (let i = 0; i < 6; i++) s += `<line x1="${x0 + 20 + i * 52}" y1="${y0}" x2="${x0 + 20 + i * 52}" y2="${y0 + h}" stroke="${m ? PT : PB}" stroke-width="3" opacity="${m ? 0.45 : 0.8}"/>`;
    s += `<line x1="${x0}" y1="${y0 + h / 2}" x2="${x0 + w}" y2="${y0 + h / 2}" stroke="${PC}" stroke-width="4"/>` + tx(x0 + w / 2, y0 + h + 16, m ? "red path on layer 1 crosses green guides on layer 2" : "red path crosses blue guides on the same layer", "middle");
    for (let i = 0; i < 6; i++) if (!m) s += `<circle cx="${x0 + 20 + i * 52}" cy="${y0 + h / 2}" r="6" fill="none" stroke="${PC}" stroke-width="2"/>`;
    const px = 420, pw = 220, py = 60, ph = 150; s += PIC.yaxis(px, py, ph, 0, 40, 4, "path loss (dB)", v => v.toFixed(0)) + PIC.xaxis(px, py + ph, pw, 0, 200, 4, "crossings", v => v.toFixed(0));
    s += `<line x1="${px}" y1="${py + ph}" x2="${px + pw}" y2="${py + ph - Math.min(40, 200 * 0.167) / 40 * ph}" stroke="${PB}" stroke-width="2"/><line x1="${px}" y1="${py + ph}" x2="${px + pw}" y2="${py + ph - Math.min(40, 200 * 0.001) / 40 * ph}" stroke="${PT}" stroke-width="2"/>` + `<circle cx="${px + N / 200 * pw}" cy="${py + ph - Math.min(40, tot) / 40 * ph}" r="5" fill="${PC}"/>` + tx(px + pw, py + 12, "blue: single layer, green: interlayer", "end");
    fig.innerHTML = svg(py + ph + 40, s);
  };
  ctl.querySelectorAll("button[data-m]").forEach(b => b.onclick = () => { m = +b.dataset.m; u(); }); $("N").oninput = u; u();
}}
],
summary: String.raw`Stacked guides couple through their evanescent tails with a strength that falls exponentially with the oxide gap. Identical guides exchange all their power over pi over two kappa and keep sloshing, which is fast but fragile. Tapering one guide down while the other widens sweeps the detuning through zero, and if the sweep is slow against kappa squared the light rides one local mode from the lower layer to the upper one. The gap trades taper length against crossing crosstalk, the adiabatic design forgives hundreds of nanometres of overlay error, a grating pair is the short but narrowband alternative, and interlayer crossings at 0.001 to 0.01 dB are why multilayer routing wins.`,
sheet: [
[String.raw`\[ \kappa(g) \approx \kappa_0 e^{-\gamma g}, \quad \gamma = k_0\sqrt{n_{\mathrm{eff}}^2 - n_{\mathrm{SiO_2}}^2} \]`, "Coupling falls with the gap"],
[String.raw`\[ P_2(z) = \sin^2(\kappa z), \quad L_c = \pi/2\kappa \]`, "Synchronous power exchange"],
[String.raw`\[ \frac{da_1}{dz} = -i\delta a_1 - i\kappa a_2, \quad \frac{da_2}{dz} = i\delta a_2 - i\kappa a_1 \]`, "Coupled amplitude equations with detuning"],
[String.raw`\[ L_{\mathrm{taper}} \gtrsim c\,\delta_{\max}/\kappa^2 \]`, "Adiabatic length"],
[String.raw`\[ \kappa(\Delta x) \approx \kappa_0 e^{-\Delta x^2/w_m^2} \]`, "Lateral misalignment lowers kappa"],
[String.raw`\[ \sin\theta = (n_{\mathrm{eff}} - \lambda/\Lambda)/n_{\mathrm{SiO_2}} \]`, "Interlayer grating angle"],
[String.raw`\[ \mathrm{XT} \approx (\kappa w)^2, \quad \text{loss} = N\,\text{loss}_{\mathrm{cross}} \]`, "Crossing crosstalk and loss"]],
consts: String.raw`SiN index 2.0, oxide 1.44, 200 nm cores, 1550 nm. \(\kappa_0 = 0.3\) per µm at zero gap and \(\delta_{\max} = 0.6\) per µm are scaling values, so the taper lengths are illustrative. Measured platform numbers are quoted from the papers.`,
sources: ["A. Yariv, Coupled-mode theory for guided-wave optics, IEEE J. Quantum Electron. 9, 919 (1973)", "K. Shang, S. Pathak, B. Guan, G. Liu, S. J. B. Yoo, Low-loss compact multilayer silicon nitride platform for 3D photonic integrated circuits, Opt. Express 23, 21334 (2015), doi 10.1364/OE.23.021334", "W. D. Sacher, Y. Huang, G.-Q. Lo, J. K. S. Poon, Multilayer silicon nitride-on-silicon integrated photonic platforms and devices, J. Lightwave Technol. 33, 901 (2015)", "arXiv 2604.12566 (2026), 3D silicon nitride photonic interposer, preprint, numbers not peer reviewed", "Part 1 Lesson 4 of this shelf (directional couplers) for the coupled-mode derivation"]
});
})();

(function () {
/* Part 2 Lesson 6: packaging and co-packaged optics. Fiber attach, the electrical path, power claims, thermal drift and heater control, laser reliability. */
const PC = "#D85A30", PB = "#378ADD", PT = "#1D9E75", PP = "#7F77DD", PA = "#BA7517";
const tx = (x, y, t, a, cls) => `<text class="${cls || "ts"}" x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""}>${t}</text>`;
const R = (x, y, w, h, fill, stroke, extra) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke || "none"}" ${extra || ""}/>`;
const M = { si: "#8fa6c2", ox: "#efe6cc", pcb: "#4f8a5b", pkg: "#c9b58a", asic: "#6b6f78", oe: "#e0a06a", fiber: "#d9a441", heat: "#d85a30" };

addLesson("pic", "fab", {
level: "Advanced",
id: "pic-fab-l6", title: "Packaging and co-packaged optics", short: "6. Packaging and CPO",
big: String.raw`A photonic chip is useless until fibers are attached to it, it is wired to its electronics, and it is kept at a temperature where its rings stay on their wavelengths. In a pluggable transceiver the optics sit at the front panel and the electrical signal travels tens of centimetres of copper from the switch chip, which costs a retiming chip and a large share of the power. Co-packaged optics puts the optical engines on the same package as the switch chip, a few millimetres away. This lesson covers how fibers are attached, why the electrical distance matters, what the vendors actually claim about power, how a ring drifts with temperature and how a heater holds it, and why the lasers are kept outside the package where they can be replaced.`,
bridge: String.raw`Product numbers are from the Broadcom Tomahawk 5 Bailly (March 2024) and Tomahawk 6 Davisson (October 2025) releases and the Nvidia Spectrum-X and Quantum-X Photonics announcement (GTC, March 2025). Those releases give relative claims, 3.5 times power efficiency and more than 70 percent optical interconnect power saving, so the pJ/bit numbers here are secondary estimates and are labelled as such. The ring drift of 0.08 nm/K for a 500 by 220 nm silicon ring is from US patent RE48654.`,
cards: [

{s: "1. Fiber attach", t: "Four ways to attach a fiber",
intu: String.raw`Light has to get from a 9 µm fiber core into a sub-micron waveguide. Edge coupling with a V-groove array passively aligns a row of fibers to inverted tapers. Grating couplers let a fiber come in from the top, which allows wafer level test before dicing. Detachable connectors mount a fiber array onto a mating feature so the optics can be serviced. Pick a method, then slide the alignment offset to see how fast the coupling falls. The mode overlap sets the tolerance, so a wide mode at the facet is more forgiving.`,
eq: String.raw`\[ \eta(\Delta x) = \eta_0\, e^{-2\Delta x^2 / (w_1^2 + w_2^2)}, \qquad \eta_0 = \left(\frac{2 w_1 w_2}{w_1^2 + w_2^2}\right)^2 \]<div class="eqref">overlap of two Gaussian modes of radii w1 and w2 with a lateral offset</div>`,
sym: [[String.raw`\(w_1, w_2\)`, "mode field radii of the fiber and of the chip mode at the facet, 5.2 µm for standard fiber, 1.5 to 5 µm for a spot size converter"], [String.raw`\(\Delta x\)`, "lateral misalignment"], [String.raw`\(\eta_0\)`, "best case coupling with the sizes matched"]],
how: ["Write both modes as Gaussians and integrate their product.", "Unequal sizes lose power even when aligned, by the factor eta0.", "An offset adds the exponential, so the 1 dB tolerance is about 0.3 times the mode radius for matched modes.", "A spot size converter widens the chip mode to a few microns so that passive placement within a micron still couples well."],
say: String.raw`Coupling between two Gaussian modes falls as exp of minus two offset squared over the sum of the squared radii, so a larger mode at the facet tolerates more misalignment.`,
num: "Standard fiber MFD 10.4 µm at 1550 nm. Lensed or high NA fiber MFD 3 to 4 µm. Edge coupler with spot size converter: 1 dB, 0.5 µm tolerance for 1 dB extra. Grating coupler: 2 to 4 dB, 2 µm tolerance, 30 to 40 nm 1 dB bandwidth. Fiber pitch in arrays 127 or 250 µm.",
r(fig, ctl) {
  ctl.innerHTML = btns([[0, "V-groove edge array"], [1, "Edge, lensed fiber"], [2, "Grating, top"], [3, "Detachable connector"]], "m") + sl("dx", "Alignment offset (µm)", 0, 5, 0.1, 0.5);
  let m = 0;
  const u = () => {
    pick(ctl, "m", m); const dx = +$("dx").value; $("dxv").textContent = dx.toFixed(1) + " µm";
    const w1 = [5.2, 2.0, 5.2, 5.2][m], w2 = [4.0, 1.8, 5.0, 4.0][m]; const eta0 = Math.pow(2 * w1 * w2 / (w1 * w1 + w2 * w2), 2); const eta = eta0 * Math.exp(-2 * dx * dx / (w1 * w1 + w2 * w2)); const extra = [0.5, 0.8, 2.5, 1.0][m];
    const loss = -PIC.dB(eta) + extra;
    let s = tx(340, 22, `matched overlap ${(eta0 * 100).toFixed(0)} percent, with offset ${(eta * 100).toFixed(0)} percent, total about ${loss.toFixed(1)} dB`, "middle", "th");
    const x0 = 40, y0 = 60; s += R(x0, y0 + 60, 260, 60, M.si) + tx(x0 + 130, y0 + 130, "chip", "middle");
    if (m === 0) { for (let i = 0; i < 3; i++) { s += `<polygon points="${x0 + 60 + i * 70},${y0 + 60} ${x0 + 90 + i * 70},${y0 + 60} ${x0 + 75 + i * 70},${y0 + 80}" fill="var(--panel)"/>` + R(x0 + 70 + i * 70, y0 + 10, 10, 60, M.fiber); } s += tx(x0 + 130, y0, "fibers in etched V-grooves, passive alignment", "middle"); }
    if (m === 1) { s += R(x0 - 30, y0 + 86, 70, 8, M.fiber) + `<path d="M${x0 + 40} ${y0 + 82} Q${x0 + 52} ${y0 + 90} ${x0 + 40} ${y0 + 98}" fill="${M.fiber}"/>` + R(x0 + 40, y0 + 88, 60, 4, "#5d7694") + tx(x0 + 130, y0 + 40, "lensed fiber focused onto an inverted taper", "middle"); }
    if (m === 2) { s += R(x0 + 120, y0 - 10, 10, 70, M.fiber, "none", 'transform="rotate(-10 ' + (x0 + 125) + ' ' + (y0 + 60) + ')"') + tx(x0 + 130, y0 + 20, "fiber near vertical over a grating", "middle"); for (let i = 0; i < 8; i++) s += R(x0 + 100 + i * 8, y0 + 60, 4, 6, "#5d7694"); }
    if (m === 3) { s += R(x0 + 40, y0 + 20, 180, 40, M.pkg, "var(--p)") + tx(x0 + 130, y0 + 44, "mating ferrule", "middle"); for (let i = 0; i < 4; i++) s += R(x0 + 70 + i * 40, y0 - 10, 8, 30, M.fiber); s += tx(x0 + 130, y0, "fiber array plugs onto an alignment feature", "middle"); }
    const px = 380, pw = 240, py = 60, ph = 130; s += PIC.yaxis(px, py, ph, 0, 1, 2, "coupling", v => v.toFixed(1)) + PIC.xaxis(px, py + ph, pw, 0, 5, 5, "offset (µm)", v => v.toFixed(0));
    let d = ""; for (let i = 0; i <= 50; i++) { const xx = i / 50 * 5; const e = eta0 * Math.exp(-2 * xx * xx / (w1 * w1 + w2 * w2)); d += (i ? "L" : "M") + (px + i / 50 * pw).toFixed(1) + " " + (py + ph - e * ph).toFixed(1); }
    s += `<path d="${d}" fill="none" stroke="${PB}" stroke-width="2"/><circle cx="${px + dx / 5 * pw}" cy="${py + ph - eta * ph}" r="5" fill="${PC}"/>`;
    fig.innerHTML = svg(py + ph + 40, s);
  };
  ctl.querySelectorAll("button[data-m]").forEach(b => b.onclick = () => { m = +b.dataset.m; u(); }); $("dx").oninput = u; u();
}},

{s: "2. Pluggable vs CPO", t: "Where the optics sit decides the electrical path",
intu: String.raw`In a pluggable module the switch chip drives a copper trace across the board to a module at the front panel. At 100 Gb/s per lane that trace loses 10 to 20 dB from skin effect and dielectric loss, so the module needs a DSP retimer that burns watts. In co-packaged optics the optical engine sits on the switch package, the trace is a few millimetres, and the retimer disappears. Slide the trace length and watch the loss at the Nyquist frequency. Press Play to see the signal travel both paths.`,
eq: String.raw`\[ L_{\mathrm{dB}}(f) \approx \left(a\sqrt{f} + b\,f\right)\ell \]<div class="eqnote">skin effect term with root f and dielectric term with f, both proportional to trace length. For a low loss PCB stripline a about 0.15 dB per inch per root GHz and b about 0.045 dB per inch per GHz are typical</div>`,
sym: [[String.raw`\(\ell\)`, "electrical trace length"], [String.raw`\(f\)`, "frequency, the Nyquist frequency is half the symbol rate, 28 GHz for 112 Gb/s PAM4"], [String.raw`\(a, b\)`, "skin effect and dielectric loss coefficients of the board"]],
how: ["Skin effect confines current to a thin surface layer whose thickness falls as one over root f, so resistance and loss grow as root f.", "The dielectric loss tangent gives a loss that grows linearly with f.", "Both scale with length. A 25 cm trace at 28 GHz loses about 20 dB. A 5 mm trace loses under 1 dB.", "A lossy channel needs equalization and a retimer, which is the DSP in the pluggable, typically 5 to 10 W of its power."],
say: String.raw`Co-packaged optics shortens the electrical path from tens of centimetres to millimetres, which removes nearly all of the channel loss and the retimer that fights it.`,
num: "Pluggable: 10 to 25 cm of trace, DSP retimer, 15 to 30 W per 800G or 1.6T module. CPO: a few mm, no retimer. Broadcom Bailly: 8 engines of 6.4 Tb/s on one package. Nvidia: 1.6 Tb/s ports with the optical engines on the switch package.",
r(fig, ctl) {
  ctl.innerHTML = sl("len", "Trace length (cm)", 0.2, 30, 0.2, 15) + sl("f", "Nyquist frequency (GHz)", 5, 60, 1, 28);
  const draw = t => {
    const len = +$("len").value, f = +$("f").value; $("lenv").textContent = len.toFixed(1) + " cm"; $("fv").textContent = f + " GHz";
    const ab = 0.15 * Math.sqrt(f) + 0.045 * f; const inch = len / 2.54; const loss = ab * inch; const lossCPO = ab * 0.5 / 2.54;
    let s = tx(340, 22, `${len} cm trace at ${f} GHz: ${loss.toFixed(1)} dB. A 5 mm CPO trace: ${lossCPO.toFixed(2)} dB`, "middle", "th");
    const x0 = 40; const ph = (t * 0.4) % 1;
    // pluggable row
    s += R(x0, 60, 600, 50, M.pcb, "none", 'opacity="0.35"') + R(x0 + 20, 70, 60, 30, M.asic) + tx(x0 + 50, 90, "switch", "middle", "t") + R(x0 + 460, 66, 120, 38, M.pkg, "var(--p)") + tx(x0 + 520, 82, "pluggable", "middle") + tx(x0 + 520, 98, "DSP + optics", "middle");
    s += `<line x1="${x0 + 80}" y1="85" x2="${x0 + 460}" y2="85" stroke="${PC}" stroke-width="3"/>` + tx(x0 + 270, 78, `copper ${len} cm`, "middle") + `<circle cx="${x0 + 80 + ph * 380}" cy="85" r="${Math.max(2, 6 * Math.pow(10, -loss / 20 * 0.5))}" fill="${PB}"/>`;
    s += R(x0 + 580, 60, 12, 50, M.fiber) + tx(x0 + 586, 54, "fiber", "middle");
    // CPO row
    s += R(x0, 150, 600, 50, M.pcb, "none", 'opacity="0.35"') + R(x0 + 200, 155, 240, 40, M.pkg, "var(--p)") + R(x0 + 270, 160, 60, 30, M.asic) + tx(x0 + 300, 180, "switch", "middle", "t") + R(x0 + 350, 162, 40, 26, M.oe) + tx(x0 + 370, 178, "OE", "middle", "t") + R(x0 + 210, 162, 40, 26, M.oe) + tx(x0 + 230, 178, "OE", "middle", "t");
    s += `<line x1="${x0 + 330}" y1="175" x2="${x0 + 350}" y2="175" stroke="${PC}" stroke-width="3"/><circle cx="${x0 + 330 + ph * 20}" cy="175" r="6" fill="${PB}"/>` + tx(x0 + 340, 150, "5 mm", "middle") + R(x0 + 390, 170, 180, 10, M.fiber) + tx(x0 + 520, 212, "fiber leaves the package", "middle");
    s += tx(x0, 130, "pluggable transceiver at the front panel") + tx(x0, 220, "co-packaged optics: optical engines (OE) on the switch package");
    const px = 60, pw = 560, py = 250, phh = 90; s += PIC.yaxis(px, py, phh, 0, 40, 4, "loss (dB)", v => v.toFixed(0)) + PIC.xaxis(px, py + phh, pw, 0, 30, 6, "trace length (cm)", v => v.toFixed(0));
    let d = ""; for (let i = 0; i <= 60; i++) { const l = i / 60 * 30; const v = Math.min(40, ab * l / 2.54); d += (i ? "L" : "M") + (px + i / 60 * pw).toFixed(1) + " " + (py + phh - v / 40 * phh).toFixed(1); } s += `<path d="${d}" fill="none" stroke="${PB}" stroke-width="2"/><circle cx="${px + len / 30 * pw}" cy="${py + phh - Math.min(40, loss) / 40 * phh}" r="5" fill="${PC}"/>`;
    fig.innerHTML = svg(py + phh + 40, s);
  };
  PIC.player(ctl, draw);
}},

{s: "3. Power claims", t: "What the vendors claim, and what is an estimate",
intu: String.raw`Nvidia says its photonic switches give 3.5 times the power efficiency of pluggables and need 4 times fewer lasers. Broadcom says Bailly saves more than 70 percent of the optical interconnect power. Neither publishes an audited energy per bit. Secondary analyses put a DSP pluggable at 15 to 20 pJ/bit and a CPO engine near 5 pJ/bit, and the research target is below 1 pJ/bit. Pick a scenario and compare. The bars are coloured by how trustworthy the number is.`,
eq: String.raw`\[ E_{\mathrm{bit}} = \frac{P_{\mathrm{link}}}{B}, \qquad \text{saving} = 1 - \frac{E_{\mathrm{CPO}}}{E_{\mathrm{plug}}} \]`,
sym: [[String.raw`\(E_{\mathrm{bit}}\)`, "energy per bit, J/bit"], [String.raw`\(P_{\mathrm{link}}\)`, "power of one link including laser, driver, DSP if any, receiver"], [String.raw`\(B\)`, "bit rate"]],
how: ["Divide link power by bit rate. A 30 W pluggable at 1.6 Tb/s is 18.75 pJ/bit, which matches the quoted 15 to 20 pJ/bit class.", "The 3.5 times claim implies about 5 pJ/bit if the pluggable is 18, which agrees with the APNIC estimate for Bailly of 5.5 W per 800G port.", "The 70 percent saving claim is consistent: 1 minus 5 over 18 is 72 percent.", "Treat every pJ/bit value as an estimate until a vendor publishes a measured one."],
say: String.raw`Vendor CPO claims are relative, 3.5 times and 70 percent, and the pJ/bit figures that fit them, about 5 against 15 to 20, are secondary estimates.`,
num: "Nvidia GTC 2025: 3.5 times power efficiency, 63 times signal integrity, 4 times fewer lasers, 1.6 Tb/s ports (vendor claims). Broadcom Bailly: 51.2 Tb/s, more than 70 percent optical power saving (vendor claim). APNIC 2025: 5.5 W per 800G port, 6 to 7 pJ/bit (estimate). Six transceivers per GPU at 30 W each, 180 W (Nvidia quote, 2025).",
r(fig, ctl) {
  ctl.innerHTML = btns([[0, "Per link"], [1, "Per GPU, 6 links"], [2, "Per 100k GPU cluster"]], "sc");
  let sc = 0;
  const u = () => {
    pick(ctl, "sc", sc); const mult = [1, 6, 600000][sc]; const unit = sc === 2 ? "MW" : "W"; const conv = sc === 2 ? 1e-6 : 1;
    const items = [["DSP pluggable", 18, PC, "estimate"], ["CPO engine", 5, PT, "estimate from 3.5x claim"], ["Research target", 1, PP, "target"]];
    let s = tx(340, 22, `at 1.6 Tb/s per link, ${sc === 0 ? "one link" : sc === 1 ? "one GPU with six links" : "100 000 GPUs"}`, "middle", "th");
    const x0 = 80, w = 400, y0 = 50, h = 170; s += PIC.yaxis(x0, y0, h, 0, 20, 4, "pJ/bit", v => v.toFixed(0));
    items.forEach(([n, v, c, tag], i) => { const x = x0 + 40 + i * 130, hb = v / 20 * h; s += R(x, y0 + h - hb, 90, hb, c, "none", 'opacity="0.8"') + tx(x + 45, y0 + h - hb - 6, `${v} pJ/bit`, "middle") + tx(x + 45, y0 + h + 16, n, "middle") + tx(x + 45, y0 + h + 30, tag, "middle") + tx(x + 45, y0 + h + 46, `${(v * 1.6 * mult * conv).toFixed(sc === 2 ? 1 : 0)} ${unit}`, "middle", "t"); });
    s += tx(x0 + 200, y0 + h + 66, `saving CPO vs pluggable: ${(100 * (1 - 5 / 18)).toFixed(0)} percent, consistent with the vendor claim of more than 70 percent`, "middle");
    s += tx(600, y0 + 20, "colour key", "middle", "th") + R(560, y0 + 30, 14, 14, PC) + tx(580, y0 + 42, "estimate") + R(560, y0 + 50, 14, 14, PT) + tx(580, y0 + 62, "from a claim") + R(560, y0 + 70, 14, 14, PP) + tx(580, y0 + 82, "target");
    fig.innerHTML = svg(y0 + h + 80, s);
  };
  ctl.querySelectorAll("button[data-sc]").forEach(b => b.onclick = () => { sc = +b.dataset.sc; u(); }); u();
}},

{s: "4. Thermal drift", t: "A ring drifts 0.08 nm per kelvin, so a heater must hold it",
intu: String.raw`Silicon's index rises with temperature, so a ring's resonance moves to longer wavelength, about 0.08 nm per kelvin for a 500 by 220 nm ring. A switch package swings by tens of kelvin, which moves the ring by several channel spacings. The fix is a heater on the ring and a feedback loop that keeps the resonance on the laser line. Slide the package temperature with feedback off and watch the ring fall off its channel. Turn feedback on and watch the heater take over. Press Play to see the drift happen in time.`,
eq: String.raw`\[ \frac{d\lambda_{\mathrm{res}}}{dT} = \frac{\lambda}{n_g}\left(\frac{dn_{\mathrm{eff}}}{dT}\right) \approx \frac{1550\ \mathrm{nm}}{4.2}\times 1.86\times10^{-4}\ \mathrm{K^{-1}} \times \Gamma_{\mathrm{Si}} \approx 0.08\ \mathrm{nm/K} \]`,
sym: [[String.raw`\(dn_{\mathrm{eff}}/dT\)`, "thermo-optic coefficient of the mode, from silicon's 1.86e-4 per K scaled by the confinement"], [String.raw`\(n_g\)`, "group index, about 4.2 for a silicon strip"], [String.raw`\(\Gamma_{\mathrm{Si}}\)`, "fraction of the mode in silicon, 0.8 to 0.9"]],
how: [String.raw`The resonance condition is \(m\lambda = n_{\mathrm{eff}} L\). Differentiate with respect to T and use the group index for the dispersion.`, "Silicon's thermo-optic coefficient is large and positive. Nitride's is ten times smaller.", "A 10 K swing moves a silicon ring 0.8 nm, a full 100 GHz channel.", "The heater raises the ring above the hottest ambient so that feedback can always add or remove a little heat."],
say: String.raw`A silicon ring drifts about 0.08 nm per kelvin, so a heater with feedback locks it to the laser.`,
num: "US patent RE48654: 0.08 nm/K for a 500 by 220 nm silicon ring. Thermo-optic coefficients: Si 1.86e-4 per K, SiN 2.5e-5 per K, SiO2 1e-5 per K. Heater tuning 1 to 3 mW per nm. Nvidia Quantum-X photonic switches are liquid cooled.",
r(fig, ctl) {
  ctl.innerHTML = sl("T", "Package temperature (°C)", 20, 90, 1, 45) + btns([[0, "Feedback off"], [1, "Feedback on"]], "fb");
  let fb = 0;
  const draw = t => {
    pick(ctl, "fb", fb); const T = +$("T").value; $("Tv").textContent = T + " °C";
    const wobble = 5 * Math.sin(t * 0.8); const Tamb = T + wobble; const drift = 0.08 * (Tamb - 45); const heat = fb ? Math.max(0, 1.2 - drift) : 1.2; const lamRes = 1550 + drift + heat - 1.2;
    const x0 = 60, w = 400, y0 = 50, h = 140; const lam0 = 1547, lam1 = 1553;
    let s = tx(340, 22, `ambient ${Tamb.toFixed(1)} °C, resonance ${lamRes.toFixed(2)} nm, heater ${(heat * 2).toFixed(1)} mW`, "middle", "th");
    s += PIC.yaxis(x0, y0, h, 0, 1, 2, "through", v => v.toFixed(1)) + PIC.xaxis(x0, y0 + h, w, lam0, lam1, 6, "wavelength (nm)", v => v.toFixed(0));
    const ng = 4.2, Lr = 2 * Math.PI * 10, r = 0.95, a = 0.98;
    let d = ""; for (let i = 0; i <= 300; i++) { const lam = lam0 + i / 300 * (lam1 - lam0); const phi = 2 * Math.PI * ng * Lr * (1 / lam - 1 / lamRes) * 1000; const Tt = PIC.ringAllPass(r, a, phi); d += (i ? "L" : "M") + (x0 + i / 300 * w).toFixed(1) + " " + (y0 + h - Tt * h).toFixed(1); }
    s += `<path d="${d}" fill="none" stroke="${PB}" stroke-width="2"/>` + `<line x1="${x0 + (1550 - lam0) / (lam1 - lam0) * w}" y1="${y0}" x2="${x0 + (1550 - lam0) / (lam1 - lam0) * w}" y2="${y0 + h}" stroke="${PC}" stroke-width="2" stroke-dasharray="5 3"/>` + tx(x0 + (1550 - lam0) / (lam1 - lam0) * w + 4, y0 + 12, "laser line");
    const onLine = Math.abs(lamRes - 1550) < 0.1; s += tx(x0 + w / 2, y0 + h + 52, onLine ? "ring on the channel" : `ring off by ${(lamRes - 1550).toFixed(2)} nm, ${Math.abs(lamRes - 1550) > 0.4 ? "channel lost" : "degraded"}`, "middle", "t");
    const rx = 560, ry = 120; s += `<circle cx="${rx}" cy="${ry}" r="40" fill="none" stroke="${PB}" stroke-width="6"/><circle cx="${rx}" cy="${ry}" r="40" fill="none" stroke="${M.heat}" stroke-width="3" opacity="${Math.min(1, heat / 2)}" stroke-dasharray="6 4"/>` + tx(rx, ry + 62, "heater (red) on the ring", "middle");
    fig.innerHTML = svg(y0 + h + 66, s);
  };
  ctl.querySelectorAll("button[data-fb]").forEach(b => b.onclick = () => { fb = +b.dataset.fb; });
  PIC.player(ctl, draw);
}},

{s: "5. Heater power", t: "Heater tuning: nanometres of shift cost milliwatts",
intu: String.raw`A heater is a resistor above the ring. Its power raises the ring temperature by the thermal resistance times the power, and the temperature shifts the resonance by 0.08 nm per kelvin. Thermal isolation trenches raise the thermal resistance so that less power gives the same shift, at the price of a slower response. Slide the heater power and the thermal resistance. Rings in a WDM transmitter each need their own heater, so the heater budget scales with the lane count.`,
eq: String.raw`\[ \Delta T = R_{\mathrm{th}} P_{\mathrm{heater}}, \qquad \Delta\lambda = \frac{d\lambda}{dT}\,R_{\mathrm{th}} P_{\mathrm{heater}}, \qquad \tau_{\mathrm{th}} = R_{\mathrm{th}} C_{\mathrm{th}} \]`,
sym: [[String.raw`\(R_{\mathrm{th}}\)`, "thermal resistance from heater to ring, 1 to 10 K/mW, higher with isolation trenches"], [String.raw`\(P_{\mathrm{heater}}\)`, "electrical power in the heater"], [String.raw`\(C_{\mathrm{th}}\)`, "heat capacity of the heated volume"], [String.raw`\(\tau_{\mathrm{th}}\)`, "thermal time constant, microseconds"]],
how: ["Steady state heat flow is temperature rise over thermal resistance, like Ohm's law.", "Multiply the rise by the drift coefficient for the wavelength shift.", "The time constant is the thermal RC product. Isolation raises R and slows the loop.", "A full free spectral range of tuning, about 10 nm for a 10 µm ring, costs 10 to 30 mW without trenches and a few mW with them."],
say: String.raw`Heater tuning shifts the ring by the drift coefficient times thermal resistance times power, and isolation lowers the power at the cost of speed.`,
num: "Typical: 2 to 3 mW per nm without trenches, 0.2 to 0.5 mW per nm with deep trenches and undercut. Time constants 5 to 50 µs. A 16 lane transmitter can spend 50 to 200 mW on heaters, a few percent of the link power.",
r(fig, ctl) {
  ctl.innerHTML = sl("P", "Heater power (mW)", 0, 30, 0.5, 8) + sl("Rth", "Thermal resistance (K/mW)", 0.5, 12, 0.5, 4);
  const u = () => {
    const P = +$("P").value, Rth = +$("Rth").value; $("Pv").textContent = P + " mW"; $("Rthv").textContent = Rth + " K/mW";
    const dT = Rth * P, dl = 0.08 * dT; const tau = Rth * 5; // us, with C_th about 5 uJ/K scaled
    let s = tx(340, 22, `ΔT = ${dT.toFixed(0)} K, shift ${dl.toFixed(2)} nm, about ${(dl / 0.8).toFixed(1)} channels of 100 GHz, τ about ${tau.toFixed(0)} µs`, "middle", "th");
    const x0 = 60, w = 320, y0 = 50, h = 150; s += PIC.yaxis(x0, y0, h, 0, 10, 5, "shift (nm)", v => v.toFixed(0)) + PIC.xaxis(x0, y0 + h, w, 0, 30, 6, "heater power (mW)", v => v.toFixed(0));
    [[1, PT], [4, PB], [10, PP]].forEach(([rr, c]) => { s += `<line x1="${x0}" y1="${y0 + h}" x2="${x0 + w}" y2="${y0 + h - Math.min(10, 0.08 * rr * 30) / 10 * h}" stroke="${c}" stroke-width="2"/>`; });
    s += `<circle cx="${x0 + P / 30 * w}" cy="${y0 + h - Math.min(10, dl) / 10 * h}" r="5" fill="${PC}"/>` + tx(x0 + w, y0 + 12, "R_th = 1, 4, 10 K/mW", "end");
    // cross-section with heater and trenches
    const cx = 540, cy = 130; s += R(cx - 90, cy, 180, 50, M.ox) + R(cx - 25, cy + 20, 50, 16, M.si, "#5d7694") + R(cx - 30, cy - 10, 60, 6, M.heat) + tx(cx, cy - 16, "heater", "middle");
    if (Rth > 5) { s += R(cx - 85, cy, 14, 50, "var(--bg)") + R(cx + 71, cy, 14, 50, "var(--bg)") + tx(cx, cy + 66, "isolation trenches", "middle"); } else s += tx(cx, cy + 66, "no trenches, heat spreads", "middle");
    for (let i = 0; i < 5; i++) s += `<line x1="${cx - 40 + i * 20}" y1="${cy - 4}" x2="${cx - 40 + i * 20 + (Rth > 5 ? 0 : 10)}" y2="${cy + 48}" stroke="${M.heat}" stroke-width="1" opacity="0.5"/>`;
    fig.innerHTML = svg(y0 + h + 40, s);
  };
  $("P").oninput = u; $("Rth").oninput = u; u();
}},

{s: "6. Replaceable lasers", t: "Reliability: why the lasers live outside the package",
intu: String.raw`A switch package with eight optical engines carries hundreds of lanes, and a laser is the part most likely to fail. If a dead laser meant replacing a 50 000 dollar switch, nobody would buy co-packaged optics. So the lasers sit in pluggable modules at the front panel, the external laser source, and feed the engines through fiber. Broadcom's Davisson uses field replaceable ELSFP lasers, and Nvidia claims 4 times fewer lasers by sharing one laser across many lanes. Slide the laser count and the failure rate. Press Play to see lasers fail over the years.`,
eq: String.raw`\[ \lambda_{\mathrm{sys}} = \sum_i \lambda_i = N_{\mathrm{laser}}\,\lambda_{\mathrm{laser}}, \qquad \mathrm{MTBF} = \frac{1}{\lambda_{\mathrm{sys}}}, \qquad \mathrm{FIT} = \text{failures per } 10^9 \text{ hours} \]`,
sym: [[String.raw`\(\lambda_i\)`, "failure rate of part i"], [String.raw`\(N_{\mathrm{laser}}\)`, "number of lasers in the system"], [String.raw`\(\mathrm{MTBF}\)`, "mean time between failures of the system"], ["FIT", "failures in time, per billion hours, 100 to 1000 FIT for a telecom laser"]],
how: ["Failure rates of independent parts add, so the system rate is the sum.", "A switch with 512 lasers at 500 FIT fails about every 3900 hours, roughly every five months.", "Sharing one laser over 4 or 8 lanes divides the count. Putting the lasers in replaceable modules makes the failure a swap, not a scrap.", "Everything else on the package, modulators and detectors, has FIT rates ten to a hundred times lower."],
say: String.raw`Failure rates add, so a package with hundreds of lasers would fail often, which is why CPO keeps lasers in replaceable external modules and shares each over many lanes.`,
num: "Telecom DFB laser: 100 to 1000 FIT depending on temperature and qualification. 512 lasers at 500 FIT: MTBF about 3900 hours. 64 shared lasers at 500 FIT: 31 000 hours, 3.5 years. Broadcom Davisson: field replaceable ELSFP laser modules. Nvidia: 4 times fewer lasers.",
r(fig, ctl) {
  ctl.innerHTML = sl("N", "Lasers in the switch", 16, 1024, 16, 512) + sl("fit", "FIT per laser", 50, 2000, 50, 500);
  const rng = C3 && C3.rng ? C3.rng(51) : Math.random; const times = Array.from({ length: 1024 }, () => -Math.log(1 - rng()));
  const draw = t => {
    const N = +$("N").value, fit = +$("fit").value; $("Nv").textContent = N; $("fitv").textContent = fit + " FIT";
    const lam = N * fit * 1e-9; const mtbf = 1 / lam; const years = (t * 0.5) % 6;
    let s = tx(340, 22, `system failure rate ${(lam * 8760).toFixed(2)} per year, MTBF ${(mtbf / 8760).toFixed(2)} years`, "middle", "th");
    const x0 = 40, y0 = 50; const cols = 32, rows = Math.ceil(N / cols), sz = Math.min(12, 180 / rows); let failed = 0;
    for (let i = 0; i < N; i++) { const tf = times[i] / (fit * 1e-9) / 8760; const dead = tf < years; if (dead) failed++; s += R(x0 + (i % cols) * (sz + 2), y0 + Math.floor(i / cols) * (sz + 2), sz, sz, dead ? PC : PT); }
    s += tx(x0, y0 + rows * (sz + 2) + 16, `${years.toFixed(1)} years: ${failed} of ${N} lasers failed (one random draw)`);
    const px = 500, py = 60; s += R(px, py, 140, 60, M.pkg, "var(--p)") + tx(px + 70, py + 35, "switch package", "middle") + R(px, py + 100, 140, 40, "var(--sunk)", "var(--p)") + tx(px + 70, py + 125, "external lasers", "middle") + `<line x1="${px + 70}" y1="${py + 60}" x2="${px + 70}" y2="${py + 100}" stroke="${M.fiber}" stroke-width="3"/>` + tx(px + 70, py + 160, "swap a module, not the switch", "middle");
    fig.innerHTML = svg(Math.max(240, y0 + rows * (sz + 2) + 30), s);
  };
  PIC.player(ctl, draw);
}}
],
summary: String.raw`Fibers attach by V-groove edge arrays, lensed fibers, top gratings or detachable connectors, with a tolerance set by the mode overlap. A pluggable module drives tens of centimetres of copper that lose tens of dB at 28 GHz and need a retimer, while co-packaged optics shortens that to millimetres. Vendors claim 3.5 times and 70 percent power improvements, and the pJ/bit numbers that fit them are estimates. A silicon ring drifts 0.08 nm per kelvin, so heaters with feedback hold it at a few milliwatts per nanometre. Failure rates add, so the lasers live in replaceable external modules and are shared across lanes.`,
sheet: [
[String.raw`\[ \eta(\Delta x) = \eta_0 e^{-2\Delta x^2/(w_1^2 + w_2^2)} \]`, "Fiber to chip overlap with offset"],
[String.raw`\[ L_{\mathrm{dB}}(f) \approx (a\sqrt f + b f)\,\ell \]`, "Copper channel loss"],
[String.raw`\[ E_{\mathrm{bit}} = P_{\mathrm{link}}/B \]`, "Energy per bit, estimates only for products"],
[String.raw`\[ d\lambda/dT = (\lambda/n_g)\, dn_{\mathrm{eff}}/dT \approx 0.08\ \mathrm{nm/K} \]`, "Ring thermal drift"],
[String.raw`\[ \Delta\lambda = (d\lambda/dT) R_{\mathrm{th}} P_{\mathrm{heater}}, \quad \tau = R_{\mathrm{th}} C_{\mathrm{th}} \]`, "Heater tuning and speed"],
[String.raw`\[ \lambda_{\mathrm{sys}} = N\lambda_{\mathrm{laser}}, \quad \mathrm{MTBF} = 1/\lambda_{\mathrm{sys}} \]`, "Failure rates add"]],
consts: String.raw`Silicon thermo-optic coefficient 1.86e-4 per K, group index 4.2. Copper loss coefficients 0.15 dB per inch per root GHz and 0.045 dB per inch per GHz are typical low loss board values, about 2 dB per inch at 28 GHz. pJ/bit values are secondary estimates.`,
sources: ["Broadcom, Tomahawk 5 Bailly co-packaged optics release, March 2024, and Tomahawk 6 Davisson release, October 2025 (102.4 Tb/s, 200 Gb/s per link, ELSFP lasers)", "Nvidia, Spectrum-X and Quantum-X Photonics, GTC March 2025 (3.5 times power efficiency, 4 times fewer lasers, 1.6 Tb/s ports)", "APNIC blog, Co-packaged optics: a deep dive, May 2025 (secondary pJ/bit estimates)", "US patent RE48654, silicon ring resonance sensitivity 0.08 nm/K", "G. Cocorullo and I. Rendina, Thermo-optical modulation at 1.5 µm in silicon etalon, Electron. Lett. 28, 83 (1992), thermo-optic coefficient of silicon", "W. B. Joyce and B. C. DeLoach, Alignment of Gaussian beams, Appl. Opt. 23, 4187 (1984), Gaussian overlap with offset"]
});
})();

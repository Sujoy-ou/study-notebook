(function () {
/* Part 2 Lesson 1: the CMOS silicon photonics process flow, drawn as a cross-section that is built step by step. */
const PC = "#D85A30", PB = "#378ADD", PT = "#1D9E75", PP = "#7F77DD", PA = "#BA7517";
const tx = (x, y, t, a, cls) => `<text class="${cls || "ts"}" x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""}>${t}</text>`;
const R = (x, y, w, h, fill, stroke, extra) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke || "none"}" stroke-width="1" ${extra || ""}/>`;
/* material colours */
const M = { si: "#8fa6c2", box: "#e7d9b6", ox: "#efe6cc", res: "#c9a0dc", ge: "#b56f5e", sin: "#9fd1c7", metal: "#7b7f86", p: "#f3b0a0", n: "#a0c4f3", heater: "#d9a441", handle: "#c4cad3" };
const wrap = (x, y, text, n) => { const words = text.split(" "); let line = "", out = "", ly = y; for (const w of words) { if ((line + " " + w).length > n) { out += tx(x, ly, line); ly += 16; line = w; } else line = line ? line + " " + w : w; } return out + tx(x, ly, line); };

/* ---- the cross-section builder ---- */
const Y0 = 190, X0 = 40, W = 600; // substrate top at Y0, drawn 1 px = 1 nm for the thin layers, BOX compressed
const STEPS = [
  ["SOI wafer", "Start: a silicon handle wafer, a 2 µm buried oxide (BOX), and a 220 nm single-crystal silicon device layer. Everything optical is carved out of these 220 nm."],
  ["Resist and lithography", "Spin a photoresist, expose it with 193 nm light through a mask, develop. The resist now carries the waveguide pattern. The exposed regions (lighter) will be opened."],
  ["Partial etch, 70 nm", "A shallow etch of 70 nm makes grating teeth and the shallow ribs. The silicon under the teeth stays 150 nm thick."],
  ["Full etch, 220 nm", "A second lithography and a full etch down to the BOX isolates the strip waveguide on the left and leaves a 70 nm slab beside the rib on the right."],
  ["Implants", "Ion implantation through resist windows makes p and n regions in the rib slab. Together they form the diode of a modulator."],
  ["Oxide fill and CMP", "Deposit silicon dioxide over everything, then polish it flat with chemical mechanical planarization. The next layer needs a flat floor."],
  ["Ge epitaxy", "Open a window in the oxide and grow germanium selectively on the silicon. Germanium absorbs at 1550 nm, so this becomes the photodetector."],
  ["SiN layer", "Deposit a silicon nitride film by PECVD, pattern and etch it, fill with oxide again. This is a second waveguide layer above the silicon."],
  ["Contacts and metal", "Etch vias down to the implants and the germanium, fill with tungsten, add copper or aluminium lines. The chip is now wired."],
  ["Heater", "A thin metal resistor above a ring shifts its temperature by tens of kelvin to tune the resonance. The last step of the flow."]];
function stack(step, tsec) {
  let s = "";
  const yBox = Y0 - 60, ySi = yBox - 55; // Si device layer drawn 55 px high (1 px = 4 nm), BOX 60 px
  s += R(X0, Y0, W, 60, M.handle) + tx(X0 + W / 2, Y0 + 36, "Si handle wafer (725 µm)", "middle");
  s += R(X0, yBox, W, 60, M.box) + tx(X0 + W / 2, yBox + 36, "buried oxide, 2 µm", "middle");
  // oxide cladding goes behind the silicon shapes so they stay visible
  if (step >= 5) s += R(X0, ySi - 60, W, 115, M.ox, "#d9ccaa") + tx(X0 + 6, ySi - 44, "SiO₂ cladding, polished flat");
  if (step >= 7) s += R(X0, ySi - 110, W, 50, M.ox, "#d9ccaa");
  const si = (x, w, h) => R(x, ySi + 55 - h, w, h, M.si, "#5d7694");
  const g = 17; // partial etch 70 nm = 17 px
  if (step === 0) s += si(X0, W, 55);
  if (step === 1) { s += si(X0, W, 55); s += R(X0, ySi - 22, W, 22, M.res); for (const [a, b] of [[X0, 100], [200, 30], [240, 20], [280, 20], [320, 20], [360, 240]]) s += R(a, ySi - 22, b, 22, "#eadcf0"); s += tx(X0 + W / 2, ySi - 28, "resist: dark = stays, light = opened", "middle"); }
  if (step === 2) { s += si(X0, 160, 55) + si(360, 240, 55); for (let i = 0; i < 6; i++) s += si(200 + i * 24, 12, 55); s += si(200, 140, 55 - g); }
  if (step >= 3) { s += si(100, 32, 55); for (let i = 0; i < 6; i++) s += si(200 + i * 24, 12, 55); s += si(200, 140, 55 - g); s += si(400, 200, 17); s += si(470, 50, 55); }
  if (step >= 4) s += R(400, ySi + 38, 70, 17, M.p) + R(530, ySi + 38, 70, 17, M.n) + tx(435, ySi + 50, "p", "middle", "t") + tx(565, ySi + 50, "n", "middle", "t");
  if (step >= 6) s += R(130, ySi - 20, 40, 40, M.ge, "#7a4a3f") + tx(150, ySi + 5, "Ge", "middle", "t");
  if (step >= 7) s += R(240, ySi - 100, 60, 25, M.sin, "#3f8f80") + R(380, ySi - 100, 60, 25, M.sin, "#3f8f80") + tx(270, ySi - 83, "SiN", "middle", "t") + tx(410, ySi - 83, "SiN", "middle", "t");
  if (step >= 8) { for (const x of [150, 435, 565]) s += R(x - 4, ySi - 110, 8, x === 150 ? 90 : 148, M.metal); s += R(120, ySi - 125, 70, 14, M.metal) + R(405, ySi - 125, 60, 14, M.metal) + R(535, ySi - 125, 60, 14, M.metal) + tx(X0 + 6, ySi - 130, "W vias and Cu lines"); }
  if (step >= 9) s += R(200, ySi - 140, 140, 8, M.heater) + tx(270, ySi - 146, "TiN heater above the grating", "middle");
  if (step >= 3 && tsec != null) { const ph = (tsec * 1.5) % 1; s += `<circle cx="116" cy="${ySi + 28}" r="${8 + 4 * Math.sin(ph * 2 * Math.PI)}" fill="${PC}" opacity="0.45"/>`; }
  s += tx(X0, ySi - 160, "cross-section, vertical scale exaggerated: 1 px = 4 nm in the 220 nm layer");
  return s;
}

addLesson("pic", "fab", {
level: "Foundations",
id: "pic-fab-l1", title: "The CMOS silicon photonics process flow", short: "1. The process flow",
big: String.raw`A silicon photonics chip is made in the same fabs and with the same tools as a microprocessor. The wafer starts as 220 nm of silicon on 2 µm of oxide. Lithography and etching carve waveguides, gratings and ribs out of those 220 nm. Implants make diodes, oxide fills the gaps and is polished flat, germanium is grown for detectors, a nitride layer is added above, and metal wires everything up. This lesson builds that stack one step at a time so the order makes sense, then adds the three numbers that set what a fab can draw: the lithography resolution, the overlay between layers, and the yield across a wafer.`,
bridge: String.raw`The flow is the generic one shared by the silicon photonics foundries (AIM Photonics, GlobalFoundries, imec). Exact thicknesses and layer names differ between process design kits, so treat the numbers as teaching values. Resolution and depth of focus follow the Rayleigh forms in Mack, Fundamental Principles of Optical Lithography (Wiley 2007). The yield model is the Poisson form used in Part 2 Lesson 5 for dislocations.`,
cards: [

{s: "1. Build the stack", t: "The wafer, built one process step at a time",
intu: String.raw`Press Next step and watch the chip grow. The silicon device layer is only 220 nm thick, so the whole optical circuit is a pattern of 220 nm, 150 nm and 0 nm silicon. The oxide below keeps light from leaking into the handle wafer, and the oxide above is polished flat before each new layer. The order is fixed by temperature: high-temperature steps such as germanium growth come before the metal, which cannot survive them.`,
eq: String.raw`\[ \text{leak into handle} \propto e^{-2\gamma t_{\mathrm{BOX}}}, \qquad \gamma = k_0\sqrt{n_{\mathrm{eff}}^2 - n_{\mathrm{SiO_2}}^2} \]<div class="eqnote">why the buried oxide must be about 2 µm thick</div>`,
sym: [[String.raw`\(t_{\mathrm{BOX}}\)`, "buried oxide thickness, 2 µm in most platforms"], [String.raw`\(\gamma\)`, "decay constant of the mode tail in the oxide"], [String.raw`\(n_{\mathrm{eff}}\)`, "effective index of the waveguide mode, about 2.4 for a 220 by 500 nm strip at 1550 nm"], [String.raw`\(k_0 = 2\pi/\lambda\)`, "free space wavenumber"]],
how: ["Below the silicon the mode decays as exp of minus gamma times depth.", String.raw`With \(n_{\mathrm{eff}} = 2.4\) and \(n_{\mathrm{SiO_2}} = 1.44\) at 1550 nm, \(\gamma \approx 7.8\ \mathrm{\mu m^{-1}}\).`, "Through 2 µm of oxide the power falls by exp(−31), so the handle wafer sees nothing. With 1 µm it would be exp(−16), still fine. Thin BOX below 0.7 µm leaks."],
say: String.raw`The flow carves waveguides out of a 220 nm silicon layer on 2 µm of oxide, then adds diodes, germanium, nitride and metal in order of falling temperature.`,
num: "Device layer 220 nm. BOX 2 µm. Handle 725 µm. Partial etch 70 nm. Grating teeth 70 nm deep. Rib slab 70 or 150 nm. Ge thickness 0.3 to 0.8 µm. SiN 200 to 400 nm. Ten mask layers is a small photonics flow, forty is a full one with electronics.",
r(fig, ctl) {
  let k = 0;
  PIC.stepper(ctl, STEPS.length, i => { k = i; }, STEPS.map(x => x[0]));
  PIC.player(ctl, t => { let s = stack(k, t); s += `<rect x="14" y="${Y0 + 76}" width="652" height="70" rx="6" fill="var(--panel)" stroke="var(--line)"/>` + tx(24, Y0 + 96, STEPS[k][0], null, "th") + wrap(24, Y0 + 114, STEPS[k][1], 95); fig.innerHTML = svg(Y0 + 156, s); });
}},

{s: "2. Why this order", t: "Thermal budget: every step must survive the steps after it",
intu: String.raw`Each process step has a temperature, and a step cannot be followed by a hotter one that would ruin it. Germanium is grown at 600 to 700 °C, so it comes before copper, which is limited to about 400 °C. Implanted dopants spread by diffusion, and the spread grows with the square root of time at temperature. Pick a step with the buttons and read its temperature and its enemy. Slide the anneal time to see how far boron diffuses.`,
eq: String.raw`\[ L_D = 2\sqrt{D t}, \qquad D = D_0\, e^{-E_a / k_B T} \]<div class="eqref">diffusion length of a dopant during a thermal step</div>`,
sym: [[String.raw`\(L_D\)`, "distance a dopant profile spreads during the step"], [String.raw`\(D\)`, "diffusion coefficient, strongly temperature dependent"], [String.raw`\(D_0, E_a\)`, "prefactor and activation energy, for boron in silicon about 0.76 cm²/s and 3.46 eV"], [String.raw`\(t, T\)`, "time and absolute temperature of the step"]],
how: ["Fick's law makes a dopant step spread into an error function profile of width about 2 root Dt.", "D follows an Arrhenius law, so 100 °C more can mean 100 times faster diffusion.", "The total of all later steps is the thermal budget seen by a layer. Designers sum Dt over every later step.", "Metal cannot take above about 400 °C, so everything hot happens before the back end of line."],
say: String.raw`Process order follows the thermal budget: hot steps first, and dopant spread grows with the square root of the diffusion coefficient times time.`,
num: "Boron in Si at 1000 °C: D about 2e-14 cm²/s, 30 min gives L about 0.4 µm. At 700 °C: D about 2e-18 cm²/s, 30 min gives 4 nm. Ge selective epitaxy 600 to 700 °C with anneal cycles to 800 °C. LPCVD SiN 750 °C. PECVD SiN below 400 °C. Cu BEOL below 400 °C.",
r(fig, ctl) {
  const items = [["SOI", 1100, "none, it is the start"], ["Implant anneal", 1000, "would spread earlier dopants"], ["Ge epitaxy", 650, "Ge melts at 938 °C, and later steps must stay below its growth temperature"], ["LPCVD SiN", 750, "too hot for Ge or metal, so it is only used before them"], ["PECVD SiN", 380, "safe above metal"], ["Cu metal", 400, "copper diffuses and oxide softens above this"]];
  ctl.innerHTML = btns(items.map((x, i) => [i, x[0]]), "k") + sl("tm", "Anneal at 1000 °C (minutes)", 1, 120, 1, 30);
  let k = 2;
  const u = () => {
    pick(ctl, "k", k); const tm = +$("tm").value; $("tmv").textContent = tm + " min";
    const D = 0.76 * Math.exp(-3.46 / (8.617e-5 * 1273)); const L = 2 * Math.sqrt(D * tm * 60) * 1e4; // um
    const x0 = 60, w = 400, y0 = 40, h = 150;
    let s = PIC.yaxis(x0, y0, h, 0, 1200, 4, "temperature (°C)", v => v.toFixed(0));
    items.forEach((it, i) => { const x = x0 + 20 + i * 64, hb = it[1] / 1200 * h; s += R(x, y0 + h - hb, 44, hb, i === k ? PC : PB, "none", 'opacity="0.8"') + tx(x + 22, y0 + h + 14, it[0].split(" ")[0], "middle") + tx(x + 22, y0 + h - hb - 5, it[1] + "°", "middle"); });
    s += tx(340, 22, `${items[k][0]} at ${items[k][1]} °C. Enemy: ${items[k][2]}`, "middle", "th");
    // diffusion profile
    const px = 500, pw = 150; s += tx(px + pw / 2, y0 - 8, "boron profile after anneal", "middle") + R(px, y0, pw, h, "var(--sunk)", "var(--b)");
    let d = ""; for (let i = 0; i <= 60; i++) { const xum = i / 60 * 1.5; const c = 0.5 * PIC.erfc((xum - 0.2) / (L / 1 + 1e-6) * 1); const X = px + i / 60 * pw, Y = y0 + h - c * (h - 10); d += (i ? "L" : "M") + X.toFixed(1) + " " + Y.toFixed(1); }
    s += `<path d="${d}" fill="none" stroke="${PT}" stroke-width="2"/>` + tx(px + pw / 2, y0 + h + 14, `spread L = ${L.toFixed(2)} µm`, "middle");
    fig.innerHTML = svg(y0 + h + 36, s);
  };
  ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { k = +b.dataset.k; u(); }); $("tm").oninput = u; u();
}},

{s: "3. Three etch depths", t: "Three etch depths, three kinds of waveguide",
intu: String.raw`One silicon layer gives three devices depending on how deep you etch beside it. A full etch leaves a strip, tightly confining and good for sharp bends. A partial etch leaves a rib on a slab, which lets current flow in from the sides for a modulator and lowers sidewall loss. A shallow 70 nm etch makes grating teeth that scatter light out of the plane for a coupler. Choose a device and compare the slab effective index, computed live for a symmetric slab of the remaining thickness.`,
eq: String.raw`\[ \tan\!\left(\frac{k_x d}{2}\right) = \frac{\gamma}{k_x}, \qquad k_x = k_0\sqrt{n_1^2 - n_{\mathrm{eff}}^2}, \quad \gamma = k_0\sqrt{n_{\mathrm{eff}}^2 - n_2^2} \]<div class="eqref">TE slab mode condition, solved live for each remaining thickness</div>`,
sym: [[String.raw`\(d\)`, "silicon thickness that remains, 220, 150 or 70 nm"], [String.raw`\(n_1, n_2\)`, "silicon 3.48 and oxide 1.44 at 1550 nm"], [String.raw`\(n_{\mathrm{eff}}\)`, "effective index of the slab TE mode"]],
how: ["The slab equation sets how much of the mode lives inside the silicon.", "220 nm gives a high effective index and a tightly held mode. 150 nm less, 70 nm much less, and the mode spreads into the oxide.", "The rib waveguide is the 220 nm core next to the 70 or 150 nm slab. The index step between them, a few tenths, is what guides the light sideways.", "The grating alternates 220 and 150 nm, and the index contrast between them sets how strongly the grating scatters."],
say: String.raw`A full etch makes a strip, a partial etch makes a rib on a slab, and a shallow etch makes grating teeth, all from the same 220 nm layer.`,
num: "Slab TE effective index at 1550 nm: 220 nm about 2.83, 150 nm about 2.62, 70 nm about 1.98. Strip 220 by 500 nm: effective index about 2.4, minimum bend radius 5 µm. Rib with 70 nm slab: bend radius 20 to 50 µm, loss below 1 dB/cm.",
r(fig, ctl) {
  ctl.innerHTML = btns([[0, "Strip (full etch)"], [1, "Rib (partial etch)"], [2, "Grating (shallow etch)"]], "d");
  let d = 0;
  const draw = t => {
    pick(ctl, "d", d);
    const names = ["strip: 220 nm core, etched to 0 nm", "rib: 220 nm core on a 70 nm slab", "grating: teeth alternate 220 and 150 nm"];
    const rem = [0, 70, 150][d]; const neffCore = PIC.slabNeff(3.48, 1.44, 0.22, 1.55), neffSlab = rem ? PIC.slabNeff(3.48, 1.44, rem / 1000, 1.55) : 1.44;
    const y0 = 60, h = 55; let s = tx(340, 22, names[d], "middle", "th");
    s += R(40, y0 + h, 600, 40, M.box) + tx(340, y0 + h + 26, "buried oxide", "middle");
    const si = (x, w, hh) => R(x, y0 + h - hh, w, hh, M.si, "#5d7694");
    if (d === 0) s += si(290, 100, 55);
    if (d === 1) { s += si(40, 600, 17) + si(290, 100, 55); }
    if (d === 2) { for (let i = 0; i < 12; i++) s += si(160 + i * 30, 15, 55); s += si(160, 360, 38); }
    // mode blob
    const ph = (t * 2) % 1; const sz = d === 2 ? 30 : d === 1 ? 24 : 18; s += `<ellipse cx="340" cy="${y0 + h - 27}" rx="${sz + 60 * (d === 1 ? 0.4 : 0)}" ry="${sz * (d === 2 ? 0.9 : 1)}" fill="${PC}" opacity="${0.25 + 0.15 * Math.sin(ph * 2 * Math.PI)}"/>`;
    s += tx(40, y0 + h + 60, `core slab n_eff = ${neffCore.toFixed(3)}`) + tx(340, y0 + h + 60, `beside it (${rem} nm): n_eff = ${neffSlab.toFixed(3)}`) + tx(40, y0 + h + 80, `lateral index step ${(neffCore - neffSlab).toFixed(3)} holds the light in the core`);
    fig.innerHTML = svg(y0 + h + 95, s);
  };
  ctl.querySelectorAll("button[data-d]").forEach(b => b.onclick = () => { d = +b.dataset.d; });
  PIC.player(ctl, draw);
}},

{s: "4. Resolution", t: "Lithography resolution: the smallest line a fab can print",
intu: String.raw`The resolution of a projection lens is the wavelength divided by the numerical aperture, times a process factor \(k_1\) that is about 0.3 at best. The picture shows a row of lines at a pitch you choose and the blurred aerial image the lens makes of them. When the pitch drops below the resolution the contrast collapses and the resist cannot tell line from space. Change the wavelength, the NA and the pitch.`,
eq: String.raw`\[ R = k_1 \frac{\lambda}{\mathrm{NA}}, \qquad \mathrm{DOF} = k_2 \frac{\lambda}{\mathrm{NA}^2} \]<div class="eqref">Rayleigh resolution and depth of focus</div>`,
sym: [[String.raw`\(R\)`, "smallest half pitch the tool resolves"], [String.raw`\(k_1\)`, "process factor, 0.25 is the physical limit, 0.3 to 0.4 in practice"], [String.raw`\(\lambda\)`, "exposure wavelength: 365 nm i-line, 248 nm KrF, 193 nm ArF"], [String.raw`\(\mathrm{NA}\)`, "numerical aperture, up to 0.93 dry, 1.35 with water immersion"], [String.raw`\(k_2\)`, "process factor for focus, about 0.5"]],
how: ["A lens of aperture NA captures diffraction orders up to a spatial frequency NA over lambda.", "A grating of pitch p needs at least its first order to pass, so p must exceed about lambda over NA. Resolution enhancement pushes this down to k1 of 0.25.", "Higher NA gives finer lines but a shallower depth of focus, since DOF falls as NA squared.", "193 nm immersion at NA 1.35 and k1 of 0.3 gives 43 nm, far finer than any waveguide needs. The hard part in photonics is roughness and uniformity, not resolution."],
say: String.raw`Resolution is k1 times wavelength over NA, and depth of focus is k2 times wavelength over NA squared.`,
num: "193 nm, NA 1.35, k1 0.3: R = 43 nm, DOF = 53 nm. 248 nm, NA 0.8, k1 0.4: R = 124 nm. E-beam: below 10 nm but slow. A 500 nm waveguide at 193 nm is a huge feature. A 100 nm grating tooth is still comfortable.",
r(fig, ctl) {
  ctl.innerHTML = btns([[365, "365 nm"], [248, "248 nm"], [193, "193 nm"]], "lam") + sl("na", "Numerical aperture", 0.4, 1.35, 0.01, 0.93) + sl("k1", "k₁", 0.25, 0.8, 0.01, 0.35) + sl("pit", "Line pitch (nm)", 60, 600, 10, 300);
  let lam = 193;
  const u = () => {
    pick(ctl, "lam", lam); const na = +$("na").value, k1 = +$("k1").value, pit = +$("pit").value; $("nav").textContent = na.toFixed(2); $("k1v").textContent = k1.toFixed(2); $("pitv").textContent = pit + " nm";
    const Rr = k1 * lam / na, dof = 0.5 * lam / (na * na); const fc = na / lam; // cutoff spatial freq, 1/nm
    const f1 = 1 / pit; const contrast = Math.max(0, Math.min(1, (fc - f1) / (0.3 * fc))); // first order must pass the pupil, contrast fades near the cutoff
    const x0 = 40, w = 600, y0 = 50, h = 90;
    let s = tx(340, 22, `R = ${Rr.toFixed(0)} nm half pitch, DOF = ${dof.toFixed(0)} nm. Pitch ${pit} nm is ${pit / 2 >= Rr ? "resolved" : "below resolution"}`, "middle", "th");
    s += tx(x0, y0 - 6, "mask: lines at the chosen pitch");
        const scale = 600 / 2000; // px per nm
    for (let i = 0; i < 2000 / pit; i++) s += R(x0 + i * pit * scale, y0, pit * scale / 2, 24, "var(--t)");
    s += tx(x0, y0 + 48, "aerial image at the wafer (intensity), dashed = resist threshold");
    let d = ""; for (let i = 0; i <= 300; i++) { const xnm = i / 300 * 2000; const I = 0.5 + 0.5 * contrast * Math.cos(2 * Math.PI * xnm / pit); const X = x0 + i / 300 * w, Y = y0 + h + 60 - I * 70; d += (i ? "L" : "M") + X.toFixed(1) + " " + Y.toFixed(1); }
    s += `<path d="${d}" fill="none" stroke="${PB}" stroke-width="2"/>` + `<line x1="${x0}" y1="${y0 + h + 25}" x2="${x0 + w}" y2="${y0 + h + 25}" stroke="${PC}" stroke-dasharray="4 3"/>`;
    s += tx(x0, y0 + h + 70, `image contrast ${(contrast * 100).toFixed(0)} percent. ${contrast > 0.3 ? "The resist develops clean lines." : contrast > 0 ? "Marginal, lines will be rough." : "No pattern at all."}`);
    fig.innerHTML = svg(y0 + h + 85, s);
  };
  ctl.querySelectorAll("button[data-lam]").forEach(b => b.onclick = () => { lam = +b.dataset.lam; u(); }); ["na", "k1", "pit"].forEach(i => $(i).oninput = u); u();
}},

{s: "5. Overlay", t: "Overlay: lining up one layer on top of the last",
intu: String.raw`Every new mask must land on the pattern below it. Alignment marks on the wafer are measured by the stepper, and the remaining error is the overlay. Several independent errors add in quadrature. A grating etched 20 nm off its waveguide barely matters. A heater 200 nm off a ring still works. A second waveguide layer that must couple to the first cares about 100 nm. Slide the offset and watch the top layer move against the bottom one.`,
eq: String.raw`\[ \sigma_{\mathrm{overlay}} = \sqrt{\sigma_{\mathrm{align}}^2 + \sigma_{\mathrm{stage}}^2 + \sigma_{\mathrm{lens}}^2 + \sigma_{\mathrm{wafer}}^2} \]<div class="eqnote">independent errors add in quadrature, and a spec is usually 3 sigma</div>`,
sym: [[String.raw`\(\sigma_{\mathrm{align}}\)`, "error in reading the alignment marks"], [String.raw`\(\sigma_{\mathrm{stage}}\)`, "stage positioning error"], [String.raw`\(\sigma_{\mathrm{lens}}\)`, "lens distortion across the field"], [String.raw`\(\sigma_{\mathrm{wafer}}\)`, "wafer expansion and warp between layers"]],
how: ["Each source is a random error with its own standard deviation.", "Independent random errors add their variances, not their values.", "A 193 nm immersion scanner holds overlay near 2 nm. Older steppers 30 to 50 nm. E-beam to an earlier e-beam layer 10 to 20 nm.", "Design to tolerate the overlay you have. Interlayer couplers in Part 2 Lesson 4 tolerate 400 nm by design."],
say: String.raw`Overlay is the misregistration between layers, and its sources add in quadrature.`,
num: "Overlay specs: advanced scanner 2 to 3 nm, 248 nm stepper 30 nm, EBL 10 to 20 nm, contact aligner 1 µm. Alignment marks: boxes in boxes or gratings read by the tool, 100 µm wide, placed in the scribe lines.",
r(fig, ctl) {
  ctl.innerHTML = sl("dx", "Overlay offset x (nm)", -300, 300, 5, 60) + sl("dy", "Overlay offset y (nm)", -300, 300, 5, 0);
  const u = () => {
    const dx = +$("dx").value, dy = +$("dy").value; $("dxv").textContent = dx + " nm"; $("dyv").textContent = dy + " nm";
    const sc = 0.4; // px per nm
    let s = tx(340, 22, `offset ${Math.hypot(dx, dy).toFixed(0)} nm`, "middle", "th");
    // top view: lower layer waveguide + grating, upper layer heater and alignment mark
    s += tx(40, 48, "top view, lower layer in blue, upper layer in orange") + R(40, 60, 600, 200, "var(--sunk)", "var(--b)");
    s += R(60, 150, 320, 20, M.si, "#5d7694"); for (let i = 0; i < 8; i++) s += R(400 + i * 26, 140, 12, 40, M.si, "#5d7694");
    s += R(60 + dx * sc, 120 + dy * sc, 320, 12, M.heater, "none", 'opacity="0.85"') + tx(220 + dx * sc, 115 + dy * sc, "heater", "middle");
    // box in box mark
    const mx = 560, my = 90; s += R(mx - 24, my - 24, 48, 48, "none", "#5d7694") + R(mx - 12 + dx * sc, my - 12 + dy * sc, 24, 24, "none", PA) + tx(mx, my + 44, "mark", "middle");
    s += tx(40, 280, `${Math.abs(dx) < 100 && Math.abs(dy) < 100 ? "Within 100 nm: an interlayer coupler still works." : "Beyond 100 nm: an interlayer coupler loses power, a heater does not care."}`);
    fig.innerHTML = svg(295, s);
  };
  $("dx").oninput = u; $("dy").oninput = u; u();
}},

{s: "6. Wafer yield", t: "The wafer map: defects, die size and yield",
intu: String.raw`A 300 mm wafer holds hundreds of photonic dies. Random particles and defects land on it at some density, and a die that catches one may fail. The Poisson model says the chance of catching none falls exponentially with die area times defect density. Small dies survive, large dies suffer. Slide both and watch the map light up. Press Play to see the test probe walk across the wafer.`,
eq: String.raw`\[ Y = e^{-D_0 A} \]<div class="eqref">Poisson yield model, the same form as the defect-free yield in Lesson 5</div>`,
sym: [[String.raw`\(Y\)`, "fraction of dies with no killer defect"], [String.raw`\(D_0\)`, "killer defect density, per cm²"], [String.raw`\(A\)`, "die area, cm²"]],
how: ["Defects land at random with mean D0 A per die.", "For a Poisson process the probability of zero events is exp of minus the mean.", "A 1 cm² die at 0.1 per cm² yields 90 percent. A 4 cm² die yields 67 percent. A photonic die of 0.1 cm² yields 99 percent.", "Real fabs use clustered defect models, but the exponential captures the main trend."],
say: String.raw`Yield falls exponentially with die area times defect density.`,
num: "300 mm wafer: about 700 cm² usable. Mature CMOS D0 about 0.1 per cm². Photonic dies 0.1 to 1 cm². A 5 by 5 mm die gives about 2500 candidates per wafer. Each wafer costs thousands of dollars, so yield sets the price per chip.",
r(fig, ctl) {
  ctl.innerHTML = sl("D0", "Defect density (per cm²)", 0.01, 2, 0.01, 0.3) + sl("A", "Die side (mm)", 2, 25, 1, 8);
  const rng = C3 && C3.rng ? C3.rng(11) : Math.random; const rnd = Array.from({ length: 4000 }, rng);
  const draw = t => {
    const D0 = +$("D0").value, side = +$("A").value; $("D0v").textContent = D0.toFixed(2); $("Av").textContent = side + " mm";
    const A = side * side / 100, Y = Math.exp(-D0 * A);
    const cx = 200, cy = 170, Rw = 140; const px = Rw * 2 / 300 * side; // px per die
    let s = `<circle cx="${cx}" cy="${cy}" r="${Rw}" fill="var(--sunk)" stroke="var(--b)"/>`;
    let n = 0, good = 0, idx = 0; const probe = Math.floor(t * 40);
    for (let i = -Math.floor(150 / side); i <= Math.floor(150 / side); i++) for (let j = -Math.floor(150 / side); j <= Math.floor(150 / side); j++) {
      const x = cx + i * px, y = cy + j * px; if (Math.hypot(x + px / 2 - cx, y + px / 2 - cy) > Rw - px * 0.7) continue;
      const ok = rnd[idx++ % 4000] < Y; n++; if (ok) good++; const tested = idx <= probe;
      s += `<rect x="${x}" y="${y}" width="${px - 1}" height="${px - 1}" fill="${tested ? (ok ? PT : PC) : "var(--panel)"}" opacity="0.85"/>`;
    }
    s += tx(cx, cy + Rw + 22, `${n} dies, model yield ${(Y * 100).toFixed(1)} percent, ${good} good in this draw`, "middle", "t");
    // yield curve
    const x0 = 400, w = 240, y0 = 60, h = 180; s += PIC.yaxis(x0, y0, h, 0, 100, 4, "yield (%)", v => v.toFixed(0)) + PIC.xaxis(x0, y0 + h, w, 0, 25, 5, "die side (mm)", v => v.toFixed(0));
    let d = ""; for (let i = 0; i <= 50; i++) { const sd = i / 50 * 25; const yy = Math.exp(-D0 * sd * sd / 100); d += (i ? "L" : "M") + (x0 + i / 50 * w).toFixed(1) + " " + (y0 + h - yy * h).toFixed(1); }
    s += `<path d="${d}" fill="none" stroke="${PB}" stroke-width="2"/>` + `<circle cx="${x0 + side / 25 * w}" cy="${y0 + h - Y * h}" r="5" fill="${PC}"/>`;
    fig.innerHTML = svg(cy + Rw + 40, s);
  };
  PIC.player(ctl, draw);
}}
],
summary: String.raw`A silicon photonics wafer starts as 220 nm of silicon on 2 µm of oxide. Lithography and three etch depths make strips, ribs and gratings from that one layer. Implants form diodes, oxide fills and is polished flat, germanium is grown for detectors, nitride is added above, and metal wires it all. The order follows the thermal budget, hot steps first. Resolution is k1 lambda over NA and is not the limit for photonics. Overlay between layers adds in quadrature, and yield across the wafer falls exponentially with die area times defect density.`,
sheet: [
[String.raw`\[ \text{leak} \propto e^{-2\gamma t_{\mathrm{BOX}}}, \quad \gamma = k_0\sqrt{n_{\mathrm{eff}}^2 - n_{\mathrm{SiO_2}}^2} \]`, "Why the buried oxide is 2 µm"],
[String.raw`\[ L_D = 2\sqrt{Dt}, \quad D = D_0 e^{-E_a/k_B T} \]`, "Dopant spread and the thermal budget"],
[String.raw`\[ \tan(k_x d/2) = \gamma/k_x \]`, "Slab mode for each etch depth"],
[String.raw`\[ R = k_1 \lambda/\mathrm{NA}, \quad \mathrm{DOF} = k_2 \lambda/\mathrm{NA}^2 \]`, "Resolution and depth of focus"],
[String.raw`\[ \sigma_{\mathrm{overlay}} = \sqrt{\textstyle\sum_i \sigma_i^2} \]`, "Overlay errors add in quadrature"],
[String.raw`\[ Y = e^{-D_0 A} \]`, "Poisson die yield"]],
consts: String.raw`Silicon 3.48, oxide 1.44 at 1550 nm. Boron in silicon \(D_0 = 0.76\ \mathrm{cm^2/s}\), \(E_a = 3.46\ \mathrm{eV}\). Thicknesses are generic platform values.`,
sources: ["C. Mack, Fundamental Principles of Optical Lithography, Wiley (2007), Ch. 2 and 8 (resolution, depth of focus, overlay)", "J. D. Plummer, M. Deal, P. Griffin, Silicon VLSI Technology, Prentice Hall (2000), Ch. 7 (dopant diffusion, thermal budget) and Ch. 1 (yield)", "AIM Photonics and imec silicon photonics platform descriptions (220 nm SOI, 70 and 150 nm partial etches, Ge epitaxy, SiN layer): public process overviews, foundry values not verified here", "Research dossier Part 2 Sec. 2.1 (generic CMOS photonics flow)"]
});
})();

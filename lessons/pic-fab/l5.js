(function () {
/* Part 2 Lesson 5: heterogeneous integration, bringing III-V onto silicon. Process animations and live yield, bonding energy, transfer printing adhesion, lift-off time, spalling depth and lattice mismatch. */
const PC = "#D85A30", PB = "#378ADD", PT = "#1D9E75", PP = "#7F77DD", PA = "#BA7517";
const tx = (x, y, t, a, cls) => `<text class="${cls || "ts"}" x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""}>${t}</text>`;
const R = (x, y, w, h, fill, stroke, extra) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke || "none"}" ${extra || ""}/>`;
const M = { si: "#8fa6c2", ox: "#efe6cc", iii: "#e0a06a", iiiD: "#b06a2a", sac: "#c9a0dc", ni: "#8f949c", bcb: "#d6c35a", stamp: "#bfe3d5", sub: "#c4cad3" };
const wrap = (x, y, text, n) => { const words = text.split(" "); let line = "", out = "", ly = y; for (const w of words) { if ((line + " " + w).length > n) { out += tx(x, ly, line); ly += 16; line = w; } else line = line ? line + " " + w : w; } return out + tx(x, ly, line); };
const panel = (y, title, text) => `<rect x="14" y="${y}" width="652" height="72" rx="6" fill="var(--panel)" stroke="var(--line)"/>` + tx(24, y + 20, title, null, "th") + wrap(24, y + 38, text, 95);

addLesson("pic", "fab", {
level: "Advanced",
id: "pic-fab-l5", title: "Heterogeneous integration: bringing III-V onto silicon", short: "5. Heterogeneous integration",
big: String.raw`Silicon cannot emit light well, so the laser of every silicon photonics link is made of a III-V semiconductor such as InP or GaAs. Getting that material onto a silicon wafer is heterogeneous integration. There are three families of methods. Bond a III-V wafer or die face down onto the silicon and remove its substrate. Pick thin III-V coupons off their own wafer with a stamp or by etching away a sacrificial layer or by cracking the substrate, and place them on silicon. Or grow the III-V directly on silicon and live with the dislocations from the lattice mismatch. Each method is animated here with the equation that governs it, and the last card computes the yield of a small device on dislocated material, the argument at the heart of Prof. Li's nanolaser paper.`,
bridge: String.raw`The bonding energy card uses the razor blade method of Maszara et al., J. Appl. Phys. 64, 4943 (1988). Transfer printing follows Meitl et al., Nature Mater. 5, 33 (2006). Epitaxial lift-off follows Cheng, Shiu, Li, Han, Shi and Sadana, Nature Commun. 4, 1577 (2013). Controlled spalling numbers are from Bedell et al., J. Phys. D 46, 152002 (2013) and the IBM patents US 8,450,184 and US 9,713,250, labelled as patents. The defect yield reproduces Li et al., Sci. Rep. 5, 14067 (2015).`,
cards: [

{s: "1. Why III-V", t: "Why silicon needs a III-V laser",
intu: String.raw`In silicon the lowest point of the conduction band and the highest point of the valence band sit at different crystal momenta. An electron must change momentum to recombine with a hole, which needs a phonon, so radiative recombination is slow and most energy ends up as heat. In GaAs and InP both extremes sit at the same momentum and a photon is emitted directly. Pick a material and read the gap, the emission wavelength and the lattice constant. The lattice mismatch to silicon is the problem the rest of the lesson solves.`,
eq: String.raw`\[ \lambda_g\,[\mathrm{\mu m}] = \frac{1.24}{E_g\,[\mathrm{eV}]}, \qquad f = \frac{a_{\mathrm{epi}} - a_{\mathrm{Si}}}{a_{\mathrm{Si}}} \]`,
sym: [[String.raw`\(E_g\)`, "band gap: Si 1.12 eV indirect, GaAs 1.42 eV direct, InP 1.34 eV direct, Ge 0.66 eV indirect"], [String.raw`\(\lambda_g\)`, "wavelength of a photon with the gap energy"], [String.raw`\(a\)`, "lattice constant: Si 5.431 Å, GaAs 5.653 Å, InP 5.869 Å, Ge 5.658 Å"], [String.raw`\(f\)`, "lattice mismatch to silicon"]],
how: ["A photon carries almost no momentum, so a direct transition needs the band extremes at the same k.", "Silicon's conduction band minimum sits near the X point, far from the valence maximum at Gamma. The transition needs a phonon and takes microseconds.", "GaAs and InP are direct at Gamma. Their radiative lifetime is nanoseconds.", "Their lattice constants are 4.1 and 8.1 percent larger than silicon's, so they cannot simply be grown on it without defects."],
say: String.raw`Silicon is indirect and cannot lase well, while GaAs and InP are direct but mismatched to silicon by 4 and 8 percent.`,
num: "Emission at the gap: GaAs 870 nm, InP 925 nm. Telecom lasers use InGaAsP or InGaAlAs quantum wells on InP for 1310 and 1550 nm, or InAs quantum dots on GaAs for 1300 nm. Silicon's radiative lifetime is about 1 ms against 1 ns for GaAs.",
r(fig, ctl) {
  const mats = [["Si", 1.12, 5.431, false], ["Ge", 0.66, 5.658, false], ["GaAs", 1.42, 5.653, true], ["InP", 1.34, 5.869, true]];
  ctl.innerHTML = btns(mats.map((m, i) => [i, m[0]]), "m"); let m = 2;
  const u = () => {
    pick(ctl, "m", m); const [name, Eg, a, direct] = mats[m]; const f = (a - 5.431) / 5.431 * 100;
    let s = tx(340, 22, `${name}: gap ${Eg} eV, ${(1.24 / Eg * 1000).toFixed(0)} nm, ${direct ? "direct" : "indirect"}, mismatch to Si ${f.toFixed(1)} percent`, "middle", "th");
    // E-k sketch
    const cx = 200, y0 = 60, h = 170; s += `<line x1="${cx - 150}" y1="${y0 + h}" x2="${cx + 150}" y2="${y0 + h}" stroke="var(--p)"/>` + tx(cx, y0 + h + 16, "crystal momentum k", "middle") + tx(cx - 150, y0 + h + 16, "Γ") + tx(cx + 130, y0 + h + 16, "X");
    const vb = `M${cx - 150} ${y0 + h - 30 - 50} Q${cx} ${y0 + h - 30 + 60} ${cx + 150} ${y0 + h - 30 - 50}`; s += `<path d="${vb}" fill="none" stroke="${PB}" stroke-width="2.5"/>`;
    const xmin = direct ? cx : cx + 120; const cb = direct ? `M${cx - 150} ${y0 + 10} Q${cx} ${y0 + 90} ${cx + 150} ${y0 + 10}` : `M${cx - 150} ${y0 + 20} Q${cx - 60} ${y0 + 60} ${cx} ${y0 + 50} Q${cx + 100} ${y0 + 35} ${cx + 120} ${y0 + 70} Q${cx + 140} ${y0 + 85} ${cx + 150} ${y0 + 60}`; s += `<path d="${cb}" fill="none" stroke="${PC}" stroke-width="2.5"/>`;
    s += `<circle cx="${xmin}" cy="${direct ? y0 + 50 : y0 + 72}" r="6" fill="${PC}"/><circle cx="${cx}" cy="${y0 + h - 30}" r="6" fill="none" stroke="${PB}" stroke-width="2"/>`;
    s += `<line x1="${xmin}" y1="${direct ? y0 + 56 : y0 + 78}" x2="${cx}" y2="${y0 + h - 36}" stroke="${direct ? PT : PA}" stroke-width="2" stroke-dasharray="${direct ? "" : "5 4"}" marker-end="url(#ar)"/>` + tx(cx + 10, y0 + 120, direct ? "photon" : "needs a phonon", null, "t");
    s += tx(cx - 150, y0 + 6, "conduction band") + tx(cx - 150, y0 + h - 86, "valence band");
    // lattice mismatch bars
    const px = 420; s += tx(px, 60, "lattice constant (Å)", null, "th"); mats.forEach((mm, i) => { const y = 80 + i * 36; s += tx(px, y + 12, mm[0]) + R(px + 40, y, (mm[2] - 5.3) / 0.6 * 150, 16, i === m ? PC : PB, "none", 'opacity="0.8"') + tx(px + 44 + (mm[2] - 5.3) / 0.6 * 150, y + 12, mm[2].toFixed(3)); });
    fig.innerHTML = svg(250, s);
  };
  ctl.querySelectorAll("button[data-m]").forEach(b => b.onclick = () => { m = +b.dataset.m; u(); }); u();
}},

{s: "2. Direct bonding", t: "Plasma activated direct bonding",
intu: String.raw`Clean, flat, activated surfaces stick to each other at room temperature through hydrogen bonds between surface hydroxyl groups, and an anneal turns them into covalent bonds. Oxygen plasma activation lets this happen at 200 to 300 °C, which the III-V can survive. Step through the process, then measure the bond with the razor blade test: insert a blade of known thickness and the crack length tells you the surface energy. Slide the crack length to see the bond energy.`,
eq: String.raw`\[ \gamma = \frac{3\,E\, t_w^3\, t_b^2}{32\,L^4} \]<div class="eqref">Maszara razor blade test for the bond surface energy</div>`,
sym: [[String.raw`\(\gamma\)`, "surface energy of the bond, J/m²"], [String.raw`\(E\)`, "Young's modulus of the wafers, 130 GPa for silicon"], [String.raw`\(t_w\)`, "wafer thickness"], [String.raw`\(t_b\)`, "blade thickness"], [String.raw`\(L\)`, "crack length that the blade opens"]],
how: ["Polish both surfaces to below 0.5 nm RMS roughness and clean them.", "Oxygen plasma makes the surfaces hydrophilic and reactive. Contact them and a bonding wave sweeps across in seconds.", "Anneal at 200 to 300 °C. Water leaves and Si-O-Si bonds form across the interface. Higher temperature gives stronger bonds but III-V and silicon expand differently, so the anneal is kept low.", "Remove the III-V substrate by grinding and a selective wet etch that stops on an etch stop layer, leaving a few microns of device layers on the silicon."],
say: String.raw`Plasma activated bonding joins polished surfaces at room temperature and a low anneal makes the bond covalent, and the razor blade test reads the bond energy from a crack length.`,
num: "Surface energy after a 300 °C anneal: 1 to 2 J/m². Fully covalent Si to Si: about 2.5 J/m². Roughness must be below 0.5 nm RMS. Thermal expansion: Si 2.6, InP 4.6, GaAs 5.7 ppm/K.",
r(fig, ctl) {
  const names = ["Polish and clean", "Plasma activation", "Contact and bonding wave", "Anneal", "Substrate removal", "Razor blade test"];
  const desc = ["Both wafers are polished to sub-nanometre roughness and cleaned. Particles larger than the gap they create cause voids.", "An oxygen plasma breaks surface bonds and leaves hydroxyl groups. The surface becomes hydrophilic.", "The wafers are brought into contact at one point and a bonding wave of hydrogen bonds sweeps across in a few seconds.", "An anneal at 200 to 300 °C drives out water and converts hydrogen bonds into covalent oxide bridges.", "The III-V substrate is ground thin and removed by a selective etch that stops on an etch stop layer. A few microns of device layers remain on silicon.", "Push a blade into the interface. The length of the crack it opens measures the bond energy."];
  let k = 0; const blade = () => { ctl.querySelector("#Lc") || ctl.insertAdjacentHTML("beforeend", sl("Lc", "Crack length (mm)", 5, 40, 1, 15)); };
  PIC.stepper(ctl, 6, i => { k = i; }, names);
  blade();
  const draw = t => {
    const Lc = +$("Lc").value; $("Lcv").textContent = Lc + " mm"; const gam = 3 * 130e9 * Math.pow(725e-6, 3) * Math.pow(100e-6, 2) / (32 * Math.pow(Lc * 1e-3, 4));
    const x0 = 60, W = 560, yS = 190; let s = "";
    s += R(x0, yS, W, 40, M.si, "none") + tx(x0 + W / 2, yS + 26, "silicon photonics wafer", "middle");
    const wave = Math.min(1, (t * 0.4) % 1.5);
    if (k === 0) { s += R(x0, yS - 90, W, 40, M.iii) + tx(x0 + W / 2, yS - 64, "III-V wafer, polished face down", "middle"); for (let i = 0; i < 6; i++) s += `<circle cx="${x0 + 60 + i * 90}" cy="${yS - 2}" r="2" fill="${PC}"/>`; s += tx(x0, yS - 100, "particles (red) must be removed"); }
    if (k === 1) { s += R(x0, yS - 90, W, 40, M.iii); for (let i = 0; i < 14; i++) s += `<circle cx="${x0 + 20 + i * 40 + 6 * Math.sin(t * 4 + i)}" cy="${yS - 20 + 8 * Math.cos(t * 3 + i)}" r="4" fill="${PP}"/>`; s += tx(x0, yS - 100, "oxygen plasma makes both faces hydrophilic (OH groups)"); }
    if (k === 2) { s += R(x0, yS - 44, W, 40, M.iii); s += R(x0, yS - 4, W * wave, 4, PT) + tx(x0 + W * wave, yS - 10, "bonding wave", wave > 0.8 ? "end" : "start"); }
    if (k === 3) { s += R(x0, yS - 44, W, 40, M.iii); s += R(x0, yS - 3, W, 3, PT); for (let i = 0; i < 8; i++) s += tx(x0 + 30 + i * 70, yS - 54 - ((t * 25 + i * 11) % 40), "H₂O", null); s += tx(x0, yS - 100, "250 °C: water leaves, Si-O-Si bridges form"); }
    if (k === 4) { s += R(x0, yS - 10, W, 10, M.iiiD) + R(x0, yS - 3, W, 3, PT) + tx(x0 + W / 2, yS - 16, "2 µm of III-V device layers remain", "middle"); s += R(x0, yS - 70, W, 30, M.iii, "none", `opacity="${Math.max(0, 1 - wave)}"`) + tx(x0, yS - 80, "substrate ground and etched away"); }
    if (k === 5) { s += R(x0, yS - 44, W, 40, M.iii); const Lpx = Lc / 40 * W * 0.8; s += `<path d="M${x0 + W} ${yS - 4} L${x0 + W - Lpx} ${yS}" fill="none" stroke="var(--t)"/>` + `<polygon points="${x0 + W},${yS - 14} ${x0 + W + 30},${yS - 14} ${x0 + W + 30},${yS + 6} ${x0 + W},${yS + 6}" fill="${M.ni}"/>`; s += `<polygon points="${x0 + W - Lpx},${yS} ${x0 + W},${yS - 14} ${x0 + W},${yS} Z" fill="var(--bg)"/>` + tx(x0 + W - Lpx / 2, yS - 20, `crack L = ${Lc} mm`, "middle") + tx(x0, yS - 60, `blade 100 µm, wafers 725 µm: γ = ${gam.toFixed(2)} J/m²`, null, "th"); }
    s += panel(yS + 56, names[k], desc[k]);
    fig.innerHTML = svg(yS + 140, s);
  };
  PIC.player(ctl, draw);
}},

{s: "3. Adhesive bonding", t: "BCB adhesive bonding: a polymer glue that tolerates the surface",
intu: String.raw`Direct bonding demands perfect surfaces. Spinning a thin layer of benzocyclobutene, BCB, over the silicon relaxes that. The polymer flows over small particles and topography, cures at 250 °C and holds the III-V die. The price is that the III-V now sits a few hundred nanometres above the silicon waveguide, and the laser mode must couple down through the BCB evanescently. Slide the BCB thickness and watch the coupling fall. Step through the process.`,
eq: String.raw`\[ \kappa \propto e^{-\gamma\, t_{\mathrm{BCB}}}, \qquad \gamma = k_0\sqrt{n_{\mathrm{eff}}^2 - n_{\mathrm{BCB}}^2} \]<div class="eqnote">the same evanescent law as the interlayer gap of Lesson 4, with BCB index 1.54</div>`,
sym: [[String.raw`\(t_{\mathrm{BCB}}\)`, "thickness of the adhesive, 50 to 300 nm for lasers"], [String.raw`\(n_{\mathrm{BCB}}\)`, "refractive index of BCB, about 1.54"], [String.raw`\(\kappa\)`, "coupling between the III-V gain region and the silicon waveguide"]],
how: ["Spin BCB on the silicon wafer, planarizing over the waveguides. Thin it by dilution.", "Place the III-V die face down, press, and cure at 250 °C. The polymer cross-links.", "Remove the III-V substrate as in direct bonding.", "The laser mode lives partly in the III-V and partly in the silicon through the BCB gap, so the gap sets how much gain the silicon mode sees."],
say: String.raw`BCB bonding glues III-V to silicon through a thin polymer that forgives surface defects, at the cost of an evanescent gap the laser mode must cross.`,
num: "BCB thickness 50 to 100 nm for evanescent lasers (Ghent, IMOS), up to microns for packaging. Cure 250 °C for 1 hour. BCB index 1.54, loss low at 1550 nm. The Nature Commun. 8, 14323 (2017) nanopillar LED used low index BCB as the bonding layer.",
r(fig, ctl) {
  const names = ["Spin BCB", "Place and press", "Cure", "Remove substrate"];
  let k = 0; PIC.stepper(ctl, 4, i => { k = i; }, names); ctl.insertAdjacentHTML("beforeend", sl("tb", "BCB thickness (nm)", 20, 400, 10, 80));
  const draw = t => {
    const tb = +$("tb").value; $("tbv").textContent = tb + " nm"; const gam = 2 * Math.PI / 1.55 * Math.sqrt(2.4 * 2.4 - 1.54 * 1.54); const rel = Math.exp(-gam * tb / 1000);
    const x0 = 60, W = 560, yS = 190; let s = tx(340, 22, `coupling relative to zero gap: ${(rel * 100).toFixed(1)} percent (γ = ${gam.toFixed(1)} per µm)`, "middle", "th");
    s += R(x0, yS, W, 40, M.ox) + R(x0 + 200, yS - 16, 160, 16, M.si, "#5d7694") + tx(x0 + 280, yS + 26, "silicon waveguide on oxide", "middle");
    const tpx = Math.max(4, tb / 10); s += R(x0, yS - 16 - tpx, W, tpx + 16, M.bcb, "none", 'opacity="0.8"') + tx(x0 + 8, yS - 20 - tpx, `BCB ${tb} nm`);
    const drop = k === 1 ? 60 * (1 - Math.min(1, (t * 0.5) % 1.5)) : 0;
    if (k >= 1) { s += R(x0 + 120, yS - 16 - tpx - 30 - drop, 320, 30, M.iii, M.iiiD) + tx(x0 + 280, yS - 16 - tpx - 10 - drop, "III-V die, face down", "middle"); }
    if (k === 2) { for (let i = 0; i < 6; i++) s += tx(x0 + 140 + i * 60, yS - 70 - tpx - ((t * 20 + i * 7) % 30), "250 °C"); }
    if (k === 3) { s += R(x0 + 120, yS - 16 - tpx - 30, 320, 30, M.iii, M.iiiD, 'opacity="0.25"') + R(x0 + 120, yS - 16 - tpx - 8, 320, 8, M.iiiD) + tx(x0 + 280, yS - 16 - tpx - 36, "substrate removed, 2 µm of gain layers stay", "middle"); }
    const tail = (y) => { let d = ""; for (let i = 0; i <= 30; i++) { const z = i / 30 * 80; d += (i ? "L" : "M") + (x0 + 470 + 40 * Math.exp(-gam * z / 100)).toFixed(1) + " " + (y - z).toFixed(1); } return `<path d="${d}" fill="none" stroke="${PC}" stroke-width="2"/>`; };
    s += tail(yS - 16) + tx(x0 + 520, yS - 100, "mode tail");
    s += panel(yS + 56, names[k], ["The polymer is spun over the patterned silicon and planarizes small topography.", "The III-V die is placed face down and pressed. The uncured BCB flows around particles.", "Curing at 250 °C cross-links the BCB. The bond is permanent and tolerates later wet chemistry.", "Grinding and selective etching remove the III-V substrate, as in direct bonding."][k]);
    fig.innerHTML = svg(yS + 140, s);
  };
  PIC.player(ctl, draw);
}},

{s: "4. Transfer printing", t: "Micro-transfer printing: pick with a fast peel, print with a slow one",
intu: String.raw`An elastomer stamp sticks to a coupon more strongly when it is pulled away fast, and more weakly when pulled away slowly. That lets one stamp pick coupons off a source wafer by peeling quickly and release them onto the silicon by peeling slowly. The coupons are pre-released on the source wafer by undercutting a sacrificial layer and leaving thin tethers. Slide the peel velocity to see which side wins, and press Play to watch the stamp cycle.`,
eq: String.raw`\[ G_{\mathrm{crit}}(v) = G_0\left[1 + \left(\frac{v}{v_0}\right)^{n}\right] \]<div class="eqref">kinetically controlled adhesion of the viscoelastic stamp, Meitl et al. 2006</div>`,
sym: [[String.raw`\(G_{\mathrm{crit}}\)`, "energy release rate needed to separate stamp from coupon"], [String.raw`\(v\)`, "peel velocity"], [String.raw`\(G_0, v_0, n\)`, "static adhesion, reference velocity and exponent of the elastomer, n about 0.6"]],
how: ["Pick when the stamp adhesion exceeds the strength of the tethers holding the coupon. Fast peel raises the stamp adhesion above the tether strength.", "Print when the stamp adhesion falls below the coupon to receiver adhesion. Slow peel lowers it.", "Between the two velocities the same stamp both picks and places.", "Hundreds of coupons move in one stamp cycle, so a 2 inch III-V wafer feeds many 300 mm silicon wafers."],
say: String.raw`Transfer printing uses the rate dependent adhesion of an elastomer stamp: peel fast to pick, slow to print.`,
num: "Coupons: 10 by 40 µm to 100 by 1000 µm, a few µm thick. Placement accuracy about 0.5 µm. X-Celeprint and imec print InP lasers, SOAs and photodiodes onto silicon photonics wafers. Thousands of coupons per hour.",
r(fig, ctl) {
  ctl.innerHTML = sl("v", "Peel velocity (µm/s)", 1, 1000, 1, 50);
  const draw = t => {
    const v = +$("v").value; $("vv").textContent = v + " µm/s"; const G = 1 + Math.pow(v / 100, 0.6); const tether = 2.2, recv = 1.3;
    const phase = (t * 0.25) % 1; // 0-0.25 down on source, 0.25-0.5 lift, 0.5-0.75 move, 0.75-1 release
    const x0 = 40; let s = tx(340, 22, `stamp adhesion ${G.toFixed(2)} against tethers ${tether} and receiver ${recv}: ${G > tether ? "picks" : "cannot pick"}, ${G < recv ? "prints" : "cannot print"}`, "middle", "th");
    const ySrc = 200, yRec = 200; s += R(x0, ySrc, 260, 30, M.iii) + tx(x0 + 130, ySrc + 20, "III-V source wafer", "middle") + R(x0 + 340, yRec, 260, 30, M.si) + tx(x0 + 470, yRec + 20, "silicon receiver", "middle");
    for (let i = 0; i < 4; i++) s += R(x0 + 20 + i * 60, ySrc - 10, 40, 10, M.iiiD) + `<line x1="${x0 + 20 + i * 60}" y1="${ySrc - 5}" x2="${x0 + 14 + i * 60}" y2="${ySrc - 5}" stroke="var(--t)"/>`;
    const stampX = phase < 0.5 ? x0 + 60 : phase < 0.75 ? x0 + 60 + (phase - 0.5) / 0.25 * 340 : x0 + 400; const stampY = phase < 0.25 ? ySrc - 80 + phase / 0.25 * 60 : phase < 0.5 ? ySrc - 20 - (phase - 0.25) / 0.25 * 60 : phase < 0.75 ? ySrc - 80 : ySrc - 80 + (phase - 0.75) / 0.25 * 60;
    s += R(stampX, stampY - 40, 60, 40, M.stamp, "#4a9a80") + tx(stampX + 30, stampY - 46, "stamp", "middle");
    const carrying = (G > tether) && phase >= 0.25 && (phase < 0.75 || G >= recv); if (carrying) s += R(stampX + 10, stampY, 40, 10, M.iiiD);
    if (phase >= 0.75 && G > tether && G < recv) s += R(x0 + 410, yRec - 10, 40, 10, M.iiiD);
    s += tx(x0, 70, `${v} µm/s: adhesion ${G.toFixed(2)} G₀`);
    const px = 440, pw = 180, py = 50, ph = 100; s += PIC.yaxis(px, py, ph, 0, 5, 5, "G / G₀", v => v.toFixed(0)) + PIC.xaxis(px, py + ph, pw, 0, 3, 3, "log₁₀ velocity", v => v.toFixed(0));
    let d = ""; for (let i = 0; i <= 30; i++) { const lv = i / 30 * 3; const g = 1 + Math.pow(Math.pow(10, lv) / 100, 0.6); d += (i ? "L" : "M") + (px + lv / 3 * pw).toFixed(1) + " " + (py + ph - Math.min(5, g) / 5 * ph).toFixed(1); }
    s += `<path d="${d}" fill="none" stroke="${PB}" stroke-width="2"/><line x1="${px}" y1="${py + ph - tether / 5 * ph}" x2="${px + pw}" y2="${py + ph - tether / 5 * ph}" stroke="${PC}" stroke-dasharray="4 3"/><line x1="${px}" y1="${py + ph - recv / 5 * ph}" x2="${px + pw}" y2="${py + ph - recv / 5 * ph}" stroke="${PT}" stroke-dasharray="4 3"/>` + tx(px + pw, py + ph - tether / 5 * ph - 4, "tethers", "end") + tx(px + pw, py + ph - recv / 5 * ph + 12, "receiver", "end") + `<circle cx="${px + Math.log10(v) / 3 * pw}" cy="${py + ph - Math.min(5, G) / 5 * ph}" r="5" fill="${PC}"/>`;
    fig.innerHTML = svg(ySrc + 50, s);
  };
  PIC.player(ctl, draw);
}},

{s: "5. Epitaxial lift-off", t: "Epitaxial lift-off: dissolve a buried layer and float the film off",
intu: String.raw`Grow the device layers on top of a thin sacrificial layer, then etch that layer from the side. The film above detaches and the expensive substrate can be reused. The classic version uses AlAs etched by HF, which leaves residues and roughens the substrate. The IBM version of Cheng, Shiu, Li and colleagues used phosphide sacrificial layers and HCl, which leaves the surface clean enough to grow on again, and a surface tension assisted variant in which the etchant itself peels the film and lays it flat. Press Play to watch the etch front creep in from both sides and the film release. Slide the die width to see the etch time.`,
eq: String.raw`\[ t_{\mathrm{release}} = \frac{W}{2\,r_{\mathrm{lateral}}} \]<div class="eqnote">the etch front comes in from both edges, so the time scales with half the width</div>`,
sym: [[String.raw`\(W\)`, "width of the die or mesa being released"], [String.raw`\(r_{\mathrm{lateral}}\)`, "lateral etch rate of the sacrificial layer, often slowed by the narrow channel"], [String.raw`\(t_{\mathrm{release}}\)`, "time until the film is free"]],
how: ["The sacrificial layer must etch orders of magnitude faster than the layers above and below. AlAs in HF and InAlP in HCl both do.", "The etchant enters a channel only tens of nanometres high, so transport, not chemistry, often limits the rate. Narrow mesas release faster.", "In surface tension assisted lift-off the etchant's surface tension lifts the released edge and peels the film away, which keeps the channel open and speeds the release.", "After lift-off the substrate is rinsed and, in the HCl process, reused directly without repolishing. Cheng et al. showed solar cells on a reused substrate with the same performance."],
say: String.raw`Epitaxial lift-off etches a sacrificial layer sideways to free the device film, and the phosphide HCl process leaves the substrate reusable.`,
num: "AlAs in HF: lateral rate about 1 mm per hour in the best cases. Residues raise the GaAs substrate roughness from 0.3 nm to 1 to 4 nm, which needs repolishing. Phosphide with HCl: residue free. Cheng et al. 2013 transferred full 2 inch GaAs films to rigid and flexible carriers.",
r(fig, ctl) {
  ctl.innerHTML = sl("W", "Die width (mm)", 1, 50, 1, 10) + btns([[0, "AlAs and HF"], [1, "InAlP and HCl (IBM)"]], "p");
  let p = 1;
  const draw = t => {
    pick(ctl, "p", p); const W = +$("W").value; $("Wv").textContent = W + " mm"; const rate = p ? 1.5 : 1.0; const tr = W / (2 * rate);
    const prog = Math.min(1, (t * 0.3) % 1.4);
    const x0 = 60, Wp = 560, yS = 170; let s = tx(340, 22, `release time W/2r = ${tr.toFixed(1)} h at ${rate} mm/h. ${p ? "Substrate clean, reuse directly." : "Residues: substrate needs repolish."}`, "middle", "th");
    s += R(x0, yS, Wp, 40, M.iii) + tx(x0 + Wp / 2, yS + 26, "GaAs substrate (reused)", "middle");
    const et = prog * Wp / 2; s += R(x0 + et, yS - 8, Wp - 2 * et, 8, M.sac) + tx(x0 + Wp / 2, yS + 56, prog < 1 ? "purple: sacrificial layer, etching in from both edges" : "film released", "middle");
    const lift = prog >= 1 ? Math.min(40, ((t * 0.3) % 1.4 - 1) * 100) : 0; const curl = lift * 0.5;
    s += `<path d="M${x0} ${yS - 8 - lift} Q${x0 + Wp / 2} ${yS - 8 - lift - curl} ${x0 + Wp} ${yS - 8 - lift} L${x0 + Wp} ${yS - 20 - lift} Q${x0 + Wp / 2} ${yS - 20 - lift - curl} ${x0} ${yS - 20 - lift} Z" fill="${M.iiiD}"/>` + tx(x0 + Wp / 2, yS - 28 - lift - curl, "device film, 2 µm", "middle");
    for (let i = 0; i < 2; i++) { const xx = i ? x0 + Wp - 40 : x0 + 40; for (let k = 0; k < 4 && et > 1; k++) s += `<circle cx="${(xx + (i ? -1 : 1) * ((t * 30 + k * 10) % et)).toFixed(1)}" cy="${yS - 4}" r="2.5" fill="${PB}"/>`; }
    if (!p && prog > 0) for (let i = 0; i < Math.floor(prog * 12); i++) s += `<circle cx="${x0 + 30 + i * 45}" cy="${yS + 2}" r="2" fill="${PC}"/>`;
    s += tx(x0, yS + 74, p ? "HCl etches the InAlP layer and passivates the GaAs. Surface tension of the liquid peels the film." : "HF etches AlAs but leaves arsenic oxide residues (red) on the substrate.");
    fig.innerHTML = svg(yS + 85, s);
  };
  ctl.querySelectorAll("button[data-p]").forEach(b => b.onclick = () => { p = +b.dataset.p; });
  PIC.player(ctl, draw);
}},

{s: "6. Controlled spalling", t: "Controlled spalling: crack the substrate at a chosen depth",
intu: String.raw`Deposit a tensile nickel film on the wafer, attach a tape handle, and peel. The stressed film drives a crack into the brittle substrate, and the crack settles at the depth where the shear stress intensity vanishes, a few times the nickel thickness. The film plus a thin skin of substrate comes off in one piece, with the devices on it, and no sacrificial layer or epitaxy is needed. Slide the stress and the fracture toughness to see the stressor thickness needed, and press Play to watch the crack run. Bedell, Li and colleagues used this at IBM for silicon, germanium, III-V and GaN.`,
eq: String.raw`\[ t^{*} \approx 2.5\times10^{6}\,\frac{K_{IC}^{3/2}}{\sigma^{2}}, \qquad d_{\mathrm{spall}} \approx (2\text{ to }3)\,t_{\mathrm{Ni}} \]<div class="eqnote">critical stressor thickness in µm with K in MPa times root metre and σ in MPa (IBM patent US 9,713,250, a patent formula), and the spalling depth rule of thumb</div>`,
sym: [[String.raw`\(t^{*}\)`, "stressor thickness at which spalling starts"], [String.raw`\(K_{IC}\)`, "fracture toughness of the substrate, Si about 0.82 and Ge about 0.4 to 0.53, in MPa times root metre"], [String.raw`\(\sigma\)`, "tensile stress of the nickel, 300 to 700 MPa by sputtering pressure"], [String.raw`\(d_{\mathrm{spall}}\)`, "depth of the crack below the surface"]],
how: ["The stressed film and the substrate form a bilayer with an edge load. Suo and Hutchinson showed the steady state crack runs where the mode II stress intensity is zero.", "That depth scales with the stressor thickness and the ratio of the elastic moduli, hence the 2 to 3 times rule.", "The energy released by the stressed film must exceed the fracture energy, which gives the critical thickness in terms of stress and toughness.", "Thicker nickel or higher stress spalls deeper. For a 3 µm epitaxial stack on sapphire, 25 µm of plated nickel was used."],
say: String.raw`Controlled spalling uses a tensile nickel stressor to run a crack at a depth of two to three times the nickel thickness, removing the device layer kerf free.`,
num: "Sputtered Ni stress 300 to 700 MPa (J. Phys. D 46, 152002, 2013). Flexible CMOS removed with 6 µm Ni leaving about 10 µm of Si, ring oscillators at 11.4 ps per stage after transfer. US 8,450,184: about 4 µm Ni at about 700 MPa spalls about 8 µm of Si(111). Spalled InGaN LEDs: 25 µm Ni removed 3 µm of epitaxy from sapphire.",
r(fig, ctl) {
  ctl.innerHTML = sl("sg", "Nickel stress (MPa)", 200, 900, 10, 700) + sl("K", "Substrate toughness K (MPa√m)", 0.3, 1.2, 0.02, 0.82) + sl("tn", "Nickel thickness (µm)", 1, 30, 0.5, 4);
  const draw = t => {
    const sg = +$("sg").value, K = +$("K").value, tn = +$("tn").value; $("sgv").textContent = sg + " MPa"; $("Kv").textContent = K.toFixed(2); $("tnv").textContent = tn + " µm";
    const tstar = 2.5e6 * Math.pow(K, 1.5) / (sg * sg); const depth = 2.5 * tn; const spalls = tn >= tstar;
    const prog = spalls ? Math.min(1, (t * 0.35) % 1.4) : 0;
    const x0 = 60, W = 560, yS = 150; let s = tx(340, 22, `t* = ${tstar.toFixed(1)} µm. ${spalls ? `Spalls at about ${depth.toFixed(0)} µm depth` : "Too thin, no spalling"}`, "middle", "th");
    s += R(x0, yS, W, 90, M.sub) + tx(x0 + 8, yS + 82, "substrate, 1 px = 1 µm");
    const dpx = Math.min(70, depth); const peel = prog * W;
    // spalled layer lifts from the left
    s += R(x0, yS - tn * 2, W, tn * 2, M.ni) + tx(x0 + W - 6, yS - tn * 2 - 4, `Ni ${tn} µm (drawn 2x)`, "end");
    if (spalls) { s += `<path d="M${x0} ${yS} L${x0 + peel} ${yS + dpx} L${x0 + W} ${yS + dpx}" fill="none" stroke="${PC}" stroke-width="2" stroke-dasharray="4 3"/>`; const lift = 40 * prog; s += `<path d="M${x0} ${yS - lift - tn * 2} L${x0 + peel} ${yS + dpx} L${x0 + W} ${yS + dpx} L${x0 + W} ${yS - tn * 2}" fill="${M.ni}" opacity="0.5"/>` + `<path d="M${x0} ${yS - lift} L${x0 + peel} ${yS + dpx} L${x0} ${yS + dpx} Z" fill="${M.sub}" opacity="0.6"/>` + tx(x0 + 10, yS - lift - tn * 2 - 8, "tape handle peels, taking Ni plus a substrate skin"); s += tx(x0 + W - 6, yS + dpx + 14, `crack depth ${depth.toFixed(0)} µm`, "end"); }
    fig.innerHTML = svg(yS + 110, s);
  };
  PIC.player(ctl, draw);
}},

{s: "7. Direct epitaxy", t: "Growing III-V straight on silicon: mismatch, dislocations, antiphase domains",
intu: String.raw`The simplest idea is to grow the III-V directly on the silicon wafer. The 4 to 8 percent lattice mismatch is relieved within the first few monolayers by misfit dislocations at the interface, and some of them thread up through the device layers. Silicon's nonpolar surface also lets the III-V start with either atom on top, so antiphase domains form where two regions meet out of step. Buffer layers, offcut substrates and anneals reduce the threading density from 1e10 to about 1e6 to 1e8 per cm². Pick the material and press Play to watch the dislocations thread upward.`,
eq: String.raw`\[ f = \frac{a_{\mathrm{epi}} - a_{\mathrm{Si}}}{a_{\mathrm{Si}}}, \qquad h_c \approx \frac{b}{8\pi f (1+\nu)}\left[\ln\frac{h_c}{b} + 1\right] \]<div class="eqref">Matthews and Blakeslee critical thickness for the onset of misfit dislocations</div>`,
sym: [[String.raw`\(f\)`, "lattice mismatch, 4.1 percent GaAs on Si, 8.1 percent InP on Si"], [String.raw`\(h_c\)`, "thickness at which the strain starts to relax by dislocations"], [String.raw`\(b\)`, "Burgers vector, about 0.4 nm"], [String.raw`\(\nu\)`, "Poisson ratio, about 0.31"], [String.raw`\(\rho_{TD}\)`, "threading dislocation density, 1e6 to 1e8 per cm² after a good buffer"]],
how: ["Below the critical thickness the film is strained to match the substrate. Above it, misfit dislocations at the interface relieve the strain.", "For 4 percent mismatch the formula gives well under a nanometre, a few monolayers, so the film relaxes almost at once.", "Each misfit dislocation ends by threading to the surface unless it meets another and annihilates. Thermal cycling and graded buffers encourage annihilation.", "Thermal expansion mismatch adds strain on cooling from growth temperature, which can crack thick layers. Quantum dot lasers tolerate threading dislocations better than quantum wells because carriers are trapped in the dots."],
say: String.raw`Direct epitaxy relaxes the mismatch through misfit dislocations, some of which thread up through the device, and antiphase domains form on the nonpolar silicon surface.`,
num: "Threading density: 1e8 per cm² typical, about one per µm². Graded GeSi buffers reach 1e6 per cm² (Groenert 2003, cited by Li 2015). InAs quantum dot lasers on Si run for thousands of hours at 1e6 per cm². Thermal expansion: GaAs 5.7 and Si 2.6 ppm/K, giving 0.2 percent strain on cooling from 650 °C.",
r(fig, ctl) {
  ctl.innerHTML = btns([[0, "GaAs on Si"], [1, "InP on Si"], [2, "Ge on Si"]], "m") + sl("rho", "log₁₀ threading density (per cm²)", 5, 10, 0.1, 8);
  let m = 0;
  const draw = t => {
    pick(ctl, "m", m); const rho = Math.pow(10, +$("rho").value); $("rhov").textContent = (+$("rho").value).toFixed(1);
    const f = [0.041, 0.081, 0.042][m]; const b = 0.4, nu = 0.31; let hc = 1; for (let i = 0; i < 30; i++) hc = b / (8 * Math.PI * f * (1 + nu)) * (Math.log(Math.max(hc, b) / b) + 1);
    const x0 = 60, W = 360, yS = 200; let s = tx(340, 22, `${["GaAs", "InP", "Ge"][m]}: f = ${(f * 100).toFixed(1)} percent, h_c about ${hc.toFixed(1)} nm, ${(rho / 1e8).toFixed(2)} dislocations per µm²`, "middle", "th");
    s += R(x0, yS, W, 40, M.si) + tx(x0 + W / 2, yS + 26, "silicon", "middle") + R(x0, yS - 120, W, 120, M.iii) + tx(x0 + 8, yS - 106, "III-V, 1 px = 10 nm");
    // misfit dislocations at interface: spacing b/f
    const sp = Math.max(6, b / f * 1.0); for (let x = x0 + 4; x < x0 + W; x += sp * 1.2) s += tx(x, yS + 4, "⊥", "middle", "t");
    const nT = Math.min(40, Math.round(rho / 1e8 * 3.6)); const rng = C3 && C3.rng ? C3.rng(31) : Math.random; const grow = Math.min(1, (t * 0.4) % 1.3);
    for (let i = 0; i < nT; i++) { const xx = x0 + 10 + rng() * (W - 20); const tilt = (rng() - 0.5) * 60; s += `<line x1="${xx}" y1="${yS}" x2="${(xx + tilt * grow).toFixed(1)}" y2="${(yS - 120 * grow).toFixed(1)}" stroke="${PC}" stroke-width="1.5"/>`; }
    s += `<line x1="${x0 + 200}" y1="${yS}" x2="${x0 + 200}" y2="${yS - 120}" stroke="${PP}" stroke-width="2" stroke-dasharray="3 3"/>` + tx(x0 + 206, yS - 100, "antiphase boundary", null);
    s += tx(x0, yS + 54, "red: threading dislocations climbing in Play. ⊥: misfit dislocations at the interface");
    const px = 460, pw = 180, py = 60, ph = 130; s += PIC.yaxis(px, py, ph, 0, 10, 5, "h_c (nm)", v => v.toFixed(0)) + PIC.xaxis(px, py + ph, pw, 0, 10, 5, "mismatch (%)", v => v.toFixed(0));
    let d = ""; for (let i = 1; i <= 40; i++) { const ff = i / 40 * 0.1; let h = 1; for (let k = 0; k < 30; k++) h = b / (8 * Math.PI * ff * (1 + nu)) * (Math.log(Math.max(h, b) / b) + 1); d += (i > 1 ? "L" : "M") + (px + ff / 0.1 * pw).toFixed(1) + " " + (py + ph - Math.min(10, h) / 10 * ph).toFixed(1); }
    s += `<path d="${d}" fill="none" stroke="${PB}" stroke-width="2"/><circle cx="${px + f / 0.1 * pw}" cy="${py + ph - Math.min(10, hc) / 10 * ph}" r="5" fill="${PC}"/>`;
    fig.innerHTML = svg(yS + 64, s);
  };
  ctl.querySelectorAll("button[data-m]").forEach(b => b.onclick = () => { m = +b.dataset.m; }); PIC.player(ctl, draw);
}},

{s: "8. Defect-free yield", t: "Small devices dodge the dislocations: the Poisson yield",
intu: String.raw`If dislocations are scattered at random with density rho, the number landing inside a device of area A is Poisson distributed with mean rho A, and the chance of none is exp of minus rho A. A 250 nm square nanolaser is 1/16 of the average defect-free area at 1e8 per cm², so 94 percent of such lasers are defect free, and at 1e6 per cm² more than 99.9 percent. That is Prof. Li's argument for a plasmonic nanolaser grown directly on silicon. Slide the density and the device size and watch the map.`,
eq: String.raw`\[ P_0 = e^{-\rho_{TD} A}, \qquad A = L^2 \]<div class="eqref">Li et al. 2015: 94 percent at 1e8 per cm², above 99.9 percent at 1e6 per cm², for a 250 nm square</div>`,
sym: [[String.raw`\(P_0\)`, "probability that a device contains no threading dislocation"], [String.raw`\(\rho_{TD}\)`, "threading dislocation density, per cm²"], [String.raw`\(A\)`, "device active area"], [String.raw`\(L\)`, "side of a square device"]],
how: ["Dislocations are independent random points, so the count in an area is Poisson.", "The zero count probability of a Poisson distribution with mean mu is exp of minus mu.", "A 250 nm square has area 6.25e-10 cm². At 1e8 per cm² the mean is 0.0625 and P0 is 0.939.", "A 5 by 500 µm ridge laser has area 2.5e-5 cm², mean 2500, and P0 is zero. Big lasers need low dislocation density, nanolasers do not."],
say: String.raw`The probability that a device is free of dislocations is exp of minus the density times the area, so shrinking the device beats cleaning the material.`,
num: "250 nm square: 93.9 percent at 1e8, 99.94 percent at 1e6 per cm². 1 µm square: 36.8 percent at 1e8. 5 by 500 µm ridge: needs below 1e4 per cm² for 78 percent.",
r(fig, ctl) {
  ctl.innerHTML = sl("lr", "log₁₀ dislocation density (per cm²)", 4, 10, 0.1, 8) + sl("L", "Device side (nm)", 100, 5000, 50, 250);
  const rng = C3 && C3.rng ? C3.rng(41) : Math.random; const pts = Array.from({ length: 400 }, () => [rng(), rng()]);
  const u = () => {
    const lr = +$("lr").value, L = +$("L").value; $("lrv").textContent = lr.toFixed(1); $("Lv").textContent = L + " nm";
    const rho = Math.pow(10, lr), A = Math.pow(L * 1e-7, 2); const P0 = Math.exp(-rho * A);
    let s = tx(340, 22, `mean dislocations per device ${(rho * A).toExponential(2)}, defect-free yield ${(P0 * 100).toFixed(P0 > 0.99 ? 2 : 1)} percent`, "middle", "th");
    // map: 4 by 4 um field, dislocations as dots, device squares
    const x0 = 40, y0 = 50, S = 220; const field = 4; // um
    s += R(x0, y0, S, S, "var(--sunk)", "var(--b)") + tx(x0 + S / 2, y0 + S + 16, "4 by 4 µm field", "middle");
    const n = Math.min(400, Math.round(rho * Math.pow(field * 1e-4, 2))); for (let i = 0; i < n; i++) s += `<circle cx="${x0 + pts[i][0] * S}" cy="${y0 + pts[i][1] * S}" r="2" fill="${PC}"/>`;
    const Lpx = L / 1000 / field * S; const nd = Math.floor(S / (Lpx + 4)); let good = 0, tot = 0;
    for (let i = 0; i < Math.min(nd, 12); i++) for (let j = 0; j < Math.min(nd, 12); j++) { const dx = x0 + 2 + i * (Lpx + 4), dy = y0 + 2 + j * (Lpx + 4); if (dx + Lpx > x0 + S || dy + Lpx > y0 + S) continue; let hit = false; for (let k = 0; k < n; k++) { const px2 = x0 + pts[k][0] * S, py2 = y0 + pts[k][1] * S; if (px2 >= dx && px2 <= dx + Lpx && py2 >= dy && py2 <= dy + Lpx) { hit = true; break; } } tot++; if (!hit) good++; s += R(dx, dy, Lpx, Lpx, "none", hit ? PC : PT, 'stroke-width="1.5"'); }
    s += tx(x0 + S / 2, y0 + S + 32, tot ? `${good} of ${tot} devices in the field are defect free` : "device larger than the field", "middle");
    const px = 320, pw = 300, py = 60, ph = 170; s += PIC.yaxis(px, py, ph, 0, 100, 4, "yield (%)", v => v.toFixed(0)) + PIC.xaxis(px, py + ph, pw, 4, 10, 6, "log₁₀ density (per cm²)", v => v.toFixed(0));
    [[250, PB], [1000, PT], [5000, PP]].forEach(([LL, c]) => { let d = ""; for (let i = 0; i <= 60; i++) { const l = 4 + i / 60 * 6; const y = Math.exp(-Math.pow(10, l) * Math.pow(LL * 1e-7, 2)); d += (i ? "L" : "M") + (px + i / 60 * pw).toFixed(1) + " " + (py + ph - y * ph).toFixed(1); } s += `<path d="${d}" fill="none" stroke="${c}" stroke-width="2"/>`; });
    s += tx(px + pw / 2, py + ph + 46, "curves: 250 nm (blue), 1 µm (green), 5 µm (purple) squares", "middle") + `<circle cx="${px + (lr - 4) / 6 * pw}" cy="${py + ph - P0 * ph}" r="5" fill="${PC}"/>`;
    fig.innerHTML = svg(y0 + S + 50, s);
  };
  $("lr").oninput = u; $("L").oninput = u; u();
}}
],
summary: String.raw`Silicon is indirect, so the laser is III-V, and III-V is mismatched to silicon by 4 to 8 percent. Direct bonding joins polished plasma activated surfaces and a low anneal makes the bond covalent. BCB adhesive bonding forgives rough surfaces at the cost of an evanescent gap. Transfer printing picks coupons with a fast peel and prints them with a slow one. Epitaxial lift-off dissolves a sacrificial layer, and the IBM phosphide process leaves the substrate reusable. Controlled spalling cracks the substrate at two to three times the nickel thickness. Direct epitaxy relaxes through dislocations that thread upward, and a small enough device dodges them with probability exp of minus rho A.`,
sheet: [
[String.raw`\[ \lambda_g = 1.24/E_g, \quad f = (a_{\mathrm{epi}} - a_{\mathrm{Si}})/a_{\mathrm{Si}} \]`, "Gap wavelength and lattice mismatch"],
[String.raw`\[ \gamma = \frac{3 E t_w^3 t_b^2}{32 L^4} \]`, "Razor blade bond energy"],
[String.raw`\[ \kappa \propto e^{-\gamma t_{\mathrm{BCB}}} \]`, "Coupling across the adhesive"],
[String.raw`\[ G_{\mathrm{crit}}(v) = G_0[1 + (v/v_0)^n] \]`, "Rate dependent stamp adhesion"],
[String.raw`\[ t_{\mathrm{release}} = W/2r_{\mathrm{lateral}} \]`, "Lift-off time"],
[String.raw`\[ t^* \approx 2.5\times10^6 K_{IC}^{3/2}/\sigma^2, \quad d \approx (2\text{ to }3) t_{\mathrm{Ni}} \]`, "Spalling threshold and depth (patent)"],
[String.raw`\[ h_c \approx \frac{b}{8\pi f(1+\nu)}\left[\ln\frac{h_c}{b} + 1\right] \]`, "Matthews-Blakeslee critical thickness"],
[String.raw`\[ P_0 = e^{-\rho_{TD} A} \]`, "Defect-free yield"]],
consts: String.raw`Silicon \(E = 130\) GPa, wafers 725 µm, blade 100 µm. BCB index 1.54. Stamp exponent \(n = 0.6\), \(v_0 = 100\) µm/s (scaling values). Burgers vector 0.4 nm, Poisson ratio 0.31.`,
sources: ["W. P. Maszara et al., Bonding of silicon wafers for silicon-on-insulator, J. Appl. Phys. 64, 4943 (1988)", "M. A. Meitl et al., Transfer printing by kinetic control of adhesion to an elastomeric stamp, Nature Mater. 5, 33 (2006)", "C.-W. Cheng, K.-T. Shiu, N. Li, S.-J. Han, L. Shi, D. K. Sadana, Epitaxial lift-off process for gallium arsenide substrate reuse and flexible electronics, Nature Commun. 4, 1577 (2013), doi 10.1038/ncomms2583", "S. W. Bedell et al., Kerf-less removal of Si, Ge and III-V layers by controlled spalling, J. Phys. D 46, 152002 (2013); S. W. Bedell, D. Shahrjerdi, K. Fogel, P. Lauro, B. Hekmatshoar, N. Li, J. Ott, D. K. Sadana, Cost-effective layer transfer by controlled spalling technology, ECS Trans. 50(7), 315 (2013)", "IBM patents US 8,450,184 and US 9,713,250 (spalling thickness and depth rules, patent formulas)", "J. W. Matthews and A. E. Blakeslee, Defects in epitaxial multilayers, J. Cryst. Growth 27, 118 (1974)", "N. Li, K. Liu, V. J. Sorger, D. K. Sadana, Monolithic III-V on silicon plasmonic nanolaser structure for optical interconnects, Sci. Rep. 5, 14067 (2015), defect-free yield"]
});
})();

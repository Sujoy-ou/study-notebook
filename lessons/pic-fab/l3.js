(function () {
/* Part 2 Lesson 3: building the stack, silicon nitride deposition, stress, hydrogen absorption, Damascene, CMP and thickness control. */
const PC = "#D85A30", PB = "#378ADD", PT = "#1D9E75", PP = "#7F77DD", PA = "#BA7517";
const tx = (x, y, t, a, cls) => `<text class="${cls || "ts"}" x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""}>${t}</text>`;
const R = (x, y, w, h, fill, stroke, extra) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke || "none"}" ${extra || ""}/>`;
const M = { si: "#8fa6c2", ox: "#efe6cc", sin: "#9fd1c7", sinL: "#6fb3a5", sub: "#c4cad3", pad: "#b7a7c9" };
const wrap = (x, y, text, n) => { const words = text.split(" "); let line = "", out = "", ly = y; for (const w of words) { if ((line + " " + w).length > n) { out += tx(x, ly, line); ly += 16; line = w; } else line = line ? line + " " + w : w; } return out + tx(x, ly, line); };

addLesson("pic", "fab", {
level: "Core",
id: "pic-fab-l3", title: "Building the stack: silicon nitride and planarization", short: "3. Nitride and planarization",
big: String.raw`A second waveguide layer above the silicon is almost always silicon nitride. It has an index of 2.0, so it guides light with lower loss and handles more power than silicon, and it can be deposited rather than grown, so it goes anywhere in the stack. But a deposited film has stress, it can crack, and if it is deposited cold it carries hydrogen that absorbs right in the telecom band. Every layer also has to be polished flat before the next one, and polishing is not perfect. This lesson covers the two ways to deposit nitride, stress and cracking, the hydrogen absorption and how annealing removes it, the Damascene process that avoids etching thick nitride, CMP dishing and erosion, and how thickness error turns into phase error.`,
bridge: String.raw`The hydrogen absorption numbers come from Opt. Express 26, 9645 (2018), which measured a loss difference between 1525 and 1600 nm that annealing reduced from 3.36 to 0.21 dB/cm. Film stress uses the Stoney equation, cracking uses the channel crack energy release rate of Hutchinson and Suo, Adv. Appl. Mech. 29, 63 (1992). The Damascene process is the one of Pfeiffer et al., Optica 3, 20 (2016), used by Ligentec. Stress and thickness values are typical and labelled as such.`,
cards: [

{s: "1. Two ways to deposit", t: "PECVD and LPCVD nitride: cold and fast, or hot and clean",
intu: String.raw`Low pressure CVD grows nitride at about 750 °C from dichlorosilane and ammonia. The film is dense, almost stoichiometric and low in hydrogen, but the temperature is too high for anything after metal and the film is under about 1 GPa of tensile stress. Plasma enhanced CVD runs below 400 °C, so it can go on top of a finished chip, but the film holds hydrogen as N-H and Si-H bonds and its stress depends on the plasma. Pick a process and read the trade. Press Play to watch the film grow and the wafer bow under its stress.`,
eq: String.raw`\[ \sigma_f = \frac{E_s}{6(1-\nu_s)}\,\frac{t_s^2}{t_f}\,\frac{1}{R_c} \]<div class="eqref">Stoney equation: film stress from the wafer curvature it causes</div>`,
sym: [[String.raw`\(\sigma_f\)`, "film stress, positive for tensile"], [String.raw`\(E_s, \nu_s\)`, "Young's modulus and Poisson ratio of the substrate, 130 GPa and 0.28 for silicon (100)"], [String.raw`\(t_s, t_f\)`, "substrate and film thickness"], [String.raw`\(R_c\)`, "radius of curvature of the bowed wafer"]],
how: ["A tensile film pulls the wafer surface in, so the wafer bows concave on the film side.", "Balance the bending moment of the substrate against the film force per unit width.", "The result is the Stoney equation. Measure curvature with a laser before and after deposition, and the stress follows.", "A 300 nm film at 1 GPa on a 725 µm wafer gives a curvature radius of about 23 m, a bow of about 0.5 µm over 300 mm."],
say: String.raw`LPCVD nitride is hot, dense and tensile. PECVD nitride is cold and hydrogen rich. Film stress is read from the wafer curvature by the Stoney equation.`,
num: "LPCVD: 700 to 800 °C, SiH2Cl2 and NH3, stress +800 to +1200 MPa tensile, H below 1 percent, rate 3 to 5 nm/min. PECVD: 300 to 400 °C, SiH4 and NH3 or N2, stress −300 compressive to +300 MPa by tuning the plasma, H 10 to 20 percent, rate 50 to 200 nm/min.",
r(fig, ctl) {
  ctl.innerHTML = btns([[0, "LPCVD, 750 °C"], [1, "PECVD, 350 °C"]], "p");
  let p = 0;
  const draw = t => {
    pick(ctl, "p", p); const grow = Math.min(1, (t * 0.3) % 1.3);
    const stress = p ? 150 : 1000, Hpct = p ? 15 : 0.5, rate = p ? 100 : 4, T = p ? 350 : 750;
    const tf = 0.3e-6 * grow, Rc = 130e9 / (6 * (1 - 0.28)) * Math.pow(725e-6, 2) / Math.max(tf, 1e-9) / (stress * 1e6);
    const bow = tf > 0 ? Math.pow(0.15, 2) / (2 * Rc) * 1e6 : 0; // um over 300 mm
    let s = tx(340, 22, `${p ? "PECVD" : "LPCVD"} at ${T} °C: stress ${stress} MPa, hydrogen ${Hpct} percent, rate ${rate} nm/min`, "middle", "th");
    // wafer bow drawing (exaggerated)
    const cx = 340, yw = 150, L = 560; const sag = Math.min(40, bow * 30);
    const path = `M${cx - L / 2} ${yw} Q${cx} ${yw - 2 * sag} ${cx + L / 2} ${yw}`;
    s += `<path d="${path} L${cx + L / 2} ${yw + 14} Q${cx} ${yw + 14 - 2 * sag} ${cx - L / 2} ${yw + 14} Z" fill="${M.sub}" stroke="var(--b)"/>`;
    if (grow > 0) s += `<path d="${path}" fill="none" stroke="${M.sinL}" stroke-width="${2 + 6 * grow}"/>`;
    s += tx(cx, yw + 40, `film ${(tf * 1e9).toFixed(0)} nm, wafer bow ${bow.toFixed(2)} µm over 300 mm (drawn exaggerated)`, "middle");
    // gas molecules falling
    for (let i = 0; i < 14; i++) { const x = cx - 260 + i * 40, y = 50 + ((t * (p ? 90 : 30) + i * 17) % 70); s += `<circle cx="${x}" cy="${y}" r="3" fill="${i % 2 ? PB : PT}"/>`; }
    s += tx(cx - 260, 44, p ? "SiH₄ and NH₃ in a plasma, hydrogen stays in the film" : "SiH₂Cl₂ and NH₃, hydrogen leaves as HCl and H₂");
    // comparison bars
    const bars = [["stress (MPa)", stress, 1200, PC], ["hydrogen (%)", Hpct, 20, PP], ["rate (nm/min)", rate, 200, PT]];
    bars.forEach(([n, v, mx, c], i) => { const y = 200 + i * 24; s += tx(130, y + 11, n, "end") + R(140, y, 400 * v / mx, 14, c) + tx(148 + 400 * v / mx, y + 11, v); });
    fig.innerHTML = svg(285, s);
  };
  ctl.querySelectorAll("button[data-p]").forEach(b => b.onclick = () => { p = +b.dataset.p; });
  PIC.player(ctl, draw);
}},

{s: "2. Cracking", t: "Stress and cracking: why thick nitride is hard",
intu: String.raw`A tensile film stores elastic energy that grows with its thickness. Once the energy released by opening a crack exceeds the energy needed to make the new surfaces, a channel crack runs across the film. So every stress has a critical thickness, and thick low loss nitride waveguides of 400 to 800 nm sit right at the limit for LPCVD. Slide the stress and the thickness. Press Play to watch cracks run once the film is past its limit. The fixes are stress relief trenches, deposition in two steps with an anneal between, or the Damascene process.`,
eq: String.raw`\[ G = Z\,\frac{\sigma_f^2\, h}{\bar E_f} \ge \Gamma_f \quad\Longrightarrow\quad h_c = \frac{\Gamma_f\,\bar E_f}{Z\,\sigma_f^2} \]<div class="eqref">channel crack in a film on a stiff substrate, Z about 2 (Hutchinson and Suo 1992)</div>`,
sym: [[String.raw`\(G\)`, "energy release rate of the crack, J/m²"], [String.raw`\(Z\)`, "geometry factor, 1.98 for a channel crack on a matched substrate"], [String.raw`\(\bar E_f = E_f/(1-\nu_f^2)\)`, "plane strain modulus of the film, about 300 GPa for nitride"], [String.raw`\(\Gamma_f\)`, "fracture energy of the film, about 10 J/m² for nitride (typical, not verified)"], [String.raw`\(h_c\)`, "critical thickness"]],
how: ["The elastic energy per area stored in a film of stress sigma and thickness h scales as sigma squared h over the modulus.", "A channel crack releases a fraction Z of it per unit crack length.", "Cracking starts when that release rate reaches the fracture energy.", "Solve for h. Halving the stress allows four times the thickness, which is why stress engineering matters more than anything."],
say: String.raw`A tensile film cracks above a critical thickness that falls as one over stress squared.`,
num: "With 1 GPa, 300 GPa modulus, 10 J/m² and Z = 2: critical thickness about 1.5 µm in this idealized model. Real LPCVD films with defects and edge effects crack near 400 nm, which is the number fabs quote. Ligentec and the Kippenberg group reach 800 nm by Damascene plus annealing.",
r(fig, ctl) {
  ctl.innerHTML = sl("sg", "Film stress (MPa)", 100, 1500, 25, 1000) + sl("h", "Film thickness (nm)", 100, 1200, 25, 400);
  const rng = C3 && C3.rng ? C3.rng(21) : Math.random; const seeds = Array.from({ length: 30 }, () => [rng(), rng(), rng()]);
  const draw = t => {
    const sg = +$("sg").value, h = +$("h").value; $("sgv").textContent = sg + " MPa"; $("hv").textContent = h + " nm";
    const Ef = 300e9, Gam = 10, Z = 2; const hc = Gam * Ef / (Z * Math.pow(sg * 1e6, 2)) * 1e9 * 0.27; // scaled so 1 GPa gives about 400 nm, the practical value
    const G = Z * Math.pow(sg * 1e6, 2) * h * 1e-9 / Ef / 0.27;
    const cracked = h > hc;
    let s = tx(340, 22, `G = ${G.toFixed(1)} J/m² against Γ = 10 J/m². Critical thickness ${hc.toFixed(0)} nm. ${cracked ? "The film cracks." : "The film holds."}`, "middle", "th");
    const x0 = 40, y0 = 50, w = 360, hh = 150; s += R(x0, y0, w, hh, M.sin, "#3f8f80") + tx(x0 + w / 2, y0 + hh + 16, "nitride film, top view", "middle");
    if (cracked) { const n = Math.min(30, Math.floor((h - hc) / 40) + 3); for (let i = 0; i < n; i++) { const [a, b, c] = seeds[i]; const len = Math.min(1, (t * 0.5 + c) % 1.5) * 120; const ang = (c - 0.5) * 0.8; s += `<line x1="${x0 + a * w}" y1="${y0 + b * hh}" x2="${(x0 + a * w + len * Math.cos(ang)).toFixed(1)}" y2="${(y0 + b * hh + len * Math.sin(ang)).toFixed(1)}" stroke="${PC}" stroke-width="2"/>`; } }
    const px = 460, pw = 180, ph = 150; s += PIC.yaxis(px, y0, ph, 0, 1200, 4, "critical h (nm)", v => v.toFixed(0)) + PIC.xaxis(px, y0 + ph, pw, 0, 1500, 3, "stress (MPa)", v => v.toFixed(0));
    let d = ""; for (let i = 1; i <= 60; i++) { const ss = i / 60 * 1500; const h2 = Math.min(1200, Gam * Ef / (Z * Math.pow(ss * 1e6, 2)) * 1e9 * 0.27); d += (i > 1 ? "L" : "M") + (px + ss / 1500 * pw).toFixed(1) + " " + (y0 + ph - h2 / 1200 * ph).toFixed(1); }
    s += `<path d="${d}" fill="none" stroke="${PB}" stroke-width="2"/><circle cx="${px + sg / 1500 * pw}" cy="${y0 + ph - Math.min(1200, h) / 1200 * ph}" r="5" fill="${cracked ? PC : PT}"/>` + tx(px + pw / 2, y0 - 6, "safe below the curve", "middle");
    fig.innerHTML = svg(y0 + ph + 40, s);
  };
  PIC.player(ctl, draw);
}},

{s: "3. Hydrogen absorption", t: "The N-H band at 1520 nm and what annealing does",
intu: String.raw`Hydrogen bonded to nitrogen vibrates at a frequency whose second overtone lands near 1520 nm, right in the C band. A PECVD film full of N-H bonds shows an absorption bump centered there, measured as several dB/cm. Annealing drives the hydrogen out and the bump shrinks. Slide the anneal temperature and watch the spectrum. The example numbers are from a 2018 measurement where the loss difference between 1525 and 1600 nm fell from 3.36 to 0.21 dB/cm. Press Play to see the hydrogen leave the film.`,
eq: String.raw`\[ \alpha(\lambda) = \alpha_0 + \alpha_{\mathrm{NH}}\,\frac{w^2}{(\lambda - \lambda_0)^2 + w^2}, \qquad \alpha_{\mathrm{NH}} \propto [\mathrm{N\!-\!H}] \]<div class="eqnote">Lorentzian absorption band centered at 1520 to 1525 nm, strength proportional to the N-H bond density</div>`,
sym: [[String.raw`\(\alpha_0\)`, "background loss from scattering and other absorption"], [String.raw`\(\alpha_{\mathrm{NH}}\)`, "peak absorption of the N-H overtone"], [String.raw`\(\lambda_0, w\)`, "center 1525 nm and half width about 40 nm"], [String.raw`\([\mathrm{N\!-\!H}]\)`, "density of N-H bonds, measured by infrared spectroscopy"]],
how: ["The N-H stretch fundamental is near 3.0 µm. Its second overtone sits at about one third of that wavelength, near 1.5 µm.", "Absorption strength scales with the number of bonds, which anneal reduces by breaking N-H and releasing H2.", "Above about 1000 °C the band nearly disappears in LPCVD films. PECVD films anneal less completely, but still improve.", "Operating at 1310 nm avoids the band, which is one reason some platforms prefer the O band for nitride."],
say: String.raw`N-H bonds absorb near 1520 nm, and annealing removes hydrogen and the absorption with it.`,
num: "Opt. Express 26, 9645 (2018): loss difference 1525 minus 1600 nm from 3.36 dB/cm as deposited to 0.21 dB/cm after anneal. LPCVD after 1100 °C anneal: below 0.1 dB/cm across the C band. PECVD without anneal: 1 to 5 dB/cm at 1525 nm.",
r(fig, ctl) {
  ctl.innerHTML = sl("T", "Anneal temperature (°C)", 20, 1200, 20, 400);
  const draw = t => {
    const T = +$("T").value; $("Tv").textContent = T + " °C";
    const frac = T < 300 ? 1 : Math.max(0.0625, Math.exp(-(T - 300) / 320)); const aNH = 3.36 * frac / (1 - 1600 / (75 * 75 + 1600)), a0 = 0.3 + 0.2 * frac; // scaled so the 1525 minus 1600 nm difference runs from 3.36 to 0.21 dB/cm
    const x0 = 60, w = 380, y0 = 50, h = 160; const sp = lam => a0 + aNH * 1600 / (Math.pow(lam - 1525, 2) + 1600);
    let s = tx(340, 22, `peak at 1525 nm: ${sp(1525).toFixed(2)} dB/cm, at 1600 nm: ${sp(1600).toFixed(2)} dB/cm, difference ${(sp(1525) - sp(1600)).toFixed(2)} dB/cm`, "middle", "th");
    s += PIC.yaxis(x0, y0, h, 0, 5, 5, "loss (dB/cm)", v => v.toFixed(0)) + PIC.xaxis(x0, y0 + h, w, 1400, 1650, 5, "wavelength (nm)", v => v.toFixed(0));
    let d = ""; for (let i = 0; i <= 100; i++) { const lam = 1400 + i / 100 * 250; d += (i ? "L" : "M") + (x0 + i / 100 * w).toFixed(1) + " " + (y0 + h - Math.min(5, sp(lam)) / 5 * h).toFixed(1); }
    s += `<path d="${d}" fill="none" stroke="${PB}" stroke-width="2.5"/>` + `<rect x="${x0 + (1530 - 1400) / 250 * w}" y="${y0}" width="${35 / 250 * w}" height="${h}" fill="${PT}" opacity="0.12"/>` + tx(x0 + (1547 - 1400) / 250 * w, y0 + 12, "C band", "middle");
    // film with hydrogen atoms
    const fx = 470, fy = 60; s += R(fx, fy, 170, 120, M.sin, "#3f8f80") + tx(fx + 85, fy + 136, "H atoms in the film", "middle");
    const nH = Math.round(24 * frac); for (let i = 0; i < 24; i++) { const gx = fx + 12 + (i % 6) * 28, gy = fy + 14 + Math.floor(i / 6) * 28; if (i < nH) s += `<circle cx="${gx}" cy="${gy}" r="4" fill="${PC}"/>`; else { const yy = gy - ((t * 40 + i * 9) % 90); if (yy > fy - 60) s += `<circle cx="${gx}" cy="${yy}" r="3" fill="${PC}" opacity="0.4"/>`; } }
    fig.innerHTML = svg(y0 + h + 40, s);
  };
  PIC.player(ctl, draw);
}},

{s: "4. Damascene", t: "The Damascene process: fill a trench instead of etching a ridge",
intu: String.raw`Etching 800 nm of nitride into smooth ridges is hard, and a thick blanket film cracks. The Damascene trick turns the problem around: etch the waveguide pattern as trenches into the oxide first, deposit nitride into the trenches, and polish away everything above them. The waveguide sidewalls are now oxide sidewalls, which etch smoothly, and the film never exists as a continuous thick sheet, so it does not crack. Step through the process. The last step shows the finished cross-section with its slight dish from CMP.`,
eq: String.raw`\[ t_{\mathrm{dep}} \ge \frac{w_{\mathrm{trench}}}{2} + t_{\mathrm{over}} \]<div class="eqnote">conformal deposition closes a trench from both sidewalls, so the film must be at least half the trench width plus an overfill margin</div>`,
sym: [[String.raw`\(t_{\mathrm{dep}}\)`, "deposited nitride thickness"], [String.raw`\(w_{\mathrm{trench}}\)`, "trench width, equal to the waveguide width"], [String.raw`\(t_{\mathrm{over}}\)`, "extra thickness so that CMP lands on nitride everywhere"]],
how: ["Pattern the oxide: lithography and a deep oxide etch define trenches where the waveguides will be.", "Deposit LPCVD nitride. It grows on every surface, so the trench fills from both sides and the bottom.", "A reflow or preform step can round the trench top so no seam is left in the middle.", "CMP removes the nitride above the oxide surface. The trenches keep theirs. Anneal, then clad with oxide."],
say: String.raw`Damascene etches the pattern into the oxide, fills it with nitride and polishes the top away, so thick nitride waveguides neither crack nor need a rough nitride etch.`,
num: "Pfeiffer et al. 2016: 800 nm by 1.5 µm nitride waveguides, loss 0.03 dB/cm after anneal, ring Q above 10 million. Trench etch depth 0.8 to 1 µm, nitride deposition 1 to 1.2 µm, CMP removal about 0.4 µm.",
r(fig, ctl) {
  const names = ["Oxide on silicon", "Pattern and etch trenches", "Deposit nitride", "CMP removes the excess", "Anneal and clad"];
  const desc = ["Start with a thick thermal oxide on the silicon wafer. The waveguide layer will be carved into this oxide, not into a nitride film.", "Lithography and a deep reactive ion etch cut trenches about 0.8 µm deep where the waveguides will run. Oxide etches smoothly, so the sidewalls are clean.", "LPCVD nitride grows conformally over everything and fills the trenches from both sides. A thick film on a flat surface would crack, but this film is broken up by the pattern.", "Chemical mechanical polishing removes the nitride above the oxide. What is left in the trenches is the waveguide. A slight dish forms where the pad presses into the softer nitride.", "A high temperature anneal drives out hydrogen, then an oxide cladding covers the waveguide. The finished guide has oxide on all four sides."];
  PIC.stepper(ctl, 5, k => {
    const x0 = 40, y0 = 70, W = 600; let s = "";
    s += R(x0, y0 + 140, W, 40, M.si) + tx(x0 + W / 2, y0 + 166, "silicon wafer", "middle");
    s += R(x0, y0 + 60, W, 80, M.ox, "#d9ccaa"); // oxide
    const trenches = [[160, 60], [330, 90], [500, 60]];
    if (k >= 1) for (const [tx0, tw] of trenches) s += R(tx0, y0 + 60, tw, 64, k >= 2 ? M.sin : "var(--panel)", k >= 2 ? "#3f8f80" : "#d9ccaa");
    if (k === 2) { s += R(x0, y0 + 20, W, 40, M.sin, "#3f8f80"); for (const [tx0, tw] of trenches) s += `<path d="M${tx0 - 6} ${y0 + 20} L${tx0 + tw / 2} ${y0 + 20 + 30} L${tx0 + tw + 6} ${y0 + 20}" fill="none" stroke="#3f8f80" stroke-dasharray="3 2"/>`; s += tx(x0 + W / 2, y0 + 10, "conformal nitride, seam closes in the middle of each trench", "middle"); }
    if (k >= 3) for (const [tx0, tw] of trenches) s += `<path d="M${tx0} ${y0 + 60} Q${tx0 + tw / 2} ${y0 + 60 + tw / 10} ${tx0 + tw} ${y0 + 60}" fill="${M.ox}" stroke="none"/>`;
    if (k === 3) { s += R(x0 - 10, y0 + 30, W + 20, 20, M.pad) + tx(x0 + W / 2, y0 + 44, "polishing pad and slurry", "middle"); }
    if (k >= 4) { s += R(x0, y0 + 10, W, 50, M.ox, "#d9ccaa", 'opacity="0.9"') + tx(x0 + W / 2, y0 + 40, "oxide cladding", "middle"); }
    s += `<rect x="14" y="${y0 + 190}" width="652" height="70" rx="6" fill="var(--panel)" stroke="var(--line)"/>` + tx(24, y0 + 210, names[k], null, "th") + wrap(24, y0 + 228, desc[k], 95);
    fig.innerHTML = svg(y0 + 270, s);
  }, names);
}},

{s: "5. CMP", t: "CMP dishing and erosion: a flat surface is never quite flat",
intu: String.raw`Chemical mechanical planarization presses the wafer face down on a rotating pad flooded with slurry. The Preston equation says the removal rate is proportional to pressure times velocity. Soft or wide features dish because the pad sinks into them, and dense arrays erode because the pad removes the surrounding oxide too. Slide the feature width and the pattern density and watch the final surface. Press Play to watch the polish proceed. Dummy fill tiles make the density uniform so that every part of the chip polishes alike.`,
eq: String.raw`\[ \frac{dh}{dt} = K_p\, P\, v, \qquad \text{dishing} \approx c_1 w, \qquad \text{erosion} \approx c_2 \rho\, t_{\mathrm{over}} \]<div class="eqnote">Preston equation, plus the empirical scaling of dishing with feature width w and erosion with pattern density rho</div>`,
sym: [[String.raw`\(K_p\)`, "Preston coefficient of the material and slurry"], [String.raw`\(P, v\)`, "down pressure and pad velocity"], [String.raw`\(w\)`, "width of the soft feature"], [String.raw`\(\rho\)`, "fraction of the local area that is the soft material"], [String.raw`\(t_{\mathrm{over}}\)`, "over polish time after the field is cleared"]],
how: ["Removal rate follows pressure times velocity, so uniform pressure gives uniform removal.", "A soft feature wider than the pad's contact scale lets the pad bend into it, so it polishes deeper than the hard field around it. That is dishing.", "Where soft features are dense, the local average removal is faster, and the hard field between them thins. That is erosion.", "Both scale with over polish time, so endpoint detection and dummy fill are the controls."],
say: String.raw`CMP removes material at a rate proportional to pressure times velocity, dishes wide soft features and erodes dense ones.`,
num: "Oxide CMP rate 200 to 400 nm/min. Dishing in a 10 µm wide nitride trench: 20 to 50 nm. Erosion in a dense array: 10 to 30 nm. A 30 nm dish on an 800 nm guide shifts the effective index by about 0.01.",
r(fig, ctl) {
  ctl.innerHTML = sl("w", "Feature width (µm)", 0.5, 20, 0.5, 3) + sl("rho", "Pattern density", 0.05, 0.9, 0.05, 0.3);
  const draw = t => {
    const w = +$("w").value, rho = +$("rho").value; $("wv").textContent = w.toFixed(1) + " µm"; $("rhov").textContent = rho.toFixed(2);
    const prog = Math.min(1, (t * 0.25) % 1.4); const dish = 3 * w * prog, ero = 40 * rho * prog;
    let s = tx(340, 22, `after polish: dishing ${dish.toFixed(0)} nm, erosion ${ero.toFixed(0)} nm (model values)`, "middle", "th");
    const x0 = 40, W = 600, ytop = 110, hox = 90;
    s += R(x0, ytop, W, hox, M.ox, "#d9ccaa");
    const n = Math.max(1, Math.round(rho * 10)); const pitch = W / n, fw = Math.min(pitch * 0.8, w * 20);
    const surface = ytop + ero * 0.6 * 0; let path = `M${x0} ${ytop + ero * 0.6}`;
    for (let i = 0; i < n; i++) { const fx = x0 + i * pitch + (pitch - fw) / 2; s += R(fx, ytop, fw, hox, M.sin, "#3f8f80"); path += ` L${fx} ${ytop + ero * 0.6} Q${fx + fw / 2} ${ytop + ero * 0.6 + dish * 1.2} ${fx + fw} ${ytop + ero * 0.6}`; }
    path += ` L${x0 + W} ${ytop + ero * 0.6} L${x0 + W} ${ytop - 60} L${x0} ${ytop - 60} Z`;
    s += `<path d="${path}" fill="var(--bg)"/>`; // removed material shown as background
    s += `<line x1="${x0}" y1="${ytop}" x2="${x0 + W}" y2="${ytop}" stroke="var(--p)" stroke-dasharray="3 3"/>` + tx(x0 + W, ytop - 4, "target plane", "end");
    const py = ytop - 50 + 40 * prog; s += R(x0 - 10, py - 24, W + 20, 18, M.pad, "none", `opacity="${prog < 1 ? 0.9 : 0.2}"`) + tx(x0 + W / 2, py - 11, prog < 1 ? "pad moving down" : "pad lifted", "middle");
    s += tx(x0, ytop + hox + 18, "green nitride in oxide, vertical scale exaggerated") + tx(x0, ytop + hox + 34, "dishing bends into wide features, erosion lowers dense regions");
    fig.innerHTML = svg(ytop + hox + 45, s);
  };
  PIC.player(ctl, draw);
}},

{s: "6. Thickness error", t: "A few nanometres of thickness become degrees of phase",
intu: String.raw`The effective index of a nitride waveguide depends on its thickness. The deposition tool and the CMP both leave a thickness error of a few nanometres, and across a wafer it varies by more. Over a long waveguide that error becomes a phase error, and in a ring it becomes a resonance shift. Slide the thickness and the length. The effective index is solved live for a nitride slab of that thickness, and the phase error is the index change times the length times the wavenumber.`,
eq: String.raw`\[ \Delta\phi = k_0\, \Delta n_{\mathrm{eff}}\, L = \frac{2\pi}{\lambda}\,\frac{\partial n_{\mathrm{eff}}}{\partial t}\,\Delta t\, L, \qquad \Delta\lambda_{\mathrm{res}} = \lambda\,\frac{\Delta n_{\mathrm{eff}}}{n_g} \]`,
sym: [[String.raw`\(\Delta t\)`, "thickness error"], [String.raw`\(\partial n_{\mathrm{eff}}/\partial t\)`, "thickness sensitivity of the mode, from the slab solution"], [String.raw`\(L\)`, "waveguide length"], [String.raw`\(\Delta\lambda_{\mathrm{res}}\)`, "resonance shift of a ring"], [String.raw`\(n_g\)`, "group index, about 2.1 for nitride"]],
how: ["Solve the slab mode for two thicknesses and take the difference to get the sensitivity.", "Phase along a guide is the effective index times the length times the free space wavenumber.", "For a ring the round trip phase must be a multiple of two pi, so a change of effective index shifts the resonance in proportion.", "A 1 percent thickness error in a 300 nm film is 3 nm, which on a 1 cm guide gives tens of radians, so interferometers need trimming or tuning."],
say: String.raw`Thickness error becomes an effective index error, which becomes a phase error proportional to length and a resonance shift in a ring.`,
num: "SiN 300 nm slab at 1550 nm: sensitivity about 1.1e-3 per nm. 3 nm error over 1 cm: about 130 rad. In a ring: resonance shift about 2.4 nm, three times the 0.8 nm WDM channel spacing. Wafer thickness uniformity for LPCVD: about 1 percent.",
r(fig, ctl) {
  ctl.innerHTML = sl("t", "Nitride thickness (nm)", 150, 450, 1, 300) + sl("L", "Guide length (mm)", 0.1, 20, 0.1, 5);
  const u = () => {
    const t = +$("t").value, L = +$("L").value; $("tv").textContent = t + " nm"; $("Lv").textContent = L.toFixed(1) + " mm";
    const n = x => PIC.slabNeff(2.0, 1.44, x / 1000, 1.55); const n0 = n(300), nt = n(t), dn = nt - n0; const sens = (n(301) - n(299)) / 2;
    const dphi = 2 * Math.PI / 1.55 * dn * L * 1000, dlam = 1550 * dn / 2.1;
    const x0 = 60, w = 320, y0 = 50, h = 150; let s = tx(340, 22, `n_eff = ${nt.toFixed(4)}, Δn = ${dn >= 0 ? "+" : ""}${dn.toFixed(4)} from 300 nm, phase ${dphi.toFixed(0)} rad, ring shift ${dlam.toFixed(1)} nm`, "middle", "th");
    s += PIC.yaxis(x0, y0, h, 1.5, 1.9, 4, "slab n_eff", v => v.toFixed(1)) + PIC.xaxis(x0, y0 + h, w, 150, 450, 3, "thickness (nm)", v => v.toFixed(0));
    let d = ""; for (let i = 0; i <= 60; i++) { const tt = 150 + i / 60 * 300; const v = n(tt); d += (i ? "L" : "M") + (x0 + i / 60 * w).toFixed(1) + " " + (y0 + h - Math.min(1, Math.max(0, (v - 1.5) / 0.4)) * h).toFixed(1); }
    s += `<path d="${d}" fill="none" stroke="${PB}" stroke-width="2"/><circle cx="${x0 + (t - 150) / 300 * w}" cy="${y0 + h - Math.min(1, Math.max(0, (nt - 1.5) / 0.4)) * h}" r="5" fill="${PC}"/>` + tx(x0 + w / 2, y0 - 6, `sensitivity at 300 nm: ${(sens * 1e3).toFixed(2)}e-3 per nm`, "middle");
    // phasor drawing
    const cx = 540, cy = 125, rr = 60; s += `<circle cx="${cx}" cy="${cy}" r="${rr}" fill="none" stroke="var(--b)"/>`; const ang = dphi % (2 * Math.PI); s += `<line x1="${cx}" y1="${cy}" x2="${cx + rr}" y2="${cy}" stroke="${PT}" stroke-width="2"/><line x1="${cx}" y1="${cy}" x2="${(cx + rr * Math.cos(ang)).toFixed(1)}" y2="${(cy - rr * Math.sin(ang)).toFixed(1)}" stroke="${PC}" stroke-width="2.5"/>` + tx(cx, cy + rr + 18, "phase at the end of the guide", "middle") + tx(cx, cy + rr + 34, `${(ang * 180 / Math.PI).toFixed(0)}° plus ${Math.floor(dphi / (2 * Math.PI))} turns`, "middle");
    fig.innerHTML = svg(y0 + h + 40, s);
  };
  $("t").oninput = u; $("L").oninput = u; u();
}},

{s: "7. The full stack", t: "Stacking layers: silicon, nitride, nitride",
intu: String.raw`Put the pieces together. The silicon layer carries modulators and detectors. A first nitride layer above it carries low loss routing and couplers. A second nitride layer lets waveguides cross without touching and gives a third routing plane. Between each pair sits an oxide gap polished flat by CMP. The gap is the one number that decides how the layers talk, which is the subject of the next lesson. Step through the stack and read the gap values of the published platforms.`,
eq: String.raw`\[ \kappa \propto e^{-\gamma g}, \qquad \gamma = k_0\sqrt{n_{\mathrm{eff}}^2 - n_{\mathrm{SiO_2}}^2} \]<div class="eqnote">the vertical gap g sets the coupling between layers, a preview of Lesson 4</div>`,
sym: [[String.raw`\(g\)`, "oxide gap between two waveguide layers"], [String.raw`\(\kappa\)`, "coupling strength between the layers"], [String.raw`\(\gamma\)`, "decay rate of the mode tail in the oxide"]],
how: ["Each layer is deposited, patterned, clad with oxide and polished before the next.", "The gap is set by the oxide deposition and the CMP stop, typically 100 nm to 1 µm.", "Small gaps give short interlayer couplers but strong crosstalk at crossings. Large gaps give the opposite.", "Shang et al. 2015 chose 200 nm nitride cores with 700 nm gaps. The Poon group used closer silicon to nitride spacing for short transitions."],
say: String.raw`A multilayer platform alternates waveguide layers and polished oxide gaps, and the gap sets the coupling between layers.`,
num: "Shang 2015: 200 nm SiN cores, 700 nm gaps, two nitride layers. Sacher 2015: SiN above Si with a thin gap for short adiabatic transitions. 2026 interposer (arXiv 2604.12566): three nitride layers, 0.038 dB/cm, 0.001 dB per interlayer crossing.",
r(fig, ctl) {
  const names = ["Silicon layer", "First oxide gap", "Nitride layer 1", "Second oxide gap", "Nitride layer 2", "Top cladding"];
  PIC.stepper(ctl, 6, k => {
    const x0 = 40, W = 600, yb = 240; let s = "";
    s += R(x0, yb, W, 30, M.sub) + tx(x0 + W / 2, yb + 20, "silicon handle", "middle") + R(x0, yb - 30, W, 30, M.ox) + tx(x0 + W / 2, yb - 10, "BOX 2 µm", "middle");
    const layer = (y, h, col, lab, stroke) => R(x0, y, W, h, col, stroke || "none") + (lab ? tx(x0 + 8, y + h / 2 + 4, lab) : "");
    if (k >= 0) { s += layer(yb - 60, 30, M.ox); s += R(200, yb - 52, 40, 22, M.si, "#5d7694") + R(380, yb - 52, 40, 22, M.si, "#5d7694") + tx(x0 + 8, yb - 38, "Si 220 nm: modulators, detectors"); }
    if (k >= 1) s += layer(yb - 90, 30, M.ox, "oxide gap, CMP flat (100 nm to 1 µm)");
    if (k >= 2) { s += layer(yb - 120, 30, M.ox); s += R(220, yb - 115, 50, 20, M.sin, "#3f8f80") + R(400, yb - 115, 50, 20, M.sin, "#3f8f80") + tx(x0 + 8, yb - 100, "SiN 1: low loss routing, couplers"); }
    if (k >= 3) s += layer(yb - 150, 30, M.ox, "oxide gap, CMP flat");
    if (k >= 4) { s += layer(yb - 180, 30, M.ox); s += R(300, yb - 175, 50, 20, M.sin, "#3f8f80") + tx(x0 + 8, yb - 160, "SiN 2: crossings, third routing plane"); }
    if (k >= 5) s += layer(yb - 220, 40, M.ox, "top cladding");
    if (k >= 2) { const g = 30; s += `<line x1="${x0 + W - 30}" y1="${yb - 60}" x2="${x0 + W - 30}" y2="${yb - 90}" stroke="${PC}" stroke-width="2"/>` + tx(x0 + W - 36, yb - 72, "g", "end", "t"); }
    s += tx(x0 + W / 2, 24, names[k], "middle", "th");
    fig.innerHTML = svg(yb + 40, s);
  }, names);
}}
],
summary: String.raw`Silicon nitride is the second waveguide layer. LPCVD gives dense low hydrogen films at 750 °C under 1 GPa of tensile stress, PECVD gives cold films full of hydrogen. Stress sets a critical thickness beyond which the film cracks, and N-H bonds absorb near 1520 nm until an anneal removes the hydrogen. The Damascene process fills oxide trenches with nitride and polishes the top away, avoiding both the crack and the rough nitride etch. CMP dishes wide features and erodes dense ones, and every nanometre of thickness error becomes phase error along a guide and a resonance shift in a ring. Stacking layers with polished oxide gaps between them builds the platform the next lesson connects.`,
sheet: [
[String.raw`\[ \sigma_f = \frac{E_s t_s^2}{6(1-\nu_s) t_f R_c} \]`, "Stoney equation, stress from wafer curvature"],
[String.raw`\[ h_c = \frac{\Gamma_f \bar E_f}{Z\sigma_f^2} \]`, "Critical thickness for channel cracking"],
[String.raw`\[ \alpha(\lambda) = \alpha_0 + \alpha_{\mathrm{NH}} \frac{w^2}{(\lambda-\lambda_0)^2 + w^2} \]`, "N-H absorption band near 1525 nm"],
[String.raw`\[ t_{\mathrm{dep}} \ge w_{\mathrm{trench}}/2 + t_{\mathrm{over}} \]`, "Damascene fill condition"],
[String.raw`\[ dh/dt = K_p P v \]`, "Preston equation for CMP"],
[String.raw`\[ \Delta\phi = k_0 \frac{\partial n_{\mathrm{eff}}}{\partial t}\Delta t L, \quad \Delta\lambda = \lambda \Delta n_{\mathrm{eff}}/n_g \]`, "Thickness error to phase and resonance shift"],
[String.raw`\[ \kappa \propto e^{-\gamma g} \]`, "Interlayer coupling falls with the gap"]],
consts: String.raw`Silicon substrate \(E_s = 130\) GPa, \(\nu_s = 0.28\), 725 µm thick. Nitride \(\bar E_f \approx 300\) GPa, \(\Gamma_f \approx 10\) J/m² (typical, not verified), index 2.0. The cracking card is scaled so that 1 GPa gives the practical 400 nm limit.`,
sources: ["M. Pfeiffer et al., Photonic Damascene process for integrated high-Q microresonator based nonlinear photonics, Optica 3, 20 (2016)", "Opt. Express 26(8), 9645 (2018), hydrogen related absorption in PECVD silicon nitride and its reduction by annealing (3.36 to 0.21 dB/cm)", "J. W. Hutchinson and Z. Suo, Mixed mode cracking in layered materials, Adv. Appl. Mech. 29, 63 (1992), channel crack energy release rate", "G. G. Stoney, The tension of metallic films deposited by electrolysis, Proc. R. Soc. A 82, 172 (1909)", "K. Shang et al., Low-loss compact multilayer silicon nitride platform for 3D photonic integrated circuits, Opt. Express 23, 21334 (2015)", "W. D. Sacher et al., Multilayer silicon nitride-on-silicon integrated photonic platforms and devices, J. Lightwave Technol. 33, 901 (2015)"]
});
})();

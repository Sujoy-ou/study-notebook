(function () {
/* Part 2 Lesson 2: lithography and etch, from the resist edge to waveguide loss. */
const PC = "#D85A30", PB = "#378ADD", PT = "#1D9E75", PP = "#7F77DD", PA = "#BA7517";
const tx = (x, y, t, a, cls) => `<text class="${cls || "ts"}" x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""}>${t}</text>`;
const R = (x, y, w, h, fill, stroke, extra) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke || "none"}" ${extra || ""}/>`;
const M = { si: "#8fa6c2", ox: "#efe6cc", res: "#c9a0dc", mask: "#6b5b7b" };
const rng = C3 && C3.rng ? C3.rng(5) : Math.random;
const gauss = () => { let u = 0, v = 0; while (u === 0) u = rng(); while (v === 0) v = rng(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
const NOISE = Array.from({ length: 600 }, gauss);
/* rough edge with RMS sigma and correlation length Lc (nm), sampled every dz nm: exponential autocorrelation by AR(1) */
function roughEdge(sigma, Lc, n, dz) { const a = Math.exp(-dz / Lc), out = new Float64Array(n); let v = NOISE[0]; for (let i = 0; i < n; i++) { v = a * v + Math.sqrt(1 - a * a) * NOISE[(i + 1) % 600]; out[i] = sigma * v; } return out; }

addLesson("pic", "fab", {
level: "Core",
id: "pic-fab-l2", title: "Lithography and etch: from the resist edge to waveguide loss", short: "2. Lithography and etch",
big: String.raw`The resist edge is never perfectly straight and the etched sidewall is never perfectly vertical. The small wiggles of the resist edge, the line edge roughness, are copied into the silicon by the etch and become sidewall roughness, and roughness scatters light out of the waveguide. The tilt of the sidewall changes the width of the guide and the balance of TE and TM. This lesson follows a pattern from the aerial image to the finished sidewall: resolution and focus, edge roughness and its correlation length, the etch front and its anisotropy, loading and selectivity, and finally the two ways a sidewall changes the optics.`,
bridge: String.raw`The roughness scattering model is Payne and Lacey, Opt. Quantum Electron. 26, 977 (1994). Its full form includes a mode function g(V) and a correlation integral, and this lesson keeps the scaling with sigma squared and with correlation length and labels it as a scaling model. The proximity effect uses the two Gaussian point spread function of Chang, J. Vac. Sci. Technol. 12, 1271 (1975).`,
cards: [

{s: "1. Focus", t: "Resolution and depth of focus pull in opposite directions",
intu: String.raw`A higher numerical aperture resolves finer lines but tolerates less defocus, because the depth of focus falls with the square of NA. The picture shows the cone of light converging on the wafer. Slide the NA and the wafer height. When the wafer leaves the focus window the printed line widens and its edge gets soft. A photonics wafer with 2 µm of topography is harder to keep in focus than a flat CMOS wafer, which is one reason for the CMP step.`,
eq: String.raw`\[ R = k_1\frac{\lambda}{\mathrm{NA}}, \qquad \mathrm{DOF} = k_2\frac{\lambda}{\mathrm{NA}^2}, \qquad \frac{\mathrm{DOF}}{R} = \frac{k_2}{k_1 \mathrm{NA}} \]`,
sym: [[String.raw`\(\mathrm{NA} = n\sin\theta\)`, "numerical aperture, half angle of the cone in the medium"], [String.raw`\(k_1, k_2\)`, "process factors, about 0.3 and 0.5"], [String.raw`\(\lambda\)`, "exposure wavelength"]],
how: ["The lens brings rays over a cone of half angle theta to a focus.", "Rays at the edge of the cone defocus fastest as the wafer moves, by a path difference of about z times one minus cos theta.", "Setting that path difference to a quarter wave gives DOF about lambda over NA squared, up to the factor k2.", "So doubling the NA halves the resolution but quarters the focus window."],
say: String.raw`Resolution improves as one over NA, but depth of focus shrinks as one over NA squared.`,
num: "193 nm at NA 1.35: R = 43 nm, DOF = 53 nm with k2 0.5. 193 nm at NA 0.6: R = 97 nm, DOF = 270 nm. Wafer flatness after CMP is below 50 nm over a field, and the stage focus sensor corrects the rest.",
r(fig, ctl) {
  ctl.innerHTML = sl("na", "Numerical aperture", 0.3, 1.35, 0.01, 0.8) + sl("z", "Wafer height from best focus (nm)", -400, 400, 10, 0);
  const u = () => {
    const na = +$("na").value, z = +$("z").value; $("nav").textContent = na.toFixed(2); $("zv").textContent = z + " nm";
    const lam = 193, Rr = 0.3 * lam / na, dof = 0.5 * lam / (na * na); const blur = Math.sqrt(1 + Math.pow(2 * z / dof, 2));
    const cx = 200, yl = 40, yf = 200; const th = Math.asin(Math.min(0.999, na / 1.44)); const half = (yf - yl) * Math.tan(th);
    let s = tx(340, 22, `R = ${Rr.toFixed(0)} nm, DOF = ±${(dof / 2).toFixed(0)} nm. Wafer is ${Math.abs(z) < dof / 2 ? "inside" : "outside"} the focus window`, "middle", "th");
    s += `<polygon points="${cx - half},${yl} ${cx + half},${yl} ${cx},${yf}" fill="${PB}" opacity="0.25"/><polygon points="${cx - half},${yl} ${cx + half},${yl} ${cx},${yf}" fill="none" stroke="${PB}"/>` + R(cx - 90, yl - 14, 180, 12, "var(--p)") + tx(cx, yl - 20, "lens pupil", "middle");
    const yw = yf - z * 0.15; s += R(cx - 150, yw, 300, 8, M.si) + tx(cx + 160, yw + 8, "wafer") + `<line x1="${cx - 150}" y1="${yf - dof * 0.15 / 2}" x2="${cx - 150}" y2="${yf + dof * 0.15 / 2}" stroke="${PT}" stroke-width="3"/>` + tx(cx - 155, yf + 4, "DOF", "end");
    // printed line profile
    const px = 420, pw = 220, py = 60; s += tx(px + pw / 2, py - 8, "printed line and its edge", "middle") + R(px, py, pw, 150, "var(--sunk)", "var(--b)");
    const wline = 60 * blur, edge = 8 * blur; s += R(px + pw / 2 - wline / 2, py + 40, wline, 70, M.res) + R(px + pw / 2 - wline / 2 - edge, py + 40, edge, 70, M.res, "none", 'opacity="0.4"') + R(px + pw / 2 + wline / 2, py + 40, edge, 70, M.res, "none", 'opacity="0.4"');
    s += tx(px + pw / 2, py + 135, `edge blur ${(edge * 1.5).toFixed(0)} nm, width grows ${((blur - 1) * 100).toFixed(0)} percent`, "middle");
    fig.innerHTML = svg(240, s);
  };
  $("na").oninput = u; $("z").oninput = u; u();
}},

{s: "2. Edge roughness", t: "Line edge roughness: sigma and the correlation length",
intu: String.raw`Zoom into any resist edge and it wanders. Two numbers describe the wander: the RMS amplitude sigma and the correlation length, the distance along the line over which the wander forgets itself. Slide both. Short correlation lengths look like fine grain, long ones like slow waves. Both edges of a line move independently, so the line width also fluctuates, with root two times the single edge sigma. The etch copies this edge into the silicon sidewall.`,
eq: String.raw`\[ \langle f(z) f(z + u)\rangle = \sigma^2 e^{-|u| / L_c} \]<div class="eqnote">exponential autocorrelation of the edge deviation f(z), the form Payne and Lacey assume</div>`,
sym: [[String.raw`\(f(z)\)`, "deviation of the edge from a straight line at position z"], [String.raw`\(\sigma\)`, "RMS roughness, 1 to 3 nm for good DUV resist, below 1 nm after smoothing"], [String.raw`\(L_c\)`, "correlation length, 20 to 100 nm typical"]],
how: ["Model the edge as a random process with zero mean.", "The autocorrelation says how similar two points a distance u apart are. Exponential decay is the usual fit to measured edges.", "The spectrum of such an edge is a Lorentzian in spatial frequency, and only the part near the waveguide's own wavenumber scatters light.", "Measured by SEM top down, with the SEM noise subtracted."],
say: String.raw`Line edge roughness is described by an RMS sigma and a correlation length, and the sidewall inherits both.`,
num: "193 nm resist: LER 3 sigma about 3 to 5 nm. EBL HSQ: about 2 nm. Correlation length 20 to 50 nm. A 500 nm waveguide with 2 nm sigma sidewalls on a 220 nm SOI platform loses about 2 dB/cm from scattering alone.",
r(fig, ctl) {
  ctl.innerHTML = sl("sg", "RMS roughness σ (nm)", 0.5, 6, 0.1, 2) + sl("lc", "Correlation length (nm)", 5, 200, 5, 40);
  const u = () => {
    const sg = +$("sg").value, lc = +$("lc").value; $("sgv").textContent = sg.toFixed(1) + " nm"; $("lcv").textContent = lc + " nm";
    const n = 300, dz = 2; const e1 = roughEdge(sg, lc, n, dz), e2 = roughEdge(sg, lc, n, dz).map((v, i) => NOISE[(i * 7 + 13) % 600] * 0 + v);
    const x0 = 40, w = 600, yc = 120, wline = 50, mag = 6;
    let s = tx(340, 22, `line width σ = ${(sg * Math.SQRT2).toFixed(1)} nm, 600 nm of edge shown, roughness magnified 6 times`, "middle", "th");
    let top = "", bot = ""; for (let i = 0; i < n; i++) { const X = x0 + i / (n - 1) * w; top += (i ? "L" : "M") + X.toFixed(1) + " " + (yc - wline / 2 - e1[i] * mag).toFixed(1); bot += (i ? "L" : "M") + X.toFixed(1) + " " + (yc + wline / 2 + e2[(i + 150) % n] * mag).toFixed(1); }
    s += `<path d="${top} ${bot.split("M").join("L").split(" ").reverse().join(" ")}" fill="none"/>`; // placeholder
    s += `<path d="${top}" fill="none" stroke="${PB}" stroke-width="2"/><path d="${bot}" fill="none" stroke="${PB}" stroke-width="2"/>` + R(x0, yc - wline / 2, w, wline, M.si, "none", 'opacity="0.35"') + tx(x0 + w / 2, yc + 4, "resist line, top view", "middle");
    // autocorrelation plot
    const px = 60, pw = 560, py = 190, ph = 70; s += PIC.yaxis(px, py, ph, 0, 1, 2, "R(u)/σ²", v => v.toFixed(0)) + PIC.xaxis(px, py + ph, pw, 0, 400, 4, "separation u (nm)", v => v.toFixed(0));
    let d = ""; for (let i = 0; i <= 80; i++) { const uu = i / 80 * 400; const r = Math.exp(-uu / lc); d += (i ? "L" : "M") + (px + i / 80 * pw).toFixed(1) + " " + (py + ph - r * ph).toFixed(1); }
    s += `<path d="${d}" fill="none" stroke="${PT}" stroke-width="2"/>`;
    fig.innerHTML = svg(py + ph + 40, s.replace(/<path d="M[^"]*" fill="none"\/>/, ""));
  };
  $("sg").oninput = u; $("lc").oninput = u; u();
}},

{s: "3. Etch front", t: "Anisotropy: how the etch front shapes the sidewall",
intu: String.raw`In a plasma etch, ions arrive vertically and radicals arrive from every direction. Ions etch down, radicals etch sideways under the mask. The ratio sets the anisotropy. Press Play to watch the etch front advance under a resist line, and slide the ion to radical ratio. Pure chemical etching undercuts the mask and makes a round profile. A strongly ion driven etch makes vertical walls, and a passivating polymer on the sidewall, as in the Bosch process, makes them even straighter.`,
eq: String.raw`\[ A = 1 - \frac{r_{\mathrm{lateral}}}{r_{\mathrm{vertical}}}, \qquad \tan\theta_{\mathrm{sw}} \approx \frac{r_{\mathrm{lateral}}}{r_{\mathrm{vertical}}} \]<div class="eqnote">A = 1 is perfectly anisotropic, A = 0 is isotropic</div>`,
sym: [[String.raw`\(r_{\mathrm{vertical}}\)`, "etch rate downward, driven by ions"], [String.raw`\(r_{\mathrm{lateral}}\)`, "etch rate sideways under the mask, driven by radicals"], [String.raw`\(A\)`, "anisotropy"], [String.raw`\(\theta_{\mathrm{sw}}\)`, "sidewall angle from vertical"]],
how: ["Each point of the exposed surface advances at the local etch rate.", "The vertical rate is ion plus chemical. The lateral rate is chemical only, since ions do not hit the sidewall.", "The sidewall ends up tilted by the ratio of the two rates, and undercut by the lateral rate times the etch time.", "Sidewall passivation lowers the lateral rate to nearly zero, which is how silicon gets 89 to 90 degree walls."],
say: String.raw`Anisotropy is one minus the lateral over the vertical etch rate, and the sidewall angle follows that ratio.`,
num: "Silicon photonics etch: HBr or Cl2 based, sidewall angle 85 to 90 degrees, rate about 100 nm/min. SiN: CHF3 or CF4, 80 to 88 degrees. Isotropic XeF2 undercut: equal in all directions.",
r(fig, ctl) {
  ctl.innerHTML = sl("ir", "Ion to radical ratio", 0, 10, 0.1, 3);
  const draw = t => {
    const ir = +$("ir").value; $("irv").textContent = ir.toFixed(1);
    const rv = 1 + ir, rl = 1; const A = 1 - rl / rv, th = Math.atan(rl / rv) * 180 / Math.PI;
    const T = (t * 0.4) % 1.2; const depth = Math.min(1, T) * 100, under = Math.min(1, T) * 100 * rl / rv;
    const x0 = 40, ytop = 90; let s = tx(340, 22, `anisotropy A = ${A.toFixed(2)}, sidewall ${th.toFixed(0)}° from vertical, undercut ${(under * 2.2).toFixed(0)} nm per 220 nm depth`, "middle", "th");
    s += R(x0, ytop, 600, 130, M.si) + tx(x0 + 8, ytop + 122, "silicon, 1 px = 2.2 nm");
    // mask
    s += R(x0 + 200, ytop - 22, 200, 22, M.mask) + tx(x0 + 300, ytop - 28, "resist mask", "middle");
    // etched regions: left and right of mask. Profile: trench floor at depth, with sidewalls starting at mask edge and curving under by 'under'
    const trench = (xa, xb, dir) => { let d = `M${xa} ${ytop} L${xb} ${ytop} `; const corner = dir > 0 ? xa : xb; const inner = dir > 0 ? xb : xa; const steps = 20; let path = `M${inner} ${ytop} `; for (let i = 0; i <= steps; i++) { const f = i / steps; const yy = ytop + depth * f; const xx = inner + dir * (under * Math.sqrt(Math.max(0, 1 - f * f))); path += `L${xx.toFixed(1)} ${yy.toFixed(1)} `; } path += `L${corner} ${ytop + depth} L${corner} ${ytop} Z`; return `<path d="${path}" fill="${M.ox}"/>`; };
    s += trench(x0 + 400, x0 + 600, 1) + trench(x0, x0 + 200, -1);
    for (let i = 0; i < 10; i++) { const yy = ytop - 60 + ((t * 80 + i * 13) % 60); if (i % 2) s += `<line x1="${x0 + 30 + i * 60}" y1="${yy}" x2="${x0 + 30 + i * 60}" y2="${yy + 8}" stroke="${PC}" stroke-width="2"/>`; else s += `<circle cx="${x0 + 30 + i * 60 + 10 * Math.sin(t * 3 + i)}" cy="${yy}" r="3" fill="${PT}"/>`; }
    s += tx(x0, ytop + 150, "red: ions arrive straight down. Green: radicals arrive from every direction and etch under the mask.");
    fig.innerHTML = svg(ytop + 160, s);
  };
  PIC.player(ctl, draw);
}},

{s: "4. Loading and selectivity", t: "Loading and selectivity: why etch depth is not uniform",
intu: String.raw`Where a lot of silicon is exposed the reactive species are consumed faster, so the etch rate drops. That is loading, and it makes wide open fields etch slower than narrow trenches on the same wafer, and the center of a wafer differently from the edge. Selectivity is the etch rate of the film divided by the rate of the mask. A 220 nm etch with selectivity 3 eats 73 nm of resist, so the resist must be thicker than that. Slide the open area and the selectivity.`,
eq: String.raw`\[ r(\phi) = \frac{r_0}{1 + \beta\,\phi}, \qquad S = \frac{r_{\mathrm{film}}}{r_{\mathrm{mask}}}, \qquad t_{\mathrm{mask}} \ge \frac{d_{\mathrm{etch}}}{S} \]`,
sym: [[String.raw`\(\phi\)`, "fraction of the wafer area that is open to the etch"], [String.raw`\(\beta\)`, "loading coefficient of the process"], [String.raw`\(S\)`, "selectivity, film rate over mask rate"], [String.raw`\(t_{\mathrm{mask}}\)`, "minimum mask thickness"]],
how: ["The etchant supply is fixed. More open area shares it among more silicon, so the rate per area falls.", "The simple Mogab model gives the rate as r0 over one plus beta phi.", "Selectivity decides how much mask is lost. Hard masks of oxide give selectivity above 10, resist 2 to 5.", "Designers add dummy fill to make the open area uniform across the chip, which is why photonic layouts are full of tiles."],
say: String.raw`Loading lowers the etch rate where more area is open, and selectivity sets how thick the mask must be.`,
num: "Si etch rate 100 nm/min at 10 percent open area, 70 nm/min at 50 percent with beta about 0.8. Resist selectivity 3: 220 nm etch needs at least 73 nm of resist, use 300 nm. Oxide hard mask selectivity 15: needs 15 nm, use 50.",
r(fig, ctl) {
  ctl.innerHTML = sl("phi", "Open area fraction", 0.02, 0.9, 0.01, 0.2) + sl("S", "Selectivity to the mask", 1, 20, 0.5, 3);
  const u = () => {
    const phi = +$("phi").value, S = +$("S").value; $("phiv").textContent = phi.toFixed(2); $("Sv").textContent = S.toFixed(1);
    const r = 100 / (1 + 0.8 * phi); const tmask = 220 / S;
    const x0 = 60, w = 260, y0 = 50, h = 140; let s = tx(340, 22, `etch rate ${r.toFixed(0)} nm/min, mask loss ${tmask.toFixed(0)} nm for a 220 nm etch`, "middle", "th");
    s += PIC.yaxis(x0, y0, h, 0, 100, 4, "rate (nm/min)", v => v.toFixed(0)) + PIC.xaxis(x0, y0 + h, w, 0, 1, 4, "open area", v => v.toFixed(2));
    let d = ""; for (let i = 0; i <= 40; i++) { const p = i / 40; d += (i ? "L" : "M") + (x0 + p * w).toFixed(1) + " " + (y0 + h - 100 / (1 + 0.8 * p) / 100 * h).toFixed(1); } s += `<path d="${d}" fill="none" stroke="${PB}" stroke-width="2"/><circle cx="${x0 + phi * w}" cy="${y0 + h - r / 100 * h}" r="5" fill="${PC}"/>`;
    // mask erosion drawing
    const px = 400, py = 60; s += tx(px + 120, py - 8, "mask after the etch", "middle") + R(px, py + 100, 240, 60, M.si) + R(px + 80, py + 100 - Math.max(4, 60 - tmask * 0.6), 80, Math.max(4, 60 - tmask * 0.6), M.mask) + R(px + 80, py + 40, 80, 60, M.mask, "none", 'opacity="0.2"') + tx(px + 120, py + 30, `resist 100 nm, ${tmask > 100 ? "gone before the etch ends" : (100 - tmask).toFixed(0) + " nm left"}`, "middle");
    s += R(px, py + 100, 80, 60, M.ox) + R(px + 160, py + 100, 80, 60, M.ox);
    fig.innerHTML = svg(py + 175, s);
  };
  $("phi").oninput = u; $("S").oninput = u; u();
}},

{s: "5. Sidewall angle", t: "What a tilted sidewall does to the mode",
intu: String.raw`A sidewall at 85 degrees makes the waveguide a trapezoid: wider at the bottom than the top. The mode feels roughly the width at mid height, so the effective index shifts, and the two polarizations shift differently because the TE field is mostly horizontal and the TM field mostly vertical. Slide the angle and the etch depth. For a ring this moves the resonance, for a directional coupler it moves the coupling length, so designers simulate the real trapezoid, which Tidy3D does with the sidewall angle argument of PolySlab.`,
eq: String.raw`\[ w_{\mathrm{mid}} = w_{\mathrm{top}} + d\,\tan\theta_{\mathrm{sw}}, \qquad \Delta n_{\mathrm{eff}} \approx \frac{\partial n_{\mathrm{eff}}}{\partial w}\,(w_{\mathrm{mid}} - w_{\mathrm{top}}) \]`,
sym: [[String.raw`\(w_{\mathrm{top}}, w_{\mathrm{mid}}\)`, "width at the top of the ridge and at half depth"], [String.raw`\(d\)`, "etch depth"], [String.raw`\(\partial n_{\mathrm{eff}}/\partial w\)`, "width sensitivity, about 1e-3 per nm for TE in a 220 by 500 nm strip at 1550 nm, about half that for TM"]],
how: ["A sidewall tilted by theta from vertical widens the base by d tan theta on each side.", "To first order the mode sees the average width, so use the mid height width.", "Multiply the width change by the width sensitivity, a number you get from a mode solver by sweeping the width.", "TE is more sensitive to width, TM more to thickness, so the birefringence changes too."],
say: String.raw`A sidewall tilt widens the guide by the depth times the tangent of the angle, and the effective index follows through the width sensitivity.`,
num: "220 nm etch at 85 degrees: base is 38 nm wider than the top, mid width 19 nm wider, TE effective index shift about 0.019. In a 10 µm radius ring that shifts the resonance by about 7 nm. Foundries hold the angle within 1 to 2 degrees.",
r(fig, ctl) {
  ctl.innerHTML = sl("th", "Sidewall angle from vertical (°)", 0, 15, 0.5, 5) + sl("d", "Etch depth (nm)", 70, 220, 10, 220);
  const u = () => {
    const th = +$("th").value, d = +$("d").value; $("thv").textContent = th.toFixed(1) + "°"; $("dv").textContent = d + " nm";
    const dw = d * Math.tan(th * Math.PI / 180); const dnTE = 1e-3 * dw / 2, dnTM = 0.5e-3 * dw / 2; const dlam = 1550 * dnTE / 4.2;
    const cx = 200, yb = 190, sc = 0.5; const wt = 500 * sc, hh = d * sc;
    let s = tx(340, 22, `base ${dw.toFixed(0)} nm wider than the top, Δn TE ${dnTE.toFixed(3)}, TM ${dnTM.toFixed(3)}, ring shift about ${dlam.toFixed(1)} nm`, "middle", "th");
    s += R(40, yb, 400, 40, M.ox) + R(40, yb - (220 - d) * sc, 400, (220 - d) * sc, M.si);
    s += `<polygon points="${cx - wt / 2},${yb - 220 * sc} ${cx + wt / 2},${yb - 220 * sc} ${cx + wt / 2 + dw * sc},${yb - (220 - d) * sc} ${cx - wt / 2 - dw * sc},${yb - (220 - d) * sc}" fill="${M.si}" stroke="#5d7694"/>`;
    s += `<ellipse cx="${cx}" cy="${yb - 110 * sc}" rx="${(wt + dw * sc) / 2 * 0.8}" ry="${50}" fill="${PC}" opacity="0.25"/>` + tx(cx, yb + 28, "cross-section, 1 px = 2 nm", "middle");
    s += `<line x1="${cx - wt / 2 - dw * sc / 2 - 30}" y1="${yb - 110 * sc}" x2="${cx + wt / 2 + dw * sc / 2 + 30}" y2="${yb - 110 * sc}" stroke="${PT}" stroke-dasharray="4 3"/>` + tx(cx + wt / 2 + dw * sc / 2 + 36, yb - 110 * sc + 4, "mid width");
    const px = 470, py = 60; s += tx(px, py, "effective index shift", null, "th"); const bar = (y, v, c, l) => R(px, y, Math.min(170, v * 4000), 14, c) + tx(px, y - 4, l); s += bar(py + 30, dnTE, PB, `TE +${dnTE.toFixed(3)}`) + bar(py + 70, dnTM, PP, `TM +${dnTM.toFixed(3)}`);
    fig.innerHTML = svg(yb + 45, s);
  };
  $("th").oninput = u; $("d").oninput = u; u();
}},

{s: "6. Roughness loss", t: "Sidewall roughness becomes propagation loss",
intu: String.raw`The roughness copied into the sidewall is a tiny random grating along the guide, and it scatters light into the cladding. Payne and Lacey showed the loss grows as sigma squared, is strongest when the correlation length is near the wavelength inside the material divided by two pi, and grows steeply with index contrast. Slide sigma and the correlation length. Halving sigma cuts the loss four times, which is why foundries smooth sidewalls with oxidation and why nitride guides with lower contrast lose less.`,
eq: String.raw`\[ \alpha \le \frac{\sigma^2}{\sqrt{2}\,k_0\,d^4\,n_1}\,g(V)\,f_e(x,\gamma), \qquad V = k_0 d\sqrt{n_1^2 - n_2^2} \]<div class="eqref">Payne and Lacey 1994, upper bound. The card plots the scaling with sigma and correlation length</div>`,
sym: [[String.raw`\(\sigma\)`, "RMS sidewall roughness"], [String.raw`\(d\)`, "half width of the guide"], [String.raw`\(n_1, n_2\)`, "core and cladding index"], [String.raw`\(g(V)\)`, "mode function, depends only on the normalized frequency V"], [String.raw`\(f_e\)`, "correlation function, peaks when the correlation length matches the mode wavenumber"]],
how: ["Treat the sidewall deviation as a perturbation of the index.", "Each spatial frequency of the roughness couples the guided mode to radiation modes whose wavenumber differs by that frequency.", "Only correlation lengths near one over the mode wavenumber scatter efficiently, which is the peak of the correlation function.", "The prefactor carries sigma squared and the inverse fourth power of the half width, so narrow guides suffer most. The index contrast enters through V and the field at the wall."],
say: String.raw`Sidewall scattering loss scales with sigma squared, peaks at a correlation length near the mode wavelength over two pi, and is worse for narrow high contrast guides.`,
num: "220 by 500 nm silicon strip at 1550 nm: 2 to 3 dB/cm for sigma 2 nm. Oxidation smoothing to 1 nm: below 1 dB/cm. Wide rib: 0.3 dB/cm. SiN 200 nm by 1 µm: 0.1 dB/cm or less, and 0.038 dB/cm reported in a 2026 interposer (arXiv 2604.12566).",
r(fig, ctl) {
  ctl.innerHTML = sl("sg", "RMS roughness σ (nm)", 0.3, 5, 0.1, 2) + sl("lc", "Correlation length (nm)", 10, 300, 5, 50) + btns([[0, "Si strip, Δn 2.0"], [1, "SiN strip, Δn 0.56"]], "m");
  let m = 0;
  const u = () => {
    pick(ctl, "m", m); const sg = +$("sg").value, lc = +$("lc").value; $("sgv").textContent = sg.toFixed(1) + " nm"; $("lcv").textContent = lc + " nm";
    const neff = m ? 1.7 : 2.4; const Lpk = 1550 / (2 * Math.PI * neff); const F = L => (L / Lpk) / (1 + Math.pow(L / Lpk, 2)) * 2; const aref = m ? 0.08 : 2.5; // dB/cm at sigma 2, L = Lpk
    const loss = aref * Math.pow(sg / 2, 2) * F(lc);
    const x0 = 60, w = 260, y0 = 50, h = 150; let s = tx(340, 22, `scattering loss about ${loss.toFixed(2)} dB/cm (scaling model), peak correlation length ${Lpk.toFixed(0)} nm`, "middle", "th");
    s += PIC.yaxis(x0, y0, h, 0, m ? 0.2 : 6, 4, "loss (dB/cm)", v => v.toFixed(1)) + PIC.xaxis(x0, y0 + h, w, 0, 5, 5, "σ (nm)", v => v.toFixed(0));
    const ymax = m ? 0.2 : 6; let d = ""; for (let i = 0; i <= 40; i++) { const ss = i / 40 * 5; const a = Math.min(ymax, aref * Math.pow(ss / 2, 2) * F(lc)); d += (i ? "L" : "M") + (x0 + ss / 5 * w).toFixed(1) + " " + (y0 + h - a / ymax * h).toFixed(1); } s += `<path d="${d}" fill="none" stroke="${PB}" stroke-width="2"/><circle cx="${x0 + sg / 5 * w}" cy="${y0 + h - Math.min(ymax, loss) / ymax * h}" r="5" fill="${PC}"/>`;
    const px = 400, pw = 240; s += PIC.yaxis(px, y0, h, 0, 1, 2, "f relative", v => v.toFixed(0)) + PIC.xaxis(px, y0 + h, pw, 0, 300, 3, "correlation length (nm)", v => v.toFixed(0));
    let d2 = ""; for (let i = 0; i <= 60; i++) { const L = 1 + i / 60 * 299; d2 += (i ? "L" : "M") + (px + i / 60 * pw).toFixed(1) + " " + (y0 + h - F(L) * h).toFixed(1); } s += `<path d="${d2}" fill="none" stroke="${PT}" stroke-width="2"/><circle cx="${px + (lc - 1) / 299 * pw}" cy="${y0 + h - F(lc) * h}" r="5" fill="${PC}"/>`;
    fig.innerHTML = svg(y0 + h + 40, s);
  };
  ctl.querySelectorAll("button[data-m]").forEach(b => b.onclick = () => { m = +b.dataset.m; u(); }); $("sg").oninput = u; $("lc").oninput = u; u();
}},

{s: "7. E-beam vs DUV", t: "Electron beam lithography: proximity effect and write time",
intu: String.raw`Research chips, including the ones in this notebook, are written with an electron beam instead of a mask. The beam is a few nanometres wide but electrons scatter in the resist and bounce back from the substrate, so a dense pattern receives extra dose from its neighbours. That is the proximity effect, and proximity effect correction lowers the dose in dense regions. Press Play to watch the beam write a grating, and slide the backscatter fraction to see the dose spill. The price of e-beam is time: a whole wafer takes days, a DUV scanner takes seconds per field.`,
eq: String.raw`\[ \mathrm{PSF}(r) = \frac{1}{\pi(1+\eta)}\left[\frac{1}{\alpha^2}e^{-r^2/\alpha^2} + \frac{\eta}{\beta^2}e^{-r^2/\beta^2}\right], \qquad T_{\mathrm{write}} = \frac{A\,D}{I} \]`,
sym: [[String.raw`\(\alpha\)`, "forward scattering range, a few nm to tens of nm"], [String.raw`\(\beta\)`, "backscatter range, 2 to 30 µm depending on energy and substrate"], [String.raw`\(\eta\)`, "backscatter ratio, about 0.5 to 0.8 on silicon at 100 kV"], [String.raw`\(A, D, I\)`, "exposed area, dose and beam current"]],
how: ["Each exposed point deposits energy over a forward Gaussian and a much wider backscatter Gaussian.", "The dose a feature receives is its own exposure plus the backscatter from everything within beta.", "Dense regions get more backscatter, so their edges move outward unless the assigned dose is reduced. That is proximity effect correction.", "Write time is area times dose over current. A 1 cm² chip at 1000 µC/cm² and 10 nA takes 1e-2 times 1e-3 over 1e-8, about 1000 s per cm² at best, often hours with overhead."],
say: String.raw`The proximity effect is backscattered dose from neighbouring features, corrected by lowering the dose in dense regions, and e-beam pays for its resolution with write time.`,
num: "Elionix 100 kV: beam 2 nm, alpha about 10 nm, beta about 30 µm, eta about 0.7 on silicon. HSQ dose 1000 to 2000 µC/cm². A 5 by 5 mm photonic chip: 1 to 4 hours. DUV scanner: 100 wafers per hour.",
r(fig, ctl) {
  ctl.innerHTML = sl("eta", "Backscatter ratio η", 0, 1.2, 0.05, 0.7) + btns([[0, "No correction"], [1, "Proximity correction"]], "pec");
  let pec = 0;
  const draw = t => {
    pick(ctl, "pec", pec); const eta = +$("eta").value; $("etav").textContent = eta.toFixed(2);
    const x0 = 40, w = 600, y0 = 60; let s = "";
    // pattern: dense grating left (8 lines), isolated line right
    const lines = []; for (let i = 0; i < 8; i++) lines.push([80 + i * 30, 12]); lines.push([480, 12]);
    const dose = X => { let d = 0; for (const [lx, lw] of lines) { const a = pec && lx < 400 ? 1 / (1 + eta * 0.9) : 1; if (X >= lx && X < lx + lw) d += a; d += a * eta * lw / 300 * Math.exp(-Math.pow((X - lx - lw / 2) / 150, 2)); } return d; };
    const beam = Math.floor((t * 60) % 300);
    let d = ""; for (let i = 0; i <= 300; i++) { const X = x0 + i / 300 * w; const v = dose(40 + i * 2); d += (i ? "L" : "M") + X.toFixed(1) + " " + (y0 + 120 - Math.min(1.6, v) * 70).toFixed(1); }
    s += tx(340, 22, `${pec ? "with" : "without"} correction: dense lines get ${(dose(80 + 3 * 30 + 6) / dose(486)).toFixed(2)} times the dose of the isolated line`, "middle", "th");
    s += R(x0, y0 + 10, w, 110, "var(--sunk)", "var(--b)") + `<line x1="${x0}" y1="${y0 + 120 - 0.5 * 70}" x2="${x0 + w}" y2="${y0 + 120 - 0.5 * 70}" stroke="${PC}" stroke-dasharray="4 3"/>` + tx(x0 + w, y0 + 120 - 0.5 * 70 - 5, "resist threshold", "end");
    s += `<path d="${d}" fill="none" stroke="${PB}" stroke-width="2"/>`;
    for (const [lx, lw] of lines) s += R(x0 + (lx - 40), y0 + 130, lw, 14, lx + lw / 2 <= 40 + beam * 2 ? PP : "var(--panel)", PP);
    s += `<line x1="${x0 + beam * 2}" y1="${y0 + 125}" x2="${x0 + beam * 2}" y2="${y0 + 150}" stroke="${PC}" stroke-width="2"/>` + tx(x0, y0 + 165, "written pattern: dense grating, then an isolated line. The beam position scans in Play.");
    s += tx(x0, y0 + 185, "dose profile: forward dose on each line plus the wide backscatter from its neighbours");
    fig.innerHTML = svg(y0 + 195, s);
  };
  ctl.querySelectorAll("button[data-pec]").forEach(b => b.onclick = () => { pec = +b.dataset.pec; });
  PIC.player(ctl, draw);
}}
],
summary: String.raw`Resolution improves with NA but depth of focus shrinks faster, so wafers are polished flat. The resist edge wanders with an RMS sigma and a correlation length, and the etch copies that wander into the sidewall. Ions etch down and radicals etch sideways, and their ratio sets the sidewall angle. Loading slows the etch where more area is open, and selectivity sets the mask thickness. A tilted sidewall widens the guide and shifts the effective index, and roughness scatters light with a loss that grows as sigma squared, so a nanometre of roughness is worth decibels per centimetre.`,
sheet: [
[String.raw`\[ R = k_1\lambda/\mathrm{NA}, \quad \mathrm{DOF} = k_2\lambda/\mathrm{NA}^2 \]`, "Resolution and depth of focus"],
[String.raw`\[ \langle f(z)f(z+u)\rangle = \sigma^2 e^{-|u|/L_c} \]`, "Edge roughness autocorrelation"],
[String.raw`\[ A = 1 - r_{\mathrm{lateral}}/r_{\mathrm{vertical}} \]`, "Etch anisotropy"],
[String.raw`\[ r = r_0/(1 + \beta\phi), \quad t_{\mathrm{mask}} \ge d_{\mathrm{etch}}/S \]`, "Loading and selectivity"],
[String.raw`\[ \Delta n_{\mathrm{eff}} \approx (\partial n_{\mathrm{eff}}/\partial w)\, d\tan\theta_{\mathrm{sw}} \]`, "Sidewall angle shifts the index"],
[String.raw`\[ \alpha \le \frac{\sigma^2}{\sqrt 2 k_0 d^4 n_1} g(V) f_e \]`, "Payne and Lacey scattering bound"],
[String.raw`\[ \mathrm{PSF} \propto \frac{1}{\alpha^2}e^{-r^2/\alpha^2} + \frac{\eta}{\beta^2}e^{-r^2/\beta^2} \]`, "E-beam proximity effect"]],
consts: String.raw`Width sensitivity 1e-3 per nm (TE) is a typical mode solver result for a 220 by 500 nm strip at 1550 nm. Loss numbers in card 6 are a scaling model normalized to 2.5 dB/cm at sigma 2 nm, not the full Payne and Lacey integral.`,
sources: ["F. P. Payne and J. P. R. Lacey, A theoretical analysis of scattering loss from planar optical waveguides, Opt. Quantum Electron. 26, 977 (1994), doi 10.1007/BF00708339", "T. H. P. Chang, Proximity effect in electron-beam lithography, J. Vac. Sci. Technol. 12, 1271 (1975)", "C. Mack, Fundamental Principles of Optical Lithography, Wiley (2007), Ch. 2 (imaging) and Ch. 9 (line edge roughness)", "C. J. Mogab, The loading effect in plasma etching, J. Electrochem. Soc. 124, 1262 (1977)", "Research dossier Part 2 Sec. 2.1 and 2.3 (loss values, 2026 interposer arXiv 2604.12566)"]
});
})();

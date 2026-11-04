addLesson("thesis", "ch3", {
level: "Core",
id: "thesis-ch3-l4", title: "Bounded parameterizations: widths, layers, tapers and outlines", short: "4. Parameterizations",
big: String.raw`The thesis uses five kinds of design parameters: grating widths, DBR layer thicknesses, taper outlines, pixel densities and boundary vertices. Most of the geometric quantities must stay within limits. A grating tooth must be between 80 nm and 1 µm wide, a taper cannot be narrower than its input waveguide, and an outline should stay near the shape it started from. Such a quantity is not optimized directly. It is written as a smooth function of a free variable \(p_i\), one entry of the parameter vector \(\mathbf{p}\), which can take any real value, and the function maps every value of \(p_i\) into the allowed range. The tanh function does this, because it maps the whole real line onto the interval from −1 to 1. The optimizer can then take any step and the geometry still stays within its limits. The price is that a quantity near its bound responds less to a change of \(p_i\). The pixel densities are treated differently, with a filter and a projection (Lessons 5 and 6).`,
bridge: String.raw`This is Ch. 3 Sec. 3.3 without the density topology: the grating widths of Eq. (3.6), the DBR scale \(1 + \tfrac{1}{2}\tanh p_i\), the taper half-widths of Eq. (3.7) and the boundary vertices of Eq. (3.11). The DBR reflectance below uses the transfer matrix method of Chapter 2, Lesson 5. Michaels and Yablonovitch optimized a taper outline in the same spirit, with polygon vertices as parameters.`,
cards: [
/* from old ch3 L5 card 1, now with a tooth that follows the map and a Play sweep */
{s: "1. The tanh map", t: "From an unbounded p to a bounded width",
intu: String.raw`\(\tanh p\) runs from −1 to +1 as \(p\) runs over all real numbers. Scaling by half the range and adding the midpoint maps \(p\) onto the interval from \(w_{\mathrm{min}}\) to \(w_{\mathrm{max}}\). At \(p = 0\) the width sits in the middle of the interval. Whatever value the optimizer gives \(p\), the width can never leave the interval. The bar under the plot is one grating tooth drawn to scale. Set the bounds and move \(p\), or press Play and watch \(p\) swing far beyond ±3 while the tooth stays inside its limits.`,
eq: String.raw`\[ w(p_i) = \tfrac12\,(w_{\mathrm{max}} - w_{\mathrm{min}})\tanh p_i + \tfrac12\,(w_{\mathrm{max}} + w_{\mathrm{min}}) \]<div class="eqref">Ch. 3 Eq. (3.6)</div>`,
sym: [[String.raw`\(p_i\)`, "free variable seen by the optimizer, one entry of p, any real number"], [String.raw`\(w_{\mathrm{min}}\)`, "smallest allowed width, the minimum feature of the gratings, 80 nm"], [String.raw`\(w_{\mathrm{max}}\)`, "largest allowed width, 1 µm"], [String.raw`\(w(p_i)\)`, "physical width of one tooth or gap"]],
how: [String.raw`\(\tanh: \mathbb{R} \to (-1, 1)\), smooth and monotonic.`, "Multiply by half the range and add the midpoint.", String.raw`\(p_i \to \pm\infty\) approach the bounds, \(p_i = 0\) gives the middle of the range.`, String.raw`The chain rule gives \(\partial J/\partial p_i = (\partial J/\partial w)(dw/dp_i)\), which autograd applies automatically.`],
say: "Each width is a tanh function of a free variable, so the optimizer can take any step and the width still stays between its bounds.",
num: String.raw`With the grating bounds of Sec. 3.3, \(w_{\mathrm{min}} = 80\) nm and \(w_{\mathrm{max}} = 1\) µm: \(p = 0\) gives 540 nm, \(p = 2\) gives 983 nm, and no value of \(p\) gives less than 80 nm.`,
r(fig, ctl) {
  let playing = false;
  ctl.innerHTML = sl("a", "w_min (nm)", 40, 300, 10, 80) + sl("b", "w_max (nm)", 400, 1200, 10, 1000) + sl("q", "p", -4, 4, 0.05, 0.6) + `<div class="row"><button id="pl">Play</button></div><div class="readout" id="ro"></div>`;
  const qs = range(-4, 4, 200);
  const u = qv => {
    const a = +$("a").value, b = +$("b").value, q = qv === undefined ? +$("q").value : qv; $("av").textContent = a; $("bv").textContent = b; $("qv").textContent = q.toFixed(2);
    const w = v => 0.5 * (b - a) * Math.tanh(v) + 0.5 * (b + a), X = C3.X(70, 560, -4, 4), Y = C3.Y(30, 170, 0, 1250);
    let s = C3.frame(70, 30, 560, 170, -4, 4, 0, 1250, [-4, -2, 0, 2, 4], [0, 400, 800, 1200], "free variable p", "width w (nm)");
    s += `<line x1="70" x2="630" y1="${Y(a)}" y2="${Y(a)}" stroke="#D85A30" stroke-dasharray="5 4"/><line x1="70" x2="630" y1="${Y(b)}" y2="${Y(b)}" stroke="#D85A30" stroke-dasharray="5 4"/><text class="ts" x="625" y="${Y(a) - 5}" text-anchor="end">w_min</text><text class="ts" x="625" y="${Y(b) - 5}" text-anchor="end">w_max</text>`;
    s += plot(70, 30, 560, 170, qs, qs.map(w), -4, 4, 0, 1250, "#378ADD", 2.5) + `<circle cx="${X(C3.clamp(q, -4, 4))}" cy="${Y(w(q))}" r="6" fill="#D85A30"/>`;
    const sc = 0.4, xb = 120;
    s += `<rect x="${xb}" y="250" width="${1200 * sc}" height="18" fill="none" stroke="var(--b)" stroke-dasharray="3 3"/><rect x="${xb}" y="250" width="${a * sc}" height="18" fill="#D85A30" opacity="0.18"/><rect x="${xb + b * sc}" y="250" width="${(1200 - b) * sc}" height="18" fill="#D85A30" opacity="0.18"/>`;
    s += `<rect x="${xb}" y="250" width="${(w(q) * sc).toFixed(1)}" height="18" fill="var(--blue-bg)" stroke="var(--blue)" stroke-width="1.5"/><text class="ts" x="${xb - 8}" y="263" text-anchor="end">tooth</text><text class="ts" x="${xb + 600 * sc}" y="286" text-anchor="middle">one tooth drawn to scale, 0 to 1200 nm, shaded widths are not allowed</text>`;
    fig.innerHTML = svg(294, s);
    const d = 0.5 * (b - a) / Math.cosh(q) ** 2;
    $("ro").innerHTML = `<div><span>p</span><b>${q.toFixed(2)}</b></div><div><span>w(p)</span><b>${w(q).toFixed(1)} nm</b></div><div><span>dw/dp</span><b>${d.toFixed(1)} nm</b></div>`;
  };
  ["a", "b", "q"].forEach(k => $(k).oninput = () => { playing = false; stopAnim(); $("pl").textContent = "Play"; u(); });
  $("pl").onclick = () => {
    playing = !playing; $("pl").textContent = playing ? "Pause" : "Play";
    if (!playing) { stopAnim(); u(); return; }
    anim(t => { if (!fig.isConnected) { stopAnim(); return; } const q = 6 * Math.sin(0.7 * t); $("q").value = C3.clamp(q, -4, 4); u(q); });
  };
  u();
}},

/* from old ch3 L5 card 2 */
{s: "2. Saturation", t: "Near a bound the width responds less",
intu: String.raw`The slope \(dw/dp = \tfrac{1}{2}(w_{\mathrm{max}} - w_{\mathrm{min}}) \operatorname{sech}^2 p\) is largest at \(p = 0\) and falls off quickly. A width pressed against a bound has a large \(|p|\) and a tiny slope, so both its gradient \(\partial J/\partial p\) and its response to a step become small. This is the gentle way the bound is enforced. It also means a parameter that wandered deep into saturation needs many steps to come back. Move \(p\) and compare the effect of the same step \(\Delta p = 0.1\).`,
eq: String.raw`\[ \frac{dw}{dp} = \frac{1}{2}(w_{\mathrm{max}} - w_{\mathrm{min}}) \operatorname{sech}^2 p, \qquad \frac{\partial J}{\partial p} = \frac{\partial J}{\partial w} \frac{dw}{dp} \]`,
sym: [[String.raw`\(\operatorname{sech}^2 p = 1/\cosh^2 p\)`, String.raw`1 at \(p = 0\), about 0.07 at \(p = 2\), about 0.0013 at \(p = 4\)`], [String.raw`\(\Delta p\)`, String.raw`a step taken by the optimizer in \(p\)`], [String.raw`\(\Delta w \approx (dw/dp)\, \Delta p\)`, "the resulting change of width"]],
how: [String.raw`Differentiate tanh: \(d\tanh p/dp = \operatorname{sech}^2 p\).`, "Multiply by the half range.", String.raw`Chain rule: the gradient reaching \(p\) is scaled by the same factor.`, "Adam partly compensates, because it normalizes each parameter's step by its own gradient history (Lesson 13)."],
say: "Close to a bound the tanh map flattens, so the width responds less to the optimizer, which keeps it inside the limits without a hard clip.",
num: String.raw`With the grating bounds 80 nm and 1 µm, a step \(\Delta p = 0.1\) moves the width by 46 nm at \(p = 0\) but by only 3 nm at \(p = 2\).`,
r(fig, ctl) {
  ctl.innerHTML = sl("q", "p", -4, 4, 0.05, 2) + '<div class="readout" id="ro"></div>';
  const a = 80, b = 1000, qs = range(-4, 4, 200), d = v => 0.5 * (b - a) / Math.cosh(v) ** 2, w = v => 0.5 * (b - a) * Math.tanh(v) + 0.5 * (b + a);
  const u = () => {
    const q = +$("q").value; $("qv").textContent = q.toFixed(2);
    const X = C3.X(70, 560, -4, 4), Y = C3.Y(30, 180, 0, 500);
    let s = C3.frame(70, 30, 560, 180, -4, 4, 0, 500, [-4, -2, 0, 2, 4], [0, 230, 460], "free variable p", "dw/dp (nm)") + plot(70, 30, 560, 180, qs, qs.map(d), -4, 4, 0, 500, "#7F77DD", 2.5);
    s += `<circle cx="${X(q)}" cy="${Y(d(q))}" r="6" fill="#D85A30"/><rect x="${X(q)}" y="${Y(d(q))}" width="${X(q + 0.1) - X(q)}" height="${210 - Y(d(q))}" fill="#D85A30" opacity="0.3"/>`;
    fig.innerHTML = svg(250, s);
    $("ro").innerHTML = `<div><span>w(p)</span><b>${w(q).toFixed(1)} nm</b></div><div><span>Δw for Δp = 0.1</span><b>${(w(q + 0.1) - w(q)).toFixed(2)} nm</b></div><div><span>sech²p</span><b>${(1 / Math.cosh(q) ** 2).toFixed(4)}</b></div>`;
  };
  $("q").oninput = u; u();
}},

/* from old ch3 L5 card 3, now with a Play button that takes random optimizer-like steps */
{s: "3. A grating", t: "A grating described by its tooth and gap widths",
intu: String.raw`The grating couplers are etched through the membrane, so a grating is a row of GaAs teeth separated by air gaps. A uniform grating is fixed by its period and fill factor. Here, instead, every tooth and every gap has its own width, so a grating with \(N\) teeth is described by \(2N\) widths, each built with Eq. (3.6), and its local period and fill factor can change along the grating. Press Uniform start to see the starting point, then Play: every \(p_j\) takes large random steps, like a careless optimizer. However wild the steps, no tooth or gap ever falls below \(w_{\mathrm{min}} = 80\) nm.`,
eq: String.raw`\[ w_j = w(p_j) = \tfrac12\,(w_{\mathrm{max}} - w_{\mathrm{min}})\tanh p_j + \tfrac12\,(w_{\mathrm{max}} + w_{\mathrm{min}}), \qquad j = 1, \dots, 2N \]<div class="eqref">Ch. 3 Eq. (3.6), teeth and gaps alternating</div>`,
sym: [[String.raw`\(N\)`, "number of teeth, 9 for the designs carried to 3D"], [String.raw`\(p_j\)`, String.raw`free variable of width \(j\)`], [String.raw`\(2N\)`, "number of parameters, 18 for N = 9"]],
how: ["Each gap and each tooth gets its own free variable.", "All widths share the same bounds, 80 nm and 1 µm.", "The grating is built tooth by tooth from the widths, so the local period and fill factor can vary along the grating.", String.raw`The bounds guarantee the minimum feature for any \(\mathbf{p}\), so no constraint is needed in the optimizer.`],
say: String.raw`A grating with \(N\) teeth is described by \(2N\) widths, each bounded by a tanh map, so every tooth and gap respects the minimum feature size of 80 nm.`,
num: String.raw`The designs carried to three-dimensional simulation have \(N = 9\) teeth, which gives 18 parameters. A uniform start has all tooth widths equal and all gap widths equal.`,
r(fig, ctl) {
  ctl.innerHTML = sl("n", "Teeth N", 4, 14, 1, 9) + `<div class="row"><button id="un">Uniform start</button><button id="pl">Play random steps</button></div><div class="readout" id="ro"></div>`;
  const a = 80, b = 1000, w = v => 0.5 * (b - a) * Math.tanh(v) + 0.5 * (b + a), r = C3.rng(3);
  let P = [], playing = false;
  const uni = () => { const N = +$("n").value; P = Array.from({ length: 2 * N }, (_, j) => (j % 2 ? -0.35 : -0.75)); };
  const u = () => {
    const N = +$("n").value; $("nv").textContent = N; if (P.length !== 2 * N) uni();
    const ws = P.map(w), L = ws.reduce((x, y) => x + y, 0), sc = 600 / Math.max(L, 6000);
    let x = 40, s = `<rect x="20" y="110" width="20" height="30" fill="var(--blue-bg)" stroke="var(--blue)"/>`;
    ws.forEach((v, i) => { if (i % 2 === 1) s += `<rect x="${x.toFixed(1)}" y="110" width="${(v * sc).toFixed(1)}" height="30" fill="var(--blue-bg)" stroke="var(--blue)"/>`; x += v * sc; });
    s += `<text class="ts" x="20" y="98">side view drawn to scale: GaAs teeth, air gaps between them (total ${(L / 1000).toFixed(2)} µm)</text>`;
    const X = C3.X(40, 600, 0, 2 * N - 1), Y = C3.Y(165, 70, 0, 1050);
    s += `<line x1="40" x2="640" y1="${Y(a)}" y2="${Y(a)}" stroke="#D85A30" stroke-dasharray="5 4"/><text class="ts" x="645" y="${Y(a) + 4}">80</text><line x1="40" x2="640" y1="${Y(b)}" y2="${Y(b)}" stroke="#D85A30" stroke-dasharray="5 4"/><text class="ts" x="645" y="${Y(b) + 4}">1000</text>`;
    ws.forEach((v, i) => s += `<circle cx="${X(i)}" cy="${Y(v)}" r="4" fill="${i % 2 ? "#378ADD" : "var(--p)"}"/>`);
    fig.innerHTML = svg(262, s + `<text class="ts" x="340" y="256" text-anchor="middle">each dot is one width in nm (gaps grey, teeth blue), dashed: the bounds</text>`);
    $("ro").innerHTML = `<div><span>parameters 2N</span><b>${2 * N}</b></div><div><span>smallest width</span><b>${Math.min(...ws).toFixed(1)} nm</b></div><div><span>largest |p|</span><b>${Math.max(...P.map(Math.abs)).toFixed(2)}</b></div>`;
  };
  const stop = () => { playing = false; stopAnim(); $("pl").textContent = "Play random steps"; };
  $("un").onclick = () => { stop(); uni(); u(); };
  $("n").oninput = () => { stop(); uni(); u(); };
  $("pl").onclick = () => {
    if (playing) { stop(); return; }
    playing = true; $("pl").textContent = "Pause"; let last = -1;
    anim(t => { if (!fig.isConnected) { stopAnim(); return; } const k = Math.floor(t * 6); if (k === last) return; last = k; P = P.map(v => C3.clamp(v + 0.9 * (r() - 0.5) - 0.04 * v, -6, 6)); u(); });
  };
  uni(); u();
}},

/* from old ch3 L5 card 4 */
{s: "4. DBR layers", t: "Scaling the mirror layers between 0.5 and 1.5",
intu: String.raw`For the grating coupler whose air gap can be chosen, the layers of the DBR below the grating are designed as well. The light the DBR returns to the grating interferes with the light radiated upward, and the phase and strength of the returned light depend on the layer thicknesses. Each layer starts at its quarter-wave thickness and is multiplied by the scale factor \(1 + \tfrac{1}{2}\tanh p_i\), which keeps it between 0.5 and 1.5 times the quarter-wave value. At \(p_i = 0\) the stack is the quarter-wave mirror of Chapter 2. In this demo all high-index layers share one \(p\) and all low-index layers another, so you can see what the scales do: thicker layers shift the stopband to longer wavelengths, unequal scales narrow it. The reflectance is computed live with the transfer matrix method.`,
eq: String.raw`\[ d_i = d_i^{\mathrm{QW}} \left( 1 + \tfrac{1}{2} \tanh p_i \right), \qquad d^{\mathrm{QW}} = \frac{\lambda_0}{4n}, \qquad 0.5 \lt \frac{d_i}{d_i^{\mathrm{QW}}} \lt 1.5 \]<div class="eqref">Ch. 3 Sec. 3.3, DBR layer thicknesses</div>`,
sym: [[String.raw`\(d_i\)`, String.raw`thickness of layer \(i\)`], [String.raw`\(d^{\mathrm{QW}}\)`, String.raw`quarter-wave thickness at \(\lambda_0\)`], [String.raw`\(p_i\)`, String.raw`free variable of layer \(i\)`], [String.raw`\(n_H, n_L\)`, "3.5 and 3.0 in this example"]],
how: [String.raw`Start from the quarter-wave stack, the strongest mirror at \(\lambda_0\) for a fixed number of pairs, where all \(p_i = 0\).`, "Allow each layer to change by at most ±50 %.", "The scale is a tanh map with center 1 and half range ½.", "With one scale per layer the optimizer can tune the phase of the reflection, not just its strength, which sets how the returned light interferes with the light radiated upward."],
say: "Each DBR layer thickness is its quarter-wave value times a tanh-bounded scale between 0.5 and 1.5, and the optimization starts from the quarter-wave stack.",
num: String.raw`The thesis DBR has 14 pairs of layers, so 28 parameters. Example values here: 14 pairs, \(n_H = 3.5\), \(n_L = 3.0\), \(\lambda_0 = 800\) nm, so \(d^{\mathrm{QW}} = 57.1\) and 66.7 nm.`,
r(fig, ctl) {
  ctl.innerHTML = sl("h", "p of high-index layers", -2.5, 2.5, 0.05, 0) + sl("l", "p of low-index layers", -2.5, 2.5, 0.05, 0) + '<div class="readout" id="ro"></div>';
  const nH = 3.5, nL = 3.0, l0 = 800, ls = range(600, 1050, 226), R0 = ls.map(l => C2.tmmR(1.0, C2.dbrLayers(nH, nL, 14, l0), 3.5, l));
  const u = () => {
    const qh = +$("h").value, ql = +$("l").value; $("hv").textContent = qh.toFixed(2); $("lv").textContent = ql.toFixed(2);
    const sh = 1 + 0.5 * Math.tanh(qh), sL = 1 + 0.5 * Math.tanh(ql), lay = []; for (let i = 0; i < 14; i++) { lay.push([nH, l0 / (4 * nH) * sh]); lay.push([nL, l0 / (4 * nL) * sL]); }
    const R = ls.map(l => C2.tmmR(1.0, lay, 3.5, l));
    let im = 0; R.forEach((v, i) => { if (v > R[im]) im = i; });
    let s = C3.frame(70, 30, 560, 180, 600, 1050, 0, 1, [600, 700, 800, 900, 1000], [0, 0.5, 1], "wavelength (nm)", "reflectance R") + plot(70, 30, 560, 180, ls, R0, 600, 1050, 0, 1, "var(--p)", 1.5, "4 3") + plot(70, 30, 560, 180, ls, R, 600, 1050, 0, 1, "#378ADD", 2.5);
    s += C3.legend(80, 250, [["quarter-wave start (p = 0)", "var(--p)", "4 3"], ["scaled stack", "#378ADD"]]);
    fig.innerHTML = svg(260, s);
    $("ro").innerHTML = `<div><span>scale H / L</span><b>${sh.toFixed(3)} / ${sL.toFixed(3)}</b></div><div><span>peak R at</span><b>${ls[im].toFixed(0)} nm</b></div><div><span>R at 800 nm</span><b>${C2.tmmR(1.0, lay, 3.5, 800).toFixed(3)}</b></div>`;
  };
  $("h").oninput = u; $("l").oninput = u; u();
}},

/* from old ch3 L5 card 5 */
{s: "5. A taper", t: "Taper half-widths bounded between the two waveguides",
intu: String.raw`A taper connects the 200 nm routing waveguide to the wide grating, and its shape is set by its outline. The taper is divided along its length into \(M\) equally spaced positions \(x_i\), and the half-width \(y_i\) at each position is a design variable built with Eq. (3.7). The factor \((\tanh(\pi p_i) + 1)/2\) lies between 0 and 1, so each half-width stays between those of the two waveguides. The map bounds the width but does not prescribe a profile: the outline can bulge or even wiggle, and the optimizer decides. Neighboring points are joined by straight lines and the outline is mirrored about the taper axis. Choose a starting profile and add a ripple in \(p\): the outline always stays between the dashed limits.`,
eq: String.raw`\[ y_i = \frac{w_{\mathrm{in}}}{2} + \frac{w_{\mathrm{out}} - w_{\mathrm{in}}}{2} \cdot \frac{\tanh(\pi p_i) + 1}{2} \]<div class="eqref">Ch. 3 Eq. (3.7)</div>`,
sym: [[String.raw`\(y_i\)`, String.raw`half-width at position \(x_i\)`], [String.raw`\(w_{\mathrm{in}}, w_{\mathrm{out}}\)`, "widths of the narrow input and the wide output, 200 nm and 1.9 µm"], [String.raw`\(p_i\)`, String.raw`free variable of point \(i\)`], [String.raw`\((\tanh(\pi p_i) + 1)/2\)`, String.raw`runs from 0 to 1, so \(y_i\) runs from \(w_{\mathrm{in}}/2\) to \(w_{\mathrm{out}}/2\)`], [String.raw`\(M\)`, "number of points, 81"]],
how: [String.raw`Fix \(M\) equally spaced positions \(x_i\) along the taper.`, "Let only the half-width at each position change.", String.raw`Map each \(p_i\) through \((\tanh(\pi p_i) + 1)/2\) onto \([0, 1]\), then onto the allowed half-width range. The factor \(\pi\) makes the blend steep, so \(p_i\) of about ±1 already reaches either end.`, "Join neighboring points by straight lines, mirror the outline about the axis and etch it through the membrane."],
say: "The taper outline is a set of half-widths at fixed positions, each bounded between the two waveguide half-widths by a tanh map, with no profile imposed.",
num: String.raw`Both tapers, for TE and for TM, are 4 µm long, run from \(w_{\mathrm{in}} = 200\) nm to \(w_{\mathrm{out}} = 1.9\) µm and use \(M = 81\) points. A linear start needs \((\tanh(\pi p_i) + 1)/2 = t_i\), the fractional position, so \(p_i = \operatorname{atanh}(2t_i - 1)/\pi\).`,
r(fig, ctl) {
  let prof = "lin"; ctl.innerHTML = btns([["lin", "Linear start"], ["cvx", "Bulging"], ["cnc", "Hollow"]], "p") + sl("r", "Ripple in p", 0, 1.5, 0.05, 0) + '<div class="readout" id="ro"></div>';
  const M = 81, wi = 0.2, wo = 1.9;
  const u = () => {
    pick(ctl, "p", prof); const rp = +$("r").value; $("rv").textContent = rp.toFixed(2);
    const t = range(0, 1, M), base = t.map(v => prof === "lin" ? v : prof === "cvx" ? Math.sqrt(v) : v * v);
    const q = base.map((v, i) => Math.atanh(C3.clamp(2 * v - 1, -0.999, 0.999)) / Math.PI + rp * Math.sin(i * 0.65));
    const y = q.map(v => wi / 2 + (wo - wi) / 2 * (Math.tanh(Math.PI * v) + 1) / 2);
    const X = C3.X(60, 560, 0, 1), Y = v => 130 - v * 105;
    let top = "", bot = ""; t.forEach((v, i) => { top += (i ? "L" : "M") + X(v).toFixed(1) + " " + Y(y[i]).toFixed(1); bot += (i ? "L" : "M") + X(v).toFixed(1) + " " + (260 - Y(y[i])).toFixed(1); });
    let s = `<rect x="10" y="${Y(wi / 2)}" width="50" height="${2 * (130 - Y(wi / 2))}" fill="var(--blue-bg)" stroke="var(--blue)"/><rect x="620" y="${Y(wo / 2)}" width="50" height="${2 * (130 - Y(wo / 2))}" fill="var(--blue-bg)" stroke="var(--blue)"/>`;
    const poly = t.map((v, i) => `${X(v).toFixed(1)} ${Y(y[i]).toFixed(1)}`).concat(t.map((v, i) => `${X(v).toFixed(1)} ${(260 - Y(y[i])).toFixed(1)}`).reverse());
    s += `<path d="M${poly.join("L")}Z" fill="var(--blue-bg)" stroke="none"/>`;
    s += `<path d="${top}" fill="none" stroke="var(--blue)" stroke-width="2"/><path d="${bot}" fill="none" stroke="var(--blue)" stroke-width="2"/>`;
    for (const yy of [wi / 2, wo / 2]) s += `<line x1="60" x2="620" y1="${Y(yy)}" y2="${Y(yy)}" stroke="#D85A30" stroke-dasharray="5 4"/><line x1="60" x2="620" y1="${260 - Y(yy)}" y2="${260 - Y(yy)}" stroke="#D85A30" stroke-dasharray="5 4"/>`;
    t.forEach((v, i) => s += `<circle cx="${X(v)}" cy="${Y(y[i])}" r="2" fill="#D85A30"/>`);
    s += `<line x1="60" x2="620" y1="130" y2="130" stroke="var(--b)" stroke-dasharray="2 4"/><text class="ts" x="340" y="280" text-anchor="middle">4 µm long, 200 nm to 1.9 µm wide, 81 points (orange), mirrored about the axis</text>`;
    fig.innerHTML = svg(288, s);
    $("ro").innerHTML = `<div><span>points M</span><b>${M}</b></div><div><span>narrowest half-width</span><b>${(Math.min(...y) * 1000).toFixed(0)} nm</b></div><div><span>widest half-width</span><b>${(Math.max(...y) * 1000).toFixed(0)} nm</b></div>`;
  };
  ctl.querySelectorAll("button").forEach(b => b.onclick = () => { prof = b.dataset.p; u(); }); $("r").oninput = u; u();
}},

/* from old ch3 L5 card 6, now animated */
{s: "6. An outline", t: "Polygon vertices that move along their normals",
intu: String.raw`After the topology stage the binary PBS design is converted to one polygon, and its outline is optimized under the design rules. Each free vertex \(\mathbf{r}_i\) moves along its outward normal \(\hat{\mathbf{n}}_i\) by \(\Delta_{\mathrm{max}} \tanh p_i\), so it never leaves a band of half-width \(\Delta_{\mathrm{max}}\) around the starting outline (shaded), and \(p_i = 0\) reproduces the start exactly. Because the boundary moves continuously instead of in pixel steps, the staircase edges of the pixel design disappear and the corner radii can be controlled (Lesson 10). Press Play: every \(p_i\) swings far beyond ±1, yet every vertex stays in the band.`,
eq: String.raw`\[ \mathbf{r}_i = \mathbf{r}_i^{(0)} + \Delta_{\mathrm{max}}\tanh(p_i)\,\hat{\mathbf{n}}_i \]<div class="eqref">Ch. 3 Eq. (3.11)</div>`,
sym: [[String.raw`\(\mathbf{r}_i^{(0)}\)`, String.raw`starting position of vertex \(i\), on the starting outline`], [String.raw`\(\hat{\mathbf{n}}_i\)`, String.raw`outward unit normal at vertex \(i\)`], [String.raw`\(p_i\)`, String.raw`free variable of vertex \(i\)`], [String.raw`\(\Delta_{\mathrm{max}}\)`, "largest allowed move, 15 nm in the thesis"]],
how: ["Compute the outward normal at each vertex of the starting outline.", "Let the vertex move only along that normal, so vertices do not slide along the outline and bunch up.", String.raw`Bound the move with \(\Delta_{\mathrm{max}} \tanh p_i\), so \(p_i = 0\) is the start.`, String.raw`The boundary form of the adjoint gradient (Lesson 3) gives \(\partial J/\partial \mathbf{r}_i\), and the chain rule gives \(\partial J/\partial p_i = (\partial J/\partial \mathbf{r}_i) \cdot \hat{\mathbf{n}}_i\, \Delta_{\mathrm{max}} \operatorname{sech}^2 p_i\).`],
say: String.raw`In the shape stage each free vertex moves along its outward normal by a tanh-bounded amount, so the outline stays within \(\Delta_{\mathrm{max}}\) of where it started.`,
num: String.raw`The PBS outline has 395 free vertices, and each may move by at most \(\Delta_{\mathrm{max}} = 15\) nm. The outline in the picture is a generic shape about 1 µm across with 48 vertices.`,
r(fig, ctl) {
  let playing = false;
  ctl.innerHTML = sl("d", "Δ_max (nm)", 0, 60, 1, 15) + sl("a", "Spread of p", 0, 3, 0.05, 1.5) + `<div class="row"><button id="rn">New random p</button><button id="pl">Play</button></div><div class="readout" id="ro"></div>`;
  let seed = 8; const n = 48, sc = 0.45;
  const base = Array.from({ length: n }, (_, i) => { const a = 2 * Math.PI * i / n, r = 220 + 50 * Math.sin(2 * a) + 25 * Math.cos(3 * a); return [r * Math.cos(a) * 1.3, r * Math.sin(a) * 0.9]; });
  const nor = base.map((p, i) => { const a = base[(i + n - 1) % n], b = base[(i + 1) % n], tx = b[0] - a[0], ty = b[1] - a[1], l = Math.hypot(tx, ty); return [ty / l, -tx / l]; });
  const u = (t) => {
    const D = +$("d").value, sp = +$("a").value; $("dv").textContent = D; $("av").textContent = sp.toFixed(2);
    const r = C3.rng(seed), ph = base.map(() => 2 * Math.PI * r()), th = base.map((_, i) => t === undefined ? sp * Math.sin(ph[i]) : 3 * sp * Math.sin(ph[i] + (0.8 + 0.4 * Math.sin(i)) * t));
    const pts = base.map((p, i) => [p[0] + D * Math.tanh(th[i]) * nor[i][0], p[1] + D * Math.tanh(th[i]) * nor[i][1]]);
    const P = p => `${(340 + p[0] * sc).toFixed(1)} ${(135 + p[1] * sc).toFixed(1)}`;
    const outer = base.map((p, i) => [p[0] + D * nor[i][0], p[1] + D * nor[i][1]]), inner = base.map((p, i) => [p[0] - D * nor[i][0], p[1] - D * nor[i][1]]);
    let s = `<path d="M${outer.map(P).join("L")}Z M${inner.map(P).join("L")}Z" fill="#EF9F27" fill-opacity="0.25" fill-rule="evenodd"/>`;
    s += `<path d="M${base.map(P).join("L")}Z" fill="none" stroke="var(--p)" stroke-dasharray="4 3"/><path d="M${pts.map(P).join("L")}Z" fill="var(--blue-bg)" fill-opacity="0.7" stroke="var(--blue)" stroke-width="2"/>`;
    base.forEach((p, i) => { if (i % 4 === 0) s += `<line x1="${340 + p[0] * sc}" y1="${135 + p[1] * sc}" x2="${340 + (p[0] + 50 * nor[i][0]) * sc}" y2="${135 + (p[1] + 50 * nor[i][1]) * sc}" stroke="#7F77DD" stroke-width="1.2" marker-end="url(#ar)"/>`; });
    pts.forEach(p => s += `<circle cx="${340 + p[0] * sc}" cy="${135 + p[1] * sc}" r="2.5" fill="#D85A30"/>`);
    fig.innerHTML = svg(270, s + `<text class="ts" x="20" y="262">dashed: start, shaded: ±Δ_max band, purple: normals, orange: vertices</text>`);
    let mm = 0; pts.forEach((p, i) => mm = Math.max(mm, Math.hypot(p[0] - base[i][0], p[1] - base[i][1])));
    $("ro").innerHTML = `<div><span>vertices here</span><b>${n}</b></div><div><span>largest |p|</span><b>${Math.max(...th.map(Math.abs)).toFixed(2)}</b></div><div><span>largest move / allowed</span><b>${mm.toFixed(1)} / ${D} nm</b></div>`;
  };
  const stop = () => { playing = false; stopAnim(); $("pl").textContent = "Play"; };
  $("d").oninput = () => { if (!playing) u(); }; $("a").oninput = () => { if (!playing) u(); }; $("rn").onclick = () => { seed++; if (!playing) u(); };
  $("pl").onclick = () => { if (playing) { stop(); u(); return; } playing = true; $("pl").textContent = "Pause"; anim(t => { if (!fig.isConnected) { stopAnim(); return; } u(t); }); };
  u();
}}

],
summary: String.raw`Every bounded geometric quantity is written as a tanh function of a free variable \(p_i\), so the optimizer moves freely while the geometry stays inside its limits. Grating widths lie between \(w_{\mathrm{min}} = 80\) nm and \(w_{\mathrm{max}} = 1\) µm (Eq. 3.6), 18 parameters for 9 teeth. DBR layers lie between 0.5 and 1.5 times their quarter-wave thickness through the scale \(1 + \tfrac{1}{2}\tanh p_i\), 28 parameters for 14 pairs. Taper half-widths lie between those of the two waveguides (Eq. 3.7), 81 points over 4 µm from 200 nm to 1.9 µm. Outline vertices stay within \(\Delta_{\mathrm{max}} = 15\) nm of their start along the normal (Eq. 3.11), 395 free vertices for the PBS. Near a bound the tanh flattens, so the quantity responds less, which enforces the bound gently. The chain rule through the tanh is applied automatically.`,
sheet: [
[String.raw`\[ w(p_i) = \tfrac12\,(w_{\mathrm{max}} - w_{\mathrm{min}})\tanh p_i + \tfrac12\,(w_{\mathrm{max}} + w_{\mathrm{min}}) \]`, "Grating widths, 80 nm to 1 µm, 2N = 18 parameters (Ch. 3 Eq. 3.6)"],
[String.raw`\[ \frac{dw}{dp} = \frac{1}{2}(w_{\mathrm{max}} - w_{\mathrm{min}}) \operatorname{sech}^2 p \]`, "Saturation near the bounds"],
[String.raw`\[ d_i = d_i^{\mathrm{QW}} \left( 1 + \tfrac{1}{2} \tanh p_i \right) \]`, "DBR layer scale, 0.5 to 1.5, 14 pairs give 28 parameters (Sec. 3.3)"],
[String.raw`\[ y_i = \frac{w_{\mathrm{in}}}{2} + \frac{w_{\mathrm{out}} - w_{\mathrm{in}}}{2} \cdot \frac{\tanh(\pi p_i) + 1}{2} \]`, "Taper half-widths, M = 81 (Ch. 3 Eq. 3.7)"],
[String.raw`\[ \mathbf{r}_i = \mathbf{r}_i^{(0)} + \Delta_{\mathrm{max}}\tanh(p_i)\,\hat{\mathbf{n}}_i \]`, "Boundary vertices, 395 free, 15 nm (Ch. 3 Eq. 3.11)"]],
consts: "Thesis settings of Sec. 3.3: widths 80 nm to 1 µm, N = 9, DBR 14 pairs, tapers M = 81 over 4 µm from 200 nm to 1.9 µm, 395 vertices with 15 nm moves. DBR example indices 3.5 and 3.0 at 800 nm.",
sources: ["Michaels and Yablonovitch, Opt. Express 26, 31717 (2018) (polygon vertices as design parameters, shape optimization after topology optimization)", "Flexcompute, Tidy3D 2.11.2 (autograd through the geometry and the chain rule)"]
});

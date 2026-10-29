addLesson("thesis", "ch3", {
level: "Core",
id: "thesis-ch3-l5", title: "Bounded parameterizations: widths, layers, tapers and outlines", short: "5. Bounded parameters",
big: "An optimizer like Adam takes steps of any size in any direction, but a geometry has limits: a tooth cannot be thinner than the smallest feature that can be written, a taper cannot be narrower than its input waveguide, and an outline should stay near the shape it started from. The thesis handles all of this the same way. Each bounded quantity is written as a smooth function of an unbounded variable q, using tanh, which maps the whole real line into a finite interval. The optimizer moves q freely, and the geometry stays inside its limits automatically. The price is that a quantity near its bound responds less to a change of q.",
bridge: "This is Ch. 3 Sec. 3.3: the grating widths of Eq. (3.7), the DBR scale 1 + ½tanh q, the taper half-widths of Eq. (3.8) and the vertex moves of Eq. (3.12). The DBR reflectance below uses the transfer matrix method of Chapter 2, Lesson 6. Michaels and Yablonovitch optimized a taper outline in the same spirit, with polygon vertices as parameters.",
cards: [
{s: "1. The tanh map", t: "From an unbounded q to a bounded width",
intu: "tanh q runs from −1 to +1 as q runs over all real numbers. Scaling and shifting it maps q onto the interval from w<sub>min</sub> to w<sub>max</sub>. At q = 0 the width sits in the middle of the interval. Whatever value the optimizer gives q, the width can never leave the interval. Set the bounds and move q.",
eq: String.raw`\[ w(q) = \frac{1}{2}(w_{\mathrm{max}} - w_{\mathrm{min}}) \tanh q + \frac{1}{2}(w_{\mathrm{max}} + w_{\mathrm{min}}) \]<div class="eqref">Ch. 3 Eq. (3.7)</div>`,
sym: [[String.raw`\(q\)`, "free variable seen by the optimizer, any real number"], [String.raw`\(w_{\mathrm{min}}\)`, "smallest allowed width, the minimum feature of the device"], [String.raw`\(w_{\mathrm{max}}\)`, "largest allowed width"], [String.raw`\(w(q)\)`, "physical width used to build the geometry"]],
how: ["tanh: ℝ → (−1, 1), smooth and monotonic.", "Multiply by half the range and add the center.", "q = ±∞ give the bounds, q = 0 gives the center.", "The chain rule gives ∂J/∂q = (∂J/∂w)(dw/dq), which autograd applies automatically."],
say: "Each width is a tanh function of a free variable, so the optimizer can take any step and the width still stays between its bounds.",
num: "For example, with w<sub>min</sub> = 100 nm and w<sub>max</sub> = 800 nm, q = 0 gives 450 nm and q = 2 gives 787 nm.",
r(fig, ctl) {
  ctl.innerHTML = sl("a", "w_min (nm)", 40, 300, 10, 100) + sl("b", "w_max (nm)", 400, 1200, 10, 800) + sl("q", "q", -4, 4, 0.05, 0.6) + '<div class="readout" id="ro"></div>';
  const qs = range(-4, 4, 200);
  const u = () => {
    const a = +$("a").value, b = +$("b").value, q = +$("q").value; $("av").textContent = a; $("bv").textContent = b; $("qv").textContent = q.toFixed(2);
    const w = v => 0.5 * (b - a) * Math.tanh(v) + 0.5 * (b + a), X = C3.X(70, 560, -4, 4), Y = C3.Y(30, 180, 0, 1250);
    let s = C3.frame(70, 30, 560, 180, -4, 4, 0, 1250, [-4, -2, 0, 2, 4], [0, 400, 800, 1200], "free variable q", "width w (nm)");
    s += `<line x1="70" x2="630" y1="${Y(a)}" y2="${Y(a)}" stroke="#D85A30" stroke-dasharray="5 4"/><line x1="70" x2="630" y1="${Y(b)}" y2="${Y(b)}" stroke="#D85A30" stroke-dasharray="5 4"/><text class="ts" x="625" y="${Y(a) - 5}" text-anchor="end">w_min</text><text class="ts" x="625" y="${Y(b) - 5}" text-anchor="end">w_max</text>`;
    s += plot(70, 30, 560, 180, qs, qs.map(w), -4, 4, 0, 1250, "#378ADD", 2.5) + `<circle cx="${X(q)}" cy="${Y(w(q))}" r="6" fill="#D85A30"/>`;
    fig.innerHTML = svg(250, s);
    const d = 0.5 * (b - a) / Math.cosh(q) ** 2;
    $("ro").innerHTML = `<div><span>w(q)</span><b>${w(q).toFixed(1)} nm</b></div><div><span>dw/dq</span><b>${d.toFixed(1)} nm</b></div>`;
  };
  ["a", "b", "q"].forEach(k => $(k).oninput = u); u();
}},

{s: "2. Saturation", t: "Near a bound the width responds less",
intu: "The slope dw/dq = ½(w<sub>max</sub> − w<sub>min</sub>) sech²q is largest at q = 0 and falls off quickly. A width pressed against a bound has a large |q| and a tiny slope, so both its gradient ∂J/∂q and its response to a step become small. This is the gentle way the bound is enforced. It also means a parameter that wandered deep into saturation needs many steps to come back. Move q and compare the effect of the same step Δq = 0.1.",
eq: String.raw`\[ \frac{dw}{dq} = \frac{1}{2}(w_{\mathrm{max}} - w_{\mathrm{min}}) \operatorname{sech}^2 q, \qquad \frac{\partial J}{\partial q} = \frac{\partial J}{\partial w} \frac{dw}{dq} \]`,
sym: [[String.raw`\(\operatorname{sech}^2 q = 1/\cosh^2 q\)`, "1 at q = 0, about 0.07 at q = 2, about 0.0013 at q = 4"], [String.raw`\(\Delta q\)`, "a step taken by the optimizer in q"], [String.raw`\(\Delta w \approx (dw/dq)\, \Delta q\)`, "the resulting change of width"]],
how: ["Differentiate tanh: d tanh q/dq = sech²q.", "Multiply by the half range.", "Chain rule: the gradient reaching q is scaled by the same factor.", "Adam partly compensates, because it normalizes each parameter's step by its own gradient history (Lesson 12)."],
say: "Close to a bound the tanh map flattens, so the width responds less to the optimizer, which keeps it inside the limits without a hard clip.",
num: "With the example bounds 100 and 800 nm, a step Δq = 0.1 moves the width by 35 nm at q = 0 but by only 2.2 nm at q = 2.",
r(fig, ctl) {
  ctl.innerHTML = sl("q", "q", -4, 4, 0.05, 2) + '<div class="readout" id="ro"></div>';
  const a = 100, b = 800, qs = range(-4, 4, 200), d = v => 0.5 * (b - a) / Math.cosh(v) ** 2, w = v => 0.5 * (b - a) * Math.tanh(v) + 0.5 * (b + a);
  const u = () => {
    const q = +$("q").value; $("qv").textContent = q.toFixed(2);
    const X = C3.X(70, 560, -4, 4), Y = C3.Y(30, 180, 0, 380);
    let s = C3.frame(70, 30, 560, 180, -4, 4, 0, 380, [-4, -2, 0, 2, 4], [0, 175, 350], "free variable q", "dw/dq (nm)") + plot(70, 30, 560, 180, qs, qs.map(d), -4, 4, 0, 380, "#7F77DD", 2.5);
    s += `<circle cx="${X(q)}" cy="${Y(d(q))}" r="6" fill="#D85A30"/><rect x="${X(q)}" y="${Y(d(q))}" width="${X(q + 0.1) - X(q)}" height="${210 - Y(d(q))}" fill="#D85A30" opacity="0.3"/>`;
    fig.innerHTML = svg(250, s);
    $("ro").innerHTML = `<div><span>w(q)</span><b>${w(q).toFixed(1)} nm</b></div><div><span>Δw for Δq = 0.1</span><b>${(w(q + 0.1) - w(q)).toFixed(2)} nm</b></div><div><span>sech²q</span><b>${(1 / Math.cosh(q) ** 2).toFixed(4)}</b></div>`;
  };
  $("q").oninput = u; u();
}},

{s: "3. A grating", t: "A grating described by its tooth and gap widths",
intu: "A grating with N teeth is described by the widths of its N gaps and N teeth, 2N numbers, each built with Eq. (3.7). Here the q values are random with a chosen spread. However large the spread, no tooth or gap ever falls below w<sub>min</sub>, which is how the minimum feature of the grating is guaranteed. A uniform grating is the natural start: all q equal.",
eq: String.raw`\[ w_j = w(q_j), \qquad j = 1, \dots, 2N \qquad (\text{gaps and teeth alternating}) \]`,
sym: [[String.raw`\(N\)`, "number of teeth"], [String.raw`\(q_j\)`, "free variable of width j"], ["spread", "standard deviation of the random q values in this demo"]],
how: ["Each gap and tooth gets its own free variable.", "All widths share the same bounds.", "The grating is built tooth by tooth from the widths, so the period can vary along the grating (apodization).", "The bounds guarantee the minimum feature for any q."],
say: "The grating is described by 2N widths, each bounded by a tanh map, so every tooth and gap respects the minimum feature size.",
num: "Typical sizes: about 10 teeth, so about 20 parameters. Varying the period along the grating is how the radiated beam is shaped to match a fiber.",
r(fig, ctl) {
  ctl.innerHTML = sl("n", "Teeth N", 4, 14, 1, 9) + sl("s", "Spread of q", 0, 3, 0.05, 1) + `<div class="row"><button id="rn">New random q</button><button id="un">Uniform start (all q = −0.4)</button></div><div class="readout" id="ro"></div>`;
  let seed = 3, uni = false; const a = 100, b = 800, w = v => 0.5 * (b - a) * Math.tanh(v) + 0.5 * (b + a);
  const u = () => {
    const N = +$("n").value, sp = +$("s").value; $("nv").textContent = N; $("sv").textContent = sp.toFixed(2);
    const r = C3.rng(seed), g = () => { let x = 0; for (let k = 0; k < 6; k++) x += r(); return x - 3; };
    const qs = Array.from({ length: 2 * N }, () => uni ? -0.4 : -0.4 + sp * g() * 0.7), ws = qs.map(w), L = ws.reduce((x, y) => x + y, 0), sc = 600 / L;
    let x = 40, s = `<rect x="20" y="110" width="${640}" height="40" fill="var(--blue-bg)" stroke="var(--blue)"/>`;
    ws.forEach((v, i) => { if (i % 2 === 0) s += `<rect x="${x}" y="110" width="${v * sc}" height="22" fill="var(--panel)" stroke="var(--blue)"/>`; x += v * sc; });
    s += `<text class="ts" x="340" y="95" text-anchor="middle">etched gaps (white) and teeth, drawn to scale (total ${(L / 1000).toFixed(2)} µm)</text>`;
    const X = C3.X(40, 600, 0, 2 * N - 1), Y = C3.Y(175, 70, 0, 850);
    s += `<line x1="40" x2="640" y1="${Y(a)}" y2="${Y(a)}" stroke="#D85A30" stroke-dasharray="5 4"/><text class="ts" x="645" y="${Y(a) + 4}">w_min</text>`;
    ws.forEach((v, i) => s += `<circle cx="${X(i)}" cy="${Y(v)}" r="4" fill="${i % 2 ? "#378ADD" : "var(--p)"}"/>`);
    fig.innerHTML = svg(255, s + `<text class="ts" x="340" y="252" text-anchor="middle">each dot is one width (gaps dark, teeth blue)</text>`);
    $("ro").innerHTML = `<div><span>parameters 2N</span><b>${2 * N}</b></div><div><span>smallest width</span><b>${Math.min(...ws).toFixed(1)} nm</b></div><div><span>largest width</span><b>${Math.max(...ws).toFixed(1)} nm</b></div>`;
  };
  $("rn").onclick = () => { uni = false; seed++; u(); }; $("un").onclick = () => { uni = true; u(); }; $("n").oninput = u; $("s").oninput = () => { uni = false; u(); }; u();
}},

{s: "4. DBR layers", t: "Scaling the mirror layers between 0.5 and 1.5",
intu: "The bottom mirror can also be designed. Each layer keeps its quarter-wave thickness times a scale 1 + ½tanh q, which stays between 0.5 and 1.5. At q = 0 the stack is the ideal quarter-wave mirror of Chapter 2. Here all high-index layers share one q and all low-index layers another, so you can see what the scales do: thicker layers shift the stopband to longer wavelengths, unequal scales narrow it. The reflectance is computed live with the transfer matrix method.",
eq: String.raw`\[ d_j = d_j^{\mathrm{QW}} \left( 1 + \tfrac{1}{2} \tanh q_j \right) \]\[ d^{\mathrm{QW}} = \frac{\lambda_0}{4n}, \qquad 0.5 \lt d_j/d_j^{\mathrm{QW}} \lt 1.5 \]`,
sym: [[String.raw`\(d_j\)`, "thickness of layer j"], [String.raw`\(d^{\mathrm{QW}}\)`, "quarter-wave thickness at λ₀"], [String.raw`\(q_j\)`, "free variable of layer j"], [String.raw`\(n_H, n_L\)`, "3.5 and 3.0 in this example"]],
how: ["Start from the quarter-wave stack, the best mirror at λ₀ for a fixed number of pairs.", "Allow each layer to change by at most ±50 %.", "The scale is a tanh map with center 1 and half range ½.", "With per-layer scales the optimizer can tune the phase of the reflection, not just its strength."],
say: "Each DBR layer thickness is its quarter-wave value times a tanh-bounded scale between 0.5 and 1.5, starting from the quarter-wave stack.",
num: "Example stack: 10 pairs, n<sub>H</sub> = 3.5, n<sub>L</sub> = 3.0, λ<sub>0</sub> = 800 nm, so d<sup>QW</sup> = 57.1 and 66.7 nm. Each pair adds two parameters.",
r(fig, ctl) {
  ctl.innerHTML = sl("h", "q of high-index layers", -2.5, 2.5, 0.05, 0) + sl("l", "q of low-index layers", -2.5, 2.5, 0.05, 0) + '<div class="readout" id="ro"></div>';
  const nH = 3.5, nL = 3.0, l0 = 800, ls = range(600, 1050, 226);
  const u = () => {
    const qh = +$("h").value, ql = +$("l").value; $("hv").textContent = qh.toFixed(2); $("lv").textContent = ql.toFixed(2);
    const sh = 1 + 0.5 * Math.tanh(qh), sL = 1 + 0.5 * Math.tanh(ql), lay = []; for (let i = 0; i < 10; i++) { lay.push([nH, l0 / (4 * nH) * sh]); lay.push([nL, l0 / (4 * nL) * sL]); }
    const R = ls.map(l => C2.tmmR(1.0, lay, 3.5, l)), R0 = ls.map(l => C2.tmmR(1.0, C2.dbrLayers(nH, nL, 10, l0), 3.5, l));
    let im = 0; R.forEach((v, i) => { if (v > R[im]) im = i; });
    let s = C3.frame(70, 30, 560, 180, 600, 1050, 0, 1, [600, 700, 800, 900, 1000], [0, 0.5, 1], "wavelength (nm)", "reflectance R") + plot(70, 30, 560, 180, ls, R0, 600, 1050, 0, 1, "var(--p)", 1.5, "4 3") + plot(70, 30, 560, 180, ls, R, 600, 1050, 0, 1, "#378ADD", 2.5);
    s += C3.legend(80, 250, [["quarter-wave start (q = 0)", "var(--p)", "4 3"], ["scaled stack", "#378ADD"]]);
    fig.innerHTML = svg(260, s);
    $("ro").innerHTML = `<div><span>scale H / L</span><b>${sh.toFixed(3)} / ${sL.toFixed(3)}</b></div><div><span>peak R at</span><b>${ls[im].toFixed(0)} nm</b></div><div><span>R at 800 nm</span><b>${C2.tmmR(1.0, lay, 3.5, 800).toFixed(3)}</b></div>`;
  };
  $("h").oninput = u; $("l").oninput = u; u();
}},

{s: "5. A taper", t: "Taper half-widths bounded between the two waveguides",
intu: "A taper from a narrow waveguide to a wide section is described by its half-width y<sub>i</sub> at M fixed, equally spaced positions. Each y<sub>i</sub> is a tanh map of its own q<sub>i</sub>, bounded by the two half-widths. The map bounds the width but does not prescribe a profile: the outline can bulge or even wiggle, and the optimizer decides. Choose a starting profile and add a ripple in q to see that the outline always stays between the dashed limits. The outline is mirrored about the axis.",
eq: String.raw`\[ y_i = \frac{w_{\mathrm{in}}}{2} + \frac{w_{\mathrm{out}} - w_{\mathrm{in}}}{2} \cdot \frac{\tanh(\pi q_i) + 1}{2} \]<div class="eqref">Ch. 3 Eq. (3.8)</div>`,
sym: [[String.raw`\(y_i\)`, "half-width at position x_i"], [String.raw`\(w_{\mathrm{in}}, w_{\mathrm{out}}\)`, "widths of the narrow and the wide waveguide"], [String.raw`\(q_i\)`, "free variable of point i"], [String.raw`\([\tanh(\pi q) + 1]/2\)`, "runs from 0 to 1, so y_i runs from w_in/2 to w_out/2"]],
how: ["Fix M positions along the taper.", "Let only the half-width at each position change.", "Map each q_i through (tanh(πq_i) + 1)/2 onto [0, 1], then onto the allowed half-width range.", "Mirror the outline about the axis and etch it through the membrane."],
say: "The taper outline is a set of half-widths at fixed positions, each bounded between the two waveguide half-widths by a tanh map, with no profile imposed.",
num: "Typical: about 100 points along a few micrometers. The first and last points connect to the waveguides. A linear start uses q<sub>i</sub> = atanh(2t<sub>i</sub> − 1)/π with t<sub>i</sub> the fractional position.",
r(fig, ctl) {
  let prof = "lin"; ctl.innerHTML = btns([["lin", "Linear start"], ["cvx", "Bulging"], ["cnc", "Hollow"]], "p") + sl("r", "Ripple in q", 0, 1.5, 0.05, 0) + '<div class="readout" id="ro"></div>';
  const M = 41, wi = 0.3, wo = 2.0;
  const u = () => {
    pick(ctl, "p", prof); const rp = +$("r").value; $("rv").textContent = rp.toFixed(2);
    const t = range(0.02, 0.98, M), base = t.map(v => prof === "lin" ? v : prof === "cvx" ? Math.sqrt(v) : v * v);
    const q = base.map((v, i) => Math.atanh(C3.clamp(2 * v - 1, -0.999, 0.999)) / Math.PI + rp * Math.sin(i * 1.3));
    const y = q.map(v => wi / 2 + (wo - wi) / 2 * (Math.tanh(Math.PI * v) + 1) / 2);
    const X = C3.X(60, 560, 0, 1), Y = v => 130 - v * 100;
    let top = "", bot = ""; t.forEach((v, i) => { top += (i ? "L" : "M") + X(v).toFixed(1) + " " + Y(y[i]).toFixed(1); bot += (i ? "L" : "M") + X(v).toFixed(1) + " " + (260 - Y(y[i])).toFixed(1); });
    let s = `<rect x="10" y="${Y(wi / 2)}" width="50" height="${2 * (130 - Y(wi / 2))}" fill="var(--blue-bg)" stroke="var(--blue)"/><rect x="620" y="${Y(wo / 2)}" width="50" height="${2 * (130 - Y(wo / 2))}" fill="var(--blue-bg)" stroke="var(--blue)"/>`;
    const poly = t.map((v, i) => `${X(v).toFixed(1)} ${Y(y[i]).toFixed(1)}`).concat(t.map((v, i) => `${X(v).toFixed(1)} ${(260 - Y(y[i])).toFixed(1)}`).reverse());
    s += `<path d="M${poly.join("L")}Z" fill="var(--blue-bg)" stroke="none"/>`;
    s += `<path d="${top}" fill="none" stroke="var(--blue)" stroke-width="2"/><path d="${bot}" fill="none" stroke="var(--blue)" stroke-width="2"/>`;
    for (const yy of [wi / 2, wo / 2]) s += `<line x1="60" x2="620" y1="${Y(yy)}" y2="${Y(yy)}" stroke="#D85A30" stroke-dasharray="5 4"/><line x1="60" x2="620" y1="${260 - Y(yy)}" y2="${260 - Y(yy)}" stroke="#D85A30" stroke-dasharray="5 4"/>`;
    t.forEach((v, i) => s += `<circle cx="${X(v)}" cy="${Y(y[i])}" r="2.5" fill="#D85A30"/>`);
    s += `<line x1="60" x2="620" y1="130" y2="130" stroke="var(--b)" stroke-dasharray="2 4"/>`;
    fig.innerHTML = svg(262, s);
    $("ro").innerHTML = `<div><span>points M</span><b>${M}</b></div><div><span>narrowest half-width</span><b>${(Math.min(...y) * 1000).toFixed(0)} nm</b></div><div><span>widest half-width</span><b>${(Math.max(...y) * 1000).toFixed(0)} nm</b></div>`;
  };
  ctl.querySelectorAll("button").forEach(b => b.onclick = () => { prof = b.dataset.p; u(); }); $("r").oninput = u; u();
}},

{s: "6. An outline", t: "Polygon vertices that move along their normals",
intu: "After a topology design is traced into a polygon, its boundary can be optimized directly. Each free vertex moves along its outward normal by Δ<sub>max</sub> tanh θ<sub>i</sub>, so it never leaves a band of half-width Δ<sub>max</sub> around the starting outline (shaded), and θ = 0 reproduces the start exactly. Because the boundary moves continuously instead of in pixel steps, staircase edges disappear and corner radii can be controlled (Lesson 10). Shuffle the θ values and change Δ<sub>max</sub>.",
eq: String.raw`\[ \mathbf{r}_i = \mathbf{r}_i^{(0)} + \Delta_{\mathrm{max}} \tanh(\theta_i)\, \hat{\mathbf{n}}_i \]<div class="eqref">Ch. 3 Eq. (3.12)</div>`,
sym: [[String.raw`\(\mathbf{r}_i^{(0)}\)`, "starting position of vertex i"], [String.raw`\(\hat{\mathbf{n}}_i\)`, "outward unit normal at vertex i"], [String.raw`\(\theta_i\)`, "free variable of vertex i"], [String.raw`\(\Delta_{\mathrm{max}}\)`, "largest allowed move"]],
how: ["Compute the normal at each vertex from its two neighbors.", "Let the vertex move only along that normal.", "Bound the move with Δ_max tanh θ.", "The boundary gradient of Eq. (3.6) gives ∂J/∂r_i, and the chain rule gives ∂J/∂θ_i = (∂J/∂r_i)·n̂_i Δ_max sech²θ_i."],
say: "In the shape stage each vertex moves along its normal by a tanh-bounded amount, so the outline stays within Δ_max of where it started.",
num: "A larger Δ<sub>max</sub> gives the optimizer more freedom. A small one, a few nanometers, keeps a design that already passed a design rule check close to passing (Lesson 11).",
r(fig, ctl) {
  ctl.innerHTML = sl("d", "Δ_max (nm)", 0, 60, 1, 30) + sl("a", "Spread of θ", 0, 3, 0.05, 1.5) + `<div class="row"><button id="rn">New random θ</button></div><div class="readout" id="ro"></div>`;
  let seed = 8; const n = 48, sc = 0.45;
  const base = Array.from({ length: n }, (_, i) => { const a = 2 * Math.PI * i / n, r = 220 + 50 * Math.sin(2 * a) + 25 * Math.cos(3 * a); return [r * Math.cos(a) * 1.3, r * Math.sin(a) * 0.9]; });
  const nor = base.map((p, i) => { const a = base[(i + n - 1) % n], b = base[(i + 1) % n], tx = b[0] - a[0], ty = b[1] - a[1], l = Math.hypot(tx, ty); return [ty / l, -tx / l]; });
  const u = () => {
    const D = +$("d").value, sp = +$("a").value; $("dv").textContent = D; $("av").textContent = sp.toFixed(2);
    const r = C3.rng(seed), th = base.map(() => sp * (2 * r() - 1)), pts = base.map((p, i) => [p[0] + D * Math.tanh(th[i]) * nor[i][0], p[1] + D * Math.tanh(th[i]) * nor[i][1]]);
    const P = p => `${(340 + p[0] * sc).toFixed(1)} ${(135 + p[1] * sc).toFixed(1)}`;
    const outer = base.map((p, i) => [p[0] + D * nor[i][0], p[1] + D * nor[i][1]]), inner = base.map((p, i) => [p[0] - D * nor[i][0], p[1] - D * nor[i][1]]);
    let s = `<path d="M${outer.map(P).join("L")}Z M${inner.map(P).join("L")}Z" fill="#EF9F27" fill-opacity="0.18" fill-rule="evenodd"/>`;
    s += `<path d="M${base.map(P).join("L")}Z" fill="none" stroke="var(--p)" stroke-dasharray="4 3"/><path d="M${pts.map(P).join("L")}Z" fill="var(--blue-bg)" fill-opacity="0.7" stroke="var(--blue)" stroke-width="2"/>`;
    base.forEach((p, i) => { if (i % 4 === 0) s += `<line x1="${340 + p[0] * sc}" y1="${135 + p[1] * sc}" x2="${340 + (p[0] + 50 * nor[i][0]) * sc}" y2="${135 + (p[1] + 50 * nor[i][1]) * sc}" stroke="#7F77DD" stroke-width="1.2" marker-end="url(#ar)"/>`; });
    pts.forEach(p => s += `<circle cx="${340 + p[0] * sc}" cy="${135 + p[1] * sc}" r="2.5" fill="#D85A30"/>`);
    fig.innerHTML = svg(270, s + `<text class="ts" x="20" y="262">dashed: start, shaded: ±Δ_max band, purple: normals</text>`);
    let mm = 0; pts.forEach((p, i) => mm = Math.max(mm, Math.hypot(p[0] - base[i][0], p[1] - base[i][1])));
    $("ro").innerHTML = `<div><span>vertices</span><b>${n}</b></div><div><span>largest move</span><b>${mm.toFixed(1)} nm</b></div><div><span>allowed</span><b>${D} nm</b></div>`;
  };
  $("d").oninput = u; $("a").oninput = u; $("rn").onclick = () => { seed++; u(); }; u();
}}
],
summary: "Every bounded geometric quantity is written as a tanh function of a free variable, so the optimizer moves freely while the geometry stays inside its limits. Grating widths lie between w_min and w_max (Eq. 3.7), DBR layers between 0.5 and 1.5 times their quarter-wave thickness, taper half-widths between those of the two waveguides (Eq. 3.8), and outline vertices within Δ_max of their start along the normal (Eq. 3.12). Near a bound the tanh flattens, so the quantity responds less, which enforces the bound gently. The chain rule through the tanh is applied automatically.",
sheet: [
[String.raw`\[ w(q) = \frac{1}{2}(w_{\mathrm{max}} - w_{\mathrm{min}}) \tanh q + \frac{1}{2}(w_{\mathrm{max}} + w_{\mathrm{min}}) \]`, "Grating widths (Ch. 3 Eq. 3.7)"],
[String.raw`\[ \frac{dw}{dq} = \frac{1}{2}(w_{\mathrm{max}} - w_{\mathrm{min}}) \operatorname{sech}^2 q \]`, "Saturation near the bounds"],
[String.raw`\[ d_j = d_j^{\mathrm{QW}} \left( 1 + \tfrac{1}{2} \tanh q_j \right) \]`, "DBR layer scale, 0.5 to 1.5"],
[String.raw`\[ y_i = \frac{w_{\mathrm{in}}}{2} + \frac{w_{\mathrm{out}} - w_{\mathrm{in}}}{2} \cdot \frac{\tanh(\pi q_i) + 1}{2} \]`, "Taper half-widths (Ch. 3 Eq. 3.8)"],
[String.raw`\[ \mathbf{r}_i = \mathbf{r}_i^{(0)} + \Delta_{\mathrm{max}} \tanh(\theta_i)\, \hat{\mathbf{n}}_i \]`, "Outline vertices (Ch. 3 Eq. 3.12)"]],
consts: "Example values are generic: widths 100 to 800 nm, DBR 3.5/3.0 at 800 nm with 10 pairs, taper from 0.3 to 2.0 µm.",
sources: ["Michaels and Yablonovitch, Opt. Express 26, 31717 (2018) (polygon vertices as design parameters, shape optimization after topology optimization)", "Flexcompute, Tidy3D 2.11.2 (autograd through the geometry and the chain rule)"]
});

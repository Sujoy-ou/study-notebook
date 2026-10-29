addLesson("thesis", "ch3", {
level: "Advanced",
id: "thesis-ch3-l10", title: "The curvature penalty for outlines", short: "10. Curvature penalty",
big: String.raw`When an outline is optimized directly, nothing stops it from forming sharp corners and tight wiggles. Lithography and etching round such corners anyway, so the fabricated device would differ from the simulated one, and a sharp corner also fails the morphological design rule check. The curvature penalty estimates the local radius of curvature at every vertex from a quadratic Bézier curve through that vertex and its two neighbors, and charges each vertex through a logistic function that switches on when the radius falls below a minimum \(r_{\mathrm{min}}\). The penalty is the average over the vertices and is subtracted from the figure of merit. Like the erosion and dilation penalty, it is soft.`,
bridge: String.raw`This is Ch. 3 Sec. 3.5, Eq. (3.17). Michaels and Yablonovitch 2018 introduced it for their silicon taper: a quadratic curve through each vertex and its two neighbors gives the radius (their Eq. 34), and a logistic function of the radius is subtracted from the figure of merit (their Eqs. 17 and 35), with \(r_{\mathrm{min}} = 150\) nm because it can be easily fabricated. Tidy3D implements the same function in \(\mathtt{make\_curvature\_penalty}\) and \(\mathtt{bezier\_curvature}\), whose docstring credits that paper, and averages over the vertices instead of summing.`,
cards: [
{s: "1. Why corners matter", t: "A sharp corner is never fabricated as drawn",
intu: String.raw`Electron-beam lithography and etching cannot reproduce a perfectly sharp corner. A simple way to picture the effect is an opening with a small radius \(r_{\mathrm{fab}}\): convex corners come out rounded with that radius (Lesson 8). A layout drawn with sharp corners therefore loses area at every corner, and the simulated device is not the one that gets made. A layout whose corners already have a radius of at least \(r_{\mathrm{fab}}\) is unchanged. Compare a sharp and a rounded design.`,
eq: String.raw`\[ \text{fabricated} \approx \operatorname{open}_{r_{\mathrm{fab}}}(\text{drawn}) \]<div class="eqnote">a simple picture of corner rounding</div>\[ \text{unchanged if every convex corner radius} \ge r_{\mathrm{fab}} \]`,
sym: [[String.raw`\(r_{\mathrm{fab}}\)`, "effective rounding radius of the process, a picture rather than a precise model"], ["corner radius", "radius of the arc that replaces the corner"]],
how: ["Draw the same shape with sharp corners and with rounded ones.", String.raw`Apply an opening of radius \(r_{\mathrm{fab}}\) to both.`, "Count the area that changes (red).", String.raw`Only the rounded design survives unchanged once its corner radius exceeds \(r_{\mathrm{fab}}\).`],
say: "Sharp corners are rounded by fabrication, so the optimizer is discouraged from making corners tighter than a minimum radius.",
num: String.raw`A 90° corner loses \((1 - \pi/4)r_{\mathrm{fab}}^2\) of area. Michaels and Yablonovitch chose \(r_{\mathrm{min}} = 150\) nm for their taper as a radius that can be easily fabricated.`,
r(fig, ctl) {
  ctl.innerHTML = sl("f", "Rounding radius r_fab (pixels)", 1, 10, 0.5, 5) + sl("c", "Drawn corner radius (pixels)", 0, 14, 1, 0) + '<div class="readout" id="ro"></div>';
  const W = 100, H = 60;
  const u = () => {
    const rf = +$("f").value, rc = +$("c").value; $("fv").textContent = rf; $("cv").textContent = rc;
    const X = new Uint8Array(W * H); C3.rrect(X, W, H, 8, 8, 60, 52, rc, 1); C3.rrect(X, W, H, 60, 22, 94, 38, Math.min(rc, 8), 1);
    const O = C3.bOpen(X, W, H, rf, 0), rem = X.map((v, i) => v && !O[i] ? 1 : 0), n = rem.reduce((a, b) => a + b, 0);
    C3.draw(fig, X, W, H, 5.4, "Red: drawn GaAs that this rounding radius would not reproduce.", [[rem, [216, 90, 48]]]);
    $("ro").innerHTML = `<div><span>area lost at corners</span><b>${n} px</b></div><div><span>verdict</span><b>${n < 6 ? "fabricated as drawn" : "corners too sharp"}</b></div>`;
  };
  $("f").oninput = u; $("c").oninput = u; u();
}},

{s: "2. Radius from three points", t: "The local radius from a Bézier curve through three vertices",
intu: String.raw`Take a vertex \(\mathbf{p}_c\) and its two neighbors \(\mathbf{p}_0\) and \(\mathbf{p}_2\). Tidy3D builds a quadratic Bézier curve that starts at \(\mathbf{p}_0\), ends at \(\mathbf{p}_2\) and passes through \(\mathbf{p}_c\) at its middle, and takes the curvature there. The radius is one over the curvature. The orange circle has that radius. Move the middle vertex out and in and change the spacing. The readout compares with the circle through the three points.`,
eq: String.raw`\[ B(t) = (1 - t)^2\, \mathbf{p}_0 + 2t(1 - t)\, \mathbf{p}_1 + t^2\, \mathbf{p}_2 \]\[ \mathbf{p}_1 = 2\mathbf{p}_c - \frac{\mathbf{p}_0 + \mathbf{p}_2}{2} \quad\Longrightarrow\quad B\!\left(\tfrac{1}{2}\right) = \mathbf{p}_c \]\[ \kappa = \frac{\lvert B' \times B'' \rvert}{\lvert B' \rvert^3} \;\text{ at } t = \tfrac{1}{2} \]\[ B' = \mathbf{p}_2 - \mathbf{p}_0 \qquad B'' = 4(\mathbf{p}_0 - 2\mathbf{p}_c + \mathbf{p}_2) \qquad r = \frac{1}{\lvert \kappa \rvert} \]`,
sym: [[String.raw`\(\mathbf{p}_0, \mathbf{p}_c, \mathbf{p}_2\)`, "previous vertex, the vertex, next vertex"], [String.raw`\(\mathbf{p}_1\)`, String.raw`control point chosen so the curve passes through \(\mathbf{p}_c\)`], [String.raw`\(\kappa\)`, String.raw`curvature of the curve at \(\mathbf{p}_c\)`], [String.raw`\(r\)`, "local radius of curvature"]],
how: [String.raw`Choose the control point \(\mathbf{p}_1\) so that \(B(\tfrac{1}{2}) = \mathbf{p}_c\).`, String.raw`Differentiate the quadratic: \(B'(\tfrac{1}{2}) = \mathbf{p}_2 - \mathbf{p}_0\) and \(B'' = 2(\mathbf{p}_0 - 2\mathbf{p}_1 + \mathbf{p}_2) = 4(\mathbf{p}_0 - 2\mathbf{p}_c + \mathbf{p}_2)\).`, String.raw`Plane curvature: \(\kappa = (x'y'' - y'x'')/(x'^2 + y'^2)^{3/2}\).`, "Michaels and Yablonovitch fit quadratic curves to sets of three points in the same way (their Eq. 34)."],
say: "The radius at each vertex is one over the curvature of the quadratic Bézier curve through that vertex and its two neighbors.",
num: String.raw`For three points on a circle of radius \(R\) separated by an angle \(\varphi\), this estimate gives \(R(1 + \cos\varphi)/2\). With 10 points per quarter circle the estimate is within 0.6 % of \(R\). With very coarse spacing it underestimates the radius.`,
r(fig, ctl) {
  ctl.innerHTML = sl("h", "Neighbor spacing (nm)", 20, 200, 5, 80) + sl("d", "Middle vertex offset (nm)", -60, 60, 1, 20) + '<div class="readout" id="ro"></div>';
  const u = () => {
    const h = +$("h").value, d = +$("d").value; $("hv").textContent = h; $("dv").textContent = d;
    const p0 = [-h, 0], pc = [0, d], p2 = [h, 0], k = C3.bezierK(p0, pc, p2), r = 1 / (Math.abs(k) + 1e-12);
    const sc = 1.2, cx = 340, cy = 170, P = p => [cx + p[0] * sc, cy - p[1] * sc];
    const p1 = [2 * pc[0] - (p0[0] + p2[0]) / 2, 2 * pc[1] - (p0[1] + p2[1]) / 2];
    let path = ""; for (let i = 0; i <= 40; i++) { const t = i / 40, x = (1 - t) ** 2 * p0[0] + 2 * t * (1 - t) * p1[0] + t * t * p2[0], y = (1 - t) ** 2 * p0[1] + 2 * t * (1 - t) * p1[1] + t * t * p2[1]; const q = P([x, y]); path += (i ? "L" : "M") + q[0].toFixed(1) + " " + q[1].toFixed(1); }
    let s = `<path d="${path}" fill="none" stroke="#378ADD" stroke-width="2.5"/>`;
    if (Math.abs(d) > 0.5) { const sg = Math.sign(d), cc = P([0, d - sg * r]); s += `<circle cx="${cc[0]}" cy="${cc[1]}" r="${r * sc}" fill="none" stroke="#EF9F27" stroke-width="1.5" stroke-dasharray="5 4"/>`; }
    [p0, pc, p2].forEach((p, i) => { const q = P(p); s += `<circle cx="${q[0]}" cy="${q[1]}" r="5" fill="${i === 1 ? "#D85A30" : "var(--t)"}"/><text class="ts" x="${q[0]}" y="${q[1] + 22}" text-anchor="middle">${["p₀", "p_c", "p₂"][i]}</text>`; });
    const q1 = P(p1); s += `<circle cx="${q1[0]}" cy="${q1[1]}" r="3" fill="none" stroke="var(--p)"/><text class="ts" x="${q1[0] + 8}" y="${q1[1]}">p₁</text>`;
    fig.innerHTML = svg(270, `<rect x="0" y="0" width="680" height="270" fill="none"/><g>${s}</g>`);
    const a = Math.hypot(pc[0] - p0[0], pc[1] - p0[1]), b = Math.hypot(p2[0] - pc[0], p2[1] - pc[1]), c = Math.hypot(p2[0] - p0[0], p2[1] - p0[1]), area = Math.abs((pc[0] - p0[0]) * (p2[1] - p0[1]) - (p2[0] - p0[0]) * (pc[1] - p0[1])) / 2, Rc = area > 1e-9 ? a * b * c / (4 * area) : Infinity;
    $("ro").innerHTML = `<div><span>Bézier radius r</span><b>${isFinite(r) && r < 1e6 ? r.toFixed(1) + " nm" : "straight"}</b></div><div><span>circle through the 3 points</span><b>${isFinite(Rc) ? Rc.toFixed(1) + " nm" : "straight"}</b></div>`;
  };
  $("h").oninput = u; $("d").oninput = u; u();
}},

{s: "3. The logistic penalty", t: "A soft switch that charges radii below r_min",
intu: String.raw`Each vertex is charged a logistic function of its radius. Far above \(r_{\mathrm{min}}\) the charge is nearly 0, far below it is nearly 1, and exactly at \(r_{\mathrm{min}}\) it is ½. The steepness \(\kappa\) sets how wide the switch is: about \(4/\kappa\) in radius goes from 0.12 to 0.88. Note the units: \(\kappa\) is per micrometer, so \(\kappa = 10\,\mu\mathrm{m}^{-1}\) is a gentle switch hundreds of nanometers wide. Change \(\kappa\) and \(r_{\mathrm{min}}\).`,
eq: String.raw`\[ p(r) = \frac{e^{-\kappa(r - r_{\mathrm{min}})}}{1 + e^{-\kappa(r - r_{\mathrm{min}})}} = \frac{1}{1 + e^{\kappa(r - r_{\mathrm{min}})}} \]<div class="eqref">Ch. 3 Eq. (3.17), Michaels Eq. 35</div>`,
sym: [[String.raw`\(r\)`, "local radius at a vertex"], [String.raw`\(r_{\mathrm{min}}\)`, "minimum radius, where the charge is ½"], [String.raw`\(\kappa\)`, "steepness, per unit length"], [String.raw`\(p(r)\)`, "charge of one vertex, between 0 and 1"]],
how: [String.raw`Michaels and Yablonovitch subtract \(\alpha/(1 + \exp[-\kappa(R_0 - R_i)])\) for every vertex.`, String.raw`That is the same logistic, written with \(R_0 = r_{\mathrm{min}}\).`, String.raw`Tidy3D writes it as \(e^{-\mathrm{arg}}/(1 + e^{-\mathrm{arg}})\) with \(\mathrm{arg} = \kappa(r - r_{\mathrm{min}})\) and \(\alpha = 1\).`, "The logistic is smooth, so its gradient exists everywhere."],
say: String.raw`Each vertex is charged a logistic function of its radius that equals one half at \(r_{\mathrm{min}}\) and switches off above it, with \(\kappa\) setting how sharp the switch is.`,
num: String.raw`With \(\kappa = 10\,\mu\mathrm{m}^{-1}\) the charge 100 nm above \(r_{\mathrm{min}}\) is still 0.27, a very soft switch. Tidy3D's defaults are \(\kappa = 10\) and \(\alpha = 1\).`,
r(fig, ctl) {
  ctl.innerHTML = sl("k", "κ (per µm, log)", 0, 2.6, 0.01, 1) + sl("m", "r_min (nm)", 20, 300, 5, 150) + '<div class="readout" id="ro"></div>';
  const rs = range(0, 500, 501);
  const u = () => {
    const kap = Math.pow(10, +$("k").value), rm = +$("m").value; $("kv").textContent = kap.toFixed(kap < 10 ? 1 : 0); $("mv").textContent = rm;
    const f = r => C3.curvTerm(r / 1000, rm / 1000, kap), X = C3.X(70, 560, 0, 500);
    let s = C3.frame(70, 20, 560, 190, 0, 500, 0, 1, [0, 100, 200, 300, 400, 500], [0, 0.5, 1], "local radius r (nm)", "charge p(r)") + `<line x1="${X(rm)}" x2="${X(rm)}" y1="20" y2="210" stroke="#EF9F27" stroke-dasharray="4 3"/><text class="ts" x="${X(rm) + 5}" y="34">r_min</text>`;
    s += plot(70, 20, 560, 190, rs, rs.map(f), 0, 500, 0, 1, "#D85A30", 2.5);
    fig.innerHTML = svg(250, s);
    $("ro").innerHTML = `<div><span>p(r_min)</span><b>${f(rm).toFixed(2)}</b></div><div><span>p(r_min + 100 nm)</span><b>${f(rm + 100).toFixed(3)}</b></div><div><span>p(r_min − 50 nm)</span><b>${f(Math.max(0, rm - 50)).toFixed(3)}</b></div><div><span>switch width 4/κ</span><b>${(4000 / kap).toFixed(0)} nm</b></div>`;
  };
  $("k").oninput = u; $("m").oninput = u; u();
}},

{s: "4. A whole outline", t: "The penalty is the mean charge over the vertices",
intu: "Apply the charge to every vertex of an outline and average. Here a closed outline has lobes and wiggles. Vertices are colored by their charge, red for nearly 1 and green for nearly 0. Make the wiggles stronger or more frequent and watch the tight spots turn red and the mean rise. Only vertices with a neighbor on each side are counted, which for a closed outline is all of them.",
eq: String.raw`\[ P_{\kappa} = \frac{1}{N_v} \sum_i p(r_i) \qquad J = F - w_{\kappa} P_{\kappa} \]<div class="eqref">Ch. 3 Eq. (3.17)</div>`,
sym: [[String.raw`\(N_v\)`, "number of vertices with a neighbor on each side"], [String.raw`\(P_{\kappa}\)`, "mean charge, between 0 and 1"], [String.raw`\(w_{\kappa}\)`, String.raw`weight of the penalty in \(J\)`]],
how: [String.raw`Estimate \(r_i\) at every vertex (card 2).`, "Charge each with the logistic (card 3).", "Average: Tidy3D takes the mean, Michaels and Yablonovitch the sum.", String.raw`Subtract \(w_{\kappa} P_{\kappa}\) from the figure of merit.`],
say: "The curvature penalty is the average logistic charge over the vertices, subtracted from the figure of merit with a weight.",
num: "Averaging instead of summing makes the penalty independent of the number of vertices, so the same weight works for outlines with 80 or 500 points.",
r(fig, ctl) {
  ctl.innerHTML = sl("a", "Wiggle amplitude (nm)", 0, 120, 1, 40) + sl("f", "Wiggles around the outline", 3, 14, 1, 7) + sl("m", "r_min (nm)", 30, 250, 5, 100) + '<div class="readout" id="ro"></div>';
  const N = 120;
  const u = () => {
    const A = +$("a").value, fq = +$("f").value, rm = +$("m").value; $("av").textContent = A; $("fv").textContent = fq; $("mv").textContent = rm;
    const pts = Array.from({ length: N }, (_, i) => { const t = 2 * Math.PI * i / N, R = 900 + 250 * Math.cos(2 * t) + A * Math.sin(fq * t); return [1.25 * R * Math.cos(t), R * Math.sin(t)]; });
    const cp = C3.curvPenalty(pts, rm, 10 / 1000, true), sc = 0.105;
    let s = `<path d="M${pts.map(p => `${(340 + p[0] * sc).toFixed(1)} ${(135 + p[1] * sc).toFixed(1)}`).join("L")}Z" fill="var(--blue-bg)" stroke="var(--blue)" stroke-width="1.5"/>`;
    pts.forEach((p, i) => { const t = cp.terms[i], col = `rgb(${Math.round(60 + 170 * t)},${Math.round(170 - 110 * t)},${Math.round(110 - 60 * t)})`; s += `<circle cx="${340 + p[0] * sc}" cy="${135 + p[1] * sc}" r="3.2" fill="${col}"/>`; });
    fig.innerHTML = svg(270, s + `<text class="ts" x="20" y="262">κ = 10 per µm, vertex color: green p ≈ 0, red p ≈ 1</text>`);
    $("ro").innerHTML = `<div><span>P_κ (mean)</span><b>${cp.P.toFixed(3)}</b></div><div><span>smallest radius</span><b>${Math.min(...cp.r).toFixed(0)} nm</b></div><div><span>vertices</span><b>${N}</b></div>`;
  };
  ["a", "f", "m"].forEach(k => $(k).oninput = u); u();
}},

{s: "5. Gentle or sharp", t: "Two settings of κ: gentle shaping and a near hard limit",
intu: String.raw`The same function can play two roles. With a small \(\kappa\) the switch is hundreds of nanometers wide: every vertex feels some charge, so the penalty gently smooths the whole outline. With a large \(\kappa\) the switch is a few nanometers wide: vertices comfortably above \(r_{\mathrm{min}}\) pay almost nothing, and only those that cross it are charged, so it behaves almost like a hard limit. A gentle setting suits an early shape stage, a sharp one a final stage that must respect a rule. Compare the two curves.`,
eq: String.raw`\[ p(r) \text{ for } \kappa = 10\,\mu\mathrm{m}^{-1} \text{ (gentle) and } \kappa = 200\,\mu\mathrm{m}^{-1} \text{ (sharp)} \]`,
sym: [[String.raw`\(\kappa = 10\,\mu\mathrm{m}^{-1}\)`, String.raw`switch width \(4/\kappa = 400\) nm`], [String.raw`\(\kappa = 200\,\mu\mathrm{m}^{-1}\)`, String.raw`switch width \(4/\kappa = 20\) nm`]],
how: [String.raw`Fix \(r_{\mathrm{min}}\).`, String.raw`Plot the logistic for both \(\kappa\).`, "Read the charge at a few radii.", String.raw`Choose \(\kappa\) according to whether the penalty should shape or only police.`],
say: String.raw`A small \(\kappa\) makes the curvature penalty a gentle smoothing term, a large \(\kappa\) makes it close to a hard minimum radius.`,
num: String.raw`With \(r_{\mathrm{min}} = 50\) nm and \(\kappa = 200\,\mu\mathrm{m}^{-1}\): 0.07 for a corner of 63 nm, 0.88 for one of 40 nm. With \(\kappa = 10\,\mu\mathrm{m}^{-1}\), a vertex 100 nm above \(r_{\mathrm{min}}\) still pays 0.27.`,
r(fig, ctl) {
  ctl.innerHTML = sl("m", "r_min (nm)", 20, 200, 5, 50) + sl("r", "Probe radius (nm)", 0, 300, 1, 63) + '<div class="readout" id="ro"></div>';
  const rs = range(0, 300, 301);
  const u = () => {
    const rm = +$("m").value, rp = +$("r").value; $("mv").textContent = rm; $("rv").textContent = rp;
    const f = (r, k) => C3.curvTerm(r / 1000, rm / 1000, k), X = C3.X(70, 560, 0, 300), Y = C3.Y(20, 190, 0, 1);
    let s = C3.frame(70, 20, 560, 190, 0, 300, 0, 1, [0, 50, 100, 150, 200, 250, 300], [0, 0.5, 1], "local radius r (nm)", "charge p(r)");
    s += plot(70, 20, 560, 190, rs, rs.map(r => f(r, 10)), 0, 300, 0, 1, "#378ADD", 2.5) + plot(70, 20, 560, 190, rs, rs.map(r => f(r, 200)), 0, 300, 0, 1, "#D85A30", 2.5);
    s += `<line x1="${X(rp)}" x2="${X(rp)}" y1="20" y2="210" stroke="var(--p)" stroke-dasharray="3 3"/>` + C3.legend(80, 258, [["κ = 10 per µm", "#378ADD"], ["κ = 200 per µm", "#D85A30"]]);
    fig.innerHTML = svg(268, s);
    $("ro").innerHTML = `<div><span>p at probe, κ = 10</span><b>${f(rp, 10).toFixed(3)}</b></div><div><span>p at probe, κ = 200</span><b>${f(rp, 200).toFixed(3)}</b></div>`;
  };
  $("m").oninput = u; $("r").oninput = u; u();
}},

{s: "6. The penalty smooths", t: "Following the curvature gradient alone",
intu: String.raw`Start from an outline with tight wiggles and minimize \(P_{\kappa}\) alone, moving each vertex along its normal as in the shape stage (Lesson 5). Press run. The tightest spots relax first and the outline smooths until its radii clear \(r_{\mathrm{min}}\). Some vertices may stay below \(r_{\mathrm{min}}\) if the outline cannot fix them within the allowed move. In a real run the figure of merit pulls the other way, so the result is a compromise, and nothing guarantees every vertex ends above \(r_{\mathrm{min}}\).`,
eq: String.raw`\[ \theta \leftarrow \theta - \operatorname{Adam}\!\left(\frac{\partial P_{\kappa}}{\partial \theta}\right) \qquad \mathbf{r}_i = \mathbf{r}_i^{(0)} + \Delta_{\mathrm{max}} \tanh(\theta_i)\, \hat{\mathbf{n}}_i \]`,
sym: [[String.raw`\(\theta_i\)`, "vertex move variables (Lesson 5)"], [String.raw`\(\Delta_{\mathrm{max}}\)`, "60 nm here"], ["gradient", String.raw`computed here by finite differences, cheap because \(P_{\kappa}\) needs no simulation`]],
how: ["Parameterize the vertices by bounded normal moves.", String.raw`Compute \(P_{\kappa}\) and its gradient with respect to every \(\theta_i\).`, "Take Adam steps downhill.", "Watch the radii grow at the tight spots."],
say: "The curvature penalty gradient relaxes tight spots on the outline, but as a soft term it does not guarantee that every vertex ends above the minimum radius.",
num: "Michaels and Yablonovitch: this soft constraint does not guarantee that the approximate radius of curvature stays above the limit everywhere.",
r(fig, ctl) {
  ctl.innerHTML = `<div class="row"><button id="go">Run 80 steps</button><button id="rs">Reset</button></div><div class="readout" id="ro"></div>`;
  const N = 90, rm = 150, kap = 30 / 1000, Dm = 60;
  const base = Array.from({ length: N }, (_, i) => { const t = 2 * Math.PI * i / N, R = 900 + 200 * Math.cos(2 * t) + 70 * Math.sin(9 * t); return [1.25 * R * Math.cos(t), R * Math.sin(t)]; });
  const nor = base.map((p, i) => { const a = base[(i + N - 1) % N], b = base[(i + 1) % N], tx = b[0] - a[0], ty = b[1] - a[1], l = Math.hypot(tx, ty); return [ty / l, -tx / l]; });
  let th, ad, k, hist;
  const pts = () => base.map((p, i) => [p[0] + Dm * Math.tanh(th[i]) * nor[i][0], p[1] + Dm * Math.tanh(th[i]) * nor[i][1]]);
  const P = () => C3.curvPenalty(pts(), rm, kap, true);
  const reset = () => { th = new Float64Array(N); ad = new C3.Adam(N, 0.08); k = 0; hist = [P().P]; };
  const draw = () => {
    const ps = pts(), cp = C3.curvPenalty(ps, rm, kap, true), sc = 0.1;
    let s = `<path d="M${base.map(p => `${(250 + p[0] * sc).toFixed(1)} ${(130 + p[1] * sc).toFixed(1)}`).join("L")}Z" fill="none" stroke="var(--p)" stroke-dasharray="3 3"/>`;
    s += `<path d="M${ps.map(p => `${(250 + p[0] * sc).toFixed(1)} ${(130 + p[1] * sc).toFixed(1)}`).join("L")}Z" fill="var(--blue-bg)" stroke="var(--blue)" stroke-width="1.5"/>`;
    ps.forEach((p, i) => { const t = cp.terms[i]; s += `<circle cx="${250 + p[0] * sc}" cy="${130 + p[1] * sc}" r="2.6" fill="rgb(${Math.round(60 + 170 * t)},${Math.round(170 - 110 * t)},${Math.round(110 - 60 * t)})"/>`; });
    s += C3.frame(480, 30, 170, 150, 0, 80, 0, hist[0] * 1.05, [0, 80], [0, hist[0]], "step", "P_κ", v => v, v => v.toFixed(2)) + plot(480, 30, 170, 150, hist.map((_, i) => i), hist, 0, 80, 0, hist[0] * 1.05, "#D85A30", 2);
    fig.innerHTML = svg(262, s + `<text class="ts" x="20" y="255">dashed: start. r_min = 150 nm, κ = 30 per µm, Δ_max = 60 nm</text>`);
    $("ro").innerHTML = `<div><span>step</span><b>${k}</b></div><div><span>P_κ</span><b>${cp.P.toFixed(3)}</b></div><div><span>smallest radius</span><b>${Math.min(...cp.r).toFixed(0)} nm</b></div>`;
  };
  const grad = () => { const g = new Float64Array(N), h = 1e-4, p0 = P().P; for (let i = 0; i < N; i++) { th[i] += h; g[i] = (P().P - p0) / h; th[i] -= h; } return g; };
  $("go").onclick = () => { if (k >= 80) reset(); anim(() => { if (k >= 80) { stopAnim(); return; } const s = ad.step(Array.from(grad(), v => -v)); for (let i = 0; i < N; i++) th[i] += s[i]; k++; hist.push(P().P); draw(); }); };
  $("rs").onclick = () => { stopAnim(); reset(); draw(); };
  reset(); draw();
}}
],
summary: String.raw`The curvature penalty estimates the radius at every vertex as one over the curvature of the quadratic Bézier curve through that vertex and its two neighbors, charges each vertex with the logistic \(1/[1 + e^{\kappa(r - r_{\mathrm{min}})}]\), which is ½ at \(r_{\mathrm{min}}\), and averages the charges: \(P_{\kappa} = (1/N_v)\sum p(r_i)\), subtracted from the figure of merit with weight \(w_{\kappa}\). A small \(\kappa\) gives gentle smoothing, a large \(\kappa\) approaches a hard minimum radius. It comes from Michaels and Yablonovitch, who summed instead of averaging. It is soft, so it discourages tight corners without guaranteeing their absence.`,
sheet: [
[String.raw`\[ \begin{aligned} \mathbf{p}_1 &= 2\mathbf{p}_c - \frac{\mathbf{p}_0 + \mathbf{p}_2}{2} \\ B'\!\left(\tfrac{1}{2}\right) &= \mathbf{p}_2 - \mathbf{p}_0 \\ B'' &= 4(\mathbf{p}_0 - 2\mathbf{p}_c + \mathbf{p}_2) \end{aligned} \]`, String.raw`Bézier through the vertex (Tidy3D \(\mathtt{bezier\_curvature}\), Michaels Eq. 34)`],
[String.raw`\[ \kappa = \frac{x'y'' - y'x''}{(x'^2 + y'^2)^{3/2}} \qquad r = \frac{1}{\lvert \kappa \rvert} \]`, "Curvature and radius"],
[String.raw`\[ p(r) = \frac{e^{-\kappa(r - r_{\mathrm{min}})}}{1 + e^{-\kappa(r - r_{\mathrm{min}})}} \]`, "Logistic charge (Michaels Eq. 35)"],
[String.raw`\[ P_{\kappa} = \frac{1}{N_v} \sum_i p(r_i) \qquad J = F - w_{\kappa} P_{\kappa} \]`, "Curvature penalty (Ch. 3 Eq. 3.17)"],
[String.raw`\[ r_{\mathrm{est}} = \frac{R\,(1 + \cos\varphi)}{2} \]`, String.raw`Three-point estimate on a circle of radius \(R\), spacing angle \(\varphi\)`]],
consts: String.raw`Outlines are drawn in nanometers. \(\kappa\) is quoted per micrometer, as in Tidy3D, so \(\kappa(r - r_{\mathrm{min}})\) uses \(r\) in micrometers.`,
sources: ["Michaels and Yablonovitch, Opt. Express 26, 31717 (2018), Eqs. (17), (34), (35) and Sec. 5 (curvature penalty for a silicon taper, soft constraint caveat)", "Flexcompute, Tidy3D 2.11.2 source: plugins/autograd/invdes/penalties.py (make_curvature_penalty, bezier_curvature, bezier_with_grads)"]
});

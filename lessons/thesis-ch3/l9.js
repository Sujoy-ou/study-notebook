addLesson("thesis", "ch3", {
level: "Advanced",
id: "thesis-ch3-l9", title: "The erosion and dilation penalty", short: "9. Erosion-dilation penalty",
big: "The filter discourages small features but does not forbid them. The erosion and dilation penalty measures how far the projected design is from obeying a length scale. It closes the design and opens it with the smooth operations of Lesson 8 and takes the root-mean-square difference between the two. A design with no feature or gap below the length scale is unchanged by both, so its penalty is close to zero. Thin bars, narrow gaps, small islands, small holes and sharp corners all make the closed and opened designs differ, so they raise the penalty. Because everything is built from filters and projections, the penalty has a gradient, and subtracting it from the figure of merit pushes the optimizer to remove or widen the offending features. Its weight grows with β, since it only means something once the design is nearly binary.",
bridge: "This is Ch. 3 Sec. 3.5, Eq. (3.16), implemented in Tidy3D as ErosionDilationPenalty (plugins/autograd/invdes/penalties.py) and applied to the projected density. Hammond et al. 2021 showed that such morphological transforms keep the problem differentiable, and found that rule-violating features are removed rather than grown. All maps and curves here are computed live with the same operations.",
cards: [
{s: "1. The penalty", t: "Close minus open, root mean square",
intu: "Take the projected design ρ̂. Close it (fill narrow gaps and holes) and open it (remove thin parts and tips) with the smooth operations of radius R. Where the design obeys the length scale, both give back ρ̂, so their difference is zero. Where it does not, the closed design has more GaAs than the opened one. The penalty is the root-mean-square of that difference over all pixels. The right map shows where it comes from. Change R.",
eq: "P<sub>ED</sub> = ‖ C(ρ̂) − O(ρ̂) ‖<sub>2</sub> / √N<sub>p</sub> &nbsp;&nbsp; (Ch. 3 Eq. 3.16, Tidy3D ErosionDilationPenalty)",
sym: [["C, O", "smooth closing and opening, built from filter and projection with thresholds 0.01 and 0.99"], ["ρ̂", "projected density, the input of the penalty"], ["N_p", "number of pixels"], ["‖·‖₂", "Euclidean norm over all pixels"]],
how: ["Dilate then erode: closing. Erode then dilate: opening.", "Closing only adds GaAs and opening only removes it, so C − O ≥ 0 approximately everywhere.", "Square, sum, divide by the number of pixels, take the root.", "The result is between 0 and 1, and close to 0 for a design that obeys the length scale."],
say: "The erosion and dilation penalty is the root-mean-square difference between the closed and the opened design, which is near zero only when no feature or gap is smaller than the length scale.",
num: "Tidy3D's defaults are β = 20 inside the penalty and thresholds 0.99 and 0.01. A larger internal β makes the operations closer to binary. This page uses β = 100.",
r(fig, ctl) {
  ctl.innerHTML = sl("n", "Penalty radius R (pixels)", 2, 6, 1, 3) + '<div class="readout" id="ro"></div>';
  const { X, W, H } = C3.pattern(), a = Float64Array.from(X);
  const u = () => {
    const n = +$("n").value; $("nv").textContent = n; const r = C3.edPenalty(a, W, H, n, 100), mx = Math.max(...r.diff) || 1;
    C3.drawRow(fig, [{ a }, { rgb: i => C2.color(r.diff[i] / mx) }], W, H, 3.3, "Right: C(ρ̂) − O(ρ̂), red where the design violates the length scale.", ["projected design ρ̂", "close minus open"]);
    let nz = 0; r.diff.forEach(v => { if (v > 0.5) nz++; });
    $("ro").innerHTML = `<div><span>P_ED</span><b>${r.P.toFixed(4)}</b></div><div><span>pixels with C − O > 0.5</span><b>${nz}</b></div>`;
  };
  $("n").oninput = u; u();
}},

{s: "2. Versus feature size", t: "The penalty switches off just below a width of 2R",
intu: "Take a single vertical bar of GaAs (or a single gap of air in GaAs) and compute the penalty for every width. Narrow bars are removed by the opening but kept by the closing, so the penalty is large. Once the bar is wide enough to survive the opening, the penalty drops to nearly zero. For this implementation the switch happens at 2R minus one pixel, about 1.75R for typical radii. Bars and gaps behave the same, because closing a gap is opening the air. Change R.",
eq: "P<sub>ED</sub>(w) for a bar or gap of width w, &nbsp; switch-off at w ≈ 2R − Δ ≈ 1.75R",
sym: [["w", "width of the bar or gap in pixels"], ["R", "radius of the penalty filter"], ["switch-off width", "smallest width with P below 0.05"]],
how: ["A bar narrower than about 2R − Δ is erased by the smooth erosion, because the 0.99 threshold moves each edge in by R − Δ.", "So the opening has no bar, the closing still has it: large difference.", "A wider bar survives both, and the difference is only a pixel-scale edge effect.", "So R plays the role of the disk radius r of Lesson 8, not of the minimum width."],
say: "The penalty drops to nearly zero once a feature or gap is wider than just under twice the penalty radius, so the radius is about half the minimum feature size.",
num: "Worth stating carefully: with Tidy3D's thresholds, a penalty radius R discourages features and gaps narrower than about 1.75R, not narrower than R. For a large kernel a single-pixel line barely registers, because its filtered value stays below the 0.01 dilation threshold, so the closing removes it as well.",
r(fig, ctl) {
  ctl.innerHTML = sl("n", "Penalty radius R (pixels)", 2, 6, 1, 4) + '<div class="readout" id="ro"></div>';
  const u = () => {
    const n = +$("n").value; $("nv").textContent = n; const W = 8 * n + 8, H = 3 * n + 1, ws = [], Pb = [], Pg = [];
    for (let w = 1; w <= 4 * n; w++) {
      const a = new Float64Array(W * H), g = new Float64Array(W * H).fill(1);
      const x0 = Math.floor(W / 2) - Math.floor(w / 2); for (let y = 0; y < H; y++) for (let x = x0; x < x0 + w; x++) { a[y * W + x] = 1; g[y * W + x] = 0; }
      ws.push(w); Pb.push(C3.edPenalty(a, W, H, n, 100).P); Pg.push(C3.edPenalty(g, W, H, n, 100).P);
    }
    const ym = Math.max(...Pb, ...Pg) * 1.1, X = C3.X(70, 560, 0, 4 * n);
    let s = C3.frame(70, 20, 560, 190, 0, 4 * n, 0, ym, [0, n, 2 * n, 3 * n, 4 * n], [0, ym / 2], "width w (pixels)", "P_ED", v => v === 0 ? "0" : v === n ? "R" : (v / n) + "R", v => v.toFixed(2));
    s += `<line x1="${X(2 * n)}" x2="${X(2 * n)}" y1="20" y2="210" stroke="#EF9F27" stroke-dasharray="4 3"/>` + plot(70, 20, 560, 190, ws, Pb, 0, 4 * n, 0, ym, "#378ADD", 2.5) + plot(70, 20, 560, 190, ws, Pg, 0, 4 * n, 0, ym, "#D85A30", 2, "6 4");
    s += C3.legend(80, 258, [["GaAs bar of width w", "#378ADD"], ["air gap of width w", "#D85A30", "6 4"]]);
    fig.innerHTML = svg(268, s);
    const off = ws.find((w, i) => Pb[i] < 0.05 && Pb.slice(i).every(v => v < 0.05));
    $("ro").innerHTML = `<div><span>switch-off width</span><b>${off} px = ${(off / n).toFixed(2)} R</b></div><div><span>largest P</span><b>${Math.max(...Pb).toFixed(3)}</b></div>`;
  };
  $("n").oninput = u; u();
}},

{s: "3. Its gradient", t: "Where the penalty pushes the design",
intu: "The penalty is differentiable, so it has a gradient with respect to every pixel of ρ̂. On a nearly binary design that gradient is tiny almost everywhere, because the tanh projections inside the penalty are saturated, and it concentrates on a few edge pixels. Adam rescales each pixel's step (Lesson 12), so even small gradients move the design. The right map shows the change after the first few Adam steps on the penalty alone: red where GaAs is added, blue where it is removed. The thin bar, the island and the sharp corners are eaten away, the narrow gap and the small hole start to fill. This is the behavior Hammond et al. describe: violating features are removed rather than grown to the minimum size.",
eq: "∂P<sub>ED</sub>/∂ρ̂ &nbsp; via the chain rule through C = E∘D and O = D∘E, each a filter followed by a projection",
sym: [["E, D", "smooth erosion and dilation"], ["red", "GaAs added by the first steps"], ["blue", "GaAs removed by the first steps"], ["steps", "Adam steps on P_ED alone, learning rate 0.05"]],
how: ["The penalty is a composition of filters, projections and a norm.", "Each piece has a simple derivative (Lessons 6 and 7).", "Backpropagation applies them in reverse order, with no simulation.", "Adam turns the gradient into steps of similar size for every pixel that has a consistent gradient."],
say: "The gradient of the erosion and dilation penalty pushes thin features, small islands and sharp corners to vanish and narrow gaps and holes to fill.",
num: "The gradient here was checked against finite differences while building this page, to better than 10<sup>−3</sup> relative error.",
r(fig, ctl) {
  ctl.innerHTML = sl("n", "Penalty radius R (pixels)", 2, 5, 1, 4) + sl("k", "Adam steps", 2, 20, 1, 8) + '<div class="readout" id="ro"></div>';
  const { X, W, H } = C3.pattern(), a0 = Float64Array.from(X);
  const u = () => {
    const n = +$("n").value, K = +$("k").value; $("nv").textContent = n; $("kv").textContent = K;
    const a = Float64Array.from(a0), ad = new C3.Adam(W * H, 0.05);
    for (let k = 0; k < K; k++) { const r = C3.edPenalty(a, W, H, n, 100, true), st = ad.step(r.grad.map(v => -v)); for (let i = 0; i < a.length; i++) a[i] = C3.clamp(a[i] + st[i], 0, 1); }
    const d = a.map((v, i) => v - a0[i]), md = Math.max(...d.map(Math.abs)) || 1;
    C3.drawRow(fig, [{ a: a0 }, { rgb: i => C2.color(d[i] / md) }], W, H, 3.3, "Right: change of ρ̂ after the first Adam steps on P_ED alone. Red: GaAs added. Blue: GaAs removed.", ["design ρ̂", "where the penalty pushes"]);
    $("ro").innerHTML = `<div><span>P_ED before</span><b>${C3.edPenalty(a0, W, H, n, 100).P.toFixed(4)}</b></div><div><span>P_ED after ${K} steps</span><b>${C3.edPenalty(a, W, H, n, 100).P.toFixed(4)}</b></div>`;
  };
  $("n").oninput = u; $("k").oninput = u; u();
}},

{s: "4. Weight ramp", t: "The weight grows with β",
intu: "Early in the optimization the design is grey, and the opened and closed versions of a grey design differ almost everywhere. A penalty at full weight then would fight the figure of merit for no good reason. So the weight follows β: it rises linearly as min(1, β/25) and reaches 1 once β reaches 25. With a geometric schedule from 1 to 100 in 11 levels, that happens at the eighth level, β = 25.1. Change the schedule.",
eq: "J = FOM − min(1, β/25) P<sub>ED</sub> &nbsp;&nbsp; (Ch. 3 Eq. 3.16)",
sym: [["β", "current projection sharpness (Lesson 7)"], ["min(1, β/25)", "penalty weight, from 0.04 at β = 1 to 1 at β ≥ 25"]],
how: ["Grey designs give large but meaningless penalties.", "Tie the weight to β, which measures how binary the design is allowed to be.", "Let it reach full weight in the last levels, when the design is nearly binary.", "Hammond et al. similarly switch their constraints on only at their final β and tighten them gradually."],
say: "The penalty weight grows with β and reaches one only when the design is nearly binary, so it does not fight the early formation of the layout.",
num: "With 11 levels of 7 steps from β = 1 to 100, the weight is 1 for the last 4 levels, 28 of the 77 steps.",
r(fig, ctl) {
  ctl.innerHTML = sl("L", "Levels", 4, 15, 1, 11) + sl("s", "Steps per level", 3, 12, 1, 7) + sl("m", "β_max", 25, 200, 5, 100) + '<div class="readout" id="ro"></div>';
  const u = () => {
    const L = +$("L").value, st = +$("s").value, bm = +$("m").value; $("Lv").textContent = L; $("sv").textContent = st; $("mv").textContent = bm;
    const T = L * st, bs = Array.from({ length: L }, (_, k) => Math.pow(bm, k / (L - 1))), X = C3.X(70, 560, 0, T), Yw = C3.Y(30, 170, 0, 1.1);
    let s = C3.frame(70, 30, 560, 170, 0, T, 0, 1.1, [0, T], [0, 0.5, 1], "optimizer step", "penalty weight"), d = "", db = "";
    bs.forEach((b, k) => { const w = Math.min(1, b / 25); d += `${k ? "L" : "M"}${X(k * st)} ${Yw(w)} L${X((k + 1) * st)} ${Yw(w)}`; const yb = 200 - Math.log10(b) / Math.log10(bm) * 170; db += `${k ? "L" : "M"}${X(k * st)} ${yb} L${X((k + 1) * st)} ${yb}`; });
    s += `<path d="${db}" fill="none" stroke="var(--b)" stroke-width="2"/><path d="${d}" fill="none" stroke="#D85A30" stroke-width="2.5"/>`;
    s += C3.legend(80, 258, [["weight min(1, β/25)", "#D85A30"], ["β (log, scaled)", "var(--b)"]]);
    fig.innerHTML = svg(268, s);
    const kf = bs.findIndex(b => b >= 25);
    $("ro").innerHTML = `<div><span>full weight from level</span><b>${kf + 1} (β = ${bs[kf].toFixed(1)})</b></div><div><span>steps at full weight</span><b>${(L - kf) * st} of ${T}</b></div>`;
  };
  ["L", "s", "m"].forEach(k => $(k).oninput = u); u();
}},

{s: "5. Penalty alone", t: "Minimize the penalty alone and watch violators vanish",
intu: "To see what the penalty does by itself, minimize P<sub>ED</sub> alone with Adam, starting from the test pattern, with no figure of merit. Press run. The thin bar and the island fade away, the narrow gap and the hole fill in, and the corners round off, until the design obeys the length scale. In a real optimization the figure of merit pulls the other way, so the result is a compromise, but the direction of the push is the same.",
eq: "ρ̂ ← clip(ρ̂ − Adam(∂P<sub>ED</sub>/∂ρ̂), 0, 1)",
sym: [["Adam", "optimizer of Lesson 12, learning rate 0.05 here"], ["clip", "keep every pixel between 0 and 1"]],
how: ["Start from the test layout.", "Compute P_ED and its gradient (card 3).", "Take an Adam step downhill.", "Repeat. The penalty falls step by step as the violations are removed."],
say: "Minimizing the erosion and dilation penalty alone removes thin features and small islands and fills narrow gaps and holes.",
num: "Hammond et al.: violating islands must disappear. Their area constraint never grows a feature up to the minimum size, it only removes violators.",
r(fig, ctl) {
  ctl.innerHTML = `<div class="row"><button id="go">Run 60 steps</button><button id="rs">Reset</button></div><div class="readout" id="ro"></div>`;
  const { X, W, H } = C3.pattern(), n = 4; let a, ad, hist, k;
  const reset = () => { a = Float64Array.from(X); ad = new C3.Adam(W * H, 0.05); hist = [C3.edPenalty(a, W, H, n, 100).P]; k = 0; };
  const draw = () => {
    C3.drawRow(fig, [{ a: Float64Array.from(X) }, { a }], W, H, 3.3, "Penalty radius 4 pixels, β = 100 inside the penalty.", ["start", `after ${k} steps`]);
    const svgp = svg(110, C3.frame(70, 10, 560, 70, 0, 60, 0, hist[0] * 1.05, [0, 30, 60], [0, hist[0]], "step", "P_ED", v => v, v => v.toFixed(2)) + plot(70, 10, 560, 70, hist.map((_, i) => i), hist, 0, 60, 0, hist[0] * 1.05, "#D85A30", 2.5));
    fig.insertAdjacentHTML("beforeend", svgp);
    $("ro").innerHTML = `<div><span>step</span><b>${k}</b></div><div><span>P_ED</span><b>${hist[hist.length - 1].toFixed(4)}</b></div>`;
  };
  $("go").onclick = () => { if (k >= 60) reset(); anim(() => { if (k >= 60) { stopAnim(); return; } const r = C3.edPenalty(a, W, H, n, 100, true), s = ad.step(r.grad.map(v => -v)); for (let i = 0; i < a.length; i++) a[i] = C3.clamp(a[i] + s[i], 0, 1); k++; hist.push(C3.edPenalty(a, W, H, n, 100).P); draw(); }); };
  $("rs").onclick = () => { stopAnim(); reset(); draw(); };
  reset(); draw();
}},

{s: "6. Soft, not a guarantee", t: "Against a figure of merit, the penalty only discourages",
intu: "Now give the penalty an opponent. The stand-in figure of merit here rewards matching the test layout exactly, thin bar, island and all, so it wants the violations. Maximize J = F − wP<sub>ED</sub> with Adam for a chosen weight w. At a small weight the violations survive and only shrink a little. At a medium weight the island goes but part of the bar stays. Only a large weight removes everything, at a visible cost in F. That is what soft means: the penalty sets a price on violations, not a ban. It is why the final design still needs a hard design rule check (Lesson 11).",
eq: "J = F − w P<sub>ED</sub>, &nbsp;&nbsp; stand-in F = 1 − (1/N)Σ(ρ̂<sub>i</sub> − X<sub>i</sub>)²",
sym: [["X", "the test layout, which the stand-in figure of merit wants to reproduce"], ["w", "penalty weight"], ["bar kept", "share of the thin bar still above 0.5"]],
how: ["Choose w and run 60 Adam steps from the test layout.", "The F gradient pulls every pixel back to the layout.", "The penalty gradient pulls violators away (card 3).", "The final design is the balance point, which moves with w."],
say: "The erosion and dilation penalty is soft: it puts a price on small features, so violations can survive when the figure of merit gains enough from them, and a hard check is still needed.",
num: "Ch. 3 says the same about the thesis designs: the penalty does not guarantee the minimum feature size, which is why the hard design rule check follows.",
r(fig, ctl) {
  ctl.innerHTML = sl("w", "Penalty weight w (log)", -1, 1.5, 0.05, 0) + `<div class="row"><button id="go">Run 60 steps</button></div><div class="readout" id="ro"></div>`;
  const { X, W, H } = C3.pattern(), N = W * H, n = 4; let a = Float64Array.from(X), k = 0;
  const stats = () => { let mse = 0; for (let i = 0; i < N; i++) mse += (a[i] - X[i]) ** 2 / N; let bar = 0, bt = 0; for (let y = 40; y < 44; y++) for (let x = 10; x < 90; x++) { bt++; if (a[y * W + x] > 0.5) bar++; } let isl = 0; for (let y = 52; y < 58; y++) for (let x = 17; x < 23; x++) if (a[y * W + x] > 0.5) isl++; return [1 - mse, C3.edPenalty(a, W, H, n, 100).P, bar / bt, isl > 0]; };
  const draw = () => { C3.drawRow(fig, [{ a: Float64Array.from(X) }, { a }], W, H, 3.3, "Penalty radius 4 pixels. The stand-in F wants the left layout.", ["what F wants", `after ${k} steps`]); const [F, P, bk, il] = stats(); $("ro").innerHTML = `<div><span>F</span><b>${F.toFixed(4)}</b></div><div><span>P_ED</span><b>${P.toFixed(3)}</b></div><div><span>bar kept</span><b>${(100 * bk).toFixed(0)} %</b></div><div><span>island</span><b>${il ? "still there" : "gone"}</b></div>`; };
  $("w").oninput = () => { $("wv").textContent = Math.pow(10, +$("w").value).toFixed(2); };
  $("go").onclick = () => { const w = Math.pow(10, +$("w").value); a = Float64Array.from(X); k = 0; const ad = new C3.Adam(N, 0.05);
    anim(() => { if (k >= 60) { stopAnim(); return; } const r = C3.edPenalty(a, W, H, n, 100, true), g = new Float64Array(N); for (let i = 0; i < N; i++) g[i] = -2 * (a[i] - X[i]) / N - w * r.grad[i]; const s = ad.step(g); for (let i = 0; i < N; i++) a[i] = C3.clamp(a[i] + s[i], 0, 1); k++; draw(); }); };
  $("wv").textContent = "1.00"; draw();
}}
],
summary: "The erosion and dilation penalty is P_ED = ‖C(ρ̂) − O(ρ̂)‖₂/√N_p, the root-mean-square difference between the closed and the opened projected design, with smooth closing and opening built from filters and projections at thresholds 0.01 and 0.99. It is near zero for a design with no feature or gap narrower than about 1.75 times the penalty radius, and grows for thin bars, narrow gaps, islands, holes and sharp corners. Its gradient pushes violators to vanish or fill. It is subtracted with weight min(1, β/25), so it acts only once the design is nearly binary. It is soft: it discourages violations but does not guarantee their absence.",
sheet: [
["P<sub>ED</sub> = ‖C(ρ̂) − O(ρ̂)‖<sub>2</sub>/√N<sub>p</sub>", "Erosion and dilation penalty (Ch. 3 Eq. 3.16)"],
["C = E∘D, &nbsp; O = D∘E, &nbsp; E = P<sub>β,0.99</sub>∘filter, &nbsp; D = P<sub>β,0.01</sub>∘filter", "Smooth closing and opening (Tidy3D)"],
["J = FOM − min(1, β/25) P<sub>ED</sub>", "Weight ramp (Ch. 3 Eq. 3.16)"],
["P<sub>ED</sub> ≈ 0 for features and gaps wider than 2R − Δ ≈ 1.75R", "Meaning of the radius"]],
consts: "Penalty β = 100, thresholds 0.99 and 0.01, edge-renormalized conic filter. The figure of merit in card 6 is a stand-in that rewards matching a layout.",
sources: ["Flexcompute, Tidy3D 2.11.2 source: plugins/autograd/invdes/penalties.py (ErosionDilationPenalty), plugins/invdes/penalty.py, plugins/invdes/region.py", "Hammond et al., Opt. Express 29, 23916 (2021) (differentiable morphology, violators removed, constraints switched on late)", "Christiansen and Sigmund, J. Opt. Soc. Am. B 38, 496 (2021) (eroded and dilated designs, weak length scale of the filter)"]
});

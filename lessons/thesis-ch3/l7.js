addLesson("thesis", "ch3", {
level: "Core",
id: "thesis-ch3-l7", title: "Projection and β continuation", short: "7. Projection and β",
big: String.raw`After filtering, a smooth tanh step pushes each density toward 0 or 1. Its sharpness \(\beta\) decides how binary the design becomes, and its threshold \(\eta\) decides where the step sits. A large \(\beta\) gives a nearly black and white design but a badly conditioned problem, because the gradient survives only in the few pixels whose filtered value is close to \(\eta\). A small \(\beta\) gives a smooth problem whose best design is grey. The standard answer is continuation: start with a small \(\beta\) so the layout can form, raise it in stages so it becomes binary, and threshold the result at the end. Shifting \(\eta\) instead of \(\beta\) grows or shrinks every feature, which models over- and under-etching and leads directly to erosion and dilation.`,
bridge: String.raw`This is Ch. 3 Sec. 3.3, Eq. (3.10), and the projection continuation of Sec. 3.5 with Fig. 3.2. The projection is Christiansen and Sigmund's Eq. (18), identical to Tidy3D's \(\mathtt{tanh\_projection}\). Their tutorial explains why \(\beta\) is raised from a low to a high value and shows eroded, nominal and dilated designs for robustness, as do Hammond et al.`,
cards: [
{s: "1. The projection", t: "A smooth step with sharpness β and threshold η",
intu: String.raw`The projection maps a filtered density \(\tilde\rho\) to \(\hat\rho\). For \(\beta\) near 1 it is almost the identity (dotted). As \(\beta\) grows, values above \(\eta\) are pushed toward 1 and values below toward 0, and the curve approaches a step at \(\eta\). The normalization keeps \(\hat\rho(0) = 0\) and \(\hat\rho(1) = 1\) for any \(\beta\) and \(\eta\). Move \(\beta\) and \(\eta\).`,
eq: String.raw`\[ \hat\rho = \frac{\tanh(\beta\eta) + \tanh(\beta(\tilde\rho - \eta))}{\tanh(\beta\eta) + \tanh(\beta(1 - \eta))} \]<div class="eqref">Ch. 3 Eq. (3.10), Christiansen Eq. 18</div>`,
sym: [[String.raw`\(\tilde\rho\)`, "filtered density, input"], [String.raw`\(\hat\rho\)`, String.raw`projected density, sets \(\varepsilon\) (Eq. 3.11)`], [String.raw`\(\beta\)`, "sharpness"], [String.raw`\(\eta\)`, "threshold, 0.5 for the nominal design"]],
how: [String.raw`\(\tanh(\beta(\tilde\rho - \eta))\) is a smooth step centered at \(\eta\).`, String.raw`Adding \(\tanh(\beta\eta)\) makes it zero at \(\tilde\rho = 0\).`, String.raw`Dividing by its value at \(\tilde\rho = 1\) makes it one there.`, String.raw`For \(\beta \to \infty\) it becomes the hard threshold at \(\eta\).`],
say: String.raw`The tanh projection is a smooth threshold whose sharpness \(\beta\) is raised during the optimization, pushing the filtered densities toward 0 or 1.`,
num: String.raw`Christiansen and Sigmund: at \(\beta = 1\) the thresholding has little effect. At \(\beta = 100\) and \(\eta = 0.5\), \(\tilde\rho = 0.52\) already gives \(\hat\rho = 0.98\).`,
r(fig, ctl) {
  ctl.innerHTML = sl("b", "β (log scale)", 0, 2.3, 0.01, 1) + sl("e", "η", 0.05, 0.95, 0.01, 0.5) + '<div class="readout" id="ro"></div>';
  const xs = range(0, 1, 401);
  const u = () => {
    const b = Math.pow(10, +$("b").value), e = +$("e").value; $("bv").textContent = b.toFixed(b < 10 ? 2 : 0); $("ev").textContent = e.toFixed(2);
    let s = C3.frame(70, 20, 300, 220, 0, 1, 0, 1, [0, 0.5, 1], [0, 0.5, 1], "filtered ρ̃", "projected ρ̂") + plot(70, 20, 300, 220, xs, xs, 0, 1, 0, 1, "var(--p)", 1, "2 3");
    [1, 4, 16].forEach((bb, k) => s += plot(70, 20, 300, 220, xs, xs.map(x => C3.proj(x, bb, e)), 0, 1, 0, 1, "var(--b)", 1));
    s += plot(70, 20, 300, 220, xs, xs.map(x => C3.proj(x, b, e)), 0, 1, 0, 1, "#D85A30", 3) + `<line x1="${C3.X(70, 300, 0, 1)(e)}" x2="${C3.X(70, 300, 0, 1)(e)}" y1="20" y2="240" stroke="#EF9F27" stroke-dasharray="4 3"/>`;
    s += `<text class="ts" x="420" y="60">orange: current β</text><text class="ts" x="420" y="82">grey: β = 1, 4, 16</text><text class="ts" x="420" y="104">dotted: identity</text><text class="ts" x="420" y="126">dashed: threshold η</text>`;
    fig.innerHTML = svg(275, s);
    $("ro").innerHTML = `<div><span>ρ̂(0.4)</span><b>${C3.proj(0.4, b, e).toFixed(3)}</b></div><div><span>ρ̂(0.6)</span><b>${C3.proj(0.6, b, e).toFixed(3)}</b></div><div><span>ρ̂(0), ρ̂(1)</span><b>${C3.proj(0, b, e).toFixed(2)}, ${C3.proj(1, b, e).toFixed(2)}</b></div>`;
  };
  $("b").oninput = u; $("e").oninput = u; u();
}},

{s: "2. Filter then project", t: "The full chain on a map: raw, filtered, projected",
intu: String.raw`The full density chain is raw \(\rho\) → filter → \(\tilde\rho\) → projection → \(\hat\rho\) → \(\varepsilon\). The filter sets the shapes, the projection decides how sharp they are. At small \(\beta\) the projected map is still grey. Raise \(\beta\) and the same shapes become black and white, with a thin grey edge that shrinks as \(\beta\) grows. The readouts measure how binary the design is.`,
eq: String.raw`\[ \rho \to \tilde\rho = \mathrm{filter}(\rho) \to \hat\rho = P_{\beta,\eta}(\tilde\rho) \to \varepsilon(\hat\rho) \]<div class="eqnote">binarization:</div>\[ M = \frac{1}{N} \sum 4\hat\rho\, (1 - \hat\rho) \]`,
sym: [[String.raw`\(M\)`, "0 for a perfectly binary design, 1 if every pixel is 0.5"], ["grey fraction", String.raw`share of pixels with \(0.05 \lt \hat\rho \lt 0.95\)`]],
how: ["The raw map is the same random design as in Lesson 6.", "The filter makes it smooth and grey.", String.raw`The projection sharpens it again, now with smooth outlines of size about \(R\).`, String.raw`Only the edge pixels stay grey at large \(\beta\).`],
say: String.raw`Filtering sets the feature shapes and projection makes them binary, with only the edges left grey at large \(\beta\).`,
num: String.raw`The grey edge is about one pixel wide once \(\beta\) is large enough that the filtered value crosses from 0.05 to 0.95 within one pixel.`,
r(fig, ctl) {
  ctl.innerHTML = sl("b", "β (log scale)", 0, 2.3, 0.01, 0.6) + '<div class="readout" id="ro"></div>';
  const W = 72, H = 50, raw = C3.noise(W, H, 5), f = C3.filter2D(raw, W, H, 3);
  const u = () => {
    const b = Math.pow(10, +$("b").value); $("bv").textContent = b.toFixed(b < 10 ? 2 : 0);
    const p = f.map(v => C3.proj(v, b, 0.5));
    C3.drawRow(fig, [{ a: raw }, { a: f }, { a: p }], W, H, 2.95, "Filter radius 3 pixels, η = 0.5.", ["raw ρ", "filtered ρ̃", "projected ρ̂"]);
    let g = 0, M = 0; p.forEach(v => { if (v > 0.05 && v < 0.95) g++; M += 4 * v * (1 - v); });
    $("ro").innerHTML = `<div><span>grey fraction</span><b>${(100 * g / p.length).toFixed(1)} %</b></div><div><span>binarization M</span><b>${(M / p.length).toFixed(3)}</b></div>`;
  };
  $("b").oninput = u; u();
}},

{s: "3. The slope", t: "At large β the gradient lives only near the threshold",
intu: String.raw`The gradient reaches the filtered density through the slope of the projection. At small \(\beta\) the slope is close to 1 everywhere, so every pixel can change. At large \(\beta\) the slope is huge near \(\eta\) and almost zero elsewhere. Pixels that are already clearly 0 or 1 hardly feel the gradient any more, and the few that do feel it very strongly. This is what a badly conditioned problem looks like. The readout counts the pixels of the map in card 2 whose slope is still at least a tenth of the peak.`,
eq: String.raw`\[ \frac{d\hat\rho}{d\tilde\rho} = \frac{\beta \operatorname{sech}^2(\beta(\tilde\rho - \eta))}{\tanh(\beta\eta) + \tanh(\beta(1 - \eta))} \]\[ \text{peak} \approx \beta/2 \text{ at } \tilde\rho = \eta = 0.5 \text{ for large } \beta \]`,
sym: [[String.raw`\(\operatorname{sech}^2 = 1/\cosh^2\)`, String.raw`a bump of width about \(1/\beta\)`], ["peak", String.raw`slope at \(\tilde\rho = \eta\)`], ["active pixels", "pixels whose slope is at least 10 % of the peak"]],
how: ["Differentiate the projection.", String.raw`The bump has height about \(\beta/2\) and width about \(1/\beta\).`, "So the product of height and width stays about the same, the gradient just concentrates.", "Concentrated gradients make the step size hard to choose: too large for the edge pixels, useless for the rest."],
say: String.raw`At large \(\beta\) the projection slope is large near the threshold and nearly zero elsewhere, so the gradient concentrates on the edges and the problem becomes badly conditioned.`,
num: String.raw`At \(\beta = 100\) the slope at \(\tilde\rho = 0.5\) is 50, while at \(\tilde\rho = 0.6\) it is below 0.01.`,
r(fig, ctl) {
  ctl.innerHTML = sl("b", "β (log scale)", 0, 2.3, 0.01, 1.3) + '<div class="readout" id="ro"></div>';
  const W = 72, H = 50, f = C3.filter2D(C3.noise(W, H, 5), W, H, 3), xs = range(0, 1, 501);
  const u = () => {
    const b = Math.pow(10, +$("b").value); $("bv").textContent = b.toFixed(b < 10 ? 2 : 0);
    const d = xs.map(x => C3.dproj(x, b, 0.5)), pk = C3.dproj(0.5, b, 0.5), ymax = Math.max(1.2, pk * 1.1);
    let s = C3.frame(70, 20, 330, 200, 0, 1, 0, ymax, [0, 0.5, 1], [0, ymax / 2, ymax], "filtered ρ̃", "slope dρ̂/dρ̃", v => v, v => v.toFixed(ymax < 10 ? 1 : 0)) + plot(70, 20, 330, 200, xs, d, 0, 1, 0, ymax, "#7F77DD", 2.5);
    const hist = new Array(25).fill(0); f.forEach(v => hist[Math.min(24, Math.floor(v * 25))]++); const mh = Math.max(...hist);
    hist.forEach((h, i) => s += `<rect x="${C3.X(70, 330, 0, 1)(i / 25) + 1}" y="${220 - 40 * h / mh}" width="${330 / 25 - 2}" height="${40 * h / mh}" fill="var(--b)" opacity="0.6"/>`);
    let act = 0; f.forEach(v => { if (C3.dproj(v, b, 0.5) >= 0.1 * pk) act++; });
    s += `<text class="ts" x="430" y="60">purple: projection slope</text><text class="ts" x="430" y="82">grey bars: how many pixels</text><text class="ts" x="430" y="100">of the card 2 map have</text><text class="ts" x="430" y="118">each filtered value</text>`;
    fig.innerHTML = svg(258, s);
    $("ro").innerHTML = `<div><span>peak slope</span><b>${pk.toFixed(2)}</b></div><div><span>slope at ρ̃ = 0.6</span><b>${C3.dproj(0.6, b, 0.5).toExponential(2)}</b></div><div><span>active pixels</span><b>${(100 * act / f.length).toFixed(1)} %</b></div>`;
  };
  $("b").oninput = u; u();
}},

{s: "4. Continuation", t: "Raising β in stages: a geometric schedule",
intu: String.raw`Continuation runs the optimizer at a fixed \(\beta\) for a number of steps, then raises \(\beta\) and continues. A geometric schedule multiplies \(\beta\) by the same factor at every level, so it spends equal effort on each decade from 1 to \(\beta_{\mathrm{max}}\). Early levels shape the layout while the problem is smooth, late levels make it binary. Change the schedule.`,
eq: String.raw`\[ \beta_k = \beta_{\mathrm{max}}^{k/(L - 1)}, \qquad k = 0, \dots, L - 1 \]\[ \text{each held for } s \text{ steps, total } L \cdot s \text{ steps} \]`,
sym: [[String.raw`\(L\)`, "number of levels"], [String.raw`\(s\)`, "optimizer steps per level"], [String.raw`\(\beta_{\mathrm{max}}\)`, "final sharpness"], ["ratio", String.raw`\(\beta_{k+1}/\beta_k = \beta_{\mathrm{max}}^{1/(L-1)}\)`]],
how: [String.raw`Start at \(\beta = 1\), where the projection is nearly the identity.`, String.raw`Multiply \(\beta\) by a fixed ratio at each level.`, String.raw`Stop at \(\beta_{\mathrm{max}}\), where the projection is close to a step.`, String.raw`Threshold the final design at \(\hat\rho = 0.5\) to make it exactly binary.`],
say: String.raw`\(\beta\) is raised geometrically during the optimization, so the layout forms while the problem is smooth and becomes binary at the end.`,
num: String.raw`Example: \(\beta\) from 1 to 100 in 11 levels of 7 steps gives 77 steps, a ratio of 1.585 per level, and the eighth level is \(\beta = 25.1\). Hammond et al. used three stages, \(\beta = 8\), 16 and 32, with 70 iterations each.`,
r(fig, ctl) {
  ctl.innerHTML = sl("m", "β_max", 10, 200, 5, 100) + sl("L", "Levels L", 2, 15, 1, 11) + sl("s", "Steps per level", 1, 15, 1, 7) + '<div class="readout" id="ro"></div>';
  const u = () => {
    const bm = +$("m").value, L = +$("L").value, st = +$("s").value; $("mv").textContent = bm; $("Lv").textContent = L; $("sv").textContent = st;
    const bs = Array.from({ length: L }, (_, k) => Math.pow(bm, k / (L - 1))), T = L * st;
    const X = C3.X(70, 560, 0, T), Y = v => 210 - Math.log10(v) / Math.log10(250) * 180;
    let s = `<rect x="70" y="30" width="560" height="180" fill="none" stroke="var(--b)"/>`;
    [1, 10, 100].forEach(v => s += `<line x1="66" x2="70" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--p)"/><text class="ts" x="62" y="${Y(v) + 4}" text-anchor="end">${v}</text><line x1="70" x2="630" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--b)" stroke-dasharray="2 4"/>`);
    let d = ""; bs.forEach((b, k) => d += `${k ? "L" : "M"}${X(k * st)} ${Y(b)} L${X((k + 1) * st)} ${Y(b)}`);
    s += `<path d="${d}" fill="none" stroke="#D85A30" stroke-width="2.5"/><text class="ts" x="350" y="236" text-anchor="middle">optimizer step (total ${T})</text><text class="ts" x="30" y="120" transform="rotate(-90 30 120)" text-anchor="middle">β (log)</text>`;
    fig.innerHTML = svg(245, s);
    $("ro").innerHTML = `<div><span>ratio per level</span><b>${Math.pow(bm, 1 / (L - 1)).toFixed(3)}</b></div><div><span>levels</span><b>${bs.map(b => b < 10 ? b.toFixed(1) : b.toFixed(0)).join(", ")}</b></div>`;
  };
  ["m", "L", "s"].forEach(k => $(k).oninput = u); u();
}},

{s: "5. Why gradually", t: "How many pixels can still change, as β grows",
intu: String.raw`Combine cards 3 and 4. For the filtered map of card 2, the curve shows the share of pixels whose projection slope is still at least a tenth of the peak, as a function of \(\beta\). At \(\beta = 1\) every pixel can move, so holes can open and arms can merge. At \(\beta = 100\) fewer than a fifth of the pixels respond, and at \(\beta = 200\) one in ten. This map is still very grey, because it is filtered noise. In a real run the design has moved toward 0 and 1 by then, so even fewer pixels respond: the topology is effectively frozen and only the outlines shift. Raising \(\beta\) slowly gives the layout time to settle before it freezes. Starting at a large \(\beta\) freezes whatever the initial design happens to be.`,
eq: String.raw`\[ \text{active share}(\beta) = \frac{1}{N}\, \#\left\{ i : \frac{d\hat\rho}{d\tilde\rho}(\tilde\rho_i) \ge 0.1 \cdot \text{peak} \right\} \]`,
sym: [["active share", "fraction of pixels that still receive a useful gradient"], ["freezing", "topology fixed, only boundaries move"]],
how: ["Use the slope formula of card 3.", "Evaluate it for every pixel of the filtered map.", "Count the pixels above 10 % of the peak.", String.raw`Repeat for \(\beta\) from 1 to 200.`],
say: String.raw`As \(\beta\) grows, fewer pixels receive a useful gradient, so the topology freezes, which is why \(\beta\) is raised gradually.`,
num: "Christiansen and Sigmund: a sharp threshold early makes the problem badly conditioned and freezes the design too soon.",
r(fig, ctl) {
  ctl.innerHTML = sl("b", "β (log scale)", 0, 2.3, 0.01, 1) + '<div class="readout" id="ro"></div>';
  const W = 72, H = 50, f = C3.filter2D(C3.noise(W, H, 5), W, H, 3), lb = range(0, 2.3, 70);
  const share = b => { const pk = C3.dproj(0.5, b, 0.5); let a = 0; f.forEach(v => { if (C3.dproj(v, b, 0.5) >= 0.1 * pk) a++; }); return a / f.length; };
  const curve = lb.map(l => share(Math.pow(10, l)));
  const u = () => {
    const l = +$("b").value, b = Math.pow(10, l); $("bv").textContent = b.toFixed(b < 10 ? 2 : 0);
    const X = C3.X(70, 560, 0, 2.3), Y = C3.Y(20, 180, 0, 1);
    let s = C3.frame(70, 20, 560, 180, 0, 2.3, 0, 1, [0, 1, 2], [0, 0.5, 1], "β", "active share", v => ["1", "10", "100"][v], v => (100 * v).toFixed(0) + " %") + plot(70, 20, 560, 180, lb, curve, 0, 2.3, 0, 1, "#1D9E75", 2.5);
    const sh = share(b); s += `<circle cx="${X(l)}" cy="${Y(sh)}" r="6" fill="#D85A30"/>`;
    fig.innerHTML = svg(240, s);
    $("ro").innerHTML = `<div><span>β</span><b>${b.toFixed(b < 10 ? 2 : 0)}</b></div><div><span>pixels still active</span><b>${(100 * sh).toFixed(1)} %</b></div>`;
  };
  $("b").oninput = u; u();
}},

{s: "6. Shifting η", t: "Moving the threshold: eroded, nominal and dilated designs",
intu: String.raw`Keep \(\beta\) large and move \(\eta\) instead. A threshold above 0.5 keeps only pixels whose filtered value is high, deep inside the features: every GaAs feature shrinks, as if over-etched. A threshold below 0.5 keeps more: every feature grows, as if under-etched. Christiansen and Sigmund, and Hammond et al., use these eroded, nominal and dilated designs to make devices robust to etch bias. Pushing \(\eta\) almost to 1 or 0 turns the projection into a morphological erosion or dilation, the subject of the next lesson.`,
eq: String.raw`\[ \text{eroded: } \eta = 0.5 + \delta, \qquad \text{nominal: } \eta = 0.5, \qquad \text{dilated: } \eta = 0.5 - \delta \]`,
sym: [[String.raw`\(\delta\)`, "threshold shift"], ["eroded", "GaAs shrinks, gaps widen (over-etch)"], ["dilated", "GaAs grows, gaps narrow (under-etch)"], ["edge shift", String.raw`the boundary moves by roughly \(\delta\) divided by the slope of \(\tilde\rho\) across the edge`]],
how: ["The filtered map changes smoothly across each edge.", "Moving the threshold up or down moves the 0.5 contour inward or outward.", String.raw`Because \(\tilde\rho\) is smooth on the scale \(R\), the shift is nearly uniform along the outline.`, String.raw`With \(\eta = 0.99\) or 0.01 the shift is close to the full filter radius: erosion and dilation (Lesson 8).`],
say: "Shifting the projection threshold above or below 0.5 erodes or dilates every feature, which models over- and under-etching.",
num: "Hammond et al. build eroded and dilated designs that differ from the blueprint by a set distance, for example ±20 nm, and optimize the worst of the three. It costs two extra simulations per step.",
r(fig, ctl) {
  ctl.innerHTML = sl("d", "Threshold shift δ", 0, 0.45, 0.01, 0.2) + '<div class="readout" id="ro"></div>';
  const W = 72, H = 50, f = C3.filter2D(C3.noise(W, H, 9), W, H, 3);
  const u = () => {
    const d = +$("d").value; $("dv").textContent = d.toFixed(2);
    const P = e => f.map(v => C3.proj(v, 60, e)), D = P(0.5 - d), N = P(0.5), E = P(0.5 + d), fr = a => (100 * a.reduce((x, y) => x + y, 0) / a.length).toFixed(1) + " %";
    C3.drawRow(fig, [{ a: D }, { a: N }, { a: E }], W, H, 2.95, "β = 60 for all three. Same filtered map.", [`dilated, η = ${(0.5 - d).toFixed(2)}`, "nominal, η = 0.50", `eroded, η = ${(0.5 + d).toFixed(2)}`]);
    $("ro").innerHTML = `<div><span>GaAs fraction dilated</span><b>${fr(D)}</b></div><div><span>nominal</span><b>${fr(N)}</b></div><div><span>eroded</span><b>${fr(E)}</b></div>`;
  };
  $("d").oninput = u; u();
}}
],
summary: String.raw`The tanh projection \(\hat\rho = [\tanh(\beta\eta) + \tanh(\beta(\tilde\rho - \eta))]/[\tanh(\beta\eta) + \tanh(\beta(1 - \eta))]\) pushes filtered densities toward 0 or 1, with sharpness \(\beta\) and threshold \(\eta\). Large \(\beta\) gives a binary design but concentrates the gradient on the edges and freezes the topology, small \(\beta\) keeps the problem smooth but grey. So \(\beta\) is raised geometrically during the optimization, for example from 1 to 100 in 11 levels, and the result is thresholded at 0.5. Shifting \(\eta\) above or below 0.5 erodes or dilates every feature, which models etch bias and leads to the morphological operations of the next lesson.`,
sheet: [
[String.raw`\[ \hat\rho = \frac{\tanh(\beta\eta) + \tanh(\beta(\tilde\rho - \eta))}{\tanh(\beta\eta) + \tanh(\beta(1 - \eta))} \]`, "Projection (Ch. 3 Eq. 3.10, Christiansen Eq. 18)"],
[String.raw`\[ \frac{d\hat\rho}{d\tilde\rho} = \frac{\beta \operatorname{sech}^2(\beta(\tilde\rho - \eta))}{\tanh(\beta\eta) + \tanh(\beta(1 - \eta))} \]`, String.raw`Slope, peak \(\approx \beta/2\) at \(\eta = 0.5\)`],
[String.raw`\[ \beta_k = \beta_{\mathrm{max}}^{k/(L-1)} \]`, "Geometric continuation"],
[String.raw`\[ M = \frac{1}{N} \sum 4\hat\rho\, (1 - \hat\rho) \]`, "Binarization measure (0 = binary)"],
[String.raw`\[ \eta = 0.5 \pm \delta \]`, "Eroded and dilated designs"]],
consts: "Maps: 72 × 50 pixels of uniform random values, conic filter radius 3 pixels.",
sources: ["Christiansen and Sigmund, J. Opt. Soc. Am. B 38, 496 (2021), Eq. (18), continuation, eroded, nominal and dilated designs", "Hammond et al., Opt. Express 29, 23916 (2021) (β stages 8, 16, 32 and robustness to ±20 nm etch bias)", "Flexcompute, Tidy3D 2.11.2 source: plugins/autograd/invdes/projections.py (tanh_projection)"]
});

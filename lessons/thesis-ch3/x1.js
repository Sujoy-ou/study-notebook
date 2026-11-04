/* TODO for this lesson: Beyond the thesis. */
addLesson("thesis", "ch3x", {
level: "Beyond",
id: "thesis-ch3-x1", title: "Projection extras: shifting the threshold", short: "B1. Shifting the threshold",
big: String.raw`After filtering, a smooth tanh step pushes each density toward 0 or 1. Its sharpness \(\beta\) decides how binary the design becomes, and its threshold \(\eta\) decides where the step sits. A large \(\beta\) gives a nearly black and white design but a badly conditioned problem, because the gradient survives only in the few pixels whose filtered value is close to \(\eta\). A small \(\beta\) gives a smooth problem whose best design is grey. The standard answer is continuation: start with a small \(\beta\) so the layout can form, raise it in stages so it becomes binary, and threshold the result at the end. Shifting \(\eta\) instead of \(\beta\) grows or shrinks every feature, which models over- and under-etching and leads directly to erosion and dilation.`,
bridge: String.raw`This is Ch. 3 Sec. 3.3, Eq. (3.10), and the projection continuation of Sec. 3.5 with Fig. 3.2. The projection is Christiansen and Sigmund's Eq. (18), identical to Tidy3D's <code>tanh_projection</code>. Their tutorial explains why \(\beta\) is raised from a low to a high value and shows eroded, nominal and dilated designs for robustness, as do Hammond et al.`,
cards: [
/* from old ch3 L7 card 6 */
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

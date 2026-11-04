/* Beyond the thesis: shifting the projection threshold (not used in the final thesis). */
addLesson("thesis", "ch3x", {
level: "Beyond",
id: "thesis-ch3-x1", title: "Projection extras: shifting the threshold", short: "B1. Shifting the threshold",
big: String.raw`This method is not used in the final thesis, where the projection threshold stays at \(\eta = 0.5\). In the thesis the tanh projection pushes each filtered density toward 0 or 1, and only its sharpness \(\beta\) changes during the run. Here the other knob turns instead. Keep \(\beta\) large and move the threshold \(\eta\) above or below 0.5, and every feature of the design shrinks or grows by nearly the same distance, as if the device were over-etched or under-etched. Christiansen and Sigmund, and Hammond et al., optimize the eroded, nominal and dilated designs together so that the device still works when the etch is a little off. That costs two extra simulations per step. Pushing \(\eta\) almost to 1 or 0 turns the projection into the smooth erosion and dilation of Lesson 8.`,
bridge: String.raw`A short extra beyond the thesis. It uses the projection of Ch. 3 Eq. (3.9), Christiansen and Sigmund's Eq. (18), which is the same as Tidy3D's <code>tanh_projection</code>, and the conic filter of Eq. (3.8). The thesis keeps \(\eta = 0.5\) and raises only \(\beta\) (Lesson 6). The robust eroded, nominal and dilated formulation is described by Christiansen and Sigmund and by Hammond et al. The maps are computed live in your browser.`,
cards: [
/* from old ch3 L7 card 6 */
{s: "1. Shifting η", t: "Moving the threshold: eroded, nominal and dilated designs",
intu: String.raw`Keep \(\beta\) large and move \(\eta\) instead. A threshold above 0.5 keeps only pixels whose filtered value is high, deep inside the features: every GaAs feature shrinks, as if over-etched. A threshold below 0.5 keeps more: every feature grows, as if under-etched. Christiansen and Sigmund, and Hammond et al., use these eroded, nominal and dilated designs to make devices robust to etch bias. Pushing \(\eta\) almost to 1 or 0 turns the projection into a morphological erosion or dilation, the subject of Lesson 8. Press Play to sweep the shift.`,
eq: String.raw`\[ \text{eroded: } \eta = 0.5 + \delta, \qquad \text{nominal: } \eta = 0.5, \qquad \text{dilated: } \eta = 0.5 - \delta \]<div class="eqref">threshold of Ch. 3 Eq. (3.9). The thesis keeps \(\eta = 0.5\)</div>`,
sym: [[String.raw`\(\delta\)`, "threshold shift"], ["eroded", "GaAs shrinks, gaps widen (over-etch)"], ["dilated", "GaAs grows, gaps narrow (under-etch)"], ["edge shift", String.raw`the boundary moves by roughly \(\delta\) divided by the slope of \(\tilde\rho\) across the edge`]],
how: ["The filtered map changes smoothly across each edge.", "Moving the threshold up or down moves the 0.5 contour inward or outward.", String.raw`Because \(\tilde\rho\) is smooth on the scale \(R\), the shift is nearly uniform along the outline.`, String.raw`With \(\eta = 0.99\) or 0.01 the shift is close to the full filter radius: erosion and dilation (Lesson 8).`],
say: "Shifting the projection threshold above or below 0.5 erodes or dilates every feature, which models over- and under-etching.",
num: "Hammond et al. build eroded and dilated designs that differ from the blueprint by a set distance, for example ±20 nm, and optimize the worst of the three. It costs two extra simulations per step.",
r(fig, ctl) {
  ctl.innerHTML = sl("d", "Threshold shift δ", 0, 0.45, 0.01, 0.2) + '<div class="row"><button id="xp">Play sweep</button></div><div class="readout" id="ro"></div>';
  const W = 72, H = 50, f = C3.filter2D(C3.noise(W, H, 9), W, H, 3);
  const u = () => {
    const d = +$("d").value; $("dv").textContent = d.toFixed(2);
    const P = e => f.map(v => C3.proj(v, 60, e)), D = P(0.5 - d), N = P(0.5), E = P(0.5 + d), fr = a => (100 * a.reduce((x, y) => x + y, 0) / a.length).toFixed(1) + " %";
    C3.drawRow(fig, [{ a: D }, { a: N }, { a: E }], W, H, 2.95, "β = 60 for all three. Same filtered map.", [`dilated, η = ${(0.5 - d).toFixed(2)}`, "nominal, η = 0.50", `eroded, η = ${(0.5 + d).toFixed(2)}`]);
    $("ro").innerHTML = `<div><span>GaAs fraction dilated</span><b>${fr(D)}</b></div><div><span>nominal</span><b>${fr(N)}</b></div><div><span>eroded</span><b>${fr(E)}</b></div>`;
  };
  let play = false, ph = 0, last = performance.now();
  $("d").oninput = () => { play = false; $("xp").textContent = "Play sweep"; stopAnim(); u(); };
  $("xp").onclick = () => {
    play = !play; $("xp").textContent = play ? "Pause sweep" : "Play sweep";
    if (!play) { stopAnim(); return; }
    last = performance.now(); ph = Math.asin(Math.min(1, +$("d").value / 0.3));
    anim(() => { if (!fig.isConnected || !play) { stopAnim(); return; } const now = performance.now(); ph += (now - last) / 1000 * 0.9; last = now; $("d").value = (0.3 * Math.abs(Math.sin(ph))).toFixed(2); u(); });
  };
  u();
}}

],
summary: String.raw`Not used in the final thesis, which keeps \(\eta = 0.5\). With a large \(\beta\), shifting the threshold of the tanh projection to \(\eta = 0.5 + \delta\) shrinks every feature (eroded design, like an over-etch) and \(\eta = 0.5 - \delta\) grows it (dilated design, like an under-etch). Because the filtered map is smooth on the scale of the filter radius, the edge moves by nearly the same distance everywhere. Robust topology optimization evaluates the eroded, nominal and dilated designs and optimizes them together, at the cost of two extra simulations per step. Taken to \(\eta \to 1\) or \(0\), the shift becomes the smooth erosion and dilation used by the penalty of Lesson 9.`,
sheet: [
[String.raw`\[ \hat\rho = \frac{\tanh(\beta\eta) + \tanh\big(\beta(\tilde\rho - \eta)\big)}{\tanh(\beta\eta) + \tanh\big(\beta(1-\eta)\big)} \]`, "Projection (Ch. 3 Eq. 3.9, Christiansen Eq. 18), the thesis uses η = 0.5"],
[String.raw`\[ \eta_{\mathrm{eroded}} = 0.5 + \delta, \qquad \eta_{\mathrm{nominal}} = 0.5, \qquad \eta_{\mathrm{dilated}} = 0.5 - \delta \]`, "Eroded, nominal and dilated designs"],
[String.raw`\[ \text{edge shift} \approx \frac{\delta}{\lvert \nabla\tilde\rho \rvert} \]`, "How far an edge moves for a threshold shift"],
[String.raw`\[ \eta \to 0.99 \text{ or } 0.01: \ \text{smooth erosion or dilation} \]`, "The limit used in the morphology lessons"]],
consts: "Maps: 72 × 50 pixels of uniform random values, conic filter radius 3 pixels.",
sources: ["Christiansen and Sigmund, J. Opt. Soc. Am. B 38, 496 (2021), Eq. (18) and the robust eroded, nominal and dilated formulation", "Hammond et al., Opt. Express 29, 23916 (2021) (robustness to etch bias with eroded and dilated designs)", "Flexcompute, Tidy3D 2.11.2 source: plugins/autograd/invdes/projections.py (tanh_projection)"]
});

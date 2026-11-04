addLesson("thesis", "ch3", {
level: "Core",
id: "thesis-ch3-l6", title: "Projection and β continuation", short: "6. Projection and β",
big: String.raw`After filtering, a smooth tanh step pushes each density toward 0 or 1. Its sharpness \(\beta\) decides how binary the design becomes, and its threshold \(\eta\) decides where the step sits, \(\eta = 0.5\) in the thesis. A large \(\beta\) gives a nearly binary design but a poorly conditioned gradient, because the gradient survives only in the few pixels whose filtered value is close to \(\eta\). A small \(\beta\) gives a smooth problem whose optimum is grey. The answer is continuation: start with a small \(\beta\) so the layout can form, and raise it during the optimization so that the design becomes binary. For the PBS, \(\beta\) rises geometrically from 1 to 100 in 11 levels of 7 optimizer steps each, 77 steps in total. At \(\beta = 100\) the projection is close to a step function, and the final design is thresholded at \(\hat\rho = 0.5\).`,
bridge: String.raw`This is the projection of Ch. 3 Sec. 3.3, Eq. (3.9), and the projection continuation of Sec. 3.5 with Fig. 3.2. The projection is Christiansen and Sigmund's Eq. (18), identical to Tidy3D's <code>tanh_projection</code>, and their tutorial explains why \(\beta\) is raised from a low to a high value during the optimization. The permittivity interpolation that follows the projection, Eq. (3.10), is in Lesson 5.`,
cards: [
/* from old ch3 L7 card 1 */
{s: "1. The projection", t: "A smooth step with sharpness β and threshold η",
intu: String.raw`The projection maps a filtered density \(\tilde\rho\) to \(\hat\rho\). For \(\beta\) near 1 it is almost the identity (dotted). As \(\beta\) grows, values above \(\eta\) are pushed toward 1 and values below toward 0, and the curve approaches a step at \(\eta\). The normalization keeps \(\hat\rho(0) = 0\) and \(\hat\rho(1) = 1\) for any \(\beta\) and \(\eta\). Move \(\beta\) and \(\eta\).`,
eq: String.raw`\[ \hat\rho = \frac{\tanh(\beta\eta) + \tanh(\beta(\tilde\rho - \eta))}{\tanh(\beta\eta) + \tanh(\beta(1 - \eta))} \]<div class="eqref">Ch. 3 Eq. (3.9), Christiansen Eq. (18)</div>`,
sym: [[String.raw`\(\tilde\rho\)`, "filtered density, input"], [String.raw`\(\hat\rho\)`, String.raw`projected density, sets \(\varepsilon\) (Eq. 3.10)`], [String.raw`\(\beta\)`, "sharpness, raised from 1 to 100 during the PBS optimization"], [String.raw`\(\eta\)`, "threshold, 0.5 in the thesis"]],
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

/* from old ch3 L7 card 2 */
{s: "2. Filter then project", t: "The full chain on a map: raw, filtered, projected",
intu: String.raw`The full density chain is raw \(\rho\) → filter → \(\tilde\rho\) → projection → \(\hat\rho\) → \(\varepsilon\). The filter sets the shapes, the projection decides how sharp they are. At small \(\beta\) the projected map is still grey. Raise \(\beta\) and the same shapes become black and white, with a thin grey edge that shrinks as \(\beta\) grows. The readouts measure how binary the design is.`,
eq: String.raw`\[ \rho \to \tilde\rho = \mathrm{filter}(\rho) \to \hat\rho = P_{\beta,\eta}(\tilde\rho) \to \varepsilon(\hat\rho) \]<div class="eqnote">binarization:</div>\[ M = \frac{1}{N} \sum 4\hat\rho\, (1 - \hat\rho) \]`,
sym: [[String.raw`\(M\)`, "0 for a perfectly binary design, 1 if every pixel is 0.5"], ["grey fraction", String.raw`share of pixels with \(0.05 \lt \hat\rho \lt 0.95\)`]],
how: ["The raw map is a random design, as in Lesson 5.", "The filter makes it smooth and grey.", String.raw`The projection sharpens it again, now with smooth outlines of size about \(R\).`, String.raw`Only the edge pixels stay grey at large \(\beta\).`],
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

/* from old ch3 L7 card 3 */
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

/* from old ch3 L7 card 4, now the exact PBS schedule, animated */
{s: "4. Continuation", t: "The PBS schedule: β from 1 to 100 in 11 levels of 7 steps",
intu: String.raw`Continuation runs the optimizer at a fixed \(\beta\) for 7 steps, then raises \(\beta\) and continues. The schedule is geometric: every level multiplies \(\beta\) by the same factor, \(100^{1/10} = 1.585\), so the 11 levels run from \(\beta = 1\) to \(\beta = 100\) and spend equal effort on each decade. Early levels shape the layout while the problem is smooth, late levels make it binary. After the last level the design is thresholded at \(\hat\rho = 0.5\). Press Play, or drag the step, and watch the projection (right) steepen and the same filtered map (bottom) turn black and white.`,
eq: String.raw`\[ \beta_k = 100^{\,k/10}, \qquad k = 0, 1, \dots, 10, \qquad \text{each level held for 7 steps} \]\[ \text{after step 77:} \quad \hat\rho \to \begin{cases} 1, & \hat\rho \ge 0.5 \\ 0, & \hat\rho \lt 0.5 \end{cases} \]<div class="eqref">Ch. 3 Sec. 3.5, projection continuation, Fig. 3.2</div>`,
sym: [[String.raw`\(k\)`, "level index, 0 to 10, so 11 levels"], [String.raw`\(\beta_k\)`, String.raw`sharpness at level \(k\): 1, 1.58, 2.51, 3.98, 6.31, 10, 15.8, 25.1, 39.8, 63.1, 100`], ["7 steps", "optimizer steps per level, 77 in total"], ["threshold", String.raw`the final design is made exactly binary at \(\hat\rho = 0.5\)`]],
how: [String.raw`Start at \(\beta = 1\), where the projection is nearly the identity.`, String.raw`Multiply \(\beta\) by \(100^{1/10} = 1.585\) at each new level, every 7 steps.`, String.raw`Stop at \(\beta = 100\), where the projection is close to a step function.`, String.raw`Threshold the final design at \(\hat\rho = 0.5\) to make it exactly binary, ready to be turned into a polygon.`],
say: String.raw`For the PBS, \(\beta\) rises geometrically from 1 to 100 in 11 levels of 7 optimizer steps, 77 steps in total, and the final design is thresholded at 0.5.`,
num: String.raw`The eighth level, \(k = 7\), is \(\beta = 25.1\), the first level at which the erosion and dilation penalty has full weight (Lesson 9). For comparison, Hammond et al. used three stages, \(\beta = 8\), 16 and 32, with 70 iterations each.`,
r(fig, ctl) {
  let k = 0, playing = false;
  ctl.innerHTML = sl("k", "Optimizer step", 0, 77, 1, 0) + `<div class="row"><button id="pl">Play</button><button id="rs">Back to step 0</button></div><div class="readout" id="ro"></div>`;
  fig.innerHTML = `<div id="c4s"></div><div id="c4m"></div>`;
  const W = 72, H = 50, f = C3.filter2D(C3.noise(W, H, 5), W, H, 3), xs = range(0, 1, 201);
  const bOf = k => k >= 77 ? Infinity : Math.pow(100, Math.floor(k / 7) / 10);
  let lastMap = -2;
  const u = () => {
    $("kv").textContent = k === 77 ? "77, threshold" : k;
    const b = bOf(k), lev = Math.min(10, Math.floor(k / 7));
    const X = C3.X(60, 280, 0, 77), Y = v => 190 - Math.log10(v) / 2 * 160;
    let s = `<text class="ts" x="200" y="16" text-anchor="middle">β schedule (log scale)</text><rect x="60" y="30" width="280" height="160" fill="none" stroke="var(--b)"/>`;
    [1, 10, 100].forEach(v => s += `<text class="ts" x="54" y="${Y(v) + 4}" text-anchor="end">${v}</text><line x1="60" x2="340" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--b)" stroke-dasharray="2 4"/>`);
    [0, 35, 77].forEach(v => s += `<text class="ts" x="${X(v)}" y="206" text-anchor="middle">${v}</text>`);
    let d = ""; for (let L = 0; L < 11; L++) { const yb = Y(Math.pow(100, L / 10)); d += `${L ? "L" : "M"}${X(L * 7).toFixed(1)} ${yb.toFixed(1)}L${X((L + 1) * 7).toFixed(1)} ${yb.toFixed(1)}`; }
    s += `<path d="${d}" fill="none" stroke="#D85A30" stroke-width="2.5"/><text class="ts" x="200" y="222" text-anchor="middle">optimizer step</text>`;
    s += `<line x1="${X(Math.min(k, 77))}" x2="${X(Math.min(k, 77))}" y1="30" y2="190" stroke="#7F77DD" stroke-width="2"/>`;
    if (k < 77) s += `<circle cx="${X(k)}" cy="${Y(b)}" r="5" fill="#7F77DD"/>`;
    s += C3.frame(420, 30, 220, 160, 0, 1, 0, 1, [0, 0.5, 1], [0, 0.5, 1], "filtered ρ̃", "") + `<text class="ts" x="530" y="16" text-anchor="middle">projection at this step, η = 0.5</text>`;
    s += plot(420, 30, 220, 160, xs, xs, 0, 1, 0, 1, "var(--p)", 1, "2 3");
    s += plot(420, 30, 220, 160, xs, xs.map(x => k >= 77 ? (x >= 0.5 ? 1 : 0) : C3.proj(x, b, 0.5)), 0, 1, 0, 1, "#D85A30", 2.5);
    $("c4s").innerHTML = svg(232, s);
    const key = k >= 77 ? -1 : lev;
    if (key !== lastMap) {
      lastMap = key;
      const p = f.map(v => k >= 77 ? (C3.proj(v, 100, 0.5) >= 0.5 ? 1 : 0) : C3.proj(v, b, 0.5));
      C3.drawRow($("c4m"), [{ a: f }, { a: p }], W, H, 3.6, k >= 77 ? "Right: after the last level, thresholded at ρ̂ = 0.5." : `Right: the same filtered map projected with β = ${b < 10 ? b.toFixed(2) : b.toFixed(1)}.`, ["filtered ρ̃", "projected ρ̂"]);
    }
    let g = 0; if (k < 77) f.forEach(v => { const q = C3.proj(v, b, 0.5); if (q > 0.05 && q < 0.95) g++; });
    $("ro").innerHTML = `<div><span>level</span><b>${k >= 77 ? "done" : (lev + 1) + " of 11"}</b></div><div><span>β</span><b>${k >= 77 ? "threshold" : b < 10 ? b.toFixed(2) : b.toFixed(1)}</b></div><div><span>grey pixels</span><b>${(100 * g / f.length).toFixed(1)} %</b></div>`;
  };
  const stop = () => { playing = false; stopAnim(); $("pl").textContent = "Play"; };
  $("k").oninput = () => { stop(); k = +$("k").value; u(); };
  $("rs").onclick = () => { stop(); k = 0; $("k").value = 0; u(); };
  $("pl").onclick = () => {
    if (playing) { stop(); return; }
    playing = true; $("pl").textContent = "Pause"; if (k >= 77) k = 0; let last = -1;
    anim(t => { if (!fig.isConnected) { stopAnim(); return; } const n = Math.floor(t * 5); if (n === last) return; last = n; if (k < 77) k++; else { stop(); } $("k").value = k; u(); });
  };
  u();
}},

/* from old ch3 L7 card 5 */
{s: "5. Why gradually", t: "How many pixels can still change, as β grows",
intu: String.raw`Combine cards 3 and 4. For the filtered map of card 2, the curve shows the share of pixels whose projection slope is still at least a tenth of the peak, as a function of \(\beta\). At \(\beta = 1\) every pixel can move, so holes can open and arms can merge. At \(\beta = 100\) fewer than a fifth of the pixels respond, and at \(\beta = 200\) one in ten. This map is still very grey, because it is filtered noise. In a real run the design has moved toward 0 and 1 by then, so even fewer pixels respond: the topology is effectively frozen and only the outlines shift. Raising \(\beta\) slowly gives the layout time to settle before it freezes. Starting at a large \(\beta\) freezes whatever the initial design happens to be.`,
eq: String.raw`\[ \text{active share}(\beta) = \frac{1}{N}\, \#\left\{ i : \frac{d\hat\rho}{d\tilde\rho}(\tilde\rho_i) \ge 0.1 \cdot \text{peak} \right\} \]`,
sym: [["active share", "fraction of pixels that still receive a useful gradient"], ["freezing", "topology fixed, only boundaries move"]],
how: ["Use the slope formula of card 3.", "Evaluate it for every pixel of the filtered map.", "Count the pixels above 10 % of the peak.", String.raw`Repeat for \(\beta\) from 1 to 200.`],
say: String.raw`As \(\beta\) grows, fewer pixels receive a useful gradient, so the topology freezes, which is why \(\beta\) is raised gradually.`,
num: "Christiansen and Sigmund: a sharp threshold early makes the problem badly conditioned and freezes the design too soon.",
r(fig, ctl) {
  ctl.innerHTML = sl("b", "β (log scale)", 0, 2.3, 0.01, 1) + `<div class="row"><button id="pl">Play the 11 levels</button></div><div class="readout" id="ro"></div>`;
  const W = 72, H = 50, f = C3.filter2D(C3.noise(W, H, 5), W, H, 3), lb = range(0, 2.3, 70);
  const share = b => { const pk = C3.dproj(0.5, b, 0.5); let a = 0; f.forEach(v => { if (C3.dproj(v, b, 0.5) >= 0.1 * pk) a++; }); return a / f.length; };
  const curve = lb.map(l => share(Math.pow(10, l)));
  const u = () => {
    const l = +$("b").value, b = Math.pow(10, l); $("bv").textContent = b.toFixed(b < 10 ? 2 : 0);
    const X = C3.X(70, 560, 0, 2.3), Y = C3.Y(20, 180, 0, 1);
    let s = C3.frame(70, 20, 560, 180, 0, 2.3, 0, 1, [0, 1, 2], [0, 0.5, 1], "β", "active share", v => ["1", "10", "100"][v], v => (100 * v).toFixed(0) + " %") + plot(70, 20, 560, 180, lb, curve, 0, 2.3, 0, 1, "#1D9E75", 2.5);
    const sh = share(b); s += `<circle cx="${X(l)}" cy="${Y(sh)}" r="6" fill="#D85A30"/>`;
    for (let L = 0; L < 11; L++) s += `<circle cx="${X(L / 5)}" cy="${Y(share(Math.pow(10, L / 5)))}" r="2.5" fill="#7F77DD"/>`;
    fig.innerHTML = svg(240, s + `<text class="ts" x="80" y="180">purple dots: the 11 levels of the PBS schedule</text>`);
    $("ro").innerHTML = `<div><span>β</span><b>${b.toFixed(b < 10 ? 2 : 0)}</b></div><div><span>pixels still active</span><b>${(100 * sh).toFixed(1)} %</b></div>`;
  };
  let playing = false;
  const stop = () => { playing = false; stopAnim(); $("pl").textContent = "Play the 11 levels"; };
  $("b").oninput = () => { stop(); u(); };
  $("pl").onclick = () => { if (playing) { stop(); return; } playing = true; $("pl").textContent = "Pause"; let last = -1; anim(t => { if (!fig.isConnected) { stopAnim(); return; } const L = Math.floor(t / 0.8); if (L === last) return; last = L; if (L > 10) { stop(); return; } $("b").value = (L / 5).toFixed(2); u(); }); };
  u();
}}

],
summary: String.raw`The tanh projection \(\hat\rho = [\tanh(\beta\eta) + \tanh(\beta(\tilde\rho - \eta))]/[\tanh(\beta\eta) + \tanh(\beta(1 - \eta))]\), Eq. (3.9), pushes filtered densities toward 0 or 1, with sharpness \(\beta\) and threshold \(\eta = 0.5\). Large \(\beta\) gives a binary design but concentrates the gradient on the edges and freezes the topology, small \(\beta\) keeps the problem smooth but grey. So \(\beta\) is raised during the optimization. For the PBS it rises geometrically from 1 to 100 in 11 levels of 7 optimizer steps, 77 steps in total, and the final design is thresholded at \(\hat\rho = 0.5\).`,
sheet: [
[String.raw`\[ \hat\rho = \frac{\tanh(\beta\eta) + \tanh(\beta(\tilde\rho - \eta))}{\tanh(\beta\eta) + \tanh(\beta(1 - \eta))} \]`, String.raw`Projection, \(\eta = 0.5\) (Ch. 3 Eq. 3.9, Christiansen Eq. 18)`],
[String.raw`\[ \frac{d\hat\rho}{d\tilde\rho} = \frac{\beta \operatorname{sech}^2(\beta(\tilde\rho - \eta))}{\tanh(\beta\eta) + \tanh(\beta(1 - \eta))} \]`, String.raw`Slope, peak \(\approx \beta/2\) at \(\eta = 0.5\)`],
[String.raw`\[ \beta_k = 100^{\,k/10}, \qquad k = 0, \dots, 10 \]`, "PBS continuation: 11 levels of 7 steps, 77 steps (Sec. 3.5)"],
[String.raw`\[ \hat\rho \ge 0.5 \;\to\; 1, \qquad \hat\rho \lt 0.5 \;\to\; 0 \]`, "Final threshold after the last level"],
[String.raw`\[ M = \frac{1}{N} \sum 4\hat\rho\, (1 - \hat\rho) \]`, "Binarization measure used in card 2 (0 = binary)"]],
consts: "Maps: 72 × 50 pixels of uniform random values, conic filter radius 3 pixels.",
sources: ["Christiansen and Sigmund, J. Opt. Soc. Am. B 38, 496 (2021), Eq. (18) and the continuation of the projection sharpness", "Hammond et al., Opt. Express 29, 23916 (2021) (β stages 8, 16 and 32, quoted for comparison)", "Flexcompute, Tidy3D 2.11.2 source: plugins/autograd/invdes/projections.py (tanh_projection)"]
});

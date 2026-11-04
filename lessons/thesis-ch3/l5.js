/* helpers for this lesson only (prefix C3L5_) */
const C3L5_ease = x => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x);
const C3L5_steps = (fig, ctl, n, dur, draw, idp) => {
  ctl.insertAdjacentHTML("beforeend", `<div class="row"><button id="${idp}b">Back</button><button id="${idp}p">Pause</button><button id="${idp}n">Next step</button><span id="${idp}s" style="font-size:13px;color:var(--muted);margin-left:6px"></span></div>`);
  const S = { k: 1, play: true, t: 0 };
  let last = performance.now();
  const ui = () => { $(idp + "s").textContent = `step ${S.k} of ${n}`; $(idp + "b").disabled = S.k === 1; $(idp + "n").disabled = S.k === n; $(idp + "p").textContent = S.play ? "Pause" : "Play"; };
  S.go = k => { S.k = Math.max(1, Math.min(n, k)); S.t = 0; ui(); draw(S); };
  $(idp + "b").onclick = () => { S.play = false; S.go(S.k - 1); };
  $(idp + "n").onclick = () => { S.play = false; S.go(S.k + 1); };
  $(idp + "p").onclick = () => { S.play = !S.play; if (S.play && S.k === n) S.go(1); ui(); };
  ui();
  anim(() => {
    if (!fig.isConnected) { stopAnim(); return; }
    const now = performance.now(), dt = Math.min(0.1, (now - last) / 1000); last = now; S.t += dt;
    if (S.play && S.t > dur) { if (S.k < n) { S.k++; S.t = 0; } else S.play = false; ui(); }
    draw(S);
  });
  return S;
};
addLesson("thesis", "ch3", {
level: "Core",
id: "thesis-ch3-l5", title: "Density topology: pixels and the conic filter", short: "5. Pixels and the filter",
big: String.raw`In topology optimization the design region is a grid of pixels, each with a density \(\rho\) between 0 (air) and 1 (GaAs), and the permittivity is interpolated linearly between the two materials. This gives the optimizer complete freedom, including the freedom to make single-pixel features and grey pixels that are neither air nor GaAs, which cannot be fabricated and have no physical meaning. The first fix is a filter: each pixel is replaced by a weighted average over a disk of radius \(R\), with weights that fall off linearly like a cone. The filter removes pixel-scale noise and gives the design a weak sense of length scale. On its own it makes the design greyer, which is why a projection follows (Lesson 6).`,
bridge: String.raw`This is Ch. 3 Sec. 3.3, Eqs. (3.8) and (3.10). Christiansen and Sigmund 2021 (DTU, the Sigmund group) is a tutorial on exactly this recipe for photonics: their Eqs. (9) and (19) give the linear interpolation, and they explain why naive optimization produces pixel-by-pixel designs. Their filter is a PDE (Helmholtz) filter, Eq. (17). The conic filter used here is Tidy3D's (<code>_kernel_conic</code>, <code>make_kernel</code>, <code>get_kernel_size_px</code>), so Eq. (3.8) cites Tidy3D. All maps below are computed in your browser.`,
cards: [
/* from old ch3 L6 card 1 */
{s: "1. Pixels", t: "A density per pixel, interpolated between air and GaAs",
intu: String.raw`Each pixel carries a density \(\rho\). The permittivity is linear in \(\rho\): 1 for air at \(\rho = 0\), 12.19 for GaAs at \(\rho = 1\). A design can start from a rough drawing, here a Y-shaped splitter with dense arms on a light background. Any value in between is a grey material that does not exist: at \(\rho = 0.5\) the index would be about 2.6. The optimizer has to be pushed toward 0 and 1, otherwise its best design may rely on such fictitious material. Change the arm and background densities.`,
eq: String.raw`\[ \varepsilon = \varepsilon_{\mathrm{air}} + \hat\rho\, (\varepsilon_{\mathrm{GaAs}} - \varepsilon_{\mathrm{air}}) \]<div class="eqref">Ch. 3 Eq. (3.10), Christiansen Eqs. 9 and 19</div>`,
sym: [[String.raw`\(\rho\)`, String.raw`raw density of a pixel, the design variable, in \([0, 1]\)`], [String.raw`\(\hat\rho\)`, String.raw`density after filter and projection, the one that sets \(\varepsilon\) (Lesson 6)`], [String.raw`\(\varepsilon_{\mathrm{air}} = 1, \varepsilon_{\mathrm{GaAs}} = 12.19\)`, String.raw`the two materials (\(n = 3.492\))`]],
how: ["Discretize the design region into square pixels.", "Give each pixel a continuous density so that gradients exist.", String.raw`Interpolate \(\varepsilon\) linearly, as Christiansen and Sigmund do.`, String.raw`Only \(\rho = 0\) and \(\rho = 1\) correspond to real materials.`],
say: "Each pixel has a density between 0 and 1, and its permittivity is a linear interpolation between air and GaAs, so only the end values are physical.",
num: String.raw`\(\rho = 0.5\) gives \(\varepsilon = 6.6\) and \(n = 2.57\). \(\rho = 0.9\) gives \(\varepsilon = 11.1\) and \(n = 3.33\).`,
r(fig, ctl) {
  ctl.innerHTML = sl("a", "Arm density", 0, 1, 0.01, 0.9) + sl("b", "Background density", 0, 1, 0.01, 0.1) + '<div class="readout" id="ro"></div>';
  const W = 90, H = 60;
  const u = () => {
    const ra = +$("a").value, rb = +$("b").value; $("av").textContent = ra.toFixed(2); $("bv").textContent = rb.toFixed(2);
    const a = new Float64Array(W * H).fill(rb);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const yc = H / 2, t = Math.max(0, (x - 30) / 60), off = 18 * t * t * (3 - 2 * t);
      if (x < 32 && Math.abs(y + 0.5 - yc) < 5) a[y * W + x] = ra;
      if (x >= 28 && (Math.abs(y + 0.5 - (yc - off)) < 5 || Math.abs(y + 0.5 - (yc + off)) < 5)) a[y * W + x] = ra;
    }
    C3.draw(fig, a, W, H, 6, "Starting density image. Dark is GaAs (ρ = 1), white is air (ρ = 0).");
    const e = r => 1 + r * 11.19;
    $("ro").innerHTML = `<div><span>arm: ε / n</span><b>${e(ra).toFixed(2)} / ${Math.sqrt(e(ra)).toFixed(2)}</b></div><div><span>background: ε / n</span><b>${e(rb).toFixed(2)} / ${Math.sqrt(e(rb)).toFixed(2)}</b></div><div><span>physical?</span><b>${(ra === 0 || ra === 1) && (rb === 0 || rb === 1) ? "yes" : "no, grey"}</b></div>`;
  };
  $("a").oninput = u; $("b").oninput = u; u();
}},

/* from old ch3 L6 card 2 */
{s: "2. Raw pixels", t: "What an unconstrained pixel optimization produces",
intu: "Left free, the optimizer exploits every pixel. Christiansen and Sigmund observe pixel-by-pixel varying regions in a naive optimization, and features of single pixels. Such patterns can be fine in simulation, partly because a pixel-size feature is poorly resolved by the grid, but they cannot be written by lithography. The two maps show the typical symptoms: speckle of single pixels and large grey regions. The readouts count them.",
eq: String.raw`\[ \text{smallest feature without a filter: one pixel, } \Delta \]\[ \text{grey fraction} = \text{share of pixels with } 0.05 \lt \rho \lt 0.95 \]`,
sym: [[String.raw`\(\Delta\)`, "pixel size, about 10 nm in a typical 3D design"], ["grey fraction", "a simple measure of how far the design is from binary"]],
how: ["Each pixel is an independent variable with its own gradient.", "Nothing couples neighbors, so the optimum can vary from pixel to pixel.", "Grey values are often optimal for a continuous problem.", "Both effects are removed by the filter (this lesson) and the projection (Lesson 6)."],
say: "Without regularization the optimizer produces single-pixel features and grey regions, which is why a filter and a projection are added.",
num: "At 10 nm pixels a single-pixel feature is 10 nm, an order of magnitude below a typical electron-beam lithography rule of about 100 nm.",
r(fig, ctl) {
  const W = 90, H = 60, r = C3.rng(12), sp = new Float64Array(W * H), gr = new Float64Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const base = Math.sin(x / 9) * Math.cos(y / 7) > 0 ? 1 : 0; sp[y * W + x] = r() < 0.18 ? 1 - base : base; gr[y * W + x] = C3.clamp(0.5 + 0.55 * Math.sin(x / 11 + 0.6 * Math.sin(y / 9)) * Math.cos(y / 13), 0, 1); }
  const stats = a => { let g = 0; a.forEach(v => { if (v > 0.05 && v < 0.95) g++; }); const B = Uint8Array.from(a, v => v > 0.5 ? 1 : 0), cs = C3.components(B, W, H, 1).concat(C3.components(B, W, H, 0)); return [g / a.length, cs.filter(c => c.area === 1).length]; };
  const s1 = stats(sp), s2 = stats(gr);
  C3.drawRow(fig, [{ a: sp }, { a: gr }], W, H, 3.6, "Two typical symptoms of an unregularized design.", ["speckle of single pixels", "grey regions"]);
  ctl.innerHTML = `<div class="readout"><div><span>speckle: single-pixel islands and holes</span><b>${s1[1]}</b></div><div><span>grey map: grey fraction</span><b>${(100 * s2[0]).toFixed(0)} %</b></div></div>`;
}},

/* from old ch3 L6 card 3 */
{s: "3. The conic kernel", t: "The conic filter kernel and its rounded radius",
intu: String.raw`The filter replaces each pixel by a weighted average of its neighbors. The weight falls linearly from 1 at the center to 0 at a radius \(\tilde R\), like a cone. Because the kernel lives on the pixel grid, Tidy3D rounds the radius up to a whole number of pixels, \(\tilde R = \lceil R/\Delta \rceil \Delta\), and builds a kernel of \(2\lceil R/\Delta \rceil + 1\) pixels per side. Pixels at exactly \(\tilde R\) get zero weight. Change \(R/\Delta\) and watch the rounding.`,
eq: String.raw`\[ \tilde\rho_{i} = \frac{\sum_{j} K(d_{ij})\,\rho_{j}}{\sum_{j} K(d_{ij})}, \qquad K(d) = \max\!\left(0,\,1 - \frac{d}{R}\right) \]<div class="eqref">Ch. 3 Eq. (3.8)</div><div class="eqnote">Tidy3D rounds the radius up to whole pixels:</div>\[ \tilde R = \lceil R/\Delta \rceil \Delta \]`,
sym: [[String.raw`\(\tilde\rho_i\)`, String.raw`filtered density of pixel \(i\)`], [String.raw`\(d_{ij}\)`, String.raw`distance between the centers of pixels \(i\) and \(j\)`], [String.raw`\(K\)`, "cone-shaped weight"], [String.raw`\(R\)`, "requested filter radius"], [String.raw`\(\tilde R\)`, "radius actually used, rounded up to whole pixels"], [String.raw`\(\Delta\)`, "pixel size"]],
how: [String.raw`Choose a radius \(R\) in nanometers.`, String.raw`Convert to pixels and round up: \(n = \lceil R/\Delta \rceil\).`, String.raw`Build a \((2n + 1) \times (2n + 1)\) kernel with \(K = \max(0, 1 - d/(n\Delta))\).`, "Normalize by the sum of the weights so a uniform design stays uniform."],
say: "The conic filter averages the densities with weights that fall linearly to zero at the radius, which Tidy3D rounds up to a whole number of pixels.",
num: String.raw`Example: \(R = 100\) nm on 9 nm pixels gives \(\lceil 11.1 \rceil = 12\) pixels, \(\tilde R = 108\) nm, a kernel of 25 × 25 pixels. A radius of one pixel leaves only the center weight, so the filter does nothing.`,
r(fig, ctl) {
  ctl.innerHTML = sl("R", "R / Δ (radius in pixels, before rounding)", 1, 8, 0.1, 3.4) + '<div class="readout" id="ro"></div>';
  const u = () => {
    const Rq = +$("R").value, n = Math.ceil(Rq - 1e-9); $("Rv").textContent = Rq.toFixed(1);
    const K = C3.kernel2D(n), c = Math.min(14, 200 / (2 * n + 1));
    let s = `<text class="ts" x="${40 + (2 * n + 1) * c / 2}" y="22" text-anchor="middle">kernel, ${2 * n + 1} × ${2 * n + 1} pixels</text>`;
    for (let dy = -n; dy <= n; dy++) for (let dx = -n; dx <= n; dx++) { const w = Math.max(0, 1 - Math.hypot(dx, dy) / n); s += `<rect x="${40 + (dx + n) * c}" y="${32 + (dy + n) * c}" width="${c - 0.6}" height="${c - 0.6}" fill="${w > 0 ? "#D85A30" : "var(--sunk)"}" fill-opacity="${w > 0 ? 0.12 + 0.88 * w : 1}"/>`; }
    const X = C3.X(330, 310, -8.5, 8.5), Y = C3.Y(40, 160, 0, 1.1), rs = range(-8.5, 8.5, 341);
    s += C3.frame(330, 40, 310, 160, -8.5, 8.5, 0, 1.1, [-8, -4, 0, 4, 8], [0, 0.5, 1], "distance (pixels)", "K");
    s += plot(330, 40, 310, 160, rs, rs.map(r => Math.max(0, 1 - Math.abs(r) / n)), -8.5, 8.5, 0, 1.1, "#D85A30", 2.5) + plot(330, 40, 310, 160, rs, rs.map(r => Math.max(0, 1 - Math.abs(r) / Rq)), -8.5, 8.5, 0, 1.1, "var(--p)", 1.5, "4 3");
    for (let d = -n; d <= n; d++) s += `<circle cx="${X(d)}" cy="${Y(Math.max(0, 1 - Math.abs(d) / n))}" r="3" fill="#D85A30"/>`;
    s += C3.legend(330, 262, [["used, R̃", "#D85A30"], ["requested R", "var(--p)", "4 3"]]);
    fig.innerHTML = svg(272, s);
    $("ro").innerHTML = `<div><span>⌈R/Δ⌉</span><b>${n} pixels</b></div><div><span>R̃ / R</span><b>${(n / Rq).toFixed(3)}</b></div><div><span>nonzero weights</span><b>${K.length}</b></div>`;
  };
  $("R").oninput = u; u();
}},

/* from old ch3 L6 card 4 */
{s: "4. Filtering", t: "The filter removes pixel noise and makes the design grey",
intu: String.raw`Apply the filter to a map of random pixel values. Small-scale variation is averaged out and smooth blobs of size about \(R\) remain. Notice the side effect: the filtered values bunch up around the mean, 0.5. The filter alone turns a noisy design into a grey one. That is the reason a projection always follows the filter. Change the radius, or press Play to grow it step by step.`,
eq: String.raw`\[ \tilde\rho = \frac{K \ast \rho}{K \ast 1} \qquad (\text{normalized convolution}) \]`,
sym: [[String.raw`\(\ast\)`, "convolution over the pixel grid"], [String.raw`\(K \ast 1\)`, "sum of the weights inside the region, which normalizes at the edges"], ["std", "spread of the values around their mean"]],
how: ["Each filtered pixel is a weighted mean of many raw pixels.", "Means of many random values cluster near their average.", String.raw`So the spread shrinks roughly like \(1/\sqrt{\text{number of pixels in the kernel}}\).`, String.raw`Spatial features smaller than about \(R\) are averaged away.`],
say: String.raw`The filter smooths the design over a radius \(R\), removing pixel-scale features, but it also pushes values toward grey.`,
num: "Raw uniform random values have a spread of 0.29. After a filter of radius 3 pixels it drops to 0.07, and at 4 pixels to 0.05, so almost every pixel is grey.",
r(fig, ctl) {
  ctl.innerHTML = sl("n", "Filter radius (pixels)", 1, 8, 1, 4) + '<div class="row"><button id="fp">Play: grow the radius</button></div><div class="readout" id="ro"></div>';
  const W = 90, H = 60, raw = C3.noise(W, H, 77);
  const sd = a => { const m = a.reduce((x, y) => x + y, 0) / a.length; return Math.sqrt(a.reduce((x, y) => x + (y - m) ** 2, 0) / a.length); };
  const u = () => {
    const n = +$("n").value; $("nv").textContent = n; const f = C3.filter2D(raw, W, H, n);
    C3.drawRow(fig, [{ a: raw }, { a: f }], W, H, 3.6, "Same colors as before: dark 1, white 0, grey in between.", ["raw ρ", "filtered ρ̃"]);
    let g = 0; f.forEach(v => { if (v > 0.05 && v < 0.95) g++; });
    $("ro").innerHTML = `<div><span>spread raw / filtered</span><b>${sd(raw).toFixed(3)} / ${sd(f).toFixed(3)}</b></div><div><span>grey fraction after filter</span><b>${(100 * g / f.length).toFixed(0)} %</b></div>`;
  };
  let play = false, tt = 0, last = 0;
  $("n").oninput = () => { play = false; $("fp").textContent = "Play: grow the radius"; stopAnim(); u(); };
  $("fp").onclick = () => {
    play = !play; $("fp").textContent = play ? "Pause" : "Play: grow the radius";
    if (!play) { stopAnim(); return; }
    last = performance.now(); tt = 0; $("n").value = 1; u();
    anim(() => { if (!fig.isConnected || !play) { stopAnim(); return; } const now = performance.now(); tt += (now - last) / 1000; last = now; if (tt > 1.1) { tt = 0; const n = +$("n").value; $("n").value = n >= 8 ? 1 : n + 1; u(); } });
  };
  u();
}},

/* from old ch3 L6 card 5 */
{s: "5. A weak length scale", t: "Filter, then threshold: features grow with R, but no guarantee",
intu: String.raw`Threshold the filtered map at 0.5 to see the shapes it encodes. A larger radius gives larger features, so the filter does set a length scale. Christiansen and Sigmund call it a weak sense of length scale, because nothing forbids a thin neck or a tiny island where the filtered value happens to cross 0.5. The readout tracks the smallest island or hole. Change \(R\) and look for small features.`,
eq: String.raw`\[ \text{binary design: } \hat\rho = 1 \text{ if } \tilde\rho \gt 0.5, \text{ else } 0 \]<div class="eqref">the limit \(\beta \to \infty\) of the projection, Lesson 6</div>`,
sym: [["island", "connected GaAs region"], ["hole", "connected air region surrounded by GaAs"], ["smallest feature", "area of the smallest island or hole, in pixels"]],
how: [String.raw`Filtering limits how fast \(\tilde\rho\) can vary in space.`, String.raw`So the 0.5 contour cannot wiggle on scales much below \(R\).`, "But the contour can still pass close to itself, making thin necks and small islands.", "A hard guarantee needs more: the erosion and dilation penalty (Lesson 9) and a design rule check (Lesson 11)."],
say: "The filter radius sets a typical feature size, but only a weak one: it does not guarantee a minimum feature size.",
num: "In Christiansen and Sigmund's metalens, filtering and thresholding removed the pixel-scale features at a cost of only about 1 % of the figure of merit.",
r(fig, ctl) {
  ctl.innerHTML = sl("n", "Filter radius (pixels)", 1, 8, 1, 3) + '<div class="readout" id="ro"></div>';
  const W = 90, H = 60, raw = C3.noise(W, H, 5);
  const u = () => {
    const n = +$("n").value; $("nv").textContent = n; const f = C3.filter2D(raw, W, H, n), b = Uint8Array.from(f, v => v > 0.5 ? 1 : 0);
    const isl = C3.components(b, W, H, 1), hol = C3.components(b, W, H, 0).filter(c => !c.edge), all = isl.concat(hol), mn = all.length ? Math.min(...all.map(c => c.area)) : 0;
    const small = new Uint8Array(W * H); const lab1 = C3.label(b, W, H), sz = {}; lab1.forEach(l => { if (l >= 0) sz[l] = (sz[l] || 0) + 1; }); lab1.forEach((l, i) => { if (l >= 0 && sz[l] <= Math.max(4, n * n)) small[i] = 1; });
    C3.drawRow(fig, [{ a: f }, { a: b, over: [[small, [216, 90, 48]]] }], W, H, 3.6, "Right: thresholded at 0.5. Islands no larger than R² pixels are marked orange.", ["filtered ρ̃", "thresholded"]);
    $("ro").innerHTML = `<div><span>islands / holes</span><b>${isl.length} / ${hol.length}</b></div><div><span>smallest island or hole</span><b>${mn} px</b></div><div><span>R²</span><b>${n * n} px</b></div>`;
  };
  $("n").oninput = u; u();
}},

/* from old ch3 L6 card 6 */
{s: "6. Gradients through the filter", t: "The filter smooths the gradient too",
intu: "The chain rule passes the gradient back through the filter. Because the conic kernel is symmetric, the backward pass is again a convolution with the same kernel (with the normalization moved inside). So a sensitivity that varies from pixel to pixel is smoothed before it reaches the design variables. A single-pixel spike becomes a cone, and a checkerboard pattern, the classic pixel-scale artifact, is almost wiped out. Pick a gradient pattern.",
eq: String.raw`\[ \frac{\partial J}{\partial \rho_j} = \sum_i \frac{\partial J}{\partial \tilde\rho_i}\, \frac{K(d_{ij})}{\sum_k K(d_{ik})} \]`,
sym: [[String.raw`\(\partial J/\partial \tilde\rho_i\)`, "gradient arriving at the filtered density (from projection and simulation)"], [String.raw`\(\partial J/\partial \rho_j\)`, "gradient with respect to the raw design variable"], ["red / blue", "positive / negative gradient"]],
how: [String.raw`\(\tilde\rho\) is linear in \(\rho\), with matrix entries \(K(d_{ij})/\sum K\).`, "The vector-Jacobian product multiplies by the transpose of that matrix.", String.raw`\(K(d_{ij}) = K(d_{ji})\), so the transpose is again a cone-weighted sum.`, "High spatial frequencies are damped in the gradient as well as in the design."],
say: String.raw`Backpropagation through the conic filter is again a cone-weighted average, so the gradient reaching the design variables is smoothed on the scale \(R\).`,
num: "A checkerboard has the highest spatial frequency of the grid. A cone of radius 2 pixels reduces it to about 4 % of its amplitude, radius 3 to below 1 %.",
r(fig, ctl) {
  let m = "spike"; ctl.innerHTML = btns([["spike", "Single pixel"], ["check", "Checkerboard"], ["noise", "Random"]], "m") + sl("n", "Filter radius (pixels)", 1, 6, 1, 3) + '<div class="readout" id="ro"></div>';
  const W = 60, H = 40;
  const u = () => {
    pick(ctl, "m", m); const n = +$("n").value; $("nv").textContent = n;
    const g = new Float64Array(W * H), r = C3.rng(3);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) g[y * W + x] = m === "spike" ? (x === 30 && y === 20 ? 1 : 0) : m === "check" ? ((x + y) % 2 ? 1 : -1) * (x > 8 && x < 52 && y > 6 && y < 34 ? 1 : 0) : 2 * r() - 1;
    const b = C3.filter2DT(g, W, H, n), mg = Math.max(...g.map(Math.abs)), mb = Math.max(...b.map(Math.abs)) || 1;
    C3.drawRow(fig, [{ rgb: i => C2.color(g[i] / mg) }, { rgb: i => C2.color(b[i] / mg) }], W, H, 5.2, "Both maps use the same color scale, set by the incoming gradient.", ["gradient arriving at ρ̃", "gradient reaching ρ"]);
    $("ro").innerHTML = `<div><span>largest |gradient| in</span><b>${mg.toFixed(3)}</b></div><div><span>largest |gradient| out</span><b>${mb.toFixed(3)}</b></div><div><span>ratio</span><b>${(mb / mg).toFixed(3)}</b></div>`;
  };
  ctl.querySelectorAll("button").forEach(bt => bt.onclick = () => { m = bt.dataset.m; u(); }); $("n").oninput = u; u();
}},

/* NEW CARD: the filter of Eq. (3.8) on one row, step by step */
{s: "7. Filter, step by step", t: "Eq. (3.8) on the board: one pixel, then the whole row",
intu: String.raw`This is Eq. (3.8) drawn the way you would draw it on a whiteboard, on one row of pixels. Start from the raw densities. Put the cone on pixel \(i\): its weight is 1 at the center and falls linearly to 0 at the radius, which Tidy3D rounds up to a whole number of pixels. Multiply every neighbor by its weight, add the products, and divide by the sum of the weights. That is \(\tilde\rho_i\), one dot in the bottom row. Then slide the cone along the row and the filtered profile builds up dot by dot: sharp steps become ramps about \(2R\) wide, and an isolated pixel becomes a low bump. Step through, then move the pixel and the radius.`,
eq: String.raw`\[ \tilde\rho_{i} = \frac{\sum_{j} K(d_{ij})\,\rho_{j}}{\sum_{j} K(d_{ij})}, \qquad K(d) = \max\!\left(0,\,1 - \frac{d}{R}\right) \]<div class="eqref">Ch. 3 Eq. (3.8)</div>`,
sym: [[String.raw`\(\rho_j\)`, "raw density of neighbor j (top bars)"], [String.raw`\(K(d_{ij})\)`, "cone weight of neighbor j, d in pixels from pixel i"], [String.raw`\(K\rho\)`, "weighted contributions (middle bars)"], [String.raw`\(\tilde\rho_i\)`, "filtered density (bottom dots)"]],
how: ["Draw the raw densities as bars.", String.raw`Center the cone on pixel \(i\). Its half-width is the radius rounded up to whole pixels.`, String.raw`Multiply each \(\rho_j\) by \(K(d_{ij})\).`, String.raw`Sum the products and divide by \(\sum_j K(d_{ij})\). At the edge of the region the sum runs only over pixels that exist, so a uniform design stays uniform.`, "Slide to the next pixel and repeat."],
say: "The filtered density of a pixel is the cone-weighted average of its neighbors: multiply each neighbor by a weight that falls linearly to zero at the radius, add, and divide by the sum of the weights.",
num: String.raw`Radius 3 pixels: weights \(1, \tfrac{2}{3}, \tfrac{1}{3}\) for \(d = 0, 1, 2\), and 0 at \(d = 3\), so the sum in 1D is \(1 + 2(\tfrac23 + \tfrac13) = 3\). An isolated pixel of density 1 in air is filtered to \(1/3\).`,
r(fig, ctl) {
  const N = 26, r0 = C3.rng(31), raw = Array.from({ length: N }, (_, j) => (j >= 6 && j < 13) || j === 18 ? 1 : (j >= 21 && j < 24 ? 0.6 : 0)).map((v, j) => C3.clamp(v + (j % 5 === 2 ? 0.15 * r0() : 0), 0, 1));
  ctl.innerHTML = sl("pi", "Pixel i", 0, N - 1, 1, 12) + sl("R", "Radius R (pixels, before rounding)", 1, 6, 0.1, 2.6) + '<div class="readout" id="ro"></div>';
  fig.innerHTML = `<div id="f7s"></div><p class="note" id="f7c" style="font-size:14.5px;color:var(--fg);min-height:44px"></p>`;
  const CAP = ["", "Step 1. The raw densities of one row of pixels, 0 for air and 1 for GaAs.", "Step 2. Center the cone on pixel i. Weight 1 at the center, falling linearly to 0 at the radius, rounded up to whole pixels.", "Step 3. Multiply every neighbor by its weight (orange bars).", "Step 4. Add the products and divide by the sum of the weights: one filtered value.", "Step 5. Slide the cone along the row. Steps become ramps, the lone pixel becomes a low bump."];
  const filt = (i, n) => { let a = 0, b = 0; for (let j = Math.max(0, i - n); j <= Math.min(N - 1, i + n); j++) { const w = Math.max(0, 1 - Math.abs(i - j) / n); a += w * raw[j]; b += w; } return [a / b, a, b]; };
  const draw = S => {
    const k = S.k, Rq = +$("R").value, n = Math.ceil(Rq - 1e-9); $("Rv").textContent = Rq.toFixed(1);
    let i = +$("pi").value; if (k === 5) { i = Math.min(N - 1, Math.floor(S.t * 7)); } $("piv").textContent = i;
    const X0 = 50, DX = 22, X = j => X0 + j * DX, bw = DX - 4;
    let s = `<text class="ts" x="12" y="24">raw ρ</text><text class="ts" x="12" y="136">K, Kρ</text><text class="ts" x="12" y="236">filtered ρ̃</text>`;
    raw.forEach((v, j) => s += `<rect x="${X(j) - bw / 2}" y="${100 - 70 * v}" width="${bw}" height="${Math.max(0.8, 70 * v)}" fill="#378ADD" fill-opacity="${j === i && k >= 2 ? 0.9 : 0.55}"/>`);
    s += `<line x1="${X0 - 12}" x2="${X(N - 1) + 12}" y1="100" y2="100" stroke="var(--b)"/><line x1="${X0 - 12}" x2="${X(N - 1) + 12}" y1="190" y2="190" stroke="var(--b)"/><line x1="${X0 - 12}" x2="${X(N - 1) + 12}" y1="290" y2="290" stroke="var(--b)"/>`;
    if (k >= 2) {
      const g = k === 2 ? C3L5_ease(S.t / 1.2) : 1;
      s += `<path d="M${X(i - n)} 190 L${X(i)} ${190 - 60 * g} L${X(i + n)} 190" fill="#D85A30" fill-opacity="0.08" stroke="#D85A30" stroke-width="1.6"/><line x1="${X(i)}" x2="${X(i)}" y1="12" y2="296" stroke="#D85A30" stroke-dasharray="3 3" opacity="0.6"/>`;
      for (let j = Math.max(0, i - n + 1); j <= Math.min(N - 1, i + n - 1); j++) { const w = Math.max(0, 1 - Math.abs(i - j) / n); s += `<circle cx="${X(j)}" cy="${190 - 60 * w * g}" r="3" fill="#D85A30"/>`; if (k >= 3) { const f = k === 3 ? C3L5_ease(S.t / 1.2) : 1; s += `<rect x="${X(j) - bw / 2 + 3}" y="${190 - 60 * w * raw[j] * f}" width="${bw - 6}" height="${Math.max(0.5, 60 * w * raw[j] * f)}" fill="#EF9F27" fill-opacity="0.75"/>`; } }
      s += i + n > N - 4 ? `<text class="ts" x="${X(i - n) - 4}" y="186" text-anchor="end" style="fill:#D85A30">R̃ = ${n} px</text>` : `<text class="ts" x="${X(i + n) + 4}" y="186" style="fill:#D85A30">R̃ = ${n} px</text>`;
    }
    const upto = k === 5 ? i : k >= 4 ? -1 : -2;
    for (let j = 0; j < N; j++) { if (k < 4 || (k === 4 && j !== i) || (k === 5 && j > upto)) continue; const v = filt(j, n)[0]; s += `<circle cx="${X(j)}" cy="${290 - 70 * v}" r="${j === i ? 5 : 3.5}" fill="${j === i ? "#D85A30" : "#1D9E75"}"/>`; }
    if (k === 5) { let d = ""; for (let j = 0; j <= upto; j++) d += (j ? "L" : "M") + X(j) + " " + (290 - 70 * filt(j, n)[0]).toFixed(1); s += `<path d="${d}" fill="none" stroke="#1D9E75" stroke-width="1.5"/>`; }
    $("f7s").innerHTML = svg(305, s);
    $("f7c").textContent = CAP[k];
    const [v, a, b] = filt(i, n);
    $("ro").innerHTML = `<div><span>Σ K ρ</span><b>${a.toFixed(3)}</b></div><div><span>Σ K</span><b>${b.toFixed(3)}</b></div><div><span>ρ̃ at pixel ${i}</span><b>${v.toFixed(3)}</b></div>`;
  };
  const S = C3L5_steps(fig, ctl, 5, 3.4, draw, "f7");
  $("pi").oninput = () => draw(S); $("R").oninput = () => draw(S);
}}

],
summary: String.raw`In density topology optimization each pixel has a density \(\rho\) in \([0, 1]\), and the permittivity is interpolated linearly between air and GaAs, so only 0 and 1 are physical. Unregularized, the optimizer produces single-pixel features and grey regions. A conic filter of radius \(R\) averages the densities with weights \(K(d) = \max(0, 1 - d/R)\), where Tidy3D rounds \(R\) up to whole pixels. The filter removes pixel-scale features and smooths the gradient on the same scale, but it makes the design greyer and gives only a weak length scale, so a projection and further penalties are needed.`,
sheet: [
[String.raw`\[ \varepsilon = \varepsilon_{\mathrm{air}} + \hat\rho\, (\varepsilon_{\mathrm{GaAs}} - \varepsilon_{\mathrm{air}}) \]`, "Linear interpolation (Ch. 3 Eq. 3.10, Christiansen Eqs. 9, 19)"],
[String.raw`\[ \tilde\rho_{i} = \frac{\sum_{j} K(d_{ij})\,\rho_{j}}{\sum_{j} K(d_{ij})}, \qquad K(d) = \max\!\left(0,\,1 - \frac{d}{R}\right) \]`, "Conic filter (Ch. 3 Eq. 3.8, Tidy3D), R rounded up to whole pixels"],
[String.raw`\[ \tilde R = \lceil R/\Delta \rceil \Delta, \qquad \text{kernel } 2\lceil R/\Delta \rceil + 1 \text{ pixels per side} \]`, String.raw`Radius rounding (Tidy3D <code>get_kernel_size_px</code>)`],
[String.raw`\[ \frac{\partial J}{\partial \rho_j} = \sum_i \frac{\partial J}{\partial \tilde\rho_i}\, \frac{K(d_{ij})}{\sum K} \]`, "Backward pass through the filter"]],
consts: String.raw`\(\varepsilon_{\mathrm{air}} = 1\), \(\varepsilon_{\mathrm{GaAs}} = 12.19\). Maps are 90 × 60 pixels of random or drawn densities, filtered live with edge renormalization.`,
sources: ["Christiansen and Sigmund, J. Opt. Soc. Am. B 38, 496 (2021), Eqs. (9), (17), (19) and Sec. 4 (interpolation, filtering, weak length scale)", "Flexcompute, Tidy3D 2.11.2 source: plugins/autograd/utilities.py (_kernel_conic, make_kernel, get_kernel_size_px), plugins/invdes/region.py (eps_values)"]
});

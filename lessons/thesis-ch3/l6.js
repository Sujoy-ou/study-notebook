addLesson("thesis", "ch3", {
level: "Core",
id: "thesis-ch3-l6", title: "Density topology: pixels and the conic filter", short: "6. Pixels and the filter",
big: "In topology optimization the design region is a grid of pixels, each with a density ρ between 0 (air) and 1 (GaAs), and the permittivity is interpolated linearly between the two materials. This gives the optimizer complete freedom, including the freedom to make single-pixel features and grey pixels that are neither air nor GaAs, which cannot be fabricated and have no physical meaning. The first fix is a filter: each pixel is replaced by a weighted average over a disk of radius R, with weights that fall off linearly like a cone. The filter removes pixel-scale noise and gives the design a weak sense of length scale. On its own it makes the design greyer, which is why a projection follows (Lesson 7).",
bridge: "This is Ch. 3 Sec. 3.3, Eqs. (3.9) and (3.11). Christiansen and Sigmund 2021 (DTU, the Sigmund group) is a tutorial on exactly this recipe for photonics: their Eqs. (9) and (19) give the linear interpolation, and they explain why naive optimization produces pixel-by-pixel designs. Their filter is a PDE (Helmholtz) filter, Eq. (17). The conic filter used here is Tidy3D's (_kernel_conic, make_kernel, get_kernel_size_px), so Eq. (3.9) cites Tidy3D. All maps below are computed in your browser.",
cards: [
{s: "1. Pixels", t: "A density per pixel, interpolated between air and GaAs",
intu: "Each pixel carries a density ρ. The permittivity is linear in ρ: 1 for air at ρ = 0, 12.19 for GaAs at ρ = 1. A design can start from a rough drawing, here a Y-shaped splitter with dense arms on a light background. Any value in between is a grey material that does not exist: at ρ = 0.5 the index would be about 2.6. The optimizer has to be pushed toward 0 and 1, otherwise its best design may rely on such fictitious material. Change the arm and background densities.",
eq: "ε = ε<sub>air</sub> + ρ̂ (ε<sub>GaAs</sub> − ε<sub>air</sub>) &nbsp;&nbsp; (Ch. 3 Eq. 3.11, Christiansen Eqs. 9 and 19)",
sym: [["ρ", "raw density of a pixel, the design variable, in [0, 1]"], ["ρ̂", "density after filter and projection, the one that sets ε (Lesson 7)"], ["ε_air = 1, ε_GaAs = 12.19", "the two materials (n = 3.492)"]],
how: ["Discretize the design region into square pixels.", "Give each pixel a continuous density so that gradients exist.", "Interpolate ε linearly, as Christiansen and Sigmund do.", "Only ρ = 0 and ρ = 1 correspond to real materials."],
say: "Each pixel has a density between 0 and 1, and its permittivity is a linear interpolation between air and GaAs, so only the end values are physical.",
num: "ρ = 0.5 gives ε = 6.6 and n = 2.57. ρ = 0.9 gives ε = 11.1 and n = 3.33.",
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

{s: "2. Raw pixels", t: "What an unconstrained pixel optimization produces",
intu: "Left free, the optimizer exploits every pixel. Christiansen and Sigmund observe pixel-by-pixel varying regions in a naive optimization, and features of single pixels. Such patterns can be fine in simulation, partly because a pixel-size feature is poorly resolved by the grid, but they cannot be written by lithography. The two maps show the typical symptoms: speckle of single pixels and large grey regions. The readouts count them.",
eq: "smallest feature without a filter: one pixel, Δ &nbsp;&nbsp; grey fraction = share of pixels with 0.05 &lt; ρ &lt; 0.95",
sym: [["Δ", "pixel size, about 10 nm in a typical 3D design"], ["grey fraction", "a simple measure of how far the design is from binary"]],
how: ["Each pixel is an independent variable with its own gradient.", "Nothing couples neighbors, so the optimum can vary from pixel to pixel.", "Grey values are often optimal for a continuous problem.", "Both effects are removed by the filter (this lesson) and the projection (Lesson 7)."],
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

{s: "3. The conic kernel", t: "The conic filter kernel and its rounded radius",
intu: "The filter replaces each pixel by a weighted average of its neighbors. The weight falls linearly from 1 at the center to 0 at a radius R̃, like a cone. Because the kernel lives on the pixel grid, Tidy3D rounds the radius up to a whole number of pixels, R̃ = ⌈R/Δ⌉Δ, and builds a kernel of 2⌈R/Δ⌉ + 1 pixels per side. Pixels at exactly R̃ get zero weight. Change R/Δ and watch the rounding.",
eq: "ρ̃<sub>i</sub> = Σ<sub>j</sub> K(r<sub>ij</sub>) ρ<sub>j</sub> / Σ<sub>j</sub> K(r<sub>ij</sub>), &nbsp;&nbsp; K(r) = max(0, 1 − r/R̃), &nbsp;&nbsp; R̃ = ⌈R/Δ⌉Δ &nbsp;&nbsp; (Ch. 3 Eq. 3.9)",
sym: [["ρ̃_i", "filtered density of pixel i"], ["r_ij", "distance between the centers of pixels i and j"], ["K", "cone-shaped weight"], ["R", "requested filter radius"], ["R̃", "radius actually used, rounded up to whole pixels"], ["Δ", "pixel size"]],
how: ["Choose a radius R in nanometers.", "Convert to pixels and round up: n = ⌈R/Δ⌉.", "Build a (2n + 1) × (2n + 1) kernel with K = max(0, 1 − r/(nΔ)).", "Normalize by the sum of the weights so a uniform design stays uniform."],
say: "The conic filter averages the densities with weights that fall linearly to zero at the radius, which Tidy3D rounds up to a whole number of pixels.",
num: "Example: R = 100 nm on 9 nm pixels gives ⌈11.1⌉ = 12 pixels, R̃ = 108 nm, a kernel of 25 × 25 pixels. A radius of one pixel leaves only the center weight, so the filter does nothing.",
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

{s: "4. Filtering", t: "The filter removes pixel noise and makes the design grey",
intu: "Apply the filter to a map of random pixel values. Small-scale variation is averaged out and smooth blobs of size about R remain. Notice the side effect: the filtered values bunch up around the mean, 0.5. The filter alone turns a noisy design into a grey one. That is the reason a projection always follows the filter. Change the radius.",
eq: "ρ̃ = K ∗ ρ / (K ∗ 1) &nbsp;&nbsp; (normalized convolution)",
sym: [["∗", "convolution over the pixel grid"], ["K ∗ 1", "sum of the weights inside the region, which normalizes at the edges"], ["std", "spread of the values around their mean"]],
how: ["Each filtered pixel is a weighted mean of many raw pixels.", "Means of many random values cluster near their average.", "So the spread shrinks roughly like 1/√(number of pixels in the kernel).", "Spatial features smaller than about R are averaged away."],
say: "The filter smooths the design over a radius R, removing pixel-scale features, but it also pushes values toward grey.",
num: "Raw uniform random values have a spread of 0.29. After a filter of radius 3 pixels it drops to 0.07, and at 4 pixels to 0.05, so almost every pixel is grey.",
r(fig, ctl) {
  ctl.innerHTML = sl("n", "Filter radius (pixels)", 1, 8, 1, 4) + '<div class="readout" id="ro"></div>';
  const W = 90, H = 60, raw = C3.noise(W, H, 77);
  const sd = a => { const m = a.reduce((x, y) => x + y, 0) / a.length; return Math.sqrt(a.reduce((x, y) => x + (y - m) ** 2, 0) / a.length); };
  const u = () => {
    const n = +$("n").value; $("nv").textContent = n; const f = C3.filter2D(raw, W, H, n);
    C3.drawRow(fig, [{ a: raw }, { a: f }], W, H, 3.6, "Same colors as before: dark 1, white 0, grey in between.", ["raw ρ", "filtered ρ̃"]);
    let g = 0; f.forEach(v => { if (v > 0.05 && v < 0.95) g++; });
    $("ro").innerHTML = `<div><span>spread raw / filtered</span><b>${sd(raw).toFixed(3)} / ${sd(f).toFixed(3)}</b></div><div><span>grey fraction after filter</span><b>${(100 * g / f.length).toFixed(0)} %</b></div>`;
  };
  $("n").oninput = u; u();
}},

{s: "5. A weak length scale", t: "Filter, then threshold: features grow with R, but no guarantee",
intu: "Threshold the filtered map at 0.5 to see the shapes it encodes. A larger radius gives larger features, so the filter does set a length scale. Christiansen and Sigmund call it a weak sense of length scale, because nothing forbids a thin neck or a tiny island where the filtered value happens to cross 0.5. The readout tracks the smallest island or hole. Change R and look for small features.",
eq: "binary design: ρ̂ = 1 if ρ̃ &gt; 0.5, else 0 &nbsp;&nbsp; (the limit β → ∞ of the projection, Lesson 7)",
sym: [["island", "connected GaAs region"], ["hole", "connected air region surrounded by GaAs"], ["smallest feature", "area of the smallest island or hole, in pixels"]],
how: ["Filtering limits how fast ρ̃ can vary in space.", "So the 0.5 contour cannot wiggle on scales much below R.", "But the contour can still pass close to itself, making thin necks and small islands.", "A hard guarantee needs more: the erosion and dilation penalty (Lesson 9) and a design rule check (Lesson 11)."],
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

{s: "6. Gradients through the filter", t: "The filter smooths the gradient too",
intu: "The chain rule passes the gradient back through the filter. Because the conic kernel is symmetric, the backward pass is again a convolution with the same kernel (with the normalization moved inside). So a sensitivity that varies from pixel to pixel is smoothed before it reaches the design variables. A single-pixel spike becomes a cone, and a checkerboard pattern, the classic pixel-scale artifact, is almost wiped out. Pick a gradient pattern.",
eq: "∂J/∂ρ<sub>j</sub> = Σ<sub>i</sub> (∂J/∂ρ̃<sub>i</sub>) K(r<sub>ij</sub>) / Σ<sub>k</sub>K(r<sub>ik</sub>)",
sym: [["∂J/∂ρ̃_i", "gradient arriving at the filtered density (from projection and simulation)"], ["∂J/∂ρ_j", "gradient with respect to the raw design variable"], ["red / blue", "positive / negative gradient"]],
how: ["ρ̃ is linear in ρ, with matrix entries K(r_ij)/ΣK.", "The vector-Jacobian product multiplies by the transpose of that matrix.", "K(r_ij) = K(r_ji), so the transpose is again a cone-weighted sum.", "High spatial frequencies are damped in the gradient as well as in the design."],
say: "Backpropagation through the conic filter is again a cone-weighted average, so the gradient reaching the design variables is smoothed on the scale R.",
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
}}
],
summary: "In density topology optimization each pixel has a density ρ in [0, 1], and the permittivity is interpolated linearly between air and GaAs, so only 0 and 1 are physical. Unregularized, the optimizer produces single-pixel features and grey regions. A conic filter of radius R averages the densities with weights max(0, 1 − r/R̃), where Tidy3D rounds R up to whole pixels. The filter removes pixel-scale features and smooths the gradient on the same scale, but it makes the design greyer and gives only a weak length scale, so a projection and further penalties are needed.",
sheet: [
["ε = ε<sub>air</sub> + ρ̂(ε<sub>GaAs</sub> − ε<sub>air</sub>)", "Linear interpolation (Ch. 3 Eq. 3.11, Christiansen Eqs. 9, 19)"],
["ρ̃<sub>i</sub> = ΣK(r<sub>ij</sub>)ρ<sub>j</sub>/ΣK(r<sub>ij</sub>), &nbsp; K(r) = max(0, 1 − r/R̃)", "Conic filter (Ch. 3 Eq. 3.9, Tidy3D)"],
["R̃ = ⌈R/Δ⌉Δ, &nbsp; kernel 2⌈R/Δ⌉ + 1 pixels per side", "Radius rounding (Tidy3D get_kernel_size_px)"],
["∂J/∂ρ<sub>j</sub> = Σ<sub>i</sub>(∂J/∂ρ̃<sub>i</sub>)K(r<sub>ij</sub>)/ΣK", "Backward pass through the filter"]],
consts: "ε_air = 1, ε_GaAs = 12.19. Maps are 90 × 60 pixels of random or drawn densities, filtered live with edge renormalization.",
sources: ["Christiansen and Sigmund, J. Opt. Soc. Am. B 38, 496 (2021), Eqs. (9), (17), (19) and Sec. 4 (interpolation, filtering, weak length scale)", "Flexcompute, Tidy3D 2.11.2 source: plugins/autograd/utilities.py (_kernel_conic, make_kernel, get_kernel_size_px), plugins/invdes/region.py (eps_values)"]
});

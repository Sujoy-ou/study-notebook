addLesson("thesis", "ch3", {
level: "Core",
id: "thesis-ch3-l8", title: "Erosion, dilation, opening and closing", short: "8. Morphology",
big: "Mathematical morphology describes shapes by what a small disk can do inside them. Erosion keeps only the points where the whole disk fits inside the GaAs, so every feature shrinks by the disk radius r. Dilation adds every point within r of the GaAs, so every feature grows. Opening is erosion followed by dilation: whatever survived the shrinking grows back, but solid parts thinner than 2r and sharp convex tips are gone for good. Closing is dilation followed by erosion: it fills gaps narrower than 2r, small holes and sharp concave notches. A layout that respects a minimum feature of 2r, with corner radii of at least r, is unchanged by both. That single property is the basis of the erosion and dilation penalty (Lesson 9) and of the design rule check and repair (Lesson 11).",
bridge: "This is the background of Ch. 3 Sec. 3.5. Hammond et al. 2021 showed that differentiable morphological transforms can be used inside photonic topology optimization. Christiansen and Sigmund 2021 build eroded and dilated designs with thresholds above and below 0.5. Tidy3D builds erosion and dilation the same way, as a filter plus a projection with thresholds 0.99 and 0.01 (ErosionDilationPenalty). The binary operations below are exact on the pixel grid, computed with a Euclidean distance transform.",
cards: [
{s: "1. Erosion and dilation", t: "Shrinking and growing every feature by a disk",
intu: "The test layout (dark is GaAs) has a big block, a second block separated by a narrow gap, a thin bar, a block with a small hole and a small island. Erosion removes everything within r of the air (red): the thin bar and the island disappear completely. Dilation adds everything within r of the GaAs (blue): the gap closes and the hole fills. Switch the operation and change r.",
eq: String.raw`\[ \operatorname{erode}_r(X) = \{\, p : \operatorname{disk}(p, r) \subseteq X \,\} \]\[ \operatorname{dilate}_r(X) = \{\, p : \operatorname{disk}(p, r) \cap X \neq \emptyset \,\} \]`,
sym: [[String.raw`\(X\)`, "the GaAs region of the layout"], [String.raw`\(\operatorname{disk}(p, r)\)`, "disk of radius r centered at point p"], ["red", "GaAs removed by erosion"], ["blue", "air turned into GaAs by dilation"]],
how: ["Erosion: a point stays only if its distance to the nearest air is more than r.", "Dilation: a point is added if its distance to the nearest GaAs is at most r.", "Both are computed here from a Euclidean distance transform of the pixel map.", "Erosion of X is the same as dilation of the air, and the other way round."],
say: "Erosion shrinks every GaAs feature by r and dilation grows it by r, as if the edges were moved by a uniform etch bias.",
num: "A bar of width w survives erosion only if w > 2r. A gap of width g survives dilation only if g > 2r.",
r(fig, ctl) {
  let op = "e"; ctl.innerHTML = btns([["e", "Erode"], ["d", "Dilate"]], "o") + sl("r", "Disk radius r (pixels)", 1, 8, 0.5, 3) + '<div class="readout" id="ro"></div>';
  const { X, W, H } = C3.pattern();
  const u = () => {
    pick(ctl, "o", op); const r = +$("r").value; $("rv").textContent = r;
    const Y = op === "e" ? C3.bErode(X, W, H, r, 0) : C3.bDilate(X, W, H, r, 0), rem = X.map((v, i) => v && !Y[i] ? 1 : 0), add = X.map((v, i) => !v && Y[i] ? 1 : 0);
    C3.draw(fig, X, W, H, 5.4, op === "e" ? "Red: GaAs removed by erosion." : "Blue: air filled by dilation.", [[rem, [216, 90, 48]], [add, [55, 138, 221]]]);
    const A = a => a.reduce((x, y) => x + y, 0);
    $("ro").innerHTML = `<div><span>GaAs area before</span><b>${A(X)} px</b></div><div><span>after</span><b>${A(Y)} px</b></div><div><span>islands after</span><b>${C3.components(Y, W, H, 1).length}</b></div>`;
  };
  ctl.querySelectorAll("button").forEach(b => b.onclick = () => { op = b.dataset.o; u(); }); $("r").oninput = u; u();
}},

{s: "2. Opening", t: "Opening: erode, then dilate back",
intu: "Opening first erodes, then dilates by the same radius. Features that were thick enough survive the erosion and grow back to almost exactly their old shape. Features thinner than 2r vanished during the erosion and cannot grow back. Sharp convex corners come back rounded with radius r, because the disk cannot reach into a tip. So the GaAs removed by opening, X ∖ open<sub>r</sub>(X), marks exactly the solid features that are too thin or too sharp. Change r.",
eq: String.raw`\[ \operatorname{open}_r(X) = \operatorname{dilate}_r\big(\operatorname{erode}_r(X)\big) \]\[ = \text{union of all disks of radius } r \text{ that fit inside } X \]`,
sym: [[String.raw`\(\operatorname{open}_r(X)\)`, "the part of X that can be swept by a disk of radius r"], [String.raw`\(X \setminus \operatorname{open}_r(X)\)`, "GaAs that a disk of radius r cannot reach: thin parts and sharp tips (red)"]],
how: ["Erosion leaves the centers of all disks of radius r that fit inside X.", "Dilation puts the disks back around those centers.", "The union of those disks is the opened shape.", "Anything not covered by such a disk, thin bars, small islands, corner tips, is removed."],
say: "Opening removes every solid feature narrower than 2r and rounds convex corners to radius r, while leaving larger features unchanged.",
num: "A 90° convex corner loses (1 − π/4)r² ≈ 0.21r² of area to opening, so a perfectly sharp corner always shows up as a small violation.",
r(fig, ctl) {
  ctl.innerHTML = sl("r", "Disk radius r (pixels)", 1, 8, 0.5, 3) + '<div class="readout" id="ro"></div>';
  const { X, W, H } = C3.pattern();
  const u = () => {
    const r = +$("r").value; $("rv").textContent = r; const O = C3.bOpen(X, W, H, r, 0), rem = X.map((v, i) => v && !O[i] ? 1 : 0);
    C3.draw(fig, X, W, H, 5.4, "Red: GaAs removed by opening. Note the corners.", [[rem, [216, 90, 48]]]);
    $("ro").innerHTML = `<div><span>GaAs removed</span><b>${rem.reduce((a, b) => a + b, 0)} px</b></div><div><span>islands before / after</span><b>${C3.components(X, W, H, 1).length} / ${C3.components(O, W, H, 1).length}</b></div>`;
  };
  $("r").oninput = u; u();
}},

{s: "3. Closing", t: "Closing: dilate, then erode back",
intu: "Closing is opening applied to the air. Dilation first fills every gap narrower than 2r and every small hole. The erosion then pulls the outer edges back to where they were, but the filled gaps and holes stay filled. Sharp concave corners, inside notches, also get filled with a rounded fillet. The air filled by closing, close<sub>r</sub>(X) ∖ X, marks exactly the gaps that are too narrow. Change r.",
eq: String.raw`\[ \operatorname{close}_r(X) = \operatorname{erode}_r\big(\operatorname{dilate}_r(X)\big) \]\[ = \text{complement of the opening of the air} \]`,
sym: [[String.raw`\(\operatorname{close}_r(X)\)`, "X with all narrow gaps, small holes and sharp notches filled"], [String.raw`\(\operatorname{close}_r(X) \setminus X\)`, "air that a disk of radius r cannot reach: narrow gaps and holes (blue)"]],
how: ["Dilate: gaps narrower than 2r bridge over, holes smaller than the disk fill up.", "Erode: outer edges move back by r.", "Bridged gaps are now deep inside GaAs, so they stay filled.", "By symmetry, closing X is the same as opening the air and taking the complement."],
say: "Closing fills every gap narrower than 2r and every hole too small for the disk, and leaves wider gaps unchanged.",
num: "In this layout the gap between the two upper blocks is 4 pixels wide, so it is filled once r reaches 2 pixels.",
r(fig, ctl) {
  ctl.innerHTML = sl("r", "Disk radius r (pixels)", 1, 8, 0.5, 3) + '<div class="readout" id="ro"></div>';
  const { X, W, H } = C3.pattern();
  const u = () => {
    const r = +$("r").value; $("rv").textContent = r; const C = C3.bClose(X, W, H, r, 0), add = X.map((v, i) => !v && C[i] ? 1 : 0);
    C3.draw(fig, X, W, H, 5.4, "Blue: air filled by closing.", [[add, [55, 138, 221]]]);
    $("ro").innerHTML = `<div><span>air filled</span><b>${add.reduce((a, b) => a + b, 0)} px</b></div><div><span>GaAs regions before / after</span><b>${C3.components(X, W, H, 1).length} / ${C3.components(C, W, H, 1).length}</b></div>`;
  };
  $("r").oninput = u; u();
}},

{s: "4. Both at once", t: "A layout that obeys the length scale is unchanged by both",
intu: "Put opening and closing together. Red marks solid that is too thin or too sharp, blue marks gaps that are too narrow. If neither color appears, every solid feature and every gap is at least 2r wide and every corner has a radius of at least r. Here you can choose the layout: the test pattern with its violations, or a clean layout built from rounded shapes with wide gaps. The clean one passes up to r = 6 pixels and fails from r = 7, when its narrowest parts, 14 pixels wide, reach 2r.",
eq: String.raw`\[ X \text{ obeys length scale } r \quad\Longleftrightarrow\quad \operatorname{open}_r(X) = X = \operatorname{close}_r(X) \]`,
sym: [[String.raw`length scale \(r\)`, "half of the minimum feature and gap width"], ["clean layout", "rounded shapes, corner radius 7 pixels, all widths and gaps at least 14 pixels"]],
how: ["Opening never adds GaAs, closing never removes it.", "So close_r(X) − open_r(X) ≥ 0 everywhere, and it is zero only where neither operation changed anything.", "This difference is exactly what the penalty of Lesson 9 measures, on a density map.", "The design rule check of Lesson 11 asks for zero area of both differences."],
say: "A layout has no feature or gap narrower than 2r, and no corner sharper than r, exactly when opening and closing with radius r both leave it unchanged.",
num: "Because pixel edges are staircases, small specks of a few pixels can appear even for a clean shape. The design rule check therefore ignores regions below a tiny area.",
r(fig, ctl) {
  let L = "test"; ctl.innerHTML = btns([["test", "Test pattern"], ["clean", "Clean layout"]], "l") + sl("r", "Disk radius r (pixels)", 1, 10, 0.5, 3) + '<div class="readout" id="ro"></div>';
  const T = C3.pattern(), W = T.W, H = T.H, Cl = new Uint8Array(W * H);
  C3.rrect(Cl, W, H, 4, 4, 42, 30, 7, 1); C3.rrect(Cl, W, H, 58, 4, 96, 30, 7, 1); C3.rrect(Cl, W, H, 4, 46, 96, 60, 7, 1);
  const u = () => {
    pick(ctl, "l", L); const r = +$("r").value; $("rv").textContent = r; const X = L === "test" ? T.X : Cl, d = C3.drc(X, W, H, r, 0, L === "test" ? 1 : 4);
    C3.draw(fig, X, W, H, 5.4, "Red: removed by opening. Blue: filled by closing.", [[d.solid, [216, 90, 48]], [d.gap, [55, 138, 221]]]);
    $("ro").innerHTML = `<div><span>solid violations</span><b>${d.ns} px</b></div><div><span>gap violations</span><b>${d.ng} px</b></div><div><span>verdict</span><b>${d.ns + d.ng === 0 ? "obeys r" : "violates r"}</b></div>`;
  };
  ctl.querySelectorAll("button").forEach(b => b.onclick = () => { L = b.dataset.l; u(); }); $("r").oninput = u; u();
}},

{s: "5. Differentiable version", t: "Erosion and dilation as a filter and a projection",
intu: "The binary operations have no useful gradient. Tidy3D builds smooth versions from the tools of Lessons 6 and 7. Filter the density with the conic kernel, then project with a threshold near 1: only pixels whose whole neighborhood is GaAs stay, which is erosion. Project with a threshold near 0 instead: any GaAs in the neighborhood is enough, which is dilation. Combining them gives smooth opening and closing. Compare the smooth opening (middle) with the binary opening of the same radius (right). The readout measures how far a straight edge moves under the smooth erosion.",
eq: String.raw`\[ \operatorname{erode}(\hat\rho) = P_{\beta,\,0.99}\big(\operatorname{filter}_R(\hat\rho)\big) \qquad \operatorname{dilate}(\hat\rho) = P_{\beta,\,0.01}\big(\operatorname{filter}_R(\hat\rho)\big) \]\[ \mathcal{O} = \operatorname{dilate} \circ \operatorname{erode} \qquad \mathcal{C} = \operatorname{erode} \circ \operatorname{dilate} \]`,
sym: [[String.raw`\(P_{\beta,\eta}\)`, "tanh projection of Lesson 7"], [String.raw`\(\operatorname{filter}_R\)`, "conic filter of radius R (Lesson 6)"], [String.raw`\(0.99,\ 0.01\)`, "Tidy3D's default thresholds, 1 ∓ delta_eta with delta_eta = 0.01"], ["edge shift", "distance a straight edge moves under the smooth erosion"]],
how: ["Near a straight edge the filtered value falls from 1 inside to 0 outside over a distance of about 2R.", "A threshold of 0.99 keeps only pixels nearly R inside the edge.", "A threshold of 0.01 adds pixels up to nearly R outside it.", "So the smooth operations act like a disk of radius slightly below R, and remain differentiable through the tanh."],
say: "Tidy3D makes erosion and dilation differentiable by filtering and then projecting with thresholds of 0.99 and 0.01, which moves edges by almost the filter radius.",
num: "Each edge moves by about R minus one pixel, so the smooth opening removes bars narrower than about 2R − Δ, roughly 1.75R. With this implementation the radius R therefore corresponds to a minimum feature just under 2R, like a disk of radius R in the binary operations.",
r(fig, ctl) {
  ctl.innerHTML = sl("n", "Filter radius R (pixels)", 2, 7, 1, 3) + sl("b", "β inside the operations", 10, 100, 5, 100) + '<div class="readout" id="ro"></div>';
  const { X, W, H } = C3.pattern(), a = Float64Array.from(X);
  const u = () => {
    const n = +$("n").value, b = +$("b").value; $("nv").textContent = n; $("bv").textContent = b;
    const O = C3.open(a, W, H, n, b), Ob = C3.bOpen(X, W, H, n, 0);
    C3.drawRow(fig, [{ a }, { a: O }, { a: Ob }], W, H, 2.15, "Smooth and binary opening agree closely.", ["layout", "smooth opening", "binary opening, r = R"]);
    const w = 40, h = 9, hp = new Float64Array(w * h); for (let y = 0; y < h; y++) for (let x = 0; x < 20; x++) hp[y * w + x] = 1;
    const e = C3.erode(hp, w, h, n, b); let c = 0; for (let x = 0; x < w; x++) if (e[4 * w + x] > 0.5) c++;
    const dd = C3.dilate(hp, w, h, n, b); let c2 = 0; for (let x = 0; x < w; x++) if (dd[4 * w + x] > 0.5) c2++;
    $("ro").innerHTML = `<div><span>edge shift, erosion</span><b>${20 - c} px</b></div><div><span>edge shift, dilation</span><b>${c2 - 20} px</b></div><div><span>filter radius</span><b>${n} px</b></div>`;
  };
  $("n").oninput = u; $("b").oninput = u; u();
}},

{s: "6. The rolling disk", t: "Why opening removes thin parts and sharp tips",
intu: "Picture a disk of radius r rolled everywhere inside the GaAs without crossing into air. The opened shape is everything the disk can touch. The orange pixels are the possible centers of the disk, the eroded set, and the circles show a few disks. The disk cannot enter a bar thinner than its diameter, and it cannot reach into a sharp tip. Rolled in the air instead, the same disk explains closing. Change the radius.",
eq: String.raw`\[ \operatorname{open}_r(X) = \bigcup \left\{\, \operatorname{disk}(c, r) : c \in \operatorname{erode}_r(X) \,\right\} \]`,
sym: [[String.raw`\(c\)`, "a possible center of the disk"], [String.raw`\(\operatorname{erode}_r(X)\)`, "all possible centers (orange)"], [String.raw`\(\bigcup\)`, "union of all such disks"]],
how: ["A center is allowed if its disk stays inside X: that is the definition of erosion.", "Dilation by r puts a disk around every allowed center.", "So the opening is the union of all fitting disks.", "A tip of angle below 180° can never be filled by disks, so it is cut to radius r."],
say: "The opening is the region swept by a disk of radius r rolling inside the shape, so anything the disk cannot reach is removed.",
num: "This picture also explains why the curvature of convex corners in an opened layout is at most 1/r.",
r(fig, ctl) {
  ctl.innerHTML = sl("r", "Disk radius r (pixels)", 1.5, 8, 0.5, 4);
  const { X, W, H } = C3.pattern(), sc = 5.4;
  const u = () => {
    const r = +$("r").value; $("rv").textContent = r; const E = C3.bErode(X, W, H, r, 0), O = C3.bOpen(X, W, H, r, 0), rem = X.map((v, i) => v && !O[i] ? 1 : 0);
    const c = C3.draw(fig, X, W, H, sc, "Orange: possible disk centers. Red: removed by opening. Circles: some disks.", [[rem, [216, 90, 48]], [E, [239, 159, 39]]]);
    const ctx = c.ctx; ctx.strokeStyle = "#0C447C"; ctx.lineWidth = 0.6;
    const cs = []; for (let i = 0; i < E.length; i++) if (E[i]) cs.push(i);
    const rg = C3.rng(17); for (let k = 0; k < Math.min(16, cs.length); k++) { const i = cs[Math.floor(rg() * cs.length)], x = i % W, y = (i - x) / W; ctx.beginPath(); ctx.arc(x + 0.5, y + 0.5, r, 0, 2 * Math.PI); ctx.stroke(); }
  };
  $("r").oninput = u; u();
}}
],
summary: "Erosion keeps the points where a disk of radius r fits inside the GaAs, dilation adds the points within r of it. Opening, erosion then dilation, is the union of all disks that fit, so it removes solid features narrower than 2r and rounds convex corners to radius r. Closing, dilation then erosion, fills gaps narrower than 2r, small holes and concave notches. A layout with no feature or gap below 2r and no corner sharper than r is unchanged by both. Tidy3D builds differentiable versions by filtering and projecting with thresholds 0.99 and 0.01, which move edges by nearly the filter radius R, so the radius R corresponds to a minimum feature just under 2R.",
sheet: [
[String.raw`\[ \operatorname{erode}_r(X) = \{\, p : \operatorname{disk}(p, r) \subseteq X \,\} \]\[ \operatorname{dilate}_r(X) = \{\, p : \operatorname{disk}(p, r) \cap X \neq \emptyset \,\} \]`, "Erosion and dilation"],
[String.raw`\[ \operatorname{open}_r = \operatorname{dilate}_r \circ \operatorname{erode}_r \qquad \operatorname{close}_r = \operatorname{erode}_r \circ \operatorname{dilate}_r \]`, "Opening and closing"],
[String.raw`\[ \operatorname{open}_r(X) = X = \operatorname{close}_r(X) \]`, "X obeys minimum feature and gap 2r, corner radius r"],
[String.raw`\[ \operatorname{erode} = P_{\beta,0.99} \circ \operatorname{filter}_R \qquad \operatorname{dilate} = P_{\beta,0.01} \circ \operatorname{filter}_R \]`, "Differentiable versions (Tidy3D)"],
[String.raw`\[ \left(1 - \frac{\pi}{4}\right) r^2 \approx 0.21\, r^2 \]`, "Area cut from a sharp 90° corner by opening"]],
consts: "Test pattern 100 × 64 pixels. Binary operations use an exact Euclidean distance transform, with air beyond the border.",
sources: ["Hammond et al., Opt. Express 29, 23916 (2021) (differentiable morphological transforms for robustness and design rules)", "Christiansen and Sigmund, J. Opt. Soc. Am. B 38, 496 (2021) (eroded, nominal and dilated designs by threshold shifts)", "Flexcompute, Tidy3D 2.11.2 source: plugins/autograd/invdes/penalties.py (ErosionDilationPenalty, thresholds 1 ∓ delta_eta)", "Felzenszwalb and Huttenlocher, Theory of Computing 8, 415 (2012) (distance transform used for the binary operations in this page)"]
});

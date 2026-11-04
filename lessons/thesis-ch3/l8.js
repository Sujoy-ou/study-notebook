/* helpers for this lesson only (prefix C3L8_) */
const C3L8_steps = (fig, ctl, n, dur, draw, idp) => {
  ctl.insertAdjacentHTML("beforeend", `<div class="row"><button id="${idp}b">Back</button><button id="${idp}p">Pause</button><button id="${idp}n">Next step</button><span id="${idp}s" style="font-size:13px;color:var(--muted);margin-left:6px"></span></div>`);
  const S = { k: 1, play: true, t: 0 };
  let last = performance.now(), kd = 0;
  const ui = () => { $(idp + "s").textContent = `step ${S.k} of ${n}`; $(idp + "b").disabled = S.k === 1; $(idp + "n").disabled = S.k === n; $(idp + "p").textContent = S.play ? "Pause" : "Play"; };
  S.go = k => { S.k = Math.max(1, Math.min(n, k)); S.t = 0; ui(); draw(S); kd = S.k; };
  $(idp + "b").onclick = () => { S.play = false; S.go(S.k - 1); };
  $(idp + "n").onclick = () => { S.play = false; S.go(S.k + 1); };
  $(idp + "p").onclick = () => { S.play = !S.play; if (S.play && S.k === n) S.go(1); ui(); };
  ui();
  /* the maps are static within a step, so redraw only when the step changes */
  anim(() => {
    if (!fig.isConnected) { stopAnim(); return; }
    const now = performance.now(), dt = Math.min(0.1, (now - last) / 1000); last = now; S.t += dt;
    if (S.play && S.t > dur) { if (S.k < n) { S.k++; S.t = 0; } else S.play = false; ui(); }
    if (kd !== S.k) { kd = S.k; draw(S); }
  });
  return S;
};
addLesson("thesis", "ch3", {
level: "Core",
id: "thesis-ch3-l8", title: "Erosion, dilation, opening and closing", short: "8. Morphology",
big: String.raw`Mathematical morphology describes shapes by what a small disk can do inside them. Erosion keeps only the points where the whole disk fits inside the GaAs, so every feature shrinks by the disk radius \(r\). Dilation adds every point within \(r\) of the GaAs, so every feature grows. Opening is erosion followed by dilation: whatever survived the shrinking grows back, but solid parts thinner than \(2r\) and sharp convex tips are gone for good. Closing is dilation followed by erosion: it fills gaps narrower than \(2r\), small holes and sharp concave notches. A layout that respects a minimum feature of \(2r\), with corner radii of at least \(r\), is unchanged by both. That single property is the basis of the erosion and dilation penalty (Lesson 9) and of the design rule check and repair (Lesson 11).`,
bridge: "This is the background of Ch. 3 Sec. 3.5, for the erosion and dilation penalty of Eq. (3.15) and the design rule check and repair of Eq. (3.17). Hammond et al. 2021 showed that differentiable morphological transforms can be used inside photonic topology optimization. Christiansen and Sigmund 2021 build eroded and dilated designs with thresholds above and below 0.5. Tidy3D builds erosion and dilation the same way, as a filter plus a projection with thresholds 0.99 and 0.01 (ErosionDilationPenalty). The binary operations below are exact on the pixel grid, computed with a Euclidean distance transform.",
cards: [
/* from old ch3 L8 card 1 */
{s: "1. Erosion and dilation", t: "Shrinking and growing every feature by a disk",
intu: String.raw`The test layout (dark is GaAs) has a big block, a second block separated by a narrow gap, a thin bar, a block with a small hole and a small island. Erosion removes everything within \(r\) of the air (red): the thin bar and the island disappear completely. Dilation adds everything within \(r\) of the GaAs (blue): the gap closes and the hole fills. Switch the operation and change \(r\), or press Play to grow \(r\) and watch the features disappear one after another.`,
eq: String.raw`\[ \operatorname{erode}_r(X) = \{\, p : \operatorname{disk}(p, r) \subseteq X \,\} \]\[ \operatorname{dilate}_r(X) = \{\, p : \operatorname{disk}(p, r) \cap X \neq \emptyset \,\} \]`,
sym: [[String.raw`\(X\)`, "the GaAs region of the layout"], [String.raw`\(\operatorname{disk}(p, r)\)`, String.raw`disk of radius \(r\) centered at point \(p\)`], ["red", "GaAs removed by erosion"], ["blue", "air turned into GaAs by dilation"]],
how: [String.raw`Erosion: a point stays only if its distance to the nearest air is more than \(r\).`, String.raw`Dilation: a point is added if its distance to the nearest GaAs is at most \(r\).`, "Both are computed here from a Euclidean distance transform of the pixel map.", String.raw`Erosion of \(X\) is the same as dilation of the air, and the other way round.`],
say: String.raw`Erosion shrinks every GaAs feature by \(r\) and dilation grows it by \(r\), as if the edges were moved by a uniform etch bias.`,
num: String.raw`A bar of width \(w\) survives erosion only if \(w \gt 2r\). A gap of width \(g\) survives dilation only if \(g \gt 2r\).`,
r(fig, ctl) {
  let op = "e"; ctl.innerHTML = btns([["e", "Erode"], ["d", "Dilate"]], "o") + sl("r", "Disk radius r (pixels)", 1, 8, 0.5, 3) + '<div class="row"><button id="mp">Play: grow r</button></div><div class="readout" id="ro"></div>';
  const { X, W, H } = C3.pattern();
  const u = () => {
    pick(ctl, "o", op); const r = +$("r").value; $("rv").textContent = r;
    const Y = op === "e" ? C3.bErode(X, W, H, r, 0) : C3.bDilate(X, W, H, r, 0), rem = X.map((v, i) => v && !Y[i] ? 1 : 0), add = X.map((v, i) => !v && Y[i] ? 1 : 0);
    C3.draw(fig, X, W, H, 5.4, op === "e" ? "Red: GaAs removed by erosion." : "Blue: air filled by dilation.", [[rem, [216, 90, 48]], [add, [55, 138, 221]]]);
    const A = a => a.reduce((x, y) => x + y, 0);
    $("ro").innerHTML = `<div><span>GaAs area before</span><b>${A(X)} px</b></div><div><span>after</span><b>${A(Y)} px</b></div><div><span>islands after</span><b>${C3.components(Y, W, H, 1).length}</b></div>`;
  };
  let play = false, tt = 0, last = 0;
  ctl.querySelectorAll("button[data-o]").forEach(b => b.onclick = () => { op = b.dataset.o; u(); });
  $("r").oninput = () => { play = false; $("mp").textContent = "Play: grow r"; stopAnim(); u(); };
  $("mp").onclick = () => {
    play = !play; $("mp").textContent = play ? "Pause" : "Play: grow r";
    if (!play) { stopAnim(); return; }
    last = performance.now(); tt = 0; $("r").value = 1; u();
    anim(() => { if (!fig.isConnected || !play) { stopAnim(); return; } const now = performance.now(); tt += (now - last) / 1000; last = now; if (tt > 0.7) { tt = 0; const r = +$("r").value; $("r").value = r >= 8 ? 1 : r + 0.5; u(); } });
  };
  u();
}},

/* from old ch3 L8 card 2 */
{s: "2. Opening", t: "Opening: erode, then dilate back",
intu: String.raw`Opening first erodes, then dilates by the same radius. Features that were thick enough survive the erosion and grow back to almost exactly their old shape. Features thinner than \(2r\) vanished during the erosion and cannot grow back. Sharp convex corners come back rounded with radius \(r\), because the disk cannot reach into a tip. So the GaAs removed by opening, \(X \setminus \operatorname{open}_r(X)\), marks exactly the solid features that are too thin or too sharp. Change \(r\).`,
eq: String.raw`\[ \operatorname{open}_r(X) = \operatorname{dilate}_r\big(\operatorname{erode}_r(X)\big) \]\[ = \text{union of all disks of radius } r \text{ that fit inside } X \]`,
sym: [[String.raw`\(\operatorname{open}_r(X)\)`, String.raw`the part of \(X\) that can be swept by a disk of radius \(r\)`], [String.raw`\(X \setminus \operatorname{open}_r(X)\)`, String.raw`GaAs that a disk of radius \(r\) cannot reach: thin parts and sharp tips (red)`]],
how: [String.raw`Erosion leaves the centers of all disks of radius \(r\) that fit inside \(X\).`, "Dilation puts the disks back around those centers.", "The union of those disks is the opened shape.", "Anything not covered by such a disk, thin bars, small islands, corner tips, is removed."],
say: String.raw`Opening removes every solid feature narrower than \(2r\) and rounds convex corners to radius \(r\), while leaving larger features unchanged.`,
num: String.raw`A 90° convex corner loses \((1 - \pi/4)r^2 \approx 0.21r^2\) of area to opening, so a perfectly sharp corner always shows up as a small violation.`,
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

/* from old ch3 L8 card 3 */
{s: "3. Closing", t: "Closing: dilate, then erode back",
intu: String.raw`Closing is opening applied to the air. Dilation first fills every gap narrower than \(2r\) and every small hole. The erosion then pulls the outer edges back to where they were, but the filled gaps and holes stay filled. Sharp concave corners, inside notches, also get filled with a rounded fillet. The air filled by closing, \(\operatorname{close}_r(X) \setminus X\), marks exactly the gaps that are too narrow. Change \(r\).`,
eq: String.raw`\[ \operatorname{close}_r(X) = \operatorname{erode}_r\big(\operatorname{dilate}_r(X)\big) \]\[ = \text{complement of the opening of the air} \]`,
sym: [[String.raw`\(\operatorname{close}_r(X)\)`, String.raw`\(X\) with all narrow gaps, small holes and sharp notches filled`], [String.raw`\(\operatorname{close}_r(X) \setminus X\)`, String.raw`air that a disk of radius \(r\) cannot reach: narrow gaps and holes (blue)`]],
how: [String.raw`Dilate: gaps narrower than \(2r\) bridge over, holes smaller than the disk fill up.`, String.raw`Erode: outer edges move back by \(r\).`, "Bridged gaps are now deep inside GaAs, so they stay filled.", String.raw`By symmetry, closing \(X\) is the same as opening the air and taking the complement.`],
say: String.raw`Closing fills every gap narrower than \(2r\) and every hole too small for the disk, and leaves wider gaps unchanged.`,
num: String.raw`In this layout the gap between the two upper blocks is 4 pixels wide, so it is filled once \(r\) reaches 2 pixels.`,
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

/* from old ch3 L8 card 4 */
{s: "4. Both at once", t: "A layout that obeys the length scale is unchanged by both",
intu: String.raw`Put opening and closing together. Red marks solid that is too thin or too sharp, blue marks gaps that are too narrow. If neither color appears, every solid feature and every gap is at least \(2r\) wide and every corner has a radius of at least \(r\). Here you can choose the layout: the test pattern with its violations, or a clean layout built from rounded shapes with wide gaps. The clean one passes up to \(r = 6\) pixels and fails from \(r = 7\), when its narrowest parts, 14 pixels wide, reach \(2r\).`,
eq: String.raw`\[ X \text{ obeys length scale } r \quad\Longleftrightarrow\quad \operatorname{open}_r(X) = X = \operatorname{close}_r(X) \]`,
sym: [[String.raw`length scale \(r\)`, "half of the minimum feature and gap width"], ["clean layout", "rounded shapes, corner radius 7 pixels, all widths and gaps at least 14 pixels"]],
how: ["Opening never adds GaAs, closing never removes it.", String.raw`So \(\operatorname{close}_r(X) - \operatorname{open}_r(X) \ge 0\) everywhere, and it is zero only where neither operation changed anything.`, "This difference is exactly what the penalty of Lesson 9 measures, on a density map.", "The design rule check of Lesson 11 asks for zero area of both differences."],
say: String.raw`A layout has no feature or gap narrower than \(2r\), and no corner sharper than \(r\), exactly when opening and closing with radius \(r\) both leave it unchanged.`,
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

/* from old ch3 L8 card 5 */
{s: "5. Differentiable version", t: "Erosion and dilation as a filter and a projection",
intu: "The binary operations have no useful gradient. Tidy3D builds smooth versions from the tools of Lessons 5 and 6. Filter the density with the conic kernel, then project with a threshold near 1: only pixels whose whole neighborhood is GaAs stay, which is erosion. Project with a threshold near 0 instead: any GaAs in the neighborhood is enough, which is dilation. Combining them gives smooth opening and closing. Compare the smooth opening (middle) with the binary opening of the same radius (right). The readout measures how far a straight edge moves under the smooth erosion.",
eq: String.raw`\[ \operatorname{erode}(\hat\rho) = P_{\beta,\,0.99}\big(\operatorname{filter}_R(\hat\rho)\big) \qquad \operatorname{dilate}(\hat\rho) = P_{\beta,\,0.01}\big(\operatorname{filter}_R(\hat\rho)\big) \]\[ \mathcal{O} = \operatorname{dilate} \circ \operatorname{erode} \qquad \mathcal{C} = \operatorname{erode} \circ \operatorname{dilate} \]`,
sym: [[String.raw`\(P_{\beta,\eta}\)`, "tanh projection of Ch. 3 Eq. (3.9), Lesson 6"], [String.raw`\(\operatorname{filter}_R\)`, String.raw`conic filter of radius \(R\), Ch. 3 Eq. (3.8), Lesson 5`], [String.raw`\(0.99,\ 0.01\)`, String.raw`Tidy3D's default thresholds, \(1 \mp \mathtt{delta\_eta}\) with \(\mathtt{delta\_eta} = 0.01\)`], ["edge shift", "distance a straight edge moves under the smooth erosion"]],
how: [String.raw`Near a straight edge the filtered value falls from 1 inside to 0 outside over a distance of about \(2R\).`, String.raw`A threshold of 0.99 keeps only pixels nearly \(R\) inside the edge.`, String.raw`A threshold of 0.01 adds pixels up to nearly \(R\) outside it.`, String.raw`So the smooth operations act like a disk of radius slightly below \(R\), and remain differentiable through the tanh.`],
say: "Tidy3D makes erosion and dilation differentiable by filtering and then projecting with thresholds of 0.99 and 0.01, which moves edges by almost the filter radius.",
num: String.raw`Each edge moves by about \(R\) minus one pixel. So the smooth opening removes every bar narrower than \(R\), as Ch. 3 Sec. 3.5 states, and on this grid it removes bars up to about \(2R - \Delta\), roughly \(1.75R\), as well. In this implementation \(R\) plays the role of the disk radius \(r\) of the binary operations.`,
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

/* from old ch3 L8 card 6 */
{s: "6. The rolling disk", t: "Why opening removes thin parts and sharp tips",
intu: String.raw`Picture a disk of radius \(r\) rolled everywhere inside the GaAs without crossing into air. The opened shape is everything the disk can touch. The orange pixels are the possible centers of the disk, the eroded set, and the circles show a few disks. The disk cannot enter a bar thinner than its diameter, and it cannot reach into a sharp tip. Rolled in the air instead, the same disk explains closing. Change the radius.`,
eq: String.raw`\[ \operatorname{open}_r(X) = \bigcup \left\{\, \operatorname{disk}(c, r) : c \in \operatorname{erode}_r(X) \,\right\} \]`,
sym: [[String.raw`\(c\)`, "a possible center of the disk"], [String.raw`\(\operatorname{erode}_r(X)\)`, "all possible centers (orange)"], [String.raw`\(\bigcup\)`, "union of all such disks"]],
how: [String.raw`A center is allowed if its disk stays inside \(X\): that is the definition of erosion.`, String.raw`Dilation by \(r\) puts a disk around every allowed center.`, "So the opening is the union of all fitting disks.", String.raw`A tip of angle below 180° can never be filled by disks, so it is cut to radius \(r\).`],
say: String.raw`The opening is the region swept by a disk of radius \(r\) rolling inside the shape, so anything the disk cannot reach is removed.`,
num: String.raw`This picture also explains why the curvature of convex corners in an opened layout is at most \(1/r\).`,
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
}},

/* NEW CARD: opening and closing step by step */
{s: "7. Open and close, step by step", t: "Opening and closing on the board, one operation at a time",
intu: String.raw`Draw the two compound operations the way you would explain them at the board, one operation per step, on the same test layout. Opening: erode, and the thin bar and the island vanish while everything else shrinks. Then dilate by the same radius, and the survivors grow back, but what vanished cannot return. The red pixels are lost for good. Closing: dilate, and the narrow gap and the hole fill while everything grows. Then erode, and the outer edges return, but the bridged gap and the filled hole stay. The blue pixels are filled for good. The last step shows both at once, which is the picture behind the penalty of Eq. (3.15) and the check of Sec. 3.5. Step through and change the radius.`,
eq: String.raw`\[ \operatorname{open}_r(X) = \operatorname{dilate}_r\big(\operatorname{erode}_r(X)\big) \qquad \operatorname{close}_r(X) = \operatorname{erode}_r\big(\operatorname{dilate}_r(X)\big) \]\[ X \setminus \operatorname{open}_r(X) \ \ (\text{red}), \qquad \operatorname{close}_r(X) \setminus X \ \ (\text{blue}) \]<div class="eqref">the two sets the design rule check of Ch. 3 Sec. 3.5 requires to have zero area</div>`,
sym: [[String.raw`\(X\)`, "GaAs region of the layout"], ["grey outline", "the original layout, drawn under every step"], ["red", "GaAs removed by the opening"], ["blue", "air filled by the closing"]],
how: [String.raw`Erode by \(r\): keep only points whose disk of radius \(r\) fits in the GaAs.`, String.raw`Dilate the result by \(r\): what survived grows back almost exactly, so only thin parts and sharp tips are missing.`, String.raw`Dilate the original by \(r\): gaps narrower than \(2r\) and small holes fill.`, String.raw`Erode that by \(r\): the outer edges return, the filled gaps stay filled.`, "A layout that loses no red and gains no blue obeys the length scale."],
say: "Opening is erosion then dilation, and it removes solid parts thinner than 2r. Closing is dilation then erosion, and it fills gaps narrower than 2r. What changes under either one is a violation.",
num: String.raw`Ch. 3 checks a 120 nm rule with \(r = 59\) nm and repairs with \(\operatorname{open}_r(\operatorname{close}_r(X))\) at \(r = 63\) nm (Lesson 11).`,
r(fig, ctl) {
  ctl.innerHTML = sl("r", "Disk radius r (pixels)", 1, 6, 0.5, 3) + '<div class="readout" id="ro"></div>';
  fig.innerHTML = `<div id="m7m"></div><p class="note" id="m7c" style="font-size:14.5px;color:var(--fg);min-height:44px"></p>`;
  const { X, W, H } = C3.pattern();
  const CAP = ["", "Step 1. The layout X: blocks, a narrow gap, a thin bar, a hole and an island.", "Step 2. Opening, part 1: erode by r. The thin bar and the island vanish, everything shrinks.", "Step 3. Opening, part 2: dilate back by r. Survivors regrow, the red pixels are lost for good.", "Step 4. Closing, part 1: dilate X by r. The narrow gap and the hole fill, everything grows.", "Step 5. Closing, part 2: erode back by r. Outer edges return, the blue pixels stay filled.", "Step 6. Both at once: red is too thin, blue is too narrow. Zero of each means the layout obeys the length scale."];
  let cache = { r: -1 };
  const ops = r => { if (cache.r !== r) cache = { r, E: C3.bErode(X, W, H, r, 0), D: C3.bDilate(X, W, H, r, 0), O: C3.bOpen(X, W, H, r, 0), C: C3.bClose(X, W, H, r, 0) }; return cache; };
  const draw = S => {
    const k = S.k, r = +$("r").value; $("rv").textContent = r; const c = ops(r);
    const edge = new Uint8Array(W * H); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = y * W + x, v = X[i]; if ((x > 0 && X[i - 1] !== v) || (y > 0 && X[i - W] !== v)) edge[i] = 1; }
    const red = X.map((v, i) => v && !c.O[i] ? 1 : 0), blue = X.map((v, i) => !v && c.C[i] ? 1 : 0);
    const show = [null, X, c.E, c.O, c.D, c.C, X][k], ov = [];
    if (k === 3 || k === 6) ov.push([red, [216, 90, 48]]);
    if (k === 5 || k === 6) ov.push([blue, [55, 138, 221]]);
    ov.push([edge, [120, 120, 120]]);
    C3.draw($("m7m"), show, W, H, 5.4, "", ov);
    $("m7c").textContent = CAP[k];
    const A = a => a.reduce((x, y) => x + y, 0);
    $("ro").innerHTML = `<div><span>GaAs area shown</span><b>${A(show)} px</b></div><div><span>red: lost to opening</span><b>${k === 3 || k === 6 ? A(red) + " px" : "after step 3"}</b></div><div><span>blue: filled by closing</span><b>${k >= 5 ? A(blue) + " px" : "after step 5"}</b></div>`;
  };
  const S = C3L8_steps(fig, ctl, 6, 3, draw, "m7");
  $("r").oninput = () => draw(S);
}}

],
summary: String.raw`Erosion keeps the points where a disk of radius \(r\) fits inside the GaAs, dilation adds the points within \(r\) of it. Opening, erosion then dilation, is the union of all disks that fit, so it removes solid features narrower than \(2r\) and rounds convex corners to radius \(r\). Closing, dilation then erosion, fills gaps narrower than \(2r\), small holes and concave notches. A layout with no feature or gap below \(2r\) and no corner sharper than \(r\) is unchanged by both. Tidy3D builds differentiable versions by filtering and projecting with thresholds 0.99 and 0.01, which move edges by nearly the filter radius \(R\). They remove every feature narrower than \(R\), and on the grid also features up to just under \(2R\).`,
sheet: [
[String.raw`\[ \operatorname{erode}_r(X) = \{\, p : \operatorname{disk}(p, r) \subseteq X \,\} \]\[ \operatorname{dilate}_r(X) = \{\, p : \operatorname{disk}(p, r) \cap X \neq \emptyset \,\} \]`, "Erosion and dilation"],
[String.raw`\[ \operatorname{open}_r = \operatorname{dilate}_r \circ \operatorname{erode}_r \qquad \operatorname{close}_r = \operatorname{erode}_r \circ \operatorname{dilate}_r \]`, "Opening and closing"],
[String.raw`\[ \operatorname{open}_r(X) = X = \operatorname{close}_r(X) \]`, String.raw`\(X\) obeys minimum feature and gap \(2r\), corner radius \(r\)`],
[String.raw`\[ \operatorname{erode} = P_{\beta,0.99} \circ \operatorname{filter}_R \qquad \operatorname{dilate} = P_{\beta,0.01} \circ \operatorname{filter}_R \]`, "Differentiable versions (Tidy3D)"],
[String.raw`\[ \left(1 - \frac{\pi}{4}\right) r^2 \approx 0.21\, r^2 \]`, "Area cut from a sharp 90° corner by opening"]],
consts: "Test pattern 100 × 64 pixels. Binary operations use an exact Euclidean distance transform, with air beyond the border.",
sources: ["Hammond et al., Opt. Express 29, 23916 (2021) (differentiable morphological transforms for robustness and design rules)", "Christiansen and Sigmund, J. Opt. Soc. Am. B 38, 496 (2021) (eroded, nominal and dilated designs by threshold shifts)", "Flexcompute, Tidy3D 2.11.2 source: plugins/autograd/invdes/penalties.py (ErosionDilationPenalty, thresholds 1 ∓ delta_eta)", "Felzenszwalb and Huttenlocher, Theory of Computing 8, 415 (2012) (distance transform used for the binary operations in this page)"]
});

/* Step-through controls: Back, Play or Pause, Next, a step counter and a caption per step.
   draw(k, t) draws step k at time t (seconds). o.cont redraws every frame, o.loop restarts. */
const C3L11_steps = (fig, ctl, caps, draw, o) => {
  o = o || {}; const n = caps.length; let k = o.start || 0, play = !!o.play, tk = 0, tNow = 0, last = -1;
  ctl.insertAdjacentHTML("beforeend", `<div class="row"><button data-sb="b">Back</button><button data-sb="p">Play</button><button data-sb="n">Next step</button><span data-sb="s" style="font-size:13px;color:var(--muted);margin-left:6px"></span></div><p data-sb="c" style="font-size:14.5px;line-height:1.5;color:var(--fg);min-height:46px;margin:2px 0 8px"></p>`);
  const q = a => ctl.querySelector(`[data-sb="${a}"]`);
  const show = () => { q("s").textContent = `step ${k + 1} of ${n}`; q("c").textContent = caps[k]; q("b").disabled = k === 0; q("n").disabled = k === n - 1; q("p").textContent = play ? "Pause" : "Play"; };
  const redraw = () => { draw(k, tNow); last = k; show(); };
  q("b").onclick = () => { k = Math.max(0, k - 1); tk = tNow; play = false; redraw(); };
  q("n").onclick = () => { k = Math.min(n - 1, k + 1); tk = tNow; play = false; redraw(); };
  q("p").onclick = () => { play = !play; if (play && k === n - 1) k = 0; tk = tNow; redraw(); };
  anim(t => {
    if (!fig.isConnected) { stopAnim(); return; }
    tNow = t;
    let ch = false;
    if (play && t - tk > (o.dwell || 2.8)) { tk = t; ch = true; if (k < n - 1) k++; else if (o.loop) k = 0; else play = false; }
    if (o.cont || ch || k !== last) redraw();
  });
  return { redraw, get k() { return k; } };
};
/* Layout for the check, repair and re-optimize loop of card 6: 150 x 100 pixels of 5 nm.
   Two blocks, a block 60 nm from another, a 35 nm bridge, a small hole and a small island. */
const C3L11_loop = (() => {
  let cache = null;
  return () => {
    if (cache) return cache;
    const W = 150, H = 100, X = new Uint8Array(W * H), r = 59 / 5, rh = 63 / 5;
    C3.rrect(X, W, H, 8, 10, 66, 90, 14, 1); C3.rrect(X, W, H, 98, 10, 142, 52, 14, 1); C3.rrect(X, W, H, 98, 64, 142, 90, 12, 1);
    C3.rrect(X, W, H, 66, 72, 98, 79, 0, 1); C3.disk(X, W, H, 37, 50, 5, 0); C3.disk(X, W, H, 82, 30, 4, 1);
    const heal = Y => C3.bOpen(C3.bClose(Y, W, H, rh, 0), W, H, rh, 0), chk = Y => C3.drc(Y, W, H, r, 0, 12);
    const sd = Y => { const din = C3.edt(Y.map(v => v ? 0 : 1), W, H, 1), dout = C3.edt(Y, W, H, 0); return Float64Array.from(Y, (v, i) => v ? Math.sqrt(din[i]) - 0.5 : -(Math.sqrt(dout[i]) - 0.5)); };
    const field = (seed, fr) => { const rg = C3.rng(seed), T = []; for (let k = 0; k < 6; k++) T.push([(rg() - 0.5) * fr, (rg() - 0.5) * fr, rg() * 6.28]); return (x, y) => { let v = 0; for (const [a, b, c] of T) v += Math.sin(a * x + b * y + c); return v / Math.sqrt(3); }; };
    // boundary moves of at most 3 pixels = 15 nm along the normal, grown over five steps
    const move = (S, f, amp, k) => Uint8Array.from(S, (v, i) => { const x = i % W, y = (i - x) / W; return v + 3 * Math.tanh(amp * k / 5 * f(x, y)) > 0 ? 1 : 0; });
    const H0 = heal(X), S0 = sd(H0), f1 = field(6, 0.35), A = [1, 2, 3, 4, 5].map(k => move(S0, f1, 1.0, k)), H1 = heal(A[4]), S1 = sd(H1), f2 = field(16, 0.12), B = [1, 2, 3, 4, 5].map(k => move(S1, f2, 1.2, k));
    return (cache = { W, H, X, H0, A, H1, B, d0: chk(X), dH0: chk(H0), dA: chk(A[4]), dH1: chk(H1), dB: chk(B[4]) });
  };
})();
addLesson("thesis", "ch3", {
level: "Advanced",
id: "thesis-ch3-l11", title: "Design rule check, repair and re-optimization", short: "11. DRC and repair",
big: String.raw`The final PBS must pass three design rules: minimum GaAs width 120 nm, minimum air gap 120 nm, and minimum area \((120\ \mathrm{nm})^2\) for any island or hole. Penalties during the optimization only discourage violations, so the final layout gets a hard check. Tidy3D does not provide one, so the check runs in the same Python notebook as the optimization, in two independent ways, and a design is accepted only if both find no violation: the width and space checks of the KLayout layout tool, and morphology with a disk of radius \(r = 59\) nm computed with the Shapely geometry library. The GaAs removed by an opening and the air filled by a closing must both have zero area. A design that fails is repaired with the same operations and a slightly larger radius, \(X_{\mathrm{healed}} = \operatorname{open}_r(\operatorname{close}_r(X))\) with \(r = 63\) nm. The repair rounds corners and can lower the performance, so the repaired outline is optimized again with boundary vertices and the curvature penalty, checked and repaired every five steps, and only passing designs are kept.`,
bridge: String.raw`This is the last paragraph of Ch. 3 Sec. 3.5, design rule check and repair, Eq. (3.17). The rules, the two checks, the radii 59 nm and 63 nm and the five-step loop are from the thesis. Hammond et al. 2021 is the reference for why design rules should be part of the optimization itself. The checks on this page run on a pixel grid of 5 nm with an exact distance transform, as a picture of what the polygon checks in Shapely and KLayout do.`,
cards: [
/* from old ch3 L11 card 1, now the three rules of the thesis */
{s: "1. The rulebook", t: "Three design rules for the final PBS",
intu: String.raw`The final PBS must pass three rules. Minimum GaAs width: no GaAs line or arm narrower than 120 nm. Minimum air gap: no slot between GaAs features narrower than 120 nm. Minimum area: no GaAs island and no air hole smaller than \((120\ \mathrm{nm})^2 = 0.0144\ \mu\mathrm{m}^2\). The first two are one-dimensional, distances across GaAs or across air. The third is two-dimensional: a feature can be wide enough and still too small in area. Pick a rule to see what it measures.`,
eq: String.raw`\[ w_{\mathrm{GaAs}} \ge 120\ \mathrm{nm} \qquad g_{\mathrm{air}} \ge 120\ \mathrm{nm} \qquad A_{\mathrm{island}},\ A_{\mathrm{hole}} \ge (120\ \mathrm{nm})^2 \]<div class="eqref">Ch. 3 Sec. 3.5, design rule check</div>`,
sym: [[String.raw`\(w_{\mathrm{GaAs}}\)`, "width of a GaAs feature, measured across GaAs"], [String.raw`\(g_{\mathrm{air}}\)`, "width of an air gap, measured across air"], [String.raw`\(A_{\mathrm{island}}, A_{\mathrm{hole}}\)`, "area of a separate GaAs island, or of an air hole enclosed by GaAs"]],
how: ["Electron-beam lithography and the etch through the membrane limit how narrow a GaAs line can be written and survive.", "They also limit how narrow a slot can be opened and etched cleanly.", "Small islands and small holes are the first features to be lost or to close, hence the area rule.", "The gratings and tapers do not need this check: their widths are bounded by the tanh maps (80 nm minimum) and the tapers also by the curvature penalty."],
say: "The final PBS must pass three rules: minimum GaAs width 120 nm, minimum air gap 120 nm, and minimum area of 120 nm squared for any island or hole.",
num: String.raw`\((120\ \mathrm{nm})^2 = 14\,400\ \mathrm{nm}^2 = 0.0144\ \mu\mathrm{m}^2\). For comparison, Hammond et al. list five basic foundry rules (width, spacing, curvature, area and enclosed area) and tested rulebooks with widths and spacings of 60 to 120 nm.`,
note: "The thesis uses three rules, not five. The minimum radius of curvature is not a separate rule: the morphological check already flags corners sharper than its disk, and the curvature penalty discourages them during the outline optimization.",
r(fig, ctl) {
  let k = "w"; ctl.innerHTML = btns([["w", "GaAs width"], ["g", "Air gap"], ["a", "Area"]], "k");
  const u = () => {
    pick(ctl, "k", k); const on = x => x === k ? "c-coral" : "c-blue";
    let s = `<g class="${on("w")}"><rect x="60" y="40" width="30" height="130" rx="2"/></g>` + arrow(56, 186, 94, 186, "var(--t)", 1.3, null, true) + `<text class="ts" x="75" y="208" text-anchor="middle">GaAs width ≥ 120 nm</text>`;
    s += `<g class="${on("g")}"><rect x="200" y="40" width="70" height="130" rx="2"/><rect x="300" y="40" width="70" height="130" rx="2"/></g>` + arrow(270, 186, 300, 186, "var(--t)", 1.3, null, true) + `<text class="ts" x="285" y="208" text-anchor="middle">air gap ≥ 120 nm</text>`;
    s += `<g class="${on("a")}"><rect x="440" y="40" width="200" height="130" rx="4"/></g><rect x="480" y="90" width="22" height="22" rx="4" fill="var(--panel)" stroke="var(--blue)"/><g class="${on("a")}"><rect x="590" y="190" width="18" height="18" rx="4"/></g><text class="ts" x="491" y="82" text-anchor="middle">hole</text><text class="ts" x="560" y="204" text-anchor="end">island</text><text class="ts" x="540" y="232" text-anchor="middle">area ≥ (120 nm)²</text>`;
    const T = { w: "no GaAs line or arm narrower than 120 nm", g: "no slot of air between GaAs features narrower than 120 nm", a: "no GaAs island and no air hole smaller than (120 nm)², whatever its width" };
    fig.innerHTML = svg(270, s + `<text class="th" x="340" y="262" text-anchor="middle">${T[k]}</text>`);
  };
  ctl.querySelectorAll("button").forEach(b => b.onclick = () => { k = b.dataset.k; u(); }); u();
}},

/* from old ch3 L11 card 2, with the thesis radius rule/2 minus 1 nm */
{s: "2. Width and gap", t: "The morphological width and gap check, r = 59 nm",
intu: String.raw`The layout has two large blocks 90 nm apart, a 60 nm hole, a 60 nm line, a 60 nm island and a 130 nm round island. The check opens and closes the GaAs with a disk of radius \(r\). Red marks GaAs the opening removes, blue marks air the closing fills, and both must be empty. The thesis uses \(r = 59\) nm for a 120 nm rule: half the rule minus 1 nm, so that a feature exactly at the limit is not flagged by rounding. Switch the large blocks to sharp corners: every corner now fails, because a disk cannot fill a sharp tip. So this check also asks for rounded corners. Regions of a few pixels from staircase edges are ignored.`,
eq: String.raw`\[ \operatorname{area}\big(X \setminus \operatorname{open}_r(X)\big) = 0 \quad \text{and} \quad \operatorname{area}\big(\operatorname{close}_r(X) \setminus X\big) = 0 \]\[ r = \frac{\text{rule}}{2} - 1\ \mathrm{nm} = 59\ \mathrm{nm} \]<div class="eqref">Ch. 3 Sec. 3.5, morphology computed with Shapely</div>`,
sym: [[String.raw`\(X\)`, "GaAs region of the layout"], ["rule", "minimum width and minimum gap, 120 nm"], [String.raw`\(r\)`, "disk radius of the check, 59 nm"], [String.raw`\(\setminus\)`, "set difference: in the first set but not in the second"]],
how: [String.raw`Opening with radius \(r\) removes every GaAs part narrower than \(2r\) (Lesson 8).`, String.raw`Closing fills every air gap narrower than \(2r\).`, "So zero removed area means no line below the rule, and zero filled area means no gap below it.", String.raw`With \(r\) exactly half the rule, a feature exactly 120 nm wide sits on the limit, and rounding of its vertices could make it look a hair narrower. Taking 1 nm off the radius keeps such a feature from being flagged.`, "On polygons, Shapely computes the same with buffer operations: an erosion is a negative buffer, a dilation a positive one."],
say: "The morphological check opens and closes the layout with a disk of radius 59 nm, half the rule minus one nanometer, and the layout passes only if neither operation changes it.",
num: "With a 120 nm rule and r = 59 nm: the 90 nm gap, the 60 nm hole, the 60 nm line and the 60 nm island all fail. The 130 nm island passes this check, but see the next card.",
r(fig, ctl) {
  let sharp = false; ctl.innerHTML = sl("w", "Rule: minimum width and gap (nm)", 50, 200, 5, 120) + btns([["0", "Rounded corners"], ["1", "Sharp corners"]], "s") + '<div class="readout" id="ro"></div>';
  const u = () => {
    pick(ctl, "s", sharp ? 1 : 0); const w = +$("w").value, rr = w / 2 - 1; $("wv").textContent = w;
    const L = C3.drcLayout(sharp ? 0 : 16), d = C3.drc(L.X, L.W, L.H, rr / L.px, 0);
    C3.draw(fig, L.X, L.W, L.H, 3.2, `Disk radius r = rule/2 − 1 nm = ${rr.toFixed(1)} nm. Red: GaAs removed by opening. Blue: air filled by closing.`, [[d.solid, [216, 90, 48]], [d.gap, [55, 138, 221]]]);
    const nm2 = n => (n * 25 / 1e6).toFixed(4) + " µm²";
    $("ro").innerHTML = `<div><span>GaAs too thin</span><b>${d.rs} regions, ${nm2(d.ns)}</b></div><div><span>air too narrow</span><b>${d.rg} regions, ${nm2(d.ng)}</b></div><div><span>verdict</span><b>${d.ns + d.ng === 0 ? "pass" : "fail"}</b></div>`;
  };
  ctl.querySelectorAll("button").forEach(b => b.onclick = () => { sharp = b.dataset.s === "1"; u(); }); $("w").oninput = u; u();
}},

/* from old ch3 L11 card 3 */
{s: "3. Minimum area", t: "Islands and holes: the area rule",
intu: String.raw`The area rule looks at every connected island of GaAs and every hole in it. The minimum area is the square of the rule, \((120\ \mathrm{nm})^2\). Look at the round island of 130 nm diameter. It is wider than the rule, so it passes the width check, yet its area, \(\pi/4 \times 130^2 \approx 13\,300\ \mathrm{nm}^2\), is below \(120^2 = 14\,400\ \mathrm{nm}^2\). A disk exactly as wide as the rule always fails a square area rule, because \(\pi/4 \lt 1\). Width and area are independent rules. Move the rule.`,
eq: String.raw`\[ A_{\mathrm{island}} \ge A_{\mathrm{min}}, \qquad A_{\mathrm{hole}} \ge A_{\mathrm{min}}, \qquad A_{\mathrm{min}} = (120\ \mathrm{nm})^2 \]\[ \text{disk of diameter } w\text{:} \quad A = \frac{\pi}{4}\, w^2 \approx 0.785\, w^2 \]`,
sym: [["island", "connected GaAs region"], ["hole", "air region enclosed by GaAs"], [String.raw`\(A_{\mathrm{min}}\)`, "minimum area, (120 nm)² = 0.0144 µm²"]],
how: ["Find the connected regions of GaAs and of enclosed air.", "Measure each area.", String.raw`Flag those below \(A_{\mathrm{min}}\) (orange).`, "Holes that touch the edge of the layout are open air, not holes, and are not checked."],
say: "The area rule is checked separately because a feature can be wide enough and still too small in area.",
num: "Hammond et al. imposed minimum area and minimum enclosed area during their optimization, against tiny islands and tiny holes.",
r(fig, ctl) {
  ctl.innerHTML = sl("w", "Rule (nm), A_min = rule²", 50, 200, 5, 120) + '<div class="readout" id="ro"></div>';
  const L = C3.drcLayout(16);
  const u = () => {
    const w = +$("w").value; $("wv").textContent = w; const Amin = w * w / 25;
    const lab = C3.label(L.X, L.W, L.H), sz = {}; lab.forEach(l => { if (l >= 0) sz[l] = (sz[l] || 0) + 1; });
    const air = L.X.map(v => v ? 0 : 1), la = C3.label(air, L.W, L.H), sa = {}, edge = {}; la.forEach((l, i) => { if (l >= 0) { sa[l] = (sa[l] || 0) + 1; const x = i % L.W, y = (i - x) / L.W; if (x === 0 || y === 0 || x === L.W - 1 || y === L.H - 1) edge[l] = 1; } });
    const bad = new Uint8Array(L.X.length); lab.forEach((l, i) => { if (l >= 0 && sz[l] < Amin) bad[i] = 1; }); la.forEach((l, i) => { if (l >= 0 && !edge[l] && sa[l] < Amin) bad[i] = 1; });
    C3.draw(fig, L.X, L.W, L.H, 3.2, "Orange: islands or holes below the minimum area.", [[bad, [239, 159, 39]]]);
    const isl = Object.values(sz).sort((a, b) => a - b).map(v => (v * 25 / 1e6).toFixed(4)), hol = Object.keys(sa).filter(k => !edge[k]).map(k => (sa[k] * 25 / 1e6).toFixed(4));
    $("ro").innerHTML = `<div><span>A_min</span><b>${(w * w / 1e6).toFixed(4)} µm²</b></div><div><span>island areas (µm²)</span><b>${isl.join(", ")}</b></div><div><span>hole areas (µm²)</span><b>${hol.join(", ") || "none"}</b></div>`;
  };
  $("w").oninput = u; u();
}},

/* from old ch3 L11 card 4 */
{s: "4. Two independent checks", t: "KLayout edge checks and the Shapely rolling disk",
intu: String.raw`The check is run in two independent ways, and a design is accepted only if both find no violation. The first uses the width and space checks of the KLayout layout tool, which measure distances between edges: for width, between edges facing each other across GaAs, for space, across air. Any pair closer than the rule is flagged. The second uses morphology with a disk of radius 59 nm in the Shapely geometry library. The two agree on bars and gaps, but they look at corners differently. An edge check usually ignores a sharp convex corner, since no two facing edges are close. The disk check flags it, because the disk cannot reach the tip. Pick a situation.`,
eq: String.raw`<div class="eqnote">KLayout width and space checks</div>\[ \text{flag edge pairs with distance } d \lt 120\ \mathrm{nm} \]<div class="eqnote">Shapely morphology, r = 59 nm</div>\[ \text{flag } \operatorname{area}\big(X \setminus \operatorname{open}_r(X)\big) \gt 0 \;\text{ or }\; \operatorname{area}\big(\operatorname{close}_r(X) \setminus X\big) \gt 0 \]<div class="eqref">Ch. 3 Sec. 3.5</div>`,
sym: [["edge pair", "two outline segments facing each other"], [String.raw`\(d\)`, "distance between them, measured across GaAs (width) or air (space)"], [String.raw`\(r\)`, "disk radius, 59 nm"]],
how: ["Run KLayout's width and space checks on the polygon.", "Run the Shapely open and close check on the same polygon.", "Accept the design only if both report no violation.", "Two methods with different blind spots make an error in one of them much less likely to pass unnoticed."],
say: "The layout is checked in two independent ways, by the width and space checks of KLayout and by morphology in Shapely, and is accepted only if both find no violation.",
num: "The morphological check is stricter at corners, which is why a layout that passes it also has rounded corners.",
r(fig, ctl) {
  let m = "bar"; ctl.innerHTML = btns([["bar", "Narrow bar"], ["gap", "Narrow gap"], ["tip", "Sharp convex corner"]], "m") + '<div class="readout" id="ro"></div>';
  const u = () => {
    pick(ctl, "m", m); let s = "", ke = "", mo = "";
    if (m === "bar") { s += `<rect x="80" y="60" width="180" height="40" fill="var(--blue-bg)" stroke="var(--blue)"/>` + arrow(150, 60, 150, 100, "#D85A30", 2, null, true) + `<text class="ts" x="160" y="85">d &lt; rule</text><rect x="400" y="60" width="180" height="40" fill="var(--coral-bg)" stroke="#D85A30"/><circle cx="490" cy="80" r="34" fill="none" stroke="var(--t)" stroke-dasharray="4 3"/>`; ke = "flagged"; mo = "flagged"; }
    if (m === "gap") { s += `<rect x="80" y="40" width="180" height="40" fill="var(--blue-bg)" stroke="var(--blue)"/><rect x="80" y="100" width="180" height="40" fill="var(--blue-bg)" stroke="var(--blue)"/>` + arrow(150, 80, 150, 100, "#D85A30", 2, null, true) + `<rect x="400" y="40" width="180" height="40" fill="var(--blue-bg)" stroke="var(--blue)"/><rect x="400" y="100" width="180" height="40" fill="var(--blue-bg)" stroke="var(--blue)"/><rect x="400" y="80" width="180" height="20" fill="#378ADD" opacity="0.5"/>`; ke = "flagged"; mo = "flagged"; }
    if (m === "tip") { s += `<path d="M80 150 L260 150 L260 40 Z" fill="var(--blue-bg)" stroke="var(--blue)"/><text class="ts" x="170" y="175" text-anchor="middle">no two facing edges are close</text><path d="M400 150 L580 150 L580 40 Z" fill="var(--blue-bg)" stroke="var(--blue)"/><path d="M400 150 L470 150 L462 140 Z" fill="#D85A30"/><path d="M580 40 L580 75 L569 63 Z" fill="#D85A30"/><circle cx="545" cy="126" r="22" fill="none" stroke="var(--t)" stroke-dasharray="4 3"/>`; ke = "usually not flagged"; mo = "flagged (red tips)"; }
    s += `<text class="th" x="170" y="25" text-anchor="middle">edge distance (KLayout)</text><text class="th" x="490" y="25" text-anchor="middle">rolling disk (Shapely)</text>`;
    fig.innerHTML = svg(190, s);
    $("ro").innerHTML = `<div><span>KLayout width and space</span><b>${ke}</b></div><div><span>Shapely morphology</span><b>${mo}</b></div><div><span>accepted</span><b>no, one check is enough to reject</b></div>`;
  };
  ctl.querySelectorAll("button").forEach(b => b.onclick = () => { m = b.dataset.m; u(); }); u();
}},

/* from old ch3 L11 card 5, now a step-through of close, then open, then check */
{s: "5. Repair", t: "Healing with a closing, then an opening, r = 63 nm",
intu: String.raw`A design that fails is repaired with the same operations and a slightly larger radius. The closing fills every air gap narrower than \(2r\), and the opening then removes every GaAs feature narrower than \(2r\). The radius, 63 nm, is 3 nm larger than half the rule, so that rounding the layout to a 1 nm grid cannot create a new violation. The repair also rounds the corners of the outline. Step through: the failing layout, the closing, the opening, and the check of the result. Note what repair does not fix: an island that is wide enough but too small in area.`,
eq: String.raw`\[ X_{\mathrm{healed}} = \mathrm{open}_r\big(\mathrm{close}_r(X)\big), \qquad r = 63\ \mathrm{nm} \]<div class="eqref">Ch. 3 Eq. (3.17)</div>`,
sym: [[String.raw`\(\mathrm{close}_r\)`, String.raw`dilation then erosion: fills gaps and holes narrower than \(2r\)`], [String.raw`\(\mathrm{open}_r\)`, String.raw`erosion then dilation: removes lines and islands narrower than \(2r\)`], [String.raw`\(r\)`, "repair radius, 63 nm = 120/2 + 3 nm"], [String.raw`\(X_{\mathrm{healed}}\)`, "the repaired GaAs region"]],
how: ["Closing first, so narrow gaps become solid before anything is removed.", "Opening second, so thin lines, small islands and sharp tips left over are removed.", String.raw`Use \(r = 63\) nm, 3 nm above half the rule: after the polygon is rounded to a 1 nm grid, no feature can come back below 120 nm.`, "Check the healed layout again with r = 59 nm. The repair changes the geometry, so the performance must be recomputed (card 6)."],
say: "The repair closes then opens the layout with a radius of 63 nanometers, 3 nanometers more than half the rule, which removes every width and gap violation and rounds the corners, at the cost of changing the geometry.",
num: "In the picture the 90 nm slot between the two big blocks is filled, so the blocks merge: repair can change a device a lot, which is why the outline is optimized again afterwards.",
r(fig, ctl) {
  ctl.innerHTML = sl("h", "Repair radius r (nm)", 60, 80, 1, 63) + '<div class="readout" id="ro"></div>';
  const L = C3.drcLayout(16), rule = 120;
  let st = null, cache = {};
  const comp = hr => { if (cache[hr]) return cache[hr]; const C = C3.bClose(L.X, L.W, L.H, hr / L.px, 0), Hd = C3.bOpen(C, L.W, L.H, hr / L.px, 0); return (cache[hr] = { C, Hd, d0: C3.drc(L.X, L.W, L.H, (rule / 2 - 1) / L.px, 0), d: C3.drc(Hd, L.W, L.H, (rule / 2 - 1) / L.px, 0) }); };
  const caps = ["The failing layout, checked with r = 59 nm. Red: GaAs too thin. Blue: air too narrow.",
    "Step 1, close with r = 63 nm. Blue: air filled. The narrow slot between the two big blocks and the small hole fill up.",
    "Step 2, open the closed layout with r = 63 nm. Red: GaAs removed. The thin line, the small island and the sharp tips go.",
    "Check the result again with r = 59 nm. Width and gap now pass. The 130 nm island is still below the area rule."];
  const draw = k => {
    const hr = +$("h").value; $("hv").textContent = hr; const c = comp(hr);
    let maps;
    if (k === 0) maps = [{ a: L.X, over: [[c.d0.solid, [216, 90, 48]], [c.d0.gap, [55, 138, 221]]] }];
    else if (k === 1) maps = [{ a: c.C, over: [[c.C.map((v, i) => v && !L.X[i] ? 1 : 0), [55, 138, 221]]] }];
    else if (k === 2) maps = [{ a: c.Hd, over: [[c.Hd.map((v, i) => !v && c.C[i] ? 1 : 0), [216, 90, 48]]] }];
    else maps = [{ a: c.Hd, over: [[c.d.solid, [216, 90, 48]], [c.d.gap, [55, 138, 221]]] }];
    C3.drawRow(fig, [{ a: L.X }].concat(maps), L.W, L.H, 1.95, "", ["original X", ["checked, r = 59 nm", "close_r(X)", "open_r(close_r(X))", "X_healed checked"][k]]);
    const isl = C3.components(c.Hd, L.W, L.H, 1).map(q => q.area * 25), small = isl.filter(a => a < rule * rule).length;
    $("ro").innerHTML = `<div><span>width and gap check, before / after</span><b>${c.d0.ns + c.d0.ng === 0 ? "pass" : "fail"} / ${c.d.ns + c.d.ng === 0 ? "pass" : "fail"}</b></div><div><span>islands below (120 nm)² after repair</span><b>${small}</b></div><div><span>GaAs area change</span><b>${(((c.Hd.reduce((a, b) => a + b, 0) - L.X.reduce((a, b) => a + b, 0)) * 25) / 1e6).toFixed(4)} µm²</b></div>`;
  };
  st = C3L11_steps(fig, ctl, caps, draw, { dwell: 3 });
  $("h").oninput = () => st.redraw();
}},

/* NEW: the loop of the thesis, check, repair, optimize again, every five steps */
{s: "6. Check, repair, re-optimize", t: "The loop that keeps the outline within the rules",
intu: String.raw`The repair changes the geometry, so it can lower the performance. The repaired outline is therefore optimized again by inverse design, now with the boundary vertices of Eq. (3.11) and the curvature penalty, in a loop that keeps it within the rules. Every five steps the outline is checked and repaired again, and only designs that pass the check are kept. Step through one turn of the loop, or press Play. The boundary moves here are a smooth random field of at most 15 nm along the normal, standing in for the optimizer steps. In the first turn the outline grows small bumps that break the rule, so it is repaired. In the second turn it stays smooth and passes as it is.`,
eq: String.raw`\[ \mathbf{r}_i = \mathbf{r}_i^{(0)} + \Delta_{\mathrm{max}}\tanh(p_i)\,\hat{\mathbf{n}}_i, \qquad \Delta_{\mathrm{max}} = 15\ \mathrm{nm}, \qquad J = F - w_\kappa P_\kappa \]\[ \text{every 5 steps:}\quad \text{check } (r = 59\ \mathrm{nm}) \;\to\; X \leftarrow \mathrm{open}_r\big(\mathrm{close}_r(X)\big)\ (r = 63\ \mathrm{nm}) \;\to\; \text{keep only if it passes} \]<div class="eqref">Ch. 3 Sec. 3.5 with Eqs. (3.11), (3.16) and (3.17)</div>`,
sym: [[String.raw`\(\mathbf{r}_i\)`, "free vertex of the outline, moved along its normal (Lesson 4)"], [String.raw`\(\Delta_{\mathrm{max}}\)`, "largest move of a vertex, 15 nm"], [String.raw`\(w_\kappa P_\kappa\)`, "curvature penalty, which keeps the outline smooth between checks (Lesson 10)"], ["kept design", "an outline that passed the check, so it can be fabricated"]],
how: ["Start from the repaired outline, which passes the check.", "Optimize it by inverse design: vertices move along their normals by at most 15 nm, and the curvature penalty discourages sharp corners.", "After five steps, run the check with r = 59 nm.", "If it fails, repair with r = 63 nm and check again. Keep only designs that pass.", "Repeat. The result is the best of the passing designs."],
say: "After the repair the outline is optimized again with boundary vertices and the curvature penalty, and every five steps it is checked and repaired, so only designs that pass the rules are kept.",
num: "In this picture: 150 × 100 pixels of 5 nm, check radius 59 nm, repair radius 63 nm, boundary moves of at most 3 pixels (15 nm). Regions below 300 nm² are ignored as staircase specks of the pixel grid.",
note: "Hammond et al. argue that design rules should be part of the optimization itself, since a device that is changed after the optimization no longer has the optimized geometry. This loop is how the thesis does that for the PBS: the repair is never the last word, an optimization step always follows it.",
r(fig, ctl) {
  const D = C3L11_loop(), { W, H } = D, RED = [216, 90, 48], BLU = [55, 138, 221];
  const ok = d => d.ns + d.ng === 0, ov = d => [[d.solid, RED], [d.gap, BLU]];
  const caps = ["The binary design from the topology stage, as one polygon. Check with r = 59 nm: red GaAs too thin, blue air too narrow. It fails.",
    "Repair: open_r(close_r(X)) with r = 63 nm. Blue: air filled, red: GaAs removed. The narrow slot and the hole fill, the thin bridge and the small island go, the corners round off.",
    "Check again: it passes. But the geometry changed, so the performance may have dropped.",
    "Optimize again: five steps of boundary vertices, each vertex moving at most 15 nm along its normal, with the curvature penalty.",
    "After five steps: check. A few bumps grew sharper than the 59 nm disk allows, so the check fails.",
    "Repair with r = 63 nm (blue: filled, red: removed), then check again: it passes. This design is kept.",
    "Five more steps. This time the outline stays smooth, the check passes without repair, and this design is kept too.",
    "Only designs that passed the check are kept. The loop goes on, and the best kept design is the result."];
  const kept = (k, j) => k >= 7 || (k === 6 && j === 4) ? "2 kept" : k >= 5 ? "1 kept" : "none yet";
  let k0 = -1, te = 0;
  ctl.innerHTML = '<div id="c6c"></div><div class="readout" id="ro"></div>';
  C3L11_steps(fig, $("c6c"), caps, (k, t) => {
    if (k !== k0) { k0 = k; te = t; }
    const j = Math.min(4, Math.floor((t - te) / 0.8));
    let a, d, lab;
    if (k === 0) { a = D.X; d = D.d0; lab = "topology design, checked"; }
    else if (k === 1) { a = D.H0; d = null; lab = "repaired"; }
    else if (k === 2) { a = D.H0; d = D.dH0; lab = "repaired, checked"; }
    else if (k === 3) { a = D.A[j]; d = null; lab = `optimizer step ${j + 1} of 5`; }
    else if (k === 4) { a = D.A[4]; d = D.dA; lab = "after five steps, checked"; }
    else if (k === 5) { a = D.H1; d = D.dH1; lab = "repaired and checked: kept"; }
    else if (k === 6) { a = D.B[j]; d = j === 4 ? D.dB : null; lab = j === 4 ? "five more steps, checked: kept" : `optimizer step ${j + 1} of 5`; }
    else { C3.drawRow(fig, [{ a: D.H1 }, { a: D.B[4] }], W, H, 2.2, "Both kept designs pass the check. Only passing designs are kept, and the best of them is the result.", ["kept 1: repaired", "kept 2: passed as it was"]); $("ro").innerHTML = `<div><span>kept designs</span><b>2</b></div><div><span>check radius / repair radius</span><b>59 / 63 nm</b></div>`; return; }
    const before = k === 1 ? D.X : k === 5 ? D.A[4] : null, over = d ? ov(d) : [];
    if (before) { over.push([a.map((v, i) => v && !before[i] ? 1 : 0), BLU]); over.push([a.map((v, i) => !v && before[i] ? 1 : 0), RED]); }
    if (k === 5) over.splice(0, 2);
    C3.drawRow(fig, [{ a, over }], W, H, 3.4, "", [lab]);
    $("ro").innerHTML = `<div><span>check (r = 59 nm)</span><b>${d ? (ok(d) ? "pass" : "fail") : "not run"}</b></div><div><span>kept designs</span><b>${kept(k, j)}</b></div><div><span>check radius / repair radius</span><b>59 / 63 nm</b></div>`;
  }, { cont: true, dwell: 5 });
}}

],
summary: String.raw`The final PBS must pass three rules: minimum GaAs width 120 nm, minimum air gap 120 nm and minimum area \((120\ \mathrm{nm})^2\) for any island or hole. Tidy3D has no design rule check, so it runs in the optimization notebook, in two independent ways: the width and space checks of KLayout, and morphology in Shapely with a disk of radius 59 nm, half the rule minus 1 nm so that a feature exactly at the limit is not flagged by rounding. The GaAs removed by opening, \(X \setminus \mathrm{open}_r(X)\), and the air filled by closing, \(\mathrm{close}_r(X) \setminus X\), must both have zero area. A failing design is repaired by \(X_{\mathrm{healed}} = \mathrm{open}_r(\mathrm{close}_r(X))\) with \(r = 63\) nm (Eq. 3.17), 3 nm more than half the rule, so rounding to a 1 nm grid cannot create a new violation. The repair rounds corners and can lower the performance, so the outline is optimized again with boundary vertices and the curvature penalty, checked and repaired every five steps, and only passing designs are kept.`,
sheet: [
[String.raw`\[ w_{\mathrm{GaAs}} \ge 120\ \mathrm{nm}, \qquad g_{\mathrm{air}} \ge 120\ \mathrm{nm}, \qquad A_{\mathrm{island}},\ A_{\mathrm{hole}} \ge (120\ \mathrm{nm})^2 \]`, "The three rules for the final PBS (Sec. 3.5)"],
[String.raw`\[ \operatorname{area}\big(X \setminus \operatorname{open}_r(X)\big) = 0, \qquad \operatorname{area}\big(\operatorname{close}_r(X) \setminus X\big) = 0, \qquad r = 59\ \mathrm{nm} \]`, "Morphological check in Shapely, r = rule/2 − 1 nm, together with the KLayout width and space checks"],
[String.raw`\[ \frac{\pi}{4}\, w^2 \lt w^2 \]`, "A disk as wide as the rule fails the square area rule"],
[String.raw`\[ X_{\mathrm{healed}} = \mathrm{open}_r\big(\mathrm{close}_r(X)\big), \qquad r = 63\ \mathrm{nm} \]`, "Repair, r = rule/2 + 3 nm (Ch. 3 Eq. 3.17)"],
[String.raw`\[ \text{every 5 steps: check} \to \text{repair} \to \text{keep only passing designs} \]`, "Re-optimization with boundary vertices and the curvature penalty"]],
consts: "Pixel grid of 5 nm, exact distance-transform morphology, air beyond the border, regions below 12 pixels (300 nm²) ignored as staircase specks. Thesis settings: rule 120 nm, check radius 59 nm, repair radius 63 nm, Δ_max = 15 nm, check every 5 steps.",
sources: ["Hammond et al., Opt. Express 29, 23916 (2021) (design rules belong inside the optimization, foundry rules including minimum area)", "KLayout layout tool (width and space checks), as used by the thesis code", "Shapely geometry library (polygon buffer operations for opening and closing), as used by the thesis code", "Felzenszwalb and Huttenlocher, Theory of Computing 8, 415 (2012) (distance transform used in this page)"]
});

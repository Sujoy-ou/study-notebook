addLesson("thesis", "ch3", {
level: "Advanced",
id: "thesis-ch3-l11", title: "Design rule check, repair and the DRC-safe stage", short: "11. DRC and repair",
big: "A foundry or a cleanroom accepts a layout only if it passes a design rule check (DRC): no GaAs line narrower than a minimum width, no air gap narrower than a minimum gap, no island or hole smaller than a minimum area. Penalties during the optimization only discourage violations, so the final layout is checked with hard rules. The width and gap rules can be checked by morphology: the GaAs removed by an opening with a disk of half the rule, and the air filled by a closing, must both have zero area. A layout that fails is repaired with the same operations, a closing then an opening with a slightly larger radius. Repair changes the geometry, so the optimization continues from the repaired outline in short, small-step runs, keeping only outlines that pass.",
bridge: "This is Ch. 3 Sec. 3.5, design rule check and repair, Eq. (3.18). Tidy3D has no design rule check, so this part is separate code written for the thesis, using the Shapely geometry library and the KLayout layout tool. Hammond et al. 2021 is the reference for why rules must be part of the optimization, for the five basic foundry rules, and for what happens when rules are switched on. The checks below run on a pixel grid of 5 nm with an exact distance transform, as a picture of what the polygon-based checks do.",
cards: [
{s: "1. The rulebook", t: "Five basic design rules",
intu: "Hammond et al. list five basic rules that a foundry checks. Three are one-dimensional: minimum linewidth, minimum spacing between features, minimum radius of curvature. Two are two-dimensional: minimum area of an island and minimum enclosed area of a hole. A shape can pass every 1D rule and still fail a 2D rule, for example a round island that is wide enough but too small in area. The thesis checks width, gap and area. Pick a rule to see what it measures.",
eq: String.raw`\[ w \ge w_{\mathrm{min}} \qquad g \ge g_{\mathrm{min}} \qquad r \ge r_{\mathrm{min}} \]\[ A_{\mathrm{island}} \ge A_{\mathrm{min}} \qquad A_{\mathrm{hole}} \ge A_{\mathrm{hole,min}} \]`,
sym: [[String.raw`\(w\)`, "width of a GaAs feature"], [String.raw`\(g\)`, "width of an air gap"], [String.raw`\(r\)`, "radius of curvature of the outline"], [String.raw`\(A\)`, "area of an island or hole"]],
how: ["Lithography resolution limits how narrow a line can be.", "Proximity effects and etch limits set how narrow a gap can be.", "Resist and etching round corners.", "Small islands lift off and small holes do not open, hence area rules."],
say: "The design rule check verifies minimum width, minimum gap and minimum area, and a layout that fails any rule is not accepted for fabrication.",
num: "Hammond et al. tested rulebooks with widths and spacings of 60 to 120 nm and areas of 0.005 to 0.2 µm². A typical example: 90 nm width and spacing, 0.08 µm² area, 0.2 µm² enclosed area.",
r(fig, ctl) {
  let k = "w"; ctl.innerHTML = btns([["w", "Width"], ["g", "Gap"], ["c", "Curvature"], ["a", "Area"], ["h", "Enclosed area"]], "k");
  const u = () => {
    pick(ctl, "k", k); const on = x => x === k ? "c-coral" : "c-blue";
    let s = `<g class="${on("w")}"><rect x="30" y="40" width="22" height="120" rx="2"/></g>` + arrow(28, 175, 54, 175, "var(--t)", 1.3, null, true) + `<text class="ts" x="41" y="196" text-anchor="middle">width</text>`;
    s += `<g class="${on("g")}"><rect x="100" y="40" width="40" height="120" rx="2"/><rect x="156" y="40" width="40" height="120" rx="2"/></g>` + arrow(140, 175, 156, 175, "var(--t)", 1.3, null, true) + `<text class="ts" x="148" y="196" text-anchor="middle">gap</text>`;
    s += `<g class="${on("c")}"><path d="M240 160 L240 70 Q240 40 270 40 L330 40 L330 160 Z" stroke-width="1"/></g><circle cx="270" cy="70" r="30" fill="none" stroke="var(--t)" stroke-dasharray="3 3"/><text class="ts" x="285" y="196" text-anchor="middle">corner radius</text>`;
    s += `<g class="${on("a")}"><rect x="390" y="88" width="22" height="22" rx="4"/></g><text class="ts" x="401" y="196" text-anchor="middle">island area</text>`;
    s += `<g class="${on("h")}"><rect x="470" y="40" width="170" height="120" rx="4"/></g><rect x="545" y="90" width="18" height="18" rx="3" fill="var(--panel)" stroke="var(--blue)"/><text class="ts" x="555" y="196" text-anchor="middle">hole (enclosed) area</text>`;
    const T = { w: "a GaAs line must be at least w_min wide", g: "two features must be at least g_min apart", c: "the outline must not bend tighter than r_min", a: "an isolated GaAs island must have at least A_min of area", h: "a hole in GaAs must have at least A_hole,min of area" };
    fig.innerHTML = svg(240, s + `<text class="th" x="340" y="228" text-anchor="middle">${T[k]}</text>`);
  };
  ctl.querySelectorAll("button").forEach(b => b.onclick = () => { k = b.dataset.k; u(); }); u();
}},

{s: "2. Width and gap", t: "The morphological width and gap check",
intu: String.raw`The layout has two large blocks 90 nm apart, a 60 nm hole, a 60 nm line, a 60 nm island and a 130 nm round island. Choose the rule. The check opens and closes the GaAs with a disk of radius \(r = \text{rule}/2\). Red marks GaAs the opening removes, blue marks air the closing fills. Both must be empty. Switch the large blocks to sharp corners: every corner now fails, because a disk cannot fill a sharp tip. So this check also asks for corner radii of at least \(r\). Regions of a few pixels from staircase edges are ignored.`,
eq: String.raw`\[ \text{pass} \;\Longleftrightarrow\; \operatorname{area}\big(X \setminus \operatorname{open}_r(X)\big) = 0 \;\text{ and }\; \operatorname{area}\big(\operatorname{close}_r(X) \setminus X\big) = 0 \]\[ r = \text{rule}/2 \]`,
sym: [[String.raw`\(X\)`, "GaAs region of the layout"], ["rule", "minimum width and minimum gap, 120 nm in the thesis"], [String.raw`\(r\)`, "disk radius, half the rule"]],
how: [String.raw`Opening with radius \(r\) removes every GaAs part narrower than \(2r\) (Lesson 8).`, String.raw`Closing fills every air gap narrower than \(2r\).`, "So zero removed area means no line below the rule, zero filled area means no gap below it.", "On polygons, Shapely computes the same with buffer operations: an erosion is a negative buffer, a dilation a positive one."],
say: "The morphological check opens and closes the layout with a disk of half the rule, and the layout passes only if neither operation changes it.",
num: "With a 120 nm rule: the 90 nm gap, the 60 nm hole, the 60 nm line and the 60 nm island all fail. The 130 nm island passes this check, but see the next card.",
r(fig, ctl) {
  let sharp = false; ctl.innerHTML = sl("w", "Rule: minimum width and gap (nm)", 50, 200, 5, 120) + btns([["0", "Rounded corners"], ["1", "Sharp corners"]], "s") + '<div class="readout" id="ro"></div>';
  const u = () => {
    pick(ctl, "s", sharp ? 1 : 0); const w = +$("w").value; $("wv").textContent = w;
    const L = C3.drcLayout(sharp ? 0 : 16), r = w / 2 / L.px, d = C3.drc(L.X, L.W, L.H, r, 0);
    C3.draw(fig, L.X, L.W, L.H, 3.2, `Disk radius r = ${(w / 2).toFixed(1)} nm. Red: GaAs removed by opening. Blue: air filled by closing.`, [[d.solid, [216, 90, 48]], [d.gap, [55, 138, 221]]]);
    const nm2 = n => (n * 25 / 1e6).toFixed(4) + " µm²";
    $("ro").innerHTML = `<div><span>solid violations</span><b>${d.rs} regions, ${nm2(d.ns)}</b></div><div><span>gap violations</span><b>${d.rg} regions, ${nm2(d.ng)}</b></div><div><span>verdict</span><b>${d.ns + d.ng === 0 ? "pass" : "fail"}</b></div>`;
  };
  ctl.querySelectorAll("button").forEach(b => b.onclick = () => { sharp = b.dataset.s === "1"; u(); }); $("w").oninput = u; u();
}},

{s: "3. Minimum area", t: "Islands and holes: the area rule",
intu: String.raw`The area rule looks at every connected island of GaAs and every hole in it. Here the minimum area is the square of the rule. Look at the round island of 130 nm diameter. It is wider than a 120 nm rule, so it passes the width check, yet its area, \(\pi/4 \times 130^2 \approx 13\,300\) nm², is below \(120^2 = 14\,400\) nm². A disk exactly as wide as the rule always fails a square area rule, because \(\pi/4 \lt 1\). Width and area are independent rules.`,
eq: String.raw`\[ A_{\mathrm{island}} \ge A_{\mathrm{min}} \qquad A_{\mathrm{hole}} \ge A_{\mathrm{min}} \qquad \text{here } A_{\mathrm{min}} = (\text{rule})^2 \]\[ \text{disk of diameter } w\text{:} \quad A = \frac{\pi}{4}\, w^2 \approx 0.785\, w^2 \]`,
sym: [["island", "connected GaAs region"], ["hole", "air region enclosed by GaAs"], [String.raw`\(A_{\mathrm{min}}\)`, "minimum area, (120 nm)² = 0.0144 µm² in the thesis"]],
how: ["Find connected regions of GaAs and of enclosed air.", "Measure each area.", String.raw`Flag those below \(A_{\mathrm{min}}\) (orange).`, "Hammond et al. find these contours with marching squares in their optimization."],
say: "The area rule is checked separately because a feature can be wide enough and still too small in area.",
num: "Hammond et al. make the area rules their new contribution: minimum area against tiny islands and minimum enclosed area against tiny holes, imposed during the optimization.",
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

{s: "4. Two independent checks", t: "Edge measurements and the rolling disk",
intu: "A design is accepted only if two independent checks both find nothing. KLayout measures distances between edges: for width, between edges facing each other across GaAs, for space, across air. Any pair closer than the rule is flagged. The morphological check rolls a disk. The two agree on bars and gaps, but they look at corners differently. An edge check usually ignores a sharp convex corner, since no two facing edges are close. The disk check flags it, because the disk cannot reach the tip. Pick a situation.",
eq: String.raw`<div class="eqnote">edge check</div>\[ \text{flag edge pairs with distance } d \lt \text{rule} \]<div class="eqnote">morphology</div>\[ \text{flag } \operatorname{area}\big(X \setminus \operatorname{open}_r(X)\big) \gt 0 \;\text{ or }\; \operatorname{area}\big(\operatorname{close}_r(X) \setminus X\big) \gt 0 \]`,
sym: [["edge pair", "two outline segments facing each other"], [String.raw`\(d\)`, "distance between them, measured across GaAs (width) or air (space)"], [String.raw`\(r\)`, String.raw`\(\text{rule}/2\)`]],
how: ["Run KLayout's width and space checks on the polygon.", "Run the Shapely open and close check on the same polygon.", "Accept only if both report no violation.", "Two methods with different blind spots make an error in one of them much less likely to pass unnoticed."],
say: "The layout is checked in two independent ways, by edge distances in KLayout and by morphology in Shapely, and is accepted only if both find no violation.",
num: "Edge checks are what foundry rule decks use. The morphological check is stricter at corners, which is why a layout that passes it also has rounded corners.",
r(fig, ctl) {
  let m = "bar"; ctl.innerHTML = btns([["bar", "Narrow bar"], ["gap", "Narrow gap"], ["tip", "Sharp convex corner"]], "m") + '<div class="readout" id="ro"></div>';
  const u = () => {
    pick(ctl, "m", m); let s = "", ke = "", mo = "";
    if (m === "bar") { s += `<rect x="80" y="60" width="180" height="40" fill="var(--blue-bg)" stroke="var(--blue)"/>` + arrow(150, 60, 150, 100, "#D85A30", 2, null, true) + `<text class="ts" x="160" y="85">d &lt; rule</text><rect x="400" y="60" width="180" height="40" fill="var(--coral-bg)" stroke="#D85A30"/><circle cx="490" cy="80" r="34" fill="none" stroke="var(--t)" stroke-dasharray="4 3"/>`; ke = "flagged"; mo = "flagged"; }
    if (m === "gap") { s += `<rect x="80" y="40" width="180" height="40" fill="var(--blue-bg)" stroke="var(--blue)"/><rect x="80" y="100" width="180" height="40" fill="var(--blue-bg)" stroke="var(--blue)"/>` + arrow(150, 80, 150, 100, "#D85A30", 2, null, true) + `<rect x="400" y="40" width="180" height="40" fill="var(--blue-bg)" stroke="var(--blue)"/><rect x="400" y="100" width="180" height="40" fill="var(--blue-bg)" stroke="var(--blue)"/><rect x="400" y="80" width="180" height="20" fill="#378ADD" opacity="0.5"/>`; ke = "flagged"; mo = "flagged"; }
    if (m === "tip") { s += `<path d="M80 150 L260 150 L260 40 Z" fill="var(--blue-bg)" stroke="var(--blue)"/><text class="ts" x="170" y="175" text-anchor="middle">no two facing edges are close</text><path d="M400 150 L580 150 L580 40 Z" fill="var(--blue-bg)" stroke="var(--blue)"/><path d="M400 150 L470 150 L462 140 Z" fill="#D85A30"/><path d="M580 40 L580 75 L569 63 Z" fill="#D85A30"/><circle cx="545" cy="126" r="22" fill="none" stroke="var(--t)" stroke-dasharray="4 3"/>`; ke = "usually not flagged"; mo = "flagged (red tips)"; }
    s += `<text class="th" x="170" y="25" text-anchor="middle">edge distance (KLayout)</text><text class="th" x="490" y="25" text-anchor="middle">rolling disk (Shapely)</text>`;
    fig.innerHTML = svg(190, s);
    $("ro").innerHTML = `<div><span>edge check</span><b>${ke}</b></div><div><span>morphological check</span><b>${mo}</b></div>`;
  };
  ctl.querySelectorAll("button").forEach(b => b.onclick = () => { m = b.dataset.m; u(); }); u();
}},

{s: "5. Repair", t: "Healing with a closing, then an opening, and a small margin",
intu: String.raw`A layout that fails is repaired with the same two operations. The closing first fills every gap narrower than \(2r\), then the opening removes every GaAs feature narrower than \(2r\), and both round the corners. The radius is slightly larger than half the rule, so that rounding the vertices to a 1 nm grid afterwards cannot bring a feature back below the rule. Change the repair radius and look at what is added (blue) and removed (red), and at the check after repair. Note what repair does not fix: an island that is wide enough but too small in area.`,
eq: String.raw`\[ X_{\mathrm{healed}} = \operatorname{open}_r\big(\operatorname{close}_r(X)\big) \qquad r = \text{rule}/2 + \text{margin} \]<div class="eqref">Ch. 3 Eq. (3.18)</div>`,
sym: [[String.raw`\(\operatorname{close}_r\)`, String.raw`fills gaps and holes narrower than \(2r\)`], [String.raw`\(\operatorname{open}_r\)`, String.raw`removes lines and islands narrower than \(2r\)`], ["margin", "a few nm in the thesis, against grid rounding"]],
how: ["Closing first, so narrow gaps become solid instead of splitting features.", "Opening second, so thin slivers left over are removed.", String.raw`Use \(r\) slightly above \(\text{rule}/2\), here a fraction of a pixel to a few nanometers.`, String.raw`Check the healed layout again with \(r = \text{rule}/2\). Repair changes the geometry, so the performance must be recomputed.`],
say: "The repair closes then opens the layout with a radius slightly larger than half the rule, which removes every width and gap violation and rounds the corners, at the cost of changing the geometry.",
num: "In the thesis the rule is 120 nm, so the check radius is 60 nm and the repair radius 63 nm, 3 nm larger so that rounding to a 1 nm grid cannot create a new violation. Here the merged blocks show that repair can join features, which may change the device a lot.",
r(fig, ctl) {
  ctl.innerHTML = sl("h", "Repair radius r (nm)", 60, 80, 1, 63) + '<div class="readout" id="ro"></div>';
  const L = C3.drcLayout(16), rule = 120;
  const u = () => {
    const hr = +$("h").value; $("hv").textContent = hr; const Hd = C3.bOpen(C3.bClose(L.X, L.W, L.H, hr / L.px, 0), L.W, L.H, hr / L.px, 0);
    const add = Hd.map((v, i) => v && !L.X[i] ? 1 : 0), rem = Hd.map((v, i) => !v && L.X[i] ? 1 : 0), d = C3.drc(Hd, L.W, L.H, rule / 2 / L.px, 0);
    const isl = C3.components(Hd, L.W, L.H, 1).map(c => c.area * 25), small = isl.filter(a => a < rule * rule).length;
    C3.drawRow(fig, [{ a: L.X }, { a: Hd, over: [[add, [55, 138, 221]], [rem, [216, 90, 48]]] }], L.W, L.H, 1.95, "Right: blue added, red removed by the repair.", ["original", "repaired"]);
    $("ro").innerHTML = `<div><span>width and gap check after repair</span><b>${d.ns + d.ng === 0 ? "pass" : "fail"}</b></div><div><span>islands below A_min</span><b>${small}</b></div><div><span>GaAs area change</span><b>${(((Hd.reduce((a, b) => a + b, 0) - L.X.reduce((a, b) => a + b, 0)) * 25) / 1e6).toFixed(4)} µm²</b></div>`;
  };
  $("h").oninput = u; u();
}},

{s: "6. The DRC-safe stage", t: "Optimizing while staying legal",
intu: String.raw`Repair changes the geometry, which can lower the performance. So the shape optimization continues from the repaired outline, in a stage designed to stay legal. Vertex moves are limited to a small \(\Delta_{\mathrm{max}}\), so a few steps cannot create a new violation of any size. Every few steps the outline is repaired and resampled. Only evaluations of an outline that passes the check are kept as candidates, and the final device is the best passing candidate, validated again on a finer grid. Hammond et al. saw the same pattern in their runs: when rules are switched on, performance drops and is then gradually recovered. Step through the loop.`,
eq: String.raw`\[ \mathbf{r}_i = \mathbf{r}_i^{(0)} + \Delta_{\mathrm{max}} \tanh(\theta_i)\, \hat{\mathbf{n}}_i, \qquad \text{small } \Delta_{\mathrm{max}} \]\[ \text{every } m \text{ steps: } X \leftarrow \operatorname{open}_r\big(\operatorname{close}_r(X)\big), \text{ resample, check} \]`,
sym: [[String.raw`\(\Delta_{\mathrm{max}}\)`, "small bound on vertex moves, 15 nm in the thesis"], [String.raw`\(m\)`, "steps between repairs, 5 in the thesis"], ["candidate", "an evaluated outline that passed the check"]],
how: ["Start from the repaired outline, which passes.", String.raw`Take shape steps with a small \(\Delta_{\mathrm{max}}\) and a sharp curvature penalty (Lesson 10).`, String.raw`Every \(m\) steps repair and resample the outline, then check it.`, "Keep only passing evaluations, return the best, and validate it on a finer grid."],
say: "In the DRC-safe stage the outline moves only a little per run, is repaired and checked every few steps, and only outlines that pass are kept as candidates.",
num: "Hammond et al. also found that too strict constraint weights can trap the optimizer: rerunning their T-splitter with weaker weights raised it from 27 % to 49.5 % per arm.",
r(fig, ctl) {
  const S = [["repaired outline", "passes the check, the start of the stage"], ["shape steps", "small moves, at most Δ_max per vertex"], ["repair", "close then open with r = rule/2 + margin"], ["resample", "redistribute the vertices along the outline"], ["check", "KLayout and Shapely, width, gap, area"], ["keep or drop", "only passing outlines become candidates"], ["best candidate", "validated again on a finer grid"]];
  let k = 0; ctl.innerHTML = `<div class="row"><button id="b">Back</button><button id="n">Next</button></div>`;
  const u = () => {
    let s = ""; const pos = [[90, 60], [250, 60], [410, 60], [570, 60], [570, 170], [410, 170], [170, 170]];
    S.forEach(([t], i) => { const [x, y] = pos[i]; s += `<g class="${i === k ? "c-coral" : i < k ? "c-teal" : "c-gray"}"><rect x="${x - 70}" y="${y - 22}" width="140" height="44" rx="8" stroke-width="${i === k ? 1.6 : 0.6}"/></g><text class="th" x="${x}" y="${y + 5}" text-anchor="middle" style="font-size:13px">${t}</text>`; });
    s += `<line x1="160" x2="178" y1="60" y2="60" class="arr" marker-end="url(#ar)"/><line x1="320" x2="338" y1="60" y2="60" class="arr" marker-end="url(#ar)"/><line x1="480" x2="498" y1="60" y2="60" class="arr" marker-end="url(#ar)"/><line x1="570" x2="570" y1="84" y2="146" class="arr" marker-end="url(#ar)"/><line x1="498" x2="482" y1="170" y2="170" class="arr" marker-end="url(#ar)"/><line x1="338" x2="242" y1="170" y2="170" class="arr" marker-end="url(#ar)"/>`;
    s += `<path d="M410 148 Q330 110 260 84" class="arr" stroke-dasharray="4 3" marker-end="url(#ar)"/><text class="ts" x="330" y="118" text-anchor="middle">next run</text>`;
    s += `<text class="ts" x="340" y="235" text-anchor="middle">${S[k][1]}</text>`;
    fig.innerHTML = svg(250, s); $("b").disabled = k === 0; $("n").disabled = k === S.length - 1;
  };
  $("b").onclick = () => { k--; u(); }; $("n").onclick = () => { k++; u(); }; u();
}}
],
summary: String.raw`The final layout must pass a design rule check with minimum width, minimum gap and minimum area. Width and gap are checked by morphology: the GaAs removed by opening with a disk of radius \(\text{rule}/2\) and the air filled by closing must both have zero area, which also requires rounded corners, and independently by KLayout edge-distance checks. Area is checked separately, since a feature can be wide enough yet too small. A failing layout is repaired by \(X_{\mathrm{healed}} = \operatorname{open}_r(\operatorname{close}_r(X))\) with \(r\) slightly above \(\text{rule}/2\), so grid rounding cannot recreate a violation. Repair changes the geometry, so the optimization continues in a DRC-safe stage with small vertex moves, repair and resampling every few steps, and only passing outlines kept.`,
sheet: [
[String.raw`\[ \operatorname{area}\big(X \setminus \operatorname{open}_r(X)\big) = 0 \qquad \operatorname{area}\big(\operatorname{close}_r(X) \setminus X\big) = 0 \qquad r = \text{rule}/2 \]`, "Morphological width and gap check"],
[String.raw`\[ A_{\mathrm{island}},\, A_{\mathrm{hole}} \ge A_{\mathrm{min}} \]`, "Area rule, independent of width"],
[String.raw`\[ \frac{\pi}{4}\, w^2 \lt w^2 \]`, "A disk as wide as the rule fails a square area rule"],
[String.raw`\[ X_{\mathrm{healed}} = \operatorname{open}_r\big(\operatorname{close}_r(X)\big) \qquad r = \text{rule}/2 + \text{margin} \]`, "Repair (Ch. 3 Eq. 3.18)"],
[String.raw`\[ \text{small } \Delta_{\mathrm{max}}, \text{ repair every } m \text{ steps, keep passing outlines} \]`, "DRC-safe stage"]],
consts: "Layout of 170 × 160 pixels of 5 nm. Exact distance-transform morphology, air beyond the border, regions below 12 pixels (300 nm²) ignored as staircase specks.",
sources: ["Hammond et al., Opt. Express 29, 23916 (2021) (five foundry rules, minimum area and enclosed area constraints, performance drop and recovery, constraint weights)", "Shapely and KLayout documentation (polygon buffer operations, width and space checks), as used by the thesis code", "Felzenszwalb and Huttenlocher, Theory of Computing 8, 415 (2012) (distance transform used in this page)"]
});

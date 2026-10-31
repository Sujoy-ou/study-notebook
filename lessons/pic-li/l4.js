(function () {
/* Part 3 Lesson 4: context lesson on phase change memory for in-memory computing. The 2025 review (Su, Guo, Zhang, Tsai, Li) was checked
   at abstract level only. The physics on these cards is standard PCM teaching material, computed live with PIC (pic-common.js) and app.js helpers. */
const PC = "#D85A30", PB = "#378ADD", PT = "#1D9E75", PP = "#7F77DD", PA = "#BA7517";
const tx = (x, y, t, a, cls) => `<text class="${cls || "ts"}" x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""}>${t}</text>`;
const rc = (x, y, w, h, fill, stroke) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke || "none"}" stroke-width="1"/>`;

addLesson("pic", "li", {
level: "Advanced",
id: "pic-li-l4", title: "Context: phase change memory for in-memory computing", short: "4. Phase change memory (context)",
big: String.raw`This is a context lesson, kept short. Part of Prof. Li's group works on memory devices rather than photonics, and the 2025 review he coauthored is about phase change memory used as an analog computing element. A phase change cell is a tiny volume of a chalcogenide glass, usually Ge2Sb2Te5, that can be switched between a crystalline state with low resistance and an amorphous state with high resistance by heating it with current pulses. Arranged in a crossbar, thousands of such cells multiply a vector by a matrix in one step using nothing but Ohm's law and Kirchhoff's current law, which is what a neural network layer needs. The catch is that the amorphous resistance drifts with time. The cards show the switching, the drift, the projected cell that tames it, and the crossbar arithmetic.`,
bridge: String.raw`Source for scope: X. Su, Z. Guo, G. Zhang, H. Tsai and N. Li, Progress and challenges of phase change memory for in-memory computing, Current Opinion in Solid State and Materials Science 37, 101225 (2025), DOI 10.1016/j.cossms.2025.101225, abstract checked only. The projected cell is from N. Li et al., Advanced Electronic Materials, 2201190 (2023). The switching physics, the drift law and the crossbar arithmetic are standard and are not claims of the review.`,
cards: [

{s: "1. SET and RESET", t: "Switching a phase change cell: melt-quench and anneal",
intu: String.raw`Press Play. A RESET pulse is short and strong. It melts the chalcogenide above about 600 degrees, then the current stops and the melt quenches in nanoseconds into a disordered glass with high resistance. A SET pulse is longer and weaker. It holds the material above the crystallization temperature but below melting, so atoms find their lattice sites and the resistance drops by a factor of a hundred to a thousand. Reading uses a tiny voltage that heats nothing.`,
eq: String.raw`\[ \text{RESET: } T \gt T_{m} \text{ then quench} \ \Rightarrow\ \text{amorphous, } R_{\mathrm{high}} \]\[ \text{SET: } T_{c} \lt T \lt T_{m} \text{ for about } 100\ \mathrm{ns} \ \Rightarrow\ \text{crystalline, } R_{\mathrm{low}} \]\[ \frac{R_{\mathrm{high}}}{R_{\mathrm{low}}} \sim 10^{2}\ \text{to}\ 10^{3} \]`,
sym: [[String.raw`\(T_m\)`, "melting temperature of GST, about 620 °C"], [String.raw`\(T_c\)`, "crystallization temperature, about 150 to 200 °C"], [String.raw`\(R_{\mathrm{high}}, R_{\mathrm{low}}\)`, "resistance of the amorphous and crystalline states"]],
how: ["Joule heating from the pulse raises the temperature of a small dome of material next to the heater electrode.", "Fast cooling after a high pulse freezes the liquid disorder, slow heating at moderate temperature lets crystals grow.", "Partial amorphization gives intermediate resistances, which is what analog computing uses."],
say: String.raw`RESET melts and quenches the cell into a high resistance glass, SET anneals it back into a low resistance crystal, and partial switching gives analog levels in between.`,
num: "Standard values: GST melting about 620 °C, crystallization about 150 to 200 °C, RESET pulses of tens of nanoseconds at high current, SET pulses of about 100 ns or longer at lower current, resistance ratio 100 to 1000.",
r(fig, ctl) {
  ctl.innerHTML = btns([["reset", "RESET pulse"], ["set", "SET pulse"]], "p");
  let mode = "reset";
  const draw = (t) => {
    pick(ctl, "p", mode); const ph = (t * 0.5) % 1;
    const x0 = 60, w = 560, y0 = 40, h = 120;
    const pulse = u => mode === "reset" ? (u > 0.1 && u < 0.25 ? 1 : 0) : (u > 0.1 && u < 0.6 ? 0.45 : 0);
    const temp = u => { let T = 25; const dt = 0.005; for (let s = 0; s <= u; s += dt) { const P = pulse(s); T += (P * 900 - (T - 25) * (mode === "reset" ? 0.25 : 0.12)) * dt * 8; } return T; };
    const us = range(0, 1, 120); const Ts = us.map(temp), Ps = us.map(pulse);
    let s = PIC.yaxis(x0, y0, h, 0, 800, 4, "T (°C)", v => v.toFixed(0)) + PIC.xaxis(x0, y0 + h, w, 0, 1, 4, "time (a.u.)", v => v.toFixed(1));
    s += plot(x0, y0, w, h, us, Ps.map(p => p * 800), 0, 1, 0, 800, PB, 1.5, "3 3") + plot(x0, y0, w, h, us, Ts, 0, 1, 0, 800, PC, 2.5);
    const Ym = y0 + h - 620 / 800 * h, Yc = y0 + h - 170 / 800 * h; s += `<line x1="${x0}" y1="${Ym}" x2="${x0 + w}" y2="${Ym}" stroke="var(--p)" stroke-dasharray="4 3"/>` + tx(x0 + w, Ym - 4, "T_m 620 °C", "end") + `<line x1="${x0}" y1="${Yc}" x2="${x0 + w}" y2="${Yc}" stroke="var(--p)" stroke-dasharray="4 3"/>` + tx(x0 + w, Yc - 4, "T_c about 170 °C", "end");
    const X = x0 + ph * w; s += `<line x1="${X}" y1="${y0}" x2="${X}" y2="${y0 + h}" stroke="var(--t)"/>`;
    const Tn = temp(ph); const amorph = mode === "reset" ? (ph > 0.3 ? 1 : 0) : (ph > 0.5 ? 0 : 1);
    // cell drawing
    const cx = 120, cy = y0 + h + 60; s += rc(cx - 40, cy + 20, 80, 14, "var(--gray-bg)", "var(--p)") + rc(cx - 6, cy + 10, 12, 12, PA) + rc(cx - 40, cy - 30, 80, 40, amorph ? "var(--coral-bg)" : "var(--teal-bg)", amorph ? PC : PT);
    for (let i = 0; i < 40; i++) { const gx = cx - 36 + (i % 10) * 8, gy = cy - 26 + Math.floor(i / 10) * 9; const jx = amorph ? (Math.sin(i * 3.1) * 2.5) : 0, jy = amorph ? (Math.cos(i * 2.3) * 2.5) : 0; s += `<circle cx="${(gx + jx).toFixed(1)}" cy="${(gy + jy).toFixed(1)}" r="1.6" fill="var(--t)"/>`; }
    s += tx(cx, cy + 50, amorph ? "amorphous dome, R high" : "crystalline, R low", "middle") + tx(cx + 60, cy + 25, "heater", "start");
    s += tx(400, cy, `T now ${Tn.toFixed(0)} °C, ${mode === "reset" ? "melt then quench" : "hold above T_c and crystallize"}`, "middle", "t");
    fig.innerHTML = svg(cy + 62, s);
  };
  ctl.querySelectorAll("button[data-p]").forEach(b => b.onclick = () => { mode = b.dataset.p; });
  PIC.player(ctl, draw);
}},

{s: "2. Resistance drift", t: "The problem: the amorphous resistance drifts with time",
intu: String.raw`A freshly RESET cell does not keep its resistance. The glass relaxes, and its resistance climbs as a power of time with an exponent near 0.1. That sounds small, but after a day the stored weight has changed by a sizeable fraction, and an analog accumulate over thousands of cells cannot tolerate that. Slide the exponent and read the resistance after an hour and a day.`,
eq: String.raw`\[ R(t) = R_{0}\left(\frac{t}{t_{0}}\right)^{\nu}, \qquad \nu \approx 0.1 \text{ (amorphous)}, \quad \nu \approx 0 \text{ (crystalline)} \]`,
sym: [[String.raw`\(R_0\)`, "resistance measured at the reference time"], [String.raw`\(t_0\)`, "reference time after programming, often 1 s"], [String.raw`\(\nu\)`, "drift exponent"]],
how: ["Structural relaxation of the glass slowly removes defect states that carry current, so the resistance rises.", "Relaxation is logarithmic in time, which gives a power law in resistance.", "Crystalline cells barely drift, so the low resistance end is stable."],
say: String.raw`The amorphous resistance follows a power law in time with an exponent near 0.1, so a programmed analog weight slowly changes unless it is compensated.`,
num: "Standard values: drift exponent about 0.1 for amorphous GST and about 0 for the crystalline state. With nu 0.1 the resistance rises by about 2.3 times from 1 s to 1 day.",
r(fig, ctl) {
  ctl.innerHTML = sl("nu", "Drift exponent ν", 0, 0.15, 0.005, 0.1);
  const u = () => {
    const nu = +$("nu").value; $("nuv").textContent = nu.toFixed(3);
    const x0 = 60, w = 560, y0 = 40, h = 160; const lts = range(0, 6, 60), Rs = lts.map(l => nu * l);
    let s = PIC.yaxis(x0, y0, h, 0, 1, 5, "log10 (R / R₀)", v => v.toFixed(1)) + PIC.xaxis(x0, y0 + h, w, 0, 6, 6, "log10 time (s)", v => v.toFixed(0));
    s += plot(x0, y0, w, h, lts, Rs, 0, 6, 0, 1, PC, 2.5) + plot(x0, y0, w, h, lts, lts.map(() => 0), 0, 6, 0, 1, PT, 2.5);
    s += tx(x0 + w - 4, y0 + h - Math.min(1, nu * 6) / 1 * h - 8, "amorphous", "end") + tx(x0 + w - 4, y0 + h - 8, "crystalline", "end");
    s += tx(340, 20, `R after 1 hour: ${Math.pow(3600, nu).toFixed(2)} R₀, after 1 day: ${Math.pow(86400, nu).toFixed(2)} R₀`, "middle", "th");
    fig.innerHTML = svg(y0 + h + 40, s);
  };
  $("nu").oninput = u; u();
}},

{s: "3. Projected PCM", t: "The fix: a projected cell with a parallel liner",
intu: String.raw`Put a thin resistive liner in parallel with the phase change material. When the cell is crystalline the liner hardly matters. When it is amorphous and highly resistive, the read current flows mostly through the liner, whose resistance does not drift, so the state is projected onto a stable element. The amorphous volume still decides how much of the liner is in play, so the analog information survives. Slide the liner resistance and watch the effective drift fall.`,
eq: String.raw`\[ \frac{1}{R_{\mathrm{cell}}} = \frac{1}{R_{\mathrm{PCM}}(t)} + \frac{1}{R_{\mathrm{liner}}} \quad\Longrightarrow\quad \nu_{\mathrm{eff}} = \nu\,\frac{R_{\mathrm{liner}}}{R_{\mathrm{liner}} + R_{\mathrm{PCM}}} \]`,
sym: [[String.raw`\(R_{\mathrm{liner}}\)`, "resistance of the parallel projection liner, fixed in time"], [String.raw`\(R_{\mathrm{PCM}}(t)\)`, "drifting amorphous resistance"], [String.raw`\(\nu_{\mathrm{eff}}\)`, "apparent drift exponent of the whole cell"]],
how: ["Two resistors in parallel: the smaller one carries most of the current.", "Differentiate the log of the parallel resistance with respect to log time to get the effective exponent.", "If the liner is much smaller than the amorphous resistance, the effective drift goes to zero, at the cost of a smaller resistance window."],
say: String.raw`A projected cell reads through a drift-free liner in parallel with the phase change material, which suppresses the apparent drift while keeping the analog state.`,
num: "N. Li et al., Adv. Electron. Mater. 2201190 (2023), optimized projected PCM for analog in-memory inference, cited in the 2025 review (abstract level). Model here: amorphous R 1 MΩ, crystalline R 10 kΩ, liner from 20 kΩ to 10 MΩ.",
r(fig, ctl) {
  ctl.innerHTML = sl("ll", "log10 liner resistance (Ω)", 4.3, 7, 0.05, 5.3);
  const u = () => {
    const RL = Math.pow(10, +$("ll").value); $("llv").textContent = RL.toExponential(1) + " Ω";
    const nu = 0.1, Ra = 1e6, Rc = 1e4; const par = (a, b) => a * b / (a + b);
    const x0 = 60, w = 560, y0 = 40, h = 160; const lts = range(0, 6, 60);
    const bare = lts.map(l => Math.log10(Ra * Math.pow(10, nu * l))), proj = lts.map(l => Math.log10(par(Ra * Math.pow(10, nu * l), RL))), cry = lts.map(() => Math.log10(par(Rc, RL)));
    let s = PIC.yaxis(x0, y0, h, 3.5, 7, 7, "log10 R (Ω)", v => v.toFixed(1)) + PIC.xaxis(x0, y0 + h, w, 0, 6, 6, "log10 time (s)", v => v.toFixed(0));
    s += plot(x0, y0, w, h, lts, bare, 0, 6, 3.5, 7, PC, 1.5, "4 3") + plot(x0, y0, w, h, lts, proj, 0, 6, 3.5, 7, PP, 2.5) + plot(x0, y0, w, h, lts, cry, 0, 6, 3.5, 7, PT, 2.5);
    s += tx(x0 + 8, y0 + 14, "red dashed: bare amorphous, purple: projected amorphous, green: crystalline");
    const nueff = nu * RL / (RL + Ra), win = par(Ra, RL) / par(Rc, RL);
    s += tx(340, 20, `effective drift exponent ${nueff.toFixed(3)}, resistance window ${win.toFixed(0)} ×`, "middle", "th");
    fig.innerHTML = svg(y0 + h + 40, s);
  };
  $("ll").oninput = u; u();
}},

{s: "4. Crossbar MVM", t: "A crossbar multiplies a vector by a matrix in one step",
intu: String.raw`Store each matrix entry as a conductance \(G_{ij}\) at the crossing of row \(i\) and column \(j\). Apply the input vector as voltages on the rows. Each cell passes a current equal to its conductance times its row voltage, Ohm's law, and each column wire adds up the currents from every row, Kirchhoff's law. The column currents are the matrix-vector product. Slide the three input voltages and watch the three column currents update on a live 3 by 3 crossbar.`,
eq: String.raw`\[ I_{j} = \sum_{i} G_{ij}\, V_{i} \qquad \text{(Ohm plus Kirchhoff)} \]`,
sym: [[String.raw`\(G_{ij}\)`, "conductance of the cell at row i, column j, the stored weight"], [String.raw`\(V_i\)`, "input voltage on row i"], [String.raw`\(I_j\)`, "output current on column j"]],
how: ["One cell: I equals G times V.", "One column: the currents of all cells on it add because they share the wire.", "All columns at once: the whole product in a single step, with the energy going mostly into the read currents rather than into moving data."],
say: String.raw`A crossbar computes a matrix-vector product in one step because Ohm's law multiplies and Kirchhoff's law adds along each column.`,
num: "Weights here are conductances from 2 to 10 µS, inputs from 0 to 1 V, so currents are microamps. Real arrays have thousands of rows and columns and need analog to digital converters on each column.",
r(fig, ctl) {
  ctl.innerHTML = sl("v1", "V₁ (V)", 0, 1, 0.05, 0.8) + sl("v2", "V₂ (V)", 0, 1, 0.05, 0.3) + sl("v3", "V₃ (V)", 0, 1, 0.05, 0.6);
  const G = [[8, 2, 5], [3, 9, 4], [6, 5, 7]]; // uS
  const u = () => {
    const V = [+$("v1").value, +$("v2").value, +$("v3").value]; ["v1", "v2", "v3"].forEach((k, i) => $(k + "v").textContent = V[i].toFixed(2) + " V");
    const I = [0, 1, 2].map(j => V.reduce((a, v, i) => a + G[i][j] * v, 0));
    const x0 = 170, y0 = 60, dx = 140, dy = 70; let s = tx(340, 20, "I_j = Σ G_ij V_i, conductances in µS, currents in µA", "middle", "th");
    for (let i = 0; i < 3; i++) { s += `<line x1="${x0 - 60}" y1="${y0 + i * dy}" x2="${x0 + 2 * dx + 40}" y2="${y0 + i * dy}" stroke="${PB}" stroke-width="2"/>` + tx(x0 - 66, y0 + i * dy + 4, `V${i + 1} = ${V[i].toFixed(2)}`, "end", "t"); }
    for (let j = 0; j < 3; j++) { s += `<line x1="${x0 + j * dx}" y1="${y0 - 30}" x2="${x0 + j * dx}" y2="${y0 + 2 * dy + 40}" stroke="${PT}" stroke-width="2"/>` + tx(x0 + j * dx, y0 + 2 * dy + 60, `I${j + 1} = ${I[j].toFixed(1)} µA`, "middle", "t"); }
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { const cur = G[i][j] * V[i]; s += `<circle cx="${x0 + j * dx}" cy="${y0 + i * dy}" r="${8 + cur}" fill="rgba(216,90,48,${0.15 + cur / 12})" stroke="${PC}"/>` + tx(x0 + j * dx + 14, y0 + i * dy - 10, `G=${G[i][j]}`) + tx(x0 + j * dx + 14, y0 + i * dy + 16, `${cur.toFixed(1)} µA`); }
    fig.innerHTML = svg(y0 + 2 * dy + 80, s);
  };
  ["v1", "v2", "v3"].forEach(k => $(k).oninput = u); u();
}},

{s: "5. Signed weights", t: "Negative weights from a pair of cells",
intu: String.raw`A conductance is never negative, but a neural network weight often is. The standard trick is two cells per weight on two columns, and the weight is the difference of their conductances. The column currents are subtracted after the array. Slide the weight and see which cell of the pair carries it. The same trick also halves the usable window, which is one reason drift matters so much.`,
eq: String.raw`\[ W_{ij} \propto G^{+}_{ij} - G^{-}_{ij}, \qquad I_{j} = \sum_{i} (G^{+}_{ij} - G^{-}_{ij})\, V_{i} \]`,
sym: [[String.raw`\(G^{+}, G^{-}\)`, "conductances of the two cells of a differential pair"], [String.raw`\(W_{ij}\)`, "the signed weight"]],
how: ["Program the positive part of the weight into one cell and the negative part into the other, the unused cell at minimum conductance.", "Read both columns and subtract.", "Drift in either cell shifts the weight, and a mismatch between the two cells shows up directly as an error."],
say: String.raw`A signed weight is stored as the difference of two conductances on paired columns, and the two column currents are subtracted after the array.`,
num: "With a window from 1 to 10 µS, a differential pair spans weights from minus 9 to plus 9 µS. Review scope (abstract): weight mapping, drift compensation and co-design are listed as system level topics.",
r(fig, ctl) {
  ctl.innerHTML = sl("W", "Weight W (µS)", -9, 9, 0.5, 4);
  const u = () => {
    const W = +$("W").value; $("Wv").textContent = W.toFixed(1) + " µS"; const Gp = 1 + Math.max(0, W), Gm = 1 + Math.max(0, -W);
    const x0 = 100, y0 = 60, w = 480, h = 160; const Y = g => y0 + h - g / 10 * h;
    let s = PIC.yaxis(x0, y0, h, 0, 10, 5, "conductance (µS)", v => v.toFixed(0));
    s += rc(x0 + 100, Y(Gp), 100, Y(0) - Y(Gp), "var(--teal-bg)", PT) + tx(x0 + 150, Y(Gp) - 6, `G⁺ = ${Gp.toFixed(1)}`, "middle") + rc(x0 + 280, Y(Gm), 100, Y(0) - Y(Gm), "var(--coral-bg)", PC) + tx(x0 + 330, Y(Gm) - 6, `G⁻ = ${Gm.toFixed(1)}`, "middle");
    s += tx(x0 + 150, y0 + h + 18, "plus column", "middle") + tx(x0 + 330, y0 + h + 18, "minus column", "middle");
    s += tx(340, 20, `W = G⁺ − G⁻ = ${(Gp - Gm).toFixed(1)} µS`, "middle", "th");
    fig.innerHTML = svg(y0 + h + 36, s);
  };
  $("W").oninput = u; u();
}},

{s: "6. The review", t: "What the 2025 review covers, and why it matters for a photonics student",
intu: String.raw`The review maps the field at two levels. At the device level it asks how the phase change cell's own properties, the resistance window, drift, noise and endurance, limit analog in-memory computing and how to benchmark that. At the system level it covers cell optimization, how to map weights onto conductances, how to compensate drift, and co-design of the array with the algorithm. It also surveys photonic phase change memory, where the same material changes its refractive index and absorption, which is the bridge back to optics. Step through the topics.`,
eq: String.raw`\[ \text{analog in-memory computing: } \mathbf{I} = \mathbf{G}\,\mathbf{V} \ \text{for DNN inference, electrical and optical} \]`,
sym: [["AIMC", "analog in-memory computing"], ["DNN", "deep neural network"], ["photonic PCM", "phase change material placed on a waveguide so its state changes the optical transmission"]],
how: ["Device level: how PCM characteristics affect AIMC, and benchmarking (abstract).", "System level: cell optimization, weight mapping, drift compensation and co-design (abstract).", "An overview of photonic PCM is included (abstract).", "For a photonics student the optical half is the relevant one: a GST patch on a waveguide stores a weight as transmission and is read with light."],
say: String.raw`The 2025 review treats phase change memory for analog in-memory computing at the device and system levels, electrical and photonic, and is context for the memory side of the group.`,
num: "X. Su, Z. Guo, G. Zhang, H. Tsai and N. Li, Curr. Opin. Solid State Mater. Sci. 37, 101225 (July 2025), DOI 10.1016/j.cossms.2025.101225. Only the abstract was checked. Related: N. Li and coauthors, Nat. Commun. 14, 5282 (2023), hardware-aware training for analog in-memory computing.",
r(fig, ctl) {
  const items = [["Device level", "How PCM characteristics (window, drift, noise, endurance) affect analog in-memory computing, and benchmarking methods."], ["System level", "Cell optimization, weight mapping onto conductances, drift compensation, and co-design of array and algorithm."], ["Photonic PCM", "GST on a waveguide changes transmission with its phase, so a weight can be stored and read optically."], ["Why it is context", "A photonics student in the group would touch the optical side at most. The memory devices themselves are electrical and materials work."]];
  const draw = k => {
    let s = tx(340, 20, items[k][0], "middle", "th");
    items.forEach((it, i) => { const x = 40 + i * 155; s += rc(x, 40, 145, 44, i === k ? "var(--accent-bg)" : "var(--sunk)", i === k ? PB : "var(--b)") + tx(x + 72, 67, it[0], "middle", i === k ? "th" : "t"); });
    const words = items[k][1].split(" "); let line = "", ly = 120, out = ""; for (const wd of words) { if ((line + " " + wd).length > 88) { out += tx(40, ly, line, null, "t"); ly += 18; line = wd; } else line = line ? line + " " + wd : wd; } out += tx(40, ly, line, null, "t");
    fig.innerHTML = svg(ly + 20, s + out);
  };
  PIC.stepper(ctl, items.length, draw, items.map(i => i[0]));
}}
],
summary: String.raw`A phase change memory cell is a chalcogenide dome that a short hot pulse melts and quenches into a high resistance glass and a longer warm pulse crystallizes into a low resistance state, with a hundred to a thousand fold window and analog levels in between. The amorphous resistance drifts as a power of time with an exponent near 0.1, and a projected cell with a parallel liner suppresses that drift. In a crossbar, Ohm's law and Kirchhoff's law turn the stored conductances into a one step matrix-vector product, with differential pairs for signed weights. The 2025 review coauthored by Prof. Li covers this at device and system level, electrical and photonic. It is the memory side of the group, context rather than photonics.`,
sheet: [
[String.raw`\[ R_{\mathrm{high}} / R_{\mathrm{low}} \sim 10^{2}\ \text{to}\ 10^{3} \]`, "Resistance window of GST"],
[String.raw`\[ R(t) = R_0 (t/t_0)^{\nu}, \quad \nu \approx 0.1 \]`, "Resistance drift of the amorphous state"],
[String.raw`\[ \nu_{\mathrm{eff}} = \nu\, \frac{R_{\mathrm{liner}}}{R_{\mathrm{liner}} + R_{\mathrm{PCM}}} \]`, "Projected cell drift suppression"],
[String.raw`\[ I_j = \sum_i G_{ij} V_i \]`, "Crossbar matrix-vector multiply"],
[String.raw`\[ W_{ij} \propto G^{+}_{ij} - G^{-}_{ij} \]`, "Signed weight from a differential pair"]],
consts: String.raw`GST melting about 620 °C, crystallization about 150 to 200 °C. Model conductances 1 to 10 µS, inputs 0 to 1 V.`,
sources: ["X. Su, Z. Guo, G. Zhang, H. Tsai and N. Li, Progress and challenges of phase change memory for in-memory computing, Curr. Opin. Solid State Mater. Sci. 37, 101225 (2025), DOI 10.1016/j.cossms.2025.101225 (abstract checked)", "N. Li et al., Optimization of projected phase change memory for analog in-memory computing inference, Adv. Electron. Mater. 2201190 (2023)", "A. Sebastian, M. Le Gallo, R. Khaddam-Aljameh and E. Eleftheriou, Memory devices and applications for in-memory computing, Nature Nanotechnology 15, 529 (2020) (crossbar arithmetic, drift, differential pairs)", "M. Wuttig and N. Yamada, Phase-change materials for rewriteable data storage, Nature Materials 6, 824 (2007) (switching physics)"]
});
})();

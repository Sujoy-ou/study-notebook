(function () {
/* Part 3 Lesson 3: layer transfer at IBM. Epitaxial lift-off (Cheng, Shiu, Li, Han, Shi, Sadana, Nat. Commun. 4, 1577 (2013), full text checked)
   and controlled spalling (Bedell et al. with N. Li, ECS Trans. 50(7), 315 (2013); numbers from J. Phys. D 46, 152002 (2013) and IBM patents).
   Figures are models computed live with PIC (pic-common.js) and app.js helpers. */
const PC = "#D85A30", PB = "#378ADD", PT = "#1D9E75", PP = "#7F77DD", PA = "#BA7517", PG = "#C9A227";
const tx = (x, y, t, a, cls) => `<text class="${cls || "ts"}" x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""}>${t}</text>`;
const rc = (x, y, w, h, fill, stroke) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke || "none"}" stroke-width="1"/>`;

addLesson("pic", "li", {
level: "Advanced",
id: "pic-li-l3", title: "Layer transfer at IBM: epitaxial lift-off and controlled spalling", short: "3. Layer transfer",
big: String.raw`Heterogeneous integration means taking a thin layer of one crystal, such as GaAs, and putting it on another, such as silicon or a flexible sheet. The expensive part is the wafer the layer was grown on, so the game is to peel the layer off without ruining the wafer, and to do it fast. Two IBM methods with Ning Li among the authors do this. Epitaxial lift-off dissolves a buried sacrificial layer so the film floats free, and the 2013 Nature Communications paper replaces the usual HF etch with an HCl etch of a phosphide layer so the wafer comes back smooth enough to reuse directly. Controlled spalling needs no etch at all: a stressed nickel film pulls a crack along a depth set by mechanics, and the crack lifts a sheet of silicon, germanium or III-V off the wafer. This lesson animates both.`,
bridge: String.raw`Sources: C.-W. Cheng, K.-T. Shiu, N. Li, S.-J. Han, L. Shi and D. K. Sadana, Epitaxial lift-off process for gallium arsenide substrate reuse and flexible electronics, Nature Communications 4, 1577 (2013), DOI 10.1038/ncomms2583, full text checked. S. W. Bedell, D. Shahrjerdi, K. Fogel, P. Lauro, B. Hekmatshoar, N. Li, J. Ott and D. K. Sadana, Cost-effective layer transfer by controlled spalling technology, ECS Trans. 50(7), 315 (2013), DOI 10.1149/05007.0315ecst, abstract checked. Spalling numbers come from Bedell et al., J. Phys. D 46, 152002 (2013), on which N. Li is not an author, and from IBM patents US 9,713,250 and US 8,450,184, labelled as patent values.`,
cards: [

{s: "1. Classic ELO", t: "Conventional epitaxial lift-off and why the wafer gets rough",
intu: String.raw`Grow a thin AlAs layer on the GaAs wafer, then the device layers on top. Hydrofluoric acid dissolves AlAs thousands of times faster than GaAs, so it tunnels sideways under the film and releases it. The catch is the wafer surface left behind. HF attacks it and leaves residues, so the roughness climbs from 0.3 nm, the epi-ready value, to 1 to 4 nm, and the wafer needs hours of polishing or etch reclaim before it can be reused. Step through the process.`,
eq: String.raw`\[ \text{AlAs} + \text{HF} \longrightarrow \text{soluble fluorides}, \qquad \frac{r_{\mathrm{AlAs}}}{r_{\mathrm{GaAs}}} \gg 10^{3} \]<div class="eqnote">etch selectivity is what lets the acid run sideways under the film</div>`,
sym: [[String.raw`\(r\)`, "etch rate of each material in HF"], ["RMS roughness", "root mean square height variation of the surface, measured by AFM"]],
how: ["The sacrificial AlAs is only a few nanometres thick, so the etch front has to travel sideways across the whole die.", "Selectivity keeps the device film and the wafer almost untouched while the AlAs goes.", "Residues and HF attack still roughen the wafer from 0.3 nm to 1 to 4 nm RMS.", "Reclaiming it needs chemical mechanical polishing or an etch step, and the paper notes the process takes hours."],
say: String.raw`Classic epitaxial lift-off etches an AlAs release layer with HF, but residues and surface attack raise the wafer roughness from 0.3 to 1 to 4 nm RMS, so the wafer needs reclaim before reuse.`,
num: "Paper (full text): epi-ready GaAs surface roughness 0.3 nm RMS. After conventional HF lift-off 1 to 4 nm RMS. Reclaim by CMP or etching takes hours.",
r(fig, ctl) {
  const draw = k => {
    const x0 = 60, w = 560, yb = 200;
    let s = tx(340, 20, ["1. Grow AlAs then the device film", "2. HF attacks AlAs from the edge", "3. Film floats free", "4. Wafer left rough, 1 to 4 nm RMS"][k], "middle", "th");
    s += rc(x0, yb, w, 50, "var(--gray-bg)", "var(--p)") + tx(x0 + w / 2, yb + 30, "GaAs wafer", "middle", "t");
    const etch = k === 0 ? 0 : k === 1 ? 0.55 : 1;
    if (k < 3) { s += rc(x0 + etch * w, yb - 10, w * (1 - etch), 10, PG, PA); if (k === 1) s += tx(x0 + etch * w - 6, yb - 14, "HF", "end", "t"); s += tx(x0 + w - 4, yb - 14, "AlAs", "end"); }
    const lift = k === 2 ? 40 : k === 3 ? 90 : 0;
    s += rc(x0, yb - 40 - lift, w, 30, "var(--teal-bg)", PT) + tx(x0 + w / 2, yb - 20 - lift, "device film (GaAs, InGaP, ...)", "middle");
    if (k === 3) { let d = `M${x0} ${yb}`; for (let i = 1; i <= 56; i++) d += ` L${x0 + i * 10} ${yb + (i % 2 ? -4 : 3) + (i % 5 === 0 ? 5 : 0)}`; s += `<path d="${d}" fill="none" stroke="${PC}" stroke-width="2"/>` + tx(x0 + w / 2, yb + 70, "residues and HF attack: reclaim by CMP or etch, hours of work", "middle"); }
    fig.innerHTML = svg(290, s);
  };
  PIC.stepper(ctl, 4, draw, ["grow", "etch", "release", "rough wafer"]);
}},

{s: "2. Phosphide + HCl", t: "The IBM fix: a phosphide release layer etched with HCl",
intu: String.raw`Swap the chemistry. A phosphide layer such as InAlP, lattice matched to GaAs, dissolves in hydrochloric acid, and HCl does not attack GaAs the way HF does. The etch leaves almost no residue and passivates the surface, so the wafer comes out close to its epi-ready roughness and can go straight back into the growth reactor. The proof is in the next card. Step through and compare with card 1.`,
eq: String.raw`\[ \text{InAlP} + \text{HCl} \longrightarrow \text{soluble chlorides}, \qquad \text{GaAs unattacked} \]`,
sym: [["InAlP", "indium aluminium phosphide, the phosphide sacrificial layer used in the paper"], ["HCl", "hydrochloric acid, the etchant"]],
how: ["Phosphides etch fast in HCl while arsenides do not, so the selectivity is kept.", "No fluoride residues form, and the HCl treated GaAs surface is passivated.", "The surface stays smooth enough to reuse without CMP, and the paper confirms it by regrowing devices on the reused wafer."],
say: String.raw`A phosphide sacrificial layer etched with HCl releases the film while leaving the GaAs wafer smooth and residue free, so it can be reused directly.`,
num: "Paper (full text): phosphide based sacrificial layers, for example InAlP, etched in HCl. Minimal residues, surface passivation, direct substrate reuse without a reclaim step.",
r(fig, ctl) {
  const draw = k => {
    const x0 = 60, w = 560, yb = 200;
    let s = tx(340, 20, ["1. Grow InAlP then the device film", "2. HCl dissolves InAlP", "3. Film floats free, wafer stays smooth"][k], "middle", "th");
    s += rc(x0, yb, w, 50, "var(--gray-bg)", "var(--p)") + tx(x0 + w / 2, yb + 30, "GaAs wafer", "middle", "t");
    const etch = k === 0 ? 0 : k === 1 ? 0.55 : 1;
    if (k < 2) { s += rc(x0 + etch * w, yb - 10, w * (1 - etch), 10, "var(--purple-bg)", PP); if (k === 1) s += tx(x0 + etch * w - 6, yb - 14, "HCl", "end", "t"); s += tx(x0 + w - 4, yb - 14, "InAlP", "end"); }
    const lift = k === 2 ? 60 : 0;
    s += rc(x0, yb - 40 - lift, w, 30, "var(--teal-bg)", PT) + tx(x0 + w / 2, yb - 20 - lift, "device film", "middle");
    if (k === 2) s += `<line x1="${x0}" y1="${yb}" x2="${x0 + w}" y2="${yb}" stroke="${PT}" stroke-width="2.5"/>` + tx(x0 + w / 2, yb + 70, "smooth, passivated surface: back into the growth reactor", "middle");
    fig.innerHTML = svg(290, s);
  };
  PIC.stepper(ctl, 3, draw, ["grow", "etch", "release"]);
}},

{s: "3. Surface tension", t: "Surface-tension-assisted lift-off: letting the liquid do the peeling",
intu: String.raw`A sideways etch is slow because the acid has to diffuse down a channel only nanometres high. The paper's trick is to let the liquid's surface tension pull the released edge of the film upward as the etch proceeds, which opens the channel, speeds the etch, and flattens the film as it comes off. Whole wafers of GaAs film were transferred this way onto rigid and flexible supports. Press Play.`,
eq: String.raw`\[ t_{\mathrm{etch}} \propto \frac{L^{2}}{D_{\mathrm{eff}}}, \qquad D_{\mathrm{eff}} \uparrow \text{ when the channel opens} \]<div class="eqnote">diffusion limited etch: time grows with the square of the distance the acid must travel</div>`,
sym: [[String.raw`\(L\)`, "distance from the edge to the etch front"], [String.raw`\(D_{\mathrm{eff}}\)`, "effective diffusion of fresh acid and products along the channel"], ["surface tension", "force of the liquid surface that lifts the free edge of the film"]],
how: ["In a closed channel the etch products must diffuse back out the way the acid came in, so the front slows as it goes deeper.", "If the free edge of the film curls up, the channel widens and transport is no longer the limit.", "Surface tension at the liquid surface provides that lift without any mechanical handling, and the film floats flat on the liquid.", "The paper reports full wafer transfer of GaAs films onto rigid and flexible substrates with this method."],
say: String.raw`Surface-tension-assisted lift-off lets the liquid lift the released film edge, which keeps the etch channel open, speeds the release and leaves the film flat.`,
num: "Paper (full text): high throughput variant that transfers full wafer GaAs thin films onto rigid and flexible substrates. An LED and a MOS capacitor were built on thin layers and transferred.",
r(fig, ctl) {
  ctl.innerHTML = sl("sp", "Etch progress", 0, 1, 0.01, 0.3);
  const draw = (t) => {
    const sp = +$("sp").value; $("spv").textContent = (sp * 100).toFixed(0) + " %";
    const x0 = 60, w = 560, yb = 200, yl = 70;
    let s = tx(340, 20, "film edge lifted by the liquid surface (schematic)", "middle", "th");
    s += rc(x0, yl, w, yb - yl + 50, "rgba(55,138,221,0.12)") + `<line x1="${x0}" y1="${yl}" x2="${x0 + w}" y2="${yl}" stroke="${PB}" stroke-dasharray="4 3"/>` + tx(x0 + 4, yl - 6, "liquid surface");
    s += rc(x0, yb, w, 50, "var(--gray-bg)", "var(--p)") + tx(x0 + w / 2, yb + 30, "wafer", "middle", "t");
    const xf = x0 + w * (1 - sp);   // etch front from the right
    s += rc(xf, yb - 8, w - (xf - x0), 8, "var(--purple-bg)", PP);
    // film: flat on wafer to the right of front... wait front moves leftward: etched region is left of the right edge
    // etched part (right of xf) curls up to the liquid surface
    let d = `M${x0} ${yb - 10} L${xf} ${yb - 10}`; const n = 20; for (let i = 1; i <= n; i++) { const u = i / n; const x = xf + u * (x0 + w - xf); const y = yb - 10 - (yb - 10 - yl - 4) * Math.pow(u, 1.6) * Math.min(1, sp * 2); d += ` L${x.toFixed(1)} ${y.toFixed(1)}`; }
    s += `<path d="${d}" fill="none" stroke="${PT}" stroke-width="6" stroke-linecap="round"/>` + tx(xf, yb - 20, "etch front", "middle");
    for (let k = 0; k < 5; k++) { const ph = (t * 0.5 + k / 5) % 1; const x = x0 + w - ph * (x0 + w - xf); if (x > xf) s += `<circle cx="${x.toFixed(1)}" cy="${yb - 4}" r="2.5" fill="${PP}"/>`; }
    s += tx(x0 + w / 2, yb + 72, "purple dots: fresh acid entering the opened channel", "middle");
    fig.innerHTML = svg(yb + 85, s);
  };
  $("sp").oninput = () => draw(0);
  PIC.player(ctl, draw);
}},

{s: "4. Reuse proven", t: "Substrate reuse checked with solar cells",
intu: String.raw`Claiming the wafer is reusable is cheap. The paper proves it by growing a solar cell on an original wafer and another on a wafer that had already been through lift-off, then comparing their current-voltage curves. Comparable performance means the surface is really epi-ready again. The curves here are a textbook single diode solar cell model with a slider for an extra defect related recombination current, so you can see what a damaged surface would have done.`,
eq: String.raw`\[ J(V) = J_{\mathrm{sc}} - J_{0}\left(e^{qV/n_{\mathrm{id}}kT} - 1\right), \qquad \eta = \frac{\max(JV)}{P_{\mathrm{sun}}} \]`,
sym: [[String.raw`\(J_{\mathrm{sc}}\)`, "short circuit current density"], [String.raw`\(J_0\)`, "dark saturation current, larger when the interface is defective"], [String.raw`\(\eta\)`, "conversion efficiency"]],
how: ["A rough or contaminated regrowth interface adds recombination, which shows up as a larger saturation current and a lower open circuit voltage.", "The paper found comparable cells on original and reused wafers, which is the evidence that the HCl process leaves the surface clean.", "This card is a model to show the logic, not the paper's measured curves."],
say: String.raw`Solar cells grown on reused and on original GaAs wafers performed comparably, which shows the HCl lift-off leaves an epi-ready surface.`,
num: "Paper (full text): solar cells grown on original versus reused substrates showed comparable performance. Model values here: Jsc 25 mA/cm², ideality 1.2, J0 from 1e-19 to 1e-13 A/cm².",
r(fig, ctl) {
  ctl.innerHTML = sl("lJ", "log10 J₀ of the reused wafer cell (A/cm²)", -19, -13, 0.1, -18.5);
  const u = () => {
    const J0 = Math.pow(10, +$("lJ").value); $("lJv").textContent = J0.toExponential(1);
    const Vt = 0.02585, Jsc = 25, nid = 1.2; const curve = j0 => { const Vs = range(0, 1.2, 100), Js = Vs.map(V => Jsc - j0 * 1e3 * (Math.exp(V / (nid * Vt)) - 1)); let pm = 0, voc = 0; Vs.forEach((V, i) => { if (Js[i] > 0) { voc = V; pm = Math.max(pm, V * Js[i]); } }); return { Vs, Js, pm, voc }; };
    const a = curve(1e-19), b = curve(J0);
    const x0 = 60, w = 560, y0 = 40, h = 170;
    let s = PIC.yaxis(x0, y0, h, 0, 30, 3, "J (mA/cm²)", v => v.toFixed(0)) + PIC.xaxis(x0, y0 + h, w, 0, 1.2, 4, "V (V)", v => v.toFixed(1));
    s += plot(x0, y0, w, h, a.Vs, a.Js, 0, 1.2, 0, 30, PB, 2.5) + plot(x0, y0, w, h, b.Vs, b.Js, 0, 1.2, 0, 30, PT, 2.5, "6 3");
    s += tx(x0 + 10, y0 + 14, "blue: original wafer") + tx(x0 + 10, y0 + 30, "green dashed: reused wafer");
    s += tx(340, 20, `efficiency ${(a.pm / 100).toFixed(1)} % vs ${(b.pm / 100).toFixed(1)} %, Voc ${a.voc.toFixed(2)} V vs ${b.voc.toFixed(2)} V (model)`, "middle", "th");
    fig.innerHTML = svg(y0 + h + 40, s);
  };
  $("lJ").oninput = u; u();
}},

{s: "5. Spalling mechanics", t: "Controlled spalling: a stressed film steers a crack",
intu: String.raw`Deposit a nickel film under tensile stress on a brittle wafer and attach a handle tape. Start a crack at the edge and the stored elastic energy drives it. Fracture mechanics says the crack settles at the depth where the shear part of the loading, mode II, vanishes and only the opening part, mode I, remains. That depth is a few times the nickel thickness. So you dial the depth with the stressor, and no sacrificial layer or etch is needed. Press Play to watch the crack run, and move the sliders to see how the depth responds.`,
eq: String.raw`\[ K_{II} = 0 \ \text{at the steady state depth}, \qquad d \approx (2\text{ to }3)\, t_{\mathrm{Ni}} \]\[ t^{*} \approx 2.5\times10^{6}\,\frac{K_{IC}^{3/2}}{\sigma^{2}} \quad (t^{*}\ \text{in µm}, K_{IC}\ \text{in MPa}\,\mathrm{m}^{1/2}, \sigma\ \text{in MPa}) \]<div class="eqref">depth rule and t* from IBM patent US 9,713,250, Suo and Hutchinson for the K_II = 0 condition</div>`,
sym: [[String.raw`\(K_{I}, K_{II}\)`, "stress intensity factors for opening and shearing of the crack tip"], [String.raw`\(t_{\mathrm{Ni}}\)`, "thickness of the nickel stressor"], [String.raw`\(\sigma\)`, "tensile stress in the nickel"], [String.raw`\(K_{IC}\)`, "fracture toughness of the substrate"], [String.raw`\(t^{*}\)`, "minimum stressor thickness that can drive the crack"]],
how: ["A tensile film on a substrate bends it and loads a crack near the interface with both opening and shear.", "Suo and Hutchinson showed the crack turns toward the depth where the shear part vanishes, and then runs parallel to the surface.", "The energy available scales with stress squared times thickness. Below the critical thickness t* there is not enough to beat the toughness.", "Sputtered nickel stress can be tuned from about 300 to 700 MPa with the deposition pressure."],
say: String.raw`Controlled spalling uses a tensile nickel stressor to drive a crack that settles where the mode II stress intensity vanishes, a few times the nickel thickness below the surface.`,
num: "J. Phys. D 46, 152002 (2013), not a Li paper: sputtered Ni stress tunable from about 300 to 700 MPa, fitted toughness of Ge 0.4 MPa root metre. Patent US 8,450,184: about 8 µm of Si(111) removed with about 4 µm Ni at about 700 MPa. Patent US 9,713,250: fracture depth about 2 to 3 times the Ni thickness. These are patent values.",
r(fig, ctl) {
  ctl.innerHTML = sl("sig", "Ni stress σ (MPa)", 200, 900, 10, 700) + sl("tn", "Ni thickness (µm)", 1, 10, 0.5, 5) + sl("kic", "Toughness K_IC (MPa √m)", 0.4, 1.2, 0.02, 0.82);
  const draw = (t) => {
    const sig = +$("sig").value, tn = +$("tn").value, kic = +$("kic").value; $("sigv").textContent = sig + " MPa"; $("tnv").textContent = tn.toFixed(1) + " µm"; $("kicv").textContent = kic.toFixed(2);
    const tstar = 2.5e6 * Math.pow(kic, 1.5) / (sig * sig); const ok = tn > tstar; const depth = 2.5 * tn;
    const x0 = 60, w = 560, ys = 110, sc = 6;   // 6 px per um
    let s = tx(340, 20, ok ? `t* = ${tstar.toFixed(1)} µm, Ni is thick enough: crack runs about ${depth.toFixed(0)} µm deep` : `t* = ${tstar.toFixed(1)} µm, Ni too thin: no spalling`, "middle", "th");
    s += rc(x0, ys - 10, w, 10, PA, "#8a5a10") + tx(x0 + 4, ys - 14, "handle tape") + rc(x0, ys, w, tn * sc, "var(--gray-bg)", "var(--p)") + tx(x0 + w + 4, ys + tn * sc / 2 + 4, "Ni");
    s += rc(x0, ys + tn * sc, w, 150, "var(--blue-bg)", PB) + tx(x0 + w / 2, ys + tn * sc + 140, "substrate (Si, Ge or III-V)", "middle");
    if (ok) { const prog = Math.min(1, (t * 0.25) % 1.2); const xc = x0 + prog * w; const yd = ys + tn * sc + depth * sc; let d = `M${x0} ${ys + tn * sc}`; const nn = 30; for (let i = 1; i <= nn; i++) { const u = i / nn; const x = x0 + u * (xc - x0); const y = ys + tn * sc + depth * sc * Math.min(1, u * 4); d += ` L${x.toFixed(1)} ${y.toFixed(1)}`; } s += `<path d="${d}" fill="none" stroke="${PC}" stroke-width="2.5"/>` + tx(x0 + 4, yd + 16, `crack depth ≈ 2.5 t_Ni = ${depth.toFixed(0)} µm (K_II = 0 here)`); const lift = Math.min(12, prog * 14); s += `<polygon points="${x0},${ys - 10 - lift} ${xc.toFixed(1)},${ys - 10} ${xc.toFixed(1)},${yd} ${x0},${yd - lift}" fill="rgba(29,158,117,0.18)" stroke="${PT}" stroke-dasharray="3 3"/>`; }
    fig.innerHTML = svg(ys + tn * sc + 170, s);
  };
  ["sig", "tn", "kic"].forEach(i => $(i).oninput = () => draw(0));
  PIC.player(ctl, draw);
}},

{s: "6. Depth and stress", t: "Dialling the depth: stress, thickness and toughness",
intu: String.raw`Two sliders in the last card are really one curve. For a given substrate toughness, the critical stressor thickness falls as the square of the stress. Here the whole map is drawn: thickness against stress, with the region where spalling runs shaded. The depth you remove is then about two to three times the thickness you chose. Pick a substrate and read how much nickel you need at 500 MPa.`,
eq: String.raw`\[ t^{*}(\sigma) = 2.5\times10^{6}\,\frac{K_{IC}^{3/2}}{\sigma^{2}}, \qquad d \approx 2.5\, t_{\mathrm{Ni}} \]`,
sym: [[String.raw`\(t^{*}\)`, "critical nickel thickness, µm"], [String.raw`\(\sigma\)`, "nickel stress, MPa"], [String.raw`\(d\)`, "removed layer thickness"]],
how: ["Energy release rate of a stressed film scales as stress squared times thickness over the film modulus.", "Setting it equal to the fracture energy of the substrate gives thickness proportional to toughness to the three halves over stress squared, with the patent's prefactor.", "Doubling the stress cuts the needed nickel by four."],
say: String.raw`The critical stressor thickness scales as toughness to the three halves over stress squared, so doubling the nickel stress cuts the required thickness by four.`,
num: "Patent values (US 9,713,250 and US 8,450,184): prefactor 2.5e6, Si(111) toughness about 0.82, about 4 µm Ni at about 700 MPa removes about 8 µm of Si. J. Phys. D 2013: fitted toughness of Ge 0.4. Appl. Phys. Express 6, 112301 (2013): 25 µm electroplated Ni to remove 3 µm of InGaN LED epitaxy from sapphire.",
r(fig, ctl) {
  ctl.innerHTML = btns([["0.4", "Ge, K_IC 0.4"], ["0.82", "Si(111), K_IC 0.82"], ["1.2", "harder, K_IC 1.2"]], "k") + sl("s2", "Stress σ (MPa)", 200, 900, 10, 500);
  let kic = 0.82;
  const u = () => {
    pick(ctl, "k", kic); const sig = +$("s2").value; $("s2v").textContent = sig + " MPa";
    const x0 = 60, w = 560, y0 = 40, h = 170; const sigs = range(200, 900, 80), ts = sigs.map(sg => 2.5e6 * Math.pow(kic, 1.5) / (sg * sg));
    let s = PIC.yaxis(x0, y0, h, 0, 20, 4, "Ni thickness (µm)", v => v.toFixed(0)) + PIC.xaxis(x0, y0 + h, w, 200, 900, 7, "σ (MPa)", v => v.toFixed(0));
    let poly = `${x0 + 0},${y0}`; sigs.forEach((sg, i) => poly += ` ${(x0 + (sg - 200) / 700 * w).toFixed(1)},${(y0 + h - Math.min(20, ts[i]) / 20 * h).toFixed(1)}`); poly += ` ${x0 + w},${y0}`;
    s += `<polygon points="${poly}" fill="rgba(29,158,117,0.2)"/>` + tx(x0 + w - 10, y0 + 16, "spalling runs", "end");
    s += plot(x0, y0, w, h, sigs, ts, 200, 900, 0, 20, PT, 2.5);
    const tst = 2.5e6 * Math.pow(kic, 1.5) / (sig * sig); const X = x0 + (sig - 200) / 700 * w; s += `<line x1="${X}" y1="${y0}" x2="${X}" y2="${y0 + h}" stroke="var(--p)" stroke-dasharray="4 3"/>`;
    s += tx(340, 20, `at ${sig} MPa: t* = ${tst.toFixed(1)} µm, removes about ${(2.5 * tst).toFixed(0)} µm at that thickness`, "middle", "th");
    fig.innerHTML = svg(y0 + h + 40, s);
  };
  ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { kic = +b.dataset.k; u(); });
  $("s2").oninput = u; u();
}},

{s: "7. What it enabled", t: "What layer transfer enabled",
intu: String.raw`Both methods were built to cut cost and to free devices from their wafers. Step through the applications the IBM papers report: flexible circuits from single crystal silicon, kerf-free slicing of ingots, 300 mm wafer scale transfer, gallium nitride lifted from sapphire, and thin GaAs devices on plastic from lift-off. For photonics on silicon the same tools move III-V gain material onto silicon wafers, which is the heterogeneous integration theme of Part 2.`,
eq: String.raw`\[ \text{cost per device} \propto \frac{\text{wafer cost}}{\text{number of reuses}} + \text{process cost} \]<div class="eqnote">the economic argument behind both methods</div>`,
sym: [["kerf", "material lost as sawdust when a wafer is cut, zero for spalling"], ["handle", "the tape or carrier that holds the transferred layer"]],
how: ["ELO returns the GaAs wafer for regrowth, so its cost is shared across many device layers.", "Spalling needs no special equipment and works on essentially any brittle substrate, as the ECS Transactions abstract states.", "Devices were shown in Si, Ge and III-V, including fully processed CMOS removed from its wafer, and 300 mm transfer."],
say: String.raw`Layer transfer amortizes the wafer over many devices and puts single crystal layers on flexible or foreign substrates, which is how III-V gain material reaches silicon photonics.`,
num: "ECS Trans. 50(7), 315 (2013), abstract: no specialized equipment, any brittle substrate, devices in Si, Ge and III-V, removal of fully processed CMOS, kerf-free ingot slicing, 300 mm transfer, GaN on sapphire. J. Phys. D 2013: flexible CMOS with a 6 µm Ni stressor leaving about 10 µm Si, ring oscillator 11.4 ps per stage after transfer. Adv. Mater. 29, 1606638 (2017): single crystal flexible electronics by 3D spalling, N. Li first author.",
r(fig, ctl) {
  const items = [["Flexible CMOS", "Spalled 10 µm Si with working circuits on a handle, ring oscillator 11.4 ps per stage (J. Phys. D 2013)"], ["Kerf-free slicing", "Peel thin sheets off an ingot with no sawdust loss (ECS Trans. 2013)"], ["300 mm transfer", "Full wafer scale layer transfer demonstrated (ECS Trans. 2013)"], ["GaN off sapphire", "Spalled InGaN LEDs with 25 µm plated Ni (Appl. Phys. Express 2013)"], ["GaAs on plastic", "ELO LEDs and MOS capacitors transferred to secondary substrates (Nat. Commun. 2013)"], ["III-V on Si photonics", "The same transfer puts laser material on silicon, the theme of Part 2"]];
  const draw = k => {
    let s = tx(340, 20, items[k][0], "middle", "th");
    const x0 = 40, y0 = 50;
    items.forEach((it, i) => { const x = x0 + (i % 3) * 205, y = y0 + Math.floor(i / 3) * 60; s += rc(x, y, 190, 44, i === k ? "var(--accent-bg)" : "var(--sunk)", i === k ? PB : "var(--b)") + tx(x + 95, y + 27, it[0], "middle", i === k ? "th" : "t"); });
    const words = items[k][1].split(" "); let line = "", ly = y0 + 150, out = ""; for (const wd of words) { if ((line + " " + wd).length > 90) { out += tx(x0, ly, line, null, "t"); ly += 18; line = wd; } else line = line ? line + " " + wd : wd; } out += tx(x0, ly, line, null, "t");
    fig.innerHTML = svg(ly + 20, s + out);
  };
  PIC.stepper(ctl, items.length, draw, items.map(i => i[0]));
}}
],
summary: String.raw`Epitaxial lift-off dissolves a buried sacrificial layer so a device film floats off its wafer. The 2013 IBM paper with Ning Li replaces AlAs and HF, which leave the GaAs wafer 1 to 4 nm rough, with a phosphide layer and HCl, which leaves it smooth enough to reuse at once, and adds a surface-tension-assisted variant that transfers whole wafers quickly. Controlled spalling needs no etch: a tensile nickel film of thickness above t* drives a crack that settles where the mode II stress intensity vanishes, about two to three nickel thicknesses deep, and lifts a sheet of silicon, germanium or III-V from any brittle wafer. Together they turn an expensive wafer into a reusable template and put single crystal layers wherever they are needed, including III-V gain material on silicon.`,
sheet: [
[String.raw`\[ r_{\mathrm{AlAs}} / r_{\mathrm{GaAs}} \gg 10^3 \ \text{(HF)}, \quad \text{InAlP + HCl, GaAs unattacked} \]`, "Etch selectivity in classic and in IBM lift-off"],
[String.raw`\[ t_{\mathrm{etch}} \propto L^2 / D_{\mathrm{eff}} \]`, "Diffusion limited lateral etch"],
[String.raw`\[ K_{II} = 0 \ \text{at the spalling depth}, \quad d \approx (2\text{ to }3)\,t_{\mathrm{Ni}} \]`, "Crack depth rule (Suo and Hutchinson, patent value)"],
[String.raw`\[ t^{*} \approx 2.5\times10^{6}\, K_{IC}^{3/2} / \sigma^{2} \]`, "Critical stressor thickness (patent US 9,713,250)"],
[String.raw`\[ J(V) = J_{\mathrm{sc}} - J_0 (e^{qV/n_{\mathrm{id}}kT} - 1) \]`, "Solar cell model used to show the reuse check"]],
consts: String.raw`Epi-ready GaAs roughness 0.3 nm RMS. Sputtered Ni stress 300 to 700 MPa. Toughness \(K_{IC}\): Ge 0.4 (fitted), Si(111) 0.82 (patent), in MPa root metre. Units in \(t^{*}\): µm, MPa root metre, MPa.`,
sources: ["C.-W. Cheng, K.-T. Shiu, N. Li, S.-J. Han, L. Shi and D. K. Sadana, Epitaxial lift-off process for gallium arsenide substrate reuse and flexible electronics, Nature Communications 4, 1577 (2013), DOI 10.1038/ncomms2583 (full text checked)", "S. W. Bedell, D. Shahrjerdi, K. Fogel, P. Lauro, B. Hekmatshoar, N. Li, J. Ott and D. K. Sadana, Cost-effective layer transfer by controlled spalling technology, ECS Trans. 50(7), 315 (2013), DOI 10.1149/05007.0315ecst (abstract checked)", "S. W. Bedell et al., Kerf-less removal of Si, Ge and III-V layers by controlled spalling, J. Phys. D 46, 152002 (2013), DOI 10.1088/0022-3727/46/15/152002 (N. Li not an author)", "Z. Suo and J. W. Hutchinson, Steady-state cracking in brittle substrates beneath adherent films, Int. J. Solids Struct. 25, 1337 (1989)", "US patents 9,713,250 and 8,450,184 (IBM), spalling depth rule and critical thickness, patent values", "N. Li et al., Single crystal flexible electronics enabled by 3D spalling, Adv. Mater. 29, 1606638 (2017)"]
});
})();

/* TODO for this lesson: Beyond the thesis. */
addLesson("thesis", "ch2x", {
level: "Beyond",
id: "thesis-ch2-x3", title: "Symmetry and real mirrors: extra topics", short: "B3. Symmetry and mirror extras",
big: String.raw`A membrane with air above and below looks the same in a mirror placed at its mid-plane. Every mode must then be even or odd under that mirror. Even modes have only in-plane \(\mathbf{E}\) at the mid-plane (TE-like), odd modes have only \(\mathbf{E}\) along \(z\) there (TM-like), and a symmetric structure can never convert one into the other. An FDTD solver uses this to cut the simulation in half: it replaces the mirror plane by a perfect magnetic conductor (PMC, keeps even fields) or a perfect electric conductor (PEC, keeps odd fields). In Tidy3D these are the symmetry values +1 and −1.`,
bridge: "This is the lesson that connects Chapter 1 (which dipole couples to which mode) with how every symmetric simulation in Chapters 3 to 5 is set up. Everything shown is general theory.",
cards: [
/* from old ch2 L4 card 6 */
{s: "6. No conversion", t: "Symmetry forbids conversion, and how to break it",
intu: String.raw`Can a symmetric structure turn TE-like light into TM-like light, or an even mode into an odd one? The coupling between two modes caused by a change in the structure \(\Delta\varepsilon\) is an overlap integral of \(\Delta\varepsilon\) times the two mode fields. Here the even mode is TE0 and the odd mode is TE1 of a slab, computed live. If the change is symmetric (the same on top and bottom), even times odd times symmetric integrates to exactly zero. If the change is on one side only, like a substrate below, the integral is no longer zero and the modes mix. Move the one-sided layer away from the slab and watch the coupling die: that is Johnson's point that a thick enough buffer, like the air gap above a DBR, keeps the classification approximately valid.`,
eq: String.raw`\[ \kappa_{12} \propto \int \Delta\varepsilon(z)\, E_{1}(z)\, E_{2}(z)\, \mathrm{d}z \]\[ \Delta\varepsilon \text{ even},\ E_{1} \text{ even},\ E_{2} \text{ odd} \;\Longrightarrow\; \text{integrand odd} \;\Longrightarrow\; \kappa_{12} = 0 \]`,
sym: [[String.raw`\(\kappa_{12}\)`, "coupling coefficient between modes 1 and 2 (coupled-mode theory)"], [String.raw`\(\Delta\varepsilon(z)\)`, "change in permittivity, here a thin layer"], [String.raw`\(E_{1}, E_{2}\)`, "mode profiles, even (TE0) and odd (TE1)"]],
how: [String.raw`Coupled-mode theory: a perturbation \(\Delta\varepsilon\) couples two modes with strength \(\propto \int \Delta\varepsilon\, E_1 \cdot E_2^*\).`, "An odd function integrates to zero over a symmetric interval.", "Even × odd × even = odd, so a symmetric perturbation cannot couple an even mode to an odd one.", "A one-sided perturbation is neither even nor odd, so coupling appears. It shrinks as the perturbation moves into the weak evanescent tail."],
say: "A structure that keeps the mid-plane symmetry cannot couple even and odd modes, so it cannot convert TE-like into TM-like light. Breaking the symmetry, for example with a substrate on one side, allows coupling that decays with the gap.",
num: String.raw`Symmetric layers on both sides: coupling exactly <b>0</b>.<br>One-sided layer touching the slab: largest coupling. Moving it out by a few decay lengths \(1/\gamma\) reduces it by orders of magnitude (see the readout).`,
r(fig, ctl) {
  let mode = "one";
  ctl.innerHTML = btns([["one", "layer below only"], ["both", "layers above and below"]], "m") + sl("d", "Gap between slab and layer", 0, 400, 5, 40) + '<div class="readout" id="ro"></div>';
  const t = 300, n = 3.5, lam = 800, zs = range(-700, 700, 1401);
  const N0 = C2.slabN(n, 1, t, lam, 0, "TE"), N1 = C2.slabN(n, 1, t, lam, 1, "TE");
  const e = C2.slabProfile(n, 1, t, lam, 0, "TE", N0, zs).main, o = C2.slabProfile(n, 1, t, lam, 1, "TE", N1, zs).main;
  const nrm = a => Math.sqrt(a.reduce((s, v) => s + v * v, 0)); const ne = nrm(e), no = nrm(o);
  let ref = null;
  const u = () => {
    pick(ctl, "m", mode); const d = +$("d").value; $("dv").textContent = d + " nm";
    const lay = z => { const lo = -t / 2 - d - 20, hi = -t / 2 - d; const below = z >= lo && z <= hi; const above = z <= -lo && z >= -hi; return below || (mode === "both" && above) ? 1 : 0; };
    let k = 0; const integ = zs.map((z, i) => { const v = lay(z) * e[i] * o[i] / (ne * no); k += v; return v; });
    if (ref === null) { let r = 0; zs.forEach((z, i) => { const lo = -t / 2 - 20, hi = -t / 2; if (z >= lo && z <= hi) r += e[i] * o[i] / (ne * no); }); ref = Math.abs(r); }
    const rel = Math.abs(k) / ref;
    const X = z => 60 + (z + 700) / 1400 * 560;
    let layers = ""; const ly = (lo, hi) => `<rect x="${X(lo)}" y="30" width="${X(hi) - X(lo)}" height="200" fill="#D85A30" opacity="0.18"/>`;
    layers += ly(-t / 2 - d - 20, -t / 2 - d); if (mode === "both") layers += ly(t / 2 + d, t / 2 + d + 20);
    fig.innerHTML = svg(270, `<rect x="${X(-t / 2)}" y="30" width="${X(t / 2) - X(-t / 2)}" height="200" fill="var(--blue-bg)"/>${layers}<line x1="60" x2="620" y1="130" y2="130" stroke="var(--p)" stroke-width="0.5"/>${plot(60, 30, 560, 200, zs, e, -700, 700, -1.1, 1.1, "#378ADD", 2)}${plot(60, 30, 560, 200, zs, o, -700, 700, -1.1, 1.1, "#7F77DD", 2, "5 4")}<text class="ts" x="66" y="46">blue TE0 (even), purple TE1 (odd). Coral: perturbing layer(s)</text><text class="ts" x="340" y="252" text-anchor="middle">z from −700 to 700 nm, slab 300 nm thick</text>`);
    $("ro").innerHTML = `<div><span>coupling ∝ |∫Δε E₀E₁|</span><b>${mode === "both" ? "0 (exact)" : rel.toExponential(2)}</b></div><div><span>relative to touching layer</span><b>${mode === "both" ? "0" : (rel * 100).toFixed(2) + " %"}</b></div>`;
  };
  ctl.querySelectorAll("button").forEach(b => b.onclick = () => { mode = b.dataset.m; u(); });
  $("d").oninput = u; u();
}},

/* from old ch2 L6 card 6 */
{s: "6. Real stacks", t: "Real mirrors: substrate and disorder",
intu: "Two things make a real DBR differ from the ideal formula. First, what lies behind the stack: Gačević and Vukmirović's general formula has different media in front and behind. A simulation that ends the stack in air is not the same as a wafer with a GaAs substrate underneath, which gives a higher value. Second, real interfaces are rough or intermixed. Their research question was exactly this, and their answer, the effective refractive-index approximation, is that a disordered DBR behaves like a perfect one with a smaller index ratio. Toggle the substrate and reduce the effective ratio to see both effects.",
eq: String.raw`\[ \text{general: } R = \left(\frac{n_{0} n_{\mathrm{L}}^{2N} - n_{\mathrm{s}} n_{\mathrm{H}}^{2N}}{n_{0} n_{\mathrm{L}}^{2N} + n_{\mathrm{s}} n_{\mathrm{H}}^{2N}}\right)^{2} \]\[ \text{disorder: } \frac{n_{\mathrm{H}}}{n_{\mathrm{L}}} \to \left(\frac{n_{\mathrm{H}}}{n_{\mathrm{L}}}\right)_{\mathrm{eff}} \lt \frac{n_{\mathrm{H}}}{n_{\mathrm{L}}} \]<div class="eqref">Gačević Eq. (2)</div>`,
sym: [[String.raw`\(n_{0}\)`, "medium in front of the stack (air here)"], [String.raw`\(n_{\mathrm{s}}\)`, "medium behind the stack (air in a simulation, GaAs for a real wafer)"], [String.raw`\((n_{\mathrm{H}}/n_{\mathrm{L}})_{\mathrm{eff}}\)`, "reduced effective ratio that mimics interface disorder (their ERIA)"]],
how: [String.raw`Repeat the transfer matrix with \(n_{\mathrm{s}}\) instead of \(n_0\) on the exit side.`, String.raw`A high-index substrate adds one more reflection in phase, raising \(R\).`, "Interface disorder smears the index step, which lowers the reflection per interface.", String.raw`Gačević and Vukmirović show this is equivalent to a perfect stack with a smaller index ratio, so both \(R\) and the stopband shrink.`],
say: "The peak reflectance depends on what is behind the stack, and real interface disorder lowers both the reflectance and the stopband width, which can be modelled as a reduced effective index ratio.",
num: String.raw`\(n_{\mathrm{H}}/n_{\mathrm{L}} = 3.5/3.0\), 10 pairs: air behind ≈ <b>83 %</b>, GaAs-like substrate (3.5) behind ≈ <b>95 %</b> (see the readout).<br>Their simulations, like most, neglect absorption.`,
r(fig, ctl) {
  let sub = "air";
  ctl.innerHTML = btns([["air", "air behind the stack"], ["gaas", "GaAs substrate behind"]], "s") + sl("N", "Pairs N", 2, 30, 1, 10) + sl("ef", "Effective ratio (disorder)", 1.08, 3.5 / 3.0, 0.002, 3.5 / 3.0) + '<div class="readout" id="ro"></div>';
  const u = () => {
    pick(ctl, "s", sub); const N = +$("N").value, ef = +$("ef").value; $("Nv").textContent = N; $("efv").textContent = ef.toFixed(3);
    const ns = sub === "air" ? 1 : 3.5, nL = 3.0, nH0 = 3.5, nH = nL * ef;
    const ls = range(650, 950, 240), id = ls.map(l => C2.tmmR(1, C2.dbrLayers(nH0, nL, N, 800), ns, l)), ds = ls.map(l => C2.tmmR(1, C2.dbrLayers(nH, nL, N, 800), ns, l));
    fig.innerHTML = svg(260, `${plot(60, 40, 560, 190, ls, id, 650, 950, 0, 1, "#888780", 1.5, "5 4")}${plot(60, 40, 560, 190, ls, ds, 650, 950, 0, 1, "#378ADD", 2.5)}<line x1="60" x2="620" y1="230" y2="230" stroke="var(--p)"/><line x1="60" x2="60" y1="40" y2="230" stroke="var(--p)"/><text class="ts" x="340" y="250" text-anchor="middle">wavelength 650 to 950 nm. Grey dashed: ideal. Blue: with reduced effective ratio</text>`);
    $("ro").innerHTML = `<div><span>R at 800 nm (ideal)</span><b>${(C2.tmmR(1, C2.dbrLayers(nH0, nL, N, 800), ns, 800) * 100).toFixed(1)} %</b></div><div><span>R at 800 nm (disordered)</span><b>${(C2.tmmR(1, C2.dbrLayers(nH, nL, N, 800), ns, 800) * 100).toFixed(1)} %</b></div>`;
  };
  ctl.querySelectorAll("button").forEach(b => b.onclick = () => { sub = b.dataset.s; u(); });
  $("N").oninput = u; $("ef").oninput = u; u();
}}

],
summary: String.raw`Under a mirror, \(\mathbf{E}\) flips its normal component and \(\mathbf{H}\), an axial vector, flips its tangential components. A membrane symmetric about its mid-plane has only even and odd modes: even ones have only in-plane \(\mathbf{E}\) at the mid-plane and are TE-like, odd ones have only \(E_z\) there and are TM-like. An even mode satisfies the PMC condition on the mid-plane and an odd mode the PEC condition, so an FDTD solver can replace the plane by a PMC (Tidy3D +1) or PEC (−1) wall and simulate half the domain. The value depends on the plane: TE0 needs +1 at \(z = 0\) but −1 at \(y = 0\). A symmetric structure cannot couple even and odd modes, and a one-sided substrate breaks this only weakly if a gap separates it.`,
sheet: [
[String.raw`\[ \mathbf{E}:\ (E_{x}, E_{y}, E_{z}) \to (E_{x}, E_{y}, -E_{z}) \]\[ \mathbf{H}:\ (H_{x}, H_{y}, H_{z}) \to (-H_{x}, -H_{y}, H_{z}) \]`, String.raw`Mirror \(z \to -z\)`],
[String.raw`\[ M[\mathbf{E}] = \sigma\mathbf{E}, \qquad \sigma = \pm 1 \]`, "Even and odd modes"],
[String.raw`\[ \text{PEC: } \hat{\mathbf{n}} \times \mathbf{E} = 0, \qquad \text{PMC: } \hat{\mathbf{n}} \times \mathbf{H} = 0 \]`, "Ideal walls"],
[String.raw`\[ \text{Tidy3D: } +1 = \text{even} = \text{PMC}, \qquad -1 = \text{odd} = \text{PEC} \]`, "Symmetry values"],
[String.raw`\[ z = 0:\ \text{TE0 } {+1},\ \text{TM0 } {-1}; \qquad y = 0:\ \text{TE0 } {-1},\ \text{TM0 } {+1} \]`, "Which value keeps which mode"],
[String.raw`\[ \frac{N_{\mathrm{cells}}}{2^{s}} \]`, String.raw`Cost with \(s\) planes`],
[String.raw`\[ \kappa_{12} \propto \int \Delta\varepsilon\, E_{1} E_{2}\, \mathrm{d}z \]`, "Coupling by a perturbation"]],
consts: String.raw`Card 6 uses a 300 nm slab, \(n = 3.5\), 800 nm, so that TE1 is well guided.`,
sources: ["Johnson et al., Phys. Rev. B 60, 5751 (1999) (even and odd classes, symmetry breaking by a substrate, buffer layer)", "Andreani and Gerace, Phys. Rev. B 73, 235114 (2006) (parity table of slab modes)", "Tidy3D documentation, Simulation.symmetry (+1 PMC, −1 PEC)"]
});

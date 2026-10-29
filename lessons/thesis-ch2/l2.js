addLesson("thesis", "ch2", {
level: "Basic",
id: "thesis-ch2-l2", title: "Slab modes: TE and TM", short: "2. Slab modes, TE and TM",
big: "A membrane with the same medium above and below supports two families of modes. TE modes have their electric field in the plane of the slab and parallel to the surfaces, so it is continuous across them. TM modes have their main electric field normal to the surfaces, and the boundary condition makes it jump up by ε<sub>core</sub>/ε<sub>air</sub>, about 12, just outside. That jump pushes TM light out of the core and lowers its effective index. One equation, written by Andreani and Gerace in their Appendix C, gives both families.",
bridge: "Lesson 1 showed why only certain angles survive. Here the same condition is solved properly, for both polarizations, with the field profiles. All curves are computed live.",
cards: [
{s: "1. The jump", t: "Boundary conditions: why the TM field jumps",
intu: "At a surface between two materials, Maxwell's equations fix two things. The field component parallel to the surface is the same on both sides. The normal component of the displacement field D = εE is the same on both sides, so the normal component of E itself must jump by the ratio of permittivities. For GaAs to air that ratio is n² ≈ 12. A TE mode has its E field parallel to the surfaces, so nothing jumps. A TM mode has its E field mostly normal to the surfaces, so just outside the membrane its field is about 12 times stronger than just inside. Drag the index and watch the jump grow.",
eq: "E<sub>∥</sub><sup>air</sup> = E<sub>∥</sub><sup>core</sup> &nbsp;&nbsp;&nbsp; ε<sub>air</sub> E<sub>z</sub><sup>air</sup> = ε<sub>core</sub> E<sub>z</sub><sup>core</sup> &nbsp;⟹&nbsp; E<sub>z</sub><sup>air</sup> = (ε<sub>core</sub>/ε<sub>air</sub>) E<sub>z</sub><sup>core</sup>",
sym: [["E_∥", "tangential electric field, parallel to the surface"], ["E_z", "electric field normal to the membrane surfaces"], ["ε", "permittivity, ε = n² (relative)"], ["D", "displacement field εE, whose normal part is continuous with no surface charge"]],
how: ["Faraday's law integrated around a thin loop across the surface gives continuity of tangential E.", "Gauss's law over a thin pillbox gives continuity of normal D = εE (no free surface charge).", "So ε₁E_z1 = ε₂E_z2, and E_z jumps by ε₁/ε₂.", "This is Eq. 2.1 of your Chapter 2, and the same factor appears as ζ in the TM slab equation."],
say: "The tangential electric field is continuous at the surface and the normal displacement field is continuous. For TM-like light, whose field is normal to the surfaces, the field just outside is larger by ε_core/ε_air, about 12 for GaAs.",
num: "n = 3.5: jump factor n² = <b>12.25</b><br>n = 3.0 (AlGaAs-like): <b>9</b><br>n = 1.45 (oxide): <b>2.1</b>",
r(fig, ctl) {
  ctl.innerHTML = sl("n", "Core index n", 1.2, 3.8, 0.01, 3.5) + btns([["TE", "TE (field parallel)"], ["TM", "TM (field normal)"]], "p") + '<div class="readout" id="ro"></div>';
  let pol = "TM";
  const u = () => {
    const n = +$("n").value; $("nv").textContent = n.toFixed(2); pick(ctl, "p", pol);
    const N = C2.slabN(n, 1, 160, 800, 0, pol), zs = range(-300, 300, 300);
    const pr = C2.slabProfile(n, 1, 160, 800, 0, pol, N, zs), ys = pol === "TE" ? pr.main : pr.ez;
    fig.innerHTML = svg(270, `<rect x="${340 - 80 * 0.9}" y="30" width="${160 * 0.9}" height="200" fill="var(--blue-bg)"/><text class="ts" x="340" y="248" text-anchor="middle">core, 160 nm</text>${plot(70, 30, 540, 200, zs, ys, -300, 300, 0, 1.05, pol === "TE" ? "#378ADD" : "#D85A30", 2.5)}<line x1="70" x2="610" y1="230" y2="230" stroke="var(--p)"/><text class="ts" x="76" y="44">${pol === "TE" ? "E_y (parallel to surfaces): continuous" : "E_z (normal to surfaces): jumps at both surfaces"}</text>`);
    $("ro").innerHTML = `<div><span>jump factor n²</span><b>${(n * n).toFixed(2)}</b></div><div><span>N of the ${pol}0 mode</span><b>${N ? N.toFixed(3) : "—"}</b></div>`;
  };
  ctl.querySelectorAll("button").forEach(b => b.onclick = () => { pol = b.dataset.p; u(); });
  $("n").oninput = u; u();
}},

{s: "2. Solving it", t: "Solving the slab equation graphically",
intu: "The slab equation has the mode's N on both sides, so it cannot be solved with algebra. Plot both sides against N and look for crossings. The left side, tan(κt/2 − mπ/2), climbs through branches. The right side, ζγ/κ, rises smoothly from zero. Each crossing is one mode. For TM the right side is multiplied by ζ = (n/n<sub>c</sub>)², about 12, so it rises much faster and the crossing moves to a lower N. That is the whole reason TM modes have lower effective index. Andreani and Gerace 2006 studied photonic crystal slabs with a guided-mode expansion method that builds patterned-slab fields out of these plain slab modes, and their Appendix C states these equations for a slab in the same medium on both sides.",
eq: "tan(κt/2 − mπ/2) = ζ γ/κ, &nbsp;&nbsp; κ = k<sub>0</sub>√(n² − N²), &nbsp; γ = k<sub>0</sub>√(N² − n<sub>c</sub>²)<br>ζ = 1 (TE), &nbsp; ζ = (n/n<sub>c</sub>)² (TM) &nbsp;&nbsp;&nbsp; [Andreani and Gerace, Eqs. (C1) to (C4)]",
sym: [["κ", "transverse wavenumber in the core (their q)"], ["γ", "decay constant in the cladding (their χ₁)"], ["m", "mode order. Even m: (C1) and (C4). Odd m: (C2) and (C3)"], ["ζ", "boundary factor from card 1"], ["k₀", "2π/λ₀"]],
how: ["Inside the core the field is cos(κz) (even m) or sin(κz) (odd m). Outside it decays as e^(−γ|z|).", "Match the main field and its derivative at z = t/2, with the right boundary condition.", "For TE, E_y and dE_y/dz are continuous. For TM, H_y and (1/ε)dH_y/dz are continuous, which brings in ζ.", "The ratio of the two matching conditions gives tan(κt/2 − mπ/2) = ζγ/κ. Andreani writes the four cases separately."],
say: "The slab modes satisfy tan(κt/2 − mπ/2) = ζγ/κ, with ζ = 1 for TE and (n/n_c)² for TM. This is the symmetric-slab result of Andreani and Gerace, Appendix C, written as one line.",
num: "n = 3.5, t = 160 nm, λ = 800 nm, air:<br>TE0 N ≈ <b>3.08</b>, TM0 N ≈ <b>2.58</b> (computed by this page)<br>Watch out: Andreani call the fundamental mode 'first-order'. Here m = 0 is the fundamental.",
r(fig, ctl) {
  let pol = "TE";
  ctl.innerHTML = btns([["TE", "TE (ζ = 1)"], ["TM", "TM (ζ = n²)"]], "p") + sl("t", "Thickness t", 60, 400, 5, 160) + '<div class="readout" id="ro"></div>';
  const u = () => {
    pick(ctl, "p", pol); const t = +$("t").value, n = 3.5, lam = 800, k0 = 2 * Math.PI / lam, z = pol === "TM" ? n * n : 1; $("tv").textContent = t + " nm";
    const Ns = range(1.001, 3.499, 500), X = N => 60 + (N - 1) / 2.5 * 560, Y = v => 130 - Math.max(-5, Math.min(5, v)) * 19;
    let rhs = "", lhs = ["", "", ""];
    Ns.forEach((N, i) => { const ka = k0 * Math.sqrt(n * n - N * N), ga = k0 * Math.sqrt(N * N - 1); const r = z * ga / ka; rhs += (i ? "L" : "M") + X(N).toFixed(1) + " " + Y(r).toFixed(1); });
    for (let m = 0; m < 3; m++) { let d = "", prev = null; Ns.forEach(N => { const ka = k0 * Math.sqrt(n * n - N * N); const v = Math.tan(ka * t / 2 - m * Math.PI / 2); if (Math.abs(v) > 5) { prev = null; return; } const cmd = (prev === null || Math.abs(v - prev) > 8) ? "M" : "L"; d += cmd + X(N).toFixed(1) + " " + Y(v).toFixed(1) + " "; prev = v; }); lhs[m] = d; }
    const sols = []; for (let m = 0; m < 3; m++) { const N = C2.slabN(n, 1, t, lam, m, pol); if (N) sols.push([m, N]); }
    const cols = ["#378ADD", "#7F77DD", "#1D9E75"];
    fig.innerHTML = svg(270, `<line x1="60" x2="620" y1="130" y2="130" stroke="var(--p)" stroke-width="0.5"/>${lhs.map((d, m) => `<path d="${d}" fill="none" stroke="${cols[m]}" stroke-width="1.5" opacity="0.8"/>`).join("")}<path d="${rhs}" fill="none" stroke="#D85A30" stroke-width="2.5"/>${sols.map(([m, N]) => `<circle cx="${X(N)}" cy="${Y(z * k0 * Math.sqrt(N * N - 1) / (k0 * Math.sqrt(n * n - N * N)))}" r="6" fill="#EF9F27" stroke="#854F0B"/><text class="ts" x="${X(N)}" y="250" text-anchor="middle">${pol}${m}</text><line x1="${X(N)}" x2="${X(N)}" y1="236" y2="226" stroke="#854F0B"/>`).join("")}<line x1="60" x2="620" y1="236" y2="236" stroke="var(--p)"/><text class="ts" x="60" y="264">N = 1</text><text class="ts" x="620" y="264" text-anchor="end">N = 3.5</text><text class="ts" x="66" y="28">coral: right side ζγ/κ. Blue, purple, teal: left side for m = 0, 1, 2</text>`);
    $("ro").innerHTML = sols.map(([m, N]) => `<div><span>${pol}${m}</span><b>N = ${N.toFixed(3)}</b></div>`).join("") || `<div><span>modes</span><b>none</b></div>`;
  };
  ctl.querySelectorAll("button").forEach(b => b.onclick = () => { pol = b.dataset.p; u(); });
  $("t").oninput = u; u();
}},

{s: "3. Profiles", t: "What the modes look like across the slab",
intu: "Each mode has a field shape across the thickness. Even modes (TE0, TM0) have no zero inside the core. Odd modes (TE1, TM1) have one zero at the mid-plane, so their field is positive on one side and negative on the other. Outside, every mode decays exponentially. Pick a mode and change the thickness. For TM, the curve shown is E<sub>z</sub>, so you can see the jump at the two surfaces. Notice that near cutoff (thin slab, or a higher-order mode) the tails get long: most of the light is then in the air.",
eq: "inside: &nbsp; f(z) = cos(κz) (m even), &nbsp; sin(κz) (m odd) &nbsp;&nbsp; outside: &nbsp; f(t/2) e<sup>−γ(|z| − t/2)</sup><br>TE: f = E<sub>y</sub> &nbsp;&nbsp; TM: f = H<sub>y</sub>, &nbsp; E<sub>z</sub> = β H<sub>y</sub>/(ωε) ∝ H<sub>y</sub>/n²(z)",
sym: [["f(z)", "transverse profile of the main field"], ["E_y", "TE main field, parallel to the surfaces"], ["H_y", "TM magnetic field, continuous"], ["E_z", "TM main electric field, ∝ H_y/ε, so it jumps"]],
how: ["Solve card 2 for N, which gives κ and γ.", "Write cos or sin inside and an exponential tail outside, matched at the surfaces.", "For TM, compute E_z from H_y using Maxwell's equations: E_z ∝ H_y/ε.", "Normalize so the largest value is 1."],
say: "Fundamental modes have no node across the slab. First-order modes have one node at the mid-plane and are odd. TM electric fields peak just outside the surfaces because of the permittivity jump.",
num: "Mid-plane value: TE0 and TM0 are maximal there, TE1 and TM1 are exactly zero there. This sets which modes a dot at the mid-plane can couple to (Chapter 1, Lesson 6).",
r(fig, ctl) {
  let md = "TE0";
  ctl.innerHTML = btns([["TE0", "TE0"], ["TM0", "TM0"], ["TE1", "TE1"], ["TM1", "TM1"]], "m") + sl("t", "Thickness t", 60, 400, 5, 220) + '<div class="readout" id="ro"></div>';
  const u = () => {
    pick(ctl, "m", md); const t = +$("t").value; $("tv").textContent = t + " nm";
    const pol = md.slice(0, 2), m = +md[2], N = C2.slabN(3.5, 1, t, 800, m, pol), zs = range(-350, 350, 350);
    if (!N) { fig.innerHTML = svg(270, `<text class="th" x="340" y="130" text-anchor="middle">${md} is cut off at this thickness</text>`); $("ro").innerHTML = `<div><span>${md}</span><b>not guided</b></div>`; return; }
    const pr = C2.slabProfile(3.5, 1, t, 800, m, pol, N, zs), ys = pol === "TE" ? pr.main : pr.ez;
    const w = t / 700 * 540;
    fig.innerHTML = svg(270, `<rect x="${340 - w / 2}" y="20" width="${w}" height="230" fill="var(--blue-bg)"/><line x1="70" x2="610" y1="135" y2="135" stroke="var(--p)" stroke-width="0.6"/><line x1="340" x2="340" y1="20" y2="250" stroke="var(--p)" stroke-dasharray="3 3" opacity="0.6"/>${plot(70, 20, 540, 230, zs, ys, -350, 350, -1.05, 1.05, pol === "TE" ? "#378ADD" : "#D85A30", 2.5)}<text class="ts" x="76" y="36">${pol === "TE" ? "E_y" : "E_z"} of ${md} across z, −350 to 350 nm</text><text class="ts" x="344" y="262">mid-plane</text>`);
    $("ro").innerHTML = `<div><span>N</span><b>${N.toFixed(3)}</b></div><div><span>decay length 1/γ</span><b>${(1 / pr.gamma).toFixed(0)} nm</b></div>`;
  };
  ctl.querySelectorAll("button").forEach(b => b.onclick = () => { md = b.dataset.m; u(); });
  $("t").oninput = u; u();
}},

{s: "4. Versus thickness", t: "How N changes with thickness, and cutoffs",
intu: "Plot the effective index of each mode against slab thickness. Every curve starts at the cladding index (N = 1) at its cutoff thickness and climbs toward the core index as the slab gets thicker, because more and more of the light sits inside the GaAs. Higher-order modes switch on one by one. TE curves always lie above the TM curve of the same order. Johnson et al. 1999 gave the design rule for photonic crystal slabs: too thin and modes hug the light line (weak guiding), too thick and higher-order modes appear. The best thickness is about half a wavelength in the material.",
eq: "cutoff (symmetric slab): &nbsp; t<sub>m</sub> = m λ<sub>0</sub> / (2√(n² − n<sub>c</sub>²)) &nbsp;&nbsp; (TE and TM)<br>fundamental modes have no cutoff",
sym: [["t_m", "thickness at which mode m appears"], ["N(t)", "effective index versus thickness"], ["λ₀/(2n)", "half a wavelength in the core, Johnson's rule of thumb"]],
how: ["At cutoff N = n_c, so γ = 0 and the right side of the slab equation is zero.", "Then κt/2 − mπ/2 = 0 with κ = k₀√(n² − n_c²).", "Solving gives t_m. The fundamental (m = 0) has t₀ = 0: a symmetric slab always guides it.", "Above cutoff N rises toward n as the field concentrates in the core."],
say: "In a symmetric slab the fundamental TE and TM modes have no cutoff. Mode m appears at t_m = mλ₀/(2√(n² − n_c²)). Thickness is chosen to give strong guiding without too many higher-order modes.",
num: "n = 3.5 in air at 800 nm: t₁ = 800/(2√11.25) ≈ <b>119 nm</b>, t₂ ≈ <b>239 nm</b><br>Half a wavelength in the core: 800/(2 × 3.5) ≈ <b>114 nm</b><br>A 160 nm membrane is just above t₁, so TE1 and TM1 exist but are weakly guided.",
r(fig, ctl) {
  ctl.innerHTML = sl("t", "Marker at thickness", 20, 500, 5, 160) + '<div class="readout" id="ro"></div>';
  const ts = range(10, 500, 120), modes = [["TE", 0, "#378ADD", ""], ["TM", 0, "#D85A30", ""], ["TE", 1, "#378ADD", "5 4"], ["TM", 1, "#D85A30", "5 4"], ["TE", 2, "#378ADD", "2 3"], ["TM", 2, "#D85A30", "2 3"]];
  const curves = modes.map(([p, m]) => ts.map(t => C2.slabN(3.5, 1, t, 800, m, p)));
  const u = () => {
    const tt = +$("t").value; $("tv").textContent = tt + " nm";
    const X = t => 60 + (t - 10) / 490 * 560, Y = N => 230 - (N - 1) / 2.5 * 200;
    let s = ""; curves.forEach((c, i) => { let d = ""; c.forEach((N, j) => { if (!N) return; d += (d ? "L" : "M") + X(ts[j]).toFixed(1) + " " + Y(N).toFixed(1); }); s += `<path d="${d}" fill="none" stroke="${modes[i][2]}" stroke-width="2" ${modes[i][3] ? `stroke-dasharray="${modes[i][3]}"` : ""}/>`; });
    const now = modes.map(([p, m]) => [p + m, C2.slabN(3.5, 1, tt, 800, m, p)]).filter(x => x[1]);
    fig.innerHTML = svg(270, `${s}<line x1="${X(tt)}" x2="${X(tt)}" y1="30" y2="230" stroke="#EF9F27" stroke-width="2"/><line x1="60" x2="620" y1="230" y2="230" stroke="var(--p)"/><line x1="60" x2="60" y1="30" y2="230" stroke="var(--p)"/><text class="ts" x="54" y="234" text-anchor="end">1</text><text class="ts" x="54" y="34" text-anchor="end">3.5</text><text class="ts" x="340" y="252" text-anchor="middle">slab thickness, 10 to 500 nm</text><text class="ts" x="66" y="44">blue TE, coral TM. Solid m = 0, dashed m = 1, dotted m = 2</text>`);
    $("ro").innerHTML = now.map(([nm, N]) => `<div><span>${nm}</span><b>${N.toFixed(3)}</b></div>`).join("");
  };
  $("t").oninput = u; u();
}},

{s: "5. Confinement", t: "How much light is inside the GaAs",
intu: "The fraction of power that travels inside the core is the confinement factor. It decides how strongly the mode feels the GaAs: how much it is slowed down, how strongly a grating etched into it scatters, how strongly a dot in the core couples. A thin slab lets most of the mode leak into the air. A thick one holds almost all of it. Johnson et al. found that in their slab more than 90 % of the energy of the lowest modes sat inside the slab height. Move the thickness and compare TE0 with TE1.",
eq: "Γ<sub>core</sub> = ∫<sub>core</sub> |E<sub>y</sub>|² dz / ∫ |E<sub>y</sub>|² dz &nbsp;&nbsp; (TE, a good estimate of the power fraction)",
sym: [["Γ_core", "confinement factor, fraction of the mode inside the core"], ["E_y", "TE field profile from card 3"]],
how: ["For a TE slab mode, the power flow along the guide is proportional to |E_y|² at every z.", "Integrate |E_y|² over the core and over all z.", "Their ratio is the fraction of power inside the core.", "The evanescent tail length 1/γ controls how much is outside."],
say: "The confinement factor of the fundamental mode grows with thickness. Near cutoff a mode is mostly in the cladding and weakly guided.",
num: "n = 3.5, λ = 800 nm, TE0: t = 80 nm ≈ <b>70 %</b>, t = 160 nm ≈ <b>91 %</b>, t = 300 nm ≈ <b>98 %</b> (computed by this page)",
r(fig, ctl) {
  ctl.innerHTML = sl("t", "Thickness t", 20, 400, 5, 160) + '<div class="readout" id="ro"></div>';
  const ts = range(20, 400, 60);
  const g0 = ts.map(t => { const N = C2.slabN(3.5, 1, t, 800, 0, "TE"); return N ? C2.slabConfinement(3.5, 1, t, 800, 0, N) : NaN; });
  const g1 = ts.map(t => { const N = C2.slabN(3.5, 1, t, 800, 1, "TE"); return N ? C2.slabConfinement(3.5, 1, t, 800, 1, N) : NaN; });
  const u = () => {
    const t = +$("t").value; $("tv").textContent = t + " nm";
    const N0 = C2.slabN(3.5, 1, t, 800, 0, "TE"), N1 = C2.slabN(3.5, 1, t, 800, 1, "TE");
    const c0 = N0 ? C2.slabConfinement(3.5, 1, t, 800, 0, N0) : 0, c1 = N1 ? C2.slabConfinement(3.5, 1, t, 800, 1, N1) : 0;
    fig.innerHTML = svg(260, `${plot(60, 30, 560, 190, ts, g0, 20, 400, 0, 1, "#378ADD", 2.5)}${plot(60, 30, 560, 190, ts, g1, 20, 400, 0, 1, "#7F77DD", 2, "5 4")}<line x1="${60 + (t - 20) / 380 * 560}" x2="${60 + (t - 20) / 380 * 560}" y1="30" y2="220" stroke="#EF9F27" stroke-width="2"/><line x1="60" x2="620" y1="220" y2="220" stroke="var(--p)"/><line x1="60" x2="60" y1="30" y2="220" stroke="var(--p)"/><text class="ts" x="54" y="34" text-anchor="end">100 %</text><text class="ts" x="54" y="224" text-anchor="end">0</text><text class="ts" x="340" y="244" text-anchor="middle">thickness, 20 to 400 nm. Solid TE0, dashed TE1</text>`);
    $("ro").innerHTML = `<div><span>TE0 in core</span><b>${(c0 * 100).toFixed(1)} %</b></div><div><span>TE1 in core</span><b>${N1 ? (c1 * 100).toFixed(1) + " %" : "cut off"}</b></div>`;
  };
  $("t").oninput = u; u();
}},

{s: "6. TE above TM", t: "Why TE is always above TM, and why it matters",
intu: "Card 2 showed the reason in the equation: ζ = (n/n<sub>c</sub>)² makes the TM right-hand side climb faster, which lowers its solution. Physically, TM light is pushed out into the air by the field jump of card 1, and light that travels more in air has a lower effective index. The gap between TE and TM grows with index contrast. Drag the core index from a weak waveguide to GaAs and watch the gap open. This gap is useful and harmful at once: it makes grating couplers strongly polarization selective (Lesson 5), and it gives the two polarizations different beat lengths in an MMI (Lesson 7), which is how an MMI can split them.",
eq: "N<sub>TM,m</sub> < N<sub>TE,m</sub> &nbsp;&nbsp; gap grows with contrast n/n<sub>c</sub> (through ζ)",
sym: [["N_TE, N_TM", "effective indices of TE and TM modes of the same order"], ["n/n_c", "index contrast between core and cladding"]],
how: ["For a weak guide, ζ ≈ 1 and TE and TM are nearly degenerate.", "For strong contrast, ζ ≈ 12 and the TM solution moves to a much lower N.", "So high-contrast membranes are strongly birefringent.", "Taillaert et al. 2006 report the same effect in silicon-on-insulator: TE 2.83 versus TM 1.89."],
say: "TM-like modes of a high-contrast membrane have a much lower effective index than TE-like modes, because the permittivity jump pushes their field into the cladding.",
num: "Taillaert et al. 2006, 220 nm silicon on oxide at 1550 nm: TE <b>2.83</b>, TM <b>1.89</b><br>This page, n = 3.5 membrane in air at 800 nm, t = 160 nm: gap ≈ <b>0.50</b>",
r(fig, ctl) {
  ctl.innerHTML = sl("n", "Core index n", 1.1, 3.8, 0.01, 3.5) + sl("t", "Thickness t", 60, 400, 5, 160) + '<div class="readout" id="ro"></div>';
  const u = () => {
    const n = +$("n").value, t = +$("t").value; $("nv").textContent = n.toFixed(2); $("tv").textContent = t + " nm";
    const ns = range(1.05, 3.8, 80), te = ns.map(x => C2.slabN(x, 1, t, 800, 0, "TE")), tm = ns.map(x => C2.slabN(x, 1, t, 800, 0, "TM"));
    const a = C2.slabN(n, 1, t, 800, 0, "TE"), b = C2.slabN(n, 1, t, 800, 0, "TM");
    const X = v => 60 + (v - 1.05) / 2.75 * 560, Y = v => 230 - (v - 1) / 2.8 * 200;
    const pth = arr => { let d = ""; arr.forEach((v, i) => { if (!v) return; d += (d ? "L" : "M") + X(ns[i]).toFixed(1) + " " + Y(v).toFixed(1); }); return d; };
    fig.innerHTML = svg(260, `<path d="${pth(te)}" fill="none" stroke="#378ADD" stroke-width="2.5"/><path d="${pth(tm)}" fill="none" stroke="#D85A30" stroke-width="2.5"/><line x1="${X(n)}" x2="${X(n)}" y1="30" y2="230" stroke="#EF9F27" stroke-width="2"/><line x1="60" x2="620" y1="230" y2="230" stroke="var(--p)"/><text class="ts" x="340" y="250" text-anchor="middle">core index, 1.05 to 3.8 (cladding = air)</text><text class="ts" x="66" y="44">blue TE0, coral TM0: N versus core index</text>`);
    $("ro").innerHTML = `<div><span>TE0</span><b>${a.toFixed(3)}</b></div><div><span>TM0</span><b>${b.toFixed(3)}</b></div><div><span>gap</span><b>${(a - b).toFixed(3)}</b></div>`;
  };
  $("n").oninput = u; $("t").oninput = u; u();
}}
],
summary: "At a surface the tangential E field and the normal D field are continuous, so a field normal to the membrane jumps by ε_core/ε_air ≈ 12. TE modes have their field parallel to the surfaces, TM modes normal to them. Both obey tan(κt/2 − mπ/2) = ζγ/κ, with ζ = 1 for TE and (n/n_c)² for TM, as in Andreani and Gerace's Appendix C. The TM factor lowers the TM effective index. Fundamental modes have no cutoff, mode m appears at t_m = mλ₀/(2√(n² − n_c²)), and the confinement factor grows with thickness.",
sheet: [
["E<sub>z</sub><sup>air</sup> = (ε<sub>core</sub>/ε<sub>air</sub>) E<sub>z</sub><sup>core</sup>", "Field jump (Ch. 2 Eq. 2.1)"],
["tan(κt/2 − mπ/2) = ζγ/κ", "Slab equation (Ch. 2 Eq. 2.2, Andreani App. C)"],
["κ = k<sub>0</sub>√(n² − N²), &nbsp; γ = k<sub>0</sub>√(N² − n<sub>c</sub>²)", "Transverse wavenumber and decay"],
["ζ = 1 (TE), (n/n<sub>c</sub>)² (TM)", "Polarization factor"],
["t<sub>m</sub> = mλ<sub>0</sub>/(2√(n² − n<sub>c</sub>²))", "Cutoff thickness"],
["Γ = ∫<sub>core</sub>|E|² / ∫|E|²", "Confinement factor"]],
consts: "Examples: n = 3.5, n_c = 1, λ₀ = 800 nm. Computed live, not thesis values.",
sources: ["Andreani and Gerace, Phys. Rev. B 73, 235114 (2006), Appendix C, Eqs. (C1) to (C4) (guided-mode expansion study of photonic crystal slabs)", "Johnson et al., Phys. Rev. B 60, 5751 (1999) (slab thickness rule, energy in the slab)", "Taillaert et al., Jpn. J. Appl. Phys. 45, 6071 (2006) (TE and TM indices in SOI)"]
});

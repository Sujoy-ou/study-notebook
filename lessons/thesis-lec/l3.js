addLesson("thesis", "lec", {
level: "Set up", num: "Lesson 3",
id: "thesis-lec-l3", title: "The mode source at the input", short: "3. The mode source",
big: String.raw`The source has to launch exactly the TE\(_0\) or the TM\(_0\) mode of the 200 nm input waveguide, travelling in \(+x\). To get that shape, Tidy3D first runs a mode solver on the input cross-section. That is Maxwell's equations with no source: a field can only exist in the waveguide for special values of \(n_\mathrm{eff}\), and each one is a mode. The mode shape then becomes a pair of current sheets (electric and magnetic) on the input plane, which together send light in one direction only.`,
bridge: String.raw`In code: <code>td.ModeSource(source_time=pulse, center=..., size=..., direction="+", mode_index=0)</code>. Mode index 0 is the fundamental mode of the chosen polarization. The PBS needs two forward runs, one with TE\(_0\) and one with TM\(_0\).`,
cards: [
{s: "1. The mode solver", t: "No source: only special shapes can travel, the modes",
intu: String.raw`Which field shapes can travel along a straight waveguide by themselves? Try a value of \(n_\mathrm{eff}\). Inside the core the field is a cosine, outside it must decay. For most values the two pieces meet with a kink (orange circles), which Maxwell's equations do not allow. Only at one special \(n_\mathrm{eff}\) do they join smoothly: that shape is the mode. Finding it is an eigenvalue problem, and this is what Tidy3D's mode solver does before the simulation starts.`,
eq: String.raw`\[ \mathbf{E}(x,y,z) = \mathbf{E}_m(y,z)\,e^{i\beta x}, \qquad \beta = \frac{2\pi}{\lambda_0}\, n_\mathrm{eff} \]`,
sym: [[String.raw`\(\mathbf{E}_m(y,z)\)`, "mode shape on the cross-section"], [String.raw`\(n_\mathrm{eff}\)`, "effective index of the mode"]],
how: ["Look for a field that keeps its shape and only gains phase along x.", String.raw`Put it in Maxwell's equations with \(\mathbf{J} = 0\).`, String.raw`Value and slope must match at the edges: only special \(n_\mathrm{eff}\) work.`],
say: String.raw`Without a source, a waveguide only allows special field shapes, the modes, each with its own \(n_\mathrm{eff}\). The mode solver finds them first.`,
num: String.raw`This picture: a slab of GaAs (\(n = 3.492\)) in air at 795 nm, one direction only. The real input strip is 200 nm wide and 160 nm thick, solved in 2D by Tidy3D.`,
r(fig, ctl) {
  ctl.innerHTML = sl("tk", "Core width (nm)", 100, 400, 10, 200) + sl("ne", "Trial n_eff", 1.02, 3.48, 0.002, 2.6) + `<div class="row"><button id="snap">Jump to the mode</button></div><div class="readout" id="ro"></div>`;
  const n = 3.492, lam = 795, k0 = 2 * Math.PI / lam;
  const u = () => {
    const t = +$("tk").value, ne = +$("ne").value; $("tkv").textContent = t; $("nev").textContent = ne.toFixed(3);
    const ka = k0 * Math.sqrt(n * n - ne * ne), ga = k0 * Math.sqrt(ne * ne - 1), c = Math.cos(ka * t / 2);
    const zs = range(-1.6 * t, 1.6 * t, 500), E = zs.map(z => Math.abs(z) <= t / 2 ? Math.cos(ka * z) : c * Math.exp(-ga * (Math.abs(z) - t / 2)));
    const mis = (-ka * Math.sin(ka * t / 2) + ga * c) / k0, mode = C2.slabN(n, 1, t, lam, 0, "TE"), ok = Math.abs(mis) < 0.02;
    const X = C3.X(60, 580, -1.6 * t, 1.6 * t);
    let s = `<rect x="${X(-t / 2)}" y="20" width="${X(t / 2) - X(-t / 2)}" height="180" fill="var(--blue-bg)"/><text class="ts" x="${X(0)}" y="214" text-anchor="middle">GaAs core</text><text class="ts" x="${X(-t)}" y="214" text-anchor="middle">air</text><text class="ts" x="${X(t)}" y="214" text-anchor="middle">air</text>`;
    s += `<line x1="60" x2="640" y1="110" y2="110" stroke="var(--b)"/>` + plot(60, 20, 580, 180, zs, E, -1.6 * t, 1.6 * t, -1.2, 1.2, ok ? "var(--teal)" : "var(--blue)", 2.2);
    if (!ok) for (const zz of [-t / 2, t / 2]) s += `<circle cx="${X(zz)}" cy="${20 + 180 * (1.2 - c) / 2.4}" r="9" fill="none" stroke="var(--coral)" stroke-width="2.5"/>`;
    fig.innerHTML = svg(226, s);
    $("ro").innerHTML = `<div><span>kink at the edge</span><b>${mis.toFixed(3)}</b></div><div><span>the mode here has n_eff</span><b>${mode ? mode.toFixed(3) : "none"}</b></div><div><span>is the trial a mode?</span><b>${ok ? "yes" : "no"}</b></div>`;
  };
  $("tk").oninput = u; $("ne").oninput = u;
  $("snap").onclick = () => { const m = C2.slabN(n, 1, +$("tk").value, lam, 0, "TE"); if (m) $("ne").value = m; u(); };
  u();
}},
{s: "2. TE0 and TM0", t: "The two input polarizations",
intu: String.raw`Switch between the two modes on the cross-section of the input strip (200 nm wide, 160 nm thick, air all around). In TE\(_0\) the electric field lies mostly in the plane of the membrane, across the strip. In TM\(_0\) it points mostly up and down, out of the membrane. The PBS must send these two to different ports. The two modes see the strip differently, so they have different \(n_\mathrm{eff}\), and that difference is what the design region exploits.`,
eq: String.raw`\[ \text{TE}_0: \ \mathbf{E} \approx E_y\,\hat{\mathbf{y}}, \qquad \text{TM}_0: \ \mathbf{E} \approx E_z\,\hat{\mathbf{z}} \]`,
sym: [["y", "across the strip, in the membrane plane"], ["z", "up, normal to the membrane"]],
how: ["Same strip, two fundamental solutions of the mode solver.", "TE: field across the strip. TM: field normal to the membrane.", "Each gets its own forward run."],
say: String.raw`TE\(_0\) has its electric field mostly in the membrane plane and TM\(_0\) mostly normal to it, so they travel differently and the PBS can separate them.`,
num: "Strip 200 × 160 nm, GaAs in air. Mode index 0 for each polarization.",
r(fig, ctl) {
  let m = "te"; ctl.innerHTML = btns([["te", "TE0"], ["tm", "TM0"]], "m");
  const u = () => {
    pick(ctl, "m", m);
    const x0 = 240, y0 = 70, w = 200, h = 160 * 200 / 200;
    let s = `<rect x="140" y="30" width="400" height="220" fill="none" stroke="var(--b)"/><text class="ts" x="150" y="46">air</text><rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="var(--blue-bg)" stroke="var(--blue)"/><text class="ts" x="${x0 + w / 2}" y="${y0 + h + 18}" text-anchor="middle">GaAs strip 200 × 160 nm</text>`;
    for (let i = 0; i < 5; i++) for (let j = 0; j < 4; j++) {
      const cx = x0 + 25 + i * 37.5, cy = y0 + 22 + j * 38, a = Math.cos((i - 2) * 0.45) * Math.cos((j - 1.5) * 0.5);
      s += m === "te" ? arrow(cx - 13 * a, cy, cx + 13 * a, cy, "var(--coral)", 2) : arrow(cx, cy + 13 * a, cx, cy - 13 * a, "var(--coral)", 2);
    }
    s += arrow(560, 240, 600, 240, "var(--t)", 1) + arrow(560, 240, 560, 200, "var(--t)", 1) + `<text class="ts" x="606" y="244">y</text><text class="ts" x="556" y="194" text-anchor="middle">z</text>`;
    s += `<text class="th" x="340" y="22" text-anchor="middle">${m === "te" ? "TE0: E across the strip, in plane" : "TM0: E up and down, normal to the membrane"}</text>`;
    fig.innerHTML = svg(262, s);
  };
  ctl.querySelectorAll("button").forEach(b => b.onclick = () => { m = b.dataset.m; u(); }); u();
}},
{s: "3. One direction", t: "Two current sheets launch the mode in +x only",
intu: String.raw`A sheet of electric current alone radiates both ways: half the light would go backwards out of the input. Compare the two buttons in this real 1D run. With an electric current only, two pulses leave. With the electric and magnetic current sheets of a mode source together, the backward waves cancel and only the forward pulse remains. This is what direction "+" means.`,
eq: String.raw`\[ \mathbf{J}_s = \hat{\mathbf{n}}\times\mathbf{H}_m, \qquad \mathbf{M}_s = -\hat{\mathbf{n}}\times\mathbf{E}_m \]`,
sym: [[String.raw`\(\mathbf{J}_s, \mathbf{M}_s\)`, "electric and magnetic current sheets on the input plane"], [String.raw`\(\hat{\mathbf{n}}\)`, String.raw`direction of launch, \(+x\)`], [String.raw`\(\mathbf{E}_m, \mathbf{H}_m\)`, "mode fields from the mode solver"]],
how: ["An electric current sheet makes waves on both sides.", "A magnetic current sheet also makes waves on both sides, with the opposite sign on one side.", "Shaped from the mode and added together, they cancel backwards and add forwards."],
say: "A mode source is a pair of electric and magnetic current sheets shaped like the mode, which together launch it in one direction only.",
num: "1D run, 400 cells. Backward energy with the pair: below 0.1 % of the forward energy.",
r(fig, ctl) {
  let ow = 1; ctl.innerHTML = btns([["0", "Electric current only"], ["1", "Electric + magnetic (mode source)"]], "o") + `<div class="readout" id="ro"></div>`;
  const go = () => {
    pick(ctl, "o", ow); const sim = new LC.FD1(400), g = n => Math.exp(-Math.pow((n - 60) / 14, 2) / 2) * Math.sin(2 * Math.PI * 0.5 * n / 20);
    anim(() => {
      for (let i = 0; i < 3; i++) sim.step(200, g, !!ow);
      let L = 0, R = 0; for (let i = 0; i < 200; i++) L += sim.ez[i] ** 2; for (let i = 200; i < 400; i++) R += sim.ez[i] ** 2;
      fig.innerHTML = svg(205, LC.draw1D(sim, { src: 200, pml: 40, amp: 1, srcLab: "input plane" }) + `<text class="ts" x="120" y="198" text-anchor="middle">backward</text><text class="ts" x="560" y="198" text-anchor="middle">forward, +x</text>`);
      $("ro").innerHTML = `<div><span>energy going backward</span><b>${L.toFixed(3)}</b></div><div><span>energy going forward</span><b>${R.toFixed(3)}</b></div>`;
      if (sim.t > 330) stopAnim();
    });
  };
  ctl.querySelectorAll("button").forEach(b => b.onclick = () => { ow = +b.dataset.o; go(); }); go();
}}
],
summary: String.raw`Before the run, the mode solver finds the TE\(_0\) and TM\(_0\) modes of the input strip: the special source-free solutions with their own \(n_\mathrm{eff}\). TE\(_0\) has its field in the membrane plane, TM\(_0\) normal to it. The mode source turns the chosen mode into electric and magnetic current sheets on the input plane, which launch it in \(+x\) only, with the Gaussian pulse as its time shape.`,
sheet: [
[String.raw`\[ \mathbf{E} = \mathbf{E}_m(y,z)\,e^{i\beta x}, \quad \beta = k_0 n_\mathrm{eff} \]`, "A mode: source-free solution of a straight waveguide"],
[String.raw`\[ \mathbf{J}_s = \hat{\mathbf{n}}\times\mathbf{H}_m, \quad \mathbf{M}_s = -\hat{\mathbf{n}}\times\mathbf{E}_m \]`, "Mode source: one-way current sheets"]],
consts: String.raw`Slab example: \(n = 3.492\) in air, \(\lambda_0 = 795\) nm. 1D run: normalized units.`,
sources: ["Tidy3D documentation, ModeSource and ModeSolver, Flexcompute", "Taflove and Hagness, Computational Electrodynamics, 3rd ed. (2005), Ch. 5 (total-field and scattered-field sources)", "Ch. 2 Sec. 2.3 and Ch. 3 Sec. 3.6 of the thesis"]
});

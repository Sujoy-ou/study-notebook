(function () {
/* Part 4 Lesson 3: modes in Tidy3D. The slab mode solver below is computed live from the transverse resonance condition. */
const PC = "#D85A30", PB = "#378ADD", PT = "#1D9E75", PP = "#7F77DD", PA = "#BA7517";
const tx = (x, y, t, a, cls) => `<text class="${cls || "ts"}" x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""}>${t}</text>`;
const show = (fig, code, h, body) => { fig.innerHTML = PIC.code(code) + svg(h, body); };
/* symmetric slab modes: phase condition kx d - 2 atan(q gamma/kx) = m pi, q = 1 (TE) or n1^2/n2^2 (TM). Returns n_eff list, highest first. */
function slabModes(n1, n2, d, lam, pol) {
  const k0 = 2 * Math.PI / lam, q = pol === "tm" ? n1 * n1 / (n2 * n2) : 1, out = [];
  const phi = b => { const kx = k0 * Math.sqrt(Math.max(n1 * n1 - b * b, 1e-14)), g = k0 * Math.sqrt(Math.max(b * b - n2 * n2, 1e-14)); return kx * d - 2 * Math.atan(q * g / kx); };
  for (let m = 0; m < 12; m++) { let lo = n2 + 1e-7, hi = n1 - 1e-7; if (phi(lo) < m * Math.PI) break; for (let i = 0; i < 60; i++) { const mid = (lo + hi) / 2; if (phi(mid) > m * Math.PI) lo = mid; else hi = mid; } out.push((lo + hi) / 2); }
  return out;
}
/* TE field profile of mode m across x, normalized to 1 at peak */
function profile(n1, n2, d, lam, b, m, x) {
  const k0 = 2 * Math.PI / lam, kx = k0 * Math.sqrt(Math.max(n1 * n1 - b * b, 1e-14)), g = k0 * Math.sqrt(Math.max(b * b - n2 * n2, 1e-14));
  const even = m % 2 === 0; const inside = even ? Math.cos(kx * x) : Math.sin(kx * x); const edge = even ? Math.cos(kx * d / 2) : Math.sin(kx * d / 2);
  if (Math.abs(x) <= d / 2) return inside; return edge * Math.exp(-g * (Math.abs(x) - d / 2)) * (even ? 1 : Math.sign(x));
}
const nSi = 3.48, nOx = 1.44;

addLesson("pic", "tidy3d", {
level: "Core",
id: "pic-tidy3d-l3", title: "Modes: ModeSpec, the mode solver, sources and monitors", short: "3. Modes",
big: String.raw`Almost everything in a PIC simulation starts and ends with a waveguide mode. The source injects one, the monitor measures how much of one comes out, and the effective index of one sets the phase. Tidy3D describes which modes you mean with <code>td.ModeSpec</code>, solves for them with the mode solver plugin, injects them with <code>td.ModeSource</code> and records them with <code>td.ModeMonitor</code>. The cards compute a slab waveguide live from the transverse resonance condition, so you can watch the mode list, the effective and group index, and the field profile change as you drag the thickness.`,
bridge: String.raw`Chapter 2 Lessons 2 and 3 of the thesis shelf derive slab and strip modes. Here the same physics appears as arguments: how many modes, which polarization, which index to look near, and which direction. The slab is a stand-in for the strip, whose modes need the numerical solver in Tidy3D.`,
cards: [

{s: "1. ModeSpec", t: "td.ModeSpec: how many modes, and which ones",
intu: String.raw`A waveguide can carry several modes. <code>num_modes</code> says how many to solve for, and the solver returns them sorted by effective index, highest first. <code>target_neff</code> tells it where to look, which matters in a structure with many modes or with a substrate that carries leaky ones. Drag the slab thickness to add modes, drag the target, and see which mode index each setting would give you.`,
eq: String.raw`\[ k_0\sqrt{n_1^2 - n_{\mathrm{eff}}^2}\; d \;-\; 2\arctan\!\left(\frac{\sqrt{n_{\mathrm{eff}}^2 - n_2^2}}{\sqrt{n_1^2 - n_{\mathrm{eff}}^2}}\right) = m\pi, \qquad n_2 \lt n_{\mathrm{eff}} \lt n_1 \]<div class="eqref">TE modes of a symmetric slab, Ch. 2 Lesson 2</div>`,
sym: [[String.raw`\(n_{\mathrm{eff}}\)`, "effective index of mode m"], [String.raw`\(d\)`, "slab thickness"], [String.raw`\(m\)`, "mode order, 0 for the fundamental"], [String.raw`\(\texttt{num}\_\texttt{modes}, \texttt{target}\_\texttt{neff}\)`, "ModeSpec arguments"]],
how: ["Each guided mode satisfies the transverse resonance condition for one integer m.", "The effective index of every guided mode lies between the cladding and core indices.", "Tidy3D sorts the modes it finds by effective index, so <code>mode_index</code> 0 is the most confined.", "<code>target_neff</code> centres the search. Without it the solver looks near the highest index in the plane."],
say: String.raw`ModeSpec asks for a number of modes near a target effective index, and the solver returns them sorted from highest effective index down.`,
num: "A 220 nm silicon slab in oxide at 1.55 µm carries one TE mode at about 2.8 (this slab model). At 500 nm it carries three. A 450 nm wide, 220 nm thick strip carries one TE and one TM mode.",
r(fig, ctl) {
  ctl.innerHTML = sl("d", "slab thickness d (nm)", 100, 900, 10, 220) + sl("nm", "num_modes", 1, 6, 1, 2) + sl("tn", "target_neff", 1.5, 3.4, 0.05, 2.5);
  const u = () => {
    const d = +$("d").value / 1000, nm = +$("nm").value, tn = +$("tn").value; $("dv").textContent = d * 1000 + " nm"; $("nmv").textContent = nm; $("tnv").textContent = tn.toFixed(2);
    const modes = slabModes(nSi, nOx, d, 1.55, "te");
    let best = 0; modes.forEach((b, i) => { if (Math.abs(b - tn) < Math.abs(modes[best] - tn)) best = i; });
    const code = `mode_spec = td.ModeSpec(num_modes=${nm}, target_neff=${tn.toFixed(2)},\n                        filter_pol=None)\n# ${modes.length} guided TE mode${modes.length === 1 ? "" : "s"} in this ${d * 1000} nm slab: ${modes.map(b => b.toFixed(3)).join(", ")}`;
    const x0 = 60, w = 560, y0 = 36, h = 140; let s = PIC.yaxis(x0, y0, h, 1.4, 3.5, 3, "n_eff", v => v.toFixed(1));
    s += `<line x1="${x0}" y1="${y0 + h - (nSi - 1.4) / 2.1 * h}" x2="${x0 + w}" y2="${y0 + h - (nSi - 1.4) / 2.1 * h}" stroke="${PB}" stroke-dasharray="4 3"/>` + tx(x0 + w, y0 + h - (nSi - 1.4) / 2.1 * h - 4, "n core 3.48", "end");
    s += `<line x1="${x0}" y1="${y0 + h - (nOx - 1.4) / 2.1 * h}" x2="${x0 + w}" y2="${y0 + h - (nOx - 1.4) / 2.1 * h}" stroke="${PT}" stroke-dasharray="4 3"/>` + tx(x0 + w, y0 + h - (nOx - 1.4) / 2.1 * h - 4, "n cladding 1.44", "end");
    const yt = y0 + h - (tn - 1.4) / 2.1 * h; s += `<line x1="${x0}" y1="${yt}" x2="${x0 + w}" y2="${yt}" stroke="${PC}"/>` + tx(x0 + 4, yt - 4, "target_neff");
    modes.forEach((b, i) => { const x = x0 + 80 + i * 80, y = y0 + h - (b - 1.4) / 2.1 * h, got = i < nm; s += `<rect x="${x - 25}" y="${y}" width="50" height="${y0 + h - y}" fill="${got ? PB : "var(--gray-bg)"}" opacity="0.7" stroke="${i === best ? PC : "none"}" stroke-width="2.5"/>` + tx(x, y - 6, b.toFixed(3), "middle") + tx(x, y0 + h + 14, `TE${i}`, "middle"); });
    s += tx(x0 + w / 2, y0 + h + 34, `num_modes=${nm} returns the ${Math.min(nm, modes.length)} highest (blue). Nearest to the target: TE${best} (red outline).`, "middle");
    show(fig, code, y0 + h + 44, s);
  };
  ["d", "nm", "tn"].forEach(i => $(i).oninput = u); u();
}},

{s: "2. ModeSolver", t: "The mode solver plugin: solving on a plane before any FDTD",
intu: String.raw`The mode solver takes a plane through the simulation, reads the permittivity on it, and solves the eigenproblem for the modes. It is free to run locally and costs a little on the cloud for the full accuracy version. It gives effective index, group index and field profiles before you spend a single FDTD run. Drag the thickness and watch the fundamental profile spread into the cladding as the slab gets thin.`,
eq: String.raw`\[ \frac{d^2 E_y}{dx^2} + k_0^2\left[n^2(x) - n_{\mathrm{eff}}^2\right] E_y = 0 \]\[ E_y(x) = \begin{cases} \cos(k_x x) & |x| \le d/2 \\ \cos(k_x d/2)\, e^{-\gamma(|x| - d/2)} & |x| \gt d/2 \end{cases} \]`,
sym: [[String.raw`\(k_x = k_0\sqrt{n_1^2 - n_{\mathrm{eff}}^2}\)`, "transverse wavenumber in the core"], [String.raw`\(\gamma = k_0\sqrt{n_{\mathrm{eff}}^2 - n_2^2}\)`, "decay rate in the cladding"], [String.raw`\(1/\gamma\)`, "the penetration depth of the evanescent tail"]],
how: ["The mode solver discretizes the transverse wave equation on the plane's grid and solves for eigenvalues near the target.", "Each eigenvalue is an effective index. Each eigenvector is a field profile.", "ModeSolver(simulation, plane, <code>mode_spec</code>, freqs) sets it up. solve() runs locally, <code>run_mode_solver</code> from the web module runs on the cloud.", "The data object holds <code>n_eff</code>, <code>n_group</code> when requested, and the fields, with <code>plot_field</code> for a quick look."],
say: String.raw`The mode solver solves the transverse eigenproblem on one plane and returns effective indices and field profiles without running FDTD.`,
num: "220 nm slab: <code>n_eff</code> about 2.8 and a cladding decay length 1/γ of about 0.1 µm. At 100 nm the mode is weakly guided, <code>n_eff</code> near 1.7, and the tail reaches 0.3 µm.",
r(fig, ctl) {
  ctl.innerHTML = sl("d", "slab thickness d (nm)", 80, 600, 10, 220);
  const u = () => {
    const d = +$("d").value / 1000; $("dv").textContent = d * 1000 + " nm";
    const b = slabModes(nSi, nOx, d, 1.55, "te")[0]; const k0 = 2 * Math.PI / 1.55, g = k0 * Math.sqrt(b * b - nOx * nOx);
    const code = `from tidy3d.plugins.mode import ModeSolver\nfrom tidy3d.plugins.mode.web import run as run_mode_solver\nplane = td.Box(center=(0, 0, 0), size=(0, 3, 2.5))\nms = ModeSolver(simulation=sim, plane=plane, freqs=[freq0],\n    mode_spec=td.ModeSpec(num_modes=1, target_neff=3.0))\nmd = ms.solve()         # local, or md = run_mode_solver(ms)\nprint(md.n_eff.values)  # about ${b.toFixed(3)} for this slab\nms.plot_field("Ey", mode_index=0)`;
    const x0 = 60, w = 560, y0 = 30, h = 150, X = 1.2; // +-1.2 um
    let s = `<rect x="${x0 + w / 2 - d / (2 * X) * w / 2}" y="${y0}" width="${d / X * w / 2}" height="${h}" fill="${PB}" opacity="0.25"/>` + tx(x0 + w / 2, y0 + h + 14, "silicon core", "middle") + tx(x0 + 10, y0 + h + 14, "oxide") + tx(x0 + w - 10, y0 + h + 14, "oxide", "end");
    const xs = range(-X, X, 240), ys = xs.map(x => profile(nSi, nOx, d, 1.55, b, 0, x));
    s += plot(x0, y0, w, h, xs, ys, -X, X, -0.05, 1.05, PC, 2.5);
    s += tx(x0 + w / 2, 18, `TE0: n_eff = ${b.toFixed(3)}, cladding decay length 1/γ = ${(1000 / g).toFixed(0)} nm`, "middle", "th");
    show(fig, code, y0 + h + 28, s);
  };
  $("d").oninput = u; u();
}},

{s: "3. n_eff and n_g", t: "Effective index and group index from the solver",
intu: String.raw`The solver gives two indices. The effective index sets the phase velocity, so it decides resonance wavelengths and coupling lengths. The group index sets how fast a pulse travels and how far apart ring resonances are. The group index is larger because the effective index falls with wavelength. Drag the thickness and read both, computed here from the slab solution and a small wavelength step, which is exactly what <code>group_index_step</code> does inside Tidy3D.`,
eq: String.raw`\[ n_g = n_{\mathrm{eff}} - \lambda\,\frac{dn_{\mathrm{eff}}}{d\lambda} = \frac{c}{v_g} \]\[ \text{Tidy3D: } n_g \approx n_{\mathrm{eff}} - \lambda\,\frac{n_{\mathrm{eff}}(\lambda + \delta) - n_{\mathrm{eff}}(\lambda - \delta)}{2\delta} \]`,
sym: [[String.raw`\(n_g\)`, "group index"], [String.raw`\(v_g\)`, "group velocity, the speed of a pulse"], [String.raw`\(\delta\)`, "the finite-difference step, <code>group_index_step</code> as a fraction of the frequency, 0.005 when set to True"]],
how: ["Phase velocity is c over the effective index.", "Group velocity is the derivative of ω with respect to β, which gives the group index formula.", "Tidy3D solves the modes at three nearby frequencies when <code>group_index_step</code> is set and takes the central difference.", "Material dispersion adds to this in a real solver through the dispersive medium. The slab here uses fixed indices, so only waveguide dispersion shows."],
say: String.raw`The group index is the effective index minus wavelength times its slope, and Tidy3D computes it by solving at two nearby frequencies when <code>group_index_step</code> is on.`,
num: "A 220 nm by 450 nm silicon strip at 1.55 µm has <code>n_eff</code> about 2.4 and <code>n_g</code> about 4.2 for TE0. This slab model gives smaller values because it lacks the lateral confinement.",
r(fig, ctl) {
  ctl.innerHTML = sl("d", "slab thickness d (nm)", 100, 600, 10, 220);
  const ds = range(0.1, 0.6, 60); const neff = ds.map(d => slabModes(nSi, nOx, d, 1.55, "te")[0]);
  const ng = ds.map(d => { const dl = 0.01; const a = slabModes(nSi, nOx, d, 1.55 - dl, "te")[0], b = slabModes(nSi, nOx, d, 1.55 + dl, "te")[0], n0 = slabModes(nSi, nOx, d, 1.55, "te")[0]; return n0 - 1.55 * (b - a) / (2 * dl); });
  const u = () => {
    const d = +$("d").value / 1000; $("dv").textContent = d * 1000 + " nm";
    const i = Math.round((d - 0.1) / 0.5 * 59);
    const code = `ms = ModeSolver(simulation=sim, plane=plane, freqs=[freq0],\n    mode_spec=td.ModeSpec(num_modes=1, group_index_step=True))\nmd = ms.solve()\nn_eff = md.n_eff.sel(mode_index=0).values   # ${neff[i].toFixed(3)}\nn_g = md.n_group.sel(mode_index=0).values   # ${ng[i].toFixed(3)}`;
    const x0 = 60, w = 560, y0 = 36, h = 150; let s = PIC.yaxis(x0, y0, h, 1.4, 4.2, 7, "index", v => v.toFixed(1)) + PIC.xaxis(x0, y0 + h, w, 100, 600, 5, "thickness (nm)", v => v.toFixed(0));
    s += plot(x0, y0, w, h, ds, neff, 0.1, 0.6, 1.4, 4.2, PB, 2) + plot(x0, y0, w, h, ds, ng, 0.1, 0.6, 1.4, 4.2, PC, 2);
    const X = x0 + (d - 0.1) / 0.5 * w; s += `<line x1="${X}" y1="${y0}" x2="${X}" y2="${y0 + h}" stroke="var(--p)" stroke-dasharray="3 3"/>`;
    s += `<circle cx="${X}" cy="${y0 + h - (neff[i] - 1.4) / 2.8 * h}" r="5" fill="${PB}"/><circle cx="${X}" cy="${y0 + h - (ng[i] - 1.4) / 2.8 * h}" r="5" fill="${PC}"/>`;
    s += tx(x0 + w, y0 + 12, `blue n_eff = ${neff[i].toFixed(3)}, red n_g = ${ng[i].toFixed(3)}`, "end");
    show(fig, code, y0 + h + 44, s);
  };
  $("d").oninput = u; u();
}},

{s: "4. TE, TM, filter_pol", t: "TE and TM modes, and filter_pol",
intu: String.raw`In a slab the TE mode has its electric field along the slab and the TM mode has it across the slab. In a strip the modes are mixtures, but one component dominates and Tidy3D labels them by it. <code>filter_pol</code> keeps only the modes of one family, which stops a TM mode from sneaking into mode index 0 when it happens to have the higher index. Switch polarization and see how the mode count and the indices change for the same slab.`,
eq: String.raw`\[ \text{TE: } k_x d - 2\arctan\frac{\gamma}{k_x} = m\pi, \qquad \text{TM: } k_x d - 2\arctan\!\left(\frac{n_1^2}{n_2^2}\frac{\gamma}{k_x}\right) = m\pi \]`,
sym: [[String.raw`\(n_1^2/n_2^2\)`, "the factor that makes TM modes less confined, from the boundary condition on the normal E field"], [String.raw`\(\texttt{filter}\_\texttt{pol}\)`, "None, 'te' or 'tm'"], ["TE fraction", "the solver's measure of how much of the field is in the in-plane E component"]],
how: ["At a boundary the tangential E and the normal D are continuous.", "For TM the normal E jumps by the ratio of permittivities, which enters the phase condition as the factor shown.", "So at the same thickness TM modes have a lower effective index and cut off sooner.", "<code>filter_pol</code> sorts by the TE fraction of each solved mode and keeps the family you asked for."],
say: String.raw`TE has E along the slab and TM across it, TM is less confined by the permittivity ratio, and <code>filter_pol</code> keeps one family so the mode index means what you think.`,
num: "220 nm silicon slab at 1.55 µm, this model: TE0 about 2.8, TM0 about 2.0. In a 450 nm strip the TE0 and TM0 indices are 2.4 and 1.8.",
r(fig, ctl) {
  ctl.innerHTML = sl("d", "slab thickness d (nm)", 100, 700, 10, 220) + btns([["te", "filter_pol = 'te'"], ["tm", "filter_pol = 'tm'"]], "pol");
  let pol = "te";
  const u = () => {
    const d = +$("d").value / 1000; $("dv").textContent = d * 1000 + " nm"; pick(ctl, "pol", pol);
    const te = slabModes(nSi, nOx, d, 1.55, "te"), tm = slabModes(nSi, nOx, d, 1.55, "tm");
    const code = `mode_spec = td.ModeSpec(num_modes=2, filter_pol="${pol}")\n# TE modes: ${te.map(b => b.toFixed(3)).join(", ")}\n# TM modes: ${tm.length ? tm.map(b => b.toFixed(3)).join(", ") : "none guided"}`;
    const cx = 200, cy = 110, hw = 120, hh = d * 150; let s = `<rect x="${cx - hw}" y="${cy - hh}" width="${2 * hw}" height="${2 * hh}" fill="${PB}" opacity="0.25"/>` + tx(cx, cy + hh + 16, "slab, light travels into the page (z)", "middle");
    if (pol === "te") { for (let i = -2; i <= 2; i++) s += arrow(cx + i * 45 - 15, cy, cx + i * 45 + 15, cy, PC, 2); s += tx(cx, cy - hh - 10, "TE: E along the slab (Ey)", "middle", "t"); }
    else { for (let i = -2; i <= 2; i++) s += arrow(cx + i * 45, cy + 18, cx + i * 45, cy - 18, PC, 2); s += tx(cx, cy - hh - 10, "TM: E across the slab (Ex)", "middle", "t"); }
    const x0 = 400, w = 220, y0 = 30, h = 160; s += PIC.yaxis(x0, y0, h, 1.4, 3.5, 3, "n_eff", v => v.toFixed(1));
    const list = pol === "te" ? te : tm; list.forEach((b, i) => { const y = y0 + h - (b - 1.4) / 2.1 * h; s += `<line x1="${x0 + 20}" y1="${y}" x2="${x0 + w}" y2="${y}" stroke="${pol === "te" ? PB : PP}" stroke-width="3"/>` + tx(x0 + w + 4, y + 4, `${pol.toUpperCase()}${i} ${b.toFixed(2)}`); });
    if (!list.length) s += tx(x0 + w / 2, y0 + h / 2, "no guided mode", "middle");
    show(fig, code, y0 + h + 30, s);
  };
  ctl.querySelectorAll("button[data-pol]").forEach(b => b.onclick = () => { pol = b.dataset.pol; u(); });
  $("d").oninput = u; u();
}},

{s: "5. ModeSource", t: "td.ModeSource: injecting one mode in one direction",
intu: String.raw`A mode source is a plane inside the waveguide that launches the chosen mode with the chosen pulse, travelling one way. The direction string is the sign along the axis normal to the plane. The source solves the mode on its own plane first, so its size must cover the mode, with margin for the evanescent tails. Press Play to watch the launched mode travel, and flip the direction. The injected wave is a mode profile times a travelling phase.`,
eq: String.raw`\[ E_y(x, z, t) = E_y(x)\cos\!\left(\beta z - \omega t\right), \qquad \beta = \frac{2\pi n_{\mathrm{eff}}}{\lambda_0} \]\[ \text{direction } \texttt{"+"}: \text{ phase advances toward } +z \]`,
sym: [[String.raw`\(E_y(x)\)`, "the solved mode profile"], [String.raw`\(\beta\)`, "the propagation constant"], [String.raw`\(\texttt{mode}\_\texttt{index}\)`, "which of the solved modes to launch, 0 is the fundamental"], [String.raw`\(\texttt{num}\_\texttt{freqs}\)`, "how many frequencies the source mode is solved at across the pulse band"]],
how: ["The source plane must be perpendicular to the waveguide: a zero size along the propagation axis.", "Tidy3D solves the mode on that plane, then injects it with the GaussianPulse time dependence.", "direction '+' or '-' picks the sign of propagation. A wrong sign sends the light into the PML behind the source.", "<code>num_freqs</code> above 1 solves the mode at several frequencies so a broadband pulse launches the right profile at each."],
say: String.raw`A ModeSource is a plane that launches one solved mode in one direction with a Gaussian pulse, and its size must cover the mode with margin.`,
num: "Source plane 2 × 1.5 µm around a 0.5 × 0.22 µm silicon strip is enough. Place it 0.5 µm inside the PML. <code>num_freqs</code>=5 is a good value for a pulse covering 1.5 to 1.6 µm.",
r(fig, ctl) {
  ctl.innerHTML = btns([["+", 'direction "+"'], ["-", 'direction "-"']], "dir");
  let dir = "+";
  const draw = (tsec) => {
    pick(ctl, "dir", dir);
    const code = `src = td.ModeSource(center=(-2, 0, 0), size=(0, 2, 1.5),\n    source_time=td.GaussianPulse(freq0=freq0, fwidth=fwidth),\n    direction="${dir}", mode_index=0, num_freqs=5,\n    mode_spec=td.ModeSpec(num_modes=1, target_neff=2.5))`;
    const x0 = 40, w = 600, y0 = 30, h = 150, xs = x0 + 150; const sgn = dir === "+" ? 1 : -1;
    let s = `<rect x="${x0}" y="${y0 + h / 2 - 18}" width="${w}" height="36" fill="${PB}" opacity="0.25"/>` + `<line x1="${xs}" y1="${y0}" x2="${xs}" y2="${y0 + h}" stroke="${PC}" stroke-width="3"/>` + tx(xs, y0 - 8, "ModeSource plane", "middle");
    const nx = 60, ny = 12; for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const x = x0 + w * (i + 0.5) / nx; if ((x - xs) * sgn < 0) continue; const y = (j + 0.5) / ny - 0.5; const prof = Math.exp(-Math.pow(y / 0.18, 2)); const env = Math.min(1, Math.abs(x - xs) / 40); const v = prof * env * Math.cos(2 * Math.PI * (sgn * (x - xs) / 36 - tsec * 1.5)); s += `<rect x="${(x - w / nx / 2).toFixed(1)}" y="${(y0 + j * h / ny).toFixed(1)}" width="${(w / nx + 0.5).toFixed(1)}" height="${(h / ny + 0.5).toFixed(1)}" fill="${PIC.bwr(v)}"/>`; }
    s += tx(x0 + w / 2, y0 + h + 16, `direction "${dir}": the mode travels ${dir === "+" ? "right, toward +x" : "left, toward −x"}, nothing is launched the other way`, "middle");
    show(fig, code, y0 + h + 30, s);
  };
  ctl.querySelectorAll("button[data-dir]").forEach(b => b.onclick = () => { dir = b.dataset.dir; draw(0); });
  PIC.player(ctl, draw);
}},

{s: "6. ModeMonitor amps", t: "td.ModeMonitor: amplitudes in both directions",
intu: String.raw`A mode monitor decomposes the field crossing its plane into the solved modes and stores a complex amplitude for each mode, each frequency and each direction. The forward amplitude squared is the transmitted power, the backward one the reflected power, both normalized to the source. Drag the reflection of an imagined device and read what the monitor would report in each direction and in dB.`,
eq: String.raw`\[ a_{\pm}(f) = \frac{\displaystyle\iint \left(\mathbf E \times \mathbf H_{m}^{*} + \mathbf E_{m}^{*}\times\mathbf H\right)\cdot\hat{\mathbf n}\, dA}{\displaystyle 2\iint \left(\mathbf E_{m}\times\mathbf H_{m}^{*}\right)\cdot\hat{\mathbf n}\,dA} \]\[ T = |a_{+}|^2, \qquad R = |a_{-}|^2, \qquad T_{\mathrm{dB}} = 10\log_{10} T \]`,
sym: [[String.raw`\(a_{\pm}\)`, "mode amplitude in the + and − direction, the amps array"], [String.raw`\(\mathbf E_m, \mathbf H_m\)`, "the normalized mode fields"], [String.raw`\(T, R\)`, "transmission and reflection into that mode"]],
how: ["The overlap integral projects the total field onto each mode, which is orthogonal to the others.", "The sign of the direction follows the same convention as the source.", "amps.sel(direction='+', <code>mode_index</code>=0) picks one amplitude at every frequency. Its absolute value squared is power.", "A monitor placed before the device with direction '−' measures reflection, a monitor after it with '+' measures transmission."],
say: String.raw`A ModeMonitor projects the field onto each mode and returns complex amplitudes per direction and frequency, whose squares are transmitted and reflected power.`,
num: "A good directional coupler returns T + R near 1 across the band. If the sum is well below 1, light went into radiation or a mode you did not ask for.",
r(fig, ctl) {
  ctl.innerHTML = sl("R", "reflection of the device", 0, 0.5, 0.01, 0.05) + sl("L", "radiation loss", 0, 0.5, 0.01, 0.1);
  const u = () => {
    const R = +$("R").value, L = +$("L").value; $("Rv").textContent = R.toFixed(2); $("Lv").textContent = L.toFixed(2);
    const T = Math.max(0, 1 - R - L);
    const code = `mmon = td.ModeMonitor(center=(2, 0, 0), size=(0, 2, 1.5),\n    freqs=freqs, mode_spec=td.ModeSpec(num_modes=1), name="out")\namps = sim_data["out"].amps\nT = abs(amps.sel(direction="+", mode_index=0)) ** 2  # ${T.toFixed(3)}\nR = abs(amps.sel(direction="-", mode_index=0)) ** 2  # ${R.toFixed(3)} (before)\nT_dB = 10 * np.log10(T)                               # ${PIC.dB(T).toFixed(2)} dB`;
    const x0 = 40, w = 600, y0 = 80, h = 60; let s = `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="${PB}" opacity="0.2"/><rect x="${x0 + 250}" y="${y0 - 10}" width="100" height="${h + 20}" fill="var(--sunk)" stroke="var(--b)"/>` + tx(x0 + 300, y0 + h / 2 + 4, "device", "middle");
    s += `<line x1="${x0 + 120}" y1="${y0 - 20}" x2="${x0 + 120}" y2="${y0 + h + 20}" stroke="${PT}" stroke-width="3"/>` + tx(x0 + 120, y0 - 26, "monitor before", "middle") + `<line x1="${x0 + 480}" y1="${y0 - 20}" x2="${x0 + 480}" y2="${y0 + h + 20}" stroke="${PT}" stroke-width="3"/>` + tx(x0 + 480, y0 - 26, "monitor after", "middle");
    s += arrow(x0 + 20, y0 + 20, x0 + 110, y0 + 20, PC, 3) + tx(x0 + 60, y0 + 14, "in: 1", "middle");
    s += arrow(x0 + 230, y0 + 45, x0 + 130, y0 + 45, PP, Math.max(1, 6 * Math.sqrt(R))) + tx(x0 + 180, y0 + 60, `a− : R = ${R.toFixed(2)}`, "middle");
    s += arrow(x0 + 360, y0 + 20, x0 + 470, y0 + 20, PB, Math.max(1, 6 * Math.sqrt(T))) + tx(x0 + 415, y0 + 44, `a+ : T = ${T.toFixed(2)}`, "middle");
    if (L > 0) s += arrow(x0 + 300, y0 - 12, x0 + 300, y0 - 40 - 40 * L, PA, 2) + tx(x0 + 310, y0 - 30, `lost ${L.toFixed(2)}`);
    fig.innerHTML = PIC.code(code) + svg(y0 + h + 40, s) + PIC.readout([["T", T.toFixed(3) + " (" + PIC.dB(T).toFixed(2) + " dB)"], ["R", R.toFixed(3) + " (" + PIC.dB(R).toFixed(1) + " dB)"], ["T + R", (T + R).toFixed(3) + (T + R < 0.99 ? ", power missing" : "")]]);
  };
  $("R").oninput = u; $("L").oninput = u; u();
}},

{s: "7. Bends and n_g", t: "bend_radius, bend_axis and group_index_step",
intu: String.raw`Two ModeSpec options matter for PIC work. <code>bend_radius</code> with <code>bend_axis</code> solves the mode of a curved waveguide: the field shifts to the outer wall and a tail leaks away, which is the bend loss. <code>group_index_step</code> asks for the group index as well. Drag the bend radius and watch the profile lean outward. Below a few micrometres in silicon the leak becomes visible.`,
eq: String.raw`\[ n_{\mathrm{bend}}(x) = n(x)\left(1 + \frac{x}{R}\right) \]<div class="eqnote">conformal transformation: a bend of radius R is a straight guide whose index rises toward the outside</div>\[ \alpha_{\mathrm{bend}} \propto \exp\!\left(-C R\right) \]`,
sym: [[String.raw`\(R\)`, "bend radius, the <code>bend_radius</code> argument"], [String.raw`\(x\)`, "distance from the guide centre, positive outward"], [String.raw`\(C\)`, "a constant set by the index contrast, large for silicon, small for nitride"]],
how: ["In polar coordinates the wave equation of a bend maps to a straight guide with a tilted index profile.", "The higher index outside pulls the field outward and lowers the effective barrier there.", "Beyond the point where the outer cladding index times the tilt exceeds <code>n_eff</code> the field radiates, which is bend loss.", "Tidy3D solves this tilted problem when <code>bend_radius</code> is given. The loss appears as an imaginary part of <code>n_eff</code>."],
say: String.raw`A bend is a straight guide with an index that rises outward, so the mode leans out and leaks, and <code>bend_radius</code> makes the mode solver include that.`,
num: "Silicon strip: bend radius 5 µm gives negligible loss, 2 µm is marginal, 1 µm radiates strongly. Thin SiN needs 50 to 100 µm. Thick SiN needs about 20 µm.",
r(fig, ctl) {
  ctl.innerHTML = sl("R", "bend_radius (µm)", 1, 20, 0.5, 5);
  const u = () => {
    const R = +$("R").value; $("Rv").textContent = R + " µm";
    const d = 0.45, b = slabModes(nSi, nOx, d, 1.55, "te")[0];
    const code = `mode_spec = td.ModeSpec(num_modes=1, bend_radius=${R}, bend_axis=2,\n    group_index_step=True)\nmd = ModeSolver(simulation=sim, plane=plane, mode_spec=mode_spec,\n    freqs=[freq0]).solve()\nalpha = 2 * k0 * np.imag(md.n_eff)          # power decay, 1/um\nloss_dB_90 = 4.343 * alpha * np.pi * ${R} / 2   # per quarter turn`;
    const x0 = 60, w = 560, y0 = 30, h = 150, X = 1.2; const shift = 0.12 * 5 / R, leak = Math.exp(-R / 1.2);
    const xs = range(-X, X, 240), ys = xs.map(x => { let v = profile(nSi, nOx, d, 1.55, b, 0, x - shift); if (x > d / 2 + shift) v = Math.max(v, leak * 0.6 * Math.exp(-(x - d / 2 - shift) * 0.5) * (0.6 + 0.4 * Math.cos(12 * x))); return v; });
    let s = `<rect x="${x0 + w / 2 - d / (2 * X) * w / 2}" y="${y0}" width="${d / X * w / 2}" height="${h}" fill="${PB}" opacity="0.25"/>` + tx(x0 + w / 2, y0 + h + 14, "core, outside of the bend to the right", "middle");
    s += plot(x0, y0, w, h, xs, ys, -X, X, -0.05, 1.05, PC, 2.5);
    s += tx(x0 + w / 2, 18, `R = ${R} µm: profile shifted outward by ${(shift * 1000).toFixed(0)} nm, radiated tail ${(leak * 100).toFixed(1)} percent (illustrative scaling)`, "middle", "th");
    show(fig, code, y0 + h + 28, s);
  };
  $("R").oninput = u; u();
}}
],
summary: String.raw`ModeSpec names the modes: how many, near which effective index, which polarization, and whether the guide is bent or the group index is wanted. The mode solver plugin returns effective indices, group indices and profiles from one plane without FDTD. A ModeSource launches one solved mode in one direction with a Gaussian pulse, and a ModeMonitor projects the field back onto the modes to give complex amplitudes per direction whose squares are transmission and reflection. The slab model shows the physics: modes between the cladding and core index, TM less confined than TE, the group index above the effective index, and a bend leaning the mode outward until it leaks.`,
sheet: [
[String.raw`\[ k_0\sqrt{n_1^2 - n_{\mathrm{eff}}^2}\, d - 2\arctan\!\left(q\frac{\sqrt{n_{\mathrm{eff}}^2 - n_2^2}}{\sqrt{n_1^2 - n_{\mathrm{eff}}^2}}\right) = m\pi \]`, "Slab modes, q = 1 for TE and n₁²/n₂² for TM"],
[String.raw`\[ n_g = n_{\mathrm{eff}} - \lambda\, dn_{\mathrm{eff}}/d\lambda \]`, "Group index, <code>group_index_step</code>"],
[String.raw`\[ E_y(x,z,t) = E_y(x)\cos(\beta z - \omega t), \quad \beta = 2\pi n_{\mathrm{eff}}/\lambda_0 \]`, "The launched mode of a ModeSource"],
[String.raw`\[ T = |a_+|^2, \quad R = |a_-|^2 \]`, "ModeMonitor amplitudes to power"],
[String.raw`\[ n_{\mathrm{bend}}(x) = n(x)(1 + x/R) \]`, "Conformal index of a bend, <code>bend_radius</code>"]],
consts: String.raw`Slab model: n core 3.48, n cladding 1.44, λ 1.55 µm. Strip values quoted from the Tidy3D mode source tutorial for a 220 × 450 nm silicon strip.`,
sources: ["Tidy3D documentation, td.ModeSpec, td.ModeSource and td.ModeMonitor API pages (2.12)", "Tidy3D notebooks ModeSolver, ModalSourcesMonitors and WaveguidePluginDemonstration", "A. Yariv and P. Yeh, Photonics, 6th ed., Oxford (2007), Ch. 3 (slab modes, TE and TM)", "M. Heiblum and J. Harris, IEEE J. Quantum Electron. 11, 75 (1975), conformal transformation of bent waveguides"]
});
})();

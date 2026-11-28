/* Shared tools for the shelf "FDTD and Tidy3D, from Maxwell to my devices" (subject fdtd).
   Prefix FD. Uses the global helpers in app.js (svg, sl, btns, pick, plot, arrow, anim, stopAnim, typesetMath),
   C2 (FDTD1D, FDTD2D, slab solver, color maps), C3 (frame, X, Y, legend) and LC (steps, box, mathFig, code, pbs, toy). */

const FD = {};

/* ---------- videos used across the shelf (all checked to exist, Nov 2026) ---------- */
FD.V = {
  f101: ["Flexcompute, FDTD 101 (10 lectures, playlist)", "https://www.youtube.com/playlist?list=PL7kxN4u_N9HGMhaR4SrTUro8VUmEjWNnI"],
  f101page: ["Flexcompute, FDTD 101 course page (slides and notebooks)", "https://www.flexcompute.com/tidy3d/learning-center/fdtd101/"],
  f2: ["FDTD 101 Lecture 2: Using FDTD to compute a transmission spectrum (about 11 min, in the playlist)", "https://www.youtube.com/playlist?list=PL7kxN4u_N9HGMhaR4SrTUro8VUmEjWNnI"],
  f3: ["FDTD 101 Lecture 3: Applying FDTD to photonic crystal slab simulation (in the playlist)", "https://www.youtube.com/playlist?list=PL7kxN4u_N9HGMhaR4SrTUro8VUmEjWNnI"],
  f4: ["FDTD 101 Lecture 4: Prelude to integrated photonics simulation, mode injection", "https://www.youtube.com/watch?v=OIWHoPI2cZo"],
  f5: ["FDTD 101 Lecture 5: Modeling dispersive material in FDTD (in the playlist)", "https://www.youtube.com/playlist?list=PL7kxN4u_N9HGMhaR4SrTUro8VUmEjWNnI"],
  f6: ["FDTD 101 Lecture 6: Introduction to perfectly matched layer (about 17 min)", "https://www.youtube.com/watch?v=2XP5oTcXp8I"],
  f7: ["FDTD 101 Lecture 7: Time step size and CFL condition", "https://www.youtube.com/watch?v=fNXvB8XU1fE"],
  f8: ["FDTD 101 Lecture 8: Numerical dispersion in FDTD (about 21 min, course page)", "https://www.flexcompute.com/fdtd101/Lecture-8-Numerical-dispersion-in-FDTD/"],
  f9: ["FDTD 101 Lecture 9: Dielectric constant assignment on Yee grids", "https://www.youtube.com/watch?v=1X1a83029Z4"],
  f10: ["FDTD 101 Lecture 10: Introduction to subpixel averaging (about 13 min)", "https://www.youtube.com/watch?v=AzGPWKp5kFc"],
  r1: ["Raymond Rumpf (EMPossible), Lecture 1 (FDTD): Introduction", "https://www.youtube.com/watch?v=vVeyP85xKD4"],
  r4: ["Raymond Rumpf (EMPossible), Lecture 4 (FDTD): Electromagnetics and FDTD", "https://www.youtube.com/watch?v=TbzFef5gUms"],
  r10: ["Raymond Rumpf (EMPossible), Lecture 10 (FDTD): Enhancing 1D FDTD", "https://www.youtube.com/watch?v=ZrgGIkBvbvM"],
  r5304: ["Raymond Rumpf, EMP 5304 FDTD course page (all lecture notes and videos)", "https://empossible.net/academics/emp5304/"],
  r5337: ["Raymond Rumpf, EMP 5337 Computational Electromagnetics course page (finite differences, Yee grid, waveguide analysis)", "https://empossible.net/academics/emp5337/"],
  m1h: ["Implementing FDTD equations with Matlab in one hour", "https://www.youtube.com/watch?v=OjbfxnfCWRQ"],
  idao: ["Flexcompute (Tyler Hughes), Inverse design and adjoint optimization", "https://www.youtube.com/watch?v=fKRHGoLuNjQ"]
};
FD.vid = (key, note) => [FD.V[key][0], FD.V[key][1], note || ""];

/* ---------- references used across the shelf ---------- */
FD.R = {
  taflove: "A. Taflove and S. C. Hagness, Computational Electrodynamics: The Finite-Difference Time-Domain Method, 3rd ed. (Artech House, 2005)",
  schneider: `J. B. Schneider, Understanding the Finite-Difference Time-Domain Method (free online book, <a href="https://eecs.wsu.edu/~schneidj/ufdtd/" target="_blank" rel="noopener">eecs.wsu.edu/~schneidj/ufdtd</a>)`,
  sullivan: "D. M. Sullivan, Electromagnetic Simulation Using the FDTD Method, 2nd ed. (IEEE Press and Wiley, 2013)",
  yee: `K. S. Yee, "Numerical solution of initial boundary value problems involving Maxwell's equations in isotropic media," IEEE Trans. Antennas Propag. 14, 302 (1966), <a href="https://doi.org/10.1109/TAP.1966.1138693" target="_blank" rel="noopener">doi:10.1109/TAP.1966.1138693</a>`,
  meep: `A. F. Oskooi et al., "MEEP: A flexible free-software package for electromagnetic simulations by the FDTD method," Comput. Phys. Commun. 181, 687 (2010), <a href="https://doi.org/10.1016/j.cpc.2009.11.008" target="_blank" rel="noopener">doi:10.1016/j.cpc.2009.11.008</a>`,
  berenger: `J.-P. Berenger, "A perfectly matched layer for the absorption of electromagnetic waves," J. Comput. Phys. 114, 185 (1994), <a href="https://doi.org/10.1006/jcph.1994.1159" target="_blank" rel="noopener">doi:10.1006/jcph.1994.1159</a>`,
  roden: `J. A. Roden and S. D. Gedney, "Convolution PML (CPML): An efficient FDTD implementation of the CFS-PML for arbitrary media," Microw. Opt. Technol. Lett. 27, 334 (2000)`,
  sjpml: `S. G. Johnson, "Notes on perfectly matched layers (PMLs)," MIT 18.369 course notes, <a href="https://math.mit.edu/~stevenj/18.369/pml.pdf" target="_blank" rel="noopener">math.mit.edu/~stevenj/18.369/pml.pdf</a>`,
  farj: `A. Farjadpour et al., "Improving accuracy by subpixel smoothing in the finite-difference time domain," Opt. Lett. 31, 2972 (2006), <a href="https://doi.org/10.1364/OL.31.002972" target="_blank" rel="noopener">doi:10.1364/OL.31.002972</a>`,
  oskooi09: `A. F. Oskooi, C. Kottke and S. G. Johnson, "Accurate finite-difference time-domain simulation of anisotropic media by subpixel smoothing," Opt. Lett. 34, 2778 (2009), <a href="https://doi.org/10.1364/OL.34.002778" target="_blank" rel="noopener">doi:10.1364/OL.34.002778</a>`,
  okamoto: "K. Okamoto, Fundamentals of Optical Waveguides, 2nd ed. (Academic Press, 2006), Ch. 2 and Ch. 4",
  chrost: "L. Chrostowski and M. Hochberg, Silicon Photonics Design (Cambridge University Press, 2015), Ch. 2 and 3",
  molesky: `S. Molesky et al., "Inverse design in nanophotonics," Nature Photonics 12, 659 (2018), <a href="https://doi.org/10.1038/s41566-018-0246-9" target="_blank" rel="noopener">doi:10.1038/s41566-018-0246-9</a>`,
  td: `Tidy3D documentation, version 2.11 (Flexcompute), <a href="https://docs.flexcompute.com/projects/tidy3d/en/latest/" target="_blank" rel="noopener">docs.flexcompute.com/projects/tidy3d</a>. Default values quoted in this shelf were read from the tidy3d 2.11.2 package itself`,
  rumpfNotes: `R. C. Rumpf, "Enhancing 1D FDTD" lecture notes (EMP 5304), <a href="https://empossible.net/wp-content/uploads/2020/01/Lecture-Enhancing-1D-FDTD.pdf" target="_blank" rel="noopener">empossible.net</a>`
};

/* ---------- small drawing helpers ---------- */
FD.txt = (x, y, t, cls, anchor) => `<text class="${cls || "ts"}" x="${x}" y="${y}" ${anchor ? `text-anchor="${anchor}"` : ""}>${t}</text>`;
FD.ro = items => items.map(([a, b]) => `<div><span>${a}</span><b>${b}</b></div>`).join("");
FD.f = (v, d) => Number(v).toFixed(d === undefined ? 2 : d);
FD.SUP = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "-": "⁻" };
FD.sci = (v, d) => { if (v === 0) return "0"; const e = Math.floor(Math.log10(Math.abs(v))), m = v / Math.pow(10, e); return `${m.toFixed(d === undefined ? 2 : d)} × 10${String(e).split("").map(c => FD.SUP[c]).join("")}`; };
FD.int = v => Math.round(v).toLocaleString("en-US");

/* Play / Pause / Restart buttons in ctl. Returns an object whose .run flag the loop reads. */
FD.player = function (ctl, onRestart, extra) {
  ctl.insertAdjacentHTML("beforeend", `<div class="row"><button data-pp="1">Pause</button><button data-rs="1">Restart</button>${extra || ""}</div>`);
  const st = { run: true }, pb = ctl.querySelector("[data-pp]");
  pb.onclick = () => { st.run = !st.run; pb.textContent = st.run ? "Pause" : "Play"; };
  ctl.querySelector("[data-rs]").onclick = () => { st.run = true; pb.textContent = "Pause"; onRestart(); };
  return st;
};

/* ---------- physics constants for the real numbers ---------- */
FD.c = 2.99792458e8;      // m/s
FD.lam0 = 795e-9;         // m, centre of the PBS band
FD.nG = 3.492;            // index used for the GaAs membrane in the method settings

/* ---------- a 1D Yee solver with every option a lesson needs ----------
   Normalized units: dx = 1, c = 1, S = c dt / dx. Ez on integer nodes 0..N-1, Hy on half nodes (index i means i + 1/2).
   opt.bc: "pec" (Ez = 0 at both ends), "pmc" (Hy = 0 at the ends), "mur" (first-order absorbing, exact at S = 1), "pml"
   opt.pml: layers, opt.order: grading order m, opt.smax: maximum loss per cell (normalized sigma dt / eps0). */
FD.Yee1 = function (N, S, eps, opt) {
  opt = opt || {};
  this.N = N; this.S = S; this.eps = eps || new Float64Array(N).fill(1); this.t = 0;
  this.ez = new Float64Array(N); this.hy = new Float64Array(N);
  this.bc = opt.bc || "pml"; const L = this.bc === "pml" ? (opt.pml || 30) : 0, m = opt.order || 3, smax = opt.smax === undefined ? 0.8 : opt.smax;
  this.L = L;
  this.ce = new Float64Array(N); this.de = new Float64Array(N); this.ch = new Float64Array(N); this.dh = new Float64Array(N);
  const prof = x => (L && x > 0) ? smax * Math.pow(Math.min(x, 1), m) : 0;
  for (let i = 0; i < N; i++) {
    const dE = i < L ? (L - i) / L : i > N - 1 - L ? (i - (N - 1 - L)) / L : 0;
    const iH = i + 0.5, dH = iH < L ? (L - iH) / L : iH > N - 1 - L ? (iH - (N - 1 - L)) / L : 0;
    const lE = prof(dE) / 2, lH = prof(dH) / 2;
    this.ce[i] = (1 - lE) / (1 + lE); this.de[i] = S / this.eps[i] / (1 + lE);
    this.ch[i] = (1 - lH) / (1 + lH); this.dh[i] = S / (1 + lH);
  }
};
/* One leapfrog step. src: { i, v, hard } adds v to Ez at node i (soft) or sets it (hard). */
FD.Yee1.prototype.step = function (src) {
  const { N, ez, hy, S } = this;
  const eL = ez[1], eR = ez[N - 2];
  for (let i = 0; i < N - 1; i++) hy[i] = this.ch[i] * hy[i] + this.dh[i] * (ez[i + 1] - ez[i]);
  if (this.bc === "pmc") hy[N - 1] = 0;
  for (let i = 1; i < N - 1; i++) ez[i] = this.ce[i] * ez[i] + this.de[i] * (hy[i] - hy[i - 1]);
  if (this.bc === "pec" || this.bc === "pml") { ez[0] = 0; ez[N - 1] = 0; }
  else if (this.bc === "pmc") { ez[0] = ez[0] + this.de[0] * hy[0] * 2; ez[N - 1] = ez[N - 1] - this.de[N - 1] * hy[N - 2] * 2; }
  else if (this.bc === "mur") { const k = (S - 1) / (S + 1); ez[0] = eL + k * (ez[1] - ez[0]); ez[N - 1] = eR + k * (ez[N - 2] - ez[N - 1]); }
  if (src) { if (src.hard) ez[src.i] = src.v; else ez[src.i] += src.v; }
  this.t++;
};
FD.Yee1.prototype.energy = function () { let U = 0; for (let i = 0; i < this.N; i++) U += this.eps[i] * this.ez[i] ** 2 + this.hy[i] ** 2; return U; };

/* Draw a 1D state. opt: y0, h, amp, hy (show H), src (node), pml (layers), nodes (show dots), x0, w */
FD.draw1 = function (sim, opt) {
  opt = opt || {};
  const N = sim.N, x0 = opt.x0 || 50, w = opt.w || 590, y0 = opt.y0 || 30, h = opt.h || 150, A = opt.amp || 1.2;
  const X = i => x0 + i / (N - 1) * w, Y = v => y0 + h / 2 - Math.max(-A, Math.min(A, v)) / A * h / 2;
  let s = "";
  for (let i = 0; i < N; i++) if (sim.eps[i] > 1.01) s += `<rect x="${X(i).toFixed(1)}" y="${y0}" width="${(w / (N - 1) + 0.5).toFixed(1)}" height="${h}" fill="var(--blue-bg)"/>`;
  const L = opt.pml !== undefined ? opt.pml : sim.L || 0;
  if (L) s += `<rect x="${x0}" y="${y0}" width="${L / (N - 1) * w}" height="${h}" fill="var(--gray-bg)"/><rect x="${x0 + w - L / (N - 1) * w}" y="${y0}" width="${L / (N - 1) * w}" height="${h}" fill="var(--gray-bg)"/>`;
  s += `<line x1="${x0}" x2="${x0 + w}" y1="${y0 + h / 2}" y2="${y0 + h / 2}" stroke="var(--b)"/>`;
  const xs = [...Array(N).keys()];
  if (opt.hy) s += plot(x0, y0, w, h, xs.map(i => i + 0.5), Array.from(sim.hy).slice(0, N - 1).concat([NaN]), 0, N - 1, -A, A, "var(--coral)", 1.6);
  s += plot(x0, y0, w, h, xs, Array.from(sim.ez), 0, N - 1, -A, A, "var(--blue)", 2);
  if (opt.nodes) {
    for (let i = 0; i < N; i++) s += `<circle cx="${X(i).toFixed(1)}" cy="${Y(sim.ez[i]).toFixed(1)}" r="2.6" fill="var(--blue)"/>`;
    if (opt.hy) for (let i = 0; i < N - 1; i++) s += `<rect x="${(X(i + 0.5) - 2.2).toFixed(1)}" y="${(Y(sim.hy[i]) - 2.2).toFixed(1)}" width="4.4" height="4.4" fill="var(--coral)"/>`;
  }
  if (opt.src != null) s += `<line x1="${X(opt.src)}" x2="${X(opt.src)}" y1="${y0}" y2="${y0 + h}" stroke="var(--purple)" stroke-dasharray="4 3"/>${FD.txt(X(opt.src), y0 - 6, opt.srcLab || "source", "ts", "middle")}`;
  return s;
};

/* Gaussian pulse used by the 1D demos: carrier period P cells / S, width tau steps, delay t0. */
FD.pulse = (t, t0, tau, w) => Math.exp(-Math.pow((t - t0) / tau, 2) / 2) * (w ? Math.sin(w * (t - t0)) : 1);

/* ---------- the 2D toy splitter as a pulse run (moved from the first lecture series) ---------- */
FD.toyPulse = function () {
  const T = LC.toy(); LC.toyApply(T, LC.toyStart(T));
  const sim = new C2.FDTD2D(T.nx, T.ny, 0.5, T.eps, T.pad), w = 2 * Math.PI * 0.5 / T.lam;
  const step = () => { const t = sim.t; sim.step(null); const g = Math.exp(-Math.pow((t - 120) / 40, 2) / 2) * Math.sin(w * t); for (let k = -12; k <= 12; k++) { const q = (T.yc + k) * T.nx + T.src; sim.ez[q] += 0.3 * g * T.prof[k + 12] / T.eps[q]; } };
  const energy = () => { let U = 0; for (let q = 0; q < sim.ez.length; q++) U += T.eps[q] * sim.ez[q] ** 2 + sim.hx[q] ** 2 + sim.hy[q] ** 2; return U; };
  return { T, sim, step, energy };
};
FD.toyDraw = function (P, img, ctx, gain) {
  const T = P.T, sim = P.sim;
  for (let q = 0; q < T.nx * T.ny; q++) { const c = C2.color(sim.ez[q] * (gain || 6)), o = q * 4, e = T.eps[q] > 1.5 ? 0.82 : 1; img.data[o] = c[0] * e; img.data[o + 1] = c[1] * e; img.data[o + 2] = c[2] * e; img.data[o + 3] = 255; }
  for (let j = T.yc - 25; j < T.yc + 25; j++) for (const i of [T.d0, T.d1 - 1]) { const o = (j * T.nx + i) * 4; img.data[o] = 120; img.data[o + 1] = 120; img.data[o + 2] = 120; }
  for (let i = T.d0; i < T.d1; i++) for (const j of [T.yc - 25, T.yc + 24]) { const o = (j * T.nx + i) * 4; img.data[o] = 120; img.data[o + 1] = 120; img.data[o + 2] = 120; }
  ctx.putImageData(img, 0, 0);
};

/* ---------- the PBS checkpoint card ----------
   Every lesson in Chapters 1 to 10 ends with this card: where the idea sits in the PBS run and which line of the code does it.
   o: { step (1 to 9 of the storyline), t, intu, code (array of lines), hi (highlighted line indices), on (LC.pbs parts),
        eq, sym, how, say, num, note } */
FD.STORY = ["Pulse", "Source", "Yee grid", "Fields in time", "Frequency domain", "FOM", "Adjoint source", "Gradient", "Adam"];
FD.storyStrip = function (cur) {
  let s = "";
  FD.STORY.forEach((n, i) => {
    const x = 8 + i * 74, on = i + 1 === cur, w = n.split(" "), l1 = w.length > 1 ? w[0] : n, l2 = w.length > 1 ? w.slice(1).join(" ") : "";
    s += `<g class="c-${on ? "coral" : "gray"}" opacity="${on ? 1 : 0.55}"><rect x="${x}" y="4" width="68" height="46" rx="6" stroke-width="1.2"/><text class="ts" x="${x + 34}" y="17" text-anchor="middle">${i + 1}</text><text class="ts" x="${x + 34}" y="31" text-anchor="middle">${l1}</text>${l2 ? `<text class="ts" x="${x + 34}" y="44" text-anchor="middle">${l2}</text>` : ""}</g>`;
  });
  return svg(54, s);
};
FD.ckpt = function (o) {
  return {
    s: "PBS checkpoint", t: o.t,
    intu: o.intu, eq: o.eq, sym: o.sym || [], how: o.how, say: o.say, num: o.num || "", note: o.note,
    r(fig, ctl) {
      let v = "pbs";
      ctl.innerHTML = btns([["pbs", "Where in the PBS"], ["code", "The line of code"]], "v") + (o.extraCtl || "");
      const u = () => {
        pick(ctl, "v", v);
        fig.innerHTML = FD.storyStrip(o.step) + (v === "pbs" ? (o.fig ? o.fig() : LC.pbs(o.on || ["design", "ports"], { note: o.cap || "" })) : LC.code(o.code, o.hi));
        if (o.after) o.after(fig, v);
      };
      ctl.querySelectorAll("button[data-v]").forEach(b => b.onclick = () => { v = b.dataset.v; u(); });
      u();
    }
  };
};

/* Study order of Part A. lessons/fdtd/order.js turns it into the Previous and Next links. */
FD.ORDER_A = ["fdtd-p1", "fdtd-1-1", "fdtd-1-2", "fdtd-1-3", "fdtd-1-4", "fdtd-2-1", "fdtd-2-2", "fdtd-2-3", "fdtd-2-4", "fdtd-3-1", "fdtd-3-2",
  "fdtd-6-1", "fdtd-6-2", "fdtd-6-3", "fdtd-3-4", "fdtd-4-1", "fdtd-4-2", "fdtd-4-3", "fdtd-3-3", "fdtd-4-4", "fdtd-4-5", "fdtd-5-1", "fdtd-5-2", "fdtd-5-3"];

/* ---------- 1D slab spectra at a chosen resolution (Chapter 2) ----------
   r: cells per vacuum wavelength lambda0 = 1. n, d: slab index and thickness (in lambda0). lams: wavelengths (in lambda0).
   sub: average the permittivity of the cells the slab faces cut through (arithmetic mean, E is parallel to the faces).
   S: Courant number. Returns |E_slab|^2 / |E_ref|^2 at the probe, from two runs (with and without the slab). */
FD.slab1D = function (o) {
  const r = o.r, n = o.n || 2, d = o.d || 0.6, S = o.S || 0.5, pml = 30, pad = Math.round(2.5 * r);
  const a = pml + pad, b = a + d * r, N = Math.ceil(b + pad + pml + 2), src = pml + 5, probe = N - pml - 5;
  const lamc = o.lamc || 1, w0 = 2 * Math.PI * S / (lamc * r), tau = (o.tauW || 0.5) * lamc * r / S, t0 = 5 * tau;
  const steps = Math.ceil(t0 + 2 * tau + (N / S) * (o.slow || 3.2));
  const ws = o.lams.map(l => 2 * Math.PI * S / (l * r));
  const one = slab => {
    const eps = new Float64Array(N).fill(1);
    if (slab) for (let i = 0; i < N; i++) {
      const lo = i - 0.5, hi = i + 0.5, f = Math.max(0, Math.min(hi, b) - Math.max(lo, a));
      if (o.sub) eps[i] = 1 + f * (n * n - 1); else eps[i] = (i >= Math.round(a) && i < Math.round(b)) ? n * n : 1;
    }
    const sim = new FD.Yee1(N, S, eps, { bc: "pml", pml });
    const re = new Float64Array(ws.length), im = new Float64Array(ws.length);
    for (let t = 0; t < steps; t++) {
      sim.step({ i: src, v: FD.pulse(t, t0, tau, w0) });
      const e = sim.ez[probe];
      for (let k = 0; k < ws.length; k++) { re[k] += e * Math.cos(ws[k] * t); im[k] += e * Math.sin(ws[k] * t); }
    }
    return ws.map((_, k) => re[k] * re[k] + im[k] * im[k]);
  };
  const p1 = one(true), p0 = one(false);
  return p1.map((v, k) => v / p0[k]);
};
/* Exact transmission of a lossless slab (index n, thickness d) in air at normal incidence. */
FD.slabT = (n, d, lam) => LC.slabT(n, d, lam);

/* Committee questions, lesson Q4: FDTD and simulation settings (Ch. 2 Sec. 2.6, Ch. 3 Sec. 3.4 and 3.6).
   Every card is a whiteboard build: Back / Play / Next steps in the order of the how[] list. */

/* ---------- whiteboard helpers (prefix DQ4_) ---------- */
const DQ4_K = { ink: "#1f2933", mute: "#6b7684", soft: "#e8ecf2", blue: "#2f78c4", orange: "#D85A30", teal: "#1D9E75", purple: "#7F77DD", amber: "#BA7517", red: "#C0392B", gaas: "#cfdcec", pml: "#e9e4f5" };
const DQ4_T = (x, y, s, o) => { o = o || {}; return `<text x="${x}" y="${y}" font-family="Public Sans, system-ui, sans-serif" font-size="${o.fs || 13}" fill="${o.c || DQ4_K.ink}" text-anchor="${o.a || "start"}"${o.w ? ` font-weight="${o.w}"` : ""}${o.r ? ` transform="rotate(${o.r} ${x} ${y})"` : ""}>${s}</text>`; };
const DQ4_L = (x1, y1, x2, y2, c, w, d) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c || DQ4_K.ink}" stroke-width="${w || 1.6}"${d ? ` stroke-dasharray="${d}"` : ""} stroke-linecap="round"/>`;
const DQ4_A = (x1, y1, x2, y2, c, w, d) => arrow(x1, y1, x2, y2, c || DQ4_K.ink, w || 1.8, d);
const DQ4_R = (x, y, w, h, f, s, op) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f || "none"}" stroke="${s || "none"}"${op !== undefined ? ` fill-opacity="${op}"` : ""}/>`;
const DQ4_sub = s => `<tspan baseline-shift="sub" font-size="9.5">${s}</tspan>`;
const DQ4_map = (a, b, A, B) => v => A + (v - a) / (b - a) * (B - A);
const DQ4_pl = (X, Y, xs, ys, c, w, d, fill) => { let s = ""; xs.forEach((x, i) => { const y = ys[i]; if (!isFinite(y)) return; s += (s ? "L" : "M") + X(x).toFixed(1) + " " + Y(y).toFixed(1); }); return `<path d="${s}" fill="${fill || "none"}" stroke="${c}" stroke-width="${w || 2}"${d ? ` stroke-dasharray="${d}"` : ""} stroke-linejoin="round"/>`; };
const DQ4_ax = (x0, y0, w, h, xl, yl) => DQ4_A(x0, y0 + h, x0 + w, y0 + h, DQ4_K.ink, 1.3) + DQ4_A(x0, y0 + h, x0, y0, DQ4_K.ink, 1.3) + (xl ? DQ4_T(x0 + w, y0 + h + 16, xl, { a: "end", fs: 12, c: DQ4_K.mute }) : "") + (yl ? DQ4_T(x0 + 6, y0 + 4, yl, { fs: 12, c: DQ4_K.mute }) : "");
const DQ4_dot = (x, y, r, c, f) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f || c}" stroke="${c}" stroke-width="1.5"/>`;
const DQ4_pct = v => (100 * v).toFixed(v < 0.01 ? 2 : 1) + " %";

/* The board: steps with captions, Back / Play / Next, optional sliders, option buttons, readout and an equation strip. */
function DQ4_board(fig, ctl, o) {
  const n = o.cap.length, v = {}, opts = o.opts || [];
  let k = 1, play = false, tm = null;
  opts.forEach(g => v[g.key] = g.val);
  ctl.innerHTML = opts.map(g => `<div class="row"><label>${g.label}</label>${g.items.map(([val, tx]) => `<button data-${g.key}="${val}">${tx}</button>`).join("")}</div>`).join("")
    + (o.sl || []).map(s => sl(s[0], s[1], s[2], s[3], s[4], s[5])).join("")
    + `<div class="row"><button data-qb="b">Back</button><button data-qb="p">Play</button><button data-qb="n">Next</button><span class="dq4s" style="font-size:13px;color:var(--muted);margin-left:4px"></span></div>`
    + (o.ro ? `<div class="readout dq4r"></div>` : "");
  fig.innerHTML = `<div class="dq4b">${o.eqs ? `<div class="dq4e" style="display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:4px 16px;min-height:50px;font-size:16px;padding:6px 10px;margin-bottom:6px;background:var(--sunk);border-radius:8px">${o.eqs.map(([s, tx]) => `<span data-s="${s}" style="transition:opacity .4s">${tx}</span>`).join("")}</div>` : ""}<div class="dq4v"></div><p class="dq4c" style="font-size:14.5px;line-height:1.55;color:var(--fg);min-height:46px;margin:8px 2px 0"></p></div>`;
  const box = fig.querySelector(".dq4b"), vis = fig.querySelector(".dq4v"), cap = fig.querySelector(".dq4c"), stl = ctl.querySelector(".dq4s"), ro = ctl.querySelector(".dq4r");
  const B = q => ctl.querySelector(`button[data-qb="${q}"]`);
  if (o.eqs) typesetMath(fig.querySelector(".dq4e"));
  const read = () => (o.sl || []).forEach(s => { v[s[0]] = +$(s[0]).value; $(s[0] + "v").textContent = s[6] ? s[6](v[s[0]]) : v[s[0]]; });
  const render = t => {
    vis.innerHTML = svg(o.h, `<rect x="1" y="1" width="678" height="${o.h - 2}" rx="10" fill="#ffffff" stroke="#d3d9e2"/>` + o.draw(k, v, t || 0));
    const c = o.cap[k - 1]; cap.innerHTML = `<b>Step ${k}.</b> ` + (typeof c === "function" ? c(v) : c);
    stl.textContent = `step ${k} of ${n}`; B("b").disabled = k === 1; B("n").disabled = k === n; B("p").textContent = play ? "Pause" : "Play";
    if (o.eqs) fig.querySelectorAll(".dq4e span").forEach(e => e.style.opacity = +e.dataset.s <= k ? 1 : 0.12);
    if (ro) ro.innerHTML = o.ro(v, k).map(([a, b]) => `<div><span>${a}</span><b>${b}</b></div>`).join("");
    opts.forEach(g => pick(ctl, g.key, v[g.key]));
  };
  const go = kk => { k = Math.max(1, Math.min(n, kk)); if (o.onStep) o.onStep(k, v); if (!o.live) render(); };
  const tick = () => { if (!box.isConnected || !play) return; if (k < n) { go(k + 1); tm = setTimeout(tick, o.dt || 3000); } else { play = false; if (!o.live) render(); } };
  B("b").onclick = () => { play = false; clearTimeout(tm); go(k - 1); if (o.live) render(); };
  B("n").onclick = () => { play = false; clearTimeout(tm); go(k + 1); if (o.live) render(); };
  B("p").onclick = () => { clearTimeout(tm); if (play) { play = false; render(); return; } play = true; if (k === n) go(1); render(); tm = setTimeout(tick, o.dt || 3000); };
  (o.sl || []).forEach(s => $(s[0]).oninput = () => { read(); if (o.onInput) o.onInput(v, s[0]); render(); });
  opts.forEach(g => ctl.querySelectorAll(`button[data-${g.key}]`).forEach(b => b.onclick = () => { v[g.key] = b.dataset[g.key]; if (o.onInput) o.onInput(v, g.key); render(); }));
  read(); if (o.init) o.init(v);
  if (o.live) anim(t => { if (!box.isConnected) { stopAnim(); return; } render(t); }); else render(0);
}

/* A 1D Yee simulation in normalized units (dx = 1, c = 1, S = 0.5). Left end: graded matched layer.
   Right end: "pml" (graded, matched), "lossy" (electric loss only, constant), "pec" (hard wall). */
function DQ4_fdtd(N, eps, o) {
  const S = 0.5, ez = new Float64Array(N), hy = new Float64Array(N), ca = new Float64Array(N), cb = new Float64Array(N), da = new Float64Array(N), db = new Float64Array(N);
  const L = o.L || 30, R0 = N - (o.RL || 30);
  for (let i = 0; i < N; i++) {
    let le = 0, lm = 0;
    if (i < L) { const d = (L - i) / L; le = lm = 0.6 * d * d * d / 2; }
    if (o.right === "pml" && i >= R0) { const d = (i - R0 + 1) / o.RL; le = lm = o.Rs * d * d * d / 2; }
    if (o.right === "lossy" && i >= R0) { le = o.Rs / 2; lm = 0; }
    ca[i] = (1 - le) / (1 + le); cb[i] = S / eps[i] / (1 + le); da[i] = (1 - lm) / (1 + lm); db[i] = S / (1 + lm);
  }
  return { ez, hy, t: 0, N, R0, step(src) {
    for (let i = 0; i < N - 1; i++) hy[i] = da[i] * hy[i] + db[i] * (ez[i + 1] - ez[i]);
    for (let i = 1; i < N; i++) ez[i] = ca[i] * ez[i] + cb[i] * (hy[i] - hy[i - 1]);
    ez[0] = 0; if (o.right === "pec") ez[N - 1] = 0;
    if (src) ez[src[0]] += src[1];
    this.t++;
  } };
}
/* modulated Gaussian pulse: period P steps, envelope width w steps, centred at t0 */
const DQ4_pulse = (t, P, w, t0) => Math.exp(-Math.pow((t - t0) / w, 2)) * Math.sin(2 * Math.PI * (t - t0) / P);

addLesson("thesis", "def", {
level: "Defense", id: "thesis-def-q4", title: "FDTD and simulation settings", short: "Q4. FDTD and settings",
labels: { intu: "Short answer", how: "On the board, step by step", note: "Follow-up they might ask" },
big: String.raw`Every number in the thesis comes from an FDTD simulation, so the committee will want to know you understand the solver and every setting you chose. This lesson takes the eight questions most likely to come up about Ch. 2 Sec. 2.6 and Ch. 3 Sec. 3.6: what FDTD solves and why in time, why the Yee grid is staggered, how one run gives a whole spectrum, what a PML does, how fine the grid must be and why it is quoted in GaAs, why the gratings are 2D and the taper and splitter 3D, how symmetry planes work and why \(z = 0\) is not allowed under the grating, and how a transmission number comes out of the fields. Each card gives a short answer, the board drawing step by step with a visual that builds in the same order, a sentence to say aloud, and the follow-up that may come next.`,
bridge: "The physics is from Ch. 2 Sec. 2.6 (Eq. 2.16, the Yee cell of Fig. 2.7, PML) and the settings from Ch. 3 Sec. 3.4 (mode overlap, Eq. 3.12) and Sec. 3.6 (grid, symmetry, boundaries and sources). Taflove and Hagness 2016 is the FDTD reference of the thesis, and Tidy3D the solver. The Courant limit and subpixel averaging are not in the thesis and appear only as follow-ups. All demos run live in the page with round textbook values (n = 3.5, 800 nm), no thesis results.",
cards: [

/* ---------------- Q4.1 ---------------- */
{s: "Q4.1", t: "What does FDTD actually solve, and why in the time domain?",
intu: String.raw`FDTD solves Maxwell's two curl equations, Eq. (2.16), directly in time on a grid. It never builds or inverts a matrix. Each field component is updated from its neighbours, first all of \(\mathbf H\), then all of \(\mathbf E\), half a time step apart, so one step is cheap and the memory is just the fields on the grid. The time domain pays off because a short pulse contains many frequencies at once. One run, Fourier transformed at the end, gives the response over the whole band, which is exactly what a band-averaged objective over 101 wavelengths needs.`,
eq: String.raw`\[ \frac{\partial \mathbf{E}}{\partial t} = \frac{1}{\varepsilon_0\varepsilon_r}\,\nabla \times \mathbf{H}, \qquad \frac{\partial \mathbf{H}}{\partial t} = -\frac{1}{\mu_0}\,\nabla \times \mathbf{E} \]<div class="eqref">Ch. 2 Eq. (2.16), Taflove and Hagness 2016, Eqs. (1) and (2)</div>\[ \mathbf H^{n+1/2} = \mathbf H^{n-1/2} - \frac{\Delta t}{\mu_0}\,\nabla\times\mathbf E^{n}, \qquad \mathbf E^{n+1} = \mathbf E^{n} + \frac{\Delta t}{\varepsilon_0\varepsilon_r}\,\nabla\times\mathbf H^{n+1/2} \]<div class="eqnote">The leapfrog: H and E alternate in half time steps, with every curl taken as a central difference on the Yee grid.</div>`,
sym: [[String.raw`\(\varepsilon_r\)`, "relative permittivity of each cell, about 12.25 for GaAs (n = 3.5) and 1 for air"], [String.raw`\(\varepsilon_0, \mu_0\)`, "vacuum permittivity and permeability"], [String.raw`\(\Delta t\)`, "time step"], [String.raw`\(n\)`, "time index, so \\(n + 1/2\\) is half a step later"]],
how: [String.raw`Write the two curl equations and draw a line of cells along \(x\), with \(E_z\) on the whole points and \(H_y\) halfway between them.`, "Put a source that adds a short pulse to E at one cell.", String.raw`Half step: update every \(H_y\) from the difference of its two E neighbours, the curl of E.`, String.raw`Next half step: update every \(E_z\) from its two H neighbours, the curl of H, divided by \(\varepsilon_r\) of that cell.`, "Repeat thousands of times. The pulse travels, reflects at the GaAs slab, slows inside it, and leaves through the absorbing layers at both ends.", "Record the field at a monitor on every step. A Fourier transform at the end turns that one time record into the whole spectrum."],
say: "FDTD marches Maxwell's two curl equations forward in time on a staggered grid, updating H and E alternately from their neighbours. Because the source is a short pulse, one run contains the whole band, and a Fourier transform of the recorded fields gives every wavelength at once.",
num: String.raw`One run covers all 101 wavelengths of a band objective: 745 to 845 nm for the gratings, 735 to 835 nm for the PBS (Sec. 3.4).<br>Demo: normalized units, Courant number \(S = c\Delta t/\Delta x = 0.5\), 60 cells per vacuum wavelength, slab index set by the slider (3.5 for GaAs).`,
note: String.raw`<p><b>"How large can the time step be?"</b> (not in the thesis)</p><p>The explicit update is stable only if light cannot cross more than about one cell per step. This is the Courant limit, \(c\,\Delta t \le 1/\sqrt{1/\Delta x^2 + 1/\Delta y^2 + 1/\Delta z^2}\), which for cubic cells in 3D is \(\Delta t \le \Delta x/(c\sqrt 3)\). Tidy3D sets the time step from this limit with a safety factor (Courant factor 0.99 by default), so I only choose the grid. A finer grid therefore also means more time steps, and the cost of a 3D run grows roughly as the fourth power of the resolution.</p>`,
r(fig, ctl) {
  const N = 600, a = 330, b = 400, iS = 90, iT = 470, X = DQ4_map(0, N - 1, 40, 640);
  let sim, trace, lastT = 0, nslab = 3.5;
  const reset = () => { const eps = new Float64Array(N).fill(1); for (let i = a; i < b; i++) eps[i] = nslab * nslab; sim = DQ4_fdtd(N, eps, { L: 40, right: "pml", RL: 40, Rs: 0.6 }); trace = []; };
  reset();
  const CAP = ["Write Eq. (2.16) and draw the grid: E on whole cells (blue dots), H halfway between them (orange squares).",
    "A source adds a short pulse to E at one cell. It starts to travel in both directions.",
    "First half step: each H takes the difference of its two E neighbours. That difference is the curl of E in 1D.",
    "Second half step: each E takes the difference of its two H neighbours, divided by the permittivity of its cell.",
    "Repeat. The pulse reflects at the slab, is squeezed and slowed inside it (speed c/n), and leaks out in echoes. No physics is programmed in beyond the two updates.",
    "A monitor records E on every step (bottom). Its Fourier transform gives the transmission at every frequency in the pulse, from this one run."];
  DQ4_board(fig, ctl, { h: 350, cap: CAP, live: true,
    sl: [["q41n", "Slab index n", 1, 3.6, 0.1, 3.5, x => x.toFixed(1)]],
    onInput: v => { nslab = v.q41n; reset(); },
    onStep: k => { if (k === 2) reset(); },
    draw: (k, v, t) => {
      const K = DQ4_K; let s = "";
      // zoom of the staggered grid
      s += DQ4_T(20, 22, "zoom: four cells of the grid", { fs: 12, c: K.mute });
      const zx = i => 150 + i * 90, zy = 60;
      s += DQ4_L(110, zy, 560, zy, K.ink, 1.2);
      for (let i = 0; i < 5; i++) { const hiE = k === 4; s += DQ4_dot(zx(i), zy, hiE ? 7 : 5.5, K.blue, hiE ? K.blue : "#fff") + DQ4_T(zx(i), zy + 22, `E${DQ4_sub("z")} (${["i−2", "i−1", "i", "i+1", "i+2"][i]})`, { fs: 11, a: "middle", c: K.blue }); }
      for (let i = 0; i < 4; i++) { const hiH = k === 3, x = zx(i) + 45; s += `<rect x="${x - (hiH ? 7 : 5.5)}" y="${zy - (hiH ? 7 : 5.5)}" width="${hiH ? 14 : 11}" height="${hiH ? 14 : 11}" fill="${hiH ? K.orange : "#fff"}" stroke="${K.orange}" stroke-width="1.5"/>` + DQ4_T(x, zy - 14, `H${DQ4_sub("y")}`, { fs: 11, a: "middle", c: K.orange }); }
      if (k === 3) s += `<path d="M${zx(2)} ${zy - 8} Q${zx(2) + 22} ${zy - 34} ${zx(2) + 40} ${zy - 12}" fill="none" stroke="${K.orange}" stroke-width="1.6" marker-end="url(#ar)"/><path d="M${zx(3)} ${zy - 8} Q${zx(3) - 22} ${zy - 34} ${zx(3) - 40} ${zy - 12}" fill="none" stroke="${K.orange}" stroke-width="1.6" marker-end="url(#ar)"/>` + DQ4_T(600, zy + 4, "H from ΔE", { fs: 12, c: K.orange, a: "middle" });
      if (k === 4) s += `<path d="M${zx(2) - 45} ${zy + 8} Q${zx(2) - 22} ${zy + 32} ${zx(2) - 6} ${zy + 10}" fill="none" stroke="${K.blue}" stroke-width="1.6" marker-end="url(#ar)"/><path d="M${zx(2) + 45} ${zy + 8} Q${zx(2) + 22} ${zy + 32} ${zx(2) + 6} ${zy + 10}" fill="none" stroke="${K.blue}" stroke-width="1.6" marker-end="url(#ar)"/>` + DQ4_T(600, zy + 4, "E from ΔH / ε", { fs: 12, c: K.blue, a: "middle" });
      // field along x
      const y0 = 118, h = 110, Y = DQ4_map(-1.15, 1.15, y0 + h, y0);
      s += DQ4_R(X(a), y0, X(b) - X(a), h, K.gaas) + DQ4_T((X(a) + X(b)) / 2, y0 + h + 14, `slab, n = ${nslab.toFixed(1)}`, { fs: 11, a: "middle", c: K.mute });
      s += DQ4_R(40, y0, X(40) - 40, h, K.pml) + DQ4_R(X(N - 40), y0, 640 - X(N - 40), h, K.pml) + DQ4_T(42, y0 + h + 14, "absorbing", { fs: 11, c: K.mute }) + DQ4_T(638, y0 + h + 14, "absorbing", { fs: 11, c: K.mute, a: "end" });
      s += DQ4_L(40, Y(0), 640, Y(0), "#b8c0cc", 0.8);
      if (k >= 2) {
        if (t - lastT < 0 || t < lastT) lastT = t;
        const nst = Math.min(12, Math.round((t - lastT) * 360)); lastT = t;
        for (let q = 0; q < nst; q++) { sim.step([iS, DQ4_pulse(sim.t, 120, 55, 170)]); trace.push(sim.ez[iT]); }
        if (sim.t > 2600) reset();
        const xs = range(0, N - 1, N);
        s += DQ4_pl(X, Y, xs, Array.from(sim.ez), K.blue, 1.8);
        s += DQ4_L(X(iS), y0 - 4, X(iS), y0 + h, K.amber, 1.4, "4 3") + DQ4_T(X(iS), y0 - 8, "source", { fs: 11, a: "middle", c: K.amber });
      }
      if (k >= 6) s += DQ4_L(X(iT), y0 - 4, X(iT), y0 + h, K.teal, 1.4, "4 3") + DQ4_T(X(iT), y0 - 8, "monitor", { fs: 11, a: "middle", c: K.teal });
      // monitor trace
      if (k >= 6) {
        const ty = 262, th = 70, TX = DQ4_map(0, 2600, 60, 640), TY = DQ4_map(-1.15, 1.15, ty + th, ty);
        s += DQ4_ax(60, ty, 590, th, "time step", "E at the monitor");
        const xs = trace.map((_, i) => i);
        s += DQ4_pl(TX, TY, xs, trace, K.teal, 1.4);
      } else s += DQ4_T(340, 300, k >= 2 ? `time step ${sim.t}` : "", { fs: 12, a: "middle", c: K.mute });
      return s;
    },
    ro: () => [["time step", String(sim.t)], ["cells", String(N)], ["Courant number S", "0.5"]]
  });
}},

/* ---------------- Q4.2 ---------------- */
{s: "Q4.2", t: "Why is the Yee grid staggered?",
intu: String.raw`Because a curl needs the field around a loop. In the Yee cell each electric component sits at the centre of a loop of four magnetic components, and each magnetic component at the centre of a loop of four electric ones (Sec. 2.6, Fig. 2.7). Every derivative in Eq. (2.16) then becomes a central difference between two neighbours half a cell away, which is second-order accurate, and E and H are updated in alternating half time steps. If all components sat at the same points, the derivatives would need one-sided differences, which are only first-order accurate and give the slope at the wrong place.`,
eq: String.raw`\[ \frac{\partial E_z}{\partial t} = \frac{1}{\varepsilon_0\varepsilon_r}\frac{\partial H_y}{\partial x}, \qquad \frac{\partial H_y}{\partial t} = \frac{1}{\mu_0}\frac{\partial E_z}{\partial x} \]<div class="eqnote">Eq. (2.16) for a wave along x with \(E_z\) and \(H_y\) only.</div>\[ \frac{\partial E_z}{\partial x}\bigg|_{i+1/2} \approx \frac{E_z|_{i+1} - E_z|_{i}}{\Delta x}, \qquad \text{relative error} \approx \frac{(k\Delta x)^2}{24} \]<div class="eqref">Ch. 2 Sec. 2.6 and Fig. 2.7, Taflove and Hagness 2016, Sec. 5</div>`,
sym: [[String.raw`\(E_z|_i\)`, "electric field at whole grid point i"], [String.raw`\(H_y|_{i+1/2}\)`, "magnetic field halfway between points i and i + 1"], [String.raw`\(\Delta x\)`, "cell size"], [String.raw`\(k\)`, "wavenumber in the material, \\(2\\pi n/\\lambda_0\\)"]],
how: [String.raw`Draw a line along \(x\) with \(E_z\) at the whole points \(i-1, i, i+1\).`, String.raw`Put \(H_y\) halfway between them, at \(i \pm 1/2\). This is the 1D version of the Yee cell.`, String.raw`Draw a wave and the chord between \(E_z|_i\) and \(E_z|_{i+1}\). Its slope matches the tangent at \(i + 1/2\), exactly where \(H_y\) lives. Read at \(i\) instead, the same chord is off by half a cell.`, String.raw`Draw the time ladder: H at \(n - 1/2\) and \(n + 1/2\), E at \(n\) and \(n + 1\). Each update uses only values from the half step before, so the scheme is explicit.`, String.raw`In 2D or 3D, draw \(E_z\) at the centre of a square of four H arrows. The circulation of H around the square is the curl that updates \(E_z\).`],
say: "The staggering puts every component at the centre of a loop of the other field, so each curl is a central difference that is second-order accurate, and E and H leapfrog each other in time.",
num: String.raw`Central difference error \((k\Delta x)^2/24\): <b>0.41 %</b> at 20 steps per wavelength, <b>0.18 %</b> at 30.<br>One-sided difference: error about \(k\Delta x/2\), <b>16 %</b> at 20 steps.`,
note: String.raw`<p><b>"What else does the staggering buy you?"</b></p><p>On the Yee grid the discrete divergence of a discrete curl is exactly zero. Without charges, the fields therefore stay divergence free to machine precision with no extra condition. And since the normal and tangential components of a cell face sit at different points, the interface conditions of Chapter 2 (tangential E and normal D continuous) come out naturally at interfaces aligned with the grid.</p>`,
r(fig, ctl) {
  const CAP = ["Draw E_z at the whole points i − 1, i, i + 1 (blue dots).",
    "Put H_y halfway between them (orange squares). Each field sits between two of the other.",
    v => `The chord between two E samples (blue) is parallel to the true tangent at the midpoint, where H sits (green). The same chord read at i (dashed) is off. With ${v.q42N} steps per wavelength the errors are in the readout.`,
    "The time ladder: H at n − ½ uses E at n − 1, E at n uses H at n − ½, and so on. Every update only needs the half step before.",
    "In 2D and 3D: E_z sits at the centre of a loop of four H arrows. Going around the loop is the curl."];
  DQ4_board(fig, ctl, { h: 360, cap: CAP,
    sl: [["q42N", "Steps per wavelength", 4, 40, 1, 8, x => x.toFixed(0)]],
    draw: (k, v) => {
      const K = DQ4_K, Nl = v.q42N; let s = "";
      // wave across the top: one wavelength = 560 px
      const lam = 560, X = x => 60 + x, y0 = 100, A = 55, f = x => A * Math.sin(2 * Math.PI * x / lam + 0.5);
      if (k >= 3) { const xs = range(0, 560, 200); s += DQ4_pl(X, y => y0 - y, xs, xs.map(f), "#9aa4b2", 1.6); }
      s += DQ4_L(50, y0, 630, y0, K.ink, 1);
      const dx = lam / Nl, ic = Math.floor(Nl / 2) - 1, xi = ic * dx, xj = xi + dx;
      for (let i = 0; i * dx <= 560.01; i++) { const x = i * dx, yy = k >= 3 ? y0 - f(x) : y0; s += DQ4_dot(X(x), yy, 4.5, K.blue, "#fff"); }
      if (k >= 2) for (let i = 0; (i + 0.5) * dx <= 560; i++) { const x = (i + 0.5) * dx; s += `<rect x="${X(x) - 4}" y="${y0 - 4}" width="8" height="8" fill="#fff" stroke="${K.orange}" stroke-width="1.4"/>`; }
      s += DQ4_T(X(xi), y0 + 40, "i", { a: "middle", c: K.blue, fs: 12 }) + DQ4_T(X(xj), y0 + 40, "i+1", { a: "middle", c: K.blue, fs: 12 }) + DQ4_T(X(xi - dx), y0 + 40, "i−1", { a: "middle", c: K.blue, fs: 12 });
      if (k >= 2) s += DQ4_T(X(xi + dx / 2), y0 + 56, "i+½", { a: "middle", c: K.orange, fs: 12 });
      if (k >= 3) {
        const fi = f(xi), fj = f(xj), sl = (fj - fi) / dx, xm = xi + dx / 2, tm = 2 * Math.PI / lam * A * Math.cos(2 * Math.PI * xm / lam + 0.5), ti = 2 * Math.PI / lam * A * Math.cos(2 * Math.PI * xi / lam + 0.5);
        const L2 = 70;
        s += DQ4_L(X(xi), y0 - fi, X(xj), y0 - fj, K.blue, 2.4);
        s += DQ4_L(X(xm - L2), y0 - (f(xm) - tm * L2), X(xm + L2), y0 - (f(xm) + tm * L2), K.teal, 1.8);
        s += DQ4_L(X(xi - L2), y0 - (fi - ti * L2), X(xi + L2), y0 - (fi + ti * L2), K.mute, 1.4, "5 4");
        s += DQ4_T(X(xm) + 6, y0 - f(xm) - 12, "tangent at i+½", { fs: 11, c: K.teal });
        s += DQ4_T(20, 26, `chord slope ${(sl).toFixed(3)}  ·  tangent at i+½ ${tm.toFixed(3)}  ·  tangent at i ${ti.toFixed(3)}`, { fs: 12, c: K.mute });
      }
      // time ladder
      if (k >= 4) {
        const lx = 70, ly = 330, rows = [["E", "n−1", K.blue], ["H", "n−½", K.orange], ["E", "n", K.blue], ["H", "n+½", K.orange], ["E", "n+1", K.blue]];
        s += DQ4_T(40, 190, "time", { fs: 12, c: K.mute }) + DQ4_A(50, 340, 50, 196, K.ink, 1.2);
        rows.forEach(([F, lab, c], j) => { const y = ly - j * 32; s += DQ4_T(lx, y + 4, `${F}${DQ4_sub(lab)}`, { fs: 13, c }); for (let q = 0; q < 4; q++) { const x = 130 + q * 40 + (F === "H" ? 20 : 0); s += F === "E" ? DQ4_dot(x, y, 4.5, c, "#fff") : `<rect x="${x - 4}" y="${y - 4}" width="8" height="8" fill="#fff" stroke="${c}" stroke-width="1.4"/>`; } });
        for (let j = 0; j < 4; j++) { const y = ly - j * 32, x = 150 + 40 + (j % 2 ? 0 : 20); s += DQ4_A(x - (j % 2 ? 0 : 20), y - 5, x - (j % 2 ? -20 : 0), y - 27, rows[j + 1][2], 1.3); }
      }
      // 2D loop
      if (k >= 5) {
        const cx = 500, cy = 268, r = 46;
        s += DQ4_R(cx - r, cy - r, 2 * r, 2 * r, "none", "#9aa4b2");
        s += DQ4_dot(cx, cy, 6, K.blue) + DQ4_T(cx + 10, cy + 18, `E${DQ4_sub("z")}`, { c: K.blue });
        s += DQ4_A(cx - 14, cy + r, cx + 14, cy + r, K.orange, 2) + DQ4_A(cx + r, cy + 14, cx + r, cy - 14, K.orange, 2) + DQ4_A(cx + 14, cy - r, cx - 14, cy - r, K.orange, 2) + DQ4_A(cx - r, cy - 14, cx - r, cy + 14, K.orange, 2);
        s += DQ4_T(cx + r + 8, cy + 4, `H${DQ4_sub("y")}`, { c: K.orange, fs: 12 }) + DQ4_T(cx - 6, cy - r - 8, `H${DQ4_sub("x")}`, { c: K.orange, fs: 12, a: "middle" });
        s += DQ4_T(cx, cy + r + 26, "circulation of H = curl → updates E", { fs: 12, a: "middle", c: K.mute });
      }
      return s;
    },
    ro: v => { const u = Math.PI / v.q42N; const c = 1 - Math.sin(u) / u, kd = 2 * u, fo = Math.hypot(Math.cos(kd) - 1, Math.sin(kd)) / kd, f1 = Math.hypot((Math.sin(kd)) / kd - 1, (1 - Math.cos(kd)) / kd); return [["cell Δx", `λ/${v.q42N}`], ["central difference error", DQ4_pct(c)], ["one-sided difference error", DQ4_pct(f1)]]; }
  });
}},

/* ---------------- Q4.3 ---------------- */
{s: "Q4.3", t: "How do you get a whole spectrum from one run?",
intu: String.raw`Launch a short pulse. A pulse of duration \(\tau\) has a spectrum about \(1/\tau\) wide, so a pulse a few optical cycles long covers the whole band around 795 nm. While the simulation runs, each monitor accumulates the Fourier transform of the field at every wanted frequency. Dividing by the spectrum of the source gives the response at each frequency, and Tidy3D does this for you by normalizing the sources to inject 1 W at each frequency (Sec. 3.4). The run must last until the fields have decayed, otherwise the transform is cut off.`,
eq: String.raw`\[ \tilde{\mathbf E}(\mathbf r, f) = \sum_{n} \mathbf E(\mathbf r, n\Delta t)\, e^{\,i2\pi f n\Delta t}\,\Delta t \]\[ T(f) = \frac{|\tilde E_{\mathrm{out}}(f)|^2}{|\tilde E_{\mathrm{src}}(f)|^2}, \qquad \Delta f\,\tau \approx 0.44 \]<div class="eqnote">\(\tau\) and \(\Delta f\) are the full widths at half maximum of a Gaussian pulse in time and in frequency.</div><div class="eqref">Ch. 2 Sec. 2.6, Ch. 3 Sec. 3.4 (1 W normalization)</div>`,
sym: [[String.raw`\(\tilde{\mathbf E}(\mathbf r, f)\)`, "field at frequency f, built up step by step during the run"], [String.raw`\(\tilde E_{\mathrm{src}}\)`, "spectrum of the source pulse"], [String.raw`\(\tau\)`, "pulse duration"], [String.raw`\(\Delta f\)`, "spectral width of the pulse"]],
how: ["Draw the source pulse in time: a few optical cycles under a Gaussian envelope.", "Draw its spectrum next to it: a broad bump centred on the design wavelength. The shorter the pulse, the wider the bump.", "The pulse runs through the device. Draw what the output monitor records: the delayed pulse plus weaker echoes from internal reflections.", "Fourier transform the record: the output spectrum carries the fingerprint of the device, here Fabry-Perot fringes.", String.raw`Divide the output spectrum by the source spectrum: \(T(\lambda)\) at every one of the 101 band wavelengths, all from one run.`],
say: "A short pulse is broadband, so one run excites every wavelength of the band at once. The monitors Fourier transform the fields during the run, and dividing by the source spectrum gives the transmission at each wavelength.",
num: String.raw`\(\Delta f\,\tau \approx 0.44\). At 800 nm a 5 fs pulse spans about <b>190 nm</b>, a 20 fs pulse only about <b>47 nm</b>.<br>Demo: a 1 µm GaAs slab (n = 3.5) in air at normal incidence, fringe spacing \(\lambda_0^2/(2nd) \approx 91\) nm.`,
note: String.raw`<p><b>"How long must the simulation run?"</b></p><p>Until the fields in the domain have decayed. Tidy3D stops early when the energy has fallen below a shutoff fraction (\(10^{-5}\) of its peak by default). Stopping too soon truncates the transform and gives ripples and wrong values. The frequency resolution is about one over the run time, and a high-Q resonance rings for a long time, so resonant devices need long runs.</p>`,
r(fig, ctl) {
  const c = 299792.458, f0 = c / 800, n = 3.5, d = 1000, r = (n - 1) / (n + 1);
  // transmission of a slab (amplitude), phase convention exp(-i w t): t = (1 - r^2) e^{i delta} / (1 - r^2 e^{2 i delta})
  const tslab = f => { const del = 2 * Math.PI * f * 1e12 * n * d * 1e-9 / 2.99792458e8, cr = Math.cos(del), sr = Math.sin(del), c2 = Math.cos(2 * del), s2 = Math.sin(2 * del), R2 = r * r; const nr = (1 - R2) * cr, ni = (1 - R2) * sr, dr = 1 - R2 * c2, di = -R2 * s2, m = dr * dr + di * di; return [(nr * dr + ni * di) / m, (ni * dr - nr * di) / m]; };
  const fs = range(150, 650, 560), df = fs[1] - fs[0], ts = range(0, 150, 300), t0 = 30;
  let dat = null;
  const comp = tau => {
    const Df = 441 / tau, S = fs.map(f => Math.exp(-2 * Math.LN2 * Math.pow((f - f0) / Df, 2)));
    const T = fs.map(f => tslab(f));
    const src = ts.map(t => { let s = 0; fs.forEach((f, i) => s += S[i] * Math.cos(2 * Math.PI * f * (t - t0) / 1000)); return s; });
    const out = ts.map(t => { let s = 0; fs.forEach((f, i) => { const ph = -2 * Math.PI * f * (t - t0) / 1000; s += S[i] * (T[i][0] * Math.cos(ph) - T[i][1] * Math.sin(ph)); }); return s; });
    const m = Math.max(...src.map(Math.abs));
    const rng = C3.rng(5), noise = 2e-3;
    const lam = fs.map(f => c / f), S2 = S.map(v => v * v), O2 = S.map((v, i) => v * v * (T[i][0] ** 2 + T[i][1] ** 2));
    const meas = S.map((v, i) => { const re = v * T[i][0] + noise * (rng() - 0.5), im = v * T[i][1] + noise * (rng() - 0.5); return (re * re + im * im) / (v * v); });
    dat = { src: src.map(x => x / m), out: out.map(x => x / m), lam, S2, O2, Tex: T.map(z => z[0] ** 2 + z[1] ** 2), meas, Df };
  };
  const CAP = [v => `The source: a Gaussian pulse of ${v.q43t} fs, a few optical cycles at 800 nm.`,
    "Its spectrum (blue): a bump around 800 nm. The shaded strip is the 745 to 845 nm band. Shorten the pulse and the bump widens.",
    "The output monitor records the delayed pulse and weaker echoes, each one a round trip inside the 1 µm slab.",
    "The output spectrum (orange) is the source spectrum times the slab's Fabry-Perot response.",
    "Output divided by source: T(λ) at 101 wavelengths in the band (dots). Where the source is too weak, numerical noise divided by a tiny number spoils the dots (red). That is why the pulse must cover the band."];
  DQ4_board(fig, ctl, { h: 370, cap: CAP,
    sl: [["q43t", "Pulse duration τ (fs)", 3, 30, 1, 6, x => x.toFixed(0) + " fs"]],
    onInput: v => comp(v.q43t), init: v => comp(v.q43t),
    draw: (k) => {
      const K = DQ4_K; let s = "";
      // A: source in time
      const ax = 50, ay = 30, aw = 260, ah = 110, TX = DQ4_map(0, 150, ax, ax + aw), TY = DQ4_map(-1.1, 1.1, ay + ah, ay);
      s += DQ4_ax(ax, ay, aw, ah, "t (fs)", "source E(t)") + DQ4_pl(TX, TY, ts, dat.src, K.blue, 1.4);
      // B: spectra
      const bx = 380, by = 30, bw = 260, bh = 110, LX = DQ4_map(650, 950, bx, bx + bw), LY = DQ4_map(0, 1.08, by + bh, by);
      if (k >= 2) {
        s += DQ4_R(LX(745), by, LX(845) - LX(745), bh, "#eef4fb") + DQ4_ax(bx, by, bw, bh, "λ (nm)", "|spectrum|²");
        [700, 800].forEach(l => s += DQ4_T(LX(l), by + bh + 14, l, { fs: 10, a: "middle", c: K.mute }));
        const cl = a => a.map((y, i) => dat.lam[i] >= 650 && dat.lam[i] <= 950 ? y : NaN);
        s += DQ4_pl(LX, LY, dat.lam, cl(dat.S2), K.blue, 2);
        if (k >= 4) s += DQ4_pl(LX, LY, dat.lam, cl(dat.O2), K.orange, 1.8);
      }
      // C: output in time
      const cy = 210;
      if (k >= 3) { const OY = DQ4_map(-1.1, 1.1, cy + ah, cy); s += DQ4_ax(ax, cy, aw, ah, "t (fs)", "output E(t)") + DQ4_pl(TX, OY, ts, dat.out, K.orange, 1.4); }
      // D: T
      if (k >= 5) {
        const DY = DQ4_map(0, 1.1, cy + bh, cy);
        s += DQ4_R(LX(745), cy, LX(845) - LX(745), bh, "#eef4fb") + DQ4_ax(bx, cy, bw, bh, "λ (nm)", "T = out / source");
        [700, 800].forEach(l => s += DQ4_T(LX(l), cy + bh + 14, l, { fs: 10, a: "middle", c: K.mute }));
        s += DQ4_pl(LX, DY, dat.lam, dat.Tex.map((y, i) => dat.lam[i] >= 650 && dat.lam[i] <= 950 ? y : NaN), "#b8c0cc", 1.2);
        for (let j = 0; j < 101; j++) { const l = 745 + j, i = dat.lam.reduce((bi, x, ii) => Math.abs(x - l) < Math.abs(dat.lam[bi] - l) ? ii : bi, 0); const bad = Math.abs(dat.meas[i] - dat.Tex[i]) > 0.05; s += DQ4_dot(LX(l), DY(Math.min(1.1, dat.meas[i])), 1.8, bad ? K.red : K.teal); }
      }
      if (k >= 2) s += DQ4_A(318, 85, 372, 85, K.mute, 1.4) + DQ4_T(345, 78, "FT", { fs: 11, a: "middle", c: K.mute });
      if (k >= 4) s += DQ4_A(318, 265, 372, 265, K.mute, 1.4) + DQ4_T(345, 258, "FT, ÷", { fs: 11, a: "middle", c: K.mute });
      return s;
    },
    ro: v => { const dl = 800 * dat.Df / f0; let ok = 0; for (let j = 0; j < 101; j++) { const l = 745 + j, i = dat.lam.reduce((bi, x, ii) => Math.abs(x - l) < Math.abs(dat.lam[bi] - l) ? ii : bi, 0); if (Math.abs(dat.meas[i] - dat.Tex[i]) <= 0.05) ok++; } return [["spectral width (FWHM)", dl.toFixed(0) + " nm"], ["good points in the band", ok + " of 101"]]; }
  });
}},

/* ---------------- Q4.4 ---------------- */
{s: "Q4.4", t: "What is a PML, and why not just end the domain with a hard wall?",
intu: String.raw`The real device sits in open space, so light that leaves must never come back. A hard wall such as a perfect electric conductor reflects everything, and the echo returns into the device and spoils the result. A plain absorbing layer is not enough either: the jump in impedance at its surface reflects part of the wave before it is absorbed. A perfectly matched layer is an absorber whose electric and magnetic losses are matched, so its impedance equals that of the medium next to it. Light enters without reflection and decays inside, so the finite domain behaves like open space (Sec. 2.6). The waveguides run straight into the PML, so guided light also leaves without coming back (Sec. 3.6).`,
eq: String.raw`\[ \frac{\sigma_m}{\mu_0} = \frac{\sigma}{\varepsilon_0} \quad\Rightarrow\quad \eta = \eta_0, \qquad E \propto e^{-\sigma x/(\varepsilon_0 c)} \]\[ \sigma(x) = \sigma_{\max}\left(\frac{x}{d}\right)^{m}, \qquad R \approx \exp\!\left(-\frac{2\,\sigma_{\max}\, d}{(m+1)\,\varepsilon_0 c}\right) \]<div class="eqref">Taflove and Hagness 2016, Sec. 13 (cited in Ch. 2 Sec. 2.6). Matched layer at normal incidence.</div>`,
sym: [[String.raw`\(\sigma, \sigma_m\)`, "electric and magnetic conductivity of the layer"], [String.raw`\(\eta, \eta_0\)`, "wave impedance in the layer and in free space (377 ohm)"], [String.raw`\(d, m\)`, "layer thickness and grading order (about 3)"], [String.raw`\(R\)`, "power reflected after the round trip through the layer"]],
how: ["Draw the domain with the source on the left and a monitor between the source and the right end. The pulse heads right.", "End the domain with a hard wall (PEC). The whole pulse comes back with its sign flipped and passes the monitor again.", "Replace the wall by a layer with electric loss only. The wave is absorbed inside, but the impedance jump at its face still reflects part of it.", String.raw`Use a matched, graded layer: \(\sigma_m/\mu_0 = \sigma/\varepsilon_0\), with \(\sigma\) rising smoothly from zero. The impedance never jumps, so almost nothing comes back.`, String.raw`Write why: matching keeps \(\eta = \eta_0\) inside the layer, and the wave decays as \(e^{-\sigma x/(\varepsilon_0 c)}\). The grading only fights the small error that the grid adds.`, "Sketch the real simulation: PML on all sides and the waveguides running straight into it, so guided light leaves the domain too."],
say: "A PML is an absorber with matched electric and magnetic losses, so its impedance equals that of the neighbouring medium. Light enters it without reflection and dies inside, while a hard wall would send everything back and a plain absorber would still reflect at its surface.",
num: String.raw`PEC wall: <b>100 %</b> reflected. Matched layer with cubic grading (m = 3): \(R \approx \exp[-\sigma_{\max}d/(2\varepsilon_0 c)]\) in the continuum, limited on a grid by the discretization. The demo reads R off the monitor.`,
note: String.raw`<p><b>"Why does a PML still reflect a little in practice?"</b></p><p>On the grid the conductivity changes over a finite number of cells, so the discretized layer is not perfectly matched. Waves at grazing angles and evanescent fields also decay slowly in it. That is why a PML is graded over several cells (Tidy3D uses 12 layers by default) and kept some distance from the device, and why structures such as the waveguides must pass straight through it instead of ending at its face.</p>`,
r(fig, ctl) {
  const N = 400, iS = 100, iP = 150, X = DQ4_map(0, N - 1, 40, 640);
  const cfg = k => k <= 1 ? "pml" : k === 2 ? "pec" : k === 3 ? "lossy" : "pml";
  let sim = null, lastT = 0, cur = "", Rres = {};
  const mk = (mode, v) => DQ4_fdtd(N, new Float64Array(N).fill(1), { L: 30, right: mode, RL: v.q44d, Rs: v.q44s });
  const measure = v => { Rres = {}; for (const m of ["pec", "lossy", "pml"]) { const s = mk(m, v); let inc = 0, ref = 0; for (let t = 0; t < 1500; t++) { s.step([iS, DQ4_pulse(t, 60, 40, 150)]); const e = s.ez[iP] * s.ez[iP]; if (t < 560) inc += e; else ref += e; } Rres[m] = ref / inc; } };
  const reset = (k, v) => { cur = cfg(k); sim = mk(cur, v); };
  const CAP = ["The domain: a source on the left and a monitor (green) just to its right. The pulse heads right. Ideally it should leave forever.",
    v => `A hard wall (PEC): everything comes back, flipped in sign. Reflected power R = ${DQ4_pct(Rres.pec)}.`,
    v => `A layer with electric loss only: the wave dies inside, but the impedance jump at the face reflects R = ${DQ4_pct(Rres.lossy)}. Try a weaker loss: less reflection, but then the wave is not absorbed.`,
    v => `A graded, matched layer: R = ${Rres.pml.toExponential(1)}. The matched losses keep the impedance equal to free space, so there is no face to reflect from.`,
    "Why it works: σ_m/μ0 = σ/ε0 keeps η = η0 at every point of the layer, and the wave decays as exp(−σx/ε0c). Grading σ smoothly only reduces the error the grid adds.",
    "In the real 3D run the PML wraps the whole domain, and the input and output waveguides run straight through it, so guided light leaves without being reflected back."];
  DQ4_board(fig, ctl, { h: 360, cap: CAP, live: true,
    sl: [["q44d", "Layer thickness (cells)", 4, 40, 1, 20, x => x.toFixed(0)], ["q44s", "Loss strength", 0.05, 1.2, 0.05, 0.6, x => x.toFixed(2)]],
    init: v => { measure(v); reset(1, v); },
    onInput: (v) => { measure(v); sim = mk(cur, v); },
    onStep: (k, v) => reset(k, v),
    draw: (k, v, t) => {
      const K = DQ4_K; let s = "";
      if (cfg(k) !== cur) reset(k, v);
      const y0 = 36, h = 150, Y = DQ4_map(-1.2, 1.2, y0 + h, y0), R0 = N - v.q44d;
      const nst = Math.min(14, Math.round((t - lastT) * 400)); lastT = t;
      for (let q = 0; q < Math.max(0, nst); q++) { sim.step([iS, DQ4_pulse(sim.t, 60, 40, 150)]); }
      if (sim.t > 1500) sim = mk(cur, v);
      s += DQ4_R(40, y0, X(30) - 40, h, K.pml) + DQ4_T(44, y0 + h + 14, "PML", { fs: 11, c: K.mute });
      const mode = cfg(k);
      if (mode === "pec") s += DQ4_R(X(N - 1) - 2, y0, 6, h, K.ink) + DQ4_T(632, y0 + h + 14, "PEC wall", { fs: 11, c: K.ink, a: "end" });
      else if (mode === "lossy") s += DQ4_R(X(R0), y0, 640 - X(R0), h, "#f3d9cf") + DQ4_T(636, y0 + h + 14, "electric loss only", { fs: 11, c: K.orange, a: "end" });
      else if (k >= 4) { for (let i = 0; i < 12; i++) { const xa = X(R0 + i * v.q44d / 12); s += DQ4_R(xa, y0, (640 - X(R0)) / 12 + 0.5, h, K.purple, null, 0.04 + 0.5 * Math.pow((i + 1) / 12, 3)); } s += DQ4_T(636, y0 + h + 14, "graded matched PML", { fs: 11, c: K.purple, a: "end" }); }
      else s += DQ4_T(636, y0 + h + 14, "(open space wanted)", { fs: 11, c: K.mute, a: "end" });
      s += DQ4_L(40, Y(0), 640, Y(0), "#b8c0cc", 0.8);
      s += DQ4_pl(X, Y, range(0, N - 1, N), Array.from(sim.ez), K.blue, 1.8);
      s += DQ4_L(X(iS), y0 - 2, X(iS), y0 + h, K.amber, 1.3, "4 3") + DQ4_T(X(iS), y0 - 6, "source", { fs: 11, a: "middle", c: K.amber });
      s += DQ4_L(X(iP), y0 - 2, X(iP), y0 + h, K.teal, 1.3, "4 3") + DQ4_T(X(iP) + 4, y0 - 6, "monitor", { fs: 11, c: K.teal });
      // bar of reflections
      if (k >= 2 && k <= 4) {
        const bx = 60, by = 244, BW = 360;
        [["PEC wall", "pec", K.ink], ["electric loss", "lossy", K.orange], ["matched PML", "pml", K.purple]].forEach(([lab, m, c], j) => {
          if ((m === "lossy" && k < 3) || (m === "pml" && k < 4)) return;
          const y = by + j * 34, w = Math.max(1, BW * Rres[m]);
          s += DQ4_T(bx, y + 13, lab, { fs: 12 }) + DQ4_R(bx + 110, y, w, 18, c, null, 0.75) + DQ4_T(bx + 118 + w, y + 13, m === "pml" ? Rres[m].toExponential(1) : DQ4_pct(Rres[m]), { fs: 12, c });
        });
        s += DQ4_T(bx, by - 10, "reflected power R measured at the monitor", { fs: 12, c: K.mute });
      }
      if (k === 5) {
        s += DQ4_T(70, 236, "matched:  σ" + DQ4_sub("m") + "/μ" + DQ4_sub("0") + " = σ/ε" + DQ4_sub("0") + "   →   η = η" + DQ4_sub("0") + "  (no impedance step)", { fs: 15 });
        s += DQ4_T(70, 270, "inside:  E ∝ exp(−σx / ε" + DQ4_sub("0") + "c)   decays at every frequency", { fs: 15 });
        s += DQ4_T(70, 304, "graded:  σ = σ" + DQ4_sub("max") + " (x/d)³   so the grid sees no sudden change", { fs: 15 });
      }
      if (k >= 6) {
        const bx = 150, by = 210, bw = 380, bh = 130, p = 18;
        s += DQ4_R(bx, by, bw, bh, K.pml, K.purple) + DQ4_R(bx + p, by + p, bw - 2 * p, bh - 2 * p, "#fff", "#b9b2e8");
        s += DQ4_R(bx, by + bh / 2 - 6, bw, 12, K.gaas, K.blue) + DQ4_R(bx + 150, by + 34, 80, 62, K.gaas, K.blue);
        s += DQ4_T(bx + bw / 2, by + bh + 16, "top view: the waveguide runs through the PML at both ends", { fs: 12, a: "middle", c: K.mute });
        s += DQ4_T(bx + 4, by + 12, "PML", { fs: 11, c: K.purple });
      }
      return s;
    },
    ro: () => [["PEC wall", DQ4_pct(Rres.pec)], ["electric loss only", DQ4_pct(Rres.lossy)], ["graded matched PML", Rres.pml.toExponential(1)]]
  });
}},

/* ---------------- Q4.5 ---------------- */
{s: "Q4.5", t: "How do you know the grid is fine enough, and why quote steps per wavelength in GaAs?",
intu: String.raw`The grid has to describe both the wave and the geometry (Sec. 2.6). The wavelength is shortest in the highest-index material, \(\lambda_0/n\), about 229 nm in GaAs at 800 nm, so a grid that resolves GaAs resolves every other material too. Tidy3D builds a non-uniform grid from a set number of steps per wavelength in each material, with larger cells in air, and the thesis quotes the GaAs value (Sec. 3.6). At 20 steps the GaAs cell is about 11.4 nm, at 30 steps about 7.6 nm. A grid is fine enough when a finer one no longer changes the answer, which is why the PBS, optimized at 20, is evaluated at 30.`,
eq: String.raw`\[ \Delta x = \frac{\lambda_0}{N_\lambda\, n_{\mathrm{GaAs}}} \]\[ \frac{\Delta v}{v} \approx \frac{(k\Delta x)^2}{24} = \frac{\pi^2}{6N_\lambda^2} \]<div class="eqref">Sec. 3.6: nominal GaAs cell \(\lambda_0/(20\,n_{\mathrm{GaAs}}) = 11.38\) nm. Error estimate of the central difference, spatial part only.</div>`,
sym: [[String.raw`\(N_\lambda\)`, "steps per wavelength in GaAs (30 for 2D gratings, 20 for 3D)"], [String.raw`\(\Delta x\)`, "cell size in GaAs"], [String.raw`\(\Delta v/v\)`, "relative error of the phase velocity on the grid"]],
how: ["Draw one wave in air and the same frequency in GaAs: its wavelength is n = 3.5 times shorter.", String.raw`Lay the grid over the GaAs wave. \(N_\lambda\) samples per GaAs wavelength sets \(\Delta x\).`, String.raw`The same cell in air gives \(3.5\,N_\lambda\) samples per wavelength, more than needed, so Tidy3D uses larger cells there. Quoting the GaAs value names the worst case.`, String.raw`Numerical dispersion: waves on the grid travel slightly too slowly. Plot the phase error over ten GaAs wavelengths against \(N_\lambda\). It falls as \(1/N_\lambda^2\).`, "Geometry: count the cells across the smallest features, the 80 nm grating gap and the 120 nm PBS rule.", "Convergence: repeat on a finer grid and check that the answer no longer moves. The PBS is optimized at 20 and evaluated at 30."],
say: "The wavelength is shortest in GaAs, so I quote the resolution there. Twenty steps per GaAs wavelength gives cells of about 11 nm and a phase velocity error of about 0.4 percent, and I trust a grid when a finer one gives the same answer, which is why the final results are evaluated at 30.",
num: String.raw`At \(\lambda_0\) = 800 nm, n = 3.5: \(\lambda_0/n\) = <b>229 nm</b>.<br>20 steps: \(\Delta x\) = <b>11.4 nm</b>, error 0.41 %. 30 steps: \(\Delta x\) = <b>7.6 nm</b>, error 0.18 %.<br>An 80 nm gap spans 7 cells at 20 steps and 10.5 at 30.`,
note: String.raw`<p><b>"Doesn't a square grid turn curved edges into staircases?"</b> (not in the thesis)</p><p>Tidy3D applies subpixel averaging: a cell cut by an interface gets an averaged permittivity, with different averages for the field parallel and normal to the edge. An edge between grid lines is therefore not snapped to the nearest cell, and moving it by a nanometre changes the result smoothly, which is also what a gradient-based optimizer needs.</p>`,
r(fig, ctl) {
  const n = 3.5, lam0 = 800;
  const CAP = ["Same frequency, two materials: in GaAs (bottom) the wavelength is 3.5 times shorter than in air (top).",
    v => `${v.q45N} samples per GaAs wavelength: Δx = ${(lam0 / (v.q45N * n)).toFixed(1)} nm.`,
    v => `The same Δx in air gives ${(3.5 * v.q45N).toFixed(0)} samples per wavelength. Far more than needed, so the non-uniform grid uses bigger cells in air.`,
    "On the grid, light travels a little too slowly. The phase error over ten GaAs wavelengths drops as 1/N². The two marks are 20 and 30.",
    "Geometry: the 80 nm grating gap and the 120 nm PBS rule, drawn on the grid. A few cells across is the bare minimum.",
    "Convergence: the result must stop changing as N grows. The flat part of the curve is where you want to be. Optimize where it is cheap enough, evaluate finer."];
  DQ4_board(fig, ctl, { h: 380, cap: CAP,
    sl: [["q45N", "Steps per GaAs wavelength", 6, 40, 1, 20, x => x.toFixed(0)]],
    draw: (k, v) => {
      const K = DQ4_K, Nl = v.q45N, dxn = lam0 / (Nl * n); let s = "";
      const Lx = 2 * lam0 / n, X = DQ4_map(0, Lx, 60, 620);
      const rowA = 66, rowG = 150, A = 28;
      const xs = range(0, Lx, 300);
      s += DQ4_T(20, 24, "air", { fs: 12, c: K.mute }) + DQ4_pl(X, y => rowA - y, xs, xs.map(x => A * Math.sin(2 * Math.PI * x / lam0)), K.mute, 1.8);
      s += DQ4_R(56, rowG - 40, 568, 80, K.gaas, null, 0.6) + DQ4_T(20, rowG - 46, "GaAs", { fs: 12, c: K.blue });
      s += DQ4_pl(X, y => rowG - y, xs, xs.map(x => A * Math.sin(2 * Math.PI * x * n / lam0)), K.blue, 1.8);
      s += DQ4_A(X(0), rowG + 50, X(lam0 / n), rowG + 50, K.blue, 1.2, null) + DQ4_T(X(lam0 / n / 2), rowG + 64, "λ0/n = 229 nm", { fs: 11, a: "middle", c: K.blue });
      if (k >= 2) for (let x = 0; x <= Lx + 1e-6; x += dxn) { s += DQ4_L(X(x), rowG - 36, X(x), rowG + 36, "#7d8ba0", 0.6); s += DQ4_dot(X(x), rowG - A * Math.sin(2 * Math.PI * x * n / lam0), 2.4, K.blue); }
      if (k >= 3) for (let x = 0; x <= Lx + 1e-6; x += dxn) s += DQ4_dot(X(x), rowA - A * Math.sin(2 * Math.PI * x / lam0), 2.2, K.mute);
      // dispersion plot
      if (k >= 4) {
        const px = 70, py = 238, pw = 300, ph = 110, NX = DQ4_map(6, 40, px, px + pw), err = N => 2 * Math.PI * 10 * (C2.dispRatio1D(N, 0.5) - 1);
        const PY = DQ4_map(0, 1.2, py + ph, py);
        s += DQ4_ax(px, py, pw, ph, "N", "phase error, 10 λ (rad)");
        const Ns = range(6, 40, 120); s += DQ4_pl(NX, PY, Ns, Ns.map(N => err(N) > 1.2 ? NaN : err(N)), K.blue, 2);
        [20, 30].forEach(N => s += DQ4_L(NX(N), py + ph, NX(N), PY(err(N)), K.mute, 1, "3 3") + DQ4_T(NX(N), py + ph + 14, N, { fs: 11, a: "middle", c: K.mute }));
        s += DQ4_dot(NX(Nl), PY(Math.min(1.2, err(Nl))), 5, K.orange);
        [0, 0.5, 1].forEach(q => s += DQ4_T(px - 6, PY(q) + 4, q, { fs: 10, a: "end", c: K.mute }));
        if (k >= 6) s += DQ4_R(NX(24), py, NX(40) - NX(24), ph, K.teal, null, 0.1) + DQ4_T(NX(32), py + 16, "converged", { fs: 12, a: "middle", c: K.teal });
      }
      if (k >= 5) {
        const gx = 420, gy = 232, sc = 1.15;
        const feat = (x0, w, lab, gap) => { let q = ""; const cells = Math.ceil((w + 2 * 30) / dxn) + 1; for (let i = 0; i < cells; i++) q += DQ4_R(x0 + i * dxn * sc, gy, dxn * sc, 26, "none", "#b8c0cc"); q += gap ? DQ4_R(x0, gy, 30 * sc, 26, K.blue, null, 0.45) + DQ4_R(x0 + (30 + w) * sc, gy, 30 * sc, 26, K.blue, null, 0.45) : DQ4_R(x0 + 30 * sc, gy, w * sc, 26, K.blue, null, 0.45); q += DQ4_T(x0 + (w + 60) * sc / 2, gy + 44, `${lab}: ${(w / dxn).toFixed(1)} cells`, { fs: 12, a: "middle" }); return q; };
        s += feat(gx, 80, "80 nm gap", true);
        s += DQ4_T(gx, gy - 10, "features on the grid", { fs: 12, c: K.mute });
        const gy2 = gy + 66; const save = gy;
        let q = ""; const cells = Math.ceil(180 / dxn) + 1; for (let i = 0; i < cells; i++) q += DQ4_R(gx + i * dxn * sc, gy2, dxn * sc, 26, "none", "#b8c0cc"); q += DQ4_R(gx + 30 * sc, gy2, 120 * sc, 26, K.blue, null, 0.45) + DQ4_T(gx + 90 * sc, gy2 + 44, `120 nm rule: ${(120 / dxn).toFixed(1)} cells`, { fs: 12, a: "middle" });
        s += q;
      }
      return s;
    },
    ro: v => { const dxn = lam0 / (v.q45N * n), r = C2.dispRatio1D(v.q45N, 0.5); return [["cell Δx in GaAs", dxn.toFixed(1) + " nm"], ["spatial estimate π²/(6N²)", DQ4_pct(Math.PI ** 2 / (6 * v.q45N ** 2))], ["1D Yee at S = 0.5", DQ4_pct(r - 1)], ["phase error over 10 λ", (2 * Math.PI * 10 * (r - 1)).toFixed(2) + " rad"]]; }
  });
}},

/* ---------------- Q4.6 ---------------- */
{s: "Q4.6", t: "Why design the gratings in 2D but the tapers and the PBS in 3D?",
intu: String.raw`A grating coupler is a row of long teeth across a wide waveguide, lit by a beam whose tilt lies in the plane of the waveguide axis and the fiber. Along the teeth almost nothing changes over the beam, so everything that sets the coupling (phase matching, the light returned by the DBR, the split between up and down) happens in that x-z plane. A 2D simulation in it captures this at a small fraction of the cost (Sec. 3.6), which leaves room for many iterations over a 101-wavelength band at 30 steps per wavelength. A taper and a PBS change their shape in the plane of the chip, in x and y, while their TE-like and TM-like modes are set by the confinement in z. No 2D cut holds both, so they are optimized in 3D, at 20 steps per wavelength to keep the cost manageable.`,
eq: String.raw`\[ \text{cost} \;\propto\; \underbrace{N_\lambda^{\,d}}_{\text{cells}}\times\underbrace{N_\lambda}_{\text{time steps}} = N_\lambda^{\,d+1} \]\[ \frac{\text{3D at } 30}{\text{3D at } 20} = \left(\frac{30}{20}\right)^{4} \approx 5 \]<div class="eqnote">The number of time steps grows with \(N_\lambda\) because the Courant limit ties \(\Delta t\) to \(\Delta x\). d is the number of dimensions.</div><div class="eqref">Sec. 3.6</div>`,
sym: [[String.raw`\(N_\lambda\)`, "steps per wavelength in GaAs"], [String.raw`\(d\)`, "number of dimensions, 2 or 3"], ["TE, TM in 2D", "TE has E along y, out of the x-z plane. TM has E in the plane of incidence"]],
how: ["Sketch the grating coupler in 3D: the waveguide along x, teeth running along y, the fiber above, tilted in the x-z plane.", "Mark that nothing changes along the teeth over the width of the beam, and cut the x-z plane through the axis.", "Draw that 2D cut: the membrane with teeth and gaps, the DBR below, the beam tilted 5° from the normal. TE has E along y, out of this plane, and TM has E in it.", "Sketch a taper and a splitter from the top. Their outline varies in x and y, and their two polarizations differ by the field along z. No single plane holds all of that.", "Compare the cost: 3D adds a whole direction of cells, and every refinement multiplies both the cells and the time steps."],
say: "The grating is uniform along its teeth, so its physics lives in the plane of the waveguide axis and the fiber and 2D is enough to design it cheaply. The taper and the splitter vary in the plane of the chip while their polarization is set vertically, so only 3D captures them.",
num: String.raw`Cost \(\propto N_\lambda^{3}\) in 2D and \(N_\lambda^{4}\) in 3D. Going from 20 to 30 steps multiplies a 3D run by about <b>5</b> and a 2D run by about <b>3.4</b>.<br>Gaussian beam: MFD 1.53 µm, tilted 5°, launched 0.5 µm above the membrane (Sec. 3.6).`,
note: String.raw`<p><b>"Can you trust a 2D grating result for the real 3D device?"</b></p><p>2D assumes an infinitely wide grating and a beam that does not vary along y. In 3D the beam has a finite width, the teeth a finite length, and a taper connects them to the 200 nm waveguide, which adds mode mismatch along y and taper loss. That is why the designs carried to 3D (N = 9 teeth, 18 parameters) were simulated again in 3D with the taper, at 20 steps per wavelength, and Chapter 5 reports those 3D results separately from the 2D ones.</p>`,
r(fig, ctl) {
  const CAP = ["The grating coupler in 3D: waveguide along x, teeth along y, the fiber above, tilted in the x-z plane.",
    "Along the teeth (y) nothing changes over the width of the beam. Cut the plane through the axis (dashed).",
    "The 2D cut in the x-z plane: membrane teeth and gaps, the DBR below, the Gaussian beam tilted 5°. This is all the coupling physics.",
    "A taper and a splitter, seen from the top: the outline changes in x and y, and TE versus TM is decided by the field along z. Every direction matters, so 3D.",
    v => `Cost estimate on a uniform GaAs grid at ${v.q46N} steps per wavelength (the real non-uniform grid is coarser in air, so real counts are smaller).`];
  const iso = (x, y, z) => [340 + x * 0.9 - y * 0.5, 175 - z + y * 0.28 - x * 0.06];
  const poly = (pts, f, st, op) => `<polygon points="${pts.map(p => p.join(",")).join(" ")}" fill="${f}" stroke="${st || "none"}" stroke-width="1.2"${op !== undefined ? ` fill-opacity="${op}"` : ""}/>`;
  DQ4_board(fig, ctl, { h: 380, cap: CAP,
    sl: [["q46N", "Steps per GaAs wavelength", 10, 40, 1, 20, x => x.toFixed(0)]],
    draw: (k, v) => {
      const K = DQ4_K; let s = "";
      if (k <= 2) {
        // 3D sketch
        const box = (x0, x1, y0, y1, z0, z1, f) => poly([iso(x0, y0, z1), iso(x1, y0, z1), iso(x1, y1, z1), iso(x0, y1, z1)], f, K.ink) + poly([iso(x0, y0, z0), iso(x1, y0, z0), iso(x1, y0, z1), iso(x0, y0, z1)], f, K.ink, 0.8) + poly([iso(x1, y0, z0), iso(x1, y1, z0), iso(x1, y1, z1), iso(x1, y0, z1)], f, K.ink, 0.6);
        s += box(-260, 260, -110, 110, -40, -10, "#e9edf3");
        s += box(-260, -60, -15, 15, -10, 0, K.gaas);
        for (let i = 0; i < 8; i++) { const x = -40 + i * 34; s += box(x, x + 18, -110, 110, -10, 0, K.gaas); }
        // fiber beam
        const top = iso(80, 0, 130), bot = iso(60, 0, 4);
        s += `<path d="M${top[0] - 34} ${top[1]} L${bot[0] - 40} ${bot[1]} L${bot[0] + 40} ${bot[1]} L${top[0] + 34} ${top[1]} Z" fill="${K.orange}" fill-opacity="0.15" stroke="${K.orange}"/>` + DQ4_T(top[0] + 40, top[1] + 4, "fiber beam", { fs: 12, c: K.orange });
        s += DQ4_A(80, 330, 122, 327, DQ4_K.ink, 1.3) + DQ4_A(80, 330, 80, 290, DQ4_K.ink, 1.3) + DQ4_A(80, 330, 58, 343, DQ4_K.ink, 1.3) + DQ4_T(128, 331, "x", { fs: 12 }) + DQ4_T(76, 284, "z", { fs: 12 }) + DQ4_T(46, 352, "y", { fs: 12 });
        { const wl = iso(-230, -15, 10); s += DQ4_T(wl[0], wl[1] - 10, "waveguide", { fs: 12, c: K.blue }); }
        if (k >= 2) {
          s += poly([iso(-260, 0, -40), iso(260, 0, -40), iso(260, 0, 140), iso(-260, 0, 140)], K.teal, K.teal, 0.08).replace('stroke-width="1.2"', 'stroke-width="1.6" stroke-dasharray="6 4"');
          { const cl = iso(260, 0, 140); s += DQ4_T(cl[0] - 4, cl[1] - 8, "cut: the x-z plane", { fs: 13, c: K.teal, w: 600, a: "end" }); }
          const a1 = iso(200, -110, 2), a2 = iso(200, 110, 2); s += arrow(a1[0], a1[1] - 8, a2[0], a2[1] - 8, K.purple, 2, null, true) + DQ4_T(a1[0] + 10, a1[1] - 6, "uniform along y", { fs: 12, c: K.purple });
        }
      }
      if (k === 3) {
        const X = x => 90 + x, zm = 170;
        s += DQ4_T(20, 24, "2D cut, x-z plane", { fs: 12, c: K.mute });
        s += DQ4_R(40, zm, 160, 16, K.gaas, K.blue);
        for (let i = 0; i < 10; i++) s += DQ4_R(200 + i * 40, zm, 22, 16, K.gaas, K.blue);
        for (let j = 0; j < 4; j++) s += DQ4_R(40, zm + 60 + j * 22, 560, 11, "#d9cfe9", "#a99bd0") + DQ4_R(40, zm + 71 + j * 22, 560, 11, "#f2eefa", "#d6cdea");
        s += DQ4_T(608, zm + 108, "DBR", { fs: 12, c: K.purple }) + DQ4_T(608, zm + 42, "air gap", { fs: 11, c: K.mute });
        const bx = 400, bt = 30; s += `<path d="M${bx - 80} ${bt} L${bx - 50} ${zm - 6} L${bx + 70} ${zm - 6} L${bx + 70 - 20} ${bt} Z" fill="${K.orange}" fill-opacity="0.13" stroke="${K.orange}"/>` + DQ4_L(bx - 15, bt, bx + 5, zm - 6, K.orange, 1, "5 4") + DQ4_L(bx + 5, zm - 6, bx + 5, bt, K.mute, 1, "3 3") + DQ4_T(bx + 12, 64, "5°", { fs: 12 }) + DQ4_T(bx + 70, 48, "Gaussian beam, MFD 1.53 µm", { fs: 12, c: K.orange });
        s += DQ4_T(44, zm - 8, "access waveguide", { fs: 12, c: K.blue });
        s += DQ4_T(70, 110, "TE: E along y  ⊙  (out of the page)", { fs: 13, c: K.blue }) + DQ4_T(70, 132, "TM: E in this plane  ↕", { fs: 13, c: K.orange });
      }
      if (k === 4) {
        s += DQ4_T(20, 24, "top view, x-y plane", { fs: 12, c: K.mute });
        const pts = range(0, 1, 40).map(u => [80 + 240 * u, 110 - (8 + 52 * Math.pow(u, 1.6))]);
        s += `<path d="M40 102 L80 102 ${pts.map(p => `L${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ")} L340 50 L340 170 ${pts.slice().reverse().map(p => `L${p[0].toFixed(1)} ${(220 - p[1]).toFixed(1)}`).join(" ")} L80 118 L40 118 Z" fill="${K.gaas}" stroke="${K.blue}"/>`;
        s += DQ4_T(190, 200, "taper: width changes along x", { fs: 12, a: "middle" });
        s += `<path d="M390 100 L450 100 Q500 98 520 70 L620 62 L620 78 L530 90 Q515 112 530 130 L620 142 L620 158 L520 150 Q500 122 450 120 L390 120 Z" fill="${K.gaas}" stroke="${K.blue}"/>` + DQ4_T(510, 200, "splitter: shape in x and y", { fs: 12, a: "middle" });
        s += DQ4_R(60, 238, 560, 26, K.gaas, K.blue) + DQ4_T(340, 230, "side view of the membrane: polarization lives here", { fs: 12, a: "middle", c: K.mute });
        s += DQ4_A(200, 251, 240, 251, K.blue, 2) + DQ4_T(250, 255, "TE-like: E in the plane", { fs: 12, c: K.blue });
        s += DQ4_A(440, 262, 440, 240, K.orange, 2) + DQ4_T(450, 255, "TM-like: E along z", { fs: 12, c: K.orange });
        s += DQ4_T(340, 300, "x, y and z all matter  →  3D", { fs: 15, a: "middle", w: 600 });
      }
      if (k === 5) {
        const Nl = v.q46N, dx = 0.8 / (3.5 * Nl);
        const c2 = (20 / dx) * (6 / dx), c3 = (8 / dx) * (4 / dx) * (3 / dx), st = Nl / 20;
        const ref = (8 / (0.8 / 70)) * (4 / (0.8 / 70)) * (3 / (0.8 / 70));
        const bars = [["2D grating, 20 × 6 µm", c2 * st, K.teal], ["3D taper or PBS, 8 × 4 × 3 µm", c3 * st, K.orange]];
        const mx = Math.log10(ref * 20);
        s += DQ4_T(40, 40, "cells × time steps, relative to N = 20 (uniform-grid estimate, log scale)", { fs: 12, c: K.mute });
        bars.forEach(([lab, val, c], j) => { const y = 70 + j * 70, w = 520 * Math.max(0, Math.log10(val) - 4) / (mx - 4); s += DQ4_T(40, y - 6, lab, { fs: 13 }) + DQ4_R(40, y, Math.max(2, w), 26, c, null, 0.7) + DQ4_T(48 + w, y + 18, val.toExponential(1), { fs: 12, c }); });
        s += DQ4_T(40, 236, "3D at 30 versus 3D at 20: ×5.06     2D at 30 versus 2D at 20: ×3.38", { fs: 15 });
        s += DQ4_T(40, 266, `3D at ${Nl} versus 3D at 20: ×${Math.pow(Nl / 20, 4).toFixed(2)}`, { fs: 15, c: K.orange });
        s += DQ4_T(40, 296, `3D / 2D at the same N: ×${(c3 / c2).toFixed(0)}`, { fs: 15 });
      }
      return s;
    },
    ro: v => { const Nl = v.q46N, dx = 0.8 / (3.5 * Nl); return [["GaAs cell", (dx * 1000).toFixed(1) + " nm"], ["2D cells", ((20 / dx) * (6 / dx) / 1e6).toFixed(1) + " million"], ["3D cells", ((8 / dx) * (4 / dx) * (3 / dx) / 1e6).toFixed(0) + " million"]]; }
  });
}},

/* ---------------- Q4.7 ---------------- */
{s: "Q4.7", t: "How do symmetry planes halve the cost, and why can't you use z = 0 under the grating?",
intu: String.raw`If the structure is mirror symmetric about a plane, every field splits into an even and an odd part under the reflection, and the two never mix. You can then simulate half the domain and replace the plane by a wall that keeps the parity you want. In Tidy3D, +1 keeps even fields and acts as a perfect magnetic conductor (PMC), and −1 keeps odd fields and acts as a perfect electric conductor (PEC) (Sec. 3.6). So a PEC plane keeps a mode whose electric field is normal to the plane, and a PMC plane a mode whose electric field lies in it. Each plane halves the cells. The membrane mid-plane \(z = 0\) is a mirror only with air above and below. Under the grating the DBR lies below and air above, so that symmetry is broken. The plane \(y = 0\) through the waveguide axis still works for the gratings and the tapers, which are symmetric about it.`,
eq: String.raw`\[ \text{PEC } (-1):\ \hat{\mathbf n}\times\mathbf E = 0, \qquad \text{PMC } (+1):\ \hat{\mathbf n}\times\mathbf H = 0 \]\[ z = 0:\ \text{TE-like} \to +1,\ \ \text{TM-like} \to -1 \qquad y = 0:\ \mathrm{TE}_0 \to -1,\ \ \mathrm{TM}_0 \to +1 \]<div class="eqref">Sec. 3.6, Tidy3D symmetry convention</div>`,
sym: [[String.raw`\(\hat{\mathbf n}\)`, "normal of the symmetry plane"], ["PEC", "perfect electric conductor: tangential E is zero, so E can only be normal to it"], ["PMC", "perfect magnetic conductor: tangential H is zero, so E lies in it"]],
how: [String.raw`Draw the cross-section of the suspended membrane, air above and below, and dash the mid-plane \(z = 0\).`, "TE-like mode: draw E arrows along the membrane. The mirror image is identical, the field is even, and a PMC wall (+1) at z = 0 keeps it.", String.raw`TM-like mode: draw \(E_z\) arrows crossing the plane. They are normal to the plane, so a PEC wall (−1) keeps them, since a PEC only forbids tangential E.`, "Put the DBR under the grating: the lower half is no longer the image of the upper half. The z = 0 symmetry is gone, and the full height must be simulated.", String.raw`Top view: \(y = 0\) through the waveguide axis is still a mirror for the grating and the taper. \(\mathrm{TE}_0\) has \(E_y\) normal to it, so −1, and \(\mathrm{TM}_0\) has \(E_z\) in it, so +1. The 5° tilt lies in the x-z plane and does not break it.`, "Count: each valid plane halves the cells, two planes quarter them."],
say: "A mirror plane lets me simulate half the domain with a PEC or PMC wall that keeps one parity, a PEC for a field normal to the plane and a PMC for a field in it. Under the grating the DBR breaks the up-down mirror, so only the y = 0 plane through the waveguide axis can be used there.",
num: String.raw`Tidy3D: <b>+1</b> = even = PMC, <b>−1</b> = odd = PEC. One plane: half the cells. Two planes: a quarter.<br>The source must have the same parity as the field that is kept.`,
note: String.raw`<p><b>"Can a symmetry plane change the answer?"</b></p><p>Only if the structure or the source is not exactly symmetric. In a truly symmetric device an even input can never produce an odd output, so the wall removes nothing that could exist. The thesis checks that the planes reproduce the full-domain results for each device (Chapters 4 and 5). A splitter that sends TE and TM to different ports cannot be mirror symmetric about its axis, so \(y = 0\) is not used for the PBS.</p>`,
r(fig, ctl) {
  const CAP = ["The suspended membrane in cross-section, air above and below. Dashed: the mid-plane z = 0.",
    "TE-like: E lies along the membrane, and its mirror image is the same field. Even, so a PMC wall (+1) keeps it.",
    "TM-like: E_z points across the plane, the same way above and below. Normal to the plane, so a PEC wall (−1) keeps it.",
    "Under the grating the DBR lies below and air above. The mirror image of the top half is not the bottom half, so no z symmetry.",
    v => `Top view. The plane y = 0 through the axis is a mirror of the grating and the taper. ${v.pol === "TE" ? "TE0 has E_y normal to it: PEC, −1." : "TM0 has E_z lying in it: PMC, +1."} Switch the polarization to check the other.`,
    "Each valid plane halves the domain. With y = 0 used and z = 0 forbidden by the DBR, the grating runs on half the cells."];
  DQ4_board(fig, ctl, { h: 370, cap: CAP,
    opts: [{ key: "pol", label: "Polarization", val: "TE", items: [["TE", "TE"], ["TM", "TM"]] }],
    draw: (k, v) => {
      const K = DQ4_K; let s = "";
      // left: cross-section
      const lx = 30, lw = 300, zc = 150, t = 28;
      s += DQ4_T(lx, 24, "side view (z up)", { fs: 12, c: K.mute });
      s += DQ4_R(lx, zc - t / 2, lw, t, K.gaas, K.blue);
      if (k >= 4) { for (let j = 0; j < 3; j++) s += DQ4_R(lx, zc + 50 + j * 24, lw, 12, "#d9cfe9", "#a99bd0"); s += DQ4_T(lx + lw - 4, zc + 128, "DBR below", { fs: 12, a: "end", c: K.purple }); for (let i = 0; i < 6; i++) s += DQ4_R(lx + 20 + i * 48, zc - t / 2, 18, t, "#fff", K.blue); }
      s += DQ4_T(lx + 6, zc - 52, "air", { fs: 12, c: K.mute }) + (k < 4 ? DQ4_T(lx + 6, zc + 64, "air", { fs: 12, c: K.mute }) : "");
      s += DQ4_L(lx - 6, zc, lx + lw + 8, zc, k >= 4 ? K.red : K.teal, 1.8, "7 5") + DQ4_T(lx + lw + 4, zc - 6, "z = 0", { fs: 12, a: "end", c: k >= 4 ? K.red : K.teal });
      if (k === 2) for (let i = 0; i < 5; i++) { const x = lx + 30 + i * 58; s += DQ4_A(x, zc - 7, x + 34, zc - 7, K.blue, 2.2) + DQ4_A(x, zc + 7, x + 34, zc + 7, K.blue, 2.2); }
      if (k === 2) s += DQ4_T(lx, zc + 100, "even  →  PMC (+1)", { fs: 15, c: K.blue, w: 600 });
      if (k === 3) for (let i = 0; i < 5; i++) { const x = lx + 40 + i * 58; s += DQ4_A(x, zc + 34, x, zc - 34, K.orange, 2.2); }
      if (k === 3) s += DQ4_T(lx, zc + 100, "E normal to plane  →  PEC (−1)", { fs: 15, c: K.orange, w: 600 });
      if (k >= 4) s += DQ4_T(lx + 150, zc - 64, "top ≠ mirror of bottom  ✗", { fs: 15, c: K.red, a: "middle", w: 600 });
      // right: top view
      if (k >= 5) {
        const rx = 370, rw = 280, yc = 150;
        s += DQ4_T(rx, 24, "top view (y up)", { fs: 12, c: K.mute });
        s += `<path d="M${rx} ${yc - 8} L${rx + 80} ${yc - 8} L${rx + 160} ${yc - 70} L${rx + rw} ${yc - 70} L${rx + rw} ${yc + 70} L${rx + 160} ${yc + 70} L${rx + 80} ${yc + 8} L${rx} ${yc + 8} Z" fill="${K.gaas}" stroke="${K.blue}"/>`;
        for (let i = 0; i < 5; i++) s += DQ4_R(rx + 172 + i * 22, yc - 70, 9, 140, "#fff", K.blue);
        const pec = v.pol === "TE";
        s += DQ4_L(rx - 6, yc, rx + rw + 6, yc, pec ? K.ink : K.purple, 2.2, "7 5") + DQ4_T(rx + rw, yc - 78, "y = 0", { fs: 12, a: "end" });
        if (pec) [rx + 40, rx + 120, rx + 220].forEach(x => s += DQ4_A(x, yc + 22, x, yc - 22, K.blue, 2.2));
        else [rx + 40, rx + 120, rx + 220].forEach(x => s += `<circle cx="${x}" cy="${yc}" r="8" fill="#fff" stroke="${K.orange}" stroke-width="2"/><circle cx="${x}" cy="${yc}" r="2.5" fill="${K.orange}"/>`);
        s += DQ4_T(rx, yc + 104, pec ? `TE${DQ4_sub("0")}: E${DQ4_sub("y")} normal to y = 0  →  PEC (−1)` : `TM${DQ4_sub("0")}: E${DQ4_sub("z")} lies in y = 0  →  PMC (+1)`, { fs: 14, c: pec ? K.blue : K.orange, w: 600 });
        if (k >= 6) { s += DQ4_R(rx, yc, rw, 70, K.ink, null, 0.12) + DQ4_T(rx + rw / 2, yc + 132, "simulate only this half: ½ of the cells", { fs: 13, a: "middle", w: 600 }); s += DQ4_T(lx, 340, "grating on a DBR: y = 0 allowed, z = 0 not, so 1/2 of the cells", { fs: 13 }); }
      }
      return s;
    },
    ro: (v, k) => [[`z = 0 plane, ${v.pol}`, k >= 4 ? "0 (not symmetric)" : v.pol === "TE" ? "+1, PMC" : "−1, PEC"], [`y = 0 plane, ${v.pol}`, v.pol === "TE" ? "−1, PEC" : "+1, PMC"]]
  });
}},

/* ---------------- Q4.8 ---------------- */
{s: "Q4.8", t: "How is a transmission number obtained from the fields?",
intu: String.raw`At an output plane the simulated field is projected onto the wanted mode, computed by the mode solver at that plane (Eq. 3.12). Tidy3D normalizes every mode to carry 1 W, and the mode sources and Gaussian beams inject 1 W at each frequency, so \(T_m = |a_m|^2\) is directly the fraction of the injected power that leaves in mode m (Sec. 3.4). Power in other modes, radiation or the other polarization does not count, which is the point: only the fundamental mode is useful to the next component. The overlap uses both E and H, and its two cross terms pick out only the wave travelling forward through the plane, even if a reflected wave crosses the same plane.`,
eq: String.raw`\[ a_m = \frac14 \int_S \big(\mathbf{E}_m^{*}\times\mathbf{H} + \mathbf{E}\times\mathbf{H}_m^{*}\big)\cdot\hat{\mathbf{n}}\,dS, \qquad T_m = |a_m|^2 \]<div class="eqref">Ch. 3 Eq. (3.12), Sec. 3.4</div>\[ \frac12\,\mathrm{Re}\int_S \big(\mathbf E_m\times\mathbf H_m^{*}\big)\cdot\hat{\mathbf n}\,dS = 1\ \mathrm{W} \]<div class="eqnote">Tidy3D's normalization of every mode, so \(|a_m|^2\) is in watts out of the 1 W injected.</div>`,
sym: [[String.raw`\(\mathbf E, \mathbf H\)`, "simulated fields on the monitor plane S"], [String.raw`\(\mathbf E_m, \mathbf H_m\)`, "fields of mode m from the mode solver at that plane"], [String.raw`\(\hat{\mathbf n}\)`, "normal of the plane, pointing forward"], [String.raw`\(a_m, T_m\)`, "amplitude and transmitted power fraction of mode m"]],
how: ["Draw the output waveguide, the monitor plane across it, and the simulated field on the plane: mostly the fundamental mode, plus some higher mode and radiation.", "Draw the fundamental mode profile from the mode solver at the same plane, normalized to 1 W.", String.raw`Multiply the two and integrate across the plane, Eq. (3.12). The area is the amplitude \(a_m\). The odd higher mode and the radiation integrate to zero against it.`, String.raw`Square it: \(T_m = |a_m|^2\) is the fraction of the 1 W input in that mode. Compare with the total flux through the plane, which also counts light you cannot use.`, String.raw`Add a reflected wave crossing the same plane. Forward and backward modes have the same transverse E but opposite H, so the two terms of Eq. (3.12) cancel the backward part and \(a_m\) is unchanged.`],
say: "I project the field on the output plane onto the 1 W mode from the mode solver. The squared amplitude is the fraction of the injected watt that travels forward in that mode, which leaves out light in other modes, radiation and reflections.",
num: String.raw`Mode normalized to 1 W and sources injecting 1 W at each frequency, so \(0 \le T_m \le 1\).<br>Demo: 160 nm GaAs slab in air at 800 nm, TE modes: \(\mathrm{TE}_0\) is even, \(\mathrm{TE}_1\) is odd.`,
note: String.raw`<p><b>"Why not just take the Poynting flux through the plane?"</b></p><p>The flux counts every watt that crosses the plane, including higher modes, light radiating into the air and the other polarization, none of which couples into the next waveguide or the fiber, and it subtracts any reflected light. The mode overlap is what the next device actually receives. The flux is still a useful check, because \(|a_m|^2\) can never exceed the forward flux.</p>`,
r(fig, ctl) {
  const nG = 3.5, t = 160, lam = 800, zs = range(-700, 700, 561), dz = zs[1] - zs[0];
  const N0 = C2.slabN(nG, 1, t, lam, 0, "TE"), N1 = C2.slabN(nG, 1, t, lam, 1, "TE");
  const u0r = C2.slabProfile(nG, 1, t, lam, 0, "TE", N0, zs).main, u1r = C2.slabProfile(nG, 1, t, lam, 1, "TE", N1, zs).main;
  const dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0) * dz, nrm = a => { const q = Math.sqrt(dot(a, a)); return a.map(x => x / q); };
  const u0 = nrm(u0r), u1 = nrm(u1r);
  let g = zs.map(z => Math.exp(-z * z / (2 * 330 * 330)) * Math.cos(2 * Math.PI * z / 260));
  g = g.map((x, i) => x - dot(g, u0) * u0[i]); g = g.map((x, i) => x - dot(g, u1) * u1[i]); const ur = nrm(g);
  const amps = v => { let P0 = v.q48a, P1 = v.q48b, Pr = v.q48c; const S = P0 + P1 + Pr; if (S > 1) { P0 /= S; P1 /= S; Pr /= S; } return { c0: Math.sqrt(P0), c1: Math.sqrt(P1), cr: Math.sqrt(Pr), P0, P1, Pr, b: v.q48d }; };
  const CAP = ["The output waveguide (membrane in the middle) and the field on the monitor plane: mostly TE0, plus some TE1 and radiation.",
    "The mode solver gives the TE0 profile at this plane, normalized to carry 1 W (orange).",
    "Multiply and integrate (shaded). The TE1 part is odd and the radiation is orthogonal, so both add nothing to the area. The area is a_m.",
    v => { const A = amps(v); return `T = |a|² = ${A.P0.toFixed(3)} of the 1 W injected. The total forward flux is ${(A.P0 + A.P1 + A.Pr).toFixed(3)}, but only the mode part reaches the next device.`; },
    v => { const A = amps(v); return `A reflected TE0 wave (amplitude ${A.b.toFixed(2)}) crosses the plane too. With E and H, a = ${A.c0.toFixed(3)} is unchanged. With E alone you would get ${(A.c0 + A.b).toFixed(3)}, which is wrong.`; }];
  DQ4_board(fig, ctl, { h: 340, cap: CAP,
    sl: [["q48a", "Power in TE0", 0, 1, 0.01, 0.7, x => x.toFixed(2)], ["q48b", "Power in TE1", 0, 0.5, 0.01, 0.12, x => x.toFixed(2)], ["q48c", "Power in radiation", 0, 0.5, 0.01, 0.1, x => x.toFixed(2)], ["q48d", "Reflected TE0 amplitude", -0.4, 0.4, 0.01, 0.2, x => x.toFixed(2)]],
    draw: (k, v) => {
      const K = DQ4_K, A = amps(v); let s = "";
      const E = zs.map((z, i) => A.c0 * u0[i] + A.c1 * u1[i] + A.cr * ur[i] + (k >= 5 ? A.b * u0[i] : 0));
      const pk = Math.max(...u0.map(Math.abs)) * 1.25, Z = DQ4_map(-700, 700, 60, 620), Y = DQ4_map(-pk, pk, 230, 40);
      s += DQ4_R(Z(-80), 30, Z(80) - Z(-80), 210, K.gaas, null, 0.7) + DQ4_T((Z(-80) + Z(80)) / 2, 254, "GaAs 160 nm", { fs: 11, a: "middle", c: K.blue });
      s += DQ4_T(64, 254, "air", { fs: 11, c: K.mute }) + DQ4_T(616, 254, "air", { fs: 11, a: "end", c: K.mute }) + DQ4_T(620, 270, "z across the plane", { fs: 11, a: "end", c: K.mute });
      s += DQ4_L(60, Y(0), 620, Y(0), "#b8c0cc", 0.8);
      if (k >= 3) { const prod = zs.map((z, i) => E[i] * u0[i] / pk); const PY = DQ4_map(-pk, pk, 230, 40); let d = `M${Z(-700)} ${PY(0)}`; zs.forEach((z, i) => d += ` L${Z(z).toFixed(1)} ${PY(prod[i]).toFixed(1)}`); d += ` L${Z(700)} ${PY(0)} Z`; s += `<path d="${d}" fill="${K.teal}" fill-opacity="0.3" stroke="${K.teal}" stroke-width="1"/>`; }
      s += DQ4_pl(Z, Y, zs, E, K.blue, 2.2) + DQ4_T(70, 48, "simulated E on the plane", { fs: 12, c: K.blue });
      if (k >= 2) s += DQ4_pl(Z, Y, zs, u0, K.orange, 1.8, "6 4") + DQ4_T(70, 66, "TE0 mode, 1 W", { fs: 12, c: K.orange });
      if (k >= 3) s += DQ4_T(70, 84, "product E · E_m (area = a)", { fs: 12, c: K.teal });
      if (k >= 4) {
        const bx = 70, by = 290, W = 420;
        s += DQ4_T(bx, by - 4, "T = |a|²", { fs: 12 }) + DQ4_R(bx + 70, by - 16, W * A.P0, 14, K.teal, null, 0.8);
        s += DQ4_T(bx, by + 20, "total flux", { fs: 12 }) + DQ4_R(bx + 70, by + 8, W * (A.P0 + A.P1 + A.Pr), 14, "#b8c0cc") + DQ4_R(bx + 70, by + 8, W * A.P0, 14, K.teal, null, 0.8);
      }
      if (k >= 5) s += DQ4_T(500, 66, `reflected wave added`, { fs: 12, c: K.red });
      return s;
    },
    ro: (v, k) => { const A = amps(v); return [["overlap a (E and H)", A.c0.toFixed(3)], ["T = |a|²", A.P0.toFixed(3)], ["forward flux", (A.P0 + A.P1 + A.Pr).toFixed(3)], ["E alone, squared", k >= 5 ? ((A.c0 + A.b) ** 2).toFixed(3) : "(add a reflection)"]]; }
  });
}}

],
summary: String.raw`FDTD marches Maxwell's two curl equations, Eq. (2.16), in time on the staggered Yee grid, where every curl is a central difference and E and H leapfrog each other. A short pulse is broadband, so one run Fourier transformed at the monitors gives the whole band. A PML absorbs outgoing light without reflection because its losses are matched, and the waveguides run straight into it. The resolution is quoted in GaAs, where the wavelength is shortest: 30 steps for the 2D gratings and 20 for the 3D taper and PBS, with the final PBS evaluated at 30. The gratings live in the x-z plane and are designed in 2D, while the taper and the splitter need all three directions. A mirror plane halves the domain with a PMC (+1, E in the plane) or PEC (−1, E normal), but the DBR breaks \(z = 0\) under the grating. Transmission is the squared overlap with the 1 W mode, Eq. (3.12).`,
sheet: [
  [String.raw`\[ \frac{\partial \mathbf{E}}{\partial t} = \frac{1}{\varepsilon_0\varepsilon_r}\nabla \times \mathbf{H}, \qquad \frac{\partial \mathbf{H}}{\partial t} = -\frac{1}{\mu_0}\nabla \times \mathbf{E} \]`, "Eq. (2.16): what FDTD solves (Q4.1)"],
  [String.raw`\[ \frac{\partial E_z}{\partial x}\bigg|_{i+1/2} \approx \frac{E_z|_{i+1} - E_z|_{i}}{\Delta x}, \qquad \frac{\Delta v}{v} \approx \frac{(k\Delta x)^2}{24} \]`, "Central difference on the staggered grid and its error (Q4.2, Q4.5)"],
  [String.raw`\[ T(f) = \frac{|\tilde E_{\mathrm{out}}(f)|^2}{|\tilde E_{\mathrm{src}}(f)|^2}, \qquad \Delta f\,\tau \approx 0.44 \]`, "Spectrum from one pulse (Q4.3)"],
  [String.raw`\[ \frac{\sigma_m}{\mu_0} = \frac{\sigma}{\varepsilon_0} \Rightarrow \eta = \eta_0, \qquad R \approx e^{-2\sigma_{\max} d/((m+1)\varepsilon_0 c)} \]`, "Matched and graded PML (Q4.4)"],
  [String.raw`\[ \Delta x = \frac{\lambda_0}{N_\lambda\, n_{\mathrm{GaAs}}}, \qquad \text{cost} \propto N_\lambda^{\,d+1} \]`, "Grid in GaAs and the cost of 2D and 3D (Q4.5, Q4.6)"],
  [String.raw`\[ \text{PEC } (-1): \hat{\mathbf n}\times\mathbf E = 0, \qquad \text{PMC } (+1): \hat{\mathbf n}\times\mathbf H = 0 \]`, "Symmetry walls in Tidy3D (Q4.7)"],
  [String.raw`\[ a_m = \frac14 \int_S \big(\mathbf{E}_m^{*}\times\mathbf{H} + \mathbf{E}\times\mathbf{H}_m^{*}\big)\cdot\hat{\mathbf{n}}\,dS, \qquad T_m = |a_m|^2 \]`, "Eq. (3.12): mode overlap with 1 W normalization (Q4.8)"]
],
sources: ["Taflove and Hagness 2016, as cited in Ch. 2 Sec. 2.6: Eqs. (1), (2), (4a) and (4b) for the curl equations, Sec. 5 for the Yee leapfrog, Sec. 13 for the PML", "Flexcompute Tidy3D documentation: non-uniform grid set by steps per wavelength, symmetry (+1 PMC, −1 PEC), PML, mode sources, Gaussian beams and mode monitors normalized to 1 W, Courant factor, shutoff and subpixel averaging (follow-ups)", "Ch. 2 Sec. 2.6 and Ch. 3 Sec. 3.4 and 3.6 of the thesis for every setting quoted here"]
});

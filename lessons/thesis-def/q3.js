/* Committee questions Q3: multimode interference and polarization splitting (thesis Sec. 2.5).
   Helpers below use the prefix DFQ3_ (all lesson files share one global scope). */
const DFQ3_C = { ink: "#1f2933", mute: "#6b7684", blue: "#2563c9", orange: "#d0582a", green: "#14866a", purple: "#6a5fd0", amber: "#b7791f", red: "#c53030", gaas: "#cdd6e3", gaasE: "#7d8ca3", sub: "#ece2cc", win: "#dff3ea", grid: "#e6eaf0" };
const DFQ3_s = s => `<tspan baseline-shift="sub" font-size="9">${s}</tspan>`;
const DFQ3_ne = `n${DFQ3_s("eff")}`;
const DFQ3_T = (x, y, s, o) => { o = o || {}; return `<text x="${x}" y="${y}" font-size="${(o.fs || 13) + 2}" fill="${o.c || DFQ3_C.ink}" text-anchor="${o.a || "start"}"${o.b ? ' font-weight="600"' : ""}${o.i ? ' font-style="italic"' : ""}>${s}</text>`; };
const DFQ3_L = (x1, y1, x2, y2, c, w, d) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c || DFQ3_C.ink}" stroke-width="${w || 1.5}" stroke-linecap="round"${d ? ` stroke-dasharray="${d}"` : ""}/>`;
const DFQ3_A = (x1, y1, x2, y2, c, w, d) => arrow(x1, y1, x2, y2, c || DFQ3_C.ink, w || 1.8, d);
const DFQ3_P = (pts, c, w, d, f) => `<path d="${pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join("")}" fill="${f || "none"}" stroke="${c}" stroke-width="${w || 2}" stroke-linejoin="round"${d ? ` stroke-dasharray="${d}"` : ""}/>`;
const DFQ3_R = (x, y, w, h, f, s, o) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}"${s ? ` stroke="${s}"` : ""}${o != null ? ` fill-opacity="${o}"` : ""}/>`;

/* Whiteboard engine: Back / Next / Play / Show all, one caption per how[] step, optional sliders and readout.
   o = { h, sl: [[id, label, min, max, step, value, fmt]], draw(k, v, t) -> svg body, ro(v, k) -> html, live, dt } */
const DFQ3_board = function (card, fig, ctl, o) {
  const n = card.how.length, sls = o.sl || [];
  let k = 1, timer = null;
  ctl.innerHTML = `<p data-q="cap" style="font-size:14px;line-height:1.5;color:var(--fg);min-height:48px;margin:8px 2px 4px"></p>` + sls.map(a => sl(a[0], a[1], a[2], a[3], a[4], a[5])).join("") +
    `<div class="row"><button data-q="b">Back</button><button data-q="n">Next</button><button data-q="p">Play</button><button data-q="a">Show all</button><span data-q="s" style="font-size:13px;color:var(--muted)"></span></div>` +
    (o.ro ? '<div class="readout" data-q="ro"></div>' : "");
  fig.innerHTML = `<div data-q="sv"></div>`;
  const q = s => fig.querySelector(`[data-q="${s}"]`) || ctl.querySelector(`[data-q="${s}"]`);
  const sv = q("sv"), cap = q("cap");
  const vals = () => { const v = {}; sls.forEach(a => { const e = $(a[0]); v[a[0]] = +e.value; $(a[0] + "v").textContent = a[6] ? a[6](+e.value) : e.value; }); return v; };
  const render = t => {
    const v = vals();
    sv.innerHTML = svg(o.h, `<rect x="1" y="1" width="678" height="${o.h - 2}" rx="10" fill="#ffffff" stroke="#cfd6e0"/><g style="font-family:var(--body)">${o.draw(k, v, t || 0)}</g>`);
    if (o.ro) q("ro").innerHTML = o.ro(v, k);
  };
  const go = j => { k = Math.max(1, Math.min(n, j)); q("s").textContent = `step ${k} of ${n}`; q("b").disabled = k === 1; q("n").disabled = k === n; cap.innerHTML = `<b>Step ${k}.</b> ${card.how[k - 1]}`; typesetMath(cap); render(); };
  const stop = () => { if (timer) clearInterval(timer); timer = null; q("p").textContent = "Play"; };
  q("b").onclick = () => { stop(); go(k - 1); };
  q("n").onclick = () => { stop(); go(k + 1); };
  q("a").onclick = () => { stop(); go(n); };
  q("p").onclick = () => {
    if (timer) { stop(); return; }
    if (k === n) go(1);
    q("p").textContent = "Pause";
    timer = setInterval(() => { if (!sv.isConnected) { clearInterval(timer); timer = null; return; } if (k < n) go(k + 1); else stop(); }, o.dt || 2800);
  };
  sls.forEach(a => { $(a[0]).oninput = () => render(); });
  go(1);
  if (o.live) anim(t => { if (!sv.isConnected) { stopAnim(); return; } render(t); });
};

/* Three-layer slab: core index n, thickness t, top cladding nt, bottom cladding nb. Mode m, pol "TE" or "TM".
   kappa t = phi_b + phi_t + m pi with phi = atan(zeta gamma / kappa), zeta = 1 (TE) or (n / n_side)^2 (TM). */
const DFQ3_slab = (n, nt, nb, t, lam, m, pol) => {
  const k0 = 2 * Math.PI / lam, lo0 = Math.max(nt, nb);
  const zt = pol === "TM" ? n * n / (nt * nt) : 1, zb = pol === "TM" ? n * n / (nb * nb) : 1;
  const parts = N => { const ka = k0 * Math.sqrt(Math.max(n * n - N * N, 1e-12)), gt = k0 * Math.sqrt(Math.max(N * N - nt * nt, 0)), gb = k0 * Math.sqrt(Math.max(N * N - nb * nb, 0)); return { ka, gt, gb, pb: Math.atan(zb * gb / ka), pt: Math.atan(zt * gt / ka) }; };
  const f = N => { const p = parts(N); return p.ka * t - p.pb - p.pt - m * Math.PI; };
  let lo = lo0 + 1e-9, hi = n - 1e-9;
  if (!(lo < hi) || f(lo) <= 0) return null;
  for (let i = 0; i < 80; i++) { const mid = (lo + hi) / 2; if (f(mid) > 0) lo = mid; else hi = mid; }
  const N = (lo + hi) / 2;
  return Object.assign({ N, n, nt, nb, t }, parts(N));
};
/* Field of a slab mode at positions zs (z = 0 at the membrane center). main: Ey (TE) or Hy (TM). ez: Hy / eps (TM). */
const DFQ3_field = (s, zs) => {
  const h = s.t / 2;
  const main = zs.map(z => { const u = z + h; if (u < 0) return Math.cos(s.pb) * Math.exp(s.gb * u); if (u > s.t) return Math.cos(s.ka * s.t - s.pb) * Math.exp(-s.gt * (u - s.t)); return Math.cos(s.ka * u - s.pb); });
  const eps = z => z > h ? s.nt * s.nt : z < -h ? s.nb * s.nb : s.n * s.n;
  const ez = main.map((v, i) => v / eps(zs[i]));
  const nm = a => { const mx = Math.max(...a.map(Math.abs)) || 1; return a.map(x => x / mx); };
  return { main: nm(main), ez: nm(ez), eps: zs.map(eps) };
};

const DFQ3_sp = s => `<tspan baseline-shift="super" font-size="9">${s}</tspan>`;
const DFQ3_NTE = C2.slabN(3.5, 1, 160, 800, 0, "TE"), DFQ3_NTM = C2.slabN(3.5, 1, 160, 800, 0, "TM");
/* Heat map of intensity values I[j][i] (0..1) as SVG rects, white to blue. */
const DFQ3_heat = (x0, y0, w, h, I, col) => {
  const ny = I.length, nx = I[0].length, dx = w / nx, dy = h / ny, c = col || [37, 99, 201]; let s = "";
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const v = Math.pow(Math.min(1, Math.max(0, I[j][i])), 0.8); if (v < 0.03) continue; s += `<rect x="${(x0 + i * dx).toFixed(1)}" y="${(y0 + j * dy).toFixed(1)}" width="${(dx + 0.6).toFixed(1)}" height="${(dy + 0.6).toFixed(1)}" fill="rgb(${Math.round(255 - (255 - c[0]) * v)},${Math.round(255 - (255 - c[1]) * v)},${Math.round(255 - (255 - c[2]) * v)})"/>`; }
  return s;
};
/* Self-imaging field from Eq. (2.12) with sine-like modes of a box of width 1 (y from -0.5 to 0.5). x in units of L_pi. */
const DFQ3_mmi = (y0, M) => {
  const ys = range(-0.5, 0.5, 201), dy = ys[1] - ys[0], inp = ys.map(y => Math.exp(-Math.pow((y - y0) / 0.1, 2)));
  const psi = [], c = [];
  for (let v = 0; v < M; v++) { const p = ys.map(y => Math.sin((v + 1) * Math.PI * (y + 0.5))); psi.push(p); let a = 0, b = 0; p.forEach((q, i) => { a += inp[i] * q; b += q * q; }); c.push(a / b); }
  const at = (x, yi) => { let re = 0, im = 0; for (let v = 0; v < M; v++) { const ph = v * (v + 2) * Math.PI * x / 3, a = c[v] * psi[v][yi]; re += a * Math.cos(ph); im += a * Math.sin(ph); } return re * re + im * im; };
  return { ys, inp, psi, c, at };
};
const DFQ3_mmiCache = {};
const DFQ3_img = (I, col) => { const ny = I.length, nx = I[0].length, c = col || [37, 99, 201]; let url = "";
  try { const cv = document.createElement("canvas"); cv.width = nx; cv.height = ny; const ctx = cv.getContext("2d"), im = ctx.createImageData(nx, ny);
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const v = Math.pow(Math.min(1, Math.max(0, I[j][i])), 0.8), q = 4 * (j * nx + i); im.data[q] = 255 - (255 - c[0]) * v; im.data[q + 1] = 255 - (255 - c[1]) * v; im.data[q + 2] = 255 - (255 - c[2]) * v; im.data[q + 3] = 255; }
    ctx.putImageData(im, 0, 0); url = (cv.toDataURL && cv.toDataURL()) || ""; } catch (e) { url = ""; }
  return url; };
const DFQ3_mmiMap = y0 => { const key = y0.toFixed(3); if (DFQ3_mmiCache[key]) return DFQ3_mmiCache[key]; const f = DFQ3_mmi(y0, 10), nx = 420, ny = 80, I = []; let mx = 0;
  for (let j = 0; j < ny; j++) { const yi = Math.round((1 - (j + 0.5) / ny) * 200), row = []; for (let i = 0; i < nx; i++) { const v = f.at((i + 0.5) / nx * 6.3, yi); row.push(v); mx = Math.max(mx, v); } I.push(row); }
  const In = I.map(r => r.map(v => v / mx)); return (DFQ3_mmiCache[key] = { f, I: In, mx, url: DFQ3_img(In) }); };
/* Two-mode interference map, input at +D, beat length Lp (in the same units as x, 0..6). */
const DFQ3_tmiMap = Lp => { const nx = 120, ny = 26, I = []; for (let j = 0; j < ny; j++) { const y = 0.5 - (j + 0.5) / ny, p0 = Math.cos(Math.PI * y), p1 = Math.sin(2 * Math.PI * y), row = []; for (let i = 0; i < nx; i++) { const ph = Math.PI * ((i + 0.5) / nx * 6) / Lp; row.push(Math.pow(p0 + p1 * Math.cos(ph), 2) + Math.pow(p1 * Math.sin(ph), 2)); } I.push(row); } const mx = Math.max(...I.map(r => Math.max(...r))); return I.map(r => r.map(v => v / mx)); };
/* Beat length of the two lowest lateral modes of a 2D slab (index nr in air, width W in um, lam 0.8 um). */
const DFQ3_lpExact = (nr, pol, W) => { const a = DFQ3_slab(nr, 1, 1, W, 0.8, 0, pol), b = DFQ3_slab(nr, 1, 1, W, 0.8, 1, pol); return a && b ? 0.8 / (2 * (a.N - b.N)) : null; };
const DFQ3_lpQuad = (nr, sg, W) => { const We = W + 0.8 / Math.PI * Math.pow(1 / nr, 2 * sg) / Math.sqrt(nr * nr - 1); return 4 * nr * We * We / (3 * 0.8); };

addLesson("thesis", "def", {
level: "Defense", id: "thesis-def-q3", title: "MMI and polarization splitting", short: "Q3. MMI and polarization splitting",
labels: { intu: "Short answer", how: "On the board, step by step", note: "Follow-up they might ask" },
big: String.raw`These are the questions a committee is likely to ask about Section 2.5: what self-imaging is, why \(\beta_\nu\) falls off with \((\nu + 1)^2\) and what the beat length means (Eqs. 2.8 and 2.10), what the effective width is and why \(\sigma\) is swapped for the membrane (Eq. 2.9), how a two-mode section separates TE-like and TM-like light (Eqs. 2.14 and 2.15), why it must be long when the beat lengths are close, why a long MMI is narrowband and sensitive to fabrication, why the thesis takes the indices from the mode solver, and why an inverse-designed splitter can be shorter. Every board builds step by step, and the field maps are computed live from the equations of the chapter.`,
bridge: String.raw`The MMI theory follows Soldano and Pennings 1995, as in the thesis. Worked numbers use round values (\(n_r\) about 3.0, \(\lambda_0 = 800\) nm, widths of a few micrometres for wide sections) and the slab indices of a 160 nm membrane with \(n = 3.5\), computed in the page. They are not thesis results. The last card answers the inverse design question in terms of theory only.`,
cards: [

/* ---------------- Q3.1 ---------------- */
{s: "Q3.1", t: "What is self-imaging?",
intu: String.raw`A multimode section guides several modes, and the input field is a sum of them with weights given by overlap integrals (Eq. 2.11). The modes travel with different propagation constants, so their relative phases change along the section and the field pattern changes with them. At certain lengths the phases line up again and the input field reappears: this is self-imaging (Soldano and Pennings 1995). Relative to the fundamental mode, mode \(\nu\) falls behind by \(\nu(\nu + 2)\pi L/(3L_\pi)\). At \(L = 3L_\pi\) every even mode is back in phase and every odd mode has changed sign, which gives a mirrored image, and at \(6L_\pi\) the input reappears unchanged (Eq. 2.13).`,
eq: String.raw`\[ \Psi(y, L) = \sum_{\nu = 0}^{m - 1} c_\nu\, \psi_\nu(y)\, \exp\!\left[\,j\,\frac{\nu(\nu + 2)\pi}{3 L_\pi}\,L\right] \]\[ L = p\,(3L_\pi), \quad p = 0, 1, 2, \ldots \ \ (\text{direct for even } p, \text{ mirrored for odd } p) \]<div class="eqref">Eqs. (2.12) and (2.13), after Soldano and Pennings 1995, Eqs. (13), (17) and (18)</div>`,
sym: [[String.raw`\(\psi_\nu(y)\)`, String.raw`lateral profile of mode \(\nu\), with \(\nu\) nodes`], [String.raw`\(c_\nu\)`, "weight of mode ν in the input (Eq. 2.11)"], [String.raw`\(L_\pi\)`, "beat length of the two lowest modes"], [String.raw`\(\nu(\nu + 2)\)`, "even for even ν, odd for odd ν"]],
how: [String.raw`Draw the wide section as a long rectangle and the input waveguide meeting it off center.`,
String.raw`Write the input as a sum of the modes of the section. Draw the first three mode shapes across the width: 0, 1 and 2 nodes.`,
String.raw`Each mode has its own \(\beta_\nu\), so the modes slip in phase as they travel: mode \(\nu\) falls behind by \(\nu(\nu + 2)\pi L/(3L_\pi)\).`,
String.raw`Sketch the interference pattern along the section: the light spreads out and gathers again.`,
String.raw`At \(L = 3L_\pi\), \(\nu(\nu + 2)\pi\) is an even multiple of \(\pi\) for even modes and an odd one for odd modes: the odd modes flip sign and the input reappears mirrored about the center line.`,
String.raw`At \(L = 6L_\pi\) every mode is back in phase: a direct copy of the input. Move the cut (slider) to compare any position with the input.`],
say: String.raw`The input excites several modes that travel at different speeds, and where their phases line up again the input reappears. Mirrored at three beat lengths, direct at six.`,
num: String.raw`Single images at \(3L_\pi\) (mirrored) and \(6L_\pi\) (direct). With \(n_r = 3.0\), \(W_e = 2\) µm and \(\lambda_0 = 0.8\) µm, \(L_\pi \approx\) 20 µm, so the first mirrored image sits about <b>60 µm</b> along the section.`,
note: String.raw`<p><b>"What is paired interference?"</b></p><p>If the input sits at \(y = \pm W_e/6\), the modes \(\nu = 2, 5, 8, \ldots\) are not excited, the remaining modes act in pairs, and images already form at \(L = p\,L_\pi\), three times shorter (Soldano and Pennings 1995, Eqs. (31) and (32)).</p>`,
r(fig, ctl) {
  const C = DFQ3_C;
  DFQ3_board(this, fig, ctl, {
    h: 400, sl: [["q31y", "Input position y / W", -0.4, 0.4, 0.01, 0.22, x => x.toFixed(2)], ["q31c", "Cut at L / L<sub>π</sub>", 0, 6.3, 0.05, 3, x => x.toFixed(2)]],
    draw(k, v) {
      const y0 = v.q31y, Lc = v.q31c, mp = DFQ3_mmiMap(y0), X0 = 120, W = 520, Y0 = 40, H = 130, X = x => X0 + x / 6.3 * W, Yy = y => Y0 + (0.5 - y) * H;
      let s = "";
      if (k >= 4) s += mp.url ? `<image href="${mp.url}" x="${X0}" y="${Y0}" width="${W}" height="${H}" preserveAspectRatio="none"/>` : DFQ3_heat(X0, Y0, W, H, mp.I.filter((r, j) => j % 4 === 0).map(r => r.filter((q, i) => i % 6 === 0)));
      s += DFQ3_R(X0, Y0, W, H, "none", C.ink) + DFQ3_R(X0 - 40, Yy(y0) - 9, 40, 18, C.gaas, C.gaasE) + DFQ3_T(X0 - 44, Yy(y0) - 14, "input", { a: "end", fs: 12 });
      s += DFQ3_T(X0, Y0 - 8, "section of width W", { fs: 11, c: C.mute }) + DFQ3_L(X0, Yy(0), X0 + W, Yy(0), C.mute, 1, "4 4");
      if (k >= 2) { const cols = [C.blue, C.orange, C.green]; [0, 1, 2].forEach(n => { const xc = 20 + n * 30; s += DFQ3_L(xc, Y0 + H + 22, xc, Y0 + H + 22 + 90, C.grid, 1) + DFQ3_P(range(-0.5, 0.5, 41).map(y => [xc + 12 * Math.sin((n + 1) * Math.PI * (y + 0.5)), Y0 + H + 22 + (0.5 - y) * 90]), cols[n], 2) + DFQ3_T(xc, Y0 + H + 128, "ψ" + DFQ3_s(String(n)), { a: "middle", fs: 12, c: cols[n] }); }); }
      if (k >= 3) s += DFQ3_T(130, Y0 + H + 44, `mode ν slips by ν(ν + 2)π L / (3L${DFQ3_s("π")})`, { fs: 13, c: C.purple, b: 1 });
      if (k >= 5) s += DFQ3_L(X(3), Y0 - 4, X(3), Y0 + H + 4, C.red, 2, "6 4") + DFQ3_T(X(3), Y0 + H + 18, "3L" + DFQ3_s("π") + ": mirrored", { a: "middle", fs: 12, c: C.red, b: 1 });
      if (k >= 6) s += DFQ3_L(X(6), Y0 - 4, X(6), Y0 + H + 4, C.green, 2, "6 4") + DFQ3_T(X(6) - 4, Y0 + H + 18, "6L" + DFQ3_s("π") + ": direct", { a: "end", fs: 12, c: C.green, b: 1 });
      if (k >= 4) {
        s += DFQ3_L(X(Lc), Y0, X(Lc), Y0 + H, C.amber, 2);
        const PX = y => 140 + (y + 0.5) * 500, PY = q => 385 - q * 105, f = mp.f;
        const prof = f.ys.map((y, i) => f.at(Lc, i) / mp.mx), inp = f.inp.map(q => q * q / Math.max(...f.inp.map(z => z * z)));
        s += DFQ3_L(140, 385, 640, 385, C.ink, 1) + DFQ3_T(640, 400, "y across the section", { a: "end", fs: 11, c: C.mute });
        s += DFQ3_P(f.ys.map((y, i) => [PX(y), PY(inp[i])]), C.mute, 1.6, "5 4") + DFQ3_P(f.ys.map((y, i) => [PX(y), PY(Math.min(1.1, prof[i]))]), C.amber, 2.4);
        s += DFQ3_T(140, 252, `|Ψ|² at L = ${Lc.toFixed(2)} L${DFQ3_s("π")} (amber), input (dashed)`, { fs: 12, c: C.amber });
      }
      return s;
    }
  });
}},

/* ---------------- Q3.2 ---------------- */
{s: "Q3.2", t: String.raw`Why does \(\beta_\nu\) fall off with \((\nu + 1)^2\), and what is the beat length (Eq. 2.10)?`,
intu: String.raw`Across the width, mode \(\nu\) is a standing wave with \(\nu\) nodes, so its lateral wavenumber is \(k_{y\nu} = (\nu + 1)\pi/W_e\), and the total wavenumber fixes \(k_{y\nu}^2 + \beta_\nu^2 = k_0^2 n_r^2\) (Eq. 2.8). In a wide section \(k_{y\nu}\) is small compared with \(k_0 n_r\), so the square root can be expanded to first order: \(\beta_\nu \approx k_0 n_r - k_{y\nu}^2/(2k_0 n_r)\). Since \(k_{y\nu}\) is proportional to \(\nu + 1\), the drop below \(k_0 n_r\) grows with \((\nu + 1)^2\). The two lowest modes then slip by \(\pi\) after the beat length \(L_\pi = \pi/(\beta_0 - \beta_1) \approx 4 n_r W_e^2/(3\lambda_0)\) (Soldano and Pennings 1995).`,
eq: String.raw`\[ k_{y\nu}^2 + \beta_\nu^2 = k_0^2 n_r^2, \qquad k_{y\nu} = \frac{(\nu + 1)\pi}{W_e} \]\[ \beta_\nu \approx k_0 n_r - \frac{(\nu + 1)^2 \pi \lambda_0}{4 n_r W_e^2}, \qquad L_\pi = \frac{\pi}{\beta_0 - \beta_1} \approx \frac{4 n_r W_e^2}{3\lambda_0} \]<div class="eqref">Eqs. (2.8) and (2.10), after Soldano and Pennings 1995, Eqs. (1) and (3) to (6)</div>`,
sym: [[String.raw`\(k_{y\nu}\)`, "lateral wavenumber of mode ν"], [String.raw`\(n_r\)`, "effective index of the unpatterned membrane, used as the core index"], [String.raw`\(W_e\)`, "effective width (Eq. 2.9)"], [String.raw`\(L_\pi\)`, "beat length of modes 0 and 1"]],
how: [String.raw`Draw a quarter circle of radius \(k_0 n_r\) and a right triangle inside it: hypotenuse \(k_0 n_r\), vertical side \(k_{y\nu}\), horizontal side \(\beta_\nu\). That is Eq. (2.8).`,
String.raw`The side walls fix \(k_{y\nu} = (\nu + 1)\pi/W_e\): standing waves with \(\nu\) nodes. Draw the first three, and their points on the circle.`,
String.raw`For a wide section \(k_{y\nu} \ll k_0 n_r\): expand, \(\beta_\nu \approx k_0 n_r - k_{y\nu}^2/(2k_0 n_r)\).`,
String.raw`Insert \(k_{y\nu}\): the drop grows as \((\nu + 1)^2\). Draw the levels \(\beta_0, \beta_1, \beta_2, \beta_3\): the gaps grow in the ratio 3 : 5 : 7.`,
String.raw`The two lowest modes slip by \(\pi\) after \(L_\pi = \pi/(\beta_0 - \beta_1)\). With \(\beta_0 - \beta_1 = 3\pi\lambda_0/(4 n_r W_e^2)\) this gives \(L_\pi \approx 4 n_r W_e^2/(3\lambda_0)\). Drag the width.`],
say: String.raw`The modes are standing waves across the width with \(k_y = (\nu + 1)\pi/W_e\). Expanding \(\beta = \sqrt{k_0^2 n_r^2 - k_y^2}\) for small \(k_y\) gives a drop proportional to \((\nu + 1)^2\), and the beat length of the two lowest modes is \(4 n_r W_e^2/(3\lambda_0)\).`,
num: String.raw`\(n_r = 3.0\), \(\lambda_0 = 0.8\) µm: \(W_e\) = 1 µm gives \(L_\pi \approx\) <b>5 µm</b>, 2 µm gives <b>20 µm</b>, 4 µm gives <b>80 µm</b>. Doubling the width multiplies \(L_\pi\) by four.`,
note: String.raw`<p><b>"Why does mode \(\nu\) fall behind by \(\nu(\nu + 2)\pi L/(3L_\pi)\)?"</b></p><p>Because \(\beta_0 - \beta_\nu\) is proportional to \((\nu + 1)^2 - 1 = \nu(\nu + 2)\), and \(\beta_0 - \beta_1\), proportional to 3, equals \(\pi/L_\pi\). So \(\beta_0 - \beta_\nu = \nu(\nu + 2)\pi/(3L_\pi)\) (Soldano and Pennings 1995, Eq. (7)).</p>`,
r(fig, ctl) {
  const C = DFQ3_C, nr = 3.0, lam = 0.8, cols = [C.blue, C.orange, C.green, C.purple];
  DFQ3_board(this, fig, ctl, {
    h: 400, sl: [["q32w", "Effective width W<sub>e</sub>", 1.5, 6, 0.1, 2, x => x.toFixed(1) + " µm"]],
    draw(k, v) {
      const We = v.q32w, ox = 50, oy = 330, Rr = 260, ex = 0.16 * (2 / We);
      let s = `<path d="M${ox + Rr} ${oy} A${Rr} ${Rr} 0 0 0 ${ox} ${oy - Rr}" fill="none" stroke="${C.ink}" stroke-width="1.6"/>` + DFQ3_L(ox, oy, ox + Rr + 20, oy, C.ink, 1.2) + DFQ3_L(ox, oy, ox, oy - Rr - 20, C.ink, 1.2);
      s += DFQ3_T(ox + Rr + 22, oy + 16, "β", { a: "end", fs: 13 }) + DFQ3_T(ox - 6, oy - Rr - 8, "k" + DFQ3_s("y"), { a: "end", fs: 13 }) + DFQ3_T(ox + 0.72 * Rr, oy - 0.72 * Rr - 8, "radius k" + DFQ3_s("0") + "n" + DFQ3_s("r"), { fs: 12 });
      const pt = n => { const ky = Math.min(0.95, (n + 1) * ex); return [ox + Rr * Math.sqrt(1 - ky * ky), oy - Rr * ky]; };
      const p0 = pt(0); s += DFQ3_L(ox, oy, p0[0], p0[1], C.ink, 1.6) + DFQ3_L(p0[0], p0[1], p0[0], oy, cols[0], 2.4) + DFQ3_L(ox, oy + 3, p0[0], oy + 3, cols[0], 2.4) + DFQ3_T(p0[0] + 6, (p0[1] + oy) / 2, "k" + DFQ3_s("y0"), { fs: 12, c: cols[0] }) + DFQ3_T((ox + p0[0]) / 2, oy + 18, "β" + DFQ3_s("0"), { a: "middle", fs: 12, c: cols[0] });
      s += DFQ3_T(ox + 8, oy + 40, "k" + DFQ3_s("y") + " drawn exaggerated", { fs: 11, c: C.mute });
      if (k >= 2) {
        [1, 2].forEach(n => { const p = pt(n); s += `<circle cx="${p[0]}" cy="${p[1]}" r="5" fill="${cols[n]}"/>` + DFQ3_L(p[0], p[1], p[0], oy, cols[n], 1.4, "4 3"); });
        s += `<circle cx="${p0[0]}" cy="${p0[1]}" r="5" fill="${cols[0]}"/>`;
        [0, 1, 2].forEach(n => { const x0 = 120 + n * 52, y0 = 40; s += DFQ3_R(x0, y0, 40, 60, "none", C.mute) + DFQ3_P(range(0, 1, 31).map(u => [x0 + 20 + 16 * Math.sin((n + 1) * Math.PI * u), y0 + 60 * u]), cols[n], 2) + DFQ3_T(x0 + 20, y0 + 76, "ν = " + n, { a: "middle", fs: 11, c: cols[n] }); });
        s += DFQ3_T(120, 32, `k${DFQ3_s("y")} = (ν + 1)π / W${DFQ3_s("e")}`, { fs: 13, b: 1 });
      }
      if (k >= 3) s += DFQ3_R(370, 24, 296, 40, "#f7f9fc", "#cfd6e0") + DFQ3_T(518, 49, `β${DFQ3_s("ν")} ≈ k${DFQ3_s("0")}n${DFQ3_s("r")} − k${DFQ3_s("yν")}² / (2k${DFQ3_s("0")}n${DFQ3_s("r")})`, { a: "middle", fs: 13, b: 1 });
      if (k >= 4) {
        const top = 100, D = 9 * Math.pow(2 / We, 2);
        s += DFQ3_L(420, top, 620, top, C.ink, 1, "3 3") + DFQ3_T(626, top + 4, "k" + DFQ3_s("0") + "n" + DFQ3_s("r"), { fs: 12 });
        let prev = 0;
        [0, 1, 2, 3].forEach(n => { const y = top + D * (n + 1) * (n + 1); if (y > 330) return; s += DFQ3_L(440, y, 600, y, cols[n], 2.6) + DFQ3_T(436, y + 4, "β" + DFQ3_s(String(n)), { a: "end", fs: 12, c: cols[n] }); if (n > 0 && D * (2 * n + 1) > 12) s += DFQ3_T(606, (y + prev) / 2 + 4, `${2 * n + 1}`, { fs: 12, c: C.mute }); prev = y; });
        s += DFQ3_T(520, 350, "gaps 3 : 5 : 7", { a: "middle", fs: 12, c: C.mute });
      }
      if (k >= 5) { const Lp = 4 * nr * We * We / (3 * lam); s += DFQ3_T(518, 380, `L${DFQ3_s("π")} = π/(β${DFQ3_s("0")} − β${DFQ3_s("1")}) ≈ 4n${DFQ3_s("r")}W${DFQ3_s("e")}²/(3λ${DFQ3_s("0")}) = ${Lp.toFixed(1)} µm`, { a: "middle", fs: 13, b: 1, c: C.purple }); }
      return s;
    },
    ro(v) { const We = v.q32w, k0 = 2 * Math.PI / lam, b = n => Math.sqrt(Math.pow(k0 * nr, 2) - Math.pow((n + 1) * Math.PI / We, 2)); return `<div><span>L<sub>π</sub> quadratic</span><b>${(4 * nr * We * We / (3 * lam)).toFixed(2)} µm</b></div><div><span>L<sub>π</sub> from Eq. (2.8) exactly</span><b>${(Math.PI / (b(0) - b(1))).toFixed(2)} µm</b></div>`; }
  });
}},

/* ---------------- Q3.3 ---------------- */
{s: "Q3.3", t: String.raw`What is the effective width, and why is \(\sigma\) swapped for the membrane (Eq. 2.9)?`,
intu: String.raw`The field of a mode does not end exactly at the side walls but reaches slightly into the air, so the section behaves as if it were a little wider, with the effective width \(W_e\) of Eq. (2.9) (Soldano and Pennings 1995). The extra width carries the factor \((n_c/n_r)^{2\sigma}\), with \(\sigma = 0\) for TE and \(\sigma = 1\) for TM polarization in the two-dimensional problem, where the side walls take the place of the slab surfaces. What counts is whether the main electric field is parallel or normal to the walls. For the membrane the TE-like mode has its main field \(E_y\) normal to the side walls, so it takes \(\sigma = 1\), and the TM-like mode has \(E_z\) parallel to them, so it takes \(\sigma = 0\).`,
eq: String.raw`\[ W_e \approx W_M + \frac{\lambda_0}{\pi} \left(\frac{n_c}{n_r}\right)^{2\sigma} \left(n_r^2 - n_c^2\right)^{-1/2} \]\[ \text{membrane: } \ \sigma = 1 \ \text{(TE-like, } E_y \perp \text{walls)}, \qquad \sigma = 0 \ \text{(TM-like, } E_z \parallel \text{walls)} \]<div class="eqref">Eq. (2.9), after Soldano and Pennings 1995, Eq. (4)</div>`,
sym: [[String.raw`\(W_M\)`, "physical width of the section"], [String.raw`\(W_e\)`, "effective width"], [String.raw`\(\sigma\)`, "0 when the main E field is parallel to the walls, 1 when it is normal"], [String.raw`\(n_r\)`, "slab index of the membrane for that polarization"]],
how: [String.raw`Draw the section from above: a strip of width \(W_M\) with air on both sides, light going along \(x\).`,
String.raw`Draw the lowest lateral mode across it: inside it is a cosine, at the walls it does not drop to zero but continues as a short tail into the air.`,
String.raw`Replace the real strip by a slightly wider ideal box, \(W_e\), on which the cosine goes to zero exactly at the walls. Eq. (2.9) gives the extra width.`,
String.raw`Write the rule of the two-dimensional problem: \(\sigma = 0\) when the field is parallel to the wall (TE), \(\sigma = 1\) when it is normal (TM). The factor \((n_c/n_r)^2\) makes the normal case much smaller.`,
String.raw`For the membrane, mark the field directions: TE-like has \(E_y\) normal to the side walls, so \(\sigma = 1\). TM-like has \(E_z\) parallel to them, so \(\sigma = 0\). Switch the polarization (slider).`],
say: String.raw`The mode leaks a little into the air at the side walls, so the section acts wider by the amount in Eq. (2.9). The exponent depends on whether the field is normal or parallel to the walls, and in the membrane the TE-like field is the one normal to them, so \(\sigma\) is swapped.`,
num: String.raw`Slab indices of a 160 nm membrane with \(n = 3.5\) at 800 nm: about 3.08 (TE-like) and 2.58 (TM-like). Extra width: about <b>9 nm</b> for TE-like (\(\sigma = 1\)) and <b>107 nm</b> for TM-like (\(\sigma = 0\)).`,
note: String.raw`<p><b>"The TE-like \(E_y\) jumps up outside the wall, so why is its extra width the smaller one?"</b></p><p>The extra width is set by the phase of the reflection at the wall, the Goos-Hänchen shift, not by the height of the field outside. For the field normal to the wall that phase carries the factor \((n_c/n_r)^2\), so the effective box grows less, even though \(E_y\) itself jumps up outside.</p>`,
r(fig, ctl) {
  const C = DFQ3_C;
  DFQ3_board(this, fig, ctl, {
    h: 400, sl: [["q33p", "Polarization", 0, 1, 1, 0, x => x ? "TM-like" : "TE-like"], ["q33w", "Width W<sub>M</sub>", 0.3, 1.5, 0.01, 0.6, x => x.toFixed(2) + " µm"]],
    draw(k, v) {
      const tm = v.q33p === 1, W = v.q33w, nr = tm ? DFQ3_NTM : DFQ3_NTE, sg = tm ? 0 : 1, dW = 0.8 / Math.PI * Math.pow(1 / nr, 2 * sg) / Math.sqrt(nr * nr - 1);
      const sc = 150 / 0.6, yc = 210, Y = y => yc - y * sc, top = Y(W / 2), bot = Y(-W / 2), col = tm ? C.orange : C.blue;
      let s = DFQ3_R(30, Math.max(40, top), 400, Math.min(380, bot) - Math.max(40, top), C.gaas, C.gaasE) + DFQ3_T(36, Math.max(40, top) - 6, "side wall", { fs: 11, c: C.mute }) + DFQ3_T(36, Math.min(380, bot) + 16, "side wall", { fs: 11, c: C.mute });
      s += DFQ3_A(40, yc, 120, yc, C.ink, 1.6) + DFQ3_T(124, yc + 4, "x", { i: 1 }) + DFQ3_T(410, Math.max(54, top) + 2, "air", { a: "end", fs: 12, c: C.mute });
      s += DFQ3_A(412, Math.max(42, top), 412, Math.min(378, bot), C.ink, 1.1) + DFQ3_A(412, Math.min(378, bot), 412, Math.max(42, top), C.ink, 1.1) + DFQ3_T(406, yc + 5, "W" + DFQ3_s("M"), { a: "end", fs: 13 });
      if (k >= 2) {
        const md = DFQ3_slab(nr, 1, 1, W, 0.8, 0, tm ? "TE" : "TM"), ys = range(-0.9, 0.9, 241), f = DFQ3_field(md, ys).main, X = a => 470 + 160 * a;
        s += DFQ3_L(470, 40, 470, 380, C.mute, 1) + DFQ3_P(ys.map((y, i) => [X(f[i]), Y(y)]).filter(p => p[1] > 30 && p[1] < 390), col, 2.6);
        s += DFQ3_L(450, top, 660, top, C.gaasE, 1) + DFQ3_L(450, bot, 660, bot, C.gaasE, 1) + DFQ3_T(660, 30, "lateral profile", { a: "end", fs: 12, c: col });
        if (k >= 3) { const We = W + dW, ye = We / 2; s += DFQ3_L(440, Y(ye), 664, Y(ye), C.red, 1.6, "6 4") + DFQ3_L(440, Y(-ye), 664, Y(-ye), C.red, 1.6, "6 4");
          s += DFQ3_P(ys.filter(y => Math.abs(y) <= ye).map(y => [X(Math.cos(Math.PI * y / We)), Y(y)]), C.red, 1.4, "3 3") + DFQ3_T(664, Y(-ye) + 16, `W${DFQ3_s("e")} = W${DFQ3_s("M")} + ${(1000 * dW).toFixed(0)} nm`, { a: "end", fs: 12, c: C.red, b: 1 }); }
      }
      if (k >= 4) s += DFQ3_R(30, 330, 400, 56, "#f7f9fc", "#cfd6e0") + DFQ3_T(40, 352, "2D problem: E ∥ wall → σ = 0,  E ⊥ wall → σ = 1", { fs: 12, b: 1 }) + DFQ3_T(40, 374, `factor (n${DFQ3_s("c")}/n${DFQ3_s("r")})${"<tspan baseline-shift=\"super\" font-size=\"9\">2σ</tspan>"} = ${Math.pow(1 / nr, 2 * sg).toFixed(3)}`, { fs: 12 });
      if (k >= 5) {
        if (!tm) for (let i = 0; i < 4; i++) { const x = 150 + i * 60; s += DFQ3_A(x, yc + 40, x, yc - 40, col, 2.4); }
        else for (let i = 0; i < 4; i++) { const x = 150 + i * 60; s += `<circle cx="${x}" cy="${yc}" r="8" fill="none" stroke="${col}" stroke-width="2"/><circle cx="${x}" cy="${yc}" r="2.5" fill="${col}"/>`; }
        s += DFQ3_T(150, yc + 62, tm ? "E" + DFQ3_s("z") + " out of the page: parallel to the walls, σ = 0" : "E" + DFQ3_s("y") + " across: normal to the walls, σ = 1", { fs: 12, b: 1, c: col });
      }
      return s;
    },
    ro(v) { const e = (nr, sg) => 1000 * 0.8 / Math.PI * Math.pow(1 / nr, 2 * sg) / Math.sqrt(nr * nr - 1); return `<div><span>TE-like: n<sub>r</sub>, extra width</span><b>${DFQ3_NTE.toFixed(2)}, ${e(DFQ3_NTE, 1).toFixed(0)} nm</b></div><div><span>TM-like: n<sub>r</sub>, extra width</span><b>${DFQ3_NTM.toFixed(2)}, ${e(DFQ3_NTM, 0).toFixed(0)} nm</b></div>`; }
  });
}},

/* ---------------- Q3.4 ---------------- */
{s: "Q3.4", t: "How does a two-mode interference section separate TE-like and TM-like light (Eqs. 2.14 and 2.15)?",
intu: String.raw`If only the modes \(\nu = 0\) and \(\nu = 1\) carry power, the field is \(c_0\psi_0 + c_1\psi_1 e^{j\pi x/L_\pi}\) (Eq. 2.14). For an input at \(y = +D\) the even \(\psi_0\) and the odd \(\psi_1\) add near \(+D\) and cancel near \(-D\). After one beat length the odd term has changed sign, so the light sits at \(-D\), and after two it is back at \(+D\). TE-like and TM-like light have different mode indices and so different beat lengths, \(L_\pi = \lambda_0/[2(n_0 - n_1)]\) (Eq. 2.15). With output ports at \(\pm D\), a length \(L = p\,L_\pi^{\mathrm{TE}} = q\,L_\pi^{\mathrm{TM}}\) with \(p\) and \(q\) of opposite parity sends one polarization to the cross port and the other to the bar port (Soldano and Pennings 1995, Sec. V-A).`,
eq: String.raw`\[ \Psi(y, x) = c_0\,\psi_0(y) + c_1\,\psi_1(y)\, e^{\,j\pi x/L_\pi}, \qquad L_\pi = \frac{\lambda_0}{2\,(n_0 - n_1)} \]\[ L = p\,L_\pi^{\mathrm{TE}} = q\,L_\pi^{\mathrm{TM}}, \quad p, q \ \text{of opposite parity} \]<div class="eqref">Eqs. (2.14) and (2.15), Sec. 2.5, Fig. 2.6</div>`,
sym: [[String.raw`\(\psi_0, \psi_1\)`, "even and odd lateral modes of the section"], [String.raw`\(n_0, n_1\)`, "effective indices of the two modes"], [String.raw`\(\pm D\)`, "positions of the input and the two output ports"], [String.raw`\(p, q\)`, "number of crossings for TE-like and TM-like light"]],
how: [String.raw`Draw a section that carries only two modes, the input at \(y = +D\) and two outputs at \(\pm D\).`,
String.raw`Draw \(\psi_0\) (one bump, even) and \(\psi_1\) (one node, odd). At \(+D\) they add, at \(-D\) they cancel: the light starts at \(+D\).`,
String.raw`Along \(x\) the odd term turns by \(e^{j\pi x/L_\pi}\). After one beat length it has flipped sign and the light sits at \(-D\). Draw the zigzag for TE-like light.`,
String.raw`Draw the TM-like zigzag below it with its own, here longer, beat length.`,
String.raw`Cut where TE-like light has crossed an odd number of times and TM-like light an even number: TE-like leaves the cross port, TM-like the bar port. Drag the length and the ratio of the beat lengths.`],
say: String.raw`In a two-mode section the light crosses from one side to the other every beat length. TE-like and TM-like light have different beat lengths, so at a length where one has crossed an odd number of times and the other an even number, they leave through different ports.`,
num: String.raw`Example of Fig. 2.6: \(L_\pi^{\mathrm{TM}} = 1.5\,L_\pi^{\mathrm{TE}}\), so at \(L = 3L_\pi^{\mathrm{TE}} = 2L_\pi^{\mathrm{TM}}\) TE-like light has crossed 3 times (cross port) and TM-like light 2 times (bar port).`,
note: String.raw`<p><b>"Why only two modes?"</b></p><p>With only \(\psi_0\) and \(\psi_1\) the pattern is a clean zigzag with one period, \(2L_\pi\), and the light is fully at \(+D\) or \(-D\) at every multiple of \(L_\pi\). Higher modes would add their own phases, \(\nu(\nu + 2)\pi x/(3L_\pi)\), and blur the crossings away from these lengths.</p>`,
r(fig, ctl) {
  const C = DFQ3_C, cache = {};
  const map = r => cache[r] || (cache[r] = DFQ3_tmiMap(r));
  DFQ3_board(this, fig, ctl, {
    h: 400, sl: [["q34r", "L<sub>π</sub><sup>TM</sup> / L<sub>π</sub><sup>TE</sup>", 1.1, 2, 0.05, 1.5, x => x.toFixed(2)], ["q34L", "Section length L / L<sub>π</sub><sup>TE</sup>", 0.2, 6, 0.05, 3, x => x.toFixed(2)]],
    draw(k, v) {
      const r = v.q34r, L = v.q34L, X0 = 120, W = 520, X = x => X0 + x / 6 * W, H = 90, yT = 60, yM = 210;
      const sect = (y0, lab, col) => DFQ3_R(X0, y0, W, H, "none", C.ink) + DFQ3_T(X0, y0 - 14, lab, { fs: 12, b: 1, c: col }) + DFQ3_T(X0 + W + 4, y0 + H / 4 + 4, "+D", { fs: 11 }) + DFQ3_T(X0 + W + 4, y0 + 3 * H / 4 + 4, "−D", { fs: 11 });
      let s = sect(yT, "TE-like", C.blue) + DFQ3_R(X0 - 36, yT + H / 4 - 7, 36, 14, C.gaas, C.gaasE);
      if (k >= 2) { const xc = 40, yy = yT; s += DFQ3_P(range(-0.5, 0.5, 41).map(y => [xc + 16 * Math.cos(Math.PI * y), yy + (0.5 - y) * H]), C.blue, 2) + DFQ3_P(range(-0.5, 0.5, 41).map(y => [xc + 40 + 16 * Math.sin(2 * Math.PI * y), yy + (0.5 - y) * H]), C.orange, 2);
        s += DFQ3_L(xc, yy, xc, yy + H, C.grid, 1) + DFQ3_L(xc + 40, yy, xc + 40, yy + H, C.grid, 1) + DFQ3_T(xc, yy + H + 14, "ψ" + DFQ3_s("0"), { a: "middle", fs: 12, c: C.blue }) + DFQ3_T(xc + 40, yy + H + 14, "ψ" + DFQ3_s("1"), { a: "middle", fs: 12, c: C.orange }); }
      if (k >= 3) { s += DFQ3_heat(X0, yT, W, H, map(1)); for (let p = 1; p <= 6; p++) s += `<path d="M${X(p) - 5} ${yT - 10} L${X(p) + 5} ${yT - 10} L${X(p)} ${yT - 2} Z" fill="${C.blue}"/>`; s += DFQ3_T(X0 + W, yT - 16, "crossing every L" + DFQ3_s("π") + DFQ3_sp("TE"), { a: "end", fs: 11, c: C.blue }); }
      if (k >= 4) { s += sect(yM, "TM-like", C.orange) + DFQ3_heat(X0, yM, W, H, map(r), [208, 88, 42]); for (let q = 1; q * r <= 6; q++) s += `<path d="M${X(q * r) - 5} ${yM - 10} L${X(q * r) + 5} ${yM - 10} L${X(q * r)} ${yM - 2} Z" fill="${C.orange}"/>`; }
      if (k >= 5) {
        const pT = L, pM = L / r, crossT = Math.pow(Math.sin(Math.PI * pT / 2), 2), crossM = Math.pow(Math.sin(Math.PI * pM / 2), 2);
        s += DFQ3_L(X(L), yT - 4, X(L), yM + H + 4, C.green, 2.4, "6 4");
        s += DFQ3_T(X0, 340, `at L: TE-like crossed ${pT.toFixed(2)} times → cross port ${(100 * crossT).toFixed(0)} %`, { fs: 13, c: C.blue, b: 1 }) + DFQ3_T(X0, 362, `TM-like crossed ${pM.toFixed(2)} times → cross port ${(100 * crossM).toFixed(0)} %`, { fs: 13, c: C.orange, b: 1 });
        const sep = crossT > 0.9 && crossM < 0.1 || crossT < 0.1 && crossM > 0.9;
        s += DFQ3_T(X0, 386, sep ? "split: opposite parity" : "not split here", { fs: 13, b: 1, c: sep ? C.green : C.red });
      }
      return s;
    },
    ro(v, k) { const cT = Math.pow(Math.sin(Math.PI * v.q34L / 2), 2), cM = Math.pow(Math.sin(Math.PI * v.q34L / v.q34r / 2), 2); return `<div><span>TE-like cross port</span><b>${(100 * cT).toFixed(0)} %</b></div><div><span>TM-like cross port</span><b>${(100 * cM).toFixed(0)} %</b></div>`; }
  });
}},

/* ---------------- Q3.5 ---------------- */
{s: "Q3.5", t: "Why must the section be long when the two beat lengths are close?",
intu: String.raw`The section must be a whole number of TE-like beat lengths and at the same time a whole number of TM-like beat lengths, with the two numbers of opposite parity. If the beat lengths are close, many crossings are needed before the two counts differ by one, so the section is long (Sec. 2.5). In phase language, the polarizations separate at the rate \(\pi(1/L_\pi^{\mathrm{TE}} - 1/L_\pi^{\mathrm{TM}})\) per unit length, and one \(\pi\) of separation needs \(L = \lambda_0/(2|\Delta n^{\mathrm{TE}} - \Delta n^{\mathrm{TM}}|)\), where \(\Delta n = n_0 - n_1\). This is a difference of two small index differences, which is why it is small and \(L\) is large.`,
eq: String.raw`\[ L = p\,L_\pi^{\mathrm{TE}} = q\,L_\pi^{\mathrm{TM}}, \qquad |p - q| \ \text{odd} \]\[ \frac{\pi L}{L_\pi^{\mathrm{TE}}} - \frac{\pi L}{L_\pi^{\mathrm{TM}}} = \pi \ \Rightarrow\ L = \frac{\lambda_0}{2\,\left|\Delta n^{\mathrm{TE}} - \Delta n^{\mathrm{TM}}\right|}, \qquad \Delta n = n_0 - n_1 \]<div class="eqref">Sec. 2.5, from Eq. (2.15)</div>`,
sym: [[String.raw`\(\Delta n^{\mathrm{TE}}, \Delta n^{\mathrm{TM}}\)`, "index difference of the two lowest modes, for each polarization"], [String.raw`\(r = L_\pi^{\mathrm{TM}}/L_\pi^{\mathrm{TE}}\)`, "ratio of the beat lengths (slider)"]],
how: [String.raw`Draw two rulers along \(x\): one with a tick every \(L_\pi^{\mathrm{TE}}\), one with a tick every \(L_\pi^{\mathrm{TM}}\).`,
String.raw`Count the crossings: after an odd count the light is in the cross port, after an even count in the bar port.`,
String.raw`Find the first place where a TE tick and a TM tick line up with counts of opposite parity, and plot how well the two polarizations are split along \(x\). The first high peak is the shortest splitter.`,
String.raw`Make the beat lengths closer (slider): the ticks drift apart only slowly, and the first good split moves far out.`,
String.raw`Count it with phases: the separation grows as \(\pi L(1/L_\pi^{\mathrm{TE}} - 1/L_\pi^{\mathrm{TM}})\) and reaches \(\pi\) at \(L = \lambda_0/(2|\Delta n^{\mathrm{TE}} - \Delta n^{\mathrm{TM}}|)\).`],
say: String.raw`The splitter needs a length that is a whole number of beat lengths for both polarizations with counts differing by one. When the beat lengths are close, that takes many beats, a length of \(\lambda_0\) over twice the difference of the two index differences.`,
num: String.raw`\(L\) in units of \(L_\pi^{\mathrm{TE}}\) is \(r/(r - 1)\): <b>3</b> for \(r = 1.5\), <b>11</b> for \(r = 1.1\), <b>21</b> for \(r = 1.05\).<br>Round example: \(\Delta n^{\mathrm{TE}} = 0.12\), \(\Delta n^{\mathrm{TM}} = 0.11\), 800 nm: \(L \approx\) <b>40 µm</b>.`,
note: String.raw`<p><b>"Can you make the beat lengths more different?"</b></p><p>The ratio is set by how differently the two polarizations see the section, through \(n_r\) and \(W_e\) in Eq. (2.10). Changing the width or the thickness moves both beat lengths together, so in a simple section the ratio stays near 1 and the splitter stays long.</p>`,
r(fig, ctl) {
  const C = DFQ3_C;
  DFQ3_board(this, fig, ctl, {
    h: 400, sl: [["q35r", "Ratio r = L<sub>π</sub><sup>TM</sup> / L<sub>π</sub><sup>TE</sup>", 1.03, 2, 0.01, 1.5, x => x.toFixed(2)]],
    draw(k, v) {
      const r = v.q35r, Lest = r / (r - 1), Lmax = Math.max(8, Math.ceil(1.3 * Lest)), X0 = 50, W = 590, X = x => X0 + x / Lmax * W, yT = 80, yM = 150;
      const fom = x => { const a = Math.pow(Math.sin(Math.PI * x / 2), 2), b = Math.pow(Math.sin(Math.PI * x / r / 2), 2); return Math.max(a * (1 - b), b * (1 - a)); };
      let first = null; for (let x = 0.5; x < Lmax; x += 0.002) if (fom(x) > 0.9) { first = x; while (fom(first + 0.002) >= fom(first) && first < Lmax) first += 0.002; break; }
      const ruler = (y, step, col, lab) => { let s = DFQ3_L(X0, y, X0 + W, y, col, 2) + DFQ3_T(X0, y - 16, lab, { fs: 12, b: 1, c: col }); const every = (X(step) - X(0)) < 16 ? 5 : 1; for (let i = 1; i * step <= Lmax; i++) { const odd = i % 2 === 1; s += DFQ3_L(X(i * step), y - 7, X(i * step), y + 7, col, odd ? 2.4 : 1.2); if (k >= 2 && i % every === 0) s += DFQ3_T(X(i * step), y + 22, String(i), { a: "middle", fs: 10, c: odd ? col : C.mute }); } return s; };
      let s = ruler(yT, 1, C.blue, "TE-like: tick every L" + DFQ3_s("π") + DFQ3_sp("TE")) + ruler(yM, r, C.orange, "TM-like: tick every L" + DFQ3_s("π") + DFQ3_sp("TM"));
      if (k >= 2) s += DFQ3_T(660, yT - 16, "odd count: cross port", { a: "end", fs: 11, c: C.mute });
      if (k >= 3) {
        const PY = f => 320 - f * 110, xs = range(0, Lmax, 900);
        s += DFQ3_L(X0, 320, X0 + W, 320, C.ink, 1) + DFQ3_T(X0 + W, 338, "L / L" + DFQ3_s("π") + DFQ3_sp("TE"), { a: "end", fs: 11 }) + DFQ3_T(X0, 200, "how well split (both in their ports)", { fs: 11, c: C.mute });
        s += DFQ3_P(xs.map(x => [X(x), PY(fom(x))]), C.green, 1.8);
        if (first) s += DFQ3_L(X(first), yT - 4, X(first), 320, C.green, 2, "6 4") + DFQ3_T(X(first) + 4, 214, `first split at ${first.toFixed(1)} L${DFQ3_s("π")}${DFQ3_sp("TE")}`, { fs: 12, b: 1, c: C.green });
      }
      if (k >= 4) s += DFQ3_T(X0, 360, `r = ${r.toFixed(2)}: closer beat lengths push the first split out`, { fs: 12, c: C.purple });
      if (k >= 5) s += DFQ3_T(X0, 384, `phase estimate: L = r/(r − 1) L${DFQ3_s("π")}${DFQ3_sp("TE")} = ${Lest.toFixed(1)} L${DFQ3_s("π")}${DFQ3_sp("TE")} = λ₀ / (2|Δn${DFQ3_sp("TE")} − Δn${DFQ3_sp("TM")}|)`, { fs: 12, b: 1, c: C.purple });
      return s;
    },
    ro(v) { const r = v.q35r; return `<div><span>phase estimate r/(r − 1)</span><b>${(r / (r - 1)).toFixed(1)} L<sub>π</sub><sup>TE</sup></b></div>`; }
  });
}},

/* ---------------- Q3.6 ---------------- */
{s: "Q3.6", t: "Why is a long MMI narrowband and sensitive to fabrication?",
intu: String.raw`The beat length depends on the width squared and on the wavelength, \(L_\pi \approx 4 n_r W_e^2/(3\lambda_0)\), so a width error or a change of wavelength changes \(L_\pi\) by a small fraction. A device that uses \(p\) beat lengths accumulates that error \(p\) times: its beat phase \(p\pi\) is off by \(p\pi\,\delta L_\pi/L_\pi\). The light therefore leaves the intended port over a range of wavelengths and widths that shrinks as the length grows. Soldano and Pennings show this for MMI devices in general: the tolerance to the width and to the wavelength shrinks as the length grows (their Eq. (40)). A splitter that needs many beat lengths is therefore narrowband and sensitive to fabrication.`,
eq: String.raw`\[ \frac{\delta L_\pi}{L_\pi} \approx \frac{\delta n_r}{n_r} + 2\,\frac{\delta W_e}{W_e} - \frac{\delta\lambda}{\lambda_0} \]\[ \delta\phi = p\pi\,\frac{\delta L_\pi}{L_\pi}, \qquad P_{\mathrm{cross}} = \sin^2\!\left(\frac{\pi L}{2L_\pi}\right) \]<div class="eqnote">From Eq. (2.10). Soldano and Pennings 1995, Eq. (40), give the tolerances of a general MMI, which shrink as the length grows.</div><div class="eqref">Sec. 2.5</div>`,
sym: [[String.raw`\(p\)`, "number of beat lengths in the device (odd for the cross port)"], [String.raw`\(\delta\phi\)`, "phase error of the beat at the output"], [String.raw`\(P_{\mathrm{cross}}\)`, "power in the cross port of an ideal two-mode section"]],
how: [String.raw`Write \(L_\pi \approx 4 n_r W_e^2/(3\lambda_0)\) and circle \(W_e^2\) and \(1/\lambda_0\).`,
String.raw`Take the relative change: \(\delta L_\pi/L_\pi \approx 2\delta W_e/W_e - \delta\lambda/\lambda_0\), plus \(\delta n_r/n_r\).`,
String.raw`A device of \(p\) beat lengths has the beat phase \(p\pi\), so the error grows to \(p\pi\,\delta L_\pi/L_\pi\). Write it for the slider values.`,
String.raw`Plot the cross-port power against wavelength for one beat length and for \(p\) beat lengths: the long device falls off \(p\) times faster.`,
String.raw`Conclude: the allowed width and wavelength errors shrink as \(1/p\) (Soldano and Pennings, Eq. (40)). A splitter that needs many beats is narrowband and sensitive to fabrication. Add a width error with the slider.`],
say: String.raw`The beat length scales with the width squared over the wavelength, and a device of \(p\) beat lengths multiplies any relative error by \(p\). So the long splitters that need many beats are narrowband and very sensitive to the width.`,
num: String.raw`Ideal two-mode section, cross port above 90 %: bandwidth about \(0.41\,\lambda_0/p\), so about <b>330 nm</b> for \(p = 1\) and <b>36 nm</b> for \(p = 9\) at 800 nm.<br>\(W_e = 2\) µm: a 10 nm width error changes \(L_\pi\) by 1 %, a phase error of \(0.09\pi\) after 9 beats.`,
note: String.raw`<p><b>"Which error is the most critical?"</b></p><p>The width, because it enters squared and because a few tens of nanometres are a realistic fabrication error. Soldano and Pennings reach the same conclusion and recommend keeping MMI devices as short as possible.</p>`,
r(fig, ctl) {
  const C = DFQ3_C, l0 = 800, We = 2000;
  const Pc = (p, lam, dW) => Math.pow(Math.sin((p * Math.PI / 2) * (lam / l0) / Math.pow(1 + dW / We, 2)), 2);
  DFQ3_board(this, fig, ctl, {
    h: 400, sl: [["q36p", "Beat lengths p (odd)", 1, 21, 2, 9], ["q36w", "Width error δW", -40, 40, 1, 0, x => x + " nm"]],
    draw(k, v) {
      const p = v.q36p, dW = v.q36w;
      let s = DFQ3_R(30, 24, 280, 46, "#f7f9fc", "#cfd6e0") + DFQ3_T(140, 53, `L${DFQ3_s("π")} ≈ 4n${DFQ3_s("r")}`, { a: "end", fs: 15, b: 1 }) + DFQ3_T(164, 53, `W${DFQ3_s("e")}²`, { a: "middle", fs: 15, b: 1 }) + DFQ3_T(188, 53, "/ (3", { fs: 15, b: 1 }) + DFQ3_T(232, 53, `λ${DFQ3_s("0")}`, { a: "middle", fs: 15, b: 1 }) + DFQ3_T(246, 53, ")", { fs: 15, b: 1 });
      s += `<ellipse cx="166" cy="48" rx="21" ry="15" fill="none" stroke="${C.red}" stroke-width="1.6"/><ellipse cx="233" cy="48" rx="15" ry="15" fill="none" stroke="${C.red}" stroke-width="1.6"/>`;
      if (k >= 2) s += DFQ3_T(330, 44, `δL${DFQ3_s("π")}/L${DFQ3_s("π")} ≈ 2δW${DFQ3_s("e")}/W${DFQ3_s("e")} − δλ/λ${DFQ3_s("0")}`, { fs: 13, b: 1, c: C.purple });
      if (k >= 3) { const rel = 2 * dW / We; s += DFQ3_T(330, 68, `width error: δφ = pπ · ${(rel).toFixed(3)} = ${(p * rel).toFixed(2)}π`, { fs: 13, c: C.purple }); }
      if (k >= 4) {
        const PX = l => 60 + (l - 760) / 80 * 580, PY = q => 340 - q * 220, ls = range(760, 840, 401);
        s += DFQ3_L(60, 340, 640, 340, C.ink, 1) + DFQ3_L(60, 340, 60, 110, C.ink, 1) + DFQ3_T(350, 376, "wavelength (nm)", { a: "middle", fs: 11 }) + DFQ3_T(66, 108, "cross-port power", { fs: 11 });
        [760, 780, 800, 820, 840].forEach(l => { s += DFQ3_L(PX(l), 336, PX(l), 344, C.ink, 1) + DFQ3_T(PX(l), 358, String(l), { a: "middle", fs: 10, c: C.mute }); });
        s += DFQ3_L(60, PY(0.9), 640, PY(0.9), C.mute, 1, "3 3") + DFQ3_T(636, PY(0.9) - 4, "90 %", { a: "end", fs: 10, c: C.mute });
        s += DFQ3_P(ls.map(l => [PX(l), PY(Pc(1, l, dW))]), C.mute, 2, "6 4") + DFQ3_P(ls.map(l => [PX(l), PY(Pc(p, l, dW))]), C.blue, 2.6);
        s += DFQ3_T(70, 300, "p = 1 (dashed)", { fs: 12, c: C.mute }) + DFQ3_T(70, 318, `p = ${p}`, { fs: 12, c: C.blue, b: 1 });
      }
      if (k >= 5) s += DFQ3_T(636, 300, `90 % band ≈ ${(0.41 * l0 / p).toFixed(0)} nm ∝ 1/p`, { a: "end", fs: 13, b: 1, c: C.green }) + DFQ3_T(636, 318, "Soldano and Pennings, Eq. (40)", { a: "end", fs: 11, c: C.mute });
      return s;
    },
    ro(v) { return `<div><span>cross port at 800 nm</span><b>${(100 * Pc(v.q36p, 800, v.q36w)).toFixed(0)} %</b></div><div><span>90 % bandwidth (no width error)</span><b>${(0.41 * 800 / v.q36p).toFixed(0)} nm</b></div>`; }
  });
}},

/* ---------------- Q3.7 ---------------- */
{s: "Q3.7", t: "Why use the mode solver instead of the quadratic law for narrow sections?",
intu: String.raw`The beat length only needs the two mode indices, \(L_\pi = \lambda_0/[2(n_0 - n_1)]\) (Eq. 2.15), with no approximation. The quadratic law of Eq. (2.10) assumes a wide section, \(k_{y\nu} \ll k_0 n_r\), and a fixed core index \(n_r\) from the unpatterned membrane. In narrow sections such as those of this thesis neither holds: the second mode is close to cutoff, and splitting the problem into a vertical slab and a lateral problem is itself an approximation that gets worse as the side walls matter as much as the top and bottom. So \(n_0\) and \(n_1\) are taken from the mode solver of the full cross-section (Sec. 2.5). On top of this, the splitter length depends on the small difference between the TE-like and TM-like beat lengths, so small errors in each are amplified.`,
eq: String.raw`\[ L_\pi = \frac{\lambda_0}{2\,(n_0 - n_1)} \quad \text{(no approximation, } n_0, n_1 \text{ from the mode solver)} \]\[ L_\pi \approx \frac{4 n_r W_e^2}{3\lambda_0} \quad \text{(needs } k_{y\nu} \ll k_0 n_r \text{)} \]<div class="eqref">Eqs. (2.15) and (2.10), Sec. 2.5</div>`,
sym: [[String.raw`\(n_0, n_1\)`, "effective indices of the two lowest modes of the full cross-section"], [String.raw`\(k_{y\nu} \ll k_0 n_r\)`, "the wide-section assumption behind the quadratic law"]],
how: [String.raw`Write Eq. (2.15): the beat length needs only \(n_0\) and \(n_1\).`,
String.raw`Write the quadratic law and its assumption, a wide section with \(k_{y\nu} \ll k_0 n_r\).`,
String.raw`Plot the error of the quadratic law against the width, here for a two-dimensional slab (exact slab modes against Eq. 2.10). It is small for wide sections and grows as the section narrows.`,
String.raw`Add the real limitation: in a narrow membrane section the vertical and lateral problems do not separate, so even \(n_r\) is not well defined. Only the full cross-section solver gets \(n_0\) and \(n_1\) right.`,
String.raw`Show the amplification: the splitter length depends on \(1/L_\pi^{\mathrm{TE}} - 1/L_\pi^{\mathrm{TM}}\), so a few percent error in each beat length becomes a much larger error in the length. Drag the width.`],
say: String.raw`The quadratic law assumes a wide section, and our sections are narrow, so the second mode is near cutoff and the slab approximation is poor. Since the splitter length depends on a small difference of beat lengths, we take \(n_0\) and \(n_1\) from the full mode solver.`,
num: String.raw`Two-dimensional slab model, TE-like (\(n_r \approx 3.08\), \(\sigma = 1\)): the quadratic law is off by about 3 % at 0.8 µm width, 6 % at 0.6 µm and 14 % at 0.4 µm. The splitter length errs about twice as much, 12 % at 0.6 µm.`,
note: String.raw`<p><b>"Then why show the quadratic law at all?"</b></p><p>It explains the physics: why the levels fall off with \((\nu + 1)^2\), why images form at \(3L_\pi\) and \(6L_\pi\), and why \(L_\pi\) grows with the width squared. For numbers in a narrow section the mode solver is used.</p>`,
r(fig, ctl) {
  const C = DFQ3_C, Ws = range(0.35, 0.9, 56);
  const ex = Ws.map(W => [DFQ3_lpExact(DFQ3_NTE, "TM", W), DFQ3_lpExact(DFQ3_NTM, "TE", W)]), qd = Ws.map(W => [DFQ3_lpQuad(DFQ3_NTE, 1, W), DFQ3_lpQuad(DFQ3_NTM, 0, W)]);
  const Ls = (a, b) => (a && b) ? 1 / Math.abs(1 / a - 1 / b) : null;
  DFQ3_board(this, fig, ctl, {
    h: 400, sl: [["q37w", "Section width W", 0.35, 0.9, 0.01, 0.6, x => x.toFixed(2) + " µm"]],
    draw(k, v) {
      const W = v.q37w;
      let s = DFQ3_R(30, 20, 300, 40, "#eef7f2", "#b9dccb") + DFQ3_T(180, 46, `L${DFQ3_s("π")} = λ${DFQ3_s("0")} / [2(n${DFQ3_s("0")} − n${DFQ3_s("1")})]  exact`, { a: "middle", fs: 13, b: 1, c: C.green });
      if (k >= 2) s += DFQ3_R(350, 20, 316, 40, "#fbf3e6", "#e2c99b") + DFQ3_T(508, 46, `≈ 4n${DFQ3_s("r")}W${DFQ3_s("e")}²/(3λ${DFQ3_s("0")})  if k${DFQ3_s("y")} ≪ k${DFQ3_s("0")}n${DFQ3_s("r")}`, { a: "middle", fs: 13, b: 1, c: C.amber });
      if (k >= 3) {
        const PX = w => 70 + (w - 0.35) / 0.55 * 560, PY = e => 330 - e / 40 * 220;
        s += DFQ3_L(70, 330, 630, 330, C.ink, 1) + DFQ3_L(70, 330, 70, 100, C.ink, 1) + DFQ3_T(350, 366, "section width W (µm)", { a: "middle", fs: 11 }) + DFQ3_T(76, 98, "error of the quadratic law (%)", { fs: 11 });
        [0.4, 0.5, 0.6, 0.7, 0.8, 0.9].forEach(w => { s += DFQ3_L(PX(w), 326, PX(w), 334, C.ink, 1) + DFQ3_T(PX(w), 348, String(w), { a: "middle", fs: 10, c: C.mute }); });
        [0, 10, 20, 30, 40].forEach(e => { s += DFQ3_L(66, PY(e), 74, PY(e), C.ink, 1) + DFQ3_T(62, PY(e) + 4, String(e), { a: "end", fs: 10, c: C.mute }); });
        const err = (j, i) => ex[j][i] ? 100 * Math.abs(qd[j][i] - ex[j][i]) / ex[j][i] : null;
        const line = (i, col) => DFQ3_P(Ws.map((w, j) => err(j, i) != null ? [PX(w), PY(Math.min(40, err(j, i)))] : null).filter(Boolean), col, 2.4);
        s += line(0, C.blue) + line(1, C.orange) + DFQ3_T(626, 140, "blue: TE-like beat length", { a: "end", fs: 11, c: C.blue }) + DFQ3_T(626, 156, "orange: TM-like beat length", { a: "end", fs: 11, c: C.orange });
        if (k >= 5) { const se = Ws.map((w, j) => { const e = Ls(ex[j][0], ex[j][1]), q = Ls(qd[j][0], qd[j][1]); return e ? [PX(w), PY(Math.min(40, 100 * Math.abs(q - e) / e))] : null; }).filter(Boolean); s += DFQ3_P(se, C.purple, 3) + DFQ3_T(626, 172, "purple: splitter length", { a: "end", fs: 11, c: C.purple, b: 1 }); }
        s += DFQ3_L(PX(W), 90, PX(W), 330, C.green, 1.6);
      }
      if (k >= 4) s += DFQ3_T(80, 386, "narrow section: slab plus lateral split fails → full mode solver", { fs: 12, c: C.red, b: 1 });
      if (k >= 5) { const a = DFQ3_lpExact(DFQ3_NTE, "TM", W), b = DFQ3_lpExact(DFQ3_NTM, "TE", W), qa = DFQ3_lpQuad(DFQ3_NTE, 1, W), qb = DFQ3_lpQuad(DFQ3_NTM, 0, W), e = Ls(a, b), q = Ls(qa, qb);
        if (e) s += DFQ3_T(80, 82, `splitter length: ${e.toFixed(1)} µm exact, ${q.toFixed(1)} µm quadratic (${(100 * Math.abs(q - e) / e).toFixed(0)} % off)`, { fs: 12, b: 1, c: C.purple }); }
      return s;
    },
    ro(v) { const W = v.q37w, a = DFQ3_lpExact(DFQ3_NTE, "TM", W), qa = DFQ3_lpQuad(DFQ3_NTE, 1, W), b = DFQ3_lpExact(DFQ3_NTM, "TE", W), qb = DFQ3_lpQuad(DFQ3_NTM, 0, W);
      return `<div><span>TE-like L<sub>π</sub> exact / quadratic</span><b>${a ? a.toFixed(2) : "cut off"} / ${qa.toFixed(2)} µm</b></div><div><span>TE-like error</span><b>${a ? (100 * Math.abs(qa - a) / a).toFixed(1) + " %" : "n/a"}</b></div><div><span>TM-like L<sub>π</sub> exact / quadratic</span><b>${b ? b.toFixed(2) : "cut off"} / ${qb.toFixed(2)} µm</b></div>`; }
  });
}},

/* ---------------- Q3.8 ---------------- */
{s: "Q3.8", t: "Why might an inverse-designed splitter be shorter?",
intu: String.raw`A two-mode splitter separates the polarizations only through the slow drift between two beat lengths, at the rate \((2\pi/\lambda_0)|\Delta n^{\mathrm{TE}} - \Delta n^{\mathrm{TM}}|\), a difference of two small index differences. It does not need to wait for that drift if the structure is not a uniform section. An inverse-designed region changes its permittivity along the propagation direction, so light scatters between many modes inside it, and the optimizer only asks that each polarization ends up in its own output mode. What it can exploit is how differently TE-like and TM-like light see the same structure, and in a membrane that difference, \(n_{\mathrm{eff}}^{\mathrm{TE}} - n_{\mathrm{eff}}^{\mathrm{TM}}\), is large. A phase difference of \(\pi\) can then build up over a length of order \(\lambda_0/[2(n_{\mathrm{eff}}^{\mathrm{TE}} - n_{\mathrm{eff}}^{\mathrm{TM}})]\), a micrometre rather than tens of micrometres.`,
eq: String.raw`\[ L_{\mathrm{TMI}} = \frac{\lambda_0}{2\,\left|\Delta n^{\mathrm{TE}} - \Delta n^{\mathrm{TM}}\right|} \qquad \text{versus} \qquad L \sim \frac{\lambda_0}{2\,\left(n_{\mathrm{eff}}^{\mathrm{TE}} - n_{\mathrm{eff}}^{\mathrm{TM}}\right)} \]<div class="eqnote">The second expression is an order-of-magnitude scale, like the length of a half-wave plate, not a design formula.</div><div class="eqref">From Eq. (2.15). Inverse design: Chapter 3</div>`,
sym: [[String.raw`\(\Delta n = n_0 - n_1\)`, "index difference of the two lowest modes of a section, per polarization"], [String.raw`\(n_{\mathrm{eff}}^{\mathrm{TE}} - n_{\mathrm{eff}}^{\mathrm{TM}}\)`, "difference between the indices of the TE-like and TM-like modes, large in a membrane"]],
how: [String.raw`Draw the two-mode splitter as a long rectangle and write its separation rate, \((2\pi/\lambda_0)|\Delta n^{\mathrm{TE}} - \Delta n^{\mathrm{TM}}|\): a difference of two small differences.`,
String.raw`Draw the inverse-designed region as a short box with a free pattern inside.`,
String.raw`Inside it the permittivity changes along \(x\), so light scatters between many modes. It does not wait for two free modes to drift apart, and only the outputs are specified.`,
String.raw`What it can use is the difference between how TE-like and TM-like light see the structure, of order \(n_{\mathrm{eff}}^{\mathrm{TE}} - n_{\mathrm{eff}}^{\mathrm{TM}}\), which is large in a membrane.`,
String.raw`Compare: one \(\pi\) of separation needs tens of micrometres in the two-mode section and of order a micrometre at the birefringent rate (Play to watch both build up).`],
say: String.raw`A two-mode splitter relies on a small difference between two small index differences, so it is long. An inverse-designed region can use the full difference between the TE-like and TM-like indices, which is much larger, so in principle it can separate the polarizations in about a micrometre.`,
num: String.raw`Round example at 800 nm: \(\Delta n^{\mathrm{TE}} = 0.12\), \(\Delta n^{\mathrm{TM}} = 0.11\) gives \(L_{\mathrm{TMI}} \approx\) <b>40 µm</b>. \(n_{\mathrm{eff}}^{\mathrm{TE}} - n_{\mathrm{eff}}^{\mathrm{TM}} = 0.5\) gives a scale of about <b>0.8 µm</b>.`,
note: String.raw`<p><b>"Is shorter always better, then?"</b></p><p>Shorter avoids the tolerance penalty that grows with length (Q3.6). But an inverse-designed device relies on small features and strong scattering, which bring their own sensitivity to fabrication. That is why Chapter 3 adds the filter, the projection and the fabrication penalties to the optimization.</p>`,
r(fig, ctl) {
  const C = DFQ3_C;
  let seed = 7; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const pix = []; for (let i = 0; i < 14; i++) { const row = []; for (let j = 0; j < 8; j++) row.push(rnd() > 0.45); pix.push(row); }
  DFQ3_board(this, fig, ctl, {
    h: 400, live: true, sl: [["q38a", "Δn<sup>TE</sup> = n<sub>0</sub> − n<sub>1</sub>", 0.05, 0.3, 0.005, 0.12, x => x.toFixed(3)], ["q38b", "Δn<sup>TM</sup>", 0.05, 0.3, 0.005, 0.11, x => x.toFixed(3)], ["q38c", "n<sub>eff</sub><sup>TE</sup> − n<sub>eff</sub><sup>TM</sup>", 0.1, 0.8, 0.01, 0.5, x => x.toFixed(2)]],
    draw(k, v, t) {
      const Lt = 0.8 / (2 * Math.max(1e-3, Math.abs(v.q38a - v.q38b))), Lf = 0.8 / (2 * v.q38c);
      const X0 = 60, W = 580, sc = W / Math.max(Lt, 2 * Lf);
      let s = DFQ3_R(X0, 60, Math.min(W, Lt * sc), 40, C.gaas, C.gaasE) + DFQ3_T(X0, 50, `two-mode section, L = ${Lt.toFixed(1)} µm`, { fs: 12, b: 1, c: C.blue });
      s += DFQ3_T(X0 + 6, 86, `rate (2π/λ${DFQ3_s("0")}) |Δn${DFQ3_sp("TE")} − Δn${DFQ3_sp("TM")}|`, { fs: 12 });
      if (k >= 2) { const bw = Math.max(28, Lf * sc), x0 = X0, y0 = 160, ch = 60 / 8; s += DFQ3_T(X0, 150, `inverse-designed region, scale ${Lf.toFixed(2)} µm (same x scale)`, { fs: 12, b: 1, c: C.green });
        for (let i = 0; i < 14; i++) for (let j = 0; j < 8; j++) if (pix[i][j]) s += DFQ3_R(x0 + i * bw / 14, y0 + j * ch, bw / 14 + 0.3, ch + 0.3, C.gaasE);
        s += DFQ3_R(x0, y0, bw, 60, "none", C.ink); }
      if (k >= 3) s += DFQ3_T(X0 + 120, 186, "permittivity varies along x: light scatters between many modes", { fs: 12, c: C.mute }) + DFQ3_T(X0 + 120, 204, "only the outputs are specified", { fs: 12, c: C.mute });
      if (k >= 4) s += DFQ3_T(X0 + 120, 226, `usable rate ~ (2π/λ${DFQ3_s("0")}) (n${DFQ3_s("eff")}${DFQ3_sp("TE")} − n${DFQ3_s("eff")}${DFQ3_sp("TM")})`, { fs: 13, b: 1, c: C.green });
      if (k >= 5) {
        const d = (t % 6) / 6 * Lt, y = 300, dial = (cx, ph, col, lab) => { const a = Math.min(Math.PI, ph); return `<circle cx="${cx}" cy="${y}" r="34" fill="none" stroke="${C.grid}" stroke-width="2"/><path d="M${cx + 34} ${y} A34 34 0 0 0 ${(cx + 34 * Math.cos(a)).toFixed(1)} ${(y - 34 * Math.sin(a)).toFixed(1)}" fill="none" stroke="${col}" stroke-width="5"/>` + DFQ3_T(cx, y + 54, lab, { a: "middle", fs: 12, c: col }) + DFQ3_T(cx, y + 5, ph >= Math.PI ? "split" : (ph / Math.PI).toFixed(2) + "π", { a: "middle", fs: 12, b: 1, c: col }); };
        s += DFQ3_L(X0, 250, X0 + W, 250, C.grid, 1) + DFQ3_L(X0 + d * sc, 244, X0 + d * sc, 256, C.ink, 2) + DFQ3_T(X0 + Math.min(W - 70, d * sc) + 4, 246, `distance ${d.toFixed(1)} µm`, { fs: 11 });
        s += dial(200, Math.PI * d / Lt, C.blue, "two-mode section") + dial(480, Math.PI * d / Lf, C.green, "birefringent rate");
      }
      return s;
    },
    ro(v) { const Lt = 0.8 / (2 * Math.max(1e-3, Math.abs(v.q38a - v.q38b))), Lf = 0.8 / (2 * v.q38c); return `<div><span>two-mode splitter</span><b>${Lt.toFixed(1)} µm</b></div><div><span>birefringent scale</span><b>${Lf.toFixed(2)} µm</b></div><div><span>ratio</span><b>${(Lt / Lf).toFixed(0)} ×</b></div>`; }
  });
}}

],
summary: String.raw`In a multimode section the input excites several modes, each a standing wave across the width with \(k_y = (\nu + 1)\pi/W_e\), and the quadratic expansion of \(k_y^2 + \beta^2 = k_0^2 n_r^2\) makes \(\beta_\nu\) fall off with \((\nu + 1)^2\). The modes slip in phase and rebuild the input at \(3L_\pi\) (mirrored) and \(6L_\pi\) (direct), with \(L_\pi \approx 4 n_r W_e^2/(3\lambda_0)\). The effective width adds the penetration into the air, with \(\sigma = 1\) for the TE-like mode of the membrane because its field is normal to the side walls. In a two-mode section the light crosses sides every beat length, \(L_\pi = \lambda_0/[2(n_0 - n_1)]\), and a length that is an odd number of beats for one polarization and an even number for the other splits them. Close beat lengths make the section long, and long sections are narrowband and sensitive to the width. In narrow sections the indices come from the mode solver. An inverse-designed region can use the full TE-TM index difference and so can be much shorter.`,
sheet: [
[String.raw`\[ k_{y\nu}^2 + \beta_\nu^2 = k_0^2 n_r^2, \qquad k_{y\nu} = \frac{(\nu + 1)\pi}{W_e} \]`, "Eq. (2.8): lateral standing waves"],
[String.raw`\[ W_e \approx W_M + \frac{\lambda_0}{\pi} \left(\frac{n_c}{n_r}\right)^{2\sigma} \left(n_r^2 - n_c^2\right)^{-1/2} \]`, "Eq. (2.9): effective width, σ = 1 for the TE-like and 0 for the TM-like mode of the membrane"],
[String.raw`\[ \beta_\nu \approx k_0 n_r - \frac{(\nu + 1)^2 \pi \lambda_0}{4 n_r W_e^2}, \qquad L_\pi \approx \frac{4 n_r W_e^2}{3\lambda_0} \]`, "Eq. (2.10): quadratic law and beat length"],
[String.raw`\[ \Psi(y, L) = \sum_{\nu} c_\nu\, \psi_\nu(y)\, \exp\!\left[\,j\,\frac{\nu(\nu + 2)\pi}{3 L_\pi}\,L\right], \qquad L = p\,(3L_\pi) \]`, "Eqs. (2.12) and (2.13): field in the section and single images"],
[String.raw`\[ \Psi(y, x) = c_0\,\psi_0 + c_1\,\psi_1\, e^{\,j\pi x/L_\pi}, \qquad L_\pi = \frac{\lambda_0}{2\,(n_0 - n_1)} \]`, "Eqs. (2.14) and (2.15): two-mode interference"],
[String.raw`\[ L = p\,L_\pi^{\mathrm{TE}} = q\,L_\pi^{\mathrm{TM}} \ (p, q \text{ opposite parity}), \qquad L = \frac{\lambda_0}{2\left|\Delta n^{\mathrm{TE}} - \Delta n^{\mathrm{TM}}\right|} \]`, "Polarization splitting condition and its length scale"]],
sources: ["Soldano and Pennings, J. Lightwave Technol. 13, 615 (1995), Eqs. (1), (3) to (7), (9), (10), (13), (17), (18), (31), (32), Sec. V-A and Eq. (40) (self-imaging, effective width, two-mode interference, tolerances)",
"Tidy3D (Flexcompute), mode solver documentation, version 2.11.2 (effective indices of the full cross-section)",
"Lalau-Keraly et al., Opt. Express 21, 21693 (2013) (adjoint optimization, the basis of the inverse design of Chapter 3, for the context of Q3.8)"]
});

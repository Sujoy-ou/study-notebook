(() => {
/* Small drawing helpers for this lesson only (kept inside this closure so they do not clash with other lessons). */
const CO = "#D85A30", BL = "#378ADD", TL = "#1D9E75", PU = "#7F77DD", AM = "#BA7517";
const fbox = (fig, tex) => { eqWords(fig, tex, '<div class="eqf"></div>'); return fig.querySelector(".eqf"); };
/* plain subscripts written as a_b become real subscripts */
const SUBRE = /_(\{([^}]*)\}|[A-Za-z0-9ν]+)/g;
const subS = s => String(s).replace(SUBRE, (m, a, b) => `<tspan baseline-shift="sub" font-size="9">${b !== undefined ? b : a}</tspan>`);
const subH = s => String(s).replace(SUBRE, (m, a, b) => `<sub>${b !== undefined ? b : a}</sub>`);
const lab = (x, y, s, anchor, cls, col) => `<text class="${cls || "ts"}" x="${(+x).toFixed(1)}" y="${(+y).toFixed(1)}" text-anchor="${anchor || "start"}"${col ? ` style="fill:${col}"` : ""}>${subS(s)}</text>`;
const frame = (x0, y0, w, h) => `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="none" stroke="var(--b)"/>`;
const xticks = (x0, y0, w, h, a, b, vals, fmt) => vals.map(v => lab(x0 + (v - a) / (b - a) * w, y0 + h + 15, fmt ? fmt(v) : v, "middle")).join("");
const yticks = (x0, y0, w, h, a, b, vals, fmt) => vals.map(v => lab(x0 - 6, y0 + h - (v - a) / (b - a) * h + 4, fmt ? fmt(v) : v, "end")).join("");
const ytitle = (x, y, s) => `<text class="ts" x="${x}" y="${y}" text-anchor="middle" transform="rotate(-90 ${x} ${y})">${s}</text>`;
const ax = (x0, y0, w, h, a, b, c, d) => ({ X: v => x0 + (v - a) / (b - a) * w, Y: v => y0 + h - (v - c) / (d - c) * h });
const dot = (x, y, col, r) => `<circle cx="${(+x).toFixed(1)}" cy="${(+y).toFixed(1)}" r="${r || 5}" fill="${col}"/>`;
const vline = (x, y1, y2, col, dash) => `<line x1="${(+x).toFixed(1)}" y1="${y1}" x2="${(+x).toFixed(1)}" y2="${y2}" stroke="${col}" ${dash ? `stroke-dasharray="${dash}"` : ""}/>`;
const hline = (x1, x2, y, col, dash) => `<line x1="${x1}" y1="${(+y).toFixed(1)}" x2="${x2}" y2="${(+y).toFixed(1)}" stroke="${col}" ${dash ? `stroke-dasharray="${dash}"` : ""}/>`;
const ro = items => items.map(([a, b]) => `<div><span>${a}</span><b>${b}</b></div>`).join("");
/* n_eff written for SVG text */
const NE = 'n<tspan baseline-shift="sub" font-size="9">eff</tspan>';
/* textbook slab indices used throughout: n = 3.5 in air, 160 nm, 800 nm */
const NTE = C2.slabN(3.5, 1, 160, 800, 0, "TE"), NTM = C2.slabN(3.5, 1, 160, 800, 0, "TM");
const f2 = (x, d) => (+x).toFixed(d === undefined ? 2 : d);
const sgnArrow = (x, y, vx, vy, col, w, dash) => Math.hypot(vx, vy) < 1.5 ? "" : arrow((x - vx / 2).toFixed(1), (y - vy / 2).toFixed(1), (x + vx / 2).toFixed(1), (y + vy / 2).toFixed(1), col, w, dash);

/* Step-through controls (Back / Next step / Play) with a caption per step.
   draw(k, t, frac) is called on every frame and on every click. */
const STEP = (ctl, caps, draw, opt) => {
  opt = opt || {};
  const n = caps.length, dur = opt.dur || 3.6;
  let k = opt.start || 1, playing = !!opt.play, acc = 0, tt = 0, last = performance.now();
  const w = document.createElement("div");
  w.innerHTML = `<div class="row"><button data-stp="b">Back</button><button data-stp="n">Next step</button><button data-stp="p">Play</button><span class="v" style="margin-left:6px;min-width:80px"></span></div><p class="note" style="min-height:46px;color:var(--t);font-size:14.5px;margin:2px 0 8px"></p>`;
  ctl.insertBefore(w, ctl.firstChild);
  const [bB, bN, bP] = w.querySelectorAll("button"), cnt = w.querySelector("span"), cap = w.querySelector("p");
  const sync = () => { cnt.textContent = `step ${k} of ${n}`; cap.innerHTML = subH(caps[k - 1]); bB.disabled = k === 1; bN.disabled = k === n; bP.textContent = playing ? "Pause" : "Play"; draw(k, tt, Math.min(1, acc / dur)); };
  bB.onclick = () => { k = Math.max(1, k - 1); playing = false; acc = 0; sync(); };
  bN.onclick = () => { k = Math.min(n, k + 1); playing = false; acc = 0; sync(); };
  bP.onclick = () => { playing = !playing; if (playing && k === n) k = 1; acc = 0; sync(); };
  sync();
  anim(t => {
    if (!ctl.isConnected) { stopAnim(); return; }
    const now = performance.now(), dt = Math.min(0.1, (now - last) / 1000); last = now; tt = t;
    if (playing) { acc += dt; if (acc > dur) { acc = 0; if (k < n) k++; else playing = false; sync(); return; } }
    draw(k, t, Math.min(1, acc / dur));
  });
  return { redraw: () => draw(k, tt, 1) };
};
/* Play / Pause for a running animation. draw(tt, on) gets a clock that only advances while playing. */
const RUN = (ctl, draw, play) => {
  let on = play !== false, tt = 0, last = performance.now();
  const w = document.createElement("div"); w.className = "row"; w.innerHTML = `<button data-run="1">${on ? "Pause" : "Play"}</button>`;
  ctl.insertBefore(w, ctl.firstChild);
  const b = w.querySelector("button");
  const set = v => { on = v; b.textContent = on ? "Pause" : "Play"; };
  b.onclick = () => { set(!on); draw(tt, on); };
  anim(t => { if (!ctl.isConnected) { stopAnim(); return; } const now = performance.now(), dt = Math.min(0.1, (now - last) / 1000); last = now; if (on) tt += dt; draw(tt, on); });
  return { redraw: () => draw(tt, on), stop: () => set(false), reset: () => { tt = 0; } };
};
/* Live 1D finite-difference mode solver for a symmetric slab (TE, scalar):
   d2E/dz2 + k0^2 n(z)^2 E = beta^2 E on a grid of spacing h, eigenvalues by Sturm bisection, profiles by inverse iteration. */
const fdSlab = (n, t, lam, h) => {
  const k0 = 2 * Math.PI / lam, Lz = t / 2 + 700, M = Math.round(2 * Lz / h), zs = [], a = [];
  for (let i = 0; i < M; i++) { const z = -Lz + (i + 0.5) * h; zs.push(z); a.push(-2 / (h * h) + k0 * k0 * (Math.abs(z) <= t / 2 ? n * n : 1)); }
  const b = 1 / (h * h);
  const below = x => { let c = 0, d = 1; for (let i = 0; i < M; i++) { d = a[i] - x - (i ? b * b / d : 0); if (d === 0) d = -1e-300; if (d < 0) c++; } return c; };
  const lo0 = k0 * k0, hi0 = k0 * k0 * n * n, nG = M - below(lo0), modes = [];
  for (let m = 0; m < Math.min(nG, 6); m++) {
    let lo = lo0, hi = hi0;
    for (let it = 0; it < 70; it++) { const mid = (lo + hi) / 2; if (M - below(mid) > m) lo = mid; else hi = mid; }
    const ev = (lo + hi) / 2, mu = ev * (1 + 1e-9);
    let v = zs.map((z, i) => 1 + 0.1 * Math.sin(i));
    for (let it = 0; it < 4; it++) {
      const c = new Float64Array(M), dd = new Float64Array(M), w = new Float64Array(M);
      for (let i = 0; i < M; i++) { const di = a[i] - mu - (i ? b * c[i - 1] : 0); c[i] = b / di; dd[i] = (v[i] - (i ? b * dd[i - 1] : 0)) / di; }
      w[M - 1] = dd[M - 1]; for (let i = M - 2; i >= 0; i--) w[i] = dd[i] - c[i] * w[i + 1];
      let mx = 0; w.forEach(x => { if (Math.abs(x) > Math.abs(mx)) mx = x; }); v = Array.from(w, x => x / (mx || 1));
    }
    modes.push({ neff: Math.sqrt(ev) / k0, v });
  }
  return { zs, modes };
};
/* heat map on a canvas from a value function, normalized to its maximum */
const heatCanvas = (cv, W, H, val) => {
  const ctx = cv.getContext("2d"), img = ctx.createImageData(W, H), I = new Float32Array(W * H); let mx = 1e-12;
  for (let i = 0; i < W; i++) for (let j = 0; j < H; j++) { const v = val(i, j); I[j * W + i] = v; if (v > mx) mx = v; }
  for (let k = 0; k < W * H; k++) { const [r, g, b] = C2.heat(Math.sqrt(I[k] / mx)); img.data[k * 4] = r; img.data[k * 4 + 1] = g; img.data[k * 4 + 2] = b; img.data[k * 4 + 3] = 255; }
  return { ctx, img };
};
const marker = (ctx, img, x, H) => { ctx.putImageData(img, 0, 0); ctx.strokeStyle = "#2a8"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); };

addLesson("thesis", "ch2", {
zero: true,
labels: { intu: "What it says", how: "How to read it" },
level: "Start here",
id: "thesis-ch2-l0", title: "The equations of Chapter 2 in words", short: "0. Equations in words",
big: String.raw`Every equation in Chapter 2 is a sentence written in symbols. This lesson reads each one aloud in the order of the final thesis: what every letter stands for, what each part does, what the whole thing says in plain words, and which lesson treats it in depth. Cards 1 to 4 are the guided modes of the membrane (Sec. 2.2): the effective index, the mode solver, mirror symmetry and the field jump of Eq. (2.1). Cards 5 to 8 are the grating coupler (Sec. 2.3, Eqs. 2.2 and 2.3). Cards 9 to 13 are the DBR mirror and the air gap (Sec. 2.4, Eqs. 2.4 to 2.7). Cards 14 to 19 are multimode interference and polarization splitting (Sec. 2.5, Eqs. 2.8 to 2.15). Cards 20 to 22 are the FDTD method (Sec. 2.6, Eq. 2.16). Colored braces under each equation name its parts, and every card has a picture you can move, step through or play.`,
bridge: String.raw`Worked numbers use round textbook values, not thesis results: \(n = 3.5\) for GaAs, air cladding, \(\lambda_0 = 800\) nm, a 160 nm membrane, a 200 nm strip and a 3.5/3.0 mirror stack. Topics from earlier drafts that are not in the final chapter (the analytic slab equation, the effective index method, the Courant limit, numerical dispersion and convergence) are in the part "Chapter 2: Beyond the thesis".`,
cards: [

/* ---------------- 1. Effective index ---------------- */
{s: "1. Effective index", t: String.raw`The effective index and the guiding window: \(\beta = k_0 n_{\mathrm{eff}}\), \(n_{\mathrm{c}} \lt n_{\mathrm{eff}} \lt n\)`,
intu: String.raw`A guided mode bounces along the membrane, but for the whole chapter only one thing about it matters: how fast its phase advances along the guide. That rate is the propagation constant \(\beta\). Divided by the vacuum wavenumber \(k_0\) it becomes one plain number, the effective index \(n_{\mathrm{eff}}\), and the mode behaves like a plane wave in a material of that index. A guided mode must have \(n_{\mathrm{eff}}\) above the cladding index, or it could travel in the air at the same phase speed and would leak away. It must also stay below the core index, because no wave in GaAs can gain more phase per length than \(k_0 n\). Move the thickness and watch the mode slide inside this window: a thin membrane pushes it toward the air value, a thick one toward the GaAs value.`,
eq: String.raw`\[ \beta = k_{0}n_{\mathrm{eff}}, \qquad k_{0} = \frac{2\pi}{\lambda_{0}} \]\[ n_{\mathrm{c}} \lt n_{\mathrm{eff}} \lt n \]<div class="eqref">Sec. 2.2 (\(n_{\mathrm{eff}} = \beta/k_0\) from the mode solver) and Sec. 2.3 (\(\beta = k_0 n_{\mathrm{eff}}\) in the grating). No equation number.</div>`,
sym: [[String.raw`\(\beta\)`, "propagation constant: phase gained per unit length along the guide, in rad/nm"], [String.raw`\(k_{0}\)`, String.raw`vacuum wavenumber \(2\pi/\lambda_0\), 0.00785 nm⁻¹ at 800 nm`], [String.raw`\(\lambda_{0}\)`, "vacuum wavelength"], [String.raw`\(n_{\mathrm{eff}}\)`, "effective index of the mode, a pure number"], [String.raw`\(n_{\mathrm{c}}\)`, "cladding index, air, 1"], [String.raw`\(n\)`, "core index, 3.5 for GaAs in the examples"]],
how: [String.raw`Read it aloud: "beta equals k zero times \(n_{\mathrm{eff}}\), and \(n_{\mathrm{eff}}\) lies between the cladding index and the core index".`, String.raw`\(\beta\) counts radians of phase per nanometre along \(x\). Dividing by \(k_0\) takes the wavelength out, so \(n_{\mathrm{eff}}\) is a pure number that can be compared with material indices.`, String.raw`Lower bound: if \(n_{\mathrm{eff}} \lt n_{\mathrm{c}}\), a plane wave in the air could match the phase along the surface and the mode would radiate. Above \(n_{\mathrm{c}}\) the field outside can only decay.`, String.raw`Upper bound: inside the core the whole wave vector is \(k_0 n\). The part along the guide cannot be longer than the whole.`, String.raw`The guide wavelength is \(\lambda_0/n_{\mathrm{eff}}\). For vertical emission a grating period has to match it (card 6).`, String.raw`Second view: the textbook plot of frequency against \(\beta\). The green air line and the purple GaAs line bound the guided wedge, and a point's \(n_{\mathrm{eff}}\) is its \(\beta\) divided by its frequency.`, "Thesis Sec. 2.2 and Sec. 2.3, no equation number. Treated in Lesson 1 (The suspended membrane) and Lesson 3 (The mode solver)."],
say: String.raw`The effective index is the propagation constant divided by the vacuum wavenumber, \(n_{\mathrm{eff}} = \beta/k_0\). A guided mode has an effective index between the cladding index and the core index.`,
num: String.raw`\(\lambda_0 = 800\) nm: \(k_0 =\) <b>0.00785 nm⁻¹</b>.<br>Textbook slab \(n = 3.5\), \(t = 160\) nm, in air: TE0 \(n_{\mathrm{eff}} \approx\) <b>${f2(NTE)}</b>, guide wavelength \(800/${f2(NTE)} \approx\) <b>${(800 / NTE).toFixed(0)} nm</b>.<br>Window for GaAs in air: \(1 \lt n_{\mathrm{eff}} \lt 3.5\).`,
r(fig, ctl) {
  let view = "simple";
  ctl.innerHTML = `<div class="row"><button data-v="simple">Simple: n<sub>eff</sub> ruler</button><button data-v="book">Textbook: ω versus β plot</button></div>` + sl("t", "Membrane thickness t (nm)", 20, 400, 5, 160) + '<div class="readout" id="ro"></div>';
  const tsA = range(20, 400, 96), te0t = tsA.map(t => C2.slabN(3.5, 1, t, 800, 0, "TE")), te1t = tsA.map(t => C2.slabN(3.5, 1, t, 800, 1, "TE"));
  const box = fbox(fig, String.raw`\underbrace{{\color{#D85A30}{\beta}}}_{\text{phase per length}} = \underbrace{k_{0}}_{2\pi/\lambda_0}\,\underbrace{{\color{#378ADD}{n_{\mathrm{eff}}}}}_{\text{effective index}}, \qquad \underbrace{{\color{#1D9E75}{n_{\mathrm{c}}}}}_{\text{cladding}} \lt {\color{#378ADD}{n_{\mathrm{eff}}}} \lt \underbrace{{\color{#7F77DD}{n}}}_{\text{core}}`);
  const us = range(0.004, 0.5, 125), te0 = us.map(u => C2.slabN(3.5, 1, u, 1, 0, "TE")), te1 = us.map(u => C2.slabN(3.5, 1, u, 1, 1, "TE"));
  const x0 = 80, y0 = 20, w = 540, h = 180, A = ax(x0, y0, w, h, 0, 1.8, 0, 0.5);
  const simple = t => {
    const N = C2.slabN(3.5, 1, t, 800, 0, "TE"), N1 = C2.slabN(3.5, 1, t, 800, 1, "TE");
    const rx0 = 60, rx1 = 640, R = v => rx0 + (v - 0.6) / 3.2 * (rx1 - rx0), ry = 70;
    let s = `<text class="th" x="20" y="22">Where the mode sits: one axis, ${NE}</text>`;
    s += `<rect x="${R(0.6)}" y="${ry - 16}" width="${R(1) - R(0.6)}" height="32" fill="${CO}" fill-opacity="0.12"/><rect x="${R(1)}" y="${ry - 16}" width="${R(3.5) - R(1)}" height="32" fill="${TL}" fill-opacity="0.15"/><rect x="${R(3.5)}" y="${ry - 16}" width="${R(3.8) - R(3.5)}" height="32" fill="var(--b)" fill-opacity="0.5"/>`;
    s += `<line x1="${R(0.6)}" x2="${R(3.8)}" y1="${ry}" y2="${ry}" stroke="var(--t)"/>`;
    [1, 1.5, 2, 2.5, 3, 3.5].forEach(v => s += `<line x1="${R(v)}" x2="${R(v)}" y1="${ry - 4}" y2="${ry + 4}" stroke="var(--t)"/>` + lab(R(v), ry + 30, v.toFixed(1), "middle"));
    s += vline(R(1), ry - 24, ry + 18, TL) + vline(R(3.5), ry - 24, ry + 18, PU);
    s += lab(R(0.8), ry - 22, "leaks", "middle", "ts", CO) + lab(R(1), ry + 46, "air (1)", "middle", "ts", TL) + lab(R(3.5), ry + 46, "GaAs (3.5)", "middle", "ts", PU) + lab((R(1) + R(3.5)) / 2, ry - 22, "guided window: the mode is trapped", "middle", "ts", TL) + lab(R(3.65), ry - 22, "impossible", "middle", "ts");
    s += dot(R(N), ry, CO, 8) + lab(R(N), ry + 62, "TE0 = " + N.toFixed(3), "middle", "th", CO);
    if (N1) s += `<circle cx="${R(N1)}" cy="${ry}" r="6" fill="none" stroke="${CO}" stroke-width="2"/>` + lab(R(N1), ry + 62, "TE1 = " + N1.toFixed(2), "middle", "ts", CO);
    const px = 80, py = 150, pw = 540, ph = 120, B = ax(px, py, pw, ph, 20, 400, 0.8, 3.6);
    s += frame(px, py, pw, ph) + hline(px, px + pw, B.Y(1), TL) + hline(px, px + pw, B.Y(3.5), PU);
    s += plot(px, py, pw, ph, tsA, te0t, 20, 400, 0.8, 3.6, CO, 2.5) + plot(px, py, pw, ph, tsA.map((v, i) => te1t[i] ? v : NaN), te1t.map(v => v || NaN), 20, 400, 0.8, 3.6, CO, 1.5, "5 3");
    s += vline(B.X(t), py, py + ph, "var(--t)", "3 3") + dot(B.X(t), B.Y(N), CO, 6);
    s += lab(px + 6, B.Y(3.5) - 4, "GaAs limit 3.5", "start", "ts", PU) + lab(px + pw - 6, B.Y(1) - 6, "air limit 1", "end", "ts", TL) + lab(B.X(75), B.Y(2.75), "TE0", "end", "ts", CO) + lab(B.X(330), B.Y(2.25), "TE1 (dashed)", "start", "ts", CO);
    s += xticks(px, py, pw, ph, 20, 400, [50, 100, 160, 200, 300, 400]) + yticks(px, py, pw, ph, 0.8, 3.6, [1, 2, 3, 3.5]);
    s += lab(px + pw / 2, py + ph + 30, "membrane thickness t (nm), 800 nm light, analytic slab", "middle") + ytitle(30, py + ph / 2, NE);
    s += lab(px + 6, py + ph + 46, "thinner: the dot slides toward 1 and the field spreads into the air. Thicker: toward 3.5.", "start", "ts");
    return s;
  };
  const rd = N => ro([["TE0 effective index n<sub>eff</sub>", N.toFixed(3)], ["β = k₀ n<sub>eff</sub>", (2 * Math.PI / 0.8 * N).toFixed(1) + " rad/µm"], ["guide wavelength λ₀/n<sub>eff</sub>", (800 / N).toFixed(0) + " nm"]]);
  const draw = () => {
    ctl.querySelectorAll("button[data-v]").forEach(b => b.classList.toggle("on", b.dataset.v === view));
    const t = +$("t").value; $("tv").textContent = t + " nm";
    if (view === "simple") { box.innerHTML = svg(330, simple(t)); $("ro").innerHTML = rd(C2.slabN(3.5, 1, t, 800, 0, "TE")); return; }
    let s = `<polygon points="${A.X(0)},${A.Y(0)} ${A.X(0.5)},${A.Y(0.5)} ${A.X(1.75)},${A.Y(0.5)}" fill="${TL}" fill-opacity="0.12"/>` + frame(x0, y0, w, h);
    s += `<line x1="${A.X(0)}" y1="${A.Y(0)}" x2="${A.X(0.5)}" y2="${A.Y(0.5)}" stroke="${TL}" stroke-width="2"/><line x1="${A.X(0)}" y1="${A.Y(0)}" x2="${A.X(1.75)}" y2="${A.Y(0.5)}" stroke="${PU}" stroke-width="2"/>`;
    s += plot(x0, y0, w, h, us.map((u, i) => te0[i] * u), us, 0, 1.8, 0, 0.5, CO, 2.5);
    s += plot(x0, y0, w, h, us.map((u, i) => te1[i] ? te1[i] * u : NaN), us.map((u, i) => te1[i] ? u : NaN), 0, 1.8, 0, 0.5, CO, 1.5, "5 3");
    s += lab(A.X(0.04), A.Y(0.44), "light cone:", "start", "ts", TL) + lab(A.X(0.04), A.Y(0.40), "leaks into air", "start", "ts", TL);
    s += lab(A.X(0.5) + 4, A.Y(0.47), "air line ω = cβ", "start", "ts", TL) + lab(A.X(1.42), A.Y(0.31), "GaAs line ω = cβ/3.5", "start", "ts", PU);
    s += lab(A.X(0.95), A.Y(0.43), "guided window", "middle", "th") + lab(A.X(1.25), A.Y(0.12), "TE0", "start", "t", CO) + lab(A.X(0.62), A.Y(0.36), "TE1", "start", "ts", CO);
    s += xticks(x0, y0, w, h, 0, 1.8, [0, 0.3, 0.6, 0.9, 1.2, 1.5, 1.8]) + yticks(x0, y0, w, h, 0, 0.5, [0, 0.1, 0.2, 0.3, 0.4, 0.5]);
    s += lab(x0 + w / 2, y0 + h + 32, "propagation constant βt/2π", "middle") + ytitle(30, y0 + h / 2, "frequency t/λ₀");
    const u = t / 800, N = C2.slabN(3.5, 1, u, 1, 0, "TE");
    s += hline(x0, A.X(N * u), A.Y(u), "var(--t)", "3 3") + dot(A.X(N * u), A.Y(u), CO, 6);
    box.innerHTML = svg(240, s);
    $("ro").innerHTML = rd(N);
  };
  ctl.querySelectorAll("button[data-v]").forEach(b => b.onclick = () => { view = b.dataset.v; draw(); });
  $("t").oninput = draw; draw();
}},

/* ---------------- 2. The mode solver ---------------- */
{s: "2. The mode solver", t: String.raw`The mode solver: fields as \(e^{i\beta x}\) and an eigenvalue problem for \(n_{\mathrm{eff}} = \beta/k_0\)`,
intu: String.raw`A waveguide that does not change along \(x\) has modes that keep their shape as they travel. Each mode is a fixed pattern on the cross-section times a phase that advances as \(e^{i\beta x}\). Put that form into Maxwell's equations and every derivative along \(x\) becomes the factor \(i\beta\). What is left is an equation on the cross-section alone, with \(\beta\) as an unknown number. Such an equation has solutions only for special values of that number, the way a guitar string rings only at special notes. That is an eigenvalue problem. Tidy3D samples the transverse electric field on a finite-difference grid, so the equation becomes a matrix, and each eigenvalue of the matrix gives one mode with \(n_{\mathrm{eff}} = \beta/k_0\). Step through the board picture. The last step solves the one-dimensional version, a slab, live in the page.`,
eq: String.raw`\[ \mathbf{E}(x, y, z) = \mathbf{E}(y, z)\,e^{i\beta x} \]\[ n_{\mathrm{eff}} = \frac{\beta}{k_{0}}, \qquad k_{0} = \frac{2\pi}{\lambda_{0}} \]<div class="eqref">Sec. 2.2, the Tidy3D mode solver. No equation number.</div>`,
sym: [[String.raw`\(\mathbf{E}(x, y, z)\)`, "the full electric field of one mode"], [String.raw`\(\mathbf{E}(y, z)\)`, "its shape on the cross-section, the same at every x"], [String.raw`\(e^{i\beta x}\)`, String.raw`phase factor that advances by \(\beta\) per unit length along the guide`], [String.raw`\(x\)`, "propagation direction"], [String.raw`\(y, z\)`, "across the strip (width) and across the membrane (thickness)"], [String.raw`\(\beta\)`, "propagation constant, the unknown of the eigenvalue problem"], [String.raw`\(n_{\mathrm{eff}}\)`, "effective index, one value per eigenvalue"], [String.raw`\(k_{0}\)`, String.raw`vacuum wavenumber \(2\pi/\lambda_0\)`]],
how: [String.raw`Read it aloud: "the field is a shape on the cross-section times e to the i beta x, and the effective index is beta over k zero".`, String.raw`With the \(e^{i\beta x}\) form, \(\partial/\partial x\) acting on any field gives \(i\beta\) times that field, so the three-dimensional problem becomes a two-dimensional one on the cross-section.`, "On a grid the cross-section field is a long list of numbers. The derivatives along y and z become differences between neighbours, and Maxwell's equations become a matrix acting on that list.", "Matrix times field equals a number times the same field. The numbers are eigenvalues, the fields eigenvectors, and each pair is one mode. The solver returns them sorted by effective index.", String.raw`The live slab in step 4 uses the scalar TE form \(\mathrm{d}^2E_y/\mathrm{d}z^2 + k_0^2 n(z)^2 E_y = \beta^2 E_y\) on a 4 nm grid. It is a one-dimensional illustration of the same idea, not the solver used in the thesis.`, "Thesis Sec. 2.2, no equation number. Treated in Lesson 3 (The mode solver)."],
say: String.raw`The mode solver assumes the fields vary as \(e^{i\beta x}\) along a waveguide that does not change along \(x\). Maxwell's equations then become an eigenvalue problem on the cross-section, and each eigenvalue gives one mode with effective index \(\beta/k_0\).`,
num: String.raw`Live finite-difference slab, \(n = 3.5\), \(t = 160\) nm, 800 nm, 4 nm grid: TE0 <b>3.08</b>, TE1 <b>1.61</b>, the same as the analytic slab to three digits.<br>A 2D cross-section of 2 µm by 2 µm on a 10 nm grid has 40 000 points per field component, so the matrix is large but sparse.`,
r(fig, ctl) {
  ctl.innerHTML = sl("t", "Slab thickness, step 4 (nm)", 60, 400, 5, 160) + '<div class="readout" id="ro"></div>';
  const box = fbox(fig, String.raw`\underbrace{{\color{#D85A30}{\mathbf{E}(x, y, z)}}}_{\text{full field}} = \underbrace{{\color{#378ADD}{\mathbf{E}(y, z)}}}_{\text{shape on the cross-section}}\;\underbrace{e^{i{\color{#1D9E75}{\beta}}x}}_{\text{phase along } x}, \qquad \underbrace{{\color{#7F77DD}{n_{\mathrm{eff}}}}}_{\text{one per eigenvalue}} = \frac{{\color{#1D9E75}{\beta}}}{k_{0}}`);
  let sol = null, tSol = -1;
  const solve = t => { if (t !== tSol) { sol = fdSlab(3.5, t, 800, 4); tSol = t; } return sol; };
  const caps = ["Step 1. The cross-section: a GaAs strip in air. It does not change along x, the direction the light travels (out of the page).",
    "Step 2. Guess the form of a mode: a fixed shape on the cross-section times a phase that advances as e^(iβx). Every x derivative turns into iβ.",
    "Step 3. Sample the transverse field on a finite-difference grid. Maxwell's equations become a matrix acting on the samples: matrix times field equals a number times the same field.",
    "Step 4. Only special numbers work. Each eigenvalue gives one mode with n_eff = β/k₀. Here the one-dimensional version, a slab, is solved live: dots are eigenvalues, curves are eigenvectors."];
  const MC = [CO, BL, TL, PU, AM, CO];
  const st = STEP(ctl, caps, (k, tm) => {
    const t = +$("t").value; $("tv").textContent = t + " nm";
    let s = `<rect x="20" y="30" width="280" height="180" fill="none" stroke="var(--b)"/>` + lab(160, 22, "cross-section (to scale)", "middle", "th");
    if (k >= 3) { for (let x = 28; x < 300; x += 8) s += vline(x, 30, 210, "var(--line)"); for (let y = 38; y < 210; y += 8) s += hline(20, 300, y, "var(--line)"); }
    s += `<rect x="100" y="72" width="120" height="96" fill="${BL}" fill-opacity="${k >= 3 ? 0.35 : 0.25}" stroke="var(--t)" stroke-width="0.8"/>` + lab(160, 124, "GaAs", "middle", "t") + lab(30, 46, "air", "start") + lab(160, 186, "200 nm × 160 nm", "middle", "ts");
    s += arrow(36, 200, 70, 200, "var(--t)", 1) + lab(74, 204, "y", "start") + arrow(36, 200, 36, 168, "var(--t)", 1) + lab(40, 166, "z", "start") + `<circle cx="36" cy="200" r="5" fill="none" stroke="var(--t)"/><circle cx="36" cy="200" r="1.6" fill="var(--t)"/>` + lab(46, 218, "x out of page", "start", "ts");
    if (k === 1) s += lab(340, 70, "The waveguide is the same at every x.", "start", "t") + lab(340, 94, "So its modes keep their shape", "start") + lab(340, 112, "while they travel along x.", "start") + lab(340, 146, "The unknown of a mode: its β,", "start") + lab(340, 164, "the phase gained per length.", "start");
    if (k === 2) {
      s += lab(500, 22, "side view: the phase advances along x", "middle", "th");
      s += `<rect x="340" y="96" width="320" height="40" fill="${BL}" fill-opacity="0.2"/>` + lab(664, 92, "GaAs", "end", "ts");
      let d = ""; for (let x = 340; x <= 660; x += 3) d += (d ? "L" : "M") + x + " " + (116 - 15 * Math.cos(2 * Math.PI * ((x - 340) / 42 - 0.5 * tm))).toFixed(1);
      s += `<path d="${d}" fill="none" stroke="${CO}" stroke-width="2.5"/>`;
      for (let j = -1; j < 9; j++) { const x = 340 + 42 * (j + (0.5 * tm) % 1); if (x > 340 && x < 660) s += vline(x, 60, 150, CO, "2 3"); }
      s += arrow(382, 170, 424, 170, "var(--t)", 1, "", true) + lab(403, 188, "λ₀/n_eff between crests", "middle", "ts");
      s += lab(500, 214, "Re[E(y, z) e^(iβx)] at the mid-plane, moving", "middle", "ts", CO);
    }
    if (k === 3) {
      s += lab(500, 22, "the grid turns Maxwell into a matrix (schematic)", "middle", "th");
      s += `<rect x="340" y="50" width="130" height="130" fill="none" stroke="var(--t)"/>`;
      for (let i = 0; i < 13; i++) for (const o of [-3, -1, 0, 1, 3]) { const j = i + o; if (j < 0 || j > 12) continue; s += `<rect x="${342 + j * 9.8}" y="${52 + i * 9.8}" width="8" height="8" fill="${o ? BL : PU}" fill-opacity="${o ? 0.45 : 0.75}"/>`; }
      s += lab(405, 198, "matrix: neighbours only", "middle", "ts");
      s += `<rect x="484" y="50" width="16" height="130" fill="${CO}" fill-opacity="0.35" stroke="${CO}"/>` + lab(492, 198, "field", "middle", "ts", CO);
      s += lab(522, 122, "=", "middle", "t") + lab(560, 122, "number", "middle", "t", TL) + lab(560, 140, "(eigenvalue)", "middle", "ts", TL);
      s += `<rect x="612" y="50" width="16" height="130" fill="${CO}" fill-opacity="0.35" stroke="${CO}"/>` + lab(620, 198, "same field", "middle", "ts", CO);
    }
    let rdv = [["grid points across the slab", "(step 4)"]];
    if (k === 4) {
      const S = solve(t), Z = z => 120 - z / 900 * 90;
      s += lab(500, 22, "live slab: eigenvectors E_y(z)", "middle", "th");
      s += `<rect x="340" y="${Z(t / 2)}" width="320" height="${Z(-t / 2) - Z(t / 2)}" fill="${BL}" fill-opacity="0.15"/>`;
      S.modes.forEach((m, i) => { const xc = 380 + i * 66; s += vline(xc, 30, 210, "var(--line)") + plot(xc - 28, 30, 56, 180, m.v, S.zs, -1.05, 1.05, -900, 900, MC[i], 2.2) + lab(xc, 224, "TE" + i, "middle", "ts", MC[i]); });
      const R = v => 60 + (v - 1) / 2.5 * 560, ry = 262;
      s += `<line x1="${R(1)}" x2="${R(3.5)}" y1="${ry}" y2="${ry}" stroke="var(--t)"/>`;
      [1, 1.5, 2, 2.5, 3, 3.5].forEach(v => s += vline(R(v), ry - 4, ry + 4, "var(--t)") + lab(R(v), ry + 18, v.toFixed(1), "middle"));
      S.modes.forEach((m, i) => s += dot(R(m.neff), ry, MC[i], 7) + lab(R(m.neff), ry - 12, m.neff.toFixed(3), "middle", "ts", MC[i]));
      s += lab(R(1), ry - 12, "air", "middle", "ts", TL) + lab(R(3.5), ry - 12, "GaAs", "middle", "ts", PU) + lab(340, 296, "eigenvalues on the " + NE + " axis", "middle", "ts");
      const an = C2.slabN(3.5, 1, t, 800, 0, "TE");
      rdv = [["grid points across the slab", S.zs.length], ["guided eigenvalues found", S.modes.length], ["TE0 from the matrix", S.modes[0] ? S.modes[0].neff.toFixed(4) : "none"], ["TE0 analytic (check)", an ? an.toFixed(4) : "none"]];
    }
    box.innerHTML = svg(k === 4 ? 304 : 232, s);
    $("ro").innerHTML = ro(rdv);
  });
  $("t").oninput = st.redraw;
}},

/* ---------------- 3. Mirror symmetry ---------------- */
{s: "3. Mirror symmetry", t: String.raw`Mirror symmetry \(z \to -z\): even and odd modes, TE-like and TM-like`,
intu: String.raw`The membrane has air above and below, so it looks the same in a mirror placed at its mid-plane \(z = 0\). A mirror moves every point from \(z\) to \(-z\) and turns every arrow of \(\mathbf{E}\) over: the parts along \(x\) and \(y\) stay, the part along \(z\) flips. Because the structure does not change, a mode seen in the mirror must be the same mode again, either exactly (even, \(\sigma = +1\)) or with every arrow reversed (odd, \(\sigma = -1\)). Now look at the mid-plane itself, where a point is its own mirror image. For an even mode \(E_z\) must equal \(-E_z\) there, so \(E_z = 0\) and the field lies in the plane: purely TE. For an odd mode \(E_x\) and \(E_y\) must vanish there, so the field points straight along \(z\): purely TM. Away from the mid-plane both families have all components, which is why the fundamental even and odd modes are called TE-like and TM-like.`,
eq: String.raw`\[ z \to -z: \qquad (E_{x}, E_{y}, E_{z}) \to (E_{x}, E_{y}, -E_{z}) \]\[ \text{even: } \sigma = +1, \qquad \text{odd: } \sigma = -1 \]\[ z = 0: \quad \text{even} \Rightarrow E_{z} = 0 \ (\text{TE}), \qquad \text{odd} \Rightarrow E_{x} = E_{y} = 0 \ (\text{TM}) \]<div class="eqref">Sec. 2.2, Johnson et al. 1999, p. 5753. No equation number.</div>`,
sym: [[String.raw`\(z \to -z\)`, "the mirror: reflect every point through the mid-plane z = 0"], [String.raw`\(E_{x}, E_{y}\)`, "components parallel to the mirror plane, kept by the mirror"], [String.raw`\(E_{z}\)`, "component normal to the mirror plane, flipped by the mirror"], [String.raw`\(\sigma\)`, "parity of the mode: +1 even, −1 odd"], ["TE", "electric field in the plane of the membrane"], ["TM", "electric field normal to the membrane"], ["TE-like, TM-like", "the fundamental even and the fundamental odd mode"]],
how: [String.raw`Read it aloud: "under z to minus z, E x and E y stay and E z flips. A mode is even, sigma plus one, or odd, sigma minus one. On the mid-plane an even mode has no E z and an odd mode has only E z".`, String.raw`To mirror a field, take the arrow found at the mirror point \(-z\) and flip its \(z\) part. The result is the mirrored mode.`, String.raw`The structure is unchanged by the mirror, so the mirrored mode solves the same equations with the same \(\beta\). A mode then has to be its own mirror image times a number, and mirroring twice gives back the original, so the number is \(+1\) or \(-1\).`, String.raw`On \(z = 0\) the point and its mirror coincide. Even: \(E_z = -E_z\), so \(E_z = 0\). Odd: \(E_x = -E_x\) and \(E_y = -E_y\), so both vanish.`, String.raw`A trap to avoid: the TM-like mode is odd as a vector field, yet its main component \(E_z\) is a symmetric function of \(z\). The move to \(-z\) and the flip of the arrow together give the sign \(-1\).`, "Thesis Sec. 2.2, no equation number (Johnson 1999). Treated in Lesson 2 (Symmetry, TE-like and TM-like)."],
say: "The membrane is symmetric under z to minus z, so every mode is even or odd. On the mid-plane an even mode is purely TE and an odd mode purely TM, so the fundamental even and odd modes are called TE-like and TM-like.",
num: String.raw`Only two values: <b>+1</b> or <b>−1</b>.<br>Textbook slab, \(n = 3.5\) in air, 160 nm, 800 nm: TE-like (even) \(n_{\mathrm{eff}} \approx\) <b>${f2(NTE)}</b>, TM-like (odd) \(n_{\mathrm{eff}} \approx\) <b>${f2(NTM)}</b>.<br>A substrate on one side breaks the symmetry, and then the two families can mix.`,
r(fig, ctl) {
  const box = fbox(fig, String.raw`\underbrace{z \to -z}_{\text{mirror}}: \quad (E_{x}, E_{y}, {\color{#D85A30}{E_{z}}}) \to (E_{x}, E_{y}, {\color{#D85A30}{-E_{z}}}), \qquad \underbrace{{\color{#378ADD}{\sigma = +1}}}_{\text{even, TE-like}} \quad \underbrace{{\color{#D85A30}{\sigma = -1}}}_{\text{odd, TM-like}}`);
  const zs = [-150, -100, -50, 0, 50, 100, 150], cols = [-96, -32, 32, 96], Y = z => 150 - z * 0.62;
  const Ae = C2.slabProfile(3.5, 1, 160, 800, 0, "TE", NTE, zs).main, Ao = C2.slabProfile(3.5, 1, 160, 800, 0, "TM", NTM, zs).main;
  const L = 30;
  const evenV = (i, c) => [L * Ae[i], -L * 0.4 * Ae[i] * (zs[i] / 150) * (c / 96)];    // (screen dx, screen dy) : Ey along +x screen, Ez up = -y screen
  const oddV = (i, c) => [L * 0.4 * Ao[i] * (zs[i] / 150) * (c / 96), -L * Ao[i]];
  const mir = ([dx, dy]) => [dx, -dy];   // mirror flips the z part of the arrow
  const caps = ["Step 1. The membrane with air above and below. The dashed line is the mirror plane z = 0. Above and below look the same.",
    "Step 2. What the mirror does to one arrow (orange): it moves to −z, keeps its y part and flips its z part (purple, dashed).",
    "Step 3. Even mode: the mirror image (purple halo) lies exactly on the field. σ = +1. This family is TE-like.",
    "Step 4. Odd mode: the mirror image points the opposite way at every point. σ = −1. This family is TM-like, even though E_z itself is symmetric in z.",
    "Step 5. On the mid-plane itself: the even field lies in the plane (purely TE), the odd field is normal to it (purely TM)."];
  STEP(ctl, caps, k => {
    let s = "";
    for (const cx of [175, 505]) {
      s += `<rect x="${cx - 150}" y="${Y(80)}" width="300" height="${Y(-80) - Y(80)}" fill="${BL}" fill-opacity="0.13"/>` + hline(cx - 160, cx + 160, 150, PU, "6 4");
      s += lab(cx - 156, Y(80) - 6, "air", "start", "ts") + lab(cx - 156, Y(-80) + 16, "air", "start", "ts") + lab(cx + 156, 146, "z = 0", "end", "ts", PU);
    }
    s += lab(30, 260, "y →", "start", "ts") + lab(14, 60, "z ↑", "start", "ts");
    if (k === 2) {
      const i = 5, c = 32, v = [30, -26];
      s += sgnArrow(175 + c, Y(zs[i]), v[0], v[1], CO, 3) + sgnArrow(175 + c, Y(-zs[i]), ...mir(v), PU, 3, "5 3");
      s += `<path d="M${175 + c + 26} ${Y(zs[i])} Q${175 + c + 70} 150 ${175 + c + 26} ${Y(-zs[i])}" fill="none" stroke="var(--t)" stroke-dasharray="2 3" marker-end="url(#ar)"/>`;
      s += lab(175 + c + 54, 186, "mirror", "start", "ts");
      s += lab(505, 70, "(E_x, E_y, E_z) at z", "middle", "t") + lab(505, 96, "becomes", "middle") + lab(505, 122, "(E_x, E_y, −E_z) at −z", "middle", "t", PU);
    }
    if (k >= 3) {
      zs.forEach((z, i) => cols.forEach(c => { const v = evenV(i, c); const m = mir(evenV(zs.length - 1 - i, c)), hx = 175 + c, hy = Y(z); s += `<line x1="${(hx - m[0] / 2).toFixed(1)}" y1="${(hy - m[1] / 2).toFixed(1)}" x2="${(hx + m[0] / 2).toFixed(1)}" y2="${(hy + m[1] / 2).toFixed(1)}" stroke="${PU}" stroke-width="9" stroke-linecap="round" opacity="0.25"/>` + sgnArrow(hx, hy, v[0], v[1], BL, 2.2); }));
      s += lab(175, 18, "even mode, σ = +1: TE-like", "middle", "th", BL);
    }
    if (k >= 4) {
      zs.forEach((z, i) => cols.forEach(c => { const v = oddV(i, c), m = mir(oddV(zs.length - 1 - i, c)); s += sgnArrow(505 + c + 6, Y(z), m[0], m[1], PU, 1.6, "4 3") + sgnArrow(505 + c, Y(z), v[0], v[1], CO, 2.2); }));
      s += lab(505, 18, "odd mode, σ = −1: TM-like", "middle", "th", CO);
      s += lab(505, 36, "purple dashed: mirror image, opposite everywhere", "middle", "ts", PU);
    }
    if (k === 3) s += lab(175, 36, "purple halo: mirror image, on top of the field", "middle", "ts", PU);
    if (k === 5) {
      for (const cx of [175, 505]) s += `<rect x="${cx - 124}" y="138" width="248" height="24" fill="none" stroke="${TL}" stroke-width="2.5" rx="4"/>`;
      s += lab(175, 278, "on z = 0: E_z = 0, field in the plane (TE)", "middle", "ts", TL) + lab(505, 278, "on z = 0: E_x = E_y = 0, field along z (TM)", "middle", "ts", TL);
    }
    box.innerHTML = svg(288, s);
  });
}},

/* ---------------- 4. Field jump, Eq. 2.1 ---------------- */
{s: "4. Eq. 2.1 Field jump", t: String.raw`Eq. (2.1), the field jump: \(E_z^{\mathrm{air}} = (\varepsilon_{\mathrm{GaAs}}/\varepsilon_{\mathrm{air}})\,E_z^{\mathrm{GaAs}}\)`,
intu: String.raw`At a surface without free charge, two rules hold. The part of \(\mathbf{E}\) parallel to the surface is the same on both sides. The part normal to the surface is not: instead \(\varepsilon E_{\mathrm{normal}}\), the normal displacement field, is the same on both sides. At the top and bottom of the membrane the normal direction is \(z\), so \(E_z\) just outside is \(\varepsilon_{\mathrm{GaAs}}/\varepsilon_{\mathrm{air}}\) times larger than just inside, a factor of about 12. Which rule a mode feels depends on which way its field points. The TE-like field \(E_y\) lies along the surfaces and passes through smoothly. The TM-like field is mainly \(E_z\), so it steps up at both surfaces and is strongest just outside them. The same boundary condition makes the TM-like field bend more inside the core, which gives it a lower effective index. Press TE, TM and Both, and move the core index.`,
eq: String.raw`<div class="eqnote">The two boundary rules at the top and bottom surfaces</div>\[ E_{\parallel}^{\mathrm{air}} = E_{\parallel}^{\mathrm{GaAs}}, \qquad \varepsilon_{\mathrm{air}}E_{z}^{\mathrm{air}} = \varepsilon_{\mathrm{GaAs}}E_{z}^{\mathrm{GaAs}} \]<div class="eqnote">so the normal field jumps</div>\[ E_{z}^{\mathrm{air}} = \frac{\varepsilon_{\mathrm{GaAs}}}{\varepsilon_{\mathrm{air}}}\,E_{z}^{\mathrm{GaAs}} = 12.19\,E_{z}^{\mathrm{GaAs}} \]<div class="eqref">Thesis Eq. (2.1), Sec. 2.2, with \(\varepsilon_r = 12.19\) of GaAs at 795 nm. Examples here use \(n = 3.5\), so the factor is \(n^2 = 12.25\).</div>`,
sym: [[String.raw`\(E_{z}^{\mathrm{air}}, E_{z}^{\mathrm{GaAs}}\)`, "normal electric field just outside and just inside the surface (superscripts are labels, not powers)"], [String.raw`\(E_{\parallel}\)`, "tangential electric field, the part along the surface"], [String.raw`\(\varepsilon_{\mathrm{GaAs}}, \varepsilon_{\mathrm{air}}\)`, String.raw`relative permittivities, \(n^2\): 12.19 for GaAs at 795 nm (12.25 for the round \(n = 3.5\)), 1 for air`], [String.raw`\(\varepsilon E_{z}\)`, "normal displacement field (divided by ε₀), continuous when there is no surface charge"], [String.raw`\(E_{y}\)`, "main field of the TE-like mode, along the surfaces"], [String.raw`z`, "normal to the membrane surfaces"]],
how: [String.raw`Read it aloud: "E z in air equals epsilon GaAs over epsilon air times E z in GaAs, which is 12.19 times E z in GaAs".`, String.raw`Rule 1 comes from Faraday's law around a thin loop across the surface: the tangential parts \(E_x\) and \(E_y\) are continuous.`, String.raw`Rule 2 comes from Gauss's law over a thin pillbox with no surface charge: \(\varepsilon E_z\) is continuous, so \(E_z\) itself jumps by \(\varepsilon_{\mathrm{GaAs}}/\varepsilon_{\mathrm{air}}\).`, String.raw`TE-like: the main field \(E_y\) is tangential, so it has no jump. TM-like: the main field \(E_z\) is normal, so the profile steps up at each surface and is strongest just outside.`, String.raw`Why the TM-like index is lower: inside the core the field has to bend more to meet the jump, so more of its wave vector points across the guide and less along it. The analytic slab equation that makes this exact is in "Beyond the thesis".`, "Thesis Eq. (2.1), Sec. 2.2. Treated in Lesson 2 (Symmetry, TE-like and TM-like)."],
say: "At the surfaces the normal displacement field is continuous, so the normal electric field in the air is epsilon GaAs over epsilon air, about 12 times, larger than inside. The TM-like mode has its main field normal to the surfaces, so it is strongest just outside them, and the same boundary condition gives it a lower effective index.",
num: String.raw`Thesis value: \(\varepsilon_r = 12.19\) (\(n = 3.492\)). Round example \(n = 3.5\): factor <b>12.25</b>.<br>\(n = 3.0\): <b>9</b>. \(n = 1.45\) (oxide): <b>2.1</b>.<br>Textbook slab, \(n = 3.5\), 160 nm, 800 nm: TE0 <b>${f2(NTE)}</b>, TM0 <b>${f2(NTM)}</b>.`,
note: String.raw`Careful with "TM has more field in the air". The amplitude of \(E_z\) is large just outside, but the lower TM-like index comes from the boundary condition, not from most of the power leaving the core. Say "the normal field jumps by the permittivity ratio, and that boundary condition lowers the TM-like effective index".`,
r(fig, ctl) {
  let pol = "both";
  ctl.innerHTML = `<div class="row"><button data-p="TE">TE</button><button data-p="TM">TM</button><button data-p="both">Both</button></div>` + sl("n", "Core index n", 1.5, 3.5, 0.05, 3.5) + '<div class="readout" id="ro"></div>';
  const box = fbox(fig, String.raw`\underbrace{{\color{#D85A30}{E_{z}^{\mathrm{air}}}}}_{\text{just outside}} = \underbrace{\frac{{\color{#378ADD}{\varepsilon_{\mathrm{GaAs}}}}}{{\color{#1D9E75}{\varepsilon_{\mathrm{air}}}}}}_{12.19 \text{ in the thesis}}\;\underbrace{{\color{#7F77DD}{E_{z}^{\mathrm{GaAs}}}}}_{\text{just inside}}`);
  const zs = range(-320, 320, 321), x0 = 70, y0 = 192, w = 560, h = 150, A = ax(x0, y0, w, h, -320, 320, 0, 1.08);
  const draw = () => {
    ctl.querySelectorAll("button[data-p]").forEach(b => b.classList.toggle("on", b.dataset.p === pol));
    const n = +$("n").value; $("nv").textContent = n.toFixed(2);
    const Nte = C2.slabN(n, 1, 160, 800, 0, "TE"), Ntm = C2.slabN(n, 1, 160, 800, 0, "TM");
    const pe = C2.slabProfile(n, 1, 160, 800, 0, "TE", Nte, zs).main, pm = C2.slabProfile(n, 1, 160, 800, 0, "TM", Ntm, zs).ez;
    const showTE = pol !== "TM", showTM = pol !== "TE";
    const mx0 = 150, mx1 = 560, my0 = 66, my1 = 104;
    let s = `<text class="ts" x="20" y="18">side view: light travels along x, membrane thin along z</text>`;
    s += `<rect x="${mx0}" y="${my0}" width="${mx1 - mx0}" height="${my1 - my0}" fill="${BL}" fill-opacity="0.15" stroke="var(--t)" stroke-width="0.8"/>` + lab(mx1 + 8, (my0 + my1) / 2 + 4, "GaAs", "start") + lab(mx1 + 8, my0 - 14, "air", "start") + lab(mx1 + 8, my1 + 24, "air", "start");
    s += arrow(40, 120, 90, 120, "var(--t)", 1) + lab(94, 124, "x", "start") + arrow(40, 120, 40, 74, "var(--t)", 1) + lab(44, 72, "z", "start") + `<circle cx="40" cy="120" r="5" fill="none" stroke="var(--t)"/><circle cx="40" cy="120" r="1.6" fill="var(--t)"/>` + lab(8, 140, "y out of page", "start");
    for (let k = 0; k < 6; k++) {
      const x = mx0 + 40 + k * 66;
      if (showTE) { const c = pol === "both" ? x - 12 : x; s += `<circle cx="${c}" cy="${(my0 + my1) / 2}" r="7" fill="none" stroke="${BL}" stroke-width="2"/><circle cx="${c}" cy="${(my0 + my1) / 2}" r="2.2" fill="${BL}"/><circle cx="${c}" cy="${my0 - 20}" r="7" fill="none" stroke="${BL}" stroke-width="2"/><circle cx="${c}" cy="${my0 - 20}" r="2.2" fill="${BL}"/>`; }
      if (showTM) { const c = pol === "both" ? x + 12 : x; s += arrow(c, my1 - 10, c, my0 + 14, CO, 2) + arrow(c, my0 - 2, c, my0 - 42, CO, 3.4) + arrow(c, my1 + 42, c, my1 + 2, CO, 3.4); }
    }
    if (showTE) s += lab(mx0, 164, "TE-like: Ey points out of the page, along both surfaces, same on both sides", "start", "ts", BL);
    if (showTM) s += lab(mx0, showTE ? 178 : 164, "TM-like: Ez crosses the surfaces, short inside, ε ratio times longer outside", "start", "ts", CO);
    s += `<rect x="${A.X(-80)}" y="${y0}" width="${A.X(80) - A.X(-80)}" height="${h}" fill="${BL}" fill-opacity="0.12"/>` + frame(x0, y0, w, h);
    s += vline(A.X(-80), y0, y0 + h, "var(--t)", "3 3") + vline(A.X(80), y0, y0 + h, "var(--t)", "3 3");
    if (showTE) s += plot(x0, y0, w, h, zs, pe, -320, 320, 0, 1.08, BL, 2.5) + lab(A.X(-205), A.Y(0.6), "TE0: Ey, smooth (no jump)", "middle", "ts", BL);
    if (showTM) { s += plot(x0, y0, w, h, zs, pm, -320, 320, 0, 1.08, CO, 2.5) + lab(A.X(-215), A.Y(0.95), "TM0: Ez, steps up at the surfaces", "middle", "ts", CO);
      const inside = 1 / (n * n); s += arrow(A.X(80) + 14, A.Y(inside), A.X(80) + 14, A.Y(1) + 4, PU, 1.5) + lab(x0 + w - 8, y0 + 16, "jump × n² = " + (n * n).toFixed(2), "end", "ts", PU); }
    s += lab(A.X(0), y0 + h - 8, "GaAs core, 160 nm", "middle", "ts") + xticks(x0, y0, w, h, -320, 320, [-300, -150, 0, 150, 300]) + yticks(x0, y0, w, h, 0, 1.08, [0, 0.5, 1]);
    s += lab(x0 + w / 2, y0 + h + 32, "position across the membrane z (nm), analytic slab", "middle") + ytitle(28, y0 + h / 2, "|field| (normalized)");
    box.innerHTML = svg(388, s);
    const R = [["jump factor ε<sub>core</sub>/ε<sub>air</sub> = n²", (n * n).toFixed(2)]];
    if (showTE) R.push(["TE0 n<sub>eff</sub>", Nte.toFixed(3)]);
    if (showTM) R.push(["TM0 n<sub>eff</sub>", Ntm.toFixed(3)]);
    $("ro").innerHTML = ro(R);
  };
  ctl.querySelectorAll("button[data-p]").forEach(b => b.onclick = () => { pol = b.dataset.p; draw(); });
  $("n").oninput = draw; draw();
}},

/* ---------------- 5. Phase matching, Eq. 2.2 ---------------- */
{s: "5. Eq. 2.2 Phase matching", t: String.raw`Eq. (2.2), phase matching: \(k_0 n_{\mathrm{c}}\sin\theta_m = \beta + m\,2\pi/\Lambda\)`,
intu: String.raw`A guided mode cannot leave the membrane on its own. Its phase advances along the surface at the rate \(\beta = k_0 n_{\mathrm{eff}}\), and a wave in the air can advance at most at \(k_0 n_{\mathrm{c}}\). A grating with period \(\Lambda\) fixes the mismatch: each period scatters a little light, and the pattern of teeth can add or remove phase per length in whole steps of \(2\pi/\Lambda\). Take one step away and the remainder can fall inside the window of the air. The light scattered by successive teeth then adds up in phase along one direction \(\theta_m\), the direction whose phase along the surface matches. Watch the wavefronts leave the grating, and move the period to tilt them. The lower panel is the same equation as arrows on one axis.`,
eq: String.raw`\[ k_{0}n_{\mathrm{c}}\sin\theta_{m} = \beta + m\,\frac{2\pi}{\Lambda}, \qquad m = 0, \pm 1, \pm 2, \ldots \]\[ \text{order } m \text{ radiates only if } \left|\beta + m\,\frac{2\pi}{\Lambda}\right| \lt k_{0}n_{\mathrm{c}} \]<div class="eqref">Thesis Eq. (2.2), Sec. 2.3</div>`,
sym: [[String.raw`\(k_{0}\)`, String.raw`vacuum wavenumber \(2\pi/\lambda_0\)`], [String.raw`\(n_{\mathrm{c}}\)`, "index of the cladding the light goes into, air, 1"], [String.raw`\(\theta_{m}\)`, "angle of order m from the surface normal, positive toward the propagation direction"], [String.raw`\(k_0 n_{\mathrm{c}}\sin\theta_m\)`, "phase per length along the surface of a plane wave leaving at that angle"], [String.raw`\(\beta\)`, String.raw`propagation constant of the guided mode, \(k_0 n_{\mathrm{eff}}\)`], [String.raw`\(m\)`, "diffraction order, the number of grating steps (−1 is the one used)"], [String.raw`\(\Lambda\)`, "grating period"], [String.raw`\(2\pi/\Lambda\)`, "grating wavenumber: the phase per length one period supplies"]],
how: [String.raw`Read it aloud: "k zero n c sine theta m equals beta plus m times two pi over Lambda".`, String.raw`The left side is the phase per length along the surface of a plane wave leaving at \(\theta_m\). Its size is at most \(k_0 n_{\mathrm{c}}\), so an order radiates only if the right side is smaller than that.`, String.raw`The right side is what the grating offers: the guided \(\beta\) shifted by whole multiples of \(2\pi/\Lambda\). Each order is one possible shift.`, String.raw`In phase means: going from one tooth to the next, the guided light gains \(\beta\Lambda\), the grating subtracts \(2\pi\) per step, and the emitted wave needs exactly the remainder to keep its wavefronts continuous.`, String.raw`Example: \(n_{\mathrm{eff}} = 2.8\) and \(\Lambda = 300\) nm at 800 nm. Order \(-1\) gives \(\sin\theta = 2.8 - 2.667 = 0.133\), so it radiates at 7.7°. Order \(-2\) gives \(-2.53\), outside the air window.`, "Thesis Eq. (2.2), Sec. 2.3. Treated in Lesson 4 (Grating couplers)."],
say: String.raw`A grating scatters the guided mode into orders whose phase per length along the surface, \(\beta + m\,2\pi/\Lambda\), falls inside the air window. In that direction the light from successive teeth adds up in phase.`,
num: String.raw`Example \(n_{\mathrm{eff}} = 2.8\), \(\lambda_0 = 800\) nm, \(\Lambda = 300\) nm: \(\lambda_0/\Lambda = 2.667\), \(\sin\theta_{-1} = 0.133\), \(\theta_{-1} \approx\) <b>7.7°</b>.<br>Order \(-2\): \(2.8 - 5.33 = -2.53\), <b>does not radiate</b>. Order 0: 2.8, stays guided.`,
r(fig, ctl) {
  ctl.innerHTML = sl("L", "Grating period Λ (nm)", 240, 420, 1, 300) + '<div class="readout" id="ro"></div>';
  const box = fbox(fig, String.raw`\underbrace{k_{0}{\color{#1D9E75}{n_{\mathrm{c}}}}\sin{\color{#7F77DD}{\theta_{m}}}}_{\text{phase per length in air}} = \underbrace{{\color{#378ADD}{\beta}}}_{\text{guided mode}} + \underbrace{{\color{#BA7517}{m}}\,\frac{2\pi}{{\color{#D85A30}{\Lambda}}}}_{m \text{ grating steps}}`);
  const N = 2.8, lv = 46, gy = 128;
  const run = RUN(ctl, tt => {
    const L = +$("L").value; $("Lv").textContent = L + " nm";
    const K = 800 / L, s1 = N - K, s2 = N - 2 * K, X = k => 340 + k * 87.5, yA = 266, rad = Math.abs(s1) < 1, f = 0.7 * tt;
    let s = `<defs><clipPath id="c2l0c5"><rect x="150" y="14" width="450" height="${gy - 22}"/></clipPath></defs>`;
    s += `<rect x="40" y="${gy}" width="600" height="16" fill="${BL}" fill-opacity="0.35"/>`;
    const p = L / 800 * lv; for (let x = 150; x < 600; x += p) s += `<rect x="${x.toFixed(1)}" y="${gy - 8}" width="${(p / 2).toFixed(1)}" height="8" fill="${BL}" fill-opacity="0.6"/>`;
    let d = ""; for (let x = 40; x <= 640; x += 2) { const damp = x < 150 ? 1 : Math.exp(-(x - 150) / 500); d += (d ? "L" : "M") + x + " " + (gy + 8 - 5 * damp * Math.sin(2 * Math.PI * (x * N / lv - f))).toFixed(1); }
    s += `<path d="${d}" fill="none" stroke="#0C447C" stroke-width="1.8"/>` + lab(48, gy + 30, "guided mode, " + NE + " = 2.8, crests every λ₀/" + NE, "start", "ts");
    if (rad) {
      const th = Math.asin(s1), sn = Math.sin(th), cs = Math.cos(th);
      let w = "";
      for (let j = -60; j < 60; j++) { const sv = lv * (j + f % 1); const xa = 150, xb = 600, ha = (sv - sn * xa) / cs, hb = (sv - sn * xb) / cs; w += `<line x1="${xa}" y1="${(gy - 8 - ha).toFixed(1)}" x2="${xb}" y2="${(gy - 8 - hb).toFixed(1)}" stroke="${CO}" stroke-width="1.6" opacity="0.75"/>`; }
      s += `<g clip-path="url(#c2l0c5)">${w}</g>`;
      s += arrow(375, gy - 14, 375 + 80 * sn, gy - 14 - 80 * cs, PU, 2.5) + vline(375, 20, gy - 14, "var(--t)", "3 3") + lab(384 + 80 * sn, gy - 86, "θ = " + (th * 180 / Math.PI).toFixed(1) + "°", "start", "t", PU);
    } else s += lab(375, 60, "order −1 cannot radiate at this period", "middle", "t", CO);
    s += `<path d="M${X(-1)} ${yA} A 87.5 87.5 0 0 1 ${X(1)} ${yA} Z" fill="${TL}" fill-opacity="0.12" stroke="${TL}"/>` + lab(X(1) + 8, yA - 60, "air window:", "start", "ts", TL) + lab(X(1) + 8, yA - 46, "|phase per length| ≤ k₀", "start", "ts", TL);
    s += `<line x1="50" y1="${yA}" x2="640" y2="${yA}" stroke="var(--t)" marker-end="url(#ar)"/>`;
    for (let k = -3; k <= 3; k++) s += vline(X(k), yA - 3, yA + 3, "var(--t)") + lab(X(k), yA + 16, k, "middle");
    s += lab(648, yA + 4, "k/k₀", "start");
    s += dot(X(N), yA, BL, 6) + lab(X(N) + 2, yA - 30, "β (m = 0)", "middle", "t", BL);
    s += arrow(X(N), yA - 14, X(s1), yA - 14, AM, 2) + lab((X(N) + X(s1)) / 2, yA - 20, "−2π/Λ", "middle", "ts", AM) + dot(X(s1), yA, CO, 4) + lab(X(s1), yA + 30, "m = −1", "middle", "ts", CO);
    if (s2 > -3.6) s += arrow(X(s1), yA - 46, X(s2), yA - 46, AM, 1.5, "5 3") + lab((X(s1) + X(s2)) / 2, yA - 52, "−2π/Λ", "middle", "ts", AM) + dot(X(s2), yA, PU, 4) + lab(X(s2), yA + 30, "m = −2", "middle", "ts", PU);
    if (rad) s += arrow(X(0), yA, X(s1), yA - 87.5 * Math.sqrt(1 - s1 * s1), PU, 2);
    box.innerHTML = svg(300, s);
    $("ro").innerHTML = ro([["λ₀/Λ = (2π/Λ)/k₀", K.toFixed(3)], ["sin θ for m = −1", s1.toFixed(3)], ["angle", rad ? (Math.asin(s1) * 180 / Math.PI).toFixed(1) + "°" : "does not radiate"], ["m = −2 lands at", s2.toFixed(2) + (Math.abs(s2) < 1 ? " (radiates too)" : " (outside)")]]);
  });
  $("L").oninput = run.redraw;
}},

/* ---------------- 6. Period, Eq. 2.3 ---------------- */
{s: "6. Eq. 2.3 Period", t: String.raw`Eq. (2.3), the period \(\Lambda = \lambda_0/(n_{\mathrm{eff}} - n_{\mathrm{c}}\sin\theta)\) and why exact vertical is avoided`,
intu: String.raw`Put \(m = -1\) into phase matching and solve for the period that sends the light to the fiber at the angle \(\theta\). For vertical emission the rule is as simple as it gets: one period equals one guide wavelength, \(\Lambda = \lambda_0/n_{\mathrm{eff}}\). TM-like light has a lower \(n_{\mathrm{eff}}\), so a TM coupler needs a longer period, and a grating made for one polarization does not couple the other well. Exactly vertical emission is avoided. At \(\theta = 0\) the grating step equals \(\beta\), so two steps take \(\beta\) to \(-\beta\), which is the same mode traveling backward. The grating then works as a mirror for the guided light. A small tilt moves the second order away from \(-\beta\) by \(2k_0 n_{\mathrm{c}}\sin\theta\), and the fiber is tilted by the same angle.`,
eq: String.raw`\[ \Lambda = \frac{\lambda_{0}}{n_{\mathrm{eff}} - n_{\mathrm{c}}\sin\theta} \]\[ \theta = 0: \qquad \Lambda = \frac{\lambda_{0}}{n_{\mathrm{eff}}}, \qquad \beta - 2\cdot\frac{2\pi}{\Lambda} = -\beta \]<div class="eqref">Thesis Eq. (2.3), Sec. 2.3 (Zhou et al. 2018, vertical case and second order from Taillaert et al. 2006)</div>`,
sym: [[String.raw`\(\Lambda\)`, "grating period"], [String.raw`\(\lambda_{0}\)`, "vacuum wavelength"], [String.raw`\(n_{\mathrm{eff}}\)`, "effective index of the grating region, an average over a period (card 7)"], [String.raw`\(n_{\mathrm{c}}\)`, "cladding index, air, 1"], [String.raw`\(\theta\)`, "emission angle toward the fiber, from the normal"], [String.raw`\(-\beta\)`, "the same guided mode traveling backward"], [String.raw`\(\beta - 2\cdot 2\pi/\Lambda\)`, "the second order, m = −2"]],
how: [String.raw`Read it aloud: "Lambda equals lambda zero over \(n_{\mathrm{eff}}\) minus n c sine theta".`, String.raw`From Eq. (2.2) with \(m = -1\): \(k_0 n_{\mathrm{c}}\sin\theta = k_0 n_{\mathrm{eff}} - 2\pi/\Lambda\). Divide by \(k_0\) and solve for \(\Lambda\).`, String.raw`At \(\theta = 0\) the period is one guide wavelength \(\lambda_0/n_{\mathrm{eff}}\), so \(2\pi/\Lambda = \beta\), and the second order lands at \(\beta - 2\beta = -\beta\).`, String.raw`For a tilt \(\theta\) the second order lands at \(-\beta + 2k_0 n_{\mathrm{c}}\sin\theta\), so it misses the backward mode by \(2k_0 n_{\mathrm{c}}\sin\theta\).`, String.raw`Lower \(n_{\mathrm{eff}}\) (TM-like) gives a larger \(\Lambda\) for the same angle. The two curves in the picture never cross.`, "Thesis Eq. (2.3), Sec. 2.3. Treated in Lesson 4 (Grating couplers)."],
say: String.raw`For the first order toward the fiber, the period is \(\lambda_0/(n_{\mathrm{eff}} - n_{\mathrm{c}}\sin\theta)\), which is one guide wavelength for vertical emission. Exactly vertical is avoided because then the second order couples the forward mode into the backward one, so the beam is tilted by a few degrees.`,
num: String.raw`Example \(n_{\mathrm{eff}} = 2.8\): vertical \(\Lambda =\) <b>286 nm</b>, \(\theta = 10°\): \(800/(2.8 - 0.174) =\) <b>305 nm</b>.<br>TM-like example \(n_{\mathrm{eff}} = 2.3\): vertical <b>348 nm</b>, 10°: <b>376 nm</b>.<br>Miss of the second order at 10°: \(2\sin 10° =\) <b>0.35 \(k_0\)</b>.`,
r(fig, ctl) {
  let pol = "TE";
  ctl.innerHTML = `<div class="row"><button data-p="TE">TE-like example, n<sub>eff</sub> = 2.8</button><button data-p="TM">TM-like example, n<sub>eff</sub> = 2.3</button></div>` + sl("a", "Emission angle θ (degrees)", 0, 20, 0.5, 10) + '<div class="readout" id="ro"></div>';
  const box = fbox(fig, String.raw`\underbrace{{\color{#D85A30}{\Lambda}}}_{\text{period}} = \frac{\lambda_{0}}{\underbrace{{\color{#378ADD}{n_{\mathrm{eff}}}}}_{\text{grating region}} - \underbrace{n_{\mathrm{c}}\sin{\color{#7F77DD}{\theta}}}_{\text{tilt toward the fiber}}} \qquad \theta = 0: \ \underbrace{\beta - 2\,\frac{2\pi}{\Lambda} = -\beta}_{\text{back-reflection}}`);
  const x0 = 80, y0 = 22, w = 540, h = 130, A = ax(x0, y0, w, h, 0, 20, 260, 420), as = range(0, 20, 81), Lf = (n, a) => 800 / (n - Math.sin(a * Math.PI / 180));
  const draw = () => {
    pick(ctl, "p", pol);
    const a = +$("a").value; $("av").textContent = a.toFixed(1) + "°";
    const N = pol === "TE" ? 2.8 : 2.3, L = Lf(N, a), sn = Math.sin(a * Math.PI / 180);
    let s = frame(x0, y0, w, h) + plot(x0, y0, w, h, as, as.map(v => Lf(2.8, v)), 0, 20, 260, 420, BL, 2.5) + plot(x0, y0, w, h, as, as.map(v => Lf(2.3, v)), 0, 20, 260, 420, CO, 2.5, "6 3");
    s += vline(A.X(a), y0, y0 + h, "var(--t)", "2 3") + dot(A.X(a), A.Y(L), pol === "TE" ? BL : CO, 6);
    s += lab(A.X(19.5), A.Y(Lf(2.8, 19.5)) - 8, "TE-like, 2.8", "end", "ts", BL) + lab(A.X(9), A.Y(Lf(2.3, 9)) - 8, "TM-like, 2.3 (dashed)", "middle", "ts", CO);
    s += xticks(x0, y0, w, h, 0, 20, [0, 5, 10, 15, 20]) + yticks(x0, y0, w, h, 260, 420, [280, 320, 360, 400]);
    s += lab(x0 + w / 2, y0 + h + 30, "emission angle θ (degrees), λ₀ = 800 nm", "middle") + ytitle(32, y0 + h / 2, "period Λ (nm)");
    const yA = 250, X = k => 340 + k * 95, b2 = -N + 2 * sn, hit = a < 0.25;
    s += `<rect x="${X(-1)}" y="${yA - 12}" width="${X(1) - X(-1)}" height="24" fill="${TL}" fill-opacity="0.13"/>` + lab(X(-1) - 6, yA + 4, "air window", "end", "ts", TL);
    s += `<line x1="40" y1="${yA}" x2="640" y2="${yA}" stroke="var(--t)" marker-end="url(#ar)"/>` + lab(648, yA + 4, "k/k₀", "start");
    s += dot(X(N), yA, BL, 6) + lab(X(N), yA + 20, "β", "middle", "t", BL) + `<circle cx="${X(-N)}" cy="${yA}" r="9" fill="none" stroke="${BL}" stroke-width="2"/>` + lab(X(-N), yA - 16, "−β (backward mode)", "middle", "ts", BL);
    s += `<path d="M${X(N)} ${yA - 8} Q${(X(N) + X(sn)) / 2} ${yA - 46} ${X(sn)} ${yA - 8}" fill="none" stroke="${AM}" stroke-width="2" marker-end="url(#ar)"/>` + dot(X(sn), yA, PU, 5) + lab(X(sn) + 4, yA - 40, "m = −1: to the fiber", "start", "ts", PU);
    s += `<path d="M${X(sn)} ${yA + 8} Q${(X(sn) + X(b2)) / 2} ${yA + 46} ${X(b2)} ${yA + 8}" fill="none" stroke="${AM}" stroke-width="2" stroke-dasharray="5 3" marker-end="url(#ar)"/>` + dot(X(b2), yA, hit ? "#E24B4A" : AM, 5);
    s += lab(X(b2), yA + 44, hit ? "m = −2 lands on −β: back-reflection" : "m = −2 misses −β by 2 sin θ", "middle", "th", hit ? "#E24B4A" : TL);
    box.innerHTML = svg(306, s);
    $("ro").innerHTML = ro([["period Λ", L.toFixed(0) + " nm"], ["vertical period λ₀/n<sub>eff</sub>", (800 / N).toFixed(0) + " nm"], ["second order misses −β by", (2 * sn).toFixed(3) + " k₀"]]);
  };
  ctl.querySelectorAll("button[data-p]").forEach(b => b.onclick = () => { pol = b.dataset.p; draw(); });
  $("a").oninput = draw; draw();
}},

/* ---------------- 7. Fill factor ---------------- */
{s: "7. Fill factor", t: String.raw`Fill factor and the average \(n_{\mathrm{eff}}\) of a period, every tooth and gap its own width`,
intu: String.raw`Besides the period, a grating is described by its fill factor \(f\), the fraction of each period left unetched, and by its etch depth. A tooth is then \(f\Lambda\) wide and a gap \((1 - f)\Lambda\). The light in the grating sees GaAs in the teeth and air in the gaps, so the \(n_{\mathrm{eff}}\) that goes into Eq. (2.3) is an average over one period, set by the fill factor and the etch depth. More GaAs in the period means a higher average and so a shorter period for the same angle. In this thesis the grating is etched all the way through the membrane, and the width of every tooth and every gap is its own design variable. The local fill factor therefore changes from tooth to tooth along the grating. Switch to the second view to see such a grating and its local fill factor.`,
eq: String.raw`\[ w_{\mathrm{tooth}} = f\Lambda, \qquad w_{\mathrm{gap}} = (1 - f)\Lambda \]\[ \Lambda = \frac{\lambda_{0}}{n_{\mathrm{eff}}(f) - n_{\mathrm{c}}\sin\theta} \]<div class="eqnote">\(n_{\mathrm{eff}}(f)\): the average index of one period, set by the fill factor and the etch depth</div><div class="eqref">Sec. 2.3 (Zhou et al. 2018). No equation number. Local fill factor: Chapters 3 and 5.</div>`,
sym: [[String.raw`\(f\)`, "fill factor: fraction of a period left unetched (tooth)"], [String.raw`\(\Lambda\)`, "period, tooth plus gap"], [String.raw`\(w_{\mathrm{tooth}}, w_{\mathrm{gap}}\)`, "widths of the GaAs tooth and the etched gap"], [String.raw`\(n_{\mathrm{eff}}(f)\)`, "average effective index of a period"], ["local fill factor", "tooth width divided by tooth plus gap width, one value per tooth"], [String.raw`\(\theta\)`, "emission angle, 10° in this example"]],
how: [String.raw`Read it aloud: "the tooth is f Lambda wide and the gap one minus f Lambda. The period uses the average \(n_{\mathrm{eff}}\) of one period".`, String.raw`A tooth carries light with the index of the unetched membrane, a fully etched gap is air. Their mix along one period sets the average \(n_{\mathrm{eff}}\).`, String.raw`The picture uses the simplest estimate, a linear mix \(f\,n_{\mathrm{slab}} + (1 - f)\cdot 1\) with the slab TE0 index. It shows the trend only. The thesis takes indices from simulation, not from this formula.`, "When every tooth and gap has its own width, each tooth has its own local fill factor and the grating can shape the beam that leaves it (card 8).", "Thesis Sec. 2.3, no equation number. Treated in Lesson 4 (Grating couplers), and as a design variable in Chapter 3."],
say: String.raw`The fill factor is the unetched fraction of a period, so a tooth is \(f\Lambda\) and a gap \((1 - f)\Lambda\) wide. The \(n_{\mathrm{eff}}\) in the period formula is an average over a period set by the fill factor and the etch depth. In the thesis every tooth and gap width is a design variable, so the local fill factor varies along the grating.`,
num: String.raw`Linear estimate, slab \(n_{\mathrm{eff}} = ${f2(NTE)}\), fully etched, \(\theta = 10°\):<br>\(f = 0.5\): average ≈ <b>${f2(0.5 * NTE + 0.5)}</b>, \(\Lambda \approx\) <b>${(800 / (0.5 * NTE + 0.5 - Math.sin(Math.PI / 18))).toFixed(0)} nm</b>, tooth and gap ${(400 / (0.5 * NTE + 0.5 - Math.sin(Math.PI / 18))).toFixed(0)} nm each.<br>\(f = 0.8\): average ≈ <b>${f2(0.8 * NTE + 0.2)}</b>, \(\Lambda \approx\) <b>${(800 / (0.8 * NTE + 0.2 - Math.sin(Math.PI / 18))).toFixed(0)} nm</b>.<br>Method setting (Ch. 3): each width between 80 nm and 1 µm.`,
r(fig, ctl) {
  let view = "uni", seed = 0;
  ctl.innerHTML = `<div class="row"><button data-v="uni">Uniform grating</button><button data-v="apo">Every tooth its own width</button><button id="rnd">New random widths</button></div>` + sl("f", "Fill factor f (uniform view)", 0.2, 0.9, 0.01, 0.5) + '<div class="readout" id="ro"></div>';
  const box = fbox(fig, String.raw`\underbrace{{\color{#378ADD}{w_{\mathrm{tooth}}}}}_{\text{GaAs}} = {\color{#D85A30}{f}}\Lambda, \qquad \underbrace{{\color{#1D9E75}{w_{\mathrm{gap}}}}}_{\text{etched}} = (1 - {\color{#D85A30}{f}})\Lambda, \qquad \Lambda = \frac{\lambda_{0}}{\underbrace{{\color{#7F77DD}{n_{\mathrm{eff}}(f)}}}_{\text{average of a period}} - n_{\mathrm{c}}\sin\theta}`);
  const sn = Math.sin(Math.PI / 18), navg = f => f * NTE + (1 - f);
  const design = sd => { let r = 1234 + 97 * sd; const rnd = () => { r = (r * 16807) % 2147483647; return r / 2147483647; }; const out = [];
    for (let i = 0; i < 14; i++) { const ramp = sd === 0 ? 0.88 - 0.4 * i / 13 : 0.25 + 0.65 * rnd(); const P = 800 / (navg(ramp) - sn); const t = Math.max(80, Math.min(1000, ramp * P)), g = Math.max(80, Math.min(1000, P - t)); out.push([t, g]); } return out; };
  const draw = () => {
    ctl.querySelectorAll("button[data-v]").forEach(b => b.classList.toggle("on", b.dataset.v === view));
    $("rnd").disabled = view !== "apo";
    const f = +$("f").value; $("fv").textContent = f.toFixed(2);
    const P = 800 / (navg(f) - sn);
    const items = view === "uni" ? Array.from({ length: 8 }, () => [f * P, (1 - f) * P]) : design(seed);
    const tot = items.reduce((a, [t, g]) => a + t + g, 0), sc = 600 / tot, my = 70, mh = 30;
    let s = lab(20, 20, view === "uni" ? "uniform: every period the same" : "every tooth and gap its own width (illustration)", "start", "th");
    s += hline(30, 650, my + mh / 2, "var(--line)") + lab(650, my - 10, "air above and below, etched through", "end", "ts");
    let x = 40; const fl = [];
    items.forEach(([t, g], i) => { s += `<rect x="${x.toFixed(1)}" y="${my}" width="${(t * sc).toFixed(1)}" height="${mh}" fill="${BL}" fill-opacity="0.5" stroke="${BL}"/>`; fl.push([x + (t + g) * sc / 2, t / (t + g)]); if (i === 1) { s += arrow(x, my + mh + 12, x + t * sc, my + mh + 12, BL, 1.2, "", true) + lab(x + t * sc / 2, my + mh + 28, "tooth", "middle", "ts", BL) + arrow(x + t * sc, my + mh + 12, x + (t + g) * sc, my + mh + 12, TL, 1.2, "", true) + lab(x + (t + 0.5 * g) * sc, my + mh + 44, "gap", "middle", "ts", TL); s += `<path d="M${x} ${my - 4} V${my - 12} H${x + (t + g) * sc} V${my - 4}" fill="none" stroke="var(--t)"/>` + lab(x + (t + g) * sc / 2, my - 16, "Λ", "middle", "t"); } x += (t + g) * sc; });
    s += arrow(12, my + mh / 2, 38, my + mh / 2, CO, 2);
    const px = 80, py = 150, pw = 540, ph = 90;
    s += frame(px, py, pw, ph) + lab(px + pw / 2, py + ph + 30, "position along the grating", "middle") + ytitle(36, py + ph / 2, "local f");
    s += yticks(px, py, pw, ph, 0, 1, [0, 0.5, 1]);
    fl.forEach(([xc, v]) => s += `<rect x="${(xc - 9).toFixed(1)}" y="${(py + ph - v * ph).toFixed(1)}" width="18" height="${(v * ph).toFixed(1)}" fill="${CO}" fill-opacity="0.6"/>`);
    box.innerHTML = svg(276, s);
    if (view === "uni") $("ro").innerHTML = ro([["average n<sub>eff</sub> (linear estimate)", navg(f).toFixed(3)], ["period Λ at 10°", P.toFixed(0) + " nm"], ["tooth fΛ / gap (1 − f)Λ", (f * P).toFixed(0) + " / " + ((1 - f) * P).toFixed(0) + " nm"]]);
    else { const fs = items.map(([t, g]) => t / (t + g)); $("ro").innerHTML = ro([["teeth", items.length], ["local f from / to", Math.min(...fs).toFixed(2) + " / " + Math.max(...fs).toFixed(2)], ["narrowest feature", Math.min(...items.flat()).toFixed(0) + " nm"]]); }
  };
  ctl.querySelectorAll("button[data-v]").forEach(b => b.onclick = () => { view = b.dataset.v; draw(); });
  $("rnd").onclick = () => { seed++; draw(); };
  $("f").oninput = draw; draw();
}},

/* ---------------- 8. Two loss factors ---------------- */
{s: "8. Two loss factors", t: String.raw`The two factors that limit a grating coupler: up and down, exponential and Gaussian`,
intu: String.raw`The coupling efficiency is the fraction of the guided power that ends up in the fiber mode. Taillaert et al. name two factors that limit it. First, the grating radiates downward as well as upward. A grating etched through a membrane with air above and below radiates about equally in both directions, so without a mirror about half of the radiated power is lost. A mirror below the grating addresses this factor. Second, a uniform grating scatters a fixed fraction of the remaining light at every tooth, so the radiated field decays roughly exponentially along the grating. The fiber mode is a Gaussian, and the two shapes never match perfectly. Play the first two views, then use the slider in the third to find the best exponential.`,
eq: String.raw`\[ \mathrm{CE} = \frac{P_{\text{fiber mode}}}{P_{\text{guided}}} \]<div class="eqnote">Factor 1: power sent up versus down. Factor 2: shape of the beam versus the fiber mode.</div>\[ |E_{\text{beam}}(x)| \propto e^{-x/L_{e}} \qquad \text{versus} \qquad |E_{\text{fiber}}(x)| \propto e^{-(x - x_{0})^{2}/w_{0}^{2}} \]<div class="eqnote">The two shapes are an illustration, not thesis equations</div><div class="eqref">Sec. 2.3, Taillaert et al. 2006. No equation number.</div>`,
sym: [["CE", "coupling efficiency, between 0 and 1"], [String.raw`\(P_{\text{fiber mode}}\)`, "power that ends up in the fiber mode"], [String.raw`\(P_{\text{guided}}\)`, "guided power arriving at the grating"], [String.raw`\(L_{e}\)`, "decay length of the radiated field of a uniform grating"], [String.raw`\(w_{0}\)`, "fiber mode radius, 5.2 µm in the illustration (mode field diameter about 10 µm)"], [String.raw`\(x_{0}\)`, "position of the fiber along the grating"], [String.raw`\(\eta\)`, "overlap of the two shapes (readout), the share that factor 2 lets through"]],
how: [String.raw`Read it aloud: "the coupling efficiency is the power in the fiber mode over the guided power".`, "Factor 1: a grating in a symmetric membrane has no preferred side, so the upward and downward beams are about equal. Without a mirror, about half of the radiated light goes into the substrate side and is lost.", "With a mirror, the downward light comes back up. Whether it adds to the upward light depends on the air gap (card 13).", String.raw`Factor 2: if every tooth scatters the same fraction, the power left in the guide falls by the same factor per tooth, which is an exponential. Its overlap with a Gaussian peaks at about 80 %, reached when the decay length is matched to the fiber mode (here \(L_e \approx 7.6\) µm for \(w_0 = 5.2\) µm).`, "Letting every tooth have its own width (card 7) is what lets a design shape the beam toward a Gaussian.", "Thesis Sec. 2.3, no equation number (Taillaert 2006). Treated in Lesson 4 (Grating couplers), and the mirror in Lesson 5 (DBR and air gap)."],
say: "Two factors limit a grating coupler: a membrane grating radiates about as much down as up, which a mirror below addresses, and a uniform grating radiates an exponentially decaying beam that does not match the Gaussian fiber mode.",
num: String.raw`No mirror: about <b>half</b> of the radiated power goes down.<br>Best overlap of an exponential beam with a Gaussian: about <b>80 %</b> (Taillaert 2006, and the readout at \(L_e \approx 7.6\) µm).<br>Both factors together, without a mirror: at most about 40 % for a uniform grating.`,
r(fig, ctl) {
  let view = "ud";
  ctl.innerHTML = `<div class="row"><button data-v="ud">1. Up and down</button><button data-v="mir">1. With a mirror below</button><button data-v="shape">2. Beam shape</button></div>` + sl("Le", "Decay length Lₑ (µm), view 2", 1, 20, 0.1, 4) + '<div class="readout" id="ro"></div>';
  const box = fbox(fig, String.raw`\underbrace{{\color{#D85A30}{\mathrm{CE}}}}_{\text{coupling efficiency}} = \frac{\overbrace{P_{\text{fiber mode}}}^{\text{limited by up/down and by shape}}}{P_{\text{guided}}}`);
  const xs = range(-15, 45, 601);
  const best = Le => { const E = xs.map(x => x < 0 ? 0 : Math.exp(-x / Le)); let bb = 0, bx = 0; for (let x0 = -2; x0 < 20; x0 += 0.25) { let a = 0, b = 0, c = 0; xs.forEach((x, i) => { const G = Math.exp(-Math.pow((x - x0) / 5.2, 2)); a += E[i] * G; b += E[i] * E[i]; c += G * G; }); const e = a * a / (b * c); if (e > bb) { bb = e; bx = x0; } } return [bb, bx, E]; };
  let cache = {};
  const run = RUN(ctl, tt => {
    ctl.querySelectorAll("button[data-v]").forEach(b => b.classList.toggle("on", b.dataset.v === view));
    const Le = +$("Le").value; $("Lev").textContent = Le.toFixed(1) + " µm";
    let s = "";
    if (view !== "shape") {
      const my = view === "mir" ? 100 : 130;
      s += `<rect x="40" y="${my}" width="600" height="18" fill="${BL}" fill-opacity="0.35"/>`;
      for (let x = 230; x < 560; x += 18) s += `<rect x="${x}" y="${my}" width="9" height="18" fill="var(--bg, #fff)" fill-opacity="0.9"/>`;
      s += arrow(50, my + 9, 210, my + 9, "#0C447C", 2.5) + lab(50, my - 8, "guided light in", "start", "ts");
      if (view === "mir") { for (let k = 0; k < 8; k++) s += `<rect x="200" y="${190 + 9 * k}" width="400" height="9" fill="${BL}" fill-opacity="${k % 2 ? 0.14 : 0.42}"/>`; s += lab(610, 222, "DBR", "start", "ts") + arrow(620, my + 22, 620, 186, "var(--t)", 1, "", true) + lab(626, 160, "air gap", "start", "ts"); }
      for (let i = 0; i < 6; i++) {
        const x = 250 + i * 52, a = Math.exp(-i / 2.2), ph = (tt * 0.8 + i * 0.13) % 1;
        s += `<line x1="${x}" y1="${my - 4}" x2="${x}" y2="${my - 4 - 80 * a}" stroke="${CO}" stroke-width="${1 + 4 * a}" opacity="0.8" marker-end="url(#ar)"/>`;
        s += dot(x, my - 4 - 80 * a * ph, CO, 3);
        if (view === "ud") { s += `<line x1="${x}" y1="${my + 22}" x2="${x}" y2="${my + 22 + 80 * a}" stroke="${PU}" stroke-width="${1 + 4 * a}" opacity="0.8" marker-end="url(#ar)"/>` + dot(x, my + 22 + 80 * a * ph, PU, 3); }
        else { const yb = 186, yy = ph < 0.5 ? my + 22 + (yb - my - 22) * ph * 2 : yb - (yb - my - 22) * (ph - 0.5) * 2; s += `<line x1="${x + 6}" y1="${my + 22}" x2="${x + 6}" y2="${yb}" stroke="${PU}" stroke-width="${1 + 3 * a}" opacity="0.6"/>` + `<line x1="${x + 12}" y1="${yb}" x2="${x + 12}" y2="${my + 24}" stroke="${TL}" stroke-width="${1 + 3 * a}" opacity="0.7" marker-end="url(#ar)"/>` + dot(x + (ph < 0.5 ? 6 : 12), yy, ph < 0.5 ? PU : TL, 3); }
      }
      s += lab(420, 20, "up, toward the fiber: about half", "middle", "th", CO);
      s += view === "ud" ? lab(420, 252, "down, into the air below: about half, lost", "middle", "th", PU) : lab(420, 282, "down, reflected by the DBR, back up (green)", "middle", "th", TL);
      box.innerHTML = svg(view === "mir" ? 292 : 262, s);
      $("ro").innerHTML = ro(view === "ud" ? [["radiated up", "≈ 50 %"], ["radiated down", "≈ 50 %, lost"]] : [["radiated up", "≈ 50 %"], ["down, then back up", "adds or cancels, set by the gap (card 13)"]]);
      return;
    }
    if (!cache[Le]) cache = { [Le]: best(Le) };
    const [eta, x0b, E] = cache[Le], G = xs.map(x => Math.exp(-Math.pow((x - x0b) / 5.2, 2)));
    const px = 70, py = 30, pw = 570, ph = 170, A = ax(px, py, pw, ph, -15, 45, 0, 1.08);
    let d = `M${A.X(-15)} ${A.Y(0)}`; xs.forEach((x, i) => d += `L${A.X(x).toFixed(1)} ${A.Y(Math.min(E[i], G[i])).toFixed(1)}`); d += `L${A.X(45)} ${A.Y(0)}Z`;
    s += `<path d="${d}" fill="${TL}" fill-opacity="0.2"/>` + frame(px, py, pw, ph) + `<rect x="${A.X(0)}" y="${py + ph - 6}" width="${A.X(45) - A.X(0)}" height="6" fill="${BL}" fill-opacity="0.5"/>`;
    s += plot(px, py, pw, ph, xs, E, -15, 45, 0, 1.08, CO, 2.5) + plot(px, py, pw, ph, xs, G, -15, 45, 0, 1.08, TL, 2.5, "6 3");
    s += lab(px + pw - 8, py + 18, "coral: exponential beam of a uniform grating", "end", "ts", CO) + lab(px + pw - 8, py + 34, "green dashed: Gaussian fiber mode, w₀ = 5.2 µm, best position", "end", "ts", TL);
    s += xticks(px, py, pw, ph, -15, 45, [-10, 0, 10, 20, 30, 40]) + yticks(px, py, pw, ph, 0, 1.08, [0, 0.5, 1]);
    s += lab(px + pw / 2, py + ph + 32, "position along the grating x (µm), grating starts at 0", "middle") + ytitle(30, py + ph / 2, "|E| (normalized)");
    box.innerHTML = svg(240, s);
    $("ro").innerHTML = ro([["overlap η (factor 2)", (eta * 100).toFixed(1) + " %"], ["best fiber position x₀", x0b.toFixed(1) + " µm"], ["best possible, Lₑ ≈ 7.6 µm", "≈ 80 %"]]);
  });
  ctl.querySelectorAll("button[data-v]").forEach(b => b.onclick = () => { view = b.dataset.v; run.redraw(); });
  $("Le").oninput = run.redraw;
}},

/* ---------------- 9. Fresnel, Eq. 2.4 ---------------- */
{s: "9. Eq. 2.4 Fresnel r", t: String.raw`Eq. (2.4), reflection at one interface: \(r = (n_1 - n_2)/(n_1 + n_2)\) and its sign`,
intu: String.raw`At normal incidence, light that passes from index \(n_1\) into index \(n_2\) is partly reflected, and \(r\) is the ratio of the reflected field to the incoming field at the interface. Its size says how much is reflected, and its sign says how. Going into a higher index, \(r\) is negative: the reflected wave comes back upside down, which is a phase shift of \(\pi\). Going into a lower index, \(r\) is positive and the reflected wave comes back upright. In a stack of alternating layers the sign therefore alternates from one interface to the next, and that alternation is half of the trick of the DBR. Pick an interface and watch the reflected wave next to the incoming one at the boundary.`,
eq: String.raw`\[ r = \frac{n_{1} - n_{2}}{n_{1} + n_{2}} \]\[ n_{2} \gt n_{1}: \ r \lt 0 \ (\text{phase } \pi), \qquad n_{2} \lt n_{1}: \ r \gt 0 \ (\text{phase } 0) \]<div class="eqref">Thesis Eq. (2.4), Sec. 2.4 (Gačević and Vukmirović 2018, Sec. II B and Fig. 1)</div>`,
sym: [[String.raw`\(r\)`, "field reflection coefficient at normal incidence, between −1 and 1"], [String.raw`\(n_{1}\)`, "index on the side the light comes from"], [String.raw`\(n_{2}\)`, "index on the far side"], [String.raw`\(r^{2}\)`, "power reflected by one interface"], [String.raw`phase \(\pi\)`, "the reflected field is turned upside down"]],
how: [String.raw`Read it aloud: "r equals n one minus n two over n one plus n two".`, String.raw`It comes from requiring \(E\) and \(H\) to be continuous at the interface, with \(H\) proportional to \(n E\) for a plane wave.`, String.raw`Into a higher index, \(n_1 - n_2 \lt 0\), so \(r \lt 0\): a phase of \(\pi\). Into a lower index, \(r \gt 0\): no phase change.`, String.raw`The power reflected is \(r^2\). For GaAs and AlGaAs it is tiny, which is why a DBR needs many interfaces.`, "Thesis Eq. (2.4), Sec. 2.4. Treated in Lesson 5 (DBR and air gap)."],
say: "At normal incidence the field reflection coefficient is n1 minus n2 over n1 plus n2. It is negative, a phase shift of pi, when light enters the higher index and positive when it enters the lower index, so its sign alternates through a stack.",
num: String.raw`Air to GaAs (1 to 3.5): \(r = -0.556\), \(r^2 =\) <b>31 %</b>.<br>GaAs to AlGaAs (3.5 to 3.0): \(r = +0.077\), \(r^2 =\) <b>0.59 %</b>.<br>AlGaAs to GaAs: \(r = -0.077\), same power, opposite sign.`,
r(fig, ctl) {
  const P = { a: [1, 3.5, "air → GaAs"], b: [3.5, 3.0, "GaAs → AlGaAs"], c: [3.0, 3.5, "AlGaAs → GaAs"], d: [3.5, 1, "GaAs → air"] };
  let cur = "a";
  ctl.innerHTML = btns(Object.entries(P).map(([k, v]) => [k, v[2]]), "i") + '<div class="readout" id="ro"></div>';
  const box = fbox(fig, String.raw`\underbrace{{\color{#D85A30}{r}}}_{\text{reflected / incoming}} = \frac{{\color{#378ADD}{n_{1}}} - {\color{#1D9E75}{n_{2}}}}{{\color{#378ADD}{n_{1}}} + {\color{#1D9E75}{n_{2}}}} \qquad \underbrace{r \lt 0}_{\text{into higher index: phase } \pi}`);
  const run = RUN(ctl, tt => {
    pick(ctl, "i", cur);
    const [n1, n2, nm] = P[cur], r = (n1 - n2) / (n1 + n2), tr = 1 + r, lv = 140, om = 2 * Math.PI * 0.5 * tt, xb = 340;
    let s = `<rect x="40" y="20" width="${xb - 40}" height="140" fill="${BL}" fill-opacity="${0.06 * n1}"/><rect x="${xb}" y="20" width="${640 - xb}" height="140" fill="${BL}" fill-opacity="${0.06 * n2}"/>` + vline(xb, 20, 160, "var(--t)");
    s += lab(50, 36, "n₁ = " + n1, "start", "t", BL) + lab(630, 36, "n₂ = " + n2, "end", "t", TL);
    let dt = "", di = "", dr = "", dtr = "";
    for (let x = 40; x <= 640; x += 3) { const u = x - xb;
      if (x <= xb) { const ei = Math.cos(2 * Math.PI * n1 * u / lv - om), er = r * Math.cos(-2 * Math.PI * n1 * u / lv - om); dt += (dt ? "L" : "M") + x + " " + (90 - 40 * (ei + er)).toFixed(1); di += (di ? "L" : "M") + x + " " + (210 - 24 * ei).toFixed(1); dr += (dr ? "L" : "M") + x + " " + (210 - 24 * Math.sign(r) * Math.cos(-2 * Math.PI * n1 * u / lv - om)).toFixed(1); }
      else { dtr += (dtr ? "L" : "M") + x + " " + (90 - 40 * tr * Math.cos(2 * Math.PI * n2 * u / lv - om)).toFixed(1); } }
    s += `<path d="${dt}${dtr.replace("M", "L")}" fill="none" stroke="var(--t)" stroke-width="2"/>` + lab(50, 152, "total field, moving", "start", "ts");
    s += hline(40, xb, 210, "var(--line)") + `<path d="${di}" fill="none" stroke="${BL}" stroke-width="2"/><path d="${dr}" fill="none" stroke="${CO}" stroke-width="2.2" stroke-dasharray="6 3"/>`;
    const vi = Math.cos(-om), vr = Math.sign(r) * Math.cos(-om);
    s += dot(xb, 210 - 24 * vi, BL, 5) + dot(xb + 10, 210 - 24 * vr, CO, 5);
    s += lab(360, 196, "at the interface:", "start", "ts") + lab(360, 212, r < 0 ? "opposite signs, phase π" : "same sign, phase 0", "start", "th", r < 0 ? CO : TL);
    s += lab(50, 250, "blue: incoming wave. Coral dashed: reflected wave, drawn at full height to show its sign", "start", "ts");
    const X = v => 360 + v * 140, yN = 292;
    s += `<line x1="${X(-1)}" x2="${X(1)}" y1="${yN}" y2="${yN}" stroke="var(--t)"/>` + [-1, -0.5, 0, 0.5, 1].map(v => vline(X(v), yN - 4, yN + 4, "var(--t)") + lab(X(v), yN + 18, v, "middle")).join("") + dot(X(r), yN, CO, 7) + lab(X(r), yN - 10, "r = " + r.toFixed(3), "middle", "th", CO) + lab(200, yN + 4, "r on a line:", "end", "ts");
    box.innerHTML = svg(318, s);
    $("ro").innerHTML = ro([["interface", nm], ["r", r.toFixed(3)], ["power reflected r²", (r * r * 100).toFixed(2) + " %"], ["phase of the reflection", r < 0 ? "π" : "0"]]);
  });
  ctl.querySelectorAll("button[data-i]").forEach(b => b.onclick = () => { cur = b.dataset.i; run.redraw(); });
}},

/* ---------------- 10. Quarter-wave layers, Eq. 2.5 ---------------- */
{s: "10. Eq. 2.5 Quarter-wave", t: String.raw`Eq. (2.5), quarter-wave layers and the round-trip \(\pi\): \(d_H = \lambda_0/(4n_H)\) and \(d_L = \lambda_0/(4n_L)\)`,
intu: String.raw`Make each layer a quarter wavelength thick in its own material. Light that reflects at the back of a layer has crossed it twice, half a wavelength, which is a phase of \(\pi\). The sign of \(r\) alternates too (card 9). The two effects fit together: every interface into the higher index gives \(\pi\) from the sign, every interface into the lower index gives 0 from the sign plus an odd number of round trips. All reflected waves come back with the phase \(\pi\) (modulo \(2\pi\)) and add. Step through the stack: each arrow on the right is one reflection drawn as a phasor, its length the amplitude and its angle the phase. At the design wavelength they line up. Move the wavelength and the chain curls up.`,
eq: String.raw`\[ d_{H} = \frac{\lambda_{0}}{4n_{H}}, \qquad d_{L} = \frac{\lambda_{0}}{4n_{L}} \]\[ k_{0}nd = \frac{\pi}{2}, \qquad \text{round trip: } 2k_{0}nd = \pi \]<div class="eqref">Thesis Eq. (2.5), Sec. 2.4, Fig. 2.5 (Gačević and Vukmirović 2018, Sec. II A)</div>`,
sym: [[String.raw`\(d_{H}, d_{L}\)`, "thickness of the high-index (GaAs) and low-index (AlGaAs) layer"], [String.raw`\(n_{H}, n_{L}\)`, "high and low index, 3.5 and 3.0 in the examples"], [String.raw`\(\lambda_{0}\)`, "design wavelength in vacuum, 800 nm here"], [String.raw`\(\lambda_0/n\)`, "wavelength inside the layer"], [String.raw`\(k_{0}nd\)`, "phase across one layer, a quarter cycle"], [String.raw`\(2k_{0}nd\)`, "phase of one round trip, down and back up"], ["phasor", "an arrow whose length is the amplitude and whose angle is the phase"]],
how: [String.raw`Read it aloud: "d H equals lambda zero over four n H, d L equals lambda zero over four n L. The phase across one layer is pi over two, a round trip adds pi".`, String.raw`Inside a material the wavelength is \(\lambda_0/n\), so a quarter of it is \(\lambda_0/(4n)\).`, String.raw`Interface into the higher index: sign gives \(\pi\), and the light above it made an even number of round trips. Into the lower index: sign gives 0, and an odd number of round trips adds \(\pi\). Either way the total is \(\pi\) modulo \(2\pi\).`, "The picture adds single reflections only, as in Fig. 2.5. Multiple reflections change the exact numbers but not the alignment at the design wavelength.", "Thesis Eq. (2.5), Sec. 2.4. Treated in Lesson 5 (DBR and air gap)."],
say: "Each layer is a quarter wavelength thick in its material, so a round trip through it adds pi. Together with the alternating sign of r, every reflection returns with the same phase and they all add at the design wavelength.",
num: String.raw`\(\lambda_0 = 800\) nm: \(d_H = 800/(4 \times 3.5) =\) <b>57.1 nm</b>, \(d_L = 800/(4 \times 3.0) =\) <b>66.7 nm</b>.<br>At 900 nm the round trip is \(\pi \times 800/900 = 0.89\pi\), so each new arrow turns by \(0.11\pi\) more than the last.`,
r(fig, ctl) {
  ctl.innerHTML = sl("l", "Wavelength λ (nm)", 650, 1000, 1, 800) + '<div class="readout" id="ro"></div>';
  const box = fbox(fig, String.raw`\underbrace{{\color{#378ADD}{d_{H}}} = \frac{\lambda_{0}}{4n_{H}}, \quad {\color{#1D9E75}{d_{L}}} = \frac{\lambda_{0}}{4n_{L}}}_{\text{quarter wave in each material}} \qquad \underbrace{2k_{0}nd = {\color{#D85A30}{\pi}}}_{\text{one round trip}}`);
  const idx = [1, 3.5, 3.0, 3.5, 3.0, 3.5, 3.0, 3.5, 3.0], rs = []; for (let j = 0; j < 8; j++) rs.push((idx[j] - idx[j + 1]) / (idx[j] + idx[j + 1]));
  const caps = ["Step 1. Air to GaAs: r = −0.556, negative, a phase of π. The first arrow points left (phase π).",
    "Step 2. GaAs to AlGaAs: r is positive (0), but this light crossed one quarter-wave layer down and up: +π. Total π, the arrow points left too.",
    "Step 3. AlGaAs to GaAs: r is negative (π) and two round trips add 2π. Total π modulo 2π. Again left.",
    "Step 4. The pattern continues: every reflection comes back with phase π.", "Step 5. More pairs, more small arrows in line.", "Step 6. The chain only grows longer: the reflections add.", "Step 7. Eight interfaces, four pairs. At λ₀ the chain is a straight line.",
    "Step 8. Now move the wavelength slider away from 800 nm. Each round trip is no longer exactly π and the chain curls up: the reflections partly cancel."];
  const st = STEP(ctl, caps, k => {
    const lam = +$("l").value; $("lv").textContent = lam + " nm";
    const nI = Math.min(k, 8), rt = Math.PI * 800 / lam;
    let s = lab(130, 16, "stack, light from air above", "middle", "th");
    const yI = j => 50 + j * 22;
    s += `<rect x="30" y="20" width="200" height="30" fill="var(--sunk)"/>` + lab(36, 40, "air", "start", "ts");
    for (let j = 0; j < 8; j++) s += `<rect x="30" y="${yI(j)}" width="200" height="22" fill="${BL}" fill-opacity="${j % 2 ? 0.14 : 0.42}"/>` + lab(236, yI(j) + 15, j % 2 ? "L, 66.7 nm" : "H, 57.1 nm", "start", "ts");
    s += arrow(44, 22, 44, 48, "var(--t)", 2);
    let px = 600, py = 140, sumR = 0, sumI = 0; const sc = 200;
    let ph = "";
    for (let j = 0; j < nI; j++) {
      const phase = (rs[j] < 0 ? Math.PI : 0) + j * rt, amp = Math.abs(rs[j]), x = 64 + j * 21;
      s += arrow(x, yI(j) - 2, x, 26, j === nI - 1 ? CO : PU, j === nI - 1 ? 2.4 : 1.4);
      const lp = ((phase / Math.PI) % 2 + 2) % 2;
      const lb = j === 0 ? "π" : j === 1 ? "0+π" : j === 2 ? "π+2π" : "";
      if (lb && j < nI) s += lab(x, 236 + 14 * (j % 2), lb, "middle", "ts", PU);
      const dx = amp * sc * Math.cos(phase), dy = -amp * sc * Math.sin(phase);
      ph += arrow(px.toFixed(1), py.toFixed(1), (px + dx).toFixed(1), (py + dy).toFixed(1), j === nI - 1 ? CO : PU, j === 0 ? 3 : 2);
      px += dx; py += dy; sumR += amp * Math.cos(phase); sumI += amp * Math.sin(phase);
      if (j === nI - 1) s += lab(500, 250, "newest arrow: phase " + lp.toFixed(2) + "π", "middle", "ts", CO);
    }
    s += lab(8, 236, "phases:", "start", "ts");
    s += lab(500, 16, "phasors of the reflections (single reflections)", "middle", "th") + hline(330, 660, 140, "var(--line)") + vline(600, 40, 230, "var(--line)") + lab(606, 54, "Im", "start", "ts") + lab(656, 156, "Re", "end", "ts") + ph;
    s += lab(340, 156, "phase π = pointing left", "start", "ts");
    box.innerHTML = svg(262, s);
    $("ro").innerHTML = ro([["round trip per layer", (rt / Math.PI).toFixed(3) + "π"], ["interfaces drawn", nI], ["length of the chain |Σ r|", Math.hypot(sumR, sumI).toFixed(3)], ["if all in line", rs.slice(0, nI).reduce((a, v) => a + Math.abs(v), 0).toFixed(3)]]);
  });
  $("l").oninput = st.redraw;
}},

/* ---------------- 11. Peak reflectance, Eq. 2.6 ---------------- */
{s: "11. Eq. 2.6 Peak R", t: String.raw`Eq. (2.6), peak reflectance of \(N\) pairs: \(R = \left[(1 - (n_H/n_L)^{2N})/(1 + (n_H/n_L)^{2N})\right]^2\)`,
intu: String.raw`With all reflections in phase, the stack reflects more with every pair, and Eq. (2.6) says how fast. Everything depends on one number, the index ratio raised to the power \(2N\). That number grows exponentially with the number of pairs, so the fraction in the bracket goes toward \(-1\) and the reflectance toward 1. A small ratio means slow growth and therefore many pairs. GaAs and AlGaAs differ by only about 15 %, so tens of pairs are needed for a mirror that reflects nearly everything. The formula holds at the design wavelength with air on both sides of the stack. The readout checks it against an exact transfer-matrix calculation.`,
eq: String.raw`\[ R = \left[\frac{1 - (n_{H}/n_{L})^{2N}}{1 + (n_{H}/n_{L})^{2N}}\right]^{2} \]<div class="eqref">Thesis Eq. (2.6), Sec. 2.4, at \(\lambda_0\), air on both sides (Gačević and Vukmirović 2018, Eq. (2))</div>`,
sym: [[String.raw`\(R\)`, "peak power reflectance of the stack, at the design wavelength"], [String.raw`\(n_{H}/n_{L}\)`, "index ratio, 3.5/3.0 = 1.167 in the examples"], [String.raw`\(N\)`, "number of high and low pairs (a count, not the effective index)"], [String.raw`\((n_H/n_L)^{2N}\)`, "grows exponentially with the number of pairs"], [String.raw`\([\,\cdot\,]^{2}\)`, "square: field ratio to power"]],
how: [String.raw`Read it aloud: "R equals the square of one minus n H over n L to the two N, over one plus n H over n L to the two N".`, String.raw`The bracket is the field reflection of the whole stack at \(\lambda_0\). Squaring it gives the power.`, String.raw`For large \(N\) the power \((n_H/n_L)^{2N}\) dominates both numerator and denominator, the bracket goes to \(-1\) and \(R\) to 1. The minus sign is the phase \(\pi\) of card 10.`, String.raw`Doubling the contrast ratio does far more than doubling the pairs: the ratio sits in the base of the power.`, "Thesis Eq. (2.6), Sec. 2.4. Treated in Lesson 5 (DBR and air gap)."],
say: String.raw`The peak reflectance of \(N\) quarter-wave pairs with air on both sides depends only on \((n_H/n_L)^{2N}\). The GaAs to AlGaAs ratio is small, so many pairs are needed.`,
num: String.raw`3.5/3.0, ratio 1.167: 10 pairs <b>83.2 %</b>, 14 pairs <b>94.8 %</b>, 20 pairs <b>99.2 %</b>.<br>One pair: \(1.167^2 = 1.36\), \(R = (0.36/2.36)^2 =\) <b>2.3 %</b>.`,
r(fig, ctl) {
  ctl.innerHTML = sl("N", "Number of pairs N", 1, 30, 1, 10) + sl("nl", "Low index n<sub>L</sub> (n<sub>H</sub> = 3.5)", 2.6, 3.4, 0.05, 3.0) + '<div class="readout" id="ro"></div>';
  const box = fbox(fig, String.raw`\underbrace{{\color{#D85A30}{R}}}_{\text{peak}} = \Bigg[\frac{1 - \overbrace{({\color{#378ADD}{n_{H}}}/{\color{#1D9E75}{n_{L}}})^{2{\color{#7F77DD}{N}}}}^{\text{grows with pairs}}}{1 + ({\color{#378ADD}{n_{H}}}/{\color{#1D9E75}{n_{L}}})^{2{\color{#7F77DD}{N}}}}\Bigg]^{2}`);
  const Rf = (q, N) => { const p = Math.pow(q, 2 * N); return Math.pow((1 - p) / (1 + p), 2); }, Ns = range(0, 30, 121);
  const x0 = 300, y0 = 20, w = 350, h = 170, A = ax(x0, y0, w, h, 0, 30, 0, 1);
  const draw = () => {
    const N = +$("N").value, nl = +$("nl").value; $("Nv").textContent = N; $("nlv").textContent = nl.toFixed(2);
    const q = 3.5 / nl, R = Rf(q, N), Rt = C2.tmmR(1, C2.dbrLayers(3.5, nl, N, 800), 1, 800);
    let s = "";
    const show = Math.min(N, 9);
    for (let k = 0; k < 2 * show; k++) s += `<rect x="30" y="${30 + 9 * k}" width="120" height="9" fill="${BL}" fill-opacity="${k % 2 ? 0.14 : 0.42}"/>`;
    s += lab(90, 22, "air", "middle", "ts") + lab(90, 46 + 18 * show, N > 9 ? "… " + N + " pairs, air below" : N + " pair" + (N > 1 ? "s" : "") + ", air below", "middle", "ts");
    s += arrow(160, 30, 160, 60, "var(--t)", 1.5) + `<rect x="200" y="${y0 + h - R * h}" width="40" height="${R * h}" fill="${CO}" fill-opacity="0.6"/>` + frame(200, y0, 40, h) + lab(220, y0 + h + 16, "R", "middle", "t", CO) + lab(220, y0 + h - R * h - 6, (R * 100).toFixed(1) + " %", "middle", "ts", CO);
    s += frame(x0, y0, w, h) + plot(x0, y0, w, h, Ns, Ns.map(v => Rf(7 / 6, v)), 0, 30, 0, 1, "var(--b)", 1.5, "4 3") + plot(x0, y0, w, h, Ns, Ns.map(v => Rf(q, v)), 0, 30, 0, 1, CO, 2.5);
    s += dot(A.X(N), A.Y(R), CO, 6) + lab(x0 + w - 6, A.Y(0.08), "grey dashed: 3.5/3.0 for reference", "end", "ts");
    s += xticks(x0, y0, w, h, 0, 30, [0, 5, 10, 15, 20, 25, 30]) + yticks(x0, y0, w, h, 0, 1, [0, 0.5, 1]);
    s += lab(x0 + w / 2, y0 + h + 32, "number of pairs N", "middle") + ytitle(x0 - 34, y0 + h / 2, "peak R");
    box.innerHTML = svg(232, s);
    $("ro").innerHTML = ro([["ratio n<sub>H</sub>/n<sub>L</sub>", q.toFixed(3)], ["(n<sub>H</sub>/n<sub>L</sub>)<sup>2N</sup>", Math.pow(q, 2 * N) < 1e5 ? Math.pow(q, 2 * N).toFixed(2) : Math.pow(q, 2 * N).toExponential(2)], ["R from Eq. (2.6)", (R * 100).toFixed(2) + " %"], ["R exact transfer matrix at λ₀", (Rt * 100).toFixed(2) + " %"]]);
  };
  $("N").oninput = draw; $("nl").oninput = draw; draw();
}},

/* ---------------- 12. Stopband, Eq. 2.7 ---------------- */
{s: "12. Eq. 2.7 Stopband", t: String.raw`Eq. (2.7), the stopband: \(\Delta\lambda_0 \approx (4\lambda_0/\pi)\arcsin\!\left((n_H - n_L)/(n_H + n_L)\right)\)`,
intu: String.raw`The reflections line up exactly only at the design wavelength. Close to it they still line up well enough for a high reflectance, and the band where that holds is the stopband. Its full width depends only on the contrast of one interface, \((n_H - n_L)/(n_H + n_L)\), which is the size of \(r\) from card 9. It does not depend on the number of pairs: more pairs make the top flatter and the edges steeper, but the band stays the same width. A small contrast therefore means many pairs and a narrow band at the same time. Move the pairs slider and watch the width stay put, then move the low index.`,
eq: String.raw`\[ \Delta\lambda_{0} \approx \frac{4\lambda_{0}}{\pi}\arcsin\!\left(\frac{n_{H} - n_{L}}{n_{H} + n_{L}}\right) \]<div class="eqref">Thesis Eq. (2.7), Sec. 2.4, full width (Gačević and Vukmirović 2018, Eq. (3))</div>`,
sym: [[String.raw`\(\Delta\lambda_{0}\)`, "full width of the stopband, in nm"], [String.raw`\(\lambda_{0}\)`, "design wavelength"], [String.raw`\(\arcsin\)`, "inverse sine"], [String.raw`\((n_H - n_L)/(n_H + n_L)\)`, "contrast of one interface, the size of r"], [String.raw`\(\approx\)`, "approximately: the edges are not perfectly sharp"]],
how: [String.raw`Read it aloud: "delta lambda zero is about four lambda zero over pi times the arcsine of n H minus n L over n H plus n L".`, String.raw`For a small contrast \(\arcsin u \approx u\), so the width is about \(4\lambda_0/\pi\) times the interface contrast, roughly proportional to \(n_H - n_L\).`, "No N appears in the formula. The number of pairs sets the height of the top, not its width.", "The plot is the exact transfer-matrix spectrum for air on both sides. The amber arrow is the formula width.", "Thesis Eq. (2.7), Sec. 2.4. Treated in Lesson 5 (DBR and air gap)."],
say: "The full stopband width is about four lambda zero over pi times the arcsine of the interface contrast. It depends only on the contrast, so GaAs and AlGaAs give a narrow band that more pairs do not widen.",
num: String.raw`3.5/3.0 at 800 nm: contrast \(0.5/6.5 = 0.0769\), \(\Delta\lambda_0 = (3200/\pi) \times 0.0770 \approx\) <b>78 nm</b>.<br>3.5/2.6: contrast 0.148, about <b>152 nm</b>.`,
r(fig, ctl) {
  ctl.innerHTML = sl("N", "Number of pairs N", 1, 30, 1, 10) + sl("nl", "Low index n<sub>L</sub> (n<sub>H</sub> = 3.5)", 2.6, 3.4, 0.05, 3.0) + '<div class="readout" id="ro"></div>';
  const box = fbox(fig, String.raw`\underbrace{{\color{#BA7517}{\Delta\lambda_{0}}}}_{\text{full width}} \approx \frac{4{\color{#D85A30}{\lambda_{0}}}}{\pi}\arcsin\!\Bigg(\underbrace{\frac{{\color{#378ADD}{n_{H}}} - {\color{#1D9E75}{n_{L}}}}{{\color{#378ADD}{n_{H}}} + {\color{#1D9E75}{n_{L}}}}}_{\text{contrast of one interface}}\Bigg) \qquad \text{no } N`);
  const ls = range(600, 1050, 226), x0 = 80, y0 = 20, w = 560, h = 170, A = ax(x0, y0, w, h, 600, 1050, 0, 1);
  const draw = () => {
    const N = +$("N").value, nl = +$("nl").value; $("Nv").textContent = N; $("nlv").textContent = nl.toFixed(2);
    const layers = C2.dbrLayers(3.5, nl, N, 800), Rs = ls.map(l => C2.tmmR(1, layers, 1, l)), c = (3.5 - nl) / (3.5 + nl), dl = 3200 / Math.PI * Math.asin(c);
    let s = `<rect x="${A.X(800 - dl / 2)}" y="${y0}" width="${A.X(800 + dl / 2) - A.X(800 - dl / 2)}" height="${h}" fill="${AM}" fill-opacity="0.1"/>` + frame(x0, y0, w, h);
    s += plot(x0, y0, w, h, ls, Rs, 600, 1050, 0, 1, CO, 2.2) + vline(A.X(800), y0, y0 + h, "var(--t)", "2 3");
    s += arrow(A.X(800 - dl / 2), A.Y(0.06), A.X(800 + dl / 2), A.Y(0.06), AM, 1.8, "", true) + lab(A.X(800), A.Y(0.06) - 8, "Δλ₀ ≈ " + dl.toFixed(0) + " nm", "middle", "th", AM);
    s += xticks(x0, y0, w, h, 600, 1050, [600, 700, 800, 900, 1000]) + yticks(x0, y0, w, h, 0, 1, [0, 0.5, 1]);
    s += lab(x0 + w / 2, y0 + h + 32, "wavelength (nm), exact transfer matrix, air on both sides", "middle") + ytitle(34, y0 + h / 2, "reflectance R");
    box.innerHTML = svg(232, s);
    $("ro").innerHTML = ro([["interface contrast", c.toFixed(4)], ["stopband Δλ₀ (formula)", dl.toFixed(1) + " nm"], ["R at 800 nm", (C2.tmmR(1, layers, 1, 800) * 100).toFixed(1) + " %"]]);
  };
  $("N").oninput = draw; $("nl").oninput = draw; draw();
}},

/* ---------------- 13. Air gap ---------------- */
{s: "13. The air gap", t: String.raw`The air gap: the returning light's phase decides add or cancel`,
intu: String.raw`Light that the grating sends downward crosses the air gap, is reflected by the DBR and returns to the grating, where it meets the light that went straight up. The distance between grating and mirror sets the phase of the returning light relative to the upward light, and that phase decides whether the two add or cancel. Because the light crosses the gap twice, the phase grows by \(2\pi\) for every half wavelength of gap, so the pattern repeats. The thesis states this in words. The picture uses the simplest two-beam model to show it, a direct beam of amplitude 1 plus a returning beam of amplitude \(\sqrt{R}\). In the real device the gap also changes how strongly the grating scatters, which is why the gap is chosen together with the grating. Press Play to sweep the gap.`,
eq: String.raw`<div class="eqnote">Illustration only, not a thesis equation: two beams, amplitude 1 and \(\sqrt{R}\)</div>\[ U \propto \left|1 + \sqrt{R}\,e^{i\delta}\right|^{2}, \qquad \delta = 2k_{0}t_{\mathrm{box}} + \varphi_{\mathrm{DBR}} \]<div class="eqref">Sec. 2.4, last paragraph (Taillaert et al. 2006). No equation number.</div>`,
sym: [[String.raw`\(U\)`, "upward power relative to the case without mirror (illustration)"], [String.raw`\(\sqrt{R}\)`, "field amplitude of the beam that went down and came back"], [String.raw`\(e^{i\delta}\)`, "its phase factor relative to the direct beam"], [String.raw`\(\delta\)`, "phase of the returning light relative to the upward light"], [String.raw`\(t_{\mathrm{box}}\)`, "air gap thickness between membrane and DBR"], [String.raw`\(2k_{0}t_{\mathrm{box}}\)`, "phase for crossing the gap down and back up"], [String.raw`\(\varphi_{\mathrm{DBR}}\)`, String.raw`reflection phase of the mirror, \(\pi\) for a stack starting with GaAs (card 10)`]],
how: [String.raw`Read it aloud: "the upward power goes as the squared size of one plus root R e to the i delta, with delta two k zero times the gap plus the mirror phase".`, String.raw`Add the two beams as arrows (bottom left), then square the length: \(U \propto 1 + R + 2\sqrt{R}\cos\delta\).`, String.raw`\(\delta = 0\) modulo \(2\pi\): the arrows line up and the upward power nearly quadruples in this model. \(\delta = \pi\): they cancel.`, String.raw`\(\delta\) grows by \(2\pi\) when the gap grows by \(\lambda_0/2\), so the pattern repeats every 400 nm at 800 nm.`, "Thesis Sec. 2.4, last paragraph, no equation number. Treated in Lesson 5 (DBR and air gap)."],
say: "The distance between the grating and the DBR sets the phase of the light that comes back up relative to the light radiated directly upward, so it decides whether they add or cancel, and it must be chosen together with the grating.",
num: String.raw`Illustration with \(R = 0.83\) (10 pairs of 3.5/3.0), 800 nm: repeats every <b>400 nm</b> of gap.<br>Best \((1 + 0.911)^2 \approx\) <b>3.65</b>, worst \((1 - 0.911)^2 \approx\) <b>0.008</b> times the value without mirror.`,
r(fig, ctl) {
  ctl.innerHTML = sl("g", "Air gap t<sub>box</sub> (nm)", 0, 1200, 5, 300) + '<div class="readout" id="ro"></div>';
  const box = fbox(fig, String.raw`\underbrace{{\color{#D85A30}{U}}}_{\text{upward power}} \propto \Big|\underbrace{1}_{\text{direct}} + \underbrace{{\color{#378ADD}{\sqrt{R}}}\,e^{i{\color{#7F77DD}{\delta}}}}_{\text{back from the DBR}}\Big|^{2}, \qquad {\color{#7F77DD}{\delta}} = \underbrace{2k_{0}{\color{#1D9E75}{t_{\mathrm{box}}}}}_{\text{down and up}} + \varphi_{\mathrm{DBR}}`);
  const R = 0.83, sr = Math.sqrt(R), dl = t => 4 * Math.PI * t / 800 + Math.PI, Uf = t => 1 + R + 2 * sr * Math.cos(dl(t));
  const ts = range(0, 1200, 241), x0 = 320, y0 = 20, w = 330, h = 170, A = ax(x0, y0, w, h, 0, 1200, 0, 4);
  let base = 300;
  const run = RUN(ctl, (tt, on) => {
    if (on) { $("g").value = Math.round((base + tt * 110) % 1200 / 5) * 5; }
    const tg = +$("g").value; $("gv").textContent = tg + " nm";
    const gh = 15 + tg * 0.08, gy = 54 + gh;
    let s = `<rect x="30" y="40" width="200" height="14" fill="${BL}" fill-opacity="0.45"/>`;
    for (let x = 60; x < 210; x += 16) s += `<rect x="${x}" y="34" width="8" height="6" fill="${BL}" fill-opacity="0.6"/>`;
    for (let k = 0; k < 6; k++) s += `<rect x="30" y="${gy + 10 * k}" width="200" height="10" fill="${BL}" fill-opacity="${k % 2 ? 0.14 : 0.42}"/>`;
    s += arrow(70, 32, 70, 6, CO, 2.5) + lab(78, 14, "up", "start", "ts", CO);
    s += arrow(140, 56, 140, gy - 2, PU, 1.5, "4 3") + arrow(175, gy - 2, 175, 6, BL, 2) + lab(183, 14, "√R back", "start", "ts", BL);
    s += arrow(244, 55, 244, gy - 1, "var(--t)", 1, "", true) + lab(250, (55 + gy) / 2 + 4, "t_box", "start", "ts") + lab(130, gy + 74, "DBR", "middle", "ts");
    const d = dl(tg), cx = 70, cy = 250, sc = 46, ex = cx + sc + sc * sr * Math.cos(d), ey = cy - sc * sr * Math.sin(d);
    s += lab(20, 214, "arrows add:", "start", "ts") + arrow(cx, cy, cx + sc, cy, CO, 2.5) + arrow(cx + sc, cy, ex.toFixed(1), ey.toFixed(1), BL, 2.5) + `<line x1="${cx}" y1="${cy}" x2="${ex.toFixed(1)}" y2="${ey.toFixed(1)}" stroke="${TL}" stroke-width="4" opacity="0.6"/>`;
    s += lab(cx + sc / 2, cy + 16, "1", "middle", "ts", CO) + lab(Math.max(ex, cx + sc) + 10, Math.min(ey, cy) - 4, "√R e^(iδ)", "start", "ts", BL) + lab(200, 290, "green: the sum, its length² is U", "middle", "ts", TL);
    s += frame(x0, y0, w, h) + hline(x0, x0 + w, A.Y(1), "var(--t)", "3 3");
    s += plot(x0, y0, w, h, ts, ts.map(Uf), 0, 1200, 0, 4, CO, 2.2) + vline(A.X(tg), y0, y0 + h, "var(--t)", "2 3") + dot(A.X(tg), A.Y(Uf(tg)), CO, 6);
    s += xticks(x0, y0, w, h, 0, 1200, [0, 400, 800, 1200]) + yticks(x0, y0, w, h, 0, 4, [0, 1, 2, 3, 4]);
    s += lab(x0 + w / 2, y0 + h + 32, "air gap (nm), R = 0.83, dotted: no mirror", "middle") + ytitle(x0 - 30, y0 + h / 2, "upward power U");
    box.innerHTML = svg(300, s);
    $("ro").innerHTML = ro([["δ (in units of π, mod 2)", (((d / Math.PI) % 2 + 2) % 2).toFixed(2) + "π"], ["upward power U", Uf(tg).toFixed(2) + " × no mirror"], ["result", Math.cos(d) > 0.3 ? "adds" : Math.cos(d) < -0.3 ? "cancels" : "in between"]]);
  }, false);
  $("g").oninput = () => { base = +$("g").value; run.reset(); run.redraw(); };
}},

/* ---------------- 14. Lateral modes, Eq. 2.8 ---------------- */
{s: "14. Eq. 2.8 Lateral modes", t: String.raw`Eq. (2.8), lateral modes of a wide section: \(k_{y\nu}^2 + \beta_\nu^2 = k_0^2 n_r^2\), \(k_{y\nu} = (\nu + 1)\pi/W_e\)`,
intu: String.raw`The MMI analysis is done in two dimensions. First the membrane thickness is taken into account by giving the core the effective index \(n_r\) of the unpatterned membrane, different for TE-like and TM-like light. What is left is a core of width \(W_M\) and index \(n_r\) in air. Across that width, mode \(\nu\) is a standing wave with \(\nu\) nodes, so it fits \(\nu + 1\) half waves and its lateral wavenumber is \((\nu + 1)\pi/W_e\). The total wavenumber in the core is fixed at \(k_0 n_r\), and like the sides of a right triangle, what is used across the section is missing along it. Higher modes zigzag more steeply and travel with a smaller \(\beta_\nu\). On the right every mode is a point on one circle of radius \(k_0 n_r\).`,
eq: String.raw`\[ k_{y\nu}^{2} + \beta_{\nu}^{2} = k_{0}^{2}n_{r}^{2}, \qquad k_{y\nu} = \frac{(\nu + 1)\pi}{W_{e}} \]<div class="eqnote">\(\nu = 0, 1, \ldots, m - 1\): mode \(\nu\) has \(\nu\) nodes across the width</div><div class="eqref">Thesis Eq. (2.8), Sec. 2.5 (Soldano and Pennings 1995, Eqs. (1) and (3))</div>`,
sym: [[String.raw`\(\nu\)`, "lateral mode number"], [String.raw`\(m\)`, "number of guided lateral modes"], [String.raw`\(k_{y\nu}\)`, "lateral wavenumber of mode ν, across the section"], [String.raw`\(\beta_{\nu}\)`, "propagation constant of mode ν, along the section"], [String.raw`\(k_{0}n_{r}\)`, "total wavenumber in the core"], [String.raw`\(n_{r}\)`, String.raw`effective index of the unpatterned membrane: ${f2(NTE)} TE-like, ${f2(NTM)} TM-like for the textbook slab (thesis: about 3.07 and 2.58)`], [String.raw`\(W_{e}\)`, "effective width of the section (card 15)"], [String.raw`\(y\)`, "lateral direction across the section"]],
how: [String.raw`Read it aloud: "k y nu squared plus beta nu squared equals k zero squared n r squared, with k y nu equal to nu plus one times pi over W e".`, "The first part is Pythagoras for the wave vector: across squared plus along squared equals the whole squared.", String.raw`The second part counts half waves: \(\nu + 1\) of them fit in \(W_e\), so the lateral wavelength is \(2W_e/(\nu + 1)\).`, String.raw`A mode is guided as long as \(\beta_\nu \gt k_0 n_c\). That sets how many modes \(m\) a section carries.`, "Thesis Eq. (2.8), Sec. 2.5. Treated in Lesson 6 (MMI self-imaging)."],
say: String.raw`Across the section mode \(\nu\) is a standing wave with \(\nu + 1\) half waves in the effective width, and its lateral and longitudinal wavenumbers add in squares to \(k_0^2 n_r^2\).`,
num: String.raw`TE-like, \(n_r = ${f2(NTE)}\), \(W_e = 2\) µm, 800 nm: \(k_0 n_r = ${(2 * Math.PI / 0.8 * NTE).toFixed(1)}\) rad/µm, \(k_{y0} = \pi/2 = 1.57\) rad/µm, so \(\beta_0/k_0 = ${(Math.sqrt(Math.pow(2 * Math.PI / 0.8 * NTE, 2) - Math.pow(Math.PI / 2, 2)) / (2 * Math.PI / 0.8)).toFixed(4)}\).<br>Number of guided modes: about <b>${Math.floor(2 * 2 * Math.sqrt(NTE * NTE - 1) / 0.8)}</b>.`,
r(fig, ctl) {
  let pol = "TE", nu = 0;
  ctl.innerHTML = `<div class="row"><button data-p="TE">TE-like n<sub>r</sub></button><button data-p="TM">TM-like n<sub>r</sub></button></div>` + btns([[0, "ν = 0"], [1, "ν = 1"], [2, "ν = 2"], [3, "ν = 3"]], "u") + sl("W", "Effective width Wₑ (µm)", 0.4, 4, 0.05, 2) + '<div class="readout" id="ro"></div>';
  const box = fbox(fig, String.raw`\underbrace{{\color{#D85A30}{k_{y\nu}}}^{2}}_{\text{across}} + \underbrace{{\color{#378ADD}{\beta_{\nu}}}^{2}}_{\text{along}} = \underbrace{k_{0}^{2}{\color{#7F77DD}{n_{r}}}^{2}}_{\text{total}}, \qquad {\color{#D85A30}{k_{y\nu}}} = \frac{({\color{#1D9E75}{\nu}} + 1)\pi}{W_{e}}`);
  const ys = range(0, 1, 80), MC = [CO, BL, TL, PU];
  const draw = () => {
    pick(ctl, "p", pol); pick(ctl, "u", nu);
    const W = +$("W").value; $("Wv").textContent = W.toFixed(2) + " µm";
    const nr = pol === "TE" ? NTE : NTM, k0 = 2 * Math.PI / 0.8, kt = k0 * nr, m = Math.floor(2 * W * Math.sqrt(nr * nr - 1) / 0.8);
    let s = lab(170, 16, "lateral modes across the width", "middle", "th") + vline(80, 26, 214, "var(--p)") + vline(280, 26, 214, "var(--p)");
    for (let v = 0; v < 4; v++) {
      const yb = 50 + 48 * v;
      s += hline(80, 280, yb, "var(--t)", "2 3") + lab(20, yb + 4, "ν = " + v, "start", "ts", v === nu ? MC[v] : "");
      s += plot(80, yb - 18, 200, 36, ys, ys.map(y => Math.sin((v + 1) * Math.PI * y)), 0, 1, -1, 1, MC[v], v === nu ? 3 : 1.4);
      s += lab(288, yb + 4, (v + 1) + " half wave" + (v ? "s" : ""), "start", "ts");
    }
    s += arrow(82, 228, 278, 228, "var(--t)", 1, "", true) + lab(180, 244, "Wₑ = " + W.toFixed(2) + " µm", "middle", "ts");
    const cx = 420, cy = 226, Rr = 200, ang = v => Math.asin(Math.min(1, (v + 1) * Math.PI / W / kt));
    s += `<path d="M${cx + Rr} ${cy} A ${Rr} ${Rr} 0 0 0 ${cx} ${cy - Rr}" fill="none" stroke="${PU}" stroke-width="1.5" stroke-dasharray="5 3"/>` + hline(cx, cx + Rr + 14, cy, "var(--t)") + vline(cx, cy - Rr + 10, cy, "var(--t)");
    s += lab(cx + Rr + 6, cy + 16, "β", "end", "t", BL) + lab(cx - 6, cy - Rr + 22, "k_y", "end", "t", CO) + lab(cx + Rr * 0.72, cy - Rr * 0.74, "radius k₀n_r", "start", "ts", PU);
    const xc = cx + Rr / nr; s += vline(xc, cy - Rr * 0.85, cy, TL, "3 3") + lab(xc + 4, cy - 100, "guiding limit", "start", "ts", TL) + lab(xc + 4, cy - 86, "β = k₀n_c", "start", "ts", TL);
    for (let v = 0; v < Math.min(m, 40); v++) { const a = ang(v); s += dot(cx + Rr * Math.cos(a), cy - Rr * Math.sin(a), v === nu ? MC[nu] : "var(--b)", v === nu ? 6 : 3); }
    if (nu < m) { const a = ang(nu), px = cx + Rr * Math.cos(a), py = cy - Rr * Math.sin(a);
      s += `<line x1="${cx}" y1="${cy}" x2="${px}" y2="${py}" stroke="${PU}" stroke-width="2"/>` + `<line x1="${px}" y1="${py}" x2="${px}" y2="${cy}" stroke="${CO}" stroke-width="2.5"/>` + `<line x1="${cx}" y1="${cy - 3}" x2="${px}" y2="${cy - 3}" stroke="${BL}" stroke-width="2.5"/>`; }
    box.innerHTML = svg(254, s);
    const ky = (nu + 1) * Math.PI / W, b = Math.sqrt(Math.max(0, kt * kt - ky * ky));
    $("ro").innerHTML = ro([["n<sub>r</sub>", nr.toFixed(3)], ["k<sub>yν</sub> = (ν + 1)π/Wₑ", ky.toFixed(3) + " rad/µm"], ["β<sub>ν</sub>/k₀", nu < m ? (b / k0).toFixed(4) : "not guided"], ["guided modes m", m]]);
  };
  ctl.querySelectorAll("button[data-p]").forEach(b => b.onclick = () => { pol = b.dataset.p; draw(); });
  ctl.querySelectorAll("button[data-u]").forEach(b => b.onclick = () => { nu = +b.dataset.u; draw(); });
  $("W").oninput = draw; draw();
}},

/* ---------------- 15. Effective width, Eq. 2.9 ---------------- */
{s: "15. Eq. 2.9 Effective width", t: String.raw`Eq. (2.9), the effective width \(W_e\) with \(\sigma\) swapped for the membrane`,
intu: String.raw`The field of a mode does not stop exactly at the side walls. It reaches a little way into the air, so the width the modes feel, \(W_e\), is slightly larger than the physical width \(W_M\). Eq. (2.9) gives the extra width, and it depends on which way the electric field points at the side walls. In the two-dimensional problem \(\sigma = 0\) for TE and \(\sigma = 1\) for TM, where the side walls take the place of the slab surfaces. For the membrane the names swap. The TE-like main field \(E_y\) is normal to the side walls, so it behaves like TM in the 2D problem and gets \(\sigma = 1\). The TM-like main field \(E_z\) runs along the side walls, so it gets \(\sigma = 0\). With \(\sigma = 1\) the factor \((n_c/n_r)^2\) shrinks the correction about tenfold.`,
eq: String.raw`\[ W_{e} \approx W_{M} + \frac{\lambda_{0}}{\pi}\left(\frac{n_{c}}{n_{r}}\right)^{2\sigma}\left(n_{r}^{2} - n_{c}^{2}\right)^{-1/2} \]<div class="eqnote">2D problem: \(\sigma = 0\) for TE, \(\sigma = 1\) for TM. Membrane: \(\sigma = 1\) for TE-like, \(\sigma = 0\) for TM-like</div><div class="eqref">Thesis Eq. (2.9), Sec. 2.5 (Soldano and Pennings 1995, Eq. (4))</div>`,
sym: [[String.raw`\(W_{e}\)`, "effective width felt by the modes"], [String.raw`\(W_{M}\)`, "physical width of the multimode section"], [String.raw`\(\lambda_{0}/\pi\)`, "length scale of the penetration into the walls"], [String.raw`\(n_{c}\)`, "index beside the section, air, 1"], [String.raw`\(n_{r}\)`, "core index of the 2D problem (card 14)"], [String.raw`\(\sigma\)`, "0 or 1, set by whether E is along or normal to the side walls"], [String.raw`\((n_r^2 - n_c^2)^{-1/2}\)`, "one over the square root: a stronger contrast gives a smaller correction"]],
how: [String.raw`Read it aloud: "W e is about W M plus lambda zero over pi times n c over n r to the two sigma, times n r squared minus n c squared to the minus one half".`, "The extra width is the penetration of the field into the air on both walls together.", String.raw`When \(\mathbf{E}\) is normal to a wall it jumps up just outside (the same rule as Eq. (2.1)), so the field reaches the wall with a smaller slope inside and the correction carries the extra factor \((n_c/n_r)^2\).`, String.raw`In the picture the dashed box is \(W_e\), the solid box \(W_M\), and the curve the fundamental mode, reaching zero at the dashed lines.`, "Thesis Eq. (2.9), Sec. 2.5. Treated in Lesson 6 (MMI self-imaging)."],
say: String.raw`The modes see an effective width slightly larger than the physical width, because the field reaches into the air. For the membrane the TE-like mode has \(\sigma = 1\) because its main field is normal to the side walls, and the TM-like mode has \(\sigma = 0\).`,
num: String.raw`Textbook \(n_r\), air, 800 nm:<br>TE-like (\(n_r = ${f2(NTE)}\), \(\sigma = 1\)): extra width <b>${(800 / Math.PI * Math.pow(1 / NTE, 2) / Math.sqrt(NTE * NTE - 1)).toFixed(1)} nm</b>.<br>TM-like (\(n_r = ${f2(NTM)}\), \(\sigma = 0\)): extra width <b>${(800 / Math.PI / Math.sqrt(NTM * NTM - 1)).toFixed(0)} nm</b>.`,
r(fig, ctl) {
  let pol = "TE";
  ctl.innerHTML = `<div class="row"><button data-p="TE">TE-like (σ = 1)</button><button data-p="TM">TM-like (σ = 0)</button></div>` + sl("W", "Physical width W<sub>M</sub> (nm)", 300, 3000, 10, 800) + '<div class="readout" id="ro"></div>';
  const box = fbox(fig, String.raw`\underbrace{{\color{#D85A30}{W_{e}}}}_{\text{felt by the modes}} \approx \underbrace{{\color{#378ADD}{W_{M}}}}_{\text{physical}} + \underbrace{\frac{\lambda_{0}}{\pi}\left(\frac{n_{c}}{n_{r}}\right)^{2{\color{#7F77DD}{\sigma}}}\left(n_{r}^{2} - n_{c}^{2}\right)^{-1/2}}_{\text{reach into the air, both walls}}`);
  const draw = () => {
    pick(ctl, "p", pol);
    const W = +$("W").value; $("Wv").textContent = W + " nm";
    const nr = pol === "TE" ? NTE : NTM, sg = pol === "TE" ? 1 : 0, dW = 800 / Math.PI * Math.pow(1 / nr, 2 * sg) / Math.sqrt(nr * nr - 1), We = W + dW;
    const cx = 250, sc = 360 / We, xl = cx - W / 2 * sc, xr = cx + W / 2 * sc, el = cx - We / 2 * sc, er = cx + We / 2 * sc;
    let s = lab(250, 18, "top view of the section, field of mode ν = 0 across y", "middle", "th");
    s += `<rect x="${xl}" y="40" width="${xr - xl}" height="150" fill="${BL}" fill-opacity="0.18" stroke="${BL}" stroke-width="2"/>`;
    s += `<rect x="${el}" y="36" width="${er - el}" height="158" fill="none" stroke="${CO}" stroke-width="1.6" stroke-dasharray="6 3"/>`;
    const ys = range(el, er, 120); let d = "";
    ys.forEach((x, i) => d += (i ? "L" : "M") + x.toFixed(1) + " " + (180 - 120 * Math.sin(Math.PI * (x - el) / (er - el))).toFixed(1));
    s += `<path d="${d}" fill="none" stroke="${TL}" stroke-width="2.5"/>`;
    s += arrow(xl, 210, xr, 210, BL, 1.2, "", true) + lab(cx, 226, "W_M = " + W + " nm", "middle", "ts", BL) + arrow(el, 244, er, 244, CO, 1.2, "", true) + lab(cx, 262, "Wₑ = " + We.toFixed(1) + " nm", "middle", "ts", CO);
    s += lab(470, 50, "main field at the side walls:", "start", "th");
    const ar = pol === "TE";
    s += `<rect x="490" y="80" width="120" height="90" fill="${BL}" fill-opacity="0.15" stroke="var(--t)"/>` + lab(550, 194, "section, side walls left and right", "middle", "ts");
    if (ar) { for (const y of [100, 125, 150]) s += arrow(500, y, 600, y, CO, 2.2); s += lab(470, 222, "TE-like: E_y normal to the walls", "start", "ts", CO) + lab(470, 238, "acts as TM in 2D, so σ = 1", "start", "ts", CO); }
    else { for (const x of [515, 550, 585]) s += `<circle cx="${x}" cy="125" r="8" fill="none" stroke="${CO}" stroke-width="2"/><circle cx="${x}" cy="125" r="2.5" fill="${CO}"/>`; s += lab(470, 222, "TM-like: E_z along the walls (out of page)", "start", "ts", CO) + lab(470, 238, "acts as TE in 2D, so σ = 0", "start", "ts", CO); }
    box.innerHTML = svg(272, s);
    $("ro").innerHTML = ro([["n<sub>r</sub>, σ", nr.toFixed(3) + ", " + sg], ["extra width Wₑ − W<sub>M</sub>", dW.toFixed(1) + " nm"], ["relative to W<sub>M</sub>", (dW / W * 100).toFixed(2) + " %"]]);
  };
  ctl.querySelectorAll("button[data-p]").forEach(b => b.onclick = () => { pol = b.dataset.p; draw(); });
  $("W").oninput = draw; draw();
}},

/* ---------------- 16. Quadratic law and L_pi, Eq. 2.10 ---------------- */
{s: "16. Eq. 2.10 Beat length", t: String.raw`Eq. (2.10), the quadratic law and the beat length \(L_\pi\)`,
intu: String.raw`When the section is wide, the lateral wavenumber is small compared with the total, and the square root in Eq. (2.8) can be expanded to first order. Then \(\beta_\nu\) falls below \(k_0 n_r\) by an amount proportional to \((\nu + 1)^2\). The two lowest modes differ by the smallest step, and the length over which their phase difference reaches \(\pi\) is the beat length \(L_\pi\). The quadratic law has a neat consequence: over a length \(L\), mode \(\nu\) falls behind the fundamental mode by \(\nu(\nu + 2)\pi L/(3L_\pi)\), and \(\nu(\nu + 2) = 0, 3, 8, 15, 24, \ldots\) are all integers. That is the seed of self-imaging. The plot compares the exact phase steps from Eq. (2.8) with these integers. Make the section narrow and watch the dots leave the line: this is why the thesis takes \(n_0\) and \(n_1\) from the mode solver for its narrow sections.`,
eq: String.raw`\[ \beta_{\nu} \approx k_{0}n_{r} - \frac{(\nu + 1)^{2}\pi\lambda_{0}}{4n_{r}W_{e}^{2}} \]\[ L_{\pi} = \frac{\pi}{\beta_{0} - \beta_{1}} \approx \frac{4n_{r}W_{e}^{2}}{3\lambda_{0}} \]<div class="eqnote">Phase of mode \(\nu\) behind mode 0 after a length \(L\): \(\nu(\nu + 2)\pi L/(3L_\pi)\)</div><div class="eqref">Thesis Eq. (2.10), Sec. 2.5 (Soldano and Pennings 1995, Eqs. (5) to (7))</div>`,
sym: [[String.raw`\(\beta_{\nu}\)`, "propagation constant of lateral mode ν"], [String.raw`\(k_0 n_r\)`, String.raw`the value every \(\beta_\nu\) approaches for a very wide section`], [String.raw`\((\nu + 1)^{2}\)`, "the quadratic dependence on mode number"], [String.raw`\(L_{\pi}\)`, "beat length of the two lowest modes"], [String.raw`\(\beta_{0} - \beta_{1}\)`, "their difference of propagation constants"], [String.raw`\(\nu(\nu + 2)\)`, String.raw`the integers 0, 3, 8, 15, 24, …: \((\nu + 1)^2 - 1\)`], [String.raw`\(W_{e}\)`, "effective width (card 15)"]],
how: [String.raw`Read it aloud: "beta nu is about k zero n r minus nu plus one squared pi lambda zero over four n r W e squared. The beat length L pi is pi over beta zero minus beta one, about four n r W e squared over three lambda zero".`, String.raw`Write \(\beta_\nu = k_0 n_r\sqrt{1 - (k_{y\nu}/k_0 n_r)^2}\) and use \(\sqrt{1 - u} \approx 1 - u/2\). With \(k_{y\nu} = (\nu + 1)\pi/W_e\) this gives the first formula.`, String.raw`\(\beta_0 - \beta_1\) is the step from \((\nu + 1)^2 = 1\) to 4, so 3 units of \(\pi\lambda_0/(4n_r W_e^2)\). Then \(L_\pi = \pi/(\beta_0 - \beta_1)\).`, String.raw`\(\beta_0 - \beta_\nu = ((\nu + 1)^2 - 1)\pi/(3L_\pi) = \nu(\nu + 2)\pi/(3L_\pi)\). Multiply by \(L\) for the phase.`, "Thesis Eq. (2.10), Sec. 2.5. Treated in Lesson 6 (MMI self-imaging)."],
say: String.raw`For a wide section the propagation constants fall off with the square of \(\nu + 1\), which defines the beat length \(L_\pi = \pi/(\beta_0 - \beta_1) \approx 4n_r W_e^2/(3\lambda_0)\). Every mode then falls behind the fundamental by an integer multiple of \(\pi L/(3L_\pi)\).`,
num: String.raw`TE-like \(n_r = ${f2(NTE)}\), \(W_e = 2\) µm, \(\lambda_0 = 0.8\) µm: \(L_\pi \approx 4 \times ${f2(NTE)} \times 4/2.4 =\) <b>${(4 * NTE * 4 / 2.4).toFixed(1)} µm</b>.<br>\(W_e = 0.5\) µm: approximation <b>${(4 * NTE * 0.25 / 2.4).toFixed(2)} µm</b>, exact value from Eq. (2.8) in the readout.`,
r(fig, ctl) {
  let pol = "TE";
  ctl.innerHTML = `<div class="row"><button data-p="TE">TE-like n<sub>r</sub></button><button data-p="TM">TM-like n<sub>r</sub></button></div>` + sl("W", "Effective width Wₑ (µm)", 0.4, 4, 0.05, 2) + '<div class="readout" id="ro"></div>';
  const box = fbox(fig, String.raw`\underbrace{{\color{#7F77DD}{L_{\pi}}}}_{\text{beat length}} = \frac{\pi}{{\color{#378ADD}{\beta_{0}}} - {\color{#D85A30}{\beta_{1}}}} \approx \frac{4n_{r}{\color{#1D9E75}{W_{e}}}^{2}}{3\lambda_{0}}, \qquad \underbrace{{\color{#BA7517}{\nu(\nu + 2)}}}_{0,\,3,\,8,\,15,\,\ldots}\,\frac{\pi L}{3L_{\pi}}`);
  const x0 = 80, y0 = 24, w = 330, h = 170, A = ax(x0, y0, w, h, 0, 6, 0, 50), vs = range(0, 6, 61);
  const draw = () => {
    pick(ctl, "p", pol);
    const W = +$("W").value; $("Wv").textContent = W.toFixed(2) + " µm";
    const nr = pol === "TE" ? NTE : NTM, k0 = 2 * Math.PI / 0.8, kt = k0 * nr, b = v => { const ky = (v + 1) * Math.PI / W; return ky < kt * Math.sqrt(1 - 1 / (nr * nr)) ? Math.sqrt(kt * kt - ky * ky) : NaN; };
    const Lx = Math.PI / (b(0) - b(1)), La = 4 * nr * W * W / (3 * 0.8);
    let s = frame(x0, y0, w, h) + plot(x0, y0, w, h, vs, vs.map(v => v * (v + 2)), 0, 6, 0, 50, AM, 2, "5 3");
    for (let v = 0; v <= 6; v++) { const e = 3 * (b(0) - b(v)) / (b(0) - b(1)); s += dot(A.X(v), A.Y(v * (v + 2)), AM, 4); if (isFinite(e)) s += dot(A.X(v), A.Y(Math.min(e, 50)), CO, 6); }
    s += lab(x0 + 8, y0 + 18, "amber: ν(ν + 2), the quadratic law", "start", "ts", AM) + lab(x0 + 8, y0 + 34, "coral: exact from Eq. (2.8)", "start", "ts", CO);
    s += xticks(x0, y0, w, h, 0, 6, [0, 1, 2, 3, 4, 5, 6]) + yticks(x0, y0, w, h, 0, 50, [0, 10, 20, 30, 40, 50]);
    s += lab(x0 + w / 2, y0 + h + 32, "mode number ν", "middle") + ytitle(x0 - 40, y0 + h / 2, "(β₀ − βν) · 3Lπ/π");
    const bx = 450, bw = 200, bh = 150, mx = Math.max(Lx, La) * 1.15;
    s += lab(bx + bw / 2, y0 + 10, "beat length Lπ", "middle", "th");
    s += `<rect x="${bx + 20}" y="${y0 + 20 + bh - Lx / mx * bh}" width="60" height="${Lx / mx * bh}" fill="${CO}" fill-opacity="0.6"/><rect x="${bx + 120}" y="${y0 + 20 + bh - La / mx * bh}" width="60" height="${La / mx * bh}" fill="${AM}" fill-opacity="0.6"/>`;
    s += lab(bx + 50, y0 + bh + 38, "exact", "middle", "ts", CO) + lab(bx + 150, y0 + bh + 38, "4nᵣWₑ²/3λ₀", "middle", "ts", AM) + lab(bx + 50, y0 + 14 + bh - Lx / mx * bh, Lx.toFixed(2) + " µm", "middle", "ts", CO) + lab(bx + 150, y0 + 14 + bh - La / mx * bh, La.toFixed(2) + " µm", "middle", "ts", AM);
    box.innerHTML = svg(236, s);
    $("ro").innerHTML = ro([["n<sub>r</sub>", nr.toFixed(3)], ["Lπ exact, π/(β₀ − β₁)", Lx.toFixed(3) + " µm"], ["Lπ quadratic law", La.toFixed(3) + " µm"], ["difference", ((La / Lx - 1) * 100).toFixed(1) + " %"]]);
  };
  ctl.querySelectorAll("button[data-p]").forEach(b => b.onclick = () => { pol = b.dataset.p; draw(); });
  $("W").oninput = draw; draw();
}},

/* ---------------- 17. Overlap weights, Eq. 2.11 ---------------- */
{s: "17. Eq. 2.11 Weights c_ν", t: String.raw`Eq. (2.11), how much of each mode the input excites: \(c_\nu\)`,
intu: String.raw`To follow the light through the section, write the input field as a sum of the section's modes, \(\Psi(y, 0) = \sum_\nu c_\nu\psi_\nu(y)\). The weight of each mode is an overlap integral: multiply the input by the mode profile, add it up across the width, and divide by the size of the mode. Where the input and the mode have the same sign the product is positive, where they differ it is negative, and the weight is what is left. A narrow input excites many modes. An input in the centre excites only the symmetric (even) ones. And an input at \(y = \pm W_e/6\) leaves the modes \(\nu = 2, 5, 8, \ldots\) unexcited, because those modes have a node exactly there. That special position is the start of paired interference (card 18). Move the input and watch the bars.`,
eq: String.raw`\[ \Psi(y, 0) = \sum_{\nu} c_{\nu}\,\psi_{\nu}(y) \]\[ c_{\nu} = \frac{\int \Psi(y, 0)\,\psi_{\nu}(y)\,dy}{\sqrt{\int \psi_{\nu}^{2}(y)\,dy}} \]<div class="eqref">Thesis Eq. (2.11), Sec. 2.5 (Soldano and Pennings 1995, Eqs. (9) and (10))</div>`,
sym: [[String.raw`\(\Psi(y, 0)\)`, "input field across the section at its start, x = 0"], [String.raw`\(\psi_{\nu}(y)\)`, "lateral profile of mode ν"], [String.raw`\(c_{\nu}\)`, "weight of mode ν in the input"], [String.raw`\(\int \ldots dy\)`, "sum across the width of the section"], [String.raw`\(\sqrt{\int \psi_\nu^2\,dy}\)`, "size of the mode profile, so the weight does not depend on how the mode is scaled"], [String.raw`\(y = \pm W_e/6\)`, "input position that leaves ν = 2, 5, 8, … unexcited"]],
how: [String.raw`Read it aloud: "c nu is the integral of the input times psi nu, divided by the square root of the integral of psi nu squared".`, "The modes are orthogonal: the integral of two different mode profiles multiplied together is zero. That is what makes the overlap pick out one weight at a time.", String.raw`Even modes (\(\nu = 0, 2, 4\)) are symmetric in \(y\), odd modes antisymmetric. A centred input has a zero overlap with every odd mode.`, String.raw`Modes \(\nu = 2, 5, 8\) have \(3, 6, 9\) half waves, so a node at \(y = W_e/6\) from the centre. An input there overlaps them to zero.`, "Thesis Eq. (2.11), Sec. 2.5. Treated in Lesson 6 (MMI self-imaging)."],
say: String.raw`The input is expanded in the modes of the section, and each weight \(c_\nu\) is the overlap integral of the input with that mode profile, normalized by the size of the mode. An input at \(\pm W_e/6\) leaves the modes 2, 5, 8 unexcited.`,
num: String.raw`Gaussian input of width \(W_e/10\):<br>at the centre: every odd \(c_\nu\) is <b>0</b>.<br>at \(y = W_e/6\): \(c_2 = c_5 = c_8 =\) <b>0</b>.<br>Readout: the share of the input power in the first 12 modes.`,
r(fig, ctl) {
  ctl.innerHTML = sl("y", "Input position y₀ / Wₑ", -0.45, 0.45, 0.005, 1 / 6) + sl("w", "Input width / Wₑ", 0.04, 0.25, 0.005, 0.1) + sl("v", "Mode drawn ν", 0, 11, 1, 2) + btns([["c", "Centre"], ["s", "y₀ = Wₑ/6"], ["q", "y₀ = Wₑ/4"]], "q") + '<div class="readout" id="ro"></div>';
  const box = fbox(fig, String.raw`\underbrace{{\color{#D85A30}{c_{\nu}}}}_{\text{weight of mode }\nu} = \frac{\int \underbrace{{\color{#378ADD}{\Psi(y, 0)}}}_{\text{input}}\,\underbrace{{\color{#1D9E75}{\psi_{\nu}(y)}}}_{\text{mode}}\,dy}{\underbrace{\sqrt{\int \psi_{\nu}^{2}(y)\,dy}}_{\text{size of the mode}}}`);
  const ys = range(-0.5, 0.5, 401), M = 12, md = v => ys.map(y => Math.sin((v + 1) * Math.PI * (y + 0.5)));
  const modes = Array.from({ length: M }, (_, v) => md(v));
  const draw = () => {
    const y0 = +$("y").value, wd = +$("w").value, nu = +$("v").value; $("yv").textContent = y0.toFixed(3); $("wv").textContent = wd.toFixed(3); $("vv").textContent = nu;
    const inp = ys.map(y => Math.exp(-Math.pow((y - y0) / wd, 2))), pin = inp.reduce((a, v) => a + v * v, 0);
    const cs = modes.map(p => { let a = 0, b = 0; p.forEach((q, i) => { a += inp[i] * q; b += q * q; }); return a / Math.sqrt(b) / Math.sqrt(pin); });
    const x0 = 80, py = 42, pw = 560, ph = 110, A = ax(x0, py, pw, ph, -0.5, 0.5, -1.1, 1.1);
    let s = frame(x0, py, pw, ph) + hline(x0, x0 + pw, A.Y(0), "var(--line)");
    s += vline(A.X(1 / 6), py, py + ph, PU, "2 3") + vline(A.X(-1 / 6), py, py + ph, PU, "2 3") + lab(A.X(1 / 6), py - 4, "+Wₑ/6", "middle", "ts", PU) + lab(A.X(-1 / 6), py - 4, "−Wₑ/6", "middle", "ts", PU);
    const prod = inp.map((v, i) => v * modes[nu][i]);
    let d = `M${A.X(-0.5)} ${A.Y(0)}`; ys.forEach((y, i) => d += `L${A.X(y).toFixed(1)} ${A.Y(prod[i]).toFixed(1)}`); d += `L${A.X(0.5)} ${A.Y(0)}Z`;
    s += `<path d="${d}" fill="${AM}" fill-opacity="0.3"/>` + plot(x0, py, pw, ph, ys, modes[nu], -0.5, 0.5, -1.1, 1.1, TL, 2) + plot(x0, py, pw, ph, ys, inp, -0.5, 0.5, -1.1, 1.1, BL, 2.5);
    s += lab(x0, py - 22, "blue: input Ψ. green: mode ψ" + nu + ". amber: their product", "start", "ts") + lab(x0, py + ph + 14, "−Wₑ/2", "middle", "ts") + lab(x0 + pw, py + ph + 14, "+Wₑ/2", "middle", "ts") + lab(x0 + pw / 2, py + ph + 14, "y", "middle", "ts");
    const by = 188, bh = 100, B = ax(x0, by, pw, bh, -0.5, M - 0.5, -1, 1);
    s += frame(x0, by, pw, bh) + hline(x0, x0 + pw, B.Y(0), "var(--t)");
    cs.forEach((c, v) => { const zero = Math.abs(c) < 0.01; s += `<rect x="${(B.X(v) - 15).toFixed(1)}" y="${Math.min(B.Y(c), B.Y(0)).toFixed(1)}" width="30" height="${Math.abs(B.Y(c) - B.Y(0)).toFixed(1)}" fill="${v === nu ? TL : CO}" fill-opacity="0.65"/>` + lab(B.X(v), by + bh + 14, v, "middle", "ts", zero ? PU : "") + (zero ? lab(B.X(v), B.Y(0) - 6, "0", "middle", "ts", PU) : ""); });
    s += lab(x0 + pw / 2, by + bh + 30, "mode number ν: bars are c_ν (normalized), purple numbers are zero", "middle") + ytitle(40, by + bh / 2, "c_ν");
    box.innerHTML = svg(322, s);
    $("ro").innerHTML = ro([["c<sub>ν</sub> of the drawn mode", cs[nu].toFixed(3)], ["power in modes 0 to 11", (cs.reduce((a, c) => a + c * c, 0) * 100).toFixed(1) + " %"], ["unexcited modes", cs.map((c, v) => Math.abs(c) < 0.01 ? v : null).filter(v => v !== null).join(", ") || "none"]]);
  };
  ctl.querySelectorAll("button[data-q]").forEach(b => b.onclick = () => { $("y").value = b.dataset.q === "c" ? 0 : b.dataset.q === "s" ? 1 / 6 : 0.25; draw(); });
  ["y", "w", "v"].forEach(id => $(id).oninput = draw); draw();
}},

/* ---------------- 18. Field after L and single images, Eqs. 2.12 and 2.13 ---------------- */
{s: "18. Eqs. 2.12, 2.13 Images", t: String.raw`Eqs. (2.12) and (2.13): the field after a length \(L\) and single images at \(L = p\,(3L_\pi)\)`,
intu: String.raw`Each mode in the sum of card 17 travels with its own phase. Measured relative to the fundamental mode, mode \(\nu\) has fallen behind by \(\nu(\nu + 2)\pi L/(3L_\pi)\) after a length \(L\), and the field is the sum of all modes with those phases. The integer \(\nu(\nu + 2)\) is even for even \(\nu\) and odd for odd \(\nu\). At \(L = 3L_\pi\) every even mode is back in phase and every odd mode has changed sign. Even modes are symmetric and odd modes antisymmetric, so this recreates the input mirrored about the centre line. At \(6L_\pi\) every mode is back in phase and the input reappears unchanged. Press Play and watch the light travel down the section. Then put the input at \(W_e/6\): the modes 2, 5, 8 are missing, the remaining modes act in pairs, and images form already at every \(L_\pi\).`,
eq: String.raw`\[ \Psi(y, L) = \sum_{\nu = 0}^{m - 1} c_{\nu}\,\psi_{\nu}(y)\,\exp\!\left[\,j\,\frac{\nu(\nu + 2)\pi}{3L_{\pi}}\,L\right] \]\[ L = p\,(3L_{\pi}), \qquad p = 0, 1, 2, \ldots \]<div class="eqnote">direct image for even \(p\), mirrored for odd \(p\). Input at \(y = \pm W_e/6\): images already at \(L = p\,L_\pi\) (paired interference)</div><div class="eqref">Thesis Eqs. (2.12) and (2.13), Sec. 2.5 (Soldano and Pennings 1995, Eqs. (13), (17), (18), (31), (32))</div>`,
sym: [[String.raw`\(\Psi(y, L)\)`, "field across the section after a length L"], [String.raw`\(c_{\nu}\psi_{\nu}(y)\)`, "mode ν with its weight from card 17"], [String.raw`\(j\)`, "imaginary unit (engineering notation)"], [String.raw`\(\nu(\nu + 2)\pi L/(3L_\pi)\)`, "phase of mode ν behind the fundamental mode"], [String.raw`\(m\)`, "number of guided modes"], [String.raw`\(p\)`, "image number: even gives a direct image, odd a mirrored one"], [String.raw`\(L_{\pi}\)`, "beat length of the two lowest modes (card 16)"]],
how: [String.raw`Read it aloud: "Psi at length L is the sum over nu of c nu psi nu times e to the j nu times nu plus two pi L over three L pi. Single images form at L equal to p times three L pi".`, String.raw`The common phase \(\beta_0 L\) of all modes is dropped, because it does not change the shape of the field.`, String.raw`At \(L = 3L_\pi\) the phase is \(\nu(\nu + 2)\pi\). For even \(\nu\) that is an even multiple of \(\pi\) (factor \(+1\)), for odd \(\nu\) an odd multiple (factor \(-1\)). Flipping the sign of all odd modes mirrors the field about \(y = 0\).`, String.raw`Paired: with \(\nu = 2, 5, 8\) missing, the remaining \(\nu(\nu + 2)\) are all multiples of 3 apart in a way that makes the phases line up every \(L_\pi\).`, "Readouts: how closely the field at the marker matches the input (direct) and the mirrored input.", "Thesis Eqs. (2.12) and (2.13), Sec. 2.5. Treated in Lesson 6 (MMI self-imaging)."],
say: String.raw`Measured relative to the fundamental mode, mode \(\nu\) gains the phase \(\nu(\nu + 2)\pi L/(3L_\pi)\). At \(3L_\pi\) the odd modes have flipped sign and the input reappears mirrored, at \(6L_\pi\) it reappears unchanged. An input at \(\pm W_e/6\) gives paired interference with images every \(L_\pi\).`,
num: String.raw`Mirrored image at <b>\(3L_\pi\)</b>, direct image at <b>\(6L_\pi\)</b>.<br>Paired input at \(W_e/6\): mirrored image at <b>\(L_\pi\)</b>, direct at <b>\(2L_\pi\)</b>.<br>With \(L_\pi = ${(4 * NTE * 4 / 2.4).toFixed(1)}\) µm (card 16): first mirrored image at about <b>${(3 * 4 * NTE * 4 / 2.4).toFixed(0)} µm</b>.`,
r(fig, ctl) {
  let inp = "gen";
  ctl.innerHTML = btns([["gen", "Input at Wₑ/4 (general)"], ["pair", "Input at Wₑ/6 (paired)"]], "i") + sl("L", "Marker L / Lπ (when paused)", 0, 6, 0.01, 3) + '<div class="readout" id="ro"></div>';
  const box = fbox(fig, String.raw`{\color{#D85A30}{\Psi(y, L)}} = \sum_{\nu}\underbrace{c_{\nu}\psi_{\nu}(y)}_{\text{card 17}}\,\underbrace{\exp\!\left[j\,\frac{{\color{#7F77DD}{\nu(\nu + 2)}}\pi}{3{\color{#378ADD}{L_{\pi}}}}L\right]}_{\text{integer phase steps}} \qquad \underbrace{L = p\,(3L_{\pi})}_{\text{single images}}`);
  box.innerHTML = `<canvas width="340" height="80" style="width:100%;height:auto;display:block;border:1px solid var(--b);border-radius:4px;background:#fff"></canvas><div class="mk"></div>`;
  const cv = box.querySelector("canvas"), mk = box.querySelector(".mk"), W = 340, H = 80, M = 16, ys = range(0.5, -0.5, H);
  const modes = Array.from({ length: M }, (_, v) => ys.map(y => Math.sin((v + 1) * Math.PI * (y + 0.5))));
  let cs = [], hc = null, inField = [];
  const field = L => { const re = new Float64Array(H), im = new Float64Array(H); for (let v = 0; v < M; v++) { const ph = v * (v + 2) * Math.PI * L / 3, c = Math.cos(ph), s = Math.sin(ph); for (let j = 0; j < H; j++) { const a = cs[v] * modes[v][j]; re[j] += a * c; im[j] += a * s; } } return [re, im]; };
  const build = () => {
    const y0 = inp === "gen" ? 0.25 : 1 / 6;
    inField = ys.map(y => Math.exp(-Math.pow((y - y0) / 0.06, 2)));
    cs = modes.map(p => { let a = 0, b = 0; p.forEach((q, i) => { a += inField[i] * q; b += q * q; }); return a / b; });
    const cols = []; for (let i = 0; i < W; i++) { const [re, im] = field(i / (W - 1) * 6); cols.push(Array.from(re, (r, j) => r * r + im[j] * im[j])); }
    hc = heatCanvas(cv, W, H, (i, j) => cols[i][j]);
  };
  const match = (re, im, ref) => { let a = 0, b = 0, c = 0, d = 0; for (let j = 0; j < H; j++) { a += re[j] * ref[j]; d += im[j] * ref[j]; b += re[j] * re[j] + im[j] * im[j]; c += ref[j] * ref[j]; } return (a * a + d * d) / (b * c); };
  build();
  const run = RUN(ctl, (tt, on) => {
    pick(ctl, "i", inp);
    if (on) $("L").value = ((tt * 0.6 + 3) % 6).toFixed(2);
    const L = +$("L").value; $("Lv").textContent = L.toFixed(2);
    marker(hc.ctx, hc.img, L / 6 * (W - 1), H);
    const [re, im] = field(L), P = Array.from(re, (r, j) => r * r + im[j] * im[j]), mx = Math.max(...P, 1e-9);
    const dir = match(re, im, inField), mir = match(re, im, inField.slice().reverse());
    let s = "";
    for (let p = 0; p <= 6; p++) s += lab(p === 0 ? 4 : p === 6 ? 676 : p / 6 * 680, 14, p === 0 ? "0" : p + "Lπ", p === 0 ? "start" : p === 6 ? "end" : "middle", "ts", p === 3 || p === 6 ? CO : "");
    s += `<polygon points="${L / 6 * 680 - 7},20 ${L / 6 * 680 + 7},20 ${L / 6 * 680},30" fill="${TL}"/>`;
    const x0 = 80, y0 = 50, w = 520, h = 120, A = ax(x0, y0, w, h, -0.5, 0.5, 0, 1.08);
    s += frame(x0, y0, w, h) + vline(A.X(0), y0, y0 + h, "var(--line)", "3 3");
    const yy = ys.slice().reverse(), Pr = P.slice().reverse(), inR = inField.slice().reverse();
    s += plot(x0, y0, w, h, yy, inR.map(v => v * v), -0.5, 0.5, 0, 1.08, "var(--b)", 1.5, "4 3") + plot(x0, y0, w, h, yy, Pr.map(v => v / mx), -0.5, 0.5, 0, 1.08, CO, 2.5);
    s += lab(x0, y0 - 6, "coral: |Ψ(y, L)|² at the green marker. grey dashed: the input", "start", "ts") + lab(x0, y0 + h + 14, "−Wₑ/2", "middle", "ts") + lab(x0 + w, y0 + h + 14, "+Wₑ/2", "middle", "ts") + lab(x0 + w / 2, y0 + h + 14, "y = 0", "middle", "ts");
    mk.innerHTML = svg(196, s);
    $("ro").innerHTML = ro([["L / Lπ", L.toFixed(2)], ["match with the input (direct image)", (dir * 100).toFixed(0) + " %"], ["match with the mirrored input", (mir * 100).toFixed(0) + " %"]]);
  }, false);
  ctl.querySelectorAll("button[data-i]").forEach(b => b.onclick = () => { inp = b.dataset.i; build(); run.redraw(); });
  $("L").oninput = run.redraw;
}},

/* ---------------- 19. Two-mode interference and the PBS, Eqs. 2.14 and 2.15 ---------------- */
{s: "19. Eqs. 2.14, 2.15 Two modes", t: String.raw`Eqs. (2.14) and (2.15): two-mode interference, \(L_\pi = \lambda_0/[2(n_0 - n_1)]\), and the polarization splitter`,
intu: String.raw`Two-mode interference is the special case where only \(\nu = 0\) and \(\nu = 1\) carry power, so only two terms of Eq. (2.12) remain. For an input at \(y = +D\), the even profile \(\psi_0\) and the odd profile \(\psi_1\) add near \(+D\) and cancel near \(-D\). After one beat length the odd term has changed sign, so the light now sits at \(-D\), and after two beat lengths it is back at \(+D\). Written with the two effective indices, the beat length is \(\lambda_0/[2(n_0 - n_1)]\). TE-like and TM-like light have different indices and therefore different beat lengths. Choose a length that is an odd number of beat lengths for one polarization and an even number for the other, and the two leave through opposite ports. The closer the beat lengths, the longer the section, and long sections are narrowband and sensitive to fabrication. Here TM-like light gets 1.5 times the TE-like beat length, as in Fig. 2.6.`,
eq: String.raw`\[ \Psi(y, x) = c_{0}\,\psi_{0}(y) + c_{1}\,\psi_{1}(y)\,e^{\,j\pi x/L_{\pi}} \]\[ L_{\pi} = \frac{\lambda_{0}}{2\,(n_{0} - n_{1})} \]\[ L = p\,L_{\pi}^{\mathrm{TE}} = q\,L_{\pi}^{\mathrm{TM}}, \qquad p, q \text{ of opposite parity} \]<div class="eqref">Thesis Eqs. (2.14) and (2.15), Sec. 2.5, Fig. 2.6 (Soldano and Pennings 1995, Sec. V-A and Eq. (40))</div>`,
sym: [[String.raw`\(\Psi(y, x)\)`, "field at position x along the section"], [String.raw`\(\psi_{0}, \psi_{1}\)`, "even and odd lateral profiles of the two modes"], [String.raw`\(c_{0}, c_{1}\)`, "their weights, about equal for an input at +D"], [String.raw`\(e^{j\pi x/L_\pi}\)`, "the odd term changes sign every beat length"], [String.raw`\(n_{0}, n_{1}\)`, "effective indices of the two modes, from the mode solver of the full cross-section"], [String.raw`\(\pm D\)`, "positions of the two output ports"], [String.raw`\(p, q\)`, "whole numbers of beat lengths for TE-like and TM-like light, one odd and one even"], ["bar, cross", "bar: same side as the input (+D). cross: opposite side (−D)"]],
how: [String.raw`Read it aloud: "Psi is c zero psi zero plus c one psi one times e to the j pi x over L pi. L pi equals lambda zero over two times n zero minus n one".`, String.raw`Only the relative phase matters. It grows as \((\beta_0 - \beta_1)x\), and \(L_\pi\) is where it reaches \(\pi\).`, String.raw`With \(\beta = k_0 n\): \(L_\pi = \pi/(k_0(n_0 - n_1)) = \lambda_0/(2(n_0 - n_1))\).`, String.raw`After an odd number of beat lengths the light is at \(-D\) (cross), after an even number at \(+D\) (bar). The splitter needs \(p\) and \(q\) of opposite parity at one length.`, String.raw`For narrow sections like the thesis ones, the quadratic law of Eq. (2.10) is not accurate, so \(n_0\) and \(n_1\) come from the mode solver.`, "Thesis Eqs. (2.14) and (2.15), Sec. 2.5. Treated in Lesson 7 (Two-mode interference and PBS)."],
say: String.raw`With only two modes the light crosses from \(+D\) to \(-D\) every beat length \(L_\pi = \lambda_0/[2(n_0 - n_1)]\). A length that is an odd number of beat lengths for one polarization and an even number for the other sends TE-like and TM-like light to opposite ports.`,
num: String.raw`\(n_0 - n_1 = 0.1\) at 800 nm: \(L_\pi = 800/0.2 =\) <b>4 µm</b>. \(n_0 - n_1 = 0.05\): <b>8 µm</b>.<br>\(L_\pi^{\mathrm{TM}} = 1.5\,L_\pi^{\mathrm{TE}}\): \(L = 3L_\pi^{\mathrm{TE}} = 2L_\pi^{\mathrm{TM}}\), TE-like to the cross port, TM-like to the bar port.`,
r(fig, ctl) {
  ctl.innerHTML = sl("L", "Section length L / Lπ(TE) (when paused)", 0, 6, 0.01, 3) + sl("dn", "n₀ − n₁ for Eq. (2.15)", 0.02, 0.3, 0.005, 0.1) + '<div class="readout" id="ro"></div>';
  const box = fbox(fig, String.raw`{\color{#D85A30}{\Psi(y, x)}} = \underbrace{c_{0}\psi_{0}(y)}_{\text{even}} + \underbrace{c_{1}\psi_{1}(y)\,e^{j\pi x/{\color{#378ADD}{L_{\pi}}}}}_{\text{odd, flips every } L_{\pi}}, \qquad {\color{#378ADD}{L_{\pi}}} = \frac{\lambda_{0}}{2({\color{#1D9E75}{n_{0}}} - {\color{#7F77DD}{n_{1}}})}`);
  box.innerHTML = `<p class="note" style="margin:2px 0">TE-like, input at +D (top), length 0 to 6 Lπ(TE):</p><canvas width="340" height="44" style="width:100%;height:auto;display:block;border:1px solid var(--b);border-radius:4px;background:#fff"></canvas><p class="note" style="margin:6px 0 2px">TM-like, beat length 1.5 times longer:</p><canvas width="340" height="44" style="width:100%;height:auto;display:block;border:1px solid var(--b);border-radius:4px;background:#fff"></canvas><div class="mk"></div>`;
  const [c1, c2] = box.querySelectorAll("canvas"), mk = box.querySelector(".mk"), W = 340, H = 44, ys = range(0.5, -0.5, H);
  const p0 = ys.map(y => Math.cos(Math.PI * y)), p1 = ys.map(y => Math.sin(2 * Math.PI * y));
  const I = (x, Lp, j) => { const ph = Math.PI * x / Lp, re = p0[j] + p1[j] * Math.cos(ph), im = p1[j] * Math.sin(ph); return re * re + im * im; };
  const h1 = heatCanvas(c1, W, H, (i, j) => I(i / (W - 1) * 6, 1, j)), h2 = heatCanvas(c2, W, H, (i, j) => I(i / (W - 1) * 6, 1.5, j));
  const x0 = 70, y0 = 30, w = 570, h = 110, A = ax(x0, y0, w, h, 0, 6, 0, 1), xs = range(0, 6, 241);
  const run = RUN(ctl, (tt, on) => {
    if (on) $("L").value = (tt * 0.5 % 6).toFixed(2);
    const L = +$("L").value, dn = +$("dn").value; $("Lv").textContent = L.toFixed(2); $("dnv").textContent = dn.toFixed(3);
    marker(h1.ctx, h1.img, L / 6 * (W - 1), H); marker(h2.ctx, h2.img, L / 6 * (W - 1), H);
    let s = "";
    for (let p = 0; p <= 6; p++) s += lab(x0 + p / 6 * w, 16, p + "Lπ", "middle", "ts", p === 3 ? CO : "");
    s += frame(x0, y0, w, h) + plot(x0, y0, w, h, xs, xs.map(x => Math.pow(Math.cos(Math.PI * x / 2), 2)), 0, 6, 0, 1, BL, 2.2) + plot(x0, y0, w, h, xs, xs.map(x => Math.pow(Math.cos(Math.PI * x / 3), 2)), 0, 6, 0, 1, CO, 2.2, "6 3");
    s += vline(A.X(3), y0, y0 + h, PU, "3 3") + vline(A.X(L), y0, y0 + h, TL) + dot(A.X(L), A.Y(Math.pow(Math.cos(Math.PI * L / 2), 2)), BL, 5) + dot(A.X(L), A.Y(Math.pow(Math.cos(Math.PI * L / 3), 2)), CO, 5);
    s += yticks(x0, y0, w, h, 0, 1, [0, 1]) + ytitle(30, y0 + h / 2, "power at +D");
    s += lab(x0 + w / 2, y0 + h + 18, "blue: TE-like. coral dashed: TM-like. purple: 3Lπ(TE) = 2Lπ(TM)", "middle", "ts");
    mk.innerHTML = svg(172, s);
    const fe = Math.pow(Math.cos(Math.PI * L / 2), 2), fm = Math.pow(Math.cos(Math.PI * L / 3), 2), port = f => f > 0.5 ? "bar (+D)" : "cross (−D)";
    $("ro").innerHTML = ro([["TE-like: crossings L/Lπ", L.toFixed(2) + ", exits " + port(fe) + " " + (Math.max(fe, 1 - fe) * 100).toFixed(0) + " %"], ["TM-like: crossings L/(1.5 Lπ)", (L / 1.5).toFixed(2) + ", exits " + port(fm) + " " + (Math.max(fm, 1 - fm) * 100).toFixed(0) + " %"], ["Eq. (2.15): Lπ = λ₀/[2(n₀ − n₁)]", (800 / (2 * dn) / 1000).toFixed(2) + " µm at 800 nm"]]);
  }, false);
  $("L").oninput = run.redraw; $("dn").oninput = run.redraw;
}},

/* ---------------- 20. Maxwell's curl equations, Eq. 2.16 ---------------- */
{s: "20. Eq. 2.16 Maxwell", t: String.raw`Eq. (2.16), Maxwell's curl equations as FDTD solves them`,
intu: String.raw`FDTD solves these two equations directly in time on a grid. The first says that a magnetic field circling around a point makes the electric field there change in time. The second says that an electric field circling around a point makes the magnetic field change, in the opposite sense. Each field drives the other, and together they form a wave that travels at \(c/\sqrt{\varepsilon_r} = c/n\). This is the form for a linear, non-magnetic material without sources, with \(\mathbf{D} = \varepsilon_0\varepsilon_r\mathbf{E}\) and \(\mathbf{B} = \mu_0\mathbf{H}\). The material appears only through \(\varepsilon_r\), which is why an FDTD solver needs nothing but the permittivity on a grid. Move the index and watch the wave slow down and shorten.`,
eq: String.raw`\[ \frac{\partial \mathbf{E}}{\partial t} = \frac{1}{\varepsilon_{0}\varepsilon_{r}}\,\nabla \times \mathbf{H}, \qquad \frac{\partial \mathbf{H}}{\partial t} = -\frac{1}{\mu_{0}}\,\nabla \times \mathbf{E} \]\[ \mathbf{D} = \varepsilon_{0}\varepsilon_{r}\mathbf{E}, \qquad \mathbf{B} = \mu_{0}\mathbf{H} \]<div class="eqref">Thesis Eq. (2.16), Sec. 2.6 (Taflove and Hagness 2016, Eqs. (1), (2), (4a) and (4b))</div>`,
sym: [[String.raw`\(\mathbf{E}, \mathbf{H}\)`, "electric field (V/m) and magnetic field (A/m)"], [String.raw`\(\partial/\partial t\)`, "rate of change in time at a fixed point"], [String.raw`\(\nabla \times\)`, "curl: how much a field circles around a point, per unit area"], [String.raw`\(\varepsilon_{0}\)`, String.raw`vacuum permittivity, \(8.854 \times 10^{-12}\) F/m`], [String.raw`\(\varepsilon_{r}\)`, String.raw`relative permittivity, \(n^2\): 12.19 for GaAs in the thesis, 1 for air`], [String.raw`\(\mu_{0}\)`, String.raw`vacuum permeability, \(4\pi \times 10^{-7}\) H/m`], [String.raw`\(\mathbf{D}, \mathbf{B}\)`, "displacement field and magnetic flux density"], [String.raw`\(-\)`, "the minus sign: the two fields drive each other in opposite senses"]],
how: [String.raw`Read it aloud: "the rate of change of E is one over epsilon zero epsilon r times the curl of H. The rate of change of H is minus one over mu zero times the curl of E".`, "The first is Ampère's law with the displacement current and no free current, the second is Faraday's law of induction.", String.raw`Linear: \(\varepsilon_r\) does not depend on the field. Non-magnetic: \(\mu = \mu_0\). No sources: no free charge or current inside the domain (sources are added separately, card 22).`, String.raw`For a wave along \(x\) with only \(E_z\) and \(H_y\), each curl becomes one derivative, \(\partial H_y/\partial x\) and \(-\partial E_z/\partial x\). Combining them gives a wave of speed \(c/\sqrt{\varepsilon_r}\).`, "Thesis Eq. (2.16), Sec. 2.6. Treated in Lesson 8 (FDTD 1, Maxwell to Yee)."],
say: "FDTD solves Maxwell's two curl equations directly in time on a grid. In a linear, non-magnetic material without sources the material enters only through the relative permittivity.",
num: String.raw`Speed in a material \(c/n\): for \(n = 3.5\) the wave travels at <b>\(0.29c\)</b>, and its wavelength at 800 nm is <b>229 nm</b>.<br>Field ratio \(|\mathbf{E}|/|\mathbf{H}| = \eta_0/n\) with \(\eta_0 =\) <b>377 Ω</b>, so about 108 Ω in GaAs.`,
r(fig, ctl) {
  ctl.innerHTML = sl("n", "Refractive index n = √εr", 1, 3.5, 0.1, 1) + '<div class="readout" id="ro"></div>';
  const box = fbox(fig, String.raw`\underbrace{\frac{\partial {\color{#D85A30}{\mathbf{E}}}}{\partial t}}_{\text{E changes}} = \underbrace{\frac{1}{\varepsilon_{0}{\color{#1D9E75}{\varepsilon_{r}}}}}_{\text{material}}\underbrace{\nabla \times {\color{#378ADD}{\mathbf{H}}}}_{\text{H circles}}, \qquad \underbrace{\frac{\partial {\color{#378ADD}{\mathbf{H}}}}{\partial t}}_{\text{H changes}} = \underbrace{-\frac{1}{\mu_{0}}}_{\text{opposite sense}}\underbrace{\nabla \times {\color{#D85A30}{\mathbf{E}}}}_{\text{E circles}}`);
  let st = `<ellipse cx="90" cy="120" rx="55" ry="22" fill="none" stroke="${BL}" stroke-width="2.5"/>`;
  st += `<path d="M60 101 Q90 94 120 101" fill="none" stroke="${BL}" stroke-width="2" marker-end="url(#ar)"/><path d="M120 139 Q90 146 60 139" fill="none" stroke="${BL}" stroke-width="2" marker-end="url(#ar)"/>`;
  st += arrow(90, 160, 90, 62, CO, 3) + lab(98, 64, "∂E/∂t", "start", "t", CO) + lab(150, 128, "H", "start", "t", BL) + lab(90, 196, "H circling around", "middle", "ts") + lab(90, 212, "a point changes E there", "middle", "ts");
  st += hline(200, 660, 120, "var(--t)") + lab(664, 124, "x", "start") + `<g class="wv"></g>`;
  box.innerHTML = svg(232, st);
  const g = box.querySelector(".wv");
  let n = 1;
  const wave = tt => {
    const xs = range(200, 650, 226), k = 2 * Math.PI * n / 220, om = 2 * Math.PI * 0.6;
    let e = "", h = "";
    xs.forEach((x, i) => { const v = Math.sin(k * (x - 200) - om * tt); e += (i ? "L" : "M") + x.toFixed(1) + " " + (120 - 55 * v).toFixed(1); h += (i ? "L" : "M") + (x + 26 * v / n).toFixed(1) + " " + (120 + 18 * v / n).toFixed(1); });
    g.innerHTML = `<path d="${h}" fill="none" stroke="${BL}" stroke-width="2"/><path d="${e}" fill="none" stroke="${CO}" stroke-width="2.5"/>` + lab(208, 56, "Ez", "start", "t", CO) + lab(208, 172, "Hy (drawn in perspective)", "start", "ts", BL) + arrow(560, 30, 620, 30, "var(--t)", 1.5) + lab(556, 34, "speed c/" + n.toFixed(1), "end", "ts");
  };
  const run = RUN(ctl, tt => { n = +$("n").value; $("nv").textContent = n.toFixed(1); wave(tt); $("ro").innerHTML = ro([["εr = n²", (n * n).toFixed(2)], ["speed c/n", (1 / n).toFixed(2) + " c"], ["wavelength λ₀/n at 800 nm", (800 / n).toFixed(0) + " nm"]]); });
  $("n").oninput = run.redraw;
}},

/* ---------------- 21. Yee cell and leapfrog ---------------- */
{s: "21. Yee cell, leapfrog", t: String.raw`The Yee cell and the leapfrog in half time steps`,
intu: String.raw`The field components are placed at staggered positions in the Yee cell. In the thesis drawing each electric component sits at the centre of a cell edge and points along it, and each magnetic component sits at the centre of a face and points normal to it. Every electric component is then the centre of a loop of four magnetic components, and every magnetic component the centre of a loop of four electric ones. A curl is a circulation around a loop, so this is exactly the arrangement needed to evaluate the curls. The derivatives of Eq. (2.16) become central differences: the difference of two neighbours half a step on either side. The same staggering is used in time. \(\mathbf{E}\) is known at whole time steps and \(\mathbf{H}\) half a step later, and they are updated in turn, each jumping over the other like a leapfrog. Step through the build.`,
eq: String.raw`\[ \frac{\partial f}{\partial x} \approx \frac{f(x + \Delta x/2) - f(x - \Delta x/2)}{\Delta x} \]\[ \mathbf{E} \text{ at } t = n\,\Delta t, \qquad \mathbf{H} \text{ at } t = \left(n + \tfrac{1}{2}\right)\Delta t \]<div class="eqnote">E on edge centres along the edges, H on face centres normal to the faces (Fig. 2.7)</div><div class="eqref">Sec. 2.6, Fig. 2.7 (Taflove and Hagness 2016, Sec. 5). No equation number.</div>`,
sym: [[String.raw`\(f\)`, "any field component"], [String.raw`\(\Delta x\)`, "grid spacing"], [String.raw`\(\Delta t\)`, "time step"], [String.raw`\(n\)`, "time step index (a count, not an index of refraction)"], [String.raw`\(n + \tfrac{1}{2}\)`, "half a step later: where H is known"], ["central difference", "difference of the two neighbours on either side, divided by their distance"], ["Yee cell", "one grid cell with E on its edges and H on its faces"]],
how: [String.raw`Read it aloud: "the derivative is the difference of f half a step ahead and half a step behind, over delta x. E lives at whole time steps, H at half steps".`, "A central difference is second-order accurate: the error falls with the square of the spacing, because the first error terms of the two sides cancel.", String.raw`Faraday's law on one face: \(H_z\) at the face centre changes with the circulation of the four \(E\) values on the edges around it (step 4).`, String.raw`Leapfrog: from \(\mathbf{E}\) at step \(n\) compute \(\mathbf{H}\) at \(n + \tfrac{1}{2}\), then from that \(\mathbf{H}\) compute \(\mathbf{E}\) at \(n + 1\), and repeat. Each update needs only neighbours, so one step costs a few operations per cell.`, "Thesis Sec. 2.6 and Fig. 2.7, no equation number. Treated in Lesson 8 (FDTD 1, Maxwell to Yee)."],
say: "In the Yee cell the electric components sit at the edge centres and the magnetic components at the face centres, so each is surrounded by a loop of the other, as the curls require. The derivatives become central differences and E and H are updated in alternating half time steps.",
num: String.raw`A large grid stores <b>3</b> E and <b>3</b> H values per cell.<br>Method setting (Ch. 3): 20 or 30 steps per wavelength in GaAs, so at 800 nm and \(n = 3.5\) a cell of <b>11.4 nm</b> or <b>7.6 nm</b>.`,
r(fig, ctl) {
  const box = fbox(fig, String.raw`\underbrace{\frac{\partial f}{\partial x}}_{\text{derivative}} \approx \frac{\overbrace{f(x + \Delta x/2) - f(x - \Delta x/2)}^{\text{neighbours on either side}}}{\Delta x}, \qquad \underbrace{{\color{#378ADD}{\mathbf{E}}}: n\,\Delta t, \quad {\color{#D85A30}{\mathbf{H}}}: (n + \tfrac{1}{2})\Delta t}_{\text{leapfrog}}`);
  const caps = ["Step 1. One cell of the grid, a cube of side Δx.", "Step 2. The electric components (blue) sit at the centres of the edges and point along them.", "Step 3. The magnetic components (rust) sit at the centres of the faces and point normal to them.",
    "Step 4. One face from above: H_z in the middle, ringed by four E values. Their circulation is the z part of the curl of E, so H_z can be updated from its neighbours only.",
    "Step 5. Now time. E is known at step n (blue circles on the row n).", "Step 6. H at n + ½ is computed from its old value and the two E values beside it (green arrows).", "Step 7. E at n + 1 is computed from its old value and the two new H values beside it.", "Step 8. And again: the fields leapfrog over each other in half time steps, from the bottom row upward."];
  const P = (a, b, c) => [70 + 150 * a + 80 * b, 220 - 50 * b - 130 * c];
  const corners = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1]];
  const ar = (p, q, col, w) => { const [x1, y1] = P(...p), [x2, y2] = P(...q); return arrow(x1.toFixed(1), y1.toFixed(1), x2.toFixed(1), y2.toFixed(1), col, w || 2.5); };
  const E = BL, H = CO;
  STEP(ctl, caps, (k, t, fr) => {
    let s = "";
    if (k <= 4) {
      for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++) { const a = corners[i], b = corners[j]; if (a.reduce((q, v, z) => q + Math.abs(v - b[z]), 0) !== 1) continue; const hid = [a, b].some(c => c[0] === 0 && c[1] === 1 && c[2] === 0); const [x1, y1] = P(...a), [x2, y2] = P(...b); s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--t)" ${hid ? 'stroke-dasharray="4 3"' : ""}/>`; }
      s += arrow(P(0, 0, 0)[0] - 30, 250, P(0, 0, 0)[0] + 10, 250, "var(--t)", 1) + lab(P(0, 0, 0)[0] + 14, 254, "x", "start", "ts") + lab(P(0, 0, 0)[0] - 30, 266, "Δx", "start", "ts");
      if (k >= 2) {
        s += ar([0.3, 0, 0], [0.7, 0, 0], E) + lab(P(0.5, 0, 0)[0], P(0.5, 0, 0)[1] + 18, "Ex", "middle", "t", E);
        s += ar([1, 0.25, 0], [1, 0.75, 0], E) + lab(P(1, 0.5, 0)[0] + 12, P(1, 0.5, 0)[1] + 14, "Ey", "start", "t", E);
        s += ar([0, 0, 0.3], [0, 0, 0.7], E) + lab(P(0, 0, 0.5)[0] - 8, P(0, 0, 0.5)[1] + 4, "Ez", "end", "t", E);
        s += `<g opacity="0.45">` + ar([0.3, 0, 1], [0.7, 0, 1], E, 2) + ar([1, 0, 0.3], [1, 0, 0.7], E, 2) + ar([0, 0.25, 1], [0, 0.75, 1], E, 2) + `</g>`;
      }
      if (k >= 3) {
        s += ar([1, 0.5, 0.5], [1.32, 0.5, 0.5], H) + lab(P(1.32, 0.5, 0.5)[0] + 6, P(1.32, 0.5, 0.5)[1] + 4, "Hx", "start", "t", H);
        s += ar([0.5, 0, 0.5], [0.5, -0.5, 0.5], H) + lab(P(0.5, -0.5, 0.5)[0] - 6, P(0.5, -0.5, 0.5)[1] + 4, "Hy", "end", "t", H);
        s += ar([0.5, 0.5, 1], [0.5, 0.5, 1.28], H) + lab(P(0.5, 0.5, 1.28)[0] + 8, P(0.5, 0.5, 1.28)[1] + 8, "Hz", "start", "t", H);
      }
      s += lab(190, 290, "blue E on edge centres, rust H on face centres", "middle", "ts");
      if (k === 4) {
        const L = 450, R = 610, T = 60, B = 210, a = (t * 0.6) % 1;
        s += lab(530, 30, "one face seen from +z", "middle", "th") + `<rect x="${L}" y="${T}" width="${R - L}" height="${B - T}" fill="${E}" fill-opacity="0.06" stroke="var(--t)"/>`;
        s += arrow(L + 45, B, R - 45, B, E, 2.5) + lab(530, B + 18, "Ex(j)", "middle", "ts", E) + arrow(R, B - 45, R, T + 45, E, 2.5) + lab(R + 8, 139, "Ey(i+1)", "start", "ts", E);
        s += arrow(R - 45, T, L + 45, T, E, 2.5, "5 3") + lab(530, T - 8, "−Ex(j+1)", "middle", "ts", E) + arrow(L, T + 45, L, B - 45, E, 2.5, "5 3") + lab(L - 8, 139, "−Ey(i)", "end", "ts", E);
        const pa = a * 4, side = Math.floor(pa), u = pa - side, pts = [[L, B], [R, B], [R, T], [L, T], [L, B]], [xa, ya] = pts[side], [xb, yb] = pts[side + 1];
        s += dot(xa + (xb - xa) * u, ya + (yb - ya) * u, TL, 5);
        s += `<circle cx="530" cy="135" r="11" fill="none" stroke="${H}" stroke-width="2"/><circle cx="530" cy="135" r="3" fill="${H}"/>` + lab(546, 140, "Hz", "start", "t", H);
        s += lab(530, 252, "green dot: walking the loop is the circulation", "middle", "ts", TL);
      }
      box.innerHTML = svg(298, s);
      return;
    }
    const X = c => 120 + 70 * c, Y = r => 236 - 52 * r;   // c: half cells, r: half steps (0 = n)
    const xl = ["i−1", "i−½", "i", "i+½", "i+1", "i+3/2", "i+2", "i+5/2"], yl = ["n", "n+½", "n+1", "n+3/2", "n+2"];
    for (let c = 0; c < 8; c++) s += vline(X(c), 20, 252, "var(--line)") + lab(X(c), 270, xl[c], "middle", "ts");
    for (let r = 0; r < 5; r++) s += hline(100, 640, Y(r), "var(--line)") + lab(92, Y(r) + 4, yl[r], "end", "ts");
    s += lab(370, 290, "space x (half cells)", "middle", "ts") + ytitle(36, 130, "time t (half steps)");
    const done = k === 5 ? 1 : k === 6 ? 2 : k === 7 ? 3 : 5, partial = k === 8 ? Math.min(1, fr * 1.5) : 1;
    for (let r = 0; r < done; r++) for (let c = 0; c < 8; c++) {
      const isE = r % 2 === 0 && c % 2 === 0, isH = r % 2 === 1 && c % 2 === 1;
      if (isE) s += `<circle cx="${X(c)}" cy="${Y(r)}" r="8" fill="${E}" fill-opacity="${r === done - 1 && k < 8 ? 0.7 : 0.3}" stroke="${E}"/>`;
      if (isH) s += `<rect x="${X(c) - 8}" y="${Y(r) - 8}" width="16" height="16" fill="${H}" fill-opacity="${r === done - 1 && k < 8 ? 0.7 : 0.3}" stroke="${H}"/>`;
    }
    if (k >= 6 && k <= 7) {
      const r = done - 1;
      for (let c = 0; c < 8; c++) { if ((r % 2 === 1) !== (c % 2 === 1)) continue; for (const dc of [-1, 1]) { const cc = c + dc; if (cc < 0 || cc > 7) continue; s += arrow(X(cc), Y(r - 1), (X(cc) + (X(c) - X(cc)) * 0.75).toFixed(1), (Y(r - 1) + (Y(r) - Y(r - 1)) * 0.75).toFixed(1), TL, 1.8); } }
    }
    if (k === 8) { s += `<g opacity="${partial}">`; for (let r = 1; r < 5; r++) s += arrow(X(r % 2 ? 7 : 6) + 26, Y(r - 1) - 4, X(r % 2 ? 7 : 6) + 26, Y(r) + 6, TL, 2); s += `</g>`; }
    s += `<circle cx="590" cy="30" r="7" fill="${E}" fill-opacity="0.5" stroke="${E}"/>` + lab(602, 34, "E", "start", "t", E) + `<rect x="583" y="46" width="14" height="14" fill="${H}" fill-opacity="0.5" stroke="${H}"/>` + lab(602, 58, "H", "start", "t", H);
    box.innerHTML = svg(298, s);
  });
}},

/* ---------------- 22. One pulse, the whole band ---------------- */
{s: "22. Pulse to spectrum", t: String.raw`One pulse gives the whole band: PML, mode source or Gaussian beam, and mode projection`,
intu: String.raw`A short pulse contains many frequencies at once, so one simulation gives the response over a whole band. The fields recorded at a monitor are Fourier transformed to get them frequency by frequency. The simulation domain is surrounded by perfectly matched layers (PML), which absorb outgoing light with almost no reflection, so the finite box behaves like open space. Light is launched as a guided mode computed by a mode solver at the input plane, or as a Gaussian beam that stands for the fiber. Transmission is measured by projecting the field at an output plane onto the target mode. The bottom panel runs a real one-dimensional FDTD in the page: a pulse crosses a 480 nm GaAs slab, a second run without the slab gives the reference, and the transmission spectrum builds up as the pulse passes the monitor. The dashed curve is the exact answer.`,
eq: String.raw`<div class="eqnote">From the recorded field to a spectrum (Fourier transform), and from a spectrum to a transmission</div>\[ \tilde{E}(\omega) = \int E(t)\,e^{i\omega t}\,dt, \qquad T(\omega) = \frac{|\tilde{E}_{\text{device}}(\omega)|^{2}}{|\tilde{E}_{\text{reference}}(\omega)|^{2}} \]<div class="eqnote">In 1D the target mode is the plane wave itself. In 3D the field is projected onto the target mode (Ch. 3, Eq. (3.12)).</div><div class="eqref">Sec. 2.6, last two paragraphs (Taflove and Hagness 2016, Sec. 13 for the PML). No equation number.</div>`,
sym: [[String.raw`\(E(t)\)`, "field recorded at the monitor, step by step"], [String.raw`\(\tilde{E}(\omega)\)`, "its Fourier transform: the part at angular frequency ω"], [String.raw`\(\omega\)`, String.raw`angular frequency \(2\pi c/\lambda_0\)`], [String.raw`\(T(\omega)\)`, "transmission spectrum"], ["device, reference", "the run with the structure, and the same run without it"], ["PML", "perfectly matched layer: absorbing frame around the domain"], ["mode source", "launches a guided mode computed by a mode solver at the input plane"], ["Gaussian beam", "launches a beam that stands for the fiber"]],
how: [String.raw`Read the transform aloud: "E tilde of omega is the integral of E of t times e to the i omega t". It picks out how much of the recorded signal oscillates at \(\omega\).`, "A pulse that is short in time is wide in frequency. One run covers the whole band the pulse contains, instead of one run per wavelength.", "The transform is only complete once the fields have died away, so the run must last until the pulse has passed and the device has rung down.", "PML: a lossy layer whose loss is matched so that the wave enters without reflection, then decays. Here it is the shaded strip at both ends of the line.", "Mode projection keeps only the power in the target mode, so light in other modes or in radiation does not count as transmission.", "Thesis Sec. 2.6, no equation number. Treated in Lesson 9 (FDTD 2, sources to spectra). The projection formula is Eq. (3.12) in Chapter 3."],
say: "A short pulse contains many frequencies, so one FDTD run gives the whole band after Fourier transforming the recorded fields. The domain is closed by perfectly matched layers, light is launched as a guided mode or a Gaussian beam, and transmission is the projection of the output field onto the target mode.",
num: String.raw`The toy run: 1 cell = 5 nm, 1400 cells, Courant number 0.5, about 9000 steps. Slab 480 nm of \(n = 3.5\) in air.<br>Its transmission swings between <b>100 %</b> and about <b>27 %</b> (Fabry-Perot fringes), and the run matches the exact curve to within a few percent.`,
r(fig, ctl) {
  let src = "mode";
  ctl.innerHTML = `<div class="row"><button data-s="mode">Mode source</button><button data-s="beam">Gaussian beam</button><button id="again">Run again</button></div>` + '<div class="readout" id="ro"></div>';
  const box = fbox(fig, String.raw`\underbrace{{\color{#7F77DD}{\tilde{E}(\omega)}}}_{\text{spectrum}} = \int \underbrace{{\color{#D85A30}{E(t)}}}_{\text{recorded}}\,e^{i\omega t}\,dt, \qquad \underbrace{{\color{#1D9E75}{T(\omega)}}}_{\text{transmission}} = \frac{|\tilde{E}_{\text{device}}|^{2}}{|\tilde{E}_{\text{reference}}|^{2}}`);
  const N = 1400, S = 0.5, PL = 60, dx = 5, sI = 160, s0 = 520, d = 96, mon = 1120, NF = 60, f0 = S / 160, tau = 300, n0 = 900, NSTEP = 9000;
  const lams = range(560, 1200, NF), fr = lams.map(l => S / (l / dx)), Tex = lams.map(l => 1 - C2.tmmR(1, [[3.5, d * dx]], 1, l));
  let A, B, re, im, nstep;
  const reset = () => { const eps = new Float64Array(N).fill(1); for (let i = s0; i < s0 + d; i++) eps[i] = 12.25; A = new C2.FDTD1D(N, S, eps, { pml: PL }); B = new C2.FDTD1D(N, S, null, { pml: PL }); re = [new Float64Array(NF), new Float64Array(NF)]; im = [new Float64Array(NF), new Float64Array(NF)]; nstep = 0; };
  reset();
  const cosT = fr.map(f => Math.cos(2 * Math.PI * f)), sinT = fr.map(f => Math.sin(2 * Math.PI * f));
  const cr = [new Float64Array(NF).fill(1), new Float64Array(NF).fill(1)], ci = [new Float64Array(NF), new Float64Array(NF)];
  const advance = m => { for (let q = 0; q < m && nstep < NSTEP; q++) { const sv = Math.exp(-Math.pow((nstep - n0) / tau, 2)) * Math.sin(2 * Math.PI * f0 * nstep); A.step([sI, sv]); B.step([sI, sv]);
    [A, B].forEach((F, k) => { const e = F.ez[mon]; for (let j = 0; j < NF; j++) { re[k][j] += e * cr[k][j]; im[k][j] += e * ci[k][j]; const c = cr[k][j] * cosT[j] - ci[k][j] * sinT[j]; ci[k][j] = cr[k][j] * sinT[j] + ci[k][j] * cosT[j]; cr[k][j] = c; } }); nstep++; } };
  const resetPh = () => { for (const k of [0, 1]) { cr[k].fill(1); ci[k].fill(0); } };
  const run = RUN(ctl, (tt, on) => {
    pick(ctl, "s", src);
    if (on) advance(30);
    let s = lab(20, 18, "3D set-up (schematic, top view)", "start", "th");
    s += `<rect x="30" y="28" width="620" height="120" fill="${AM}" fill-opacity="0.18"/><rect x="52" y="42" width="576" height="92" fill="var(--bg, #fff)" stroke="var(--b)"/>` + lab(40, 142, "PML", "start", "ts", AM);
    if (src === "mode") {
      s += `<rect x="52" y="80" width="576" height="16" fill="${BL}" fill-opacity="0.4"/>` + vline(110, 50, 126, PU) + `<line x1="110" y1="50" x2="110" y2="126" stroke="${PU}" stroke-width="3"/>` + lab(116, 60, "mode source: mode solver at the input plane", "start", "ts", PU);
      s += `<line x1="560" y1="50" x2="560" y2="126" stroke="${TL}" stroke-width="3"/>` + lab(554, 124, "monitor: project onto the target mode", "end", "ts", TL) + arrow(140, 88, 200, 88, CO, 2.5);
    } else {
      s += `<rect x="52" y="80" width="576" height="16" fill="${BL}" fill-opacity="0.4"/>`; for (let x = 260; x < 420; x += 14) s += `<rect x="${x}" y="80" width="7" height="16" fill="var(--bg, #fff)"/>`;
      s += `<ellipse cx="340" cy="88" rx="70" ry="30" fill="${PU}" fill-opacity="0.15" stroke="${PU}" stroke-dasharray="4 3"/>` + lab(340, 56, "Gaussian beam from above, stands for the fiber", "middle", "ts", PU);
      s += `<line x1="140" y1="50" x2="140" y2="126" stroke="${TL}" stroke-width="3"/>` + lab(146, 124, "monitor: project onto the waveguide mode", "start", "ts", TL) + arrow(260, 88, 200, 88, CO, 2.5);
    }
    const y0 = 176, h = 70, X = i => 30 + i / N * 620;
    s += lab(20, y0 - 8, "live 1D FDTD: field E along the line, step " + nstep + " of " + NSTEP, "start", "th");
    s += `<rect x="${X(0)}" y="${y0}" width="${X(PL) - X(0)}" height="${h}" fill="${AM}" fill-opacity="0.2"/><rect x="${X(N - PL)}" y="${y0}" width="${X(N) - X(N - PL)}" height="${h}" fill="${AM}" fill-opacity="0.2"/><rect x="${X(s0)}" y="${y0}" width="${X(s0 + d) - X(s0)}" height="${h}" fill="${BL}" fill-opacity="0.3"/>`;
    s += frame(30, y0, 620, h) + vline(X(sI), y0, y0 + h, PU) + vline(X(mon), y0, y0 + h, TL) + lab(X(sI), y0 + h + 12, "source", "middle", "ts", PU) + lab(X(mon), y0 + h + 12, "monitor", "middle", "ts", TL) + lab(X(s0 + d / 2), y0 + h + 12, "GaAs slab", "middle", "ts", BL) + lab(X(PL / 2), y0 + h + 12, "PML", "middle", "ts", AM) + lab(X(N - PL / 2), y0 + h + 12, "PML", "middle", "ts", AM);
    let pd = ""; for (let i = 0; i < N; i += 2) pd += (pd ? "L" : "M") + X(i).toFixed(1) + " " + (y0 + h / 2 - h / 2 * Math.max(-1, Math.min(1, A.ez[i] / 1.5))).toFixed(1);
    s += `<path d="${pd}" fill="none" stroke="${CO}" stroke-width="1.6"/>`;
    const py = 290, ph = 110, px = 80, pw = 560, P = ax(px, py, pw, ph, 560, 1200, 0, 1.05);
    s += frame(px, py, pw, ph) + plot(px, py, pw, ph, lams, Tex, 560, 1200, 0, 1.05, "var(--t)", 1.5, "5 3");
    const refP = lams.map((l, j) => re[1][j] * re[1][j] + im[1][j] * im[1][j]), mx = Math.max(...refP, 1e-30);
    const T = lams.map((l, j) => refP[j] > 1e-3 * mx && nstep > 0 ? (re[0][j] * re[0][j] + im[0][j] * im[0][j]) / refP[j] : NaN);
    s += plot(px, py, pw, ph, lams, T.map(v => isFinite(v) ? Math.min(v, 1.05) : NaN), 560, 1200, 0, 1.05, TL, 2.5);
    s += xticks(px, py, pw, ph, 560, 1200, [600, 700, 800, 900, 1000, 1100, 1200]) + yticks(px, py, pw, ph, 0, 1.05, [0, 0.5, 1]);
    s += lab(px + pw / 2, py + ph + 30, "wavelength (nm). green: from the run. dashed: exact transfer matrix", "middle") + ytitle(36, py + ph / 2, "transmission T");
    box.innerHTML = svg(432, s);
    const done = nstep >= NSTEP, ok = T.filter(isFinite);
    $("ro").innerHTML = ro([["time steps run", nstep + (done ? " (finished, fields have decayed)" : "")], ["frequencies tracked", NF + " from one pulse"], ["T range so far", ok.length ? Math.min(...ok).toFixed(2) + " to " + Math.max(...ok).toFixed(2) : "waiting for the pulse"]]);
  });
  ctl.querySelectorAll("button[data-s]").forEach(b => b.onclick = () => { src = b.dataset.s; run.redraw(); });
  $("again").onclick = () => { reset(); resetPh(); run.redraw(); };
}}
],
summary: String.raw`Chapter 2 in one breath. A guided mode is described by its effective index \(n_{\mathrm{eff}} = \beta/k_0\), which lies between the air and the GaAs index and comes from a mode solver that turns Maxwell's equations into an eigenvalue problem on the cross-section. The membrane is mirror symmetric, so modes are even (TE-like) or odd (TM-like), and the normal field jumps by \(\varepsilon_{\mathrm{GaAs}}/\varepsilon_{\mathrm{air}}\) at the surfaces (Eq. 2.1), which lowers the TM-like index. A grating scatters light out where \(\beta + m\,2\pi/\Lambda\) fits inside the air window (Eq. 2.2), which sets the period \(\lambda_0/(n_{\mathrm{eff}} - n_{\mathrm{c}}\sin\theta)\) (Eq. 2.3). Its efficiency is limited by light going down and by the beam shape. A DBR adds quarter-wave reflections in phase (Eqs. 2.4 and 2.5), reaches the reflectance of Eq. (2.6) within the stopband of Eq. (2.7), and the air gap sets whether the returning light adds or cancels. In an MMI the lateral modes (Eqs. 2.8 and 2.9) have nearly quadratic propagation constants (Eq. 2.10), so the input (Eq. 2.11) re-forms as images at multiples of \(3L_\pi\) (Eqs. 2.12 and 2.13), and two-mode interference with different TE and TM beat lengths splits the polarizations (Eqs. 2.14 and 2.15). FDTD solves Maxwell's curl equations (Eq. 2.16) on the Yee grid with a leapfrog in time, and one pulse gives the whole spectrum.`,
sheet: [
[String.raw`\[ \beta = k_{0}n_{\mathrm{eff}}, \qquad k_{0} = \frac{2\pi}{\lambda_{0}}, \qquad n_{\mathrm{c}} \lt n_{\mathrm{eff}} \lt n \]`, "Effective index and guiding window, Sec. 2.2 and 2.3 (card 1)"],
[String.raw`\[ \mathbf{E}(x, y, z) = \mathbf{E}(y, z)\,e^{i\beta x}, \qquad n_{\mathrm{eff}} = \frac{\beta}{k_{0}} \]`, "Mode solver, eigenvalue problem on the cross-section, Sec. 2.2 (card 2)"],
[String.raw`\[ z \to -z: \ (E_{x}, E_{y}, E_{z}) \to (E_{x}, E_{y}, -E_{z}), \qquad \sigma = \pm 1 \]`, "Mirror symmetry: even TE-like, odd TM-like, Sec. 2.2 (card 3)"],
[String.raw`\[ E_{z}^{\mathrm{air}} = \frac{\varepsilon_{\mathrm{GaAs}}}{\varepsilon_{\mathrm{air}}}\,E_{z}^{\mathrm{GaAs}} = 12.19\,E_{z}^{\mathrm{GaAs}} \]`, "Eq. (2.1), field jump, Sec. 2.2 (card 4)"],
[String.raw`\[ k_{0}n_{\mathrm{c}}\sin\theta_{m} = \beta + m\,\frac{2\pi}{\Lambda} \]`, "Eq. (2.2), phase matching, Sec. 2.3 (card 5)"],
[String.raw`\[ \Lambda = \frac{\lambda_{0}}{n_{\mathrm{eff}} - n_{\mathrm{c}}\sin\theta}, \qquad \theta = 0: \ \beta - 2\,\frac{2\pi}{\Lambda} = -\beta \]`, "Eq. (2.3), period, and the second-order reflection, Sec. 2.3 (card 6)"],
[String.raw`\[ w_{\mathrm{tooth}} = f\Lambda, \qquad w_{\mathrm{gap}} = (1 - f)\Lambda \]`, "Fill factor, Sec. 2.3 (card 7)"],
[String.raw`\[ \mathrm{CE} = \frac{P_{\text{fiber mode}}}{P_{\text{guided}}} \]`, "Coupling efficiency and its two limits, Sec. 2.3 (card 8)"],
[String.raw`\[ r = \frac{n_{1} - n_{2}}{n_{1} + n_{2}} \]`, "Eq. (2.4), Fresnel reflection, Sec. 2.4 (card 9)"],
[String.raw`\[ d_{H} = \frac{\lambda_{0}}{4n_{H}}, \qquad d_{L} = \frac{\lambda_{0}}{4n_{L}} \]`, "Eq. (2.5), quarter-wave layers, Sec. 2.4 (card 10)"],
[String.raw`\[ R = \left[\frac{1 - (n_{H}/n_{L})^{2N}}{1 + (n_{H}/n_{L})^{2N}}\right]^{2} \]`, "Eq. (2.6), peak reflectance of N pairs, Sec. 2.4 (card 11)"],
[String.raw`\[ \Delta\lambda_{0} \approx \frac{4\lambda_{0}}{\pi}\arcsin\!\left(\frac{n_{H} - n_{L}}{n_{H} + n_{L}}\right) \]`, "Eq. (2.7), stopband width, Sec. 2.4 (card 12)"],
[String.raw`\[ U \propto \left|1 + \sqrt{R}\,e^{i\delta}\right|^{2} \]`, "Air gap, illustration only, Sec. 2.4 (card 13)"],
[String.raw`\[ k_{y\nu}^{2} + \beta_{\nu}^{2} = k_{0}^{2}n_{r}^{2}, \qquad k_{y\nu} = \frac{(\nu + 1)\pi}{W_{e}} \]`, "Eq. (2.8), lateral modes, Sec. 2.5 (card 14)"],
[String.raw`\[ W_{e} \approx W_{M} + \frac{\lambda_{0}}{\pi}\left(\frac{n_{c}}{n_{r}}\right)^{2\sigma}\left(n_{r}^{2} - n_{c}^{2}\right)^{-1/2} \]`, "Eq. (2.9), effective width, σ = 1 TE-like and 0 TM-like for the membrane, Sec. 2.5 (card 15)"],
[String.raw`\[ \beta_{\nu} \approx k_{0}n_{r} - \frac{(\nu + 1)^{2}\pi\lambda_{0}}{4n_{r}W_{e}^{2}}, \qquad L_{\pi} = \frac{\pi}{\beta_{0} - \beta_{1}} \approx \frac{4n_{r}W_{e}^{2}}{3\lambda_{0}} \]`, "Eq. (2.10), quadratic law and beat length, Sec. 2.5 (card 16)"],
[String.raw`\[ c_{\nu} = \frac{\int \Psi(y, 0)\,\psi_{\nu}(y)\,dy}{\sqrt{\int \psi_{\nu}^{2}(y)\,dy}} \]`, "Eq. (2.11), mode weights, Sec. 2.5 (card 17)"],
[String.raw`\[ \Psi(y, L) = \sum_{\nu = 0}^{m - 1} c_{\nu}\,\psi_{\nu}(y)\,\exp\!\left[\,j\,\frac{\nu(\nu + 2)\pi}{3L_{\pi}}\,L\right] \]`, "Eq. (2.12), field after a length L, Sec. 2.5 (card 18)"],
[String.raw`\[ L = p\,(3L_{\pi}), \qquad p = 0, 1, 2, \ldots \]`, "Eq. (2.13), single images, direct for even p, mirrored for odd p (card 18)"],
[String.raw`\[ \Psi(y, x) = c_{0}\,\psi_{0}(y) + c_{1}\,\psi_{1}(y)\,e^{\,j\pi x/L_{\pi}} \]`, "Eq. (2.14), two-mode interference, Sec. 2.5 (card 19)"],
[String.raw`\[ L_{\pi} = \frac{\lambda_{0}}{2\,(n_{0} - n_{1})}, \qquad L = p\,L_{\pi}^{\mathrm{TE}} = q\,L_{\pi}^{\mathrm{TM}} \]`, "Eq. (2.15), beat length from the indices, and the splitter condition (card 19)"],
[String.raw`\[ \frac{\partial \mathbf{E}}{\partial t} = \frac{1}{\varepsilon_{0}\varepsilon_{r}}\,\nabla \times \mathbf{H}, \qquad \frac{\partial \mathbf{H}}{\partial t} = -\frac{1}{\mu_{0}}\,\nabla \times \mathbf{E} \]`, "Eq. (2.16), Maxwell's curl equations, Sec. 2.6 (card 20)"],
[String.raw`\[ \frac{\partial f}{\partial x} \approx \frac{f(x + \Delta x/2) - f(x - \Delta x/2)}{\Delta x} \]`, "Central difference on the Yee grid, leapfrog in half time steps, Sec. 2.6 (card 21)"],
[String.raw`\[ \tilde{E}(\omega) = \int E(t)\,e^{i\omega t}\,dt, \qquad T = \frac{|\tilde{E}_{\text{device}}|^{2}}{|\tilde{E}_{\text{reference}}|^{2}} \]`, "One pulse, the whole band, Sec. 2.6 (card 22)"]],
consts: String.raw`\(k_0 = 2\pi/\lambda_0 = 0.00785\,\mathrm{nm^{-1}}\) at 800 nm, \(c = 2.998 \times 10^{8}\,\mathrm{m/s}\), \(\varepsilon_0 = 8.854 \times 10^{-12}\,\mathrm{F/m}\), \(\mu_0 = 4\pi \times 10^{-7}\,\mathrm{H/m}\), \(\eta_0 = 377\,\Omega\). Examples use \(n = 3.5\), air, \(\lambda_0 = 800\) nm, a 160 nm membrane and a 3.5/3.0 stack. Illustrative values, not thesis results.`,
sources: [
  "Midolo, Pregnolato, Kiršanskė and Stobbe, Nanotechnology 26, 484002 (2015) (suspended GaAs membranes, Sec. 2.1)",
  "Johnson, Fan, Villeneuve, Joannopoulos and Kolodziejski, Phys. Rev. B 60, 5751 (1999), p. 5753 (even and odd modes, purely TE and TM on the mid-plane)",
  "Tidy3D documentation and mode solver (eigenmodes of a cross-section, FDTD solver)",
  "Taillaert et al., Jpn. J. Appl. Phys. 45, 6071 (2006), Secs. 2.1 and 2.2 (vertical period, second-order reflection, the two loss factors, the gap)",
  "Zhou et al., Appl. Phys. Lett. 113, 251103 (2018) (tilted period, fill factor and etch depth set the average index)",
  "Gačević and Vukmirović, Phys. Rev. Applied 9, 064041 (2018), Sec. II A and B, Fig. 1, Eqs. (2) and (3) (Fresnel sign, quarter-wave phases, DBR reflectance and stopband)",
  "Soldano and Pennings, J. Lightwave Technol. 13, 615 (1995), Eqs. (1), (3) to (7), (9), (10), (13), (17), (18), (31), (32), Sec. V-A, Eq. (40) (MMI self-imaging and two-mode interference)",
  "Taflove and Hagness, \"Finite-difference time-domain solution of Maxwell's equations\", Wiley Encyclopedia of Electrical and Electronics Engineering (2016), Eqs. (1), (2), (4), Sec. 5, Fig. 1, Sec. 13 (curl equations, Yee cell, leapfrog, PML)"
]
});
})();

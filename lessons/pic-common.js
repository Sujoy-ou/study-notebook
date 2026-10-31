/* Shared tools for the Photonic Integrated Circuits shelf.
   Everything is computed in the browser from the equations in the lessons:
   dB bookkeeping, coupled-mode theory for directional couplers (Yariv 1973),
   ring resonator transfer functions (Bogaerts et al. 2012), Soref-Bennett plasma
   dispersion (1987), Ge photodetector responsivity and bandwidth, laser rate
   equations with Purcell factor and beta (Li et al. 2015 form), the BER-Q relation,
   and a small animation helper with a play/pause button. */

const PIC = {};

/* ---------- constants ---------- */
PIC.c = 2.99792458e8;         // m/s
PIC.q = 1.602176634e-19;      // C
PIC.h = 6.62607015e-34;       // J s
PIC.kB = 1.380649e-23;        // J/K
PIC.hc_eVum = 1.23984;        // h c in eV um

/* ---------- dB helpers ---------- */
PIC.dB = x => 10 * Math.log10(Math.max(x, 1e-30));
PIC.fromdB = d => Math.pow(10, d / 10);
PIC.dBm = Pmw => 10 * Math.log10(Math.max(Pmw, 1e-30));
PIC.fromdBm = d => Math.pow(10, d / 10);
PIC.fmt = (x, n) => Number.isFinite(x) ? x.toFixed(n == null ? 2 : n) : "—";
PIC.sci = (x, n) => Number.isFinite(x) ? x.toExponential(n == null ? 2 : n).replace("e+", "e") : "—";

/* ---------- erfc and BER ---------- */
PIC.erfc = function (x) {
  // Numerical Recipes erfc with fractional error < 1.2e-7
  const z = Math.abs(x), t = 1 / (1 + 0.5 * z);
  const r = t * Math.exp(-z * z - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))));
  return x >= 0 ? r : 2 - r;
};
PIC.ber = Q => 0.5 * PIC.erfc(Q / Math.SQRT2);

/* ---------- waveguide and coupler physics ---------- */
/* Effective index of a symmetric slab (TE), first mode, by bisection on the transcendental equation. */
PIC.slabNeff = function (n1, n2, d_um, lam_um) {
  const k0 = 2 * Math.PI / lam_um;
  const f = b => { const kx = k0 * Math.sqrt(Math.max(n1 * n1 - b * b, 1e-12)), g = k0 * Math.sqrt(Math.max(b * b - n2 * n2, 1e-12)); return Math.tan(kx * d_um / 2) - g / kx; };
  let lo = n2 + 1e-6, hi = n1 - 1e-6;
  // fundamental mode: first root of tan(kx d/2) = gamma/kx scanning from hi (b near n1) down
  let b = hi, step = (hi - lo) / 400, prev = f(b);
  for (let i = 0; i < 400; i++) { const nb = b - step, v = f(nb); if (Math.sign(v) !== Math.sign(prev) && Math.abs(v - prev) < 50) { lo = nb; hi = b; break; } b = nb; prev = v; }
  for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (f(m) > 0) hi = m; else lo = m; }
  return (lo + hi) / 2;
};
/* Directional coupler power transfer with detuning delta. */
PIC.dcTransfer = function (kappa, delta, L) { const s = Math.sqrt(kappa * kappa + delta * delta); return (kappa * kappa / (s * s)) * Math.pow(Math.sin(s * L), 2); };

/* ---------- ring resonator (Bogaerts 2012) ---------- */
PIC.ringAllPass = function (r, a, phi) { const num = a * a - 2 * r * a * Math.cos(phi) + r * r, den = 1 - 2 * r * a * Math.cos(phi) + r * r * a * a; return num / den; };
PIC.ringAddDrop = function (r1, r2, a, phi) {
  const den = 1 - 2 * r1 * r2 * a * Math.cos(phi) + Math.pow(r1 * r2 * a, 2);
  return { thr: (r2 * r2 * a * a - 2 * r1 * r2 * a * Math.cos(phi) + r1 * r1) / den, drop: (1 - r1 * r1) * (1 - r2 * r2) * a / den };
};

/* ---------- Soref-Bennett 1987 at 1550 nm (dN in cm^-3) ---------- */
PIC.sorefDn = (dNe, dNh) => -(8.8e-22 * dNe + 8.5e-18 * Math.pow(dNh, 0.8));
PIC.sorefDa = (dNe, dNh) => 8.5e-18 * dNe + 6.0e-18 * dNh;   // cm^-1

/* ---------- photodetector ---------- */
PIC.responsivity = (eta, lam_um) => eta * lam_um / 1.23984;   // A/W

/* ---------- laser rate equations (Li et al. 2015 form), RK4 ---------- */
/* state: N (carrier density, cm^-3), S (photon density, cm^-3)
   p: {I (A), eta_i, V (cm^3), tau_nr (s), tau_sp (s), FP, vs (cm/s), SoverV (cm^-1), g0 (cm^3/s), Ntr (cm^-3), Gamma, tau_p (s), beta} */
PIC.rateStep = function (N, S, p, dt) {
  const f = (N, S) => {
    const G = p.g0 * Math.max(N - p.Ntr, -p.Ntr);
    const dN = p.eta_i * p.I / (PIC.q * p.V) - N / p.tau_nr - p.FP * N / p.tau_sp - p.vs * p.SoverV * N - G * S;
    const dS = p.Gamma * G * S - S / p.tau_p + p.Gamma * p.beta * p.FP * N / p.tau_sp;
    return [dN, dS];
  };
  const k1 = f(N, S), k2 = f(N + dt / 2 * k1[0], S + dt / 2 * k1[1]), k3 = f(N + dt / 2 * k2[0], S + dt / 2 * k2[1]), k4 = f(N + dt * k3[0], S + dt * k3[1]);
  return [N + dt / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]), Math.max(0, S + dt / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]))];
};
/* steady state photon density vs current, by time stepping until settled */
PIC.rateSteady = function (p, I, steps) {
  const q = Object.assign({}, p, { I }); let N = 0, S = 0; const dt = Math.min(p.tau_p, 1e-12) * 0.5;
  for (let i = 0; i < (steps || 20000); i++) [N, S] = PIC.rateStep(N, S, q, dt);
  return { N, S };
};

/* ---------- small UI helpers ---------- */
/* Play/pause button plus a frame callback. fn(tSeconds, playing). Returns a function to stop. */
PIC.player = function (ctl, fn, label) {
  const id = "pl" + Math.floor(Math.random() * 1e6);
  ctl.insertAdjacentHTML("beforeend", `<div class="row"><button id="${id}" class="on">${label || "Pause"}</button><span class="note">Animation runs while the card is open.</span></div>`);
  let playing = true, tPause = 0, t0 = 0;
  const b = document.getElementById(id);
  const loop = t => { fn(t, playing); };
  anim(t => { if (playing) { tPause = t - t0; loop(tPause); } else loop(tPause); });
  b.onclick = () => { playing = !playing; b.textContent = playing ? (label || "Pause") : "Play"; b.classList.toggle("on", playing); if (playing) t0 = -tPause; };
};
/* Step-through control: buttons Back/Next and a step counter; draw(step) is called with 0..n-1. */
PIC.stepper = function (ctl, n, draw, names) {
  const id = "st" + Math.floor(Math.random() * 1e6);
  ctl.insertAdjacentHTML("beforeend", `<div class="row"><button id="${id}b">Back</button><button id="${id}n" class="on">Next step</button><span class="v" id="${id}v"></span></div>`);
  let k = 0; const u = () => { document.getElementById(id + "v").textContent = `Step ${k + 1} of ${n}${names ? ": " + names[k] : ""}`; document.getElementById(id + "b").disabled = k === 0; document.getElementById(id + "n").disabled = k === n - 1; draw(k); };
  document.getElementById(id + "b").onclick = () => { if (k > 0) { k--; u(); } };
  document.getElementById(id + "n").onclick = () => { if (k < n - 1) { k++; u(); } };
  u();
};
/* readout grid */
PIC.readout = items => `<div class="readout">${items.map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`).join("")}</div>`;
/* axis with ticks: horizontal */
PIC.xaxis = (x0, y0, w, xmin, xmax, n, lab, fmt) => { let s = `<line x1="${x0}" y1="${y0}" x2="${x0 + w}" y2="${y0}" stroke="var(--p)"/>`; for (let i = 0; i <= n; i++) { const x = x0 + w * i / n, v = xmin + (xmax - xmin) * i / n; s += `<line x1="${x}" y1="${y0}" x2="${x}" y2="${y0 + 4}" stroke="var(--p)"/><text class="ts" x="${x}" y="${y0 + 16}" text-anchor="middle">${fmt ? fmt(v) : v}</text>`; } return s + `<text class="ts" x="${x0 + w / 2}" y="${y0 + 32}" text-anchor="middle">${lab}</text>`; };
PIC.yaxis = (x0, y0, h, ymin, ymax, n, lab, fmt) => { let s = `<line x1="${x0}" y1="${y0}" x2="${x0}" y2="${y0 + h}" stroke="var(--p)"/>`; for (let i = 0; i <= n; i++) { const y = y0 + h - h * i / n, v = ymin + (ymax - ymin) * i / n; s += `<line x1="${x0 - 4}" y1="${y}" x2="${x0}" y2="${y}" stroke="var(--p)"/><text class="ts" x="${x0 - 7}" y="${y + 4}" text-anchor="end">${fmt ? fmt(v) : v}</text>`; } return s + `<text class="ts" x="${x0 - 40}" y="${y0 + h / 2}" text-anchor="middle" transform="rotate(-90 ${x0 - 40} ${y0 + h / 2})">${lab}</text>`; };
/* colour map for field or index plots, value 0..1 */
PIC.heat = v => { v = Math.max(0, Math.min(1, v)); const r = Math.round(255 * Math.min(1, Math.max(0, 1.5 * v - 0.2))), g = Math.round(255 * Math.min(1, Math.max(0, 1.5 - Math.abs(2.5 * v - 1.5)))), b = Math.round(255 * Math.min(1, Math.max(0, 1.3 - 1.8 * v))); return `rgb(${r},${g},${b})`; };
PIC.bwr = v => { v = Math.max(-1, Math.min(1, v)); const a = Math.abs(v); return v >= 0 ? `rgba(201,86,46,${a})` : `rgba(47,120,196,${a})`; };
/* code block for Tidy3D cards */
PIC.code = s => `<pre class="codebox"><code>${s.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</code></pre>`;

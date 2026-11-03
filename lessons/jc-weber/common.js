/* Shared tools for the Journal Club series on Weber et al., PNAS 107, 8513 (2010).
   Small SVG helpers (text, axes with ticks, band boxes, spin arrows, a 3D projector),
   the defect-level data of Table 1, and the electron counting used in lessons 5 and 7. */

const JC = {};
JC.C = { coral: "#D85A30", blue: "#378ADD", teal: "#1D9E75", purple: "#7F77DD", amber: "#BA7517", gold: "#C9A227", red: "#D33F3F", green: "#2E9B4F", gray: "#8a94a6" };
JC.kB = 8.617333e-5;     // eV/K
JC.h_eVs = 4.135668e-15; // eV s
JC.hc = 1239.84;         // eV nm
JC.gamma = 28.025;       // electron gyromagnetic ratio, GHz/T
JC.D_NV = 2.87;          // NV ground state zero-field splitting, GHz

/* a fill="..." in extra becomes an inline style, because the site CSS sets fill on text classes */
JC.tx = (x, y, t, a, cls, extra) => `<text class="${cls || "ts"}" x="${(+x).toFixed(1)}" y="${(+y).toFixed(1)}"${a ? ` text-anchor="${a}"` : ""}${extra ? " " + extra.replace(/fill="([^"]+)"/, 'style="fill:$1"') : ""}>${t}</text>`;
JC.rc = (x, y, w, h, fill, stroke, extra) => `<rect x="${(+x).toFixed(1)}" y="${(+y).toFixed(1)}" width="${Math.max(0, w).toFixed(1)}" height="${Math.max(0, h).toFixed(1)}" fill="${fill}" stroke="${stroke || "none"}"${extra ? " " + extra : ""}/>`;
JC.ln = (x1, y1, x2, y2, col, w, dash, extra) => `<line x1="${(+x1).toFixed(1)}" y1="${(+y1).toFixed(1)}" x2="${(+x2).toFixed(1)}" y2="${(+y2).toFixed(1)}" stroke="${col}" stroke-width="${w || 1}"${dash ? ` stroke-dasharray="${dash}"` : ""}${extra ? " " + extra : ""}/>`;
JC.ci = (x, y, r, fill, stroke, extra) => `<circle cx="${(+x).toFixed(1)}" cy="${(+y).toFixed(1)}" r="${r}" fill="${fill}" stroke="${stroke || "none"}"${extra ? " " + extra : ""}/>`;
JC.fmt = (x, n) => Number.isFinite(x) ? x.toFixed(n == null ? 2 : n) : "n/a";
JC.sci = (x, n) => {
  if (!Number.isFinite(x)) return "n/a";
  if (x === 0) return "0";
  const e = Math.floor(Math.log10(Math.abs(x))), m = x / Math.pow(10, e);
  return e === 0 ? m.toFixed(n == null ? 2 : n) : `${m.toFixed(n == null ? 2 : n)} × 10<sup>${e}</sup>`;
};
JC.clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* Axes frame with ticks. Returns {s, X, Y} where X and Y map data to pixels. */
JC.frame = function (x0, y0, w, h, o) {
  const X = v => x0 + (v - o.xmin) / (o.xmax - o.xmin) * w;
  const Y = v => o.ylog ? y0 + h - (Math.log10(v) - Math.log10(o.ymin)) / (Math.log10(o.ymax) - Math.log10(o.ymin)) * h
                        : y0 + h - (v - o.ymin) / (o.ymax - o.ymin) * h;
  let s = `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="none" stroke="var(--b)"/>`;
  (o.xt || []).forEach(t => { const xx = X(t); s += JC.ln(xx, y0 + h, xx, y0 + h + 4, "var(--p)") + JC.tx(xx, y0 + h + 16, o.xf ? o.xf(t) : t, "middle"); if (o.grid) s += JC.ln(xx, y0, xx, y0 + h, "var(--b)", 0.5, "2 3"); });
  (o.yt || []).forEach(t => { const yy = Y(t); s += JC.ln(x0 - 4, yy, x0, yy, "var(--p)") + JC.tx(x0 - 7, yy + 4, o.yf ? o.yf(t) : t, "end"); if (o.grid) s += JC.ln(x0, yy, x0 + w, yy, "var(--b)", 0.5, "2 3"); });
  if (o.xl) s += JC.tx(x0 + w / 2, y0 + h + 34, o.xl, "middle");
  if (o.yl) s += `<text class="ts" transform="translate(${x0 - 40} ${y0 + h / 2}) rotate(-90)" text-anchor="middle">${o.yl}</text>`;
  return { s, X, Y };
};
/* polyline from data through the frame mappings */
JC.path = (F, xs, ys, col, w, dash, extra) => {
  let d = "";
  xs.forEach((x, i) => { const y = ys[i]; if (!Number.isFinite(y)) return; d += (d ? "L" : "M") + F.X(x).toFixed(1) + " " + F.Y(y).toFixed(1); });
  return `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w || 2}"${dash ? ` stroke-dasharray="${dash}"` : ""}${extra ? " " + extra : ""}/>`;
};

/* Band diagram box: VB below 0, CB above Eg. Returns {s, Y}. */
JC.bands = function (x0, y0, w, h, Eg, emin, emax, labels) {
  const Y = e => y0 + h - (e - emin) / (emax - emin) * h;
  let s = JC.rc(x0, Y(0), w, y0 + h - Y(0), "var(--purple-bg)", "none") + JC.ln(x0, Y(0), x0 + w, Y(0), JC.C.purple, 1.5);
  s += JC.rc(x0, y0, w, Y(Eg) - y0, "var(--teal-bg)", "none") + JC.ln(x0, Y(Eg), x0 + w, Y(Eg), JC.C.teal, 1.5);
  if (labels !== false) s += JC.tx(x0 + w - 6, Y(0) + 15, "VBM", "end", "ts") + JC.tx(x0 + w - 6, Y(Eg) - 6, "CBM", "end", "ts");
  return { s, Y };
};
/* small spin arrows on a level */
JC.up = (x, y, col) => `<path d="M${x} ${y + 9} L${x} ${y - 9} M${x - 4} ${y - 4} L${x} ${y - 9} L${x + 4} ${y - 4}" stroke="${col || "var(--t)"}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
JC.dn = (x, y, col) => `<path d="M${x} ${y - 9} L${x} ${y + 9} M${x - 4} ${y + 4} L${x} ${y + 9} L${x + 4} ${y + 4}" stroke="${col || "var(--t)"}" stroke-width="2" fill="none" stroke-linecap="round"/>`;

/* 3D projection with yaw (about z) and pitch (tilt toward viewer). Returns [x, y, depth]. */
JC.proj = function (p, yaw, pitch, sc, cx, cy) {
  const cY = Math.cos(yaw), sY = Math.sin(yaw), cP = Math.cos(pitch), sP = Math.sin(pitch);
  const x1 = p[0] * cY - p[1] * sY, y1 = p[0] * sY + p[1] * cY, z1 = p[2];
  const y2 = y1 * cP - z1 * sP, z2 = y1 * sP + z1 * cP;
  return [cx + sc * x1, cy - sc * z2, y2];
};

/* Table 1 of the paper. Levels in eV above the calculated VBM. occ arrays mark the underlined (occupied) levels.
   Order inside each channel: a1(1), a1(2), ex, ey. */
JC.TABLE1 = [
  { key: "VC2", host: "Diamond", label: "V_C²⁻ (diamond)", n: 6, Eg: 5.36,
    maj: [-1.46, 2.66, 2.66, 2.66], majo: [1, 1, 1, 1], min: [-0.09, 4.67, 4.67, 4.67], mino: [1, 1, 0, 0] },
  { key: "NV", host: "Diamond", label: "NV⁻ (diamond)", n: 6, Eg: 5.36,
    maj: [-2.04, 1.31, 2.33, 2.33], majo: [1, 1, 1, 1], min: [-1.39, 2.06, 5.07, 5.07], mino: [1, 1, 0, 0] },
  { key: "NCVSi", host: "4H-SiC", label: "N_C V_Si⁻ (4H-SiC)", n: 6, Eg: 3.17,
    maj: [-0.41, 0.06, 0.29, 0.33], majo: [1, 1, 1, 1], min: [-0.72, 0.93, 2.35, 2.51], mino: [1, 1, 0, 0] },
  { key: "VSi2", host: "4H-SiC", label: "V_Si²⁻ (4H-SiC)", n: 6, Eg: 3.17,
    maj: [-0.11, 0.41, 0.89, 1.23], majo: [1, 1, 1, 1], min: [0.29, 1.66, 2.66, 2.90], mino: [1, 1, 0, 0] },
  { key: "VSi1", host: "4H-SiC", label: "V_Si⁻ (4H-SiC)", n: 5, Eg: 3.17,
    maj: [-0.11, 0.43, 0.43, 0.67], majo: [1, 1, 1, 1], min: [0.53, 2.66, 2.67, 3.14], mino: [1, 0, 0, 0] },
  { key: "VSi0", host: "4H-SiC", label: "V_Si⁰ (4H-SiC)", n: 4, Eg: 3.17,
    maj: [-0.41, 0.14, 0.20, 2.42], majo: [1, 1, 1, 0], min: [-0.47, 1.86, 2.69, 2.82], mino: [1, 0, 0, 0] }
];
JC.LN = ["a₁(1)", "a₁(2)", "e(x)", "e(y)"];
/* Total spin from the occupations: S = (N_up - N_down) / 2 */
JC.spinOf = d => (d.majo.reduce((a, b) => a + b, 0) - d.mino.reduce((a, b) => a + b, 0)) / 2;
/* Spin-conserving internal excitation: highest occupied to lowest empty level inside the gap, same channel. */
JC.excite = function (d) {
  let best = null;
  [["maj", "majo"], ["min", "mino"]].forEach(([c, o]) => {
    const occ = d[c].map((e, i) => d[o][i] ? e : null).filter(e => e !== null);
    const emp = d[c].map((e, i) => !d[o][i] ? { e, i } : null).filter(x => x && x.e > 0 && x.e < d.Eg);
    if (!occ.length || !emp.length) return;
    const ho = Math.max(...occ), hoi = d[c].indexOf(ho), lu = emp.reduce((a, b) => b.e < a.e ? b : a);
    if (!best || lu.e - ho < best.dE) best = { ch: c, from: hoi, to: lu.i, ho, lu: lu.e, dE: lu.e - ho };
  });
  return best;
};

/* Draw a spin-resolved defect-level diagram from a Table 1 entry. */
JC.dld = function (d, x0, y0, w, h, showArrow) {
  const emin = -1, emax = Math.max(d.Eg + 0.7, 3.4);
  const B = JC.bands(x0, y0, w, h, d.Eg, emin, emax);
  let s = B.s;
  const colX = [x0 + w * 0.27, x0 + w * 0.73];
  s += JC.tx(colX[0], y0 + 14, "spin majority ↑", "middle", "ts") + JC.tx(colX[1], y0 + 14, "spin minority ↓", "middle", "ts");
  s += JC.ln(x0 + w / 2, y0 + 22, x0 + w / 2, y0 + h, "var(--b)", 1, "3 3");
  [["maj", "majo", 0], ["min", "mino", 1]].forEach(([c, o, k]) => {
    // group degenerate levels to place them side by side
    const placed = [];
    d[c].forEach((e, i) => {
      const same = placed.filter(p => Math.abs(p.e - e) < 0.03).length;
      placed.push({ e, i });
      const nSame = d[c].filter(x => Math.abs(x - e) < 0.03).length;
      const lw = nSame > 1 ? 30 : 46, xc = colX[k] + (nSame > 1 ? (same - (nSame - 1) / 2) * 38 : 0);
      const yy = JC.clamp(B.Y(e), y0 + 24, y0 + h - 4);
      const col = d[o][i] ? JC.C.coral : "var(--p)";
      s += JC.ln(xc - lw / 2, yy, xc + lw / 2, yy, col, 3);
      if (d[o][i]) s += k === 0 ? JC.up(xc, yy - 1, JC.C.blue) : JC.dn(xc, yy - 1, JC.C.blue);
      const lx = k === 0 ? (nSame > 1 ? xc : xc - lw / 2 - 4) : (nSame > 1 ? xc : xc + lw / 2 + 4);
      if (nSame > 1) { if (same === 0) s += JC.tx(colX[k], yy + 22, `${nSame === 2 && i === 2 ? "e" : JC.LN.slice(i, i + nSame).join(", ")} ${e.toFixed(2)}`, "middle"); }
      else s += JC.tx(lx, yy + 4, `${JC.LN[i]} ${e.toFixed(2)}`, k === 0 ? "end" : "start");
    });
  });
  if (showArrow) {
    const x = JC.excite(d);
    if (x) {
      const k = x.ch === "maj" ? 0 : 1, xa = colX[k] + (k === 0 ? 34 : -34);
      s += `<line x1="${xa}" y1="${B.Y(x.ho) - 4}" x2="${xa}" y2="${B.Y(x.lu) + 6}" stroke="${JC.C.green}" stroke-width="2.5" stroke-dasharray="5 3" marker-end="url(#ar)"/>`;
    }
  }
  s += JC.tx(x0 - 8, B.Y(0) + 4, "0", "end") + JC.tx(x0 - 8, B.Y(d.Eg) + 4, d.Eg.toFixed(2), "end");
  return s;
};

/* A small play / pause control wired to app.js anim(). fn(t) draws frame t (seconds). */
JC.player = function (ctl, fn, label) {
  const id = "pl" + Math.random().toString(36).slice(2, 7);
  ctl.insertAdjacentHTML("beforeend", `<div class="row"><button id="${id}">${label || "Play"}</button></div>`);
  const b = document.getElementById(id); let on = false;
  b.onclick = () => { on = !on; b.textContent = on ? "Pause" : (label || "Play"); if (on) anim(fn); else stopAnim(); };
  fn(0);
};

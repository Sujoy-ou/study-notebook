(function () {
/* ML shelf, Part 6, Lesson 30: Softmax and multiclass. The course has no lecture notes for week 9 (softmax classification, multi-class problems), so the topics follow the homework: HW9 Problem 2 (multiclass cross-entropy, 2A to 2C) and Problem 4B (MNIST shapes and ten logits), HW10 A0 and A1 (scores, probabilities, labels and losses) and C2 (softmax on one output), with their solutions docs. Andrew Ng's Machine Learning Specialization course 2 week 2 (multiclass, softmax, neural network with softmax output, improved implementation of softmax, classification with multiple outputs) is the spine, with one-vs-all from Ng's original Machine Learning course week 3. Evaluation of classifiers is Lesson 31. */
const C = ML.C, CC = [C.blue, C.coral, C.teal];
const tx = (x, y, t, a, cls) => `<text class="${cls || "ts"}" x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""}>${t}</text>`;
const f = (v, d) => (+v).toFixed(d == null ? 4 : d);
const mn = v => String(v).replace(/-/g, "−");
const RO = items => ML.readout(items.map(([k, v]) => [k, mn(v)]));
const sig = z => 1 / (1 + Math.exp(-z));
const sp = z => Math.max(z, 0) + Math.log1p(Math.exp(-Math.abs(z)));
const bceZ = (z, y) => sp(z) - y * z;
const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
const sm = z => { const M = Math.max(...z), e = z.map(v => Math.exp(v - M)), s = e.reduce((a, b) => a + b, 0); return e.map(v => v / s); };
const lse = z => { const M = Math.max(...z); return M + Math.log(z.reduce((s, v) => s + Math.exp(v - M), 0)); };
const TB = (head, rows) => `<table style="width:100%;border-collapse:collapse;font-size:13px;margin-top:6px"><tr>${head.map(h => `<th style="text-align:left;padding:4px 6px;border-bottom:1.5px solid var(--line);color:var(--muted);font-weight:600">${h}</th>`).join("")}</tr>${rows.map(r => `<tr>${r.map(c => `<td style="padding:4px 6px;border-bottom:1px solid var(--line);vertical-align:top">${c}</td>`).join("")}</tr>`).join("")}</table>`;
const vec = (v, d) => "(" + v.map(x => f(x, d)).join(", ") + ")";
/* binary logistic regression by batch gradient descent from zeros (Lesson 29) */
const fitLog = (F, y, a, n) => {
  const m = y.length, d = F[0].length; let w = new Array(d).fill(0), b = 0;
  for (let k = 0; k < n; k++) { const gw = new Array(d).fill(0); let gb = 0; for (let i = 0; i < m; i++) { const e = sig(dot(w, F[i]) + b) - y[i]; gb += e; for (let j = 0; j < d; j++) gw[j] += e * F[i][j]; } w = w.map((v, j) => v - a * gw[j] / m); b -= a * gb / m; }
  return { w, b };
};
/* softmax regression by batch gradient descent from zeros. W[c] is the weight vector of class c. Returns final W, b and, if keep, every state and cost. */
const fitSm = (F, y, K, a, n, keep) => {
  const m = y.length, d = F[0].length; let W = Array.from({ length: K }, () => new Array(d).fill(0)), b = new Array(K).fill(0);
  const J = () => { let s = 0; for (let i = 0; i < m; i++) { const z = W.map((w, c) => dot(w, F[i]) + b[c]); s += lse(z) - z[y[i]]; } return s / m; };
  const H = keep ? [J()] : null, P = keep ? [[W.map(r => r.slice()), b.slice()]] : null;
  for (let k = 0; k < n; k++) {
    const gW = W.map(() => new Array(d).fill(0)), gb = new Array(K).fill(0);
    for (let i = 0; i < m; i++) { const p = sm(W.map((w, c) => dot(w, F[i]) + b[c])); for (let c = 0; c < K; c++) { const e = p[c] - (y[i] === c ? 1 : 0); gb[c] += e; for (let j = 0; j < d; j++) gW[c][j] += e * F[i][j]; } }
    W = W.map((w, c) => w.map((v, j) => v - a * gW[c][j] / m)); b = b.map((v, c) => v - a * gb[c] / m);
    if (keep) { H.push(J()); P.push([W.map(r => r.slice()), b.slice()]); }
  }
  return { W, b, H, P };
};
/* marching squares for the zero set of fz on a box, drawn with the axes maps (Lesson 29) */
const zeroSet = (fz, a, box, n, col, w, dash) => {
  const dx = (box.xmax - box.xmin) / n, dy = (box.ymax - box.ymin) / n, V = [];
  for (let i = 0; i <= n; i++) { V.push([]); for (let j = 0; j <= n; j++) V[i].push(fz(box.xmin + i * dx, box.ymin + j * dy)); }
  let d = "";
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const c = [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]], pts = [];
    for (let k = 0; k < 4; k++) { const [i1, j1] = c[k], [i2, j2] = c[(k + 1) % 4], v1 = V[i1][j1], v2 = V[i2][j2]; if ((v1 < 0) !== (v2 < 0)) { const t = v1 / (v1 - v2); pts.push([box.xmin + (i1 + t * (i2 - i1)) * dx, box.ymin + (j1 + t * (j2 - j1)) * dy]); } }
    for (let k = 0; k + 1 < pts.length; k += 2) d += `M${a.X(pts[k][0]).toFixed(1)} ${a.Y(pts[k][1]).toFixed(1)}L${a.X(pts[k + 1][0]).toFixed(1)} ${a.Y(pts[k + 1][1]).toFixed(1)}`;
  }
  return d ? `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w || 2.2}" stroke-linecap="round"${dash ? ` stroke-dasharray="${dash}"` : ""}/>` : "";
};
/* region shading: fc(x, y) returns [color, opacity] for the cell center */
const shadeK = (fc, a, box, n) => {
  let s = ""; const dx = (box.xmax - box.xmin) / n, dy = (box.ymax - box.ymin) / n;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const [col, op] = fc(box.xmin + (i + 0.5) * dx, box.ymin + (j + 0.5) * dy);
    const x0 = a.X(box.xmin + i * dx), y0 = a.Y(box.ymin + (j + 1) * dy), w = a.X(box.xmin + (i + 1) * dx) - x0 + 0.4, h = a.Y(box.ymin + j * dy) - y0 + 0.4;
    s += `<rect x="${x0.toFixed(1)}" y="${y0.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="${col}" opacity="${op.toFixed(2)}"/>`;
  }
  return s;
};
/* class markers: 0 blue circle, 1 coral triangle, 2 teal square */
const mk = (a, x, y, c, r) => { r = r || 4.5; const X = a.X(x), Y = a.Y(y); return c === 0 ? `<circle cx="${X}" cy="${Y}" r="${r - 0.5}" fill="${CC[0]}" stroke="#fff" stroke-width="0.6"/>` : c === 1 ? `<path d="M${X - r} ${Y + r * 0.8} L${X} ${Y - r} L${X + r} ${Y + r * 0.8} Z" fill="${CC[1]}" stroke="#fff" stroke-width="0.6"/>` : `<rect x="${X - r + 0.6}" y="${Y - r + 0.6}" width="${2 * r - 1.2}" height="${2 * r - 1.2}" fill="${CC[2]}" stroke="#fff" stroke-width="0.6"/>`; };
const legend3 = (x, y) => [0, 1, 2].map(c => mk({ X: v => v, Y: v => v }, x + c * 74, y, c) + tx(x + c * 74 + 9, y + 4, "class " + c)).join("");
/* bars for a probability vector. o: {x, y, w, h, labs, hi (target index), cols} */
const bars = (p, o) => {
  const n = p.length, bw = o.w / n; let s = `<line x1="${o.x}" y1="${o.y + o.h}" x2="${o.x + o.w}" y2="${o.y + o.h}" stroke="var(--p)"/>`;
  p.forEach((v, i) => {
    const hh = Math.max(0, Math.min(1, v)) * o.h, x = o.x + i * bw + bw * 0.18, col = o.cols ? o.cols[i] : C.teal;
    s += `<rect x="${x.toFixed(1)}" y="${(o.y + o.h - hh).toFixed(1)}" width="${(bw * 0.64).toFixed(1)}" height="${hh.toFixed(1)}" rx="3" fill="${col}" opacity="${o.hi === i || o.hi == null ? 0.9 : 0.45}"${o.hi === i ? ` stroke="var(--t)" stroke-width="1.6"` : ""}/>`;
    s += tx(x + bw * 0.32, o.y + o.h - hh - 6, o.fmt ? o.fmt(v) : f(v, 3), "middle") + tx(x + bw * 0.32, o.y + o.h + 15, o.labs ? o.labs[i] : i, "middle", o.hi === i ? "th" : "ts");
  });
  return s;
};

/* Cards 1 and 8: 90 fresh points, 30 per class around (-1.5, -0.6), (1.5, -0.8), (0, 1.5), spread 0.8, default_rng(3131), rounded to 2 decimals */
const D8 = [[0.19,1.44,2],[0.44,0.31,2],[2.29,-1.8,1],[1.1,-1.82,1],[-0.36,2.17,2],[-0.33,2.52,2],[-2.54,-1.13,0],[0.65,0.99,2],[-0.34,1.92,2],[-1.47,-0.84,0],[-0.75,0.37,2],[1.73,-0.2,1],[0.0,2.12,2],[0.91,-1.13,1],[-0.5,1.33,2],[2.16,-0.77,1],[1.22,-0.23,1],[0.33,-0.05,1],[-1.26,-0.63,0],[-2.4,-0.3,0],[1.7,-1.38,1],[1.36,0.49,1],[-0.23,2.44,2],[-0.21,-1.51,0],[-1.09,1.46,2],[-1.96,-1.53,0],[-1.25,-0.46,0],[0.56,-0.54,0],[-0.76,0.23,0],[-0.69,1.48,2],[0.56,2.21,2],[2.1,-1.11,1],[1.52,-2.54,1],[0.77,-1.54,1],[-1.6,-0.79,0],[-1.98,-1.02,0],[-1.24,-0.45,0],[1.89,-1.55,1],[1.06,2.26,2],[1.51,-0.89,1],[1.48,-1.87,1],[0.75,2.18,2],[1.22,1.51,2],[1.06,-1.04,1],[-0.82,0.84,2],[1.22,-0.74,1],[-0.24,0.51,2],[0.56,0.1,2],[0.05,1.66,2],[2.5,0.26,1],[1.1,1.05,2],[1.01,2.74,2],[-1.42,-1.13,0],[0.61,-0.97,1],[-0.42,1.62,2],[1.46,-1.93,1],[-1.71,0.56,0],[-1.49,-1.11,0],[0.56,0.34,1],[0.55,1.04,2],[2.35,-1.91,1],[-3.27,-0.64,0],[-1.94,0.31,0],[0.6,-1.22,1],[-1.68,0.29,0],[0.68,0.45,2],[2.24,-0.84,1],[-1.11,-1.53,0],[0.47,-0.67,1],[-1.26,-1.9,0],[-1.43,0.39,0],[2.04,-0.68,1],[1.08,0.01,1],[-0.65,-2.2,0],[1.33,0.13,1],[-1.67,1.86,2],[-1.07,1.1,0],[-0.69,0.08,0],[0.14,2.38,2],[-1.84,-0.06,0],[-0.11,-0.9,0],[-2.51,-0.69,0],[-2.17,0.22,0],[-1.86,0.3,0],[-0.82,1.32,2],[2.36,-1.69,1],[1.7,-0.54,1],[-0.77,0.8,2],[-0.97,1.16,0],[-0.44,0.78,2]];
/* Card 9: sklearn's 8 by 8 digits (not MNIST), pixels 0 to 16. Softmax regression on pixels/16 trained in NumPy on 1,437 images (stratified split, random_state 30), 3,000 gradient steps at 0.5 with a 0.001 weight decay. W is 64 by 10, rounded to 2 decimals. IMG are 16 of the 360 test images: one correct per digit, then six errors. */
const DG = {"W":[[0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],[-0.02,-0.09,0.11,0.1,-0.04,0.23,-0.05,0.03,-0.13,-0.13],[-0.07,-0.33,0.47,0.06,-0.47,1.41,-0.82,0.27,-0.28,-0.24],[0.36,0.04,0.18,0.55,-1.26,-0.07,-0.15,0.45,-0.74,0.64],[-0.01,-1.65,0.05,1.24,-0.47,0.41,-0.26,0.44,0.22,0.02],[-0.7,0.8,-0.26,0.74,-1.19,1.2,-0.42,0.56,-0.31,-0.43],[-0.39,0.06,-0.18,0.11,-0.52,0.77,-0.15,0.91,-0.59,-0.01],[-0.05,-0.08,-0.02,-0.02,0.2,-0.16,-0.01,0.36,-0.08,-0.14],[-0.0,-0.01,-0.01,-0.01,-0.0,-0.0,-0.0,-0.0,0.04,-0.0],[-0.1,-0.82,0.58,0.32,-0.07,0.13,-0.49,0.07,-0.01,0.39],[0.09,-1.64,0.48,0.27,-0.78,0.7,-0.67,0.25,0.75,0.53],[0.4,-0.2,-0.11,-0.34,-0.55,0.39,0.13,0.32,-0.16,0.12],[0.36,0.63,0.8,0.14,-0.95,-0.03,-0.97,1.18,-0.95,-0.21],[0.6,0.27,-0.18,0.42,-0.99,-0.67,-0.8,0.18,0.85,0.32],[-0.23,-0.41,0.02,0.44,-0.45,-0.13,-0.13,0.39,0.16,0.35],[-0.04,-0.08,-0.02,-0.01,0.05,-0.11,-0.01,0.34,-0.04,-0.08],[-0.0,0.05,-0.01,-0.0,-0.01,-0.02,-0.01,-0.0,-0.0,-0.0],[0.19,0.16,0.02,0.07,-0.11,0.19,-0.57,-0.53,0.28,0.29],[0.56,-0.21,-0.51,-1.73,0.36,0.83,0.46,-1.21,0.61,0.84],[-0.15,2.37,-0.81,-1.37,0.59,0.0,0.12,-0.84,0.07,0.03],[-1.02,1.8,0.45,0.93,0.26,-1.59,-1.1,0.11,-0.12,0.27],[0.91,-0.22,0.03,-0.36,-0.09,-2.1,-1.53,0.28,0.95,2.14],[0.23,-0.29,0.29,-0.17,0.11,-1.14,-0.35,0.46,0.27,0.6],[-0.01,-0.02,-0.0,-0.01,0.11,-0.03,-0.01,0.02,-0.01,-0.04],[-0.0,0.02,-0.0,-0.0,0.01,-0.01,-0.0,-0.0,-0.01,-0.0],[0.5,0.19,-0.5,-0.39,0.5,0.78,0.04,-0.63,-0.39,-0.1],[0.51,0.36,-1.95,-1.75,1.36,1.12,0.41,-0.5,-0.27,0.7],[-1.02,1.1,-1.72,-0.38,-0.16,0.27,0.04,-0.89,1.33,1.44],[-1.89,0.37,-0.38,0.83,0.08,0.51,-0.64,0.1,0.21,0.81],[0.04,0.1,-0.04,-1.37,0.15,-0.5,-0.54,0.94,-0.16,1.39],[0.65,-0.37,-0.06,-0.88,1.34,-0.73,-0.66,0.76,-0.52,0.49],[-0.0,-0.0,-0.0,-0.0,0.02,-0.0,-0.0,-0.01,-0.0,-0.0],[0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],[0.73,-0.1,-0.34,-0.28,1.09,-0.08,0.35,0.14,-0.72,-0.8],[0.68,0.08,-1.24,-0.95,0.89,0.34,0.99,0.16,-0.48,-0.46],[-1.17,-0.1,-0.35,-0.28,-0.19,-0.6,0.83,0.23,1.27,0.35],[-1.66,0.26,-0.2,1.04,0.87,-0.48,0.17,0.6,0.57,-1.17],[-0.12,-0.16,-1.04,0.21,0.85,0.16,0.16,1.08,-1.11,-0.02],[0.63,-0.65,-0.69,-0.13,0.86,0.16,0.07,0.74,-1.21,0.23],[0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],[-0.01,-0.0,-0.0,-0.0,0.02,-0.0,-0.01,-0.0,-0.0,-0.0],[0.15,-0.63,0.21,-0.05,1.39,-0.52,-0.22,0.09,-0.12,-0.31],[1.21,-0.46,0.38,-1.15,0.22,-1.28,1.59,0.03,1.27,-1.81],[-0.77,0.72,1.53,-1.79,1.39,-0.85,0.66,0.68,0.55,-2.11],[-0.73,0.69,-0.58,-0.03,1.25,-0.4,-0.02,0.4,0.45,-1.03],[0.22,-0.8,-1.46,1.0,0.46,0.17,0.38,-0.22,0.56,-0.32],[0.27,-1.19,-0.73,1.06,0.0,0.21,1.0,-0.13,-0.41,-0.08],[-0.0,-0.01,0.01,-0.01,-0.01,-0.0,0.03,-0.0,-0.01,0.0],[-0.02,-0.0,-0.0,-0.0,0.03,-0.0,-0.01,-0.0,-0.0,-0.0],[-0.2,-0.32,0.29,0.05,0.53,-0.07,-0.3,-0.12,0.11,0.04],[0.58,-0.4,0.34,0.04,-0.62,-0.32,0.59,-0.51,0.78,-0.48],[0.04,0.35,1.45,-0.56,-0.01,-0.38,0.64,0.46,-1.23,-0.77],[0.38,0.78,1.17,0.2,0.42,0.17,-0.44,-1.15,-0.83,-0.7],[0.31,-0.11,1.07,0.44,-0.99,0.03,0.84,-1.57,0.55,-0.57],[-0.22,-0.57,0.67,0.65,-0.78,-0.43,0.94,-0.41,0.01,0.15],[-0.04,0.32,0.14,-0.17,-0.03,-0.06,-0.13,-0.02,-0.08,0.06],[0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],[-0.04,-0.1,0.14,0.09,-0.05,0.23,-0.05,-0.04,-0.07,-0.12],[-0.19,-0.6,0.55,0.6,-0.3,1.36,-0.74,0.34,-1.02,-0.0],[0.43,-0.25,0.2,0.38,-0.9,0.72,-0.42,-0.5,0.09,0.25],[-0.1,0.31,0.26,0.39,-0.33,-0.04,0.13,-1.64,0.89,0.12],[-0.34,1.04,1.25,0.15,-0.92,-0.48,1.01,-1.17,-0.21,-0.33],[-0.26,0.74,1.36,-0.3,-0.32,-0.58,0.08,-0.3,-0.39,-0.04],[-0.08,0.84,0.4,-0.37,-0.03,-0.21,-0.23,-0.04,-0.16,-0.12]],"b":[0.14,-1.11,0.07,0.48,1.05,0.13,-0.31,0.55,-0.49,-0.51],"imgs":[[0,0,9,16,11,0,0,0,0,1,16,13,15,7,0,0,0,7,16,6,4,16,3,0,0,9,14,0,0,11,10,0,0,8,13,0,0,7,13,0,0,7,13,0,0,7,16,0,0,3,16,7,7,15,6,0,0,0,9,16,16,10,0,0],[0,0,6,12,11,0,0,0,0,0,12,16,15,0,0,0,0,0,13,16,14,2,0,0,0,1,15,16,11,2,0,0,0,0,9,16,10,0,0,0,0,0,9,16,14,5,0,0,0,0,10,16,16,14,0,0,0,0,4,11,12,8,0,0],[0,0,0,3,15,13,1,0,0,0,2,15,16,16,2,0,0,0,13,10,5,15,0,0,0,0,6,2,11,8,0,0,0,0,0,6,14,2,0,0,0,3,8,16,8,0,0,0,3,16,16,16,16,8,0,0,1,4,4,5,13,6,0,0],[0,0,3,15,16,12,0,0,0,0,6,16,6,14,6,0,0,0,0,3,1,15,6,0,0,0,0,1,14,16,3,0,0,5,8,2,13,16,3,0,0,5,16,0,0,9,13,0,0,1,15,11,8,12,16,1,0,0,3,14,16,16,9,0],[0,0,0,3,15,4,0,0,0,0,4,16,12,0,0,0,0,0,12,15,3,4,3,0,0,7,16,5,3,15,8,0,0,13,16,13,15,16,2,0,0,12,16,16,16,13,0,0,0,0,4,5,16,8,0,0,0,0,0,1,16,4,0,0],[0,2,13,13,11,9,0,0,0,10,16,16,16,15,10,0,0,11,16,9,0,0,0,0,0,3,15,16,8,0,0,0,0,0,2,11,14,0,0,0,0,0,0,8,16,0,0,0,0,0,1,11,11,0,0,0,0,1,16,15,4,0,0,0],[0,0,4,14,5,0,0,0,0,0,13,14,0,0,0,0,0,2,16,10,0,0,0,0,0,4,16,7,0,0,0,0,0,6,16,16,15,4,0,0,0,4,16,9,4,16,2,0,0,1,15,13,6,16,11,0,0,0,4,13,16,15,5,0],[0,0,3,8,12,15,16,2,0,0,12,14,10,13,15,0,0,0,1,1,2,14,6,0,0,0,2,8,13,16,8,0,0,0,9,16,16,10,5,0,0,0,1,8,12,1,0,0,0,0,0,14,8,0,0,0,0,0,2,16,5,0,0,0],[0,0,5,14,15,4,0,0,0,0,8,16,16,14,0,0,0,0,5,16,16,9,0,0,0,0,0,15,16,1,0,0,0,0,1,16,13,0,0,0,0,0,11,15,14,5,0,0,0,0,12,12,8,15,1,0,0,0,5,16,16,16,2,0],[0,0,0,0,8,14,10,0,0,0,0,9,7,9,12,0,0,0,9,8,0,12,9,0,0,4,16,8,12,16,2,0,0,5,16,16,10,15,0,0,0,0,4,0,5,11,0,0,0,0,0,0,8,9,0,0,0,0,0,0,10,10,0,0],[0,0,0,6,13,7,0,0,0,0,10,13,6,15,0,0,0,0,12,8,4,12,0,0,0,0,0,1,15,3,0,0,0,0,0,10,15,2,0,0,0,0,0,1,5,15,2,0,0,0,14,10,2,5,11,0,0,0,2,7,13,15,8,0],[0,2,11,14,14,9,0,0,0,3,10,7,10,16,3,0,0,0,0,4,13,12,0,0,0,0,0,13,15,2,0,0,0,0,0,15,9,0,0,0,0,0,0,9,15,0,0,0,0,0,1,13,9,0,0,0,0,1,15,13,1,0,0,0],[0,0,6,12,13,6,0,0,0,6,16,9,12,16,2,0,0,7,16,9,15,13,0,0,0,0,11,15,16,4,0,0,0,0,0,12,10,0,0,0,0,0,3,16,4,0,0,0,0,0,1,16,2,0,0,0,0,0,6,11,0,0,0,0],[0,0,0,4,12,16,11,0,0,0,15,12,0,5,9,0,0,4,16,5,6,15,3,0,0,3,15,16,14,1,0,0,0,0,3,10,16,2,0,0,0,0,0,0,14,2,0,0,0,0,0,0,12,0,0,0,0,0,0,4,12,0,0,0],[0,0,4,12,16,16,11,2,0,0,15,13,8,11,8,1,0,2,15,13,16,8,0,0,0,6,16,13,13,16,2,0,0,7,11,2,2,16,6,0,0,0,0,0,5,15,2,0,0,0,9,6,13,10,0,0,0,0,7,14,13,1,0,0],[0,0,0,1,12,16,14,0,0,0,3,14,13,15,13,0,0,4,16,15,13,16,4,0,0,3,16,16,16,16,3,0,0,0,7,7,14,14,0,0,0,0,0,0,12,11,0,0,0,0,0,0,13,10,0,0,0,0,0,0,13,12,0,0]],"lab":[0,1,2,3,4,5,6,7,8,9,3,3,9,9,5,9]};
/* Card 7: every value from PyTorch 2.15, float32 */
const STAB = {
  a: { z: [2, 1, -1], y: 0, ex: "(7.389, 2.718, 0.3679)", nv: "(0.7054, 0.2595, 0.0351)", ts: "(0.7054, 0.2595, 0.0351)", nl: "0.3490", ng: "(−0.2946, 0.2595, 0.0351)", ce: "0.3490", cg: "(−0.2946, 0.2595, 0.0351)" },
  b: { z: [1000, 999, 998], y: 2, ex: "(inf, inf, inf)", nv: "(nan, nan, nan)", ts: "(0.6652, 0.2447, 0.0900)", nl: "2.4076", ng: "(0.6652, 0.2447, −0.9100)", ce: "2.4076", cg: "(0.6652, 0.2447, −0.9100)" },
  c: { z: [-1000, -1001, -1002], y: 0, ex: "(0, 0, 0)", nv: "(nan, nan, nan)", ts: "(0.6652, 0.2447, 0.0900)", nl: "0.4076", ng: "(−0.3348, 0.2447, 0.0900)", ce: "0.4076", cg: "(−0.3348, 0.2447, 0.0900)" },
  d: { z: [88, 89, 90], y: 0, ex: "(1.652e+38, inf, inf)", nv: "(0, nan, nan)", ts: "(0.0900, 0.2447, 0.6652)", nl: "2.4076", ng: "(−0.9100, 0.2447, 0.6652)", ce: "2.4076", cg: "(−0.9100, 0.2447, 0.6652)" },
  e: { z: [0, -200], y: 1, ex: "(1, 0)", nv: "(1, 0)", ts: "(1, 0)", nl: "inf", ng: "(nan, nan)", ce: "200", cg: "(1, −1)" }
};

addLesson("ml", "class", {
level: "Core", num: "Lesson 30",
id: "ml-class-l30", title: "Softmax and multiclass", short: "30. Softmax and multiclass",
big: String.raw`Lesson 29 classified into two labels. Most real tasks have more: ten digits, three part types, fifty thousand words. Andrew Ng first shows the old fix, one logistic regression per class, and why it leaves holes and overlaps in the plane. Softmax regression does it in one model. Each class gets its own linear score, and softmax turns the C scores into C probabilities that are positive and sum to 1. Adding the same number to every score changes nothing, dividing them by a temperature makes the answer softer or sharper, and with two classes softmax is exactly the sigmoid of the difference. The loss is cross-entropy, minus the log of the probability given to the true class, which is the negative log-likelihood of a categorical label. Its gradient with respect to the scores is p minus the one-hot label, Lesson 29's p − y once more. Computed naively, exp overflows at a score of 89 in float32, so libraries subtract the maximum and use log-sum-exp, which is why PyTorch's CrossEntropyLoss takes raw logits. The lesson trains softmax regression on three classes, looks inside a ten-digit model, separates multi-class from multi-label tasks, picks the right loss for a task, and ends with HW9's (B, C) logits and (B,) long targets.`,
bridge: String.raw`The course has no lecture notes for softmax, week 9 of the syllabus, so the topics follow the homework: HW9 Problem 2 (multiclass cross-entropy, tasks 2A to 2C) and Problem 4B (ten MNIST logits), HW10 A0 and A1 (scores, probabilities, labels and the loss table) and C2 (a softmax on one output), with the solutions docs. The spine is Andrew Ng's Machine Learning Specialization, course 2 week 2: Multiclass, Softmax, Neural network with softmax output, Improved implementation of softmax, and Classification with multiple outputs. One-vs-all comes from Ng's original Machine Learning course, week 3.`,
labels: { note: "Exam and project note" },
cards: [

{s: "1. Many classes", t: "More than two classes: one-vs-rest against one softmax model",
intu: String.raw`Ninety fresh points in three classes. Ng's first answer is one-vs-rest: train three logistic regressions, each separating one class from the other two, and predict the class whose classifier is most confident. Each classifier claims the side of its own line where p ≥ 0.5. Look at the plane. In the gray corners no classifier claims the point, in the purple wedges two of them do, and only the argmax rule settles it. The three models never saw each other's probabilities, so their outputs need not sum to 1. Switch to softmax regression. One model scores all three classes together, its probabilities always sum to 1, and every point of the plane belongs to exactly one class, with straight borders between them.`,
eq: String.raw`\[ \text{one-vs-rest: } p_c = \sigma(\mathbf{w}_c^T\mathbf{x} + b_c), \ \ \hat{y} = \arg\max_c p_c \]
\[ \text{softmax: } p_c = \frac{e^{z_c}}{\sum_{j} e^{z_j}}, \ \ z_c = \mathbf{w}_c^T\mathbf{x} + b_c \]`,
sym: [[String.raw`\(C\)`, "number of classes, 3 here"], ["one-vs-rest", "C separate binary classifiers, class c against all others"], ["claim", "a binary classifier says p ≥ 0.5 for its own class"], [String.raw`\(\arg\max\)`, "pick the class with the largest score or probability"], ["softmax regression", "one model, C scores, probabilities that sum to 1"]],
how: ["One-vs-rest: relabel the data C times, class c as 1 and the rest as 0.", "Fit one logistic regression per relabeling.", "Predict with the largest of the C probabilities.", "Softmax regression: fit all C score vectors together with one loss.", "Predict with the largest score, which is also the largest probability."],
say: String.raw`One-vs-rest trains C independent binary classifiers whose probabilities need not sum to one, while softmax regression trains one model whose C probabilities are normalized and whose argmax partitions the input space.`,
num: String.raw`α = 0.5, 300 steps from zeros. One-vs-rest leaves <b>2.3%</b> of the square from −4 to 4 unclaimed and <b>30.3%</b> claimed by two classes. Six training points are claimed by no classifier and three by two. Argmax accuracy is 84 of 90 for both methods.`,
note: String.raw`HW9 2B builds the softmax version directly: nn.Linear(2, 3) with 2 × 3 + 3 = 9 parameters, the same count as three one-vs-rest models, trained together instead of apart.`,
r(fig, ctl) {
  const F = D8.map(r => [r[0], r[1]]), Y = D8.map(r => r[2]);
  const OV = [0, 1, 2].map(c => fitLog(F, Y.map(v => v === c ? 1 : 0), 0.5, 300)), SM = fitSm(F, Y, 3, 0.5, 300);
  const zo = (x, y) => OV.map(o => o.w[0] * x + o.w[1] * y + o.b), zs = (x, y) => SM.W.map((w, c) => w[0] * x + w[1] * y + SM.b[c]);
  let st = null;
  const stats = () => { if (st) return st; let none = 0, many = 0; const n = 200; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const k = zo(-4 + (i + 0.5) * 8 / n, -4 + (j + 0.5) * 8 / n).filter(v => v >= 0).length; if (!k) none++; else if (k > 1) many++; } let tn = 0, tm = 0, ao = 0, as = 0; D8.forEach(r => { const z = zo(r[0], r[1]), k = z.filter(v => v >= 0).length; if (!k) tn++; if (k > 1) tm++; if (z.indexOf(Math.max(...z)) === r[2]) ao++; const q = zs(r[0], r[1]); if (q.indexOf(Math.max(...q)) === r[2]) as++; }); return (st = { none: none / n / n, many: many / n / n, tn, tm, ao, as }); };
  ctl.innerHTML = btns([[0, "One-vs-rest, three logistic models"], [1, "Softmax regression, one model"]], "smm") + `<div id="smmo"></div>`;
  let md = 0;
  const u = () => {
    pick(ctl, "smm", md); const S = stats();
    const box = { xmin: -4, xmax: 4, ymin: -4, ymax: 4, nx: 8, ny: 8, fx: v => v, fy: v => v, xl: "x₁", yl: "x₂", grid: false };
    const a = ML.axes(60, 12, 300, 300, box);
    let s = shadeK(md ? (x, y) => { const z = zs(x, y), p = sm(z), c = p.indexOf(Math.max(...p)); return [CC[c], 0.08 + 0.3 * (p[c] - 1 / 3) * 1.5]; } : (x, y) => { const z = zo(x, y), on = z.map((v, c) => v >= 0 ? c : -1).filter(c => c >= 0); return on.length === 1 ? [CC[on[0]], 0.22] : on.length ? [C.purple, 0.38] : [C.gray, 0.32]; }, a, box, 50) + a.s;
    if (md) [0, 1, 2].forEach(c => { s += zeroSet((x, y) => { const z = zs(x, y); return z[c] - Math.max(...z.filter((_, k) => k !== c)); }, a, box, 70, "var(--t)", 2.2); });
    else OV.forEach((o, c) => { s += zeroSet((x, y) => o.w[0] * x + o.w[1] * y + o.b, a, box, 60, CC[c], 2.4); });
    D8.forEach(r => { s += mk(a, r[0], r[1], r[2]); });
    s += tx(390, 34, md ? "softmax regression" : "one-vs-rest", null, "th") + legend3(398, 60);
    if (md) s += tx(390, 100, "every point gets exactly one class", null, "t") + tx(390, 122, "borders: where two top scores tie") + tx(390, 142, "shading: stronger where p is larger");
    else s += `<rect x="390" y="88" width="14" height="14" fill="${C.gray}" opacity="0.5"/>` + tx(410, 100, "claimed by no classifier") + `<rect x="390" y="110" width="14" height="14" fill="${C.purple}" opacity="0.5"/>` + tx(410, 122, "claimed by two classifiers") + tx(390, 146, "colored lines: each model's p = 0.5");
    s += tx(390, 186, md ? `training accuracy ${S.as} of 90` : `argmax accuracy ${S.ao} of 90`, null, "t");
    fig.innerHTML = svg(330, s);
    $("smmo").innerHTML = md ? RO([["probabilities", "sum to 1 everywhere"], ["parameters", "3 weight vectors + 3 biases = 9"]]) : RO([["unclaimed area", f(100 * S.none, 1) + "%"], ["area claimed twice", f(100 * S.many, 1) + "%"], ["training points unclaimed", S.tn], ["claimed twice", S.tm]]);
  };
  ctl.querySelectorAll("button[data-smm]").forEach(b => b.onclick = () => { md = +b.dataset.smm; u(); });
  u();
}},

{s: "2. Softmax", t: "Softmax turns C scores into C probabilities",
intu: String.raw`Ng's softmax in two moves. Exponentiate every score, which makes each one positive while keeping their order. Then divide by the total, which makes them sum to 1. Slide the three logits. At (2, 1, −1) the exponentials are 7.389, 2.718 and 0.368, the total is 10.475, and the probabilities are 0.7054, 0.2595 and 0.0351. Equal scores give 1/3 each. One score far above the others takes almost all the mass, which is why the function is a soft version of argmax: the largest score always gets the largest probability, but the others keep a share. Each probability depends on every score, so raising one score lowers all the other probabilities.`,
eq: String.raw`\[ p_c = \mathrm{softmax}(\mathbf{z})_c = \frac{e^{z_c}}{\sum_{j=1}^{C} e^{z_j}} \]
\[ p_c \gt 0, \qquad \sum_{c=1}^{C} p_c = 1 \]`,
sym: [[String.raw`\(\mathbf{z}\)`, "vector of C logits, one score per class"], [String.raw`\(e^{z_c}\)`, "positive, order kept"], [String.raw`\(\sum_j e^{z_j}\)`, "the normalizer, the same for every class"], [String.raw`\(p_c\)`, "probability the model gives class c"], ["soft argmax", "the largest score gets the largest share, not all of it"]],
how: ["Exponentiate each logit.", "Add the exponentials.", "Divide each exponential by the sum.", "Check the probabilities add to 1.", "The predicted class is the index of the largest logit."],
say: String.raw`Softmax exponentiates a vector of logits and normalizes by their sum, giving positive probabilities that sum to one and preserve the ordering of the logits.`,
num: String.raw`z = (2, 1, −1): exponentials 7.389, 2.718, 0.368, sum <b>10.475</b>, probabilities (<b>0.7054, 0.2595, 0.0351</b>). z = (3, 0, 0): (0.9094, 0.0453, 0.0453). z = (1, 1, 1): 1/3 each.`,
r(fig, ctl) {
  ctl.innerHTML = sl("smz0", "z₀", -4, 4, 0.1, 2) + sl("smz1", "z₁", -4, 4, 0.1, 1) + sl("smz2", "z₂", -4, 4, 0.1, -1) + `<div id="smzo"></div>`;
  const u = () => {
    const z = [0, 1, 2].map(i => +$("smz" + i).value); z.forEach((v, i) => $("smz" + i + "v").textContent = f(v, 1));
    const e = z.map(Math.exp), S = e.reduce((a, b) => a + b, 0), p = e.map(v => v / S), top = p.indexOf(Math.max(...p));
    let s = tx(110, 22, "logits z", "middle", "th") + tx(340, 22, "exponentials", "middle", "th") + tx(570, 22, "probabilities", "middle", "th");
    const zx = 30, zy0 = 130;
    s += `<line x1="${zx}" y1="${zy0}" x2="${zx + 170}" y2="${zy0}" stroke="var(--p)"/>`;
    z.forEach((v, i) => { const hh = v * 22, x = zx + 12 + i * 54; s += `<rect x="${x}" y="${Math.min(zy0, zy0 - hh)}" width="34" height="${Math.abs(hh)}" rx="3" fill="${CC[i]}" opacity="0.85"/>` + tx(x + 17, v >= 0 ? zy0 - hh - 6 : zy0 - hh + 15, mn(f(v, 1)), "middle") + tx(x + 17, 238, "class " + i, "middle"); });
    s += arrow(205, 130, 245, 130, "var(--p)", 1.4) + tx(225, 120, "exp", "middle");
    const eM = Math.max(60, ...e);
    s += bars(e.map(v => v / eM), { x: 255, y: 40, w: 170, h: 180, cols: CC, fmt: v => (v * eM) >= 100 ? f(v * eM, 0) : f(v * eM, 2), labs: ["", "", ""] });
    s += arrow(435, 130, 475, 130, "var(--p)", 1.4) + tx(455, 120, "÷ sum", "middle");
    s += bars(p, { x: 485, y: 40, w: 170, h: 180, cols: CC, hi: top, labs: ["", "", ""] });
    s += tx(340, 262, "sum of exponentials = " + f(S, 3), "middle", "t") + tx(570, 262, "sum of probabilities = " + f(p.reduce((a, b) => a + b, 0), 4), "middle", "t");
    fig.innerHTML = svg(280, s);
    $("smzo").innerHTML = RO([["p", vec(p, 4)], ["predicted class", top + " (largest logit and largest p)"]]);
  };
  [0, 1, 2].forEach(i => $("smz" + i).oninput = u); u();
}},

{s: "3. Shift and scale", t: "What softmax ignores, what sharpens it, and what breaks it",
intu: String.raw`Three facts about the shape of softmax. First, adding the same constant c to every logit multiplies every exponential by \(e^c\), which cancels, so the probabilities do not move. HW9 2A adds 10 and sees identical numbers. Only differences between logits matter. Second, dividing every logit by a temperature T changes those differences: T below 1 sharpens toward a one-hot vector, T above 1 flattens toward uniform. Third, with two classes softmax depends only on \(z_1 - z_0\) and equals the sigmoid of it, so Lesson 29 is the C = 2 case. And HW10 C2's warning: softmax over a single output is always exactly 1, so it has a zero gradient and cannot learn anything.`,
eq: String.raw`\[ \mathrm{softmax}(\mathbf{z} + c\mathbf{1}) = \mathrm{softmax}(\mathbf{z}), \qquad \mathrm{softmax}(\mathbf{z}/T) \]
\[ C = 2: \ \ p_1 = \frac{e^{z_1}}{e^{z_0} + e^{z_1}} = \sigma(z_1 - z_0) \]`,
sym: [[String.raw`\(c\)`, "any constant added to every logit, no effect"], [String.raw`\(T\)`, "temperature, below 1 sharper, above 1 flatter"], [String.raw`\(z_1 - z_0\)`, "the only thing a two-class softmax sees"], [String.raw`\(\sigma\)`, "the sigmoid of Lesson 29"], ["one output", "softmax of a single number is always 1"]],
how: ["To check shift invariance, add the same number to all logits and recompute.", "Divide the logits by T to sharpen or soften the distribution.", "With two classes, compute the sigmoid of the logit difference.", "Never put a softmax over a dimension of size 1.", "Remember that invariance says nothing about calibration."],
say: String.raw`Softmax is invariant to adding a constant to all logits, a temperature rescales the logit differences, a two-class softmax equals the sigmoid of the logit difference, and a softmax over one output is constant.`,
num: String.raw`z = (2, 1, −1): T = 1 gives (0.7054, 0.2595, 0.0351), T = 0.5 gives (<b>0.8789</b>, 0.1189, 0.0022), T = 2 gives (<b>0.5465</b>, 0.3315, 0.1220). Two classes (0.5, 1.5): p₁ = σ(1) = <b>0.7311</b>. One output: Linear(1, 1) then softmax(dim=1) on three inputs outputs (1, 1, 1), MSE 3.3333 against targets (1, 2, 4), and every gradient is <b>0</b>.`,
note: String.raw`HW9 2A asks whether shift invariance means the model is calibrated. It does not. A model that is too confident stays too confident after the shift. Calibration is a property of predictions against held-out labels, Lesson 31.`,
r(fig, ctl) {
  ctl.innerHTML = btns([[0, "Shift and temperature"], [1, "Two classes"], [2, "One output (HW10 C2)"]], "smsh") + `<div id="smshc"></div><div id="smsho"></div>`;
  let md = 0;
  const build = () => {
    pick(ctl, "smsh", md);
    $("smshc").innerHTML = md === 0 ? sl("smc", "shift c", -10, 10, 0.5, 0) + sl("smt", "temperature T", 0.25, 5, 0.05, 1) : md === 1 ? sl("smq0", "z₀", -4, 4, 0.1, 0.5) + sl("smq1", "z₁", -4, 4, 0.1, 1.5) : sl("smo", "the single logit", -6, 6, 0.1, 0.8);
    ($("smc") ? ["smc", "smt"] : $("smq0") ? ["smq0", "smq1"] : ["smo"]).forEach(k => $(k).oninput = u);
    u();
  };
  const u = () => {
    let s = "";
    if (md === 0) {
      const c = +$("smc").value, T = +$("smt").value; $("smcv").textContent = f(c, 1); $("smtv").textContent = f(T, 2);
      const z = [2, 1, -1].map(v => (v + c) / T), p = sm(z), p1 = sm([2, 1, -1]);
      s += tx(60, 24, "logits (2, 1, −1) + c, divided by T: " + vec(z, 2), null, "th");
      s += bars(p, { x: 60, y: 50, w: 330, h: 180, cols: CC, labs: ["class 0", "class 1", "class 2"] });
      p1.forEach((v, i) => { const x = 60 + i * 110 + 110 * 0.18; s += `<rect x="${x}" y="${50 + 180 - v * 180}" width="${110 * 0.64}" height="${v * 180}" rx="3" fill="none" stroke="var(--t)" stroke-dasharray="4 3"/>`; });
      s += tx(430, 70, "dashed: T = 1, no shift", null, "t") + tx(430, 96, "the shift c never changes the bars") + tx(430, 116, "T below 1: sharper, toward one-hot") + tx(430, 136, "T above 1: flatter, toward 1/3 each");
      fig.innerHTML = svg(270, s);
      $("smsho").innerHTML = RO([["p", vec(p, 4)], ["largest p", f(Math.max(...p), 4)], ["logit differences", mn(f(z[0] - z[1], 2) + " and " + f(z[1] - z[2], 2))]]);
    } else if (md === 1) {
      const z0 = +$("smq0").value, z1 = +$("smq1").value; $("smq0v").textContent = f(z0, 1); $("smq1v").textContent = f(z1, 1);
      const p = sm([z0, z1]), d = z1 - z0;
      const a = ML.axes(60, 16, 380, 210, { xmin: -8, xmax: 8, ymin: 0, ymax: 1, nx: 8, ny: 4, fx: v => mn(v), fy: v => v.toFixed(2), xl: "difference z₁ − z₀", yl: "p₁", grid: false });
      s += a.s + ML.path(Array.from({ length: 161 }, (_, i) => { const v = -8 + i * 0.1; return [a.X(v), a.Y(sig(v))]; }), C.teal, 2.4) + `<circle cx="${a.X(Math.max(-8, Math.min(8, d)))}" cy="${a.Y(p[1])}" r="6" fill="${C.coral}"/>`;
      s += bars(p, { x: 500, y: 40, w: 150, h: 170, cols: [CC[0], CC[1]], labs: ["class 0", "class 1"] });
      s += tx(70, 34, "teal curve: σ(z₁ − z₀)", null, "t") + tx(70, 52, "coral dot: softmax of (z₀, z₁)");
      fig.innerHTML = svg(270, s);
      $("smsho").innerHTML = RO([["softmax p₁", f(p[1], 4)], ["σ(z₁ − z₀)", f(sig(d), 4)], ["z₁ − z₀", f(d, 2)]]);
    } else {
      const z = +$("smo").value; $("smov").textContent = f(z, 1);
      s += ML.code(["model = nn.Linear(1, 1)", "x = torch.tensor([[0.5], [1.0], [2.0]])", "y = torch.tensor([[1.0], [2.0], [4.0]])", "out = torch.softmax(model(x), dim=1)   # shape (3, 1)", "loss = F.mse_loss(out, y)", "loss.backward()", "print(out.T, round(loss.item(), 4))", "print(model.weight.grad, model.bias.grad)"], 3) + ML.term(["tensor([[1., 1., 1.]]) 3.3333", "tensor([[0.]]) tensor([0.])"]);
      fig.innerHTML = svg(70, tx(20, 26, `softmax over one column: e^z / e^z = 1 for z = ${mn(f(z, 1))}, and for every other z`, null, "th") + tx(20, 50, "the output never changes, so its derivative is 0 and no parameter receives a gradient")) + s;
      $("smsho").innerHTML = RO([["output", "1.0000"], ["d(output)/dz", "0"], ["three columns, d p₀ / dz for (2, 0, −1)", "(0.1318, −0.0964, −0.0354)"]]);
    }
  };
  ctl.querySelectorAll("button[data-smsh]").forEach(b => b.onclick = () => { md = +b.dataset.smsh; build(); });
  build();
}},

{s: "4. Cross-entropy", t: "Cross-entropy is minus the log of the true class's probability",
intu: String.raw`Ng's softmax loss keeps only one term: the true class's probability, through −log. HW9 2A by hand: logits (log 2, 0, −log 2) exponentiate to (2, 1, 0.5), the denominator is 3.5, the probabilities are (0.5714, 0.2857, 0.1429), the predicted class is 0, and for true class 2 the loss is −log(1/7) = log 7 = 1.9459 nats. The model is wrong and pays for it. Written with a one-hot target y = (0, 0, 1), the loss is \(-\sum_c y_c\log p_c\), where every term but the true one is zero. Pick a preset and a true class. The loss depends on how much probability the true class got, not on which class won.`,
eq: String.raw`\[ \ell = -\log p_{y} = -\sum_{c=1}^{C} y_c \log p_c \]
\[ \ell = \log\sum_j e^{z_j} - z_{y} \]`,
sym: [[String.raw`\(y\)`, "true class index, 0 to C − 1"], ["one-hot", "vector with 1 at the true class and 0 elsewhere"], [String.raw`\(p_y\)`, "probability given to the true class"], [String.raw`\(\ell\)`, "per-example loss in nats"], ["log-sum-exp form", "the same loss computed from logits, card 7"]],
how: ["Exponentiate the logits and add them for the denominator.", "Divide to get the probabilities.", "Pick the probability of the true class.", "Take minus its natural log.", "Check with log-sum-exp of z minus the true logit."],
say: String.raw`Categorical cross-entropy is the negative log of the probability the softmax assigns to the true class, which equals the log-sum-exp of the logits minus the true class logit.`,
num: String.raw`HW9 2A: denominator <b>3.5</b>, p = (0.5714, 0.2857, 0.1429), loss <b>1.9459</b> for class 2. HW10 A1: logits (2, 0, −1), true class 1, denominator 8.7569, p = (0.8438, 0.1142, 0.0420), loss <b>2.1698</b>. Second HW10 row (−2, 1, 3), true class 2: p₂ = 0.8756, loss 0.1328.`,
r(fig, ctl) {
  const PR = { a: [[Math.log(2), 0, -Math.log(2)], 2, "HW9 2A: (log 2, 0, −log 2)"], b: [[2, 0, -1], 1, "HW10 A1 row 1: (2, 0, −1)"], c: [[-2, 1, 3], 2, "HW10 A1 row 2: (−2, 1, 3)"], d: [[0.5, 2, 1], 0, "fresh: (0.5, 2, 1)"] };
  ctl.innerHTML = btns(Object.entries(PR).map(([k, v]) => [k, v[2]]), "smce") + btns([[0, "true class 0"], [1, "true class 1"], [2, "true class 2"]], "smcy") + `<div id="smceo"></div>`;
  let pr = "a", y = 2;
  const u = () => {
    pick(ctl, "smce", pr); pick(ctl, "smcy", y);
    const z = PR[pr][0], e = z.map(Math.exp), S = e.reduce((a, b) => a + b, 0), p = e.map(v => v / S), L = -Math.log(p[y]), top = p.indexOf(Math.max(...p));
    let s = tx(40, 22, "probabilities, true class outlined", null, "th") + bars(p, { x: 40, y: 40, w: 300, h: 170, cols: CC, hi: y, labs: ["class 0", "class 1", "class 2"] });
    s += tx(40, 258, "one-hot target y = (" + [0, 1, 2].map(c => c === y ? 1 : 0).join(", ") + ")", null, "t");
    const a = ML.axes(420, 30, 230, 180, { xmin: 0, xmax: 1, ymin: 0, ymax: 5, nx: 4, ny: 5, fx: v => v.toFixed(2), fy: v => v, xl: "probability of the true class", yl: "loss", grid: false });
    s += a.s + ML.path(Array.from({ length: 99 }, (_, i) => { const q = 0.01 + i * 0.01; return [a.X(q), a.Y(Math.min(5, -Math.log(q)))]; }), C.coral, 2.2) + `<circle cx="${a.X(p[y])}" cy="${a.Y(Math.min(5, L))}" r="6" fill="${CC[y]}" stroke="var(--t)"/>` + tx(a.X(0.55), a.Y(4.2), "−log p", null, "th");
    fig.innerHTML = svg(280, s);
    $("smceo").innerHTML = RO([["denominator Σ e^z", f(S, 4)], ["p", vec(p, 4)], ["loss −log p_y", f(L, 4) + " nats"], ["log-sum-exp − z_y", f(lse(z) - z[y], 4)], ["predicted class", top + (top === y ? ", correct" : ", wrong")]]);
  };
  ctl.querySelectorAll("button[data-smce]").forEach(b => b.onclick = () => { pr = b.dataset.smce; y = PR[pr][1]; u(); });
  ctl.querySelectorAll("button[data-smcy]").forEach(b => b.onclick = () => { y = +b.dataset.smcy; u(); });
  u();
}},

{s: "5. Likelihood and accuracy", t: "The loss is a likelihood, so it moves when accuracy does not",
intu: String.raw`A label from C classes follows a categorical distribution, the many-sided coin of Lesson 14, with likelihood \(\prod_c p_c^{y_c}\), which is just \(p_y\). Minus the log, averaged over independent examples, is the mean cross-entropy, so minimizing it is maximum likelihood again. Two consequences. A model that knows nothing gives every class 1/C and pays log C per example: 1.0986 for three classes, 2.3026 for ten, the number HW10 B3 asks you to predict before training. And accuracy only counts the top class, while the loss scores the whole probability. Scale four examples' logits by s. When all four are right, accuracy stays 100% while the loss keeps falling. When one is wrong, accuracy stays 75%, yet the loss falls and then rises again, because more confidence also makes the mistake more expensive.`,
eq: String.raw`\[ P(y \mid \mathbf{x}) = \prod_{c=1}^{C} p_c^{\,y_c} = p_y \]
\[ J = -\frac{1}{m}\sum_{i=1}^{m}\log p_{i, y_i}, \qquad J_{\text{uniform}} = \log C \]`,
sym: [["categorical", "one of C outcomes with probabilities that sum to 1"], [String.raw`\(J\)`, "mean cross-entropy, the negative log-likelihood per example"], [String.raw`\(\log C\)`, "loss of the uniform model, the starting point to beat"], ["accuracy", "fraction whose largest logit is the true class"], [String.raw`\(s\)`, "a common scale on the logits, like 1/T"]],
how: ["Before training, predict the loss log C and the accuracy 1/C on balanced data.", "Check that the first epoch starts near log C.", "Track the loss, not only accuracy, to see confidence change.", "Expect loss and accuracy to disagree in detail.", "Pick checkpoints by validation loss, as in HW9 and HW10."],
say: String.raw`Mean cross-entropy is the negative log-likelihood of a categorical model, so a uniform model scores log C, and the loss can change while accuracy, which ignores the size of the probabilities, stays constant.`,
num: String.raw`All right: s = 0.5, 1, 2, 4 give loss 0.7131, 0.4567, 0.1945, <b>0.0461</b> at 100% accuracy. One wrong: 0.7756, 0.5817, <b>0.4445</b>, 0.5461 at 75%. Uniform: log 3 = 1.0986, log 10 = <b>2.3026</b>.`,
r(fig, ctl) {
  const L = [[2, 1, 0], [0, 2, 1], [1, 0, 2], [1.5, 1, 0]];
  const run = (s, y) => { let J = 0, acc = 0; const rows = L.map((z, i) => { const p = sm(z.map(v => v * s)), l = -Math.log(p[y[i]]); J += l; const top = p.indexOf(Math.max(...p)); if (s > 0 && top === y[i]) acc++; return [p, l, top]; }); return { J: J / 4, acc, rows }; };
  ctl.innerHTML = btns([[0, "all four labels right"], [1, "last label wrong"]], "smlw") + sl("sms", "logit scale s", 0, 5, 0.1, 1) + `<div id="smlo"></div>`;
  let wr = 0;
  const u = () => {
    pick(ctl, "smlw", wr); const s = +$("sms").value; $("smsv").textContent = f(s, 1);
    const Y0 = [0, 1, 2, 0], Y1 = [0, 1, 2, 1], Y = wr ? Y1 : Y0, R = run(s, Y);
    const a = ML.axes(60, 16, 300, 210, { xmin: 0, xmax: 5, ymin: 0, ymax: 1.2, nx: 5, ny: 4, fx: v => v, fy: v => v.toFixed(1), xl: "logit scale s", yl: "mean loss", grid: false });
    const ss = Array.from({ length: 101 }, (_, i) => i * 0.05);
    let g = a.s + `<line x1="${a.X(0)}" y1="${a.Y(Math.log(3))}" x2="${a.X(5)}" y2="${a.Y(Math.log(3))}" stroke="var(--p)" stroke-dasharray="4 4"/>` + tx(a.X(5) - 4, a.Y(Math.log(3)) - 6, "log 3, uniform", "end");
    g += ML.path(ss.map(v => [a.X(v), a.Y(run(v, Y0).J)]), C.teal, wr ? 1.2 : 2.6, wr ? "4 3" : null) + ML.path(ss.map(v => [a.X(v), a.Y(Math.min(1.2, run(v, Y1).J))]), C.coral, wr ? 2.6 : 1.2, wr ? null : "4 3");
    g += `<circle cx="${a.X(s)}" cy="${a.Y(Math.min(1.2, R.J))}" r="6" fill="${wr ? C.coral : C.teal}"/>` + tx(a.X(4.9), a.Y(0.12), "all right", "end") + tx(a.X(4.9), a.Y(0.62), "one wrong", "end");
    g += tx(380, 30, "example", null, "th") + tx(498, 30, "label", "middle", "th") + tx(530, 30, "p of label", null, "th") + tx(608, 30, "loss", null, "th");
    R.rows.forEach(([p, l, top], i) => { const ok = s > 0 && top === Y[i]; g += tx(380, 56 + i * 24, "logits " + mn(vec(L[i], 1).replace(/\.0/g, ""))) + tx(498, 56 + i * 24, Y[i], "middle") + tx(530, 56 + i * 24, f(p[Y[i]], 4), null, "t") + tx(608, 56 + i * 24, f(l, 4), null, "t") + `<circle cx="668" cy="${52 + i * 24}" r="4" fill="${ok ? C.teal : C.coral}"/>`; });
    g += tx(380, 170, "dot: teal when the top class is the label") + tx(380, 200, `accuracy ${s > 0 ? R.acc + " of 4" : "undefined, all tied"}`, null, "th") + tx(380, 224, "mean loss " + f(R.J, 4), null, "th");
    fig.innerHTML = svg(270, g);
    $("smlo").innerHTML = RO([["mean loss", f(R.J, 4)], ["accuracy", s > 0 ? f(100 * R.acc / 4, 0) + "%" : "tie"], ["uniform loss log C", "log 3 = 1.0986, log 10 = 2.3026"]]);
  };
  ctl.querySelectorAll("button[data-smlw]").forEach(b => b.onclick = () => { wr = +b.dataset.smlw; u(); });
  $("sms").oninput = u; u();
}},

{s: "6. The gradient", t: "The gradient is p minus the one-hot label",
intu: String.raw`Backward through softmax and cross-entropy for one example with x = (1, 2) and three weight rows. The loss only touches \(p_y\), so dℓ/dp is \(-1/p_y\) at the true class and 0 elsewhere. Softmax couples every output to every input, so its derivative is a full matrix, the Jacobian diag(p) − ppᵀ. Multiply the two and almost everything cancels: dℓ/dz = p − y with y one-hot, the same p − y as Lesson 29 and as linear regression. The true class gets \(p_y - 1\), which is negative, so gradient descent raises its score. Every other class gets its own probability, positive, so their scores fall. The components add up to 0 because the probabilities add up to 1. Each weight row then gets its error times x.`,
eq: String.raw`\[ \frac{\partial p_c}{\partial z_k} = p_c(\delta_{ck} - p_k), \qquad \frac{\partial \ell}{\partial \mathbf{z}} = \mathbf{p} - \mathbf{y} \]
\[ \nabla_{W} J = \frac{1}{m}(P - Y)^T X, \qquad \nabla_{\mathbf{b}} J = \frac{1}{m}\sum_i (\mathbf{p}_i - \mathbf{y}_i) \]`,
sym: [[String.raw`\(\delta_{ck}\)`, "1 when c = k, else 0"], ["Jacobian", "diag(p) − ppᵀ, C by C, symmetric"], [String.raw`\(\mathbf{p} - \mathbf{y}\)`, "error vector, sums to 0"], [String.raw`\(P, Y\)`, "m by C matrices of probabilities and one-hot labels"], ["W rows", "one weight vector per class, as in Ng's videos"]],
how: ["Forward: z = Wx + b, p = softmax(z), loss minus the log of the true class probability.", "Backward through the loss: minus one over the true class probability, at the true class only.", "Backward through softmax with the Jacobian.", "The product collapses to p − y.", "Each class's weights get its error times x, its bias gets the error."],
say: String.raw`For softmax with cross-entropy the gradient with respect to the logits is the predicted probability vector minus the one-hot label, so each class's weight gradient is that error times the input.`,
num: String.raw`W rows (0.5, 0.25), (1, 0.5), (−0.5, 0.5), b = 0, true class 0. z = (1, 2, 0.5), p = (<b>0.2312, 0.6285, 0.1402</b>), loss 1.4644. dℓ/dp₀ = −4.3248. dℓ/dz = (<b>−0.7688, 0.6285, 0.1402</b>), sum 0. Weight gradient rows (−0.7688, −1.5376), (0.6285, 1.2571), (0.1402, 0.2805). PyTorch prints the same.`,
r(fig, ctl) {
  const x = [1, 2], W = [[0.5, 0.25], [1, 0.5], [-0.5, 0.5]], y = 0, z = W.map(w => dot(w, x)), p = sm(z), L = -Math.log(p[y]), e = p.map((v, c) => v - (c === y ? 1 : 0));
  const Jm = p.map((pc, c) => p.map((pk, k) => pc * ((c === k ? 1 : 0) - pk)));
  const G = (a, o) => ML.grid(a, Object.assign({ cell: 58, dec: 4, colLab: false, rowLab: false }, o)).s;
  const steps = [
    ["Forward: z = Wx + b with x = (1, 2)", () => G(W, { x: 40, y: 50, title: "W, one row per class" }) + G(z.map(v => [v]), { x: 300, y: 50, title: "z" , hl: new Set(["0,0", "1,0", "2,0"]) }) + tx(240, 110, "× (1, 2)ᵀ =", "middle", "t")],
    ["Forward: p = softmax(z)", () => G(z.map(v => [v]), { x: 80, y: 50, title: "z" }) + tx(200, 110, "softmax →", "middle", "t") + G(p.map(v => [v]), { x: 260, y: 50, title: "p", hl: new Set(["0,0"]) }) + tx(400, 110, "true class 0", null, "th")],
    ["Forward: loss = −log p₀ = " + f(L, 4), () => G(p.map(v => [v]), { x: 80, y: 50, title: "p", hl: new Set(["0,0"]) }) + tx(220, 70, "ℓ = −log 0.2312 = " + f(L, 4), null, "th")],
    ["Backward through the loss: only the true class", () => G([[-1 / p[0]], [0], [0]], { x: 80, y: 50, title: "dℓ/dp", hl2: new Set(["0,0"]) }) + tx(220, 70, "dℓ/dp₀ = −1/p₀ = " + mn(f(-1 / p[0], 4)), null, "th") + tx(220, 94, "the other probabilities do not appear in the loss")],
    ["Backward through softmax: the Jacobian diag(p) − ppᵀ", () => G(Jm, { x: 60, y: 50, title: "dp/dz, row c, column k" }) + tx(270, 220, "every output depends on every logit", null, "t")],
    ["Multiply: dℓ/dz = (dℓ/dp) times the Jacobian = p − y", () => G(p.map(v => [v]), { x: 40, y: 50, title: "p" }) + tx(130, 110, "−", "middle", "th") + G([[1], [0], [0]], { x: 160, y: 50, title: "y" }) + tx(250, 110, "=", "middle", "th") + G(e.map(v => [v]), { x: 280, y: 50, title: "p − y", hl2: new Set(["0,0"]), hl: new Set(["1,0", "2,0"]) }) + tx(380, 80, "sum = " + f(Math.abs(e.reduce((a, b) => a + b, 0)), 4), null, "th") + tx(380, 104, "true class negative: its score goes up") + tx(380, 124, "others positive: their scores go down")],
    ["Weights: (p − y)xᵀ, bias: p − y", () => G(e.map(v => [v * x[0], v * x[1]]), { x: 60, y: 50, title: "dℓ/dW = (p − y) xᵀ" }) + G(e.map(v => [v]), { x: 300, y: 50, title: "dℓ/db" })],
    ["Autograd agrees", () => "", true]
  ];
  const draw = k => {
    const [t, g, code] = steps[k];
    fig.innerHTML = svg(code ? 40 : 240, tx(20, 24, t, null, "th") + g()) + (code ? ML.code(["x = torch.tensor([1., 2.])", "W = torch.tensor([[0.5, 0.25], [1., 0.5], [-0.5, 0.5]], requires_grad=True)", "b = torch.zeros(3, requires_grad=True)", "z = W @ x + b", "loss = F.cross_entropy(z.unsqueeze(0), torch.tensor([0]))", "loss.backward()", "print(torch.softmax(z, 0), round(loss.item(), 4))", "print(W.grad)", "print(b.grad, b.grad.sum())"], 5) + ML.term(["tensor([0.2312, 0.6285, 0.1402]) 1.4644", "tensor([[-0.7688, -1.5376],", "        [ 0.6285,  1.2571],", "        [ 0.1402,  0.2805]])", "tensor([-0.7688,  0.6285,  0.1402]) tensor(-0.)"]) : "");
  };
  ML.stepper(ctl, steps.length, draw, ["z", "p", "loss", "dℓ/dp", "Jacobian", "p − y", "weights", "autograd"]);
}},

{s: "7. Log-sum-exp", t: "Stable softmax: subtract the maximum, then use log-sum-exp",
intu: String.raw`In float32 the largest number is about 3.4e38, so exp(z) overflows to inf once z passes 88.72, and exp(z) underflows to 0 below about −104. Feed (1000, 999, 998) to the textbook formula and every exponential is inf, inf/inf is nan. Feed (−1000, −1001, −1002) and every exponential is 0, and 0/0 is nan. Card 3 gives the fix for free: subtract the largest logit first. Then the largest exponential is exactly 1, nothing overflows, and the probabilities are unchanged. For the loss, never take the log of a probability that has rounded to 0. Use \(\ell = \mathrm{logsumexp}(\mathbf{z}) - z_y\) with the maximum pulled out, which is what \(\texttt{log\_softmax}\) and CrossEntropyLoss do. Ng's lab calls this \(\texttt{from\_logits=True}\).`,
eq: String.raw`\[ \mathrm{softmax}(\mathbf{z}) = \mathrm{softmax}(\mathbf{z} - M), \quad M = \max_j z_j \]
\[ \mathrm{logsumexp}(\mathbf{z}) = M + \log\sum_j e^{z_j - M}, \quad \ell = \mathrm{logsumexp}(\mathbf{z}) - z_y \]`,
sym: [[String.raw`\(M\)`, "the largest logit, subtracted first"], ["overflow", "exp(z) above 3.4e38 becomes inf in float32, at z near 88.72"], ["underflow", "a tiny probability rounds to exactly 0"], [String.raw`\(\texttt{log\_softmax}\)`, "z − logsumexp(z), finite for any z"], [String.raw`\(\texttt{from\_logits}\)`, "Ng's name for passing raw logits to the loss"]],
how: ["Find the largest logit M.", "Subtract it from every logit, so the largest becomes 0.", "Exponentiate and sum, nothing exceeds 1.", "Take the log of the sum and add M back for log-sum-exp.", "Loss = log-sum-exp minus the true logit, never −log of a rounded probability."],
say: String.raw`Softmax and cross-entropy are computed stably by subtracting the maximum logit and using log-sum-exp, so the loss is formed from logits without ever exponentiating a large number or taking the log of zero.`,
num: String.raw`(1000, 999, 998), true class 2: naive softmax <b>nan</b>, stable softmax (0.6652, 0.2447, 0.0900), log-sum-exp 1000.4076, loss <b>2.4076</b>. (88, 89, 90): exp(88) = 1.652e38 survives, exp(89) is inf. (0, −200), true class 1: softmax rounds to (1, 0), −log p is inf with a nan gradient, <code>cross_entropy</code> gives <b>200</b> with gradient (1, −1).`,
note: String.raw`This is the multiclass version of Lesson 29's BCEWithLogitsLoss. HW10 A1 tests logits of size 1000 and asks why log(softmax(z)) is avoided when a combined operation exists.`,
r(fig, ctl) {
  const NM = { a: "(2, 1, −1)", b: "(1000, 999, 998)", c: "(−1000, −1001, −1002)", d: "(88, 89, 90)", e: "(0, −200)" };
  ctl.innerHTML = btns(Object.entries(NM).map(([k, v]) => [k, v]), "smst") + `<div id="smsto"></div>`;
  let k = "b";
  const u = () => {
    pick(ctl, "smst", k); const T = STAB[k], z = T.z, M = Math.max(...z), d = z.map(v => v - M), e = d.map(Math.exp), S = e.reduce((a, b) => a + b, 0);
    let s = tx(20, 24, "logits " + NM[k] + ", true class " + T.y, null, "th");
    const rows = [["subtract the max M = " + mn(M), mn(vec(d, 0))], ["exponentiate, largest is 1", vec(e, 4).replace(/0\.0000/g, "≈0")], ["sum", f(S, 4)], ["log-sum-exp = M + log(sum)", mn(f(M + Math.log(S), 4))], ["loss = logsumexp − z_y", f(M + Math.log(S) - z[T.y], 4)]];
    rows.forEach(([a1, b1], i) => { s += `<g class="c-teal"><rect x="20" y="${40 + i * 34}" width="250" height="28" rx="6" stroke-width="0.8"/></g>` + tx(30, 59 + i * 34, a1) + tx(282, 59 + i * 34, b1, null, "t"); });
    s += tx(20, 228, "stable route, float64 here, float32 in PyTorch gives the same digits", null, "ts");
    fig.innerHTML = svg(240, s) + TB(["route in float32", "result"], [["torch.exp(z)", T.ex], ["exp(z) / exp(z).sum(), naive softmax", T.nv], ["torch.softmax(z), subtracts the max", T.ts], ["−torch.log(torch.softmax(z))[y], loss", T.nl], ["its gradient dℓ/dz", T.ng], ["F.cross_entropy(z, y), log-sum-exp", T.ce], ["its gradient dℓ/dz", T.cg]].map(([a1, b1]) => [`<code>${ML.esc(a1)}</code>`, `<span style="font-family:var(--mono)${/nan|inf/.test(b1) ? ";color:var(--coral)" : ""}">${b1}</span>`]));
    $("smsto").innerHTML = RO([["float32 overflow edge", "exp(88.72) ≈ 3.4e38"], ["naive softmax", T.nv], ["cross_entropy", T.ce]]);
  };
  ctl.querySelectorAll("button[data-smst]").forEach(b => b.onclick = () => { k = b.dataset.smst; u(); });
  u();
}},

{s: "8. Training", t: "Softmax regression by gradient descent, with straight borders",
intu: String.raw`Card 1's ninety points, now trained with softmax regression from zeros. At the start every class has probability 1/3 and the loss is log 3 = 1.0986. Each step moves class c's weights by α times the mean of \((p_c - y_c)\mathbf{x}\). Drag the iteration slider. The regions settle within a few dozen steps and the loss bends toward its minimum. The border between two classes is where their scores tie, \((\mathbf{w}_a - \mathbf{w}_b)^T\mathbf{x} + (b_a - b_b) = 0\), a straight line, even though softmax itself is curved: HW9 2C asks why. Then zoom out. Far from every training point the scores keep growing linearly and the model reports probabilities like 0.9966 or 1.0000 where it has seen no data at all. Confidence is not evidence.`,
eq: String.raw`\[ \mathbf{w}_c \leftarrow \mathbf{w}_c - \frac{\alpha}{m}\sum_i (p_{ic} - y_{ic})\,\mathbf{x}_i \]
\[ \text{border } a|b: \ (\mathbf{w}_a - \mathbf{w}_b)^T\mathbf{x} + (b_a - b_b) = 0 \]`,
sym: [[String.raw`\(\mathbf{w}_c, b_c\)`, "the score parameters of class c"], [String.raw`\(y_{ic}\)`, "1 if example i is in class c, else 0"], ["J at zero", "log 3 = 1.0986 for three classes"], ["border", "where the two highest scores tie, a line"], ["extrapolation", "probabilities far from the data, not supported by any example"]],
how: ["Start every weight and bias at zero.", "Each step: probabilities for all examples, P − Y, then the averaged gradient.", "Update all class weights at the same time.", "Record J and stop when it flattens.", "Predict with the largest score and check accuracy against the majority baseline."],
say: String.raw`Softmax regression trained by gradient descent minimizes the convex mean cross-entropy, and its decision regions are separated by straight lines where pairs of class scores are equal.`,
num: String.raw`J₀ = <b>1.0986</b>. At α = 0.5: J₁ = 0.7504, J₁₀ = 0.3001, J₃₀₀ = <b>0.1570</b>, training accuracy <b>84 of 90</b>, confusion rows (27, 1, 2), (0, 29, 1), (1, 1, 28). Border between classes 0 and 1: −5.493x₁ − 0.228x₂ + 0.905 = 0. At (1.5, −0.8) class 1 gets 0.9966, at (10, −10) it gets 1.0000.`,
r(fig, ctl) {
  const F = D8.map(r => [r[0], r[1]]), Y = D8.map(r => r[2]), cache = {};
  ctl.innerHTML = btns([[0.1, "α = 0.1"], [0.5, "α = 0.5"], [2, "α = 2"]], "smal") + btns([[0, "data view"], [1, "zoom out to ±12"]], "smzm") + sl("smit", "iteration", 0, 300, 1, 300) + `<div id="smgo"></div>`;
  let al = 0.5, zm = 0;
  const u = () => {
    pick(ctl, "smal", al); pick(ctl, "smzm", zm); const k = +$("smit").value; $("smitv").textContent = k;
    const R = cache[al] || (cache[al] = fitSm(F, Y, 3, al, 300, true)), [W, b] = R.P[k];
    const zs = (x, y) => W.map((w, c) => w[0] * x + w[1] * y + b[c]);
    const L = zm ? 12 : 4, box = { xmin: -L, xmax: L, ymin: -L, ymax: L, nx: zm ? 6 : 8, ny: zm ? 6 : 8, fx: v => mn(v), fy: v => mn(v), xl: "x₁", yl: "x₂", grid: false };
    const a = ML.axes(50, 12, 280, 280, box);
    let s = shadeK((x, y) => { const p = sm(zs(x, y)), c = p.indexOf(Math.max(...p)); return [CC[c], k ? 0.06 + 0.32 * (p[c] - 1 / 3) * 1.5 : 0.05]; }, a, box, 44) + a.s;
    if (k) [0, 1, 2].forEach(c => { s += zeroSet((x, y) => { const z = zs(x, y); return z[c] - Math.max(...z.filter((_, j) => j !== c)); }, a, box, 70, "var(--t)", 2); });
    if (zm) s += `<rect x="${a.X(-4)}" y="${a.Y(4)}" width="${a.X(4) - a.X(-4)}" height="${a.Y(-4) - a.Y(4)}" fill="none" stroke="var(--t)" stroke-dasharray="4 3"/>`;
    D8.forEach(r => { s += mk(a, r[0], r[1], r[2], zm ? 2.6 : 4.5); });
    const c2 = ML.axes(410, 14, 240, 170, { xmin: 0, xmax: Math.sqrt(300), ymin: 0, ymax: 1.2, nx: 4, ny: 4, fx: v => Math.round(v * v), fy: v => v.toFixed(1), xl: "iteration, square-root scale", yl: "J", grid: false });
    s += c2.s + ML.path(R.H.map((h, i) => [c2.X(Math.sqrt(i)), c2.Y(Math.min(1.2, h))]), C.teal, 1.8) + `<circle cx="${c2.X(Math.sqrt(k))}" cy="${c2.Y(Math.min(1.2, R.H[k]))}" r="5" fill="${C.coral}"/>`;
    s += legend3(418, 240) + tx(410, 274, zm ? "dashed square: where the data live" : "black lines: where two top scores tie");
    let acc = 0; D8.forEach(r => { const z = zs(r[0], r[1]); if (z.indexOf(Math.max(...z)) === r[2]) acc++; });
    fig.innerHTML = svg(330, s);
    const far = sm(zs(10, -10));
    $("smgo").innerHTML = RO([["J", f(R.H[k], 4)], ["training accuracy", `${acc} of 90`], ["b", vec(b, 3)], ["p at (10, −10)", vec(far, 4)]]);
  };
  ctl.querySelectorAll("button[data-smal]").forEach(bt => bt.onclick = () => { al = +bt.dataset.smal; u(); });
  ctl.querySelectorAll("button[data-smzm]").forEach(bt => bt.onclick = () => { zm = +bt.dataset.smzm; u(); });
  $("smit").oninput = u; u();
}},

{s: "9. Ten digits", t: "Ten classes: inside a softmax model of handwritten digits",
intu: String.raw`HW9 Problem 4 classifies 28 by 28 MNIST digits with ten logits. Here is the same idea on the 8 by 8 digits bundled with scikit-learn, small enough to show every weight. Each class has 64 weights, one per pixel, and its score is the dot product of the image with that weight image plus a bias. Drawn as pictures, the weights look like blurred templates: coral where ink raises that digit's score, blue where ink lowers it. Pick an image. The bars show the ten probabilities computed live from the weights. Six of the buttons are mistakes. Look at the 3 the model calls 8 with 0.46 against 0.42: two templates match almost equally well, and the probabilities say so honestly.`,
eq: String.raw`\[ z_c = \sum_{j=1}^{64} W_{jc}\,x_j + b_c, \qquad \mathbf{p} = \mathrm{softmax}(\mathbf{z}) \in \mathbb{R}^{10} \]
\[ \text{parameters} = 64 \times 10 + 10 = 650 \]`,
sym: [[String.raw`\(x_j\)`, "pixel j, ink from 0 to 16 divided by 16"], [String.raw`\(W_{jc}\)`, "weight of pixel j for digit c"], ["template", "the 64 weights of one class drawn as an 8 by 8 image"], ["MNIST version", "784 × 10 + 10 = 7,850 parameters, HW9 4B"], ["not MNIST", "scikit-learn's 1,797 digits, 8 by 8, as in HW8's offline route"]],
how: ["Flatten each image to a vector of pixels.", "Score every class with its own weights and bias.", "Apply softmax over the ten scores.", "Predict the largest, report its probability.", "Inspect the mistakes, where two scores are close."],
say: String.raw`A softmax classifier over images gives each class a weight vector the size of the image, so each class score is a template match, and the ten scores become ten probabilities.`,
num: String.raw`1,437 training and 360 test images. Test accuracy <b>347 of 360 = 0.964</b>, test loss 0.1553, 650 parameters. Most frequent mistakes: 3 read as 8 and 9 read as 8, three times each. The 5 called 9 gets 0.474 against 0.460.`,
note: String.raw`HW9 4C found the linear model at 0.883 validation accuracy on MNIST and the 128-unit MLP at 0.920, with 7,850 against 101,770 parameters. The hidden layer of Lesson 32 replaces fixed templates with learned features.`,
r(fig, ctl) {
  const W = DG.W, b = DG.b, N = DG.imgs.length;
  const score = img => Array.from({ length: 10 }, (_, c) => img.reduce((s, v, j) => s + v / 16 * W[j][c], 0) + b[c]);
  const pred = DG.imgs.map(im => { const z = score(im); return z.indexOf(Math.max(...z)); });
  ctl.innerHTML = `<div class="row">${DG.imgs.map((_, i) => `<button data-smdg="${i}">${DG.lab[i]}${pred[i] !== DG.lab[i] ? " → " + pred[i] : ""}</button>`).join("")}</div>` + btns([[0, "show probabilities"], [1, "show logits"]], "smdv") + `<div id="smdgo"></div>`;
  let k = 10, v = 0;
  const WM = Math.max(...W.flat().map(Math.abs));
  const u = () => {
    pick(ctl, "smdg", k); pick(ctl, "smdv", v);
    const img = DG.imgs[k], z = score(img), p = sm(z), pr = p.indexOf(Math.max(...p)), y = DG.lab[k];
    let s = tx(20, 20, `test image, true ${y}`, null, "th");
    img.forEach((q, j) => { s += `<rect x="${20 + (j % 8) * 14}" y="${30 + Math.floor(j / 8) * 14}" width="13" height="13" fill="var(--t)" opacity="${(q / 16).toFixed(2)}"/>`; });
    s += `<rect x="20" y="30" width="112" height="112" fill="none" stroke="var(--line)"/>`;
    if (v === 0) s += bars(p, { x: 160, y: 30, w: 500, h: 110, cols: p.map((_, c) => c === pr ? (pr === y ? C.teal : C.coral) : C.gray), hi: y, fmt: q => q < 0.005 ? "" : f(q, 2) });
    else { const zM = Math.max(...z.map(Math.abs)), base = 85; s += `<line x1="160" y1="${base}" x2="660" y2="${base}" stroke="var(--p)"/>`; z.forEach((q, c) => { const hh = q / zM * 52, x = 160 + c * 50 + 9; s += `<rect x="${x}" y="${Math.min(base, base - hh)}" width="32" height="${Math.abs(hh)}" rx="3" fill="${c === pr ? C.teal : C.gray}" opacity="${c === y ? 0.95 : 0.55}"/>` + tx(x + 16, q >= 0 ? base - hh - 5 : base - hh + 13, mn(f(q, 1)), "middle") + tx(x + 16, 157, c, "middle", c === y ? "th" : "ts"); }); }
    s += tx(160, 178, "the ten weight templates (coral raises the score, blue lowers it)", null, "th");
    for (let c = 0; c < 10; c++) {
      const x0 = 22 + c * 64, y0 = 188;
      for (let j = 0; j < 64; j++) { const w = W[j][c]; s += `<rect x="${x0 + (j % 8) * 7}" y="${y0 + Math.floor(j / 8) * 7}" width="6.6" height="6.6" fill="${w >= 0 ? C.coral : C.blue}" opacity="${Math.min(1, Math.abs(w) / WM * 1.6).toFixed(2)}"/>`; }
      s += `<rect x="${x0 - 2}" y="${y0 - 2}" width="60" height="60" rx="4" fill="none" stroke="${c === pr ? (pr === y ? C.teal : C.coral) : c === y ? "var(--t)" : "var(--line)"}" stroke-width="${c === pr || c === y ? 2 : 0.8}"/>` + tx(x0 + 28, y0 + 74, c, "middle", c === y || c === pr ? "th" : "ts");
    }
    fig.innerHTML = svg(280, s);
    $("smdgo").innerHTML = RO([["predicted", `${pr} with p = ${f(p[pr], 3)}`], ["true class", `${y} with p = ${f(p[y], 3)}`], ["logit of the true class", f(z[y], 3)], ["test set", "347 of 360 right"]]);
  };
  ctl.querySelectorAll("button[data-smdg]").forEach(bt => bt.onclick = () => { k = +bt.dataset.smdg; u(); });
  ctl.querySelectorAll("button[data-smdv]").forEach(bt => bt.onclick = () => { v = +bt.dataset.smdv; u(); });
  u();
}},

{s: "10. Multi-label", t: "Multi-class or multi-label: one softmax or one sigmoid per label",
intu: String.raw`The last video of Ng's multiclass section. A digit is exactly one of ten classes, so its probabilities should compete and sum to 1: softmax. A street photo can contain a person and a car and a bicycle at once. That is multi-label: each tag is its own yes or no question, so each gets its own sigmoid, and the probabilities do not sum to anything in particular. Same four logits, two readings. Softmax over (2.0, 1.2, −1.5, −0.4) gives the person 0.64 and the car only 0.29, because they compete, and argmax keeps one tag. Four sigmoids give 0.88 and 0.77, and a 0.5 threshold per tag keeps both. Click tags to change the true labels. Multi-label training uses BCEWithLogitsLoss on a float multi-hot target.`,
eq: String.raw`\[ \text{multi-class: } \mathbf{p} = \mathrm{softmax}(\mathbf{z}), \ \textstyle\sum_c p_c = 1, \ \ell = -\log p_y \]
\[ \text{multi-label: } p_k = \sigma(z_k), \ \ell = \frac{1}{K}\sum_k \ell_{\text{BCE}}(z_k, t_k) \]`,
sym: [["multi-class", "exactly one true class per example"], ["multi-label", "any number of true tags per example"], [String.raw`\(t_k\)`, "multi-hot target, 1 for each true tag"], [String.raw`\(K\)`, "number of tags, one output each"], ["threshold", "per tag in multi-label, argmax in multi-class"]],
how: ["Ask whether one example can have several true labels.", "If exactly one: C outputs, CrossEntropyLoss, integer class targets.", "If several: K outputs, BCEWithLogitsLoss, float multi-hot targets.", "Report softmax probabilities or per-tag sigmoids to match.", "Decide with argmax or with a threshold per tag."],
say: String.raw`Multi-class classification uses one softmax whose probabilities compete and sum to one, while multi-label classification treats each label as an independent binary problem with its own sigmoid and binary cross-entropy.`,
num: String.raw`Logits (2.0, 1.2, −1.5, −0.4) for person, car, dog, bicycle. Softmax (<b>0.6368, 0.2862</b>, 0.0192, 0.0578), sum 1. Sigmoids (<b>0.8808, 0.7685</b>, 0.1824, 0.4013), sum 2.23. Target (1, 1, 0, 0): BCEWithLogitsLoss per tag 0.1269, 0.2633, 0.2014, 0.5130, mean <b>0.2762</b>.`,
note: String.raw`The final practice exams ask for this choice: softmax for multi-class, sigmoid for multi-label. HW10 A0 says it in one line: do not force multi-label probabilities to sum to one.`,
r(fig, ctl) {
  const TG = ["person", "car", "dog", "bicycle"];
  ctl.innerHTML = btns([[0, "multi-label: a sigmoid per tag"], [1, "multi-class: one softmax"]], "smml") + TG.map((t, i) => sl("sml" + i, t + " logit", -4, 4, 0.1, [2, 1.2, -1.5, -0.4][i])).join("") + `<div class="row">${TG.map((t, i) => `<button data-smtg="${i}">${t}</button>`).join("")}<span class="v" style="min-width:0">true tags</span></div><div id="smmlo"></div>`;
  let md = 0; const tgt = [1, 1, 0, 0];
  const u = () => {
    pick(ctl, "smml", md); ctl.querySelectorAll("button[data-smtg]").forEach(b => b.classList.toggle("on", !!tgt[+b.dataset.smtg]));
    const z = TG.map((_, i) => +$("sml" + i).value); z.forEach((v, i) => $("sml" + i + "v").textContent = f(v, 1));
    const ps = z.map(sig), pm = sm(z), p = md ? pm : ps, top = pm.indexOf(Math.max(...pm));
    const kept = md ? [top] : ps.map((v, i) => v >= 0.5 ? i : -1).filter(i => i >= 0);
    let s = tx(40, 22, md ? "softmax: the four probabilities compete, sum " + f(pm.reduce((a, b) => a + b, 0), 2) : "sigmoids: four independent yes or no answers, sum " + f(ps.reduce((a, b) => a + b, 0), 2), null, "th");
    s += bars(p, { x: 40, y: 40, w: 420, h: 180, cols: TG.map((_, i) => kept.includes(i) ? C.teal : C.gray), labs: TG });
    if (!md) s += `<line x1="40" y1="${40 + 90}" x2="460" y2="${40 + 90}" stroke="${C.coral}" stroke-dasharray="5 4"/>` + tx(462, 134, "0.5");
    s += tx(490, 60, "prediction", null, "th") + tx(490, 82, kept.map(i => TG[i]).join(" and ") || "no tag", null, "t") + tx(490, 116, "true tags", null, "th") + tx(490, 138, TG.filter((_, i) => tgt[i]).join(" and ") || "none", null, "t");
    const bce = z.reduce((s2, v, i) => s2 + bceZ(v, tgt[i]), 0) / 4, nT = tgt.reduce((a, b) => a + b, 0);
    s += tx(490, 172, md ? "softmax can keep one tag" : "per-tag threshold", null, "ts") + tx(490, 190, md ? "even when several are true" : "keeps any number of tags");
    fig.innerHTML = svg(260, s);
    $("smmlo").innerHTML = RO([["BCEWithLogitsLoss, mean over tags", f(bce, 4)], ["CrossEntropyLoss", nT === 1 ? f(lse(z) - z[tgt.indexOf(1)], 4) : "needs exactly one true class"], ["sigmoids", vec(ps, 4)], ["softmax", vec(pm, 4)]]);
  };
  ctl.querySelectorAll("button[data-smml]").forEach(b => b.onclick = () => { md = +b.dataset.smml; u(); });
  ctl.querySelectorAll("button[data-smtg]").forEach(b => b.onclick = () => { const i = +b.dataset.smtg; tgt[i] = 1 - tgt[i]; u(); });
  TG.forEach((_, i) => $("sml" + i).oninput = u); u();
}},

{s: "11. Choosing the loss", t: "Choosing the output layer and the loss for a task",
intu: String.raw`The exam asks it every time: MSELoss, BCEWithLogitsLoss or CrossEntropyLoss? Three questions decide. Is the target a number? Then a linear output and MSELoss. Is it exactly one of C classes? Then C raw logits and CrossEntropyLoss with integer targets, softmax only for reporting. Can several labels be true? Then one logit per label and BCEWithLogitsLoss with float targets. Two classes sit on the border: one logit with BCEWithLogitsLoss or two logits with CrossEntropyLoss are the same model, card 3. And a model that already outputs <code>log_softmax</code> pairs with NLLLoss, HW10's table. Pick a task and follow the path.`,
eq: String.raw`\[ \text{number} \to \texttt{MSELoss}, \quad \text{one of } C \to \texttt{CrossEntropyLoss} \]
\[ \text{independent yes or no} \to \texttt{BCEWithLogitsLoss} \]`,
sym: [["output layer", "nn.Linear(features, outputs) with no activation in training"], ["target dtype", "float for MSE and BCE, long class indices for cross-entropy"], ["target shape", "same as the output for MSE and BCE, (B,) for cross-entropy"], ["reporting", "softmax or sigmoid applied after the loss, for probabilities"], [String.raw`\(\texttt{NLLLoss}\)`, "expects log-probabilities, pair it with <code>log_softmax</code>"]],
how: ["Write down what one target looks like.", "Number: MSELoss on a linear output.", "Exactly one class: CrossEntropyLoss on C logits.", "Any number of labels: BCEWithLogitsLoss on K logits.", "Write the target dtype and shape next to the loss before coding."],
say: String.raw`Regression targets use a linear output with MSELoss, single-label multi-class targets use C raw logits with CrossEntropyLoss and integer targets, and binary or multi-label targets use one raw logit per label with BCEWithLogitsLoss and float targets.`,
num: String.raw`A house price: 1 output, float (B, 1). Defect or not: 1 output, float (B, 1). A digit: <b>10</b> outputs, long (B,). Photo tags from a list of 20: <b>20</b> outputs, float (B, 20). Temperature and humidity: 2 outputs, MSELoss, float (B, 2).`,
r(fig, ctl) {
  const T = {
    price: ["House price in dollars", 0, ["1", "none", "MSELoss", "float32 (B, 1)", "the number itself"]],
    th: ["Temperature and humidity", 0, ["2", "none", "MSELoss", "float32 (B, 2)", "two numbers"]],
    def: ["Part defective or not", 2, ["1", "sigmoid", "BCEWithLogitsLoss", "float32 (B, 1), 0 or 1", "p ≥ τ, Lesson 29"]],
    dig: ["Which digit, 0 to 9", 1, ["10", "softmax", "CrossEntropyLoss", "int64 (B,), 0 to 9", "argmax"]],
    sent: ["Review: negative, neutral, positive", 1, ["3", "softmax", "CrossEntropyLoss", "int64 (B,), 0 to 2", "argmax"]],
    tags: ["Photo tags from a list of 20", 2, ["20", "sigmoid per tag", "BCEWithLogitsLoss", "float32 (B, 20), multi-hot", "threshold per tag"]],
    nll: ["Model ends in log_softmax", 1, ["C", "exp for probabilities", "NLLLoss", "int64 (B,)", "argmax"]]
  };
  ctl.innerHTML = btns(Object.entries(T).map(([k, v]) => [k, v[0]]), "smch") + `<div id="smcho"></div>`;
  let k = "dig";
  const u = () => {
    pick(ctl, "smch", k); const [name, leaf, row] = T[k];
    const on = (i) => leaf === i;
    const box = (x, y, w, h, lines, act) => `<g class="${act ? "c-teal" : "c-gray"}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" stroke-width="${act ? 1.6 : 0.6}"/></g>` + lines.map((t, i) => tx(x + w / 2, y + 20 + i * 17, t, "middle", i ? "ts" : "th")).join("");
    let s = box(240, 10, 200, 40, ["What is one target?"], true);
    const L = [[30, "a number", ["MSELoss", "linear output"]], [250, "exactly one of C", ["CrossEntropyLoss", "C logits, long targets"]], [470, "yes or no, per label", ["BCEWithLogitsLoss", "one logit per label"]]];
    L.forEach(([x, q, lab], i) => { if (i === 1 && k === "nll") lab = ["NLLLoss", "after log_softmax"]; s += arrow(340, 52, x + 90, 94, on(i) ? C.teal : "var(--line)", on(i) ? 2 : 1) + tx([120, 348, 562][i], 78, q, i === 1 ? "start" : "middle", on(i) ? "th" : "ts") + box(x, 98, 180, 52, lab, on(i)); });
    s += tx(340, 176, name, "middle", "th");
    fig.innerHTML = svg(190, s) + TB(["outputs", "activation for reporting", "loss", "target", "decision"], [row]);
    $("smcho").innerHTML = RO([["task", name], ["loss", row[2]], ["target", row[3]]]);
  };
  ctl.querySelectorAll("button[data-smch]").forEach(b => b.onclick = () => { k = b.dataset.smch; u(); });
  u();
}},

{s: "12. In PyTorch", t: "The multiclass contract in PyTorch: (B, C) logits, (B,) long targets",
intu: String.raw`HW9's contract for a multiclass task: features (B, d) float32, the model is one nn.Linear(d, C) returning raw logits (B, C), the targets are class indices of shape (B,) and dtype long, and the loss is CrossEntropyLoss, which applies <code>log_softmax</code> inside. Pick a case. Three mistakes raise an error, the other three run silently with a wrong number. A softmax before the loss is applied twice and gives 0.8527 instead of 0.5145. NLLLoss on raw logits returns a negative loss. A softmax over the batch dimension makes columns, not rows, sum to 1. Float one-hot targets are allowed: CrossEntropyLoss reads them as class probabilities and gives the same 0.5145.`,
eq: String.raw`\[ \text{logits } (B, C) \text{ float32} \ \longleftrightarrow \ \text{target } (B,) \text{ int64 in } 0, \dots, C - 1 \]`,
sym: [["nn.Linear(d, C)", "the whole softmax regression, dC weights and C biases"], ["raw logits", "no softmax inside the model"], ["target", "long class indices, shape (B,)"], ["dim=1", "the class dimension of a (B, C) tensor"], ["argmax(1)", "the same class from logits or from probabilities"]],
how: ["Define the model as one nn.Linear(d, C), no softmax.", "Build long targets of shape (B,) with reshape(-1).", "Pass raw logits and targets to CrossEntropyLoss.", "Take softmax(dim=1) only to report probabilities.", "Predict with logits.argmax(dim=1)."],
say: String.raw`A multiclass classifier in PyTorch returns raw logits of shape (B, C), takes integer class targets of shape (B,), and is trained with CrossEntropyLoss, which combines <code>log_softmax</code> and the negative log-likelihood.`,
num: String.raw`Weights (1, −1), (0.5, 0.5), (−1, 1), biases (0, 0.2, −0.2), four rows, targets (0, 2, 1, 2): loss <b>0.5145</b>, accuracy 4 of 4, bias gradient (−0.0349, 0.1699, −0.1351), sum 0. Softmax first: <b>0.8527</b>. NLLLoss on logits: <b>−1.075</b>.`,
note: String.raw`HW10 A1 asks why CrossEntropyLoss(softmax(z), y) is the wrong interface. The loss applies log_softmax itself, so it sees softmax(softmax(z)), squeezed toward uniform, and its gradients shrink: the logit gradient norm here is 0.1349 against 0.2655.`,
r(fig, ctl) {
  const head = ["model = nn.Linear(2, 3)", "# weight rows (1, -1), (0.5, 0.5), (-1, 1), bias (0, 0.2, -0.2)", "X = torch.tensor([[1., 0.], [0., 1.], [1., 1.], [-1., 0.5]])", "y = torch.tensor([0, 2, 1, 2])   # (4,) int64", "loss_fn = nn.CrossEntropyLoss()"];
  const CASES = {
    ok: ["Correct", ["logits = model(X)", "print(logits.shape, logits.dtype)", "loss = loss_fn(logits, y)", "loss.backward()", "print(round(loss.item(), 4), logits.argmax(1))", "print(model.bias.grad)"], ["torch.Size([4, 3]) torch.float32", "0.5145 tensor([0, 2, 1, 2])", "tensor([-0.0349,  0.1699, -0.1351])"], "Raw logits, long targets. The bias gradient is the mean of p − y over the rows, so it sums to zero.", 0],
    b1: ["Target (B, 1)", ["loss = loss_fn(model(X), y.reshape(-1, 1))"], ["RuntimeError: 0D or 1D target tensor expected, multi-target not", "supported"], "Class index targets must be (B,). Use reshape(-1).", 1],
    fl: ["Target float (B,)", ["loss = loss_fn(model(X), y.float())"], ["RuntimeError: expected target dtype to be Long or Byte, but got", "Float"], "Index targets are int64. The binary contract of Lesson 29 is the one with float targets.", 1],
    oob: ["Label out of range", ["loss = loss_fn(model(X), torch.tensor([0, 3, 1, 2]))"], ["IndexError: Target 3 is out of bounds."], "With C = 3 outputs the valid labels are 0, 1 and 2. Check the number of output units against the label set.", 1],
    oh: ["One-hot float targets", ["loss = loss_fn(model(X), F.one_hot(y, 3).float())", "print(round(loss.item(), 4))"], ["0.5145"], "A float (B, C) target is read as class probabilities, so a one-hot matrix gives the same loss. A long one-hot matrix raises an error.", 0],
    smx: ["Softmax before the loss", ["probs = torch.softmax(model(X), dim=1)", "loss = loss_fn(probs, y)   # log_softmax applied again inside", "print(round(loss.item(), 4))"], ["0.8527"], "No error, wrong number. Probabilities between 0 and 1 used as logits are nearly equal, so the loss is pushed toward log 3 = 1.0986.", 2],
    nll: ["NLLLoss on raw logits", ["loss = nn.NLLLoss()(model(X), y)", "print(round(loss.item(), 4))"], ["-1.075"], "NLLLoss only picks −input[y] and averages. It expects log-probabilities from log_softmax, which would give 0.5145. A negative loss is the giveaway.", 2],
    d0: ["Softmax over dim=0", ["p = torch.softmax(model(X), dim=0)", "print(p.sum(1))", "print(p.sum(0))"], ["tensor([0.9164, 0.6453, 0.7488, 0.6895])", "tensor([1.0000, 1.0000, 1.0000])"], "dim=0 normalizes over the batch, so each class column sums to 1 and the rows do not. The class dimension of (B, C) is dim=1.", 2]
  };
  ctl.innerHTML = btns(Object.entries(CASES).map(([k, v]) => [k, v[0]]), "smcs");
  let cs = "ok";
  const u = () => {
    pick(ctl, "smcs", cs); const c = CASES[cs], kind = c[4];
    let s = "";
    [["features", "(B, 2)", "float32"], ["logits", "(B, 3)", "float32"], ["target", cs === "b1" ? "(B, 1)" : cs === "oh" ? "(B, 3)" : "(B,)", cs === "fl" || cs === "oh" ? "float32" : "int64"]].forEach(([k, sh, dt], i) => {
      const bad = i === 2 && ["b1", "fl", "oob"].includes(cs);
      s += `<g class="${bad ? "c-coral" : "c-teal"}"><rect x="${30 + i * 220}" y="12" width="180" height="50" rx="8" stroke-width="1"/></g>` + tx(120 + i * 220, 32, (i === 1 ? "model → " : "") + k + " " + sh, "middle", "th") + tx(120 + i * 220, 52, dt, "middle");
      if (i < 2) s += arrow(212 + i * 220, 37, 246 + i * 220, 37, "var(--p)", 1.3, null, i === 1);
    });
    s += tx(340, 84, kind === 1 ? "PyTorch refuses: read the message" : kind === 2 ? "runs without an error and gives a wrong number" : "runs and gives the right number", "middle", kind === 2 ? "th" : "ts");
    fig.innerHTML = svg(96, s) + ML.code(head.concat(c[1]), head.length + c[1].length - 1) + ML.term(c[2]) + `<p class="note">${c[3]}</p>`;
  };
  ctl.querySelectorAll("button[data-smcs]").forEach(bt => bt.onclick = () => { cs = bt.dataset.smcs; u(); });
  u();
}},

{s: "13. With the agent", t: "Do it with the agent: softmax regression you can test",
intu: String.raw`The lesson as code: a NumPy softmax regression with a stable softmax, a cross-entropy computed from logits, the gradient (1/m)Xᵀ(P − Y), batch gradient descent, and tests that pin the numbers of these cards. A missing max subtraction, a log of a rounded probability, a softmax over the wrong axis, or a gradient without 1/m each fails a test with a value you can check by hand.`,
eq: String.raw`\[ \texttt{softmax} \to \texttt{cross\_entropy} \to \texttt{gradients} \to \texttt{fit} \to \texttt{predict} \]`,
sym: [["softmax", "subtracts the row maximum, rows sum to 1"], ["cross entropy", "mean of logsumexp(z) minus the true logit over the rows"], ["gradients", "(1/m)Xᵀ(P − Y) and the column means of P − Y"], ["fit", "batch gradient descent from zeros with a cost history"], ["tests", "cards 3, 4, 6, 7 and 8 numbers plus torch and finite differences"]],
how: ["Paste the command.", "Read softmax: does it subtract the maximum along axis 1?", "Read the loss: is it log-sum-exp minus the true logit?", "Run the tests, the expected values come from the cards.", "Commit the module with its tests."],
say: String.raw`A softmax regression module computes probabilities and loss stably from logits, has a gradient checked against finite differences and against PyTorch, and is tested against values computed by hand.`,
num: String.raw`Tests expect p = <b>(0.571429, 0.285714, 0.142857)</b> and loss <b>1.945910</b> for HW9 2A, logit gradient (−0.768776, 0.628532, 0.140244) for card 6, a finite loss <b>2.407606</b> for logits (1000, 999, 998) with class 2, and J₀ = log 3 = 1.098612 on any three-class data.`,
r(fig, ctl) {
  ML.agent(fig, ctl, {
    prompt: "Create src/softmax_reg.py using numpy only. Functions: softmax(Z) for a 2D array of logits, subtracting each row's maximum, rows summing to 1. cross_entropy(Z, y) returning the mean of logsumexp(Z[i]) - Z[i, y[i]] with the maximum pulled out of the logsumexp. gradients(X, y, W, b) for logits Z = X @ W + b with W of shape (d, C), returning ((1/m) X.T @ (P - Y), mean of P - Y over rows) where Y is one-hot. fit(X, y, C, lr, n_steps) running batch gradient descent from zeros and returning W, b and a cost history of length n_steps + 1. predict(X, W, b) returning argmax over axis 1. Create tests/test_softmax_reg.py with pytest: softmax of [[log 2, 0, -log 2]] is close to (0.571429, 0.285714, 0.142857) and its cross_entropy with class 2 is close to 1.945910. adding 10 to every logit changes neither. logits [[1000, 999, 998]] with class 2 give a finite loss close to 2.407606 and no warning. for x = (1, 2), W columns (0.5, 0.25), (1, 0.5), (-0.5, 0.5), b = 0, class 0, the logit gradient P - Y is close to (-0.768776, 0.628532, 0.140244). gradients match a central finite difference to 1e-6 on random data with C = 4. cross_entropy matches torch.nn.CrossEntropyLoss on 20 random rows to 1e-6. the first cost of fit on any 3-class data is log 3 = 1.098612. Run pytest -q and paste the output.",
    actions: ["$ pytest -q", ".......                                                  [100%]", "7 passed"],
    files: [["src/softmax_reg.py", "softmax, cross_entropy, gradients, fit, predict"], ["tests/test_softmax_reg.py", "seven tests with the values from cards 3, 4, 6, 7 and 8"]],
    checks: ["softmax subtracts the maximum of each row, along axis 1, not of the whole array", "the loss is logsumexp minus the true logit, never the log of a softmax output", "W has shape (d, C) and the gradient divides by m", "the torch comparison passes raw logits and long targets to CrossEntropyLoss", "predict takes argmax over axis 1, the class axis"]
  });
}},

{s: "14. Test", t: "Lesson 30 test: softmax and multiclass",
intu: String.raw`Twelve questions on softmax by hand, shift and temperature, cross-entropy and its uniform value, the gradient, two classes, stability, multi-label tasks, choosing the loss and the PyTorch contract. All numbers are new.`,
eq: String.raw`\[ \text{12 questions} \]`,
sym: [["pass mark", "9 of 12, then redo the missed cards"]],
how: ["Do the arithmetic on paper when a question has numbers.", "Answer without running anything.", "Reopen the named card for any miss."],
say: String.raw`Twelve questions covering the whole lesson.`,
num: String.raw`Score <b>9 or more</b> to move on to evaluating classifiers.`,
r(fig, ctl) {
  ML.quiz(fig, ctl, [
    { q: "Logits (0, log 3, 0). The softmax probabilities are", o: ["(0, 1, 0)", "(0.2, 0.6, 0.2)", "(0.25, 0.5, 0.25)", "(0.3333, 0.3333, 0.3333)"], a: 1, why: "The exponentials are 1, 3, 1 with sum 5. Card 2." },
    { q: "Logits (log 4, 0, 0) and true class 0. The cross-entropy in nats is", o: ["log 1.5 = 0.4055", "log 4 = 1.3863", "0.6667", "log 6 = 1.7918"], a: 0, why: "p₀ = 4/6 = 2/3, so the loss is −log(2/3) = log 1.5. Card 4." },
    { q: "You add 7 to every logit of a trained model. The probabilities", o: ["do not change", "all rise", "become uniform", "become one-hot"], a: 0, why: "e⁷ multiplies numerator and denominator and cancels. Only logit differences matter. Card 3." },
    { q: "You divide every logit by a temperature T = 0.5. The distribution becomes", o: ["flatter", "unchanged", "uniform", "sharper"], a: 3, why: "Dividing by 0.5 doubles every difference between logits, so the largest takes more of the mass. Card 3." },
    { q: "An untrained model on a balanced 5-class problem gives every class probability 0.2. Its loss per example is", o: ["0.2", "log 0.2 = −1.6094", "5", "log 5 = 1.6094"], a: 3, why: "−log(1/5) = log 5. The accuracy is 20%. Card 5." },
    { q: "p = (0.1, 0.7, 0.2) and the true class is 2. The gradient of the loss with respect to the logits is", o: ["(0.1, 0.7, −0.8)", "(−0.1, −0.7, 0.8)", "(0, 0, −5)", "(0.1, 0.7, 0.2)"], a: 0, why: "p − y with y = (0, 0, 1). The true class gets p₂ − 1 = −0.8 and the components sum to 0. Card 6." },
    { q: "A two-class softmax has logits (z₀, z₁) = (0.5, 2.0). The probability of class 1 is", o: ["σ(2.0) = 0.8808", "σ(1.5) = 0.8176", "0.8", "σ(2.5) = 0.9241"], a: 1, why: "A two-class softmax is the sigmoid of the difference, z₁ − z₀ = 1.5. Card 3." },
    { q: "In float32, exp(z) / exp(z).sum() for logits (500, 499) returns", o: ["(0.7311, 0.2689)", "(1, 0)", "(nan, nan)", "(0.5, 0.5)"], a: 2, why: "exp(500) overflows to inf, and inf/inf is nan. Subtract the maximum first, or call torch.softmax. Card 7." },
    { q: "A model must tag each news article with any of 12 topics, several at once. The output and loss are", o: ["12 logits with CrossEntropyLoss", "1 logit with MSELoss", "12 logits with a softmax then MSELoss", "12 logits with BCEWithLogitsLoss and a float multi-hot target"], a: 3, why: "Several true labels per example is multi-label: one sigmoid per topic and binary cross-entropy. Card 10." },
    { q: "A model predicts tomorrow's electricity demand in megawatts. The loss is", o: ["CrossEntropyLoss", "BCEWithLogitsLoss", "MSELoss on one linear output", "NLLLoss"], a: 2, why: "The target is a number, so a linear output and MSELoss. Card 11." },
    { q: "Logits of shape (64, 10) and targets of shape (64, 1), dtype long, passed to CrossEntropyLoss give", o: ["the correct loss", "a (64, 10) loss", "IndexError: Target 10 is out of bounds", "RuntimeError: 0D or 1D target tensor expected, multi-target not supported"], a: 3, why: "Class index targets must have shape (B,). Use y.reshape(-1). Card 12." },
    { q: "<code>loss = nn.CrossEntropyLoss()(torch.softmax(logits, dim=1), y)</code> runs without an error. What is wrong?", o: ["Nothing, it is the recommended form", "The softmax is applied twice, so the loss is wrong and its gradients shrink", "The targets must be float", "CrossEntropyLoss needs (B, 1) inputs"], a: 1, why: "CrossEntropyLoss applies log_softmax itself. Pass raw logits. Card 12." }
  ], "Lesson 30 test");
}}
],
summary: String.raw`Softmax regression is logistic regression for C classes. Each class has its own linear score, and softmax exponentiates the C logits and divides by their sum, giving positive probabilities that sum to 1 and keep the order of the scores. One-vs-rest trains C separate binary models instead, whose outputs do not sum to 1 and whose regions leave gaps and overlaps. Adding a constant to every logit changes nothing, dividing by a temperature sharpens or flattens the distribution, a two-class softmax is the sigmoid of the logit difference, and a softmax over one output is always 1 with zero gradient. The loss is cross-entropy, minus the log of the probability given to the true class, which is the negative log-likelihood of a categorical label. A uniform model pays log C, and the loss can change while accuracy does not. The gradient with respect to the logits is p minus the one-hot label, so each class's weights move by its error times the input, and the borders between classes are straight lines where two scores tie. Computed naively, exp overflows near 89 in float32, so softmax subtracts the maximum and the loss uses log-sum-exp minus the true logit. Multi-label tasks use one sigmoid per label with BCEWithLogitsLoss instead. In PyTorch a multiclass model is nn.Linear(d, C) returning raw logits (B, C), with long targets (B,) and CrossEntropyLoss, softmax applied only for reporting.`,
sheet: [[String.raw`\[ p_c = \frac{e^{z_c}}{\sum_j e^{z_j}}, \qquad z_c = \mathbf{w}_c^T\mathbf{x} + b_c \]`, "softmax regression"], [String.raw`\[ \mathrm{softmax}(\mathbf{z} + c) = \mathrm{softmax}(\mathbf{z}), \qquad C = 2: \ p_1 = \sigma(z_1 - z_0) \]`, "shift invariance and the two-class case"], [String.raw`\[ \ell = -\log p_y = \mathrm{logsumexp}(\mathbf{z}) - z_y \]`, "cross-entropy, from probabilities or from logits"], [String.raw`\[ J_{\text{uniform}} = \log C \]`, "the loss of a model that knows nothing"], [String.raw`\[ \frac{\partial \ell}{\partial \mathbf{z}} = \mathbf{p} - \mathbf{y}, \qquad \nabla_W J = \frac{1}{m}(P - Y)^T X \]`, "the gradient"], [String.raw`\[ \mathrm{logsumexp}(\mathbf{z}) = M + \log\sum_j e^{z_j - M} \]`, "the stable form, M the largest logit"], [String.raw`\[ (\mathbf{w}_a - \mathbf{w}_b)^T\mathbf{x} + (b_a - b_b) = 0 \]`, "the straight border between classes a and b"], [String.raw`\[ \text{multi-label: } p_k = \sigma(z_k) \]`, "one sigmoid per label, BCEWithLogitsLoss"]],
sources: ["AME 5970 has no lecture notes for week 9 (softmax classification, multi-class problems), so the topic order follows the homework below", "AME 5970 HW9 Problem 2, Multiclass cross-entropy (2A to 2C), and Problem 4B, questions and solutions docs: softmax by hand and shift invariance, MulticlassLinear with 9 parameters, straight decision regions, ten MNIST logits", "AME 5970 HW10 A0 and A1 (scores, probabilities, labels and losses, the loss table, logits of size 1000) and C2 (softmax on one output), questions and solutions docs", "Andrew Ng, Machine Learning Specialization, course 2 week 2: Multiclass, Softmax, Neural network with softmax output, Improved implementation of softmax, Classification with multiple outputs", "Andrew Ng, Machine Learning (Coursera, Stanford), week 3: Multiclass classification, one-vs-all", "Goodfellow, Bengio and Courville, Deep Learning, section 6.2.2.3 (softmax units for multinoulli output distributions) and section 4.1 (overflow and underflow)", "scikit-learn, load_digits (the 8 by 8 handwritten digits used on card 9)", "PyTorch documentation: torch.nn.CrossEntropyLoss, torch.nn.NLLLoss, torch.nn.functional.log_softmax"]
});
})();

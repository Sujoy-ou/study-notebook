(function () {
/* ML shelf, Part 6, Lesson 31: Evaluating classifiers. The course has no lecture notes for this topic, so the order follows the homework: HW9 Problem 3 (error types, imbalance, ranking and threshold choice, 3A to 3D) and 4C to 4D (macro metrics, the per-class report, the frozen test), HW10 B4 (confusion counts and per-class recall) and its final gate, with their solutions docs. Andrew Ng's Machine Learning Specialization course 2 week 3 (Error metrics for skewed datasets, Trading off precision and recall) is the spine. ROC and AUC follow Fawcett (2006), cost thresholds Elkan (2001), calibration and temperature scaling Guo et al. (2017). */
const C = ML.C;
const tx = (x, y, t, a, cls) => `<text class="${cls || "ts"}" x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""}>${t}</text>`;
const f = (v, d) => (+v).toFixed(d == null ? 4 : d);
const mn = v => String(v).replace(/-/g, "−");
const RO = items => ML.readout(items.map(([k, v]) => [k, mn(v)]));
const sig = z => 1 / (1 + Math.exp(-z));
const sp = z => Math.max(z, 0) + Math.log1p(Math.exp(-Math.abs(z)));
const bceZ = (z, y) => sp(z) - y * z;
const TB = (head, rows) => `<table style="width:100%;border-collapse:collapse;font-size:13px;margin-top:6px"><tr>${head.map(h => `<th style="text-align:left;padding:4px 6px;border-bottom:1.5px solid var(--line);color:var(--muted);font-weight:600">${h}</th>`).join("")}</tr>${rows.map(r => `<tr>${r.map(c => `<td style="padding:4px 6px;border-bottom:1px solid var(--line);vertical-align:top">${c}</td>`).join("")}</tr>`).join("")}</table>`;

/* Fresh data for the whole lesson: make_classification(n_samples=2000, two informative features, weights [0.8, 0.2], flip_y 0.05, class_sep 1.0, random_state 31), stratified split 1,200 training, 400 validation, 400 test (random_state 31), standardized with training statistics, plain logistic regression (no penalty). ZV and ZT are the validation and test logits rounded to 2 decimals, YV and YT the labels (1 = defect). ZW are the validation logits of the same model trained with class weight 5 on defects. Every card computes from these arrays, and every number in the text was checked against NumPy and scikit-learn on the same rounded logits. */
const ZV = [-2.54,-3.12,1.34,-2.51,-3.12,0.39,-4.92,-3.1,-2.48,-2.42,-2.99,-5.44,-3.8,-2.17,-7.44,-0.78,-0.13,-2.52,-0.31,-5.03,-3.31,-1.07,-3.1,-2.45,-0.28,-3.96,3.44,-4.3,-3.56,-2.72,-3.71,-2.34,-3.6,-3.57,-3.01,3.55,-3.66,-2.46,2.48,-3.1,-4.7,-0.37,-1.46,-1.1,3.76,-5.27,-3.75,-4.26,-7.1,-3.09,-3.98,-4.28,-6.77,-4.95,-1.84,-2.08,-2.09,-2.54,-3.02,-2.22,-6.79,-4.35,-0.6,-1.29,-0.34,-5.32,-1.34,-4.54,-7.04,4.74,-3.59,-0.41,-0.4,-3.59,1.71,-0.83,-0.96,-1.77,-2.89,-0.08,-6.88,-1.25,-4.37,-2.67,1.7,2.14,-4.59,-4.96,1.98,-5.42,-3.68,-1.28,-3.16,0.05,-0.59,-1.33,-0.9,-1.9,0.47,0.16,-0.7,-4.5,-0.6,-6.23,-3.4,-1.17,-2.72,-2.96,-3.23,-6.89,-3.1,-0.74,-2.91,-6.26,-3.21,-1.56,-0.19,-1.16,-3.81,-4.06,-3.56,-3.36,-2.32,-3.14,-4.25,1.44,-4.86,-2.78,-3.23,1.44,1.65,-1.71,-4.16,-3.96,-4.91,-1.65,-0.97,-5.57,-3.17,-7.32,-5.08,-5.12,-7.68,-0.41,0.8,-5.82,1.24,3.43,-3.64,-5.24,-2.55,-4.16,-1.15,2.93,-1.31,0.94,-2.22,1.74,-3.93,-1.83,-5.37,4.47,-2.8,-1.29,-4.03,-1.39,-0.43,-3.41,-3.97,-3.82,-2.04,-2.44,-2.75,-2.47,-4.92,-2.14,-5.02,-2.49,-0.75,-3.77,-2.13,-3.75,-1.06,-4.61,-0.95,-1.54,-5.27,-0.23,-1.91,-4.3,-2.26,-3.19,-0.82,-4.4,-5.19,-0.13,-1.61,-0.63,-2.61,-5.42,-2.02,-0.14,0.37,-4.13,-5.07,-2.74,-1.71,-8.3,-0.54,-4.08,-0.74,-1.5,-2.54,-1.49,-2.04,-3.7,-2.98,-1.71,-3.39,-3.04,-6.93,-2.39,1.22,-5.66,-2.81,-0.85,-2.86,-1.33,-4.58,-1.19,-4.05,-3.21,-2.93,-0.17,-3.22,-4.49,0.82,-6.02,-4.64,-4.05,-4.04,-2.12,-3.55,-0.49,-0.88,-4.24,-2.57,-1.94,-3.03,-3.99,-7.26,-4.19,-2.57,-4.78,0.28,-4.27,1.37,-5.6,-5.07,-4.94,-3.85,-3.61,-4.89,1.98,1.28,-2.66,-8.31,-1.7,-1.19,-2.88,-0.62,-0.62,-3.59,-4.42,-1.56,0.45,-2.59,-1.46,-2.08,-3.64,-3.73,-4.29,-1.67,-2.18,-4.96,-0.46,-3.99,-3.19,-3.3,-4.11,-6.57,0.22,0.36,-5.27,-1.07,-1.15,-1.01,-2.29,3.67,-3.33,-4,-1.64,2.7,0.99,-1.64,0.77,-3.02,-6.71,0.94,-3.48,-5.23,-3.19,-2.92,-3.77,-4.45,0.9,-1.45,-4.05,-2.62,-2.29,-0.29,-3.17,-5.38,-7.94,-0.99,-2.94,-3.12,2.08,-4.67,1.64,-0.82,0.59,0.14,0.77,-4.5,-2.6,-2.99,-2.11,-0.99,-4.22,-4.29,-4.69,-5.23,-0.51,-4.46,-3.76,-2.48,0.32,-5.06,-3.59,-3.94,-3.75,-2.95,-0.43,-6.15,-2.37,1.1,2.08,-5.64,-2.21,-1.31,-3.23,-6.79,-3.91,1.19,-0.73,-1.92,-1.29,-4.44,-3.74,-3.52,1.96,-7.67,0.34,-3.87,-5.53,-2.32,-8.26,-3.89,-2.45,1.34,-1.99,-1.43,-5.6,2.11,-2.41,-5.01,-0.73,-4.12,-4,-3.33,-1.14,-3.28,-1.78,-3,-2.77,-0.63,-1.94,-4.33,-4.37];
const YV = "0010000000000000000000000010000100010010010010000000000000000010010001011010000101001100100000000001100001000001000010000000010001100000100000011011000001110101010100100011000000000000100100000000110001100010001001000000100001000100000010000000000000000110100000011000000000011100000001000001000000100011000010000000000100000011000010001000010100000000000011000000110000010100000010001000000100000000";
const ZT = [-7.41,-5.13,-1.39,-0.65,-3.2,-2.33,0.26,-1.32,-3.14,-1.07,-6.52,-1.95,3.88,-3.94,-4.48,1.39,0.54,-5.24,4.85,-0.06,1.24,-1.99,-4.87,3.12,-2.25,0.01,-1.71,-2.7,-2.28,-7.78,1.87,-4.48,0.46,-3.25,-4.71,-1.52,-6.63,-6.14,-3.43,-1.47,4.15,-7.57,-1.98,-4.12,-5.1,3.13,0.5,-3.76,0.52,-2.22,-5.2,-2.88,-3.04,-3.09,-2.91,-4.01,0.65,0.98,0.17,2.84,3.17,-2.18,-2.28,1.06,-1.26,-0.86,-5.38,-1.63,-4.4,-6.14,-1.99,1.22,-4.26,-1.41,-4.81,0.99,-3.13,-2.49,-3.01,-2.66,3.53,-2.88,-4.6,-0.68,-1.43,-3.39,-2.79,-3.85,-0.7,-2.79,-3.79,1.69,-2.3,-1.83,-5.39,-2.04,-4.52,-5.29,-2.38,2.69,-3.35,-2.53,-3.84,-3.02,-4.77,-1.67,3.05,0.5,-2.14,-2.07,-4.13,-1.81,-4.91,1.91,-4.02,-0.14,-0.88,-2.84,-5.43,-0.72,-1.83,-3.76,-1.44,-1.73,-4.28,-6.82,-2.64,-3.88,-2.52,-4.64,-3.35,2.15,0.34,-3.38,-1.74,-1.74,-3.97,-5.94,-2.48,-5.85,-5.21,-1.6,-0.53,-2.35,-3.04,-5.75,-4,3.6,-5.56,-1.98,2.25,-1.71,-5.06,-2.83,-2.55,-1.1,-4.53,-0.69,-4.67,-6.18,2.23,-5.39,-4.62,-3.59,-3.64,-2.6,-1.89,-3.09,0,-6,-3.9,-2.19,-5.44,-4.29,-3.55,-7.44,-1.93,-3.86,0.19,-3.07,-3.6,-3.47,-0.34,2.28,1.58,-4.65,-3.91,-2.62,0.82,-4.75,-2.93,-4.79,0.18,-0.04,-3.07,-0.88,-4.15,-6.49,-2.72,-3.45,-2.58,-3.79,-6.46,-1.99,1.9,-6.11,-1.48,-2.94,-2.66,-2.1,-2.87,-0.34,4.25,-5.77,-4.9,2.24,1.47,-4.24,-3.89,-2.42,-1.4,-2.77,-3.34,-3.73,-7.83,-6.78,-4,-1.69,-2.57,-0.92,-3.37,-1.22,-2.31,-3.9,-2.26,-2.59,-0.01,-5.57,-3.23,-4.13,-0.08,-1.1,-1.6,-0.65,-1.38,-6.82,-3.91,-4.31,-3.43,1.57,-3.27,-2.21,-4.72,-2.64,-5.44,-4.11,-0.94,-2.39,-6.68,-3.62,-4.51,-4.85,-6.83,-1.41,1.11,0.72,-4.88,-0.63,-5.54,-2.51,-2.02,-1.92,-4.62,-0.37,-1.81,-4.82,-2.53,-1.77,1.56,-1.65,-5.99,-3.51,2.33,-0.62,-3.67,-0.38,-4.42,-5.45,-3.61,-2.41,-1.18,-2.32,-4.84,-0.64,-5.54,-4.06,-0.89,-0.55,-2.14,-0.64,-0.75,-5.14,-2.62,-0.58,-2.54,-5.28,-2.38,-0.07,-0.58,0.87,-7.61,-1.79,0.32,-3.4,-0.92,2.82,-3.78,-6.97,0.29,-1.38,-4.46,-5.2,-3.01,0.88,-4.12,2.1,-4.49,-2.23,2.5,-5.68,-0.76,-2.52,-1.58,-6.62,-3.37,-0.41,-3.27,-2.59,-4.3,-1.92,3.26,-1.46,-1.36,-3.49,-6.38,-2.62,-2.88,-3.59,-0.64,-2.63,-3.83,0.8,-3.81,-3.18,-7.8,0.11,-4.98,-5.74,-4.09,-3.06,-3.94,-4.6,-0.54,-4.07,-2.28,-5.64,-3.56,-7.34,-3.71,-4.44,-6.61,-2.18,-3.91,-4.78,-2.38,-0.99,1.35,-1.55,-0.76,-1.27,-5.28,-4.44,-2.97,-6.35,-2.35,-5.31,-5.45,-4.61,-0.24,-0.63,-6.16,-1.63,-7.53,-4.56,-4.25,-2.83,-5.12,-3.81,-4.83,-4.01];
const YT = "0001001001001001001100010000001000000000100001101000000001111001110001010001000010000000100100010011000001110000010000010000000000010010001000000001001000000000100000100000000000100011100010000011000000001000010010011000101000010000000000001001000001000000000000001001000101100010001100000000000001000010010001001011000000010100100000010000100000001001000000000000000000000000110000000000100000000000";
const ZW = [-0.83,-1.35,2.69,-0.79,-1.35,1.83,-2.98,-1.33,-0.77,-0.71,-1.23,-3.45,-1.96,-0.49,-5.26,0.78,1.36,-0.81,1.19,-3.08,-1.51,0.51,-1.33,-0.74,1.23,-2.11,4.59,-2.42,-1.75,-0.99,-1.88,-0.64,-1.78,-1.75,-1.25,4.69,-1.83,-0.75,3.72,-1.33,-2.78,1.14,0.15,0.49,4.88,-3.3,-1.92,-2.38,-4.95,-1.32,-2.13,-2.39,-4.65,-3.01,-0.19,-0.41,-0.42,-0.82,-1.26,-0.54,-4.67,-2.46,0.93,0.31,1.18,-3.34,0.26,-2.64,-4.9,5.77,-1.77,1.11,1.11,-1.78,3.03,0.72,0.6,-0.12,-1.14,1.41,-4.76,0.35,-2.48,-0.94,3.02,3.42,-2.68,-3.02,3.27,-3.43,-1.86,0.32,-1.38,1.52,0.95,0.27,0.66,-0.24,1.91,1.63,0.84,-2.59,0.94,-4.16,-1.6,0.42,-0.98,-1.2,-1.44,-4.76,-1.33,0.81,-1.15,-4.19,-1.43,0.07,1.3,0.43,-1.97,-2.2,-1.74,-1.56,-0.62,-1.36,-2.37,2.79,-2.93,-1.04,-1.44,2.78,2.97,-0.06,-2.28,-2.11,-2.97,-0.01,0.59,-3.57,-1.39,-5.15,-3.13,-3.16,-5.47,1.1,2.2,-3.8,2.6,4.58,-1.82,-3.26,-0.83,-2.29,0.44,4.13,0.29,2.34,-0.53,3.06,-2.08,-0.18,-3.38,5.53,-1.06,0.32,-2.17,0.22,1.09,-1.61,-2.12,-1.98,-0.37,-0.74,-1.02,-0.76,-2.98,-0.46,-3.07,-0.77,0.8,-1.94,-0.45,-1.92,0.52,-2.7,0.61,0.08,-3.29,1.27,-0.25,-2.42,-0.56,-1.41,0.74,-2.5,-3.22,1.36,0.02,0.91,-0.89,-3.43,-0.35,1.35,1.81,-2.26,-3.11,-1,-0.07,-6.04,1,-2.21,0.81,0.12,-0.82,0.13,-0.37,-1.87,-1.23,-0.07,-1.6,-1.28,-4.79,-0.69,2.59,-3.65,-1.07,0.7,-1.11,0.28,-2.67,0.41,-2.2,-1.43,-1.17,1.32,-1.43,-2.59,2.22,-3.98,-2.73,-2.18,-2.18,-0.44,-1.74,1.03,0.69,-2.36,-0.85,-0.28,-1.26,-2.13,-5.1,-2.32,-0.85,-2.85,1.74,-2.38,2.71,-3.6,-3.11,-3,-2,-1.79,-2.95,3.27,2.64,-0.93,-6.05,-0.06,0.4,-1.13,0.92,0.91,-1.77,-2.52,0.07,1.89,-0.86,0.15,-0.4,-1.82,-1.9,-2.41,-0.04,-0.5,-3.01,1.06,-2.13,-1.41,-1.51,-2.24,-4.48,1.68,1.81,-3.29,0.51,0.43,0.56,-0.59,4.8,-1.53,-2.14,-0.01,3.92,2.37,-0.01,2.18,-1.26,-4.6,2.33,-1.67,-3.26,-1.41,-1.17,-1.94,-2.55,2.3,0.17,-2.18,-0.89,-0.59,1.22,-1.4,-3.4,-5.71,0.58,-1.19,-1.35,3.36,-2.76,2.96,0.73,2.01,1.61,2.18,-2.6,-0.88,-1.24,-0.44,0.58,-2.34,-2.4,-2.76,-3.25,1.02,-2.56,-1.93,-0.77,1.77,-3.1,-1.77,-2.08,-1.92,-1.19,1.08,-4.09,-0.67,2.48,3.37,-3.63,-0.52,0.3,-1.45,-4.67,-2.06,2.56,0.81,-0.27,0.32,-2.55,-1.91,-1.7,3.25,-5.47,1.78,-2.03,-3.53,-0.63,-6,-2.04,-0.74,2.69,-0.32,0.18,-3.59,3.39,-0.7,-3.06,0.82,-2.25,-2.14,-1.54,0.45,-1.49,-0.13,-1.24,-1.04,0.91,-0.28,-2.45,-2.48];
const yv = [...YV].map(Number), yt = [...YT].map(Number), PV = ZV.map(sig), PT = ZT.map(sig), PW = ZW.map(sig);
const OC = { tn: C.gray, fp: C.purple, fn: C.coral, tp: C.teal };
const ON = { tn: "true negative, accepted", fp: "false positive, false alarm", fn: "false negative, missed defect", tp: "true positive, defect found" };
/* counts and ratios at a threshold, flag when p >= t, an empty denominator reports 0 (HW9 3A convention) */
const conf = (y, p, t) => {
  let tp = 0, tn = 0, fp = 0, fn = 0;
  for (let i = 0; i < y.length; i++) { const h = p[i] >= t; if (h && y[i]) tp++; else if (h) fp++; else if (y[i]) fn++; else tn++; }
  const r = (a, b) => b ? a / b : 0;
  return { tp, tn, fp, fn, n: y.length, acc: (tp + tn) / y.length, prec: r(tp, tp + fp), rec: r(tp, tp + fn), spec: r(tn, tn + fp), fpr: r(fp, fp + tn), f1: r(2 * tp, 2 * tp + fp + fn) };
};
const outcome = (y, h) => y ? (h ? "tp" : "fn") : (h ? "fp" : "tn");
/* ROC and PR points over distinct score values. w0 weights every negative (card 9). Each point: [fpr, tpr, score, tp, fp] */
const curve = (y, s, w0) => {
  w0 = w0 || 1; const idx = s.map((v, i) => i).sort((a, b) => s[b] - s[a]);
  let n1 = 0, n0 = 0; y.forEach(v => { if (v) n1++; else n0++; });
  const pts = [[0, 0, Infinity, 0, 0]]; let tp = 0, fp = 0;
  for (let k = 0; k < idx.length; k++) { const i = idx[k]; if (y[i]) tp++; else fp++; if (k === idx.length - 1 || s[idx[k + 1]] !== s[i]) pts.push([fp / n0, tp / n1, s[i], tp, fp]); }
  let auc = 0, ap = 0;
  for (let k = 1; k < pts.length; k++) { auc += (pts[k][0] - pts[k - 1][0]) * (pts[k][1] + pts[k - 1][1]) / 2; ap += (pts[k][1] - pts[k - 1][1]) * pts[k][3] / (pts[k][3] + w0 * pts[k][4]); }
  return { pts, auc, ap, n1, n0 };
};
const G19 = Array.from({ length: 19 }, (_, k) => Math.round(5 + 5 * k) / 100);
const costAt = (y, p, t, cfn, cfp) => { const m = conf(y, p, t); return (cfn * m.fn + cfp * m.fp) / y.length; };
const scan = (y, p, cfn, cfp) => { let best = null; G19.forEach(t => { const c = costAt(y, p, t, cfn, cfp); if (!best || c < best.c - 1e-12) best = { t, c }; }); return best; };
const wilson = (k, n) => { const z = 1.96, ph = k / n, den = 1 + z * z / n, c = (ph + z * z / (2 * n)) / den, h = z * Math.sqrt(ph * (1 - ph) / n + z * z / (4 * n * n)) / den; return [c - h, c + h]; };
/* the 2 by 2 confusion matrix, rows true, columns predicted. o: {hl: Set of numerator cells, den: Set of denominator cells, w, h} */
const cm2 = (x, y, m, o) => {
  o = o || {}; const w = o.w || 96, h = o.h || 60, hl = o.hl || new Set(), den = o.den || new Set();
  let s = tx(x + w, y - 26, "predicted", "middle", "th") + tx(x + w / 2, y - 8, "acceptable (0)", "middle") + tx(x + 1.5 * w, y - 8, "defect (1)", "middle");
  s += tx(x - 10, y + h / 2 + 4, "true 0", "end") + tx(x - 10, y + 1.5 * h + 4, "true 1", "end");
  [["tn", 0, 0], ["fp", 0, 1], ["fn", 1, 0], ["tp", 1, 1]].forEach(([k, r, c]) => {
    const on = hl.has(k), dn = den.has(k);
    s += `<rect x="${x + c * w}" y="${y + r * h}" width="${w - 4}" height="${h - 4}" rx="7" fill="${OC[k]}" opacity="${on ? 0.85 : dn ? 0.4 : 0.16}" stroke="${on || dn ? "var(--t)" : OC[k]}" stroke-width="${on ? 2.4 : dn ? 1.6 : 1}"${dn && !on ? ` stroke-dasharray="5 3"` : ""}/>`;
    s += tx(x + c * w + w / 2 - 2, y + r * h + h / 2 - 2, m[k], "middle", "th") + tx(x + c * w + w / 2 - 2, y + r * h + h / 2 + 15, k.toUpperCase(), "middle");
  });
  return s;
};
const swatches = (x, y, keys) => keys.map(([k, lab], i) => `<rect x="${x}" y="${y + i * 18 - 9}" width="11" height="11" rx="2" fill="${OC[k]}" opacity="${k === "tn" ? 0.45 : 0.9}"/>` + tx(x + 17, y + i * 18, lab || ON[k])).join("");
const txc = (x, y, t, col, a) => `<text class="th" x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""} style="fill:${col}">${t}</text>`;

/* Card 2: twelve fresh parts, and the eight observations of HW9 3A */
const S12 = { p: [0.95, 0.88, 0.81, 0.74, 0.66, 0.58, 0.47, 0.39, 0.31, 0.22, 0.15, 0.06], y: [1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0] };
const SH = { p: [0.9, 0.8, 0.7, 0.6, 0.4, 0.3, 0.2, 0.1], y: [1, 0, 1, 0, 0, 1, 0, 0] };
/* Card 11: a fresh four-class inspection matrix, rows true, columns predicted */
const K4 = ["good", "scratch", "dent", "crack"];
const CM4 = [[291, 5, 3, 1], [8, 47, 4, 1], [6, 5, 18, 1], [4, 1, 1, 4]];

addLesson("ml", "class", {
level: "Core", num: "Lesson 31",
id: "ml-class-l31", title: "Evaluating classifiers", short: "31. Evaluating classifiers",
big: String.raw`Lessons 29 and 30 trained classifiers and read them through one number, accuracy. This lesson takes that number apart. When one class is rare, a rule that never flags anything can score 79% here and 99.5% in Andrew Ng's rare disease example while finding nothing, so the four outcomes are counted separately in a confusion matrix, rows for the true class and columns for the prediction. Precision asks how many flagged parts are defects, recall asks how many defects were flagged, and the threshold trades one for the other. F1 combines them with a harmonic mean that punishes a lopsided pair. When the two errors have different costs, the threshold comes from the costs, scanned on validation data or read off as the false alarm cost over the sum of both costs when the probabilities are calibrated. ROC and AUC judge the ranking over every threshold at once, precision-recall curves show what imbalance does to the flagged list, and a reliability diagram checks whether a predicted 0.7 is right 70% of the time. For many classes the same counts give per-class recall and macro averages, and the whole procedure is frozen on validation and opened on the test set once, with an error bar.`,
bridge: String.raw`The course has no lecture notes for evaluating classifiers, so the topics follow the homework: HW9 Problem 3 (3A confusion counts and metrics, 3B the imbalanced dataset, 3C the cost-based threshold with ROC and precision-recall curves, 3D the frozen test) and 4C to 4D (macro metrics and the per-class report), and HW10 B4 (confusion counts and per-class recall) with its final gate, read with their solutions docs. The spine is Andrew Ng's Machine Learning Specialization, course 2 week 3: Error metrics for skewed datasets, and Trading off precision and recall. All data on the cards are fresh: one synthetic inspection problem with 21% defects and a logistic regression trained on it.`,
labels: { note: "Exam and project note" },
cards: [

{s: "1. Skewed data", t: "Accuracy on skewed data: the rule that never flags anything",
intu: String.raw`Four hundred validation parts, 84 of them defective, shown as squares with the defects first. Andrew Ng's warning in course 2 week 3: when one class is rare, accuracy rewards ignoring it. The rule that always says acceptable gets 316 of 400 right, an accuracy of 0.79, and finds no defect at all. In Ng's rare disease example only 0.5% of patients are sick, so printing y = 0 for everyone scores 99.5%. Switch to the logistic model at threshold 0.5. Its accuracy is 0.8675, only 0.0775 better, yet it finds 42 defects instead of 0. The right panel shows the trap in general: the do-nothing rule scores 1 minus the prevalence, so a high accuracy on rare classes says almost nothing. That is why the rest of the lesson counts the two kinds of error separately.`,
eq: String.raw`\[ \text{accuracy} = \frac{\text{correct predictions}}{N} \]
\[ \text{always predict 0: accuracy} = 1 - \pi, \qquad \pi = \frac{\text{positives}}{N} \]`,
sym: [[String.raw`\(\pi\)`, "prevalence, the fraction of positives, 84/400 = 0.21 here"], ["positive class", "the rare class you want to find, label 1, a defect"], ["skewed data", "one class much rarer than the other"], ["do-nothing rule", "always predict the majority class 0"], ["defects found", "the true positives, the number accuracy hides"]],
how: ["Count the positives and compute the prevalence.", "Compute the accuracy of always predicting the majority class.", "Compare the model's accuracy with that baseline, not with 0.", "Count how many positives the model actually finds.", "Never report accuracy alone on a skewed problem."],
say: String.raw`On a skewed dataset accuracy is dominated by the majority class, so a rule that never predicts the rare class scores one minus the prevalence while detecting nothing, and the model must be judged by the errors on each class.`,
num: String.raw`Validation: 400 parts, 84 defects, π = 0.21. Always acceptable: accuracy <b>0.79</b>, 0 defects found. Model at 0.5: accuracy <b>0.8675</b>, 42 of 84 defects found, 11 false alarms. Ng's rare disease at π = 0.005: the do-nothing rule scores 0.995.`,
note: String.raw`HW9 3B asks for exactly this comparison: its majority rule scored 0.76 accuracy with 48 missed defects, while the model scored 0.94 and found 37 of 48. Report the baseline beside every accuracy in the project.`,
r(fig, ctl) {
  ctl.innerHTML = btns([[0, "Always say acceptable"], [1, "Logistic model at threshold 0.5"]], "acm") + `<div id="acmo"></div>`;
  const order = PV.map((p, i) => i).sort((a, b) => (yv[b] - yv[a]) || (PV[b] - PV[a]));
  let md = 0;
  const u = () => {
    pick(ctl, "acm", md); const t = md ? 0.5 : 2, m = conf(yv, PV, t);
    let s = tx(20, 18, "400 validation parts, the 84 defects first", null, "th");
    order.forEach((i, k) => { const o = outcome(yv[i], PV[i] >= t); s += `<rect x="${20 + (k % 25) * 13}" y="${30 + Math.floor(k / 25) * 13}" width="11" height="11" rx="2" fill="${OC[o]}" opacity="${o === "tn" ? 0.35 : 0.9}"/>`; });
    s += swatches(26, 254, [["tp", "defect found"], ["fn", "missed defect"]]) + swatches(196, 254, [["fp", "false alarm"], ["tn", "accepted"]]);
    const a = ML.axes(420, 30, 220, 170, { xmin: 0, xmax: 0.5, ymin: 0.5, ymax: 1, nx: 5, ny: 5, fx: v => v.toFixed(1), fy: v => v.toFixed(1), xl: "prevalence π", yl: "accuracy", grid: false });
    s += a.s + ML.path([[a.X(0), a.Y(1)], [a.X(0.5), a.Y(0.5)]], C.gray, 2) + tx(a.X(0.2), a.Y(0.62), "always predict 0", "middle");
    s += `<circle cx="${a.X(0.21)}" cy="${a.Y(0.79)}" r="5" fill="${C.coral}"/>` + tx(a.X(0.21) + 8, a.Y(0.79) - 6, "here 0.79");
    s += `<circle cx="${a.X(0.005)}" cy="${a.Y(0.995)}" r="5" fill="${C.purple}"/>` + tx(a.X(0.005) + 8, a.Y(0.995) + 14, "Ng: 0.995");
    if (md) s += `<circle cx="${a.X(0.21)}" cy="${a.Y(m.acc)}" r="5" fill="${C.teal}"/>` + tx(a.X(0.21) + 8, a.Y(m.acc) - 4, "model " + f(m.acc, 4));
    fig.innerHTML = svg(300, s);
    $("acmo").innerHTML = RO([["accuracy", f(m.acc, 4)], ["defects found", m.tp + " of 84"], ["recall", f(m.rec, 4)], ["false alarms", m.fp]]);
  };
  ctl.querySelectorAll("button[data-acm]").forEach(b => b.onclick = () => { md = +b.dataset.acm; u(); });
  u();
}},

{s: "2. Four outcomes", t: "The confusion matrix: count the four outcomes",
intu: String.raw`Each part sits on the strip at its predicted probability, defects on the top row and acceptable parts on the bottom row. The threshold line splits the strip: everything at or right of it is flagged as a defect. A flagged defect is a true positive, a flagged acceptable part is a false positive or false alarm, an unflagged defect is a false negative or missed defect, and an unflagged acceptable part is a true negative. The course writes the counts as a 2 by 2 table with the true class on the rows and the prediction on the columns, TN and FP on top, FN and TP below. Slide the threshold left and parts move from the left column to the right column, so false negatives turn into true positives and true negatives into false positives. The four counts always add to N, and the rows always add to the class sizes, whatever the threshold. HW9 3A's eight observations are one click away.`,
eq: String.raw`\[ \begin{pmatrix} TN & FP \\ FN & TP \end{pmatrix}, \qquad \hat{y} = 1 \text{ if } p \geq \tau \]
\[ TN + FP = N_0, \qquad FN + TP = N_1 \]`,
sym: [[String.raw`\(\tau\)`, "threshold, flag a part when p ≥ τ"], ["TP", "defect flagged, true positive"], ["FP", "acceptable part flagged, false positive, type I error"], ["FN", "defect missed, false negative, type II error"], ["TN", "acceptable part accepted, true negative"], [String.raw`\(N_0, N_1\)`, "number of true negatives and true positives in the data, the row totals"]],
how: ["Turn each probability into a prediction with p ≥ τ.", "Pair each prediction with its true label.", "Count the four combinations.", "Write them with true labels on the rows and predictions on the columns.", "Check that each row adds to that class's size."],
say: String.raw`A confusion matrix counts the true negatives, false positives, false negatives and true positives at one threshold, with true classes on the rows and predicted classes on the columns, so each row sums to the size of that class.`,
num: String.raw`Twelve parts at τ = 0.5: TP = <b>4</b>, FP = <b>2</b>, FN = <b>1</b>, TN = <b>5</b>. At τ = 0.3: 5, 4, 0, 3. At τ = 0.85: 2, 0, 3, 7. HW9 3A at 0.5: TP 2, FP 2, FN 1, TN 3.`,
note: String.raw`scikit-learn's confusion_matrix uses the same layout, so <code>confusion_matrix(y, yhat).ravel()</code> returns (tn, fp, fn, tp) in that order. Keep the ≥ in the threshold rule: HW9's public check has a probability of exactly 0.5 and expects it flagged.`,
r(fig, ctl) {
  ctl.innerHTML = btns([[0, "Twelve fresh parts"], [1, "HW9 3A, eight observations"]], "cfd") + sl("cft", "threshold τ", 0.05, 0.95, 0.01, 0.5) + `<div id="cfo"></div>`;
  let md = 0;
  const u = () => {
    pick(ctl, "cfd", md); const D = md ? SH : S12, t = +$("cft").value; $("cftv").textContent = f(t, 2);
    const m = conf(D.y, D.p, t), X = v => 40 + v * 340;
    let s = `<rect x="${X(t)}" y="30" width="${X(1) - X(t)}" height="170" fill="${C.coral}" opacity="0.07"/>`;
    s += tx(40, 20, "true defect (y = 1)", null, "th") + tx(40, 116, "true acceptable (y = 0)", null, "th");
    s += `<line x1="${X(0)}" y1="210" x2="${X(1)}" y2="210" stroke="var(--p)"/>` + [0, 0.25, 0.5, 0.75, 1].map(v => `<line x1="${X(v)}" y1="210" x2="${X(v)}" y2="215" stroke="var(--p)"/>` + tx(X(v), 230, v, "middle")).join("") + tx(X(0.5), 250, "predicted probability p", "middle");
    D.p.forEach((p, i) => { const o = outcome(D.y[i], p >= t), yy = D.y[i] ? 64 : 160, dy = (i % 2) * 0; s += `<circle cx="${X(p)}" cy="${yy + dy}" r="8" fill="${OC[o]}" opacity="${o === "tn" ? 0.5 : 0.9}"/>` + tx(X(p), yy - 15 - (i % 2) * 11, p.toFixed(2), "middle"); });
    s += `<line x1="${X(t)}" y1="26" x2="${X(t)}" y2="212" stroke="var(--t)" stroke-width="2" stroke-dasharray="5 4"/>` + tx(X(t) + 6, 112, "τ, flagged →", null, "th");
    s += cm2(440, 70, m, { w: 100, h: 62 }) + tx(540, 226, "rows add to " + (m.tn + m.fp) + " and " + (m.fn + m.tp), "middle");
    fig.innerHTML = svg(260, s);
    $("cfo").innerHTML = RO([["TP", m.tp], ["FP", m.fp], ["FN", m.fn], ["TN", m.tn], ["accuracy", f(m.acc, 4)]]);
  };
  $("cft").oninput = u; ctl.querySelectorAll("button[data-cfd]").forEach(b => b.onclick = () => { md = +b.dataset.cfd; u(); });
  u();
}},

{s: "3. The ratios", t: "Precision, recall and their relatives, each a ratio of cells",
intu: String.raw`Every metric is a ratio of cells in the same matrix, and the buttons light up which ones. The solid cell is the numerator and the dashed cells are the denominator. Precision divides by the right column: of everything flagged, how much was a defect. Recall divides by the bottom row: of all defects, how many were flagged. Ng's phrasing for the rare disease: precision is how often a positive diagnosis is right, recall is how many sick patients the test catches. Specificity is recall for the negative class, and the false positive rate is 1 minus specificity. Accuracy uses every cell, which is why the big TN cell swamps it. Move the threshold and watch the two families pull apart: rows are fixed totals, so recall and specificity change smoothly, while the flagged column shrinks and grows, so precision can jump.`,
eq: String.raw`\[ \text{precision} = \frac{TP}{TP + FP}, \qquad \text{recall} = \frac{TP}{TP + FN} \]
\[ \text{specificity} = \frac{TN}{TN + FP}, \qquad \text{FPR} = \frac{FP}{FP + TN} = 1 - \text{specificity} \]`,
sym: [["precision", "fraction of flagged parts that are defects, the column view"], ["recall", "fraction of defects that are flagged, also sensitivity or TPR, the row view"], ["specificity", "fraction of acceptable parts accepted, recall of class 0"], ["FPR", "fraction of acceptable parts flagged, the false alarm rate"], ["0 by convention", "a ratio with an empty denominator, for example precision when nothing is flagged"]],
how: ["Pick the question the metric answers.", "Precision: look down the flagged column.", "Recall: look along the true defect row.", "Divide the solid cell by the dashed cells.", "When a denominator is 0, report 0 and say so."],
say: String.raw`Precision is the fraction of predicted positives that are truly positive, recall is the fraction of true positives that are predicted positive, and specificity is the fraction of true negatives predicted negative, so precision reads a column of the confusion matrix and recall and specificity read a row.`,
num: String.raw`Validation at τ = 0.5: TP 42, FP 11, FN 42, TN 305. Precision 42/53 = <b>0.7925</b>, recall 42/84 = <b>0.5000</b>, specificity 305/316 = 0.9652, FPR 11/316 = 0.0348, accuracy 0.8675, F1 0.6131. At τ = 0.3: precision 0.6484, recall 0.7024.`,
note: String.raw`HW9 3A wants these from NumPy counts, with 0.0 for an undefined ratio. Its public check feeds probabilities (0.1, 0.2) with labels (0, 1): nothing is flagged, so precision and F1 must come back 0, not an error.`,
r(fig, ctl) {
  const MS = { acc: ["accuracy", ["tn", "tp"], ["tn", "fp", "fn", "tp"], "(TN + TP) / N", "of all parts, how many were called right?"], prec: ["precision", ["tp"], ["tp", "fp"], "TP / (TP + FP)", "of the flagged parts, how many are defects?"], rec: ["recall", ["tp"], ["tp", "fn"], "TP / (TP + FN)", "of the defects, how many were flagged?"], spec: ["specificity", ["tn"], ["tn", "fp"], "TN / (TN + FP)", "of the acceptable parts, how many were accepted?"], fpr: ["FPR", ["fp"], ["fp", "tn"], "FP / (FP + TN)", "of the acceptable parts, how many were flagged?"], f1: ["F1", ["tp"], ["tp", "fp", "fn"], "2TP / (2TP + FP + FN)", "one number that needs both precision and recall"] };
  ctl.innerHTML = btns(Object.keys(MS).map(k => [k, MS[k][0]]), "mtr") + sl("mtt", "threshold τ", 0.05, 0.95, 0.01, 0.5) + `<div id="mto"></div>`;
  let k = "prec";
  const u = () => {
    pick(ctl, "mtr", k); const t = +$("mtt").value; $("mttv").textContent = f(t, 2);
    const m = conf(yv, PV, t), [nm, num, den, form, q] = MS[k];
    const nv = k === "acc" ? m.tn + m.tp : k === "f1" ? 2 * m.tp : m[num[0]], dv = k === "acc" ? m.n : k === "f1" ? 2 * m.tp + m.fp + m.fn : den.reduce((a, c) => a + m[c], 0);
    let s = cm2(130, 70, m, { w: 120, h: 76, hl: new Set(num), den: new Set(den) });
    s += tx(420, 70, nm, null, "th") + tx(420, 94, q) + tx(420, 126, nm + " = " + form, null, "t") + tx(420, 150, "= " + nv + " / " + dv + " = " + f(m[k], 4), null, "th");
    s += `<rect x="420" y="178" width="14" height="14" rx="3" fill="var(--p)" opacity="0.8"/>` + tx(440, 190, "numerator, solid") + `<rect x="420" y="200" width="14" height="14" rx="3" fill="none" stroke="var(--t)" stroke-dasharray="4 2"/>` + tx(440, 212, "denominator, dashed");
    s += tx(130, 248, "400 validation parts, 84 defects", null, "ts");
    fig.innerHTML = svg(262, s);
    $("mto").innerHTML = RO([["precision", f(m.prec, 4)], ["recall", f(m.rec, 4)], ["specificity", f(m.spec, 4)], ["FPR", f(m.fpr, 4)], ["accuracy", f(m.acc, 4)], ["F1", f(m.f1, 4)]]);
  };
  $("mtt").oninput = u; ctl.querySelectorAll("button[data-mtr]").forEach(b => b.onclick = () => { k = b.dataset.mtr; u(); });
  u();
}},

{s: "4. The trade-off", t: "Trading precision for recall with the threshold",
intu: String.raw`Ng's second video of the week. Raise the threshold and the model flags only parts it is very sure about: precision goes up and recall goes down. Lower it and the model flags anything suspicious: recall goes up and precision goes down. The curves show all thresholds at once on the validation set. Recall can only fall as τ rises, because the flagged set only shrinks. Precision usually rises but can wobble, because one acceptable part leaving the flagged set helps it and one defect leaving hurts it. Which end you want depends on the job. A doctor who will start a painful treatment wants high precision, so a high τ. An inspector who must not ship a crack wants high recall, so a low τ. The teal curve is F1, which peaks where neither one is sacrificed.`,
eq: String.raw`\[ \tau \uparrow \ \Rightarrow \ \text{flagged set shrinks} \ \Rightarrow \ \text{recall} \downarrow, \ \text{precision usually} \uparrow \]
\[ F_1 = \frac{2PR}{P + R} \]`,
sym: [[String.raw`\(\tau\)`, "the decision threshold, a choice made after training"], ["P, R", "precision and recall at that threshold"], ["monotone", "recall never rises as τ rises, precision can go either way"], ["operating point", "the threshold you finally deploy"]],
how: ["Compute precision and recall at many thresholds on validation data.", "Plot both against the threshold.", "Decide which error the task can tolerate.", "Pick τ from that decision, or from F1, or from costs.", "Freeze τ before touching the test set."],
say: String.raw`Raising the decision threshold makes the classifier flag fewer examples, which lowers recall and usually raises precision, so the threshold is chosen on validation data to suit the task.`,
num: String.raw`τ = 0.3: 91 flagged, precision 0.6484, recall 0.7024. τ = 0.5: 53 flagged, 0.7925, 0.5000. τ = 0.7: 36 flagged, <b>0.9167</b>, <b>0.3929</b>. The F1 maximum on a 0.01 grid is at τ = <b>0.32</b>: precision 0.6782, recall 0.7024, F1 <b>0.6901</b>.`,
note: String.raw`HW9 3C plots exactly these two curves against the threshold and marks the chosen one. Train once, then choose τ from the curves: changing τ never needs another epoch.`,
r(fig, ctl) {
  const T = Array.from({ length: 99 }, (_, k) => (k + 1) / 100), R = T.map(t => conf(yv, PV, t));
  let bi = 0; R.forEach((m, i) => { if (m.f1 > R[bi].f1) bi = i; });
  ctl.innerHTML = btns([[0.7, "High precision, τ = 0.7"], [0.3, "High recall, τ = 0.3"], [T[bi], "Best F1"]], "tro") + sl("trt", "threshold τ", 0.01, 0.99, 0.01, 0.5) + `<div id="tro"></div>`;
  const u = () => {
    const t = +$("trt").value; $("trtv").textContent = f(t, 2); pick(ctl, "tro", t);
    const m = conf(yv, PV, t), a = ML.axes(60, 14, 400, 220, { xmin: 0, xmax: 1, ymin: 0, ymax: 1, nx: 5, ny: 5, fx: v => v.toFixed(1), fy: v => v.toFixed(1), xl: "threshold τ", yl: "fraction", grid: false });
    let s = a.s + ML.path(T.map((v, i) => [a.X(v), a.Y(R[i].prec)]), C.blue, 2.2) + ML.path(T.map((v, i) => [a.X(v), a.Y(R[i].rec)]), C.coral, 2.2) + ML.path(T.map((v, i) => [a.X(v), a.Y(R[i].f1)]), C.teal, 2.2, "6 4");
    s += `<line x1="${a.X(t)}" y1="14" x2="${a.X(t)}" y2="234" stroke="var(--t)" stroke-width="1.6" stroke-dasharray="4 4"/>`;
    [["prec", C.blue], ["rec", C.coral], ["f1", C.teal]].forEach(([k, c]) => { s += `<circle cx="${a.X(t)}" cy="${a.Y(m[k])}" r="4.5" fill="${c}"/>`; });
    s += `<circle cx="${a.X(T[bi])}" cy="${a.Y(R[bi].f1)}" r="6" fill="none" stroke="${C.teal}" stroke-width="2"/>`;
    s += txc(490, 40, "precision", C.blue) + txc(490, 62, "recall", C.coral) + txc(490, 84, "F1 (dashed)", C.teal);
    s += tx(490, 120, "flagged: " + (m.tp + m.fp) + " of 400", null, "t") + tx(490, 142, "TP " + m.tp + ", FP " + m.fp) + tx(490, 162, "FN " + m.fn + ", TN " + m.tn) + tx(490, 196, "circle: best F1 at τ = " + f(T[bi], 2));
    fig.innerHTML = svg(270, s);
    $("tro").innerHTML = RO([["precision", f(m.prec, 4)], ["recall", f(m.rec, 4)], ["F1", f(m.f1, 4)]]);
  };
  $("trt").oninput = u; ctl.querySelectorAll("button[data-tro]").forEach(b => b.onclick = () => { $("trt").value = b.dataset.tro; u(); });
  u();
}},

{s: "5. One number", t: "One number for two: why F1 is a harmonic mean",
intu: String.raw`Comparing models is easier with one number, and Ng shows why the plain average of precision and recall is the wrong one. Three classifiers: A has precision 0.6 and recall 0.45, B is very careful with 0.85 and 0.08, C flags every part, so its recall is 1 and its precision is the prevalence, 0.21. The average ranks C first at 0.605, a rule that does no work. F1, the harmonic mean, ranks A first at 0.5143 and drops C to 0.3471 and B to 0.1462. Switch the contours between the average and F1. The average has straight contours, so a perfect recall buys a lot of score even with useless precision. The F1 contours bend toward the corner: to score high you need both, and the smaller of the two dominates. Drag P and R to feel it.`,
eq: String.raw`\[ F_1 = \frac{2}{\frac{1}{P} + \frac{1}{R}} = \frac{2PR}{P + R} = \frac{2TP}{2TP + FP + FN} \]
\[ \min(P, R) \leq F_1 \leq \frac{P + R}{2} \]`,
sym: [["P, R", "precision and recall"], [String.raw`\(F_1\)`, "harmonic mean of precision and recall, 0 when either is 0"], ["average", "(P + R)/2, fooled by an extreme value"], ["flag everything", "recall 1, precision equal to the prevalence"], [String.raw`\(F_\beta\)`, "a weighted version that counts recall β times as much"]],
how: ["Compute P and R for each model at its threshold.", "Compute F1 = 2PR/(P + R), or 2TP/(2TP + FP + FN) from counts.", "Rank the models by F1, not by the average.", "Check that no model wins by flagging everything.", "Use a cost or Fβ when one error clearly matters more."],
say: String.raw`F1 is the harmonic mean of precision and recall, so it is high only when both are high, unlike the arithmetic mean, which a classifier can inflate by maximizing one at the expense of the other.`,
num: String.raw`A (0.6, 0.45): average 0.525, F1 <b>0.5143</b>. B (0.85, 0.08): average 0.465, F1 0.1462. C, flag all 400 parts: precision 0.21, recall 1, average <b>0.605</b>, F1 <b>0.3471</b>. The validation model's best F1 is 0.6901 at τ = 0.32.`,
note: String.raw`HW9 4C reports macro-F1 for the digit models, the F1 of each class averaged over the ten classes. A model that ignores a class gets F1 = 0 for it, which the macro average shows and accuracy hides.`,
r(fig, ctl) {
  const PR = [["A", 0.6, 0.45], ["B", 0.85, 0.08], ["C", 0.21, 1]], F1 = (p, r) => p + r ? 2 * p * r / (p + r) : 0;
  ctl.innerHTML = btns([[0, "F1 contours"], [1, "Average contours"]], "f1m") + btns(PR.map((v, i) => [i, "Model " + v[0]]), "f1p") + sl("f1P", "precision P", 0, 1, 0.01, 0.6) + sl("f1R", "recall R", 0, 1, 0.01, 0.45) + `<div id="f1o"></div>`;
  let md = 0;
  const u = () => {
    pick(ctl, "f1m", md); const P = +$("f1P").value, R = +$("f1R").value; $("f1Pv").textContent = f(P, 2); $("f1Rv").textContent = f(R, 2);
    const a = ML.axes(60, 14, 250, 250, { xmin: 0, xmax: 1, ymin: 0, ymax: 1, nx: 5, ny: 5, fx: v => v.toFixed(1), fy: v => v.toFixed(1), xl: "precision P", yl: "recall R", grid: false });
    let s = a.s;
    [0.2, 0.4, 0.6, 0.8].forEach(c => {
      let pts = [];
      if (md) { for (let k = 0; k <= 60; k++) { const p = Math.max(0, 2 * c - 1) + k / 60 * (Math.min(1, 2 * c) - Math.max(0, 2 * c - 1)); pts.push([a.X(p), a.Y(2 * c - p)]); } }
      else { for (let k = 0; k <= 200; k++) { const p = c / 2 + 1e-4 + k / 200 * (1 - c / 2 - 1e-4), r = c * p / (2 * p - c); if (r <= 1 && r >= 0) pts.push([a.X(p), a.Y(r)]); } }
      s += ML.path(pts, C.gray, 1.3, "4 3") + tx(a.X(md ? Math.min(1, 2 * c) - 0.02 : 0.97), md ? a.Y(2 * c - Math.min(1, 2 * c)) - 5 : a.Y(c * 0.97 / (2 * 0.97 - c)) - 5, (md ? "avg " : "F1 ") + c, "end");
    });
    PR.forEach(([n, p, r]) => { s += `<circle cx="${a.X(p)}" cy="${a.Y(r)}" r="5" fill="${C.purple}"/>` + tx(a.X(p) + (p > 0.8 ? -10 : 8), a.Y(r) + (r > 0.9 ? 14 : -6), n, p > 0.8 ? "end" : null, "th"); });
    s += `<circle cx="${a.X(P)}" cy="${a.Y(R)}" r="7" fill="${C.teal}" stroke="#fff" stroke-width="1.5"/>`;
    s += tx(360, 30, "model", null, "th") + tx(430, 30, "P", "middle", "th") + tx(480, 30, "R", "middle", "th") + tx(545, 30, "average", "middle", "th") + tx(620, 30, "F1", "middle", "th");
    PR.forEach(([n, p, r], i) => { const y = 56 + i * 24, fa = (p + r) / 2, ff = F1(p, r); s += tx(360, y, n + (n === "C" ? ", flag all" : "")) + tx(430, y, f(p, 2), "middle") + tx(480, y, f(r, 2), "middle") + tx(545, y, f(fa, 3), "middle", fa === 0.605 ? "th" : "ts") + tx(620, y, f(ff, 4), "middle", n === "A" ? "th" : "ts"); });
    s += tx(360, 150, "the average ranks C first", null, "t") + tx(360, 172, "F1 ranks A first") + tx(360, 210, "your point: P = " + f(P, 2) + ", R = " + f(R, 2), null, "t") + tx(360, 232, "average " + f((P + R) / 2, 4) + ", F1 " + f(F1(P, R), 4));
    fig.innerHTML = svg(300, s);
    $("f1o").innerHTML = RO([["average", f((P + R) / 2, 4)], ["F1", f(F1(P, R), 4)], ["min(P, R)", f(Math.min(P, R), 4)]]);
  };
  $("f1P").oninput = u; $("f1R").oninput = u;
  ctl.querySelectorAll("button[data-f1m]").forEach(b => b.onclick = () => { md = +b.dataset.f1m; u(); });
  ctl.querySelectorAll("button[data-f1p]").forEach(b => b.onclick = () => { const v = PR[+b.dataset.f1p]; $("f1P").value = v[1]; $("f1R").value = v[2]; u(); });
  u();
}},

{s: "6. Cost threshold", t: "A threshold from the cost of each error",
intu: String.raw`HW9 3C gives the two errors prices: a missed defect costs 5 units, a needless inspection costs 1. The cost per part is (5 FN + FP)/N, and the threshold is the one with the lowest validation cost on a grid of 19 values from 0.05 to 0.95, ties going to the smallest. Here it is τ = 0.15, cost 0.32, against 0.5525 at the default 0.5: lowering the threshold trades 57 extra false alarms for 30 fewer missed defects. Slide the cost of a miss and the best threshold moves. Theory gives the same answer for calibrated probabilities: flag when the expected cost of accepting, \(c_{FN}\,p\), exceeds the expected cost of flagging, \(c_{FP}(1 - p)\), so \(\tau^* = c_{FP}/(c_{FP} + c_{FN})\), 1/6 here. The second view shows the other route, weighting the defects 5 times in the loss: the model learns a bias about log 5 higher, and its 0.5 threshold lands where the plain model's 1/6 does.`,
eq: String.raw`\[ \text{cost per part} = \frac{c_{FN}\, FN + c_{FP}\, FP}{N} \]
\[ \text{flag when } c_{FN}\, p \gt c_{FP}(1 - p) \iff p \gt \tau^* = \frac{c_{FP}}{c_{FP} + c_{FN}} \]`,
sym: [[String.raw`\(c_{FN}\)`, "cost of a missed defect, 5 units in HW9"], [String.raw`\(c_{FP}\)`, "cost of a false alarm, 1 unit"], [String.raw`\(\tau^*\)`, "the cost-optimal threshold for calibrated probabilities"], ["grid scan", "evaluate the cost at each candidate τ on validation data, keep the smallest"], [String.raw`\(\texttt{pos\_weight}\)`, "weight on positive examples in BCEWithLogitsLoss, the training-time route"]],
how: ["Write down the cost of each error in the same units.", "On validation data, compute the cost per part at each candidate threshold.", "Pick the minimum, ties to the smallest threshold.", "Compare with τ* = (false alarm cost)/(sum of both costs) as a sanity check.", "Freeze the threshold and report its cost on the test set once."],
say: String.raw`When errors have different costs, the decision threshold is chosen to minimize the expected cost on validation data, and for calibrated probabilities the optimum is the false positive cost divided by the sum of the two costs.`,
num: String.raw`Miss cost 5, false alarm cost 1: the scan picks τ = <b>0.15</b> with TP 72, FP 68, FN 12, TN 248, cost <b>0.3200</b>, against 0.5525 at τ = 0.5 (FN 42, FP 11). τ* = 1/6 = 0.1667. Miss costs 1, 2, 10, 20 give τ = 0.35, 0.30, 0.10, 0.05. Weighted training: bias −2.4131 becomes −0.7070, a shift of 1.7060 against log 5 = 1.6094, and at 0.5 it scores TP 71, FP 61, cost 0.3150, the plain model at 1/6 scores TP 70, FP 61, cost 0.3275. The two rules disagree on <b>1</b> of 400 parts.`,
note: String.raw`HW9 3C's chosen threshold was 0.35 with validation cost 0.185 against 0.280 at 0.5. The minimum of 19 tries on 200 rows is optimistic: some of its advantage is luck on those rows, which is why 3D opens the test set only once.`,
r(fig, ctl) {
  ctl.innerHTML = btns([[0, "Scan thresholds on validation"], [1, "Weight the loss instead"]], "csm") + sl("csc", "cost of a missed defect", 1, 20, 1, 5) + `<div id="cso"></div>`;
  let md = 0;
  const u = () => {
    pick(ctl, "csm", md); const cfn = +$("csc").value; $("cscv").textContent = cfn + " units";
    if (md) {
      const rows = [["plain model, τ = 0.5", PV, 0.5], ["plain model, scan τ = 0.15", PV, 0.15], ["plain model, τ* = 1/6", PV, 1 / 6], ["defects weighted 5, τ = 0.5", PW, 0.5]];
      const a = ML.axes(60, 14, 220, 200, { xmin: 0, xmax: 1, ymin: 0, ymax: 1, nx: 5, ny: 5, fx: v => v.toFixed(1), fy: v => v.toFixed(1), xl: "plain model p", yl: "weighted model p", grid: false });
      let s = a.s, dis = 0;
      PV.forEach((p, i) => { const d = (p >= 1 / 6) !== (PW[i] >= 0.5); if (d) dis++; s += `<circle cx="${a.X(p).toFixed(1)}" cy="${a.Y(PW[i]).toFixed(1)}" r="${d ? 4 : 2.6}" fill="${d ? C.coral : yv[i] ? C.teal : C.gray}" opacity="${d ? 0.95 : 0.55}"/>`; });
      s += `<line x1="${a.X(1 / 6)}" y1="${a.Y(0)}" x2="${a.X(1 / 6)}" y2="${a.Y(1)}" stroke="${C.blue}" stroke-width="1.4" stroke-dasharray="5 3"/><line x1="${a.X(0)}" y1="${a.Y(0.5)}" x2="${a.X(1)}" y2="${a.Y(0.5)}" stroke="${C.purple}" stroke-width="1.4" stroke-dasharray="5 3"/>`;
      s += txc(320, 34, "plain: bias −2.4131, flag at p ≥ 1/6", C.blue) + txc(320, 56, "weighted 5: bias −0.7070, flag at 0.5", C.purple) + tx(320, 86, "bias shift 1.7060, close to log 5 = 1.6094", null, "t") + tx(320, 116, "each dot is one validation part") + tx(320, 136, "teal: defect, gray: acceptable") + txc(320, 162, "coral: the two rules disagree, " + dis + (dis === 1 ? " part" : " parts"), C.coral) + tx(320, 194, "same decisions, but the weighted model's") + tx(320, 212, "probabilities are no longer calibrated (card 10)");
      fig.innerHTML = svg(262, s) + TB(["rule", "TP", "FP", "FN", "TN", "recall", "precision", "cost"], rows.map(([n, p, t]) => { const m = conf(yv, p, t); return [n, m.tp, m.fp, m.fn, m.tn, f(m.rec, 4), f(m.prec, 4), f((5 * m.fn + m.fp) / 400, 4)]; }));
      $("cso").innerHTML = RO([["bias shift", "1.7060"], ["log 5", "1.6094"]]);
      return;
    }
    const cs = G19.map(t => costAt(yv, PV, t, cfn, 1)), b = scan(yv, PV, cfn, 1), ts = 1 / (1 + cfn), m = conf(yv, PV, b.t), c5 = costAt(yv, PV, 0.5, cfn, 1);
    const top = Math.max(0.4, Math.ceil(Math.max(...cs) * 5) / 5);
    const a = ML.axes(60, 14, 360, 220, { xmin: 0, xmax: 1, ymin: 0, ymax: top, nx: 5, ny: 4, fx: v => v.toFixed(1), fy: v => v.toFixed(2), xl: "threshold τ", yl: "cost per part", grid: false });
    let s = a.s + ML.path(G19.map((t, i) => [a.X(t), a.Y(cs[i])]), C.blue, 2) + G19.map((t, i) => `<circle cx="${a.X(t)}" cy="${a.Y(cs[i])}" r="3.2" fill="${C.blue}"/>`).join("");
    s += `<line x1="${a.X(ts)}" y1="14" x2="${a.X(ts)}" y2="234" stroke="${C.purple}" stroke-width="1.6" stroke-dasharray="5 4"/>` + `<circle cx="${a.X(b.t)}" cy="${a.Y(b.c)}" r="7" fill="none" stroke="${C.teal}" stroke-width="2.4"/>` + `<circle cx="${a.X(0.5)}" cy="${a.Y(c5)}" r="5" fill="${C.coral}"/>`;
    s += txc(450, 34, "scan minimum: τ = " + f(b.t, 2), C.teal) + tx(450, 56, "cost " + f(b.c, 4) + " per part") + tx(450, 76, "FN " + m.fn + ", FP " + m.fp) + txc(450, 110, "τ* = 1/(1 + " + cfn + ") = " + f(ts, 4), C.purple) + txc(450, 144, "τ = 0.5: cost " + f(c5, 4), C.coral) + tx(450, 178, "cost = (" + cfn + " FN + FP) / 400", null, "t");
    fig.innerHTML = svg(270, s);
    $("cso").innerHTML = RO([["chosen τ", f(b.t, 2)], ["cost there", f(b.c, 4)], ["cost at 0.5", f(c5, 4)], ["τ*", f(ts, 4)]]);
  };
  $("csc").oninput = u; ctl.querySelectorAll("button[data-csm]").forEach(b => b.onclick = () => { md = +b.dataset.csm; u(); });
  u();
}},

{s: "7. ROC curve", t: "The ROC curve: every threshold in one picture",
intu: String.raw`Each threshold gives one pair (FPR, recall). Sweep τ from above the largest score down to below the smallest and the pairs trace the receiver operating characteristic curve, from (0, 0) where nothing is flagged to (1, 1) where everything is. Recall is also called the true positive rate, so the curve plots TPR against FPR. A useless model that flags at random walks the diagonal, a perfect one goes straight up to (0, 1) and across. Slide the threshold and the point runs along the curve: 0.5 sits low on the left, the cost-chosen 0.15 sits higher and further right. The area under the curve, AUC, summarizes the whole curve in one number, 0.8877 here. Changing τ moves the point but never changes the curve or its area, because the curve already contains every threshold.`,
eq: String.raw`\[ \text{TPR}(\tau) = \frac{TP(\tau)}{N_1}, \qquad \text{FPR}(\tau) = \frac{FP(\tau)}{N_0} \]
\[ \text{AUC} = \int_0^1 \text{TPR} \; d(\text{FPR}) \]`,
sym: [["TPR", "true positive rate, the same as recall"], ["FPR", "false positive rate, 1 − specificity"], ["ROC", "receiver operating characteristic, TPR against FPR over all thresholds"], ["AUC", "area under the ROC curve, 0.5 for random ranking, 1 for perfect"], ["diagonal", "the curve of a classifier that ignores its input"]],
how: ["Sort the validation examples by score, largest first.", "Lower the threshold past each distinct score.", "After each step record FPR and TPR.", "Join the points from (0, 0) to (1, 1).", "Integrate with the trapezoid rule to get the AUC."],
say: String.raw`The ROC curve plots the true positive rate against the false positive rate as the threshold sweeps all values, and its area, the AUC, summarizes how well the scores rank positives above negatives independently of any single threshold.`,
num: String.raw`Validation AUC = <b>0.8877</b>. τ = 0.5: TPR 0.5000, FPR 0.0348. τ = 0.15: TPR 0.8571, FPR 0.2152. The curve has one step per distinct score, 319 of them for 400 parts.`,
note: String.raw`HW9 3C reports ROC-AUC 0.917 on validation from <code>roc_auc_score(y, prob)</code>, the continuous probabilities, never the 0 or 1 predictions. On the test rows it was 0.799, a reminder that one AUC from 200 rows is itself noisy.`,
r(fig, ctl) {
  const R = curve(yv, PV);
  ctl.innerHTML = sl("roct", "threshold τ", 0.01, 0.99, 0.01, 0.5) + `<div id="roco"></div>`;
  const u = () => {
    const t = +$("roct").value; $("roctv").textContent = f(t, 2);
    const m = conf(yv, PV, t), a = ML.axes(60, 14, 260, 260, { xmin: 0, xmax: 1, ymin: 0, ymax: 1, nx: 5, ny: 5, fx: v => v.toFixed(1), fy: v => v.toFixed(1), xl: "false positive rate", yl: "true positive rate (recall)", grid: false });
    let s = `<path d="M${a.X(0)} ${a.Y(0)}${R.pts.map(p => `L${a.X(p[0]).toFixed(1)} ${a.Y(p[1]).toFixed(1)}`).join("")}L${a.X(1)} ${a.Y(0)}Z" fill="${C.teal}" opacity="0.12"/>` + a.s;
    s += `<line x1="${a.X(0)}" y1="${a.Y(0)}" x2="${a.X(1)}" y2="${a.Y(1)}" stroke="${C.gray}" stroke-dasharray="5 4"/>` + ML.path(R.pts.map(p => [a.X(p[0]), a.Y(p[1])]), C.teal, 2.4);
    [[0.5, "0.5"], [0.15, "0.15"]].forEach(([tt, lab]) => { const q = conf(yv, PV, tt); s += `<circle cx="${a.X(q.fpr)}" cy="${a.Y(q.rec)}" r="4" fill="${C.purple}"/>` + tx(a.X(q.fpr) + 8, a.Y(q.rec) + 14, "τ = " + lab); });
    s += `<circle cx="${a.X(m.fpr)}" cy="${a.Y(m.rec)}" r="7" fill="${C.coral}" stroke="#fff" stroke-width="1.5"/>`;
    s += tx(380, 34, "AUC = " + f(R.auc, 4), null, "th") + tx(380, 58, "shaded area under the curve") + tx(380, 92, "your threshold τ = " + f(t, 2), null, "t") + tx(380, 114, "TPR = " + m.tp + "/84 = " + f(m.rec, 4)) + tx(380, 134, "FPR = " + m.fp + "/316 = " + f(m.fpr, 4)) + tx(380, 168, "dashed diagonal: random flags, AUC 0.5") + tx(380, 188, "corner (0, 1): perfect ranking, AUC 1") + tx(380, 222, "moving τ moves the dot,", null, "t") + tx(380, 242, "the curve and its area stay put", null, "t");
    fig.innerHTML = svg(310, s);
    $("roco").innerHTML = RO([["TPR", f(m.rec, 4)], ["FPR", f(m.fpr, 4)], ["AUC", f(R.auc, 4)]]);
  };
  $("roct").oninput = u; u();
}},

{s: "8. What AUC means", t: "What AUC measures: correctly ordered pairs",
intu: String.raw`Pick one defect and one acceptable part at random. AUC is the probability that the model gives the defect the higher score, with a tie counting one half. The strips show the 84 defect scores above the 316 acceptable scores, and the counter checks all 84 × 316 = 26,544 pairs: 23,556 in the right order, 16 tied, 2,972 wrong, so AUC = 0.8877, the same area as card 7. Draw random pairs to see it. Two consequences follow. Any transformation that keeps the order of the scores keeps the AUC: logits, probabilities and squared probabilities all give 0.8877. Hard 0 or 1 predictions throw the order away. Every flagged part ties with every other flagged part, the ROC curve collapses to one corner, and the AUC falls to the average of recall and specificity at that threshold, 0.7326 at 0.5. That is the HW9 3C trap.`,
eq: String.raw`\[ \text{AUC} = P(s^+ \gt s^-) + \tfrac{1}{2} P(s^+ = s^-) \]
\[ \text{hard predictions: AUC} = \tfrac{1}{2}(\text{recall} + \text{specificity}) \]`,
sym: [[String.raw`\(s^+, s^-\)`, "score of a random positive and of a random negative"], ["pair", "one positive and one negative, 84 × 316 of them here"], ["tie", "equal scores, counted as half a correct pair"], ["monotone transform", "any change of scores that keeps their order, for example σ, log or squaring a positive score"], ["Mann-Whitney U", "the rank statistic AUC equals after dividing by the number of pairs"]],
how: ["Split the scores into positives and negatives.", "Compare every positive with every negative.", "Count wins as 1 and ties as 1/2.", "Divide by the number of pairs.", "Always pass continuous scores, never thresholded labels."],
say: String.raw`The AUC equals the probability that a randomly chosen positive receives a higher score than a randomly chosen negative, so it measures ranking, is unchanged by any order-preserving transformation of the scores, and is degraded when scores are replaced by hard class predictions.`,
num: String.raw`26,544 pairs: <b>23,556</b> correct, <b>16</b> tied, <b>2,972</b> wrong, AUC (23,556 + 8)/26,544 = <b>0.8877</b>. Logits and squared probabilities: 0.8877. Hard labels at 0.5: (0.5 + 0.9652)/2 = <b>0.7326</b>. Hard labels at 0.15: (0.8571 + 0.7848)/2 = 0.8210.`,
note: String.raw`HW9 3C printed this effect: AUC 0.917 from the probabilities and 0.882 from hard predictions at 0.5. scikit-learn computes the hard version without complaint, so the check is yours: the second argument of roc_auc_score must be a score with many distinct values.`,
r(fig, ctl) {
  const MD = [["Logits", ZV], ["Probabilities squared", PV.map(p => p * p)], ["Hard labels at 0.5", PV.map(p => p >= 0.5 ? 1 : 0)], ["Hard labels at 0.15", PV.map(p => p >= 0.15 ? 1 : 0)]];
  const P1 = [], P0 = []; yv.forEach((v, i) => (v ? P1 : P0).push(i));
  ctl.innerHTML = btns(MD.map((m, i) => [i, m[0]]), "aum") + `<div class="row"><button id="aupr">Draw a random pair</button></div><div id="auo"></div>`;
  let md = 0, pr = null;
  const u = () => {
    pick(ctl, "aum", md); const sc = MD[md][1];
    let w = 0, t = 0, l = 0; P1.forEach(i => P0.forEach(j => { if (sc[i] > sc[j]) w++; else if (sc[i] === sc[j]) t++; else l++; }));
    const lo = Math.min(...sc), hi = Math.max(...sc), hard = md >= 2, x0 = hard ? -0.5 : Math.floor(lo), x1 = hard ? 1.5 : Math.ceil(hi), stp = x1 - x0 > 5 ? 2 : 0.2;
    const X = v => 60 + (v - x0) / (x1 - x0) * 560, jit = i => ((i * 37) % 23) / 23;
    let s = tx(20, 30, "defects", null, "th") + tx(20, 140, "acceptable", null, "th");
    P1.forEach((i, k) => { const xx = hard ? X(sc[i]) + (jit(i) - 0.5) * 120 : X(sc[i]); s += `<circle cx="${xx.toFixed(1)}" cy="${(46 + jit(k * 7 + 3) * 50).toFixed(1)}" r="3.2" fill="${C.coral}" opacity="0.65"/>`; });
    P0.forEach((i, k) => { const xx = hard ? X(sc[i]) + (jit(i) - 0.5) * 120 : X(sc[i]); s += `<circle cx="${xx.toFixed(1)}" cy="${(156 + jit(k * 7 + 3) * 50).toFixed(1)}" r="3.2" fill="${C.blue}" opacity="0.45"/>`; });
    s += `<line x1="60" y1="222" x2="620" y2="222" stroke="var(--p)"/>`;
    const ticks = hard ? [0, 1] : Array.from({ length: Math.floor((x1 - x0) / stp + 1e-9) + 1 }, (_, k) => x0 + k * stp);
    ticks.forEach(v => { s += `<line x1="${X(v)}" y1="222" x2="${X(v)}" y2="227" stroke="var(--p)"/>` + tx(X(v), 240, mn(hard ? v : +v.toFixed(2)), "middle"); });
    s += tx(340, 258, MD[md][0].toLowerCase() + (hard ? ", jittered sideways to show the stack" : ""), "middle");
    if (pr) { const [i, j] = pr, xi = hard ? X(sc[i]) : X(sc[i]), xj = hard ? X(sc[j]) : X(sc[j]); s += `<line x1="${xi}" y1="40" x2="${xj}" y2="210" stroke="var(--t)" stroke-width="1.6"/><circle cx="${xi}" cy="40" r="6" fill="none" stroke="var(--t)" stroke-width="2"/><circle cx="${xj}" cy="210" r="6" fill="none" stroke="var(--t)" stroke-width="2"/>`; }
    fig.innerHTML = svg(266, s);
    const verdict = pr ? (sc[pr[0]] > sc[pr[1]] ? "right order, the defect scores higher" : sc[pr[0]] === sc[pr[1]] ? "a tie, counts one half" : "wrong order") : "press the button";
    $("auo").innerHTML = RO([["correct pairs", w], ["tied", t], ["wrong", l], ["AUC", f((w + t / 2) / (w + t + l), 4)]]) + `<p class="note">Random pair: ${verdict}.</p>`;
  };
  ctl.querySelectorAll("button[data-aum]").forEach(b => b.onclick = () => { md = +b.dataset.aum; u(); });
  $("aupr").onclick = () => { pr = [P1[Math.floor(Math.random() * P1.length)], P0[Math.floor(Math.random() * P0.length)]]; u(); };
  u();
}},

{s: "9. Imbalance and PR", t: "Precision-recall curves: what imbalance does to the flagged list",
intu: String.raw`Keep the model and its scores, and change only how common defects are. The slider reweights the acceptable parts so the prevalence goes from 1% to 50%. The ROC curve on the left does not move: TPR is computed within the defects and FPR within the acceptable parts, so neither depends on how many of each there are. The precision-recall curve on the right moves a lot. At the same recall of 0.8, the flagged list is 58% defects when 21% of parts are defective, 21% at 5%, and under 5% at 1%, because every point of FPR now stands for many more acceptable parts. A model with a reassuring AUC of 0.8877 can still bury the inspector in false alarms when the class is rare. The dashed line is the precision of random flagging, which equals the prevalence, so the PR curve is always judged against that floor. Average precision summarizes it.`,
eq: String.raw`\[ \text{precision} = \frac{\text{TPR}\, \pi}{\text{TPR}\, \pi + \text{FPR}\,(1 - \pi)} \]
\[ \text{AP} = \sum_k (R_k - R_{k-1}) P_k \]`,
sym: [[String.raw`\(\pi\)`, "prevalence of the positive class"], ["PR curve", "precision against recall over all thresholds"], ["AP", "average precision, recall steps weighted by the precision there"], ["baseline", "random flagging has precision π at every recall"], ["ROC invariance", "TPR and FPR are rates within each class, so the prevalence cancels"]],
how: ["Plot ROC and PR curves from the same validation scores.", "Mark the prevalence line on the PR plot.", "Read the precision at the recall the task needs.", "If deployment prevalence differs from validation, recompute precision with the formula above.", "Report AP beside AUC on imbalanced problems."],
say: String.raw`ROC curves are invariant to class prevalence because TPR and FPR are computed within each class, whereas precision depends on prevalence, so on rare-positive problems the precision-recall curve and average precision show the cost of false alarms that the ROC curve hides.`,
num: String.raw`AUC stays <b>0.8877</b>. Best precision at recall at least 0.8: π = 0.5 gives 0.8365, π = 0.21 gives <b>0.5763</b>, π = 0.05 gives 0.2121, π = 0.01 gives <b>0.0491</b>. AP: 0.9019, <b>0.7646</b>, 0.5383, 0.3618.`,
note: String.raw`HW9 3C asks for both curves and says why: under imbalance the precision-recall view shows the positive class directly. Its AP was 0.909 on validation. scikit-learn's average_precision_score is the step sum above, not the trapezoid area under the plotted curve.`,
r(fig, ctl) {
  const n1 = 84, n0 = 316, R0 = curve(yv, PV);
  ctl.innerHTML = sl("prp", "defect prevalence", 1, 50, 1, 21) + `<div id="pro"></div>`;
  const u = () => {
    const pi = +$("prp").value / 100; $("prpv").textContent = $("prp").value + "%";
    const w0 = (1 - pi) / pi * n1 / n0, R = curve(yv, PV, w0);
    const a = ML.axes(70, 34, 230, 230, { xmin: 0, xmax: 1, ymin: 0, ymax: 1, nx: 4, ny: 4, fx: v => v.toFixed(2), fy: v => v.toFixed(2), xl: "FPR", yl: "TPR", grid: false });
    const b = ML.axes(410, 34, 230, 230, { xmin: 0, xmax: 1, ymin: 0, ymax: 1, nx: 4, ny: 4, fx: v => v.toFixed(2), fy: v => v.toFixed(2), xl: "recall", yl: "precision", grid: false });
    let s = a.s + `<line x1="${a.X(0)}" y1="${a.Y(0)}" x2="${a.X(1)}" y2="${a.Y(1)}" stroke="${C.gray}" stroke-dasharray="5 4"/>` + ML.path(R0.pts.map(p => [a.X(p[0]), a.Y(p[1])]), C.teal, 2.2);
    const pr = R.pts.slice(1).map(p => [p[1], p[3] / (p[3] + w0 * p[4])]);
    s += b.s + `<line x1="${b.X(0)}" y1="${b.Y(pi)}" x2="${b.X(1)}" y2="${b.Y(pi)}" stroke="${C.gray}" stroke-dasharray="5 4"/>` + tx(b.X(0) + 4, b.Y(pi) - 5, "random: " + f(pi, 2)) + ML.path([[b.X(0), b.Y(pr[0][1])], ...pr.map(p => [b.X(p[0]), b.Y(p[1])])], C.coral, 2.2);
    let best = 0; R.pts.forEach(p => { if (p[3] / n1 >= 0.8) best = Math.max(best, p[3] / (p[3] + w0 * p[4])); });
    s += `<line x1="${b.X(0.8)}" y1="${b.Y(0)}" x2="${b.X(0.8)}" y2="${b.Y(1)}" stroke="var(--t)" stroke-width="1" stroke-dasharray="2 3"/><circle cx="${b.X(0.8)}" cy="${b.Y(best)}" r="5" fill="${C.coral}"/>`;
    s += txc(a.X(0.5), 20, "ROC, AUC " + f(R0.auc, 4), C.teal, "middle") + txc(b.X(0.5), 20, "PR, AP " + f(R.ap, 4), C.coral, "middle");
    fig.innerHTML = svg(312, s);
    const m = conf(yv, PV, 0.5);
    $("pro").innerHTML = RO([["AUC", f(R0.auc, 4)], ["AP", f(R.ap, 4)], ["precision at recall ≥ 0.8", f(best, 4)], ["precision at τ = 0.5", f(m.tp / (m.tp + w0 * m.fp), 4)]]);
  };
  $("prp").oninput = u; u();
}},

{s: "10. Calibration", t: "Calibration: is a predicted 0.7 right 70% of the time?",
intu: String.raw`Ranking is one question, honesty of the probabilities is another. Sort the validation parts into ten bins by predicted probability and compare, in each bin, the mean prediction with the fraction that were really defects. A calibrated model puts the dots on the diagonal. The logistic model is close: its expected calibration error, the size-weighted gap, is 0.0283. Now multiply every logit by a scale s. At s = 3 the model is overconfident, probabilities pushed toward 0 and 1, and at s = 0.5 it is underconfident. The order of the scores never changes, so the AUC stays 0.8877, while the ECE, the log loss and the Brier score all get worse. Fitting s on validation by minimum log loss is temperature scaling, here s = 0.88. The model trained with defects weighted 5 times ranks just as well but predicts 0.37 on average for a 21% defect rate: weighting buys recall at the price of honest probabilities. The cost threshold of card 6 assumes calibration.`,
eq: String.raw`\[ \text{ECE} = \sum_{b} \frac{n_b}{N}\, \bigl|\, \bar{p}_b - \bar{y}_b \,\bigr| \]
\[ \text{Brier} = \frac{1}{N}\sum_i (p_i - y_i)^2, \qquad p_i = \sigma(s\, z_i) \]`,
sym: [["reliability diagram", "mean predicted probability against observed frequency, bin by bin"], [String.raw`\(\bar{p}_b, \bar{y}_b\)`, "mean prediction and fraction of positives in bin b"], ["ECE", "expected calibration error, the size-weighted mean gap"], ["Brier score", "mean squared error of the probabilities"], [String.raw`\(s\)`, "logit scale, 1/T in temperature scaling"], ["calibrated", "among parts given p, a fraction p are positive"]],
how: ["Bin the validation probabilities, 10 equal-width bins.", "In each bin compare the mean p with the fraction of positives.", "Compute ECE, log loss and Brier score.", "If the dots sit off the diagonal, fit a temperature on validation data.", "Recheck on data the temperature never saw."],
say: String.raw`A classifier is calibrated when, among examples given probability p, a fraction p are positive, which a reliability diagram and the expected calibration error check, and rescaling the logits changes calibration without changing the ranking or the AUC.`,
num: String.raw`s = 1: ECE <b>0.0283</b>, log loss 0.3199, Brier 0.0936. s = 3: ECE 0.1066, log loss <b>0.5871</b>, Brier 0.1109. s = 0.5: 0.0996, 0.3553, 0.1042. Best s on validation 0.88, log loss 0.3174. Weighted model: mean p <b>0.3708</b> against prevalence 0.21, ECE 0.1608. AUC 0.8877 in every case.`,
note: String.raw`HW9 2A makes the point in words: adding 10 to every logit changes nothing, and that says nothing about calibration. HW9 4D adds that a confident softmax can be wrong, a 3 read as 2 with p = 0.99. Check calibration before quoting a probability to anyone.`,
r(fig, ctl) {
  ctl.innerHTML = btns([[0, "Plain model"], [1, "Defects weighted 5"]], "clm") + btns([["1", "s = 1"], ["3", "s = 3, overconfident"], ["0.5", "s = 0.5, underconfident"], ["fit", "Fit s on validation"]], "cls") + sl("clsc", "logit scale s", 0.25, 4, 0.01, 1) + `<div id="clo"></div>`;
  let md = 0;
  const ll = (Z, s) => Z.reduce((a, z, i) => a + bceZ(s * z, yv[i]), 0) / Z.length;
  const u = () => {
    pick(ctl, "clm", md); const s = +$("clsc").value; $("clscv").textContent = f(s, 2);
    const Z = md ? ZW : ZV, p = Z.map(z => sig(s * z)), nb = 10, B = Array.from({ length: nb }, () => [0, 0, 0]);
    p.forEach((v, i) => { const k = Math.min(nb - 1, Math.floor(v * nb)); B[k][0]++; B[k][1] += v; B[k][2] += yv[i]; });
    let ece = 0; B.forEach(b => { if (b[0]) ece += b[0] / p.length * Math.abs(b[1] / b[0] - b[2] / b[0]); });
    const br = p.reduce((a, v, i) => a + (v - yv[i]) ** 2, 0) / p.length, mp = p.reduce((a, v) => a + v, 0) / p.length;
    const a = ML.axes(60, 14, 250, 250, { xmin: 0, xmax: 1, ymin: 0, ymax: 1, nx: 5, ny: 5, fx: v => v.toFixed(1), fy: v => v.toFixed(1), xl: "mean predicted probability", yl: "fraction defective", grid: false });
    let sv = a.s + `<line x1="${a.X(0)}" y1="${a.Y(0)}" x2="${a.X(1)}" y2="${a.Y(1)}" stroke="${C.gray}" stroke-dasharray="5 4"/>`;
    const pts = B.map(b => b[0] ? [b[1] / b[0], b[2] / b[0], b[0]] : null).filter(Boolean);
    sv += ML.path(pts.map(q => [a.X(q[0]), a.Y(q[1])]), C.coral, 1.6);
    pts.forEach(q => { sv += `<line x1="${a.X(q[0])}" y1="${a.Y(q[0])}" x2="${a.X(q[0])}" y2="${a.Y(q[1])}" stroke="${C.coral}" stroke-width="1" opacity="0.6"/><circle cx="${a.X(q[0])}" cy="${a.Y(q[1])}" r="${(3 + 0.6 * Math.sqrt(q[2])).toFixed(1)}" fill="${C.coral}" opacity="0.55"/>`; });
    const h = ML.axes(400, 14, 250, 110, { xmin: 0, xmax: 1, ymin: 0, ymax: 300, nx: 5, ny: 3, fx: v => v.toFixed(1), fy: v => v, xl: "predicted probability bin", yl: "parts", grid: false });
    sv += h.s + B.map((b, k) => `<rect x="${(h.X(k / nb) + 2).toFixed(1)}" y="${h.Y(Math.min(300, b[0])).toFixed(1)}" width="${(h.X(0.1) - h.X(0) - 4).toFixed(1)}" height="${(h.Y(0) - h.Y(Math.min(300, b[0]))).toFixed(1)}" fill="${C.blue}" opacity="0.55"/>` + (b[0] ? tx(h.X((k + 0.5) / nb), h.Y(Math.min(300, b[0])) - 3, b[0], "middle") : "")).join("");
    sv += tx(400, 186, md ? "defects weighted 5 in the loss" : "plain logistic regression", null, "th") + tx(400, 208, "dot size: parts in the bin") + tx(400, 228, "below the diagonal: predictions too high") + tx(400, 248, "mean p " + f(mp, 4) + ", prevalence 0.2100", null, "t");
    fig.innerHTML = svg(306, sv);
    $("clo").innerHTML = RO([["ECE", f(ece, 4)], ["log loss", f(ll(Z, s), 4)], ["Brier", f(br, 4)], ["AUC", f(curve(yv, p).auc, 4)]]);
  };
  $("clsc").oninput = u;
  ctl.querySelectorAll("button[data-clm]").forEach(b => b.onclick = () => { md = +b.dataset.clm; u(); });
  ctl.querySelectorAll("button[data-cls]").forEach(b => b.onclick = () => {
    if (b.dataset.cls === "fit") { const Z = md ? ZW : ZV; let bs = 1, bl = Infinity; for (let k = 25; k <= 400; k++) { const v = ll(Z, k / 100); if (v < bl - 1e-12) { bl = v; bs = k / 100; } } $("clsc").value = bs; }
    else $("clsc").value = b.dataset.cls;
    u();
  });
  u();
}},

{s: "11. Many classes", t: "Many classes: per-class precision, recall and the averages",
intu: String.raw`With C classes the confusion matrix is C by C, still true classes on the rows and predictions on the columns, and HW10 B4 builds exactly this. Every class gets its own precision, its diagonal over its column, and its own recall, its diagonal over its row. Click a class. In this fresh four-class inspection set, good parts are 300 of 400 and cracks only 10, and the model is 90% accurate overall while it recognizes only 4 of the 10 cracks. Accuracy is the micro average, dominated by the big class. The macro average gives every class one vote, so the weak crack class pulls macro-F1 down to 0.7164. Now try the lazy model that calls everything good. Its accuracy is still 0.75, and its macro-F1 collapses to 0.2143 because three classes score 0. The largest off-diagonal cell, scratches read as good, tells you where to look first.`,
eq: String.raw`\[ \text{recall}_c = \frac{M_{cc}}{\sum_j M_{cj}}, \qquad \text{precision}_c = \frac{M_{cc}}{\sum_i M_{ic}} \]
\[ \text{macro-}F_1 = \frac{1}{C}\sum_c F_{1,c}, \qquad \text{micro-}F_1 = \text{accuracy} \]`,
sym: [[String.raw`\(M_{ij}\)`, "number of examples of true class i predicted as class j"], ["row total", "support of the class, its number of true examples"], ["macro average", "mean over classes, each class weighs the same"], ["weighted average", "mean over classes weighted by support"], ["micro average", "pool all counts first, equal to accuracy for one label per example"], ["empty row", "recall undefined, HW10 B4 returns nan"]],
how: ["Build the C by C matrix with true classes on the rows.", "Recall of class c: diagonal over its row total.", "Precision of class c: diagonal over its column total.", "Report the per-class table, the macro average and the accuracy.", "Find the largest off-diagonal cell and look at those examples."],
say: String.raw`For C classes the confusion matrix gives each class a recall, its diagonal entry over its row total, and a precision, its diagonal entry over its column total, and the macro average weighs every class equally, so it exposes a weak small class that accuracy hides.`,
num: String.raw`Recall (good, scratch, dent, crack) = (0.9700, 0.7833, 0.6000, <b>0.4000</b>), precision (0.9417, 0.8103, 0.6923, 0.5714). Accuracy <b>0.9000</b>, macro-F1 <b>0.7164</b>, weighted F1 0.8962. Largest error: 8 scratches read as good. Always good: accuracy 0.7500, macro-F1 <b>0.2143</b>.`,
note: String.raw`HW10 B4: 92.6% validation accuracy held per-class recall from 88% to 100%, and on the 500 held-out images the 7s were recognized only 78% of the time inside 89.6% overall. HW9 4D found 5 the weakest digit at recall 0.827 with 5 read as 3 most often.`,
r(fig, ctl) {
  const LZ = [[300, 0, 0, 0], [60, 0, 0, 0], [30, 0, 0, 0], [10, 0, 0, 0]];
  ctl.innerHTML = btns([[0, "Model"], [1, "Always predict good"]], "mcm") + btns(K4.map((k, i) => [i, k]), "mcc") + `<div id="mco"></div>`;
  let md = 0, c = 3;
  const u = () => {
    pick(ctl, "mcm", md); pick(ctl, "mcc", c); const M = md ? LZ : CM4, K = M.length, N = 400;
    const row = M.map(r => r.reduce((a, b) => a + b, 0)), col = M[0].map((_, j) => M.reduce((a, r) => a + r[j], 0));
    const rec = M.map((r, i) => r[i] / row[i]), pre = M.map((r, i) => col[i] ? r[i] / col[i] : 0), F = rec.map((r, i) => pre[i] + r ? 2 * pre[i] * r / (pre[i] + r) : 0);
    const acc = M.reduce((a, r, i) => a + r[i], 0) / N, mf = F.reduce((a, b) => a + b, 0) / K, wf = F.reduce((a, v, i) => a + v * row[i], 0) / N;
    const x0 = 130, y0 = 50, cw = 64;
    let s = tx(x0 + 2 * cw, 20, "predicted class", "middle", "th") + tx(30, y0 + 2 * cw, "true class", "middle", "th").replace("<text", `<text transform="rotate(-90 30 ${y0 + 2 * cw})"`);
    K4.forEach((k, j) => { s += tx(x0 + j * cw + cw / 2, y0 - 8, k, "middle", j === c ? "th" : "ts") + tx(x0 - 8, y0 + j * cw + cw / 2 + 4, k, "end", j === c ? "th" : "ts"); });
    M.forEach((r, i) => r.forEach((v, j) => {
      const inRow = i === c, inCol = j === c, op = v ? 0.12 + 0.75 * Math.log1p(v) / Math.log1p(300) : 0.04;
      s += `<rect x="${x0 + j * cw}" y="${y0 + i * cw}" width="${cw - 4}" height="${cw - 4}" rx="6" fill="${i === j ? C.teal : C.coral}" opacity="${op.toFixed(2)}"/>`;
      if (inRow || inCol) s += `<rect x="${x0 + j * cw}" y="${y0 + i * cw}" width="${cw - 4}" height="${cw - 4}" rx="6" fill="none" stroke="${inRow && inCol ? "var(--t)" : inRow ? C.coral : C.blue}" stroke-width="2.2"${inRow && inCol ? "" : ` stroke-dasharray="5 3"`}/>`;
      s += tx(x0 + j * cw + cw / 2 - 2, y0 + i * cw + cw / 2 + 3, v, "middle", "th");
    }));
    s += txc(410, 60, "class " + K4[c], "var(--t)") + txc(410, 88, "recall = " + M[c][c] + " / " + row[c] + " = " + f(rec[c], 4), C.coral) + tx(410, 106, "its row, coral dashes") + txc(410, 134, "precision = " + M[c][c] + " / " + col[c] + " = " + f(pre[c], 4), C.blue) + tx(410, 152, col[c] ? "its column, blue dashes" : "empty column, reported as 0") + tx(410, 186, "accuracy (micro) " + f(acc, 4), null, "t") + tx(410, 206, "macro-F1 " + f(mf, 4), null, "t") + tx(410, 226, "weighted F1 " + f(wf, 4));
    fig.innerHTML = svg(320, s) + TB(["class", "support", "precision", "recall", "F1"], K4.map((k, i) => [k, row[i], f(pre[i], 4), f(rec[i], 4), f(F[i], 4)]));
    $("mco").innerHTML = RO([["accuracy", f(acc, 4)], ["macro-F1", f(mf, 4)], ["weighted F1", f(wf, 4)], ["recall of " + K4[c], f(rec[c], 4)]]);
  };
  ctl.querySelectorAll("button[data-mcm]").forEach(b => b.onclick = () => { md = +b.dataset.mcm; u(); });
  ctl.querySelectorAll("button[data-mcc]").forEach(b => b.onclick = () => { c = +b.dataset.mcc; u(); });
  u();
}},

{s: "12. Test once", t: "Freeze the procedure, open the test set once, add an error bar",
intu: String.raw`Everything so far used validation data: the model, the threshold 0.15 from the cost scan, the comparator 0.5 declared in advance. HW9 3D now freezes the whole procedure and evaluates it on the test parts exactly once. Press the button. Here the test cost at the frozen threshold is 0.3150 against 0.3200 on validation, and the declared comparator 0.5 costs 0.4775. In HW9 the test cost doubled instead. Both are normal, because a cost from 400 parts with 84 defects is a noisy number. The right panel puts an error bar on recall: with 84 defects, a measured recall of 0.85 is only known to about ±0.08. Slide the number of test defects to see how many you would need for a tighter claim. Whatever the test says, it may not be used to retune: a new choice needs new data.`,
eq: String.raw`\[ \hat{r} = \frac{TP}{N_1}, \qquad \text{SE}(\hat{r}) \approx \sqrt{\frac{\hat{r}(1 - \hat{r})}{N_1}} \]
\[ \text{95\% interval} \approx \hat{r} \pm 1.96\, \text{SE} \]`,
sym: [["frozen procedure", "model, preprocessing, threshold and comparator fixed before the test"], [String.raw`\(N_1\)`, "number of positives in the test set, the sample size for recall"], ["SE", "standard error of a proportion"], ["Wilson interval", "the score interval the card draws, it stays inside 0 to 1"], ["optimism", "a minimum over many validation choices is biased low"]],
how: ["Fix the model, the threshold and any comparator using validation data only.", "Run the test set once.", "Report counts, recall, precision, cost, AUC and AP.", "Put an interval on each rate, sized by the class count.", "Do not retune after looking. A new choice needs fresh data."],
say: String.raw`The test set is evaluated once on a procedure frozen with validation data, the result is reported with an uncertainty set by the number of examples in the relevant class, and any change made after seeing it requires new held-out data.`,
num: String.raw`Validation at 0.15: cost 0.3200, recall 72/84 = 0.8571, interval (0.7667, 0.9164). Test at 0.15: TP 71, FP 61, FN 13, TN 255, cost <b>0.3150</b>, recall 0.8452, interval (0.7530, 0.9073). Test at 0.5: cost <b>0.4775</b>. Test AUC 0.9142, AP 0.8160. Interval width at recall 0.85: 0.4234 with 10 defects, <b>0.1525</b> with 84, 0.0626 with 500.`,
note: String.raw`HW9 3D's frozen 0.35 cost 0.370 on test against 0.185 on validation, while the comparator 0.5 cost 0.355. The solutions doc keeps 0.35 anyway: switching after seeing the test turns it into development data. Say this in the project report.`,
r(fig, ctl) {
  ctl.innerHTML = `<div class="row"><button id="tsop">Open the test set once</button><button id="tsrs">Reset the demo</button></div>` + sl("tsn", "defects in a test set", 10, 1000, 1, 84) + `<div id="tso"></div>`;
  let open = false;
  const u = () => {
    const n = +$("tsn").value; $("tsnv").textContent = n; $("tsop").disabled = open;
    const V = conf(yv, PV, 0.15), V5 = conf(yv, PV, 0.5), T = conf(yt, PT, 0.15), T5 = conf(yt, PT, 0.5), cst = m => (5 * m.fn + m.fp) / 400;
    const a = ML.axes(60, 20, 260, 200, { xmin: 0, xmax: 4, ymin: 0, ymax: 0.6, nx: 4, ny: 3, fx: () => "", fy: v => v.toFixed(2), yl: "cost per part", grid: false });
    let s = a.s;
    [["validation", 0.15, cst(V), true], ["validation", 0.5, cst(V5), true], ["test", 0.15, cst(T), open], ["test", 0.5, cst(T5), open]].forEach(([nm, t, c, show], k) => {
      const x = a.X(k + 0.2), w = a.X(0.6) - a.X(0), col = t === 0.15 ? C.teal : C.coral;
      if (show) s += `<rect x="${x}" y="${a.Y(c)}" width="${w}" height="${a.Y(0) - a.Y(c)}" rx="3" fill="${col}" opacity="${nm === "test" ? 0.9 : 0.5}"/>` + tx(x + w / 2, a.Y(c) - 5, f(c, 4), "middle");
      else s += `<rect x="${x}" y="${a.Y(0.5)}" width="${w}" height="${a.Y(0) - a.Y(0.5)}" rx="3" fill="none" stroke="${C.gray}" stroke-dasharray="4 3"/>` + tx(x + w / 2, a.Y(0.25), "sealed", "middle");
      s += tx(x + w / 2, 236, nm, "middle") + tx(x + w / 2, 252, "τ = " + t, "middle");
    });
    const b = ML.axes(400, 20, 250, 200, { xmin: 0.5, xmax: 1, ymin: 0, ymax: 4, nx: 5, ny: 4, fx: v => v.toFixed(1), fy: () => "", xl: "recall", grid: false });
    s += b.s;
    const bar = (y, r, lohi, col, lab) => `<line x1="${b.X(lohi[0])}" y1="${b.Y(y)}" x2="${b.X(lohi[1])}" y2="${b.Y(y)}" stroke="${col}" stroke-width="3"/><circle cx="${b.X(r)}" cy="${b.Y(y)}" r="5" fill="${col}"/>` + tx(b.X(0.5) + 4, b.Y(y) - 8, lab);
    s += bar(3.2, V.rec, wilson(V.tp, 84), C.teal, "validation, 72 of 84");
    if (open) s += bar(2.2, T.rec, wilson(T.tp, 84), C.purple, "test, 71 of 84");
    const wn = wilson(0.85 * n, n); s += bar(1, 0.85, wn, C.coral, "recall 0.85 with " + n + " defects");
    fig.innerHTML = svg(266, s);
    $("tso").innerHTML = RO([["test cost at 0.15", open ? f(cst(T), 4) : "sealed"], ["test recall", open ? f(T.rec, 4) : "sealed"], ["interval width", f(wn[1] - wn[0], 4)]]);
  };
  $("tsop").onclick = () => { open = true; u(); }; $("tsrs").onclick = () => { open = false; u(); }; $("tsn").oninput = u;
  u();
}},

{s: "13. With the agent", t: "Do it with the agent: a metrics module you can trust",
intu: String.raw`The lesson as code: a NumPy module that counts the four outcomes, computes every ratio with the zero-denominator convention, counts pairs for AUC, sums steps for average precision, scans a cost grid for the threshold, bins probabilities for the ECE and builds the multiclass matrix with per-class recall. The tests pin the numbers on these cards and compare with scikit-learn, so a swapped row and column, a > instead of ≥, an AUC computed from labels or a recall divided by the column total fails with a value you can check by hand.`,
eq: String.raw`\[ \texttt{counts} \to \texttt{ratios} \to \texttt{roc\_auc} \to \texttt{threshold} \to \texttt{report} \]`,
sym: [[String.raw`\(\texttt{confusion\_counts}\)`, "tn, fp, fn, tp with p ≥ τ"], [String.raw`\(\texttt{binary\_metrics}\)`, "the six ratios, 0.0 for an empty denominator"], [String.raw`\(\texttt{roc\_auc}\)`, "correct pairs plus half the ties, over all pairs"], [String.raw`\(\texttt{choose\_threshold}\)`, "the grid value with the lowest validation cost, ties to the smallest"], [String.raw`\(\texttt{per\_class\_recall}\)`, "diagonal over row total, nan for an empty row"]],
how: ["Paste the command.", "Read the counting function: rows true, columns predicted, and ≥ at the threshold?", "Read the AUC function: does it take scores, and count ties as one half?", "Run the tests, the expected values come from the cards.", "Commit the module with its tests."],
say: String.raw`A classifier metrics module computes counts, ratios, ranking metrics, cost-based thresholds and per-class reports from scores and labels, and is tested against hand-computed values and against scikit-learn.`,
num: String.raw`Tests expect (tn, fp, fn, tp) = <b>(5, 2, 1, 4)</b> for card 2's twelve parts at 0.5 with F1 0.727273, AUC <b>0.828571</b> and AP 0.808333 for the same parts, (3, 2, 1, 2) for HW9 3A, and per-class recall (0.97, 0.783333, 0.6, 0.4) for card 11's matrix.`,
r(fig, ctl) {
  ML.agent(fig, ctl, {
    prompt: "Create src/clf_metrics.py using numpy only. Functions: confusion_counts(y, p, threshold) returning (tn, fp, fn, tp) with a part flagged when p >= threshold. binary_metrics(y, p, threshold) returning a dict with accuracy, precision, recall, specificity, fpr and f1, using 0.0 when a denominator is 0. roc_auc(y, scores) counting, over all positive-negative pairs, 1 when the positive scores higher and 0.5 for a tie, divided by the number of pairs. average_precision(y, scores) as the sum over distinct thresholds, highest first, of (R_k - R_{k-1}) * P_k. choose_threshold(y, p, c_fn, c_fp, grid) returning the grid value with the smallest (c_fn * FN + c_fp * FP) / N, ties to the smallest value. ece(y, p, n_bins=10) with equal-width bins. multiclass_confusion(y, yhat, C) with rows true and columns predicted, and per_class_recall(M) returning the diagonal over row totals and nan for an empty row. Create tests/test_clf_metrics.py with pytest: p = (0.95, 0.88, 0.81, 0.74, 0.66, 0.58, 0.47, 0.39, 0.31, 0.22, 0.15, 0.06) with y = (1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0) gives (5, 2, 1, 4) at 0.5, f1 close to 0.727273, roc_auc close to 0.828571 and average_precision close to 0.808333. p = (0.9, 0.8, 0.7, 0.6, 0.4, 0.3, 0.2, 0.1) with y = (1, 0, 1, 0, 0, 1, 0, 0) gives (3, 2, 1, 2). a part with p exactly 0.5 is flagged at threshold 0.5. nothing flagged gives precision 0.0. roc_auc and average_precision match sklearn on 300 random rows rounded to 1 decimal so there are ties. roc_auc of hard 0/1 predictions equals (recall + specificity)/2. per_class_recall of [[291, 5, 3, 1], [8, 47, 4, 1], [6, 5, 18, 1], [4, 1, 1, 4]] is close to (0.97, 0.783333, 0.6, 0.4), and an added empty class gives nan. Run pytest -q and paste the output.",
    actions: ["$ pytest -q", "........                                                 [100%]", "8 passed"],
    files: [["src/clf_metrics.py", "counts, ratios, roc_auc, average_precision, choose_threshold, ece, multiclass report"], ["tests/test_clf_metrics.py", "eight tests with the values from cards 2, 8, 11 and HW9 3A"]],
    checks: ["the threshold rule is p >= threshold, and a probability of exactly 0.5 is flagged", "rows of every confusion matrix are true classes and columns are predictions", "roc_auc and average_precision take continuous scores, the tests show what hard labels do", "empty denominators return 0.0 for the binary ratios and nan for an empty class row, and the report says which", "choose_threshold only ever sees validation data, and the test set is evaluated once in a separate script"]
  });
}},

{s: "14. Test", t: "Lesson 31 test: evaluating classifiers",
intu: String.raw`Twelve questions on counts and ratios, F1, skewed data, thresholds from costs, ROC and AUC, prevalence, calibration, per-class metrics and the test set. All numbers are new.`,
eq: String.raw`\[ \text{12 questions} \]`,
sym: [["pass mark", "9 of 12, then redo the missed cards"]],
how: ["Do the arithmetic on paper when a question has numbers.", "Answer without running anything.", "Reopen the named card for any miss."],
say: String.raw`Twelve questions covering the whole lesson.`,
num: String.raw`Score <b>9 or more</b> to move on to the multilayer perceptron.`,
r(fig, ctl) {
  ML.quiz(fig, ctl, [
    { q: "A classifier on 200 parts has TP = 30, FP = 10, FN = 20, TN = 140. Its precision is", o: ["0.60", "0.75", "0.80", "0.85"], a: 1, why: "TP/(TP + FP) = 30/40 = 0.75. Recall is 30/50 = 0.6 and accuracy 170/200 = 0.85. Card 3." },
    { q: "With the same counts, F1 is", o: ["0.6667", "0.6750", "0.7000", "0.8500"], a: 0, why: "2TP/(2TP + FP + FN) = 60/90 = 0.6667, the harmonic mean of 0.75 and 0.6. Card 5." },
    { q: "Only 2% of transactions are fraud. A rule that never flags anything has", o: ["accuracy 0.02 and recall 1", "accuracy 0.5 and recall 0.5", "accuracy 0.98 and recall 0", "accuracy 0.98 and precision 1"], a: 2, why: "It is right on every normal transaction and finds no fraud. Its precision is undefined, reported as 0. Card 1." },
    { q: "You raise the threshold from 0.5 to 0.8 on the same scores. Which must happen?", o: ["Recall stays the same or falls", "Precision falls", "Recall rises", "The AUC rises"], a: 0, why: "The flagged set can only shrink, so true positives can only drop. Precision usually rises but is not guaranteed, and the AUC does not depend on the threshold. Card 4." },
    { q: "A missed defect costs 9 units and a false alarm costs 1. For calibrated probabilities the cost-optimal threshold is", o: ["0.9", "0.5", "1/9", "0.1"], a: 3, why: "τ* = (false alarm cost)/(sum of both costs) = 1/(1 + 9) = 0.1. Card 6." },
    { q: "Defect scores (0.9, 0.7, 0.6, 0.3) and acceptable scores (0.8, 0.4, 0.2, 0.1). The AUC is", o: ["0.625", "0.75", "0.8125", "0.875"], a: 1, why: "Correct pairs: 4 + 3 + 3 + 2 = 12 of 16, no ties, so 0.75. Card 8." },
    { q: "You replace every probability by its square root before calling roc_auc_score. The AUC", o: ["does not change", "rises", "falls", "becomes 0.5"], a: 0, why: "A square root keeps the order of positive scores, and AUC depends only on the order. Card 8." },
    { q: "A screen has TPR 0.8 and FPR 0.05. At 20% prevalence its precision is 0.8. At 1% prevalence, with the same TPR and FPR, its precision is about", o: ["0.80", "0.50", "0.14", "0.01"], a: 2, why: "0.8 × 0.01 / (0.8 × 0.01 + 0.05 × 0.99) = 0.008/0.0575 = 0.139. The ROC point did not move. Card 9." },
    { q: "Among 200 validation parts the model gave p between 0.85 and 0.95, 120 were defective. The model in that range is", o: ["well calibrated", "overconfident", "underconfident", "impossible to judge without the AUC"], a: 1, why: "It predicted about 0.9 and the observed rate is 0.6, so its probabilities are too high. Rescaling the logits by s below 1 would help. Card 10." },
    { q: "A 3-class confusion matrix has rows (true) [50, 5, 5], [10, 25, 5], [0, 5, 15]. The recall of class 1 is", o: ["25/35 = 0.714", "25/40 = 0.625", "25/100 = 0.25", "25/30 = 0.833"], a: 1, why: "Recall is the diagonal over the row total, 10 + 25 + 5 = 40. Dividing by the column total 35 gives precision. Card 11." },
    { q: "A model predicts the majority class for every example of a 3-class problem with supports 90, 8 and 2. Its accuracy and macro recall are", o: ["0.90 and 0.90", "0.33 and 0.33", "0.90 and 0.33", "0.10 and 0.33"], a: 2, why: "It is right on 90 of 100. Recalls are 1, 0 and 0, so their mean is 0.33. Card 11." },
    { q: "You chose a threshold on validation, where the cost was 0.20. On the test set, opened once, the cost is 0.27, and another threshold would have scored 0.22 there. You should", o: ["switch to the other threshold and report 0.22", "report 0.27 for the frozen threshold, and collect new data before any new choice", "average the two and report 0.245", "retrain on the test set"], a: 1, why: "Choosing after seeing the test makes it development data and its score stops estimating future performance. Card 12." }
  ], "Lesson 31 test");
}}
],
summary: String.raw`A classifier is judged by its errors, not by accuracy alone. On skewed data a rule that never predicts the rare class scores one minus the prevalence, 0.79 here and 0.995 in Ng's rare disease example, while finding nothing. The confusion matrix counts true negatives, false positives, false negatives and true positives at one threshold, with true classes on the rows. Precision reads the flagged column, recall the true positive row, specificity and the false positive rate the true negative row. Raising the threshold lowers recall and usually raises precision, F1 is their harmonic mean and cannot be fooled by flagging everything, and when errors have prices the threshold minimizes the validation cost, near the false alarm cost over the sum of the two costs for calibrated probabilities. The ROC curve shows every threshold at once and its area is the probability that a random positive outranks a random negative, unchanged by any order-preserving transform and spoiled by hard labels. Precision depends on prevalence while ROC does not, so rare classes need the precision-recall curve and average precision. A reliability diagram and the ECE check that probabilities mean what they say. With many classes, per-class recall and macro averages expose weak classes, and the frozen procedure is tested once with an interval.`,
sheet: [[String.raw`\[ \begin{pmatrix} TN & FP \\ FN & TP \end{pmatrix} \]`, "confusion matrix, rows true, columns predicted"], [String.raw`\[ P = \frac{TP}{TP + FP}, \qquad R = \frac{TP}{TP + FN} \]`, "precision and recall"], [String.raw`\[ \text{spec} = \frac{TN}{TN + FP}, \qquad \text{FPR} = 1 - \text{spec} \]`, "the negative class"], [String.raw`\[ F_1 = \frac{2PR}{P + R} = \frac{2TP}{2TP + FP + FN} \]`, "harmonic mean"], [String.raw`\[ \tau^* = \frac{c_{FP}}{c_{FP} + c_{FN}} \]`, "cost-optimal threshold for calibrated probabilities"], [String.raw`\[ \text{AUC} = P(s^+ \gt s^-) + \tfrac{1}{2}P(s^+ = s^-) \]`, "AUC as ranking"], [String.raw`\[ P = \frac{\text{TPR}\,\pi}{\text{TPR}\,\pi + \text{FPR}(1 - \pi)} \]`, "precision depends on prevalence"], [String.raw`\[ \text{ECE} = \sum_b \frac{n_b}{N}\,|\bar{p}_b - \bar{y}_b| \]`, "calibration error"], [String.raw`\[ \text{recall}_c = \frac{M_{cc}}{\sum_j M_{cj}} \]`, "per-class recall, row total"], [String.raw`\[ \hat{r} \pm 1.96\sqrt{\hat{r}(1 - \hat{r})/N_1} \]`, "an error bar on a test recall"]],
sources: ["AME 5970 has no lecture notes for evaluating classifiers, so the topic order follows the homework below", "AME 5970 HW9 Problem 3, Evaluate decisions, not just accuracy (3A to 3D), and Problem 4C to 4D, questions and solutions docs: confusion counts, the zero-denominator convention, the imbalanced dataset, the 5 to 1 cost scan, ROC-AUC and average precision, the frozen test, macro metrics and the per-class report", "AME 5970 HW10 B4, Go beyond overall accuracy, and the final evaluation gate, questions and solutions docs: confusion_counts and class_recall", "Andrew Ng, Machine Learning Specialization, course 2 week 3: Error metrics for skewed datasets, Trading off precision and recall", "T. Fawcett, An introduction to ROC analysis, Pattern Recognition Letters 27 (2006)", "C. Elkan, The foundations of cost-sensitive learning, IJCAI 2001", "T. Saito and M. Rehmsmeier, The precision-recall plot is more informative than the ROC plot when evaluating binary classifiers on imbalanced datasets, PLoS ONE (2015)", "C. Guo, G. Pleiss, Y. Sun and K. Weinberger, On calibration of modern neural networks, ICML 2017", "E. B. Wilson, Probable inference, the law of succession, and statistical inference, JASA (1927)", "scikit-learn documentation: confusion_matrix, precision_recall_fscore_support, roc_curve, roc_auc_score, average_precision_score, calibration_curve"]
});
})();

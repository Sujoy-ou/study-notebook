(function () {
/* ML shelf, Part 5, Lesson 24: The training loop. Follows HW5 Problem 2 (a fresh model and optimizer from one saved initial state for every learning rate, full-batch updates, post-update train and validation MSE), HW6 Problem 1 (make_loader, train_one_epoch and evaluate_mse with the sample-weighted epoch loss, fit_model with a deep-copied validation checkpoint, the four fragments A to D of Task 1.6, the learning-rate study of Problem 2.3 and 2.4), HW8 2C (fit_regressor with Adam and the best epoch) and HW10 A3 and A4 (run_epoch that trains or evaluates, set_grad_enabled, fit_classifier, the evaluation-state check). Andrew Ng's Machine Learning Specialization course 2 week 2 (the three steps of model training) and Deep Learning Specialization course 2 weeks 1 and 2 (train, dev and test sets, mini-batches, epochs) are the spine, with Raschka chapter 12 and the PyTorch optimization tutorial. The lesson's data are fresh: 60 points with y = 1.5 − 2x plus N(0, 0.2²) noise from default_rng(2424), split 40, 10 and 10. Every number on the cards was computed with PyTorch 2.15 on the CPU, and the in-page loops were checked against it. */
const C = ML.C;
const tx = (x, y, t, a, cls) => `<text class="${cls || "ts"}" x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""}>${t}</text>`;
const fm = (v, d) => (+v).toFixed(d == null ? 2 : d).replace("-", "−");
const n0 = v => v.toLocaleString("en-US");
const node = (x, y, w, lab, val, cls, on) => `<g class="${cls || "c-gray"}"><rect x="${x - w / 2}" y="${y - 22}" width="${w}" height="44" rx="9" stroke-width="${on ? 1.8 : 0.7}"/></g>` + tx(x, y - 3, lab, "middle", "th") + tx(x, y + 14, val, "middle", "t");
const mean = a => a.reduce((s, v) => s + v, 0) / a.length;
/* MSE and its gradient for the line w x + b, the same mean reduction as nn.MSELoss */
const mse = (w, b, xs, ys) => mean(xs.map((x, i) => (w * x + b - ys[i]) ** 2));
const grd = (w, b, xs, ys) => { const r = xs.map((x, i) => w * x + b - ys[i]); return [2 * mean(r.map((v, i) => v * xs[i])), 2 * mean(r)]; };
/* plot several series, log10 y axis unless o.log === false */
const LG = v => Math.log10(Math.max(v, 1e-12));
const pw = v => Math.abs(v) >= 4 ? "1e" + Math.round(v) : String(+Math.pow(10, v).toPrecision(2));
function plotL(x0, y0, w, h, S, o) {
  const lg = o.log !== false;
  const a = ML.axes(x0, y0, w, h, { xmin: o.xmin || 0, xmax: o.n, ymin: o.lo, ymax: o.hi, nx: o.nx || 5, ny: o.ny || 3, xl: o.xl, yl: o.yl, fx: o.fx || (v => Math.round(v)), fy: lg ? pw : (o.fy || (v => +v.toFixed(2))) });
  let s = a.s;
  S.forEach(q => {
    const pts = [];
    q.d.forEach((v, i) => {
      if (v == null || !isFinite(v)) return;
      const yy = lg ? LG(v) : v;
      pts.push([a.X((q.x0 == null ? 1 : q.x0) + i * (q.dx || 1)), a.Y(Math.min(Math.max(yy, o.lo), o.hi))]);
    });
    if (pts.length > 1) s += ML.path(pts, q.col, q.w || 2, q.dash);
    else if (pts.length) s += `<circle cx="${pts[0][0]}" cy="${pts[0][1]}" r="4" fill="${q.col}"/>`;
  });
  return { s, X: a.X, Y: v => a.Y(Math.min(Math.max(lg ? LG(v) : v, o.lo), o.hi)) };
}
const key = (x, y, items, sp) => items.map(([t, col, dash], i) => { const xx = x + i * (sp || 150); return `<line x1="${xx}" y1="${y}" x2="${xx + 24}" y2="${y}" stroke="${col}" stroke-width="2.5" ${dash ? `stroke-dasharray="${dash}"` : ""}/>` + tx(xx + 30, y + 4, t); }).join("");
const DX = [0.13,0.92,-0.17,0.68,0.43,-0.8,-0.21,-0.42,0.36,-0.94,-0.95,0.85,0.82,-0.7,-0.2,0.79,-0.69,-0.77,-0.07,-1.0,0.42,0.81,-0.26,-0.65,0.43,0.63,0.77,0.11,0.72,0.14,-0.92,-0.51,-0.12,-0.52,0.78,-0.34,0.61,-0.81,0.74,-0.22,-0.4,0.12,-0.03,-0.09,-0.86,0.53,0.08,0.11,0.62,-0.23,0.67,-0.99,0.38,-0.77,-0.04,0.51,-0.53,-0.03,0.22,0.71];
const DY = [1.23,-0.42,1.65,0.12,0.74,3.15,1.76,2.65,0.9,3.6,3.43,-0.17,-0.18,2.51,1.47,-0.21,2.93,3.19,1.45,3.42,0.74,-0.47,2.37,2.65,0.81,0.29,-0.12,1.0,-0.03,1.29,3.63,2.59,1.66,2.49,-0.21,1.9,0.56,2.88,-0.23,2.0,2.38,1.15,1.41,1.57,3.54,0.24,1.2,1.22,0.17,1.75,0.18,3.08,0.92,3.14,1.45,0.31,2.52,1.73,1.25,0.06];
const PERMS = [[16,36,24,39,37,0,22,13,32,29,1,33,25,2,4,17,10,21,31,35,30,20,19,34,12,11,6,3,38,26,14,15,5,27,18,7,9,23,28,8],[6,10,28,7,25,9,0,17,34,31,13,14,35,32,39,27,20,36,22,3,29,4,15,18,24,2,12,30,38,19,21,1,8,26,37,11,33,23,16,5],[31,14,8,36,19,21,1,9,6,34,17,7,16,35,39,2,18,25,29,27,12,13,30,26,32,38,0,37,24,28,4,33,15,23,3,22,10,11,5,20],[21,2,22,18,7,0,20,32,10,11,5,33,25,3,1,8,34,12,16,27,26,24,15,38,14,4,6,37,13,30,36,39,17,31,29,35,19,28,23,9],[35,31,28,18,38,25,36,29,34,16,27,11,37,24,15,7,26,2,8,3,19,17,9,20,14,12,5,22,21,6,30,13,10,1,33,32,4,0,39,23]];
const W0 = -0.6950, B0 = -0.4962;
const C8 = {tr:[0.4501,0.3593,0.2922,0.2472,0.2201,0.2075,0.2057,0.2092,0.2133,0.2143,0.2105,0.2028,0.1923,0.1808,0.1704,0.1619,0.1555,0.1511,0.1481,0.1457,0.1435,0.1406,0.1371,0.1328,0.1278,0.1225,0.1174,0.1126,0.1084,0.1049,0.102,0.0995,0.0972,0.0947,0.0921,0.0892,0.0863,0.0834,0.0808,0.0786,0.0768,0.0753,0.074,0.0727,0.0714,0.07,0.0687,0.0675,0.0664,0.0656,0.065,0.0645,0.0641,0.0636,0.0631,0.0627,0.0623,0.0619,0.0617,0.0615,0.0613,0.0611,0.0609,0.0606,0.0603,0.06,0.0596,0.0593,0.059,0.0587,0.0585,0.0583,0.0581,0.0579,0.0576,0.0574,0.0572,0.057,0.0568,0.0566,0.0564,0.0562,0.0561,0.0559,0.0557,0.0556,0.0554,0.0552,0.0551,0.0549,0.0547,0.0546,0.0544,0.0542,0.0541,0.0539,0.0537,0.0536,0.0534,0.0532,0.053,0.0527,0.0525,0.0523,0.0521,0.0518,0.0516,0.0515,0.0513,0.0511,0.051,0.0508,0.0506,0.0504,0.0503,0.0501,0.05,0.0498,0.0496,0.0495,0.0493,0.0492,0.049,0.0488,0.0487,0.0485,0.0484,0.0482,0.048,0.0479,0.0477,0.0475,0.0474,0.0472,0.047,0.0469,0.0467,0.0466,0.0464,0.0462,0.0461,0.0459,0.0457,0.0456,0.0454,0.0452,0.0451,0.0449,0.0447,0.0444,0.0443,0.0441,0.044,0.0437,0.0435,0.0433,0.0431,0.0429,0.0427,0.0425,0.0423,0.0421,0.0419,0.0417,0.0415,0.0413,0.041,0.0408,0.0406,0.0404,0.0402,0.0399,0.0397,0.0395,0.0393,0.0391,0.0389,0.0386,0.0384,0.0382,0.038,0.0378,0.0376,0.0374,0.0371,0.037,0.0368,0.0366,0.0363,0.0361,0.0359,0.0357,0.0355,0.0353,0.035,0.0348,0.0346,0.0344,0.0342,0.034,0.0338,0.0336,0.0334,0.0332,0.033,0.0328,0.0326,0.0323,0.0322,0.032,0.0318,0.0316,0.0314,0.0312,0.031,0.0309,0.0307,0.0305,0.0303,0.0301,0.03,0.0298,0.0296,0.0295,0.0293,0.0292,0.029,0.0289,0.0287,0.0285,0.0284,0.0283,0.0281,0.028,0.0278,0.0277,0.0276,0.0274,0.0273,0.0272,0.0271,0.027,0.0268,0.0268,0.0267,0.0266,0.0264,0.0263,0.0262,0.0261,0.0261,0.026,0.0259,0.0258,0.0257,0.0256,0.0256,0.0255,0.0254,0.0253,0.0252,0.0252,0.0251,0.025,0.0249,0.0249,0.0249,0.0248,0.0248,0.0247,0.0246,0.0246,0.0245,0.0245,0.0244,0.0244,0.0243,0.0243,0.0242,0.0242,0.0242,0.0241,0.0241,0.024,0.024,0.0239,0.0238,0.0238,0.0237,0.0237,0.0236,0.0235,0.0235,0.0235,0.0235,0.0234,0.0234,0.0233,0.0233,0.0232,0.0232,0.0232,0.0231,0.0231,0.023,0.023,0.0229,0.0229,0.0229,0.0228,0.0228,0.0228,0.0227,0.0227,0.0227,0.0226,0.0226,0.0226,0.0225,0.0225,0.0225,0.0224,0.0224,0.0224,0.0224,0.0223,0.0223,0.0223,0.0222,0.0222,0.0222,0.0221,0.0221,0.0221,0.022,0.022,0.022,0.022,0.0219,0.0219,0.0219,0.0218,0.0218,0.0218,0.0218,0.0217,0.0217,0.0217,0.0217,0.0216,0.0216,0.0216,0.0216,0.0215,0.0215,0.0215,0.0214,0.0214,0.0214,0.0214,0.0214,0.0213,0.0213,0.0213,0.0213,0.0213,0.0212,0.0212,0.0212,0.0212,0.0211,0.0211,0.0211,0.0211,0.021,0.021,0.021,0.021,0.021,0.021,0.021,0.0209,0.0209,0.0209,0.0209,0.0209,0.0209,0.0208,0.0208,0.0208,0.0208,0.0208,0.0207,0.0207,0.0207,0.0207,0.0207,0.0207,0.0206,0.0206,0.0206,0.0206,0.0206,0.0205,0.0205,0.0205,0.0205,0.0205,0.0204,0.0204,0.0204,0.0204,0.0204,0.0204,0.0204,0.0204,0.0203,0.0203,0.0203,0.0203,0.0203,0.0203,0.0203,0.0202,0.0202,0.0202,0.0202,0.0202,0.0202,0.0202,0.0202,0.0201,0.0201,0.0201,0.0201,0.0201,0.0201,0.0201,0.0201,0.0201,0.02,0.02,0.02,0.02,0.02,0.02,0.02,0.02,0.02,0.02,0.02,0.0199,0.0199,0.0199,0.0199,0.0199,0.0199,0.0199,0.0199,0.0199,0.0199,0.0198,0.0198,0.0198,0.0198,0.0198,0.0198,0.0198,0.0198,0.0198,0.0198,0.0198,0.0198,0.0198,0.0197,0.0197,0.0197,0.0197,0.0197,0.0197,0.0197,0.0197,0.0197,0.0197,0.0197,0.0197,0.0196,0.0196,0.0196,0.0196,0.0196,0.0196,0.0196,0.0196,0.0196,0.0196,0.0196,0.0196,0.0196,0.0196,0.0196,0.0196,0.0195,0.0195,0.0195,0.0195,0.0195,0.0195,0.0195,0.0195,0.0195,0.0195,0.0195,0.0195,0.0195,0.0195,0.0195,0.0195,0.0195,0.0195,0.0195,0.0194,0.0194,0.0195,0.0194,0.0194,0.0194,0.0194,0.0194,0.0194,0.0194,0.0194,0.0194,0.0194,0.0194,0.0194,0.0194,0.0194,0.0194,0.0194,0.0194,0.0194,0.0194,0.0194,0.0193,0.0193,0.0193,0.0193,0.0193,0.0193,0.0193,0.0193,0.0193,0.0193,0.0193,0.0193,0.0193,0.0193,0.0193,0.0193,0.0193,0.0193,0.0193,0.0193,0.0193,0.0193,0.0193,0.0193,0.0193,0.0193,0.0193,0.0193,0.0192,0.0192,0.0192,0.0192,0.0192,0.0192,0.0192,0.0192,0.0192,0.0192,0.0192,0.0192,0.0192,0.0192,0.0192,0.0192,0.0192,0.0192,0.0192,0.0192,0.0192,0.0192,0.0192,0.0192,0.0192,0.0192,0.0192,0.0192],va:[0.3896,0.3103,0.2533,0.2169,0.197,0.1905,0.1933,0.2002,0.2063,0.2084,0.2049,0.1966,0.1851,0.1723,0.1603,0.1502,0.1425,0.1371,0.1335,0.131,0.129,0.1268,0.1243,0.1211,0.1174,0.1134,0.1094,0.1056,0.1024,0.0996,0.0973,0.0952,0.0931,0.0907,0.0881,0.0852,0.0822,0.0793,0.0767,0.0745,0.0727,0.0713,0.0701,0.0689,0.0677,0.0665,0.0653,0.0642,0.0633,0.0625,0.0619,0.0614,0.0609,0.0605,0.0601,0.0598,0.0596,0.0594,0.0594,0.0594,0.0595,0.0595,0.0595,0.0595,0.0594,0.0594,0.0595,0.0596,0.0597,0.0599,0.06,0.06,0.06,0.06,0.0599,0.0598,0.0596,0.0595,0.0593,0.059,0.0587,0.0585,0.0584,0.0582,0.0582,0.0581,0.058,0.058,0.0581,0.0581,0.0582,0.0583,0.0584,0.0585,0.0585,0.0585,0.0585,0.0585,0.0586,0.0586,0.0586,0.0587,0.0587,0.0587,0.0587,0.0587,0.0587,0.0586,0.0585,0.0584,0.0582,0.058,0.0579,0.0577,0.0576,0.0575,0.0574,0.0574,0.0573,0.0573,0.0573,0.0574,0.0575,0.0576,0.0576,0.0576,0.0576,0.0576,0.0576,0.0575,0.0575,0.0575,0.0575,0.0574,0.0574,0.0573,0.0573,0.0574,0.0574,0.0574,0.0574,0.0574,0.0574,0.0573,0.0573,0.0573,0.0573,0.0573,0.0572,0.0572,0.0572,0.0573,0.0572,0.0571,0.0569,0.0567,0.0567,0.0568,0.0569,0.057,0.0571,0.057,0.057,0.057,0.0569,0.0569,0.0569,0.0568,0.0567,0.0567,0.0567,0.0568,0.0569,0.0569,0.0569,0.0569,0.0568,0.0568,0.0568,0.0569,0.057,0.057,0.0569,0.0569,0.057,0.0571,0.0572,0.0571,0.0571,0.0572,0.0573,0.0574,0.0575,0.0576,0.0575,0.0573,0.0573,0.0574,0.0577,0.0579,0.0581,0.0583,0.0585,0.0585,0.0585,0.0585,0.0586,0.0588,0.059,0.0591,0.0592,0.0594,0.0597,0.0599,0.06,0.0603,0.0605,0.0607,0.0609,0.0612,0.0614,0.0615,0.0616,0.062,0.0624,0.0626,0.0627,0.0629,0.0631,0.0634,0.0639,0.0641,0.0644,0.0648,0.0651,0.0654,0.0656,0.0658,0.0661,0.0664,0.0667,0.0669,0.0672,0.0674,0.0677,0.0681,0.0683,0.0685,0.0688,0.0693,0.0698,0.07,0.0702,0.0703,0.0706,0.0711,0.0714,0.0714,0.0713,0.0716,0.0721,0.0724,0.0724,0.0724,0.0726,0.073,0.0734,0.0735,0.0736,0.0738,0.0741,0.0744,0.0746,0.0747,0.0749,0.0753,0.0756,0.0759,0.076,0.0761,0.0764,0.0767,0.0768,0.0769,0.077,0.0771,0.0771,0.077,0.077,0.077,0.077,0.077,0.077,0.0774,0.0776,0.0777,0.0779,0.0782,0.0785,0.0787,0.0787,0.0787,0.0788,0.0789,0.0788,0.0786,0.0787,0.079,0.0789,0.0789,0.0791,0.0792,0.0793,0.0793,0.0793,0.0794,0.0796,0.0795,0.0795,0.0796,0.0796,0.0796,0.0796,0.0796,0.0797,0.0801,0.0802,0.0799,0.0801,0.0802,0.0799,0.0801,0.0802,0.0803,0.0803,0.0801,0.0801,0.0803,0.0804,0.0803,0.0802,0.0807,0.0808,0.0808,0.0806,0.0806,0.0809,0.0807,0.0805,0.0806,0.0807,0.0806,0.0806,0.0807,0.0809,0.081,0.0807,0.0809,0.0811,0.081,0.0808,0.0809,0.0812,0.0814,0.0808,0.0811,0.0813,0.0812,0.0812,0.0813,0.0815,0.0814,0.0812,0.081,0.0812,0.0814,0.0812,0.0813,0.0817,0.0818,0.0816,0.0814,0.0816,0.0818,0.0814,0.0813,0.0815,0.0816,0.0816,0.0816,0.0819,0.0823,0.0823,0.082,0.082,0.0821,0.0819,0.0818,0.0821,0.0823,0.0824,0.0825,0.0824,0.0825,0.0825,0.0824,0.0822,0.0821,0.0823,0.0823,0.0824,0.0824,0.0824,0.0826,0.0825,0.0826,0.0827,0.0827,0.0828,0.0827,0.0827,0.0825,0.0824,0.0825,0.0827,0.0829,0.0831,0.0833,0.0832,0.083,0.083,0.0829,0.0828,0.0828,0.0829,0.083,0.083,0.0832,0.0832,0.0832,0.083,0.0829,0.083,0.083,0.083,0.0832,0.0835,0.0836,0.0837,0.0837,0.0835,0.0834,0.0833,0.0832,0.0833,0.0834,0.0835,0.0835,0.0837,0.0839,0.0838,0.0837,0.0838,0.0836,0.0835,0.0836,0.0838,0.0838,0.0838,0.084,0.084,0.0839,0.084,0.0841,0.0841,0.084,0.0841,0.0842,0.0843,0.0843,0.0844,0.0845,0.0843,0.0842,0.0843,0.0842,0.0842,0.0843,0.0844,0.0843,0.0843,0.0845,0.0845,0.0845,0.0846,0.0846,0.0844,0.0842,0.0841,0.0841,0.0842,0.0844,0.0845,0.0846,0.0847,0.0848,0.0848,0.0848,0.0847,0.0847,0.0847,0.0848,0.0847,0.0847,0.0848,0.0847,0.0848,0.0848,0.0847,0.0846,0.0846,0.0847,0.0848,0.0848,0.0849,0.0849,0.0849,0.0848,0.0848,0.085,0.085,0.085,0.0851,0.0852,0.0851,0.085,0.0852,0.0852,0.0852,0.0853,0.0853,0.0853,0.0852,0.0853,0.0854,0.0853,0.0854,0.0853,0.0851,0.0851,0.0853,0.0854,0.0855,0.0855,0.0853,0.0851,0.0851,0.0852,0.0852,0.0853,0.0855,0.0854,0.0854,0.0855,0.0855,0.0856,0.0857,0.0857,0.0856,0.0854,0.0855,0.0854,0.0855,0.0856,0.0856,0.0855,0.0854,0.0854,0.0854,0.0854,0.0856,0.0856,0.0855,0.0856,0.0856,0.0857,0.0857,0.0859,0.0858,0.0858,0.0858,0.0857,0.0855,0.0855,0.0854,0.0854,0.0854,0.0857,0.0858,0.0858]};
const C10 = {slow:{tr:[3.73,3.623,3.519,3.418,3.321,3.228,3.137,3.05,2.965,2.883,2.804,2.727,2.653,2.581,2.512,2.445,2.38,2.317,2.256,2.197,2.14,2.085,2.032,1.98,1.93,1.881,1.834,1.788,1.744,1.701,1.66,1.619,1.58,1.542,1.505,1.47,1.435,1.401,1.369,1.337],va:[2.907,2.813,2.723,2.636,2.551,2.47,2.392,2.317,2.244,2.175,2.107,2.042,1.979,1.919,1.861,1.804,1.75,1.698,1.647,1.599,1.552,1.506,1.463,1.42,1.38,1.34,1.302,1.266,1.23,1.196,1.163,1.131,1.1,1.07,1.042,1.014,0.9868,0.9608,0.9357,0.9114]},good:{tr:[0.9769,0.3735,0.1755,0.095,0.061,0.0463,0.0405,0.0378,0.0364,0.0358,0.0354,0.0354,0.0354,0.0353,0.0353,0.0353,0.0353,0.0355,0.0354,0.0353,0.0355,0.0353,0.0353,0.0354,0.0353,0.0353,0.0353,0.0355,0.0353,0.0356,0.0353,0.0353,0.0353,0.0353,0.0353,0.0353,0.0353,0.0354,0.0353,0.0354],va:[0.6274,0.2399,0.1239,0.0754,0.0515,0.0388,0.031,0.0266,0.0242,0.0234,0.0226,0.0226,0.0225,0.0219,0.0213,0.0213,0.0205,0.0203,0.0204,0.0206,0.02,0.0204,0.0212,0.0219,0.0212,0.0212,0.0217,0.0221,0.0215,0.0224,0.0216,0.0215,0.0213,0.021,0.0207,0.0212,0.0216,0.0219,0.0215,0.0222]},noisy:{tr:[0.0374,0.0618,0.0404,0.0375,0.0511,0.0372,0.069,0.0434,0.041,0.0391,0.072,0.0428,0.0871,0.0632,0.0405,0.0382,0.0528,0.1156,0.0594,0.0509,0.0383,0.065,0.0414,0.0937,0.0878,0.0749,0.0358,0.0697,0.0373,0.0377,0.0544,0.0416,0.0584,0.0358,0.1046,0.0512,0.0363,0.0489,0.0375,0.0533],va:[0.0156,0.0565,0.0344,0.0218,0.0445,0.0158,0.0488,0.0265,0.0172,0.0322,0.0481,0.0376,0.0934,0.0372,0.0236,0.0223,0.0282,0.0852,0.0539,0.0289,0.0224,0.0408,0.0296,0.0914,0.0595,0.0399,0.0243,0.0636,0.0286,0.0209,0.048,0.0217,0.0379,0.0238,0.1078,0.0332,0.0245,0.0303,0.028,0.0476]},diverge:{tr:[2618,1.982e+06,3.779e+09,9.474e+12,2.619e+16,5.252e+19,7.958e+22,1.107e+25,4.174e+28,4.921e+31,1.455e+35,null],va:[2620,1.71e+06,3.774e+09,9.477e+12,2.615e+16,5.23e+19,7.799e+22,1.07e+25,4.004e+28,4.848e+31,1.393e+35,null]},underfit:{tr:[0.9018,0.7801,0.6717,0.5765,0.4945,0.4255,0.3692,0.3249,0.2919,0.2691,0.2554,0.2493,0.2492,0.2535,0.2606,0.2691,0.2777,0.2852,0.2911,0.2948,0.2962,0.2955,0.2928,0.2885,0.2832,0.2772,0.2711,0.2653,0.2601,0.2558,0.2524,0.25,0.2487,0.2481,0.2483,0.249,0.25,0.251,0.252,0.2528,0.2533,0.2535,0.2534,0.253,0.2524,0.2517,0.2508,0.25,0.2493,0.2487,0.2483,0.248,0.2478,0.2478,0.2479,0.248,0.2482,0.2483,0.2485,0.2485,0.2485,0.2485,0.2484,0.2483,0.2482,0.2481,0.2479,0.2479,0.2478,0.2477,0.2477,0.2477,0.2477,0.2478,0.2478,0.2478,0.2478,0.2478,0.2478,0.2478,0.2478,0.2478,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477,0.2477],va:[0.7401,0.6354,0.543,0.463,0.3953,0.3396,0.2957,0.2628,0.2402,0.2268,0.2214,0.2226,0.2289,0.2386,0.2503,0.2625,0.2739,0.2837,0.2911,0.2957,0.2975,0.2966,0.2933,0.2881,0.2814,0.2738,0.2658,0.2578,0.2502,0.2434,0.2375,0.2326,0.2287,0.2258,0.2238,0.2224,0.2216,0.2212,0.221,0.2209,0.2209,0.2209,0.2208,0.2207,0.2206,0.2206,0.2207,0.2209,0.2212,0.2218,0.2224,0.2232,0.2241,0.2251,0.226,0.2269,0.2276,0.2282,0.2287,0.2289,0.229,0.229,0.2287,0.2284,0.2279,0.2274,0.2269,0.2264,0.2259,0.2254,0.2249,0.2245,0.2242,0.2239,0.2237,0.2235,0.2234,0.2234,0.2234,0.2234,0.2235,0.2236,0.2238,0.2239,0.2241,0.2243,0.2245,0.2247,0.2248,0.225,0.2251,0.2252,0.2253,0.2253,0.2253,0.2253,0.2252,0.2252,0.2251,0.225,0.2249,0.2248,0.2248,0.2247,0.2246,0.2245,0.2245,0.2245,0.2244,0.2244,0.2244,0.2244,0.2245,0.2245,0.2245,0.2246,0.2246,0.2246,0.2247,0.2247,0.2247,0.2248,0.2248,0.2248,0.2248,0.2248,0.2248,0.2248,0.2248,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2246,0.2246,0.2246,0.2246,0.2246,0.2246,0.2246,0.2246,0.2246,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247,0.2247]}};
const XS = DX.slice(0, 40), YS = DY.slice(0, 40), XV = DX.slice(40, 50), YV = DY.slice(40, 50), XT = DX.slice(50), YT = DY.slice(50);
const CODE1 = ["model = nn.Linear(1, 1)          # Ng step 1: the output", "loss_fn = nn.MSELoss()           # Ng step 2: loss and cost", "optimizer = torch.optim.SGD(model.parameters(), lr=0.1)", "for xb, yb in loader:            # Ng step 3: minimize J", "    optimizer.zero_grad()", "    pred = model(xb)", "    loss = loss_fn(pred, yb)", "    loss.backward()", "    optimizer.step()"];
/* full-batch runs on the 40 training points, used by cards 2, 3 and 9 */
function gdRun(kind, lr, steps, p0) {
  let w = p0 ? p0[0] : 0, b = p0 ? p0[1] : 0, aw = 0, ab = 0, vw = 0, vb = 0, mw = 0, mb = 0, sw = 0, sb = 0, st3 = null;
  const h = [mse(w, b, XS, YS)], hv = [mse(w, b, XV, YV)];
  for (let t = 1; t <= steps; t++) {
    const g = grd(w, b, XS, YS);
    if (kind === "sgd" || kind === "ok") { w -= lr * g[0]; b -= lr * g[1]; }
    else if (kind === "acc") { aw += g[0]; ab += g[1]; w -= lr * aw; b -= lr * ab; }
    else if (kind === "mom") { vw = 0.9 * vw + g[0]; vb = 0.9 * vb + g[1]; w -= lr * vw; b -= lr * vb; if (t === 3) st3 = [vw]; }
    else if (kind === "adam") {
      mw = 0.9 * mw + 0.1 * g[0]; mb = 0.9 * mb + 0.1 * g[1]; sw = 0.999 * sw + 0.001 * g[0] * g[0]; sb = 0.999 * sb + 0.001 * g[1] * g[1];
      const c1 = 1 - Math.pow(0.9, t), c2 = 1 - Math.pow(0.999, t);
      w -= lr * (mw / c1) / (Math.sqrt(sw / c2) + 1e-8); b -= lr * (mb / c1) / (Math.sqrt(sb / c2) + 1e-8);
      if (t === 3) st3 = [mw, sw];
    }
    h.push(mse(w, b, XS, YS)); hv.push(mse(w, b, XV, YV));
  }
  return { h, hv, w, b, st3 };
}
/* least squares line on the training points */
const LSQ = (() => { const n = XS.length, sx = XS.reduce((a, v) => a + v, 0), sy = YS.reduce((a, v) => a + v, 0), sxx = XS.reduce((a, v) => a + v * v, 0), sxy = XS.reduce((a, v, i) => a + v * YS[i], 0); const w = (n * sxy - sx * sy) / (n * sxx - sx * sx); return { w, b: (sy - w * sx) / n, j: mse(w, (sy - w * sx) / n, XS, YS) }; })();

addLesson("ml", "torch", {
level: "Core", num: "Lesson 24",
id: "ml-torch-l24", title: "The training loop", short: "24. The training loop",
big: String.raw`Lessons 21 to 23 built the parts: tensors, autograd and modules. This lesson assembles them into the program that every PyTorch project runs, the training loop. Andrew Ng describes training in three steps: say how the model computes its output, say how the loss and the cost are measured, then minimize the cost on the data. In PyTorch that is a model, a loss function and an optimizer, then a loop over epochs and batches that clears the gradients, predicts, measures the loss, backpropagates and steps. The five steps fit in five lines, but almost everything that makes a result trustworthy lives around them: the order of the lines, what the optimizer keeps, how many updates an epoch contains, how the epoch loss is averaged, the train and eval modes, a validation checkpoint that is really a copy, comparisons that start every candidate from the same weights, and the habit of reading the curves before believing a number. These are the questions HW5, HW6, HW8 and HW10 ask.`,
bridge: String.raw`The examples follow HW5 Problem 2 (one saved initial state, a fresh model and optimizer for every learning rate, post-update training and validation MSE), HW6 Problem 1 (<code>train_one_epoch</code>, <code>evaluate_mse</code> and the sample-weighted epoch loss, <code>fit_model</code> with its deep-copied checkpoint, the four fragments of Task 1.6) and its learning-rate study, HW8 2C (<code>fit_regressor</code> with Adam and a best epoch) and HW10 A3 and A4 (one <code>run_epoch</code> that trains or evaluates, and the check that evaluation changes nothing). The spine is Ng's Machine Learning Specialization course 2 week 2 (the three steps of model training) with Deep Learning Specialization course 2 weeks 1 and 2 (train, dev and test sets, mini-batches and epochs). The data are new: 60 points of y = 1.5 − 2x plus noise with standard deviation 0.2, split 40, 10 and 10. Lesson 25 replaces the hand-made batches with Dataset and DataLoader.`,
labels: { note: "Exam and project note" },
cards: [

{s: "1. The loop at a glance", t: "Model, loss and optimizer, then five steps for every batch",
intu: String.raw`Ng's three steps of training map one to one onto PyTorch. Step 1, how to compute the output from x and the parameters, is the model, here <code>nn.Linear(1, 1)</code> for ŷ = wx + b. Step 2, the loss on one example and the cost over a set, is <code>nn.MSELoss()</code>, which averages over the batch. Step 3, minimize the cost, is the optimizer together with a loop. Inside the loop every batch runs the same five steps: clear the old gradients, predict, compute the batch loss, backpropagate to fill <code>p.grad</code>, and let the optimizer move every parameter against its gradient. To make the arithmetic easy to follow, w and b start at 0 here. Step through two batches of four samples and watch which values exist after each line.`,
eq: String.raw`\[ J_{\text{batch}}(w, b) = \frac{1}{B} \sum_{i=1}^{B} \left(\hat y_i - y_i\right)^2 \]\[ \theta \leftarrow \theta - \alpha \, \nabla_\theta J_{\text{batch}}(\theta) \]`,
sym: [["model", "Ng's step 1, the function from x to the prediction"], [String.raw`\(\texttt{loss\_fn}\)`, "Ng's step 2, MSELoss averages the squared errors of the batch"], ["optimizer", "Ng's step 3, it updates the parameters it was given"], [String.raw`\(\alpha\)`, "learning rate, lr = 0.1 here"], ["B", "batch size, 4 here"]],
how: ["Build the model, the loss function and the optimizer once, before the loop.", "Clear the gradients with <code>optimizer.zero_grad()</code>.", "Predict with <code>model(xb)</code> and compute <code>loss_fn(pred, yb)</code>.", "Call <code>loss.backward()</code> to fill every <code>p.grad</code>.", "Call <code>optimizer.step()</code>, then take the next batch."],
say: String.raw`Training is a model, a loss and an optimizer followed by a loop in which every batch clears the gradients, predicts, computes the batch loss, backpropagates and steps the parameters against their gradients.`,
num: String.raw`Batch 1, the first four samples, from w = b = 0: predictions 0, loss <b>1.1065</b>, gradients <b>(0.2127, −1.2900)</b>, so w = −0.0213 and b = 0.1290. Batch 2: loss <b>4.5911</b>, gradients (1.7666, −3.8814), then w = <b>−0.1979</b> and b = <b>0.5171</b>. MSELoss has no factor ½, so its gradient is twice the one in Ng's cost.`,
r(fig, ctl) {
  const bx = [[0, 4], [4, 8]];
  const S = [{ k: -1, it: 0, w: 0, b: 0, g: null, pred: null, loss: null }];
  let w = 0, b = 0, g = null;
  bx.forEach(([i0, i1], it) => {
    const xs = XS.slice(i0, i1), ys = YS.slice(i0, i1);
    g = null; S.push({ k: 0, it, w, b, g, pred: null, loss: null });
    const pred = xs.map(x => w * x + b); S.push({ k: 1, it, w, b, g, pred, loss: null });
    const loss = mse(w, b, xs, ys); S.push({ k: 2, it, w, b, g, pred, loss });
    g = grd(w, b, xs, ys); S.push({ k: 3, it, w, b, g, pred, loss });
    w -= 0.1 * g[0]; b -= 0.1 * g[1]; S.push({ k: 4, it, w, b, g, pred, loss });
  });
  const N = ["zero_grad", "forward", "loss", "backward", "step"];
  const D = ["grads None", "model(xb)", "one number", "fills p.grad", "moves w, b"];
  ML.stepper(ctl, S.length, k => {
    const st = S[k];
    let s = "";
    N.forEach((n, i) => { const x = 74 + i * 133; s += node(x, 44, 120, n, D[i], st.k === i ? "c-teal" : "c-gray", st.k === i); if (i < 4) s += arrow(x + 61, 44, x + 72, 44, "var(--p)", 1.5); });
    s += `<path d="M606 68 C 606 98, 74 98, 74 70" fill="none" stroke="var(--p)" stroke-width="1.2" stroke-dasharray="4 4" marker-end="url(#ar)"/>` + tx(340, 104, "next batch", "middle");
    const xs = XS.slice(...bx[st.it]), ys = YS.slice(...bx[st.it]);
    const rows = [["batch " + (st.it + 1) + ", inputs x", xs.map(v => fm(v, 2)).join(", ")], ["targets y", ys.map(v => fm(v, 2)).join(", ")], ["w, b", fm(st.w, 4) + ", " + fm(st.b, 4)], ["w.grad, b.grad", st.g ? fm(st.g[0], 4) + ", " + fm(st.g[1], 4) : "None, None"], ["pred", st.pred ? st.pred.map(v => fm(v, 4)).join(", ") : "not computed yet"], ["loss", st.loss == null ? "not computed yet" : fm(st.loss, 4)]];
    rows.forEach(([a, v], i) => { s += tx(30, 138 + i * 24, a, null, "th") + tx(200, 138 + i * 24, v, null, "t"); });
    fig.innerHTML = svg(286, s) + ML.code(CODE1, st.k < 0 ? 3 : 4 + st.k);
  }, S.map(s => s.k < 0 ? "before the loop" : `batch ${s.it + 1}, ${N[s.k]}`));
}},

{s: "2. The order of the steps", t: "Clear before backward, step after backward, forward every time",
intu: String.raw`The five lines can be arranged in many ways, and only some of them train. Three facts decide it. <code>backward</code> adds into <code>p.grad</code>, so the gradients must be cleared at some point after the previous step and before the next backward. <code>step</code> uses whatever <code>p.grad</code> holds at that moment, so it must come after backward. And backward frees the graph, so every iteration needs its own forward pass. HW8's <code>fit_regressor</code> clears after computing the loss, HW6 clears first, and both are right. Never clearing turns the update into the sum of every gradient so far, so the line overshoots and swings. Clearing between backward and step, or stepping before backward, leaves nothing for the step to use. Pick an order and watch 60 full-batch steps.`,
eq: String.raw`\[ \text{forward} \to \text{loss} \to \text{backward} \to \text{step}, \quad \text{clear anywhere before backward} \]\[ \text{never cleared: } \ \texttt{p.grad}_t = \sum_{s=1}^{t} g_s \]`,
sym: [[String.raw`\(\texttt{zero\_grad()}\)`, "sets every p.grad to None by default"], ["backward", "adds the new gradient into p.grad and frees the graph"], ["step", "moves each parameter using its current p.grad, skips a parameter whose grad is None"], [String.raw`\(g_s\)`, "the gradient computed at step s"], ["forward pass", "builds the graph that backward needs, once per iteration"]],
how: ["Put the forward pass and the loss inside the loop.", "Clear the gradients once per iteration, before backward.", "Call backward, then step.", "If the loss swings and grows, look for a missing <code>zero_grad</code>.", "If the loss never moves, look at what happens between backward and step."],
say: String.raw`An iteration must compute a fresh forward pass, clear the gradients at some point before backward, call backward and then step, because backward accumulates into the gradient and step uses whatever the gradient holds.`,
num: String.raw`Full batch, lr 0.1, from w = b = 0 with loss 3.8415. The three correct orders reach <b>0.0353</b> after 60 steps, the least squares minimum. Never clearing swings between 0.0965 and 3.9513 and ends at <b>0.8434</b>. The two late orders stay at <b>3.8415</b>. The loss built outside the loop fails on the second backward.`,
r(fig, ctl) {
  const L = (a) => ["for t in range(60):"].concat(a.map(q => "    " + q));
  const V = [
    ["zero_grad first", L(["optimizer.zero_grad()", "loss = loss_fn(model(X), Y)", "loss.backward()", "optimizer.step()"]), "ok", "the standard order, HW6 and HW10"],
    ["zero_grad after the loss", L(["loss = loss_fn(model(X), Y)", "optimizer.zero_grad()", "loss.backward()", "optimizer.step()"]), "ok", "HW8's order, also correct, the clear only has to come before backward"],
    ["zero_grad at the end", L(["loss = loss_fn(model(X), Y)", "loss.backward()", "optimizer.step()", "optimizer.zero_grad()"]), "ok", "also correct, the next backward starts from cleared gradients"],
    ["never cleared", L(["loss = loss_fn(model(X), Y)", "loss.backward()", "optimizer.step()"]), "acc", "each step uses the sum of every gradient so far"],
    ["cleared before step", L(["loss = loss_fn(model(X), Y)", "loss.backward()", "optimizer.zero_grad()", "optimizer.step()"]), "flat", "step finds p.grad = None and skips every parameter"],
    ["step before backward", L(["optimizer.zero_grad()", "loss = loss_fn(model(X), Y)", "optimizer.step()", "loss.backward()"]), "flat", "the fresh gradient is cleared before any step can use it"],
    ["loss outside the loop", ["loss = loss_fn(model(X), Y)      # once, before the loop", "for t in range(60):", "    optimizer.zero_grad()", "    loss.backward()", "    optimizer.step()"], "err", "one forward pass makes one graph, and backward frees it"]
  ];
  const ok = gdRun("ok", 0.1, 60).h, acc = gdRun("acc", 0.1, 60).h, flat = ok.map(() => ok[0]), err = [ok[0], ok[1]];
  const H = { ok, acc, flat, err };
  let v = 3;
  ctl.innerHTML = btns(V.map((q, i) => [i, q[0]]), "k2");
  const u = () => {
    pick(ctl, "k2", v); const [name, code, kind, note] = V[v], h = H[kind];
    const P = plotL(70, 34, 560, 200, (kind === "ok" ? [] : [{ d: ok, col: C.gray, w: 1.4, dash: "5 4", x0: 0 }]).concat([{ d: h, col: kind === "ok" ? C.teal : C.coral, w: 2.4, x0: 0 }]), { n: 60, lo: -2, hi: 1, nx: 6, ny: 3, xl: "update step", yl: "training MSE, log scale" });
    let s = tx(70, 22, name + ": " + note, null, "th") + P.s;
    if (kind === "err") s += `<circle cx="${P.X(1)}" cy="${P.Y(ok[1])}" r="6" fill="none" stroke="${C.coral}" stroke-width="2"/>` + tx(P.X(1) + 12, P.Y(ok[1]) + 4, "second backward raises here", null, "t");
    if (kind !== "ok") s += key(70, 294, [["correct order, for comparison", C.gray, "5 4"]]);
    const mn = Math.min(...acc), mx = Math.max(...acc.slice(1));
    const out = kind === "ok" ? ["loss after 60 steps: " + fm(h[60], 4)] : kind === "acc" ? ["loss after 60 steps: " + fm(h[60], 4), "it swung between " + fm(mn, 4) + " and " + fm(mx, 4)] : kind === "flat" ? ["loss after 60 steps: " + fm(h[60], 4) + ", w and b are still 0"] : ["RuntimeError: Trying to backward through the graph a second time (or directly", "access saved tensors after they have already been freed). Saved intermediate", "values of the graph are freed when you call .backward() or autograd.grad().", "Specify retain_graph=True if you need to backward through the graph a", "second time or if you need to access saved tensors after calling backward."];
    fig.innerHTML = svg(306, s) + ML.code(code, -1) + ML.term(out);
  };
  ctl.querySelectorAll("button[data-k2]").forEach(b => b.onclick = () => { v = +b.dataset.k2; u(); }); u();
}},

{s: "3. The optimizer object", t: "The optimizer holds the parameters, the settings and its own state",
intu: String.raw`<code>torch.optim.SGD(model.parameters(), lr=0.1)</code> stores references to the model's parameter tensors in a parameter group, together with the settings such as lr and momentum. Every <code>step()</code> reads each parameter's <code>.grad</code> and changes the parameter in place. Plain SGD keeps nothing else. SGD with momentum keeps a velocity per parameter, a running sum of past gradients that carries the update through flat stretches. Adam keeps two running averages per parameter, of the gradient and of its square, and divides one by the square root of the other, so its step is close to lr in size whatever the scale of the gradient. That state is part of training, which is why a checkpoint you want to resume saves the optimizer's state dict too. Compare the three on the same full-batch problem and change the rate. Lesson 35 studies these optimizers in depth.`,
eq: String.raw`\[ \text{SGD: } \theta \leftarrow \theta - \alpha g \qquad \text{momentum: } v \leftarrow \mu v + g, \ \ \theta \leftarrow \theta - \alpha v \]\[ \text{Adam: } m \leftarrow \beta_1 m + (1 - \beta_1) g, \quad s \leftarrow \beta_2 s + (1 - \beta_2) g^2 \]\[ \theta \leftarrow \theta - \alpha \, \frac{m / (1 - \beta_1^t)}{\sqrt{s / (1 - \beta_2^t)} + \epsilon} \]`,
sym: [[String.raw`\(\texttt{param\_groups}\)`, "list of dicts with the parameters and their lr, momentum and other settings"], ["state", "per-parameter memory, empty for plain SGD"], [String.raw`\(\mu\)`, "momentum, 0.9 here"], [String.raw`\(\beta_1, \beta_2\)`, "Adam's averaging factors, 0.9 and 0.999 by default"], [String.raw`\(\epsilon\)`, "small constant, 1e-8, keeps the division finite"]],
how: ["Build the optimizer after the model, from <code>model.parameters()</code>.", "Set lr, and momentum or betas, in the constructor.", "Change the rate later through <code>optimizer.param_groups[0]['lr']</code>.", "Save <code>optimizer.state_dict()</code> with the model when you want to resume.", "Compare optimizers only from the same starting weights, card 9."],
say: String.raw`An optimizer holds the model's parameters with their settings and, except for plain SGD, a state per parameter such as a momentum buffer or Adam's two running averages, and each step updates the parameters in place from their gradients.`,
num: String.raw`100 full-batch steps from w = b = 0. SGD at lr 0.01 is still at <b>0.4072</b>, at lr 0.1 it reaches <b>0.0353</b>, and its edge on this problem is 2 over the largest curvature, <b>1.0</b>. Adam at lr 0.01 ends at <b>0.9157</b> with w = −0.90, since each step moves w by about 0.01. Momentum at lr 0.9 is at 2.006 after 10 steps and still settles at 0.0353.`,
r(fig, ctl) {
  const K = [["SGD", "sgd", C.blue], ["SGD, momentum 0.9", "mom", C.purple], ["Adam", "adam", C.teal]];
  const LR = [0.01, 0.03, 0.1, 0.3, 0.9];
  let k = 0, li = 2;
  ctl.innerHTML = btns(K.map((q, i) => [i, q[0]]), "k3o") + btns(LR.map((v, i) => [i, "lr " + v]), "k3l");
  const u = () => {
    pick(ctl, "k3o", k); pick(ctl, "k3l", li); const lr = LR[li];
    const R = K.map(q => gdRun(q[1], lr, 100));
    const P = plotL(70, 34, 380, 210, R.map((r, i) => ({ d: r.h, col: K[i][2], w: i === k ? 2.8 : 1.2, dash: i === k ? null : "4 4", x0: 0 })).concat([{ d: R[0].h.map(() => LSQ.j), col: C.gray, w: 1, dash: "2 3", x0: 0 }]), { n: 100, lo: -2, hi: 1, nx: 5, ny: 3, xl: "update step", yl: "training MSE, log scale" });
    const r = R[k], hit = r.h.findIndex(v => v < 0.04);
    let s = tx(70, 22, K[k][0] + " at lr " + lr + ", the others dashed", null, "th") + P.s;
    const rows = [["after 100 steps", fm(r.h[100], 4)], ["w, b", fm(r.w, 4) + ", " + fm(r.b, 4)], ["least squares", fm(LSQ.j, 4)], ["first step below 0.04", hit < 0 ? "not within 100" : String(hit)]];
    rows.forEach(([a, b], i) => s += tx(476, 60 + i * 44, a, null, "t") + tx(476, 80 + i * 44, b, null, "th"));
    K.forEach((q, i) => s += `<line x1="476" y1="${238 + i * 16}" x2="500" y2="${238 + i * 16}" stroke="${q[2]}" stroke-width="2.5"/>` + tx(506, 242 + i * 16, q[0]));
    const st = k === 0 ? "None" : k === 1 ? `{'momentum_buffer': tensor([[${r.st3[0].toFixed(4)}]])}` : `{'step': tensor(3.), 'exp_avg': tensor([[${r.st3[0].toFixed(4)}]]), 'exp_avg_sq': tensor([[${r.st3[1].toFixed(4)}]])}`;
    const ctor = k === 0 ? `torch.optim.SGD(model.parameters(), lr=${lr})` : k === 1 ? `torch.optim.SGD(model.parameters(), lr=${lr}, momentum=0.9)` : `torch.optim.Adam(model.parameters(), lr=${lr})`;
    fig.innerHTML = svg(296, s) + ML.code(["optimizer = " + ctor, "for t in range(3):", "    optimizer.zero_grad()", "    loss_fn(model(X), Y).backward()", "    optimizer.step()", "print(optimizer.state_dict()['state'].get(0))   # state of the weight", "print(optimizer.param_groups[0]['lr'])"], 0) + ML.term([st, String(lr)]) + (k === 0 ? `<p class="note">Plain SGD keeps no state, so the state dict has no entry for the weight.</p>` : "");
  };
  ctl.querySelectorAll("button[data-k3o]").forEach(b => b.onclick = () => { k = +b.dataset.k3o; u(); });
  ctl.querySelectorAll("button[data-k3l]").forEach(b => b.onclick = () => { li = +b.dataset.k3l; u(); }); u();
}},

{s: "4. Epochs, batches and iterations", t: "An iteration is one batch and one update, an epoch is one pass over the data",
intu: String.raw`Ng's mini-batch vocabulary is the language of every training log. An iteration processes one batch and makes one update. An epoch is one full pass over the training set, so with N samples and batch size B it holds N/B iterations, rounded up because the last batch keeps the remainder. HW6 has 210 training samples and batches of 32, so an epoch is 6 full batches and one of 18, 7 updates, and 160 epochs make 1,120 updates. With <code>drop_last=True</code> the loader throws away the remainder every epoch, acceptable for training when the remainder is tiny and some layers need full batches, wrong for evaluation, where every sample must be scored. Use the presets from the homework or set your own numbers.`,
eq: String.raw`\[ K = \left\lceil \frac{N}{B} \right\rceil \ \text{batches per epoch}, \qquad \text{updates} = E \cdot K \]\[ \texttt{drop\_last=True}: \ K = \left\lfloor \frac{N}{B} \right\rfloor, \ \ N - KB \text{ samples unused} \]`,
sym: [["N", "training samples"], ["B", "batch size"], ["K", "batches, and so updates, per epoch"], ["E", "epochs"], [String.raw`\(\texttt{drop\_last}\)`, "throw away a last batch smaller than B"]],
how: ["Divide N by B and round up for the batches per epoch.", "The last batch holds the remainder, or B when the division is exact.", "Multiply by the number of epochs for the total updates.", "Keep <code>drop_last=False</code> for validation and test loaders.", "Compare runs by the number of updates, not only by epochs, when B differs."],
say: String.raw`An iteration is one batch and one parameter update, an epoch is one pass over the training set, so an epoch has N over B rounded up iterations and the last batch holds the remainder unless drop last discards it.`,
num: String.raw`HW6: 210 at B = 32 gives <b>7</b> batches, 6 × 32 + <b>18</b>, and 160 epochs are <b>1,120</b> updates. HW8 digits: 1,437 at 64 gives <b>23</b> batches, the last of 29. HW10 quick mode: 4,000 at 128 gives <b>32</b> batches of 128 each round except the last of 32, and 3 epochs are <b>96</b> updates. <code>drop_last</code> on HW6 discards 18 samples every epoch.`,
r(fig, ctl) {
  const P = [["HW6 line", 210, 32, 160], ["HW8 digits", 1437, 64, 10], ["HW10 MNIST, quick", 4000, 128, 3], ["this lesson", 40, 8, 40]];
  let dl = 0;
  ctl.innerHTML = btns(P.map((q, i) => [i, q[0]]), "k4p") + sl("k4n", "samples N", 1, 5000, 1, 210) + sl("k4b", "batch size B", 1, 256, 1, 32) + sl("k4e", "epochs E", 1, 200, 1, 160) + btns([[0, "drop_last=False"], [1, "drop_last=True"]], "k4d");
  const u = () => {
    pick(ctl, "k4d", dl);
    const N = +$("k4n").value, B = +$("k4b").value, E = +$("k4e").value; $("k4nv").textContent = N; $("k4bv").textContent = B; $("k4ev").textContent = E;
    const full = Math.floor(N / B), rem = N % B, K = dl ? full : full + (rem ? 1 : 0), last = K === 0 ? 0 : (dl || !rem ? B : rem), drop = dl ? rem : 0;
    let s = tx(30, 24, `N = ${n0(N)} samples in batches of ${B}`, null, "th");
    const W = 620, x0 = 30, scale = W / N;
    if (full > 0) s += `<rect x="${x0}" y="40" width="${full * B * scale}" height="34" fill="var(--blue-bg)" stroke="${C.blue}" stroke-width="0.8"/>`;
    if (K <= 80) for (let i = 1; i < full; i++) s += `<line x1="${x0 + i * B * scale}" y1="40" x2="${x0 + i * B * scale}" y2="74" stroke="${C.blue}" stroke-width="0.8"/>`;
    if (rem) s += `<rect x="${x0 + full * B * scale}" y="40" width="${Math.max(2, rem * scale)}" height="34" fill="${dl ? "var(--coral-bg)" : "var(--teal-bg)"}" stroke="${dl ? C.coral : C.teal}" stroke-width="1.2"/>`;
    s += tx(x0, 92, full + " full batch" + (full === 1 ? "" : "es") + " of " + B, null) + (rem ? tx(x0 + W, 92, dl ? rem + " samples dropped" : "last batch of " + rem, "end") : "");
    const rows = [["batches per epoch K", n0(K)], ["size of the last batch", K ? String(last) : "none"], ["samples unused per epoch", String(drop)], ["updates in " + E + " epoch" + (E === 1 ? "" : "s"), n0(E * K)], ["samples processed per epoch", n0(K ? (K - 1) * B + last : 0)]];
    rows.forEach(([a, b], i) => s += tx(30, 124 + i * 24, a, null, "t") + tx(300, 124 + i * 24, b, null, "th"));
    if (K === 0) s += tx(360, 124, "no batch at all, the loop never runs", null, "th");
    fig.innerHTML = svg(250, s) + ML.code([`loader = DataLoader(train_data, batch_size=${B}, shuffle=True, drop_last=${dl ? "True" : "False"})`, "print(len(train_data), len(loader))", "print([len(yb) for xb, yb in loader][-1])"], -1) + ML.term([N + " " + K, K ? String(last) : "IndexError: list index out of range"]);
  };
  ctl.querySelectorAll("button[data-k4p]").forEach(b => b.onclick = () => { const q = P[+b.dataset.k4p]; $("k4n").value = q[1]; $("k4b").value = q[2]; $("k4e").value = q[3]; pick(ctl, "k4p", +b.dataset.k4p); u(); });
  ctl.querySelectorAll("button[data-k4d]").forEach(b => b.onclick = () => { dl = +b.dataset.k4d; u(); });
  ["k4n", "k4b", "k4e"].forEach(i => $(i).oninput = () => { pick(ctl, "k4p", -1); u(); }); pick(ctl, "k4p", 0); u();
}},

{s: "5. What the epoch loss means", t: "Weight each batch by its size, and know which model the number describes",
intu: String.raw`A training log prints one loss per epoch, and two choices hide in that number. First, the average. <code>MSELoss</code> returns the mean over a batch, so averaging the batch means treats a batch of 8 like a batch of 32. HW6 multiplies each batch mean by its batch size, adds, and divides by the number of samples, which gives every sample the same weight. The two averages agree only when all batches have the same size. Second, the model. The running loss is collected while the parameters move, so it describes a blend of all the states inside the epoch. HW6's <code>fit_model</code> therefore evaluates the full training set again with the end-of-epoch model, the number that is comparable with the validation loss. The bars below are the batch losses of one epoch on the 40 training points, with their widths set by the batch sizes.`,
eq: String.raw`\[ \bar L = \frac{\sum_b n_b L_b}{\sum_b n_b} \]\[ \frac{1}{K} \sum_{b=1}^{K} L_b = \bar L \ \text{ only when every } n_b \text{ is the same} \]`,
sym: [[String.raw`\(L_b\)`, "mean loss of batch b, what MSELoss returns"], [String.raw`\(n_b\)`, "number of samples in batch b"], [String.raw`\(\bar L\)`, "sample-weighted epoch loss, the HW6 contract"], ["running loss", "collected during the epoch while the parameters change"], ["evaluated loss", "the end-of-epoch model scored on the whole set in eval mode"]],
how: ["Accumulate <code>loss.item() * len(yb)</code> and the count.", "Divide the sum by the count at the end of the epoch.", "Report the running value as the training progress.", "Compare training and validation with losses evaluated by the same fixed model.", "Keep partial batches so every sample counts once."],
say: String.raw`The epoch loss is the sum of each batch mean times its batch size divided by the number of samples, which differs from the mean of batch means when batches differ in size, and a running loss describes the moving model while an evaluated loss describes the model at the end of the epoch.`,
num: String.raw`B = 32, epoch 1, from w = b = 0 at lr 0.1: batches of 32 and 8 with losses 3.5256 and 3.8430, weighted <b>3.5891</b>, mean of the two means <b>3.6843</b>, and the end-of-epoch model scores <b>1.9403</b> on the same 40 samples because it improved during the epoch. At B = 8 every batch is equal and both averages give 2.4078.`,
r(fig, ctl) {
  ctl.innerHTML = sl("k5b", "batch size B", 2, 40, 1, 32) + sl("k5e", "epoch", 1, 5, 1, 1);
  const u = () => {
    const B = +$("k5b").value, E = +$("k5e").value; $("k5bv").textContent = B; $("k5ev").textContent = E;
    let w = 0, b = 0, Ls = [], ns = [];
    for (let e = 0; e < E; e++) {
      Ls = []; ns = [];
      for (let s0 = 0; s0 < 40; s0 += B) {
        const idx = PERMS[e].slice(s0, s0 + B), xb = idx.map(i => XS[i]), yb = idx.map(i => YS[i]);
        Ls.push(mse(w, b, xb, yb)); ns.push(idx.length); const g = grd(w, b, xb, yb); w -= 0.1 * g[0]; b -= 0.1 * g[1];
      }
    }
    const wtd = Ls.reduce((a, v, i) => a + v * ns[i], 0) / 40, unw = mean(Ls), ev = mse(w, b, XS, YS);
    const top = Math.max(...Ls, wtd, unw, ev) * 1.15;
    const a = ML.axes(70, 30, 560, 190, { xmin: 0, xmax: 40, ymin: 0, ymax: top, nx: 8, ny: 4, xl: "samples in the order the loader served them", yl: "batch MSE", fx: v => Math.round(v), fy: v => v.toFixed(top > 2 ? 1 : 2) });
    let s = a.s, c = 0;
    Ls.forEach((L, i) => { s += `<rect x="${a.X(c) + 1}" y="${a.Y(L)}" width="${a.X(c + ns[i]) - a.X(c) - 2}" height="${a.Y(0) - a.Y(L)}" fill="var(--blue-bg)" stroke="${C.blue}" stroke-width="0.8"/>`; if (Ls.length <= 10) s += tx((a.X(c) + a.X(c + ns[i])) / 2, a.Y(0) - 8, "n = " + ns[i], "middle", "t"); c += ns[i]; });
    [[wtd, C.teal, null], [unw, C.coral, "6 4"], [ev, C.purple, "2 3"]].forEach(([v, col, d]) => s += `<line x1="70" y1="${a.Y(v)}" x2="630" y2="${a.Y(v)}" stroke="${col}" stroke-width="2.4" ${d ? `stroke-dasharray="${d}"` : ""}/>`);
    s += key(30, 272, [["weighted " + fm(wtd, 4), C.teal], ["mean of means " + fm(unw, 4), C.coral, "6 4"], ["end of epoch " + fm(ev, 4), C.purple, "2 3"]], 215);
    fig.innerHTML = svg(286, s) + ML.code(["total, count = 0.0, 0", "for xb, yb in loader:", "    ...                                # the five steps", "    total += loss.item() * len(yb)     # weight by batch size", "    count += len(yb)", "running = total / count", "train_loss = evaluate_mse(model, train_eval_loader)   # fixed model"], 3) + ML.term([`batch sizes ${JSON.stringify(ns)}`, `running ${wtd.toFixed(4)}   mean of means ${unw.toFixed(4)}   evaluated ${ev.toFixed(4)}`]);
  };
  $("k5b").oninput = u; $("k5e").oninput = u; u();
}},

{s: "6. train, eval and no_grad", t: "eval() changes how layers behave, no_grad() stops the graph, validation needs both",
intu: String.raw`Two independent switches decide what an evaluation pass does. <code>model.eval()</code> sets the training flag to False in every module, so Dropout passes values through and BatchNorm normalizes with its running statistics instead of the batch's own. <code>torch.no_grad()</code> stops autograd from recording a graph, which saves memory and time, and makes an accidental backward impossible. HW6 states it plainly: eval alone does not disable gradients. The model here is Linear, BatchNorm1d, ReLU, Dropout(0.5) and Linear, trained for 300 steps, and it is scored on the 10 validation points three times in each setting. In train mode the score changes on every call and, worse, BatchNorm keeps updating its running statistics with validation data, so evaluating changes the model. That is exactly what HW10's <code>check_epoch</code> rules out.`,
eq: String.raw`\[ \texttt{model.eval()}: \ \text{Dropout off, BatchNorm uses running statistics} \]\[ \texttt{torch.no\_grad()}: \ \text{no graph, no } \texttt{grad\_fn}, \ \text{no backward} \]`,
sym: [["model.training", "the flag that train() and eval() set on every module"], [String.raw`\(\texttt{running\_mean}\)`, "BatchNorm buffer, updated by forward passes in train mode"], [String.raw`\(\texttt{num\_batches\_tracked}\)`, "counts the batches that updated the running statistics"], [String.raw`\(\texttt{grad\_fn}\)`, "present when the output belongs to a recorded graph"], [String.raw`\(\texttt{torch.inference\_mode()}\)`, "a stricter <code>no_grad</code> for pure inference, Lesson 22"]],
how: ["Call <code>model.eval()</code> before every validation or test pass.", "Wrap the pass in <code>with torch.no_grad():</code>.", "Call <code>model.train()</code> again at the start of the next training epoch.", "Check that evaluating twice gives the same number.", "Check that the state dict is unchanged after evaluation, as HW10 does."],
say: String.raw`Evaluation needs eval mode, so that dropout and batch normalization behave deterministically and nothing updates, and no grad, so that no graph is recorded, and neither switch does the other's job.`,
num: String.raw`eval with <code>no_grad</code>: <b>0.0539</b> on all three calls, <code>running_mean[0]</code> stays 0.2978, no <code>grad_fn</code>. train mode with <code>no_grad</code>: <b>0.0536, 0.2476, 0.3413</b>, <code>running_mean[0]</code> drifts to 0.2956, 0.2937, 0.2920 and <code>num_batches_tracked</code> goes from 300 to 303. Back in eval mode the same model now scores <b>0.0282</b>, because its statistics have partly learned the validation set.`,
r(fig, ctl) {
  let md = 1, gr = 1;
  ctl.innerHTML = btns([[0, "model.train()"], [1, "model.eval()"]], "k6m") + btns([[1, "with torch.no_grad()"], [0, "gradients on"]], "k6g");
  const R = {
    "1,1": ["0.0539, 0.0539, 0.0539", "0.2978, 0.2978, 0.2978", "300", "None", "c-teal", "the right way: deterministic, nothing changes, no graph"],
    "1,0": ["0.0539, 0.0539, 0.0539", "0.2978, 0.2978, 0.2978", "300", "AddmmBackward0", "c-purple", "correct numbers, but a graph is built and kept for every batch"],
    "0,1": ["0.0536, 0.2476, 0.3413", "0.2956, 0.2937, 0.2920", "303", "None", "c-coral", "random scores, and the validation data changed BatchNorm"],
    "0,0": ["changes on every call", "changes on every call", "303", "AddmmBackward0", "c-coral", "random scores, BatchNorm changed, and a graph on top"]
  };
  const u = () => {
    pick(ctl, "k6m", md); pick(ctl, "k6g", gr); const r = R[md + "," + gr];
    let s = tx(150, 22, "no_grad", "middle", "th") + tx(330, 22, "gradients on", "middle", "th") + tx(36, 66, "eval", "middle", "th") + tx(36, 120, "train", "middle", "th");
    [[1, 1, 70, 40], [1, 0, 250, 40], [0, 1, 70, 94], [0, 0, 250, 94]].forEach(([m, g, x, y]) => { const q = R[m + "," + g], on = m === md && g === gr; s += `<g class="${q[4]}"><rect x="${x}" y="${y}" width="160" height="46" rx="8" stroke-width="${on ? 2.2 : 0.6}" opacity="${on ? 1 : 0.55}"/></g>` + tx(x + 80, y + 28, m === 1 && g === 1 ? "use this" : m === 1 ? "wasteful" : "wrong", "middle", "t"); });
    const rows = [["validation MSE, three calls", r[0]], ["BatchNorm running_mean[0]", r[1]], ["num_batches_tracked after", r[2] + " (300 before)"], ["output grad_fn", r[3]]];
    rows.forEach(([a, b], i) => s += tx(440, 46 + i * 36, a, null, "t") + tx(440, 64 + i * 36, b, null, "th"));
    s += tx(30, 178, r[5], null, "th");
    s += tx(30, 202, md === 0 && gr === 1 ? "afterwards, in eval mode, the model scores 0.0282 instead of 0.0539: evaluating changed it" : "model: Linear(1, 32), BatchNorm1d(32), ReLU, Dropout(0.5), Linear(32, 1)", null, "t");
    fig.innerHTML = svg(220, s) + ML.code([md ? "model.eval()" : "model.train()", gr ? "with torch.no_grad():" : "if True:                       # gradients on", "    for k in range(3):", "        out = model(XV)", "        print(loss_fn(out, YV).item(), model[1].running_mean[0].item())", "print(out.grad_fn)"], 0);
  };
  ctl.querySelectorAll("button[data-k6m]").forEach(b => b.onclick = () => { md = +b.dataset.k6m; u(); });
  ctl.querySelectorAll("button[data-k6g]").forEach(b => b.onclick = () => { gr = +b.dataset.k6g; u(); }); u();
}},

{s: "7. One epoch function for both jobs", t: "run_epoch trains when it gets an optimizer and evaluates when it does not",
intu: String.raw`HW10 A3 folds training and evaluation into one function so that the two can never drift apart. The optimizer argument decides the job. With an optimizer the function sets train mode, records gradients and updates after every batch. With <code>None</code> it sets eval mode, wraps the loop in <code>torch.set_grad_enabled(False)</code> and only measures. Both paths compute the loss the same way and return the same sample-weighted average from card 5, so a training number and a validation number mean the same thing. HW10 adds an accuracy count with <code>logits.argmax(1)</code> for classification, and HW6 splits the same logic into <code>train_one_epoch</code> and <code>evaluate_mse</code>. Step through three batches of 4, 4 and 3 samples, the first 11 training points, from w = b = 0 at lr 0.1, in both modes.`,
eq: String.raw`\[ \texttt{run\_epoch(model, loader, loss\_fn, optimizer)} \ \to \ \text{train} \]\[ \texttt{run\_epoch(model, loader, loss\_fn)} \ \to \ \text{evaluate} \]`,
sym: [["training", "True when an optimizer is passed"], [String.raw`\(\texttt{model.train(training)}\)`, "train(False) is the same as eval()"], [String.raw`\(\texttt{set\_grad\_enabled}\)`, "<code>no_grad</code> when its argument is False"], [String.raw`\(\texttt{set\_to\_none=True}\)`, "clear by setting p.grad to None, the default"], ["total / seen", "the sample-weighted epoch loss"]],
how: ["Pass the optimizer for a training epoch.", "Pass nothing for validation and test.", "Let the function set the mode every time it is called.", "Accumulate with <code>loss.item()</code> times the batch size.", "Return the average, and add accuracy for classifiers."],
say: String.raw`One epoch function that trains when it is given an optimizer and evaluates when it is not keeps the mode, the gradient switch and the averaging identical for training, validation and test.`,
num: String.raw`Training: batch losses <b>1.1065, 4.5911, 5.3408</b>, epoch loss <b>3.5285</b>, and w, b end at (−0.5411, 0.9222). Evaluation of the same untouched model: 1.1065, 5.1475, 8.5116, epoch loss <b>4.5956</b>, w and b stay 0. Only the first batch agrees, because training moved the line before batches 2 and 3.`,
r(fig, ctl) {
  const CODE = ["def run_epoch(model, loader, loss_fn, optimizer=None):", "    training = optimizer is not None", "    model.train(training)", "    total, seen = 0.0, 0", "    with torch.set_grad_enabled(training):", "        for xb, yb in loader:", "            if training:", "                optimizer.zero_grad(set_to_none=True)", "            pred = model(xb)", "            loss = loss_fn(pred, yb)", "            if training:", "                loss.backward()", "                optimizer.step()", "            total += loss.item() * len(yb)", "            seen += len(yb)", "    return total / seen"];
  const build = tr => {
    const S = []; let w = 0, b = 0, tot = 0, seen = 0;
    const base = (o) => Object.assign({ tr, w, b, tot, seen, batch: -1, L: null, gr: null, res: null }, o);
    S.push(base({ ln: 1, nm: "decide the job" }));
    S.push(base({ ln: 2, nm: tr ? "model.train()" : "model.eval()" }));
    S.push(base({ ln: 4, nm: tr ? "gradients on" : "gradients off", gr: tr }));
    [[0, 4], [4, 8], [8, 11]].forEach(([i0, i1], k) => {
      const xb = XS.slice(i0, i1), yb = YS.slice(i0, i1), L = mse(w, b, xb, yb);
      S.push(base({ ln: 9, nm: `batch ${k + 1}: predict and loss`, batch: k, L, gr: tr }));
      if (tr) { const g = grd(w, b, xb, yb); w -= 0.1 * g[0]; b -= 0.1 * g[1]; }
      S.push(base({ ln: tr ? 12 : 10, nm: `batch ${k + 1}: ` + (tr ? "update" : "no update"), batch: k, L, gr: tr }));
      tot += L * xb.length; seen += xb.length;
      S.push(base({ ln: 14, nm: `batch ${k + 1}: add to the totals`, batch: k, L, gr: tr }));
    });
    S.push(base({ ln: 15, nm: "return the average", res: tot / seen, gr: tr }));
    return S;
  };
  let mode = 1;
  ctl.innerHTML = btns([[1, "with an optimizer: train"], [0, "optimizer=None: evaluate"]], "k7") + `<div id="k7s"></div>`;
  const go = () => {
    pick(ctl, "k7", mode); $("k7s").innerHTML = ""; const S = build(mode === 1);
    ML.stepper($("k7s"), S.length, k => {
      const st = S[k];
      let s = "";
      [[0, 4], [4, 8], [8, 11]].forEach(([i0, i1], j) => { const x = 30 + j * 130, on = j === st.batch; s += `<g class="${on ? "c-teal" : j < st.batch ? "c-blue" : "c-gray"}"><rect x="${x}" y="16" width="120" height="40" rx="8" stroke-width="${on ? 1.8 : 0.6}"/></g>` + tx(x + 60, 34, "batch " + (j + 1), "middle", "th") + tx(x + 60, 50, (i1 - i0) + " samples", "middle"); });
      const rows = [["model.training", k >= 1 ? (st.tr ? "True" : "False") : "unchanged"], ["gradients recorded", st.gr == null ? "not set yet" : st.gr ? "yes" : "no"], ["w, b", fm(st.w, 4) + ", " + fm(st.b, 4)], ["batch loss", st.L == null ? "none yet" : fm(st.L, 4)], ["total, seen", fm(st.tot, 4) + ", " + st.seen], ["returned", st.res == null ? "not yet" : fm(st.res, 4)]];
      rows.forEach(([a, v], i) => s += tx(i < 3 ? 30 : 360, 136 + (i % 3) * 26, a, null, "t") + tx(i < 3 ? 190 : 470, 136 + (i % 3) * 26, v, null, "th"));
      s += tx(30, 82, st.tr ? "training: zero_grad, backward and step run for every batch" : "evaluation: the two if training blocks are skipped", null, "t");
      s += tx(30, 104, st.tr ? "the loss of batch 2 is measured after the update made on batch 1" : "every batch is scored by the same fixed model", null, "t");
      fig.innerHTML = svg(206, s) + ML.code(CODE, st.ln);
    }, S.map(q => q.nm));
  };
  ctl.querySelectorAll("button[data-k7]").forEach(b => b.onclick = () => { mode = +b.dataset.k7; go(); }); go();
}},

{s: "8. Validation checkpoints", t: "Keep a deep copy of the best validation state, stop when patience runs out",
intu: String.raw`The last epoch is rarely the best one. HW6's <code>fit_model</code> and HW8's <code>fit_regressor</code> evaluate the validation set after every epoch and keep a copy of the state with the lowest validation loss, then load it back at the end. Two details make or break this. The copy must be a deep copy, because <code>model.state_dict()</code> returns references to the live tensors, Lesson 23, so a plain assignment silently becomes the final state. And the choice is made on validation, never on training or test data. Early stopping adds a patience: stop once the validation loss has not improved for that many epochs. Too small a patience stops on a noisy stretch. The curves are a real run: a network with two hidden layers of 128 units trained with Adam on 24 noisy points of sin 1.5x, scored on 60 validation points. Move the clock, change the patience and the way the checkpoint is stored.`,
eq: String.raw`\[ e^\star = \arg\min_{e \le E} J_{\text{val}}(\theta_e), \qquad \text{stop at the first } e \text{ with } e - e^\star_{\le e} \ge p \]`,
sym: [[String.raw`\(e^\star\)`, "epoch with the lowest validation loss so far"], ["p", "patience, epochs allowed without improvement"], ["deepcopy", String.raw`<code>copy.deepcopy(model.state_dict())</code> freezes the values`], ["reference", "<code>best = model.state_dict()</code> keeps following the model"], ["noise floor", "0.25² = 0.0625, the expected MSE of the true curve on new points"]],
how: ["Evaluate the validation set after every epoch in eval mode.", "When it improves, store <code>copy.deepcopy(model.state_dict())</code> and the epoch.", "Optionally stop after p epochs without improvement.", "After the loop, <code>model.load_state_dict(best_state)</code> and <code>model.eval()</code>.", "Check that evaluating the restored model reproduces the best validation loss."],
say: String.raw`A validation checkpoint is a deep copy of the state with the lowest validation loss, restored at the end of training, and early stopping ends training once the validation loss has not improved for a chosen patience.`,
num: String.raw`Best epoch <b>156</b> with validation <b>0.0567</b>, training 0.0444 at that epoch. At epoch 600 training is 0.0192 and validation 0.0858. Patience 5 stops at epoch 11 and keeps epoch 6 at 0.1905, patience 10 stops at 69 (best 59, 0.0594), patience 50 stops at 206 with the true best 156. A reference instead of a copy restores the last state, 0.0858 after 600 epochs.`,
r(fig, ctl) {
  const PAT = [5, 10, 20, 50, 100, Infinity];
  let pi = 5, cp = 0;
  ctl.innerHTML = sl("k8n", "epoch now", 1, 600, 1, 600) + btns(PAT.map((p, i) => [i, p === Infinity ? "no early stop" : "patience " + p]), "k8p") + btns([[0, "copy.deepcopy(state_dict)"], [1, "plain state_dict()"]], "k8c");
  const u = () => {
    pick(ctl, "k8p", pi); pick(ctl, "k8c", cp);
    const now = +$("k8n").value, p = PAT[pi]; $("k8nv").textContent = now;
    let bv = Infinity, be = 0, stop = 0;
    for (let e = 1; e <= now; e++) { if (C8.va[e - 1] < bv) { bv = C8.va[e - 1]; be = e; } if (e - be >= p) { stop = e; break; } }
    const last = stop || now, rest = cp === 0 ? C8.va[be - 1] : C8.va[last - 1];
    const P = plotL(70, 30, 560, 190, [{ d: C8.tr, col: C.blue, w: 1, dash: "2 3" }, { d: C8.va, col: C.coral, w: 1, dash: "2 3" }, { d: C8.tr.slice(0, last), col: C.blue, w: 2.2 }, { d: C8.va.slice(0, last), col: C.coral, w: 2.2 }, { d: C8.va.map(() => 0.0625), col: C.gray, w: 1, dash: "6 4" }], { n: 600, lo: 0, hi: 0.4, log: false, nx: 6, ny: 4, xl: "epoch", yl: "MSE" });
    let s = P.s + `<line x1="${P.X(last)}" y1="30" x2="${P.X(last)}" y2="220" stroke="var(--p)" stroke-width="1.4" stroke-dasharray="4 3"/>` + tx(P.X(last) + (last > 480 ? -6 : 6), 44, stop ? "stopped at " + stop : "epoch " + now, last > 480 ? "end" : null, "t");
    s += `<circle cx="${P.X(be)}" cy="${P.Y(bv)}" r="6" fill="none" stroke="${C.teal}" stroke-width="2.4"/>`;
    s += key(70, 278, [["training", C.blue], ["validation", C.coral], ["noise floor 0.0625", C.gray, "6 4"]]);
    s += tx(70, 304, `best so far: epoch ${be}, validation ${fm(bv, 4)}`, null, "th") + tx(400, 304, `restored model scores ${fm(rest, 4)}`, null, "th");
    s += tx(70, 324, cp === 0 ? "the deep copy froze the values of epoch " + be : "the stored dict followed the model, so the restore gives epoch " + last, null, "t");
    fig.innerHTML = svg(336, s) + ML.code(["best_val, best_epoch, best_state = float('inf'), 0, None", "for epoch in range(1, epochs + 1):", "    run_epoch(model, train_loader, loss_fn, optimizer)", "    val = run_epoch(model, val_loader, loss_fn)", "    if val < best_val:", "        best_val, best_epoch = val, epoch", "        best_state = " + (cp === 0 ? "copy.deepcopy(model.state_dict())" : "model.state_dict()             # a reference"), "    elif epoch - best_epoch >= patience:", "        break", "model.load_state_dict(best_state)", "model.eval()"], 6);
  };
  ctl.querySelectorAll("button[data-k8p]").forEach(b => b.onclick = () => { pi = +b.dataset.k8p; u(); });
  ctl.querySelectorAll("button[data-k8c]").forEach(b => b.onclick = () => { cp = +b.dataset.k8c; u(); });
  $("k8n").oninput = u; u();
}},

{s: "9. Fair comparisons", t: "Every candidate starts from the same weights with a fresh optimizer",
intu: String.raw`HW5 Problem 2 compares learning rates, and the whole point is to change one thing only. It saves one initial state, and every candidate builds a fresh <code>nn.Linear(1, 1)</code>, loads that state, creates its own optimizer and trains for the same number of full-batch epochs on the same split. HW6's <code>run_house_trial</code> does the same with seeds for the weights and for the batch order. If instead one model is trained at the first rate and then simply continued at the next, every later rate inherits the earlier progress, and the comparison measures the order of the experiments. Switch between the two designs. In the reused design the rate 1.1, which diverges from a fair start because it is beyond the edge 1.0 of this problem, starts at the minimum and looks perfect.`,
eq: String.raw`\[ \theta^{(\alpha)}_0 = \theta_{\text{init}} \ \text{ for every } \alpha, \qquad \text{same data, split, epochs and batch order} \]`,
sym: [[String.raw`\(\theta_{\text{init}}\)`, "the saved initial state, here w = −0.6950, b = −0.4962"], ["fresh optimizer", "a new optimizer per candidate, no inherited momentum or Adam state"], ["budget", "60 full-batch epochs for every rate"], ["baseline", "the training-mean predictor, validation MSE 0.8647"], ["edge", "2 over the largest curvature, 1.0 for this problem"]],
how: ["Save the initial state once with <code>copy.deepcopy(model.state_dict())</code>.", "For each candidate build a new model and load that state.", "Build a new optimizer for each candidate.", "Fix the split, the epoch budget and the loader seed.", "Compare on validation and keep the baseline in the plot."],
say: String.raw`A fair comparison trains every candidate from the same saved initial state with a fresh optimizer, the same data and the same budget, so that the only difference between runs is the setting being compared.`,
num: String.raw`Fresh from the same start, 60 full-batch epochs: lr 0.01 ends at validation <b>0.5106</b>, lr 0.1 at <b>0.0217</b>, lr 0.5 at <b>0.0209</b>, and lr 1.1 diverges past 1e10. The training-mean baseline is 0.8647. Reused in that order, lr 1.1 reports <b>0.0209</b> because it started at the minimum.`,
r(fig, ctl) {
  const LR = [0.01, 0.1, 0.5, 1.1], COL = [C.blue, C.teal, C.purple, C.coral];
  const base = mean(YV.map(v => (v - mean(YS)) ** 2));
  let md = 0;
  ctl.innerHTML = btns([[0, "fresh model from the saved state"], [1, "one model, reused in order"]], "k9");
  const u = () => {
    pick(ctl, "k9", md);
    let R = [], p = [W0, B0];
    LR.forEach(lr => { const r = gdRun("sgd", lr, 60, md === 0 ? [W0, B0] : p); R.push(r); p = [r.w, r.b]; });
    const S = R.map((r, i) => ({ d: r.hv, col: COL[i], w: 2.2, x0: md === 0 ? 0 : 60 * i })).concat([{ d: Array(md ? 241 : 61).fill(base), col: C.gray, w: 1.2, dash: "6 4", x0: 0 }]);
    const P = plotL(70, 30, 400, 200, S, { n: md ? 240 : 60, lo: -2, hi: 1, nx: md ? 4 : 6, ny: 3, xl: md ? "epochs, one run after another" : "epoch", yl: "validation MSE, log scale" });
    let s = P.s;
    if (md) LR.forEach((lr, i) => s += tx(P.X(60 * i + 30), 46, "lr " + lr, "middle", "t"));
    s += tx(494, 40, "final validation MSE", null, "th");
    R.forEach((r, i) => { const v = r.hv[60]; s += `<line x1="494" y1="${66 + i * 30}" x2="518" y2="${66 + i * 30}" stroke="${COL[i]}" stroke-width="3"/>` + tx(526, 70 + i * 30, `lr ${LR[i]}: ${isFinite(v) && v < 1e6 ? fm(v, 4) : "diverged, " + (isFinite(v) ? v.toExponential(1) : "inf")}`, null, "t"); });
    s += `<line x1="494" y1="${66 + 4 * 30}" x2="518" y2="${66 + 4 * 30}" stroke="${C.gray}" stroke-width="1.5" stroke-dasharray="6 4"/>` + tx(526, 70 + 4 * 30, "baseline " + fm(base, 4), null, "t");
    s += tx(70, 292, md ? "each rate inherits the weights the previous rate reached, so the order decides the ranking" : "every rate starts at w = −0.6950, b = −0.4962 with its own optimizer", null, "th");
    fig.innerHTML = svg(306, s) + ML.code(md ? ["model = nn.Linear(1, 1)", "for lr in [0.01, 0.1, 0.5, 1.1]:", "    optimizer = torch.optim.SGD(model.parameters(), lr=lr)", "    history[lr] = train_full_batch(model, optimizer, epochs=60)   # continues"] : ["initial_state = copy.deepcopy(nn.Linear(1, 1).state_dict())   # seeded", "for lr in [0.01, 0.1, 0.5, 1.1]:", "    model = nn.Linear(1, 1)", "    model.load_state_dict(initial_state)", "    optimizer = torch.optim.SGD(model.parameters(), lr=lr)", "    history[lr] = train_full_batch(model, optimizer, epochs=60)"], md ? 0 : 3);
  };
  ctl.querySelectorAll("button[data-k9]").forEach(b => b.onclick = () => { md = +b.dataset.k9; u(); }); u();
}},

{s: "10. Reading the curves", t: "Learn the six shapes of a training curve and what each one asks you to do",
intu: String.raw`HW6 asks whether the curves show slow optimization, stable convergence or noisy updates, and HW8 asks for underfitting and overfitting from the same pictures. Plot the training and validation losses of the same fixed model every epoch, on a log scale when they span decades, and read the shape before reading any single number. The first four runs train the line of this lesson with SGD in batches of 8 at four learning rates. The last two reuse the curved data of card 8, once with a model that is too simple and once with the large network. Each shape points to a different fix, and only one of them, overfitting, is solved by the checkpoint of card 8.`,
eq: String.raw`\[ \text{read: level, slope, noise, and the gap } J_{\text{val}} - J_{\text{train}} \]`,
sym: [["level", "where the curves settle, compare with a baseline and the noise"], ["slope at the end", "still falling means the run is not finished"], ["noise", "jumps from epoch to epoch, a large step or a small batch"], ["gap", "validation above training, growing means overfitting"], ["log scale", "turns steady exponential progress into a straight line"]],
how: ["Plot both curves from the same end-of-epoch model.", "Use a log scale when the loss spans more than one decade.", "Name the shape before changing anything.", "Change one thing at a time and rerun from the same start.", "Draw the baseline and the noise level when you know them."],
say: String.raw`Training curves show whether a run is too slow, converged, noisy, diverging, underfitting or overfitting, and each pattern calls for its own change, a larger rate, nothing, a smaller step, a much smaller rate, more capacity, or a checkpoint and regularization.`,
num: String.raw`lr 0.002: still falling at epoch 40, training <b>1.337</b>, validation 0.911. lr 0.1: level at <b>0.0354</b> and 0.0222. lr 0.8: training jumps between 0.0358 and 0.1156. lr 1.6: grows about a thousandfold per epoch, inf at epoch 12, the guard raises at epoch 13. Line on the curve: <b>0.248</b> and 0.225, flat. Large network: training 0.0192, validation up from 0.0567 to 0.0858.`,
r(fig, ctl) {
  const PT = [
    ["too slow", "slow", 40, -2, 1, "SGD, lr 0.002, batches of 8", "both curves still falling at the end, the run is not finished", "raise the learning rate or train longer"],
    ["converged", "good", 40, -2, 1, "SGD, lr 0.1, batches of 8", "a fast fall, then both level off near the noise variance 0.04", "stop, then compare with the baseline"],
    ["noisy", "noisy", 40, -2, 1, "SGD, lr 0.8, batches of 8", "low after one epoch, then jumps from epoch to epoch", "lower or decay the rate, or use larger batches, and select by validation"],
    ["diverging", "diverge", 13, 0, 36, "SGD, lr 1.6, batches of 8", "about a thousandfold per epoch, inf at epoch 12", "lower the rate below the edge, check the input scaling, keep the nonfinite guard"],
    ["underfitting", "underfit", 300, -1, 0.3, "a line on the curved data of card 8, Adam", "both curves level off high and close together", "add capacity or features, more epochs will not help"],
    ["overfitting", "over", 600, -2, 0, "the network of card 8, Adam", "training keeps falling while validation turns up after epoch 156", "restore the best checkpoint, regularize or collect more data"]
  ];
  let v = 0;
  ctl.innerHTML = btns(PT.map((q, i) => [i, q[0]]), "k10");
  const u = () => {
    pick(ctl, "k10", v); const [name, kk, n, lo, hi, setup, shape, fix] = PT[v], d = kk === "over" ? C8 : C10[kk];
    const P = plotL(70, 34, 560, 190, [{ d: d.tr, col: C.blue, w: 2.2 }, { d: d.va, col: C.coral, w: 2.2, dash: "6 4" }], { n, lo, hi, nx: kk === "diverge" ? 13 : 5, ny: kk === "diverge" ? 6 : (hi - lo > 2 ? 3 : 4), xl: "epoch", yl: "MSE, log scale" });
    let s = tx(70, 22, name + ": " + setup, null, "th") + P.s + key(70, 286, [["training", C.blue], ["validation", C.coral, "6 4"]]);
    s += tx(70, 312, "shape: " + shape, null, "t") + tx(70, 334, "do: " + fix, null, "th");
    fig.innerHTML = svg(348, s);
  };
  ctl.querySelectorAll("button[data-k10]").forEach(b => b.onclick = () => { v = +b.dataset.k10; u(); }); u();
}},

{s: "11. Bugs in the loop", t: "Nine loop bugs, most of them silent",
intu: String.raw`Most loop bugs raise no error. The code runs, a loss is printed, and the number answers a different question from the one you asked. HW6 Task 1.6 lists four of them: a target of shape (N,) against a prediction of shape (N, 1), a loop that never clears the gradients, an epoch loss that averages batch means, and a learning rate picked on the test set. The others below come from HW8, HW10 and ordinary first projects: a model rebuilt after its optimizer, a running total that keeps the graph, an evaluation that leaves the model in eval mode, backward inside <code>no_grad</code>, and a nonfinite loss that nobody checks. Each one shows the line, what PyTorch prints, and the fix. The numbers come from this lesson's data.`,
eq: String.raw`\[ \text{assert } \texttt{pred.shape == yb.shape}, \qquad \text{assert } \texttt{torch.isfinite(loss)} \]`,
sym: [["silent bug", "the code runs and prints a wrong but plausible number"], ["shape assertion", "HW6 rejects mismatched shapes before the loss"], ["nonfinite guard", "HW6 raises FloatingPointError on inf or nan"], ["loss.item()", "a Python float, no graph attached"], ["optimizer and model", "the optimizer only updates the tensors it was built from"]],
how: ["Assert matching shapes before every loss.", "Guard against a nonfinite loss.", "Accumulate with <code>loss.item()</code>.", "Build the optimizer right after the model it trains.", "Set the mode inside the epoch function, not once at the top."],
say: String.raw`The common training loop bugs are a broadcast between N by 1 and N, missing or misplaced gradient clearing, an optimizer built for a different model, totals that keep the graph, a model left in eval mode, backward under no grad, unchecked nonfinite losses, unweighted epoch averages and selection on the test set.`,
num: String.raw`Target of shape (10,): MSE <b>1.5527</b> instead of <b>0.0209</b>. Model rebuilt after the optimizer: loss <b>3.7043</b> before and after 50 steps, while the new model's weight.grad piles up to 85.16. A tensor total prints 3.5891 with a DivBackward0 <code>grad_fn</code> still attached. Mean of batch means 3.6843 against 3.5891.`,
r(fig, ctl) {
  const B = [
    ["target of shape (N,)", ["pred = model(XV)                    # shape (10, 1)", "loss = loss_fn(pred, yv)            # yv has shape (10,)"], ["UserWarning: Using a target size (torch.Size([10])) that is different to the", "input size (torch.Size([10, 1])). This will likely lead to incorrect results", "due to broadcasting. Please ensure they have the same size.", "tensor(1.5527)"], "yv.view(-1, 1) gives 0.0209, and assert pred.shape == yb.shape as HW6 does", "silent"],
    ["gradients never cleared", ["for xb, yb in loader:", "    loss = loss_fn(model(xb), yb)", "    loss.backward()", "    optimizer.step()                # no zero_grad anywhere"], ["full batch, 60 steps: the loss swings between 0.0965 and 3.9513, card 2"], "optimizer.zero_grad() once per iteration, before backward", "silent"],
    ["model rebuilt after the optimizer", ["model = nn.Linear(1, 1)", "optimizer = torch.optim.SGD(model.parameters(), lr=0.1)", "model = nn.Linear(1, 1)             # a rerun cell builds a new model", "for t in range(50):", "    optimizer.zero_grad()", "    loss_fn(model(X), Y).backward()", "    optimizer.step()"], ["loss before 3.7043, after 50 steps 3.7043", "model.weight.grad = 85.1596, it accumulates because zero_grad clears the old model"], "build the optimizer from the model you train, right after building it", "silent"],
    ["a tensor running total", ["total = total + loss * len(yb)      # no .item()", "print(total / 40)"], ["tensor(3.5891, grad_fn=<DivBackward0>)"], "total += loss.item() * len(yb), a tensor total keeps every batch's graph alive", "silent, memory grows"],
    ["evaluation leaves eval mode on", ["for epoch in range(epochs):", "    for xb, yb in train_loader:     # no model.train() here", "        ...", "    val = evaluate(model, val_loader)   # calls model.eval()"], ["model.training at the start of epoch 2: False", "from epoch 2 on, Dropout is off and BatchNorm stops learning its statistics"], "call model.train() at the start of every training epoch, run_epoch does it", "silent"],
    ["backward under no_grad", ["with torch.no_grad():", "    loss = loss_fn(model(X), Y)", "    loss.backward()"], ["RuntimeError: element 0 of tensors does not require grad and does not", "have a grad_fn"], "training steps run with gradients on, only evaluation goes inside no_grad", "error"],
    ["an unchecked nonfinite loss", ["loss = loss_fn(model(xb), yb)", "if not torch.isfinite(loss):", "    raise FloatingPointError(\"Nonfinite training loss. Check scaling and learning rate.\")"], ["FloatingPointError: Nonfinite training loss. Check scaling and learning rate.", "raised at epoch 13 of the lr 1.6 run on card 10"], "keep this guard, without it the loop runs on and every weight becomes nan", "the fix"],
    ["mean of batch means", ["epoch_mse = sum(batch_means) / len(batch_means)"], ["3.6843 for batches of 32 and 8, the sample-weighted value is 3.5891, card 5"], "weight each batch mean by its size and divide by the number of samples", "silent"],
    ["chosen on the test set", ["best_lr = min(trials, key=lambda t: t[\"test_mse\"])"], ["the reported test MSE is now the best of several looks at the test set"], "select on validation, freeze the choice, then score the test set once, card 12", "silent"]
  ];
  let v = 0;
  ctl.innerHTML = btns(B.map((q, i) => [i, q[0]]), "k11");
  const u = () => {
    pick(ctl, "k11", v); const [name, code, out, fix, kind] = B[v];
    let s = tx(30, 24, name, null, "th");
    s += `<g class="${kind === "the fix" ? "c-teal" : kind === "error" ? "c-purple" : "c-coral"}"><rect x="30" y="38" width="200" height="44" rx="9" stroke-width="0.8"/></g>` + tx(130, 65, kind === "the fix" ? "this is the guard" : kind === "error" ? "raises an error" : kind, "middle", "t");
    s += `<g class="c-teal"><rect x="250" y="38" width="400" height="44" rx="9" stroke-width="0.8"/></g>` + tx(450, 65, fix.length > 62 ? fix.slice(0, 60) + "..." : fix, "middle");
    fig.innerHTML = svg(96, s) + ML.code(code, -1) + ML.term(out) + `<p class="note">Fix: ${ML.esc(fix)}.</p>`;
  };
  ctl.querySelectorAll("button[data-k11]").forEach(b => b.onclick = () => { v = +b.dataset.k11; u(); }); u();
}},

{s: "12. Select, restore, test once", t: "Choose on validation, restore the checkpoint, then open the test set one time",
intu: String.raw`This is the whole workflow of HW6 Problem 2 on the lesson's line. Three learning rates, 0.01, 0.1 and 0.5, each train for 40 epochs in batches of 8 from the same seeded initial state and the same seeded batch order, with a validation checkpoint. The choice is the candidate with the lowest best validation loss, its checkpoint is restored, and only then is the test set scored, once, next to the training-mean baseline and a least squares reference. Step through it. The last step is the temptation that the whole design exists to resist: another candidate happens to score better on the test set. Switching to it now would turn the test set into a second validation set, and its number would no longer estimate performance on new data.`,
eq: String.raw`\[ \alpha^\star = \arg\min_{\alpha} \, \min_{e} J_{\text{val}}(\theta_{\alpha, e}) \]\[ \text{report } J_{\text{test}}(\theta_{\alpha^\star, e^\star}) \ \text{once} \]`,
sym: [[String.raw`\(\alpha^\star\)`, "the learning rate chosen on validation"], [String.raw`\(e^\star\)`, "its best epoch, the restored checkpoint"], ["test set", "10 points, untouched until every choice is frozen"], ["baseline", "predict the training mean, 1.4755"], ["reference", "least squares on the training points"]],
how: ["Split once and lock the test set away.", "Train every candidate fairly with a validation checkpoint.", "Pick the lowest best validation loss.", "Restore that checkpoint and recheck its validation loss.", "Score the test set once and report it with the baseline."],
say: String.raw`Model selection uses validation data only, the selected checkpoint is restored, and the test set is scored once at the end, so that its number estimates performance on new data instead of being one more choice.`,
num: String.raw`Best validation: lr 0.01 <b>0.0533</b> at epoch 40, lr 0.1 <b>0.0202</b> at 40, lr 0.5 <b>0.0167</b> at 23, so lr 0.5 is chosen. Its test MSE is <b>0.0414</b> against <b>1.1901</b> for the baseline and 0.0349 for least squares. lr 0.01 would have scored 0.0353 on the test set, which is no reason to switch.`,
r(fig, ctl) {
  const R = [[0.01, 40, 0.0533, 0.0533, 0.0353], [0.1, 40, 0.0202, 0.0202, 0.0357], [0.5, 23, 0.0167, 0.0179, 0.0414]];
  const N = ["split once", "train every candidate", "select on validation", "restore the checkpoint", "open the test set once", "the temptation"];
  const LB = [["split", "once"], ["train every", "candidate"], ["select on", "validation"], ["restore the", "checkpoint"], ["open the", "test set once"], ["the", "temptation"]];
  ML.stepper(ctl, N.length, k => {
    let s = "";
    N.forEach((n, i) => { const x = 30 + i * 108; s += `<g class="${i === k ? "c-teal" : i < k ? "c-blue" : "c-gray"}"><rect x="${x}" y="14" width="100" height="40" rx="8" stroke-width="${i === k ? 1.8 : 0.6}"/></g>` + tx(x + 50, 30, LB[i][0], "middle", "t") + tx(x + 50, 46, LB[i][1], "middle", "t"); });
    if (k === 0) {
      [["train", 40, C.blue], ["validation", 10, C.purple], ["test, locked", 10, C.coral]].reduce((x, [t, n, col]) => { s += `<rect x="${x}" y="84" width="${n * 10}" height="34" fill="${col}" opacity="0.25" stroke="${col}"/>` + tx(x + n * 5, 106, t + ", " + n, "middle", "t"); return x + n * 10 + 6; }, 30);
      s += tx(30, 150, "60 points of y = 1.5 − 2x plus noise, one split for the whole study", null, "t");
    } else {
      s += tx(40, 86, "lr", null, "th") + tx(110, 86, "best epoch", null, "th") + tx(230, 86, "best validation", null, "th") + tx(380, 86, "final validation", null, "th") + tx(530, 86, "test", null, "th");
      R.forEach((r, i) => {
        const y = 112 + i * 28, chosen = k >= 2 && i === 2;
        s += `<rect x="30" y="${y - 18}" width="620" height="26" rx="5" fill="${chosen ? "var(--teal-bg)" : "var(--sunk)"}"/>` + tx(40, y, String(r[0]), null, "t") + tx(110, y, String(r[1]), null, "t") + tx(230, y, r[2].toFixed(4), null, chosen ? "th" : "t") + tx(380, y, r[3].toFixed(4), null, "t");
        s += tx(530, y, k >= 4 && (i === 2 || k === 5) ? r[4].toFixed(4) : "locked", null, k === 5 && i === 0 ? "th" : "t");
      });
      const msg = [null, "same initial state and batch order, a deep-copied checkpoint per candidate", "lr 0.5 has the lowest best validation loss, 0.0167", "load the epoch 23 state: w = −2.0828, b = 1.4506, validation again 0.0167", "test 0.0414, baseline 1.1901, least squares 0.0349, report 0.0414", "lr 0.01 shows 0.0353 on the test set, switching now would make the test a selection set"][k];
      s += tx(30, 214, msg, null, "th");
    }
    fig.innerHTML = svg(232, s);
  }, N);
}},

{s: "13. With the agent", t: "Do it with the agent: a train.py with tests that pin the loop's contract",
intu: String.raw`The lesson as project code: a <code>train.py</code> with <code>run_epoch</code>, fit with a validation checkpoint and optional patience, and a history that can be plotted, plus tests that pin the contract of this lesson. The tests matter more than the loop. They check that evaluation changes nothing and records no gradients, that the epoch loss is weighted by batch size, that the restored model reproduces the best validation loss, that a fixed seed reproduces the history, and that a learnable synthetic problem beats the training-mean baseline. Once these pass, every model in your project can reuse the same loop.`,
eq: String.raw`\[ \texttt{train.py} \to \texttt{run\_epoch}, \ \texttt{fit} \to \texttt{pytest} \]`,
sym: [[String.raw`\(\texttt{run\_epoch}\)`, "trains with an optimizer, evaluates without one"], ["fit", "epochs, checkpoint, patience, restore, history"], ["history", "training and validation loss per epoch, saved as CSV"], ["contract tests", "this lesson's checks as pytest functions"], ["seed", "torch.<code>manual_seed</code> and a seeded loader generator"]],
how: ["Paste the command.", "Read <code>run_epoch</code>: mode set inside, <code>zero_grad</code> before backward, loss.item() times the batch size.", "Read fit: deepcopy of the state dict, selection on validation, restore and eval at the end.", "Run pytest and compare the numbers with the cards.", "Commit, then use fit for the next model of your project."],
say: String.raw`A training module with one epoch function, a fit function with checkpoints and tests for evaluation side effects, weighting, restoring, reproducibility and a baseline makes every later experiment trustworthy by construction.`,
num: String.raw`The weighting test uses 30 targets of 1 and 5 of 3 with a zero model and batches of 32: the weighted loss is <b>2.142857</b> and the mean of the two batch means would be <b>5.25</b>. The early stopping test feeds validation losses 0.90, 0.70, 0.60, 0.55, 0.58, 0.57, 0.60 with patience 3 and expects a stop after epoch 7 with epoch 4 restored.`,
r(fig, ctl) {
  ML.agent(fig, ctl, {
    prompt: "Create src/train.py with torch only. run_epoch(model, loader, loss_fn, optimizer=None) sets model.train(optimizer is not None), uses torch.set_grad_enabled, clears gradients with zero_grad(set_to_none=True) before backward, asserts pred.shape == yb.shape, raises FloatingPointError on a nonfinite loss, and returns the sample-weighted mean loss (loss.item() times the batch size, divided by the number of samples). fit(model, train_loader, val_loader, loss_fn, optimizer, epochs, patience=None) calls run_epoch for training and validation every epoch, keeps copy.deepcopy(model.state_dict()) of the lowest validation loss, stops after patience epochs without improvement, restores the best state, calls model.eval() and returns a dict with history (train and val lists), best_epoch and best_val. Add save_history(history, path) that writes a CSV. Create tests/test_train.py: (1) a zero nn.Linear(1, 1) on 35 samples with 30 targets 1 and 5 targets 3 in batches of 32 gives 2.142857 from run_epoch without an optimizer, (2) evaluation leaves the state dict unchanged, every p.grad None and model.training False on a model with BatchNorm1d and Dropout, (3) after fit, run_epoch on the validation loader equals best_val, (4) a stub that returns validation losses 0.90, 0.70, 0.60, 0.55, 0.58, 0.57, 0.60 with patience 3 stops after epoch 7 with best_epoch 4, (5) two fits with the same seeds give identical histories, (6) on 200 points of y = 2x + 1 plus noise 0.1 the fitted line beats the training-mean baseline on validation by a factor of 10. Run pytest and show me the output.",
    actions: ["$ pytest -q tests/test_train.py", "......                                                   [100%]", "6 passed in 2.41s"],
    files: [["src/train.py", "run_epoch, fit with checkpoint and patience, save_history"], ["tests/test_train.py", "weighting, no side effects, restore, early stopping, seeds, baseline"]],
    checks: ["the mode is set inside run_epoch on every call", "zero_grad comes before backward and step after it", "the total uses loss.item(), not the loss tensor", "the checkpoint is a deepcopy and selection uses validation only", "partial batches are kept, drop_last is False for evaluation", "the weighting test expects 2.142857, not 5.25"]
  });
}},

{s: "14. Test", t: "Lesson 24 test: the training loop",
intu: String.raw`Twelve questions on the five steps and their order, the optimizer, batches and epochs, the epoch loss, modes, checkpoints, early stopping and fair comparisons. All numbers are new.`,
eq: String.raw`\[ \text{12 questions} \]`,
sym: [["pass mark", "9 of 12, then redo the missed cards"]],
how: ["Write the five steps out before answering order questions.", "Answer without running anything.", "Reopen the named card for any miss."],
say: String.raw`Twelve questions covering the whole lesson.`,
num: String.raw`Score <b>9 or more</b> to move on to data in PyTorch.`,
r(fig, ctl) {
  ML.quiz(fig, ctl, [
    { q: "A training set of 500 samples is loaded with <code>batch_size=64</code> and <code>drop_last=False</code>. How many batches does one epoch have, and how large is the last one?", o: ["8 batches, the last of 52", "7 batches, the last of 52", "8 batches, all of 64", "7 batches, all of 64"], a: 0, why: "7 × 64 = 448, so 7 full batches and an eighth with 500 − 448 = 52. Card 4." },
    { q: "Three batches of 16, 16 and 8 samples have mean losses 0.5, 0.3 and 1.1. What is the sample-weighted epoch loss?", o: ["0.6333", "0.54", "0.45", "0.63"], a: 1, why: "(16 × 0.5 + 16 × 0.3 + 8 × 1.1) / 40 = 21.6 / 40 = 0.54. The mean of the means, 0.6333, overweights the small batch. Card 5." },
    { q: "What does this loop do to the parameters?", code: "for xb, yb in loader:\n    loss = loss_fn(model(xb), yb)\n    loss.backward()\n    optimizer.zero_grad()\n    optimizer.step()", o: ["trains normally", "never changes them", "accumulates gradients", "raises an error on the second batch"], a: 1, why: "zero_grad sets every grad to None just before step, so step has nothing to apply. Card 2." },
    { q: "A loop never calls <code>zero_grad</code>. A parameter's gradient is 2 on every one of three backward calls. What is <code>p.grad</code> after the third?", o: ["2", "8", "6", "None"], a: 2, why: "backward adds into p.grad: 2 + 2 + 2 = 6. Card 2 and Lesson 22." },
    { q: "The model ŷ = wx starts at w = 1 on the samples (1, 3) and (2, 4) with <code>nn.MSELoss</code> and SGD at lr 0.05. What is w after one step?", o: ["1.15", "1.6", "0.7", "1.3"], a: 3, why: "Residuals −2 and −2, gradient (2/2)(−2 · 1 − 2 · 2) = −6, so w = 1 − 0.05 × (−6) = 1.3. Card 1." },
    { q: "Which statement is correct?", o: ["model.eval() turns off gradient recording", "torch.no_grad() makes Dropout pass values through", "model.eval() changes Dropout and BatchNorm, torch.no_grad() stops the graph", "either one alone is enough for validation"], a: 2, why: "The two switches are independent and validation needs both. Card 6." },
    { q: "A model with BatchNorm is scored on the validation set in train mode inside <code>torch.no_grad()</code>. What else happens?", o: ["the running statistics are updated with validation data", "nothing, no_grad protects the model", "the weights are updated", "an error is raised"], a: 0, why: "In train mode BatchNorm normalizes with the batch statistics and updates its running buffers, so evaluation changes the model. Card 6." },
    { q: "During 100 epochs the code keeps <code>best = model.state_dict()</code> when validation improves, last at epoch 30, and loads <code>best</code> after the loop. Which weights does the model have?", o: ["those of epoch 30", "those of epoch 100", "the initial weights", "an average of epochs 30 to 100"], a: 1, why: "state_dict returns references to the live tensors, so best followed the model to epoch 100. Use copy.deepcopy. Card 8." },
    { q: "Validation losses by epoch are 0.90, 0.70, 0.60, 0.55, 0.58, 0.57, 0.60, 0.52. With patience 3, when does training stop and which epoch is restored?", o: ["after epoch 8, epoch 8", "after epoch 6, epoch 4", "after epoch 5, epoch 4", "after epoch 7, epoch 4"], a: 3, why: "The best is epoch 4. Epochs 5, 6 and 7 do not improve, so the loop stops after epoch 7 and never sees 0.52. Card 8." },
    { q: "Learning rates 0.001, 0.01 and 0.1 are compared by training one model at 0.001, then continuing the same model at 0.01, then at 0.1. What is wrong?", o: ["later rates start from weights the earlier rates trained, so the order decides the ranking", "nothing, each rate gets the same number of epochs", "the rates are too far apart", "the optimizer must be Adam"], a: 0, why: "HW5 loads one saved initial state into a fresh model with a fresh optimizer for every rate. Card 9." },
    { q: "For a full-batch linear least squares problem the largest eigenvalue of the curvature of the MSE is 2.5. Above which learning rate does plain gradient descent diverge?", o: ["0.4", "1.25", "0.8", "2.5"], a: 2, why: "The step is stable for lr below 2 / 2.5 = 0.8. Card 9 and Lesson 16." },
    { q: "Roughly how many numbers of optimizer state does Adam keep for a model with 1,000 parameters?", o: ["none", "1,000", "2,000, two running averages per parameter", "3,000"], a: 2, why: "exp_avg and exp_avg_sq for every parameter, plus a step count per tensor. Plain SGD keeps none, momentum keeps 1,000. Card 3." }
  ], "Lesson 24 test");
}}
],
summary: String.raw`Training is a model, a loss and an optimizer, Ng's three steps, followed by a loop in which every batch clears the gradients, predicts, computes the batch loss, backpropagates and steps. The clear can sit anywhere before backward, the step must come after it, and every iteration needs its own forward pass. The optimizer holds the parameters with their settings and, for momentum and Adam, a state per parameter. An epoch is one pass, N over B rounded up iterations, and the epoch loss weights each batch mean by its size. Evaluation needs both eval mode and no grad, and an epoch function that trains with an optimizer and evaluates without one keeps the two consistent. The best validation state is kept as a deep copy and restored, early stopping uses a patience, and fair comparisons start every candidate from the same saved state with a fresh optimizer. Read the curves for slow, converged, noisy, diverging, underfitting and overfitting runs, guard against shape mismatches and nonfinite losses, select on validation and score the test set once.`,
sheet: [[String.raw`\[ \theta \leftarrow \theta - \alpha \nabla_\theta J_{\text{batch}} \]`, "one update"], [String.raw`\[ J_{\text{batch}} = \frac{1}{B} \sum_{i=1}^{B} (\hat y_i - y_i)^2 \]`, "MSELoss, mean over the batch"], [String.raw`\[ K = \lceil N / B \rceil, \quad \text{updates} = E K \]`, "batches and updates"], [String.raw`\[ \bar L = \frac{\sum_b n_b L_b}{\sum_b n_b} \]`, "epoch loss"], [String.raw`\[ v \leftarrow \mu v + g, \quad \theta \leftarrow \theta - \alpha v \]`, "SGD with momentum"], [String.raw`\[ \theta \leftarrow \theta - \alpha \frac{\hat m}{\sqrt{\hat s} + \epsilon} \]`, "Adam with bias-corrected averages"], [String.raw`\[ \alpha \lt \frac{2}{\lambda_{\max}} \]`, "full-batch stability on a quadratic"], [String.raw`\[ e^\star = \arg\min_e J_{\text{val}}(\theta_e) \]`, "checkpoint epoch"]],
sources: ["AME 5970 Lecture 4 notes (OOP and PyTorch), topic order only, the PDF was not available to this build", "AME 5970 HW5 Problem 2 (gradient descent on x², train_at_rate with one saved initial state, a fresh model and optimizer for each learning rate)", "AME 5970 HW6 Problem 1 (make_loader, train_one_epoch, evaluate_mse, the sample-weighted epoch loss, fit_model with a deep-copied checkpoint, Task 1.6 fragments A to D) and Problem 2.3 and 2.4 (repeatable trials, selection on validation)", "AME 5970 HW8 2C (fit_regressor with Adam and the best epoch) and HW10 A3 and A4 (run_epoch, fit_classifier, the evaluation-state check), with the HW8 and HW10 solutions docs", "Andrew Ng, Machine Learning Specialization, course 2 week 2 (model training steps) and Deep Learning Specialization, course 2 week 1 (train, dev and test sets) and week 2 (mini-batch gradient descent, momentum, Adam)", "Raschka, Liu and Mirjalili (2022), Machine Learning with PyTorch and Scikit-Learn, chapter 12 (training a model in PyTorch)", "PyTorch documentation: Optimizing model parameters tutorial, torch.optim, Module.train and eval, torch.no_grad, Saving and loading a general checkpoint"]
});
})();

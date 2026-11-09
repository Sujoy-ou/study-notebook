/* Lesson 39: Recurrent neural networks. Shelf ml, group seq. */
(function () {
const C = ML.C;
const tx = (x, y, t, a, cls) => `<text class="${cls || "ts"}" x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""}>${t}</text>`;
const f = (v, d) => { const s = (+v).toFixed(d == null ? 4 : d); return /^-0(\.0*)?$/.test(s) ? s.slice(1) : s; };
const mn = v => String(v).replace(/-/g, "−");
const fm = (v, d) => mn(f(v, d));
const cm = v => mn(Math.round(v).toLocaleString("en-US"));
const ex = v => mn(v.toExponential(1));
const TB = (head, rows) => `<table style="width:100%;border-collapse:collapse;font-size:13px;margin-top:6px"><tr>${head.map(h => `<th style="text-align:left;padding:4px 6px;border-bottom:1.5px solid var(--line);color:var(--muted);font-weight:600">${h}</th>`).join("")}</tr>${rows.map(r => `<tr>${r.map(c => `<td style="padding:4px 6px;border-bottom:1px solid var(--line);vertical-align:top">${c}</td>`).join("")}</tr>`).join("")}</table>`;
const legend = (items, x0, y, dx) => items.map(([lab, col, dash], i) => `<line x1="${x0 + i * dx}" y1="${y - 4}" x2="${x0 + i * dx + 18}" y2="${y - 4}" stroke="${col}" stroke-width="3" ${dash ? `stroke-dasharray="${dash}"` : ""}/>` + tx(x0 + i * dx + 23, y, lab)).join("");
const vec = (v, d) => "(" + v.map(x => fm(x, d == null ? 4 : d)).join(", ") + ")";
const rect = (x, y, w, h, fill, stroke, sw) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${fill}" stroke="${stroke}" stroke-width="${sw || 1}"/>`;
const ln = (x1, y1, x2, y2, col, w, dash) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="${w || 1.4}" ${dash ? `stroke-dasharray="${dash}"` : ""} marker-end="url(#ar)"/>`;
const sl = (id, lab, min, max, step, val) => `<div class="row"><label style="min-width:150px">${lab}</label><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${val}" style="flex:1"><span class="v" id="${id}v"></span></div>`;
const val = id => +document.getElementById(id).value;
const setv = (id, t) => { document.getElementById(id + "v").textContent = mn(t); };

/* card 2 cell: n_a = 2, n_x = 1, n_y = 1, linear output */
const CELL = { Waa: [[0.5, -1], [1, 0.5]], Wax: [1, 0.5], Wya: [1, -1] };
const cellRun = xs => { let a = [0, 0]; return xs.map(x => { const z = [CELL.Waa[0][0] * a[0] + CELL.Waa[0][1] * a[1] + CELL.Wax[0] * x, CELL.Waa[1][0] * a[0] + CELL.Waa[1][1] * a[1] + CELL.Wax[1] * x]; a = z.map(Math.tanh); return { x, z, a: a.slice(), y: CELL.Wya[0] * a[0] + CELL.Wya[1] * a[1] }; }); };
/* nn.RNN parameter count, checked against PyTorch 2.15 */
const rnnParams = (I, H, L, D) => { let n = 0; for (let l = 0; l < L; l++) n += D * (H * (l ? H * D : I) + H * H + 2 * H); return n; };

const MEM = {"rnn5":{"acc":[1.0,1.0,1.0],"ratio":[0.00737,0.183,0.162]},"rnn10":{"acc":[1.0,1.0,1.0],"ratio":[0.00345,0.00609,0.0608]},"rnn20":{"acc":[1.0,1.0,1.0],"ratio":[4.72e-06,1.04e-06,0.000276]},"rnn40":{"acc":[1.0,0.495,1.0],"ratio":[7.35e-12,2.38e-11,1.01e-08]},"rnn80":{"acc":[0.495,0.495,1.0],"ratio":[9.11e-22,1.78e-21,5.3e-18]},"lstm5":{"acc":[1.0,1.0,1.0],"ratio":[0.06,0.0258,0.0468]},"lstm10":{"acc":[1.0,1.0,1.0],"ratio":[0.00178,0.00616,0.00379]},"lstm20":{"acc":[0.505,0.505,0.495],"ratio":[1.29e-05,4.52e-05,6.13e-05]},"lstm40":{"acc":[0.505,0.495,0.505],"ratio":[6.42e-11,5.65e-09,6.78e-09]},"lstm80":{"acc":[0.495,0.495,0.505],"ratio":[2.58e-20,6.8e-17,6.27e-16]},"gru5":{"acc":[1.0,1.0,1.0],"ratio":[0.254,0.0744,0.0122]},"gru10":{"acc":[1.0,1.0,1.0],"ratio":[0.0199,0.00554,0.00498]},"gru20":{"acc":[1.0,1.0,0.495],"ratio":[8.32e-05,2.24e-05,5.56e-05]},"gru40":{"acc":[0.505,0.495,0.505],"ratio":[2.95e-08,2.72e-09,3.06e-09]},"gru80":{"acc":[0.495,0.495,0.505],"ratio":[1.21e-15,2.85e-17,8.27e-18]},"lstmfb5":{"acc":[1.0,1.0,1.0],"ratio":[0.8,0.542,1.99]},"lstmfb10":{"acc":[1.0,1.0,1.0],"ratio":[0.616,0.541,0.92]},"lstmfb20":{"acc":[1.0,1.0,1.0],"ratio":[0.0864,0.646,0.181]},"lstmfb40":{"acc":[1.0,1.0,0.997],"ratio":[0.0255,0.419,0.0478]},"lstmfb80":{"acc":[0.495,0.495,0.505],"ratio":[0.0018,0.135,0.00581]}};
const TF = {"tf0":{"one":0.00837,"err":[0.0057,0.0079,0.0098,0.0112,0.0137,0.0153,0.0145,0.0108,0.008,0.0076,0.0089,0.0094,0.01,0.0122,0.0124,0.0143,0.0133,0.0135,0.0131,0.014,0.015,0.014,0.0122,0.0118,0.0156,0.0209,0.0286,0.0315,0.0278,0.0267,0.0271,0.025,0.0212,0.0175,0.0162,0.0168,0.0181,0.0222,0.0243,0.0308,0.0391,0.0494,0.0533,0.0481,0.0373,0.0321,0.0346,0.0374,0.0362,0.034,0.032,0.0376,0.0405,0.0424,0.0449,0.0509,0.0565,0.0591,0.0519,0.0433,0.0406,0.0469,0.0615,0.0681,0.0689,0.0672,0.0644,0.0678,0.0686,0.0615,0.0539,0.0512,0.0554,0.0556,0.0527,0.0586,0.0732,0.0972,0.1151,0.1214,0.1084],"ex":[1.435,1.53,1.345,0.985,0.496,0.047,-0.37,-0.588,-0.642,-0.544,-0.493,-0.461,-0.508,-0.658,-0.885,-1.069,-1.125,-0.987,-0.63,-0.104,0.459,0.938,1.232,1.343,1.238,0.984,0.685,0.434,0.26,0.232,0.235,0.269,0.244,0.088,-0.222,-0.696,-1.117,-1.429,-1.516,-1.369,-1.017,-0.536,-0.104,0.296,0.525,0.595,0.551,0.496,0.437,0.493,0.695,0.951,1.11,1.189,0.997,0.673,0.191,-0.354,-0.857,-1.126,-1.244,-1.144,-0.933,-0.686,-0.474,-0.332,-0.31,-0.362,-0.347,-0.317,-0.131,0.201,0.678,1.115,1.464,1.523,1.382,1.052,0.586,0.14,-0.232]},"tf1":{"one":0.00869,"err":[0.0061,0.0065,0.0078,0.0091,0.0097,0.011,0.0114,0.0103,0.0079,0.0068,0.0066,0.0073,0.0094,0.0115,0.0162,0.0184,0.0178,0.0176,0.0162,0.0155,0.0165,0.0172,0.0169,0.0153,0.0152,0.0174,0.0216,0.0256,0.0286,0.0316,0.0322,0.0295,0.0254,0.0211,0.0188,0.0201,0.0242,0.0319,0.0354,0.0418,0.0458,0.05,0.0518,0.0544,0.0521,0.0462,0.0401,0.0332,0.0286,0.03,0.0358,0.0475,0.0554,0.0635,0.0678,0.0689,0.0661,0.0619,0.0583,0.0567,0.0545,0.0556,0.0563,0.0619,0.0746,0.0861,0.0948,0.0991,0.1007,0.0913,0.0763,0.0662,0.0625,0.0645,0.0724,0.08,0.095,0.1047,0.1187,0.1301,0.1338],"ex":[1.343,1.429,1.25,0.9,0.427,-0.022,-0.435,-0.644,-0.634,-0.593,-0.491,-0.453,-0.519,-0.639,-0.858,-1.051,-1.095,-0.939,-0.571,-0.04,0.529,0.973,1.262,1.306,1.149,0.851,0.54,0.3,0.192,0.181,0.245,0.281,0.197,-0.049,-0.402,-0.827,-1.216,-1.465,-1.468,-1.253,-0.867,-0.379,0.077,0.428,0.598,0.599,0.526,0.42,0.416,0.53,0.718,0.951,1.081,1.059,0.817,0.442,-0.079,-0.612,-1.018,-1.217,-1.199,-1.032,-0.758,-0.53,-0.381,-0.333,-0.345,-0.403,-0.337,-0.228,0.06,0.49,0.924,1.277,1.452,1.384,1.102,0.673,0.193,-0.162,-0.466]},"tf2":{"one":0.00681,"err":[0.0031,0.0029,0.0039,0.0038,0.0046,0.0055,0.0062,0.0057,0.0049,0.0039,0.0023,0.002,0.0031,0.0047,0.0049,0.0037,0.0034,0.0036,0.0039,0.0037,0.0036,0.0032,0.0037,0.0039,0.0039,0.0036,0.0042,0.0056,0.007,0.007,0.0057,0.0045,0.0035,0.0035,0.0042,0.0043,0.0043,0.0045,0.0044,0.0041,0.0038,0.0037,0.004,0.0049,0.0053,0.0049,0.0042,0.0033,0.0029,0.0036,0.0046,0.0048,0.0045,0.0041,0.0047,0.0064,0.0062,0.0046,0.004,0.004,0.0045,0.0044,0.0036,0.0033,0.0036,0.0053,0.0071,0.0077,0.0057,0.0041,0.0042,0.0049,0.0052,0.004,0.0033,0.0041,0.0052,0.0056,0.0044,0.0047,0.0054],"ex":[1.323,1.458,1.346,0.978,0.532,0.103,-0.225,-0.473,-0.504,-0.43,-0.391,-0.403,-0.497,-0.711,-0.957,-1.116,-1.166,-1.028,-0.66,-0.15,0.395,0.856,1.101,1.192,1.075,0.842,0.601,0.457,0.429,0.48,0.559,0.572,0.457,0.202,-0.207,-0.704,-1.135,-1.399,-1.484,-1.317,-0.97,-0.535,-0.141,0.153,0.311,0.294,0.259,0.216,0.269,0.474,0.78,1.069,1.305,1.318,1.186,0.788,0.287,-0.236,-0.681,-0.948,-1.023,-0.911,-0.741,-0.585,-0.482,-0.502,-0.586,-0.69,-0.722,-0.602,-0.317,0.122,0.62,1.054,1.357,1.444,1.323,0.992,0.604,0.279,0.062]},"ss0":{"one":0.0099,"err":[0.0076,0.0046,0.0034,0.0034,0.0052,0.0053,0.0056,0.0042,0.0035,0.0035,0.003,0.0031,0.0034,0.0042,0.0053,0.0056,0.0052,0.0051,0.0048,0.0044,0.0058,0.0067,0.0066,0.006,0.0049,0.0044,0.0035,0.0031,0.0046,0.0064,0.0071,0.0069,0.0052,0.0042,0.0057,0.0076,0.008,0.0085,0.0079,0.0076,0.0083,0.0074,0.0064,0.0062,0.006,0.0062,0.0064,0.0055,0.0057,0.0064,0.0082,0.0087,0.0093,0.0085,0.0084,0.0088,0.0096,0.0087,0.0079,0.0071,0.0077,0.0088,0.0087,0.0075,0.0077,0.0096,0.0105,0.0117,0.0102,0.0095,0.0103,0.0116,0.0126,0.0125,0.0122,0.013,0.0142,0.0157,0.0147,0.0118,0.0101],"ex":[1.328,1.438,1.336,1.0,0.53,0.049,-0.359,-0.581,-0.646,-0.551,-0.444,-0.392,-0.424,-0.58,-0.825,-0.993,-1.063,-0.938,-0.63,-0.151,0.372,0.844,1.173,1.309,1.242,0.964,0.656,0.38,0.227,0.201,0.253,0.302,0.27,0.107,-0.187,-0.626,-1.023,-1.337,-1.447,-1.364,-1.085,-0.627,-0.187,0.182,0.425,0.5,0.454,0.381,0.34,0.427,0.658,0.916,1.122,1.199,1.082,0.794,0.287,-0.243,-0.723,-1.03,-1.153,-1.069,-0.838,-0.593,-0.445,-0.383,-0.445,-0.547,-0.588,-0.51,-0.271,0.126,0.591,1.034,1.369,1.45,1.357,1.051,0.648,0.232,-0.122]},"ss1":{"one":0.01157,"err":[0.0072,0.0061,0.0075,0.0105,0.0132,0.0137,0.0116,0.0116,0.0131,0.0141,0.0123,0.0084,0.0076,0.0093,0.0116,0.0113,0.0086,0.0063,0.0071,0.0096,0.0122,0.011,0.0073,0.0054,0.0067,0.0106,0.0121,0.0118,0.0113,0.0133,0.0168,0.0177,0.0142,0.0117,0.0153,0.0197,0.0188,0.0145,0.0105,0.0091,0.0101,0.0118,0.0109,0.008,0.006,0.0063,0.0075,0.007,0.0058,0.0059,0.008,0.0112,0.0122,0.0125,0.0133,0.0149,0.0166,0.0156,0.0123,0.0097,0.0091,0.0108,0.0128,0.0114,0.0101,0.0094,0.0107,0.0115,0.0102,0.0093,0.0083,0.0088,0.0103,0.0097,0.0087,0.0083,0.0102,0.0158,0.0208,0.0209,0.018],"ex":[1.294,1.455,1.373,1.096,0.668,0.212,-0.17,-0.413,-0.505,-0.454,-0.363,-0.369,-0.459,-0.65,-0.921,-1.134,-1.202,-1.089,-0.765,-0.262,0.322,0.808,1.125,1.246,1.224,1.028,0.743,0.539,0.416,0.381,0.445,0.497,0.442,0.273,-0.038,-0.486,-0.946,-1.302,-1.453,-1.386,-1.15,-0.751,-0.328,0.025,0.292,0.429,0.438,0.393,0.37,0.447,0.651,0.925,1.157,1.295,1.21,0.918,0.455,-0.104,-0.598,-0.931,-1.061,-1.005,-0.859,-0.669,-0.522,-0.477,-0.548,-0.656,-0.682,-0.598,-0.354,0.061,0.583,1.023,1.323,1.472,1.379,1.113,0.747,0.37,0.089]},"ss2":{"one":0.01244,"err":[0.0065,0.0066,0.0077,0.0123,0.0173,0.022,0.0259,0.027,0.0261,0.0242,0.0197,0.0159,0.0174,0.0235,0.0324,0.0433,0.0518,0.0593,0.0692,0.0822,0.0935,0.096,0.0864,0.0687,0.0527,0.0483,0.0529,0.0634,0.0756,0.0937,0.1193,0.1427,0.1547,0.1607,0.1677,0.178,0.1845,0.1761,0.1635,0.1585,0.1713,0.2082,0.2454,0.2666,0.2715,0.2747,0.2785,0.2662,0.2351,0.2097,0.2145,0.2442,0.2692,0.2819,0.2873,0.3125,0.3691,0.4263,0.4465,0.4216,0.3714,0.3272,0.2938,0.2723,0.2739,0.3185,0.4039,0.5043,0.5722,0.5898,0.5942,0.6219,0.6583,0.6634,0.6102,0.519,0.4338,0.3971,0.4253,0.4874,0.5603],"ex":[1.301,1.452,1.392,1.149,0.752,0.345,0.006,-0.216,-0.298,-0.291,-0.266,-0.295,-0.427,-0.647,-0.913,-1.122,-1.214,-1.126,-0.878,-0.508,-0.064,0.409,0.792,0.97,1.029,0.926,0.744,0.592,0.513,0.548,0.662,0.771,0.814,0.701,0.423,0.019,-0.484,-0.963,-1.323,-1.462,-1.349,-1.08,-0.728,-0.381,-0.109,0.024,0.033,0.001,-0.017,0.049,0.252,0.575,0.968,1.29,1.452,1.472,1.274,0.883,0.45,0.067,-0.238,-0.412,-0.465,-0.433,-0.396,-0.441,-0.563,-0.734,-0.916,-1.038,-1.025,-0.904,-0.617,-0.213,0.279,0.735,1.02,1.162,1.137,0.947,0.706]},"clean0":[0.834,0.545,0.093,-0.435,-0.924,-1.265,-1.39,-1.292,-1.025,-0.687,-0.38,-0.18,-0.11,-0.137,-0.183,-0.162,-0.01,0.287,0.681,1.081,1.377,1.479,1.346,1.002,0.53,0.041,-0.355,-0.591,-0.654,-0.593,-0.492,-0.439,-0.491,-0.652,-0.873,-1.063,-1.127,-0.997,-0.661,-0.172,0.372,0.851,1.165,1.263,1.159,0.92,0.646,0.43,0.327,0.337,0.406,0.448,0.38,0.155,-0.22,-0.677,-1.111,-1.411,-1.497,-1.348,-1.004,-0.56,-0.126,0.2,0.371,0.396,0.339,0.288,0.32,0.473,0.728,1.014,1.231,1.284,1.122,0.752,0.243,-0.295,-0.746,-1.022,-1.093,-0.988,-0.788,-0.59,-0.473,-0.47,-0.557,-0.663,-0.696,-0.581,-0.289,0.152,0.654,1.105,1.397,1.464,1.304,0.974,0.575,0.213,-0.032],"noisy0":[1.034,0.621,-0.027,-0.428,-0.867,-1.284,-1.322,-1.298,-0.958,-0.543,-0.447,-0.16,-0.157,-0.124,-0.302,-0.22,-0.029,0.377,0.796,0.949]};

addLesson("ml", "seq", {
level: "Core", num: "Lesson 39",
id: "ml-seq-l39", title: "Recurrent neural networks", short: "39. Recurrent networks",
big: String.raw`Every network so far took one fixed-size input and gave one output. A sentence, a sensor trace or a stock price has a length that changes from example to example, and the meaning of each step depends on the steps before it. A recurrent neural network reads a sequence one step at a time and carries a hidden state \(a^{\langle t \rangle}\) from step to step, with the same weights at every step. This lesson follows Andrew Ng's Deep Learning Specialization course 5 week 1: the notation, the RNN cell by hand, weight sharing, the types of RNN, the language model loss summed over time, backpropagation through time and why its gradients vanish or explode, and gradient clipping. Then it measures the problems on real runs: a memory task where a plain RNN fails once the gap reaches 40 steps, teacher forcing and the drift it causes when the model feeds itself, and padded batches that silently return the wrong hidden state. It ends with the final exam question of which layer to choose for a task.`,
bridge: String.raw`The course has no lecture notes or homework for week 12 (RNNs), so the topic order follows the syllabus and the practice finals' recurring topics (exploding and vanishing gradients, gradient clipping, teacher forcing and exposure bias, choosing nn.LSTM for a task). Andrew Ng's Deep Learning Specialization course 5 week 1 is the spine, with Goodfellow, Bengio and Courville chapter 10, Dive into Deep Learning chapters 9 and 10, Pascanu, Mikolov and Bengio (2013) for clipping and Bengio, Simard and Frasconi (1994) for the vanishing gradient. Lesson 40 builds the LSTM and GRU on this lesson's equations.`,
labels: { note: "Exam and project note" },
cards: [

{s: "1. Sequences and Ng's notation", t: "One input per step, one hidden state carried forward, five shapes of task",
intu: String.raw`Ng writes the t-th element of an input sequence as \(x^{\langle t \rangle}\) and of the output as \(y^{\langle t \rangle}\), with lengths \(T_x\) and \(T_y\). In a name-tagging task the input is a sentence and the output is a 1 for every word that is part of a person's name, so \(T_x = T_y\). A standard network fails here for two reasons Ng gives: sentences have different lengths, and a feature learned for the word in position 2 does not carry over to the same word in position 6. An RNN reads one step at a time with the same weights at every step. Depending on where the inputs and outputs sit, Ng sorts tasks into five shapes. Pick one to see its unrolled picture and an example.`,
eq: String.raw`\[ x = \big(x^{\langle 1 \rangle}, \dots, x^{\langle T_x \rangle}\big), \quad y = \big(y^{\langle 1 \rangle}, \dots, y^{\langle T_y \rangle}\big) \]
\[ x^{(i)\langle t \rangle}: \text{ step } t \text{ of example } i \]`,
sym: [[String.raw`\(x^{\langle t \rangle}\)`, "input at time step t, for words a one-hot vector over the vocabulary"], [String.raw`\(T_x, T_y\)`, "input and output lengths, can differ between examples"], [String.raw`\(x^{(i)\langle t \rangle}\)`, "Ng's notation for step t of training example i"], ["one-hot", "a vector of zeros with a single 1 at the word's index"], ["unrolled", "the same cell drawn once per time step"]],
how: ["Read the tagging sentence and its labels.", "Pick many-to-many with equal lengths and match boxes to words.", "Pick many-to-one and see that only the last step produces an output.", "Pick one-to-many and see the dashed line that feeds each output back in as the next input.", "Pick the encoder and decoder shape, where the output length differs from the input length."],
say: String.raw`A recurrent network processes a sequence one element at a time, carries a hidden state from each step to the next and applies the same weights at every step, so it handles any length and shares what it learns across positions.`,
num: String.raw`The tagging sentence "Ada Lovelace wrote notes for Charles Babbage" has \(T_x = T_y = 7\) and labels (1, 1, 0, 0, 0, 1, 1). With Ng's 10,000-word vocabulary each \(x^{\langle t \rangle}\) is a one-hot vector of length 10,000. A dense first layer with 100 units on sentences padded to 20 words needs 20 · 10,000 · 100 = <b>20,000,000</b> weights and still breaks on 21 words. An RNN with 100 hidden units needs 100 · (100 + 10,000 + 1) = <b>1,010,100</b> parameters for any length.`,
note: String.raw`On the final, name the shape before the layer. Sentiment of a review is many-to-one (use the last hidden state), tagging each word is many-to-many with equal lengths (use every output), translation is an encoder and a decoder, and generating music or text is one-to-many with each output fed back in.`,
r(fig, ctl) {
  const T = [
    ["one-to-one", "a standard network: one image in, one class out", [1], [1], 1, 0],
    ["one-to-many", "music generation: a genre or a first note in, a sequence of notes out", [1], [1, 1, 1, 1, 1], 5, 0],
    ["many-to-one", "sentiment: \"the pump failed twice in one week\" in, one star out", [1, 1, 1, 1, 1], [0, 0, 0, 0, 1], 5, 0],
    ["many-to-many, equal", "name tagging: one label per word, T_x = T_y", [1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1], 7, 0],
    ["encoder and decoder", "translation: \"le chat dort\" in, \"the cat sleeps &lt;EOS&gt;\" out, T_x = 3, T_y = 4", [1, 1, 1, 0, 0, 0, 0], [0, 0, 0, 1, 1, 1, 1], 7, 3]
  ];
  let k = 3;
  ctl.innerHTML = `<div class="row">${T.map((t, i) => `<button data-r1="${i}">${t[0]}</button>`).join("")}</div><div id="r1o"></div>`;
  const W = ["Ada", "Lovelace", "wrote", "notes", "for", "Charles", "Babbage"], Y = [1, 1, 0, 0, 0, 1, 1];
  const u = () => {
    pick(ctl, "r1", k); const [nm, ex1, xin, yout, n, enc] = T[k];
    const dx = Math.min(90, 600 / n), x0 = 340 - (n - 1) * dx / 2;
    let s = tx(340, 22, ex1, "middle", "t");
    for (let i = 0; i < n; i++) {
      const cx = x0 + i * dx, isEnc = enc && i < enc;
      s += rect(cx - 26, 120, 52, 40, isEnc ? "var(--purple-bg, var(--sunk))" : "var(--teal-bg)", isEnc ? C.purple : C.teal, 1.4) + tx(cx, 145, k === 0 ? "net" : "RNN", "middle");
      if (i < n - 1 && k !== 0) s += ln(cx + 26, 140, cx + dx - 28, 140, C.coral, 1.6) + tx(cx + dx / 2, 133, `a⟨${i + 1}⟩`, "middle");
      if (xin[i]) s += ln(cx, 200, cx, 163, "var(--p)", 1.4) + tx(cx, 218, k === 3 ? W[i] : `x⟨${i + 1}⟩`, "middle");
      if (yout[i]) s += ln(cx, 118, cx, 82, "var(--p)", 1.4) + tx(cx, 72, k === 3 ? `y = ${Y[i]}` : `ŷ⟨${enc ? i + 1 - enc : i + 1}⟩`, "middle");
      if (k === 1 && i < n - 1) s += `<path d="M${cx + 8} 70 C ${cx + 40} 52, ${cx + dx - 40} 230, ${cx + dx - 8} 200" fill="none" stroke="${C.gray}" stroke-dasharray="4 3" stroke-width="1.2" marker-end="url(#ar)"/>`;
    }
    s += tx(340, 250, k === 0 ? "no time steps" : `${n} time steps, the same weights in every box`, "middle");
    fig.innerHTML = svg(262, s);
    const use = ["model(x)", "out of every step, each fed back as the next input", "out[:, -1] or h_n[-1], the last hidden state", "out, the hidden state at every step", "the encoder's last state starts the decoder"][k];
    $("r1o").innerHTML = TB(["shape", "what PyTorch output you use"], [[nm, use]]) + (k === 3 ? `<p class="note">The labels mark the four words that belong to names. "Charles" is tagged 1 because of the name that follows it, which a left-to-right RNN has not read yet. Card 4 shows the bidirectional fix.</p>` : "");
  };
  ctl.querySelectorAll("button[data-r1]").forEach(b => b.onclick = () => { k = +b.dataset.r1; u(); });
  u();
}},

{s: "2. The RNN cell by hand", t: "Mix the old hidden state with the new input, squash with tanh, read out",
intu: String.raw`At each step the cell takes the previous activation \(a^{\langle t-1 \rangle}\) and the current input \(x^{\langle t \rangle}\), multiplies each by its own weight matrix, adds a bias and applies tanh. The output \(\hat y^{\langle t \rangle}\) is read from the new activation by one more linear map. Ng starts from \(a^{\langle 0 \rangle} = 0\). Step through a cell with two hidden units, one input and one linear output on the input sequence (1, 0, −1). Then flip the first input to −1 and watch the output at step 3 change: the first input has been carried through the hidden state, which is the network's memory.`,
eq: String.raw`\[ a^{\langle t \rangle} = \tanh\big(W_{aa}\, a^{\langle t-1 \rangle} + W_{ax}\, x^{\langle t \rangle} + b_a\big) \]
\[ \hat y^{\langle t \rangle} = g\big(W_{ya}\, a^{\langle t \rangle} + b_y\big) \]`,
sym: [[String.raw`\(W_{aa}\)`, "hidden to hidden, (\\(n_a\\), \\(n_a\\)), here [[0.5, −1], [1, 0.5]]"], [String.raw`\(W_{ax}\)`, "input to hidden, (\\(n_a\\), \\(n_x\\)), here (1, 0.5)"], [String.raw`\(W_{ya}\)`, "hidden to output, (\\(n_y\\), \\(n_a\\)), here (1, −1)"], [String.raw`\(b_a, b_y\)`, "biases, 0 here"], [String.raw`\(g\)`, "output activation: identity for regression, sigmoid or softmax for classes"]],
how: ["Start with the input sequence (1, 0, −1) and a⟨0⟩ = 0.", "Step to t = 1 and check z = \\(W_{ax}\\) x = (1, 0.5).", "Step to t = 2, where the input is 0 and only the memory term acts.", "Step to t = 3 and read the output.", "Flip the first input and compare all three outputs."],
say: String.raw`The RNN cell computes the new hidden state as the tanh of the old state times \(W_{aa}\) plus the input times \(W_{ax}\) plus a bias, and reads the output from the new state with \(W_{ya}\).`,
num: String.raw`Input (1, 0, −1): \(z^{\langle 1 \rangle}\) = (1, 0.5), \(a^{\langle 1 \rangle}\) = (0.7616, 0.4621), \(\hat y^{\langle 1 \rangle}\) = 0.2995. \(z^{\langle 2 \rangle}\) = (−0.0813, 0.9927), \(a^{\langle 2 \rangle}\) = (−0.0811, 0.7585), \(\hat y^{\langle 2 \rangle}\) = −0.8396. \(a^{\langle 3 \rangle}\) = (−0.9467, −0.1992), \(\hat y^{\langle 3 \rangle}\) = <b>−0.7475</b>. With the first input flipped to −1: outputs −0.2995, 0.8396 and <b>0.4647</b>.`,
note: String.raw`Ng also writes the cell with one stacked matrix, \(a^{\langle t \rangle} = \tanh(W_a [a^{\langle t-1 \rangle}, x^{\langle t \rangle}] + b_a)\) with \(W_a = [W_{aa} \mid W_{ax}]\). It is the same computation. PyTorch keeps the two matrices apart as <code>weight_hh_l0</code> and <code>weight_ih_l0</code>, and gives each its own bias.`,
r(fig, ctl) {
  let k = 0, x1 = 1;
  ctl.innerHTML = `<div class="row"><button data-r2="1">first input +1</button><button data-r2="-1">first input −1</button></div><div id="r2s"></div>`;
  const draw = () => {
    pick(ctl, "r2", x1); const R = cellRun([x1, 0, -1]);
    let s = "";
    R.forEach((r, i) => {
      const cx = 160 + i * 200, on = i <= k, cur = i === k;
      s += rect(cx - 70, 110, 140, 82, cur ? "var(--teal-bg)" : "var(--sunk)", cur ? C.teal : "var(--line)", cur ? 2 : 1) + tx(cx - 68, 104, `t = ${i + 1}`, null, "th");
      s += tx(cx, 226, `x⟨${i + 1}⟩ = ${fm(r.x, 0)}`, "middle", "t") + ln(cx, 212, cx, 195, "var(--p)");
      if (on) {
        s += tx(cx, 134, `z = ${vec(r.z)}`, "middle") + tx(cx, 156, "tanh", "middle") + tx(cx, 178, `a = ${vec(r.a)}`, "middle");
        s += ln(cx, 108, cx, 66, "var(--p)") + tx(cx, 56, `ŷ = ${fm(r.y)}`, "middle", "t");
      }
      if (i < 2) s += ln(cx + 70, 150, cx + 138, 150, on && i < k ? C.coral : "var(--line)", 1.8);
    });
    s += tx(14, 146, "a⟨0⟩ = 0", null) + ln(30, 154, 86, 154, C.coral, 1.4);
    fig.innerHTML = svg(240, s) + ML.readout([["outputs so far", R.slice(0, k + 1).map(r => fm(r.y)).join(", ")], ["W_aa a⟨t−1⟩ at this step", vec(k ? [CELL.Waa[0][0] * R[k - 1].a[0] + CELL.Waa[0][1] * R[k - 1].a[1], CELL.Waa[1][0] * R[k - 1].a[0] + CELL.Waa[1][1] * R[k - 1].a[1]] : [0, 0])], ["W_ax x⟨t⟩", vec([CELL.Wax[0] * R[k].x, CELL.Wax[1] * R[k].x])]].map(([a, b]) => [a, mn(b)]));
  };
  const st = ML.uid("s2");
  $("r2s").innerHTML = `<div id="${st}"></div>`;
  ML.stepper(document.getElementById(st), 3, kk => { k = kk; draw(); }, ["t = 1", "t = 2, memory only", "t = 3"]);
  ctl.querySelectorAll("button[data-r2]").forEach(b => b.onclick = () => { x1 = +b.dataset.r2; draw(); });
}},

{s: "3. One set of weights for every step", t: "Unrolling, weight sharing and the parameter count",
intu: String.raw`Unrolled, an RNN looks like a deep network with one layer per time step, but every layer is the same layer. The weights \(W_{aa}\), \(W_{ax}\), \(W_{ya}\) and the biases are shared across all steps, so the parameter count depends on the sizes \(n_x\), \(n_a\) and \(n_y\) and not on the sequence length. Ng stacks the two input matrices side by side into \(W_a\) with shape \((n_a, n_a + n_x)\). PyTorch's nn.RNN stores them separately and adds a second bias, so its count is larger by \(n_a\). Move the sliders and the length to compare.`,
eq: String.raw`\[ \text{Ng: } n_a (n_a + n_x + 1) + n_y (n_a + 1) \]
\[ \texttt{nn.RNN}: n_a n_x + n_a^2 + 2 n_a \]`,
sym: [[String.raw`\(n_x, n_a, n_y\)`, "input size, hidden size, output size"], [String.raw`\(W_a = [W_{aa} \mid W_{ax}]\)`, "Ng's stacked matrix"], [String.raw`\(\texttt{weight\_ih\_l0}\)`, "PyTorch's \\(W_{ax}\\), shape (hidden, input)"], [String.raw`\(\texttt{weight\_hh\_l0}\)`, "PyTorch's \\(W_{aa}\\), shape (hidden, hidden)"], [String.raw`\(\texttt{bias\_ih\_l0}, \texttt{bias\_hh\_l0}\)`, "two biases that always appear added together"]],
how: ["Pick the small cell of card 2.", "Pick Ng's word model with a 10,000-word vocabulary and 100 hidden units.", "Drag the length and see that the RNN count does not move.", "Compare with a dense layer over the padded sequence.", "Read the PyTorch count with its second bias."],
say: String.raw`An RNN uses the same weights at every time step, so its parameter count is set by the input, hidden and output sizes and does not grow with the sequence length.`,
num: String.raw`nn.RNN(10, 20) has 20 · 10 + 20 · 20 + 2 · 20 = <b>640</b> parameters, nn.RNN(1, 16) has 304 and nn.RNN(10,000, 100) has <b>1,010,200</b>, all checked with PyTorch 2.15. Ng's count for the last one without an output layer is 1,010,100. A dense layer from 20 padded one-hot words to 100 units has 20,000,100.`,
note: String.raw`The shared weights are also why an RNN generalizes across positions: the word "Babbage" is processed by the same \(W_{ax}\) whether it is word 2 or word 9. A dense layer over the padded sentence would have to learn it separately in every slot.`,
r(fig, ctl) {
  const P = [["card 2 cell", 1, 2, 1], ["Ng's word model", 10000, 100, 1], ["character model", 27, 50, 27], ["sensor, 8 channels", 8, 32, 1]];
  let p = 1;
  ctl.innerHTML = `<div class="row">${P.map((q, i) => `<button data-r3="${i}">${q[0]}</button>`).join("")}</div>` + sl("r3t", "sequence length T", 1, 60, 1, 20) + `<div id="r3o"></div>`;
  const u = () => {
    pick(ctl, "r3", p); const [, nx, na, ny] = P[p], T = val("r3t"); setv("r3t", T);
    const ng = na * (na + nx + 1) + ny * (na + 1), pt = nx * na + na * na + 2 * na, dense = T * nx * na + na;
    const sc = v => Math.max(4, 640 * Math.log10(v + 1) / 8);
    let s = tx(20, 22, "parameters, log scale up to 1e8", null, "t");
    [["RNN, Ng's count", ng, C.teal], ["nn.RNN plus nn.Linear output", pt + ny * (na + 1), C.blue], [`dense over ${T} padded steps`, dense, C.coral]].forEach(([lab, v, col], i) => {
      const y = 46 + i * 44; s += tx(20, y - 5, `${lab}: ${cm(v)}`) + `<rect x="20" y="${y}" width="${sc(v)}" height="18" rx="4" fill="${col}" opacity="0.8"/>`;
    });
    const bx = 60, by = 190, cw = Math.min(40, 260 / (na + nx > 12 ? 12 : na + nx));
    s += tx(20, by - 12, `Ng's W_a = [W_aa | W_ax] has shape (${cm(na)}, ${cm(na + nx)})`, null, "t");
    s += rect(bx, by, 150, 60, "var(--teal-bg)", C.teal) + tx(bx + 75, by + 35, `W_aa (${cm(na)}, ${cm(na)})`, "middle");
    s += rect(bx + 155, by, 200, 60, "var(--sunk)", C.blue) + tx(bx + 255, by + 35, `W_ax (${cm(na)}, ${cm(nx)})`, "middle");
    s += rect(bx + 380, by, 60, 60, "var(--sunk)", C.gray) + tx(bx + 410, by + 35, "b_a", "middle") + tx(bx + 470, by + 35, `plus W_ya (${cm(ny)}, ${cm(na)})`, null);
    fig.innerHTML = svg(270, s);
    $("r3o").innerHTML = TB(["count", "value"], [["Ng: n_a(n_a + n_x + 1) + n_y(n_a + 1)", cm(ng)], ["nn.RNN(n_x, n_a) alone", cm(pt)], ["extra second bias in PyTorch", cm(na)], ["length T changes the RNN count by", "0"]]);
  };
  ctl.querySelectorAll("button[data-r3]").forEach(b => b.onclick = () => { p = +b.dataset.r3; u(); });
  $("r3t").oninput = u; u();
}},

{s: "4. nn.RNN and its two outputs", t: "batch_first, out and h_n, stacked layers and two directions",
intu: String.raw`nn.RNN returns two tensors. out holds the top layer's hidden state at every time step, which is what a many-to-many task uses. <code>h_n</code> holds the last hidden state of every layer and direction, which is what a many-to-one task uses. By default PyTorch expects the time axis first, (T, B, features), and with <code>batch_first</code>=True it expects (B, T, features), but <code>h_n</code> keeps the batch in dimension 1 either way. A bidirectional RNN runs a second RNN from the end of the sequence to the start, so each step sees the past and the future, which is what Ng's name tagger needs for "Charles". Then the backward direction's last state sits at time step 0, not at the end. Set the options and see which cells land in out and in <code>h_n</code>.`,
eq: String.raw`\[ \texttt{out}: (B, T, D \cdot H), \quad \texttt{h\_n}: (D \cdot L, B, H) \]
\[ D = 2: \quad \texttt{out[:, -1, :H]} = \texttt{h\_n[-2]} \]
\[ \texttt{out[:, 0, H:]} = \texttt{h\_n[-1]} \]`,
sym: [[String.raw`\(B, T, H\)`, "batch size, sequence length, hidden size"], [String.raw`\(L\)`, "<code>num_layers</code>, stacked RNNs, each reading the outputs of the one below"], [String.raw`\(D\)`, "2 for bidirectional, else 1"], [String.raw`\(\texttt{batch\_first}\)`, "changes the layout of input and out, never of <code>h_n</code>"], ["out", "top layer, every time step"], [String.raw`\(\texttt{h\_n}\)`, "every layer, last step of each direction"]],
how: ["Start with one layer, one direction and <code>batch_first</code> on, and check out[:, −1] equals <code>h_n</code>[0].", "Add a second layer and see <code>h_n</code> gain a row while out keeps its shape.", "Switch on bidirectional and see out double its last dimension.", "Find the backward direction's final state at the left end.", "Switch <code>batch_first</code> off with a (4, 7, 3) input and read the silent result."],
say: String.raw`nn.RNN returns out, the top layer's hidden state at every time step with shape batch, time, directions times hidden, and <code>h_n</code>, the final hidden state of every layer and direction with shape layers times directions, batch, hidden.`,
num: String.raw`nn.RNN(3, 5, <code>batch_first</code>=True) on x of shape (4, 7, 3): out (4, 7, 5), <code>h_n</code> (1, 4, 5), 50 parameters, out[:, −1] equals <code>h_n</code>[0]. <code>num_layers</code>=2: <code>h_n</code> (2, 4, 5), 110 parameters. bidirectional=True: out (4, 7, 10), <code>h_n</code> (2, 4, 5), 100 parameters, out[:, −1, :5] equals <code>h_n</code>[0] and out[:, 0, 5:] equals <code>h_n</code>[1], but out[:, −1, 5:] does not. Both: <code>h_n</code> (4, 4, 5), 270 parameters. Without <code>batch_first</code> the same (4, 7, 3) tensor is read as 4 steps of a batch of 7: out (4, 7, 5), <code>h_n</code> <b>(1, 7, 5)</b>, no error.`,
note: String.raw`For a bidirectional classifier use torch.cat((<code>h_n</code>[-2], <code>h_n</code>[-1]), dim=1), the last layer's forward and backward states. Taking out[:, -1] gives the forward state at the end but the backward state after it has read only the last element.`,
r(fig, ctl) {
  let bf = 1, L = 1, D = 1;
  ctl.innerHTML = `<div class="row"><button data-r4b="1">batch_first=True</button><button data-r4b="0">batch_first=False</button></div><div class="row"><button data-r4l="1">1 layer</button><button data-r4l="2">2 layers</button></div><div class="row"><button data-r4d="1">one direction</button><button data-r4d="2">bidirectional</button></div><div id="r4o"></div>`;
  const u = () => {
    pick(ctl, "r4b", bf); pick(ctl, "r4l", L); pick(ctl, "r4d", D);
    const B = bf ? 4 : 7, T = bf ? 7 : 4, H = 5, cw = 64, x0 = 120;
    let s = tx(20, 20, `x has shape (4, 7, 3), read as B = ${B}, T = ${T}`, null, "t"), y = 40;
    const rows = [];
    for (let l = 0; l < L; l++) for (let d = 0; d < D; d++) rows.push([l, d]);
    rows.reverse().forEach(([l, d], ri) => {
      const yy = y + ri * 40;
      s += tx(20, yy + 22, `layer ${l}${D === 2 ? (d ? ", backward" : ", forward") : ""}`);
      for (let t = 0; t < T; t++) {
        const top = l === L - 1, last = d ? t === 0 : t === T - 1;
        const fill = top ? "var(--teal-bg)" : "var(--sunk)", stroke = last ? C.coral : top ? C.teal : "var(--line)";
        s += rect(x0 + t * cw, yy + 4, cw - 14, 28, fill, stroke, last ? 2.4 : 1);
        if (t < T - 1) s += d ? ln(x0 + (t + 1) * cw - 2, yy + 18, x0 + t * cw + cw - 12, yy + 18, C.gray, 1) : ln(x0 + t * cw + cw - 14, yy + 18, x0 + (t + 1) * cw - 2, yy + 18, C.gray, 1);
      }
    });
    const yb = y + rows.length * 40 + 8;
    for (let t = 0; t < T; t++) s += tx(x0 + t * cw + 25, yb + 6, `t = ${t}`, "middle");
    s += legend([["in out (top layer)", C.teal], ["in h_n (last step of each direction)", C.coral]], 120, yb + 32, 220);
    fig.innerHTML = svg(yb + 44, s);
    const outS = bf ? `(${B}, ${T}, ${D * H})` : `(${T}, ${B}, ${D * H})`;
    $("r4o").innerHTML = ML.code([`rnn = nn.RNN(3, 5, num_layers=${L}, bidirectional=${D === 2 ? "True" : "False"}${bf ? ", batch_first=True" : ""})`, "out, h_n = rnn(torch.randn(4, 7, 3))", "print(out.shape, h_n.shape)"], -1) + ML.term([`torch.Size([${outS.slice(1, -1)}]) torch.Size([${D * L}, ${B}, ${H}])`]) +
      TB(["", "value"], [["parameters", cm(rnnParams(3, 5, L, D))], ["many-to-one input to the head", D === 2 ? "torch.cat((h_n[-2], h_n[-1]), dim=1), width 10" : "h_n[-1], width 5"]]) + (!bf ? `<p class="note">No error is raised. The model now reads 4 time steps of 7 sequences, and a head on h_n[-1] returns 7 predictions for 4 labels, which fails only later, at the loss.</p>` : "");
  };
  ctl.querySelectorAll("button[data-r4b]").forEach(b => b.onclick = () => { bf = +b.dataset.r4b; u(); });
  ctl.querySelectorAll("button[data-r4l]").forEach(b => b.onclick = () => { L = +b.dataset.r4l; u(); });
  ctl.querySelectorAll("button[data-r4d]").forEach(b => b.onclick = () => { D = +b.dataset.r4d; u(); });
  u();
}},

{s: "5. The loss over a sequence", t: "A language model predicts each next word, and the losses of all steps add up",
intu: String.raw`Ng's language model reads a sentence one word at a time and at every step outputs a softmax over the vocabulary for the next word, given all the words so far. The probability of the whole sentence is the product of these conditional probabilities, and the loss is the sum of the cross-entropies of the steps. Training feeds the true previous word as the next input, \(x^{\langle t \rangle} = y^{\langle t-1 \rangle}\). Here the training sentence is "my model trains fast" followed by the end token \(\langle \text{EOS} \rangle\) and the bars show the probability the model gives each true next word. Drag one step's probability, as training would, and see the sum, the mean per word and the perplexity move.`,
eq: String.raw`\[ P\big(y^{\langle 1 \rangle}, \dots, y^{\langle T \rangle}\big) = \prod_{t=1}^{T} P\big(y^{\langle t \rangle} \mid y^{\langle 1 \rangle}, \dots, y^{\langle t-1 \rangle}\big) \]
\[ \mathcal{L} = \sum_{t=1}^{T} -\log \hat y^{\langle t \rangle}_{y^{\langle t \rangle}}, \quad \text{perplexity} = e^{\mathcal{L}/T} \]`,
sym: [[String.raw`\(\hat y^{\langle t \rangle}_{y^{\langle t \rangle}}\)`, "the softmax probability of the true word at step t"], [String.raw`\(\mathcal{L}\)`, "Ng's loss, the sum over steps of the cross-entropy"], [String.raw`\(\mathcal{L}/T\)`, "the mean per word, what CrossEntropyLoss returns by default"], ["perplexity", "e to the mean loss, an effective number of equally likely choices"], [String.raw`\(\langle \text{EOS} \rangle\)`, "end of sentence token, so the model also learns where sentences stop"]],
how: ["Read the five probabilities of the true words.", "Check the product and the sum of the negative logs.", "Drag step 1's probability up and see how much the sum falls.", "Switch between the sum and the mean per word.", "Open the PyTorch view and read the shape error."],
say: String.raw`A language model's loss on a sentence is the sum over time steps of the cross-entropy between the predicted next-word distribution and the true next word, which equals the negative log of the probability it gives the whole sentence.`,
num: String.raw`Probabilities 0.05, 0.10, 0.15, 0.20, 0.50 give negative logs 2.9957, 2.3026, 1.8971, 1.6094, 0.6931. Sum <b>9.4980</b>, mean 1.8996, perplexity <b>6.683</b>, sentence probability 0.05 · 0.10 · 0.15 · 0.20 · 0.50 = 7.5e-5 = e to the −9.498. In PyTorch, logits of shape (2, 6, 10) with targets (2, 6) raise "Expected target size [2, 10], got [2, 6]", and both logits.transpose(1, 2) and the reshape to (12, 10) give the same loss, 2.9700 on that random draw.`,
note: String.raw`CrossEntropyLoss wants the class dimension second: (B, V, T) against targets (B, T), or flatten to (B · T, V) against (B · T). Padded positions must be left out of the loss with <code>ignore_index</code>, or the model is rewarded for predicting padding.`,
r(fig, ctl) {
  const Wd = ["my", "model", "trains", "fast", "&lt;EOS&gt;"], P0 = [0.05, 0.10, 0.15, 0.20, 0.50];
  let P = P0.slice(), mode = 0, view = 0;
  ctl.innerHTML = `<div class="row"><button data-r5v="0">the sentence</button><button data-r5v="1">in PyTorch</button></div>` + sl("r5s", "probability at step 1", 0.01, 0.99, 0.01, 0.05) + `<div class="row"><button data-r5m="0">sum (Ng)</button><button data-r5m="1">mean per word (PyTorch)</button></div><div id="r5o"></div>`;
  const u = () => {
    pick(ctl, "r5v", view); pick(ctl, "r5m", mode); P[0] = val("r5s"); setv("r5s", f(P[0], 2));
    const nl = P.map(p => -Math.log(p)), S = nl.reduce((a, b) => a + b, 0), M = S / 5;
    if (view === 1) {
      fig.innerHTML = ML.code(["logits = model(x)            # (B, T, V) = (2, 6, 10)", "loss = F.cross_entropy(logits, y)          # y is (2, 6)", "loss = F.cross_entropy(logits.transpose(1, 2), y)", "loss = F.cross_entropy(logits.reshape(-1, 10), y.reshape(-1))"], 1) + ML.term(["ValueError: Expected target size [2, 10], got [2, 6]", "tensor(2.9700)   # transpose: class dimension second", "tensor(2.9700)   # reshape: 12 rows of 10 classes"]);
      $("r5o").innerHTML = `<p class="note">The first call fails because PyTorch reads dimension 1 as the classes, so it sees 6 classes and a target of the wrong size. The two fixes give the same mean over all 12 positions.</p>`;
      return;
    }
    const ax = ML.axes(70, 30, 560, 180, { xmin: 0, xmax: 5, ymin: 0, ymax: 1, nx: 5, ny: 4, fx: () => "", xl: "", yl: "probability of the true word" });
    let s = ax.s;
    P.forEach((p, i) => {
      const x = ax.X(i + 0.2), w = ax.X(i + 0.8) - x;
      s += `<rect x="${x}" y="${ax.Y(p)}" width="${w}" height="${ax.Y(0) - ax.Y(p)}" fill="${i === 0 ? C.coral : C.teal}" opacity="0.8"/>` + tx(x + w / 2, ax.Y(p) - 6, f(p, 2), "middle") + tx(x + w / 2, 236, Wd[i], "middle", "t") + tx(x + w / 2, 254, `−log = ${f(nl[i])}`, "middle");
    });
    fig.innerHTML = svg(266, s);
    $("r5o").innerHTML = ML.readout([["sentence probability", ex(P.reduce((a, b) => a * b, 1))], [mode ? "mean loss per word" : "loss, sum over steps", f(mode ? M : S)], ["perplexity", f(Math.exp(M), 3)]].map(([a, b]) => [a, mn(b)])) + `<p class="note">${mode ? "The mean does not depend on the sentence length, so losses of batches with different lengths stay comparable." : "The sum grows with the sentence length. Ng's cost sums over steps and over examples."}</p>`;
  };
  ctl.querySelectorAll("button[data-r5v]").forEach(b => b.onclick = () => { view = +b.dataset.r5v; u(); });
  ctl.querySelectorAll("button[data-r5m]").forEach(b => b.onclick = () => { mode = +b.dataset.r5m; u(); });
  $("r5s").oninput = u; u();
}},

{s: "6. Backpropagation through time", t: "The gradient to an early step is a product of one factor per step",
intu: String.raw`Training an RNN runs backpropagation on the unrolled graph, from the last step back to the first, which Ng calls backpropagation through time. Because the same \(W_{aa}\) appears at every step, the gradient of a late loss with respect to an early hidden state is a product of one Jacobian per step in between. A product of many factors either shrinks or grows geometrically. Take the simplest case, one hidden unit with weight w and no inputs after step 1. Without the tanh the factor is w at every step. With the tanh it is w times the slope of tanh, which is below 1 once the unit saturates. Move w and the starting state and read the gradient after 50 steps.`,
eq: String.raw`\[ \frac{\partial a^{\langle t \rangle}}{\partial a^{\langle k \rangle}} = \prod_{j=k+1}^{t} \operatorname{diag}\big(1 - (a^{\langle j \rangle})^2\big)\, W_{aa} \]
\[ \text{one unit: } \prod_{j=2}^{t} w \big(1 - (a^{\langle j \rangle})^2\big), \quad \text{linear: } w^{t-1} \]`,
sym: [[String.raw`\(\partial a^{\langle t \rangle} / \partial a^{\langle k \rangle}\)`, "how much the state at step t moves when the state at step k moves"], [String.raw`\(1 - (a^{\langle j \rangle})^2\)`, "the slope of tanh at step j, at most 1"], [String.raw`\(W_{aa}\)`, "the same matrix in every factor"], [String.raw`\(\sigma_{\max}(W_{aa})\)`, "largest singular value, below 1 guarantees vanishing for tanh"], ["BPTT", "backpropagation through time, the chain rule on the unrolled graph"]],
how: ["Set w = 0.9 and read the linear gradient after 50 steps.", "Set w = 1.1 and watch the linear gradient explode.", "Keep w = 1.1 and look at the tanh curve, which vanishes instead.", "Raise w to 1.5 and see the tanh gradient vanish even faster.", "Lower the starting state and see how long the tanh unit stays near linear."],
say: String.raw`In backpropagation through time the gradient flowing from step t back to step k is a product of t minus k Jacobians that all contain \(W_{aa}\), so it shrinks geometrically when their size is below one and grows geometrically when it is above one.`,
num: String.raw`Linear unit, 49 factors: w = 0.9 gives \(0.9^{49}\) = <b>5.7e-3</b>, w = 1.1 gives \(1.1^{49}\) = <b>106.7</b>, w = 1.5 gives 4.3e8. tanh unit from \(a^{\langle 1 \rangle}\) = 0.5: w = 0.9 gives 2.5e-3, w = 1.1 gives <b>6.8e-5</b> because the state settles at 0.5029 where each factor is 1.1 · (1 − 0.2529) = 0.82, w = 1.5 gives 1.0e-19 at the saturated state 0.8586.`,
note: String.raw`Ng's example is subject and verb agreement: "The cat, which already ate ..., was full" against "The cats ... were full". The loss at "was" needs a gradient that reaches "cat" many steps back, and a factor of 0.82 per step leaves 0.82 to the 20th, about 0.02, after 20 words. Vanishing gradients are the harder problem, which is why Lesson 40's gated cells exist. Exploding ones are rarer and have a simple patch, card 7.`,
r(fig, ctl) {
  ctl.innerHTML = sl("r6w", "weight w", 0.5, 2, 0.05, 1.1) + sl("r6a", "start state a⟨1⟩", 0.05, 0.95, 0.05, 0.5) + `<div id="r6o"></div>`;
  const u = () => {
    const w = val("r6w"), a1 = val("r6a"); setv("r6w", f(w, 2)); setv("r6a", f(a1, 2));
    const lin = [0], th = [0], st = [a1]; let a = a1, d = 1;
    for (let t = 2; t <= 50; t++) { const z = w * a, tz = Math.tanh(z); d *= w * (1 - tz * tz); a = tz; st.push(a); th.push(Math.log10(Math.max(Math.abs(d), 1e-40))); lin.push((t - 1) * Math.log10(w)); }
    const ax = ML.axes(70, 20, 560, 230, { xmin: 1, xmax: 50, ymin: -20, ymax: 10, nx: 7, ny: 6, fx: v => Math.round(v), fy: v => "1e" + Math.round(v), xl: "step t", yl: "|∂a⟨t⟩ / ∂a⟨1⟩|, log scale" });
    const cl = v => Math.max(-20, Math.min(10, v));
    let s = ax.s + `<line x1="${ax.X(1)}" y1="${ax.Y(0)}" x2="${ax.X(50)}" y2="${ax.Y(0)}" stroke="var(--muted)" stroke-dasharray="2 4"/>`;
    s += ML.path(lin.map((v, i) => [ax.X(i + 1), ax.Y(cl(v))]), C.coral, 2) + ML.path(th.map((v, i) => [ax.X(i + 1), ax.Y(cl(v))]), C.teal, 2, "5 3");
    s += legend([["linear unit, factor w", C.coral], ["tanh unit, factor w(1 − a²)", C.teal, "5 3"]], 90, 300, 250);
    fig.innerHTML = svg(310, s);
    $("r6o").innerHTML = ML.readout([["linear, t = 50", ex(Math.pow(w, 49))], ["tanh, t = 50", ex(d)], ["tanh state at t = 50", fm(a)], ["tanh factor at t = 50", fm(w * (1 - Math.tanh(w * st[48]) ** 2), 3)]]);
  };
  $("r6w").oninput = u; $("r6a").oninput = u; u();
}},

{s: "7. Exploding gradients and clipping", t: "A cliff in the loss throws the weights, a clipped step does not",
intu: String.raw`Pascanu, Mikolov and Bengio (2013) showed what an exploding gradient looks like on the loss surface: a long flat region, then a cliff where a small change in a recurrent weight flips the network from one behavior to another. On the cliff the gradient is huge and one ordinary step throws the weights far away, undoing many steps of progress. Their fix is gradient clipping: when the gradient norm is above a threshold c, rescale the gradient to norm c, keeping its direction. Here one unit runs \(a^{\langle t \rangle} = w\,\sigma(a^{\langle t-1 \rangle}) - 2\) for 50 steps from 0.5 and the loss is the squared distance of the last state from 1.5. Pick a start and a rate and switch clipping on and off.`,
eq: String.raw`\[ \text{if } \lVert g \rVert \gt c: \quad g \leftarrow \frac{c}{\lVert g \rVert}\, g \]
\[ \texttt{clip\_grad\_norm\_(model.parameters(), max\_norm=c)} \]`,
sym: [[String.raw`\(g\)`, "the gradient of all parameters, seen as one vector"], [String.raw`\(c\)`, "the threshold, often between 0.5 and 5, chosen by watching the norm"], [String.raw`\(\lVert g \rVert\)`, "the total norm, which <code>clip_grad_norm_</code> returns before clipping"], ["clip by norm", "rescales, so the direction is kept"], ["clip by value", "clamps each entry, which can change the direction"]],
how: ["Start at w = 3.58 with rate 0.1 and no clipping, and see the second step jump past w = 9.", "Count the steps it takes to come back.", "Switch clipping on with c = 1 and see the steps of at most 0.1 walk down the cliff.", "Try start 3.0 with rate 0.2, which bounces with or without clipping, because clipping does not fix a rate that is too large.", "Read the vector example below the plot."],
say: String.raw`Gradient clipping rescales the whole gradient to a maximum norm before the optimizer step, which keeps a single huge gradient from a cliff in the loss from throwing the weights far away, and it does nothing about vanishing gradients.`,
num: String.raw`From w = 3.58 at rate 0.1: the gradient at w = 3.965 is <b>−53.0</b>, the step lands at <b>9.263</b>, and the loss first drops below 1e-3 after <b>12</b> steps. With the gradient clipped to 1 the weight walks 3.68, 3.78, ... and drops below 1e-3 after <b>7</b> steps, reaching the minimum at w = 4.281. Vector example: g = (12, −5) has norm 13, clipping to norm 1 gives (0.923, −0.385) in the same direction, clipping each value to 0.5 gives (0.5, −0.5), a different direction.`,
note: String.raw`Clip after loss.backward() and before optimizer.step(). Clipping before backward does nothing, because the gradients are not there yet. Log the returned total norm: if it is above the threshold on every step, the threshold or the learning rate is wrong, not the gradient.`,
r(fig, ctl) {
  const sg = z => 1 / (1 + Math.exp(-z));
  const run = w => { let x = 0.5, dx = 0; for (let t = 0; t < 50; t++) { const s = sg(x); dx = s + w * s * (1 - s) * dx; x = w * s - 2; } return [x, dx]; };
  const Lf = w => (run(w)[0] - 1.5) ** 2;
  let lr = 0.1, cl = 0;
  ctl.innerHTML = sl("r7w", "start w", 2.6, 3.94, 0.02, 3.58) + `<div class="row"><button data-r7l="0.05">rate 0.05</button><button data-r7l="0.1">rate 0.1</button><button data-r7l="0.2">rate 0.2</button></div><div class="row"><button data-r7c="0">no clipping</button><button data-r7c="1">clip norm to 1</button></div><div id="r7o"></div>`;
  const u = () => {
    pick(ctl, "r7l", lr); pick(ctl, "r7c", cl); const w0 = val("r7w"); setv("r7w", f(w0, 2));
    const ax = ML.axes(70, 20, 560, 220, { xmin: 2.5, xmax: 10, ymin: 0, ymax: 12, nx: 6, ny: 4, fx: v => f(v, 1), xl: "recurrent weight w", yl: "loss" });
    let s = ax.s; const pts = [];
    for (let w = 2.5; w <= 10.001; w += 0.01) pts.push([ax.X(w), ax.Y(Math.min(12, Lf(w)))]);
    s += ML.path(pts, C.gray, 1.6);
    let w = w0, first = null, big = 0, gmax = 0; const path = [w];
    for (let i = 0; i < 40; i++) { const [x, dx] = run(w); let g = 2 * (x - 1.5) * dx; gmax = Math.max(gmax, Math.abs(g)); if (cl && Math.abs(g) > 1) g = Math.sign(g); const nw = w - lr * g; big = Math.max(big, Math.abs(nw - w)); w = nw; path.push(w); }
    path.forEach((p, i) => { if (first == null && Lf(p) < 1e-3) first = i; });
    const P = path.map(p => [ax.X(Math.max(2.5, Math.min(10, p))), ax.Y(Math.min(12, Lf(p)))]);
    s += ML.path(P.slice(0, 16), cl ? C.teal : C.coral, 1.2, "3 3");
    P.slice(0, 16).forEach(([x, y], i) => { s += `<circle cx="${x}" cy="${y}" r="${i ? 3.5 : 5}" fill="${cl ? C.teal : C.coral}" opacity="${1 - i * 0.04}"/>`; });
    s += tx(ax.X(3.0), ax.Y(11), "flat region", "middle") + tx(ax.X(4.6), ax.Y(9), "cliff near w = 4", "middle");
    fig.innerHTML = svg(286, s);
    $("r7o").innerHTML = ML.readout([["largest raw gradient", fm(gmax, 1)], ["largest step", f(big, 3)], ["first step with loss below 1e-3", first == null ? "not within 40" : String(first)], ["w after 40 steps", f(w, 3)]]) + `<p class="note">Vector example: g = (12, −5), norm 13. Clip by norm to 1: (0.923, −0.385). Clip each value to 0.5: (0.5, −0.5).</p>`;
  };
  ctl.querySelectorAll("button[data-r7l]").forEach(b => b.onclick = () => { lr = +b.dataset.r7l; u(); });
  ctl.querySelectorAll("button[data-r7c]").forEach(b => b.onclick = () => { cl = +b.dataset.r7c; u(); });
  $("r7w").oninput = u; u();
}},

{s: "8. How far back can it remember", t: "A real memory test: the label is the first input, the answer is read after T steps",
intu: String.raw`Card 6 predicts that the gradient from the loss at the last step to the first input shrinks geometrically with the gap. Here is the test. Each sequence starts with +1 or −1, followed by T − 1 steps of noise with standard deviation 0.5, and the label is the sign of the first value, read from the last hidden state. Four models with 16 hidden units train for 1,500 Adam steps on fresh batches of 64: a plain nn.RNN, an nn.LSTM and an nn.GRU with PyTorch's default initialization, and an LSTM whose forget gate bias starts at 2, so the gate starts open. Pick the gap and switch between the test accuracy and the gradient that reaches the first input at initialization.`,
eq: String.raw`\[ x^{\langle 1 \rangle} = \pm 1, \quad x^{\langle t \rangle} \sim \mathcal{N}(0, 0.5^2) \text{ for } t \ge 2, \quad y = [x^{\langle 1 \rangle} \gt 0] \]
\[ \text{gradient ratio} = \frac{\operatorname{mean}\lvert \partial \mathcal{L} / \partial x^{\langle 1 \rangle} \rvert}{\operatorname{mean}\lvert \partial \mathcal{L} / \partial x^{\langle T \rangle} \rvert} \]`,
sym: [[String.raw`\(T\)`, "the gap, the number of steps between the clue and the answer"], ["accuracy 0.5", "a coin flip, the model found nothing"], ["gradient ratio", "how much of the learning signal reaches the clue compared to the last step, at initialization"], ["forget gate bias", "an LSTM setting Lesson 40 explains, a small random number near 0 by default in PyTorch"], ["seed", "the same three seeds, 0 to 2, for every model"]],
how: ["Pick T = 10 and see that every model solves it.", "Pick T = 40 and see the plain RNN succeed on two of three seeds.", "See that the default LSTM and GRU already fail at T = 20.", "Switch to the gradient view and compare 1e-21 with 1e-2 at T = 80.", "Notice that no model solves T = 80 within this budget."],
say: String.raw`On a task that needs one value remembered over T steps, a plain RNN's learning signal at the first step falls geometrically with T, and a gated cell keeps it alive only if its forget gate starts open.`,
num: String.raw`Test accuracy on 1,000 sequences, seeds 0 to 2. Plain RNN: 1.0 at T = 5, 10 and 20, <b>1.0, 0.495, 1.0</b> at 40, 0.495, 0.495, 1.0 at 80. LSTM with default biases: 1.0 at 5 and 10, then <b>0.5</b> at 20, 40 and 80. GRU: 1.0 at 5 and 10, two of three seeds at 20, 0.5 at 40 and 80. LSTM with forget bias 2: <b>1.0, 1.0, 0.997</b> at 40, 0.5 at 80. Gradient ratio at initialization, T = 80: plain RNN <b>9.1e-22</b>, 1.8e-21, 5.3e-18, default LSTM 2.6e-20 to 6.3e-16, LSTM with forget bias 2 <b>1.8e-3</b>, 0.135, 5.8e-3.`,
note: String.raw`This result is not the textbook picture, and it is worth remembering for that reason. An LSTM is not better by default: PyTorch starts its biases as small random numbers, so the forget gate starts near \(\sigma(0) = 0.5\) and roughly halves the memory at every step, and it lost to the plain RNN here. With the forget gate started open it kept a gradient ratio between 1e-3 and 0.14 even at T = 80. On the final, "choose nn.LSTM for long-range dependence" is still the right answer, and Lesson 40 shows why the forget gate is the key.`,
r(fig, ctl) {
  const TT = [5, 10, 20, 40, 80], K = [["rnn", "plain RNN", C.coral], ["lstm", "LSTM, default", C.purple], ["gru", "GRU, default", C.blue], ["lstmfb", "LSTM, forget bias 2", C.teal]];
  let v = 0, ti = 3;
  ctl.innerHTML = `<div class="row"><button data-r8v="0">test accuracy</button><button data-r8v="1">gradient at the first input</button></div><div class="row">${TT.map((t, i) => `<button data-r8t="${i}">T = ${t}</button>`).join("")}</div><div id="r8o"></div>`;
  const u = () => {
    pick(ctl, "r8v", v); pick(ctl, "r8t", ti);
    const ax = v ? ML.axes(70, 20, 560, 220, { xmin: 0, xmax: 5, ymin: -22, ymax: 1, nx: 5, ny: 23 / 23 * 5, fx: () => "", fy: v => "1e" + Math.round(v), xl: "", yl: "gradient ratio at step 0" }) : ML.axes(70, 20, 560, 220, { xmin: 0, xmax: 5, ymin: 0.4, ymax: 1, nx: 5, ny: 6, fx: () => "", fy: v => f(v, 1), xl: "", yl: "test accuracy" });
    let s = ax.s;
    TT.forEach((T, i) => {
      s += tx(ax.X(i + 0.5), 262, `T = ${T}`, "middle", i === ti ? "th" : "ts");
      if (i === ti) s += `<rect x="${ax.X(i) + 2}" y="20" width="${ax.X(1) - ax.X(0) - 4}" height="220" fill="var(--accent-bg)" opacity="0.5"/>`;
      K.forEach(([k, , col], j) => {
        const d = MEM[k + T], vals = v ? d.ratio.map(r => Math.log10(r)) : d.acc, x = ax.X(i + 0.14 + j * 0.2), w = ax.X(0.16) - ax.X(0);
        const mu = vals.reduce((a, b) => a + b, 0) / 3, base = v ? -22 : 0.4;
        s += `<rect x="${x}" y="${ax.Y(Math.max(base, mu))}" width="${w}" height="${ax.Y(base) - ax.Y(Math.max(base, mu))}" fill="${col}" opacity="0.55"/>`;
        vals.forEach(q => { s += `<circle cx="${x + w / 2}" cy="${ax.Y(Math.max(base, Math.min(v ? 1 : 1, q)))}" r="2.6" fill="${col}"/>`; });
      });
    });
    s += legend(K.map(([, l, c]) => [l, c]), 30, 290, 162);
    fig.innerHTML = svg(300, s);
    const T = TT[ti];
    $("r8o").innerHTML = TB(["model, T = " + T, "test accuracy, seeds 0 to 2", "gradient ratio at initialization"], K.map(([k, l]) => [l, MEM[k + T].acc.map(a => f(a, 3)).join(", "), MEM[k + T].ratio.map(r => ex(r)).join(", ")]));
  };
  ctl.querySelectorAll("button[data-r8v]").forEach(b => b.onclick = () => { v = +b.dataset.r8v; u(); });
  ctl.querySelectorAll("button[data-r8t]").forEach(b => b.onclick = () => { ti = +b.dataset.r8t; u(); });
  u();
}},

{s: "9. Teacher forcing and exposure bias", t: "Trained on true inputs, tested on its own outputs",
intu: String.raw`When an RNN learns to predict the next value of a sequence, the input at step t during training is the true value from step t − 1. Goodfellow calls this teacher forcing, and it is what Ng's language model does. It is fast and stable, but at generation time there is no true value, so the model must feed its own prediction back in. Every small error becomes part of the next input, a situation the model never saw in training, and errors can compound. This mismatch is called exposure bias. Scheduled sampling (Bengio et al., 2015) is one remedy: during training, replace a growing share of the true inputs by the model's own predictions. Here a one-layer RNN with 32 units learned the next value of \(\sin 0.25t + 0.5 \sin(0.6t + 1)\) plus noise. On new test sequences it reads 19 true values, then runs free for 81 steps. Compare the two training schemes.`,
eq: String.raw`\[ \text{training: } x^{\langle t \rangle} = y^{\langle t-1 \rangle} \quad \text{(teacher forcing)} \]
\[ \text{generation: } x^{\langle t \rangle} = \hat y^{\langle t-1 \rangle} \quad \text{(free running)} \]`,
sym: [[String.raw`\(y^{\langle t-1 \rangle}\)`, "the true previous value, known in training"], [String.raw`\(\hat y^{\langle t-1 \rangle}\)`, "the model's own previous prediction"], ["exposure bias", "the model is trained only on true inputs and tested on its own"], ["scheduled sampling", "feed the model's own prediction with a probability that grows during training, here up to 0.5"], ["warm-up", "the 19 true values read before free running"]],
how: ["Pick teacher forcing, seed 0, and look at the one-step error.", "Look at the free-running forecast after step 19 and where it drifts.", "Switch to scheduled sampling and compare the error curve.", "Change the seed and see how much the drift varies.", "Read the table of all six runs."],
say: String.raw`Teacher forcing trains a sequence model on the true previous values, so at generation time, when it must consume its own predictions, its errors can compound, which is exposure bias, and scheduled sampling reduces it by feeding the model its own predictions during part of training.`,
num: String.raw`Squared error against the clean signal, averaged over 50 new test sequences. Teacher forcing, seeds 0 to 2: one-step error 0.0084, 0.0087, 0.0068, free running steps 21 to 81 <b>0.0450, 0.0538, 0.0045</b>, so the error grows five to six times on two seeds as the model feeds itself. Scheduled sampling: one-step error 0.0099, 0.0116, 0.0124 (slightly worse), free steps 21 to 81 <b>0.0082, 0.0115</b> and 0.2940. It cut the long-horizon error about five times on two seeds and drifted badly on the third, so neither scheme wins on every seed.`,
note: String.raw`On the final, teacher forcing is the answer to "why does training converge fast" and exposure bias to "why do generated sequences drift". Remedies are scheduled sampling, training on multi-step rollouts and, for text, sampling with a temperature. For a forecast, always report the error at the horizon you need, never only the one-step error.`,
r(fig, ctl) {
  let m = "tf", sd = 0;
  ctl.innerHTML = `<div class="row"><button data-r9m="tf">teacher forcing</button><button data-r9m="ss">scheduled sampling</button></div><div class="row">${[0, 1, 2].map(i => `<button data-r9s="${i}">seed ${i}</button>`).join("")}</div><div id="r9o"></div>`;
  const avg = (k, a, b) => { const e = TF[k].err.slice(a, b); return e.reduce((s, v) => s + v, 0) / e.length; };
  const u = () => {
    pick(ctl, "r9m", m); pick(ctl, "r9s", sd); const R = TF[m + sd], col = m === "tf" ? C.coral : C.teal;
    const ax = ML.axes(70, 20, 560, 170, { xmin: 0, xmax: 100, ymin: -2, ymax: 2, nx: 5, ny: 4, fx: v => Math.round(v), xl: "", yl: "test sequence 0" });
    let s = ax.s + `<rect x="${ax.X(0)}" y="20" width="${ax.X(19) - ax.X(0)}" height="170" fill="var(--sunk)" opacity="0.6"/>` + tx(ax.X(9.5), 36, "warm-up, true inputs", "middle");
    s += ML.path(TF.clean0.map((v, i) => [ax.X(i), ax.Y(v)]), C.gray, 1.6);
    TF.noisy0.forEach((v, i) => { s += `<circle cx="${ax.X(i)}" cy="${ax.Y(v)}" r="2.5" fill="${C.gray}"/>`; });
    s += ML.path(R.ex.map((v, i) => [ax.X(20 + i), ax.Y(Math.max(-2, Math.min(2, v)))]), col, 2, "5 3");
    const bx = ML.axes(70, 240, 560, 120, { xmin: 1, xmax: 81, ymin: -3, ymax: 0, nx: 8, ny: 3, fx: v => Math.round(v), fy: v => "1e" + v, xl: "steps of free running", yl: "squared error, 50 sequences" });
    s += bx.s;
    ["tf", "ss"].forEach(k => { s += ML.path(TF[k + sd].err.map((v, i) => [bx.X(i + 1), bx.Y(Math.max(-3, Math.min(0, Math.log10(v))))]), k === "tf" ? C.coral : C.teal, k === m ? 2.4 : 1.2, k === "ss" ? "5 3" : null); });
    s += legend([["true signal", C.gray], [`teacher forcing, seed ${sd}`, C.coral], [`scheduled sampling, seed ${sd}`, C.teal, "5 3"]], 80, 412, 200);
    fig.innerHTML = svg(422, s);
    $("r9o").innerHTML = TB(["run", "one-step error", "free steps 1 to 20", "free steps 21 to 81"], ["tf", "ss"].flatMap(k => [0, 1, 2].map(j => [`${k === "tf" ? "teacher forcing" : "scheduled sampling"}, seed ${j}`, f(TF[k + j].one), f(avg(k + j, 0, 20)), (k + j === m + sd ? "<b>" : "") + f(avg(k + j, 20, 81)) + (k + j === m + sd ? "</b>" : "")])));
  };
  ctl.querySelectorAll("button[data-r9m]").forEach(b => b.onclick = () => { m = b.dataset.r9m; u(); });
  ctl.querySelectorAll("button[data-r9s]").forEach(b => b.onclick = () => { sd = +b.dataset.r9s; u(); });
  u();
}},

{s: "10. Padding, packing and the last real step", t: "A padded batch returns the state after the padding unless you pack it",
intu: String.raw`A batch needs one tensor, so shorter sequences are padded with zeros up to the longest one. The RNN does not know which steps are padding and keeps updating the hidden state through them, so out[:, −1] and <code>h_n</code> of a short sequence are the state after the pad steps, not after its last real element. Nothing fails, the numbers are just wrong. <code>pack_padded_sequence</code> tells the RNN each length, so <code>h_n</code> is taken at the last real step, and indexing out at lengths − 1 gives the same states. Here a batch of three sequences with lengths 5, 3 and 2 runs through a two-unit RNN with fixed weights. Pick a sequence and compare the three ways to read its final state.`,
eq: String.raw`\[ h_i = \texttt{out}[i,\ \ell_i - 1,\ :] \]
\[ \texttt{pack\_padded\_sequence(x, lengths, batch\_first=True, enforce\_sorted=False)} \]`,
sym: [[String.raw`\(\ell_i\)`, "the true length of sequence i"], [String.raw`\(h_i\)`, "its hidden state after its last real element"], ["pad step", "a zero input that the RNN still processes when not packed"], [String.raw`\(\texttt{enforce\_sorted}\)`, "True demands lengths in decreasing order, False sorts for you"], [String.raw`\(\texttt{pad\_packed\_sequence}\)`, "turns packed outputs back into a padded tensor with zeros after each length"]],
how: ["Pick sequence 0, length 5, and see all three readings agree.", "Pick sequence 1, length 3, and see the padded <code>h_n</code> differ.", "Pick sequence 2, length 2, where three pad steps moved the state.", "Read the packed <code>h_n</code> and the indexed out, which agree.", "Read the error for unsorted lengths."],
say: String.raw`For a padded batch, the final hidden state of each sequence must be read at its own length, either by packing the batch with its lengths or by indexing the output at length minus one, because the plain <code>h_n</code> includes the padding steps.`,
num: String.raw`Weights: \(W_{ih}\) = (1, −0.5), \(W_{hh}\) = [[0.5, 0], [0.5, 0.5]], biases (0.1, 0). Sequence 1 = (2, −1, 1) padded with two zeros: padded <code>h_n</code> <b>(0.3047, 0.2849)</b>, packed <code>h_n</code> <b>(0.7181, −0.4021)</b>, out at step 2 also (0.7181, −0.4021). Sequence 2 = (−1, 1): padded (0.2393, 0.2448) against packed (0.6303, −0.556). Sequence 0 has no padding: (0.8599, −0.3665) all three ways. Packing unsorted lengths with the default <code>enforce_sorted</code>=True raises "lengths array must be sorted in decreasing order when <code>enforce_sorted</code> is True".`,
note: String.raw`A bidirectional RNN is hurt twice by padding: the backward direction starts on the zeros, so its state at step 0 has read the pads first. Packing fixes both directions. For a sequence-to-sequence loss, also pass <code>ignore_index</code> for the pad positions.`,
r(fig, ctl) {
  const X = [[1, 2, -1, 0.5, 1], [2, -1, 1, 0, 0], [-1, 1, 0, 0, 0]], Ln = [5, 3, 2];
  const O = [[[0.8005, -0.4621], [0.9866, -0.6809], [-0.3857, 0.5736], [0.3861, -0.1548], [0.8599, -0.3665]], [[0.9705, -0.7616], [-0.3925, 0.5402], [0.7181, -0.4021], [0.4293, 0.1567], [0.3047, 0.2849]], [[-0.7163, 0.4621], [0.6303, -0.556], [0.3928, 0.0371], [0.288, 0.2117], [0.2393, 0.2448]]];
  let k = 1, view = 0;
  ctl.innerHTML = `<div class="row">${[0, 1, 2].map(i => `<button data-r10="${i}">sequence ${i}, length ${Ln[i]}</button>`).join("")}</div><div class="row"><button data-r10v="0">the batch</button><button data-r10v="1">the code</button></div><div id="r10o"></div>`;
  const u = () => {
    pick(ctl, "r10", k); pick(ctl, "r10v", view);
    if (view === 1) {
      fig.innerHTML = ML.code(["x = pad_sequence(seqs, batch_first=True).unsqueeze(-1)   # (3, 5, 1)", "out, h_n = rnn(x)                                     # h_n after the pads", "packed = pack_padded_sequence(x, lengths, batch_first=True,", "                              enforce_sorted=False)", "_, h_n = rnn(packed)                                  # h_n at each length", "last = out[torch.arange(3), lengths - 1]              # the same states"], 4) + ML.term(["padded h_n[0]: [[0.8599, -0.3665], [0.3047, 0.2849], [0.2393, 0.2448]]", "packed h_n[0]: [[0.8599, -0.3665], [0.7181, -0.4021], [0.6303, -0.5560]]", "out at lengths - 1: [[0.8599, -0.3665], [0.7181, -0.4021], [0.6303, -0.5560]]"]);
      $("r10o").innerHTML = ""; return;
    }
    let s = tx(20, 22, "input and hidden state per step, pad steps dashed", null, "t");
    for (let i = 0; i < 3; i++) for (let t = 0; t < 5; t++) {
      const x = 120 + t * 108, y = 40 + i * 74, pad = t >= Ln[i], on = i === k, last = t === Ln[i] - 1, end = t === 4;
      s += `<rect x="${x}" y="${y}" width="96" height="56" rx="6" fill="${on ? (pad ? "var(--sunk)" : "var(--teal-bg)") : "var(--sunk)"}" stroke="${on && last ? C.teal : on && end && pad ? C.coral : "var(--line)"}" stroke-width="${on && (last || (end && pad)) ? 2.4 : 1}" ${pad ? `stroke-dasharray="4 3"` : ""} opacity="${on ? 1 : 0.45}"/>`;
      s += tx(x + 48, y + 20, `x = ${fm(X[i][t], 1)}`, "middle") + tx(x + 48, y + 42, vec(O[i][t], 2), "middle");
      if (t === 0) s += tx(20, y + 34, `seq ${i}`, null, "t");
    }
    fig.innerHTML = svg(270, s);
    const pad = O[k][4], pk = O[k][Ln[k] - 1];
    $("r10o").innerHTML = TB(["reading", "final state of sequence " + k], [["out[:, −1] or padded h_n", vec(pad)], ["packed h_n", vec(pk)], ["out[i, lengths[i] − 1]", vec(pk)]].map(r => r.map(mn))) + (Ln[k] < 5 ? `<p class="note">The coral box is what the padded h_n returns, ${5 - Ln[k]} pad steps after the real end in teal.</p>` : `<p class="note">The longest sequence has no padding, so every reading agrees. That is why the bug hides when you test on the first row.</p>`);
  };
  ctl.querySelectorAll("button[data-r10]").forEach(b => b.onclick = () => { k = +b.dataset.r10; u(); });
  ctl.querySelectorAll("button[data-r10v]").forEach(b => b.onclick = () => { view = +b.dataset.r10v; u(); });
  u();
}},

{s: "11. Which layer for which task", t: "The final exam question: Linear, Conv2d or a recurrent layer",
intu: String.raw`Every practice final asks you to pick the layer for a task and say why. The rule follows the structure of the input. Fixed-length feature vectors with no order between the features go to nn.Linear layers. Images, where nearby pixels belong together and a pattern can appear anywhere, go to nn.Conv2d. Ordered sequences of varying length, where earlier steps matter for later ones, go to a recurrent layer, and when the dependence reaches far back, to nn.LSTM or nn.GRU rather than the plain nn.RNN, because of cards 6 and 8. Pick a task, choose a layer, then read the full answer with the shapes and the loss.`,
eq: String.raw`\[ \text{table} \to \texttt{nn.Linear}, \quad \text{image} \to \texttt{nn.Conv2d} \]
\[ \text{sequence} \to \texttt{nn.LSTM} \text{ or } \texttt{nn.GRU} \]
\[ \text{short memory only} \to \texttt{nn.RNN} \]`,
sym: [["nn.Linear", "fixed input size, no structure between inputs"], ["nn.Conv2d", "local patterns, shared over positions in an image"], ["nn.RNN", "sequences, short memory, gradients vanish over long gaps"], ["nn.LSTM, nn.GRU", "gated sequence layers for long memory, Lesson 40"], ["loss", "MSELoss for numbers, BCEWithLogitsLoss for yes or no per output, CrossEntropyLoss for one class"]],
how: ["Pick a task.", "Ask whether the input is a fixed vector, an image or an ordered sequence.", "Click the layer you would use.", "Read the answer with the input shape, the output and the loss.", "Go through all eight tasks."],
say: String.raw`Choose the layer from the structure of the input: nn.Linear for fixed-length feature vectors, nn.Conv2d for images, and a recurrent layer for ordered sequences, with nn.LSTM or nn.GRU when the output depends on steps far back.`,
num: String.raw`Eight tasks: house price from 13 features (Linear, MSELoss), crack or no crack in a 64 by 64 grayscale image (Conv2d, BCEWithLogitsLoss with one output), next hour's power load from the last 168 hourly readings (LSTM many-to-one, MSELoss), the star rating of a review of any length (LSTM or GRU many-to-one, CrossEntropyLoss over 5), a tag for every word (bidirectional LSTM many-to-many, CrossEntropyLoss per token), five possible faults in one vibration window of 1,000 samples (LSTM or a 1D convolution, BCEWithLogitsLoss over 5), digit in a 28 by 28 image (Conv2d, CrossEntropyLoss over 10), translation (an encoder and a decoder, Lessons 41 and 42).`,
note: String.raw`Write the answer as layer, input shape, output and loss, with one reason: "nn.LSTM(input_size=1, hidden_size=64, <code>batch_first</code>=True) on (B, 168, 1), a Linear(64, 1) head on <code>h_n</code>[-1], MSELoss, because the load depends on the same hour one day and one week back, which is 24 and 168 steps away".`,
r(fig, ctl) {
  const L = ["nn.Linear", "nn.Conv2d", "nn.RNN", "nn.LSTM or nn.GRU", "bidirectional nn.LSTM"];
  const T = [
    ["house price from 13 numeric features", [0], "(B, 13)", "Linear(…, 1)", "MSELoss", "a fixed vector with no order between the features"],
    ["crack or no crack in a 64 by 64 grayscale photo", [1], "(B, 1, 64, 64)", "1 logit", "BCEWithLogitsLoss", "local edges anywhere in the image, shared filters"],
    ["next hour's load from the last 168 hourly readings", [3], "(B, 168, 1)", "Linear(H, 1) on h_n[-1]", "MSELoss", "an ordered sequence with daily and weekly patterns 24 and 168 steps back"],
    ["star rating 1 to 5 of a review of any length", [3, 4], "(B, T) word ids, then nn.Embedding", "5 logits from the last state", "CrossEntropyLoss", "variable length, words early in the review matter"],
    ["a tag for every word of a sentence", [4], "(B, T, E)", "logits at every step", "CrossEntropyLoss per token, ignore_index for padding", "each tag needs the words after it too, many-to-many"],
    ["five possible faults in one 1,000-sample vibration window", [3], "(B, 1000, 3)", "5 logits", "BCEWithLogitsLoss", "a long sequence, faults can co-occur so each is yes or no"],
    ["which digit is in a 28 by 28 image", [1], "(B, 1, 28, 28)", "10 logits", "CrossEntropyLoss", "an image, exactly one class"],
    ["next value of a short sensor trace from its last 10 readings", [2, 3], "(B, 10, 1)", "1 number", "MSELoss", "a short sequence where a plain RNN's memory is enough"]
  ];
  let k = 0, ch = -1;
  ctl.innerHTML = `<div class="row" style="flex-wrap:wrap">${T.map((t, i) => `<button data-r11="${i}">task ${i + 1}</button>`).join("")}</div><div class="row" style="flex-wrap:wrap">${L.map((l, i) => `<button data-r11c="${i}">${l}</button>`).join("")}</div><div id="r11o"></div>`;
  const u = () => {
    pick(ctl, "r11", k); pick(ctl, "r11c", ch); const t = T[k];
    let s = tx(340, 30, `Task ${k + 1}: ${t[0]}`, "middle", "th");
    L.forEach((l, i) => { const x = 20 + i * 132, ok = t[1].includes(i), sel = i === ch; s += rect(x, 60, 122, 50, ch < 0 ? "var(--sunk)" : ok ? "var(--teal-bg)" : sel ? "var(--coral-bg)" : "var(--sunk)", ch >= 0 && ok ? C.teal : sel ? C.coral : "var(--line)", sel || (ch >= 0 && ok) ? 2 : 1) + tx(x + 61, 90, l.replace("bidirectional ", "bidir. "), "middle"); });
    s += tx(340, 140, ch < 0 ? "Click a layer below the task buttons." : t[1].includes(ch) ? "Good choice." : "Not the best choice, the teal box is.", "middle", "t");
    fig.innerHTML = svg(156, s);
    $("r11o").innerHTML = ch < 0 ? "" : TB(["input shape", "output", "loss", "why"], [[t[2], t[3], t[4], t[5]]]);
  };
  ctl.querySelectorAll("button[data-r11]").forEach(b => b.onclick = () => { k = +b.dataset.r11; ch = -1; u(); });
  ctl.querySelectorAll("button[data-r11c]").forEach(b => b.onclick = () => { ch = +b.dataset.r11c; u(); });
  u();
}},

{s: "12. With the agent", t: "Do it with the agent: RNN tools for the project as tested code",
intu: String.raw`The lesson as code for the project: Ng's cell in NumPy to check PyTorch against, a parameter counter, a sequence classifier that reads the last real step of a padded batch, and a training step that clips the gradient norm and logs it. The tests pin this lesson's numbers, so a missing tanh, a forgotten second bias, a classifier that reads the padding, clipping before backward or a loss with the class dimension in the wrong place each fails one test.`,
eq: String.raw`\[ \texttt{rnn\_forward} \to \texttt{SeqClassifier} \to \texttt{train\_step} \to \texttt{pytest} \]`,
sym: [[String.raw`\(\texttt{rnn\_forward}\)`, "Ng's forward pass in NumPy from x, Waa, Wax, Wya, ba, by, returns every a and ŷ"], [String.raw`\(\texttt{count\_rnn\_params}\)`, "nn.RNN's count from the formula, for any layers and directions"], [String.raw`\(\texttt{last\_step}\)`, "out[i, lengths[i] − 1] for every i"], [String.raw`\(\texttt{SeqClassifier}\)`, "nn.RNN, nn.LSTM or nn.GRU with packing and a linear head"], [String.raw`\(\texttt{train\_step}\)`, "backward, <code>clip_grad_norm_</code>, step, returns loss and norm"]],
how: ["Paste the command.", "Check that <code>rnn_forward</code> matches nn.RNN once the weights are copied in.", "Check that the classifier packs the batch with <code>enforce_sorted</code>=False.", "Check that clipping sits between backward and step.", "Run pytest and commit."],
say: String.raw`A tested RNN module reproduces the hand-computed cell, the parameter counts and the shapes, reads each padded sequence at its own length and clips the gradient norm at the right point of the training step.`,
num: String.raw`Tests expect outputs −0.7475 and 0.4647 at step 3 from card 2's cell, 640, 110 and 270 parameters for card 3 and card 4's RNNs, <code>h_n</code> of shape (4, 4, 5) for two bidirectional layers, <code>last_step</code> equal to the packed <code>h_n</code> (0.7181, −0.4021) for card 10's sequence 1, a clipped gradient of norm 1 from (12, −5), and a sentence loss of 9.4980 from card 5's probabilities.`,
r(fig, ctl) {
  ML.agent(fig, ctl, {
    prompt: "Create src/rnn_tools.py. rnn_forward(x, Waa, Wax, Wya, ba, by) runs Ng's RNN cell in NumPy from a0 = 0 over x of shape (T, n_x) and returns the stacked activations and linear outputs. count_rnn_params(input_size, hidden_size, num_layers=1, bidirectional=False) returns the nn.RNN count from the formula. last_step(out, lengths) returns out[i, lengths[i] - 1] for a batch_first output. SeqClassifier(input_size, hidden_size, n_classes, cell='lstm', bidirectional=False) wraps nn.RNN, nn.LSTM or nn.GRU with batch_first=True, packs the padded batch with pack_padded_sequence(enforce_sorted=False), concatenates the last layer's two directions when bidirectional, and returns logits from a Linear head. train_step(model, batch, loss_fn, optimizer, max_norm) runs zero_grad, forward, backward, clip_grad_norm_ and step and returns the loss and the total norm before clipping. Write tests/test_rnn_tools.py with the numbers from Lesson 39: card 2's outputs -0.7475 and 0.4647, nn.RNN parameter counts 640, 110 and 270, card 10's batch with lengths 5, 3, 2 where last_step equals the packed h_n, a gradient (12, -5) clipped to norm 1, and the language model loss 9.4980. No downloads.",
    actions: ["$ pytest -q", "......                                                   [100%]", "6 passed"],
    files: [["src/rnn_tools.py", "rnn_forward, count_rnn_params, last_step, SeqClassifier, train_step"], ["tests/test_rnn_tools.py", "six tests with the numbers of cards 2, 3, 4, 5, 7 and 10"]],
    checks: ["rnn_forward applies tanh to the hidden state and starts from zeros", "the parameter count includes both biases, matching sum(p.numel())", "SeqClassifier passes enforce_sorted=False and never reads out[:, -1] on a padded batch", "clip_grad_norm_ is called after backward and before step, and its return value is logged", "the loss gets logits with the class dimension second or flattened"]
  });
}},

{s: "13. Test", t: "Lesson 39 test: recurrent neural networks",
intu: String.raw`Twelve questions on the RNN cell, parameter counts, nn.RNN shapes, the sequence loss, backpropagation through time, clipping, teacher forcing, padding and choosing a layer. All numbers are new.`,
eq: String.raw`\[ \text{12 questions} \]`,
sym: [["pass mark", "9 of 12, then redo the missed cards"]],
how: ["Write the cell equation before substituting.", "Write the shapes of out and <code>h_n</code> before choosing an index.", "Answer without running anything.", "Reopen the named card for any miss."],
say: String.raw`Twelve questions covering the whole lesson.`,
num: String.raw`Score <b>9 or more</b> to move on to LSTM and GRU.`,
r(fig, ctl) {
  ML.quiz(fig, ctl, [
    { q: "A one-unit RNN has W_aa = 0.5, W_ax = 2, b_a = 0 and a⟨0⟩ = 0. The input is x = (1, 0). What is a⟨2⟩?", o: ["0.9640", "0.4479", "0.4820", "0"], a: 1, why: "a⟨1⟩ = tanh(2 · 1) = 0.9640. a⟨2⟩ = tanh(0.5 · 0.9640 + 2 · 0) = tanh(0.482) = 0.4479. 0.4820 forgets the tanh. Card 2." },
    { q: "How many parameters does nn.RNN(8, 32) have?", o: ["1,312", "1,280", "1,344", "1,056"], a: 2, why: "32 · 8 + 32 · 32 + 2 · 32 = 256 + 1,024 + 64 = 1,344. PyTorch keeps two biases. One bias gives 1,312. Card 3." },
    { q: "A language model has a 5,000-word vocabulary as one-hot inputs, 64 hidden units and a softmax over the 5,000 words. Using Ng's count with one bias per layer, how many parameters?", o: ["324,160", "649,160", "649,096", "4,160"], a: 1, why: "The cell: 64 · (64 + 5,000 + 1) = 324,160. The output layer: 5,000 · (64 + 1) = 325,000. Total 649,160. Card 3." },
    { q: "rnn = nn.RNN(6, 16, num_layers=3, batch_first=True) gets x of shape (8, 25, 6). What are the shapes of out and h_n?", o: ["(8, 25, 16) and (3, 8, 16)", "(8, 25, 48) and (3, 8, 16)", "(25, 8, 16) and (3, 25, 16)", "(8, 25, 16) and (8, 3, 16)"], a: 0, why: "out holds the top layer at every step, (B, T, H). h_n holds every layer's last state and keeps the batch in dimension 1 even with batch_first. Card 4." },
    { q: "A bidirectional nn.LSTM with hidden_size 32 and one layer feeds a sentiment head. Which input is right for the head and what width does it have?", o: ["out[:, -1], width 32", "torch.cat((h_n[-2], h_n[-1]), dim=1), width 64", "h_n[-1], width 32", "out[:, 0], width 64"], a: 1, why: "The forward state at the end and the backward state at the start are the two final states, h_n[-2] and h_n[-1]. out[:, -1] has width 64 but its backward half has read only the last word. Card 4." },
    { q: "A model gives the true next words of a 3-word sentence probabilities 0.5, 0.25 and 0.125. What are the summed loss and the perplexity?", o: ["4.1589 and 4", "1.3863 and 4", "4.1589 and 64", "0.0156 and 8"], a: 0, why: "The negative logs are ln 2, ln 4 and ln 8, summing to 6 ln 2 = 4.1589. The mean is 2 ln 2 = 1.3863 and perplexity e to the 1.3863 is 4. The sentence probability is 1/64. Card 5." },
    { q: "In a linear one-unit RNN with recurrent weight 0.8, by what factor is the gradient from step 31 back to step 1 multiplied?", o: ["0.8", "24", "1.2e-3", "1.5e-3"], a: 2, why: "There are 30 factors of 0.8 between step 1 and step 31, and 0.8 to the 30th is 1.2e-3. 1.5e-3 uses 29 factors. Card 6." },
    { q: "The gradient of all parameters is (6, 8, 0) and clip_grad_norm_ is called with max_norm = 2. What gradient does the optimizer see?", o: ["(2, 2, 0)", "(6, 8, 0)", "(1.2, 1.6, 0)", "(0.6, 0.8, 0)"], a: 2, why: "The norm is 10, above 2, so the gradient is scaled by 2/10 to (1.2, 1.6, 0), same direction. (2, 2, 0) is clipping by value. Card 7." },
    { q: "A training step reads: optimizer.zero_grad(), clip_grad_norm_(model.parameters(), 1.0), loss.backward(), optimizer.step(). What happens?", o: ["the gradients are clipped twice", "clipping has no effect, because the gradients are computed after it", "an error is raised", "the learning rate is clipped instead"], a: 1, why: "After zero_grad the gradients are empty, so there is nothing to clip. backward then fills them unclipped. Clip between backward and step. Card 7." },
    { q: "A sequence model trained with teacher forcing predicts the next step well, but its 50-step generated forecasts drift away from the real signal. What is this called and what is one remedy?", o: ["overfitting, more dropout", "exposure bias, scheduled sampling that feeds the model's own predictions during training", "vanishing gradients, gradient clipping", "underfitting, a larger learning rate"], a: 1, why: "Training only ever showed the model true inputs, and at generation it sees its own slightly wrong outputs, so errors compound. Scheduled sampling exposes it to its own predictions during training. Card 9." },
    { q: "A batch padded to length 12 holds a sequence of length 4. The classifier uses out[:, -1]. What does it read for that sequence?", o: ["the state after step 4", "zeros", "the state after 8 extra pad steps", "an error"], a: 2, why: "The RNN keeps processing the zero inputs, so step 12's state includes 8 pad steps. Pack with the lengths or index out at length − 1 = 3. Card 10." },
    { q: "You must predict tomorrow's average river level from the last 60 days of daily readings, which depend on the rain of several weeks before. Which setup fits best?", o: ["nn.Conv2d on a 60 by 1 image with CrossEntropyLoss", "nn.Linear on 60 inputs with BCEWithLogitsLoss", "nn.LSTM on (B, 60, 1), a Linear(H, 1) head on the last state, MSELoss", "a plain nn.RNN with gradient clipping and CrossEntropyLoss"], a: 2, why: "An ordered sequence with dependence many steps back calls for a gated recurrent layer, and a number calls for MSELoss. Card 11." }
  ], "Lesson 39 test");
}}
],
summary: String.raw`A recurrent network reads a sequence one step at a time and carries a hidden state, \(a^{\langle t \rangle} = \tanh(W_{aa} a^{\langle t-1 \rangle} + W_{ax} x^{\langle t \rangle} + b_a)\), with the same weights at every step, so it handles any length with a parameter count that does not depend on it. Tasks come in five shapes, from many-to-one (use the last state) to many-to-many (use every output) and encoder and decoder. nn.RNN returns out, the top layer at every step, and <code>h_n</code>, every layer's final state, and <code>batch_first</code> never changes <code>h_n</code>. A sequence loss sums the cross-entropy of every step, and perplexity is e to the mean. Backpropagation through time multiplies one Jacobian per step, so gradients to early steps vanish or explode geometrically. Clipping the gradient norm between backward and step tames explosions, and a plain RNN still fails to remember across long gaps, which is what the LSTM and GRU of Lesson 40 fix. Teacher forcing trains on true previous values and exposes the model to its own errors only at generation, and padded batches must be packed or indexed at each length.`,
sheet: [[String.raw`\[ a^{\langle t \rangle} = \tanh\big(W_{aa} a^{\langle t-1 \rangle} + W_{ax} x^{\langle t \rangle} + b_a\big) \]`, "the RNN cell, Ng's notation"], [String.raw`\[ \hat y^{\langle t \rangle} = g\big(W_{ya} a^{\langle t \rangle} + b_y\big) \]`, "the output at step t"], [String.raw`\[ n_a(n_a + n_x + 1) + n_y(n_a + 1) \]`, "Ng's parameter count, independent of T"], [String.raw`\[ H\,I + H^2 + 2H \]`, "nn.RNN(I, H), one layer, one direction"], [String.raw`\[ \texttt{out}: (B, T, D H), \quad \texttt{h\_n}: (D L, B, H) \]`, "nn.RNN outputs with batch first set to True"], [String.raw`\[ \mathcal{L} = \sum_{t} -\log \hat y^{\langle t \rangle}_{y^{\langle t \rangle}} \]`, "sequence loss, perplexity is e to the mean"], [String.raw`\[ \frac{\partial a^{\langle t \rangle}}{\partial a^{\langle k \rangle}} = \prod_{j=k+1}^{t} \operatorname{diag}\big(1 - (a^{\langle j \rangle})^2\big) W_{aa} \]`, "backpropagation through time"], [String.raw`\[ g \leftarrow \frac{c}{\lVert g \rVert} g \;\text{ if }\; \lVert g \rVert \gt c \]`, "clipping by norm"], [String.raw`\[ x^{\langle t \rangle} = y^{\langle t-1 \rangle} \text{ in training}, \quad x^{\langle t \rangle} = \hat y^{\langle t-1 \rangle} \text{ in generation} \]`, "teacher forcing and free running"], [String.raw`\[ h_i = \texttt{out}[i, \ell_i - 1] \]`, "final state of a padded sequence"]],
sources: ["AME 5970 has no lecture notes or homework for week 12 (RNNs), so the topic order follows the syllabus and the recurring final practice topics listed in the course map: exploding and vanishing gradients, gradient clipping, teacher forcing and exposure bias, choosing nn.Linear, nn.Conv2d or nn.LSTM for a task", "Andrew Ng, Deep Learning Specialization, course 5 (Sequence Models) week 1: Why sequence models, Notation, Recurrent neural network model, Backpropagation through time, Different types of RNNs, Language model and sequence generation, Sampling novel sequences, Vanishing gradients with RNNs, Bidirectional RNN, Deep RNNs", "Goodfellow, Bengio and Courville, Deep Learning, chapter 10: unfolding computational graphs, recurrent networks, teacher forcing, the challenge of long-term dependencies, clipping gradients", "Zhang, Lipton, Li and Smola, Dive into Deep Learning, chapters 9 and 10: recurrent neural networks, backpropagation through time, gradient clipping", "Pascanu, Mikolov and Bengio (2013), On the difficulty of training recurrent neural networks: the cliff and clipping by norm", "Bengio, Simard and Frasconi (1994), Learning long-term dependencies with gradient descent is difficult", "Bengio, Vinyals, Jaitly and Shazeer (2015), Scheduled sampling for sequence prediction with recurrent neural networks", "PyTorch 2.15 documentation: nn.RNN, nn.LSTM, nn.GRU, pack_padded_sequence, clip_grad_norm_. Every number, shape and message in this lesson was produced with PyTorch 2.15 and NumPy on the CPU, the memory and teacher forcing runs are fresh data"]
});
})();

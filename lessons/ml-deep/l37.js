(function () {
/* ML shelf, Part 7, Lesson 37: Residual networks and transfer learning (Pro). The course has no lecture notes for week 11, so the order follows the homework: HW10 D0 (a shortcut carries a reference signal), D1 (the gradient route, 1e-8 against 2.1436), D2 (ResidualUnit with identity and projection shortcuts, TinyCIFARClassifier with AdaptiveAvgPool2d, 14,650 parameters) and D3 (the paired comparison, run on a labeled synthetic stand-in because CIFAR-10 was unreachable), with the solutions doc. Andrew Ng's Deep Learning Specialization course 4 week 2 (ResNets, why ResNets work, networks in networks and 1 by 1 convolutions, transfer learning) is the spine, with He et al. (2016) and Yosinski et al. (2014).
   Data: card 1 trains plain and residual MLPs (width 16, 1 to 16 blocks of two layers) on 300 fresh two-spiral points from default_rng(3737), Adam 0.01, 600 full-batch steps, seeds 0 to 2, PyTorch 2.15 on the CPU. Card 3 trains one block to copy relu(N(0,1)) inputs. Card 9 pretrains HW10's MNISTCNN on digits 0 to 4 of the real-MNIST 5,000-image mlxtend subset and transfers it to digits 5 to 9 with 1 to 100 labels per class, tested on 1,000 held-out images. */
const C = ML.C;
const tx = (x, y, t, a, cls) => `<text class="${cls || "ts"}" x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""}>${t}</text>`;
const f = (v, d) => { const s = (+v).toFixed(d == null ? 4 : d); return /^-0(\.0*)?$/.test(s) ? s.slice(1) : s; };
const mn = v => String(v).replace(/-/g, "−");
const fm = (v, d) => mn(f(v, d));
const cm = v => mn(Math.round(v).toLocaleString("en-US"));
const RO = items => ML.readout(items.map(([k, v]) => [k, mn(v)]));
const TB = (head, rows) => `<table style="width:100%;border-collapse:collapse;font-size:13px;margin-top:6px"><tr>${head.map(h => `<th style="text-align:left;padding:4px 6px;border-bottom:1.5px solid var(--line);color:var(--muted);font-weight:600">${h}</th>`).join("")}</tr>${rows.map(r => `<tr>${r.map(c => `<td style="padding:4px 6px;border-bottom:1px solid var(--line);vertical-align:top">${c}</td>`).join("")}</tr>`).join("")}</table>`;
const legend = (items, x0, y, dx) => items.map(([lab, col, dash], i) => `<line x1="${x0 + i * dx}" y1="${y - 4}" x2="${x0 + i * dx + 18}" y2="${y - 4}" stroke="${col}" stroke-width="3" ${dash ? `stroke-dasharray="${dash}"` : ""}/>` + tx(x0 + i * dx + 23, y, lab)).join("");
const vec = v => "(" + v.map(x => fm(x, Number.isInteger(x) ? 0 : 2)).join(", ") + ")";
const relu = v => v.map(x => Math.max(0, x));
const mv = (W, v) => W.map(r => r.reduce((s, w, j) => s + w * v[j], 0));
const add = (a, b) => a.map((x, i) => x + b[i]);
const mean = a => a.reduce((s, x) => s + x, 0) / a.length;
const sd = a => { const m = mean(a); return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1)); };
/* the residual block of cards 2 to 4, Ng's notation with a[l] = (1, 2, 0) */
const B2 = { a: [1, 2, 0], W1: [[1, -1, 0], [0, 1, 1], [-1, 0, 1]], b1: [0, -1, 0.5], W2: [[0.5, -1, 0], [1, 0.5, -1], [0, -0.5, 2]], b2: [0, -1, 0] };
const blk = c => { const z1 = add(mv(B2.W1, B2.a), B2.b1), a1 = relu(z1), z2 = add(mv(B2.W2, a1), B2.b2).map(x => c * x); return { z1, a1, z2, plain: relu(z2), sum: add(z2, B2.a), res: relu(add(z2, B2.a)) }; };
const DATA = {"deg":{"1p":{"curves":[[0.6956,0.5147,0.1721,0.0353,0.01,0.0037,0.0021,0.0014,0.001,0.0008,0.0006,0.0005,0.0004,0.0003,0.0003,0.0002,0.0002,0.0002,0.0002,0.0001,0.0001,0.0001,0.0001,0.0001,0.0001],[0.6978,0.5967,0.4664,0.2799,0.1811,0.1433,0.102,0.0665,0.0456,0.0173,0.011,0.0015,0.0008,0.0006,0.0004,0.0004,0.0003,0.0003,0.0002,0.0002,0.0002,0.0001,0.0001,0.0001,0.0001],[0.7001,0.5958,0.4526,0.1913,0.0711,0.0122,0.0057,0.003,0.0019,0.0013,0.0009,0.0007,0.0005,0.0004,0.0004,0.0003,0.0002,0.0002,0.0002,0.0002,0.0001,0.0001,0.0001,0.0001,0.0001]],"acc":[1.0,1.0,1.0],"g0":[0.00781,0.0129,0.0076]},"1r":{"curves":[[0.6994,0.5422,0.2756,0.1465,0.1041,0.0285,0.0063,0.0023,0.0013,0.0009,0.0006,0.0005,0.0004,0.0003,0.0002,0.0002,0.0002,0.0002,0.0001,0.0001,0.0001,0.0001,0.0001,0.0001,0.0001],[0.7025,0.5657,0.377,0.1748,0.0742,0.0108,0.0033,0.0016,0.0011,0.0008,0.0006,0.0004,0.0004,0.0003,0.0002,0.0002,0.0002,0.0002,0.0001,0.0001,0.0001,0.0001,0.0001,0.0001,0.0001],[0.7144,0.5724,0.2988,0.1041,0.0218,0.0094,0.0057,0.0036,0.0024,0.0017,0.0013,0.001,0.0008,0.0006,0.0005,0.0004,0.0004,0.0003,0.0003,0.0002,0.0002,0.0002,0.0002,0.0001,0.0001]],"acc":[1.0,1.0,1.0],"g0":[0.0944,0.0922,0.0854]},"2p":{"curves":[[0.7037,0.487,0.2362,0.093,0.0091,0.0024,0.001,0.0006,0.0004,0.0003,0.0003,0.0002,0.0002,0.0001,0.0001,0.0001,0.0001,0.0001,0.0001,0.0001,0.0001,0.0001,0.0,0.0,0.0],[0.6958,0.5221,0.2148,0.1075,0.0164,0.0025,0.0007,0.0003,0.0001,0.0001,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],[0.693,0.5999,0.4192,0.1456,0.0182,0.0006,0.0001,0.0001,0.0001,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0]],"acc":[1.0,1.0,1.0],"g0":[0.000607,0.00316,0.00103]},"2r":{"curves":[[0.7237,0.3069,0.1426,0.0428,0.0042,0.0012,0.0006,0.0004,0.0003,0.0002,0.0002,0.0001,0.0001,0.0001,0.0001,0.0001,0.0001,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],[0.6849,0.4054,0.1536,0.0229,0.0005,0.0001,0.0001,0.0001,0.0001,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],[0.7123,0.5277,0.1459,0.1023,0.0324,0.008,0.0004,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0]],"acc":[1.0,1.0,1.0],"g0":[0.0725,0.0789,0.0806]},"4p":{"curves":[[0.6935,0.4635,0.4296,0.3508,0.1555,0.0959,0.0835,0.0716,0.2898,0.1676,0.067,0.0468,0.0355,0.0217,0.017,0.0116,0.0063,0.7673,0.149,0.0324,0.0145,0.006,0.0217,0.0089,0.001],[0.6974,0.4773,0.4617,0.4408,0.3718,0.3134,0.1865,0.4265,0.3803,0.344,0.3318,0.3227,0.3102,0.2966,0.2949,0.2863,0.2262,0.1734,0.1395,0.1143,0.0898,0.065,0.0253,0.0073,0.0036],[0.6987,0.6213,0.4606,0.4224,0.3421,0.3013,0.2997,0.1693,0.1854,0.0999,0.0492,0.0319,0.0248,0.021,0.0181,0.0158,0.0139,0.0123,0.011,0.0099,0.009,0.0031,0.0003,0.0001,0.0001]],"acc":[1.0,1.0,1.0],"g0":[3.07e-05,3.61e-05,2.81e-05]},"4r":{"curves":[[0.6805,0.1837,0.008,0.0002,0.0001,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],[0.6602,0.2106,0.0232,0.0001,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],[0.696,0.2745,0.0575,0.0359,0.0147,0.0082,0.0024,0.0003,0.0001,0.0001,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0]],"acc":[1.0,1.0,1.0],"g0":[0.0607,0.0508,0.0535]},"8p":{"curves":[[0.6975,0.6932,0.6931,0.6931,0.6931,0.6931,0.6893,0.51,0.4518,0.4472,0.451,0.451,0.451,0.451,0.451,0.451,0.451,0.451,0.451,0.451,0.451,0.451,0.451,0.451,0.451],[0.6951,0.6932,0.6931,0.6931,0.7577,0.5851,0.5869,0.6411,0.6216,0.6035,0.5916,0.5157,0.4742,0.4517,0.4347,0.5255,0.4674,0.4159,0.7129,0.6877,0.5777,0.534,0.4967,0.442,0.364],[0.6996,0.6932,0.6932,0.6931,0.6931,0.4976,0.5257,0.5231,0.5227,0.5227,0.5227,0.5227,0.5227,0.5227,0.5227,0.5227,0.5226,0.5222,0.5227,0.5227,0.5227,0.5227,0.5227,0.5227,0.5227]],"acc":[0.7733,0.8133,0.7067],"g0":[9.17e-09,1.81e-09,1.74e-09]},"8r":{"curves":[[0.7309,0.1553,0.0004,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],[0.7185,0.3614,0.1691,0.093,0.9062,0.0768,0.0063,0.0002,0.0001,0.0001,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],[0.7961,0.3265,0.4022,0.3528,0.1837,0.1573,0.1162,0.0854,0.021,0.0004,0.0001,0.0001,0.0001,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0]],"acc":[1.0,1.0,1.0],"g0":[0.0568,0.0784,0.102]},"16p":{"curves":[[0.6933,0.6932,0.6931,0.6931,0.6931,0.6931,0.6931,0.6931,0.6931,0.6931,0.6931,0.6931,0.6931,0.6931,0.6931,0.6931,0.6931,0.6931,0.6931,0.6931,0.6931,0.6931,0.6931,0.6931,0.6931],[0.6997,0.6932,0.6932,0.6931,0.6931,0.6931,0.6931,0.6931,0.6931,0.6931,0.6931,0.6931,0.6931,0.6931,0.6931,0.6931,0.6931,0.6931,0.6931,0.6931,0.6931,0.6931,0.6931,0.6931,0.6931],[0.6942,0.6932,0.6931,0.6931,0.6931,0.6931,0.6931,0.6931,0.6931,0.6931,0.6931,0.6931,0.6931,0.6931,0.6931,0.6931,0.6931,0.6931,0.6931,0.6931,0.6931,0.6931,0.6931,0.6931,0.6931]],"acc":[0.5,0.5,0.5],"g0":[1.77e-15,3.44e-15,8.91e-16]},"16r":{"curves":[[0.7396,0.4888,0.299,0.386,0.2078,0.0729,0.013,0.0001,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],[0.8496,0.3456,0.3721,0.1513,0.0641,0.0125,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],[0.7081,0.4513,0.2552,0.7761,0.3957,0.1853,0.1468,0.1265,0.0709,0.2835,0.0098,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0]],"acc":[1.0,1.0,1.0],"g0":[0.0936,0.165,0.0425]},"4h":{"curves":[[0.6926,0.3312,0.0012,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],[0.7547,0.3016,0.0217,0.0008,0.0001,0.0001,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],[0.6988,0.4425,0.2316,0.0211,0.0005,0.0001,0.0001,0.0001,0.0001,0.0001,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0]],"acc":[1.0,1.0,1.0],"g0":[0.0425,0.16,0.0452]},"8h":{"curves":[[0.8258,0.4879,0.0161,0.2061,0.016,0.0013,0.0005,0.3799,1.4053,0.0316,0.0021,0.0003,0.0002,0.0001,0.0001,0.0001,0.0001,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],[0.6815,0.2195,0.0686,0.0111,0.0007,0.0002,0.0001,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],[0.6944,0.4234,0.23,0.1207,0.0819,0.0407,0.0036,0.0003,0.0001,0.0001,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0]],"acc":[1.0,1.0,1.0],"g0":[0.17,0.0581,0.031]},"16h":{"curves":[[0.7009,0.6071,0.3846,0.3577,0.07,0.0002,0.0033,0.0459,0.8881,0.6932,0.6932,0.6931,0.6931,0.6931,0.6931,0.6931,0.6931,0.6931,0.6931,0.6931,0.6931,0.6931,0.6931,0.6931,0.6931],[0.7,0.4386,0.4577,0.451,0.451,0.451,0.451,0.451,0.451,0.451,0.451,0.451,0.451,0.451,0.451,0.451,0.451,0.451,0.451,0.451,0.451,0.451,0.451,0.451,0.451],[0.6929,0.581,0.729,0.6935,0.5161,0.4676,0.4665,0.4663,0.4663,0.4663,0.4663,0.4663,0.4663,0.4663,0.4663,0.4663,0.4663,0.4663,0.4663,0.4663,0.4663,0.4663,0.4663,0.4663,0.4663]],"acc":[0.5,0.7733,0.76],"g0":[0.0111,0.0066,0.000963]}},"tl":{"1scratch":[0.606,0.489,0.456],"1randfrozen":[0.471,0.385,0.424],"1frozen":[0.283,0.356,0.501],"1finetune":[0.533,0.464,0.56],"3scratch":[0.755,0.757,0.724],"3randfrozen":[0.585,0.631,0.572],"3frozen":[0.603,0.582,0.584],"3finetune":[0.752,0.778,0.758],"10scratch":[0.856,0.865,0.886],"10randfrozen":[0.692,0.682,0.701],"10frozen":[0.689,0.664,0.702],"10finetune":[0.864,0.896,0.898],"30scratch":[0.895,0.923,0.905],"30randfrozen":[0.726,0.694,0.659],"30frozen":[0.73,0.728,0.744],"30finetune":[0.907,0.929,0.93],"100scratch":[0.947,0.961,0.946],"100randfrozen":[0.706,0.686,0.685],"100frozen":[0.719,0.728,0.744],"100finetune":[0.96,0.967,0.962],"1convfrozen":[0.533,0.473,0.563],"3convfrozen":[0.738,0.776,0.778],"10convfrozen":[0.859,0.887,0.898],"30convfrozen":[0.909,0.939,0.931],"100convfrozen":[0.963,0.964,0.957]},"id":{"p0.0":[0.42957,0.4139,0.38622,0.32963,0.13177,0.00182,0.00013],"r0.0":[0.0505,0.03208,0.01658,0.00468,0.00149,0.00026,8e-05],"p0.01":[0.42957,0.4143,0.38728,0.33523,0.15274,0.00988,0.00734],"r0.01":[0.0505,0.03125,0.01536,0.00347,0.00062,2e-05,0.0]}};

addLesson("ml", "deep", {
level: "Pro", num: "Lesson 37",
id: "ml-deep-l37", title: "Residual networks and transfer learning", short: "37. ResNets and transfer learning",
big: String.raw`Lessons 33 to 36 kept running into the same wall: stack enough layers and the gradient at the bottom shrinks to nothing, so the deep network trains worse than a shallow one, even on its own training data. He, Zhang, Ren and Sun (2016) fixed this with one line of code. A residual block adds its input back to its output, \(a^{[l+2]} = g(z^{[l+2]} + a^{[l]})\), so the block only has to learn a change, and the gradient gets a route around every block. This lesson follows Andrew Ng's course 4 week 2 and HW10 Part D. It trains plain and residual networks side by side, works one block by hand, derives the gradient route from HW10 D1, handles shapes with projection shortcuts and global average pooling, opens ResNet-18, reads a paired comparison the way HW10 D3 asks, and then uses a network trained on one task as the starting point for another, which is transfer learning.`,
bridge: String.raw`The course has no lecture notes for week 11, so the topics follow the homework: HW10 D0 (a shortcut carries a reference signal), D1 (the gradient route), D2 (ResidualUnit and TinyCIFARClassifier) and D3 (the paired comparison), questions and solutions docs. Andrew Ng's Deep Learning Specialization course 4 week 2 (ResNets, Why ResNets work, Networks in networks and 1 by 1 convolutions, Transfer learning) is the spine, with He et al. (2016) for the architecture and Yosinski et al. (2014) for which layers transfer.`,
labels: { note: "Exam and project note" },
cards: [

{s: "1. Deeper can train worse", t: "The degradation problem, measured on a plain network and a residual one",
intu: String.raw`Ng opens the ResNet video with a plot from He et al.: in theory a deeper plain network can only fit the training set better, because extra layers could copy their input, but in practice the training error goes up again once the network gets deep. That is not overfitting, it is the training error itself. Here the same experiment runs on 300 spiral points. Every network has a 2 to 16 input layer, some number of blocks of two 16 by 16 layers, and one output. The plain version stacks the blocks, the residual version adds each block's input back before the second ReLU. Both start from identical weights for each seed. Pick a depth and compare the training curves.`,
eq: String.raw`\[ \text{plain: } a^{[l+2]} = g\big(z^{[l+2]}\big) \]
\[ \text{residual: } a^{[l+2]} = g\big(z^{[l+2]} + a^{[l]}\big) \]`,
sym: [[String.raw`\(a^{[l]}\)`, "the activation entering a block"], [String.raw`\(z^{[l+2]}\)`, "the output of the block's second linear layer, before the activation"], [String.raw`\(g\)`, "the ReLU"], ["block", "two linear layers with a ReLU between them, 512 parameters at width 16"], ["layers", "2 times the number of blocks plus 2"]],
how: ["Pick 1 or 2 blocks and see that all three versions reach a training loss near 0.", "Pick 8 blocks (18 layers) and watch the plain network with PyTorch's default initialization stall.", "Switch on He initialization for the plain network and see that it rescues 8 blocks.", "Pick 16 blocks (34 layers), where even He initialization stalls, while the residual network still fits.", "Read the gradient that reaches the input layer at step 0."],
say: String.raw`A deeper plain network can have a higher training loss than a shallower one, because the gradient that reaches its early layers vanishes, and adding each block's input to its output removes that problem without adding a single parameter.`,
num: String.raw`Final training loss after 600 Adam steps, seeds 0 to 2. Plain with the default initialization: 0.0001 at 1 block, 0.001, 0.0036, 0.0001 at 4, <b>0.451, 0.364, 0.523</b> at 8 (accuracy 77%, 81%, 71%) and <b>0.6931</b> = ln 2 at 16 (accuracy 50%). Plain with He initialization: 0.0 at 8 blocks, but 0.693, 0.451, 0.466 at 16. Residual: 0.0001 or less at every depth, 100% training accuracy. Gradient norm at the input layer at step 0: plain 7.8e-3 at 1 block, 9.2e-9 at 8, <b>1.8e-15</b> at 16, residual 9.4e-2 at 16.`,
note: String.raw`On an exam, keep the two failures apart. Overfitting is low training error and high validation error, and the cure is regularization or data. Degradation is high training error in a deeper network, and the cure is an architecture whose gradient reaches the early layers: residual connections, careful initialization and normalization.`,
r(fig, ctl) {
  const DEP = [1, 2, 4, 8, 16];
  let di = 3, he = false;
  ctl.innerHTML = `<div class="row">${DEP.map((d, i) => `<button data-r1="${i}">${d} block${d > 1 ? "s" : ""}</button>`).join("")}</div><div class="row"><button data-r1h="0">plain: PyTorch default init</button><button data-r1h="1">plain: He init</button></div><div id="r1o"></div>`;
  const u = () => {
    pick(ctl, "r1", di); const B = DEP[di], hasHe = B >= 4, useHe = he && hasHe; pick(ctl, "r1h", useHe ? 1 : 0);
    const P = DATA.deg[B + (useHe ? "h" : "p")], R = DATA.deg[B + "r"];
    const ax = ML.axes(70, 20, 560, 250, { xmin: 0, xmax: 600, ymin: -4, ymax: 0, nx: 6, ny: 4, fx: v => v, fy: v => "1e" + v, xl: "Adam step", yl: "training loss, log scale" });
    let s = ax.s;
    const line = (c, col, dash) => ML.path(c.map((v, i) => [ax.X(25 * i), ax.Y(Math.max(-4, Math.log10(Math.max(v, 1e-4))))]), col, 1.8, dash);
    P.curves.forEach(c => { s += line(c, useHe ? C.purple : C.coral); });
    R.curves.forEach(c => { s += line(c, C.teal, "5 3"); });
    s += `<line x1="${ax.X(0)}" y1="${ax.Y(Math.log10(0.6931))}" x2="${ax.X(600)}" y2="${ax.Y(Math.log10(0.6931))}" stroke="var(--muted)" stroke-dasharray="2 4"/>` + tx(ax.X(600) - 4, ax.Y(Math.log10(0.6931)) - 6, "ln 2, a coin flip", "end");
    s += legend([[useHe ? "plain, He init" : "plain, default init", useHe ? C.purple : C.coral], ["residual", C.teal, "5 3"]], 80, 318, 190) + tx(470, 318, `${2 * B + 2} layers, 3 seeds each`);
    fig.innerHTML = svg(330, s);
    const row = (lab, D) => [lab, D.curves.map(c => f(c[c.length - 1], 4)).join(", "), D.acc.map(a => Math.round(100 * a) + "%").join(", "), D.g0.map(g => g.toExponential(1)).join(", ")];
    $("r1o").innerHTML = TB(["network", "final loss", "train accuracy", "input-layer gradient at step 0"], [row(useHe ? "plain, He" : "plain, default", P), row("residual", R)].map(r => r.map(mn))) + (he && !hasHe ? `<p class="note">He initialization was run for 4, 8 and 16 blocks, where the default one starts to struggle.</p>` : "");
  };
  ctl.querySelectorAll("button[data-r1]").forEach(b => b.onclick = () => { di = +b.dataset.r1; u(); });
  ctl.querySelectorAll("button[data-r1h]").forEach(b => b.onclick = () => { he = b.dataset.r1h === "1"; u(); });
  u();
}},

{s: "2. The residual block by hand", t: "Two layers, then add the input back before the last ReLU",
intu: String.raw`Ng draws the main path: \(a^{[l]}\) goes through a linear step and a ReLU to \(a^{[l+1]}\), then another linear step to \(z^{[l+2]}\) and a ReLU to \(a^{[l+2]}\). The shortcut copies \(a^{[l]}\) forward and adds it to \(z^{[l+2]}\) just before that last ReLU. Nothing else changes, and the block has exactly the same parameters as before. Step through one block with three units. Here the plain block happens to send every unit below zero, so its output is all zeros and the information in \(a^{[l]}\) is gone. The residual block adds \(a^{[l]}\) back and the second unit survives.`,
eq: String.raw`\[ z^{[l+1]} = W^{[l+1]} a^{[l]} + b^{[l+1]}, \quad a^{[l+1]} = g(z^{[l+1]}) \]
\[ z^{[l+2]} = W^{[l+2]} a^{[l+1]} + b^{[l+2]}, \quad a^{[l+2]} = g\big(z^{[l+2]} + a^{[l]}\big) \]`,
sym: [[String.raw`\(W^{[l+1]}, b^{[l+1]}\)`, "first layer of the block, 3 by 3 and 3 here"], [String.raw`\(W^{[l+2]}, b^{[l+2]}\)`, "second layer of the block"], [String.raw`\(z^{[l+2]} + a^{[l]}\)`, "the addition, elementwise, so the two shapes must match"], ["main path", "the two layers, Ng's term"], ["shortcut", "also called a skip connection, here the identity"]],
how: ["Start from the input a[l] = (1, 2, 0).", "Apply the first layer and the ReLU.", "Apply the second layer, but stop before the ReLU.", "Plain block: apply the ReLU to z[l+2].", "Residual block: add a[l] first, then apply the ReLU."],
say: String.raw`A residual block computes its two layers as usual and adds the block's input to the second layer's output before the final activation, so the output is the activation of the input plus a learned change.`,
num: String.raw`\(z^{[l+1]}\) = (1 − 2, 2 + 0 − 1, −1 + 0.5) = (−1, 1, −0.5), \(a^{[l+1]}\) = (0, 1, 0). \(z^{[l+2]}\) = (−1, 0.5 − 1, −0.5) = (−1, −0.5, −0.5). Plain: <b>(0, 0, 0)</b>. Residual: \(z^{[l+2]} + a^{[l]}\) = (0, 1.5, −0.5), output <b>(0, 1.5, 0)</b>.`,
note: String.raw`HW10 D2's ResidualUnit puts BatchNorm after each convolution and adds the shortcut after the second BatchNorm and before the final ReLU, the same place as here. The addition is elementwise, not a concatenation. torch.cat would double the channels and is a different architecture.`,
r(fig, ctl) {
  const b = blk(1), names = ["input", "first layer", "first ReLU", "second layer", "plain block", "add the shortcut", "residual block"];
  ML.stepper(ctl, 7, k => {
    const box = (x, y, lab, v, on, col) => `<g class="${on ? (col || "c-teal") : "c-gray"}"><rect x="${x}" y="${y}" width="150" height="52" rx="8" stroke-width="${on ? 1.6 : 0.6}"/></g>` + tx(x + 75, y + 20, lab, "middle", "th") + tx(x + 75, y + 40, v == null ? "?" : vec(v), "middle", "t");
    const W = 150, X1 = 20, X2 = 190, X3 = 360, X4 = 525, Y1 = 60, Y2 = 170, Y3 = 280;
    let s = box(X1, Y1, "a[l]", B2.a, k === 0) + arrow(X1 + W + 2, Y1 + 26, X2 - 2, Y1 + 26, "var(--p)", 1.5);
    s += box(X2, Y1, "z[l+1]", k >= 1 ? b.z1 : null, k === 1) + arrow(X2 + W + 2, Y1 + 26, X3 - 2, Y1 + 26, "var(--p)", 1.5);
    s += box(X3, Y1, "a[l+1]", k >= 2 ? b.a1 : null, k === 2) + arrow(X3 + 75, Y1 + 54, X3 + 75, Y2 - 2, "var(--p)", 1.5);
    s += box(X3, Y2, "z[l+2]", k >= 3 ? b.z2 : null, k === 3) + arrow(X3 + W + 2, Y2 + 26, X4 - 2, Y2 + 26, C.coral, 1.5);
    s += box(X4, Y2, "plain: g(z[l+2])", k >= 4 ? b.plain : null, k === 4, "c-coral") + arrow(X3 + 75, Y2 + 54, X3 + 75, Y3 - 2, C.teal, 1.5);
    s += `<path d="M${X1 + 75} ${Y1 + 54} L${X1 + 75} ${Y3 + 26} L${X3 - 4} ${Y3 + 26}" fill="none" stroke="${C.teal}" stroke-width="${k >= 5 ? 2.6 : 1.2}" stroke-dasharray="${k >= 5 ? "0" : "5 4"}" marker-end="url(#ar)"/>` + tx(X1 + 84, Y3 + 18, "shortcut: copy a[l]", null);
    s += box(X3, Y3, "z[l+2] + a[l]", k >= 5 ? b.sum : null, k === 5) + arrow(X3 + W + 2, Y3 + 26, X4 - 2, Y3 + 26, C.teal, 1.5);
    s += box(X4, Y3, "residual: g(sum)", k >= 6 ? b.res : null, k === 6);
    s += tx(X2 + 75, Y1 - 14, "main path", "middle", "th");
    fig.innerHTML = svg(350, s);
  }, names);
  ctl.insertAdjacentHTML("beforeend", `<div class="sym" style="margin-top:8px"><b>W[l+1]</b><span>[[1, −1, 0], [0, 1, 1], [−1, 0, 1]], b = (0, −1, 0.5)</span><b>W[l+2]</b><span>[[0.5, −1, 0], [1, 0.5, −1], [0, −0.5, 2]], b = (0, −1, 0)</span></div>`);
}},

{s: "3. The identity is easy to learn", t: "Why an extra residual block cannot hurt much, Ng's argument and a measurement",
intu: String.raw`Ng's explanation of why ResNets work: suppose weight decay pushes the second layer's weights and bias toward 0. Then \(z^{[l+2]} \to 0\) and the residual block outputs \(g(a^{[l]})\). Because \(a^{[l]}\) came out of a ReLU it has no negative entries, so \(g(a^{[l]}) = a^{[l]}\): the block becomes the identity. A plain block in the same situation outputs \(g(0) = 0\) and destroys its input. So adding a residual block to a network can start out as doing nothing, and only helps if it finds something useful. Slide the scale of the second layer down to 0 and watch both outputs, then look at a block that has to learn the identity from data.`,
eq: String.raw`\[ W^{[l+2]} = 0,\; b^{[l+2]} = 0 \;\Rightarrow\; a^{[l+2]} = g\big(a^{[l]}\big) = a^{[l]} \]
\[ \text{plain block: } a^{[l+2]} = g(0) = 0 \]`,
sym: [[String.raw`\(c\)`, "a scale on the second layer, both its weights and its bias"], [String.raw`\(a^{[l]} \ge 0\)`, "true for anything that left a ReLU, so the final ReLU changes nothing"], ["weight decay", "the L2 penalty of Lessons 19 and 35, it pulls weights toward 0"], ["learn the identity", "fit a block so that its output equals its input"]],
how: ["Set the scale c to 1 and read the two outputs from card 2.", "Lower c and watch the residual output move toward a[l] = (1, 2, 0).", "At c = 0 the plain block outputs zeros.", "Switch to the learning view: both blocks are trained to copy their input.", "Compare the starting losses and the effect of weight decay."],
say: String.raw`When the second layer's weights and bias are zero, a residual block passes its nonnegative input through unchanged while a plain block outputs zero, so a residual block starts close to the identity and weight decay keeps it there unless the data need a change.`,
num: String.raw`Scale c = 1: plain (0, 0, 0), residual (0, 1.5, 0). c = 0.5: residual (0.5, 1.75, 0). c = 0: residual <b>(1, 2, 0)</b> = \(a^{[l]}\), plain still (0, 0, 0). Learning the identity on 256 inputs of 8 features, same small initial weights, SGD 0.1: the plain block starts at MSE <b>0.4296</b> and the residual block at <b>0.0505</b>. After 300 steps 0.1318 against 0.0015. With weight decay 0.01 after 2,000 steps the residual block reaches below 1e-5 with its second weight matrix shrunk to norm 0.20, the plain block stays at 0.0073 with norm 2.73.`,
note: String.raw`HW10 D2's check zeros every parameter of a ResidualUnit in eval mode and confirms the output equals ReLU(x). The solutions doc adds the caution: a trained block is not the identity, it is the identity plus a learned change, and with BatchNorm and the outer ReLU it is a nonlinear map.`,
r(fig, ctl) {
  let v = "scale";
  ctl.innerHTML = `<div class="row"><button data-r3="scale">scale the second layer</button><button data-r3="learn">learn the identity</button></div><div id="r3c"></div><div id="r3o"></div>`;
  const u = () => {
    pick(ctl, "r3", v);
    if (v === "scale") {
      if (!$("r3s")) $("r3c").innerHTML = sl("r3s", "scale c of W[l+2] and b[l+2]", 0, 1, 0.05, 1);
      const c = +$("r3s").value; $("r3sv").textContent = f(c, 2);
      const b = blk(c);
      const ax = ML.axes(80, 24, 540, 220, { xmin: 0, xmax: 3, ymin: 0, ymax: 2.5, nx: 3, ny: 5, fx: () => "", fy: v => f(v, 1), yl: "value", grid: true });
      let s = ax.s;
      [["a[l]", B2.a, C.gray], ["plain", b.plain, C.coral], ["residual", b.res, C.teal]].forEach(([lab, vv, col], g) => vv.forEach((x, i) => {
        const x0 = ax.X(i) + 30 + g * 52; s += `<rect x="${x0}" y="${ax.Y(x)}" width="44" height="${Math.max(1, ax.Y(0) - ax.Y(x))}" fill="${col}" opacity="0.85" rx="3"/>` + tx(x0 + 22, ax.Y(x) - 5, fm(x, 2), "middle");
      }));
      [0, 1, 2].forEach(i => { s += tx(ax.X(i + 0.5), 264, "unit " + (i + 1), "middle", "t"); });
      s += legend([["input a[l]", C.gray], ["plain output", C.coral], ["residual output", C.teal]], 90, 292, 180);
      fig.innerHTML = svg(304, s);
      $("r3o").innerHTML = RO([["c · z[l+2]", vec(b.z2)], ["plain", vec(b.plain)], ["residual", vec(b.res)]]);
      $("r3s").oninput = u;
    } else {
      $("r3c").innerHTML = "";
      const ST = [0, 10, 30, 100, 300, 1000, 2000], D = DATA.id;
      const ax = ML.axes(80, 20, 540, 240, { xmin: 0, xmax: Math.log10(2001), ymin: -6, ymax: 0, nx: 3, ny: 6, fx: v => cm(10 ** v - 1), fy: v => "1e" + v, xl: "SGD step (log scale)", yl: "MSE of copying the input" });
      let s = ax.s;
      const ln = (c, col, dash) => ML.path(c.map((y, i) => [ax.X(Math.log10(ST[i] + 1)), ax.Y(Math.max(-6, Math.log10(Math.max(y, 1e-6))))]), col, 2.2, dash);
      s += ln(D["p0.0"], C.coral) + ln(D["r0.0"], C.teal) + ln(D["p0.01"], C.coral, "5 3") + ln(D["r0.01"], C.teal, "5 3");
      s += legend([["plain", C.coral], ["residual", C.teal], ["plain, weight decay 0.01", C.coral, "5 3"], ["residual, weight decay 0.01", C.teal, "5 3"]], 40, 312, 160);
      fig.innerHTML = svg(326, s);
      $("r3o").innerHTML = TB(["block", "step 0", "step 300", "step 2,000", "norm of W[l+2] at the end"], [["plain", "0.4296", "0.1318", "0.00013", "3.14"], ["residual", "0.0505", "0.0015", "0.00008", "1.47"], ["plain, decay 0.01", "0.4296", "0.1527", "0.0073", "2.73"], ["residual, decay 0.01", "0.0505", "0.0006", "below 1e-5", "0.20"]]);
    }
  };
  ctl.querySelectorAll("button[data-r3]").forEach(b => b.onclick = () => { v = b.dataset.r3; u(); });
  u();
}},

{s: "4. The gradient route", t: "HW10 D1: a product of small factors against a product of one plus small factors",
intu: String.raw`HW10 D1 strips the idea to one number per block. A plain block multiplies by a, so a chain of L blocks gives \(h = a^L x\) and the derivative \(a^L\). A residual block computes \(x + ax\), so each factor becomes \(1 + a\) and the chain gives \((1 + a)^L\). With a = 0.1 and L = 8 that is 1e-8 against 2.14. For vectors the same thing happens with Jacobians: an identity shortcut adds the identity matrix to the block's Jacobian, and the outer ReLU multiplies by its 0 or 1 mask. Move the sliders, and look for the settings where the residual product also vanishes or explodes, because a shortcut is a route, not a guarantee.`,
eq: String.raw`\[ \frac{dh}{dx}\Big|_{\text{plain}} = a^L, \qquad \frac{dh}{dx}\Big|_{\text{residual}} = (1 + a)^L \]
\[ J_h = D\,\big(I + J_F\big), \qquad D = \operatorname{diag}\big(g'(z^{[l+2]} + a^{[l]})\big) \]`,
sym: [[String.raw`\(a\)`, "the factor of one toy block, HW10 D1 uses 0.1"], [String.raw`\(L\)`, "the number of blocks in the chain"], [String.raw`\(J_F\)`, "the Jacobian of the main path, the derivative of z[l+2] with respect to a[l]"], [String.raw`\(I\)`, "the identity matrix, the Jacobian of the shortcut, replaced by the projection's Jacobian when there is one"], [String.raw`\(D\)`, "the diagonal ReLU mask, 1 where the sum is positive and 0 elsewhere"]],
how: ["Set a = 0.1 and L = 8 and read 1e-8 against 2.1436, HW10 D1's numbers.", "Raise L: the plain product falls like a power of 10, the residual one grows slowly.", "Set a = 0.5: the residual product explodes to 25.6 at L = 8.", "Set a = −0.5: the residual product vanishes exactly like the plain one.", "Open the Jacobian view and multiply card 2's block out."],
say: String.raw`An identity shortcut adds the identity to each block's Jacobian, so the backward signal has a path that is not a product of many small factors, but if the main paths push each factor far from 1 the gradient can still vanish or explode.`,
num: String.raw`a = 0.1: L = 8 gives <b>1e-8</b> against <b>2.1436</b>, L = 20 gives 1e-20 against 6.73, L = 50 gives 1e-50 against 117.4. a = 0.5, L = 8: 0.0039 against 25.63. a = −0.5, L = 8: both 0.0039. Card 2's block: \(J_F\) has rows (0, −1, −1), (0, 0.5, 0.5), (0, −0.5, −0.5), the mask is (0, 1, 0), so \(J_h\) has the single nonzero row (0, <b>1.5</b>, 0.5), equal to autograd's Jacobian. The plain block's mask is (0, 0, 0) and its Jacobian is all zeros.`,
note: String.raw`HW10 D1 asks whether a shortcut guarantees healthy gradients. The answer the solutions doc gives: no. The toy only shows that the identity adds 1 to each factor. It says nothing about BatchNorm, the ReLU masks or whether training improves, which is why D3 runs an experiment. The mask also explains the PyTorch convention at exactly 0, where the ReLU derivative is taken as 0.`,
r(fig, ctl) {
  let v = "chain";
  ctl.innerHTML = `<div class="row"><button data-r4="chain">toy chain</button><button data-r4="jac">Jacobian of card 2's block</button></div><div id="r4c"></div><div id="r4o"></div>`;
  const u = () => {
    pick(ctl, "r4", v);
    if (v === "chain") {
      if (!$("r4a")) { $("r4c").innerHTML = sl("r4a", "block factor a", -0.9, 1, 0.05, 0.1) + sl("r4l", "blocks L", 1, 50, 1, 8); $("r4a").oninput = $("r4l").oninput = u; }
      const a = Math.round(+$("r4a").value * 100) / 100, L = +$("r4l").value; $("r4av").textContent = fm(a, 2); $("r4lv").textContent = L;
      const lg = x => x === 0 ? -30 : Math.max(-30, Math.min(10, Math.log10(Math.abs(x))));
      const ax = ML.axes(80, 20, 540, 240, { xmin: 0, xmax: 50, ymin: -30, ymax: 10, nx: 5, ny: 8, fx: v => v, fy: v => "1e" + v, xl: "depth L", yl: "|dh/dx|, log scale" });
      let s = ax.s, pp = [], rp = [];
      for (let l = 1; l <= 50; l++) { pp.push([ax.X(l), ax.Y(lg(a ** l))]); rp.push([ax.X(l), ax.Y(lg((1 + a) ** l))]); }
      s += `<line x1="${ax.X(0)}" y1="${ax.Y(0)}" x2="${ax.X(50)}" y2="${ax.Y(0)}" stroke="var(--p)" stroke-dasharray="3 3"/>` + tx(ax.X(50) - 4, ax.Y(0) - 6, "1", "end");
      s += ML.path(pp, C.coral, 2.4) + ML.path(rp, C.teal, 2.4) + `<line x1="${ax.X(L)}" y1="20" x2="${ax.X(L)}" y2="260" stroke="var(--muted)" stroke-dasharray="2 3"/>`;
      s += legend([["plain: a to the L", C.coral], ["residual: (1 + a) to the L", C.teal]], 90, 312, 230);
      fig.innerHTML = svg(324, s);
      const P = a ** L, R = (1 + a) ** L, e = x => Math.abs(x) >= 1e-3 && Math.abs(x) < 1e4 ? f(x, 4) : x.toExponential(2);
      $("r4o").innerHTML = RO([["plain a^L", e(P)], ["residual (1 + a)^L", e(R)], ["verdict", Math.abs(R) < 1e-3 ? "residual vanishes too" : Math.abs(R) > 1e3 ? "residual explodes" : "residual route healthy"]]);
    } else {
      $("r4c").innerHTML = "";
      const JF = [[0, -1, -1], [0, 0.5, 0.5], [0, -0.5, -0.5]], IJ = [[1, -1, -1], [0, 1.5, 0.5], [0, -0.5, 0.5]], J = [[0, 0, 0], [0, 1.5, 0.5], [0, 0, 0]];
      let s = ML.grid(JF, { x: 40, y: 40, cell: 44, title: "J_F, main path", fmt: v => fm(v, Number.isInteger(v) ? 0 : 1) }).s;
      s += ML.grid(IJ, { x: 250, y: 40, cell: 44, title: "I + J_F", fmt: v => fm(v, Number.isInteger(v) ? 0 : 1), hl: new Set(["0,0", "1,1", "2,2"]) }).s;
      s += ML.grid(J, { x: 460, y: 40, cell: 44, title: "J_h = D (I + J_F)", fmt: v => fm(v, Number.isInteger(v) ? 0 : 1), hl: new Set(["1,1", "1,2"]) }).s;
      s += tx(40, 230, "sum z[l+2] + a[l] = (0, 1.5, −0.5), so the ReLU mask D = diag(0, 1, 0)", null, "t");
      s += tx(40, 254, "plain block: z[l+2] = (−1, −0.5, −0.5), mask diag(0, 0, 0), Jacobian all zeros", null, "t");
      s += tx(40, 278, "the diagonal of I + J_F gets the 1 from the shortcut", null);
      fig.innerHTML = svg(292, s);
      $("r4o").innerHTML = RO([["autograd row 2", "(0, 1.5, 0.5)"], ["plain block", "0 everywhere"]]);
    }
  };
  ctl.querySelectorAll("button[data-r4]").forEach(b => b.onclick = () => { v = b.dataset.r4; $("r4c").innerHTML = ""; u(); });
  u();
}},

{s: "5. When the shapes change", t: "Projection shortcuts: a 1 by 1 convolution with the same stride",
intu: String.raw`The addition needs two tensors of the same shape. Inside a stage that is true and the shortcut is the identity. At the start of a new stage the main path usually doubles the channels and halves the height and width with stride 2, and then \(a^{[l]}\) no longer fits. Ng writes the fix as a matrix \(W_s\) in front of \(a^{[l]}\). In a CNN, HW10 D2 builds it as a 1 by 1 convolution with the same stride, followed by BatchNorm. Pick a block and read its shapes and parameters, then remove the projection to see PyTorch's error.`,
eq: String.raw`\[ a^{[l+2]} = g\big(z^{[l+2]} + W_s\, a^{[l]}\big) \]
\[ \#\text{params} = 9\,C_{\text{in}} C_{\text{out}} + 9\,C_{\text{out}}^2 + 4\,C_{\text{out}} + \big(C_{\text{in}} C_{\text{out}} + 2\,C_{\text{out}}\big) \]`,
sym: [[String.raw`\(W_s\)`, "the projection, a 1 by 1 convolution with stride s and no bias, then BatchNorm"], [String.raw`\(C_{\text{in}}, C_{\text{out}}\)`, "input and output channels"], [String.raw`\(9\,C_{\text{in}} C_{\text{out}}\)`, "the first 3 by 3 convolution, no bias because BatchNorm follows"], [String.raw`\(4\,C_{\text{out}}\)`, "the two BatchNorms, a scale and a shift per channel each"], ["last bracket", "only when the shapes change, the projection and its BatchNorm"]],
how: ["Choose a block with matching shapes and see the identity shortcut.", "Choose 16 to 32 channels with stride 2, HW10's second check.", "Read the output shape (2, 32, 9, 9) for a 17 by 17 input.", "Count the parameters of each part.", "Remove the projection and read the error PyTorch raises."],
say: String.raw`When a block changes the number of channels or uses a stride, the shortcut must be projected with a 1 by 1 convolution of the same stride followed by BatchNorm, so that it can be added elementwise to the main path.`,
num: String.raw`HW10's checks on a 17 by 17 input: ResidualUnit(16, 16) keeps (2, 16, 17, 17) with <b>4,672</b> parameters (2,304 + 32 + 2,304 + 32). ResidualUnit(16, 32, stride 2) gives (2, 32, 9, 9) with <b>14,528</b>, of which the projection is 512 + 64 = 576. ResNet-18's first block of layer2 (64 to 128, stride 2) has 230,144, projection 8,448. Without the projection PyTorch raises "The size of tensor a (9) must match the size of tensor b (17) at non-singleton dimension 3", and for a channel change at stride 1 "(32) ... (16) at non-singleton dimension 1".`,
note: String.raw`The error compares dimensions from the right, so a stride mismatch is reported at dimension 3 (width) even when the channels differ too. HW10's troubleshooting table says it directly: for a residual addition error, compare channels, height, width and stride on both branches.`,
r(fig, ctl) {
  const P = [[16, 16, 1, "HW10 identity"], [16, 32, 2, "HW10 projection"], [64, 64, 1, "ResNet-18 layer1"], [64, 128, 2, "ResNet-18 layer2 start"], [256, 512, 2, "ResNet-18 layer4 start"]];
  let pi = 1, bad = false;
  ctl.innerHTML = `<div class="row">${P.map((p, i) => `<button data-r5="${i}">${p[0]} to ${p[1]}, stride ${p[2]}</button>`).join("")}</div><div class="row"><button data-r5b="0">with the right shortcut</button><button data-r5b="1">identity shortcut forced</button></div><div id="r5o"></div>`;
  const u = () => {
    pick(ctl, "r5", pi); pick(ctl, "r5b", bad ? 1 : 0);
    const [ci, co, st, lab] = P[pi], H = 17, Ho = Math.floor((H + 2 - 3) / st) + 1, proj = ci !== co || st !== 1;
    const c1 = 9 * ci * co, b1 = 2 * co, c2 = 9 * co * co, b2 = 2 * co, sc = proj ? ci * co + 2 * co : 0;
    const bx = (x, y, w, t1, t2, cls) => `<g class="${cls}"><rect x="${x}" y="${y}" width="${w}" height="44" rx="7" stroke-width="0.9"/></g>` + tx(x + w / 2, y + 19, t1, "middle", "th") + tx(x + w / 2, y + 36, t2, "middle");
    let s = bx(10, 120, 110, "input", `(2, ${ci}, ${H}, ${H})`, "c-gray") + arrow(122, 142, 138, 142, "var(--p)", 1.4);
    s += bx(140, 60, 120, `conv 3×3, s ${st}`, cm(c1) + " params", "c-blue") + bx(272, 60, 64, "BN", b1, "c-blue") + bx(348, 60, 120, "conv 3×3", cm(c2) + " params", "c-blue") + bx(480, 60, 64, "BN", b2, "c-blue");
    s += arrow(262, 82, 270, 82, "var(--p)", 1.2) + arrow(338, 82, 346, 82, "var(--p)", 1.2) + arrow(470, 82, 478, 82, "var(--p)", 1.2) + tx(306, 54, "ReLU after this BN", "middle");
    s += `<path d="M130 142 L130 82 L138 82" fill="none" stroke="var(--p)" stroke-width="1.4"/>` + `<path d="M130 142 L130 210 L138 210" fill="none" stroke="${bad ? C.coral : C.teal}" stroke-width="2"/>`;
    const useP = proj && !bad;
    s += bx(140, 188, 404, useP ? `1×1 conv, stride ${st}, then BN` : "identity", useP ? cm(sc) + " params" : "0 params, passes x unchanged", useP ? "c-teal" : bad && proj ? "c-coral" : "c-teal");
    s += `<circle cx="580" cy="142" r="14" fill="var(--sunk)" stroke="var(--p)"/>` + tx(580, 147, "+", "middle", "th") + `<path d="M546 82 L580 82 L580 126" fill="none" stroke="var(--p)" stroke-width="1.4" marker-end="url(#ar)"/><path d="M546 210 L580 210 L580 158" fill="none" stroke="var(--p)" stroke-width="1.4" marker-end="url(#ar)"/>`;
    s += arrow(596, 142, 612, 142, "var(--p)", 1.4) + tx(642, 138, "ReLU", "middle", "t") + tx(642, 156, `(2, ${co}, ${Ho}, ${Ho})`, "middle");
    s += tx(10, 30, `${lab}: main path gives (2, ${co}, ${Ho}, ${Ho}), shortcut gives (2, ${useP || !proj ? co : ci}, ${useP || !proj ? Ho : H}, ${useP || !proj ? Ho : H})`, null, "t");
    let err = "";
    if (bad && proj) err = st !== 1 ? `RuntimeError: The size of tensor a (${Ho}) must match the size of tensor b (${H}) at non-singleton dimension 3` : `RuntimeError: The size of tensor a (${co}) must match the size of tensor b (${ci}) at non-singleton dimension 1`;
    fig.innerHTML = svg(250, s) + (err ? ML.term(["$ python check_block.py", err]) : bad ? `<p class="note">The shapes already match, so the identity is the right shortcut here.</p>` : "");
    $("r5o").innerHTML = RO([["main path", cm(c1 + b1 + c2 + b2)], ["shortcut", cm(sc)], ["block total", cm(c1 + b1 + c2 + b2 + sc)], ["output", `(2, ${co}, ${Ho}, ${Ho})`]]);
  };
  ctl.querySelectorAll("button[data-r5]").forEach(b => b.onclick = () => { pi = +b.dataset.r5; u(); });
  ctl.querySelectorAll("button[data-r5b]").forEach(b => b.onclick = () => { bad = b.dataset.r5b === "1"; u(); });
  u();
}},

{s: "6. Global average pooling", t: "AdaptiveAvgPool2d(1) makes the head independent of the image size",
intu: String.raw`HW10 D2 ends TinyCIFARClassifier with AdaptiveAvgPool2d(1): each of the 16 final feature maps is averaged to one number, whatever its height and width, and a Linear(16, 10) reads those 16 numbers. ResNet does the same before its fully connected layer. A fixed pooling window does not have this property. AvgPool2d(4) followed by a linear layer sized for 32 by 32 images works at 32 by 32 and fails at any size that changes the feature map. Move the image size and compare the three heads.`,
eq: String.raw`\[ \bar a_c = \frac{1}{H W} \sum_{i=1}^{H} \sum_{j=1}^{W} a_{c,i,j} \]
\[ \texttt{in\_features} = C \;\text{ for any } H, W \]`,
sym: [[String.raw`\(\bar a_c\)`, "the average of channel c over all positions"], [String.raw`\(C\)`, "the number of channels, 16 in TinyCIFARClassifier and 512 in ResNet-18"], [String.raw`\(H, W\)`, "height and width of the last feature map, half the image here because the stem has stride 2"], ["AvgPool2d(4)", "a fixed 4 by 4 window, its output size still depends on H and W"]],
how: ["Start at 32 by 32 and read the three heads.", "Change the size to 28 by 28 and see AvgPool2d(4) give 144 features instead of 256.", "Try HW10's odd check size 35 by 29.", "Compare the head parameters of flatten, fixed pooling and global pooling.", "Remember that global pooling removes where a feature was, only how strongly it appeared."],
say: String.raw`Global average pooling averages each channel over all spatial positions, so the classifier sees one number per channel and works for any input size, with far fewer parameters than flattening the feature maps.`,
num: String.raw`Stem with stride 2: 32 gives 16 by 16, 28 gives 14, 35 by 29 gives 18 by 15. Global pooling always gives <b>16</b> features and a 170-parameter head. AvgPool2d(4) with Linear(256, 10): 256 features at 32 by 32, 144 at 28 by 28 with "mat1 and mat2 shapes cannot be multiplied (2x144 and 256x10)", 1,024 at 64 by 64. Flattening the 16 by 16 maps needs Linear(4,096, 10) with <b>40,970</b> parameters. HW10's own example, AvgPool2d(4) on (B, 64, 32, 32), gives 4,096 features against Linear(64, 10).`,
note: String.raw`Final practice questions ask for the in_features of the first linear layer. With global average pooling it is just the channel count of the last convolution. With flatten it is channels times height times width, computed with the output size formula of Lesson 36.`,
r(fig, ctl) {
  let hd = "gap";
  ctl.innerHTML = sl("r6h", "image height", 8, 96, 1, 32) + sl("r6w", "image width", 8, 96, 1, 32) + `<div class="row"><button data-r6="gap">AdaptiveAvgPool2d(1), Linear(16, 10)</button><button data-r6="avg">AvgPool2d(4), Linear(256, 10)</button><button data-r6="flat">flatten, Linear(4096, 10)</button></div><div id="r6o"></div>`;
  const u = () => {
    pick(ctl, "r6", hd);
    const H = +$("r6h").value, W = +$("r6w").value; $("r6hv").textContent = H; $("r6wv").textContent = W;
    const h = Math.floor((H - 1) / 2) + 1, w = Math.floor((W - 1) / 2) + 1;
    const feat = hd === "gap" ? 16 : hd === "avg" ? 16 * Math.floor(h / 4) * Math.floor(w / 4) : 16 * h * w, need = hd === "gap" ? 16 : hd === "avg" ? 256 : 4096;
    const ok = feat === need, hp = need * 10 + 10;
    const rows = [["input", `(2, 3, ${H}, ${W})`], ["stem conv 3×3, stride 2", `(2, 16, ${h}, ${w})`], ["3 residual units", `(2, 16, ${h}, ${w})`], [hd === "gap" ? "AdaptiveAvgPool2d(1)" : hd === "avg" ? "AvgPool2d(4)" : "(no pooling)", hd === "gap" ? "(2, 16, 1, 1)" : hd === "avg" ? `(2, 16, ${Math.floor(h / 4)}, ${Math.floor(w / 4)})` : `(2, 16, ${h}, ${w})`], ["flatten(1)", `(2, ${cm(feat)})`], [`Linear(${cm(need)}, 10)`, ok ? "(2, 10)" : "error"]];
    let s = "";
    rows.forEach(([a, b], i) => { const y = 16 + i * 40, bad = i === 5 && !ok; s += `<g class="${bad ? "c-coral" : i === 4 ? "c-teal" : "c-gray"}"><rect x="60" y="${y}" width="560" height="32" rx="7" stroke-width="0.8"/></g>` + tx(76, y + 21, a, null, "t") + tx(604, y + 21, b, "end", "t"); if (i < 5) s += arrow(340, y + 33, 340, y + 39, "var(--p)", 1.2); });
    // feature map picture: h by w grid of 16 stacked channels
    fig.innerHTML = svg(262, s) + (ok ? "" : ML.term(["$ python tiny_cifar.py", `RuntimeError: mat1 and mat2 shapes cannot be multiplied (2x${feat} and ${need}x10)`]));
    $("r6o").innerHTML = RO([["features", cm(feat)], ["head parameters", cm(hp)], ["works at this size", ok ? "yes" : "no"]]);
  };
  $("r6h").oninput = $("r6w").oninput = u;
  ctl.querySelectorAll("button[data-r6]").forEach(b => b.onclick = () => { hd = b.dataset.r6; u(); });
  u();
}},

{s: "7. Inside ResNet-18", t: "A stem, four stages of basic blocks, global pooling and one linear layer",
intu: String.raw`ResNet-18 from He et al. is the network Ng shows and the one torchvision gives you with resnet18(). A 7 by 7 convolution with stride 2 and a max pool shrink a 224 by 224 image to 56 by 56. Four stages of two basic blocks each follow, the first block of stages 2 to 4 halving the size and doubling the channels with a projection shortcut. Global average pooling and a Linear(512, 1000) finish it. ResNet-50 swaps the basic block for a bottleneck, Ng's 1 by 1 convolution idea: shrink the channels by 4, do the 3 by 3 work on the thin tensor, and expand back. Pick an input size and a view.`,
eq: String.raw`\[ 224 \xrightarrow{\text{conv } s=2} 112 \xrightarrow{\text{pool } s=2} 56 \to 56 \to 28 \to 14 \to 7 \]
\[ \text{bottleneck: } 1{\times}1 \;(C \to C/4),\; 3{\times}3,\; 1{\times}1 \;(C/4 \to C) \]`,
sym: [["stage", "torchvision calls them layer1 to layer4"], ["basic block", "two 3 by 3 convolutions with BatchNorm, the block of HW10 and card 5"], ["bottleneck", "1 by 1, 3 by 3, 1 by 1 convolutions, used from ResNet-50 on"], ["downsample", "torchvision's name for the projection shortcut, a 1 by 1 conv with stride 2 and BatchNorm"]],
how: ["Pick 224 by 224 and read the shape after each stage.", "Read where the parameters live: layer4 holds most of them.", "Pick 32 by 32 and see layer4 reach 1 by 1, still valid thanks to global pooling.", "Open the bottleneck view and compare a basic block and a bottleneck at 256 channels.", "Compare ResNet-18, 34 and 50."],
say: String.raw`ResNet-18 is a strided stem, four stages of two residual basic blocks whose first block in stages 2 to 4 halves the size and doubles the channels through a projection shortcut, then global average pooling and one linear layer, 11.7 million parameters in all.`,
num: String.raw`Shapes at 224: stem (64, 56, 56), layer1 (64, 56, 56), layer2 (128, 28, 28), layer3 (256, 14, 14), layer4 (512, 7, 7). At 64: 16, 16, 8, 4, 2. At 32: 8, 8, 4, 2, 1. Parameters: stem 9,536, layer1 147,968, layer2 525,568, layer3 2,099,712, layer4 <b>8,393,728</b> (71.8%), fc 513,000, total <b>11,689,512</b>. ResNet-34 21,797,672, ResNet-50 25,557,032. At 256 channels a basic block has 1,180,672 parameters and a bottleneck with 64 inner channels 70,400.`,
note: String.raw`Ng's 1 by 1 convolution video calls this a network in network: a 1 by 1 convolution is a dense layer across channels shared by every pixel, the cheapest way to change the channel count. Inception and MobileNet, also in Ng's week 2, build on the same idea and are not needed for the course's exams.`,
r(fig, ctl) {
  const ST = [["stem", 9536, 0, 64, 4], ["layer1", 147968, 2, 64, 4], ["layer2", 525568, 2, 128, 8], ["layer3", 2099712, 2, 256, 16], ["layer4", 8393728, 2, 512, 32], ["avgpool + fc", 513000, 0, 1000, 0]];
  let H = 224, v = "stages";
  ctl.innerHTML = `<div class="row"><button data-r7="224">224 × 224</button><button data-r7="64">64 × 64</button><button data-r7="32">32 × 32</button></div><div class="row"><button data-r7v="stages">stages of ResNet-18</button><button data-r7v="bott">basic block against bottleneck</button><button data-r7v="fam">ResNet-18, 34, 50</button></div><div id="r7o"></div>`;
  const u = () => {
    pick(ctl, "r7", H); pick(ctl, "r7v", v);
    let s = "";
    if (v === "stages") {
      const tot = 11689512, ax = ML.axes(150, 20, 450, 230, { xmin: 0, xmax: 9, ymin: 0, ymax: 6, nx: 9, ny: 6, fx: v => v + "M", fy: () => "", grid: false });
      s += ax.s;
      ST.forEach(([n, p, b, c, d], i) => {
        const y = ax.Y(5.5 - i) - 14, sz = d ? Math.max(1, Math.ceil(H / d)) : 1, shape = i === 5 ? "(1000)" : `(${c}, ${sz}, ${sz})`;
        s += `<rect x="${ax.X(0)}" y="${y}" width="${Math.max(2, ax.X(p / 1e6) - ax.X(0))}" height="26" rx="3" fill="${i === 4 ? C.coral : C.blue}" opacity="0.8"/>` + tx(140, y + 17, n, "end", "t") + (ax.X(p / 1e6) > 400 ? `<text class="ts" x="${ax.X(p / 1e6) - 6}" y="${y + 17}" text-anchor="end" style="fill:#fff">${cm(p)}  ${shape}</text>` : tx(ax.X(p / 1e6) + 6, y + 17, `${cm(p)}  ${shape}`));
      });
      s += tx(150, 288, `parameters per stage, total ${cm(tot)}, input ${H} × ${H}`, null);
      $("r7o").innerHTML = TB(["stage", "blocks", "output shape", "share of parameters"], ST.map(([n, p, b, c, d]) => [n, b || "", d ? `(${c}, ${Math.max(1, Math.ceil(H / d))}, ${Math.max(1, Math.ceil(H / d))})` : "(1000)", f(100 * p / tot, 1) + "%"]));
      fig.innerHTML = svg(300, s);
    } else if (v === "bott") {
      const bx = (x, y, t1, t2, cls) => `<g class="${cls}"><rect x="${x}" y="${y}" width="250" height="40" rx="7" stroke-width="0.9"/></g>` + tx(x + 125, y + 17, t1, "middle", "th") + tx(x + 125, y + 33, t2, "middle");
      s += tx(30, 24, "basic block at 256 channels", null, "th") + bx(30, 40, "conv 3×3, 256 → 256", "589,824 + BN 512", "c-blue") + bx(30, 96, "conv 3×3, 256 → 256", "589,824 + BN 512", "c-blue") + tx(30, 168, "total 1,180,672", null, "t");
      s += tx(370, 24, "bottleneck, 64 inner channels", null, "th") + bx(370, 40, "conv 1×1, 256 → 64", "16,384 + BN 128", "c-teal") + bx(370, 96, "conv 3×3, 64 → 64", "36,864 + BN 128", "c-teal") + bx(370, 152, "conv 1×1, 64 → 256", "16,384 + BN 512", "c-teal") + tx(370, 222, "total 70,400, about 17 times fewer", null, "t");
      s += tx(30, 250, "both keep 256 channels in and out, so both take an identity shortcut", null);
      fig.innerHTML = svg(262, s); $("r7o").innerHTML = RO([["basic", "1,180,672"], ["bottleneck", "70,400"], ["ratio", "16.8"]]);
    } else {
      const F = [["ResNet-18", 11689512, "basic, 2, 2, 2, 2"], ["ResNet-34", 21797672, "basic, 3, 4, 6, 3"], ["ResNet-50", 25557032, "bottleneck, 3, 4, 6, 3"]];
      F.forEach(([n, p, b], i) => { const y = 30 + i * 60; s += tx(130, y + 22, n, "end", "th") + `<rect x="140" y="${y}" width="${p / 26e6 * 400}" height="34" rx="4" fill="${C.purple}" opacity="0.8"/>` + tx(150 + p / 26e6 * 400, y + 22, cm(p)) + tx(140, y + 50, "blocks per stage: " + b); });
      fig.innerHTML = svg(220, s); $("r7o").innerHTML = RO([["fc of ResNet-50", "2,049,000"], ["fc of ResNet-18", "513,000"]]);
    }
  };
  ctl.querySelectorAll("button[data-r7]").forEach(b => b.onclick = () => { H = +b.dataset.r7; u(); });
  ctl.querySelectorAll("button[data-r7v]").forEach(b => b.onclick = () => { v = b.dataset.r7v; u(); });
  u();
}},

{s: "8. A paired comparison", t: "HW10 D3: same data, same start, same batches, then compare per seed",
intu: String.raw`HW10 D3 compares the plain and the residual TinyCIFARClassifier without letting anything else differ. Both models have exactly 14,650 parameters because the shortcuts are identities. For each seed one initial <code>state_dict</code> is created and loaded into both, BatchNorm buffers included, both get the same training and validation images, the same Adam settings, the same minibatch order from the same batch seed and the same number of epochs. Then the result is read per seed: residual accuracy minus plain accuracy, and the mean and spread of those differences. Pick a comparison and read it the way D3 asks.`,
eq: String.raw`\[ d_k = \text{acc}_k^{\text{res}} - \text{acc}_k^{\text{plain}}, \qquad \bar d = \frac{1}{K}\sum_{k=1}^{K} d_k \]
\[ s_d = \sqrt{\frac{1}{K-1}\sum_{k=1}^{K} \big(d_k - \bar d\big)^2} \]`,
sym: [[String.raw`\(d_k\)`, "the paired difference for seed k, in percentage points"], [String.raw`\(K\)`, "the number of seeds, 2 in HW10's quick mode, 3 in card 1"], [String.raw`\(s_d\)`, "the seed standard deviation, with K minus 1 as NumPy's ddof=1 gives it"], ["paired", "both models share everything except the shortcut, so each seed is its own controlled experiment"]],
how: ["Open HW10 D3's run and read the two seeds.", "Compute each difference, then the mean and the seed standard deviation.", "Read the caveat: this run used a synthetic stand-in, not CIFAR-10.", "Switch to card 1's experiments at 2, 8 and 16 blocks.", "Tick off the controls that make the comparison fair."],
say: String.raw`A fair architecture comparison pairs the two models by seed with the same data, initial weights, buffers, optimizer settings, minibatch order and budget, reports the per-seed differences with their mean and standard deviation, and selects by validation before any test score is seen.`,
num: String.raw`HW10 D3 on the labeled synthetic stand-in, validation accuracy at the selected checkpoint: plain 50.0% and 37.0%, residual 77.5% and 80.0% (validation loss 1.9143 and 1.9252 against 1.3310 and 1.4038). Differences <b>27.5</b> and <b>43.0</b> points, mean 35.25, seed SD 10.96. Card 1, training accuracy: 2 blocks 0, 0, 0 points, 8 blocks 22.7, 18.7, 29.3 (mean <b>23.6</b>, SD 5.4), 16 blocks 50, 50, 50.`,
note: String.raw`The HW10 solutions doc says it plainly: the D3 numbers show that the driver and the pairing work and that on this toy the shortcut helped within three epochs. They are not CIFAR-10 evidence. Rerun D3 on your own machine with QUICK=True to get the real CIFAR-10 numbers before you quote them in a write-up.`,
r(fig, ctl) {
  const D1 = k => ({ p: DATA.deg[k + "p"].acc.map(a => 100 * a), r: DATA.deg[k + "r"].acc.map(a => 100 * a), seeds: ["seed 0", "seed 1", "seed 2"], lab: `card 1, ${k} blocks, training accuracy` });
  const SET = { hw10: { p: [50.0, 37.0], r: [77.5, 80.0], seeds: ["seed 5970", "seed 5971"], lab: "HW10 D3, synthetic stand-in, validation accuracy" }, b2: D1(2), b8: D1(8), b16: D1(16) };
  const CTRL = ["same training and validation examples", "same initial state_dict, BatchNorm buffers included", "same optimizer and learning rate", "same minibatch order (batch_seed)", "same epoch budget and selection rule", "test only the validation-selected model, first prespecified seed"];
  let k = "hw10", done = new Set();
  ctl.innerHTML = `<div class="row"><button data-r8="hw10">HW10 D3</button><button data-r8="b2">card 1, 2 blocks</button><button data-r8="b8">card 1, 8 blocks</button><button data-r8="b16">card 1, 16 blocks</button></div><div id="r8o"></div><div class="quiz"><div class="opts" id="r8c"></div></div>`;
  const u = () => {
    pick(ctl, "r8", k);
    const S = SET[k], d = S.r.map((r, i) => r - S.p[i]), m = mean(d), s2 = sd(d);
    const ax = ML.axes(120, 20, 300, 240, { xmin: -0.5, xmax: 1.5, ymin: 0, ymax: 100, nx: 2, ny: 5, fx: v => v === 0 ? "plain" : v === 1 ? "residual" : "", fy: v => v + "%", yl: "accuracy" });
    let s = ax.s, cols = [C.blue, C.purple, C.amber];
    S.p.forEach((p, i) => { s += `<line x1="${ax.X(0)}" y1="${ax.Y(p)}" x2="${ax.X(1)}" y2="${ax.Y(S.r[i])}" stroke="${cols[i]}" stroke-width="2"/><circle cx="${ax.X(0)}" cy="${ax.Y(p)}" r="5" fill="${C.coral}"/><circle cx="${ax.X(1)}" cy="${ax.Y(S.r[i])}" r="5" fill="${C.teal}"/>`; });
    s += tx(460, 60, "paired differences", null, "th") + d.map((x, i) => `<line x1="460" y1="${80 + 20 * i}" x2="476" y2="${80 + 20 * i}" stroke="${cols[i]}" stroke-width="3"/>` + tx(482, 84 + 20 * i, `${S.seeds[i]}: ${fm(x, 1)} points`)).join("") + tx(460, 160, `mean ${f(m, 2)}`, null, "t") + tx(460, 182, `seed SD ${d.length > 1 ? f(s2, 2) : "n/a"}`, null, "t");
    s += tx(120, 300, S.lab, null);
    fig.innerHTML = svg(312, s);
    $("r8o").innerHTML = RO([["seeds", d.length], ["mean difference", f(m, 2) + " points"], ["seed SD", f(s2, 2)]]);
    $("r8c").innerHTML = CTRL.map((c, i) => `<button data-r8k="${i}" class="${done.has(i) ? "on" : ""}">${done.has(i) ? "✓ " : "☐ "}${c}</button>`).join("") + `<p class="note">${done.size} of ${CTRL.length} controls checked.</p>`;
    ctl.querySelectorAll("button[data-r8k]").forEach(b => b.onclick = () => { const i = +b.dataset.r8k; done.has(i) ? done.delete(i) : done.add(i); u(); });
  };
  ctl.querySelectorAll("button[data-r8]").forEach(b => b.onclick = () => { k = b.dataset.r8; u(); });
  u();
}},

{s: "9. Transfer learning", t: "Start from a network trained on another task, then decide how much of it to retrain",
intu: String.raw`Ng's transfer learning recipe: take a network trained on a big task A, cut off its output layer, put a new one for task B on top, and train. With little data for B, freeze everything except the new layer. With more data, unfreeze more of the later layers, and with a lot of data fine-tune the whole network starting from the pretrained weights. It pays off when A and B share the input type, A has much more data, and A's low-level features help B. Here HW10's MNISTCNN is trained on the digits 0 to 4 and transferred to telling apart 5, 6, 7, 8 and 9, with 1 to 100 labeled images per class. Pick which layers to train.`,
eq: String.raw`\[ \text{pretrained on A: } \theta_{\text{conv}},\, \theta_{\text{fc1}} \quad \text{new for B: } \theta_{\text{head}} \]
\[ \text{train } \{\theta_{\text{head}}\} \subseteq \text{trainable} \subseteq \{\theta_{\text{conv}}, \theta_{\text{fc1}}, \theta_{\text{head}}\} \]`,
sym: [["task A", "digits 0 to 4, 2,500 images, 8 epochs of Adam, 99.3% training accuracy"], ["task B", "digits 5 to 9, n labeled images per class, tested on 1,000 held-out images"], [String.raw`\(\theta_{\text{conv}}\)`, "the two convolutions, 4,800 parameters"], [String.raw`\(\theta_{\text{fc1}}\)`, "the 800 to 64 layer, 51,264 parameters"], [String.raw`\(\theta_{\text{head}}\)`, "the new 64 to 5 layer, 325 parameters"]],
how: ["Start with 10 labels per class and compare training from scratch with fine-tuning everything.", "Freeze everything except the new head and watch the accuracy drop.", "Freeze only the convolutions and train fc1 and the head.", "Compare with the control that freezes random, untrained layers.", "Move the number of labels and see where the differences shrink."],
say: String.raw`Transfer learning reuses the weights of a network trained on a related task with more data, replaces its output layer, and retrains only the new layer when target data are scarce or more of the network when there are more target data, because early layers learn general features and late layers task-specific ones.`,
num: String.raw`Mean test accuracy over 3 seeds at 1, 3, 10, 30, 100 labels per class. From scratch: 51.7, 74.5, 86.9, 90.8, 95.1%. Fine-tune all: 51.9, 76.3, <b>88.6</b>, 92.2, <b>96.3</b>%. Freeze the convolutions: 52.3, 76.4, 88.1, <b>92.6</b>, 96.1%. Freeze everything up to fc1 (325 trainable): 38.0, 59.0, 68.5, 73.4, <b>73.0</b>%. The same with random frozen layers: 42.7, 59.6, 69.2, 69.3, 69.2%.`,
note: String.raw`The result that surprises people is the frozen fc1: its 64 features were trained to separate 0 to 4, so they are too specific for 5 to 9 and only reach 73%, barely above random frozen features. Yosinski et al. (2014) measured the same pattern on ImageNet: early layers transfer, late layers are specific to their task. On easy data like MNIST the gain over training from scratch is small, 1 to 2 points here at 10 to 100 labels. Ng's rule of thumb is that transfer helps most when task A has far more data than task B and its features are hard to learn from B alone, as with photos and a network pretrained on ImageNet.`,
r(fig, ctl) {
  const N = [1, 3, 10, 30, 100], A = [["scratch", "from scratch", C.gray, 56389], ["finetune", "fine-tune all", C.teal, 56389], ["convfrozen", "freeze convs", C.blue, 51589], ["frozen", "freeze up to fc1", C.coral, 325], ["randfrozen", "random frozen", C.purple, 325]];
  let ni = 2, on = new Set(["scratch", "finetune", "convfrozen", "frozen", "randfrozen"]);
  ctl.innerHTML = sl("r9n", "labels per class", 0, 4, 1, 2) + `<div class="row">${A.map(([k, l]) => `<button data-r9="${k}">${l}</button>`).join("")}</div><div id="r9o"></div>`;
  const u = () => {
    ni = +$("r9n").value; $("r9nv").textContent = N[ni];
    ctl.querySelectorAll("button[data-r9]").forEach(b => b.classList.toggle("on", on.has(b.dataset.r9)));
    const ax = ML.axes(80, 20, 380, 250, { xmin: 0, xmax: 2, ymin: 30, ymax: 100, nx: 2, ny: 7, fx: v => cm(10 ** v), fy: v => v + "%", xl: "labeled images per class (log scale)", yl: "test accuracy on 5 to 9" });
    let s = ax.s;
    A.forEach(([k, l, col]) => { if (!on.has(k)) return; const M = N.map(n => 100 * mean(DATA.tl[n + k])); s += ML.path(N.map((n, i) => [ax.X(Math.log10(n)), ax.Y(M[i])]), col, 2.2); N.forEach((n, i) => DATA.tl[n + k].forEach(a => { s += `<circle cx="${ax.X(Math.log10(n))}" cy="${ax.Y(100 * a)}" r="2.5" fill="${col}" opacity="0.6"/>`; })); });
    s += `<line x1="${ax.X(Math.log10(N[ni]))}" y1="20" x2="${ax.X(Math.log10(N[ni]))}" y2="270" stroke="var(--muted)" stroke-dasharray="2 3"/>`;
    A.forEach(([k, l, col, p], i) => { const y = 40 + i * 44, M = 100 * mean(DATA.tl[N[ni] + k]); s += `<rect x="490" y="${y - 12}" width="14" height="14" rx="3" fill="${col}" opacity="${on.has(k) ? 1 : 0.25}"/>` + tx(512, y, l, null, "t") + tx(512, y + 17, `${f(M, 1)}%, ${cm(p)} trainable`); });
    fig.innerHTML = svg(320, s);
    $("r9o").innerHTML = TB(["strategy", "seed 0", "seed 1", "seed 2", "mean"], A.map(([k, l]) => [l, ...DATA.tl[N[ni] + k].map(a => f(100 * a, 1) + "%"), "<b>" + f(100 * mean(DATA.tl[N[ni] + k]), 1) + "%</b>"]));
  };
  $("r9n").oninput = u;
  ctl.querySelectorAll("button[data-r9]").forEach(b => b.onclick = () => { const k = b.dataset.r9; on.has(k) ? on.delete(k) : on.add(k); u(); });
  u();
}},

{s: "10. Fine-tuning in PyTorch", t: "Freeze, replace the head, choose what the optimizer sees, and mind BatchNorm",
intu: String.raw`With torchvision the recipe is a few lines: load resnet18 with pretrained weights, set <code>requires_grad</code> to False on every parameter, replace model.fc with a new Linear for your classes, and give the optimizer only the parameters that still require gradients. Three things go wrong silently. Forgetting to replace the head trains a 1,000-class output against your labels without any error. Freezing with <code>requires_grad</code> does not freeze BatchNorm: in train mode its running mean and variance keep moving. And the pretrained weights expect the input normalization they were trained with. Step through the views, every output comes from PyTorch 2.15 and torchvision 0.29.`,
eq: String.raw`\[ \text{trainable} = \sum_{p\,:\,\texttt{requires\_grad}} \texttt{p.numel()} \]
\[ 512 \cdot 5 + 5 = 2{,}565 \]`,
sym: [[String.raw`\(\texttt{requires\_grad\_(False)}\)`, "stops gradients for a parameter, the optimizer then leaves it alone"], [String.raw`\(\texttt{model.fc}\)`, "ResNet's last layer, Linear(512, 1000) for ImageNet"], [String.raw`\(\texttt{running\_mean}\)`, "a BatchNorm buffer, updated by every forward pass in train mode"], ["parameter groups", "a list of dicts given to the optimizer, each with its own learning rate"], ["ImageNet statistics", "mean (0.485, 0.456, 0.406) and std (0.229, 0.224, 0.225) for torchvision's pretrained weights"]],
how: ["Read the freeze and replace view and its parameter count.", "Unfreeze layer4 and read the new count.", "Run the BatchNorm view: the weights stay, the running mean moves.", "Run the missing head view: no error, predictions among 1,000 classes.", "Read the parameter groups view for a smaller learning rate on the backbone."],
say: String.raw`To fine-tune a pretrained network in PyTorch, freeze parameters with <code>requires_grad</code>, replace the output layer, give the optimizer only trainable parameters, keep frozen BatchNorm layers in eval mode, and normalize inputs the way the pretrained weights expect.`,
num: String.raw`ResNet-18 with every parameter frozen and fc replaced by Linear(512, 5): <b>2,565</b> trainable of 11,179,077. With layer4 unfrozen: <b>8,396,293</b>. One forward pass in train mode on a frozen model moves bn1's running mean from (0, 0, 0) to (−0.0349, −0.0172, 0.0582) while the conv1 weights stay identical. Without a new head the output is (4, 1000), cross-entropy runs without an error and gives 6.8237, and the predictions are classes 414, 415, 238, 556.`,
note: String.raw`For the project: weights=None in the code here, because this build has no internet access. On your machine use resnet18(weights=ResNet18_Weights.DEFAULT) and the matching transforms from weights.transforms(). In Lightning (Lesson 27), freeze in __init__, and set the frozen backbone to eval in on_train_epoch_start, because Lightning calls model.train() before each epoch.`,
r(fig, ctl) {
  const V = {
    head: { code: ["torch.manual_seed(0)", "from torchvision.models import resnet18", "model = resnet18(weights=None)  # weights=ResNet18_Weights.DEFAULT on your machine", "for p in model.parameters():", "    p.requires_grad_(False)", "model.fc = nn.Linear(model.fc.in_features, 5)   # new layers require grad", "trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)", "total = sum(p.numel() for p in model.parameters())", "print('trainable', trainable, 'of', total)"], out: ["trainable 2565 of 11179077"], hl: 5, tr: 2565 },
    l4: { code: ["for p in model.layer4.parameters():", "    p.requires_grad_(True)", "print('with layer4', sum(p.numel() for p in model.parameters() if p.requires_grad))", "opt = torch.optim.Adam([p for p in model.parameters() if p.requires_grad], lr=1e-3)"], out: ["with layer4 8396293"], hl: 1, tr: 8396293 },
    bn: { code: ["model.train()                       # everything frozen except fc", "print(model.bn1.running_mean[:3])", "w = model.conv1.weight.clone()", "model(torch.randn(8, 3, 64, 64) * 2 + 1)", "print(model.bn1.running_mean[:3], model.bn1.num_batches_tracked)", "print(torch.equal(w, model.conv1.weight))", "# fix: keep the frozen backbone in eval mode", "model.eval(); model.fc.train()"], out: ["tensor([0., 0., 0.])", "tensor([-0.0349, -0.0172,  0.0582]) tensor(1)", "True"], hl: 3, tr: 2565 },
    nohead: { code: ["torch.manual_seed(0)", "model = resnet18(weights=None)      # forgot to replace model.fc", "y = torch.tensor([0, 3, 4, 1])      # 5 classes", "out = model(torch.randn(4, 3, 64, 64))", "print(out.shape, round(F.cross_entropy(out, y).item(), 4))", "print(out.argmax(1).tolist())"], out: ["torch.Size([4, 1000]) 6.8237", "[414, 415, 238, 556]"], hl: 4, tr: 11689512 },
    groups: { code: ["for p in model.parameters():", "    p.requires_grad_(True)", "head = list(model.fc.parameters())", "body = [p for n, p in model.named_parameters() if not n.startswith('fc.')]", "opt = torch.optim.SGD([", "    {'params': body, 'lr': 1e-4},   # small steps keep the pretrained features", "    {'params': head, 'lr': 1e-2},   # the new layer starts from scratch", "], momentum=0.9)"], out: ["(no output, two parameter groups with their own learning rates)"], hl: 5, tr: 11179077 }
  };
  const L = [["head", "freeze and replace the head"], ["l4", "unfreeze layer4"], ["bn", "the BatchNorm trap"], ["nohead", "forgot the head"], ["groups", "parameter groups"]];
  let k = "head";
  ctl.innerHTML = `<div class="row">${L.map(([a, b]) => `<button data-r10="${a}">${b}</button>`).join("")}</div><div id="r10o"></div>`;
  const u = () => {
    pick(ctl, "r10", k); const v = V[k], tot = k === "nohead" ? 11689512 : 11179077, fr = v.tr / tot;
    const s = tx(20, 22, `trainable parameters: ${cm(v.tr)} of ${cm(tot)} (${f(100 * fr, fr < 0.01 ? 3 : 1)}%)`, null, "t") + `<rect x="20" y="34" width="640" height="16" rx="4" fill="var(--sunk)" stroke="var(--line)"/><rect x="20" y="34" width="${Math.max(2, 640 * fr)}" height="16" rx="4" fill="${k === "nohead" ? C.coral : C.teal}"/>`;
    fig.innerHTML = svg(60, s) + ML.code(v.code, v.hl) + ML.term(v.out);
    $("r10o").innerHTML = k === "nohead" ? `<p class="note">No error is raised. Targets 0 to 4 are valid indices among 1,000 classes, so the loss trains a 1,000-way classifier.</p>` : k === "bn" ? `<p class="note">requires_grad stops gradient updates, not the running statistics. In eval mode the same forward pass leaves running_mean at 0.</p>` : "";
  };
  ctl.querySelectorAll("button[data-r10]").forEach(b => b.onclick = () => { k = b.dataset.r10; u(); });
  u();
}},

{s: "11. With the agent", t: "Do it with the agent: residual blocks and a fine-tuning helper as tested code",
intu: String.raw`The lesson as code for the project: HW10's ResidualUnit and TinyCIFARClassifier, the D1 chain derivative, and a helper that turns a torchvision ResNet into a frozen feature extractor with a new head. The tests pin the numbers of cards 4, 5, 6 and 10, so a missing projection, a concatenation instead of an addition, a fixed pooling window, a head that was not replaced or a BatchNorm left in train mode each fails one test.`,
eq: String.raw`\[ \texttt{ResidualUnit} \to \texttt{TinyCIFARClassifier} \to \texttt{freeze\_backbone} \to \texttt{pytest} \]`,
sym: [[String.raw`\(\texttt{ResidualUnit(c\_in, c\_out, stride, use\_skip)}\)`, "HW10 D2's block with identity or projection shortcut"], [String.raw`\(\texttt{chain\_derivative(a, depth, residual)}\)`, "HW10 D1 with autograd"], [String.raw`\(\texttt{freeze\_backbone(model, n\_classes)}\)`, "freezes, replaces fc, returns the trainable parameters"], [String.raw`\(\texttt{count\_trainable(model)}\)`, "sums numel over parameters that require grad"]],
how: ["Paste the command.", "Read ResidualUnit and check that the shortcut is added before the final ReLU.", "Check that the projection appears only when channels or stride change.", "Run pytest and read which card each test pins.", "Commit the module with its tests."],
say: String.raw`A tested residual module reproduces HW10's block shapes, parameter counts and gradient route, and a fine-tuning helper is checked for its trainable count and for frozen BatchNorm statistics.`,
num: String.raw`Tests expect 1e-8 and 2.1436 from the chain, (2, 16, 17, 17) and (2, 32, 9, 9) with 4,672 and 14,528 parameters, ReLU(x) from a zeroed block, 14,650 parameters for both classifiers with outputs (1, 10), (2, 10), (2, 10), and 2,565 trainable parameters for a frozen ResNet-18 with 5 classes whose bn1 running mean does not move.`,
r(fig, ctl) {
  ML.agent(fig, ctl, {
    prompt: "Create src/resnet_tools.py. ResidualUnit(c_in, c_out, stride=1, use_skip=True) is HW10 D2's block: Conv2d(c_in, c_out, 3, stride, padding=1, bias=False), BatchNorm2d, ReLU, Conv2d(c_out, c_out, 3, padding=1, bias=False), BatchNorm2d, then add the shortcut before the final ReLU when use_skip is True. The shortcut is nn.Identity when shapes match, otherwise Conv2d(c_in, c_out, 1, stride, bias=False) and BatchNorm2d. TinyCIFARClassifier(use_skip) is a 3 to 16 stem with kernel 3, stride 2, padding 1, BatchNorm and ReLU, three ResidualUnit(16, 16), AdaptiveAvgPool2d(1), flatten(1) and Linear(16, 10). chain_derivative(a, depth, residual) builds h = a*h or h = h + a*h depth times from x = 1 with autograd and returns dh/dx. count_trainable(model) sums numel of parameters with requires_grad. freeze_backbone(model, n_classes) freezes every parameter of a torchvision ResNet, replaces model.fc with Linear(in_features, n_classes) and returns the list of trainable parameters. Create tests/test_resnet_tools.py with pytest: (1) chain_derivative(0.1, 8, False) is 1e-8 and (0.1, 8, True) is 1.1**8 = 2.1436 to 1e-6, (2) ResidualUnit(16, 16) maps (2, 16, 17, 17) to the same shape with 4,672 parameters and ResidualUnit(16, 32, 2) maps it to (2, 32, 9, 9) with 14,528, (3) a ResidualUnit with all parameters zeroed returns relu(x) in eval mode, (4) plain and residual TinyCIFARClassifier both have 14,650 parameters, the residual one loads the plain state_dict, and inputs (1, 3, 32, 32), (2, 3, 28, 28), (2, 3, 35, 29) give (B, 10), (5) torchvision resnet18(weights=None) after freeze_backbone(model, 5) has 2,565 trainable parameters, (6) after model.eval() and one forward pass the bn1 running_mean is unchanged. Use weights=None everywhere so the tests run offline. Run pytest and show the output.",
    actions: ["$ pytest -q", "......                                                   [100%]", "6 passed"],
    files: [["src/resnet_tools.py", "ResidualUnit, TinyCIFARClassifier, chain_derivative, count_trainable, freeze_backbone"], ["tests/test_resnet_tools.py", "six tests with the numbers of cards 4, 5, 6 and 10"]],
    checks: ["the shortcut is added with +, not torch.cat, and before the final ReLU", "the projection is created only when c_in differs from c_out or the stride is not 1", "the classifier uses AdaptiveAvgPool2d(1), and a test runs the odd size 35 by 29", "freeze_backbone replaces model.fc and the test counts 2,565, not 11,689,512", "no test downloads weights or data"]
  });
}},

{s: "12. Test", t: "Lesson 37 test: residual networks and transfer learning",
intu: String.raw`Twelve questions on the residual block, the gradient route, projection shortcuts, global pooling, parameter counts, fine-tuning and paired comparisons. All numbers are new.`,
eq: String.raw`\[ \text{12 questions} \]`,
sym: [["pass mark", "9 of 12, then redo the missed cards"]],
how: ["Write the block equation before substituting.", "Check shapes on both sides of every addition.", "Answer without running anything.", "Reopen the named card for any miss."],
say: String.raw`Twelve questions covering the whole lesson.`,
num: String.raw`Score <b>9 or more</b> to move on to the Part 6 and 7 test.`,
r(fig, ctl) {
  ML.quiz(fig, ctl, [
    { q: "A toy chain has 5 blocks, each with factor a = 0.2. What is dh/dx for the residual chain h = x + ax repeated 5 times?", o: ["0.00032", "2.488", "1.0", "6.0"], a: 1, why: "Each residual factor is 1 + a = 1.2, and 1.2 to the 5th is 2.488. The plain chain gives 0.2 to the 5th, 0.00032. Card 4." },
    { q: "A residual block has input a[l] = (2, 0, 1) and second-layer output z[l+2] = (−1, 0.5, −3). What is a[l+2]?", o: ["(1, 0.5, 0)", "(0, 0.5, 0)", "(1, 0.5, −2)", "(2, 0.5, 1)"], a: 0, why: "Add first: (1, 0.5, −2), then the ReLU gives (1, 0.5, 0). (0, 0.5, 0) is the plain block, which applies the ReLU to z alone. Card 2." },
    { q: "Weight decay has driven W[l+2] and b[l+2] of a residual block to zero. The block's input is a[l] = (3, 0, 2), the output of a ReLU. What does the block output?", o: ["(0, 0, 0)", "(1.5, 0, 1)", "(3, 0, 2)", "it depends on W[l+1]"], a: 2, why: "z[l+2] = 0, so the output is g(a[l]) = a[l] because a[l] has no negative entries. A plain block would output zeros. Card 3." },
    { q: "A projection shortcut maps 64 channels to 128 with stride 2 as a 1 × 1 convolution without bias. How many weights does that convolution have?", o: ["8,192", "73,728", "8,448", "16,384"], a: 0, why: "64 · 128 · 1 · 1 = 8,192. Its BatchNorm adds 2 · 128 = 256, giving 8,448 for the whole shortcut. Card 5." },
    { q: "How many parameters does a basic residual block with 32 channels in and out have, with bias-free convolutions and two BatchNorms?", o: ["18,432", "9,248", "18,496", "18,560"], a: 3, why: "Two 3 × 3 convolutions give 2 · 32 · 32 · 9 = 18,432, and each BatchNorm has 2 · 32 = 64, so 18,432 + 128 = 18,560. The identity shortcut adds nothing. Card 5." },
    { q: "A residual addition raises \"The size of tensor a (14) must match the size of tensor b (28) at non-singleton dimension 3\". The main path has stride 2. The fix is", o: ["add padding=1 to the second convolution", "a 1 × 1 convolution with stride 2 and BatchNorm on the shortcut", "torch.cat instead of +", "remove the final ReLU"], a: 1, why: "The main path halved the width and the identity shortcut did not. The projection uses the same stride so both sides are 14 wide. Card 5." },
    { q: "The last feature maps have shape (B, 128, 5, 7). After AdaptiveAvgPool2d(1) and flatten(1), what in_features does the linear layer need?", o: ["4,480", "35", "128", "640"], a: 2, why: "Global average pooling leaves one number per channel, so 128 whatever the height and width. Flatten without pooling would need 128 · 5 · 7 = 4,480. Card 6." },
    { q: "AvgPool2d(2) is applied to (B, 32, 8, 8) and the result is flattened from dimension 1. How many features?", o: ["512", "32", "2,048", "128"], a: 0, why: "The pool gives (B, 32, 4, 4), and 32 · 4 · 4 = 512. A fixed window still depends on the input size. Card 6." },
    { q: "Every parameter of a ResNet-18 is frozen and model.fc is replaced by nn.Linear(512, 7). How many parameters are trainable?", o: ["3,584", "513,000", "11,689,512", "3,591"], a: 3, why: "Only the new layer requires grad: 512 · 7 weights plus 7 biases is 3,591. Card 10." },
    { q: "You have 150 labeled photos in each of 4 classes of everyday objects and a ResNet-18 pretrained on ImageNet. What does Ng recommend trying first?", o: ["train ResNet-18 from random weights", "freeze the pretrained layers, replace the output with a 4-class layer and train only that layer", "fine-tune every layer with a large learning rate", "keep the 1,000-class output and map the classes afterwards"], a: 1, why: "With little target data, keep the pretrained features fixed and train the new head. Unfreeze later layers only as the labeled data grow. Card 9." },
    { q: "A backbone is frozen with requires_grad_(False) but the whole model stays in train mode during fine-tuning. What still changes in the backbone?", o: ["the convolution weights", "nothing at all", "the BatchNorm running mean and variance", "the learning rate"], a: 2, why: "Every forward pass in train mode updates the running statistics of BatchNorm, which are buffers, not parameters. Keep the frozen backbone in eval mode. Card 10." },
    { q: "Residual minus plain validation accuracy over three paired seeds is +3, −1 and +4 points. What are the mean and the seed standard deviation (ddof = 1)?", o: ["mean 2.0, SD 2.65", "mean 2.0, SD 2.16", "mean 2.67, SD 2.65", "mean 6.0, SD 2.65"], a: 0, why: "Mean (3 − 1 + 4)/3 = 2. Squared deviations 1, 9, 4 sum to 14, divided by 2 gives 7, and the square root is 2.65. Dividing by 3 would give 2.16. Card 8." }
  ], "Lesson 37 test");
}}
],
summary: String.raw`Plain networks get harder to train as they get deeper: past some depth even the training loss rises, because the gradient reaching the early layers vanishes. A residual block adds its input to the output of its two layers before the final ReLU, \(a^{[l+2]} = g(z^{[l+2]} + a^{[l]})\), with no extra parameters. If the block's weights shrink to zero it becomes the identity, so an extra block starts out harmless, and its Jacobian becomes the ReLU mask times \(I + J_F\), so the backward signal has a route around the block, which in HW10 D1 turns 1e-8 into 2.14 but does not guarantee healthy gradients. When the channels or the stride change, the shortcut needs a 1 by 1 convolution with the same stride and BatchNorm. Global average pooling makes the classifier input equal to the channel count for any image size. ResNet-18 stacks a strided stem, four stages of basic blocks and global pooling, 11.7 million parameters, and deeper ResNets use bottleneck blocks. Compare architectures in pairs: same data, initial weights, buffers, optimizer, batch order and budget, and report the per-seed differences. Transfer learning starts from a network trained on a related task, replaces the head, trains only the head when data are scarce and more layers as data grow, keeps frozen BatchNorm in eval mode, and gains most when the target task has few labels.`,
sheet: [[String.raw`\[ a^{[l+2]} = g\big(z^{[l+2]} + a^{[l]}\big) \]`, "residual block, Ng's notation"], [String.raw`\[ a^{[l+2]} = g\big(z^{[l+2]} + W_s\, a^{[l]}\big) \]`, "projection shortcut when shapes change"], [String.raw`\[ \frac{dh}{dx} = a^L \;\text{ against }\; (1 + a)^L \]`, "HW10 D1, plain against residual chain"], [String.raw`\[ J_h = D\,(I + J_F) \]`, "Jacobian of a residual block with an outer ReLU"], [String.raw`\[ 9\,C_{\text{in}} C_{\text{out}} + 9\,C_{\text{out}}^2 + 4\,C_{\text{out}} \]`, "basic block parameters, bias-free convolutions and two BatchNorms"], [String.raw`\[ C_{\text{in}} C_{\text{out}} + 2\,C_{\text{out}} \]`, "projection shortcut parameters"], [String.raw`\[ \bar a_c = \frac{1}{HW}\sum_{i,j} a_{c,i,j} \]`, "global average pooling, the linear layer gets C inputs"], [String.raw`\[ \bar d = \frac{1}{K}\sum_k d_k, \quad s_d = \sqrt{\tfrac{1}{K-1}\sum_k (d_k - \bar d)^2} \]`, "paired comparison over K seeds"], [String.raw`\[ \text{trainable} = n_{\text{in}}\, n_{\text{classes}} + n_{\text{classes}} \]`, "frozen backbone with a new linear head"]],
sources: ["AME 5970 has no lecture notes for week 11, so the topic order follows the homework below", "AME 5970 HW10 D0 and D1, questions and solutions docs: the shortcut as a reference signal, the chain derivative 1e-8 against 2.1436, J = I + J_F with the ReLU mask, and the caution that a shortcut is no guarantee", "AME 5970 HW10 D2, questions and solutions docs: ResidualUnit with identity and projection shortcuts, the shape checks (2, 16, 17, 17) and (2, 32, 9, 9), the zero-branch check, TinyCIFARClassifier with AdaptiveAvgPool2d(1) and 14,650 parameters, the fixed-pooling error", "AME 5970 HW10 D3, questions and solutions docs: the paired comparison on a labeled synthetic stand-in because CIFAR-10 was unreachable (differences 27.5 and 43.0 points), to be rerun on CIFAR-10 with QUICK=True", "Andrew Ng, Deep Learning Specialization, course 4 week 2: ResNets, Why ResNets work, Networks in networks and 1 × 1 convolutions, Transfer learning", "Andrew Ng, Machine Learning Specialization, course 2 week 3: Transfer learning, using data from a different task", "K. He, X. Zhang, S. Ren and J. Sun, Deep residual learning for image recognition, CVPR 2016", "K. He, X. Zhang, S. Ren and J. Sun, Identity mappings in deep residual networks, ECCV 2016", "J. Yosinski, J. Clune, Y. Bengio and H. Lipson, How transferable are features in deep neural networks?, NeurIPS 2014", "PyTorch 2.15 and torchvision 0.29 documentation: nn.AdaptiveAvgPool2d, torchvision.models.resnet18, BasicBlock, Bottleneck, fine-tuning", "Data: 300 fresh two-spiral points from default_rng(3737) for card 1, relu(N(0, 1)) inputs for card 3, and the real-MNIST 5,000-image subset bundled with mlxtend for card 9 (digits 0 to 4 for pretraining, digits 5 to 9 for transfer with 1,000 held-out test images), every number computed with PyTorch 2.15 on the CPU"]
});
})();

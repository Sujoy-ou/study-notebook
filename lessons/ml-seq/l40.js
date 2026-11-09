(function () {
/* ML shelf, Part 8, Lesson 40: LSTM and GRU (Core). The course export has no material on recurrent networks, but LSTM gates, vanishing gradients and choosing nn.LSTM for a task are on every practice final. So the order follows Andrew Ng's Deep Learning Specialization course 5 week 1 (Vanishing gradients with RNNs, Gated recurrent unit, Long short-term memory, Bidirectional RNN, Deep RNNs), in Ng's notation (c, Γu, Γr, Γf, Γo), with Hochreiter and Schmidhuber (1997), Gers, Schmidhuber and Cummins (2000), Cho et al. (2014), Jozefowicz, Zaremba and Sutskever (2015), Goodfellow 10.10 and Dive into Deep Learning chapter 10.
   Data: card 7 reruns Lesson 39's keep-the-first-input task (first input plus or minus 1, then N(0, 1) distractors, 32 hidden units, Adam 3e-3, batch 64, clip 1.0, seeds 0 to 2, 2,000 test sequences) with nn.RNN, nn.GRU, nn.LSTM and nn.LSTM with the forget gate bias set to 1 and 2, PyTorch 2.15 on the CPU. Card 8 replays the trained forget-bias-2 LSTM at T = 40 on two test sequences. */
const C = ML.C;
const tx = (x, y, t, a, cls) => `<text class="${cls || "ts"}" x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""}>${t}</text>`;
const f = (v, d) => { const s = (+v).toFixed(d == null ? 4 : d); return /^-0(\.0*)?$/.test(s) ? s.slice(1) : s; };
const mn = v => String(v).replace(/-/g, "−");
const fm = (v, d) => mn(f(v, d));
const cm = v => mn(Math.round(v).toLocaleString("en-US"));
const RO = items => ML.readout(items.map(([k, v]) => [k, mn(v)]));
const TB = (head, rows) => `<table style="width:100%;border-collapse:collapse;font-size:13px;margin-top:6px"><tr>${head.map(h => `<th style="text-align:left;padding:4px 6px;border-bottom:1.5px solid var(--line);color:var(--muted);font-weight:600">${h}</th>`).join("")}</tr>${rows.map(r => `<tr>${r.map(c => `<td style="padding:4px 6px;border-bottom:1px solid var(--line);vertical-align:top">${c}</td>`).join("")}</tr>`).join("")}</table>`;
const legend = (items, x0, y, dx) => items.map(([lab, col, dash], i) => `<line x1="${x0 + i * dx}" y1="${y - 4}" x2="${x0 + i * dx + 18}" y2="${y - 4}" stroke="${col}" stroke-width="3" ${dash ? `stroke-dasharray="${dash}"` : ""}/>` + tx(x0 + i * dx + 23, y, lab)).join("");
const ex = v => { if (v === 0) return "0"; const e = Math.floor(Math.log10(Math.abs(v))); return Math.abs(e) < 4 ? f(v, Math.max(0, 3 - e)) : mn(v.toExponential(1)); };
const cell = (x, y, w, h, on, col, lines) => `<g class="${on ? (col || "c-teal") : "c-gray"}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" stroke-width="${on ? 1.6 : 0.6}"/></g>` + lines.map((t, i) => tx(x + w / 2, y + h / 2 + (i - (lines.length - 1) / 2) * 16 + 5, t, "middle", i === 0 ? "th" : "ts")).join("");
const sg = z => 1 / (1 + Math.exp(-z));
const bar = (x, y, w, h, v, col, lab) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="var(--sunk)" stroke="var(--line)"/><rect x="${x}" y="${y}" width="${Math.max(0, Math.min(1, v)) * w}" height="${h}" rx="3" fill="${col}" opacity="0.75"/>` + (lab ? tx(x - 6, y + h - 2, lab, "end") : "");
const slv = (id, v, d) => { const e = $(id + "v"); if (e) e.textContent = mn(f(v, d == null ? 2 : d)); };

/* card 2: Ng's full GRU with one unit, scalar weights */
const G2 = { wcc: 1, wcx: 2, bc: 0, wuc: 0, wux: 4, bu: -2, wrc: 1, wrx: 1, br: 0, xs: [1, 0, 0, -0.5] };
const gru2 = () => { let c = 0; const out = [{ c }]; G2.xs.forEach(x => { const r = sg(G2.wrc * c + G2.wrx * x + G2.br), u = sg(G2.wuc * c + G2.wux * x + G2.bu), z = G2.wcc * r * c + G2.wcx * x + G2.bc, ct = Math.tanh(z), cn = u * ct + (1 - u) * c; out.push({ x, r, u, z, ct, c: cn }); c = cn; }); return out; };
const plain2 = () => { let c = 0; return G2.xs.map(x => (c = Math.tanh(G2.wcc * c + G2.wcx * x))); };
/* card 3: a marker-driven update gate, candidate tanh(2 v) */
const V3 = [0.9, -2.51, -0.65, -0.12, -0.98, 1.23, 1.4, 1.22, -0.85, -0.23, 1.17, 0.34, 1.45, -0.41, 2.04, 1.15, 0.54, 0.19, 3.18, -2.22, -0.84, -1.97, 0.71, 0.29, -0.29, 1.51, 0.41, 0.1, -0.86, -0.31];
const run3 = (mode, par, mpos) => { let c = 0; const cs = [], us = []; V3.forEach((v, t) => { const m = t === mpos - 1 ? 1 : 0, u = mode === "const" ? par : sg(par * (2 * m - 1)); c = u * Math.tanh(2 * v) + (1 - u) * c; cs.push(c); us.push(u); }); return { cs, us }; };
/* card 4: Ng's LSTM with one unit */
const L4 = { wca: 0.5, wcx: 1, bc: 0, wua: 1, wux: 2, bu: -1, wfa: 0, wfx: 0, bf: 2, woa: 1, wox: 1, bo: 0, xs: [1, -1, 0, 2] };
const lstm4 = () => { let a = 0, c = 0; const out = [{ a, c }]; L4.xs.forEach(x => { const ct = Math.tanh(L4.wca * a + L4.wcx * x + L4.bc), u = sg(L4.wua * a + L4.wux * x + L4.bu), fg = sg(L4.wfa * a + L4.wfx * x + L4.bf), o = sg(L4.woa * a + L4.wox * x + L4.bo), cp = c; c = u * ct + fg * c; a = o * Math.tanh(c); out.push({ x, ct, u, f: fg, o, c, a, cp }); }); return out; };

const MEM = {"1500":{"rnn|5|0":{"acc":1.0,"ratio":0.118},"rnn|5|1":{"acc":1.0,"ratio":0.0612},"rnn|5|2":{"acc":1.0,"ratio":0.191},"rnn|10|0":{"acc":1.0,"ratio":0.00158},"rnn|10|1":{"acc":1.0,"ratio":0.000193},"rnn|10|2":{"acc":0.9995,"ratio":0.0131},"rnn|20|0":{"acc":1.0,"ratio":5.03e-05},"rnn|20|1":{"acc":0.5035,"ratio":1.35e-05},"rnn|20|2":{"acc":1.0,"ratio":0.000258},"rnn|40|0":{"acc":0.495,"ratio":3.42e-09},"rnn|40|1":{"acc":0.5065,"ratio":9.64e-11},"rnn|40|2":{"acc":0.507,"ratio":4.49e-08},"rnn|80|0":{"acc":0.5035,"ratio":7.55e-18},"rnn|80|1":{"acc":0.504,"ratio":2.49e-20},"rnn|80|2":{"acc":0.497,"ratio":1.35e-15},"gru|5|0":{"acc":1.0,"ratio":0.0725},"gru|5|1":{"acc":1.0,"ratio":0.0908},"gru|5|2":{"acc":1.0,"ratio":0.0875},"gru|10|0":{"acc":1.0,"ratio":0.000818},"gru|10|1":{"acc":1.0,"ratio":0.00966},"gru|10|2":{"acc":1.0,"ratio":0.00375},"gru|20|0":{"acc":1.0,"ratio":3.3e-05},"gru|20|1":{"acc":0.488,"ratio":6.27e-05},"gru|20|2":{"acc":0.496,"ratio":0.000102},"gru|40|0":{"acc":0.486,"ratio":5.7e-09},"gru|40|1":{"acc":0.51,"ratio":1.09e-08},"gru|40|2":{"acc":0.507,"ratio":1.65e-09},"gru|80|0":{"acc":0.5025,"ratio":6.93e-16},"gru|80|1":{"acc":0.5035,"ratio":5.21e-17},"gru|80|2":{"acc":0.498,"ratio":4.78e-17},"lstm|5|0":{"acc":1.0,"ratio":0.0381},"lstm|5|1":{"acc":1.0,"ratio":0.0278},"lstm|5|2":{"acc":1.0,"ratio":0.288},"lstm|10|0":{"acc":1.0,"ratio":0.00474},"lstm|10|1":{"acc":1.0,"ratio":0.00246},"lstm|10|2":{"acc":1.0,"ratio":0.0511},"lstm|20|0":{"acc":0.5125,"ratio":8.33e-05},"lstm|20|1":{"acc":0.4925,"ratio":5.26e-05},"lstm|20|2":{"acc":0.496,"ratio":0.000362},"lstm|40|0":{"acc":0.4905,"ratio":6.58e-09},"lstm|40|1":{"acc":0.5115,"ratio":2.57e-08},"lstm|40|2":{"acc":0.5065,"ratio":1.61e-08},"lstm|80|0":{"acc":0.4985,"ratio":9.48e-17},"lstm|80|1":{"acc":0.503,"ratio":2.86e-16},"lstm|80|2":{"acc":0.497,"ratio":2.91e-16},"lstm:1|5|0":{"acc":1.0,"ratio":0.306},"lstm:1|5|1":{"acc":1.0,"ratio":0.162},"lstm:1|5|2":{"acc":1.0,"ratio":0.172},"lstm:1|10|0":{"acc":1.0,"ratio":0.0366},"lstm:1|10|1":{"acc":1.0,"ratio":0.0704},"lstm:1|10|2":{"acc":1.0,"ratio":0.31},"lstm:1|20|0":{"acc":1.0,"ratio":0.0131},"lstm:1|20|1":{"acc":1.0,"ratio":0.00733},"lstm:1|20|2":{"acc":1.0,"ratio":0.0629},"lstm:1|40|0":{"acc":0.499,"ratio":0.00124},"lstm:1|40|1":{"acc":0.503,"ratio":0.000149},"lstm:1|40|2":{"acc":0.4985,"ratio":0.000359},"lstm:1|80|0":{"acc":0.495,"ratio":6.09e-06},"lstm:1|80|1":{"acc":0.503,"ratio":7.4e-07},"lstm:1|80|2":{"acc":0.503,"ratio":9.26e-07},"lstm:2|5|0":{"acc":1.0,"ratio":0.678},"lstm:2|5|1":{"acc":1.0,"ratio":0.566},"lstm:2|5|2":{"acc":1.0,"ratio":0.146},"lstm:2|10|0":{"acc":1.0,"ratio":0.298},"lstm:2|10|1":{"acc":1.0,"ratio":0.378},"lstm:2|10|2":{"acc":1.0,"ratio":0.609},"lstm:2|20|0":{"acc":1.0,"ratio":0.13},"lstm:2|20|1":{"acc":1.0,"ratio":0.0725},"lstm:2|20|2":{"acc":1.0,"ratio":0.375},"lstm:2|40|0":{"acc":1.0,"ratio":0.305},"lstm:2|40|1":{"acc":1.0,"ratio":0.0281},"lstm:2|40|2":{"acc":1.0,"ratio":0.0175},"lstm:2|80|0":{"acc":0.519,"ratio":0.0732},"lstm:2|80|1":{"acc":0.5035,"ratio":0.00578},"lstm:2|80|2":{"acc":0.4975,"ratio":0.00879}},"5000":{"rnn|20|0":{"acc":1.0,"ratio":5.03e-05},"rnn|20|1":{"acc":0.521,"ratio":1.35e-05},"rnn|20|2":{"acc":1.0,"ratio":0.000258},"rnn|40|0":{"acc":0.5035,"ratio":3.42e-09},"rnn|40|1":{"acc":1.0,"ratio":9.64e-11},"rnn|40|2":{"acc":0.4965,"ratio":4.49e-08},"rnn|80|0":{"acc":1.0,"ratio":7.55e-18},"rnn|80|1":{"acc":0.4965,"ratio":2.49e-20},"rnn|80|2":{"acc":0.4965,"ratio":1.35e-15},"gru|20|0":{"acc":1.0,"ratio":3.3e-05},"gru|20|1":{"acc":0.5035,"ratio":6.27e-05},"gru|20|2":{"acc":0.5035,"ratio":0.000102},"gru|40|0":{"acc":0.5035,"ratio":5.7e-09},"gru|40|1":{"acc":0.503,"ratio":1.09e-08},"gru|40|2":{"acc":0.4965,"ratio":1.65e-09},"gru|80|0":{"acc":0.492,"ratio":6.93e-16},"gru|80|1":{"acc":0.492,"ratio":5.21e-17},"gru|80|2":{"acc":0.4915,"ratio":4.78e-17},"lstm|20|0":{"acc":0.508,"ratio":8.33e-05},"lstm|20|1":{"acc":0.5035,"ratio":5.26e-05},"lstm|20|2":{"acc":0.5035,"ratio":0.000362},"lstm|40|0":{"acc":0.5035,"ratio":6.58e-09},"lstm|40|1":{"acc":0.5035,"ratio":2.57e-08},"lstm|40|2":{"acc":0.4965,"ratio":1.61e-08},"lstm|80|0":{"acc":0.4965,"ratio":9.48e-17},"lstm|80|1":{"acc":0.4965,"ratio":2.86e-16},"lstm|80|2":{"acc":0.4805,"ratio":2.91e-16},"lstm:2|20|0":{"acc":1.0,"ratio":0.13},"lstm:2|20|1":{"acc":1.0,"ratio":0.0725},"lstm:2|20|2":{"acc":1.0,"ratio":0.375},"lstm:2|40|0":{"acc":1.0,"ratio":0.305},"lstm:2|40|1":{"acc":0.997,"ratio":0.0281},"lstm:2|40|2":{"acc":1.0,"ratio":0.0175},"lstm:2|80|0":{"acc":0.489,"ratio":0.0732},"lstm:2|80|1":{"acc":0.493,"ratio":0.00578},"lstm:2|80|2":{"acc":0.4965,"ratio":0.00879},"lstm:1|20|0":{"acc":1.0,"ratio":0.0131},"lstm:1|20|1":{"acc":1.0,"ratio":0.00733},"lstm:1|20|2":{"acc":1.0,"ratio":0.0629},"lstm:1|40|0":{"acc":0.5035,"ratio":0.00124},"lstm:1|40|1":{"acc":0.5035,"ratio":0.000149},"lstm:1|40|2":{"acc":0.4965,"ratio":0.000359},"lstm:1|80|0":{"acc":0.4975,"ratio":6.09e-06},"lstm:1|80|1":{"acc":0.4965,"ratio":7.4e-07},"lstm:1|80|2":{"acc":0.5,"ratio":9.26e-07}}};
const INS = {"unit":22,"d":[0.33,0.17,0.05,0.31,0.87,0.05,1.88,0.49,0.78,-1.4,0.94,0.74,-0.12,0.04,-0.88,1.6,0.93,0.56,-1.46,0.42,-0.56,0.98,1.24,0.7,0.38,-1.19,-1.87,1.02,0.22,-0.65,-1.07,0.2,-1.04,0.42,-0.25,-0.36,1.74,0.98,0.35],"p":{"c":[-0.0154,0.0191,0.0908,0.2458,0.5432,1.0464,1.7647,2.4999,3.2539,3.972,4.7076,5.3364,5.9136,6.4996,7.0506,7.6207,8.0047,8.3889,8.7896,9.3106,9.6936,10.114,10.3917,10.603,10.8561,11.1339,11.5395,11.9947,12.1642,12.3786,12.6846,13.023,13.2215,13.5239,13.6708,13.8666,14.0766,13.9972,13.9967,14.0983],"f":[0.8872,0.9132,0.9287,0.9412,0.9472,0.9474,0.9553,0.9406,0.9511,0.9479,0.962,0.9438,0.9424,0.9493,0.948,0.9549,0.9331,0.9376,0.942,0.9584,0.9449,0.9517,0.9391,0.9349,0.9402,0.9437,0.9566,0.962,0.9393,0.9447,0.9528,0.9563,0.9465,0.9556,0.9447,0.9493,0.9508,0.9309,0.9367,0.9438],"i":[0.5669,0.6952,0.7847,0.8415,0.8739,0.8932,0.9021,0.9094,0.9029,0.905,0.8955,0.9066,0.8953,0.8949,0.8986,0.8959,0.9056,0.8935,0.8971,0.8933,0.9057,0.8958,0.9045,0.8981,0.8964,0.8978,0.8954,0.9,0.9082,0.8956,0.8982,0.8999,0.9043,0.8965,0.9051,0.8973,0.9006,0.9052,0.8945,0.8971],"o":[0.6701,0.7844,0.8583,0.9039,0.9274,0.9376,0.9463,0.9457,0.9505,0.9544,0.9592,0.953,0.9461,0.9491,0.9492,0.9518,0.9445,0.9413,0.9454,0.953,0.9501,0.9497,0.9467,0.9418,0.944,0.9464,0.9526,0.9573,0.9483,0.9457,0.9514,0.9539,0.9502,0.9522,0.9496,0.9489,0.9511,0.9431,0.9412,0.9462],"fmean":[0.8899,0.9007,0.9067,0.9109,0.9115,0.9072,0.905,0.8864,0.8875,0.8817,0.877,0.8757,0.8728,0.8745,0.8741,0.8736,0.867,0.8693,0.8719,0.8717,0.8736,0.8731,0.8707,0.8678,0.8709,0.8723,0.8726,0.8712,0.8709,0.872,0.8739,0.8734,0.8736,0.8728,0.8733,0.8732,0.8741,0.8652,0.8689,0.8725],"logit":8.3489,"p":0.9998},"m":{"c":[0.0752,0.0505,-0.0258,-0.2106,-0.5992,-1.217,-1.9298,-2.617,-3.2717,-3.8582,-4.4359,-4.8817,-5.2785,-5.6661,-6.0014,-6.3514,-6.501,-6.6954,-6.8902,-7.2012,-7.3544,-7.5797,-7.6528,-7.7066,-7.8022,-7.9167,-8.1429,-8.3919,-8.3813,-8.4701,-8.6154,-8.7824,-8.8241,-8.9817,-8.982,-9.0632,-9.1378,-8.9792,-8.9419,-8.9637],"f":[0.9173,0.9009,0.9136,0.9258,0.9325,0.9344,0.9471,0.9326,0.9457,0.942,0.9571,0.9339,0.9317,0.9376,0.9337,0.9415,0.9114,0.9202,0.9236,0.9446,0.9242,0.9358,0.9169,0.9143,0.9208,0.9246,0.9413,0.947,0.9156,0.9268,0.9355,0.9396,0.9258,0.9397,0.9228,0.9315,0.932,0.9055,0.9171,0.9243],"i":[0.5541,0.5878,0.6804,0.7554,0.8086,0.8434,0.8525,0.8412,0.8133,0.7878,0.7568,0.7483,0.7384,0.7256,0.7194,0.711,0.719,0.7201,0.7139,0.7028,0.7067,0.7067,0.71,0.7166,0.7125,0.7097,0.7003,0.6916,0.7052,0.7098,0.7004,0.6968,0.7016,0.6992,0.7013,0.7042,0.6991,0.7111,0.7139,0.7063],"o":[0.7023,0.6932,0.7612,0.8206,0.8623,0.8899,0.9156,0.916,0.9251,0.9229,0.9312,0.9139,0.9141,0.9164,0.9123,0.9165,0.8979,0.9071,0.9072,0.9188,0.9023,0.9128,0.8998,0.9025,0.9058,0.9069,0.9156,0.9156,0.895,0.9081,0.9109,0.9119,0.9022,0.9134,0.9001,0.9091,0.9072,0.8933,0.9042,0.9059],"fmean":[0.897,0.8956,0.901,0.9064,0.91,0.9106,0.9199,0.9068,0.9215,0.9203,0.9277,0.9186,0.9201,0.9243,0.9231,0.9254,0.9113,0.918,0.9201,0.9254,0.9201,0.9246,0.9165,0.915,0.9192,0.921,0.9253,0.924,0.9156,0.9219,0.9246,0.9248,0.9212,0.9251,0.9199,0.9236,0.9236,0.9094,0.9172,0.9211],"logit":-8.3796,"p":0.0002}};

addLesson("ml", "seq", {
level: "Core", num: "Lesson 40",
id: "ml-seq-l40", title: "LSTM and GRU", short: "40. LSTM and GRU",
big: String.raw`Lesson 39 ended with a plain RNN that cannot reliably carry one bit across 40 steps, because the gradient that reaches the early input is a product of T factors smaller than 1. Gated cells fix this with one change. They keep a memory cell \(c^{\langle t \rangle}\) that is updated by addition, \(c^{\langle t \rangle} = \Gamma_f c^{\langle t-1 \rangle} + \Gamma_u \tilde c^{\langle t \rangle}\), and small sigmoid gates decide how much to keep and how much to write. When the forget gate sits near 1, memory and gradient both pass through many steps almost unchanged. This lesson builds the GRU and the LSTM by hand in Ng's notation, maps them onto nn.GRU and nn.LSTM, reruns Lesson 39's memory experiment, looks inside a trained LSTM, and ends with stacked and bidirectional layers and with batches of different lengths.`,
bridge: String.raw`The course export has no slides, notes or homework on gated recurrent networks, but LSTM gates and choosing nn.LSTM for a task are on every practice final. So the topic order follows Andrew Ng's Deep Learning Specialization course 5 week 1, with Hochreiter and Schmidhuber (1997), Cho et al. (2014), Goodfellow 10.10 and Dive into Deep Learning chapter 10. Attention, which removes the recurrence altogether, is Lesson 41.`,
labels: { note: "Exam and project note" },
cards: [

{s: "1. Why plain RNNs forget", t: "A product of factors against a gate that can stay near 1",
intu: String.raw`Ng's example is a long sentence: "The cat, which already ate a lot of food, ..., was full", against "The cats, ..., were full". The verb depends on a word many steps back. In a plain RNN the gradient from the verb back to "cat" is multiplied at every step by a factor \(w(1 - h^2)\), as Lesson 39 card 6 showed, so after T steps it is roughly that factor to the power T. A gated cell carries a separate memory \(c\) that is updated as \(c^{\langle t \rangle} = \Gamma_f c^{\langle t-1 \rangle} + \text{new content}\). Along that path the factor per step is the gate \(\Gamma_f\) itself, a number between 0 and 1 that the network can learn to hold near 1. Move the two sliders and compare the two products.`,
eq: String.raw`\[ \text{plain RNN: } \Big|\frac{\partial a^{\langle T \rangle}}{\partial a^{\langle 0 \rangle}}\Big| \approx \prod_{t=1}^{T} |w|\,(1 - a_t^2) \]
\[ \text{gated cell: } \frac{\partial c^{\langle T \rangle}}{\partial c^{\langle 0 \rangle}} \approx \prod_{t=1}^{T} \Gamma_f^{\langle t \rangle} \]`,
sym: [[String.raw`\(w(1 - a_t^2)\)`, "the backward factor of one plain RNN step, recurrent weight times the tanh slope"], [String.raw`\(\Gamma_f\)`, "the forget gate, a sigmoid output between 0 and 1"], [String.raw`\(c^{\langle t \rangle}\)`, "the memory cell, updated by addition"], ["T", "the number of steps between the cause and the output"]],
how: ["Set the plain RNN factor to 0.8 and T to 50.", "Read the plain product, about 1e−5.", "Set the forget gate to 0.95 and then to 0.99.", "See the gated product stay readable.", "Push the plain factor above 1 and watch it explode instead."],
say: String.raw`A plain RNN multiplies the gradient by the recurrent weight times a tanh slope at every step, so it vanishes or explodes over long distances, while a gated cell updates its memory by addition and passes the gradient through a learned forget gate that can stay close to 1.`,
num: String.raw`Over 50 steps: plain factor 0.8 gives \(0.8^{50} = 1.4 \times 10^{-5}\), factor 0.75 gives \(5.7 \times 10^{-7}\), factor 1.2 gives 9,100. Forget gate 0.95 gives \(0.95^{50} = 0.077\) and 0.99 gives <b>0.605</b>. The gate is not a fixed weight: it is recomputed from the input at every step, so the network can open it only when something should be remembered.`,
note: String.raw`The gated path is an approximation that follows only the direct line from \(c^{\langle t-1 \rangle}\) to \(c^{\langle t \rangle}\). The gates themselves also depend on the past, which adds other paths. The point for the exam: the LSTM replaces a repeated multiplication by \(w(1-a^2)\) with an additive update scaled by a gate, which is why it handles long-range dependencies. It helps against vanishing gradients, and gradient clipping is still the fix for exploding ones.`,
r(fig, ctl) {
  ctl.innerHTML = sl("g1r", "plain factor", 0.5, 1.3, 0.05, 0.8) + sl("g1f", "forget gate", 0.5, 1, 0.01, 0.95) + sl("g1t", "steps T", 5, 100, 1, 50) + `<div id="g1o"></div>`;
  const u = () => {
    const r = +$("g1r").value, fg = +$("g1f").value, T = +$("g1t").value;
    slv("g1r", r, 2); slv("g1f", fg, 2); $("g1tv").textContent = T;
    const ax = ML.axes(80, 20, 560, 220, { xmin: 0, xmax: T, ymin: -20, ymax: 5, nx: 5, ny: 5, fx: v => Math.round(v), fy: v => v === 0 ? "1" : "1e" + mn(v), xl: "steps back in time", yl: "gradient factor (log scale)" });
    const cl = v => Math.max(-20, Math.min(5, v));
    const P = [], Q = [];
    for (let t = 0; t <= T; t++) { P.push([ax.X(t), ax.Y(cl(t * Math.log10(r)))]); Q.push([ax.X(t), ax.Y(cl(t * Math.log10(fg)))]); }
    let s = ax.s + `<line x1="${ax.X(0)}" y1="${ax.Y(0)}" x2="${ax.X(T)}" y2="${ax.Y(0)}" stroke="var(--muted)" stroke-dasharray="3 4"/>`;
    s += ML.path(P, C.coral, 2.5) + ML.path(Q, C.teal, 2.5) + legend([["plain RNN, factor^t", C.coral], ["gated cell, forget gate^t", C.teal]], 90, 290, 260);
    fig.innerHTML = svg(300, s);
    $("g1o").innerHTML = RO([["plain after T steps", ex(r ** T)], ["gated after T steps", ex(fg ** T)], ["ratio gated over plain", ex(fg ** T / r ** T)]]);
  };
  ["g1r", "g1f", "g1t"].forEach(i => $(i).oninput = u);
  u();
}},

{s: "2. The GRU by hand", t: "Ng's gated recurrent unit: a candidate, an update gate and a relevance gate",
intu: String.raw`Ng teaches the GRU first because it is the simpler gated cell. The memory is \(c^{\langle t \rangle}\), and in the GRU the output is the memory itself, \(a^{\langle t \rangle} = c^{\langle t \rangle}\). At each step the cell proposes a candidate \(\tilde c^{\langle t \rangle}\), computed like a plain RNN step but with the old memory scaled by the relevance gate \(\Gamma_r\). The update gate \(\Gamma_u\) then mixes candidate and old memory. When \(\Gamma_u\) is near 0 the memory is copied unchanged. Here one unit reads (1, 0, 0, −0.5). Its update gate depends only on the input, \(\Gamma_u = \sigma(4x - 2)\), so it opens when x = 1 and stays almost shut otherwise. Step through and compare with a plain RNN that uses the same candidate weights.`,
eq: String.raw`\[ \tilde c^{\langle t \rangle} = \tanh\big(W_c [\Gamma_r * c^{\langle t-1 \rangle}, x^{\langle t \rangle}] + b_c\big) \]
\[ \Gamma_u = \sigma\big(W_u [c^{\langle t-1 \rangle}, x^{\langle t \rangle}] + b_u\big), \quad \Gamma_r = \sigma\big(W_r [c^{\langle t-1 \rangle}, x^{\langle t \rangle}] + b_r\big) \]
\[ c^{\langle t \rangle} = \Gamma_u * \tilde c^{\langle t \rangle} + (1 - \Gamma_u) * c^{\langle t-1 \rangle}, \quad a^{\langle t \rangle} = c^{\langle t \rangle} \]`,
sym: [[String.raw`\(\tilde c^{\langle t \rangle}\)`, "the candidate memory, a tanh between −1 and 1"], [String.raw`\(\Gamma_u\)`, "the update gate: 1 writes the candidate, 0 keeps the old memory"], [String.raw`\(\Gamma_r\)`, "the relevance gate: how much of the old memory enters the candidate"], ["*", "element by element product"], [String.raw`\(W_c, W_u, W_r\)`, "here (1, 2), (0, 4) and (1, 1), with biases 0, −2 and 0"]],
how: ["Start from c⟨0⟩ = 0.", "Compute the two gates from the old memory and the input.", "Compute the candidate with the old memory scaled by the relevance gate.", "Mix: write the fraction Γu of the candidate and keep the rest of the old memory.", "Compare the last value with the plain RNN row."],
say: String.raw`A GRU computes a candidate memory from the input and the gated old memory, then sets the new memory to the update gate times the candidate plus one minus the update gate times the old memory, so a closed update gate copies the memory forward unchanged.`,
num: String.raw`Step 1, x = 1: \(\Gamma_r = \sigma(1) = 0.7311\), \(\Gamma_u = \sigma(2) = 0.8808\), \(\tilde c = \tanh(2) = 0.9640\), c = 0.8808 · 0.9640 = 0.8491. Step 2, x = 0: \(\Gamma_u = \sigma(-2) = 0.1192\), \(\tilde c = \tanh(0.7004 \cdot 0.8491) = 0.5333\), c = 0.1192 · 0.5333 + 0.8808 · 0.8491 = 0.8115. Step 4, x = −0.5: \(\Gamma_u = 0.0180\) and c = <b>0.7524</b>. The plain RNN with the same candidate weights ends at −0.3515, the memory of the first input is gone.`,
note: String.raw`PyTorch's nn.GRU uses the same idea with two differences in bookkeeping. Its update gate is the opposite way round, \(h' = (1 - z) * n + z * h\), so z near 1 keeps the old state, and its reset gate multiplies \(W_{hn} h + b_{hn}\) after the matrix product rather than h before it. Ng's \(\Gamma_u\) is PyTorch's \(1 - z\). On a hand calculation, write which convention you use.`,
r(fig, ctl) {
  const st = gru2(), pl = plain2(), names = ["start", "step 1, x = 1", "step 2, x = 0", "step 3, x = 0", "step 4, x = −0.5"];
  ML.stepper(ctl, 5, k => {
    let s = tx(20, 22, "GRU, one unit, the same weights at every step", null, "th");
    for (let t = 0; t <= 4; t++) {
      const x = 20 + t * 130, seen = t <= k;
      s += cell(x, 44, 112, 50, t === k, "c-teal", [t ? "c⟨" + t + "⟩" : "c⟨0⟩", seen ? fm(st[t].c, 4) : "?"]);
      if (t) s += arrow(x - 16, 69, x - 2, 69, seen ? C.teal : "var(--line)", 2) + tx(x + 56, 112, "x = " + mn(G2.xs[t - 1]), "middle");
      if (t) s += cell(x, 236, 112, 40, t === k, "c-coral", ["plain", seen ? fm(pl[t - 1], 4) : "?"]);
    }
    s += tx(20, 226, "plain RNN, c = tanh(c + 2x), same candidate weights, no gates", null);
    if (k) {
      const q = st[k];
      s += bar(200, 130, 220, 14, q.r, C.purple, "relevance Γr") + bar(200, 156, 220, 14, q.u, C.blue, "update Γu") + bar(200, 182, 220, 14, (q.ct + 1) / 2, C.amber, "candidate");
      s += tx(470, 143, "Γr = " + fm(q.r, 4)) + tx(470, 169, "Γu = " + fm(q.u, 4)) + tx(470, 195, "c̃ = tanh(" + fm(q.z, 4) + ") = " + fm(q.ct, 4));
      s += tx(340, 302, `c⟨${k}⟩ = ${fm(q.u, 4)} · ${fm(q.ct, 4)} + ${fm(1 - q.u, 4)} · ${fm(st[k - 1].c, 4)} = ${fm(q.c, 4)}`, "middle", "t");
    } else s += tx(340, 170, "c⟨0⟩ = 0, nothing stored yet", "middle", "t") + tx(340, 302, "the candidate bar is drawn from −1 to 1", "middle");
    fig.innerHTML = svg(312, s);
  }, names);
  ctl.insertAdjacentHTML("beforeend", `<div class="sym" style="margin-top:8px"><b>W_c, b_c</b><span>(1, 2) on (Γr c, x), bias 0</span><b>W_u, b_u</b><span>(0, 4) on (c, x), bias −2</span><b>W_r, b_r</b><span>(1, 1) on (c, x), bias 0</span></div>`);
}},

{s: "3. Gates as soft switches", t: "Keep a value for 30 steps, or let the noise wash it out",
intu: String.raw`Strip the GRU down to its update rule, \(c^{\langle t \rangle} = \Gamma_u \tilde c^{\langle t \rangle} + (1 - \Gamma_u) c^{\langle t-1 \rangle}\), with the candidate \(\tilde c = \tanh(2 v_t)\) from a stream of 30 noisy values. The job is to hold the value written at a marked step until the end. With a constant gate the cell is an exponential moving average, the same as Lesson 35 card 1, and the marked value is soon buried. With a gate driven by a marker input, \(\Gamma_u = \sigma(k(2m_t - 1))\), the cell writes only at the marked step and copies the memory forward everywhere else. The sharpness k decides how cleanly it switches.`,
eq: String.raw`\[ c^{\langle t \rangle} = \Gamma_u^{\langle t \rangle}\, \tilde c^{\langle t \rangle} + \big(1 - \Gamma_u^{\langle t \rangle}\big)\, c^{\langle t-1 \rangle} \]
\[ \Gamma_u^{\langle t \rangle} = \sigma\big(k\,(2 m_t - 1)\big), \quad m_t \in \{0, 1\} \]`,
sym: [[String.raw`\(m_t\)`, "the marker input, 1 at the step to remember and 0 elsewhere"], ["k", "gate sharpness, the size of the learned weight on the marker"], [String.raw`\(\tilde c^{\langle t \rangle} = \tanh(2 v_t)\)`, "the candidate from the noisy stream"], ["retention", String.raw`\((1 - \Gamma_u)\) to the power of the steps after the write`]],
how: ["Start with a constant gate of 0.5 and see the curve follow the noise.", "Lower the constant gate to 0.1: smoother, but the stored value still fades.", "Switch to the marker gate and raise k from 0 to 8.", "Move the marker to another step and see the cell lock onto that value.", "Read the stored target against the value at step 30."],
say: String.raw`An update gate that depends on the input lets the cell write only at the step that matters and copy its memory through every other step, which a constant mixing weight cannot do.`,
num: String.raw`Marker at step 1, target \(\tanh(1.8) = 0.9468\). Constant gate 1: c at step 30 is −0.5511, the last input only. Constant 0.5: −0.4156. Constant 0.1: 0.0441. Marker gate with k = 3: 0.2885, k = 6: 0.8860, k = 8: <b>0.9383</b>. With k = 6 the gate is 0.9975 at the marker and 0.0025 elsewhere, so 29 later steps keep \(0.9975^{29} = 0.9307\) of the stored value.`,
note: String.raw`k = 0 makes every gate 0.5, the same as the constant 0.5 setting. A trained GRU learns the weights that play the role of k, and it learns them only if the gradient reaches the marked step, which is what card 1 is about. The marker here is given as a separate input to make the idea visible. In a real task the gate has to work out from the data which steps matter.`,
r(fig, ctl) {
  let mode = "const";
  ctl.innerHTML = `<div class="row"><button data-g3="const">constant gate</button><button data-g3="gate">marker-driven gate</button></div>` + sl("g3p", "constant Γu", 0, 1, 0.05, 0.5) + sl("g3k", "sharpness k", 0, 8, 0.5, 6) + sl("g3m", "marker at step", 1, 25, 1, 1) + `<div id="g3o"></div>`;
  const u = () => {
    pick(ctl, "g3", mode);
    const p = +$("g3p").value, k = +$("g3k").value, mp = +$("g3m").value;
    slv("g3p", p, 2); slv("g3k", k, 1); $("g3mv").textContent = mp;
    $("g3p").closest(".row").style.opacity = mode === "const" ? 1 : 0.4; $("g3k").closest(".row").style.opacity = mode === "gate" ? 1 : 0.4;
    const R = run3(mode, mode === "const" ? p : k, mp), tgt = Math.tanh(2 * V3[mp - 1]);
    const ax = ML.axes(70, 16, 580, 180, { xmin: 0, xmax: 30, ymin: -1, ymax: 1, nx: 6, ny: 4, fx: v => Math.round(v), fy: v => fm(v, 1), yl: "memory c" });
    let s = ax.s;
    s += `<line x1="${ax.X(0)}" y1="${ax.Y(tgt)}" x2="${ax.X(30)}" y2="${ax.Y(tgt)}" stroke="${C.purple}" stroke-dasharray="5 4"/>` + tx(ax.X(30) - 4, ax.Y(tgt) - 6, "value to keep", "end");
    s += V3.map((v, t) => `<circle cx="${ax.X(t + 1)}" cy="${ax.Y(Math.tanh(2 * v))}" r="3" fill="var(--muted)" opacity="0.6"/>`).join("");
    s += `<rect x="${ax.X(mp - 0.5)}" y="16" width="${ax.X(1.5) - ax.X(0.5)}" height="180" fill="${C.purple}" opacity="0.12"/>`;
    s += ML.path(R.cs.map((c, t) => [ax.X(t + 1), ax.Y(c)]), C.teal, 2.5);
    const by = 240, bh = 40;
    s += tx(62, by + bh / 2 + 4, "Γu", "end");
    R.us.forEach((g, t) => { s += `<rect x="${ax.X(t + 1) - 7}" y="${by + bh - g * bh}" width="14" height="${Math.max(0.5, g * bh)}" fill="${C.blue}" opacity="0.75"/>`; });
    s += `<line x1="70" y1="${by + bh}" x2="650" y2="${by + bh}" stroke="var(--line)"/>` + tx(360, by + bh + 18, "step t", "middle");
    s += legend([["memory c", C.teal], ["candidate tanh(2v)", "var(--muted)"]], 80, 222, 200);
    fig.innerHTML = svg(305, s);
    $("g3o").innerHTML = RO([["value to keep", f(tgt, 4)], ["c at step 30", f(R.cs[29], 4)], ["error", f(R.cs[29] - tgt, 4)]]);
  };
  ctl.querySelectorAll("button[data-g3]").forEach(b => b.onclick = () => { mode = b.dataset.g3; u(); });
  ["g3p", "g3k", "g3m"].forEach(i => $(i).oninput = u);
  u();
}},

{s: "4. The LSTM by hand", t: "Separate forget and update gates, an output gate, and a cell that can grow",
intu: String.raw`The LSTM of Hochreiter and Schmidhuber came before the GRU and is the usual default. It keeps two vectors, the cell \(c^{\langle t \rangle}\) and the hidden state \(a^{\langle t \rangle}\). Three gates read \(a^{\langle t-1 \rangle}\) and \(x^{\langle t \rangle}\): the forget gate \(\Gamma_f\) scales the old cell, the update gate \(\Gamma_u\) scales the candidate, and the output gate \(\Gamma_o\) decides how much of \(\tanh(c)\) to show as the hidden state. Unlike the GRU, keeping and writing are separate, so the cell can keep everything and add new content at the same step. One unit reads (1, −1, 0, 2) below, with a forget gate fixed at \(\sigma(2) = 0.8808\).`,
eq: String.raw`\[ \tilde c^{\langle t \rangle} = \tanh\big(W_c [a^{\langle t-1 \rangle}, x^{\langle t \rangle}] + b_c\big) \]
\[ \Gamma_u, \Gamma_f, \Gamma_o = \sigma\big(W_{u,f,o} [a^{\langle t-1 \rangle}, x^{\langle t \rangle}] + b_{u,f,o}\big) \]
\[ c^{\langle t \rangle} = \Gamma_u * \tilde c^{\langle t \rangle} + \Gamma_f * c^{\langle t-1 \rangle}, \quad a^{\langle t \rangle} = \Gamma_o * \tanh c^{\langle t \rangle} \]`,
sym: [[String.raw`\(\Gamma_f\)`, "forget gate, how much of the old cell to keep"], [String.raw`\(\Gamma_u\)`, "update gate (PyTorch's input gate i), how much candidate to add"], [String.raw`\(\Gamma_o\)`, "output gate, how much of the cell to expose"], [String.raw`\(c^{\langle t \rangle}\)`, "the cell, not squashed, it can exceed 1"], [String.raw`\(a^{\langle t \rangle}\)`, "the hidden state, passed to the gates and to the output layer"]],
how: ["Start from a⟨0⟩ = c⟨0⟩ = 0.", "Compute the candidate and the three gates from a⟨t−1⟩ and x⟨t⟩.", "New cell: forget gate times old cell plus update gate times candidate.", "New hidden state: output gate times tanh of the cell.", "Watch step 4 push the cell above 1 while a stays below 1."],
say: String.raw`An LSTM computes a candidate and three sigmoid gates from the previous hidden state and the input, sets the new cell to the forget gate times the old cell plus the update gate times the candidate, and outputs the output gate times the tanh of the cell.`,
num: String.raw`Weights: \(W_c = (0.5, 1)\), \(W_u = (1, 2)\) with \(b_u = -1\), \(W_f = (0, 0)\) with \(b_f = 2\), \(W_o = (1, 1)\), other biases 0. Step 1, x = 1: \(\tilde c = \tanh(1) = 0.7616\), \(\Gamma_u = \sigma(1) = 0.7311\), \(\Gamma_o = 0.7311\), c = 0.5568, a = 0.7311 · tanh(0.5568) = 0.3696. Step 2, x = −1: \(\Gamma_u = 0.0672\), so almost nothing is written and c = 0.8808 · 0.5568 − 0.0452 = 0.4452. Step 4, x = 2: c = <b>1.2975</b>, a = 0.7760. The same weights loaded into nn.LSTM(1, 1) give the same four outputs.`,
note: String.raw`Ng writes the update gate as \(\Gamma_u\). PyTorch and most papers call it the input gate i and write the candidate as g. Ng also mentions the peephole variant, where the gates also read \(c^{\langle t-1 \rangle}\). nn.LSTM does not use peepholes. On the exam, the three questions are: which gate keeps old memory (forget), which writes new content (update or input), which controls what the rest of the network sees (output).`,
r(fig, ctl) {
  const st = lstm4(), names = ["start", "step 1, x = 1", "step 2, x = −1", "step 3, x = 0", "step 4, x = 2"], o4 = document.createElement("div");
  ML.stepper(ctl, 5, k => {
    const q = st[k];
    let s = "";
    s += `<rect x="150" y="60" width="380" height="170" rx="14" fill="none" stroke="var(--line)" stroke-width="1.2"/>`;
    s += arrow(40, 90, 245, 90, C.teal, 3) + tx(40, 80, "c⟨t−1⟩ = " + (k ? fm(q.cp, 4) : "0"), null, "t");
    s += `<circle cx="260" cy="90" r="14" fill="var(--teal-bg)" stroke="${C.teal}"/>` + tx(260, 95, "×", "middle", "th");
    s += arrow(274, 90, 381, 90, C.teal, 3);
    s += `<circle cx="396" cy="90" r="14" fill="var(--teal-bg)" stroke="${C.teal}"/>` + tx(396, 95, "+", "middle", "th");
    s += arrow(410, 90, 636, 90, C.teal, 3) + tx(640, 80, "c⟨t⟩ = " + (k ? fm(q.c, 4) : "0"), "end", "t");
    const gate = (x, lab, v, col) => `<g class="${col}"><rect x="${x - 34}" y="170" width="68" height="40" rx="8" stroke-width="1"/></g>` + tx(x, 186, lab, "middle", "th") + tx(x, 202, k ? fm(v, 4) : "?", "middle");
    s += gate(260, "Γf", q.f, "c-blue") + arrow(260, 168, 260, 106, C.blue, 1.5);
    s += gate(350, "Γu", q.u, "c-blue") + gate(430, "c̃", q.ct, "c-coral") + `<path d="M350 168 L 350 140 L 396 140" fill="none" stroke="${C.blue}" stroke-width="1.5"/><path d="M430 168 L 430 140 L 396 140" fill="none" stroke="${C.coral}" stroke-width="1.5"/>` + arrow(396, 140, 396, 106, "var(--p)", 1.5);
    s += gate(500, "Γo", q.o, "c-blue");
    s += `<path d="M560 90 L 560 150" fill="none" stroke="${C.teal}" stroke-width="1.5"/>` + tx(566, 130, "tanh", null) + `<circle cx="560" cy="190" r="12" fill="var(--teal-bg)" stroke="${C.teal}"/>` + tx(560, 195, "×", "middle", "th") + arrow(560, 150, 560, 176, C.teal, 1.5) + arrow(534, 190, 546, 190, C.blue, 1.5);
    s += arrow(560, 204, 560, 268, C.purple, 2.5) + tx(568, 262, "a⟨t⟩ = " + (k ? fm(q.a, 4) : "0"), null, "t");
    s += arrow(40, 262, 150, 262, C.purple, 2) + tx(40, 252, "a⟨t−1⟩, x⟨t⟩" + (k ? " = " + fm(st[k - 1].a, 4) + ", " + mn(q.x) : ""), null, "t");
    s += tx(340, 250, "every gate reads a⟨t−1⟩ and x⟨t⟩", "middle");
    if (k) s += tx(340, 30, `c = ${fm(q.u, 4)} · ${fm(q.ct, 4)} + ${fm(q.f, 4)} · ${fm(q.cp, 4)} = ${fm(q.c, 4)},   a = ${fm(q.o, 4)} · tanh(${fm(q.c, 4)}) = ${fm(q.a, 4)}`, "middle", "t");
    else s += tx(340, 30, "a⟨0⟩ = c⟨0⟩ = 0", "middle", "t");
    fig.innerHTML = svg(290, s);
    o4.innerHTML = TB(["t", "x", "c̃", "Γu", "Γf", "Γo", "c", "a"], st.slice(1).map((r, i) => [i + 1 <= k ? `<b>${i + 1}</b>` : i + 1, mn(r.x), ...(i + 1 <= k ? [r.ct, r.u, r.f, r.o, r.c, r.a].map(v => fm(v, 4)) : ["", "", "", "", "", ""])]));
  }, names);
  ctl.appendChild(o4);
}},

{s: "5. The cell highway and the forget bias", t: "Start the forget gate open, or the gradient never arrives",
intu: String.raw`Along the cell, one step back multiplies the gradient by \(\Gamma_f\). At initialization the gates see small random weights, so \(\Gamma_f \approx \sigma(b_f)\), and over T steps the direct path keeps about \(\sigma(b_f)^T\). PyTorch draws both LSTM bias vectors from \(U(-1/\sqrt{H}, 1/\sqrt{H})\), so the forget bias starts near 0 and the forget gate near 0.5, which forgets half the cell at every step. Gers, Schmidhuber and Cummins (2000) and Jozefowicz, Zaremba and Sutskever (2015) recommend starting the forget bias at 1 or more. The left panel is the formula. The right panel is measured: the gradient at the first input over the gradient at the last input, at initialization, for the five models of card 7.`,
eq: String.raw`\[ \frac{\partial c^{\langle T \rangle}}{\partial c^{\langle 0 \rangle}}\Big|_{\text{direct}} = \prod_{t=1}^{T} \Gamma_f^{\langle t \rangle} \approx \sigma(b_f)^T \]
\[ \sigma(0)^{40} = 9.1 \times 10^{-13}, \quad \sigma(2)^{40} = 6.2 \times 10^{-3} \]`,
sym: [[String.raw`\(b_f\)`, "the forget gate bias, the sum of PyTorch's two bias slices for f"], [String.raw`\(\sigma(b_f)\)`, "the forget gate at initialization"], ["signal ratio", "mean |∂L/∂x⟨1⟩| over mean |∂L/∂x⟨T⟩| on 256 test sequences, before training"], ["H", "hidden size, 32 here"]],
how: ["Set the forget bias to 0, PyTorch's effective default, and read σ(0) to the power T.", "Raise it to 1 and then 2.", "Change T and watch the formula fall as a straight line on the log scale.", "On the right, compare the measured ratios of the five models.", "See the plain RNN and the default LSTM fall together, and the forget bias lift the LSTM."],
say: String.raw`Along the LSTM cell the gradient is multiplied by the forget gate at every step, so a forget bias near 0 halves it each step at initialization, and starting the forget bias at 1 or 2 keeps the early inputs reachable by the gradient.`,
num: String.raw`Formula at T = 40: \(b_f = 0\) gives \(9.1 \times 10^{-13}\), \(b_f = 1\) gives \(3.6 \times 10^{-6}\), \(b_f = 2\) gives \(6.2 \times 10^{-3}\), \(b_f = 3\) gives 0.143. Measured signal ratio at T = 40, seed 0: RNN 3.4e−9, GRU 5.7e−9, default LSTM 6.6e−9, 1.2e−3 with \(b_f = 1\) and <b>0.31</b> with \(b_f = 2\). At T = 80 the same five read 7.6e−18, 6.9e−16, 9.5e−17, 6.1e−6 and 0.073.`,
note: String.raw`Set it right after building the layer. PyTorch's gate order in <code>bias_ih_l0</code> and <code>bias_hh_l0</code> is input, forget, cell, output, so the forget slice is [H:2H]: <code>lstm.bias_ih_l0.data[H:2*H].fill_(2.0)</code> and <code>lstm.bias_hh_l0.data[H:2*H].zero_()</code>, for every layer. Keras does this by default with <code>unit_forget_bias=True</code>. The measured ratio is not the formula: it compares input gradients, which also pass through the gates, the hidden state and all 32 units, and here it comes out larger. The ordering by forget bias is what the formula predicts.`,
r(fig, ctl) {
  ctl.innerHTML = sl("g5b", "forget bias b_f", -1, 4, 0.5, 0) + sl("g5t", "steps T", 5, 80, 1, 40) + `<div id="g5o"></div>`;
  const AR = [["rnn", "nn.RNN", C.coral], ["gru", "nn.GRU", C.amber], ["lstm", "nn.LSTM default", C.gray], ["lstm:1", "LSTM, b_f = 1", C.blue], ["lstm:2", "LSTM, b_f = 2", C.teal]], TS = [5, 10, 20, 40, 80];
  const u = () => {
    const b = +$("g5b").value, T = +$("g5t").value, fg = sg(b);
    slv("g5b", b, 1); $("g5tv").textContent = T;
    const ax = ML.axes(70, 20, 230, 210, { xmin: 0, xmax: 80, ymin: -25, ymax: 0, nx: 4, ny: 5, fx: v => Math.round(v), fy: v => v === 0 ? "1" : "1e" + mn(v), xl: "steps T", yl: "direct path, σ(b_f)^T" });
    let s = ax.s;
    [0, 1, 2, 3].forEach(bb => { const P = []; for (let t = 0; t <= 80; t++) P.push([ax.X(t), ax.Y(Math.max(-25, t * Math.log10(sg(bb))))]); s += ML.path(P, "var(--line)", 1.2); s += tx(ax.X(80) + 3, ax.Y(Math.max(-25, 80 * Math.log10(sg(bb)))) + 4, "b " + bb); });
    const P = []; for (let t = 0; t <= 80; t++) P.push([ax.X(t), ax.Y(Math.max(-25, t * Math.log10(fg)))]);
    s += ML.path(P, C.teal, 2.5) + `<circle cx="${ax.X(T)}" cy="${ax.Y(Math.max(-25, T * Math.log10(fg)))}" r="5" fill="${C.teal}"/>`;
    const bx = ML.axes(410, 20, 240, 210, { xmin: 0, xmax: 5, ymin: -20, ymax: 0, nx: 5, ny: 4, fx: () => "", fy: v => v === 0 ? "1" : "1e" + mn(v), yl: "measured signal ratio" });
    s += bx.s;
    TS.forEach((t, i) => { s += tx(bx.X(i + 0.5), 246, t, "middle"); });
    AR.forEach(([k, , col], a) => { const P2 = TS.map((t, i) => [bx.X(i + 0.5), bx.Y(Math.max(-20, Math.log10(MEM["1500"][k + "|" + t + "|0"].ratio)))]); s += ML.path(P2, col, 2) + P2.map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="3.5" fill="${col}"/>`).join(""); });
    s += tx(530, 264, "sequence length T, seed 0", "middle");
    s += legend(AR.map(([, l, c]) => [l, c]), 20, 292, 132);
    fig.innerHTML = svg(300, s);
    $("g5o").innerHTML = RO([["forget gate σ(b_f)", f(fg, 4)], ["σ(b_f)^T", ex(fg ** T)], ["steps to halve", fg < 1 ? f(Math.log(0.5) / Math.log(fg), 1) : "never"]]);
  };
  ["g5b", "g5t"].forEach(i => $(i).oninput = u);
  u();
}},

{s: "6. nn.LSTM and nn.GRU in PyTorch", t: "Four gates stacked in one matrix, a tuple of states, and the bugs that come with it",
intu: String.raw`nn.LSTM runs the loop of card 4 with all four gate blocks stacked in one weight matrix: <code>weight_ih_l0</code> has shape (4H, input size) and <code>weight_hh_l0</code> has shape (4H, H), in the order input, forget, cell, output. nn.GRU stacks three blocks, reset, update, new. The call returns output for every step, like nn.RNN, but the LSTM's second return value is a tuple (<code>h_n</code>, <code>c_n</code>). That tuple is where most LSTM bugs live. Every case below was run in PyTorch 2.15.`,
eq: String.raw`\[ \texttt{nn.LSTM}: 4H(n_x + H + 2), \quad \texttt{nn.GRU}: 3H(n_x + H + 2) \]
\[ (B, T, n_x) \to \texttt{out}\,(B, T, H), \; (\texttt{h\_n}, \texttt{c\_n})\,(L, B, H) \]`,
sym: [["4H", "four gate blocks of H rows each: i, f, g, o"], ["3H", "three blocks for the GRU: r, z, n"], [String.raw`\(\texttt{h\_n}\)`, "last hidden state a of each layer, what the head reads"], [String.raw`\(\texttt{c\_n}\)`, "last cell state, only for the LSTM, rarely fed to a head"], ["+2", "two bias vectors per layer, as in nn.RNN"]],
how: ["Run the correct call and read the three shapes.", "Read the stacked weight shapes and the counts for RNN, GRU and LSTM.", "Check a manual loop over the four chunks against nn.LSTM.", "Open the tuple bug: <code>h[-1]</code> is <code>c_n</code>, not the last hidden state.", "Read the real error messages for wrong initial states."],
say: String.raw`nn.LSTM stacks the input, forget, cell and output gate weights into matrices with 4H rows, returns the output at every step and a tuple of the final hidden and cell states, and has four times the parameters of an nn.RNN of the same size.`,
num: String.raw`nn.LSTM(3, 5, <code>batch_first</code>=True) on (4, 7, 3): output (4, 7, 5), <code>h_n</code> and <code>c_n</code> (1, 4, 5). Parameters: RNN 50, GRU 150, LSTM <b>200</b> = 4 · 5 · (3 + 5 + 2). A manual loop over the four chunks matches <code>h_n</code> to 3.0e−8 and <code>c_n</code> to 1.2e−7. Loading card 4's weights into nn.LSTM(1, 1) reproduces a = (0.3696, 0.1452, 0.2100, 0.7760).`,
note: String.raw`Write <code>out, (h_n, c_n) = lstm(x)</code> with the parentheses, then feed <code>h_n[-1]</code> to the head. Swapping nn.LSTM for nn.GRU in a model means changing that line too, because the GRU returns one tensor. Changing only the class is a common source of the errors in the h0 only and pair to a GRU cases.`,
r(fig, ctl) {
  const K = {
    ok: { t: "the call", code: ["lstm = nn.LSTM(input_size=3, hidden_size=5, batch_first=True)", "x = torch.randn(4, 7, 3)", "out, (h_n, c_n) = lstm(x)", "print(out.shape, h_n.shape, c_n.shape)", "print(torch.allclose(out[:, -1], h_n[0]))"], out: ["torch.Size([4, 7, 5]) torch.Size([1, 4, 5]) torch.Size([1, 4, 5])", "True"] },
    w: { t: "stacked weights", code: ["for name, p in lstm.named_parameters():", "    print(name, tuple(p.shape))", "i, f, g, o = lstm.weight_ih_l0.chunk(4, dim=0)   # order i, f, g, o", "print([sum(p.numel() for p in m.parameters())", "       for m in (nn.RNN(3, 5), nn.GRU(3, 5), nn.LSTM(3, 5))])"], out: ["weight_ih_l0 (20, 3)", "weight_hh_l0 (20, 5)", "bias_ih_l0 (20,)", "bias_hh_l0 (20,)", "[50, 150, 200]"] },
    man: { t: "manual loop", code: ["h = torch.zeros(4, 5); c = torch.zeros(4, 5)", "for t in range(7):", "    z = x[:, t] @ W_ih.T + b_ih + h @ W_hh.T + b_hh", "    i, f, g, o = z.chunk(4, dim=1)", "    i, f, g, o = i.sigmoid(), f.sigmoid(), g.tanh(), o.sigmoid()", "    c = f * c + i * g", "    h = o * c.tanh()", "print((h - h_n[0]).abs().max(), (c - c_n[0]).abs().max())"], out: ["tensor(2.9802e-08) tensor(1.1921e-07)"] },
    tup: { t: "tuple bug", code: ["out, h = lstm(x)          # h is the tuple (h_n, c_n)", "print(type(h).__name__, len(h))", "feat = h[-1]              # meant: last layer's hidden state", "print(feat.shape, torch.allclose(feat, c_n))"], out: ["tuple 2", "torch.Size([1, 4, 5]) True"], bad: "h[-1] indexes the tuple, so it returns c_n, the cell, with the right shape and no error. The model trains on the unsquashed cell instead of a. Write out, (h_n, c_n) = lstm(x) and use h_n[-1]." },
    h0: { t: "h0 only", code: ["lstm(x, torch.zeros(1, 4, 5))"], out: ["IndexError: index 1 is out of bounds for dimension 0 with size 1"], bad: "nn.LSTM expects the pair (h0, c0). Given one tensor it tries to take its second element as c0." },
    gt: { t: "pair to a GRU", code: ["gru = nn.GRU(3, 5, batch_first=True)", "gru(x, (torch.zeros(1, 4, 5), torch.zeros(1, 4, 5)))"], out: ["AttributeError: 'tuple' object has no attribute 'dim'"], bad: "The GRU has no cell state, so its initial state is one tensor of shape (L, B, H)." },
    d2: { t: "2-D states", code: ["lstm(x, (torch.zeros(4, 5), torch.zeros(4, 5)))"], out: ["RuntimeError: For batched 3-D input, hx and cx should also be", "3-D but got (2-D, 2-D) tensors"], bad: "Initial states need the layer dimension: torch.zeros(1, 4, 5) for one layer." }
  };
  let v = "ok";
  ctl.innerHTML = `<div class="row">${Object.keys(K).map(k => `<button data-g6="${k}">${K[k].t}</button>`).join("")}</div>`;
  const u = () => {
    pick(ctl, "g6", v); const c = K[v];
    let s = tx(20, 22, "weight_ih_l0 of nn.LSTM(3, 5): 20 rows in four blocks", null, "th");
    [["i", "input (Ng's Γu)", "c-blue"], ["f", "forget", "c-teal"], ["g", "cell candidate", "c-coral"], ["o", "output", "c-purple"]].forEach(([k, l, col], j) => { s += cell(20 + j * 162, 36, 150, 46, true, col, ["rows " + 5 * j + " to " + (5 * j + 4) + ": " + k, l]); });
    fig.innerHTML = svg(96, s) + ML.code(c.code, -1) + ML.term(c.out) + (c.bad ? `<p class="note">${c.bad}</p>` : "");
  };
  ctl.querySelectorAll("button[data-g6]").forEach(b => b.onclick = () => { v = b.dataset.g6; u(); });
  u();
}},

{s: "7. The memory experiment, rerun", t: "Lesson 39's task with GRU and LSTM: the forget bias decides it",
intu: String.raw`Lesson 39 card 8 trained a plain RNN to carry the sign of the first input across T steps of N(0, 1) distractors, and found the result a lottery from T = 20 on. Here the same task runs with five models of 32 hidden units: nn.RNN, nn.GRU, nn.LSTM with PyTorch's default initialization, and nn.LSTM with the forget bias set to 1 and to 2. Everything else is fixed: Adam 3e-3, batch 64, clipping at 1.0, three seeds, 2,000 fresh test sequences. A coin flip scores 50%. Pick a budget and read which models learn the bit at which length.`,
eq: String.raw`\[ x^{\langle 1 \rangle} = \pm 1, \quad x^{\langle t \rangle} \sim \mathcal N(0, 1), \quad y = [x^{\langle 1 \rangle} \gt 0], \quad \hat y = \sigma(w^\top a^{\langle T \rangle} + b) \]`,
sym: [["T", "sequence length, the distance the bit must travel"], ["learned", "test accuracy above 90%, drawn teal"], [String.raw`\(b_f\)`, "forget gate bias at initialization, the sum of the two forget slices"], ["budget", "1,500 or 5,000 Adam steps, the longer run only for T = 20, 40 and 80"]],
how: ["Read the 1,500-step grid row by row.", "Compare the default LSTM with the plain RNN.", "Read the two forget-bias rows.", "Switch to 5,000 steps for the long sequences.", "Read the table for the exact accuracies."],
say: String.raw`With PyTorch's default initialization the gated cells did no better than a plain RNN on this task, while an LSTM whose forget bias starts at 2 carried the bit across 40 steps in every seed, so the gate helps only when it starts open.`,
num: String.raw`1,500 steps, seeds 0, 1 and 2: at T = 20 the plain RNN learns in two seeds, the GRU in one, the default LSTM in none, the LSTM with \(b_f = 1\) or \(b_f = 2\) in all three. At T = 40 only \(b_f = 2\) learns, <b>100%, 100%, 100%</b>. At T = 80 nothing learns. With 5,000 steps the plain RNN wins the lottery once at T = 40 and once at T = 80, the GRU and the default LSTM learn nothing beyond T = 20, and \(b_f = 2\) still fails at T = 80. Signal ratio at T = 40 before training (card 5): RNN 3.4e−9, default LSTM 6.6e−9, 1.2e−3 with \(b_f = 1\) and 0.31 with \(b_f = 2\).`,
note: String.raw`Lesson 39 asked whether an LSTM fixes the memory problem. The answer from these runs: the cell makes long memory possible, the initialization makes it reachable. The GRU has the same issue, because its update gate also starts near 0.5. T = 80 needs more than a forget bias of 2, and the usual next steps are a larger bias, a smaller learning rate or a curriculum that starts with short sequences. Three seeds of a toy task show the pattern, they do not rank the cells in general.`,
r(fig, ctl) {
  let bud = "1500";
  const AR = [["rnn", "nn.RNN"], ["gru", "nn.GRU"], ["lstm", "nn.LSTM default"], ["lstm:1", "LSTM, b_f = 1"], ["lstm:2", "LSTM, b_f = 2"]], TS = [5, 10, 20, 40, 80];
  ctl.innerHTML = `<div class="row"><button data-g7="1500">1,500 Adam steps</button><button data-g7="5000">5,000 Adam steps</button></div><div id="g7o"></div>`;
  const get = (a, T, k) => { const D = MEM[bud][a + "|" + T + "|" + k]; return D ? { r: D, own: true } : { r: MEM["1500"][a + "|" + T + "|" + k], own: false }; };
  const u = () => {
    pick(ctl, "g7", bud);
    let s = "";
    TS.forEach((T, j) => { s += tx(250 + j * 86, 26, "T = " + T, "middle", "th"); });
    AR.forEach(([a, lab], i) => {
      const y = 44 + i * 46;
      s += tx(190, y + 24, lab, "end", "th");
      TS.forEach((T, j) => {
        const x = 212 + j * 86;
        s += `<rect x="${x}" y="${y}" width="76" height="36" rx="7" fill="var(--sunk)" stroke="var(--line)"/>`;
        [0, 1, 2].forEach(k => { const g = get(a, T, k), ok = g.r.acc > 0.9; s += `<circle cx="${x + 18 + 20 * k}" cy="${y + 18}" r="7" fill="${ok ? C.teal : C.coral}" opacity="${g.own ? 1 : 0.3}"/>`; });
      });
    });
    s += tx(340, 292, bud === "5000" ? "faded cells were not rerun, they show the 1,500-step result" : "each dot is one seed, teal: above 90% test accuracy, coral: near 50%", "middle");
    fig.innerHTML = svg(302, s);
    $("g7o").innerHTML = TB(["model", ...TS.map(T => "T = " + T)], AR.map(([a, lab]) => [lab, ...TS.map(T => { const g = [0, 1, 2].map(k => get(a, T, k)); return (g[0].own ? "" : "<span style='opacity:0.5'>") + g.map(q => Math.round(100 * q.r.acc)).join(", ") + (g[0].own ? "" : "</span>"); })])) + `<p class="note">Test accuracy in percent for seeds 0, 1 and 2.</p>`;
  };
  ctl.querySelectorAll("button[data-g7]").forEach(b => b.onclick = () => { bud = b.dataset.g7; u(); });
  u();
}},

{s: "8. Inside a trained LSTM", t: "The cell of one unit, step by step, for a +1 and a −1 sequence",
intu: String.raw`Open the LSTM with forget bias 2 that learned T = 40 in card 7 (seed 0) and feed it two test sequences with the same 39 distractors, one starting with +1 and one with −1. Plot the cell of the unit whose final value differs most between the two runs, together with its forget gate. The textbook picture is a cell that writes the bit once and then holds it flat. This network found another solution: after the first step its hidden state feeds back into the candidate, the candidate saturates at about +1 or −1, and with the forget gate near 0.94 the cell climbs toward the level where adding and forgetting balance. It is a switch with two stable states, set by the first input.`,
eq: String.raw`\[ c^{\langle t \rangle} = \Gamma_f c^{\langle t-1 \rangle} + \Gamma_u \tilde c^{\langle t \rangle} \;\Rightarrow\; c^{*} = \frac{\Gamma_u \tilde c}{1 - \Gamma_f} \text{ when the gates settle} \]`,
sym: [["unit 22", "the unit of 32 whose final cell differs most between the two sequences"], [String.raw`\(c^{*}\)`, "the level where forgetting balances writing"], ["candidate", String.raw`\(\tilde c = (c^{\langle t \rangle} - \Gamma_f c^{\langle t-1 \rangle}) / \Gamma_u\), recovered from the recorded cell and gates`], ["prediction", "sigmoid of the head on the last hidden state, the probability that the first input was +1"]],
how: ["Read step 1: the two cells differ by less than 0.1.", "Move the step slider and watch the gap grow.", "Read the forget gate, about 0.93 to 0.95 throughout.", "At step 40 compare the cell with the balance level c*.", "Read the two predictions."],
say: String.raw`A trained LSTM can carry a bit across 40 steps by letting the first input tip a self-reinforcing cell toward one of two stable levels, held there by a forget gate close to 1 while the distractors barely move it.`,
num: String.raw`Unit 22, counting from 0. Step 1: c = −0.0154 for the +1 sequence and 0.0752 for the −1 sequence, a gap under 0.1 and even in the opposite order. Step 10: 3.97 against −3.86. Step 20: 9.31 against −7.20. Step 40: <b>14.10</b> against −8.96, close to the balance level c* = 0.8971 · 0.9901 / (1 − 0.9438) = 15.8 for the +1 run. The forget gate of this unit averages 0.945 and 0.930 over steps 2 to 40. Predictions 0.9998 and 0.0002.`,
note: String.raw`Do not expect each unit to mean one thing. Here all 32 units end more than 0.5 apart between the two runs, the bit is spread over the whole state. What the experiment shows for the exam: the gates are learned, the forget gate stays near 1 where memory is needed, and the additive cell lets a small difference at step 1 survive 39 noisy steps, which the plain RNN of Lesson 39 could not do reliably on this task.`,
r(fig, ctl) {
  ctl.innerHTML = sl("g8t", "step", 1, 40, 1, 40) + `<div id="g8o"></div>`;
  const gOf = (k, t) => (INS[k].c[t] - INS[k].f[t] * (t ? INS[k].c[t - 1] : 0)) / INS[k].i[t];
  const u = () => {
    const t = +$("g8t").value; $("g8tv").textContent = t;
    const ax = ML.axes(70, 16, 580, 150, { xmin: 0, xmax: 40, ymin: -12, ymax: 16, nx: 8, ny: 7, fx: v => Math.round(v), fy: v => mn(Math.round(v)), yl: "cell c" });
    let s = ax.s;
    s += `<line x1="${ax.X(0)}" y1="${ax.Y(0)}" x2="${ax.X(40)}" y2="${ax.Y(0)}" stroke="var(--muted)" stroke-dasharray="3 4"/>`;
    s += ML.path(INS.p.c.map((c, k) => [ax.X(k + 1), ax.Y(c)]), C.teal, 2.5) + ML.path(INS.m.c.map((c, k) => [ax.X(k + 1), ax.Y(c)]), C.coral, 2.5);
    s += `<line x1="${ax.X(t)}" y1="16" x2="${ax.X(t)}" y2="${16 + 150 + 170}" stroke="${C.purple}" stroke-width="1.2" opacity="0.7"/>`;
    s += `<circle cx="${ax.X(t)}" cy="${ax.Y(INS.p.c[t - 1])}" r="5" fill="${C.teal}"/><circle cx="${ax.X(t)}" cy="${ax.Y(INS.m.c[t - 1])}" r="5" fill="${C.coral}"/>`;
    const bx = ML.axes(70, 196, 580, 70, { xmin: 0, xmax: 40, ymin: 0.8, ymax: 1, nx: 8, ny: 2, fx: () => "", fy: v => f(v, 1), yl: "forget gate" });
    s += bx.s + ML.path(INS.p.f.map((v, k) => [bx.X(k + 1), bx.Y(Math.max(0.8, v))]), C.teal, 2) + ML.path(INS.m.f.map((v, k) => [bx.X(k + 1), bx.Y(Math.max(0.8, v))]), C.coral, 2);
    const yb = 310;
    s += tx(62, yb + 4, "input", "end");
    const xs1 = [1, ...INS.d];
    xs1.forEach((v, k) => { const hgt = Math.min(22, Math.abs(v) * 9); s += `<rect x="${bx.X(k + 1) - 5}" y="${v >= 0 ? yb - hgt : yb}" width="10" height="${Math.max(0.5, hgt)}" fill="${k ? "var(--muted)" : C.purple}" opacity="${k ? 0.6 : 0.9}"/>`; });
    s += `<line x1="70" y1="${yb}" x2="650" y2="${yb}" stroke="var(--line)"/>` + tx(bx.X(1) + 8, yb + 30, "first input ±1, then 39 shared distractors", null);
    s += legend([["first input +1", C.teal], ["first input −1", C.coral]], 400, 300 + 46, 130);
    fig.innerHTML = svg(352, s);
    const row = k => { const q = INS[k], gg = gOf(k, t - 1); return [k === "p" ? "+1" : "−1", fm(q.c[t - 1], 3), fm(q.f[t - 1], 3), fm(q.i[t - 1], 3), fm(gg, 3), fm(q.i[t - 1] * gg / (1 - q.f[t - 1]), 2)]; };
    $("g8o").innerHTML = TB(["first input", "c", "Γf", "Γu", "c̃", "c* = Γu c̃ / (1 − Γf)"], [row("p"), row("m")]) + (t === 40 ? RO([["prediction, first +1", f(INS.p.p, 4)], ["prediction, first −1", f(INS.m.p, 4)]]) : "");
  };
  $("g8t").oninput = u;
  u();
}},

{s: "9. Deep and bidirectional", t: "Stack layers in depth, read the sequence in both directions",
intu: String.raw`Ng's last two RNN videos add two ideas. A deep RNN stacks recurrent layers: layer 2 reads the hidden states of layer 1 as its input sequence. Two or three layers are already deep for an RNN, because each layer is also unrolled over time. A bidirectional RNN runs a second cell from the end of the sequence to the start and joins the two hidden states at every step, so the prediction at step t sees the whole sequence. Ng's example is "He said, Teddy bears are on sale" against "He said, Teddy Roosevelt was a great president": whether Teddy is a name depends on the words after it. The price is that the whole sequence must be available before any output.`,
eq: String.raw`\[ \hat y^{\langle t \rangle} = g\big(W_y [a_{\text{fw}}^{\langle t \rangle}, a_{\text{bw}}^{\langle t \rangle}] + b_y\big) \]
\[ \text{layer } l: \; d\,G H\,(n_{\text{in}} + H + 2), \; n_{\text{in}} = n_x \text{ for } l = 1, \; dH \text{ above} \]`,
sym: [[String.raw`\(a_{\text{fw}}, a_{\text{bw}}\)`, "hidden states of the forward and the backward cell"], ["d", "number of directions, 1 or 2"], ["G", "gate blocks: 1 for RNN, 3 for GRU, 4 for LSTM"], ["L", String.raw`<code>num_layers</code>, \(\texttt{h\_n}\) has L · d rows`], ["output", "(B, T, d · H), both directions side by side"]],
how: ["Pick LSTM or GRU and a size preset.", "Add layers and read the parameter count grow.", "Turn on bidirectional and see the output double in width.", "Read which rows of <code>h_n</code> belong to which direction.", "Read the note on which tasks forbid a bidirectional layer."],
say: String.raw`A deep RNN feeds each layer's hidden sequence to the next layer, and a bidirectional RNN adds a backward cell so every step sees past and future, which doubles the output width and needs the whole sequence before predicting.`,
num: String.raw`Checked with PyTorch: nn.LSTM(1, 32) has 4,480 parameters, two layers 12,928, bidirectional 8,960, two layers and bidirectional 34,048 with output (B, T, 64) and <code>h_n</code> (4, B, 32). nn.LSTM(300, 128, <code>num_layers</code>=2, <code>bidirectional</code>=True) has <b>835,584</b>, the GRU 626,688. In a bidirectional layer <code>out[:, -1, :H]</code> equals <code>h_n[-2]</code>, but the backward half of <code>out[:, -1]</code> has seen only the last step, its full summary is <code>out[:, 0, H:]</code> = <code>h_n[-1]</code>.`,
note: String.raw`Bidirectional layers fit tagging and classifying complete sequences: a whole vibration trace, a sentence. They do not fit forecasting, generating text or any real-time task, because the backward cell would read the future. For a many to one head on a bidirectional LSTM, join <code>h_n[-2]</code> and <code>h_n[-1]</code>, not <code>out[:, -1]</code>.`,
r(fig, ctl) {
  let kind = "LSTM", Lyr = 1, bi = false, pre = 0;
  const PR = [[1, 32, "a sensor, H = 32"], [8, 64, "8 features, H = 64"], [300, 128, "word vectors, H = 128"]];
  ctl.innerHTML = `<div class="row"><button data-g9k="LSTM">LSTM</button><button data-g9k="GRU">GRU</button><button data-g9k="RNN">RNN</button></div><div class="row"><button data-g9l="1">1 layer</button><button data-g9l="2">2 layers</button><button data-g9l="3">3 layers</button><button data-g9b="0">one direction</button><button data-g9b="1">bidirectional</button></div><div class="row">${PR.map((p, i) => `<button data-g9p="${i}">${p[2]}</button>`).join("")}</div><div id="g9o"></div>`;
  const u = () => {
    pick(ctl, "g9k", kind); pick(ctl, "g9l", Lyr); pick(ctl, "g9b", bi ? 1 : 0); pick(ctl, "g9p", pre);
    const [I, H] = PR[pre], d = bi ? 2 : 1, G = { LSTM: 4, GRU: 3, RNN: 1 }[kind];
    const per = []; for (let l = 0; l < Lyr; l++) per.push(d * G * H * ((l ? d * H : I) + H + 2));
    const tot = per.reduce((a, b) => a + b, 0);
    const HH = 130 + 70 * Lyr;
    let s = tx(20, 22, kind + " with " + Lyr + " layer" + (Lyr > 1 ? "s" : "") + (bi ? ", bidirectional" : ", one direction"), null, "th");
    const T = 4, x0 = 120, dx = 130;
    for (let t = 0; t < T; t++) s += tx(x0 + t * dx + 40, HH - 8, "x⟨" + (t + 1) + "⟩", "middle", "t") + arrow(x0 + t * dx + 40, HH - 22, x0 + t * dx + 40, HH - 44, "var(--p)", 1.2);
    for (let l = 0; l < Lyr; l++) {
      const y = HH - 84 - l * 70;
      s += tx(20, y + 24, "layer " + (l + 1), null, "th");
      for (let t = 0; t < T; t++) {
        const x = x0 + t * dx;
        s += cell(x, y, bi ? 38 : 80, 36, true, "c-teal", [bi ? "→" : kind]);
        if (bi) s += cell(x + 42, y, 38, 36, true, "c-purple", ["←"]);
        if (t < T - 1) s += arrow(x + (bi ? 38 : 80), y + 12, x + dx, y + 12, C.teal, 1.5);
        if (bi && t > 0) s += arrow(x + 42, y + 26, x - dx + 82, y + 26, C.purple, 1.5);
        if (l < Lyr - 1) s += arrow(x + 40, y - 2, x + 40, y - 32, "var(--p)", 1.2);
        if (l === Lyr - 1) s += arrow(x + 40, y - 2, x + 40, y - 26, C.coral, 1.5) + tx(x + 40, y - 32, "out⟨" + (t + 1) + "⟩", "middle");
      }
    }
    fig.innerHTML = svg(HH, s);
    $("g9o").innerHTML = RO([["parameters", cm(tot)], ["output", "(B, T, " + d * H + ")"], ["h_n", "(" + Lyr * d + ", B, " + H + ")"]]) +
      TB(["layer", "input per step", "parameters"], per.map((p, l) => [l + 1, l ? d * H : I, cm(p)])) +
      `<p class="note">${bi ? "h_n rows come in pairs per layer: forward then backward. The last two rows are the top layer, h_n[-2] forward and h_n[-1] backward." : "h_n[-1] is the top layer's last hidden state, the input to a many to one head."}${kind === "LSTM" ? " c_n has the same shape as h_n." : ""}</p>`;
  };
  ctl.querySelectorAll("button[data-g9k]").forEach(b => b.onclick = () => { kind = b.dataset.g9k; u(); });
  ctl.querySelectorAll("button[data-g9l]").forEach(b => b.onclick = () => { Lyr = +b.dataset.g9l; u(); });
  ctl.querySelectorAll("button[data-g9b]").forEach(b => b.onclick = () => { bi = b.dataset.g9b === "1"; u(); });
  ctl.querySelectorAll("button[data-g9p]").forEach(b => b.onclick = () => { pre = +b.dataset.g9p; u(); });
  u();
}},

{s: "10. Sequences of different lengths", t: "Padding changes the answer unless you pack or pick the right step",
intu: String.raw`A batch must be a rectangle, so shorter sequences are padded with zeros to the longest length. The LSTM does not know which steps are padding. It keeps reading the zeros, and its last hidden state for a short sequence is the state after the padding, not after the real data. There are two fixes. Pack the batch with <code>pack_padded_sequence</code> and the given lengths, so the LSTM stops each sequence at its own end, or run the padded batch and pick each sequence's output at step length − 1. Here nn.LSTM(1, 2) reads three sequences of lengths 5, 3 and 2.`,
eq: String.raw`\[ \texttt{h\_last}[b] = \texttt{out}[b,\; \texttt{len}[b] - 1] \]
\[ \texttt{pack\_padded\_sequence(x, lengths, batch\_first=True, enforce\_sorted=False)} \]`,
sym: [["padding", "zeros appended so every sequence has the longest length"], ["lengths", "the true length of each sequence, kept on the CPU as a tensor or list"], [String.raw`\(\texttt{enforce\_sorted}\)`, "True needs lengths in decreasing order, False sorts for you"], [String.raw`\(\texttt{pad\_packed\_sequence}\)`, "turns a packed output back into a padded (B, T, H) tensor with zeros after each end"]],
how: ["Read the padded batch: grey cells are padding.", "Show the padded <code>h_n</code> and see sequences 2 and 3 read the zeros.", "Show the packed <code>h_n</code>.", "Compare with each sequence run alone, the truth.", "Read the gather fix and the real error for unsorted lengths."],
say: String.raw`When sequences of different lengths are padded into one batch, the recurrent layer reads the padding too, so either pack the batch with the true lengths or take each sequence's output at its last real step.`,
num: String.raw`Padded <code>h_n</code>: (0.0650, 0.0789), (−0.0546, 0.0715), (−0.0816, 0.0668). Packed: (0.0650, 0.0789), (<b>0.0224</b>, 0.0710), (−0.0517, 0.0594), equal to running each sequence alone and to gathering the padded output at steps 4, 2 and 1. Only the full-length sequence is unaffected.`,
note: String.raw`In a project, a DataLoader with a collate function that pads and returns lengths, followed by packing in forward, is the standard pattern. For a many to many loss, also mask the padded steps, for example with <code>ignore_index</code> in CrossEntropyLoss, so padding does not count as data. The values here are small because the layer is untrained, the difference is not.`,
r(fig, ctl) {
  const S = [[0.5, -1.0, 2.0, 0.3, 1.0], [1.5, -0.5, 0.8], [-1.2, 0.6]];
  const HP = [[0.065, 0.0789], [-0.0546, 0.0715], [-0.0816, 0.0668]], HK = [[0.065, 0.0789], [0.0224, 0.071], [-0.0517, 0.0594]];
  let v = "pad";
  const K = { pad: "padded h_n", pack: "packed h_n", alone: "each alone", gat: "gather fix", err: "unsorted lengths" };
  ctl.innerHTML = `<div class="row">${Object.keys(K).map(k => `<button data-g10="${k}">${K[k]}</button>`).join("")}</div><div id="g10o"></div>`;
  const u = () => {
    pick(ctl, "g10", v);
    let s = tx(20, 20, "batch (3, 5, 1), lengths 5, 3, 2", null, "th");
    S.forEach((q, b) => {
      for (let t = 0; t < 5; t++) {
        const real = t < q.length, used = real || v === "pad";
        s += `<rect x="${110 + t * 62}" y="${36 + b * 52}" width="56" height="40" rx="6" fill="${real ? "var(--teal-bg)" : "var(--sunk)"}" stroke="${real ? C.teal : "var(--line)"}" opacity="${used ? 1 : 0.4}"/>` + tx(138 + t * 62, 61 + b * 52, real ? mn(q[t].toFixed(1)) : "0", "middle", "t");
      }
      s += tx(100, 61 + b * 52, "seq " + (b + 1), "end");
      const H = v === "pad" ? HP[b] : HK[b], ok = v !== "pad" || b === 0;
      s += cell(450, 36 + b * 52, 210, 40, true, ok ? "c-teal" : "c-coral", ["(" + H.map(z => fm(z, 4)).join(", ") + ")"]);
    });
    s += tx(555, 208, v === "pad" ? "h_n after reading the zeros" : "h_n at each true end", "middle");
    fig.innerHTML = svg(220, s);
    const code = {
      pad: [["out, (h_n, c_n) = lstm(x)            # x padded with zeros"], ["h_n[0] rows 2 and 3 are the states after the padding"]],
      pack: [["p = pack_padded_sequence(x, lengths, batch_first=True,", "                         enforce_sorted=False)", "out_p, (h_n, c_n) = lstm(p)", "out, lens = pad_packed_sequence(out_p, batch_first=True)"], ["h_n[0] is the state at each true end", "out is (3, 5, 2) with exact zeros after each end"]],
      alone: [["for s in seqs:", "    _, (h, c) = lstm(torch.tensor(s).view(1, -1, 1))"], ["(0.0650, 0.0789), (0.0224, 0.0710), (−0.0517, 0.0594)"]],
      gat: [["out, _ = lstm(x)                      # padded, no packing", "h_last = out[torch.arange(3), lengths - 1]"], ["equal to the packed h_n for all three sequences"]],
      err: [["pack_padded_sequence(x, [2, 3, 5], batch_first=True)"], ["RuntimeError: `lengths` array must be sorted in decreasing order", "when `enforce_sorted` is True. You can pass `enforce_sorted=False`", "to pack_padded_sequence and/or pack_sequence to sidestep this", "requirement if you do not need ONNX exportability."]]
    }[v];
    $("g10o").innerHTML = ML.code(code[0], -1) + ML.term(code[1].map(mn));
  };
  ctl.querySelectorAll("button[data-g10]").forEach(b => b.onclick = () => { v = b.dataset.g10; u(); });
  u();
}},

{s: "11. With the agent", t: "Do it with the agent: a gated RNN toolkit with tests that pin this lesson",
intu: String.raw`The lesson as code for the project: Ng's GRU and LSTM steps in NumPy, a check that the LSTM step matches nn.LSTM from its stacked weights, a helper that sets the forget bias in every layer, and a sequence classifier that packs padded batches. The tests pin the numbers of cards 2, 4, 6 and 10, so a swapped gate order, a forgotten forget-bias slice in layer 2, the tuple bug or reading padded steps each fails one test.`,
eq: String.raw`\[ \texttt{gru\_step} \to \texttt{lstm\_step} \to \texttt{set\_forget\_bias} \to \texttt{SeqClassifier} \to \texttt{pytest} \]`,
sym: [[String.raw`\(\texttt{gru\_step(c, x, P)}\)`, "card 2 in Ng's notation, returns c and the gates"], [String.raw`\(\texttt{lstm\_step(a, c, x, P)}\)`, "card 4, returns a, c and the gates"], [String.raw`\(\texttt{set\_forget\_bias(lstm, b)}\)`, "card 5, slice [H:2H] of both biases in every layer and direction"], [String.raw`\(\texttt{SeqClassifier}\)`, "nn.LSTM with packing and a head on <code>h_n[-1]</code>, card 10"]],
how: ["Paste the command.", "Check that <code>lstm_step</code> adds the forget-gated old cell and the update-gated candidate.", "Check that <code>set_forget_bias</code> loops over every layer and direction.", "Run pytest and read which card each test pins.", "Commit the module with its tests."],
say: String.raw`A tested gated-RNN module reproduces the hand GRU and LSTM steps, matches PyTorch's stacked gate layout, sets the forget bias correctly and handles padded batches, so each misconception of the lesson fails a specific test.`,
num: String.raw`Tests expect c = (0.8491, 0.8115, 0.7755, 0.7524) from card 2, a = (0.3696, 0.1452, 0.2100, 0.7760) and the last cell 1.2975 from card 4, the same four values from nn.LSTM(1, 1) with card 4's weights in the i, f, g, o rows, parameter counts 200 and 150 for nn.LSTM(3, 5) and nn.GRU(3, 5), and packed states equal to running each sequence alone.`,
r(fig, ctl) {
  ML.agent(fig, ctl, {
    prompt: "Create src/gated_rnn.py. gru_step(c, x, P) implements Ng's GRU: gamma_r = sigmoid(P.wrc*c + P.wrx*x + P.br), gamma_u = sigmoid(P.wuc*c + P.wux*x + P.bu), c_tilde = tanh(P.wcc*gamma_r*c + P.wcx*x + P.bc), c_new = gamma_u*c_tilde + (1 - gamma_u)*c, and returns c_new and the gates. lstm_step(a, c, x, P) implements Ng's LSTM with update, forget and output gates and returns a_new, c_new and the gates. lstm_from_ng(P) returns an nn.LSTM(1, 1, batch_first=True) whose weight rows are set in PyTorch's order i, f, g, o from P. set_forget_bias(lstm, b) sets slice [H:2H] of bias_ih to b and of bias_hh to 0 for every layer and direction. SeqClassifier(n_x, H, n_classes) runs nn.LSTM with pack_padded_sequence(enforce_sorted=False) on a padded batch with lengths and puts a Linear head on h_n[-1]. Create tests/test_gated_rnn.py with pytest: (1) gru_step from c = 0 with wcc 1, wcx 2, bc 0, wuc 0, wux 4, bu -2, wrc 1, wrx 1, br 0 on xs (1, 0, 0, -0.5) gives c (0.8491, 0.8115, 0.7755, 0.7524) to 1e-4, (2) lstm_step from a = c = 0 with Wc (0.5, 1), Wu (1, 2), bu -1, Wf (0, 0), bf 2, Wo (1, 1), other biases 0, on xs (1, -1, 0, 2) gives a (0.3696, 0.1452, 0.2100, 0.7760) and final c 1.2975, (3) lstm_from_ng with the same weights reproduces those four outputs, (4) parameter counts of nn.LSTM(3, 5) and nn.GRU(3, 5) are 200 and 150, (5) after set_forget_bias on nn.LSTM(4, 8, num_layers=2, bidirectional=True) with b = 2, every bias_ih slice [8:16] is 2 and every bias_hh slice [8:16] is 0, (6) SeqClassifier's h_n for a padded batch of lengths (5, 3, 2) equals running each sequence alone to 1e-6. Do not change the tests to make them pass.",
    actions: ["$ pytest -q", "......                                                   [100%]", "6 passed"],
    files: [["src/gated_rnn.py", "gru_step, lstm_step, lstm_from_ng, set_forget_bias, SeqClassifier"], ["tests/test_gated_rnn.py", "six tests with the numbers of cards 2, 4, 6, 5 and 10"]],
    checks: ["the LSTM cell update is f * c_old + i * g, with no tanh on the sum", "the gate rows follow PyTorch's order i, f, g, o", "set_forget_bias covers every layer and both directions, with the _reverse parameters", "forward unpacks out, (h_n, c_n) and feeds h_n[-1] to the head", "lengths are passed as a CPU tensor and enforce_sorted=False is used"]
  });
}},

{s: "12. Test", t: "Lesson 40 test: LSTM and GRU",
intu: String.raw`Twelve questions on the GRU and LSTM updates, the gates, the forget bias, PyTorch's layout and shapes, bidirectional layers and padded batches. All numbers are new.`,
eq: String.raw`\[ \text{12 questions} \]`,
sym: [["pass mark", "9 of 12, then redo the missed cards"]],
how: ["Write the update equation before substituting.", "Say which convention you use for the GRU gate.", "Write every shape as (B, T, features) or (layers times directions, B, H).", "Reopen the named card for any miss."],
say: String.raw`Twelve questions covering the whole lesson.`,
num: String.raw`Score <b>9 or more</b> to move on to attention.`,
r(fig, ctl) {
  ML.quiz(fig, ctl, [
    { q: "In Ng's GRU the update gate is 0.25, the candidate is 0.8 and the old memory is 0.4. What is the new memory?", o: ["0.8", "0.5", "0.2", "0.4"], a: 1, why: "c = 0.25 · 0.8 + 0.75 · 0.4 = 0.2 + 0.3 = 0.5. Card 2." },
    { q: "In PyTorch's nn.GRU the update gate z of one unit is 0.9. What happens to that unit's state at this step?", o: ["it is mostly overwritten by the new candidate", "it is reset to zero", "it keeps 90% of the old state and takes 10% of the new candidate", "the output gate hides it"], a: 2, why: "PyTorch writes h' = (1 − z) n + z h, so z = 0.9 keeps the old state. Ng's update gate is 1 − z = 0.1. Card 2 note." },
    { q: "An LSTM unit has old cell 2, forget gate 0.9, update gate 0.5 and candidate −0.4. What is the new cell?", o: ["1.6", "1.4", "2.0", "0.7"], a: 0, why: "c = 0.5 · (−0.4) + 0.9 · 2 = −0.2 + 1.8 = 1.6. Card 4." },
    { q: "The same unit has output gate 0.5. What is its hidden state a?", o: ["0.8", "0.9217", "1.6", "0.4608"], a: 3, why: "a = Γo · tanh(c) = 0.5 · tanh(1.6) = 0.5 · 0.9217 = 0.4608. The cell can exceed 1, the hidden state cannot. Card 4." },
    { q: "Which LSTM gate decides how much of the previous cell state is kept?", o: ["the update (input) gate", "the forget gate", "the output gate", "the relevance gate"], a: 1, why: "The forget gate multiplies c⟨t−1⟩. The update gate scales the new candidate and the output gate scales what the hidden state shows. Card 4." },
    { q: "How many parameters does nn.LSTM(input_size=10, hidden_size=20) have?", o: ["640", "1,920", "2,560", "2,400"], a: 2, why: "4 · 20 · (10 + 20 + 2) = 2,560. nn.GRU would have 1,920 and nn.RNN 640. Card 6." },
    { q: "The forget bias is set to 2, so the forget gate starts near σ(2) = 0.881. About what fraction of the gradient along the cell survives 30 steps at initialization?", o: ["0.022", "0.881", "9.3e−10", "0.5"], a: 0, why: "0.881 to the 30th is 0.022. With PyTorch's default bias near 0 the gate is 0.5 and 0.5 to the 30th is 9.3e−10. Card 5." },
    { q: "For nn.LSTM(4, 16), which slice of bias_ih_l0 holds the forget gate bias?", o: ["[0:16]", "[16:32]", "[32:48]", "[48:64]"], a: 1, why: "PyTorch stacks the gates in the order input, forget, cell, output, so the forget block is rows H to 2H, here 16 to 32. Card 5 note and card 6." },
    { q: "nn.LSTM(6, 10, num_layers=2, bidirectional=True, batch_first=True) gets an input of shape (8, 25, 6). What are the shapes of out and h_n?", o: ["(8, 25, 10) and (2, 8, 10)", "(8, 25, 20) and (4, 8, 10)", "(8, 25, 20) and (2, 8, 20)", "(25, 8, 20) and (4, 8, 10)"], a: 1, why: "out joins both directions of the top layer, so 2 · 10 = 20 features. h_n has one row per layer and direction, 2 · 2 = 4, each of size 10. Card 9." },
    { q: "A model has out, h = self.lstm(x) followed by self.head(h[-1]). What goes into the head?", o: ["the last hidden state of the top layer", "the output at every step", "c_n, the final cell state, without an error", "an error is raised"], a: 2, why: "h is the tuple (h_n, c_n), so h[-1] is c_n, with the right shape. Write out, (h_n, c_n) = self.lstm(x) and use h_n[-1]. Card 6." },
    { q: "Two sequences of lengths 7 and 4 are padded to 7 and run through an LSTM without packing. Which output holds the second sequence's last real hidden state?", o: ["out[1, 3]", "out[1, 4]", "out[1, -1]", "h_n[0, 1]"], a: 0, why: "Its last real step is index 4 − 1 = 3. out[1, −1] and h_n[0, 1] come after three padded zeros. Card 10." },
    { q: "For which task is a bidirectional LSTM the wrong choice?", o: ["tagging each word of a finished sentence", "classifying a complete vibration trace as cracked or not", "forecasting the next hour of furnace temperature as readings arrive", "labeling each frame of a recorded video"], a: 2, why: "A forecast made in real time cannot read the future, and the backward cell would need it. The other tasks have the whole sequence before predicting. Card 9." }
  ], "Lesson 40 test");
}}
],
summary: String.raw`Gated cells keep a memory \(c\) that is updated by addition, so along the cell the gradient is multiplied by a forget gate rather than by \(w(1 - a^2)\). Ng's GRU mixes a candidate and the old memory with an update gate, \(c^{\langle t \rangle} = \Gamma_u \tilde c + (1 - \Gamma_u) c^{\langle t-1 \rangle}\), with a relevance gate inside the candidate. The LSTM separates forgetting and writing, \(c^{\langle t \rangle} = \Gamma_u \tilde c + \Gamma_f c^{\langle t-1 \rangle}\), and shows \(a = \Gamma_o \tanh c\). PyTorch stacks the gates as i, f, g, o in matrices with 4H rows and returns the tuple (<code>h_n</code>, <code>c_n</code>). Start the forget bias at 1 or 2, because the default near 0 halves the cell at every step. On the memory task the LSTM with forget bias 2 carried one bit across 40 steps in every seed. Stack layers for depth, use a bidirectional layer only when the whole sequence is available, and pack padded batches.`,
sheet: [[String.raw`\[ \tilde c^{\langle t \rangle} = \tanh\big(W_c [\Gamma_r * c^{\langle t-1 \rangle}, x^{\langle t \rangle}] + b_c\big) \]`, "GRU candidate, Ng's notation"], [String.raw`\[ c^{\langle t \rangle} = \Gamma_u * \tilde c^{\langle t \rangle} + (1 - \Gamma_u) * c^{\langle t-1 \rangle} \]`, "GRU update, a = c"], [String.raw`\[ \Gamma = \sigma\big(W [a^{\langle t-1 \rangle}, x^{\langle t \rangle}] + b\big) \]`, "every gate, a sigmoid between 0 and 1"], [String.raw`\[ c^{\langle t \rangle} = \Gamma_u * \tilde c^{\langle t \rangle} + \Gamma_f * c^{\langle t-1 \rangle} \]`, "LSTM cell update"], [String.raw`\[ a^{\langle t \rangle} = \Gamma_o * \tanh c^{\langle t \rangle} \]`, "LSTM hidden state"], [String.raw`\[ \frac{\partial c^{\langle T \rangle}}{\partial c^{\langle 0 \rangle}}\Big|_{\text{direct}} = \prod_t \Gamma_f^{\langle t \rangle} \approx \sigma(b_f)^T \]`, "why the forget bias matters"], [String.raw`\[ 4H(n_x + H + 2), \quad 3H(n_x + H + 2) \]`, "parameters of nn.LSTM and nn.GRU, one layer"], [String.raw`\[ d\,G H\,(n_{\text{in}} + H + 2) \]`, "one layer of a stacked, possibly bidirectional RNN"], [String.raw`\[ \texttt{out}\,(B, T, dH), \quad \texttt{h\_n}, \texttt{c\_n}\,(L d, B, H) \]`, "nn.LSTM shapes with <code>batch_first</code>"]],
sources: ["AME 5970 has no slides, notes or homework on gated recurrent networks. The topic order follows Andrew Ng's course below, and the exam focus follows the recurring topics of the course's final practice exams (LSTM gates, vanishing gradients, choosing nn.LSTM for a task)", "Andrew Ng, Deep Learning Specialization, course 5 week 1: Vanishing gradients with RNNs, Gated recurrent unit (GRU), Long short-term memory (LSTM), Bidirectional RNN, Deep RNNs", "S. Hochreiter and J. Schmidhuber, Long short-term memory, Neural Computation 1997", "F. Gers, J. Schmidhuber and F. Cummins, Learning to forget: continual prediction with LSTM, Neural Computation 2000", "K. Cho et al., Learning phrase representations using RNN encoder-decoder for statistical machine translation, EMNLP 2014 (the GRU)", "R. Jozefowicz, W. Zaremba and I. Sutskever, An empirical exploration of recurrent network architectures, ICML 2015 (the forget gate bias of 1)", "I. Goodfellow, Y. Bengio and A. Courville, Deep Learning, sections 10.3 (bidirectional RNNs), 10.5 (deep RNNs) and 10.10 (the LSTM and other gated RNNs)", "A. Zhang, Z. Lipton, M. Li and A. Smola, Dive into Deep Learning, chapter 10 (LSTM, GRU, deep and bidirectional recurrent networks)", "PyTorch 2.15 documentation: nn.LSTM, nn.GRU, torch.nn.utils.rnn.pack_padded_sequence", "Data: every number computed with NumPy and PyTorch 2.15 on the CPU. Cards 2 to 4 use weights written for this lesson. Card 7 reruns Lesson 39's memory task with five models, three seeds each, at two training budgets. Card 8 replays the trained LSTM with forget bias 2 at T = 40 on two test sequences"]
});
})();

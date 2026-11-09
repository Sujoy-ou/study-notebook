(function () {
/* ML shelf, Part 8, Lesson 41: Attention (Pro). The course export has no material on attention (syllabus week 13), so the order follows Andrew Ng's Deep Learning Specialization course 5 week 3 (Attention model intuition, Attention model) and week 4 (Self-attention), with Bahdanau, Cho and Bengio (2015), Luong, Pham and Manning (2015), Vaswani et al. (2017) section 3.2 and Dive into Deep Learning chapter 11.
   Data: cards 1 and 3 come from a sequence reversal experiment written for this lesson (digits 0 to 9, lengths 5 to 25 for training, a GRU encoder and decoder with 64 units, with and without Bahdanau attention, plus a 128-unit decoder without attention, Adam 3e-3, batch 64, 4,000 steps, seeds 0 to 2, 500 greedy test sequences per length), PyTorch 2.15 on the CPU. Card 6 is a NumPy simulation with default_rng(4141). Every other number is computed live from the weights shown on the card. */
const C = ML.C;
const EXP = {"acc":{"att":{"5":{"tok":[0.9996,1.0,0.9992],"seq":[0.998,1.0,0.998]},"10":{"tok":[0.991,0.9908,0.9848],"seq":[0.974,0.97,0.958]},"15":{"tok":[0.9739,0.9765,0.9617],"seq":[0.938,0.94,0.908]},"20":{"tok":[0.9605,0.9454,0.9446],"seq":[0.906,0.87,0.862]},"25":{"tok":[0.9304,0.9305,0.9176],"seq":[0.844,0.826,0.818]},"30":{"tok":[0.9037,0.8927,0.8661],"seq":[0.76,0.754,0.696]},"40":{"tok":[0.8357,0.8131,0.8065],"seq":[0.654,0.578,0.57]}},"noatt":{"5":{"tok":[1.0,0.9972,1.0],"seq":[1.0,0.992,1.0]},"10":{"tok":[0.9552,0.9294,0.9522],"seq":[0.822,0.68,0.8]},"15":{"tok":[0.6929,0.7613,0.7268],"seq":[0.064,0.178,0.128]},"20":{"tok":[0.443,0.5185,0.4766],"seq":[0.0,0.004,0.0]},"25":{"tok":[0.3271,0.3655,0.3528],"seq":[0.0,0.0,0.0]},"30":{"tok":[0.282,0.2884,0.2933],"seq":[0.0,0.0,0.0]},"40":{"tok":[0.2227,0.2238,0.2318],"seq":[0.0,0.0,0.0]}},"noatt128":{"5":{"tok":[0.9984,0.9992,0.9996],"seq":[0.994,0.998,0.998]},"10":{"tok":[0.976,0.9906,0.994],"seq":[0.892,0.956,0.968]},"15":{"tok":[0.83,0.9431,0.9237],"seq":[0.274,0.672,0.602]},"20":{"tok":[0.5744,0.7681,0.6691],"seq":[0.0,0.112,0.032]},"25":{"tok":[0.4021,0.5413,0.4683],"seq":[0.0,0.002,0.0]},"30":{"tok":[0.3202,0.3967,0.3549],"seq":[0.0,0.0,0.0]},"40":{"tok":[0.2361,0.2642,0.2483],"seq":[0.0,0.0,0.0]}}},"pos":{"att":[1.0,0.998,0.995,0.987,0.977,0.97,0.958,0.956,0.947,0.943,0.933,0.928,0.917,0.915,0.915,0.905,0.893,0.892,0.886,0.877,0.882,0.877,0.867,0.864,0.872],"noatt":[0.958,0.843,0.727,0.651,0.568,0.488,0.403,0.351,0.332,0.303,0.265,0.267,0.234,0.211,0.207,0.212,0.191,0.197,0.187,0.184,0.191,0.205,0.185,0.201,0.153],"noatt128":[0.985,0.925,0.831,0.738,0.667,0.605,0.506,0.457,0.431,0.405,0.354,0.344,0.348,0.301,0.324,0.313,0.303,0.311,0.336,0.337,0.377,0.39,0.387,0.417,0.373]},"params":{"att":59882,"noatt":38634,"noatt128":126058},"maps":[{"x":[5,9,1,8,5,7,7,7],"y":[7,7,7,5,8,1,9,5],"a":[[0.0,0.0,0.0,0.0,0.0,0.009999999776482582,0.5600000023841858,0.4300000071525574],[0.0,0.0,0.0,0.0,0.0,0.0,0.07000000029802322,0.9300000071525574],[0.0,0.0,0.0,0.0,0.0,0.019999999552965164,0.9399999976158142,0.03999999910593033],[0.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0],[0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0],[0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0],[0.0,0.0,1.0,0.0,0.0,0.0,0.0,0.0],[0.0,1.0,0.0,0.0,0.0,0.0,0.0,0.0]]},{"x":[3,4,1,7,2,0,6,3,2,3,0,0],"y":[0,0,3,2,3,6,0,2,7,1,4,3],"a":[[0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.009999999776482582,0.9800000190734863],[0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,1.0],[0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.9900000095367432,0.009999999776482582],[0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.9900000095367432,0.0,0.0],[0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0],[0.0,0.0,0.0,0.0,0.0,0.0,0.019999999552965164,0.7799999713897705,0.12999999523162842,0.05999999865889549,0.009999999776482582,0.0],[0.0,0.0,0.0,0.0,0.0,0.0,0.9700000286102295,0.0,0.019999999552965164,0.0,0.0,0.0],[0.0,0.0,0.0,0.0,0.019999999552965164,0.9800000190734863,0.0,0.0,0.0,0.0,0.0,0.0],[0.0,0.0,0.0,0.0,0.9900000095367432,0.0,0.0,0.0,0.0,0.0,0.0,0.0],[0.0,0.0,0.0,0.9900000095367432,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],[0.0,0.0,1.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],[0.0,1.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0]]},{"x":[9,5,4,2,1,9,3,5,5,5,0,8,8,0,5,5,6,2,8,6],"y":[6,8,2,6,5,5,0,8,8,0,5,5,5,3,9,1,2,4,5,9],"a":[[0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.09000000357627869,0.9100000262260437],[0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,1.0],[0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.9900000095367432,0.009999999776482582],[0.0,0.0,0.0,0.009999999776482582,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.9900000095367432,0.0,0.0],[0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0],[0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.05999999865889549,0.9399999976158142,0.0,0.0,0.0,0.0],[0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.9900000095367432,0.0,0.0,0.0,0.0,0.0],[0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.009999999776482582,0.009999999776482582,0.9800000190734863,0.0,0.0,0.0,0.0,0.0,0.0],[0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],[0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.9900000095367432,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],[0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.9900000095367432,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],[0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.15000000596046448,0.8500000238418579,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],[0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.029999999329447746,0.9300000071525574,0.03999999910593033,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],[0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.9900000095367432,0.009999999776482582,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],[0.0,0.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],[0.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],[0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],[0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],[0.0,0.0,1.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],[0.0,0.9900000095367432,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0]]},{"x":[4,4,1,9,2,0,6,7,0,4,4,1,9,9,2,3,2,6,2,5,6,4,5,3,8,1,2,9,3,0],"y":[0,3,9,2,1,8,3,5,4,6,5,2,6,2,3,2,9,9,1,4,4,0,7,6,0,2,9,1,4,4],"a":[[0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.9900000095367432],[0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.9900000095367432],[0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.09000000357627869,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.9100000262260437,0.0],[0.0,0.0,0.0,0.0,0.019999999552965164,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.15000000596046448,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.8100000023841858,0.0,0.0],[0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.9900000095367432,0.0,0.0,0.0],[0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0],[0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,0.0],[0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.9900000095367432,0.0,0.0,0.0,0.0,0.0,0.0],[0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],[0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],[0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],[0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],[0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.009999999776482582,0.05000000074505806,0.9399999976158142,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],[0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],[0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],[0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.9900000095367432,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.009999999776482582,0.0],[0.0,0.0,0.0,0.0,0.019999999552965164,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.9800000190734863,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],[0.0,0.0,0.0,0.009999999776482582,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.9900000095367432,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.009999999776482582,0.0,0.0],[0.0,0.0,0.0,0.28999999165534973,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.699999988079071,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],[0.0,0.0,0.07000000029802322,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.9300000071525574,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],[0.0,0.03999999910593033,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.949999988079071,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],[0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],[0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.009999999776482582,0.9900000095367432,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],[0.0,0.0,0.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],[0.0,0.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],[0.0,0.0,0.0,0.0,0.0,0.9800000190734863,0.009999999776482582,0.009999999776482582,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],[0.0,0.0,0.0,0.0,0.9599999785423279,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.03999999910593033,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],[0.0,0.0,0.0,0.6499999761581421,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.33000001311302185,0.009999999776482582,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.009999999776482582,0.0,0.0],[0.0,0.0,0.3199999928474426,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.6800000071525574,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],[0.0,0.1599999964237213,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.8299999833106995,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0]]}],"astats":{"10":{"exact":0.1046,"shift":0.9784,"mass":0.9631},"20":{"exact":0.0672,"shift":0.9449,"mass":0.9241},"30":{"exact":0.0559,"shift":0.8871,"mass":0.8638}}};
const DK = {"tab":{"1":{"sd":1.0115,"raw_max":0.2691,"raw_J":0.3285,"raw_hot":0.0003,"scaled_max":0.2691,"scaled_J":0.3285,"scaled_hot":0.0003},"2":{"sd":1.3987,"raw_max":0.3637,"raw_J":0.34,"raw_hot":0.0008,"scaled_max":0.2865,"scaled_J":0.3357,"scaled_hot":0.0},"4":{"sd":1.9834,"raw_max":0.4954,"raw_J":0.3357,"raw_hot":0.0043,"scaled_max":0.3051,"scaled_J":0.3403,"scaled_hot":0.0},"8":{"sd":2.8339,"raw_max":0.6191,"raw_J":0.3118,"raw_hot":0.0227,"scaled_max":0.312,"scaled_J":0.3436,"scaled_hot":0.0},"16":{"sd":4.0044,"raw_max":0.7292,"raw_J":0.2603,"raw_hot":0.0803,"scaled_max":0.3178,"scaled_J":0.3452,"scaled_hot":0.0},"32":{"sd":5.6645,"raw_max":0.8072,"raw_J":0.2089,"raw_hot":0.201,"scaled_max":0.3186,"scaled_J":0.3464,"scaled_hot":0.0},"64":{"sd":8.0951,"raw_max":0.8666,"raw_J":0.1581,"raw_hot":0.3545,"scaled_max":0.3237,"scaled_J":0.3473,"scaled_hot":0.0},"128":{"sd":11.1928,"raw_max":0.9047,"raw_J":0.1197,"raw_hot":0.4935,"scaled_max":0.3195,"scaled_J":0.3466,"scaled_hot":0.0},"256":{"sd":16.0243,"raw_max":0.9296,"raw_J":0.0914,"raw_hot":0.6045,"scaled_max":0.3202,"scaled_J":0.3475,"scaled_hot":0.0},"512":{"sd":22.7935,"raw_max":0.952,"raw_J":0.0641,"raw_hot":0.7145,"scaled_max":0.3191,"scaled_J":0.3485,"scaled_hot":0.0}},"samp":{"1":[0.0,0.03,-0.02,0.02,0.02,0.04,0.03,-0.04,0.03,0.0],"2":[0.58,-1.56,1.13,-2.13,1.95,-2.14,0.69,-2.05,-0.95,0.55],"4":[-0.28,2.22,-0.61,-1.78,1.14,0.25,-0.01,-0.71,-0.55,-2.99],"8":[-0.31,-2.61,-0.94,-3.18,2.15,-1.37,-2.7,3.14,-0.52,-3.08],"16":[-5.07,-2.26,0.08,3.73,-3.97,4.79,4.05,2.12,-1.25,2.08],"32":[0.58,-7.15,1.74,-0.45,6.95,-2.14,2.54,-1.17,4.83,0.46],"64":[5.1,8.82,-2.02,9.95,-4.46,-13.92,9.62,0.64,-4.65,3.37],"128":[-7.4,12.84,1.05,-3.03,8.09,0.17,-5.97,-9.95,-2.32,0.66],"256":[12.56,2.45,27.97,1.07,-25.21,-10.0,7.73,-9.75,4.53,-19.4],"512":[28.62,13.51,22.79,31.93,25.81,-30.65,20.69,29.59,-0.11,-6.91]}};
const tx = (x, y, t, a, cls) => `<text class="${cls || "ts"}" x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""}>${t}</text>`;
const f = (v, d) => { const s = (+v).toFixed(d == null ? 4 : d); return /^-0(\.0*)?$/.test(s) ? s.slice(1) : s; };
const mn = v => String(v).replace(/-/g, "−");
const fm = (v, d) => mn(f(v, d));
const cm = v => mn(Math.round(v).toLocaleString("en-US"));
const RO = items => ML.readout(items.map(([k, v]) => [k, mn(v)]));
const TB = (head, rows) => `<table style="width:100%;border-collapse:collapse;font-size:13px;margin-top:6px"><tr>${head.map(h => `<th style="text-align:left;padding:4px 6px;border-bottom:1.5px solid var(--line);color:var(--muted);font-weight:600">${h}</th>`).join("")}</tr>${rows.map(r => `<tr>${r.map(c => `<td style="padding:4px 6px;border-bottom:1px solid var(--line);vertical-align:top">${c}</td>`).join("")}</tr>`).join("")}</table>`;
const legend = (items, x0, y, dx) => items.map(([lab, col, dash], i) => `<line x1="${x0 + i * dx}" y1="${y - 4}" x2="${x0 + i * dx + 18}" y2="${y - 4}" stroke="${col}" stroke-width="3" ${dash ? `stroke-dasharray="${dash}"` : ""}/>` + tx(x0 + i * dx + 23, y, lab)).join("");
const cell = (x, y, w, h, on, col, lines) => `<g class="${on ? (col || "c-teal") : "c-gray"}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" stroke-width="${on ? 1.6 : 0.6}"/></g>` + lines.map((t, i) => tx(x + w / 2, y + h / 2 + (i - (lines.length - 1) / 2) * 16 + 5, t, "middle", i === 0 ? "th" : "ts")).join("");
const bar = (x, y, w, h, v, col, lab) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="var(--sunk)" stroke="var(--line)"/><rect x="${x}" y="${y}" width="${Math.max(0, Math.min(1, v)) * w}" height="${h}" rx="3" fill="${col}" opacity="0.75"/>` + (lab ? tx(x - 6, y + h - 2, lab, "end") : "");
const slv = (id, v, d) => { const e = $(id + "v"); if (e) e.textContent = mn(f(v, d == null ? 2 : d)); };
const mean = a => a.reduce((s, v) => s + v, 0) / a.length;
const softmax = z => { const m = Math.max(...z.filter(v => v > -Infinity)); if (!isFinite(m)) return z.map(() => NaN); const e = z.map(v => v === -Infinity ? 0 : Math.exp(v - m)); const s = e.reduce((a, b) => a + b, 0); return e.map(v => v / s); };
const mm = (A, B) => A.map(r => B[0].map((_, j) => r.reduce((s, v, k) => s + v * B[k][j], 0)));
const T_ = A => A[0].map((_, j) => A.map(r => r[j]));
const heat = v => `rgba(29,158,117,${(0.08 + 0.92 * Math.max(0, Math.min(1, v))).toFixed(3)})`;

/* card 2: Ng's attention model, one decoder step, additive scores with W_s = W_a = I */
const W2 = ["Jane", "visite", "l'Afrique", "en", "septembre"];
const A2 = [[1, -1], [-1, 0.5], [1, 1], [-0.5, -1], [0, -1]];
const att2 = (s, vs) => { const pre = A2.map(a => [s[0] + a[0], s[1] + a[1]]), h = pre.map(p => p.map(Math.tanh)), e = h.map(r => vs * (r[0] + r[1])), al = softmax(e), c = [0, 1].map(j => al.reduce((t, w, i) => t + w * A2[i][j], 0)); return { pre, h, e, al, c }; };
/* card 4: four keys on the unit circle, scalar values */
const K4 = [0, 90, 180, 270].map(d => [Math.cos(d * Math.PI / 180), Math.sin(d * Math.PI / 180)]), V4 = [10, 20, 30, 40];
/* card 5 */
const Q5 = [[1, 0, 1, 0], [0, 2, 1, -1]], K5 = [[1, 1, 1, 1], [2, 0, 0, 0], [0, 1, 0, -1]], V5 = [[1, 0], [0, 2], [3, 1]];
/* card 7 and 10: self-attention on Ng's sentence */
const X7 = [[1, 0, 1], [0, 1, 0], [1, 1, 0], [0, 0, 1], [1, 0, 0]];
const WQ7 = [[1, 0, 1, 0], [0, 1, 0, 1], [1, 1, 0, 0]], WK7 = [[0, 1, 1, 0], [1, 0, 0, 1], [1, 0, 1, 0]], WV7 = [[1, 0], [0, 1], [1, 1]];
const selfAtt = (X, sc) => { const Q = mm(X, WQ7).map(r => r.map(v => v * sc)), K = mm(X, WK7), V = mm(X, WV7), S = mm(Q, T_(K)).map(r => r.map(v => v / 2)), P = S.map(softmax), O = mm(P, V); return { Q, K, V, S, P, O }; };
/* card 8 */
const S8 = [1.2, 2.0, 0.4, 1.5, -0.5], V8 = [[1, 0], [0, 1], [2, 2], [0, 0], [0, 0]];

addLesson("ml", "seq", {
level: "Pro", num: "Lesson 41",
id: "ml-seq-l41", title: "Attention", short: "41. Attention",
big: String.raw`An encoder and decoder built from RNNs squeeze a whole input sentence into one vector, and Ng shows that translation quality falls as sentences grow. Attention removes that bottleneck. At every output step the decoder compares its state with every encoder state, turns the scores into weights with a softmax, and reads a weighted average, the context \(c^{\langle t \rangle} = \sum_{t'} \alpha^{\langle t, t' \rangle} a^{\langle t' \rangle}\). Written with queries, keys and values this becomes \(\text{softmax}(QK^\top / \sqrt{d_k})\,V\), and when the queries, keys and values all come from the same sequence it is self-attention. This lesson measures the bottleneck in a real experiment, computes Ng's attention model and scaled dot-product attention by hand, explains the \(\sqrt{d_k}\), builds self-attention on Ng's sentence, and ends with masks, PyTorch's two attention APIs and what attention costs.`,
bridge: String.raw`The course export has no slides, notes or homework on attention (syllabus week 13), so the topic order follows Andrew Ng's Deep Learning Specialization course 5 week 3 (Attention model intuition, Attention model) and week 4 (Self-attention), with Bahdanau, Cho and Bengio (2015), Vaswani et al. (2017) section 3.2 and Dive into Deep Learning chapter 11. Multi-head attention, positional encoding, causal masks and the transformer block are Lesson 42.`,
labels: { note: "Exam and project note" },
cards: [

{s: "1. The bottleneck", t: "One vector for the whole input: a real experiment with and without attention",
intu: String.raw`In Ng's encoder and decoder the encoder reads the whole input and hands the decoder one vector, its last hidden state. Everything the decoder will ever know about the input must fit in that vector. Ng's picture is a plot of translation score against sentence length that falls for long sentences, because a human translator does not memorize the whole sentence first, they look back at the part they are translating. The experiment here makes that visible on a task with a known answer: reverse a string of random digits. The same GRU encoder and decoder with 64 units was trained three times without attention, three times with attention, and three times without attention but with 128 units, on lengths 5 to 25. Pick a length and compare.`,
eq: String.raw`\[ \text{no attention: } y^{\langle t \rangle} = g\big(s^{\langle t \rangle}\big), \quad s^{\langle 0 \rangle} = a^{\langle T_x \rangle} \]
\[ \text{attention: } y^{\langle t \rangle} = g\big(s^{\langle t \rangle}, c^{\langle t \rangle}\big), \quad c^{\langle t \rangle} = \sum_{t'=1}^{T_x} \alpha^{\langle t, t' \rangle} a^{\langle t' \rangle} \]`,
sym: [[String.raw`\(a^{\langle T_x \rangle}\)`, "the last encoder state, the only thing a plain decoder receives"], [String.raw`\(s^{\langle t \rangle}\)`, "the decoder state at output step t"], [String.raw`\(c^{\langle t \rangle}\)`, "the context vector, a fresh weighted average of all encoder states at every output step"], [String.raw`\(\alpha^{\langle t, t' \rangle}\)`, "how much output step t looks at input step t', the weights sum to 1 over t'"], ["token accuracy", "fraction of output digits that are right, greedy decoding, 500 test strings per length"]],
how: ["Read the curves at length 10: all three models are almost perfect.", "Move to length 20 and 25 and watch the plain decoders fall.", "Compare the 128-unit plain decoder with the 64-unit attention model, which has fewer parameters.", "Switch to the position view to see which output digits fail.", "Try 30 and 40, longer than any training string."],
say: String.raw`Without attention the decoder sees the input only through the encoder's final hidden state, a fixed-size bottleneck, so accuracy falls as inputs get longer, while attention gives every output step a new weighted average of all encoder states.`,
num: String.raw`Mean token accuracy over three seeds at length 20: attention 0.950, plain with 64 units 0.479, plain with 128 units 0.671. At length 25: 0.926, 0.348 and 0.471, and whole strings right 0.829 against 0.000 and 0.001. At length 40, never seen in training: <b>0.818</b> against 0.226 and 0.250. Parameters 59,882, 38,634 and 126,058. By output position at length 25 the plain 64-unit decoder gets its first digit right 95.8% of the time and its last only 15.3%, near guessing, while attention ends at 87.2%.`,
note: String.raw`A bigger bottleneck helps only a little, which is the point: the 128-unit plain model has about twice the parameters of the attention model and still loses at every length from 15 up. The task is easy to state but hard for a plain decoder because the last digit it writes is the first one it read. A bidirectional encoder, which Ng uses under his attention model, would not rescue the plain decoder either, because its output would still be squeezed into one vector.`,
r(fig, ctl) {
  const Ls = Object.keys(EXP.acc.att).map(Number), M = [["att", "attention, 64 units", C.teal], ["noatt", "no attention, 64 units", C.coral], ["noatt128", "no attention, 128 units", C.purple]];
  let v = "len";
  ctl.innerHTML = `<div class="row"><button data-b1="len">accuracy by length</button><button data-b1="pos">by output position, length 25</button></div>` + sl("b1L", "length", 0, Ls.length - 1, 1, 3) + `<div id="b1o"></div>`;
  const u = () => {
    pick(ctl, "b1", v);
    const L = Ls[+$("b1L").value]; $("b1Lv").textContent = L + (L > 25 ? " (longer than training)" : "");
    $("b1L").closest(".row").style.opacity = v === "len" ? 1 : 0.4;
    let s;
    if (v === "len") {
      const ax = ML.axes(80, 20, 560, 220, { xmin: 0, xmax: 40, ymin: 0, ymax: 1, nx: 8, ny: 5, fx: v => Math.round(v), fy: v => f(v, 1), xl: "input length", yl: "token accuracy" });
      s = ax.s + `<rect x="${ax.X(25)}" y="20" width="${ax.X(40) - ax.X(25)}" height="220" fill="var(--sunk)" opacity="0.7"/>` + tx(ax.X(32.5), 36, "never seen in training", "middle");
      s += `<line x1="${ax.X(0)}" y1="${ax.Y(0.1)}" x2="${ax.X(40)}" y2="${ax.Y(0.1)}" stroke="var(--muted)" stroke-dasharray="3 4"/>` + tx(ax.X(39), ax.Y(0.1) - 5, "guessing 0.1", "end");
      M.forEach(([k, , col]) => {
        s += ML.path(Ls.map(l => [ax.X(l), ax.Y(mean(EXP.acc[k][l].tok))]), col, 2.5);
        Ls.forEach(l => EXP.acc[k][l].tok.forEach(a => { s += `<circle cx="${ax.X(l)}" cy="${ax.Y(a)}" r="2.5" fill="${col}" opacity="0.6"/>`; }));
      });
      s += `<line x1="${ax.X(L)}" y1="20" x2="${ax.X(L)}" y2="240" stroke="var(--p)" stroke-width="1.5"/>`;
      s += legend(M.map(m => [m[1], m[2]]), 70, 290, 205);
    } else {
      const ax = ML.axes(80, 20, 560, 220, { xmin: 1, xmax: 25, ymin: 0, ymax: 1, nx: 6, ny: 5, fx: v => Math.round(v), fy: v => f(v, 1), xl: "output position (1 = the last input digit, 25 = the first)", yl: "token accuracy" });
      s = ax.s;
      M.forEach(([k, , col]) => { s += ML.path(EXP.pos[k].map((a, i) => [ax.X(i + 1), ax.Y(a)]), col, 2.5); });
      s += legend(M.map(m => [m[1], m[2]]), 70, 290, 205);
    }
    fig.innerHTML = svg(300, s);
    $("b1o").innerHTML = TB(["model", "parameters", "token accuracy at " + L, "whole string right"], M.map(([k, lab]) => [lab, cm(EXP.params[k]), EXP.acc[k][L].tok.map(a => f(a, 3)).join(", "), EXP.acc[k][L].seq.map(a => f(a, 3)).join(", ")])) + `<p class="note">Three seeds per model, listed in seed order. The line is their mean.</p>`;
  };
  ctl.querySelectorAll("button[data-b1]").forEach(b => b.onclick = () => { v = b.dataset.b1; u(); });
  $("b1L").oninput = u;
  u();
}},

{s: "2. Ng's attention model by hand", t: "Scores from a small network, a softmax, and a weighted average of the encoder states",
intu: String.raw`Ng's attention model translates "Jane visite l'Afrique en septembre". The encoder produces one state \(a^{\langle t' \rangle}\) per French word (in Ng's version the two halves of a bidirectional RNN joined together). Before writing output word t the decoder, whose previous state is \(s^{\langle t-1 \rangle}\), scores every encoder state with a small neural network, \(e^{\langle t, t' \rangle}\), turns the scores into weights with a softmax over t', and takes the weighted average as the context \(c^{\langle t \rangle}\). Here the encoder states are 2-dimensional and the decoder is about to write "Africa". The scoring network is \(e = v^\top \tanh(W_s s + W_a a)\) with \(W_s = W_a = I\) so you can follow every number. Move the decoder state and the scale of v.`,
eq: String.raw`\[ e^{\langle t, t' \rangle} = v^\top \tanh\big(W_s\, s^{\langle t-1 \rangle} + W_a\, a^{\langle t' \rangle}\big) \]
\[ \alpha^{\langle t, t' \rangle} = \frac{\exp\big(e^{\langle t, t' \rangle}\big)}{\sum_{t''=1}^{T_x} \exp\big(e^{\langle t, t'' \rangle}\big)}, \quad c^{\langle t \rangle} = \sum_{t'=1}^{T_x} \alpha^{\langle t, t' \rangle} a^{\langle t' \rangle} \]`,
sym: [[String.raw`\(e^{\langle t, t' \rangle}\)`, "the score, one number per pair of output step and input step"], [String.raw`\(\alpha^{\langle t, t' \rangle}\)`, "the attention weight, positive, sums to 1 over the input steps"], [String.raw`\(W_s, W_a, v\)`, "the scoring network's weights, learned with the rest of the model"], [String.raw`\(c^{\langle t \rangle}\)`, "the context, fed to the decoder together with the previous output word"]],
how: ["Step through the four stages at the default setting.", "Read the five scores, then the five weights.", "Check that the weights add to 1.", "Raise the scale of v to 4 and see the weights sharpen onto l'Afrique.", "Set it to 0 and see every weight become 0.2."],
say: String.raw`Ng's attention model scores each encoder state against the previous decoder state with a small network, normalizes the scores with a softmax over the input positions, and feeds the decoder the weighted average of the encoder states as its context for this output step.`,
num: String.raw`Decoder state \(s = (1, 1)\), scale 2. Pre-activations \(s + a\): (2, 0), (0, 1.5), (2, 2), (0.5, 0), (1, 0). Scores e = 1.9281, 1.8103, 3.8561, 0.9242, 1.5232. Exponentials sum to 67.38, so \(\alpha\) = (0.1021, 0.0907, <b>0.7017</b>, 0.0374, 0.0681). Context c = (0.6944, 0.5396). Scale 1 gives \(\alpha_3\) = 0.4380, scale 4 gives 0.9523.`,
note: String.raw`This scoring network is Bahdanau's additive attention, the version in Ng's lecture and programming assignment. Luong's and the transformer's version replace the small network with a dot product \(s^\top a\), which is cheaper and is the subject of cards 4 to 6. Both end the same way: a softmax over input positions and a weighted average. On an exam, write \(\sum_{t'} \alpha^{\langle t, t' \rangle} = 1\) and say that the weights depend on the current decoder step, so they are recomputed for every output word.`,
r(fig, ctl) {
  ctl.innerHTML = sl("b2a", "decoder state s1", -2, 2, 0.1, 1) + sl("b2b", "decoder state s2", -2, 2, 0.1, 1) + sl("b2v", "scale of v", 0, 4, 0.1, 2) + `<div id="b2st"></div><div id="b2o"></div>`;
  let k = 3;
  const u = () => {
    const s = [+$("b2a").value, +$("b2b").value], vs = +$("b2v").value; slv("b2a", s[0], 1); slv("b2b", s[1], 1); slv("b2v", vs, 1);
    const R = att2(s, vs);
    let g = tx(20, 22, "decoder about to write \"Africa\", previous state s = (" + fm(s[0], 1) + ", " + fm(s[1], 1) + ")", null, "th");
    W2.forEach((w, i) => {
      const x = 22 + i * 130;
      g += cell(x, 36, 116, 46, true, "c-blue", [w, "a = (" + A2[i].map(v => fm(v, 1)).join(", ") + ")"]);
      if (k >= 0) g += tx(x + 58, 104, "s + a = (" + R.pre[i].map(v => fm(v, 1)).join(", ") + ")", "middle");
      if (k >= 1) g += tx(x + 58, 124, "e = " + fm(R.e[i], 4), "middle", "t");
      if (k >= 2) { g += `<rect x="${x + 18}" y="${236 - R.al[i] * 90}" width="80" height="${Math.max(0.5, R.al[i] * 90)}" rx="3" fill="${C.teal}" opacity="0.8"/>` + tx(x + 58, 252, "α = " + f(R.al[i], 4), "middle", "t"); }
    });
    if (k >= 2) g += `<line x1="22" y1="236" x2="660" y2="236" stroke="var(--line)"/>`;
    if (k >= 3) g += tx(340, 284, "c = Σ α a = (" + fm(R.c[0], 4) + ", " + fm(R.c[1], 4) + ")", "middle", "th");
    fig.innerHTML = svg(296, g);
    $("b2o").innerHTML = RO([["sum of exp(e)", f(R.e.reduce((t, v) => t + Math.exp(v), 0), 2)], ["sum of α", f(R.al.reduce((a, b) => a + b, 0), 4)], ["largest α", W2[R.al.indexOf(Math.max(...R.al))] + ", " + f(Math.max(...R.al), 4)]]);
  };
  ML.stepper($("b2st"), 4, kk => { k = kk; if ($("b2a")) u(); }, ["pre-activations", "scores e", "softmax weights", "context"]);
  ["b2a", "b2b", "b2v"].forEach(i => $(i).oninput = u);
  k = 0; u();
}},

{s: "3. Where the trained model looks", t: "The attention weights of card 1's model on new digit strings",
intu: String.raw`Ng shows attention weights as a grid: output words down the side, input words along the top, and a bright cell where the model looked. For reversal you might expect output step t to look straight at the digit it copies, input \(T_x + 1 - t\), the opposite diagonal. The trained model found its own rule instead. It looks one position to the right of that digit, at the encoder state that has just read the digit the decoder wrote one step earlier. That state is easy to find by content, and a one-way GRU state still remembers the digit before its newest one, which is the digit to write now. Only the first output, with nothing to its right, looks at the mirrored cell. Nobody told the model any of this. Pick a string and move the output step.`,
eq: String.raw`\[ \text{reversal: } y^{\langle t \rangle} = x^{\langle T_x + 1 - t \rangle} \]
\[ \text{learned: } \arg\max_{t'} \alpha^{\langle t, t' \rangle} = T_x + 2 - t \ \text{ for } t \ge 2, \quad T_x \ \text{ for } t = 1 \]`,
sym: [["rows", "output steps, top to bottom, with the digit the model wrote"], ["columns", "input positions, left to right, with the input digit"], ["cell shade", String.raw`the weight \(\alpha^{\langle t, t' \rangle}\), dark for near 1`], ["dark outline", "where the model learned to look"], ["coral outline", "the mirrored digit it copies"]],
how: ["Pick the 12-digit string and find the dark band just right of the coral cells.", "Move the output step and read that row's largest weight.", "Check the digit at the coral cell against the digit the row wrote.", "Pick the 30-digit string, longer than any training string.", "Find rows where the weight spreads over two cells."],
say: String.raw`Plotting the attention weights as a grid of output steps against input positions shows which encoder states each output read, and a model trained only on reversed strings learned to read the state just after the digit it copies, a rule found by training rather than designed.`,
num: String.raw`Over 500 new strings, seed 0: the largest weight sits one position right of the mirrored digit in 97.8% of rows at length 10, 94.5% at 20 and 88.7% at 30, with average weight 0.96, 0.92 and 0.86 on that cell. It sits on the mirrored digit itself in 10.5%, 6.7% and 5.6% of rows, mostly the first output row. All four example strings, including the 30-digit one, are reversed without a single wrong digit. Seeds 1 and 2 learned the same shift, in 88.8% and 86.5% of rows at length 20.`,
note: String.raw`Attention maps are a useful check on what a model does and a weak one on why. The weights say where the context was read from, not how the decoder used it, and the shift here is a good warning: a map that is not where you expected can belong to a model that is perfectly right. A bidirectional encoder, as in Ng's model, would let a state carry its right neighbour too, and the map would change again.`,
r(fig, ctl) {
  let mi = 1;
  ctl.innerHTML = `<div class="row">${EXP.maps.map((m, i) => `<button data-b3="${i}">${m.x.length} digits</button>`).join("")}</div>` + sl("b3t", "output step", 1, 30, 1, 2) + `<div id="b3o"></div>`;
  const u = () => {
    pick(ctl, "b3", mi);
    const M = EXP.maps[mi], L = M.x.length, sl_ = $("b3t"); sl_.max = L; if (+sl_.value > L) sl_.value = L;
    const t = +sl_.value; $("b3tv").textContent = t;
    const cs = Math.min(24, Math.floor(520 / L)), x0 = 120, y0 = 48, lj = i => Math.min(L - i, L - 1);
    let s = tx(20, 20, "input digits →", null, "ts") + tx(20, 36, "output ↓", null, "ts");
    M.x.forEach((d, j) => { s += tx(x0 + j * cs + cs / 2, y0 - 6, d, "middle", cs > 16 ? "t" : "ts"); });
    M.a.forEach((row, i) => {
      const ok = M.y[i] === M.x[L - 1 - i];
      s += tx(x0 - 10, y0 + i * cs + cs * 0.7, M.y[i], "end", cs > 16 ? "t" : "ts");
      if (!ok) s += `<circle cx="${x0 - 30}" cy="${y0 + i * cs + cs / 2}" r="4" fill="${C.coral}"/>`;
      row.forEach((w, j) => { const mir = j === L - 1 - i, lr = j === lj(i); s += `<rect x="${x0 + j * cs}" y="${y0 + i * cs}" width="${cs - 1}" height="${cs - 1}" fill="${heat(w)}" stroke="${lr ? "var(--p)" : mir ? C.coral : "none"}" stroke-width="${lr || mir ? 1.6 : 0}"/>`; });
    });
    s += `<rect x="${x0 - 2}" y="${y0 + (t - 1) * cs - 1}" width="${L * cs + 2}" height="${cs + 1}" fill="none" stroke="var(--p)" stroke-width="2"/>`;
    const H = y0 + L * cs + 14;
    fig.innerHTML = svg(Math.max(H, 140), s);
    const row = M.a[t - 1], j = row.indexOf(Math.max(...row)), errs = M.y.filter((d, i) => d !== M.x[L - 1 - i]).length;
    $("b3o").innerHTML = RO([["digit to copy", "input " + (L + 1 - t) + ", a " + M.x[L - t]], ["largest weight at", "input " + (j + 1) + ", α = " + f(row[j], 2)], ["weight on the mirrored cell", f(row[L - t], 2)], ["wrong digits in this string", errs + " of " + L]]) +
      `<p class="note">Over 500 new strings, seed 0: the largest weight is one position right of the mirrored digit in ${(100 * EXP.astats[10].shift).toFixed(1)}% of rows at length 10, ${(100 * EXP.astats[20].shift).toFixed(1)}% at 20 and ${(100 * EXP.astats[30].shift).toFixed(1)}% at 30. Red dots would mark wrong output digits.</p>`;
  };
  ctl.querySelectorAll("button[data-b3]").forEach(b => b.onclick = () => { mi = +b.dataset.b3; u(); });
  $("b3t").oninput = u;
  u();
}},

{s: "4. Queries, keys and values", t: "Attention as a soft dictionary lookup",
intu: String.raw`A Python dictionary looks up a query, finds the one key that matches, and returns its value. Attention does a soft version. Every stored item has a key \(k_i\) and a value \(v_i\). The query \(q\) is compared with every key by a dot product, the scores go through a softmax, and the answer is the weighted average of all the values. Here four keys point east, north, west and south, with values 10, 20, 30 and 40. Turn the query and change its length. A long query makes the softmax sharp and the lookup nearly hard. A query of length 0 gives every key the same weight. In Ng's model the query is the decoder state, and the encoder states serve as both keys and values.`,
eq: String.raw`\[ \alpha_i = \frac{\exp(q \cdot k_i)}{\sum_j \exp(q \cdot k_j)}, \quad \text{output} = \sum_i \alpha_i\, v_i \]`,
sym: [["q", "the query, what this position is looking for"], [String.raw`\(k_i\)`, "the key of item i, what it offers to be matched against"], [String.raw`\(v_i\)`, "the value of item i, what it hands over if it is chosen"], [String.raw`\(\alpha_i\)`, String.raw`the weight, larger when q points along \(k_i\)`]],
how: ["Start at angle 30 degrees and length 2.", "Read the four weights and the output 14.68.", "Set the angle to 45: east and north tie.", "Raise the length to 8: the lookup becomes almost hard.", "Set the length to 0: the output is the plain mean 25."],
say: String.raw`Attention is a soft dictionary lookup: the query is compared with every key by a dot product, a softmax turns the scores into weights, and the output is the weighted average of the values.`,
num: String.raw`Angle 30 degrees, length 2: scores \(q \cdot k\) = 1.7321, 1, −1.7321, −1, weights (<b>0.634</b>, 0.3049, 0.0198, 0.0413), output 14.68. Length 8: weights (0.9492, 0.0508, 0, 0), output 10.51, close to the hard lookup 10. Length 0: every weight 0.25, output 25. Angle 45: east and north tie at 0.4721.`,
note: String.raw`Keys and values are separate on purpose: what makes an item easy to find need not be what it should report. In self-attention both come from the same input through two different learned matrices, card 7. Because the output is an average of values, it always lies inside their range, here between 10 and 40.`,
r(fig, ctl) {
  ctl.innerHTML = sl("b4a", "query angle (degrees)", 0, 359, 1, 30) + sl("b4r", "query length", 0, 8, 0.1, 2) + `<div id="b4o"></div>`;
  const names = ["east", "north", "west", "south"], cols = [C.coral, C.blue, C.purple, C.amber];
  const u = () => {
    const th = +$("b4a").value * Math.PI / 180, r = +$("b4r").value; $("b4av").textContent = $("b4a").value; slv("b4r", r, 1);
    const q = [r * Math.cos(th), r * Math.sin(th)], sc = K4.map(k => q[0] * k[0] + q[1] * k[1]), al = softmax(sc), out = al.reduce((t, a, i) => t + a * V4[i], 0);
    const cx = 160, cy = 160, R = 100, sR = R / 2;
    let s = `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="var(--line)" stroke-dasharray="3 4"/>`;
    K4.forEach((k, i) => { s += arrow(cx, cy, cx + k[0] * R, cy - k[1] * R, cols[i], 2) + tx(cx + k[0] * (R + 22), cy - k[1] * (R + 22) + 4, names[i] + " " + V4[i], "middle"); });
    s += arrow(cx, cy, cx + q[0] * sR, cy - q[1] * sR, "var(--p)", 3) + tx(cx + q[0] * sR + 8, cy - q[1] * sR - 6, "q", null, "th");
    K4.forEach((k, i) => { s += bar(400, 50 + i * 40, 220, 18, al[i], cols[i], names[i]) + tx(628, 64 + i * 40, f(al[i], 4)); });
    s += tx(400, 34, "weights after the softmax", null, "th") + tx(400, 232, "output = Σ α v = " + f(out, 2), null, "th") + tx(400, 254, "hard lookup would return " + V4[sc.indexOf(Math.max(...sc))]);
    fig.innerHTML = svg(300, s);
    $("b4o").innerHTML = RO([["scores q · k", sc.map(v => f(v, 4)).join(", ")], ["sum of weights", f(al.reduce((a, b) => a + b, 0), 4)], ["output", f(out, 2)]]);
  };
  ["b4a", "b4r"].forEach(i => $(i).oninput = u);
  u();
}},

{s: "5. Scaled dot-product attention by hand", t: "Two queries, three keys and values, every matrix written out",
intu: String.raw`Put the queries in the rows of Q, the keys in the rows of K and the values in the rows of V. Then all the dot products are one matrix product \(QK^\top\), with one row per query and one column per key. Divide by \(\sqrt{d_k}\), take a softmax along each row, and multiply by V. Here \(d_k = 4\), so the scale is 2 and the scaled scores stay simple. Step through the four stages and check each number yourself.`,
eq: String.raw`\[ \text{Attention}(Q, K, V) = \text{softmax}\Big(\frac{QK^\top}{\sqrt{d_k}}\Big) V \]
\[ Q\,(n_q, d_k), \quad K\,(n_k, d_k), \quad V\,(n_k, d_v) \ \to \ \text{output}\,(n_q, d_v) \]`,
sym: [[String.raw`\(QK^\top\)`, "the score matrix, entry (i, j) is query i dotted with key j"], [String.raw`\(d_k\)`, "the length of each query and key, here 4"], ["softmax", "taken along each row, over the keys"], [String.raw`\(n_q, n_k\)`, "number of queries and of keys, which need not be equal"]],
how: ["Compute row 1 of the scores: (1, 0, 1, 0) dotted with each key.", "Divide every score by √4 = 2.", "Take the softmax of each row.", "Multiply the weight rows by V.", "Compare with the unscaled version in the last step."],
say: String.raw`Scaled dot-product attention computes all query-key dot products as one matrix product, divides by the square root of the key length, applies a softmax along each row and multiplies by the value matrix.`,
num: String.raw`Scores \(QK^\top\) = [[2, 2, 0], [2, 0, 3]], scaled [[1, 1, 0], [1, 0, 1.5]]. Row 1: exponentials 2.7183, 2.7183, 1, sum 6.4366, weights (0.4223, 0.4223, 0.1554). Row 2: sum 8.2, weights (0.3315, 0.1220, 0.5465). Output [[<b>0.8884</b>, 1.0000], [1.9711, 0.7905]]. Without the scale the weights would be (0.4683, 0.4683, 0.0634) and (0.2595, 0.0351, 0.7054).`,
note: String.raw`The softmax goes along the keys, dim = −1 in code, never along the queries. A softmax over the wrong axis gives columns that sum to 1, and nothing raises an error. Every row of the output is a weighted average of the rows of V, so its shape follows V's width \(d_v\), not \(d_k\).`,
r(fig, ctl) {
  const S = mm(Q5, T_(K5)), Ss = S.map(r => r.map(v => v / 2)), P = Ss.map(softmax), O = mm(P, V5), Pu = S.map(softmax), Ou = mm(Pu, V5);
  ML.stepper(ctl, 5, k => {
    let s = ML.grid(Q5, { x: 50, y: 40, cell: 34, title: "Q (2 × 4)", colLab: false, rowLab: ["q1", "q2"] }).s + ML.grid(K5, { x: 250, y: 40, cell: 34, title: "K (3 × 4)", colLab: false, rowLab: ["k1", "k2", "k3"] }).s + ML.grid(V5, { x: 470, y: 40, cell: 34, title: "V (3 × 2)", colLab: false, rowLab: ["v1", "v2", "v3"] }).s;
    const g = (A, t, x, hl, dec) => ML.grid(A, { x, y: 200, cell: 46, title: t, colLab: false, rowLab: false, dec: dec == null ? 4 : dec, hl }).s;
    if (k === 0) s += g(S, "Q Kᵀ", 60, new Set(["0,0", "0,1", "0,2"]), 0) + tx(260, 240, "row 1: 1·1 + 0·1 + 1·1 + 0·1 = 2, then 2, then 0") + tx(260, 262, "row 2: 0 + 2 + 1 − 1 = 2, then 0, then 3");
    if (k === 1) s += g(Ss, "Q Kᵀ / √4", 60, null, 1) + tx(260, 240, "every score divided by 2");
    if (k === 2) s += g(P, "softmax by row", 60, null, 4) + tx(260, 240, "row 1: e¹, e¹, e⁰ over 6.4366") + tx(260, 262, "row 2: e¹, e⁰, e^1.5 over 8.2");
    if (k === 3) s += g(O, "weights × V", 60, null, 4) + tx(260, 240, "row 1: 0.4223·(1, 0) + 0.4223·(0, 2) + 0.1554·(3, 1)") + tx(260, 262, "= (0.8884, 1.0000)");
    if (k === 4) s += g(Pu, "softmax, no scale", 60, null, 4) + g(Ou, "output, no scale", 300, null, 4) + tx(520, 240, "sharper weights") + tx(520, 262, "than step 3");
    fig.innerHTML = svg(310, s);
  }, ["scores", "scale", "softmax", "output", "without the scale"]);
}},

{s: "6. Why divide by the square root of d_k", t: "Dot products grow with length, and a saturated softmax stops learning",
intu: String.raw`If the entries of q and k are independent with mean 0 and variance 1, then \(q \cdot k\) is a sum of \(d_k\) such products, so its variance is \(d_k\) and its spread grows like \(\sqrt{d_k}\). With \(d_k = 512\) the raw scores spread over tens of units, the softmax puts almost all weight on one key, and its gradient, the matrix \(\text{diag}(p) - pp^\top\), shrinks toward zero. Dividing by \(\sqrt{d_k}\) brings the spread back to 1 at every size. The chart is a simulation with 10 keys and 4,000 random queries per size. The bars show one sample of scores at the chosen size.`,
eq: String.raw`\[ \text{Var}(q \cdot k) = \sum_{i=1}^{d_k} \text{Var}(q_i k_i) = d_k, \quad \text{Var}\Big(\frac{q \cdot k}{\sqrt{d_k}}\Big) = 1 \]
\[ \frac{\partial p}{\partial s} = \text{diag}(p) - p\,p^\top \to 0 \ \text{ as } p \to \text{one-hot} \]`,
sym: [[String.raw`\(d_k\)`, "length of the query and key vectors"], [String.raw`\(\partial p / \partial s\)`, "the softmax Jacobian, how the weights respond to the scores"], ["largest weight", "mean over 4,000 queries of the biggest of the 10 weights"], ["gradient size", "mean Frobenius norm of the Jacobian"]],
how: ["Start at a key length of 1, where scaling changes nothing.", "Move to 64: the raw scores spread over about ±16.", "Read the raw largest weight 0.87 against 0.32 scaled.", "Read the gradient size falling for the raw scores.", "Go to 512 and read how often the raw softmax is above 0.99."],
say: String.raw`Dot products of random vectors have a variance equal to their length, so without the factor \(1/\sqrt{d_k}\) long keys push the softmax into saturation where its gradient vanishes, and the scale keeps the score variance at 1 for any key length.`,
num: String.raw`Score spread (standard deviation) 1.01, 2.83, 8.10, 22.79 at \(d_k\) = 1, 8, 64, 512, close to \(\sqrt{d_k}\). Raw scores at \(d_k = 64\): largest weight 0.8666, gradient size 0.1581, a weight above 0.99 in 1,418 of 4,000 queries. Scaled: 0.3237, 0.3473 and none. At 512 the raw softmax is above 0.99 in <b>2,858 of 4,000</b> queries and its gradient size is 0.0641, against 0.3485 scaled.`,
note: String.raw`The argument assumes unit-variance entries, which is roughly what a well-initialized network produces. It is the reason given in Vaswani et al. section 3.2.1, which also notes that additive attention, card 2, does not need the scale because its tanh bounds every term. The scale changes only the sharpness of the softmax, not which key scores highest.`,
r(fig, ctl) {
  const ds = Object.keys(DK.tab).map(Number);
  ctl.innerHTML = sl("b6d", "key length d_k (powers of 2)", 0, ds.length - 1, 1, 6) + `<div id="b6o"></div>`;
  const u = () => {
    const d = ds[+$("b6d").value], T = DK.tab[d], sm_ = DK.samp[d]; $("b6dv").textContent = d;
    const ax = ML.axes(70, 20, 270, 190, { xmin: 0, xmax: 9, ymin: 0, ymax: 1, nx: 9, ny: 4, fx: v => "2^" + Math.round(v), fy: v => f(v, 2), xl: "d_k", yl: "largest weight" });
    let s = ax.s + ML.path(ds.map((dd, i) => [ax.X(i), ax.Y(DK.tab[dd].raw_max)]), C.coral, 2.5) + ML.path(ds.map((dd, i) => [ax.X(i), ax.Y(DK.tab[dd].scaled_max)]), C.teal, 2.5);
    s += `<line x1="${ax.X(ds.indexOf(d))}" y1="20" x2="${ax.X(ds.indexOf(d))}" y2="210" stroke="var(--p)"/>`;
    const pr = softmax(sm_), ps = softmax(sm_.map(v => v / Math.sqrt(d)));
    s += tx(400, 26, "one sample of 10 scores, d_k = " + d, null, "th");
    sm_.forEach((v, i) => { const y = 40 + i * 17; s += bar(470, y, 80, 12, pr[i], C.coral) + bar(570, y, 80, 12, ps[i], C.teal) + tx(462, y + 10, fm(v, 1), "end"); });
    s += tx(510, 222, "raw", "middle") + tx(610, 222, "scaled", "middle") + tx(420, 222, "score", "middle");
    s += legend([["raw softmax(q · k)", C.coral], ["scaled softmax(q · k / √d_k)", C.teal]], 70, 262, 250);
    fig.innerHTML = svg(272, s);
    $("b6o").innerHTML = TB(["d_k = " + d, "score spread", "largest weight", "gradient size", "weight above 0.99"], [["raw", f(T.sd, 2), f(T.raw_max, 4), f(T.raw_J, 4), cm(4000 * T.raw_hot) + " of 4,000"], ["scaled", f(T.sd / Math.sqrt(d), 2), f(T.scaled_max, 4), f(T.scaled_J, 4), cm(4000 * T.scaled_hot) + " of 4,000"]]);
  };
  $("b6d").oninput = u;
  u();
}},

{s: "7. Self-attention", t: "Every word builds its query, key and value from itself and reads all the others",
intu: String.raw`In self-attention there is no separate decoder. Every position of one sequence produces its own query, key and value through three learned matrices, \(q^{\langle t \rangle} = W^Q x^{\langle t \rangle}\), \(k^{\langle t \rangle} = W^K x^{\langle t \rangle}\), \(v^{\langle t \rangle} = W^V x^{\langle t \rangle}\), and then every position attends to every position, itself included. Ng computes \(A^{\langle 3 \rangle}\) for "l'Afrique" in "Jane visite l'Afrique en septembre": its query is compared with all five keys, and the result is a new representation of "l'Afrique" that depends on its context. The embeddings here are 3-dimensional and \(d_k = 4\). Click a word to see its row, and scale the queries to sharpen all rows.`,
eq: String.raw`\[ Q = XW^Q, \quad K = XW^K, \quad V = XW^V \]
\[ A = \text{softmax}\Big(\frac{QK^\top}{\sqrt{d_k}}\Big) V, \quad A^{\langle t \rangle} = \sum_{t'} \alpha^{\langle t, t' \rangle} v^{\langle t' \rangle} \]`,
sym: [["X", "the input, one row per word, here (5, 3)"], [String.raw`\(W^Q, W^K\)`, "(3, 4) matrices that make queries and keys"], [String.raw`\(W^V\)`, "a (3, 2) matrix that makes values"], [String.raw`\(A^{\langle t \rangle}\)`, "the new representation of word t, one row of A, here of length 2"]],
how: ["Click l'Afrique and read its five weights.", "Check that they add to 1.", "Read its new vector, a weighted average of the five values.", "Click the other words and compare their rows.", "Double the query scale and see every row sharpen."],
say: String.raw`Self-attention computes a query, key and value for every position of a sequence with learned matrices, so each position's output is a weighted average of all positions' values with weights from its own query against all keys.`,
num: String.raw`Queries \(XW^Q\) for l'Afrique: (1, 1, 1, 1). Scaled scores against the five keys: 2, 1, 2, 1, 1. Weights (0.3222, 0.1185, 0.3222, 0.1185, 0.1185). New vector \(A^{\langle 3 \rangle}\) = (<b>1.2037</b>, 0.8815). Jane's row is (0.4131, 0.0922, 0.2506, 0.1520, 0.0922) and its new vector (1.3209, 0.9078).`,
note: String.raw`An RNN builds the representation of word 3 from words 1 and 2 through two sequential steps. Self-attention reaches every word in one step, and all five rows are computed at once as matrix products, which is why it runs in parallel on a GPU. The price is a score for every pair of words, card 10. With one set of \(W^Q, W^K, W^V\) this is a single head. Lesson 42 runs several heads side by side.`,
r(fig, ctl) {
  let w = 2;
  ctl.innerHTML = `<div class="row">${W2.map((t, i) => `<button data-b7="${i}">${t}</button>`).join("")}</div>` + sl("b7s", "query scale", 0, 3, 0.1, 1) + `<div id="b7o"></div>`;
  const u = () => {
    pick(ctl, "b7", w);
    const sc = +$("b7s").value; slv("b7s", sc, 1);
    const R = selfAtt(X7, sc), row = R.P[w];
    let s = "";
    const xs = W2.map((_, i) => 70 + i * 135);
    W2.forEach((t, i) => { s += cell(xs[i] - 55, 200, 110, 46, i === w, "c-blue", [t, "v = (" + R.V[i].map(v => f(v, 0)).join(", ") + ")"]); });
    W2.forEach((t, i) => { const h = 8 + 120 * row[i]; s += `<path d="M${xs[w]} 198 C ${xs[w]} ${198 - h}, ${xs[i]} ${198 - h}, ${xs[i]} 198" fill="none" stroke="${C.teal}" stroke-width="${1 + 10 * row[i]}" opacity="0.7"/>` + tx(xs[i], 266, "α = " + f(row[i], 4), "middle", "t"); });
    s += tx(20, 22, "query of " + W2[w] + " = (" + R.Q[w].map(v => f(v, 1)).join(", ") + ")", null, "th");
    s += tx(340, 296, "A⟨" + (w + 1) + "⟩ = Σ α v = (" + f(R.O[w][0], 4) + ", " + f(R.O[w][1], 4) + ")", "middle", "th");
    fig.innerHTML = svg(308, s);
    $("b7o").innerHTML = TB(["word", "x", "key", "scaled score", "weight"], W2.map((t, i) => [t, "(" + X7[i].join(", ") + ")", "(" + R.K[i].join(", ") + ")", f(R.S[w][i], 2), f(row[i], 4)]));
  };
  ctl.querySelectorAll("button[data-b7]").forEach(b => b.onclick = () => { w = +b.dataset.b7; u(); });
  $("b7s").oninput = u;
  u();
}},

{s: "8. Masks", t: "Padding must get zero weight, and only minus infinity before the softmax does that",
intu: String.raw`A batch holds sequences of different lengths, padded to the longest, as in Lesson 40 card 10. Padding positions are not words, so no query may attend to them. The softmax gives a positive weight to every finite score, so a mask must act on the scores before the softmax and set the forbidden ones to \(-\infty\), which becomes exactly 0 after the exponential. Here one query scores five keys, and keys 4 and 5 are padding. Compare four ways of masking.`,
eq: String.raw`\[ \alpha = \text{softmax}(s + m), \quad m_j = \begin{cases} 0 & \text{key } j \text{ allowed} \\ -\infty & \text{key } j \text{ masked} \end{cases} \]
\[ e^{-\infty} = 0 \ \Rightarrow \ \alpha_j = 0, \quad \textstyle\sum_{\text{allowed}} \alpha_j = 1 \]`,
sym: [["s", "the scores of one query against all keys"], ["m", "the additive mask, 0 or minus infinity"], ["padding", "positions added only to make sequences the same length"], ["all-masked row", "a query with no allowed key, softmax of all minus infinity"]],
how: ["Look at no mask: the padding takes 29% of the weight.", "Try a score of 0 for padding: it still gets 14%.", "Try zeroing after the softmax: the weights sum to 0.71.", "Use minus infinity: exactly 0 on padding and a sum of 1.", "Mask every key and read nan."],
say: String.raw`A mask adds minus infinity to the scores of forbidden keys before the softmax, so their weights become exactly zero and the allowed weights still sum to one, which setting scores to zero or zeroing weights after the softmax does not achieve.`,
num: String.raw`Scores (1.2, 2.0, 0.4, 1.5, −0.5). No mask: weights (0.1920, 0.4274, 0.0863, 0.2592, 0.0351). Padding scores set to 0: padding still gets 0.0704 each. Zeroed after the softmax: the weights sum to 0.7057 and the output shrinks to (0.3646, 0.6000). Minus infinity: (0.2721, 0.6056, 0.1223, 0, 0), output (<b>0.5167</b>, 0.8502).`,
note: String.raw`In practice a large negative number such as −1e9 works the same in float32. A row with every key masked is softmax of all minus infinity, which is 0 over 0, so a manual softmax and nn.MultiheadAttention return nan, while F.scaled_dot_product_attention in PyTorch 2.15 returns zeros for that row. A causal mask, which hides future positions from each query, uses the same rule and is in Lesson 42.`,
r(fig, ctl) {
  let v = "inf";
  const modes = [["none", "no mask"], ["zero", "padding score 0"], ["after", "zero after softmax"], ["inf", "minus infinity"], ["all", "every key masked"]];
  ctl.innerHTML = `<div class="row">${modes.map(([k, t]) => `<button data-b8="${k}">${t}</button>`).join("")}</div><div id="b8o"></div>`;
  const u = () => {
    pick(ctl, "b8", v);
    let w;
    if (v === "none") w = softmax(S8);
    else if (v === "zero") w = softmax(S8.map((s, j) => j > 2 ? 0 : s));
    else if (v === "after") w = softmax(S8).map((a, j) => j > 2 ? 0 : a);
    else if (v === "inf") w = softmax(S8.map((s, j) => j > 2 ? -Infinity : s));
    else w = softmax(S8.map(() => -Infinity));
    const sum = w.reduce((a, b) => a + b, 0), out = [0, 1].map(c => w.reduce((t, a, j) => t + a * V8[j][c], 0));
    let s = tx(20, 22, "one query, five keys, keys 4 and 5 are padding", null, "th");
    S8.forEach((sc, j) => {
      const x = 40 + j * 126, pad = j > 2, m = pad && v !== "none" && v !== "after";
      s += cell(x, 36, 110, 44, !pad, "c-blue", [pad ? "pad " + (j + 1) : "key " + (j + 1), "score " + fm(sc, 1)]);
      s += tx(x + 55, 100, m || v === "all" ? (v === "zero" ? "score → 0" : "score → −∞") : "", "middle");
      const h = isNaN(w[j]) ? 0 : w[j] * 120;
      s += `<rect x="${x + 25}" y="${236 - h}" width="60" height="${Math.max(0.5, h)}" rx="3" fill="${pad ? C.coral : C.teal}" opacity="0.8"/>` + tx(x + 55, 254, isNaN(w[j]) ? "nan" : f(w[j], 4), "middle", "t");
    });
    s += `<line x1="30" y1="236" x2="660" y2="236" stroke="var(--line)"/>`;
    fig.innerHTML = svg(270, s);
    $("b8o").innerHTML = RO([["sum of weights", isNaN(sum) ? "nan" : f(sum, 4)], ["weight on padding", isNaN(sum) ? "nan" : f(w[3] + w[4], 4)], ["output Σ α v", isNaN(sum) ? "nan" : "(" + f(out[0], 4) + ", " + f(out[1], 4) + ")"]]) + `<p class="note">Values are (1, 0), (0, 1), (2, 2) for the real keys and (0, 0) for the padding.</p>`;
  };
  ctl.querySelectorAll("button[data-b8]").forEach(b => b.onclick = () => { v = b.dataset.b8; u(); });
  u();
}},

{s: "9. Attention in PyTorch", t: "F.scaled_dot_product_attention, nn.MultiheadAttention and their traps",
intu: String.raw`PyTorch has two front doors. <code>F.scaled_dot_product_attention</code> takes Q, K and V you have already made and computes card 5's formula. nn.MultiheadAttention holds the projection matrices \(W^Q, W^K, W^V\) and an output matrix \(W^O\), so it is a full self-attention layer, with one head here and several in Lesson 42. Each case below was run in PyTorch 2.15. Two traps are silent: the layer expects (T, B, d) unless you pass <code>batch_first</code>=True, and the two functions read a Boolean mask the opposite way round.`,
eq: String.raw`\[ \text{params of nn.MultiheadAttention}(d, h) = 4d^2 + 4d \]
\[ (B, T, d) \to (B, T, d), \quad \text{weights } (B, T_q, T_k) \]`,
sym: [[String.raw`\(\texttt{in\_proj\_weight}\)`, String.raw`\(W^Q, W^K, W^V\) stacked, shape (3d, d)`], [String.raw`\(\texttt{out\_proj}\)`, String.raw`\(W^O\), a Linear(d, d) after the attention`], [String.raw`\(\texttt{batch\_first}\)`, "False by default, which means (T, B, d)"], [String.raw`\(\texttt{key\_padding\_mask}\)`, "(B, number of keys) Boolean, True marks padding to ignore"]],
how: ["Open the shapes case and match it with card 5.", "Count the 288 parameters of a d = 8 layer.", "Open the <code>batch_first</code> case: no error, wrong axis.", "Open the mask case and compare the two meanings of True.", "Read the two error messages."],
say: String.raw`<code>F.scaled_dot_product_attention</code> computes \(\text{softmax}(QK^\top/\sqrt{d_k})V\) on tensors you supply, while nn.MultiheadAttention adds the learned projections, expects (T, B, d) unless <code>batch_first</code> is True, and treats True in a Boolean mask as blocked where the function treats it as allowed.`,
num: String.raw`<code>F.scaled_dot_product_attention</code> on (2, 5, 8) matches the manual formula to 1.2e−7. nn.MultiheadAttention(8, 1) has <b>288</b> parameters = 4 · 64 + 4 · 8. Without <code>batch_first</code> an input (4, 7, 8) returns weights (7, 4, 4): attention across the 4 batch items. The same mask (True on keys 1 and 2) gives weights (0.6698, 0.3302, 0) in the function and (0, 0, 1) in the layer.`,
note: String.raw`Write the convention next to every mask in your code. In F.scaled_dot_product_attention a Boolean True means take part in attention. In nn.MultiheadAttention and nn.Transformer a Boolean True means not allowed, for both <code>attn_mask</code> and <code>key_padding_mask</code>. A float mask is added to the scores in both, so 0 and minus infinity mean the same thing everywhere, which is the safest form.`,
r(fig, ctl) {
  let v = "sdpa";
  const cases = [["sdpa", "shapes"], ["mha", "the layer"], ["bf", "batch_first"], ["mask", "mask meaning"], ["kpm", "padding mask"], ["err", "errors"]];
  ctl.innerHTML = `<div class="row">${cases.map(([k, t]) => `<button data-b9="${k}">${t}</button>`).join("")}</div>`;
  const u = () => {
    pick(ctl, "b9", v);
    const c = {
      sdpa: [["import torch, math, torch.nn.functional as F", "q, k, v = (torch.randn(2, 5, 8) for _ in range(3))   # (B, T, d)", "out = F.scaled_dot_product_attention(q, k, v)", "man = torch.softmax(q @ k.transpose(-2, -1) / math.sqrt(8), dim=-1) @ v", "print(out.shape, (out - man).abs().max())"], ["torch.Size([2, 5, 8]) tensor(1.1921e-07)"], "The same formula as card 5, on a batch. k.transpose(−2, −1) swaps only the last two axes, and the softmax runs over dim=−1, the keys."],
      mha: [["mha = torch.nn.MultiheadAttention(embed_dim=8, num_heads=1, batch_first=True)", "for n, p in mha.named_parameters(): print(n, tuple(p.shape))", "x = torch.randn(4, 7, 8)", "out, w = mha(x, x, x)          # self-attention: query = key = value = x", "print(out.shape, w.shape)"], ["in_proj_weight (24, 8)", "in_proj_bias (24,)", "out_proj.weight (8, 8)", "out_proj.bias (8,)", "torch.Size([4, 7, 8]) torch.Size([4, 7, 7])", "total parameters 288"], "W^Q, W^K and W^V are stacked into one (24, 8) matrix. The weights come back averaged over heads, one (T, T) grid per batch item, like card 3."],
      bf: [["mha = torch.nn.MultiheadAttention(8, 1)      # batch_first defaults to False", "out, w = mha(x, x, x)                         # x is (4, 7, 8), meant as (B, T, d)", "print(out.shape, w.shape)"], ["torch.Size([4, 7, 8]) torch.Size([7, 4, 4])"], "No error. The layer read (T, B, d), so it took 7 sequences of length 4 and mixed the 4 batch items with each other. The output has the right shape, so only the weights reveal the mistake."],
      mask: [["mask = torch.tensor([[True, True, False]] * 3)   # True on keys 1 and 2", "F.scaled_dot_product_attention(q3, k3, v3, attn_mask=mask)", "mha(q3, k3, v3, attn_mask=mask)                 # identity projections"], ["SDPA weights  rows (0.6698, 0.3302, 0), (0.3302, 0.6698, 0), (0.5, 0.5, 0)", "MHA weights   rows (0, 0, 1), (0, 0, 1), (0, 0, 1)", "MHA with ~mask gives the SDPA weights"], "One mask, opposite results. In the function True means attend. In the layer True means blocked, so only key 3 was left."],
      kpm: [["out, w = mha(q3, k3, v3, key_padding_mask=torch.tensor([[False, False, True]]))", "out, w = mha(q3, k3, v3, key_padding_mask=torch.tensor([[True, True, True]]))", "F.scaled_dot_product_attention(q3, k3, v3, attn_mask=allowed)  # row 3 all False"], ["weights rows (0.6698, 0.3302, 0), ... key 3 ignored", "out and w are all nan when every key is padding", "SDPA returns (0, 0) for the fully masked row in 2.15"], "key_padding_mask has shape (B, T_k) and True marks padding. A sequence that is all padding gives nan in the layer, so keep at least one real token per row or drop empty rows first."],
      err: [["mha(torch.randn(4, 7, 6), torch.randn(4, 7, 6), torch.randn(4, 7, 6))", "F.scaled_dot_product_attention(torch.randn(2, 5, 8), torch.randn(2, 6, 4), torch.randn(2, 6, 8))"], ["AssertionError: was expecting embedding dimension of 8, but got 6", "RuntimeError: Expected size for first two dimensions of batch2 tensor to be: [2, 8] but got: [2, 4]."], "The first is a feature size that does not match embed_dim. The second is a query of length 8 against keys of length 4: the dot product needs the same d_k. Keys and values may differ in length from the queries along T."]
    }[v];
    fig.innerHTML = ML.code(c[0], -1) + ML.term(c[1].map(mn)) + `<p class="note">${c[2]}</p>`;
  };
  ctl.querySelectorAll("button[data-b9]").forEach(b => b.onclick = () => { v = b.dataset.b9; u(); });
  u();
}},

{s: "10. Order and cost", t: "Self-attention ignores word order and pays for every pair",
intu: String.raw`Two facts about self-attention set up Lesson 42. First, it has no idea of order. Shuffle the words and every output row moves with its word but keeps exactly the same value, because the scores depend only on the vectors, not on where they sit. "Jane visite l'Afrique" and "l'Afrique visite Jane" give the same set of outputs. Transformers fix this by adding a position encoding to each input. Second, it compares every position with every other, so the score matrix has \(n^2\) entries per head. An RNN needs n steps one after another but only n states. Shuffle below, then move the sliders for the cost.`,
eq: String.raw`\[ \text{SelfAttn}(PX) = P\,\text{SelfAttn}(X) \ \text{ for any permutation matrix } P \]
\[ \text{score memory} = n^2 \cdot \text{heads} \cdot B \cdot 4 \text{ bytes}, \quad \text{FLOPs} \approx 4 n^2 d \]`,
sym: [["P", "a permutation matrix, it reorders the rows"], ["n", "sequence length"], ["d", "width of queries, keys and values"], ["path length", "steps between two positions: 1 for attention, up to n for an RNN"]],
how: ["Press shuffle and compare each word's output row with the table before.", "Check that the values are unchanged, only the order moves.", "Set n to 512 and read the size of one attention matrix.", "Double n and see the memory grow four times.", "Compare the sequential steps of an RNN with attention."],
say: String.raw`Self-attention is permutation equivariant, so it needs positional information to know word order, and its score matrix grows with the square of the sequence length, while every pair of positions is connected in a single step.`,
num: String.raw`Card 7's sentence in its own order gives \(A^{\langle 3 \rangle}\) = (1.2037, 0.8815) for l'Afrique, and after any shuffle l'Afrique's row is still (1.2037, 0.8815). One float32 attention matrix: n = 512 takes 1 MiB, n = 4,096 takes 64 MiB and n = 32,768 takes <b>4 GiB</b>, per head and per sequence. Two matrix products cost about \(4n^2 d\) operations, 1.07e9 at n = 512 and d = 1,024.`,
note: String.raw`For an exam answer comparing an RNN with self-attention: the RNN processes positions one after another, so it cannot be parallelized over time and distant positions are n steps apart, which is where vanishing gradients come from. Self-attention connects every pair in one step and runs in parallel, but its cost and memory grow as \(n^2\) and it needs position encodings. Memory-efficient kernels such as FlashAttention avoid storing the full matrix but still do the \(n^2\) work.`,
r(fig, ctl) {
  let order = [0, 1, 2, 3, 4], seed = 7;
  ctl.innerHTML = `<div class="row"><button id="b10s">shuffle the words</button><button id="b10r">original order</button></div>` + sl("b10n", "sequence length n (powers of 2)", 6, 16, 1, 9) + sl("b10d", "width d", 64, 2048, 64, 1024) + `<div id="b10o"></div>`;
  const shuf = () => { const a = order.slice(); for (let i = a.length - 1; i > 0; i--) { seed = (seed * 9301 + 49297) % 233280; const j = Math.floor(seed / 233280 * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } order = a; };
  const u = () => {
    const X = order.map(i => X7[i]), R = selfAtt(X, 1), n = 2 ** +$("b10n").value, d = +$("b10d").value; $("b10nv").textContent = cm(n); $("b10dv").textContent = d;
    let s = tx(20, 22, "self-attention on the words in this order", null, "th");
    order.forEach((wi, p) => { s += cell(20 + p * 130, 34, 118, 52, wi === 2, "c-teal", [W2[wi], "(" + f(R.O[p][0], 4) + ", " + f(R.O[p][1], 4) + ")"]); });
    const bytes = n * n * 4, unit = bytes >= 2 ** 30 ? [bytes / 2 ** 30, "GiB"] : bytes >= 2 ** 20 ? [bytes / 2 ** 20, "MiB"] : [bytes / 2 ** 10, "KiB"];
    const ax = ML.axes(90, 112, 540, 160, { xmin: 6, xmax: 16, ymin: 3, ymax: 11, nx: 10, ny: 4, fx: v => cm(2 ** v), fy: v => "1e" + Math.round(v), xl: "sequence length n (log scale)", yl: "bytes (log)" });
    const ns = []; for (let e = 6; e <= 16; e += 0.25) ns.push(e);
    s += ax.s + `<line x1="${ax.X(6)}" y1="${ax.Y(Math.log10(16 * 2 ** 30))}" x2="${ax.X(16)}" y2="${ax.Y(Math.log10(16 * 2 ** 30))}" stroke="var(--muted)" stroke-dasharray="4 4"/>` + tx(ax.X(6) + 6, ax.Y(Math.log10(16 * 2 ** 30)) - 5, "16 GiB, a large GPU");
    s += ML.path(ns.map(e => [ax.X(e), ax.Y(Math.log10(4 * 4 ** e))]), C.coral, 2.5) + ML.path(ns.map(e => [ax.X(e), ax.Y(Math.log10(4 * 2 ** e * d))]), C.blue, 2.5);
    const ln = Math.log2(n);
    s += `<circle cx="${ax.X(ln)}" cy="${ax.Y(Math.log10(bytes))}" r="5" fill="${C.coral}"/><circle cx="${ax.X(ln)}" cy="${ax.Y(Math.log10(4 * n * d))}" r="5" fill="${C.blue}"/>`;
    s += legend([["one attention matrix, n² floats", C.coral], ["RNN hidden states, n · d floats", C.blue]], 90, 322, 270);
    fig.innerHTML = svg(332, s);
    $("b10o").innerHTML = RO([["order", order.map(i => W2[i]).join(" ")], ["l'Afrique's output", "(" + f(R.O[order.indexOf(2)][0], 4) + ", " + f(R.O[order.indexOf(2)][1], 4) + ")"], ["attention matrix", f(unit[0], unit[0] < 10 ? 2 : 0) + " " + unit[1] + " per head and sequence"], ["attention FLOPs ≈ 4n²d", (4 * n * n * d).toExponential(2)], ["RNN FLOPs ≈ 2nd²", (2 * n * d * d).toExponential(2)], ["longest path", "1 against " + cm(n) + " steps"]]);
  };
  $("b10s").onclick = () => { shuf(); u(); };
  $("b10r").onclick = () => { order = [0, 1, 2, 3, 4]; u(); };
  ["b10n", "b10d"].forEach(i => $(i).oninput = u);
  u();
}},

{s: "11. With the agent", t: "Do it with the agent: an attention toolkit with tests that pin this lesson",
intu: String.raw`The lesson as code for the project: scaled dot-product attention written out in NumPy and in PyTorch, Bahdanau's additive score, a self-attention layer, and a mask helper with one documented convention. The tests pin the numbers of cards 2, 5, 7 and 8, check the PyTorch version against <code>F.scaled_dot_product_attention</code>, and check permutation equivariance, so a softmax over the wrong axis, a missing scale, a mask applied after the softmax or a flipped Boolean mask each fails a test.`,
eq: String.raw`\[ \texttt{attention} \to \texttt{additive\_scores} \to \texttt{SelfAttention} \to \texttt{make\_padding\_mask} \to \texttt{pytest} \]`,
sym: [[String.raw`\(\texttt{attention(Q, K, V, mask)}\)`, "card 5 with card 8's mask, returns output and weights"], [String.raw`\(\texttt{additive\_scores(s, A, Ws, Wa, v)}\)`, "card 2's scores"], [String.raw`\(\texttt{SelfAttention(d\_in, d\_k, d\_v)}\)`, "card 7 as an nn.Module with three Linear layers"], [String.raw`\(\texttt{make\_padding\_mask(lengths, T)}\)`, "(B, T) with True on real tokens, one convention for the whole project"]],
how: ["Paste the command.", "Check that the softmax runs over the last axis.", "Check that the mask is added before the softmax.", "Run pytest and read which card each test pins.", "Commit the module with its tests."],
say: String.raw`A tested attention module reproduces the hand calculations of this lesson, matches PyTorch's fused function and fixes one mask convention, so each common attention bug fails a specific test.`,
num: String.raw`Tests expect weights (0.1021, 0.0907, 0.7017, 0.0374, 0.0681) from card 2, output [[0.8884, 1.0], [1.9711, 0.7905]] from card 5, \(A^{\langle 3 \rangle}\) = (1.2037, 0.8815) from card 7, masked weights (0.2721, 0.6056, 0.1223, 0, 0) from card 8, a match with <code>F.scaled_dot_product_attention</code> to 1e−6, and outputs that permute with the inputs.`,
r(fig, ctl) {
  ML.agent(fig, ctl, {
    prompt: "Create src/attention.py. attention(Q, K, V, mask=None) computes softmax(Q K^T / sqrt(d_k)) V for NumPy arrays of shape (..., n_q, d_k), (..., n_k, d_k), (..., n_k, d_v), where mask is Boolean with True meaning the key may be attended, and masked scores are set to -inf before the softmax, and it returns (output, weights). attention_torch does the same for tensors. additive_scores(s, A, Ws, Wa, v) returns v . tanh(Ws s + Wa a) for every row a of A. SelfAttention(d_in, d_k, d_v) is an nn.Module with Linear layers W_q, W_k, W_v without bias that returns attention_torch(x W_q, x W_k, x W_v, mask). make_padding_mask(lengths, T) returns a (B, T) Boolean tensor with True on real tokens. Put the mask convention in every docstring. Create tests/test_attention.py with pytest: (1) additive_scores with s = (1, 1), Ws = Wa = I, v = (2, 2) and A rows (1, -1), (-1, 0.5), (1, 1), (-0.5, -1), (0, -1) gives softmax weights (0.1021, 0.0907, 0.7017, 0.0374, 0.0681) to 1e-4, (2) attention with Q rows (1, 0, 1, 0), (0, 2, 1, -1), K rows (1, 1, 1, 1), (2, 0, 0, 0), (0, 1, 0, -1), V rows (1, 0), (0, 2), (3, 1) gives [[0.8884, 1.0], [1.9711, 0.7905]], (3) SelfAttention with weights set to W_Q rows (1, 0, 1, 0), (0, 1, 0, 1), (1, 1, 0, 0), W_K rows (0, 1, 1, 0), (1, 0, 0, 1), (1, 0, 1, 0), W_V rows (1, 0), (0, 1), (1, 1) on X rows (1, 0, 1), (0, 1, 0), (1, 1, 0), (0, 0, 1), (1, 0, 0) gives row 3 (1.2037, 0.8815), (4) scores (1.2, 2.0, 0.4, 1.5, -0.5) with keys 4 and 5 masked give weights (0.2721, 0.6056, 0.1223, 0, 0) that sum to 1, (5) attention_torch matches F.scaled_dot_product_attention on random (2, 5, 8) tensors to 1e-6, with and without a mask, (6) permuting the rows of X permutes the rows of SelfAttention's output the same way. Do not change the tests to make them pass.",
    actions: ["$ pytest -q", "......                                                   [100%]", "6 passed"],
    files: [["src/attention.py", "attention, attention_torch, additive_scores, SelfAttention, make_padding_mask"], ["tests/test_attention.py", "six tests with the numbers of cards 2, 5, 7 and 8"]],
    checks: ["the softmax is taken over the last axis, the keys", "scores are divided by sqrt(d_k) before the softmax", "masked scores are set to -inf before the softmax, never weights zeroed after it", "the Boolean mask convention is written in the docstring and matches F.scaled_dot_product_attention", "SelfAttention's Linear layers have no bias, so the card 7 numbers can be loaded exactly"]
  });
}},

{s: "12. Test", t: "Lesson 41 test: attention",
intu: String.raw`Twelve questions on the bottleneck, Ng's attention model, queries, keys and values, scaled dot-product attention, the scale, self-attention, masks, PyTorch's APIs and the cost. All numbers are new.`,
eq: String.raw`\[ \text{12 questions} \]`,
sym: [["pass mark", "9 of 12, then redo the missed cards"]],
how: ["Write the formula before substituting.", "Say over which axis each softmax runs.", "Write every shape as (B, T, d).", "Reopen the named card for any miss."],
say: String.raw`Twelve questions covering the whole lesson.`,
num: String.raw`Score <b>9 or more</b> to move on to transformers.`,
r(fig, ctl) {
  ML.quiz(fig, ctl, [
    { q: "Why does a plain RNN encoder and decoder translate long sentences worse than short ones?", o: ["the decoder has too few output words", "the whole input must pass through one fixed-size vector, the encoder's last state", "the softmax over the vocabulary saturates", "the encoder cannot read more than 20 words"], a: 1, why: "Everything the decoder learns about the input arrives through the encoder's final hidden state. Attention gives each output step a new context built from every encoder state. Card 1." },
    { q: "Three encoder states get scores e = (0, ln 2, ln 5). What are the attention weights?", o: ["(0, 0.2857, 0.7143)", "(0.125, 0.25, 0.625)", "(0.3333, 0.3333, 0.3333)", "(0.1, 0.2, 0.7)"], a: 1, why: "The exponentials are 1, 2 and 5, which sum to 8, so the weights are 1/8, 2/8 and 5/8. Card 2." },
    { q: "With those weights and encoder states a = (4, 0), (0, 4), (2, 2), what is the context vector?", o: ["(1.75, 2.25)", "(2, 2)", "(1.25, 1.25)", "(0.5, 3.5)"], a: 0, why: "c = 0.125 (4, 0) + 0.25 (0, 4) + 0.625 (2, 2) = (0.5 + 1.25, 1 + 1.25) = (1.75, 2.25). Card 2." },
    { q: "In Ng's attention model, which quantity is recomputed for every output word?", o: ["the encoder states a⟨t'⟩", "the vocabulary softmax weights", "the attention weights α⟨t, t'⟩ and the context c⟨t⟩", "the scoring network's weights"], a: 2, why: "The scores depend on the previous decoder state, so each output step gets its own weights and context. The encoder states are computed once. Card 2." },
    { q: "A query q = (1, 2) meets keys k₁ = (2, 0) and k₂ = (0, 1) with values 10 and 30, and no scaling. What is the output?", o: ["20", "10", "30", "15"], a: 0, why: "Both scores are 2, so the weights are 0.5 and 0.5 and the output is 20. Card 4." },
    { q: "Q has shape (6, 16), K has shape (9, 16) and V has shape (9, 32). What is the shape of softmax(QKᵀ/√16)V?", o: ["(9, 32)", "(6, 16)", "(6, 9)", "(6, 32)"], a: 3, why: "QKᵀ is (6, 9), one row per query, and multiplying by V of shape (9, 32) gives (6, 32). Card 5." },
    { q: "Query (2, 0, 2, 0) and keys (1, 1, 1, 1) and (0, 2, 0, 2), with d_k = 4. What are the scaled scores and the weights?", o: ["scores (4, 0), weights (0.9820, 0.0180)", "scores (2, 0), weights (0.8808, 0.1192)", "scores (2, 2), weights (0.5, 0.5)", "scores (1, 0), weights (0.7311, 0.2689)"], a: 1, why: "The dot products are 4 and 0, divided by √4 = 2 they are 2 and 0, and softmax(2, 0) = (0.8808, 0.1192). Card 5." },
    { q: "Query and key entries have mean 0 and variance 1, and d_k = 256. What is the standard deviation of the raw dot product, and why divide by √d_k?", o: ["1, to normalize the weights", "16, so the softmax does not saturate and its gradient stays usable", "256, to keep the values small", "16, to make the weights sum to 1"], a: 1, why: "The variance is d_k = 256, so the spread is 16. Dividing by 16 brings it back to 1. The softmax sums to 1 either way. Card 6." },
    { q: "In self-attention, where do the queries, keys and values come from?", o: ["queries from the decoder, keys and values from the encoder", "all three from the same sequence, through three learned matrices", "keys from a fixed dictionary, values from the input", "all three are the raw input without any weights"], a: 1, why: "Q = XW^Q, K = XW^K and V = XW^V from one input X. Encoder and decoder attention, card 2, takes the query from the decoder. Card 7." },
    { q: "Scores (3, 1, 2) for keys 1 to 3, and key 3 is padding. What are the correct weights?", o: ["(0.6652, 0.0900, 0.2447)", "(0.6652, 0.0900, 0)", "(0.7311, 0.2689, 0.2447)", "(0.8808, 0.1192, 0)"], a: 3, why: "Set the padding score to minus infinity before the softmax: softmax(3, 1) = (0.8808, 0.1192). Zeroing after the softmax gives (0.6652, 0.0900, 0), which sums to 0.755. Card 8." },
    { q: "x has shape (32, 50, 64) as (B, T, d). What does nn.MultiheadAttention(64, 1)(x, x, x) do?", o: ["raises a shape error", "attends over the 50 time steps correctly", "treats 32 as the length and 50 as the batch, so it attends across batch items", "attends over the 64 features"], a: 2, why: "batch_first is False by default, so the layer reads (T, B, d) and mixes the 32 batch items. No error is raised. Card 9." },
    { q: "Sequence length grows from 1,024 to 4,096. By what factor does one float32 attention matrix per head grow, and how large is it?", o: ["4 times, to 16 MiB", "16 times, to 16 MiB", "16 times, to 64 MiB", "4 times, to 64 MiB"], a: 2, why: "The matrix has n² entries, so 4 times longer means 16 times bigger: 4,096² · 4 bytes = 64 MiB, from 4 MiB. Card 10." }
  ], "Lesson 41 test");
}}
],
summary: String.raw`An encoder and decoder without attention pass the input through one vector, and on the reversal experiment they fail as strings grow while the same model with attention keeps working. Ng's attention model scores every encoder state against the previous decoder state with a small network, normalizes the scores with a softmax over input positions, and feeds the decoder the context \(c^{\langle t \rangle} = \sum_{t'} \alpha^{\langle t, t' \rangle} a^{\langle t' \rangle}\). In general form a query is compared with keys by dot products and the output is a weighted average of values, \(\text{softmax}(QK^\top / \sqrt{d_k}) V\), where the scale keeps the score variance at 1 so the softmax does not saturate. Self-attention makes Q, K and V from the same sequence with learned matrices. Masks add minus infinity before the softmax. In PyTorch, nn.MultiheadAttention expects (T, B, d) unless <code>batch_first</code>=True and reads Boolean masks the opposite way from <code>F.scaled_dot_product_attention</code>. Self-attention ignores order and costs \(n^2\) per head, which Lesson 42 builds on.`,
sheet: [[String.raw`\[ e^{\langle t, t' \rangle} = v^\top \tanh\big(W_s s^{\langle t-1 \rangle} + W_a a^{\langle t' \rangle}\big) \]`, "Ng's (Bahdanau's) additive score"], [String.raw`\[ \alpha^{\langle t, t' \rangle} = \frac{\exp(e^{\langle t, t' \rangle})}{\sum_{t''} \exp(e^{\langle t, t'' \rangle})} \]`, "attention weights, a softmax over input positions"], [String.raw`\[ c^{\langle t \rangle} = \sum_{t'} \alpha^{\langle t, t' \rangle} a^{\langle t' \rangle} \]`, "the context for output step t"], [String.raw`\[ \text{Attention}(Q, K, V) = \text{softmax}\Big(\frac{QK^\top}{\sqrt{d_k}}\Big) V \]`, "scaled dot-product attention"], [String.raw`\[ Q\,(n_q, d_k),\ K\,(n_k, d_k),\ V\,(n_k, d_v) \to (n_q, d_v) \]`, "shapes"], [String.raw`\[ \text{Var}(q \cdot k) = d_k \]`, "why the scale is the square root of the key length"], [String.raw`\[ Q = XW^Q,\ K = XW^K,\ V = XW^V \]`, "self-attention"], [String.raw`\[ \alpha = \text{softmax}(s + m),\ m_j \in \{0, -\infty\} \]`, "masking before the softmax"], [String.raw`\[ 4d^2 + 4d \]`, "parameters of nn.MultiheadAttention with embedding size d"], [String.raw`\[ n^2 \cdot 4 \text{ bytes} \]`, "one float32 attention matrix, per head and sequence"]],
sources: ["AME 5970 has no slides, notes or homework on attention (syllabus week 13). The topic order follows Andrew Ng's course below, and the exam focus follows the course map's recurring final practice topics", "Andrew Ng, Deep Learning Specialization, course 5 week 3: Basic models, Attention model intuition, Attention model, and the programming assignment Neural machine translation with attention", "Andrew Ng, Deep Learning Specialization, course 5 week 4: Self-attention", "D. Bahdanau, K. Cho and Y. Bengio, Neural machine translation by jointly learning to align and translate, ICLR 2015 (additive attention, alignment plots)", "M.-T. Luong, H. Pham and C. D. Manning, Effective approaches to attention-based neural machine translation, EMNLP 2015 (dot-product scores)", "A. Vaswani et al., Attention is all you need, NeurIPS 2017, section 3.2 (scaled dot-product attention and the reason for the square root of d_k)", "A. Zhang, Z. Lipton, M. Li and A. Smola, Dive into Deep Learning, chapter 11 (queries, keys and values, attention scoring functions, Bahdanau attention, self-attention)", "PyTorch 2.15 documentation: torch.nn.functional.scaled_dot_product_attention, torch.nn.MultiheadAttention", "Data: cards 1 and 3 come from a reversal experiment written for this lesson (random digit strings, lengths 5 to 25 for training, GRU encoder and decoder, Adam 3e-3, batch 64, 4,000 steps, seeds 0 to 2, 500 greedy test strings per length), PyTorch 2.15 on the CPU. Card 6 is a NumPy simulation with 10 keys and 4,000 queries per key length. Cards 2, 4, 5, 7 and 8 use weights written for this lesson and compute every number live"]
});
})();

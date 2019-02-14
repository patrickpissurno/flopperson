// Define an octave with naturals and sharps (Zz = rest)
const { Cn, Cs, Dn, Ds, En, Fn, Fs, Gn, Gs, An, As, Bn, Zz } = { Cn: 0, Cs: 1, Dn: 2, Ds: 3, En: 4, Fn: 5, Fs: 6, Gn: 7, Gs: 8, An: 9, As: 10, Bn: 11, Zz: 12 };

// Define another one with flats and remaining sharps
const { Bs, Df, Dn2, Ef, En2, Es, Gf, Gn2, Af, An2, Bf, Bn2, Zz2 } = { Bs: 0, Df: 1, Dn2: 2, Ef: 3, En2: 4, Es: 5, Gf: 6, Gn2: 7, Af: 8, An2: 9, Bf: 10, Bn2: 11, Zz2: 12 };

module.exports = {
    Cn, Cs, Dn, Ds, En, Fn, Fs, Gn, Gs, An, As, Bn, Zz,
    Bs, Df, Dn2, Ef, En2, Es, Gf, Gn2, Af, An2, Bf, Bn2, Zz2
};
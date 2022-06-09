(function(GLOBAL) { //lib v1.2.2a (sub-set)
    'use strict';
    /* Utility Libraries required for Standard operations
     * All credits for these codes belong to their respective creators, moderators and owners.
     * For more info (including license and terms of use), please visit respective source.
     */

    //Crypto.js
    (function() {
        // Global Crypto object
        var Crypto = GLOBAL.Crypto = {};
        /*!
         * Crypto-JS v2.5.4  Crypto.js
         * http://code.google.com/p/crypto-js/
         * Copyright (c) 2009-2013, Jeff Mott. All rights reserved.
         * http://code.google.com/p/crypto-js/wiki/License
         */
        (function() {

            var base64map = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

            // Crypto utilities
            var util = Crypto.util = {

                // Bit-wise rotate left
                rotl: function(n, b) {
                    return (n << b) | (n >>> (32 - b));
                },

                // Bit-wise rotate right
                rotr: function(n, b) {
                    return (n << (32 - b)) | (n >>> b);
                },

                // Swap big-endian to little-endian and vice versa
                endian: function(n) {

                    // If number given, swap endian
                    if (n.constructor == Number) {
                        return util.rotl(n, 8) & 0x00FF00FF |
                            util.rotl(n, 24) & 0xFF00FF00;
                    }

                    // Else, assume array and swap all items
                    for (var i = 0; i < n.length; i++)
                        n[i] = util.endian(n[i]);
                    return n;

                },

                // Generate an array of any length of random bytes
                randomBytes: function(n) {
                    for (var bytes = []; n > 0; n--)
                        bytes.push(Math.floor(Math.random() * 256));
                    return bytes;
                },

                // Convert a byte array to big-endian 32-bit words
                bytesToWords: function(bytes) {
                    for (var words = [], i = 0, b = 0; i < bytes.length; i++, b += 8)
                        words[b >>> 5] |= (bytes[i] & 0xFF) << (24 - b % 32);
                    return words;
                },

                // Convert big-endian 32-bit words to a byte array
                wordsToBytes: function(words) {
                    for (var bytes = [], b = 0; b < words.length * 32; b += 8)
                        bytes.push((words[b >>> 5] >>> (24 - b % 32)) & 0xFF);
                    return bytes;
                },

                // Convert a byte array to a hex string
                bytesToHex: function(bytes) {
                    for (var hex = [], i = 0; i < bytes.length; i++) {
                        hex.push((bytes[i] >>> 4).toString(16));
                        hex.push((bytes[i] & 0xF).toString(16));
                    }
                    return hex.join("");
                },

                // Convert a hex string to a byte array
                hexToBytes: function(hex) {
                    for (var bytes = [], c = 0; c < hex.length; c += 2)
                        bytes.push(parseInt(hex.substr(c, 2), 16));
                    return bytes;
                },

                // Convert a byte array to a base-64 string
                bytesToBase64: function(bytes) {
                    for (var base64 = [], i = 0; i < bytes.length; i += 3) {
                        var triplet = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
                        for (var j = 0; j < 4; j++) {
                            if (i * 8 + j * 6 <= bytes.length * 8)
                                base64.push(base64map.charAt((triplet >>> 6 * (3 - j)) & 0x3F));
                            else base64.push("=");
                        }
                    }

                    return base64.join("");
                },

                // Convert a base-64 string to a byte array
                base64ToBytes: function(base64) {
                    // Remove non-base-64 characters
                    base64 = base64.replace(/[^A-Z0-9+\/]/ig, "");

                    for (var bytes = [], i = 0, imod4 = 0; i < base64.length; imod4 = ++i % 4) {
                        if (imod4 == 0) continue;
                        bytes.push(((base64map.indexOf(base64.charAt(i - 1)) & (Math.pow(2, -2 * imod4 + 8) - 1)) << (imod4 * 2)) |
                            (base64map.indexOf(base64.charAt(i)) >>> (6 - imod4 * 2)));
                    }

                    return bytes;
                }

            };

            // Crypto character encodings
            var charenc = Crypto.charenc = {};

            // UTF-8 encoding
            var UTF8 = charenc.UTF8 = {

                // Convert a string to a byte array
                stringToBytes: function(str) {
                    return Binary.stringToBytes(unescape(encodeURIComponent(str)));
                },

                // Convert a byte array to a string
                bytesToString: function(bytes) {
                    return decodeURIComponent(escape(Binary.bytesToString(bytes)));
                }

            };

            // Binary encoding
            var Binary = charenc.Binary = {

                // Convert a string to a byte array
                stringToBytes: function(str) {
                    for (var bytes = [], i = 0; i < str.length; i++)
                        bytes.push(str.charCodeAt(i) & 0xFF);
                    return bytes;
                },

                // Convert a byte array to a string
                bytesToString: function(bytes) {
                    for (var str = [], i = 0; i < bytes.length; i++)
                        str.push(String.fromCharCode(bytes[i]));
                    return str.join("");
                }

            };

        })();
        //Adding SHA1 to fix basic PKBDF2
        /*
         * Crypto-JS v2.5.4
         * http://code.google.com/p/crypto-js/
         * (c) 2009-2012 by Jeff Mott. All rights reserved.
         * http://code.google.com/p/crypto-js/wiki/License
         */
        (function() {

            // Shortcuts
            var C = Crypto,
                util = C.util,
                charenc = C.charenc,
                UTF8 = charenc.UTF8,
                Binary = charenc.Binary;

            // Public API
            var SHA1 = C.SHA1 = function(message, options) {
                var digestbytes = util.wordsToBytes(SHA1._sha1(message));
                return options && options.asBytes ? digestbytes :
                    options && options.asString ? Binary.bytesToString(digestbytes) :
                    util.bytesToHex(digestbytes);
            };

            // The core
            SHA1._sha1 = function(message) {

                // Convert to byte array
                if (message.constructor == String) message = UTF8.stringToBytes(message);
                /* else, assume byte array already */

                var m = util.bytesToWords(message),
                    l = message.length * 8,
                    w = [],
                    H0 = 1732584193,
                    H1 = -271733879,
                    H2 = -1732584194,
                    H3 = 271733878,
                    H4 = -1009589776;

                // Padding
                m[l >> 5] |= 0x80 << (24 - l % 32);
                m[((l + 64 >>> 9) << 4) + 15] = l;

                for (var i = 0; i < m.length; i += 16) {

                    var a = H0,
                        b = H1,
                        c = H2,
                        d = H3,
                        e = H4;

                    for (var j = 0; j < 80; j++) {

                        if (j < 16) w[j] = m[i + j];
                        else {
                            var n = w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16];
                            w[j] = (n << 1) | (n >>> 31);
                        }

                        var t = ((H0 << 5) | (H0 >>> 27)) + H4 + (w[j] >>> 0) + (
                            j < 20 ? (H1 & H2 | ~H1 & H3) + 1518500249 :
                            j < 40 ? (H1 ^ H2 ^ H3) + 1859775393 :
                            j < 60 ? (H1 & H2 | H1 & H3 | H2 & H3) - 1894007588 :
                            (H1 ^ H2 ^ H3) - 899497514);

                        H4 = H3;
                        H3 = H2;
                        H2 = (H1 << 30) | (H1 >>> 2);
                        H1 = H0;
                        H0 = t;

                    }

                    H0 += a;
                    H1 += b;
                    H2 += c;
                    H3 += d;
                    H4 += e;

                }

                return [H0, H1, H2, H3, H4];

            };

            // Package private blocksize
            SHA1._blocksize = 16;

            SHA1._digestsize = 20;

        })();

        //Added to make PKBDF2 work
        /*
         * Crypto-JS v2.5.4
         * http://code.google.com/p/crypto-js/
         * (c) 2009-2012 by Jeff Mott. All rights reserved.
         * http://code.google.com/p/crypto-js/wiki/License
         */
        (function() {

            // Shortcuts
            var C = Crypto,
                util = C.util,
                charenc = C.charenc,
                UTF8 = charenc.UTF8,
                Binary = charenc.Binary;

            C.HMAC = function(hasher, message, key, options) {

                // Convert to byte arrays
                if (message.constructor == String) message = UTF8.stringToBytes(message);
                if (key.constructor == String) key = UTF8.stringToBytes(key);
                /* else, assume byte arrays already */

                // Allow arbitrary length keys
                if (key.length > hasher._blocksize * 4)
                    key = hasher(key, {
                        asBytes: true
                    });

                // XOR keys with pad constants
                var okey = key.slice(0),
                    ikey = key.slice(0);
                for (var i = 0; i < hasher._blocksize * 4; i++) {
                    okey[i] ^= 0x5C;
                    ikey[i] ^= 0x36;
                }

                var hmacbytes = hasher(okey.concat(hasher(ikey.concat(message), {
                    asBytes: true
                })), {
                    asBytes: true
                });

                return options && options.asBytes ? hmacbytes :
                    options && options.asString ? Binary.bytesToString(hmacbytes) :
                    util.bytesToHex(hmacbytes);

            };

        })();


        //crypto-sha256-hmac.js
        /*
         * Crypto-JS v2.5.4
         * http://code.google.com/p/crypto-js/
         * (c) 2009-2012 by Jeff Mott. All rights reserved.
         * http://code.google.com/p/crypto-js/wiki/License
         */
        (function() {
            var d = Crypto,
                k = d.util,
                g = d.charenc,
                b = g.UTF8,
                a = g.Binary,
                c = [1116352408, 1899447441, 3049323471, 3921009573, 961987163, 1508970993, 2453635748, 2870763221,
                    3624381080, 310598401, 607225278, 1426881987, 1925078388, 2162078206, 2614888103, 3248222580,
                    3835390401, 4022224774, 264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986,
                    2554220882, 2821834349, 2952996808, 3210313671, 3336571891, 3584528711, 113926993, 338241895,
                    666307205, 773529912, 1294757372, 1396182291, 1695183700, 1986661051, 2177026350, 2456956037,
                    2730485921,
                    2820302411, 3259730800, 3345764771, 3516065817, 3600352804, 4094571909, 275423344, 430227734,
                    506948616, 659060556, 883997877, 958139571, 1322822218, 1537002063, 1747873779, 1955562222,
                    2024104815, 2227730452, 2361852424, 2428436474, 2756734187, 3204031479, 3329325298
                ],
                e = d.SHA256 = function(b, c) {
                    var f = k.wordsToBytes(e._sha256(b));
                    return c && c.asBytes ? f : c && c.asString ? a.bytesToString(f) : k.bytesToHex(f)
                };
            e._sha256 = function(a) {
                a.constructor == String && (a = b.stringToBytes(a));
                var e = k.bytesToWords(a),
                    f = a.length * 8,
                    a = [1779033703, 3144134277,
                        1013904242, 2773480762, 1359893119, 2600822924, 528734635, 1541459225
                    ],
                    d = [],
                    g, m, r, i, n, o, s, t, h, l, j;
                e[f >> 5] |= 128 << 24 - f % 32;
                e[(f + 64 >> 9 << 4) + 15] = f;
                for (t = 0; t < e.length; t += 16) {
                    f = a[0];
                    g = a[1];
                    m = a[2];
                    r = a[3];
                    i = a[4];
                    n = a[5];
                    o = a[6];
                    s = a[7];
                    for (h = 0; h < 64; h++) {
                        h < 16 ? d[h] = e[h + t] : (l = d[h - 15], j = d[h - 2], d[h] = ((l << 25 | l >>> 7) ^
                            (l << 14 | l >>> 18) ^ l >>> 3) + (d[h - 7] >>> 0) + ((j << 15 | j >>> 17) ^
                            (j << 13 | j >>> 19) ^ j >>> 10) + (d[h - 16] >>> 0));
                        j = f & g ^ f & m ^ g & m;
                        var u = (f << 30 | f >>> 2) ^ (f << 19 | f >>> 13) ^ (f << 10 | f >>> 22);
                        l = (s >>> 0) + ((i << 26 | i >>> 6) ^ (i << 21 | i >>> 11) ^ (i << 7 | i >>> 25)) +
                            (i & n ^ ~i & o) + c[h] + (d[h] >>> 0);
                        j = u + j;
                        s = o;
                        o = n;
                        n = i;
                        i = r + l >>> 0;
                        r = m;
                        m = g;
                        g = f;
                        f = l + j >>> 0
                    }
                    a[0] += f;
                    a[1] += g;
                    a[2] += m;
                    a[3] += r;
                    a[4] += i;
                    a[5] += n;
                    a[6] += o;
                    a[7] += s
                }
                return a
            };
            e._blocksize = 16;
            e._digestsize = 32
        })();
        (function() {
            var d = Crypto,
                k = d.util,
                g = d.charenc,
                b = g.UTF8,
                a = g.Binary;
            d.HMAC = function(c, e, d, g) {
                e.constructor == String && (e = b.stringToBytes(e));
                d.constructor == String && (d = b.stringToBytes(d));
                d.length > c._blocksize * 4 && (d = c(d, {
                    asBytes: !0
                }));
                for (var f = d.slice(0), d = d.slice(0), q = 0; q < c._blocksize * 4; q++) f[q] ^= 92, d[q] ^=
                    54;
                c = c(f.concat(c(d.concat(e), {
                    asBytes: !0
                })), {
                    asBytes: !0
                });
                return g && g.asBytes ? c : g && g.asString ? a.bytesToString(c) : k.bytesToHex(c)
            }
        })();
    })();

    //ripemd160.js
    (function() {

        /*
        CryptoJS v3.1.2
        code.google.com/p/crypto-js
        (c) 2009-2013 by Jeff Mott. All rights reserved.
        code.google.com/p/crypto-js/wiki/License
        */
        /** @preserve
        (c) 2012 by Cédric Mesnil. All rights reserved.
        Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
            - Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
            - Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
        THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
        */

        // Constants table
        var zl = [
            0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
            7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8,
            3, 10, 14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12,
            1, 9, 11, 10, 0, 8, 12, 4, 13, 3, 7, 15, 14, 5, 6, 2,
            4, 0, 5, 9, 7, 12, 2, 10, 14, 1, 3, 8, 11, 6, 15, 13
        ];
        var zr = [
            5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12,
            6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8, 12, 4, 9, 1, 2,
            15, 5, 1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13,
            8, 6, 4, 1, 3, 11, 15, 0, 5, 12, 2, 13, 9, 7, 10, 14,
            12, 15, 10, 4, 1, 5, 8, 7, 6, 2, 13, 14, 0, 3, 9, 11
        ];
        var sl = [
            11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8,
            7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15, 9, 11, 7, 13, 12,
            11, 13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5,
            11, 12, 14, 15, 14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12,
            9, 15, 5, 11, 6, 8, 13, 12, 5, 12, 13, 14, 11, 8, 5, 6
        ];
        var sr = [
            8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6,
            9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12, 7, 6, 15, 13, 11,
            9, 7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 13, 13, 7, 5,
            15, 5, 8, 11, 14, 14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8,
            8, 5, 12, 9, 12, 5, 14, 6, 8, 13, 6, 5, 15, 13, 11, 11
        ];

        var hl = [0x00000000, 0x5A827999, 0x6ED9EBA1, 0x8F1BBCDC, 0xA953FD4E];
        var hr = [0x50A28BE6, 0x5C4DD124, 0x6D703EF3, 0x7A6D76E9, 0x00000000];

        var bytesToWords = function(bytes) {
            var words = [];
            for (var i = 0, b = 0; i < bytes.length; i++, b += 8) {
                words[b >>> 5] |= bytes[i] << (24 - b % 32);
            }
            return words;
        };

        var wordsToBytes = function(words) {
            var bytes = [];
            for (var b = 0; b < words.length * 32; b += 8) {
                bytes.push((words[b >>> 5] >>> (24 - b % 32)) & 0xFF);
            }
            return bytes;
        };

        var processBlock = function(H, M, offset) {

            // Swap endian
            for (var i = 0; i < 16; i++) {
                var offset_i = offset + i;
                var M_offset_i = M[offset_i];

                // Swap
                M[offset_i] = (
                    (((M_offset_i << 8) | (M_offset_i >>> 24)) & 0x00ff00ff) |
                    (((M_offset_i << 24) | (M_offset_i >>> 8)) & 0xff00ff00)
                );
            }

            // Working variables
            var al, bl, cl, dl, el;
            var ar, br, cr, dr, er;

            ar = al = H[0];
            br = bl = H[1];
            cr = cl = H[2];
            dr = dl = H[3];
            er = el = H[4];
            // Computation
            var t;
            for (var i = 0; i < 80; i += 1) {
                t = (al + M[offset + zl[i]]) | 0;
                if (i < 16) {
                    t += f1(bl, cl, dl) + hl[0];
                } else if (i < 32) {
                    t += f2(bl, cl, dl) + hl[1];
                } else if (i < 48) {
                    t += f3(bl, cl, dl) + hl[2];
                } else if (i < 64) {
                    t += f4(bl, cl, dl) + hl[3];
                } else { // if (i<80) {
                    t += f5(bl, cl, dl) + hl[4];
                }
                t = t | 0;
                t = rotl(t, sl[i]);
                t = (t + el) | 0;
                al = el;
                el = dl;
                dl = rotl(cl, 10);
                cl = bl;
                bl = t;

                t = (ar + M[offset + zr[i]]) | 0;
                if (i < 16) {
                    t += f5(br, cr, dr) + hr[0];
                } else if (i < 32) {
                    t += f4(br, cr, dr) + hr[1];
                } else if (i < 48) {
                    t += f3(br, cr, dr) + hr[2];
                } else if (i < 64) {
                    t += f2(br, cr, dr) + hr[3];
                } else { // if (i<80) {
                    t += f1(br, cr, dr) + hr[4];
                }
                t = t | 0;
                t = rotl(t, sr[i]);
                t = (t + er) | 0;
                ar = er;
                er = dr;
                dr = rotl(cr, 10);
                cr = br;
                br = t;
            }
            // Intermediate hash value
            t = (H[1] + cl + dr) | 0;
            H[1] = (H[2] + dl + er) | 0;
            H[2] = (H[3] + el + ar) | 0;
            H[3] = (H[4] + al + br) | 0;
            H[4] = (H[0] + bl + cr) | 0;
            H[0] = t;
        };

        function f1(x, y, z) {
            return ((x) ^ (y) ^ (z));
        }

        function f2(x, y, z) {
            return (((x) & (y)) | ((~x) & (z)));
        }

        function f3(x, y, z) {
            return (((x) | (~(y))) ^ (z));
        }

        function f4(x, y, z) {
            return (((x) & (z)) | ((y) & (~(z))));
        }

        function f5(x, y, z) {
            return ((x) ^ ((y) | (~(z))));
        }

        function rotl(x, n) {
            return (x << n) | (x >>> (32 - n));
        }

        GLOBAL.ripemd160 = function ripemd160(message) {
            var H = [0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476, 0xC3D2E1F0];

            var m = bytesToWords(message);

            var nBitsLeft = message.length * 8;
            var nBitsTotal = message.length * 8;

            // Add padding
            m[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
            m[(((nBitsLeft + 64) >>> 9) << 4) + 14] = (
                (((nBitsTotal << 8) | (nBitsTotal >>> 24)) & 0x00ff00ff) |
                (((nBitsTotal << 24) | (nBitsTotal >>> 8)) & 0xff00ff00)
            );

            for (var i = 0; i < m.length; i += 16) {
                processBlock(H, m, i);
            }

            // Swap endian
            for (var i = 0; i < 5; i++) {
                // Shortcut
                var H_i = H[i];

                // Swap
                H[i] = (((H_i << 8) | (H_i >>> 24)) & 0x00ff00ff) |
                    (((H_i << 24) | (H_i >>> 8)) & 0xff00ff00);
            }

            var digestbytes = wordsToBytes(H);
            return digestbytes;
        }
    })();

    //BigInteger.js
    (function() {
        // Upstream 'BigInteger' here:
        // Original Author: http://www-cs-students.stanford.edu/~tjw/jsbn/
        // Follows 'jsbn' on Github: https://github.com/jasondavies/jsbn
        // Review and Testing: https://github.com/cryptocoinjs/bigi/
        /*!
         * Basic JavaScript BN library - subset useful for RSA encryption. v1.4
         *
         * Copyright (c) 2005  Tom Wu
         * All Rights Reserved.
         * BSD License
         * http://www-cs-students.stanford.edu/~tjw/jsbn/LICENSE
         *
         * Copyright Stephan Thomas
         * Copyright pointbiz
         */

        // (public) Constructor function of Global BigInteger object
        var BigInteger = GLOBAL.BigInteger = function BigInteger(a, b, c) {
            if (!(this instanceof BigInteger))
                return new BigInteger(a, b, c);

            if (a != null)
                if ("number" == typeof a) this.fromNumber(a, b, c);
                else if (b == null && "string" != typeof a) this.fromString(a, 256);
            else this.fromString(a, b);
        };

        // Bits per digit
        var dbits;

        // JavaScript engine analysis
        var canary = 0xdeadbeefcafe;
        var j_lm = ((canary & 0xffffff) == 0xefcafe);

        // return new, unset BigInteger
        function nbi() {
            return new BigInteger(null);
        }

        // am: Compute w_j += (x*this_i), propagate carries,
        // c is initial carry, returns final carry.
        // c < 3*dvalue, x < 2*dvalue, this_i < dvalue
        // We need to select the fastest one that works in this environment.

        // am1: use a single mult and divide to get the high bits,
        // max digit bits should be 26 because
        // max internal value = 2*dvalue^2-2*dvalue (< 2^53)
        function am1(i, x, w, j, c, n) {
            while (--n >= 0) {
                var v = x * this[i++] + w[j] + c;
                c = Math.floor(v / 0x4000000);
                w[j++] = v & 0x3ffffff;
            }
            return c;
        }
        // am2 avoids a big mult-and-extract completely.
        // Max digit bits should be <= 30 because we do bitwise ops
        // on values up to 2*hdvalue^2-hdvalue-1 (< 2^31)
        function am2(i, x, w, j, c, n) {
            var xl = x & 0x7fff,
                xh = x >> 15;
            while (--n >= 0) {
                var l = this[i] & 0x7fff;
                var h = this[i++] >> 15;
                var m = xh * l + h * xl;
                l = xl * l + ((m & 0x7fff) << 15) + w[j] + (c & 0x3fffffff);
                c = (l >>> 30) + (m >>> 15) + xh * h + (c >>> 30);
                w[j++] = l & 0x3fffffff;
            }
            return c;
        }
        // Alternately, set max digit bits to 28 since some
        // browsers slow down when dealing with 32-bit numbers.
        function am3(i, x, w, j, c, n) {
            var xl = x & 0x3fff,
                xh = x >> 14;
            while (--n >= 0) {
                var l = this[i] & 0x3fff;
                var h = this[i++] >> 14;
                var m = xh * l + h * xl;
                l = xl * l + ((m & 0x3fff) << 14) + w[j] + c;
                c = (l >> 28) + (m >> 14) + xh * h;
                w[j++] = l & 0xfffffff;
            }
            return c;
        }
        if (j_lm && (navigator.appName == "Microsoft Internet Explorer")) {
            BigInteger.prototype.am = am2;
            dbits = 30;
        } else if (j_lm && (navigator.appName != "Netscape")) {
            BigInteger.prototype.am = am1;
            dbits = 26;
        } else { // Mozilla/Netscape seems to prefer am3
            BigInteger.prototype.am = am3;
            dbits = 28;
        }

        BigInteger.prototype.DB = dbits;
        BigInteger.prototype.DM = ((1 << dbits) - 1);
        BigInteger.prototype.DV = (1 << dbits);

        var BI_FP = 52;
        BigInteger.prototype.FV = Math.pow(2, BI_FP);
        BigInteger.prototype.F1 = BI_FP - dbits;
        BigInteger.prototype.F2 = 2 * dbits - BI_FP;

        // Digit conversions
        var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
        var BI_RC = new Array();
        var rr, vv;
        rr = "0".charCodeAt(0);
        for (vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
        rr = "a".charCodeAt(0);
        for (vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
        rr = "A".charCodeAt(0);
        for (vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;

        function int2char(n) {
            return BI_RM.charAt(n);
        }

        function intAt(s, i) {
            var c = BI_RC[s.charCodeAt(i)];
            return (c == null) ? -1 : c;
        }



        // return bigint initialized to value
        function nbv(i) {
            var r = nbi();
            r.fromInt(i);
            return r;
        }


        // returns bit length of the integer x
        function nbits(x) {
            var r = 1,
                t;
            if ((t = x >>> 16) != 0) {
                x = t;
                r += 16;
            }
            if ((t = x >> 8) != 0) {
                x = t;
                r += 8;
            }
            if ((t = x >> 4) != 0) {
                x = t;
                r += 4;
            }
            if ((t = x >> 2) != 0) {
                x = t;
                r += 2;
            }
            if ((t = x >> 1) != 0) {
                x = t;
                r += 1;
            }
            return r;
        }







        // (protected) copy this to r
        BigInteger.prototype.copyTo = function(r) {
            for (var i = this.t - 1; i >= 0; --i) r[i] = this[i];
            r.t = this.t;
            r.s = this.s;
        };


        // (protected) set from integer value x, -DV <= x < DV
        BigInteger.prototype.fromInt = function(x) {
            this.t = 1;
            this.s = (x < 0) ? -1 : 0;
            if (x > 0) this[0] = x;
            else if (x < -1) this[0] = x + this.DV;
            else this.t = 0;
        };

        // (protected) set from string and radix
        BigInteger.prototype.fromString = function(s, b) {
            var k;
            if (b == 16) k = 4;
            else if (b == 8) k = 3;
            else if (b == 256) k = 8; // byte array
            else if (b == 2) k = 1;
            else if (b == 32) k = 5;
            else if (b == 4) k = 2;
            else {
                this.fromRadix(s, b);
                return;
            }
            this.t = 0;
            this.s = 0;
            var i = s.length,
                mi = false,
                sh = 0;
            while (--i >= 0) {
                var x = (k == 8) ? s[i] & 0xff : intAt(s, i);
                if (x < 0) {
                    if (s.charAt(i) == "-") mi = true;
                    continue;
                }
                mi = false;
                if (sh == 0)
                    this[this.t++] = x;
                else if (sh + k > this.DB) {
                    this[this.t - 1] |= (x & ((1 << (this.DB - sh)) - 1)) << sh;
                    this[this.t++] = (x >> (this.DB - sh));
                } else
                    this[this.t - 1] |= x << sh;
                sh += k;
                if (sh >= this.DB) sh -= this.DB;
            }
            if (k == 8 && (s[0] & 0x80) != 0) {
                this.s = -1;
                if (sh > 0) this[this.t - 1] |= ((1 << (this.DB - sh)) - 1) << sh;
            }
            this.clamp();
            if (mi) BigInteger.ZERO.subTo(this, this);
        };


        // (protected) clamp off excess high words
        BigInteger.prototype.clamp = function() {
            var c = this.s & this.DM;
            while (this.t > 0 && this[this.t - 1] == c) --this.t;
        };

        // (protected) r = this << n*DB
        BigInteger.prototype.dlShiftTo = function(n, r) {
            var i;
            for (i = this.t - 1; i >= 0; --i) r[i + n] = this[i];
            for (i = n - 1; i >= 0; --i) r[i] = 0;
            r.t = this.t + n;
            r.s = this.s;
        };

        // (protected) r = this >> n*DB
        BigInteger.prototype.drShiftTo = function(n, r) {
            for (var i = n; i < this.t; ++i) r[i - n] = this[i];
            r.t = Math.max(this.t - n, 0);
            r.s = this.s;
        };


        // (protected) r = this << n
        BigInteger.prototype.lShiftTo = function(n, r) {
            var bs = n % this.DB;
            var cbs = this.DB - bs;
            var bm = (1 << cbs) - 1;
            var ds = Math.floor(n / this.DB),
                c = (this.s << bs) & this.DM,
                i;
            for (i = this.t - 1; i >= 0; --i) {
                r[i + ds + 1] = (this[i] >> cbs) | c;
                c = (this[i] & bm) << bs;
            }
            for (i = ds - 1; i >= 0; --i) r[i] = 0;
            r[ds] = c;
            r.t = this.t + ds + 1;
            r.s = this.s;
            r.clamp();
        };


        // (protected) r = this >> n
        BigInteger.prototype.rShiftTo = function(n, r) {
            r.s = this.s;
            var ds = Math.floor(n / this.DB);
            if (ds >= this.t) {
                r.t = 0;
                return;
            }
            var bs = n % this.DB;
            var cbs = this.DB - bs;
            var bm = (1 << bs) - 1;
            r[0] = this[ds] >> bs;
            for (var i = ds + 1; i < this.t; ++i) {
                r[i - ds - 1] |= (this[i] & bm) << cbs;
                r[i - ds] = this[i] >> bs;
            }
            if (bs > 0) r[this.t - ds - 1] |= (this.s & bm) << cbs;
            r.t = this.t - ds;
            r.clamp();
        };


        // (protected) r = this - a
        BigInteger.prototype.subTo = function(a, r) {
            var i = 0,
                c = 0,
                m = Math.min(a.t, this.t);
            while (i < m) {
                c += this[i] - a[i];
                r[i++] = c & this.DM;
                c >>= this.DB;
            }
            if (a.t < this.t) {
                c -= a.s;
                while (i < this.t) {
                    c += this[i];
                    r[i++] = c & this.DM;
                    c >>= this.DB;
                }
                c += this.s;
            } else {
                c += this.s;
                while (i < a.t) {
                    c -= a[i];
                    r[i++] = c & this.DM;
                    c >>= this.DB;
                }
                c -= a.s;
            }
            r.s = (c < 0) ? -1 : 0;
            if (c < -1) r[i++] = this.DV + c;
            else if (c > 0) r[i++] = c;
            r.t = i;
            r.clamp();
        };


        // (protected) r = this * a, r != this,a (HAC 14.12)
        // "this" should be the larger one if appropriate.
        BigInteger.prototype.multiplyTo = function(a, r) {
            var x = this.abs(),
                y = a.abs();
            var i = x.t;
            r.t = i + y.t;
            while (--i >= 0) r[i] = 0;
            for (i = 0; i < y.t; ++i) r[i + x.t] = x.am(0, y[i], r, i, 0, x.t);
            r.s = 0;
            r.clamp();
            if (this.s != a.s) BigInteger.ZERO.subTo(r, r);
        };


        // (protected) r = this^2, r != this (HAC 14.16)
        BigInteger.prototype.squareTo = function(r) {
            var x = this.abs();
            var i = r.t = 2 * x.t;
            while (--i >= 0) r[i] = 0;
            for (i = 0; i < x.t - 1; ++i) {
                var c = x.am(i, x[i], r, 2 * i, 0, 1);
                if ((r[i + x.t] += x.am(i + 1, 2 * x[i], r, 2 * i + 1, c, x.t - i - 1)) >= x.DV) {
                    r[i + x.t] -= x.DV;
                    r[i + x.t + 1] = 1;
                }
            }
            if (r.t > 0) r[r.t - 1] += x.am(i, x[i], r, 2 * i, 0, 1);
            r.s = 0;
            r.clamp();
        };



        // (protected) divide this by m, quotient and remainder to q, r (HAC 14.20)
        // r != q, this != m.  q or r may be null.
        BigInteger.prototype.divRemTo = function(m, q, r) {
            var pm = m.abs();
            if (pm.t <= 0) return;
            var pt = this.abs();
            if (pt.t < pm.t) {
                if (q != null) q.fromInt(0);
                if (r != null) this.copyTo(r);
                return;
            }
            if (r == null) r = nbi();
            var y = nbi(),
                ts = this.s,
                ms = m.s;
            var nsh = this.DB - nbits(pm[pm.t - 1]); // normalize modulus
            if (nsh > 0) {
                pm.lShiftTo(nsh, y);
                pt.lShiftTo(nsh, r);
            } else {
                pm.copyTo(y);
                pt.copyTo(r);
            }
            var ys = y.t;
            var y0 = y[ys - 1];
            if (y0 == 0) return;
            var yt = y0 * (1 << this.F1) + ((ys > 1) ? y[ys - 2] >> this.F2 : 0);
            var d1 = this.FV / yt,
                d2 = (1 << this.F1) / yt,
                e = 1 << this.F2;
            var i = r.t,
                j = i - ys,
                t = (q == null) ? nbi() : q;
            y.dlShiftTo(j, t);
            if (r.compareTo(t) >= 0) {
                r[r.t++] = 1;
                r.subTo(t, r);
            }
            BigInteger.ONE.dlShiftTo(ys, t);
            t.subTo(y, y); // "negative" y so we can replace sub with am later
            while (y.t < ys) y[y.t++] = 0;
            while (--j >= 0) {
                // Estimate quotient digit
                var qd = (r[--i] == y0) ? this.DM : Math.floor(r[i] * d1 + (r[i - 1] + e) * d2);
                if ((r[i] += y.am(0, qd, r, j, 0, ys)) < qd) { // Try it out
                    y.dlShiftTo(j, t);
                    r.subTo(t, r);
                    while (r[i] < --qd) r.subTo(t, r);
                }
            }
            if (q != null) {
                r.drShiftTo(ys, q);
                if (ts != ms) BigInteger.ZERO.subTo(q, q);
            }
            r.t = ys;
            r.clamp();
            if (nsh > 0) r.rShiftTo(nsh, r); // Denormalize remainder
            if (ts < 0) BigInteger.ZERO.subTo(r, r);
        };


        // (protected) return "-1/this % 2^DB"; useful for Mont. reduction
        // justification:
        //         xy == 1 (mod m)
        //         xy =  1+km
        //   xy(2-xy) = (1+km)(1-km)
        // x[y(2-xy)] = 1-k^2m^2
        // x[y(2-xy)] == 1 (mod m^2)
        // if y is 1/x mod m, then y(2-xy) is 1/x mod m^2
        // should reduce x and y(2-xy) by m^2 at each step to keep size bounded.
        // JS multiply "overflows" differently from C/C++, so care is needed here.
        BigInteger.prototype.invDigit = function() {
            if (this.t < 1) return 0;
            var x = this[0];
            if ((x & 1) == 0) return 0;
            var y = x & 3; // y == 1/x mod 2^2
            y = (y * (2 - (x & 0xf) * y)) & 0xf; // y == 1/x mod 2^4
            y = (y * (2 - (x & 0xff) * y)) & 0xff; // y == 1/x mod 2^8
            y = (y * (2 - (((x & 0xffff) * y) & 0xffff))) & 0xffff; // y == 1/x mod 2^16
            // last step - calculate inverse mod DV directly;
            // assumes 16 < DB <= 32 and assumes ability to handle 48-bit ints
            y = (y * (2 - x * y % this.DV)) % this.DV; // y == 1/x mod 2^dbits
            // we really want the negative inverse, and -DV < y < DV
            return (y > 0) ? this.DV - y : -y;
        };


        // (protected) true iff this is even
        BigInteger.prototype.isEven = function() {
            return ((this.t > 0) ? (this[0] & 1) : this.s) == 0;
        };


        // (protected) this^e, e < 2^32, doing sqr and mul with "r" (HAC 14.79)
        BigInteger.prototype.exp = function(e, z) {
            if (e > 0xffffffff || e < 1) return BigInteger.ONE;
            var r = nbi(),
                r2 = nbi(),
                g = z.convert(this),
                i = nbits(e) - 1;
            g.copyTo(r);
            while (--i >= 0) {
                z.sqrTo(r, r2);
                if ((e & (1 << i)) > 0) z.mulTo(r2, g, r);
                else {
                    var t = r;
                    r = r2;
                    r2 = t;
                }
            }
            return z.revert(r);
        };


        // (public) return string representation in given radix
        BigInteger.prototype.toString = function(b) {
            if (this.s < 0) return "-" + this.negate().toString(b);
            var k;
            if (b == 16) k = 4;
            else if (b == 8) k = 3;
            else if (b == 2) k = 1;
            else if (b == 32) k = 5;
            else if (b == 4) k = 2;
            else return this.toRadix(b);
            var km = (1 << k) - 1,
                d, m = false,
                r = "",
                i = this.t;
            var p = this.DB - (i * this.DB) % k;
            if (i-- > 0) {
                if (p < this.DB && (d = this[i] >> p) > 0) {
                    m = true;
                    r = int2char(d);
                }
                while (i >= 0) {
                    if (p < k) {
                        d = (this[i] & ((1 << p) - 1)) << (k - p);
                        d |= this[--i] >> (p += this.DB - k);
                    } else {
                        d = (this[i] >> (p -= k)) & km;
                        if (p <= 0) {
                            p += this.DB;
                            --i;
                        }
                    }
                    if (d > 0) m = true;
                    if (m) r += int2char(d);
                }
            }
            return m ? r : "0";
        };


        // (public) -this
        BigInteger.prototype.negate = function() {
            var r = nbi();
            BigInteger.ZERO.subTo(this, r);
            return r;
        };

        // (public) |this|
        BigInteger.prototype.abs = function() {
            return (this.s < 0) ? this.negate() : this;
        };

        // (public) return + if this > a, - if this < a, 0 if equal
        BigInteger.prototype.compareTo = function(a) {
            var r = this.s - a.s;
            if (r != 0) return r;
            var i = this.t;
            r = i - a.t;
            if (r != 0) return (this.s < 0) ? -r : r;
            while (--i >= 0)
                if ((r = this[i] - a[i]) != 0) return r;
            return 0;
        }

        // (public) return the number of bits in "this"
        BigInteger.prototype.bitLength = function() {
            if (this.t <= 0) return 0;
            return this.DB * (this.t - 1) + nbits(this[this.t - 1] ^ (this.s & this.DM));
        };

        // (public) this mod a
        BigInteger.prototype.mod = function(a) {
            var r = nbi();
            this.abs().divRemTo(a, null, r);
            if (this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r, r);
            return r;
        }

        // (public) this^e % m, 0 <= e < 2^32
        BigInteger.prototype.modPowInt = function(e, m) {
            var z;
            if (e < 256 || m.isEven()) z = new Classic(m);
            else z = new Montgomery(m);
            return this.exp(e, z);
        };

        // "constants"
        BigInteger.ZERO = nbv(0);
        BigInteger.ONE = nbv(1);







        // Copyright (c) 2005-2009  Tom Wu
        // All Rights Reserved.
        // See "LICENSE" for details.
        // Extended JavaScript BN functions, required for RSA private ops.
        // Version 1.1: new BigInteger("0", 10) returns "proper" zero
        // Version 1.2: square() API, isProbablePrime fix


        // return index of lowest 1-bit in x, x < 2^31
        function lbit(x) {
            if (x == 0) return -1;
            var r = 0;
            if ((x & 0xffff) == 0) {
                x >>= 16;
                r += 16;
            }
            if ((x & 0xff) == 0) {
                x >>= 8;
                r += 8;
            }
            if ((x & 0xf) == 0) {
                x >>= 4;
                r += 4;
            }
            if ((x & 3) == 0) {
                x >>= 2;
                r += 2;
            }
            if ((x & 1) == 0) ++r;
            return r;
        }

        // return number of 1 bits in x
        function cbit(x) {
            var r = 0;
            while (x != 0) {
                x &= x - 1;
                ++r;
            }
            return r;
        }

        var lowprimes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83,
            89,
            97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191,
            193,
            197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307,
            311,
            313, 317, 331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419, 421, 431,
            433,
            439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503, 509, 521, 523, 541, 547, 557, 563,
            569,
            571, 577, 587, 593, 599, 601, 607, 613, 617, 619, 631, 641, 643, 647, 653, 659, 661, 673, 677,
            683,
            691, 701, 709, 719, 727, 733, 739, 743, 751, 757, 761, 769, 773, 787, 797, 809, 811, 821, 823,
            827,
            829, 839, 853, 857, 859, 863, 877, 881, 883, 887, 907, 911, 919, 929, 937, 941, 947, 953, 967,
            971,
            977, 983, 991, 997
        ];
        var lplim = (1 << 26) / lowprimes[lowprimes.length - 1];



        // (protected) return x s.t. r^x < DV
        BigInteger.prototype.chunkSize = function(r) {
            return Math.floor(Math.LN2 * this.DB / Math.log(r));
        };

        // (protected) convert to radix string
        BigInteger.prototype.toRadix = function(b) {
            if (b == null) b = 10;
            if (this.signum() == 0 || b < 2 || b > 36) return "0";
            var cs = this.chunkSize(b);
            var a = Math.pow(b, cs);
            var d = nbv(a),
                y = nbi(),
                z = nbi(),
                r = "";
            this.divRemTo(d, y, z);
            while (y.signum() > 0) {
                r = (a + z.intValue()).toString(b).substr(1) + r;
                y.divRemTo(d, y, z);
            }
            return z.intValue().toString(b) + r;
        };

        // (protected) convert from radix string
        BigInteger.prototype.fromRadix = function(s, b) {
            this.fromInt(0);
            if (b == null) b = 10;
            var cs = this.chunkSize(b);
            var d = Math.pow(b, cs),
                mi = false,
                j = 0,
                w = 0;
            for (var i = 0; i < s.length; ++i) {
                var x = intAt(s, i);
                if (x < 0) {
                    if (s.charAt(i) == "-" && this.signum() == 0) mi = true;
                    continue;
                }
                w = b * w + x;
                if (++j >= cs) {
                    this.dMultiply(d);
                    this.dAddOffset(w, 0);
                    j = 0;
                    w = 0;
                }
            }
            if (j > 0) {
                this.dMultiply(Math.pow(b, j));
                this.dAddOffset(w, 0);
            }
            if (mi) BigInteger.ZERO.subTo(this, this);
        };

        // (protected) alternate constructor
        BigInteger.prototype.fromNumber = function(a, b, c) {
            if ("number" == typeof b) {
                // new BigInteger(int,int,RNG)
                if (a < 2) this.fromInt(1);
                else {
                    this.fromNumber(a, c);
                    if (!this.testBit(a - 1)) // force MSB set
                        this.bitwiseTo(BigInteger.ONE.shiftLeft(a - 1), op_or, this);
                    if (this.isEven()) this.dAddOffset(1, 0); // force odd
                    while (!this.isProbablePrime(b)) {
                        this.dAddOffset(2, 0);
                        if (this.bitLength() > a) this.subTo(BigInteger.ONE.shiftLeft(a - 1), this);
                    }
                }
            } else {
                // new BigInteger(int,RNG)
                var x = new Array(),
                    t = a & 7;
                x.length = (a >> 3) + 1;
                b.nextBytes(x);
                if (t > 0) x[0] &= ((1 << t) - 1);
                else x[0] = 0;
                this.fromString(x, 256);
            }
        };

        // (protected) r = this op a (bitwise)
        BigInteger.prototype.bitwiseTo = function(a, op, r) {
            var i, f, m = Math.min(a.t, this.t);
            for (i = 0; i < m; ++i) r[i] = op(this[i], a[i]);
            if (a.t < this.t) {
                f = a.s & this.DM;
                for (i = m; i < this.t; ++i) r[i] = op(this[i], f);
                r.t = this.t;
            } else {
                f = this.s & this.DM;
                for (i = m; i < a.t; ++i) r[i] = op(f, a[i]);
                r.t = a.t;
            }
            r.s = op(this.s, a.s);
            r.clamp();
        };

        // (protected) this op (1<<n)
        BigInteger.prototype.changeBit = function(n, op) {
            var r = BigInteger.ONE.shiftLeft(n);
            this.bitwiseTo(r, op, r);
            return r;
        };

        // (protected) r = this + a
        BigInteger.prototype.addTo = function(a, r) {
            var i = 0,
                c = 0,
                m = Math.min(a.t, this.t);
            while (i < m) {
                c += this[i] + a[i];
                r[i++] = c & this.DM;
                c >>= this.DB;
            }
            if (a.t < this.t) {
                c += a.s;
                while (i < this.t) {
                    c += this[i];
                    r[i++] = c & this.DM;
                    c >>= this.DB;
                }
                c += this.s;
            } else {
                c += this.s;
                while (i < a.t) {
                    c += a[i];
                    r[i++] = c & this.DM;
                    c >>= this.DB;
                }
                c += a.s;
            }
            r.s = (c < 0) ? -1 : 0;
            if (c > 0) r[i++] = c;
            else if (c < -1) r[i++] = this.DV + c;
            r.t = i;
            r.clamp();
        };

        // (protected) this *= n, this >= 0, 1 < n < DV
        BigInteger.prototype.dMultiply = function(n) {
            this[this.t] = this.am(0, n - 1, this, 0, 0, this.t);
            ++this.t;
            this.clamp();
        };

        // (protected) this += n << w words, this >= 0
        BigInteger.prototype.dAddOffset = function(n, w) {
            if (n == 0) return;
            while (this.t <= w) this[this.t++] = 0;
            this[w] += n;
            while (this[w] >= this.DV) {
                this[w] -= this.DV;
                if (++w >= this.t) this[this.t++] = 0;
                ++this[w];
            }
        };

        // (protected) r = lower n words of "this * a", a.t <= n
        // "this" should be the larger one if appropriate.
        BigInteger.prototype.multiplyLowerTo = function(a, n, r) {
            var i = Math.min(this.t + a.t, n);
            r.s = 0; // assumes a,this >= 0
            r.t = i;
            while (i > 0) r[--i] = 0;
            var j;
            for (j = r.t - this.t; i < j; ++i) r[i + this.t] = this.am(0, a[i], r, i, 0, this.t);
            for (j = Math.min(a.t, n); i < j; ++i) this.am(0, a[i], r, i, 0, n - i);
            r.clamp();
        };


        // (protected) r = "this * a" without lower n words, n > 0
        // "this" should be the larger one if appropriate.
        BigInteger.prototype.multiplyUpperTo = function(a, n, r) {
            --n;
            var i = r.t = this.t + a.t - n;
            r.s = 0; // assumes a,this >= 0
            while (--i >= 0) r[i] = 0;
            for (i = Math.max(n - this.t, 0); i < a.t; ++i)
                r[this.t + i - n] = this.am(n - i, a[i], r, 0, 0, this.t + i - n);
            r.clamp();
            r.drShiftTo(1, r);
        };

        // (protected) this % n, n < 2^26
        BigInteger.prototype.modInt = function(n) {
            if (n <= 0) return 0;
            var d = this.DV % n,
                r = (this.s < 0) ? n - 1 : 0;
            if (this.t > 0)
                if (d == 0) r = this[0] % n;
                else
                    for (var i = this.t - 1; i >= 0; --i) r = (d * r + this[i]) % n;
            return r;
        };


        // (protected) true if probably prime (HAC 4.24, Miller-Rabin)
        BigInteger.prototype.millerRabin = function(t) {
            var n1 = this.subtract(BigInteger.ONE);
            var k = n1.getLowestSetBit();
            if (k <= 0) return false;
            var r = n1.shiftRight(k);
            t = (t + 1) >> 1;
            if (t > lowprimes.length) t = lowprimes.length;
            var a = nbi();
            for (var i = 0; i < t; ++i) {
                //Pick bases at random, instead of starting at 2
                a.fromInt(lowprimes[Math.floor(Math.random() * lowprimes.length)]);
                var y = a.modPow(r, this);
                if (y.compareTo(BigInteger.ONE) != 0 && y.compareTo(n1) != 0) {
                    var j = 1;
                    while (j++ < k && y.compareTo(n1) != 0) {
                        y = y.modPowInt(2, this);
                        if (y.compareTo(BigInteger.ONE) == 0) return false;
                    }
                    if (y.compareTo(n1) != 0) return false;
                }
            }
            return true;
        };



        // (public)
        BigInteger.prototype.clone = function() {
            var r = nbi();
            this.copyTo(r);
            return r;
        };

        // (public) return value as integer
        BigInteger.prototype.intValue = function() {
            if (this.s < 0) {
                if (this.t == 1) return this[0] - this.DV;
                else if (this.t == 0) return -1;
            } else if (this.t == 1) return this[0];
            else if (this.t == 0) return 0;
            // assumes 16 < DB < 32
            return ((this[1] & ((1 << (32 - this.DB)) - 1)) << this.DB) | this[0];
        };


        // (public) return value as byte
        BigInteger.prototype.byteValue = function() {
            return (this.t == 0) ? this.s : (this[0] << 24) >> 24;
        };

        // (public) return value as short (assumes DB>=16)
        BigInteger.prototype.shortValue = function() {
            return (this.t == 0) ? this.s : (this[0] << 16) >> 16;
        };

        // (public) 0 if this == 0, 1 if this > 0
        BigInteger.prototype.signum = function() {
            if (this.s < 0) return -1;
            else if (this.t <= 0 || (this.t == 1 && this[0] <= 0)) return 0;
            else return 1;
        };


        // (public) convert to bigendian byte array
        BigInteger.prototype.toByteArray = function() {
            var i = this.t,
                r = new Array();
            r[0] = this.s;
            var p = this.DB - (i * this.DB) % 8,
                d, k = 0;
            if (i-- > 0) {
                if (p < this.DB && (d = this[i] >> p) != (this.s & this.DM) >> p)
                    r[k++] = d | (this.s << (this.DB - p));
                while (i >= 0) {
                    if (p < 8) {
                        d = (this[i] & ((1 << p) - 1)) << (8 - p);
                        d |= this[--i] >> (p += this.DB - 8);
                    } else {
                        d = (this[i] >> (p -= 8)) & 0xff;
                        if (p <= 0) {
                            p += this.DB;
                            --i;
                        }
                    }
                    if ((d & 0x80) != 0) d |= -256;
                    if (k == 0 && (this.s & 0x80) != (d & 0x80)) ++k;
                    if (k > 0 || d != this.s) r[k++] = d;
                }
            }
            return r;
        };

        BigInteger.prototype.equals = function(a) {
            return (this.compareTo(a) == 0);
        };
        BigInteger.prototype.min = function(a) {
            return (this.compareTo(a) < 0) ? this : a;
        };
        BigInteger.prototype.max = function(a) {
            return (this.compareTo(a) > 0) ? this : a;
        };

        // (public) this & a
        function op_and(x, y) {
            return x & y;
        }
        BigInteger.prototype.and = function(a) {
            var r = nbi();
            this.bitwiseTo(a, op_and, r);
            return r;
        };

        // (public) this | a
        function op_or(x, y) {
            return x | y;
        }
        BigInteger.prototype.or = function(a) {
            var r = nbi();
            this.bitwiseTo(a, op_or, r);
            return r;
        };

        // (public) this ^ a
        function op_xor(x, y) {
            return x ^ y;
        }
        BigInteger.prototype.xor = function(a) {
            var r = nbi();
            this.bitwiseTo(a, op_xor, r);
            return r;
        };

        // (public) this & ~a
        function op_andnot(x, y) {
            return x & ~y;
        }
        BigInteger.prototype.andNot = function(a) {
            var r = nbi();
            this.bitwiseTo(a, op_andnot, r);
            return r;
        };

        // (public) ~this
        BigInteger.prototype.not = function() {
            var r = nbi();
            for (var i = 0; i < this.t; ++i) r[i] = this.DM & ~this[i];
            r.t = this.t;
            r.s = ~this.s;
            return r;
        };

        // (public) this << n
        BigInteger.prototype.shiftLeft = function(n) {
            var r = nbi();
            if (n < 0) this.rShiftTo(-n, r);
            else this.lShiftTo(n, r);
            return r;
        };

        // (public) this >> n
        BigInteger.prototype.shiftRight = function(n) {
            var r = nbi();
            if (n < 0) this.lShiftTo(-n, r);
            else this.rShiftTo(n, r);
            return r;
        };

        // (public) returns index of lowest 1-bit (or -1 if none)
        BigInteger.prototype.getLowestSetBit = function() {
            for (var i = 0; i < this.t; ++i)
                if (this[i] != 0) return i * this.DB + lbit(this[i]);
            if (this.s < 0) return this.t * this.DB;
            return -1;
        };

        // (public) return number of set bits
        BigInteger.prototype.bitCount = function() {
            var r = 0,
                x = this.s & this.DM;
            for (var i = 0; i < this.t; ++i) r += cbit(this[i] ^ x);
            return r;
        };

        // (public) true iff nth bit is set
        BigInteger.prototype.testBit = function(n) {
            var j = Math.floor(n / this.DB);
            if (j >= this.t) return (this.s != 0);
            return ((this[j] & (1 << (n % this.DB))) != 0);
        };

        // (public) this | (1<<n)
        BigInteger.prototype.setBit = function(n) {
            return this.changeBit(n, op_or);
        };
        // (public) this & ~(1<<n)
        BigInteger.prototype.clearBit = function(n) {
            return this.changeBit(n, op_andnot);
        };
        // (public) this ^ (1<<n)
        BigInteger.prototype.flipBit = function(n) {
            return this.changeBit(n, op_xor);
        };
        // (public) this + a
        BigInteger.prototype.add = function(a) {
            var r = nbi();
            this.addTo(a, r);
            return r;
        };
        // (public) this - a
        BigInteger.prototype.subtract = function(a) {
            var r = nbi();
            this.subTo(a, r);
            return r;
        };
        // (public) this * a
        BigInteger.prototype.multiply = function(a) {
            var r = nbi();
            this.multiplyTo(a, r);
            return r;
        };
        // (public) this / a
        BigInteger.prototype.divide = function(a) {
            var r = nbi();
            this.divRemTo(a, r, null);
            return r;
        };
        // (public) this % a
        BigInteger.prototype.remainder = function(a) {
            var r = nbi();
            this.divRemTo(a, null, r);
            return r;
        };
        // (public) [this/a,this%a]
        BigInteger.prototype.divideAndRemainder = function(a) {
            var q = nbi(),
                r = nbi();
            this.divRemTo(a, q, r);
            return new Array(q, r);
        };

        // (public) this^e % m (HAC 14.85)
        BigInteger.prototype.modPow = function(e, m) {
            var i = e.bitLength(),
                k, r = nbv(1),
                z;
            if (i <= 0) return r;
            else if (i < 18) k = 1;
            else if (i < 48) k = 3;
            else if (i < 144) k = 4;
            else if (i < 768) k = 5;
            else k = 6;
            if (i < 8)
                z = new Classic(m);
            else if (m.isEven())
                z = new Barrett(m);
            else
                z = new Montgomery(m);

            // precomputation
            var g = new Array(),
                n = 3,
                k1 = k - 1,
                km = (1 << k) - 1;
            g[1] = z.convert(this);
            if (k > 1) {
                var g2 = nbi();
                z.sqrTo(g[1], g2);
                while (n <= km) {
                    g[n] = nbi();
                    z.mulTo(g2, g[n - 2], g[n]);
                    n += 2;
                }
            }

            var j = e.t - 1,
                w, is1 = true,
                r2 = nbi(),
                t;
            i = nbits(e[j]) - 1;
            while (j >= 0) {
                if (i >= k1) w = (e[j] >> (i - k1)) & km;
                else {
                    w = (e[j] & ((1 << (i + 1)) - 1)) << (k1 - i);
                    if (j > 0) w |= e[j - 1] >> (this.DB + i - k1);
                }

                n = k;
                while ((w & 1) == 0) {
                    w >>= 1;
                    --n;
                }
                if ((i -= n) < 0) {
                    i += this.DB;
                    --j;
                }
                if (is1) { // ret == 1, don't bother squaring or multiplying it
                    g[w].copyTo(r);
                    is1 = false;
                } else {
                    while (n > 1) {
                        z.sqrTo(r, r2);
                        z.sqrTo(r2, r);
                        n -= 2;
                    }
                    if (n > 0) z.sqrTo(r, r2);
                    else {
                        t = r;
                        r = r2;
                        r2 = t;
                    }
                    z.mulTo(r2, g[w], r);
                }

                while (j >= 0 && (e[j] & (1 << i)) == 0) {
                    z.sqrTo(r, r2);
                    t = r;
                    r = r2;
                    r2 = t;
                    if (--i < 0) {
                        i = this.DB - 1;
                        --j;
                    }
                }
            }
            return z.revert(r);
        };

        // (public) 1/this % m (HAC 14.61)
        BigInteger.prototype.modInverse = function(m) {
            var ac = m.isEven();
            if (this.signum() === 0) throw new Error('division by zero');
            if ((this.isEven() && ac) || m.signum() == 0) return BigInteger.ZERO;
            var u = m.clone(),
                v = this.clone();
            var a = nbv(1),
                b = nbv(0),
                c = nbv(0),
                d = nbv(1);
            while (u.signum() != 0) {
                while (u.isEven()) {
                    u.rShiftTo(1, u);
                    if (ac) {
                        if (!a.isEven() || !b.isEven()) {
                            a.addTo(this, a);
                            b.subTo(m, b);
                        }
                        a.rShiftTo(1, a);
                    } else if (!b.isEven()) b.subTo(m, b);
                    b.rShiftTo(1, b);
                }
                while (v.isEven()) {
                    v.rShiftTo(1, v);
                    if (ac) {
                        if (!c.isEven() || !d.isEven()) {
                            c.addTo(this, c);
                            d.subTo(m, d);
                        }
                        c.rShiftTo(1, c);
                    } else if (!d.isEven()) d.subTo(m, d);
                    d.rShiftTo(1, d);
                }
                if (u.compareTo(v) >= 0) {
                    u.subTo(v, u);
                    if (ac) a.subTo(c, a);
                    b.subTo(d, b);
                } else {
                    v.subTo(u, v);
                    if (ac) c.subTo(a, c);
                    d.subTo(b, d);
                }
            }
            if (v.compareTo(BigInteger.ONE) != 0) return BigInteger.ZERO;
            while (d.compareTo(m) >= 0) d.subTo(m, d);
            while (d.signum() < 0) d.addTo(m, d);
            return d;
        };


        // (public) this^e
        BigInteger.prototype.pow = function(e) {
            return this.exp(e, new NullExp());
        };

        // (public) gcd(this,a) (HAC 14.54)
        BigInteger.prototype.gcd = function(a) {
            var x = (this.s < 0) ? this.negate() : this.clone();
            var y = (a.s < 0) ? a.negate() : a.clone();
            if (x.compareTo(y) < 0) {
                var t = x;
                x = y;
                y = t;
            }
            var i = x.getLowestSetBit(),
                g = y.getLowestSetBit();
            if (g < 0) return x;
            if (i < g) g = i;
            if (g > 0) {
                x.rShiftTo(g, x);
                y.rShiftTo(g, y);
            }
            while (x.signum() > 0) {
                if ((i = x.getLowestSetBit()) > 0) x.rShiftTo(i, x);
                if ((i = y.getLowestSetBit()) > 0) y.rShiftTo(i, y);
                if (x.compareTo(y) >= 0) {
                    x.subTo(y, x);
                    x.rShiftTo(1, x);
                } else {
                    y.subTo(x, y);
                    y.rShiftTo(1, y);
                }
            }
            if (g > 0) y.lShiftTo(g, y);
            return y;
        };

        // (public) test primality with certainty >= 1-.5^t
        BigInteger.prototype.isProbablePrime = function(t) {
            var i, x = this.abs();
            if (x.t == 1 && x[0] <= lowprimes[lowprimes.length - 1]) {
                for (i = 0; i < lowprimes.length; ++i)
                    if (x[0] == lowprimes[i]) return true;
                return false;
            }
            if (x.isEven()) return false;
            i = 1;
            while (i < lowprimes.length) {
                var m = lowprimes[i],
                    j = i + 1;
                while (j < lowprimes.length && m < lplim) m *= lowprimes[j++];
                m = x.modInt(m);
                while (i < j)
                    if (m % lowprimes[i++] == 0) return false;
            }
            return x.millerRabin(t);
        };


        // JSBN-specific extension

        // (public) this^2
        BigInteger.prototype.square = function() {
            var r = nbi();
            this.squareTo(r);
            return r;
        };


        // NOTE: BigInteger interfaces not implemented in jsbn:
        // BigInteger(int signum, byte[] magnitude)
        // double doubleValue()
        // float floatValue()
        // int hashCode()
        // long longValue()
        // static BigInteger valueOf(long val)



        // Copyright Stephan Thomas (start) --- //
        // https://raw.github.com/bitcoinjs/bitcoinjs-lib/07f9d55ccb6abd962efb6befdd37671f85ea4ff9/src/util.js
        // BigInteger monkey patching
        BigInteger.valueOf = nbv;

        /**
         * Returns a byte array representation of the big integer.
         *
         * This returns the absolute of the contained value in big endian
         * form. A value of zero results in an empty array.
         */
        BigInteger.prototype.toByteArrayUnsigned = function() {
            var ba = this.abs().toByteArray();
            if (ba.length) {
                if (ba[0] == 0) {
                    ba = ba.slice(1);
                }
                return ba.map(function(v) {
                    return (v < 0) ? v + 256 : v;
                });
            } else {
                // Empty array, nothing to do
                return ba;
            }
        };

        /**
         * Turns a byte array into a big integer.
         *
         * This function will interpret a byte array as a big integer in big
         * endian notation and ignore leading zeros.
         */
        BigInteger.fromByteArrayUnsigned = function(ba) {
            if (!ba.length) {
                return ba.valueOf(0);
            } else if (ba[0] & 0x80) {
                // Prepend a zero so the BigInteger class doesn't mistake this
                // for a negative integer.
                return new BigInteger([0].concat(ba));
            } else {
                return new BigInteger(ba);
            }
        };

        /**
         * Converts big integer to signed byte representation.
         *
         * The format for this value uses a the most significant bit as a sign
         * bit. If the most significant bit is already occupied by the
         * absolute value, an extra byte is prepended and the sign bit is set
         * there.
         *
         * Examples:
         *
         *      0 =>     0x00
         *      1 =>     0x01
         *     -1 =>     0x81
         *    127 =>     0x7f
         *   -127 =>     0xff
         *    128 =>   0x0080
         *   -128 =>   0x8080
         *    255 =>   0x00ff
         *   -255 =>   0x80ff
         *  16300 =>   0x3fac
         * -16300 =>   0xbfac
         *  62300 => 0x00f35c
         * -62300 => 0x80f35c
         */
        BigInteger.prototype.toByteArraySigned = function() {
            var val = this.abs().toByteArrayUnsigned();
            var neg = this.compareTo(BigInteger.ZERO) < 0;

            if (neg) {
                if (val[0] & 0x80) {
                    val.unshift(0x80);
                } else {
                    val[0] |= 0x80;
                }
            } else {
                if (val[0] & 0x80) {
                    val.unshift(0x00);
                }
            }

            return val;
        };

        /**
         * Parse a signed big integer byte representation.
         *
         * For details on the format please see BigInteger.toByteArraySigned.
         */
        BigInteger.fromByteArraySigned = function(ba) {
            // Check for negative value
            if (ba[0] & 0x80) {
                // Remove sign bit
                ba[0] &= 0x7f;

                return BigInteger.fromByteArrayUnsigned(ba).negate();
            } else {
                return BigInteger.fromByteArrayUnsigned(ba);
            }
        };
        // Copyright Stephan Thomas (end) --- //




        // ****** REDUCTION ******* //

        // Modular reduction using "classic" algorithm
        var Classic = GLOBAL.Classic = function Classic(m) {
            this.m = m;
        }
        Classic.prototype.convert = function(x) {
            if (x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m);
            else return x;
        };
        Classic.prototype.revert = function(x) {
            return x;
        };
        Classic.prototype.reduce = function(x) {
            x.divRemTo(this.m, null, x);
        };
        Classic.prototype.mulTo = function(x, y, r) {
            x.multiplyTo(y, r);
            this.reduce(r);
        };
        Classic.prototype.sqrTo = function(x, r) {
            x.squareTo(r);
            this.reduce(r);
        };





        // Montgomery reduction
        var Montgomery = GLOBAL.Montgomery = function Montgomery(m) {
            this.m = m;
            this.mp = m.invDigit();
            this.mpl = this.mp & 0x7fff;
            this.mph = this.mp >> 15;
            this.um = (1 << (m.DB - 15)) - 1;
            this.mt2 = 2 * m.t;
        }
        // xR mod m
        Montgomery.prototype.convert = function(x) {
            var r = nbi();
            x.abs().dlShiftTo(this.m.t, r);
            r.divRemTo(this.m, null, r);
            if (x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r, r);
            return r;
        }
        // x/R mod m
        Montgomery.prototype.revert = function(x) {
            var r = nbi();
            x.copyTo(r);
            this.reduce(r);
            return r;
        };
        // x = x/R mod m (HAC 14.32)
        Montgomery.prototype.reduce = function(x) {
            while (x.t <= this.mt2) // pad x so am has enough room later
                x[x.t++] = 0;
            for (var i = 0; i < this.m.t; ++i) {
                // faster way of calculating u0 = x[i]*mp mod DV
                var j = x[i] & 0x7fff;
                var u0 = (j * this.mpl + (((j * this.mph + (x[i] >> 15) * this.mpl) & this.um) << 15)) & x.DM;
                // use am to combine the multiply-shift-add into one call
                j = i + this.m.t;
                x[j] += this.m.am(0, u0, x, i, 0, this.m.t);
                // propagate carry
                while (x[j] >= x.DV) {
                    x[j] -= x.DV;
                    x[++j]++;
                }
            }
            x.clamp();
            x.drShiftTo(this.m.t, x);
            if (x.compareTo(this.m) >= 0) x.subTo(this.m, x);
        };
        // r = "xy/R mod m"; x,y != r
        Montgomery.prototype.mulTo = function(x, y, r) {
            x.multiplyTo(y, r);
            this.reduce(r);
        };
        // r = "x^2/R mod m"; x != r
        Montgomery.prototype.sqrTo = function(x, r) {
            x.squareTo(r);
            this.reduce(r);
        };





        // A "null" reducer
        var NullExp = GLOBAL.NullExp = function NullExp() {}
        NullExp.prototype.convert = function(x) {
            return x;
        };
        NullExp.prototype.revert = function(x) {
            return x;
        };
        NullExp.prototype.mulTo = function(x, y, r) {
            x.multiplyTo(y, r);
        };
        NullExp.prototype.sqrTo = function(x, r) {
            x.squareTo(r);
        };





        // Barrett modular reduction
        var Barrett = GLOBAL.Barrett = function Barrett(m) {
            // setup Barrett
            this.r2 = nbi();
            this.q3 = nbi();
            BigInteger.ONE.dlShiftTo(2 * m.t, this.r2);
            this.mu = this.r2.divide(m);
            this.m = m;
        }
        Barrett.prototype.convert = function(x) {
            if (x.s < 0 || x.t > 2 * this.m.t) return x.mod(this.m);
            else if (x.compareTo(this.m) < 0) return x;
            else {
                var r = nbi();
                x.copyTo(r);
                this.reduce(r);
                return r;
            }
        };
        Barrett.prototype.revert = function(x) {
            return x;
        };
        // x = x mod m (HAC 14.42)
        Barrett.prototype.reduce = function(x) {
            x.drShiftTo(this.m.t - 1, this.r2);
            if (x.t > this.m.t + 1) {
                x.t = this.m.t + 1;
                x.clamp();
            }
            this.mu.multiplyUpperTo(this.r2, this.m.t + 1, this.q3);
            this.m.multiplyLowerTo(this.q3, this.m.t + 1, this.r2);
            while (x.compareTo(this.r2) < 0) x.dAddOffset(1, this.m.t + 1);
            x.subTo(this.r2, x);
            while (x.compareTo(this.m) >= 0) x.subTo(this.m, x);
        };
        // r = x*y mod m; x,y != r
        Barrett.prototype.mulTo = function(x, y, r) {
            x.multiplyTo(y, r);
            this.reduce(r);
        };
        // r = x^2 mod m; x != r
        Barrett.prototype.sqrTo = function(x, r) {
            x.squareTo(r);
            this.reduce(r);
        };

        // BigInteger interfaces not implemented in jsbn:

        // BigInteger(int signum, byte[] magnitude)
        // double doubleValue()
        // float floatValue()
        // int hashCode()
        // long longValue()
        // static BigInteger valueOf(long val)
    })();

    //ellipticcurve.js
    (function() {
        /*!
         * Basic Javascript Elliptic Curve implementation
         * Ported loosely from BouncyCastle's Java EC code
         * Only Fp curves implemented for now
         *
         * Copyright Tom Wu, bitaddress.org  BSD License.
         * http://www-cs-students.stanford.edu/~tjw/jsbn/LICENSE
         */
        // Constructor function of Global EllipticCurve object
        var ec = GLOBAL.EllipticCurve = function() {};

        // ----------------
        // ECFieldElementFp constructor
        // q instanceof BigInteger
        // x instanceof BigInteger
        ec.FieldElementFp = function(q, x) {
            this.x = x;
            // TODO if(x.compareTo(q) >= 0) error
            this.q = q;
        };

        ec.FieldElementFp.prototype.equals = function(other) {
            if (other == this) return true;
            return (this.q.equals(other.q) && this.x.equals(other.x));
        };

        ec.FieldElementFp.prototype.toBigInteger = function() {
            return this.x;
        };

        ec.FieldElementFp.prototype.negate = function() {
            return new ec.FieldElementFp(this.q, this.x.negate().mod(this.q));
        };

        ec.FieldElementFp.prototype.add = function(b) {
            return new ec.FieldElementFp(this.q, this.x.add(b.toBigInteger()).mod(this.q));
        };

        ec.FieldElementFp.prototype.subtract = function(b) {
            return new ec.FieldElementFp(this.q, this.x.subtract(b.toBigInteger()).mod(this.q));
        };

        ec.FieldElementFp.prototype.multiply = function(b) {
            return new ec.FieldElementFp(this.q, this.x.multiply(b.toBigInteger()).mod(this.q));
        };

        ec.FieldElementFp.prototype.square = function() {
            return new ec.FieldElementFp(this.q, this.x.square().mod(this.q));
        };

        ec.FieldElementFp.prototype.divide = function(b) {
            return new ec.FieldElementFp(this.q, this.x.multiply(b.toBigInteger().modInverse(this.q)).mod(
                this.q));
        };

        ec.FieldElementFp.prototype.getByteLength = function() {
            return Math.floor((this.toBigInteger().bitLength() + 7) / 8);
        };

        // D.1.4 91
        /**
         * return a sqrt root - the routine verifies that the calculation
         * returns the right value - if none exists it returns null.
         *
         * Copyright (c) 2000 - 2011 The Legion Of The Bouncy Castle (http://www.bouncycastle.org)
         * Ported to JavaScript by bitaddress.org
         */
        ec.FieldElementFp.prototype.sqrt = function() {
            if (!this.q.testBit(0)) throw new Error("even value of q");

            // p mod 4 == 3
            if (this.q.testBit(1)) {
                // z = g^(u+1) + p, p = 4u + 3
                var z = new ec.FieldElementFp(this.q, this.x.modPow(this.q.shiftRight(2).add(BigInteger.ONE),
                    this.q));
                return z.square().equals(this) ? z : null;
            }

            // p mod 4 == 1
            var qMinusOne = this.q.subtract(BigInteger.ONE);
            var legendreExponent = qMinusOne.shiftRight(1);
            if (!(this.x.modPow(legendreExponent, this.q).equals(BigInteger.ONE))) return null;
            var u = qMinusOne.shiftRight(2);
            var k = u.shiftLeft(1).add(BigInteger.ONE);
            var Q = this.x;
            var fourQ = Q.shiftLeft(2).mod(this.q);
            var U, V;

            do {
                var rand = new SecureRandom();
                var P;
                do {
                    P = new BigInteger(this.q.bitLength(), rand);
                }
                while (P.compareTo(this.q) >= 0 || !(P.multiply(P).subtract(fourQ).modPow(legendreExponent,
                        this.q).equals(qMinusOne)));

                var result = ec.FieldElementFp.fastLucasSequence(this.q, P, Q, k);

                U = result[0];
                V = result[1];
                if (V.multiply(V).mod(this.q).equals(fourQ)) {
                    // Integer division by 2, mod q
                    if (V.testBit(0)) {
                        V = V.add(this.q);
                    }
                    V = V.shiftRight(1);
                    return new ec.FieldElementFp(this.q, V);
                }
            }
            while (U.equals(BigInteger.ONE) || U.equals(qMinusOne));

            return null;
        };
        /*!
         * Crypto-JS 2.5.4 BlockModes.js
         * contribution from Simon Greatrix
         */

        (function(C) {

            // Create pad namespace
            var C_pad = C.pad = {};

            // Calculate the number of padding bytes required.
            function _requiredPadding(cipher, message) {
                var blockSizeInBytes = cipher._blocksize * 4;
                var reqd = blockSizeInBytes - message.length % blockSizeInBytes;
                return reqd;
            }

            // Remove padding when the final byte gives the number of padding bytes.
            var _unpadLength = function(cipher, message, alg, padding) {
                var pad = message.pop();
                if (pad == 0) {
                    throw new Error("Invalid zero-length padding specified for " + alg +
                        ". Wrong cipher specification or key used?");
                }
                var maxPad = cipher._blocksize * 4;
                if (pad > maxPad) {
                    throw new Error("Invalid padding length of " + pad +
                        " specified for " + alg +
                        ". Wrong cipher specification or key used?");
                }
                for (var i = 1; i < pad; i++) {
                    var b = message.pop();
                    if (padding != undefined && padding != b) {
                        throw new Error("Invalid padding byte of 0x" + b.toString(16) +
                            " specified for " + alg +
                            ". Wrong cipher specification or key used?");
                    }
                }
            };

            // No-operation padding, used for stream ciphers
            C_pad.NoPadding = {
                pad: function(cipher, message) {},
                unpad: function(cipher, message) {}
            };

            // Zero Padding.
            //
            // If the message is not an exact number of blocks, the final block is
            // completed with 0x00 bytes. There is no unpadding.
            C_pad.ZeroPadding = {
                pad: function(cipher, message) {
                    var blockSizeInBytes = cipher._blocksize * 4;
                    var reqd = message.length % blockSizeInBytes;
                    if (reqd != 0) {
                        for (reqd = blockSizeInBytes - reqd; reqd > 0; reqd--) {
                            message.push(0x00);
                        }
                    }
                },

                unpad: function(cipher, message) {
                    while (message[message.length - 1] == 0) {
                        message.pop();
                    }
                }
            };

            // ISO/IEC 7816-4 padding.
            //
            // Pads the plain text with an 0x80 byte followed by as many 0x00
            // bytes are required to complete the block.
            C_pad.iso7816 = {
                pad: function(cipher, message) {
                    var reqd = _requiredPadding(cipher, message);
                    message.push(0x80);
                    for (; reqd > 1; reqd--) {
                        message.push(0x00);
                    }
                },

                unpad: function(cipher, message) {
                    var padLength;
                    for (padLength = cipher._blocksize * 4; padLength > 0; padLength--) {
                        var b = message.pop();
                        if (b == 0x80) return;
                        if (b != 0x00) {
                            throw new Error("ISO-7816 padding byte must be 0, not 0x" + b.toString(16) +
                                ". Wrong cipher specification or key used?");
                        }
                    }
                    throw new Error(
                        "ISO-7816 padded beyond cipher block size. Wrong cipher specification or key used?"
                    );
                }
            };

            // ANSI X.923 padding
            //
            // The final block is padded with zeros except for the last byte of the
            // last block which contains the number of padding bytes.
            C_pad.ansix923 = {
                pad: function(cipher, message) {
                    var reqd = _requiredPadding(cipher, message);
                    for (var i = 1; i < reqd; i++) {
                        message.push(0x00);
                    }
                    message.push(reqd);
                },

                unpad: function(cipher, message) {
                    _unpadLength(cipher, message, "ANSI X.923", 0);
                }
            };

            // ISO 10126
            //
            // The final block is padded with random bytes except for the last
            // byte of the last block which contains the number of padding bytes.
            C_pad.iso10126 = {
                pad: function(cipher, message) {
                    var reqd = _requiredPadding(cipher, message);
                    for (var i = 1; i < reqd; i++) {
                        message.push(Math.floor(Math.random() * 256));
                    }
                    message.push(reqd);
                },

                unpad: function(cipher, message) {
                    _unpadLength(cipher, message, "ISO 10126", undefined);
                }
            };

            // PKCS7 padding
            //
            // PKCS7 is described in RFC 5652. Padding is in whole bytes. The
            // value of each added byte is the number of bytes that are added,
            // i.e. N bytes, each of value N are added.
            C_pad.pkcs7 = {
                pad: function(cipher, message) {
                    var reqd = _requiredPadding(cipher, message);
                    for (var i = 0; i < reqd; i++) {
                        message.push(reqd);
                    }
                },

                unpad: function(cipher, message) {
                    _unpadLength(cipher, message, "PKCS 7", message[message.length - 1]);
                }
            };

            // Create mode namespace
            var C_mode = C.mode = {};

            /**
             * Mode base "class".
             */
            var Mode = C_mode.Mode = function(padding) {
                if (padding) {
                    this._padding = padding;
                }
            };

            Mode.prototype = {
                encrypt: function(cipher, m, iv) {
                    this._padding.pad(cipher, m);
                    this._doEncrypt(cipher, m, iv);
                },

                decrypt: function(cipher, m, iv) {
                    this._doDecrypt(cipher, m, iv);
                    this._padding.unpad(cipher, m);
                },

                // Default padding
                _padding: C_pad.iso7816
            };


            /**
             * Electronic Code Book mode.
             * 
             * ECB applies the cipher directly against each block of the input.
             * 
             * ECB does not require an initialization vector.
             */
            var ECB = C_mode.ECB = function() {
                // Call parent constructor
                Mode.apply(this, arguments);
            };

            // Inherit from Mode
            var ECB_prototype = ECB.prototype = new Mode;

            // Concrete steps for Mode template
            ECB_prototype._doEncrypt = function(cipher, m, iv) {
                var blockSizeInBytes = cipher._blocksize * 4;
                // Encrypt each block
                for (var offset = 0; offset < m.length; offset += blockSizeInBytes) {
                    cipher._encryptblock(m, offset);
                }
            };
            ECB_prototype._doDecrypt = function(cipher, c, iv) {
                var blockSizeInBytes = cipher._blocksize * 4;
                // Decrypt each block
                for (var offset = 0; offset < c.length; offset += blockSizeInBytes) {
                    cipher._decryptblock(c, offset);
                }
            };

            // ECB never uses an IV
            ECB_prototype.fixOptions = function(options) {
                options.iv = [];
            };


            /**
             * Cipher block chaining
             * 
             * The first block is XORed with the IV. Subsequent blocks are XOR with the
             * previous cipher output.
             */
            var CBC = C_mode.CBC = function() {
                // Call parent constructor
                Mode.apply(this, arguments);
            };

            // Inherit from Mode
            var CBC_prototype = CBC.prototype = new Mode;

            // Concrete steps for Mode template
            CBC_prototype._doEncrypt = function(cipher, m, iv) {
                var blockSizeInBytes = cipher._blocksize * 4;

                // Encrypt each block
                for (var offset = 0; offset < m.length; offset += blockSizeInBytes) {
                    if (offset == 0) {
                        // XOR first block using IV
                        for (var i = 0; i < blockSizeInBytes; i++)
                            m[i] ^= iv[i];
                    } else {
                        // XOR this block using previous crypted block
                        for (var i = 0; i < blockSizeInBytes; i++)
                            m[offset + i] ^= m[offset + i - blockSizeInBytes];
                    }
                    // Encrypt block
                    cipher._encryptblock(m, offset);
                }
            };
            CBC_prototype._doDecrypt = function(cipher, c, iv) {
                var blockSizeInBytes = cipher._blocksize * 4;

                // At the start, the previously crypted block is the IV
                var prevCryptedBlock = iv;

                // Decrypt each block
                for (var offset = 0; offset < c.length; offset += blockSizeInBytes) {
                    // Save this crypted block
                    var thisCryptedBlock = c.slice(offset, offset + blockSizeInBytes);
                    // Decrypt block
                    cipher._decryptblock(c, offset);
                    // XOR decrypted block using previous crypted block
                    for (var i = 0; i < blockSizeInBytes; i++) {
                        c[offset + i] ^= prevCryptedBlock[i];
                    }
                    prevCryptedBlock = thisCryptedBlock;
                }
            };


            /**
             * Cipher feed back
             * 
             * The cipher output is XORed with the plain text to produce the cipher output,
             * which is then fed back into the cipher to produce a bit pattern to XOR the
             * next block with.
             * 
             * This is a stream cipher mode and does not require padding.
             */
            var CFB = C_mode.CFB = function() {
                // Call parent constructor
                Mode.apply(this, arguments);
            };

            // Inherit from Mode
            var CFB_prototype = CFB.prototype = new Mode;

            // Override padding
            CFB_prototype._padding = C_pad.NoPadding;

            // Concrete steps for Mode template
            CFB_prototype._doEncrypt = function(cipher, m, iv) {
                var blockSizeInBytes = cipher._blocksize * 4,
                    keystream = iv.slice(0);

                // Encrypt each byte
                for (var i = 0; i < m.length; i++) {

                    var j = i % blockSizeInBytes;
                    if (j == 0) cipher._encryptblock(keystream, 0);

                    m[i] ^= keystream[j];
                    keystream[j] = m[i];
                }
            };
            CFB_prototype._doDecrypt = function(cipher, c, iv) {
                var blockSizeInBytes = cipher._blocksize * 4,
                    keystream = iv.slice(0);

                // Encrypt each byte
                for (var i = 0; i < c.length; i++) {

                    var j = i % blockSizeInBytes;
                    if (j == 0) cipher._encryptblock(keystream, 0);

                    var b = c[i];
                    c[i] ^= keystream[j];
                    keystream[j] = b;
                }
            };


            /**
             * Output feed back
             * 
             * The cipher repeatedly encrypts its own output. The output is XORed with the
             * plain text to produce the cipher text.
             * 
             * This is a stream cipher mode and does not require padding.
             */
            var OFB = C_mode.OFB = function() {
                // Call parent constructor
                Mode.apply(this, arguments);
            };

            // Inherit from Mode
            var OFB_prototype = OFB.prototype = new Mode;

            // Override padding
            OFB_prototype._padding = C_pad.NoPadding;

            // Concrete steps for Mode template
            OFB_prototype._doEncrypt = function(cipher, m, iv) {

                var blockSizeInBytes = cipher._blocksize * 4,
                    keystream = iv.slice(0);

                // Encrypt each byte
                for (var i = 0; i < m.length; i++) {

                    // Generate keystream
                    if (i % blockSizeInBytes == 0)
                        cipher._encryptblock(keystream, 0);

                    // Encrypt byte
                    m[i] ^= keystream[i % blockSizeInBytes];

                }
            };
            OFB_prototype._doDecrypt = OFB_prototype._doEncrypt;

            /**
             * Counter
             * @author Gergely Risko
             *
             * After every block the last 4 bytes of the IV is increased by one
             * with carry and that IV is used for the next block.
             *
             * This is a stream cipher mode and does not require padding.
             */
            var CTR = C_mode.CTR = function() {
                // Call parent constructor
                Mode.apply(this, arguments);
            };

            // Inherit from Mode
            var CTR_prototype = CTR.prototype = new Mode;

            // Override padding
            CTR_prototype._padding = C_pad.NoPadding;

            CTR_prototype._doEncrypt = function(cipher, m, iv) {
                var blockSizeInBytes = cipher._blocksize * 4;
                var counter = iv.slice(0);

                for (var i = 0; i < m.length;) {
                    // do not lose iv
                    var keystream = counter.slice(0);

                    // Generate keystream for next block
                    cipher._encryptblock(keystream, 0);

                    // XOR keystream with block
                    for (var j = 0; i < m.length && j < blockSizeInBytes; j++, i++) {
                        m[i] ^= keystream[j];
                    }

                    // Increase counter
                    if (++(counter[blockSizeInBytes - 1]) == 256) {
                        counter[blockSizeInBytes - 1] = 0;
                        if (++(counter[blockSizeInBytes - 2]) == 256) {
                            counter[blockSizeInBytes - 2] = 0;
                            if (++(counter[blockSizeInBytes - 3]) == 256) {
                                counter[blockSizeInBytes - 3] = 0;
                                ++(counter[blockSizeInBytes - 4]);
                            }
                        }
                    }
                }
            };
            CTR_prototype._doDecrypt = CTR_prototype._doEncrypt;

        })(Crypto);

        /*!
         * Crypto-JS v2.5.4  PBKDF2.js
         * http://code.google.com/p/crypto-js/
         * Copyright (c) 2009-2013, Jeff Mott. All rights reserved.
         * http://code.google.com/p/crypto-js/wiki/License
         */
        (function() {

            // Shortcuts
            var C = Crypto,
                util = C.util,
                charenc = C.charenc,
                UTF8 = charenc.UTF8,
                Binary = charenc.Binary;

            C.PBKDF2 = function(password, salt, keylen, options) {

                // Convert to byte arrays
                if (password.constructor == String) password = UTF8.stringToBytes(password);
                if (salt.constructor == String) salt = UTF8.stringToBytes(salt);
                /* else, assume byte arrays already */

                // Defaults
                var hasher = options && options.hasher || C.SHA1,
                    iterations = options && options.iterations || 1;

                // Pseudo-random function
                function PRF(password, salt) {
                    return C.HMAC(hasher, salt, password, {
                        asBytes: true
                    });
                }

                // Generate key
                var derivedKeyBytes = [],
                    blockindex = 1;
                while (derivedKeyBytes.length < keylen) {
                    var block = PRF(password, salt.concat(util.wordsToBytes([blockindex])));
                    for (var u = block, i = 1; i < iterations; i++) {
                        u = PRF(password, u);
                        for (var j = 0; j < block.length; j++) block[j] ^= u[j];
                    }
                    derivedKeyBytes = derivedKeyBytes.concat(block);
                    blockindex++;
                }

                // Truncate excess bytes
                derivedKeyBytes.length = keylen;

                return options && options.asBytes ? derivedKeyBytes :
                    options && options.asString ? Binary.bytesToString(derivedKeyBytes) :
                    util.bytesToHex(derivedKeyBytes);

            };

        })();

        /*
         * Copyright (c) 2010-2011 Intalio Pte, All Rights Reserved
         * 
         * Permission is hereby granted, free of charge, to any person obtaining a copy
         * of this software and associated documentation files (the "Software"), to deal
         * in the Software without restriction, including without limitation the rights
         * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
         * copies of the Software, and to permit persons to whom the Software is
         * furnished to do so, subject to the following conditions:
         * 
         * The above copyright notice and this permission notice shall be included in
         * all copies or substantial portions of the Software.
         * 
         * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
         * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
         * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
         * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
         * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
         * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
         * THE SOFTWARE.
         */
        // https://github.com/cheongwy/node-scrypt-js
        (function() {

            var MAX_VALUE = 2147483647;
            var workerUrl = null;

            //function scrypt(byte[] passwd, byte[] salt, int N, int r, int p, int dkLen)
            /*
             * N = Cpu cost
             * r = Memory cost
             * p = parallelization cost
             * 
             */
            GLOBAL.Crypto_scrypt = function(passwd, salt, N, r, p, dkLen, callback) {
                if (N == 0 || (N & (N - 1)) != 0) throw Error("N must be > 0 and a power of 2");

                if (N > MAX_VALUE / 128 / r) throw Error("Parameter N is too large");
                if (r > MAX_VALUE / 128 / p) throw Error("Parameter r is too large");

                var PBKDF2_opts = {
                    iterations: 1,
                    hasher: Crypto.SHA256,
                    asBytes: true
                };

                var B = Crypto.PBKDF2(passwd, salt, p * 128 * r, PBKDF2_opts);

                try {
                    var i = 0;
                    var worksDone = 0;
                    var makeWorker = function() {
                        if (!workerUrl) {
                            var code = '(' + scryptCore.toString() + ')()';
                            var blob;
                            try {
                                blob = new Blob([code], {
                                    type: "text/javascript"
                                });
                            } catch (e) {
                                GLOBAL.BlobBuilder = GLOBAL.BlobBuilder || GLOBAL.WebKitBlobBuilder ||
                                    GLOBAL.MozBlobBuilder ||
                                    GLOBAL.MSBlobBuilder;
                                blob = new BlobBuilder();
                                blob.append(code);
                                blob = blob.getBlob("text/javascript");
                            }
                            workerUrl = URL.createObjectURL(blob);
                        }
                        var worker = new Worker(workerUrl);
                        worker.onmessage = function(event) {
                            var Bi = event.data[0],
                                Bslice = event.data[1];
                            worksDone++;

                            if (i < p) {
                                worker.postMessage([N, r, p, B, i++]);
                            }

                            var length = Bslice.length,
                                destPos = Bi * 128 * r,
                                srcPos = 0;
                            while (length--) {
                                B[destPos++] = Bslice[srcPos++];
                            }

                            if (worksDone == p) {
                                callback(Crypto.PBKDF2(passwd, B, dkLen, PBKDF2_opts));
                            }
                        };
                        return worker;
                    };
                    var workers = [makeWorker(), makeWorker()];
                    workers[0].postMessage([N, r, p, B, i++]);
                    if (p > 1) {
                        workers[1].postMessage([N, r, p, B, i++]);
                    }
                } catch (e) {
                    GLOBAL.setTimeout(function() {
                        scryptCore();
                        callback(Crypto.PBKDF2(passwd, B, dkLen, PBKDF2_opts));
                    }, 0);
                }

                // using this function to enclose everything needed to create a worker (but also invokable directly for synchronous use)
                function scryptCore() {
                    var XY = [],
                        V = [];

                    if (typeof B === 'undefined') {
                        onmessage = function(event) {
                            var data = event.data;
                            var N = data[0],
                                r = data[1],
                                p = data[2],
                                B = data[3],
                                i = data[4];

                            var Bslice = [];
                            arraycopy32(B, i * 128 * r, Bslice, 0, 128 * r);
                            smix(Bslice, 0, r, N, V, XY);

                            postMessage([i, Bslice]);
                        };
                    } else {
                        for (var i = 0; i < p; i++) {
                            smix(B, i * 128 * r, r, N, V, XY);
                        }
                    }

                    function smix(B, Bi, r, N, V, XY) {
                        var Xi = 0;
                        var Yi = 128 * r;
                        var i;

                        arraycopy32(B, Bi, XY, Xi, Yi);

                        for (i = 0; i < N; i++) {
                            arraycopy32(XY, Xi, V, i * Yi, Yi);
                            blockmix_salsa8(XY, Xi, Yi, r);
                        }

                        for (i = 0; i < N; i++) {
                            var j = integerify(XY, Xi, r) & (N - 1);
                            blockxor(V, j * Yi, XY, Xi, Yi);
                            blockmix_salsa8(XY, Xi, Yi, r);
                        }

                        arraycopy32(XY, Xi, B, Bi, Yi);
                    }

                    function blockmix_salsa8(BY, Bi, Yi, r) {
                        var X = [];
                        var i;

                        arraycopy32(BY, Bi + (2 * r - 1) * 64, X, 0, 64);

                        for (i = 0; i < 2 * r; i++) {
                            blockxor(BY, i * 64, X, 0, 64);
                            salsa20_8(X);
                            arraycopy32(X, 0, BY, Yi + (i * 64), 64);
                        }

                        for (i = 0; i < r; i++) {
                            arraycopy32(BY, Yi + (i * 2) * 64, BY, Bi + (i * 64), 64);
                        }

                        for (i = 0; i < r; i++) {
                            arraycopy32(BY, Yi + (i * 2 + 1) * 64, BY, Bi + (i + r) * 64, 64);
                        }
                    }

                    function R(a, b) {
                        return (a << b) | (a >>> (32 - b));
                    }

                    function salsa20_8(B) {
                        var B32 = new Array(32);
                        var x = new Array(32);
                        var i;

                        for (i = 0; i < 16; i++) {
                            B32[i] = (B[i * 4 + 0] & 0xff) << 0;
                            B32[i] |= (B[i * 4 + 1] & 0xff) << 8;
                            B32[i] |= (B[i * 4 + 2] & 0xff) << 16;
                            B32[i] |= (B[i * 4 + 3] & 0xff) << 24;
                        }

                        arraycopy(B32, 0, x, 0, 16);

                        for (i = 8; i > 0; i -= 2) {
                            x[4] ^= R(x[0] + x[12], 7);
                            x[8] ^= R(x[4] + x[0], 9);
                            x[12] ^= R(x[8] + x[4], 13);
                            x[0] ^= R(x[12] + x[8], 18);
                            x[9] ^= R(x[5] + x[1], 7);
                            x[13] ^= R(x[9] + x[5], 9);
                            x[1] ^= R(x[13] + x[9], 13);
                            x[5] ^= R(x[1] + x[13], 18);
                            x[14] ^= R(x[10] + x[6], 7);
                            x[2] ^= R(x[14] + x[10], 9);
                            x[6] ^= R(x[2] + x[14], 13);
                            x[10] ^= R(x[6] + x[2], 18);
                            x[3] ^= R(x[15] + x[11], 7);
                            x[7] ^= R(x[3] + x[15], 9);
                            x[11] ^= R(x[7] + x[3], 13);
                            x[15] ^= R(x[11] + x[7], 18);
                            x[1] ^= R(x[0] + x[3], 7);
                            x[2] ^= R(x[1] + x[0], 9);
                            x[3] ^= R(x[2] + x[1], 13);
                            x[0] ^= R(x[3] + x[2], 18);
                            x[6] ^= R(x[5] + x[4], 7);
                            x[7] ^= R(x[6] + x[5], 9);
                            x[4] ^= R(x[7] + x[6], 13);
                            x[5] ^= R(x[4] + x[7], 18);
                            x[11] ^= R(x[10] + x[9], 7);
                            x[8] ^= R(x[11] + x[10], 9);
                            x[9] ^= R(x[8] + x[11], 13);
                            x[10] ^= R(x[9] + x[8], 18);
                            x[12] ^= R(x[15] + x[14], 7);
                            x[13] ^= R(x[12] + x[15], 9);
                            x[14] ^= R(x[13] + x[12], 13);
                            x[15] ^= R(x[14] + x[13], 18);
                        }

                        for (i = 0; i < 16; ++i) B32[i] = x[i] + B32[i];

                        for (i = 0; i < 16; i++) {
                            var bi = i * 4;
                            B[bi + 0] = (B32[i] >> 0 & 0xff);
                            B[bi + 1] = (B32[i] >> 8 & 0xff);
                            B[bi + 2] = (B32[i] >> 16 & 0xff);
                            B[bi + 3] = (B32[i] >> 24 & 0xff);
                        }
                    }

                    function blockxor(S, Si, D, Di, len) {
                        var i = len >> 6;
                        while (i--) {
                            D[Di++] ^= S[Si++];
                            D[Di++] ^= S[Si++];
                            D[Di++] ^= S[Si++];
                            D[Di++] ^= S[Si++];
                            D[Di++] ^= S[Si++];
                            D[Di++] ^= S[Si++];
                            D[Di++] ^= S[Si++];
                            D[Di++] ^= S[Si++];

                            D[Di++] ^= S[Si++];
                            D[Di++] ^= S[Si++];
                            D[Di++] ^= S[Si++];
                            D[Di++] ^= S[Si++];
                            D[Di++] ^= S[Si++];
                            D[Di++] ^= S[Si++];
                            D[Di++] ^= S[Si++];
                            D[Di++] ^= S[Si++];

                            D[Di++] ^= S[Si++];
                            D[Di++] ^= S[Si++];
                            D[Di++] ^= S[Si++];
                            D[Di++] ^= S[Si++];
                            D[Di++] ^= S[Si++];
                            D[Di++] ^= S[Si++];
                            D[Di++] ^= S[Si++];
                            D[Di++] ^= S[Si++];

                            D[Di++] ^= S[Si++];
                            D[Di++] ^= S[Si++];
                            D[Di++] ^= S[Si++];
                            D[Di++] ^= S[Si++];
                            D[Di++] ^= S[Si++];
                            D[Di++] ^= S[Si++];
                            D[Di++] ^= S[Si++];
                            D[Di++] ^= S[Si++];

                            D[Di++] ^= S[Si++];
                            D[Di++] ^= S[Si++];
                            D[Di++] ^= S[Si++];
                            D[Di++] ^= S[Si++];
                            D[Di++] ^= S[Si++];
                            D[Di++] ^= S[Si++];
                            D[Di++] ^= S[Si++];
                            D[Di++] ^= S[Si++];

                            D[Di++] ^= S[Si++];
                            D[Di++] ^= S[Si++];
                            D[Di++] ^= S[Si++];
                            D[Di++] ^= S[Si++];
                            D[Di++] ^= S[Si++];
                            D[Di++] ^= S[Si++];
                            D[Di++] ^= S[Si++];
                            D[Di++] ^= S[Si++];

                            D[Di++] ^= S[Si++];
                            D[Di++] ^= S[Si++];
                            D[Di++] ^= S[Si++];
                            D[Di++] ^= S[Si++];
                            D[Di++] ^= S[Si++];
                            D[Di++] ^= S[Si++];
                            D[Di++] ^= S[Si++];
                            D[Di++] ^= S[Si++];

                            D[Di++] ^= S[Si++];
                            D[Di++] ^= S[Si++];
                            D[Di++] ^= S[Si++];
                            D[Di++] ^= S[Si++];
                            D[Di++] ^= S[Si++];
                            D[Di++] ^= S[Si++];
                            D[Di++] ^= S[Si++];
                            D[Di++] ^= S[Si++];
                        }
                    }

                    function integerify(B, bi, r) {
                        var n;

                        bi += (2 * r - 1) * 64;

                        n = (B[bi + 0] & 0xff) << 0;
                        n |= (B[bi + 1] & 0xff) << 8;
                        n |= (B[bi + 2] & 0xff) << 16;
                        n |= (B[bi + 3] & 0xff) << 24;

                        return n;
                    }

                    function arraycopy(src, srcPos, dest, destPos, length) {
                        while (length--) {
                            dest[destPos++] = src[srcPos++];
                        }
                    }

                    function arraycopy32(src, srcPos, dest, destPos, length) {
                        var i = length >> 5;
                        while (i--) {
                            dest[destPos++] = src[srcPos++];
                            dest[destPos++] = src[srcPos++];
                            dest[destPos++] = src[srcPos++];
                            dest[destPos++] = src[srcPos++];
                            dest[destPos++] = src[srcPos++];
                            dest[destPos++] = src[srcPos++];
                            dest[destPos++] = src[srcPos++];
                            dest[destPos++] = src[srcPos++];

                            dest[destPos++] = src[srcPos++];
                            dest[destPos++] = src[srcPos++];
                            dest[destPos++] = src[srcPos++];
                            dest[destPos++] = src[srcPos++];
                            dest[destPos++] = src[srcPos++];
                            dest[destPos++] = src[srcPos++];
                            dest[destPos++] = src[srcPos++];
                            dest[destPos++] = src[srcPos++];

                            dest[destPos++] = src[srcPos++];
                            dest[destPos++] = src[srcPos++];
                            dest[destPos++] = src[srcPos++];
                            dest[destPos++] = src[srcPos++];
                            dest[destPos++] = src[srcPos++];
                            dest[destPos++] = src[srcPos++];
                            dest[destPos++] = src[srcPos++];
                            dest[destPos++] = src[srcPos++];

                            dest[destPos++] = src[srcPos++];
                            dest[destPos++] = src[srcPos++];
                            dest[destPos++] = src[srcPos++];
                            dest[destPos++] = src[srcPos++];
                            dest[destPos++] = src[srcPos++];
                            dest[destPos++] = src[srcPos++];
                            dest[destPos++] = src[srcPos++];
                            dest[destPos++] = src[srcPos++];
                        }
                    }
                } // scryptCore
            }; // GLOBAL.Crypto_scrypt
        })();

        /*!
         * Crypto-JS v2.5.4  AES.js
         * http://code.google.com/p/crypto-js/
         * Copyright (c) 2009-2013, Jeff Mott. All rights reserved.
         * http://code.google.com/p/crypto-js/wiki/License
         */
        (function() {

            // Shortcuts
            var C = Crypto,
                util = C.util,
                charenc = C.charenc,
                UTF8 = charenc.UTF8;

            // Precomputed SBOX
            var SBOX = [0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5,
                0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
                0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0,
                0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0,
                0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc,
                0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
                0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a,
                0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75,
                0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0,
                0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84,
                0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b,
                0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
                0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85,
                0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8,
                0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5,
                0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2,
                0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17,
                0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
                0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88,
                0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb,
                0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c,
                0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79,
                0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9,
                0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
                0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6,
                0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
                0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e,
                0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e,
                0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94,
                0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
                0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68,
                0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16
            ];

            // Compute inverse SBOX lookup table
            for (var INVSBOX = [], i = 0; i < 256; i++) INVSBOX[SBOX[i]] = i;

            // Compute multiplication in GF(2^8) lookup tables
            var MULT2 = [],
                MULT3 = [],
                MULT9 = [],
                MULTB = [],
                MULTD = [],
                MULTE = [];

            function xtime(a, b) {
                for (var result = 0, i = 0; i < 8; i++) {
                    if (b & 1) result ^= a;
                    var hiBitSet = a & 0x80;
                    a = (a << 1) & 0xFF;
                    if (hiBitSet) a ^= 0x1b;
                    b >>>= 1;
                }
                return result;
            }

            for (var i = 0; i < 256; i++) {
                MULT2[i] = xtime(i, 2);
                MULT3[i] = xtime(i, 3);
                MULT9[i] = xtime(i, 9);
                MULTB[i] = xtime(i, 0xB);
                MULTD[i] = xtime(i, 0xD);
                MULTE[i] = xtime(i, 0xE);
            }

            // Precomputed RCon lookup
            var RCON = [0x00, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36];

            // Inner state
            var state = [
                    [],
                    [],
                    [],
                    []
                ],
                keylength,
                nrounds,
                keyschedule;

            var AES = C.AES = {

                /**
                 * Public API
                 */

                encrypt: function(message, password, options) {

                    options = options || {};

                    // Determine mode
                    var mode = options.mode || new C.mode.OFB;

                    // Allow mode to override options
                    if (mode.fixOptions) mode.fixOptions(options);

                    var

                        // Convert to bytes if message is a string
                        m = (
                            message.constructor == String ?
                            UTF8.stringToBytes(message) :
                            message
                        ),

                        // Generate random IV
                        iv = options.iv || util.randomBytes(AES._blocksize * 4),

                        // Generate key
                        k = (
                            password.constructor == String ?
                            // Derive key from pass-phrase
                            C.PBKDF2(password, iv, 32, {
                                asBytes: true
                            }) :
                            // else, assume byte array representing cryptographic key
                            password
                        );

                    // Encrypt
                    AES._init(k);
                    mode.encrypt(AES, m, iv);

                    // Return ciphertext
                    m = options.iv ? m : iv.concat(m);
                    return (options && options.asBytes) ? m : util.bytesToBase64(m);

                },

                decrypt: function(ciphertext, password, options) {

                    options = options || {};

                    // Determine mode
                    var mode = options.mode || new C.mode.OFB;

                    // Allow mode to override options
                    if (mode.fixOptions) mode.fixOptions(options);

                    var

                        // Convert to bytes if ciphertext is a string
                        c = (
                            ciphertext.constructor == String ?
                            util.base64ToBytes(ciphertext) :
                            ciphertext
                        ),

                        // Separate IV and message
                        iv = options.iv || c.splice(0, AES._blocksize * 4),

                        // Generate key
                        k = (
                            password.constructor == String ?
                            // Derive key from pass-phrase
                            C.PBKDF2(password, iv, 32, {
                                asBytes: true
                            }) :
                            // else, assume byte array representing cryptographic key
                            password
                        );

                    // Decrypt
                    AES._init(k);
                    mode.decrypt(AES, c, iv);

                    // Return plaintext
                    return (options && options.asBytes) ? c : UTF8.bytesToString(c);

                },


                /**
                 * Package private methods and properties
                 */

                _blocksize: 4,

                _encryptblock: function(m, offset) {

                    // Set input
                    for (var row = 0; row < AES._blocksize; row++) {
                        for (var col = 0; col < 4; col++)
                            state[row][col] = m[offset + col * 4 + row];
                    }

                    // Add round key
                    for (var row = 0; row < 4; row++) {
                        for (var col = 0; col < 4; col++)
                            state[row][col] ^= keyschedule[col][row];
                    }

                    for (var round = 1; round < nrounds; round++) {

                        // Sub bytes
                        for (var row = 0; row < 4; row++) {
                            for (var col = 0; col < 4; col++)
                                state[row][col] = SBOX[state[row][col]];
                        }

                        // Shift rows
                        state[1].push(state[1].shift());
                        state[2].push(state[2].shift());
                        state[2].push(state[2].shift());
                        state[3].unshift(state[3].pop());

                        // Mix columns
                        for (var col = 0; col < 4; col++) {

                            var s0 = state[0][col],
                                s1 = state[1][col],
                                s2 = state[2][col],
                                s3 = state[3][col];

                            state[0][col] = MULT2[s0] ^ MULT3[s1] ^ s2 ^ s3;
                            state[1][col] = s0 ^ MULT2[s1] ^ MULT3[s2] ^ s3;
                            state[2][col] = s0 ^ s1 ^ MULT2[s2] ^ MULT3[s3];
                            state[3][col] = MULT3[s0] ^ s1 ^ s2 ^ MULT2[s3];

                        }

                        // Add round key
                        for (var row = 0; row < 4; row++) {
                            for (var col = 0; col < 4; col++)
                                state[row][col] ^= keyschedule[round * 4 + col][row];
                        }

                    }

                    // Sub bytes
                    for (var row = 0; row < 4; row++) {
                        for (var col = 0; col < 4; col++)
                            state[row][col] = SBOX[state[row][col]];
                    }

                    // Shift rows
                    state[1].push(state[1].shift());
                    state[2].push(state[2].shift());
                    state[2].push(state[2].shift());
                    state[3].unshift(state[3].pop());

                    // Add round key
                    for (var row = 0; row < 4; row++) {
                        for (var col = 0; col < 4; col++)
                            state[row][col] ^= keyschedule[nrounds * 4 + col][row];
                    }

                    // Set output
                    for (var row = 0; row < AES._blocksize; row++) {
                        for (var col = 0; col < 4; col++)
                            m[offset + col * 4 + row] = state[row][col];
                    }

                },

                _decryptblock: function(c, offset) {

                    // Set input
                    for (var row = 0; row < AES._blocksize; row++) {
                        for (var col = 0; col < 4; col++)
                            state[row][col] = c[offset + col * 4 + row];
                    }

                    // Add round key
                    for (var row = 0; row < 4; row++) {
                        for (var col = 0; col < 4; col++)
                            state[row][col] ^= keyschedule[nrounds * 4 + col][row];
                    }

                    for (var round = 1; round < nrounds; round++) {

                        // Inv shift rows
                        state[1].unshift(state[1].pop());
                        state[2].push(state[2].shift());
                        state[2].push(state[2].shift());
                        state[3].push(state[3].shift());

                        // Inv sub bytes
                        for (var row = 0; row < 4; row++) {
                            for (var col = 0; col < 4; col++)
                                state[row][col] = INVSBOX[state[row][col]];
                        }

                        // Add round key
                        for (var row = 0; row < 4; row++) {
                            for (var col = 0; col < 4; col++)
                                state[row][col] ^= keyschedule[(nrounds - round) * 4 + col][row];
                        }

                        // Inv mix columns
                        for (var col = 0; col < 4; col++) {

                            var s0 = state[0][col],
                                s1 = state[1][col],
                                s2 = state[2][col],
                                s3 = state[3][col];

                            state[0][col] = MULTE[s0] ^ MULTB[s1] ^ MULTD[s2] ^ MULT9[s3];
                            state[1][col] = MULT9[s0] ^ MULTE[s1] ^ MULTB[s2] ^ MULTD[s3];
                            state[2][col] = MULTD[s0] ^ MULT9[s1] ^ MULTE[s2] ^ MULTB[s3];
                            state[3][col] = MULTB[s0] ^ MULTD[s1] ^ MULT9[s2] ^ MULTE[s3];

                        }

                    }

                    // Inv shift rows
                    state[1].unshift(state[1].pop());
                    state[2].push(state[2].shift());
                    state[2].push(state[2].shift());
                    state[3].push(state[3].shift());

                    // Inv sub bytes
                    for (var row = 0; row < 4; row++) {
                        for (var col = 0; col < 4; col++)
                            state[row][col] = INVSBOX[state[row][col]];
                    }

                    // Add round key
                    for (var row = 0; row < 4; row++) {
                        for (var col = 0; col < 4; col++)
                            state[row][col] ^= keyschedule[col][row];
                    }

                    // Set output
                    for (var row = 0; row < AES._blocksize; row++) {
                        for (var col = 0; col < 4; col++)
                            c[offset + col * 4 + row] = state[row][col];
                    }

                },


                /**
                 * Private methods
                 */

                _init: function(k) {
                    keylength = k.length / 4;
                    nrounds = keylength + 6;
                    AES._keyexpansion(k);
                },

                // Generate a key schedule
                _keyexpansion: function(k) {

                    keyschedule = [];

                    for (var row = 0; row < keylength; row++) {
                        keyschedule[row] = [
                            k[row * 4],
                            k[row * 4 + 1],
                            k[row * 4 + 2],
                            k[row * 4 + 3]
                        ];
                    }

                    for (var row = keylength; row < AES._blocksize * (nrounds + 1); row++) {

                        var temp = [
                            keyschedule[row - 1][0],
                            keyschedule[row - 1][1],
                            keyschedule[row - 1][2],
                            keyschedule[row - 1][3]
                        ];

                        if (row % keylength == 0) {

                            // Rot word
                            temp.push(temp.shift());

                            // Sub word
                            temp[0] = SBOX[temp[0]];
                            temp[1] = SBOX[temp[1]];
                            temp[2] = SBOX[temp[2]];
                            temp[3] = SBOX[temp[3]];

                            temp[0] ^= RCON[row / keylength];

                        } else if (keylength > 6 && row % keylength == 4) {

                            // Sub word
                            temp[0] = SBOX[temp[0]];
                            temp[1] = SBOX[temp[1]];
                            temp[2] = SBOX[temp[2]];
                            temp[3] = SBOX[temp[3]];

                        }

                        keyschedule[row] = [
                            keyschedule[row - keylength][0] ^ temp[0],
                            keyschedule[row - keylength][1] ^ temp[1],
                            keyschedule[row - keylength][2] ^ temp[2],
                            keyschedule[row - keylength][3] ^ temp[3]
                        ];

                    }

                }

            };

        })();

        /*
         * Copyright (c) 2000 - 2011 The Legion Of The Bouncy Castle (http://www.bouncycastle.org)
         * Ported to JavaScript by bitaddress.org
         */
        ec.FieldElementFp.fastLucasSequence = function(p, P, Q, k) {
            // TODO Research and apply "common-multiplicand multiplication here"

            var n = k.bitLength();
            var s = k.getLowestSetBit();
            var Uh = BigInteger.ONE;
            var Vl = BigInteger.TWO;
            var Vh = P;
            var Ql = BigInteger.ONE;
            var Qh = BigInteger.ONE;

            for (var j = n - 1; j >= s + 1; --j) {
                Ql = Ql.multiply(Qh).mod(p);
                if (k.testBit(j)) {
                    Qh = Ql.multiply(Q).mod(p);
                    Uh = Uh.multiply(Vh).mod(p);
                    Vl = Vh.multiply(Vl).subtract(P.multiply(Ql)).mod(p);
                    Vh = Vh.multiply(Vh).subtract(Qh.shiftLeft(1)).mod(p);
                } else {
                    Qh = Ql;
                    Uh = Uh.multiply(Vl).subtract(Ql).mod(p);
                    Vh = Vh.multiply(Vl).subtract(P.multiply(Ql)).mod(p);
                    Vl = Vl.multiply(Vl).subtract(Ql.shiftLeft(1)).mod(p);
                }
            }

            Ql = Ql.multiply(Qh).mod(p);
            Qh = Ql.multiply(Q).mod(p);
            Uh = Uh.multiply(Vl).subtract(Ql).mod(p);
            Vl = Vh.multiply(Vl).subtract(P.multiply(Ql)).mod(p);
            Ql = Ql.multiply(Qh).mod(p);

            for (var j = 1; j <= s; ++j) {
                Uh = Uh.multiply(Vl).mod(p);
                Vl = Vl.multiply(Vl).subtract(Ql.shiftLeft(1)).mod(p);
                Ql = Ql.multiply(Ql).mod(p);
            }

            return [Uh, Vl];
        };

        // ----------------
        // ECPointFp constructor
        ec.PointFp = function(curve, x, y, z, compressed) {
            this.curve = curve;
            this.x = x;
            this.y = y;
            // Projective coordinates: either zinv == null or z * zinv == 1
            // z and zinv are just BigIntegers, not fieldElements
            if (z == null) {
                this.z = BigInteger.ONE;
            } else {
                this.z = z;
            }
            this.zinv = null;
            // compression flag
            this.compressed = !!compressed;
        };

        ec.PointFp.prototype.getX = function() {
            if (this.zinv == null) {
                this.zinv = this.z.modInverse(this.curve.q);
            }
            var r = this.x.toBigInteger().multiply(this.zinv);
            this.curve.reduce(r);
            return this.curve.fromBigInteger(r);
        };

        ec.PointFp.prototype.getY = function() {
            if (this.zinv == null) {
                this.zinv = this.z.modInverse(this.curve.q);
            }
            var r = this.y.toBigInteger().multiply(this.zinv);
            this.curve.reduce(r);
            return this.curve.fromBigInteger(r);
        };

        ec.PointFp.prototype.equals = function(other) {
            if (other == this) return true;
            if (this.isInfinity()) return other.isInfinity();
            if (other.isInfinity()) return this.isInfinity();
            var u, v;
            // u = Y2 * Z1 - Y1 * Z2
            u = other.y.toBigInteger().multiply(this.z).subtract(this.y.toBigInteger().multiply(other.z)).mod(
                this.curve.q);
            if (!u.equals(BigInteger.ZERO)) return false;
            // v = X2 * Z1 - X1 * Z2
            v = other.x.toBigInteger().multiply(this.z).subtract(this.x.toBigInteger().multiply(other.z)).mod(
                this.curve.q);
            return v.equals(BigInteger.ZERO);
        };

        ec.PointFp.prototype.isInfinity = function() {
            if ((this.x == null) && (this.y == null)) return true;
            return this.z.equals(BigInteger.ZERO) && !this.y.toBigInteger().equals(BigInteger.ZERO);
        };

        ec.PointFp.prototype.negate = function() {
            return new ec.PointFp(this.curve, this.x, this.y.negate(), this.z);
        };

        ec.PointFp.prototype.add = function(b) {
            if (this.isInfinity()) return b;
            if (b.isInfinity()) return this;

            // u = Y2 * Z1 - Y1 * Z2
            var u = b.y.toBigInteger().multiply(this.z).subtract(this.y.toBigInteger().multiply(b.z)).mod(
                this.curve.q);
            // v = X2 * Z1 - X1 * Z2
            var v = b.x.toBigInteger().multiply(this.z).subtract(this.x.toBigInteger().multiply(b.z)).mod(
                this.curve.q);


            if (BigInteger.ZERO.equals(v)) {
                if (BigInteger.ZERO.equals(u)) {
                    return this.twice(); // this == b, so double
                }
                return this.curve.getInfinity(); // this = -b, so infinity
            }

            var THREE = new BigInteger("3");
            var x1 = this.x.toBigInteger();
            var y1 = this.y.toBigInteger();
            var x2 = b.x.toBigInteger();
            var y2 = b.y.toBigInteger();

            var v2 = v.square();
            var v3 = v2.multiply(v);
            var x1v2 = x1.multiply(v2);
            var zu2 = u.square().multiply(this.z);

            // x3 = v * (z2 * (z1 * u^2 - 2 * x1 * v^2) - v^3)
            var x3 = zu2.subtract(x1v2.shiftLeft(1)).multiply(b.z).subtract(v3).multiply(v).mod(this.curve.q);
            // y3 = z2 * (3 * x1 * u * v^2 - y1 * v^3 - z1 * u^3) + u * v^3
            var y3 = x1v2.multiply(THREE).multiply(u).subtract(y1.multiply(v3)).subtract(zu2.multiply(u)).multiply(
                b.z).add(u.multiply(v3)).mod(this.curve.q);
            // z3 = v^3 * z1 * z2
            var z3 = v3.multiply(this.z).multiply(b.z).mod(this.curve.q);

            return new ec.PointFp(this.curve, this.curve.fromBigInteger(x3), this.curve.fromBigInteger(y3),
                z3);
        };

        ec.PointFp.prototype.twice = function() {
            if (this.isInfinity()) return this;
            if (this.y.toBigInteger().signum() == 0) return this.curve.getInfinity();

            // TODO: optimized handling of constants
            var THREE = new BigInteger("3");
            var x1 = this.x.toBigInteger();
            var y1 = this.y.toBigInteger();

            var y1z1 = y1.multiply(this.z);
            var y1sqz1 = y1z1.multiply(y1).mod(this.curve.q);
            var a = this.curve.a.toBigInteger();

            // w = 3 * x1^2 + a * z1^2
            var w = x1.square().multiply(THREE);
            if (!BigInteger.ZERO.equals(a)) {
                w = w.add(this.z.square().multiply(a));
            }
            w = w.mod(this.curve.q);
            //this.curve.reduce(w);
            // x3 = 2 * y1 * z1 * (w^2 - 8 * x1 * y1^2 * z1)
            var x3 = w.square().subtract(x1.shiftLeft(3).multiply(y1sqz1)).shiftLeft(1).multiply(y1z1).mod(
                this.curve.q);
            // y3 = 4 * y1^2 * z1 * (3 * w * x1 - 2 * y1^2 * z1) - w^3
            var y3 = w.multiply(THREE).multiply(x1).subtract(y1sqz1.shiftLeft(1)).shiftLeft(2).multiply(
                y1sqz1).subtract(w.square().multiply(w)).mod(this.curve.q);
            // z3 = 8 * (y1 * z1)^3
            var z3 = y1z1.square().multiply(y1z1).shiftLeft(3).mod(this.curve.q);

            return new ec.PointFp(this.curve, this.curve.fromBigInteger(x3), this.curve.fromBigInteger(y3),
                z3);
        };

        // Simple NAF (Non-Adjacent Form) multiplication algorithm
        // TODO: modularize the multiplication algorithm
        ec.PointFp.prototype.multiply = function(k) {
            if (this.isInfinity()) return this;
            if (k.signum() == 0) return this.curve.getInfinity();

            var e = k;
            var h = e.multiply(new BigInteger("3"));

            var neg = this.negate();
            var R = this;

            var i;
            for (i = h.bitLength() - 2; i > 0; --i) {
                R = R.twice();

                var hBit = h.testBit(i);
                var eBit = e.testBit(i);

                if (hBit != eBit) {
                    R = R.add(hBit ? this : neg);
                }
            }

            return R;
        };

        // Compute this*j + x*k (simultaneous multiplication)
        ec.PointFp.prototype.multiplyTwo = function(j, x, k) {
            var i;
            if (j.bitLength() > k.bitLength())
                i = j.bitLength() - 1;
            else
                i = k.bitLength() - 1;

            var R = this.curve.getInfinity();
            var both = this.add(x);
            while (i >= 0) {
                R = R.twice();
                if (j.testBit(i)) {
                    if (k.testBit(i)) {
                        R = R.add(both);
                    } else {
                        R = R.add(this);
                    }
                } else {
                    if (k.testBit(i)) {
                        R = R.add(x);
                    }
                }
                --i;
            }

            return R;
        };

        // patched by bitaddress.org and Casascius for use with Bitcoin.ECKey
        // patched by coretechs to support compressed public keys
        ec.PointFp.prototype.getEncoded = function(compressed) {
            var x = this.getX().toBigInteger();
            var y = this.getY().toBigInteger();
            var len = 32; // integerToBytes will zero pad if integer is less than 32 bytes. 32 bytes length is required by the Bitcoin protocol.
            var enc = ec.integerToBytes(x, len);

            // when compressed prepend byte depending if y point is even or odd
            if (compressed) {
                if (y.isEven()) {
                    enc.unshift(0x02);
                } else {
                    enc.unshift(0x03);
                }
            } else {
                enc.unshift(0x04);
                enc = enc.concat(ec.integerToBytes(y, len)); // uncompressed public key appends the bytes of the y point
            }
            return enc;
        };

        ec.PointFp.decodeFrom = function(curve, enc) {
            var type = enc[0];
            var dataLen = enc.length - 1;

            // Extract x and y as byte arrays
            var xBa = enc.slice(1, 1 + dataLen / 2);
            var yBa = enc.slice(1 + dataLen / 2, 1 + dataLen);

            // Prepend zero byte to prevent interpretation as negative integer
            xBa.unshift(0);
            yBa.unshift(0);

            // Convert to BigIntegers
            var x = new BigInteger(xBa);
            var y = new BigInteger(yBa);

            // Return point
            return new ec.PointFp(curve, curve.fromBigInteger(x), curve.fromBigInteger(y));
        };

        ec.PointFp.prototype.add2D = function(b) {
            if (this.isInfinity()) return b;
            if (b.isInfinity()) return this;

            if (this.x.equals(b.x)) {
                if (this.y.equals(b.y)) {
                    // this = b, i.e. this must be doubled
                    return this.twice();
                }
                // this = -b, i.e. the result is the point at infinity
                return this.curve.getInfinity();
            }

            var x_x = b.x.subtract(this.x);
            var y_y = b.y.subtract(this.y);
            var gamma = y_y.divide(x_x);

            var x3 = gamma.square().subtract(this.x).subtract(b.x);
            var y3 = gamma.multiply(this.x.subtract(x3)).subtract(this.y);

            return new ec.PointFp(this.curve, x3, y3);
        };

        ec.PointFp.prototype.twice2D = function() {
            if (this.isInfinity()) return this;
            if (this.y.toBigInteger().signum() == 0) {
                // if y1 == 0, then (x1, y1) == (x1, -y1)
                // and hence this = -this and thus 2(x1, y1) == infinity
                return this.curve.getInfinity();
            }

            var TWO = this.curve.fromBigInteger(BigInteger.valueOf(2));
            var THREE = this.curve.fromBigInteger(BigInteger.valueOf(3));
            var gamma = this.x.square().multiply(THREE).add(this.curve.a).divide(this.y.multiply(TWO));

            var x3 = gamma.square().subtract(this.x.multiply(TWO));
            var y3 = gamma.multiply(this.x.subtract(x3)).subtract(this.y);

            return new ec.PointFp(this.curve, x3, y3);
        };

        ec.PointFp.prototype.multiply2D = function(k) {
            if (this.isInfinity()) return this;
            if (k.signum() == 0) return this.curve.getInfinity();

            var e = k;
            var h = e.multiply(new BigInteger("3"));

            var neg = this.negate();
            var R = this;

            var i;
            for (i = h.bitLength() - 2; i > 0; --i) {
                R = R.twice();

                var hBit = h.testBit(i);
                var eBit = e.testBit(i);

                if (hBit != eBit) {
                    R = R.add2D(hBit ? this : neg);
                }
            }

            return R;
        };

        ec.PointFp.prototype.isOnCurve = function() {
            var x = this.getX().toBigInteger();
            var y = this.getY().toBigInteger();
            var a = this.curve.getA().toBigInteger();
            var b = this.curve.getB().toBigInteger();
            var n = this.curve.getQ();
            var lhs = y.multiply(y).mod(n);
            var rhs = x.multiply(x).multiply(x).add(a.multiply(x)).add(b).mod(n);
            return lhs.equals(rhs);
        };

        ec.PointFp.prototype.toString = function() {
            return '(' + this.getX().toBigInteger().toString() + ',' + this.getY().toBigInteger().toString() +
                ')';
        };

        /**
         * Validate an elliptic curve point.
         *
         * See SEC 1, section 3.2.2.1: Elliptic Curve Public Key Validation Primitive
         */
        ec.PointFp.prototype.validate = function() {
            var n = this.curve.getQ();

            // Check Q != O
            if (this.isInfinity()) {
                throw new Error("Point is at infinity.");
            }

            // Check coordinate bounds
            var x = this.getX().toBigInteger();
            var y = this.getY().toBigInteger();
            if (x.compareTo(BigInteger.ONE) < 0 || x.compareTo(n.subtract(BigInteger.ONE)) > 0) {
                throw new Error('x coordinate out of bounds');
            }
            if (y.compareTo(BigInteger.ONE) < 0 || y.compareTo(n.subtract(BigInteger.ONE)) > 0) {
                throw new Error('y coordinate out of bounds');
            }

            // Check y^2 = x^3 + ax + b (mod n)
            if (!this.isOnCurve()) {
                throw new Error("Point is not on the curve.");
            }

            // Check nQ = 0 (Q is a scalar multiple of G)
            if (this.multiply(n).isInfinity()) {
                // TODO: This check doesn't work - fix.
                throw new Error("Point is not a scalar multiple of G.");
            }

            return true;
        };




        // ----------------
        // ECCurveFp constructor
        ec.CurveFp = function(q, a, b) {
            this.q = q;
            this.a = this.fromBigInteger(a);
            this.b = this.fromBigInteger(b);
            this.infinity = new ec.PointFp(this, null, null);
            this.reducer = new Barrett(this.q);
        }

        ec.CurveFp.prototype.getQ = function() {
            return this.q;
        };

        ec.CurveFp.prototype.getA = function() {
            return this.a;
        };

        ec.CurveFp.prototype.getB = function() {
            return this.b;
        };

        ec.CurveFp.prototype.equals = function(other) {
            if (other == this) return true;
            return (this.q.equals(other.q) && this.a.equals(other.a) && this.b.equals(other.b));
        };

        ec.CurveFp.prototype.getInfinity = function() {
            return this.infinity;
        };

        ec.CurveFp.prototype.fromBigInteger = function(x) {
            return new ec.FieldElementFp(this.q, x);
        };

        ec.CurveFp.prototype.reduce = function(x) {
            this.reducer.reduce(x);
        };

        // for now, work with hex strings because they're easier in JS
        // compressed support added by bitaddress.org
        ec.CurveFp.prototype.decodePointHex = function(s) {
            var firstByte = parseInt(s.substr(0, 2), 16);
            switch (firstByte) { // first byte
                case 0:
                    return this.infinity;
                case 2: // compressed
                case 3: // compressed
                    var yTilde = firstByte & 1;
                    var xHex = s.substr(2, s.length - 2);
                    var X1 = new BigInteger(xHex, 16);
                    return this.decompressPoint(yTilde, X1);
                case 4: // uncompressed
                case 6: // hybrid
                case 7: // hybrid
                    var len = (s.length - 2) / 2;
                    var xHex = s.substr(2, len);
                    var yHex = s.substr(len + 2, len);

                    return new ec.PointFp(this,
                        this.fromBigInteger(new BigInteger(xHex, 16)),
                        this.fromBigInteger(new BigInteger(yHex, 16)));

                default: // unsupported
                    return null;
            }
        };

        ec.CurveFp.prototype.encodePointHex = function(p) {
            if (p.isInfinity()) return "00";
            var xHex = p.getX().toBigInteger().toString(16);
            var yHex = p.getY().toBigInteger().toString(16);
            var oLen = this.getQ().toString(16).length;
            if ((oLen % 2) != 0) oLen++;
            while (xHex.length < oLen) {
                xHex = "0" + xHex;
            }
            while (yHex.length < oLen) {
                yHex = "0" + yHex;
            }
            return "04" + xHex + yHex;
        };

        /*
         * Copyright (c) 2000 - 2011 The Legion Of The Bouncy Castle (http://www.bouncycastle.org)
         * Ported to JavaScript by bitaddress.org
         *
         * Number yTilde
         * BigInteger X1
         */
        ec.CurveFp.prototype.decompressPoint = function(yTilde, X1) {
            var x = this.fromBigInteger(X1);
            var alpha = x.multiply(x.square().add(this.getA())).add(this.getB());
            var beta = alpha.sqrt();
            // if we can't find a sqrt we haven't got a point on the curve - run!
            if (beta == null) throw new Error("Invalid point compression");
            var betaValue = beta.toBigInteger();
            var bit0 = betaValue.testBit(0) ? 1 : 0;
            if (bit0 != yTilde) {
                // Use the other root
                beta = this.fromBigInteger(this.getQ().subtract(betaValue));
            }
            return new ec.PointFp(this, x, beta, null, true);
        };


        ec.fromHex = function(s) {
            return new BigInteger(s, 16);
        };

        ec.integerToBytes = function(i, len) {
            var bytes = i.toByteArrayUnsigned();
            if (len < bytes.length) {
                bytes = bytes.slice(bytes.length - len);
            } else
                while (len > bytes.length) {
                    bytes.unshift(0);
                }
            return bytes;
        };


        // Named EC curves
        // ----------------
        // X9ECParameters constructor
        ec.X9Parameters = function(curve, g, n, h) {
            this.curve = curve;
            this.g = g;
            this.n = n;
            this.h = h;
        }
        ec.X9Parameters.prototype.getCurve = function() {
            return this.curve;
        };
        ec.X9Parameters.prototype.getG = function() {
            return this.g;
        };
        ec.X9Parameters.prototype.getN = function() {
            return this.n;
        };
        ec.X9Parameters.prototype.getH = function() {
            return this.h;
        };

        // secp256k1 is the Curve used by Bitcoin
        ec.secNamedCurves = {
            // used by Bitcoin
            "secp256k1": function() {
                // p = 2^256 - 2^32 - 2^9 - 2^8 - 2^7 - 2^6 - 2^4 - 1
                var p = ec.fromHex("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F");
                var a = BigInteger.ZERO;
                var b = ec.fromHex("7");
                var n = ec.fromHex("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141");
                var h = BigInteger.ONE;
                var curve = new ec.CurveFp(p, a, b);
                var G = curve.decodePointHex("04" +
                    "79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798" +
                    "483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8");
                return new ec.X9Parameters(curve, G, n, h);
            }
        };

        // secp256k1 called by Bitcoin's ECKEY
        ec.getSECCurveByName = function(name) {
            if (ec.secNamedCurves[name] == undefined) return null;
            return ec.secNamedCurves[name]();
        }
    })();

})(typeof global !== "undefined" ? global : window);
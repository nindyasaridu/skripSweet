(function (CryptoJS) {

    (function () {
        // Shortcuts
        var C              = CryptoJS;
        var C_lib          = C.lib;
        var StreamCipher   = C_lib.StreamCipher;
        var C_algo         = C.algo;

        /**
         * RC4 stream cipher algorithm.
         */

        // KSA
        var RC4 = C_algo.RC4 = StreamCipher.extend({
            _doReset: function () {
                // Shortcuts
                var key = this._key;
                var keyWords = key.words;
                var keySigBytes = key.sigBytes;

                // len_key = length(key_str)

                console.log(keySigBytes);

                // Init sbox
                var S = this._S = [];
                for (var i = 0; i < 256; i++) {
                    // kalo di paper ada:
                    // key_chr = substr(key_str, (i mod len_key), 1)
                    // key[i]  = ord(key_chr)
                    S[i] = i;
                }

                // Key setup
                // Permutasi sbox
                for (var i = 0, j = 0; i < 256; i++) {
                    var keyByteIndex = i % keySigBytes; // ???
                    var keyByte = (keyWords[keyByteIndex >>> 2] >>> (24 - (keyByteIndex % 4) * 8)) & 0xff; // ???

                    // j = (j + sbox[i] + key[i]) mod 256
                    // keyByte tu k[i] brarti
                    j = (j + S[i] + keyByte) % 256;

                    // Swap sbox[i] with sbox[j]
                    var t = S[i];
                    S[i] = S[j];
                    S[j] = t;
                }

                // Counters
                this._i = this._j = 0;
            },

            _doProcessBlock: function (M, offset) {
                M[offset] ^= generateKeystreamWord.call(this);
            },

            keySize: 256/32,

            ivSize: 0
        });

        // PRGA
        function generateKeystreamWord() {
            // Shortcuts
            var S = this._S;
            var i = this._i;
            var j = this._j;

            // Generate keystream word
            var keystreamWord = 0;
            for (var n = 0; n < 4; n++) { // n < 4 apaandah, HARUSNYA N<=STRLEN PLAINTEKS
                i = (i + 1) % 256; // okesip
                j = (j + S[i]) % 256; // okesip

                // Swap
                var t = S[i];
                S[i] = S[j];
                S[j] = t;

                keystreamWord |= S[(S[i] + S[j]) % 256] << (24 - n * 8); // << (24 - n * 8) apaandah

                // di paper ada:
                // chrteks = substr (plaintext, n-1, 1)
                // ordchr  = ord(chrteks)
                // cipher  = ordchr xor keystream
            }

            // Update counters
            this._i = i;
            this._j = j;

            return keystreamWord;
        }
         
    //     C.RC4 = StreamCipher._createHelper(RC4);

    //     /**
    //      * Modified RC4 stream cipher algorithm.
    //      */
    //     var RC4Drop = C_algo.RC4Drop = RC4.extend({
    //         cfg: RC4.cfg.extend({
    //             drop: 192
    //         }),

    //         _doReset: function () {
    //             RC4._doReset.call(this);

    //             // Drop
    //             for (var i = this.cfg.drop; i > 0; i--) {
    //                 generateKeystreamWord.call(this);
    //             }
    //         }
    //     });
 
    //     var ciphertext = CryptoJS.RC4Drop.encrypt(message, key, cfg);
    //     var plaintext  = CryptoJS.RC4Drop.decrypt(ciphertext, key, cfg);
         
    //     C.RC4Drop = StreamCipher._createHelper(RC4Drop);
    }());

    return CryptoJS.RC4;

});
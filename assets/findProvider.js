;(function (root, factory) {
	if (typeof exports === "object") {
		// CommonJS
		module.exports = exports = factory();
	}
	else if (typeof define === "function" && define.amd) {
		// AMD
		define([], factory);
	}
	else {
		// Global (browser)
		root.CryptoJS = factory();
	}
}(this, function () {

	/*globals window, global, require*/

	/**
	 * CryptoJS core components.
	 */
	var CryptoJS = CryptoJS || (function (Math, undefined) {

	    var crypto;

	    // Native crypto from window (Browser)
	    if (typeof window !== 'undefined' && window.crypto) {
	        crypto = window.crypto;
	    }

	    // Native crypto in web worker (Browser)
	    if (typeof self !== 'undefined' && self.crypto) {
	        crypto = self.crypto;
	    }

	    // Native crypto from worker
	    if (typeof globalThis !== 'undefined' && globalThis.crypto) {
	        crypto = globalThis.crypto;
	    }

	    // Native (experimental IE 11) crypto from window (Browser)
	    if (!crypto && typeof window !== 'undefined' && window.msCrypto) {
	        crypto = window.msCrypto;
	    }

	    // Native crypto from global (NodeJS)
	    if (!crypto && typeof global !== 'undefined' && global.crypto) {
	        crypto = global.crypto;
	    }

	    // Native crypto import via require (NodeJS)
	    if (!crypto && typeof require === 'function') {
	        try {
	            crypto = require('crypto');
	        } catch (err) {}
	    }

	    /*
	     * Cryptographically secure pseudorandom number generator
	     *
	     * As Math.random() is cryptographically not safe to use
	     */
	    var cryptoSecureRandomInt = function () {
	        if (crypto) {
	            // Use getRandomValues method (Browser)
	            if (typeof crypto.getRandomValues === 'function') {
	                try {
	                    return crypto.getRandomValues(new Uint32Array(1))[0];
	                } catch (err) {}
	            }

	            // Use randomBytes method (NodeJS)
	            if (typeof crypto.randomBytes === 'function') {
	                try {
	                    return crypto.randomBytes(4).readInt32LE();
	                } catch (err) {}
	            }
	        }

	        throw new Error('Native crypto module could not be used to get secure random number.');
	    };

	    /*
	     * Local polyfill of Object.create

	     */
	    var create = Object.create || (function () {
	        function F() {}

	        return function (obj) {
	            var subtype;

	            F.prototype = obj;

	            subtype = new F();

	            F.prototype = null;

	            return subtype;
	        };
	    }());

	    /**
	     * CryptoJS namespace.
	     */
	    var C = {};

	    /**
	     * Library namespace.
	     */
	    var C_lib = C.lib = {};

	    /**
	     * Base object for prototypal inheritance.
	     */
	    var Base = C_lib.Base = (function () {


	        return {
	            /**
	             * Creates a new object that inherits from this object.
	             *
	             * @param {Object} overrides Properties to copy into the new object.
	             *
	             * @return {Object} The new object.
	             *
	             * @static
	             *
	             * @example
	             *
	             *     var MyType = CryptoJS.lib.Base.extend({
	             *         field: 'value',
	             *
	             *         method: function () {
	             *         }
	             *     });
	             */
	            extend: function (overrides) {
	                // Spawn
	                var subtype = create(this);

	                // Augment
	                if (overrides) {
	                    subtype.mixIn(overrides);
	                }

	                // Create default initializer
	                if (!subtype.hasOwnProperty('init') || this.init === subtype.init) {
	                    subtype.init = function () {
	                        subtype.$super.init.apply(this, arguments);
	                    };
	                }

	                // Initializer's prototype is the subtype object
	                subtype.init.prototype = subtype;

	                // Reference supertype
	                subtype.$super = this;

	                return subtype;
	            },

	            /**
	             * Extends this object and runs the init method.
	             * Arguments to create() will be passed to init().
	             *
	             * @return {Object} The new object.
	             *
	             * @static
	             *
	             * @example
	             *
	             *     var instance = MyType.create();
	             */
	            create: function () {
	                var instance = this.extend();
	                instance.init.apply(instance, arguments);

	                return instance;
	            },

	            /**
	             * Initializes a newly created object.
	             * Override this method to add some logic when your objects are created.
	             *
	             * @example
	             *
	             *     var MyType = CryptoJS.lib.Base.extend({
	             *         init: function () {
	             *             // ...
	             *         }
	             *     });
	             */
	            init: function () {
	            },

	            /**
	             * Copies properties into this object.
	             *
	             * @param {Object} properties The properties to mix in.
	             *
	             * @example
	             *
	             *     MyType.mixIn({
	             *         field: 'value'
	             *     });
	             */
	            mixIn: function (properties) {
	                for (var propertyName in properties) {
	                    if (properties.hasOwnProperty(propertyName)) {
	                        this[propertyName] = properties[propertyName];
	                    }
	                }

	                // IE won't copy toString using the loop above
	                if (properties.hasOwnProperty('toString')) {
	                    this.toString = properties.toString;
	                }
	            },

	            /**
	             * Creates a copy of this object.
	             *
	             * @return {Object} The clone.
	             *
	             * @example
	             *
	             *     var clone = instance.clone();
	             */
	            clone: function () {
	                return this.init.prototype.extend(this);
	            }
	        };
	    }());

	    /**
	     * An array of 32-bit words.
	     *
	     * @property {Array} words The array of 32-bit words.
	     * @property {number} sigBytes The number of significant bytes in this word array.
	     */
	    var WordArray = C_lib.WordArray = Base.extend({
	        /**
	         * Initializes a newly created word array.
	         *
	         * @param {Array} words (Optional) An array of 32-bit words.
	         * @param {number} sigBytes (Optional) The number of significant bytes in the words.
	         *
	         * @example
	         *
	         *     var wordArray = CryptoJS.lib.WordArray.create();
	         *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607]);
	         *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607], 6);
	         */
	        init: function (words, sigBytes) {
	            words = this.words = words || [];

	            if (sigBytes != undefined) {
	                this.sigBytes = sigBytes;
	            } else {
	                this.sigBytes = words.length * 4;
	            }
	        },

	        /**
	         * Converts this word array to a string.
	         *
	         * @param {Encoder} encoder (Optional) The encoding strategy to use. Default: CryptoJS.enc.Hex
	         *
	         * @return {string} The stringified word array.
	         *
	         * @example
	         *
	         *     var string = wordArray + '';
	         *     var string = wordArray.toString();
	         *     var string = wordArray.toString(CryptoJS.enc.Utf8);
	         */
	        toString: function (encoder) {
	            return (encoder || Hex).stringify(this);
	        },

	        /**
	         * Concatenates a word array to this word array.
	         *
	         * @param {WordArray} wordArray The word array to append.
	         *
	         * @return {WordArray} This word array.
	         *
	         * @example
	         *
	         *     wordArray1.concat(wordArray2);
	         */
	        concat: function (wordArray) {
	            // Shortcuts
	            var thisWords = this.words;
	            var thatWords = wordArray.words;
	            var thisSigBytes = this.sigBytes;
	            var thatSigBytes = wordArray.sigBytes;

	            // Clamp excess bits
	            this.clamp();

	            // Concat
	            if (thisSigBytes % 4) {
	                // Copy one byte at a time
	                for (var i = 0; i < thatSigBytes; i++) {
	                    var thatByte = (thatWords[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
	                    thisWords[(thisSigBytes + i) >>> 2] |= thatByte << (24 - ((thisSigBytes + i) % 4) * 8);
	                }
	            } else {
	                // Copy one word at a time
	                for (var j = 0; j < thatSigBytes; j += 4) {
	                    thisWords[(thisSigBytes + j) >>> 2] = thatWords[j >>> 2];
	                }
	            }
	            this.sigBytes += thatSigBytes;

	            // Chainable
	            return this;
	        },

	        /**
	         * Removes insignificant bits.
	         *
	         * @example
	         *
	         *     wordArray.clamp();
	         */
	        clamp: function () {
	            // Shortcuts
	            var words = this.words;
	            var sigBytes = this.sigBytes;

	            // Clamp
	            words[sigBytes >>> 2] &= 0xffffffff << (32 - (sigBytes % 4) * 8);
	            words.length = Math.ceil(sigBytes / 4);
	        },

	        /**
	         * Creates a copy of this word array.
	         *
	         * @return {WordArray} The clone.
	         *
	         * @example
	         *
	         *     var clone = wordArray.clone();
	         */
	        clone: function () {
	            var clone = Base.clone.call(this);
	            clone.words = this.words.slice(0);

	            return clone;
	        },

	        /**
	         * Creates a word array filled with random bytes.
	         *
	         * @param {number} nBytes The number of random bytes to generate.
	         *
	         * @return {WordArray} The random word array.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var wordArray = CryptoJS.lib.WordArray.random(16);
	         */
	        random: function (nBytes) {
	            var words = [];

	            for (var i = 0; i < nBytes; i += 4) {
	                words.push(cryptoSecureRandomInt());
	            }

	            return new WordArray.init(words, nBytes);
	        }
	    });

	    /**
	     * Encoder namespace.
	     */
	    var C_enc = C.enc = {};

	    /**
	     * Hex encoding strategy.
	     */
	    var Hex = C_enc.Hex = {
	        /**
	         * Converts a word array to a hex string.
	         *
	         * @param {WordArray} wordArray The word array.
	         *
	         * @return {string} The hex string.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var hexString = CryptoJS.enc.Hex.stringify(wordArray);
	         */
	        stringify: function (wordArray) {
	            // Shortcuts
	            var words = wordArray.words;
	            var sigBytes = wordArray.sigBytes;

	            // Convert
	            var hexChars = [];
	            for (var i = 0; i < sigBytes; i++) {
	                var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
	                hexChars.push((bite >>> 4).toString(16));
	                hexChars.push((bite & 0x0f).toString(16));
	            }

	            return hexChars.join('');
	        },

	        /**
	         * Converts a hex string to a word array.
	         *
	         * @param {string} hexStr The hex string.
	         *
	         * @return {WordArray} The word array.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var wordArray = CryptoJS.enc.Hex.parse(hexString);
	         */
	        parse: function (hexStr) {
	            // Shortcut
	            var hexStrLength = hexStr.length;

	            // Convert
	            var words = [];
	            for (var i = 0; i < hexStrLength; i += 2) {
	                words[i >>> 3] |= parseInt(hexStr.substr(i, 2), 16) << (24 - (i % 8) * 4);
	            }

	            return new WordArray.init(words, hexStrLength / 2);
	        }
	    };

	    /**
	     * Latin1 encoding strategy.
	     */
	    var Latin1 = C_enc.Latin1 = {
	        /**
	         * Converts a word array to a Latin1 string.
	         *
	         * @param {WordArray} wordArray The word array.
	         *
	         * @return {string} The Latin1 string.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var latin1String = CryptoJS.enc.Latin1.stringify(wordArray);
	         */
	        stringify: function (wordArray) {
	            // Shortcuts
	            var words = wordArray.words;
	            var sigBytes = wordArray.sigBytes;

	            // Convert
	            var latin1Chars = [];
	            for (var i = 0; i < sigBytes; i++) {
	                var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
	                latin1Chars.push(String.fromCharCode(bite));
	            }

	            return latin1Chars.join('');
	        },

	        /**
	         * Converts a Latin1 string to a word array.
	         *
	         * @param {string} latin1Str The Latin1 string.
	         *
	         * @return {WordArray} The word array.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var wordArray = CryptoJS.enc.Latin1.parse(latin1String);
	         */
	        parse: function (latin1Str) {
	            // Shortcut
	            var latin1StrLength = latin1Str.length;

	            // Convert
	            var words = [];
	            for (var i = 0; i < latin1StrLength; i++) {
	                words[i >>> 2] |= (latin1Str.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
	            }

	            return new WordArray.init(words, latin1StrLength);
	        }
	    };

	    /**
	     * UTF-8 encoding strategy.
	     */
	    var Utf8 = C_enc.Utf8 = {
	        /**
	         * Converts a word array to a UTF-8 string.
	         *
	         * @param {WordArray} wordArray The word array.
	         *
	         * @return {string} The UTF-8 string.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var utf8String = CryptoJS.enc.Utf8.stringify(wordArray);
	         */
	        stringify: function (wordArray) {
	            try {
	                return decodeURIComponent(escape(Latin1.stringify(wordArray)));
	            } catch (e) {
	                throw new Error('Malformed UTF-8 data');
	            }
	        },

	        /**
	         * Converts a UTF-8 string to a word array.
	         *
	         * @param {string} utf8Str The UTF-8 string.
	         *
	         * @return {WordArray} The word array.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var wordArray = CryptoJS.enc.Utf8.parse(utf8String);
	         */
	        parse: function (utf8Str) {
	            return Latin1.parse(unescape(encodeURIComponent(utf8Str)));
	        }
	    };

	    /**
	     * Abstract buffered block algorithm template.
	     *
	     * The property blockSize must be implemented in a concrete subtype.
	     *
	     * @property {number} _minBufferSize The number of blocks that should be kept unprocessed in the buffer. Default: 0
	     */
	    var BufferedBlockAlgorithm = C_lib.BufferedBlockAlgorithm = Base.extend({
	        /**
	         * Resets this block algorithm's data buffer to its initial state.
	         *
	         * @example
	         *
	         *     bufferedBlockAlgorithm.reset();
	         */
	        reset: function () {
	            // Initial values
	            this._data = new WordArray.init();
	            this._nDataBytes = 0;
	        },

	        /**
	         * Adds new data to this block algorithm's buffer.
	         *
	         * @param {WordArray|string} data The data to append. Strings are converted to a WordArray using UTF-8.
	         *
	         * @example
	         *
	         *     bufferedBlockAlgorithm._append('data');
	         *     bufferedBlockAlgorithm._append(wordArray);
	         */
	        _append: function (data) {
	            // Convert string to WordArray, else assume WordArray already
	            if (typeof data == 'string') {
	                data = Utf8.parse(data);
	            }

	            // Append
	            this._data.concat(data);
	            this._nDataBytes += data.sigBytes;
	        },

	        /**
	         * Processes available data blocks.
	         *
	         * This method invokes _doProcessBlock(offset), which must be implemented by a concrete subtype.
	         *
	         * @param {boolean} doFlush Whether all blocks and partial blocks should be processed.
	         *
	         * @return {WordArray} The processed data.
	         *
	         * @example
	         *
	         *     var processedData = bufferedBlockAlgorithm._process();
	         *     var processedData = bufferedBlockAlgorithm._process(!!'flush');
	         */
	        _process: function (doFlush) {
	            var processedWords;

	            // Shortcuts
	            var data = this._data;
	            var dataWords = data.words;
	            var dataSigBytes = data.sigBytes;
	            var blockSize = this.blockSize;
	            var blockSizeBytes = blockSize * 4;

	            // Count blocks ready
	            var nBlocksReady = dataSigBytes / blockSizeBytes;
	            if (doFlush) {
	                // Round up to include partial blocks
	                nBlocksReady = Math.ceil(nBlocksReady);
	            } else {
	                // Round down to include only full blocks,
	                // less the number of blocks that must remain in the buffer
	                nBlocksReady = Math.max((nBlocksReady | 0) - this._minBufferSize, 0);
	            }

	            // Count words ready
	            var nWordsReady = nBlocksReady * blockSize;

	            // Count bytes ready
	            var nBytesReady = Math.min(nWordsReady * 4, dataSigBytes);

	            // Process blocks
	            if (nWordsReady) {
	                for (var offset = 0; offset < nWordsReady; offset += blockSize) {
	                    // Perform concrete-algorithm logic
	                    this._doProcessBlock(dataWords, offset);
	                }

	                // Remove processed words
	                processedWords = dataWords.splice(0, nWordsReady);
	                data.sigBytes -= nBytesReady;
	            }

	            // Return processed words
	            return new WordArray.init(processedWords, nBytesReady);
	        },

	        /**
	         * Creates a copy of this object.
	         *
	         * @return {Object} The clone.
	         *
	         * @example
	         *
	         *     var clone = bufferedBlockAlgorithm.clone();
	         */
	        clone: function () {
	            var clone = Base.clone.call(this);
	            clone._data = this._data.clone();

	            return clone;
	        },

	        _minBufferSize: 0
	    });

	    /**
	     * Abstract hasher template.
	     *
	     * @property {number} blockSize The number of 32-bit words this hasher operates on. Default: 16 (512 bits)
	     */
	    var Hasher = C_lib.Hasher = BufferedBlockAlgorithm.extend({
	        /**
	         * Configuration options.
	         */
	        cfg: Base.extend(),

	        /**
	         * Initializes a newly created hasher.
	         *
	         * @param {Object} cfg (Optional) The configuration options to use for this hash computation.
	         *
	         * @example
	         *
	         *     var hasher = CryptoJS.algo.SHA256.create();
	         */
	        init: function (cfg) {
	            // Apply config defaults
	            this.cfg = this.cfg.extend(cfg);

	            // Set initial values
	            this.reset();
	        },

	        /**
	         * Resets this hasher to its initial state.
	         *
	         * @example
	         *
	         *     hasher.reset();
	         */
	        reset: function () {
	            // Reset data buffer
	            BufferedBlockAlgorithm.reset.call(this);

	            // Perform concrete-hasher logic
	            this._doReset();
	        },

	        /**
	         * Updates this hasher with a message.
	         *
	         * @param {WordArray|string} messageUpdate The message to append.
	         *
	         * @return {Hasher} This hasher.
	         *
	         * @example
	         *
	         *     hasher.update('message');
	         *     hasher.update(wordArray);
	         */
	        update: function (messageUpdate) {
	            // Append
	            this._append(messageUpdate);

	            // Update the hash
	            this._process();

	            // Chainable
	            return this;
	        },

	        /**
	         * Finalizes the hash computation.
	         * Note that the finalize operation is effectively a destructive, read-once operation.
	         *
	         * @param {WordArray|string} messageUpdate (Optional) A final message update.
	         *
	         * @return {WordArray} The hash.
	         *
	         * @example
	         *
	         *     var hash = hasher.finalize();
	         *     var hash = hasher.finalize('message');
	         *     var hash = hasher.finalize(wordArray);
	         */
	        finalize: function (messageUpdate) {
	            // Final message update
	            if (messageUpdate) {
	                this._append(messageUpdate);
	            }

	            // Perform concrete-hasher logic
	            var hash = this._doFinalize();

	            return hash;
	        },

	        blockSize: 512/32,

	        /**
	         * Creates a shortcut function to a hasher's object interface.
	         *
	         * @param {Hasher} hasher The hasher to create a helper for.
	         *
	         * @return {Function} The shortcut function.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var SHA256 = CryptoJS.lib.Hasher._createHelper(CryptoJS.algo.SHA256);
	         */
	        _createHelper: function (hasher) {
	            return function (message, cfg) {
	                return new hasher.init(cfg).finalize(message);
	            };
	        },

	        /**
	         * Creates a shortcut function to the HMAC's object interface.
	         *
	         * @param {Hasher} hasher The hasher to use in this HMAC helper.
	         *
	         * @return {Function} The shortcut function.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var HmacSHA256 = CryptoJS.lib.Hasher._createHmacHelper(CryptoJS.algo.SHA256);
	         */
	        _createHmacHelper: function (hasher) {
	            return function (message, key) {
	                return new C_algo.HMAC.init(hasher, key).finalize(message);
	            };
	        }
	    });

	    /**
	     * Algorithm namespace.
	     */
	    var C_algo = C.algo = {};

	    return C;
	}(Math));


	return CryptoJS;

}));
;(function (root, factory) {
	if (typeof exports === "object") {
		// CommonJS
		module.exports = exports = factory(require("./core"));
	}
	else if (typeof define === "function" && define.amd) {
		// AMD
		define(["./core"], factory);
	}
	else {
		// Global (browser)
		factory(root.CryptoJS);
	}
}(this, function (CryptoJS) {

	(function () {
	    // Shortcuts
	    var C = CryptoJS;
	    var C_lib = C.lib;
	    var WordArray = C_lib.WordArray;
	    var C_enc = C.enc;

	    /**
	     * Base64 encoding strategy.
	     */
	    var Base64 = C_enc.Base64 = {
	        /**
	         * Converts a word array to a Base64 string.
	         *
	         * @param {WordArray} wordArray The word array.
	         *
	         * @return {string} The Base64 string.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var base64String = CryptoJS.enc.Base64.stringify(wordArray);
	         */
	        stringify: function (wordArray) {
	            // Shortcuts
	            var words = wordArray.words;
	            var sigBytes = wordArray.sigBytes;
	            var map = this._map;

	            // Clamp excess bits
	            wordArray.clamp();

	            // Convert
	            var base64Chars = [];
	            for (var i = 0; i < sigBytes; i += 3) {
	                var byte1 = (words[i >>> 2]       >>> (24 - (i % 4) * 8))       & 0xff;
	                var byte2 = (words[(i + 1) >>> 2] >>> (24 - ((i + 1) % 4) * 8)) & 0xff;
	                var byte3 = (words[(i + 2) >>> 2] >>> (24 - ((i + 2) % 4) * 8)) & 0xff;

	                var triplet = (byte1 << 16) | (byte2 << 8) | byte3;

	                for (var j = 0; (j < 4) && (i + j * 0.75 < sigBytes); j++) {
	                    base64Chars.push(map.charAt((triplet >>> (6 * (3 - j))) & 0x3f));
	                }
	            }

	            // Add padding
	            var paddingChar = map.charAt(64);
	            if (paddingChar) {
	                while (base64Chars.length % 4) {
	                    base64Chars.push(paddingChar);
	                }
	            }

	            return base64Chars.join('');
	        },

	        /**
	         * Converts a Base64 string to a word array.
	         *
	         * @param {string} base64Str The Base64 string.
	         *
	         * @return {WordArray} The word array.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var wordArray = CryptoJS.enc.Base64.parse(base64String);
	         */
	        parse: function (base64Str) {
	            // Shortcuts
	            var base64StrLength = base64Str.length;
	            var map = this._map;
	            var reverseMap = this._reverseMap;

	            if (!reverseMap) {
	                    reverseMap = this._reverseMap = [];
	                    for (var j = 0; j < map.length; j++) {
	                        reverseMap[map.charCodeAt(j)] = j;
	                    }
	            }

	            // Ignore padding
	            var paddingChar = map.charAt(64);
	            if (paddingChar) {
	                var paddingIndex = base64Str.indexOf(paddingChar);
	                if (paddingIndex !== -1) {
	                    base64StrLength = paddingIndex;
	                }
	            }

	            // Convert
	            return parseLoop(base64Str, base64StrLength, reverseMap);

	        },

	        _map: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
	    };

	    function parseLoop(base64Str, base64StrLength, reverseMap) {
	      var words = [];
	      var nBytes = 0;
	      for (var i = 0; i < base64StrLength; i++) {
	          if (i % 4) {
	              var bits1 = reverseMap[base64Str.charCodeAt(i - 1)] << ((i % 4) * 2);
	              var bits2 = reverseMap[base64Str.charCodeAt(i)] >>> (6 - (i % 4) * 2);
	              var bitsCombined = bits1 | bits2;
	              words[nBytes >>> 2] |= bitsCombined << (24 - (nBytes % 4) * 8);
	              nBytes++;
	          }
	      }
	      return WordArray.create(words, nBytes);
	    }
	}());


	return CryptoJS.enc.Base64;

}));
;(function (root, factory) {
	if (typeof exports === "object") {
		// CommonJS
		module.exports = exports = factory(require("./core"));
	}
	else if (typeof define === "function" && define.amd) {
		// AMD
		define(["./core"], factory);
	}
	else {
		// Global (browser)
		factory(root.CryptoJS);
	}
}(this, function (CryptoJS) {

	(function (Math) {
	    // Shortcuts
	    var C = CryptoJS;
	    var C_lib = C.lib;
	    var WordArray = C_lib.WordArray;
	    var Hasher = C_lib.Hasher;
	    var C_algo = C.algo;

	    // Initialization and round constants tables
	    var H = [];
	    var K = [];

	    // Compute constants
	    (function () {
	        function isPrime(n) {
	            var sqrtN = Math.sqrt(n);
	            for (var factor = 2; factor <= sqrtN; factor++) {
	                if (!(n % factor)) {
	                    return false;
	                }
	            }

	            return true;
	        }

	        function getFractionalBits(n) {
	            return ((n - (n | 0)) * 0x100000000) | 0;
	        }

	        var n = 2;
	        var nPrime = 0;
	        while (nPrime < 64) {
	            if (isPrime(n)) {
	                if (nPrime < 8) {
	                    H[nPrime] = getFractionalBits(Math.pow(n, 1 / 2));
	                }
	                K[nPrime] = getFractionalBits(Math.pow(n, 1 / 3));

	                nPrime++;
	            }

	            n++;
	        }
	    }());

	    // Reusable object
	    var W = [];

	    /**
	     * SHA-256 hash algorithm.
	     */
	    var SHA256 = C_algo.SHA256 = Hasher.extend({
	        _doReset: function () {
	            this._hash = new WordArray.init(H.slice(0));
	        },

	        _doProcessBlock: function (M, offset) {
	            // Shortcut
	            var H = this._hash.words;

	            // Working variables
	            var a = H[0];
	            var b = H[1];
	            var c = H[2];
	            var d = H[3];
	            var e = H[4];
	            var f = H[5];
	            var g = H[6];
	            var h = H[7];

	            // Computation
	            for (var i = 0; i < 64; i++) {
	                if (i < 16) {
	                    W[i] = M[offset + i] | 0;
	                } else {
	                    var gamma0x = W[i - 15];
	                    var gamma0  = ((gamma0x << 25) | (gamma0x >>> 7))  ^
	                                  ((gamma0x << 14) | (gamma0x >>> 18)) ^
	                                   (gamma0x >>> 3);

	                    var gamma1x = W[i - 2];
	                    var gamma1  = ((gamma1x << 15) | (gamma1x >>> 17)) ^
	                                  ((gamma1x << 13) | (gamma1x >>> 19)) ^
	                                   (gamma1x >>> 10);

	                    W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16];
	                }

	                var ch  = (e & f) ^ (~e & g);
	                var maj = (a & b) ^ (a & c) ^ (b & c);

	                var sigma0 = ((a << 30) | (a >>> 2)) ^ ((a << 19) | (a >>> 13)) ^ ((a << 10) | (a >>> 22));
	                var sigma1 = ((e << 26) | (e >>> 6)) ^ ((e << 21) | (e >>> 11)) ^ ((e << 7)  | (e >>> 25));

	                var t1 = h + sigma1 + ch + K[i] + W[i];
	                var t2 = sigma0 + maj;

	                h = g;
	                g = f;
	                f = e;
	                e = (d + t1) | 0;
	                d = c;
	                c = b;
	                b = a;
	                a = (t1 + t2) | 0;
	            }

	            // Intermediate hash value
	            H[0] = (H[0] + a) | 0;
	            H[1] = (H[1] + b) | 0;
	            H[2] = (H[2] + c) | 0;
	            H[3] = (H[3] + d) | 0;
	            H[4] = (H[4] + e) | 0;
	            H[5] = (H[5] + f) | 0;
	            H[6] = (H[6] + g) | 0;
	            H[7] = (H[7] + h) | 0;
	        },

	        _doFinalize: function () {
	            // Shortcuts
	            var data = this._data;
	            var dataWords = data.words;

	            var nBitsTotal = this._nDataBytes * 8;
	            var nBitsLeft = data.sigBytes * 8;

	            // Add padding
	            dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
	            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = Math.floor(nBitsTotal / 0x100000000);
	            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 15] = nBitsTotal;
	            data.sigBytes = dataWords.length * 4;

	            // Hash final blocks
	            this._process();

	            // Return final computed hash
	            return this._hash;
	        },

	        clone: function () {
	            var clone = Hasher.clone.call(this);
	            clone._hash = this._hash.clone();

	            return clone;
	        }
	    });

	    /**
	     * Shortcut function to the hasher's object interface.
	     *
	     * @param {WordArray|string} message The message to hash.
	     *
	     * @return {WordArray} The hash.
	     *
	     * @static
	     *
	     * @example
	     *
	     *     var hash = CryptoJS.SHA256('message');
	     *     var hash = CryptoJS.SHA256(wordArray);
	     */
	    C.SHA256 = Hasher._createHelper(SHA256);

	    /**
	     * Shortcut function to the HMAC's object interface.
	     *
	     * @param {WordArray|string} message The message to hash.
	     * @param {WordArray|string} key The secret key.
	     *
	     * @return {WordArray} The HMAC.
	     *
	     * @static
	     *
	     * @example
	     *
	     *     var hmac = CryptoJS.HmacSHA256(message, key);
	     */
	    C.HmacSHA256 = Hasher._createHmacHelper(SHA256);
	}(Math));


	return CryptoJS.SHA256;

}));
;(function (root, factory) {
	if (typeof exports === "object") {
		// CommonJS
		module.exports = exports = factory(require("./core"));
	}
	else if (typeof define === "function" && define.amd) {
		// AMD
		define(["./core"], factory);
	}
	else {
		// Global (browser)
		factory(root.CryptoJS);
	}
}(this, function (CryptoJS) {

	(function () {
	    // Shortcuts
	    var C = CryptoJS;
	    var C_lib = C.lib;
	    var Base = C_lib.Base;
	    var C_enc = C.enc;
	    var Utf8 = C_enc.Utf8;
	    var C_algo = C.algo;

	    /**
	     * HMAC algorithm.
	     */
	    var HMAC = C_algo.HMAC = Base.extend({
	        /**
	         * Initializes a newly created HMAC.
	         *
	         * @param {Hasher} hasher The hash algorithm to use.
	         * @param {WordArray|string} key The secret key.
	         *
	         * @example
	         *
	         *     var hmacHasher = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, key);
	         */
	        init: function (hasher, key) {
	            // Init hasher
	            hasher = this._hasher = new hasher.init();

	            // Convert string to WordArray, else assume WordArray already
	            if (typeof key == 'string') {
	                key = Utf8.parse(key);
	            }

	            // Shortcuts
	            var hasherBlockSize = hasher.blockSize;
	            var hasherBlockSizeBytes = hasherBlockSize * 4;

	            // Allow arbitrary length keys
	            if (key.sigBytes > hasherBlockSizeBytes) {
	                key = hasher.finalize(key);
	            }

	            // Clamp excess bits
	            key.clamp();

	            // Clone key for inner and outer pads
	            var oKey = this._oKey = key.clone();
	            var iKey = this._iKey = key.clone();

	            // Shortcuts
	            var oKeyWords = oKey.words;
	            var iKeyWords = iKey.words;

	            // XOR keys with pad constants
	            for (var i = 0; i < hasherBlockSize; i++) {
	                oKeyWords[i] ^= 0x5c5c5c5c;
	                iKeyWords[i] ^= 0x36363636;
	            }
	            oKey.sigBytes = iKey.sigBytes = hasherBlockSizeBytes;

	            // Set initial values
	            this.reset();
	        },

	        /**
	         * Resets this HMAC to its initial state.
	         *
	         * @example
	         *
	         *     hmacHasher.reset();
	         */
	        reset: function () {
	            // Shortcut
	            var hasher = this._hasher;

	            // Reset
	            hasher.reset();
	            hasher.update(this._iKey);
	        },

	        /**
	         * Updates this HMAC with a message.
	         *
	         * @param {WordArray|string} messageUpdate The message to append.
	         *
	         * @return {HMAC} This HMAC instance.
	         *
	         * @example
	         *
	         *     hmacHasher.update('message');
	         *     hmacHasher.update(wordArray);
	         */
	        update: function (messageUpdate) {
	            this._hasher.update(messageUpdate);

	            // Chainable
	            return this;
	        },

	        /**
	         * Finalizes the HMAC computation.
	         * Note that the finalize operation is effectively a destructive, read-once operation.
	         *
	         * @param {WordArray|string} messageUpdate (Optional) A final message update.
	         *
	         * @return {WordArray} The HMAC.
	         *
	         * @example
	         *
	         *     var hmac = hmacHasher.finalize();
	         *     var hmac = hmacHasher.finalize('message');
	         *     var hmac = hmacHasher.finalize(wordArray);
	         */
	        finalize: function (messageUpdate) {
	            // Shortcut
	            var hasher = this._hasher;

	            // Compute HMAC
	            var innerHash = hasher.finalize(messageUpdate);
	            hasher.reset();
	            var hmac = hasher.finalize(this._oKey.clone().concat(innerHash));

	            return hmac;
	        }
	    });
	}());


}));
;(function (root, factory, undef) {
	if (typeof exports === "object") {
		// CommonJS
		module.exports = exports = factory(require("./core"), require("./sha256"), require("./hmac"));
	}
	else if (typeof define === "function" && define.amd) {
		// AMD
		define(["./core", "./sha256", "./hmac"], factory);
	}
	else {
		// Global (browser)
		factory(root.CryptoJS);
	}
}(this, function (CryptoJS) {

	return CryptoJS.HmacSHA256;

}));
(function webpackUniversalModuleDefinition(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports["accessibleAutocomplete"]=t():e["accessibleAutocomplete"]=t()})(window,function(){return function(n){var r={};function o(e){if(r[e])return r[e].exports;var t=r[e]={i:e,l:!1,exports:{}};return n[e].call(t.exports,t,t.exports,o),t.l=!0,t.exports}return o.m=n,o.c=r,o.d=function(e,t,n){o.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},o.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},o.t=function(t,e){if(1&e&&(t=o(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var n=Object.create(null);if(o.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var r in t)o.d(n,r,function(e){return t[e]}.bind(null,r));return n},o.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return o.d(t,"a",t),t},o.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},o.p="/",o(o.s=37)}([function(e,t,n){var m=n(1),v=n(6),y=n(7),g=n(16),_=n(18),b="prototype",w=function(e,t,n){var r,o,i,u,a=e&w.F,s=e&w.G,l=e&w.S,c=e&w.P,p=e&w.B,f=s?m:l?m[t]||(m[t]={}):(m[t]||{})[b],d=s?v:v[t]||(v[t]={}),h=d[b]||(d[b]={});for(r in s&&(n=t),n)i=((o=!a&&f&&f[r]!==undefined)?f:n)[r],u=p&&o?_(i,m):c&&"function"==typeof i?_(Function.call,i):i,f&&g(f,r,i,e&w.U),d[r]!=i&&y(d,r,u),c&&h[r]!=i&&(h[r]=i)};m.core=v,w.F=1,w.G=2,w.S=4,w.P=8,w.B=16,w.W=32,w.U=64,w.R=128,e.exports=w},function(e,t){var n=e.exports="undefined"!=typeof window&&window.Math==Math?window:"undefined"!=typeof self&&self.Math==Math?self:Function("return this")();"number"==typeof __g&&(__g=n)},function(e,t){e.exports=function(e){return"object"==typeof e?null!==e:"function"==typeof e}},function(e,t,n){e.exports=!n(4)(function(){return 7!=Object.defineProperty({},"a",{get:function(){return 7}}).a})},function(e,t){e.exports=function(e){try{return!!e()}catch(t){return!0}}},function(e,t,n){"use strict";n.r(t),n.d(t,"h",function(){return r}),n.d(t,"createElement",function(){return r}),n.d(t,"cloneElement",function(){return i}),n.d(t,"Component",function(){return g}),n.d(t,"render",function(){return _}),n.d(t,"rerender",function(){return f}),n.d(t,"options",function(){return E});var s=function s(){},E={},l=[],c=[];function r(e,t){var n,r,o,i,u=c;for(i=arguments.length;2<i--;)l.push(arguments[i]);for(t&&null!=t.children&&(l.length||l.push(t.children),delete t.children);l.length;)if((r=l.pop())&&r.pop!==undefined)for(i=r.length;i--;)l.push(r[i]);else"boolean"==typeof r&&(r=null),(o="function"!=typeof e)&&(null==r?r="":"number"==typeof r?r=String(r):"string"!=typeof r&&(o=!1)),o&&n?u[u.length-1]+=r:u===c?u=[r]:u.push(r),n=o;var a=new s;return a.nodeName=e,a.children=u,a.attributes=null==t?undefined:t,a.key=null==t?undefined:t.key,E.vnode!==undefined&&E.vnode(a),a}function M(e,t){for(var n in t)e[n]=t[n];return e}var o="function"==typeof Promise?Promise.resolve().then.bind(Promise.resolve()):setTimeout;function i(e,t){return r(e.nodeName,M(M({},e.attributes),t),2<arguments.length?[].slice.call(arguments,2):e.children)}var p=/acit|ex(?:s|g|n|p|$)|rph|ows|mnc|ntw|ine[ch]|zoo|^ord/i,u=[];function a(e){!e._dirty&&(e._dirty=!0)&&1==u.push(e)&&(E.debounceRendering||o)(f)}function f(){var e,t=u;for(u=[];e=t.pop();)e._dirty&&V(e)}function N(e,t){return e.normalizedNodeName===t||e.nodeName.toLowerCase()===t.toLowerCase()}function I(e){var t=M({},e.attributes);t.children=e.children;var n=e.nodeName.defaultProps;if(n!==undefined)for(var r in n)t[r]===undefined&&(t[r]=n[r]);return t}function k(e){var t=e.parentNode;t&&t.removeChild(e)}function v(e,t,n,r,o){if("className"===t&&(t="class"),"key"===t);else if("ref"===t)n&&n(null),r&&r(e);else if("class"!==t||o)if("style"===t){if(r&&"string"!=typeof r&&"string"!=typeof n||(e.style.cssText=r||""),r&&"object"==typeof r){if("string"!=typeof n)for(var i in n)i in r||(e.style[i]="");for(var i in r)e.style[i]="number"==typeof r[i]&&!1===p.test(i)?r[i]+"px":r[i]}}else if("dangerouslySetInnerHTML"===t)r&&(e.innerHTML=r.__html||"");else if("o"==t[0]&&"n"==t[1]){var u=t!==(t=t.replace(/Capture$/,""));t=t.toLowerCase().substring(2),r?n||e.addEventListener(t,d,u):e.removeEventListener(t,d,u),(e._listeners||(e._listeners={}))[t]=r}else if("list"!==t&&"type"!==t&&!o&&t in e){try{e[t]=null==r?"":r}catch(s){}null!=r&&!1!==r||"spellcheck"==t||e.removeAttribute(t)}else{var a=o&&t!==(t=t.replace(/^xlink:?/,""));null==r||!1===r?a?e.removeAttributeNS("http://www.w3.org/1999/xlink",t.toLowerCase()):e.removeAttribute(t):"function"!=typeof r&&(a?e.setAttributeNS("http://www.w3.org/1999/xlink",t.toLowerCase(),r):e.setAttribute(t,r))}else e.className=r||""}function d(e){return this._listeners[e.type](E.event&&E.event(e)||e)}var A=[],P=0,j=!1,L=!1;function T(){for(var e;e=A.pop();)E.afterMount&&E.afterMount(e),e.componentDidMount&&e.componentDidMount()}function B(e,t,n,r,o,i){P++||(j=null!=o&&o.ownerSVGElement!==undefined,L=null!=e&&!("__preactattr_"in e));var u=D(e,t,n,r,i);return o&&u.parentNode!==o&&o.appendChild(u),--P||(L=!1,i||T()),u}function D(e,t,n,r,o){var i=e,u=j;if(null!=t&&"boolean"!=typeof t||(t=""),"string"==typeof t||"number"==typeof t)return e&&e.splitText!==undefined&&e.parentNode&&(!e._component||o)?e.nodeValue!=t&&(e.nodeValue=t):(i=document.createTextNode(t),e&&(e.parentNode&&e.parentNode.replaceChild(i,e),F(e,!0))),i["__preactattr_"]=!0,i;var a=t.nodeName;if("function"==typeof a)return function d(e,t,n,r){var o=e&&e._component,i=o,u=e,a=o&&e._componentConstructor===t.nodeName,s=a,l=I(t);for(;o&&!s&&(o=o._parentComponent);)s=o.constructor===t.nodeName;o&&s&&(!r||o._component)?(U(o,l,3,n,r),e=o.base):(i&&!a&&(q(i),e=u=null),o=R(t.nodeName,l,n),e&&!o.nextBase&&(o.nextBase=e,u=null),U(o,l,1,n,r),e=o.base,u&&e!==u&&(u._component=null,F(u,!1)));return e}(e,t,n,r);if(j="svg"===a||"foreignObject"!==a&&j,a=String(a),(!e||!N(e,a))&&(i=function h(e,t){var n=t?document.createElementNS("http://www.w3.org/2000/svg",e):document.createElement(e);return n.normalizedNodeName=e,n}(a,j),e)){for(;e.firstChild;)i.appendChild(e.firstChild);e.parentNode&&e.parentNode.replaceChild(i,e),F(e,!0)}var s=i.firstChild,l=i["__preactattr_"],c=t.children;if(null==l){l=i["__preactattr_"]={};for(var p=i.attributes,f=p.length;f--;)l[p[f].name]=p[f].value}return!L&&c&&1===c.length&&"string"==typeof c[0]&&null!=s&&s.splitText!==undefined&&null==s.nextSibling?s.nodeValue!=c[0]&&(s.nodeValue=c[0]):(c&&c.length||null!=s)&&function S(e,t,n,r,o){var i,u,a,s,l,c=e.childNodes,p=[],f={},d=0,h=0,m=c.length,v=0,y=t?t.length:0;if(0!==m)for(var g=0;g<m;g++){var _=c[g],b=_["__preactattr_"],w=y&&b?_._component?_._component.__key:b.key:null;null!=w?(d++,f[w]=_):(b||(_.splitText!==undefined?!o||_.nodeValue.trim():o))&&(p[v++]=_)}if(0!==y)for(var g=0;g<y;g++){s=t[g],l=null;var w=s.key;if(null!=w)d&&f[w]!==undefined&&(l=f[w],f[w]=undefined,d--);else if(h<v)for(i=h;i<v;i++)if(p[i]!==undefined&&(x=u=p[i],C=o,"string"==typeof(O=s)||"number"==typeof O?x.splitText!==undefined:"string"==typeof O.nodeName?!x._componentConstructor&&N(x,O.nodeName):C||x._componentConstructor===O.nodeName)){l=u,p[i]=undefined,i===v-1&&v--,i===h&&h++;break}l=D(l,s,n,r),a=c[g],l&&l!==e&&l!==a&&(null==a?e.appendChild(l):l===a.nextSibling?k(a):e.insertBefore(l,a))}var x,O,C;if(d)for(var g in f)f[g]!==undefined&&F(f[g],!1);for(;h<=v;)(l=p[v--])!==undefined&&F(l,!1)}(i,c,n,r,L||null!=l.dangerouslySetInnerHTML),function m(e,t,n){var r;for(r in n)t&&null!=t[r]||null==n[r]||v(e,r,n[r],n[r]=undefined,j);for(r in t)"children"===r||"innerHTML"===r||r in n&&t[r]===("value"===r||"checked"===r?e[r]:n[r])||v(e,r,n[r],n[r]=t[r],j)}(i,t.attributes,l),j=u,i}function F(e,t){var n=e._component;n?q(n):(null!=e["__preactattr_"]&&e["__preactattr_"].ref&&e["__preactattr_"].ref(null),!1!==t&&null!=e["__preactattr_"]||k(e),h(e))}function h(e){for(e=e.lastChild;e;){var t=e.previousSibling;F(e,!0),e=t}}var m=[];function R(e,t,n){var r,o=m.length;for(e.prototype&&e.prototype.render?(r=new e(t,n),g.call(r,t,n)):((r=new g(t,n)).constructor=e,r.render=y);o--;)if(m[o].constructor===e)return r.nextBase=m[o].nextBase,m.splice(o,1),r;return r}function y(e,t,n){return this.constructor(e,n)}function U(e,t,n,r,o){e._disable||(e._disable=!0,e.__ref=t.ref,e.__key=t.key,delete t.ref,delete t.key,"undefined"==typeof e.constructor.getDerivedStateFromProps&&(!e.base||o?e.componentWillMount&&e.componentWillMount():e.componentWillReceiveProps&&e.componentWillReceiveProps(t,r)),r&&r!==e.context&&(e.prevContext||(e.prevContext=e.context),e.context=r),e.prevProps||(e.prevProps=e.props),e.props=t,e._disable=!1,0!==n&&(1!==n&&!1===E.syncComponentUpdates&&e.base?a(e):V(e,1,o)),e.__ref&&e.__ref(e))}function V(e,t,n,r){if(!e._disable){var o,i,u,a=e.props,s=e.state,l=e.context,c=e.prevProps||a,p=e.prevState||s,f=e.prevContext||l,d=e.base,h=e.nextBase,m=d||h,v=e._component,y=!1,g=f;if(e.constructor.getDerivedStateFromProps&&(s=M(M({},s),e.constructor.getDerivedStateFromProps(a,s)),e.state=s),d&&(e.props=c,e.state=p,e.context=f,2!==t&&e.shouldComponentUpdate&&!1===e.shouldComponentUpdate(a,s,l)?y=!0:e.componentWillUpdate&&e.componentWillUpdate(a,s,l),e.props=a,e.state=s,e.context=l),e.prevProps=e.prevState=e.prevContext=e.nextBase=null,e._dirty=!1,!y){o=e.render(a,s,l),e.getChildContext&&(l=M(M({},l),e.getChildContext())),d&&e.getSnapshotBeforeUpdate&&(g=e.getSnapshotBeforeUpdate(c,p));var _,b,w=o&&o.nodeName;if("function"==typeof w){var x=I(o);(i=v)&&i.constructor===w&&x.key==i.__key?U(i,x,1,l,!1):(_=i,e._component=i=R(w,x,l),i.nextBase=i.nextBase||h,i._parentComponent=e,U(i,x,0,l,!1),V(i,1,n,!0)),b=i.base}else u=m,(_=v)&&(u=e._component=null),(m||1===t)&&(u&&(u._component=null),b=function B(t,n,r,o,i,u){P++||(j=null!=i&&i.ownerSVGElement!==undefined,L=null!=t&&!("__preactattr_"in t));var a=D(t,n,r,o,u);return i&&a.parentNode!==i&&i.appendChild(a),--P||(L=!1,u||T()),a}(u,o,l,n||!d,m&&m.parentNode,!0));if(m&&b!==m&&i!==v){var O=m.parentNode;O&&b!==O&&(O.replaceChild(b,m),_||(m._component=null,F(m,!1)))}if(_&&q(_),(e.base=b)&&!r){for(var C=e,S=e;S=S._parentComponent;)(C=S).base=b;b._component=C,b._componentConstructor=C.constructor}}for(!d||n?A.unshift(e):y||(e.componentDidUpdate&&e.componentDidUpdate(c,p,g),E.afterUpdate&&E.afterUpdate(e));e._renderCallbacks.length;)e._renderCallbacks.pop().call(e);P||r||T()}}function q(e){E.beforeUnmount&&E.beforeUnmount(e);var t=e.base;e._disable=!0,e.componentWillUnmount&&e.componentWillUnmount(),e.base=null;var n=e._component;n?q(n):t&&(t["__preactattr_"]&&t["__preactattr_"].ref&&t["__preactattr_"].ref(null),k(e.nextBase=t),m.push(e),h(t)),e.__ref&&e.__ref(null)}function g(e,t){this._dirty=!0,this.context=t,this.props=e,this.state=this.state||{},this._renderCallbacks=[]}function _(e,t,n){return B(n,e,{},!1,t,!1)}M(g.prototype,{setState:function(e,t){this.prevState||(this.prevState=this.state),this.state=M(M({},this.state),"function"==typeof e?e(this.state,this.props):e),t&&this._renderCallbacks.push(t),a(this)},forceUpdate:function(e){e&&this._renderCallbacks.push(e),V(this,2)},render:function _(){}});var b={h:r,createElement:r,cloneElement:i,Component:g,render:_,rerender:f,options:E};t["default"]=b},function(e,t){var n=e.exports={version:"2.5.7"};"number"==typeof __e&&(__e=n)},function(e,t,n){var r=n(8),o=n(40);e.exports=n(3)?function(e,t,n){return r.f(e,t,o(1,n))}:function(e,t,n){return e[t]=n,e}},function(e,t,n){var o=n(9),i=n(38),u=n(39),a=Object.defineProperty;t.f=n(3)?Object.defineProperty:function(e,t,n){if(o(e),t=u(t,!0),o(n),i)try{return a(e,t,n)}catch(r){}if("get"in n||"set"in n)throw TypeError("Accessors not supported!");return"value"in n&&(e[t]=n.value),e}},function(e,t,n){var r=n(2);e.exports=function(e){if(!r(e))throw TypeError(e+" is not an object!");return e}},function(e,t){var n=0,r=Math.random();e.exports=function(e){return"Symbol(".concat(e===undefined?"":e,")_",(++n+r).toString(36))}},function(e,t,n){var r=n(22);e.exports=Object("z").propertyIsEnumerable(0)?Object:function(e){return"String"==r(e)?e.split(""):Object(e)}},function(e,t){e.exports=function(e){if(e==undefined)throw TypeError("Can't call method on  "+e);return e}},function(e,t,n){"use strict";var r=n(4);e.exports=function(e,t){return!!e&&r(function(){t?e.call(null,function(){},1):e.call(null)})}},function(e,t,n){var r=n(0);r(r.S+r.F,"Object",{assign:n(41)})},function(e,t,n){var r=n(2),o=n(1).document,i=r(o)&&r(o.createElement);e.exports=function(e){return i?o.createElement(e):{}}},function(e,t,n){var i=n(1),u=n(7),a=n(17),s=n(10)("src"),r="toString",o=Function[r],l=(""+o).split(r);n(6).inspectSource=function(e){return o.call(e)},(e.exports=function(e,t,n,r){var o="function"==typeof n;o&&(a(n,"name")||u(n,"name",t)),e[t]!==n&&(o&&(a(n,s)||u(n,s,e[t]?""+e[t]:l.join(String(t)))),e===i?e[t]=n:r?e[t]?e[t]=n:u(e,t,n):(delete e[t],u(e,t,n)))})(Function.prototype,r,function(){return"function"==typeof this&&this[s]||o.call(this)})},function(e,t){var n={}.hasOwnProperty;e.exports=function(e,t){return n.call(e,t)}},function(e,t,n){var i=n(19);e.exports=function(r,o,e){if(i(r),o===undefined)return r;switch(e){case 1:return function(e){return r.call(o,e)};case 2:return function(e,t){return r.call(o,e,t)};case 3:return function(e,t,n){return r.call(o,e,t,n)}}return function(){return r.apply(o,arguments)}}},function(e,t){e.exports=function(e){if("function"!=typeof e)throw TypeError(e+" is not a function!");return e}},function(e,t,n){var r=n(42),o=n(28);e.exports=Object.keys||function(e){return r(e,o)}},function(e,t,n){var r=n(11),o=n(12);e.exports=function(e){return r(o(e))}},function(e,t){var n={}.toString;e.exports=function(e){return n.call(e).slice(8,-1)}},function(e,t,n){var s=n(21),l=n(24),c=n(43);e.exports=function(a){return function(e,t,n){var r,o=s(e),i=l(o.length),u=c(n,i);if(a&&t!=t){for(;u<i;)if((r=o[u++])!=r)return!0}else for(;u<i;u++)if((a||u in o)&&o[u]===t)return a||u||0;return!a&&-1}}},function(e,t,n){var r=n(25),o=Math.min;e.exports=function(e){return 0<e?o(r(e),9007199254740991):0}},function(e,t){var n=Math.ceil,r=Math.floor;e.exports=function(e){return isNaN(e=+e)?0:(0<e?r:n)(e)}},function(e,t,n){var r=n(27)("keys"),o=n(10);e.exports=function(e){return r[e]||(r[e]=o(e))}},function(e,t,n){var r=n(6),o=n(1),i="__core-js_shared__",u=o[i]||(o[i]={});(e.exports=function(e,t){return u[e]||(u[e]=t!==undefined?t:{})})("versions",[]).push({version:r.version,mode:n(44)?"pure":"global",copyright:"© 2018 Denis Pushkarev (zloirock.ru)"})},function(e,t){e.exports="constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf".split(",")},function(e,t,n){var r=n(12);e.exports=function(e){return Object(r(e))}},function(e,t,n){var r=n(8).f,o=Function.prototype,i=/^\s*function ([^ (]*)/;"name"in o||n(3)&&r(o,"name",{configurable:!0,get:function(){try{return(""+this).match(i)[1]}catch(e){return""}}})},function(e,t,n){"use strict";var r=n(0),o=n(32)(1);r(r.P+r.F*!n(13)([].map,!0),"Array",{map:function(e){return o(this,e,arguments[1])}})},function(e,t,n){var _=n(18),b=n(11),w=n(29),x=n(24),r=n(47);e.exports=function(p,e){var f=1==p,d=2==p,h=3==p,m=4==p,v=6==p,y=5==p||v,g=e||r;return function(e,t,n){for(var r,o,i=w(e),u=b(i),a=_(t,n,3),s=x(u.length),l=0,c=f?g(e,s):d?g(e,0):undefined;l<s;l++)if((y||l in u)&&(o=a(r=u[l],l,i),p))if(f)c[l]=o;else if(o)switch(p){case 3:return!0;case 5:return r;case 6:return l;case 2:c.push(r)}else if(m)return!1;return v?-1:h||m?m:c}}},function(e,t,n){var r=n(22);e.exports=Array.isArray||function(e){return"Array"==r(e)}},function(e,t,n){var r=n(27)("wks"),o=n(10),i=n(1).Symbol,u="function"==typeof i;(e.exports=function(e){return r[e]||(r[e]=u&&i[e]||(u?i:o)("Symbol."+e))}).store=r},function(e,t,n){"use strict";var r=n(0),o=n(23)(!1),i=[].indexOf,u=!!i&&1/[1].indexOf(1,-0)<0;r(r.P+r.F*(u||!n(13)(i)),"Array",{indexOf:function(e){return u?i.apply(this,arguments)||0:o(this,e,arguments[1])}})},function(e,t,n){var r=n(0);r(r.S,"Object",{create:n(52)})},function(e,t,n){"use strict";t.__esModule=!0,t["default"]=void 0,n(14),n(30),n(31),n(35),n(49),n(50);var r=n(5),o=function s(e){return e&&e.__esModule?e:{"default":e}}(n(51));function i(e){if(!e.element)throw new Error("element is not defined");if(!e.id)throw new Error("id is not defined");if(!e.source)throw new Error("source is not defined");Array.isArray(e.source)&&(e.source=u(e.source)),(0,r.render)((0,r.createElement)(o["default"],e),e.element)}var u=function u(n){return function(t,e){e(n.filter(function(e){return-1!==e.toLowerCase().indexOf(t.toLowerCase())}))}};i.enhanceSelectElement=function(n){if(!n.selectElement)throw new Error("selectElement is not defined");if(!n.source){var e=[].filter.call(n.selectElement.options,function(e){return e.value||n.preserveNullOptions});n.source=e.map(function(e){return e.textContent||e.innerText})}if(n.onConfirm=n.onConfirm||function(t){var e=[].filter.call(n.selectElement.options,function(e){return(e.textContent||e.innerText)===t})[0];e&&(e.selected=!0)},n.selectElement.value||n.defaultValue===undefined){var t=n.selectElement.options[n.selectElement.options.selectedIndex];n.defaultValue=t.textContent||t.innerText}n.name===undefined&&(n.name=""),n.id===undefined&&(n.selectElement.id===undefined?n.id="":n.id=n.selectElement.id),n.autoselect===undefined&&(n.autoselect=!0);var r=document.createElement("div");n.selectElement.parentNode.insertBefore(r,n.selectElement),i(Object.assign({},n,{element:r})),n.selectElement.style.display="none",n.selectElement.id=n.selectElement.id+"-select"};var a=i;t["default"]=a},function(e,t,n){e.exports=!n(3)&&!n(4)(function(){return 7!=Object.defineProperty(n(15)("div"),"a",{get:function(){return 7}}).a})},function(e,t,n){var o=n(2);e.exports=function(e,t){if(!o(e))return e;var n,r;if(t&&"function"==typeof(n=e.toString)&&!o(r=n.call(e)))return r;if("function"==typeof(n=e.valueOf)&&!o(r=n.call(e)))return r;if(!t&&"function"==typeof(n=e.toString)&&!o(r=n.call(e)))return r;throw TypeError("Can't convert object to primitive value")}},function(e,t){e.exports=function(e,t){return{enumerable:!(1&e),configurable:!(2&e),writable:!(4&e),value:t}}},function(e,t,n){"use strict";var f=n(20),d=n(45),h=n(46),m=n(29),v=n(11),o=Object.assign;e.exports=!o||n(4)(function(){var e={},t={},n=Symbol(),r="abcdefghijklmnopqrst";return e[n]=7,r.split("").forEach(function(e){t[e]=e}),7!=o({},e)[n]||Object.keys(o({},t)).join("")!=r})?function(e,t){for(var n=m(e),r=arguments.length,o=1,i=d.f,u=h.f;o<r;)for(var a,s=v(arguments[o++]),l=i?f(s).concat(i(s)):f(s),c=l.length,p=0;p<c;)u.call(s,a=l[p++])&&(n[a]=s[a]);return n}:o},function(e,t,n){var u=n(17),a=n(21),s=n(23)(!1),l=n(26)("IE_PROTO");e.exports=function(e,t){var n,r=a(e),o=0,i=[];for(n in r)n!=l&&u(r,n)&&i.push(n);for(;t.length>o;)u(r,n=t[o++])&&(~s(i,n)||i.push(n));return i}},function(e,t,n){var r=n(25),o=Math.max,i=Math.min;e.exports=function(e,t){return(e=r(e))<0?o(e+t,0):i(e,t)}},function(e,t){e.exports=!1},function(e,t){t.f=Object.getOwnPropertySymbols},function(e,t){t.f={}.propertyIsEnumerable},function(e,t,n){var r=n(48);e.exports=function(e,t){return new(r(e))(t)}},function(e,t,n){var r=n(2),o=n(33),i=n(34)("species");e.exports=function(e){var t;return o(e)&&("function"!=typeof(t=e.constructor)||t!==Array&&!o(t.prototype)||(t=undefined),r(t)&&null===(t=t[i])&&(t=undefined)),t===undefined?Array:t}},function(e,t,n){"use strict";var r=n(0),o=n(32)(2);r(r.P+r.F*!n(13)([].filter,!0),"Array",{filter:function(e){return o(this,e,arguments[1])}})},function(e,t,n){var r=n(0);r(r.S,"Array",{isArray:n(33)})},function(e,t,n){"use strict";t.__esModule=!0,t["default"]=void 0,n(14),n(36),n(30),n(31),n(35),n(55),n(58);var $=n(5),J=o(n(60)),r=o(n(61));function o(e){return e&&e.__esModule?e:{"default":e}}function X(){return(X=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e}).apply(this,arguments)}function i(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}var u={13:"enter",27:"escape",32:"space",38:"up",40:"down"};function Y(){return"undefined"!=typeof navigator&&!(!navigator.userAgent.match(/(iPod|iPhone|iPad)/g)||!navigator.userAgent.match(/AppleWebKit/g))}var a=function(n){function e(e){var t;return(t=n.call(this,e)||this).elementReferences={},t.state={focused:null,hovered:null,menuOpen:!1,options:e.defaultValue?[e.defaultValue]:[],query:e.defaultValue,validChoiceMade:!1,selected:null,ariaHint:!0},t.handleComponentBlur=t.handleComponentBlur.bind(i(i(t))),t.handleKeyDown=t.handleKeyDown.bind(i(i(t))),t.handleUpArrow=t.handleUpArrow.bind(i(i(t))),t.handleDownArrow=t.handleDownArrow.bind(i(i(t))),t.handleEnter=t.handleEnter.bind(i(i(t))),t.handlePrintableKey=t.handlePrintableKey.bind(i(i(t))),t.handleListMouseLeave=t.handleListMouseLeave.bind(i(i(t))),t.handleOptionBlur=t.handleOptionBlur.bind(i(i(t))),t.handleOptionClick=t.handleOptionClick.bind(i(i(t))),t.handleOptionFocus=t.handleOptionFocus.bind(i(i(t))),t.handleOptionMouseDown=t.handleOptionMouseDown.bind(i(i(t))),t.handleOptionMouseEnter=t.handleOptionMouseEnter.bind(i(i(t))),t.handleInputBlur=t.handleInputBlur.bind(i(i(t))),t.handleInputChange=t.handleInputChange.bind(i(i(t))),t.handleInputFocus=t.handleInputFocus.bind(i(i(t))),t.pollInputElement=t.pollInputElement.bind(i(i(t))),t.getDirectInputChanges=t.getDirectInputChanges.bind(i(i(t))),t}(function r(e,t){e.prototype=Object.create(t.prototype),(e.prototype.constructor=e).__proto__=t})(e,n);var t=e.prototype;return t.isQueryAnOption=function(e,t){var n=this;return-1!==t.map(function(e){return n.templateInputValue(e).toLowerCase()}).indexOf(e.toLowerCase())},t.componentDidMount=function(){this.pollInputElement()},t.componentWillUnmount=function(){clearTimeout(this.$pollInput)},t.pollInputElement=function(){var e=this;this.getDirectInputChanges(),this.$pollInput=setTimeout(function(){e.pollInputElement()},100)},t.getDirectInputChanges=function(){var e=this.elementReferences[-1];e&&e.value!==this.state.query&&this.handleInputChange({target:{value:e.value}})},t.componentDidUpdate=function(e,t){var n=this.state.focused,r=null===n,o=t.focused!==n;o&&!r&&this.elementReferences[n].focus();var i=-1===n,u=o&&null===t.focused;if(i&&u){var a=this.elementReferences[n];a.setSelectionRange(0,a.value.length)}},t.hasAutoselect=function(){return!Y()&&this.props.autoselect},t.templateInputValue=function(e){var t=this.props.templates&&this.props.templates.inputValue;return t?t(e):e},t.templateSuggestion=function(e){var t=this.props.templates&&this.props.templates.suggestion;return t?t(e):e},t.handleComponentBlur=function(e){var t,n=this.state,r=n.options,o=n.query,i=n.selected;this.props.confirmOnBlur?(t=e.query||o,this.props.onConfirm(r[i])):t=o,this.setState({focused:null,menuOpen:e.menuOpen||!1,query:t,selected:null,validChoiceMade:this.isQueryAnOption(t,r)})},t.handleListMouseLeave=function(e){this.setState({hovered:null})},t.handleOptionBlur=function(e,t){var n=this.state,r=n.focused,o=n.menuOpen,i=n.options,u=n.selected,a=null===e.relatedTarget,s=e.relatedTarget===this.elementReferences[-1],l=r!==t&&-1!==r;if(!l&&a||!(l||s)){var c=o&&Y();this.handleComponentBlur({menuOpen:c,query:this.templateInputValue(i[u])})}},t.handleInputBlur=function(e){var t=this.state,n=t.focused,r=t.menuOpen,o=t.options,i=t.query,u=t.selected;if(!(-1!==n)){var a=r&&Y(),s=Y()?i:this.templateInputValue(o[u]);this.handleComponentBlur({menuOpen:a,query:s})}},t.handleInputChange=function(e){var n=this,t=this.props,r=t.minLength,o=t.source,i=t.showAllValues,u=this.hasAutoselect(),a=e.target.value,s=0===a.length,l=this.state.query.length!==a.length,c=a.length>=r;this.setState({query:a,ariaHint:s}),i||!s&&l&&c?o(a,function(e){var t=0<e.length;n.setState({menuOpen:t,options:e,selected:u&&t?0:-1,validChoiceMade:!1})}):!s&&c||this.setState({menuOpen:!1,options:[]})},t.handleInputClick=function(e){this.handleInputChange(e)},t.handleInputFocus=function(e){var t=this.state,n=t.query,r=t.validChoiceMade,o=t.options,i=this.props.minLength,u=!r&&n.length>=i&&0<o.length;u?this.setState(function(e){var t=e.menuOpen;return{focused:-1,menuOpen:u||t,selected:-1}}):this.setState({focused:-1})},t.handleOptionFocus=function(e){this.setState({focused:e,hovered:null,selected:e})},t.handleOptionMouseEnter=function(e,t){Y()||this.setState({hovered:t})},t.handleOptionClick=function(e,t){var n=this.state.options[t],r=this.templateInputValue(n);this.props.onConfirm(n),this.setState({focused:-1,hovered:null,menuOpen:!1,query:r,selected:-1,validChoiceMade:!0}),this.forceUpdate()},t.handleOptionMouseDown=function(e){e.preventDefault()},t.handleUpArrow=function(e){e.preventDefault();var t=this.state,n=t.menuOpen,r=t.selected;-1!==r&&n&&this.handleOptionFocus(r-1)},t.handleDownArrow=function(e){var t=this;if(e.preventDefault(),this.props.showAllValues&&!1===this.state.menuOpen)e.preventDefault(),this.props.source("",function(e){t.setState({menuOpen:!0,options:e,selected:0,focused:0,hovered:null})});else if(!0===this.state.menuOpen){var n=this.state,r=n.menuOpen,o=n.options,i=n.selected;i!==o.length-1&&r&&this.handleOptionFocus(i+1)}},t.handleSpace=function(e){var t=this;this.props.showAllValues&&!1===this.state.menuOpen&&""===this.state.query&&(e.preventDefault(),this.props.source("",function(e){t.setState({menuOpen:!0,options:e})})),-1!==this.state.focused&&(e.preventDefault(),this.handleOptionClick(e,this.state.focused))},t.handleEnter=function(e){this.state.menuOpen&&(e.preventDefault(),0<=this.state.selected&&this.handleOptionClick(e,this.state.selected))},t.handlePrintableKey=function(e){var t=this.elementReferences[-1];e.target===t||t.focus()},t.handleKeyDown=function(e){switch(u[e.keyCode]){case"up":this.handleUpArrow(e);break;case"down":this.handleDownArrow(e);break;case"space":this.handleSpace(e);break;case"enter":this.handleEnter(e);break;case"escape":this.handleComponentBlur({query:this.state.query});break;default:(function t(e){return 47<e&&e<58||32===e||8===e||64<e&&e<91||95<e&&e<112||185<e&&e<193||218<e&&e<223})(e.keyCode)&&this.handlePrintableKey(e)}},t.render=function(){var e,i=this,t=this.props,n=t.cssNamespace,r=t.displayMenu,u=t.id,o=t.minLength,a=t.name,s=t.placeholder,l=t.required,c=t.showAllValues,p=t.tNoResults,f=t.tStatusQueryTooShort,d=t.tStatusNoResults,h=t.tStatusSelectedOption,m=t.tStatusResults,v=t.tAssistiveHint,y=t.dropdownArrow,g=this.state,_=g.focused,b=g.hovered,w=g.menuOpen,x=g.options,O=g.query,C=g.selected,S=g.ariaHint,E=g.validChoiceMade,M=this.hasAutoselect(),N=-1===_,I=0===x.length,k=0!==O.length,A=O.length>=o,P=this.props.showNoOptionsFound&&N&&I&&k&&A,j=n+"__wrapper",L=n+"__input",T=null!==_?" "+L+"--focused":"",B=this.props.showAllValues?" "+L+"--show-all-values":" "+L+"--default",D=n+"__dropdown-arrow-down",F=-1!==_&&null!==_,R=n+"__menu",U=R+"--"+r,V=R+"--"+(w||P?"visible":"hidden"),q=n+"__option",W=n+"__hint",H=this.templateInputValue(x[C]),K=H&&0===H.toLowerCase().indexOf(O.toLowerCase())&&M?O+H.substr(O.length):"",Q=u+"__assistiveHint",z=S?{"aria-describedby":Q}:null;return c&&"string"==typeof(e=y({className:D}))&&(e=(0,$.createElement)("div",{className:n+"__dropdown-arrow-down-wrapper",dangerouslySetInnerHTML:{__html:e}})),(0,$.createElement)("div",{className:j,onKeyDown:this.handleKeyDown},(0,$.createElement)(J["default"],{id:u,length:x.length,queryLength:O.length,minQueryLength:o,selectedOption:this.templateInputValue(x[C]),selectedOptionIndex:C,validChoiceMade:E,isInFocus:null!==this.state.focused,tQueryTooShort:f,tNoResults:d,tSelectedOption:h,tResults:m}),K&&(0,$.createElement)("span",null,(0,$.createElement)("input",{className:W,readonly:!0,tabIndex:"-1",value:K})),(0,$.createElement)("input",X({"aria-expanded":w?"true":"false","aria-activedescendant":!!F&&u+"__option--"+_,"aria-owns":u+"__listbox","aria-autocomplete":this.hasAutoselect()?"both":"list"},z,{autoComplete:"off",className:""+L+T+B,id:u,onClick:function(e){return i.handleInputClick(e)},onBlur:this.handleInputBlur},function G(e){return{onInput:e}}(this.handleInputChange),{onFocus:this.handleInputFocus,name:a,placeholder:s,ref:function(e){i.elementReferences[-1]=e},type:"text",role:"combobox",required:l,value:O})),e,(0,$.createElement)("ul",{className:R+" "+U+" "+V,onMouseLeave:function(e){return i.handleListMouseLeave(e)},id:u+"__listbox",role:"listbox"},x.map(function(e,t){var n=(-1===_?C===t:_===t)&&null===b?" "+q+"--focused":"",r=t%2?" "+q+"--odd":"",o=Y()?"<span id="+u+"__option-suffix--"+t+' style="border:0;clip:rect(0 0 0 0);height:1px;marginBottom:-1px;marginRight:-1px;overflow:hidden;padding:0;position:absolute;whiteSpace:nowrap;width:1px"> '+(t+1)+" of "+x.length+"</span>":"";return(0,$.createElement)("li",{"aria-selected":_===t?"true":"false",className:""+q+n+r,dangerouslySetInnerHTML:{__html:i.templateSuggestion(e)+o},id:u+"__option--"+t,key:t,onBlur:function(e){return i.handleOptionBlur(e,t)},onClick:function(e){return i.handleOptionClick(e,t)},onMouseDown:i.handleOptionMouseDown,onMouseEnter:function(e){return i.handleOptionMouseEnter(e,t)},ref:function(e){i.elementReferences[t]=e},role:"option",tabIndex:"-1","aria-posinset":t+1,"aria-setsize":x.length})}),P&&(0,$.createElement)("li",{className:q+" "+q+"--no-results"},p())),(0,$.createElement)("span",{id:Q,style:{display:"none"}},v()))},e}($.Component);(t["default"]=a).defaultProps={autoselect:!1,cssNamespace:"autocomplete",defaultValue:"",displayMenu:"inline",minLength:0,name:"input-autocomplete",placeholder:"",onConfirm:function(){},confirmOnBlur:!0,showNoOptionsFound:!0,showAllValues:!1,required:!1,tNoResults:function(){return"No results found"},tAssistiveHint:function(){return"When autocomplete results are available use up and down arrows to review and enter to select.  Touch device users, explore by touch or with swipe gestures."},dropdownArrow:r["default"]}},function(e,t,r){var o=r(9),i=r(53),u=r(28),a=r(26)("IE_PROTO"),s=function(){},l="prototype",c=function(){var e,t=r(15)("iframe"),n=u.length;for(t.style.display="none",r(54).appendChild(t),t.src="javascript:",(e=t.contentWindow.document).open(),e.write("<script>document.F=Object<\/script>"),e.close(),c=e.F;n--;)delete c[l][u[n]];return c()};e.exports=Object.create||function(e,t){var n;return null!==e?(s[l]=o(e),n=new s,s[l]=null,n[a]=e):n=c(),t===undefined?n:i(n,t)}},function(e,t,n){var u=n(8),a=n(9),s=n(20);e.exports=n(3)?Object.defineProperties:function(e,t){a(e);for(var n,r=s(t),o=r.length,i=0;i<o;)u.f(e,n=r[i++],t[n]);return e}},function(e,t,n){var r=n(1).document;e.exports=r&&r.documentElement},function(e,t,n){var r=n(0);r(r.P,"Function",{bind:n(56)})},function(e,t,n){"use strict";var i=n(19),u=n(2),a=n(57),s=[].slice,l={};e.exports=Function.bind||function(t){var n=i(this),r=s.call(arguments,1),o=function(){var e=r.concat(s.call(arguments));return this instanceof o?function(e,t,n){if(!(t in l)){for(var r=[],o=0;o<t;o++)r[o]="a["+o+"]";l[t]=Function("F,a","return new F("+r.join(",")+")")}return l[t](e,n)}(n,e.length,e):a(n,e,t)};return u(n.prototype)&&(o.prototype=n.prototype),o}},function(e,t){e.exports=function(e,t,n){var r=n===undefined;switch(t.length){case 0:return r?e():e.call(n);case 1:return r?e(t[0]):e.call(n,t[0]);case 2:return r?e(t[0],t[1]):e.call(n,t[0],t[1]);case 3:return r?e(t[0],t[1],t[2]):e.call(n,t[0],t[1],t[2]);case 4:return r?e(t[0],t[1],t[2],t[3]):e.call(n,t[0],t[1],t[2],t[3])}return e.apply(n,t)}},function(e,t,n){n(59)("match",1,function(r,o,e){return[function(e){"use strict";var t=r(this),n=e==undefined?undefined:e[o];return n!==undefined?n.call(e,t):new RegExp(e)[o](String(t))},e]})},function(e,t,n){"use strict";var a=n(7),s=n(16),l=n(4),c=n(12),p=n(34);e.exports=function(t,e,n){var r=p(t),o=n(c,r,""[t]),i=o[0],u=o[1];l(function(){var e={};return e[r]=function(){return 7},7!=""[t](e)})&&(s(String.prototype,t,i),a(RegExp.prototype,r,2==e?function(e,t){return u.call(e,this,t)}:function(e){return u.call(e,this)}))}},function(e,t,n){"use strict";t.__esModule=!0,t["default"]=void 0,n(36);var _=n(5);var r=function r(o,i,u){var a;return function(){var e=this,t=arguments,n=function n(){a=null,u||o.apply(e,t)},r=u&&!a;clearTimeout(a),a=setTimeout(n,i),r&&o.apply(e,t)}},o=function(o){function e(){for(var e,t=arguments.length,n=new Array(t),r=0;r<t;r++)n[r]=arguments[r];return(e=o.call.apply(o,[this].concat(n))||this).state={bump:!1,debounced:!1},e}(function n(e,t){e.prototype=Object.create(t.prototype),(e.prototype.constructor=e).__proto__=t})(e,o);var t=e.prototype;return t.componentWillMount=function(){var e=this;this.debounceStatusUpdate=r(function(){if(!e.state.debounced){var t=!e.props.isInFocus||e.props.validChoiceMade;e.setState(function(e){return{bump:!e.bump,debounced:!0,silenced:t}})}},1400)},t.componentWillReceiveProps=function(e){e.queryLength;this.setState({debounced:!1})},t.render=function(){var e=this.props,t=e.id,n=e.length,r=e.queryLength,o=e.minQueryLength,i=e.selectedOption,u=e.selectedOptionIndex,a=e.tQueryTooShort,s=e.tNoResults,l=e.tSelectedOption,c=e.tResults,p=this.state,f=p.bump,d=p.debounced,h=p.silenced,m=r<o,v=0===n,y=i?l(i,n,u):"",g=null;return g=m?a(o):v?s():c(n,y),this.debounceStatusUpdate(),(0,_.createElement)("div",{style:{border:"0",clip:"rect(0 0 0 0)",height:"1px",marginBottom:"-1px",marginRight:"-1px",overflow:"hidden",padding:"0",position:"absolute",whiteSpace:"nowrap",width:"1px"}},(0,_.createElement)("div",{id:t+"__status--A",role:"status","aria-atomic":"true","aria-live":"polite"},!h&&d&&f?g:""),(0,_.createElement)("div",{id:t+"__status--B",role:"status","aria-atomic":"true","aria-live":"polite"},h||!d||f?"":g))},e}(_.Component);(t["default"]=o).defaultProps={tQueryTooShort:function(e){return"Type in "+e+" or more characters for results"},tNoResults:function(){return"No search results"},tSelectedOption:function(e,t,n){return e+" "+(n+1)+" of "+t+" is highlighted"},tResults:function(e,t){return e+" "+(1===e?"result":"results")+" "+(1===e?"is":"are")+" available. "+t}}},function(e,t,n){"use strict";t.__esModule=!0,t["default"]=void 0;var r=n(5),o=function i(e){var t=e.className;return(0,r.createElement)("svg",{version:"1.1",xmlns:"http://www.w3.org/2000/svg",className:t,focusable:"false"},(0,r.createElement)("g",{stroke:"none",fill:"none","fill-rule":"evenodd"},(0,r.createElement)("polygon",{fill:"#000000",points:"0 0 22 0 11 17"})))};t["default"]=o}])["default"]});
// Find Provider 
let isFapSearchInProgress = false;

function FindProvider(
    findProvidersApiUri,
    findProvidersAppId,
    findProvidersApiKey,
    qualificationArticleMap) {

    if (typeof findProvidersApiUri === "undefined" ||
        typeof findProvidersAppId === "undefined" ||
        typeof findProvidersApiKey === "undefined") {
        console.log('findProvider script requires findProviderApiUri, findProviderAppId and findProviderApiKey parameters');
        return;
    }

    if (findProvidersApiUri !== null && findProvidersApiUri.substr(-1) !== '/') findProvidersApiUri += '/';

    let activeSearchQuery = null;
    let currentPage = 0;
    let currentSearchTerm = null;
    let currentQualificationIds = [];

    //initialize autocomplete
    new LocationAutocomplete(findProvidersApiUri);

    if ($("#tl-skill-area-filter").length) loadRoutes();

    //Check for search term query parameter
    let searchTerm = getUrlParameter("searchTerm");
    if (searchTerm) {
        searchTerm = urlDecode(searchTerm);
        //Remove query string from url
        const urlSplit = (window.location.href).split("?");
        const obj = { Title: document.title, Url: urlSplit[0] };
        history.pushState(obj, obj.Title, obj.Url);
        providerSearch(searchTerm);
    } else {
        $('.tl-fap--noresult').removeClass("tl-hidden");
    }

    $('#tl-search-term').keypress(function (e) {
        if (e.which === 13) {
            $("#tl-search-providers").click();
            return false;
        }
    });

    $("#tl-search-providers").click(function () {
        return providerSearch($("#tl-search-term").val().trim(), getQualificationIds());
    });

    function qualificationSelectionChanged() {
        if (!$("#tl-search-term").val().trim()) return false;

        console.log('checkboxes changed- calling search');
        return providerSearch($("#tl-search-term").val().trim(), getQualificationIds());
    }

    $(".tl-fap-search-providers-form").submit(function () {
        event.preventDefault();
    });

    $("#tl-next-results-link").click(function () {
        event.stopPropagation();
        event.preventDefault();
        callProviderSearchApi(currentSearchTerm, currentQualificationIds, currentPage + 1);
        return false;
    });

    function getQualificationIds() {
        const qualificationIds = [];
        $('#tl-skill-area-filter .tl-checkbox:checked').each(
            function (_, item) {
                qualificationIds.push(item.value);
            });

        return qualificationIds;
    }

    function loadRoutes() {
        const uri = findProvidersApiUri + "routes";
        $.ajax({
            type: "GET",
            url: uri,
            contentType: "application/json",
            beforeSend: function (xhr) {
                addHmacAuthHeader(xhr, uri, findProvidersAppId, findProvidersApiKey);
            }
        }).done(function (response) {
            populateRoutes(response);
        }).fail(function (error) {
            console.log('Call to get routes failed. ' + error);
        });
    }

    let details = null;
    let showAll = null;

    function populateRoutes(data) {
        const skillAreasList = $("#tl-skill-area-filter");
        skillAreasList.find(".tl-fap--filter--section").remove();

        $.each(data,
            function (_, item) {
                if (!item.numberOfQualificationsOffered) return;

                let skillArea = '<div class="tl-fap--filter--section"> \
                                   <h4 class="govuk-heading-s govuk-!-margin-top-2">' +
                    item.name + '<br /> \
                                     <span class="govuk-body-s tl-text--grey" id="tl-fap--filter--checkstatus"></span> \
                                    </h4> \
                                    <details class="tl-fap--filter--details"> \
                                    <summary data-open="Hide T Levels" data-close="Show T Levels" class="govuk-!-margin-bottom-1"></summary> \
                                    <div>';

                $.each(item.qualifications,
                    function (_, qualification) {
                        const qualificationId = 'tl_subject_' + qualification.id;
                        skillArea += '<div class="govuk-checkboxes govuk-checkboxes--small"> \
                                                    <div class="govuk-checkboxes__item"> \
                                                        <input id="' + qualificationId +
                            '" name="' + qualificationId +
                            '" type="checkbox" ' +
                            'value="' + qualification.id +
                            '" class="tl-checkbox govuk-checkboxes__input"> \
                                                        <label for="' + qualificationId +
                            '" class="govuk-body-s govuk-checkboxes__label">' + qualification.name + '</label> \
                                                    </div> \
                                                </div>';
                    });

                skillArea += '        </div> \
                                            </details> \
                                            <hr class="govuk-section-break govuk-section-break--visible govuk-!-margin-bottom-4 govuk-!-margin-top-2"> \
                                        </div>';

                skillAreasList.append(skillArea);
            });

        addCheckboxHandlers();
    };

    function providerSearch(searchTerm, qualificationIds, page) {
        clearProviderSearchResults();
        searchTerm = searchTerm ? searchTerm.trim() : "";
        if (searchTerm === "") {
            if (event) event.stopPropagation();
            showSearchTermError("Enter postcode or town");
            return false;
        }

        if (!searchTerm.match(/^[0-9a-zA-Z,\.'\-!&\(\)/\s]+$/)) {
            if (event) event.stopPropagation();
            showSearchTermError("Enter a valid postcode or town");
            return false;
        }

        callProviderSearchApi(searchTerm, qualificationIds, page);

        return true;
    }

    function callProviderSearchApi(searchTerm, qualificationIds, page, pageSize) {
        //if (isFapSearchInProgress) return false;
        isFapSearchInProgress = true;

        page = (page === undefined ? 0 : page);
        pageSize = (pageSize === undefined ? 5 : pageSize);

        const encodedSearchTerm = encodeURIComponent(searchTerm).replace(/'/g, '%27');
        let uri = findProvidersApiUri + "providers?searchTerm=" + encodedSearchTerm + '&page=' + page + '&pageSize=' + pageSize;

        if (qualificationIds && qualificationIds.length > 0) {
            qualificationIds.forEach(function (id) {
                uri += "&qualificationId=" + id;
            });
        }

        //Assign uri to global level variable, then check when query returns to see if it's changed
        activeSearchQuery = uri;

        $.ajax({
            type: "GET",
            url: uri,
            contentType: "application/json",
            beforeSend: function (xhr) {
                addHmacAuthHeader(xhr, uri, findProvidersAppId, findProvidersApiKey);
            }
        }).done(function (response) {
            if (response.error) {
                console.log("Invalid providers search response received - " + response.error);
                showSearchTermError("Enter a valid postcode or town");
            } else if (activeSearchQuery !== uri) {
                console.log('ignoring results because current query does not match active query:');
                console.log('uri = ' + uri);
                console.log('active query = ' + activeSearchQuery);
                return;
            } else {
                console.log('search results ok for ' + uri);
                currentPage = page;
                currentSearchTerm = searchTerm;
                currentQualificationIds = qualificationIds;
                populateProviderSearchResults(response, page, pageSize);
            }
            setTimeout(function () {
                //delay to avoid autocomplete suggestions loading
                isFapSearchInProgress = false;
            }, 200);
        }).fail(function (jqxhr) {
            showError(jqxhr.status, jqxhr.responseText);
            isFapSearchInProgress = false;
        });

        return true;
    }

    function clearProviderSearchResults() {
        $('#tl-error').addClass("tl-hidden");
        $('#tl-search-term-error').addClass("tl-hidden");
        $('.tl-fap--noresult').addClass("tl-hidden");
        $("#tl-next-results-link").addClass("tl-hidden");
        $("#tl-fap--results").find(".tl-fap--result").remove();
        currentPage = 0;
    }

    function populateProviderSearchResults(data, page, pageSize) {
        if (data.searchTerm && data.searchTerm !== $("#tl-search-term").val()) {
            $("#tl-search-term").val(data.searchTerm);
        }

        if ((!data.searchResults || data.searchResults.length === 0) && currentPage === 0) {
            $('.tl-fap--noresult').removeClass("tl-hidden");
            return;
        }

        $.each(data.searchResults,
            function (_, providerLocation) {
                let searchResult =
                    '<div class="tl-fap--result"> \
                             <h3 class="govuk-heading-m govuk-!-margin-bottom-1">' + providerLocation.providerName + ' <span class="tl-fap--distance">' + providerLocation.distance.toFixed(0) + ' miles</span></h3> \
                             <p class="govuk-body"><span>' + providerLocation.town + '</span> | ' + providerLocation.postcode + '</p>';

                const locationDeliveryYears = [];
                let availableNow = null;
                $.each(providerLocation.deliveryYears,
                    function (_, deliveryYear) {
                        if (typeof deliveryYear.routes === "undefined") return;

                        if (deliveryYear.isAvailableNow) {
                            if (availableNow) {
                                for (let i = 0; i < deliveryYear.routes.length; i++) {
                                    if (availableNow.routes.filter(function (r) { return r.name === deliveryYear.routes[i].name; }).length === 0)
                                        availableNow.routes.push(deliveryYear.routes[i]);
                                }
                            } else {
                                availableNow = deliveryYear;
                                locationDeliveryYears.push(availableNow);
                            }
                        } else {
                            locationDeliveryYears.push(deliveryYear);
                        }
                    });

                if (availableNow && !typeof availableNow.routes !== "undefined" && availableNow.routes) {
                    availableNow.routes.sort(function (x, y) { return (x.name < y.name) ? -1 : ((x.name > y.name) ? 1 : 0) });
                }
                //Obsolete v2 code
                if (availableNow && !typeof availableNow.qualifications !== "undefined" && availableNow.qualifications) {
                    availableNow.qualifications.sort(function (x, y) { return (x.name < y.name) ? -1 : ((x.name > y.name) ? 1 : 0) });
                }
                /////

                searchResult += '</p><div class="tl-fap--courses">';

                $.each(locationDeliveryYears,
                    function (_, deliveryYear) {
                        if (deliveryYear.isAvailableNow) {
                            searchResult += '<div class="tl-fap--courses--box tl-fap--courses--box--now"> \
                                        <h4 class="govuk-body govuk-!-font-weight-bold">T Levels available now:</h4>';
                        } else {
                            searchResult += '<div class="tl-fap--courses--box"> \
                                        <h4 class="govuk-body govuk-!-font-weight-bold">T Levels starting September  ' + deliveryYear.year + '</h4>';
                        }

                        //Obsolete v2 code
                        if ((!typeof deliveryYear.routes === "undefined" || deliveryYear.routes === null) &&
                            (typeof deliveryYear.qualifications !== "undefined" || deliveryYear.qualifications !== null)) {
                            console.log('using v2 qualifications');
                            searchResult += '<ul class="govuk-list govuk-list--bullet govuk-!-margin-bottom-1">';
                            $.each(deliveryYear.qualifications,
                                function (_, qualification) {
                                    const articleLink = typeof qualificationArticleMap !== "undefined" ?
                                        qualificationArticleMap[qualification.id] : null;
                                    if (articleLink) {
                                        searchResult += '<li><a target="_blank" class="govuk-link tl-fap--result-course" href="' + articleLink + '">' + qualification.name + '</a></li>';
                                    } else {
                                        searchResult += '<li>' + qualification.name + '</li>';
                                    }
                                });
                            return;
                        }
                        /////

                        if (!typeof deliveryYear.routes === "undefined" || deliveryYear.routes === null) return;

                        $.each(deliveryYear.routes,
                            function (_, route) {
                                searchResult += '<p class="govuk-body govuk-!-margin-top-2 govuk-!-margin-bottom-1">' + route.name + '</p> \
                                <ul class="govuk-list govuk-list--bullet govuk-!-margin-bottom-1">';

                                $.each(route.qualifications,
                                    function (_, qualification) {
                                        const articleLink = typeof qualificationArticleMap !== "undefined" ?
                                            qualificationArticleMap[qualification.id] : null;
                                        if (articleLink) {
                                            searchResult += '<li><a target="_blank" class="govuk-link tl-fap--result-course" href="' + articleLink + '">' + qualification.name + '</a></li>';
                                        } else {
                                            searchResult += '<li>' + qualification.name + '</li>';
                                        }
                                    });

                                searchResult += '</ul>';
                            });

                        searchResult += '</div>';
                    });
                searchResult += '</div>';

                if (providerLocation.telephone || providerLocation.website || providerLocation.email) {
                    let contactDetails = providerLocation.telephone
                        ? 'Telephone: <strong>' + providerLocation.telephone + '</strong>'
                        : "";
                    if (providerLocation.website) {
                        if (contactDetails) contactDetails += ' | ';
                        contactDetails += '<a target="_blank" href="' + providerLocation.website + '" class="govuk-link tl-fap--result-website">Visit <span class="govuk-visually-hidden">' + providerLocation.providerName + '</span> website</a>';
                    }
                    if (providerLocation.email) {
                        if (contactDetails) contactDetails += ' | ';
                        contactDetails += 'Email: <a href="mailto:' + providerLocation.email + '" class="govuk-link govuk-!-margin-right-4 tl-fap--result-email">' + providerLocation.email + '</a>';
                    }

                    searchResult += '<h4 class="govuk-body govuk-!-font-weight-bold govuk-!-margin-top-5 govuk-!-margin-bottom-2">Get in touch</h4> \
                        <p class="govuk-body">' + contactDetails + '</p>';
                }

                $("#tl-fap--results").append(searchResult);
            });

        if (typeof data.totalResults !== "undefined" &&
            data.totalResults !== null &&
            data.totalResults <= ((page + 1) * pageSize)) {
            $('#tl-next-results-link').addClass("tl-hidden");
        } else {
            $('#tl-next-results-link').removeClass("tl-hidden");
        }
    }

    function showError(status, errorText) {
        console.log("Error status " + status + " was encountered. " + errorText);
        switch (status) {
            case 0:
                $("#tl-error-header").text('There is a problem with your network connection.');
                $("#tl-error-detail").html('There is a problem with your network connection. Check you’re connected to the internet and try again.');
                break;
            default:
                $("#tl-error-header").text('Sorry, there is a problem with the service.');
                $("#tl-error-detail").html('Try again later or <a class="govuk-link tl-error--contact" href="https://test.employers.tlevels.gov.uk/hc/en-gb/requests/new">contact us</a> quoting error code ' + status);
        }

        clearProviderSearchResults();
        $('#tl-error').removeClass("tl-hidden");
    }

    function showSearchTermError(message) {
        $("#tl-search-term-error").text(message);
        $('#tl-search-term-error').removeClass("tl-hidden");
        $('#tl-error').addClass("tl-hidden");
        $('.tl-fap--noresult').removeClass("tl-hidden");
    }

    function addHmacAuthHeader(xhr, uri, appId, apiKey) {
        const ts = Math.round((new Date()).getTime() / 1000);
        const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
            function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        const nonce = CryptoJS.enc.Hex.parse(uuid);
        const data = appId + "GET" + uri.toLowerCase() + ts + nonce;

        const hash = CryptoJS.HmacSHA256(data, apiKey);
        const hashInBase64 = CryptoJS.enc.Base64.stringify(hash);

        xhr.setRequestHeader("Authorization", "amx " + appId + ":" + hashInBase64 + ":" + nonce + ":" + ts);
    }

    function urlDecode(str) {
        return decodeURIComponent((str + '').replace(/\+/g, '%20'));
    }

    function getUrlParameter(key, url) {
        if (!url) {
            url = window.location.search.substring(1);
        }
        const urlVars = url.split('&');
        for (let i = 0; i < urlVars.length; i++) {
            const parameter = urlVars[i].split('=');
            if (parameter[0] === key) {
                return parameter[1];
            }
        }

        return null;
    }

    //filter list javascript
    function checkChange() {
        const totalNumberOfChecked = $(this).parents('.tl-fap--filter--content').find('input[type=checkbox]:checked');
        const numberOfChecked = $(this).parents('.tl-fap--filter--section').find('input[type=checkbox]:checked');
        const totalCheckboxes = $(this).parents('.tl-fap--filter--section').find('input[type=checkbox]');

        /// Display number of checked items in each section
        $(this).parents('.tl-fap--filter--section').find('#tl-fap--filter--checkstatus').html("(" + numberOfChecked.length + " of " + totalCheckboxes.length + " selected)");

        /// Get checked items and display at top
        const checkedSection = $(this).parents('.tl-fap--filter--content').find('input[type=checkbox]:checked').parents('.tl-fap--filter--section');
        if (totalNumberOfChecked.length !== 0) {
            $(".tl-fap--filter--selected").html('');

            checkedSection.each(function () {
                var checkedSectionBoxes = $(this).find('input[type=checkbox]:checked');
                if (checkedSectionBoxes.length !== 0) {
                    $(".tl-fap--filter--selected").append('<h5>' + $(this).find("h4").clone().children().remove().end().text() + '</h5>');

                    checkedSectionBoxes.each(function () {
                        var checkedSectionValue = $(this).attr("id");
                        $(".tl-fap--filter--selected").append('<span tabindex="0" data-check="' + checkedSectionValue + '">' + $(this).next("label").text() + '</span>');
                    });
                }
            });
        }
        else {
            $(".tl-fap--filter--selected").html('<p class="govuk-body-s govuk-!-margin-bottom-1">No filters selected</p>');
        }
    };

    /// Allow checkboxes to be unchecked by clicking summary items at top
    function checkRemove() {
        const clickvalue = $(this).attr("data-check");
        $('.tl-fap--filter--section').find('input[id=' + clickvalue + ']:checked').trigger("click");
    };
    $(document).on("click", ".tl-fap--filter--selected span", checkRemove);

    function checkDetailsChange() {
        details.each(function () {
            if ($(this).is("[open]")) {
                showAllOpen();
                return false;
            } else {
                showAllClose();
            }
        });
    };

    function showAllClose() {
        showAll.removeAttr("open");
        showAll.text("Show all");
    }

    function showAllOpen() {
        showAll.attr('open', '');
        showAll.text("Hide all");
    }

    function addCheckboxHandlers() {
        /// Run checkbox change function on page load and on checkbox change
        $('.tl-fap--filter--content input[type=checkbox]').change(checkChange);
        $(".tl-fap--filter--section .govuk-checkboxes").each(checkChange);
        $('.tl-fap--filter--content input[type=checkbox]').change(qualificationSelectionChanged);

        /// Show hide sections / all sections
        details = $(".tl-fap--filter--details");
        showAll = $(".tl-fap--filter--showall");

        details.on('toggle',
            function () {
                checkDetailsChange();
            });

            showAll.click(function () {
                if ($(this).is("[open]")) {
                    details.removeAttr("open");
                    showAllClose();
                } else {
                    details.attr('open', '');
                    showAllOpen();
                }
        });
    }

    $("#tl-fap--filter--button").click(function () {
        if ($(this).is("[open]")) {
            $(this).removeAttr("open");
            $(".tl-fap--filter").removeAttr("open");
            $(this).text("Show filter");
        }
        else {
            $(this).attr('open', '');;
            $(".tl-fap--filter").attr('open', '');;
            $(this).text("Hide filter");
        }
    });
};

function LocationAutocomplete(findProvidersApiUri) {
    var that = this;
    this.findProvidersApiUri = findProvidersApiUri;

    const $keywordsInput = $('#tl-search-term');

    if (!$keywordsInput.length) console.log('autocomplete #tl-search-term not found');

    $keywordsInput.wrap('<div id="autocomplete-container" class="tl-autocomplete-wrap"></div>');
    const container = document.querySelector('#autocomplete-container');
    $(container).empty();

    function getSuggestions(query, populateResults) {
        if ((typeof isFapSearchInProgress !== 'undefined' && isFapSearchInProgress)
            || /\d/.test(query)) {
            return;
        }
        var results = [];
        $.ajax({
            url: that.findProvidersApiUri + "locations",
            type: "get",
            dataType: 'json',
            data: { searchTerm: query }
        }).done(function (data) {
            results = data.map(function (r) {
                return getLocationDisplayName(r);
            });
            populateResults(results);
        });
    }

    function getLocationDisplayName(item) {
        if (item.county) return item.name + ', ' + item.county;
        else if (item.la) return item.name + ', ' + item.la;
        return item.name;
    }

    function onConfirm(confirmed) {
    }

    accessibleAutocomplete({
        element: container,
        id: 'tl-search-term',
        name: 'tl-search-term', 
        displayMenu: 'overlay',
        showNoOptionsFound: false,
        minLength: 3,
        source: getSuggestions,
        placeholder: "Enter postcode or town",
        onConfirm: onConfirm,
        confirmOnBlur: false,
        autoselect: true
    });
};

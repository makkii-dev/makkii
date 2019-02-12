// polyfill unit8array
if (!Uint8Array.prototype.fill) {
    Uint8Array.prototype.fill = function (value) {
        // Steps 1-2.
        if (this == null) {
            throw new TypeError('this is null or not defined');
        }

        let O = Object(this);

        // Steps 3-5.
        let len = O.length >>> 0;

        // Steps 6-7.
        let start = arguments[1];
        let relativeStart = start >> 0;

        // Step 8.
        let k = relativeStart < 0 ?
            Math.max(len + relativeStart, 0) :
            Math.min(relativeStart, len);

        // Steps 9-10.
        let end = arguments[2];
        let relativeEnd = end === undefined ?
            len : end >> 0;

        // Step 11.
        let final = relativeEnd < 0 ?
            Math.max(len + relativeEnd, 0) :
            Math.min(relativeEnd, len);

        // Step 12.
        while (k < final) {
            O[k] = value;
            k++;
        }

        // Step 13.
        return O;
    };
}

if (typeof btoa === 'undefined') {
    global.btoa = function (str) {
        return new Buffer(str, 'binary').toString('base64');
    };
}

if (typeof atob === 'undefined') {
    global.atob = function (b64Encoded) {
        return new Buffer(b64Encoded, 'base64').toString('binary');
    };
}

require('crypto');
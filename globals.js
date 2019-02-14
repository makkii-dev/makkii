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

if(!Date.prototype.Format){
    Date.prototype.Format = function (fmt) {
        let o = {
            "M+": this.getMonth() + 1, //month 
            "d+": this.getDate(), //day 
            "h+": this.getHours() % 12, //hour 
            "m+": this.getMinutes(), //minute 
            "s+": this.getSeconds(), //seconds 
            "q+": Math.floor((this.getMonth() + 3) / 3), //quarter 
            "S": this.getMilliseconds() //milliseconds 
        };
        if (/(y+)/.test(fmt))
            fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substring(4 - RegExp.$1.length));
        for (let k in o){
            if (new RegExp("(" + k + ")").test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substring(("" + o[k]).length)));
            }
        }
        fmt = this.getHours() > 12 ? fmt + 'PM' : fmt + 'AM';
        return fmt;
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
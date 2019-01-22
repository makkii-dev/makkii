import crypto from 'crypto-browserify';
import {Buffer} from 'buffer';
import BigNumber from "bignumber.js";

/**
 *
 * @param str
 * @returns {string}
 */
const appendHexStart = (str) =>{
  let str1 = str.startsWith('0x')? str.substring(2): str;
  let str2 = str1.length % 2 ? '0' + str1: str1;
  return '0x' + str2;
};

export class Crypto{
    static hmacSha512 = (key,str) => {
        const hmac = crypto.createHmac('sha512', new Buffer(key, 'utf-8'));
        return hmac.update(new Buffer(str, 'utf-8')).digest();
    };

    /**
     *
     * @param value
     * @returns {string}
     */
    static toHex(value) {
        if (!value) {
            return '0x00';
        } else if (typeof value === 'string') {
            return appendHexStart(value);
        } else if (value instanceof Buffer) {
            return '0x' + value.toString('hex');
        } else if (typeof value === 'number') {
            return appendHexStart(value.toString(16));
        } else if (value instanceof Uint8Array) {
            return '0x' + Buffer.from(value).toString('hex');
        } else {
            throw value;
        }


    }

}
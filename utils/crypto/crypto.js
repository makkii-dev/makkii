import crypto from 'react-native-crypto';
import {keccak256} from './sha3';
var bs58check = require('bs58check');

class Crypto{
    static hmacSha512 = (key,str) => {
        const hmac = crypto.createHmac('sha512', new Buffer(key, 'utf-8'));
        return hmac.update(new Buffer(str, 'utf-8')).digest();
    };
}

function base58check2HexString(str) {
    return bs58check.decode(str).toString('hex');
}

module.exports = {
    Crypto,
    keccak256,
    base58check2HexString,
}
import crypto from 'react-native-crypto';
import keccak256 from './sha3';

const bs58check = require('bs58check');

class Crypto {
    static hmacSha512 = (key, str) => {
        const hmac = crypto.createHmac('sha512', Buffer.from(key, 'utf-8'));
        return hmac.update(Buffer.from(str, 'utf-8')).digest();
    };
}

function base58check2HexString(str) {
    return bs58check.decode(str).toString('hex');
}

module.exports = {
    Crypto,
    keccak256,
    base58check2HexString,
};

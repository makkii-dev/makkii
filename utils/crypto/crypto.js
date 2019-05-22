import crypto from 'react-native-crypto';
import {keccak256} from './sha3';

class Crypto{
    static hmacSha512 = (key,str) => {
        const hmac = crypto.createHmac('sha512', new Buffer(key, 'utf-8'));
        return hmac.update(new Buffer(str, 'utf-8')).digest();
    };
}

module.exports = {
    Crypto,
    keccak256,
}
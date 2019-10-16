import scrypt from 'react-native-scrypt';

const aes = require('browserify-aes');
const crypto = require('crypto');
const bs58check = require('bs58check');
const xor = require('buffer-xor/inplace');
const ecurve = require('ecurve');
const BigInteger = require('bigi');
const assert = require('assert');

const curve = ecurve.getCurveByName('secp256k1');
let NULL = Buffer.alloc(0);
let SCRYPT_PARAMS = {
    N: 16384, // specified by BIP38
    r: 8,
    p: 8,
};

const hash160 = buffer => {
    let hash = crypto.createHash('rmd160');
    return hash
        .update(
            crypto
                .createHash('sha256')
                .update(buffer)
                .digest(),
        )
        .digest();
};

const hash256 = buffer => {
    return crypto
        .createHash('sha256')
        .update(
            crypto
                .createHash('sha256')
                .update(buffer)
                .digest(),
        )
        .digest();
};

const getAddress = (d, compressed) => {
    const Q = curve.G.multiply(d).getEncoded(compressed);
    let hash = hash160(Q);
    let payload = Buffer.allocUnsafe(21);
    payload.writeUInt8(0x00, 0); // XXX TODO FIXME bitcoin only??? damn you BIP38
    hash.copy(payload, 1);

    return bs58check.encode(payload);
};

const prepareEncryptRaw = (buffer, compressed, scryptParams) => {
    if (buffer.length !== 32) throw new Error('Invalid private key length');

    let d = BigInteger.fromBuffer(buffer);
    let address = getAddress(d, compressed);
    let salt = hash256(address).slice(0, 4);

    let N = scryptParams.N;
    let r = scryptParams.r;
    let p = scryptParams.p;

    return {
        salt,
        N,
        r,
        p,
    };
};

const finishEncryptRaw = (buffer, compressed, salt, scryptBuf) => {
    let derivedHalf1 = scryptBuf.slice(0, 32);
    let derivedHalf2 = scryptBuf.slice(32, 64);

    let xorBuf = xor(derivedHalf1, buffer);
    let cipher = aes.createCipheriv('aes-256-ecb', derivedHalf2, NULL);
    cipher.setAutoPadding(false);
    cipher.end(xorBuf);

    let cipherText = cipher.read();

    // 0x01 | 0x42 | flagByte | salt (4) | cipherText (32)
    let result = Buffer.allocUnsafe(7 + 32);
    result.writeUInt8(0x01, 0);
    result.writeUInt8(0x42, 1);
    result.writeUInt8(compressed ? 0xe0 : 0xc0, 2);
    salt.copy(result, 3);
    cipherText.copy(result, 7);

    return result;
};

async function encryptRawAsync(buffer, compressed, passphrase, scryptParams) {
    scryptParams = scryptParams || SCRYPT_PARAMS;
    const { salt, N, r, p } = prepareEncryptRaw(buffer, compressed, scryptParams);
    let scryptBuf = Buffer.from(await scrypt(passphrase, Object.values(salt), N, r, p, 64), 'hex');
    return finishEncryptRaw(buffer, compressed, salt, scryptBuf);
}
async function encryptAsync(buffer, compressed, passphrase, scryptParams) {
    return bs58check.encode(await encryptRawAsync(buffer, compressed, passphrase, scryptParams));
}

function prepareDecryptRaw(buffer, scryptParams) {
    // 39 bytes: 2 bytes prefix, 37 bytes payload
    if (buffer.length !== 39) throw new Error('Invalid BIP38 data length');
    if (buffer.readUInt8(0) !== 0x01) throw new Error('Invalid BIP38 prefix');

    // check if BIP38 EC multiply
    let type = buffer.readUInt8(1);
    if (type === 0x43) return { decryptEC: true };
    if (type !== 0x42) throw new Error('Invalid BIP38 type');

    let flagByte = buffer.readUInt8(2);
    let compressed = flagByte === 0xe0;
    if (!compressed && flagByte !== 0xc0) throw new Error('Invalid BIP38 compression flag');

    let N = scryptParams.N;
    let r = scryptParams.r;
    let p = scryptParams.p;

    let salt = buffer.slice(3, 7);
    return {
        salt,
        compressed,
        N,
        r,
        p,
    };
}

function finishDecryptRaw(buffer, salt, compressed, scryptBuf) {
    let derivedHalf1 = scryptBuf.slice(0, 32);
    let derivedHalf2 = scryptBuf.slice(32, 64);

    let privKeyBuf = buffer.slice(7, 7 + 32);
    let decipher = aes.createDecipheriv('aes-256-ecb', derivedHalf2, NULL);
    decipher.setAutoPadding(false);
    decipher.end(privKeyBuf);

    let plainText = decipher.read();
    let privateKey = xor(derivedHalf1, plainText);

    // verify salt matches address
    let d = BigInteger.fromBuffer(privateKey);
    let address = getAddress(d, compressed);
    let checksum = hash256(address).slice(0, 4);
    assert.deepStrictEqual(salt, checksum);

    return {
        privateKey,
        compressed,
    };
}

async function decryptRawAsync(buffer, passphrase, progressCallback, scryptParams) {
    scryptParams = scryptParams || SCRYPT_PARAMS;
    const { salt, compressed, N, r, p } = prepareDecryptRaw(buffer, scryptParams);
    let scryptBuf = Buffer.from(await scrypt(passphrase, Object.values(salt), N, r, p, 64), 'hex');
    return finishDecryptRaw(buffer, salt, compressed, scryptBuf);
}

async function decryptAsync(string, passphrase, scryptParams) {
    return decryptRawAsync(bs58check.decode(string), passphrase, scryptParams);
}

export function verify(string) {
    let decoded = bs58check.decodeUnsafe(string);
    if (!decoded) return false;

    if (decoded.length !== 39) return false;
    if (decoded.readUInt8(0) !== 0x01) return false;

    let type = decoded.readUInt8(1);
    let flag = decoded.readUInt8(2);

    // encrypted WIF
    if (type === 0x42) {
        if (flag !== 0xc0 && flag !== 0xe0) return false;

        // EC mult
    } else if (type === 0x43) {
        if (flag & ~0x24) return false;
    } else {
        return false;
    }

    return true;
}

export default {
    encryptAsync,
    decryptAsync,
    verify,
};

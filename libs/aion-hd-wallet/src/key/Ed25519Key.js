import sodium from 'sodium-javascript';
import {Buffer} from 'buffer';
import blake2b from'blake2b';

const A0_IDENTIFIER = [0xA0];

export const signWithkey = (hash, sk) => {
    let signedMessage = new Buffer((new Uint8Array(64)));
    if (typeof hash === 'string') {
        hash = Buffer.from(hash, 'hex');
    }
    let res = sodium.crypto_sign_detached(signedMessage, hash, Buffer.from(sk));

    if (res === -1) {
        throw new Error("Message failed to sign");
    }
    return signedMessage;
};

export const verifyWithKey = (hash, signatureBuffer, pk) => {
    return sodium.crypto_sign_verify_detached(signatureBuffer, hash, pk);
};

export class Ed25519Key {
    secretKey;
    publicKey;
    address;

    constructor(sk, pk) {
        this.secretKey = sk;
        this.publicKey = pk;
        this.address = Ed25519Key.computeA0Address(pk);
    }

    /**
     *
     * @param sk
     * @returns {Ed25519Key}
     */
    static fromSecretKey = (sk) => {
        if (typeof sk == 'string') {
            if (sk.startsWith('0x')){
                sk = sk.substring(2);
            }
            sk = Buffer.from(sk, 'hex');
        }
        const secretKey = sk;
        const publicKey = sk.slice(32,64);
        return new Ed25519Key(secretKey,publicKey);
    };

    static fromSeed = (seed) => {
        let pk = new Buffer(new Uint8Array(32));
        let sk = new Buffer(new Uint8Array(64));
        let bufferSeed = new Buffer(seed);

        sodium.crypto_sign_seed_keypair(pk, sk, bufferSeed);

        return new Ed25519Key(sk, pk);
    };



    static computeA0Address = (publicKey) => {
        let addressHash = blake2b(32).update(Uint8Array.from(publicKey)).digest();
        addressHash.set(A0_IDENTIFIER, 0);
        return addressHash;
    };

    sign = (hash) => {
        return signWithkey(hash,this.secretKey);
    };

    verify = (hash, signatureBuffer) => {
        return verifyWithKey(hash, signatureBuffer, this.publicKey);
    };


}
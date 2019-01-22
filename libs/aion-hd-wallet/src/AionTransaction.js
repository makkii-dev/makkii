import BigNumber from 'bignumber.js';
import blake2b from 'blake2b';
import {Crypto} from "./utils/crypto";
import {AionRlp} from './utils/rlp';

const sigToBytes = (signature, publicKey) => {
    let fullSignature = new Uint8Array((signature.length + publicKey.length));
    fullSignature.set(publicKey, 0);
    fullSignature.set(signature, publicKey.length);
    return fullSignature;
};

export class AionTransaction {
    nonce;
    to;
    value;
    data;
    gas;
    gasPrice;
    timestamp;
    type;
    signature;
    /**
     * Signature with public key appended
     */
    fullSignature;

    /**
     *
     * @param params - example {
          nonce: '0x00',
          gasPrice: '0x09184e72a000',
          gasLimit: '0x2710',
          to: '0x0000000000000000000000000000000000000000',
          value: '0x00',
          data: '0x7f7465737432000000000000000000000000000000000000000000000000000000600057',
          type: 0,
          timestamp: ts
        }
     */
    constructor(params) {
        if (!params) {
            return;
        }

        this.setHexFieldOrNull('nonce', params.nonce);
        this.setHexFieldOrNull('type', params.type);

        if (!params.timestamp) {
            params.timestamp = new BigNumber(new Date().getTime());
        }

        this.setHexField('data', params.data);
        this.setHexField('timestamp', params.timestamp);
        this.setHexField('value', params.value);
        this.setHexField('to', params.to);
        this.setHexField('gas', params.gas);
        this.setHexField('gasPrice', params.gasPrice);

    }

    setHexFieldOrNull(field, value) {
        if (!value) {
            this[field] = '0x00';
        } else {
            this.setHexField(field, value);
        }
    }

    setHexField(field, value) {
        if (!value) {
            return;
        }
        this[field] = Crypto.toHex(value);
    }

    /**
     *
     * @returns {*}
     */
    getEncodedRaw = ()=>{
        let encodedTx = {};
        encodedTx.nonce = AionRlp.encode(this.nonce);
        encodedTx.to = AionRlp.encode(this.to);
        encodedTx.value = AionRlp.encode(this.value);
        encodedTx.data = AionRlp.encode(this.data);
        encodedTx.timestamp = AionRlp.encode(this.timestamp);
        encodedTx.gas = AionRlp.encodeLong(this.gas);
        encodedTx.gasPrice = AionRlp.encodeLong(this.gasPrice);
        encodedTx.type = AionRlp.encode(this.type);

        return AionRlp.encodeList([
            encodedTx.nonce,
            encodedTx.to,
            encodedTx.value,
            encodedTx.data,
            encodedTx.timestamp,
            encodedTx.gas,
            encodedTx.gasPrice,
            encodedTx.type,
        ]);
    };
    /**
     * Used in web3
     * @returns {*}
     */
    getEncoded = ()=>{
        let encodedTx = {};
        encodedTx.nonce = AionRlp.encode(this.nonce);
        encodedTx.to = AionRlp.encode(this.to);
        encodedTx.value = AionRlp.encode(this.value);
        encodedTx.data = AionRlp.encode(this.data);
        encodedTx.timestamp = AionRlp.encode(this.timestamp);
        encodedTx.gas = AionRlp.encodeLong(this.gas);
        encodedTx.gasPrice = AionRlp.encodeLong(this.gasPrice);
        encodedTx.type = AionRlp.encode(this.type);
        encodedTx.fullSignature = AionRlp.encode(new Buffer(this.fullSignature));

        return AionRlp.encodeList([
            encodedTx.nonce,
            encodedTx.to,
            encodedTx.value,
            encodedTx.data,
            encodedTx.timestamp,
            encodedTx.gas,
            encodedTx.gasPrice,
            encodedTx.type,
            encodedTx.fullSignature,
        ]);
    };

    getRawHash = () => {
        return blake2b(32).update(this.getEncodedRaw()).digest();
    };

    sign = (ecKey) => {
        this.signature = ecKey.sign(this.getRawHash());
        this.fullSignature = sigToBytes(this.signature, ecKey.publicKey);
    }
}
import BigNumber from 'bignumber.js';
import blake2b from 'blake2b';
import {AionRlp} from '../../libs/aion-hd-wallet/src/utils/rlp';
import wallet from 'react-native-aion-hw-wallet';
import keyStore from "react-native-makkii-core";
import {toHex} from '../../utils';

const sigToBytes = (signature, publicKey) => {
    let fullSignature = new Uint8Array((signature.length + publicKey.length));
    fullSignature.set(publicKey, 0);
    fullSignature.set(signature, publicKey.length);
    return fullSignature;
};

const hexString2Array=(str)=>{
    if (str.startsWith('0x')) {
        str = str.substring(2);
    }

    let result = [];
    while (str.length >= 2) {
        result.push(parseInt(str.substring(0, 2), 16));
        str = str.substring(2, str.length);
    }

    return result;
};

export class AionTransaction {
    sender;
    nonce;
    to;
    valueHex;
    value;
    data;
    gas;
    gasPrice;
    timestampHex;
    timestamp;
    type;
    signature;
    /**
     * Signature with public key appended
     */
    fullSignature;
    encoded;

    /**
     *
     * @param params - example {
          nonce: '0x00',
          gasPrice: '0x09184e72a000',
          gas: '0x2710',
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

        this.sender = params.sender;
        this.setHexFieldOrNull('nonce', params.nonce);
        this['type'] = params.type;

        if (!params.timestamp) {
            params.timestamp= new BigNumber(new Date().getTime() * 1000);
        }
        this.timestamp = params.timestamp;
        this.setHexField('data', params.data);
        this.setHexField('timestampHex', params.timestamp);
        this.setHexField('valueHex', params.value);
        this.value = params.value;
        this.setHexField('to', params.to);
        this.setHexField('gas', params.gas);
        this.setHexField('gasPrice', params.gasPrice);

    }

    setHexFieldOrNull(field, valueHex) {
        if (!valueHex) {
            this[field] = '0x00';
        } else {
            this.setHexField(field, valueHex);
        }
    }

    setHexField(field, valueHex) {
        if (!valueHex) {
            return;
        }
        this[field] = toHex(valueHex);
    }

    /**
     *
     * @returns {*}
     */
    getEncodedRaw = ()=>{

        let encodedTx = {};
        encodedTx.nonce = AionRlp.encode(this.nonce);
        encodedTx.to = AionRlp.encode(this.to);
        encodedTx.valueHex = AionRlp.encode(this.valueHex);
        encodedTx.data = AionRlp.encode(this.data);
        encodedTx.timestampHex = AionRlp.encode(this.timestampHex);
        encodedTx.gas = AionRlp.encodeLong(this.gas);
        encodedTx.gasPrice = AionRlp.encodeLong(this.gasPrice);
        encodedTx.type = AionRlp.encode(this.type);

        return AionRlp.encodeList([
            encodedTx.nonce,
            encodedTx.to,
            encodedTx.valueHex,
            encodedTx.data,
            encodedTx.timestampHex,
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

        if(this.encoded){
            return this.encoded;
        }

        let encodedTx = {};
        encodedTx.nonce = AionRlp.encode(this.nonce);
        encodedTx.to = AionRlp.encode(this.to);
        encodedTx.valueHex = AionRlp.encode(this.valueHex);
        encodedTx.data = AionRlp.encode(this.data);
        encodedTx.timestampHex = AionRlp.encode(this.timestampHex);
        encodedTx.gas = AionRlp.encodeLong(this.gas);
        encodedTx.gasPrice = AionRlp.encodeLong(this.gasPrice);
        encodedTx.type = AionRlp.encode(this.type);
        encodedTx.fullSignature = AionRlp.encode(new Buffer(this.fullSignature));

        let encoded = AionRlp.encodeList([
            encodedTx.nonce,
            encodedTx.to,
            encodedTx.valueHex,
            encodedTx.data,
            encodedTx.timestampHex,
            encodedTx.gas,
            encodedTx.gasPrice,
            encodedTx.type,
            encodedTx.fullSignature,
        ]);
        return toHex(encoded);
    };

    getRawHash = () => {
        return blake2b(32).update(this.getEncodedRaw()).digest();
    };

    signByECKey = (private_key) => {
        return new Promise((resolve, reject) => {
            let rawHash = this.getRawHash();
            let tx = {
                nonce : this.nonce,
                amount: this.valueHex,
                gasLimit: this.gas,
                gasPrice: this.gasPrice,
                to: this.to,
                private_key: private_key,
            };
            this.data!==null&& (tx = {...tx,data:this.data});
            keyStore.signTransaction(tx, 425).then(res=>{
                const {encoded, signature} = res;
                if(!encoded.startsWith('0x')){
                    this.encoded = '0x'+encoded;
                }else{
                    this.encoded = encoded;
                }
                this.signature = hexString2Array(signature);
                private_key = private_key.startsWith('0x')?private_key.substring(2):private_key;
                this.fullSignature = sigToBytes(this.signature, hexString2Array(private_key.substring(64)));
                resolve(this.encoded);
            }).catch(e=>{
                console.log('sign error => ', e);
                reject(e)
            });

            // keyStore.recoveKeyPairByPrivateKey(private_key,coinType).then(keyPair=>{
            //     keyStore.sign(Crypto.toHex(rawHash), keyPair.private_key, 425).then(signature=>{
            //         this.signature = hexString2Array(signature);
            //         this.fullSignature = sigToBytes(this.signature, hexString2Array(keyPair.public_key));
            //         resolve();
            //     }).catch(e=>{
            //         console.log('sign error => ', e);
            //         reject(e)
            //     })
            // }).catch(e=>{
            //     console.log('sign error => ', e);
            //     reject(e)
            // })

        });
    };

    signByLedger = (index) => {
        return new Promise((resolve, reject) => {
            wallet.getAccount(index).then(account => {
                if (account.address !== this.sender) {
                    reject(new Error('error.wrong_device'));
                    return;
                }
                wallet.sign(index, Object.values(this.getEncodedRaw())/*Object.values(this.getEncodedRaw())*/).then(signedTx => {
                    this.signature = signedTx;
                    this.fullSignature = sigToBytes(this.signature, hexString2Array(account.publicKey));
                    resolve();
                }, err => {
                    console.log("sign tx error: " + err);
                    reject(new Error(err.code));
                });
            }, error => {
                console.log("get account error: " + error);
                reject(new Error(error.code));
            })
        });
    }
}

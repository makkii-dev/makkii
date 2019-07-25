import BigNumber from 'bignumber.js';
import blake2b from 'blake2b';
import {Aion_rlp} from '../../utils/aion_rlp';
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
        return Aion_rlp.encodeList([
            Aion_rlp.encode(this.nonce),
            Aion_rlp.encode(this.to),
            Aion_rlp.encode(this.valueHex),
            Aion_rlp.encode(this.data),
            Aion_rlp.encode(this.timestampHex),
            Aion_rlp.encodeLong(this.gas),
            Aion_rlp.encodeLong(this.gasPrice),
            Aion_rlp.encode(this.type),
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
        let encoded = Aion_rlp.encodeList([
            Aion_rlp.encode(this.nonce),
            Aion_rlp.encode(this.to),
            Aion_rlp.encode(this.valueHex),
            Aion_rlp.encode(this.data),
            Aion_rlp.encode(this.timestampHex),
            Aion_rlp.encodeLong(this.gas),
            Aion_rlp.encodeLong(this.gasPrice),
            Aion_rlp.encode(this.type),
            Aion_rlp.encode(Buffer.from(this.fullSignature)),
        ]);
        return toHex(encoded);
    };

    signByECKey = (private_key) => {
        return new Promise((resolve, reject) => {
            let tx = {
                nonce : this.nonce,
                amount: this.valueHex,
                gasLimit: this.gas,
                gasPrice: this.gasPrice,
                to: this.to,
                private_key: private_key,
                timestamp: this.timestampHex,
            };
            if(this.data!==undefined){
                tx = {...tx, data:this.data};
            }
            console.log('unsignedTx=>', tx);
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
        });
    };

    signByLedger = (index) => {
        return new Promise((resolve, reject) => {
            wallet.getAccount(index).then(account => {
                if (account.address !== this.sender) {
                    reject(new Error('error.wrong_device'));
                    return;
                }
                wallet.sign(index, Object.values(this.getEncodedRaw())).then(signedTx => {
                    this.signature = signedTx;
                    this.fullSignature = sigToBytes(this.signature, hexString2Array(account.publicKey));
                    resolve(this.getEncoded());
                }, err => {
                    console.log("sign tx error: " + err);
                    reject(new Error(err.code));
                });
            }, error => {
                setTimeout(()=>listenApp.ignore=false,100);
                console.log("get account error: " + error);
                reject(new Error(error.code));
            })
        });
    }
}

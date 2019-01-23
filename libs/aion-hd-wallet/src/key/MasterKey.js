import bip39 from 'bip39';
import {Buffer} from 'buffer';
import {Crypto} from '../utils/crypto';
import {Ed25519Key} from './Ed25519Key';
const ED25519_KEY = "ed25519 seed";
const DEFAULT_PASSPHRASE = '';
const HARDENED_KEY_MULTIPLIER = 0x80000000;

const getHardenedNumber = (nr) => {
    return new Buffer(((HARDENED_KEY_MULTIPLIER | nr) >>> 0).toString(16), 'hex');
};
export class MasterKey {
    Key;
    Path;
    static fromMnemonic = (mnemonic) => {
        let seed = bip39.mnemonicToSeed(mnemonic,DEFAULT_PASSPHRASE);
        let key = Crypto.hmacSha512(ED25519_KEY, seed);
        return new MasterKey(key);
    };

    constructor(key, path=[44, 425, 0, 0 ]){
        this.Key = key;
        this.Path = path;
    }

    deriveHardened = (arg) => {
        return new Promise((resolve, reject) => {
            try{
                let derivationPath;
                arg = !arg? 0 : arg;
                if (!(arg instanceof Array)) {
                    derivationPath = this.Path.concat(arg);
                } else {
                    derivationPath = arg;
                }
                let key = this.Key;
                for (let element of derivationPath) {
                    key = this.getChild(element, key);
                }
                let keypair = Ed25519Key.fromSeed(key.subarray(0, 32));
                resolve(
                    Object.assign(keypair,{address: Crypto.toHex(keypair.address)})
                )
            } catch (e) {
                reject(e)
            }
        })


    };

    getChild = (pathElement, keyHash) => {
        let parentPrivateKey = keyHash.subarray(0, 32);
        let parentChainCode = keyHash.subarray(32, 64);
        let offset = getHardenedNumber(pathElement);

        let parentPaddedKey = new Uint8Array(1 + parentPrivateKey.length + 4);
        parentPaddedKey.set(parentPrivateKey, 1);
        parentPaddedKey.set(offset, parentPrivateKey.length + 1);

        return Crypto.hmacSha512(parentChainCode, parentPaddedKey);
    }
}
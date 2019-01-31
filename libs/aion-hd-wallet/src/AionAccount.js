import {MasterKey} from "./key/MasterKey";
import {Ed25519Key} from "./key/Ed25519Key";
import {Crypto} from "./utils/crypto";

export class AionAccount {

    static recoverAccount = (mnemonic) => {
        try{
            let masterKey = new MasterKey.fromMnemonic(mnemonic);
            return masterKey;
        } catch (e) {
            throw e;
        }
    };

    static importAccount = (secretKey) => {
        return new Promise(((resolve, reject) => {
            secretKey = secretKey.startsWith('0x')? secretKey.substring(2): secretKey;
            if (secretKey.length !== 128)
            {
                reject("Invalid secret key");
            }
            try {
                const keyPair = Ed25519Key.fromSecretKey(secretKey);
                resolve( {address: Crypto.toHex(keyPair.address)} );
            }catch (e) {
                reject(e)
            }
        }))
    };

}
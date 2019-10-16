/* eslint-disable camelcase */
import wallet from 'react-native-aion-hw-wallet';
import BIP38 from '../utils/bip38';
import { getKeyFromMnemonic, recoverKeyPairByPrivateKey, getKeyByLedger, recoverKeyPairByWIF } from '../client/keystore';
import { range } from '../utils';
import { SensitiveStorage } from '../utils/storage';

const getAccountFromMasterKey = async (symbol, index) => {
    try {
        const mnemonic = await SensitiveStorage.get('mnemonic');
        return await getKeyFromMnemonic(symbol, index, mnemonic);
    } catch (e) {
        console.log('getAccountFromMasterKey error=>', e);
        throw e;
    }
};

const getAccountFromPrivateKey = async (symbol, private_key, options) => {
    try {
        console.log('getAccountFromPrivateKey=>', symbol);
        return await recoverKeyPairByPrivateKey(private_key, symbol, options);
    } catch (e) {
        console.log('getAccountFromPrivateKey error=>', e);
        throw e;
    }
};
const getAccountFromWIF = async (symbol, wif) => {
    try {
        console.log('getAccountFromWIF=>', symbol);
        return await recoverKeyPairByWIF(wif, symbol);
    } catch (e) {
        console.log('getAccountFromWIF error=>', e);
        throw e;
    }
};

const getOneAccountFromLedger = async (symbol, index) => {
    try {
        const { address } = await getKeyByLedger(symbol, index);
        return { index, address };
    } catch (e) {
        throw e;
    }
};

const getAccountsFromLedger = (symbol, start, end) => {
    const indexes = range(start, end, 1);

    const promises = indexes.map(e => {
        return getOneAccountFromLedger(symbol, e);
    });
    return Promise.all(promises);
};

const getLedgerStatus = async () => {
    try {
        const deviceLists = await wallet.listDevice();
        if (deviceLists.length <= 0) {
            return { status: false, code: wallet.INVALID_DEVICE_NUMBER };
        }
        await wallet.getAccount(0);
        return { status: true };
    } catch (e) {
        console.log('getLedgerStatus error=>', e);
        return { status: false, code: e.code };
    }
};

const getPrivateKeyFromBIP38 = async (bip38, password) => {
    try {
        console.log('getPrivateKeyFromBIP38', bip38, password);
        const decryptedKey = await BIP38.decryptAsync(bip38, password);
        return {
            result: true,
            privateKey: `0x${decryptedKey.privateKey.toString('hex')}`,
            compressed: decryptedKey.compressed,
        };
    } catch (e) {
        console.log('getPrivateKeyFromBIP38 error=>', e);
        return {
            result: false,
        };
    }
};

export { getAccountFromMasterKey, getAccountFromPrivateKey, getAccountsFromLedger, getLedgerStatus, getPrivateKeyFromBIP38, getAccountFromWIF };

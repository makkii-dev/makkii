/* eslint-disable camelcase */
import wallet from 'react-native-aion-hw-wallet';
import keystore from '../client/keystore';
import { range } from '../utils';
import { SensitiveStorage } from '../utils/storage';

const getAccountFromMasterKey = async (symbol, index) => {
    try {
        const mnemonic = await SensitiveStorage.get('mnemonic');
        return await keystore.getKeyFromMnemonic(symbol, index, mnemonic);
    } catch (e) {
        console.log('getAccountFromMasterKey error=>', e);
        throw e;
    }
};

const getAccountFromPrivateKey = async (symbol, private_key) => {
    try {
        console.log('getAccountFromPrivateKey=>', symbol);
        return await keystore.recoverKeyPairByPrivateKey(private_key, symbol);
    } catch (e) {
        console.log('getAccountFromPrivateKey error=>', e);
        throw e;
    }
};

const getOneAccountFromLedger = async (symbol, index) => {
    try {
        const { address } = await wallet.getAccount(index);
        return { index, address };
    } catch (e) {
        throw e;
    }
};

const getAccountsFromLedger = (symbol, start, end) => {
    return Promise.all(range(start, end).map(e => getOneAccountFromLedger(symbol, e)));
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

export {
    getAccountFromMasterKey,
    getAccountFromPrivateKey,
    getAccountsFromLedger,
    getLedgerStatus,
};

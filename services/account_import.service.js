/* eslint-disable camelcase */
import TransportHid from '@ledgerhq/react-native-hid';
import BIP38 from '../utils/bip38';
import { getAccountFromMnemonic, recoverKeyPairByPrivateKey, getAccountFromHardware, client } from '../client/keystore';
import { SensitiveStorage } from '../utils/storage';
import { getHardware } from '../utils';

const getAccountFromMasterKey = async (symbol, index) => {
    try {
        const mnemonic = await SensitiveStorage.get('mnemonic');
        return await getAccountFromMnemonic(symbol, index, mnemonic);
    } catch (e) {
        console.log('getAccountFromMasterKey error=>', e);
        throw e;
    }
};

const getAccountFromPrivateKey = async (symbol, private_key, options) => {
    try {
        console.log('getAccountFromPrivateKey=>', symbol);
        return await recoverKeyPairByPrivateKey(symbol, private_key, options);
    } catch (e) {
        console.log('getAccountFromPrivateKey error=>', e);
        throw e;
    }
};
const getAccountFromWIF = async (symbol, wif) => {
    try {
        return await client.getCoin(symbol).recoverKeyPairByWIF(wif);
    } catch (e) {
        console.log('getAccountFromWIF error=>', e);
        throw e;
    }
};

const getOneAccountFromLedger = async (symbol, index) => {
    try {
        const hardware = getHardware(symbol);
        const { address } = await getAccountFromHardware(symbol, index, hardware);
        return { index, address };
    } catch (e) {
        throw e;
    }
};

const getAccountsFromLedger = async (symbol, start, end) => {
    let rets = [];
    for (let i = start; i < end; i++) {
        // eslint-disable-next-line no-await-in-loop
        const ret = await getOneAccountFromLedger(symbol, i);
        rets.push(ret);
    }

    return rets;
};

const getOrInitLedger = async symbol => {
    try {
        console.log('symboL:', symbol);
        const hardware = getHardware(symbol);
        const currentStatus = await hardware.getHardwareStatus();
        console.log('currentStatus=>', currentStatus);
        if (!currentStatus) {
            const transport = await Promise.race([
                TransportHid.create(),
                new Promise((resolve, reject) => {
                    // set open timeout  5s
                    setTimeout(() => reject('Timeout'), 60 * 1000);
                }),
            ]);
            hardware.setLedgerTransport(transport);
        }
        const currentStatus2 = await hardware.getHardwareStatus();
        if (currentStatus2) {
            return { status: true };
        }
        return { status: false, code: 'error.application_inactive' };
    } catch (e) {
        console.log('getOrInitLedger fail=>', e);
        return { status: false, code: 'error.device_count' };
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

export { getAccountFromMasterKey, getAccountFromPrivateKey, getAccountsFromLedger, getPrivateKeyFromBIP38, getOrInitLedger, getAccountFromWIF };

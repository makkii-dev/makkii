import { keystoreClient } from 'makkii-coins';
import Config from 'react-native-config';
import { COINS } from './support_coin_list';

const isTestNet = Config.is_testnet === 'true';

const client = keystoreClient(Object.keys(COINS), isTestNet);

export const {
    signTransaction,
    getKey,
    getKeyByLedger,
    signByLedger,
    setMnemonic,
    generateMnemonic,
    recoverKeyPairByPrivateKey,
    recoverKeyPairByWIF,
    validateAddress,
    getKeyFromMnemonic,
    validatePrivateKey,
} = client;

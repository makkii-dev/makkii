import { keystoreClient } from 'react-native-makkii-core';
import Config from 'react-native-config';
import { COINS } from './support_coin_list';

const isTestNet = Config.is_testnet === 'true';

const client = keystoreClient(Object.keys(COINS), isTestNet);

export const {
    signTransaction,
    getKey,
    setMnemonic,
    generateMnemonic,
    recoverKeyPairByPrivateKey,
    validateAddress,
    getKeyFromMnemonic,
} = client;

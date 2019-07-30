import { keystoreClient } from 'react-native-makkii-core';
import Config from 'react-native-config';
import { COINS } from './support_coin_list';

const isTestNet = Config.is_testnet === 'true';

const client = keystoreClient(Object.keys(COINS), isTestNet);

const signTransaction = client.signTransaction;
const getKey = client.getKey;
const setMnemonic = client.setMnemonic;
const generateMnemonic = client.generateMnemonic;
const recoverKeyPairByPrivateKey = client.recoverKeyPairByPrivateKey;
const validateAddress = client.validateAddress;
const getKeyFromMnemonic = client.getKeyFromMnemonic;

export {
    signTransaction,
    getKey,
    setMnemonic,
    generateMnemonic,
    recoverKeyPairByPrivateKey,
    validateAddress,
    getKeyFromMnemonic,
};

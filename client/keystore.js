import { KeystoreClient } from 'makkii-coins/packages/makkii-core';
import Config from 'react-native-config';
import { AionKeystoreClient } from 'makkii-coins/packages/app-aion';
import { BtcKeystoreClient } from 'makkii-coins/packages/app-btc';
import { EthKeystoreClient } from 'makkii-coins/packages/app-eth';
import { TronKeystoreClient } from 'makkii-coins/packages/app-tron';
import { COINS } from './support_coin_list';

const isTestNet = Config.is_testnet === 'true';

const createKeystoreClient = () => {
    const client_ = new KeystoreClient();
    const aionClient = new AionKeystoreClient();
    const btcClient = new BtcKeystoreClient(isTestNet ? 'BTCTEST' : 'BTC');
    const ltcClient = new BtcKeystoreClient(isTestNet ? 'LTCTEST' : 'LTC');
    const ethClient = new EthKeystoreClient();
    const tronClient = new TronKeystoreClient();
    Object.keys(COINS).forEach(c => {
        switch (c.toLowerCase()) {
            case 'aion':
                client_.addCoin('aion', aionClient);
                break;
            case 'btc':
                client_.addCoin('btc', btcClient);
                break;
            case 'eth':
                client_.addCoin('eth', ethClient);
                break;
            case 'ltc':
                client_.addCoin('ltc', ltcClient);
                break;
            case 'trx':
                client_.addCoin('trx', tronClient);
                break;
            default:
        }
    });
    return client_;
};
export const client = createKeystoreClient();

export const { signTransaction, getAccountFromHardware, recoverKeyPairByPrivateKey, validateAddress, getAccountFromMnemonic, validatePrivateKey } = client;

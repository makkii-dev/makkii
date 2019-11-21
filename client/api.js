import { apiClient } from 'makkii-coins/packages/makkii-core';
import { AionApiClient } from 'makkii-coins/packages/app-aion';
import { BtcApiClient } from 'makkii-coins/packages/app-btc';
import { EthApiClient } from 'makkii-coins/packages/app-eth';
import { TronApiClient } from 'makkii-coins/packages/app-tron';

import Config from 'react-native-config';
import { HttpClient } from 'lib-common-util-js/src';
import { COINS } from './support_coin_list';
import customApi from './customApi';
import { getOrRequestToken } from '../services/setting.service';

const isTestNet = Config.is_testnet === 'true';

export const getApiConfig = async () => {
    const url = `${Config.app_server_api}/config/apiServers`;
    const token = await getOrRequestToken();
    const header = {
        Authorization: `Bearer ${token}`,
    };
    try {
        const { data } = await HttpClient.get(url, undefined, false, header);
        CustomApiConfig(customApi);
        CustomApiConfig(data);
    } catch (e) {
        //
        CustomApiConfig(customApi);
    }
};

const createApiClient = () => {
    const client_ = apiClient();
    const aionClient = new AionApiClient(isTestNet);
    aionClient.setRemoteApi(Config.app_server);
    const btcClient = new BtcApiClient(isTestNet, 'btc');
    const ethClient = new EthApiClient(isTestNet);
    ethClient.setRemoteApi(Config.app_server);
    const ltcClient = new BtcApiClient(isTestNet, 'ltc');
    const tronClient = new TronApiClient(isTestNet);
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

const CustomApiConfig = config => {
    const { remote: { api = {} } = {}, coins = {} } = config;
    Object.keys(client.coins).forEach(symbol => {
        if (coins[symbol]) {
            client.coins[symbol].coverNetWorkConfig(coins[symbol], api);
        }
    });
};

const client = createApiClient();

export const {
    getTokenIconUrl,
    getBlockByNumber,
    getTransactionExplorerUrl,
    getTransactionsByAddress,
    getBlockNumber,
    getTransactionStatus,
    getBalance,
    sendTransaction,
    sameAddress,
    formatAddress1Line,
    validateBalanceSufficiency,
    getCoinPrices,
    fetchTokenDetail,
    fetchAccountTokenTransferHistory,
    fetchAccountTokens,
    fetchAccountTokenBalance,
    getTopTokens,
    searchTokens,
} = client;

import { apiClient } from 'makkii-coins';
import Config from 'react-native-config';
import { HttpClient } from 'lib-common-util-js/src';
import { COINS } from './support_coin_list';
import customApi from './customApi';

const isTestNet = Config.is_testnet === 'true';

// const client = apiClient(Object.keys(COINS), isTestNet);
const client = apiClient(Object.keys(COINS), isTestNet, customApi);
if (Config.pokket) {
    client.setCoinNetwork('ETH', 'pokket');
}
export const getApiConfig = async () => {
    const url = `${Config.app_server_api}/config/apiServers`;
    try {
        const { data } = await HttpClient.get(url);
        client.coverRemoteApi(data);
    } catch (e) {
        //
    }
};

client.setRemoteApi(Config.app_server);

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

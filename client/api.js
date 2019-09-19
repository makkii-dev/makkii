import { apiClient } from 'makkii-coins';
import Config from 'react-native-config';
import { COINS } from './support_coin_list';

const isTestNet = Config.is_testnet === 'true';

const client = apiClient(Object.keys(COINS), isTestNet);
console.log('Config.pokket=>', Config.pokket);
if (Config.pokket) {
    client.setCoinNetwork('ETH', 'pokket');
}
client.setRemoteApi(Config.app_server_api);

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

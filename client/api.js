import { apiClient } from 'react-native-makkii-core';
import Config from 'react-native-config';
import { COINS } from './support_coin_list';

const isTestNet = Config.is_testnet === 'true';

const client = apiClient(Object.keys(COINS), isTestNet);

export const {
    getBlockByNumber,
    getTransactionExplorerUrl,
    getTransactionsByAddress,
    getBlockNumber,
    getTransactionStatus,
    getBalance,
    sendTransaction,
    sameAddress,
    getCoinPrices,
    formatAddress1Line,
    validateBalanceSufficiency,
    fetchTokenDetail,
    fetchAccountTokenTransferHistory,
    fetchAccountTokens,
    fetchAccountTokenBalance,
    searchTokens,
    getTopTokens,
    getTokenIconUrl,
} = client;

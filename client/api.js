import { apiClient } from 'react-native-makkii-core';
import Config from 'react-native-config';
import { COINS } from './support_coin_list';

const isTestNet = Config.is_testnet === 'true';

const client = apiClient(Object.keys(COINS), isTestNet);
const getBlockByNumber = client.getBlockByNumber;
const getTransactionExplorerUrl = client.getTransactionExplorerUrl;
const getTransactionsByAddress = client.getTransactionsByAddress;
const getBlockNumber = client.getBlockNumber;
const getTransactionStatus = client.getTransactionStatus;
const getBalance = client.getBalance;
const sendTransaction = client.sendTransaction;
const sameAddress = client.sameAddress;
const getCoinPrices = client.getCoinPrices;
const formatAddress1Line = client.formatAddress1Line;
const validateBalanceSufficiency = client.validateBalanceSufficiency;
const fetchTokenDetail = client.fetchTokenDetail;
const fetchAccountTokenTransferHistory = client.fetchAccountTokenTransferHistory;
const fetchAccountTokens = client.fetchAccountTokens;
const fetchAccountTokenBalance = client.fetchAccountTokenBalance;
const searchTokens = client.searchTokens;
const getTopTokens = client.getTopTokens;
const getTokenIconUrl = client.getTokenIconUrl;

export {
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
};

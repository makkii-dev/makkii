import core from './core';
import jsonrpc from './jsonrpc';
import transaction from './transaction';
import token from './token';
module.exports = {
    validateAddress: core.validateAddress,
    formatAddress1Line: core.formatAddress1Line,
    getBlockByNumber: jsonrpc.getBlockByNumber,
    blockNumber: jsonrpc.blockNumber,
    getBalance: jsonrpc.getBalance,
    getTransactionStatus: transaction.getTransactionStatus,
    sendTransaction: transaction.sendTransaction,
    getTransactionsByAddress: transaction.getTransactionsByAddress,
    getTransactionUrlInExplorer: transaction.getTransactionUrlInExplorer,
    validateBalanceSufficiency: core.validateBalanceSufficiency,
    ...token
};
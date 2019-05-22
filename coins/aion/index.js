import core from './core';
import jsonrpc from './jsonrpc';
import transaction from './transaction';

module.exports = {
    validateAddress: core.validateAddress,
    getBlockByNumber: jsonrpc.getBlockByNumber,
    blockNumber: jsonrpc.blockNumber,
    getBalance: jsonrpc.getBalance,
    getTransactionReceipt: jsonrpc.getTransactionReceipt,
    sendTransaction: transaction.sendTransaction,
    getTransactionsByAddress: transaction.getTransactionsByAddress,
    getTransactionUrlInExplorer: transaction.getTransactionUrlInExplorer,
};
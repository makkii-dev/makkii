import jsonrpc from './jsonrpc';
import core from './core';

module.exports = {
    getBalance: jsonrpc.getBalance,
    getTransactionsByAddress: jsonrpc.getTransactionsByAddress,
    validateAddress: jsonrpc.validateAddress,
    formatAddress1Line: core.formatAddress1Line,
}
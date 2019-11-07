/* eslint-disable camelcase */
import BigNumber from 'bignumber.js';
import { HttpClient } from 'lib-common-util-js/src';
import Config from 'react-native-config';
import { getTransactionsByAddress, fetchAccountTokenTransferHistory, getBalance, fetchAccountTokenBalance } from '../client/api';

const getTransactionsHistory = async (symbol, address, page, size) => {
    try {
        return await getTransactionsByAddress(symbol, address, page, size);
    } catch (e) {
        console.log('getTransactionsHistory error=>', e);
        throw e;
    }
};

const getTransfersHistory = async (symbol, address, contractAddr, page, size) => {
    try {
        return await fetchAccountTokenTransferHistory(symbol, address, contractAddr, null, page, size);
    } catch (e) {
        console.log('getTransfersHistory error=>', e);
        throw e;
    }
};

const getAccountOrTokenBalance = async payload => {
    try {
        const { symbol, address, contractAddr, tokenDecimals } = payload;
        let balance;
        if (contractAddr) {
            balance = await fetchAccountTokenBalance(symbol, contractAddr, address);
            balance = BigNumber(balance).shiftedBy(-tokenDecimals || -18);
        } else {
            balance = await getBalance(symbol, address);
        }
        return { ...payload, balance };
    } catch (e) {
        console.log(e);
        return { ...payload, balance: BigNumber(0) };
    }
};

const getAccountBalances = payloads => {
    return Promise.all(payloads.map(p => getAccountOrTokenBalance(p)));
};

/**
 * Check if the address has pending txs
 * @param pendingTxs
 * @param address
 * @returns {boolean}
 */
const pendingTxsInvolved = (pendingTxs, address) => {
    for (let tx of Object.values(pendingTxs)) {
        const { txObj, token: { tokenTx = {} } = {} } = tx;
        if (txObj.from === address || txObj.to === address || tokenTx.from === address || tokenTx.to === address) {
            return true;
        }
    }
    return false;
};

const getTransactionNote = async (chain, txHash, address) => {
    const url = `${Config.app_server_api}/transaction`;
    const payload = {
        chain,
        txHash,
        address,
    };
    try {
        const { data } = await HttpClient.get(url, payload);
        console.log('getTransactionNote resp=>', data);
        return data.note || '';
    } catch (e) {
        console.log('getTransactionNote error=>', e);
        return '';
    }
};

const setTransactionNote = async (chain, txHash, address, note) => {
    const url = `${Config.app_server_api}/transaction`;
    const payload = {
        chain,
        txHash,
        address,
        note,
    };
    try {
        const { data } = await HttpClient.post(url, payload, true);
        console.log('setTransactionNote resp=>', data);
        return !!(data && data.txHash);
    } catch (e) {
        console.log('setTransactionNote error=>', e);
        return false;
    }
};

export { getTransactionsHistory, getTransfersHistory, getAccountBalances, pendingTxsInvolved, getTransactionNote, setTransactionNote };

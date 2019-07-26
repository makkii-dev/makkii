import ApiCaller from '../../utils/http_caller';
import { base58check2HexString } from '../../utils/crypto/crypto';

const getEndpoint = network => {
    if (network === 'mainnet') {
        return 'https://api.trongrid.io';
    }
    if (network === 'shasta') {
        return 'https://api.shasta.trongrid.io';
    }
    return '';
};

const getBalance = (address, network = 'mainnet') =>
    new Promise((resolve, reject) => {
        const url = `${getEndpoint(network)}/wallet/getaccount`;
        const hexAddress = base58check2HexString(address);
        const body = {
            address: hexAddress,
        };
        const promise = ApiCaller.post(url, body, true, { 'Content-Type': 'application/json' });
        console.log(`[tron http req] ${url}`);
        console.log('[tron http req] body:', body);
        promise.then(res => {
            console.log('[tron http resp] ', res.data);
            if (res.data.Error !== undefined) {
                reject(res.data.Error);
            } else if (res.data.balance !== undefined) {
                resolve(new BigNumber(res.data.balance).shiftedBy(-6));
            } else {
                resolve(new BigNumber(0));
            }
        });
    });

const validateAddress = (address, network = 'mainnet') =>
    new Promise(resolve => {
        const url = `${getEndpoint(network)}/wallet/validateaddress`;
        const body = {
            address,
        };
        const promise = ApiCaller.post(url, body, true, { 'Content-Type': 'application/json' });
        console.log(`[tron http req] ${url}`);
        console.log('[tron http req] body:', body);
        promise.then(res => {
            console.log('[tron http resp] ', res.data);
            resolve(res.data.result);
        });
    });

const getLatestBlock = (network = 'mainnet') =>
    new Promise(resolve => {
        const url = `${getEndpoint(network)}/wallet/getnowblock`;
        const promise = ApiCaller.post(url, {}, true, { 'Content-Type': 'application/json' });
        console.log(`[tron http req] ${url}`);
        promise.then(res => {
            console.log('[tron http resp] ', res.data);
            resolve(res.data);
        });
    });

const broadcastTransaction = (tx, network = 'mainnet') =>
    new Promise(resolve => {
        const url = `${getEndpoint(network)}/wallet/broadcasttransaction`;
        const promise = ApiCaller.post(url, tx, true, { 'Content-Type': 'application/json' });
        console.log(`[tron http req] ${url}`);
        promise.then(res => {
            console.log('[tron http resp] ', res.data);
            resolve(res.data);
        });
    });

const getTransactionById = (hash, network = 'mainnet') =>
    new Promise(resolve => {
        const url = `${getEndpoint(network)}/walletsolidity/gettransactionbyid`;
        const promise = ApiCaller.post(
            url,
            {
                value: hash,
            },
            true,
            { 'Content-Type': 'application/json' },
        );
        console.log(`[tron http req] ${url}`);
        promise.then(res => {
            console.log('[tron http resp]', res.data);
            resolve(res.data);
        });
    });

const getTransactionInfoById = (hash, network = 'mainnet') =>
    new Promise(resolve => {
        const url = `${getEndpoint(network)}/walletsolidity/gettransactioninfobyid`;
        const promise = ApiCaller.post(
            url,
            {
                value: hash,
            },
            true,
            { 'Content-Type': 'application/json' },
        );
        console.log(`[tron http req] ${url}`);
        promise.then(res => {
            console.log('[tron http resp]', res.data);
            resolve(res.data);
        });
    });

module.exports = {
    getBalance,
    validateAddress,
    getLatestBlock,
    broadcastTransaction,
    getTransactionById,
    getTransactionInfoById,
};

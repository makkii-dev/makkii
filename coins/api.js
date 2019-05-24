import ApiCaller from '../utils/http_caller';
import {COINS} from './support_coin_list';
import {toHex} from '../utils';

function getBlockByNumber(coinType, blockNumber) {
    let coin = COINS[coinType.toUpperCase()];
    if (coin.api !== undefined && coin.api.getBlockByNumber !== undefined) {
        return coin.api.getBlockByNumber(toHex(blockNumber), false, coin.network);
    } else {
        throw new Error("No getBlockByNumber impl for coin " + coinType);
    }
}
function getTransactionExplorerUrl(coinType, hash) {
    let coin = COINS[coinType.toUpperCase()];
    if (coin.api !== undefined && coin.api.getTransactionUrlInExplorer !== undefined) {
        return coin.api.getTransactionUrlInExplorer(hash, coin.network);
    } else {
        throw new Error('No getTransactionExplorerUrl impl for coin ' + coinType);
    }
}

function getTransactionsByAddress(coinType,address,page=0,size=5){
    let coin =  COINS[coinType.toUpperCase()];
    if (coin.api !== undefined && coin.api.getTransactionsByAddress !== undefined) {
        return coin.api.getTransactionsByAddress(address, page, size, coin.network);
    } else {
        throw new Error('No getTransactionsByAddress impl for coin ' + coinType);
    }
}

function getBlockNumber(coinType) {
    let coin =  COINS[coinType.toUpperCase()];
    if (coin.api !== undefined && coin.api.blockNumber !== undefined) {
        return coin.api.blockNumber(coin.network);
    } else {
        throw new Error('No blockNumber impl for coin ' + coinType);
    }
}

function getTransactionReceipt(coinType, hash) {
    let coin =  COINS[coinType.toUpperCase()];
    if (coin.api !== undefined && coin.api.getTransactionReceipt !== undefined) {
        return coin.api.getTransactionReceipt(hash, coin.network);
    } else {
        throw new Error('No getTransactionReceipt impl for coin ' + coinType);
    }
}

function getBalance(coinType, address) {
    let coin =  COINS[coinType.toUpperCase()];
    if (coin.api !== undefined && coin.api.getBalance !== undefined) {
        return coin.api.getBalance(address, coin.network);
    } else {
        throw new Error('No getBalance impl for coin ' + coinType);
    }
}

function sendTransaction(account, symbol, to, value, extra_params, data=undefined) {
    let coin =  COINS[account.symbol.toUpperCase()];
    if (coin.api !== undefined && coin.api.sendTransaction !== undefined) {
        return coin.api.sendTransaction(account, symbol, to, value, extra_params, data, coin.network);
    } else {
        throw new Error('No sendTransaction impl for coin ' + coinType);
    }
}

function validateAddress(address, coinType = 'AION') {
    let coin =  COINS[coinType.toUpperCase()];
    if (coin.api !== undefined && coin.api.validateAddress !== undefined) {
        return coin.api.validateAddress(address, coin.network);
    } else {
        throw new Error('No sendTransaction impl for coin ' + coinType);
    }
}

function sameAddress(coinType, address1, address2) {
    if (coinType === 'AION' || coinType === 'ETH') {
        return address1.toLowerCase() === address2.toLowerCase();
    }
    return true;
}

function formatAddress1Line(coinType, address) {
    let coin = COINS[coinType.toUpperCase()];
    if (coin.api !== undefined && coin.api.formatAddress1Line !== undefined) {
        return coin.api.formatAddress1Line(address);
    }
    return address;
}

function validateBalanceSufficiency(coinType, account, symbol, amount, extra_params) {
    let coin = COINS[coinType.toUpperCase()];
    if (coin.api !== undefined && coin.api.validateBalanceSufficiency !== undefined) {
        return coin.api.validateBalanceSufficiency(account, symbol, amount, extra_params);
    }
    return true;
}

function getCoinPrices(currency) {
    let cryptos = Object.keys(COINS).join(',');
    const url = `http://45.118.132.89:8080/prices?cryptos=${cryptos}&fiat=${currency}`;
    console.log("[http req]fetch coin prices: " + url);
    return new Promise((resolve, reject) => {
        ApiCaller.get(url, false).then(res => {
            console.log("[http resp]", res.data);
            resolve(res.data);
        },err=>{
            console.log("[http resp] err:", err);
            reject(err);
        });
    });
}

module.exports = {
    getBlockByNumber,
    getTransactionExplorerUrl,
    getTransactionsByAddress,
    getBlockNumber,
    getTransactionReceipt,
    getBalance,
    sendTransaction,
    validateAddress,
    sameAddress,
    getCoinPrices,
    formatAddress1Line,
    validateBalanceSufficiency,
};

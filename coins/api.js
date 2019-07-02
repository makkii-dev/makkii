import ApiCaller from '../utils/http_caller';
import {COINS} from './support_coin_list';
import {toHex} from '../utils';
import keyStore from 'react-native-makkii-core';
import Config from 'react-native-config';


function getTokenIconUrl(coinType, tokenSymbol=undefined, contractAddress=undefined) {
    let coin = COINS[coinType.toUpperCase()];
    if (coin.api !== undefined && coin.api.getTokenIconUrl !== undefined) {
        return coin.api.getTokenIconUrl(tokenSymbol, contractAddress, coin.network);
    } else {
        throw new Error("No getTokenIconUrl impl for coin " + coinType);
    }
}

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

function getTransactionStatus(coinType, hash) {
    let coin =  COINS[coinType.toUpperCase()];
    if (coin.api !== undefined && coin.api.getTransactionStatus !== undefined) {
        return coin.api.getTransactionStatus(hash, coin.network);
    } else {
        throw new Error('No getTransactionStatus impl for coin ' + coinType);
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
        console.log("network1:" + coin.network);
        return coin.api.sendTransaction(account, symbol, to, value, extra_params, data, coin.network);
    } else {
        throw new Error('No sendTransaction impl for coin ' + coinType);
    }
}

function validateAddress(address, coinType = 'AION') {
    let coin =  COINS[coinType.toUpperCase()];
    return keyStore.validateAddress(address,keyStore.CoinType.fromCoinSymbol(coin.symbol));
}

function sameAddress(coinType, address1, address2) {
    if (coinType === 'AION' || coinType === 'ETH') {
        return address1.toLowerCase() === address2.toLowerCase();
    } else if (coinType === 'TRX') {
        return address1 === address2;
    } else if (coinType === 'BTC'||coinType === 'LTC') {
        return address1 === address2;
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

function validateBalanceSufficiency(account, symbol, amount, extra_params) {
    let coin = COINS[account.symbol.toUpperCase()];
    if (coin.api !== undefined && coin.api.validateBalanceSufficiency !== undefined) {
        return coin.api.validateBalanceSufficiency(account, symbol, amount, extra_params);
    }
    return Promise.resolve({result:true});
}

function getCoinPrices(currency) {
    let cryptos = Object.keys(COINS).join(',');
    const url = `${Config.app_server_api}/market/prices?cryptos=${cryptos}&fiat=${currency}`;
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
function fetchTokenDetail(coinType, contract_address, network){
    let coin =  COINS[coinType.toUpperCase()];
    if (coin.api !== undefined && coin.api.fetchTokenDetail !== undefined) {
        return coin.api.fetchTokenDetail(contract_address, network||coin.network);
    } else {
        throw new Error('No fetchTokenDetail impl for coin ' + coinType);
    }
}

function fetchAccountTokenTransferHistory(coinType, address, symbolAddress, network, page=0, size=25){
    let coin =  COINS[coinType.toUpperCase()];
    if (coin.api !== undefined && coin.api.fetchAccountTokenTransferHistory !== undefined) {
        return coin.api.fetchAccountTokenTransferHistory(address, symbolAddress, network||coin.network, page, size);
    } else {
        throw new Error('No fetchAccountTokenTransferHistory impl for coin ' + coinType);
    }
}

function fetchAccountTokens(coinType, address, network){
    let coin =  COINS[coinType.toUpperCase()];
    if (coin.api !== undefined && coin.api.fetchAccountTokens !== undefined) {
        return coin.api.fetchAccountTokens(address, network||coin.network);
    } else {
        throw new Error('No fetchAccountTokens impl for coin ' + coinType);
    }
}

function fetchAccountTokenBalance(coinType, contract_address, address, network){
    let coin =  COINS[coinType.toUpperCase()];
    if (coin.api !== undefined && coin.api.fetchAccountTokenBalance !== undefined) {
        return coin.api.fetchAccountTokenBalance(contract_address, address, network||coin.network);
    } else {
        throw new Error('No fetchAccountTokenBalance impl for coin ' + coinType);
    }
}

function getTopTokens(coinType, topN=20) {
    let coin =  COINS[coinType.toUpperCase()];
    if (coin.api !== undefined && coin.api.getTopTokens !== undefined) {
        return coin.api.getTopTokens(topN, coin.network);
    } else {
        throw new Error('No getTopTokens impl for coin ' + coinType);
    }

}

function searchTokens(symbol, keyword) {
    let coin = COINS[symbol.toUpperCase()];
    if (coin.api !== undefined && coin.api.searchTokens !== undefined) {
        return coin.api.searchTokens(keyword, coin.network);
    } else {
        throw new Error('No searchTokens impl for coin ' + coinType);
    }
}

module.exports = {
    getBlockByNumber,
    getTransactionExplorerUrl,
    getTransactionsByAddress,
    getBlockNumber,
    getTransactionStatus,
    getBalance,
    sendTransaction,
    validateAddress,
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

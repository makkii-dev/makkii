import {aion_getBalance, aion_getTransactionCount, aion_sendSignedTransaction} from './aion/aion_json_rpc';
import {eth_getBalance, eth_getTransactionCount, eth_sendSignedTransaction} from './eth/ether_json_rpc';
import ApiCaller from '../utils/http_caller';
import {COINS} from './support_coin_list';

export function getBalance(coinType, address) {
    if (coinType.toUpperCase() === 'ETH') {
        return eth_getBalance(address);
    } else if (coinType.toUpperCase() === 'AION') {
        return aion_getBalance(address);
    }
}

export function getTransactionCount(coinType, address) {
    if (coinType.toUpperCase() === 'ETH') {
        return eth_getTransactionCount(address, 'pending');
    } else if (coinType.toUpperCase() === 'AION') {
        return aion_getTransactionCount(address, 'pending');
    }
}

export function sendSignedTransaction(coinType, signedTx) {
    if (coinType.toUpperCase() === 'ETH') {
        return eth_sendSignedTransaction(signedTx);
    } else if (coinType.toUpperCase() === 'AION') {
        return aion_sendSignedTransaction(signedTx);
    }
}

export function getCoinPrices(currency) {
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

import {getCoinPrices, getTransactionStatus, getBlockNumber, getBlockByNumber} from "../coins/api";
import {DeviceEventEmitter} from "react-native";
import {setting} from '../actions/setting';
import {accountKey, fromHexString} from '../utils';
import {update_account_txs, update_account_token_txs} from '../actions/accounts';
import {strings} from "../locales/i18n";
import Toast from 'react-native-root-toast'
export class listenCoinPrice{
    constructor(store, interval=30) {
        this.store = store;
        this.interval = interval;
    }

    reset(exchange_refresh_interval, fiat_currency) {
        this.interval = exchange_refresh_interval;
        this.currency = fiat_currency;
    }

    setInterval(interval) {
        this.interval = interval;
        this.startListen();
    }

    setCurrency(currency) {
        this.currency = currency;
        this.startListen();
    }

    startListen() {
        this.stopListen();
        const thusStore = this.store;
        console.log("this.currency:" + this.currency);
        getCoinPrices(this.currency).then(prices => {
            console.log("prices:", prices);
            let settings = thusStore.getState().setting;
            for (var item in prices) {
                console.log("item:", item);
                settings.coinPrices[prices[item].crypto] = prices[item].price;
                console.log(settings.coinPrices);
                if (item.crypto === 'AION')
                    settings.coinPrice = price;
            }
            if (this.currency) {
                settings.fiat_currency = this.currency;
            }
            DeviceEventEmitter.emit('updateAccountBalance');
            thusStore.dispatch(setting(settings));
        }, error => {
            console.log("get coin price errors:", error);
            AppToast.show(strings('error_connect_remote_server'), {
                position: Toast.positions.CENTER,
            })
        });

        this.listener = setInterval(() => {
            getCoinPrices(this.currency).then(prices => {
                let settings = thusStore.getState().setting;
                for (var item in prices) {
                    settings.coinPrices[item.crypto] = item.price;
                    if (item.crypto === 'AION')
                        settings.coinPrice = price;
                }
                DeviceEventEmitter.emit('updateAccountBalance');

                thusStore.dispatch(setting(settings));
            }, error => {
                console.log("get coin price errors:", error);
            });
        }, this.interval * 60 * 1000);
    }

    stopListen() {
        if (this.listener) {
            clearInterval(this.listener);
        }
    }

}

export class listenTransaction{
    constructor(store, timeOut=60*1000){
        this.txMap={};
        this.pendingMap = {};
        this.timeOut = timeOut;
        this.store = store;
    }
    hasPending() {
        return Object.keys(this.pendingMap).length > 0;
    }
    addTransaction(tx, symbol='AION', token=undefined){
        if (symbol === 'LTC' || symbol === 'BTC')
            return;
        let thusMap = this.txMap;
        let thusPendingMap = this.pendingMap;
        const thusTimeOut = this.timeOut;
        const thusStore = this.store;
        const {user, setting}= this.store.getState();
        const hashKey = token === undefined? tx.hash + "|" + symbol: tx.hash + "|" + symbol + "|" + token;
        if(typeof thusMap[hashKey] !== 'undefined')
            return;
        console.log('getting transaction ' + tx.hash + ' status');
        this.pendingMap[hashKey] = tx;
        let removeTransaction = function(tx){
            if(typeof thusMap[hashKey] !== 'undefined'){
                console.log('clear listener');
                clearInterval(thusMap[hashKey]);
                delete thusMap[hashKey];
            }
        };
        let updateTxStatus = function(thusPendingMap, hashKey, token, thusStore, symbol, tx, setting, user) {
            delete thusPendingMap[hashKey];
            if (token === undefined) {
                thusStore.dispatch(update_account_txs(accountKey(symbol, tx.from), {[tx.hash]: tx}, user.hashed_password));
                thusStore.dispatch(update_account_txs(accountKey(symbol, tx.to), {[tx.hash]: tx}, user.hashed_password));
            } else {
                thusStore.dispatch(update_account_token_txs(accountKey(symbol, tx.from), {[tx.hash]: tx}, token, user.hashed_password));
                thusStore.dispatch(update_account_token_txs(accountKey(symbol, tx.to), {[tx.hash]: tx}, token, user.hashed_password));
            }
            DeviceEventEmitter.emit('updateAccountBalance');
        };
        let start = Date.now();
        thusMap[hashKey]=setInterval(function(){
            if (Date.now() - start > thusTimeOut) {
                delete thusPendingMap[hashKey];
                console.log('timeout');
                removeTransaction(tx);
            }
            getTransactionStatus(symbol, tx.hash).then(res=>{
                console.log("status res:", res);
                    if(res){
                        tx.blockNumber = res.blockNumber;
                        if (res.status === true) {
                            if (thusMap[hashKey]) {
                                if (symbol === 'TRX') {
                                    tx.status = 'CONFIRMED';
                                    updateTxStatus(thusPendingMap, hashKey, token, thusStore, symbol, tx, setting, user);
                                } else {
                                    let blockNumberInterval = setInterval(() => {
                                        getBlockNumber(symbol).then(
                                            number => {
                                                if (number > tx.blockNumber + 12) {
                                                    tx.status = 'CONFIRMED';
                                                    // special handling for ethereum to get tx timestamp
                                                    if (symbol === 'ETH') {
                                                        getBlockByNumber(symbol, tx.blockNumber).then(res => {
                                                            tx.timestamp = fromHexString(res.timestamp, 16) * 1000;
                                                            updateTxStatus(thusPendingMap, hashKey, token, thusStore, symbol, tx, setting, user);
                                                            clearInterval(blockNumberInterval);
                                                        }, err => {
                                                            console.log("get block number error:", err);
                                                            updateTxStatus(thusPendingMap, hashKey, token, thusStore, symbol, tx, setting, user);
                                                            clearInterval(blockNumberInterval);
                                                        });
                                                    } else {


                                                        updateTxStatus(thusPendingMap, hashKey, token, thusStore, symbol, tx, setting, user);
                                                        clearInterval(blockNumberInterval);
                                                    }
                                                }
                                            }
                                        )
                                    }, 1000 * 5);
                                }
                            }
                        } else {
                            if (thusMap[hashKey]) {
                                if (symbol === 'ETH') {
                                    getBlockByNumber(symbol, tx.blockNumber).then(res => {
                                        tx.timestamp = fromHexString(res.timestamp, 16) * 1000;
                                        tx.status = 'FAILED';
                                        updateTxStatus(thusPendingMap, hashKey, token, thusStore, symbol, tx, setting, user);
                                    }, err=> {
                                        tx.status = 'FAILED';
                                        updateTxStatus(thusPendingMap, hashKey, token, thusStore, symbol, tx, setting, user);
                                    });
                                } else {
                                    tx.status = 'FAILED';
                                    updateTxStatus(thusPendingMap, hashKey, token, thusStore, symbol, tx, setting, user);
                                }
                            }
                        }
                        removeTransaction(tx);
                    }
                }).catch(e=>{
                    console.log('reject err',e);
                    AppToast.show(strings('error_connect_remote_server'));
                    removeTransaction(tx);
                })
        }, 5 * 1000);

    }

}


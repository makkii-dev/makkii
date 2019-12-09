/* eslint-disable camelcase */
import { DeviceEventEmitter } from 'react-native';
import BackgroundTimer from 'react-native-background-timer';
import { getTxsStatus } from '../services/tx_listener.service';
import { accountKey } from '../utils';
import { createAction } from '../utils/dva';
import { Storage } from '../utils/storage';
import { AppToast } from '../app/components/AppToast';
import { strings } from '../locales/i18n';
import { Notification } from '../services/notification.service';

const TIMEOUT = 10 * 60 * 1000;
Array.prototype.unique = function unique() {
    let res = [];
    let json = {};
    for (let i = 0; i < this.length; i++) {
        if (!json[this[i]]) {
            res.push(this[i]);
            json[this[i]] = 1;
        }
    }
    return res;
};

export default {
    namespace: 'txsListener',
    state: {
        /*
           tx :{
             tx1.hash:{
               'txObj': tx1,
               'type': 'token'/'exchange'/'approve'/'normal'.
               'token': null/{symbol:'MAK',tokenTx}, //optional, when type is token
               'exchange': {srcToken:'ETH',destToken:'BAT', srcQty:1.0, destQty:2}, //optional
               'approve':{symbol:'MAK',state:'waitApprove'/‘waitRevoke'}
               'listenerStatus': 'waitReceipt'/blockNumber
             ` 'symbol': 'ETH'/'AION'/'TRX',
               'timestamp'1562837929149,
             },
             ....
           }

         */
        txs: {},
        isWaiting: false,
        callbacks: {},
    },
    reducers: {
        // updatenewTxs(state, {payload}) {
        //     const {newStatuses} = payload;
        //     /*
        //         array of {newTx, symbol, listenerStatus}
        //      */
        //     let newState = Object.assign({}, state);
        //     newStatuses.forEach(newStatus => {
        //         const {newTx, symbol, listenerStatus} = newStatus;
        //         if (listenerStatus === 'CONFIRMED' || listenerStatus === 'FAILED') {
        //             delete newState.txs[newTx.hash]
        //         } else {
        //             let temp = newState.txs[newTx.hash];
        //             temp.txObj = newTx;
        //             temp.listenerStatus = listenerStatus;
        //             newState.txs[newTx.hash] = temp;
        //         }
        //     });
        //     return newState;
        // },
        updateState(state, { payload }) {
            return { ...state, ...payload };
        },
    },
    subscriptions: {
        setup({ dispatch }) {
            let timer;
            DeviceEventEmitter.addListener('check_all_transaction_status', ({ trigger }) => {
                if (timer) BackgroundTimer.clearInterval(timer);
                if (trigger) {
                    dispatch(createAction('checkAllTxs')({ dispatch }));
                    timer = BackgroundTimer.setInterval(() => {
                        dispatch(createAction('checkAllTxs')({ dispatch }));
                    }, 10 * 1000);
                } else {
                    timer = null;
                }
            });
        },
    },
    effects: {
        *addCallBack({ payload }, { put, select }) {
            console.log('txsListener addCallBack', payload);
            const { key, fn } = payload;
            const { callbacks } = yield select(({ txsListener }) => ({ ...txsListener }));
            callbacks[key] = fn;
            yield put(createAction('updateState')({ callbacks }));
        },
        *addPendingTxs({ payload }, { call, put, select }) {
            console.log('add pending tx=>', payload);
            const { txObj, symbol, callbackParams } = payload;

            let { txs } = yield select(({ txsListener }) => ({ ...txsListener }));
            let tx = {
                txObj,
                callbackParams,
                listenerStatus: 'waitReceipt',
                symbol,
                timestamp: Date.now(),
            };
            txs[txObj.hash] = tx;

            // save current pending tx;
            yield call(Storage.set, 'newTx', txs);
            yield put(createAction('updateState')({ txs }));
        },
        *loadStorage(action, { call, put }) {
            const newTxs = yield call(Storage.get, 'newTx', {});
            console.log('load pending Tx from storage => ', newTxs);
            yield put(createAction('updateState')({ txs: newTxs }));
        },
        *reset(action, { call, put }) {
            yield call(Storage.remove, 'newTx');
            yield put(createAction('updateState')({ txs: {} }));
        },
        *checkAllTxs(
            {
                payload: { dispatch },
            },
            { call, put, select },
        ) {
            let { txs, isWaiting, callbacks } = yield select(({ txsListener }) => ({ ...txsListener }));
            if (isWaiting) return;
            const oldStatuses = Object.values(txs).map(tx => ({
                oldTx: tx.txObj,
                symbol: tx.symbol,
                listenerStatus: tx.listenerStatus,
                timestamp: tx.timestamp,
            }));
            let loadBalanceKeys = [];
            if (oldStatuses.length > 0) {
                console.log('check all pending Tx=>', oldStatuses);
                yield put(createAction('updateState')({ isWaiting: true }));
                const newStatuses = yield call(getTxsStatus, oldStatuses);
                for (let newStatus of newStatuses) {
                    const { newTx, symbol, listenerStatus: _listenerStatus, timestamp } = newStatus;
                    const listenerStatus = Date.now() - timestamp > TIMEOUT ? 'UNCONFIRMED' : _listenerStatus; // timeout
                    txs[newTx.hash].listenerStatus = listenerStatus;
                    txs[newTx.hash].txObj = newTx;
                    if (listenerStatus === 'CONFIRMED' || listenerStatus === 'FAILED' || listenerStatus === 'UNCONFIRMED') {
                        console.log(`tx:[${newTx.hash}] => ${listenerStatus}`);
                        newTx.status = listenerStatus;
                        // notification
                        if (listenerStatus === 'CONFIRMED' || listenerStatus === 'FAILED') {
                            const { currentAppState } = yield select(({ settingsModel }) => ({ ...settingsModel }));
                            if (currentAppState === 'active') {
                                AppToast.show(`${strings('toast_tx')} ${newTx.hash} ${strings(`toast_${listenerStatus}`)}`, { position: AppToast.positions.CENTER });
                            } else {
                                Notification.localNotif(`${strings('send.toast_tx_notice')}`, `${strings('toast_tx')} ${newTx.hash} ${strings(`toast_${listenerStatus}`)}`);
                            }
                        }
                        // record tx
                        const fromObj = Array.isArray(newTx.from) ? newTx.from : [{ addr: newTx.from }];
                        const toObj = Array.isArray(newTx.to) ? newTx.to : [{ addr: newTx.to }];
                        for (const vin of fromObj) {
                            loadBalanceKeys.push(accountKey(symbol, vin.addr));
                            const payloadFrom = {
                                key: accountKey(symbol, vin.addr),
                                txs: { [newTx.hash]: newTx },
                            };
                            yield put(createAction('accountsModel/updateTransactions')(payloadFrom));
                        }
                        for (const vout of toObj) {
                            loadBalanceKeys.push(accountKey(symbol, vout.addr));
                            const payloadTo = {
                                key: accountKey(symbol, vout.addr),
                                txs: { [newTx.hash]: newTx },
                            };
                            yield put(createAction('accountsModel/updateTransactions')(payloadTo));
                        }

                        const { tknTo, tknValue, tknSymbol } = newTx;
                        if (tknTo) {
                            loadBalanceKeys.push(accountKey(symbol, tknTo));
                            const payloadTokenFrom = {
                                key: accountKey(symbol, newTx.from, tknSymbol),
                                txs: { [newTx.hash]: { ...newTx, to: tknTo, value: tknValue } },
                            };
                            const payloadTokenTo = {
                                key: accountKey(symbol, tknTo, tknSymbol),
                                txs: { [newTx.hash]: { ...newTx, to: tknTo, value: tknValue } },
                            };
                            yield put(createAction('accountsModel/updateTransactions')(payloadTokenFrom));
                            yield put(createAction('accountsModel/updateTransactions')(payloadTokenTo));
                        }

                        // execute callbacks
                        const { callbackParams } = txs[newTx.hash];
                        const { funcName, metaData } = callbackParams || {};

                        if (funcName) {
                            const callback = callbacks[funcName];
                            if (callback) {
                                yield call(callback(dispatch), metaData, newTx);
                            }
                        }

                        // remove from listener queue
                        delete txs[newTx.hash];
                    }
                }
                // save current pending tx;
                yield call(Storage.set, 'newTx', txs);
                yield put(createAction('updateState')({ txs, isWaiting: false }));

                loadBalanceKeys = loadBalanceKeys.unique();
                if (loadBalanceKeys.length > 0) {
                    yield put(createAction('accountsModel/loadBalances')({ keys: loadBalanceKeys }));
                }
            }
        },
    },
};

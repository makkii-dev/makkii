/* eslint-disable camelcase */
import { DeviceEventEmitter } from 'react-native';
import BackgroundTimer from 'react-native-background-timer';
import { getTxsStatus } from '../services/tx_listener.service';
import { accountKey } from '../utils';
import { createAction } from '../utils/dva';
import { Storage } from '../utils/storage';
import { AppToast } from '../app/components/AppToast';
import { strings } from '../locales/i18n';
import { findSymbolByAddress, getExchangeHistory } from '../services/erc20_dex.service';
import { COINS } from '../client/support_coin_list';
import { Notification } from '../services/notification.service';

const ERC20DEX_NETWORK = COINS.ETH.network;
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
    },
    reducers: {
        // updatePendingTxs(state, {payload}) {
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
        txsListenerUpdateState(state, { payload }) {
            return { ...state, ...payload };
        },
    },
    subscriptions: {
        setup({ dispatch }) {
            let timer;
            DeviceEventEmitter.addListener('check_all_transaction_status', ({ trigger }) => {
                if (timer) BackgroundTimer.clearInterval(timer);
                if (trigger) {
                    dispatch(createAction('checkAllTxs')());
                    timer = BackgroundTimer.setInterval(() => {
                        dispatch(createAction('checkAllTxs')());
                    }, 10 * 1000);
                } else {
                    timer = null;
                }
            });
        },
    },
    effects: {
        *addPendingTxs({ payload }, { call, put, select }) {
            console.log('add pending tx=>', payload);
            const { txObj, type, token, exchange, symbol, approve } = payload;

            let { txs } = yield select(({ txsListener }) => ({ ...txsListener }));
            let tx = {
                txObj,
                type,
                listenerStatus: 'waitReceipt',
                symbol,
                timestamp: Date.now(),
            };
            type === 'token' ? (tx = { ...tx, token }) : type === 'exchange' ? (tx = { ...tx, exchange }) : type === 'approve' ? (tx = { ...tx, approve }) : null;
            txs[txObj.hash] = tx;

            // save current pending tx;
            yield call(Storage.set, 'pendingTx', txs);
            yield put(createAction('txsListenerUpdateState')({ txs }));
        },
        *loadStorage(action, { call, put }) {
            const PendingTxs = yield call(Storage.get, 'pendingTx', {});
            console.log('load pending Tx from storage => ', PendingTxs);
            yield put(createAction('txsListenerUpdateState')({ txs: PendingTxs }));
        },
        *reset(action, { call, put }) {
            yield call(Storage.remove, 'pendingTx');
            yield put(createAction('txsListenerUpdateState')({ txs: {} }));
        },
        *checkAllTxs(action, { call, put, select }) {
            let { txs, isWaiting } = yield select(({ txsListener }) => ({ ...txsListener }));
            if (isWaiting) return;
            const oldStatuses = Object.values(txs).map(tx => ({
                oldTx: tx.txObj,
                symbol: tx.symbol,
                listenerStatus: tx.listenerStatus,
                timestamp: tx.timestamp,
            }));
            let loadBalanceKeys = [];
            if (oldStatuses.length > 0) {
                console.log('check all pending Tx=>', txs);
                yield put(createAction('txsListenerUpdateState')({ isWaiting: true }));
                const newStatuses = yield call(getTxsStatus, oldStatuses);
                for (let newStatus of newStatuses) {
                    const { newTx, symbol, listenerStatus: _listenerStatus, timestamp } = newStatus;
                    const listenerStatus = Date.now() - timestamp > TIMEOUT ? 'UNCONFIRMED' : _listenerStatus; // timeout
                    txs[newTx.hash].listenerStatus = listenerStatus;
                    txs[newTx.hash].txObj = newTx;
                    if (listenerStatus === 'CONFIRMED' || listenerStatus === 'FAILED' || listenerStatus === 'UNCONFIRMED') {
                        console.log(`tx:[${newTx.hash}] => ${listenerStatus}`);
                        newTx.status = listenerStatus;
                        if (listenerStatus === 'CONFIRMED' || listenerStatus === 'FAILED') {
                            const { currentAppState } = yield select(({ settingsModel }) => ({ ...settingsModel }));
                            if (currentAppState === 'active') {
                                AppToast.show(`${strings('toast_tx')} ${newTx.hash} ${strings(`toast_${listenerStatus}`)}`, { position: AppToast.positions.CENTER });
                            } else {
                                Notification.localNotif(`${strings('send.toast_tx_notice')}`, `${strings('toast_tx')} ${newTx.hash} ${strings(`toast_${listenerStatus}`)}`);
                            }
                        }
                        loadBalanceKeys.push(accountKey(symbol, newTx.to));
                        loadBalanceKeys.push(accountKey(symbol, newTx.from));
                        // dispatch other actions;
                        const type = txs[newTx.hash].type;
                        yield put(
                            createAction('accountsModel/updateTransactions')({
                                txs: { [newTx.hash]: newTx },
                                key: accountKey(symbol, newTx.from),
                            }),
                        );
                        yield put(
                            createAction('accountsModel/updateTransactions')({
                                txs: { [newTx.hash]: newTx },
                                key: accountKey(symbol, newTx.to),
                            }),
                        );
                        if (type === 'token') {
                            const { symbol: tokenSymbol, tokenTx } = txs[newTx.hash].token;
                            let newTokenTx = Object.assign({}, tokenTx);
                            newTokenTx.timestamp = newTx.timestamp;
                            newTokenTx.status = newTx.status;
                            yield put(
                                createAction('accountsModel/updateTransactions')({
                                    txs: { [newTx.hash]: newTx },
                                    key: accountKey(symbol, newTx.from, tokenSymbol),
                                }),
                            );
                            yield put(
                                createAction('accountsModel/updateTransactions')({
                                    txs: { [newTx.hash]: newTx },
                                    key: accountKey(symbol, newTx.to, tokenSymbol),
                                }),
                            );
                        } else if (type === 'exchange') {
                            console.log('newTx', newTx);
                            let exchange = { ...txs[newTx.hash].exchange };
                            exchange.timestamp = newTx.timestamp;
                            exchange.status = listenerStatus;
                            exchange.blockNumber = newTx.blockNumber;
                            exchange.hash = newTx.hash;
                            if (exchange.status === 'CONFIRMED') {
                                // get newest dest_qty
                                const tokenList = yield select(({ ERC20Dex }) => ERC20Dex.tokenList);
                                const history = yield call(getExchangeHistory, newTx.from, ERC20DEX_NETWORK, newTx.hash);
                                const symbol = findSymbolByAddress(tokenList, history.destToken);
                                exchange.destQty = history.destQty / 10 ** tokenList[symbol].decimals;
                            }
                            yield put(
                                createAction('accountsModel/updateTransactions')({
                                    txs: { [newTx.hash]: exchange },
                                    key: `ETH+${newTx.from}+ERC20DEX`,
                                }),
                            );
                        } else if (type === 'approve') {
                            const { symbol } = txs[newTx.hash].approve;
                            yield put(
                                createAction('ERC20Dex/updateTokenApproval')({
                                    address: newTx.from,
                                    symbol,
                                    state: 'delete',
                                }),
                            );
                        }
                        delete txs[newTx.hash];
                    }
                }
                // save current pending tx;
                yield call(Storage.set, 'pendingTx', txs);
                yield put(createAction('txsListenerUpdateState')({ txs, isWaiting: false }));

                loadBalanceKeys = loadBalanceKeys.unique();
                if (loadBalanceKeys.length > 0) {
                    yield put(createAction('accountsModel/loadBalances')({ keys: loadBalanceKeys }));
                }
            }
        },
    },
};

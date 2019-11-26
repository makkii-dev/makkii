/* eslint-disable camelcase */

import BigNumber from 'bignumber.js';
import { createAction } from '../utils/dva';
import { getAllBalance, parseScannedData, sendTx, validateTxObj } from '../services/tx_sender.service';
import { alertOk } from '../app/components/common';
import { strings } from '../locales/i18n';
import { accountKey, getLedgerMessage } from '../utils';
import { sendTransferEventLog } from '../services/event_log.service';
import { SensitiveStorage } from '../utils/storage';
import { AppToast } from '../app/components/AppToast';
import { getTokenDetail } from '../client/api';
import { COINS } from '../client/support_coin_list';
import { getOrInitLedger } from '../services/account_import.service';

const init = {
    to: '',
    amount: '',
    data: '',
    gasPrice: '',
    gasLimit: '',
    editable: true,
    callbackParams: {},
    customBroadCast: null,
    targetRoute: undefined,
};

export default {
    namespace: 'txSenderModel',
    state: {
        ...init,
        callbacks: {},
    },
    reducers: {
        updateState(state, { payload }) {
            console.log('txSenderModel payload=>', payload);
            return { ...state, ...payload };
        },
    },
    effects: {
        *addCallBack({ payload }, { put, select }) {
            console.log('txSenderModel addCallBack', payload);
            const { key, fn } = payload;
            const { callbacks } = yield select(({ txSenderModel }) => ({ ...txSenderModel }));
            callbacks[key] = fn;
            yield put(createAction('updateState')({ callbacks }));
        },
        *reset(action, { put }) {
            yield put(createAction('updateState')(init));
        },
        *sendAll({ payload }, { call, select, put }) {
            const { currentAccount } = yield select(mapToaccountsModel);
            const amount = yield call(getAllBalance, currentAccount, payload);
            yield put(createAction('updateState')({ amount }));
        },
        *parseScannedData(
            {
                payload: { data },
            },
            { call, select, put },
        ) {
            const { currentAccount } = yield select(mapToaccountsModel);
            let ret = yield call(parseScannedData, data, currentAccount);
            if (ret.result) {
                const { contractAddress } = ret.data;
                if (contractAddress) {
                    try {
                        const { symbol } = yield call(getTokenDetail, currentAccount.symbol, contractAddress);
                        if (!currentAccount.tokens[symbol]) {
                            return { result: false, error: strings('token_exchange.button_exchange_no_token', { token: symbol }) };
                        }
                        if (symbol !== currentAccount.coinSymbol) {
                            AppToast.show(strings('send.toast_changed_token', { token: symbol }));
                        }
                        yield put(createAction('accountsModel/updateState')({ currentToken: symbol }));
                    } catch (e) {
                        return { result: false };
                    }
                } else if (currentAccount.symbol !== currentAccount.coinSymbol) {
                    AppToast.show(strings('send.toast_changed_token', { token: currentAccount.symbol }));
                    yield put(createAction('accountsModel/updateState')({ currentToken: '' }));
                }
                yield put(
                    createAction('updateState')({ gasLimit: contractAddress ? COINS[currentAccount.symbol].defaultGasLimitForContract : COINS[currentAccount.symbol].defaultGasLimit, ...ret.data }),
                );
            }
            return ret;
        },
        *validateTxObj(
            {
                payload: { txObj },
            },
            { call, select },
        ) {
            const { currentAccount } = yield select(mapToaccountsModel);
            const ret = yield call(validateTxObj, txObj, currentAccount);
            if (!ret.result) {
                alertOk(strings('alert_title_error'), strings(`send.${ret.err}`));
                return false;
            }
            return true;
        },
        *sendTx(
            {
                payload: { txObj, dispatch },
            },
            { call, select, put },
        ) {
            yield put(createAction('settingsModel/updateState')({ ignoreAppState: true })); // ignore ledger Appsate change
            const { currentAccount: _currentAccount } = yield select(mapToaccountsModel);
            const { customBroadCast, callbackParams, callbacks } = yield select(({ txSenderModel }) => ({ ...txSenderModel }));
            const { address, symbol, coinSymbol, type: accountType } = _currentAccount;
            if (accountType === '[ledger]') {
                const ret = yield call(getOrInitLedger, symbol);
                if (!ret.status) {
                    alertOk(strings('alert_title_error'), strings('ledger.error_device_count'));
                    return false;
                }
            }
            const pk = yield call(SensitiveStorage.get, accountKey(symbol, address), '');
            let currentAccount = { ..._currentAccount, private_key: pk };
            let ret = yield call(sendTx, txObj, currentAccount, customBroadCast === null);
            yield put(createAction('settingsModel/updateState')({ ignoreAppState: false }));
            ret = customBroadCast ? yield call(customBroadCast, ret.data) : ret;
            if (ret.result) {
                // send evt log
                sendTransferEventLog(symbol, symbol === coinSymbol ? null : coinSymbol, new BigNumber(txObj.amount));

                // record tx ;
                const {
                    data: { pendingTx },
                } = ret;
                const fromObj = Array.isArray(pendingTx.from) ? pendingTx.from : [{ addr: pendingTx.from }];
                const toObj = Array.isArray(pendingTx.to) ? pendingTx.to : [{ addr: pendingTx.to }];
                for (const vin of fromObj) {
                    const payloadFrom = {
                        key: accountKey(symbol, vin.addr),
                        txs: { [pendingTx.hash]: pendingTx },
                    };
                    yield put(createAction('accountsModel/updateTransactions')(payloadFrom));
                }
                for (const vout of toObj) {
                    const payloadTo = {
                        key: accountKey(symbol, vout.addr),
                        txs: { [pendingTx.hash]: pendingTx },
                        force: false,
                    };
                    yield put(createAction('accountsModel/updateTransactions')(payloadTo));
                }

                const { tknTo, tknValue } = pendingTx;
                if (tknTo) {
                    pendingTx.tknSymbol = coinSymbol;
                    const payloadTokenFrom = {
                        key: accountKey(symbol, pendingTx.from, coinSymbol),
                        txs: { [pendingTx.hash]: { ...pendingTx, to: tknTo, value: tknValue } },
                    };
                    const payloadTokenTo = {
                        key: accountKey(symbol, tknTo, coinSymbol),
                        txs: { [pendingTx.hash]: { ...pendingTx, to: tknTo, value: tknValue } },
                        force: false,
                    };
                    yield put(createAction('accountsModel/updateTransactions')(payloadTokenFrom));
                    yield put(createAction('accountsModel/updateTransactions')(payloadTokenTo));
                }

                // execute callback
                const { funcName, metaData } = callbackParams || {};
                if (funcName) {
                    const callback = callbacks[funcName];
                    if (callback) {
                        console.log('txSenderModel execute callback=>', funcName);
                        yield call(callback(dispatch), metaData, pendingTx);
                    }
                }

                // dispatch Tx to listener
                const payloadTxListener = {
                    txObj: pendingTx,
                    callbackParams,
                    symbol,
                };

                if (symbol !== 'BTC' && symbol !== 'LTC') {
                    yield put(createAction('txsListener/addPendingTxs')(payloadTxListener));
                }

                return pendingTx;
            }
            const { error } = ret;
            if (error.message && accountType === '[ledger]') {
                alertOk(strings('alert_title_error'), getLedgerMessage(error.message));
            } else if (error.message && error.type === 'pokket') {
                alertOk(strings('alert_title_error'), `${strings('send.error_send_transaction')}:${strings(`pokket.error_${error.message}`)}`);
            } else if ((error.toString() || '').match('dust')) {
                alertOk(strings('alert_title_error'), strings('send.error_dust_transaction'));
            } else {
                alertOk(strings('alert_title_error'), strings('send.error_send_transaction'));
            }
            return false;
        },
    },
};

const mapToaccountsModel = ({ accountsModel }) => {
    const { currentAccount: key, currentToken, accountsMap, tokenLists } = accountsModel;
    const { tokens, symbol } = accountsMap[key];
    const newtokens = Object.keys(tokens).reduce((map, el) => {
        map[el] = {
            balance: tokens[el],
            contractAddr: tokenLists[symbol][el].contractAddr,
            tokenDecimal: tokenLists[symbol][el].tokenDecimal,
        };
        return map;
    }, {});
    const currentAccount = {
        ...accountsMap[key],
        coinSymbol: currentToken === '' ? accountsMap[key].symbol : currentToken,
        tokens: newtokens,
    };
    return {
        currentAccount,
    };
};

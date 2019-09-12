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
import { fetchTokenDetail } from '../client/api';
import { COINS } from '../client/support_coin_list';

const init = {
    to: '',
    amount: '',
    data: '',
    gasPrice: '',
    gasLimit: '',
    editable: true,
    txType: {},
    customBroadCast: null,
    targetRoute: undefined,
};

export default {
    namespace: 'txSenderModel',
    state: init,
    reducers: {
        updateState(state, { payload }) {
            console.log('txSenderModel payload=>', payload);
            return { ...state, ...payload };
        },
    },
    effects: {
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
                        const { symbol } = yield call(fetchTokenDetail, currentAccount.symbol, contractAddress);
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
                payload: { txObj },
            },
            { call, select, put },
        ) {
            const { currentAccount: _currentAccount } = yield select(mapToaccountsModel);
            const { txType, customBroadCast } = yield select(({ txSenderModel }) => ({ ...txSenderModel }));
            const { address, symbol, coinSymbol, type: accountType } = _currentAccount;
            const pk = yield call(SensitiveStorage.get, accountKey(symbol, address), '');
            let currentAccount = { ..._currentAccount, private_key: pk };
            const { type, data } = txType;
            yield put(createAction('settingsModel/updateState')({ ignoreAppState: true }));
            let ret = yield call(sendTx, txObj, currentAccount, customBroadCast === null);
            ret = customBroadCast ? yield call(customBroadCast, ret.data) : ret;
            // TODO refactor sendTx and txListener to reduce coupling and complexity  2019-09-12
            if (ret.result) {
                sendTransferEventLog(symbol, symbol === coinSymbol ? null : coinSymbol, new BigNumber(txObj.amount));
                // dispatch tx to accountsModel;
                const {
                    data: { pendingTx, pendingTokenTx },
                } = ret;
                if (symbol !== 'BTC' && symbol !== 'LTC') {
                    const payloadTxFrom = {
                        key: accountKey(symbol, pendingTx.from),
                        txs: { [pendingTx.hash]: pendingTx },
                    };
                    const payloadTxTo = {
                        key: accountKey(symbol, pendingTx.to),
                        txs: { [pendingTx.hash]: pendingTx },
                        force: false,
                    };
                    yield put(createAction('accountsModel/updateTransactions')(payloadTxFrom));
                    yield put(createAction('accountsModel/updateTransactions')(payloadTxTo));
                }
                if (symbol === 'BTC' || symbol === 'LTC') {
                    for (let vin of pendingTx.from) {
                        const payloadTxFrom = {
                            key: accountKey(symbol, vin.addr),
                            txs: { [pendingTx.hash]: pendingTx },
                        };
                        yield put(createAction('accountsModel/updateTransactions')(payloadTxFrom));
                    }
                    for (let vout of pendingTx.to) {
                        const payloadTxTo = {
                            key: accountKey(symbol, vout.addr),
                            txs: { [pendingTx.hash]: pendingTx },
                            force: false,
                        };
                        yield put(createAction('accountsModel/updateTransactions')(payloadTxTo));
                    }
                }
                let payloadTxListener = {
                    txObj: pendingTx,
                    type: 'normal',
                    symbol,
                };
                if (pendingTokenTx) {
                    const payload1 = {
                        key: accountKey(symbol, pendingTokenTx.from, coinSymbol),
                        txs: { [pendingTokenTx.hash]: pendingTokenTx },
                    };
                    const payload2 = {
                        key: accountKey(symbol, pendingTokenTx.to, coinSymbol),
                        txs: { [pendingTokenTx.hash]: pendingTokenTx },
                        force: false,
                    };
                    payloadTxListener = {
                        ...payloadTxListener,
                        type: 'token',
                        token: { symbol: coinSymbol, tokenTx: pendingTokenTx },
                    };
                    yield put(createAction('accountsModel/updateTransactions')(payload1));
                    yield put(createAction('accountsModel/updateTransactions')(payload2));
                }
                if (type && type === 'exchange') {
                    data.hash = pendingTx.hash;
                    const payload = {
                        key: accountKey(symbol, address, 'ERC20DEX'),
                        txs: { [pendingTx.hash]: data },
                    };
                    payloadTxListener = {
                        ...payloadTxListener,
                        type: 'exchange',
                        exchange: data,
                    };
                    yield put(createAction('accountsModel/updateTransactions')(payload));
                }

                // dispatch tx to erc20dexModal
                if (type && type === 'approve') {
                    payloadTxListener = {
                        ...payloadTxListener,
                        type: 'approve',
                        approve: data,
                    };
                    yield put(createAction('ERC20Dex/updateTokenApproval')(data));
                }

                // dispatch tx to tx listener
                if (symbol !== 'BTC' && symbol !== 'LTC') {
                    yield put(createAction('txsListener/addPendingTxs')(payloadTxListener));
                }
                yield put(createAction('settingsModel/updateState')({ ignoreAppState: false }));
                return true;
            }
            const { error } = ret;
            if (error.message && accountType === '[ledger]') {
                alertOk(strings('alert_title_error'), getLedgerMessage(error.message));
            } else if (error.message && error.type === 'pokket') {
                alertOk(strings('alert_title_error'), `${strings('send.error_send_transaction')}:${strings(`pokket.error_${error.message}`)}`);
            } else {
                alertOk(strings('alert_title_error'), strings('send.error_send_transaction'));
            }
            yield put(createAction('settingsModel/updateState')({ ignoreAppState: false }));
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

/* eslint-disable camelcase */
import { getAccountFromMasterKey, getAccountFromPrivateKey, getAccountFromWIF, getAccountsFromLedger, getOrInitLedger, getPrivateKeyFromBIP38 } from '../services/account_import.service';
import { accountKey } from '../utils';
import { createAction } from '../utils/dva';
import { alertOk } from '../app/components/common';
import { strings } from '../locales/i18n';
import { validateAddress } from '../client/keystore';
import { ignoreNextAppStateChange } from '../utils/touchId';

const init = {
    symbol: '',
    private_key: '',
    type: '',
    address: '',
    derivationIndex: 0,
    hdIndex: 0,
    ledger_lists: {
        /*
            <index>:<address>
         */
    },
    readyToImport: false,
};

export default {
    namespace: 'accountImportModel',
    state: init,
    reducers: {
        updateState(state, { payload }) {
            console.log('accountImportModel payload=>', payload);
            return { ...state, ...payload };
        },
    },
    effects: {
        *fromMasterKey(action, { call, put, select }) {
            const { symbol, hd_index, accountsMap } = yield select(({ accountImportModel, accountsModel }) => ({
                symbol: accountImportModel.symbol,
                hd_index: accountsModel.hd_index,
                accountsMap: accountsModel.accountsMap,
            }));
            const indexPathMap = hd_index[symbol] || {};
            console.log('indexPathMap=>', indexPathMap);
            console.log('accountsMap=>', accountsMap);
            let minIndex = 0;
            while (indexPathMap[minIndex] !== undefined) {
                minIndex++;
            }
            while (1) {
                const { private_key, address, index } = yield call(getAccountFromMasterKey, symbol, minIndex);
                console.log('getAccountFromMasterKey ret =>', { private_key, address, index });
                if (accountsMap[accountKey(symbol, address)]) {
                    // already add; update index
                    yield put(
                        createAction('accountsModel/updateHdIndex')({
                            symbol,
                            address,
                            index,
                            code: 'add',
                        }),
                    );
                }
                if (!accountsMap[accountKey(symbol, address)]) {
                    console.log('not added');
                    yield put(
                        createAction('updateState')({
                            private_key,
                            address,
                            type: '[local]',
                            readyToImport: true,
                            hdIndex: index,
                        }),
                    );
                    break;
                }
                minIndex++;
            }
        },
        *fromPrivateKey({ payload }, { call, put, select }) {
            const { private_key, compressed = true } = payload;
            const { symbol, accountsMap } = yield select(({ accountImportModel, accountsModel }) => ({
                symbol: accountImportModel.symbol,
                accountsMap: accountsModel.accountsMap,
            }));
            try {
                const { address, private_key: privateKey } = yield call(getAccountFromPrivateKey, symbol, private_key, { compressed });
                if (!accountsMap[accountKey(symbol, address)]) {
                    yield put(
                        createAction('updateState')({
                            private_key: privateKey,
                            address,
                            compressed,
                            type: '[pk]',
                            readyToImport: true,
                        }),
                    );
                    return 1;
                }
                return 2; // already imported
            } catch (e) {
                return 3; // private_key error
            }
        },
        *fromLedger({ payload }, { put, select }) {
            const { index } = payload;
            const ledger_lists = yield select(({ accountImportModel }) => accountImportModel.ledger_lists);
            const address = ledger_lists[index];
            yield put(
                createAction('updateState')({
                    address,
                    derivationIndex: index,
                    type: '[ledger]',
                    readyToImport: true,
                }),
            );
        },
        *fromBip38({ payload }, { put, select, call }) {
            const { bip38, password } = payload;
            const { result, privateKey, compressed } = yield call(getPrivateKeyFromBIP38, bip38, password);
            console.log('res', result, privateKey, compressed);
            const { symbol, accountsMap } = yield select(({ accountImportModel, accountsModel }) => ({
                symbol: accountImportModel.symbol,
                accountsMap: accountsModel.accountsMap,
            }));
            if (result) {
                const { address, private_key: pk } = yield call(getAccountFromPrivateKey, symbol, privateKey, { compressed });
                if (!accountsMap[accountKey(symbol, address)]) {
                    yield put(
                        createAction('updateState')({
                            private_key: pk,
                            address,
                            compressed,
                            type: '[pk]',
                            readyToImport: true,
                        }),
                    );
                    return 1;
                }
                return 2; // already imported
            }
            return 3; // private_key error
        },
        *fromWIF({ payload }, { put, select, call }) {
            const { wif } = payload;
            const { symbol, accountsMap } = yield select(({ accountImportModel, accountsModel }) => ({
                symbol: accountImportModel.symbol,
                accountsMap: accountsModel.accountsMap,
            }));
            try {
                const { address, private_key: pk, compressed } = yield call(getAccountFromWIF, symbol, wif);
                if (!accountsMap[accountKey(symbol, address)]) {
                    yield put(
                        createAction('updateState')({
                            private_key: pk,
                            address,
                            compressed,
                            type: '[pk]',
                            readyToImport: true,
                        }),
                    );
                    return 1;
                }
                return 2; // already imported
            } catch (e) {
                return 3; // private_key error
            }
        },
        *fromViewOnlyAddress({ payload }, { put, select }) {
            const { address } = payload;
            const { symbol, accountsMap } = yield select(({ accountImportModel, accountsModel }) => ({
                symbol: accountImportModel.symbol,
                accountsMap: accountsModel.accountsMap,
            }));
            console.log('symbol', symbol, address);
            const res = validateAddress(symbol, address);
            if (res) {
                if (!accountsMap[accountKey(symbol, address)]) {
                    yield put(
                        createAction('updateState')({
                            address,
                            type: '[view only]',
                            readyToImport: true,
                        }),
                    );
                    return 1;
                }
                return 2; // already imported
            }
            return 3; // address invalid
        },
        *getAccountsFromLedger(
            {
                payload: { page, size },
            },
            { call, put, select },
        ) {
            const { symbol, accountsMap, old_ledger_lists } = yield select(({ accountImportModel, accountsModel }) => ({
                symbol: accountImportModel.symbol,
                old_ledger_lists: accountImportModel.ledger_lists,
                accountsMap: accountsModel.accountsMap,
            }));
            let new_ledger_lists = { ...old_ledger_lists };
            try {
                const rets = yield call(getAccountsFromLedger, symbol, page * size, page * size + size);
                rets.forEach(r => {
                    const { address, index } = r;
                    if (!accountsMap[accountKey(symbol, address)]) {
                        new_ledger_lists[index] = address;
                    }
                });
                yield put(createAction('updateState')({ ledger_lists: new_ledger_lists }));
            } catch (e) {
                console.log('getAccountsFromLedger error=>', e);
                alertOk(strings('alert_title_error'), strings('ledger.error_invalid_tx_payload'));
            }
        },
        *importAccount(
            {
                payload: { name },
            },
            { put, select },
        ) {
            const { symbol, address, type, private_key, derivationIndex, hdIndex, compressed } = yield select(({ accountImportModel }) => ({
                symbol: accountImportModel.symbol,
                address: accountImportModel.address,
                type: accountImportModel.type,
                private_key: accountImportModel.private_key,
                derivationIndex: accountImportModel.derivationIndex,
                hdIndex: accountImportModel.hdIndex,
                compressed: accountImportModel.compressed,
            }));
            let account = { symbol, address, type, name, tokens: {}, balance: 0 };
            if (compressed !== undefined) {
                account.compressed = compressed;
            }
            if (account.type === '[ledger]') {
                account.derivationIndex = derivationIndex;
            } else {
                account.private_key = private_key;
                if (account.type === '[local]') {
                    yield put(
                        createAction('accountsModel/updateHdIndex')({
                            symbol,
                            address,
                            index: hdIndex,
                            code: 'add',
                        }),
                    );
                }
            }
            yield put(createAction('accountsModel/addAccount')({ account }));
            yield put(createAction('updateState')(init));
        },
        *getLedgerStatus(
            {
                payload: { symbol },
            },
            { call, put },
        ) {
            ignoreNextAppStateChange(true);
            yield put(createAction('updateState')({ ledger_lists: {} }));
            const ret = yield call(getOrInitLedger, symbol);
            ignoreNextAppStateChange(false);
            return ret;
        },
    },
};

/* eslint-disable camelcase */
import { DeviceEventEmitter } from 'react-native';
import { accountKey, decrypt, encrypt } from '../utils';
import { SensitiveStorage, Storage } from '../utils/storage';
import { createAction } from '../utils/dva';
import { findSymbolByAddress, getExchangeHistory } from '../services/erc20_dex.service';
import { COINS } from '../client/support_coin_list';
import { getAccountBalances, getTransactionsHistory, getTransfersHistory, pendingTxsInvolved } from '../services/accounts.service';
import { AppToast } from '../app/components/AppToast';
import { strings } from '../locales/i18n';

const network = COINS.ETH.network;

/*

    features: manage accounts: add, delete change account name, load balance,
              manage txs: add, delete, fetch tx history
              manage tokens: add, delete, load balance

 */
export default {
    namespace: 'accountsModel',
    state: {
        currentAccount: '', // one of accountKey
        currentToken: '',
        isGettingBalance: false,
        accountsKey: [],
        /*
            [<symbol>'+'<address>]
            eg:
            ['AION+0xa0e08bf1df768bb3f40e795dd5c487889c17f6c54111f8d9a5553783a1e6c963', 'ETH+0x9fcc27c7320703c43368cf1a4bf076402cd0d6b4']
         */
        accountsMap: {},
        /*
            eg:
                {
                     private_key  saved in Sensitive storage
                    "AION+0xa0e08bf1df768bb3f40e795dd5c487889c17f6c54111f8d9a5553783a1e6c963":{  // key format is <symbol>'+'<address>; In storage , it will be saved with the key  'acc+'<symbol>'+'<address>
                        "address":"0xa0e08bf1df768bb3f40e795dd5c487889c17f6c54111f8d9a5553783a1e6c963",
                        "balance":"15309.17544544050208896", // balance will not be saved
                        "name":"aion1",
                        "symbol":"AION",
                        "derivationIndex": 1, // this only exists for ledger account
                        "type":"[ledger]", // [pk], [local], [ledger]
                        "tokens":{'MAK':1,'EOS':2,...}, // balance will not be saved; In storage, it will be saved  as an array eg: ['MAk', 'EOS',...];
                    },
                }
         */
        transactionsMap: {},
        /*
            eg:
                {
                    "AION+0xa0e08bf1df768bb3f40e795dd5c487889c17f6c54111f8d9a5553783a1e6c963": { // key format is <symbol>'+'<address>'+'<tokenSymbol>; In storage , it will be saved with the key  'tx+'<symbol>'+'<address>'+'<tokenSymbol>
                        "0xccb97f2911f4a9315643574117946b6e8a1de038b4d810d7da494637b3f65f7b": {
                            "hash": "0xccb97f2911f4a9315643574117946b6e8a1de038b4d810d7da494637b3f65f7b",
                            "timestamp": 1560500875132,
                            "from": "0xa0e08bf1df768bb3f40e795dd5c487889c17f6c54111f8d9a5553783a1e6c963",
                            "to": "a01b56b8292c4af5404f765f1fb6eee877b84868c1b9989124f8c0d0e188cb4f",
                            "value": "0",
                            "status": "CONFIRMED",
                            "blockNumber": 2639993
                        },
                        "0xccb97f2911f4a9315643574117946b6e8a1de038b4d810d7da494637b3f65f7b": {
                            "hash": "0xccb97f2911f4a9315643574117946b6e8a1de038b4d810d7da494637b3f65f7b",
                            "timestamp": 1560500875132,
                            "from": "0xa0e08bf1df768bb3f40e795dd5c487889c17f6c54111f8d9a5553783a1e6c963",
                            "to": "0xa0ada7e2aff49daec0dfaf16ad062ce2514941f9848a04156445ae5bd17740b0",
                            "value": "10",
                            "status": "CONFIRMED",
                            "blockNumber": 2639993
                        }
                    },
                    "AION+0xa0e08bf1df768bb3f40e795dd5c487889c17f6c54111f8d9a5553783a1e6c963+MAK": {
                        "0xccb97f2911f4a9315643574117946b6e8a1de038b4d810d7da494637b3f65f7b": {
                            "hash": "0xccb97f2911f4a9315643574117946b6e8a1de038b4d810d7da494637b3f65f7b",
                            "timestamp": 1560500875132,
                            "from": "0xa0e08bf1df768bb3f40e795dd5c487889c17f6c54111f8d9a5553783a1e6c963",
                            "to": "a01b56b8292c4af5404f765f1fb6eee877b84868c1b9989124f8c0d0e188cb4f",
                            "value": "0",
                            "status": "CONFIRMED",
                            "blockNumber": 2639993
                        },
                        "0xccb97f2911f4a9315643574117946b6e8a1de038b4d810d7da494637b3f65f7b": {
                            "hash": "0xccb97f2911f4a9315643574117946b6e8a1de038b4d810d7da494637b3f65f7b",
                            "timestamp": 1560500875132,
                            "from": "0xa0e08bf1df768bb3f40e795dd5c487889c17f6c54111f8d9a5553783a1e6c963",
                            "to": "0xa0ada7e2aff49daec0dfaf16ad062ce2514941f9848a04156445ae5bd17740b0",
                            "value": "10",
                            "status": "CONFIRMED",
                            "blockNumber": 2639993
                        }
                    }
                }
       */

        tokenLists: {},
        /*
            eg:
                {
                    'AION':{
                        "MAK":{
                            "symbol":"MAK",
                            "contractAddr":"0xa01b56b8292c4af5404f765f1fb6eee877b84868c1b9989124f8c0d0e188cb4f",
                            "name":"Makkii coin",
                            "tokenDecimal":"18",
                        }
                    },
                    'ETH':{
                        'KNC':{
                            "symbol":'KNC',
                            "contractAddr": '0x4e470dc7321e84ca96fcaedd0c8abcebbaeb68c6',
                            "name": 'KyberNetwork',
                            "tokenDecimal": '18',
                        }
                    }
                }
         */
        hd_index: {
            AION: {},
            BTC: {},
            ETH: {},
            LTC: {},
            TRON: {},
        }, // index information of addresses created from hd wallet
    },
    reducers: {
        updateState(state, { payload }) {
            console.log('accountsModel payload=>', payload);
            return { ...state, ...payload };
        },
    },
    effects: {
        *loadStorage({ payload }, { call, select, put }) {
            const { state_version, options } = payload;

            const hashed_password = yield select(({ userModel }) => userModel.hashed_password);
            if (state_version < 2) {
                const old_accounts_storage = yield call(Storage.get, 'accounts', false, false);
                let old_accounts = JSON.parse(decrypt(old_accounts_storage, hashed_password) || {});
                old_accounts = upgradeAccountsV0_V1(state_version, old_accounts, options);
                const { accountsKey, accountsMap, transactionsMap, tokenLists, privateKeyMap } = upgradeAccountsV1_V2(old_accounts);
                const hd_index = yield call(Storage.get, 'userModel', {}).hd_index ||
                    Object.keys(COINS).reduce((map, el) => {
                        map[el] = {};
                        return map;
                    }, {});
                for (let pk of Object.keys(privateKeyMap)) {
                    yield call(SensitiveStorage.set, pk, privateKeyMap[pk]);
                }
                yield put(
                    createAction('updateState')({
                        accountsKey,
                        accountsMap,
                        transactionsMap,
                        tokenLists,
                        hd_index,
                    }),
                );
                yield put(createAction('saveAccounts')({ keys: Object.keys(accountsMap) }));
                yield put(createAction('saveTransaction')({ keys: Object.keys(transactionsMap) }));
                yield put(createAction('saveTokenLists')());
                yield put(createAction('saveHdIndex')());
                yield put(createAction('loadBalances')({ keys: accountsKey, force: true }));
            } else {
                const accountsKey = yield call(Storage.get, 'accountsKey', []);
                // const accountsKey = [];
                const tokenLists = yield call(Storage.get, 'tokenLists', {});
                const hd_index = yield call(
                    Storage.get,
                    'hdIndex',
                    Object.keys(COINS).reduce((map, el) => {
                        map[el] = {};
                        return map;
                    }, {}),
                );
                let accountsMap = {};
                let transactionsMap = {};
                for (let key of accountsKey) {
                    // recover account
                    const account = yield call(Storage.get, `acc+${key}`, {});
                    if (!account.address) {
                        accountsKey.remove(key);
                        continue;
                    }
                    const { tokens } = account;
                    accountsMap[key] = {
                        ...account,
                        balance: 0,
                        tokens: tokens.reduce((map, el) => {
                            map[el] = 0;
                            return map;
                        }, {}),
                    };
                    // recover tx;
                    transactionsMap[key] = yield call(Storage.get, `tx+${key}`, {});
                    for (let tokenSymbol of tokens) {
                        transactionsMap[`${key}+${tokenSymbol}`] = yield call(Storage.get, `tx+${key}+${tokenSymbol}`, {});
                    }
                    if (account.symbol === 'ETH') {
                        transactionsMap[`${key}+ERC20DEX`] = yield call(Storage.get, `tx+${key}+ERC20DEX`, {});
                    }
                }
                yield put(
                    createAction('updateState')({
                        accountsKey,
                        transactionsMap,
                        accountsMap,
                        tokenLists,
                        hd_index,
                    }),
                );
                yield put(createAction('loadBalances')({ keys: accountsKey, force: true }));
            }
            return true;
        },
        *reset(action, { put, select }) {
            const accountsKey = yield select(({ accountsModel }) => accountsModel.accountsKey);
            yield put(createAction('deleteAccounts')({ keys: accountsKey }));
        },
        *saveAccounts({ payload }, { call, select }) {
            // Adding account and changing account name need to be saved
            const { keys } = payload;
            const { accountsKey, accountsMap, hashed_password } = yield select(({ accountsModel, userModel }) => ({
                accountsKey: accountsModel.accountsKey,
                accountsMap: accountsModel.accountsMap,
                hashed_password: userModel.hashed_password,
            }));
            // save accountsKey
            yield call(Storage.set, 'accountsKey', accountsKey);
            // save account
            for (let key of keys) {
                console.log('save account=>', key);
                const account = accountsMap[key];
                const { tokens = {} } = account;
                let toBeSaved = { ...account };
                if (account.private_key) {
                    toBeSaved.private_key = encrypt(account.private_key, hashed_password);
                }
                delete toBeSaved.balance; // don't save balance;
                toBeSaved.tokens = Object.keys(tokens);
                yield call(Storage.set, `acc+${key}`, toBeSaved);
            }
        },
        *saveTransaction({ payload }, { call, select }) {
            const { keys } = payload;
            const transactionsMap = yield select(({ accountsModel }) => accountsModel.transactionsMap);
            for (let key of keys) {
                const txs = transactionsMap[key];
                // only saved recent 20 tx;
                const toBeSaved = Object.values(txs)
                    .sort(compareFn)
                    .slice(0, 20)
                    .reduce((map, el) => {
                        map[el.hash] = el;
                        return map;
                    }, {});
                if (Object.keys(toBeSaved).length > 0) {
                    // object is not empty
                    console.log('save txs=>', key, toBeSaved);
                    yield call(Storage.set, `tx+${key}`, toBeSaved);
                }
            }
        },
        *saveTokenLists(action, { call, select }) {
            const tokenLists = yield select(({ accountsModel }) => accountsModel.tokenLists);
            yield call(Storage.set, 'tokenLists', tokenLists);
        },
        *saveHdIndex(action, { call, select }) {
            const hd_index = yield select(({ accountsModel }) => accountsModel.hd_index);
            yield call(Storage.set, 'hdIndex', hd_index);
        },
        *deleteAccounts({ payload }, { call, select, put }) {
            const { accountsKey, accountsMap, transactionsMap, hd_index, isGettingBalance } = yield select(({ accountsModel }) => ({
                accountsKey: accountsModel.accountsKey,
                accountsMap: accountsModel.accountsMap,
                transactionsMap: accountsModel.transactionsMap,
                hd_index: accountsModel.hd_index,
            }));
            if (isGettingBalance) {
                AppToast.show(strings('wallet.toast_is_getting_balance'), {
                    position: AppToast.positions.TOP,
                });
                return;
            }
            const { keys } = payload;
            console.log('delete accounts=>', keys);
            let newAccountsKey = [...accountsKey];
            let newAccountsMap = { ...accountsMap };
            let newTransactionsMap = { ...transactionsMap };
            let newHdIndex = { ...hd_index };
            for (let key of keys) {
                if (accountsMap[key]) {
                    newAccountsKey.remove(key);
                    yield call(SensitiveStorage.remove, key);
                    const { type, address, symbol } = accountsMap[key];
                    if (type === '[local]') {
                        yield put(createAction('updateHdIndex')({ symbol, address, code: 'delete' }));
                    }
                    delete newAccountsMap[key];
                    yield call(Storage.remove, `acc+${key}`);
                    delete newTransactionsMap[key];
                    yield call(Storage.remove, `tx+${key}`);
                    const { tokens } = accountsMap[key];
                    for (let tokenSymbol of Object.keys(tokens)) {
                        delete newTransactionsMap[`${key}+${tokenSymbol}`];
                        yield call(Storage.remove, `tx+${key}+${tokenSymbol}`);
                    }
                    delete newTransactionsMap[`${key}+ERC20DEX`];
                    yield call(Storage.remove, `tx+${key}+ERC20DEX`);
                }
            }
            yield call(Storage.set, 'accountsKey', newAccountsKey);
            yield put(
                createAction('updateState')({
                    accountsKey: newAccountsKey,
                    accountsMap: newAccountsMap,
                    transactionsMap: newTransactionsMap,
                    hd_index: newHdIndex,
                }),
            );
        },
        *getExchangeHistory(
            {
                payload: { user_address },
            },
            { call, select, put },
        ) {
            const tokenList = yield select(({ ERC20Dex }) => ERC20Dex.tokenList);
            let allHistory = yield call(getExchangeHistory, user_address, network);
            const TransactionsMap = yield select(({ accountsModel }) => accountsModel.transactionsMap);
            const isFirst = !TransactionsMap[`ETH+${user_address}+ERC20DEX`];
            Object.keys(allHistory).forEach(el => {
                const srcToken = findSymbolByAddress(tokenList, allHistory[el].srcToken);
                const destToken = findSymbolByAddress(tokenList, allHistory[el].destToken);
                allHistory[el].srcToken = srcToken;
                allHistory[el].destToken = destToken;
                allHistory[el].srcQty = allHistory[el].srcQty / 10 ** tokenList[srcToken].decimals;
                allHistory[el].destQty = allHistory[el].destQty / 10 ** tokenList[destToken].decimals;
            });
            yield put(
                createAction('updateTransactions')({
                    txs: allHistory,
                    key: `ETH+${user_address}+ERC20DEX`,
                    force: isFirst || false,
                }),
            );
            return true;
        },
        *updateTransactions({ payload }, { put, select }) {
            console.log('updateTransactions=>', payload);
            const { key, txs, force = true, needSave = true } = payload;
            const oldTransactionsMap = yield select(({ accountsModel }) => accountsModel.transactionsMap);
            const accountsKey = yield select(({ accountsModel }) => accountsModel.accountsKey);
            if (!accountsKey.includes(/\w+\+\w+/.exec(key)[0])) {
                return;
            }
            let newTransactionsMap = { ...oldTransactionsMap };
            if (newTransactionsMap[key] === undefined && !force) {
                // Not mandatory to add
                return;
            }
            // if force; create if null, cover pending tx
            const pendingTxs = force
                ? {}
                : Object.keys(newTransactionsMap[key]).reduce((map, el) => {
                      if (newTransactionsMap[key][el].status === 'PENDING') {
                          map[el] = newTransactionsMap[key][el];
                      }
                      return map;
                  }, {});
            newTransactionsMap[key] = { ...newTransactionsMap[key], ...txs, ...pendingTxs };
            yield put(createAction('updateState')({ transactionsMap: newTransactionsMap }));
            if (needSave) {
                yield put(createAction('saveTransaction')({ keys: [key] }));
            }
        },
        *getTransactionHistory(
            {
                payload: { user_address, symbol, tokenSymbol, page, size, needSave = true },
            },
            { call, select, put },
        ) {
            let txs;
            try {
                if (tokenSymbol && tokenSymbol !== '') {
                    const tokenLists = yield select(({ accountsModel }) => accountsModel.tokenLists);
                    const contractAddr = tokenLists[symbol][tokenSymbol].contractAddr;
                    txs = yield call(getTransfersHistory, symbol, user_address, contractAddr, page, size);
                } else {
                    txs = yield call(getTransactionsHistory, symbol, user_address, page, size);
                }
            } catch (e) {
                AppToast.show(strings('error_connect_remote_server'));
                return 0;
            }
            if (Object.keys(txs).length === 0) {
                AppToast.show(strings('message_no_more_data'));
                return 0;
            }
            yield put(
                createAction('updateTransactions')({
                    txs,
                    key: accountKey(symbol, user_address, tokenSymbol),
                    needSave,
                    force: symbol === 'BTC' || symbol === 'LTC',
                }),
            );
            return Object.keys(txs).length;
        },
        *loadBalances({ payload }, { call, select, put }) {
            const { keys, force = false } = payload;
            console.log('loadBalances=>', payload);
            const { oldAccountsMap, tokenLists, isGettingBalance } = yield select(({ accountsModel }) => ({
                oldAccountsMap: accountsModel.accountsMap,
                tokenLists: accountsModel.tokenLists,
                isGettingBalance: accountsModel.isGettingBalance,
            }));
            if (isGettingBalance) return;
            yield put(createAction('updateState')({ isGettingBalance: true }));
            const pendingTxs = yield select(({ txsListener }) => txsListener.txs);
            let ret = true;
            let newAccountsMap = { ...oldAccountsMap };
            for (let key of keys) {
                if (newAccountsMap[key]) {
                    const { address, symbol, tokens } = newAccountsMap[key];
                    if (!force && pendingTxsInvolved(pendingTxs, address)) {
                        ret = ret && false;
                        continue;
                    }
                    const payloads = Object.keys(tokens).reduce(
                        (arr, el) => {
                            arr.push({
                                symbol,
                                address,
                                contractAddr: tokenLists[symbol][el].contractAddr,
                                tokenSymbol: tokenLists[symbol][el].symbol,
                                tokenDecimals: tokenLists[symbol][el].decimals,
                            });
                            return arr;
                        },
                        [{ symbol, address }],
                    );
                    const rets = yield call(getAccountBalances, payloads);
                    rets.forEach(el => {
                        if (el.tokenSymbol) {
                            newAccountsMap[key].tokens[el.tokenSymbol] = el.balance;
                        } else {
                            newAccountsMap[key].balance = el.balance;
                        }
                    });
                }
            }
            yield put(
                createAction('updateState')({
                    accountsMap: newAccountsMap,
                    isGettingBalance: false,
                }),
            );
            return ret;
        },
        *updateHdIndex(
            {
                payload: { symbol, address, index, code },
            },
            { select, put },
        ) {
            const oldHdIndex = yield select(({ accountsModel }) => accountsModel.hd_index);
            const newHdIndex = { ...oldHdIndex };
            if (code === 'delete') {
                let del;
                for (let k of Object.keys(newHdIndex[symbol])) {
                    if (newHdIndex[symbol][k] === address) {
                        del = k;
                        break;
                    }
                }
                delete newHdIndex[symbol][del];
            } else if (code === 'add') {
                newHdIndex[symbol][index] = address;
            }
            yield put(createAction('updateState')({ hd_index: newHdIndex }));
            yield put(createAction('saveHdIndex')());
        },
        *addAccount(
            {
                payload: { account: _account },
            },
            { call, select, put },
        ) {
            const { accountsKey, accountsMap, transactionsMap } = yield select(({ accountsModel }) => ({
                accountsKey: accountsModel.accountsKey,
                accountsMap: accountsModel.accountsMap,
                transactionsMap: accountsModel.transactionsMap,
            }));
            DeviceEventEmitter.emit('add_new_account', _account);

            const { symbol, address, private_key } = _account;
            let account = { ..._account };
            delete account.private_key;
            if (private_key) {
                yield call(SensitiveStorage.set, accountKey(symbol, address), private_key);
            }
            const key = accountKey(symbol, address);
            const newAccountsKey = [...accountsKey, key];
            const newAccountsMap = { ...accountsMap, [key]: account };
            const newTransactionsMap = { ...transactionsMap, [key]: {} };
            yield put(
                createAction('updateState')({
                    accountsKey: newAccountsKey,
                    accountsMap: newAccountsMap,
                    transactionsMap: newTransactionsMap,
                }),
            );
            yield put(createAction('saveAccounts')({ keys: [key] }));
            yield put(createAction('saveTransaction')({ keys: [key] }));
            yield put(createAction('loadBalances')({ keys: [key], force: true }));
        },
        *changeCurrentAccountName(
            {
                payload: { name },
            },
            { select, put },
        ) {
            const { currentAccount, accountsMap, isGettingBalance } = yield select(({ accountsModel }) => ({
                currentAccount: accountsModel.currentAccount,
                accountsMap: accountsModel.accountsMap,
                isGettingBalance: accountsModel.isGettingBalance,
            }));
            if (isGettingBalance) {
                AppToast.show(strings('wallet.toast_is_getting_balance'), {
                    position: AppToast.positions.TOP,
                });
                return;
            }
            let newAccountsMap = { ...accountsMap };
            newAccountsMap[currentAccount].name = name;
            yield put(createAction('updateState')({ accountsMap: newAccountsMap }));
            yield put(createAction('saveAccounts')({ keys: [currentAccount] }));
        },
        *addTokenToCurrentAccount(
            {
                payload: { token },
            },
            { select, put },
        ) {
            const { tokenLists, accountsMap, currentAccount, transactionsMap, isGettingBalance } = yield select(({ accountsModel }) => ({
                currentAccount: accountsModel.currentAccount,
                tokenLists: accountsModel.tokenLists,
                accountsMap: accountsModel.accountsMap,
                transactionsMap: accountsModel.transactionsMap,
                isGettingBalance: accountsModel.isGettingBalance,
            }));
            if (isGettingBalance) {
                AppToast.show(strings('wallet.toast_is_getting_balance'), {
                    position: AppToast.positions.TOP,
                });
                return false;
            }
            const { symbol } = accountsMap[currentAccount];
            const { symbol: tokenSymbol } = token;
            let newTokenLists = { ...tokenLists };
            newTokenLists[symbol] = {
                ...newTokenLists[symbol],
                [tokenSymbol]: {
                    contractAddr: token.contractAddr,
                    symbol: tokenSymbol,
                    name: token.name,
                    tokenDecimal: token.tokenDecimal,
                },
            };
            let newAccountsMap = { ...accountsMap };
            newAccountsMap[currentAccount].tokens[tokenSymbol] = 0;
            const newTransactionsMap = {
                ...transactionsMap,
                [`${currentAccount}+${tokenSymbol}`]: {},
            };
            yield put(
                createAction('updateState')({
                    accountsMap: newAccountsMap,
                    tokenLists: newTokenLists,
                    transactionsMap: newTransactionsMap,
                }),
            );
            yield put(createAction('saveAccounts')({ keys: [currentAccount] }));
            yield put(createAction('saveTransaction')({ keys: [`${currentAccount}+${tokenSymbol}`] }));
            yield put(createAction('saveTokenLists')());
            yield put(createAction('loadBalances')({ keys: [currentAccount] }));
            return true;
        },
        *deleteToken(
            {
                payload: { symbol, address, tokenSymbol },
            },
            { call, select, put },
        ) {
            const { accountsMap, transactionsMap } = yield select(({ accountsModel }) => ({
                accountsMap: accountsModel.accountsMap,
                transactionsMap: accountsModel.transactionsMap,
            }));

            const acckey = accountKey(symbol, address);
            const txKey = accountKey(symbol, address, tokenSymbol);
            let newAccountsMap = { ...accountsMap };
            let newTransactionsMap = { ...transactionsMap };
            if (accountsMap[acckey]) {
                delete newTransactionsMap[txKey];
                yield call(Storage.remove, `tx+${txKey}`);
                delete newAccountsMap[acckey].tokens[tokenSymbol];
            }
            yield put(
                createAction('updateState')({
                    accountsMap: newAccountsMap,
                    transactionsMap: newTransactionsMap,
                }),
            );
            yield put(createAction('saveAccounts')({ keys: [acckey] }));
        },
        *getPrivateKey(
            {
                payload: { key },
            },
            { call },
        ) {
            return yield call(SensitiveStorage.get, key);
        },
    },
};

const upgradeAccountsV0_V1 = (state_version, old_accounts, options) => {
    if (state_version === undefined || state_version < 1) {
        let new_accounts = {};
        Object.keys(old_accounts).forEach(k => {
            // check key is satisfy 'symbol+address'
            let new_key = k;
            new_key = new_key.indexOf('+') >= 0 ? new_key : `AION+${new_key}`;
            let account = Object.assign({}, old_accounts[k]);
            // remove account network in transactions and tokens
            delete account.isDefault;
            account.transactions = typeof account.transactions === 'object' ? account.transactions : {};
            account.tokens = typeof account.tokens === 'object' ? account.tokens : {};
            account.transactions = account.transactions[options.network] ? account.transactions[options.network] : {};
            account.tokens = account.tokens[options.network] ? account.tokens[options.network] : {};
            account.symbol = account.symbol ? account.symbol : 'AION';

            new_accounts[new_key] = account;
        });
        return new_accounts;
    }
    return old_accounts;
};

const upgradeAccountsV1_V2 = old_accounts => {
    const accountsKey = Object.keys(old_accounts);
    let tokenLists = {};
    const { accountsMap, transactionsMap, privateKeyMap } = accountsKey.reduce(
        ({ accountsMap, transactionsMap, privateKeyMap }, k) => {
            const symbol = k.slice(0, k.indexOf('+'));
            const accBaseKey = k;
            const txBaseKey = k;
            const { tokens } = old_accounts[k];
            const newTokens = Object.keys(tokens).reduce((map, el) => {
                map[el] = tokens[el].balance || 0;
                return map;
            }, {});
            let body = { ...old_accounts[k], tokens: newTokens };
            if (body.private_key) {
                privateKeyMap[accBaseKey] = body.private_key;
            }
            delete body.private_key;
            delete body.transactions;
            accountsMap[accBaseKey] = body;
            transactionsMap[txBaseKey] = { ...old_accounts[k].transactions };
            Object.keys(tokens).forEach(tokenSymbol => {
                const txKey = `${txBaseKey}+${tokenSymbol}`;
                let tokenBody = { ...old_accounts[k].tokens[tokenSymbol] };
                delete tokenBody.tokenTxs;
                delete tokenBody.balance;
                tokenLists[symbol] = { ...tokenLists[symbol], [tokenSymbol]: tokenBody };
                transactionsMap[txKey] = { ...old_accounts[k].tokens[tokenSymbol].tokenTxs };
            });
            return { accountsMap, transactionsMap, privateKeyMap };
        },
        { accountsMap: {}, transactionsMap: {}, privateKeyMap: {} },
    );

    return { accountsKey, accountsMap, transactionsMap, tokenLists, privateKeyMap };
};

const compareFn = (a, b) => {
    if (b.timestamp === undefined && a.timestamp !== undefined) return 1;
    if (b.timestamp === undefined && a.timestamp === undefined) return 0;
    if (b.timestamp !== undefined && a.timestamp === undefined) return -1;
    return b.timestamp - a.timestamp;
};

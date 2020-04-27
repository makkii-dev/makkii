import MobileConnectorAdapter from 'socket-bridge/packages/mobile';
import io from 'socket.io-client';
import { NavigationActions } from 'react-navigation';
import { store, createAction } from '../utils/dva';
import { validateTxObj } from './tx_sender.service';
import { Notification } from './notification.service';
import { strings } from '../locales/i18n';

// utils
export const getCurrentRoute = navigationState => {
    if (!navigationState) {
        return null;
    }
    if (!navigationState.routes) {
        return navigationState;
    }

    const route = navigationState.routes[navigationState.index];
    if (route.routes) {
        return getCurrentRoute(route);
    }

    return route;
};

const socket = io('http://192.168.50.100:8888');

socket.addEventListener('error', err => {
    console.log('socket error=>', err);
});

export const mobileConnector = new MobileConnectorAdapter(socket);

mobileConnector.onDisconnect = () => {
    store.dispatch(createAction('connectorModel/logout')({}));
};
/**
 * @returns {AION: array, BTC: array,...}
 */
mobileConnector.getAccount = async cointype => {
    try {
        const { accountsMap } = store.getState().accountsModel;
        const addrs = {};
        Object.keys(accountsMap).forEach(el => {
            const [symbol, addr] = el.split('+');
            if (addrs[symbol]) {
                addrs[symbol].push({
                    address: addr,
                    name: accountsMap[el].name,
                    amount: accountsMap[el].balance,
                });
            } else {
                addrs[symbol] = [
                    {
                        address: addr,
                        name: accountsMap[el].name,
                        amount: accountsMap[el].balance,
                    },
                ];
            }
        });
        return Object.keys(addrs).reduce((arr, el) => {
            if (typeof cointype === 'undefined') {
                arr.push({ key: el, data: addrs[el] });
            } else if (el === cointype) {
                arr.push({ key: el, data: addrs[el] });
            }
            return arr;
        }, []);
    } catch (err) {
        console.log('connector error=>', err);
        return {};
    }
};

/**
 *  @param cointype: string {ETH|AION|BTC|LTC|TRX}
 *  @param unsignedTx: unsigned transaction
 *                 ```
 *                      from:string
 *                      to: string
 *                      value: number
 *                      data?: string
 *                      gasPrice?: string
 *                      gasLimit?: string
 *                      byteFee?: string
 *                 ```
 *  @param symbol: define when send token
 */
mobileConnector.sendTransaction = async (cointype, unsignedTx, symbol = '') => {
    const cointype_ = cointype.toUpperCase();
    const { from, to, amount, data, gasPrice, gasLimit, byteFee } = unsignedTx;
    // validate cointype and symbol
    const address = `${cointype_}+${from}`;
    const { accountsKey, accountsMap, tokenLists } = store.getState().accountsModel;
    if (!accountsKey.includes(address)) {
        throw new Error('invalid from , address not exist');
    }
    const { tokens } = accountsMap[address];
    if (symbol) {
        if (typeof tokens[symbol] === 'undefined') {
            throw new Error(`invalid symbol, token:${symbol} not import`);
        }
    }

    // create Account
    const newtokens = Object.keys(tokens).reduce((map, el) => {
        map[el] = {
            balance: tokens,
            contractAddr: tokenLists[symbol][el].contractAddr,
            tokenDecimal: tokenLists[symbol][el].tokenDecimal,
        };
        return map;
    }, {});
    const account = {
        ...accountsMap[address],
        coinSymbol: symbol === '' ? cointype_ : symbol,
        tokens: newtokens,
    };
    // update accountmodel
    store.dispatch(createAction('accountsModel/updateState')({ currentAccount: address, currentToken: symbol }));

    // validate txobj
    const txObj = { to, amount, data, gasPrice, gasLimit, byteFee };
    const ret = await validateTxObj(txObj, account);
    if (!ret.result) {
        throw new Error(ret.err);
    }

    // update txsendermodel
    store.dispatch(createAction('txSenderModel/updateState')({ ...txObj, editable: false }));

    // try to notification
    const { currentAppState } = store.getState().settingsModel;
    if (currentAppState !== 'active') {
        Notification.localNotif(strings('connector.notification_title_tx_request'), strings('connector.notification_message_tx_request'));
    }
    // try send
    return new Promise((resolve, reject) => {
        const naviagtionState = store.getState().router;
        const currentRoute = getCurrentRoute(naviagtionState);
        console.log('currentRoute=>', currentRoute);
        store.dispatch(
            NavigationActions.navigate({
                routeName: 'signed_vault_send',
                params: {
                    callback: (err, value) => {
                        if (err) {
                            reject(err);
                        }
                        resolve(value);
                    },
                },
            }),
        );
        if (currentRoute.routeName === 'unlock') {
            setTimeout(() => {
                store.dispatch(
                    NavigationActions.navigate({
                        routeName: 'unlock',
                        params: { cancel: false },
                    }),
                );
            }, 200);
        }
    });
};

export const checkSessionStaus = () => {
    mobileConnector
        .getSessionStatus()
        .then(payload => {
            const origin = store.getState().connectorModel.isLogin;
            if (!origin && payload.isAlive) {
                store.dispatch(createAction('connectorModel/updateState')({ isLogin: true }));
            }
            setTimeout(() => checkSessionStaus(), 5 * 1000);
        })
        .catch(() => {
            const origin = store.getState().connectorModel.isLogin;
            if (origin) {
                store.dispatch(createAction('connectorModel/updateState')({ isLogin: false }));
            }
        });
};

export const login = (sig, channel) => {
    return new Promise((resolve, reject) => {
        if (!mobileConnector.socket.connected) {
            mobileConnector.socket.connect();
        }
        mobileConnector
            .register(channel, sig)
            .then(res => {
                store.dispatch(createAction('connectorModel/login')({ signature: sig, channel }));
                checkSessionStaus();
                socket.addEventListener('reconnect', () => {
                    const { signature, channel } = store.getState().connectorModel;
                    console.log('sig', signature, channel);
                    login(signature, channel).catch(err => {
                        console.log('try reRegister failed', err);
                    });
                });
                resolve(res);
            })
            .catch(err => {
                reject(err);
            });
    });
};

export const tryLogin = (sig, channel_) => {
    const { signature, channel } = store.getState().connectorModel;
    login(sig || signature, channel_ || channel)
        .then(() => {})
        .catch(() => {});
};

export const logout = () => {
    mobileConnector.disconnectChannel();
};

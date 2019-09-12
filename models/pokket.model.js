import { NavigationActions } from 'react-navigation';
import { customBroadCastTx, getBaseData, getOrders, getProducts, toggleAutoRoll } from '../services/pokket.service';
import { createAction } from '../utils/dva';
import { AppToast } from '../app/components/AppToast';
import { strings } from '../locales/i18n';
import { parseScannedData } from '../services/contact_add.service';

export default {
    namespace: 'pokketModel',
    state: {
        products: {},
        orders: {},
        currentAccount: '',
        currentProduct: '',
        currentOrder: '',
        btcAddress: '',
        ethAddress: '',
        totalInvestment: '',
        banners: [],
    },
    reducers: {
        updateState(state, { payload }) {
            console.log('pokketModel payload=>', payload);
            return { ...state, ...payload };
        },
    },
    subscriptions: {},
    effects: {
        *getRemoteData(action, { call, put }) {
            const { btcAddress, ethAddress, totalInvestment, banners, error } = yield call(getBaseData);
            if (error) {
                return { error };
            }
            yield put(createAction('updateState')({ btcAddress, ethAddress, totalInvestment, banners }));
            return {};
        },
        *getProducts({ payload }, { call, put }) {
            const { keyword = '' } = payload;
            const products = yield call(getProducts, keyword);
            yield put(createAction('updateState')({ products }));
            return Object.values(products).length;
        },
        *getOrders({ payload = {} }, { call, select, put }) {
            const { address, page = 0, size = 25 } = payload;
            let address1 = address;
            if (address === undefined || address.length === 0) {
                const { accountsMap } = yield select(mapToAccountModel);
                address1 = Object.keys(accountsMap)
                    .filter(k => k.startsWith('BTC') || k.startsWith('ETH'))
                    .reduce((arr, el) => {
                        arr.push(accountsMap[el].address.toLowerCase());
                        return arr;
                    }, []);
            }
            const ret = yield call(getOrders, { addresses: address1, page, size });
            const { orders } = yield select(mapToPokketModel);
            yield put(createAction('updateState')({ orders: { ...orders, ...ret } }));
            return Object.keys(ret).length;
        },
        *createOrder({ payload }, { select, put }) {
            const { currentAccount, currentProduct, ethAddress, btcAddress } = yield select(mapToPokketModel);
            const { amount } = payload;
            yield put(createAction('accountsModel/updateState')({ currentAccount, currentToken: currentProduct }));
            const toAddress = currentProduct === 'BTC' ? btcAddress : ethAddress;
            const payload_ = {
                editable: false,
                to: toAddress,
                amount,
                customBroadCast: customBroadCastTx(payload, toAddress),
                targetRoute: 'signed_pokket',
            };
            yield put(createAction('txSenderModel/updateState')(payload_));
            yield put(NavigationActions.navigate({ routeName: 'signed_vault_send' }));
        },
        *setCurrentProduct({ payload }, { select, put }) {
            const { token } = payload;
            const { currentAccount } = yield select(mapToPokketModel);
            const { accountsMap } = yield select(mapToAccountModel);
            const destAccountType = token === 'BTC' ? 'BTC' : 'ETH';
            const currentAccountType = currentAccount === '' ? '' : currentAccount.slice(0, currentAccount.indexOf('+'));
            let newAccount = currentAccount;
            if (destAccountType !== currentAccountType) {
                for (let key of Object.keys(accountsMap)) {
                    if (key.startsWith(destAccountType)) {
                        newAccount = key;
                        break;
                    }
                }
            }
            yield put(createAction('updateState')({ currentAccount: newAccount, currentProduct: token }));
        },
        *toggleAutoRoll({ payload }, { call, select, put }) {
            const newOrder = yield call(toggleAutoRoll, payload);
            if (JSON.stringify(newOrder) === '{}') {
                AppToast.show(strings('pokket.toast_modify_order_failed'));
            } else {
                const { orders } = yield select(mapToPokketModel);
                yield put(createAction('updateState')({ orders: { ...orders, [newOrder.orderId]: newOrder } }));
            }
        },
        *parseScannedData({ payload }, { call }) {
            const { data } = payload;
            return yield call(parseScannedData, data, 'ETH');
        },
    },
};

const mapToAccountModel = ({ accountsModel }) => ({ ...accountsModel });
const mapToPokketModel = ({ pokketModel }) => ({ ...pokketModel });

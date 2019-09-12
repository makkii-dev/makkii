import { HttpClient } from 'lib-common-util-js';
import Config from 'react-native-config';

const baseurl = Config.isTestNet ? 'http://45.118.132.89:8080' : 'http://45.118.132.89:8080';

const getProducts = async (keyword = '') => {
    const url = `${baseurl}/pokket/product`;
    try {
        console.log('[Pokket getProduct req]=>', url);
        const resp = await HttpClient.get(url, { search: keyword }, true);
        console.log('[Pokket getProduct resp]=>', resp.data);
        return resp.data.reduce((m, el) => {
            m[el.token] = el;
            return m;
        }, {});
    } catch (e) {
        console.log('[Pokket getProduct error]=>', e);
        return {};
    }
};

const getOrders = async ({ addresses = '', page = 0, size = 25 }) => {
    const url = `${baseurl}/pokket/order`;
    try {
        console.log('[Pokket getOrders req]=>', url);
        const resp = await HttpClient.get(url, { addresses, page, size }, true);
        console.log('[Pokket getOrders resp]=>', resp.data);
        return resp.data.content.reduce((m, el) => {
            m[el.orderId] = { ...el };
            return m;
        }, {});
    } catch (e) {
        console.log('[Pokket getOrders error]=>', e);
        return {};
    }
};

const createOrder = async payload => {
    const url = `${baseurl}/pokket/order`;
    try {
        console.log('[Pokket createOrder req]=>', url, payload);
        const resp = await HttpClient.put(url, payload, true);
        console.log('[Pokket createOrder resp]=>', resp.data);
        if (!resp.data.status) {
            return resp.data;
        }
        console.log('[Pokket createOrder error]=>', resp.data.message);
        return { status: resp.data.status, message: resp.data.message };
    } catch (e) {
        console.log('[Pokket createOrder error]=>', e);
        return {};
    }
};

const toggleAutoRoll = async ({ autoRoll, orderId }) => {
    const url = `${baseurl}/pokket/order/autoroll`;
    try {
        console.log('[Pokket toggleAutoRoll req]=>', url);
        const resp = await HttpClient.post(url, { autoRoll, orderId }, true);
        console.log('[Pokket toggleAutoRoll resp]=>', resp.data);
        if (!resp.data.code) {
            return resp.data;
        }
        console.log('[Pokket toggleAutoRoll error]=>', resp.data.message);
        return {};
    } catch (e) {
        console.log('[Pokket toggleAutoRoll error]=>', e);
        return {};
    }
};

const getBaseData = async () => {
    try {
        const btcUrl = `${baseurl}/pokket/deposit/btc_address`;
        const ethUrl = `${baseurl}/pokket/deposit/eth_address`;
        const totalInvestmentUrl = `${baseurl}/pokket/statistic/totalInvestment`;
        const bannersUrl = `${baseurl}/pokket/banners`;
        const { data: btcAddress } = await HttpClient.get(btcUrl);
        const { data: ethAddress } = await HttpClient.get(ethUrl);
        const { data: totalInvestment } = await HttpClient.get(totalInvestmentUrl);
        const { data: banners } = await HttpClient.get(bannersUrl);
        console.log(`get statistic eth=>${ethAddress} btc=>${btcAddress} totalInvestment=>${totalInvestment} banners=>${banners}`);
        return { btcAddress, ethAddress, totalInvestment, banners };
    } catch (e) {
        console.log('[Pokket getBaseData error]=>', e);
        return { error: e };
    }
};

const customBroadCastTx = (order, toAddress) => async ({ txObj, encoded }) => {
    order.rawTransaction = encoded;
    const resp = await createOrder(order);
    if (resp.orderId) {
        // broadCastTx success
        const pendingTx = { ...txObj, hash: resp.investTransactionHash, status: 'PENDING' };
        const pendingTokenTx = order.token !== 'BTC' || order.token !== 'ETH' ? { ...txObj, to: toAddress, value: order.amount, hash: resp.investTransactionHash, status: 'PENDING' } : undefined;
        return { result: true, data: { pendingTx, pendingTokenTx } };
    }
    return { result: false, error: { type: 'pokket', message: resp.message.match(/^pokket/) ? resp.message : 'UNKNOWN' } };
};

export { getProducts, getOrders, createOrder, toggleAutoRoll, getBaseData, customBroadCastTx };

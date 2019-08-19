import { HttpClient } from 'lib-common-util-js';
import Config from 'react-native-config';

const baseurl = Config.isTestNet ? 'http://45.118.132.89:8080' : 'http://45.118.132.89:8080';

const getProducts = async (keyword = '') => {
    const url = `${baseurl}/pokket/product?search=${keyword}`;
    try {
        console.log('[Pokket getProduct req]=>', url);
        const resp = await HttpClient.get(url);
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
    const url = `${baseurl}/pokket/order?addresses=${addresses}&page=${page}&size=${size}`;
    try {
        console.log('[Pokket getOrders req]=>', url);
        const resp = await HttpClient.get(url);
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
        console.log('[Pokket createOrder req]=>', url);
        const resp = await HttpClient.put(url, payload, true);
        console.log('[Pokket createOrder resp]=>', resp.data);
        if (!resp.data.code) {
            return resp.data;
        }
        console.log('[Pokket createOrder error]=>', resp.data.message);
        return {};
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

export { getProducts, getOrders, createOrder, toggleAutoRoll };

import { Storage } from '../utils/storage';
import { createAction } from '../utils/dva';
import { tryLogin } from '../services/connector.service';

export default {
    namespace: 'connectorModel',
    state: {
        isLogin: false,
        signature: '',
        channel: '',
    },
    reducers: {
        updateState(state, { payload }) {
            console.log('connectorModel payload=>', payload);
            return { ...state, ...payload };
        },
    },
    effects: {
        *loadStorage(action, { call, put }) {
            const connector_storage = yield call(Storage.get, 'connector', {}, true);
            yield put(createAction('updateState')({ ...connector_storage }));
            yield call(tryLogin, connector_storage.signature, connector_storage.channel);
        },
        *login({ payload }, { call, put }) {
            const { channel, signature } = payload;
            yield call(Storage.set, 'connector', { channel, signature });
            yield put(createAction('updateState')({ signature, channel, isLogin: true }));
        },
        *logout(action, { call, put }) {
            yield call(Storage.set, 'coonector', {});
            yield put(createAction('updateState')({ signature: '', channel: '', isLogin: false }));
        },
    },
};

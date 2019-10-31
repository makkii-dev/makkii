/* eslint-disable */
import { getApps } from '../services/discover.service';

export default {
    namespace: 'discoverModel',
    state: {
        enabledApps: ['aion_staking', 'news', 'browser'],
    },
    reducers: {
        updateState(state, { payload }) {
            console.log('discoverModel updateState', payload);
            return { ...state, ...payload };
        },
    },
    effects: {
        *getApps(action, { call, put }) {
            const res = yield call(getApps);
            // TODO getApps
        },
    },
};

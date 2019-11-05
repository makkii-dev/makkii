/* eslint-disable */
import { getApps } from '../services/discover.service';
import {createAction} from "../utils/dva";

export default {
    namespace: 'discoverModel',
    state: {
        enabledApps: {},
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
            yield put(createAction('updateState')({
                enabledApps: { ...res}
            }));
            return true;
        },
    },
};

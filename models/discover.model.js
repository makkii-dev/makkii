/* eslint-disable */
import { getApps } from '../services/discover.service';
import {createAction} from "../utils/dva";

export default {
    namespace: 'discoverModel',
    state: {
        enabledApps: {'aion_staking':{}, },
    },
    reducers: {
        updateState(state, { payload }) {
            console.log('discoverModel updateState', payload);
            return { ...state, ...payload };
        },
    },
    effects: {
        *getApps(action, { call, select, put }) {
            const enabledApps = yield select(({discoverModel})=>discoverModel.enabledApps);
            const res = yield call(getApps);
            yield put(createAction('updateState')({
                enabledApps: {...enabledApps, ...res}
            }));
            return true;
        },
    },
};

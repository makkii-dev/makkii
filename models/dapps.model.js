/* eslint-disable camelcase */
export default {
    namespace: 'dappsModel',
    state: {},
    reducers: {
        updateState(state, { payload }) {
            return { ...state, ...payload };
        },
    },
};

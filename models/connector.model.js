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
};

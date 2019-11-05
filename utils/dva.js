import React from 'react';
import { create } from 'dva-core';
import { Provider, connect } from 'react-redux';
import { NavigationActions } from 'react-navigation';
import PopupCustom from '../app/components/PopupCustom';

export { connect };
export const createAction = type => payload => ({ type, payload });
export const navigate = (url, params = {}) => ({ dispatch }) => {
    dispatch(NavigationActions.navigate({ routeName: url, params }));
};
export const navigateBack = ({ dispatch }) => {
    dispatch(NavigationActions.back());
};
// eslint-disable-next-line import/no-mutable-exports
export let popCustom;
// eslint-disable-next-line import/no-mutable-exports
export let store;

export default function(options) {
    const app = create(options);
    // HMR workaround
    if (!global.registered) options.models.forEach(model => app.model(model));
    global.registered = true;

    app.start();
    // eslint-disable-next-line no-underscore-dangle
    store = app._store;
    // eslint-disable-next-line no-underscore-dangle
    app.store = app._store;
    app.start = container => () => (
        <Provider store={store}>
            <PopupCustom
                ref={ref => {
                    popCustom = ref;
                }}
            />
            {container}
        </Provider>
    );
    app.getStore = () => store;

    return app;
}

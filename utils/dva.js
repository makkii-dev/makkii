import React from 'react'
import { create } from 'dva-core'
import { Provider, connect } from 'react-redux'
import PopupCustom from '../components/Popupcustom';

export { connect }
export const createAction = type => payload => ({ type, payload })

export default function(options) {
    const app = create(options);
    // HMR workaround
    if (!global.registered) options.models.forEach(model => app.model(model));
    global.registered = true;

    app.start();
    // eslint-disable-next-line no-underscore-dangle
    const store = app._store;
    app.store = app._store;
    app.start = container => () => <Provider store={store}>
        <PopupCustom ref={ref=>{global.popCustom=ref}}/>
        {container}
    </Provider>;
    app.getStore = () => store;

    return app
}
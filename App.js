// libs
import React from 'react';
import { setCurrentServer } from 'react-native-makkii-core';
import { YellowBox } from 'react-native';
import _ from 'lodash';
import Config from 'react-native-config';
// models
import erc20DexModel from './models/erc20_dex.model';
import txListenerModel from './models/txs_listener.model';
import accountsModel from './models/accounts.model';
import accountImportModel from './models/account_import.model';
import tokenImportModel from './models/token_import.model';
import txSenderModel from './models/tx_sender.model';
import userModel from './models/user.model';
import settingsModel from './models/settings.model';
import contactAddModel from './models/contact_add.model';
import dappsModel from './models/dapps.model';
// store
import Router, { routerReducer, routerMiddleware } from './app/routes';
import dva, { createAction } from './utils/dva';

import data from './data';

// eslint-disable-next-line camelcase
const { app_server_static, app_server_api } = Config;
setCurrentServer({ app_server_static, app_server_api });
const app = dva({
    models: [
        erc20DexModel,
        txListenerModel,
        accountsModel,
        accountImportModel,
        tokenImportModel,
        txSenderModel,
        userModel,
        settingsModel,
        contactAddModel,
        dappsModel,
    ],
    extraReducers: {
        router: routerReducer,
    },
    onAction: [routerMiddleware],
    onError(e) {
        console.log('init dva error', e);
    },
});
const store = app.store;

store.dispatch(createAction('dappsModel/updateState')({ ...data.dapps }));

const App = app.start(<Router />);

YellowBox.ignoreWarnings([
    'Setting a timer',
    'WebView has been',
    'Async Storage has',
    'requires main queue setup',
]);
const _console = _.clone(console);
console.warn = message => {
    if (
        message.indexOf('Setting a timer') <= -1 &&
        message.indexOf('WebView has been') <= -1 &&
        message.indexOf('Async Storage has') <= -1
    ) {
        _console.warn(message);
    }
};

export default App;

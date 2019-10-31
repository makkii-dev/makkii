// libs
import React from 'react';
import { YellowBox } from 'react-native';
import _ from 'lodash';
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
import pokketModel from './models/pokket.model';
import newsModel from './models/news.model';
import discoverModel from './models/discover.model';
// store
import Router, { routerReducer, routerMiddleware } from './app/routes';
import dva, { createAction } from './utils/dva';

import data from './data';

// eslint-disable-next-line camelcase
const app = dva({
    models: [erc20DexModel, txListenerModel, accountsModel, accountImportModel, tokenImportModel, txSenderModel, userModel, settingsModel, contactAddModel, pokketModel, newsModel, discoverModel],
    extraReducers: {
        router: routerReducer,
    },
    onAction: [routerMiddleware],
    onError(e) {
        console.log('init dva error', e);
    },
});
global.AppStore = app.store;

AppStore.dispatch(createAction('dappsModel/updateState')({ ...data.dapps }));

const App = app.start(<Router />);

YellowBox.ignoreWarnings(['Setting a timer', 'WebView has been', 'Async Storage has', 'requires main queue setup.', 'Accessing view manager']);
const _console = _.clone(console);
console.warn = message => {
    if (!message.match(/|Setting a timer|WebView has been|Async Storage has|Accessing view manager|/)) {
        _console.warn(message);
    }
};

export default App;

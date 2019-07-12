// libs
import React, {Component} from 'react';
// actions
import {dapps}             from './actions/dapps.js';

// reducers
import reducer_dapps           from './reducers/dapps.js';


// models
import erc20DexModel from './models/erc20DexModel';
import txListenerModel from './models/txsListenerModel';
import accountsModel from './models/accountsModel';
import accountImportModel from './models/accountImportModel'
import tokenImportModel from './models/tokenImportModel';
import txSenderModel  from './models/txSenderModel';
import userModel      from './models/userModel';
import settingsModel  from  './models/settingsModel';
import contactAddModel from './models/contactAddModel';
// store
import Router, {routerReducer,routerMiddleware} from './components/routes';
import dva from './utils/dva';


const app = dva({
	models: [erc20DexModel, txListenerModel, accountsModel, accountImportModel,tokenImportModel,txSenderModel, userModel, settingsModel, contactAddModel],
	extraReducers: {
		router: 		 routerReducer,
		dapps:           reducer_dapps,
	},
	onAction: [routerMiddleware],
	onError(e) {
		console.log('init dva error', e);
	}
});

import data from './data.js';
const store = app.store;

store.dispatch(dapps(data.dapps));

import {listenAppState} from './utils';
import {listenCoinPrice} from './utils/listeners';
import {listenTransaction} from './utils/listeners';
global.listenTx = new listenTransaction(store);
global.listenPrice = new listenCoinPrice(store);
global.listenApp = new listenAppState();


const App = app.start(<Router />);



import { YellowBox } from 'react-native';
import _ from 'lodash';

YellowBox.ignoreWarnings(['Setting a timer', 'WebView has been', 'Async Storage has', 'requires main queue setup']);
const _console = _.clone(console);
console.warn = message => {
	if (message.indexOf('Setting a timer') <= -1 && message.indexOf('WebView has been') <= -1 && message.indexOf('Async Storage has') <= -1) {
		_console.warn(message);
	}
};


export default App;

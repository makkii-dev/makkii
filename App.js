// libs
import React, {Component} from 'react';
// actions
import {dapps}             from './actions/dapps.js';

// reducers
import reducer_account         from './reducers/account.js';
import reducer_accounts        from './reducers/accounts.js';
import reducer_accounts_ledger from './reducers/accounts_ledger.js';
import reducer_dapps           from './reducers/dapps.js';
import reducer_setting         from './reducers/setting.js';
import reducer_user            from './reducers/user.js';

// modals
import erc20DexModal from './modals/erc20DexModal';
import txListenerModal from './modals/txsListenerModal';
import accountsModal from './modals/accountsModal';
import accountImportModal from './modals/accountImportModal'
import tokenImportModal from './modals/tokenImportModal';
// store
import Router, {routerReducer,routerMiddleware} from './components/routes';
import dva from './utils/dva';


const app = dva({
	models: [erc20DexModal, txListenerModal, accountsModal, accountImportModal,tokenImportModal],
	extraReducers: {
		router: 		 routerReducer,
		account:         reducer_account,
		accounts:        reducer_accounts,
		accounts_ledger: reducer_accounts_ledger,
		dapps:           reducer_dapps,
		setting:         reducer_setting,
		user:            reducer_user,
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

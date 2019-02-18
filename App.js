// libs
import React, {Component} from 'react';
import {createSwitchNavigator, createAppContainer} from 'react-navigation';
import {createStore, combineReducers} from 'redux';
import {Provider} from 'react-redux';

// actions
import {accounts}           from './actions/accounts.js';
import {accounts_ledger}    from './actions/accounts_ledger.js';
import {dapps}              from './actions/dapps.js';
import {setting}            from './actions/setting.js';
import {user,user_signout}  from './actions/user.js';
 
// reducers
import reducer_account         from './reducers/account.js';
import reducer_accounts        from './reducers/accounts.js';
import reducer_accounts_ledger from './reducers/accounts_ledger.js';
import reducer_dapps           from './reducers/dapps.js';
import reducer_setting         from './reducers/setting.js'; 
import reducer_user            from './reducers/user.js'; 

// store 
const store = createStore(combineReducers({
	account:         reducer_account,
	accounts:        reducer_accounts,
	accounts_ledger: reducer_accounts_ledger,
	dapps:           reducer_dapps,
	setting:         reducer_setting,
	user:            reducer_user,
}));  

// ui 
import scan     from './components/scan.js';
import splash   from './components/splash.js';
import unsigned from './components/unsigned/index.js';
import signed   from './components/signed/index.js';
const Routes = createAppContainer(createSwitchNavigator({
	'splash':   {screen:splash}, 
	'scan':     {screen:scan},
	'unsigned': {screen:unsigned},
	'signed':   {screen:signed},  
}, {
	//initialRouteName: 'splash',
	initialRouteName: 'unsigned',  
}));

// dummy
import data from './data.js'; 
store.dispatch(dapps(data.dapps));

import {listenTransaction} from './utils';
global.listenTx = new listenTransaction(store);

export default class App extends Component {
	render() {
		return (
			<Provider store={store}>
				<Routes />
			</Provider>
		);
	}
}
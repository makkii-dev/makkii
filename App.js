// libs
import React, { Component } from 'react';
import { createSwitchNavigator, createAppContainer } from 'react-navigation';
import { StyleSheet, Text, View } from 'react-native';
import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';

// actions
import { ui }              from './actions/ui.js';
import { accounts }        from './actions/accounts.js';
import { accounts_ledger } from './actions/accounts_ledger.js';
import { account }         from './actions/account.js';
import { dapps }           from './actions/dapps.js';
import { setting }         from './actions/setting.js';
import { user, user_signout } from './actions/user.js';
 
// reducers
import reducer_ui              from './reducers/ui';
import reducer_accounts        from './reducers/accounts.js';
import reducer_accounts_ledger from './reducers/accounts_ledger.js';
import reducer_account         from './reducers/account.js'; 
import reducer_dapps           from './reducers/dapps.js';
import reducer_setting         from './reducers/setting.js';
import reducer_user            from './reducers/user.js'; 

// screens
import Identified from './components/identified/index.js';
import Unidentified from './components/unidentified/index.js';

// init
const store = createStore(combineReducers({
	ui:              reducer_ui,
	accounts:        reducer_accounts,
	accounts_ledger: reducer_accounts_ledger,
	account:         reducer_account,
	dapps:           reducer_dapps,
	setting:         reducer_setting,
	user:            reducer_user,
}));

// dummy data
import data from './data.js';
store.dispatch(accounts(data.accounts));
store.dispatch(accounts_ledger(data.accounts_ledger));
store.dispatch(dapps(data.dapps));

const Container = createAppContainer(createSwitchNavigator({
	Identified:  { screen: Identified },
	Unidentified: { screen: Unidentified }
}, {
	initialRouteName: store.getState().user.hashed_password !== '' ? "Identified" : "Unidentified",
	resetOnBlur: true,
	backBehavior: 'none',
}));

type Props = {};
export default class App extends Component<Props> {
	render() {
		return (
			<Provider store={store}>
				<Container />
			</Provider>
		);
	}
}
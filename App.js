// libs
import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator, createAppContainer } from 'react-navigation';
import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';

// actions
import { accounts } from './actions/accounts';
import { dapps } from './actions/dapps';
import { setting } from './actions/setting';
import { user } from './actions/user';

// reducers
import reducer_accounts from './reducers/accounts'; 
import reducer_dapps from './reducers/dapps';
import reducer_setting from './reducers/setting';
import reducer_user from './reducers/user'; 

// views
import Vault from './components/vault';
import Dapps from './components/dapps';
import Odex from './components/odex';
import Setting from './components/setting';

// init
const store = createStore(combineReducers({
	accounts: reducer_accounts,
	dapps: reducer_dapps,
	setting: reducer_setting,
	user: reducer_user,
}));

// temp load some demo data
import Account from './types/account.js';
let _accounts = [];
for(let i = 0; i < 10; i++){
	_accounts.push(new Account(i + '0000000000000000000000000000000', '0000000000000000000000000000000000000000000000000000000000000000'));
}
store.dispatch(accounts(_accounts));
import Dapp from './types/dapp.js';
let _dapps = [];
for(let i = 0; i < 10; i++){
	_dapps.push(new Dapp('dapp_' + i, 'http://dapps.chaion.net/abcdef/logo_' + i + '.png'));
}
store.dispatch(dapps(_dapps));
// end temp

const Routes = createBottomTabNavigator({
  vault: {screen: Vault},
  dapps: {screen: Dapps}, 
  odex: {screen: Odex},
  setting: {screen: Setting},
});

const Container = createAppContainer(Routes);

export default class App extends Component {
	render() {
		return (
			<Provider store={store}>
				<Container />
			</Provider>
		);
	}
}
// libs
import React, { Component } from 'react';
import { createSwitchNavigator, createAppContainer } from 'react-navigation';
import { StyleSheet, Text, View } from 'react-native';
import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';

// actions
import { accounts } from './actions/accounts';
import { dapps }    from './actions/dapps';
import { setting }  from './actions/setting';
import { user }     from './actions/user';

// reducers
import reducer_accounts from './reducers/accounts'; 
import reducer_dapps    from './reducers/dapps';
import reducer_setting  from './reducers/setting';
import reducer_user     from './reducers/user'; 

// screens
import Test from './components/test.js';
import Identified from './components/identified/index.js';
import Unidentified from './components/unidentified/index.js';

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
	let length = 30;
	let hex = Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
	_accounts.push(new Account(
		'a0' + hex, 
		'0000000000000000000000000000000000000000000000000000000000000000',
		'account ' + i
	));
}
store.dispatch(accounts(_accounts));
import Dapp from './types/dapp.js';
let _dapps = [];
for(let i = 0; i < 10; i++){
	_dapps.push(new Dapp('dapp_' + i, 'http://dapps.chaion.net/abcdef/logo_' + i + '.png'));
}
store.dispatch(dapps(_dapps));
// end temp

const Container = createAppContainer(createSwitchNavigator({
	Test: { screen: Test },
	Identified:  { screen: Identified },
	Unidentified: { screen: Unidentified }
}, {
	//initialRouteName: "Test", 
	initialRouteName: store.getState().user.hashed_password !== '' ? "Identified" : "Unidentified",
	resetOnBlur: true,
	backBehavior: 'none',
}));

export default class App extends Component {
	render() {
		return (
			<Provider store={store}>
				<Container />
			</Provider>
		);
	}
}
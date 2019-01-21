// libs
import React, { Component } from 'react';
import { createSwitchNavigator, createAppContainer } from 'react-navigation';
import { StyleSheet, Text, View } from 'react-native';
import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';

// actions
import { ui } from './actions/ui';
import { accounts } from './actions/accounts';
import { account }  from './actions/account';
import { dapps }    from './actions/dapps';
import { setting }  from './actions/setting';
import { user }     from './actions/user';

// reducers
import reducer_ui from './reducers/ui';
import reducer_accounts from './reducers/accounts';
import reducer_account  from './reducers/account'; 
import reducer_dapps    from './reducers/dapps';
import reducer_setting  from './reducers/setting';
import reducer_user     from './reducers/user'; 

// screens
import Test from './components/test.js';
import Identified from './components/identified/index.js';
import Unidentified from './components/unidentified/index.js';

// init
const store = createStore(combineReducers({
	ui: reducer_ui,
	accounts: reducer_accounts,
	account:  reducer_account,
	dapps:    reducer_dapps,
	setting:  reducer_setting,
	user:     reducer_user,
}));

// dummy data
import data from './data.js';
store.dispatch(accounts(data.accounts));
store.dispatch(dapps(data.dapps));

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
// libs
import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { createStackNavigator, createAppContainer } from 'react-navigation';
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
import Identified from './components/identified/index.js';
import Unidentified from './components/unidentified/index.js';

// init
const store = createStore(combineReducers({
	accounts: reducer_accounts,
	dapps: reducer_dapps,
	setting: reducer_setting,
	user: reducer_user,
}));

const Container = createAppContainer(createStackNavigator({
	IDENTIFIED:  Identified,
	UNIDENTIFIED: Unidentified
}, {
	initialRouteName: store.getState().user.signed ? "IDENTIFIED" : "UNIDENTIFIED",
	headerMode: 'none',
	mode: 'card'
}));

export default class App extends Component {
	render() {
		return (
			<Provider store={store}>
				<View style={{
					paddingTop:20,
					height: '100%'
				}}>
					<Container />
				</View>
			</Provider>
		);
	}
}
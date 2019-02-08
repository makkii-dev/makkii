// libs
import React, {Component} from 'react';
import {createSwitchNavigator, createAppContainer} from 'react-navigation';
import {AsyncStorage} from 'react-native';
import {createStore, combineReducers} from 'redux';
import {Provider} from 'react-redux';

// actions
import {accounts}           from './actions/accounts.js';
import {accounts_ledger}    from './actions/accounts_ledger.js';
import {account}            from './actions/account.js';
import {dapps}              from './actions/dapps.js';
import {setting}            from './actions/setting.js';
import {user, user_signout} from './actions/user.js';
 
// reducers
import reducer_accounts        from './reducers/accounts.js';
import reducer_accounts_ledger from './reducers/accounts_ledger.js';
import reducer_account         from './reducers/account.js'; 
import reducer_dapps           from './reducers/dapps.js';
import reducer_setting         from './reducers/setting.js';
import reducer_user            from './reducers/user.js'; 

// stores
const store = createStore(combineReducers({
	accounts:        reducer_accounts,
	accounts_ledger: reducer_accounts_ledger,
	account:         reducer_account,
	dapps:           reducer_dapps,
	setting:         reducer_setting,
	user:            reducer_user,
}));

// load db
let db_user = AsyncStorage.getItem('user');
db_user.then(user=>{
	console.log('[init]');
	console.log('[store-user] ' + user);  
}, err=>{  
	console.log('there'); 
});   
 
// dummy data
import data from './data.js';
//store.dispatch(accounts(data.accounts));
//store.dispatch(accounts_ledger(data.accounts_ledger));
store.dispatch(dapps(data.dapps));  

// ui 
import Identified from './components/identified/index.js';
import unsigned from './components/unsigned/index.js';
const Container = createAppContainer(createSwitchNavigator({
	Identified:  { screen: Identified },
	"unsigned": { screen: unsigned }
}, {
	initialRouteName: store.getState().user.hashed_password !== '' ? "Identified" : "unsigned", 
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
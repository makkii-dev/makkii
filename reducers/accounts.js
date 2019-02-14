import {AsyncStorage} from 'react-native';

import { 
	ADD_ACCOUNTS, 
	UPDATE_ACCOUNT_NAME, 
	DEL_ACCOUNT, 
	UPDATE_ACCOUNT_TRANSACTIONS
} from '../actions/accounts.js';

const init = {};

export default function accounts(state = init, action){
	let new_state;
	switch(action.type){
		case ADD_ACCOUNTS:
			new_state = Object.assign({}, state, action.accounts);
			AsyncStorage.setItem(
				'accounts',
				JSON.stringify(new_state)
			);
			break;
		case UPDATE_ACCOUNT_NAME:
			if (typeof state[action.key] !== 'undefined') {
				state[action.key].name = action.newName;
			}
			new_state = Object.assign({}, state);
			AsyncStorage.setItem(
				'accounts',
				JSON.stringify(new_state)
			);
			break;
		case UPDATE_ACCOUNT_TRANSACTIONS:
			if (typeof state[action.key] !== 'undefined') {
				state[action.key].transactions = Object.assign({}, state[action.key].transactions, action.transactions);
			}
			new_state = Object.assign({}, state);
			AsyncStorage.setItem(
				'accounts',
				JSON.stringify(new_state)
			);
			break;
		case DEL_ACCOUNT:
			delete state[action.key]; 
			new_state = Object.assign({}, state);
			AsyncStorage.setItem(
				'accounts',
				JSON.stringify(new_state)
			);
			break;
		default:
			new_state = state;
			break;
	}
	return new_state;
};
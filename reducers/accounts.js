import {AsyncStorage} from 'react-native';
import {encrypt} from '../utils.js';

import { 
	ACCOUNTS,
	ACCOUNTS_ADD, 
	UPDATE_ACCOUNT_NAME, 
	DEL_ACCOUNT, 
	UPDATE_ACCOUNT_TRANSACTIONS
} from '../actions/accounts.js';

const init = {};
export default function accounts(state = init, action){
	let new_state;
	let should_update_db = false; 
	switch(action.type){
		case ACCOUNTS:
			new_state = Object.assign({}, action.accounts);
			break;
		case ACCOUNTS_ADD:
			new_state = Object.assign({}, action.accounts, state);
			should_update_db = true;
			break;
		case UPDATE_ACCOUNT_NAME:
			if (typeof state[action.key] !== 'undefined') {
				state[action.key].name = action.newName;
			}
			new_state = Object.assign({}, state);
			should_update_db = true;
			break;
		case UPDATE_ACCOUNT_TRANSACTIONS:
			if (typeof state[action.key] !== 'undefined') {
				state[action.key].transactions = Object.assign({},action.transactions, state[action.key].transactions);
			}
			new_state = Object.assign({}, state);
			should_update_db = true;
			break;
		case DEL_ACCOUNT:
			delete state[action.key];  
			new_state = Object.assign({}, state);
			should_update_db = true;
			break;
		default:
			new_state = state;
			break;
	}
	if(should_update_db){
		console.log('[]')
		AsyncStorage.setItem( 
			'accounts',
			encrypt(JSON.stringify(new_state), action.hashed_password) 
		); 
	}
	return new_state;
};
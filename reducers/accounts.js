import {AsyncStorage} from 'react-native';
import {encrypt} from '../utils';

import {
	ACCOUNTS,
	ACCOUNTS_ADD,
	ACCOUNTS_SAVE,
	ACCOUNT_DEFAULT,
	UPDATE_ACCOUNT_NAME,
	DEL_ACCOUNT,
	DEL_ACCOUNTS,
	UPDATE_ACCOUNT_TRANSACTIONS,
	UPDATE_ACCOUNT_TOKENS,
} from '../actions/accounts.js';

function ifSetDefault(state){
	let res = Object.values(state).length === 0;
	Object.values(state).map(v=>{
		res = res||v.isDefault;
	});
	return res;
}
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
		case ACCOUNTS_SAVE:
			new_state = state;
			should_update_db = true;
			break;
		case ACCOUNT_DEFAULT:
			Object.values(state).map(v=>v.isDefault=false);
			state[action.key].isDefault=true;
			new_state = Object.assign({},state);
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
				// only keep 10 latest txs
				let transactions = Object.assign({},action.transactions, state[action.key].transactions[action.network]);
				let new_transactions = {};
				Object.values(transactions).sort((a,b)=>b.timestamp - a.timestamp).slice(0,5).forEach(s=>new_transactions[s.hash]=s);
				state[action.key].transactions[action.network] = new_transactions;
			}
			new_state = Object.assign({}, state);
			should_update_db = true;
			break;
		case UPDATE_ACCOUNT_TOKENS:
			if (typeof state[action.key] !== 'undefined') {
				state[action.key].tokens[action.network] = action.tokens;
			}
			new_state = Object.assign({}, state);
			should_update_db = true;
			break;
		case DEL_ACCOUNT:
			delete state[action.key];
			new_state = Object.assign({}, state);
			should_update_db = true;
			break;
		case DEL_ACCOUNTS:
			new_state = Object.assign({},init);
			should_update_db = true;
			break;
		default:
			new_state = state;
			break;
	}
	// if no isDefault prop , set it false;
	Object.values(new_state).map(v=>{
		if(!v.isDefault){
			v.isDefault = false;
		}
	});

	// if not set default, set the first one true
	if(!ifSetDefault(new_state)){
		let key = Object.keys(new_state)[0];
		if(key){
			new_state[key].isDefault=true;
		}
		new_state = Object.assign({},new_state);
	}

	if(should_update_db){
		AsyncStorage.setItem(
			'accounts',
			encrypt(JSON.stringify(new_state), action.hashed_password)
		);
	}
	return new_state;
};

import {AsyncStorage} from 'react-native';
import {encrypt} from '../utils';

import {
	ACCOUNTS,
	ACCOUNTS_ADD,
	ACCOUNTS_SAVE,
	UPDATE_ACCOUNT_NAME,
	UPDATE_ACCOUNT_BALANCE,
	DEL_ACCOUNT,
	DEL_ACCOUNTS,
	DEL_ACCOUNT_TOKEN,
	UPDATE_ACCOUNT_TRANSACTIONS,
	UPDATE_ACCOUNT_TOKENS,
    UPDATE_ACCOUNT_TOKEN_TRANSACTIONS,
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
		case ACCOUNTS_SAVE:
			new_state = state;
			should_update_db = true;
			break;
		case UPDATE_ACCOUNT_NAME:
			if (typeof state[action.key] !== 'undefined') {
				state[action.key].name = action.newName;
			}
			new_state = Object.assign({}, state);
			should_update_db = true;
			break;
		case UPDATE_ACCOUNT_BALANCE:
			if (typeof state[action.key] !== 'undefined') {
				state[action.key].balance = action.newBalance;
			}
			new_state = Object.assign({}, state);
			should_update_db = true;
			break;
		case UPDATE_ACCOUNT_TRANSACTIONS:
			if (typeof state[action.key] !== 'undefined') {
				// only keep 5 latest txs
				// Object.keys(action.transactions).forEach(k=>{
				// 	listenTx.removeTransaction(k);
				// });
				const pendingTransactions = action.force?{}:Object.keys(state[action.key].transactions).reduce((map,el)=>{
					if(state[action.key].transactions[el].status==='PENDING'){
						map[el]=state[action.key].transactions[el];
					}
					return map;
				},{});
				// console.log('get pendingTransactions==========================>', pendingTransactions);
				let transactions = Object.assign({}, state[action.key].transactions,action.transactions,pendingTransactions);
				let new_transactions = {};
				let compareFn = (a, b) => {
					if (b.timestamp === undefined && a.timestamp !== undefined) return 1;
					if (b.timestamp === undefined && a.timestamp === undefined) return 0;
					if (b.timestamp !== undefined && a.timestamp === undefined) return -1;
					return b.timestamp - a.timestamp;
				};
				Object.values(transactions).sort(compareFn).slice(0,5).forEach(s=>new_transactions[s.hash]=s);
				state[action.key].transactions = new_transactions;
			}
			new_state = Object.assign({}, state);
			should_update_db = true;
			break;
		case UPDATE_ACCOUNT_TOKEN_TRANSACTIONS:
		    if (state[action.key] !== undefined&&state[action.key].tokens!==undefined&&state[action.key].tokens[action.symbol]!==undefined) {
				const pendingTransactions = action.force?{}:Object.keys(state[action.key].tokens[action.symbol].tokenTxs).reduce((map,el)=>{
					if(state[action.key].transactions[el].status==='PENDING'){
						map[el]=state[action.key].tokens[action.symbol].tokenTxs[el];
					}
					return map;
				},{});
		    	let transactions = Object.assign({}, state[action.key].tokens[action.symbol].tokenTxs||{}, action.transactions,pendingTransactions);
				let new_transactions = {};
				let compareFn = (a, b) => {
					if (b.timestamp === undefined && a.timestamp !== undefined) return 1;
					if (b.timestamp === undefined && a.timestamp === undefined) return 0;
					if (b.timestamp !== undefined && a.timestamp === undefined) return -1;
					return b.timestamp - a.timestamp;
				};
				Object.values(transactions).sort(compareFn).slice(0,5).forEach(s=>new_transactions[s.hash]=s);
				state[action.key].tokens[action.symbol].tokenTxs = new_transactions;
			}
		    new_state = Object.assign({}, state);
		    should_update_db = true;
		    break;
		case UPDATE_ACCOUNT_TOKENS:
			if (typeof state[action.key] !== 'undefined') {
				let tokenExist = state[action.key].tokens !== undefined && state[action.key].tokens !== undefined;
				state[action.key].tokens = Object.assign({}, tokenExist ? state[action.key].tokens : {}, action.tokens);
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
		case DEL_ACCOUNT_TOKEN:
			let tokens = state[action.key].tokens;
			delete tokens[action.symbol];
			new_state = Object.assign({},state);
			should_update_db = true;
			break;
		default:
			new_state = state;
			break;
	}
	// if no isDefault prop , set it false;
	// Object.values(new_state).map(v=>{
	// 	if(!v.isDefault){
	// 		v.isDefault = false;
	// 	}
	// });

	if(should_update_db){
		AsyncStorage.setItem(
			'accounts',
			encrypt(JSON.stringify(new_state), action.hashed_password)
		);
	}
	return new_state;
};

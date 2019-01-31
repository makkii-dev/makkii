import { ACCOUNTS, ADD_ACCOUNTS, UPDATE_ACCOUNT_NAME } from '../actions/accounts.js';

export default function accounts(state = {}, action){
	switch(action.type){
		case ACCOUNTS:
			return Object.assign({}, action.accounts);
		case ADD_ACCOUNTS:
			return Object.assign({}, action.accounts, state);
		case UPDATE_ACCOUNT_NAME:
			if (typeof state[action.key] !== 'undefined') {
				console.log('update new name');
				state[action.key].name = action.newName;
			}
			return Object.assign({}, state);
		default:
			return state;
	}
};
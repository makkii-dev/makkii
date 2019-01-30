import { ACCOUNTS, ADD_ACCOUNTS } from '../actions/accounts.js';

export default function accounts(state = {}, action){
	switch(action.type){
		case ACCOUNTS:
			return Object.assign({}, action.accounts);
		case ADD_ACCOUNTS:
			return Object.assign({}, action.accounts, state);
		default: 
			return state;
	}
};
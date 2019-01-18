import { ACCOUNT } from '../actions/account.js';
import Account from '../types/account.js';

export default function accounts(state = new Account(), action){
	switch(action.type){
		case ACCOUNT:
			return Object.assign({}, action.account);
		default: 
			return state;
	}
};
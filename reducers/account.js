import { ACCOUNT } from '../actions/account.js';

export default function accounts(state = {}, action){
	switch(action.type){
		case ACCOUNT:
			return Object.assign({}, action.account);
		default: 
			return state;
	}
};
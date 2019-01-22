import { ACCOUNTS_LEDGER } from '../actions/accounts_ledger.js';

export default function accounts_ledger(state = {}, action){
	switch(action.type){
		case ACCOUNTS_LEDGER:
			return Object.assign({}, action.accounts_ledger);
		default: 
			return state;
	}
};
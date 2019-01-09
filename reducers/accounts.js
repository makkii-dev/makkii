import { ACCOUNTS } from '../actions/accounts.js';

export default function accounts(state = [], action){
	switch(action.type){
		case ACCOUNTS:
			return Object.assign([], action.items);
		default: 
			return state;
	}
};
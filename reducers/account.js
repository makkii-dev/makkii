import { ACCOUNT } from '../actions/account.js';

const init = {
    address: '',
    private_key: '',
    balance: '',
    name: '',
    type: '',
    transactions: {}
}

export default function accounts(state = init, action){
	switch(action.type){
		case ACCOUNT:
			return Object.assign({}, action.account);
		default: 
			return state;
	}
}; 
import { USER, USER_SIGNOUT } from '../actions/user.js';

const init = {
	timestamp: 0,
	hashed_password: '123',
	mnemonic: 'belt dismiss dirt wash solution swallow exercise acquire motion shine round boost',
	default_account_name: 'account',
};
 
export default function user(state = init, action){
	switch(action.type){
		case USER:
			return Object.assign({}, action.user);
		case USER_SIGNOUT:
			return Object.assign({}, state, {
	        	timestamp: 0,
	        	hashed_password: 'hello',
	      	});
		default: 
			return state;
	}
};
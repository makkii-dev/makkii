import { 
	USER, 
	USER_REGISTER, 
	USER_SIGNOUT 
} from '../actions/user.js';

const init = {
	timestamp: 0,
	hashed_password: '',
	mnemonic: 'belt dismiss dirt wash solution swallow exercise acquire motion shine round boost',
	default_account_name: 'account',
};
 
export default function user(state = init, action){
	switch(action.type){
		case USER:
			return Object.assign({}, action.user);
		case USER_REGISTER:
			return Object.assign({}, state, {
	        	timestamp: Date().now,
	        	hashed_password: action.hashed_password,
	      	});
		case USER_SIGNOUT:
			return Object.assign({}, state, {
	        	timestamp: 0,
	        	hashed_password: '',
	      	});
		default: 
			return state;
	}
};

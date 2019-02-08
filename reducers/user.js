import { 
	USER_REGISTER, 
	USER_SIGNOUT 
} from '../actions/user.js'; 

const init = {
	timestamp: 0,     
	hashed_password: '',    
	mnemonic: '',
};

export default function user(state = init, action){
	let new_state;
	switch(action.type){
		case USER_REGISTER:
			new_state = Object.assign({}, state, {
	        	timestamp: Date.now(), 
	        	hashed_password: action.hashed_password,
	        	mnemonic: action.mnemonic 
	      	});
	      	break;
		case USER_SIGNOUT:
			new_state = Object.assign({}, state, {
	        	timestamp: 0,
	        	hashed_password: '',
	      	});
	      	break;
		default: 
			new_state = state;
			break;
	}
	return new_state;
};

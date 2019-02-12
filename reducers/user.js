import { 
	USER,  
	USER_REGISTER, 
	USER_SIGNOUT 
} from '../actions/user.js'; 

const init = {
	timestamp: 0,  
	hashed_password: '',    
	mnemonic: 'month million tell whisper damp calm twelve stove sibling tissue brain again',
};

export default function user(state = init, action){
	switch(action.type){
		case USER: 
			return Object.assign({}, action.user);
		case USER_REGISTER:
			return Object.assign({}, state, {
	        	timestamp: Date.now(),
	        	hashed_password: action.hashed_password,
	        	mnemonic: action.mnemonic 
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

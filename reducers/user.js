import {AsyncStorage} from 'react-native';

import { 
	USER_REGISTER, 
	USER_LOGIN,
	USER_SIGNOUT 
} from '../actions/user.js'; 

const init = {
	timestamp: 0,
	hashed_password: '',     
	mnemonic: 'month million tell whisper damp calm twelve stove sibling tissue brain again',
};
 
export default function user(state = init, action){
	let new_state;
	console.log('[action-type] ' + action.type); 
	switch(action.type){
		case USER_REGISTER:
			new_state = Object.assign({}, state, {
	        	timestamp: Date.now('milli'), 
	        	hashed_password: action.hashed_password,
	        	mnemonic: action.mnemonic 
	      	});
	      	AsyncStorage.setItem(
				'user',
				JSON.stringify(new_state)
			);
	      	break;
	    case USER_LOGIN:
			new_state = Object.assign({}, state, {
	        	timestamp: Date.now('milli'), 
	        	hashed_password: action.hashed_password,
	        	mnemonic: action.mnemonic 
	      	});
	      	AsyncStorage.setItem(
				'user',
				JSON.stringify(new_state)
			);
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

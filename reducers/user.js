import {AsyncStorage} from 'react-native';
import { 
	USER_REGISTER, 
	USER_SIGNOUT 
} from '../actions/user.js'; 

const init = {
	timestamp: 0,     
	hashed_password: '',    
	mnemonic: '',
};

function save(user){
	try { 
		AsyncStorage.setItem('user', JSON.stringify(user));	
	} catch (error) {   
		console.log(error);  
	}
} 

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
	save(new_state);
	return new_state;
};

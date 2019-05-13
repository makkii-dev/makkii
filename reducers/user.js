import {AsyncStorage} from 'react-native';
import keyStore from "react-native-makkii-core";

import {
	USER,
	USER_UPDATE_PASSWORD,
	USER_UPDATE_PINCODE,
} from '../actions/user.js';

const init = {
	hashed_password: '',
	hashed_pinCode: '',
	mnemonic: '',          // encrypted
};

export default function user(state = init, action){
	let new_state;
	let should_update_db = false;
	switch(action.type){
		case USER:
			new_state = Object.assign({}, {
	        	hashed_password: action.hashed_password,
				hashed_pinCode: action.hashed_pinCode,
	        	mnemonic: action.mnemonic
	      	});
			keyStore.creatByMnemonic(action.mnemonic,'');
	      	should_update_db = true;
	      	break;
	    case USER_UPDATE_PASSWORD:
	    	new_state = Object.assign({}, state, {
	    		hashed_password: action.hashed_password
	    	});
	    	should_update_db = true;
	    	break;
		case USER_UPDATE_PINCODE:
			new_state = Object.assign({}, state, {
				hashed_pinCode: action.hashed_pinCode
			});
			should_update_db = true;
			break;
		default:
			new_state = state;
			break;
	}
	if(should_update_db){
		AsyncStorage.setItem(
			'user',
			JSON.stringify(new_state)
		);
	}
	return new_state;
};

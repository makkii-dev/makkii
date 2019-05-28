import {AsyncStorage} from 'react-native';
import keyStore from "react-native-makkii-core";

import {
	USER,
	USER_UPDATE_PASSWORD,
	USER_UPDATE_PINCODE,
	ADD_ADDRESS,
	UPDATE_ADDRESS,
	DELETE_ADDRESS,
	UPDATE_INDEX,
} from '../actions/user.js';

const init = {
	hashed_password: '',
	hashed_pinCode: '',
	mnemonic: '',          // encrypted
    address_book: {},
	hd_index: {},
};

export default function user(state = init, action){
	let new_state;
	let should_update_db = false;
	switch(action.type){
		case USER:
			new_state = Object.assign({}, {
	        	hashed_password: action.hashed_password,
				hashed_pinCode: action.hashed_pinCode,
	        	mnemonic: action.mnemonic,
				address_book: action.address_book,
				hd_index: action.hd_index,
	      	});
			keyStore.createByMnemonic(action.mnemonic,'');
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
		case ADD_ADDRESS:
		    if (state.address_book[action.address.key] !== undefined) {
		    	state.address_book[action.address.key].name = action.address.name;
		    	state.address_book[action.address.key].address = action.address.address;
		    	state.address_book[action.address.key].symbol = action.address.symbol;
			} else {
		    	state.address_book[action.address.key] = {
		    		name: action.address.name,
					address: action.address.address,
					symbol: action.address.symbol,
				};
			}
		    new_state = Object.assign({}, state);
			should_update_db = true;
			break;
		case UPDATE_ADDRESS:
			if (state.address_book[action.address.oldKey] !== undefined) {
				delete state.address_book[action.address.oldKey];
			}
			state.address_book[action.address.key] = {
				name: action.address.name,
				address: action.address.address,
				symbol: action.address.symbol
			};
			new_state = Object.assign({}, state);
			should_update_db = true;
			break;
		case DELETE_ADDRESS:
		    delete state.address_book[action.addressKey];
		    new_state = Object.assign({}, state);
			should_update_db = true;
			break;
		case UPDATE_INDEX:
		    state.hd_index[action.symbol] = action.index;
			new_state = Object.assign({}, state);
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

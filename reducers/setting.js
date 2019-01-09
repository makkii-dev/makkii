import { SETTING } from '../actions/setting.js';

export default function setting(state = [], action){
	switch(action.type){
		case SETTING:
			return Object.assign({}, action.items);
		default: 
			return state;
	}
};
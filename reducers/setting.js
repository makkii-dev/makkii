import { SETTING } from '../actions/setting.js';
import Setting from '../types/setting.js';

export default function setting(state = new Setting(), action){
	switch(action.type){
		case SETTING:
			return Object.assign({}, action.setting);
		default: 
			return state;
	}
};
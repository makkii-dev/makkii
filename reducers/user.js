import { USER } from '../actions/user.js';
import User from '../types/user.js';

export default function user(state = new User(false), action){
	switch(action.type){
		case USER:
			return Object.assign({}, action.user);
		default: 
			return state;
	}
};
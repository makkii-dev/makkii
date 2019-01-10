import { USER } from '../actions/user.js';

export default function user(state = {}, action){
	switch(action.type){
		case USER:
			return Object.assign({}, action.user);
		default: 
			return state;
	}
};
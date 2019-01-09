import { USER } from '../actions/user.js';

export default function user(state = {}, action){
	switch(action.type){
		case USER:
			return Object.assign({}, action.items);
		default: 
			return state;
	}
};
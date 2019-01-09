import { DAPPS } from '../actions/dapps.js';

export default function dapps(state = [], action){
	switch(action.type){
		case DAPPS:
			return Object.assign([], action.items);
		default: 
			return state;
	}
};
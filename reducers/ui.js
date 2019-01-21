import { UI } from '../actions/ui.js';

let ui = {
	show: true,
}

export default function accounts(state = ui, action){
	switch(action.type){
		case UI:
			return Object.assign({}, action.ui);
		default: 
			return state;
	}
};
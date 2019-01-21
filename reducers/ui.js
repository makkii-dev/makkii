import { UI } from '../actions/ui.js';

let ui = {
	vault_home_sub_navi: false,
}

export default function accounts(state = ui, action){
	switch(action.type){
		case UI:
			return Object.assign({}, action.ui);
		default: 
			return state;
	}
};
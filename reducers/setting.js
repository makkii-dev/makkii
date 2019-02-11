import { SETTING } from '../actions/setting.js';

const init = { 
	lang: 'cn',
	version: '0.1.0-rc0',
	theme: 'white',

	tx_fee: 10000,
    tx_confirm: 6, // 6 blocks
    remote_kernel: 'http://127.0.0.1:8545',
    remote_dapps: 'http://dapps.chaion.net',
    remote_odex: 'http://odex.chaion.net'	
}

export default function setting(state = init, action){
	switch(action.type){
		case SETTING:
			return Object.assign({}, action.setting);
		default: 
			return state;
	}
};
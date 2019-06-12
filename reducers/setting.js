import { SETTING, SETTING_UPDATE_PINCODE_ENABLED } from '../actions/setting.js';
import Web3 from "aion-web3";
import {AsyncStorage} from 'react-native';
import {setLocale} from '../locales/i18n';
import DeviceInfo from 'react-native-device-info';

const init = {
	lang: 'auto',
	version: '0.1.1',
	theme: 'white',
	login_session_timeout: '30',
	exchange_refresh_interval: "30",
	fiat_currency: "CNY",
	coinPrice: undefined,
    coinPrices: {},
	pinCodeEnabled: false,
	touchIDEnabled: false,
	tx_fee: 10000,
    tx_confirm: 6,
    endpoint_wallet: 'https://api.nodesmith.io/v1/aion/mainnet/jsonrpc?apiKey=c8b8ebb4f10f40358b635afae72c2780',
    endpoint_dapps:  'http://dapps.chaion.net',
    endpoint_odex:   'http://odex.chaion.net',
	explorer_server: 'mainnet',
	state_version: 0,
}

export default function setting(state = init, action){
	let new_state;
	let should_update_db = false;
	switch(action.type){
		case SETTING:
			web3.setProvider(new Web3.providers.HttpProvider(action.setting.endpoint_wallet))
			if (action.setting.lang === 'auto') {
				setLocale(DeviceInfo.getDeviceLocale());
			} else {
				setLocale(action.setting.lang);
			}
			new_state =  Object.assign({}, action.setting);
			should_update_db = true;
			break;
		case SETTING_UPDATE_PINCODE_ENABLED:
			new_state = Object.assign({}, state, {pinCodeEnabled: action.pinCodeEnabled, touchIDEnabled: action.touchIDEnabled});
			should_update_db = true;
			break;
		default:
			new_state = state;
	}
	if(should_update_db){
		AsyncStorage.setItem(
			'settings',
			JSON.stringify(new_state)
		);
	}
	return new_state;
};

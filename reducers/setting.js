import { SETTING } from '../actions/setting.js';
import Web3 from "aion-web3";
import {AsyncStorage} from 'react-native';
import {setLocale} from '../locales/i18n';
import DeviceInfo from 'react-native-device-info';

const init = { 
	lang: 'en',
	version: '0.1.0-rc0',
	theme: 'white',
	default_account_name: 'Default Account',
	login_session_timeout: '30',
	exchange_refresh_interval: "24",
	fiat_currency: "CNY",

	tx_fee: 10000,
    tx_confirm: 6,  
    endpoint_wallet: 'http://127.0.0.1:8545',
    endpoint_dapps:  'http://dapps.chaion.net',
    endpoint_odex:   'http://odex.chaion.net',
	explorer_server: 'https://mainnet-api.aion.network',
}

export default function setting(state = init, action){
	switch(action.type){
		case SETTING:
			web3.setProvider(new Web3.providers.HttpProvider(action.setting.endpoint_wallet))
			AsyncStorage.setItem('settings', JSON.stringify(action.setting));
			if (action.setting.lang == 'auto') {
				setLocale(DeviceInfo.getDeviceLocale());
			} else {
				setLocale(action.setting.lang);
			}
			return Object.assign({}, action.setting);
		default: 
			return state;
	}
};
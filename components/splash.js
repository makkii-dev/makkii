import React, {Component} from 'react';
import {connect} from 'react-redux';
import {ImageBackground, Dimensions, Text} from 'react-native';
import {user} from '../actions/user.js';
import {setting} from "../actions/setting.js";
import {accounts,accounts_add} from '../actions/accounts.js';
import {dbGet,decrypt} from '../utils';
import {strings} from "../locales/i18n";
import {ComponentLogo} from "./common";

const {width,height} = Dimensions.get('window');

const upgradeAccountDb = (accs, state_version, options = {}) => {
	if(state_version===undefined||state_version<1){
		let new_accounts = {};
		Object.keys(accs).forEach(k=>{
			// check key is satisfy 'symbol+address'
			let new_key = k;
			new_key = new_key.indexOf('+')>=0? new_key: 'AION+'+new_key;
			let account = Object.assign({},accs[k]);
			// remove account network in transactions and tokens
			delete account['isDefault'];
			account.transactions = typeof  account.transactions === 'object'? account.transactions:{};
			account.tokens = typeof  account.tokens === 'object'? account.tokens:{};
			account.transactions= account.transactions[options.network]? account.transactions[options.network]:{};
			account.tokens= account.tokens[options.network]? account.tokens[options.network]:{};
			account.symbol = account.symbol? account.symbol: 'AION';

			new_accounts[new_key] = account;
		});
		return new_accounts;
	}
	return accs;
};

const upgradeSettingDb = (settings,state_version)=>{
	if(state_version<1){
		let new_settings = {};
		Object.keys(settings).forEach(k=>{
			new_settings[k] = settings[k]
		});
		new_settings.state_version = 1;
		new_settings.coinPrices ={};
		new_settings.explorer_server = 'mainnet';
		delete new_settings['theme'];
		delete new_settings['tx_fee'];
		delete new_settings['endpoint_wallet'];
		delete new_settings['endpoint_dapps'];
		delete new_settings['endpoint_odex'];
		delete new_settings['endpoint_odex'];
		return new_settings;
	}
	return settings;
};


class Splash extends Component {
	constructor(props){
		super(props);
	}


	componentWillMount(){
		console.log('[route] ' + this.props.navigation.state.routeName);
		const {navigate} = this.props.navigation;
		const {dispatch} = this.props;
		dbGet('settings').then(json => {
		    const setting_json =JSON.parse(json);
			const old_state_version = setting_json.state_version || 0;
			console.log('setting_json=>',setting_json);
			console.log('old_state_version=>',old_state_version);
			const new_setting = upgradeSettingDb(setting_json,old_state_version);
			dispatch(setting(new_setting));
			listenPrice.reset(new_setting.exchange_refresh_interval, setting_json.fiat_currency);
			listenPrice.startListen();
			// load db user
			dbGet('user')
				.then(json=>{
					// load db accounts
					const db_user = JSON.parse(json);
					dbGet('accounts')
						.then(json=>{
							let decrypted = decrypt(json, db_user.hashed_password);
							const old_accounts = JSON.parse(decrypted);
							const new_accounts = upgradeAccountDb(old_accounts, old_state_version, {network: setting_json.explorer_server})
							if(old_state_version<1){
								dispatch(accounts_add(new_accounts,db_user.hashed_password));
							}else{
								dispatch(accounts(new_accounts));
							}
						},err=>{
							console.log(err);
						});
					dispatch(user(db_user.hashed_password,
						db_user.mnemonic,
						db_user.hashed_pinCode!==undefined?db_user.hashed_pinCode:'',
						db_user.address_book!==undefined?db_user.address_book: {},
						db_user.hd_index!==undefined?db_user.hd_index:{}
					));
					setTimeout(()=>{
						// navigate('signed_vault');
						navigate('unsigned_login');
					}, 1000);

				}, err=>{
					console.log('[splash] db.user null');
					setTimeout(()=>{
						navigate('unsigned_login');
					}, 1000);
				});

		}, err=> {
			console.log("load setting failed: ", err);
			listenPrice.setCurrency(this.props.setting.fiat_currency);
			setTimeout(()=>{
				navigate('unsigned_login');
			}, 1000);
		});
	}

	render(){
		return (
			<ImageBackground
				style={{
					flex: 1,
                    alignItems: 'center',
					paddingTop: 150,
				}}
				source={require('../assets/splash_bg.png')}
			>
                <ComponentLogo/>
                <Text style={{
                    fontSize: 24,
                    color: 'white',
                    marginTop: 20,
                }}>{strings('app_name')}</Text>
			</ImageBackground>
		);
	}
}

export default connect(state => {
	return {
		user: state.user,
        setting: state.setting,
	};
})(Splash);

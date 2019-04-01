import React, {Component} from 'react';
import {connect} from 'react-redux';
import {ImageBackground, Dimensions, Text} from 'react-native';
import {user} from '../actions/user.js';
import {setting} from "../actions/setting.js";
import {accounts} from '../actions/accounts.js';
import {dbGet,decrypt} from '../utils.js';
import {strings} from "../locales/i18n";
import {ComponentLogo} from "./common";

const {width,height} = Dimensions.get('window');

class Splash extends Component {
	constructor(props){
		super(props);
	}


	componentWillMount(){
		console.log('[route] ' + this.props.navigation.state.routeName);
		const {navigate} = this.props.navigation;
		const {dispatch} = this.props;
		dbGet('settings').then(json => {
		    let setting_json =JSON.parse(json);
		    setting_json.coinPrice = undefined;
			this.props.dispatch(setting(setting_json));
			listenPrice.reset(setting_json.exchange_refresh_interval, setting_json.fiat_currency);
			listenPrice.startListen();
			listenApp.handleActive = ()=>navigate('unsigned_login');
			listenApp.timeOut = setting_json.login_session_timeout;
			listenApp.start();
			// load db user
			dbGet('user')
				.then(json=>{
					// load db accounts
					dbGet('accounts')
						.then(json=>{
							let decrypted = decrypt(json, db_user.hashed_password);
							dispatch(accounts(JSON.parse(decrypted)));
						},err=>{
							console.log(err);
						});
					const db_user = JSON.parse(json);
					dispatch(user(db_user.hashed_password, db_user.mnemonic));
					setTimeout(()=>{
						navigate('unsigned_login');
						//navigate('unsigned_recovery_scan');
					}, 1000);

				}, err=>{
					console.log('[splash] db.user null');
					setTimeout(()=>{
						navigate('unsigned_login');
						//navigate('unsigned_recovery_scan');
					}, 1000);
				});

		}, err=> {
			console.log("load setting failed: ", err);
			listenPrice.startListen();
			setTimeout(()=>{
				navigate('unsigned_login');
				//navigate('unsigned_recovery_scan');
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

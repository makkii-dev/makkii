import React, {Component} from 'react';
import {connect} from 'react-redux';
import {ImageBackground, Dimensions, Text} from 'react-native';
import {user} from '../actions/user.js';
import {setting} from "../actions/setting.js";
import {accounts} from '../actions/accounts.js';
import {dbGet,decrypt} from '../utils.js';
import {strings} from "../locales/i18n";
import GeneralStatusBar from "./GeneralStatusBar";
import {ComponentLogo} from "./common";
import {mainColor} from './style_util';

const {width,height} = Dimensions.get('window');

class Splash extends Component {
	constructor(props){
		super(props);
	}

	async componentDidMount(){
		console.log('[route] ' + this.props.navigation.state.routeName);
		const {navigate} = this.props.navigation;
		const {dispatch} = this.props;


		dbGet('settings').then(json => {
		    let setting_json =JSON.parse(json);
		    setting_json.coinPrice = undefined;
			this.props.dispatch(setting(setting_json));
			listenPrice.reset(setting_json.exchange_refresh_interval, setting_json.fiat_currency);
			listenPrice.startListen();
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


					let db_user = JSON.parse(json);
					let max_keep_signed = 60000 * parseInt(this.props.setting.login_session_timeout);
					let time_diff = Date.now() - db_user.timestamp;


					if(time_diff < max_keep_signed) {
						console.log('[splash] keep signin');

						dispatch(user(db_user.hashed_password, db_user.mnemonic));
						setTimeout(()=>{
							navigate('signed_vault');
						}, 1000);
					} else {
						console.log('[splash] timeout signin');
						setTimeout(()=>{
							navigate('unsigned_login');
							//navigate('unsigned_recovery_scan');
						}, 500);
					}
				}, err=>{
					console.log('[splash] db.user null');
					setTimeout(()=>{
						navigate('unsigned_login');
						//navigate('unsigned_recovery_scan');
					}, 500);
				});

		}, err=> {
			console.log("load setting failed: ", err);
			setTimeout(()=>{
				navigate('unsigned_login');
				//navigate('unsigned_recovery_scan');
			}, 500);
		});


	}
	render(){
		console.log("splash render------");
		return (
			<ImageBackground
				style={{
					flex: 1,
					// width: width,
					// height: height,
                    alignItems: 'center',
					paddingTop: 150,
				}}
				source={require('../assets/splash_bg.png')}
			>
				<GeneralStatusBar backgroundColor={mainColor}/>
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

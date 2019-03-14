import React, {Component} from 'react';
import {connect} from 'react-redux';
import {View, ImageBackground, Dimensions, Text, Image} from 'react-native';
import {user} from '../actions/user.js';
import {setting} from "../actions/setting.js";
import {accounts} from '../actions/accounts.js';
import {dbGet,decrypt} from '../utils.js';
import {strings} from "../locales/i18n";

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
			this.props.dispatch(setting(JSON.parse(json)));
		}, err=> {
			console.log("load setting failed: ", err);
		});
		listenPrice.startListen();

		// load db user
		dbGet('user')
		.then(json=>{
			let db_user = JSON.parse(json);
			let max_keep_signed = 60000 * parseInt(this.props.setting.login_session_timeout);
			let time_diff = Date.now() - db_user.timestamp;
			if(time_diff < max_keep_signed) {
				console.log('[splash] keep signin');

				// load db accounts
				dbGet('accounts')
				.then(json=>{
					let decrypted = decrypt(json, db_user.hashed_password);
					dispatch(accounts(JSON.parse(decrypted)));
				},err=>{
					console.log(err);
				});
				dispatch(user(db_user.hashed_password, db_user.mnemonic));
				setTimeout(()=>{
					navigate('signed_vault');
				}, 100000);
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
	}
	render(){
		return (
			<ImageBackground
				style={{
					flex: 1,
					width: width,
					height: height,
                    alignItems: 'center',
				}}
				source={require('../assets/splash_bg.png')}
			>
                <Image
                    style={{
                    	marginTop: 150,
                        width: 50,
                        height: 50,
						resizeMode: 'contain'
                    }}
                    source={require('../assets/app_logo.png')} />
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

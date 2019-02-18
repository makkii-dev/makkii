import React, {Component} from 'react';
import {connect} from 'react-redux';
import {View,Image} from 'react-native';
import {user} from '../actions/user.js';
import {setting} from "../actions/setting.js";
import {accounts} from '../actions/accounts.js';
import {dbGet,decrypt} from '../utils.js';

class Splash extends Component { 
	constructor(props){
		super(props); 
	} 
	async componentDidMount(){
		console.log('[route] ' + this.props.navigation.state.routeName);
		const {navigate} = this.props.navigation;
		const {dispatch} = this.props;
		 
		// load db user
		dbGet('user')
		.then(json=>{
			let db_user = JSON.parse(json);
			console.log('[db_user]', db_user);
			let max_keep_signed = 60000 * 30;
			let time_diff = Date.now() - db_user.timestamp; 
			if(time_diff < max_keep_signed) { 
				console.log('[splash] keep signin');

				// load db accounts
				dbGet('accounts')
				.then(json=>{
					console.log('[db_user.hashed_password] ', db_user.hashed_password);
					let decrypted = decrypt(json, db_user.hashed_password);
					console.log('[decrypted] ', decrypted);
					dispatch(accounts(JSON.parse(decrypted)));
				},err=>{
					console.log(err);
				});
				dispatch(user(db_user.hashed_password, db_user.mnemonic));

				dbGet('settings').then(json => {
					this.props.dispatch(setting(JSON.parse(json)));
				}, err=> {
					console.log("load setting failed: ", err);
				});
				setTimeout(()=>{   
					navigate('signed_vault');
				}, 1000);      
			} else {
				console.log('[splash] timeout signin');
				setTimeout(()=>{
					navigate('unsigned_login');      
				}, 500);
			}
		}, err=>{
			console.log('[splash] db.user null');
			setTimeout(()=>{
				navigate('unsigned_recovery');  
			}, 500); 
		});
	}
	render(){
		return (
			<View style={{
				flex: 1,
				justifyContent: 'center',
    			alignItems: 'center',
    			backgroundColor: 'white',
			}}>
				<Image
					style={{
						width: 120,
						height: 120,
					}}
					source={require('../assets/loading.gif')}
				/>
			</View>
		);
	}
}

export default connect(state => {
	return {   
		user: state.user,
	};
})(Splash);
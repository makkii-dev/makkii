import React, {Component} from 'react';
import {connect} from 'react-redux';
import {View,Text,Button,TouchableOpacity, Alert} from 'react-native';
import {ComponentLogo,ComponentPassword} from '../common.js';
import {hashPassword} from '../../utils.js';
import {user} from '../../actions/user.js';
import {setting} from '../../actions/setting';
import {accounts} from '../../actions/accounts';
import {dbGet,decrypt} from '../../utils.js';
import styles from '../styles.js';
import {strings} from "../../locales/i18n";

class Login extends Component {
	constructor(props){
		super(props);
		this.state = { 
			password: '',
		}
	}
	async componentDidMount(){
		console.log('[route] ' + this.props.navigation.state.routeName); 
		console.log('[store.user] ' + JSON.stringify(this.props.user));
	}
	render(){
		const {dispatch} = this.props;
		return ( 
			<View style={styles.container}>
				<View style={{
					padding: 40,
					justifyContent: 'center',
    				alignItems: 'center',
				}}>
					<ComponentLogo />
				</View>
				<View style={styles.marginBottom10}>
					<ComponentPassword
						value={this.state.value_password}
						onChange={e=>{
							this.setState({
								password: e
							});
						}}
					/>
				</View>
				<View style={styles.marginBottom20}>
				    <Button
						title="Login"
						onPress={e=>{
							let _setting = this.props.setting;
							dbGet('user')
							.then(json=>{
								console.log('here ');
								let db_user = JSON.parse(json);
								if(db_user.hashed_password === hashPassword(this.state.password)){
									dispatch(user(db_user.hashed_password, db_user.mnemonic));
									dbGet('accounts').then(json=>{
										let accounts = JSON.parse(decrypt(json, db.user.hashed_password))
										this.props.dispatch(accounts(accounts));
									},err=>{});
									dbGet('settings').then(json => {
										let settings = JSON.parse(json);
										_setting.endpoint_wallet = settings.endpoint_wallet;
										_setting.endpoint_dapps = settings.endpoint_dapps;
										_setting.endpoint_odex = settings.endpoint_odex;
										this.props.dispatch(setting(_setting));
									}, err=> {});
									this.props.navigation.navigate('signed_vault');
								} else {
									Alert.alert(strings('alert_title_error'), strings('login.error_incorrect_password'));
								}
							},err=>{
								console.log("login failed: " + err);
								Alert.alert(strings('alert_title_error'), strings('login.error_login'));
							});
						}}
					/>
				</View>
				<View style={{
					flex: 1,
					flexDirection: 'row',
        			justifyContent: 'space-between',
					height: 40,
				}}>
					<TouchableOpacity
						onPress={e=>{ 
							this.props.navigation.navigate('unsigned_register')
						}}
					>
						<Text>Register</Text>
					</TouchableOpacity>
					<TouchableOpacity
						onPress={e=>{
							this.props.navigation.navigate('unsigned_recovery')
						}}
					>
						<Text>Recovery</Text>
					</TouchableOpacity>
				</View>
			</View>
		);
	}
}

export default connect(state => { 
	return { 
		user: state.user,
		setting: state.setting,
	}; 
})(Login);

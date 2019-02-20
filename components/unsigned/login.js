import React, {Component} from 'react';
import {connect} from 'react-redux';
import {View,Text,Button,TouchableOpacity, Alert} from 'react-native';
import {ComponentLogo,ComponentPassword} from '../common.js';
import {hashPassword} from '../../utils.js';
import {user} from '../../actions/user.js';
import {setting} from '../../actions/setting';
import {accounts as accounts_action} from '../../actions/accounts';
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
						title={strings('unsigned_login.btn_login')}
						onPress={e=>{
							dbGet('user')
							.then(json=>{
								let db_user = JSON.parse(json);
								if(db_user.hashed_password === hashPassword(this.state.password)){
									dispatch(user(db_user.hashed_password, db_user.mnemonic));
									dbGet('accounts').then(json=>{
										let accounts = JSON.parse(decrypt(json, db_user.hashed_password))
										this.props.dispatch(accounts_action(accounts));
									},err=>{});
									this.props.navigation.navigate('signed_vault');
								} else {
									Alert.alert(strings('alert_title_error'), strings('unsigned_login.error_incorrect_password'));
								}
							},err=>{
								Alert.alert(strings('alert_title_error'), strings('unsigned_login.error_login'));
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
						<Text>{strings('unsigned_login.btn_register')}</Text>
					</TouchableOpacity>
					<TouchableOpacity
						onPress={e=>{
							this.props.navigation.navigate('unsigned_recovery')
						}}
					>
						<Text>{strings('unsigned_login.btn_recovery')}</Text>
					</TouchableOpacity>
				</View>
			</View>
		);
	}
}

export default connect(state => { 
	return { 
		user: state.user,
	};
})(Login);
